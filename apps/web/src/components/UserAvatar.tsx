"use client";

import { useState } from "react";

interface UserAvatarProps {
  username: string;
  platform?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function UserAvatar({
  username,
  platform = "x",
  size = "md",
  className = "",
}: UserAvatarProps) {
  const [hasError, setHasError] = useState(false);
  const cleanUser = username.replace(/^@/, "").trim();
  const initial = (cleanUser[0] || "?").toUpperCase();

  const sizeClasses =
    size === "sm"
      ? "w-8 h-8 text-xs"
      : size === "lg"
      ? "w-12 h-12 text-base"
      : "w-10 h-10 text-sm";

  // unavatar.io provides live Twitter/X and Threads profile photos
  const avatarUrl =
    platform === "threads"
      ? `https://unavatar.io/threads/${cleanUser}`
      : `https://unavatar.io/x/${cleanUser}`;

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full border border-[#333] bg-[#1a1a1a] select-none ${sizeClasses} ${className}`}
    >
      {!hasError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt={`@${cleanUser}'s profile picture`}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
          className="h-full w-full object-cover rounded-full"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-[#252525] to-[#3a3a3a] font-mono font-bold text-white shadow-inner">
          {initial}
        </div>
      )}
    </div>
  );
}