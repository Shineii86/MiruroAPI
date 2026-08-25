/*
 * ======= • ======= • ======= • ======= • =======• =======
 * MiruroAPI — server.js
 * Repository: https://github.com/Shineii86/MiruroAPI
 *
 * @description
 *   Main entry point for the MiruroAPI Express server.
 *   Configures CORS, compression, logging, security headers,
 *   rate limiting, API routes, and 404 handling.
 *
 * @exports
 *   None (side-effect: starts Express server)
 *
 * @author  Shinei Nouzen
 * @license MIT
 * ======= • ======= • ======= • ======= • =======• =======
 */

const express = require("express");
const cors = require("cors");
const compression = require("compression");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

// ══════════════════════════════════════════════════════════════
// SERVER CONFIGURATION
// ══════════════════════════════════════════════════════════════

const app = express();
const PORT = process.env.PORT || 3000;
const startTime = Date.now();
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : null;

// ══════════════════════════════════════════════════════════════
// COMPRESSION
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: Gzip compression — reduces response size by 30-70% ----
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers["x-no-compression"]) return false;
    return compression.filter(req, res);
  },
}));

// ══════════════════════════════════════════════════════════════
// REQUEST LOGGING
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: Request logging — method, path, status, response time ----
app.use((req, res, next) => {
  const start = Date.now();
  const originalEnd = res.end;

  res.end = function (...args) {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.ip ||
      req.connection.remoteAddress;

    // NOTE: Only log API requests, skip static files
    if (req.path.startsWith("/api/")) {
      const log = `[${new Date().toISOString()}] ${req.method} ${req.path} ${status} ${duration}ms ${ip}`;
      if (status >= 400) {
        console.error(log);
      } else {
        console.log(log);
      }
    }

    originalEnd.apply(this, args);
  };

  next();
});

// ══════════════════════════════════════════════════════════════
// CORS MIDDLEWARE
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: Unified CORS middleware with preflight handling ----
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const isProduction = process.env.VERCEL || process.env.NODE_ENV === "production";

  if (allowedOrigins && allowedOrigins.length > 0) {
    if (allowedOrigins.includes("*")) {
      res.setHeader("Access-Control-Allow-Origin", "*");
    } else if (origin && allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    } else if (!origin && !isProduction) {
      res.setHeader("Access-Control-Allow-Origin", "*");
    } else if (origin) {
      return res.status(403).json({ success: false, message: "Origin not allowed" });
    }
  } else {
    // Default: allow all origins for public API usage by anime frontends
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-No-Compression, Authorization");
  res.setHeader("Access-Control-Expose-Headers", "X-RateLimit-Limit, X-RateLimit-Remaining");
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  next();
});

// ══════════════════════════════════════════════════════════════
// SECURITY HEADERS
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: Security headers ----
app.use((req, res, next) => {
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});

// ══════════════════════════════════════════════════════════════
// CACHE HEADERS
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: Cache-Control headers for API responses ----
app.use("/api", (req, res, next) => {
  // NOTE: Different cache durations based on endpoint type
  if (req.path.includes("/health") || req.path.includes("/stats")) {
    res.setHeader("Cache-Control", "no-store");
  } else if (req.path.includes("/search") || req.path.includes("/suggestions")) {
    res.setHeader("Cache-Control", "public, max-age=60");
  } else if (req.path.includes("/episodes") || req.path.includes("/sources") || req.path.includes("/watch")) {
    res.setHeader("Cache-Control", "public, max-age=120");
  } else {
    res.setHeader("Cache-Control", "public, max-age=300");
  }
  res.setHeader("Vary", "Accept-Encoding");
  next();
});

// ══════════════════════════════════════════════════════════════
// STATIC FILES
// ══════════════════════════════════════════════════════════════

app.use(express.static(path.join(__dirname, "public"), {
  redirect: false,
  maxAge: "1d",
}));

// ══════════════════════════════════════════════════════════════
// CLEAN URL ROUTES
// ══════════════════════════════════════════════════════════════

