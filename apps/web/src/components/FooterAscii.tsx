"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const ASCII_GRID = [
  "IDENTIFY.VERIFY.FILTER..AIBLOCKLIST.OPEN.INFRASTRUCTURE..SIG01..SIG02..SIG03..",
  "..HUMAN.GOVERNED..ZERO.AI.DETECTORS..SHA256.AUDIT.CHAIN..ODC.BY.1.0..APACHE2..",
  "LOCAL.FIRST.SYNC..NO.DOM.AUTO.BLOCKING..DUAL.REVIEW.GATE..INDEPENDENT.APPEALS.",
  "AIBLOCKLIST.COM..TRUST.AND.SAFETY..OPEN.INTELLIGENCE..POLICY.V1.0.0..VERIFIED.",
];

export function FooterAscii() {
  const [cursor, setCursor] = useState<{ row: number; col: number } | null>(null);

  return (
    <footer className="mt-20 border-t border-[#272727] bg-[#000000]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-7 w-7 items-center justify-center rounded-md overflow-hidden border border-[#313131] bg-[#000000]">
                <Image
                  src="/logo.png"
                  alt="AIBlockList Logo"
                  width={28}
                  height={28}
                  className="h-full w-full object-contain"
                />
              </span>
              <span className="title-3 text-white">AIBlockList.com</span>
            </div>
            <p className="body-6 mt-4 max-w-md text-zinc-400">
              Independent, open source trust and safety infrastructure for identifying,
              verifying, and filtering abusive automated social media behavior without
              penalizing legitimate human or AI assisted communication.
            </p>
            <p className="caption-5 mt-4 font-mono text-zinc-500">
              Code: Apache 2.0 · Public verified dataset: ODC-By 1.0
            </p>

            {/* Creator & Community Lineage Credits */}
            <div className="mt-4 rounded-xl border border-[#313131] bg-[#141414] p-3.5 text-xs text-zinc-300 max-w-md">
              <span className="font-mono text-[10px] uppercase text-[#ff6600] font-bold block mb-1">
                Creator &amp; Architecture
              </span>
              <p className="leading-relaxed">
                Built by{" "}
                <a
                  href="https://x.com/Agenticpirate"
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono font-bold text-white hover:text-[#ff6600] underline"
                >
                  @Agenticpirate
                </a>
                . Independent open-source intelligence infrastructure for social networks.
              </p>
              <p className="mt-2 text-[11px] text-zinc-500 border-t border-[#222] pt-2">
                Concept lineage: Credited to early community initiatives including{" "}
                <a
                  href="https://blockedforaireply.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-zinc-400 hover:text-white underline"
                >
                  blockedforaireply.com
                </a>{" "}
                by Pieter Levels (@levelsio).
              </p>
            </div>
          </div>

          <div>
            <h3 className="title-4 text-white mb-3">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="body-6 text-zinc-400 hover:text-white transition-colors duration-300">
                  Intelligence feed
                </Link>
              </li>
              <li>
                <Link href="/extension" className="body-6 text-zinc-400 hover:text-white transition-colors duration-300">
                  Browser extension
                </Link>
              </li>
              <li>
                <Link href="/account-health" className="body-6 text-zinc-400 hover:text-white transition-colors duration-300">
                  Account health (Under the Hood)
                </Link>
              </li>
              <li>
                <Link href="/methodology" className="body-6 text-zinc-400 hover:text-white transition-colors duration-300">
                  Methodology & signals
                </Link>
              </li>
              <li>
                <Link href="/about" className="body-6 text-zinc-400 hover:text-white transition-colors duration-300">
                  About &amp; project credits
                </Link>
              </li>
              <li>
                <Link href="/transparency" className="body-6 text-zinc-400 hover:text-white transition-colors duration-300">
                  Transparency ledger
                </Link>
              </li>
              <li>
                <Link href="/api-docs" className="body-6 text-zinc-400 hover:text-white transition-colors duration-300">
                  Developer API
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="title-4 text-white mb-3">Governance</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/appeals" className="body-6 text-zinc-400 hover:text-white transition-colors duration-300">
                  Independent appeals
                </Link>
              </li>
              <li>
                <Link href="/report" className="body-6 text-zinc-400 hover:text-white transition-colors duration-300">
                  Submit report
                </Link>
              </li>
              <li>
                <Link href="/contact" className="body-6 text-zinc-400 hover:text-white transition-colors duration-300">
                  Contact &amp; governance
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="body-6 text-zinc-400 hover:text-white transition-colors duration-300">
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="body-6 text-zinc-400 hover:text-white transition-colors duration-300">
                  Terms of service
                </Link>
              </li>
              <li>
                <a
                  href="https://blockedforaireply.com"
                  target="_blank"
                  rel="noreferrer"
                  className="body-6 text-[#ff6600] hover:text-white transition-colors duration-300 inline-flex items-center gap-1 font-mono text-xs"
                >
                  <span>blockedforaireply.com ↗</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Aceternity-inspired interactive cursor-reactive ASCII field */}
        <div
          onMouseLeave={() => setCursor(null)}
          className="mt-12 overflow-hidden rounded-2xl border border-[#272727] bg-[#181818] p-4 font-mono caption-5 select-none"
          aria-hidden="true"
        >
          <div className="space-y-1 overflow-x-hidden whitespace-nowrap">
            {ASCII_GRID.map((line, rIdx) => (
              <div key={rIdx} className="leading-4 tracking-widest">
                {line.split("").map((ch, cIdx) => {
                  const dist =
                    cursor !== null
                      ? Math.hypot(cursor.row - rIdx, (cursor.col - cIdx) * 0.45)
                      : 99;
                  const active = dist < 3.2;
                  const warm = dist >= 3.2 && dist < 6.5;
                  return (
                    <span
                      key={cIdx}
                      onMouseEnter={() => setCursor({ row: rIdx, col: cIdx })}
                      className={`inline-block transition-colors duration-300 ${
                        active
                          ? "text-[#ff6600]"
                          : warm
                          ? "text-zinc-300"
                          : "text-zinc-700"
                      }`}
                    >
                      {ch}
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between caption-5 text-zinc-500">
          <span>
            AIBlockList.com · Built by{" "}
            <a
              href="https://x.com/Agenticpirate"
              target="_blank"
              rel="noreferrer"
              className="text-zinc-300 hover:text-[#ff6600] font-mono font-bold"
            >
              @Agenticpirate
            </a>
          </span>
          <span>Classifications reflect observable behavior under Policy v1.0.0, never AI authorship.</span>
        </div>
      </div>
    </footer>
  );
}
