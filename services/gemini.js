/**
 * SAARTHI AI — Google Gemini 2.5 Flash REST Client
 * 
 * Interacts directly with Google's official Gemini REST API:
 * https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
 * 
 * Features:
 * - Direct REST implementation using Node.js built-in fetch API (zero external runtime dependencies)
 * - Multimodal content support: text + inlineData (base64 image)
 * - Strict JSON generation via responseMimeType: "application/json"
 * - Optional Two-step Grounding pipeline (Search Grounding retrieval -> Structured JSON synthesis)
 * - Comprehensive error handling (Quota, Invalid Key, Timeouts, Malformed responses)
 */

const { validateAndNormalizeGeminiOutput } = require('./validate');
const { VerificationAdapter } = require('./verification');

const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const REQUEST_TIMEOUT_MS = 28000;

const SYSTEM_INSTRUCTION = `
You are SAARTHI AI (Universal Human Intent-to-System Action Engine), an emergency operations and critical civic triage intelligence system.
Your mission: Transform messy real-world human inputs (multilingual Hinglish, Hindi, fragmented English, distress calls, scene photos) into structured, evidence-aware, prioritized action plans.

RULES & OPERATIONAL ETHICS:
1. Decode the true underlying operational intent behind the panicked or confused communication.
2. Accurately identify urgency: Immediate (life-threatening peril), High (urgent escalation required), Moderate, Low, or Unclear.
3. Domain must be one of: MEDICAL, DISASTER, CIVIC, TRAFFIC, OTHER.
4. Extract structured facts, unknowns (critical missing info), and conflicting statements.
5. In extractedEntities, separate primaryIssue, symptoms, history, risks, and locationContext.
6. For actions: Specify target step, why, timing, and priority (Critical, High, Normal). Every action must have requiresHumanApproval: true.
7. Provide exactly 3 immediate, clear, physical humanGuidance steps for on-scene bystanders/callers.
8. Draft payloads must have targetSystem (e.g. EMS_DISPATCH_GATEWAY, DISASTER_MGMT_EOC, TRAFFIC_GRID_REROUTE, CLINICAL_SAFETY_ADVISORY), actionCode, priority (P1/P2), payloadSummary, and ALWAYS sent: false.
9. Verification rules: For claims, if no verified external evidence is provided, mark status as "Unverified" or "Verification unavailable". NEVER invent fake URLs, fake helpline numbers, or fake statistics.
10. Include an appropriate safety_note and one high-priority follow_up_question to clarify the most critical unknown.
11. Output MUST BE valid, strict JSON matching the exact schema requested.
`;

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    title: { type: "STRING" },
    intent: {
      type: "OBJECT",
      properties: {
        said: { type: "STRING" },
        trueIntent: { type: "STRING" }
      },
      required: ["said", "trueIntent"]
    },
    urgency: {
      type: "STRING",
      enum: ["Immediate", "High", "Moderate", "Low", "Unclear"]
    },
    confidenceScore: { type: "NUMBER" },
    domain: {
      type: "STRING",
      enum: ["MEDICAL", "DISASTER", "CIVIC", "TRAFFIC", "OTHER"]
    },
    summary: { type: "STRING" },
    facts: {
      type: "ARRAY",
      items: { type: "STRING" }
    },
    unknowns: {
      type: "ARRAY",
      items: { type: "STRING" }
    },
    conflicts: {
      type: "ARRAY",
      items: { type: "STRING" }
    },
    extractedEntities: {
      type: "OBJECT",
      properties: {
        primaryIssue: { type: "STRING" },
        symptoms: { type: "ARRAY", items: { type: "STRING" } },
        history: { type: "ARRAY", items: { type: "STRING" } },
        risks: { type: "ARRAY", items: { type: "STRING" } },
        locationContext: { type: "STRING" }
      },
      required: ["primaryIssue", "symptoms", "history", "risks", "locationContext"]
    },
    verification: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          claim: { type: "STRING" },
          status: {
            type: "STRING",
            enum: ["Verified", "Partially verified", "Unverified", "Contradicted", "Verification unavailable"]
          },
          evidence: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                source: { type: "STRING" },
                url: { type: "STRING" },
                snippet: { type: "STRING" },
                retrievedAt: { type: "STRING" }
              }
            }
          },
          explanation: { type: "STRING" }
        },
        required: ["claim", "status"]
      }
    },
    actions: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          step: { type: "STRING" },
          why: { type: "STRING" },
          timing: { type: "STRING" },
          priority: { type: "STRING", enum: ["Critical", "High", "Normal"] },
          requiresHumanApproval: { type: "BOOLEAN" }
        },
        required: ["step", "why", "timing", "priority", "requiresHumanApproval"]
      }
    },
    humanGuidance: {
      type: "ARRAY",
      items: { type: "STRING" }
    },
    draftPayloads: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          targetSystem: { type: "STRING" },
          actionCode: { type: "STRING" },
          priority: { type: "STRING" },
          payloadSummary: { type: "STRING" },
          sent: { type: "BOOLEAN" }
        },
        required: ["targetSystem", "actionCode", "priority", "payloadSummary", "sent"]
      }
    },
    rawSystemPayload: { type: "OBJECT" },
    safety_note: { type: "STRING" },
    safetyNotes: { type: "ARRAY", items: { type: "STRING" } },
    follow_up_question: { type: "STRING" },
    followUpQuestions: { type: "ARRAY", items: { type: "STRING" } }
  },
  required: [
    "title", "intent", "urgency", "confidenceScore", "domain",
    "summary", "facts", "unknowns", "conflicts", "extractedEntities",
    "verification", "actions", "humanGuidance", "draftPayloads",
    "safety_note", "follow_up_question"
  ]
};

