import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { FooterAscii } from "@/components/FooterAscii";

export const metadata: Metadata = {
  title: "AIBlockList — Open Source Behavioral Trust and Safety Infrastructure",
  description:
    "Identify, verify, and filter abusive automated social media spam using public behavioral evidence, human dual review, and free independent appeals.",
  openGraph: {
    title: "AIBlockList — Identify. Verify. Filter.",
    description:
      "Open source trust and safety infrastructure separating abusive automation from genuine human and AI assisted communication.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} dark`}>
      <body className="min-h-screen bg-[#000000] text-zinc-100 antialiased selection:bg-[#ff6600] selection:text-black">
        <Navbar />
        <main id="main-content" className="pt-24">
          {children}
        </main>
        <FooterAscii />
      </body>
    </html>
  );
}
