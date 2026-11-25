import Link from "next/link";

export const dynamic = "force-dynamic";
import {
  ArrowRight,
  ArrowDown,
  Fingerprint,
  Scales,
  Database,
  Pulse,
  ShieldWarning,
} from "@phosphor-icons/react/dist/ssr";
import { ActionableHub } from "@/components/ActionableHub";
import { API_BASE_URL, BlocklistResponse, StatisticsResponse } from "@/lib/api";

async function getLiveStats(): Promise<StatisticsResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/statistics`, {
      next: { revalidate: 30 },
      signal: AbortSignal.timeout(3500),
    });
    if (!res.ok) return null;
    return (await res.json()) as StatisticsResponse;
  } catch {
    return null;
  }
}

async function getInitialBlocklist(): Promise<BlocklistResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/blocklists?limit=24`, {
      next: { revalidate: 30 },
      signal: AbortSignal.timeout(3500),
    });
    if (!res.ok) return null;
    return (await res.json()) as BlocklistResponse;
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const [stats, blocklistData] = await Promise.all([
    getLiveStats(),
    getInitialBlocklist(),
  ]);
  const totalIndexed = stats?.totals.indexed_accounts ?? (blocklistData?.total_matching ?? 3680);
  const meetingTwoUrls = stats?.totals.accounts_meeting_2_url_threshold ?? 884;

  return (
    <div className="pb-12">
      {/* COMPACT HERO + DIRECT LIVE REGISTRY */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-3 sm:pt-3 space-y-3 sm:space-y-5">
        {/* Compact Horizontal Hero Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 sm:gap-3 border-b border-[#272727] pb-2.5 sm:pb-4">
          <div className="max-w-[680px]">
            <h1 className="text-lg sm:text-3xl font-semibold tracking-tight leading-tight text-balance">
              <span className="bg-gradient-to-r from-white to-[#9B9B9B] bg-clip-text text-transparent">
                Filter AI Bot Replies.{" "}
              </span>
              <span className="text-[#ff6600]">Keep Your Feed Human.</span>
            </h1>
            <p className="caption-2 sm:body-6 text-zinc-400 mt-1.5 leading-relaxed">
              Filter AI bot replies on X and Threads to keep your feed human. Using AI in everyday work is great — we only target automated spam farming impressions. Let&apos;s use AI wisely.
            </p>
          </div>

          {/* Right-Aligned Compact Actions */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 shrink-0">
            <a
              href="#registry-feed"
              className="button-sm inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#ff6600] px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-semibold text-black hover:bg-[#e55c00] active:scale-[0.98] transition-all duration-300 whitespace-nowrap"
            >
              <span>Live Registry</span>
              <ArrowDown size={14} weight="bold" />
            </a>

            <Link
              href="/account-health"
              className="button-sm inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#313131] bg-[#181818] px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-semibold text-white hover:border-[#ff6600]/60 hover:bg-[#1F1F1F] transition-colors duration-300 whitespace-nowrap"
            >
              <Pulse size={14} weight="bold" className="text-[#ff6600]" />
              <span>Account Reach</span>
            </Link>

            <Link
              href="/report"
              className="col-span-2 sm:col-span-1 button-sm inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#ff6600]/40 bg-[#181818] px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#ff6600] hover:border-[#ff6600] hover:bg-[#1F1F1F] transition-colors duration-300 whitespace-nowrap"
            >
              <ShieldWarning size={14} weight="bold" />
              <span>Report AI Bot</span>
            </Link>
          </div>
        </div>

        {/* REAL LIST & SEARCH HUB DIRECTLY IN VIEWPORT */}
        <section id="registry-feed" aria-labelledby="registry-heading" className="scroll-mt-20">
          <h2 id="registry-heading" className="sr-only">
            AIBlockList AI Bot Blocklist &amp; X Spam Filter Live Registry
          </h2>
          <ActionableHub
            initialTotal={totalIndexed}
            totalIndexed={totalIndexed}
            meetingTwoUrls={meetingTwoUrls}
            initialItems={blocklistData?.items || []}
            initialNextCursor={blocklistData?.next_cursor || null}
          />
        </section>
      </section>

      {/* THREE ESSENTIAL PILLARS (COMPACT DEEP DIVE CALLOUTS) */}
      <section aria-labelledby="pillars-heading" className="mx-auto max-w-6xl px-4 pt-5 sm:pt-8 sm:px-6 lg:px-8 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="pillars-heading" className="title-3 text-white">
            How AIBlockList Works — Behavioral Verification &amp; Open Developer Tools
          </h2>
          <div className="flex items-center gap-3 font-mono text-xs text-zinc-400">
            <Link href="/developers" className="hover:text-[#ff6600] transition-colors">
              Developer Portal
            </Link>
            <span>·</span>
            <Link href="/mcp" className="hover:text-[#ff6600] transition-colors">
              MCP Server
            </Link>
            <span>·</span>
            <a
              href="https://github.com/Agenticpirate/aiblocklist"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#ff6600] transition-colors"
            >
              GitHub (OSS)
            </a>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Link
            href="/methodology"
            className="group rounded-xl border border-[#272727] bg-[#181818] p-4 transition-colors duration-300 hover:border-[#ff6600]/50 hover:bg-[#1F1F1F]"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#313131] bg-[#000000] text-[#ff6600]">
                  <Fingerprint size={17} weight="bold" />
                </div>
                <h3 className="title-3 text-white">Behavioral criteria</h3>
              </div>
              <ArrowRight size={14} weight="bold" className="text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="caption-2 text-zinc-400 mt-2">
              SIG-01 through SIG-05 deterministic signals. Zero probabilistic text detector bias.
            </p>
          </Link>

          <Link
            href="/appeals"
            className="group rounded-xl border border-[#272727] bg-[#181818] p-4 transition-colors duration-300 hover:border-[#ff6600]/50 hover:bg-[#1F1F1F]"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#313131] bg-[#000000] text-[#ff6600]">
                  <Scales size={17} weight="bold" />
                </div>
                <h3 className="title-3 text-white">Public appeals</h3>
              </div>
              <ArrowRight size={14} weight="bold" className="text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="caption-2 text-zinc-400 mt-2">
              Bio-token ownership verification and transparent independent review for responsible AI users.
            </p>
          </Link>

          <Link
            href="/transparency"
            className="group rounded-xl border border-[#272727] bg-[#181818] p-4 transition-colors duration-300 hover:border-[#ff6600]/50 hover:bg-[#1F1F1F]"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#313131] bg-[#000000] text-[#ff6600]">
                  <Database size={17} weight="bold" />
                </div>
                <h3 className="title-3 text-white">Transparency ledger</h3>
              </div>
              <ArrowRight size={14} weight="bold" className="text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="caption-2 text-zinc-400 mt-2">
              Cryptographically signed SHA-256 audit log of all indexations, reviews, and delistings.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
