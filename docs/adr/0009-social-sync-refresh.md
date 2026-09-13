# ADR-0009: Daily refresh extends the existing scraper; humans curate tournaments and accreditation

## Status
Accepted — 2026-09-13. Supersedes the "Later (deferred phase)" bullet of ADR-0003. The rest of ADR-0003 stands.

## Context
- A draft plan proposed a second pipeline (`pipeline/`, per-account CSVs, hot/cold tiering, caption-regex accreditation, a new 00:00 cron).
- The repo already has `scraper/scrape.py` and a daily `.github/workflows/update-stats.yml` (03:00 UTC: scrape → `npm test` → `npm run build` → commit).
- Its first scheduled run (Actions run 34746892885, 2026-09-13) got bot-check pages from the runner IP and committed an empty scrape. Commit `3ed9a7d` restored the data and added `check_not_wiped`.
- `Pavilion.astro` hardcodes 25 tournament reels with hand-typed, rounded counts. 22 of them are not in `social.json`.

## Decision
1. **Runner:** ~~keep the GitHub-hosted runner~~ — **reversed 2026-09-14, see Amendment below.** The scrape runs on a self-hosted runner on the owner's Mac.
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

## Amendment — 2026-09-14: self-hosted runner, YouTube Data API

Decision 1 above was wrong. GitHub-hosted runners cannot reach Instagram at all, proven across four runs:

| Attempt | Result |
|---------|--------|
| Plain `Fetcher` (stealthy headers, Chrome impersonation) | Redirected to `/accounts/login/`, which itself returns **429** — a page requiring no authentication refusing an unauthenticated visitor |
| `StealthyFetcher` (real headless Chromium, `scrapling install`) | `net::ERR_HTTP_RESPONSE_CODE_FAILURE` — rejected before any page renders |
| Backed-off retries honoring `Retry-After` | Every attempt 429; retrying never clears it |
| Same code, owner's home IP | **Works.** All Instagram pages serve normally |

A login page rate-limiting a client that never logged in is an IP-reputation block dressed as a rate limit. No fetcher, header, or retry strategy changes an origin server's decision about an IP range.

**Revised decisions:**
1. **Runner:** self-hosted, on the owner's Mac (`runs-on: self-hosted`), daily at 16:30 UTC / 22:00 IST. No `setup-python`/`setup-node` — they target throwaway hosted runners and fail writing to `/Users/runner`; the machine already has Python and Node. Python deps live in a venv outside the workspace, since `checkout` wipes untracked files each run.
2. **YouTube:** the Data API (`YT_API_KEY` secret) replaces watch-page scraping. The key travels in a header, never a URL. Kept even on the self-hosted runner: it's exact, cheap (1 quota unit per channel) and immune to layout changes.
3. **Retained as defence in depth, no longer load-bearing:** the 429 backoff and the `StealthyFetcher` fallback.

**Open — decision 6 (consent) is unresolved.** That decision says the scheduled refresh stays off until Abhishek agrees to daily scraping and thumbnail republishing. The schedule is now live and was enabled at the owner's direction; his agreement has not been confirmed in this repo. Either confirm it and strike this note, or disable the schedule (`gh workflow disable update-stats.yml`) until it is.

**Accepted trade-offs:** the refresh only runs when the Mac is awake; GitHub cancels self-hosted jobs queued beyond 24 hours, so a missed day is lost rather than deferred. GitHub also removes runners offline for more than 14 days, needing a one-command re-register. The repo is public, which GitHub advises against for self-hosted runners — accepted knowingly by the owner, with fork-PR workflow approval left enabled as the mitigation.

## Consequences
- Adding a tournament or filing a new reel is a hand edit to `innings.json`.
- On a blocked run, counts stay at their last good values and no commit is made.
- `[skip ci]` is not used. Vercel ignores it, and `GITHUB_TOKEN` pushes don't trigger other workflows.
- Skipped until needed: comment counts, cross-post groups across different ids, async fetching.
