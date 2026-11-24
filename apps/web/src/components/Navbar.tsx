"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { List, X, ArrowUpRight, ShieldCheck } from "@phosphor-icons/react";
import { QuickCheckModal } from "./QuickCheckModal";

const NAV_ITEMS = [
  { href: "/", label: "Intelligence" },
  { href: "/extension", label: "Extension" },
  { href: "/account-health", label: "Health" },
  { href: "/methodology", label: "Methodology" },
  { href: "/about", label: "About" },
  { href: "/transparency", label: "Transparency" },
  { href: "/api-docs", label: "API" },
  { href: "/report", label: "Report" },
  { href: "/appeals", label: "Appeals" },
];

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [quickCheckOpen, setQuickCheckOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-[#ff6600] focus:px-3 focus:py-2 focus:text-black button-sm"
      >
        Skip to content
      </a>

      {/* Top Navigation Bar: flush header on mobile, floating pill on tablet/desktop */}
      <header className="fixed top-0 sm:top-4 left-0 right-0 z-40 flex justify-center px-0 sm:px-4 pointer-events-none">
        <nav
          aria-label="Primary navigation"
          className="pointer-events-auto flex items-center justify-between sm:justify-start w-full sm:w-auto rounded-none sm:rounded-2xl border-b sm:border border-[#272727] bg-[#000000]/95 sm:bg-[#181818]/85 px-4 sm:px-3 py-2.5 sm:py-2 backdrop-blur-md transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        >
          <Link
            href="/"
            className="group flex items-center gap-2.5 rounded-lg px-2 py-1 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98]"
          >
            <span className="relative flex h-7 w-7 items-center justify-center rounded-md overflow-hidden border border-[#313131] bg-[#000000]">
              <Image
                src="/logo.png"
                alt="AIBlockList Logo"
                width={28}
                height={28}
                priority
                className="h-full w-full object-contain"
              />
            </span>
            <span className="title-4 text-white tracking-tight">AIBlockList</span>
            <span className="hidden sm:inline-block rounded border border-[#313131] bg-[#1f1f1f] px-1.5 py-0.5 font-mono caption-5 text-zinc-400">
              v1.0
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`title-4 rounded-lg px-3 py-2 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] ${
                    active
                      ? "bg-[#272727] text-white"
                      : "text-zinc-400 hover:bg-[#1f1f1f] hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <button
              type="button"
              onClick={() => setQuickCheckOpen(true)}
              className="button-sm inline-flex items-center gap-1.5 rounded-lg border border-[#ff6600]/40 bg-[#131209] px-2.5 py-2 text-xs font-mono text-[#ff6600] hover:bg-[#ff6600] hover:text-black transition-all cursor-pointer"
              title="Check if your account is listed or blocked"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#ff6600] animate-pulse" />
              <span>Am I Blocked?</span>
            </button>

            <Link
              href="/directory"
              className="button-sm inline-flex items-center gap-1.5 rounded-lg bg-[#ff6600] px-3 py-2 text-black transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[#e55c00] active:scale-[0.98]"
            >
              <span>Inspect account</span>
              <ArrowUpRight size={14} weight="bold" />
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
            className="md:hidden relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#272727] bg-[#1a1a1a] text-white transition-colors duration-300 hover:bg-[#272727] active:scale-[0.98]"
          >
            <span
              className={`absolute transition-all duration-300 ${
                menuOpen ? "opacity-0 rotate-90 scale-75" : "opacity-100 rotate-0 scale-100"
              }`}
            >
              <List size={20} weight="bold" />
            </span>
            <span
              className={`absolute transition-all duration-300 ${
                menuOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-75"
              }`}
            >
              <X size={20} weight="bold" />
            </span>
          </button>
        </nav>
      </header>

      {/* Full-screen mobile menu drawer with dedicated top bar (z-50) */}
      <div
        aria-hidden={!menuOpen}
        className={`fixed inset-0 z-50 md:hidden bg-[#000000] transition-opacity duration-300 overflow-y-auto ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Mobile drawer header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#222] bg-[#000000]/95 px-5 py-3.5 backdrop-blur-md">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2.5"
          >
            <span className="relative flex h-7 w-7 items-center justify-center rounded-md overflow-hidden border border-[#313131] bg-[#000000]">
              <Image
                src="/logo.png"
                alt="AIBlockList Logo"
                width={28}
                height={28}
                priority
                className="h-full w-full object-contain"
              />
            </span>
            <span className="font-bold text-white text-base tracking-tight">AIBlockList</span>
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#272727] bg-[#181818] text-zinc-300 hover:text-white"
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        {/* Drawer Links */}
        <div className="flex flex-col px-5 py-6 space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center justify-between rounded-xl px-4 py-3 text-lg font-medium transition-colors ${
                  active
                    ? "bg-[#1f1f1f] text-[#ff6600] font-bold"
                    : "text-zinc-200 hover:bg-[#151515] hover:text-white"
                }`}
              >
                <span>{item.label}</span>
                {active && <span className="h-2 w-2 rounded-full bg-[#ff6600]" />}
              </Link>
            );
          })}

          <div className="pt-6 space-y-3 border-t border-[#222] mt-4">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setQuickCheckOpen(true);
              }}
              className="button-md flex w-full items-center justify-center gap-2 rounded-xl border border-[#ff6600]/40 bg-[#131209] px-4 py-3 font-mono text-[#ff6600] font-bold text-sm"
            >
              <span className="h-2 w-2 rounded-full bg-[#ff6600] animate-pulse" />
              <span>Am I Blocked? Quick Status Check</span>
            </button>

            <Link
              href="/directory"
              onClick={() => setMenuOpen(false)}
              className="button-md flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff6600] px-4 py-3 text-black font-bold text-sm"
            >
              <span>Inspect Account Directory</span>
              <ArrowUpRight size={16} weight="bold" />
            </Link>
          </div>
        </div>
      </div>

      <QuickCheckModal
        isOpen={quickCheckOpen}
        onClose={() => setQuickCheckOpen(false)}
      />
    </>
  );
}
