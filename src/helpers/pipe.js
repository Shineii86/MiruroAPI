/*
 * ======= • ======= • ======= • ======= • =======• =======
 * MiruroAPI — pipe.js
 * Repository: https://github.com/Shineii86/MiruroAPI
 *
 * @description
 *   Miruro streaming pipe integration with self-healing fallback system.
 *   Automatically tries multiple methods to reach the pipe endpoint:
 *   1. Direct request with mirror rotation
 *   2. ScraperAPI proxy (if SCRAPER_API_KEY is set)
 *   3. FlareSolverr browser proxy (if FLARESOLVERR_URL is set)
 *   Decodes base64+gzip responses and injects simplified slug-based episode IDs.
 *
 * @exports
 *   getEpisodes, getSources, getWatchSources, pipeHealthCheck
 *
 * @author  Shinei Nouzen
 * @license MIT
 * ======= • ======= • ======= • ======= • =======• =======
 */

const axios = require("axios");
const { Buffer } = require("buffer");
const zlib = require("zlib");
const { getCached, setCache } = require("./cache");

// ══════════════════════════════════════════════════════════════
// MIRURO PIPE CONFIGURATION
// ══════════════════════════════════════════════════════════════

const PIPE_PATH = "/api/secure/pipe";

const MIRURO_ORIGINS = [
  "https://www.miruro.ru",
  "https://www.miruro.to",
  "https://www.miruro.bz",
  "https://www.miruro.tv",
];

const CANONICAL_ORIGIN = "https://www.miruro.to";

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
// FALLBACK METHOD CONFIGURATION
// ══════════════════════════════════════════════════════════════

const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY || "";
const FLARESOLVERR_URL = process.env.FLARESOLVERR_URL || "";

// ══════════════════════════════════════════════════════════════
// ENCODING / DECODING UTILITIES
// ══════════════════════════════════════════════════════════════

const encodePipeRequest = (payload) => {
  const json = JSON.stringify(payload);
  return Buffer.from(json).toString("base64url");
};

const PIPE_OBF_KEY = Buffer.from(
  process.env.PIPE_OBF_KEY || "71951034f8fbcf53d89db52ceb3dc22c",
  "hex"
);

const decodePipeResponse = (encodedStr, obfHeader = null) => {
  try {
    if (!obfHeader) return JSON.parse(encodedStr);

    const padded =
      encodedStr + "=".repeat((4 - (encodedStr.length % 4)) % 4);
    const raw = Buffer.from(padded, "base64url");

    let bytes = raw;
    if (String(obfHeader) === "2") {
      const xored = Buffer.alloc(raw.length);
      for (let i = 0; i < raw.length; i++) {
        xored[i] = raw[i] ^ PIPE_OBF_KEY[i % PIPE_OBF_KEY.length];
      }
      bytes = xored;
    }

    const decompressed = zlib.gunzipSync(bytes);
    return JSON.parse(decompressed.toString("utf-8"));
  } catch (e) {
    throw new Error("Failed to decode pipe response: " + e.message);
  }
};

// ══════════════════════════════════════════════════════════════
// METHOD 1: DIRECT REQUEST (with mirror rotation)
// ══════════════════════════════════════════════════════════════

