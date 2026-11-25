import type { Metadata } from "next";
import Link from "next/link";
import { Code, Terminal, Key, ArrowUpRight, ShieldCheck } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "AIBlockList API & Developer Portal",
  description:
    "Developer portal for the AIBlockList API: OpenAPI 3.1 spec, quickstart guides, public sandbox endpoints, and behavioral spam registry integration.",
};

export default function DevelopersPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-6 sm:py-10 sm:px-6 lg:px-8 space-y-6">
      <div className="space-y-2">
        <p className="caption-4 font-mono uppercase text-[#ff6600]">
          Developer Portal · REST &amp; OpenAPI 3.1
        </p>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
          AIBlockList API &amp; Developer Portal
        </h1>
        <p className="body-6 text-zinc-400">
          Integrate AIBlockList behavioral bot intelligence into moderation pipelines, browser tools,
          or AI agents. Public read endpoints require zero API keys.
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link
          href="/openapi.json"
          className="rounded-xl border border-[#272727] bg-[#181818] p-4 hover:border-[#ff6600]/60 transition-colors"
        >
          <div className="flex items-center justify-between text-[#ff6600] font-mono text-xs font-bold">
            <span>OpenAPI 3.1 Spec</span>
            <ArrowUpRight size={14} weight="bold" />
          </div>
          <p className="caption-5 text-zinc-400 mt-1">
            Full typed schema at <code>/openapi.json</code> with operationIds.
          </p>
        </Link>

        <Link
          href="/mcp"
          className="rounded-xl border border-[#272727] bg-[#181818] p-4 hover:border-[#ff6600]/60 transition-colors"
        >
          <div className="flex items-center justify-between text-[#ff6600] font-mono text-xs font-bold">
            <span>MCP Server &amp; Tools</span>
            <ArrowUpRight size={14} weight="bold" />
          </div>
          <p className="caption-5 text-zinc-400 mt-1">
            SEP-1649 server card and WebMCP browser tool definitions.
          </p>
        </Link>

        <Link
          href="/api-docs"
          className="rounded-xl border border-[#272727] bg-[#181818] p-4 hover:border-[#ff6600]/60 transition-colors"
        >
          <div className="flex items-center justify-between text-[#ff6600] font-mono text-xs font-bold">
            <span>Endpoint Reference</span>
            <ArrowUpRight size={14} weight="bold" />
          </div>
          <p className="caption-5 text-zinc-400 mt-1">
            Interactive endpoint guide, export formats, and SLA rules.
          </p>
        </Link>
      </div>

      {/* Quickstart */}
      <div className="rounded-2xl border border-[#272727] bg-[#181818] p-5 space-y-4">
        <div className="flex items-center gap-2 text-white">
          <Terminal size={18} weight="bold" className="text-[#ff6600]" />
          <h2 className="title-2">Quickstart &amp; Sandbox Examples</h2>
        </div>
        <p className="body-6 text-zinc-400">
          Query the live production sandbox directly via HTTPS. Rate limit: 120 req/min for public reads.
        </p>
        <div className="space-y-3 font-mono text-xs">
          <div className="rounded-xl border border-[#272727] bg-[#000000] p-3.5 overflow-x-auto">
            <p className="text-zinc-500 mb-1"># 1. Check an X or Threads handle</p>
            <code className="text-zinc-200">
              curl -sS https://aiblocklist.com/api/v1/accounts/x/0x_Renjii
            </code>
          </div>
          <div className="rounded-xl border border-[#272727] bg-[#000000] p-3.5 overflow-x-auto">
            <p className="text-zinc-500 mb-1"># 2. Fetch paginated blocklist records</p>
            <code className="text-zinc-200">
              curl -sS &quot;https://aiblocklist.com/api/v1/blocklists?platform=x&amp;limit=24&quot;
            </code>
          </div>
          <div className="rounded-xl border border-[#272727] bg-[#000000] p-3.5 overflow-x-auto">
            <p className="text-zinc-500 mb-1"># 3. Export CSV / JSON / TXT feed</p>
            <code className="text-zinc-200">
              curl -sS &quot;https://aiblocklist.com/api/v1/blocklists/export?format=json&quot;
            </code>
          </div>
        </div>
      </div>

      {/* Auth & Keys */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-[#272727] bg-[#181818] p-5 space-y-2">
          <div className="flex items-center gap-2 text-white">
            <Key size={18} weight="bold" className="text-[#ff6600]" />
            <h2 className="title-3">API Keys &amp; Authentication</h2>
          </div>
          <p className="body-6 text-zinc-400">
            All read endpoints are open under ODC-By 1.0 with no API key required. Write actions
            (appeals) require Cloudflare Turnstile + bio-token or public-tweet ownership verification.
            See <Link href="/auth.md" className="text-[#ff6600] hover:underline">/auth.md</Link>.
          </p>
        </div>

        <div className="rounded-2xl border border-[#272727] bg-[#181818] p-5 space-y-2">
          <div className="flex items-center gap-2 text-white">
            <ShieldCheck size={18} weight="bold" className="text-[#ff6600]" />
            <h2 className="title-3">Open-Source Contributions</h2>
          </div>
          <p className="body-6 text-zinc-400">
            AIBlockList is Apache 2.0 open source. Explore the codebase, report issues, or
            contribute detection improvements on{" "}
            <a
              href="https://github.com/Agenticpirate/aiblocklist"
              target="_blank"
              rel="noreferrer"
              className="text-[#ff6600] hover:underline"
            >
              GitHub
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
