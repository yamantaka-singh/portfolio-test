import { z } from 'astro/zod';

const count = z.number().int().nonnegative().nullable();
const isoDate = z.iso.datetime({ offset: true });
const shortcode = z.string().regex(/^[\w-]{8,}$/);

export const SocialSchema = z.object({
  scrapedAt: isoDate,
  profiles: z.array(
    z.object({
      platform: z.enum(['instagram', 'youtube', 'linkedin']),
      handle: z.string().min(1),
      url: z.url(),
      followers: count,
      postCount: count,
      name: z.string().nullable(),
      headline: z.string().nullable(),
    }),
  ),
  videos: z.array(
    z.object({
      platform: z.literal('youtube'),
      channel: z.string().min(1),
      id: z.string().regex(/^[\w-]{11}$/),
      title: z.string(),
      views: count,
      publishedAt: isoDate,
      thumb: z.string().regex(/^yt-[\w-]{11}\.jpg$/),
      featured: z.boolean(),
    }),
  ),
  posts: z.array(
    z.object({
      platform: z.literal('instagram'),
      account: z.string().min(1),
      shortcode,
      url: z.url(),
      caption: z.string(),
      likes: count,
      views: count,
      isReel: z.boolean(),
      thumb: z.string().regex(/^ig-[\w-]{8,}\.jpg$/),
      featured: z.boolean(),
    }),
  ),
  // Counts for the hand-curated reels in innings.json, refreshed by the scraper (ADR-0009).
  curated: z.record(shortcode, z.object({ views: count, likes: count })).default({}),
});

// Hand-edited only: tournament, accreditation and reel choice are never scraped (ADR-0009).
export const InningsSchema = z.array(
  z.object({
    dates: z.string().min(1),
    title: z.string().min(1),
    accredited: z.boolean(),
    desc: z.string(),
    reels: z.array(z.object({ id: shortcode, caption: z.string() })).optional(),
  }),
);

/** @param {unknown} data */
export const parseSocial = (data) => SocialSchema.parse(data);

/** @param {unknown} data */
export const parseInnings = (data) => InningsSchema.parse(data);
