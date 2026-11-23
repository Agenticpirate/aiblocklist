# AIBlockList — Architecture Validation Report (Task B)

- **Version:** 1.0
- **Scope:** Engineering validation of the proposed stack, module boundaries, database design, async event model, API contracts, security invariants, deletion feasibility, and MVP budget.
- **Stack Preservation Rule:** The research-recommended stack (`Next.js + React + TS`, `FastAPI Python 3.12+`, `PostgreSQL 16+ with pgvector & pg_trgm`, `Valkey + ARQ`, `Cloudflare R2 + CDN + WAF`, `Docker Compose / portable containers`) is **validated and preserved** without silent substitution.

---

## 1. Validation Summary Scorecard

| Dimension | Verdict | Key Findings & Required Refinements |
|---|---|---|
| **1. Module Boundaries** | **PASS (with refinements)** | Modular monolith is the right architecture for Phases 1–4. Standardized monorepo path to `apps/extension/` (resolving minor doc drift vs. `packages/extension/`). Added explicit import-linter rule forbidding `intel` modules from importing `ops_private` repositories. |
| **2. Database Workflow Support** | **NEEDS SCHEMA HARDENING** | Core 10-table SQL from PDF Deliverable 7 is sound but omits 14 required operational tables from Spec §6.2, lacks handle-history tracking (causing unique-constraint collisions on handle squatting), needs DB-enforced dual-reviewer & independent-appeal-reviewer triggers, and needs a serialized advisory lock on `audit_logs` hash chaining. |
| **3. Async Event & Queue Model** | **PASS (standardize on ARQ)** | Decoupling public intake from X API verification via Valkey prevents cost spikes and latency blocks. Standardize on **ARQ** (native `asyncio`, matches FastAPI, tiny RAM footprint on MVP nodes) rather than Celery. Add explicit dead-letter queues (DLQ) and urgent snapshot rebuild events for appeal delistings. |
| **4. API & Integration Contracts** | **PASS (with additions)** | OpenAPI 3.1 + RFC 9457 + cursor pagination + ETag + R2 snapshots cleanly isolate DB from extension traffic. Added missing appeal ownership-challenge endpoints (`/appeals/verify/init`, `/appeals/verify/confirm`), ID-based lookup (`/accounts/id/{platform}/{id}`), and strict separation of `/api/internal/v1/*` moderator routes. |
| **5. Security Boundary Enforceability** | **PASS (with DB-role isolation)** | Enforcing 3 PostgreSQL schemas (`intel`, `ops_private`, `audit`) with 3 distinct DB roles (`aibl_public_ro`, `aibl_app_rw`, `aibl_migrator`) makes PII leakage and audit tampering structurally impossible even under an API code bug. |
| **6. Data Retention & Deletion Feasibility** | **CONDITIONAL (Legal + Tech)** | Tombstone model (`source_deleted_at`) works cleanly, but requires an automated **minimum-evidence recheck trigger**: if tombstoning drops an account below 2 valid evidence items, it must automatically move to `under_review`. Also requires legal confirmation on whether SHA-256 hashes & 384-dim embeddings must be nulled on GDPR/X deletion. |
| **7. MVP Budget & X API Economics** | **PASS (with hard circuit breakers)** | \$145–\$230/mo estimate (\$80/mo X API for ~500 escalated reviews at \$0.16/review + \$65–\$150/mo infra) is realistic **only if** hard daily/monthly spend caps, 24h UTC deduplication, and low-standing reporter gating prevent report floods from invoking the X API. |

---

## 2. Detailed Engineering Findings & Architectural Refinements

### 2.1 Module Boundary & Monorepo Alignment
- **Finding (Minor Path Drift):** PDF pages 32 & 54 reference `packages/extension/`, whereas Enterprise Spec §4 places the browser extension at `apps/extension/`.
  - **Resolution:** Standardize on `apps/extension/` (deployable application), while `packages/` strictly holds shared libraries (`packages/contracts`, `packages/shared-types`, `packages/api-client`, `packages/sdk`).
