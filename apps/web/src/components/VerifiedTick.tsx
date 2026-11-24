"use client";

interface VerifiedTickProps {
  className?: string;
  type?: "blue" | "gold" | "grey" | string;
  title?: string;
  size?: number;
}

export function VerifiedTick({
  className = "",
  type = "blue",
  title = "Blue check on 𝕏 (𝕏 Premium). Shown by 𝕏, not by this list.",
  size = 16,
}: VerifiedTickProps) {
  const normType =
    type === "gold" || type === "g"
      ? "gold"
      : type === "grey" || type === "s"
      ? "grey"
      : "blue";

  const color =
    normType === "gold"
      ? "#e2b719"
      : normType === "grey"
      ? "#829aab"
      : "#1d9bf0";

  return (
    <svg
      className={`vchk shrink-0 select-none ${className}`}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      role="img"
      aria-label={title}
      style={{
        color,
        display: "inline-block",
        verticalAlign: "-0.15em",
        marginLeft: "0.25em",
        flex: "none",
      }}
    >
      <title>{title}</title>
      <path
        d="M12 1.5l2.6 1.9 3.2-.1 1 3.1 2.6 1.9-1 3.1 1 3.1-2.6 1.9-1 3.1-3.2-.1L12 22.5l-2.6-1.9-3.2.1-1-3.1-2.6-1.9 1-3.1-1-3.1 2.6-1.9 1-3.1 3.2.1z"
        fill="currentColor"
      />
      <path
        d="M7.8 12.3l2.9 2.9 5.5-5.8"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
