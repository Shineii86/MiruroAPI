/*
 * ======= • ======= • ======= • ======= • =======• =======
 * MiruroAPI — worker.js (Cloudflare Worker)
 * Repository: https://github.com/Shineii86/MiruroAPI
 *
 * @description
 *   Full API running on Cloudflare's edge network.
 *   Streaming endpoints work via edge-to-edge requests that bypass
 *   Cloudflare bot detection. Zero cold starts, 100K free requests/day.
 *   No npm dependencies — uses native fetch + DecompressionStream.
 *
 *   Why Workers Work:
 *     Vercel (datacenter) → miruro.to → Cloudflare blocks ❌
 *     Worker (edge) → miruro.to → Cloudflare trusts itself ✅
 *
 * @exports
 *   default — Cloudflare Worker fetch handler
 *
 * @deploy
 *   npm install -g wrangler
 *   wrangler login
 *   wrangler deploy worker.js --name miruroapi
 *
 * @author  Shinei Nouzen
 * @license MIT
 * ======= • ======= • ======= • ======= • =======• =======
 */

// ══════════════════════════════════════════════════════════════
// WORKER CONFIGURATION
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: API version — synced across server.js, apiRoutes.js, health endpoint ----
/**
 * Current Worker API version string.
 * Must match package.json version for consistency.
 *
 * @type {string}
 */
const VERSION = "2.3.2";

// ---- FEATURE: AniList GraphQL endpoint ----
/**
 * AniList GraphQL API endpoint.
 * All metadata queries (search, trending, info, filter) go here.
 *
 * @type {string}
 */
const ANILIST_URL = "https://graphql.anilist.co";

// ---- FEATURE: Miruro pipe mirror rotation list ----
/**
 * Ordered list of Miruro mirror origins for pipe requests.
 * Worker rotates through these on failure (exponential backoff).
 * NOTE: .ru is tried first as it has the softest Cloudflare rules.
 *
 * @type {string[]}
 */
const MIRURO_ORIGINS = [
  "https://www.miruro.ru",
  "https://www.miruro.to",
  "https://www.miruro.bz",
  "https://www.miruro.tv",
];

// ---- FEATURE: Canonical Miruro origin for headers ----
/**
 * Primary Miruro origin used in Referer/Origin headers.
 * Cloudflare expects requests to come from this domain.
 *
 * @type {string}
 */
const CANONICAL_ORIGIN = "https://www.miruro.to";

// ---- FEATURE: Pipe API path — where episode/source data lives ----
/**
 * Miruro pipe endpoint path. Appended to each origin during rotation.
 * Format: {origin}/api/secure/pipe?e={base64url-encoded-payload}
 *
 * @type {string}
 */
const PIPE_PATH = "/api/secure/pipe";

// ---- FEATURE: Browser-accurate request headers ----
/**
 * Full set of browser-accurate headers to pass Cloudflare bot detection.
 * Includes sec-ch-ua, sec-fetch-* family, and proper Referer/Origin.
 * TIP: Cloudflare checks the consistency of these headers — missing or
 * mismatched values trigger bot detection.
 *
 * @type {object}
 */
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
  Accept: "*/*",
  "Accept-Language": "en-US,en;q=0.9",
  "sec-ch-ua": '"Chromium";v="137", "Not?A_Brand";v="24"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Windows"',
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-origin",
  Referer: CANONICAL_ORIGIN + "/",
  Origin: CANONICAL_ORIGIN,
};

// ══════════════════════════════════════════════════════════════
// GRAPHQL FRAGMENTS
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: Media list fields fragment (used in collections/search) ----
/**
 * Standard set of fields for anime list responses.
 * Used in trending, popular, search, filter, and schedule endpoints.
 * Includes titles, cover, format, scores, genres, studios, and airing info.
 *
 * @type {string}
 */
const MEDIA_LIST_FIELDS = `
  id
  title { romaji english native }
  coverImage { large extraLarge }
  bannerImage
  format
  season
  seasonYear
  episodes
  duration
  status
  averageScore
  meanScore
  popularity
  favourites
  genres
  source
  countryOfOrigin
  isAdult
  studios(isMain: true) { nodes { name isAnimationStudio } }
  nextAiringEpisode { episode airingAt timeUntilAiring }
  startDate { year month day }
  endDate { year month day }
`;

// ---- FEATURE: Media full fields fragment (used in info endpoint) ----
/**
 * Extended set of fields for detailed anime info responses.
 * Includes everything in MEDIA_LIST_FIELDS plus characters, staff,
 * relations, recommendations, trailer, stats, and external links.
 *
 * @type {string}
 */
const MEDIA_FULL_FIELDS = `
  id
  idMal
  title { romaji english native }
  description(asHtml: false)
  coverImage { large extraLarge color }
  bannerImage
  format
  season
  seasonYear
  episodes
  duration
  status
  averageScore
  meanScore
  popularity
  favourites
  trending
  genres
  tags { name rank isMediaSpoiler }
  source
  countryOfOrigin
  isAdult
  hashtag
  synonyms
  siteUrl
  trailer { id site thumbnail }
  studios { nodes { id name isAnimationStudio siteUrl } }
  nextAiringEpisode { episode airingAt timeUntilAiring }
  startDate { year month day }
  endDate { year month day }
  characters(sort: [ROLE, RELEVANCE], perPage: 25) {
    edges {
      role
      node { id name { full native } image { large } }
      voiceActors(language: JAPANESE) { id name { full native } image { large } languageV2 }
    }
  }
  staff(sort: RELEVANCE, perPage: 25) {
    edges {
      role
      node { id name { full native } image { large } }
    }
  }
  relations {
    edges {
      relationType(version: 2)
      node {
        id
        title { romaji english native }
        coverImage { large }
        format
        type
        status
        episodes
        meanScore
      }
    }
  }
  recommendations(sort: RATING_DESC, perPage: 10) {
    nodes {
      rating
      mediaRecommendation {
        id
        title { romaji english native }
        coverImage { large }
        format
        episodes
        status
        meanScore
        averageScore
      }
    }
  }
  externalLinks { url site type }
  streamingEpisodes { title thumbnail url site }
  stats {
    scoreDistribution { score amount }
    statusDistribution { status amount }
  }
`;

// ══════════════════════════════════════════════════════════════
// RESPONSE HELPERS
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: Success response — wraps data in standard { success, results } format ----
/**
 * Wraps data in the standard API success response format.
 * All successful responses follow: { success: true, results: data }
 *
 * NOTE: Includes CORS header for browser playback.
 *
 * @param {any} data - The data to wrap in the response
 * @param {number} [status=200] - HTTP status code
 * @returns {Response} Web API Response with JSON body and CORS headers
 *
 * @example
 *   jsonResponse({ anime: [...] });
 *   // => { "success": true, "results": { "anime": [...] } }
 */
const jsonResponse = (data, status = 200) =>
  new Response(JSON.stringify({ success: true, results: data }), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });

// ---- FEATURE: Error response — wraps message in standard { success, message } format ----
/**
 * Wraps an error message in the standard API error response format.
 * All error responses follow: { success: false, message: "..." }
 *
 * @param {string} [message="Internal server error"] - Error description
 * @param {number} [status=500] - HTTP status code
 * @returns {Response} Web API Response with JSON error body
 *
 * @example
 *   jsonError("Anime not found", 404);
 *   // => { "success": false, "message": "Anime not found" }
 */
const jsonError = (message = "Internal server error", status = 500) =>
  new Response(JSON.stringify({ success: false, message }), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });

