import Link from "next/link";
import {
  DownloadSimple,
  ShieldCheck,
  CheckCircle,
  Eye,
  SlidersHorizontal,
  LockKey,
  ArrowRight,
} from "@phosphor-icons/react/dist/ssr";

export const metadata = {
  title: "Browser Extension (Manifest V3) — AIBlockList",
  description:
    "Local-first browser extension for Chrome, Brave, Edge, and Firefox. Flags automated spam bots in real time on X and Threads.",
};

export default function ExtensionPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="max-w-[720px]">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#272727] bg-[#181818] px-3 py-1">
          <span className="h-2 w-2 rounded-full bg-[#ff6600]" />
          <span className="caption-4 font-mono text-zinc-300">
            Manifest V3 · Chrome, Brave, Edge & Firefox Supported
          </span>
        </div>
        <h1 className="heading-2 text-white">AIBlockList Browser Extension</h1>
        <p className="body-3 mt-4 text-zinc-400">
          Clean social feeds without privacy compromises. Instantly visualizes verified automated
          spam bots on X and Threads using local-first intelligence — zero telemetry, zero automated
          clicks, and zero mass-blocking scripts.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <a
            href="/aiblocklist-extension-v1.0.0.zip"
            download
            className="button-md inline-flex items-center gap-2 rounded-lg bg-[#ff6600] px-4 py-2 text-black hover:bg-[#e55c00] font-bold transition-all"
          >
            <DownloadSimple size={18} weight="bold" />
            <span>Download Extension (.zip)</span>
          </a>
          <span className="caption-4 font-mono text-zinc-500">v1.0.0 · Packaged MV3</span>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-[#272727] bg-[#181818] p-6 space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#313131] bg-[#000000] text-[#ff6600]">
            <LockKey size={20} weight="bold" />
          </div>
          <h2 className="title-2 text-white">Local-First & Private</h2>
          <p className="body-5 text-zinc-400">
            Synchronizes the verified blocklist to your local browser storage once every 6 hours.
            Your browsing history is never transmitted to our servers.
          </p>
        </div>

        <div className="rounded-2xl border border-[#272727] bg-[#181818] p-6 space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#313131] bg-[#000000] text-[#ff6600]">
            <ShieldCheck size={20} weight="bold" />
          </div>
          <h2 className="title-2 text-white">Account Safety Compliant</h2>
          <p className="body-5 text-zinc-400">
            Never executes automated DOM clicking or background block scripts that could violate
            platform terms of service or risk user account restrictions.
          </p>
        </div>

        <div className="rounded-2xl border border-[#272727] bg-[#181818] p-6 space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#313131] bg-[#000000] text-[#ff6600]">
            <SlidersHorizontal size={20} weight="bold" />
          </div>
          <h2 className="title-2 text-white">3 Action Modes</h2>
          <p className="body-5 text-zinc-400">
            Choose how detected bots appear: subtle warning badges, dimmed reply visibility, or
            prominent red highlight borders on suspicious comment threads.
          </p>
        </div>
      </div>

      {/* How It Looks in Feed */}
      <div className="rounded-2xl border border-[#272727] bg-[#181818] p-6 sm:p-8 space-y-6">
        <h2 className="heading-3 text-white">How It Appears in Social Feeds</h2>
        <div className="rounded-xl border border-[#272727] bg-[#000000] p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-zinc-800 shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-white text-sm">Tech Influencer</span>
                <span className="text-zinc-500 font-mono text-xs">@creator</span>
              </div>
              <p className="body-5 text-zinc-300">
                What are the best open source developer tools you discovered this month?
              </p>
            </div>
          </div>

          <div className="ml-8 border-l-2 border-[#272727] pl-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-zinc-800 shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-white text-sm">GrowthCrypto_AI</span>
                  <span className="text-zinc-500 font-mono text-xs">@growth_bot</span>
                  <span className="rounded border border-[#ff6600]/50 bg-[#131209] px-2 py-0.5 font-mono text-[11px] font-bold text-[#ff6600] inline-flex items-center gap-1">
                    ⚠ AI Spam
                  </span>
                </div>
                <p className="body-6 text-zinc-400 italic">
                  [Dimmed / Flagged: Matched SIG-01 near-duplicate copy across 14 unrelated threads]
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Installation Guide */}
      <div className="rounded-2xl border border-[#272727] bg-[#181818] p-6 sm:p-8 space-y-6">
        <h2 className="heading-3 text-white">Quick Installation Guide (Chrome / Brave / Edge)</h2>
        <ol className="space-y-4 font-mono caption-4 text-zinc-300 list-decimal list-inside">
          <li className="p-3 rounded-lg border border-[#272727] bg-[#000000]">
            <span className="text-white font-bold">Download and extract:</span> Download{" "}
            <a href="/aiblocklist-extension-v1.0.0.zip" className="text-[#ff6600] underline">
              aiblocklist-extension-v1.0.0.zip
            </a>{" "}
            and unzip it to a folder.
          </li>
          <li className="p-3 rounded-lg border border-[#272727] bg-[#000000]">
            <span className="text-white font-bold">Open extensions page:</span> In Chrome or Brave,
            navigate to <code className="text-[#ff6600]">chrome://extensions</code>.
          </li>
          <li className="p-3 rounded-lg border border-[#272727] bg-[#000000]">
            <span className="text-white font-bold">Enable Developer Mode:</span> Toggle the switch in
            the top right corner.
          </li>
          <li className="p-3 rounded-lg border border-[#272727] bg-[#000000]">
            <span className="text-white font-bold">Load Unpacked:</span> Click &quot;Load unpacked&quot;
            and select the extracted extension folder.
          </li>
        </ol>
      </div>
    </div>
  );
}
