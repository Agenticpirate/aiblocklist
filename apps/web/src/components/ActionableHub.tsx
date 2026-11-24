"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
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
} from "@phosphor-icons/react";
import {
  AccountPayload,
  API_BASE_URL,
  BlocklistResponse,
  fetchApi,
  formatClassificationLabel,
  formatVerificationLabel,
} from "@/lib/api";
import { PlatformSlideControl } from "./PlatformSlideControl";
import { PremiumStatCards } from "./PremiumStatCards";

interface ActionableHubProps {
  initialTotal: number;
  totalIndexed?: number;
  meetingTwoUrls?: number;
}

export function ActionableHub({
  initialTotal,
  totalIndexed = 3621,
  meetingTwoUrls = 754,
}: ActionableHubProps) {
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [evidenceFilter, setEvidenceFilter] = useState<string>("all");

  const [items, setItems] = useState<AccountPayload[]>([]);
  const [totalMatching, setTotalMatching] = useState<number>(initialTotal);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Quick Inspector Modal State
  const [inspectingAccount, setInspectingAccount] = useState<AccountPayload | null>(null);

  const loadPage = useCallback(
    async (cursorVal: string | null, append: boolean) => {
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
        params.set("limit", "24");
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
    [submittedSearch, platformFilter, categoryFilter, sourceFilter, evidenceFilter]
  );

  useEffect(() => {
    loadPage(null, false);
  }, [loadPage]);

  return (
    <div className="space-y-6">
      {/* Premium Interactive Stat KPI Cards with Live Platform Sliding Control */}
      <PremiumStatCards
        totalIndexed={totalIndexed}
        meetingTwoUrls={meetingTwoUrls}
        activePlatform={platformFilter}
        onPlatformChange={setPlatformFilter}
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
              size="md"
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

      {/* Live Directory Grid */}
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const a = item.account;
            return (
              <div
                key={a.id}
                className="group flex flex-col justify-between rounded-2xl border border-[#272727] bg-[#181818] p-5 transition-all duration-300 hover:border-[#313131] hover:bg-[#1c1c1c]"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="caption-5 rounded border border-[#313131] bg-[#000000] px-1.5 py-0.5 font-mono uppercase text-zinc-400">
                          {a.platform}
                        </span>
                        <Link
                          href={`/accounts/${a.platform}/${encodeURIComponent(a.username)}`}
                          className="title-3 font-mono text-white truncate hover:text-[#ff6600] transition-colors"
                        >
                          @{a.username}
                        </Link>
                      </div>
                      <p className="caption-5 font-mono text-zinc-500 truncate mt-1">
                        ID: {a.platform_account_id || "unassigned"}
                      </p>
                    </div>

                    <span className="caption-5 shrink-0 rounded border border-[#ff6600]/40 bg-[#131209] px-2 py-0.5 font-mono text-[#ff6600]">
                      {formatVerificationLabel(a.verification_status)}
                    </span>
                  </div>

                  <div className="mt-3.5 flex flex-wrap gap-1.5">
                    <span className="caption-5 rounded bg-[#272727] px-2 py-0.5 text-zinc-200">
                      {formatClassificationLabel(a.classification)}
                    </span>
                    {a.has_source_conflict && (
                      <span className="caption-5 rounded border border-[#ff6600]/40 bg-[#131209] px-2 py-0.5 text-[#ff6600]">
                        Conflict
                      </span>
                    )}
                  </div>

                  {a.public_rationale && (
                    <p className="body-6 mt-3 text-zinc-400 line-clamp-2">
                      {a.public_rationale}
                    </p>
                  )}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-[#272727] pt-3 caption-5 font-mono text-zinc-400">
                  <span className="inline-flex items-center gap-1">
                    <LinkSimple size={13} weight="bold" />
                    <span>
                      {a.evidence_count} {a.evidence_count === 1 ? "URL" : "URLs"}
                    </span>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setInspectingAccount(item)}
                      className="button-xsm inline-flex items-center gap-1 text-zinc-300 hover:text-[#ff6600] transition-colors"
                    >
                      <Eye size={12} weight="bold" />
                      <span>Inspect</span>
                    </button>

                    <Link
                      href={`/accounts/${a.platform}/${encodeURIComponent(a.username)}`}
                      className="button-xsm inline-flex items-center gap-1 text-[#ff6600] hover:text-white transition-colors"
                    >
                      <span>Dossier</span>
                      <ArrowRight size={12} weight="bold" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Load More Button */}
      {nextCursor && !loading && (
        <div className="pt-4 text-center">
          <button
            type="button"
            disabled={loadingMore}
            onClick={() => loadPage(nextCursor, true)}
            className="button-md inline-flex items-center gap-2 rounded-xl border border-[#313131] bg-[#181818] px-5 py-2.5 text-white hover:bg-[#272727] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <span>{loadingMore ? "Loading more records..." : "Load more accounts"}</span>
            <ArrowRight size={14} weight="bold" />
          </button>
        </div>
      )}

      {/* Quick Inspector Modal / Drawer */}
      {inspectingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#272727] bg-[#181818] p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between gap-3 border-b border-[#272727] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="caption-4 rounded border border-[#313131] bg-[#000000] px-2 py-0.5 font-mono uppercase text-zinc-400">
                    {inspectingAccount.account.platform}
                  </span>
                  <h3 className="heading-4 font-mono text-white">
                    @{inspectingAccount.account.username}
                  </h3>
                </div>
                <p className="caption-5 font-mono text-zinc-500 mt-1">
                  Platform ID: {inspectingAccount.account.platform_account_id || "unassigned"} · Policy:{" "}
                  {inspectingAccount.account.policy_version}
                </p>
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
                <span className="caption-4 font-mono uppercase text-zinc-400 block mb-2">
                  Behavioral Evidence URLs ({inspectingAccount.evidence.length})
                </span>
                {inspectingAccount.evidence.length === 0 ? (
                  <p className="body-6 text-zinc-500">
                    Zero public evidence URLs attached upstream. Account is quarantined as unverified.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {inspectingAccount.evidence.map((ev) => (
                      <li
                        key={ev.platform_post_id}
                        className="rounded-lg border border-[#272727] bg-[#1f1f1f] p-3 text-left"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <a
                            href={ev.public_post_url}
                            target="_blank"
                            rel="noreferrer"
                            className="caption-4 inline-flex items-center gap-1 font-mono text-zinc-200 hover:text-[#ff6600] truncate"
                          >
                            <LinkSimple size={14} weight="bold" />
                            <span className="truncate">{ev.public_post_url}</span>
                          </a>
                          <span className="caption-5 font-mono text-zinc-500 shrink-0">
                            {ev.signal_type}
                          </span>
                        </div>
                        <p className="caption-5 mt-1 font-mono text-zinc-500 truncate">
                          sha256: {ev.content_hash_sha256.slice(0, 24)}...
                        </p>
                      </li>
                    ))}
                  </ul>
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
              <a
                href={inspectingAccount.account.public_profile_url}
                target="_blank"
                rel="noreferrer"
                className="button-sm inline-flex items-center gap-1 text-zinc-400 hover:text-white"
              >
                <span>View on {inspectingAccount.account.platform.toUpperCase()}</span>
                <ArrowUpRight size={13} weight="bold" />
              </a>

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
    </div>
  );
}
