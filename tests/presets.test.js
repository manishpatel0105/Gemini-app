/**
 * SAARTHI AI — Demo Presets Schema Compliance Tests
 */

const test = require('node:test');
const assert = require('node:assert');
const { DEMO_PRESETS } = require('../public/demoData');
const { validateAndNormalizeGeminiOutput } = require('../services/validate');

test('Preset 1 (Medical Crisis) conforms to strict schema and emergency rules', () => {
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

  // Re-validating through schema validator should pass cleanly
  assert.doesNotThrow(() => {
    validateAndNormalizeGeminiOutput(plan, preset.inputText);
  });
});

test('Preset 2 (Community Safety) conforms to strict disaster schema and hazards', () => {
  const preset = DEMO_PRESETS.community_safety;
  assert.ok(preset, 'Preset community_safety exists');
  assert.strictEqual(preset.category, 'DISASTER');
  assert.ok(preset.inputText.includes('Minto Bridge'));

  const plan = preset.plan;
  assert.strictEqual(plan.urgency, 'Immediate');
  assert.strictEqual(plan.domain, 'DISASTER');
  assert.ok(plan.extractedEntities.primaryIssue.includes('Submerged School Bus'));
  assert.ok(plan.extractedEntities.risks.some(r => r.includes('electrocution') || r.includes('Electrocution')));

  // Check verification claims
  assert.ok(plan.verification.length > 0);
  const contradicted = plan.verification.find(v => v.status === 'Contradicted');
  assert.ok(contradicted, 'Must identify the contradicted claim of road closure');

  // Human guidance must warn against water
  assert.ok(plan.humanGuidance.some(g => g.includes('STAY AWAY FROM WATER') || g.includes('water')));
});

test('Preset 3 (Health Navigator) conforms to clinical safety guidelines', () => {
  const preset = DEMO_PRESETS.health_prescription_navigator;
  assert.ok(preset, 'Preset health_prescription_navigator exists');
  assert.ok(preset.inputText.includes('Warfarin'));
  assert.ok(preset.inputText.includes('Ciprofloxacin'));

  const plan = preset.plan;
  assert.strictEqual(plan.urgency, 'Immediate');
  assert.ok(plan.actions.some(a => a.step.includes('STOP Ciprofloxacin')));
  
  // Contradicted claim check (Avil/Cetirizine safe continuation)
  const contradictedAllergy = plan.verification.find(v => v.claim.includes('Cetirizine') || v.claim.includes('Avil'));
  assert.ok(contradictedAllergy);
  assert.strictEqual(contradictedAllergy.status, 'Contradicted');
});
