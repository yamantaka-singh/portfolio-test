import raw from '../data/social.json';
import rawInnings from '../data/innings.json';
import { parseSocial, parseInnings } from './social-schema.js';

export const social = parseSocial(raw);
export const featuredVideos = social.videos.filter((v) => v.featured);
export const featuredPosts = social.posts.filter((p) => p.featured);

/** @param {'instagram' | 'youtube' | 'linkedin'} platform */
export const profilesBy = (platform) => social.profiles.filter((p) => p.platform === platform);

const postsById = new Map(social.posts.map((p) => [p.shortcode, p]));
// Curated tournament reels joined with their refreshed counts; null counts render hidden.
export const innings = parseInnings(rawInnings).map((i) => ({
  ...i,
  reels: i.reels?.map((r) => {
    const counts = social.curated[r.id] ?? postsById.get(r.id);
    return {
      ...r,
      url: `https://www.instagram.com/reel/${r.id}/`,
      thumb: `ig-${r.id}.jpg`,
      views: counts?.views ?? null,
      likes: counts?.likes ?? null,
    };
  }),
}));

const thumbs = import.meta.glob('../assets/social/*.jpg', { eager: true, import: 'default' });
/** @param {string} fileName e.g. "yt-DfECjUL9ZvU.jpg" */
export const thumb = (fileName) => thumbs[`../assets/social/${fileName}`];
