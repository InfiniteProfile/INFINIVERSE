# INFINIVERSE
Infinite Universes → Galaxies → Planets → Profiles. Zero-dependency vanilla ES modules; Node ≥18.

## Run
```
npm start          # production-style static server with SPA fallback → http://localhost:4173
npm test           # node:test unit tests (11)
```
No build step and no install needed (no runtime dependencies). `PORT` env var changes the port.
Deploy: any static host with a rewrite of unknown paths to `/index.html` (Netlify `/* /index.html 200`, Vercel rewrites).

## Routes
`/` · `/u/{n}` · `/u/{n}/g/{k}` · `/u/{n}/g/{k}/p/{k}` · `/u/{n}/g/{k}/p/{k}/f/{k}`. Indexes are integers 0–999,999 per parent, so the discovery space is ~10^24 profiles. It is practically unbounded, not mathematically infinite. Every URL is validated by rebuilding its parent chain; invalid ones show a not-found view. Real `<a>` links, History API, Back/Forward/refresh/deep links work.

## Procedural generation (`js/gen.js`)
Entities are pure functions of their path (seed string like `U5G6P7F8` → hash → mulberry32 PRNG). Nothing is stored; children are generated lazily by cursor (`page(parentPath,cursor,size)`), so pages never overlap and IDs are stable (`U5-G6-P7-F8`). Profiles are clearly labelled fictional.

## Search (`js/search.js`)
Same search is wired to the icon, `/` and Ctrl/⌘+K. 1) Exact IDs (`U7-G3-P2-F5`) resolve instantly **anywhere** in the space. 2) Names, usernames, tags and descriptions are matched by scanning a bounded deterministic window (300 universes; galaxies/planets of 30 universes; profiles of 8 universes ≈ 15k profiles), chunked so the UI never blocks, cancelable via AbortController, and ranked (exact > prefix > word-prefix > substring > tag > description). Entities outside that window are found by ID only. This is a limitation of a static, backend-less design.

## Animation & motion
Layered parallax stars + nebula drift (transform/opacity only), spinning CSS galaxies, bobbing planets, view transitions, card stagger, auto-hiding bar (rAF-throttled, passive listener, 12px/8px thresholds, always visible at top and on focus). All disabled under `prefers-reduced-motion`.

## Known limitations / verification
See the delivery message: browser E2E, Lighthouse and multi-viewport tests were **not** run in the build sandbox (no network → no Playwright/Chrome).
