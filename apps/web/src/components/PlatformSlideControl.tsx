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
      viewBox="0 0 192 192"
      fill="currentColor"
      className={`${className} shrink-0 transition-transform duration-300 ${
        shiny ? "drop-shadow-[0_0_4px_rgba(255,255,255,0.7)]" : ""
      }`}
      aria-label="Threads logo"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 149.184 38.788C154.894 45.8136 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 27.974C147.036 9.60668 125.202 0.195148 97.0695 0H96.9569C68.8816 0.19447 47.2921 9.6418 32.7883 28.0793C19.8819 44.4864 13.2244 67.3157 13.0007 95.9325L13 96L13.0007 96.0675C13.2244 124.684 19.8819 147.514 32.7883 163.921C47.2921 182.358 68.8816 191.806 96.9569 192H97.0695C122.03 191.827 139.624 185.292 154.118 170.811C173.081 151.866 172.51 128.119 166.26 113.541C161.776 103.087 153.227 94.5962 141.537 88.9883ZM98.4405 129.507C88.0005 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5234 102.976 98.468 104.871 98.468C111.106 98.468 116.939 99.0737 122.242 100.233C120.264 124.935 108.662 128.946 98.4405 129.507Z"
      />
    </svg>
  );
}
