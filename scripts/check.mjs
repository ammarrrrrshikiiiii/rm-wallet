// ===== RM Wallet – static-site integrity check ("build" for a no-build app) =====
// Verifies that the static site is well-formed before it ships: local assets resolve,
// no inline scripts remain, external CDN assets are pinned with SRI, and the pure logic
// modules stay free of DOM APIs so they remain unit-testable.
import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, join, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const HTML_FILES = ['index.html', 'dashboard.html', 'transactions.html', 'budgets.html'];

const failures = [];
const ok = (msg) => console.log(`  \u2713 ${msg}`);
const fail = (msg) => {
  failures.push(msg);
  console.error(`  \u2717 ${msg}`);
};

const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');

// --- 1. Local asset references must resolve -------------------------------------
console.log('1. Local asset references');
for (const page of HTML_FILES) {
  const html = read(page);
  const refs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((m) => m[1]);
  for (const ref of refs) {
    if (/^(https?:)?\/\//.test(ref) || ref.startsWith('data:') || ref.startsWith('#')) continue;
    const target = resolve(dirname(join(ROOT, page)), ref);
    const inside = target.startsWith(ROOT + sep);
    if (inside && existsSync(target)) ok(`${page} -> ${ref}`);
    else fail(`${page} references missing file: ${ref}`);
  }
}

// --- 2. No inline scripts (all JS must be external modules) ----------------------
console.log('2. Inline scripts');
for (const page of HTML_FILES) {
  const html = read(page);
  const inline = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)];
  if (inline.length === 0) ok(`${page} has no inline scripts`);
  else fail(`${page} has ${inline.length} inline script block(s)`);
}

// --- 3. External CDN assets must be pinned with SRI ------------------------------
console.log('3. CDN integrity (SRI)');
for (const page of HTML_FILES) {
  const html = read(page);
  for (const m of html.matchAll(/<(script|link)\b[^>]*(?:src|href)="(https:\/\/[^"]+)"[^>]*>/gi)) {
    const [tag, url] = [m[1], m[2]];
    // Google Fonts stylesheets are dynamic and cannot carry SRI; skip them.
    if (url.includes('fonts.googleapis.com')) {
      ok(`${page} -> ${url} (fonts, SRI not applicable)`);
      continue;
    }
    const hasIntegrity = /\bintegrity=/.test(m[0]);
    const hasCrossOrigin = /\bcrossorigin=/.test(m[0]);
    if (hasIntegrity && hasCrossOrigin) ok(`${page} -> ${url}`);
    else fail(`${page} -> ${url} is missing ${hasIntegrity ? '' : 'integrity '}${hasCrossOrigin ? '' : 'crossorigin '}`.trim());
  }
}

// --- 4. Required document basics -------------------------------------------------
console.log('4. Document basics');
for (const page of HTML_FILES) {
  const html = read(page);
  const checks = {
    'lang="en"': /<html lang="en">/i.test(html),
    'charset': /<meta charset="UTF-8">/i.test(html),
    'viewport': /name="viewport"/i.test(html),
    'title': /<title>[^<]+<\/title>/i.test(html),
    'description': /name="description"/i.test(html),
    'favicon': /rel="icon"/i.test(html),
  };
  for (const [name, passed] of Object.entries(checks)) {
    if (passed) ok(`${page}: ${name}`);
    else fail(`${page}: missing ${name}`);
  }
}

// --- 5. Pure modules stay DOM-free ----------------------------------------------
console.log('5. Testable core modules');
for (const mod of ['js/core.js', 'js/data.js']) {
  const src = read(mod);
  const domRefs = ['document.', 'window.', 'sessionStorage', 'localStorage', 'navigator.'];
  const leaked = domRefs.filter((r) => src.includes(r));
  if (leaked.length === 0) ok(`${mod} is DOM-free`);
  else fail(`${mod} references DOM APIs: ${leaked.join(', ')}`);
}

// --- Result ----------------------------------------------------------------------
console.log('');
if (failures.length === 0) {
  console.log('All checks passed.');
  process.exit(0);
} else {
  console.error(`${failures.length} check(s) failed.`);
  process.exit(1);
}
