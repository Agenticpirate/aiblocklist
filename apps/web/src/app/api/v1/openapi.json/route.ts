import { NextResponse } from "next/server";

export async function GET() {
  const spec = {
    openapi: "3.1.0",
    info: {
      title: "AIBlockList Public Behavioral Intelligence API",
      version: "1.0.0",
      description:
        "Open-source behavioral trust and safety API for X and Meta Threads. Identifies automated reply spam while protecting responsible everyday AI users.",
      license: {
        name: "ODC-By-1.0",
        url: "https://opendatacommons.org/licenses/by/1-0/",
      },
    },
    servers: [{ url: "https://aiblocklist.com/api/v1" }],
    paths: {
      "/health": {
        get: {
          summary: "Health check",
          responses: { "200": { description: "Service healthy" } },
        },
      },
      "/statistics": {
        get: {
          summary: "Registry statistics",
          responses: { "200": { description: "Aggregate counts and platform breakdown" } },
        },
      },
      "/blocklists": {
        get: {
          summary: "List indexed accounts",
          parameters: [
            { name: "platform", in: "query", schema: { type: "string", enum: ["x", "threads"] } },
            { name: "limit", in: "query", schema: { type: "integer", default: 24 } },
            { name: "q", in: "query", schema: { type: "string" } },
          ],
          responses: { "200": { description: "Paginated account records" } },
        },
      },
      "/accounts/{platform}/{username}": {
        get: {
          summary: "Get account dossier",
          parameters: [
            { name: "platform", in: "path", required: true, schema: { type: "string" } },
            { name: "username", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            "200": { description: "Account dossier with evidence URLs" },
            "404": { description: "Account not indexed" },
          },
        },
      },
      "/transparency": {
        get: {
          summary: "Audit ledger integrity and SLA commitments",
          responses: { "200": { description: "Transparency report" } },
        },
      },
    },
  };

  return NextResponse.json(spec, {
    headers: {
      "Content-Type": "application/openapi+json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
