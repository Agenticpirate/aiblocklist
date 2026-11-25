"use client";

import { useEffect } from "react";

interface ModelContextTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (input: Record<string, unknown>) => Promise<unknown>;
}

declare global {
  interface Document {
    modelContext?: {
      registerTool: (
        tool: ModelContextTool,
        options?: { signal?: AbortSignal }
      ) => Promise<void>;
    };
  }
}

export function WebMcpProvider() {
  useEffect(() => {
    if (typeof document === "undefined" || !document.modelContext?.registerTool) {
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;

    const tools: ModelContextTool[] = [
      {
        name: "check_account_status",
        description:
          "Check if an X or Threads handle is indexed on AIBlockList and inspect its public behavioral evidence.",
        inputSchema: {
          type: "object",
          properties: {
            platform: { type: "string", enum: ["x", "threads"], default: "x" },
            username: { type: "string", description: "Account handle without @" },
          },
          required: ["username"],
        },
        execute: async (input) => {
          const platform = String(input.platform || "x").toLowerCase();
          const username = String(input.username || "").replace(/^@/, "").trim();
          const res = await fetch(
            `/api/v1/accounts/${encodeURIComponent(platform)}/${encodeURIComponent(username)}`
          );
          return res.json();
        },
      },
      {
        name: "search_blocklist",
        description: "Search indexed accounts in the AIBlockList registry.",
        inputSchema: {
          type: "object",
          properties: {
            q: { type: "string", description: "Handle or ID query" },
            platform: { type: "string", enum: ["x", "threads"] },
            limit: { type: "integer", default: 24 },
          },
        },
        execute: async (input) => {
          const params = new URLSearchParams();
          if (input.q) params.set("q", String(input.q));
          if (input.platform) params.set("platform", String(input.platform));
          if (input.limit) params.set("limit", String(input.limit));
          const res = await fetch(`/api/v1/blocklists?${params.toString()}`);
          return res.json();
        },
      },
      {
        name: "get_registry_statistics",
        description: "Fetch total indexed accounts, evidence coverage, and platform breakdown.",
        inputSchema: { type: "object", properties: {} },
        execute: async () => {
          const res = await fetch("/api/v1/statistics");
          return res.json();
        },
      },
    ];

    for (const tool of tools) {
      document.modelContext.registerTool(tool, { signal }).catch(() => {
        // Ignore duplicate or unsupported registration errors
      });
    }

    return () => {
      controller.abort();
    };
  }, []);

  return null;
}
