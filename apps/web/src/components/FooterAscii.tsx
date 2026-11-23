"use client";

import Link from "next/link";
import { useState } from "react";
import { ShieldCheck } from "@phosphor-icons/react";

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
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md border border-[#313131] bg-[#181818] text-[#ff6600]">
                <ShieldCheck size={16} weight="bold" />
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
          </div>

          <div>
            <h3 className="title-4 text-white mb-3">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/directory" className="body-6 text-zinc-400 hover:text-white transition-colors duration-300">
                  Account directory
                </Link>
              </li>
              <li>
                <Link href="/report" className="body-6 text-zinc-400 hover:text-white transition-colors duration-300">
                  Submit report
                </Link>
              </li>
              <li>
                <Link href="/appeals" className="body-6 text-zinc-400 hover:text-white transition-colors duration-300">
                  Independent appeals
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
                <Link href="/privacy" className="body-6 text-zinc-400 hover:text-white transition-colors duration-300">
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="body-6 text-zinc-400 hover:text-white transition-colors duration-300">
                  Terms and charter
                </Link>
              </li>
              <li>
                <Link href="/transparency#audit-chain" className="body-6 text-zinc-400 hover:text-white transition-colors duration-300">
                  Audit chain integrity
                </Link>
              </li>
              <li>
                <a
                  href="https://blockedforaireply.com"
                  target="_blank"
                  rel="noreferrer"
                  className="body-6 text-zinc-400 hover:text-white transition-colors duration-300"
                >
                  External source: blockedforaireply
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
          <span>AIBlockList.com · Public interest trust and safety infrastructure</span>
          <span>Classifications reflect observable behavior under Policy v1.0.0, never AI authorship.</span>
        </div>
      </div>
    </footer>
  );
}