class GeminiService {
  constructor(apiKey = process.env.GEMINI_API_KEY) {
    this.apiKey = apiKey;
    this.verificationAdapter = new VerificationAdapter();
  }

  /**
   * Primary analysis entry point
   * @param {Object} params - { text, image, language, context, enableSearchGrounding }
   */
  async analyzeIntent({ text = '', image = null, language = 'en-IN', context = 'auto', enableSearchGrounding = true }) {
    if (!this.apiKey) {
      const err = new Error('GEMINI_API_KEY is not configured on the server. Switch to Demo Mode or configure .env');
      err.code = 'NO_API_KEY';
      err.statusCode = 401;
      throw err;
    }

    let groundingMetadata = null;
    let externalEvidence = [];

    // Optional Step 1: Perform search grounding pass if enabled and text query exists
    if (enableSearchGrounding && text && text.trim().length > 10) {
      try {
        groundingMetadata = await this._retrieveSearchGrounding(text);
        if (groundingMetadata) {
          externalEvidence = this.verificationAdapter.extractGroundingEvidence(groundingMetadata);
        }
      } catch (err) {
        // Grounding failure shouldn't abort the primary pipeline; log and proceed with direct synthesis
        console.warn(`[Gemini Grounding Notice] Grounding pass skipped/failed: ${err.message}`);
      }
    }

    // Step 2: Perform structured JSON synthesis
    const structuredAnalysis = await this._generateStructuredContent({
      text,
      image,
      language,
      context,
      externalEvidence
    });

    return structuredAnalysis;
  }

