import type { Metadata } from "next";
import Link from "next/link";
import {
  EnvelopeSimple,
  ShieldCheck,
  Scales,
  BugBeetle,
  Newspaper,
  ArrowRight,
  ChatCircleDots,
} from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "Contact & Governance Directory — AIBlockList",
  description:
    "Official contact channels for AIBlockList Trust & Safety desks, DMCA takedown agents, security disclosures, and academic research.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#272727] bg-[#181818] px-3 py-1">
          <span className="h-2 w-2 rounded-full bg-[#ff6600]" />
          <span className="caption-4 font-mono text-zinc-300">
            Open Governance &amp; Custodianship
          </span>
        </div>
        <h1 className="heading-2 text-white">Contact &amp; Governance</h1>
        <p className="body-3 mt-3 text-zinc-400">
          Official channels for inquiries, dispute escalations, legal notices, security disclosures,
          and open source collaboration.
        </p>
      </div>

      {/* Primary Action Matrix */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Card 1: Account Appeals */}
        <div className="rounded-2xl border border-[#272727] bg-[#181818] p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-[#ff6600] mb-2">
              <Scales size={22} weight="bold" />
              <h2 className="title-2 text-white">Account Dispute or Appeal</h2>
            </div>
            <p className="body-5 text-zinc-400">
              Listed by mistake? Do NOT email support for initial appeals. Use our automated, free
              bio-challenge token system for immediate, cryptographic identity verification and
              independent review within 7 business days.
            </p>
          </div>
          <Link
            href="/appeals"
            className="button-sm inline-flex items-center gap-1.5 rounded-lg bg-[#ff6600] px-4 py-2 font-bold text-black hover:bg-[#e55c00] transition-colors w-fit"
          >
            <span>Start Free Appeal</span>
            <ArrowRight size={14} weight="bold" />
          </Link>
        </div>

        {/* Card 2: Report Spammer */}
        <div className="rounded-2xl border border-[#272727] bg-[#181818] p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 text-[#ff6600] mb-2">
              <ShieldCheck size={22} weight="bold" />
              <h2 className="title-2 text-white">Report Automated Spam</h2>
            </div>
            <p className="body-5 text-zinc-400">
              Witnessing repetitive reply bot loops, synchronized engagement farming, or automated
              sybil campaigns? Submit public post permalinks to our community review queue.
            </p>
          </div>
          <Link
            href="/report"
            className="button-sm inline-flex items-center gap-1.5 rounded-lg border border-[#313131] bg-[#1f1f1f] px-4 py-2 text-white hover:bg-[#272727] transition-colors w-fit"
          >
            <span>Submit Report</span>
            <ArrowRight size={14} weight="bold" />
          </Link>
        </div>
      </div>

      {/* Official Inquiries Breakdown */}
      <div className="rounded-2xl border border-[#272727] bg-[#181818] p-6 sm:p-8 space-y-6">
        <h2 className="title-2 text-white">Designated Desks</h2>
        <div className="space-y-4">
          <div className="rounded-xl border border-[#272727] bg-[#0c0c0c] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <EnvelopeSimple size={18} weight="bold" className="text-[#ff6600]" />
                <h3 className="title-4 text-white">Trust &amp; Safety / Compliance</h3>
              </div>
              <p className="caption-4 text-zinc-400 mt-1">
                For regulatory inquiries, policy feedback, or escalated governance concerns.
              </p>
            </div>
            <span className="font-mono text-sm font-bold text-[#ff6600]">
              safety@aiblocklist.com
            </span>
          </div>

          <div className="rounded-xl border border-[#272727] bg-[#0c0c0c] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Scales size={18} weight="bold" className="text-[#ff6600]" />
                <h3 className="title-4 text-white">Legal &amp; DMCA Agent</h3>
              </div>
              <p className="caption-4 text-zinc-400 mt-1">
                For formal legal process, GDPR/DPDP Article 17 takedowns, and copyright claims.
              </p>
            </div>
            <span className="font-mono text-sm font-bold text-[#ff6600]">
              legal@aiblocklist.com
            </span>
          </div>

          <div className="rounded-xl border border-[#272727] bg-[#0c0c0c] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <BugBeetle size={18} weight="bold" className="text-[#ff6600]" />
                <h3 className="title-4 text-white">Security &amp; Vulnerability Disclosure</h3>
              </div>
              <p className="caption-4 text-zinc-400 mt-1">
                Responsible disclosure of vulnerabilities in our API, sync workers, or browser extensions.
              </p>
            </div>
            <span className="font-mono text-sm font-bold text-[#ff6600]">
              security@aiblocklist.com
            </span>
          </div>

          <div className="rounded-xl border border-[#272727] bg-[#0c0c0c] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Newspaper size={18} weight="bold" className="text-[#ff6600]" />
                <h3 className="title-4 text-white">Press &amp; Academic Research</h3>
              </div>
              <p className="caption-4 text-zinc-400 mt-1">
                Dataset access for university researchers studying social media automation and botnets.
              </p>
            </div>
            <span className="font-mono text-sm font-bold text-[#ff6600]">
              press@aiblocklist.com
            </span>
          </div>
        </div>
      </div>

      {/* Open Source Community & Credits Callout */}
      <div className="rounded-2xl border border-[#272727] bg-[#181818] p-6 sm:p-8 space-y-4">
        <h2 className="title-2 text-white">Creator &amp; Community Credits</h2>
        <p className="body-4 text-zinc-300">
          AIBlockList was created and engineered by{" "}
          <a
            href="https://x.com/Agenticpirate"
            target="_blank"
            rel="noreferrer"
            className="text-[#ff6600] font-mono font-bold hover:underline"
          >
            @Agenticpirate
          </a>{" "}
          as an open-source public good. The project was inspired by early automated AI-reply defense and anti-spam research pioneered by Pieter Levels (
          <a
            href="https://x.com/levelsio"
            target="_blank"
            rel="noreferrer"
            className="text-zinc-200 font-mono hover:underline"
          >
            @levelsio
          </a>
          ).
        </p>
        <Link
          href="/about"
          className="button-sm inline-flex items-center gap-1.5 text-[#ff6600] hover:text-white transition-colors"
        >
          <span>Read our full governance charter &amp; story</span>
          <ArrowRight size={14} weight="bold" />
        </Link>
      </div>
    </div>
  );
}
