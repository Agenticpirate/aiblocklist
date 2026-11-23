# AIBlockList — Implementation Readiness Review (Task E)

- **Review Date:** November 23, 2026
- **Overall Gate Verdict:** **NOT YET AUTHORIZED FOR PRODUCTION CODE (HOLD AT TASK F)**
- **Summary:** The technical architecture, database schema, API contracts, state machines, security invariants, and testing strategy are fully specified and internally consistent. However, **critical founder decisions (`DEC-01`–`DEC-16`), legal counsel reviews (GDPR/DPDP/defamation/entity), Phase 0 behavioral calibration (`<2%` non-native FP), and X API access verification remain open**. Per Section 27 (Task F), no production code or public classification database will be created until you review and sign off on the Founder Decision Register and direct whether to start **Phase 0** or **Phase 1**.

---

## 1. Readiness Classification Matrix

### Category 1: Approved (Immutable Product & Safety Mandates)
*Locked by the Research Blueprint and Enterprise Specification; embedded into all designs:*
- Behavioral-only classification rubric (strict prohibition on stylometric AI-authorship detectors as standalone evidence).
- Zero automatic public classification from community reports; mandatory human governance.
- Mandatory dual independent review for high-impact accounts and independent second-reviewer adjudication for appeals.
- Append-only SHA-256 hash-chained `audit_logs` and non-silent external source attribution (`source_assertions[]`).
- Strict ban on automated DOM-clicking/mass-blocking scripts and gamified reporter leaderboards.
- Strict separation of Code Governance vs. Trust & Safety Governance.
- Exclusion of UI/UX visual design from this backend/system blueprint (handled via separate founder-supplied references).

### Category 2: Ready to Implement (Unblocked Immediately After Phase 0/1 Sign-Off)
*Fully specified with zero external technical blockers once `DEC-01`, `DEC-02`, `DEC-10`, `DEC-13`, `DEC-14` are approved:*
- Monorepo scaffold (`apps/web`, `apps/api`, `apps/worker`, `apps/extension`, `packages/*`, `database/migrations`, `infrastructure/docker`).
- `docker-compose.yml` local stack (`PostgreSQL 16 + pgvector + pg_trgm`, `Valkey`, `MinIO`, `FastAPI`, `ARQ worker`, `Next.js`).
- Phase 1 PostgreSQL 3-schema foundation (`intel`, `ops_private`, `audit`), least-privilege DB roles (`aibl_public_ro`, `aibl_app_rw`), `policy_versions`, `accounts`, `account_handle_history`, `evidence_items`, and serialized SHA-256 `audit_logs` hash chain.
- Phase 1 read-only account lookup API (`/api/v1/accounts/{platform}/{username}`, `/api/v1/accounts/id/{platform}/{id}`, `/api/v1/policies`, `/api/v1/health`, `/api/v1/version`) with OpenAPI 3.1, RFC 9457 Problem Details, ETag caching, and `pg_trgm` search.
- Quiet, fork-safe GitHub Actions CI (`ci-core.yml`, `security-audit.yml`, label-gated `ai-review-assist.yml`, tagged `deploy-prod.yml`) + `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`.
- Core deterministic behavioral signal evaluators (`SIG-01..05`) and ONNX local 384-dim embedding worker framework (thresholds parameterized by `policy_versions`).
- Anti-abuse primitives: canonical URL allowlist parser, PII regex redactor, 24h dedup engine, rotating-salt `ip_subnet_hash`, brigading circuit breaker, and centralized `StateTransitionValidator`.
- Atomic Cloudflare R2/MinIO snapshot + delta builder with SHA-256 manifest verification.

