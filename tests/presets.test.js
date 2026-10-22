/**
 * SAARTHI AI — Demo Presets Schema Compliance Tests (Competition Build)
 */

const test = require('node:test');
const assert = require('node:assert');
const { DEMO_PRESETS } = require('../public/demoData');
const { validateAndNormalizeGeminiOutput } = require('../services/validate');

test('Scenario A (Community Safety) conforms to strict disaster schema and hazards', () => {
  const preset = DEMO_PRESETS.community_safety;
  assert.ok(preset, 'Preset community_safety exists');
  assert.strictEqual(preset.category, 'DISASTER');
  assert.ok(preset.inputText.includes('underpass'));

  const plan = preset.plan;
  assert.ok(['High', 'Immediate'].includes(plan.urgency));
  assert.strictEqual(plan.domain, 'DISASTER');
  assert.ok(plan.extractedEntities.primaryIssue.includes('Severe Weather Underpass'));
  assert.ok(plan.facts.length >= 3);
  assert.ok(plan.unknowns.length >= 3);
  assert.ok(plan.conflicts.length >= 1);

  // Check verification claims: identifies unverified / contradicted claims
  assert.ok(plan.verification.length > 0);
  const unverified = plan.verification.find(v => v.status === 'Unverified');
  assert.ok(unverified, 'Must identify the unverified claim of municipal road closure');

  // Human guidance must provide clear physical steps
  assert.ok(plan.humanGuidance.length >= 3);

  // Re-validating through schema validator should pass cleanly
  assert.doesNotThrow(() => {
    validateAndNormalizeGeminiOutput(plan, preset.inputText);
  });
});

test('Scenario B (Health Information Organization) conforms to non-diagnostic clinician preparation', () => {
  const preset = DEMO_PRESETS.health_organization;
  assert.ok(preset, 'Preset health_organization exists');
  assert.ok(preset.inputText.includes('Metformin'));
  assert.ok(preset.inputText.includes('Ibuprofen'));

  const plan = preset.plan;
  assert.ok(['High', 'Immediate'].includes(plan.urgency));
  assert.strictEqual(plan.domain, 'MEDICAL');
  assert.ok(plan.actions.some(a => a.step.includes('Ibuprofen')));
  
  // Non-diagnostic check: verification confirms SAARTHI does not diagnose or prescribe
  const nonDiagCheck = plan.verification.find(v => v.claim.includes('clinical diagnosis'));
  assert.ok(nonDiagCheck);
  assert.strictEqual(nonDiagCheck.status, 'Contradicted');

  // Clinician questions must be present
  assert.ok(plan.humanGuidance.some(g => g.includes('Ask the doctor') || g.includes('QUESTION LIST')));

  assert.doesNotThrow(() => {
    validateAndNormalizeGeminiOutput(plan, preset.inputText);
  });
});

test('Scenario C (Public-Service Navigation) organizes eligibility, fee protection, and official portals', () => {
  const preset = DEMO_PRESETS.public_service;
  assert.ok(preset, 'Preset public_service exists');
  assert.ok(preset.inputText.includes('pension'));
  assert.ok(preset.inputText.includes('2,500'));

  const plan = preset.plan;
  assert.strictEqual(plan.domain, 'CIVIC');
  assert.ok(plan.actions.some(a => a.step.includes('DO NOT PAY')));
  assert.ok(plan.verification.some(v => v.claim.includes('NSAP') || v.claim.includes('pension')));

  // Check official portals cited
  const nsapVer = plan.verification.find(v => v.evidenceUrl && v.evidenceUrl.includes('nsap.nic.in'));
  assert.ok(nsapVer, 'Must cite official nsap.nic.in portal');

  assert.doesNotThrow(() => {
    validateAndNormalizeGeminiOutput(plan, preset.inputText);
  });
});

test('Scenario D (Medical Crisis) conforms to strict emergency rules and ALS dispatch', () => {
  const preset = DEMO_PRESETS.medical_crisis;
  assert.ok(preset, 'Preset medical_crisis exists');
  assert.strictEqual(preset.category, 'MEDICAL');
  assert.ok(preset.inputText.includes('chest me bohot tez dard'));

  const plan = preset.plan;
  assert.strictEqual(plan.urgency, 'Immediate');
  assert.ok(plan.confidenceScore >= 0.9 && plan.confidenceScore <= 1.0);
  assert.strictEqual(plan.domain, 'MEDICAL');
  assert.ok(plan.humanGuidance.length >= 3);
  assert.ok(plan.actions.length >= 3);

  // All actions require human approval
  plan.actions.forEach(act => {
    assert.strictEqual(act.requiresHumanApproval, true);
  });

  // All draft payloads must not be sent
  plan.draftPayloads.forEach(dp => {
    assert.strictEqual(dp.sent, false);
  });

  assert.doesNotThrow(() => {
    validateAndNormalizeGeminiOutput(plan, preset.inputText);
  });
});
