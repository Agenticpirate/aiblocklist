# AIBlockList — Public & Internal API Contract (Task C.5)

- **Specification Standard:** OpenAPI 3.1 (auto-generated from FastAPI Pydantic v2 schemas, served via Scalar/Swagger at `/docs`)
- **Base URL (Public):** `https://api.aiblocklist.com/api/v1`
- **Base URL (CDN Snapshots):** `https://cdn.aiblocklist.com/v1`
- **Versioning Policy:** URI path versioning (`/api/v1`), minimum 6-month deprecation window on breaking changes.
- **Error Format:** RFC 9457 Problem Details (`Content-Type: application/problem+json`)
- **Pagination:** Cursor-based (`?cursor=<opaque_base64>&limit=100`, max `500`)

---

## 1. Authentication, Rate Limits & Caching Policy

| Context | Auth Mechanism | Default Rate Limit (Configurable) | Caching Policy |
|---|---|---|---|
| **Public Read (Anonymous)** | None | `60 req/min/IP` | `Cache-Control: public, max-age=300, stale-while-revalidate=600` + strong `ETag` (`If-None-Match` -> `304`) |
| **Public Read (Registered Key)** | `Authorization: Bearer aibl_live_<token>` | `600 req/min/key` | Same as above; higher tiers via Developer/Enterprise plans |
| **Static Reference Reads** (`/categories`, `/sources`, `/statistics`, `/policies`) | Public / Key | Same | CDN-cached (`24h` categories/policies, `1h` sources, `15m` statistics) |
| **Report Intake** (`POST /reports`) | Cloudflare Turnstile token OR API Key (+ optional `X-AIBL-Signature` HMAC-SHA256) | `20 req/hr/IP` (higher for high-standing keys) | `Cache-Control: no-store` |
| **Appeal Session** (`POST/GET /appeals`) | Verified Appellant Session Bearer token (OAuth or consumed bio-challenge) | `1 active appeal / account / 14 days` | `Cache-Control: no-store, private` |
| **Internal Moderation / Admin** (`/api/internal/v1/*`) | Short-lived session + **Mandatory WebAuthn/TOTP MFA** + RBAC | Scoped + anomaly alert (`>25 status flips/hr`) | `Cache-Control: no-store, private` (bypasses CDN) |

All rate-limited responses include standard `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`, and `Retry-After` headers.

---

## 2. Public REST API v1 Endpoint Reference

### 2.1 Account Intelligence
| Method & Path | Query Params | Response & Semantics |
|---|---|---|
| `GET /api/v1/accounts/{platform}/{username}` | `include_sources=true`, `include_history=true` | `200 OK` with canonical account record, `evidence[]`, `source_assertions[]`, `has_source_conflict`, `meta.disclaimer`. **`404 Not Found` (`account_not_indexed`) explicitly never implies legitimacy or abuse.** |
| `GET /api/v1/accounts/id/{platform}/{platform_account_id}` | `include_sources=true`, `include_history=true` | Immutable-ID lookup (immune to handle renames/squatting). Same `200`/`404` contract. |

#### Canonical Response Schema (`GET /api/v1/accounts/{platform}/{username}`)
```json
{
  "schema_version": "1.0",
  "account": {
    "platform": "x",
    "platform_account_id": "184920384920184",
    "identity_confidence": "immutable_id",
    "username": "example_bot",
    "public_profile_url": "https://x.com/example_bot",
    "classification": "repetitive_engagement_farming",
    "verification_status": "verified",
    "confidence_level": "high",
    "policy_version": "v1.0.0",
    "public_rationale": "Verified 14 near-duplicate promotional replies across unrelated threads within 48 hours using identical 3-line template structure.",
    "last_reviewed_at": "2026-11-22T14:30:00Z",
    "re_review_due_at": "2027-05-21T14:30:00Z",
    "appeal_status": "none",
    "has_source_conflict": false
  },
  "evidence": [
    {
      "public_post_url": "https://x.com/example_bot/status/1991000001",
      "signal_type": "near_duplicate_reply",
      "metrics": { "cluster_size": 14, "mean_cosine_similarity": 0.93, "window_hours": 48 },
      "collected_at": "2026-11-22T10:12:00Z"
    }
  ],
  "source_assertions": [
    {
      "source_slug": "aiblocklist_core",
      "classification": "repetitive_engagement_farming",
      "list_version": "2026.11.22",
      "updated_at": "2026-11-22T14:30:00Z"
    }
  ],
  "meta": {
    "disclaimer": "Classification reflects observable behavioral patterns under Policy v1.0.0, not proof of AI authorship or platform rule violation.",
    "appeal_url": "https://aiblocklist.com/appeals?platform=x&id=184920384920184"
  }
}
```
*Strict Prohibition:* Responses MUST NEVER include `reporter_id`, `ip_subnet_hash`, `internal_notes`, `reviewer_id` (raw UUID), `appellant_statement`, `embedding` vectors, or raw post text.

