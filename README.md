> [!NOTE]
> **API MAYBE Temporarily Paused** due to suspiciously too many requests. My hosted version of this API is only for testing purposes. You MUST host your own instance to use the API.

<div align="center">
  
  <img src="https://capsule-render.vercel.app/api?type=waving&height=300&color=gradient&text=𝙈𝙞𝙧𝙪𝙧𝙤𝘼𝙋𝙄&fontAlignY=30&fontSize=100&desc=𝖠%20𝖢𝗈𝗆𝗉𝗅𝖾𝗍𝖾%20𝖱𝖤𝖲𝖳𝖿𝗎𝗅%20𝖠𝖯𝖨%20𝖥𝗈𝗋%20𝖠𝗇𝗂𝗆𝖾%20𝖲𝗍𝗋𝖾𝖺𝗆𝗂𝗇𝗀&descSize=25" />

</div>

<p align="center">
  <a href="https://github.com/Shineii86/MiruroAPI/stargazers"><img src="https://img.shields.io/github/stars/Shineii86/MiruroAPI?style=for-the-badge&logo=github&color=f43f8e&logoColor=white" alt="Stars"/></a>
  <a href="https://github.com/Shineii86/MiruroAPI/network/members"><img src="https://img.shields.io/github/forks/Shineii86/MiruroAPI?style=for-the-badge&logo=github&color=a855f7&logoColor=white" alt="Forks"/></a>
  <a href="https://github.com/Shineii86/MiruroAPI/issues"><img src="https://img.shields.io/github/issues/Shineii86/MiruroAPI?style=for-the-badge&logo=github&color=7c3aed&logoColor=white" alt="Issues"/></a>
  <a href="https://github.com/Shineii86/MiruroAPI/pulls"><img src="https://img.shields.io/github/issues-pr/Shineii86/MiruroAPI?style=for-the-badge&logo=github&color=ec4899&logoColor=white" alt="Pull Requests"/></a>
  <a href="https://github.com/Shineii86/MiruroAPI/commits"><img src="https://img.shields.io/github/last-commit/Shineii86/MiruroAPI?style=for-the-badge&logo=github&color=6366f1&logoColor=white" alt="Last Commit"/></a>
  <a href="https://github.com/Shineii86/MiruroAPI/blob/main/LICENSE"><img src="https://img.shields.io/github/license/Shineii86/MiruroAPI?style=for-the-badge&logo=mit&color=22c55e&logoColor=white" alt="License"/></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Express-4.21-000000?style=flat-square&logo=express&logoColor=white" alt="Express"/>
  <img src="https://img.shields.io/badge/AniList-GraphQL-02A6E4?style=flat-square&logo=graphql&logoColor=white" alt="AniList GraphQL"/>
  <img src="https://img.shields.io/badge/Vercel-Serverless-000000?style=flat-square&logo=vercel&logoColor=white" alt="Vercel"/>
  <img src="https://img.shields.io/badge/License-MIT-22c55e?style=flat-square&logo=mit&logoColor=white" alt="License"/>
  <img src="https://img.shields.io/badge/Version-2.3.2-f43f8e?style=flat-square&logoColor=white" alt="Version"/>
  <img src="https://img.shields.io/badge/Endpoints-46-6366f1?style=flat-square&logoColor=white" alt="Endpoints"/>
  <img src="https://img.shields.io/badge/Providers-12-a855f7?style=flat-square&logoColor=white" alt="Providers"/>
</p>

<p align="center">
  <b>A complete RESTful API for anime streaming data powered by AniList GraphQL and Miruro providers</b><br/>
  Search, browse, filter, watch — every endpoint returns fresh data with smart caching.<br/>
  46 endpoints, 12 streaming providers, M3U8 URLs with subtitles, skip timestamps, and batch operations.
</p>

<p align="center">
  <a href="#-table-of-contents">Table of Contents</a> &bull;
  <a href="#-features">Features</a> &bull;
  <a href="#-api-endpoints">API Docs</a> &bull;
  <a href="#-quick-start">Quick Start</a> &bull;
  <a href="#-deployment">Deployment</a> &bull;
  <a href="#-contributing">Contributing</a>
</p>

---

