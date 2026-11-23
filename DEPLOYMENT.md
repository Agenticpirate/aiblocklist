# AIBlockList.com — Production Deployment Blueprint

This document provides step-by-step instructions to deploy AIBlockList into a high-availability, enterprise-grade production environment.

---

## 1. Architecture Topology

```
                  [ Cloudflare WAF & CDN (aiblocklist.com) ]
                                    │
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
[ Next.js 15 App (Vercel) ]                      [ FastAPI Backend (Railway/AWS) ]
    aiblocklist.com                                    api.aiblocklist.com
                                                             │
                                   ┌─────────────────────────┴────────────────────────┐
                                   ▼                                                  ▼
                     [ Managed PostgreSQL 16+ ]                              [ Valkey / Redis 8 ]
                     (Neon / Supabase / AWS RDS)                            (Upstash / AWS ElastiCache)
```

---

## 2. Frontend Deployment (Vercel)

The Next.js 15 App Router frontend is pre-configured for zero-friction Vercel deployment.

1. **Import Repository to Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new) and select the `ai-block-list` repository.
   - Set **Root Directory** to `apps/web`.
2. **Environment Variables:**
   - `NEXT_PUBLIC_API_BASE_URL`: `https://api.aiblocklist.com/api/v1`
3. **Custom Domain:**
   - In Vercel Project Settings $\to$ **Domains**, add `aiblocklist.com` and `www.aiblocklist.com`.
   - Point your DNS A / CNAME records to Vercel as instructed.

---

## 3. Backend Deployment (Railway, Render, or Fly.io)

The Python FastAPI backend can be deployed with Docker or direct Python 3.12 runtime.

### Option A: Railway (Fastest)
1. In Railway, click **New Project** $\to$ **Deploy from GitHub repo**.
2. Set **Root Directory** to `apps/api`.
3. Add a **PostgreSQL** service and a **Redis** service from the Railway dashboard.
4. Set Environment Variables:
   ```bash
   APP_ENV=production
   APP_SECRET_KEY=your-32-character-random-secret
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   VALKEY_URL=${{Redis.REDIS_URL}}
   CORS_ORIGINS=https://aiblocklist.com,https://www.aiblocklist.com
   PORT=8000
   ```
5. Set Custom Domain to `api.aiblocklist.com`.

### Option B: Docker Compose Single-Node Server (Hetzner / DigitalOcean / AWS EC2)
1. Clone the repository onto your Linux host:
   ```bash
   git clone https://github.com/your-org/ai-block-list.git
   cd ai-block-list
   ```
2. Copy environment template:
   ```bash
   cp .env.example .env
   # Edit .env with your production secrets
   ```
3. Start the entire containerized stack:
   ```bash
   docker compose up -d
   ```
4. Verify health:
   ```bash
   curl http://localhost:8000/api/v1/health
   # {"status":"ok","environment":"production"}
   ```

---

## 4. Browser Extension Distribution

The Manifest V3 browser extension is packaged and ready in `dist/`:

- **Archive File:** `dist/aiblocklist-extension-v1.0.0.zip`
- **For Chrome Web Store:**
  1. Open [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole).
  2. Click **New Item** $\to$ Upload `dist/aiblocklist-extension-v1.0.0.zip`.
  3. Fill in store listing, logo (`apps/extension/icons/icon-128.png`), and privacy declarations (Zero tracking, zero analytics).
- **For Local Testing (Unpacked):**
  1. Open Chrome and navigate to `chrome://extensions`.
  2. Enable **Developer mode** (top right).
  3. Click **Load unpacked** and select the `apps/extension` folder.
  4. Visit `x.com` or `threads.net` to view real-time badges next to indexed bot handles!

---

## 5. Pre-Launch Verification Checklist

- [x] Canonical URL allowlisting rejects non-X and non-Threads origins (prevents SSRF).
- [x] Stylometric AI text detection is strictly barred from serving as standalone evidence.
- [x] Publication gate requires $\ge 2$ active evidence items, active policy tag, and dual reviewer for accounts $\ge 10\text{k}$.
- [x] Free independent appeals workflow with single-use bio token verification.
- [x] SHA-256 audit chaining records all moderation and appeal actions immutably.
- [x] Export endpoints available for CSV, JSON, and plain text blocklist downloads.
- [x] Custom high-resolution logo and favicon deployed across web app.