### 2.2 Blocklists, Categories, Sources & Transparency
| Method & Path | Query Params | Response Summary |
|---|---|---|
| `GET /api/v1/blocklists` | `platform`, `category`, `min_confidence`, `source`, `updated_since` (ISO-8601), `cursor`, `limit` (default `100`, max `500`) | Cursor-paginated verified records + `next_cursor` + `snapshot_download_url` pointing to CDN R2 bundle. Never merges `under_review`, `cleared`, `delisted`, or `unverified_external` into confirmed spam unless explicitly filtered. |
| `GET /api/v1/blocklists/{platform}` | Same filters (scoped to single platform) | Platform-scoped cursor-paginated blocklist + platform snapshot URL. |
| `GET /api/v1/categories` | None | Machine-readable definitions of all 7 classifications, default extension behavior (`warn`), and active `policy_version`. |
| `GET /api/v1/sources` | `platform` | Registry of `aiblocklist_core` + external federated sources with `license_spdx`, `sync_enabled`, `record_count`, `reliability_score`, `last_synced_at`. |
| `GET /api/v1/statistics` | `window=30d\|90d\|all`, `platform` | Aggregate counts by classification, appeal volume, overturn/false-positive rate, median triage & appeal hours, per-source accuracy. |
| `GET /api/v1/transparency` | `quarter` | Public transparency ledger: aggregate metrics, public correction notes from overturned appeals, latest audit `merkle_root_sha256`, and donor ledger summary. |
| `GET /api/v1/policies` | None | List of all immutable `policy_versions` with `version_tag`, `summary`, `document_url`, `effective_at`, and `signal_thresholds`. |
| `GET /api/v1/health` | None | Liveness/readiness check (DB + Valkey connectivity; no internal stack details). |
| `GET /api/v1/version` | None | Running API semantic version, OpenAPI schema version, active `policy_version`. |

### 2.3 Community Reports
| Method & Path | Auth | Request / Response |
|---|---|---|
| `POST /api/v1/reports` | Turnstile or API Key (+ optional HMAC) | Body: `{ platform, account_url, evidence_urls[1..10], reason_code, explanation (<=1000 chars) }`. Rejects non-allowlisted URLs and binary/image uploads. Returns `202 Accepted` `{ report_id, status: "queued", status_token, status_url }`. |
| `GET /api/v1/reports/status/{id}` | Reporter API Key or `X-Report-Status-Token` | Returns non-PII status (`queued`, `triaging`, `escalated`, `resolved`, `closed_duplicate`, `rejected_abuse`). Note: `suspected_brigading` is externally surfaced neutrally as `triaging` to avoid tipping off brigading attackers. |

### 2.4 Account Ownership Verification & Appeals
| Method & Path | Auth | Request / Response |
|---|---|---|
| `POST /api/v1/appeals/verify/init` | Turnstile | Body: `{ platform, username, method: "oauth" \| "bio_token" }`. For `bio_token`, returns single-use challenge string (e.g., `aibl-verify-<32-hex>`) valid 30 minutes, bound to canonical account ID. |
| `POST /api/v1/appeals/verify/confirm` | Challenge ID | Confirms OAuth callback or live public bio token via official platform API, invalidates challenge token, and issues short-lived **Verified Appellant Session** token. |
| `POST /api/v1/appeals` | Verified Appellant Session | Body: `{ platform, username, statement (<=3000 chars), supporting_urls[] }`. Enforces max 1 active appeal/14 days. Returns `202 Accepted` `{ appeal_id, status: "appealed", triage_target_date, sla_target_date, scope_notice }`. |
| `GET /api/v1/appeals/{id}` | Verified Appellant Session (owner only) | Returns current appeal lifecycle status, SLA dates, temporary withholding status, and resolution outcome (never internal reviewer identity). |