// ---- FEATURE: CORS preflight response — handles OPTIONS requests ----
/**
 * Returns a 204 No Content response with CORS preflight headers.
 * Used to handle OPTIONS requests before actual API calls.
 *
 * @returns {Response} 204 response with CORS headers
 */
const corsResponse = () =>
  new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });

// ══════════════════════════════════════════════════════════════
// INPUT SANITIZATION
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: Integer ID validator ----
/**
 * Validates and parses a positive integer ID from a string.
 * Returns null for invalid, zero, or negative values.
 *
 * @param {string} val - The value to validate
 * @returns {number|null} Parsed integer or null if invalid
 *
 * @example
 *   sanitizeId("123");  // => 123
 *   sanitizeId("-1");   // => null
 *   sanitizeId("abc");  // => null
 */
const sanitizeId = (val) => {
  const n = parseInt(val);
  return isNaN(n) || n <= 0 ? null : n;
};

// ---- FEATURE: String sanitizer with length limit ----
/**
 * Sanitizes a string by stripping dangerous characters and enforcing length.
 * Removes <, >, ", ', `, ;, \ characters to prevent injection.
 *
 * @param {string} val - The string to sanitize
 * @param {number} [maxLen=100] - Maximum allowed length
 * @returns {string|null} Cleaned string or null if invalid/empty
 *
 * @example
 *   sanitizeString("Action");           // => "Action"
 *   sanitizeString("<script>");         // => "script"
 *   sanitizeString("x".repeat(200));    // => null (too long)
 */
const sanitizeString = (val, maxLen = 100) => {
  if (typeof val !== "string") return null;
  const cleaned = val.replace(/[<>"'`;\\]/g, "").trim();
  return cleaned.length > 0 && cleaned.length <= maxLen ? cleaned : null;
};

// ══════════════════════════════════════════════════════════════
// CACHING (Cloudflare Cache API)
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: Cache read — retrieve cached response by key ----
/**
 * Reads from the Cloudflare Cache API using a synthetic URL as key.
 * Returns null if no cached entry exists.
 *
 * TIP: Cloudflare Cache API uses URLs as cache keys. We construct
 * synthetic URLs (https://cache.invalid/{key}) for logical keying.
 *
 * @param {Cache} cache - The Cloudflare Cache instance
 * @param {string} key - Logical cache key
 * @returns {Promise<object|null>} Cached data or null
 */
const cacheGet = async (cache, key) => {
  const url = new URL("https://cache.invalid/" + encodeURIComponent(key));
  const resp = await cache.match(url);
  if (!resp) return null;
  return resp.json();
};

// ---- FEATURE: Cache write — store response with TTL ----
/**
 * Stores data in the Cloudflare Cache API with a time-to-live.
 * Uses synthetic URL as cache key.
 *
 * NOTE: Cloudflare Cache respects Cache-Control headers on the Response.
 * We set max-age to control TTL at the CDN edge.
 *
 * @param {Cache} cache - The Cloudflare Cache instance
 * @param {string} key - Logical cache key
 * @param {any} data - Data to cache (will be JSON-serialized)
 * @param {number} [ttlSeconds=60] - Time-to-live in seconds
 * @returns {Promise<void>}
 */
const cacheSet = async (cache, key, data, ttlSeconds = 60) => {
  const url = new URL("https://cache.invalid/" + encodeURIComponent(key));
  const resp = new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": `public, max-age=${ttlSeconds}`,
    },
  });
  await cache.put(url, resp);
};

// ══════════════════════════════════════════════════════════════
// ANILIST API
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: Core GraphQL executor ----
/**
 * Executes a GraphQL query against the AniList API using native fetch.
 * Handles request formatting, error checking, and GraphQL error extraction.
 *
 * TIP: AniList returns 200 with errors in the `errors` array — we check
 * both HTTP status and GraphQL errors for proper error propagation.
 *
 * @param {string} query - The GraphQL query string
 * @param {object} [variables={}] - Query variables
 * @returns {Promise<object>} The `data` field from the AniList response
 * @throws {Error} If the AniList API returns a non-200 status or GraphQL errors
 *
 * @example
 *   const data = await anilistQuery(MEDIA_LIST_FIELDS, { search: "naruto" });
 */
const anilistQuery = async (query, variables = {}) => {
  const res = await fetch(ANILIST_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error("AniList query failed");
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message || "AniList query failed");
  return json.data;
};

// ══════════════════════════════════════════════════════════════
// PIPE ENCODING / DECODING
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: Encode pipe request payload to base64url ----
/**
 * Encodes a pipe request payload as a base64url string.
 * The pipe endpoint expects: ?e={base64url(JSON payload)}
 *
 * NOTE: Uses base64url (URL-safe) encoding — replaces + with -, / with _,
 * and strips trailing = padding.
 *
 * @param {object} payload - The request payload to encode
 * @returns {string} Base64url-encoded string
 *
 * @example
 *   encodePipeRequest({ path: "episodes", query: { anilistId: 20 } });
 */
const encodePipeRequest = (payload) => {
  const json = JSON.stringify(payload);
  return btoa(json).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

// ---- FEATURE: Decode base64url string to Uint8Array ----
/**
 * Decodes a base64url string into raw bytes (Uint8Array).
 * Used for pipe response decoding and XOR key handling.
 *
 * @param {string} str - The base64url-encoded string
 * @returns {Uint8Array} Decoded bytes
 */
const decodeBase64Url = (str) => {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) base64 += "=";
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
};

// ---- FEATURE: Gzip decompression using Web API DecompressionStream ----
/**
 * Decompresses gzip-compressed bytes using the browser-native DecompressionStream.
 * This replaces Node.js zlib.gunzipSync for the Cloudflare Worker environment.
 *
 * TIP: DecompressionStream is async — it returns a ReadableStream that we
 * must fully consume into a single Uint8Array.
 *
 * @param {Uint8Array} bytes - Gzip-compressed bytes
 * @returns {Promise<Uint8Array>} Decompressed bytes
 */
const decodeGzip = async (bytes) => {
  const ds = new DecompressionStream("gzip");
  const writer = ds.writable.getWriter();
  writer.write(bytes);
  writer.close();
  const reader = ds.readable.getReader();
  const chunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
};

// ---- FEATURE: Pipe response decoder — handles 3 obfuscation schemes ----
/**
 * Decodes a Miruro pipe response based on the x-obfuscated header.
 *
 * Decoding schemes:
 *   No header  → plain JSON (no encoding)
 *   Header "1" → base64url → gunzip (no XOR)
 *   Header "2" → base64url → XOR with key → gunzip
 *
 * TIP: The pipe endpoint signals which scheme it used via the x-obfuscated
 * response header. We must handle all three for proper decoding.
 *
 * @param {string} encodedStr - The raw response body from the pipe endpoint
 * @param {string|null} obfHeader - Value of the x-obfuscated response header
 * @returns {Promise<object>} Decoded JSON data
 * @throws {Error} If decoding fails for any scheme
 *
 * @example
 *   const data = await decodePipeResponse(encodedBody, "1");
 */
const decodePipeResponse = async (encodedStr, obfHeader = null) => {
  // NOTE: No obfuscation — response is plain JSON
  if (!obfHeader) return JSON.parse(encodedStr);

  const raw = decodeBase64Url(encodedStr);
  let bytes = raw;

  // NOTE: Scheme 2 — XOR with obfuscation key before gunzip
  if (String(obfHeader) === "2") {
    const keyHex = "71951034f8fbcf53d89db52ceb3dc22c";
    const key = decodeBase64Url(
      keyHex
        .match(/.{2}/g)
        .map((h) => String.fromCharCode(parseInt(h, 16)))
        .join("")
    );
    const xored = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) {
      xored[i] = raw[i] ^ key[i % key.length];
    }
    bytes = xored;
  }

  const decompressed = await decodeGzip(bytes);
  const decoder = new TextDecoder();
  return JSON.parse(decoder.decode(decompressed));
};

