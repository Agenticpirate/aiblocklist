<p align="center">
  <img src="apps/web/public/logo.png" alt="AIBlockList Logo" width="96" height="96" />
</p>

<h1 align="center">AIBlockList</h1>

<p align="center">
  <strong>Open Source Trust & Safety Intelligence Infrastructure for Social Networks</strong>
</p>

<p align="center">
  <a href="https://github.com/Agenticpirate/aiblocklist/actions/workflows/ci-core.yml"><img src="https://img.shields.io/github/actions/workflow/status/Agenticpirate/aiblocklist/ci-core.yml?style=flat-square&label=CI%20Pipeline" alt="CI Status" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/Code%20License-Apache%202.0-blue.svg?style=flat-square" alt="Apache 2.0 License" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/Dataset%20License-ODC--By%201.0-orange.svg?style=flat-square" alt="ODC-By 1.0 License" /></a>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Frontend-Next.js%2015-black?style=flat-square&logo=next.js" alt="Next.js 15" /></a>
  <a href="https://fastapi.tiangolo.com"><img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi" alt="FastAPI" /></a>
  <a href="https://x.com/Agenticpirate"><img src="https://img.shields.io/badge/Creator-%40Agenticpirate-1DA1F2?style=flat-square&logo=x" alt="Built by @Agenticpirate" /></a>
</p>

---

## 📌 Overview

**AIBlockList** is an independent, transparent, and deterministic intelligence registry built to identify, verify, and filter abusive automated social media behavior across **𝕏** and **Meta Threads**. 

Unlike probabilistic AI text detectors that flag legitimate human or AI-assisted writers, AIBlockList evaluates accounts strictly on **verifiable behavioral telemetry**, multi-source public provenance, human dual-review, and cryptographic SHA-256 evidence hashing.

---

## 🚀 Key Features

- **🛡️ Deterministic Behavioral Criteria (SIG-01 to SIG-05):**
  Accounts are indexed only when meeting published behavioral definitions (unsolicited mass replies, templated sybil clusters, high-frequency reply storms) backed by at least two canonical, public post URLs.
- **🔍 Multi-Platform Protection:**
  Simultaneous intelligence tracking across both **𝕏** (Twitter) and **Meta Threads**.
- **📈 Algorithm Reach Intelligence & Playbook:**
  Full coverage of 𝕏's open-source recommendation algorithms, including the 30-day `"fast reply spam"` shadow penalty, the author-tagging exemption, Heavy Ranker score weights (+20 mutual replies, +20 copy link, -53.07 off-topic), and actionable strategic rules.
- **⚖️ Fast-Track Appeals & Platform Recovery:**
  60-second dispute token generation for mistakenly indexed handles, paired with step-by-step suspension recovery guides and copyable official appeal templates.
- **🖼️ First-Party High-Performance Avatar Proxy:**
  Local `/api/avatar` caching layer preventing client-side rate limits, serving profile images with 7-day browser & edge cache headers.
- **🧩 Browser Extension (Manifest V3):**
  Unobtrusive badges and filters directly inside `x.com` and `threads.net` web streams.
- **🌐 Open Data API & JSON Feeds:**
  Free, public REST endpoints and JSON exports released under the **Open Data Commons Attribution License 1.0 (ODC-By 1.0)**.

---

## 🏗️ Repository Architecture

This repository is organized as a monorepo:

```
ai-block-list/
├── apps/
│   ├── web/               # Next.js 15 App Router frontend (React 19, Tailwind CSS)
│   ├── api/               # FastAPI async Python backend (SQLAlchemy, SQLite/PostgreSQL)
│   └── extension/         # Manifest V3 browser extension for Chrome, Brave, and Edge
├── database/
│   ├── migrations/        # Database schema migrations
│   └── seeds/             # Seed datasets & external federated snapshots
├── docs/                  # Architecture, governance charter & API specifications
├── .github/               # CI/CD workflows and community guidelines
├── docker-compose.yml     # Local multi-service container configuration
└── LICENSE                # Dual licensing: Apache 2.0 (code) & ODC-By 1.0 (dataset)
```

---

## ⚡ Quickstart & Local Setup

### Prerequisites

- **Node.js**: `v20.x` or `v22.x` (LTS)
- **Python**: `3.12+` with [`uv`](https://github.com/astral-sh/uv) package manager
- **Git**: Installed and configured

### 1. Clone the Repository

```bash
git clone https://github.com/Agenticpirate/aiblocklist.git
cd aiblocklist
```

### 2. Backend Setup (FastAPI)

```bash
cd apps/api

# Install dependencies using uv
uv sync --python 3.12

# Run database migrations & seeds
uv run alembic upgrade head

# Start local FastAPI server on http://127.0.0.1:8000
uv run uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Interactive API documentation will be accessible at:
- **Swagger UI:** `http://127.0.0.1:8000/docs`
- **ReDoc:** `http://127.0.0.1:8000/redoc`

### 3. Frontend Setup (Next.js 15)

In a separate terminal:

```bash
cd apps/web

# Install dependencies
npm install

# Run development server on http://localhost:3000
npm run dev
```

For production builds:
```bash
npm run build
npm start -p 3001
```

---

## 🧩 Browser Extension Setup (Unpacked)

1. Open Chrome, Brave, or Edge and navigate to `chrome://extensions`.
2. Toggle on **Developer mode** in the top right.
3. Click **Load unpacked** and select the [`apps/extension`](apps/extension) directory.
4. Browse to `x.com` or `threads.net` to view automated bot indicators directly inline.

---

## 📡 API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/v1/accounts` | `GET` | Paginated search of verified and indexed accounts |
| `/api/v1/accounts/{platform}/{username}` | `GET` | Detailed account profile, evidence provenance & status |
| `/api/v1/evidence` | `GET` | List behavioral evidence entries with post URLs |
| `/api/v1/appeals` | `POST` | Submit an account dispute or delisting request |
| `/api/v1/reports` | `POST` | Submit behavioral evidence of a spam/bot account |
| `/api/v1/stats` | `GET` | Real-time ecosystem statistics & breakdown |
| `/api/avatar` | `GET` | Next.js cached profile picture resolver |

---

## 📜 Governance & Dual Review

AIBlockList operates under a strict **No Black-Box AI Detectors** pledge:
1. No account is listed based solely on probabilistic text analysis (e.g. GPTZero, Turnitin).
2. Listings require observable, high-velocity behavioral telemetry across multiple public posts.
3. Every delisting request is processed within 72 hours under our publicly published governance charter.

---

## 🤝 Contributing

We welcome contributions from trust & safety researchers, developers, and open-source advocates!

Please review [`CONTRIBUTING.md`](CONTRIBUTING.md) for code guidelines, issue tracking, and PR review workflows.

---

## 📄 License & Attribution

- **Software & Source Code:** Licensed under the [Apache License, Version 2.0](LICENSE).
- **Public Verified Dataset:** Licensed under the [Open Data Commons Attribution License 1.0 (ODC-By 1.0)](LICENSE).
- **Project Architect & Creator:** Built by [@Agenticpirate](https://x.com/Agenticpirate).
