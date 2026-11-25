"use client";

import { useState } from "react";
import {
  WarningCircle,
  CheckCircle,
  Copy,
  Check,
  ArrowSquareOut,
  ShieldWarning,
  Prohibit,
  Clock,
  EnvelopeSimple,
  LockKey,
} from "@phosphor-icons/react";
import { XLogo } from "./PlatformSlideControl";

export function XSuspensionGuide() {
  const [copied, setCopied] = useState(false);

  const appealTemplate = `My account @[username] was suspended on [Date]. I believe this was an automated mistake. I use this account manually to post original content about [your topic/niche]. I do not use bots, automation for engagement, bulk follow/unfollow, or engagement services. I have reviewed the rules and will continue following them. Please review and restore the account. Thank you.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(appealTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Overview Banner */}
      <div className="rounded-2xl border border-[#ff6600]/30 bg-gradient-to-b from-[#181818] to-[#101010] p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#ff6600]/40 bg-[#131209] px-2.5 py-0.5 text-xs font-mono text-[#ff6600]">
              <XLogo className="w-3.5 h-3.5 text-[#ff6600]" shiny />
              <span>Official 𝕏 Platform Guide</span>
            </div>
            <h2 className="heading-3 text-white">How to Get Your Suspended 𝕏 Account Back</h2>
            <p className="body-4 text-zinc-300 font-sans leading-relaxed">
              Most suspended accounts on 𝕏 are automated spam or inauthentic behavior accounts. But because 𝕏 relies on aggressive automated heuristics (like the <em>&quot;fast reply spam&quot;</em> and <em>&quot;llm slop&quot;</em> classifiers), <strong>real human accounts get caught too</strong>. Follow this battle-tested procedure.
            </p>
          </div>

          <a
            href="https://help.x.com/en/forms/account-access/appeals"
            target="_blank"
            rel="noreferrer"
            className="button-sm inline-flex items-center justify-center gap-2 rounded-xl bg-[#ff6600] px-4 py-3 font-bold text-black hover:bg-[#e55c00] active:scale-[0.98] transition-all shrink-0 shadow-lg shadow-[#ff6600]/20 whitespace-nowrap"
          >
            <span>Launch Official 𝕏 Appeal Form</span>
            <ArrowSquareOut size={16} weight="bold" />
          </a>
        </div>
      </div>

      {/* Step-by-Step Procedure */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Step 1 */}
        <div className="rounded-xl border border-[#272727] bg-[#141414] p-5 space-y-3">
          <div className="flex items-center gap-2 text-[#ff6600] font-mono text-xs uppercase font-bold tracking-wider">
            <LockKey size={16} weight="bold" />
            <span>Step 1: First Verification Steps</span>
          </div>
          <h3 className="title-3 text-white">Check for Temporary Verification Locks</h3>
          <ul className="space-y-2 text-xs text-zinc-300 font-sans leading-relaxed list-disc list-inside">
            <li>Log in to your suspended account normally via the official 𝕏 website or app.</li>
            <li>Follow any phone number verification, email confirmation, or Arkose/reCAPTCHA prompts that appear.</li>
            <li>
              <strong>Key takeaway:</strong> Many supposed &quot;suspensions&quot; are actually automated security challenges that clear instantly upon completing the verification step.
            </li>
          </ul>
        </div>

        {/* Step 2 */}
        <div className="rounded-xl border border-[#272727] bg-[#141414] p-5 space-y-3">
          <div className="flex items-center gap-2 text-[#ff6600] font-mono text-xs uppercase font-bold tracking-wider">
            <EnvelopeSimple size={16} weight="bold" />
            <span>Step 2: If Still Hard-Suspended</span>
          </div>
          <h3 className="title-3 text-white">Access the Official Appeals Portal</h3>
          <ul className="space-y-2 text-xs text-zinc-300 font-sans leading-relaxed list-disc list-inside">
            <li><strong>Stay logged into the suspended account in your browser</strong> (the form will reject anonymous or unauthenticated submissions).</li>
            <li>
              Go directly to:{" "}
              <a
                href="https://help.x.com/en/forms/account-access/appeals"
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[#ff6600] underline"
              >
                help.x.com/en/forms/account-access/appeals
              </a>
            </li>
            <li>Select the issue description and prepare your written statement.</li>
          </ul>
        </div>
      </div>

      {/* How to write the appeal & Copyable Template */}
      <div className="rounded-2xl border border-[#272727] bg-[#161616] p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="title-2 text-white">How to Write the Appeal (4–6 Lines Rule)</h3>
            <p className="caption-4 text-zinc-400 mt-0.5">
              Keep it strictly factual, professional, and free of emotional arguments. Automated reviewers scan for specific declarations of manual human operation.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="button-sm inline-flex items-center gap-1.5 rounded-lg border border-[#ff6600]/40 bg-[#131209] px-3 py-1.5 font-mono text-xs text-[#ff6600] hover:bg-[#ff6600] hover:text-black transition-all cursor-pointer shrink-0"
          >
            {copied ? (
              <>
                <Check size={14} weight="bold" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={14} weight="bold" />
                <span>Copy Template</span>
              </>
            )}
          </button>
        </div>

        {/* Copyable code box */}
        <div className="relative rounded-xl border border-[#333] bg-[#0c0c0c] p-4 font-mono text-xs text-zinc-200 leading-relaxed select-all">
          <p>{appealTemplate}</p>
        </div>

        {/* Essential Ingredients Checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs font-mono text-zinc-400">
          <div className="flex items-start gap-2">
            <CheckCircle size={15} weight="bold" className="text-[#ff6600] mt-0.5 shrink-0" />
            <span>State your exact @handle and date of suspension</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle size={15} weight="bold" className="text-[#ff6600] mt-0.5 shrink-0" />
            <span>State you post manually with zero automated engagement bots</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle size={15} weight="bold" className="text-[#ff6600] mt-0.5 shrink-0" />
            <span>Specify your genuine topic / domain (e.g. software, design, news)</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle size={15} weight="bold" className="text-[#ff6600] mt-0.5 shrink-0" />
            <span>Affirm account security and ongoing compliance with rules</span>
          </div>
        </div>
      </div>

      {/* Two Pillars: Things You Need to Know & What NOT to Do */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Things you need to know */}
        <div className="rounded-xl border border-[#272727] bg-[#121212] p-5 space-y-3">
          <div className="flex items-center gap-2 text-zinc-300 font-mono text-xs uppercase font-bold tracking-wider">
            <Clock size={16} weight="bold" className="text-[#ff6600]" />
            <span>Things You Need to Know</span>
          </div>
          <ul className="space-y-2 text-xs text-zinc-300 font-sans leading-relaxed list-disc list-inside">
            <li><strong>Only the official form works:</strong> DMs, replies to @XSupport, or tag storms are ignored.</li>
            <li><strong>Submit once, then wait:</strong> Flooding duplicate tickets resets your queue position to the back.</li>
            <li><strong>Monitor linked email &amp; spam:</strong> Response tickets originate from support@x.com or verify-case@x.com.</li>
            <li><strong>Third-party &quot;unsuspend services&quot; are 100% scams:</strong> Nobody has backend backdoor database access. Never pay third parties.</li>
            <li><strong>Typical turnaround:</strong> Simple false-positive appeals usually resolve within 24 to 72 hours.</li>
          </ul>
        </div>

        {/* What NOT to do */}
        <div className="rounded-xl border border-red-900/40 bg-[#160e0e] p-5 space-y-3">
          <div className="flex items-center gap-2 text-red-400 font-mono text-xs uppercase font-bold tracking-wider">
            <Prohibit size={16} weight="bold" />
            <span>Critical: What NOT to Do</span>
          </div>
          <ul className="space-y-2 text-xs text-zinc-300 font-sans leading-relaxed list-disc list-inside">
            <li><strong>Never create a new account to evade the ban:</strong> 𝕏 device fingerprints (browser canvas, IP subnet, phone) will immediately trigger permanent ban-evasion strikes on both accounts.</li>
            <li><strong>Do not spam the appeal form repeatedly:</strong> This triggers an automated bot-lock on your support ticket.</li>
            <li><strong>Do not hire social media recovery agencies:</strong> They cannot bypass 𝕏 Trust &amp; Safety reviewers and frequently phish your credentials.</li>
            <li><strong>Do not admit to violations you didn&apos;t commit:</strong> Falsely apologizing for &quot;using a bot&quot; ensures the automated reviewer denies the case.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
