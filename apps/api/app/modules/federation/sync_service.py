from __future__ import annotations

import asyncio
import logging
import re
from datetime import datetime, timezone
from typing import Any

import httpx
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.settings import settings
from app.core.audit import append_audit_log
from app.core.database import AsyncSessionLocal
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
from app.modules.federation.ingest_external import ensure_policy_and_sources

logger = logging.getLogger("aiblocklist.federation")
STATUS_ID_RE = re.compile(r"/status/(\d+)")


def _map_levelsio_classification(val: str | None) -> str:
    if val == "confirmed":
        return "external_confirmed_ai_reply"
    if val == "likely":
        return "external_likely_automated"
    if val == "blocked":
        return "external_silent_block"
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


async def fetch_blockedforaireply_live_payload() -> tuple[dict[str, Any] | None, set[str]]:
    """
    Fetches the live accounts.json and removed-ids.txt from blockedforaireply.com.
    Returns (payload_dict, set_of_removed_ids).
    """
    headers = {
        "User-Agent": f"AIBlockList-Federation-Sync/{settings.app_version} (+https://aiblocklist.com/transparency)",
        "Accept": "application/json, text/plain, */*",
    }
    payload: dict[str, Any] | None = None
    removed_ids: set[str] = set()

    async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
        try:
            resp = await client.get(settings.blockedforaireply_accounts_url, headers=headers)
            if resp.status_code == 200:
                payload = resp.json()
            else:
                logger.warning(
                    "Failed to fetch accounts.json from upstream, status=%d", resp.status_code
                )
        except Exception as exc:
            logger.error("Exception fetching accounts.json from upstream: %s", exc)

        try:
            resp_rem = await client.get(settings.blockedforaireply_removed_url, headers=headers)
            if resp_rem.status_code == 200:
                text = resp_rem.text
                for line in text.strip().splitlines():
                    cleaned = line.strip()
                    if cleaned:
                        removed_ids.add(cleaned)
            else:
                logger.warning(
                    "Failed to fetch removed-ids.txt from upstream, status=%d", resp_rem.status_code
                )
        except Exception as exc:
            logger.error("Exception fetching removed-ids.txt from upstream: %s", exc)

    return payload, removed_ids


