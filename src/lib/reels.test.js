import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rankReels } from './reels.js';

const posts = [
  { shortcode: 'aaaaaaaa', views: 100, likes: 1, caption: 'scraped', account: 'abhishekpandey_26', isReel: true, thumb: 'ig-aaaaaaaa.jpg', url: 'u1' },
  { shortcode: 'cccccccc', views: 50, likes: 2, caption: 'small', account: 'abhishekpandey_26', isReel: true, thumb: 'ig-cccccccc.jpg', url: 'u3' },
];

const curated = [
  { id: 'bbbbbbbb', views: 9000, likes: 9, caption: 'the big one', thumb: 'ig-bbbbbbbb.jpg', url: 'u2', account: 'spinandswing26' },
  { id: 'aaaaaaaa', views: 90, likes: 1, caption: 'stale copy', thumb: 'ig-aaaaaaaa.jpg', url: 'u1', account: 'abhishekpandey_26' },
];

test('ranks by views across both sources', () => {
  const got = rankReels({ posts, curated, excluded: [] });
  assert.deepEqual(got.map((r) => r.shortcode), ['bbbbbbbb', 'aaaaaaaa', 'cccccccc']);
});

test('the curated all-time reel outranks every recently scraped one', () => {
  // The whole point: the reels tab only returns recent reels, so the biggest
  // reel is only ever known from innings.json.
  assert.equal(rankReels({ posts, curated, excluded: [] })[0].views, 9000);
});

test('a scraped post wins over the curated copy of the same reel', () => {
  const got = rankReels({ posts, curated, excluded: [] });
  const dupes = got.filter((r) => r.shortcode === 'aaaaaaaa');
  assert.equal(dupes.length, 1);
  assert.equal(dupes[0].views, 100); // scraped, not the stale 90
  assert.equal(dupes[0].caption, 'scraped');
});

test('excluded reels never appear, from either source', () => {
  const got = rankReels({ posts, curated, excluded: ['bbbbbbbb', 'aaaaaaaa'] });
  assert.deepEqual(got.map((r) => r.shortcode), ['cccccccc']);
});

test('curated reels are shaped like posts for the card template', () => {
  const big = rankReels({ posts, curated, excluded: [] })[0];
  assert.equal(big.isReel, true);
  assert.equal(big.thumb, 'ig-bbbbbbbb.jpg');
});

test('a curated reel keeps its own account, never a hardcoded one', () => {
  // 13 of 25 curated reels are spinandswing26; assuming one handle mislabelled them.
  const got = rankReels({ posts, curated, excluded: [] });
  assert.equal(got.find((r) => r.shortcode === 'bbbbbbbb').account, 'spinandswing26');
  assert.equal(got.find((r) => r.shortcode === 'cccccccc').account, 'abhishekpandey_26');
});

test('null views sort last instead of crashing', () => {
  const got = rankReels({ posts: [{ shortcode: 'dddddddd', views: null, caption: '', account: 'x', isReel: true, thumb: 't', url: 'u' }], curated, excluded: [] });
  assert.equal(got.at(-1).shortcode, 'dddddddd');
});
