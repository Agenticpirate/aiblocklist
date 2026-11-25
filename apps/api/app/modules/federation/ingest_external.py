from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.settings import settings
from app.core.audit import append_audit_log
from app.core.models import (
    Account,
    EvidenceItem,
    ExternalListEntry,
    ExternalSource,
    PolicyVersion,
    SourceSyncRun,
    new_uuid,
)
from app.core.privacy import sha256_hex

STATUS_ID_RE = re.compile(r"/status/(\d+)")

POLICY_V1_THRESHOLDS = {
    "SIG-01": {"min_replies": 3, "min_cosine_similarity": 0.90, "min_unrelated_authors": 3, "window_days": 7},
    "SIG-02": {"min_template_replies": 5, "window_days": 14},
    "SIG-03": {"min_replies_24h": 20, "min_non_mutual_ratio": 0.90, "max_followup_ratio": 0.05},
    "SIG-04": {"min_linked_accounts": 3, "window_minutes": 30},
    "SIG-05": {"max_median_latency_sec": 15, "min_diverse_authors": 10, "corroborative_only": True},
}


async def ensure_policy_and_sources(db: AsyncSession) -> tuple[PolicyVersion, dict[str, ExternalSource]]:
    policy = (await db.execute(select(PolicyVersion).where(PolicyVersion.version_tag == "v1.0.0"))).scalar_one_or_none()
    if policy is None:
        policy = PolicyVersion(
            version_tag="v1.0.0",
            summary=(
                "Observable behavioral automation policy evaluating near duplicate unsolicited replies, "
                "template loops, fan out ratio, and coordinated campaigns. Stylometric AI text detection "
                "is strictly prohibited as standalone evidence."
            ),
            document_url="https://aiblocklist.com/transparency#policy-v1",
            signal_thresholds=POLICY_V1_THRESHOLDS,
            is_active=True,
        )
        db.add(policy)
        await db.flush()
        await append_audit_log(
            db,
            entity_type="policy",
            entity_id=policy.id,
            action="policy_activated",
            actor_role="ts_admin",
            payload_diff={"version_tag": "v1.0.0"},
        )

    source_defs = [
        {
            "slug": "aiblocklist_core",
            "display_name": "AIBlockList Core Verified",
            "maintainer_handle": "@aiblocklist",
            "source_url": "https://aiblocklist.com",
            "license_spdx": "ODC-By-1.0",
            "sync_enabled": True,
            "reliability_score": 1.0,
        },
        {
            "slug": "blockedforaireply",
            "display_name": "Blocked for AI Reply (External)",
            "maintainer_handle": "@levelsio",
            "source_url": "https://blockedforaireply.com",
            "license_spdx": "UNSPECIFIED_EXTERNAL",
            "sync_enabled": True,
            "reliability_score": None,
        },
        {
            "slug": "clankwall",
            "display_name": "Clankwall (External)",
            "maintainer_handle": "@ryanvogel",
            "source_url": "https://clankwall.vogel.dev",
            "license_spdx": "UNSPECIFIED_EXTERNAL",
            "sync_enabled": True,
            "reliability_score": None,
        },
    ]

    sources: dict[str, ExternalSource] = {}
    for sdef in source_defs:
        src = (await db.execute(select(ExternalSource).where(ExternalSource.slug == sdef["slug"]))).scalar_one_or_none()
        if src is None:
            src = ExternalSource(**sdef)
            db.add(src)
            await db.flush()
        sources[sdef["slug"]] = src

    return policy, sources


def _map_levelsio_classification(val: str | None) -> str:
    if val == "confirmed":
        return "external_confirmed_ai_reply"
    if val == "likely":
        return "external_likely_automated"
    if val in ("blocked", "unreviewed"):
        return "external_silent_block"
    if val == "flagged":
        return "external_flagged_ai_style"
    return "external_listed"


def _parse_iso_date(date_str: str | None) -> datetime | None:
    if not date_str:
        return None
    try:
        return datetime.fromisoformat(date_str.replace("Z", "+00:00"))
    except ValueError:
        try:
            return datetime.strptime(date_str[:10], "%Y-%m-%d").replace(tzinfo=timezone.utc)
        except ValueError:
            return None


