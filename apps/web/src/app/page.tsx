import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  UsersThree,
  Scales,
  Fingerprint,
  GitBranch,
  Database,
  CheckCircle,
  Prohibit,
} from "@phosphor-icons/react/dist/ssr";
import { HeroInspector } from "@/components/HeroInspector";
import { TaglineReveal } from "@/components/TaglineReveal";
import { ScrollReveal } from "@/components/ScrollReveal";
import { CodeHandoff } from "@/components/CodeHandoff";
import { API_BASE_URL, StatisticsResponse } from "@/lib/api";

async function getLiveStats(): Promise<StatisticsResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/statistics`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as StatisticsResponse;
  } catch {
    return null;
  }
}

const SIGNALS = [
  {
    code: "SIG-01",
    name: "Near duplicate unsolicited replies",
    threshold: "3 or more replies with 0.90 cosine similarity across unrelated authors in 7 days",
    detail: "Captures looped spam payloads while allowing genuine contextual discussion.",
  },
  {
    code: "SIG-02",
    name: "Structural template loops",
    threshold: "5 or more replies in 14 days sharing an identical structural skeleton",
    detail: "Detects synonym rotated reply bots running fixed engagement scripts.",
  },
  {
    code: "SIG-03",
    name: "Unsolicited fan out ratio",
    threshold: "20 or more daily replies with over 90% non mutual targets and under 5% dialogue",
    detail: "Always paired with SIG-01 or SIG-02 so active human conversationalists stay safe.",
  },
  {
    code: "SIG-04",
    name: "Coordinated campaign cluster",
    threshold: "3 or more distinct accounts posting synchronized payloads within 30 minutes",
    detail: "Maps botnet astroturfing into auditable cross account clusters.",
  },
  {
    code: "SIG-05",
    name: "Cadence anomaly (supporting only)",
    threshold: "Median reply latency under 15 seconds or flat 24 hour posting over 72 hours",
    detail: "Corroborative metric only. Timing alone never triggers a public classification.",
  },
];

const FAQS = [
  {
    q: "Does AIBlockList flag people who use ChatGPT or Claude to improve their English?",
    a: "Never. Writing style, grammar quality, formal tone, English proficiency, and third party AI text detector scores are strictly prohibited as standalone evidence. Legitimate AI assisted communication is explicitly protected.",
  },
  {
    q: "Why are external records from blockedforaireply.com marked as External unverified?",
    a: "Our audit of the live upstream feed shows thousands of entries lack public behavioral URLs. AIBlockList preserves external assertions transparently side by side without ever merging unverified external blocks into our core verified database.",
  },
  {
    q: "Can a coordinated group weaponize community reports against a legitimate creator?",
    a: "No report can automatically publish a listing. Submissions pass through 24 hour deduplication, internal reporter standing, and a brigading burst circuit breaker that quarantines sudden spikes rather than escalating them. High impact accounts also require two distinct human reviewers.",
  },
  {
    q: "Do you store copies of third party social media posts or user screenshots?",
    a: "No. To protect privacy and comply with platform deletion rules, AIBlockList stores only canonical public URLs, SHA-256 hashes, numerical behavioral metrics, and deletion tombstones. Raw post text and screenshot uploads are excluded.",
  },
  {
    q: "How do appeals work if an account is listed by mistake?",
    a: "Account owners verify ownership using a single use bio token or official OAuth, with zero fees and zero humiliating public oaths. Every appeal is routed to an independent reviewer who had zero role in the original decision, with 48 hour triage and a 7 business day target.",
  },
  {
    q: "Will your browser extension automate clicking Block buttons on X?",
    a: "Never. Automated DOM clicking violates platform rules against scripting websites and risks suspending the user account. Our Manifest V3 architecture uses local first snapshots synced every 6 hours with user controlled warnings and hiding.",
  },
  {
    q: "How does AIBlockList handle deleted posts or renamed handles?",
    a: "Records anchor to immutable numeric platform IDs whenever permitted, preventing handle squatting from harming innocent users. When cited posts are deleted, tombstone checks re verify evidence counts and move accounts below two active URLs back under review.",
  },
  {
    q: "What licenses govern the source code and public dataset?",
    a: "Application source code is licensed under Apache 2.0. Verified public dataset exports use Open Data Commons Attribution License 1.0 (ODC-By 1.0), preserving attribution and canonical appeal links. External federated lists retain their original upstream attribution.",
  },
];

export default async function HomePage() {
  const stats = await getLiveStats();
  const totalIndexed = stats?.totals.indexed_accounts ?? 3619;
  const withUrls = stats?.totals.accounts_with_public_evidence_urls ?? 1312;
  const meetingTwoUrls = stats?.totals.accounts_meeting_2_url_threshold ?? 754;
  const silentCount = stats?.totals.silent_external_entries_zero_urls ?? 2307;
  const conflicts = stats?.totals.source_conflicts_preserved ?? 616;
  const evidencePct = totalIndexed > 0 ? ((withUrls / totalIndexed) * 100).toFixed(1) : "36.3";

  return (
    <div className="pb-8">
      {/* SECTION 1: HERO (A2 + B5 — One Primary CTA, 680px cap, live Aceternity/AgentMail inspector) */}
      <section className="mx-auto max-w-6xl px-4 pt-8 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[680px] text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#272727] bg-[#181818] px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-[#ff6600]" />
            <span className="caption-4 font-mono text-zinc-300">
              Policy v1.0.0 · Open source trust and safety infrastructure
            </span>
          </div>

          <h1 className="heading-1 hero-heading-gradient mx-auto max-w-[680px]">
            Filter automated spam
            <br />
            without silencing real people
          </h1>

          <p className="body-3 mx-auto mt-6 max-w-[680px] text-zinc-400">
            AIBlockList identifies repetitive bot networks through verifiable behavioral URLs,
            mandatory human review, and free independent appeals. Legitimate human and AI
            assisted writing always stays protected.
          </p>

          {/* Single Primary CTA above the fold (A4 + B2 8px/12px padding) */}
          <div className="mt-8 flex flex-col items-center justify-center gap-4">
            <Link
              href="/directory"
              className="button-md inline-flex items-center gap-2 rounded-lg bg-[#ff6600] px-3 py-2 text-black transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[#e55c00] active:scale-[0.98]"
            >
              <span>Inspect accounts</span>
              <ArrowRight size={16} weight="bold" />
            </Link>
            <p className="caption-4 font-mono text-zinc-400">
              {totalIndexed.toLocaleString()} indexed external records · {meetingTwoUrls.toLocaleString()} with 2+ public URLs · Zero AI text detectors
            </p>
          </div>
        </div>

        {/* Interactive Live Intelligence Inspector Canvas */}
        <div className="mt-12">
          <HeroInspector />
        </div>
      </section>

      {/* SECTION 2: PROBLEM TO SOLUTION (Empirical Evidence Coverage Audit) */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-[#272727] bg-[#181818] p-8">
              <div className="flex items-center gap-2 text-zinc-400 mb-4">
                <Prohibit size={20} weight="bold" className="text-[#ff6600]" />
                <span className="caption-3 font-mono uppercase">Why opaque blocklists fail</span>
              </div>
              <h2 className="heading-4 text-white">
                Silent blocks punish innocent writers and break trust
              </h2>
              <p className="body-3 mt-4 text-zinc-400">
                Auditing the live external feed reveals {silentCount.toLocaleString()} entries carry
                zero public evidence URLs while only {evidencePct}% attach at least one post link.
                Peer reviewed Stanford research also proves AI text detectors systematically mislabel
                non native English writers.
              </p>

              <div className="mt-6 space-y-3 rounded-xl border border-[#272727] bg-[#1f1f1f] p-4">
                <div className="flex items-center justify-between caption-4 font-mono">
                  <span className="text-zinc-300">Live upstream evidence audit</span>
                  <span className="text-[#ff6600]">{evidencePct}% carry public URLs</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#313131]">
                  <div
                    className="h-full rounded-full bg-[#ff6600]"
                    style={{ width: `${evidencePct}%` }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 font-mono caption-5 text-zinc-400">
                  <div>
                    <span className="block text-white title-4">{totalIndexed.toLocaleString()}</span>
                    <span>External total</span>
                  </div>
                  <div>
                    <span className="block text-white title-4">{meetingTwoUrls.toLocaleString()}</span>
                    <span>2+ post URLs</span>
                  </div>
                  <div>
                    <span className="block text-white title-4">{conflicts.toLocaleString()}</span>
                    <span>Source conflicts</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#272727] bg-[#181818] p-8">
              <div className="flex items-center gap-2 text-zinc-400 mb-4">
                <ShieldCheck size={20} weight="bold" className="text-[#ff6600]" />
                <span className="caption-3 font-mono uppercase">The AIBlockList standard</span>
              </div>
              <h2 className="heading-4 text-white">
                Observable behavioral proof with human governance
              </h2>
              <p className="body-3 mt-4 text-zinc-400">
                External blocklists remain strictly isolated as unverified external assertions.
                Entering our verified core registry requires repeatable behavioral signals, active
                policy versioning, human sign off, and a cryptographic audit record.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Minimum two distinct canonical behavioral post URLs for confirmed status",
                  "Dual independent human review mandatory on high impact accounts",
                  "Side by side source assertions exposing disagreements instead of silent merges",
                  "Immutable numeric platform IDs protecting new owners after handle renames",
                ].map((point) => (
                  <li key={point} className="flex items-start gap-2.5 body-5 text-zinc-200">
                    <CheckCircle size={18} weight="bold" className="mt-0.5 shrink-0 text-[#ff6600]" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* SECTION 3: MANDATORY TAGLINE REVEAL SECTION (B11) */}
      <TaglineReveal text="Every public classification requires observable behavior, human sign off, and a free path to appeal." />

      {/* SECTION 4: OUTCOME DRIVEN BENEFITS + DEVELOPER HANDOFF */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="max-w-[680px]">
            <p className="caption-3 font-mono uppercase text-[#ff6600] mb-3">
              Engineered for accuracy and openness
            </p>
            <h2 className="heading-3 text-white">
              Four safeguards built into every layer of the database
            </h2>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            {[
              {
                icon: Fingerprint,
                title: "Protect non native English and AI assisted writers",
                body: "Zero stylometric AI detectors. Every classification measures cross thread repetition, template loops, fan out ratio, and campaign coordination under a `<2%` false positive benchmark gate.",
              },
              {
                icon: UsersThree,
                title: "Neutralize weaponized reporting and brigading",
                body: "Community submissions never publish automatically. 24 hour deduplication, private reporter standing, and a burst circuit breaker quarantine sudden spikes above 5 reports in 15 minutes.",
              },
              {
                icon: GitBranch,
                title: "Federate external lists without silent overwrites",
                body: "External sources such as blockedforaireply and Clankwall sit transparently in source assertions with explicit conflict indicators and anomaly pauses when over 10% of records shift.",
              },
              {
                icon: Scales,
                title: "Guarantee free, independent appeals in 7 business days",
                body: "Account owners prove control via single use bio token or OAuth with zero public oaths. Appeals route to an independent reviewer excluded from the original decision, publishing public corrections.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="rounded-2xl border border-[#272727] bg-[#181818] p-6 transition-colors duration-300 hover:border-[#313131] hover:bg-[#1f1f1f]"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-[#313131] bg-[#000000] text-[#ff6600]">
                    <Icon size={20} weight="bold" />
                  </div>
                  <h3 className="title-2 text-white">{item.title}</h3>
                  <p className="body-6 mt-2 text-zinc-400">{item.body}</p>
                </article>
              );
            })}
          </div>
        </ScrollReveal>
      </section>

      {/* SECTION 5: BEHAVIORAL SIGNAL ENGINE & DEVELOPER API HANDOFF (AgentMail inspired) */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
            <div className="lg:col-span-7">
              <p className="caption-3 font-mono uppercase text-[#ff6600] mb-3">
                Policy v1.0.0 Signal Rubric
              </p>
              <h2 className="heading-4 text-white">
                Five deterministic behavioral signals
              </h2>
              <p className="body-3 mt-3 text-zinc-400">
                Every rule threshold is tied to an immutable policy version and requires a 14 day
                public RFC before modification.
              </p>

              <div className="mt-6 space-y-3">
                {SIGNALS.map((sig) => (
                  <div
                    key={sig.code}
                    className="rounded-xl border border-[#272727] bg-[#181818] p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="title-4 text-white">{sig.name}</span>
                      <span className="caption-4 rounded border border-[#313131] bg-[#1f1f1f] px-2 py-0.5 font-mono text-[#ff6600]">
                        {sig.code}
                      </span>
                    </div>
                    <p className="caption-4 mt-2 font-mono text-zinc-300">{sig.threshold}</p>
                    <p className="body-6 mt-1 text-zinc-400">{sig.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-2xl border border-[#272727] bg-[#181818] p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Database size={18} weight="bold" className="text-[#ff6600]" />
                  <span className="caption-3 font-mono uppercase text-zinc-300">
                    OpenAPI 3.1 + Zero Egress CDN
                  </span>
                </div>
                <h3 className="heading-5 text-white">
                  Built for browser extensions and trust teams
                </h3>
                <p className="body-6 mt-2 text-zinc-400">
                  Query accounts by mutable handle or immutable platform ID with ETag caching,
                  cursor pagination up to 500 records, RFC 9457 error responses, and compressed
                  delta snapshots synced locally every 6 hours.
                </p>
                <div className="mt-4">
                  <Link
                    href="/api-docs"
                    className="button-sm inline-flex items-center gap-1.5 rounded-lg border border-[#313131] bg-[#1f1f1f] px-3 py-2 text-white hover:bg-[#272727] transition-colors duration-300"
                  >
                    <span>Explore API reference</span>
                    <ArrowRight size={14} weight="bold" />
                  </Link>
                </div>
              </div>

              <CodeHandoff />
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* SECTION 6: HOW IT WORKS (3 Steps) */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="max-w-[680px]">
            <p className="caption-3 font-mono uppercase text-[#ff6600] mb-3">How it works</p>
            <h2 className="heading-3 text-white">
              From community report to verified public intelligence
            </h2>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Submit canonical post URLs",
                body: "Reporters provide one to ten public post links. Strict allowlists prevent malicious URLs, PII redaction strips personal data, and burst breakers isolate coordinated report floods.",
              },
              {
                step: "02",
                title: "Compute signals and human review",
                body: "Deterministic workers evaluate cross thread duplication and templates without archiving raw posts. Human moderators, plus a second distinct reviewer on high impact accounts, sign off.",
              },
              {
                step: "03",
                title: "Sync locally and protect appeals",
                body: "Every decision commits to an append only SHA-256 hash chain and publishes to CDN snapshots. Extensions match locally with zero browsing telemetry, and owners can appeal free anytime.",
              },
            ].map((s) => (
              <div key={s.step} className="rounded-2xl border border-[#272727] bg-[#181818] p-6">
                <span className="font-mono heading-5 text-[#ff6600]">{s.step}</span>
                <h3 className="title-2 mt-3 text-white">{s.title}</h3>
                <p className="body-6 mt-2 text-zinc-400">{s.body}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* SECTION 7: FAQ (8 Real Objection Handling Questions) */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <ScrollReveal>
          <p className="caption-3 font-mono uppercase text-[#ff6600] mb-3">
            Questions and governance
          </p>
          <h2 className="heading-3 text-white mb-8">Frequently asked questions</h2>

          <div className="space-y-3">
            {FAQS.map((item) => (
              <details
                key={item.q}
                className="group rounded-xl border border-[#272727] bg-[#181818] p-5 open:bg-[#1f1f1f] transition-colors duration-300"
              >
                <summary className="title-3 cursor-pointer list-none flex items-center justify-between gap-4 text-white">
                  <span>{item.q}</span>
                  <span className="font-mono text-[#ff6600] transition-transform duration-300 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="body-6 mt-3 text-zinc-400">{item.a}</p>
              </details>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* SECTION 8: RISK REVERSAL & FINAL CTA */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="rounded-2xl border border-[#272727] bg-[#181818] p-8 sm:p-12 text-center">
            <p className="caption-3 font-mono uppercase text-[#ff6600] mb-3">
              Open forever · Zero paid delisting · Zero user tracking
            </p>
            <h2 className="heading-3 mx-auto max-w-[680px] text-white">
              Inspect the live intelligence registry right now
            </h2>
            <p className="body-3 mx-auto mt-4 max-w-[680px] text-zinc-400">
              Search {totalIndexed.toLocaleString()} indexed X accounts by handle or immutable ID,
              audit upstream evidence coverage, or review our live cryptographic transparency ledger.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/directory"
                className="button-md inline-flex items-center gap-2 rounded-lg bg-[#ff6600] px-3 py-2 text-black hover:bg-[#e55c00] active:scale-[0.98] transition-all duration-300"
              >
                <span>Inspect accounts</span>
                <ArrowRight size={16} weight="bold" />
              </Link>
              <Link
                href="/transparency"
                className="button-md inline-flex items-center gap-2 rounded-lg border border-[#313131] bg-[#1f1f1f] px-3 py-2 text-white hover:bg-[#272727] active:scale-[0.98] transition-all duration-300"
              >
                <span>View transparency ledger</span>
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
