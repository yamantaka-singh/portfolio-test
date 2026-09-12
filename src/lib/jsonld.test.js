import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildJsonLd } from './jsonld.js';

const site = {
  name: 'Abhishek Pandey',
  tagline: 'Cricket, told from the nets.',
  profiles: {
    instagram: ['https://www.instagram.com/abhishekpandey_26/', 'https://www.instagram.com/spinandswing26/'],
    youtube: ['https://www.youtube.com/@spinandswing26', 'https://www.youtube.com/@abhishekunseen26'],
    linkedin: 'https://www.linkedin.com/in/abhishek-pandey-26sep03',
  },
};
const videos = [{ id: 'DfECjUL9ZvU', title: 'Nets session', views: 147443, publishedAt: '2026-09-10T20:00:18+00:00' }];
const ld = buildJsonLd({ site, videos, pageUrl: 'https://abhishek-pandey.vercel.app/', imageUrl: 'https://abhishek-pandey.vercel.app/og.jpg' });

test('person links every profile', () => {
  const person = ld['@graph'].find((n) => n['@type'] === 'Person');
  assert.equal(person.name, 'Abhishek Pandey');
  assert.equal(person.sameAs.length, 5);
});

test('one VideoObject per video with required fields', () => {
  const v = ld['@graph'].filter((n) => n['@type'] === 'VideoObject');
  assert.equal(v.length, 1);
  assert.equal(v[0].embedUrl, 'https://www.youtube.com/embed/DfECjUL9ZvU');
  assert.equal(v[0].uploadDate, '2026-09-10T20:00:18+00:00');
  assert.ok(v[0].thumbnailUrl.startsWith('https://i.ytimg.com/vi/DfECjUL9ZvU/'));
  assert.equal(v[0].interactionStatistic.userInteractionCount, 147443);
});

test('serialises to valid JSON', () => {
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(ld)));
});
