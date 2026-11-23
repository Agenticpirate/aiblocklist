from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    JSON,
    Boolean,
    CheckConstraint,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def new_uuid() -> str:
    return str(uuid.uuid4())


# =============================================================================
# PUBLIC INTELLIGENCE DOMAIN (mirrors PostgreSQL `intel` schema)
# =============================================================================


class PolicyVersion(Base):
    __tablename__ = "policy_versions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    version_tag: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    document_url: Mapped[str] = mapped_column(Text, nullable=False)
    signal_thresholds: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    effective_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utcnow)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utcnow)


class Account(Base):
    __tablename__ = "accounts"
    __table_args__ = (
        Index("ix_accounts_platform_classification", "platform", "classification"),
        Index("ix_accounts_platform_norm_user", "platform", "normalized_username"),
        Index("ix_accounts_platform_acct_id", "platform", "platform_account_id"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    platform: Mapped[str] = mapped_column(String(32), nullable=False)
    platform_account_id: Mapped[str | None] = mapped_column(String(128), nullable=True)
    identity_confidence: Mapped[str] = mapped_column(String(32), nullable=False, default="handle_only_unverified")
    username: Mapped[str] = mapped_column(String(255), nullable=False)
    normalized_username: Mapped[str] = mapped_column(String(255), nullable=False)
    is_handle_current: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    public_profile_url: Mapped[str] = mapped_column(Text, nullable=False)

    # Strict 7-state classification taxonomy
    classification: Mapped[str] = mapped_column(String(64), nullable=False, default="under_review")
    verification_status: Mapped[str] = mapped_column(String(32), nullable=False, default="unverified")
    confidence_level: Mapped[str] = mapped_column(String(16), nullable=False, default="low")
    is_high_impact: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    has_source_conflict: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    appeal_status: Mapped[str] = mapped_column(String(32), nullable=False, default="none")

    policy_version_id: Mapped[str | None] = mapped_column(ForeignKey("policy_versions.id"), nullable=True)
    public_rationale: Mapped[str | None] = mapped_column(Text, nullable=True)
    cleared_cooldown_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    last_reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    re_review_due_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utcnow)

    policy_version: Mapped[PolicyVersion | None] = relationship()
    evidence_items: Mapped[list[EvidenceItem]] = relationship(back_populates="account", cascade="all, delete-orphan")
    external_entries: Mapped[list[ExternalListEntry]] = relationship(
        back_populates="account", cascade="all, delete-orphan"
    )
    handle_history: Mapped[list[AccountHandleHistory]] = relationship(
        back_populates="account", cascade="all, delete-orphan"
    )


class AccountHandleHistory(Base):
    __tablename__ = "account_handle_history"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    account_id: Mapped[str] = mapped_column(ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False)
    previous_username: Mapped[str] = mapped_column(String(255), nullable=False)
    new_username: Mapped[str] = mapped_column(String(255), nullable=False)
    verified_via_api: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    observed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utcnow)

    account: Mapped[Account] = relationship(back_populates="handle_history")


class EvidenceItem(Base):
    __tablename__ = "evidence_items"
    __table_args__ = (UniqueConstraint("account_id", "platform_post_id", name="uq_evidence_account_post"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    account_id: Mapped[str] = mapped_column(ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False, index=True)
    platform_post_id: Mapped[str] = mapped_column(String(128), nullable=False)
    public_post_url: Mapped[str] = mapped_column(Text, nullable=False)
    signal_type: Mapped[str] = mapped_column(String(64), nullable=False)
    signal_metrics: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    # Tamper-evident hash; ZERO raw third-party post text archived
    content_hash_sha256: Mapped[str] = mapped_column(String(64), nullable=False)
    source_deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    collected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utcnow)

    account: Mapped[Account] = relationship(back_populates="evidence_items")


class ExternalSource(Base):
    __tablename__ = "external_sources"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    slug: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    display_name: Mapped[str] = mapped_column(String(128), nullable=False)
    maintainer_handle: Mapped[str | None] = mapped_column(String(128), nullable=True)
    source_url: Mapped[str] = mapped_column(Text, nullable=False)
    license_spdx: Mapped[str | None] = mapped_column(String(64), nullable=True)
    sync_enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    sync_paused_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    reliability_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    last_synced_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utcnow)


class ExternalListEntry(Base):
    __tablename__ = "external_list_entries"
    __table_args__ = (UniqueConstraint("source_id", "account_id", name="uq_ext_source_account"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    source_id: Mapped[str] = mapped_column(ForeignKey("external_sources.id", ondelete="CASCADE"), nullable=False, index=True)
    account_id: Mapped[str] = mapped_column(ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False, index=True)
    source_list_version: Mapped[str] = mapped_column(String(64), nullable=False)
    source_classification: Mapped[str] = mapped_column(String(64), nullable=False)
    source_evidence_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    first_seen_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utcnow)
    last_seen_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utcnow)
    removed_upstream_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    source: Mapped[ExternalSource] = relationship()
    account: Mapped[Account] = relationship(back_populates="external_entries")


