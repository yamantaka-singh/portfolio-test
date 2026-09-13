# Social Sync v2 — revised plan

**Status:** Grill round 1 decided on 2026-09-13 (§4) and recorded in ADR-0009. Tasks 0–3 are done on branch `social-sync-v2`. `update-stats.yml` was disabled on 2026-09-13. Task 4 is blocked on consent (Q6). Task 2's live local run is deferred to the same consent.
**Replaces:** the pasted "Automated Multi-Account Content Pipeline (Scrapling + Hot/Cold CSVs + GitHub Actions)" draft.
**Governing docs:** ADR-0003 (data pipeline), ADR-0005 (hosting), ADR-0007 (stack), ADR-0008 (task-observer), and the Global Constraints in `2026-09-12-abhishek-portfolio.md`.

---

## 1. What was wrong with the original draft

Each finding was checked against the repo on 2026-09-13.

| # | Draft said | Reality in repo | Severity |
|---|-----------|-----------------|----------|
| 1 | New `pipeline/sync_accounts.py` | `scraper/scrape.py` and `scraper/parse.py` (218-line test file) already scrape all 4 accounts, and the parsers are live-verified | Blocker: duplicate system |
| 2 | New `.github/workflows/daily-social-sync.yml` at 00:00 | `.github/workflows/update-stats.yml` already runs daily at 03:00: scrape → `npm test` → `npm run build` → commit | Blocker: two crons would race on `social.json` |
| 3 | "Pure HTTP stealth fetchers" from GitHub Actions will work | Commit `3ed9a7d`: a CI run got bot-check pages, committed `videos=0 posts=0`, and wiped production data. ADR-0003 already warned that runner IPs get blocked | Blocker: the core assumption is already disproven |
| 4 | Scraper auto-tags tournament and **accreditation** from captions | ADR-0003 says "the scraper never picks". Accreditation is a factual credential claim; commit `9910bce` already had to remove fabricated stats. A regex guess shown as "Accredited" is a false public claim | Blocker: breaks a precedence-2 ADR and risks trust |
| 5 | CSV schema compiles into `social.json` | The CSV has no `title`, `caption`, `thumb`, `shortcode`, `channel` or `isReel`, which the zod schema requires. It has no home for `profiles` (followers), which Hero and Scoreboard need. And it adds `comments`, which the schema doesn't have. The compile step cannot produce valid output | Blocker |
| 6 | Thumbnails aren't mentioned | IG image URLs expire within days (ADR-0003). Every newly discovered post needs `src/assets/social/ig-<id>.jpg` or `thumb()` returns undefined | Blocker |
| 7 | Hot/cold tiering to stop "scraper bloat" | There's no bloat. IG `/reels/` gives `play_count` for every reel in **one** request, and YT listing pages give views for every video in one request each. The site headlines are all-time top content (an 18M Short, 800K reels), so archiving at 30 days freezes exactly the numbers that matter | Remove (YAGNI) |
| 8 | Reels/tournaments seeded from `social.json` + `Pavilion.astro` | 22 of 25 Pavilion reels are **not** in `social.json`. Pavilion hardcodes rounded views (`540000`, `800000`) and `?stkn=` URLs. **This is the real problem worth solving:** curated tournament reels with stale, hand-typed metrics | Reframe |
| 9 | Commit with `[skip ci]`, "Vercel deploys" | Vercel doesn't honor `[skip ci]`, so it deploys anyway. Commits pushed with `GITHUB_TOKEN` already don't trigger other workflows. The tag does nothing and suggests an intent it doesn't have | Drop |
| 10 | "Async concurrent, under 15 s benchmark" | The existing code uses a deliberate 2 s politeness delay, and concurrency from a datacenter IP makes blocks more likely. A daily cron has no latency requirement | Drop |
| 11 | `pandas` dependency | About 50 rows. Stdlib `json` (or `csv`) is enough | Drop |
| 12 | Python "validates against `social-schema.js`" | Different language. The existing workflow already validates with `npm test && npm run build` before committing | Already done |
| 13 | Closed tournament enum (`IPL 2025 … DPL 2026`) | Pavilion already has IPL 2026 and a My11Circle entry. A closed enum breaks every season | Use a free string in curated data |
| 14 | `crosspost_group_id` metric aggregation | Collabs share one shortcode and are already deduped (`scrape.py`). Re-uploads under a different id can't be detected automatically, so they'd need manual grouping for a case nobody has seen yet | Skip until a real case |
| 15 | Hot/cold needs `published_at` | The IG reels-tab parser doesn't capture `taken_at`. The tiering key doesn't exist in the data | Moot once #7 is dropped |
| 16 | Verification lists Hero/Pavilion/Scoreboard/Stands | Misses `Pitch.astro` and `index.astro` (JSON-LD), which also read `social` | Fix the list |
| 17 | No skills per task, no gate | AGENTS.md requires task-observer, per-skill observation greps and human gates | Added below |

## 2. Revised design (lazy version)

