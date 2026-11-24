"use client";

import { useState } from "react";
import { ShieldWarning } from "@phosphor-icons/react";
import { AccountPayload } from "@/lib/api";
import { PlatformReportModal } from "./PlatformReportModal";

interface AutoReportButtonProps {
  account: AccountPayload;
  className?: string;
}

export function AutoReportButton({ account, className }: AutoReportButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ||
          "button-sm inline-flex items-center gap-1.5 rounded-lg border border-[#ff6600]/40 bg-[#ff6600]/15 px-3 py-2 font-mono font-bold text-[#ff6600] hover:bg-[#ff6600] hover:text-black transition-all cursor-pointer shadow-md shadow-[#ff6600]/10"
        }
        title="Auto-Report this account to platform abuse desks"
      >
        <ShieldWarning size={16} weight="bold" />
        <span>Report to Platform</span>
      </button>

      {open && <PlatformReportModal account={account} onClose={() => setOpen(false)} />}
    </>
  );
}
