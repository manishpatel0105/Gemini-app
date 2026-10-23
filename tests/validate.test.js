/**
 * SAARTHI AI — Validation & Emergency Safeguards Tests
 */

const test = require('node:test');
const assert = require('node:assert');
const {
  validateAnalyzeRequest,
  verifyImageMagicBytes,
  validateAndNormalizeGeminiOutput,
  applyDeterministicEmergencyOverride,
  sanitizeEvidenceUrl
} = require('../services/validate');

test('validateAnalyzeRequest rejects non-object or null input', () => {
  assert.strictEqual(validateAnalyzeRequest(null).isValid, false);
  assert.strictEqual(validateAnalyzeRequest('hello').isValid, false);
  assert.strictEqual(validateAnalyzeRequest({}).isValid, false);
});

test('validateAnalyzeRequest validates text length boundaries', () => {
  // Too short
  const shortResult = validateAnalyzeRequest({ text: 'hi' });
  assert.strictEqual(shortResult.isValid, false);
  assert.match(shortResult.errors[0], /at least 3 characters/);

  // Valid length
  const validResult = validateAnalyzeRequest({ text: 'Accident on highway' });
  assert.strictEqual(validResult.isValid, true);
  assert.strictEqual(validResult.cleaned.text, 'Accident on highway');

  // Too long (> 8000 chars)
  const longText = 'A'.repeat(8005);
  const longResult = validateAnalyzeRequest({ text: longText });
  assert.strictEqual(longResult.isValid, false);
  assert.match(longResult.errors[0], /exceeds maximum allowed length/);
});

test('validateAnalyzeRequest rejects invalid image MIME types and oversized images', () => {
  // Disallowed MIME (e.g. PDF or GIF)
  const badMimeResult = validateAnalyzeRequest({
    text: 'Test report',
    image: { mimeType: 'application/pdf', data: 'dGVzdA==' }
  });
  assert.strictEqual(badMimeResult.isValid, false);
  assert.match(badMimeResult.errors[0], /Invalid image MIME type/);

  // Oversized image (over 4MB)
  const fakeBigBase64 = 'A'.repeat(6 * 1024 * 1024);
  const bigImageResult = validateAnalyzeRequest({
    text: 'Test report',
    image: { mimeType: 'image/png', data: fakeBigBase64 }
  });
  assert.strictEqual(bigImageResult.isValid, false);
  assert.match(bigImageResult.errors[0], /exceeds 4 MB limit/);
});

test('verifyImageMagicBytes accurately identifies authentic binary headers', () => {
  // Real PNG header: 89 50 4E 47 0D 0A 1A 0A
  const validPngHeader = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  assert.strictEqual(verifyImageMagicBytes(validPngHeader, 'image/png'), true);
  assert.strictEqual(verifyImageMagicBytes(validPngHeader, 'image/jpeg'), false);

  // Real JPEG header: FF D8 FF
  const validJpegHeader = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10]);
  assert.strictEqual(verifyImageMagicBytes(validJpegHeader, 'image/jpeg'), true);
  assert.strictEqual(verifyImageMagicBytes(validJpegHeader, 'image/png'), false);

  // Real WebP header: 'RIFF' .... 'WEBP'
  const validWebpHeader = Buffer.from([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00]);
  assert.strictEqual(verifyImageMagicBytes(validWebpHeader, 'image/webp'), true);

  // Corrupted / random header
  const corruptHeader = Buffer.from([0x00, 0x01, 0x02, 0x03]);
  assert.strictEqual(verifyImageMagicBytes(corruptHeader, 'image/png'), false);
});

