import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock } from "@phosphor-icons/react/dist/ssr";
import { BLOG_ARTICLES } from "@/data/blogArticles";

export const metadata: Metadata = {
  title: "AIBlockList Research & Blog — Keeping Social Feeds Human",
  description:
    "In-depth market audits, platform policy guides, and behavioral research on AI reply bots, ad-revenue farming, ESL fairness, and healthy online conversations.",
  alternates: { canonical: "https://aiblocklist.com/blog" },
  openGraph: {
    title: "AIBlockList Research & Blog — Keeping Social Feeds Human",
    description:
      "Market audits and research on how AI reply bots abuse social monetization and how to protect human conversations.",
    url: "https://aiblocklist.com/blog",
    type: "website",
    images: [{ url: "/og-banner.png?v=2", width: 1600, height: 840 }],
  },
};

export default function BlogIndexPage() {
  const [featured, ...rest] = BLOG_ARTICLES;

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:py-10 sm:px-6 lg:px-8 space-y-8">
      <div className="max-w-3xl space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#272727] bg-[#181818] px-3 py-1">
          <BookOpen size={13} weight="bold" className="text-[#ff6600]" />
          <span className="caption-4 font-mono text-zinc-300">
            Research, Market Audits &amp; Platform Policy
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-white">
          AIBlockList Research &amp; Blog
        </h1>
        <p className="body-5 text-zinc-400 leading-relaxed">
          Deep dives into how automated AI reply bots exploit social monetization, why keeping feeds
          human matters for healthy conversation, and how platforms and creators can fight back
          without penalizing everyday AI users.
        </p>
      </div>

      {/* Featured Lead Article */}
      {featured && (
        <Link
          href={`/blog/${featured.slug}`}
          className="group grid grid-cols-1 lg:grid-cols-12 gap-5 rounded-2xl border border-[#272727] bg-[#121212] p-4 sm:p-6 hover:border-[#ff6600]/60 transition-colors"
        >
          <div className="lg:col-span-6 overflow-hidden rounded-xl border border-[#222]">
            <img
              src={featured.bannerImage}
              alt={featured.title}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            />
          </div>
          <div className="lg:col-span-6 flex flex-col justify-between space-y-3">
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                <span className="rounded border border-[#ff6600]/40 bg-[#131209] px-2 py-0.5 text-[#ff6600] font-bold">
                  {featured.category}
                </span>
                <span className="inline-flex items-center gap-1 text-zinc-500">
                  <Clock size={12} weight="bold" />
                  {featured.readTime}
                </span>
                <span className="text-zinc-600">·</span>
                <span className="text-zinc-500">{featured.publishedAt}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold text-white group-hover:text-[#ff6600] transition-colors">
                {featured.title}
              </h2>
              <p className="body-6 text-zinc-400 leading-relaxed line-clamp-3">
                {featured.tldr}
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[#ff6600]">
              <span>Read full audit</span>
              <ArrowRight size={13} weight="bold" className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </Link>
      )}

      {/* Remaining Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {rest.map((article) => (
          <Link
            key={article.slug}
            href={`/blog/${article.slug}`}
            className="group flex flex-col justify-between rounded-2xl border border-[#272727] bg-[#141414] overflow-hidden hover:border-[#ff6600]/60 transition-colors"
          >
            <div>
              <div className="aspect-[1200/630] w-full overflow-hidden border-b border-[#222] bg-[#0a0a0a]">
                <img
                  src={article.bannerImage}
                  alt={article.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                />
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between gap-2 font-mono text-[11px]">
                  <span className="rounded border border-[#ff6600]/30 bg-[#131209] px-2 py-0.5 text-[#ff6600] font-semibold">
                    {article.category}
                  </span>
                  <span className="text-zinc-500">{article.readTime}</span>
                </div>
                <h2 className="title-3 text-white group-hover:text-[#ff6600] transition-colors line-clamp-2">
                  {article.title}
                </h2>
                <p className="caption-2 text-zinc-400 line-clamp-3 leading-relaxed">
                  {article.metaDescription}
                </p>
              </div>
            </div>
            <div className="px-4 pb-4 pt-1 flex items-center justify-between font-mono text-[11px] text-zinc-500">
              <span>{article.publishedAt}</span>
              <span className="inline-flex items-center gap-1 text-[#ff6600] font-semibold">
                Read <ArrowRight size={11} weight="bold" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
