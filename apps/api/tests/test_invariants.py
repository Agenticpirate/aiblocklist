from __future__ import annotations

from datetime import datetime, timezone

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.audit import verify_audit_chain
from app.core.database import Base, get_db
from app.core.errors import ProblemDetailError
from app.core.models import Account, AuditLog, EvidenceItem, PolicyVersion
from app.core.privacy import (
    canonicalize_account_url,
    canonicalize_evidence_url,
    canonicalize_x_evidence_url,
    redact_pii,
)
from app.core.rate_limit import rate_limiter
from app.core.state_machine import validate_classification_transition
from app.main import app
from app.modules.appeals.router import assign_independent_appeal_reviewer
from app.modules.federation.ingest_external import ensure_policy_and_sources, ingest_blockedforaireply_seed
from app.modules.moderation.service import record_human_moderation_decision
from app.modules.verification.signals import ReplySample, evaluate_behavioral_signals


@pytest_asyncio.fixture
async def test_session():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", future=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    Session = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

    async def override_get_db():
        async with Session() as s:
            yield s

    app.dependency_overrides[get_db] = override_get_db
    rate_limiter.reset()

    async with Session() as session:
        await ensure_policy_and_sources(session)
        await session.commit()
        yield session

    app.dependency_overrides.clear()
    await engine.dispose()


@pytest.mark.asyncio
async def test_ssrf_url_allowlist_and_pii_redaction():
    # Reject private/non-X URLs
    with pytest.raises(ProblemDetailError) as exc:
        canonicalize_x_evidence_url("http://169.254.169.254/latest/meta-data/")
    assert exc.value.code == "INVALID_EVIDENCE_URL"

    with pytest.raises(ProblemDetailError):
        canonicalize_x_evidence_url("https://evil.com/status/123456789")

    post_id, canon = canonicalize_x_evidence_url("https://x.com/botuser/status/1991000001?s=20")
    assert post_id == "1991000001"
    assert canon == "https://x.com/i/status/1991000001"

    scrubbed = redact_pii("Contact john@example.com or 555-234-5678 immediately.")
    assert "[REDACTED_EMAIL]" in scrubbed
    assert "[REDACTED_PHONE]" in scrubbed


@pytest.mark.asyncio
async def test_behavioral_signal_engine_timing_never_triggers_alone():
    now = datetime.now(timezone.utc)
    # 15 diverse authentic human replies with fast <10s latency should NOT trigger escalation
    human_texts = [
        "Congrats on shipping the PostgreSQL migration smoothly yesterday",
        "Did you benchmark pg_trgm against Meilisearch on 200k handles",
        "Totally agree about keeping the browser extension local first",
        "Here is the Stanford paper link showing non native English bias",
        "We fixed that Docker Compose volume permission bug on macOS",
        "Appreciate the thoughtful breakdown of EU GDPR Article 6",
        "I ran into the same asyncpg timeout when pooling connections",
        "Would love to test the Firefox Manifest V3 build next week",
        "Thanks for clarifying how the 180 day review expiry works",
        "Nice catch on serializing the SHA256 hash chain with advisory locks",
        "Let us compare latency before adding another search service",
        "That explain analyze output shows the partial index kicked in",
        "Good point about excluding raw post text from backups",
        "See you at the open source governance call on Thursday",
        "Happy to review the TypeScript SDK pull request tonight",
    ]
    samples = [
        ReplySample(
            post_id=str(i),
            target_author=f"author_{i}",
            text=human_texts[i],
            created_at=now,
            reply_latency_sec=8.0,
            is_mutual=True,
            has_followup_turn=True,
        )
        for i in range(15)
    ]
    res = evaluate_behavioral_signals(samples)
    sig05 = next(s for s in res["signals"] if s["signal_code"] == "SIG-05")
    assert sig05["triggered"] is True
    assert sig05["corroborative_only"] is True
    assert res["escalate_for_human_review"] is False

    # Near-duplicate unsolicited spam across >=3 unrelated authors triggers SIG-01
    spam_samples = [
        ReplySample(
            post_id=f"spam_{i}",
            target_author=f"victim_{i}",
            text="Great post! Check out my profile for free crypto growth tips today!",
            created_at=now,
            reply_latency_sec=5.0,
            is_mutual=False,
            has_followup_turn=False,
        )
        for i in range(4)
    ]
    spam_res = evaluate_behavioral_signals(spam_samples)
    sig01 = next(s for s in spam_res["signals"] if s["signal_code"] == "SIG-01")
    assert sig01["triggered"] is True
    assert spam_res["escalate_for_human_review"] is True


