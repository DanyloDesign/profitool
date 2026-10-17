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

## 2026-10-17: store address and no courier

Owner facts: the store, pickup point and service are at smt Sofiivka, vul. Likarnia (ru: pgt Sofievka, ul. Bolnichnaya), Dnipropetrovsk oblast, no house number yet, coordinates 48.044502, 33.863312. There is no courier delivery anywhere: Nova Poshta and pickup only.

Files changed:
- `src/i18n/ua.ts`, `src/i18n/ru.ts`: footerAddress, footerAbout (no Kyiv, same tone), methodPickup, serviceRepair, stock.inCity ("шт у магазині" / "шт в магазине"). Removed dead keys: methodCourier, profile methodShort.courier, checkout.address, errAddress, nav.cityDeliveryFast.
- `src/lib/shop.ts`: `DeliveryMethod` is now `"novapost" | "pickup"`.
- `src/components/cart/checkout-form.tsx`: courier radio, address label and address error removed; the branch field always uses the branch label and error.
- `src/components/account/profile-view.tsx`: labels fall back to Nova Poshta for anything that is not pickup, so old orders stored with method "courier" in localStorage render without a crash.
- `src/store/location.ts`: removed `isFastDelivery` and the Kyiv special case; `DEFAULT_SLUG` stays "kyiv" (city list and default unchanged).
- `src/components/layout/city-select.tsx`: every city shows the same "1–2 days" Nova Poshta term.

Not touched: `src/data/info.ts`, `src/app/[locale]/info/`, `src/components/info/`, `globals.css`. `tools/shots/smoke.mjs` has no courier scenario, so it needed no change.

Checks: `npx tsc --noEmit` clean; eslint on all changed files clean; grep for `Кирил|Кирилл|courier` in `src` finds nothing outside `src/data/info.ts`; `node tools/shots/smoke.mjs` 30/30 passed. Not verified by eye in Chrome: checkout with two delivery options, city dropdown.
Open: house number for the address; the default city is still Kyiv (kept per instructions); `store/account.ts` Order type now cannot hold "courier" statically, old stored values are handled at render only.

## 2026-10-17: delivery page, direction B

Files: `src/components/info/delivery-calculator.tsx` (new, client), `src/data/info.ts` (exported `deliveryCalc`, ua/ru strings), `src/app/[locale]/info/[slug]/page.tsx` (slug "delivery" renders title t-h2 + calculator; other four pages unchanged), `src/app/globals.css` (`.delivery-range`, accent-color from tokens).

Decisions:
- Method toggle uses aria-pressed buttons; slider has a visible label; result column is aria-live="polite".
- Initial sum is the cart subtotal after `useMounted` (0 before mount, so no hydration mismatch); the user's slider move overrides it.
- Address, hours and phone come from the dictionary, so the house number is added in one place. Mini map is inline SVG with tokens only (ink-800, ink-900, bone).
- Price is clamp(4rem, 9vw, 6.25rem) Unbounded 900; page padding and title reduced for this page only.

Measurements (puppeteer, zoom 0.9): bottom of `[data-delivery-end]` is about 594 real px (rect 534.7 reported in zoomed units, read from the screenshot) vs viewport 800 at 1440x800 and vs 860 at 1512x860. No vertical scroll needed for content; the footer starts around 700. 390px: stacked, no horizontal overflow.
Checks: `npx tsc --noEmit` clean; eslint clean on changed files. Screenshots in `shots/`: delivery-b-1512x860, -1440x800, -390, -1512-dark, -ru-1512x860.

Defects left: keyboard/focus pass not done by hand; slider track is the native one (theme accent only); dark progress track is low contrast against black; address has no house number (owner to add); Playwright-less check of slider drag and pickup toggle not run.

### Orchestrator review (2026-10-17)

- Native range was a solid black bar in the light theme: custom `.delivery-range` track and thumb on tokens,
  the passed part in `signal`, focus ring `signal-text`.
- Empty cart opened the page on "0 ₴" with an empty bar: default sum 3 000 ₴ when the cart is empty.
- Slider scale (0–10 000) and the progress bar (0–5 000) read differently: 5 000 ₴ label mid-scale.
- Dark theme progress track was faint: `bg-ink-600` for both tracks.
- Keyboard check (puppeteer): focus slider, 25 × ArrowRight from 3 000 → 5 500 ₴ gives "0 ₴ · Доставка
  безкоштовна"; clicking "Самовивіз" gives "0 ₴ · Самовивіз завжди безкоштовний"; console errors: none.
- Screens: delivery-b-1512x860, -1440x800, -1512-dark, -ru-1512, -390, -focus. Page area ends about 600 px,
  footer starts near 700 px of an 800–860 px viewport. tsc, eslint clean, smoke 30/30.

## 2026-10-17: payment page, direction B

