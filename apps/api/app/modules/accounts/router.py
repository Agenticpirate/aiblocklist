from __future__ import annotations

import base64
import hashlib
import json
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query, Request, Response
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config.settings import settings
from app.core.audit import verify_audit_chain
from app.core.database import get_db
from app.core.errors import ProblemDetailError
from app.core.models import (
    Account,
    Appeal,
    EvidenceItem,
    ExternalListEntry,
    ExternalSource,
    PolicyVersion,
    Report,
)
from app.core.privacy import hash_ip_subnet, normalize_username
from app.core.rate_limit import rate_limiter
from app.core.state_machine import SUPPORTED_PLATFORMS

router = APIRouter(prefix="/api/v1", tags=["Public Intelligence API"])

LEGAL_DISCLAIMER = (
    "Classification reflects observable behavioral patterns under Policy v1.0.0, "
    "not proof of AI authorship or platform rule violation."
)

CATEGORY_DEFINITIONS = [
    {
        "slug": "confirmed_automated_spam",
        "label": "Confirmed automated spam",
        "default_extension_mode": "warn",
        "public_hiding_eligible": True,
        "description": "Verified repetitive automated spam activity backed by at least two behavioral URLs and human approval.",
    },
    {
        "slug": "repetitive_engagement_farming",
        "label": "Repetitive engagement farming",
        "default_extension_mode": "warn",
        "public_hiding_eligible": True,
        "description": "Formulaic, low context engagement loops whether scripted or semi automated.",
    },
    {
        "slug": "coordinated_manipulation",
        "label": "Coordinated manipulation",
        "default_extension_mode": "warn",
        "public_hiding_eligible": True,
        "description": "Account linked to a coordinated cluster of at least three accounts executing synchronized activity.",
    },
    {
        "slug": "suspicious_automation",
        "label": "Suspicious automation",
        "default_extension_mode": "warn",
        "public_hiding_eligible": False,
        "description": "Behavioral indicators exceed warning threshold and await additional human corroboration.",
    },
    {
        "slug": "under_review",
        "label": "Under review",
        "default_extension_mode": "none",
        "public_hiding_eligible": False,
        "description": "Active investigation, high impact pre publication hold, or unverified external source assertion. Excluded from default hiding.",
    },
    {
        "slug": "cleared",
        "label": "Cleared",
        "default_extension_mode": "none",
        "public_hiding_eligible": False,
        "description": "Human verified genuine human or legitimate AI assisted communication protected by anti harassment cooldown.",
    },
    {
        "slug": "delisted",
        "label": "Delisted",
        "default_extension_mode": "none",
        "public_hiding_eligible": False,
        "description": "Previously listed account removed after independent appeal, 30 day behavioral remediation, or 180 day expiry.",
    },
]


def _serialize_account_public(account: Account, include_sources: bool = True) -> dict:
    """Strictly projects ONLY public intelligence fields (zero private PII)."""
    evidence_rows = []
    primary_quote: str | None = None

    for ev in account.evidence_items or []:
        metrics = ev.signal_metrics or {}
        post_text = metrics.get("post_text") or metrics.get("text")
        if primary_quote is None and post_text:
            primary_quote = post_text

        evidence_rows.append(
            {
                "public_post_url": ev.public_post_url,
                "platform_post_id": ev.platform_post_id,
                "signal_type": ev.signal_type,
                "metrics": metrics,
                "content_hash_sha256": ev.content_hash_sha256,
                "source_deleted": ev.source_deleted_at is not None,
                "collected_at": ev.collected_at.isoformat(),
                "post_text": post_text,
                "post_date": metrics.get("post_date") or metrics.get("date"),
                "response_text": metrics.get("response_text"),
            }
        )

    assertions: list[dict] = []
    if include_sources:
        if account.verification_status == "verified":
            assertions.append(
                {
                    "source_slug": "aiblocklist_core",
                    "source_name": "AIBlockList Core Verified",
                    "classification": account.classification,
                    "list_version": account.policy_version.version_tag if account.policy_version else "v1.0.0",
                    "verified": True,
                    "updated_at": (account.last_reviewed_at or account.updated_at).isoformat(),
                }
            )
        for entry in account.external_entries or []:
            assertions.append(
                {
                    "source_slug": entry.source.slug if entry.source else "external",
                    "source_name": entry.source.display_name if entry.source else "External Source",
                    "classification": entry.source_classification,
                    "list_version": entry.source_list_version,
                    "verified": False,
                    "source_evidence_url": entry.source_evidence_url,
                    "updated_at": entry.last_seen_at.isoformat(),
                }
            )

    return {
        "schema_version": settings.api_schema_version,
        "account": {
            "id": account.id,
            "platform": account.platform,
            "platform_account_id": account.platform_account_id,
            "identity_confidence": account.identity_confidence,
            "username": account.username,
            "public_profile_url": account.public_profile_url,
            "classification": account.classification,
            "verification_status": account.verification_status,
            "confidence_level": account.confidence_level,
            "is_high_impact": account.is_high_impact,
            "policy_version": account.policy_version.version_tag if account.policy_version else "v1.0.0",
            "public_rationale": account.public_rationale,
            "last_reviewed_at": account.last_reviewed_at.isoformat() if account.last_reviewed_at else None,
            "re_review_due_at": account.re_review_due_at.isoformat() if account.re_review_due_at else None,
            "appeal_status": account.appeal_status,
            "has_source_conflict": account.has_source_conflict,
            "evidence_count": len(evidence_rows),
            "primary_quote": primary_quote,
            "verified_badge": getattr(account, "verified_badge", None) or "blue",
        },
        "evidence": evidence_rows,
        "source_assertions": assertions,
        "meta": {
            "disclaimer": LEGAL_DISCLAIMER,
            "appeal_url": f"https://aiblocklist.com/appeals?platform={account.platform}&username={account.username}",
        },
    }