  /**
   * Search Grounding Pass using Google Search tool in Gemini
   */
  async _retrieveSearchGrounding(queryText) {
    const endpoint = `${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    try {
      const prompt = `Search for official facts, emergency numbers, route conditions, or public health guidelines regarding: "${queryText.slice(0, 500)}"`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKey
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          tools: [{ googleSearch: {} }]
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const candidate = data.candidates && data.candidates[0];
      return candidate ? candidate.groundingMetadata : null;
    } catch {
      clearTimeout(timeout);
      return null;
    }
  }

  /**
   * Structured JSON Synthesis pass
   */
  async _generateStructuredContent({ text, image, language, context = 'auto', externalEvidence = [] }) {
    const endpoint = `${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent`;
    const parts = [];

    // Context prefix
    let promptText = `INPUT COMMUNICATION (Language: ${language}):\n"""\n${text}\n"""\n`;

    if (context && context !== 'auto') {
      promptText += `\nUSER SELECTED CONTEXT: ${context.toUpperCase()}\n`;
      if (context === 'health_notes') {
        promptText += `CRITICAL HEALTH BOUNDARY: NEVER diagnose diseases, certify conditions, or prescribe/alter medications. Organize symptoms, history, and timeline clearly, and draft prioritized questions for the user to ask a qualified clinician.\n`;
      } else if (context === 'public_service') {
        promptText += `PUBLIC SERVICE NAVIGATION: Clearly distinguish user goal, missing eligibility details, official fee rules (warning against unauthorized intermediaries), and verified government portal paths.\n`;
      } else if (context === 'community_safety') {
        promptText += `COMMUNITY SAFETY: Clearly separate eyewitness statements from unconfirmed rumors. Prioritize physical safety and specify what official channels need verification without fabricating closures.\n`;
      }
    }

    if (externalEvidence && externalEvidence.length > 0) {
      promptText += `\nRETRIEVED EXTERNAL GROUNDING EVIDENCE (Use only these real sources for any 'Verified' claims):\n`;
      externalEvidence.forEach((ev, i) => {
        promptText += `[Source ${i + 1}] Title: ${ev.source} | URL: ${ev.url}\nExcerpt: ${ev.snippet}\n`;
      });
      promptText += `\nIf a claim is not supported by these sources, you MUST set status to 'Unverified' or 'Verification unavailable'. Never fabricate fake citations.\n`;
    }

    parts.push({ text: promptText });

    // Handle image input
    if (image && image.data) {
      const cleanBase64 = String(image.data).replace(/^data:image\/\w+;base64,/, '');
      parts.push({
        inlineData: {
          mimeType: image.mimeType || 'image/jpeg',
          data: cleanBase64
        }
      });
    }

    const payload = {
      systemInstruction: {
        parts: [{ text: SYSTEM_INSTRUCTION }]
      },
      contents: [
        {
          role: 'user',
          parts
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.2
      }
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKey
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        await this._handleApiError(response);
      }

      const data = await response.json();
      const candidate = data.candidates && data.candidates[0];

      if (!candidate || !candidate.content || !candidate.content.parts || !candidate.content.parts[0]) {
        throw new Error('Gemini returned an empty or invalid response structure.');
      }

      const rawJsonText = candidate.content.parts[0].text;
      let parsedJson;
      try {
        parsedJson = JSON.parse(rawJsonText);
      } catch (parseErr) {
        console.error('Failed to parse Gemini JSON output:', rawJsonText);
        throw new Error(`Model output did not conform to JSON: ${parseErr.message}`);
      }

      // Check for any candidate grounding metadata
      const candidateGrounding = candidate.groundingMetadata;
      if (candidateGrounding) {
        const extraEvidence = this.verificationAdapter.extractGroundingEvidence(candidateGrounding);
        if (extraEvidence.length > 0) {
          externalEvidence = [...externalEvidence, ...extraEvidence];
        }
      }

      // Pass through claim correlation
      if (parsedJson.verification && externalEvidence.length > 0) {
        parsedJson.verification = this.verificationAdapter.correlateClaimsWithEvidence(
          parsedJson.verification,
          externalEvidence
        );
      }

      // Normalize and validate against strict schema + emergency overrides
      return validateAndNormalizeGeminiOutput(parsedJson, text);

    } catch (err) {
      clearTimeout(timeout);

      if (err.name === 'AbortError') {
        const timeoutErr = new Error(`Gemini request timed out after ${REQUEST_TIMEOUT_MS / 1000} seconds.`);
        timeoutErr.code = 'TIMEOUT';
        timeoutErr.statusCode = 504;
        throw timeoutErr;
      }

      throw err;
    }
  }

  /**
   * Map Gemini HTTP error status to helpful, secure error responses
   */
  async _handleApiError(response) {
    let errorDetails = '';
    try {
      const errJson = await response.json();
      errorDetails = errJson.error ? errJson.error.message : JSON.stringify(errJson);
    } catch {
      errorDetails = await response.text().catch(() => '');
    }

    const status = response.status;
    let message = `Gemini API error (${status}): ${errorDetails}`;
    let code = 'GEMINI_API_ERROR';

    if (status === 400) {
      code = 'BAD_REQUEST';
      message = `Invalid request or schema formatting sent to Gemini: ${errorDetails}`;
    } else if (status === 401 || status === 403) {
      code = 'INVALID_API_KEY';
      message = 'Invalid or unauthorized GEMINI_API_KEY. Please verify your API key in .env or switch to Demo Mode.';
    } else if (status === 429) {
      code = 'RATE_LIMIT_EXCEEDED';
      message = 'Gemini API quota or rate limit exceeded. Please wait a moment or test using Demo Mode.';
    } else if (status >= 500) {
      code = 'UPSTREAM_SERVER_ERROR';
      message = 'Google Gemini service temporarily unavailable. Please retry or explore Demo Mode.';
    }

    const error = new Error(message);
    error.code = code;
    error.statusCode = status;
    throw error;
  }
}

module.exports = {
  GeminiService,
  GEMINI_MODEL,
  RESPONSE_SCHEMA,
  SYSTEM_INSTRUCTION
};
