#!/usr/bin/env node
/**
 * perf-audit — headless frame-time and renderer.info capture against a running
 * 3D site, scrolled top to bottom on a throttled mid-tier mobile profile.
 *
 *   npm i -D playwright && npx playwright install chromium
 *   node perf-audit.mjs --url http://localhost:3000
 *   node perf-audit.mjs --url https://staging.example.com --desktop
 *
 * Writes .web3d/perf-report.json — required evidence for the perf gate.
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const arg = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i !== -1 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : d;
};
const url = arg('url', 'http://localhost:3000');
const desktop = args.includes('--desktop');
const scrollMs = Number(arg('scroll-ms', 12000));

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error('playwright not installed.\n  npm i -D playwright && npx playwright install chromium');
  process.exit(1);
}

// Budgets from the manifest
let budgets = { drawCalls: 120, fpsMobile: 30 };
const mPath = join(process.cwd(), '.web3d', 'build.json');
if (existsSync(mPath)) {
  try { budgets = { ...budgets, ...JSON.parse(readFileSync(mPath, 'utf8')).budgets }; } catch {}
}

const profile = desktop
  ? { name: 'desktop', viewport: { width: 1440, height: 900 }, dpr: 2, cpu: 1, net: null }
  : { name: 'mobile-mid', viewport: { width: 390, height: 844 }, dpr: 2, cpu: 4,
      net: { downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8, latency: 150 } };

console.log(`\n  perf-audit  ${url}`);
console.log(`  profile     ${profile.name} (CPU ${profile.cpu}× throttle)\n`);

const browser = await chromium.launch({ args: ['--enable-gpu', '--ignore-gpu-blocklist'] });
const context = await browser.newContext({
  viewport: profile.viewport,
  deviceScaleFactor: profile.dpr,
  isMobile: !desktop,
  hasTouch: !desktop,
});
const page = await context.newPage();

const cdp = await context.newCDPSession(page);
await cdp.send('Emulation.setCPUThrottlingRate', { rate: profile.cpu });
if (profile.net) {
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', { offline: false, ...profile.net });
}

// Instrument frame times before any page script runs
await page.addInitScript(() => {
  window.__web3d = { frames: [], start: 0 };
  let last = 0;
  const tick = (t) => {
    if (last) window.__web3d.frames.push(t - last);
    last = t;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame((t) => { window.__web3d.start = t; last = t; requestAnimationFrame(tick); });
});

const t0 = Date.now();
await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
const loadMs = Date.now() - t0;

// Web vitals
const vitals = await page.evaluate(() => new Promise((resolve) => {
  const out = { lcp: null, cls: 0 };
  try {
    new PerformanceObserver((l) => {
      const e = l.getEntries();
      out.lcp = e[e.length - 1]?.startTime ?? null;
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) if (!e.hadRecentInput) out.cls += e.value;
    }).observe({ type: 'layout-shift', buffered: true });
  } catch {}
  setTimeout(() => resolve(out), 2500);
}));

// Let the scene settle, then discard warm-up frames
await page.waitForTimeout(2500);
await page.evaluate(() => { window.__web3d.frames.length = 0; });

// Scroll the full page at a steady rate
await page.evaluate(async (ms) => {
  const h = document.documentElement.scrollHeight - window.innerHeight;
  const start = performance.now();
  await new Promise((resolve) => {
    const step = () => {
      const p = Math.min(1, (performance.now() - start) / ms);
      window.scrollTo(0, h * p);
      if (p < 1) requestAnimationFrame(step);
      else resolve();
    };
    step();
  });
}, scrollMs);
await page.waitForTimeout(500);

const frames = await page.evaluate(() => window.__web3d.frames);

// renderer.info — exposed by the app if it opts in, otherwise skipped
const info = await page.evaluate(() => {
  const gl = window.__r3f?.root?.getState?.()?.gl ?? window.__web3dRenderer;
  if (!gl?.info) return null;
  return {
    calls: gl.info.render.calls,
    triangles: gl.info.render.triangles,
    programs: gl.info.programs?.length ?? 0,
    geometries: gl.info.memory.geometries,
    textures: gl.info.memory.textures,
  };
});

await browser.close();

// ── analyse ────────────────────────────────────────────────────────────────
const sorted = [...frames].sort((a, b) => a - b);
const pct = (p) => sorted[Math.floor(sorted.length * p)] ?? 0;
const mean = frames.reduce((a, b) => a + b, 0) / (frames.length || 1);

const report = {
  url,
  profile: profile.name,
  at: new Date().toISOString(),
  loadMs,
  lcpMs: vitals.lcp ? Math.round(vitals.lcp) : null,
  cls: +vitals.cls.toFixed(3),
  frames: frames.length,
  fps: { mean: +(1000 / mean).toFixed(1), p50: +(1000 / pct(0.5)).toFixed(1), p95: +(1000 / pct(0.95)).toFixed(1) },
  frameMs: { mean: +mean.toFixed(2), p50: +pct(0.5).toFixed(2), p95: +pct(0.95).toFixed(2), max: +Math.max(...frames, 0).toFixed(2) },
  longFrames: frames.filter((f) => f > 100).length,
  renderer: info,
  budgets,
};

const fails = [];
if (report.fps.p50 < budgets.fpsMobile && !desktop) fails.push(`p50 fps ${report.fps.p50} < ${budgets.fpsMobile}`);
if (report.longFrames > 0) fails.push(`${report.longFrames} frame(s) over 100ms`);
if (report.lcpMs && report.lcpMs > 2500) fails.push(`LCP ${report.lcpMs}ms > 2500ms`);
if (report.cls > 0.1) fails.push(`CLS ${report.cls} > 0.1`);
if (info && info.calls > budgets.drawCalls) fails.push(`draw calls ${info.calls} > ${budgets.drawCalls}`);
report.pass = fails.length === 0;
report.failures = fails;

mkdirSync(join(process.cwd(), '.web3d'), { recursive: true });
writeFileSync(join(process.cwd(), '.web3d', 'perf-report.json'), JSON.stringify(report, null, 2) + '\n');

console.log(`  load        ${loadMs}ms`);
console.log(`  LCP         ${report.lcpMs ?? 'n/a'}ms      CLS ${report.cls}`);
console.log(`  fps         mean ${report.fps.mean}  p50 ${report.fps.p50}  p95(worst) ${report.fps.p95}`);
console.log(`  frame ms    p50 ${report.frameMs.p50}  p95 ${report.frameMs.p95}  max ${report.frameMs.max}`);
console.log(`  long frames ${report.longFrames}`);
if (info) console.log(`  renderer    ${info.calls} calls · ${info.triangles.toLocaleString()} tris · ${info.programs} programs`);
else console.log(`  renderer    (expose window.__web3dRenderer = gl in dev to capture renderer.info)`);
console.log('');
if (fails.length) {
  console.log('  FAIL:');
  fails.forEach((f) => console.log(`    - ${f}`));
} else {
  console.log('  PASS — all budgets met.');
}
console.log(`\n  written to .web3d/perf-report.json\n`);

process.exit(fails.length ? 1 : 0);
