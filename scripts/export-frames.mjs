#!/usr/bin/env node
// Clips in assets/clips/<id>.mp4 (or --placeholder test patterns)
//   -> public/frames/<id>/<tier>/NNN.avif + src/data/frames.json
// Run: node scripts/export-frames.mjs [--placeholder]
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';

const TRANSITIONS = ['01-tunnel-pitch', '02-pitch-scoreboard', '03-scoreboard-stands', '04-stands-pavilion', '05-pavilion-boundary'];
// ponytail: fixed budgets from ADR-0001; these are the calibration knobs Task 22 tunes on a real phone
const TIERS = {
  desktop: { frames: 60, width: 1600, quality: 50 },
  mobile: { frames: 30, width: 720, quality: 45 },
};
const placeholder = process.argv.includes('--placeholder');

function placeholderFrame(id, i, count) {
  const hue = TRANSITIONS.indexOf(id) * 60;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080">
    <rect width="100%" height="100%" fill="hsl(${hue}, 45%, ${15 + Math.round((i / count) * 35)}%)"/>
    <text x="50%" y="50%" font-size="120" font-family="sans-serif" fill="#fff" text-anchor="middle" dominant-baseline="middle">${id} ${i + 1}/${count}</text>
  </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

function clipFrames(id, count) {
  const clip = join('assets/clips', `${id}.mp4`);
  if (!existsSync(clip)) throw new Error(`Missing ${clip} — export it from Flow first (Task 12)`);
  const duration = Number(
    execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', clip]).toString(),
  );
  const dir = mkdtempSync(join(tmpdir(), 'frames-'));
  execFileSync('ffmpeg', ['-v', 'error', '-i', clip, '-an', '-vf', `fps=${count / duration}`, '-frames:v', String(count), '-q:v', '2', join(dir, '%03d.jpg')]);
  const buffers = readdirSync(dir).sort().map((f) => readFileSync(join(dir, f)));
  rmSync(dir, { recursive: true, force: true });
  return buffers;
}

const manifest = { transitions: [] };
for (const id of TRANSITIONS) {
  const count = TIERS.desktop.frames;
  const sources = placeholder
    ? await Promise.all(Array.from({ length: count }, (_, i) => placeholderFrame(id, i, count)))
    : clipFrames(id, count);
  const entry = { id };
  for (const [tier, { frames, width, quality }] of Object.entries(TIERS)) {
    const out = join('public/frames', id, tier);
    rmSync(out, { recursive: true, force: true });
    mkdirSync(out, { recursive: true });
    const n = Math.min(frames, sources.length);
    for (let i = 0; i < n; i++) {
      // fewer frames than sources: spread picks evenly so the move keeps its full length
      const src = sources[n === sources.length ? i : Math.round((i * (sources.length - 1)) / (n - 1))];
      await sharp(src).resize({ width }).avif({ quality }).toFile(join(out, `${String(i + 1).padStart(3, '0')}.avif`));
    }
    entry[tier] = n;
  }
  manifest.transitions.push(entry);
  console.log(`${id}: desktop ${entry.desktop}, mobile ${entry.mobile}`);
}

mkdirSync('src/data', { recursive: true });
writeFileSync('src/data/frames.json', `${JSON.stringify(manifest, null, 2)}\n`);

if (placeholder) {
  mkdirSync('src/assets', { recursive: true });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="2560" height="1440"><rect width="100%" height="100%" fill="#0E1F17"/><text x="50%" y="50%" font-size="140" font-family="sans-serif" fill="#F4F1E6" text-anchor="middle" dominant-baseline="middle">placeholder still</text></svg>`;
  await sharp(Buffer.from(svg)).jpeg({ quality: 80 }).toFile('src/assets/placeholder-still.jpg');
}
