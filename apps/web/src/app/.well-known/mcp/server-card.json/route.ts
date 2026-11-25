import { NextResponse } from "next/server";

export async function GET() {
  const card = {
    $schema: "https://modelcontextprotocol.io/schemas/server-card/v1.json",
    serverInfo: {
      name: "AIBlockList Registry",
      version: "1.0.0",
      description:
        "Query behavioral AI bot & reply-spam intelligence across X and Meta Threads, check account health, and inspect public evidence.",
    },
    transport: {
      type: "http-rest",
      endpoint: "https://aiblocklist.com/api/v1",
      documentation: "https://aiblocklist.com/api-docs",
    },
    capabilities: {
      tools: [
        {
          name: "check_account_status",
          description: "Look up an X or Threads handle in AIBlockList to check listing status and public evidence.",
        },
        {
          name: "search_blocklist",
          description: "Search or paginate indexed accounts across X and Meta Threads.",
        },
        {
          name: "get_registry_statistics",
          description: "Retrieve total indexed accounts, evidence counts, and platform breakdown.",
        },
      ],
      resources: [
        "https://aiblocklist.com/api/v1/blocklists",
        "https://aiblocklist.com/api/v1/statistics",
        "https://aiblocklist.com/api/v1/transparency",
      ],
    },
  };

  return NextResponse.json(card, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
