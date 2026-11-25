import { NextRequest, NextResponse } from "next/server";

const LINK_HEADER = [
  '</.well-known/api-catalog>; rel="api-catalog"',
  '</api-docs>; rel="service-doc"',
  '</api/v1/openapi.json>; rel="service-desc"',
  '</llms.txt>; rel="alternate"; type="text/markdown"',
  '</.well-known/ai-catalog.json>; rel="ai-catalog"',
  '</.well-known/mcp/server-card.json>; rel="mcp-server"',
].join(", ");

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
    "- OpenAPI Spec: https://aiblocklist.com/api/v1/openapi.json",
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

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const accept = req.headers.get("accept") || "";

  // Markdown negotiation for AI agents requesting text/markdown on HTML routes
  const isPageRoute =
    !pathname.startsWith("/api/") &&
    !pathname.startsWith("/_next/") &&
    !pathname.startsWith("/.well-known/") &&
    !pathname.includes(".");

  if (isPageRoute && accept.includes("text/markdown")) {
    const md = buildMarkdownForPath(pathname);
    const approxTokens = Math.max(1, Math.ceil(md.length / 4));
    return new NextResponse(md, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "x-markdown-tokens": String(approxTokens),
        Vary: "Accept",
        Link: LINK_HEADER,
      },
    });
  }

  const res = NextResponse.next();
  if (isPageRoute) {
    res.headers.set("Link", LINK_HEADER);
    res.headers.set("Vary", "Accept");
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
