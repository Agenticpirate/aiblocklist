import { NextResponse } from "next/server";

export async function GET() {
  const catalog = {
    linkset: [
      {
        anchor: "https://aiblocklist.com/api/v1",
        "service-desc": [
          {
            href: "https://aiblocklist.com/api/v1/openapi.json",
            type: "application/openapi+json",
          },
        ],
        "service-doc": [
          {
            href: "https://aiblocklist.com/api-docs",
            type: "text/html",
          },
        ],
        status: [
          {
            href: "https://aiblocklist.com/api/v1/health",
            type: "application/json",
          },
        ],
      },
    ],
  };

  return new NextResponse(JSON.stringify(catalog, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/linkset+json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
