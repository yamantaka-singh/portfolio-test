import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scoreboardStats } from './stats.js';

const base = {
  scrapedAt: '2026-09-12T10:00:00+00:00',
  profiles: [
    { platform: 'instagram', handle: 'abhishekpandey_26', url: 'https://www.instagram.com/abhishekpandey_26/', followers: 12000 },
    { platform: 'instagram', handle: 'spinandswing26', url: 'https://www.instagram.com/spinandswing26/', followers: null },
    { platform: 'youtube', handle: 'spinandswing26', url: 'https://www.youtube.com/@spinandswing26', followers: 8000 },
    { platform: 'linkedin', handle: 'abhishek-pandey-26sep03', url: 'https://www.linkedin.com/in/abhishek-pandey-26sep03', followers: null },
  ],
  videos: [{ views: 1000 }, { views: null }, { views: 500 }],
};

test('sums known followers across Instagram and YouTube only', () => {
  assert.equal(scoreboardStats(base).totalReach, 20000);
});

test('sums known video views', () => {
  assert.equal(scoreboardStats(base).totalViews, 1500);
});

test('all-unknown totals are null, not zero', () => {
  const s = structuredClone(base);
  s.profiles.forEach((p) => (p.followers = null));
  s.videos = [{ views: null }];
  const r = scoreboardStats(s);
  assert.equal(r.totalReach, null);
  assert.equal(r.totalViews, null);
});

test('lists one tile per Instagram/YouTube account, LinkedIn excluded', () => {
  assert.deepEqual(
    scoreboardStats(base).accounts.map((a) => a.label),
    ['Instagram @abhishekpandey_26', 'Instagram @spinandswing26', 'YouTube @spinandswing26'],
  );
});
