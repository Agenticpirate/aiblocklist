import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock, CheckCircle, Scales, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { BLOG_ARTICLES, getArticleBySlug } from "@/data/blogArticles";

export function generateStaticParams() {
  return BLOG_ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: "Article Not Found" };

  return {
    title: article.title,
    description: article.metaDescription,
    keywords: article.keywords,
    alternates: { canonical: `https://aiblocklist.com/blog/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.metaDescription,
      url: `https://aiblocklist.com/blog/${article.slug}`,
      type: "article",
      publishedTime: article.publishedAt,
      images: [{ url: article.bannerImage, width: 1200, height: 630, alt: article.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.metaDescription,
      images: [article.bannerImage],
    },
  };
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const related = BLOG_ARTICLES.filter((a) => a.slug !== article.slug).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: article.title,
        description: article.metaDescription,
        image: `https://aiblocklist.com${article.bannerImage}`,
        datePublished: article.publishedAt,
        dateModified: article.publishedAt,
        author: { "@type": "Organization", name: "AIBlockList", url: "https://aiblocklist.com" },
        publisher: {
          "@type": "Organization",
          name: "AIBlockList",
          logo: { "@type": "ImageObject", url: "https://aiblocklist.com/logo.png" },
        },
        mainEntityOfPage: `https://aiblocklist.com/blog/${article.slug}`,
        keywords: article.keywords.join(", "),
      },
      ...(article.faqs.length > 0
        ? [
            {
              "@type": "FAQPage",
              mainEntity: article.faqs.map((f) => ({
                "@type": "Question",
                name: f.question,
                acceptedAnswer: { "@type": "Answer", text: f.answer },
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <article className="mx-auto max-w-6xl px-4 py-6 sm:py-10 sm:px-6 lg:px-8 space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb & Back */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-zinc-400 hover:text-[#ff6600] transition-colors"
        >
          <ArrowLeft size={13} weight="bold" />
          <span>Back to all research articles</span>
        </Link>
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="rounded border border-[#ff6600]/40 bg-[#131209] px-2.5 py-0.5 text-[#ff6600] font-bold">
            {article.category}
          </span>
          <span className="inline-flex items-center gap-1 text-zinc-400">
            <Clock size={12} weight="bold" />
            {article.readTime}
          </span>
          <span className="text-zinc-500">· {article.publishedAt}</span>
        </div>
      </div>

      {/* Article Header + Banner */}
      <header className="space-y-5">
        <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-white max-w-4xl leading-tight">
          {article.title}
        </h1>
        <p className="body-4 text-zinc-400 max-w-3xl leading-relaxed">
          {article.metaDescription}
        </p>
        <div className="overflow-hidden rounded-2xl border border-[#272727] bg-[#0a0a0a]">
          <img
            src={article.bannerImage}
            alt={article.title}
            className="w-full h-auto object-cover"
          />
        </div>
      </header>

      {/* Main 2-Column Editorial Layout (Prose + Side Visual Card) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-8">
          {/* TL;DR Box */}
          <div className="rounded-2xl border border-[#ff6600]/30 bg-[#131209] p-5 space-y-1.5">
            <span className="caption-4 font-mono uppercase text-[#ff6600] font-bold">
              Executive Summary (TL;DR)
            </span>
            <p className="body-5 text-zinc-200 leading-relaxed">{article.tldr}</p>
          </div>

          {/* Article Sections */}
          {article.sections.map((sec) => (
            <section key={sec.heading} className="space-y-3.5">
              <h2 className="text-xl sm:text-2xl font-semibold text-white">
                {sec.heading}
              </h2>
              {sec.paragraphs.map((p, idx) => (
                <p key={idx} className="body-4 text-zinc-300 leading-relaxed">
                  {p}
                </p>
              ))}
              {sec.bullets && (
                <ul className="space-y-2 pt-1">
                  {sec.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2.5 body-5 text-zinc-300">
                      <CheckCircle size={16} weight="bold" className="text-[#ff6600] shrink-0 mt-1" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
              {sec.callout && (
                <div className="rounded-xl border border-[#272727] bg-[#141414] p-4 space-y-1">
                  <p className="font-mono text-xs font-bold uppercase text-[#ff6600]">
                    {sec.callout.title}
                  </p>
                  <p className="body-5 text-zinc-300">{sec.callout.body}</p>
                </div>
              )}
            </section>
          ))}

          {/* FAQ Section */}
          {article.faqs.length > 0 && (
            <section className="rounded-2xl border border-[#272727] bg-[#141414] p-5 space-y-4">
              <h2 className="title-2 text-white">Frequently Asked Questions</h2>
              <div className="space-y-3">
                {article.faqs.map((faq) => (
                  <div key={faq.question} className="border-t border-[#222] pt-3 first:border-t-0 first:pt-0">
                    <h3 className="title-4 text-white">{faq.question}</h3>
                    <p className="body-5 text-zinc-400 mt-1 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sticky Side Infographic & Action Card */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
          <figure className="rounded-2xl border border-[#272727] bg-[#141414] overflow-hidden">
            <img
              src={article.diagramImage}
              alt={article.diagramCaption}
              className="w-full h-auto"
            />
            <figcaption className="p-3.5 caption-4 text-zinc-400 border-t border-[#222]">
              {article.diagramCaption}
            </figcaption>
          </figure>

          <div className="rounded-2xl border border-[#272727] bg-[#141414] p-4 space-y-3">
            <h3 className="title-4 text-white">Explore AIBlockList Tools</h3>
            <div className="space-y-2 font-mono text-xs">
              <Link
                href="/account-health"
                className="flex items-center justify-between rounded-xl border border-[#272727] bg-[#0a0a0a] px-3 py-2 text-zinc-200 hover:border-[#ff6600] hover:text-[#ff6600] transition-colors"
              >
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck size={14} weight="bold" className="text-[#ff6600]" />
                  Check Account Reach
                </span>
                <ArrowRight size={12} weight="bold" />
              </Link>
              <Link
                href="/appeals"
                className="flex items-center justify-between rounded-xl border border-[#272727] bg-[#0a0a0a] px-3 py-2 text-zinc-200 hover:border-[#ff6600] hover:text-[#ff6600] transition-colors"
              >
                <span className="inline-flex items-center gap-1.5">
                  <Scales size={14} weight="bold" className="text-[#ff6600]" />
                  Submit Public Appeal
                </span>
                <ArrowRight size={12} weight="bold" />
              </Link>
              <Link
                href="/methodology"
                className="flex items-center justify-between rounded-xl border border-[#272727] bg-[#0a0a0a] px-3 py-2 text-zinc-200 hover:border-[#ff6600] hover:text-[#ff6600] transition-colors"
              >
                <span>SIG-01 to SIG-05 Criteria</span>
                <ArrowRight size={12} weight="bold" />
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {/* Related Articles */}
      <section className="border-t border-[#272727] pt-8 space-y-4">
        <h2 className="title-2 text-white">More from AIBlockList Research</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {related.map((item) => (
            <Link
              key={item.slug}
              href={`/blog/${item.slug}`}
              className="group rounded-xl border border-[#272727] bg-[#141414] overflow-hidden hover:border-[#ff6600]/60 transition-colors"
            >
              <div className="aspect-[1200/630] overflow-hidden border-b border-[#222]">
                <img src={item.bannerImage} alt={item.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-3.5 space-y-1">
                <span className="font-mono text-[10px] text-[#ff6600] uppercase">{item.category}</span>
                <h3 className="title-4 text-white group-hover:text-[#ff6600] line-clamp-2">
                  {item.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}
