import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, LockKey, CheckCircle, ArrowRight, FileText, Database } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "Privacy Notice & Data Governance — AIBlockList",
  description:
    "Privacy by Architecture: Understand how AIBlockList processes data, protects user privacy, eliminates tracking cookies, and upholds global data rights.",
};

export default function PrivacyPage() {
  const lastUpdated = "November 24, 2026";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#272727] bg-[#181818] px-3 py-1">
          <span className="h-2 w-2 rounded-full bg-[#ff6600]" />
          <span className="caption-4 font-mono text-zinc-300">
            Privacy by Architecture · Effective {lastUpdated}
          </span>
        </div>
        <h1 className="heading-2 text-white">Privacy Policy &amp; Data Rights</h1>
        <p className="body-3 mt-3 text-zinc-400">
          Our core premise: privacy is not an afterthought or a disclaimer—it is engineered directly into
          our system architecture, schema constraints, and client extensions.
        </p>
      </div>

      {/* Summary Highlight Box */}
      <div className="rounded-2xl border border-[#272727] bg-[#181818] p-6 sm:p-8 space-y-5">
        <div className="flex items-center gap-2 text-[#ff6600]">
          <LockKey size={22} weight="bold" />
          <h2 className="title-2 text-white">Privacy in Three Rules</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-[#272727] bg-[#0c0c0c] p-4">
            <span className="caption-4 font-mono uppercase text-[#ff6600] block mb-1">
              Zero Raw Post Scraping
            </span>
            <p className="caption-5 text-zinc-400">
              We never archive full social media post archives or private DMs. Only canonical public URLs and cryptographic hashes are persisted.
            </p>
          </div>
          <div className="rounded-xl border border-[#272727] bg-[#0c0c0c] p-4">
            <span className="caption-4 font-mono uppercase text-[#ff6600] block mb-1">
              Zero Browser Tracking
            </span>
            <p className="caption-5 text-zinc-400">
              Our browser extension evaluates handles in local memory against an offline cache. Your browsing feeds and reading habits are never transmitted.
            </p>
          </div>
          <div className="rounded-xl border border-[#272727] bg-[#0c0c0c] p-4">
            <span className="caption-4 font-mono uppercase text-[#ff6600] block mb-1">
              Zero Tracking Cookies
            </span>
            <p className="caption-5 text-zinc-400">
              We employ no Google Analytics, no Facebook pixels, and no ad trackers. Local browser storage is used exclusively for theme and filter settings.
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Legal Sections */}
      <div className="rounded-2xl border border-[#272727] bg-[#181818] p-6 sm:p-8 space-y-8 text-zinc-300 body-4">
        <section className="space-y-3">
          <h2 className="title-2 text-white">1. Data Controller &amp; Scope</h2>
          <p>
            This Privacy Policy governs AIBlockList.com (&ldquo;AIBlockList&rdquo;, &ldquo;we&rdquo;, or &ldquo;our&rdquo;),
            an open-source public interest intelligence project. This policy details how we collect, process, and
            safeguard information across our web applications, public API endpoints, and client extensions.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="title-2 text-white">2. Categories of Information Processed</h2>
          <p>
            We adhere strictly to the principle of data minimization:
          </p>
          <ul className="list-disc pl-5 space-y-2 body-6 text-zinc-400">
            <li>
              <strong className="text-zinc-200">Public Behavioral Observations:</strong> Numeric platform account IDs,
              public usernames, canonical post permalinks, behavioral signal scores (SIG-01 through SIG-05), and
              SHA-256 integrity hashes.
            </li>
            <li>
              <strong className="text-zinc-200">API Abuse Prevention Telemetry:</strong> To defend against Denial of
              Service (DoS) and abusive automated scraping, incoming requests log a salted, one-way SHA-256 hash of the
              caller&apos;s /24 IPv4 or /48 IPv6 network subnet. Raw IP addresses are discarded in volatile memory and
              never written to persistent storage. Subnet hashes expire automatically after 30 days.
            </li>
            <li>
              <strong className="text-zinc-200">Community Abuse Reports:</strong> When users submit reports via our form,
              we collect only public post URLs, observed behavioral tags, and the optional reporter handle.
            </li>
            <li>
              <strong className="text-zinc-200">Appeals Data:</strong> Ephemeral bio verification challenge tokens generated
              during appeals expire automatically within 48 hours of verification completion.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="title-2 text-white">3. Public vs. Private Schema Isolation</h2>
          <p>
            By architectural design, internal operational records are strictly segregated from public datasets:
          </p>
          <div className="rounded-xl border border-[#272727] bg-[#0c0c0c] p-4 text-xs font-mono text-zinc-300 space-y-1">
            <p><strong className="text-[#ff6600]">Public Intelligence Exports:</strong> Handle, Platform ID, Canonical URLs, Hashes, Provenance Source, Review Status.</p>
            <p><strong className="text-zinc-400">Private Isolated Schemas:</strong> Reporter IP subnet hashes (30d TTL), Internal moderator deliberations, Ephemeral appeal tokens.</p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="title-2 text-white">4. Lawful Basis for Processing (GDPR &amp; DPDP)</h2>
          <p>
            For users residing in the European Economic Area (EEA), the United Kingdom, or India:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 body-6 text-zinc-400">
            <li>
              <strong className="text-zinc-200">Legitimate Interests (GDPR Art. 6(1)(f)):</strong> Processing public
              telemetry is strictly necessary for our legitimate interest in protecting internet users against automated
              sybil spam, social engineering botnets, and coordinated platform manipulation.
            </li>
            <li>
              <strong className="text-zinc-200">Freedom of Expression &amp; Research:</strong> Operating public accountability
              registers regarding automated bot activity on public communication networks.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="title-2 text-white">5. Your Legal Rights: Erasure, Rectification &amp; Delisting</h2>
          <p>
            We provide fast-track mechanisms to exercise your rights under GDPR (Articles 15 through 22), the California
            Consumer Privacy Act (CCPA), and India DPDP Act 2023:
          </p>
          <ul className="list-disc pl-5 space-y-2 body-6 text-zinc-400">
            <li>
              <strong className="text-zinc-200">Right to Erasure (Article 17):</strong> If an upstream post is deleted on X or
              Threads, our periodic sync applies an immutable tombstone (`source_deleted_at`), removing it from public view.
            </li>
            <li>
              <strong className="text-zinc-200">Right to Object &amp; Free Delisting (Article 21):</strong> If you believe your
              account was erroneously classified, you may initiate an immediate, free independent appeal through our{" "}
              <Link href="/appeals" className="text-[#ff6600] hover:underline font-mono">
                Appeals Portal
              </Link>.
            </li>
            <li>
              <strong className="text-zinc-200">Anti-Harassment Cooldown:</strong> When an account is cleared or delisted upon
              appeal, our system applies a mandatory 90-day anti-harassment cooldown, preventing malicious actors from re-reporting
              the user without new independent verified evidence.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="title-2 text-white">6. Contact Data Protection Officer (DPO)</h2>
          <p>
            For privacy inquiries, regulatory notices, or formal data subject access requests, reach our
            designated Trust &amp; Safety custodians via{" "}
            <Link href="/contact" className="text-[#ff6600] hover:underline">
              our Contact &amp; Governance Center
            </Link>.
          </p>
        </section>
      </div>

      {/* Footer Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#272727]">
        <Link href="/terms" className="button-sm inline-flex items-center gap-1.5 text-zinc-400 hover:text-white">
          <FileText size={16} />
          <span>Terms of Service</span>
        </Link>
        <Link href="/transparency" className="button-sm inline-flex items-center gap-1.5 text-[#ff6600] hover:text-white">
          <Database size={16} />
          <span>Cryptographic Audit Chain</span>
          <ArrowRight size={14} weight="bold" />
        </Link>
      </div>
    </div>
  );
}