def _apply_public_cache_headers(response: Response, payload: dict, max_age: int = 300) -> str:
    etag = f'W/"{hashlib.sha256(json.dumps(payload, sort_keys=True, default=str).encode()).hexdigest()[:24]}"'
    response.headers["ETag"] = etag
    response.headers["Cache-Control"] = f"public, max-age={max_age}, stale-while-revalidate={max_age * 2}"
    return etag


def _check_public_rate_limit(request: Request, response: Response) -> None:
    ip = request.client.host if request.client else "127.0.0.1"
    remaining, reset_at = rate_limiter.check(f"pub:{hash_ip_subnet(ip)}", settings.api_rate_limit_anonymous, 60)
    response.headers["RateLimit-Limit"] = str(settings.api_rate_limit_anonymous)
    response.headers["RateLimit-Remaining"] = str(remaining)
    response.headers["RateLimit-Reset"] = str(reset_at)


@router.get("/accounts/{platform}/{username}")
async def get_account_by_username(
    platform: str,
    username: str,
    request: Request,
    response: Response,
    include_sources: bool = True,
    db: AsyncSession = Depends(get_db),
) -> dict:
    _check_public_rate_limit(request, response)
    plat = platform.lower()
    if plat not in SUPPORTED_PLATFORMS:
        raise ProblemDetailError(400, "INVALID_PLATFORM", "Invalid Platform", f"Unsupported platform '{platform}'.")
    norm = normalize_username(username)

    stmt = (
        select(Account)
        .options(
            selectinload(Account.evidence_items),
            selectinload(Account.external_entries).selectinload(ExternalListEntry.source),
            selectinload(Account.policy_version),
        )
        .where(Account.platform == plat, Account.normalized_username == norm)
    )
    account = (await db.execute(stmt)).scalar_one_or_none()
    if account is None:
        raise ProblemDetailError(
            404,
            "ACCOUNT_NOT_INDEXED",
            "Account Not Indexed",
            "This account is not indexed in AIBlockList. A 404 response never implies legitimacy or abuse.",
        )

    data = _serialize_account_public(account, include_sources=include_sources)
    _apply_public_cache_headers(response, data, max_age=300)
    return data


@router.get("/accounts/id/{platform}/{platform_account_id}")
async def get_account_by_platform_id(
    platform: str,
    platform_account_id: str,
    request: Request,
    response: Response,
    include_sources: bool = True,
    db: AsyncSession = Depends(get_db),
) -> dict:
    _check_public_rate_limit(request, response)
    plat = platform.lower()
    if plat not in SUPPORTED_PLATFORMS:
        raise ProblemDetailError(400, "INVALID_PLATFORM", "Invalid Platform", f"Unsupported platform '{platform}'.")

    stmt = (
        select(Account)
        .options(
            selectinload(Account.evidence_items),
            selectinload(Account.external_entries).selectinload(ExternalListEntry.source),
            selectinload(Account.policy_version),
        )
        .where(Account.platform == plat, Account.platform_account_id == platform_account_id.strip())
    )
    account = (await db.execute(stmt)).scalar_one_or_none()
    if account is None:
        raise ProblemDetailError(
            404,
            "ACCOUNT_NOT_INDEXED",
            "Account Not Indexed",
            "This platform account ID is not indexed. A 404 response never implies legitimacy or abuse.",
        )

    data = _serialize_account_public(account, include_sources=include_sources)
    _apply_public_cache_headers(response, data, max_age=300)
    return data


