import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle,
  Prohibit,
  UsersThree,
  Scales,
  ArrowRight,
  GitBranch,
  ArrowUpRight,
  Heart,
} from "@phosphor-icons/react/dist/ssr";

export const metadata = {
  title: "About & Open Source Governance Charter — AIBlockList",
  description:
    "AIBlockList is independent, open-source trust and safety infrastructure identifying abusive automated spam while protecting genuine human and AI-assisted communication.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="max-w-[720px]">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#272727] bg-[#181818] px-3 py-1">
          <span className="h-2 w-2 rounded-full bg-[#ff6600]" />
          <span className="caption-4 font-mono text-zinc-300">
            Open Source Trust & Safety Charter · Apache 2.0 & ODC-By 1.0
          </span>
        </div>
        <h1 className="heading-2 text-white">About AIBlockList</h1>
        <p className="body-3 mt-4 text-zinc-400">
          Independent, open-source intelligence infrastructure for identifying, verifying, and
          filtering abusive automated social media behavior across X and Threads — without AI text
          detection fallacies or automated retaliation.
        </p>
      </div>

      {/* Creator & Project Identity */}
      <div className="rounded-2xl border border-[#313131] bg-[#141414] p-6 sm:p-8 space-y-4">
        <span className="caption-4 font-mono uppercase text-[#ff6600] font-bold tracking-wider">
          Architecture &amp; Development
        </span>
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#272727] pb-4">
          <h2 className="heading-3 text-white">Built by @Agenticpirate</h2>
          <a
            href="https://x.com/Agenticpirate"
            target="_blank"
            rel="noreferrer"
            className="button-sm inline-flex items-center gap-1.5 rounded-lg border border-[#313131] bg-[#1e1e1e] px-3 py-1.5 font-mono text-sm font-bold text-zinc-200 hover:border-[#ff6600] hover:text-[#ff6600] transition-colors"
          >
            <span>@Agenticpirate on 𝕏</span>
            <ArrowUpRight size={14} weight="bold" />
          </a>
        </div>
        <p className="body-4 text-zinc-300 leading-relaxed">
          AIBlockList was designed and engineered by{" "}
          <a
            href="https://x.com/Agenticpirate"
            target="_blank"
            rel="noreferrer"
            className="text-[#ff6600] font-bold font-mono hover:underline"
          >
            @Agenticpirate
          </a>{" "}
          as an open-source, deterministic intelligence infrastructure. The goal is to provide creators, users, and developers with reliable behavioral defense against automated spam without relying on flawed probabilistic AI detectors or arbitrary blacklists.
        </p>
      </div>

      {/* Historical Lineage & Credits */}
      <div className="rounded-2xl border border-[#272727] bg-[#181818] p-6 sm:p-8 space-y-4">
        <span className="caption-4 font-mono uppercase text-zinc-400 font-bold tracking-wider">
          Historical Lineage &amp; Credits
        </span>
        <h2 className="title-2 text-white">Origin &amp; Early Inspiration</h2>
        <div className="space-y-3 body-4 text-zinc-300 leading-relaxed">
          <p>
            Credit is due to Pieter Levels (
            <a
              href="https://x.com/levelsio"
              target="_blank"
              rel="noreferrer"
              className="text-zinc-200 hover:underline font-mono"
            >
              @levelsio
            </a>
            ) who first started cataloging automated AI reply loops on 𝕏 with his project{" "}
            <a
              href="https://blockedforaireply.com"
              target="_blank"
              rel="noreferrer"
              className="text-zinc-200 hover:underline font-mono"
            >
              blockedforaireply.com
            </a>
            .
          </p>
          <p>
            AIBlockList acknowledges that early spark and formalizes the ecosystem with:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 font-mono text-xs">
            <div className="rounded-xl border border-[#272727] bg-[#121212] p-3.5 space-y-1">
              <strong className="text-white block font-sans text-sm">Deterministic Verification</strong>
              <p className="text-zinc-400">SIG-01 to SIG-05 behavioral criteria requiring 2+ canonical evidence URLs with SHA-256 provenance.</p>
            </div>
            <div className="rounded-xl border border-[#272727] bg-[#121212] p-3.5 space-y-1">
              <strong className="text-white block font-sans text-sm">Cross-Platform Standard</strong>
              <p className="text-zinc-400">Unified intelligence defense extending across both 𝕏 and Meta Threads.</p>
            </div>
            <div className="rounded-xl border border-[#272727] bg-[#121212] p-3.5 space-y-1">
              <strong className="text-white block font-sans text-sm">Automated Abuse Dispatch</strong>
              <p className="text-zinc-400">1-click official Trust &amp; Safety reporting packets direct to platform abuse desks.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Core Philosophy Section */}
      <div className="rounded-2xl border border-[#272727] bg-[#181818] p-6 sm:p-8 space-y-6">
        <h2 className="heading-3 text-white">The Core Philosophy</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-[#272727] bg-[#000000] p-5 space-y-3">
            <div className="flex items-center gap-2 text-[#ff6600]">
              <CheckCircle size={20} weight="bold" />
              <h3 className="title-3 text-white">What We Target</h3>
            </div>
            <p className="body-5 text-zinc-400">
              Repetitive automated spam, engagement farming reply loops, synchronized botnet
              campaigns, deceptive impersonation scripts, and programmatic manipulation across
              unrelated public threads.
            </p>
          </div>

          <div className="rounded-xl border border-[#272727] bg-[#000000] p-5 space-y-3">
            <div className="flex items-center gap-2 text-[#ff6600]">
              <Prohibit size={20} weight="bold" />
              <h3 className="title-3 text-white">What We Never Penalize</h3>
            </div>
            <p className="body-5 text-zinc-400">
              People using ChatGPT or Claude to polish their English, non-native English speakers,
              formal grammar, enthusiastic conversationalists, or legitimate automation clearly
              disclosed and adhering to platform rules.
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="rounded-2xl border border-[#272727] bg-[#181818] p-6 sm:p-8 space-y-6">
        <h2 className="heading-3 text-white">How AIBlockList Differs</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono caption-4 text-zinc-300">
            <thead>
              <tr className="border-b border-[#272727] text-zinc-500 uppercase">
                <th className="py-3 pr-4">Dimension</th>
                <th className="py-3 px-4">Traditional Blocklists</th>
                <th className="py-3 px-4">AI Text Detectors</th>
                <th className="py-3 pl-4 text-[#ff6600]">AIBlockList Standard</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#272727]">
              <tr>
                <td className="py-3 pr-4 font-bold text-white">Evidence Requirement</td>
                <td className="py-3 px-4 text-zinc-400">0 URLs (silent blocks)</td>
                <td className="py-3 px-4 text-zinc-400">Perplexity score heuristic</td>
                <td className="py-3 pl-4 text-white font-bold">2+ distinct canonical post URLs</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-bold text-white">Governance</td>
                <td className="py-3 px-4 text-zinc-400">Sole administrator / opaque</td>
                <td className="py-3 px-4 text-zinc-400">100% automated model output</td>
                <td className="py-3 pl-4 text-white font-bold">Human review + dual review for 10k+</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-bold text-white">Appeals</td>
                <td className="py-3 px-4 text-zinc-400">None / public swearing oaths</td>
                <td className="py-3 px-4 text-zinc-400">No appeal mechanism</td>
                <td className="py-3 pl-4 text-white font-bold">Free bio token verification + 7d SLA</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-bold text-white">Audit History</td>
                <td className="py-3 px-4 text-zinc-400">None</td>
                <td className="py-3 px-4 text-zinc-400">None</td>
                <td className="py-3 pl-4 text-white font-bold">Append-only SHA-256 hash chain</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-bold text-white">Privacy Protection</td>
                <td className="py-3 px-4 text-zinc-400">Archives raw post content</td>
                <td className="py-3 px-4 text-zinc-400">Stores submitted text</td>
                <td className="py-3 pl-4 text-white font-bold">Zero raw post text or screenshots stored</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-bold text-white">Platform Actions</td>
                <td className="py-3 px-4 text-zinc-400">DOM mass-blocking scripts</td>
                <td className="py-3 px-4 text-zinc-400">None</td>
                <td className="py-3 pl-4 text-white font-bold">Local-first warning badges (zero DOM clicks)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Governance & Open Source */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-[#272727] bg-[#181818] p-6 space-y-4">
          <div className="flex items-center gap-2 text-[#ff6600]">
            <Scales size={20} weight="bold" />
            <h2 className="title-2 text-white">Independent Appeals</h2>
          </div>
          <p className="body-5 text-zinc-400">
            Account owners can verify identity using a single-use bio challenge token with zero
            fees and zero humiliating public oaths. Every appeal is routed to an independent reviewer
            who had no role in the original listing, subject to a 7 business day resolution target.
          </p>
          <Link
            href="/appeals"
            className="button-sm inline-flex items-center gap-1.5 text-[#ff6600] hover:text-white transition-colors"
          >
            <span>Learn about appeals</span>
            <ArrowRight size={14} weight="bold" />
          </Link>
        </div>

        <div className="rounded-2xl border border-[#272727] bg-[#181818] p-6 space-y-4">
          <div className="flex items-center gap-2 text-[#ff6600]">
            <GitBranch size={20} weight="bold" />
            <h2 className="title-2 text-white">Open Source & Transparency</h2>
          </div>
          <p className="body-5 text-zinc-400">
            All code is published under Apache 2.0. Verified dataset exports use Open Data Commons
            Attribution License 1.0 (ODC-By 1.0). Every classification and appeal decision is
            recorded on an immutable SHA-256 cryptographic audit chain.
          </p>
          <Link
            href="/transparency"
            className="button-sm inline-flex items-center gap-1.5 text-[#ff6600] hover:text-white transition-colors"
          >
            <span>Inspect transparency ledger</span>
            <ArrowRight size={14} weight="bold" />
          </Link>
        </div>
      </div>
    </div>
  );
}
