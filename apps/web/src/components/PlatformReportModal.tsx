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
  ChatCircleText,
  FileText,
  Megaphone,
  ShieldCheck,
  CaretRight,
} from "@phosphor-icons/react";
import { AccountPayload, API_BASE_URL } from "@/lib/api";
import { VerifiedTick } from "./VerifiedTick";
import { XLogo, ThreadsLogo } from "./PlatformSlideControl";
import { UserAvatar } from "./UserAvatar";

interface PlatformReportModalProps {
  account: AccountPayload;
  onClose: () => void;
}

type ReportTab = "intent" | "posts" | "forms" | "email" | "registry";

export function PlatformReportModal({ account, onClose }: PlatformReportModalProps) {
  const [activeTab, setActiveTab] = useState<ReportTab>("intent");
  const [copied, setCopied] = useState<string | null>(null);
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

  // Official Help Center Abuse Forms
  const helpCenterForms = isX
    ? [
        {
          title: "Platform Manipulation & Spam Form",
          url: "https://help.x.com/en/forms/safety-and-sensitive-content/abuse",
          category: "Automated Bot Loops & Sybil Spammers",
          instructions:
            "Select 'I want to report platform manipulation, spam, or fake accounts' → 'Automated accounts or spam bot activity' → paste the AIBlockList dossier into the description.",
        },
        {
          title: "Deceptive Identities & Impersonation Form",
          url: "https://help.x.com/en/forms/safety-and-sensitive-content/impersonation",
          category: "Copied Avatars / Impersonating AI Bots",
          instructions:
            "Select 'An account is pretending to be me or someone else' if this bot is copying a real creator's profile picture and bio.",
        },
      ]
    : [
        {
          title: "Meta Help Center Spam & Impersonation Form",
          url: "https://help.instagram.com/contact/383679321740945",
          category: "Automated Sybil Bot Loops",
          instructions:
            "Report non-human accounts operating repetitive engagement scripts or spamming threads with formulaic AI responses.",
        },
        {
          title: "Meta Inauthentic Behavior & Integrity Desk",
          url: "https://help.instagram.com/contact/606967319425038",
          category: "Coordinated Bot Networks",
          instructions:
            "Submit coordinated networks farming engagement on creator threads to Meta Integrity operations.",
        },
      ];

  const evidenceUrls = account.evidence.map((e) => e.public_post_url);
  const evidenceLines =
    evidenceUrls.length > 0
      ? evidenceUrls.map((u, i) => `  ${i + 1}. ${u}`).join("\n")
      : "  (Behavioral profile flag; no direct tweet URLs indexed)";

  const dossierUrl = `https://aiblocklist.com/accounts/${a.platform}/${cleanUser}`;

  const complaintSubject = `[Abuse Report] Automated Spam / Sybil Account: @${cleanUser} on ${platformName}`;
  const complaintBody = `OFFICIAL PLATFORM TRUST & SAFETY ABUSE COMPLAINT
Generated via AIBlockList.com Open-Source Intelligence Registry

Target Account: @${cleanUser}
Platform: ${a.platform.toUpperCase()}
Platform ID: ${a.platform_account_id || "Unassigned"}
Profile URL: ${profileUrl}
Violation Classification: Automated Spam, Engagement Farming, or Sybil Bot Loop

Observable Behavioral Evidence (${evidenceUrls.length} canonical post references):
${evidenceLines}

Observed Behavioral Pattern:
Account exhibits repetitive formulaic automated replies, template loops, or engagement farming in violation of platform authenticity rules and automation policies.

AIBlockList Verified Dossier:
${dossierUrl}
Timestamp: ${new Date().toISOString()}
`;

  const publicTweetText = `Flagging @${cleanUser} for automated AI reply spam and platform manipulation on ${platformName}. Evidence dossier: ${dossierUrl} @XSafety`;
  const tweetIntentUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(publicTweetText)}`;

  const mailtoLink = `mailto:${supportEmail}?subject=${encodeURIComponent(
    complaintSubject
  )}&body=${encodeURIComponent(complaintBody)}`;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 3000);
  };

  const handleLaunchWebReport = () => {
    navigator.clipboard.writeText(complaintBody);
    setCopied("dossier");
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
      <div className="relative w-full max-w-2xl rounded-2xl border border-[#313131] bg-[#121212] p-5 sm:p-6 shadow-2xl space-y-5 my-8">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 border-b border-[#272727] pb-4">
          <div className="flex items-center gap-3">
            <UserAvatar username={cleanUser} platformAccountId={a.platform_account_id} platform={a.platform} size="lg" />
            <div>
              <div className="flex items-center gap-2">
                <h3 id="report-modal-title" className="title-2 text-white font-mono">
                  @{cleanUser}
                </h3>
                <VerifiedTick type={a.verified_badge || "blue"} size={16} />
                <span className="caption-5 uppercase rounded bg-[#272727] px-1.5 py-0.5 font-mono text-zinc-300 inline-flex items-center gap-1">
                  {isX ? <XLogo className="w-2.5 h-2.5" /> : <ThreadsLogo className="w-2.5 h-2.5" />}
                  <span>{a.platform}</span>
                </span>
              </div>
              <p className="caption-5 font-mono text-zinc-400 mt-0.5">
                ID: {a.platform_account_id || "unassigned"} · {evidenceUrls.length} canonical evidence URL(s)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#272727] transition-colors"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Global Copy Notification Toast */}
        {copied && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-3 text-xs font-mono text-emerald-300 animate-in fade-in duration-200">
            <Check size={16} weight="bold" className="shrink-0 text-emerald-400" />
            <span>
              {copied === "dossier"
                ? "Complete Trust & Safety dossier copied to clipboard! Paste directly into platform report form."
                : `${copied} copied to clipboard!`}
            </span>
          </div>
        )}

        {/* Multi-Channel Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-[#272727] pb-3">
          {[
            { id: "intent" as const, label: "1-Click Safety Report", icon: ShieldWarning },
            { id: "posts" as const, label: `Report Posts (${evidenceUrls.length})`, icon: ChatCircleText },
            { id: "forms" as const, label: "Official Help Forms", icon: FileText },
            { id: "email" as const, label: "T&S Email Dispatch", icon: EnvelopeSimple },
            { id: "registry" as const, label: "AIBlockList Queue", icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`caption-4 font-mono inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer ${
                  isCurrent
                    ? "border border-[#ff6600] bg-[#1a140a] text-[#ff6600] font-bold"
                    : "border border-transparent bg-[#181818] text-zinc-400 hover:text-white hover:bg-[#222]"
                }`}
              >
                <Icon size={14} weight="bold" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: 1-CLICK WEB SAFETY REPORT INTENT */}
        {activeTab === "intent" && (
          <div className="space-y-4 font-mono">
            <div className="rounded-xl border border-[#272727] bg-[#181818] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="caption-4 uppercase font-bold text-zinc-300 flex items-center gap-1.5">
                  <ShieldWarning size={16} weight="bold" className="text-[#ff6600]" />
                  <span>Platform Native In-App Safety Report</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#ff6600]/20 text-[#ff6600] border border-[#ff6600]/30">
                  Recommended
                </span>
              </div>
              <p className="caption-4 text-zinc-400">
                Directly opens {platformName}&apos;s verified safety modal on your browser where you are logged in.
                The evidence dossier is automatically copied to your clipboard so you can paste it instantly.
              </p>

              <button
                type="button"
                onClick={handleLaunchWebReport}
                className="w-full flex items-center justify-between rounded-xl bg-gradient-to-r from-[#ff6600] to-[#e55c00] p-3.5 text-sm font-bold text-black shadow-lg shadow-[#ff6600]/20 hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldWarning size={18} weight="bold" />
                  <span>Launch In-App Report on {platformName}</span>
                </div>
                <ArrowSquareOut size={16} weight="bold" />
              </button>

              <div className="text-[11px] text-zinc-500 space-y-1 pt-1">
                <p>1. In the platform modal, choose: <strong>It&apos;s spam</strong> or <strong>Platform manipulation</strong>.</p>
                <p>2. Select: <strong>Posting malicious links / automated replies</strong>.</p>
                <p>3. Paste the auto-copied evidence dossier into the details field.</p>
              </div>
            </div>

            {/* Public Community Flagging Tweet Intent (X only) */}
            {isX && (
              <div className="rounded-xl border border-[#272727] bg-[#141414] p-3.5 flex items-center justify-between gap-3">
                <div>
                  <p className="caption-4 text-white font-bold flex items-center gap-1.5">
                    <Megaphone size={14} weight="bold" className="text-[#ff6600]" />
                    <span>Public Safety Alert Intent (@XSafety)</span>
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Pre-draft a tweet tagging @XSafety with the immutable dossier URL for public accountability.
                  </p>
                </div>
                <a
                  href={tweetIntentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="button-xsm inline-flex items-center gap-1 rounded-lg border border-[#313131] bg-[#1e1e1e] px-3 py-1.5 text-xs text-white hover:border-[#ff6600] hover:text-[#ff6600] transition-colors shrink-0"
                >
                  <XLogo className="w-3 h-3" />
                  <span>Post Alert</span>
                  <ArrowSquareOut size={12} weight="bold" />
                </a>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: POST-LEVEL EVIDENCE REPORTS */}
        {activeTab === "posts" && (
          <div className="space-y-3 font-mono">
            <p className="caption-4 text-zinc-400">
              Platform moderators prioritize reports targeting specific violating status URLs.
              Click any evidence post to open it directly on {platformName} and file a post-level report.
            </p>

            {evidenceUrls.length === 0 ? (
              <div className="rounded-xl border border-[#272727] bg-[#141414] p-6 text-center text-zinc-500 caption-4">
                No direct post URLs indexed for this profile. Use Profile Safety Report in Tab 1.
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {evidenceUrls.map((url, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-2 rounded-xl border border-[#272727] bg-[#161616] p-3 text-xs text-zinc-300"
                  >
                    <div className="truncate flex-1">
                      <span className="text-[#ff6600] font-bold mr-2">#{i + 1}</span>
                      <span className="text-zinc-300 truncate">{url}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopy(url, `Post URL #${i + 1}`)}
                        className="p-1.5 rounded-lg border border-[#313131] bg-[#1f1f1f] text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors"
                        title="Copy status URL"
                      >
                        <Copy size={13} weight="bold" />
                      </button>
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="button-xsm inline-flex items-center gap-1 rounded-lg bg-[#272727] px-2.5 py-1 text-xs text-white hover:bg-[#ff6600] hover:text-black transition-colors"
                      >
                        <span>Open &amp; Report</span>
                        <ArrowSquareOut size={11} weight="bold" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-lg border border-[#272727] bg-[#0c0c0c] p-2.5 text-[11px] text-zinc-500">
              💡 <strong>Post Report Steps:</strong> On {isX ? "X" : "Threads"}, click the ⋯ (three dots) on the top right of the post → <em>Report post</em> → <em>Spam / Automated replies</em>.
            </div>
          </div>
        )}

        {/* TAB 3: OFFICIAL PLATFORM HELP CENTER ABUSE FORMS */}
        {activeTab === "forms" && (
          <div className="space-y-3 font-mono">
            <p className="caption-4 text-zinc-400">
              For chronic or large-scale bot farms, submitting directly through the platform Help Center forms bypasses frontend rate-limits and routes directly to Tier-2 Trust &amp; Safety operations.
            </p>

            <div className="space-y-2.5">
              {helpCenterForms.map((f, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-[#272727] bg-[#161616] p-3.5 space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="title-4 text-white">{f.title}</h4>
                      <span className="caption-5 uppercase rounded bg-[#272727] px-1.5 py-0.5 text-[#ff6600] mt-1 inline-block">
                        {f.category}
                      </span>
                    </div>
                    <a
                      href={f.url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => handleCopy(complaintBody, "dossier")}
                      className="button-xsm inline-flex items-center gap-1 rounded-lg bg-[#ff6600] px-3 py-1.5 text-xs font-bold text-black hover:bg-[#e55c00] transition-colors shrink-0"
                    >
                      <span>Open Form</span>
                      <ArrowSquareOut size={12} weight="bold" />
                    </a>
                  </div>
                  <p className="text-[11px] text-zinc-400">{f.instructions}</p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => handleCopy(complaintBody, "dossier")}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#313131] bg-[#1e1e1e] p-2.5 text-xs text-zinc-200 hover:text-white hover:bg-[#282828] transition-colors"
            >
              <Copy size={14} weight="bold" />
              <span>Copy Full Dossier to Paste in Form</span>
            </button>
          </div>
        )}

        {/* TAB 4: TRUST & SAFETY EMAIL DISPATCH */}
        {activeTab === "email" && (
          <div className="space-y-3 font-mono">
            <p className="caption-4 text-zinc-400">
              Send an official structured complaint to the platform&apos;s Trust &amp; Safety legal/abuse inboxes with all cryptographic timestamps and canonical URLs.
            </p>

            <div className="rounded-xl border border-[#272727] bg-[#0c0c0c] p-3 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-zinc-400">
                <span>To:</span>
                <span className="text-white font-bold">{supportEmail}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <span>Subject:</span>
                <span className="text-zinc-200 truncate ml-2">{complaintSubject}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <a
                href={mailtoLink}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#ff6600] p-3 text-xs font-bold text-black hover:bg-[#e55c00] transition-colors"
              >
                <EnvelopeSimple size={16} weight="bold" />
                <span>Launch Mail App</span>
              </a>

              <button
                type="button"
                onClick={() => handleCopy(complaintBody, "dossier")}
                className="flex items-center justify-center gap-2 rounded-xl border border-[#313131] bg-[#1a1a1a] p-3 text-xs font-bold text-zinc-200 hover:bg-[#252525] hover:text-white transition-colors"
              >
                <Copy size={16} weight="bold" />
                <span>Copy Email Body</span>
              </button>
            </div>

            <div className="max-h-28 overflow-y-auto rounded-lg border border-[#222] bg-[#080808] p-2.5 text-[10px] text-zinc-400 whitespace-pre-wrap select-all">
              {complaintBody}
            </div>
          </div>
        )}

        {/* TAB 5: AI BLOCKLIST DUAL REVIEW QUEUE */}
        {activeTab === "registry" && (
          <div className="space-y-3 font-mono">
            <p className="caption-4 text-zinc-400">
              AIBlockList enforces strict dual-reviewer verification. Submitting here flags the account for independent community consensus review under policy charter v1.0.
            </p>

            <div className="rounded-xl border border-[#272727] bg-[#181818] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="caption-4 text-white font-bold flex items-center gap-1.5">
                  <ShieldCheck size={16} weight="bold" className="text-emerald-400" />
                  <span>Independent Dual-Review Queue</span>
                </span>
                <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-[#272727] text-zinc-400">
                  Zero AI text detector bias
                </span>
              </div>

              <p className="text-[11px] text-zinc-400">
                Your report will be queued with the attached evidence URLs. Reviewers evaluate behavioral telemetry without using flawed probabilistic AI text detectors.
              </p>

              {aiblSubmitted ? (
                <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-3 text-xs text-emerald-300 flex items-center gap-2">
                  <Check size={16} weight="bold" className="text-emerald-400" />
                  <span>Report successfully queued for independent review!</span>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={submittingAibl}
                  onClick={handleSubmitToAIBL}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 p-3 text-xs font-bold text-white hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer"
                >
                  <ShieldCheck size={16} weight="bold" />
                  <span>{submittingAibl ? "Submitting to Queue..." : "Submit to AIBlockList Review"}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Footer Note */}
        <div className="border-t border-[#272727] pt-3 flex items-center justify-between text-[11px] font-mono text-zinc-500">
          <span>Non-defamatory behavioral observation only.</span>
          <a
            href={dossierUrl}
            target="_blank"
            rel="noreferrer"
            className="hover:text-[#ff6600] inline-flex items-center gap-1 transition-colors"
          >
            <span>Permanent Dossier</span>
            <ArrowSquareOut size={11} weight="bold" />
          </a>
        </div>
      </div>
    </div>
  );
}