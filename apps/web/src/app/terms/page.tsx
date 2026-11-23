export default function TermsPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <p className="caption-3 font-mono uppercase text-[#ff6600]">Governance charter</p>
      <h1 className="heading-2 text-white">Terms and open source charter</h1>
      <div className="rounded-2xl border border-[#272727] bg-[#181818] p-6 sm:p-8 space-y-5 body-3 text-zinc-300">
        <p>
          AIBlockList source code is licensed under Apache License 2.0. Verified public dataset
          exports are published under Open Data Commons Attribution License 1.0 (ODC-By 1.0).
          Third party external lists retain their original upstream attribution and are marked
          unverified external until independently reviewed.
        </p>
        <h2 className="title-2 text-white">Immutable charter red lines</h2>
        <ul className="list-disc pl-5 space-y-2 body-6 text-zinc-400">
          <li>Never sell private user data, reporter identities, IP logs, or unverified accusations.</li>
          <li>Never charge fees to appeal or delist an account.</li>
          <li>Never paywall the core public database, transparency ledger, or open source code.</li>
        </ul>
        <h2 className="title-2 text-white">Observation disclaimer</h2>
        <p className="body-6 text-zinc-400">
          Every classification reflects observable behavioral patterns evaluated under a versioned
          public policy. Listings are not assertions of AI authorship or native platform rule
          violations.
        </p>
      </div>
    </section>
  );
}
