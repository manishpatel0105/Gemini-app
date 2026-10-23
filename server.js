/**
 * SAARTHI AI — Universal Human Intent-to-System Action Engine
 * Minimal Production-Grade HTTP Server (Zero Runtime npm Dependencies)
 * 
 * Powered by Google Gemini (model configured via GEMINI_MODEL env var)
 */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const { GeminiService } = require('./services/gemini');
const { validateAnalyzeRequest } = require('./services/validate');
const { DEMO_PRESETS } = require('./public/demoData');

// Zero-dependency .env loader
function loadEnv() {
  const envPath = path.resolve(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, 'utf8');
      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (val) {
            process.env[key] = val;
          }
        }
      }
    } catch {
      // Ignore reading error
    }
  }
}
loadEnv();

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';
const PUBLIC_DIR = path.resolve(__dirname, 'public');
const MAX_BODY_BYTES = 10 * 1024 * 1024; // 10 MB payload ceiling

// In-memory sliding window rate limiter: 60 requests per minute per IP
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 60;
const rateLimitMap = new Map();

// MIME type map for static asset delivery
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

// Security headers helper
function setSecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self'; frame-ancestors 'none';"
  );
}

// IP-based rate limiting check
function checkRateLimit(ip) {
  const now = Date.now();
  let record = rateLimitMap.get(ip);

  if (!record || now - record.startTime > RATE_LIMIT_WINDOW_MS) {
    record = { count: 1, startTime: now };
    rateLimitMap.set(ip, record);
    return true;
  }

  record.count++;
  if (record.count > MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  return true;
}

// Helper to send standardized JSON responses
function sendJson(res, statusCode, data) {
  setSecurityHeaders(res);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.writeHead(statusCode);
  res.end(JSON.stringify(data));
}

// Read body stream with strict size ceiling
function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let rawData = '';
    let bytesReceived = 0;

    req.on('data', chunk => {
      bytesReceived += chunk.length;
      if (bytesReceived > MAX_BODY_BYTES) {
        req.destroy();
        const err = new Error(`Request payload exceeds maximum allowed size of 10 MB.`);
        err.statusCode = 413;
        reject(err);
        return;
      }
      rawData += chunk;
    });

    req.on('end', () => {
      if (!rawData.trim()) {
        resolve({});
        return;
      }
      try {
        const parsed = JSON.parse(rawData);
        resolve(parsed);
      } catch (err) {
        const parseErr = new Error(`Malformed JSON request body: ${err.message}`);
        parseErr.statusCode = 400;
        reject(parseErr);
      }
    });

    req.on('error', err => {
      reject(err);
    });
  });
}

// Match closest demo preset based on keywords and context if in demo mode
function findMatchingDemoPreset(inputText = '', context = 'auto') {
  const text = inputText.toLowerCase();

  if (context === 'public_service' || text.includes('pension') || text.includes('benefit') || text.includes('udid') || text.includes('aadhaar') || text.includes('scheme') || text.includes('ration') || text.includes('cafe')) {
    return DEMO_PRESETS.public_service.plan;
  }
  if (context === 'health_notes' || text.includes('fatigue') || text.includes('metformin') || text.includes('ibuprofen') || text.includes('warfarin') || text.includes('doctor') || text.includes('clinician') || text.includes('symptom')) {
    return DEMO_PRESETS.health_organization ? DEMO_PRESETS.health_organization.plan : DEMO_PRESETS.medical_crisis.plan;
  }
  if (context === 'community_safety' || text.includes('weather') || text.includes('storm') || text.includes('flood') || text.includes('minto') || text.includes('underpass') || text.includes('tree') || text.includes('wire') || text.includes('road')) {
    return DEMO_PRESETS.community_safety.plan;
  }
  if (context === 'emergency_crisis' || text.includes('chest') || text.includes('pain') || text.includes('heart') || text.includes('stemi') || text.includes('khed') || text.includes('toll')) {
    return DEMO_PRESETS.medical_crisis.plan;
  }

  // Default to community safety
  return DEMO_PRESETS.community_safety.plan;
}