@pytest.mark.asyncio
async def test_publication_gate_evidence_and_dual_reviewer_and_independent_appeal(test_session: AsyncSession):
    # Create a high-impact account with only 1 evidence item
    acc = Account(
        platform="x",
        platform_account_id="999888777",
        identity_confidence="immutable_id",
        username="BigCreatorBot",
        normalized_username="bigcreatorbot",
        public_profile_url="https://x.com/BigCreatorBot",
        classification="under_review",
        verification_status="unverified",
        is_high_impact=True,
    )
    test_session.add(acc)
    await test_session.flush()

    test_session.add(
        EvidenceItem(
            account_id=acc.id,
            platform_post_id="100001",
            public_post_url="https://x.com/i/status/100001",
            signal_type="near_duplicate_reply",
            signal_metrics={"cosine_sim": 0.94},
            content_hash_sha256="a" * 64,
        )
    )
    await test_session.commit()

    # Must FAIL with < 2 active evidence URLs
    with pytest.raises(ProblemDetailError) as exc_ev:
        await record_human_moderation_decision(
            test_session,
            account_id=acc.id,
            reviewer_id="mod_alice",
            second_reviewer_id="mod_bob",
            new_classification="confirmed_automated_spam",
            public_rationale="Verified spam",
            internal_notes="Internal",
        )
    assert exc_ev.value.code == "PUBLICATION_GATE_FAILED"

    # Add 2nd evidence item
    test_session.add(
        EvidenceItem(
            account_id=acc.id,
            platform_post_id="100002",
            public_post_url="https://x.com/i/status/100002",
            signal_type="near_duplicate_reply",
            signal_metrics={"cosine_sim": 0.95},
            content_hash_sha256="b" * 64,
        )
    )
    await test_session.commit()

    # Must FAIL for high-impact account without 2nd distinct reviewer
    with pytest.raises(ProblemDetailError) as exc_dual:
        await record_human_moderation_decision(
            test_session,
            account_id=acc.id,
            reviewer_id="mod_alice",
            second_reviewer_id=None,
            new_classification="confirmed_automated_spam",
            public_rationale="Verified spam",
            internal_notes="Internal",
        )
    assert exc_dual.value.code == "PUBLICATION_GATE_FAILED"

    # Succeeds with 2 distinct reviewers + 2 evidence items
    decision = await record_human_moderation_decision(
        test_session,
        account_id=acc.id,
        reviewer_id="mod_alice",
        second_reviewer_id="mod_bob",
        new_classification="confirmed_automated_spam",
        public_rationale="Verified repeated unsolicited reply loops across unrelated threads.",
        internal_notes="Dual reviewed",
    )
    assert decision.second_reviewer_id == "mod_bob"

    # Verify illegal state transition is rejected
    with pytest.raises(ProblemDetailError):
        validate_classification_transition("cleared", "confirmed_automated_spam")

    # Test appeal ownership verification & independent reviewer enforcement
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        init_res = await client.post(
            "/api/v1/appeals/verify/init",
            json={"platform": "x", "username": "BigCreatorBot", "method": "bio_token"},
        )
        assert init_res.status_code == 201
        challenge = init_res.json()

        confirm_res = await client.post(
            "/api/v1/appeals/verify/confirm",
            json={"challenge_id": challenge["challenge_id"], "verification_token": challenge["verification_token"]},
        )
        assert confirm_res.status_code == 200
        app_session = confirm_res.json()["appellant_session_token"]

        appeal_res = await client.post(
            "/api/v1/appeals",
            headers={"X-Appellant-Session": app_session},
            json={
                "platform": "x",
                "username": "BigCreatorBot",
                "statement": "These replies were human authored responses from our community support desk.",
                "supporting_urls": ["https://x.com/BigCreatorBot/status/100001"],
            },
        )
        assert appeal_res.status_code == 202
        appeal_id = appeal_res.json()["appeal_id"]

        # Duplicate appeal within 14d cooldown must fail
        dup_appeal = await client.post(
            "/api/v1/appeals",
            headers={"X-Appellant-Session": app_session},
            json={
                "platform": "x",
                "username": "BigCreatorBot",
                "statement": "Second attempt within cooldown period should be rejected cleanly.",
                "supporting_urls": [],
            },
        )
        assert dup_appeal.status_code == 409

    # Original reviewer OR cosigner must be BLOCKED from reviewing appeal
    with pytest.raises(ProblemDetailError) as exc_ind1:
        await assign_independent_appeal_reviewer(test_session, appeal_id=appeal_id, reviewer_id="mod_alice")
    assert exc_ind1.value.code == "FORBIDDEN"

    with pytest.raises(ProblemDetailError) as exc_ind2:
        await assign_independent_appeal_reviewer(test_session, appeal_id=appeal_id, reviewer_id="mod_bob")
    assert exc_ind2.value.code == "FORBIDDEN"

    # Independent third reviewer succeeds
    assigned = await assign_independent_appeal_reviewer(test_session, appeal_id=appeal_id, reviewer_id="mod_carol")
    assert assigned.assigned_reviewer_id == "mod_carol"

    # Audit hash chain must verify cleanly
    is_valid, count, root = await verify_audit_chain(test_session)
    assert is_valid is True
    assert count >= 3
    assert len(root) == 64


