"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle,
  WarningCircle,
  Scales,
  Key,
  ShieldCheck,
  ArrowSquareOut,
  MagnifyingGlass,
  ArrowLeft,
  Copy,
  Check,
  Plus,
  Trash,
  Clock,
} from "@phosphor-icons/react";
import { fetchApi } from "@/lib/api";
import { QuickCheckModal } from "@/components/QuickCheckModal";
import { XLogo, ThreadsLogo } from "@/components/PlatformSlideControl";
import { XSuspensionGuide } from "@/components/XSuspensionGuide";

interface ChallengeInit {
  challenge_id: string;
  account_username: string;
  platform_account_id: string | null;
  verification_token: string;
  expires_at: string;
  instructions: string;
}

interface AppealConfirmation {
  appeal_id: string;
  status: string;
  expedited_triage?: boolean;
  triage_hours?: number;
  triage_target_date: string;
  sla_target_date: string;
  scope_notice: string;
}

interface AppealStatusRecord {
  appeal_id: string;
  status: string;
  submitted_at: string;
  triage_target_date: string;
  sla_target_date: string;
  public_correction_note: string | null;
}

const APPEAL_GROUNDS = [
  {
    id: "false_positive",
    label: "False positive / Human-written",
    hint: "I am a human creator and my replies were manually written, not automated bot spam.",
  },
  {
    id: "disputed_context",
    label: "Disputed tweet / Missing context",
    hint: "The flagged post was satire, a quote/excerpt, or taken out of surrounding thread context.",
  },
  {
    id: "compromised_resolved",
    label: "Compromised account (secured)",
    hint: "Unauthorized third-party automation posted while hacked; apps revoked and 2FA enabled.",
  },
  {
    id: "unverified_import",
    label: "Unverified external listing",
    hint: "Imported from an external list without independent AIBlockList verification or evidence.",
  },
  {
    id: "remediation",
    label: "Automation stopped (30+ days)",
    hint: "Former automated reply tooling has been permanently disconnected for 30+ consecutive days.",
  },
] as const;

const USAGE_HISTORY_OPTIONS = [
  {
    id: "never",
    label: "Never used automated reply tools",
    hint: "100% manual replies written by me.",
  },
  {
    id: "assist_only",
    label: "Manual AI drafting / grammar / translation",
    hint: "Used AI for writing help or translation, never auto-posted.",
  },
  {
    id: "past_tool_stopped",
    label: "Past automation / AI-reply tool (stopped)",
    hint: "Previously tested or used an automated tool, now permanently removed.",
  },
  {
    id: "compromised",
    label: "Unauthorized third-party app / hacked",
    hint: "A compromised session or third-party app posted without permission.",
  },
] as const;

const AI_USAGE_REASONS = [
  { id: "never_used", label: "Never used AI / automation (false positive)" },
  { id: "grammar_translation", label: "Grammar, spelling, or English translation" },
  { id: "accessibility", label: "Accessibility / dyslexia / typing assistance" },
  { id: "creator_scheduling", label: "Content scheduling or creator workflow (no auto-replies)" },
  { id: "tested_automation", label: "Tested an AI-reply / growth tool (now stopped)" },
  { id: "hacked_compromised", label: "Account was hacked / unauthorized third-party app" },
] as const;

const FORWARD_COMMITMENTS = [
  "100% manual, human-written replies only",
  "Revoked all third-party OAuth & automation apps",
  "Enabled 2FA & rotated account credentials",
  "Zero automated reply or engagement-farming scripts",
] as const;

