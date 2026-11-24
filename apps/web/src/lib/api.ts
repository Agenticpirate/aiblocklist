export const API_BASE_URL =
  typeof window !== "undefined"
    ? "/api/v1"
    : process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

export interface EvidenceRecord {
  public_post_url: string;
  platform_post_id: string;
  signal_type: string;
  metrics: Record<string, unknown>;
  content_hash_sha256: string;
  source_deleted: boolean;
  collected_at: string;
  post_text?: string | null;
  post_date?: string | null;
  response_text?: string | null;
}

export interface SourceAssertion {
  source_slug: string;
  source_name: string;
  classification: string;
  list_version: string;
  verified: boolean;
  source_evidence_url?: string | null;
  updated_at: string;
}

export interface AccountPayload {
  schema_version: string;
  account: {
    id: string;
    platform: string;
    platform_account_id: string | null;
    identity_confidence: string;
    username: string;
    public_profile_url: string;
    classification: string;
    verification_status: string;
    confidence_level: string;
    is_high_impact: boolean;
    policy_version: string;
    public_rationale: string | null;
    last_reviewed_at: string | null;
    re_review_due_at: string | null;
    appeal_status: string;
    has_source_conflict: boolean;
    evidence_count: number;
    primary_quote?: string | null;
  };
  evidence: EvidenceRecord[];
  source_assertions: SourceAssertion[];
  meta: {
    disclaimer: string;
    appeal_url: string;
  };
}

export interface BlocklistResponse {
  schema_version: string;
  total_matching: number;
  count: number;
  next_cursor: string | null;
  snapshot_download_url: string;
  items: AccountPayload[];
  meta: { disclaimer: string };
}

export interface StatisticsResponse {
  generated_at: string;
  policy_version: string;
  totals: {
    indexed_accounts: number;
    aiblocklist_core_verified: number;
    unverified_external_assertions: number;
    accounts_with_public_evidence_urls: number;
    accounts_meeting_2_url_threshold: number;
    silent_external_entries_zero_urls: number;
    total_evidence_references: number;
    tombstoned_deleted_references: number;
    source_conflicts_preserved: number;
    community_reports_received: number;
    appeals_submitted: number;
  };
  by_classification: Record<string, number>;
  governance_targets: {
    non_native_false_positive_gate_pct: number;
    appeal_triage_hours: number;
    appeal_resolution_business_days: number;
    mandatory_re_review_days: number;
    raw_post_text_archived: boolean;
  };
}

export interface TransparencyResponse {
  schema_version: string;
  statistics: StatisticsResponse;
  audit_integrity: {
    chain_verified: boolean;
    total_audit_records: number;
    latest_merkle_root_sha256: string;
    append_only_enforced: boolean;
  };
  public_corrections: Array<{
    appeal_id: string;
    status: string;
    public_correction_note: string;
    resolved_at: string | null;
  }>;
  charter_red_lines: string[];
}

export interface SourceInfo {
  slug: string;
  display_name: string;
  maintainer_handle: string | null;
  source_url: string;
  license_spdx: string | null;
  sync_enabled: boolean;
  reliability_score: number | null;
  record_count: number;
  last_synced_at: string | null;
}

export async function fetchApi<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data?.detail || "Request failed") as Error & {
      status?: number;
      code?: string;
    };
    err.status = res.status;
    err.code = data?.code;
    throw err;
  }
  return data as T;
}

export function formatClassificationLabel(slug: string): string {
  const map: Record<string, string> = {
    confirmed_automated_spam: "Confirmed automated spam",
    repetitive_engagement_farming: "Repetitive engagement farming",
    coordinated_manipulation: "Coordinated manipulation",
    suspicious_automation: "Suspicious automation",
    under_review: "Under review",
    cleared: "Cleared",
    delisted: "Delisted",
  };
  return map[slug] || slug.replaceAll("_", " ");
}

export function formatVerificationLabel(slug: string): string {
  const map: Record<string, string> = {
    verified: "Core verified",
    unverified_external: "External unverified",
    pending_human: "Pending human review",
    unverified: "Unverified",
  };
  return map[slug] || slug.replaceAll("_", " ");
}