@pytest.mark.asyncio
async def test_report_dedup_brigading_and_zero_auto_classification(test_session: AsyncSession):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # First report accepted
        r1 = await client.post(
            "/api/v1/reports",
            json={
                "platform": "x",
                "account_url": "https://x.com/target_creator",
                "evidence_urls": ["https://x.com/target_creator/status/55500001"],
                "reason_code": "repetitive_engagement_farming",
                "explanation": "Repeated template replies.",
            },
        )
        assert r1.status_code == 202

        # Identical evidence within 24h rejected as duplicate
        r_dup = await client.post(
            "/api/v1/reports",
            json={
                "platform": "x",
                "account_url": "https://x.com/target_creator",
                "evidence_urls": ["https://x.com/target_creator/status/55500001"],
                "reason_code": "repetitive_engagement_farming",
            },
        )
        assert r_dup.status_code == 409

        # Submit 5 more distinct reports to trip >5/15m brigading circuit breaker
        for i in range(2, 7):
            ri = await client.post(
                "/api/v1/reports",
                json={
                    "platform": "x",
                    "account_url": "https://x.com/target_creator",
                    "evidence_urls": [f"https://x.com/target_creator/status/5550000{i}"],
                    "reason_code": "repetitive_engagement_farming",
                },
            )
            assert ri.status_code == 202

        # Account MUST still be under_review / unverified (ZERO auto-classification!)
        acct_res = await client.get("/api/v1/accounts/x/target_creator")
        assert acct_res.status_code == 200
        body = acct_res.json()
        assert body["account"]["classification"] == "under_review"
        assert body["account"]["verification_status"] == "unverified"
        assert "reporter_id" not in str(body)
        assert "ip_subnet_hash" not in str(body)


@pytest.mark.asyncio
async def test_external_blockedforaireply_stays_unverified_external(test_session: AsyncSession, tmp_path):
    sample_seed = tmp_path / "ext.json"
    sample_seed.write_text(
        """{
          "generated_at": "2026-11-23",
          "accounts": [
            {
              "id": "2122149957973278720",
              "username": "Cocothe_gb",
              "sources": ["levelsio", "ryanvogel"],
              "levelsio": "likely",
              "ryanvogel": {"ai_flags": 2, "sampled": 6},
              "evidence": [
                {
                  "date": "2026-11-23",
                  "their_reply": "PUBLIC REPLY TEXT SHOWN AS EVIDENCE",
                  "their_reply_status": "ok",
                  "their_post": "https://x.com/i/status/2124685496534405589"
                }
              ]
            }
          ]
        }""",
        encoding="utf-8",
    )
    res = await ingest_blockedforaireply_seed(test_session, seed_path=sample_seed)
    assert res["ingested_accounts"] == 1

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.get("/api/v1/accounts/id/x/2122149957973278720")
        assert r.status_code == 200
        data = r.json()
        assert data["account"]["verification_status"] == "unverified_external"
        assert data["account"]["classification"] == "under_review"
        assert data["account"]["has_source_conflict"] is True
        assert len(data["source_assertions"]) == 2
        # Public reply text is kept so the site can display the tweet: on the evidence item and as the card quote only.
        assert data["evidence"][0]["metrics"]["post_text"] == "PUBLIC REPLY TEXT SHOWN AS EVIDENCE"
        assert data["account"]["primary_quote"] == "PUBLIC REPLY TEXT SHOWN AS EVIDENCE"  # feed card quote
        other_fields = {k: v for k, v in data["account"].items() if k != "primary_quote"}
        assert "PUBLIC REPLY TEXT" not in str(other_fields)
        assert "PUBLIC REPLY TEXT" not in str(data["source_assertions"])


