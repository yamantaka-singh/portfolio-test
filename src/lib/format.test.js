import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compactCount, longDate } from './format.js';

test('compactCount', () => {
  assert.equal(compactCount(46300000), '46.3M');
  assert.equal(compactCount(8584), '8.6K');
  assert.equal(compactCount(999), '999');
  assert.equal(compactCount(0), '0');
  assert.equal(compactCount(null), '—');
});

test('longDate is UTC and unambiguous', () => {
  assert.equal(longDate('2026-09-12T23:30:00+00:00'), '12 September 2026');
});
