import type { MetadataRoute } from "next";

const BASE_URL = "https://aiblocklist.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const routes: Array<{
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  }> = [
    { path: "", changeFrequency: "hourly", priority: 1.0 },
    { path: "/directory", changeFrequency: "hourly", priority: 0.9 },
    { path: "/account-health", changeFrequency: "daily", priority: 0.9 },
    { path: "/appeals", changeFrequency: "daily", priority: 0.85 },
    { path: "/report", changeFrequency: "daily", priority: 0.8 },
    { path: "/methodology", changeFrequency: "weekly", priority: 0.85 },
    { path: "/transparency", changeFrequency: "daily", priority: 0.8 },
    { path: "/api-docs", changeFrequency: "weekly", priority: 0.8 },
    { path: "/developers", changeFrequency: "weekly", priority: 0.85 },
    { path: "/mcp", changeFrequency: "weekly", priority: 0.8 },
    { path: "/extension", changeFrequency: "weekly", priority: 0.8 },
    { path: "/about", changeFrequency: "monthly", priority: 0.75 },
    { path: "/contact", changeFrequency: "monthly", priority: 0.5 },
    { path: "/privacy", changeFrequency: "monthly", priority: 0.4 },
    { path: "/terms", changeFrequency: "monthly", priority: 0.4 },
  ];

  return routes.map((r) => ({
    url: `${BASE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