// ══════════════════════════════════════════════════════════════
// FALLBACK METHOD 1: DIRECT REQUEST (mirror rotation)
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: Direct pipe request with mirror rotation and exponential backoff ----
/**
 * Attempts to reach the Miruro pipe endpoint directly via mirror rotation.
 * Tries up to 4 mirrors (one per origin) with exponential backoff delays.
 *
 * TIP: Miruro's Cloudflare rules are softest on the .ru domain — we try it first.
 * On 403/444 (Cloudflare block), we rotate to the next mirror instead of failing.
 *
 * @param {string} encodedReq - Base64url-encoded request payload
 * @returns {Promise<{data: object, method: string}>} Decoded pipe data and method used
 * @throws {Error} If all mirrors fail after retries
 */
const methodDirect = async (encodedReq) => {
  const maxRetries = 4;
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const origin = MIRURO_ORIGINS[attempt % MIRURO_ORIGINS.length];
    try {
      const res = await fetch(`${origin}${PIPE_PATH}?e=${encodedReq}`, {
        headers: HEADERS,
      });
      if (!res.ok) throw new Error(`Pipe request failed: ${res.status}`);

      const obf = res.headers.get("x-obfuscated");
      const text = await res.text();
      return { data: await decodePipeResponse(text, obf), method: "direct" };
    } catch (e) {
      lastError = e;
      // NOTE: Exponential backoff — 1s, 2s, 4s delays between retries
      if (attempt < maxRetries - 1) {
        await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000));
      }
    }
  }
  throw lastError || new Error("Direct request failed after all retries");
};

// ══════════════════════════════════════════════════════════════
// FALLBACK METHOD 2: SCRAPERAPI PROXY
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: ScraperAPI premium proxy for Cloudflare bypass ----
/**
 * Proxies the pipe request through ScraperAPI to bypass Cloudflare.
 * Requires SCRAPER_API_KEY environment variable ($49/mo premium plan).
 *
 * TIP: ScraperAPI's premium plan ($49/mo) can bypass Cloudflare on
 * protected domains. Free plan (1K req/mo) does NOT bypass Cloudflare.
 *
 * @param {string} encodedReq - Base64url-encoded request payload
 * @param {string} apiKey - ScraperAPI premium API key
 * @returns {Promise<{data: object, method: string}>} Decoded pipe data and method used
 * @throws {Error} If ScraperAPI request fails or API key is invalid
 */
const methodScraperAPI = async (encodedReq, apiKey) => {
  if (!apiKey) throw new Error("SCRAPER_API_KEY not configured");

  const targetUrl = `${MIRURO_ORIGINS[0]}${PIPE_PATH}?e=${encodedReq}`;
  const scraperUrl = `https://api.scraperapi.com/?api_key=${apiKey}&premium=true&url=${encodeURIComponent(targetUrl)}`;

  const res = await fetch(scraperUrl, {
    headers: { "User-Agent": HEADERS["User-Agent"] },
  });
  if (!res.ok) throw new Error(`ScraperAPI request failed: ${res.status}`);

  const obf = res.headers.get("x-obfuscated");
  const text = await res.text();
  return { data: await decodePipeResponse(text, obf), method: "scraperapi" };
};

// ══════════════════════════════════════════════════════════════
// FALLBACK METHOD 3: FLARESOLVERR BROWSER PROXY
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: FlareSolverr self-hosted browser proxy ----
/**
 * Proxies the pipe request through a self-hosted FlareSolverr instance.
 * FlareSolverr runs a headless browser that solves Cloudflare Turnstile challenges.
 * Requires FLARESOLVERR_URL environment variable (free, self-hosted via Docker).
 *
 * TIP: FlareSolverr is free but requires Docker/VPS. It's the nuclear option
 * when ScraperAPI is unavailable and direct requests keep failing.
 *
 * @param {string} encodedReq - Base64url-encoded request payload
 * @param {string} flaresolverrUrl - Base URL of the FlareSolverr instance
 * @returns {Promise<{data: object, method: string}>} Decoded pipe data and method used
 * @throws {Error} If FlareSolverr request fails or returns no response
 */
const methodFlareSolverr = async (encodedReq, flaresolverrUrl) => {
  if (!flaresolverrUrl) throw new Error("FLARESOLVERR_URL not configured");

  const targetUrl = `${MIRURO_ORIGINS[0]}${PIPE_PATH}?e=${encodedReq}`;
  const res = await fetch(`${flaresolverrUrl.replace(/\/$/, "")}/v1`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cmd: "request.get",
      url: targetUrl,
      maxTimeout: 60000,
    }),
  });
  if (!res.ok) throw new Error(`FlareSolverr request failed: ${res.status}`);

  const json = await res.json();
  const solution = json?.solution;
  if (!solution?.response) throw new Error("FlareSolverr returned no response");

  const obf = solution.headers?.["x-obfuscated"] || null;
  return { data: await decodePipeResponse(solution.response, obf), method: "flaresolverr" };
};

// ══════════════════════════════════════════════════════════════
// SELF-HEALING PIPE REQUEST (tries all methods in order)
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: Self-healing pipe request with automatic fallback ----
/**
 * Main pipe request function that tries all configured methods in order:
 *   1. Direct (mirror rotation with exponential backoff)
 *   2. ScraperAPI (if SCRAPER_API_KEY env var is set)
 *   3. FlareSolverr (if FLARESOLVERR_URL env var is set)
 *
 * When one method fails, the next is tried automatically.
 * Returns the first successful result. Throws combined error if all fail.
 *
 * TIP: In Cloudflare Workers, environment variables are passed via the `env`
 * parameter (not process.env). This is how wrangler secrets are accessed.
 *
 * @param {string} path - The pipe endpoint path (e.g., "episodes", "sources")
 * @param {object} query - Query parameters for the pipe request
 * @param {object} env - Cloudflare Worker environment variables
 * @returns {Promise<object>} Decoded pipe response data
 * @throws {Error} If all configured methods fail
 *
 * @example
 *   const episodes = await pipeRequest("episodes", { anilistId: 20 }, env);
 */
const pipeRequest = async (path, query, env) => {
  const payload = { path, method: "GET", query, body: null };
  const encodedReq = encodePipeRequest(payload);
  const errors = [];

  // NOTE: Try direct first — always available, no API key needed
  try {
    const result = await methodDirect(encodedReq);
    return result.data;
  } catch (e) {
    errors.push({ method: "direct", error: e.message });
  }

  // NOTE: Try ScraperAPI if configured — premium Cloudflare bypass
  if (env?.SCRAPER_API_KEY) {
    try {
      const result = await methodScraperAPI(encodedReq, env.SCRAPER_API_KEY);
      return result.data;
    } catch (e) {
      errors.push({ method: "scraperapi", error: e.message });
    }
  }

  // NOTE: Try FlareSolverr if configured — self-hosted browser proxy
  if (env?.FLARESOLVERR_URL) {
    try {
      const result = await methodFlareSolverr(encodedReq, env.FLARESOLVERR_URL);
      return result.data;
    } catch (e) {
      errors.push({ method: "flaresolverr", error: e.message });
    }
  }

  throw new Error(
    `All pipe methods failed: ${errors.map((e) => `${e.method}(${e.error})`).join(", ")}`
  );
};

