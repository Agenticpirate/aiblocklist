"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { CaretUp, ArrowUpRight, ShieldCheck } from "@phosphor-icons/react";
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

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export function FooterAscii() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mx-auto max-w-6xl px-3 sm:px-6 lg:px-8 mt-8 sm:mt-12 pb-6 sm:pb-10">
      <footer className="relative overflow-hidden rounded-2xl border border-[#272727] bg-[#0A0A0A]">
        {/* TOP TORN SHEET */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="relative z-10 bg-[#181818] px-4 pt-6 pb-5 sm:px-8 sm:pt-10 sm:pb-7"
        >
          {/* Scroll to top button */}
          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className="absolute top-5 right-5 sm:top-7 sm:right-7 rounded-xl border border-[#313131] bg-[#1F1F1F] p-2 text-zinc-400 hover:border-[#ff6600]/60 hover:text-white transition-colors duration-300 cursor-pointer"
          >
            <CaretUp size={16} weight="bold" />
          </button>

          {/* Top Section: Brand + Link Columns */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 md:gap-10 mb-6 md:mb-8 pr-10 md:pr-0">
            {/* Left Brand Block */}
            <div className="flex flex-col items-start max-w-sm space-y-2.5">
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

              <p className="body-6 text-zinc-400 text-pretty">
                Independent, open source trust infrastructure separating automated reply spam from authentic human speech across 𝕏 and Threads.
              </p>

              <div className="inline-flex items-center gap-2 rounded-lg border border-[#272727] bg-[#000000] px-2.5 py-1 caption-5 font-mono text-zinc-400">
                <ShieldCheck size={13} weight="bold" className="text-emerald-400 shrink-0" />
                <span>Apache 2.0 · ODC-By 1.0 · Policy v1.0.0</span>
              </div>
            </div>

            {/* Right Link Columns */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8 md:gap-10 text-sm w-full md:w-auto">
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

          {/* Chrome Bottom Meta Bar */}
          <div className="border-t border-[#272727] pt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-2 gap-y-1 caption-5 text-zinc-500 font-mono order-2 sm:order-1">
              <span>© 2026 AIBlockList.com.</span>
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

            <div className="flex items-center gap-2 order-1 sm:order-2">
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
        </motion.div>

        {/* TORN PAPER EDGE + CURLED FLAPS */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45, ease: EASE_OUT }}
          className="relative z-10 -mt-[1px] w-full overflow-hidden leading-none select-none pointer-events-none"
        >
          <svg
            viewBox="0 0 1200 44"
            preserveAspectRatio="none"
            className="block h-7 sm:h-9 w-full"
            aria-hidden="true"
          >
            {/* Soft drop shadow onto underneath paper */}
            <path
              d="M0,0 L1200,0 L1200,18 L1145,30 L1088,16 L1024,34 L962,19 L895,32 L832,15 L770,33 L705,18 L642,36 L580,20 L518,34 L452,17 L390,32 L325,16 L262,35 L198,19 L134,33 L68,18 L0,30 Z"
              fill="#000000"
              fillOpacity="0.55"
            />
            {/* Fibre / curled paper rim */}
            <path
              d="M0,0 L1200,0 L1200,14 L1145,26 L1088,12 L1024,30 L962,15 L895,28 L832,11 L770,29 L705,14 L642,32 L580,16 L518,30 L452,13 L390,28 L325,12 L262,31 L198,15 L134,29 L68,14 L0,26 Z"
              fill="#2E2E2E"
            />
            {/* Top sheet tear edge */}
            <path
              d="M0,0 L1200,0 L1200,11 L1145,23 L1088,9 L1024,27 L962,12 L895,25 L832,8 L770,26 L705,11 L642,29 L580,13 L518,27 L452,10 L390,25 L325,9 L262,28 L198,12 L134,26 L68,11 L0,23 Z"
              fill="#181818"
            />
          </svg>
        </motion.div>

        {/* UNDERNEATH PAPER REVEAL: TEXTURED PAPER + ANIMATED LOGO PIN + BRAND NAME */}
        <div
          className="relative flex flex-col items-center justify-center px-4 pt-3 pb-8 sm:pt-4 sm:pb-10 bg-[#080808]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.045) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        >
          {/* Animated Logo Pin (replaces pushpin) */}
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.65, rotate: -16 }}
            whileInView={{ opacity: 1, y: 0, scale: 1, rotate: -4 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ type: "spring", stiffness: 280, damping: 16, delay: 0.08 }}
            whileHover={{ rotate: [0, -10, 8, -4, 0], scale: 1.1 }}
            whileTap={{ scale: 0.92, rotate: -12 }}
            className="relative -mt-7 mb-3.5 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl border border-[#ff6600]/60 bg-[#181818] p-2 shadow-[0_10px_28px_rgba(255,102,0,0.28)] cursor-pointer"
            title="AIBlockList"
          >
            {/* Subtle pulsing halo ring */}
            <motion.span
              animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
              className="pointer-events-none absolute inset-0 rounded-2xl border border-[#ff6600]/50"
            />
            <motion.div
              animate={{ y: [0, -2.5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="relative h-full w-full"
            >
              <Image
                src="/logo.png"
                alt="AIBlockList Pin Logo"
                width={48}
                height={48}
                className="h-full w-full object-contain"
              />
            </motion.div>
          </motion.div>

          {/* Brand Wordmark Printed on Underneath Paper */}
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, delay: 0.14, ease: EASE_OUT }}
            className="text-center space-y-1.5"
          >
            <p className="text-3xl sm:text-5xl font-semibold tracking-tight font-mono select-none">
              <span className="bg-gradient-to-r from-white via-zinc-300 to-[#9B9B9B] bg-clip-text text-transparent">
                AIBlockList
              </span>
              <motion.span
                animate={{ opacity: [1, 0.45, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                className="text-[#ff6600] inline-block"
              >
                .
              </motion.span>
            </p>
            <motion.p
              initial={{ opacity: 0, letterSpacing: "0.12em" }}
              whileInView={{ opacity: 1, letterSpacing: "0.24em" }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.22, ease: EASE_OUT }}
              className="caption-5 font-mono uppercase text-zinc-500"
            >
              Identify · Verify · Filter
            </motion.p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
