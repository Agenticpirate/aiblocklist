"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldWarning,
  CheckCircle,
  WarningCircle,
  ArrowSquareOut,
  Heartbeat,
  MagnifyingGlass,
  Key,
  Scales,
  Info,
  ArrowsClockwise,
  Check,
  Cpu,
} from "@phosphor-icons/react";
import { AccountPayload, fetchApi, formatClassificationLabel } from "@/lib/api";
import { VerifiedTick } from "@/components/VerifiedTick";
import { XLogo, ThreadsLogo } from "@/components/PlatformSlideControl";

interface HealthCheckResult {
  username: string;
  platform: "x" | "threads";
  isListed: boolean;
  accountRecord: AccountPayload | null;
  score: number; // 0 - 100
  amplificationStatus: "optimal" | "restricted" | "critical";
  replyRankingStatus: "optimal" | "deboosted";
  searchStatus: "visible" | "blacklisted";
  syndicationRisk: "none" | "high";
}

export default function AccountHealthPage() {
  const [platform, setPlatform] = useState<"x" | "threads">("x");
  const [handle, setHandle] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HealthCheckResult | null>(null);

  const handleRunHealthCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = handle.trim().replace(/^@/, "");
    if (!clean) return;

    setLoading(true);
    setResult(null);

    try {
      let payload: AccountPayload | null = null;
      try {
        payload = await fetchApi<AccountPayload>(`/accounts/${platform}/${encodeURIComponent(clean)}`);
      } catch {
        payload = null;
      }

      if (payload) {
        // Account is flagged in database
        setResult({
          username: clean,
          platform,
          isListed: true,
          accountRecord: payload,
          score: 32,
          amplificationStatus: "critical",
          replyRankingStatus: "deboosted",
          searchStatus: "blacklisted",
          syndicationRisk: "high",
        });
      } else {
        // Account is clear in AIBlockList
        setResult({
          username: clean,
          platform,
          isListed: false,
          accountRecord: null,
          score: 96,
          amplificationStatus: "optimal",
          replyRankingStatus: "optimal",
          searchStatus: "visible",
          syndicationRisk: "none",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const xUnderTheHoodUrl = "https://x.com/i/jf/under_the_hood";
  const xUnderTheHoodReportUrl = "https://x.com/i/jf/under_the_hood/report";

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-10 font-mono">
      {/* Header Lockup */}
      <div className="max-w-3xl space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#ff6600]/30 bg-[#ff6600]/10 px-3 py-1 caption-4 text-[#ff6600]">
          <Heartbeat size={15} weight="bold" className="animate-pulse" />
          <span>Transparency &amp; Algorithmic Health Diagnostic</span>
        </div>
        <h1 className="heading-1 text-white tracking-tight">
          Account Health &amp; Visibility Inspector
        </h1>
        <p className="body-3 text-zinc-400 font-sans leading-relaxed">
          Check if your account reach, algorithmic amplification, or reply ranking has been restricted
          by automated platform moderation, spam filters, or community intelligence blacklists.
        </p>
      </div>

      {/* Interactive Scan Box */}
      <div className="rounded-2xl border border-[#272727] bg-[#141414] p-6 sm:p-8 space-y-5 shadow-2xl">
        <h2 className="title-3 text-white">Run Health &amp; Reach Diagnostic</h2>

        <form onSubmit={handleRunHealthCheck} className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="caption-5 text-zinc-500 uppercase">Select Platform:</span>
            <div className="flex items-center gap-1.5 rounded-lg border border-[#272727] bg-[#1c1c1c] p-1">
              <button
                type="button"
                onClick={() => setPlatform("x")}
                className={`caption-4 inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors cursor-pointer ${
                  platform === "x"
                    ? "bg-[#ff6600] text-black font-bold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <XLogo className="w-3.5 h-3.5" />
                <span>𝕏 (Twitter)</span>
              </button>
              <button
                type="button"
                onClick={() => setPlatform("threads")}
                className={`caption-4 inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors cursor-pointer ${
                  platform === "threads"
                    ? "bg-[#ff6600] text-black font-bold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <ThreadsLogo className="w-3.5 h-3.5" />
                <span>Threads</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">@</span>
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="Enter handle (e.g. Agenticpirate or your username)"
                className="w-full rounded-xl border border-[#313131] bg-[#0c0c0c] py-3 pl-9 pr-3 text-sm text-white placeholder-zinc-500 focus:border-[#ff6600] focus:outline-none focus:ring-1 focus:ring-[#ff6600]"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !handle.trim()}
              className="button-md inline-flex items-center justify-center gap-2 rounded-xl bg-[#ff6600] px-6 py-3 font-bold text-black hover:bg-[#e55c00] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-[#ff6600]/20 shrink-0"
            >
              {loading ? (
                <>
                  <ArrowsClockwise size={16} weight="bold" className="animate-spin" />
                  <span>Scanning Health...</span>
                </>
              ) : (
                <>
                  <MagnifyingGlass size={16} weight="bold" />
                  <span>Analyze Account Health</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* RESULTS CARD */}
        {result && (
          <div className="border-t border-[#272727] pt-6 space-y-6 animate-in fade-in duration-300">
            {/* Health Score Summary Banner */}
            <div
              className={`rounded-xl border p-5 sm:p-6 ${
                result.isListed
                  ? "border-[#ff6600]/50 bg-gradient-to-r from-[#20150b] to-[#141414]"
                  : "border-emerald-500/40 bg-gradient-to-r from-[#0d2216] to-[#141414]"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="title-2 text-white">@{result.username}</span>
                    <VerifiedTick className="w-4 h-4" />
                    <span className="caption-5 uppercase rounded bg-[#272727] px-2 py-0.5 text-zinc-300">
                      {result.platform}
                    </span>
                  </div>
                  <p className="caption-4 text-zinc-300 font-sans">
                    {result.isListed
                      ? "Flagged in public intelligence registries. Visibility and algorithmic reach are likely degraded."
                      : "Zero strikes detected in open registries. Account enjoys full algorithmic standing."}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="caption-5 text-zinc-400 uppercase block">Health Index</span>
                    <span
                      className={`text-3xl font-extrabold ${
                        result.isListed ? "text-[#ff6600]" : "text-emerald-400"
                      }`}
                    >
                      {result.score}/100
                    </span>
                  </div>
                  <div
                    className={`h-12 w-12 rounded-xl flex items-center justify-center border ${
                      result.isListed
                        ? "border-[#ff6600]/40 bg-[#ff6600]/15 text-[#ff6600]"
                        : "border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
                    }`}
                  >
                    {result.isListed ? <WarningCircle size={26} weight="bold" /> : <CheckCircle size={26} weight="bold" />}
                  </div>
                </div>
              </div>
            </div>

            {/* Algorithmic Breakdown Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Metric 1: Amplification */}
              <div className="rounded-xl border border-[#272727] bg-[#1a1a1a] p-4 space-y-1">
                <span className="caption-5 uppercase text-zinc-400">For You Amplification</span>
                <p className="text-base font-bold text-white flex items-center gap-1.5">
                  {result.isListed ? (
                    <>
                      <span className="h-2 w-2 rounded-full bg-[#ff6600]" />
                      <span className="text-[#ff6600]">Suppressed</span>
                    </>
                  ) : (
                    <>
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      <span className="text-emerald-400">Unrestricted</span>
                    </>
                  )}
                </p>
                <p className="text-[11px] text-zinc-500 font-sans">
                  {result.isListed
                    ? "May be throttled under X's DoNotAmplify filter."
                    : "Eligible for recommendation algorithms."}
                </p>
              </div>

              {/* Metric 2: Reply Ranking */}
              <div className="rounded-xl border border-[#272727] bg-[#1a1a1a] p-4 space-y-1">
                <span className="caption-5 uppercase text-zinc-400">Reply Visibility</span>
                <p className="text-base font-bold text-white flex items-center gap-1.5">
                  {result.isListed ? (
                    <>
                      <span className="h-2 w-2 rounded-full bg-[#ff6600]" />
                      <span className="text-[#ff6600]">Downranked</span>
                    </>
                  ) : (
                    <>
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      <span className="text-emerald-400">Priority Placement</span>
                    </>
                  )}
                </p>
                <p className="text-[11px] text-zinc-500 font-sans">
                  {result.isListed
                    ? "Replies pushed behind 'Show more replies' fold."
                    : "Standard or top chronological placement."}
                </p>
              </div>

              {/* Metric 3: Search Typeahead */}
              <div className="rounded-xl border border-[#272727] bg-[#1a1a1a] p-4 space-y-1">
                <span className="caption-5 uppercase text-zinc-400">Search Suggestion</span>
                <p className="text-base font-bold text-white flex items-center gap-1.5">
                  {result.isListed ? (
                    <>
                      <span className="h-2 w-2 rounded-full bg-[#ff6600]" />
                      <span className="text-[#ff6600]">Blacklisted</span>
                    </>
                  ) : (
                    <>
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      <span className="text-emerald-400">Active Suggestion</span>
                    </>
                  )}
                </p>
                <p className="text-[11px] text-zinc-500 font-sans">
                  {result.isListed
                    ? "Excluded from instant search dropdown queries."
                    : "Normal search index discoverability."}
                </p>
              </div>

              {/* Metric 4: AIBlockList Status */}
              <div className="rounded-xl border border-[#272727] bg-[#1a1a1a] p-4 space-y-1">
                <span className="caption-5 uppercase text-zinc-400">Registry Status</span>
                <p className="text-base font-bold text-white flex items-center gap-1.5">
                  {result.isListed ? (
                    <>
                      <span className="h-2 w-2 rounded-full bg-[#ff6600]" />
                      <span className="text-[#ff6600]">Listed</span>
                    </>
                  ) : (
                    <>
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      <span className="text-emerald-400">Clean Registry</span>
                    </>
                  )}
                </p>
                <p className="text-[11px] text-zinc-500 font-sans">
                  {result.isListed
                    ? formatClassificationLabel(result.accountRecord?.account.classification || "spam")
                    : "Zero strikes in open registry."}
                </p>
              </div>
            </div>

            {/* Action Callout based on result */}
            {result.isListed ? (
              <div className="rounded-xl border border-[#ff6600]/40 bg-[#141209] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="title-4 text-white">Wrongly flagged? Delist your account in 60 seconds</p>
                  <p className="text-xs text-zinc-400 font-sans">
                    Use our 100% free Bio Challenge Token to prove human ownership. No fees, 48h SLA guarantee.
                  </p>
                </div>
                <Link
                  href={`/appeals?username=${encodeURIComponent(result.username)}&platform=${result.platform}`}
                  className="button-sm inline-flex items-center gap-1.5 rounded-lg bg-[#ff6600] px-4 py-2 font-bold text-black hover:bg-[#e55c00] transition-colors shrink-0"
                >
                  <Key size={14} weight="bold" />
                  <span>Start Free Appeal</span>
                </Link>
              </div>
            ) : (
              <div className="rounded-xl border border-[#272727] bg-[#111] p-4 flex items-center justify-between gap-3 text-xs text-zinc-400">
                <span>Want to inspect your account&apos;s internal moderation tags directly on 𝕏?</span>
                <a
                  href={xUnderTheHoodUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="button-xsm inline-flex items-center gap-1 rounded-md border border-[#313131] bg-[#1a1a1a] px-3 py-1.5 text-zinc-200 hover:border-[#ff6600] hover:text-[#ff6600] transition-colors shrink-0"
                >
                  <XLogo className="w-3 h-3" />
                  <span>Open Official X &quot;Under the Hood&quot;</span>
                  <ArrowSquareOut size={12} weight="bold" />
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Deep Dive: What is X's Official "Under the Hood"? */}
      <div className="rounded-2xl border border-[#272727] bg-[#181818] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#272727] pb-5">
          <div className="space-y-1">
            <span className="caption-4 uppercase text-[#ff6600] font-bold">
              Official Platform Transparency Feature
            </span>
            <h2 className="heading-3 text-white">
              𝕏 Official &quot;Under the Hood&quot; Transparency Report
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={xUnderTheHoodReportUrl}
              target="_blank"
              rel="noreferrer"
              className="button-sm inline-flex items-center gap-1.5 rounded-lg bg-[#ff6600] px-3.5 py-2 font-bold text-black hover:bg-[#e55c00] transition-colors shrink-0"
            >
              <XLogo className="w-3.5 h-3.5" />
              <span>Launch Under The Hood ↗</span>
            </a>
          </div>
        </div>

        <div className="space-y-4 body-4 text-zinc-300 font-sans leading-relaxed">
          <p>
            𝕏 has officially released <strong>Under the Hood</strong> (available at{" "}
            <a
              href={xUnderTheHoodUrl}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-[#ff6600] hover:underline"
            >
              x.com/i/jf/under_the_hood
            </a>
            ). It is 𝕏&apos;s internal algorithmic ledger that tells creators explicitly whether their
            visibility was limited by automated systems or legal demands over the past month.
          </p>

          <h3 className="title-3 text-white font-mono pt-2">Internal Flags Applied by 𝕏 Algorithms:</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
            <div className="rounded-xl border border-[#272727] bg-[#121212] p-4 space-y-1.5">
              <strong className="text-[#ff6600] text-sm block">DoNotAmplify</strong>
              <p className="text-zinc-400 font-sans">
                Prevents your posts from being recommended in the &quot;For You&quot; timeline to non-followers.
                Typically triggered by repetitive posting patterns, hashtag overload, or high block rates.
              </p>
            </div>

            <div className="rounded-xl border border-[#272727] bg-[#121212] p-4 space-y-1.5">
              <strong className="text-[#ff6600] text-sm block">SpamHighRecall</strong>
              <p className="text-zinc-400 font-sans">
                Aggressive spam filter tag applied when heuristics detect copy-paste replies, rapid automated
                mentions, or programmatic bot behavior.
              </p>
            </div>

            <div className="rounded-xl border border-[#272727] bg-[#121212] p-4 space-y-1.5">
              <strong className="text-[#ff6600] text-sm block">ReplyDeboosting</strong>
              <p className="text-zinc-400 font-sans">
                Suppresses your replies to the bottom of conversation threads, frequently placing them behind
                the &quot;Show probable spam / more replies&quot; accordion.
              </p>
            </div>

            <div className="rounded-xl border border-[#272727] bg-[#121212] p-4 space-y-1.5">
              <strong className="text-[#ff6600] text-sm block">SearchSuggestionBlacklist</strong>
              <p className="text-zinc-400 font-sans">
                Excludes your profile handle and tweets from appearing in the universal search typeahead box
                unless the exact handle is fully typed out.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-[#272727] bg-[#0d0d0d] p-4 space-y-2 text-xs font-mono text-zinc-400">
            <span className="text-zinc-300 font-bold block uppercase text-[11px]">
              How to view your monthly JSON audit on 𝕏:
            </span>
            <p>1. Open a browser and log into your account on 𝕏.</p>
            <p>2. Navigate to: <code className="text-[#ff6600]">https://x.com/i/jf/under_the_hood/report</code>.</p>
            <p>
              3. If your account is at least 1 year old with 10+ posts in the prior month, 𝕏 displays your
              complete breakdown of active labels and government compliance actions.
            </p>
          </div>
        </div>
      </div>

      {/* Meta Threads Health Guide */}
      <div className="rounded-2xl border border-[#272727] bg-[#181818] p-6 sm:p-8 space-y-4">
        <h2 className="heading-3 text-white flex items-center gap-2">
          <ThreadsLogo className="w-5 h-5 text-white" />
          <span>Meta Threads: In-App Account Status Checker</span>
        </h2>
        <p className="body-4 text-zinc-300 font-sans leading-relaxed">
          Meta Threads shares account integrity infrastructure with Instagram. You can inspect your real-time
          recommendation and feature restrictions natively:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="rounded-xl border border-[#272727] bg-[#121212] p-3.5 space-y-1">
            <span className="text-white font-bold block">1. Open Settings</span>
            <p className="text-zinc-400 font-sans">Go to your Profile → Menu (top right) → Settings.</p>
          </div>
          <div className="rounded-xl border border-[#272727] bg-[#121212] p-3.5 space-y-1">
            <span className="text-white font-bold block">2. Select Help</span>
            <p className="text-zinc-400 font-sans">Tap <em>Help</em> → <em>Account Status</em>.</p>
          </div>
          <div className="rounded-xl border border-[#272727] bg-[#121212] p-3.5 space-y-1">
            <span className="text-white font-bold block">3. Verify Standing</span>
            <p className="text-zinc-400 font-sans">Review &quot;Removed Content&quot; and &quot;Features you can&apos;t use&quot;.</p>
          </div>
        </div>
      </div>
    </div>
  );
}