@pytest.mark.asyncio
async def test_sync_reads_new_status_field_and_tracks_upgrades(test_session: AsyncSession):
    from sqlalchemy import select

    from app.core.models import ExternalListEntry
    from app.modules.federation.sync_service import sync_blockedforaireply

    def payload(status: str) -> dict:
        return {
            "generated_at": "2026-11-25",
            "accounts": [
                {
                    "id": "2116599441234780160",
                    "username": "NewFormatUser",
                    "status": status,
                    "blocked_at": "2026-11-25",
                    "evidence": [
                        {
                            "date": "2026-11-24",
                            "their_reply": "raw text",
                            "their_reply_status": "ok",
                            "their_post": "https://x.com/i/status/2125269949581230528",
                        }
                    ],
                }
            ],
        }

    res = await sync_blockedforaireply(test_session, payload=payload("unreviewed"), removed_ids=set(), force=True)
    assert res["new_accounts_added"] == 1
    entry = (await test_session.execute(select(ExternalListEntry))).scalars().one()
    assert entry.source_classification == "external_silent_block"

    res = await sync_blockedforaireply(test_session, payload=payload("confirmed"), removed_ids=set(), force=True)
    assert res["new_accounts_added"] == 0
    await test_session.refresh(entry)
    assert entry.source_classification == "external_confirmed_ai_reply"


@pytest.mark.asyncio
async def test_threads_platform_canonicalization_and_reporting(test_session: AsyncSession):
    # Verify Threads canonical profile and evidence URLs
    handle, canon_profile = canonicalize_account_url("threads", "https://www.threads.net/@growth_bot")
    assert handle == "growth_bot"
    assert canon_profile == "https://threads.net/@growth_bot"

    post_id, canon_post = canonicalize_evidence_url("threads", "https://threads.net/@growth_bot/post/DD9871xYzAb?s=12")
    assert post_id == "DD9871xYzAb"
    assert canon_post == "https://threads.net/@growth_bot/post/DD9871xYzAb"

    # Reject non-Threads domains for Threads platform
    with pytest.raises(ProblemDetailError) as exc:
        canonicalize_account_url("threads", "https://malicious.org/@growth_bot")
    assert exc.value.code == "INVALID_ACCOUNT_IDENTIFIER"

    # Submit a Threads community report
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r = await client.post(
            "/api/v1/reports",
            json={
                "platform": "threads",
                "account_url": "https://threads.net/@growth_bot",
                "evidence_urls": [
                    "https://threads.net/@growth_bot/post/DD9871xYzAb",
                    "https://threads.net/@growth_bot/post/DD9872pQrSt",
                ],
                "reason_code": "confirmed_automated_spam",
                "explanation": "Observed rapid copy paste promo loops across tech creators.",
            },
        )
        assert r.status_code == 202
        data = r.json()
        assert data["status"] == "queued"
        assert "report_id" in data

        # Check account was indexed under review for threads
        acct_res = await client.get("/api/v1/accounts/threads/growth_bot")
        assert acct_res.status_code == 200
        acct_data = acct_res.json()
        assert acct_data["account"]["platform"] == "threads"
        assert acct_data["account"]["username"] == "growth_bot"
        assert acct_data["account"]["classification"] == "under_review"
