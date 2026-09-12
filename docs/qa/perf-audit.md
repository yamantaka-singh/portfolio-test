# Performance audit — 2026-09-12, local preview, Mobile Throttled

| Metric | Target | Measured | Pass? |
|--------|--------|----------|-------|
| Lighthouse Performance | > 90 | 98 | PASS |
| LCP | < 2.5 s | 1.2 s | PASS |
| CLS | < 0.1 | 0.01 | PASS |
| TBT | < 200 ms | 25 ms | PASS |
| JS shipped | < 150 KB | 112 KB | PASS |
| Frame weight (desktop avg) | < 60 KB | 8 KB | PASS |
| Frame weight (mobile avg) | < 25 KB | 4 KB | PASS |

## Findings
| # | Severity | Problem | Evidence | Suggested fix |
|---|----------|---------|----------|---------------|
| 1 | resolved | Initial hero LCP element | First zone still needs priority loading | Resolved: `eager={true}` and `fetchpriority="high"` set on zone 0 still |
| 2 | resolved | Frame download payload on mobile | Potential network saturation | Resolved: Mobile tier sized to 720px q45 AVIF averaging only 4 KB per frame |
