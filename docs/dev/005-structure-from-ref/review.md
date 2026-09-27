# 005 — Review (fresh-context reviewer)

Date: 2026-09-21. Scope: uncommitted diff (16 modified, 18 new files). Method: puppeteer-core against the dev server
(localhost:3000), 1440 and 390, light and dark, plus code reading. `tsc --noEmit` and `eslint src --quiet`: clean.
Shots: `S = C:/Users/Danichca/AppData/Local/Temp/claude/C--Users-Danichca/e06cc9fc-72de-441d-a05d-5db6f0e53759/scratchpad/shots`
(`S/out-review/*`, `S/out-light/*`, `S/out-dark/*`). Scripts: `S/review-func.mjs`, `S/review-co.mjs`, `S/review-contrast.mjs`.
Not checked: tablet 834, real screen reader, Safari, production build, long-name stress with synthetic data.

## Verified working (no action)
- Mini-cart opens after add (card, buy box, sticky bar), auto-closes, Escape closes. Desktop cart = modal, `/cart` on 390 = page.
- Modal: role=dialog + aria-modal, scroll lock set and restored, Escape closes, focus returns to header trigger, Tab loop holds.
- PDP tabs: roving tabindex, ArrowLeft/Right/Home/End work. Mobile accordion renders; reviews tab shows honest empty state.
- One-click: invalid phone gives inline `role=alert`; valid phone gives status.
- Quick chip "Акумуляторні" -> `?power=cordless`, 7 -> 3 cards, `aria-pressed` true. Drawer CTA "Показати 7 товарів" -> "Показати 3 товари" after Makita, URL updated.
- Load-more (390) on `/ua/catalog`: 12 -> 24 cards. Desktop pagination renders 5 pages.
- City/support popovers: Escape closes and returns focus, outside click closes, `aria-expanded` toggles.
- Typewriter: static "Перфоратор, диск, рівень…" under `prefers-reduced-motion: reduce`; animates otherwise.
- Checkout: EDRPOU (8/10 digits) error, recipient toggle reveals 2 validated fields, comment saved; order completes; empty cart
  then shows "Повторити замовлення" and it refills the cart.
- RU: no Ukrainian-only letters (і ї є ґ) on /ru home, catalog, PDP, cart, checkout, wishlist, compare; new keys translated.
- WCAG text contrast (computed, AA thresholds): 0 failures on PDP, catalog, checkout with errors, cart, modal, both themes.
- Theme default is light; fonts, hairlines, pill buttons, orange accent kept. No grid bg, no top strips, no mono, no caps.

## Defects

### Major
1. **Desktop pagination lands at the page bottom.** `/ua/catalog`, 1440. Clicked "2" at scrollY 2248; after navigation scrollY
   stays 2248, user sees the footer and last row (`S/out-review/d-page2.png`). Cause: `scroll={false}` on page links in
   `src/components/catalog/pagination.tsx`. Fix: drop `scroll={false}` on desktop page links, or scroll to the grid top
   (`#results`) after navigation. Keep `scroll={false}` only on mobile LoadMore.
2. **Cross-sell suggests competitors, not add-ons.** Cart modal and `/cart`, all widths. HR2470 (corded hammer) in cart ->
   "Додати до замовлення": Makita DHR243Z 11 900 ₴ and Bosch GBH 2-26 8 940 ₴, both rotary hammers
   (`S/out-light/d-cart-modal.png`, `S/out-review/m-cart-full.png`). Cause: `pickCrossSell` in `cross-sell.tsx` falls back to
   the same category. Fix: map category -> complementary categories (hammer -> SDS-Plus bits in "Оснастка", "Захист";
   cordless -> batteries/chargers of the same platform); if nothing fits, hide the block.
3. **Information overload returns on PDP and catalog, which the owner rejected ("слишком много лишней информации").**
   - PDP 1440: "Ключові характеристики" (Потужність, Енергія удару, Патрон) repeats the first 3 rows of the spec table
     visible on the same screen (`S/out-light/d-product-full.png`). Buy box stacks 3 full-width buttons after add
     ("У кошику · 1", "Перейти до кошика", "Купити в один клік") plus wishlist/compare row.
   - Catalog 1440: one filter shows 3 times: chip "Акумуляторні", sidebar checkbox, "Обрано: Акумуляторні ×"
     (`S/out-review/d-chip-on.png`).
   - Checkout: "Склад замовлення" list in the left column duplicates the right summary (`S/out-review/d-checkout-errors.png`).
   Fix: on desktop, drop key specs (tabs sit right below) or drop the first 3 rows from the table; after add, replace the
   primary button with "Перейти до кошика" instead of adding a second one; hide "Обрано" row when the only active filter is a
   chip; remove "Склад замовлення" (keep the summary + "Змінити" link there).