// ══════════════════════════════════════════════════════════════
// EPISODE ID TRANSLATION
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: Decode pipe episode ID to human-readable format ----
/**
 * Translates a pipe-encoded episode ID back to its original format.
 * Pipe IDs are base64url-encoded strings containing colon-separated data.
 *
 * TIP: If the decoded string contains ":", it's a valid pipe ID.
 * Otherwise, return the original string (already decoded or invalid).
 *
 * @param {string} encodedId - The pipe-encoded episode ID
 * @returns {string} Decoded episode ID or original if decoding fails
 *
 * @example
 *   translateId("aW50ZXJuYWw6MTIz"); // => "internal:123"
 */
const translateId = (encodedId) => {
  try {
    const decoded = new TextDecoder().decode(decodeBase64Url(encodedId));
    if (decoded.includes(":")) return decoded;
    return encodedId;
  } catch {
    return encodedId;
  }
};

// ---- FEATURE: Deep recursive ID translation across nested objects ----
/**
 * Recursively translates all "id" fields in a nested object/array.
 * Preserves raw pipe IDs as rawPipeId for source lookups.
 *
 * NOTE: This is a deep clone — the original object is not mutated.
 * This prevents cache corruption issues seen in earlier versions.
 *
 * @param {object|Array} obj - The object or array to translate
 * @returns {object|Array} New object with translated IDs
 */
const deepTranslate = (obj) => {
  if (obj && typeof obj === "object") {
    if (Array.isArray(obj)) return obj.map((item) => deepTranslate(item));
    const clone = { ...obj };
    for (const key of Object.keys(clone)) {
      if (key === "id" && typeof clone[key] === "string") {
        // NOTE: Preserve raw pipe ID for episode source lookups
        if (clone.number !== undefined) clone.rawPipeId = clone[key];
        clone[key] = translateId(clone[key]);
      } else if (typeof clone[key] === "object") {
        clone[key] = deepTranslate(clone[key]);
      }
    }
    return clone;
  }
  return obj;
};

// ---- FEATURE: Inject URL-friendly slug IDs into episode lists ----
/**
 * Rewrites episode IDs from pipe format to URL-friendly slugs.
 * Transform: "internal:123:456" → "watch/kiwi/20/sub/123-456"
 *
 * TIP: The slug format is: watch/{provider}/{anilistId}/{category}/{prefix}-{number}
 * This allows clean URLs like /api/watch/kiwi/20/sub/123-456
 *
 * @param {object} data - Pipe response data with providers.episodes
 * @param {number} anilistId - The AniList ID for this anime
 * @returns {object} Data with slug-based episode IDs
 */
const injectSourceSlugs = (data, anilistId) => {
  const providers = data.providers || {};
  for (const [provName, provData] of Object.entries(providers)) {
    if (!provData || typeof provData !== "object") continue;
    let episodes = provData.episodes;
    if (!episodes) continue;
    // NOTE: Normalize array format to object format for consistent processing
    if (Array.isArray(episodes)) {
      provData.episodes = { sub: episodes };
      episodes = provData.episodes;
    }
    for (const [category, epList] of Object.entries(episodes)) {
      if (!Array.isArray(epList)) continue;
      for (const ep of epList) {
        if (ep.id && ep.number) {
          // NOTE: Extract prefix before ":" for the slug
          const prefix = ep.id.includes(":") ? ep.id.split(":")[0] : ep.id;
          ep.id = `watch/${provName}/${anilistId}/${category}/${prefix}-${ep.number}`;
        }
      }
    }
  }
  return data;
};

// ══════════════════════════════════════════════════════════════
// PIPE API FUNCTIONS
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: Fetch episode list from pipe with ID translation ----
/**
 * Fetches the complete episode list for an anime from the Miruro pipe.
 * Automatically translates pipe IDs to URL-friendly slugs.
 *
 * @param {number} anilistId - The AniList anime ID
 * @param {object} env - Cloudflare Worker environment variables
 * @returns {Promise<object>} Episode data with slug-based IDs per provider
 *
 * @example
 *   const episodes = await getEpisodes(20, env); // Naruto
 */
const getEpisodes = async (anilistId, env) => {
  const data = await pipeRequest("episodes", { anilistId }, env);
  const translated = deepTranslate(data);
  return injectSourceSlugs(translated, anilistId);
};

// ---- FEATURE: Fetch streaming sources for a specific episode ----
/**
 * Fetches streaming sources (M3U8 URLs, subtitles, etc.) for an episode.
 * The episode ID is base64url-encoded before sending to the pipe.
 *
 * @param {string} episodeId - The pipe episode ID (colon-separated format)
 * @param {string} provider - Provider name (e.g., "kiwi", "bonk", "ally")
 * @param {number} anilistId - The AniList anime ID
 * @param {string} [category="sub"] - Subtitle category (sub, ssub)
 * @param {object} env - Cloudflare Worker environment variables
 * @returns {Promise<object>} Streaming sources with streams, subtitles, etc.
 */
