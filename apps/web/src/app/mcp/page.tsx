import type { Metadata } from "next";
import Link from "next/link";
import { Cpu, ArrowUpRight, Code } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "AIBlockList MCP Server & Agent Tools",
  description:
    "Connect AI agents to AIBlockList using our SEP-1649 MCP Server Card, WebMCP browser tools, and ARD capability manifest.",
};

export default function McpPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-6 sm:py-10 sm:px-6 lg:px-8 space-y-6">
      <div className="space-y-2">
        <p className="caption-4 font-mono uppercase text-[#ff6600]">
          Model Context Protocol · SEP-1649 &amp; WebMCP
        </p>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
          AIBlockList MCP Server
        </h1>
        <p className="body-6 text-zinc-400">
          AIBlockList exposes machine-readable discovery metadata and browser-native WebMCP tools
          so AI assistants and agents can check X and Threads accounts for automated reply spam.
        </p>
      </div>

      <div className="rounded-2xl border border-[#272727] bg-[#181818] p-5 space-y-4">
        <div className="flex items-center gap-2 text-white">
          <Cpu size={18} weight="bold" className="text-[#ff6600]" />
          <h2 className="title-2">Discovery Endpoints</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
          <Link
            href="/.well-known/mcp/server-card.json"
            className="rounded-xl border border-[#272727] bg-[#000000] p-3.5 hover:border-[#ff6600]/60 transition-colors"
          >
            <div className="flex items-center justify-between text-[#ff6600] font-bold">
              <span>MCP Server Card</span>
              <ArrowUpRight size={14} weight="bold" />
            </div>
            <p className="text-zinc-400 mt-1">/.well-known/mcp/server-card.json</p>
          </Link>

          <Link
            href="/.well-known/ai-catalog.json"
            className="rounded-xl border border-[#272727] bg-[#000000] p-3.5 hover:border-[#ff6600]/60 transition-colors"
          >
            <div className="flex items-center justify-between text-[#ff6600] font-bold">
              <span>ARD Capability Manifest</span>
              <ArrowUpRight size={14} weight="bold" />
            </div>
            <p className="text-zinc-400 mt-1">/.well-known/ai-catalog.json</p>
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-[#272727] bg-[#181818] p-5 space-y-3">
        <div className="flex items-center gap-2 text-white">
          <Code size={18} weight="bold" className="text-[#ff6600]" />
          <h2 className="title-2">Available Agent Tools</h2>
        </div>
        <ul className="space-y-2 text-sm text-zinc-300 font-mono">
          <li>
            <strong className="text-[#ff6600]">check_account_status</strong> — Look up an X or Threads handle and inspect evidence URLs.
          </li>
          <li>
            <strong className="text-[#ff6600]">search_blocklist</strong> — Search or paginate indexed accounts across platforms.
          </li>
          <li>
            <strong className="text-[#ff6600]">get_registry_statistics</strong> — Retrieve total indexed accounts and platform breakdown.
          </li>
        </ul>
      </div>
    </section>
  );
}
