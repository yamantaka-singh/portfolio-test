/**
 * Every reel we know a view count for, best first.
 *
 * The scraper only ever sees a profile's ~12 most recent reels (the reels tab has no
 * reachable pagination logged out), and recent is not the same as biggest -- the
 * all-time top reels are only known from the hand-curated innings.json. Ranking the
 * union is what makes "most-watched" actually mean most-watched.
 *
 * @param {{
 *   posts: { shortcode: string, views: number | null }[],
 *   curated: { id: string, views: number | null, likes: number | null, caption: string, url: string, thumb: string }[],
 *   excluded: string[],
 * }} input
 */
export function rankReels({ posts, curated, excluded }) {
  const byId = new Map(
    curated.map((r) => [
      r.id,
      {
        shortcode: r.id,
        url: r.url,
        thumb: r.thumb,
        caption: r.caption,
        views: r.views,
        likes: r.likes,
        isReel: true,
        // Only ever read as an aria-label fallback, and curated reels always have a
        // caption, so the label never falls back to it.
        account: 'abhishekpandey_26',
        featured: false,
      },
    ]),
  );
  // A scraped post wins over the curated copy of the same reel: fresher counts and a
  // real account handle.
  for (const p of posts) byId.set(p.shortcode, p);

  return [...byId.values()]
    .filter((r) => !excluded.includes(r.shortcode))
    .sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
}
