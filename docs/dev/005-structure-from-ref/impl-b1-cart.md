# B1 — Cart (mini-cart, cart modal, cross-sell)

## Files
- `src/components/cart/mini-cart.tsx` — new. Dropdown under `CartButton`, shows on `panel === "mini"`.
- `src/components/cart/cart-modal.tsx` — new. Portal to `document.body`, dialog on `panel === "modal"`.
- `src/components/cart/cross-sell.tsx` — new. "Додати до замовлення", used inside `CartView` (so both `/cart` and the modal get it for free).
- `src/components/cart/cart-view.tsx` — edited: renders `CrossSell` after the totals grid, empty state gained "Повторити замовлення" when `useLastOrder.items` is non-empty.
- `src/components/cart/cart-button.tsx` — edited: wraps trigger link in `relative` div, mounts `MiniCart`/`CartModal`, intercepts click on ≥768px to open the modal instead of navigating, closes both panels on route change.
- `src/i18n/ua.ts`, `src/i18n/ru.ts` — added `cart.miniTitle/miniCartBtn/miniCheckoutBtn/closeCart/repeatOrder/crossSellTitle/crossSellAdd`.

## Key decision (deviation, reported)
Goal 1 said the mini-cart opens "on click of the button on desktop"; goal 3 said the header
button opens the modal on ≥md instead of navigating. Both can't be literally true for the same
click. Resolved in favor of the more specific, breakpoint-explicit goal 3: click on ≥md opens the
**modal** directly; mini-cart opens only via `announceAdded()` (add-to-cart feedback), which also
means the "opened by announce vs. by click" ambiguity for auto-close disappears — every mini-cart
open is an announce, so it always gets the 4s auto-close (paused on hover/focus).

## Behavior
- Mini-cart: 4s auto-close via ref-based timer, paused on mouseenter/focus, resumed on leave/blur;
  closes on outside mousedown, Escape, route change (route-change close lives in `CartButton`,
  covers modal too). "Кошик" button opens modal on ≥768px (matchMedia) or navigates to `/cart`
  below that. "Оформити" links straight to `/checkout`.
- Cart modal: `role="dialog"`, `aria-modal`, manual focus trap (Tab/Shift+Tab wrap, same pattern as
  `catalog/filters.tsx`), Escape, body scroll lock, focus returns to the cart trigger `<a>` on
  close. Mounted via `createPortal` per the task's note that the header sits on a `backdrop-filter`
  layer, which would make an unportaled `fixed` child anchor to that layer instead of the viewport.
  Content is `<CartView />` reused as-is (rows, stepper, free-delivery bar, totals, cross-sell).
- No enter/exit animation added: `DESIGN.md` explicitly removed the site's general fade-in and
  keeps exactly one animation (product-photo hover scale). `prefers-reduced-motion` requirement is
  trivially satisfied since there's nothing to disable; the global reduced-motion rule in
  `globals.css` still zeroes any incidental `transition-colors` on buttons.
- Cross-sell: superseded by Fix round 2 below (category-complement mapping, not platform/same-category).
- Empty state: existing `EmptyState` unchanged (not owned), "Повторити замовлення" rendered next to
  it in `cart-view.tsx`, calls `cart.add(slug, qty)` for each `lastOrder.items` entry.

## Fix round 1
Cart row used `sm:`/viewport breakpoints, so at 1440 viewport the desktop 5-col row layout
applied even inside the modal's ~470px-wide item column (modal caps at 1040px + padding + the
420px totals aside), overlapping the qty stepper onto the model name and wrapping "2,4 Дж" per
word. Fixed in `cart-view.tsx`: added `@container` to the item-list `<section>`, replaced every
`sm:` variant on the row (`<article>`, thumb `<Link>`, actions wrapper, price span) with
`@[640px]:`, keeping the same 640px switch point as before but keyed to the row's own rendered
width instead of the viewport. Verified with `tsc --noEmit` (clean, pre-existing unrelated
`header.tsx` error only) and `eslint` (clean), then `node states.mjs ./out-b1 light`:
`out-b1/d-cart-modal.png` now shows thumb+name on one line and stepper/price/delete stacked below,
no overlap; `out-b1/m-cart.png` (390px, empty cart this run) unaffected.

## Fix round 2
From `docs/dev/005-structure-from-ref/review.md` items 2, 5, 6, 12, 13:
- **#2 cross-sell suggested competitors.** `cross-sell.tsx`: replaced the platform/same-category
  fallback with a category-complement map (`BIT_CATEGORIES`/`DISC_CATEGORIES`/
  `GENERIC_ACCESSORY_CATEGORIES` → `rotary-hammers`/`drills` want bits, `grinders`/`saws` want
  discs (detected via a `disc` spec key), `sanders` want any accessory, all four also want
  `safety`; `accessories` in cart wants only `safety`; `measuring`/`safety` want nothing). Same
  category as anything already in the cart is always excluded. Picks the best-selling item from
  the accessory bucket and the best from the safety bucket separately (not top-2 of the merged
  pool) so a rotary hammer gets one bit set *and* one helmet instead of two bit sets. Empty pool
  hides the block (unchanged).
