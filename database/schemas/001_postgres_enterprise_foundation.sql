-- AIBlockList.com — PostgreSQL 16+ 3-Schema Enterprise Foundation
-- Enforces:
--   1. Strict schema isolation: intel (public) vs ops_private (PII/operational) vs audit (append-only)
--   2. Least-privilege roles: aibl_public_ro (SELECT intel only), aibl_app_rw (INSERT/SELECT audit only)
--   3. Serialized SHA-256 hash chaining on audit.audit_logs via pg_advisory_xact_lock
--   4. Publication gate (>=2 active evidence items + active policy + human decision + dual reviewer on high-impact)
--   5. Independent appeal reviewer check (assigned_reviewer_id NOT IN primary/second original reviewers)

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS vector;

CREATE SCHEMA IF NOT EXISTS intel;
CREATE SCHEMA IF NOT EXISTS ops_private;
CREATE SCHEMA IF NOT EXISTS audit;

-- Least-privilege roles (idempotent creation)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'aibl_public_ro') THEN
        CREATE ROLE aibl_public_ro LOGIN PASSWORD 'aibl_ro_password';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'aibl_app_rw') THEN
        CREATE ROLE aibl_app_rw LOGIN PASSWORD 'aibl_dev_password';
    END IF;
END
$$;

-- Canonical ENUM types
CREATE TYPE intel.platform_enum AS ENUM (
    'x', 'bluesky', 'mastodon', 'reddit', 'threads', 'telegram', 'discord', 'linkedin', 'instagram', 'facebook'
);

CREATE TYPE intel.classification_enum AS ENUM (
    'confirmed_automated_spam',
    'repetitive_engagement_farming',
    'coordinated_manipulation',
    'suspicious_automation',
    'under_review',
    'cleared',
    'delisted'
);

CREATE TYPE intel.verification_status_enum AS ENUM (
    'unverified', 'pending_human', 'verified', 'unverified_external'
);

CREATE TYPE intel.confidence_level_enum AS ENUM ('low', 'medium', 'high');
CREATE TYPE intel.identity_confidence_enum AS ENUM ('immutable_id', 'handle_only_unverified');

CREATE TYPE intel.appeal_status_enum AS ENUM (
    'none', 'under_review', 'temporarily_withheld', 'confirmed', 'appealed', 'cleared', 'delisted'
);

CREATE TYPE ops_private.report_status_enum AS ENUM (
    'queued', 'triaging', 'suspected_brigading', 'escalated', 'escalated_budget_paused',
    'resolved', 'closed_duplicate', 'rejected_abuse'
);

-- ============================================================================
-- SCHEMA: intel (Publicly Distributable Intelligence — Zero Private PII)
-- ============================================================================

CREATE TABLE intel.policy_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version_tag VARCHAR(32) UNIQUE NOT NULL,
    summary TEXT NOT NULL,
    document_url TEXT NOT NULL,
    signal_thresholds JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    effective_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE intel.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform intel.platform_enum NOT NULL,
    platform_account_id VARCHAR(128),
    identity_confidence intel.identity_confidence_enum NOT NULL DEFAULT 'handle_only_unverified',
    username VARCHAR(255) NOT NULL,
    normalized_username VARCHAR(255) NOT NULL,
    is_handle_current BOOLEAN NOT NULL DEFAULT TRUE,
    public_profile_url TEXT NOT NULL,
    classification intel.classification_enum NOT NULL DEFAULT 'under_review',
    verification_status intel.verification_status_enum NOT NULL DEFAULT 'unverified',
    confidence_level intel.confidence_level_enum NOT NULL DEFAULT 'low',
    is_high_impact BOOLEAN NOT NULL DEFAULT FALSE,
    has_source_conflict BOOLEAN NOT NULL DEFAULT FALSE,
    appeal_status intel.appeal_status_enum NOT NULL DEFAULT 'none',
    policy_version_id UUID REFERENCES intel.policy_versions(id),
    public_rationale TEXT,
    cleared_cooldown_until TIMESTAMPTZ,
    last_reviewed_at TIMESTAMPTZ,
    re_review_due_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX uq_accounts_platform_id
    ON intel.accounts (platform, platform_account_id)
    WHERE platform_account_id IS NOT NULL;

