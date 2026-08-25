# Streaming Flow Guide

This guide explains how to get streaming URLs from MiruroAPI in 3 steps.

## Overview

```
Option A (Pipe-based — may be Cloudflare-blocked):
  Step 1: Get Episodes       →  /api/episodes/:anilistId
  Step 2: Get Stream URLs    →  /api/watch/:provider/:anilistId/:category/:slug
  Step 3: Play M3U8          →  Use HLS player

Option B (Direct embed — no Cloudflare blocking):
  Step 1: Get Embed URLs     →  /api/embed/:anilistId/:episode
  Step 2: Embed in iframe    →  <iframe src="..."></iframe>
```

---

## Alternative: Direct Embed (Recommended)

If pipe-based streaming is blocked by Cloudflare, use direct embed providers instead:

```bash
# Step 1: Get embed URLs for all providers
curl "https://mirurotvapi.vercel.app/api/embed/20/1?lang=sub"

# Step 2: Embed the URL in an iframe
<iframe src="https://anixo.buzz/embed/ani/20/1/sub" allow="autoplay; fullscreen"></iframe>
```

| Provider | URL Pattern | CORS |
|----------|-------------|------|
| Megavid | `megavid.buzz/ani/{id}/{ep}/{lang}` | No |
| AniXo | `anixo.buzz/embed/ani/{id}/{ep}/{lang}` | Yes |

This approach bypasses Cloudflare entirely — no scraping, no proxy, works from any environment.

---

## Step 1: Get Episodes

Each anime has episodes from multiple providers. Fetch the episode list with the AniList ID.

**Request:**

```bash
curl "https://mirurotvapi.vercel.app/api/episodes/20"
```

**Response:**

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
              "id": "watch/kiwi/20/sub/animepahe-1",
              "number": 1,
              "title": "Enter: Naruto Uzumaki!",
              "image": "https://image.tmdb.org/t/p/original/...",
              "airDate": "2002-10-03",
              "audio": "sub",
              "filler": false
            }
          ]
        }
      }
    }
  }
}
```

> **Key field:** `id` in each episode — Pass this to the next step.

---

## Step 2: Get Stream URLs

Use the episode `id` from Step 1 to get M3U8 streaming URLs.

**Request:**

```bash
curl "https://mirurotvapi.vercel.app/api/watch/kiwi/20/sub/animepahe-1"
```

**Response:**

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
      }
    ],
    "download": "https://pahe.win/LJmbA"
  }
}
```

> **Done!** Use `streams[0].url` in your HLS video player.

---

## Step 3: Play M3U8

### HLS.js (Browser)

```html
<script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
<video id="player" controls></video>

<script>
const url = 'https://vault-01.uwucdn.top/stream/.../uwu.m3u8';
const video = document.getElementById('player');

if (Hls.isSupported()) {
  const hls = new Hls();
  hls.loadSource(url);
  hls.attachMedia(video);
} else if (video.canPlayType('application/vnd.apple.mpegurl')) {
  video.src = url; // Native HLS (Safari)
}
</script>
```

---

## JavaScript Example

```javascript
async function getStreamUrl(anilistId) {
  // Step 1: Get episodes
  const episodesRes = await fetch(`https://mirurotvapi.vercel.app/api/episodes/${anilistId}`);
  const episodesData = await episodesRes.json();
  const providers = episodesData.results.providers;
  
  // Pick first provider with sub episodes
  const provider = Object.keys(providers)[0];
  const episodes = providers[provider].episodes.sub;
  
  if (!episodes || episodes.length === 0) {
    throw new Error('No episodes found');
  }
  
  // Use first episode's id
  const episodeId = episodes[0].id; // "watch/kiwi/20/sub/animepahe-1"
  const parts = episodeId.split('/');
  const category = parts[3]; // "sub"
  const slug = parts[4]; // "animepahe-1"
  
  // Step 2: Get stream URLs
  const streamRes = await fetch(`https://mirurotvapi.vercel.app/api/watch/${provider}/${anilistId}/${category}/${slug}`);
  const streamData = await streamRes.json();
  
  return streamData.results.streams[0].url; // "https://...m3u8"
}

// Usage
getStreamUrl(20)
  .then(url => console.log('Stream URL:', url))
  .catch(err => console.error('Error:', err));
```

---

## Python Example

```python
import requests

def get_stream_url(anilist_id):
    base = "https://mirurotvapi.vercel.app/api"
    
    # Step 1: Get episodes
    episodes_res = requests.get(f"{base}/episodes/{anilist_id}")
    episodes_data = episodes_res.json()
    providers = episodes_data['results']['providers']
    
    # Pick first provider
    provider = list(providers.keys())[0]
    episodes = providers[provider]['episodes']['sub']
    
    if not episodes:
        raise Exception("No episodes found")
    
    episode_id = episodes[0]['id']  # "watch/kiwi/20/sub/animepahe-1"
    parts = episode_id.split('/')
    category = parts[3]
    slug = parts[4]
    
    # Step 2: Get stream URLs
    stream_res = requests.get(f"{base}/watch/{provider}/{anilist_id}/{category}/{slug}")
    stream_data = stream_res.json()
    
    return stream_data['results']['streams'][0]['url']

# Usage
url = get_stream_url(20)
print(f"Stream URL: {url}")
```

---

## Sub & Dub

Providers return both `sub` and `dub` episode lists:

```javascript
const eps = await fetch("/api/episodes/20").then(r => r.json());
const kiwi = eps.results.providers.kiwi.episodes;

// Get sub episodes
const subEps = kiwi.sub;  // [{ id: "watch/kiwi/20/sub/animepahe-1", ... }]

// Get dub episodes (if available)
const dubEps = kiwi.dub;  // [{ id: "watch/kiwi/20/dub/...", ... }]
```

---

## Available Providers

| Provider | Sub | Dub | Download | Skip Times |
|:---|:---:|:---:|:---:|:---:|
| kiwi | ✅ | ❌ | ✅ | ❌ |
| pewe | ✅ | ❌ | ❌ | ❌ |
| bee | ✅ | ✅ | ❌ | ❌ |
| bonk | ✅ | ✅ | ✅ | ✅ |
| bun | ✅ | ✅ | ❌ | ❌ |
| ally | ✅ | ❌ | ✅ | ❌ |
| nun | ✅ | ❌ | ❌ | ❌ |
| twin | ✅ | ✅ | ❌ | ❌ |
| cog | ✅ | ❌ | ❌ | ❌ |
| moo | ✅ | ❌ | ✅ | ❌ |
| hop | ❌ | ✅ | ❌ | ❌ |
| telli | ✅ | ❌ | ❌ | ❌ |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "No episodes found" | Check the AniList ID is correct (use `/api/search` first) |
| "No providers" | The anime may not be available on any provider |
| Stream URL 403 | Some servers require specific referrer headers — the self-healing system auto-rotates mirrors |
| CORS error | Use a proxy or access from server-side |

## Self-Healing Fallback (v2.3.0)

When Cloudflare blocks streaming requests, the API automatically tries fallback methods:
- **Direct** → Mirror rotation across 4 domains (miruro.to, miruro.ru, miruro.bz, miruro.tv)
- **ScraperAPI** → Free proxy bypass (1K req/month, set `SCRAPER_API_KEY` env var)
- **FlareSolverr** → Self-hosted browser proxy for full Cloudflare bypass

Check the fallback system status: `GET /api/pipe-health`
