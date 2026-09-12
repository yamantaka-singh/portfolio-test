import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseSocial } from './social-schema.js';

const sample = {
  scrapedAt: '2026-09-12T10:00:00+00:00',
  profiles: [{ platform: 'youtube', handle: 'spinandswing26', url: 'https://www.youtube.com/@spinandswing26', followers: 12300, postCount: null, name: null, headline: null }],
  videos: [{ platform: 'youtube', channel: 'spinandswing26', id: 'DfECjUL9ZvU', title: 'Nets', views: 147443, publishedAt: '2026-09-10T20:00:18+00:00', thumb: 'yt-DfECjUL9ZvU.jpg', featured: true }],
  posts: [{ platform: 'instagram', account: 'spinandswing26', shortcode: 'DdHNbqDJusb', url: 'https://www.instagram.com/p/DdHNbqDJusb/', caption: 'hi', likes: null, isReel: false, thumb: 'ig-DdHNbqDJusb.jpg', featured: false }],
};

test('accepts a valid scrape', () => {
  assert.equal(parseSocial(sample).videos[0].views, 147443);
});

test('accepts null counts', () => {
  const s = structuredClone(sample);
  s.profiles[0].followers = null;
  assert.equal(parseSocial(s).profiles[0].followers, null);
});

test('rejects a row without a thumbnail', () => {
  const s = structuredClone(sample);
  delete s.videos[0].thumb;
  assert.throws(() => parseSocial(s));
});

test('rejects an unknown platform', () => {
  const s = structuredClone(sample);
  s.profiles[0].platform = 'tiktok';
  assert.throws(() => parseSocial(s));
});