### 2.5 Internal Authenticated Endpoints (`/api/internal/v1/*`, Never CDN-Cached)
- **Auth & API Keys:** `POST /auth/login`, `POST /auth/mfa/verify`, `POST /auth/logout`, `POST /api-keys`, `DELETE /api-keys/{id}`, `POST /api-keys/{id}/rotate`
- **Moderation (MFA + RBAC):** `GET /moderation/queue`, `GET /moderation/packets/{account_id}`, `POST /moderation/decisions` (single or primary decision), `POST /moderation/decisions/{id}/cosign` (mandatory second distinct reviewer for `is_high_impact`)
- **Appeals Adjudication (MFA + Appeal Reviewer RBAC):** `GET /appeals/queue`, `POST /appeals/{id}/withhold`, `POST /appeals/{id}/resolve`
- **Admin & Privacy (MFA + Admin RBAC):** `POST /sources/{slug}/sync`, `POST /sources/{slug}/pause`, `GET /admin/budget-usage`, `POST /privacy/deletion-requests`

---

## 3. RFC 9457 Problem Details Error Taxonomy

Every 4xx/5xx error returns `Content-Type: application/problem+json`:
```json
{
  "type": "https://api.aiblocklist.com/errors/invalid-evidence-url",
  "title": "Invalid Evidence URL",
  "status": 422,
  "code": "INVALID_EVIDENCE_URL",
  "detail": "Evidence URL must match canonical public post pattern for platform 'x'.",
  "instance": "/api/v1/reports",
  "request_id": "req_01J..."
}
```

### Standardized Machine-Readable Error Codes
| HTTP | `code` | Trigger Condition |
|---|---|---|
| `400` | `INVALID_PLATFORM` | Unsupported or disabled platform identifier |
| `400` | `INVALID_ACCOUNT_IDENTIFIER` | Malformed handle or platform account ID |
| `422` | `INVALID_EVIDENCE_URL` | URL fails platform allowlist, private URL, or unsupported upload |
| `401` | `UNAUTHORIZED` | Missing, expired, revoked, or invalid token / API key |
| `403` | `FORBIDDEN` | Insufficient RBAC permission, missing MFA, or original reviewer attempting appeal |
| `404` | `ACCOUNT_NOT_INDEXED` | Account not present in database (explicitly neutral; never implies legitimacy/abuse) |
| `409` | `DUPLICATE_REPORT` | Identical `(platform, account_id, canonical_url)` within 24h window |
| `409` | `APPEAL_ALREADY_ACTIVE` | Active appeal exists or 14-day cooldown active for unchanged circumstances |
| `409` | `PUBLICATION_GATE_FAILED` | Missing >=2 evidence items, missing dual-review on high-impact, or illegal state transition |
| `429` | `RATE_LIMITED` | IP, API key, or hourly report ceiling exceeded |
| `503` | `SOURCE_SYNC_UNAVAILABLE` | External source paused (e.g., >10% anomaly circuit breaker) or budget cap active |
| `500` | `INTERNAL_PROCESSING_FAILURE` | Unhandled server error (sanitized; zero stack trace or PII) |

---

## 4. CDN Static Snapshot & Delta Contract (`cdn.aiblocklist.com`)

### Object Paths on Cloudflare R2
- Manifest: `/v1/manifests/latest.json`
- Full compressed snapshot: `/v1/snapshots/{platform}/{dataset_version}.json.gz` and `/v1/snapshots/{platform}/latest.json.gz`
- Delta bundle: `/v1/deltas/{platform}/{from_version}/{to_version}.json.gz`

### Manifest Schema (`/v1/manifests/latest.json`)
```json
{
  "schema_version": "1.0",
  "generated_at": "2026-11-23T18:00:00Z",
  "policy_version": "v1.0.0",
  "data_license": "ODC-By-1.0",
  "attribution_url": "https://aiblocklist.com/transparency",
  "platforms": {
    "x": {
      "dataset_version": "2026.11.23.1800",
      "previous_version": "2026.11.23.1700",
      "record_count": 4120,
      "snapshot_url": "https://cdn.aiblocklist.com/v1/snapshots/x/2026.11.23.1800.json.gz",
      "latest_url": "https://cdn.aiblocklist.com/v1/snapshots/x/latest.json.gz",
      "delta_url": "https://cdn.aiblocklist.com/v1/deltas/x/2026.11.23.1700/2026.11.23.1800.json.gz",
      "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    }
  }
}
```

### Atomic Publication Sequence
1. Build gzipped snapshot + delta from `intel.accounts` (`verification_status = 'verified'` & public classifications) + active `external_list_entries` tagged separately.
2. Validate JSON against frozen `packages/contracts/snapshot-v1.schema.json`.
3. Compute `SHA-256` checksum and assert record-count sanity (abort if unexpected >25% drop without admin override).
4. Upload immutable versioned `.json.gz` to R2.
5. Update `ops_private.snapshot_versions`, upload new manifest, then update `latest.json.gz` pointer.
6. Purge Cloudflare edge cache keys for manifest & affected account URLs. On any step failure, prior version remains untouched.