> [!WARNING]
> 1. This `API` does not store any files — it only links to media hosted on 3rd party services.
> 2. This `API` is explicitly made for **educational purposes only** and not for commercial usage. This repo will not be responsible for any misuse of it.
> 3. All anime data, images, and content belong to their respective owners (AniList, Miruro). This project is not affiliated with Miruro.

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Data Sources](#-data-sources)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Configuration](#-configuration)
- [API Endpoints](#-api-endpoints)
- [Streaming Flow](#-streaming-flow)
- [API Response Schema](#-api-response-schema)
- [Deployment](#-deployment)
- [Available Scripts](#-available-scripts)
- [Performance](#-performance)
- [Changelog Highlights](#-changelog-highlights)
- [Troubleshooting](#-troubleshooting)
- [FAQ](#-faq)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [Acknowledgements](#-acknowledgements)
- [License](#-license)
- [Author](#-author)
- [Star History](#-star-history)

---

## 🌸 Overview

**MiruroAPI** is a serverless anime data API that fetches real-time information from **AniList GraphQL** and streaming data from **Miruro providers** — including anime details, episode lists, M3U8 streaming URLs with subtitles and skip timestamps, search, filtering, characters, and more — all through a clean REST API with zero database.

> 💡 No database, no auth, no complex setup. Just deploy to Vercel and you have a production API.

### Why MiruroAPI?

- 🎬 **46 Endpoints** — Complete anime data coverage
- 🔍 **Full-Text Search** — Search anime by keyword with suggestions
- 🎭 **Characters & Voice Actors** — Full character data from AniList
- 🎯 **Advanced Filtering** — Genre, year, season, format, sort
- 🏆 **Trending & Popular** — Discover what's hot right now
- 📅 **Airing Schedule** — See what's airing on any date
- 📡 **12 Streaming Providers** — M3U8 streaming sources
- ⏭️ **Skip Timestamps** — OP/ED skip data
- 🎭 **Character & Staff Search** — Search characters and staff by name
- 🎬 **Batch Episodes** — Fetch multiple episode sources in parallel
- ⚡ **Smart Caching** — In-memory Map with configurable TTL
- 🔒 **CORS Enabled** — Works from any frontend, no proxy needed
- 🚀 **Zero-Config Deploy** — One click to Vercel, or run standalone with Express

### 🔄 Self-Healing System (v2.3.2)

When Cloudflare blocks streaming requests, the API automatically tries fallback methods:
- **Direct** → Mirror rotation across 4 domains (miruro.to, miruro.ru, miruro.bz, miruro.tv)
- **ScraperAPI** → Proxy bypass via premium residential IPs ($49/mo)
- **FlareSolverr** → Self-hosted browser proxy

Zero-config: works out of the box. Add `SCRAPER_API_KEY` env var for automatic Cloudflare bypass (requires ScraperAPI premium plan for protected domains).

### ⚠️ Streaming Status

> **Streaming endpoints work on Cloudflare Workers** — deploy `worker.js` for full streaming support.
>
> On Vercel, streaming endpoints (`/api/episodes`, `/api/watch`, `/api/sources`, `/api/stream`) return 500 errors when Cloudflare blocks pipe requests. Metadata endpoints (search, info, trending, etc.) work perfectly on all platforms.

| What Works (All Platforms) | What's Blocked (Vercel Only) |
|:---|:---|
| Search, suggestions, filter | Episodes, sources, stream |
| Info, characters, relations | Watch, download |
| Trending, popular, schedule | All pipe-dependent endpoints |
| Genres, tags, calendar | Streaming provider data |
| All AniList-backed endpoints | **✅ Works on Cloudflare Worker** |

**To fix streaming on Vercel**, set one of these environment variables:

```bash
# Option 1: Deploy as Cloudflare Worker (recommended — free, bypasses Cloudflare)
wrangler deploy worker.js --name miruroapi

# Option 2: ScraperAPI (requires premium plan — $49/month)
SCRAPER_API_KEY=your_scraperapi_key

# Option 3: FlareSolverr (self-hosted, unlimited)
FLARESOLVERR_URL=http://your-flaresolverr-host:8191
```

See [How to Fix Streaming](#-how-to-fix-streaming-issues) in Troubleshooting below.

### How It Works

```mermaid
flowchart TD
    A["🌐 Client Request<br/>(Browser / App / curl)"] --> B["🛡️ Express Server<br/>CORS · Security Headers · Rate Limiting"]
    B --> C{"💾 Cache Check<br/>(In-Memory Map)"}
    C -- HIT --> D["⚡ Return Cached Response<br/>~50ms"]
    C -- MISS --> E{"🔍 Which Source?"}

    E -- Metadata --> F["📡 AniList GraphQL<br/>graphql.anilist.co"]
    E -- Streaming --> G["📺 Miruro Pipe<br/>miruro.{to,ru,bz,tv}/api/secure/pipe"]

    F --> H["AniList Response<br/>JSON"]
    G --> I["Pipe Response<br/>base64url + gzip"]

    H --> J["Cache + Respond<br/>JSON"]
    I --> J

    style A fill:#1e1e2e,stroke:#a78bfa,color:#f1f5f9
    style B fill:#1e1e2e,stroke:#6366f1,color:#f1f5f9
    style C fill:#1e1e2e,stroke:#f43f8e,color:#f1f5f9
    style D fill:#1e1e2e,stroke:#22c55e,color:#f1f5f9
    style E fill:#1e1e2e,stroke:#a855f7,color:#f1f5f9
    style F fill:#1e1e2e,stroke:#06b6d4,color:#f1f5f9
    style G fill:#1e1e2e,stroke:#eab308,color:#f1f5f9
    style H fill:#1e1e2e,stroke:#06b6d4,color:#f1f5f9
    style I fill:#1e1e2e,stroke:#eab308,color:#f1f5f9
    style J fill:#1e1e2e,stroke:#22c55e,color:#f1f5f9
```

---

## ✨ Features

<table>
  <tr>
    <td>

### ⚡ Core
- **AniList GraphQL** for rich metadata
- **Miruro pipe** for streaming sources
- **Smart caching** with configurable TTL
- **46 RESTful endpoints**
- **Gzip compression** — 30-70% smaller responses
- **Request logging** — method, path, status, duration
- **Graceful error handling** per endpoint
- **Rate limiting** (100 req/min per IP)

    </td>
    <td>

### 🔍 Data
- **Full-text search** with pagination
- **Autocomplete suggestions** for search
- **Advanced filtering** — genre, year, season, format, sort
- **Characters** with voice actors
- **Relations** and **Recommendations**
- **Airing schedule** by date
- **Seasonal anime** by year + season
- **Studio filter** — anime by studio name
- **Character & Staff search**

    </td>
  </tr>
  <tr>
    <td>

### 📡 Streaming
- **Episode lists** from 12 providers
- **M3U8 streaming URLs** with resolution info
- **Skip timestamps** (OP/ED)
- **Download links** when available
- **Sub/Dub** support per provider
- **Codec and fansub** metadata
- **Batch episode fetching** — multiple sources in parallel
- **Quality fallback** — auto 1080p → 720p → 360p
- **Subtitle extraction** — expose subtitle URLs

    </td>
    <td>

### 🛡️ Reliability
- **CORS enabled** — works from any frontend
- **Error responses** with descriptive messages
- **Input validation** — required params checked
- **Timeout protection** — per request
- **In-memory caching** — survives warm starts
- **Zero database** — pure API + cache

    </td>
  </tr>
</table>

### 🌟 Feature Highlights

| Feature | Description | Status |
|:---|:---|:---:|
| 🎬 46 API Endpoints | Complete anime data coverage | ✅ |
| 🔍 Full-Text Search | Keyword search with pagination | ✅ |
| 💡 Search Suggestions | Fast autocomplete | ✅ |
| 🎯 Advanced Filtering | Genre, year, season, format, sort | ✅ |
| 🎭 Characters + Voice Actors | Full character data from AniList | ✅ |
| 🔗 Relations & Recommendations | Related anime discovery | ✅ |
| ⏭️ Skip Timestamps | OP/ED skip data | ✅ |
| 📡 12 Streaming Providers | M3U8 streaming sources | ✅ |
| 🔄 Smart Caching | In-memory Map with TTL | ✅ |
| 🚀 One-Click Deploy | Vercel button deployment | ✅ |
| 🏗️ Express Mode | Standalone server with `npm start` | ✅ |
| 🐳 Docker Support | Containerized deployment | ✅ |

---

## 🗞️ Data Sources

### Metadata Source

| Source | API | Data |
|:---|:---|:---|
| 🌸 **AniList** | `graphql.anilist.co` | Search, info, characters, relations, recommendations, filter, schedule |

### Streaming Source

| Source | Domain | Data |
|:---|:---|:---|
| 📺 **Miruro** | `miruro.to` | Episodes, streaming sources (M3U8 URLs) |
| 📺 **Miruro** | `miruro.ru` | Mirror domain |
| 📺 **Miruro** | `miruro.bz` | Mirror domain |
| 📺 **Miruro** | `miruro.tv` | Mirror domain |

### 🎬 Streaming Providers

| Provider | Provider | Provider | Provider |
|:---|:---|:---|:---|
| 🥝 kiwi | 🐝 pewe | 🐻 bee | 🍯 bonk |
| 🍌 bun | 🤝 ally | 🦄 nun | 👯 twin |
| ⚙️ cog | 🐄 moo | 🐰 hop | 📺 telli |

---

## 🛠️ Tech Stack

| Technology | Purpose | Version | Documentation |
|:---|:---|:---|:---|
| 🟢 [Node.js](https://nodejs.org/) | JavaScript runtime | >= 20 | [Docs](https://nodejs.org/docs/) |
| ⚡ [Express](https://expressjs.com/) | HTTP server framework | 4.21 | [Docs](https://expressjs.com/en/4x/api.html) |
| ▲ [Vercel Functions](https://vercel.com/docs/functions) | Serverless deployment | — | [Docs](https://vercel.com/docs/functions) |
| 🌸 [AniList GraphQL](https://anilist.gitbook.io/anilist-apiv2-docs/) | Anime metadata API | — | [Docs](https://anilist.gitbook.io/anilist-apiv2-docs/) |
| 🌐 [Axios](https://axios-http.com/) | HTTP client | 1.8 | [Docs](https://axios-http.com/docs/intro) |
| 🔧 [dotenv](https://github.com/motdotla/dotenv) | Environment variables | 16.4 | [Docs](https://github.com/motdotla/dotenv) |
| 🔒 [cors](https://github.com/expressjs/cors) | CORS middleware | 2.8 | [Docs](https://github.com/expressjs/cors) |

### 📦 Key Dependencies

```json
{
  "express": "^4.21.0",        // HTTP server
  "axios": "^1.8.0",         // HTTP client
  "cors": "^2.8.5",           // CORS middleware
  "dotenv": "^16.4.0"         // Environment variables
}
```

---

## 🏗️ Architecture

### Request Flow

| Stage | Component | Description |
|:-----:|-----------|-------------|
| 1 | **Client** | Browser, app, or `curl` sends request |
| 2 | **Express Server** | Routes request, applies CORS + security headers + rate limiting |
| 3 | **Cache Check** | In-memory Map with TTL — hit = instant response |
| 4 | **Fetch Data** | AniList GraphQL or Miruro pipe endpoint |
| 5 | **Decode** | Pipe responses decoded: base64url → gunzip → JSON |
| 6 | **Cache + Respond** | Store in cache, return JSON response |

### Caching Architecture

```mermaid
flowchart TD
    A["📥 Request"] --> B{"🧠 Memory Cache<br/>(Map + TTL)"}
    B -- HIT --> C["⚡ Return Cached<br/>~50ms"]
    B -- MISS --> D["📡 Fetch from<br/>AniList / Miruro"]
    D --> E["🔍 Decode<br/>base64url + gzip"]
    E --> F["💾 Cache Result<br/>(1-5 min TTL)"]
    F --> G["📤 Return Fresh"]

    style A fill:#1e1e2e,stroke:#a78bfa,color:#f1f5f9
    style B fill:#1e1e2e,stroke:#f43f8e,color:#f1f5f9
    style C fill:#1e1e2e,stroke:#22c55e,color:#f1f5f9
    style D fill:#1e1e2e,stroke:#6366f1,color:#f1f5f9
    style E fill:#1e1e2e,stroke:#06b6d4,color:#f1f5f9
    style F fill:#1e1e2e,stroke:#a855f7,color:#f1f5f9
    style G fill:#1e1e2e,stroke:#22c55e,color:#f1f5f9
```

> 💡 Serverless functions have read-only filesystems except `/tmp`. The cache uses in-memory `Map` which survives across warm invocations.

---

## 📁 Project Structure

```
MiruroAPI/
├── 📂 public/                              # 🌐 Static files
│   ├── 📄 index.html                       #    📖 Premium landing page (real Miruro icons)
│   ├── 📄 docs.html                        #    📘 Swagger UI interactive documentation
│   ├── 📄 openapi.json                     #    📋 OpenAPI 3.0 spec
│   ├── 📄 icon-dark.svg                    #    🌙 Miruro dark mode favicon
│   ├── 📄 icon-light.svg                   #    ☀️ Miruro light mode favicon
│   ├── 📄 icon-512x512.png                 #    📱 Miruro app icon
│   ├── 📄 favicon.ico                      #    🔖 Classic favicon
│   ├── 📄 apple-touch-icon-180x180.png     #    🍎 iOS home screen icon
│   └── 📄 og-image.png                     #    🖼️ OG/Twitter share image
│
├── 📂 assets/                              # 🎨 Scraped Miruro assets
│   ├── 📂 favicons/                        #    🔖 All favicon variants
│   ├── 📂 logos/                           #    🏷️ Status page logo
│   ├── 📂 fonts/                           #    🔤 Inter + FontAwesome
│   └── 📂 media/                           #    🖼️ Testimonial avatars
│
├── 📂 src/                                 # ⚙️ Core logic
│   ├── 📂 helpers/                         #    🛠️ Integration modules
│   │   ├── 📄 anilist.js                   #       🌸 AniList GraphQL integration
│   │   ├── 📄 pipe.js                      #       📺 Miruro pipe integration
│   │   └── 📄 cache.js                     #       💾 In-memory cache with TTL
│   │
│   └── 📂 routes/                          #    🛤️ Express routes
│       └── 📄 apiRoutes.js                 #       🌐 Main API routes (46 endpoints)
│
├── 📄 server.js                            # 🚀 Express server entry point
├── 📄 package.json                         # 📦 Dependencies & scripts
├── 📄 vercel.json                          # ▲ Vercel routing config
├── 📄 Dockerfile                           # 🐳 Docker support
├── 📄 .dockerignore                        # 🐳 Docker ignore
├── 📄 CHANGELOG.md                         # 📝 Version history
└── 📄 README.md                            # 📖 This file
```

---

## 🚀 Quick Start

### Prerequisites

| Requirement | Minimum | Recommended |
|:---|:---|:---|
| 📦 Node.js | 20.x | 20.x LTS |
| 📦 npm | 9.0+ | 10.x |
| 💻 OS | Windows, macOS, Linux | Any |

### 🔧 Installation

```bash
# 1️⃣ Clone the repository
git clone https://github.com/Shineii86/MiruroAPI.git
cd MiruroAPI

# 2️⃣ Install dependencies
npm install

# 3️⃣ Start development server
npm run dev
```

> 🌐 Open [http://localhost:3000](http://localhost:3000) in your browser.

### 🏗️ Build for Production

```bash
# Start production server
npm start
```

### 🐳 Alternative Package Managers

```bash
# Using yarn
yarn install
yarn dev

# Using pnpm
pnpm install
pnpm dev

# Using bun
bun install
bun dev
```

---

## ⚙️ Configuration

### Environment Variables

| Variable | Default | Description |
|:---|:---|:---|
| `PORT` | `3000` | Server port (Express mode only) |
| `ALLOWED_ORIGINS` | `*` | Comma-separated allowed origins (restricts CORS in production) |
| `PIPE_OBF_KEY` | `71951034...` | Pipe response XOR obfuscation key (hex, 32 chars) |
| `PRU_PROXY_KEY` | `a54d389c...` | PRU proxy URL XOR key (hex, 32 chars) |
| `SCRAPER_API_KEY` | — | ScraperAPI key for Cloudflare bypass (requires premium plan, $49/mo) |
| `FLARESOLVERR_URL` | — | FlareSolverr URL for browser-based bypass (e.g., `http://127.0.0.1:8191`) |

> ⚠️ **Required for production:** Set `ALLOWED_ORIGINS` to restrict CORS. Set `PIPE_OBF_KEY` and `PRU_PROXY_KEY` for pipe decoding.
>
> 📺 **For streaming:** Set `SCRAPER_API_KEY` (requires ScraperAPI premium plan) or `FLARESOLVERR_URL` (free, self-hosted) to bypass Cloudflare bot protection. See [How to Fix Streaming Issues](#-how-to-fix-streaming-issues).

### Vercel Configuration

The `vercel.json` file handles:
- **Builds** — Maps `server.js` to `@vercel/node`
- **Routes** — All requests forwarded to Express

---

## 📡 API Endpoints

### Base URL
```
https://mirurotvapi.vercel.app/api
```

### Response Format

All endpoints return:
```json
{
  "success": true,
  "results": { ... }
}
```

### Streaming Flow

To get a stream URL, follow these 3 steps:

```bash
# Step 1: Get episodes (returns provider slugs)
curl "https://mirurotvapi.vercel.app/api/episodes/20"

# Step 2: Get streaming sources (pass provider + anilistId + category + slug)
curl "https://mirurotvapi.vercel.app/api/watch/kiwi/20/sub/animepahe-1"

# Step 3: Play M3U8 in any HLS player
# Use hls.js, video.js, or native <video> with hls support
```

### Sub & Dub Switch

Providers return both `sub` and `dub` episode lists:

```javascript
const eps = await fetch("/api/episodes/20").then(r => r.json());
const kiwi = eps.results.providers.kiwi.episodes;

// Pick sub or dub
const subEps = kiwi.sub;  // [{ id: "watch/kiwi/20/sub/anikoto-1", ... }]
const dubEps = kiwi.dub;  // [{ id: "watch/kiwi/20/dub/...", ... }]

// Get stream URL
const stream = await fetch(`/api/watch/kiwi/20/sub/animepahe-1`).then(r => r.json());
// stream.results.streams[0].url = "https://...m3u8"
```

---

> ## 🏥 GET Health Check

### Endpoint

```bash
/health
```

#### Parameters

> No parameters required.

#### Example of request

```bash
curl "https://mirurotvapi.vercel.app/api/health"
```

```javascript
import axios from "axios";
const resp = await axios.get("https://mirurotvapi.vercel.app/api/health");
console.log(resp.data);
```

#### Sample Response

```json
{
  "success": true,
  "results": {
    "status": "healthy",
    "version": "2.3.2",
    "uptime": "0h 0m 34s",
    "uptimeSeconds": 34,
    "timestamp": "2026-06-09T09:55:00.884Z",
    "node": "v24.14.1",
    "memory": { "used": "13MB", "total": "15MB" },
    "endpoints": 46,
    "providers": ["kiwi","pewe","bee","bonk","bun","ally","nun","twin","cog","moo","hop","telli"]
  }
}
```

---

> ## 📊 GET Stats

### Endpoint

```bash
/stats
```

#### Parameters

> No parameters required.

#### Example of request

```bash
curl "https://mirurotvapi.vercel.app/api/stats"
```

```javascript
import axios from "axios";
const resp = await axios.get("https://mirurotvapi.vercel.app/api/stats");
console.log(resp.data);
```

#### Sample Response

```json
{
  "success": true,
  "results": {
    "uptime": "0h 0m 34s",
    "requests": { "total": 156, "errors": 3, "successRate": "98.1%" },
    "cache": { "size": 12, "maxSize": 100, "ttl": "1 min" },
    "endpoints": 46,
    "timestamp": "2026-06-09T09:55:00.884Z"
  }
}
```

---

> ## 🔍 GET Search

### Endpoint

```bash
/search
```

#### Parameters

| Parameter | Type | Mandatory | Default | Description |
| :-------: | :--: | :-------: | :-----: | :---------: |
| `query` | `string` | Yes ✔️ | — | Search keyword |
| `page` | `number` | No | `1` | Page number |
| `per_page` | `number` | No | `20` | Results per page |

#### Example of request

```bash
curl "https://mirurotvapi.vercel.app/api/search?query=naruto&per_page=2"
```

```javascript
import axios from "axios";
const resp = await axios.get("https://mirurotvapi.vercel.app/api/search", {
  params: { query: "naruto", per_page: 2 }
});
console.log(resp.data);
```

#### Sample Response

```json
{
  "success": true,
  "results": {
    "page": 1,
    "perPage": 2,
    "total": 5000,
    "hasNextPage": true,
    "results": [
      {
        "id": 20,
        "title": { "romaji": "NARUTO", "english": "Naruto", "native": "NARUTO -ナルト-" },
        "coverImage": { "large": "https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx20-dE6UHbFFg1A5.jpg" },
        "format": "TV",
        "season": "FALL",
        "seasonYear": 2002,
        "episodes": 220,
        "status": "FINISHED",
        "averageScore": 80,
        "genres": ["Action","Adventure","Comedy","Drama","Fantasy","Supernatural"]
      }
    ]
  }
}
```

---

> ## 💡 GET Search Suggestions

### Endpoint

```bash
/suggestions
```

#### Parameters

| Parameter | Type | Mandatory | Default | Description |
| :-------: | :--: | :-------: | :-----: | :---------: |
| `query` | `string` | Yes ✔️ | — | Search keyword |

#### Example of request

```bash
curl "https://mirurotvapi.vercel.app/api/suggestions?query=naruto"
```

```javascript
import axios from "axios";
const resp = await axios.get("https://mirurotvapi.vercel.app/api/suggestions", {
  params: { query: "naruto" }
});
console.log(resp.data);
```

#### Sample Response

```json
{
  "success": true,
  "results": [
    { "id": 20, "title": "Naruto", "title_romaji": "NARUTO", "poster": "https://s4.anilist.co/file/...", "format": "TV", "status": "FINISHED", "year": 2002, "episodes": 220 },
    { "id": 1735, "title": "Naruto: Shippuden", "title_romaji": "NARUTO: Shippuuden", "poster": "https://s4.anilist.co/file/...", "format": "TV", "status": "FINISHED", "year": 2007, "episodes": 500 }
  ]
}
```

---

> ## 🎯 GET Filter

### Endpoint

```bash
/filter
```

#### Parameters

| Parameter | Type | Mandatory | Default | Description |
| :-------: | :--: | :-------: | :-----: | :---------: |
| `genre` | `string` | No | — | Genre name (e.g. "Action") |
| `tag` | `string` | No | — | Tag name |
| `year` | `number` | No | — | Release year |
| `season` | `string` | No | — | FALL, WINTER, SPRING, SUMMER |
| `format` | `string` | No | — | TV, MOVIE, OVA, ONA, SPECIAL, MUSIC |
| `status` | `string` | No | — | RELEASING, FINISHED, NOT_YET_RELEASED, CANCELLED |
| `sort` | `string` | No | POPULARITY_DESC | Sort order |
| `page` | `number` | No | `1` | Page number |
| `per_page` | `number` | No | `20` | Results per page |

#### Example of request

```bash
curl "https://mirurotvapi.vercel.app/api/filter?genre=Action&year=2024&season=WINTER&per_page=3"
```

```javascript
import axios from "axios";
const resp = await axios.get("https://mirurotvapi.vercel.app/api/filter", {
  params: { genre: "Action", year: 2024, season: "WINTER", per_page: 3 }
});
console.log(resp.data);
```

#### Sample Response

```json
{
  "success": true,
  "results": {
    "page": 1,
    "perPage": 3,
    "total": 5000,
    "hasNextPage": true,
    "results": [
      {
        "id": 21,
        "title": { "romaji": "ONE PIECE", "english": "One Piece" },
        "coverImage": { "large": "https://..." },
        "format": "TV",
        "status": "RELEASING",
        "averageScore": 85
      }
    ]
  }
}
```

---

> ## 📈 GET Trending

### Endpoint

```bash
/trending
```

#### Parameters

| Parameter | Type | Mandatory | Default | Description |
| :-------: | :--: | :-------: | :-----: | :---------: |
| `per_page` | `number` | No | `20` | Results per page |

#### Example of request

```bash
curl "https://mirurotvapi.vercel.app/api/trending?per_page=3"
```

```javascript
import axios from "axios";
const resp = await axios.get("https://mirurotvapi.vercel.app/api/trending", {
  params: { per_page: 3 }
});
console.log(resp.data);
```

#### Sample Response

```json
{
  "success": true,
  "results": {
    "page": 1,
    "perPage": 3,
    "total": 5000,
    "hasNextPage": true,
    "results": [
      {
        "id": 21,
        "title": { "romaji": "ONE PIECE", "english": "One Piece" },
        "coverImage": { "large": "https://..." },
        "format": "TV",
        "status": "RELEASING",
        "averageScore": 85
      }
    ]
  }
}
```

---

> ## 🏆 GET Popular

### Endpoint

```bash
/popular
```

#### Parameters

| Parameter | Type | Mandatory | Default | Description |
| :-------: | :--: | :-------: | :-----: | :---------: |
| `per_page` | `number` | No | `20` | Results per page |

#### Example of request

```bash
curl "https://mirurotvapi.vercel.app/api/popular?per_page=3"
```

```javascript
import axios from "axios";
const resp = await axios.get("https://mirurotvapi.vercel.app/api/popular", {
  params: { per_page: 3 }
});
console.log(resp.data);
```

---

> ## 📅 GET Upcoming

### Endpoint

```bash
/upcoming
```

#### Parameters

| Parameter | Type | Mandatory | Default | Description |
| :-------: | :--: | :-------: | :-----: | :---------: |
| `per_page` | `number` | No | `20` | Results per page |

#### Example of request

```bash
curl "https://mirurotvapi.vercel.app/api/upcoming?per_page=3"
```

```javascript
import axios from "axios";
const resp = await axios.get("https://mirurotvapi.vercel.app/api/upcoming", {
  params: { per_page: 3 }
});
console.log(resp.data);
```

---

> ## 🆕 GET Recent

### Endpoint

```bash
/recent
```

#### Parameters

| Parameter | Type | Mandatory | Default | Description |
| :-------: | :--: | :-------: | :-----: | :---------: |
| `per_page` | `number` | No | `20` | Results per page |

#### Example of request

```bash
curl "https://mirurotvapi.vercel.app/api/recent?per_page=3"
```

```javascript
import axios from "axios";
const resp = await axios.get("https://mirurotvapi.vercel.app/api/recent", {
  params: { per_page: 3 }
});
console.log(resp.data);
```

---

> ## ⭐ GET Spotlight

### Endpoint

```bash
/spotlight
```

#### Parameters

> No parameters required.

#### Example of request

```bash
curl "https://mirurotvapi.vercel.app/api/spotlight"
```

```javascript
import axios from "axios";
const resp = await axios.get("https://mirurotvapi.vercel.app/api/spotlight");
console.log(resp.data);
```

#### Sample Response

```json
{
  "success": true,
  "results": [
    {
      "id": 21,
      "title": { "romaji": "ONE PIECE", "english": "One Piece" },
      "coverImage": { "large": "https://..." },
      "bannerImage": "https://...",
      "format": "TV",
      "episodes": null,
      "status": "RELEASING",
      "averageScore": 85,
      "genres": ["Action","Adventure","Comedy","Fantasy"],
      "description": "Gol D. Roger was known as the Pirate King..."
    }
  ]
}
```

---

> ## 📅 GET Schedule

### Endpoint

```bash
/schedule
```

#### Parameters

| Parameter | Type | Mandatory | Default | Description |
| :-------: | :--: | :-------: | :-----: | :---------: |
| `date` | `string` | No | today | Date in `YYYY-MM-DD` format |

#### Example of request

```bash
curl "https://mirurotvapi.vercel.app/api/schedule?date=2026-06-09"
```

```javascript
import axios from "axios";
const resp = await axios.get("https://mirurotvapi.vercel.app/api/schedule", {
  params: { date: "2026-06-09" }
});
console.log(resp.data);
```

---

> ## ℹ️ GET Anime Info

### Endpoint

```bash
/info/:id
```

#### Parameters

| Parameter | Type | Mandatory | Default | Description |
| :-------: | :--: | :-------: | :-----: | :---------: |
| `id` | `number` | Yes ✔️ | — | AniList anime ID |

#### Example of request

```bash
curl "https://mirurotvapi.vercel.app/api/info/20"
```

```javascript
import axios from "axios";
const resp = await axios.get("https://mirurotvapi.vercel.app/api/info/20");
console.log(resp.data);
```

#### Sample Response

```json
{
  "success": true,
  "results": {
    "id": 20,
    "idMal": 20,
    "title": { "romaji": "NARUTO", "english": "Naruto", "native": "NARUTO -ナルト-" },
    "description": "Naruto Uzumaki, a hyperactive and knuckle-headed ninja...",
    "coverImage": { "large": "https://s4.anilist.co/file/..." },
    "bannerImage": "https://s4.anilist.co/file/...",
    "format": "TV",
    "season": "FALL",
    "seasonYear": 2002,
    "episodes": 220,
    "duration": 23,
    "status": "FINISHED",
    "averageScore": 80,
    "popularity": 694959,
    "genres": ["Action","Adventure","Comedy","Drama","Fantasy","Supernatural"],
    "studios": [{ "name": "Studio Pierrot", "isAnimationStudio": true }],
    "startDate": { "year": 2002, "month": 10, "day": 3 },
    "endDate": { "year": 2007, "month": 2, "day": 8 }
  }
}
```

---

> ## 🎭 GET Characters

### Endpoint

```bash
/anime/:id/characters
```

#### Parameters

| Parameter | Type | Mandatory | Default | Description |
| :-------: | :--: | :-------: | :-----: | :---------: |
| `id` | `number` | Yes ✔️ | — | AniList anime ID |

#### Example of request

```bash
curl "https://mirurotvapi.vercel.app/api/anime/20/characters"
```

```javascript
import axios from "axios";
const resp = await axios.get("https://mirurotvapi.vercel.app/api/anime/20/characters");
console.log(resp.data);
```

#### Sample Response

```json
{
  "success": true,
  "results": {
    "edges": [
      {
        "role": "MAIN",
        "node": {
          "id": 17,
          "name": { "full": "Naruto Uzumaki", "native": "うずまきナルト" },
          "image": { "large": "https://s4.anilist.co/file/..." }
        },
        "voiceActors": [
          {
            "id": 95015,
            "name": { "full": "Junko Takeuchi", "native": "竹内順子" },
            "languageV2": "Japanese"
          }
        ]
      }
    ]
  }
}
```

---

> ## 🔗 GET Relations

### Endpoint

```bash
/anime/:id/relations
```

#### Parameters

| Parameter | Type | Mandatory | Default | Description |
| :-------: | :--: | :-------: | :-----: | :---------: |
| `id` | `number` | Yes ✔️ | — | AniList anime ID |

#### Example of request

```bash
curl "https://mirurotvapi.vercel.app/api/anime/20/relations"
```

```javascript
import axios from "axios";
const resp = await axios.get("https://mirurotvapi.vercel.app/api/anime/20/relations");
console.log(resp.data);
```

---

> ## 💡 GET Recommendations

### Endpoint

```bash
/anime/:id/recommendations
```

#### Parameters

| Parameter | Type | Mandatory | Default | Description |
| :-------: | :--: | :-------: | :-----: | :---------: |
| `id` | `number` | Yes ✔️ | — | AniList anime ID |

#### Example of request

```bash
curl "https://mirurotvapi.vercel.app/api/anime/20/recommendations"
```

```javascript
import axios from "axios";
const resp = await axios.get("https://mirurotvapi.vercel.app/api/anime/20/recommendations");
console.log(resp.data);
```

---

> ## 📺 GET Episodes

### Endpoint

```bash
/episodes/:id
```

#### Parameters

| Parameter | Type | Mandatory | Default | Description |
| :-------: | :--: | :-------: | :-----: | :---------: |
| `id` | `number` | Yes ✔️ | — | AniList anime ID |

#### Example of request

```bash
curl "https://mirurotvapi.vercel.app/api/episodes/20"
```

```javascript
import axios from "axios";
const resp = await axios.get("https://mirurotvapi.vercel.app/api/episodes/20");
console.log(resp.data);
```

#### Sample Response

```json
{
  "success": true,
  "results": {
    "providers": {
      "kiwi": {
        "meta": { "id": "1571", "title": "Naruto", "type": "TV" },
        "episodes": {
          "sub": [
            {
              "id": "watch/kiwi/20/sub/anikoto-1",
              "number": 1,
              "title": "Enter: Naruto Uzumaki!",
              "image": "https://image.tmdb.org/t/p/original/...",
              "airDate": "2002-10-03",
              "audio": "sub",
              "filler": false,
              "fillerType": "manga_canon"
            }
          ]
        }
      }
    }
  }
}
```

---

> ## 📡 GET Watch (Streaming Sources)

### Endpoint

```bash
/watch/:provider/:anilistId/:category/:slug
```

#### Parameters

| Parameter | Type | Mandatory | Default | Description |
| :-------: | :--: | :-------: | :-----: | :---------: |
| `provider` | `string` | Yes ✔️ | — | Provider name (kiwi, pewe, etc.) |
| `anilistId` | `number` | Yes ✔️ | — | AniList anime ID |
| `category` | `string` | Yes ✔️ | — | sub or dub |
| `slug` | `string` | Yes ✔️ | — | Episode slug from episodes response |

#### Example of request

```bash
curl "https://mirurotvapi.vercel.app/api/watch/kiwi/20/sub/animepahe-1"
```

```javascript
import axios from "axios";
const resp = await axios.get("https://mirurotvapi.vercel.app/api/watch/kiwi/20/sub/animepahe-1");
console.log(resp.data);
```

#### Sample Response

```json
{
  "success": true,
  "results": {
    "streams": [
      {
        "url": "https://vault-01.uwucdn.top/stream/.../uwu.m3u8",
        "type": "hls",
        "quality": "360p",
        "resolution": { "width": 640, "height": 360 },
        "codec": "h264",
        "audio": "sub",
        "fansub": "df68",
        "isActive": false,
        "referer": "https://kwik.cx/e/..."
      },
      {
        "url": "https://kwik.cx/e/...",
        "type": "embed",
        "quality": "360p",
        "codec": "h264",
        "audio": "sub",
        "fansub": "df68",
        "isActive": false
      }
    ],
    "download": "https://pahe.win/LJmbA"
  }
}
```

---

## 🎬 Streaming Flow

To get a stream URL, follow these 3 steps:

```bash
# Step 1: Get episodes (returns provider slugs)
curl "https://mirurotvapi.vercel.app/api/episodes/20"
# => providers.kiwi.episodes.sub[0].id = "watch/kiwi/20/sub/anikoto-1"

# Step 2: Get streaming sources
curl "https://mirurotvapi.vercel.app/api/watch/kiwi/20/sub/animepahe-1"
# => streams[0].url = "https://...m3u8"

# Step 3: Play M3U8 in any HLS player
# Use hls.js, video.js, or native <video> with hls support
```

### 📺 Sub & Dub

Providers return both `sub` and `dub` episode lists:

```javascript
const eps = await fetch("/api/episodes/20").then(r => r.json());
const providers = eps.results.providers;

// Pick provider
const kiwi = providers.kiwi.episodes;

// Get sub episodes
const subEps = kiwi.sub; // [{ id: "watch/kiwi/20/sub/anikoto-1", ... }]

// Get dub episodes (if available)
const dubEps = kiwi.dub || []; // [{ id: "watch/kiwi/20/dub/...", ... }]
```

### 🎥 HLS Player Example

```html
<script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
<video id="player" controls></video>
<script>
  const video = document.getElementById('player');
  const streamUrl = 'https://...m3u8'; // From /api/watch response
  
  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(streamUrl);
    hls.attachMedia(video);
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = streamUrl; // Native HLS (Safari)
  }
</script>
```

---

## 📋 API Response Schema

### Success Response
```json
{
  "success": true,
  "results": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

### Anime Item Object

| Field | Type | Description | Example |
|:---|:---|:---|:---|
| `id` | `number` | AniList ID | `20` |
| `title` | `object` | `{ romaji, english, native }` | `{ "romaji": "NARUTO" }` |
| `coverImage` | `object` | `{ large }` | `{ "large": "https://..." }` |
| `format` | `string` | Anime format | `"TV"` |
| `status` | `string` | Release status | `"FINISHED"` |
| `episodes` | `number` | Total episodes | `220` |
| `averageScore` | `number` | AniList score | `80` |
| `genres` | `string[]` | Genre list | `["Action","Adventure"]` |

### Episode Object

| Field | Type | Description | Example |
|:---|:---|:---|:---|
| `id` | `string` | Watch slug | `"watch/kiwi/20/sub/anikoto-1"` |
| `number` | `number` | Episode number | `1` |
| `title` | `string` | Episode title | `"Enter: Naruto Uzumaki!"` |
| `image` | `string` | Thumbnail URL | `"https://..."` |
| `airDate` | `string` | Air date | `"2002-10-03"` |
| `audio` | `string` | `sub` or `dub` | `"sub"` |
| `filler` | `boolean` | Is filler episode | `false` |

### Stream Object

| Field | Type | Description | Example |
|:---|:---|:---|:---|
| `url` | `string` | M3U8 or embed URL | `"https://...m3u8"` |
| `type` | `string` | `hls` or `embed` | `"hls"` |
| `quality` | `string` | Video quality | `"720p"` |
| `resolution` | `object` | `{ width, height }` | `{ "width": 1280, "height": 720 }` |
| `codec` | `string` | Video codec | `"h264"` |
| `audio` | `string` | `sub` or `dub` | `"sub"` |
| `fansub` | `string` | Fansub group | `"df68"` |
| `isActive` | `boolean` | Is active stream | `false` |
| `referer` | `string` | Referer URL | `"https://kwik.cx/e/..."` |

---

## 🌐 Deployment

### ▲ Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Shineii86/MiruroAPI)

1. Click the button above (or import manually on vercel.com)
2. Vercel auto-detects the project — **no config needed**
3. Your API is live! 🎉

```bash
# Or use Vercel CLI
npx vercel --prod
```

### 🖥️ Standalone Server

```bash
# Clone and install
git clone https://github.com/Shineii86/MiruroAPI.git
cd MiruroAPI && npm install

# Start production server
npm start
# → http://localhost:3000
```

### 🐳 Docker

```bash
# Build
docker build -t miruroapi .

# Run
docker run -p 3000:3000 miruroapi
```

### ⚡ Cloudflare Worker (Streaming Fixed)

> **Streaming endpoints work on Cloudflare Workers** — edge-to-edge requests bypass Cloudflare bot detection.

```bash
# Install wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy worker
wrangler deploy worker.js --name miruroapi
```

**Why Workers Work:**
```
Vercel (datacenter) → miruro.to → Cloudflare blocks ❌
Worker (edge) → miruro.to → Cloudflare trusts itself ✅
```

**Features:** Zero cold starts, 100K free requests/day, no npm dependencies, 15 API endpoints.

**Optional env vars:**
```bash
wrangler secret put SCRAPER_API_KEY    # ScraperAPI premium key ($49/mo)
wrangler secret put FLARESOLVERR_URL   # FlareSolverr Docker URL
```

---

## 📜 Available Scripts

| Command | Description | Details |
|:---|:---|:---|
| `npm run dev` | 🔥 Start development server | Runs on `localhost:3000` |
| `npm start` | 🚀 Start production server | `node server.js` |

---

## ⚡ Performance

| Metric | Value |
|:---|:---|
| ⚡ Cold start | ~500ms |
| 🔄 Warm response | ~50-200ms |
| 💾 Cache hit | ~10ms |
| 💾 Cache TTL | 1-5 minutes |
| ⏱️ Rate limit | 100 req/min/IP |
| 💻 Memory usage | ~15MB |
| 📦 Cache max size | 100 entries |

### Optimization Features

- 💾 **In-memory cache** — Map-based with TTL expiration
- ⚡ **Pipe decoding** — Efficient base64url + gzip decompression
- 🎯 **Selective fetching** — Only AniList GraphQL or Miruro pipe
- 📁 **Minimal deps** — Only 4 production dependencies
- 🔄 **Graceful fallback** — Empty arrays on error, never crashes

---

## 📝 Changelog Highlights

| Version | Date | Key Changes |
|:---|:---|:---|
| **2.3.2** | 2026-08-05 | Cloudflare Worker implementation — edge-to-edge streaming bypass, wrangler.toml, 15 Worker endpoints |
| **2.3.1** | 2026-07-02 | Self-healing fallback system — multi-method pipe recovery, /api/pipe-health endpoint, ScraperAPI + FlareSolverr support |
| **2.1.4** | 2026-06-25 | Security hardening — XOR keys to env vars, CORS restriction, input sanitization, bug fixes (multi-search, deepTranslate, getBestStream) |
| **2.1.3** | 2026-06-25 | Diagnostic sweep — tags, random, character/staff 404 fixes, pipe retry with backoff, security headers |
| **2.1.2** | 2026-06-25 | Streaming architecture — pru proxy decode, CDN CORS proxy, raw stream URLs |
| **2.1.1** | 2026-06-25 | Pipe XOR decoding fix — responses now decode correctly |
| **2.1.0** | 2026-06-25 | Provider capabilities, enriched metadata, skip times, 12 providers |
| **2.0.1** | 2026-06-24 | Streaming improvements — better subtitle extraction, quality fallback |
| **2.0.0** | 2026-06-25 | Major upgrade — 44 endpoints, compression, streaming improvements |

> 📝 See [CHANGELOG.md](./CHANGELOG.md) for the full version history.

---

## 🔧 Troubleshooting

| Problem | Cause | Solution |
|:---|:---|:---|
| ❌ `npm install` fails | Node.js version too old | Upgrade to Node.js 20+ (`node -v`) |
| ❌ CORS errors | Origin not in ALLOWED_ORIGINS | Set `ALLOWED_ORIGINS` env var or use `*` for all origins |
| ❌ 404 on API routes | Wrong URL format | Use `/api/` prefix, not just `/` |
| ❌ Empty episodes | Provider not available | Check which providers return data for the anime |
| ❌ Deploy fails on Vercel | Build error | Check `node server.js` locally first |
| ❌ Slow first request | Serverless cold start | Normal — first request after idle takes ~500ms |
| ❌ Rate limited | Too many requests | Cache reduces this — wait for TTL expiry |
| ❌ **Streaming 500 errors** | **Cloudflare blocks pipe requests** | **Set `SCRAPER_API_KEY` or `FLARESOLVERR_URL`** (see below) |

### 🎬 How to Fix Streaming Issues

Streaming endpoints fail because Cloudflare's bot protection blocks requests from Vercel's datacenter IPs. The pipe endpoint (`miruro.to/api/secure/pipe`) returns HTTP 403 to any request that doesn't come from a residential IP or real browser.

#### Why Does This Happen?

```
Your App (Vercel) → Cloudflare WAF → miruro.to/api/secure/pipe → 403 Blocked
```

Cloudflare detects:
- Datacenter IP ranges (Vercel, AWS, GCP, etc.)
- Missing browser fingerprint headers
- Non-residential traffic patterns

#### Fix 1: FlareSolverr (Best — Free, Works!)

FlareSolverr runs a headless browser that bypasses Cloudflare automatically. This is the most reliable fix.

```bash
# 1. Run FlareSolverr on your own server
docker run -d --name flaresolverr -p 8191:8191 ghcr.io/flaresolverr/flaresolverr:latest

# 2. Add to Vercel environment variables:
FLARESOLVERR_URL=http://your-server-ip:8191
```

**Cost:** Free (self-hosted). Requires a VPS with Docker.

**Requirements:**
- 1GB+ RAM
- Public IP address
- Docker installed

#### Fix 2: ScraperAPI (Paid — $49/month)

ScraperAPI proxies your requests through residential IPs, bypassing Cloudflare.

```bash
# 1. Sign up at https://www.scraperapi.com/
# 2. Get your API key from the dashboard
# 3. Add to Vercel environment variables:
SCRAPER_API_KEY=your_api_key_here
```

**Cost:** $49/month (premium plan required for protected domains like Miruro).

#### Fix 3: Self-Host the Entire API

If you run the API on your own VPS (not Vercel), requests come from your IP which may not be blocked.

```bash
# Clone and install
git clone https://github.com/Shineii86/MiruroAPI.git
cd MiruroAPI && npm install

# Start on your own server
npm start
# → http://your-server:3000
```

#### Verifying the Fix

After setting an environment variable, check if streaming works:

```bash
# Check pipe health
curl "https://mirurotvapi.vercel.app/api/pipe-health"

# Test episodes
curl "https://mirurotvapi.vercel.app/api/episodes/20"
```

Expected response when streaming works:
```json
{
  "success": true,
  "results": {
    "methods": {
      "direct": { "status": "failed" },
      "scraperapi": { "status": "working", "latency": "1200ms" }
    },
    "working": 1,
    "recommendation": "ScraperAPI is working. Streaming endpoints are functional."
  }
}
```

### 🤝 Contributing Bypass Solutions

Streaming is blocked on all cloud platforms. We need help! If you can implement any of these, PRs are welcome:

#### Free / Open Source (Best for self-hosted)

| Tool | Language | How It Works | Notes |
|------|----------|-------------|-------|
| [nodriver](https://github.com/ultrafunkamsterdam/nodriver) | Python | CDP-based browser automation, bypasses automation detection | Successor to undetected-chromedriver |
| [Camoufox](https://github.com/nicandris/camoufox) | Python | Stealth Firefox with fingerprint spoofing | 82% baseline Turnstile bypass |
| [curl_cffi](https://github.com/nicandris/curl_cffi) | Python | TLS fingerprint impersonation | Lightweight, no browser needed |
| [FlareSolverr](https://github.com/FlareSolverr/FlareSolverr) | Docker | Headless Chrome proxy server | Can't solve interactive CAPTCHAs |
| [patchright](https://github.com/nicandris/patchright) | Python | Patched Playwright fork | Drop-in Playwright replacement |
| [scrapy-impersonate](https://github.com/driver-utils/scrapy-impersonate) | Python | Scrapy with TLS impersonation | For Scrapy users |

#### Paid APIs (Good for cloud deployments)

| Service | Free Tier | Price | API Example |
|---------|-----------|-------|-------------|
| [Scrape.do](https://scrape.do) | 1,000 credits/mo | $0.08/1K | `https://api.scrape.do/?url=...&token=...` |
| [ZenRows](https://zenrows.com) | Trial | $49/mo | `https://api.zenrows.com/?url=...&apikey=...` |
| [ScrapingBee](https://scrapingbee.com) | Trial | $49/mo | `https://app.scrapingbee.com/api/v1/?...` |

#### What to Implement

1. **Node.js integration** — Add `nodriver` or `Camoufox` as a pipe fallback in `src/helpers/pipe.js`
2. **Scrape.do adapter** — Simple HTTP proxy, 1K free credits/mo, no browser needed
3. **Playwright stealth mode** — Use `patchright` or `playwright-extra-stealth` for browser-based bypass
4. **Residential proxy support** — Add proxy rotation for pipe requests

#### How to Contribute

1. Fork the repo
2. Add your bypass method as a new fallback in `src/helpers/pipe.js`
3. Add your API key to `.env.example`
4. Test with: `curl http://localhost:3000/api/episodes/20`
5. Submit a PR

```bash
# Example: Add Scrape.do as a fallback
SCRAPE_DO_TOKEN=your_token_here
```

### 🐛 Debug Mode

```bash
# Run with verbose logging
NODE_ENV=development npm run dev

# Test specific endpoint
curl http://localhost:3000/api/health
curl http://localhost:3000/api/search?query=naruto
curl http://localhost:3000/api/episodes/20
```

---

## ❓ FAQ

<details>
<summary><b>🔍 How do I search for anime?</b></summary>
<br/>
Use <code>/api/search?query=your+search</code>. Results include title, cover, format, status, episodes, and score. For autocomplete suggestions, use <code>/api/suggestions?query=your+search</code> which returns fast suggestions.
</details>

<details>
<summary><b>📺 How do I get episode lists?</b></summary>
<br/>
Use <code>/api/episodes/:id</code> where <code>:id</code> is the AniList anime ID (e.g., <code>20</code> for Naruto). The response includes all providers with sub/dub episode lists.
</details>

<details>
<summary><b>🎯 How does filtering work?</b></summary>
<br/>
Use <code>/api/filter</code> with query params. Combine <code>genre</code>, <code>year</code>, <code>season</code>, <code>format</code>, <code>status</code>, and <code>sort</code> for advanced filtering. All params are optional.
</details>

<details>
<summary><b>📡 Can I use this in my frontend app?</b></summary>
<br/>
Yes! CORS is enabled for allowed origins. Set the `ALLOWED_ORIGINS` environment variable to your frontend domain(s), or use `*` for all origins. Example: <code>fetch('https://mirurotvapi.vercel.app/api/search?query=naruto')</code>
</details>

<details>
<summary><b>🔄 How often does the data refresh?</b></summary>
<br/>
The cache TTL is 1-5 minutes depending on the endpoint. After that, the next request triggers a fresh fetch from AniList/Miruro.
</details>

<details>
<summary><b>🌐 Can I self-host this?</b></summary>
<br/>
Yes! Use <code>npm start</code> to run the Express server on any VPS, Docker container, or PaaS. The Vercel serverless functions are optional — <code>server.js</code> handles everything.
</details>

<details>
<summary><b>🎬 Which streaming providers are available?</b></summary>
<br/>
12 providers: kiwi, pewe, bee, bonk, bun, ally, nun, twin, cog, moo, hop, telli. Not all anime are available on every provider.
</details>

<details>
<summary><b>❌ Why are streaming endpoints returning 500 errors?</b></summary>
<br/>
Cloudflare's bot protection blocks requests from Vercel's datacenter IPs. The pipe endpoint (<code>miruro.to/api/secure/pipe</code>) returns HTTP 403. To fix this, set <code>SCRAPER_API_KEY</code> (requires ScraperAPI premium plan, $49/mo) or <code>FLARESOLVERR_URL</code> (self-hosted, free) in your Vercel environment variables. See <a href="#-how-to-fix-streaming-issues">How to Fix Streaming Issues</a> above.
</details>

<details>
<summary><b>🔍 Why does /api/staff/:id return 404?</b></summary>
<br/>
Some AniList staff IDs don't exist or have limited data. Try searching with <code>/api/staff?query=name</code> instead. This is an AniList API limitation, not a bug.
</details>

<details>
<summary><b>📊 How do I check if streaming is working?</b></summary>
<br/>
Use <code>/api/pipe-health</code> to check which pipe methods are working. It shows the status of Direct, ScraperAPI, and FlareSolverr fallback methods with latency and error details.
</details>

---

## 🗺️ Roadmap

### 🎯 Planned Features

- [ ] 🔐 **API key authentication** — Per-user rate limits
- [ ] 📊 **Analytics endpoint** — Usage statistics
- [ ] 🌙 **Dark/light mode** — Theme toggle for landing page
- [ ] 📱 **PWA support** — Install as app on mobile
- [ ] 🔔 **Webhook notifications** — Push new episodes to Discord
- [ ] 🗄️ **Redis cache** — Persistent caching for serverless
- [ ] 🌐 **Multi-language** — Sub/dub language metadata
- [ ] 📦 **NPM package** — Client SDK for easy integration

### ✅ Completed

- [x] 🎬 46 API endpoints covering all data
- [x] 🔍 Full-text search with pagination
- [x] 💡 Search suggestions for autocomplete
- [x] 🎯 Advanced filtering (genre, year, season, format, sort)
- [x] 🎭 Characters + voice actors from AniList
- [x] 🔗 Relations and recommendations
- [x] ⏭️ Skip timestamps (OP/ED)
- [x] 📡 12 streaming providers with M3U8 URLs
- [x] 🔄 Smart caching with configurable TTL
- [x] 🚀 One-click Vercel deployment
- [x] 🐳 Docker support
- [x] 📘 Swagger UI interactive docs
- [x] 📖 Comprehensive documentation with real API data
- [x] 🔒 Security hardening (XOR keys in env vars, CORS restriction, input sanitization)
- [x] 🛡️ Security headers at CDN level

---

## 🤝 Contributing

*Contributions are welcome and appreciated! Here's how you can help:*

<table>
<tr>
<td width="25%" align="center">

### 🐛 Report Bugs
Found something broken?

[Open an Issue](https://github.com/Shineii86/MiruroAPI/issues)

</td>
<td width="25%" align="center">

### 💡 Suggest Features
Have an idea?

[Start a Discussion](https://github.com/Shineii86/MiruroAPI/issues)

</td>
<td width="25%" align="center">

### 🔀 Submit PRs
Ready to contribute code?

[Fork & Submit](https://github.com/Shineii86/MiruroAPI/fork)

</td>
</tr>
</table>

### 🔄 How to Contribute

```bash
# 1️⃣ Fork the repository
# Click the "Fork" button on GitHub

# 2️⃣ Clone your fork
git clone https://github.com/YOUR_USERNAME/MiruroAPI.git
cd MiruroAPI

# 3️⃣ Create a feature branch
git checkout -b feature/amazing-feature

# 4️⃣ Make your changes
# Edit files, add features, fix bugs...

# 5️⃣ Commit your changes
git commit -m 'feat: add amazing feature'

# 6️⃣ Push to your fork
git push origin feature/amazing-feature

# 7️⃣ Open a Pull Request
# Go to GitHub and create a PR
```

### 📋 Guidelines

- ✅ Follow the existing code style and documentation conventions
- ✅ Write meaningful commit messages (use [conventional commits](https://www.conventionalcommits.org/))
- ✅ Update CHANGELOG.md with your changes
- ✅ Keep PRs focused — one feature or fix per PR
- ✅ Add JSDoc comments for new functions
- ❎ Don't commit `node_modules` or cache files
- ❎ Don't add unrelated changes to a single PR

---

## 🙏 Acknowledgements

### 🎬 Data Sources

| Source | About |
|:---|:---|
| [AniList](https://anilist.co) | Anime metadata API (GraphQL) |
| [Miruro](https://www.miruro.to) | Anime streaming site — source for episodes and streaming |
| [Miruro TO](https://miruro.to) | Mirror domain |
| [Miruro BZ](https://miruro.bz) | Mirror domain |
| [Miruro RU](https://miruro.ru) | Mirror domain |

### 🛠️ Technologies

- **[Express](https://expressjs.com/)** — Fast, unopinionated web framework
- **[AniList GraphQL](https://anilist.gitbook.io/anilist-apiv2-docs/)** — Rich anime metadata
- **[Axios](https://axios-http.com/)** — Promise-based HTTP client
- **[Vercel](https://vercel.com/)** — Serverless deployment platform

### 📝 Resources

- [Shields.io](https://shields.io/) — Badges for README
- [Star History](https://star-history.com/) — GitHub star history charts
- [Capsule Render](https://github.com/kyechan99/capsule-render) — Header banner generator

---

## 📄 License

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge&logo=mit&logoColor=white)](./LICENSE)

This project is licensed under the **MIT License**.

Free to use, modify, and distribute — see the [LICENSE](LICENSE) file for details.

</div>

---

## 👤 Author

<div align="center">

  <a href="https://github.com/Shineii86/MiruroAPI">
  <img src="https://github.com/AniWaifuBot/Waifus/blob/main/Source/Banner.png" alt="Banner" width="100%" />
  </a>
  
</div>
  
<p align="center">
  <b style="font-size: 5.5em;">Shinei Nouzen</b>
  <br/>
  <sub>Full-Stack Developer & Anime Enthusiast</sub>
  <br/><br/>
  <a href="https://github.com/Shineii86"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/></a>
  <a href="https://telegram.me/Shineii86"><img src="https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white" alt="Telegram"/></a>
  <a href="https://instagram.com/ikx7.a"><img src="https://img.shields.io/badge/Instagram-C13584?style=for-the-badge&logo=instagram&logoColor=white" alt="Instagram"/></a>
  <a href="mailto:ikx7a@hotmail.com"><img src="https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white" alt="Email"/></a>
</p>

---

## ⭐ Star History

<p align="center">
  <a href="https://star-history.com/#Shineii86/MiruroAPI&Date">
    <img src="https://api.star-history.com/svg?repos=Shineii86/MiruroAPI&type=Date" alt="Star History Chart" width="100%"/>
  </a>
</p>

> ⭐ If you found this project useful, please consider giving it a star!

---

<div align="center">
  <p align="center">
    <b>Made With ❤️ For The Anime Community</b>
    <br/><br/>
    <sub>© Shinei Nouzen. All Rights Reserved.</sub>
  </p>
</div>
