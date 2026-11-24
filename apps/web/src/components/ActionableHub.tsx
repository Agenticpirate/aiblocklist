"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  MagnifyingGlass,
  Funnel,
  DownloadSimple,
  ArrowRight,
  WarningCircle,
  CheckCircle,
  LinkSimple,
  ArrowUpRight,
  X,
  Eye,
  SlidersHorizontal,
  ShareNetwork,
  ShieldWarning,
  ChatCircleText,
} from "@phosphor-icons/react";
import {
  AccountPayload,
  API_BASE_URL,
  BlocklistResponse,
  fetchApi,
  formatClassificationLabel,
  formatVerificationLabel,
} from "@/lib/api";
import { PlatformSlideControl, XLogo, ThreadsLogo } from "./PlatformSlideControl";
import { PremiumStatCards } from "./PremiumStatCards";
import { VerifiedTick } from "./VerifiedTick";
import { PlatformReportModal } from "./PlatformReportModal";
import { TweetEvidenceCard } from "./TweetEvidenceCard";
import { UserAvatar } from "./UserAvatar";

interface ActionableHubProps {
  initialTotal: number;
  totalIndexed?: number;
  meetingTwoUrls?: number;
  initialItems?: AccountPayload[];
  initialNextCursor?: string | null;
}

export function ActionableHub({
  initialTotal,
  totalIndexed = 3680,
  meetingTwoUrls = 884,
  initialItems = [],
  initialNextCursor = null,
}: ActionableHubProps) {
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [evidenceFilter, setEvidenceFilter] = useState<string>("all");

  const [items, setItems] = useState<AccountPayload[]>(initialItems);
  const [totalMatching, setTotalMatching] = useState<number>(initialTotal);
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
  const [batchSize, setBatchSize] = useState<number>(24);
  const [loading, setLoading] = useState<boolean>(initialItems.length === 0);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Quick Inspector & Auto-Report Modal States
  const [inspectingAccount, setInspectingAccount] = useState<AccountPayload | null>(null);
  const [reportingAccount, setReportingAccount] = useState<AccountPayload | null>(null);

  const isFirstMount = useRef(true);

  const loadPage = useCallback(
    async (cursorVal: string | null, append: boolean, customLimit?: number) => {
      const limitVal = customLimit || batchSize;
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);
      try {
        const params = new URLSearchParams();
        if (platformFilter !== "all") params.set("platform", platformFilter);
        if (categoryFilter !== "all") params.set("category", categoryFilter);
        if (sourceFilter !== "all") params.set("source", sourceFilter);
        if (evidenceFilter === "with") params.set("has_evidence", "true");
        if (evidenceFilter === "silent") params.set("has_evidence", "false");
        if (submittedSearch.trim()) params.set("q", submittedSearch.trim());
        params.set("limit", String(limitVal));
        if (cursorVal) params.set("cursor", cursorVal);

        const data = await fetchApi<BlocklistResponse>(`/blocklists?${params.toString()}`);
        setTotalMatching(data.total_matching);
        setNextCursor(data.next_cursor);
        setItems((prev) => (append ? [...prev, ...data.items] : data.items));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load intelligence records.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [submittedSearch, platformFilter, categoryFilter, sourceFilter, evidenceFilter, batchSize]
  );

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      if (initialItems.length > 0 && initialNextCursor) {
        return;
      }
    }
    loadPage(null, false);
  }, [loadPage, initialItems.length, initialNextCursor]);

  return (
    <div className="space-y-6">
      {/* Premium Stat KPI Cards */}
      <PremiumStatCards
        totalIndexed={totalIndexed}
        meetingTwoUrls={meetingTwoUrls}
      />

      {/* Search & Filter Command Bar */}
      <div className="rounded-2xl border border-[#272727] bg-[#181818] p-4 sm:p-5 space-y-4">
        {/* Search Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSubmittedSearch(search);
          }}
          className="relative flex items-center"
        >
          <MagnifyingGlass
            size={18}
            weight="bold"
            className="pointer-events-none absolute left-3.5 text-zinc-500"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search accounts by handle (@username) or numeric platform ID..."
            className="body-4 w-full rounded-xl border border-[#272727] bg-[#000000] py-3 pl-11 pr-24 font-mono text-white placeholder:text-zinc-500 focus:border-[#ff6600] focus:outline-none"
          />
          <div className="absolute right-2 flex items-center gap-1">
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSubmittedSearch("");
                }}
                className="p-1 text-zinc-500 hover:text-white"
              >
                <X size={16} weight="bold" />
              </button>
            )}
            <button
              type="submit"
              className="button-sm rounded-lg bg-[#ff6600] px-3 py-1.5 font-bold text-black hover:bg-[#e55c00] transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        {/* Platform Sliding Segmented Control with Official Logos */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <span className="caption-5 font-mono text-zinc-500 uppercase mr-1">Platform:</span>
            <PlatformSlideControl
              activePlatform={platformFilter}
              onChange={setPlatformFilter}
              size="sm"
              className="w-72 sm:w-80"
            />
          </div>

          {/* Export Actions Bar */}
          <div className="flex items-center gap-1.5">
            <span className="caption-5 font-mono text-zinc-500 uppercase mr-1">Export:</span>
            <a
              href={`${API_BASE_URL}/blocklists/export?platform=${platformFilter}&format=csv`}
              download
              className="button-xsm inline-flex items-center gap-1 rounded-md border border-[#313131] bg-[#1f1f1f] px-2.5 py-1 font-mono text-zinc-300 hover:border-[#ff6600] hover:text-[#ff6600] transition-colors"
              title="Download CSV for Twitter/X blocklist import"
            >
              <DownloadSimple size={12} weight="bold" />
              <span>CSV</span>
            </a>
            <a
              href={`${API_BASE_URL}/blocklists/export?platform=${platformFilter}&format=json`}
              download
              className="button-xsm inline-flex items-center gap-1 rounded-md border border-[#313131] bg-[#1f1f1f] px-2.5 py-1 font-mono text-zinc-300 hover:border-[#ff6600] hover:text-[#ff6600] transition-colors"
              title="Export complete JSON payload with metadata"
            >
              <DownloadSimple size={12} weight="bold" />
              <span>JSON</span>
            </a>
            <a
              href={`${API_BASE_URL}/blocklists/export?platform=${platformFilter}&format=txt`}
              download
              className="button-xsm inline-flex items-center gap-1 rounded-md border border-[#313131] bg-[#1f1f1f] px-2.5 py-1 font-mono text-zinc-300 hover:border-[#ff6600] hover:text-[#ff6600] transition-colors"
              title="Export plain text list of @handles"
            >
              <DownloadSimple size={12} weight="bold" />
              <span>Handles (.txt)</span>
            </a>
          </div>
        </div>

        {/* Category & Evidence Secondary Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 border-t border-[#272727] pt-3">
          <span className="caption-5 font-mono text-zinc-500 uppercase mr-1">Filter:</span>
          {[
            { id: "all", label: "All Categories" },
            { id: "confirmed_automated_spam", label: "Confirmed Spam" },
            { id: "repetitive_engagement_farming", label: "Engagement Farming" },
            { id: "coordinated_manipulation", label: "Coordinated" },
            { id: "under_review", label: "Under Review" },
          ].map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategoryFilter(c.id)}
              className={`caption-5 rounded-md px-2.5 py-1 font-mono transition-colors ${
                categoryFilter === c.id
                  ? "border border-[#ff6600] bg-[#131209] text-[#ff6600] font-bold"
                  : "border border-[#272727] bg-[#1f1f1f] text-zinc-400 hover:text-white"
              }`}
            >
              {c.label}
            </button>
          ))}

          <span className="text-zinc-600">|</span>

          {[
            { id: "all", label: "Any Coverage" },
            { id: "with", label: "Has 2+ Public URLs" },
            { id: "silent", label: "Silent (0 URLs)" },
          ].map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => setEvidenceFilter(e.id)}
              className={`caption-5 rounded-md px-2.5 py-1 font-mono transition-colors ${
                evidenceFilter === e.id
                  ? "border border-[#ff6600] bg-[#131209] text-[#ff6600] font-bold"
                  : "border border-[#272727] bg-[#1f1f1f] text-zinc-400 hover:text-white"
              }`}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      {/* Matching Stats & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 caption-4 font-mono text-zinc-400 px-1">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#ff6600]" />
          <span className="text-white font-bold">{totalMatching.toLocaleString()}</span>
          <span>matching intelligence records</span>
          {submittedSearch && (
            <span className="text-zinc-500">for &quot;{submittedSearch}&quot;</span>
          )}
        </div>
        <span>Showing {items.length.toLocaleString()} loaded · Real-time verification</span>
      </div>

      {/* Live Directory Feed / Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 animate-pulse">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-44 rounded-2xl border border-[#272727] bg-[#181818]" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-[#272727] bg-[#181818] p-6">
          <div className="flex items-start gap-3">
            <WarningCircle size={20} weight="bold" className="text-[#ff6600] mt-0.5 shrink-0" />
            <div>
              <p className="title-3 text-white">Failed to query intelligence database</p>
              <p className="body-6 text-zinc-400 mt-1">{error}</p>
            </div>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-[#272727] bg-[#181818] p-8 text-center space-y-3">
          <WarningCircle size={28} weight="bold" className="mx-auto text-[#ff6600]" />
          <h2 className="title-2 text-white">No accounts match current criteria</h2>
          <p className="body-5 text-zinc-400 max-w-md mx-auto">
            Missing records never imply legitimacy or abuse. Try resetting filters or searching a
            different handle or numeric ID.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setSubmittedSearch("");
              setPlatformFilter("all");
              setCategoryFilter("all");
              setSourceFilter("all");
              setEvidenceFilter("all");
            }}
            className="button-sm rounded-lg border border-[#313131] bg-[#1f1f1f] px-3 py-2 text-white hover:bg-[#272727]"
          >
            Reset all filters
          </button>
        </div>
      ) : (
        <>
          {/* MOBILE STREAM: Clean, flat native Twitter/𝕏 post style */}
          <div className="block sm:hidden divide-y divide-[#222] border-y border-[#222] bg-[#000000] -mx-4">
            {items.map((item) => {
              const a = item.account;
              const quoteText =
                a.primary_quote ||
                item.evidence.find((e) => e.post_text)?.post_text ||
                (item.evidence[0]?.metrics?.post_text as string) ||
                null;
              const firstEv = item.evidence[0];
              const firstEvUrl = firstEv?.public_post_url;

              return (
                <div key={`mob-${a.id}`} className="p-3.5 flex items-start gap-3 hover:bg-[#080808] transition-colors">
                  {/* Real circular avatar with unavatar fallback */}
                  <UserAvatar
                    username={a.username}
                    platformAccountId={a.platform_account_id}
                    platform={a.platform}
                    size="md"
                    className="shrink-0 mt-0.5"
                  />

                  <div className="flex-1 min-w-0">
                    {/* Row 1: @username + Verified blue rosette tick + Platform Logo + Status */}
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Link
                          href={`/accounts/${a.platform}/${encodeURIComponent(a.username)}`}
                          className="font-bold text-white text-[15px] hover:underline truncate"
                        >
                          @{a.username}
                        </Link>
                        <VerifiedTick type={a.verified_badge || "blue"} size={15} />
                        {a.platform === "threads" ? (
                          <ThreadsLogo className="w-3.5 h-3.5 text-zinc-400 shrink-0" shiny />
                        ) : (
                          <XLogo className="w-3.5 h-3.5 text-zinc-400 shrink-0" shiny />
                        )}
                      </div>

                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded border border-[#ff6600]/40 bg-[#ff6600]/10 text-[#ff6600] font-bold shrink-0 whitespace-nowrap">
                        {formatVerificationLabel(a.verification_status)}
                      </span>
                    </div>

                    {/* Row 2: Metadata - ID & Date cleanly aligned on the SAME single line */}
                    <div className="flex items-center justify-between gap-1.5 mt-1 text-[11px] font-mono text-zinc-400 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 min-w-0 truncate">
                        <span className="text-zinc-500">ID:</span>
                        <span className="text-zinc-300 font-mono select-all truncate">{a.platform_account_id || "unassigned"}</span>
                        <span className="text-zinc-600">·</span>
                        <span className="text-zinc-400 shrink-0">{firstEv?.post_date || "Nov 24, 2026"}</span>
                      </div>

                      <span className="shrink-0 text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#1e1e1e] text-zinc-400 whitespace-nowrap">
                        {formatClassificationLabel(a.classification)}
                      </span>
                    </div>

                    {/* Row 3: Quoted tweet reply text */}
                    {quoteText ? (
                      <p className="mt-2 text-zinc-100 text-[13px] leading-relaxed italic select-text">
                        “{quoteText}”
                      </p>
                    ) : a.public_rationale ? (
                      <p className="mt-2 text-zinc-400 text-xs leading-relaxed">
                        {a.public_rationale}
                      </p>
                    ) : null}

                    {/* Row 4: Action bar */}
                    <div className="mt-2.5 flex items-center justify-between text-xs font-mono text-zinc-400 pt-1.5 border-t border-[#1a1a1a]">
                      <div className="flex items-center gap-3">
                        {firstEvUrl ? (
                          <a
                            href={firstEvUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[#ff6600] font-medium hover:underline whitespace-nowrap text-xs"
                          >
                            <XLogo className="w-3 h-3 text-current" />
                            <span>Reply ↗</span>
                          </a>
                        ) : (
                          <a
                            href={`https://x.com/${a.username.replace(/^@/, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-zinc-400 hover:text-white whitespace-nowrap text-xs"
                          >
                            <XLogo className="w-3 h-3 text-current" />
                            <span>Profile ↗</span>
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => setInspectingAccount(item)}
                          className="inline-flex items-center gap-1 text-zinc-400 hover:text-white whitespace-nowrap cursor-pointer text-xs"
                        >
                          <ChatCircleText size={13} weight="bold" className="text-zinc-500" />
                          <span>{a.evidence_count} {a.evidence_count === 1 ? "Tweet" : "Tweets"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setReportingAccount(item)}
                          className="inline-flex items-center gap-1 text-[#ff6600] font-medium hover:underline whitespace-nowrap cursor-pointer text-xs"
                        >
                          <ShieldWarning size={13} weight="bold" />
                          <span>Report</span>
                        </button>
                      </div>

                      <Link
                        href={`/accounts/${a.platform}/${encodeURIComponent(a.username)}`}
                        className="inline-flex items-center gap-1 text-zinc-400 hover:text-white whitespace-nowrap text-xs"
                      >
                        <span>Inspect</span>
                        <ArrowRight size={11} weight="bold" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* TABLET & DESKTOP GRID: Authentic Tweet Card Layout */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {items.map((item) => {
              const a = item.account;
              const quoteText =
                a.primary_quote ||
                item.evidence.find((e) => e.post_text)?.post_text ||
                (item.evidence[0]?.metrics?.post_text as string) ||
                null;
              const firstEv = item.evidence[0];
              const firstEvUrl = firstEv?.public_post_url;

              return (
                <div
                  key={a.id}
                  className="group flex flex-col justify-between rounded-xl border border-[#262626] bg-[#0c0c0c] hover:bg-[#121212] hover:border-[#383838] p-3.5 transition-all duration-200 shadow-sm"
                >
                  <div>
                    {/* Tweet Author & Metadata Header */}
                    <div className="flex items-start gap-3">
                      <UserAvatar
                        username={a.username}
                        platformAccountId={a.platform_account_id}
                        platform={a.platform}
                        size="md"
                        className="shrink-0 mt-0.5"
                      />

                      <div className="flex-1 min-w-0">
                        {/* Row 1: @username + Verified blue rosette tick + Platform Logo + Status */}
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Link
                              href={`/accounts/${a.platform}/${encodeURIComponent(a.username)}`}
                              className="font-bold text-white text-[14px] hover:underline truncate"
                            >
                              @{a.username}
                            </Link>
                            <VerifiedTick type={a.verified_badge || "blue"} size={15} />
                            {a.platform === "threads" ? (
                              <ThreadsLogo className="w-3.5 h-3.5 text-zinc-400 shrink-0" shiny />
                            ) : (
                              <XLogo className="w-3.5 h-3.5 text-zinc-400 shrink-0" shiny />
                            )}
                          </div>

                          <span className="shrink-0 text-[10px] uppercase font-mono px-2 py-0.5 rounded border border-[#ff6600]/40 bg-[#ff6600]/10 text-[#ff6600] font-bold whitespace-nowrap">
                            {formatVerificationLabel(a.verification_status)}
                          </span>
                        </div>

                        {/* Row 2: Metadata - ID & Date cleanly aligned on the SAME single line */}
                        <div className="flex items-center justify-between gap-1.5 mt-1 text-[11px] font-mono text-zinc-400 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 min-w-0 truncate">
                            <span className="text-zinc-500">ID:</span>
                            <span className="text-zinc-300 font-mono select-all truncate">{a.platform_account_id || "unassigned"}</span>
                            <span className="text-zinc-600">·</span>
                            <span className="text-zinc-400 shrink-0">{firstEv?.post_date || "Nov 24, 2026"}</span>
                          </div>

                          <span className="shrink-0 text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#1e1e1e] text-zinc-400 whitespace-nowrap">
                            {formatClassificationLabel(a.classification)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tweet Text (Direct tweet typography, clean & readable) */}
                    <div className="mt-2.5 text-zinc-200 text-xs sm:text-[13px] leading-relaxed font-sans select-text">
                      {quoteText ? (
                        <p className="line-clamp-4 italic text-zinc-100">
                          “{quoteText}”
                        </p>
                      ) : a.public_rationale ? (
                        <p className="line-clamp-3 text-zinc-400">
                          {a.public_rationale}
                        </p>
                      ) : (
                        <p className="text-zinc-500 italic text-[11px]">
                          Observed automated behavioral pattern logged.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Tweet Action Bar (Single slim row, compact & premium) */}
                  <div className="mt-3 pt-2.5 border-t border-[#222222] flex items-center justify-between text-[11px] font-mono text-zinc-400">
                    <div className="flex items-center gap-3">
                      {firstEvUrl ? (
                        <a
                          href={firstEvUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[#ff6600] hover:text-white transition-colors whitespace-nowrap font-medium"
                          title="Open original reply on X"
                        >
                          <XLogo className="w-3 h-3 text-current" />
                          <span>Reply ↗</span>
                        </a>
                      ) : (
                        <a
                          href={`https://x.com/${a.username.replace(/^@/, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-zinc-400 hover:text-white transition-colors whitespace-nowrap"
                        >
                          <XLogo className="w-3 h-3 text-current" />
                          <span>Profile ↗</span>
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => setInspectingAccount(item)}
                        className="inline-flex items-center gap-1 text-zinc-400 hover:text-white transition-colors whitespace-nowrap cursor-pointer"
                        title="Inspect flagged tweets"
                      >
                        <ChatCircleText size={13} weight="bold" className="text-zinc-500 hover:text-[#ff6600]" />
                        <span>{a.evidence_count} {a.evidence_count === 1 ? "Tweet" : "Tweets"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setReportingAccount(item)}
                        className="inline-flex items-center gap-1 text-[#ff6600] hover:text-[#ff8833] transition-colors whitespace-nowrap font-medium cursor-pointer"
                        title="Auto-Report this account"
                      >
                        <ShieldWarning size={13} weight="bold" />
                        <span>Report</span>
                      </button>
                    </div>

                    <Link
                      href={`/accounts/${a.platform}/${encodeURIComponent(a.username)}`}
                      className="inline-flex items-center gap-1 text-zinc-400 hover:text-white transition-colors whitespace-nowrap"
                      title="Inspect full intelligence dossier"
                    >
                      <span>Inspect</span>
                      <ArrowRight size={11} weight="bold" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Comprehensive Pagination & Infinite Browse Command Center */}
      {!loading && items.length > 0 && (
        <div className="mt-8 rounded-2xl border border-[#272727] bg-[#121212] p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#ff6600]" />
              <span className="text-white font-bold">{items.length.toLocaleString()}</span>
              <span>of</span>
              <span className="text-white font-bold">{totalMatching.toLocaleString()}</span>
              <span>indexed accounts loaded</span>
              <span className="text-zinc-500">
                ({Math.min(100, Math.round((items.length / Math.max(1, totalMatching)) * 100))}%)
              </span>
            </div>

            {/* Batch Size Selector */}
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 uppercase text-[10px]">Per Batch:</span>
              {[24, 48, 96].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setBatchSize(size)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all cursor-pointer ${
                    batchSize === size
                      ? "bg-[#ff6600] text-black font-bold"
                      : "border border-[#272727] bg-[#1a1a1a] text-zinc-400 hover:text-white"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#222]">
            <div
              className="h-full bg-gradient-to-r from-[#ff6600] to-[#ffaa44] transition-all duration-300"
              style={{
                width: `${Math.min(100, Math.round((items.length / Math.max(1, totalMatching)) * 100))}%`,
              }}
            />
          </div>

          {/* Pagination Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {nextCursor ? (
              <>
                <button
                  type="button"
                  disabled={loadingMore}
                  onClick={() => loadPage(nextCursor, true)}
                  className="button-sm inline-flex items-center gap-2 rounded-xl bg-[#ff6600] px-5 py-2.5 font-bold text-black hover:bg-[#e55c00] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-[#ff6600]/20"
                >
                  <span>{loadingMore ? "Loading more accounts..." : `Load Next ${batchSize} Accounts`}</span>
                  <ArrowRight size={14} weight="bold" />
                </button>

                <button
                  type="button"
                  disabled={loadingMore}
                  onClick={() => loadPage(nextCursor, true, 48)}
                  className="button-sm inline-flex items-center gap-2 rounded-xl border border-[#333] bg-[#1a1a1a] px-4 py-2.5 font-mono text-xs text-zinc-200 hover:border-[#ff6600] hover:text-[#ff6600] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                  title="Quickly fetch next 48 accounts"
                >
                  <span>+ Load 48 More</span>
                </button>
              </>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-xl border border-[#272727] bg-[#181818] px-4 py-2 font-mono text-xs text-zinc-400">
                <CheckCircle size={15} weight="bold" className="text-[#ff6600]" />
                <span>All {totalMatching.toLocaleString()} accounts matching current filters are loaded</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Inspector Modal / Drawer */}
      {inspectingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#272727] bg-[#181818] p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between gap-3 border-b border-[#272727] pb-4">
              <div className="flex items-center gap-3">
                <UserAvatar
                  username={inspectingAccount.account.username}
                  platformAccountId={inspectingAccount.account.platform_account_id}
                  platform={inspectingAccount.account.platform}
                  size="lg"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="caption-4 rounded border border-[#313131] bg-[#000000] px-2 py-0.5 font-mono uppercase text-zinc-400">
                      {inspectingAccount.account.platform}
                    </span>
                    <h3 className="heading-4 font-mono text-white">
                      @{inspectingAccount.account.username}
                    </h3>
                    <VerifiedTick type={inspectingAccount.account.verified_badge || "blue"} size={18} />
                  </div>
                  <p className="caption-5 font-mono text-zinc-500 mt-1">
                    Platform ID: {inspectingAccount.account.platform_account_id || "unassigned"} · Policy:{" "}
                    {inspectingAccount.account.policy_version}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setInspectingAccount(null)}
                className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-[#272727]"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-[#272727] bg-[#000000] p-4">
                <span className="caption-4 font-mono uppercase text-[#ff6600] block mb-1">
                  Public Behavioral Rationale
                </span>
                <p className="body-5 text-zinc-200">
                  {inspectingAccount.account.public_rationale || "No public rationale assigned."}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="caption-4 font-mono uppercase text-zinc-400">
                    Flagged X Tweets &amp; Evidence ({inspectingAccount.evidence.length})
                  </span>
                  <span className="caption-5 font-mono text-[#ff6600]">
                    Authentic X Thread View
                  </span>
                </div>
                {inspectingAccount.evidence.length === 0 ? (
                  <p className="body-6 text-zinc-500">
                    Zero public evidence URLs attached upstream. Account is quarantined as unverified.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {inspectingAccount.evidence.map((ev) => (
                      <TweetEvidenceCard
                        key={ev.platform_post_id}
                        evidence={ev}
                        username={inspectingAccount.account.username}
                        platform={inspectingAccount.account.platform}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <span className="caption-4 font-mono uppercase text-zinc-400 block mb-2">
                  Source Assertions
                </span>
                <div className="flex flex-wrap gap-2">
                  {inspectingAccount.source_assertions.map((sa, i) => (
                    <span
                      key={i}
                      className="caption-5 rounded-md border border-[#272727] bg-[#000000] px-2.5 py-1 font-mono text-zinc-300"
                    >
                      {sa.source_name}: {sa.classification}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#272727] pt-4">
              <div className="flex items-center gap-2">
                <a
                  href={inspectingAccount.account.public_profile_url}
                  target="_blank"
                  rel="noreferrer"
                  className="button-sm inline-flex items-center gap-1 text-zinc-400 hover:text-white"
                >
                  <span>View on {inspectingAccount.account.platform.toUpperCase()}</span>
                  <ArrowUpRight size={13} weight="bold" />
                </a>

                <button
                  type="button"
                  onClick={() => {
                    const target = inspectingAccount;
                    setInspectingAccount(null);
                    setReportingAccount(target);
                  }}
                  className="button-sm inline-flex items-center gap-1.5 rounded-lg border border-[#ff6600]/40 bg-[#ff6600]/15 px-3 py-1.5 font-bold font-mono text-[#ff6600] hover:bg-[#ff6600] hover:text-black transition-all cursor-pointer"
                >
                  <ShieldWarning size={14} weight="bold" />
                  <span>Auto-Report</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/appeals?username=${encodeURIComponent(
                    inspectingAccount.account.username
                  )}&platform=${encodeURIComponent(inspectingAccount.account.platform)}`}
                  className="button-sm rounded-lg border border-[#313131] bg-[#1f1f1f] px-3 py-1.5 text-zinc-200 hover:bg-[#272727]"
                >
                  File Appeal
                </Link>

                <Link
                  href={`/accounts/${inspectingAccount.account.platform}/${encodeURIComponent(
                    inspectingAccount.account.username
                  )}`}
                  className="button-sm rounded-lg bg-[#ff6600] px-3 py-1.5 font-bold text-black hover:bg-[#e55c00]"
                >
                  Full Dossier
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1-Click Automated Platform Report Assistant Modal */}
      {reportingAccount && (
        <PlatformReportModal
          account={reportingAccount}
          onClose={() => setReportingAccount(null)}
        />
      )}
    </div>
  );
}
