"use client";

import { useEffect, useRef, useState } from "react";

interface TaglineRevealProps {
  text: string;
}

/**
 * Mandatory Tagline Reveal Section (B11):
 * Words transition individually from muted opacity (~30%) to full color in reading order
 * as the section scrolls through the viewport, using rAF throttling and reduced motion fallback.
 */
export function TaglineReveal({ text }: TaglineRevealProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const words = text.split(" ");
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      setReducedMotion(true);
      setActiveIndex(words.length);
      return;
    }

    let rafId = 0;
    const update = () => {
      rafId = 0;
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      const start = vh * 0.85;
      const end = vh * 0.25;
      const raw = (start - rect.top) / (start - end + rect.height * 0.35);
      const clamped = Math.max(0, Math.min(1, raw));
      setActiveIndex(Math.floor(clamped * (words.length + 1)) - 1);
    };

    const onScroll = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [words.length]);

  return (
    <section
      ref={containerRef}
      aria-label="Core mission statement"
      className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="rounded-2xl border border-[#272727] bg-[#181818] p-4 sm:p-16">
        <p className="caption-3 mb-4 sm:mb-6 font-mono uppercase tracking-wider text-[#ff6600]">
          Behavioral proof over guesswork
        </p>
        <h2 className="heading-2 max-w-[680px]">
          {words.map((word, idx) => {
            const lit = reducedMotion || idx <= activeIndex;
            return (
              <span
                key={`${word}-${idx}`}
                className={`inline-block mr-3 transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  lit ? "opacity-100 text-white" : "opacity-30 text-zinc-300"
                }`}
              >
                {word}
              </span>
            );
          })}
        </h2>
      </div>
    </section>
  );
}