const getSources = async (episodeId, provider, anilistId, category = "sub", env) => {
  const encoder = new TextEncoder();
  const encId = btoa(String.fromCharCode(...encoder.encode(episodeId)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  const sources = await pipeRequest(
    "sources",
    { episodeId: encId, provider, category, anilistId },
    env
  );
  return deepTranslate(sources);
};

// ---- FEATURE: Resolve slug to episode ID and fetch sources ----
/**
 * Resolves a URL-friendly slug back to a pipe episode ID, then fetches sources.
 * This is the main entry point for the /api/watch/:provider/:anilistId/:category/:slug endpoint.
 *
 * TIP: The slug matching logic handles both slug-based and raw pipe IDs
 * for backward compatibility.
 *
 * @param {string} provider - Provider name (e.g., "kiwi", "bonk")
 * @param {number|string} anilistId - The AniList anime ID
 * @param {string} category - Subtitle category (sub, ssub)
 * @param {string} slug - URL-friendly episode slug (e.g., "123-456")
 * @param {object} env - Cloudflare Worker environment variables
 * @returns {Promise<object>} Streaming sources for the resolved episode
 * @throws {Error} If episode slug is not found for the provider
 */
const getWatchSources = async (provider, anilistId, category, slug, env) => {
  const data = await getEpisodes(anilistId, env);
  const provData = (data.providers || {})[provider];
  if (!provData) throw new Error(`Provider ${provider} not found`);

  const episodes = provData.episodes?.[category] || [];
  let targetId = null;

  // NOTE: Match slug against both slug-based and raw pipe IDs
  for (const ep of episodes) {
    const rawId = ep.id || "";
    let match = false;

    if (rawId.includes("/")) {
      // NOTE: Slug-based ID — match the last segment
      const slugSuffix = rawId.split("/").pop();
      match = slugSuffix === slug;
    } else if (rawId.includes(":")) {
      // NOTE: Raw pipe ID — match prefix-number format
      const prefix = rawId.split(":")[0];
      match = `${prefix}-${ep.number}` === slug;
    }

    if (match) {
      targetId = ep.rawPipeId ? translateId(ep.rawPipeId) : rawId;
      break;
    }
  }

  if (!targetId)
    throw new Error(`Episode slug '${slug}' not found for provider ${provider}`);
  return getSources(targetId, provider, anilistId, category, env);
};

// ══════════════════════════════════════════════════════════════
// SUBTITLE & QUALITY UTILITIES
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: Extract and normalize subtitle metadata from sources ----
/**
 * Extracts subtitle information from streaming sources.
 * Normalizes different provider formats into a consistent structure.
 *
 * NOTE: Different providers use different field names:
 *   bonk: file, label, kind, language
 *   others: url, name, lang
 * This function normalizes all formats.
 *
 * @param {object} sources - Streaming sources from pipe
 * @returns {Array<{url, label, language, kind, format, encoding, isDefault}>} Normalized subtitles
 */
const extractSubtitles = (sources) => {
  const raw = sources.subtitles || sources.captions || [];
  if (!Array.isArray(raw)) return [];

  return raw
    .map((sub) => ({
      url: sub.url || sub.file || null,
      label: sub.label || sub.name || sub.language || "Unknown",
      language: sub.language || sub.lang || sub.label || "en",
      kind: sub.kind || "subtitles",
      format: sub.format || "vtt",
      encoding: sub.encoding || "utf-8",
      isDefault: sub.default || false,
    }))
    .filter((sub) => sub.url);
};

// ---- FEATURE: Extract OP/ED skip timestamps from sources ----
/**
 * Extracts skip timestamps (intro/outro/preview) from streaming sources.
 * Used for "Skip Intro" / "Skip Outro" buttons in video players.
 *
 * @param {object} sources - Streaming sources from pipe
 * @returns {{intro: object|null, outro: object|null, preview: object|null} | null} Skip timestamps
 */
const extractSkipTimes = (sources) => {
  const skipTimes = sources.skipTimes || sources.skip || null;
  if (!skipTimes || typeof skipTimes !== "object") return null;

  return {
    intro: skipTimes.intro || skipTimes.op || null,
    outro: skipTimes.outro || skipTimes.ed || null,
    preview: skipTimes.preview || null,
  };
};

// ---- FEATURE: Quality fallback — pick best available stream ----
/**
 * Selects the best streaming URL based on preferred quality.
 * Falls back through quality tiers: 1080p → 720p → 480p → 360p.
 *
 * TIP: Many providers don't include quality metadata. In that case,
 * we prefer HLS streams (.m3u8) and fall back to the first active stream.
 *
 * @param {object} sources - Streaming sources from pipe
 * @param {string} [preferredQuality="1080p"] - Preferred quality tier
 * @returns {object|null} Best matching stream object, or null if no streams
 */
const getBestStream = (sources, preferredQuality = "1080p") => {
  const streams = (sources.streams || []).filter((s) => s.url);
  if (streams.length === 0) return null;

  // NOTE: Prefer HLS streams — they work in all browsers
  const hlsStreams = streams.filter(
    (s) =>
      s.type === "hls" ||
      !s.type ||
      s.url?.endsWith(".m3u8") ||
      s.url?.includes("m3u8")
  );
  const usable = hlsStreams.length > 0 ? hlsStreams : streams;

  // NOTE: Try preferred quality first, then fall back through the list
  const qualityOrder = ["1080p", "720p", "480p", "360p"];
  const startIdx = qualityOrder.indexOf(preferredQuality);
  const ordered = startIdx >= 0 ? qualityOrder.slice(startIdx) : qualityOrder;

  for (const q of ordered) {
    const match = usable.find((s) => {
      const quality = (s.quality || s.label || "").toLowerCase();
      return quality.includes(q);
    });
    if (match) return match;
  }

  // NOTE: Fall back to first active stream, then first available
  return usable.find((s) => s.isActive) || usable[0];
};

// ══════════════════════════════════════════════════════════════
// ROUTE HANDLERS
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: Full-text anime search with pagination ----
/**
 * Handles GET /api/search — full-text anime search via AniList.
 *
 * @param {object} params - URL query parameters
 * @param {string} params.query - Search query (required)
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.per_page=20] - Results per page
 * @returns {Promise<Response>} JSON response with paginated search results
 */
const handleSearch = async (params) => {
  const { query, page = 1, per_page = 20 } = params;
  if (!query) return jsonError("query parameter is required", 400);

  const gql = `
    query ($search: String, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage lastPage hasNextPage perPage }
        media(search: $search, type: ANIME, sort: SEARCH_MATCH) { ${MEDIA_LIST_FIELDS} }
      }
    }`;
  const data = await anilistQuery(gql, {
    search: query,
    page: parseInt(page),
    perPage: parseInt(per_page),
  });
  const p = data.Page;
  return jsonResponse({
    page: p.pageInfo.currentPage,
    perPage: p.pageInfo.perPage,
    total: p.pageInfo.total,
    hasNextPage: p.pageInfo.hasNextPage,
    results: p.media,
  });
};

// ---- FEATURE: Lightweight autocomplete suggestions (max 8) ----
/**
 * Handles GET /api/suggestions — lightweight autocomplete for search boxes.
 * Returns minimal data (id, title, poster, format, status, year).
 *
 * @param {object} params - URL query parameters
 * @param {string} params.query - Search query (required)
 * @returns {Promise<Response>} JSON response with up to 8 suggestions
 */
const handleSuggestions = async (params) => {
  const { query } = params;
  if (!query) return jsonError("query parameter is required", 400);

  const gql = `
    query ($search: String) {
      Page(page: 1, perPage: 8) {
        media(search: $search, type: ANIME, sort: SEARCH_MATCH) {
          id title { romaji english } coverImage { large } format status startDate { year } episodes
        }
      }
    }`;
  const data = await anilistQuery(gql, { search: query });
  return jsonResponse(
    data.Page.media.map((item) => ({
      id: item.id,
      title: item.title.english || item.title.romaji,
      title_romaji: item.title.romaji,
      poster: item.coverImage.large,
      format: item.format,
      status: item.status,
      year: item.startDate?.year,
      episodes: item.episodes,
    }))
  );
};

// ---- FEATURE: Advanced anime filter with multiple parameters ----
/**
 * Handles GET /api/filter — advanced filtering by genre, tag, year, season, format, status.
 * All parameters are optional; defaults to POPULARITY_DESC sort.
 *
 * @param {object} params - URL query parameters
 * @param {string} [params.genre] - Genre name (e.g., "Action")
 * @param {string} [params.tag] - Tag name (e.g., "Isekai")
 * @param {number} [params.year] - Season year
 * @param {string} [params.season] - Season (WINTER, SPRING, SUMMER, FALL)
 * @param {string} [params.format] - Format (TV, MOVIE, OVA, ONA, SPECIAL)
 * @param {string} [params.status] - Status (RELEASING, FINISHED, NOT_YET_RELEASED)
 * @param {string} [params.sort="POPULARITY_DESC"] - Sort order
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.per_page=20] - Results per page
 * @returns {Promise<Response>} JSON response with filtered results
 */
const handleFilter = async (params) => {
  const {
    genre, tag, year, season, format, status,
    sort = "POPULARITY_DESC", page = 1, per_page = 20,
  } = params;

  // NOTE: Map sort values to AniList GraphQL enums
  const SORT_MAP = {
    SCORE_DESC: "SCORE_DESC",
    POPULARITY_DESC: "POPULARITY_DESC",
    TRENDING_DESC: "TRENDING_DESC",
    START_DATE_DESC: "START_DATE_DESC",
    FAVOURITES_DESC: "FAVOURITES_DESC",
    UPDATED_AT_DESC: "UPDATED_AT_DESC",
    SEARCH_MATCH: "SEARCH_MATCH",
  };

  const args = ["type: ANIME", `sort: [${SORT_MAP[sort] || "POPULARITY_DESC"}]`];
  const variables = { page: parseInt(page), perPage: parseInt(per_page) };
  const varTypes = ["$page: Int", "$perPage: Int"];

  // NOTE: Dynamically build query based on provided filters
  if (genre) { args.push("genre: $genre"); variables.genre = genre; varTypes.push("$genre: String"); }
  if (tag) { args.push("tag: $tag"); variables.tag = tag; varTypes.push("$tag: String"); }
  if (year) { args.push("seasonYear: $seasonYear"); variables.seasonYear = parseInt(year); varTypes.push("$seasonYear: Int"); }
  if (season) { args.push("season: $season"); variables.season = season.toUpperCase(); varTypes.push("$season: MediaSeason"); }
  if (format) { args.push("format: $format"); variables.format = format.toUpperCase(); varTypes.push("$format: MediaFormat"); }
  if (status) { args.push("status: $status"); variables.status = status.toUpperCase(); varTypes.push("$status: MediaStatus"); }

  const gql = `query (${varTypes.join(", ")}) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { total currentPage lastPage hasNextPage perPage }
      media(${args.join(", ")}) { ${MEDIA_LIST_FIELDS} }
    }
  }`;
  const data = await anilistQuery(gql, variables);
  const p = data.Page;
  return jsonResponse({
    page: p.pageInfo.currentPage,
    perPage: p.pageInfo.perPage,
    total: p.pageInfo.total,
    hasNextPage: p.pageInfo.hasNextPage,
    results: p.media,
  });
};

// ---- FEATURE: Generic collection fetcher (trending, popular, upcoming, etc.) ----
/**
 * Generic handler for collection endpoints (trending, popular, upcoming, recent).
 * Builds a dynamic GraphQL query based on sort type and optional status filter.
 *
 * @param {object} params - URL query parameters
 * @param {string} sortType - AniList sort enum (e.g., "TRENDING_DESC", "POPULARITY_DESC")
 * @param {string|null} [status=null] - Optional status filter
 * @returns {Promise<Response>} JSON response with collection results
 */
const handleCollection = async (params, sortType, status = null) => {
  const { page = 1, per_page = 20 } = params;
  const statusFilter = status ? `, status: ${status}` : "";

  const gql = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage lastPage hasNextPage perPage }
        media(type: ANIME, sort: [${sortType}]${statusFilter}) { ${MEDIA_LIST_FIELDS} }
      }
    }`;
  const data = await anilistQuery(gql, {
    page: parseInt(page),
    perPage: parseInt(per_page),
  });
  const p = data.Page;
  return jsonResponse({
    page: p.pageInfo.currentPage,
    perPage: p.pageInfo.perPage,
    total: p.pageInfo.total,
    hasNextPage: p.pageInfo.hasNextPage,
    results: p.media,
  });
};

// ---- FEATURE: Top anime by score (all time) ----
/**
 * Handles GET /api/top — top-rated anime sorted by score.
 *
 * @param {object} params - URL query parameters
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.per_page=20] - Results per page
 * @returns {Promise<Response>} JSON response with top anime results
 */
const handleTopAnime = async (params) => {
  const { page = 1, per_page = 20 } = params;

  const gql = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage lastPage hasNextPage perPage }
        media(type: ANIME, sort: SCORE_DESC) { ${MEDIA_LIST_FIELDS} }
      }
    }`;
  const data = await anilistQuery(gql, {
    page: parseInt(page),
    perPage: parseInt(per_page),
  });
  const p = data.Page;
  return jsonResponse({
    page: p.pageInfo.currentPage,
    perPage: p.pageInfo.perPage,
    total: p.pageInfo.total,
    hasNextPage: p.pageInfo.hasNextPage,
    results: p.media,
  });
};