function AppealsContent() {
  const searchParams = useSearchParams();
  const paramUsername = searchParams.get("username") || "";
  const paramPlatform = (searchParams.get("platform") || "x") as "x" | "threads";
  const paramPostUrl = searchParams.get("post_url") || "";

  const [platform, setPlatform] = useState<"x" | "threads">(paramPlatform);
  const [activeTab, setActiveTab] = useState<"aiblocklist" | "x_suspension">(
    searchParams.get("tab") === "x_suspension" ? "x_suspension" : "aiblocklist"
  );
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [verifyMethod, setVerifyMethod] = useState<"public_tweet" | "bio_token">("public_tweet");
  const [appealTweetUrl, setAppealTweetUrl] = useState("");
  const [username, setUsername] = useState(paramUsername);
  const [challenge, setChallenge] = useState<ChallengeInit | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [ground, setGround] = useState<string>("false_positive");
  const [usageHistory, setUsageHistory] = useState<string>("never");
  const [aiUsageReasonCode, setAiUsageReasonCode] = useState<string>("never_used");
  const [usageReason, setUsageReason] = useState("");
  const [forwardCommitments, setForwardCommitments] = useState<string[]>([
    "100% manual, human-written replies only",
  ]);
  const [goingForward, setGoingForward] = useState("");
  const [humanAttested, setHumanAttested] = useState(false);
  const [statement, setStatement] = useState("");
  const [supportingUrls, setSupportingUrls] = useState<string[]>(
    paramPostUrl ? [paramPostUrl] : [""]
  );
  const [confirmation, setConfirmation] = useState<AppealConfirmation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [quickCheckOpen, setQuickCheckOpen] = useState(false);

  // Appeal Status Tracker state
  const [trackId, setTrackId] = useState("");
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState<string | null>(null);
  const [trackedAppeal, setTrackedAppeal] = useState<AppealStatusRecord | null>(null);

  useEffect(() => {
    if (paramUsername && !username) {
      setUsername(paramUsername.replace(/^@/, ""));
    }
    if (paramPlatform === "x" || paramPlatform === "threads") {
      setPlatform(paramPlatform);
    }
    if (paramPostUrl) {
      setSupportingUrls((prev) => {
        if (prev.includes(paramPostUrl)) return prev;
        const nonEmpty = prev.filter((u) => u.trim().length > 0);
        return [paramPostUrl, ...nonEmpty].slice(0, 5);
      });
    }
  }, [paramUsername, paramPlatform, paramPostUrl]);

  async function startChallenge(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetchApi<ChallengeInit>("/appeals/verify/init", {
        method: "POST",
        body: JSON.stringify({
          platform,
          username: username.trim().replace(/^@/, ""),
          method: "bio_token",
        }),
      });
      setChallenge(res);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not initiate ownership verification.");
    } finally {
      setLoading(false);
    }
  }

  async function confirmChallenge() {
    if (!challenge) return;
    if (verifyMethod === "public_tweet" && !appealTweetUrl.trim()) {
      setError("Paste the URL of your public appeal tweet mentioning aiblocklist.com.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetchApi<{ appellant_session_token: string }>("/appeals/verify/confirm", {
        method: "POST",
        body: JSON.stringify({
          challenge_id: challenge.challenge_id,
          verification_token: challenge.verification_token,
          ...(verifyMethod === "public_tweet" ? { appeal_tweet_url: appealTweetUrl.trim() } : {}),
        }),
      });
      if (verifyMethod === "public_tweet" && appealTweetUrl.trim()) {
        setSupportingUrls((prev) =>
          prev.includes(appealTweetUrl.trim())
            ? prev
            : [appealTweetUrl.trim(), ...prev.filter((u) => u.trim().length > 0)].slice(0, 5)
        );
      }
      setSessionToken(res.appellant_session_token);
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ownership verification failed.");
    } finally {
      setLoading(false);
    }
  }

  async function submitAppeal(e: React.FormEvent) {
    e.preventDefault();
    if (!challenge || !sessionToken) return;
    if (!humanAttested) {
      setError("You must confirm the human ownership & non-bot attestation before submitting.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const selectedGround = APPEAL_GROUNDS.find((g) => g.id === ground);
      const selectedUsage = USAGE_HISTORY_OPTIONS.find((u) => u.id === usageHistory);
      const selectedExactReason = AI_USAGE_REASONS.find((r) => r.id === aiUsageReasonCode);
      const sections = [
        `[${selectedGround?.label || ground}]`,
        `Usage History: ${selectedUsage?.label || usageHistory}`,
        `Exact Reason Behind Usage: ${selectedExactReason?.label || aiUsageReasonCode}`,
        `Detailed Explanation: ${usageReason.trim()}`,
        `Going Forward Plan: ${goingForward.trim()}${
          forwardCommitments.length > 0
            ? ` (Commitments: ${forwardCommitments.join("; ")})`
            : ""
        }`,
      ];
      if (statement.trim()) {
        sections.push(`Additional Evidence: ${statement.trim()}`);
      }
      const formattedStatement = sections.join("\n").slice(0, 2950);
      const cleanedUrls = supportingUrls.map((u) => u.trim()).filter(Boolean);

      const res = await fetchApi<AppealConfirmation>("/appeals", {
        method: "POST",
        headers: { "X-Appellant-Session": sessionToken },
        body: JSON.stringify({
          platform,
          username: challenge.account_username,
          statement: formattedStatement,
          supporting_urls: cleanedUrls,
        }),
      });
      setConfirmation(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Appeal submission failed.");
    } finally {
      setLoading(false);
    }
  }

  async function lookupAppealStatus(e: React.FormEvent) {
    e.preventDefault();
    const id = trackId.trim();
    if (!id) return;
    setTrackError(null);
    setTrackLoading(true);
    setTrackedAppeal(null);
    try {
      const res = await fetchApi<AppealStatusRecord>(`/appeals/${encodeURIComponent(id)}`);
      setTrackedAppeal(res);
    } catch (err) {
      setTrackError(err instanceof Error ? err.message : "Could not find an appeal with that ID.");
    } finally {
      setTrackLoading(false);
    }
  }

  const copyToken = async () => {
    if (!challenge) return;
    await navigator.clipboard.writeText(challenge.verification_token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="mx-auto max-w-3xl px-3 sm:px-6 lg:px-8 py-4 sm:py-7 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="caption-4 font-mono uppercase text-[#ff6600]">
          Independent reputation protection
        </p>
        <button
          type="button"
          onClick={() => setQuickCheckOpen(true)}
          className="button-xsm inline-flex items-center gap-1.5 rounded-lg border border-[#ff6600]/40 bg-[#181818] px-2.5 py-1 text-xs font-mono text-[#ff6600] hover:bg-[#ff6600] hover:text-black transition-colors cursor-pointer"
        >
          <MagnifyingGlass size={12} weight="bold" />
          <span>Check if you&apos;re listed first</span>
        </button>
      </div>

      <div className="space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
          Public Account Appeal
        </h1>
        <p className="body-6 text-zinc-400">
          Using AI in everyday life makes work easier and helps people communicate — we only filter automated reply bots built to farm traction, impressions, or monetization. Let&apos;s use AI wisely. Submit a public appeal sharing why you use AI and how you will operate moving forward.
        </p>
      </div>

      {/* Fairness Guarantees Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="rounded-xl border border-[#272727] bg-[#181818] p-3">
          <div className="flex items-center gap-1.5 text-[#ff6600] caption-4 font-mono">
            <Scales size={14} weight="bold" />
            <span>Independent Review</span>
          </div>
          <p className="caption-5 text-zinc-400 mt-1">
            Original listing reviewers are strictly barred from deciding your appeal.
          </p>
        </div>
        <div className="rounded-xl border border-[#272727] bg-[#181818] p-3">
          <div className="flex items-center gap-1.5 text-emerald-400 caption-4 font-mono">
            <Clock size={14} weight="bold" />
            <span>24h–48h Triage</span>
          </div>
          <p className="caption-5 text-zinc-400 mt-1">
            24h expedited triage for unverified imports; 7 business day resolution SLA.
          </p>
        </div>
        <div className="rounded-xl border border-[#272727] bg-[#181818] p-3">
          <div className="flex items-center gap-1.5 text-zinc-200 caption-4 font-mono">
            <ShieldCheck size={14} weight="bold" className="text-[#ff6600]" />
            <span>Zero Detector Bias</span>
          </div>
          <p className="caption-5 text-zinc-400 mt-1">
            All appeal actions are recorded immutably in the SHA-256 audit ledger.
          </p>
        </div>
      </div>

      {/* Top Tab Switcher */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#272727] pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("aiblocklist")}
          className={`button-sm px-3.5 py-2 rounded-lg font-mono text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === "aiblocklist"
              ? "bg-[#ff6600] text-black"
              : "border border-[#272727] bg-[#181818] text-zinc-400 hover:text-white"
          }`}
        >
          AIBlockList De-indexing Appeal
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("x_suspension")}
          className={`button-sm inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-mono text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === "x_suspension"
              ? "bg-[#ff6600] text-black"
              : "border border-[#ff6600]/40 bg-[#181818] text-[#ff6600] hover:bg-[#1F1F1F]"
          }`}
        >
          <XLogo className="w-3.5 h-3.5 text-current" shiny={false} />
          <span>Official 𝕏 Suspension Recovery Guide</span>
        </button>
      </div>

      {activeTab === "x_suspension" ? (
        <XSuspensionGuide />
      ) : (
        <>
          {/* Scope Notice */}
          <div className="rounded-xl border border-[#272727] bg-[#181818] p-3.5 caption-4 text-zinc-400 space-y-2">
            <p>
              <strong className="text-zinc-200">Public Review Record:</strong> Appeals are part of AIBlockList&apos;s public accountability record for our registry and subscribing tools. Explain clearly why you use AI (if at all) and how your account will operate moving forward.
            </p>
            <div className="border-t border-[#272727] pt-2 flex flex-wrap items-center gap-3 text-xs">
              <span className="text-zinc-500 font-mono">Platform Recovery:</span>
              <button
                type="button"
                onClick={() => setActiveTab("x_suspension")}
                className="hover:underline inline-flex items-center gap-1 text-[#ff6600] font-mono cursor-pointer font-semibold"
              >
                <span>𝕏 Suspension Guide →</span>
              </button>
              <span className="text-zinc-600">·</span>
              <a
                href="https://help.instagram.com/contact/606967319425038"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#ff6600] inline-flex items-center gap-1 text-zinc-300 font-mono"
              >
                <span>Threads Account Status</span>
                <ArrowSquareOut size={11} weight="bold" />
              </a>
            </div>
            <p className="border-t border-[#272727] pt-2 text-xs text-zinc-400">
              <strong className="text-[#ff6600]">Anti-Bot Policy:</strong> Appeals are strictly for human account owners or accounts that have permanently stopped automation. Active reply bots and engagement-farming scripts are ineligible and rejected.
            </p>
          </div>

          {paramPostUrl && (
            <div className="rounded-xl border border-[#ff6600]/40 bg-[#131209] p-3 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
              <span className="text-[#ff6600] font-semibold">Contested tweet pre-attached:</span>
              <a
                href={paramPostUrl}
                target="_blank"
                rel="noreferrer"
                className="text-zinc-200 hover:text-white underline truncate max-w-full"
              >
                {paramPostUrl}
              </a>
            </div>
          )}

          {/* Step Progress Indicator */}
          {!confirmation && (
            <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
              {[
                { n: 1, label: "1. Account" },
                { n: 2, label: "2. Ownership" },
                { n: 3, label: "3. Evidence" },
              ].map((s) => (
                <div
                  key={s.n}
                  className={`rounded-lg border px-3 py-1.5 text-center transition-colors ${
                    step === s.n
                      ? "border-[#ff6600] bg-[#131209] text-[#ff6600] font-semibold"
                      : step > s.n
                      ? "border-emerald-500/40 bg-[#0F1B14] text-emerald-400"
                      : "border-[#272727] bg-[#181818] text-zinc-500"
                  }`}
                >
                  {s.label}
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-[#ff6600]/40 bg-[#131209] p-3.5 flex items-start gap-2.5">
              <WarningCircle size={18} weight="bold" className="text-[#ff6600] shrink-0 mt-0.5" />
              <p className="body-6 text-zinc-200">{error}</p>
            </div>
          )}

          {confirmation ? (
            <div className="rounded-2xl border border-[#272727] bg-[#181818] p-4 sm:p-6 space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle size={22} weight="bold" className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h2 className="title-2 text-white">Appeal recorded and acknowledged</h2>
                  <p className="body-6 mt-1 text-zinc-400">{confirmation.scope_notice}</p>
                </div>
              </div>
              <div className="rounded-xl border border-[#272727] bg-[#000000] p-4 font-mono caption-4 space-y-1.5 text-zinc-300">
                <p>
                  Appeal ID: <span className="text-white select-all">{confirmation.appeal_id}</span>
                </p>
                <p>Status: {confirmation.status}</p>
                <p>
                  {confirmation.expedited_triage ? "24h expedited" : "48h"} triage target:{" "}
                  {confirmation.triage_target_date.slice(0, 10)}
                </p>
                <p>Independent review SLA target: {confirmation.sla_target_date.slice(0, 10)}</p>
              </div>
            </div>
          ) : step === 1 ? (
            <form
              onSubmit={startChallenge}
              className="rounded-2xl border border-[#272727] bg-[#181818] p-4 sm:p-6 space-y-4"
            >
              <div className="flex items-center gap-2 text-zinc-300">
                <Key size={18} weight="bold" className="text-[#ff6600]" />
                <h2 className="title-3 text-white">Step 1: Verify account control</h2>
              </div>
              <div>
                <label className="title-4 block text-white mb-2">Platform</label>
                <div className="flex items-center gap-2">
                  {(["x", "threads"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPlatform(p)}
                      className={`caption-3 rounded-lg px-4 py-2 font-mono uppercase inline-flex items-center gap-1.5 transition-colors duration-300 cursor-pointer ${
                        platform === p
                          ? "bg-[#ff6600] text-black font-semibold"
                          : "border border-[#272727] bg-[#000000] text-zinc-400 hover:text-white"
                      }`}
                    >
                      {p === "x" ? <XLogo className="w-3.5 h-3.5" /> : <ThreadsLogo className="w-3.5 h-3.5" />}
                      <span>{p}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="appeal-handle" className="title-4 block text-white mb-2">
                  Indexed {platform === "x" ? "X" : "Threads"} handle
                </label>
                <input
                  id="appeal-handle"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={platform === "x" ? "FathinDev" : "threads_growth_spammer"}
                  className="body-5 w-full rounded-lg border border-[#272727] bg-[#000000] px-3 py-2 font-mono text-white placeholder:text-zinc-500 focus:border-[#ff6600] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto button-md rounded-lg bg-[#ff6600] px-4 py-2 font-semibold text-black hover:bg-[#e55c00] disabled:opacity-50 transition-colors duration-300 cursor-pointer"
              >
                {loading ? "Generating challenge..." : "Continue to verification"}
              </button>

              {/* Visible Appeal Options Preview so users see all options immediately */}
              <div className="border-t border-[#272727] pt-4 space-y-2.5">
                <p className="caption-4 font-mono uppercase text-zinc-400">
                  Available Appeal Options &amp; Public Verification
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {APPEAL_GROUNDS.map((g) => (
                    <div
                      key={g.id}
                      className="rounded-xl border border-[#222] bg-[#111] p-2.5"
                    >
                      <p className="caption-4 font-mono font-semibold text-zinc-200">{g.label}</p>
                      <p className="caption-5 text-zinc-500 mt-0.5">{g.hint}</p>
                    </div>
                  ))}
                </div>
                <p className="caption-5 text-zinc-400">
                  In the next step, you can verify ownership by posting a <strong className="text-zinc-200">public tweet mentioning aiblocklist.com</strong> (sharing why you use AI &amp; your plan moving forward) or by placing a single-use token in your bio.
                </p>
              </div>
            </form>
          ) : step === 2 && challenge ? (
            <div className="rounded-2xl border border-[#272727] bg-[#181818] p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="title-3 text-white">
                  Step 2: Verify ownership for @{challenge.account_username}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setError(null);
                  }}
                  className="inline-flex items-center gap-1 text-xs font-mono text-zinc-400 hover:text-white cursor-pointer"
                >
                  <ArrowLeft size={13} weight="bold" />
                  <span>Change handle</span>
                </button>
              </div>

              {/* Verification Method Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setVerifyMethod("public_tweet");
                    setError(null);
                  }}
                  className={`text-left rounded-xl border p-3 transition-colors cursor-pointer ${
                    verifyMethod === "public_tweet"
                      ? "border-[#ff6600] bg-[#131209]"
                      : "border-[#272727] bg-[#000000] hover:border-[#383838]"
                  }`}
                >
                  <p className={`caption-4 font-mono font-semibold ${verifyMethod === "public_tweet" ? "text-[#ff6600]" : "text-white"}`}>
                    1. Public Appeal Tweet (Recommended)
                  </p>
                  <p className="caption-5 text-zinc-400 mt-0.5">
                    Share your reason publicly on X mentioning aiblocklist.com and paste the tweet link.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setVerifyMethod("bio_token");
                    setError(null);
                  }}
                  className={`text-left rounded-xl border p-3 transition-colors cursor-pointer ${
                    verifyMethod === "bio_token"
                      ? "border-[#ff6600] bg-[#131209]"
                      : "border-[#272727] bg-[#000000] hover:border-[#383838]"
                  }`}
                >
                  <p className={`caption-4 font-mono font-semibold ${verifyMethod === "bio_token" ? "text-[#ff6600]" : "text-white"}`}>
                    2. Profile Bio Token
                  </p>
                  <p className="caption-5 text-zinc-400 mt-0.5">
                    Temporarily place a single-use verification token in your public X or Threads bio.
                  </p>
                </button>
              </div>

              {verifyMethod === "public_tweet" ? (
                <div className="space-y-3 rounded-xl border border-[#272727] bg-[#000000] p-4">
                  <p className="body-6 text-zinc-300">
                    Post a public tweet from <strong className="text-white">@{challenge.account_username}</strong> explaining why you use AI responsibly and how you will operate moving forward. Your tweet <strong className="text-[#ff6600]">must include https://aiblocklist.com</strong> so our platform can verify it.
                  </p>
                  <a
                    href={`https://x.com/intent/tweet?text=${encodeURIComponent(
                      `Submitting my public appeal on https://aiblocklist.com for @${challenge.account_username} — I use AI responsibly to assist my work and do not run automated reply spam. Let's use AI wisely.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#ff6600]/40 bg-[#131209] px-3 py-2 text-xs font-mono font-semibold text-[#ff6600] hover:bg-[#ff6600] hover:text-black transition-colors"
                  >
                    <XLogo className="w-3.5 h-3.5" />
                    <span>Compose Public Appeal Tweet on 𝕏 ↗</span>
                  </a>
                  <div>
                    <label htmlFor="appeal-tweet-url" className="caption-4 font-mono text-zinc-300 block mb-1.5">
                      Paste your public appeal tweet URL
                    </label>
                    <input
                      id="appeal-tweet-url"
                      type="url"
                      value={appealTweetUrl}
                      onChange={(e) => setAppealTweetUrl(e.target.value)}
                      placeholder={`https://x.com/${challenge.account_username}/status/...`}
                      className="body-5 w-full rounded-lg border border-[#272727] bg-[#0c0c0c] px-3 py-2 font-mono text-white placeholder:text-zinc-600 focus:border-[#ff6600] focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <p className="body-6 text-zinc-400">{challenge.instructions}</p>
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-[#ff6600]/40 bg-[#000000] p-3.5">
                    <span className="font-mono title-3 text-[#ff6600] select-all truncate">
                      {challenge.verification_token}
                    </span>
                    <button
                      type="button"
                      onClick={copyToken}
                      className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-[#313131] bg-[#181818] px-3 py-1.5 text-xs font-mono text-zinc-200 hover:border-[#ff6600] hover:text-[#ff6600] transition-colors cursor-pointer"
                    >
                      {copied ? <Check size={13} weight="bold" className="text-emerald-400" /> : <Copy size={13} weight="bold" />}
                      <span>{copied ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </>
              )}

              <p className="caption-5 font-mono text-zinc-500">
                Bound to platform ID {challenge.platform_account_id || "handle"} · Expires{" "}
                {challenge.expires_at.slice(0, 19).replace("T", " ")} UTC
              </p>
              <button
                type="button"
                disabled={loading}
                onClick={confirmChallenge}
                className="w-full sm:w-auto button-md rounded-lg bg-[#ff6600] px-4 py-2 font-semibold text-black hover:bg-[#e55c00] disabled:opacity-50 transition-colors duration-300 cursor-pointer"
              >
                {loading
                  ? "Verifying..."
                  : verifyMethod === "public_tweet"
                  ? "Verify appeal tweet & continue"
                  : "Confirm bio token"}
              </button>
            </div>
          ) : (
            <form
              onSubmit={submitAppeal}
              className="rounded-2xl border border-[#272727] bg-[#181818] p-4 sm:p-6 space-y-4"
            >
              <div className="flex items-center gap-2">
                <Scales size={18} weight="bold" className="text-[#ff6600]" />
                <h2 className="title-3 text-white">
                  Step 3: Submit statement &amp; counter-evidence for @{challenge?.account_username}
                </h2>
              </div>

              {/* Appeal Ground Selector */}
              <div className="space-y-2">
                <label className="title-4 block text-white">1. Primary appeal ground</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {APPEAL_GROUNDS.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGround(g.id)}
                      className={`text-left rounded-xl border p-2.5 transition-colors cursor-pointer ${
                        ground === g.id
                          ? "border-[#ff6600] bg-[#131209]"
                          : "border-[#272727] bg-[#000000] hover:border-[#383838]"
                      }`}
                    >
                      <p className={`caption-4 font-mono font-semibold ${ground === g.id ? "text-[#ff6600]" : "text-white"}`}>
                        {g.label}
                      </p>
                      <p className="caption-5 text-zinc-400 mt-0.5">{g.hint}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* AI / Automation Usage Disclosure */}
              <div className="space-y-2 border-t border-[#272727] pt-4">
                <label className="title-4 block text-white">
                  2. Have you used AI or automation tools, and why?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {USAGE_HISTORY_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setUsageHistory(opt.id)}
                      className={`text-left rounded-xl border p-2.5 transition-colors cursor-pointer ${
                        usageHistory === opt.id
                          ? "border-[#ff6600] bg-[#131209]"
                          : "border-[#272727] bg-[#000000] hover:border-[#383838]"
                      }`}
                    >
                      <p className={`caption-4 font-mono font-semibold ${usageHistory === opt.id ? "text-[#ff6600]" : "text-white"}`}>
                        {opt.label}
                      </p>
                      <p className="caption-5 text-zinc-400 mt-0.5">{opt.hint}</p>
                    </button>
                  ))}
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="exact-ai-reason" className="caption-4 font-mono text-zinc-300 block">
                    Exact reason behind using AI / automation (or why flagged)
                  </label>
                  <select
                    id="exact-ai-reason"
                    value={aiUsageReasonCode}
                    onChange={(e) => setAiUsageReasonCode(e.target.value)}
                    className="body-6 w-full rounded-lg border border-[#272727] bg-[#000000] px-3 py-2 font-mono text-white focus:border-[#ff6600] focus:outline-none"
                  >
                    {AI_USAGE_REASONS.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
                <textarea
                  id="usage-reason"
                  required
                  minLength={15}
                  maxLength={1000}
                  rows={3}
                  value={usageReason}
                  onChange={(e) => setUsageReason(e.target.value)}
                  placeholder="Explain the exact reason behind your usage (e.g. used AI for English translation/grammar, accessibility, tested a tool and turned it off, or clarify all replies were manual)."
                  className="body-5 w-full rounded-lg border border-[#272727] bg-[#000000] px-3 py-2 text-white placeholder:text-zinc-500 focus:border-[#ff6600] focus:outline-none"
                />
              </div>

              {/* Going Forward Plan */}
              <div className="space-y-2 border-t border-[#272727] pt-4">
                <label className="title-4 block text-white">
                  3. How will you continue going forward?
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {FORWARD_COMMITMENTS.map((item) => {
                    const active = forwardCommitments.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() =>
                          setForwardCommitments((prev) =>
                            prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
                          )
                        }
                        className={`rounded-lg border px-2.5 py-1 text-xs font-mono transition-colors cursor-pointer ${
                          active
                            ? "border-[#ff6600] bg-[#131209] text-[#ff6600]"
                            : "border-[#272727] bg-[#000000] text-zinc-400 hover:text-white"
                        }`}
                      >
                        {active ? "✓ " : "+ "}
                        {item}
                      </button>
                    );
                  })}
                </div>
                <textarea
                  id="going-forward"
                  required
                  minLength={15}
                  maxLength={1000}
                  rows={3}
                  value={goingForward}
                  onChange={(e) => setGoingForward(e.target.value)}
                  placeholder="Describe how you will run your account going forward (e.g. revoked third-party automation apps, enabled 2FA, and will write all replies manually)."
                  className="body-5 w-full rounded-lg border border-[#272727] bg-[#000000] px-3 py-2 text-white placeholder:text-zinc-500 focus:border-[#ff6600] focus:outline-none"
                />
              </div>

              <div className="border-t border-[#272727] pt-4">
                <label htmlFor="appeal-statement" className="title-4 block text-white mb-2">
                  4. Additional counter-evidence or tweet context <span className="caption-5 text-zinc-500 font-normal">(optional)</span>
                </label>
                <textarea
                  id="appeal-statement"
                  maxLength={1000}
                  rows={3}
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                  placeholder="Add any extra context about the flagged tweet(s), mistaken handle ownership, or thread context."
                  className="body-5 w-full rounded-lg border border-[#272727] bg-[#000000] px-3 py-2 text-white placeholder:text-zinc-500 focus:border-[#ff6600] focus:outline-none"
                />
              </div>

              {/* Anti-Bot Human Attestation */}
              <label className="flex items-start gap-2.5 rounded-xl border border-[#ff6600]/30 bg-[#131209] p-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={humanAttested}
                  onChange={(e) => setHumanAttested(e.target.checked)}
                  className="mt-0.5 accent-[#ff6600]"
                />
                <span className="caption-4 text-zinc-300 leading-relaxed">
                  I attest that I am the human owner of this account, I am <strong className="text-white">not</strong> operating an active automated reply bot or engagement-farming script, and the explanations above are accurate. (Active bot accounts are rejected and logged.)
                </span>
              </label>

              {/* Optional Supporting Counter-Evidence URLs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="title-4 text-white">
                    Share tweets &amp; counter-evidence URLs <span className="caption-5 text-zinc-500 font-normal">(optional, up to 5)</span>
                  </label>
                  {supportingUrls.length < 5 && (
                    <button
                      type="button"
                      onClick={() => setSupportingUrls((prev) => [...prev, ""])}
                      className="inline-flex items-center gap-1 text-xs font-mono text-[#ff6600] hover:underline cursor-pointer"
                    >
                      <Plus size={12} weight="bold" />
                      <span>Add URL</span>
                    </button>
                  )}
                </div>
                <div className="space-y-1.5">
                  {supportingUrls.map((urlVal, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="url"
                        value={urlVal}
                        onChange={(e) => {
                          const next = [...supportingUrls];
                          next[idx] = e.target.value;
                          setSupportingUrls(next);
                        }}
                        placeholder={`https://${platform === "x" ? "x.com" : "threads.net"}/...`}
                        className="body-6 flex-1 rounded-lg border border-[#272727] bg-[#000000] px-3 py-1.5 font-mono text-white placeholder:text-zinc-600 focus:border-[#ff6600] focus:outline-none"
                      />
                      {supportingUrls.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setSupportingUrls((prev) => prev.filter((_, i) => i !== idx))}
                          aria-label="Remove URL"
                          className="p-1.5 text-zinc-500 hover:text-red-400 cursor-pointer"
                        >
                          <Trash size={14} weight="bold" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="button-md rounded-lg bg-[#ff6600] px-4 py-2 font-semibold text-black hover:bg-[#e55c00] disabled:opacity-50 transition-colors duration-300 cursor-pointer"
              >
                {loading ? "Submitting appeal..." : "Submit independent appeal"}
              </button>
            </form>
          )}

          {/* Track Existing Appeal Status */}
          <div className="rounded-2xl border border-[#272727] bg-[#181818] p-4 sm:p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Clock size={16} weight="bold" className="text-[#ff6600]" />
              <h2 className="title-4 text-white">Track an existing appeal</h2>
            </div>
            <form onSubmit={lookupAppealStatus} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={trackId}
                onChange={(e) => setTrackId(e.target.value)}
                placeholder="Paste your Appeal ID (UUID)..."
                className="body-6 flex-1 rounded-lg border border-[#272727] bg-[#000000] px-3 py-2 font-mono text-white placeholder:text-zinc-600 focus:border-[#ff6600] focus:outline-none"
              />
              <button
                type="submit"
                disabled={trackLoading || !trackId.trim()}
                className="button-sm rounded-lg border border-[#313131] bg-[#1F1F1F] px-4 py-2 font-mono text-xs text-white hover:border-[#ff6600] disabled:opacity-50 cursor-pointer shrink-0"
              >
                {trackLoading ? "Checking..." : "Check status"}
              </button>
            </form>

            {trackError && (
              <p className="caption-4 font-mono text-red-400">{trackError}</p>
            )}

            {trackedAppeal && (
              <div className="rounded-xl border border-[#272727] bg-[#000000] p-3.5 font-mono caption-4 space-y-1 text-zinc-300">
                <p>
                  Status: <span className="text-[#ff6600] font-semibold uppercase">{trackedAppeal.status}</span>
                </p>
                <p>Submitted: {trackedAppeal.submitted_at.slice(0, 10)}</p>
                <p>Triage target: {trackedAppeal.triage_target_date.slice(0, 10)}</p>
                <p>Resolution SLA target: {trackedAppeal.sla_target_date.slice(0, 10)}</p>
                {trackedAppeal.public_correction_note && (
                  <p className="text-emerald-400 pt-1">Note: {trackedAppeal.public_correction_note}</p>
                )}
              </div>
            )}
          </div>
        </>
      )}

      <QuickCheckModal
        isOpen={quickCheckOpen}
        onClose={() => setQuickCheckOpen(false)}
        initialUsername={username}
        initialPlatform={platform}
      />
    </section>
  );
}

export default function AppealsPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-3xl px-4 py-16 text-center font-mono text-zinc-500">Loading appeals center...</div>}>
      <AppealsContent />
    </Suspense>
  );
}
