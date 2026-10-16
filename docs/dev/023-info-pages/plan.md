# 023 · Plan

Size: M. One builder (Sonnet), because all steps touch the shared dictionaries `ua.ts` / `ru.ts`.
Review and browser check by the orchestrator.

| # | Step | Files | Check |
|---|---|---|---|
| 1 | Content data, ua + ru | `src/data/info.ts` | `npx tsc --noEmit` clean; numbers come from `shop.ts` |
| 2 | Route and layout | `src/app/[locale]/info/[slug]/page.tsx`, `src/components/info/info-nav.tsx` if needed | 10 pages render, unknown slug is 404 |
| 3 | Dictionary keys (nav labels, consent and checkout link text) | `src/i18n/ua.ts`, `src/i18n/ru.ts` | both locales have the same keys (tsc) |
| 4 | Footer column | `src/components/layout/footer.tsx` | links work, no overflow 1024–1512 and 390 |
| 5 | Product terms rows as links | `src/app/[locale]/product/[slug]/page.tsx` | rows clickable, look unchanged |
| 6 | Checkout and registration links | `src/components/cart/checkout-form.tsx`, `src/components/account/account-view.tsx` | links open the right pages |
| 7 | Verify | eslint on changed files, `GITHUB_PAGES=true pnpm build`, screenshots 1512 and 390, both themes | no console errors, no horizontal scroll |
| 8 | Ship | commit `KAN-122 feat(info): ...`, push branch, PR | PR open with key in title |

## Risks

- The branch is stacked on `KAN-121-site-scale-90` (PR not merged), like 021 was on 020.
- `asset()` is not needed: the pages use no files from `public/`.
- Static export: route has no server `searchParams`, so it builds for GitHub Pages.
