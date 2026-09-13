# ADR-0009: Daily refresh extends the existing scraper; humans curate tournaments and accreditation

## Status
Accepted — 2026-09-13. Supersedes the "Later (deferred phase)" bullet of ADR-0003. The rest of ADR-0003 stands.

## Context
- A draft plan proposed a second pipeline (`pipeline/`, per-account CSVs, hot/cold tiering, caption-regex accreditation, a new 00:00 cron).
- The repo already has `scraper/scrape.py` and a daily `.github/workflows/update-stats.yml` (03:00 UTC: scrape → `npm test` → `npm run build` → commit).
- Its first scheduled run (Actions run 34746892885, 2026-09-13) got bot-check pages from the runner IP and committed an empty scrape. Commit `3ed9a7d` restored the data and added `check_not_wiped`.
- `Pavilion.astro` hardcodes 25 tournament reels with hand-typed, rounded counts. 22 of them are not in `social.json`.

## Decision
1. **Runner:** keep the GitHub-hosted runner. `check_not_wiped` refuses empty results, and the Scoreboard's "as of" date covers stale numbers. If YouTube blocks persistently, switch YouTube to the Data API (ADR-0003's upgrade path).
2. **Curation gate kept:** the scraper refreshes counts only. Newly found posts are listed in the workflow's job summary for a human to file, never auto-published.
3. **Tournament and accreditation are human-set** in `src/data/innings.json`, never inferred from captions.
4. **Storage:** `innings.json` (curated, hand-edited) plus the existing `social.json`. No CSVs, no archive, no compile step.
5. **No hot/cold tiering:** listing pages return counts for every item in one request, so there is no per-item cost to save.
6. **Consent first:** the scheduled refresh stays off until Abhishek agrees to daily scraping and thumbnail republishing.

## Alternatives Considered
- **Per-account CSVs compiled to JSON:** two representations of one dataset, missing fields the schema requires, and no home for profile counts.
- **Hot/cold tiering at 30 days:** would freeze the all-time top content the site headlines.
- **Caption-regex accreditation:** publishes a credential claim on a guess.
- **Residential proxy or local Mac cron:** extra cost or a machine that must be awake. Revisit if the guard refuses most runs.
- **Second workflow at 00:00:** races the existing one on `social.json`.

## Consequences
- Adding a tournament or filing a new reel is a hand edit to `innings.json`.
- On a blocked run, counts stay at their last good values and no commit is made.
- `[skip ci]` is not used. Vercel ignores it, and `GITHUB_TOKEN` pushes don't trigger other workflows.
- Skipped until needed: comment counts, cross-post groups across different ids, async fetching.
