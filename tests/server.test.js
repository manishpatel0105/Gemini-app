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

  // Test 7: CORS Preflight OPTIONS
  await t.test('OPTIONS /api/analyze returns 204 with complete CORS headers', async () => {
    const res = await fetch(`${baseUrl}/api/analyze`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://example.com',
        'Access-Control-Request-Method': 'POST'
      }
    });

    assert.strictEqual(res.status, 204);
    assert.strictEqual(res.headers.get('access-control-allow-origin'), '*');
    assert.ok(res.headers.get('access-control-allow-methods').includes('POST'));
    assert.ok(res.headers.get('access-control-allow-headers').includes('Content-Type'));
  });

  // Test 8: Method Not Allowed (405)
  await t.test('Unsupported HTTP methods return 405 with structured error', async () => {
    const putRes = await fetch(`${baseUrl}/api/analyze`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'test' })
    });
    assert.strictEqual(putRes.status, 405);
    const putData = await putRes.json();
    assert.strictEqual(putData.success, false);
    assert.strictEqual(putData.code, 'METHOD_NOT_ALLOWED');

    const postHealthRes = await fetch(`${baseUrl}/api/health`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    assert.strictEqual(postHealthRes.status, 405);
    const healthData = await postHealthRes.json();
    assert.strictEqual(healthData.success, false);
    assert.strictEqual(healthData.code, 'METHOD_NOT_ALLOWED');
  });

  // Test 9: Unknown API Route returns 404 with structured error
  await t.test('Unregistered /api/* route returns 404 with structured error', async () => {
    const res = await fetch(`${baseUrl}/api/non_existent_endpoint`);
    assert.strictEqual(res.status, 404);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.code, 'NOT_FOUND');
  });

  // Test 10: Error responses never leak stack traces or internal server paths
  await t.test('Error responses omit stack traces and internal filesystem paths', async () => {
    const res = await fetch(`${baseUrl}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: '' })
    });
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.stack, undefined, 'Stack trace must NEVER be sent to client');
    assert.ok(!JSON.stringify(data).includes('/Users/'), 'Internal filesystem paths must not be exposed');
  });

  // Test 11: Vercel serverless function entrypoint (api/index.js) behaves reliably
  await t.test('Vercel serverless handler (api/index.js) operates reliably', async () => {
    const vercelHandler = require('../api/index');
    const vercelServer = http.createServer(vercelHandler);
    await new Promise((resolve) => vercelServer.listen(0, '127.0.0.1', resolve));
    const vPort = vercelServer.address().port;
    try {
      const vRes = await fetch(`http://127.0.0.1:${vPort}/api/health`);
      assert.strictEqual(vRes.status, 200);
      const vData = await vRes.json();
      assert.strictEqual(vData.status, 'ok');
      assert.strictEqual(vData.application, 'SAARTHI AI');
    } finally {
      await new Promise((resolve) => vercelServer.close(resolve));
    }
  });
});
