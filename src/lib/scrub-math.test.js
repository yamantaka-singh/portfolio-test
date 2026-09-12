import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickTier, frameUrl, coverRect, transitionsToLoad, pickFrame } from './scrub-math.js';

test('pickTier splits at 768px', () => {
  assert.equal(pickTier(375), 'mobile');
  assert.equal(pickTier(767), 'mobile');
  assert.equal(pickTier(768), 'desktop');
});

test('frameUrl is 1-based and zero-padded', () => {
  assert.equal(frameUrl('01-tunnel-pitch', 'mobile', 0), '/frames/01-tunnel-pitch/mobile/001.avif');
  assert.equal(frameUrl('05-pavilion-boundary', 'desktop', 59), '/frames/05-pavilion-boundary/desktop/060.avif');
});

test('coverRect fills a same-ratio box exactly', () => {
  assert.deepEqual(coverRect(1600, 900, 1600, 900), { x: 0, y: 0, w: 1600, h: 900 });
});

test('coverRect centre-crops 16:9 into a portrait phone', () => {
  const r = coverRect(1600, 900, 390, 844);
  assert.equal(r.y, 0);
  assert.ok(Math.abs(r.h - 844) < 1e-9);
  assert.ok(r.x < 0);
  assert.ok(Math.abs(r.x * 2 + r.w - 390) < 1e-9, 'crop is symmetric');
});

test('transitionsToLoad keeps current and next, within bounds', () => {
  assert.deepEqual(transitionsToLoad(0, 5), [0, 1]);
  assert.deepEqual(transitionsToLoad(4, 5), [4]);
});

test('pickFrame shows the first frame before anything starts', () => {
  assert.deepEqual(pickFrame([0, 0, 0], [60, 60, 60]), { t: 0, i: 0 });
});

test('pickFrame: the last started transition owns the canvas', () => {
  assert.deepEqual(pickFrame([1, 0.5, 0], [60, 60, 60]), { t: 1, i: 30 });
});

test('pickFrame: a finished transition holds its last frame', () => {
  assert.deepEqual(pickFrame([1, 1, 0], [60, 59, 60]), { t: 1, i: 58 });
});