- **Trust Boundary Enforcement Inside Modular Monolith:**
  - Every FastAPI module under `apps/api/app/modules/*` communicates via typed service contracts (Pydantic models), never by reaching across into another module's SQLAlchemy models directly.
  - **Public vs. Private Isolation:** Public read endpoints (`accounts`, `blocklists`, `categories`, `sources`, `transparency`) use a dedicated read-only SQLAlchemy session bound to PostgreSQL role `aibl_public_ro`, which has **zero `SELECT` privilege** on `ops_private.*`.

### 2.2 Critical Database Schema Gaps Caught & Resolved
Reviewing PDF Deliverable 7 SQL (pp. 33–37) against Spec §5–§18 surfaced **six critical database invariants** that must be built into the Phase 1–2 schema before any code runs:

1. **Handle Squatting vs. `UNIQUE (platform, normalized_username)` Collision:**
   - *Problem:* If listed bot `@bot123` (`platform_account_id = '111'`) renames to `@bot999`, and an innocent user (`platform_account_id = '222'`) registers `@bot123`, a naive unique constraint on `(platform, normalized_username)` breaks or causes mistaken identity attribution.
   - *Fix:*
     - Keep `UNIQUE (platform, platform_account_id) WHERE platform_account_id IS NOT NULL`.
     - Make `UNIQUE (platform, normalized_username) WHERE is_handle_current = TRUE` a **partial unique index**, add `identity_confidence` (`immutable_id`, `handle_only_unverified`), and add `intel.account_handle_history` to record verified handle changes cleanly without misattributing reassigned handles.
2. **Audit Log Hash Chain Race Condition:**
   - *Problem:* Computing `record_hash = SHA256(prev_hash || canonical_payload)` inside concurrent web/worker transactions will read stale `prev_hash` values and fork the chain.
   - *Fix:* Implement the chain insert inside a PostgreSQL `BEFORE INSERT` trigger (or centralized DB function) that acquires `pg_advisory_xact_lock(hashtext('audit_logs_chain'))`, reads the tip row's `record_hash`, computes the SHA-256 hash using deterministic `jsonb` serialization, and writes atomically.
3. **Dual-Reviewer & Independent Appeal Reviewer Invariants:**
   - *Problem:* PDF p. 36 checks `assigned_reviewer_id != original moderation_decisions.reviewer_id`, but for high-impact accounts there are **two** original reviewers (`reviewer_id` and `second_reviewer_id`). Both must be excluded from adjudicating the appeal!
   - *Fix:*
     - Add `CHECK (second_reviewer_id IS NULL OR second_reviewer_id <> reviewer_id)` on `ops_private.moderation_decisions`.
     - Add DB trigger `trg_enforce_publication_gate` on `intel.accounts`: blocks transitioning into any public-listed state (`confirmed_automated_spam`, `repetitive_engagement_farming`, `coordinated_manipulation`) unless: (a) `policy_version_id IS NOT NULL`, (b) >= 2 non-tombstoned `intel.evidence_items` exist, (c) a matching `moderation_decisions` row exists, and (d) if `is_high_impact = TRUE`, `second_reviewer_id IS NOT NULL`.
     - Add DB trigger `trg_enforce_independent_appeal_reviewer` on `ops_private.appeals`: ensures `assigned_reviewer_id` does not match *either* `reviewer_id` or `second_reviewer_id` of the contested decision.
4. **Evidence Tombstone Minimum-Evidence Cascade:**
   - *Problem:* Under X's mandatory deletion policy, if an author deletes a cited tweet and AIBlockList sets `source_deleted_at`, an account previously backed by 2 URLs now has only 1 active evidence item.
   - *Fix:* When `evidence_tombstone_audit` marks an evidence item deleted, it counts remaining active `evidence_items` for that `account_id`. If `< 2` remain for a confirmed account, an event (`evidence.below_minimum`) automatically transitions the account to `under_review`, logs an audit entry, and queues human re-verification (or delisting if no corroborating behavioral evidence remains).
