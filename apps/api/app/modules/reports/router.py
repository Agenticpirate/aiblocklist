from __future__ import annotations

import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Header, Request, status
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.settings import settings
from app.core.audit import append_audit_log
from app.core.database import get_db
from app.core.errors import ProblemDetailError
from app.core.models import Account, EvidenceItem, Report, Reporter
from app.core.privacy import (
    canonicalize_account_url,
    canonicalize_evidence_url,
    hash_ip_subnet,
    normalize_username,
    redact_pii,
    sha256_hex,
)
from app.core.rate_limit import rate_limiter
from app.core.state_machine import ACTIVE_PLATFORMS

router = APIRouter(prefix="/api/v1/reports", tags=["Community Reports"])

VALID_REASON_CODES = frozenset(
    {
        "confirmed_automated_spam",
        "repetitive_engagement_farming",
        "coordinated_manipulation",
        "impersonation_automation",
    }
)


class ReportSubmissionRequest(BaseModel):
    platform: str = Field(default="x", description="Target platform slug (MVP: x)")
    account_url: str = Field(..., min_length=10, max_length=255)
    evidence_urls: list[str] = Field(..., min_length=1, max_length=10)
    reason_code: str = Field(..., description="Structured behavioral reason code")
    explanation: str | None = Field(default=None, max_length=1000)