### Category 3: Requires Founder Decision
*Explicitly tracked in [founder-decision-register.md](file:///Users/raviteja/Website%20Projects/Ai%20Block%20List/docs/decisions/founder-decision-register.md):*
- **`DEC-01`**: FastAPI (Python 3.12+) + ARQ vs. NestJS (TS).
- **`DEC-02`**: Primary cloud hosting region (EU vs. US vs. India).
- **`DEC-03`**: Legal entity structure (Non-Profit/Fiscal Sponsor vs. PBC/LLC) & legal counsel budget.
- **`DEC-04`**: Phase 1 seed data strategy (100–250 freshly verified core records only vs. also importing external lists tagged `unverified_external`).
- **`DEC-05`**: Evidence minimization policy (canonical URLs + hashes + metrics + embeddings; MVP screenshot ban).
- **`DEC-06`**: High-impact follower threshold (`10,000` vs. `25,000`).
- **`DEC-07`**: Ratification of 7 classifications, 180-day expiry, 48h triage, 7-business-day appeal SLA, 14-day cooldown, 30-day remediation.
- **`DEC-08`**: Phase 0 sprint approval & Phase 1–2 `$250/month` total (`$100/month` X API) cap.
- **`DEC-09`**: Public REST API v1 schema, rate limits (`60`/`600` rpm), and mandatory legal disclaimer payload.
- **`DEC-10`**: Apache 2.0 + ODC-By 1.0 + DCO + 3 Immutable Charter Red Lines.
- **`DEC-11`**: External source license-verification gate & `>10%` anomaly circuit breaker.
- **`DEC-12`**: MV3 extension permissions & permanent safety bans.
- **`DEC-13`–`DEC-16`**: Meilisearch deferral, `pnpm`/`uv` + `CODEOWNERS`/contact emails, bio-token + OAuth appeal verification, and Phase 5 / Creator Dashboard gating.

### Category 4: Requires Legal Counsel Review (Hard Gate Before Public Launch / Phase 2)
- **EU/UK GDPR:** Formal Article 6(1)(f) Legitimate Interests Assessment (LIA) for indexing public social handles/profiles without blanket public-data exemption; Article 17 erasure & Article 21 objection procedures.
- **India DPDP Act 2023 & DPDP Rules 2025 (commencing May 13, 2027):** Confirmation of inactivity retention schedule (Gazette 3-year notified platform class vs. 1-year general retention summary), 1-year security log retention, standalone consent notice (English + Indian 8th Schedule language option), and Privacy Officer designation.
- **Evidence Erasure Boundary:** Legal determination on whether `content_hash_sha256` and 384-dim `embedding` vectors are exempt or must be nulled upon GDPR Art. 17 erasure / X mandatory post deletion.
- **Defamation & US Section 230(c)(2):** Review of neutral `public_rationale` templates, `meta.disclaimer` wording, and incorporation of the liability-shielding legal entity prior to publishing any public listings.
- **Third-Party List Redistribution:** Legal/license verification before syncing `blockedforaireply.levels.io`, `Clankwall`, `x-slop.com`, or any external source.

### Category 5: Requires Platform Approval
- **X (Phase 2):** Developer account billing cap configuration (`$100/mo`), confirmation of exact self-serve monthly read cap (`2M` vs. `3M`), and application for free **X Public Utility App** exemption.
- **Reddit (Phase 5):** Commercial Data API terms audit and approval prior to paid-tier or commercial ingestion.
- **Threads / Meta (Phase 5):** Meta App Review and production Reply Moderation scopes.
- **Discord (Phase 5):** Privileged Intent eligibility verification for opt-in guild AutoMod tooling.
- **Chrome Web Store & Firefox AMO (Phase 4):** Extension store review and approval (minimal host permissions + privacy policy compliance).

### Category 6: Blocked by External Dependency / Prior Phase Gate
- **Opening Public Community Reporting (Phase 2):** Hard-blocked on **Phase 0 200-Account Behavioral Benchmark** achieving `< 2%` false positives on non-native English writers (`SIG-01..05` threshold calibration) + moderator vetting (`>= 95%` inter-rater agreement) + initial Appeals Panel & Conduct Committee staffing.
- **External Penetration Test (Pre-Phase 3):** Blocked on vendor selection & security audit budget.
- **Meilisearch CE Deployment (Phase 3+):** Blocked on reaching `> 50K` indexed accounts and independent `pg_trgm` vs. Meilisearch benchmark.
- **Optional Creator Protection Dashboard (Phase 4–5):** Blocked on Phase 0 interview demand threshold validation.
- **Cross-Platform Rollout (Phase 5):** Blocked on proven Phase 1–4 sustainability on X and direct primary-doc verification of current 2026 rate-limit quotas for Bluesky, Mastodon, and Telegram.

---

## 2. Recommended Next Action (Task F — Awaiting Founder Direction)

No production application code has been written. To proceed, please:
1. Review the **Founder Decision Register** ([founder-decision-register.md](file:///Users/raviteja/Website%20Projects/Ai%20Block%20List/docs/decisions/founder-decision-register.md)) and confirm your selections (at minimum **`DEC-01` through `DEC-10`** and **`DEC-13`/`DEC-14`** to unblock Phase 1).
2. Confirm whether you want to start with **Phase 0 deliverables** (e.g., Policy v1.0 draft, 200-account benchmark harness & evaluation tooling, interview script, and X Public Utility App technical brief) **or** begin **Phase 1 local engineering foundation** (monorepo, Docker Compose, PostgreSQL 3-schema migrations + triggers, FastAPI read API, quiet CI/CD — keeping any public deployment strictly gated behind Phase 0 legal/benchmark sign-off).
3. Whenever you are ready for the frontend layer, share your separate **UI/UX design specification / references** so `apps/web` adheres strictly to your visual system without modifying these backend and security boundaries.
