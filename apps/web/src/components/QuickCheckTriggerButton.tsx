"use client";

import { useState } from "react";
import { ShieldCheck } from "@phosphor-icons/react";
import { QuickCheckModal } from "./QuickCheckModal";

export function QuickCheckTriggerButton({
  className = "",
  label = "Am I Blocked?",
}: {
  className?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`button-sm inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#ff6600]/40 bg-[#131209] px-3.5 py-2.5 font-mono text-xs text-[#ff6600] font-bold hover:bg-[#ff6600] hover:text-black active:scale-[0.98] transition-all whitespace-nowrap cursor-pointer ${className}`}
        title="Check if your account is listed on AIBlockList or blocked upstream"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[#ff6600] animate-pulse" />
        <span>{label}</span>
      </button>

      <QuickCheckModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}