// ---- FEATURE: Random anime of the day ----
/**
 * Handles GET /api/random — returns a random anime from the top 500 by popularity.
 *
 * NOTE: Uses Date.now() % 499 for randomness. Not cryptographically secure,
 * but sufficient for "random anime of the day" functionality.
 *
 * @returns {Promise<Response>} JSON response with a single random anime
 */
const handleRandom = async () => {
  const randomPage = (Date.now() % 499) + 1;
  const data = await anilistQuery(
    `
    query ($page: Int) {
      Page(page: $page, perPage: 1) {
        media(type: ANIME, sort: POPULARITY_DESC) { ${MEDIA_LIST_FIELDS} }
      }
    }`,
    { page: randomPage }
  );
  const anime = data.Page.media[0];
  if (!anime) return jsonError("No anime found", 404);
  return jsonResponse(anime);
};

// ---- FEATURE: Complete anime info by AniList ID ----
/**
 * Handles GET /api/info/:id — full anime metadata with enrichment.
 * Enriches AniList data with miruro-style fields (aggregateRating, sameAs, etc.)
 *
 * @param {object} params - Route params + URL query parameters
 * @param {string} params.id - AniList anime ID (required)
 * @returns {Promise<Response>} JSON response with enriched anime info
 */
const handleAnimeInfo = async (params) => {
  const id = parseInt(params.id);
  if (isNaN(id)) return jsonError("Invalid AniList ID", 400);

  const gql = `query ($id: Int) { Media(id: $id, type: ANIME) { ${MEDIA_FULL_FIELDS} } }`;
  const data = await anilistQuery(gql, { id });
  const result = data.Media;

  // NOTE: Enrich with miruro-style metadata fields
  const enriched = {
    ...result,
    alternateName: result.synonyms || [],
    aggregateRating: result.averageScore
      ? {
          ratingValue: result.averageScore,
          bestRating: 100,
          ratingCount: result.favourites || 0,
          meanScore: result.meanScore || null,
        }
      : null,
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

  return jsonResponse(enriched);
};

// ---- FEATURE: Episode list from all providers ----
/**
 * Handles GET /api/episodes/:id — fetches episode list from the Miruro pipe.
 * Returns episodes for all providers with slug-based IDs.
 *
 * @param {object} params - Route params + URL query parameters
 * @param {string} params.id - AniList anime ID (required)
 * @param {object} env - Cloudflare Worker environment variables
 * @returns {Promise<Response>} JSON response with episode list
 */
const handleEpisodes = async (params, env) => {
  const id = parseInt(params.id);
  if (isNaN(id)) return jsonError("Invalid AniList ID", 400);
  const result = await getEpisodes(id, env);
  return jsonResponse(result);
};

// ---- FEATURE: Streaming sources with subtitles and skip times ----
/**
 * Handles GET /api/watch/:provider/:anilistId/:category/:slug — streaming sources endpoint.
 * Returns streams, subtitles, and skip times for a specific episode.
 *
 * @param {object} params - Route params (provider, anilistId, category, slug)
 * @param {object} env - Cloudflare Worker environment variables
 * @returns {Promise<Response>} JSON response with streaming sources
 */
const handleWatch = async (params, env) => {
  const { provider, anilistId, category, slug } = params;
  const sources = await getWatchSources(provider, parseInt(anilistId), category, slug, env);
  const subtitles = extractSubtitles(sources);
  const skipTimes = extractSkipTimes(sources);
  return jsonResponse({ ...sources, subtitles, skipTimes });
};

// ---- FEATURE: Stream with quality fallback, subtitles, and skip times ----
/**
 * Handles GET /api/stream — streaming sources with automatic quality selection.
 * Adds bestStream (quality fallback), subtitles, and skip times to the response.
 *
 * @param {object} params - URL query parameters
 * @param {string} params.provider - Provider name (required)
 * @param {string} params.anilistId - AniList anime ID (required)
 * @param {string} params.slug - Episode slug (required)
 * @param {string} [params.category="sub"] - Subtitle category
 * @param {string} [params.quality="1080p"] - Preferred quality tier
 * @param {object} env - Cloudflare Worker environment variables
 * @returns {Promise<Response>} JSON response with streaming sources + bestStream
 */
const handleStream = async (params, env) => {
  const { provider, anilistId, category = "sub", slug, quality = "1080p" } = params;
  if (!provider || !anilistId || !slug)
    return jsonError("provider, anilistId, and slug are required", 400);

  const sources = await getWatchSources(provider, parseInt(anilistId), category, slug, env);
  const bestStream = getBestStream(sources, quality);
  const subtitles = extractSubtitles(sources);
  const skipTimes = extractSkipTimes(sources);
  return jsonResponse({ ...sources, bestStream, subtitles, skipTimes });
};

// ---- FEATURE: All available genres from AniList ----
/**
 * Handles GET /api/genres — returns the complete list of AniList genres.
 *
 * @returns {Promise<Response>} JSON response with genre name strings
 */
const handleGenres = async () => {
  const data = await anilistQuery(`query { GenreCollection }`);
  return jsonResponse(data.GenreCollection);
};

// ---- FEATURE: All available tags from AniList ----
/**
 * Handles GET /api/tags — returns the complete list of AniList tags with metadata.
 *
 * @returns {Promise<Response>} JSON response with tag objects
 */
const handleTags = async () => {
  const data = await anilistQuery(
    `query { MediaTagCollection { name description category isGeneralSpoiler isMediaSpoiler isAdult } }`
  );
  return jsonResponse(data.MediaTagCollection);
};

// ---- FEATURE: Provider capabilities and configuration ----
/**
 * Handles GET /api/providers — returns static provider configuration.
 * Includes capabilities (sub, ssub, download, skip_times, thumbnails),
 * player type (native, iframe), parent relationships, and CORS settings.
 *
 * @returns {Promise<Response>} JSON response with 12 provider configs
 */
const handleProviders = async () => {
  const providers = {
    kiwi: {
      name: "kiwi", visible: true, player: "native", parent: null, relationship: null,
      capabilities: { sub: true, ssub: false, download: true, skip_times: false, thumbnails: false },
      proxy: { rotate: false, segments: true }, cors: false,
    },
    pewe: {
      name: "pewe", visible: true, player: "native", parent: null, relationship: null,
      capabilities: { sub: true, ssub: false, download: false, skip_times: false, thumbnails: false },
      proxy: { rotate: false, segments: true }, cors: false,
    },
    bonk: {
      name: "bonk", visible: true, player: "native", parent: null, relationship: null,
      variantOrder: ["ssub", "sub"],
      capabilities: { sub: true, ssub: true, download: true, skip_times: true, thumbnails: false },
      proxy: { rotate: false, segments: false }, cors: false,
    },
    bee: {
      name: "bee", visible: true, player: "native", parent: null, relationship: null,
      capabilities: { sub: false, ssub: true, download: false, skip_times: false, thumbnails: false },
      proxy: { rotate: false, segments: true }, cors: false,
    },
    ally: {
      name: "ally", visible: true, player: "native", parent: null, relationship: null,
      capabilities: { sub: true, ssub: false, download: true, skip_times: false, thumbnails: true },
      proxy: false, cors: true, fallback: 2,
    },
    moo: {
      name: "moo", visible: true, player: "native", parent: null, relationship: null,
      capabilities: { sub: true, ssub: false, download: true, skip_times: false, thumbnails: false },
      proxy: { rotate: false, segments: true }, cors: false,
    },
    hop: {
      name: "hop", visible: true, player: "native", parent: null, relationship: null,
      capabilities: { sub: false, ssub: true, download: false, skip_times: false, thumbnails: true },
      proxy: { rotate: false, segments: true }, cors: false,
    },
    nun: {
      name: "nun", visible: true, player: "iframe", parent: "ally", relationship: "embed",
      capabilities: { sub: true, ssub: false, download: false, skip_times: false, thumbnails: false },
      proxy: false, cors: false,
    },
    bun: {
      name: "bun", visible: true, player: "iframe", parent: "bee", relationship: "embed",
      capabilities: { sub: false, ssub: true, download: false, skip_times: false, thumbnails: false },
      proxy: false, cors: false,
    },
    twin: {
      name: "twin", visible: true, player: "iframe", parent: "bonk", relationship: "embed",
      variantOrder: ["sub", "ssub"],
      capabilities: { sub: true, ssub: true, download: false, skip_times: false, thumbnails: false },
      proxy: false, cors: false,
    },
    cog: {
      name: "cog", visible: true, player: "iframe", parent: "moo", relationship: "embed",
      capabilities: { sub: true, ssub: false, download: false, skip_times: false, thumbnails: false },
      proxy: false, cors: false,
    },
    telli: {
      name: "telli", visible: false, player: "iframe", parent: "kiwi", relationship: "embed",
      capabilities: { sub: true, ssub: false, download: false, skip_times: false, thumbnails: false },
      proxy: false, cors: false,
    },
  };
  const order = ["kiwi", "pewe", "bonk", "bee", "ally", "moo", "hop", "nun", "bun", "twin", "cog", "telli"];
  return jsonResponse({
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
};

// ---- FEATURE: Health check endpoint ----
/**
 * Handles GET /api/health — returns Worker status, version, and metadata.
 *
 * @returns {Response} JSON response with health status
 */
const handleHealth = () => {
  return jsonResponse({
    status: "healthy",
    version: VERSION,
    timestamp: new Date().toISOString(),
    platform: "cloudflare-worker",
    endpoints: 15,
    providers: ["kiwi", "pewe", "bee", "bonk", "bun", "ally", "nun", "twin", "cog", "moo", "hop", "telli"],
    description: "Cloudflare Worker edition — edge-to-edge streaming bypass",
  });
};

// ══════════════════════════════════════════════════════════════
// ROUTER
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: URL-based route matching with parameter extraction ----
/**
 * Maps URL paths to handler names with extracted parameters.
 * Uses regex matching for parameterized routes (e.g., /api/info/:id).
 *
 * TIP: Returns either a string (simple route) or { handler, params } object
 * (parameterized route) for flexible handler dispatch.
 *
 * @param {string} path - The URL pathname (e.g., "/api/search")
 * @param {string} method - The HTTP method (only GET is supported)
 * @returns {string|{handler: string, params: object}|null} Matched route or null
 *
 * @example
 *   route("/api/search", "GET");        // => "search"
 *   route("/api/info/20", "GET");       // => { handler: "info", params: { id: "20" } }
 *   route("/api/info/abc", "GET");      // => null (invalid ID)
 *   route("/api/search", "POST");       // => null (wrong method)
 */
const route = (path, method) => {
  // NOTE: Only GET requests are supported for API endpoints
  if (method !== "GET") return null;

  // NOTE: Static route map for simple endpoints
  const routes = {
    "/api/search": "search",
    "/api/suggestions": "suggestions",
    "/api/filter": "filter",
    "/api/trending": "trending",
    "/api/trending/daily": "trending/daily",
    "/api/trending/weekly": "trending/weekly",
    "/api/popular": "popular",
    "/api/top": "top",
    "/api/upcoming": "upcoming",
    "/api/recent": "recent",
    "/api/random": "random",
    "/api/genres": "genres",
    "/api/tags": "tags",
    "/api/providers": "providers",
    "/api/health": "health",
  };
  if (routes[path]) return routes[path];

  // NOTE: Parameterized route matching with regex extraction
  const infoMatch = path.match(/^\/api\/info\/(\d+)$/);
  if (infoMatch) return { handler: "info", params: { id: infoMatch[1] } };

  const episodesMatch = path.match(/^\/api\/episodes\/(\d+)$/);
  if (episodesMatch) return { handler: "episodes", params: { id: episodesMatch[1] } };

  const watchMatch = path.match(/^\/api\/watch\/([^/]+)\/(\d+)\/([^/]+)\/(.+)$/);
  if (watchMatch)
    return {
      handler: "watch",
      params: {
        provider: watchMatch[1],
        anilistId: watchMatch[2],
        category: watchMatch[3],
        slug: watchMatch[4],
      },
    };

  const streamMatch = path.match(/^\/api\/stream$/);
  if (streamMatch) return "stream";

  const genreMatch = path.match(/^\/api\/genre\/(.+)$/);
  if (genreMatch)
    return { handler: "genre", params: { name: decodeURIComponent(genreMatch[1]) } };

  const yearMatch = path.match(/^\/api\/year\/(\d+)$/);
  if (yearMatch) return { handler: "year", params: { year: yearMatch[1] } };

  const seasonMatch = path.match(/^\/api\/season\/(\d+)\/([^/]+)$/);
  if (seasonMatch)
    return { handler: "season", params: { year: seasonMatch[1], season: seasonMatch[2] } };

  const studioMatch = path.match(/^\/api\/studio\/(.+)$/);
  if (studioMatch)
    return { handler: "studio", params: { name: decodeURIComponent(studioMatch[1]) } };

  const characterMatch = path.match(/^\/api\/character\/(\d+)$/);
  if (characterMatch) return { handler: "character", params: { id: characterMatch[1] } };

  const staffMatch = path.match(/^\/api\/staff\/(\d+)$/);
  if (staffMatch) return { handler: "staff", params: { id: staffMatch[1] } };

  return null;
};

// ══════════════════════════════════════════════════════════════
// MAIN HANDLER (Cloudflare Worker fetch event)
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: Cloudflare Worker entry point ----
/**
 * Main fetch handler for the Cloudflare Worker.
 * Parses the URL, routes to the appropriate handler, and returns a Response.
 *
 * NOTE: Cloudflare Workers receive (request, env, ctx) — not Express req/res.
 * Environment variables (secrets) are passed via the `env` parameter.
 *
 * @param {Request} request - The incoming HTTP request
 * @param {object} env - Cloudflare Worker environment (secrets, vars)
 * @param {object} ctx - Execution context (waitUntil, passThroughOnException)
 * @returns {Promise<Response>} The HTTP response
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const params = Object.fromEntries(url.searchParams);

    // NOTE: Handle CORS preflight requests
    if (method === "OPTIONS") return corsResponse();

    // NOTE: Only handle /api/* routes — return plain text for root
    if (!path.startsWith("/api/")) {
      return new Response("MiruroAPI Worker — use /api/* endpoints", {
        headers: { "Content-Type": "text/plain", "Access-Control-Allow-Origin": "*" },
      });
    }

    const matched = route(path, method);
    if (!matched) return jsonError("Endpoint not found", 404);

    try {
      const handler = typeof matched === "string" ? matched : matched.handler;
      const handlerParams =
        typeof matched === "string" ? params : { ...params, ...matched.params };

      // NOTE: Dispatch to the matched handler
      switch (handler) {
        case "search": return await handleSearch(handlerParams);
        case "suggestions": return await handleSuggestions(handlerParams);
        case "filter": return await handleFilter(handlerParams);
        case "trending": return await handleCollection(handlerParams, "TRENDING_DESC");
        case "trending/daily": return await handleCollection(handlerParams, "TRENDING_DESC");
        case "trending/weekly": return await handleCollection(handlerParams, "TRENDING_DESC");
        case "popular": return await handleCollection(handlerParams, "POPULARITY_DESC");
        case "top": return await handleTopAnime(handlerParams);
        case "upcoming": return await handleCollection(handlerParams, "POPULARITY_DESC", "NOT_YET_RELEASED");
        case "recent": return await handleCollection(handlerParams, "START_DATE_DESC", "RELEASING");
        case "random": return await handleRandom();
        case "info": return await handleAnimeInfo(handlerParams);
        case "episodes": return await handleEpisodes(handlerParams, env);
        case "watch": return await handleWatch(handlerParams, env);
        case "stream": return await handleStream(handlerParams, env);
        case "genres": return await handleGenres();
        case "tags": return await handleTags();
        case "providers": return await handleProviders();
        case "health": return await handleHealth();
        case "genre": return await handleFilter({ genre: handlerParams.name, ...params });
        case "year": return await handleFilter({ year: handlerParams.year, ...params });
        case "season": return await handleFilter({ year: handlerParams.year, season: handlerParams.season, ...params });
        case "studio": {
          const { page = 1, per_page = 20 } = params;
          const gql = `
            query ($name: String, $page: Int, $perPage: Int) {
              Studio(search: $name) {
                id name isAnimationStudio siteUrl
                media(sort: POPULARITY_DESC, page: $page, perPage: $perPage) {
                  pageInfo { total currentPage lastPage hasNextPage perPage }
                  nodes { ${MEDIA_LIST_FIELDS} }
                }
              }
            }`;
          const data = await anilistQuery(gql, {
            name: handlerParams.name,
            page: parseInt(page),
            perPage: parseInt(per_page),
          });
          if (!data.Studio) return jsonError("Studio not found", 404);
          const s = data.Studio;
          return jsonResponse({
            studio: {
              id: s.id, name: s.name,
              isAnimationStudio: s.isAnimationStudio,
              siteUrl: s.siteUrl,
            },
            page: s.media.pageInfo.currentPage,
            perPage: s.media.pageInfo.perPage,
            total: s.media.pageInfo.total,
            hasNextPage: s.media.pageInfo.hasNextPage,
            results: s.media.nodes,
          });
        }
        case "character": {
          const gql = `
            query ($id: Int) {
              Character(id: $id) {
                id name { full native userPreferred } image { large medium }
                description gender favourites siteUrl
                dateOfBirth { year month day } age bloodType
                media(perPage: 25, sort: POPULARITY_DESC) {
                  pageInfo { total currentPage lastPage hasNextPage perPage }
                  edges {
                    characterRole
                    node { id title { romaji english } coverImage { large } format episodes status meanScore }
                  }
                }
              }
            }`;
          const data = await anilistQuery(gql, { id: parseInt(handlerParams.id) });
          if (!data.Character) return jsonError("Character not found", 404);
          return jsonResponse(data.Character);
        }
        case "staff": {
          const gql = `
            query ($id: Int) {
              Staff(id: $id) {
                id name { full native userPreferred } image { large medium }
                description gender favourites siteUrl
                dateOfBirth { year month day } age homeTown yearsActive
                staffMedia(perPage: 25, sort: POPULARITY_DESC) {
                  pageInfo { total currentPage lastPage hasNextPage perPage }
                  edges { node { id title { romaji english } coverImage { large } format episodes status meanScore } }
                }
              }
            }`;
          const data = await anilistQuery(gql, { id: parseInt(handlerParams.id) });
          if (!data.Staff) return jsonError("Staff not found", 404);
          return jsonResponse(data.Staff);
        }
        default: return jsonError("Endpoint not found", 404);
      }
    } catch (err) {
      return jsonError(err.message);
    }
  },
};

// ══════════════════════════════════════════════════════════════ END: worker.js
