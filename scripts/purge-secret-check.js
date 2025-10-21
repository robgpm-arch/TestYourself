#!/usr/bin/env node
// Simple working-tree check to prevent accidental commit of common secret filenames
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const forbidden = [
  'serviceAccountKey.json',
  'serviceAccount*.json',
  'firebase-service-account*.json',
  'serviceAccount.json',
  'service-account.json',
];

function scan(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === '.git' || e.name === 'node_modules' || e.name === 'dist') continue;
      scan(full);
    } else {
      for (const patt of forbidden) {
        const regex = new RegExp('^' + patt.replace(/\*/g, '.*') + '$');
        if (regex.test(e.name)) {
          console.error(`Forbidden secret file detected in repo: ${full}`);
          process.exitCode = 2;
        }
      }
    }
  }
}

scan(repoRoot);
if (process.exitCode && process.exitCode !== 0) {
  console.error('\nRemove the file(s) and use CI secrets instead. See SECURITY_REMOVAL.md for steps.');
  process.exit(process.exitCode);
}
console.log('No forbidden secret filenames detected.');
