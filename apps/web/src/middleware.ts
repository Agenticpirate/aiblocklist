import { NextRequest, NextResponse } from "next/server";

const LINK_HEADER = [
  '</.well-known/api-catalog>; rel="api-catalog"',
  '</api-docs>; rel="service-doc"',
  '</openapi.json>; rel="service-desc"',
  '</llms.txt>; rel="alternate"; type="text/markdown"',
  '</.well-known/ai-catalog.json>; rel="ai-catalog"',
  '</.well-known/mcp/server-card.json>; rel="mcp-server"',
].join(", ");

const KNOWN_PAGE_ROUTES = new Set([
  "/",
  "/about",
  "/account-health",
  "/api-docs",
  "/appeals",
  "/blog",
  "/contact",
  "/developers",
  "/directory",
  "/extension",
  "/mcp",
  "/methodology",
  "/privacy",
  "/report",
  "/terms",
  "/transparency",
]);

function isKnownPageRoute(pathname: string): boolean {
  if (KNOWN_PAGE_ROUTES.has(pathname)) return true;
  if (/^\/accounts\/(x|threads)\/[^/]+$/i.test(pathname)) return true;
  if (/^\/blog\/[a-z0-9-]+$/i.test(pathname)) return true;
  return false;
}

function buildMarkdownForPath(pathname: string): string {
  const pageTitle =
    pathname === "/"
      ? "AIBlockList — Filter Automated AI Bot Replies & Keep Feeds Human"
      : `AIBlockList — ${pathname.replace(/^\//, "")}`;

  return [
    `# ${pageTitle}`,
    "",
    "> Open-source behavioral trust and safety infrastructure for X and Meta Threads. Using AI in everyday work is great — we only filter automated reply bots farming impressions and monetization. Let's use AI wisely.",
    "",
    `- Canonical URL: https://aiblocklist.com${pathname}`,
    "- API Catalog: https://aiblocklist.com/.well-known/api-catalog",
    "- OpenAPI Spec: https://aiblocklist.com/openapi.json",
    "- Developer Portal: https://aiblocklist.com/developers",
    "- MCP Server: https://aiblocklist.com/mcp",
    "- ARD Manifest: https://aiblocklist.com/.well-known/ai-catalog.json",
    "- MCP Server Card: https://aiblocklist.com/.well-known/mcp/server-card.json",
    "- Full LLM Guide: https://aiblocklist.com/llms-full.txt",
    "",
    "## Key Endpoints",
    "- `GET /api/v1/health` — Service health",
    "- `GET /api/v1/statistics` — Registry totals and platform breakdown",
    "- `GET /api/v1/blocklists?platform=x&limit=24` — Paginated registry with evidence URLs",
    "- `GET /api/v1/accounts/{platform}/{username}` — Full account dossier",
    "- `GET /api/v1/transparency` — SHA-256 audit ledger and commitments",
  ].join("\n");
}

function buildMarkdown404(pathname: string): string {
  return [
    "# 404 — Page Not Found",
    "",
    `The requested path \`${pathname}\` does not exist on AIBlockList.`,
    "",
    "## Helpful Resources",
    "- [AIBlockList Home](https://aiblocklist.com/)",
    "- [LLM Guide (llms.txt)](https://aiblocklist.com/llms.txt)",
    "- [Sitemap](https://aiblocklist.com/sitemap.xml)",
    "- [Developer Portal](https://aiblocklist.com/developers)",
    "- [API Documentation](https://aiblocklist.com/api-docs)",
  ].join("\n");
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const host = (req.headers.get("x-forwarded-host") || req.headers.get("host") || "").toLowerCase();
  const proto = (req.headers.get("x-forwarded-proto") || req.nextUrl.protocol.replace(":", "")).toLowerCase();
  const isLocal = host.startsWith("localhost") || host.startsWith("127.0.0.1");

  // 301 canonical redirect: enforce HTTPS and non-www (https://aiblocklist.com)
  if (!isLocal && (host.startsWith("www.") || proto === "http")) {
    const canonicalUrl = new URL(`https://aiblocklist.com${pathname}${search}`);
    return NextResponse.redirect(canonicalUrl, 301);
  }

  const accept = (req.headers.get("accept") || "").toLowerCase();

  // Structured JSON 404 for unknown /api/* paths outside /api/v1 and /api/avatar
  if (
    pathname.startsWith("/api/") &&
    !pathname.startsWith("/api/v1") &&
    !pathname.startsWith("/api/avatar")
  ) {
    return NextResponse.json(
      {
        status: 404,
        code: "ENDPOINT_NOT_FOUND",
        title: "API Endpoint Not Found",
        detail: `No API handler exists at ${pathname}.`,
        hint: "See https://aiblocklist.com/openapi.json or https://aiblocklist.com/api-docs for supported endpoints.",
      },
      { status: 404 }
    );
  }

  const isStaticOrWellKnown =
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/.well-known/") ||
    pathname.includes(".");

  if (!isStaticOrWellKnown) {
    const known = isKnownPageRoute(pathname);

    // Agent-friendly Markdown response (200 for known pages, 404 for unknown paths)
    if (accept.includes("text/markdown")) {
      const md = known ? buildMarkdownForPath(pathname) : buildMarkdown404(pathname);
      const approxTokens = Math.max(1, Math.ceil(md.length / 4));
      return new NextResponse(md, {
        status: known ? 200 : 404,
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "x-markdown-tokens": String(approxTokens),
          Vary: "Accept",
          Link: LINK_HEADER,
          "Cache-Control": "no-store",
        },
      });
    }

    const res = NextResponse.next();
    res.headers.set("Link", LINK_HEADER);
    res.headers.set("Vary", "Accept");
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