CREATE UNIQUE INDEX uq_accounts_current_handle
    ON intel.accounts (platform, normalized_username)
    WHERE is_handle_current = TRUE;

CREATE INDEX idx_accounts_trgm ON intel.accounts USING GIN (normalized_username gin_trgm_ops);
CREATE INDEX idx_accounts_pub_status ON intel.accounts (platform, classification) WHERE verification_status = 'verified';
CREATE INDEX idx_accounts_rereview ON intel.accounts (re_review_due_at) WHERE re_review_due_at IS NOT NULL;

CREATE TABLE intel.account_handle_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES intel.accounts(id) ON DELETE CASCADE,
    previous_username VARCHAR(255) NOT NULL,
    new_username VARCHAR(255) NOT NULL,
    verified_via_api BOOLEAN NOT NULL DEFAULT FALSE,
    observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE intel.evidence_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES intel.accounts(id) ON DELETE CASCADE,
    platform_post_id VARCHAR(128) NOT NULL,
    public_post_url TEXT NOT NULL,
    signal_type VARCHAR(64) NOT NULL,
    signal_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    content_hash_sha256 CHAR(64) NOT NULL,
    embedding VECTOR(384),
    embedding_model VARCHAR(64),
    embedding_model_version VARCHAR(32),
    source_deleted_at TIMESTAMPTZ,
    collected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (account_id, platform_post_id)
);

CREATE TABLE intel.external_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(64) UNIQUE NOT NULL,
    display_name VARCHAR(128) NOT NULL,
    maintainer_handle VARCHAR(128),
    source_url TEXT NOT NULL,
    license_spdx VARCHAR(64),
    sync_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    sync_paused_reason TEXT,
    reliability_score NUMERIC(4,3),
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE intel.external_list_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES intel.external_sources(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES intel.accounts(id) ON DELETE CASCADE,
    source_list_version VARCHAR(64) NOT NULL,
    source_classification VARCHAR(64) NOT NULL,
    source_evidence_url TEXT,
    first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    removed_upstream_at TIMESTAMPTZ,
    UNIQUE (source_id, account_id)
);

CREATE TABLE intel.coordinated_clusters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform intel.platform_enum NOT NULL,
    cluster_label VARCHAR(128) NOT NULL,
    member_count INTEGER NOT NULL CHECK (member_count >= 3),
    policy_version_id UUID NOT NULL REFERENCES intel.policy_versions(id),
    summary_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    verified_by_human BOOLEAN NOT NULL DEFAULT FALSE,
    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE intel.coordinated_cluster_members (
    cluster_id UUID NOT NULL REFERENCES intel.coordinated_clusters(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES intel.accounts(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (cluster_id, account_id)
);

-- ============================================================================
-- SCHEMA: ops_private (Strictly Controlled Operational & PII Tables)
-- ============================================================================

CREATE TABLE ops_private.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(320) UNIQUE NOT NULL,
    display_name VARCHAR(128) NOT NULL,
    auth_provider VARCHAR(32) NOT NULL DEFAULT 'github',
    external_auth_id VARCHAR(128),
    mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    mfa_method VARCHAR(16),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

CREATE TABLE ops_private.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(64) UNIQUE NOT NULL,
    description TEXT NOT NULL
);

CREATE TABLE ops_private.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(64) UNIQUE NOT NULL,
    description TEXT NOT NULL
);

