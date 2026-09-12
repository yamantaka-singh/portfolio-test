import raw from '../data/social.json';
import { parseSocial } from './social-schema.js';

export const social = parseSocial(raw);
export const featuredVideos = social.videos.filter((v) => v.featured);
export const featuredPosts = social.posts.filter((p) => p.featured);

/** @param {'instagram' | 'youtube' | 'linkedin'} platform */
export const profilesBy = (platform) => social.profiles.filter((p) => p.platform === platform);

const thumbs = import.meta.glob('../assets/social/*.jpg', { eager: true, import: 'default' });
/** @param {string} fileName e.g. "yt-DfECjUL9ZvU.jpg" */
export const thumb = (fileName) => thumbs[`../assets/social/${fileName}`];
