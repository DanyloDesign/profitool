# B2 — Product page (PDP)

## Files (current state, after fix round 2)
- `src/components/product/product-tabs.tsx` — Tabs (role="tablist", arrow/Home/End, roving tabindex) on ≥1024px + accordion below. Tabs: Характеристики / Опис / Комплектація only (no reviews — CLAUDE.md: no fake ratings). Local `useState`, no shared context needed anymore.
- `src/components/product/sticky-buy-bar.tsx` — mobile-only fixed bar, mirrors BuyBox cart state.
- `src/components/product/buy-box.tsx` — single primary CTA; `id="buy-box-price"` on the price row (sticky-bar trigger).
- `src/app/[locale]/product/[slug]/page.tsx` — grid layout; right column: BuyBox + one "Умови для цього товару" heading.
- i18n `product` section only, `ua.ts`/`ru.ts`: added `detailsLabel`, `returns`, `returnsValue`, `conditions`; changed `kit` "Комплект"→"Комплектація".
- Deleted (round 2): `product-view.tsx`, `key-specs.tsx`, `one-click-buy.tsx` — see below.

## Decisions / deviations
- Returns "14 днів" — still **needs owner confirmation** (generic UA consumer-law default).
- Gallery: single photo only, no lightbox — out of scope, skipped.

## Fix round 1 (KeySpecs placement, DOM-order regression, NBSP, sticky-bar smoke test)
- Moved KeySpecs out of the header (was pushing the photo down) into the buy column; found & fixed a mobile DOM-order bug this caused (buy box must be 2nd in DOM, not last, since mobile has no `lg:col-*`).
- `serviceDelivery`/`warrantyValue`/`returnsValue` joined number+unit with `\u00A0` — verified via codepoint dump.
- Sticky bar confirmed via Puppeteer at 390px (old trigger: `#buy-box-cta`).

## Fix round 2 (review.md items 3, 4, 7, 8, 9, 16 + CLAUDE.md 186-200)
- **Removed "Купити в один клік"** entirely: deleted `one-click-buy.tsx`, its mount in `buy-box.tsx`, i18n keys `oneClick*`. CLAUDE.md explicitly says this feature was cut and returns only on the owner's word — it had come back as an unauthorized demo stub.
- **Removed "Відгуки" tab**: `TAB_IDS` in `product-tabs.tsx` is now `["specs","description","kit"]`. Deleted `reviews`/`reviewsEmpty`/`reviewsEmptyText` i18n keys. CLAUDE.md: no reviews/ratings without real data, on purpose.
- **Removed KeySpecs** (duplicated the spec table one screen-height below): deleted `key-specs.tsx`. Since it was the only reason for cross-component tab-state sharing, also deleted `product-view.tsx`/`ProductViewScope` entirely — `product-tabs.tsx` now owns its own `activeTab`/`openId` state locally. `page.tsx` reverted to plain (non-context) grid divs.
- **Buy box single CTA**: after add, the one button becomes a `Link` to `/cart` labelled "У кошику · N" (reused existing `inCart` copy), opening the cart modal on ≥768px and navigating to `/cart` on mobile — exact pattern copied from `components/cart/cart-button.tsx` (`window.matchMedia("(min-width: 768px)")` + `useCartUI.getState().show("modal")`). The old second full-width "Перейти до кошика" ghost button is gone; `product.toCart` i18n key removed as dead.
- **Sticky bar retargeted** (#7): trigger is now `#buy-box-price` (the price row in BuyBox), not the CTA — no longer pops in at load just because the button sits below the fold.
- **Sticky bar reserves its height** (#7): bar stays permanently mounted (toggled via `translate-y-full` + `inert`, not conditional `null`, so it can be measured) and its `offsetHeight` is written to `document.body.style.paddingBottom` while shown — same mechanism `compare-bar.tsx` already uses, not the in-flow spacer I tried first (that pushed the *footer* down but a `position:fixed` bar needs empty space *after* the footer, which only `body` padding provides, since Footer is a sibling of `{children}` in `layout.tsx`, not something this page can push directly).
  - **Bug found and fixed while verifying**: the height-measuring `useEffect` had `[]` deps, so it ran once during the pre-hydration render (when the component still returns `null` and `barRef` is unattached), measured `0`, and never re-ran. Fixed by depending on `[mounted]` too. Confirmed via `getComputedStyle(bar).offsetHeight` before/after: 0 → 69.
  - **Known unresolved gap**: `compare-bar.tsx` (not owned) also unilaterally writes `document.body.style.paddingBottom`, with no shared coordinator. If both bars are visible at once (non-empty compare list *and* scrolled past the price on <1024px), whichever effect fires last wins and the other's reservation is lost. Not fixed — would need either editing `compare-bar.tsx` or a shared "reserved bottom space" store, both out of this task's file scope.
- **Sticky bar mirrors cart state** (#8): same `inCart` check as BuyBox; shows "У кошику · N" → `Link` to cart (same modal/`/cart` split) once added, instead of blindly re-adding on every tap.
- **Accordion can fully collapse** (#9): `openId` is `TabId | null`; second tap on an open section sets it to `null` instead of forcing another section active.
- **Right column heading level** (#16): resolved as a side effect of removing KeySpecs — the column now has exactly one heading ("Умови для цього товару"), nothing to mismatch against.

## Verification (round 2)
- `npx tsc --noEmit` and `npx eslint` on all product files + `ua.ts`/`ru.ts`: clean after every edit.
- Puppeteer, Chrome at `C:/Program Files/Google/Chrome/Application/chrome.exe`, dev server on :3000 (pre-existing, not started/stopped by me). Script: `scratchpad/shots/round2-check.mjs`. One transient blocker along the way: the dev server 500'd for ~3 min on an unrelated syntax error in `src/components/catalog/filters.tsx` (another builder's file, mid-edit) — not fixed, waited it out.
- Confirmed via DOM assertions (both light and dark, 1440 + 390): no "Відгуки", no "один клік", no "Ключові характеристики" text anywhere on the page; add-to-cart → BuyBox shows "У кошику · 1"; mobile accordion "Характеристики" starts `aria-expanded=true`, second tap → `false`; at max scroll on mobile, the "© 2026 Profitool" text sits fully above the sticky bar (`lastFooterBottom 750.6 < barTop 775`, `covered:false` — was `true`/overlapping before the body-padding fix).
- Not re-verified: keyboard-only interaction with the sticky bar's `inert` state (should be correct per spec, but no manual Tab-key walkthrough done); tablet width.
