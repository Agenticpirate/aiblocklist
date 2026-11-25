import {
  GithubLogo,
  ArrowSquareOut,
  UsersThree,
  Funnel,
  Scales,
  EyeSlash,
  TrendUp,
  TrendDown,
} from "@phosphor-icons/react";

// Source of truth: github.com/xai-org/x-algorithm (Apache 2.0).
// shortcut: values copied by hand from home-mixer/params/param.rs on 2026-11-25; re-check the repo when X publishes an update.
const REPO = "https://github.com/xai-org/x-algorithm";
const VERIFIED_ON = "November 25, 2026";

const srcHref = (path: string) => `${REPO}/${path.endsWith("/") ? "tree" : "blob"}/main/${path}`;

const KEY_NUMBERS = [
  { value: "20", label: "Weight of a copied link, the strongest positive signal", tone: "text-emerald-400" },
  { value: "−234", label: "Weight of a predicted report, the strongest negative signal", tone: "text-red-400" },
  { value: "48h", label: "How long a post stays eligible for For You", tone: "text-white" },
];

const STEPS = [
  {
    icon: UsersThree,
    title: "Gather",
    body: "Pulls recent posts from accounts you follow, plus posts from accounts you don't follow that a retrieval model predicts you'll engage with.",
    file: "home-mixer/sources/",
  },
  {
    icon: Funnel,
    title: "Filter",
    body: "Removes posts older than 48 hours, posts you've already seen, your own posts, muted keywords, and accounts you block or mute.",
    file: "home-mixer/filters/",
  },
  {
    icon: Scales,
    title: "Score",
    body: "Phoenix, a Grok-based model, studies your recent activity and predicts how likely you are to like, reply, share, mute or report each post. Each prediction is weighted and summed into one score.",
    file: "home-mixer/scorers/",
  },
  {
    icon: EyeSlash,
    title: "Enforce",
    body: "Independently of the score, labels on a post or its author decide whether it appears normally, with a notice, behind a warning screen, or not at all.",
    file: "visibility-filtering/",
  },
];

// Weights from home-mixer/params/param.rs (the repo syncs these to production defaults).
const POSITIVE = [
  { label: "Copies the link", w: 20 },
  { label: "Replies", note: "20 between mutual follows", w: 5 },
  { label: "Quotes the post", w: 5 },
  { label: "Shares it by DM", w: 5 },
  { label: "Follows the author", w: 4 },
  { label: "Shares it (any method)", w: 2.118 },
  { label: "Reposts", w: 1 },
  { label: "Likes", w: 0.708 },
  { label: "Opens the post", w: 0.274 },
];

const NEGATIVE = [
  { label: "Reports the post", w: -234 },
  { label: "Mutes the author", w: -58.8 },
  { label: "Taps “Not interested”", w: -53.07 },
  { label: "Blocks the author", w: -31.2 },
];

const LABELS = [
  {
    name: "DoNotAmplify",
    scope: "Hidden from non-followers",
    body: "Your followers still see the post, but it won't be recommended to anyone else.",
    file: "visibility-filtering/rules/author_rules.rs",
  },
  {
    name: "SpamHighRecall",
    scope: "Hidden from everyone but you",
    body: "Applied to posts or accounts flagged as likely spam. Pinning a link to a domain rated low-quality is one documented trigger.",
    file: "botmaker-rules/scarecrow/bot/PinnedLowQualityOrBadUrl.bot",
  },
  {
    name: "COPYPASTA_SPAM",
    scope: "Ranked lower",
    body: "Applied when the same reply text is posted repeatedly, even if you wrote it yourself.",
    file: "botmaker-rules/scarecrow/bot/BBQDuplicateTextRepliesProd.bot",
  },
  {
    name: "Reply scorer",
    scope: "Orders replies",
    body: "A Grok model rates each reply to decide where it appears in a thread. Its prompt is one of the few files X keeps private.",
    file: "grox/flows/reply_spam/",
  },
];