async def _query_blocklists(
    db: AsyncSession,
    *,
    platform: str | None,
    q: str | None,
    category: str | None,
    verification_status: str | None,
    source: str | None,
    has_evidence: bool | None,
    cursor: str | None,
    limit: int,
) -> dict:
    has_quote_sub = (
        select(1)
        .where(
            EvidenceItem.account_id == Account.id,
            EvidenceItem.signal_metrics.like("%post_text%"),
        )
        .exists()
    )

    stmt = (
        select(Account)
        .options(
            selectinload(Account.evidence_items),
            selectinload(Account.external_entries).selectinload(ExternalListEntry.source),
            selectinload(Account.policy_version),
        )
        .order_by(has_quote_sub.desc(), Account.created_at.desc(), Account.id.asc())
    )
    count_stmt = select(func.count(func.distinct(Account.id))).select_from(Account)

    if platform:
        plat = platform.lower()
        if plat not in SUPPORTED_PLATFORMS:
            raise ProblemDetailError(400, "INVALID_PLATFORM", "Invalid Platform", f"Unsupported platform '{platform}'.")
        stmt = stmt.where(Account.platform == plat)
        count_stmt = count_stmt.where(Account.platform == plat)

    if q and q.strip():
        needle = f"%{q.strip().lstrip('@').lower()}%"
        cond = or_(Account.normalized_username.like(needle), Account.platform_account_id.like(needle))
        stmt = stmt.where(cond)
        count_stmt = count_stmt.where(cond)

    if category:
        stmt = stmt.where(Account.classification == category)
        count_stmt = count_stmt.where(Account.classification == category)

    if verification_status:
        stmt = stmt.where(Account.verification_status == verification_status)
        count_stmt = count_stmt.where(Account.verification_status == verification_status)

    if source:
        if source == "aiblocklist_core":
            stmt = stmt.where(Account.verification_status == "verified")
            count_stmt = count_stmt.where(Account.verification_status == "verified")
        else:
            sub = (
                select(ExternalListEntry.account_id)
                .join(ExternalSource, ExternalSource.id == ExternalListEntry.source_id)
                .where(ExternalSource.slug == source)
            )
            stmt = stmt.where(Account.id.in_(sub))
            count_stmt = count_stmt.where(Account.id.in_(sub))

    if has_evidence is True:
        ev_sub = select(EvidenceItem.account_id).where(EvidenceItem.source_deleted_at.is_(None))
        stmt = stmt.where(Account.id.in_(ev_sub))
        count_stmt = count_stmt.where(Account.id.in_(ev_sub))
    elif has_evidence is False:
        ev_sub = select(EvidenceItem.account_id).where(EvidenceItem.source_deleted_at.is_(None))
        stmt = stmt.where(~Account.id.in_(ev_sub))
        count_stmt = count_stmt.where(~Account.id.in_(ev_sub))

    total_matching = (await db.execute(count_stmt)).scalar_one()

    offset = 0
    if cursor:
        try:
            decoded = base64.urlsafe_b64decode(cursor.encode()).decode()
            if decoded.startswith("off:"):
                offset = int(decoded.split("off:")[1])
            else:
                stmt = stmt.where(Account.id > decoded)
        except Exception:
            offset = 0

    if offset > 0:
        stmt = stmt.offset(offset)

    rows = (await db.execute(stmt.limit(limit + 1))).scalars().all()
    has_more = len(rows) > limit
    page_rows = rows[:limit]
    next_cursor = (
        base64.urlsafe_b64encode(f"off:{offset + limit}".encode()).decode() if has_more and page_rows else None
    )

    return {
        "schema_version": settings.api_schema_version,
        "total_matching": total_matching,
        "count": len(page_rows),
        "next_cursor": next_cursor,
        "snapshot_download_url": f"https://cdn.aiblocklist.com/v1/snapshots/{platform or 'x'}/latest.json.gz",
        "items": [_serialize_account_public(r) for r in page_rows],
        "meta": {"disclaimer": LEGAL_DISCLAIMER},
    }