# =============================================================================
# PRIVATE OPERATIONAL DOMAIN (mirrors PostgreSQL `ops_private` schema)
# Never exposed in public API responses or snapshots
# =============================================================================


class Reporter(Base):
    __tablename__ = "reporters"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    ip_subnet_hash: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    standing_score: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)
    total_reports: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    upheld_reports: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    rejected_reports: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    is_suspended: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utcnow)


class Report(Base):
    __tablename__ = "reports"
    __table_args__ = (
        CheckConstraint("explanation IS NULL OR length(explanation) <= 1000", name="ck_report_explanation_len"),
        Index("ix_reports_dedup_created", "canonical_dedup_key", "created_at"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    account_id: Mapped[str] = mapped_column(ForeignKey("accounts.id"), nullable=False, index=True)
    reporter_id: Mapped[str] = mapped_column(ForeignKey("reporters.id"), nullable=False, index=True)
    reason_code: Mapped[str] = mapped_column(String(64), nullable=False)
    submitted_urls: Mapped[list] = mapped_column(JSON, nullable=False)
    canonical_dedup_key: Mapped[str] = mapped_column(String(64), nullable=False)
    explanation: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="queued")
    brigading_flag: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    status_token_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utcnow)


class ModerationDecision(Base):
    __tablename__ = "moderation_decisions"
    __table_args__ = (
        CheckConstraint("second_reviewer_id IS NULL OR second_reviewer_id <> reviewer_id", name="ck_distinct_reviewers"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    account_id: Mapped[str] = mapped_column(ForeignKey("accounts.id"), nullable=False, index=True)
    reviewer_id: Mapped[str] = mapped_column(String(64), nullable=False)
    second_reviewer_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    previous_classification: Mapped[str | None] = mapped_column(String(64), nullable=True)
    new_classification: Mapped[str] = mapped_column(String(64), nullable=False)
    policy_version_id: Mapped[str] = mapped_column(ForeignKey("policy_versions.id"), nullable=False)
    internal_notes: Mapped[str] = mapped_column(Text, nullable=False)
    public_rationale: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utcnow)


class AppealVerificationChallenge(Base):
    __tablename__ = "appeal_verification_challenges"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    account_id: Mapped[str] = mapped_column(ForeignKey("accounts.id"), nullable=False, index=True)
    method: Mapped[str] = mapped_column(String(32), nullable=False)
    token_hash_sha256: Mapped[str] = mapped_column(String(64), nullable=False)
    session_token_hash: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    consumed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    verified_account_id_snapshot: Mapped[str | None] = mapped_column(String(128), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utcnow)


class Appeal(Base):
    __tablename__ = "appeals"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    account_id: Mapped[str] = mapped_column(ForeignKey("accounts.id"), nullable=False, index=True)
    contested_decision_id: Mapped[str | None] = mapped_column(ForeignKey("moderation_decisions.id"), nullable=True)
    challenge_id: Mapped[str | None] = mapped_column(ForeignKey("appeal_verification_challenges.id"), nullable=True)
    verification_method: Mapped[str] = mapped_column(String(32), nullable=False)
    verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    appellant_statement: Mapped[str] = mapped_column(Text, nullable=False)
    supporting_links: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="appealed")
    assigned_reviewer_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    resolution_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    public_correction_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    triage_due_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    sla_due_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utcnow)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class ApiKey(Base):
    __tablename__ = "api_keys"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    label: Mapped[str] = mapped_column(String(128), nullable=False)
    key_prefix: Mapped[str] = mapped_column(String(16), nullable=False)
    key_hash_sha256: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    tier: Mapped[str] = mapped_column(String(32), nullable=False, default="community")
    rate_limit_rpm: Mapped[int] = mapped_column(Integer, nullable=False, default=600)
    last_used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utcnow)


class SourceSyncRun(Base):
    __tablename__ = "source_sync_runs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    source_id: Mapped[str] = mapped_column(ForeignKey("external_sources.id"), nullable=False)
    source_version: Mapped[str] = mapped_column(String(64), nullable=False)
    records_total: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    records_added: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    records_removed: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    change_ratio: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    anomaly_paused: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utcnow)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


# =============================================================================
# IMMUTABLE CRYPTOGRAPHIC AUDIT TRAIL (mirrors PostgreSQL `audit` schema)
# =============================================================================


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    entity_type: Mapped[str] = mapped_column(String(32), nullable=False)
    entity_id: Mapped[str] = mapped_column(String(64), nullable=False)
    action: Mapped[str] = mapped_column(String(64), nullable=False)
    actor_role: Mapped[str] = mapped_column(String(32), nullable=False)
    actor_pseudonym: Mapped[str] = mapped_column(String(64), nullable=False, default="system")
    payload_diff: Mapped[dict] = mapped_column(JSON, nullable=False)
    prev_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    record_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utcnow)
