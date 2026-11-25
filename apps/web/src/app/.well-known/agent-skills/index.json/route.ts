import { NextResponse } from "next/server";

export async function GET() {
  const index = {
    $schema: "https://agentskills.io/schemas/discovery-v0.2.0.json",
    skills: [
      {
        name: "aiblocklist-lookup",
        type: "skill-md",
        description:
          "Query AIBlockList behavioral intelligence for X and Meta Threads accounts, verify public evidence URLs, and check registry statistics.",
        url: "https://aiblocklist.com/skills/aiblocklist-lookup/SKILL.md",
        sha256: "fece4920ba3600fb23272bc967ffb1e730dcc1ef5ae5b6efc62750b1a8109ff7",
      },
    ],
  };

  return NextResponse.json(index, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