@router.get("/blocklists")
@router.get("/accounts/search")
@router.get("/search")
async def list_blocklists(
    request: Request,
    response: Response,
    platform: str | None = None,
    q: str | None = None,
    category: str | None = None,
    verification_status: str | None = None,
    source: str | None = None,
    has_evidence: bool | None = None,
    cursor: str | None = None,
    limit: int = Query(default=25, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
) -> dict:
    _check_public_rate_limit(request, response)
    data = await _query_blocklists(
        db,
        platform=platform,
        q=q,
        category=category,
        verification_status=verification_status,
        source=source,
        has_evidence=has_evidence,
        cursor=cursor,
        limit=limit,
    )
    _apply_public_cache_headers(response, {"count": data["count"], "total": data["total_matching"], "cursor": cursor}, 60)
    return data


@router.get("/blocklists/export")
async def export_blocklist(
    platform: str | None = None,
    format: str = Query(default="csv"),
    verification_status: str | None = None,
    category: str | None = None,
    db: AsyncSession = Depends(get_db),
) -> Response:
    stmt = select(Account).order_by(Account.username.asc())
    if platform and platform.lower() != "all":
        stmt = stmt.where(Account.platform == platform.lower())
    if verification_status and verification_status != "all":
        stmt = stmt.where(Account.verification_status == verification_status)
    if category and category != "all":
        stmt = stmt.where(Account.classification == category)

    result = await db.execute(stmt)
    accounts = result.scalars().all()

    filename_prefix = f"aiblocklist_{platform or 'all'}_{datetime.now(timezone.utc).strftime('%Y%m%d')}"

    if format == "json":
        data = [
            {
                "platform": a.platform,
                "username": a.username,
                "platform_account_id": a.platform_account_id,
                "classification": a.classification,
                "verification_status": a.verification_status,
                "public_profile_url": a.public_profile_url,
            }
            for a in accounts
        ]
        return Response(
            content=json.dumps(data, indent=2),
            media_type="application/json",
            headers={"Content-Disposition": f'attachment; filename="{filename_prefix}.json"'},
        )
    elif format == "txt":
        lines = [f"@{a.username}" for a in accounts]
        return Response(
            content="\n".join(lines),
            media_type="text/plain",
            headers={"Content-Disposition": f'attachment; filename="{filename_prefix}.txt"'},
        )
    else:  # csv
        import csv
        import io
        buf = io.StringIO()
        writer = csv.writer(buf)
        writer.writerow(["platform", "username", "platform_account_id", "classification", "verification_status", "profile_url"])
        for a in accounts:
            writer.writerow([a.platform, a.username, a.platform_account_id or "", a.classification, a.verification_status, a.public_profile_url])
        return Response(
            content=buf.getvalue(),
            media_type="text/csv",
            headers={"Content-Disposition": f'attachment; filename="{filename_prefix}.csv"'},
        )


@router.get("/blocklists/{platform}")
async def list_platform_blocklist(
    platform: str,
    request: Request,
    response: Response,
    q: str | None = None,
    category: str | None = None,
    verification_status: str | None = None,
    source: str | None = None,
    has_evidence: bool | None = None,
    cursor: str | None = None,
    limit: int = Query(default=25, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
) -> dict:
    _check_public_rate_limit(request, response)
    data = await _query_blocklists(
        db,
        platform=platform,
        q=q,
        category=category,
        verification_status=verification_status,
        source=source,
        has_evidence=has_evidence,
        cursor=cursor,
        limit=limit,
    )
    _apply_public_cache_headers(response, {"count": data["count"], "total": data["total_matching"], "cursor": cursor}, 60)
    return data


@router.get("/blocklists/export")
async def export_blocklist(
    platform: str | None = None,
    format: str = Query(default="csv"),
    verification_status: str | None = None,
    category: str | None = None,
    db: AsyncSession = Depends(get_db),
) -> Response:
    stmt = select(Account).order_by(Account.username.asc())
    if platform and platform.lower() != "all":
        stmt = stmt.where(Account.platform == platform.lower())
    if verification_status and verification_status != "all":
        stmt = stmt.where(Account.verification_status == verification_status)
    if category and category != "all":
        stmt = stmt.where(Account.classification == category)

    result = await db.execute(stmt)
    accounts = result.scalars().all()

    filename_prefix = f"aiblocklist_{platform or 'all'}_{datetime.now(timezone.utc).strftime('%Y%m%d')}"

    if format == "json":
        data = [
            {
                "platform": a.platform,
                "username": a.username,
                "platform_account_id": a.platform_account_id,
                "classification": a.classification,
                "verification_status": a.verification_status,
                "public_profile_url": a.public_profile_url,
            }
            for a in accounts
        ]
        return Response(
            content=json.dumps(data, indent=2),
            media_type="application/json",
            headers={"Content-Disposition": f'attachment; filename="{filename_prefix}.json"'},
        )
    elif format == "txt":
        lines = [f"@{a.username}" for a in accounts]
        return Response(
            content="\n".join(lines),
            media_type="text/plain",
            headers={"Content-Disposition": f'attachment; filename="{filename_prefix}.txt"'},
        )
    else:  # csv
        import csv
        import io
        buf = io.StringIO()
        writer = csv.writer(buf)
        writer.writerow(["platform", "username", "platform_account_id", "classification", "verification_status", "profile_url"])
        for a in accounts:
            writer.writerow([a.platform, a.username, a.platform_account_id or "", a.classification, a.verification_status, a.public_profile_url])
        return Response(
            content=buf.getvalue(),
            media_type="text/csv",
            headers={"Content-Disposition": f'attachment; filename="{filename_prefix}.csv"'},
        )


@router.get("/categories")
async def list_categories(response: Response) -> dict:
    data = {"policy_version": "v1.0.0", "categories": CATEGORY_DEFINITIONS}
    _apply_public_cache_headers(response, data, max_age=86400)
    return data


@router.get("/policies")
async def list_policies(response: Response, db: AsyncSession = Depends(get_db)) -> dict:
    policies = (await db.execute(select(PolicyVersion).order_by(PolicyVersion.effective_at.desc()))).scalars().all()
    data = {
        "policies": [
            {
                "version_tag": p.version_tag,
                "summary": p.summary,
                "document_url": p.document_url,
                "signal_thresholds": p.signal_thresholds,
                "is_active": p.is_active,
                "effective_at": p.effective_at.isoformat(),
            }
            for p in policies
        ]
    }
    _apply_public_cache_headers(response, data, max_age=3600)
    return data


@router.get("/sources")
async def list_sources(response: Response, db: AsyncSession = Depends(get_db)) -> dict:
    sources = (await db.execute(select(ExternalSource).order_by(ExternalSource.slug.asc()))).scalars().all()
    counts_rows = (
        await db.execute(
            select(ExternalListEntry.source_id, func.count(ExternalListEntry.id)).group_by(ExternalListEntry.source_id)
        )
    ).all()
    counts = {sid: c for sid, c in counts_rows}
    core_verified_count = (
        await db.execute(select(func.count()).select_from(Account).where(Account.verification_status == "verified"))
    ).scalar_one()

    data = {
        "sources": [
            {
                "slug": s.slug,
                "display_name": s.display_name,
                "maintainer_handle": s.maintainer_handle,
                "source_url": s.source_url,
                "license_spdx": s.license_spdx,
                "sync_enabled": s.sync_enabled,
                "reliability_score": s.reliability_score,
                "record_count": core_verified_count if s.slug == "aiblocklist_core" else counts.get(s.id, 0),
                "last_synced_at": s.last_synced_at.isoformat() if s.last_synced_at else None,
            }
            for s in sources
        ]
    }
    _apply_public_cache_headers(response, data, max_age=3600)
    return data


@router.get("/statistics")
async def get_statistics(response: Response, db: AsyncSession = Depends(get_db)) -> dict:
    total_accounts = (await db.execute(select(func.count()).select_from(Account))).scalar_one()
    verified_core = (
        await db.execute(select(func.count()).select_from(Account).where(Account.verification_status == "verified"))
    ).scalar_one()
    unverified_external = (
        await db.execute(
            select(func.count()).select_from(Account).where(Account.verification_status == "unverified_external")
        )
    ).scalar_one()
    accounts_with_evidence = (
        await db.execute(
            select(func.count(func.distinct(EvidenceItem.account_id))).where(EvidenceItem.source_deleted_at.is_(None))
        )
    ).scalar_one()
    accounts_with_2plus_evidence = (
        await db.execute(
            select(func.count()).select_from(
                select(EvidenceItem.account_id)
                .where(EvidenceItem.source_deleted_at.is_(None))
                .group_by(EvidenceItem.account_id)
                .having(func.count(EvidenceItem.id) >= 2)
                .subquery()
            )
        )
    ).scalar_one()
    total_evidence_refs = (await db.execute(select(func.count()).select_from(EvidenceItem))).scalar_one()
    tombstoned_evidence = (
        await db.execute(select(func.count()).select_from(EvidenceItem).where(EvidenceItem.source_deleted_at.is_not(None)))
    ).scalar_one()
    conflicts = (
        await db.execute(select(func.count()).select_from(Account).where(Account.has_source_conflict.is_(True)))
    ).scalar_one()
    total_reports = (await db.execute(select(func.count()).select_from(Report))).scalar_one()
    total_appeals = (await db.execute(select(func.count()).select_from(Appeal))).scalar_one()

    cls_rows = (
        await db.execute(select(Account.classification, func.count(Account.id)).group_by(Account.classification))
    ).all()

    data = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "policy_version": "v1.0.0",
        "totals": {
            "indexed_accounts": total_accounts,
            "aiblocklist_core_verified": verified_core,
            "unverified_external_assertions": unverified_external,
            "accounts_with_public_evidence_urls": accounts_with_evidence,
            "accounts_meeting_2_url_threshold": accounts_with_2plus_evidence,
            "silent_external_entries_zero_urls": max(0, total_accounts - accounts_with_evidence),
            "total_evidence_references": total_evidence_refs,
            "tombstoned_deleted_references": tombstoned_evidence,
            "source_conflicts_preserved": conflicts,
            "community_reports_received": total_reports,
            "appeals_submitted": total_appeals,
        },
        "by_classification": {k: v for k, v in cls_rows},
        "governance_targets": {
            "non_native_false_positive_gate_pct": 2.0,
            "appeal_triage_hours": 48,
            "appeal_resolution_business_days": 7,
            "mandatory_re_review_days": 180,
            "raw_post_text_archived": False,
        },
    }
    _apply_public_cache_headers(response, data, max_age=900)
    return data


@router.get("/transparency")
async def get_transparency_ledger(response: Response, db: AsyncSession = Depends(get_db)) -> dict:
    stats = await get_statistics(response, db)
    chain_valid, chain_count, merkle_root = await verify_audit_chain(db)

    corrections_rows = (
        await db.execute(
            select(Appeal).where(Appeal.public_correction_note.is_not(None)).order_by(Appeal.resolved_at.desc()).limit(20)
        )
    ).scalars().all()

    data = {
        "schema_version": settings.api_schema_version,
        "statistics": stats,
        "audit_integrity": {
            "chain_verified": chain_valid,
            "total_audit_records": chain_count,
            "latest_merkle_root_sha256": merkle_root,
            "append_only_enforced": True,
        },
        "public_corrections": [
            {
                "appeal_id": a.id,
                "status": a.status,
                "public_correction_note": a.public_correction_note,
                "resolved_at": a.resolved_at.isoformat() if a.resolved_at else None,
            }
            for a in corrections_rows
        ],
        "charter_red_lines": [
            "Never sell private user data, reporter identities, IP logs, or unverified accusations.",
            "Never charge fees to appeal or delist an account.",
            "Never paywall the core public database, transparency ledger, or open source code.",
        ],
    }
    _apply_public_cache_headers(response, data, max_age=300)
    return data


@router.get("/snapshots/{platform}/manifest")
async def get_snapshot_manifest(platform: str, response: Response, db: AsyncSession = Depends(get_db)) -> dict:
    plat = platform.lower()
    if plat not in SUPPORTED_PLATFORMS:
        raise ProblemDetailError(400, "INVALID_PLATFORM", "Invalid Platform", f"Unsupported platform '{platform}'.")
    count = (await db.execute(select(func.count()).select_from(Account).where(Account.platform == plat))).scalar_one()
    _, _, merkle_root = await verify_audit_chain(db)
    data = {
        "schema_version": "1.0",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "policy_version": "v1.0.0",
        "data_license": "ODC-By-1.0",
        "platform": plat,
        "record_count": count,
        "dataset_version": datetime.now(timezone.utc).strftime("%Y.%m.%d.%H00"),
        "snapshot_url": f"https://cdn.aiblocklist.com/v1/snapshots/{plat}/latest.json.gz",
        "sha256": merkle_root,
    }
    _apply_public_cache_headers(response, data, max_age=300)
    return data
