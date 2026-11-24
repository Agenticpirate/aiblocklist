# Graph Report - Ai Block List  (2026-11-25)

## Corpus Check
- 93 files · ~174,385 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 13 file(s) not represented in the graph (top: (none) 5, .css 2, .example 1)

## Summary
- 750 nodes · 1485 edges · 58 communities (44 shown, 14 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 67 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9d5563d7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- accounts/router.py
- package.json
- @phosphor-icons/react
- PART B — Visual system
- sync_service.py
- reports/router.py
- test_invariants.py
- ci-core.yml
- Figma Designer
- ActionableHub.tsx
- manifest.json
- models.py
- api.ts
- compilerOptions
- README.md
- 2. Public REST API v1 Endpoint Reference
- main.py
- react
- [username]/page.tsx
- QuickCheckModal.tsx
- signals.py
- AIBlockList — Database Design, ERD & Migration Plan (Task C.3, C.4)
- AIBlockList — Final System & Deployment Architecture (Task C.1, C.2, C.9)
- AIBlockList — Testing, Behavioral Benchmark & Release Strategy (Task C.10)
- 2. Detailed Engineering Findings & Architectural Refinements
- 1. Readiness Classification Matrix
- database.py
- AIBlockList.com — Production Deployment Blueprint
- web
- api
- 1. Domain State Machines (Task C.6)
- Contributor Covenant Code of Conduct
- UI/UX Tools, Component Libraries & Design Resources
- services
- minio
- postgres
- list_sources
- api-docs/page.tsx
- AIBlockList — Security Threat Model, Privacy Governance & SIRP (Task C.8)
- 🛡️ Reporting a Vulnerability
- Build with ui-sdk
- sync_cli.py
- healthcheck
- docs/README.md
- SlidingWindowRateLimiter
- content.js
- ReportPage
- environment
- vercel.json
- Settings
- background.js
- route.ts
- ScrollReveal.tsx
- TaglineReveal.tsx
- postcss.config.mjs
- aiblocklist-api

## God Nodes (most connected - your core abstractions)
1. `ProblemDetailError` - 36 edges
2. `@phosphor-icons/react` - 31 edges
3. `Account` - 26 edges
4. `XLogo()` - 23 edges
5. `next` - 22 edges
6. `react` - 22 edges
7. `Base` - 21 edges
8. `ingest_blockedforaireply_seed()` - 20 edges
9. `sync_blockedforaireply()` - 20 edges
10. `append_audit_log()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `2. Master Requirements Traceability Matrix` --references--> `verify_audit_chain()`  [INFERRED]
  docs/architecture/requirements-inventory.md → apps/api/app/core/audit.py
- `verify_audit_chain()` --uses--> `AuditLog`  [INFERRED]
  apps/api/app/core/audit.py → apps/api/app/core/models.py
- `lifespan()` --uses--> `Base`  [INFERRED]
  apps/api/app/main.py → apps/api/app/core/database.py
- `SlidingWindowRateLimiter` --uses--> `ProblemDetailError`  [INFERRED]
  apps/api/app/core/rate_limit.py → apps/api/app/core/errors.py
- `get_account_by_platform_id()` --uses--> `ProblemDetailError`  [INFERRED]
  apps/api/app/modules/accounts/router.py → apps/api/app/core/errors.py

## Import Cycles
- None detected.

## Communities (58 total, 14 thin omitted)

### Community 0 - "accounts/router.py"
Cohesion: 0.15
Nodes (25): compute_record_hash(), verify_audit_chain(), ExternalListEntry, hash_ip_subnet(), _apply_public_cache_headers(), _check_public_rate_limit(), export_blocklist(), get_account_by_platform_id() (+17 more)

### Community 1 - "package.json"
Cohesion: 0.07
Nodes (36): dependencies, framer-motion@^12.4.7, geist@^1.3.1, next@^15.2.0, @phosphor-icons/react@^2.1.7, react@^19.0.0, react-dom@^19.0.0, devDependencies (+28 more)

### Community 2 - "@phosphor-icons/react"
Cohesion: 0.08
Nodes (17): nextConfig, metadata, metadata, metadata, metadata, RootLayout(), metadata, SIGNALS (+9 more)

### Community 3 - "PART B — Visual system"
Cohesion: 0.06
Nodes (35): A1. Intake, A2. Page structure, A3. Layout selection, A4. Conversion rules, A5. Copywriting, A6. Build order, A7. SEO and AEO, A8. Pitfalls (+27 more)

### Community 4 - "sync_service.py"
Cohesion: 0.13
Nodes (16): append_audit_log(), EvidenceItem, ExternalSource, new_uuid(), PolicyVersion, SourceSyncRun, ensure_policy_and_sources(), ingest_blockedforaireply_seed() (+8 more)

### Community 5 - "reports/router.py"
Cohesion: 0.16
Nodes (17): Account, Appeal, AppealVerificationChallenge, normalize_username(), sha256_hex(), AppealSubmitRequest, AppealVerifyConfirmRequest, AppealVerifyInitRequest (+9 more)

### Community 6 - "test_invariants.py"
Cohesion: 0.15
Nodes (16): ProblemDetailError, canonicalize_account_url(), canonicalize_evidence_url(), canonicalize_threads_account_url(), canonicalize_threads_evidence_url(), canonicalize_x_account_url(), canonicalize_x_evidence_url(), redact_pii() (+8 more)

### Community 7 - "ci-core.yml"
Cohesion: 0.08
Nodes (26): defaults, runs-on, steps, concurrency, cancel-in-progress, group, run, jobs (+18 more)

### Community 8 - "Figma Designer"
Cohesion: 0.08
Nodes (24): Checklist (run before reporting), Color, Color, Components and states, Content, Contrast and accessibility, Corner radius, Figma Designer (+16 more)

### Community 9 - "ActionableHub.tsx"
Cohesion: 0.28
Nodes (16): DirectoryPage(), ActionableHub(), PlatformReportModal(), ReportTab, PlatformSlideControl(), PlatformSlideControlProps, ThreadsLogo(), XLogo() (+8 more)

### Community 10 - "manifest.json"
Cohesion: 0.09
Nodes (21): action, default_icon, default_popup, default_title, background, service_worker, content_scripts, 128 (+13 more)

### Community 11 - "models.py"
Cohesion: 0.17
Nodes (9): Base, AccountHandleHistory, ApiKey, AuditLog, ModerationDecision, Report, Reporter, utcnow() (+1 more)

### Community 12 - "api.ts"
Cohesion: 0.15
Nodes (16): getInitialBlocklist(), getLiveStats(), HomePage(), ReportResult, loadTransparency(), TransparencyPage(), TweetEvidenceCardProps, API_BASE_URL (+8 more)

### Community 13 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 14 - "README.md"
Cohesion: 0.11
Nodes (17): Contributing to AIBlockList, 📋 Development Workflow, 🛠️ How You Can Contribute, ⚖️ License Grant, 1. Clone the Repository, 2. Backend Setup (FastAPI), 3. Frontend Setup (Next.js 15), 📡 API Reference (+9 more)

### Community 15 - "2. Public REST API v1 Endpoint Reference"
Cohesion: 0.12
Nodes (15): 1. Authentication, Rate Limits & Caching Policy, 2.1 Account Intelligence, 2.2 Blocklists, Categories, Sources & Transparency, 2.3 Community Reports, 2.4 Account Ownership Verification & Appeals, 2.5 Internal Authenticated Endpoints (`/api/internal/v1/*`, Never CDN-Cached), 2. Public REST API v1 Endpoint Reference, 3. RFC 9457 Problem Details Error Taxonomy (+7 more)

### Community 16 - "main.py"
Cohesion: 0.18
Nodes (5): register_exception_handlers(), health_check(), lifespan(), version_info(), run_periodic_federation_sync()

### Community 17 - "react"
Cohesion: 0.22
Nodes (11): AccountHealthPage(), HealthCheckResult, ActionableHubProps, AlgoIntelligencePlaybook(), AutoReportButtonProps, PlatformReportModalProps, COMMON_BOT_CLICHES, EvaluationResult (+3 more)

### Community 18 - "[username]/page.tsx"
Cohesion: 0.25
Nodes (10): AccountDetailPage(), fetchAccount(), generateMetadata(), AutoReportButton(), HeroInspector(), SAMPLE_HANDLES, ShareButton(), ShareButtonProps (+2 more)

### Community 19 - "QuickCheckModal.tsx"
Cohesion: 0.20
Nodes (8): AppealConfirmation, AppealsContent(), AppealsPage(), ChallengeInit, QuickCheckModal(), QuickCheckModalProps, QuickCheckTriggerButton(), XSuspensionGuide()

### Community 20 - "signals.py"
Cohesion: 0.22
Nodes (7): cosine_similarity(), evaluate_behavioral_signals(), ReplySample, SignalResult, structural_skeleton(), _tf_vector(), test_behavioral_signal_engine_timing_never_triggers_alone()

### Community 21 - "AIBlockList — Database Design, ERD & Migration Plan (Task C.3, C.4)"
Cohesion: 0.17
Nodes (11): 1. Three-Schema Security Isolation & Role Matrix, 2. Entity Relationship Diagram (ERD), 3.1 Custom ENUM Types, 3.2 `intel` Schema (Public Intelligence — Zero Private PII), 3.3 `ops_private` Schema (Strictly Restricted Operational & PII Data), 3.4 `audit` Schema (Append-Only Cryptographic Trail), 3. Complete Table & Constraint Specification, 4. Mandatory Database-Level Triggers & Invariants (+3 more)

### Community 22 - "AIBlockList — Final System & Deployment Architecture (Task C.1, C.2, C.9)"
Cohesion: 0.17
Nodes (11): 1. Six-Layer System Architecture & Trust Boundaries, 2. Service & Module Dependency Diagram, 3. Platform Adapter Interface Contract, 4. Browser Extension Local-First Architecture (Phase 4), 5. Deployment & Infrastructure Architecture (Task C.9), AIBlockList — Final System & Deployment Architecture (Task C.1, C.2, C.9), Layer Responsibilities & Technology Matrix, Local Development Topology (`docker compose up --build`) (+3 more)

### Community 23 - "AIBlockList — Testing, Behavioral Benchmark & Release Strategy (Task C.10)"
Cohesion: 0.18
Nodes (10): 1. Multi-Tier Testing Pyramid, 2. Phase 0 Behavioral Accuracy Benchmark (Hard Pre-Phase-2 Gate), 3. Quiet "Automation Without Spam" CI/CD & Release Pipeline, 4. Observability, Operational Objectives & Cost Governance, AIBlockList — Testing, Behavioral Benchmark & Release Strategy (Task C.10), Branch Protection & `CODEOWNERS`, Hard X API Cost Circuit Breaker, Initial Operational Targets (Measured in Production — Never Advertised as SLA Until Verified) (+2 more)

### Community 24 - "2. Detailed Engineering Findings & Architectural Refinements"
Cohesion: 0.20
Nodes (9): 1. Validation Summary Scorecard, 2.1 Module Boundary & Monorepo Alignment, 2.2 Critical Database Schema Gaps Caught & Resolved, 2.3 Queue Framework Validation: ARQ vs. Celery, 2.4 Urgent Delisting vs. Hourly Snapshot Cadence, 2.5 Budget & X API Cost Protection Validation, 2.6 Local Embedding Model Memory Validation, 2. Detailed Engineering Findings & Architectural Refinements (+1 more)

### Community 25 - "1. Readiness Classification Matrix"
Cohesion: 0.20
Nodes (9): 1. Readiness Classification Matrix, 2. Recommended Next Action (Task F — Awaiting Founder Direction), AIBlockList — Implementation Readiness Review (Task E), Category 1: Approved (Immutable Product & Safety Mandates), Category 2: Ready to Implement (Unblocked Immediately After Phase 0/1 Sign-Off), Category 3: Requires Founder Decision, Category 4: Requires Legal Counsel Review (Hard Gate Before Public Launch / Phase 2), Category 5: Requires Platform Approval (+1 more)

### Community 27 - "AIBlockList.com — Production Deployment Blueprint"
Cohesion: 0.22
Nodes (8): 1. Architecture Topology, 2. Frontend Deployment (Vercel), 3. Backend Deployment (Railway, Render, or Fly.io), 4. Browser Extension Distribution, 5. Pre-Launch Verification Checklist, AIBlockList.com — Production Deployment Blueprint, Option A: Railway (Fastest), Option B: Docker Compose Single-Node Server (Hetzner / DigitalOcean / AWS EC2)

### Community 28 - "web"
Cohesion: 0.25
Nodes (9): build, context, dockerfile, NEXT_PUBLIC_API_BASE_URL, web, build, depends_on, environment (+1 more)

### Community 29 - "api"
Cohesion: 0.22
Nodes (9): depends_on, env_file, ports, volumes, postgres, valkey, condition, api (+1 more)

### Community 30 - "1. Domain State Machines (Task C.6)"
Cohesion: 0.22
Nodes (8): 1.1 Account Lifecycle & 7-State Classification Machine, 1.2 Community Report & Brigading State Machine, 1.3 Appeal & Ownership Verification Lifecycle, 1.4 External Source Synchronization State Machine, 1. Domain State Machines (Task C.6), 2. Asynchronous Event & Background Job Catalog (Task C.7), AIBlockList — Domain State Machines & Event Catalog (Task C.6, C.7), Hard Classification Invariants

### Community 31 - "Contributor Covenant Code of Conduct"
Cohesion: 0.25
Nodes (7): Attribution, Contributor Covenant Code of Conduct, Enforcement, Enforcement Responsibilities, Our Pledge, Our Standards, Scope

### Community 32 - "UI/UX Tools, Component Libraries & Design Resources"
Cohesion: 0.25
Nodes (7): 1. Website & Landing Page Inspiration, 2. UI Components & React Libraries, 3. Design Assets, Typography, Graphics & Resources, 4. Apps, Communities & Other Tools, 5. Additional Curated Threads & Inspiration, Installed Open-Source Repositories & Agent Skills, UI/UX Tools, Component Libraries & Design Resources

### Community 33 - "services"
Cohesion: 0.25
Nodes (7): services, valkey, image, ports, volumes, minio_data, pg_data

### Community 34 - "minio"
Cohesion: 0.25
Nodes (8): MINIO_ROOT_PASSWORD, MINIO_ROOT_USER, command, environment, image, ports, volumes, minio

### Community 35 - "postgres"
Cohesion: 0.25
Nodes (8): POSTGRES_DB, POSTGRES_PASSWORD, POSTGRES_USER, environment, image, ports, volumes, postgres

### Community 37 - "api-docs/page.tsx"
Cohesion: 0.38
Nodes (4): ApiDocsPage(), ENDPOINTS, CodeHandoff(), SNIPPETS

### Community 38 - "AIBlockList — Security Threat Model, Privacy Governance & SIRP (Task C.8)"
Cohesion: 0.29
Nodes (7): 1. Threat Model Matrix, 2. Authentication, Authorization & Privilege Separation Matrix, 3.1 Strict Public vs. Private Data Split, 3.2 Deletion & Tombstone Service (`ops_private.data_deletion_requests`), 3. Privacy Governance, Data Minimization & Deletion Lifecycle, 4. Security Incident Response Plan (SIRP), AIBlockList — Security Threat Model, Privacy Governance & SIRP (Task C.8)

### Community 39 - "🛡️ Reporting a Vulnerability"
Cohesion: 0.29
Nodes (6): How to Report, Our Commitment, 🛡️ Reporting a Vulnerability, Security Policy, 🔒 Supported Versions, What to Include

### Community 40 - "Build with ui-sdk"
Cohesion: 0.33
Nodes (5): Build with ui-sdk, Pick your path, Read first, Rules for every path, When you're done

### Community 42 - "healthcheck"
Cohesion: 0.53
Nodes (6): interval, retries, test, timeout, healthcheck, healthcheck

### Community 43 - "docs/README.md"
Cohesion: 0.33
Nodes (3): AIBlockList — Founder Decision Register (Task D), AIBlockList.com — Pre-Implementation Engineering Documentation Index, Pre-Implementation Package (Section 27: Tasks A–F)

### Community 45 - "content.js"
Cohesion: 0.70
Nodes (4): getPlatform(), injectWarningBadge(), observer, processHandleLinks()

### Community 47 - "environment"
Cohesion: 0.40
Nodes (5): environment, APP_ENV, DATABASE_URL, PUBLIC_READ_DATABASE_URL, VALKEY_URL

### Community 48 - "vercel.json"
Cohesion: 0.50
Nodes (3): buildCommand, cleanUrls, framework

## Knowledge Gaps
- **1 isolated node(s):** `aiblocklist-api`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 343 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `verify_audit_chain()` connect `accounts/router.py` to `models.py`, `test_invariants.py`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **Are the 13 inferred relationships involving `ProblemDetailError` (e.g. with `SlidingWindowRateLimiter` and `get_account_by_platform_id()`) actually correct?**
  _`ProblemDetailError` has 13 INFERRED edges - model-reasoned connections that need verification._
- **What connects `aiblocklist-api` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `accounts/router.py` be split into smaller, more focused modules?**
  _Cohesion score 0.14709851551956815 - nodes in this community are weakly interconnected._
- **Are the 14 inferred relationships involving `Account` (e.g. with `export_blocklist()` and `get_account_by_platform_id()`) actually correct?**
  _`Account` has 14 INFERRED edges - model-reasoned connections that need verification._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.06827880512091039 - nodes in this community are weakly interconnected._
- **Should `@phosphor-icons/react` be split into smaller, more focused modules?**
  _Cohesion score 0.07507507507507508 - nodes in this community are weakly interconnected._