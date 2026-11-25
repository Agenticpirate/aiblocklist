import { NextResponse } from "next/server";

export async function GET() {
  const manifest = {
    specVersion: "1.0",
    host: {
      name: "AIBlockList",
      domain: "aiblocklist.com",
      url: "https://aiblocklist.com",
      description:
        "Open-source behavioral trust and safety infrastructure filtering automated reply bots on X and Threads while protecting people who use AI wisely.",
    },
    entries: [
      {
        id: "urn:air:aiblocklist.com:api:registry-v1",
        displayName: "AIBlockList REST API v1",
        type: "application/openapi+json",
        url: "https://aiblocklist.com/api/v1/openapi.json",
        representativeQueries: [
          "Check if an X or Threads account is flagged for AI reply spam",
          "Fetch paginated list of automated reply bots with evidence URLs",
          "Get AIBlockList registry statistics and transparency metrics",
        ],
      },
      {
        id: "urn:air:aiblocklist.com:mcp:registry-server",
        displayName: "AIBlockList MCP Server Card",
        type: "application/json",
        url: "https://aiblocklist.com/.well-known/mcp/server-card.json",
        representativeQueries: [
          "Connect an AI agent to AIBlockList account lookup tools",
          "Discover AIBlockList MCP capabilities and transport endpoint",
        ],
      },
      {
        id: "urn:air:aiblocklist.com:docs:llms-reference",
        displayName: "AIBlockList Methodology & LLM Reference",
        type: "text/markdown",
        url: "https://aiblocklist.com/llms-full.txt",
        representativeQueries: [
          "How does AIBlockList SIG-01 to SIG-05 verification work",
          "How can an account owner submit a public appeal on AIBlockList",
        ],
      },
    ],
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
