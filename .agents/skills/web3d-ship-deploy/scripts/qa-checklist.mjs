#!/usr/bin/env node
/**
 * qa-checklist — generate .web3d/qa-checklist.md and run the automated subset
 * of the pre-launch checks it contains.
 *
 *   node qa-checklist.mjs --init                # write the checklist file
 *   node qa-checklist.mjs --scan                # grep for dev tooling left in src/
 *   node qa-checklist.mjs --scan --src app/     # custom source dir
 *
 * Manual items still need a human. This catches the ones that don't.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const arg = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i !== -1 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : d;
};
const root = process.cwd();
const here = dirname(fileURLToPath(import.meta.url));

// ── --init ────────────────────────────────────────────────────────────────
if (args.includes('--init')) {
  const src = join(here, '..', 'references', 'qa-checklist.md');
  const dest = join(root, '.web3d', 'qa-checklist.md');
  if (existsSync(dest) && !args.includes('--force')) {
    console.error(`${dest} exists. Use --force to overwrite.`);
    process.exit(1);
  }
  if (!existsSync(src)) {
    console.error(`Template not found at ${src}`);
    process.exit(1);
  }
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, readFileSync(src, 'utf8'));
  console.log(`Created ${relative(root, dest)}\n\nWork through it, then run --scan before shipping.`);
  process.exit(0);
}

// ── --scan ────────────────────────────────────────────────────────────────
const srcDir = join(root, arg('src', 'src'));
if (!existsSync(srcDir)) {
  console.error(`Source dir not found: ${srcDir}\nPass --src <dir>.`);
  process.exit(1);
}

const RULES = [
  { re: /from ['"]r3f-perf['"]|<Perf\b/, label: 'r3f-perf overlay', severity: 'error' },
  { re: /<Stats\b|from ['"].*drei.*['"].*\bStats\b/, label: '<Stats> panel', severity: 'error' },
  { re: /from ['"]leva['"]|useControls\(/, label: 'leva debug controls', severity: 'error' },
  { re: /<axesHelper|<gridHelper|<Grid\b/, label: 'scene helper (axes/grid)', severity: 'error' },
  { re: /<OrbitControls(?![^>]*minPolarAngle)/, label: 'unconstrained <OrbitControls>', severity: 'error' },
  { re: /console\.(log|debug|table)\(/, label: 'console statement', severity: 'warn' },
  { re: /new THREE\.\w+\([^)]*\)[^;]*;?\s*$/m, label: null, severity: null }, // placeholder, skipped
  { re: /devicePixelRatio(?!\s*[,)])(?![^\n]*Math\.min)/, label: 'uncapped devicePixelRatio', severity: 'warn' },
  { re: /dpr=\{?\[?\s*window\.devicePixelRatio/, label: 'uncapped dpr on Canvas', severity: 'error' },
  { re: /<Environment[^>]*\bbackground\b/, label: '<Environment background> — verify intentional', severity: 'warn' },
  { re: /frameloop=["']demand["']/, label: 'frameloop="demand" — verify nothing animates continuously', severity: 'warn' },
  { re: /\.lerp\(/, label: 'raw .lerp() — is it frame-rate independent?', severity: 'warn' },
].filter((r) => r.label);

const files = [];
const walk = (d) => {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) {
      if (['node_modules', '.next', 'dist', '.git'].includes(e.name)) continue;
      walk(p);
    } else if (/\.(t|j)sx?$/.test(e.name)) files.push(p);
  }
};
walk(srcDir);

const hits = [];
for (const f of files) {
  const lines = readFileSync(f, 'utf8').split('\n');
  lines.forEach((line, i) => {
    if (/^\s*(\/\/|\*|\/\*)/.test(line)) return;          // skip comments
    for (const r of RULES) {
      if (r.re.test(line)) {
        hits.push({ file: relative(root, f), line: i + 1, label: r.label, severity: r.severity, text: line.trim().slice(0, 90) });
      }
    }
  });
}

const errors = hits.filter((h) => h.severity === 'error');
const warns = hits.filter((h) => h.severity === 'warn');

console.log(`\n  scanned ${files.length} files in ${relative(root, srcDir) || '.'}\n`);

const print = (list, icon) => {
  const byLabel = new Map();
  for (const h of list) {
    if (!byLabel.has(h.label)) byLabel.set(h.label, []);
    byLabel.get(h.label).push(h);
  }
  for (const [label, items] of byLabel) {
    console.log(`  ${icon} ${label}  (${items.length})`);
    for (const h of items.slice(0, 6)) console.log(`      ${h.file}:${h.line}  ${h.text}`);
    if (items.length > 6) console.log(`      … and ${items.length - 6} more`);
    console.log('');
  }
};

if (errors.length) { console.log('  MUST FIX BEFORE SHIPPING\n'); print(errors, '✗'); }
if (warns.length) { console.log('  REVIEW\n'); print(warns, '!'); }
if (!hits.length) console.log('  Clean — no dev tooling or common footguns found.\n');

// bundle sanity
const pkgPath = join(root, 'package.json');
if (existsSync(pkgPath)) {
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  const devOnly = ['r3f-perf', 'leva'];
  const leaked = devOnly.filter((d) => pkg.dependencies?.[d]);
  if (leaked.length) {
    console.log(`  ✗ dev-only packages in "dependencies": ${leaked.join(', ')}`);
    console.log(`      move to devDependencies\n`);
    errors.push({});
  }
}

// gate evidence
const perf = join(root, '.web3d', 'perf-report.json');
if (!existsSync(perf)) {
  console.log('  ! no .web3d/perf-report.json — run perf-audit.mjs before closing the ship gate\n');
} else {
  const r = JSON.parse(readFileSync(perf, 'utf8'));
  console.log(`  perf report: ${r.pass ? 'PASS' : 'FAIL'}  (${r.profile}, p50 ${r.fps?.p50}fps, LCP ${r.lcpMs}ms)\n`);
  if (!r.pass) errors.push({});
}

process.exit(errors.length ? 1 : 0);
