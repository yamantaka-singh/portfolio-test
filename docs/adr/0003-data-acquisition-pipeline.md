# ADR-0003: Scrapling seed (public data), self-hosted thumbnails, GitHub Actions refresh later

## Status
Accepted — 2026-09-12

## Context
The Pitch, Scoreboard and Stands sections need real content and numbers from:
- Instagram `@abhishekpandey_26`, `@spinandswing26`
- YouTube `@spinandswing26`, `@abhishekunseen26`
- LinkedIn `abhishek-pandey-26sep03`

Decisions from grilling:
- Abhishek has **not yet been asked** for account access, so this plan
  assumes public data only.
- The user chose **Scrapling for all three platforms** over the official
  YouTube Data API.
- Instagram image URLs expire within days.
- Live embeds cost roughly 0.5–1MB of JS each.

## Decision
- **One-time seed**: a Python script (`scraper/scrape.py`, Scrapling 0.4.x,
  `StealthyFetcher`, logged out, no credentials ever) writes
  `src/data/social.json` and downloads thumbnails into `src/assets/social/`.
  Astro's `<Image>` converts them to AVIF/WebP at build time.
- **Contract**: `social.json` is loaded as an Astro content collection with a
  zod schema, so a malformed scrape fails the build instead of shipping
  broken sections. Every count is nullable because public scraping may not
  return it.
  ```json
  {
    "scrapedAt": "2026-09-12T00:00:00Z",
    "profiles": [{ "platform": "instagram|youtube|linkedin", "handle": "", "url": "",
                   "followers": null, "postCount": null, "bio": null }],
    "videos":   [{ "platform": "youtube", "id": "", "title": "", "views": null,
                   "publishedAt": "", "thumb": "", "featured": false }],
    "posts":    [{ "platform": "instagram", "shortcode": "", "caption": "", "likes": null,
                   "isReel": false, "thumb": "", "featured": false }]
  }
  ```
- **Human curation gate**: the user sets `featured: true` on the videos and
  posts that appear on the site. The scraper never picks.
- **Tap-to-play facades**: cards show the self-hosted thumbnail. Tapping
  swaps in the real player (`youtube-nocookie.com` iframe / Instagram embed)
  only at that moment.
- **LinkedIn is best-effort**: public profiles are mostly behind a login
  wall. If the scrape returns nothing usable, the Boundary Rope section uses
  a plain LinkedIn link, and the phase does not block.
- **Later (deferred phase)**: a GitHub Actions daily cron runs the same
  script, commits changed JSON and thumbnails, and Vercel redeploys. No
  server, no database.

## Alternatives Considered
- **YouTube Data API v3 for YouTube**: recommended during grilling (official,
  stable) but declined by the user in favour of one tool. Stays the first
  fix if YouTube scraping breaks.
- **Instagram Graph API / YouTube owner analytics**: needs Abhishek's account
  access, which hasn't been asked. Upgrade path once he grants it; it is also
  the only way to get audience demographics for a real media kit.
- **Live embeds everywhere**: rejected on weight.
- **Supabase + Vercel cron**: rejected. A database is only justified by an
  admin dashboard or many editors, and neither is planned.

## Consequences
- **Accepted risk**: YouTube and Instagram layout changes can break the
  scraper at any time.
- **Consent**: get Abhishek's go-ahead before scraping his accounts and
  republishing his thumbnails.
- **Stale stats**: numbers go stale between seed and the deferred cron; the
  Scoreboard shows `scrapedAt` as "as of" so stale numbers aren't misleading.
- **Media-kit limits**: public counts only, no reach or demographics. The
  Scoreboard is a lighter media kit until official API access exists.
- **Blocked runner IPs**: Instagram commonly blocks datacenter IPs such as
  GitHub runners. The deferred cron may need a residential proxy or a manual
  local re-run. Decide when building that phase, not now.
