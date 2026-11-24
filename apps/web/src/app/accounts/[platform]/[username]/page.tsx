import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  LinkSimple,
  Scales,
  WarningCircle,
  CheckCircle,
} from "@phosphor-icons/react/dist/ssr";
import {
  AccountPayload,
  API_BASE_URL,
  formatClassificationLabel,
  formatVerificationLabel,
} from "@/lib/api";
import { ShareButton } from "@/components/ShareButton";
import { VerifiedTick } from "@/components/VerifiedTick";
import { AutoReportButton } from "@/components/AutoReportButton";
import { TweetEvidenceCard } from "@/components/TweetEvidenceCard";

async function fetchAccount(platform: string, username: string): Promise<AccountPayload | null> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/accounts/${encodeURIComponent(platform)}/${encodeURIComponent(username)}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    return (await res.json()) as AccountPayload;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ platform: string; username: string }>;
}): Promise<Metadata> {
  const { platform, username } = await params;
  const record = await fetchAccount(platform, username);
  if (!record) {
    return {
      title: "Account Not Indexed — AIBlockList",
      description: "This account is not indexed in the AIBlockList public intelligence database.",
    };
  }

  const a = record.account;
  const classification = formatClassificationLabel(a.classification);
  const status = formatVerificationLabel(a.verification_status);
  const title = `@${a.username} (${a.platform.toUpperCase()}) — ${classification} | AIBlockList`;
  const description = `${status} intelligence record. ${a.public_rationale || "Behavioral observation under active policy."} Backed by ${a.evidence_count} canonical evidence URL(s).`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: [{ url: "/logo.png", width: 1200, height: 1200, alt: "AIBlockList Intelligence" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/logo.png"],
    },
  };
}

