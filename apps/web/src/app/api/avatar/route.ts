import { NextRequest, NextResponse } from "next/server";

function generateSvgAvatar(username: string): string {
  const clean = username.replace(/^@/, "").trim();
  const initial = (clean[0] || "?").toUpperCase();
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = clean.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="hsl(${hue}, 45%, 22%)" />
      <stop offset="100%" stop-color="hsl(${(hue + 45) % 360}, 55%, 12%)" />
    </linearGradient>
  </defs>
  <circle cx="64" cy="64" r="64" fill="url(#bg)" />
  <circle cx="64" cy="64" r="62.5" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" />
  <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="700" font-size="52">${initial}</text>
</svg>`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id")?.trim();
  const username = (searchParams.get("username") || "").replace(/^@/, "").trim();
  const platform = searchParams.get("platform") || "x";

  // 1. If numeric platform account id is present and on X, fetch cached CDN avatar
  if (id && /^\d+$/.test(id) && platform === "x") {
    try {
      const upstreamRes = await fetch(
        `https://blockedforaireply.com/avatars/img/${id}.jpg`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          },
          next: { revalidate: 604800 }, // Cache for 7 days
        }
      );

      if (upstreamRes.ok) {
        const imageBuffer = await upstreamRes.arrayBuffer();
        return new NextResponse(imageBuffer, {
          status: 200,
          headers: {
            "Content-Type": "image/jpeg",
            "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400",
          },
        });
      }
    } catch {
      // Continue to fallback
    }
  }

  // 2. If username is present, attempt unavatar fallback with a quick 2s timeout
  if (username) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const unavatarUrl =
        platform === "threads"
          ? `https://unavatar.io/threads/${encodeURIComponent(username)}?fallback=false`
          : `https://unavatar.io/x/${encodeURIComponent(username)}?fallback=false`;

      const unavatarRes = await fetch(unavatarUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        },
      });
      clearTimeout(timeoutId);

      if (unavatarRes.ok) {
        const imageBuffer = await unavatarRes.arrayBuffer();
        const contentType = unavatarRes.headers.get("content-type") || "image/jpeg";
        return new NextResponse(imageBuffer, {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400",
          },
        });
      }
    } catch {
      // Continue to deterministic SVG avatar
    }
  }

  // 3. Fallback: Return a high-fidelity SVG avatar with custom gradient and monogram
  const svg = generateSvgAvatar(username || id || "?");
  return new NextResponse(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400",
    },
  });
}