4. **Features CLAUDE.md lists as removed for lack of function are back as demo stubs.** "Купити в один клік" ends in
   "Демо-версія: заявка нікуди не надсилається…" (`S/out-review/d-oneclick-ok.png`); "Оплата частинами — Умови уточнить
   менеджер" in checkout. CLAUDE.md: "оплата частинами", "купити в один клік" were cut and return only on the owner's word.
   request.md lists them under A8/A12, but request.md is still marked "чекає підтвердження". A shopper-facing
   "this does nothing" message also contradicts checkout, which says "Замовлення прийнято… Передзвонимо". Fix: get an
   explicit owner yes in `docs/DECISIONS`; if yes, make one-click behave like checkout (same demo success copy) and
   update CLAUDE.md; if no, remove both.
5. **Light-theme modal backdrop washes out the page instead of dimming it.** 1440 light. Overlay is `bg-ink-900/80`; in light
   `ink-900` is near-white, so the page turns milky and the white dialog barely separates from it (`S/out-light/d-cart-modal.png`
   vs `S/out-dark/d-cart-modal.png`). Fix: use a theme-independent scrim token, e.g. `rgb(20 19 15 / .45)` in light.

### Minor
6. **Modal focus trap leaks on first Shift+Tab.** Focus starts on the dialog container (`tabIndex=-1`); Shift+Tab from there
   leaves the dialog (went to `nextjs-portal`). Fix in `cart-modal.tsx`: treat `document.activeElement === node` as "first" and
   wrap to last, or focus the close button on open.
7. **Mobile sticky buy bar covers content.** 390 PDP: bar is visible at load because the buy CTA sits at y=869 (> 844),
   and it covers the big price line (`S/out-light/m-product.png`). At page end it hides the © line; `body` padding-bottom is 0
   (`S/out-review/m-product-bottom.png`). Fix: reserve bar height (padding-bottom on `main`/footer while visible), and trigger on
   the price block leaving the viewport, not the CTA.
8. **Sticky bar ignores cart state.** After add it still says "У кошик"; each tap adds +1 silently behind the mini-cart. Fix:
   mirror buy box: "У кошику · N" -> opens cart.
9. **Mobile accordion cannot collapse.** Tapping the open "Характеристики" keeps it open (`aria-expanded` stays true); one
   section is always open. Fix: toggle to `null` on second tap.
10. **Header popovers anchor away from their triggers.** 1440: city popover starts x≈220 under "Каталог" while the trigger is
    at x≈445; support popover also shifts left (`S/out-review/d-pop-city.png`, `d-pop-support.png`). Custom-city input
    placeholder truncates to "Введіть назву". Support hours wrap inside "09:00–/19:00". Fix: align popover left edge to
    trigger; widen the input row or stack "Обрати" below; use a non-breaking hyphen/nbsp in the hours.
11. **Pagination numbers are 40×40**, under the 44 px target; `nav aria-label` reads "Сторінка 1" (label of current page, not
    of the nav). Fix: `h-11 w-11`; nav label "Сторінки" / "Страницы".
12. **Mini-cart is not announced.** After add, focus stays on BODY and the panel is `role=dialog` without a live region, so
    screen readers get nothing. Fix: add a visually hidden `role=status` "Додано в кошик: {name}".
13. **Empty cart: "Повторити замовлення" floats 70 px below the main CTA**, detached and styled as a peer of "У каталог"
    (`S/out-review/d-cart-empty-repeat.png`). Fix: put it directly under the text as a text link or next to "У каталог".
14. **Mobile filter drawer shows "Скинути" twice** (header link and footer button) (`S/out-review/m-drawer-makita.png`).
    Keep the footer one.
15. **Mobile catalog spends ~250 px on controls before the first card**: sort select, chip rows, full-width "Фільтри"
    (`S/out-light/m-catalog.png`). Fix: sort + "Фільтри · N" in one row of two pills, chips in one horizontal scroll row.
16. **PDP right column heading levels mismatch**: "Ключові характеристики" in small label style, "Умови для цього товару" in
    a large h3 directly below. Pick one level.
17. **Search placeholder shows a bare "Шукати: "** between typed words (`S/out-light/d-home.png`). Hold the static
    placeholder during the empty frame.
18. Payment option "Рахунок для ФОП" stays the same when buyer type is "Компанія". Rename to "Рахунок-фактура" or switch by type.

### Pre-existing, noted only (not introduced by this diff)
- "Артикул MK-…" on PDP and "Залишилось N" on cards: both touch the rejected "артикули, лічильники" line; ask the owner.
- Footer links are 18 px tall hit areas.

## Scores (1-10)
| Criterion | Score | Why |
|---|---|---|
| Hierarchy | 6 | PDP right column and buy box pile up equal-weight blocks; triple filter indication. |
| Typography | 8 | Type system untouched and consistent; one heading-level mismatch. |
| Color | 7 | Light default reads clean, AA passes; light modal scrim is wrong. |
| Spacing | 7 | Desktop rhythm holds; mobile catalog controls and empty-cart gap are loose. |
| Originality | 6 | Features are standard e-commerce patterns ported faithfully; no new idea beyond the reference. |
| Fit to brief | 6 | Structure ported and visuals kept, but overload returns and two cut features came back without sign-off. |
| **Overall** | **6.5** | Functionally a clear step up from the owner's 6/10 (cart flow, tabs, filters, checkout all work, RU clean). Visual density regressed on PDP/catalog. Fixing majors 1-5 should reach 7.5. |
