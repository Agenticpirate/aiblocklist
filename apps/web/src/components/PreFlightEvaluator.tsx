"use client";

import { useState } from "react";
import {
  Sparkle,
  ShieldCheck,
  ShieldWarning,
  WarningCircle,
  CheckCircle,
  Lightbulb,
  ArrowRight,
  ArrowsClockwise,
  SlidersHorizontal,
  Info,
} from "@phosphor-icons/react";

interface EvaluationResult {
  score: number; // 0 - 100
  rating: "high_value" | "borderline" | "high_risk";
  signals: {
    noveltyScore: number;
    templateRisk: number;
    deboostingRisk: number;
    humanSubstance: number;
  };
  detectedPatterns: string[];
  tips: string[];
}

const COMMON_BOT_CLICHES = [
  "great point",
  "totally agree",
  "spot on",
  "in today's fast paced world",
  "couldn't agree more",
  "thanks for sharing",
  "game changer",
  "this is huge",
  "check out my",
  "link in bio",
  "follow me for more",
  "dm me for",
  "crypto",
  "100x",
  "love this perspective",
  "such an insightful take",
  "absolutely essential",
  "underrated post",
];

export function PreFlightEvaluator() {
  const [draftReply, setDraftReply] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);

  const handleEvaluate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftReply.trim()) return;

    setAnalyzing(true);

    setTimeout(() => {
      const text = draftReply.toLowerCase();
      const wordCount = draftReply.trim().split(/\s+/).length;

      const detected: string[] = [];
      let templatePenalty = 0;

      for (const phrase of COMMON_BOT_CLICHES) {
        if (text.includes(phrase)) {
          detected.push(`Stock phrase: “${phrase}”`);
          templatePenalty += 20;
        }
      }

      // Length heuristics
      let lengthScore = 50;
      if (wordCount < 6) {
        detected.push("Very short reply (reads as a generic reaction)");
        templatePenalty += 25;
        lengthScore = 20;
      } else if (wordCount >= 15 && wordCount <= 80) {
        lengthScore = 90;
      } else if (wordCount > 100) {
        lengthScore = 75;
      }

      // Punctuation / Emoji heuristics
      const emojiMatches = draftReply.match(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu) || [];
      if (emojiMatches.length > 4) {
        detected.push("Lots of emoji (a common pattern in spam replies)");
        templatePenalty += 15;
      }

      // Check for question mark or substantive dialogue engagement
      const hasQuestion = draftReply.includes("?");
      const hasDataOrNumbers = /\d+/.test(draftReply);

      let noveltyScore = Math.max(10, Math.min(100, 100 - templatePenalty));
      let deboostingRisk = Math.min(95, Math.max(5, templatePenalty + (wordCount < 8 ? 30 : 0)));
      let humanSubstance = Math.min(100, Math.max(10, lengthScore + (hasQuestion ? 15 : 0) + (hasDataOrNumbers ? 15 : 0) - templatePenalty));

      const overallScore = Math.round((noveltyScore * 0.4) + (humanSubstance * 0.4) + ((100 - deboostingRisk) * 0.2));

      const tips: string[] = [];
      if (detected.length > 0) {
        tips.push("Cut the opener (“Great point!”, “Love this!”) and lead with your actual point.");
      }
      if (!hasQuestion) {
        tips.push("Ask a specific question to invite a real conversation.");
      }
      if (wordCount < 10) {
        tips.push("Add an anecdote, concrete example, or technical detail so it says something new.");
      }
      if (tips.length === 0) {
        tips.push("Good reply: specific and conversational. Replies that start real conversations are what X’s ranking rewards.");
      }

      const rating: "high_value" | "borderline" | "high_risk" =
        overallScore >= 75 ? "high_value" : overallScore >= 45 ? "borderline" : "high_risk";

      setResult({
        score: overallScore,
        rating,
        signals: {
          noveltyScore,
          templateRisk: Math.min(100, templatePenalty),
          deboostingRisk,
          humanSubstance,
        },
        detectedPatterns: detected,
        tips,
      });
      setAnalyzing(false);
    }, 450);
  };

  return (
    <div className="rounded-2xl border border-[#272727] bg-[#141414] p-4 sm:p-7 space-y-4 sm:space-y-5 font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#272727] pb-4">
        <div>
          <span className="caption-4 uppercase text-[#ff6600] font-bold flex items-center gap-1.5">
            <Sparkle size={15} weight="bold" />
            <span>Reply check</span>
          </span>
          <h3 className="title-2 font-sans text-white mt-1">Test a reply before you post it</h3>
          <p className="caption-4 text-zinc-400 mt-1 font-sans">
            A quick check that runs entirely in your browser. It flags the patterns X’s ranking pushes down, such as generic one-liners. It’s a heuristic, not X’s model.
          </p>
        </div>
        <span className="caption-5 uppercase whitespace-nowrap rounded-md border border-[#313131] bg-[#1a1a1a] px-2 py-1 text-zinc-400 self-start sm:self-center shrink-0">
          Runs locally
        </span>
      </div>

      <form onSubmit={handleEvaluate} className="space-y-4">
        <div>
          <label htmlFor="draft-reply" className="caption-4 block text-zinc-300 font-bold mb-2">
            Your draft
          </label>
          <textarea
            id="draft-reply"
            rows={4}
            value={draftReply}
            onChange={(e) => setDraftReply(e.target.value)}
            placeholder="e.g. In our distributed Postgres setup, we encountered the same write lock issue. What worked was partitioning by tenant_id before scaling replicas..."
            className="w-full rounded-xl border border-[#313131] bg-[#0c0c0c] p-3 text-sm text-white placeholder-zinc-500 focus:border-[#ff6600] focus:outline-none focus:ring-1 focus:ring-[#ff6600] leading-relaxed font-sans"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="text-xs text-zinc-500 font-sans">
            Looks for stock phrases, very short replies, emoji overload and missing substance.
          </div>

          <button
            type="submit"
            disabled={analyzing || !draftReply.trim()}
            className="button-md inline-flex items-center justify-center gap-2 rounded-xl bg-[#ff6600] px-5 py-2.5 text-xs font-bold text-black hover:bg-[#e55c00] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-[#ff6600]/20 shrink-0"
          >
            {analyzing ? (
              <>
                <ArrowsClockwise size={14} weight="bold" className="animate-spin" />
                <span>Checking…</span>
              </>
            ) : (
              <>
                <Sparkle size={14} weight="bold" />
                <span>Check reply</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* RESULTS DISPLAY */}
      {result && (
        <div className="border-t border-[#272727] pt-6 space-y-4 sm:space-y-6 animate-in fade-in duration-300">
          {/* Main Quality Gauge Banner */}
          <div
            className={`rounded-xl border p-5 ${
              result.rating === "high_value"
                ? "border-emerald-500/40 bg-gradient-to-r from-[#0d2216] to-[#121212]"
                : result.rating === "borderline"
                ? "border-amber-500/40 bg-gradient-to-r from-[#201c0b] to-[#121212]"
                : "border-[#ff6600]/50 bg-gradient-to-r from-[#20150b] to-[#121212]"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="caption-5 uppercase font-bold tracking-wider text-zinc-400">
                  Reply quality
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <h4 className="title-2 text-white">
                    {result.rating === "high_value"
                      ? "Strong reply"
                      : result.rating === "borderline"
                      ? "Borderline: could be ranked low"
                      : "Looks like low-effort spam"}
                  </h4>
                  {result.rating === "high_value" ? (
                    <CheckCircle size={20} weight="bold" className="text-emerald-400 shrink-0" />
                  ) : (
                    <WarningCircle size={20} weight="bold" className="text-[#ff6600] shrink-0" />
                  )}
                </div>
                <p className="caption-4 text-zinc-300 font-sans mt-1">
                  {result.rating === "high_value"
                    ? "Specific, relevant and adds something to the conversation."
                    : result.rating === "borderline"
                    ? "It may rank low if it reads like a stock reaction. Add something specific."
                    : "Reads like the generic replies X’s reply scorer and spam rules are built to push down."}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-3xl font-extrabold text-white">
                  {result.score}
                  <span className="text-sm font-normal text-zinc-400">/100</span>
                </span>
              </div>
            </div>
          </div>

          {/* 4 Diagnostic Gauges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="rounded-xl border border-[#272727] bg-[#181818] p-3.5 space-y-1">
              <span className="caption-5 uppercase text-zinc-400">Substance</span>
              <p className="title-4 text-white">{result.signals.humanSubstance}%</p>
              <div className="h-1.5 w-full rounded-full bg-[#272727] overflow-hidden">
                <div
                  className="h-full bg-emerald-400 transition-all duration-500"
                  style={{ width: `${result.signals.humanSubstance}%` }}
                />
              </div>
            </div>

            <div className="rounded-xl border border-[#272727] bg-[#181818] p-3.5 space-y-1">
              <span className="caption-5 uppercase text-zinc-400">Stock-phrase risk</span>
              <p className="title-4 text-white">{result.signals.templateRisk}%</p>
              <div className="h-1.5 w-full rounded-full bg-[#272727] overflow-hidden">
                <div
                  className="h-full bg-[#ff6600] transition-all duration-500"
                  style={{ width: `${result.signals.templateRisk}%` }}
                />
              </div>
            </div>

            <div className="rounded-xl border border-[#272727] bg-[#181818] p-3.5 space-y-1">
              <span className="caption-5 uppercase text-zinc-400">Spam-pattern risk</span>
              <p className="title-4 text-white">{result.signals.deboostingRisk}%</p>
              <div className="h-1.5 w-full rounded-full bg-[#272727] overflow-hidden">
                <div
                  className="h-full bg-[#ff6600] transition-all duration-500"
                  style={{ width: `${result.signals.deboostingRisk}%` }}
                />
              </div>
            </div>

            <div className="rounded-xl border border-[#272727] bg-[#181818] p-3.5 space-y-1">
              <span className="caption-5 uppercase text-zinc-400">Verdict</span>
              <p className="title-4 text-white">
                {result.signals.deboostingRisk < 35 ? "Looks fine" : "Rework it"}
              </p>
              <div className="h-1.5 w-full rounded-full bg-[#272727] overflow-hidden">
                <div
                  className="h-full bg-emerald-400 transition-all duration-500"
                  style={{ width: `${Math.max(10, 100 - result.signals.deboostingRisk)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Actionable Advice & Suggestions */}
          <div className="rounded-xl border border-[#272727] bg-[#101010] p-4 space-y-3 font-sans text-xs">
            <div className="flex items-center gap-2 text-[#ff6600] font-mono">
              <Lightbulb size={16} weight="bold" />
              <span className="font-bold uppercase tracking-wider text-[11px]">
                How to improve it
              </span>
            </div>

            <ul className="space-y-2 text-zinc-300">
              {result.tips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#ff6600] font-bold font-mono">→</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>

            {result.detectedPatterns.length > 0 && (
              <div className="border-t border-[#222] pt-2.5 mt-2 space-y-1 text-zinc-400 font-mono text-[11px]">
                <span className="text-zinc-500 uppercase block text-[10px]">What it caught</span>
                {result.detectedPatterns.map((pat, idx) => (
                  <p key={idx} className="text-[#ff6600]/90">· {pat}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}