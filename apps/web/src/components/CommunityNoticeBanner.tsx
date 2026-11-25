"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, GitBranch } from "@phosphor-icons/react";

const DISMISS_KEY = "aiblocklist_source_notice_dismissed_v1";

export function CommunityNoticeBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(DISMISS_KEY)) {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore storage failure
    }
  }

  if (!visible) return null;

  return (
    <aside
      aria-label="Dataset source and open-source notice"
      className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-4 sm:bottom-4 z-30 sm:max-w-sm rounded-xl border border-[#2f2f2f] bg-[#111111]/95 backdrop-blur-md px-3.5 py-2.5 shadow-2xl"
    >
      <div className="flex items-start gap-2.5">
        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff6600]" />
        <div className="min-w-0 flex-1 text-[11px] leading-relaxed text-zinc-300">
          <p>
            Listings are currently synced from{" "}
            <a
              href="https://blockedforaireply.com/#all"
              target="_blank"
              rel="noreferrer"
              className="text-white underline decoration-zinc-600 hover:text-[#ff6600]"
            >
              @levelsio&apos;s list
            </a>
            . Using AI to help write is fine — we only oppose mass-reply bots.
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2.5 font-mono text-[10px]">
            <Link href="/appeals" className="text-[#ff6600] hover:underline font-semibold">
              Appeal →
            </Link>
            <span className="text-zinc-600">·</span>
            <a
              href="https://github.com/Agenticpirate/aiblocklist"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-zinc-400 hover:text-white"
            >
              <GitBranch size={11} weight="bold" />
              <span>Open Source · Help fight bots ↗</span>
            </a>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close notice"
          className="shrink-0 rounded-md p-1 text-zinc-500 hover:bg-[#222] hover:text-white transition-colors cursor-pointer"
        >
          <X size={13} weight="bold" />
        </button>
      </div>
    </aside>
  );
}
