import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const allowAll = ["/"];
  const disallowInternal = ["/api/avatar", "/_next/"];

  return {
    rules: [
      {
        userAgent: [
          "*",
          "Googlebot",
          "Bingbot",
          "Twitterbot",
          "OAI-SearchBot",
          "GPTBot",
          "ChatGPT-User",
          "ClaudeBot",
          "anthropic-ai",
          "PerplexityBot",
          "Google-Extended",
          "Applebot-Extended",
          "cohere-ai",
        ],
        allow: allowAll,
        disallow: disallowInternal,
      },
    ],
    sitemap: "https://aiblocklist.com/sitemap.xml",
    host: "https://aiblocklist.com",
  };
}
