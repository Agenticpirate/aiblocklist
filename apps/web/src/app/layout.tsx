import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { FooterAscii } from "@/components/FooterAscii";
import { CommunityNoticeBanner } from "@/components/CommunityNoticeBanner";
import { WebMcpProvider } from "@/components/WebMcpProvider";

export const metadata: Metadata = {
  metadataBase: new URL("https://aiblocklist.com"),
  title: {
    default: "AIBlockList — Filter AI Bot Replies & Keep Feeds Human",
    template: "%s | AIBlockList",
  },
  description:
    "Filter AI bot replies on X and Threads to keep your feed human. Public behavioral evidence, transparent appeals, and open-source spam protection.",
  keywords: [
    "AIBlockList",
    "AI bot blocklist",
    "X spam filter",
    "Twitter AI reply bot list",
    "Threads spam filter",
    "account reach checker",
    "behavioral spam verification",
    "use AI wisely",
    "open source trust and safety",
  ],
  authors: [{ name: "AIBlockList Contributors", url: "https://aiblocklist.com" }],
  creator: "AIBlockList",
  publisher: "AIBlockList",
  alternates: {
    canonical: "https://aiblocklist.com",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/logo.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/logo.png",
  },
  openGraph: {
    title: "AIBlockList — Filter Automated AI Bot Replies & Keep Feeds Human",
    description:
      "Using AI in everyday work is great — we only filter automated reply bots farming impressions and monetization. Open-source behavioral intelligence for X and Threads.",
    url: "https://aiblocklist.com",
    siteName: "AIBlockList",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-banner.png?v=2",
        width: 1600,
        height: 840,
        alt: "AIBlockList — Filter AI Bot Replies. Keep Your Feed Human.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AIBlockList — Filter Automated AI Bot Replies & Keep Feeds Human",
    description:
      "Open-source behavioral trust and safety registry for X and Threads. Protecting responsible AI users while filtering automated reply spam.",
    images: [
      {
        url: "/og-banner.png?v=2",
        alt: "AIBlockList — Filter AI Bot Replies. Keep Your Feed Human.",
      },
    ],
  },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://aiblocklist.com/#organization",
      name: "AIBlockList",
      description:
        "Open-source behavioral trust and safety infrastructure identifying automated reply spam across X and Meta Threads while protecting people who use AI responsibly.",
      url: "https://aiblocklist.com",
      logo: {
        "@type": "ImageObject",
        url: "https://aiblocklist.com/logo.png",
      },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "technical support",
        email: "contact@aiblocklist.com",
        url: "https://aiblocklist.com/contact",
        availableLanguage: ["English"],
      },
      address: {
        "@type": "PostalAddress",
        addressLocality: "San Francisco",
        addressRegion: "CA",
        addressCountry: "US",
      },
      knowsAbout: [
        "AIBlockList AI bot blocklist",
        "AIBlockList X spam filter",
        "Automated reply bot detection",
        "Behavioral spam verification",
      ],
      sameAs: [
        "https://github.com/Agenticpirate/aiblocklist",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://aiblocklist.com/#website",
      url: "https://aiblocklist.com",
      name: "AIBlockList",
      description:
        "Open-source behavioral trust and safety infrastructure filtering automated reply bots on X and Threads while protecting people who use AI wisely.",
      publisher: { "@id": "https://aiblocklist.com/#organization" },
      potentialAction: {
        "@type": "SearchAction",
        target: "https://aiblocklist.com/directory?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Dataset",
      "@id": "https://aiblocklist.com/#dataset",
      name: "AIBlockList Behavioral Bot & Spam Registry",
      description:
        "Public, evidence-backed registry of automated reply bot accounts across X and Meta Threads verified using deterministic behavioral signals SIG-01 through SIG-05.",
      url: "https://aiblocklist.com/api/v1/blocklists",
      license: "https://opendatacommons.org/licenses/by/1-0/",
      creator: { "@id": "https://aiblocklist.com/#organization" },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} dark`}>
      <body className="min-h-screen bg-[#000000] text-zinc-100 antialiased selection:bg-[#ff6600] selection:text-black">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
        <Navbar />
        <main id="main-content" className="pt-16 sm:pt-24">
          {children}
        </main>
        <FooterAscii />
        <CommunityNoticeBanner />
        <WebMcpProvider />
      </body>
    </html>
  );
}
