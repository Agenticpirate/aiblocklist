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
} from "@phosphor-icons/react/dist/ssr";
import { ActionableHub } from "@/components/ActionableHub";
import { QuickCheckTriggerButton } from "@/components/QuickCheckTriggerButton";
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

  return (
    <div className="pb-12">
      {/* ACTIONABLE HERO & INTELLIGENCE COMMAND CENTER */}
      <section className="mx-auto max-w-6xl px-4 pt-4 sm:pt-6 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Top Header Block */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6 border-b border-[#272727] pb-6 sm:pb-8">
          <div className="space-y-3.5 sm:space-y-4 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-[#272727] bg-[#181818] px-2.5 py-1 text-xs">
                <span className="h-2 w-2 rounded-full bg-[#ff6600]" />
                <span className="font-mono text-zinc-300 text-[11px] sm:text-xs">
                  <span className="hidden sm:inline">Policy v1.0.0 · </span>Trust &amp; Safety Infra
                </span>
              </div>
              <a
                href="https://x.com/Agenticpirate"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#313131] bg-[#181818] px-2.5 py-1 text-[11px] sm:text-xs font-mono text-zinc-300 hover:border-[#ff6600] hover:text-[#ff6600] transition-colors"
                title="Built by @Agenticpirate"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#ff6600]" />
                <span>Built by @Agenticpirate</span>
                <span className="text-[10px]">↗</span>
              </a>
            </div>

            {/* Prominent Logo & Heading Lockup */}
            <div className="flex items-center gap-3.5 sm:gap-4">
              <div className="relative flex h-12 w-12 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl border border-[#313131] bg-[#181818] p-1.5 shadow-xl shadow-[#ff6600]/10 transition-transform duration-300 hover:scale-105">
                <Image
                  src="/logo.png"
                  alt="AIBlockList Official Logo"
                  width={64}
                  height={64}
                  priority
                  className="h-full w-full object-contain"
                />
              </div>

              <div>
                <h1 className="text-3xl sm:heading-1 hero-heading-gradient tracking-tight font-bold">
                  AIBlockList<span className="text-[#ff6600]">.</span>
                </h1>
              </div>
            </div>

            <p className="body-4 sm:body-3 text-zinc-400 leading-relaxed">
              Identify, verify, and filter abusive automated social media behavior across X and
              Threads. Verifiable behavioral evidence, human dual-review, and zero AI text detector bias.
            </p>
          </div>

          {/* Cleanly Aligned Action Buttons (2x2 on mobile, flex row on desktop) */}
          <div className="grid grid-cols-2 sm:flex sm:flex-nowrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto shrink-0 self-start lg:self-center">
            <QuickCheckTriggerButton label="Am I Blocked?" className="w-full text-center" />

            <Link
              href="/extension"
              className="button-sm inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg bg-[#ff6600] px-3.5 sm:px-4 py-2 sm:py-2.5 font-bold text-black hover:bg-[#e55c00] active:scale-[0.98] transition-all whitespace-nowrap shadow-lg shadow-[#ff6600]/20 text-xs sm:text-sm text-center"
            >
              <ShieldCheck size={16} weight="bold" />
              <span>Get Extension</span>
            </Link>

            <Link
              href="/report"
              className="button-sm inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#313131] bg-[#181818] px-3 sm:px-4 py-2 sm:py-2.5 text-zinc-200 hover:bg-[#272727] hover:text-white active:scale-[0.98] transition-all whitespace-nowrap text-xs sm:text-sm text-center"
            >
              <span>Report Spammer</span>
              <ArrowRight size={13} weight="bold" />
            </Link>

            <Link
              href="/appeals"
              className="button-sm inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#313131] bg-[#181818] px-3 sm:px-4 py-2 sm:py-2.5 text-zinc-200 hover:bg-[#272727] hover:text-white active:scale-[0.98] transition-all whitespace-nowrap text-xs sm:text-sm text-center"
            >
              <span>File Appeal</span>
            </Link>
          </div>
        </div>

        {/* THE ACTIONABLE INTELLIGENCE HUB (PREMIUM STATS, SLIDING PLATFORM CONTROL, SEARCH, FILTERS, DIRECTORY GRID) */}
        <ActionableHub
          initialTotal={totalIndexed}
          totalIndexed={totalIndexed}
          meetingTwoUrls={meetingTwoUrls}
          initialItems={blocklistData?.items || []}
          initialNextCursor={blocklistData?.next_cursor || null}
        />
      </section>

      {/* THREE ESSENTIAL PILLARS (DEEP DIVE CALLOUTS) */}
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Link
            href="/methodology"
            className="group rounded-2xl border border-[#272727] bg-[#181818] p-6 hover:border-[#313131] hover:bg-[#1f1f1f] transition-all"
          >
            <div className="flex items-center justify-between text-[#ff6600] mb-3">
              <Fingerprint size={22} weight="bold" />
              <ArrowRight size={16} weight="bold" className="group-hover:translate-x-1 transition-transform" />
            </div>
            <h2 className="title-3 text-white">5 Behavioral Signals</h2>
            <p className="body-6 text-zinc-400 mt-2">
              Explore SIG-01 to SIG-05 deterministic verification, publication gates, and why velocity
              is corroborative only.
            </p>
          </Link>

          <Link
            href="/about"
            className="group rounded-2xl border border-[#272727] bg-[#181818] p-6 hover:border-[#313131] hover:bg-[#1f1f1f] transition-all"
          >
            <div className="flex items-center justify-between text-[#ff6600] mb-3">
              <ShieldCheck size={22} weight="bold" />
              <ArrowRight size={16} weight="bold" className="group-hover:translate-x-1 transition-transform" />
            </div>
            <h2 className="title-3 text-white">Fairness & Charter</h2>
            <p className="body-6 text-zinc-400 mt-2">
              Why AI text detectors fail non-native English speakers, our open-source charter, and human
              dual review.
            </p>
          </Link>

          <Link
            href="/transparency"
            className="group rounded-2xl border border-[#272727] bg-[#181818] p-6 hover:border-[#313131] hover:bg-[#1f1f1f] transition-all"
          >
            <div className="flex items-center justify-between text-[#ff6600] mb-3">
              <Database size={22} weight="bold" />
              <ArrowRight size={16} weight="bold" className="group-hover:translate-x-1 transition-transform" />
            </div>
            <h2 className="title-3 text-white">Cryptographic Audit Chain</h2>
            <p className="body-6 text-zinc-400 mt-2">
              Inspect the append-only SHA-256 hash log recording every moderation decision, appeal, and
              policy update.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
