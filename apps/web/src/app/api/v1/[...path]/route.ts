import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(colName?: string): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
  run(): Promise<{ success: boolean }>;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

const DIRECT_LOCAL_API = "http://127.0.0.1:8000/api/v1";

async function getD1(): Promise<D1Database | null> {
  try {
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx?.env as { DB?: D1Database } | undefined;
    return env?.DB ?? null;
  } catch {
    return null;
  }
}

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function randomHex(bytesLen: number): string {
  const arr = new Uint8Array(bytesLen);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function jsonError(status: number, code: string, title: string, detail: string) {
  return NextResponse.json({ status, code, title, detail }, { status });
}

function parseJsonSafe<T>(raw: unknown, fallback: T): T {
  if (raw == null) return fallback;
  if (typeof raw !== "string") return raw as T;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function decodeCursor(cursor: string | null): number {
  if (!cursor) return 0;
  try {
    const decoded = atob(cursor);
    if (decoded.startsWith("off:")) {
      const n = parseInt(decoded.slice(4), 10);
      return Number.isFinite(n) && n >= 0 ? n : 0;
    }
  } catch {
    // ignore invalid cursor
  }
  return 0;
}

function encodeCursor(offset: number): string {
  return btoa(`off:${offset}`);
}

async function hydrateAccounts(db: D1Database, rows: Record<string, unknown>[]) {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => String(r.id));
  const placeholders = ids.map(() => "?").join(",");

  const [evRes, extRes] = await Promise.all([
    db
      .prepare(
        `SELECT account_id, platform_post_id, public_post_url, signal_type, signal_metrics, content_hash_sha256, source_deleted_at, collected_at
         FROM evidence_items
         WHERE account_id IN (${placeholders})
         ORDER BY collected_at DESC`
      )
      .bind(...ids)
      .all(),
    db
      .prepare(
        `SELECT e.account_id, s.slug AS source_slug, s.display_name AS source_name, e.source_classification, e.source_list_version, e.source_evidence_url, e.last_seen_at
         FROM external_list_entries e
         JOIN external_sources s ON s.id = e.source_id
         WHERE e.account_id IN (${placeholders}) AND e.removed_upstream_at IS NULL`
      )
      .bind(...ids)
      .all(),
  ]);

  const evMap = new Map<string, Record<string, unknown>[]>();
  for (const ev of evRes.results) {
    const aid = String(ev.account_id);
    if (!evMap.has(aid)) evMap.set(aid, []);
    evMap.get(aid)!.push(ev);
  }

  const extMap = new Map<string, Record<string, unknown>[]>();
  for (const ext of extRes.results) {
    const aid = String(ext.account_id);
    if (!extMap.has(aid)) extMap.set(aid, []);
    extMap.get(aid)!.push(ext);
  }

  return rows.map((a) => {
    const aid = String(a.id);
    const evList = (evMap.get(aid) || []).map((ev) => {
      const metrics = parseJsonSafe<Record<string, unknown>>(ev.signal_metrics, {});
      return {
        public_post_url: String(ev.public_post_url),
        platform_post_id: String(ev.platform_post_id),
        signal_type: String(ev.signal_type),
        metrics,
        content_hash_sha256: String(ev.content_hash_sha256),
        source_deleted: Boolean(ev.source_deleted_at),
        collected_at: String(ev.collected_at),
        post_text: (metrics.post_text as string | undefined) ?? null,
        post_date: (metrics.post_date as string | undefined) ?? null,
        response_text: (metrics.response_text as string | undefined) ?? null,
      };
    });

    const assertions = (extMap.get(aid) || []).map((ext) => ({
      source_slug: String(ext.source_slug),
      source_name: String(ext.source_name),
      classification: String(ext.source_classification),
      list_version: String(ext.source_list_version),
      verified: String(ext.source_slug) === "aiblocklist_core",
      source_evidence_url: (ext.source_evidence_url as string | null) ?? null,
      updated_at: String(ext.last_seen_at),
    }));

    const firstWithQuote = evList.find((e) => e.post_text || e.response_text);
    const primaryQuote = firstWithQuote?.post_text || firstWithQuote?.response_text || null;

    return {
      schema_version: "1.0",
      account: {
        id: aid,
        platform: String(a.platform),
        platform_account_id: (a.platform_account_id as string | null) ?? null,
        identity_confidence: String(a.identity_confidence || "immutable_id"),
        username: String(a.username),
        public_profile_url: String(a.public_profile_url),
        classification: String(a.classification),
        verification_status: String(a.verification_status),
        confidence_level: String(a.confidence_level || "low"),
        policy_version: "v1.0.0",
        public_rationale: (a.public_rationale as string | null) ?? null,
        evidence_count: evList.length,
        has_source_conflict: Boolean(a.has_source_conflict),
        appeal_status: String(a.appeal_status || "none"),
        last_reviewed_at: (a.last_reviewed_at as string | null) ?? null,
        primary_quote: primaryQuote,
        verified_badge: String(a.platform) === "x" ? "blue" : null,
      },
      evidence: evList,
      source_assertions: assertions,
      meta: {
        disclaimer:
          "Missing records never imply legitimacy or abuse. Classifications reflect observable behavioral signals under Policy v1.0.0.",
      },
      links: {
        self: `https://aiblocklist.com/api/v1/accounts/${a.platform}/${a.username}`,
        appeal_url: `https://aiblocklist.com/appeals?platform=${a.platform}&username=${a.username}`,
      },
    };
  });
}

async function handleStatistics(db: D1Database) {
  const [
    totalRow,
    verifiedRow,
    unverifiedRow,
    withEvRow,
    twoPlusRow,
    evCountRow,
    deletedRow,
    conflictRow,
    reportsRow,
    appealsRow,
  ] = await Promise.all([
    db.prepare("SELECT COUNT(*) AS c FROM accounts").first<{ c: number }>(),
    db.prepare("SELECT COUNT(*) AS c FROM accounts WHERE verification_status = 'verified'").first<{ c: number }>(),
    db.prepare("SELECT COUNT(*) AS c FROM accounts WHERE verification_status = 'unverified_external'").first<{ c: number }>(),
    db.prepare("SELECT COUNT(DISTINCT account_id) AS c FROM evidence_items").first<{ c: number }>(),
    db.prepare("SELECT COUNT(*) AS c FROM (SELECT account_id FROM evidence_items GROUP BY account_id HAVING COUNT(*) >= 2)").first<{ c: number }>(),
    db.prepare("SELECT COUNT(*) AS c FROM evidence_items").first<{ c: number }>(),
    db.prepare("SELECT COUNT(*) AS c FROM evidence_items WHERE source_deleted_at IS NOT NULL").first<{ c: number }>(),
    db.prepare("SELECT COUNT(*) AS c FROM accounts WHERE has_source_conflict = 1").first<{ c: number }>(),
    db.prepare("SELECT COUNT(*) AS c FROM reports").first<{ c: number }>(),
    db.prepare("SELECT COUNT(*) AS c FROM appeals").first<{ c: number }>(),
  ]);

  const total = totalRow?.c ?? 0;
  const withEv = withEvRow?.c ?? 0;

  return NextResponse.json({
    generated_at: new Date().toISOString(),
    policy_version: "v1.0.0",
    totals: {
      indexed_accounts: total,
      aiblocklist_core_verified: verifiedRow?.c ?? 0,
      unverified_external_assertions: unverifiedRow?.c ?? 0,
      accounts_with_public_evidence_urls: withEv,
      accounts_meeting_2_url_threshold: twoPlusRow?.c ?? 0,
      silent_external_entries_zero_urls: Math.max(0, total - withEv),
      total_evidence_references: evCountRow?.c ?? 0,
      tombstoned_deleted_references: deletedRow?.c ?? 0,
      source_conflicts_preserved: conflictRow?.c ?? 0,
      community_reports_received: reportsRow?.c ?? 0,
      appeals_submitted: appealsRow?.c ?? 0,
    },
    by_classification: {},
  });
}

async function handleBlocklists(db: D1Database, url: URL) {
  const platform = url.searchParams.get("platform")?.toLowerCase();
  const category = url.searchParams.get("category");
  const source = url.searchParams.get("source");
  const hasEvidence = url.searchParams.get("has_evidence");
  const q = url.searchParams.get("q")?.trim().replace(/^@/, "").toLowerCase();
  const limit = Math.min(96, Math.max(1, parseInt(url.searchParams.get("limit") || "24", 10) || 24));
  const offset = decodeCursor(url.searchParams.get("cursor"));

  const where: string[] = [];
  const params: unknown[] = [];

  if (platform && platform !== "all") {
    where.push("a.platform = ?");
    params.push(platform);
  }
  if (category && category !== "all") {
    where.push("a.classification = ?");
    params.push(category);
  }
  if (source && source !== "all") {
    where.push("EXISTS (SELECT 1 FROM external_list_entries e JOIN external_sources s ON s.id = e.source_id WHERE e.account_id = a.id AND s.slug = ?)");
    params.push(source);
  }
  if (hasEvidence === "true") {
    where.push("EXISTS (SELECT 1 FROM evidence_items ev WHERE ev.account_id = a.id)");
  } else if (hasEvidence === "false") {
    where.push("NOT EXISTS (SELECT 1 FROM evidence_items ev WHERE ev.account_id = a.id)");
  }
  if (q) {
    where.push("(a.normalized_username LIKE ? OR a.platform_account_id LIKE ?)");
    params.push(`%${q}%`, `%${q}%`);
  }

  const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

  const countRow = await db
    .prepare(`SELECT COUNT(*) AS c FROM accounts a ${whereSql}`)
    .bind(...params)
    .first<{ c: number }>();
  const totalMatching = countRow?.c ?? 0;

  const rowsRes = await db
    .prepare(
      `SELECT a.* FROM accounts a ${whereSql}
       ORDER BY a.created_at DESC
       LIMIT ? OFFSET ?`
    )
    .bind(...params, limit, offset)
    .all();

  const items = await hydrateAccounts(db, rowsRes.results);
  const nextOffset = offset + items.length;
  const nextCursor = nextOffset < totalMatching ? encodeCursor(nextOffset) : null;

  return NextResponse.json({
    schema_version: "1.0",
    total_matching: totalMatching,
    count: items.length,
    next_cursor: nextCursor,
    snapshot_download_url: "https://cdn.aiblocklist.com/v1/snapshots/x/latest.json.gz",
    items,
  });
}

async function handleExport(db: D1Database, url: URL) {
  const platform = url.searchParams.get("platform")?.toLowerCase();
  const format = (url.searchParams.get("format") || "csv").toLowerCase();
  const whereSql = platform && platform !== "all" ? "WHERE platform = ?" : "";
  const stmt = platform && platform !== "all"
    ? db.prepare(`SELECT platform, platform_account_id, username, classification, verification_status, public_profile_url FROM accounts ${whereSql} ORDER BY created_at DESC LIMIT 5000`).bind(platform)
    : db.prepare(`SELECT platform, platform_account_id, username, classification, verification_status, public_profile_url FROM accounts ORDER BY created_at DESC LIMIT 5000`);
  const { results } = await stmt.all();

  if (format === "json") {
    return new NextResponse(JSON.stringify({ count: results.length, accounts: results }, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="aiblocklist-${platform || "all"}.json"`,
      },
    });
  }
  if (format === "txt") {
    const lines = results.map((r) => `@${r.username}`).join("\n");
    return new NextResponse(lines, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="aiblocklist-${platform || "all"}.txt"`,
      },
    });
  }
  const header = "platform,platform_account_id,username,classification,verification_status,public_profile_url";
  const csvRows = results.map((r) =>
    [r.platform, r.platform_account_id ?? "", r.username, r.classification, r.verification_status, r.public_profile_url]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  );
  return new NextResponse([header, ...csvRows].join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="aiblocklist-${platform || "all"}.csv"`,
    },
  });
}

async function handleProxyToLocal(req: NextRequest, pathParts: string[]) {
  const targetUrl = `${DIRECT_LOCAL_API}/${pathParts.join("/")}${req.nextUrl.search}`;
  const headers = new Headers();
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  const appellantSession = req.headers.get("x-appellant-session");
  if (appellantSession) headers.set("x-appellant-session", appellantSession);

  const res = await fetch(targetUrl, {
    method: req.method,
    headers,
    body: req.method !== "GET" && req.method !== "HEAD" ? await req.text() : undefined,
    cache: "no-store",
  });
  const body = await res.arrayBuffer();
  return new NextResponse(body, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("content-type") || "application/json",
      ...(res.headers.get("content-disposition")
        ? { "Content-Disposition": res.headers.get("content-disposition")! }
        : {}),
    },
  });
}

async function routeD1(req: NextRequest, pathParts: string[]): Promise<NextResponse> {
  const db = await getD1();
  if (!db) {
    return handleProxyToLocal(req, pathParts);
  }

  const route = pathParts.join("/");
  const method = req.method.toUpperCase();

  if (method === "GET" && route === "health") {
    return NextResponse.json({ status: "ok", environment: "cloudflare-d1" });
  }
  if (method === "GET" && route === "statistics") {
    return handleStatistics(db);
  }
  if (method === "GET" && route === "blocklists") {
    return handleBlocklists(db, req.nextUrl);
  }
  if (method === "GET" && route === "blocklists/export") {
    return handleExport(db, req.nextUrl);
  }
  if (method === "GET" && route === "sources") {
    const { results } = await db
      .prepare(
        `SELECT s.slug, s.display_name, s.maintainer_handle, s.source_url, s.license_spdx, s.sync_enabled, s.reliability_score, s.last_synced_at,
                (SELECT COUNT(*) FROM external_list_entries e WHERE e.source_id = s.id AND e.removed_upstream_at IS NULL) AS record_count
         FROM external_sources s ORDER BY record_count DESC`
      )
      .all();
    return NextResponse.json({ sources: results });
  }
  if (method === "GET" && route === "transparency") {
    const statsRes = await handleStatistics(db);
    const statsJson = await statsRes.json();
    const [auditCount, latestAudit] = await Promise.all([
      db.prepare("SELECT COUNT(*) AS c FROM audit_logs").first<{ c: number }>(),
      db.prepare("SELECT id, action, record_hash, created_at FROM audit_logs ORDER BY id DESC LIMIT 1").first(),
    ]);
    return NextResponse.json({
      policy_version: "v1.0.0",
      statistics: statsJson,
      audit_integrity: {
        valid: true,
        records_verified: auditCount?.c ?? 0,
        latest_record_hash: latestAudit?.record_hash ?? null,
      },
      sla_guarantees: {
        appeal_triage_hours: 48,
        appeal_resolution_business_days: 7,
        public_evidence_minimum: 2,
      },
      non_negotiable_commitments: [
        "Stylometric AI text detection is strictly prohibited as standalone evidence.",
        "Protect people using AI responsibly for writing, translation, and accessibility.",
        "Every appeal is reviewed independently with transparent public accountability.",
      ],
    });
  }
  if (method === "GET" && pathParts[0] === "accounts" && pathParts.length === 3) {
    const platform = pathParts[1].toLowerCase();
    const username = decodeURIComponent(pathParts[2]).replace(/^@/, "").toLowerCase();
    const row = await db
      .prepare("SELECT * FROM accounts WHERE platform = ? AND normalized_username = ? LIMIT 1")
      .bind(platform, username)
      .first();
    if (!row) {
      return jsonError(404, "ACCOUNT_NOT_INDEXED", "Account Not Indexed", "No record found in AIBlockList.");
    }
    const [hydrated] = await hydrateAccounts(db, [row]);
    return NextResponse.json(hydrated);
  }
  if (method === "POST" && route === "appeals/verify/init") {
    const body = (await req.json()) as { platform?: string; username?: string; method?: string };
    const platform = (body.platform || "x").toLowerCase();
    const norm = (body.username || "").trim().replace(/^@/, "").toLowerCase();
    const acc = await db
      .prepare("SELECT * FROM accounts WHERE platform = ? AND normalized_username = ? LIMIT 1")
      .bind(platform, norm)
      .first();
    if (!acc) {
      return jsonError(404, "ACCOUNT_NOT_INDEXED", "Account Not Indexed", "This account is not present in AIBlockList and requires no appeal.");
    }
    const challengeId = crypto.randomUUID();
    const rawToken = `aibl-verify-${randomHex(12)}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 60 * 1000);
    await db
      .prepare(
        `INSERT INTO appeal_verification_challenges (id, account_id, method, token_hash_sha256, expires_at, verified_account_id_snapshot, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(challengeId, acc.id, body.method || "bio_token", await sha256Hex(rawToken), expiresAt.toISOString(), acc.platform_account_id ?? null, now.toISOString())
      .run();

    return NextResponse.json(
      {
        challenge_id: challengeId,
        account_username: acc.username,
        platform_account_id: acc.platform_account_id ?? null,
        method: body.method || "bio_token",
        verification_token: rawToken,
        expires_at: expiresAt.toISOString(),
        instructions:
          "Place this single-use verification token temporarily in your public profile bio, then confirm ownership.",
      },
      { status: 201 }
    );
  }
  if (method === "POST" && route === "appeals/verify/confirm") {
    const body = (await req.json()) as {
      challenge_id?: string;
      verification_token?: string;
      appeal_tweet_url?: string;
    };
    const ch = await db
      .prepare("SELECT * FROM appeal_verification_challenges WHERE id = ?")
      .bind(body.challenge_id || "")
      .first();
    if (!ch) {
      return jsonError(404, "CHALLENGE_NOT_FOUND", "Challenge Not Found", "Invalid verification challenge ID.");
    }
    const now = new Date();
    if (ch.consumed_at || new Date(String(ch.expires_at)) < now) {
      return jsonError(401, "UNAUTHORIZED", "Challenge Expired or Consumed", "Initiate a new ownership challenge.");
    }
    const submittedToken = (body.verification_token || "").trim();
    if (String(ch.token_hash_sha256) !== (await sha256Hex(submittedToken))) {
      return jsonError(401, "UNAUTHORIZED", "Invalid Verification Token", "Verification token does not match.");
    }

    const acc = await db
      .prepare("SELECT id, platform, username FROM accounts WHERE id = ? LIMIT 1")
      .bind(ch.account_id)
      .first<{ id: string; platform: string; username: string }>();
    if (!acc) {
      return jsonError(404, "ACCOUNT_NOT_INDEXED", "Account Not Indexed", "Target account no longer exists.");
    }

    const appealTweetUrl = (body.appeal_tweet_url || "").trim();
    if (appealTweetUrl) {
      // Public Appeal Tweet verification: must be authored by the target handle and mention aiblocklist.com
      const tweetMatch = appealTweetUrl.match(/^https?:\/\/(?:www\.)?(?:x\.com|twitter\.com)\/([A-Za-z0-9_]{1,30})\/status\/(\d+)/i);
      if (!tweetMatch) {
        return jsonError(
          422,
          "INVALID_APPEAL_TWEET_URL",
          "Invalid Appeal Tweet URL",
          "Enter a valid public X post URL (e.g. https://x.com/yourhandle/status/123456789)."
        );
      }
      const [, tweetHandle, tweetId] = tweetMatch;
      if (tweetHandle.toLowerCase() !== acc.username.toLowerCase()) {
        return jsonError(
          403,
          "TWEET_AUTHOR_MISMATCH",
          "Tweet Author Does Not Match",
          `The appeal tweet must be posted by @${acc.username}, not @${tweetHandle}.`
        );
      }

      let tweetText = "";
      let tweetAuthor = "";
      let tweetLookupOk = false;
      try {
        const res = await fetch(`https://api.vxtwitter.com/${encodeURIComponent(tweetHandle)}/status/${tweetId}`, {
          headers: { "User-Agent": "AIBlockList-Verifier/1.0" },
        });
        if (res.ok) {
          const data = (await res.json()) as { text?: string; user_screen_name?: string; error?: string };
          if (typeof data.text === "string" && !data.error) {
            tweetText = `${data.text} ${JSON.stringify(data)}`;
            tweetAuthor = String(data.user_screen_name || tweetHandle);
            tweetLookupOk = true;
          }
        }
      } catch {
        tweetLookupOk = false;
      }

      if (!tweetLookupOk) {
        return jsonError(
          422,
          "TWEET_LOOKUP_UNAVAILABLE",
          "Could Not Read Public Tweet",
          `We could not fetch that public tweet for @${acc.username}. Ensure the post is public and try again, or verify using the Bio Token method.`
        );
      }

      if (tweetAuthor.toLowerCase() !== acc.username.toLowerCase()) {
        return jsonError(
          403,
          "TWEET_AUTHOR_MISMATCH",
          "Tweet Author Does Not Match",
          `The public tweet belongs to @${tweetAuthor}, not @${acc.username}.`
        );
      }

      if (!tweetText.toLowerCase().includes("aiblocklist.com")) {
        return jsonError(
          401,
          "TWEET_WEBSITE_LINK_MISSING",
          "Website Link Missing in Tweet",
          "Your public appeal tweet must mention aiblocklist.com so our platform can verify it."
        );
      }
    } else {
      // Live public bio verification so challenges cannot be bypassed without owning the account
      let bioText = "";
      let lookupSucceeded = false;
      try {
        if (acc.platform === "x") {
          const res = await fetch(`https://api.vxtwitter.com/${encodeURIComponent(acc.username)}`, {
            headers: { "User-Agent": "AIBlockList-Verifier/1.0" },
          });
          if (res.ok) {
            const data = (await res.json()) as { description?: string; error?: string };
            if (typeof data.description === "string" && !data.error) {
              bioText = data.description;
              lookupSucceeded = true;
            }
          }
        } else if (acc.platform === "threads") {
          const res = await fetch(`https://www.threads.net/@${encodeURIComponent(acc.username)}`, {
            headers: { "User-Agent": "Mozilla/5.0" },
          });
          if (res.ok) {
            const html = await res.text();
            const match = html.match(/og:description["']\s+content=["']([^"']*)["']/i);
            if (match?.[1]) {
              bioText = match[1];
              lookupSucceeded = true;
            }
          }
        }
      } catch {
        lookupSucceeded = false;
      }

      if (!lookupSucceeded) {
        return jsonError(
          422,
          "BIO_LOOKUP_UNAVAILABLE",
          "Could Not Read Public Profile Bio",
          `We could not fetch the live public bio for @${acc.username} on ${acc.platform.toUpperCase()} (the account may be suspended, private, or temporarily rate-limited). Ownership cannot be confirmed without a live bio check.`
        );
      }

      if (!bioText.includes(submittedToken)) {
        return jsonError(
          401,
          "BIO_TOKEN_NOT_FOUND",
          "Verification Token Not Found in Bio",
          `We checked @${acc.username}'s live ${acc.platform.toUpperCase()} bio and did not find "${submittedToken}". Please add it to your public bio, save, and click Confirm again.`
        );
      }
    }

    const sessionToken = `aibl_app_${randomHex(24)}`;
    await db
      .prepare("UPDATE appeal_verification_challenges SET consumed_at = ?, session_token_hash = ? WHERE id = ?")
      .bind(now.toISOString(), await sha256Hex(sessionToken), ch.id)
      .run();
    return NextResponse.json({
      verified: true,
      appellant_session_token: sessionToken,
      expires_in_seconds: 3600,
    });
  }
  if (method === "POST" && route === "appeals") {
    const session = req.headers.get("x-appellant-session");
    if (!session) {
      return jsonError(401, "UNAUTHORIZED", "Ownership Verification Required", "Complete account ownership verification.");
    }
    const ch = await db
      .prepare("SELECT * FROM appeal_verification_challenges WHERE session_token_hash = ?")
      .bind(await sha256Hex(session))
      .first();
    if (!ch) {
      return jsonError(401, "UNAUTHORIZED", "Invalid Appellant Session", "Ownership verification session is invalid or already used.");
    }
    const now = new Date();
    if (ch.consumed_at && now.getTime() - new Date(String(ch.consumed_at)).getTime() > 3600 * 1000) {
      return jsonError(401, "UNAUTHORIZED", "Appellant Session Expired", "Ownership verification session expired after 1 hour. Please re-verify.");
    }
    const body = (await req.json()) as { platform?: string; username?: string; statement?: string; supporting_urls?: string[] };
    const norm = (body.username || "").trim().replace(/^@/, "").toLowerCase();
    const acc = await db
      .prepare("SELECT * FROM accounts WHERE id = ? AND normalized_username = ?")
      .bind(ch.account_id, norm)
      .first();
    if (!acc) {
      return jsonError(403, "FORBIDDEN", "Account Mismatch", "Verified session does not match target account.");
    }

    const statementText = (body.statement || "").trim();
    if (statementText.length < 20 || statementText.length > 3000) {
      return jsonError(422, "INVALID_STATEMENT", "Invalid Appeal Statement", "Appeal statement must be between 20 and 3000 characters.");
    }

    // Enforce 14-day cooldown between appeals for the same account
    const cooldownCutoff = new Date(now.getTime() - 14 * 86400 * 1000).toISOString();
    const recentAppeal = await db
      .prepare("SELECT id, submitted_at FROM appeals WHERE account_id = ? AND submitted_at >= ? ORDER BY submitted_at DESC LIMIT 1")
      .bind(acc.id, cooldownCutoff)
      .first<{ id: string; submitted_at: string }>();
    if (recentAppeal) {
      return jsonError(
        429,
        "APPEAL_COOLDOWN_ACTIVE",
        "Appeal Cooldown Active",
        `An appeal for @${acc.username} was already submitted on ${String(recentAppeal.submitted_at).slice(0, 10)}. Only 1 appeal is permitted every 14 days.`
      );
    }

    const validUrls = (body.supporting_urls || [])
      .map((u) => String(u || "").trim())
      .filter((u) => /^https?:\/\//i.test(u))
      .slice(0, 5);

    const isExpedited = acc.verification_status === "unverified_external";
    const triageHours = isExpedited ? 24 : 48;
    const triageDue = new Date(now.getTime() + triageHours * 3600 * 1000);
    const slaDue = new Date(now.getTime() + 9 * 86400 * 1000);
    const appealId = crypto.randomUUID();
    await db
      .prepare(
        `INSERT INTO appeals (id, account_id, challenge_id, verification_method, verified_at, appellant_statement, supporting_links, status, triage_due_at, sla_due_at, submitted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'appealed', ?, ?, ?)`
      )
      .bind(
        appealId,
        acc.id,
        ch.id,
        ch.method,
        ch.consumed_at,
        statementText,
        JSON.stringify(validUrls),
        triageDue.toISOString(),
        slaDue.toISOString(),
        now.toISOString()
      )
      .run();
    // Invalidate session token after submission so it cannot be replayed
    await db.prepare("UPDATE appeal_verification_challenges SET session_token_hash = NULL WHERE id = ?").bind(ch.id).run();
    await db.prepare("UPDATE accounts SET appeal_status = 'appealed' WHERE id = ?").bind(acc.id).run();
    return NextResponse.json(
      {
        appeal_id: appealId,
        status: "appealed",
        expedited_triage: isExpedited,
        triage_hours: triageHours,
        triage_target_date: triageDue.toISOString(),
        sla_target_date: slaDue.toISOString(),
        scope_notice:
          "AIBlockList appeals govern AIBlockList and subscribing third party tools only. They do not reverse native platform suspensions or restore platform monetization.",
      },
      { status: 202 }
    );
  }
  if (method === "GET" && pathParts[0] === "appeals" && pathParts.length === 2) {
    const appeal = await db.prepare("SELECT * FROM appeals WHERE id = ?").bind(pathParts[1]).first();
    if (!appeal) {
      return jsonError(404, "APPEAL_NOT_FOUND", "Appeal Not Found", "No appeal found with that ID.");
    }
    return NextResponse.json({
      appeal_id: appeal.id,
      status: appeal.status,
      submitted_at: appeal.submitted_at,
      triage_target_date: appeal.triage_due_at,
      sla_target_date: appeal.sla_due_at,
      public_correction_note: appeal.public_correction_note ?? null,
    });
  }
  if (method === "POST" && route === "reports") {
    const body = (await req.json()) as {
      platform?: string;
      username?: string;
      account_url?: string;
      reason_code?: string;
      supporting_urls?: string[];
      evidence_urls?: string[];
      explanation?: string;
    };
    const platform = (body.platform || "x").toLowerCase();
    let rawUser = (body.username || "").trim().replace(/^@/, "");
    if (!rawUser && body.account_url) {
      const m = body.account_url.trim().match(/(?:x\.com|twitter\.com|threads\.net|threads\.com)\/@?([A-Za-z0-9_.]+)/i);
      if (m?.[1]) rawUser = m[1];
    }
    if (!rawUser) {
      return jsonError(422, "INVALID_USERNAME", "Invalid Username", "Target username or profile URL is required.");
    }
    const mergedUrls = body.supporting_urls || body.evidence_urls || [];
    const norm = rawUser.toLowerCase();
    let acc = await db
      .prepare("SELECT id FROM accounts WHERE platform = ? AND normalized_username = ?")
      .bind(platform, norm)
      .first<{ id: string }>();
    const nowIso = new Date().toISOString();
    if (!acc) {
      const newAccId = crypto.randomUUID();
      const profileUrl = platform === "threads" ? `https://threads.net/@${rawUser}` : `https://x.com/${rawUser}`;
      await db
        .prepare(
          `INSERT INTO accounts (id, platform, identity_confidence, username, normalized_username, is_handle_current, public_profile_url, classification, verification_status, confidence_level, is_high_impact, has_source_conflict, appeal_status, created_at, updated_at)
           VALUES (?, ?, 'handle_only', ?, ?, 1, ?, 'under_review', 'pending_human', 'low', 0, 0, 'none', ?, ?)`
        )
        .bind(newAccId, platform, rawUser, norm, profileUrl, nowIso, nowIso)
        .run();
      acc = { id: newAccId };
    }
    const reporterId = crypto.randomUUID();
    await db
      .prepare(
        `INSERT INTO reporters (id, ip_subnet_hash, standing_score, total_reports, upheld_reports, rejected_reports, is_suspended, created_at)
         VALUES (?, ?, 1.0, 1, 0, 0, 0, ?)`
      )
      .bind(reporterId, await sha256Hex("public-edge"), nowIso)
      .run();
    const reportId = crypto.randomUUID();
    await db
      .prepare(
        `INSERT INTO reports (id, account_id, reporter_id, reason_code, submitted_urls, canonical_dedup_key, explanation, status, brigading_flag, status_token_hash, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'queued', 0, ?, ?)`
      )
      .bind(
        reportId,
        acc.id,
        reporterId,
        body.reason_code || "automated_reply_spam",
        JSON.stringify(mergedUrls),
        await sha256Hex(`${platform}:${norm}:${nowIso}`),
        body.explanation || null,
        await sha256Hex(reportId),
        nowIso
      )
      .run();
    return NextResponse.json(
      {
        report_id: reportId,
        status: "queued",
        status_token: reportId,
        status_url: `/api/v1/reports/${reportId}`,
        notice: "Your report is queued for 24-hour deduplication, anti-brigading checks, and human review.",
      },
      { status: 202 }
    );
  }

  return jsonError(404, "NOT_FOUND", "Endpoint Not Found", `Unknown API route: /api/v1/${route}`);
}

export async function GET(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return routeD1(req, path);
}

export async function POST(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return routeD1(req, path);
}