const methodDirect = async (encodedReq) => {
  const maxRetries = 4;
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const origin = MIRURO_ORIGINS[attempt % MIRURO_ORIGINS.length];

    try {
      const res = await axios.get(`${origin}${PIPE_PATH}?e=${encodedReq}`, {
        headers: HEADERS,
        timeout: 15000,
        maxRedirects: 5,
      });

      if (res.status !== 200)
        throw new Error(`Pipe request failed: ${res.status}`);

      const obf = res.headers["x-obfuscated"];
      return { data: decodePipeResponse(res.data, obf), method: "direct" };
    } catch (e) {
      lastError = e;
      const status = e.response?.status;

      if (status === 403 || status === 444) {
        throw new Error(`Cloudflare is blocking requests to ${origin} (HTTP ${status}). Configure SCRAPER_API_KEY or FLARESOLVERR_URL for fallback.`);
      }

      if (
        status &&
        status >= 400 &&
        status < 500 &&
        status !== 444 &&
        status !== 403
      ) {
        throw new Error(`Pipe request failed with status ${status}`);
      }

      if (e.code === "ECONNABORTED" || e.code === "ETIMEDOUT") {
        lastError = new Error(`Request to ${origin} timed out after 15s`);
      }

      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastError || new Error("Direct request failed after all retries. The streaming provider may be temporarily unavailable.");
};

// ══════════════════════════════════════════════════════════════
// METHOD 2: SCRAPERAPI PROXY
// ══════════════════════════════════════════════════════════════

const methodScraperAPI = async (encodedReq) => {
  if (!SCRAPER_API_KEY) throw new Error("SCRAPER_API_KEY not configured");

  const targetUrl = `${MIRURO_ORIGINS[0]}${PIPE_PATH}?e=${encodedReq}`;
  const scraperUrl = `https://api.scraperapi.com/?api_key=${SCRAPER_API_KEY}&premium=true&url=${encodeURIComponent(targetUrl)}`;

  const res = await axios.get(scraperUrl, {
    headers: {
      "User-Agent": HEADERS["User-Agent"],
    },
    timeout: 60000,
    maxRedirects: 5,
  });

  if (res.status !== 200)
    throw new Error(`ScraperAPI request failed: ${res.status}`);

  const obf = res.headers["x-obfuscated"];
  return { data: decodePipeResponse(res.data, obf), method: "scraperapi" };
};

// ══════════════════════════════════════════════════════════════
// METHOD 3: FLARESOLVERR BROWSER PROXY
// ══════════════════════════════════════════════════════════════

const methodFlareSolverr = async (encodedReq) => {
  if (!FLARESOLVERR_URL) throw new Error("FLARESOLVERR_URL not configured");

  const targetUrl = `${MIRURO_ORIGINS[0]}${PIPE_PATH}?e=${encodedReq}`;

  const res = await axios.post(
    `${FLARESOLVERR_URL.replace(/\/$/, "")}/v1`,
    {
      cmd: "request.get",
      url: targetUrl,
      maxTimeout: 60000,
    },
    {
      headers: { "Content-Type": "application/json" },
      timeout: 70000,
    }
  );

  if (res.status !== 200)
    throw new Error(`FlareSolverr request failed: ${res.status}`);

  const solution = res.data?.solution;
  if (!solution?.response)
    throw new Error("FlareSolverr returned no response");

  const body = solution.response;
  const obf = solution.headers?.["x-obfuscated"] || null;

  return { data: decodePipeResponse(body, obf), method: "flaresolverr" };
};

// ══════════════════════════════════════════════════════════════
// SELF-HEALING PIPE REQUEST (tries all methods in order)
// ══════════════════════════════════════════════════════════════

const METHODS = [
  { name: "direct", fn: methodDirect },
  { name: "scraperapi", fn: methodScraperAPI, requires: () => !!SCRAPER_API_KEY },
  { name: "flaresolverr", fn: methodFlareSolverr, requires: () => !!FLARESOLVERR_URL },
];

const pipeRequest = async (path, query) => {
  const payload = { path, method: "GET", query, body: null };
  const encodedReq = encodePipeRequest(payload);

  const errors = [];
  const availableMethods = METHODS.filter((m) => !m.requires || m.requires());

  if (availableMethods.length === 0) {
    throw new Error("No streaming methods configured. Set SCRAPER_API_KEY or FLARESOLVERR_URL in your .env file to enable fallback methods.");
  }

  for (const method of availableMethods) {
    try {
      const result = await method.fn(encodedReq);
      return result.data;
    } catch (e) {
      errors.push({ method: method.name, error: e.message });
    }
  }

  const isCloudflare = errors.some((e) => e.error.includes("Cloudflare") || e.error.includes("403"));
  const baseMessage = isCloudflare
    ? "Cloudflare is blocking all streaming requests"
    : "All streaming methods failed";

  throw new Error(
    `${baseMessage}: ${errors.map((e) => `${e.method}(${e.error})`).join(", ")}. ` +
    "Configure SCRAPER_API_KEY or FLARESOLVERR_URL for additional fallback methods."
  );
};

// ══════════════════════════════════════════════════════════════
// PIPE HEALTH CHECK (for /api/pipe-health)
// ══════════════════════════════════════════════════════════════

const pipeHealthCheck = async () => {
  const results = {};
  const testPayload = { path: "episodes", method: "GET", query: { anilistId: 20 }, body: null };
  const encodedReq = encodePipeRequest(testPayload);

  for (const method of METHODS) {
    if (method.requires && !method.requires()) {
      results[method.name] = { status: "skipped", reason: "not configured" };
      continue;
    }

    const start = Date.now();
    try {
      await method.fn(encodedReq);
      results[method.name] = {
        status: "ok",
        latency: Date.now() - start + "ms",
      };
    } catch (e) {
      results[method.name] = {
        status: "failed",
        error: e.message,
        latency: Date.now() - start + "ms",
      };
    }
  }

  return results;
};

// ══════════════════════════════════════════════════════════════
// PROXY & ENCODE HELPERS (unchanged)
// ══════════════════════════════════════════════════════════════

const PROXY_BASE = "/api/proxy?url=";

const proxyUrl = (url, referer) => {
  if (!url || !url.startsWith("http")) return url;
  try {
    const ref = referer ? "&referer=" + encodeURIComponent(referer) : "";
    return PROXY_BASE + encodeURIComponent(url) + ref;
  } catch {
    return url;
  }
};

const proxyStreams = (sources) => sources;

const proxySubtitles = (sources) => {
  if (!sources?.subtitles) return sources;
  sources.subtitles = sources.subtitles.map((s) => {
    const raw = s.url || s.file;
    if (!raw || !raw.startsWith("http")) return s;
    const proxied = proxyUrl(raw, "https://www.miruro.to/");
    return { ...s, url: proxied, file: proxied };
  });
  return sources;
};

// ══════════════════════════════════════════════════════════════
// EPISODE ID TRANSLATION
// ══════════════════════════════════════════════════════════════

const translateId = (encodedId) => {
  try {
    const padded = encodedId + "=".repeat((4 - (encodedId.length % 4)) % 4);
    const decoded = Buffer.from(padded, "base64url").toString("utf-8");
    if (decoded.includes(":")) return decoded;
    return encodedId;
  } catch {
    return encodedId;
  }
};

const deepTranslate = (obj) => {
  if (obj && typeof obj === "object") {
    if (Array.isArray(obj)) {
      return obj.map((item) => deepTranslate(item));
    }
    const clone = { ...obj };
    for (const key of Object.keys(clone)) {
      if (key === "id" && typeof clone[key] === "string") {
        if (clone.number !== undefined) {
          clone.rawPipeId = clone[key];
        }
        clone[key] = translateId(clone[key]);
      } else if (typeof clone[key] === "object") {
        clone[key] = deepTranslate(clone[key]);
      }
    }
    return clone;
  }
  return obj;
};

// ══════════════════════════════════════════════════════════════
// EPISODE ID INJECTION
// ══════════════════════════════════════════════════════════════

const injectSourceSlugs = (data, anilistId) => {
  const providers = data.providers || {};

  for (const [provName, provData] of Object.entries(providers)) {
    if (!provData || typeof provData !== "object") continue;

    let episodes = provData.episodes;
    if (!episodes) continue;

    if (Array.isArray(episodes)) {
      provData.episodes = { sub: episodes };
      episodes = provData.episodes;
    }

    for (const [category, epList] of Object.entries(episodes)) {
      if (!Array.isArray(epList)) continue;

      for (const ep of epList) {
        if (ep.id && ep.number) {
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

const fetchRawEpisodes = async (anilistId) => {
  const cacheKey = `pipe:episodes:${anilistId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const data = await pipeRequest("episodes", { anilistId });
  const result = deepTranslate(data);
  setCache(cacheKey, result, 300 * 1000);
  return result;
};

const getEpisodes = async (anilistId) => {
  const data = await fetchRawEpisodes(anilistId);
  const result = injectSourceSlugs(data, anilistId);

  if (!result.mappings) {
    result.mappings = { anilistId };
    if (result.malId) result.mappings.malId = result.malId;
    if (result.kitsuId) result.mappings.kitsuId = result.kitsuId;
  }

  return result;
};

const getSources = async (episodeId, provider, anilistId, category = "sub") => {
  const cacheKey = `pipe:sources:${episodeId}:${provider}:${category}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const encId = Buffer.from(episodeId).toString("base64url");
  const sources = await pipeRequest("sources", {
    episodeId: encId,
    provider,
    category,
    anilistId,
  });

  const result = proxySubtitles(proxyStreams(deepTranslate(sources)));
  setCache(cacheKey, result, 600 * 1000);
  return result;
};

const getWatchSources = async (provider, anilistId, category, slug) => {
  const data = await fetchRawEpisodes(anilistId);
  const provData = (data.providers || {})[provider];

  if (!provData) throw new Error(`Provider ${provider} not found`);

  const episodes = provData.episodes?.[category] || [];
  let targetId = null;

  for (const ep of episodes) {
    const rawId = ep.id || "";
    let match = false;

    if (rawId.includes("/")) {
      const slugSuffix = rawId.split("/").pop();
      match = slugSuffix === slug;
    } else if (rawId.includes(":")) {
      const prefix = rawId.split(":")[0];
      match = `${prefix}-${ep.number}` === slug;
    }

    if (match) {
      targetId = ep.rawPipeId ? translateId(ep.rawPipeId) : rawId;
      break;
    }
  }

  if (!targetId)
    throw new Error(
      `Episode slug '${slug}' not found for provider ${provider}`
    );
  return getSources(targetId, provider, anilistId, category);
};

// ══════════════════════════════════════════════════════════════
// SUBTITLE & QUALITY UTILITIES
// ══════════════════════════════════════════════════════════════

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

const extractSkipTimes = (sources) => {
  const skipTimes = sources.skipTimes || sources.skip || null;
  if (!skipTimes || typeof skipTimes !== "object") return null;

  return {
    intro: skipTimes.intro || skipTimes.op || null,
    outro: skipTimes.outro || skipTimes.ed || null,
    preview: skipTimes.preview || null,
  };
};

const getBestStream = (sources, preferredQuality = "1080p") => {
  const streams = (sources.streams || []).filter((s) => s.url);
  if (streams.length === 0) return null;

  const hlsStreams = streams.filter(
    (s) =>
      s.type === "hls" ||
      !s.type ||
      s.url?.endsWith(".m3u8") ||
      s.url?.includes("m3u8")
  );

  const usable = hlsStreams.length > 0 ? hlsStreams : streams;

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

  const active = usable.find((s) => s.isActive);
  if (active) return active;

  return usable[0];
};

// ══════════════════════════════════════════════════════════════
// DOWNLOAD & BATCH
// ══════════════════════════════════════════════════════════════

const getDownloadUrl = async (provider, anilistId, category, slug) => {
  const sources = await getWatchSources(provider, anilistId, category, slug);
  const subtitles = extractSubtitles(sources);
  const bestStream = getBestStream(sources);

  return {
    download: sources.download || null,
    subtitles,
    bestStream,
    provider,
    anilistId,
    category,
    slug,
    hasDownload: !!sources.download,
    hasSubtitles: subtitles.length > 0,
  };
};

const getBatchSources = async (provider, anilistId, category, slugs) => {
  const results = {};

  const fetchOne = async (slug) => {
    try {
      const sources = await getWatchSources(provider, anilistId, category, slug);
      const best = getBestStream(sources);
      const subtitles = extractSubtitles(sources);
      results[slug] = {
        success: true,
        streams: sources.streams,
        bestStream: best,
        subtitles,
        download: sources.download || null,
      };
    } catch (err) {
      results[slug] = {
        success: false,
        error: err.message,
      };
    }
  };

  const batchSize = 5;
  for (let i = 0; i < slugs.length; i += batchSize) {
    const batch = slugs.slice(i, i + batchSize);
    await Promise.all(batch.map(fetchOne));
  }

  return {
    provider,
    anilistId,
    category,
    total: slugs.length,
    successful: Object.values(results).filter((r) => r.success).length,
    failed: Object.values(results).filter((r) => !r.success).length,
    episodes: results,
  };
};

// ══════════════════════════════════════════════════════════════
// DIRECT EMBED PROVIDERS (bypass Cloudflare — no scraping needed)
// ══════════════════════════════════════════════════════════════

const EMBED_PROVIDERS = [
  {
    id: "megavid",
    name: "Megavid",
    cors: false,
    makeUrl(anilistId, episode, lang = "sub", malId = null) {
      const idType = malId ? "mal" : "ani";
      const id = malId || anilistId;
      return `https://megavid.buzz/${idType}/${id}/${episode}/${lang}?autoplay=true`;
    },
  },
  {
    id: "anixo",
    name: "AniXo",
    cors: true,
    makeUrl(anilistId, episode, lang = "sub") {
      return `https://anixo.buzz/embed/ani/${anilistId}/${episode}/${lang}?autoplay=true`;
    },
  },
];

const getEmbedUrl = (providerId, anilistId, episode, lang = "sub", malId = null) => {
  const provider = EMBED_PROVIDERS.find((p) => p.id === providerId);
  if (!provider) return null;
  return provider.makeUrl(anilistId, episode, lang, malId);
};

const getEmbedUrls = (anilistId, episode, lang = "sub", malId = null) => {
  return EMBED_PROVIDERS.map((p) => ({
    id: p.id,
    name: p.name,
    cors: p.cors,
    url: p.makeUrl(anilistId, episode, lang, malId),
  }));
};

module.exports = {
  getEpisodes,
  getSources,
  getWatchSources,
  getDownloadUrl,
  getBatchSources,
  extractSubtitles,
  extractSkipTimes,
  getBestStream,
  encodePipeRequest,
  decodePipeResponse,
  translateId,
  deepTranslate,
  injectSourceSlugs,
  pipeHealthCheck,
  EMBED_PROVIDERS,
  getEmbedUrl,
  getEmbedUrls,
};

// ══════════════════════════════════════════════════════════════ END: pipe.js
