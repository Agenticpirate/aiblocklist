"use client";

import { useState } from "react";
import { Copy, Check } from "@phosphor-icons/react";

const SNIPPETS: Record<"curl" | "typescript" | "python", { label: string; code: string }> = {
  curl: {
    label: "cURL",
    code: `curl -s https://api.aiblocklist.com/api/v1/accounts/x/Cocothe_gb \\
  -H "Accept: application/json" \\
  -H "If-None-Match: W/\\"etag-hash\\""`,
  },
  typescript: {
    label: "TypeScript",
    code: `const res = await fetch(
  "https://api.aiblocklist.com/api/v1/accounts/id/x/2122149957973278720"
);
const { account, evidence, source_assertions } = await res.json();
// Never conflate unverified_external with aiblocklist_core verified`,
  },
  python: {
    label: "Python",
    code: `import httpx

resp = httpx.get(
    "https://api.aiblocklist.com/api/v1/blocklists/x",
    params={"has_evidence": "true", "limit": 100},
)
payload = resp.json()`,
  },
};

export function CodeHandoff() {
  const [tab, setTab] = useState<"curl" | "typescript" | "python">("curl");
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(SNIPPETS[tab].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="rounded-2xl border border-[#272727] bg-[#181818] p-2">
      <div className="flex items-center justify-between gap-2 rounded-lg border border-[#272727] bg-[#1f1f1f] px-3 py-2">
        <div className="flex items-center gap-1">
          {(Object.keys(SNIPPETS) as Array<"curl" | "typescript" | "python">).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`button-xsm rounded-md px-2.5 py-1 transition-colors duration-300 ${
                tab === key
                  ? "bg-[#272727] text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {SNIPPETS[key].label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="button-xsm inline-flex items-center gap-1.5 rounded-md border border-[#313131] bg-[#181818] px-2.5 py-1 text-zinc-300 hover:text-white transition-colors duration-300"
        >
          {copied ? <Check size={13} weight="bold" className="text-[#ff6600]" /> : <Copy size={13} weight="bold" />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <pre className="mt-2 overflow-x-auto rounded-lg border border-[#272727] bg-[#000000] p-4 font-mono caption-4 text-zinc-200 leading-6">
        {SNIPPETS[tab].code}
      </pre>
    </div>
  );
}
