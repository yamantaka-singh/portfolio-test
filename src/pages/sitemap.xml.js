import { social } from '../lib/social.js';

export function GET({ site }) {
  const loc = new URL('/', site).href;
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${loc}</loc><lastmod>${social.scrapedAt}</lastmod></url></urlset>\n`,
    { headers: { 'Content-Type': 'application/xml' } },
  );
}
