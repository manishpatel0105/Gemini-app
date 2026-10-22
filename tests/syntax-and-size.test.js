/**
 * SAARTHI AI — Syntax & Repository Size Tests
 */

const test = require('node:test');
const assert = require('node:assert');
const { execSync } = require('node:child_process');
const path = require('node:path');
const { scanDirectory, MAX_SIZE_BYTES } = require('../scripts/repo-size');

const ROOT_DIR = path.resolve(__dirname, '..');

test('Syntax check: All JavaScript files parse without syntax errors', () => {
  const jsFiles = [
    'server.js',
    'services/gemini.js',
    'services/validate.js',
    'services/verification.js',
    'public/app.js',
    'public/ui.js',
    'public/demoData.js',
    'scripts/repo-size.js'
  ];

  for (const relPath of jsFiles) {
    const fullPath = path.join(ROOT_DIR, relPath);
    assert.doesNotThrow(() => {
      execSync(`node --check "${fullPath}"`, { stdio: 'pipe' });
    }, `Syntax error found in ${relPath}`);
  }
});

test('Repository size enforcement: Working tree size must be strictly under 10 MB', () => {
  const files = scanDirectory(ROOT_DIR);
  const totalBytes = files.reduce((acc, f) => acc + f.size, 0);

  assert.ok(
    totalBytes < MAX_SIZE_BYTES,
    `Repository size (${(totalBytes / 1024 / 1024).toFixed(2)} MB) must be strictly less than 10 MB`
  );
  assert.ok(totalBytes > 1000, 'Repository should contain meaningful code files (> 1 KB)');
});
