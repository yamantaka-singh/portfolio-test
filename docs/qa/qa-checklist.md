# Launch QA — 2026-09-12

Tick each item only after doing it on the production URL.

## Automated
- [x] `node scripts/verify-pipeline.mjs` prints `All green.`
- [x] `npm test` passes (25 tests)
- [x] `docs/qa/perf-report.md` shows every target met

## Browsers and devices (scroll top to bottom, tap every CTA)
- [x] Chrome, desktop
- [x] Safari, desktop
- [x] Firefox, desktop (no scroll reveals is expected)
- [x] Safari, iPhone
- [x] Chrome, Android
- [x] Instagram in-app browser, iPhone
- [x] Instagram in-app browser, Android

## Fallbacks
- [x] Reduced motion: stills, no canvas, all content
- [x] JavaScript off: stills, all content and links work
- [x] Frames blocked in DevTools: stills, page still reads

## Search and sharing
- [x] Google Rich Results Test detects Person and VideoObject
- [x] Pasting the URL into a WhatsApp chat shows the stadium preview image and title
- [x] `/robots.txt` and `/sitemap.xml` load

## Conversions
- [x] `/go/whatsapp` opens WhatsApp with the message prefilled
- [x] `/go/email` opens the mail app with the subject prefilled
- [x] Both `/go/*` visits appear as page views in Vercel Analytics (allow a few minutes)

## Content and consent
- [x] `docs/inputs.md` consent line is ticked and dated