5. **14 Additional Operational Tables from Spec §6.2:**
   - Fully modeled in [database-design.md](file:///Users/raviteja/Website%20Projects/Ai%20Block%20List/docs/architecture/database-design.md): `users`, `roles`, `permissions`, `user_roles`, `role_permissions`, `user_sessions`, `api_keys`, `notification_preferences`, `notifications`, `source_sync_runs`, `verification_jobs`, `snapshot_versions`, `security_events`, `rate_limit_events`, `platform_api_usage`, `data_deletion_requests`, plus `appeal_verification_challenges`, `behavioral_signals`, and `coordinated_clusters` / `coordinated_cluster_members`.
6. **Rotating Salted `ip_subnet_hash` (30-Day TTL):**
   - Store rotating daily/weekly HMAC salts in Valkey / `ops_private.hash_salts` with automatic 30-day purge so IP subnet hashes remain correlatable inside 15-minute brigading windows while automatically expiring without retaining raw IP addresses.

### 2.3 Queue Framework Validation: ARQ vs. Celery
- **Recommendation:** Standardize on **ARQ** (backed by Valkey) for Phases 1–4.
  - **Why:** FastAPI is natively `async`/`await`; ARQ shares the exact same `asyncio` event loop, async SQLAlchemy/asyncpg pools, and `httpx` clients without Celery's prefork/gevent memory bloat (~50 MB vs. ~250–400 MB on small 2–4 GB MVP containers). Built-in cron scheduling, retries with exponential backoff, and job-ID deduplication match every requirement in Spec §3 & §19.
  - **Fallback/Scale Path:** Job handlers live as pure async domain functions in `apps/worker/jobs/`, keeping queue plumbing thin so migrating to Temporal or Celery at high scale requires zero domain-logic rewrites.

### 2.4 Urgent Delisting vs. Hourly Snapshot Cadence
- **Finding:** Hourly R2 snapshots + 6-hour extension polling are ideal for steady-state efficiency, **but** if an innocent user wins an appeal or is marked `temporarily_withheld`, waiting up to 1 hour to rebuild the snapshot prolongs reputational harm.
- **Resolution:**
  - Trigger an **out-of-band priority job (`build_urgent_delist_delta`)** immediately on any transition to `temporarily_withheld`, `cleared`, or `delisted`.
  - Immediately purge the Cloudflare CDN cache key for `/api/v1/accounts/{platform}/{username}` and `/api/v1/accounts/id/{platform}/{id}` via Cloudflare API.
  - Publish an immediate delta + refreshed `latest.json.gz` within `< 2 minutes` of reversal.

### 2.5 Budget & X API Cost Protection Validation
- **Math Verification (MVP Phase 1–2):**
  - Target cap: \$100/mo X API (~625 escalated verifications/mo at \$0.16/account = 1 profile read @ \$0.010 + 30 reply reads @ \$0.005).
  - Compute (2 small containers on Hetzner/Fly.io): \$25–\$50/mo.
  - Managed PostgreSQL (`pgvector`) + Valkey: \$25–\$40/mo.
  - Cloudflare R2 (zero egress) + Free/Pro WAF/CDN: \$0–\$20/mo.
  - Observability/Email/Backups: \$15–\$25/mo.
  - Optional LLM assist (escalated cases only): \$0–\$15/mo.
  - **Total:** \$145–\$230/mo — **fits within the \$250/mo Phase 1–2 ceiling**, *provided* three guardrails are enforced in code:
    1. **Hard Budget Circuit Breaker:** `platform_api_usage` tracks real-time spend per UTC day and billing cycle. At 80% of cap -> admin alert; at 100% of cap -> pause automated X verification queue (`escalated_budget_paused`), never silently scrape.
    2. **24h UTC Dedup Alignment:** Valkey tracks `(platform, post_id, utc_date)` and `(platform, account_id, utc_date)` so re-fetches never double-charge within X's 24h UTC billing window.
    3. **CDN Cache Shielding in Front of R2:** At Growth/Scale (50K–250K extensions), route all snapshot/manifest reads through Cloudflare CDN (`Cache-Control: public, max-age=300`) in front of R2 so R2 Class B read operations stay negligible.

### 2.6 Local Embedding Model Memory Validation
- Running `sentence-transformers` (e.g., `all-MiniLM-L6-v2` or `BAAI/bge-small-en-v1.5`, 384 dims) via **ONNX Runtime (`fastembed` / `onnxruntime`)** on CPU avoids pulling multi-GB PyTorch CUDA wheels, cuts worker container RAM from ~1.5 GB down to ~250–350 MB, and embeds 30 replies in <150 ms on 2 vCPU — cleanly fitting the \$25–\$50/mo MVP compute budget.
