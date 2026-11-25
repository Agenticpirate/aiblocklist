import type { Metadata } from "next";
import Link from "next/link";
import { Scales, ShieldWarning, ArrowRight, CheckCircle, WarningOctagon, FileText } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "Terms of Service & Open Source Governance Charter — AIBlockList",
  description:
    "Official terms of service, governance charter, acceptable use policy, and licensing agreements governing AIBlockList.com public intelligence infrastructure.",
};

export default function TermsPage() {
  const lastUpdated = "November 24, 2026";

  return (
    <div className="mx-auto max-w-4xl px-4 py-4 sm:py-8 sm:px-6 lg:px-8 space-y-6 sm:space-y-10">
      {/* Header */}
      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#272727] bg-[#181818] px-3 py-1">
          <span className="h-2 w-2 rounded-full bg-[#ff6600]" />
          <span className="caption-4 font-mono text-zinc-300">
            Legal & Governance · Effective {lastUpdated}
          </span>
        </div>
        <h1 className="heading-2 text-white">Terms of Service &amp; Charter</h1>
        <p className="body-3 mt-3 text-zinc-400">
          The legal framework, licensing terms, acceptable use requirements, and immutable governance
          charter defining AIBlockList.com open source trust and safety operations.
        </p>
      </div>

      {/* Immutable Red Lines Box */}
      <div className="rounded-2xl border border-[#ff6600]/40 bg-[#141209] p-4 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-[#ff6600]">
          <WarningOctagon size={22} weight="bold" />
          <h2 className="title-2 text-white">Our Immutable Charter Red Lines</h2>
        </div>
        <p className="body-5 text-zinc-300">
          By constitutional charter, AIBlockList operators, maintainers, and downstream custodians are
          permanently bound by the following prohibitions:
        </p>
        <ul className="space-y-2 body-6 text-zinc-300 font-mono">
          <li className="flex items-start gap-2">
            <span className="text-[#ff6600] font-bold">1.</span>
            <span><strong className="text-white">Zero Pay-to-Delist:</strong> We never charge, accept, or solicit fees, donations, or compensation of any kind to review, expedite, or delist an account.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#ff6600] font-bold">2.</span>
            <span><strong className="text-white">Zero Data Monetization:</strong> We never sell private user telemetry, reporter identities, IP hash logs, or unverified claims to data brokers, ad networks, or commercial scrapers.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#ff6600] font-bold">3.</span>
            <span><strong className="text-white">Zero Stylometric AI Text Discrimination:</strong> We never list accounts based purely on probabilistic AI text detectors, protecting non-native English speakers from unjust algorithmic exclusion.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#ff6600] font-bold">4.</span>
            <span><strong className="text-white">Zero Secret Evidence:</strong> Every listed account must cite public, canonical behavioral URLs verifiable by any member of the public.</span>
          </li>
        </ul>
      </div>

      {/* Main Legal Clauses */}
      <div className="rounded-2xl border border-[#272727] bg-[#181818] p-4 sm:p-8 space-y-5 sm:space-y-8 text-zinc-300 body-4">
        <section className="space-y-3">
          <h2 className="title-2 text-white">1. Acceptance of Terms</h2>
          <p>
            By accessing, reading, subscribing to, consuming via API, or utilizing browser extensions
            powered by AIBlockList (&ldquo;the Service&rdquo;), you agree to be bound by these Terms of Service.
            If you do not agree to these terms, you must discontinue use of the Service immediately.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="title-2 text-white">2. Open Source Licensing &amp; Dataset Attribution</h2>
          <p>
            AIBlockList is built on open standards, public transparency, and open-source collaboration:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 body-6 text-zinc-400">
            <li>
              <strong className="text-zinc-200">Software Code:</strong> The codebase (frontend web applications,
              FastAPI backend, federation scrapers, browser extensions) is licensed under the{" "}
              <a
                href="https://www.apache.org/licenses/LICENSE-2.0"
                target="_blank"
                rel="noreferrer"
                className="text-[#ff6600] hover:underline"
              >
                Apache License 2.0
              </a>.
            </li>
            <li>
              <strong className="text-zinc-200">Public Intelligence Dataset:</strong> Core verified dataset
              exports, policy manifests, and cryptographic audit logs are published under the{" "}
              <a
                href="https://opendatacommons.org/licenses/by/1-0/"
                target="_blank"
                rel="noreferrer"
                className="text-[#ff6600] hover:underline"
              >
                Open Data Commons Attribution License 1.0 (ODC-By 1.0)
              </a>.
            </li>
            <li>
              <strong className="text-zinc-200">Upstream Project Attribution:</strong> External intelligence lists
              and pioneer AI-reply defense lists retain full attribution to their respective original curators.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="title-2 text-white">3. Public Behavioral Observation Disclaimer</h2>
          <p>
            AIBlockList compiles and indexes observable, public social media behavioral patterns
            (such as high-velocity unsolicited replies, copy-paste templated loops, and coordinated sybil
            clusters) evaluated strictly against our versioned public policies.
          </p>
          <div className="rounded-xl border border-[#272727] bg-[#0c0c0c] p-4 text-xs font-mono text-zinc-300">
            <strong className="text-white block mb-1 uppercase tracking-wider text-[#ff6600]">
              Legal Notice of Observation:
            </strong>
            A listing on AIBlockList is an editorial assessment of observable behavioral telemetry under
            published criteria. It does NOT constitute a statement of fact regarding the author&apos;s legal
            compliance, criminal liability, human biological identity, or violation of third-party platform terms.
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="title-2 text-white">4. Acceptable Use &amp; Anti-Harassment Prohibition</h2>
          <p>
            The Service is provided strictly for personal feed filtering, automated spam defense,
            academic research, and transparent platform hygiene. You expressly agree that you will NOT:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 body-6 text-zinc-400">
            <li>Use the database or extensions to organize, encourage, or facilitate targeted harassment, brigading, or mass-reporting campaigns against any individual.</li>
            <li>Dox, publish private offline contact information, or threaten listed account holders.</li>
            <li>Attempt to circumvent public rate limits or disrupt service availability through Denial of Service (DoS) attacks.</li>
            <li>Falsify behavioral evidence or submit fraudulent abuse complaints against political, ideological, or commercial competitors.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="title-2 text-white">5. Independent Right to Appeal &amp; Fast-Track Delisting</h2>
          <p>
            Any account holder listed in our database possesses the absolute, perpetual right to challenge
            their listing free of charge. We provide an automated bio challenge verification system that
            guarantees impartial re-review by an independent reviewer within 7 business days.
          </p>
          <p>
            To file an appeal, visit our dedicated portal at{" "}
            <Link href="/appeals" className="text-[#ff6600] hover:underline font-mono">
              /appeals
            </Link>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="title-2 text-white">6. Disclaimer of Warranties &amp; Limitation of Liability</h2>
          <p className="caption-4 font-mono text-zinc-400 uppercase leading-relaxed">
            THE SERVICE AND DATASETS ARE PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTY OF ANY KIND,
            WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE. TO THE MAXIMUM EXTENT PERMITTED UNDER APPLICABLE
            LAW, NEITHER AIBLOCKLIST, ITS CONTRIBUTORS, NOR ITS CURATORS SHALL BE LIABLE FOR ANY INDIRECT,
            INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF REPUTATION,
            ACCOUNT SUSPENSION BY THIRD-PARTY PLATFORMS, OR LOSS OF BUSINESS OPPORTUNITY.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="title-2 text-white">7. DMCA &amp; Takedown Requests</h2>
          <p>
            AIBlockList respects intellectual property and privacy rights. Because our system stores zero raw
            verbatim post text and zero screenshot media (storing only canonical status URLs and cryptographic SHA-256
            hashes), content hosted on upstream platforms remains under the control of those platforms.
            For copyright or privacy takedown notices, contact our Trust &amp; Safety desk via{" "}
            <Link href="/contact" className="text-[#ff6600] hover:underline">
              our Contact Portal
            </Link>.
          </p>
        </section>
      </div>

      {/* Footer Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#272727]">
        <Link href="/privacy" className="button-sm inline-flex items-center gap-1.5 text-zinc-400 hover:text-white">
          <FileText size={16} />
          <span>Read Privacy Notice</span>
        </Link>
        <Link href="/about" className="button-sm inline-flex items-center gap-1.5 text-[#ff6600] hover:text-white">
          <span>About &amp; Community Credits</span>
          <ArrowRight size={14} weight="bold" />
        </Link>
      </div>
    </div>
  );
}
