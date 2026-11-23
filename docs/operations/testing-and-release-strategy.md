# AIBlockList — Testing, Behavioral Benchmark & Release Strategy (Task C.10)

- **Core Rule (Definition of Done):** No feature is complete merely because code exists. Every change requires passing unit, integration, contract, security/adversarial tests, and zero PII leakage verification.

---

## 1. Multi-Tier Testing Pyramid

| Tier | Tools | Mandatory Coverage Scope | CI Execution |
|---|---|---|---|
| **1. Unit Tests** | `pytest` (Python, `mypy --strict`, `ruff`), `vitest` (TS/Web/Extension) | Account/URL canonicalization, `PlatformAdapter` allowlist parsers, 7-state transition validator, `SIG-01..05` deterministic evaluators, reporter standing math, 24h dedup keys, rate-limit calculators, appeal 14d cooldown, SHA-256 audit hash determinism, PII regex redaction. Target: **>85% coverage** on schema, auth, and domain logic. | Every PR (`ci-core.yml`, path-filtered, `<3 min`) |
| **2. Integration Tests** | `pytest` + ephemeral PostgreSQL 16 (`pgvector`/`pg_trgm`) + Valkey + MinIO containers | Alembic `upgrade -> downgrade -> upgrade` round-trip; PostgreSQL role isolation (`aibl_public_ro` denied `ops_private`; `aibl_app_rw` denied `UPDATE/DELETE` on `audit.audit_logs`); DB triggers (publication gate >=2 evidence, high-impact dual-reviewer gate, independent appeal reviewer `!= reviewer_id & second_reviewer_id`, concurrent `audit_logs` hash-chain lock); ARQ worker retry & DLQ; atomic R2/MinIO snapshot build + rollback on corrupt build; mocked X API budget circuit breaker. | Every PR touching `apps/api/**` or `database/**` |
| **3. API Contract & Load Tests** | OpenAPI 3.1 schema validator (`schemathesis`), `k6` / `locust` | Strict adherence to OpenAPI 3.1 schemas, RFC 9457 `application/problem+json` errors, cursor pagination (`max=500`), `ETag`/`If-None-Match` `304`, zero PII fields in public payloads, Phase 3 load target (`1,000 req/s` CDN cached `<100–300ms p95`, core DB `<500ms p95`). | Contract on PR; load tests pre-Phase-3 & pre-release |
| **4. Security & Adversarial Tests** | `gitleaks`, `pip-audit`, `pnpm audit`, CodeQL SAST, custom red-team suite | SQLi, XSS, SSRF (attempt arbitrary/private IP URLs in `POST /reports`), CSRF, RBAC/MFA bypass, OWASP LLM01/02 prompt injection payloads inside bios/replies/appeals, report brigading flood (>5/15m), handle-squatting rename attack, fraudulent appeal token replay, malicious external feed >10% poisoning, audit row tampering detection. | Security scans on PR + weekly quiet run; full red-team suite before Phase 2; external pen-test before Phase 3 |
| **5. Extension & E2E Tests** | Playwright (Web + Chrome/Firefox MV3 extension DOM fixtures) | Search & evidence viewer E2E, WCAG 2.1 AA accessibility audit; MV3 extension DOM matching on static X fixtures, Shadow DOM isolation, ETag/delta sync rollback on corrupted SHA-256, **network-capture privacy audit proving zero per-post feed exfiltration**, and assertion of zero native Block/Mute DOM clicks. | Phase 1 (Web E2E) & Phase 4 (Extension E2E + Privacy Audit) |

---

## 2. Phase 0 Behavioral Accuracy Benchmark (Hard Pre-Phase-2 Gate)

Before opening public community reporting in Phase 2, AIBlockList must build and publish an independently reviewable **200-Account Ground-Truth Calibration Benchmark**:

| Cohort | Sample Size | Purpose |
|---|---|---|
| **Verified Automated Spam / Bot Accounts** | 100 | Measures recall & sensitivity across `SIG-01`–`SIG-05` |
| **Non-Native English Writers Using AI Writing Aids** | 50 | **Hard Bias Gate:** directly tests against the Liang et al. (2023) failure mode |
| **Normal Human / Ambiguous / Multi-Timezone Team Accounts** | 50 | Tests false-positive resilience against brand support teams, RSS feeds, and active conversationalists |

