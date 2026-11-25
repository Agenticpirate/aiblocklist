"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle,
  WarningCircle,
  ArrowSquareOut,
  Heartbeat,
  MagnifyingGlass,
  Key,
  ArrowsClockwise,
  ArrowRight,
  Info,
  ShieldCheck,
  ShieldWarning,
  Sparkle,
  X,
  Scales,
  Eye,
  UserCircleCheck,
  Tag,
  Code,
  GearSix,
  EyeSlash,
} from "@phosphor-icons/react";
import {
  AccountPayload,
  fetchApi,
  formatClassificationLabel,
  formatVerificationLabel,
} from "@/lib/api";
import { XLogo, ThreadsLogo } from "@/components/PlatformSlideControl";
import { PreFlightEvaluator } from "@/components/PreFlightEvaluator";
import { XAlgorithmExplainer } from "@/components/XAlgorithmExplainer";

type Platform = "x" | "threads";

type CheckResult =
  | { kind: "listed"; username: string; platform: Platform; record: AccountPayload }
  | { kind: "not_indexed"; username: string; platform: Platform }
  | { kind: "error"; username: string; platform: Platform; message: string };

const UNDER_THE_HOOD_URL = "https://x.com/i/jf/under_the_hood";
const X_REPO = "https://github.com/xai-org/x-algorithm";

const SECTIONS = [
  { href: "#check", label: "Check account", icon: "check" },
  { href: "#reply-check", label: "Test a reply", icon: "reply" },
  { href: "#how-x-ranks", label: "How X ranks", icon: "ranks" },
  { href: "#under-the-hood", label: "Under the Hood", icon: "hood" },
  { href: "#threads", label: "Threads", icon: "threads" },
] as const;

const QUICK_EXAMPLES = ["FathinDev", "TyeInBloom"];