```
src/data/innings.json   ← hand-curated: tournaments, accredited flag, reel ids (human only)
        │
scraper/scrape.py  (existing, extended)
  ├─ existing: profiles, top YT videos, top IG reels → social.json
  └─ NEW: refresh views/likes for every id in innings.json
          IG: look up in the /reels/ pool already fetched (0 extra requests);
              missing → per-post page for likes, keep last known views
          YT: watch page per id (existing parser)
  └─ guard (extended): never overwrite a known count with null/0
        │
src/data/social.json  (schema gains optional `curated` metrics map)
        │
update-stats.yml (existing) → npm test → npm run build → commit → Vercel deploys
```

- **Storage:** one curated JSON file plus the existing `social.json`. No CSVs, no archive file, no compile step.
- **Human curation gate kept:** the scraper refreshes numbers and never writes tournament, accreditation or featured.
- **New uploads:** already land in `social.json` with `featured: false`. The workflow lists uncurated new reel ids in the job summary so a human can file them into `innings.json`.
- **URL normalization:** reuse `parse.parse_instagram_post_url` (it already ignores `?stkn=`/`?igsh=`). Pavilion renders clean `https://www.instagram.com/reel/<id>/` URLs from ids.
- **Skipped:** tiering, CSV, pandas, crosspost groups, comments, async, a second workflow. Add any of them when a measured need shows up.

## 3. Tasks

Every task: invoke `task-observer` and run its Session Start Protocol first. Before applying any skill below, run
`grep -l "skill:.*<skill>" /Users/kaalu/projects/abhishek-portfolio/skill-observations/observation-log/*.md`
and apply the OPEN hits. End each task with the one-line observation summary.

### Task 0 — Grill round 1 + ADR
- **Skills:** `grilling`, `architecture-decision-records`, `ponytail`
- Resolve every question in §4 with the user.
- Write `docs/adr/0009-social-sync-refresh.md`. It supersedes ADR-0003's "Later (deferred phase)" bullet and records the runner-IP decision, the kept curation gate and what was dropped.
- **Done when:** the user has answered §4 and the ADR is committed (`docs:`).

### Task 1 — Move Pavilion's curated data into `src/data/innings.json`
- **Skills:** `astro`, `zod-validation-expert`, `test-driven-development`, `javascript-testing-patterns`, `ponytail`
- Failing test first in `src/lib/social-schema.test.js`: `InningsSchema` rejects a missing `accredited` and a malformed reel id.
- `innings.json`: `[{ dates, title, accredited, desc, reels: [{ id, platform, caption }] }]`. Metrics are **not** stored here.
- `Pavilion.astro` imports it via `src/lib/social.js` and derives the URL and thumb from the id. Metrics come from `social.json` and fall back to hidden when null (no hardcoded numbers).
- **Done when:** `npm test` and `npm run build` pass, and the Pavilion preview matches the current live page.

### Task 2 — Scraper refreshes curated ids
- **Skills:** `scrapling-official`, `python-testing-patterns`, `test-driven-development`, `ponytail`
- Add parser tests in `scraper/test_parse.py` with saved HTML fixtures, not live network.
- `scrape.py` reads `innings.json` ids, refreshes as in §2, and writes `social.json.curated[id] = { views, likes }`.
- Extend `check_not_wiped` to cover curated counts: a null or lower-than-plausible drop from a bot page keeps the previous value.
- **Done when:** `pytest scraper` passes and a local run updates the curated counts without touching tournament fields.

### Task 3 — Schema + consumers
- **Skills:** `zod-validation-expert`, `astro`, `javascript-testing-patterns`
- `SocialSchema` gets an optional `curated: record(id → { views: count, likes: count })`, so existing JSON stays valid.
- **Done when:** `npm test` passes and Hero, Pitch, Scoreboard, Stands, Pavilion and `index.astro` all build.

### Task 4 — Workflow hardening (edit `update-stats.yml`, no new file) — BLOCKED until Abhishek's consent (§4 Q6)
- **Skills:** `deploy-to-vercel`, `verification-before-completion`, `ponytail`. No GitHub Actions skill is installed: run `npx -y skills@1.5.26 find github actions` and log the best match as a `proposes_skill` observation. Don't install it.
- Add `concurrency: social-sync`, a job-summary list of uncurated new reel ids, and `innings.json` untouched by the bot. Apply the §4 Q1 answer (runner, proxy secret, or local cron).
- **Done when:** a `workflow_dispatch` run on the real runner either commits a refresh or is refused by the guard with a clear log. Both count as correct.

### Task 5 — Verify + review + gate
- **Skills:** `verification-before-completion`, `webapp-testing`, `ponytail-review`, `requesting-code-review`, then task-observer's *Gate review*
- Evidence: `npm test`, `pytest scraper`, `npm run build`, the Actions run URL, and a Vercel preview screenshot of Pavilion with live counts.
- **Human gate:** the user approves the preview before merge to `main`.

## 4. Grill round 1 — decided 2026-09-13 (ADR-0009)

1. **Runner:** GitHub-hosted runner + the existing guard. Switch YouTube to the Data API only if blocks persist.
2. **Curation gate:** kept. New posts go to the job summary, not onto the site.
3. **Tournament + accreditation:** set by hand in `innings.json`.
4. **Storage:** one curated JSON file. No CSVs.
5. **Hot/cold tiering:** dropped.
6. **Consent:** required before the scheduled refresh runs. `update-stats.yml` is **still active** (its one scheduled run so far was the wipe in `3ed9a7d`), so the user decides whether to disable it until consent arrives.
