import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseSocial, parseInnings } from './social-schema.js';

const sample = {
  scrapedAt: '2026-09-12T10:00:00+00:00',
  profiles: [{ platform: 'youtube', handle: 'spinandswing26', url: 'https://www.youtube.com/@spinandswing26', followers: 12300, postCount: null, name: null, headline: null }],
  videos: [{ platform: 'youtube', channel: 'spinandswing26', id: 'DfECjUL9ZvU', title: 'Nets', views: 147443, publishedAt: '2026-09-10T20:00:18+00:00', thumb: 'yt-DfECjUL9ZvU.jpg', featured: true }],
  posts: [{ platform: 'instagram', account: 'spinandswing26', shortcode: 'DdHNbqDJusb', url: 'https://www.instagram.com/p/DdHNbqDJusb/', caption: 'hi', likes: null, views: null, isReel: false, thumb: 'ig-DdHNbqDJusb.jpg', featured: false }],
};

const innings = [
  { dates: 'August – September 2026', title: 'DPL 2026', accredited: true, desc: 'Field access.', reels: [{ id: 'DcRzXB-zlPg', caption: 'Story' }] },
  { dates: 'February – May 2026', title: 'Content Creator | My11Circle', accredited: false, desc: 'Reels.' },
];

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

test('curated counts default to empty and parse when present', () => {
  assert.deepEqual(parseSocial(sample).curated, {});
  const s = { ...structuredClone(sample), curated: { 'DcRzXB-zlPg': { views: 800000, likes: null } } };
  assert.equal(parseSocial(s).curated['DcRzXB-zlPg'].views, 800000);
});

test('accepts innings with and without reels', () => {
  assert.equal(parseInnings(innings)[0].reels[0].id, 'DcRzXB-zlPg');
});

test('rejects an innings entry without accredited', () => {
  const s = structuredClone(innings);
  delete s[0].accredited;
  assert.throws(() => parseInnings(s));
});

test('rejects a malformed reel id', () => {
  const s = structuredClone(innings);
  s[0].reels[0].id = 'bad id!';
  assert.throws(() => parseInnings(s));
});
