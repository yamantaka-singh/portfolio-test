import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mailtoUrl } from './links.js';

test('mailtoUrl encodes the subject', () => {
  assert.equal(mailtoUrl('hello@example.com', 'Brand collab: Q4'), 'mailto:hello@example.com?subject=Brand%20collab%3A%20Q4');
});

test('mailtoUrl rejects a bad address', () => {
  assert.throws(() => mailtoUrl('not-an-email', 'x'));
});