test('validateAndNormalizeGeminiOutput downgrades unsupported claims to Verification unavailable', () => {
  const mockGeminiOutput = {
    title: 'Test Incident',
    intent: { said: 'I see a storm', trueIntent: 'Storm shelter request' },
    urgency: 'Moderate',
    confidenceScore: 0.88,
    domain: 'DISASTER',
    summary: 'Storm approaching',
    facts: ['Storm visible'],
    unknowns: ['Wind speed'],
    conflicts: [],
    extractedEntities: {
      primaryIssue: 'Severe storm',
      symptoms: [],
      history: [],
      risks: ['Flying debris'],
      locationContext: 'City outskirts'
    },
    verification: [
      {
        claim: 'Highway 10 is shut down completely by government order',
        status: 'Verified', // Intentionally claims verified without evidence!
        evidence: [],
        explanation: 'Model thought so'
      }
    ],
    actions: [
      {
        step: 'Monitor weather alerts',
        why: 'Situational awareness',
        timing: 'Immediate',
        priority: 'Normal',
        requiresHumanApproval: true
      }
    ],
    humanGuidance: ['Stay indoors'],
    draftPayloads: [
      {
        targetSystem: 'CIVIC_DESK',
        actionCode: 'INCIDENT_ALERT',
        priority: 'P2',
        payloadSummary: 'Storm alert',
        sent: false
      }
    ],
    safety_note: 'Standard notice',
    follow_up_question: 'Where are you sheltered?'
  };

  const normalized = validateAndNormalizeGeminiOutput(mockGeminiOutput, 'I see a storm');
  
  // The unbacked claim MUST be downgraded from "Verified"
  assert.strictEqual(normalized.verification[0].status, 'Verification unavailable');
  // Human approval must remain strictly true
  assert.strictEqual(normalized.actions[0].requiresHumanApproval, true);
  // Draft payload sent must be strictly false
  assert.strictEqual(normalized.draftPayloads[0].sent, false);
  // safetyNotes and followUpQuestions must be arrays
  assert.ok(Array.isArray(normalized.safetyNotes));
  assert.ok(Array.isArray(normalized.followUpQuestions));
});

test('validateAnalyzeRequest accurately handles operational context', () => {
  const reqWithContext = validateAnalyzeRequest({
    text: 'Applying for disability pension scheme',
    context: 'public_service'
  });
  assert.strictEqual(reqWithContext.isValid, true);
  assert.strictEqual(reqWithContext.cleaned.context, 'public_service');

  const reqWithDefault = validateAnalyzeRequest({
    text: 'General inquiry message'
  });
  assert.strictEqual(reqWithDefault.isValid, true);
  assert.strictEqual(reqWithDefault.cleaned.context, 'auto');
});

test('applyDeterministicEmergencyOverride forces Immediate urgency for cardiac and live wire markers', () => {
  const basePlan = {
    title: 'Initial Plan',
    intent: { said: 'caller note', trueIntent: 'triage' },
    urgency: 'Low', // Intentionally low to test override
    confidenceScore: 0.9,
    domain: 'MEDICAL',
    summary: 'Caller report',
    facts: [],
    unknowns: [],
    conflicts: [],
    extractedEntities: {
      primaryIssue: 'Patient collapsed with sudden chest pain and sweating',
      symptoms: ['Chest pain', 'Diaphoresis'],
      history: [],
      risks: ['Cardiac arrest'],
      locationContext: 'Home'
    },
    verification: [],
    actions: [{ step: 'Wait and see', priority: 'Normal', timing: 'Later' }],
    humanGuidance: ['Take some water'],
    draftPayloads: [],
    safety_note: '',
    follow_up_question: ''
  };

  const overridden = applyDeterministicEmergencyOverride(basePlan, 'pitaji ko achanak seene me dard ho raha hai');

  assert.strictEqual(overridden.urgency, 'Immediate');
  assert.ok(overridden.humanGuidance[0].includes('112'), 'Must advise calling 112 immediately');
  assert.strictEqual(overridden.actions[0].priority, 'Critical');
  assert.ok(overridden.safety_note.includes('DETERMINISTIC EMERGENCY SAFEGUARD ACTIVE'));
});

test('sanitizeEvidenceUrl accepts valid http/https URLs and rejects unsafe protocols', () => {
  assert.strictEqual(sanitizeEvidenceUrl('https://ndma.gov.in/guidelines'), 'https://ndma.gov.in/guidelines');
  assert.strictEqual(sanitizeEvidenceUrl('http://mohfw.gov.in/index.php?id=123'), 'http://mohfw.gov.in/index.php?id=123');

  // Reject malicious schemes
  assert.strictEqual(sanitizeEvidenceUrl('javascript:alert(1)'), '');
  assert.strictEqual(sanitizeEvidenceUrl('data:text/html,<script>alert(1)</script>'), '');
  assert.strictEqual(sanitizeEvidenceUrl('ftp://example.com/exploit'), '');
  assert.strictEqual(sanitizeEvidenceUrl('file:///etc/passwd'), '');
  assert.strictEqual(sanitizeEvidenceUrl('/relative/path/only'), '');
  assert.strictEqual(sanitizeEvidenceUrl('not-a-valid-url'), '');
  assert.strictEqual(sanitizeEvidenceUrl(null), '');
  assert.strictEqual(sanitizeEvidenceUrl(12345), '');
});