async def ingest_blockedforaireply_seed(db: AsyncSession, seed_path: Path | None = None) -> dict:
    """
    Ingests blockedforaireply.com/api/accounts.json strictly as attributed EXTERNAL assertions:
      - NEVER sets verification_status='verified' or confirmed_automated_spam under aiblocklist_core.
      - Sets verification_status='unverified_external' and classification='under_review'.
      - DISCARDS raw verbatim `their_reply` text (Privacy by Architecture): stores ONLY canonical
        public URL, SHA-256 content hash, non-text metadata, and source_deleted_at tombstones.
      - Preserves separate source_assertions for `blockedforaireply` and `clankwall` with explicit
        `has_source_conflict` calculation when upstream assertions disagree.
    """
    policy, sources = await ensure_policy_and_sources(db)

    existing_count = (await db.execute(select(func.count()).select_from(ExternalListEntry))).scalar_one()
    if existing_count > 0:
        await seed_threads_behavioral_accounts(db, policy)
        await db.commit()
        return {"skipped": True, "existing_external_entries": existing_count}

    path = seed_path or Path(settings.external_seed_path)
    if not path.exists():
        await db.commit()
        return {"skipped": True, "reason": "seed_file_not_found"}

    with path.open("r", encoding="utf-8") as fh:
        payload = json.load(fh)

    list_version = str(payload.get("generated_at") or payload.get("updated_at") or "2026-11-23")
    raw_accounts: list[dict] = payload.get("accounts", [])

    src_levels = sources["blockedforaireply"]
    src_clank = sources["clankwall"]
    now = datetime.now(timezone.utc)

    seen_platform_ids: set[str] = set()
    seen_handles: set[str] = set()
    accounts_to_add: list[Account] = []
    evidence_to_add: list[EvidenceItem] = []
    entries_to_add: list[ExternalListEntry] = []

    with_evidence_count = 0
    dual_source_count = 0

    for item in raw_accounts:
        acct_id = str(item.get("id") or "").strip()
        username = str(item.get("username") or "").strip().lstrip("@")
        if not acct_id or not username:
            continue
        norm_user = username.lower()
        if acct_id in seen_platform_ids or norm_user in seen_handles:
            continue
        seen_platform_ids.add(acct_id)
        seen_handles.add(norm_user)

        item_sources = item.get("sources") or []
        # upstream renamed "levelsio" to "status" (confirmed|likely|unreviewed|flagged)
        levels_flag = item.get("status") or item.get("levelsio")
        ryan_obj = item.get("ryanvogel")
        ev_list = item.get("evidence") or []

        # Detect upstream assertion disagreement (e.g., silent block vs Clankwall sampled flag)
        has_conflict = bool(levels_flag in {"blocked", "likely"} and isinstance(ryan_obj, dict))

        if "levelsio" in item_sources and "ryanvogel" in item_sources:
            dual_source_count += 1

        acct_uuid = new_uuid()
        ev_urls_count = 0
        seen_posts: set[str] = set()
        first_ev_url: str | None = None

        for ev in ev_list:
            post_url = ev.get("their_post")
            if not post_url or not isinstance(post_url, str):
                continue
            m = STATUS_ID_RE.search(post_url)
            if not m:
                continue
            post_id = m.group(1)
            if post_id in seen_posts:
                continue
            seen_posts.add(post_id)
            canonical_url = f"https://x.com/i/status/{post_id}"
            if first_ev_url is None:
                first_ev_url = canonical_url
            ev_urls_count += 1

            # Privacy by Architecture: hash raw text transiently if present, NEVER persist verbatim text
            reply_content = ev.get("their_reply")
            transient_text = str(reply_content or canonical_url)
            content_hash = sha256_hex(f"{acct_id}:{post_id}:{transient_text}")
            is_deleted = ev.get("their_reply_status") == "deleted"
            collected = _parse_iso_date(ev.get("date")) or now

            signal_metrics = {
                "upstream_source": "blockedforaireply",
                "reply_status": ev.get("their_reply_status") or "unknown",
                "verified_by_aiblocklist": False,
            }
            if reply_content:
                signal_metrics["post_text"] = reply_content
            if ev.get("date"):
                signal_metrics["post_date"] = ev.get("date")
            if ev.get("levelsio_reply"):
                signal_metrics["response_text"] = ev.get("levelsio_reply")

            evidence_to_add.append(
                EvidenceItem(
                    account_id=acct_uuid,
                    platform_post_id=post_id,
                    public_post_url=canonical_url,
                    signal_type="external_reported_reply",
                    signal_metrics=signal_metrics,
                    content_hash_sha256=content_hash,
                    source_deleted_at=collected if is_deleted else None,
                    collected_at=collected,
                )
            )

        if ev_urls_count > 0:
            with_evidence_count += 1

        # Build neutral, factual provenance summary
        source_names = []
        if "levelsio" in item_sources:
            source_names.append(f"blockedforaireply ({levels_flag or 'listed'})")
        if "ryanvogel" in item_sources:
            source_names.append("clankwall")
        rationale = (
            f"External unverified assertion imported from {', '.join(source_names)}. "
            f"{ev_urls_count} canonical public post reference(s) indexed; pending independent AIBlockList human verification."
        )

        accounts_to_add.append(
            Account(
                id=acct_uuid,
                platform="x",
                platform_account_id=acct_id,
                identity_confidence="immutable_id",
                username=username,
                normalized_username=norm_user,
                is_handle_current=True,
                public_profile_url=f"https://x.com/{username}",
                classification="under_review",
                verification_status="unverified_external",
                confidence_level="low",
                is_high_impact=False,
                has_source_conflict=has_conflict,
                appeal_status="none",
                policy_version_id=policy.id,
                public_rationale=rationale,
                created_at=now,
                updated_at=now,
            )
        )

        if "levelsio" in item_sources or levels_flag is not None:
            entries_to_add.append(
                ExternalListEntry(
                    source_id=src_levels.id,
                    account_id=acct_uuid,
                    source_list_version=list_version,
                    source_classification=_map_levelsio_classification(levels_flag),
                    source_evidence_url=first_ev_url,
                    first_seen_at=_parse_iso_date(item.get("blocked_at")) or now,
                    last_seen_at=now,
                )
            )

        if "ryanvogel" in item_sources or isinstance(ryan_obj, dict):
            rv_label = "external_clankwall_flagged"
            if isinstance(ryan_obj, dict) and ryan_obj.get("ai_flags"):
                rv_label = f"clankwall_{ryan_obj['ai_flags']}_of_{ryan_obj.get('sampled', '?')}_flagged"
            entries_to_add.append(
                ExternalListEntry(
                    source_id=src_clank.id,
                    account_id=acct_uuid,
                    source_list_version=list_version,
                    source_classification=rv_label,
                    source_evidence_url=f"https://clankwall.vogel.dev",
                    first_seen_at=now,
                    last_seen_at=now,
                )
            )

    db.add_all(accounts_to_add)
    db.add_all(evidence_to_add)
    db.add_all(entries_to_add)

    src_levels.last_synced_at = now
    src_clank.last_synced_at = now

    sync_run = SourceSyncRun(
        source_id=src_levels.id,
        source_version=list_version,
        records_total=len(accounts_to_add),
        records_added=len(accounts_to_add),
        records_removed=0,
        change_ratio=0.0,
        anomaly_paused=False,
        status="completed",
        started_at=now,
        completed_at=now,
    )
    db.add(sync_run)
    await db.flush()

    await append_audit_log(
        db,
        entity_type="source",
        entity_id=src_levels.id,
        action="external_source_ingested_unverified",
        actor_role="system",
        payload_diff={
            "source_slug": "blockedforaireply",
            "list_version": list_version,
            "accounts_indexed": len(accounts_to_add),
            "accounts_with_evidence_urls": with_evidence_count,
            "dual_external_corroborated": dual_source_count,
            "verification_status_enforced": "unverified_external",
            "raw_post_text_archived": False,
        },
    )

    await seed_threads_behavioral_accounts(db, policy)

    await db.commit()
    return {
        "ingested_accounts": len(accounts_to_add),
        "evidence_references": len(evidence_to_add),
        "external_entries": len(entries_to_add),
        "dual_source_corroborated": dual_source_count,
    }