const publicDir = path.join(__dirname, "public");

app.get("/tos", (req, res) => {
  res.sendFile(path.join(publicDir, "tos.html"));
});

app.get("/privacy", (req, res) => {
  res.sendFile(path.join(publicDir, "privacy.html"));
});

// ══════════════════════════════════════════════════════════════
// SWAGGER UI DOCS
// ══════════════════════════════════════════════════════════════

app.get("/docs", (req, res) => {
  res.sendFile(path.join(publicDir, "docs.html"));
});

// ══════════════════════════════════════════════════════════════
// RESPONSE HELPERS
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: Response helper — wrap data in standard success format ----
/**
 * Wraps data in the standard API success response format.
 * All successful responses follow: { success: true, results: data }
 *
 * @param {import('express').Response} res - Express response object
 * @param {any} data - The data to wrap
 * @param {number} [status=200] - HTTP status code
 * @returns {import('express').Response} Express response with JSON body
 *
 * @example
 *   jsonResponse(res, { anime: [...] });
 *   // => { "success": true, "results": { "anime": [...] } }
 */
const jsonResponse = (res, data, status = 200) =>
  res.status(status).json({ success: true, results: data });

// ---- FEATURE: Error helper — wrap message in standard error format ----
/**
 * Wraps an error message in the standard API error response format.
 * All error responses follow: { success: false, message: "..." }
 *
 * @param {import('express').Response} res - Express response object
 * @param {string} [message="Internal server error"] - Error description
 * @param {number} [status=500] - HTTP status code
 * @returns {import('express').Response} Express response with JSON error body
 *
 * @example
 *   jsonError(res, "Anime not found", 404);
 *   // => { "success": false, "message": "Anime not found" }
 */
const jsonError = (res, message = "Internal server error", status = 500) =>
  res.status(status).json({ success: false, message });

// ══════════════════════════════════════════════════════════════
// RATE LIMITING
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: Rate limiting (100 requests per minute per IP) ----
const requestCounts = new Map();
app.use((req, res, next) => {
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.ip ||
    req.connection?.remoteAddress ||
    "unknown";
  const now = Date.now();
  const windowMs = 60000;
  const maxRequests = 100;

  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, []);
  }

  const timestamps = requestCounts.get(ip).filter((t) => now - t < windowMs);
  requestCounts.set(ip, timestamps);

  if (timestamps.length >= maxRequests) {
    return res.status(429).json({
      success: false,
      message: "Rate limit exceeded. Try again later.",
    });
  }

  timestamps.push(now);

  // NOTE: Aggressive cleanup on serverless — prune all empty entries every request
  // since memory is per-invocation and doesn't persist
  if (requestCounts.size > 50) {
    for (const [key, val] of requestCounts) {
      if (val.length === 0) requestCounts.delete(key);
    }
  }

  next();
});

// ══════════════════════════════════════════════════════════════
// API ROUTES
// ══════════════════════════════════════════════════════════════

const apiRoutes = require("./src/routes/apiRoutes");
app.use("/api", apiRoutes(jsonResponse, jsonError, startTime));

// ══════════════════════════════════════════════════════════════
// 404 HANDLER
// ══════════════════════════════════════════════════════════════

// ---- FEATURE: Global error handler ----
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// ---- FEATURE: Catch-all 404 handler for undefined routes ----
app.use((req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({
      success: false,
      message: "Endpoint not found",
    });
  }
  const notFoundPath = path.join(publicDir, "404.html");
  if (fs.existsSync(notFoundPath)) {
    return res.status(404).sendFile(notFoundPath);
  }
  res.sendFile(path.join(publicDir, "index.html"));
});

// ══════════════════════════════════════════════════════════════
// SERVER START (only when running standalone, not on Vercel)
// ══════════════════════════════════════════════════════════════

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[${new Date().toISOString()}] MiruroAPI v2.3.3 listening at ${PORT}`);
  });
}

module.exports = app;

// ══════════════════════════════════════════════════════════════ END: server.js
