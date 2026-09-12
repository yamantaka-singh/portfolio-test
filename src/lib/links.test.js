import { test } from 'node:test';
import assert from 'node:assert/strict';
import { whatsappUrl, mailtoUrl } from './links.js';

test('whatsappUrl encodes the message', () => {
  assert.equal(
    whatsappUrl('919812345678', 'Hi Abhishek & team'),
    'https://wa.me/919812345678?text=Hi%20Abhishek%20%26%20team',
  );
});

test('whatsappUrl rejects formatted numbers', () => {
  assert.throws(() => whatsappUrl('+91 98123 45678', 'hi'));
});

test('mailtoUrl encodes the subject', () => {
  assert.equal(mailtoUrl('hello@example.com', 'Brand collab: Q4'), 'mailto:hello@example.com?subject=Brand%20collab%3A%20Q4');
});

test('mailtoUrl rejects a bad address', () => {
  assert.throws(() => mailtoUrl('not-an-email', 'x'));
});
