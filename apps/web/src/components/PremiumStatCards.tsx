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
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4 font-mono">
      {/* CARD 1: INDEXED ACCOUNTS */}
      <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-[#272727] bg-gradient-to-b from-[#181818] to-[#101010] p-3.5 sm:p-4 shadow-md transition-all duration-300 hover:border-[#383838]">
        <div>
          <div className="flex items-center justify-between text-zinc-400">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ff6600] animate-pulse" />
              <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold">
                Indexed Accounts
              </span>
            </div>
            <Database size={15} weight="bold" className="text-zinc-500 group-hover:text-zinc-300 transition-colors" />
          </div>

          <p className="text-2xl sm:text-[28px] font-bold text-white mt-1.5 tracking-tight">
            {totalIndexed.toLocaleString()}
          </p>
        </div>

        <p className="text-[11px] text-zinc-500 mt-2.5 flex items-center gap-1.5 truncate">
          <CheckCircle size={12} weight="bold" className="text-zinc-400 shrink-0" />
          <span className="truncate">Multi-source isolated registry</span>
        </p>
      </div>

      {/* CARD 2: ≥ 2 EVIDENCE URLS */}
      <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-[#272727] bg-gradient-to-b from-[#181818] to-[#101010] p-3.5 sm:p-4 shadow-md transition-all duration-300 hover:border-[#ff6600]/40">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ff6600]" />
              <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold">
                ≥ 2 Evidence URLs
              </span>
            </div>
            <LinkSimple size={15} weight="bold" className="text-[#ff6600]" />
          </div>

          <p className="text-2xl sm:text-[28px] font-bold text-[#ff6600] mt-1.5 tracking-tight">
            {meetingTwoUrls.toLocaleString()}
          </p>
        </div>

        <p className="text-[11px] text-zinc-500 mt-2.5 flex items-center gap-1.5 truncate">
          <CheckCircle size={12} weight="bold" className="text-[#ff6600] shrink-0" />
          <span className="truncate">Publication threshold met</span>
        </p>
      </div>

      {/* CARD 3: SUPPORTED PLATFORMS (CLEAN KPI WITH SHINY BRAND MARKS) */}
      <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-[#272727] bg-gradient-to-b from-[#181818] to-[#101010] p-3.5 sm:p-4 shadow-md transition-all duration-300 hover:border-[#383838]">
        <div>
          <div className="flex items-center justify-between text-zinc-400">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ff6600]" />
              <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold">
                Supported Platforms
              </span>
            </div>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border border-[#313131] bg-[#1a1a1a] text-zinc-400">
              Active
            </span>
          </div>

          <div className="flex items-center gap-2 mt-2.5">
            {/* Just the X logo - clean and unmistakable */}
            <div className="inline-flex items-center justify-center rounded-lg border border-[#313131] bg-[#141414] px-2.5 py-1.5 shadow-inner transition-colors group-hover:border-[#444444]">
              <XLogo className="w-4 h-4 text-white" shiny />
            </div>

            <span className="text-zinc-600 font-mono text-xs">&amp;</span>

            {/* Official Meta Threads logo with brand name */}
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-[#313131] bg-[#141414] px-2.5 py-1.5 shadow-inner transition-colors group-hover:border-[#444444]">
              <ThreadsLogo className="w-4 h-4 text-white" shiny />
              <span className="text-xs sm:text-sm font-bold text-white font-mono">Threads</span>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-zinc-500 mt-2.5 flex items-center gap-1.5 truncate">
          <CheckCircle size={12} weight="bold" className="text-[#ff6600] shrink-0" />
          <span className="truncate">Cross-platform intelligence</span>
        </p>
      </div>

      {/* CARD 4: AI TEXT DETECTORS */}
      <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-[#272727] bg-gradient-to-b from-[#181818] to-[#101010] p-3.5 sm:p-4 shadow-md transition-all duration-300 hover:border-emerald-500/40">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold">
                AI Text Detectors
              </span>
            </div>
            <Prohibit size={15} weight="bold" className="text-emerald-400" />
          </div>

          <p className="text-2xl sm:text-[28px] font-bold text-white mt-1.5 tracking-tight flex items-center gap-2">
            <span>Zero</span>
            <span className="text-[10px] rounded border border-emerald-500/40 bg-emerald-950/40 px-1.5 py-0.5 text-emerald-400 font-normal">
              Banned
            </span>
          </p>
        </div>

        <p className="text-[11px] text-zinc-500 mt-2.5 flex items-center gap-1.5 truncate">
          <ShieldCheck size={12} weight="bold" className="text-emerald-400 shrink-0" />
          <span className="truncate">Zero ESL authorship bias</span>
        </p>
      </div>
    </div>
  );
}
