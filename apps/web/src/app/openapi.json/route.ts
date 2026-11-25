import { NextResponse } from "next/server";

export async function GET() {
  const spec = {
    openapi: "3.1.0",
    info: {
      title: "AIBlockList Public Behavioral Intelligence API",
      version: "1.0.0",
      description:
        "Open-source behavioral trust and safety API for X and Meta Threads. Identifies automated reply spam using SIG-01 to SIG-05 while protecting responsible everyday AI users.",
      contact: {
        name: "AIBlockList Maintainers",
        url: "https://aiblocklist.com/contact",
        email: "contact@aiblocklist.com",
      },
      license: {
        name: "ODC-By-1.0",
        url: "https://opendatacommons.org/licenses/by/1-0/",
      },
    },
    servers: [{ url: "https://aiblocklist.com/api/v1", description: "Production Edge API" }],
    "x-rateLimit": {
      publicReadRequestsPerMinute: 120,
      appealsPerAccountCooldownDays: 14,
    },
    components: {
      schemas: {
        ErrorResponse: {
          type: "object",
          required: ["status", "code", "title", "detail"],
          properties: {
            status: { type: "integer" },
            code: { type: "string" },
            title: { type: "string" },
            detail: { type: "string" },
            hint: { type: "string" },
          },
        },
        AccountSummary: {
          type: "object",
          properties: {
            id: { type: "string" },
            platform: { type: "string", enum: ["x", "threads"] },
            platform_account_id: { type: ["string", "null"] },
            username: { type: "string" },
            classification: { type: "string" },
            verification_status: { type: "string" },
            evidence_count: { type: "integer" },
            public_rationale: { type: ["string", "null"] },
          },
        },
        BlocklistResponse: {
          type: "object",
          properties: {
            schema_version: { type: "string" },
            total_matching: { type: "integer" },
            count: { type: "integer" },
            next_cursor: { type: ["string", "null"] },
            items: { type: "array", items: { type: "object" } },
          },
        },
        StatisticsResponse: {
          type: "object",
          properties: {
            totals: { type: "object" },
            by_platform: { type: "object" },
          },
        },
      },
    },
    paths: {
      "/health": {
        get: {
          operationId: "healthCheck",
          summary: "Check API health status",
          description: "Returns service health and runtime environment status.",
          responses: {
            "200": {
              description: "Service healthy",
              content: { "application/json": { schema: { type: "object" } } },
            },
          },
        },
      },
      "/statistics": {
        get: {
          operationId: "getStatistics",
          summary: "Get registry statistics",
          description: "Returns total indexed accounts, evidence coverage, and platform breakdown.",
          responses: {
            "200": {
              description: "Registry statistics",
              content: { "application/json": { schema: { $ref: "#/components/schemas/StatisticsResponse" } } },
            },
          },
        },
      },
      "/blocklists": {
        get: {
          operationId: "listBlocklists",
          summary: "Search and paginate indexed accounts",
          description: "Returns paginated behavioral blocklist entries with public evidence URLs.",
          parameters: [
            { name: "platform", in: "query", description: "Filter by social platform", schema: { type: "string", enum: ["x", "threads"] } },
            { name: "classification", in: "query", description: "Filter by classification", schema: { type: "string" } },
            { name: "q", in: "query", description: "Search handle or platform account ID", schema: { type: "string" } },
            { name: "limit", in: "query", description: "Max items per page (1-100)", schema: { type: "integer", default: 24, minimum: 1, maximum: 100 } },
            { name: "cursor", in: "query", description: "Opaque pagination cursor", schema: { type: "string" } },
          ],
          responses: {
            "200": {
              description: "Paginated account records",
              content: { "application/json": { schema: { $ref: "#/components/schemas/BlocklistResponse" } } },
            },
          },
        },
      },
      "/accounts/{platform}/{username}": {
        get: {
          operationId: "getAccountDossier",
          summary: "Get account intelligence dossier",
          description: "Retrieves full classification, rationale, source assertions, and evidence URLs for a handle.",
          parameters: [
            { name: "platform", in: "path", required: true, description: "Platform slug", schema: { type: "string", enum: ["x", "threads"] } },
            { name: "username", in: "path", required: true, description: "Account username without @", schema: { type: "string" } },
          ],
          responses: {
            "200": {
              description: "Account dossier",
              content: { "application/json": { schema: { $ref: "#/components/schemas/AccountSummary" } } },
            },
            "404": {
              description: "Account not indexed",
              content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
            },
          },
        },
      },
      "/blocklists/export": {
        get: {
          operationId: "exportBlocklists",
          summary: "Export blocklist feed",
          description: "Downloads the blocklist in JSON, CSV, or TXT format.",
          parameters: [
            { name: "format", in: "query", description: "Export format", schema: { type: "string", enum: ["json", "csv", "txt"], default: "json" } },
            { name: "platform", in: "query", description: "Optional platform filter", schema: { type: "string", enum: ["x", "threads"] } },
          ],
          responses: {
            "200": { description: "Export payload" },
          },
        },
      },
      "/transparency": {
        get: {
          operationId: "getTransparencyReport",
          summary: "Get audit ledger and SLA guarantees",
          description: "Returns SHA-256 audit chain integrity and non-negotiable policy commitments.",
          responses: {
            "200": {
              description: "Transparency report",
              content: { "application/json": { schema: { type: "object" } } },
            },
          },
        },
      },
      "/sources": {
        get: {
          operationId: "listSources",
          summary: "List external intelligence sources",
          description: "Returns upstream blocklist sources, licenses, reliability scores, and sync timestamps.",
          responses: {
            "200": {
              description: "Source list",
              content: { "application/json": { schema: { type: "object" } } },
            },
          },
        },
      },
      "/appeals/verify/init": {
        post: {
          operationId: "initAppealChallenge",
          summary: "Initiate account ownership verification",
          description: "Starts a bio-token or public-tweet ownership challenge (requires Turnstile token).",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["username", "turnstile_token"],
                  properties: {
                    platform: { type: "string", enum: ["x", "threads"], default: "x" },
                    username: { type: "string" },
                    method: { type: "string", enum: ["bio_token", "public_tweet"] },
                    turnstile_token: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            "201": { description: "Challenge created" },
            "403": { description: "Turnstile verification failed", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
            "404": { description: "Account not indexed", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          },
        },
      },
    },
  };

  return NextResponse.json(spec, {
    headers: {
      "Content-Type": "application/openapi+json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
