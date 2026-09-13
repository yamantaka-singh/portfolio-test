# ADR-0003: Scrapling seed (public data), self-hosted thumbnails, GitHub Actions refresh later

## Status
Accepted — 2026-09-12. The "Later (deferred phase)" bullet is superseded by ADR-0009 (2026-09-13).

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
- **One-time seed**: a Python script (`scraper/scrape.py`, Scrapling 0.4.15
  `Fetcher` with Chrome impersonation, logged out, no credentials ever)
  writes `src/data/social.json` and downloads thumbnails into
  `src/assets/social/`. Astro's `<Image>` converts them to AVIF/WebP at
  build time.
- **Per-platform sources**, each checked logged-out on 2026-09-12:

  | Platform | What | Source | Result |
  |----------|------|--------|--------|
  | Instagram | Follower/post counts | Profile page `og:description` | HTTP 200 |
  | Instagram | Posts | Profile JSON endpoint | **401 `require_login`**, not usable |
  | Instagram | Posts (used instead) | Shortcodes in the profile page HTML (~5 most recent), or URLs in optional `scraper/instagram_posts.txt`; each post page's `og:image` + `og:description` (likes, comments, date, caption) | HTTP 200, image downloads |
  | YouTube | Channel ID + subscriber count | Channel page: `<link rel="canonical">` and the `@handle • N subscribers` text | HTTP 200 |
  | YouTube | Latest 15 videos with views | `feeds/videos.xml?channel_id=…` (`media:statistics views`) | HTTP 200 |
  | LinkedIn | Name/headline | Public profile `og:title` / `og:description` | HTTP 200 |

  `StealthyFetcher` (a real browser, needs `scrapling install`) is the first
  thing to try if any source starts blocking the plain fetcher.
- **Contract**: `src/lib/social.ts` imports `social.json` and parses it with
  a zod schema (`astro/zod`) at build time, so a malformed scrape fails the
  build instead of shipping broken sections. A content collection is not
  used, because the file is one object, not a list of entries. Every count is nullable because public scraping may not
  return it.
  ```json
  {
    "scrapedAt": "2026-09-12T10:00:00+00:00",
    "profiles": [{ "platform": "instagram|youtube|linkedin", "handle": "", "url": "",
                   "followers": null, "postCount": null, "name": null, "headline": null }],
    "videos":   [{ "platform": "youtube", "channel": "", "id": "", "title": "", "views": null,
                   "publishedAt": "", "thumb": "yt-<id>.jpg", "featured": false }],
    "posts":    [{ "platform": "instagram", "account": "", "shortcode": "", "url": "",
                   "caption": "", "likes": null, "isReel": false,
                   "thumb": "ig-<shortcode>.jpg", "featured": false }]
  }
  ```
  The authoritative version is the zod schema in `src/lib/social-schema.js`
  (plan Task 5).
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
