import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { FooterAscii } from "@/components/FooterAscii";

export const metadata: Metadata = {
  metadataBase: new URL("https://aiblocklist.com"),
  title: "AIBlockList — Open Source Behavioral Trust and Safety Infrastructure",
  description:
    "Identify and filter automated social media spam while protecting people who use AI responsibly, backed by public behavioral evidence and transparent appeals.",
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
    title: "AIBlockList — Identify. Verify. Filter.",
    description:
      "Open source trust and safety infrastructure separating abusive automation from genuine human and AI assisted communication.",
    type: "website",
    images: [{ url: "/logo.png", width: 1200, height: 1200, alt: "AIBlockList Logo" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} dark`}>
      <body className="min-h-screen bg-[#000000] text-zinc-100 antialiased selection:bg-[#ff6600] selection:text-black">
        <Navbar />
        <main id="main-content" className="pt-16 sm:pt-24">
          {children}
        </main>
        <FooterAscii />
      </body>
    </html>
  );
}