const TAKEAWAYS = [
  ["Write to be shared.", "A copied link is worth 20 and a DM share 5. A like is worth 0.7."],
  ["Start real conversations.", "A reply carries 5, rising to 20 when you and the reader follow each other."],
  ["Don't invite reports.", "Even a 1% chance of a report costs more than a guaranteed like."],
  ["Timing matters.", "After 48 hours, a post can no longer reach new people through For You."],
  ["Post less, post better.", "Each additional post from the same author in a feed scores lower than the last."],
  ["Never paste the same reply twice.", "Duplicate replies are labeled spam, and so are pinned links to low-quality sites."],
];

const maxPos = 20;
const maxNeg = 234;

function SectionHeading({ index, title, kicker, source }: { index: string; title: string; kicker: string; source?: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1 mb-3.5">
      <div>
        <span className="text-[10.5px] font-mono tracking-[0.18em] text-[#ff6600]">{index}</span>
        <h3 className="text-base sm:text-lg font-semibold text-white leading-tight">{title}</h3>
        <p className="text-[13px] text-zinc-500 mt-0.5">{kicker}</p>
      </div>
      {source && (
        <a
          href={srcHref(source)}
          target="_blank"
          rel="noreferrer"
          className="text-[10.5px] font-mono text-zinc-600 hover:text-[#ff6600] transition-colors"
        >
          {source} ↗
        </a>
      )}
    </div>
  );
}

