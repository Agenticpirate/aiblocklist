from __future__ import annotations

from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.settings import settings
from app.core.audit import append_audit_log
from app.core.errors import ProblemDetailError
from app.core.models import Account, EvidenceItem, ModerationDecision, PolicyVersion
from app.core.state_machine import (
    PUBLIC_LISTED_CLASSIFICATIONS,
    validate_classification_transition,
)


async def record_human_moderation_decision(
    db: AsyncSession,
    *,
    account_id: str,
    reviewer_id: str,
    second_reviewer_id: str | None,
    new_classification: str,
    public_rationale: str,
    internal_notes: str,
    confidence_level: str = "high",
) -> ModerationDecision:
    """
    Enforces the non-negotiable Public Classification Gate:
      1. Valid domain state transition.
      2. Active policy_version attached.
      3. Minimum 2 distinct active (non-tombstoned) behavioral evidence items for confirmed listings.
      4. Mandatory two distinct human reviewers when accounts.is_high_impact = True.
      5. Atomic hash-chained audit_logs commit + 180-day re-review expiry.
    """
    account = (await db.execute(select(Account).where(Account.id == account_id))).scalar_one_or_none()
    if account is None:
        raise ProblemDetailError(404, "ACCOUNT_NOT_INDEXED", "Account Not Found", "Target account is not indexed.")

    validate_classification_transition(account.classification, new_classification)

    policy = (await db.execute(select(PolicyVersion).where(PolicyVersion.is_active.is_(True)))).scalar_one_or_none()
    if policy is None:
        raise ProblemDetailError(409, "PUBLICATION_GATE_FAILED", "No Active Policy", "Active policy version is required.")

    if second_reviewer_id is not None and second_reviewer_id == reviewer_id:
        raise ProblemDetailError(
            409,
            "PUBLICATION_GATE_FAILED",
            "Distinct Second Reviewer Required",
            "High impact dual review requires two distinct human reviewers.",
        )

    if new_classification in PUBLIC_LISTED_CLASSIFICATIONS:
        live_evidence_count = (
            await db.execute(
                select(func.count())
                .select_from(EvidenceItem)
                .where(EvidenceItem.account_id == account.id, EvidenceItem.source_deleted_at.is_(None))
            )
        ).scalar_one()
        if live_evidence_count < 2:
            raise ProblemDetailError(
                409,
                "PUBLICATION_GATE_FAILED",
                "Insufficient Behavioral Evidence",
                f"Confirmed public classification requires at least 2 active behavioral evidence URLs (found {live_evidence_count}).",
            )
        if account.is_high_impact and not second_reviewer_id:
            raise ProblemDetailError(
                409,
                "PUBLICATION_GATE_FAILED",
                "Dual Reviewer Required",
                "High impact accounts require a distinct second human reviewer prior to public classification.",
            )

    prev_classification = account.classification
    now = datetime.now(timezone.utc)

    decision = ModerationDecision(
        account_id=account.id,
        reviewer_id=reviewer_id,
        second_reviewer_id=second_reviewer_id,
        previous_classification=prev_classification,
        new_classification=new_classification,
        policy_version_id=policy.id,
        internal_notes=internal_notes,
        public_rationale=public_rationale,
        created_at=now,
    )
    db.add(decision)

    account.classification = new_classification
    account.verification_status = "verified"
    account.confidence_level = confidence_level
    account.policy_version_id = policy.id
    account.public_rationale = public_rationale
    account.last_reviewed_at = now
    account.updated_at = now
    if new_classification in PUBLIC_LISTED_CLASSIFICATIONS:
        account.re_review_due_at = now + timedelta(days=settings.account_review_expiry_days)
    elif new_classification == "cleared":
        account.re_review_due_at = None
        account.cleared_cooldown_until = now + timedelta(days=30)

    await db.flush()
    await append_audit_log(
        db,
        entity_type="decision",
        entity_id=decision.id,
        action="moderation_decision_committed",
        actor_role="senior_moderator" if second_reviewer_id else "report_reviewer",
        payload_diff={
            "account_id": account.id,
            "previous_classification": prev_classification,
            "new_classification": new_classification,
            "policy_version": policy.version_tag,
            "dual_reviewed": second_reviewer_id is not None,
        },
    )
    await db.commit()
    return decision
