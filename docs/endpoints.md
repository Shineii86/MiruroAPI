# API Endpoints Reference

Complete documentation for all 49 MiruroAPI v2.3.3 endpoints.

---

## Table of Contents

### Search & Discovery
- [Search](#search)
- [Suggestions](#suggestions)
- [Filter](#filter)
- [Multi-Search](#multi-search)

### Collections
- [Trending](#trending)
- [Trending Daily](#trending-daily)
- [Trending Weekly](#trending-weekly)
- [Popular](#popular)
- [Top](#top)
- [Upcoming](#upcoming)
- [Recent](#recent)
- [Spotlight](#spotlight)
- [Schedule](#schedule)
- [Random](#random)
- [Upcoming Countdown](#upcoming-countdown)

### Seasonal & Studio
- [Seasonal Anime](#seasonal-anime)
- [Anime by Studio](#anime-by-studio)

### Genres & Tags
- [Genres](#genres)
- [Tags](#tags)
- [Anime by Genre](#anime-by-genre)
- [Anime by Year](#anime-by-year)
- [Anime by Status](#anime-by-status)
- [Anime by Format](#anime-by-format)

### Character & Staff
- [Character Detail](#character-detail)
- [Staff Detail](#staff-detail)
- [Search Characters](#search-characters)
- [Search Staff](#search-staff)

### Anime Details
- [Anime Info](#anime-info)
- [Characters](#characters)
- [Relations](#relations)
- [Recommendations](#recommendations)

### Streaming & Downloading
- [Episodes](#episodes)
- [Batch Episodes](#batch-episodes)
- [Sources (Detailed)](#sources-detailed)
- [Stream (Quality Fallback)](#stream-quality-fallback)
- [Download URL](#download-url)
- [Watch (Streaming)](#watch-streaming)

### Direct Embed (no scraping)
- [Embed All Providers](#embed-all-providers)
- [Embed Specific Provider](#embed-specific-provider)
- [Embed Providers List](#embed-providers-list)

### Utility
- [Compare](#compare)
- [Genre Stats](#genre-stats)
- [Calendar](#calendar)
- [Timeline](#timeline)

### System
- [Health Check](#health-check)
- [Stats](#stats)
- [OpenAPI](#openapi)

---

## Search

```
GET /api/search?query=naruto
```

Full-text anime search with pagination.

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| query | string | required | Search query |
| page | int | 1 | Page number |
| per_page | int | 20 | Results per page (max 50) |

---

## Suggestions

```
GET /api/suggestions?query=naruto
```

Lightweight autocomplete suggestions (max 8 results).

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| query | string | required | Search query |

---

## Filter

```
GET /api/filter?genre=Action&year=2024&season=SPRING
```

Advanced anime filter with multiple parameters.

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| genre | string | — | Genre name |
| tag | string | — | Tag name |
| year | int | — | Season year |
| season | string | — | WINTER, SPRING, SUMMER, FALL |
| format | string | — | TV, MOVIE, OVA, ONA, SPECIAL |
| status | string | — | RELEASING, FINISHED, NOT_YET_RELEASED |
| sort | string | POPULARITY_DESC | Sort order |
| page | int | 1 | Page number |
| per_page | int | 20 | Results per page |

---

## Multi-Search

```
GET /api/multi-search?q=naruto&genre=Action&year=2024
```

Combined query + filters search.

---

## Trending

```
GET /api/trending?page=1&per_page=20
```

Currently trending anime.

---

## Trending Daily

```
GET /api/trending/daily
```

Trending anime from the last 7 days.

---

## Trending Weekly

```
GET /api/trending/weekly
```

Trending anime from the last 30 days.

---

## Popular

```
GET /api/popular
```

Most popular anime of all time.

---

## Top

```
GET /api/top
```

Top anime by score (all time).

---

## Upcoming

```
GET /api/upcoming
```

Most anticipated upcoming anime.

---

## Recent

```
GET /api/recent
```

Currently airing anime.

---

## Spotlight

```
GET /api/spotlight
```

Top 10 trending + popular anime for hero banners.

---

## Schedule

```
GET /api/schedule?page=1&per_page=20
```

Airing schedule with timestamps.

---

## Random

```
GET /api/random
```

Returns a random anime.

---

## Upcoming Countdown

```
GET /api/upcoming/countdown
```

Next 10 episodes airing soon.

---

## Seasonal Anime

```
GET /api/season/2025/spring
```

Anime for a specific year and season.

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| year | int | required | Year (e.g., 2025) |
| season | string | required | WINTER, SPRING, SUMMER, FALL |

---

## Anime by Studio

```
GET /api/studio/MAPPA
```

All anime produced by a specific studio.

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| name | string | required | Studio name |

---

## Genres

```
GET /api/genres
```

Returns all available genres from AniList.

---

## Tags

```
GET /api/tags
```

Returns all available tags from AniList.

---

## Anime by Genre

```
GET /api/genre/Action
```

All anime in a specific genre.

---

## Anime by Year

```
GET /api/year/2024
```

All anime from a specific year.

---

## Anime by Status

```
GET /api/status/RELEASING
```

All anime with a specific status (RELEASING, FINISHED, NOT_YET_RELEASED).

---

## Anime by Format

```
GET /api/format/MOVIE
```

All anime with a specific format (TV, MOVIE, OVA, ONA, SPECIAL).

---

## Character Detail

```
GET /api/character/1
```

Detailed character info with anime list.

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| id | int | required | AniList character ID |

---

## Staff Detail

```
GET /api/staff/1
```

Detailed staff info with anime list.

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| id | int | required | AniList staff ID |

---

## Search Characters

```
GET /api/characters?query=kaneki
```

Search characters by name.

---

## Search Staff

```
GET /api/staff?query=oda
```

Search staff by name.

---

## Anime Info

```
GET /api/info/20605
```

Complete anime info including characters, relations, recommendations, trailer, stats.

---

## Characters

```
GET /api/anime/20605/characters?page=1&per_page=25
```

Paginated character list with voice actors.

---

## Relations

```
GET /api/anime/20605/relations
```

Related anime (sequels, prequels, spin-offs).

---

## Recommendations

```
GET /api/anime/20605/recommendations?page=1&per_page=10
```

Community recommendations sorted by rating.

---

## Episodes

```
GET /api/episodes/20605
```

Episode list from all providers with sub/dub support.

---

## Batch Episodes

```
GET /api/episodes/20605/batch?provider=kiwi&category=sub&slugs=animepahe-1,animepahe-2
```

Fetch multiple episode sources in parallel.

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| provider | string | kiwi | Provider name |
| category | string | sub | sub or dub |
| slugs | string | required | Comma-separated episode slugs |

---

## Sources (Detailed)

```
GET /api/sources?episodeId=xxx&provider=kiwi&anilistId=20605&category=sub
```

Streaming sources with raw episode ID.

---

## Stream (Quality Fallback)

```
GET /api/stream?provider=kiwi&anilistId=20605&category=sub&slug=animepahe-1&quality=1080p
```

Streaming sources with automatic quality fallback.

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| provider | string | required | Provider name |
| anilistId | int | required | AniList anime ID |
| category | string | sub | sub or dub |
| slug | string | required | Episode slug |
| quality | string | 1080p | Preferred quality |

---

## Download URL

```
GET /api/download?provider=kiwi&anilistId=20605&category=sub&slug=animepahe-1
```

Returns the download URL for an episode.

---

## Watch (Streaming)

```
GET /api/watch/kiwi/20605/sub/animepahe-1
```

Streaming sources via URL path (recommended).

| Param | Type | Description |
|-------|------|-------------|
| provider | string | Provider name |
| anilistId | int | AniList anime ID |
| category | string | sub or dub |
| slug | string | Episode slug |

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| streams | array | Array of stream objects (hls/embed) |
| download | string | Direct download URL (if available) |
| subtitles | array | Subtitle objects (if available) |
| bestStream | object | Best available HLS stream with quality fallback |

### Subtitle Object

| Field | Type | Description |
|-------|------|-------------|
| url | string | VTT subtitle file URL |
| label | string | Display name (e.g., "English") |
| language | string | Language code (e.g., "en") |
| kind | string | "subtitles" or "captions" |
| format | string | "vtt" format |
| encoding | string | "utf-8" |
| isDefault | boolean | Is default subtitle |

### Note
- Bonk provider returns subtitles (English, VTT format)
- Other providers may not return subtitles
- Quality fallback: 1080p → 720p → 480p → 360p

---

## Compare

```
GET /api/compare/20605/20
```

Compare two anime side by side.

| Param | Type | Description |
|-------|------|-------------|
| id1 | int | First anime ID |
| id2 | int | Second anime ID |

---

## Genre Stats

```
GET /api/stats/genre
```

Genre statistics with top anime per genre.

---

## Calendar

```
GET /api/calendar?year=2025&month=6
```

Monthly airing calendar.

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| year | int | current | Year |
| month | int | current | Month (1-12) |

---

## Timeline

```
GET /api/timeline/20605
```

Anime release timeline with prequels, sequels, spin-offs.

---

## Embed All Providers

```
GET /api/embed/:anilistId/:episode
```

Returns iframe-ready embed URLs for all available providers. No scraping required.

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| anilistId | int | required | AniList anime ID |
| episode | int | required | Episode number |
| lang | string | sub | Language: `sub` or `dub` |
| malId | int | optional | MAL ID (uses MAL-based URLs if provided) |

---

## Embed Specific Provider

```
GET /api/embed/:anilistId/:episode/:provider
```

Returns embed URL for a specific provider.

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| anilistId | int | required | AniList anime ID |
| episode | int | required | Episode number |
| provider | string | required | Provider ID: `megavid` or `anixo` |
| lang | string | sub | Language: `sub` or `dub` |

---

## Embed Providers List

```
GET /api/embed-providers
```

Lists all available embed providers with example URLs.

---

## Health Check

```
GET /api/health
```

API health status, version, uptime, memory, cache stats.

**Response:**

```json
{
  "success": true,
  "results": {
    "status": "healthy",
    "version": "2.3.0",
    "uptime": "0h 0m 34s",
    "node": "v24.14.1",
    "memory": { "used": "13MB", "total": "15MB", "rss": "25MB" },
    "cache": { "size": 12, "maxSize": 100 },
    "endpoints": 45,
    "providers": ["kiwi","pewe","bee","bonk","bun","ally","nun","twin","cog","moo","hop","telli"]
  }
}
```

---

## Pipe Health

```
GET /api/pipe-health
```

Returns the status of the self-healing fallback system — mirror availability, ScraperAPI/FlareSolverr status, and last successful method.

---

## Stats

```
GET /api/stats
```

Cache & API statistics including request count and success rate.

---

## OpenAPI

```
GET /api/openapi
```

Returns the OpenAPI 3.0.3 specification in JSON format.

---

> 📝 All endpoints return `{ "success": true, "results": {...} }` on success and `{ "success": false, "message": "..." }` on error.
> 
> 🎬 Creator attribution is injected into every response: `{ "creator": "Shinei Nouzen", "github": "...", "telegram": "...", "message": "...", "timestamp": "..." }`
