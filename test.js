/*
 * ======= • ======= • ======= • ======= • =======• =======
 * MiruroAPI — test.js
 * Repository: https://github.com/Shineii86/MiruroAPI
 *
 * @description
 *   Integration test suite for MiruroAPI v2.3.0 endpoints.
 *   Tests all 45 endpoints for correct response format.
 *   Runs sequentially to avoid rate limiting.
 *
 * @author  Shinei Nouzen
 * @license MIT
 * ======= • ======= • ======= • ======= • =======• =======
 */

// ══════════════════════════════════════════════════════════════
// TEST CONFIGURATION
// ══════════════════════════════════════════════════════════════

/**
 * Base URL for all API requests.
 * Defaults to production; override with API_URL env var.
 *
 * @type {string}
 */
const BASE = process.env.API_URL || "https://mirurotvapi.vercel.app/api";

// ══════════════════════════════════════════════════════════════
// TEST DEFINITIONS
// ══════════════════════════════════════════════════════════════

const tests = [
  // ---- FEATURE: System endpoints ----
  { name: "Health", url: "/health" },
  { name: "Stats", url: "/stats" },
  { name: "OpenAPI", url: "/openapi" },
  { name: "Providers", url: "/providers" },

  // ---- FEATURE: Search & discovery endpoints ----
  { name: "Search", url: "/search?query=naruto" },
  { name: "Suggestions", url: "/suggestions?query=naruto" },
  { name: "Filter", url: "/filter?genre=Action&per_page=1" },
  { name: "Multi-Search", url: "/multi-search?q=naruto&genre=Action" },

  // ---- FEATURE: Collection endpoints ----
  { name: "Trending", url: "/trending?per_page=1" },
  { name: "Trending Daily", url: "/trending/daily" },
  { name: "Trending Weekly", url: "/trending/weekly" },
  { name: "Popular", url: "/popular?per_page=1" },
  { name: "Top", url: "/top?per_page=1" },
  { name: "Upcoming", url: "/upcoming?per_page=1" },
  { name: "Recent", url: "/recent?per_page=1" },
  { name: "Spotlight", url: "/spotlight" },
  { name: "Schedule", url: "/schedule" },
  { name: "Random", url: "/random" },
  { name: "Upcoming Countdown", url: "/upcoming/countdown" },

  // ---- FEATURE: Seasonal & studio endpoints ----
  { name: "Seasonal", url: "/season/2025/spring" },
  { name: "Studio", url: "/studio/MAPPA" },

  // ---- FEATURE: Metadata endpoints ----
  { name: "Genres", url: "/genres" },
  { name: "Tags", url: "/tags" },
  { name: "Genre", url: "/genre/Action" },
  { name: "Year", url: "/year/2024" },
  { name: "Status", url: "/status/RELEASING" },
  { name: "Format", url: "/format/MOVIE" },

  // ---- FEATURE: Character & staff endpoints ----
  { name: "Character", url: "/character/1" },
  { name: "Staff", url: "/staff/1" },
  { name: "Characters Search", url: "/characters?query=kaneki" },
  { name: "Staff Search", url: "/staff?query=oda" },

  // ---- FEATURE: Anime detail endpoints ----
  { name: "Info", url: "/info/20" },
  { name: "Anime Characters", url: "/anime/20/characters" },
  { name: "Relations", url: "/anime/20/relations" },
  { name: "Recommendations", url: "/anime/20/recommendations" },

  // ---- FEATURE: Streaming endpoints ----
  { name: "Episodes", url: "/episodes/20" },
  { name: "Batch Episodes", url: "/episodes/20/batch?provider=kiwi&category=sub&slugs=animepahe-1,animepahe-2" },
  { name: "Sources (query)", url: "/sources?episodeId=test&provider=kiwi&anilistId=20" },
  { name: "Sources (path)", url: "/sources/test?provider=kiwi&anilistId=20" },
  { name: "Stream", url: "/stream?provider=kiwi&anilistId=20&category=sub&slug=animepahe-1" },
  { name: "Download", url: "/download?provider=kiwi&anilistId=20&category=sub&slug=animepahe-1" },
  { name: "Watch", url: "/watch/kiwi/20/sub/animepahe-1" },

  // ---- FEATURE: Utility endpoints ----
  { name: "Compare", url: "/compare/20/21" },
  { name: "Genre Stats", url: "/stats/genre" },
  { name: "Calendar", url: "/calendar" },
  { name: "Timeline", url: "/timeline/20" },
];

// ══════════════════════════════════════════════════════════════
// TEST RUNNER
// ══════════════════════════════════════════════════════════════

/**
 * Global pass/fail counters for test results.
 *
 * @type {{ passed: number, failed: number }}
 */
let passed = 0;
let failed = 0;

// ---- FEATURE: Single test executor ----
/**
 * Runs a single API test against the specified endpoint.
 * Validates HTTP 200 status and standard response format.
 *
 * @param {{ name: string, url: string }} test - Test definition object
 * @param {string} test.name - Human-readable test name for output
 * @param {string} test.url - Relative URL path (appended to BASE)
 * @returns {Promise<void>} Logs result to console, increments counters
 *
 * @example
 *   await runTest({ name: "Health", url: "/health" });
 */
async function runTest(test) {
  try {
    const res = await fetch(`${BASE}${test.url}`);
    if (!res.ok) {
      console.log(`❌ ${test.name} - HTTP ${res.status}`);
      failed++;
      return;
    }
    const data = await res.json();
    if (data.success === true && data.results) {
      console.log(`✅ ${test.name}`);
      passed++;
    } else {
      console.log(`❌ ${test.name} - Invalid response format`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ ${test.name} - ${error.message}`);
    failed++;
  }
}

// ---- FEATURE: Full test suite runner ----
/**
 * Runs all test definitions sequentially to avoid rate limiting.
 * Prints summary and exits with code 1 if any tests failed.
 *
 * @returns {Promise<void>} Exits process with 0 (pass) or 1 (fail)
 *
 * @example
 *   node test.js           # Run against production
 *   API_URL=http://localhost:3000/api node test.js  # Run against local
 */
async function runAll() {
  console.log(`\n🧪 MiruroAPI v2.3.3 — Running ${tests.length} tests...\n`);

  // NOTE: Sequential execution — parallel requests would hit rate limiter
  for (const test of tests) {
    await runTest(test);
  }

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed, ${tests.length} total\n`);
  process.exit(failed > 0 ? 1 : 0);
}

// ══════════════════════════════════════════════════════════════
// ENTRY POINT
// ══════════════════════════════════════════════════════════════

runAll();

// ══════════════════════════════════════════════════════════════ END: test.js