async def sync_blockedforaireply(
    db: AsyncSession,
    payload: dict[str, Any] | None = None,
    removed_ids: set[str] | None = None,
    force: bool = False,
) -> dict[str, Any]:
    """
    Synchronizes external intelligence from blockedforaireply.com into AIBlockList:
      1. Fetches live upstream data (or uses provided payload).
      2. Ingests newly discovered accounts into `accounts` as unverified_external.
      3. Ingests new evidence items for existing accounts, hashing text (Privacy by Architecture).
      4. Detects upstream removals from `removed-ids.txt` and marks tombstones / notes.
      5. Records an immutable SourceSyncRun and AuditLog entry.
    """
    policy, sources = await ensure_policy_and_sources(db)
    src_levels = sources["blockedforaireply"]

    if not src_levels.sync_enabled and not force:
        return {"status": "sync_disabled", "source": src_levels.slug}

    now = datetime.now(timezone.utc)

    # 1. Fetch live payload if not explicitly passed
    if payload is None or removed_ids is None:
        fetched_payload, fetched_removed = await fetch_blockedforaireply_live_payload()
        if payload is None:
            payload = fetched_payload
        if removed_ids is None:
            removed_ids = fetched_removed

    if not payload:
        sync_run = SourceSyncRun(
            source_id=src_levels.id,
            source_version="fetch_failed",
            records_total=0,
            records_added=0,
            records_removed=0,
            change_ratio=0.0,
            anomaly_paused=False,
            status="failed",
            started_at=now,
            completed_at=now,
        )
        db.add(sync_run)
        await db.commit()
        return {"status": "error", "message": "Failed to retrieve upstream live data"}

    list_version = str(payload.get("generated_at") or payload.get("updated_at") or now.strftime("%Y-%m-%d"))
    raw_accounts: list[dict] = payload.get("accounts", [])
    total_live = len(raw_accounts)

    # 2. Query existing accounts in database
    existing_accts_query = await db.execute(
        select(Account.id, Account.platform_account_id, Account.normalized_username)
        .where(Account.platform == "x")
    )
    existing_rows = existing_accts_query.all()
    # Map by platform_account_id and normalized_username to Account.id
    id_to_uuid: dict[str, str] = {r[1]: r[0] for r in existing_rows if r[1]}
    user_to_uuid: dict[str, str] = {r[2]: r[0] for r in existing_rows if r[2]}

    # Query existing external list entries for this source
    existing_entries_query = await db.execute(
        select(ExternalListEntry.account_id, ExternalListEntry).where(
            ExternalListEntry.source_id == src_levels.id
        )
    )
    existing_entries: dict[str, ExternalListEntry] = {
        r[0]: r[1] for r in existing_entries_query.all()
    }

    # Query existing evidence items
    existing_ev_query = await db.execute(
        select(EvidenceItem.account_id, EvidenceItem.platform_post_id)
    )
    existing_ev_set: set[tuple[str, str]] = {(r[0], r[1]) for r in existing_ev_query.all()}

    # 3. Process upstream accounts
    new_accounts_to_add: list[Account] = []
    new_evidence_to_add: list[EvidenceItem] = []
    new_entries_to_add: list[ExternalListEntry] = []
    seen_in_batch_ids: set[str] = set()
    seen_in_batch_users: set[str] = set()

    added_accounts_count = 0
    updated_evidence_count = 0

    for item in raw_accounts:
        acct_id = str(item.get("id") or "").strip()
        username = str(item.get("username") or "").strip().lstrip("@")
        if not acct_id or not username:
            continue
        norm_user = username.lower()
        if acct_id in seen_in_batch_ids or norm_user in seen_in_batch_users:
            continue
        seen_in_batch_ids.add(acct_id)
        seen_in_batch_users.add(norm_user)

        levels_flag = item.get("levelsio")
        item_sources = item.get("sources") or []
        ev_list = item.get("evidence") or []

        # Check if account already exists
        target_uuid = id_to_uuid.get(acct_id) or user_to_uuid.get(norm_user)

        first_ev_url: str | None = None
        new_ev_urls_count = 0

        # Parse evidence items
        for ev in ev_list:
            post_url = ev.get("their_post")
            if not post_url or not isinstance(post_url, str):
                continue
            m = STATUS_ID_RE.search(post_url)
            if not m:
                continue
            post_id = m.group(1)
            canonical_url = f"https://x.com/i/status/{post_id}"
            if first_ev_url is None:
                first_ev_url = canonical_url

            # Check if this evidence was already indexed for this account
            if target_uuid and (target_uuid, post_id) in existing_ev_set:
                continue

            reply_content = ev.get("their_reply")
            transient_text = str(reply_content or canonical_url)
            content_hash = sha256_hex(f"{acct_id}:{post_id}:{transient_text}")
            is_deleted = ev.get("their_reply_status") == "deleted"
            collected = _parse_iso_date(ev.get("date")) or now

            # If account is brand new, we assign UUID now
            acct_uuid_for_ev = target_uuid or None
            new_ev_urls_count += 1

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

            new_evidence_to_add.append(
                EvidenceItem(
                    account_id=acct_uuid_for_ev or "",  # will backfill if newly created
                    platform_post_id=post_id,
                    public_post_url=canonical_url,
                    signal_type="external_reported_reply",
                    signal_metrics=signal_metrics,
                    content_hash_sha256=content_hash,
                    source_deleted_at=collected if is_deleted else None,
                    collected_at=collected,
                )
            )

        if target_uuid is None:
            # Brand new account discovered upstream
            target_uuid = new_uuid()
            id_to_uuid[acct_id] = target_uuid
            user_to_uuid[norm_user] = target_uuid

            # Backfill account_id on new evidence items belonging to this new account
            for ev_item in new_evidence_to_add[-new_ev_urls_count:] if new_ev_urls_count > 0 else []:
                if not ev_item.account_id:
                    ev_item.account_id = target_uuid

            rationale = (
                f"External unverified assertion imported from blockedforaireply ({levels_flag or 'listed'}). "
                f"{new_ev_urls_count} canonical public post reference(s) indexed; pending independent AIBlockList human verification."
            )

            new_account = Account(
                id=target_uuid,
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
                has_source_conflict=False,
                appeal_status="none",
                policy_version_id=policy.id,
                public_rationale=rationale,
                created_at=now,
                updated_at=now,
            )
            new_accounts_to_add.append(new_account)
            added_accounts_count += 1

            new_entries_to_add.append(
                ExternalListEntry(
                    source_id=src_levels.id,
                    account_id=target_uuid,
                    source_list_version=list_version,
                    source_classification=_map_levelsio_classification(levels_flag),
                    source_evidence_url=first_ev_url,
                    first_seen_at=_parse_iso_date(item.get("blocked_at")) or now,
                    last_seen_at=now,
                )
            )
        else:
            # Existing account: backfill UUID on new evidence items
            if new_ev_urls_count > 0:
                for ev_item in new_evidence_to_add[-new_ev_urls_count:]:
                    if not ev_item.account_id:
                        ev_item.account_id = target_uuid
                updated_evidence_count += new_ev_urls_count

            # Ensure ExternalListEntry exists and is updated
            existing_entry = existing_entries.get(target_uuid)
            if existing_entry:
                existing_entry.last_seen_at = now
                existing_entry.source_list_version = list_version
            else:
                new_entries_to_add.append(
                    ExternalListEntry(
                        source_id=src_levels.id,
                        account_id=target_uuid,
                        source_list_version=list_version,
                        source_classification=_map_levelsio_classification(levels_flag),
                        source_evidence_url=first_ev_url,
                        first_seen_at=_parse_iso_date(item.get("blocked_at")) or now,
                        last_seen_at=now,
                    )
                )

    # 4. Handle upstream removals (removed-ids.txt)
    removed_accounts_count = 0
    if removed_ids:
        for r_id in removed_ids:
            target_uuid = id_to_uuid.get(r_id)
            if not target_uuid:
                continue
            entry = existing_entries.get(target_uuid)
            if entry and entry.removed_upstream_at is None:
                entry.removed_upstream_at = now
                entry.source_classification = "external_upstream_removed"
                removed_accounts_count += 1

                # Update account rationale transparently
                acct = await db.get(Account, target_uuid)
                if acct and acct.verification_status == "unverified_external":
                    acct.public_rationale = (
                        f"Account removed upstream by source maintainer ({src_levels.display_name}) "
                        f"on or before {now.strftime('%Y-%m-%d')}. Verified behavioral evidence was not independently established."
                    )
                    acct.updated_at = now

    # 5. Flush and persist
    if new_accounts_to_add:
        db.add_all(new_accounts_to_add)
    if new_evidence_to_add:
        db.add_all(new_evidence_to_add)
    if new_entries_to_add:
        db.add_all(new_entries_to_add)

    src_levels.last_synced_at = now
    change_ratio = (added_accounts_count + removed_accounts_count) / max(total_live, 1)

    sync_run = SourceSyncRun(
        source_id=src_levels.id,
        source_version=list_version,
        records_total=total_live,
        records_added=added_accounts_count,
        records_removed=removed_accounts_count,
        change_ratio=round(change_ratio, 4),
        anomaly_paused=False,
        status="completed",
        started_at=now,
        completed_at=now,
    )
    db.add(sync_run)
    await db.flush()

    # 6. Immutable Audit Log Trail
    await append_audit_log(
        db,
        entity_type="source",
        entity_id=src_levels.id,
        action="external_source_incremental_sync",
        actor_role="system",
        payload_diff={
            "source_slug": src_levels.slug,
            "list_version": list_version,
            "records_upstream_total": total_live,
            "records_newly_ingested": added_accounts_count,
            "evidence_items_added": len(new_evidence_to_add),
            "upstream_removals_processed": removed_accounts_count,
            "change_ratio": round(change_ratio, 4),
            "verification_status": "unverified_external",
            "privacy_rule": "no_verbatim_text_stored",
        },
    )

    await db.commit()

    logger.info(
        "Federation sync completed for %s: added=%d, evidence=%d, removed=%d, total=%d",
        src_levels.slug,
        added_accounts_count,
        len(new_evidence_to_add),
        removed_accounts_count,
        total_live,
    )

    return {
        "status": "success",
        "source": src_levels.slug,
        "list_version": list_version,
        "upstream_total": total_live,
        "new_accounts_added": added_accounts_count,
        "evidence_items_added": len(new_evidence_to_add),
        "upstream_removals_marked": removed_accounts_count,
        "change_ratio": round(change_ratio, 4),
    }


async def run_periodic_federation_sync(interval_hours: int | None = None) -> None:
    """
    Background worker that runs periodically ("time to time") to sync all
    configured external federated blocklist sources.
    """
    hours = interval_hours or settings.external_sync_interval_hours
    sleep_seconds = max(hours * 3600, 300)  # at least 5 minutes

    logger.info("Starting periodic federation sync worker (interval=%d hours)", hours)

    # Initial delay of 30 seconds after server startup before first sync
    await asyncio.sleep(30)

    while True:
        try:
            logger.info("Executing periodic federation sync cycle...")
            async with AsyncSessionLocal() as db:
                result = await sync_blockedforaireply(db)
                logger.info("Periodic federation sync result: %s", result)
        except asyncio.CancelledError:
            logger.info("Periodic federation sync worker cancelled.")
            break
        except Exception as exc:
            logger.error("Error in periodic federation sync worker: %s", exc, exc_info=True)

        try:
            await asyncio.sleep(sleep_seconds)
        except asyncio.CancelledError:
            logger.info("Periodic federation sync sleep interrupted; exiting.")
            break
