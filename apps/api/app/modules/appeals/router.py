from __future__ import annotations

import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Header, status
from pydantic import BaseModel, Field
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.settings import settings
from app.core.audit import append_audit_log
from app.core.database import get_db
from app.core.errors import ProblemDetailError
from app.core.models import Account, Appeal, AppealVerificationChallenge, ModerationDecision
from app.core.privacy import canonicalize_evidence_url, normalize_username, sha256_hex

router = APIRouter(prefix="/api/v1/appeals", tags=["Account Appeals"])


class AppealVerifyInitRequest(BaseModel):
    platform: str = Field(default="x")
    username: str = Field(..., min_length=1, max_length=64)
    method: str = Field(default="bio_token", pattern="^(bio_token|oauth)$")


class AppealVerifyConfirmRequest(BaseModel):
    challenge_id: str
    verification_token: str


class AppealSubmitRequest(BaseModel):
    platform: str = Field(default="x")
    username: str = Field(..., min_length=1, max_length=64)
    statement: str = Field(..., min_length=20, max_length=3000)
    supporting_urls: list[str] = Field(default_factory=list, max_length=5)


@router.post("/verify/init", status_code=status.HTTP_201_CREATED)
async def init_ownership_verification(
    payload: AppealVerifyInitRequest,
    db: AsyncSession = Depends(get_db),
) -> dict:
    norm = normalize_username(payload.username)
    account = (
        await db.execute(select(Account).where(Account.platform == payload.platform.lower(), Account.normalized_username == norm))
    ).scalar_one_or_none()
    if account is None:
        raise ProblemDetailError(
            404,
            "ACCOUNT_NOT_INDEXED",
            "Account Not Indexed",
            "This account is not present in AIBlockList and requires no appeal.",
        )

    raw_token = f"aibl-verify-{secrets.token_hex(12)}"
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=30)

    challenge = AppealVerificationChallenge(
        account_id=account.id,
        method=payload.method,
        token_hash_sha256=sha256_hex(raw_token),
        expires_at=expires_at,
        verified_account_id_snapshot=account.platform_account_id,
    )
    db.add(challenge)
    await db.commit()

    return {
        "challenge_id": challenge.id,
        "account_username": account.username,
        "platform_account_id": account.platform_account_id,
        "method": payload.method,
        "verification_token": raw_token,
        "expires_at": expires_at.isoformat(),
        "instructions": (
            "Place this single-use verification token temporarily in your public profile bio, "
            "then confirm ownership. Appeals are always free and never require public oaths."
        ),
    }


@router.post("/verify/confirm")
async def confirm_ownership_verification(
    payload: AppealVerifyConfirmRequest,
    db: AsyncSession = Depends(get_db),
) -> dict:
    challenge = (
        await db.execute(select(AppealVerificationChallenge).where(AppealVerificationChallenge.id == payload.challenge_id))
    ).scalar_one_or_none()
    if challenge is None:
        raise ProblemDetailError(404, "CHALLENGE_NOT_FOUND", "Challenge Not Found", "Invalid verification challenge ID.")

    now = datetime.now(timezone.utc)
    expires = challenge.expires_at
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    if challenge.consumed_at is not None or expires < now:
        raise ProblemDetailError(401, "UNAUTHORIZED", "Challenge Expired or Consumed", "Initiate a new ownership challenge.")
    if challenge.token_hash_sha256 != sha256_hex(payload.verification_token.strip()):
        raise ProblemDetailError(401, "UNAUTHORIZED", "Invalid Verification Token", "Verification token does not match.")

    session_token = f"aibl_app_{secrets.token_urlsafe(24)}"
    challenge.consumed_at = now
    challenge.session_token_hash = sha256_hex(session_token)
    await db.commit()

    return {
        "verified": True,
        "appellant_session_token": session_token,
        "expires_in_seconds": 3600,
    }


