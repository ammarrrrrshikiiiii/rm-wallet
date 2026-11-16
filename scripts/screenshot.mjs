// ===== Generate README screenshots with Playwright =====
// Prereq (once): `bunx playwright install chromium`
// Usage: `bun scripts/screenshot.mjs`
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT || 8082);
const BASE = `http://localhost:${PORT}/`;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

mkdirSync(resolve(ROOT, 'docs'), { recursive: true });

const server = spawn(process.execPath, ['serve.js'], {
  cwd: ROOT,
  env: { ...process.env, PORT: String(PORT) },
  stdio: 'ignore',
});

async function waitForServer() {
  for (let i = 0; i < 50; i++) {
    try {
      const r = await fetch(BASE);
      if (r.ok) return;
    } catch {}
    await wait(200);
  }
  throw new Error('Dev server did not start in time.');
}

const browser = await chromium.launch();
try {
  await waitForServer();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });

  // Login screen.
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: resolve(ROOT, 'docs/screenshot-login.png') });

  // Dashboard (after the demo login).
  await page.click('button#fillDemo');
  await page.click('button#go');
  await page.waitForURL('**/dashboard.html');
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  await wait(900); // let Chart.js animations settle
  await page.screenshot({ path: resolve(ROOT, 'docs/screenshot-dashboard.png') });

  console.log('Wrote docs/screenshot-login.png and docs/screenshot-dashboard.png');
} finally {
  await browser.close();
  server.kill();
}
