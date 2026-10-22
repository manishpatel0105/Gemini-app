#!/usr/bin/env node

/**
 * SAARTHI AI — Repository Size Audit Script
 * Measures working tree files (excluding .git and node_modules) and git-tracked files.
 * Enforces strict < 10 MB limit for hackathon compliance.
 */

const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ROOT_DIR = path.resolve(__dirname, '..');

// Directories and files excluded from the working-tree calculation
const EXCLUDED_PATTERNS = [
  /^[\\/]?\.git([\\/]|$)/,
  /^[\\/]?node_modules([\\/]|$)/,
  /^[\\/]?coverage([\\/]|$)/,
  /^[\\/]?scratch([\\/]|$)/,
  /^[\\/]?\.DS_Store$/,
  /^[\\/]?\.env$/
];

function isExcluded(relPath) {
  const normalized = relPath.replace(/\\/g, '/');
  return EXCLUDED_PATTERNS.some(pattern => pattern.test(normalized));
}

function scanDirectory(dir, baseDir = dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(baseDir, fullPath);

    if (isExcluded(relPath)) {
      continue;
    }

    if (entry.isDirectory()) {
      results.push(...scanDirectory(fullPath, baseDir));
    } else if (entry.isFile()) {
      try {
        const stat = fs.statSync(fullPath);
        results.push({
          relPath: relPath.replace(/\\/g, '/'),
          size: stat.size
        });
      } catch (err) {
        console.warn(`Warning: Could not stat ${relPath}: ${err.message}`);
      }
    }
  }

  return results;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function runAudit() {
  console.log('\n======================================================');
  console.log('   SAARTHI AI — Repository Size Audit');
  console.log('======================================================');
  console.log(`Directory:   ${ROOT_DIR}`);
  console.log(`Max Limit:   ${formatBytes(MAX_SIZE_BYTES)} (10 MB)\n`);

  console.log('[1/2] Auditing Working-Tree Files (excluding .git & node_modules)...');
  const files = scanDirectory(ROOT_DIR);
  files.sort((a, b) => b.size - a.size);

  const totalWorkingSize = files.reduce((acc, f) => acc + f.size, 0);

  console.log(`Found ${files.length} working-tree files:`);
  console.log('------------------------------------------------------');
  files.slice(0, 15).forEach(f => {
    console.log(`  ${f.relPath.padEnd(40)} : ${formatBytes(f.size).padStart(10)}`);
  });
  if (files.length > 15) {
    console.log(`  ... and ${files.length - 15} more files.`);
  }
  console.log('------------------------------------------------------');
  console.log(`Total Working-Tree Size: ${formatBytes(totalWorkingSize)} (${totalWorkingSize.toLocaleString()} bytes)\n`);

  console.log('[2/2] Checking Git Tracked Files (if git initialized)...');
  let gitTrackedSize = 0;
  let gitTrackedCount = 0;
  try {
    const trackedList = execSync('git ls-files', { cwd: ROOT_DIR, encoding: 'utf8' })
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    for (const relPath of trackedList) {
      const fullPath = path.join(ROOT_DIR, relPath);
      if (fs.existsSync(fullPath)) {
        gitTrackedSize += fs.statSync(fullPath).size;
        gitTrackedCount++;
      }
    }
    console.log(`Git Tracked Files: ${gitTrackedCount} files, Total: ${formatBytes(gitTrackedSize)} (${gitTrackedSize.toLocaleString()} bytes)`);
  } catch (err) {
    console.log(`Git tracked files check skipped (git not fully committed or not available): ${err.message.split('\n')[0]}`);
  }

  console.log('\n======================================================');
  const percentage = ((totalWorkingSize / MAX_SIZE_BYTES) * 100).toFixed(2);
  console.log(`Usage: ${percentage}% of 10 MB limit`);

  if (totalWorkingSize > MAX_SIZE_BYTES) {
    console.error(`❌ FAILED: Repository size (${formatBytes(totalWorkingSize)}) exceeds 10 MB limit!`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: Repository size (${formatBytes(totalWorkingSize)}) is well within the 10 MB limit.`);
    console.log('======================================================\n');
    process.exit(0);
  }
}

if (require.main === module) {
  runAudit();
}

module.exports = { scanDirectory, formatBytes, MAX_SIZE_BYTES, isExcluded };
