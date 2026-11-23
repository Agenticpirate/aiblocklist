"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  MagnifyingGlass,
  Code,
  Eye,
  WarningCircle,
  CheckCircle,
  LinkSimple,
  ArrowUpRight,
} from "@phosphor-icons/react";
import {
  AccountPayload,
  fetchApi,
  formatClassificationLabel,
  formatVerificationLabel,
} from "@/lib/api";

const SAMPLE_HANDLES = [
  { platform: "x", handle: "Cocothe_gb" },
  { platform: "threads", handle: "threads_growth_spammer" },
  { platform: "x", handle: "proxy_vector" },
  { platform: "threads", handle: "echo_syndicate_threads" },
];

export function HeroInspector() {
  const [platform, setPlatform] = useState<"x" | "threads">("x");
  const [query, setQuery] = useState("Cocothe_gb");
  const [viewMode, setViewMode] = useState<"inspector" | "json">("inspector");
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<AccountPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function lookup(handleOrId: string, targetPlatform = platform) {
    const cleaned = handleOrId.trim().replace(/^@/, "");
    if (!cleaned) return;
    setLoading(true);
    setError(null);
    try {
      const isNumeric = /^\d{5,25}$/.test(cleaned);
      const endpoint = isNumeric
        ? `/accounts/id/${targetPlatform}/${encodeURIComponent(cleaned)}`
        : `/accounts/${targetPlatform}/${encodeURIComponent(cleaned)}`;
      const data = await fetchApi<AccountPayload>(endpoint);
      setRecord(data);
    } catch (err) {
      setRecord(null);
      setError(
        err instanceof Error
          ? err.message
          : "Account is not indexed. Missing records never imply legitimacy or abuse."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    lookup("Cocothe_gb", "x");
  }, []);

  return (
    <div className="rounded-2xl border border-[#272727] bg-[#181818] p-2">
      {/* Aceternity-inspired precision canvas header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#272727] bg-[#1f1f1f] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff6600]" />
          <span className="font-mono caption-3 text-zinc-200">
            GET /api/v1/accounts/{platform}/{query.replace(/^@/, "") || "..."}
          </span>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-[#313131] bg-[#181818] p-1">
          <button
            type="button"
            onClick={() => setViewMode("inspector")}
            className={`button-xsm inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-colors duration-300 ${
              viewMode === "inspector"
                ? "bg-[#272727] text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Eye size={13} weight="bold" />
            <span>Inspector</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("json")}
            className={`button-xsm inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-colors duration-300 ${
              viewMode === "json"
                ? "bg-[#272727] text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Code size={13} weight="bold" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Live Search Controls */}
      <div className="mt-2 rounded-lg border border-[#272727] bg-[#000000] p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            lookup(query, platform);
          }}
          className="flex flex-col gap-2 sm:flex-row"
        >
          {/* Platform Selector */}
          <div className="flex items-center rounded-lg border border-[#272727] bg-[#181818] p-1 shrink-0">
            <button
              type="button"
              onClick={() => {
                setPlatform("x");
                if (platform !== "x") {
                  setQuery("Cocothe_gb");
                  lookup("Cocothe_gb", "x");
                }
              }}
              className={`button-xsm rounded-md px-3 py-1.5 font-mono transition-colors duration-300 ${
                platform === "x" ? "bg-[#ff6600] text-black font-bold" : "text-zinc-400 hover:text-white"
              }`}
            >
              X
            </button>
            <button
              type="button"
              onClick={() => {
                setPlatform("threads");
                if (platform !== "threads") {
                  setQuery("threads_growth_spammer");
                  lookup("threads_growth_spammer", "threads");
                }
              }}
              className={`button-xsm rounded-md px-3 py-1.5 font-mono transition-colors duration-300 ${
                platform === "threads" ? "bg-[#ff6600] text-black font-bold" : "text-zinc-400 hover:text-white"
              }`}
            >
              Threads
            </button>
          </div>

          <label htmlFor="hero-lookup-input" className="sr-only">
            Lookup {platform.toUpperCase()} handle or account ID
          </label>
          <div className="relative flex-1">
            <MagnifyingGlass
              size={16}
              weight="bold"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              id="hero-lookup-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={platform === "x" ? "Enter X handle (e.g. Cocothe_gb) or ID" : "Enter Threads handle (e.g. threads_growth_spammer)"}
              className="body-5 w-full rounded-lg border border-[#272727] bg-[#181818] py-2 pl-9 pr-3 font-mono text-white placeholder:text-zinc-500 focus:border-[#ff6600] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="button-sm inline-flex items-center justify-center rounded-lg border border-[#313131] bg-[#1f1f1f] px-3 py-2 text-white hover:bg-[#272727] active:scale-[0.98] transition-all duration-300"
          >
            Run lookup
          </button>
        </form>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="caption-5 font-mono text-zinc-500">Benchmark samples:</span>
          {SAMPLE_HANDLES.map((item) => (
            <button
              key={`${item.platform}:${item.handle}`}
              type="button"
              onClick={() => {
                setPlatform(item.platform as "x" | "threads");
                setQuery(item.handle);
                lookup(item.handle, item.platform as "x" | "threads");
              }}
              className={`caption-4 rounded-md border px-2 py-1 font-mono transition-colors duration-300 ${
                query.toLowerCase() === item.handle.toLowerCase() && platform === item.platform
                  ? "border-[#ff6600] bg-[#131209] text-[#ff6600]"
                  : "border-[#272727] bg-[#181818] text-zinc-400 hover:border-[#313131] hover:text-white"
              }`}
            >
              <span className="text-zinc-500 mr-1 uppercase text-[10px]">{item.platform}:</span>
              @{item.handle}
            </button>
          ))}
        </div>

        {/* Result Canvas */}
        <div className="mt-4 min-h-[260px]">
          {loading ? (
            /* B9 Skeleton loader shaped like real layout */
            <div className="space-y-3 animate-pulse" aria-busy="true">
              <div className="h-14 rounded-lg bg-[#181818]" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="h-24 rounded-lg bg-[#181818]" />
                <div className="h-24 rounded-lg bg-[#181818]" />
              </div>
              <div className="h-16 rounded-lg bg-[#181818]" />
            </div>
          ) : error ? (
            <div className="rounded-lg border border-[#272727] bg-[#181818] p-4">
              <div className="flex items-start gap-3">
                <WarningCircle size={20} weight="bold" className="mt-0.5 shrink-0 text-[#ff6600]" />
                <div>
                  <p className="title-4 text-white">Account not indexed (HTTP 404)</p>
                  <p className="body-6 mt-1 text-zinc-400">{error}</p>
                </div>
              </div>
            </div>
          ) : record && viewMode === "json" ? (
            <pre className="max-h-[300px] overflow-auto rounded-lg border border-[#272727] bg-[#181818] p-4 font-mono caption-5 text-zinc-300">
              {JSON.stringify(record, null, 2)}
            </pre>
          ) : record ? (
            <div className="space-y-3">
              {/* Identity + Status Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#272727] bg-[#181818] p-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="title-2 font-mono text-white">@{record.account.username}</span>
                    <span className="caption-4 rounded border border-[#313131] bg-[#1f1f1f] px-2 py-0.5 font-mono text-zinc-300">
                      ID {record.account.platform_account_id || "unassigned"}
                    </span>
                  </div>
                  <p className="caption-5 mt-1 text-zinc-400">
                    Policy {record.account.policy_version} · {record.account.evidence_count} indexed URL references
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="caption-3 rounded-md border border-[#ff6600]/40 bg-[#131209] px-2.5 py-1 text-[#ff6600]">
                    {formatVerificationLabel(record.account.verification_status)}
                  </span>
                  <span className="caption-3 rounded-md border border-[#313131] bg-[#1f1f1f] px-2.5 py-1 text-zinc-200">
                    {formatClassificationLabel(record.account.classification)}
                  </span>
                </div>
              </div>

              {/* Side by side Source Assertions & Evidence */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-[#272727] bg-[#181818] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="caption-3 font-mono uppercase text-zinc-400">
                      Source assertions ({record.source_assertions.length})
                    </span>
                    {record.account.has_source_conflict && (
                      <span className="caption-4 rounded bg-[#131209] border border-[#ff6600]/50 px-1.5 py-0.5 text-[#ff6600]">
                        Conflict preserved
                      </span>
                    )}
                  </div>
                  <ul className="space-y-2">
                    {record.source_assertions.map((sa, idx) => (
                      <li
                        key={`${sa.source_slug}-${idx}`}
                        className="rounded-md border border-[#272727] bg-[#1f1f1f] p-2.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="body-4 text-white">{sa.source_name}</span>
                          <span className="caption-5 font-mono text-zinc-400">
                            {sa.verified ? "Verified" : "External"}
                          </span>
                        </div>
                        <p className="caption-5 mt-1 font-mono text-zinc-400">
                          {sa.classification} · v{sa.list_version}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-lg border border-[#272727] bg-[#181818] p-4">
                  <span className="caption-3 font-mono uppercase text-zinc-400 block mb-2">
                    Canonical evidence URLs (zero archived text)
                  </span>
                  {record.evidence.length === 0 ? (
                    <p className="body-6 text-zinc-400">
                      Zero public post URLs attached upstream. Held under review until two behavioral URLs are verified.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {record.evidence.slice(0, 3).map((ev) => (
                        <li
                          key={ev.platform_post_id}
                          className="rounded-md border border-[#272727] bg-[#1f1f1f] p-2.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <a
                              href={ev.public_post_url}
                              target="_blank"
                              rel="noreferrer"
                              className="caption-4 inline-flex items-center gap-1 font-mono text-zinc-200 hover:text-[#ff6600] truncate"
                            >
                              <LinkSimple size={13} weight="bold" />
                              <span className="truncate">status/{ev.platform_post_id}</span>
                            </a>
                            <span className="caption-5 font-mono text-zinc-500">
                              {ev.source_deleted ? "Tombstoned" : "Active"}
                            </span>
                          </div>
                          <p className="caption-5 mt-1 font-mono text-zinc-500 truncate">
                            sha256: {ev.content_hash_sha256.slice(0, 20)}...
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#272727] bg-[#181818] px-4 py-2.5">
                <span className="caption-5 flex items-center gap-1.5 text-zinc-400">
                  <CheckCircle size={14} weight="bold" className="text-[#ff6600]" />
                  <span>{record.meta.disclaimer}</span>
                </span>
                <Link
                  href={`/accounts/${record.account.platform}/${record.account.username}`}
                  className="button-xsm inline-flex items-center gap-1 text-white hover:text-[#ff6600] transition-colors duration-300"
                >
                  <span>Full record</span>
                  <ArrowUpRight size={13} weight="bold" />
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
