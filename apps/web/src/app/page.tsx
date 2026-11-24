import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  DownloadSimple,
  Fingerprint,
  Scales,
  Database,
  ArrowUpRight,
  ArrowDown,
} from "@phosphor-icons/react/dist/ssr";
import { ActionableHub } from "@/components/ActionableHub";
import { UserAvatar } from "@/components/UserAvatar";
import { VerifiedTick } from "@/components/VerifiedTick";
import { XLogo } from "@/components/PlatformSlideControl";
import { API_BASE_URL, BlocklistResponse, StatisticsResponse } from "@/lib/api";

async function getLiveStats(): Promise<StatisticsResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/statistics`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as StatisticsResponse;
  } catch {
    return null;
  }
}

async function getInitialBlocklist(): Promise<BlocklistResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/blocklists?limit=24`, { cache: "no-store" });
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
  const featuredItems = blocklistData?.items?.slice(0, 3) || [];

  return (
    <div className="pb-12">
      {/* ACTIONABLE HERO & INTELLIGENCE COMMAND CENTER */}
      <section className="mx-auto max-w-6xl px-4 pt-4 sm:pt-6 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        
        {/* Split Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center border-b border-[#222222] pb-8 sm:pb-12">
          
          {/* Left Column (Value Proposition & CTAs) */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6">
            {/* Top Credibility Tag */}
            <div className="flex items-center gap-2 flex-wrap">
              <a
                href="https://x.com/Agenticpirate"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#313131] bg-[#141414] px-3 py-1 text-xs font-mono text-zinc-300 hover:border-[#ff6600] hover:text-[#ff6600] transition-colors"
                title="Built by @Agenticpirate on X"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#ff6600] animate-pulse" />
                <span>Built by @Agenticpirate</span>
                <span className="text-[10px]">↗</span>
              </a>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#272727] bg-[#121212] px-2.5 py-1 text-[11px] font-mono text-zinc-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Zero AI Text-Detector Bias</span>
              </span>
            </div>

            {/* Main Punchy Headline */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl border border-[#313131] bg-[#181818] p-1 shadow-lg shadow-[#ff6600]/10">
                  <Image
                    src="/logo.png"
                    alt="AIBlockList Logo"
                    width={48}
                    height={48}
                    priority
                    className="h-full w-full object-contain"
                  />
                </div>
                <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white">
                  AIBlockList<span className="text-[#ff6600]">.</span>
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.12]">
                Filter Abusive AI Bot Replies.{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6600] to-[#ff9933]">
                  Keep Your Feed Human.
                </span>
              </h1>
            </div>

            {/* Subtitle */}
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-xl">
              Independent, open-source trust infrastructure separating low-value automated reply spam
              from authentic human speech across 𝕏 and Threads. Backed by verifiable behavioral evidence and human dual-review.
            </p>

            {/* High-Converting CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href="/extension"
                className="button-md inline-flex items-center justify-center gap-2 rounded-xl bg-[#ff6600] px-5 py-3 font-bold text-black hover:bg-[#e55c00] active:scale-[0.98] transition-all shadow-xl shadow-[#ff6600]/25 text-sm"
              >
                <ShieldCheck size={18} weight="bold" />
                <span>Get Free Extension</span>
              </Link>

              <a
                href="#registry-feed"
                className="button-md inline-flex items-center justify-center gap-2 rounded-xl border border-[#313131] bg-[#181818] px-4 py-3 text-sm font-medium text-zinc-200 hover:bg-[#222222] hover:text-white transition-all active:scale-[0.98]"
              >
                <span>Explore Live Registry</span>
                <ArrowDown size={14} weight="bold" />
              </a>
            </div>

            {/* Micro Social Proof / Trust Row */}
            <div className="grid grid-cols-3 gap-3 pt-2 max-w-lg border-t border-[#1f1f1f]">
              <div>
                <p className="font-mono text-lg sm:text-xl font-bold text-white">
                  {totalIndexed.toLocaleString()}
                </p>
                <p className="font-mono text-[11px] text-zinc-500">Indexed Accounts</p>
              </div>
              <div>
                <p className="font-mono text-lg sm:text-xl font-bold text-[#ff6600]">
                  {meetingTwoUrls.toLocaleString()}
                </p>
                <p className="font-mono text-[11px] text-zinc-500">≥ 2 Evidence Proofs</p>
              </div>
              <div>
                <p className="font-mono text-lg sm:text-xl font-bold text-emerald-400">
                  100%
                </p>
                <p className="font-mono text-[11px] text-zinc-500">Public Provenance</p>
              </div>
            </div>
          </div>

          {/* Right Column: Real Live Flagged Tweets Showcase */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-[#272727] bg-[#0c0c0c] shadow-2xl overflow-hidden">
              {/* Header Bar of the Tweet Showcase */}
              <div className="flex items-center justify-between border-b border-[#222] bg-[#141414] px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff6600] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff6600]" />
                  </span>
                  <span className="font-mono text-xs font-bold text-zinc-200 tracking-wider uppercase">
                    Live Flagged Replies
                  </span>
                </div>
                <span className="font-mono text-[10px] text-zinc-500 rounded bg-[#1e1e1e] px-2 py-0.5">
                  Real-time audit
                </span>
              </div>

              {/* Stacked Live Tweet Cards */}
              <div className="divide-y divide-[#1c1c1c] p-1">
                {featuredItems.map((item) => {
                  const a = item.account;
                  const quoteText =
                    a.primary_quote ||
                    item.evidence.find((e) => e.post_text)?.post_text ||
                    (item.evidence[0]?.metrics?.post_text as string) ||
                    "Automated high-velocity pattern detected.";
                  const firstEv = item.evidence[0];
                  const firstEvUrl = firstEv?.public_post_url;

                  return (
                    <div
                      key={`hero-tweet-${a.id}`}
                      className="p-3.5 hover:bg-[#121212] transition-colors rounded-xl"
                    >
                      {/* Author Header */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <UserAvatar
                            username={a.username}
                            platformAccountId={a.platform_account_id}
                            platform={a.platform}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white text-xs sm:text-[13px] truncate">
                                @{a.username}
                              </span>
                              <VerifiedTick type={a.verified_badge || "blue"} size={13} />
                              <XLogo className="w-3 h-3 text-zinc-500 shrink-0" />
                            </div>
                            <span className="text-[10px] font-mono text-zinc-500 block truncate">
                              ID: {a.platform_account_id}
                            </span>
                          </div>
                        </div>

                        <span className="shrink-0 text-[9px] uppercase font-mono px-1.5 py-0.5 rounded border border-[#ff6600]/40 bg-[#ff6600]/10 text-[#ff6600] font-bold">
                          AI Reply Loop
                        </span>
                      </div>

                      {/* Quoted Flagged Reply */}
                      <p className="mt-2 text-zinc-300 text-xs leading-relaxed italic line-clamp-2">
                        “{quoteText}”
                      </p>

                      {/* Card Footer Link */}
                      <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-1.5 border-t border-[#181818]">
                        <span>{firstEv?.post_date || "Nov 24, 2026"}</span>
                        {firstEvUrl && (
                          <a
                            href={firstEvUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[#ff6600] hover:underline"
                          >
                            <span>Inspect on 𝕏</span>
                            <ArrowUpRight size={10} weight="bold" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom prompt guiding users to scroll */}
              <a
                href="#registry-feed"
                className="block bg-[#121212] hover:bg-[#181818] border-t border-[#222] py-2.5 px-4 text-center font-mono text-xs text-zinc-400 hover:text-white transition-colors"
              >
                <span>Scroll to search &amp; filter all {totalIndexed.toLocaleString()} accounts ↓</span>
              </a>
            </div>
          </div>
        </div>

        {/* Anchor Target for smooth scrolling into the Registry Hub */}
        <div id="registry-feed" className="scroll-mt-24">
          <ActionableHub
            initialTotal={totalIndexed}
            totalIndexed={totalIndexed}
            meetingTwoUrls={meetingTwoUrls}
            initialItems={blocklistData?.items || []}
            initialNextCursor={blocklistData?.next_cursor || null}
          />
        </div>
      </section>

      {/* THREE ESSENTIAL PILLARS (DEEP DIVE CALLOUTS) */}
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Link
            href="/methodology"
            className="group rounded-2xl border border-[#272727] bg-[#181818] p-6 transition-all duration-300 hover:border-[#ff6600]/50 hover:bg-[#1f1f1f]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#313131] bg-[#000000] text-[#ff6600] group-hover:scale-105 transition-transform">
              <Fingerprint size={24} weight="bold" />
            </div>
            <h3 className="heading-4 text-white mt-4 flex items-center justify-between">
              <span>Behavioral criteria</span>
              <ArrowRight size={16} weight="bold" className="text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="body-5 text-zinc-400 mt-2">
              SIG-01 through SIG-05 deterministic signals. Zero probabilistic text detector bias.
            </p>
          </Link>

          <Link
            href="/appeals"
            className="group rounded-2xl border border-[#272727] bg-[#181818] p-6 transition-all duration-300 hover:border-[#ff6600]/50 hover:bg-[#1f1f1f]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#313131] bg-[#000000] text-[#ff6600] group-hover:scale-105 transition-transform">
              <Scales size={24} weight="bold" />
            </div>
            <h3 className="heading-4 text-white mt-4 flex items-center justify-between">
              <span>Fast-track appeals</span>
              <ArrowRight size={16} weight="bold" className="text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="body-5 text-zinc-400 mt-2">
              Automated 60-second dispute token generation with 72-hour dual human review guarantee.
            </p>
          </Link>

          <Link
            href="/transparency"
            className="group rounded-2xl border border-[#272727] bg-[#181818] p-6 transition-all duration-300 hover:border-[#ff6600]/50 hover:bg-[#1f1f1f]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#313131] bg-[#000000] text-[#ff6600] group-hover:scale-105 transition-transform">
              <Database size={24} weight="bold" />
            </div>
            <h3 className="heading-4 text-white mt-4 flex items-center justify-between">
              <span>Transparency ledger</span>
              <ArrowRight size={16} weight="bold" className="text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="body-5 text-zinc-400 mt-2">
              Cryptographically signed SHA-256 audit log of all indexations, reviews, and delistings.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
