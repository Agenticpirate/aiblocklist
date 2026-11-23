"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ShieldCheck, List, X, ArrowUpRight } from "@phosphor-icons/react";

const NAV_ITEMS = [
  { href: "/directory", label: "Directory" },
  { href: "/transparency", label: "Transparency" },
  { href: "/api-docs", label: "API" },
  { href: "/report", label: "Report" },
  { href: "/appeals", label: "Appeals" },
];

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-[#ff6600] focus:px-3 focus:py-2 focus:text-black button-sm"
      >
        Skip to content
      </a>

      {/* B7 Floating translucent centered navigation bar */}
      <header className="fixed top-4 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
        <nav
          aria-label="Primary navigation"
          className="pointer-events-auto flex items-center gap-4 rounded-2xl border border-[#272727] bg-[#181818]/85 px-3 py-2 backdrop-blur-md transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        >
          <Link
            href="/"
            className="group flex items-center gap-2 rounded-lg px-2 py-1 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98]"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-md border border-[#313131] bg-[#000000] text-[#ff6600]">
              <ShieldCheck size={16} weight="bold" />
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

          <div className="hidden md:flex items-center">
            <Link
              href="/directory"
              className="button-sm inline-flex items-center gap-1.5 rounded-lg bg-[#ff6600] px-3 py-2 text-black transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[#e55c00] active:scale-[0.98]"
            >
              <span>Inspect account</span>
              <ArrowUpRight size={14} weight="bold" />
            </Link>
          </div>

          {/* Mobile menu toggle (animated icon transition per B7) */}
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
            className="md:hidden relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#272727] bg-[#1f1f1f] text-white transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[#272727] active:scale-[0.98]"
          >
            <span
              className={`absolute transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                menuOpen ? "opacity-0 rotate-90 scale-75" : "opacity-100 rotate-0 scale-100"
              }`}
            >
              <List size={18} weight="bold" />
            </span>
            <span
              className={`absolute transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                menuOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-75"
              }`}
            >
              <X size={18} weight="bold" />
            </span>
          </button>
        </nav>
      </header>

      {/* B7 Full height mobile menu panel with staggered link entrance */}
      <div
        aria-hidden={!menuOpen}
        className={`fixed inset-0 z-30 md:hidden bg-[#000000]/95 backdrop-blur-xl transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex h-full flex-col justify-center px-8 pt-24 pb-12 gap-4">
          {NAV_ITEMS.map((item, idx) => {
            const active = pathname === item.href;
            const delayMs = Math.min(idx * 60, 400);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{ transitionDelay: menuOpen ? `${delayMs}ms` : "0ms" }}
                className={`heading-4 rounded-xl px-4 py-3 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  menuOpen ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                } ${active ? "bg-[#1f1f1f] text-[#ff6600]" : "text-zinc-200 hover:bg-[#181818]"}`}
              >
                {item.label}
              </Link>
            );
          })}
          <div
            style={{ transitionDelay: menuOpen ? "320ms" : "0ms" }}
            className={`pt-4 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              menuOpen ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
            }`}
          >
            <Link
              href="/directory"
              className="button-md flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff6600] px-3 py-2 text-black"
            >
              <span>Inspect account</span>
              <ArrowUpRight size={16} weight="bold" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