Files: `src/components/info/payment-picker.tsx` (new, client), `src/data/info.ts` (exported `paymentPicker` and `PaymentMethodKey`; payment `sections` emptied, title and lead kept for nav, breadcrumbs, metadata), `src/app/[locale]/info/[slug]/page.tsx` (delivery and payment now share one compact frame via a `compact` intro + body pair; the other three pages unchanged).

Decisions:
- Three `aria-pressed` buttons (rounded-[22px], Unbounded title, one-line subtitle) on the left; the right column is `aria-live="polite"`: kicker, headline (Unbounded 900, clamp(1.75rem, 3.2vw, 2.75rem)), three steps with a 32px `--grad-brand` circle and black digit.
- Card brands are non-interactive `<li class="chip">` with hover border neutralised. Demo line carries `data-payment-end`.
- Tokens only, no caps, no text under 16px.

Measurements (puppeteer, zoom 0.9, `[data-payment-end]` bottom, zoomed units, times 0.9 = real px): card 559 (503 real), cod 520 (468), invoice 505 (454). Viewports 1440x800 and 1512x860: content ends about 500 real px, footer starts about 613 to 667, so everything is above the fold for all three methods. 390px: stacked, scrollWidth 390, no horizontal scroll. Console errors: none in any run. Aria-live text read for each method in ua and ru.
Checks: `npx tsc --noEmit` clean; eslint clean on the three changed files. Screenshots in `shots/`: payment-b-1512x860, -1440x800-invoice, -390, -1512-dark, -ru-1512 (all viewed).

Defects left: keyboard and focus ring not checked by hand; no Chrome-extension pass; headline wraps to two lines at 1440 to 1512 (intended); the empty-looking strip between the demo line and the footer is the page bottom padding.

### Orchestrator review, payment (2026-10-17)

- Screens checked: payment-b-1512x860 (card), -1440x800-invoice, -1512-dark, -390, -ru-1512. All three
  methods above the fold at 1440x800; footer starts near 610-670 px.
- Keyboard: focus on the pressed button, Tab, Enter switches to "При отриманні"; aria-live text follows.
  The focus shot caught the colour transition mid-way (grey buttons); the end state is the black/white pair.
- smoke 30/30, tsc clean.
- Known: brand chips look like buttons but do nothing. Copy that the owner has not confirmed was left out
  ("за хвилину", "спершу дивишся"); the invoice flow says only that you receive and pay an invoice.

## 2026-10-17: returns page, direction B

Rebuilt `/ua|ru/info/returns` as "Check": days slider 0-30 (reuses `.delivery-range` with `--fill`), three yes/no pill pairs (`aria-pressed`), verdict column (`aria-live="polite"`).

Files:
- `src/components/info/returns-check.tsx` (new client component).
- `src/data/info.ts`: `returnsCheck` (ua + ru, ти/ты, gender-neutral), `RETURN_DAYS = 14`; old returns sections removed (`sections: []`, nothing else used them).
- `src/app/[locale]/info/[slug]/page.tsx`: slug `returns` uses the compact frame.

Logic, first match wins: broken -> warranty; days > 14 -> expired (link to warranty); used -> no; no packaging/receipt -> need them; else OK with "Залишилось N дн." and two actions (tel: signal-btn, ghost-btn to /info/delivery). Non-OK verdicts use `text-signal-text`, OK uses `text-bone`.

Owner facts (2026-10-17) applied: return by Nova Poshta or in store; refund no later than 7 days after the store receives the item for checking. The placeholders "[строк повернення коштів]" and "[срок возврата денег]" are gone from `src/`. Return shipping payer is not mentioned (unknown).

Measurements (puppeteer, `[data-returns-end]` bottom x 0.9): 1440x800: OK 540, used/no packaging/expired/warranty 462 (viewport 800). 1512x860: OK 544 (viewport 860). All verdicts above the fold. 390px: stacked, scrollWidth 390, no horizontal scroll. Console errors: none. Aria-live text read for OK, used, no packaging, 15 days (ArrowRight x10), broken, and RU OK.
Checks: `npx tsc --noEmit` clean; eslint clean on the three changed files. Screenshots in `shots/`: returns-b-1512x860, -1440x800-warranty, -390, -1512-dark, -ru-1512 (all viewed).

Defects left: in UA the two OK-state buttons wrap onto two rows at 1512 (RU fits on one row), still above the fold; keyboard and focus pass done only on the slider; no Chrome-extension pass; not committed.

### Orchestrator review, returns (2026-10-17)

- Owner facts applied: return by Nova Poshta allowed; refund no later than 7 days after the store receives
  the item for checking. Refund placeholders are gone from src/.
- The two OK-state buttons wrapped in Ukrainian at btn-lg: default button size, one row at 1440x800.
- Screens returns-b-1512x860, -1440x800, -1512-dark checked. tsc, eslint clean, smoke 30/30.

Warranty and privacy, direction B drafts: https://claude.ai/artifact/Bb37Gnz5KUKDn1MWBJssJ8
