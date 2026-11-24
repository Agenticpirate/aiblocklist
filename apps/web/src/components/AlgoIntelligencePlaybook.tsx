"use client";

import { useState } from "react";
import {
  Lightning,
  CheckCircle,
  WarningCircle,
  Prohibit,
  TrendUp,
  Cpu,
  Clock,
  ChatCircleDots,
  LinkSimple,
  ShareNetwork,
  Eye,
  Heart,
  ArrowsClockwise,
} from "@phosphor-icons/react";
import { XLogo } from "./PlatformSlideControl";

export function AlgoIntelligencePlaybook() {
  const [activeTab, setActiveTab] = useState<"overview" | "scores" | "dos" | "donts">("overview");

  const ALGO_SCORES = [
    { action: "Reply between Mutuals", points: "+20.0 pts", icon: ChatCircleDots, color: "text-[#ff6600]", note: "Highest conversation boost. Follow back people who regularly talk to you." },
    { action: "Copy Link Share", points: "+20.0 pts", icon: LinkSimple, color: "text-[#ff6600]", note: "Viral indicator score (restored to 20 pts in latest algo commit)." },
    { action: "DM Share", points: "+5.0 pts", icon: ShareNetwork, color: "text-emerald-400", note: "Direct private recommendation signals high substantive value." },
    { action: "Standard Reply", points: "+5.0 pts", icon: ChatCircleDots, color: "text-emerald-400", note: "Conversational pull on the original post." },
    { action: "Post Converts into a Follow", points: "+4.0 pts", icon: TrendUp, color: "text-emerald-400", note: "High author affinity signal." },
    { action: "10+ Seconds Dwell Reading Time", points: "+0.385 pts", icon: Clock, color: "text-sky-400", note: "Taps turning into genuine reading time pay out higher than in Oct." },
    { action: "Like", points: "+0.708 pts", icon: Heart, color: "text-sky-400", note: "Highest weight tracked for individual positive reaction." },
    { action: "Off-Topic / 'Not Interested' Click", points: "-53.07 pts", icon: Prohibit, color: "text-red-500", note: "Massive reach killer. Drifting off your core niche triggers this." },
  ];

  const WHAT_TO_DO = [
    "Read the whole post before replying, then say something only you would say.",
    "When a post tags you by name, answer as fast as you like — 𝕏 automatic labels skip tagged replies.",
    "A reply between mutuals scores 20 points, so actively follow back genuine peers who talk to you.",
    "Write posts people want to pass along; a copied link is worth 20 points again.",
    "A DM share is worth 5 points, equivalent to a full public reply.",
    "Likes sit at 0.708 points, the highest baseline weight in recent months.",
    "Time spent on your post pays: a tap turning into 10+ seconds of reading adds 0.385 points.",
    "Posts people read to the end are how strangers find you in For You.",
    "Below 50K followers, 𝕏 tests fresh originals ~16 posts down in feed for a 2-hour or 200-view trial window.",
    "Whichever new post collects likes first gets the viral slot — post while your followers are awake.",
    "Like #1 and Like #32 each unlock a new recommendation expansion cluster to strangers.",
    "In the same feed, one strong, high-substance post crushes multiple average ones.",
    "Video needs to run past 10 seconds to enter 𝕏's automated video recommendation lists.",
    "Hook people in the first 3 seconds of a video; simply clicking open scores 0 points.",
    "A post 𝕏 predicts will earn you a new follower gets a 4.0 point multiplier.",
    "Reread your pinned post from the perspective of an absolute stranger.",
  ];

  const WHAT_NOT_TO_DO = [
    "Firing off replies in seconds under posts that never tagged you — triggers 'fast reply spam' 30-day silent shadowban.",
    "Copy-paste or AI text detector responses under big accounts — 𝕏's internal 'llm slop' detector silences them.",
    "Asking people to copy your link — triggers the dedicated 'copy link bait' spam check.",
    "Building your growth plan on copy link alone (weight fluctuated 20 → 0 → 20 in 5 days).",
    "One identical reply copied under multiple posts — once labeled, it will not notify people who don't follow you.",
    "Tagging non-followers in photos of spam-labeled posts — they never get notified.",
    "Chasing empty taps (worth only 0.274 points).",
    "Drifting off your topic — a predicted 'not interested' action costs a catastrophic -53.07 points.",
    "Posting at 3 AM — your 2-hour algorithmic trial push burns out while your target audience sleeps.",
    "Counting on basic replies and reposts to find new people — For You algorithm excludes raw reposts.",
    "Calling people names or toxicity — hides the post from everyone except existing followers.",
    "Adult content or NSFW spikes — 3 flagged posts out of your last 5 labels your entire account globally.",
    "Thinking a video is cleared forever — 𝕏 re-evaluates safety at 64 likes and again at 512 likes.",
    "Pinning a link to a poorly rated or blacklisted site — the suppression penalty can last 7 days.",
    "Reposting your old text word for word — the copypasta check penalizes identical text even if you own it.",
    "Begging for likes or replies — nobody gets an exemption from engagement farming penalties.",
    "Dumping several posts at once — they cannibalize each other for the same feed impression slots.",
    "Wall of hashtags — not a single one of the 30 algorithm scoring functions considers hashtags.",
    "Treating bookmarks as reach boosters — 𝕏's recommendation scoring matrix leaves bookmarks out.",
    "Waiting on a post from 3 days ago — For You feed halts recommendation distribution after 48 hours.",
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-[#ff6600]/40 bg-gradient-to-b from-[#1c140e] to-[#0f0a07] p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#ff6600]/40 bg-[#261305] px-3 py-1 text-xs font-mono text-[#ff6600]">
              <Lightning size={14} weight="fill" className="animate-pulse" />
              <span>𝕏 Open-Source Algorithm Intelligence Update</span>
            </div>
            <h2 className="heading-3 text-white">The &quot;Fast Reply Spam&quot; &amp; Reach Survival Guide</h2>
            <p className="body-4 text-zinc-300 font-sans leading-relaxed">
              𝕏&apos;s open-source recommendation repository updated its automated spam labeling engine. Small accounts firing off replies in seconds under posts that didn&apos;t tag them are receiving a <strong>30-day silent notification suppression</strong>. Here is the verified breakdown and scoring matrix.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="caption-5 font-mono px-2.5 py-1 rounded-md border border-[#333] bg-[#1a1a1a] text-zinc-400">
              Source: x/algorithm
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-t border-[#331c0e] mt-6 pt-4 overflow-x-auto">
          {[
            { id: "overview", label: "Breaking Update: Fast Reply Label" },
            { id: "scores", label: "Algorithm Scoring Matrix" },
            { id: "dos", label: "16 Things You Should Do" },
            { id: "donts", label: "20 Things You Must Avoid" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`button-xsm rounded-lg px-3 py-1.5 font-mono text-xs whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#ff6600] text-black font-bold"
                  : "border border-[#333] bg-[#121212] text-zinc-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-[#272727] bg-[#141414] p-5 space-y-2">
              <span className="text-[11px] font-mono uppercase text-[#ff6600] font-bold block">
                1. The Label &amp; Penalty
              </span>
              <h3 className="title-3 text-white">30-Day Silent Penalty</h3>
              <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                The <em>&quot;fast reply spam&quot;</em> label attaches to the specific reply for <strong>30 days</strong>. The recipient receives zero notification (even if they follow you), and the reply is completely purged from &quot;For You&quot;.
              </p>
            </div>

            <div className="rounded-xl border border-[#272727] bg-[#141414] p-5 space-y-2">
              <span className="text-[11px] font-mono uppercase text-[#ff6600] font-bold block">
                2. Who It Impacts
              </span>
              <h3 className="title-3 text-white">Targeted at Small Accounts</h3>
              <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                Accounts above a secret follower threshold and high historical trust scores bypass this check. <strong>Small and growing accounts bear the brunt</strong> of false-positive spam suppression.
              </p>
            </div>

            <div className="rounded-xl border border-[#272727] bg-[#141414] p-5 space-y-2">
              <span className="text-[11px] font-mono uppercase text-[#ff6600] font-bold block">
                3. The New Exemption
              </span>
              <h3 className="title-3 text-white">Posts That Tagged You</h3>
              <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                Before applying the label, 𝕏&apos;s code now parses the root post. If that post explicitly typed your @handle, <strong>all automated spam labels (&quot;llm slop&quot; included) are skipped</strong>.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-[#272727] bg-[#111] p-4 text-xs font-mono text-zinc-300 space-y-1.5">
            <span className="text-[#ff6600] font-bold uppercase text-[11px] block">
              Core Algorithmic Takeaway:
            </span>
            <p className="font-sans text-sm text-zinc-200">
              Never fire off generic, 3-second replies (&quot;great post!&quot;, &quot;interesting perspective!&quot;) under viral accounts. Take at least 20–30 seconds to read the post and write a genuine, contextual reply.
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Algorithm Scoring Matrix */}
      {activeTab === "scores" && (
        <div className="rounded-2xl border border-[#272727] bg-[#141414] p-5 space-y-4">
          <div>
            <h3 className="title-2 text-white">Official 𝕏 Algorithm Score Multipliers</h3>
            <p className="caption-4 text-zinc-400 mt-0.5">
              Extracted directly from 𝕏&apos;s open-source Heavy Ranker scoring parameters.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ALGO_SCORES.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.action}
                  className="rounded-xl border border-[#272727] bg-[#0c0c0c] p-4 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Icon size={16} weight="bold" className={s.color} />
                      <span className="text-xs font-bold text-white font-mono">{s.action}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-sans leading-snug">{s.note}</p>
                  </div>
                  <span className={`text-xs font-mono font-bold shrink-0 ${s.color}`}>
                    {s.points}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: What to do */}
      {activeTab === "dos" && (
        <div className="rounded-2xl border border-[#272727] bg-[#141414] p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase font-bold">
            <CheckCircle size={17} weight="bold" />
            <span>16 High-Return Algorithmic Tactics</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {WHAT_TO_DO.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 rounded-xl border border-[#272727] bg-[#0d0d0d] p-3 text-xs"
              >
                <span className="font-mono text-[#ff6600] font-bold text-[11px] shrink-0 mt-0.5">
                  #{i + 1}
                </span>
                <p className="text-zinc-300 font-sans leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: What NOT to do */}
      {activeTab === "donts" && (
        <div className="rounded-2xl border border-red-950/40 bg-[#160c0c] p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 text-red-400 font-mono text-xs uppercase font-bold">
            <Prohibit size={17} weight="bold" />
            <span>20 Dangerous Algorithmic Penalties to Avoid</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {WHAT_NOT_TO_DO.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 rounded-xl border border-[#331111] bg-[#100707] p-3 text-xs"
              >
                <span className="font-mono text-red-400 font-bold text-[11px] shrink-0 mt-0.5">
                  ✕
                </span>
                <p className="text-zinc-300 font-sans leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
