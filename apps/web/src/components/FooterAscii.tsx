"use client";

import Link from "next/link";
import Image from "next/image";
import { CaretUp, CaretDown, ArrowUpRight, ShieldCheck } from "@phosphor-icons/react";
import { XLogo } from "./PlatformSlideControl";

const FOOTER_COLUMNS = [
  {
    title: "Platform",
    links: [
      { href: "/", label: "Intelligence feed" },
      { href: "/directory", label: "Account directory" },
      { href: "/account-health", label: "Account health" },
      { href: "/api-docs", label: "Developer API" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/methodology", label: "Methodology & signals" },
      { href: "/transparency", label: "Transparency ledger" },
      { href: "/about", label: "About & credits" },
    ],
  },
  {
    title: "Governance",
    links: [
      { href: "/appeals", label: "Independent appeals" },
      { href: "/report", label: "Submit report" },
      { href: "/contact", label: "Contact" },
      { href: "/privacy", label: "Privacy policy" },
      { href: "/terms", label: "Terms of service" },
    ],
  },
];

export function FooterAscii() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mt-8 sm:mt-10 pb-6 sm:pb-8">
      <footer className="relative overflow-hidden rounded-2xl border border-[#272727] bg-gradient-to-b from-[#1a1a1a] to-[#121212] px-4 py-5 sm:px-8 sm:py-10">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff6600]/50 to-transparent" />
        {/* Scroll to top button */}
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="absolute top-4 right-4 sm:top-7 sm:right-7 rounded-xl border border-[#313131] bg-[#1F1F1F] p-2 text-zinc-400 hover:border-[#ff6600]/60 hover:text-white transition-colors duration-300 cursor-pointer"
        >
          <CaretUp size={16} weight="bold" />
        </button>

        {/* Top Section: Brand + Link Columns */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 sm:gap-6 md:gap-10 mb-4 sm:mb-6 md:mb-8">
          {/* Left Brand Block */}
          <div className="flex flex-col items-start max-w-sm space-y-2.5 pr-12 md:pr-0">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#313131] bg-[#000000] p-1.5 group-hover:border-[#ff6600]/60 transition-colors duration-300">
                <Image
                  src="/logo.png"
                  alt="AIBlockList Logo"
                  width={32}
                  height={32}
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="title-2 font-mono text-white tracking-tight">
                AIBlockList<span className="text-[#ff6600]">.</span>
              </span>
            </Link>

            <p className="text-[13px] leading-relaxed sm:body-6 text-zinc-400 text-pretty">
              Independent, open source trust infrastructure separating automated reply spam from authentic human speech across 𝕏 and Threads.
            </p>

            <div className="inline-flex items-center gap-2 rounded-lg border border-[#272727] bg-[#000000] px-2.5 py-1 text-[10px] sm:caption-5 font-mono text-zinc-400 whitespace-nowrap">
              <ShieldCheck size={13} weight="bold" className="text-emerald-400 shrink-0" />
              <span>Apache 2.0 · ODC-By 1.0 · Policy v1</span>
            </div>
          </div>

          {/* Mobile: collapsible sections with tap-friendly tiles */}
          <div className="sm:hidden w-full rounded-xl border border-[#272727] bg-[#141414] divide-y divide-[#272727]">
            {FOOTER_COLUMNS.map((col, i) => (
              <details key={col.title} open={i === 0} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between px-3.5 py-3 [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-zinc-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#ff6600]" />
                    {col.title}
                    <span className="text-zinc-600">{col.links.length}</span>
                  </span>
                  <CaretDown size={13} weight="bold" className="text-zinc-500 transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <ul className="grid grid-cols-2 gap-1.5 px-2.5 pb-3">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="flex h-full items-center justify-between gap-1 rounded-lg border border-[#272727] bg-[#1c1c1c] px-2.5 py-2 text-[12.5px] leading-tight text-zinc-300 active:border-[#ff6600]/60 active:text-white transition-colors"
                      >
                        <span>{link.label}</span>
                        <ArrowUpRight size={11} weight="bold" className="shrink-0 text-zinc-600" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>

          {/* Right Link Columns */}
          <div className="hidden sm:grid grid-cols-3 gap-6 sm:gap-8 md:gap-10 text-sm w-full md:w-auto">
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title} className="flex flex-col items-start">
                <h3 className="mb-2.5 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                  {col.title}
                </h3>
                <ul className="space-y-1.5 text-zinc-400">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="relative inline-block body-6 text-zinc-400 hover:text-white transition-colors duration-300 group"
                      >
                        <span>{link.label}</span>
                        <span className="absolute left-0 -bottom-[1px] h-[1px] w-0 bg-[#ff6600] transition-all duration-300 group-hover:w-full" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Meta Bar */}
        <div className="border-t border-[#272727] pt-4 flex flex-row justify-between items-center gap-3">
          <div className="flex flex-wrap items-center justify-start gap-x-1.5 sm:gap-x-2 gap-y-0.5 text-[10.5px] sm:caption-5 text-zinc-500 font-mono">
            <span>© 2026<span className="hidden sm:inline"> AIBlockList.com</span>.</span>
            <span>Built by</span>
            <a
              href="https://x.com/Agenticpirate"
              target="_blank"
              rel="noreferrer"
              className="text-zinc-300 hover:text-[#ff6600] underline transition-colors"
            >
              @Agenticpirate
            </a>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">Observable behavior only, never AI authorship.</span>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <a
              href="https://x.com/Agenticpirate"
              target="_blank"
              rel="noreferrer"
              aria-label="Agenticpirate on X"
              className="rounded-xl border border-[#313131] bg-[#1F1F1F] p-2 text-zinc-400 hover:border-[#ff6600]/60 hover:text-white transition-colors duration-300"
            >
              <XLogo className="w-3.5 h-3.5" shiny={false} />
            </a>

            <Link
              href="/api-docs"
              aria-label="Developer API"
              className="inline-flex items-center gap-1 rounded-xl border border-[#313131] bg-[#1F1F1F] px-2.5 py-1.5 caption-4 font-mono text-zinc-300 hover:border-[#ff6600]/60 hover:text-[#ff6600] transition-colors duration-300"
            >
              <span>API</span>
              <ArrowUpRight size={12} weight="bold" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
