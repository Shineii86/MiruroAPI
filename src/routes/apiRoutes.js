/*
 * ======= • ======= • ======= • ======= • =======• =======
 * MiruroAPI — apiRoutes.js
 * Repository: https://github.com/Shineii86/MiruroAPI
 *
 * @description
 *   Central API router that maps all Express GET endpoints to their
 *   corresponding handler functions. Each route wraps its handler
 *   in try/catch for consistent error handling. Includes health,
 *   stats, streaming, and OpenAPI specification endpoints.
 *
 * @exports
 *   createApiRoutes - Function that registers all API routes
 *
 * @author  Shinei Nouzen
 * @license MIT
 * ======= • ======= • ======= • ======= • =======• =======
 */

const express = require("express");
const anilist = require("../helpers/anilist");
const pipe = require("../helpers/pipe");
const { pipeHealthCheck } = require("../helpers/pipe");
const { getCached, setCache } = require("../helpers/cache");
const { addCreatorInfo } = require("../middleware/creatorInfo");

// ---- FEATURE: Input sanitization helpers ----
const sanitizeId = (val) => {
  const n = parseInt(val);
  return isNaN(n) || n <= 0 ? null : n;
};

const sanitizeString = (val, maxLen = 100) => {
  if (typeof val !== "string") return null;
  const cleaned = val.replace(/[<>"'`;\\]/g, "").trim();
  return cleaned.length > 0 && cleaned.length <= maxLen ? cleaned : null;
};

// ══════════════════════════════════════════════════════════════
// ROUTE REGISTRATION
// ══════════════════════════════════════════════════════════════

const createApiRoutes = (jsonResponse, jsonError, startTime) => {
  const router = express.Router();

  // ══════════════════════════════════════════════════════════════
  // CREATOR ATTRIBUTION (must be before all routes)
  // ══════════════════════════════════════════════════════════════

  router.use(addCreatorInfo);

  // ══════════════════════════════════════════════════════════════
  // REQUEST COUNTER
  // ══════════════════════════════════════════════════════════════

  const requestCount = { total: 0, errors: 0 };
  router.use((req, res, next) => {
    requestCount.total++;
    res.on("finish", () => {
      if (res.statusCode >= 400) requestCount.errors++;
    });
    next();
  });

  // ══════════════════════════════════════════════════════════════
  // SEARCH & DISCOVERY
  // ══════════════════════════════════════════════════════════════

  // ---- FEATURE: Full-text anime search with pagination ----
  router.get("/search", async (req, res) => {
    try {
      const { query, page = 1, per_page = 20 } = req.query;
      if (!query) return jsonError(res, "query parameter is required", 400);

      const cacheKey = `search:${query}:${page}:${per_page}`;
      let result = getCached(cacheKey);
      if (!result) {
        result = await anilist.searchAnime(query, parseInt(page), parseInt(per_page));
        setCache(cacheKey, result);
      }

      jsonResponse(res, result);
    } catch (err) {
      jsonError(res, err.message);
    }
  });

  // ---- FEATURE: Lightweight autocomplete suggestions (max 8) ----
  router.get("/suggestions", async (req, res) => {
    try {
      const { query } = req.query;
      if (!query) return jsonError(res, "query parameter is required", 400);

      const cacheKey = `suggestions:${query}`;
      let result = getCached(cacheKey);
      if (!result) {
        result = await anilist.getSuggestions(query);
        setCache(cacheKey, result, 120 * 1000);
      }

      jsonResponse(res, result);
    } catch (err) {
      jsonError(res, err.message);
    }
  });

  // ---- FEATURE: Advanced anime filter with multiple parameters ----
  router.get("/filter", async (req, res) => {
    try {
      const { genre, tag, year, season, format, status, sort = "POPULARITY_DESC", page = 1, per_page = 20 } = req.query;
      const cacheKey = `filter:${genre}:${tag}:${year}:${season}:${format}:${status}:${sort}:${page}:${per_page}`;

      let result = getCached(cacheKey);
      if (!result) {
        result = await anilist.filterAnime({
          genre, tag, year: year ? parseInt(year) : null,
          season, format, status, sort,
          page: parseInt(page), perPage: parseInt(per_page),
        });
        setCache(cacheKey, result);
      }

      jsonResponse(res, result);
    } catch (err) {
      jsonError(res, err.message);
    }
  });

  // ---- FEATURE: Multi-parameter search (query + filters combined) ----
  router.get("/multi-search", async (req, res) => {
    try {
      const { q, genre, tag, year, season, format, status, sort = "POPULARITY_DESC", page = 1, per_page = 20 } = req.query;

      const result = await anilist.filterAnime({
        search: q || null,
        genre, tag, year: year ? parseInt(year) : null,
        season, format, status, sort,
        page: parseInt(page), perPage: parseInt(per_page),
      });

      jsonResponse(res, result);
    } catch (err) {
      jsonError(res, err.message);
    }
  });

  // ══════════════════════════════════════════════════════════════
  // COLLECTIONS
  // ══════════════════════════════════════════════════════════════

  // ---- FEATURE: Currently trending anime ----
  router.get("/trending", async (req, res) => {
    try {
      const { page = 1, per_page = 20 } = req.query;
      const cacheKey = `trending:${page}:${per_page}`;

      let result = getCached(cacheKey);
      if (!result) {
        result = await anilist.getCollection("TRENDING_DESC", null, parseInt(page), parseInt(per_page));
        setCache(cacheKey, result, 120 * 1000);
      }

      jsonResponse(res, result);
    } catch (err) {
      jsonError(res, err.message);
    }
  });

  // ---- FEATURE: Daily trending anime ----
  router.get("/trending/daily", async (req, res) => {
    try {
      const { page = 1, per_page = 20 } = req.query;
      const cacheKey = `trending:daily:${page}:${per_page}`;

      let result = getCached(cacheKey);
      if (!result) {
        result = await anilist.getTrendingDaily(parseInt(page), parseInt(per_page));
        setCache(cacheKey, result, 120 * 1000);
      }

      jsonResponse(res, result);
    } catch (err) {
      jsonError(res, err.message);
    }
  });

  // ---- FEATURE: Weekly trending anime ----
  router.get("/trending/weekly", async (req, res) => {
    try {
      const { page = 1, per_page = 20 } = req.query;
      const cacheKey = `trending:weekly:${page}:${per_page}`;

      let result = getCached(cacheKey);
      if (!result) {
        result = await anilist.getTrendingWeekly(parseInt(page), parseInt(per_page));
        setCache(cacheKey, result, 120 * 1000);
      }

      jsonResponse(res, result);
    } catch (err) {
      jsonError(res, err.message);
    }
  });

  // ---- FEATURE: Most popular anime of all time ----
  router.get("/popular", async (req, res) => {
    try {
      const { page = 1, per_page = 20 } = req.query;
      const cacheKey = `popular:${page}:${per_page}`;

      let result = getCached(cacheKey);
      if (!result) {
        result = await anilist.getCollection("POPULARITY_DESC", null, parseInt(page), parseInt(per_page));
        setCache(cacheKey, result, 120 * 1000);
      }

      jsonResponse(res, result);
    } catch (err) {
      jsonError(res, err.message);
    }
  });

  // ---- FEATURE: Top anime by score (all time) ----
  router.get("/top", async (req, res) => {
    try {
      const { page = 1, per_page = 20 } = req.query;
      const cacheKey = `top:${page}:${per_page}`;

      let result = getCached(cacheKey);
      if (!result) {
        result = await anilist.getTopAnime(parseInt(page), parseInt(per_page));
        setCache(cacheKey, result, 300 * 1000);
      }

      jsonResponse(res, result);
    } catch (err) {
      jsonError(res, err.message);
    }
  });

  // ---- FEATURE: Most anticipated upcoming anime ----
  router.get("/upcoming", async (req, res) => {
    try {
      const { page = 1, per_page = 20 } = req.query;
      const cacheKey = `upcoming:${page}:${per_page}`;

      let result = getCached(cacheKey);
      if (!result) {
        result = await anilist.getCollection("POPULARITY_DESC", "NOT_YET_RELEASED", parseInt(page), parseInt(per_page));
        setCache(cacheKey, result, 120 * 1000);
      }

      jsonResponse(res, result);
    } catch (err) {
      jsonError(res, err.message);
    }
  });

  // ---- FEATURE: Currently airing anime ----
  router.get("/recent", async (req, res) => {
    try {
      const { page = 1, per_page = 20 } = req.query;
      const cacheKey = `recent:${page}:${per_page}`;

      let result = getCached(cacheKey);
      if (!result) {
        result = await anilist.getCollection("START_DATE_DESC", "RELEASING", parseInt(page), parseInt(per_page));
        setCache(cacheKey, result, 120 * 1000);
      }

      jsonResponse(res, result);
    } catch (err) {
      jsonError(res, err.message);
    }
  });

  // ---- FEATURE: Spotlight/featured anime (top 10) ----
  router.get("/spotlight", async (req, res) => {
    try {
      const cacheKey = "spotlight";
      let result = getCached(cacheKey);
      if (!result) {
        result = await anilist.getSpotlight();
        setCache(cacheKey, result, 120 * 1000);
      }

      jsonResponse(res, result);
    } catch (err) {
      jsonError(res, err.message);
    }
  });

  // ---- FEATURE: Airing schedule with timestamps ----
  router.get("/schedule", async (req, res) => {
    try {
      const { page = 1, per_page = 20 } = req.query;
      const cacheKey = `schedule:${page}:${per_page}`;

      let result = getCached(cacheKey);
      if (!result) {
        result = await anilist.getSchedule(parseInt(page), parseInt(per_page));
        setCache(cacheKey, result, 120 * 1000);
      }

      jsonResponse(res, result);
    } catch (err) {
      jsonError(res, err.message);
    }
  });

  // ---- FEATURE: Next 10 episodes airing soon ----
  router.get("/upcoming/countdown", async (req, res) => {
    try {
      const cacheKey = "upcoming:countdown";
      let result = getCached(cacheKey);
      if (!result) {
        result = await anilist.getSchedule(1, 10);
        setCache(cacheKey, result, 60 * 1000);
      }

      jsonResponse(res, result);
    } catch (err) {
      jsonError(res, err.message);
    }
  });

  // ---- FEATURE: Random anime of the day ----
  router.get("/random", async (req, res) => {
    try {
      // NOTE: Disable CDN cache + use request timestamp for true randomness
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      const randomPage = (Date.now() % 499) + 1;
      const data = await anilist.getCollection("POPULARITY_DESC", null, randomPage, 1);
      const anime = data.results[0];

      if (!anime) return jsonError(res, "No anime found", 404);
      jsonResponse(res, anime);
    } catch (err) {
      jsonError(res, err.message);
    }
  });

  // ══════════════════════════════════════════════════════════════
  // SEASONAL & STUDIO
  // ══════════════════════════════════════════════════════════════

  // ---- FEATURE: Seasonal anime by year and season ----
  router.get("/season/:year/:season", async (req, res) => {
    try {
      const year = sanitizeId(req.params.year);
      const season = sanitizeString(req.params.season?.toUpperCase());
      if (!year || !season) return jsonError(res, "Invalid year or season", 400);
      const { page = 1, per_page = 20 } = req.query;
      const cacheKey = `season:${year}:${season}:${page}:${per_page}`;

      let result = getCached(cacheKey);
      if (!result) {
        result = await anilist.getSeasonalAnime(year, season, parseInt(page), parseInt(per_page));
        setCache(cacheKey, result, 300 * 1000);
      }

      jsonResponse(res, result);
    } catch (err) {
      jsonError(res, err.message);
    }
  });

  // ---- FEATURE: Anime by studio name ----
  router.get("/studio/:name", async (req, res) => {
    try {
      const name = sanitizeString(decodeURIComponent(req.params.name));
      if (!name) return jsonError(res, "Invalid studio name", 400);
      const { page = 1, per_page = 20 } = req.query;
      const cacheKey = `studio:${name}:${page}:${per_page}`;

      let result = getCached(cacheKey);
      if (!result) {
        result = await anilist.getAnimeByStudio(name, parseInt(page), parseInt(per_page));
        setCache(cacheKey, result, 300 * 1000);
      }

      jsonResponse(res, result);
    } catch (err) {
      jsonError(res, err.message);
    }
  });

  // ══════════════════════════════════════════════════════════════
  // GENRES & TAGS
  // ══════════════════════════════════════════════════════════════

  // ---- FEATURE: Get all available genres ----
  router.get("/genres", async (req, res) => {
    try {
      const cacheKey = "genres";
      let result = getCached(cacheKey);
      if (!result) {
        result = await anilist.getAllGenres();
        setCache(cacheKey, result, 86400 * 1000);
      }

      jsonResponse(res, result);
    } catch (err) {
      jsonError(res, err.message);
    }
  });

  // ---- FEATURE: Get all available tags ----
  router.get("/tags", async (req, res) => {
    try {
      const cacheKey = "tags";
      let result = getCached(cacheKey);
      if (!result) {
        result = await anilist.getAllTags();
        setCache(cacheKey, result, 86400 * 1000);
      }

      jsonResponse(res, result);
    } catch (err) {
      jsonError(res, err.message);
    }
  });

  // ---- FEATURE: Anime by genre name ----
  router.get("/genre/:name", async (req, res) => {
    try {
      const name = sanitizeString(decodeURIComponent(req.params.name));
      if (!name) return jsonError(res, "Invalid genre name", 400);
      const { page = 1, per_page = 20 } = req.query;
      const cacheKey = `genre:${name}:${page}:${per_page}`;

      let result = getCached(cacheKey);
      if (!result) {
        result = await anilist.filterAnime({ genre: name, page: parseInt(page), perPage: parseInt(per_page) });
        setCache(cacheKey, result, 120 * 1000);
      }

      jsonResponse(res, result);
    } catch (err) {
      jsonError(res, err.message);
    }
  });

  // ---- FEATURE: Anime by year ----
  router.get("/year/:year", async (req, res) => {
    try {
      const year = sanitizeId(req.params.year);
      if (!year) return jsonError(res, "Invalid year", 400);
      const { page = 1, per_page = 20 } = req.query;
      const cacheKey = `year:${year}:${page}:${per_page}`;

      let result = getCached(cacheKey);
      if (!result) {
        result = await anilist.filterAnime({ year, page: parseInt(page), perPage: parseInt(per_page) });
        setCache(cacheKey, result, 300 * 1000);
      }

      jsonResponse(res, result);
    } catch (err) {
      jsonError(res, err.message);
    }
  });

  // ---- FEATURE: Anime by status ----
  router.get("/status/:status", async (req, res) => {
    try {
      const status = sanitizeString(req.params.status?.toUpperCase());
      if (!status) return jsonError(res, "Invalid status", 400);
      const { page = 1, per_page = 20 } = req.query;
      const cacheKey = `status:${status}:${page}:${per_page}`;

      let result = getCached(cacheKey);
      if (!result) {
        result = await anilist.filterAnime({ status, page: parseInt(page), perPage: parseInt(per_page) });
        setCache(cacheKey, result, 120 * 1000);
      }

      jsonResponse(res, result);
    } catch (err) {
      jsonError(res, err.message);
    }
  });

  // ---- FEATURE: Anime by format ----
  router.get("/format/:format", async (req, res) => {
    try {
      const format = sanitizeString(req.params.format?.toUpperCase());
      if (!format) return jsonError(res, "Invalid format", 400);
      const { page = 1, per_page = 20 } = req.query;
      const cacheKey = `format:${format}:${page}:${per_page}`;

      let result = getCached(cacheKey);
      if (!result) {
        result = await anilist.filterAnime({ format, page: parseInt(page), perPage: parseInt(per_page) });
        setCache(cacheKey, result, 300 * 1000);
      }

      jsonResponse(res, result);
    } catch (err) {
      jsonError(res, err.message);
    }
  });

  // ══════════════════════════════════════════════════════════════
  // CHARACTER & STAFF
  // ══════════════════════════════════════════════════════════════

  // ---- FEATURE: Character detail with anime list ----
  router.get("/character/:id", async (req, res) => {
    try {
      const id = sanitizeId(req.params.id);
      if (!id) return jsonError(res, "Invalid character ID", 400);

      const cacheKey = `character:${id}`;
      let result = getCached(cacheKey);
      if (!result) {
        result = await anilist.getCharacterInfo(id);
        setCache(cacheKey, result, 600 * 1000);
      }

      jsonResponse(res, result);
    } catch (err) {
      const status = err.message.includes("not found") || err.message.includes("404") ? 404 : 500;
      jsonError(res, err.message, status);
    }
  });

  // ---- FEATURE: Staff detail with anime list ----
  router.get("/staff/:id", async (req, res) => {
    try {
      const id = sanitizeId(req.params.id);
      if (!id) return jsonError(res, "Invalid staff ID", 400);

      const cacheKey = `staff:${id}`;
      let result = getCached(cacheKey);
      if (!result) {
        result = await anilist.getStaffInfo(id);
        setCache(cacheKey, result, 600 * 1000);
      }

      jsonResponse(res, result);
    } catch (err) {
      const status = err.message.includes("not found") || err.message.includes("404") ? 404 : 500;
      jsonError(res, err.message, status);
    }
  });

  // ---- FEATURE: Search characters ----
  router.get("/characters", async (req, res) => {
    try {
      const { query, page = 1, per_page = 20 } = req.query;
      if (!query) return jsonError(res, "query parameter is required", 400);

      const result = await anilist.searchCharacters(query, parseInt(page), parseInt(per_page));
      jsonResponse(res, result);
    } catch (err) {
      jsonError(res, err.message);
    }
  });

  // ---- FEATURE: Search staff ----
  router.get("/staff", async (req, res) => {
    try {
      const { query, page = 1, per_page = 20 } = req.query;
      if (!query) return jsonError(res, "query parameter is required", 400);

      const result = await anilist.searchStaff(query, parseInt(page), parseInt(per_page));
      jsonResponse(res, result);
    } catch (err) {
      jsonError(res, err.message);
    }
  });

  // ══════════════════════════════════════════════════════════════
  // ANIME DETAILS
  // ══════════════════════════════════════════════════════════════

  // ---- FEATURE: Complete anime info by AniList ID ----
  // ---- FEATURE: Full anime info with metadata enrichment ----
  router.get("/info/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return jsonError(res, "Invalid AniList ID", 400);

      const cacheKey = `info:${id}`;
      let result = getCached(cacheKey);
      if (!result) {
        result = await anilist.getAnimeInfo(id);
        setCache(cacheKey, result, 300 * 1000);
      }

      // NOTE: Enrich with miruro-style metadata fields
      const enriched = {
        ...result,
        alternateName: result.synonyms || [],
        aggregateRating: result.averageScore ? {
          ratingValue: result.averageScore,
          bestRating: 100,
          ratingCount: result.favourites || 0,
          meanScore: result.meanScore || null,
        } : null,
        sameAs: (result.externalLinks || []).map((l) => l.url),
        externalLinks: (result.externalLinks || []).map((l) => ({
          url: l.url,
          site: l.site,
          type: l.type,
        })),
        productionCompany: (result.studios?.nodes || [])
          .filter((s) => !s.isAnimationStudio)
          .map((s) => ({ name: s.name, siteUrl: s.siteUrl })),
        animationStudio: (result.studios?.nodes || [])
          .filter((s) => s.isAnimationStudio)
          .map((s) => ({ name: s.name, siteUrl: s.siteUrl })),
        streamingEpisodes: result.streamingEpisodes || [],
        trailer: result.trailer || null,
        nextAiringEpisode: result.nextAiringEpisode || null,
        tags: (result.tags || []).map((t) => t.name),
      };

      jsonResponse(res, enriched);
    } catch (err) {
      jsonError(res, err.message);
    }
  });

  // ---- FEATURE: Paginated character list with voice actors ----
  router.get("/anime/:id/characters", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { page = 1, per_page = 25 } = req.query;
      const result = await anilist.getAnimeCharacters(id, parseInt(page), parseInt(per_page));
      jsonResponse(res, result);
    } catch (err) {
      jsonError(res, err.message);
    }
  });

  // ---- FEATURE: Related anime (sequels, prequels, spin-offs) ----
  router.get("/anime/:id/relations", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = await anilist.getAnimeRelations(id);
      jsonResponse(res, result);
    } catch (err) {
      jsonError(res, err.message);
    }
  });

  // ---- FEATURE: Community recommendations sorted by rating ----
  router.get("/anime/:id/recommendations", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { page = 1, per_page = 10 } = req.query;
      const result = await anilist.getAnimeRecommendations(id, parseInt(page), parseInt(per_page));
      jsonResponse(res, result);
    } catch (err) {
      jsonError(res, err.message);
    }
  });

  // ══════════════════════════════════════════════════════════════
  // STREAMING & DOWNLOADING
  // ══════════════════════════════════════════════════════════════

  // ---- FEATURE: Episode list from all providers ----
  router.get("/episodes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return jsonError(res, "Invalid AniList ID", 400);

      const cacheKey = `episodes:${id}`;
      let result = getCached(cacheKey);
      if (!result) {
        result = await pipe.getEpisodes(id);
        setCache(cacheKey, result, 120 * 1000);
      }

      jsonResponse(res, result);
    } catch (err) {
      jsonError(res, err.message);
    }
  });

  // ---- FEATURE: Batch episode sources ----
  router.get("/episodes/:id/batch", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { provider = "kiwi", category = "sub", slugs } = req.query;

      if (isNaN(id)) return jsonError(res, "Invalid AniList ID", 400);
      if (!slugs) return jsonError(res, "slugs parameter is required (comma-separated)", 400);

      const slugList = slugs.split(",").map((s) => s.trim());
      const result = await pipe.getBatchSources(provider, id, category, slugList);
      jsonResponse(res, result);
    } catch (err) {
      jsonError(res, err.message);
    }
  });

  // ---- FEATURE: Streaming sources (detailed/manual endpoint) ----
  router.get("/sources", async (req, res) => {
    try {
      const { episodeId, provider, anilistId, category = "sub" } = req.query;
      if (!episodeId || !provider || !anilistId) {
        return jsonError(res, "episodeId, provider, and anilistId are required", 400);
      }

      const result = await pipe.getSources(episodeId, provider, parseInt(anilistId), category);
      jsonResponse(res, result);
    } catch (err) {
      jsonError(res, err.message);
    }
  });

  // ---- FEATURE: Streaming sources with quality fallback ----
  // ---- FEATURE: Stream with quality fallback, subtitles, and skip times ----
  router.get("/stream", async (req, res) => {
    try {
      const { provider, anilistId, category = "sub", slug, quality = "1080p" } = req.query;
      if (!provider || !anilistId || !slug) {
        return jsonError(res, "provider, anilistId, and slug are required", 400);
      }

      const sources = await pipe.getWatchSources(provider, parseInt(anilistId), category, slug);
      const bestStream = pipe.getBestStream(sources, quality);
      const subtitles = pipe.extractSubtitles(sources);
      const skipTimes = pipe.extractSkipTimes(sources);

      jsonResponse(res, {
        ...sources,
        bestStream,
        subtitles,
        skipTimes,
      });
    } catch (err) {
      jsonError(res, err.message);
    }
  });

  // ---- FEATURE: Download URL for an episode ----
  router.get("/download", async (req, res) => {
    try {
      const { provider, anilistId, category = "sub", slug } = req.query;
      if (!provider || !anilistId || !slug) {
        return jsonError(res, "provider, anilistId, and slug are required", 400);
      }

      const result = await pipe.getDownloadUrl(provider, parseInt(anilistId), category, slug);
      jsonResponse(res, result);
    } catch (err) {
      jsonError(res, err.message);
    }
  });

  // ---- FEATURE: Streaming sources (simple slug-based endpoint) ----
  router.get("/watch/:provider/:anilistId/:category/:slug", async (req, res) => {
    try {
      const { provider, anilistId, category, slug } = req.params;
      const sources = await pipe.getWatchSources(provider, parseInt(anilistId), category, slug);
      const subtitles = pipe.extractSubtitles(sources);
      const skipTimes = pipe.extractSkipTimes(sources);

      jsonResponse(res, {
        ...sources,
        subtitles,
        skipTimes,
      });
    } catch (err) {
      jsonError(res, err.message);
    }
  });

  // ══════════════════════════════════════════════════════════════
  // UTILITY FEATURES
  // ══════════════════════════════════════════════════════════════

  // ---- FEATURE: Compare two anime side by side ----
  router.get("/compare/:id1/:id2", async (req, res) => {
    try {
      const id1 = parseInt(req.params.id1);
      const id2 = parseInt(req.params.id2);
      if (isNaN(id1) || isNaN(id2)) return jsonError(res, "Invalid anime IDs", 400);

      const cacheKey = `compare:${id1}:${id2}`;
      let result = getCached(cacheKey);
      if (!result) {
        const [anime1, anime2] = await Promise.all([
          anilist.getAnimeInfo(id1),
          anilist.getAnimeInfo(id2),
        ]);

        result = {
          anime1: {
            id: anime1.id,
            title: anime1.title,
            coverImage: anime1.coverImage,
            format: anime1.format,
            episodes: anime1.episodes,
            duration: anime1.duration,
            status: anime1.status,
            averageScore: anime1.averageScore,
            meanScore: anime1.meanScore,
            popularity: anime1.popularity,
            favourites: anime1.favourites,
            genres: anime1.genres,
            studios: anime1.studios,
          },
          anime2: {
            id: anime2.id,
            title: anime2.title,
            coverImage: anime2.coverImage,
            format: anime2.format,
            episodes: anime2.episodes,
            duration: anime2.duration,
            status: anime2.status,
            averageScore: anime2.averageScore,
            meanScore: anime2.meanScore,
            popularity: anime2.popularity,
            favourites: anime2.favourites,
            genres: anime2.genres,
            studios: anime2.studios,
          },
        };

        setCache(cacheKey, result, 600 * 1000);
      }

      jsonResponse(res, result);
    } catch (err) {
      jsonError(res, err.message);
    }
  });

  // ---- FEATURE: Genre statistics ----
  router.get("/stats/genre", async (req, res) => {
    try {
      const cacheKey = "stats:genre";
      let result = getCached(cacheKey);
      if (!result) {
        const genres = await anilist.getAllGenres();
        const stats = {};

        const topGenres = genres.slice(0, 10);
        const results = await Promise.allSettled(
          topGenres.map((genre) =>
            anilist.filterAnime({ genre, perPage: 1 }).then((data) => ({
              genre,
              total: data.total,
              topAnime: data.results[0] || null,
            })).catch(() => ({ genre, total: 0, topAnime: null }))
          )
        );

        for (const r of results) {
          if (r.status === "fulfilled") {
            stats[r.value.genre] = { total: r.value.total, topAnime: r.value.topAnime };
          }
        }

        result = { genres, stats };
        setCache(cacheKey, result, 86400 * 1000);
      }

      jsonResponse(res, result);
    } catch (err) {
      jsonError(res, err.message);
    }
  });

  // ---- FEATURE: Monthly airing calendar ----
  router.get("/calendar", async (req, res) => {
    try {
      const { year, month } = req.query;
      const now = new Date();
      const y = year ? parseInt(year) : now.getFullYear();
      const m = month ? parseInt(month) : now.getMonth() + 1;

      const cacheKey = `calendar:${y}:${m}`;
      let result = getCached(cacheKey);
      if (!result) {
        // NOTE: Get airing schedule for the month
        const schedule = await anilist.getSchedule(1, 200);
        const monthStart = new Date(y, m - 1, 1);
        const monthEnd = new Date(y, m, 0, 23, 59, 59);

        const monthAnime = schedule.results.filter((item) => {
          const airDate = new Date(item.airingAt * 1000);
          return airDate >= monthStart && airDate <= monthEnd;
        });

        // NOTE: Group by date
        const calendar = {};
        monthAnime.forEach((item) => {
          const date = new Date(item.airingAt * 1000).toISOString().split("T")[0];
          if (!calendar[date]) calendar[date] = [];
          calendar[date].push({
            id: item.id,
            title: item.title,
            coverImage: item.coverImage,
            episode: item.next_episode,
            airingAt: item.airingAt,
          });
        });

        result = {
          year: y,
          month: m,
          totalAiring: monthAnime.length,
          calendar,
        };
        setCache(cacheKey, result, 3600 * 1000);
      }

      jsonResponse(res, result);
    } catch (err) {
      jsonError(res, err.message);
    }
  });

  // ---- FEATURE: Anime timeline (release history) ----
  router.get("/timeline/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return jsonError(res, "Invalid AniList ID", 400);

      const cacheKey = `timeline:${id}`;
      let result = getCached(cacheKey);
      if (!result) {
        const info = await anilist.getAnimeInfo(id);
        const relations = await anilist.getAnimeRelations(id);

        // NOTE: Build timeline from relations
        const timeline = relations.relations
          .filter((r) => ["PREQUEL", "SEQUEL", "SIDE_STORY", "SPIN_OFF", "ADAPTATION", "SOURCE"].includes(r.relationType))
          .map((r) => ({
            id: r.node.id,
            title: r.node.title,
            coverImage: r.node.coverImage,
            format: r.node.format,
            status: r.node.status,
            episodes: r.node.episodes,
            meanScore: r.node.meanScore,
            relation: r.relationType,
          }));

        result = {
          id: info.id,
          title: info.title,
          startDate: info.startDate,
          endDate: info.endDate,
          status: info.status,
          episodes: info.episodes,
          timeline,
        };

        setCache(cacheKey, result, 600 * 1000);
      }

      jsonResponse(res, result);
    } catch (err) {
      jsonError(res, err.message);
    }
  });

  // ══════════════════════════════════════════════════════════════
  // HEALTH & STATS
  // ══════════════════════════════════════════════════════════════

  // ---- FEATURE: Provider capabilities and configuration ----
  router.get("/providers", (req, res) => {
    const providers = {
      kiwi: {
        name: "kiwi",
        visible: true,
        player: "native",
        parent: null,
        relationship: null,
        capabilities: { sub: true, ssub: false, download: true, skip_times: false, thumbnails: false },
        proxy: { rotate: false, segments: true },
        cors: false,
      },
      pewe: {
        name: "pewe",
        visible: true,
        player: "native",
        parent: null,
        relationship: null,
        capabilities: { sub: true, ssub: false, download: false, skip_times: false, thumbnails: false },
        proxy: { rotate: false, segments: true },
        cors: false,
      },
      bonk: {
        name: "bonk",
        visible: true,
        player: "native",
        parent: null,
        relationship: null,
        variantOrder: ["ssub", "sub"],
        capabilities: { sub: true, ssub: true, download: true, skip_times: true, thumbnails: false },
        proxy: { rotate: false, segments: false },
        cors: false,
      },
      bee: {
        name: "bee",
        visible: true,
        player: "native",
        parent: null,
        relationship: null,
        capabilities: { sub: false, ssub: true, download: false, skip_times: false, thumbnails: false },
        proxy: { rotate: false, segments: true },
        cors: false,
      },
      ally: {
        name: "ally",
        visible: true,
        player: "native",
        parent: null,
        relationship: null,
        capabilities: { sub: true, ssub: false, download: true, skip_times: false, thumbnails: true },
        proxy: false,
        cors: true,
        fallback: 2,
      },
      moo: {
        name: "moo",
        visible: true,
        player: "native",
        parent: null,
        relationship: null,
        capabilities: { sub: true, ssub: false, download: true, skip_times: false, thumbnails: false },
        proxy: { rotate: false, segments: true },
        cors: false,
      },
      hop: {
        name: "hop",
        visible: true,
        player: "native",
        parent: null,
        relationship: null,
        capabilities: { sub: false, ssub: true, download: false, skip_times: false, thumbnails: true },
        proxy: { rotate: false, segments: true },
        cors: false,
      },
      nun: {
        name: "nun",
        visible: true,
        player: "iframe",
        parent: "ally",
        relationship: "embed",
        capabilities: { sub: true, ssub: false, download: false, skip_times: false, thumbnails: false },
        proxy: false,
        cors: false,
      },
      bun: {
        name: "bun",
        visible: true,
        player: "iframe",
        parent: "bee",
        relationship: "embed",
        capabilities: { sub: false, ssub: true, download: false, skip_times: false, thumbnails: false },
        proxy: false,
        cors: false,
      },
      twin: {
        name: "twin",
        visible: true,
        player: "iframe",
        parent: "bonk",
        relationship: "embed",
        variantOrder: ["sub", "ssub"],
        capabilities: { sub: true, ssub: true, download: false, skip_times: false, thumbnails: false },
        proxy: false,
        cors: false,
      },
      cog: {
        name: "cog",
        visible: true,
        player: "iframe",
        parent: "moo",
        relationship: "embed",
        capabilities: { sub: true, ssub: false, download: false, skip_times: false, thumbnails: false },
        proxy: false,
        cors: false,
      },
      telli: {
        name: "telli",
        visible: false,
        player: "iframe",
        parent: "kiwi",
        relationship: "embed",
        capabilities: { sub: true, ssub: false, download: false, skip_times: false, thumbnails: false },
        proxy: false,
        cors: false,
      },
    };

    const order = ["kiwi", "pewe", "bonk", "bee", "ally", "moo", "hop", "nun", "bun", "twin", "cog", "telli"];

    jsonResponse(res, {
      providers,
      order,
      total: order.length,
      description: "Provider capabilities and configuration",
      capabilities: {
        sub: "External subtitles (WebVTT)",
        ssub: "Soft subtitles (embedded in video stream)",
        download: "Direct download URL available",
        skip_times: "OP/ED skip timestamps available",
        thumbnails: "Episode thumbnail images available",
      },
    });
  });

  // ---- FEATURE: Health check endpoint ----
  router.get("/health", (req, res) => {
    const uptime = Math.floor((Date.now() - startTime) / 1000);
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = uptime % 60;

    res.json({
      success: true,
      results: {
        status: "healthy",
        version: "2.3.2",
        uptime: `${hours}h ${minutes}m ${seconds}s`,
        uptimeSeconds: uptime,
        timestamp: new Date().toISOString(),
        node: process.version,
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + "MB",
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + "MB",
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + "MB",
        },
        cache: {
          size: require("../helpers/cache").getCacheSize(),
          maxSize: 100,
        },
        endpoints: 46,
        providers: ["kiwi", "pewe", "bee", "bonk", "bun", "ally", "nun", "twin", "cog", "moo", "hop", "telli"],
      },
    });
  });

  // ---- FEATURE: Pipe health check (tests all fallback methods) ----
  router.get("/pipe-health", async (req, res) => {
    try {
      const results = await pipeHealthCheck();
      const working = Object.entries(results).filter(
        ([, v]) => v.status === "ok"
      );
      const failed = Object.entries(results).filter(
        ([, v]) => v.status === "failed"
      );

      res.json({
        success: true,
        results: {
          methods: results,
          working: working.length,
          failed: failed.length,
          total: Object.keys(results).length,
          recommendation:
            working.length === 0
              ? "All methods blocked. Check Cloudflare status or add SCRAPER_API_KEY / FLARESOLVERR_URL."
              : working[0]
                ? `Preferred: ${working[0][0]} (${working[0][1].latency})`
                : "No methods available",
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err) {
      jsonError(res, err.message);
    }
  });

  // ---- FEATURE: Cache & API statistics ----
  router.get("/stats", (req, res) => {
    const uptime = Math.floor((Date.now() - startTime) / 1000);

    res.json({
      success: true,
      results: {
        uptime: uptime + "s",
        requests: {
          total: requestCount.total,
          errors: requestCount.errors,
          successRate: requestCount.total > 0
            ? ((1 - requestCount.errors / requestCount.total) * 100).toFixed(1) + "%"
            : "100%",
        },
        cache: {
          type: "in-memory",
          ttl: "1 minute (default), 2-5 minutes for collections, 24 hours for genres/tags",
          maxSize: 100,
          currentSize: require("../helpers/cache").getCacheSize(),
          description: "Map-based cache with TTL expiration and FIFO eviction",
        },
        endpoints: 46,
        timestamp: new Date().toISOString(),
      },
    });
  });

  // ---- FEATURE: OpenAPI specification ----
  router.get("/openapi", (req, res) => {
    res.json({
      openapi: "3.0.3",
      info: {
        title: "MiruroAPI",
        description: "Free REST API for anime streaming data — AniList GraphQL + Miruro streaming providers",
        version: "2.3.2",
        contact: { name: "Shineii86", url: "https://github.com/Shineii86/MiruroAPI" },
      },
      servers: [
        { url: "https://mirurotvapi.vercel.app/api", description: "Production" },
      ],
      paths: {
        "/search": { get: { summary: "Search anime", tags: ["Search"] } },
        "/suggestions": { get: { summary: "Autocomplete suggestions", tags: ["Search"] } },
        "/filter": { get: { summary: "Advanced filter", tags: ["Search"] } },
        "/multi-search": { get: { summary: "Multi-parameter search", tags: ["Search"] } },
        "/trending": { get: { summary: "Trending anime", tags: ["Collections"] } },
        "/trending/daily": { get: { summary: "Daily trending", tags: ["Collections"] } },
        "/trending/weekly": { get: { summary: "Weekly trending", tags: ["Collections"] } },
        "/popular": { get: { summary: "Most popular", tags: ["Collections"] } },
        "/top": { get: { summary: "Top by score", tags: ["Collections"] } },
        "/upcoming": { get: { summary: "Upcoming anime", tags: ["Collections"] } },
        "/recent": { get: { summary: "Recently aired", tags: ["Collections"] } },
        "/spotlight": { get: { summary: "Spotlight anime", tags: ["Collections"] } },
        "/schedule": { get: { summary: "Airing schedule", tags: ["Collections"] } },
        "/random": { get: { summary: "Random anime", tags: ["Collections"] } },
        "/season/{year}/{season}": { get: { summary: "Seasonal anime", tags: ["Seasonal & Studio"] } },
        "/studio/{name}": { get: { summary: "Anime by studio", tags: ["Seasonal & Studio"] } },
        "/genres": { get: { summary: "All genres", tags: ["Genres & Tags"] } },
        "/tags": { get: { summary: "All tags", tags: ["Genres & Tags"] } },
        "/genre/{name}": { get: { summary: "Anime by genre", tags: ["Genres & Tags"] } },
        "/year/{year}": { get: { summary: "Anime by year", tags: ["Genres & Tags"] } },
        "/status/{status}": { get: { summary: "Anime by status", tags: ["Genres & Tags"] } },
        "/format/{format}": { get: { summary: "Anime by format", tags: ["Genres & Tags"] } },
        "/character/{id}": { get: { summary: "Character detail", tags: ["Character & Staff"] } },
        "/staff/{id}": { get: { summary: "Staff detail", tags: ["Character & Staff"] } },
        "/characters": { get: { summary: "Search characters", tags: ["Character & Staff"] } },
        "/staff": { get: { summary: "Search staff", tags: ["Character & Staff"] } },
        "/info/{id}": { get: { summary: "Full anime info", tags: ["Anime Details"] } },
        "/anime/{id}/characters": { get: { summary: "Characters", tags: ["Anime Details"] } },
        "/anime/{id}/relations": { get: { summary: "Relations", tags: ["Anime Details"] } },
        "/anime/{id}/recommendations": { get: { summary: "Recommendations", tags: ["Anime Details"] } },
        "/episodes/{id}": { get: { summary: "Episode list", tags: ["Streaming & Downloading"] } },
        "/episodes/{id}/batch": { get: { summary: "Batch episode sources", tags: ["Streaming & Downloading"] } },
        "/sources": { get: { summary: "Streaming sources (detailed)", tags: ["Streaming & Downloading"] } },
        "/stream": { get: { summary: "Stream with quality fallback", tags: ["Streaming & Downloading"] } },
        "/download": { get: { summary: "Download URL", tags: ["Streaming & Downloading"] } },
        "/watch/{provider}/{anilistId}/{category}/{slug}": { get: { summary: "Streaming sources (simple)", tags: ["Streaming & Downloading"] } },
        "/compare/{id1}/{id2}": { get: { summary: "Compare two anime", tags: ["Utility"] } },
        "/stats/genre": { get: { summary: "Genre statistics", tags: ["Utility"] } },
        "/calendar": { get: { summary: "Monthly calendar", tags: ["Utility"] } },
        "/timeline/{id}": { get: { summary: "Anime timeline", tags: ["Utility"] } },
        "/providers": { get: { summary: "Provider capabilities", tags: ["System"] } },
        "/health": { get: { summary: "Health check", tags: ["System"] } },
        "/stats": { get: { summary: "API statistics", tags: ["System"] } },
        "/openapi": { get: { summary: "OpenAPI spec", tags: ["System"] } },
      },
      tags: [
        { name: "Search", description: "Search, filter, suggestions" },
        { name: "Collections", description: "Trending, popular, top, schedule" },
        { name: "Seasonal & Studio", description: "Seasonal anime, studio filter" },
        { name: "Genres & Tags", description: "Genre, year, status, format filters" },
        { name: "Character & Staff", description: "Character/staff details and search" },
        { name: "Anime Details", description: "Info, characters, relations, recommendations" },
        { name: "Streaming & Downloading", description: "Episodes, sources, stream, download" },
        { name: "Utility", description: "Compare, stats, calendar, timeline" },
        { name: "System", description: "Health, stats, OpenAPI" },
      ],
    });
  });

  return router;
};

module.exports = createApiRoutes;

// ══════════════════════════════════════════════════════════════ END: apiRoutes.js