export default async function AccountDetailPage({
  params,
}: {
  params: Promise<{ platform: string; username: string }>;
}) {
  const { platform, username } = await params;
  const record = await fetchAccount(platform, username);

  if (!record) {
    notFound();
  }

  const a = record.account;

  return (
    <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/directory"
        className="button-sm inline-flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors duration-300 mb-6"
      >
        <ArrowLeft size={14} weight="bold" />
        <span>Back to directory</span>
      </Link>

      {/* Account Header Card */}
      <div className="rounded-2xl border border-[#272727] bg-[#181818] p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="caption-4 rounded border border-[#313131] bg-[#000000] px-2 py-0.5 font-mono uppercase text-zinc-300">
                {a.platform}
              </span>
              <span className="caption-4 rounded border border-[#ff6600]/40 bg-[#131209] px-2.5 py-0.5 font-mono text-[#ff6600]">
                {formatVerificationLabel(a.verification_status)}
              </span>
              <span className="caption-4 rounded border border-[#313131] bg-[#1f1f1f] px-2.5 py-0.5 text-zinc-200">
                {formatClassificationLabel(a.classification)}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-3">
              <h1 className="heading-3 font-mono text-white">@{a.username}</h1>
              <VerifiedTick type={a.verified_badge || "blue"} size={20} />
            </div>
            <p className="caption-4 mt-1 font-mono text-zinc-400">
              Immutable platform ID: {a.platform_account_id || "Unavailable"} · Confidence:{" "}
              {a.identity_confidence}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <AutoReportButton account={record} />
            <ShareButton
              platform={a.platform}
              username={a.username}
              classification={formatClassificationLabel(a.classification)}
              url={`https://aiblocklist.com/accounts/${a.platform}/${a.username}`}
            />
            <a
              href={a.public_profile_url}
              target="_blank"
              rel="noreferrer"
              className="button-sm inline-flex items-center gap-1.5 rounded-lg border border-[#313131] bg-[#1f1f1f] px-3 py-2 text-white hover:bg-[#272727] transition-colors duration-300"
            >
              <span>View public profile</span>
              <ArrowUpRight size={14} weight="bold" />
            </a>
            <Link
              href={`/appeals?username=${encodeURIComponent(a.username)}&platform=${encodeURIComponent(a.platform)}`}
              className="button-sm inline-flex items-center gap-1.5 rounded-lg border border-[#313131] bg-[#1f1f1f] px-3 py-2 text-zinc-200 hover:bg-[#272727] transition-colors duration-300"
            >
              <Scales size={14} weight="bold" />
              <span>File free appeal</span>
            </Link>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-[#272727] bg-[#000000] p-4">
          <p className="caption-3 font-mono uppercase text-zinc-400 mb-1">Public rationale</p>
          <p className="body-5 text-zinc-200">{a.public_rationale}</p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-[#272727] bg-[#1f1f1f] p-3">
            <p className="caption-5 text-zinc-400">Policy version</p>
            <p className="title-4 font-mono text-white mt-0.5">{a.policy_version}</p>
          </div>
          <div className="rounded-xl border border-[#272727] bg-[#1f1f1f] p-3">
            <p className="caption-5 text-zinc-400">Evidence URLs</p>
            <p className="title-4 font-mono text-white mt-0.5">{a.evidence_count}</p>
          </div>
          <div className="rounded-xl border border-[#272727] bg-[#1f1f1f] p-3">
            <p className="caption-5 text-zinc-400">Appeal status</p>
            <p className="title-4 font-mono text-white mt-0.5">{a.appeal_status}</p>
          </div>
          <div className="rounded-xl border border-[#272727] bg-[#1f1f1f] p-3">
            <p className="caption-5 text-zinc-400">Source conflict</p>
            <p className="title-4 font-mono text-white mt-0.5">
              {a.has_source_conflict ? "Preserved" : "None"}
            </p>
          </div>
        </div>
      </div>

      {/* Source Assertions + Evidence */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#272727] bg-[#181818] p-6">
          <h2 className="title-2 text-white mb-4">
            Attributed source assertions ({record.source_assertions.length})
          </h2>
          <div className="space-y-3">
            {record.source_assertions.map((sa, idx) => (
              <div
                key={`${sa.source_slug}-${idx}`}
                className="rounded-xl border border-[#272727] bg-[#000000] p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="title-4 text-white">{sa.source_name}</span>
                  <span
                    className={`caption-5 rounded px-2 py-0.5 font-mono ${
                      sa.verified
                        ? "bg-[#ff6600] text-black"
                        : "border border-[#313131] bg-[#1f1f1f] text-zinc-300"
                    }`}
                  >
                    {sa.verified ? "Core verified" : "Unverified external"}
                  </span>
                </div>
                <p className="caption-4 mt-2 font-mono text-zinc-300">
                  Assertion: {sa.classification}
                </p>
                <p className="caption-5 mt-1 font-mono text-zinc-500">
                  Version {sa.list_version} · Updated {sa.updated_at.slice(0, 10)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#272727] bg-[#181818] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="title-2 text-white">
              Flagged X Tweets &amp; Evidence ({record.evidence.length})
            </h2>
            <span className="caption-5 font-mono text-[#ff6600]">
              Authentic X Thread View
            </span>
          </div>
          {record.evidence.length === 0 ? (
            <div className="rounded-xl border border-[#272727] bg-[#000000] p-4 flex items-start gap-3">
              <WarningCircle size={20} weight="bold" className="text-[#ff6600] shrink-0 mt-0.5" />
              <div>
                <p className="title-4 text-white">No public post URLs attached</p>
                <p className="body-6 mt-1 text-zinc-400">
                  This upstream external entry carries zero public evidence links. Under AIBlockList
                  Policy v1.0.0 it remains held under review and is excluded from core verified spam lists.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {record.evidence.map((ev) => (
                <TweetEvidenceCard
                  key={ev.platform_post_id}
                  evidence={ev}
                  username={a.username}
                  platform={a.platform}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mandatory Disclaimer Footer */}
      <div className="mt-6 rounded-xl border border-[#272727] bg-[#181818] p-4 flex items-start gap-2.5 caption-4 text-zinc-400">
        <CheckCircle size={16} weight="bold" className="text-[#ff6600] shrink-0 mt-0.5" />
        <span>
          {record.meta.disclaimer} Zero raw verbatim post text is archived in our database.
        </span>
      </div>
    </section>
  );
}
