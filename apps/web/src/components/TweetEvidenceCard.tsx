"use client";

import { LinkSimple, WarningCircle, CheckCircle, ArrowUpRight, ShieldWarning } from "@phosphor-icons/react";
import { EvidenceRecord } from "@/lib/api";
import { VerifiedTick } from "./VerifiedTick";
import { XLogo } from "./PlatformSlideControl";
import { UserAvatar } from "./UserAvatar";

interface TweetEvidenceCardProps {
  evidence: EvidenceRecord;
  username: string;
  platformAccountId?: string | null;
  platform?: string;
  showVerified?: boolean;
}

export function TweetEvidenceCard({
  evidence,
  username,
  platformAccountId,
  platform = "x",
  showVerified = true,
}: TweetEvidenceCardProps) {
  const initial = (username.replace(/^@/, "")[0] || "?").toUpperCase();
  const postText = evidence.post_text || (evidence.metrics?.post_text as string) || null;
  const postDate = evidence.post_date || (evidence.metrics?.post_date as string) || evidence.collected_at?.slice(0, 10);
  const responseText = evidence.response_text || (evidence.metrics?.response_text as string) || null;
  const isDeleted = evidence.source_deleted;

  return (
    <div className="group relative rounded-xl border border-[#2f3336] bg-[#0c0c0c] p-4 text-left shadow-md transition-all duration-200 hover:border-[#444] hover:bg-[#111315]">
      {/* Tweet Author & Tag Header */}
      <div className="flex items-center justify-between gap-3 border-b border-[#222] pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <UserAvatar
            username={username}
            platformAccountId={platformAccountId}
            platform={platform}
            size="sm"
          />
          <div className="min-w-0 flex items-center gap-1.5 flex-wrap">
            <span className="font-mono font-bold text-sm text-white truncate">
              @{username.replace(/^@/, "")}
            </span>
            {showVerified && <VerifiedTick className="w-3.5 h-3.5 text-[#1d9bf0]" />}
            <span className="caption-5 font-mono text-zinc-500">
              · {postDate || "Observed"}
            </span>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 rounded-full border border-[#ff6600]/30 bg-[#ff6600]/10 px-2 py-0.5 font-mono text-[11px] font-bold text-[#ff6600] shrink-0">
          AI reply
        </span>
      </div>

      {/* Main Tweet Body */}
      <div className="py-2.5">
        {postText ? (
          <p className="font-sans text-sm text-zinc-100 whitespace-pre-wrap break-words leading-relaxed select-text">
            {postText}
          </p>
        ) : isDeleted ? (
          <p className="font-mono text-xs italic text-zinc-500">
            Their reply was deleted by its author or is no longer available on {platform.toUpperCase()}.
          </p>
        ) : (
          <p className="font-mono text-xs italic text-zinc-400">
            Observed automated reply captured under Policy v1.0.0. Canonical reference logged.
          </p>
        )}
      </div>

      {/* Thread Response Block (e.g., from reporter / maintainer) */}
      {responseText && (
        <div className="ml-3 mt-1 pl-3 border-l-2 border-[#333] space-y-1 py-1">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
            <span className="font-bold text-zinc-300">Action taken</span>
            <span className="text-[10px] text-zinc-500">· Response</span>
          </div>
          <p className="text-xs text-zinc-300 font-sans italic bg-[#151515] p-2 rounded-lg border border-[#262626]">
            {responseText}
          </p>
        </div>
      )}

      {/* Tweet Footer & Action Links */}
      <div className="mt-2 flex items-center justify-between border-t border-[#1e1e1e] pt-2.5 font-mono text-xs">
        <div className="flex items-center gap-3">
          <a
            href={evidence.public_post_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 font-bold text-[#ff6600] hover:text-white transition-colors"
          >
            <XLogo className="w-3 h-3 text-current" />
            <span>Their reply on X ↗</span>
          </a>

          <a
            href={
              platform === "x"
                ? `https://x.com/i/safety/report?screen_name=${username.replace(/^@/, "")}`
                : `https://threads.net/@${username.replace(/^@/, "")}`
            }
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-white transition-colors"
            title="Report this account directly on platform"
          >
            <ShieldWarning size={12} weight="bold" />
            <span>Report</span>
          </a>
        </div>

        <span className="caption-5 text-zinc-600 truncate max-w-[160px]" title={`SHA-256: ${evidence.content_hash_sha256}`}>
          SHA-256: {evidence.content_hash_sha256?.slice(0, 10)}…
        </span>
      </div>
    </div>
  );
}
