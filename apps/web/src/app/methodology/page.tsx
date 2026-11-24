import Link from "next/link";
import {
  Fingerprint,
  ShieldCheck,
  CheckCircle,
  WarningCircle,
  Clock,
  Graph,
  ArrowRight,
  Database,
} from "@phosphor-icons/react/dist/ssr";

export const metadata = {
  title: "Behavioral Verification Methodology — AIBlockList",
  description:
    "Deterministic behavioral signals SIG-01 to SIG-05 for identifying automated social spam without AI authorship detection scores.",
};

const SIGNALS = [
  {
    code: "SIG-01",
    name: "Near-Duplicate Unsolicited Replies",
    threshold: "3 or more replies with ≥ 0.90 cosine similarity across unrelated authors within 7 days",
    rationale:
      "Detects copy-paste spam loops while permitting genuine conversational consistency. Calculates TF-IDF and character n-gram cosine similarity across reply bodies.",
    corroboration: "Primary classification trigger.",
  },
  {
    code: "SIG-02",
    name: "Structural Template Loops",
    threshold: "5 or more replies in 14 days matching an identical structural clause skeleton",
    rationale:
      "Exposes synonym-rotated spambots that swap adjectives while keeping the exact pitch skeleton intact (e.g., 'Loved this insight! Check out my bio for more!').",
    corroboration: "Primary classification trigger.",
  },
  {
    code: "SIG-03",
    name: "Unsolicited Fan-Out Ratio",
    threshold: "≥ 20 daily replies with ≥ 90% non-mutual targets and < 5% follow-up dialogue turns",
    rationale:
      "Distinguishes authentic community conversation from broadcast spray-and-pray farming. Always requires pairing with SIG-01 or SIG-02 to safeguard active human chatters.",
    corroboration: "Corroborative trigger (must pair with SIG-01 or SIG-02).",
  },
  {
    code: "SIG-04",
    name: "Coordinated Campaign Cluster",
    threshold: "≥ 3 distinct accounts posting synchronized payloads within a 30-minute window",
    rationale:
      "Uncovers multi-account botnet syndicates amplifying the same commercial, crypto, or political targets in lockstep.",
    corroboration: "Primary classification trigger for coordinated manipulation.",
  },
  {
    code: "SIG-05",
    name: "Cadence Anomaly & Velocity Burst",
    threshold: "Median reply latency < 15 seconds across ≥ 10 diverse authors, or flat 24h posting over 72h",
    rationale:
      "Captures headless script execution. Crucially, speed alone NEVER triggers a classification — it only provides corroborating weight to structural signals.",
    corroboration: "Supporting only. Never classifies on its own.",
  },
];

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="max-w-[720px]">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#272727] bg-[#181818] px-3 py-1">
          <span className="h-2 w-2 rounded-full bg-[#ff6600]" />
          <span className="caption-4 font-mono text-zinc-300">
            Policy v1.0.0 · Deterministic Behavioral Verification
          </span>
        </div>
        <h1 className="heading-2 text-white">Verification Methodology</h1>
        <p className="body-3 mt-4 text-zinc-400">
          How AIBlockList evaluates social media activity using verifiable behavioral signals,
          peer-reviewed fairness research, and mandatory human review — without relying on flawed AI text detectors.
        </p>
      </div>

      {/* Stanford Research & The AI Detector Problem */}
      <div className="rounded-2xl border border-[#272727] bg-[#181818] p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-[#ff6600]">
          <WarningCircle size={22} weight="bold" />
          <h2 className="heading-4 text-white">Why AI Text Detectors Are Strictly Prohibited</h2>
        </div>
        <p className="body-3 text-zinc-300">
          In 2023, Stanford researchers demonstrated that popular AI writing detectors systematically
          misclassify non-native English writing as AI-generated at rates exceeding 61%.
          Stylometric detectors measure sentence perplexity and vocabulary distribution — penalizing
          careful, formal, or ESL grammar while easily failing against adversarial prompts.
        </p>
        <div className="rounded-xl border border-[#272727] bg-[#000000] p-4 font-mono caption-4 text-zinc-400 space-y-1">
          <p className="text-white font-bold">Policy Principle 2.2:</p>
          <p>
            &quot;The platform must never treat writing style, grammar quality, formal tone, English
            proficiency, AI-generated text probabilities, or third-party AI detection scores as
            standalone evidence.&quot;
          </p>
        </div>
      </div>

      {/* 5 Behavioral Signals */}
      <div className="space-y-6">
        <div>
          <h2 className="heading-3 text-white">The 5 Behavioral Signals</h2>
          <p className="body-4 mt-1 text-zinc-400">
            Every classification requires repeatable behavioral proof observed across public thread URLs.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {SIGNALS.map((sig) => (
            <div
              key={sig.code}
              className="rounded-2xl border border-[#272727] bg-[#181818] p-6 transition-all hover:border-[#313131]"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="caption-3 rounded border border-[#ff6600]/40 bg-[#131209] px-2.5 py-1 font-mono font-bold text-[#ff6600]">
                    {sig.code}
                  </span>
                  <h3 className="title-2 text-white">{sig.name}</h3>
                </div>
                <span className="caption-5 rounded border border-[#313131] bg-[#1f1f1f] px-2.5 py-0.5 font-mono text-zinc-400">
                  {sig.corroboration}
                </span>
              </div>

              <div className="mt-4 rounded-xl border border-[#272727] bg-[#000000] p-3 font-mono caption-4 text-[#ff6600]">
                Threshold: {sig.threshold}
              </div>

              <p className="body-5 mt-3 text-zinc-300">{sig.rationale}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Publication Gate & Safeguards */}
      <div className="rounded-2xl border border-[#272727] bg-[#181818] p-6 sm:p-8 space-y-6">
        <h2 className="heading-3 text-white">The 4-Point Publication Gate</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-[#272727] bg-[#000000] p-4 space-y-2">
            <span className="caption-3 font-mono text-[#ff6600] font-bold">GATE 1</span>
            <h3 className="title-3 text-white">≥ 2 Distinct URLs</h3>
            <p className="body-6 text-zinc-400">
              No account can enter the core verified blocklist on a single isolated post. Two distinct
              behavioral URLs are required to verify a persistent pattern.
            </p>
          </div>

          <div className="rounded-xl border border-[#272727] bg-[#000000] p-4 space-y-2">
            <span className="caption-3 font-mono text-[#ff6600] font-bold">GATE 2</span>
            <h3 className="title-3 text-white">Human Dual Review</h3>
            <p className="body-6 text-zinc-400">
              Accounts with 10,000+ followers or verified organization credentials require two
              independent human reviewers before publication.
            </p>
          </div>

          <div className="rounded-xl border border-[#272727] bg-[#000000] p-4 space-y-2">
            <span className="caption-3 font-mono text-[#ff6600] font-bold">GATE 3</span>
            <h3 className="title-3 text-white">Zero Raw Text Archiving</h3>
            <p className="body-6 text-zinc-400">
              To protect privacy and honor platform deletion rules, AIBlockList persists only
              canonical post URLs, platform post IDs, and SHA-256 hashes. Raw text is discarded.
            </p>
          </div>

          <div className="rounded-xl border border-[#272727] bg-[#000000] p-4 space-y-2">
            <span className="caption-3 font-mono text-[#ff6600] font-bold">GATE 4</span>
            <h3 className="title-3 text-white">Cryptographic Audit Chain</h3>
            <p className="body-6 text-zinc-400">
              Every reviewer action, appeal status change, and policy update is immutably linked via
              an append-only SHA-256 hash chain publicly verifiable on the Transparency Ledger.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
