/**
 * SAARTHI AI — Server Integration & Endpoints Tests
 */

const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const { createServer } = require('../server');

test('Server startup, health endpoint, static serving, and API validation', async (t) => {
  const server = createServer();
  
  await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });

  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  t.after(() => {
    return new Promise((resolve) => server.close(resolve));
  });

  // Test 1: GET /api/health
  await t.test('GET /api/health returns 200 with valid server metadata', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, 'ok');
    assert.strictEqual(data.application, 'SAARTHI AI');
    assert.ok(typeof data.model === 'string' && data.model.startsWith('gemini-'));
    assert.ok(data.features.speechRecognition);
  });

  // Test 2: GET / serves index.html with Content-Security-Policy & nosniff
  await t.test('GET / serves HTML with secure HTTP headers', async () => {
    const res = await fetch(`${baseUrl}/`);
    assert.strictEqual(res.status, 200);
    assert.match(res.headers.get('content-type'), /text\/html/);
    assert.strictEqual(res.headers.get('x-content-type-options'), 'nosniff');
    assert.strictEqual(res.headers.get('x-frame-options'), 'DENY');
    assert.ok(res.headers.get('content-security-policy'));
    const html = await res.text();
    assert.ok(html.includes('SAARTHI AI'));
    assert.ok(html.includes('Human Input Hub'));
  });

  // Test 3: Path Traversal Protection
  await t.test('Path traversal attempts are safely rejected', async () => {
    const res = await fetch(`${baseUrl}/../../../../etc/passwd`);
    assert.ok(res.status === 403 || res.status === 404);
  });

  // Test 4: POST /api/analyze in Demo Mode (or without API key)
  await t.test('POST /api/analyze returns deterministic plan with demo notice', async () => {
    const res = await fetch(`${baseUrl}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Chest pain near toll plaza on NH48',
        mode: 'demo'
      })
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.mode, 'demo');
    assert.ok(data.plan);
    assert.strictEqual(data.plan.urgency, 'Immediate');
    assert.ok(data.notice.includes('DEMO MODE'));
  });

  // Test 5: POST /api/analyze with validation error (empty text & no image)
  await t.test('POST /api/analyze rejects empty request with 400', async () => {
    const res = await fetch(`${baseUrl}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: '' })
    });

    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.error, 'Validation Error');
  });

  // Test 6: POST /api/analyze with malformed JSON body
  await t.test('Malformed JSON returns 400', async () => {
    const options = {
      hostname: '127.0.0.1',
      port: address.port,
      path: '/api/analyze',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const statusCode = await new Promise((resolve) => {
      const req = http.request(options, (res) => resolve(res.statusCode));
      req.write('{ broken json:');
      req.end();
    });

    assert.strictEqual(statusCode, 400);
  });
});
