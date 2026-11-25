import { CodeHandoff } from "@/components/CodeHandoff";
import { CLIENT_API_BASE_URL } from "@/lib/api";

const ENDPOINTS = [
  {
    method: "GET",
    path: "/api/v1/accounts/{platform}/{username}",
    auth: "Public (60/min) · Key (600/min)",
    desc: "Lookup account record, canonical evidence URLs, and side by side source assertions. 404 never implies legitimacy or abuse.",
  },
  {
    method: "GET",
    path: "/api/v1/accounts/id/{platform}/{platform_account_id}",
    auth: "Public (60/min) · Key (600/min)",
    desc: "Immutable platform ID lookup immune to handle renames and handle squatting.",
  },
  {
    method: "GET",
    path: "/api/v1/blocklists",
    auth: "Public · Cursor paginated (max 500)",
    desc: "Filter indexed records by platform, source, classification, verification status, and public evidence availability.",
  },
  {
    method: "GET",
    path: "/api/v1/sources",
    auth: "Public (CDN cached 1h)",
    desc: "Federated source registry including license metadata, record counts, and reliability scores.",
  },
  {
    method: "GET",
    path: "/api/v1/categories",
    auth: "Public (CDN cached 24h)",
    desc: "Machine readable definitions of the 7 classification states and default extension behavior.",
  },
  {
    method: "GET",
    path: "/api/v1/statistics",
    auth: "Public (CDN cached 15m)",
    desc: "Aggregate evidence coverage, classification counts, and governance SLA targets.",
  },
  {
    method: "GET",
    path: "/api/v1/transparency",
    auth: "Public (CDN cached 5m)",
    desc: "Public correction log, SHA-256 audit chain status, and latest Merkle root checkpoint.",
  },
  {
    method: "POST",
    path: "/api/v1/reports",
    auth: "Protected (20/hr/IP + URL allowlist)",
    desc: "Queue behavioral report with 1 to 10 canonical public post URLs. Never publishes automatically.",
  },
  {
    method: "POST",
    path: "/api/v1/appeals/verify/init",
    auth: "Public ownership challenge",
    desc: "Issue a single use time limited bio verification token bound to the canonical account ID.",
  },
  {
    method: "POST",
    path: "/api/v1/appeals",
    auth: "Verified Appellant Session (1/14d)",
    desc: "Submit a free independent appeal routed to a reviewer excluded from the original decision.",
  },
];

export default function ApiDocsPage() {
  const swaggerUrl = CLIENT_API_BASE_URL.replace(/\/api\/v1$/, "/docs");

  return (
    <section className="mx-auto max-w-6xl px-4 py-4 sm:py-8 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
      <div className="max-w-[680px]">
        <p className="caption-3 font-mono uppercase text-[#ff6600] mb-2">
          OpenAPI 3.1 · RFC 9457 Problem Details
        </p>
        <h1 className="heading-2 text-white">Developer API reference</h1>
        <p className="body-3 mt-3 text-zinc-400">
          Versioned REST API designed for browser extensions, community moderation tools, and
          researchers. Supports ETag caching, cursor pagination, and zero egress snapshot manifests.
        </p>
        <div className="mt-4">
          <a
            href={swaggerUrl}
            target="_blank"
            rel="noreferrer"
            className="button-sm inline-flex items-center rounded-lg bg-[#ff6600] px-3 py-2 text-black hover:bg-[#e55c00] transition-colors duration-300"
          >
            Open interactive OpenAPI explorer
          </a>
        </div>
      </div>

      <CodeHandoff />

      <div className="rounded-2xl border border-[#272727] bg-[#181818] p-4 sm:p-6">
        <h2 className="title-1 text-white mb-4">REST API v1 endpoints</h2>
        <div className="space-y-3">
          {ENDPOINTS.map((ep) => (
            <div
              key={`${ep.method}-${ep.path}`}
              className="rounded-xl border border-[#272727] bg-[#000000] p-3 sm:p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex min-w-0 flex-wrap items-center gap-2 font-mono">
                  <span
                    className={`caption-4 rounded px-2 py-0.5 ${
                      ep.method === "POST"
                        ? "bg-[#ff6600] text-black"
                        : "border border-[#313131] bg-[#1f1f1f] text-zinc-200"
                    }`}
                  >
                    {ep.method}
                  </span>
                  <span className="body-4 min-w-0 break-all text-[13px] sm:text-sm text-white">{ep.path}</span>
                </div>
                <span className="caption-5 font-mono text-zinc-400">{ep.auth}</span>
              </div>
              <p className="body-6 mt-2 text-zinc-400">{ep.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
