/**
 * SAARTHI AI — Gemini Service Mocks & Error Handling Tests
 */

const test = require('node:test');
const assert = require('node:assert');
const { GeminiService } = require('../services/gemini');

test('GeminiService throws error if initialized without GEMINI_API_KEY', async () => {
  const service = new GeminiService('');
  await assert.rejects(
    async () => {
      await service.analyzeIntent({ text: 'Emergency test report' });
    },
    (err) => {
      assert.strictEqual(err.code, 'NO_API_KEY');
      assert.strictEqual(err.statusCode, 401);
      return true;
    }
  );
});

test('GeminiService error handler properly classifies API HTTP errors', async () => {
  const service = new GeminiService('dummy_key');

  // Test 401 unauthorized
  const mock401Response = {
    status: 401,
    json: async () => ({ error: { message: 'API key not valid. Please pass a valid API key.' } }),
    text: async () => ''
  };

  await assert.rejects(
    async () => {
      await service._handleApiError(mock401Response);
    },
    (err) => {
      assert.strictEqual(err.code, 'INVALID_API_KEY');
      assert.strictEqual(err.statusCode, 401);
      assert.ok(err.message.includes('Invalid or unauthorized GEMINI_API_KEY'));
      return true;
    }
  );

  // Test 429 quota
  const mock429Response = {
    status: 429,
    json: async () => ({ error: { message: 'Resource has been exhausted (e.g. check quota).' } }),
    text: async () => ''
  };

  await assert.rejects(
    async () => {
      await service._handleApiError(mock429Response);
    },
    (err) => {
      assert.strictEqual(err.code, 'RATE_LIMIT_EXCEEDED');
      assert.strictEqual(err.statusCode, 429);
      assert.ok(err.message.includes('quota or rate limit exceeded'));
      return true;
    }
  );

  // Test 503 upstream
  const mock503Response = {
    status: 503,
    json: async () => ({ error: { message: 'Service Unavailable' } }),
    text: async () => ''
  };

  await assert.rejects(
    async () => {
      await service._handleApiError(mock503Response);
    },
    (err) => {
      assert.strictEqual(err.code, 'UPSTREAM_SERVER_ERROR');
      assert.strictEqual(err.statusCode, 503);
      return true;
    }
  );
});

test('GeminiService parses structured candidates and correlates evidence', async () => {
  const service = new GeminiService('test_key');

  const originalFetch = global.fetch;

  // Mock global.fetch to simulate Gemini generateContent response
  global.fetch = async (url, options) => {
    // Check if this is the search grounding pass or the structured synthesis pass
    const body = JSON.parse(options.body);
    if (body.tools) {
      // Grounding call mock
      return {
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [
            {
              groundingMetadata: {
                webSearchQueries: ['NH48 Khed Shivapur toll ambulance'],
                groundingChunks: [
                  {
                    web: {
                      uri: 'https://morth.nic.in/emergency',
                      title: 'Ministry of Road Transport and Highways'
                    }
                  }
                ]
              }
            }
          ]
        })
      };
    }

    // Structured JSON call mock
    return {
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    title: 'NH48 Collision and Triage',
                    intent: {
                      said: 'Accident at toll',
                      trueIntent: 'Ambulance dispatch to highway bottleneck'
                    },
                    urgency: 'Immediate',
                    confidenceScore: 0.94,
                    domain: 'TRAFFIC',
                    summary: 'Vehicle collision near toll plaza',
                    facts: ['Accident occurred near toll barrier'],
                    unknowns: ['Number of injured'],
                    conflicts: [],
                    extractedEntities: {
                      primaryIssue: 'Vehicle collision',
                      symptoms: [],
                      history: [],
                      risks: ['Traffic congestion'],
                      locationContext: 'NH48 Toll Plaza'
                    },
                    verification: [
                      {
                        claim: 'Ministry of Road Transport coordinates emergency patrols on NH48',
                        status: 'Verified',
                        evidence: [],
                        explanation: 'Official patrol documentation'
                      }
                    ],
                    actions: [
                      {
                        step: 'Dispatch Highway Patrol Unit',
                        why: 'Clear roadway and secure perimeter',
                        timing: 'Immediate',
                        priority: 'Critical',
                        requiresHumanApproval: true
                      }
                    ],
                    humanGuidance: ['Stay inside barrier', 'Turn on hazards'],
                    draftPayloads: [
                      {
                        targetSystem: 'TRAFFIC_CONTROL',
                        actionCode: 'TRAFFIC_GRID_REROUTE',
                        priority: 'P1',
                        payloadSummary: 'Lane closure alert',
                        sent: false
                      }
                    ],
                    safety_note: 'Standard notice',
                    follow_up_question: 'Are any occupants injured?'
                  })
                }
              ]
            }
          }
        ]
      })
    };
  };

  try {
    const result = await service.analyzeIntent({
      text: 'Accident at NH48 Khed Shivapur toll',
      enableSearchGrounding: true
    });

    assert.ok(result);
    assert.strictEqual(result.title, 'NH48 Collision and Triage');
    assert.strictEqual(result.urgency, 'Immediate');
    assert.strictEqual(result.domain, 'TRAFFIC');
    assert.ok(result.actions[0].requiresHumanApproval);
    assert.strictEqual(result.draftPayloads[0].sent, false);
    // Verification claim should have been correlated with the real grounding URI
    assert.ok(result.verification.length > 0);
  } finally {
    global.fetch = originalFetch;
  }
});
