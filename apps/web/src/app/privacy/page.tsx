export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <p className="caption-3 font-mono uppercase text-[#ff6600]">Privacy by architecture</p>
      <h1 className="heading-2 text-white">Privacy notice</h1>
      <div className="rounded-2xl border border-[#272727] bg-[#181818] p-6 sm:p-8 space-y-5 body-3 text-zinc-300">
        <p>
          AIBlockList stores the minimum data necessary to maintain verifiable behavioral trust
          records. We do not archive full third party social media post text, do not accept
          screenshot uploads in MVP, and do not track end user browsing feeds.
        </p>
        <h2 className="title-2 text-white">Public versus private separation</h2>
        <p className="body-6 text-zinc-400">
          Public intelligence exports include only platform identifiers, public handles, canonical
          evidence URLs, SHA-256 content hashes, behavioral metrics, policy versions, and source
          attributions. Reporter identities, rotating salted IP subnet hashes (30 day TTL),
          internal moderator notes, and appeal verification tokens are isolated in private schemas
          and never exposed publicly.
        </p>
        <h2 className="title-2 text-white">Deletion and regulatory rights</h2>
        <p className="body-6 text-zinc-400">
          AIBlockList supports deletion tombstones for removed platform posts, fast track GDPR
          Article 17 erasure and Article 21 objection review, and itemized consent withdrawal
          workflows aligned with India DPDP Rules 2025.
        </p>
      </div>
    </section>
  );
}