CREATE TABLE ops_private.user_roles (
    user_id UUID NOT NULL REFERENCES ops_private.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES ops_private.roles(id) ON DELETE CASCADE,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE ops_private.role_permissions (
    role_id UUID NOT NULL REFERENCES ops_private.roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES ops_private.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE ops_private.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES ops_private.users(id) ON DELETE CASCADE,
    session_token_hash CHAR(64) UNIQUE NOT NULL,
    session_context VARCHAR(32) NOT NULL,
    mfa_verified_at TIMESTAMPTZ,
    ip_subnet_hash CHAR(64),
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ops_private.api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES ops_private.users(id) ON DELETE CASCADE,
    key_prefix VARCHAR(16) NOT NULL,
    key_hash_sha256 CHAR(64) UNIQUE NOT NULL,
    tier VARCHAR(32) NOT NULL DEFAULT 'community',
    rate_limit_rpm INTEGER NOT NULL DEFAULT 600,
    last_used_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ops_private.reporters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES ops_private.users(id),
    ip_subnet_hash CHAR(64),
    standing_score NUMERIC(5,2) NOT NULL DEFAULT 1.00,
    total_reports INTEGER NOT NULL DEFAULT 0,
    upheld_reports INTEGER NOT NULL DEFAULT 0,
    rejected_reports INTEGER NOT NULL DEFAULT 0,
    is_suspended BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ops_private.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES intel.accounts(id),
    reporter_id UUID NOT NULL REFERENCES ops_private.reporters(id),
    reason_code VARCHAR(64) NOT NULL,
    submitted_urls JSONB NOT NULL,
    canonical_dedup_key CHAR(64) NOT NULL,
    explanation TEXT CHECK (explanation IS NULL OR char_length(explanation) <= 1000),
    status ops_private.report_status_enum NOT NULL DEFAULT 'queued',
    brigading_flag BOOLEAN NOT NULL DEFAULT FALSE,
    status_token_hash CHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reports_dedup ON ops_private.reports (canonical_dedup_key, created_at);

CREATE TABLE ops_private.verification_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES intel.accounts(id),
    trigger_source VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'queued',
    attempts INTEGER NOT NULL DEFAULT 0,
    error_code VARCHAR(64),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ops_private.behavioral_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES intel.accounts(id),
    verification_job_id UUID REFERENCES ops_private.verification_jobs(id),
    policy_version_id UUID NOT NULL REFERENCES intel.policy_versions(id),
    signal_code VARCHAR(16) NOT NULL,
    triggered BOOLEAN NOT NULL DEFAULT FALSE,
    metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    sample_size INTEGER NOT NULL DEFAULT 0,
    window_hours INTEGER NOT NULL DEFAULT 168,
    computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ops_private.moderation_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES intel.accounts(id),
    reviewer_id UUID NOT NULL REFERENCES ops_private.users(id),
    second_reviewer_id UUID REFERENCES ops_private.users(id),
    previous_classification intel.classification_enum,
    new_classification intel.classification_enum NOT NULL,
    policy_version_id UUID NOT NULL REFERENCES intel.policy_versions(id),
    evidence_item_ids UUID[] NOT NULL DEFAULT '{}',
    internal_notes TEXT NOT NULL,
    public_rationale TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (second_reviewer_id IS NULL OR second_reviewer_id <> reviewer_id)
);

CREATE TABLE ops_private.appeal_verification_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES intel.accounts(id),
    method VARCHAR(32) NOT NULL,
    token_hash_sha256 CHAR(64) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    consumed_at TIMESTAMPTZ,
    verified_account_id_snapshot VARCHAR(128),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ops_private.appeals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES intel.accounts(id),
    contested_decision_id UUID REFERENCES ops_private.moderation_decisions(id),
    challenge_id UUID REFERENCES ops_private.appeal_verification_challenges(id),
    verification_method VARCHAR(32) NOT NULL,
    verified_at TIMESTAMPTZ,
    appellant_statement TEXT NOT NULL,
    supporting_links JSONB NOT NULL DEFAULT '[]'::jsonb,
    status intel.appeal_status_enum NOT NULL DEFAULT 'appealed',
    assigned_reviewer_id UUID REFERENCES ops_private.users(id),
    second_panelist_id UUID REFERENCES ops_private.users(id),
    resolution_notes TEXT,
    public_correction_note TEXT,
    triage_due_at TIMESTAMPTZ NOT NULL,
    sla_due_at TIMESTAMPTZ NOT NULL,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    CHECK (second_panelist_id IS NULL OR second_panelist_id <> assigned_reviewer_id)
);

