# 023 · Implementation

Steps 1-6 of plan.md. Steps 7 (browser screenshots, build) and 8 (ship) are not done here.

## Files

New:
- `src/data/info.ts`: content for five pages, ua + ru (`infoPages`, `infoBySlug`). Delivery cost and free-delivery threshold are built from `DELIVERY_COST`, `FREE_DELIVERY_FROM` and `price()` in `src/lib/shop.ts`. Text tokens `{phone}`, `{address}`, `{hours}` are filled by the page from the dictionary.
- `src/app/[locale]/info/[slug]/page.tsx`: server route, `generateStaticParams` (locales x slugs), `generateMetadata` from the page title and lead, `notFound()` for unknown slug.
- `src/components/info/info-nav.tsx`: sticky list from 1024px, chip row (own horizontal scroll) below; `aria-current="page"` on the active link.

Edited:
- `src/i18n/ua.ts`, `src/i18n/ru.ts`: new `info` block (nav label "Покупцям" / "Покупателям", checkout link text parts); `account.consent` split into `consentBefore` / `consentLink` / `consentAfter`.
- `src/components/layout/footer.tsx`: new nav column with the five links, grid is 5 columns at lg.
- `src/app/[locale]/product/[slug]/page.tsx`: terms rows are links (delivery, pickup -> delivery; warranty -> warranty; returns -> returns), hover:text-signal-text.
- `src/components/cart/checkout-form.tsx`: line with returns and privacy links under the submit button, above the existing demo line.
- `src/components/account/account-view.tsx`: "обробку даних" is a link to privacy.

## Decisions and deviations

- Figures on delivery and payment are full-width hairline rows (value in `t-section`, label beside it), not `.pdp-figures`: that class is sized for the narrow buy column (1.25rem) and three columns of "від 5 000 ₴" would not fit a 680px text column.
- Payment has two figures ("3 способи", "від 5 000 ₴"), delivery has three.
- Payment page states that online payment is not connected in this demo; the owner did not ask for it, it follows the honesty rule on the privacy page.
- Returns page adds a short "Товар із браком" section pointing to the warranty page (plain text, no link).
- Privacy uses the existing "ви" consent wording in registration unchanged (only split into parts); the pages use "ти".
- No changes to `globals.css`. Placeholders are plain bracketed text.

## Checks

- `npx tsc --noEmit`: clean.
- `pnpm exec eslint` on all changed and new files: clean.
- HTTP on the dev server: 200 for all 10 pages (ua/ru x 5), 404 for `/ua/info/nope` and `/ru/info/nope`. Tokens `{phone}`, `{address}`, `{hours}` and the 120 / 5 000 figures render filled.

## Known gaps

- Not looked at in a browser: no screenshots at 1512 / 390, no dark theme check, no footer overflow check at 1024-1280. `pnpm build` (static export) not run.
- Texts are not reviewed by stop-slop or a lawyer; the placeholders still need real company data.
- Product terms rows were wrapped in `Link`; visual parity with the old rows is unverified.

## Orchestrator review and fixes (2026-10-16)

Screenshots in `shots/`: delivery 1512 and 390, payment 390, returns 1512 dark, privacy ru 390,
warranty and footer at 1100 and 1300, product 1512, registration 1512, checkout 390.

Defects found in the screenshots and fixed:

- Double hairline between the figure rows and the first section: last figure row has no bottom border now.
- Delivery sections repeated the figures word for word: Nova Poshta section now says where it delivers;
  courier section is shorter.
- Payment figures ("3 способи", "від 5 000 ₴") said nothing: removed. "Валюта" section removed. "Під час
  отримання" now says where you pay instead of repeating the heading.
- Returns copy used the masculine "ти використовував / платив": rewritten without gender.
- Phone, 390px: the chip row widened the page (implicit grid column sized to max-content).
  Grid is `grid-cols-[minmax(0,1fr)]` below lg. Then the title "Конфиденциальность" was wider than 390px
  and broke mid-word: the privacy page is now "Особисті дані" / "Личные данные", checkout link says
  "правила обробки особистих даних". `break-words` stays on the title as a fallback.
- Product terms rows looked like plain text after becoming links: a chevron at the row end, faint, signal on hover.
- Footer with five columns squeezed the phone number at 1100px: five columns from xl (1280), three at lg.

Checks after the fixes:

- `npx tsc --noEmit` clean, eslint on changed files clean.
- `GITHUB_PAGES=true pnpm build` + postexport: exit 0, `out/{ua,ru}/info/*` have all five pages
  (run before the last copy and footer fixes, not re-run).
- `node tools/shots/smoke.mjs`: 30/30.
- Overflow at 390: none on delivery, payment, warranty, privacy (ua and ru).

Not checked: real phone, focus ring on the new links (keyboard pass not done), contrast of the faint chevron
(decorative, the row text carries the meaning). Legal wording needs the owner or a lawyer before launch.
