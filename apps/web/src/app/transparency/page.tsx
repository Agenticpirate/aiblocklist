import { ShieldCheck, CheckCircle, Database } from "@phosphor-icons/react/dist/ssr";
import { API_BASE_URL, SourceInfo, TransparencyResponse } from "@/lib/api";

async function loadTransparency(): Promise<{
  ledger: TransparencyResponse | null;
  sources: SourceInfo[];
}> {
  try {
    const [tRes, sRes] = await Promise.all([
      fetch(`${API_BASE_URL}/transparency`, { cache: "no-store" }),
      fetch(`${API_BASE_URL}/sources`, { cache: "no-store" }),
    ]);
    const ledger = tRes.ok ? ((await tRes.json()) as TransparencyResponse) : null;
    const sourcesJson = sRes.ok ? ((await sRes.json()) as { sources: SourceInfo[] }) : { sources: [] };
    return { ledger, sources: sourcesJson.sources };
  } catch {
    return { ledger: null, sources: [] };
  }
}

export default async function TransparencyPage() {
  const { ledger, sources } = await loadTransparency();
  const totals = ledger?.statistics.totals;
  const integrity = ledger?.audit_integrity;

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div className="max-w-[680px]">
        <p className="caption-3 font-mono uppercase text-[#ff6600] mb-2">
          Live public accountability
        </p>
        <h1 className="heading-2 text-white">Transparency and audit ledger</h1>
        <p className="body-3 mt-3 text-zinc-400">
          Every classification, external ingestion run, and appeal resolution commits to an append
          only SHA-256 hash chain. Private reporter and moderator identities are never published here.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total indexed accounts", value: totals?.indexed_accounts ?? 0 },
          { label: "Core human verified", value: totals?.aiblocklist_core_verified ?? 0 },
          { label: "External unverified assertions", value: totals?.unverified_external_assertions ?? 0 },
          { label: "Silent external (0 URLs)", value: totals?.silent_external_entries_zero_urls ?? 0 },
          { label: "Accounts with public URLs", value: totals?.accounts_with_public_evidence_urls ?? 0 },
          { label: "Meeting 2+ URL threshold", value: totals?.accounts_meeting_2_url_threshold ?? 0 },
          { label: "Tombstoned deleted posts", value: totals?.tombstoned_deleted_references ?? 0 },
          { label: "Preserved source conflicts", value: totals?.source_conflicts_preserved ?? 0 },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-[#272727] bg-[#181818] p-5">
            <p className="caption-4 text-zinc-400">{stat.label}</p>
            <p className="heading-4 font-mono text-white mt-2">{stat.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Cryptographic Audit Integrity */}
      <div
        id="audit-chain"
        className="rounded-2xl border border-[#272727] bg-[#181818] p-6 sm:p-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} weight="bold" className="text-[#ff6600]" />
            <h2 className="title-1 text-white">Cryptographic audit chain verification</h2>
          </div>
          <span className="caption-3 rounded-md border border-[#ff6600]/40 bg-[#131209] px-2.5 py-1 font-mono text-[#ff6600]">
            {integrity?.chain_verified ? "CHAIN VERIFIED" : "UNAVAILABLE"}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-[#272727] bg-[#000000] p-4">
            <p className="caption-5 text-zinc-400">Latest Merkle root (SHA-256)</p>
            <p className="caption-4 mt-1 font-mono text-zinc-200 break-all">
              {integrity?.latest_merkle_root_sha256 || "Not computed"}
            </p>
          </div>
          <div className="rounded-xl border border-[#272727] bg-[#000000] p-4">
            <p className="caption-5 text-zinc-400">Total append only audit entries</p>
            <p className="title-2 mt-1 font-mono text-white">
              {(integrity?.total_audit_records ?? 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Federated Source Registry */}
      <div className="rounded-2xl border border-[#272727] bg-[#181818] p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-4">
          <Database size={20} weight="bold" className="text-[#ff6600]" />
          <h2 className="title-1 text-white">Source federation registry</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#272727] caption-4 font-mono text-zinc-400">
                <th className="py-3 pr-4">Source</th>
                <th className="py-3 pr-4">Maintainer</th>
                <th className="py-3 pr-4">License</th>
                <th className="py-3 pr-4">Records</th>
                <th className="py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#272727] body-5">
              {sources.map((s) => (
                <tr key={s.slug}>
                  <td className="py-3 pr-4 text-white">{s.display_name}</td>
                  <td className="py-3 pr-4 font-mono text-zinc-400">{s.maintainer_handle || "—"}</td>
                  <td className="py-3 pr-4 font-mono text-zinc-400">{s.license_spdx || "Unspecified"}</td>
                  <td className="py-3 pr-4 font-mono text-white">{s.record_count.toLocaleString()}</td>
                  <td className="py-3 font-mono caption-4 text-[#ff6600]">
                    {s.slug === "aiblocklist_core" ? "Core verified" : "Isolated external"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Three Immutable Charter Red Lines */}
      <div className="rounded-2xl border border-[#272727] bg-[#181818] p-6 sm:p-8">
        <h2 className="title-1 text-white mb-4">Three immutable charter red lines</h2>
        <ul className="space-y-3">
          {(ledger?.charter_red_lines || []).map((line) => (
            <li key={line} className="flex items-start gap-2.5 body-5 text-zinc-200">
              <CheckCircle size={18} weight="bold" className="mt-0.5 shrink-0 text-[#ff6600]" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