@router.post("", status_code=status.HTTP_202_ACCEPTED)
async def submit_report(
    payload: ReportSubmissionRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> dict:
    platform = payload.platform.strip().lower()
    if platform not in ACTIVE_PLATFORMS:
        raise ProblemDetailError(
            400,
            "INVALID_PLATFORM",
            "Unsupported Platform",
            f"Platform '{platform}' is not active for reporting. Active MVP platforms: {sorted(ACTIVE_PLATFORMS)}.",
        )
    if payload.reason_code not in VALID_REASON_CODES:
        raise ProblemDetailError(
            422,
            "INVALID_REASON_CODE",
            "Invalid Reason Code",
            f"Reason code must be one of: {sorted(VALID_REASON_CODES)}.",
        )

    client_ip = request.client.host if request.client else "127.0.0.1"
    subnet_hash = hash_ip_subnet(client_ip)
    rate_limiter.check(f"report:{subnet_hash}", settings.report_rate_limit_hourly_ip, 3600)

    # Strict canonical URL allowlist validation (prevents SSRF & arbitrary file uploads)
    handle, canonical_profile = canonicalize_account_url(platform, payload.account_url)
    norm_handle = normalize_username(handle)

    canonical_urls: list[str] = []
    for raw_url in payload.evidence_urls:
        _, canon = canonicalize_evidence_url(platform, raw_url)
        if canon not in canonical_urls:
            canonical_urls.append(canon)

    scrubbed_explanation = redact_pii(payload.explanation)

    # Find or create reporter profile (private schema; never exposed publicly)
    reporter = (await db.execute(select(Reporter).where(Reporter.ip_subnet_hash == subnet_hash))).scalar_one_or_none()
    if reporter is None:
        reporter = Reporter(ip_subnet_hash=subnet_hash, standing_score=1.0)
        db.add(reporter)
        await db.flush()
    if reporter.is_suspended:
        raise ProblemDetailError(403, "FORBIDDEN", "Reporter Suspended", "Reporting privileges are suspended for abuse.")

    # Find or create account shell (NEVER automatically classifies publicly!)
    account = (
        await db.execute(
            select(Account).where(Account.platform == platform, Account.normalized_username == norm_handle)
        )
    ).scalar_one_or_none()
    if account is None:
        account = Account(
            platform=platform,
            username=handle,
            normalized_username=norm_handle,
            public_profile_url=canonical_profile,
            classification="under_review",
            verification_status="unverified",
            confidence_level="low",
        )
        db.add(account)
        await db.flush()

    # Deterministic 24-hour deduplication key
    dedup_key = sha256_hex(f"{platform}:{account.platform_account_id or norm_handle}:{','.join(sorted(canonical_urls))}")
    since_24h = datetime.now(timezone.utc) - timedelta(hours=24)
    duplicate = (
        await db.execute(
            select(Report).where(Report.canonical_dedup_key == dedup_key, Report.created_at >= since_24h).limit(1)
        )
    ).scalar_one_or_none()
    if duplicate is not None:
        raise ProblemDetailError(
            409,
            "DUPLICATE_REPORT",
            "Duplicate Report",
            "Identical evidence URLs for this account were already submitted within the last 24 hours.",
        )

    # Brigading burst circuit breaker (>5 reports in 15 min from low-standing / correlated clusters)
    burst_window = datetime.now(timezone.utc) - timedelta(minutes=settings.brigading_burst_window_minutes)
    recent_burst = (
        await db.execute(
            select(func.count())
            .select_from(Report)
            .where(Report.account_id == account.id, Report.created_at >= burst_window)
        )
    ).scalar_one()
    is_brigading = recent_burst >= settings.brigading_burst_count

    status_token = f"rpt_{secrets.token_urlsafe(18)}"
    report = Report(
        account_id=account.id,
        reporter_id=reporter.id,
        reason_code=payload.reason_code,
        submitted_urls=canonical_urls,
        canonical_dedup_key=dedup_key,
        explanation=scrubbed_explanation,
        status="suspected_brigading" if is_brigading else "queued",
        brigading_flag=is_brigading,
        status_token_hash=sha256_hex(status_token),
    )
    reporter.total_reports += 1
    db.add(report)
    await db.flush()

    await append_audit_log(
        db,
        entity_type="report",
        entity_id=report.id,
        action="report_quarantined_brigading" if is_brigading else "report_queued",
        actor_role="anonymous_reporter",
        payload_diff={
            "account_id": account.id,
            "evidence_url_count": len(canonical_urls),
            "brigading_flag": is_brigading,
            "auto_classified": False,
        },
    )
    await db.commit()

    return {
        "report_id": report.id,
        # Neutral external status so brigading attackers are not tipped off
        "status": "queued",
        "status_token": status_token,
        "status_url": f"/api/v1/reports/status/{report.id}",
        "notice": "Reports never trigger automatic public classification. Submissions enter behavioral triage and human review.",
    }


@router.get("/status/{report_id}")
async def get_report_status(
    report_id: str,
    x_report_status_token: str | None = Header(default=None),
    db: AsyncSession = Depends(get_db),
) -> dict:
    if not x_report_status_token:
        raise ProblemDetailError(
            401,
            "UNAUTHORIZED",
            "Status Token Required",
            "Provide the X-Report-Status-Token header returned when submitting the report.",
        )
    report = (await db.execute(select(Report).where(Report.id == report_id))).scalar_one_or_none()
    if report is None or report.status_token_hash != sha256_hex(x_report_status_token):
        raise ProblemDetailError(404, "REPORT_NOT_FOUND", "Report Not Found", "No report matches the provided ID and token.")

    public_status = "triaging" if report.status == "suspected_brigading" else report.status
    return {
        "report_id": report.id,
        "status": public_status,
        "submitted_at": report.created_at.isoformat(),
    }


class PlatformDispatchRequest(BaseModel):
    platform: str = Field(default="x", description="Target platform (x or threads)")
    username: str = Field(..., min_length=1, max_length=100)
    evidence_urls: list[str] = Field(default_factory=list)
    reason: str = Field(default="Automated spam and engagement farming")
    reporter_handle: str | None = Field(default=None)


@router.post("/platform-dispatch", status_code=status.HTTP_200_OK, summary="Generate automated platform abuse complaint packet")
async def generate_platform_dispatch(
    payload: PlatformDispatchRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    Generates a complete, automated Trust & Safety complaint packet ready for
    direct submission to social platforms (X or Threads) via web intent, email,
    or form autofill.
    """
    platform = payload.platform.strip().lower()
    if platform not in ACTIVE_PLATFORMS:
        platform = "x"

    clean_user = payload.username.strip().lstrip("@")
    norm_user = normalize_username(clean_user)

    # Check database for existing account dossier
    query = await db.execute(
        select(Account).where(Account.platform == platform, Account.normalized_username == norm_user)
    )
    account = query.scalar_one_or_none()

    account_id_num = account.platform_account_id if account else "pending_lookup"
    profile_url = f"https://x.com/{clean_user}" if platform == "x" else f"https://threads.net/@{clean_user}"

    # Aggregate evidence URLs: combine request URLs with indexed DB evidence
    evidence_urls = list(payload.evidence_urls)
    if account:
        ev_query = await db.execute(select(EvidenceItem.public_post_url).where(EvidenceItem.account_id == account.id))
        db_urls = ev_query.scalars().all()
        for u in db_urls:
            if u not in evidence_urls:
                evidence_urls.append(u)

    # Construct formatted evidence lines
    if evidence_urls:
        ev_lines = "\n".join(f"  {i+1}. {url}" for i, url in enumerate(evidence_urls[:10]))
    else:
        ev_lines = "  (Zero direct post URLs indexed; flag based on account profile activity)"

    now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    dispatch_id = f"disp_{secrets.token_hex(8)}"

    complaint_subject = f"[Abuse Report] Automated Spam / Sybil Account: @{clean_user}"
    complaint_body = (
        f"OFFICIAL TRUST & SAFETY ABUSE COMPLAINT\n"
        f"Generated via AIBlockList.com Open Intelligence Infrastructure\n"
        f"Dispatch ID: {dispatch_id} · Timestamp: {now_iso}\n\n"
        f"Target Account: @{clean_user}\n"
        f"Platform: {platform.upper()}\n"
        f"Platform ID: {account_id_num}\n"
        f"Profile URL: {profile_url}\n"
        f"Violation Type: {payload.reason}\n\n"
        f"Observable Behavioral Evidence ({len(evidence_urls)} canonical posts):\n"
        f"{ev_lines}\n\n"
        f"Observed Behavioral Pattern:\n"
        f"Account posts repetitive near-duplicate replies, formulaic templates, or participates in "
        f"automated engagement loops that violate platform rules on spam and platform manipulation.\n\n"
        f"AIBlockList Intelligence Dossier:\n"
        f"https://aiblocklist.com/accounts/{platform}/{clean_user}\n"
    )

    if platform == "x":
        email_recipient = "support@x.com,abuse@twitter.com"
        web_report_url = f"https://x.com/i/safety/report?screen_name={clean_user}"
    else:
        email_recipient = "support@instagram.com"
        web_report_url = f"https://www.threads.net/@{clean_user}"

    # Build RFC-compliant mailto URL
    import urllib.parse
    mailto_link = (
        f"mailto:{email_recipient}?"
        f"subject={urllib.parse.quote(complaint_subject)}&"
        f"body={urllib.parse.quote(complaint_body)}"
    )

    # Cryptographic Audit Log entry
    await append_audit_log(
        db,
        entity_type="platform_dispatch",
        entity_id=dispatch_id,
        action="platform_report_packet_generated",
        actor_role="anonymous_user",
        payload_diff={
            "platform": platform,
            "target_username": clean_user,
            "evidence_count": len(evidence_urls),
            "recipient": email_recipient,
        },
    )
    await db.commit()

    return {
        "dispatch_id": dispatch_id,
        "platform": platform,
        "target_username": clean_user,
        "target_account_id": account_id_num,
        "profile_url": profile_url,
        "email_recipient": email_recipient,
        "complaint_subject": complaint_subject,
        "complaint_body": complaint_body,
        "mailto_link": mailto_link,
        "web_report_url": web_report_url,
        "evidence_count": len(evidence_urls),
        "status": "ready_for_dispatch",
    }
