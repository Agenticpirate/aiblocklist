"use client";

import {
  Database,
  LinkSimple,
  Prohibit,
  ShieldCheck,
  CheckCircle,
} from "@phosphor-icons/react";
import { PlatformSlideControl, XLogo, ThreadsLogo } from "./PlatformSlideControl";

interface PremiumStatCardsProps {
  totalIndexed: number;
  meetingTwoUrls: number;
  activePlatform: string;
  onPlatformChange: (platform: string) => void;
}

export function PremiumStatCards({
  totalIndexed,
  meetingTwoUrls,
  activePlatform,
  onPlatformChange,
}: PremiumStatCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 font-mono">
      {/* CARD 1: INDEXED ACCOUNTS */}
      <div className="group relative overflow-hidden rounded-2xl border border-[#272727] bg-gradient-to-b from-[#1c1c1c] to-[#121212] p-5 shadow-lg transition-all duration-300 hover:border-[#383838]">
        <div className="flex items-center justify-between text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ff6600] animate-pulse" />
            <span className="caption-5 uppercase tracking-wider text-zinc-400">
              Indexed Accounts
            </span>
          </div>
          <Database size={16} weight="bold" className="text-zinc-500 group-hover:text-zinc-300 transition-colors" />
        </div>

        <p className="heading-3 text-white mt-3 font-mono tracking-tight">
          {totalIndexed.toLocaleString()}
        </p>

        <p className="caption-5 text-zinc-500 mt-2 flex items-center gap-1.5">
          <CheckCircle size={12} weight="bold" className="text-zinc-400" />
          <span>Multi-source isolated registry</span>
        </p>
      </div>

      {/* CARD 2: ≥ 2 EVIDENCE URLS */}
      <div className="group relative overflow-hidden rounded-2xl border border-[#272727] bg-gradient-to-b from-[#1c1c1c] to-[#121212] p-5 shadow-lg transition-all duration-300 hover:border-[#ff6600]/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ff6600]" />
            <span className="caption-5 uppercase tracking-wider text-zinc-400">
              ≥ 2 Evidence URLs
            </span>
          </div>
          <LinkSimple size={16} weight="bold" className="text-[#ff6600]" />
        </div>

        <p className="heading-3 text-[#ff6600] mt-3 font-mono tracking-tight">
          {meetingTwoUrls.toLocaleString()}
        </p>

        <p className="caption-5 text-zinc-500 mt-2 flex items-center gap-1.5">
          <CheckCircle size={12} weight="bold" className="text-[#ff6600]" />
          <span>Publication threshold met</span>
        </p>
      </div>

      {/* CARD 3: SUPPORTED PLATFORMS (INTERACTIVE SLIDING TOGGLE WITH ORIGINAL LOGOS) */}
      <div className="group relative overflow-hidden rounded-2xl border border-[#2e2e2e] bg-gradient-to-b from-[#202020] to-[#141414] p-5 shadow-xl transition-all duration-300 hover:border-[#ff6600]/50 ring-1 ring-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ff6600]" />
            <span className="caption-5 uppercase tracking-wider text-zinc-300 font-bold">
              Supported Platforms
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-zinc-400">
            <XLogo className="w-3.5 h-3.5 text-white" />
            <span className="text-[11px] text-zinc-500 font-mono">&amp;</span>
            <ThreadsLogo className="w-3.5 h-3.5 text-white" />
          </div>
        </div>

        {/* The interactive sliding control */}
        <div className="mt-3">
          <PlatformSlideControl
            activePlatform={activePlatform}
            onChange={onPlatformChange}
            size="sm"
          />
        </div>

        <p className="caption-5 text-zinc-400 mt-2.5 flex items-center gap-1.5 truncate">
          <span className="text-zinc-500">Filtered:</span>
          <span className="text-[#ff6600] font-bold uppercase">
            {activePlatform === "all" ? "X & Threads (All)" : activePlatform === "x" ? "X (Twitter)" : "Threads"}
          </span>
        </p>
      </div>

      {/* CARD 4: AI TEXT DETECTORS */}
      <div className="group relative overflow-hidden rounded-2xl border border-[#272727] bg-gradient-to-b from-[#1c1c1c] to-[#121212] p-5 shadow-lg transition-all duration-300 hover:border-emerald-500/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="caption-5 uppercase tracking-wider text-zinc-400">
              AI Text Detectors
            </span>
          </div>
          <Prohibit size={16} weight="bold" className="text-emerald-400" />
        </div>

        <p className="heading-3 text-white mt-3 font-mono tracking-tight flex items-center gap-2">
          <span>Zero</span>
          <span className="caption-4 rounded border border-emerald-500/40 bg-emerald-950/40 px-2 py-0.5 text-emerald-400 font-normal">
            Banned
          </span>
        </p>

        <p className="caption-5 text-zinc-500 mt-2 flex items-center gap-1.5">
          <ShieldCheck size={12} weight="bold" className="text-emerald-400" />
          <span>Zero ESL authorship bias</span>
        </p>
      </div>
    </div>
  );
}
