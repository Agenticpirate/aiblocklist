"use client";

import { useState } from "react";
import Link from "next/link";
import {
  X,
  MagnifyingGlass,
  ShieldCheck,
  WarningCircle,
  ArrowSquareOut,
  Scales,
  CheckCircle,
  ArrowRight,
  ShieldWarning,
  Key,
} from "@phosphor-icons/react";
import { AccountPayload, API_BASE_URL, fetchApi, formatClassificationLabel } from "@/lib/api";
import { VerifiedTick } from "./VerifiedTick";
import { XLogo, ThreadsLogo } from "./PlatformSlideControl";

interface QuickCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialUsername?: string;
  initialPlatform?: "x" | "threads";
}

export function QuickCheckModal({
  isOpen,
  onClose,
  initialUsername = "",
  initialPlatform = "x",
}: QuickCheckModalProps) {
  const [platform, setPlatform] = useState<"x" | "threads">(initialPlatform);
  const [query, setQuery] = useState(initialUsername);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [record, setRecord] = useState<AccountPayload | null>(null);
  const [searchedUser, setSearchedUser] = useState("");

  if (!isOpen) return null;

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = query.trim().replace(/^@/, "");
    if (!clean) return;

    setLoading(true);
    setHasSearched(false);
    setSearchedUser(clean);

    try {
      const res = await fetch(`${API_BASE_URL}/accounts/${platform}/${encodeURIComponent(clean)}`);
      if (res.ok) {
        const data = (await res.json()) as AccountPayload;
        setRecord(data);
      } else {
        setRecord(null);
      }
    } catch {
      setRecord(null);
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  };

  const levelsioCheckUrl = `https://blockedforaireply.com/#all`;
  const xSuspensionAppealUrl = `https://help.x.com/en/managing-your-account/suspended-x-accounts`;
  const xLockedAccountUrl = `https://help.x.com/en/managing-your-account/locked-or-limited-account`;
  const metaStatusAppealUrl = `https://help.instagram.com/contact/606967319425038`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-check-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-xl rounded-2xl border border-[#313131] bg-[#121212] p-5 sm:p-6 shadow-2xl space-y-5 my-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-[#272727] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ff6600]/15 border border-[#ff6600]/30 text-[#ff6600]">
              <ShieldCheck size={22} weight="bold" />
            </div>
            <div>
              <h3 id="quick-check-title" className="title-2 text-white font-mono">
                Am I Blocked or Flagged?
              </h3>
              <p className="caption-5 font-mono text-zinc-400 mt-0.5">
                Instant status check across AIBlockList, Pieter Levels&apos; list &amp; platform appeals
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#272727] transition-colors"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleCheck} className="space-y-3 font-mono">
          <div className="flex items-center gap-2">
            <span className="caption-5 text-zinc-500 uppercase">Platform:</span>
            <div className="flex items-center gap-1.5 rounded-lg border border-[#272727] bg-[#181818] p-1">
              <button
                type="button"
                onClick={() => setPlatform("x")}
                className={`caption-5 inline-flex items-center gap-1 rounded-md px-2.5 py-1 transition-colors ${
                  platform === "x"
                    ? "bg-[#ff6600] text-black font-bold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <XLogo className="w-3 h-3" />
                <span>X (Twitter)</span>
              </button>
              <button
                type="button"
                onClick={() => setPlatform("threads")}
                className={`caption-5 inline-flex items-center gap-1 rounded-md px-2.5 py-1 transition-colors ${
                  platform === "threads"
                    ? "bg-[#ff6600] text-black font-bold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <ThreadsLogo className="w-3 h-3" />
                <span>Threads</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">@</span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter handle (e.g. Cocothe_gb or your username)"
                className="w-full rounded-xl border border-[#313131] bg-[#181818] py-2.5 pl-8 pr-3 text-sm text-white placeholder-zinc-500 focus:border-[#ff6600] focus:outline-none focus:ring-1 focus:ring-[#ff6600]"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="button-sm inline-flex items-center gap-1.5 rounded-xl bg-[#ff6600] px-4 py-2.5 font-bold text-black hover:bg-[#e55c00] active:scale-[0.98] transition-all disabled:opacity-50 shrink-0"
            >
              <MagnifyingGlass size={16} weight="bold" />
              <span>{loading ? "Checking..." : "Check"}</span>
            </button>
          </div>
        </form>

        {/* RESULTS SECTION */}
        {hasSearched && (
          <div className="space-y-4 font-mono animate-in fade-in duration-200">
            {record ? (
              /* CASE 1: ACCOUNT IS LISTED */
              <div className="rounded-xl border border-[#ff6600]/40 bg-[#161208] p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <ShieldWarning size={20} weight="bold" className="text-[#ff6600] shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="title-3 text-white">@{record.account.username}</span>
                        <VerifiedTick type={record.account.verified_badge || "blue"} size={16} />
                      </div>
                      <span className="caption-5 uppercase rounded bg-[#272727] px-1.5 py-0.5 text-[#ff6600] mt-0.5 inline-block">
                        {formatClassificationLabel(record.account.classification)}
                      </span>
                    </div>
                  </div>
                  <span className="caption-5 rounded border border-[#ff6600]/30 bg-[#ff6600]/10 px-2 py-0.5 text-[#ff6600] font-bold">
                    Listed on AIBlockList
                  </span>
                </div>

                <p className="caption-4 text-zinc-300">
                  {record.account.public_rationale ||
                    "Account exhibits observable repetitive automated replies or engagement loops."}{" "}
                  ({record.account.evidence_count} canonical evidence post(s)).
                </p>

                {/* 1-Click Fast Free Appeal */}
                <div className="border-t border-[#31230c] pt-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[11px] text-zinc-400">
                    Are you the human owner? Appeals are 100% free with 48h SLA.
                  </div>
                  <Link
                    href={`/appeals?username=${encodeURIComponent(
                      record.account.username
                    )}&platform=${encodeURIComponent(record.account.platform)}`}
                    onClick={onClose}
                    className="button-sm inline-flex items-center gap-1.5 rounded-lg bg-[#ff6600] px-3.5 py-2 text-xs font-bold text-black hover:bg-[#e55c00] transition-colors"
                  >
                    <Key size={14} weight="bold" />
                    <span>⚡ Start Fast Bio Appeal</span>
                    <ArrowRight size={12} weight="bold" />
                  </Link>
                </div>
              </div>
            ) : (
              /* CASE 2: ACCOUNT IS VERIFIED CLEAR ON AIBLOCKLIST */
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-4 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle size={22} weight="bold" className="shrink-0" />
                  <div>
                    <h4 className="title-3 text-white">
                      @{searchedUser} is Clear on AIBlockList
                    </h4>
                    <p className="caption-5 text-emerald-400 font-bold">
                      Zero automated spam or bot flags detected in our registry.
                    </p>
                  </div>
                </div>
                <p className="caption-4 text-zinc-300">
                  This handle is not in the AIBlockList registry. Third-party extensions and tools
                  subscribing to AIBlockList are not filtering your posts or replies.
                </p>
              </div>
            )}

            {/* UPSTREAM & PLATFORM UNBLOCK / APPEAL DIRECTORY */}
            <div className="rounded-xl border border-[#272727] bg-[#181818] p-4 space-y-3">
              <span className="caption-4 uppercase font-bold text-zinc-300 block">
                Still blocked or restricted elsewhere? Quick Unblock Guide:
              </span>

              <div className="space-y-2 text-xs">
                {/* 1. Pieter Levels Upstream List */}
                <div className="flex items-center justify-between gap-2 rounded-lg border border-[#222] bg-[#121212] p-2.5">
                  <div>
                    <p className="font-bold text-zinc-200">
                      Blocked by Pieter Levels (@levelsio) on 𝕏?
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      Check your handle on Pieter&apos;s independent upstream blocklist at
                      blockedforaireply.com to request unblocking.
                    </p>
                  </div>
                  <a
                    href={levelsioCheckUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="button-xsm inline-flex items-center gap-1 rounded-md border border-[#313131] bg-[#1f1f1f] px-2.5 py-1 text-zinc-300 hover:border-[#ff6600] hover:text-[#ff6600] transition-colors shrink-0"
                  >
                    <span>blockedforaireply.com</span>
                    <ArrowSquareOut size={11} weight="bold" />
                  </a>
                </div>

                {/* 2. Platform Account Suspension / Lock */}
                {platform === "x" ? (
                  <div className="flex items-center justify-between gap-2 rounded-lg border border-[#222] bg-[#121212] p-2.5">
                    <div>
                      <p className="font-bold text-zinc-200">
                        Suspended or Locked by 𝕏 Directly?
                      </p>
                      <p className="text-[11px] text-zinc-400">
                        Platform bans are issued directly by X algorithms. Submit an official appeal to
                        restore your account.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-1.5 shrink-0">
                      <a
                        href={xSuspensionAppealUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="button-xsm inline-flex items-center gap-1 rounded-md border border-[#313131] bg-[#1f1f1f] px-2.5 py-1 text-zinc-300 hover:border-[#ff6600] hover:text-[#ff6600] transition-colors"
                      >
                        <span>X Appeal</span>
                        <ArrowSquareOut size={11} weight="bold" />
                      </a>
                      <a
                        href={xLockedAccountUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="button-xsm inline-flex items-center gap-1 rounded-md border border-[#313131] bg-[#1f1f1f] px-2.5 py-1 text-zinc-300 hover:border-[#ff6600] hover:text-[#ff6600] transition-colors"
                      >
                        <span>Unlock</span>
                        <ArrowSquareOut size={11} weight="bold" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2 rounded-lg border border-[#222] bg-[#121212] p-2.5">
                    <div>
                      <p className="font-bold text-zinc-200">
                        Restricted or Hidden on Threads / Meta?
                      </p>
                      <p className="text-[11px] text-zinc-400">
                        Submit a direct appeal via Meta Account Status &amp; Integrity operations.
                      </p>
                    </div>
                    <a
                      href={metaStatusAppealUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="button-xsm inline-flex items-center gap-1 rounded-md border border-[#313131] bg-[#1f1f1f] px-2.5 py-1 text-zinc-300 hover:border-[#ff6600] hover:text-[#ff6600] transition-colors shrink-0"
                    >
                      <span>Meta Appeal</span>
                      <ArrowSquareOut size={11} weight="bold" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* First time prompt before search */}
        {!hasSearched && (
          <div className="rounded-xl border border-[#272727] bg-[#181818] p-4 space-y-2.5 font-mono text-xs">
            <span className="caption-5 uppercase font-bold text-zinc-400">What this checks:</span>
            <ul className="space-y-1.5 text-zinc-400">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ff6600]" />
                <span>Whether your handle is indexed in AIBlockList&apos;s automated spam registry</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ff6600]" />
                <span>Fast-track 60-second appeal token if you were flagged by mistake</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ff6600]" />
                <span>Direct unblock links for Pieter Levels&apos; blockedforaireply.com and platform appeals</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}