export function XAlgorithmExplainer() {
  return (
    <section
      id="how-x-ranks"
      className="scroll-mt-20 rounded-2xl border border-[#272727] bg-[#121212] overflow-hidden shadow-2xl shadow-black/40"
    >
      {/* Header */}
      <div className="relative p-4 sm:p-7 border-b border-[#272727] bg-[radial-gradient(120%_120%_at_0%_0%,#2a1606_0%,#121212_55%)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff6600]/70 to-transparent" />
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <span className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#ff6600]">
              The For You algorithm, decoded
            </span>
            <h2 className="heading-4 text-white">How X decides who sees your posts</h2>
            <p className="text-sm sm:text-[15px] text-zinc-400 leading-relaxed">
              X has published the source code behind its For You feed. We read it so you don&apos;t
              have to. Every figure on this page comes straight from that code and links to the file
              it came from.
            </p>
          </div>
          <a
            href={REPO}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-2 self-start rounded-xl border border-[#313131] bg-[#0a0a0a]/80 px-3 py-2 text-xs font-mono text-zinc-200 hover:border-[#ff6600]/60 hover:text-white transition-colors shrink-0"
          >
            <GithubLogo size={15} weight="bold" />
            <span>xai-org/x-algorithm</span>
            <ArrowSquareOut size={12} weight="bold" className="text-zinc-500 group-hover:text-[#ff6600]" />
          </a>
        </div>

        {/* Key numbers */}
        <dl className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
          {KEY_NUMBERS.map((k) => (
            <div key={k.value} className="rounded-xl border border-[#2a2a2a] bg-[#0c0c0c]/80 p-2.5 sm:p-3.5">
              <dt className="sr-only">{k.label}</dt>
              <dd className={`text-lg sm:text-2xl font-semibold font-mono tabular-nums ${k.tone}`}>{k.value}</dd>
              <dd className="mt-0.5 text-[11px] sm:text-xs text-zinc-500 leading-snug">{k.label}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-[10.5px] font-mono text-zinc-600">
          Apache 2.0 · Figures verified against the repository on {VERIFIED_ON}
        </p>
      </div>

      <div className="p-4 sm:p-7 space-y-7 sm:space-y-9">
        {/* 01 Pipeline */}
        <div>
          <SectionHeading index="01" title="The pipeline" kicker="What happens every time you open For You." />
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <li
                  key={s.title}
                  className="group relative flex flex-col rounded-xl border border-[#272727] bg-[#0e0e0e] p-3.5 transition-colors hover:border-[#ff6600]/40"
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#ff6600]/30 bg-[#ff6600]/10 text-[#ff6600]">
                      <Icon size={15} weight="bold" />
                    </span>
                    <span className="text-sm font-semibold text-white">{s.title}</span>
                    <span className="ml-auto text-[10px] font-mono text-zinc-600">0{i + 1}</span>
                  </div>
                  <p className="text-[13px] text-zinc-400 leading-relaxed flex-1">{s.body}</p>
                  <a
                    href={srcHref(s.file)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2.5 inline-block text-[10.5px] font-mono text-zinc-600 hover:text-[#ff6600] transition-colors break-all"
                  >
                    {s.file}
                  </a>
                </li>
              );
            })}
          </ol>
          <p className="mt-3 text-[13px] text-zinc-400 leading-relaxed">
            Three adjustments follow the score. Repeat posts from the same author are progressively
            discounted, posts from accounts you don&apos;t follow are discounted, and authors with few
            impressions receive a <span className="text-white">new-author boost</span>.
          </p>
        </div>

        {/* 02 Weights */}
        <div>
          <SectionHeading
            index="02"
            title="The scoring weights"
            kicker="How much each predicted action moves a post up or down."
            source="home-mixer/params/param.rs"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
            <div className="rounded-xl border border-[#272727] bg-[#0e0e0e] p-3.5 space-y-2.5">
              <span className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-emerald-400">
                <TrendUp size={13} weight="bold" /> When a viewer is likely to…
              </span>
              {POSITIVE.map((r) => (
                <div key={r.label} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1">
                  <span className="text-[13px] text-zinc-200">
                    {r.label}
                    {r.note && <span className="ml-1.5 text-[11px] text-zinc-500">({r.note})</span>}
                  </span>
                  <span className="text-[12px] font-mono text-emerald-400 tabular-nums">+{r.w}</span>
                  <div className="col-span-2 h-1 rounded-full bg-[#1c1c1c] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500/70 to-emerald-300"
                      style={{ width: `${Math.max(2, (r.w / maxPos) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2.5">
              <div className="rounded-xl border border-[#3a1a1a] bg-[#110a0a] p-3.5 space-y-2.5">
                <span className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-red-400">
                  <TrendDown size={13} weight="bold" /> When a viewer is likely to…
                </span>
                {NEGATIVE.map((r) => (
                  <div key={r.label} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1">
                    <span className="text-[13px] text-zinc-200">{r.label}</span>
                    <span className="text-[12px] font-mono text-red-400 tabular-nums">{r.w}</span>
                    <div className="col-span-2 h-1 rounded-full bg-[#231313] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-red-500/70 to-red-300"
                        style={{ width: `${(Math.abs(r.w) / maxNeg) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-[#272727] bg-[#0e0e0e] p-3.5">
                <p className="text-[12px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                  How to read these numbers
                </p>
                <p className="text-[13px] text-zinc-400 leading-relaxed">
                  Each weight multiplies the <span className="text-zinc-100">predicted likelihood</span>{" "}
                  of an action, not a running tally. They don&apos;t mean one report cancels 330
                  likes. They mean a post people are likely to report drops fast.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 03 Labels */}
        <div>
          <SectionHeading
            index="03"
            title="Labels that limit reach"
            kicker="Applied separately from ranking. A high score can't override them."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {LABELS.map((l) => (
              <div key={l.name} className="rounded-xl border border-[#272727] bg-[#0e0e0e] p-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <code className="text-[13px] font-mono font-semibold text-[#ff6600]">{l.name}</code>
                  <span className="rounded-md border border-[#313131] bg-[#171717] px-1.5 py-0.5 text-[10.5px] font-mono text-zinc-400">
                    {l.scope}
                  </span>
                </div>
                <p className="mt-1.5 text-[13px] text-zinc-400 leading-relaxed">{l.body}</p>
                <a
                  href={srcHref(l.file)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-[10.5px] font-mono text-zinc-600 hover:text-[#ff6600] transition-colors break-all"
                >
                  {l.file}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Takeaways */}
        <div className="relative overflow-hidden rounded-xl border border-[#ff6600]/30 bg-gradient-to-br from-[#1d1107] to-[#0e0e0e] p-4 sm:p-5">
          <span className="text-[10.5px] font-mono tracking-[0.18em] text-[#ff6600]">THE PLAYBOOK</span>
          <h3 className="text-base sm:text-lg font-semibold text-white mb-3">What this means for your posts</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2.5">
            {TAKEAWAYS.map(([lead, rest]) => (
              <li key={lead} className="flex gap-2.5 text-[13px] leading-relaxed">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff6600]" />
                <span className="text-zinc-400">
                  <span className="font-semibold text-zinc-100">{lead}</span> {rest}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
