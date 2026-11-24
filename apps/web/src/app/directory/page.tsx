"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  MagnifyingGlass,
  ArrowRight,
  WarningCircle,
  LinkSimple,
  Funnel,
  DownloadSimple,
} from "@phosphor-icons/react";
import {
  AccountPayload,
  BlocklistResponse,
  CLIENT_API_BASE_URL,
  fetchApi,
  formatClassificationLabel,
  formatVerificationLabel,
} from "@/lib/api";
import { UserAvatar } from "@/components/UserAvatar";
import { VerifiedTick } from "@/components/VerifiedTick";
import { XLogo, ThreadsLogo } from "@/components/PlatformSlideControl";

export default function DirectoryPage() {
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [evidenceFilter, setEvidenceFilter] = useState<string>("all");
  const [items, setItems] = useState<AccountPayload[]>([]);
  const [totalMatching, setTotalMatching] = useState<number>(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
        if (platformFilter !== "all") {
          params.set("platform", platformFilter);
        }
        params.set("limit", "24");
        if (submittedSearch.trim()) params.set("q", submittedSearch.trim());
        if (sourceFilter !== "all") params.set("source", sourceFilter);
        if (evidenceFilter === "with") params.set("has_evidence", "true");
        if (evidenceFilter === "silent") params.set("has_evidence", "false");
        if (cursorVal) params.set("cursor", cursorVal);

        const data = await fetchApi<BlocklistResponse>(`/blocklists?${params.toString()}`);
        setTotalMatching(data.total_matching);
        setNextCursor(data.next_cursor);
        setItems((prev) => (append ? [...prev, ...data.items] : data.items));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load directory records.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [submittedSearch, platformFilter, sourceFilter, evidenceFilter]
  );

  useEffect(() => {
    loadPage(null, false);
  }, [loadPage]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-[680px]">
        <p className="caption-3 font-mono uppercase text-[#ff6600] mb-2">
          Public intelligence directory
        </p>
        <h1 className="heading-2 text-white">Inspect indexed accounts</h1>
        <p className="body-3 mt-3 text-zinc-400">
          Search by handle or immutable numeric X ID. External upstream entries stay clearly
          labeled as external unverified assertions and never merge silently into core verified records.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="mt-8 rounded-2xl border border-[#272727] bg-[#181818] p-4">
        {/* Platform Tabs & Filter Bar */}
        <div className="mb-3 flex items-center gap-2">
          <span className="caption-4 font-mono text-zinc-400 mr-1">Platform:</span>
          {(["all", "x", "threads"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPlatformFilter(p)}
              className={`caption-3 rounded-lg px-3 py-1 font-mono uppercase transition-colors duration-300 ${
                platformFilter === p
                  ? "bg-[#ff6600] text-black font-bold"
                  : "border border-[#272727] bg-[#181818] text-zinc-400 hover:text-white"
              }`}
            >
              {p === "all" ? "All platforms" : p}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSubmittedSearch(search);
          }}
          className="grid grid-cols-1 gap-3 md:grid-cols-12"
        >
          <div className="relative md:col-span-6">
            <MagnifyingGlass
              size={16}
              weight="bold"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search handle (e.g. Cocothe_gb) or numeric X ID"
              className="body-5 w-full rounded-lg border border-[#272727] bg-[#000000] py-2 pl-9 pr-3 font-mono text-white placeholder:text-zinc-500 focus:border-[#ff6600] focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <select
              aria-label="Filter by source"
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="body-5 w-full rounded-lg border border-[#272727] bg-[#000000] px-3 py-2 text-zinc-200 focus:border-[#ff6600] focus:outline-none"
            >
              <option value="all">All sources</option>
              <option value="aiblocklist_core">Core verified</option>
              <option value="blockedforaireply">Community Upstream</option>
              <option value="clankwall">Clankwall</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              aria-label="Filter by evidence coverage"
              value={evidenceFilter}
              onChange={(e) => setEvidenceFilter(e.target.value)}
              className="body-5 w-full rounded-lg border border-[#272727] bg-[#000000] px-3 py-2 text-zinc-200 focus:border-[#ff6600] focus:outline-none"
            >
              <option value="all">All evidence</option>
              <option value="with">Has public URLs</option>
              <option value="silent">Silent (0 URLs)</option>
            </select>
          </div>

          <button
            type="submit"
            className="button-sm md:col-span-2 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#ff6600] px-3 py-2 text-black hover:bg-[#e55c00] active:scale-[0.98] transition-all duration-300"
          >
            <Funnel size={14} weight="bold" />
            <span>Apply</span>
          </button>
        </form>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#272727] pt-3 caption-5 font-mono text-zinc-400">
          <div className="flex items-center gap-3">
            <span className="text-white font-bold">{totalMatching.toLocaleString()} matching accounts</span>
            <span>· Showing {items.length.toLocaleString()} loaded</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-zinc-500">Export:</span>
            <a
              href={`${CLIENT_API_BASE_URL}/blocklists/export?platform=${platformFilter}&format=csv`}
              download
              className="button-xsm inline-flex items-center gap-1 rounded-md border border-[#313131] bg-[#1f1f1f] px-2.5 py-1 text-zinc-300 hover:border-[#ff6600] hover:text-[#ff6600] transition-colors"
            >
              <DownloadSimple size={12} weight="bold" />
              <span>CSV</span>
            </a>
            <a
              href={`${CLIENT_API_BASE_URL}/blocklists/export?platform=${platformFilter}&format=json`}
              download
              className="button-xsm inline-flex items-center gap-1 rounded-md border border-[#313131] bg-[#1f1f1f] px-2.5 py-1 text-zinc-300 hover:border-[#ff6600] hover:text-[#ff6600] transition-colors"
            >
              <DownloadSimple size={12} weight="bold" />
              <span>JSON</span>
            </a>
            <a
              href={`${CLIENT_API_BASE_URL}/blocklists/export?platform=${platformFilter}&format=txt`}
              download
              className="button-xsm inline-flex items-center gap-1 rounded-md border border-[#313131] bg-[#1f1f1f] px-2.5 py-1 text-zinc-300 hover:border-[#ff6600] hover:text-[#ff6600] transition-colors"
            >
              <DownloadSimple size={12} weight="bold" />
              <span>Handles (.txt)</span>
            </a>
          </div>
        </div>
      </div>

      {/* Results Area */}
      <div className="mt-6">
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
                <p className="title-3 text-white">Failed to query directory</p>
                <p className="body-6 mt-1 text-zinc-400">{error}</p>
              </div>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-[#272727] bg-[#181818] p-10 text-center">
            <p className="title-2 text-white">No indexed records match this filter</p>
            <p className="body-6 mx-auto mt-2 max-w-md text-zinc-400">
              A missing result never implies that an account is legitimate or abusive. Clear your
              search or switch the source filter to explore the full dataset.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSubmittedSearch("");
                setSourceFilter("all");
                setEvidenceFilter("all");
              }}
              className="button-sm mt-5 rounded-lg border border-[#313131] bg-[#1f1f1f] px-3 py-2 text-white hover:bg-[#272727]"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => {
                const a = item.account;
                return (
                  <Link
                    key={a.id}
                    href={`/accounts/${a.platform}/${encodeURIComponent(a.username)}`}
                    className="group flex flex-col justify-between rounded-xl border border-[#262626] bg-[#0c0c0c] hover:bg-[#121212] hover:border-[#383838] p-3.5 transition-all duration-200"
                  >
                    <div>
                      {/* Author Header */}
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
                              <p className="font-bold text-white text-[14px] truncate group-hover:text-[#ff6600] transition-colors">
                                @{a.username}
                              </p>
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

                          {/* Row 2: Metadata - ID & Date on the SAME line */}
                          <div className="flex items-center justify-between gap-1.5 mt-1 text-[11px] font-mono text-zinc-400 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 min-w-0 truncate">
                              <span className="text-zinc-500">ID:</span>
                              <span className="text-zinc-300 font-mono select-all truncate">{a.platform_account_id || "unassigned"}</span>
                            </div>

                            <span className="shrink-0 text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#1e1e1e] text-zinc-400 whitespace-nowrap">
                              {formatClassificationLabel(a.classification)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-2.5 flex flex-wrap gap-1">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1e1e1e] text-zinc-300">
                          {formatClassificationLabel(a.classification)}
                        </span>
                        {a.has_source_conflict && (
                          <span className="text-[10px] font-mono rounded border border-[#ff6600]/40 bg-[#131209] px-1.5 py-0.5 text-[#ff6600]">
                            Conflict
                          </span>
                        )}
                        {item.source_assertions.map((sa, idx) => (
                          <span
                            key={`${sa.source_slug}-${idx}`}
                            className="text-[10px] font-mono rounded border border-[#272727] bg-[#000000] px-1.5 py-0.5 text-zinc-400"
                          >
                            {sa.source_slug}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-[#222222] pt-2 text-[11px] font-mono text-zinc-400">
                      <span className="inline-flex items-center gap-1">
                        <LinkSimple size={12} weight="bold" />
                        <span>
                          {a.evidence_count} {a.evidence_count === 1 ? "URL" : "URLs"}
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-zinc-400 group-hover:text-white transition-colors">
                        <span>Inspect</span>
                        <ArrowRight size={11} weight="bold" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {nextCursor && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  disabled={loadingMore}
                  onClick={() => loadPage(nextCursor, true)}
                  className="button-md rounded-lg border border-[#313131] bg-[#181818] px-4 py-2 text-white hover:bg-[#272727] disabled:opacity-50 transition-colors duration-300"
                >
                  {loadingMore ? "Loading next page..." : "Load more accounts"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