- **#5 light-theme scrim washed white.** Added a theme-aware `--scrim` token in `globals.css`
  (`:root` `rgba(0,0,0,.7)`, `:root[data-theme="light"]` `rgba(20,19,15,.45)`), additive only.
  `cart-modal.tsx` backdrop now uses `bg-[var(--scrim)]` instead of `bg-ink-900/80`.
- **#6 Shift+Tab leaked out of the modal.** `cart-modal.tsx`: focus now lands on the close button
  on open (not the `tabIndex=-1` container), and the wrap check also treats
  `document.activeElement === node` as "first" as a second line of defence.
- **#12 mini-cart add wasn't announced.** `mini-cart.tsx` renders a `role="status" aria-live="polite"
  sr-only` span unconditionally (not just while the dropdown is open), fed by a ref-diff of
  `items` (new slug, or an existing slug's qty going up) resolved to a product name — no store
  changes needed since `announceAdded()` takes no payload. New `cart.added(name)` i18n key.
- **#13 "Повторити замовлення" floated ~70-112px below.** That gap was `EmptyState`'s own
  `py-20 md:py-28`, applied after the CTA regardless of what's rendered next; a negative margin
  to cancel it was fragile across breakpoints. Fixed by not using `EmptyState` for this branch:
  when `lastOrder.items` is non-empty, `cart-view.tsx` renders the same markup inline (icon/title/
  text) with both CTAs in one `flex flex-col gap-3` column — primary `signal-btn` "У каталог" and
  "Повторити замовлення" as a text link (`text-sm text-signal-text hover:underline`, same pattern
  as the "Скинути" link in `catalog/filters.tsx`) directly under it. The no-`lastOrder` path still
  renders the untouched `EmptyState`.

Verified: `tsc --noEmit` and `eslint` clean on all owned files (unrelated errors elsewhere: a
concurrent builder's `product/` and `checkout-form.tsx` WIP). Visual check was blocked for several
minutes by another builder's in-progress edit to `catalog/filters.tsx` (transient build error /
`ReferenceError: trigger is not defined`, unrelated to this task) — polled until the dev server
recovered, then re-shot with a custom Puppeteer script (`scratchpad/shots/cart-round2.mjs` +
`cart-crosssell-check.mjs`, avoiding `/catalog` and `/product` routes since those still touch that
component) against localhost:3000, light and dark, 1440 and 390:
- `out-b1r2-light/d-cart-modal.png`, `out-b1r2-dark/d-cart-modal.png`: scrim reads
  `rgba(20,19,15,.45)` light / `rgba(0,0,0,.7)` dark, dialog clearly separated in both.
  `getComputedStyle` confirmed the same values programmatically.
  Cross-sell shows two safety helmets when a bit set is already in cart (Ryobi Home Safe, Metabo
  Basic Line); a direct check with `makita-hr2470` (rotary hammer, the review's own repro) in cart
  gives `["Bosch Extra Hard 43", "Ryobi Home Safe"]` — one bit set, one helmet, no other hammer.
- Focus check: `document.activeElement` after open is the close button
  (`aria-label="Закрити кошик"`); after one Shift+Tab, focus is still inside the dialog (`true`).
- Live region: after clicking "У кошик" on a product card, `[role="status"]` text reads
  "Додано в кошик: Bosch Extra Hard 43".
- `out-b1r2-light/d-cart-empty-repeat.png`: "Повторити замовлення" sits directly under "У каталог",
  no gap.
- `out-b1r2-light/m-cart.png` (390px): cross-sell renders correctly on mobile too.

## Known gaps / not verified
- No Chrome visual check was run (no browser session available in this pass); layout/contrast in
  both themes is untested beyond token-only styling review. Flag for a QA pass at 1440/390.
- Mini-cart and modal both use the header's existing popover surface convention
  (`bg-ink-850` + `border-[var(--hair-strong)]` + `shadow-[var(--shadow-pop)]`, copied from the
  header's own dropdown) since raw hairline-only surfaces aren't legible as floating overlays.
- Cart modal has no width/height cap tuned against real content overflow beyond `max-h-[88vh]`
  with internal scroll — not checked with a very long cart (10+ lines) in a browser.
- `header.tsx` currently fails `tsc` (`typewriterQueries`/`useTypedPlaceholder` undefined) — owned
  by another builder, left untouched per instructions.
