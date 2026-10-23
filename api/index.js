/**
 * SAARTHI AI — Vercel Serverless Function Entry Point
 * 
 * Routes incoming serverless requests to the canonical request handler in server.js.
 * Preserves all security headers, input validation, rate limiting, and Gemini integration.
 */

const { createRequestHandler } = require('../server');

const handler = createRequestHandler();

module.exports = async (req, res) => {
  return handler(req, res);
};
