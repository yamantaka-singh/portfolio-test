/** Content-based badge for a video card, instead of a fixed position-in-list rotation
 * (the old "index 0 always says VIRAL HIT" approach mislabels whatever happens to sort
 * into that slot -- e.g. a "Guess the Player" quiz short tagged DPL TIGER). Order matters:
 * first matching rule wins. */
const RULES = [
  [/\bdpl\b/i, { tag: 'DPL TIGER', badgeClass: 'gold' }],
  [/\bipl\b/i, { tag: 'IPL SPOTLIGHT', badgeClass: 'neon' }],
  [/interview/i, { tag: 'INTERVIEW', badgeClass: 'cyan' }],
  [/\bvs\b/i, { tag: 'FAN FACEOFF', badgeClass: 'cyan' }],
  [/guess|squad|jersey|quiz/i, { tag: 'GUESS THE SQUAD', badgeClass: 'gold' }],
  [/vlog/i, { tag: 'VLOG', badgeClass: 'cyan' }],
  [/world cup|t20|\bmatch\b/i, { tag: 'MATCHDAY INTEL', badgeClass: 'gold' }],
];
const FALLBACK = { tag: 'FEATURED', badgeClass: 'neon' };

/**
 * @param {string | null} title
 * @param {number} rank 0-based position in the views-sorted list -- the single most-viewed
 *   video is the actual "viral hit" regardless of what its title says.
 */
export function videoTag(title, rank) {
  if (rank === 0) return { tag: 'VIRAL HIT', badgeClass: 'neon' };
  return RULES.find(([re]) => re.test(title || ''))?.[1] ?? FALLBACK;
}