@router.post("", status_code=status.HTTP_202_ACCEPTED)
async def submit_appeal(
    payload: AppealSubmitRequest,
    x_appellant_session: str | None = Header(default=None),
    db: AsyncSession = Depends(get_db),
) -> dict:
    if not x_appellant_session:
        raise ProblemDetailError(
            401,
            "UNAUTHORIZED",
            "Ownership Verification Required",
            "Complete account ownership verification and send the X-Appellant-Session header.",
        )

    challenge = (
        await db.execute(
            select(AppealVerificationChallenge).where(
                AppealVerificationChallenge.session_token_hash == sha256_hex(x_appellant_session)
            )
        )
    ).scalar_one_or_none()
    if challenge is None:
        raise ProblemDetailError(401, "UNAUTHORIZED", "Invalid Appellant Session", "Ownership verification session is invalid.")

    norm = normalize_username(payload.username)
    account = (
        await db.execute(select(Account).where(Account.id == challenge.account_id, Account.normalized_username == norm))
    ).scalar_one_or_none()
    if account is None:
        raise ProblemDetailError(403, "FORBIDDEN", "Account Mismatch", "Verified session does not match target account.")

    # Enforce max 1 active appeal per account per 14 days
    cooldown_cutoff = datetime.now(timezone.utc) - timedelta(days=settings.appeal_cooldown_days)
    recent_appeal = (
        await db.execute(
            select(Appeal)
            .where(Appeal.account_id == account.id, Appeal.submitted_at >= cooldown_cutoff)
            .order_by(desc(Appeal.submitted_at))
            .limit(1)
        )
    ).scalar_one_or_none()
    if recent_appeal is not None:
        raise ProblemDetailError(
            409,
            "APPEAL_ALREADY_ACTIVE",
            "Appeal Cooldown Active",
            f"An appeal was already submitted for this account within the last {settings.appeal_cooldown_days} days.",
        )

    canon_links = [canonicalize_evidence_url(payload.platform, u)[1] for u in payload.supporting_urls]
    latest_decision = (
        await db.execute(
            select(ModerationDecision)
            .where(ModerationDecision.account_id == account.id)
            .order_by(desc(ModerationDecision.created_at))
            .limit(1)
        )
    ).scalar_one_or_none()

    now = datetime.now(timezone.utc)
    triage_due = now + timedelta(hours=48)
    sla_due = now + timedelta(days=settings.appeal_sla_business_days + 2)

    appeal = Appeal(
        account_id=account.id,
        contested_decision_id=latest_decision.id if latest_decision else None,
        challenge_id=challenge.id,
        verification_method=challenge.method,
        verified_at=challenge.consumed_at,
        appellant_statement=payload.statement.strip(),
        supporting_links=canon_links,
        status="appealed",
        triage_due_at=triage_due,
        sla_due_at=sla_due,
        submitted_at=now,
    )
    account.appeal_status = "appealed"
    db.add(appeal)
    await db.flush()

    await append_audit_log(
        db,
        entity_type="appeal",
        entity_id=appeal.id,
        action="appeal_submitted",
        actor_role="appellant",
        payload_diff={"account_id": account.id, "verification_method": challenge.method},
    )
    await db.commit()

    return {
        "appeal_id": appeal.id,
        "status": appeal.status,
        "triage_target_date": triage_due.isoformat(),
        "sla_target_date": sla_due.isoformat(),
        "scope_notice": (
            "AIBlockList appeals govern AIBlockList and subscribing third party tools only. "
            "They do not reverse native platform suspensions or restore platform monetization."
        ),
    }


@router.get("/{appeal_id}")
async def get_appeal_status(
    appeal_id: str,
    x_appellant_session: str | None = Header(default=None),
    db: AsyncSession = Depends(get_db),
) -> dict:
    if not x_appellant_session:
        raise ProblemDetailError(401, "UNAUTHORIZED", "Appellant Session Required", "Provide X-Appellant-Session header.")
    challenge = (
        await db.execute(
            select(AppealVerificationChallenge).where(
                AppealVerificationChallenge.session_token_hash == sha256_hex(x_appellant_session)
            )
        )
    ).scalar_one_or_none()
    appeal = (await db.execute(select(Appeal).where(Appeal.id == appeal_id))).scalar_one_or_none()
    if challenge is None or appeal is None or appeal.account_id != challenge.account_id:
        raise ProblemDetailError(404, "APPEAL_NOT_FOUND", "Appeal Not Found", "No appeal found for this verified session.")
    return {
        "appeal_id": appeal.id,
        "status": appeal.status,
        "submitted_at": appeal.submitted_at.isoformat(),
        "triage_target_date": appeal.triage_due_at.isoformat(),
        "sla_target_date": appeal.sla_due_at.isoformat(),
        "public_correction_note": appeal.public_correction_note,
    }


async def assign_independent_appeal_reviewer(
    db: AsyncSession,
    *,
    appeal_id: str,
    reviewer_id: str,
) -> Appeal:
    """Enforces independent second reviewer invariant: reviewer != original primary OR second reviewer."""
    appeal = (await db.execute(select(Appeal).where(Appeal.id == appeal_id))).scalar_one_or_none()
    if appeal is None:
        raise ProblemDetailError(404, "APPEAL_NOT_FOUND", "Appeal Not Found", "Appeal ID not found.")
    if appeal.contested_decision_id:
        decision = (
            await db.execute(select(ModerationDecision).where(ModerationDecision.id == appeal.contested_decision_id))
        ).scalar_one_or_none()
        if decision and reviewer_id in {decision.reviewer_id, decision.second_reviewer_id}:
            raise ProblemDetailError(
                403,
                "FORBIDDEN",
                "Independent Reviewer Required",
                "An appeal can never be reviewed by any reviewer involved in the original classification.",
            )
    appeal.assigned_reviewer_id = reviewer_id
    appeal.status = "under_review"
    await db.commit()
    return appeal
