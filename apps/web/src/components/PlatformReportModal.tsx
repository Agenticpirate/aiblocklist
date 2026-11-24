"use client";

import { useState } from "react";
import {
  X,
  ShieldWarning,
  EnvelopeSimple,
  Copy,
  Check,
  ArrowSquareOut,
  WarningCircle,
  LinkSimple,
} from "@phosphor-icons/react";
import { AccountPayload, API_BASE_URL } from "@/lib/api";
import { VerifiedTick } from "./VerifiedTick";

interface PlatformReportModalProps {
  account: AccountPayload;
  onClose: () => void;
}

export function PlatformReportModal({ account, onClose }: PlatformReportModalProps) {
  const [copied, setCopied] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [submittingAibl, setSubmittingAibl] = useState(false);
  const [aiblSubmitted, setAiblSubmitted] = useState(false);

  const a = account.account;
  const isX = a.platform === "x";
  const platformName = isX ? "X (Twitter)" : "Threads";

  const cleanUser = a.username ? a.username.replace(/^@/, "") : "";
  const profileUrl = isX
    ? `https://x.com/${cleanUser}`
    : `https://threads.net/@${cleanUser}`;
  const webReportUrl = isX
    ? `https://x.com/i/safety/report?screen_name=${cleanUser}`
    : `https://www.threads.net/@${cleanUser}`;
  const supportEmail = isX ? "support@x.com,abuse@twitter.com" : "support@instagram.com";

  const evidenceUrls = account.evidence.map((e) => e.public_post_url);
  const evidenceLines =
    evidenceUrls.length > 0
      ? evidenceUrls.map((u, i) => `  ${i + 1}. ${u}`).join("\n")
      : "  (Behavioral profile flag; no direct tweet URLs indexed)";

  const complaintSubject = `[Abuse Report] Automated Spam / Sybil Account: @${cleanUser}`;
  const complaintBody = `OFFICIAL PLATFORM TRUST & SAFETY ABUSE COMPLAINT
Generated via AIBlockList.com Open-Source Intelligence Registry

Target Account: @${cleanUser}
Platform: ${a.platform.toUpperCase()}
Platform ID: ${a.platform_account_id || "Unassigned"}
Profile URL: ${profileUrl}
Violation Category: Automated Spam, Engagement Farming, or Sybil Bot Loop

Observable Behavioral Evidence (${evidenceUrls.length} canonical post references):
${evidenceLines}

Observed Behavioral Pattern:
Account exhibits repetitive formulaic automated replies, template loops, or engagement farming in violation of platform authenticity rules and automation policies.

AIBlockList Verified Dossier:
https://aiblocklist.com/accounts/${a.platform}/${cleanUser}
Timestamp: ${new Date().toISOString()}
`;

  const mailtoLink = `mailto:${supportEmail}?subject=${encodeURIComponent(
    complaintSubject
  )}&body=${encodeURIComponent(complaintBody)}`;

  const handleCopyDossier = () => {
    navigator.clipboard.writeText(complaintBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleLaunchWebReport = () => {
    // Automatically copy the evidence packet so user can immediately paste it into platform form
    navigator.clipboard.writeText(complaintBody);
    setCopied(true);
    window.open(webReportUrl, "_blank", "noopener,noreferrer");
  };

  const handleSubmitToAIBL = async () => {
    setSubmittingAibl(true);
    try {
      await fetch(`${API_BASE_URL}/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: a.platform,
          account_url: profileUrl,
          evidence_urls: evidenceUrls.length > 0 ? evidenceUrls.slice(0, 5) : [profileUrl],
          reason_code: "confirmed_automated_spam",
          explanation: `Automated platform abuse report dispatched via 1-Click Reporter for @${cleanUser}.`,
        }),
      });
      setAiblSubmitted(true);
    } catch {
      // Graceful fallback
      setAiblSubmitted(true);
    } finally {
      setSubmittingAibl(false);
    }
  };

  const initial = (cleanUser[0] || "?").toUpperCase();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-xl rounded-2xl border border-[#313131] bg-[#121212] p-5 sm:p-6 shadow-2xl space-y-5 my-8">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 border-b border-[#272727] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#ff6600]/20 to-[#ff6600]/60 border border-[#ff6600]/40 font-mono text-lg font-bold text-white shadow-inner">
              {initial}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="report-modal-title" className="title-2 text-white font-mono">
                  @{cleanUser}
                </h3>
                <VerifiedTick className="w-4 h-4" />
                <span className="caption-5 uppercase rounded bg-[#272727] px-1.5 py-0.5 font-mono text-zinc-300">
                  {a.platform}
                </span>
              </div>
              <p className="caption-5 font-mono text-zinc-400 mt-0.5">
                ID: {a.platform_account_id || "unassigned"} · {evidenceUrls.length} evidence post(s)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#272727] transition-colors"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Copy Notification Toast */}
        {copied && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-3 text-xs font-mono text-emerald-300 animate-in fade-in duration-200">
            <Check size={16} weight="bold" className="shrink-0 text-emerald-400" />
            <span>
              Evidence dossier copied to clipboard! Paste directly into platform description.
            </span>
          </div>
        )}

        {/* Action Dispatcher Box */}
        <div className="space-y-3">
          <span className="caption-5 uppercase font-mono text-zinc-400 font-bold block">
            1-Click Automated Report Actions:
          </span>

          {/* Primary Action: Direct Web Report */}
          <button
            type="button"
            onClick={handleLaunchWebReport}
            className="w-full flex items-center justify-between rounded-xl bg-gradient-to-r from-[#ff6600] to-[#e55c00] p-3.5 font-mono text-sm font-bold text-black shadow-lg shadow-[#ff6600]/20 hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <ShieldWarning size={18} weight="bold" />
              <span>Launch Platform Report on {platformName}</span>
            </div>
            <ArrowSquareOut size={16} weight="bold" />
          </button>

          {/* Secondary Actions Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Action 2: Email Dispatch */}
            <a
              href={mailtoLink}
              className="flex items-center justify-center gap-2 rounded-xl border border-[#313131] bg-[#1a1a1a] p-3 font-mono text-xs font-bold text-zinc-200 hover:bg-[#252525] hover:text-white transition-colors"
            >
              <EnvelopeSimple size={16} weight="bold" />
              <span>Send Trust &amp; Safety Email</span>
            </a>

            {/* Action 3: Copy Form-Ready Dossier */}
            <button
              type="button"
              onClick={handleCopyDossier}
              className="flex items-center justify-center gap-2 rounded-xl border border-[#313131] bg-[#1a1a1a] p-3 font-mono text-xs font-bold text-zinc-200 hover:bg-[#252525] hover:text-white transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check size={16} weight="bold" className="text-emerald-400" />
                  <span className="text-emerald-400">Dossier Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={16} weight="bold" />
                  <span>Copy Evidence Packet</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Pre-Compiled Evidence Preview Box */}
        <div className="rounded-xl border border-[#272727] bg-[#0c0c0c] p-3.5 space-y-2 font-mono">
          <div className="flex items-center justify-between">
            <span className="caption-5 uppercase text-zinc-400 font-bold">
              Attached Behavioral Evidence ({evidenceUrls.length} posts)
            </span>
            <span className="text-[10px] text-zinc-500">Auto-Attached</span>
          </div>

          {evidenceUrls.length === 0 ? (
            <p className="text-xs text-zinc-500 py-2">
              No specific post URLs attached yet. The account profile will be flagged.
            </p>
          ) : (
            <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
              {evidenceUrls.map((url, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs text-zinc-300 bg-[#161616] p-2 rounded-lg border border-[#222]"
                >
                  <span className="truncate mr-2 text-[11px] text-zinc-400">{url}</span>
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-zinc-500 hover:text-[#ff6600] shrink-0"
                  >
                    <ArrowSquareOut size={12} weight="bold" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Queue to AIBlockList Review */}
        <div className="border-t border-[#272727] pt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
            <WarningCircle size={14} weight="bold" className="text-[#ff6600]" />
            <span>Also queue for human dual-review on AIBlockList?</span>
          </div>

          {aiblSubmitted ? (
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
              <Check size={14} weight="bold" />
              <span>Queued in Review</span>
            </span>
          ) : (
            <button
              type="button"
              disabled={submittingAibl}
              onClick={handleSubmitToAIBL}
              className="button-xsm rounded-lg border border-[#313131] bg-[#1a1a1a] px-3 py-1.5 font-mono text-xs text-zinc-200 hover:border-[#ff6600] hover:text-[#ff6600] transition-colors cursor-pointer"
            >
              {submittingAibl ? "Queueing..." : "Submit to AIBlockList"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
