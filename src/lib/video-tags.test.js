import { test } from 'node:test';
import assert from 'node:assert/strict';
import { videoTag } from './video-tags.js';

test('rank 0 is always VIRAL HIT, regardless of title', () => {
  assert.deepEqual(videoTag('Guess the Player | Spin & Swing', 0), { tag: 'VIRAL HIT', badgeClass: 'neon' });
});

test('matches content rules by title for lower ranks', () => {
  assert.deepEqual(videoTag('Guess the Jersey number - Pt 10', 1), { tag: 'GUESS THE SQUAD', badgeClass: 'gold' });
  assert.deepEqual(videoTag('What does DPL mean to you ?', 2), { tag: 'DPL TIGER', badgeClass: 'gold' });
  assert.deepEqual(videoTag('Gt fan vs Mi fan', 3), { tag: 'FAN FACEOFF', badgeClass: 'cyan' });
  assert.deepEqual(videoTag('My Sister Got a New Scooty !! | VLOG 24', 4), { tag: 'VLOG', badgeClass: 'cyan' });
});

test('falls back to FEATURED when nothing matches', () => {
  assert.deepEqual(videoTag('That one hawabaz friend', 5), { tag: 'FEATURED', badgeClass: 'neon' });
  assert.deepEqual(videoTag(null, 5), { tag: 'FEATURED', badgeClass: 'neon' });
});