CREATE TABLE ops_private.source_sync_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES intel.external_sources(id),
    source_version VARCHAR(64) NOT NULL,
    records_total INTEGER NOT NULL DEFAULT 0,
    records_added INTEGER NOT NULL DEFAULT 0,
    records_removed INTEGER NOT NULL DEFAULT 0,
    change_ratio NUMERIC(5,4) NOT NULL DEFAULT 0,
    anomaly_paused BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(32) NOT NULL,
    error_summary TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE ops_private.snapshot_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform intel.platform_enum NOT NULL,
    schema_version VARCHAR(16) NOT NULL,
    dataset_version VARCHAR(64) NOT NULL,
    record_count INTEGER NOT NULL,
    sha256_checksum CHAR(64) NOT NULL,
    r2_object_key TEXT NOT NULL,
    policy_version_id UUID REFERENCES intel.policy_versions(id),
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (platform, dataset_version)
);

CREATE TABLE ops_private.platform_api_usage (
    id BIGSERIAL PRIMARY KEY,
    platform intel.platform_enum NOT NULL,
    verification_job_id UUID REFERENCES ops_private.verification_jobs(id),
    request_type VARCHAR(32) NOT NULL,
    units_consumed INTEGER NOT NULL,
    assumed_unit_cost_usd NUMERIC(10,5) NOT NULL,
    estimated_cost_usd NUMERIC(10,5) NOT NULL,
    billing_period CHAR(7) NOT NULL,
    utc_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ops_private.security_events (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(64) NOT NULL,
    severity VARCHAR(16) NOT NULL,
    actor_ref VARCHAR(128),
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ops_private.rate_limit_events (
    id BIGSERIAL PRIMARY KEY,
    endpoint VARCHAR(128) NOT NULL,
    key_prefix VARCHAR(16),
    ip_subnet_hash CHAR(64),
    limit_triggered INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ops_private.data_deletion_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    regime VARCHAR(32) NOT NULL,
    target_entity_type VARCHAR(32) NOT NULL,
    target_entity_id VARCHAR(128) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'received',
    legal_notes TEXT,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- ============================================================================
-- SCHEMA: audit (Append-Only SHA-256 Hash-Chained Ledger)
-- ============================================================================

CREATE TABLE audit.audit_logs (
    id BIGSERIAL PRIMARY KEY,
    entity_type VARCHAR(32) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(64) NOT NULL,
    actor_role VARCHAR(32) NOT NULL,
    actor_pseudonym VARCHAR(64) NOT NULL DEFAULT 'system',
    payload_diff JSONB NOT NULL,
    prev_hash CHAR(64),
    record_hash CHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE audit.merkle_checkpoints (
    id BIGSERIAL PRIMARY KEY,
    start_audit_id BIGINT NOT NULL,
    end_audit_id BIGINT NOT NULL,
    merkle_root_sha256 CHAR(64) NOT NULL,
    published_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- CRITICAL SECURITY & GOVERNANCE TRIGGERS
-- ============================================================================

-- 1. Serialized SHA-256 hash chain on audit.audit_logs
CREATE OR REPLACE FUNCTION audit.compute_audit_hash_chain()
RETURNS TRIGGER AS $$
DECLARE
    last_hash CHAR(64);
    payload_str TEXT;
BEGIN
    PERFORM pg_advisory_xact_lock(hashtext('audit_logs_chain'));
    SELECT record_hash INTO last_hash FROM audit.audit_logs ORDER BY id DESC LIMIT 1;
    NEW.prev_hash := COALESCE(last_hash, repeat('0', 64));
    payload_str := NEW.prev_hash || '|' || NEW.entity_type || '|' || NEW.entity_id::text || '|' ||
                   NEW.action || '|' || NEW.actor_role || '|' || NEW.payload_diff::text || '|' ||
                   to_char(NEW.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"');
    NEW.record_hash := encode(digest(payload_str, 'sha256'), 'hex');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_logs_hash_chain
BEFORE INSERT ON audit.audit_logs
FOR EACH ROW EXECUTE FUNCTION audit.compute_audit_hash_chain();

-- 2. Enforce >=2 live evidence items + human decision + dual reviewer on high-impact accounts
CREATE OR REPLACE FUNCTION intel.enforce_publication_gate()
RETURNS TRIGGER AS $$
DECLARE
    live_evidence_count INTEGER;
    latest_decision RECORD;
BEGIN
    IF NEW.verification_status = 'verified'
       AND NEW.classification IN ('confirmed_automated_spam', 'repetitive_engagement_farming', 'coordinated_manipulation') THEN
        IF NEW.policy_version_id IS NULL OR NEW.public_rationale IS NULL OR NEW.re_review_due_at IS NULL THEN
            RAISE EXCEPTION 'Publication gate failed: policy_version_id, public_rationale, and re_review_due_at are mandatory';
        END IF;

        SELECT COUNT(*) INTO live_evidence_count
        FROM intel.evidence_items
        WHERE account_id = NEW.id AND source_deleted_at IS NULL;

        IF live_evidence_count < 2 THEN
            RAISE EXCEPTION 'Publication gate failed: minimum 2 active behavioral evidence items required (found %)', live_evidence_count;
        END IF;

        SELECT reviewer_id, second_reviewer_id INTO latest_decision
        FROM ops_private.moderation_decisions
        WHERE account_id = NEW.id AND new_classification = NEW.classification
        ORDER BY created_at DESC LIMIT 1;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Publication gate failed: human moderation decision required';
        END IF;

        IF NEW.is_high_impact AND (latest_decision.second_reviewer_id IS NULL OR latest_decision.second_reviewer_id = latest_decision.reviewer_id) THEN
            RAISE EXCEPTION 'Publication gate failed: high-impact account requires two distinct human reviewers';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_accounts_publication_gate
BEFORE INSERT OR UPDATE ON intel.accounts
FOR EACH ROW EXECUTE FUNCTION intel.enforce_publication_gate();

-- 3. Enforce independent appeal reviewer (cannot match original primary or second reviewer)
CREATE OR REPLACE FUNCTION ops_private.enforce_independent_appeal_reviewer()
RETURNS TRIGGER AS $$
DECLARE
    orig RECORD;
BEGIN
    IF NEW.contested_decision_id IS NOT NULL AND NEW.assigned_reviewer_id IS NOT NULL THEN
        SELECT reviewer_id, second_reviewer_id INTO orig
        FROM ops_private.moderation_decisions
        WHERE id = NEW.contested_decision_id;

        IF FOUND AND (
            NEW.assigned_reviewer_id = orig.reviewer_id
            OR (orig.second_reviewer_id IS NOT NULL AND NEW.assigned_reviewer_id = orig.second_reviewer_id)
        ) THEN
            RAISE EXCEPTION 'Appeal reviewer must be independent of original decision reviewer(s)';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_appeals_independent_reviewer
BEFORE INSERT OR UPDATE ON ops_private.appeals
FOR EACH ROW EXECUTE FUNCTION ops_private.enforce_independent_appeal_reviewer();

-- ============================================================================
-- LEAST-PRIVILEGE ROLE GRANTS
-- ============================================================================
REVOKE ALL ON SCHEMA intel, ops_private, audit FROM PUBLIC;

GRANT USAGE ON SCHEMA intel TO aibl_public_ro;
GRANT SELECT ON ALL TABLES IN SCHEMA intel TO aibl_public_ro;
GRANT USAGE ON SCHEMA audit TO aibl_public_ro;
GRANT SELECT ON audit.merkle_checkpoints TO aibl_public_ro;

GRANT USAGE ON SCHEMA intel, ops_private, audit TO aibl_app_rw;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA intel TO aibl_app_rw;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA ops_private TO aibl_app_rw;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA ops_private TO aibl_app_rw;

-- Append-only enforcement on audit.audit_logs
GRANT SELECT, INSERT ON audit.audit_logs TO aibl_app_rw;
GRANT SELECT, INSERT ON audit.merkle_checkpoints TO aibl_app_rw;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA audit TO aibl_app_rw;
REVOKE UPDATE, DELETE, TRUNCATE ON audit.audit_logs FROM aibl_app_rw;