### Mandatory Validation Gate & Reproducibility Rules
- **Hard Release Gate:** False-positive rate on the **50 non-native English writer cohort MUST be `< 2%`** (i.e., `<= 0` or at most `1` flagged account in calibration, with root cause fixed before launch).
- **Metrics Recorded:** Per-signal precision, recall, F1, false-positive rate per cohort, confidence calibration curve, and inter-rater moderator agreement (**>= 95% agreement** required for moderator vetting).
- **Reproducibility Metadata:** Every run logs exact `policy_version`, `embedding_model`, `embedding_model_version`, `dimensions (384)`, preprocessing steps, and dataset snapshot hash.
- **Honesty Constraint:** Benchmark results must explicitly note sample scope and never be marketed as universal accuracy.

---

## 3. Quiet "Automation Without Spam" CI/CD & Release Pipeline

| Workflow | Trigger | Anti-Spam & Security Rules | Gate |
|---|---|---|---|
| `ci-core.yml` | `pull_request` -> `main` (path-filtered) | `concurrency: cancel-in-progress: true`; reports **one concise GitHub Check Run**; **zero bot PR comments**; fork-safe (`pull_request`, read-only `GITHUB_TOKEN`, zero secrets). | Required green status before human merge |
| `security-audit.yml` | `pull_request` (code/deps) + quiet Monday cron | Runs Gitleaks, `pip-audit`/`pnpm audit`, SPDX license compatibility check (flags GPL/AGPL/BUSL incompatibilities), CodeQL SAST. **Never auto-creates issues or PRs.** | Hard block on High/Critical CVEs or leaked secrets |
| `ai-review-assist.yml` | **Strictly manual opt-in** (only when maintainer applies label `needs-ai-review`) | Single collapsed summary comment updated in-place, explicitly prefixed: *"Advisory AI suggestion only — non-authoritative."* Checks prompt-injection, SQLi/SSRF, missing tests. | Zero merge authority |
| `deploy-prod.yml` | Manual `workflow_dispatch` or signed semver tag (`v*.*.*`) on `main` only | Serialized queue (`cancel-in-progress: false`); builds immutable Docker images, SBOM, `cosign` attestation -> deploys staging -> smoke tests -> waits for approval -> deploys production. | **Mandatory GitHub Environment human approval** by Core Maintainer(s) |

### Branch Protection & `CODEOWNERS`
- Direct pushes to `main` blocked.
- Standard PRs require >= 1 Maintainer approval + green `ci-core` + DCO `Signed-off-by`.
- **Sensitive Paths (require 2 Core Maintainer approvals):** `/apps/api/app/modules/authentication/`, `/database/migrations/`, `/apps/api/app/modules/moderation/`, `/apps/api/app/schemas/`, `/.github/workflows/`, `/infrastructure/`.

---

## 4. Observability, Operational Objectives & Cost Governance

### Structured Zero-PII Telemetry
- Emit structured JSON logs with `request_id`, `module`, `status`, `latency_ms` — **strictly scrubbing** emails, raw IPs, tokens, and raw post text before logging.
- Core dashboards cover: API volume/errors/p95/cache-hit, report intake/dedup/brigading quarantines, X API reads/unit spend/queue depth, moderator backlog/median review time/reversal rate, source sync anomaly trips, and PostgreSQL/Valkey/backup health.

### Initial Operational Targets (Measured in Production — Never Advertised as SLA Until Verified)
- Public API availability: `99.9%` | Cached lookup p95: `< 300 ms` | Core DB lookup p95: `< 500 ms` | Report ack: `< 2 s` | Backup RPO: `<= 24 h` | RTO: `<= 4 h`.

### Hard X API Cost Circuit Breaker
- MVP monthly verification ceiling: **`$100/month`** (inside `$250/month` total Phase 1–2 cap) configured in **both** X Developer Console AND `ops_private.platform_api_usage` application guard.
- Alerts at `50%`, `80%`, `95%`; hard automatic pause of nonessential verification jobs at `100%` (never falls back to unauthorized scraping).
