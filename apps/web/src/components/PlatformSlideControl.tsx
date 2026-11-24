"use client";

import { useId } from "react";

interface PlatformSlideControlProps {
  activePlatform: string;
  onChange: (platform: string) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PlatformSlideControl({
  activePlatform,
  onChange,
  size = "md",
  className = "",
}: PlatformSlideControlProps) {
  const controlId = useId();

  const options = [
    {
      id: "all",
      label: "All",
      icon: (
        <svg
          viewBox="0 0 16 16"
          width="12"
          height="12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="shrink-0"
        >
          <circle cx="8" cy="8" r="6.5" />
          <path d="M1.5 8h13M8 1.5c2 2.2 2.5 4.3 2.5 6.5s-.5 4.3-2.5 6.5c-2-2.2-2.5-4.3-2.5-6.5S6 3.7 8 1.5z" />
        </svg>
      ),
    },
    {
      id: "x",
      label: "X",
      icon: <XLogo className="w-3 h-3" shiny />,
    },
    {
      id: "threads",
      label: "Threads",
      icon: <ThreadsLogo className="w-3 h-3" shiny />,
    },
  ];

  const activeIndex = options.findIndex((o) => o.id === activePlatform);
  const safeIndex = activeIndex >= 0 ? activeIndex : 0;

  const padClass =
    size === "sm"
      ? "py-1 px-2 text-[11px]"
      : size === "lg"
      ? "py-2 px-3 text-sm"
      : "py-1.5 px-2.5 text-xs";

  return (
    <div
      role="radiogroup"
      aria-label="Platform selection toggle"
      className={`relative grid grid-cols-3 items-center rounded-xl border border-[#2e2e2e] bg-[#0c0c0c] p-1 shadow-inner backdrop-blur-md overflow-hidden select-none ${className}`}
    >
      {/* Sleek Sliding Mechanical Highlight Pill */}
      <div
        className="absolute top-1 bottom-1 rounded-lg bg-gradient-to-r from-[#ff6600] to-[#ff7a18] shadow-[0_0_16px_rgba(255,102,0,0.5)] ring-1 ring-white/30 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-b before:from-white/25 before:to-transparent"
        style={{
          width: "calc((100% - 8px) / 3)",
          left: "4px",
          transform: `translateX(${safeIndex * 100}%)`,
        }}
      />

      {options.map((opt) => {
        const isSelected = activePlatform === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(opt.id)}
            className={`relative z-10 inline-flex items-center justify-center gap-1.5 rounded-lg font-mono font-bold tracking-tight whitespace-nowrap transition-colors duration-200 cursor-pointer ${padClass} ${
              isSelected
                ? "text-black font-extrabold"
                : "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04] active:scale-95"
            }`}
          >
            <span
              className={`transition-all duration-300 ${
                isSelected ? "text-black scale-105" : "text-zinc-300 group-hover:text-white"
              }`}
            >
              {opt.icon}
            </span>
            <span className="truncate">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function XLogo({
  className = "w-3.5 h-3.5",
  shiny = true,
}: {
  className?: string;
  shiny?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`${className} shrink-0 transition-transform duration-300 ${
        shiny ? "drop-shadow-[0_0_4px_rgba(255,255,255,0.7)]" : ""
      }`}
      aria-label="X logo"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function ThreadsLogo({
  className = "w-3.5 h-3.5",
  shiny = true,
}: {
  className?: string;
  shiny?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`${className} shrink-0 transition-transform duration-300 ${
        shiny ? "drop-shadow-[0_0_4px_rgba(255,255,255,0.7)]" : ""
      }`}
      aria-label="Threads logo"
    >
      <path d="M12.186 24C5.467 24 0 18.533 0 11.814 0 5.096 5.467 0 12.186 0c6.643 0 11.867 5.224 11.867 11.867 0 .42-.022.842-.066 1.256h-2.174c.038-.407.058-.82.058-1.256 0-5.362-4.322-9.685-9.685-9.685-5.363 0-9.685 4.323-9.685 9.685 0 5.363 4.322 9.685 9.685 9.685 3.322 0 6.248-1.666 7.973-4.223.364.24.708.51 1.026.809C19.34 21.996 15.992 24 12.186 24zm4.275-10.457c-.126-2.91-1.92-4.908-4.52-4.908-2.673 0-4.66 2.062-4.66 4.845 0 2.809 1.968 4.887 4.71 4.887 1.624 0 3.024-.727 3.864-1.977l1.71 1.294c-1.25 1.832-3.32 2.898-5.574 2.898-3.957 0-6.938-2.955-6.938-7.102 0-4.103 2.94-7.06 6.888-7.06 3.834 0 6.64 2.83 6.772 6.842l-2.252.281zm-4.52 2.705c-1.503 0-2.493-1.09-2.493-2.766 0-1.637.99-2.724 2.493-2.724 1.48 0 2.378 1.087 2.49 2.65-.246 1.638-1.127 2.84-2.49 2.84z" />
    </svg>
  );
}