// Safe static file server
function serveStaticFile(req, res, parsedUrl) {
  let pathname = parsedUrl.pathname;
  if (pathname === '/' || pathname === '') {
    pathname = '/index.html';
  }

  // Prevent directory traversal attacks
  const safePath = path.normalize(path.join(PUBLIC_DIR, pathname));
  if (!safePath.startsWith(PUBLIC_DIR)) {
    sendJson(res, 403, { error: 'Forbidden: Access denied.' });
    return;
  }

  fs.stat(safePath, (err, stats) => {
    if (err || !stats.isFile()) {
      sendJson(res, 404, { error: 'Asset not found.' });
      return;
    }

    const ext = path.extname(safePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    setSecurityHeaders(res);
    res.setHeader('Content-Type', contentType);
    if (ext === '.html') {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else {
      res.setHeader('Cache-Control', 'no-cache');
    }

    const stream = fs.createReadStream(safePath);
    stream.on('error', () => {
      if (!res.headersSent) {
        sendJson(res, 500, { error: 'Error reading file.' });
      }
    });
    stream.pipe(res);
  });
}

// Helper to send standardized error JSON responses
function sendError(res, statusCode, message, code = 'ERROR', details = null, extra = {}) {
  sendJson(res, statusCode, {
    success: false,
    error: message,
    code,
    ...(details ? { details } : {}),
    ...extra
  });
}

// Server factory for testing and production
function createServer() {
  const geminiService = new GeminiService();

  const server = http.createServer(async (req, res) => {
    const startTime = Date.now();
    const clientIp = req.socket.remoteAddress || '127.0.0.1';
    const parsedUrl = new URL(req.url, 'http://localhost');

    // Concise, privacy-preserving operational logger (never logs bodies or personal notes)
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      if (process.env.NODE_ENV !== 'test') {
        console.log(`[HTTP] ${req.method} ${parsedUrl.pathname} ${res.statusCode} (${duration}ms)`);
      }
    });

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      setSecurityHeaders(res);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-goog-api-key');
      res.setHeader('Access-Control-Max-Age', '86400');
      res.writeHead(204);
      res.end();
      return;
    }

    // Apply rate limiting
    if (!checkRateLimit(clientIp)) {
      sendError(res, 429, 'Rate limit exceeded. Please wait before submitting more requests.', 'RATE_LIMIT_EXCEEDED');
      return;
    }

    // API Routes
    if (parsedUrl.pathname === '/api/health') {
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        sendError(res, 405, `Method ${req.method} not allowed for /api/health`, 'METHOD_NOT_ALLOWED');
        return;
      }
      const hasApiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim());
      sendJson(res, 200, {
        status: 'ok',
        application: 'SAARTHI AI',
        version: '1.0.0',
        model: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
        mode: hasApiKey ? 'live' : 'demo',
        hasApiKey,
        timestamp: new Date().toISOString(),
        features: {
          multimodal: true,
          speechRecognition: true,
          searchGrounding: true,
          deterministicSafeguards: true
        }
      });
      return;
    }

    if (parsedUrl.pathname === '/api/analyze') {
      if (req.method !== 'POST') {
        sendError(res, 405, `Method ${req.method} not allowed for /api/analyze`, 'METHOD_NOT_ALLOWED');
        return;
      }
      try {
        const body = await readJsonBody(req);
        const validation = validateAnalyzeRequest(body);

        if (!validation.isValid) {
          sendError(res, 400, 'Validation Error', 'VALIDATION_FAILED', validation.errors);
          return;
        }

        const { text, language, mode, context } = validation.cleaned;
        const hasApiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim());

        // Check if demo mode was explicitly requested OR no API key is set
        if (mode === 'demo' || !hasApiKey) {
          const demoPlan = findMatchingDemoPreset(text, context);
          sendJson(res, 200, {
            success: true,
            mode: 'demo',
            plan: demoPlan,
            notice: 'DEMO MODE — Illustrative sample output. Not a live AI analysis or verified information.',
            missingApiKey: !hasApiKey
          });
          return;
        }

        // Live Gemini execution
        try {
          const livePlan = await geminiService.analyzeIntent({
            text,
            image: body.image || null,
            language,
            context,
            enableSearchGrounding: true
          });

          sendJson(res, 200, {
            success: true,
            mode: 'live',
            plan: livePlan,
            retrievedAt: new Date().toISOString()
          });
        } catch (apiErr) {
          console.error(`[Gemini Execution Error] ${apiErr.code || 'UNKNOWN'}: ${apiErr.message}`);

          const statusCode = apiErr.statusCode || 500;
          sendError(
            res,
            statusCode,
            apiErr.message || 'Error communicating with Google Gemini API.',
            apiErr.code || 'GEMINI_FAILURE',
            null,
            {
              suggestDemo: true,
              notice: 'Live API analysis failed. You may explore full capabilities without an API key using Demo Mode.'
            }
          );
        }

      } catch (err) {
        const statusCode = err.statusCode || 500;
        const safeMessage = statusCode >= 500
          ? 'An internal server error occurred while processing the request.'
          : (err.message || 'Error processing request.');
        sendError(res, statusCode, safeMessage, err.code || 'SERVER_ERROR');
      }
      return;
    }

    // Unmatched API endpoint 404
    if (parsedUrl.pathname.startsWith('/api/')) {
      sendError(res, 404, `Endpoint ${parsedUrl.pathname} not found.`, 'NOT_FOUND');
      return;
    }

    // Static Asset Serving (Frontend)
    if (req.method === 'GET' || req.method === 'HEAD') {
      serveStaticFile(req, res, parsedUrl);
      return;
    }

    // Method not allowed
    sendError(res, 405, `Method ${req.method} not allowed.`, 'METHOD_NOT_ALLOWED');
  });

  return server;
}

// Start standalone server when run directly
if (require.main === module) {
  const server = createServer();
  server.listen(PORT, HOST, () => {
    const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim());
    console.log(`\n======================================================`);
    console.log(`  🛡️  SAARTHI AI — Universal Human Intent Engine`);
    console.log(`  Model: Google Gemini (${process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite'})`);
    console.log(`  Status: Operational on http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
    console.log(`  Mode: ${hasKey ? '🟢 LIVE (API key configured)' : '🟡 DEMO MODE (API key not configured)'}`);
    console.log(`======================================================\n`);
  });

  const shutdown = () => {
    console.log('\nGracefully shutting down SAARTHI AI server...');
    server.close(() => {
      console.log('Server terminated cleanly.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

module.exports = { createServer, readJsonBody, checkRateLimit };