test('validateAnalyzeRequest enforces strict mode and context enum validation', () => {
  // Invalid mode
  const badMode = validateAnalyzeRequest({
    text: 'Valid report text here',
    mode: 'unauthorized_mode'
  });
  assert.strictEqual(badMode.isValid, false);
  assert.match(badMode.errors[0], /Allowed modes: "live" or "demo"/);

  // Valid modes
  assert.strictEqual(validateAnalyzeRequest({ text: 'Valid report', mode: 'live' }).isValid, true);
  assert.strictEqual(validateAnalyzeRequest({ text: 'Valid report', mode: 'demo' }).isValid, true);

  // Invalid context
  const badContext = validateAnalyzeRequest({
    text: 'Valid report text here',
    context: 'unsupported_context_domain'
  });
  assert.strictEqual(badContext.isValid, false);
  assert.match(badContext.errors[0], /Invalid context specified/);

  // Valid contexts
  for (const ctx of ['auto', 'community_safety', 'health_notes', 'public_service', 'traffic_civic', 'emergency_crisis']) {
    assert.strictEqual(validateAnalyzeRequest({ text: 'Valid report', context: ctx }).isValid, true);
  }
});

test('validateAndNormalizeGeminiOutput sanitizes malicious URLs in evidence sources', () => {
  const modelOutput = {
    title: 'Flood Triage',
    intent: { said: 'Water rising', trueIntent: 'Evacuation request' },
    urgency: 'Immediate',
    confidenceScore: 0.9,
    domain: 'DISASTER',
    summary: 'Water level rising quickly',
    facts: ['Water level 3 feet'],
    unknowns: [],
    conflicts: [],
    extractedEntities: {
      primaryIssue: 'Flood',
      symptoms: [],
      history: [],
      risks: ['Drowning'],
      locationContext: 'River bank'
    },
    verification: [
      {
        claim: 'NDRF team dispatched',
        status: 'Verified',
        primaryUrl: 'javascript:evil()',
        evidence: [
          {
            source: 'Malicious Source',
            url: 'javascript:alert("xss")',
            text: 'Fake confirmation'
          },
          {
            source: 'NDMA Official',
            url: 'https://ndma.gov.in/bulletin',
            text: 'Official confirmation'
          }
        ],
        explanation: 'NDRF alert'
      }
    ],
    actions: [{ step: 'Evacuate to high ground', priority: 'Critical', timing: 'Immediate' }],
    humanGuidance: ['Move now'],
    draftPayloads: []
  };

  const normalized = validateAndNormalizeGeminiOutput(modelOutput, 'Water rising');
  const claim = normalized.verification[0];

  // primaryUrl with javascript: protocol should be neutralized to empty string
  assert.strictEqual(claim.primaryUrl, '');
  // First evidence with javascript: URL should be stripped
  assert.strictEqual(claim.evidence[0].url, '');
  // Second evidence with https: should remain intact
  assert.strictEqual(claim.evidence[1].url, 'https://ndma.gov.in/bulletin');
});

test('Clinical Safety Mandate: automatically enforces non-diagnostic clinical disclaimer for medical domain', () => {
  const medicalModelOutput = {
    title: 'Patient Medication Question',
    intent: { said: 'Father taking Metformin, feels dizzy', trueIntent: 'Medication inquiry' },
    urgency: 'Moderate',
    confidenceScore: 0.85,
    domain: 'MEDICAL',
    summary: 'Elderly patient with dizziness on Metformin',
    facts: ['Takes Metformin'],
    unknowns: ['Blood sugar level'],
    conflicts: [],
    extractedEntities: {
      primaryIssue: 'Dizziness and medication inquiry',
      symptoms: ['Dizziness'],
      history: ['Diabetes'],
      risks: ['Hypoglycemia'],
      locationContext: 'Home'
    },
    verification: [],
    actions: [{ step: 'Contact physician', priority: 'High', timing: 'Prompt' }],
    humanGuidance: ['Sit down and rest'],
    draftPayloads: [],
    safety_note: 'Standard notice' // Lacks clinical disclaimer
  };

  const normalized = validateAndNormalizeGeminiOutput(medicalModelOutput, 'Father taking Metformin, feels dizzy');

  // Must prepend clinical safety disclaimer
  assert.ok(normalized.safety_note.includes('CLINICAL SAFETY MANDATE'));
  assert.ok(normalized.safety_note.includes('does NOT provide medical diagnoses'));
  assert.ok(normalized.safetyNotes.some(s => s.includes('CLINICAL SAFETY MANDATE')));
  assert.strictEqual(normalized.actions[0].requiresHumanApproval, true);
  assert.strictEqual(normalized.draftPayloads[0].sent, false);
});
