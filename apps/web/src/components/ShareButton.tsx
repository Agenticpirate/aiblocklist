"use client";

import { useState } from "react";
import { ShareNetwork, Check, TwitterLogo, Copy } from "@phosphor-icons/react";

interface ShareButtonProps {
  platform: string;
  username: string;
  classification: string;
  url: string;
}

export function ShareButton({ platform, username, classification, url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }

  const shareText = `Check AIBlockList behavioral dossier for @${username} on ${platform.toUpperCase()} (${classification}): ${url}`;

  const xShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `Check @${username} on AIBlockList (${classification}):`
  )}&url=${encodeURIComponent(url)}`;

  const threadsShareUrl = `https://threads.net/intent/post?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="button-sm inline-flex items-center gap-1.5 rounded-lg border border-[#313131] bg-[#1f1f1f] px-3 py-2 text-zinc-200 hover:bg-[#272727] hover:text-white transition-colors duration-300"
      >
        <ShareNetwork size={15} weight="bold" />
        <span>Share dossier</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 rounded-xl border border-[#272727] bg-[#181818] p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <button
            type="button"
            onClick={() => {
              handleCopy();
              setTimeout(() => setOpen(false), 800);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 caption-4 text-left text-zinc-200 hover:bg-[#272727] transition-colors"
          >
            {copied ? (
              <Check size={14} weight="bold" className="text-[#ff6600]" />
            ) : (
              <Copy size={14} weight="bold" className="text-zinc-400" />
            )}
            <span>{copied ? "Copied to clipboard!" : "Copy public link"}</span>
          </button>

          <a
            href={xShareUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 caption-4 text-left text-zinc-200 hover:bg-[#272727] transition-colors"
          >
            <TwitterLogo size={14} weight="bold" className="text-[#ff6600]" />
            <span>Share on X</span>
          </a>

          <a
            href={threadsShareUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 caption-4 text-left text-zinc-200 hover:bg-[#272727] transition-colors"
          >
            <span className="font-bold text-[#ff6600] text-xs">@</span>
            <span>Share on Threads</span>
          </a>
        </div>
      )}
    </div>
  );
}