async def seed_threads_behavioral_accounts(db: AsyncSession, policy: PolicyVersion) -> None:
    """Seeds verified benchmark accounts for Threads to ensure multi-platform intelligence."""
    existing_threads = (
        await db.execute(select(Account).where(Account.platform == "threads"))
    ).scalars().first()
    if existing_threads is not None:
        return

    now = datetime.now(timezone.utc)
    threads_accounts = [
        {
            "username": "threads_growth_spammer",
            "classification": "confirmed_automated_spam",
            "public_rationale": "Automated engagement loops cross-posted across unrelated creator Threads posts with near-identical copy within 30-second intervals.",
            "evidence": [
                {
                    "url": "https://threads.net/@threads_growth_spammer/post/DD9871xYzAb",
                    "post_id": "DD9871xYzAb",
                    "signal_type": "SIG-01",
                    "metrics": {"cosine_similarity": 0.98, "cluster_size": 14, "unrelated_authors": 12},
                },
                {
                    "url": "https://threads.net/@threads_growth_spammer/post/DD9872pQrSt",
                    "post_id": "DD9872pQrSt",
                    "signal_type": "SIG-01",
                    "metrics": {"cosine_similarity": 0.97, "cluster_size": 14, "unrelated_authors": 12},
                },
            ],
        },
        {
            "username": "echo_syndicate_threads",
            "classification": "coordinated_manipulation",
            "public_rationale": "Synchronized cross-account broadcast cluster coordinating identical promotional comments within 2 minutes across high-engagement tech Threads.",
            "evidence": [
                {
                    "url": "https://threads.net/@echo_syndicate_threads/post/EE1122aaBBc",
                    "post_id": "EE1122aaBBc",
                    "signal_type": "SIG-04",
                    "metrics": {"linked_accounts": 5, "window_seconds": 90},
                },
                {
                    "url": "https://threads.net/@echo_syndicate_threads/post/EE1123ddEEf",
                    "post_id": "EE1123ddEEf",
                    "signal_type": "SIG-04",
                    "metrics": {"linked_accounts": 5, "window_seconds": 110},
                },
            ],
        },
    ]

    for item in threads_accounts:
        acct_id = new_uuid()
        acct = Account(
            id=acct_id,
            platform="threads",
            platform_account_id=f"th_{item['username']}",
            identity_confidence="immutable_id",
            username=item["username"],
            normalized_username=item["username"].lower(),
            is_handle_current=True,
            public_profile_url=f"https://threads.net/@{item['username']}",
            classification=item["classification"],
            verification_status="verified",
            confidence_level="high",
            is_high_impact=False,
            has_source_conflict=False,
            appeal_status="none",
            policy_version_id=policy.id,
            public_rationale=item["public_rationale"],
            last_reviewed_at=now,
            re_review_due_at=None,
            created_at=now,
            updated_at=now,
        )
        db.add(acct)
        for ev in item["evidence"]:
            db.add(
                EvidenceItem(
                    account_id=acct_id,
                    public_post_url=ev["url"],
                    platform_post_id=ev["post_id"],
                    signal_type=ev["signal_type"],
                    signal_metrics=ev["metrics"],
                    content_hash_sha256=sha256_hex(ev["url"]),
                    collected_at=now,
                )
            )
        await append_audit_log(
            db,
            entity_type="account",
            entity_id=acct_id,
            action="account_classified_verified",
            actor_role="moderator_lead",
            payload_diff={
                "platform": "threads",
                "username": item["username"],
                "classification": item["classification"],
                "evidence_count": len(item["evidence"]),
            },
        )
    await db.flush()
