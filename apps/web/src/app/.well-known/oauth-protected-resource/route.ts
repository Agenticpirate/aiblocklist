import { NextResponse } from "next/server";

export async function GET() {
  const metadata = {
    resource: "https://aiblocklist.com/api/v1",
    authorization_servers: ["https://aiblocklist.com"],
    bearer_methods_supported: ["header"],
    scopes_supported: ["read:blocklists", "read:accounts", "write:appeals", "write:reports"],
    resource_documentation: "https://aiblocklist.com/api-docs",
  };

  return NextResponse.json(metadata, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
