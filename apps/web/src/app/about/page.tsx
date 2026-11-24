import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle,
  Prohibit,
  UsersThree,
  Scales,
  ArrowRight,
  GitBranch,
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