function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function AccountHealthPage() {
  const [platform, setPlatform] = useState<Platform>("x");
  const [handle, setHandle] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);

  const runCheck = async (e?: React.FormEvent, overrideHandle?: string) => {
    e?.preventDefault();
    const raw = overrideHandle ?? handle;
    const clean = raw
      .trim()
      .replace(/^@/, "")
      .replace(/^https?:\/\/(www\.)?(x|twitter|threads)\.(com|net)\/@?/i, "")
      .split(/[/?#]/)[0];
    if (!clean) return;

    if (overrideHandle) setHandle(clean);
    setLoading(true);
    setResult(null);
    try {
      const record = await fetchApi<AccountPayload>(`/accounts/${platform}/${encodeURIComponent(clean)}`);
      setResult({ kind: "listed", username: record.account.username || clean, platform, record });
    } catch (err) {
      const status = (err as { status?: number }).status;
      if (status === 404) {
        setResult({ kind: "not_indexed", username: clean, platform });
      } else {
        setResult({
          kind: "error",
          username: clean,
          platform,
          message: err instanceof Error ? err.message : "The registry could not be reached.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-3 sm:px-6 lg:px-8 py-3 sm:py-5 space-y-4 sm:space-y-5">
      {/* Header */}
      <header className="space-y-2.5 border-b border-[#272727] pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#313131] bg-[#181818] px-2.5 py-0.5 caption-5 font-mono text-[#ff6600]">
            <Heartbeat size={12} weight="bold" />
            <span>Reach &amp; Signal Diagnostics</span>
          </div>

          <Link
            href="/report"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#ff6600]/40 bg-[#181818] px-2.5 py-0.5 caption-5 font-mono text-[#ff6600] hover:border-[#ff6600] hover:bg-[#1F1F1F] transition-colors duration-300"
          >
            <ShieldWarning size={12} weight="bold" />
            <span>Report AI Bot</span>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div className="space-y-1 max-w-[680px]">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight leading-tight text-balance">
              <span className="bg-gradient-to-r from-white to-[#9B9B9B] bg-clip-text text-transparent">
                Account Health{" "}
              </span>
              <span className="text-[#ff6600]">&amp; Reach</span>
            </h1>
            <p className="caption-2 text-zinc-400 text-pretty">
              Check AIBlockList indexing, pre-flight test replies, and inspect how X scores engagement.
            </p>
          </div>
        </div>

        {/* Compact Icon Jump Bar */}
        <nav
          aria-label="On this page"
          className="-mx-3 px-3 sm:mx-0 sm:px-0 flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pt-0.5"
        >
          {SECTIONS.map((s) => (
            <a
              key={s.href}
              href={s.href}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-[#272727] bg-[#181818] px-2.5 py-1 caption-4 font-mono text-zinc-400 hover:border-[#ff6600]/60 hover:text-white hover:bg-[#1F1F1F] transition-colors duration-300"
            >
              {s.icon === "check" && <MagnifyingGlass size={12} weight="bold" className="text-[#ff6600]" />}
              {s.icon === "reply" && <Sparkle size={12} weight="bold" className="text-[#ff6600]" />}
              {s.icon === "ranks" && <Scales size={12} weight="bold" className="text-[#ff6600]" />}
              {s.icon === "hood" && <Eye size={12} weight="bold" className="text-[#ff6600]" />}
              {s.icon === "threads" && <ThreadsLogo className="w-3 h-3 text-zinc-300" shiny={false} />}
              <span>{s.label}</span>
            </a>
          ))}
        </nav>
      </header>

      {/* Compact Diagnostic Overview Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <a
          href="#check"
          className="group flex items-center gap-3 rounded-xl border border-[#272727] bg-[#181818] p-3 hover:border-[#ff6600]/50 hover:bg-[#1F1F1F] transition-colors duration-300"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#313131] bg-[#000000] text-[#ff6600]">
            <MagnifyingGlass size={16} weight="bold" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="title-4 text-white truncate">Handle Lookup</p>
            <p className="caption-5 text-zinc-400 truncate">Evidence &amp; appeal status</p>
          </div>
          <ArrowRight size={13} weight="bold" className="text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
        </a>

        <a
          href="#reply-check"
          className="group flex items-center gap-3 rounded-xl border border-[#272727] bg-[#181818] p-3 hover:border-[#ff6600]/50 hover:bg-[#1F1F1F] transition-colors duration-300"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#313131] bg-[#000000] text-[#ff6600]">
            <Sparkle size={16} weight="bold" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="title-4 text-white truncate">Reply Pre-Flight</p>
            <p className="caption-5 text-zinc-400 truncate">Catch spam triggers early</p>
          </div>
          <ArrowRight size={13} weight="bold" className="text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
        </a>

        <a
          href="#under-the-hood"
          className="group flex items-center gap-3 rounded-xl border border-[#272727] bg-[#181818] p-3 hover:border-[#ff6600]/50 hover:bg-[#1F1F1F] transition-colors duration-300"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#313131] bg-[#000000] text-emerald-400">
            <ShieldCheck size={16} weight="bold" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="title-4 text-white truncate">Platform Labels</p>
            <p className="caption-5 text-zinc-400 truncate">X &amp; Threads visibility flags</p>
          </div>
          <ArrowRight size={13} weight="bold" className="text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
        </a>
      </div>

      {/* Registry Check */}
      <section
        id="check"
        className="scroll-mt-20 rounded-2xl border border-[#272727] bg-[#181818] p-3.5 sm:p-5 space-y-3"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#313131] bg-[#000000] text-[#ff6600]">
              <MagnifyingGlass size={15} weight="bold" />
            </div>
            <div>
              <h2 className="title-3 text-white">Check an account</h2>
              <p className="caption-5 text-zinc-400">
                Search AIBlockList records by @username or profile URL
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="caption-5 font-mono text-zinc-500">Try:</span>
            {QUICK_EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => {
                  setPlatform("x");
                  runCheck(undefined, ex);
                }}
                className="rounded-md border border-[#313131] bg-[#1F1F1F] px-2 py-0.5 caption-5 font-mono text-zinc-300 hover:border-[#ff6600] hover:text-[#ff6600] transition-colors cursor-pointer"
              >
                @{ex}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={(e) => runCheck(e)} className="space-y-2.5">
          <div
            className="inline-flex rounded-xl border border-[#272727] bg-[#000000] p-1"
            role="tablist"
            aria-label="Platform"
          >
            {(["x", "threads"] as const).map((p) => (
              <button
                key={p}
                type="button"
                role="tab"
                aria-selected={platform === p}
                onClick={() => {
                  setPlatform(p);
                  setResult(null);
                }}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-mono transition-colors cursor-pointer ${
                  platform === p ? "bg-[#ff6600] text-black font-semibold" : "text-zinc-400 hover:text-white"
                }`}
              >
                {p === "x" ? <XLogo className="w-3 h-3" /> : <ThreadsLogo className="w-3.5 h-3.5" />}
                <span>{p === "x" ? "X" : "Threads"}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <label className="relative flex-1">
              <span className="sr-only">Username or profile URL</span>
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-zinc-500">@</span>
              <input
                type="text"
                inputMode="text"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="username or profile URL"
                className="w-full rounded-xl border border-[#313131] bg-[#000000] py-2.5 pl-8 pr-9 font-mono text-sm text-white placeholder-zinc-600 focus:border-[#ff6600] focus:outline-none transition-colors"
              />
              {handle && (
                <button
                  type="button"
                  onClick={() => {
                    setHandle("");
                    setResult(null);
                  }}
                  aria-label="Clear handle"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-white cursor-pointer"
                >
                  <X size={14} weight="bold" />
                </button>
              )}
            </label>
            <button
              type="submit"
              disabled={loading || !handle.trim()}
              className="button-sm inline-flex items-center justify-center gap-2 rounded-xl bg-[#ff6600] px-5 py-2.5 text-black hover:bg-[#e55c00] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
            >
              {loading ? (
                <ArrowsClockwise size={15} weight="bold" className="animate-spin" />
              ) : (
                <MagnifyingGlass size={15} weight="bold" />
              )}
              <span>{loading ? "Checking…" : "Check account"}</span>
            </button>
          </div>
        </form>

        <div aria-live="polite">
          {result?.kind === "error" && (
            <div className="rounded-xl border border-red-500/40 bg-[#1F1212] p-3.5 flex items-start justify-between gap-3">
              <div className="flex gap-2.5">
                <WarningCircle size={18} weight="bold" className="text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-white">We couldn&apos;t reach the registry</p>
                  <p className="text-[13px] text-zinc-400">{result.message}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => runCheck()}
                className="shrink-0 rounded-lg border border-[#313131] bg-[#181818] px-2.5 py-1 text-xs font-mono text-zinc-200 hover:border-white cursor-pointer"
              >
                Try again
              </button>
            </div>
          )}

          {result?.kind === "not_indexed" && (
            <div className="rounded-xl border border-emerald-500/30 bg-[#0F1B14] p-4 space-y-3">
              <div className="flex items-start gap-2.5">
                <CheckCircle size={20} weight="bold" className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-white">
                    @{result.username} has no record in our registry
                  </p>
                  <p className="text-[13px] text-zinc-400 leading-relaxed">
                    No reports or behavioral evidence are on file for this{" "}
                    {result.platform === "x" ? "X" : "Threads"} account.{" "}
                    {result.platform === "x" ? "X" : "Meta"} applies its own labels independently.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.platform === "x" ? (
                  <a
                    href={UNDER_THE_HOOD_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#313131] bg-[#000000] px-3 py-1.5 text-xs font-mono text-zinc-200 hover:border-[#ff6600] hover:text-[#ff6600] transition-colors"
                  >
                    <XLogo className="w-3 h-3" />
                    <span>See X&apos;s labels in Under the Hood</span>
                    <ArrowSquareOut size={12} weight="bold" />
                  </a>
                ) : (
                  <a
                    href="#threads"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#313131] bg-[#000000] px-3 py-1.5 text-xs font-mono text-zinc-200 hover:border-[#ff6600] hover:text-[#ff6600] transition-colors"
                  >
                    <ThreadsLogo className="w-3.5 h-3.5" />
                    <span>Check your Threads account status</span>
                    <ArrowRight size={12} weight="bold" />
                  </a>
                )}

                <Link
                  href={`/report?username=${encodeURIComponent(result.username)}&platform=${result.platform}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#ff6600]/40 bg-[#181818] px-3 py-1.5 text-xs font-mono text-[#ff6600] hover:border-[#ff6600] transition-colors"
                >
                  <ShieldWarning size={12} weight="bold" />
                  <span>Report this account</span>
                </Link>
              </div>
            </div>
          )}

          {result?.kind === "listed" && <ListedResult result={result} />}
        </div>
      </section>

      {/* Reply quality check */}
      <div id="reply-check" className="scroll-mt-20">
        <PreFlightEvaluator />
      </div>

      {/* How X ranks */}
      <XAlgorithmExplainer />

      {/* Under the Hood */}
      <section
        id="under-the-hood"
        className="scroll-mt-20 rounded-2xl border border-[#272727] bg-[#181818] p-3.5 sm:p-5 space-y-3"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5 max-w-2xl">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#313131] bg-[#000000] text-[#ff6600] mt-0.5">
              <Eye size={15} weight="bold" />
            </div>
            <div>
              <h2 className="title-3 text-white">See the labels on your own account</h2>
              <p className="caption-2 text-zinc-400 mt-0.5">
                X&apos;s Under the Hood report summarizes visibility-limiting labels and country withholdings.
              </p>
            </div>
          </div>
          <a
            href={UNDER_THE_HOOD_URL}
            target="_blank"
            rel="noreferrer"
            className="button-sm inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#ff6600] px-3.5 py-2 text-xs text-black hover:bg-[#e55c00] transition-colors shrink-0"
          >
            <XLogo className="w-3.5 h-3.5" />
            <span>Open Under the Hood</span>
            <ArrowSquareOut size={13} weight="bold" />
          </a>
        </div>

        <ol className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            { icon: UserCircleCheck, t: "Sign in to X", b: "Open the report while signed in to the account you want to review." },
            { icon: Tag, t: "Note each label", b: "Labels appear by name (e.g. DoNotAmplify, SpamHighRecall) with counts." },
            { icon: Code, t: "Look up in code", b: "Search the label in x-algorithm to see which rule applies it." },
          ].map(({ icon: StepIcon, t, b }, i) => (
            <li key={t} className="rounded-xl border border-[#272727] bg-[#000000] p-3">
              <div className="flex items-center justify-between">
                <span className="rounded border border-[#313131] bg-[#181818] px-1.5 py-0.5 text-[10px] font-mono text-[#ff6600]">
                  0{i + 1}
                </span>
                <StepIcon size={14} weight="bold" className="text-zinc-500" />
              </div>
              <p className="title-4 text-white mt-2">{t}</p>
              <p className="caption-5 text-zinc-400 mt-0.5">{b}</p>
            </li>
          ))}
        </ol>

        <p className="flex items-start gap-2 caption-5 text-zinc-500">
          <Info size={13} weight="bold" className="shrink-0 mt-0.5" />
          <span>
            X describes Under the Hood as a pilot rolling out gradually. Source:{" "}
            <a
              href={`${X_REPO}#under-the-hood-label-transparency-tool`}
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-[#ff6600]"
            >
              x-algorithm README
            </a>
            .
          </span>
        </p>
      </section>

      {/* Threads */}
      <section
        id="threads"
        className="scroll-mt-20 rounded-2xl border border-[#272727] bg-[#181818] p-3.5 sm:p-5 space-y-3"
      >
        <div className="flex items-start gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#313131] bg-[#000000] text-white mt-0.5">
            <ThreadsLogo className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="title-3 text-white">Check your Threads account status</h2>
            <p className="caption-2 text-zinc-400 mt-0.5">
              Threads shares its account-integrity systems with Instagram and reports restrictions inside the app.
            </p>
          </div>
        </div>
        <ol className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            { icon: GearSix, t: "Open Settings", b: "Go to your profile, tap the top-right menu icon, then Settings." },
            { icon: Heartbeat, t: "Account Status", b: "Tap Help, then Account Status." },
            { icon: EyeSlash, t: "Review restrictions", b: "Check Removed content and Features you can’t use." },
          ].map(({ icon: StepIcon, t, b }, i) => (
            <li key={t} className="rounded-xl border border-[#272727] bg-[#000000] p-3">
              <div className="flex items-center justify-between">
                <span className="rounded border border-[#313131] bg-[#181818] px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
                  0{i + 1}
                </span>
                <StepIcon size={14} weight="bold" className="text-zinc-500" />
              </div>
              <p className="title-4 text-white mt-2">{t}</p>
              <p className="caption-5 text-zinc-400 mt-0.5">{b}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function ListedResult({ result }: { result: Extract<CheckResult, { kind: "listed" }> }) {
  const a = result.record.account;
  const stats = [
    ["Classification", formatClassificationLabel(a.classification)],
    ["Verification", formatVerificationLabel(a.verification_status)],
    ["Confidence", a.confidence_level ? a.confidence_level.replace(/_/g, " ") : "—"],
    ["Evidence posts", String(a.evidence_count ?? result.record.evidence.length)],
    ["Last reviewed", formatDate(a.last_reviewed_at)],
    ["Appeal", a.appeal_status ? a.appeal_status.replace(/_/g, " ") : "none"],
  ];

  return (
    <div className="rounded-xl border border-[#ff6600]/40 bg-[#131209] p-4 space-y-3.5">
      <div className="flex items-start gap-2.5">
        <WarningCircle size={20} weight="bold" className="text-[#ff6600] shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-white">
            @{a.username} is listed in the AIBlockList registry
          </p>
          {a.public_rationale && (
            <p className="text-[13px] text-zinc-400 leading-relaxed mt-0.5">{a.public_rationale}</p>
          )}
        </div>
      </div>

      <dl className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {stats.map(([k, v]) => (
          <div key={k} className="rounded-lg border border-[#272727] bg-[#000000] px-3 py-2">
            <dt className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">{k}</dt>
            <dd className="text-[13px] text-white capitalize truncate" title={v}>
              {v}
            </dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-wrap gap-2">
        <Link
          href={`/accounts/${result.platform}/${encodeURIComponent(a.username)}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#313131] bg-[#181818] px-3 py-1.5 text-xs font-mono text-zinc-200 hover:border-white transition-colors"
        >
          <span>View full record</span>
          <ArrowRight size={12} weight="bold" />
        </Link>
        <Link
          href={`/appeals?username=${encodeURIComponent(a.username)}&platform=${result.platform}`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#ff6600] px-3 py-1.5 text-xs font-semibold text-black hover:bg-[#e55c00] transition-colors"
        >
          <Key size={12} weight="bold" />
          <span>Listed in error? Submit an appeal</span>
        </Link>
      </div>
    </div>
  );
}
