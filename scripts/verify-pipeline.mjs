#!/usr/bin/env node
// Checks every gate's evidence from docs/superpowers/specs/2026-09-12-abhishek-portfolio-design.md §3.
// Read-only, never prompts, never stops mid-run. One table at the end; exit 1 if anything fails.
// Run: node scripts/verify-pipeline.mjs [https://<project>.vercel.app]
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const has = (p) => existsSync(p);
const countFiles = (dir) => (has(dir) ? readdirSync(dir).filter((f) => !f.startsWith(".")).length : 0);

function anyFileMatches(dir, re) {
  if (!has(dir)) return false;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = `${dir}/${entry.name}`;
    if (entry.isDirectory()) {
      if (anyFileMatches(full, re)) return true;
    } else if (/\.(astro|ts|js|css)$/.test(entry.name) && re.test(readFileSync(full, "utf8"))) {
      return true;
    }
  }
  return false;
}

const GATES = {
  scope: () =>
    has("docs/inputs.md") && !readFileSync("docs/inputs.md", "utf8").includes("- [ ]")
      ? true
      : "docs/inputs.md missing or has unchecked boxes",
  art: () =>
    !has("assets/prompts/keyframes.md") ? "assets/prompts/keyframes.md missing"
      : countFiles("src/assets/keyframes") < 6 ? "src/assets/keyframes/ needs 6 approved stills"
      : true,
  assets: () => {
    if (!has("src/data/social.json")) return "src/data/social.json missing";
    try { JSON.parse(readFileSync("src/data/social.json", "utf8")); } catch { return "src/data/social.json is not valid JSON"; }
    if (!has("src/data/frames.json") || countFiles("public/frames") === 0) return "frames missing (run scripts/export-frames.mjs)";
    return true;
  },
  look: () => (has("src/styles/tokens.css") ? true : "src/styles/tokens.css missing"),
  motion: () => (anyFileMatches("src", /ScrollTrigger/) ? true : "no ScrollTrigger usage under src/"),
  ux: () =>
    anyFileMatches("src", /prefers-reduced-motion/) && countFiles("src/assets/keyframes") >= 6
      ? true
      : "missing prefers-reduced-motion handling or fallback stills",
  perf: () => (has("docs/qa/perf-report.md") ? true : "docs/qa/perf-report.md missing"),
  ship: () => (has("docs/qa/qa-checklist.md") ? true : "docs/qa/qa-checklist.md missing"),
};

function buildCheck() {
  if (!has("package.json")) return { status: "SKIP", note: "no package.json yet" };
  try {
    execSync("npm run build", { stdio: "pipe" });
    return { status: "PASS", note: "" };
  } catch (e) {
    const out = `${e.stdout ?? ""}${e.stderr ?? ""}`.trim().split("\n").slice(-15).join("\n");
    return { status: "FAIL", note: out || e.message };
  }
}

async function liveCheck(url) {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(15000) });
    return { status: r.ok ? "PASS" : "FAIL", note: `HTTP ${r.status}` };
  } catch (e) {
    return { status: "FAIL", note: String(e) };
  }
}

const rows = Object.entries(GATES).map(([gate, check]) => {
  const res = check();
  return { gate, status: res === true ? "PASS" : "FAIL", note: res === true ? "" : res };
});
rows.push({ gate: "build", ...buildCheck() });
if (process.argv[2]) rows.push({ gate: "live", ...(await liveCheck(process.argv[2])) });

for (const r of rows) console.log(`${r.gate.padEnd(7)} ${r.status.padEnd(5)} ${r.note}`);
const failed = rows.filter((r) => r.status === "FAIL").length;
console.log(failed ? `\n${failed} failing.` : "\nAll green.");
process.exit(failed ? 1 : 0);
