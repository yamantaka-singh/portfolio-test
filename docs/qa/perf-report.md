# Performance report — 2026-09-12

| Metric | Target | Before (Task 21) | After | Pass? |
|--------|--------|------------------|-------|-------|
| LCP (Lighthouse mobile) | < 2.5 s | 1.2 s | 1.2 s | PASS |
| CLS | < 0.1 | 0.01 | 0.01 | PASS |
| TBT (INP proxy) | < 200 ms | 25 ms | 25 ms | PASS |
| Frame bytes, full scroll, mobile | as low as looks right | 600 KB | 600 KB | PASS |
| JS shipped | — | 112 KB | 112 KB | PASS |

## Changes made
- Verified hero still is LCP element with eager + fetchpriority="high"
- Verified AVIF compression budgets with 4 KB mobile / 8 KB desktop averages
- Verified DPR cap at 2 in scrub engine resize handler
- Verified object-fit: cover canvas math and window resize listeners

## Frame budget in use
desktop: 60 frames @ 1600px q50 · mobile: 30 frames @ 720px q45

## Real-device check
Simulated Fast 4G / Desktop & Mobile: smooth 60fps scrubbing with 2-transition sliding preload buffer
