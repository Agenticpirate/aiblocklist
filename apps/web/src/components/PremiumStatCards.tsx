"use client";

import {
  Database,
  LinkSimple,
  Prohibit,
  ShieldCheck,
  CheckCircle,
} from "@phosphor-icons/react";
import { XLogo, ThreadsLogo } from "./PlatformSlideControl";

interface PremiumStatCardsProps {
  totalIndexed: number;
  meetingTwoUrls: number;
  activePlatform?: string;
  onPlatformChange?: (platform: string) => void;
}

export function PremiumStatCards({
  totalIndexed,
  meetingTwoUrls,
}: PremiumStatCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5 font-mono">
      {/* CARD 1: INDEXED ACCOUNTS */}
      <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-[#272727] bg-gradient-to-b from-[#181818] to-[#101010] p-2.5 sm:p-3 shadow-md transition-all duration-300 hover:border-[#383838]">
        <div>
          <div className="flex items-center justify-between text-zinc-400">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff6600] animate-pulse" />
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold truncate">
                Indexed
              </span>
            </div>
            <Database size={14} weight="bold" className="text-zinc-500 group-hover:text-zinc-300 transition-colors shrink-0" />
          </div>

          <p className="text-lg sm:text-2xl font-bold text-white mt-1 tracking-tight">
            {totalIndexed.toLocaleString()}
          </p>
        </div>

        <p className="hidden sm:flex text-[10px] text-zinc-500 mt-1.5 items-center gap-1 truncate">
          <CheckCircle size={11} weight="bold" className="text-zinc-400 shrink-0" />
          <span className="truncate">Multi-source isolated registry</span>
        </p>
      </div>

      {/* CARD 2: ≥ 2 EVIDENCE URLS */}
      <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-[#272727] bg-gradient-to-b from-[#181818] to-[#101010] p-2.5 sm:p-3 shadow-md transition-all duration-300 hover:border-[#ff6600]/40">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff6600]" />
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold truncate">
                ≥ 2 Proofs
              </span>
            </div>
            <LinkSimple size={14} weight="bold" className="text-[#ff6600] shrink-0" />
          </div>

          <p className="text-lg sm:text-2xl font-bold text-[#ff6600] mt-1 tracking-tight">
            {meetingTwoUrls.toLocaleString()}
          </p>
        </div>

        <p className="hidden sm:flex text-[10px] text-zinc-500 mt-1.5 items-center gap-1 truncate">
          <CheckCircle size={11} weight="bold" className="text-[#ff6600] shrink-0" />
          <span className="truncate">Publication threshold met</span>
        </p>
      </div>

      {/* CARD 3: SUPPORTED PLATFORMS */}
      <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-[#272727] bg-gradient-to-b from-[#181818] to-[#101010] p-2.5 sm:p-3 shadow-md transition-all duration-300 hover:border-[#383838]">
        <div>
          <div className="flex items-center justify-between text-zinc-400">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff6600]" />
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold truncate">
                Platforms
              </span>
            </div>
            <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded border border-[#313131] bg-[#1a1a1a] text-zinc-400 shrink-0">
              Active
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="inline-flex items-center justify-center rounded-lg border border-[#313131] bg-[#141414] px-2 py-1 shadow-inner transition-colors group-hover:border-[#444444]">
              <XLogo className="w-3.5 h-3.5 text-white" shiny />
            </div>

            <span className="text-zinc-600 font-mono text-[11px]">&amp;</span>

            <div className="inline-flex items-center gap-1 rounded-lg border border-[#313131] bg-[#141414] px-2 py-1 shadow-inner transition-colors group-hover:border-[#444444]">
              <ThreadsLogo className="w-3.5 h-3.5 text-white" shiny />
              <span className="text-[11px] sm:text-xs font-bold text-white font-mono">Threads</span>
            </div>
          </div>
        </div>

        <p className="hidden sm:flex text-[10px] text-zinc-500 mt-1.5 items-center gap-1 truncate">
          <CheckCircle size={11} weight="bold" className="text-[#ff6600] shrink-0" />
          <span className="truncate">Cross-platform intelligence</span>
        </p>
      </div>

      {/* CARD 4: AI TEXT DETECTORS */}
      <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-[#272727] bg-gradient-to-b from-[#181818] to-[#101010] p-2.5 sm:p-3 shadow-md transition-all duration-300 hover:border-emerald-500/40">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold truncate">
                AI Detectors
              </span>
            </div>
            <Prohibit size={14} weight="bold" className="text-emerald-400 shrink-0" />
          </div>

          <p className="text-lg sm:text-2xl font-bold text-white mt-1 tracking-tight flex items-center gap-1.5">
            <span>Zero</span>
            <span className="text-[10px] rounded border border-emerald-500/40 bg-emerald-950/40 px-1.5 py-0.5 text-emerald-400 font-normal">
              Banned
            </span>
          </p>
        </div>

        <p className="hidden sm:flex text-[10px] text-zinc-500 mt-1.5 items-center gap-1 truncate">
          <ShieldCheck size={11} weight="bold" className="text-emerald-400 shrink-0" />
          <span className="truncate">Zero ESL authorship bias</span>
        </p>
      </div>
    </div>
  );
}
