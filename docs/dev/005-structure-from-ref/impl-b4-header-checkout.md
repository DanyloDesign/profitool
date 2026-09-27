# B4 — Header (city + support) and checkout

## Files
- `src/store/location.ts` — new. Persisted `citySlug`/`customCity`, `CITIES` list (slug + `Localized`
  name), `cityName()`, `isFastDelivery()`.
- `src/components/layout/use-popover.ts` — new. Shared open/close state: Escape, outside click,
  focus-return to trigger. Used by both new components.
- `src/components/layout/city-select.tsx`, `src/components/layout/support-menu.tsx` — new. Button +
  popover, `fullWidth` prop for block placement (mega-menu footer, mobile menu).
- `src/components/layout/header.tsx` — edited: header row, `MegaMenu`, `MobileMenu`; typewriter
  placeholder (`typewriterQueries`, `useTypedPlaceholder`, `usePrefersReducedMotion`).
- `src/components/cart/checkout-form.tsx` — edited: buyer type, EDRPOU, alternate recipient, order
  composition block, installments payment, city preselect, `useLastOrder.save()` before `clear()`.
- `src/i18n/ua.ts`, `src/i18n/ru.ts` — added keys only inside `nav` and `checkout`.

## Crowding decision (1024–1280px)
Inline `CitySelect`+`SupportMenu` in the header row show only from `xl:` (1280px) — at `lg`
(1024–1279px) the catalog button + search bar already fill the row. Same two components are
duplicated as an `xl:hidden` row inside `MegaMenu`'s footer (reachable via the catalog button,
already visible from `lg`) and unconditionally in `MobileMenu` (<1024px). No extra bar was added
above the header — kept to the rejected-list constraint in `CLAUDE.md`.

## Search typewriter
`typewriterQueries()` builds 4–5 real queries: top-4 bestsellers (`brand model`) + first category
name. `useTypedPlaceholder` runs only while the input is empty and unfocused; returns `null` under
`prefers-reduced-motion` (read via `useSyncExternalStore`, matching `theme-toggle.tsx`'s pattern) or
when inactive, and the caller falls back to the static `dict.nav.searchPlaceholder`. Live suggestions
(`searchHints`) untouched.

## Checkout
Kept exactly 3 numbered steps (validation unchanged for existing fields):
- Step 1 (Contacts): added buyer type `<select>` (person/FOP/company, local state, not in the zod
  schema — same pattern as `method`/`payment`), EDRPOU field shown only for FOP/company
  (`superRefine`, 8-or-10-digit check), "recipient is someone else" checkbox revealing
  name+phone (also `superRefine`, only required when checked).
- Step 2: unchanged.
- Step 3 (Payment): added "Оплата частинами" choice (label + `payInstallmentsNote` aside, no
  invented bank terms). Added an unnumbered "order composition" sub-block (readonly lines +
  "Змінити" → `/cart`) above the existing comment textarea — satisfies the brief's "order comment
  textarea" ask by keeping the field that was already there, just relocated next to the new block.
- City field is preset once from `useLocation` (header selector) via `setValue` in an effect guarded
  by a ref, so the user's own edit afterwards is never overwritten.
- On success: `useLastOrder.getState().save(items, orderNumber)` runs before `clear()`.

## Support menu — missing pages
Reference wants "Замовити дзвінок", "Гарантія і сервіс", "Повернення і обмін", "Оптовим клієнтам",
"Статус ремонту" links. None of those pages exist in this project (checked `src/app/[locale]/*`:
only account/cart/catalog/checkout/compare/product/search/wishlist). Shipped only phone (`tel:`,
from `dict.common.phone`) and working hours (`dict.common.footerHours`) — both real, no dead links.

## Verify
- `npx tsc --noEmit` — clean.
- `npx eslint` on all files listed above — clean (fixed one `react-hooks/set-state-in-effect` in the
  reduced-motion effect by switching to `useSyncExternalStore`, and a `ReturnType<typeof setTimeout>`
  vs `window.setTimeout` type mismatch by using bare `setTimeout`/`clearTimeout`, matching
  `mini-cart.tsx`'s existing convention).
- No Chrome check run (no browser session in this pass) — not verified visually at 1440/390, no
  dark/light comparison. Flag for a follow-up QA pass, especially the `xl:` breakpoint math and the
  city/support popovers' position on narrow widths.
- `tools/shots/smoke.mjs` not run, only read: `#name/#phone/#email/#city/#branch` ids untouched, new
  fields (buyer type, EDRPOU, recipient, order composition) default to values that add no extra
  required alerts on empty submit — the ">=3 alerts" and success-path assertions should still hold.

## Fix round 1
Coordinator flagged (screenshot `d-minicart.png`): bordered "Київ"/"Підтримка ›" pills ate ~260px
at 1440, shrinking search to ~200px, contra `DESIGN.md`'s "search is the main header control, runs
full width". Also: typewriter fragments ("R", "Ryobi Cu") read oddly with no context.

**The "Crowding decision" section above is now stale** — measured real widths instead of guessing:
- Inline pills were never the fix; even fully removed, the header's fixed chrome (logo 184 + catalog
  148 + right-icon block 390, all pre-existing, none of it mine to shrink) leaves only ~330px for
  search at 1280 and ~156px at 1024 — under 360 either way. So inline city/support literally cannot
  coexist with a ≥360px search below `1440px`; `xl:` (1280) was wrong regardless of pill styling.
- Redesigned both to be compact: `CitySelect` inline = borderless text button (pin + city, 44px
  tall, `px-1.5`, truncated to `max-w-[64px]`); `SupportMenu` inline = icon-only 52px round button
  (phone icon, `aria-label="Підтримка"`), same popover. `fullWidth` prop (mega-menu footer, mobile
  menu) keeps the old bordered chip — plenty of room there.
- Inline pair now shows only at `min-[1440px]:`, pulled toward the catalog button with `-ml-6`
  instead of the header's own `gap-7` (28px) — recovers the header's per-sibling gap tax. Restored
  the mega-menu-footer fallback (was wrongly deleted mid-fix), now gated `min-[1440px]:hidden` so it
  fills the whole `1024–1439px` gap; `MobileMenu` (<1024px) unchanged.
- Search placeholder gets a static `dict.nav.searchTypingPrefix` ("Шукати: "/"Искать: ") in front of
  the typed fragment, so mid-word/mid-erase frames read as "Шукати: R" instead of a bare "R".

Measured with `puppeteer-core` against the running dev server (`localhost:3000`, Chrome at
`C:/Program Files/Google/Chrome/Application/chrome.exe`), search `<form role="search">` width via
`getBoundingClientRect()`:

| Viewport | Search width | City/support inline |
|---|---|---|
| 1440 | 368px | visible |
| 1280 | 330px | hidden (mega-menu footer has them instead) |
| 1024 | 138px | hidden (mega-menu footer has them instead) |

1280/1024 stay under 360 with or without the header pills — pre-existing structural ceiling from
the right-icon block + catalog button, out of this task's file ownership. Not re-verified in a real
Chrome session beyond these scripted screenshots (`out-fix1/header-{1440,1280,1024}.png`,
`out-fix1/mega-1280.png`, `out-fix1/mobile-menu.png`) — no manual hover/focus/dark-mode pass this
round. `npx tsc --noEmit` and `npx eslint` on all touched files: clean.

## Fix round 2
Review items 3 (checkout part), 4, 10, 17, 18 + a pre-existing 1024px search-width ask.

- **#4 removed "Оплата частинами" entirely** (`checkout-form.tsx`): dropped from the `Payment`
  union, its `Choice`, and the `payInstallments`/`payInstallmentsNote` i18n keys (both locales).
  `CLAUDE.md` (line ~197) explicitly lists it as cut for lack of function, back only on the owner's
  word — it isn't given, so it stays out.
- **#3 removed the "Склад замовлення" readonly list** from the left column (it duplicated the right
  summary). Instead added a small header row above the summary's item list: `dict.cart.label`
  ("Товари в кошику") + a "Змінити" link to `/cart`, reusing the `changeCart` key from round 1 that
  had become orphaned by this change. Also dropped the now-unused `orderComposition` i18n key.
- **#18 invoice label now matches buyer type**: `payInvoice` is now the neutral default
  ("Безготівковий рахунок"/"Безналичный счёт"), plus new `payInvoiceFop`
  ("Рахунок для ФОП"/"Счёт для ФЛП" — RU matches the `buyerFop` term from round 1) and
  `payInvoiceCompany` ("Рахунок для компанії"/"Счёт для компании"). `invoiceLabel` is picked in
  `CheckoutForm` from `buyerType` and passed to the `Choice`.
- **#10 popovers now align left edge to trigger**: both `CitySelect` and `SupportMenu` dropped the
  `lg:left-auto lg:right-0` variant that was anchoring the popover by its *right* edge — with a
  280px-wide popover over a ~70px trigger, that overhung ~200px to the left of the button, which is
  exactly the bug (popover appeared under "Каталог" instead of under the trigger). Now always
  `left-0`. Verified by comparing trigger and popover `getBoundingClientRect().left` — both match
  exactly (city 436/436, support 502/502 at 1440px, screenshots `out-fix2/pop-city.png`,
  `pop-support.png`). Custom-city row now stacks the input full-width with "Обрати" full-width below
  it instead of side-by-side (`grid` instead of `flex`) — placeholder no longer truncates. Support
  hours wrapped in `<span className="whitespace-nowrap">` so "09:00–19:00" never breaks mid-range;
  did not edit `dict.common.footerHours` itself (non-breaking hyphen in the string) since `common` is
  outside this task's owned i18n sections — CSS achieves the same visible result without touching it.
- **#17 typewriter never shows a bare prefix**: `useTypedPlaceholder` now returns `null` (not `""`)
  whenever the current word is empty — covers both the pre-first-tick delay and the pause between
  words while erasing/retyping — so the caller falls back to the full static placeholder instead of
  rendering "Шукати: " alone.
- **Pre-existing 1024px search-width ask**: moved the account icon and theme toggle out of the
  header row for `1024–1279px` (wrapped in a `contents lg:hidden xl:contents` div — `contents` keeps
  them as direct flex children of the icon row when shown, so no extra gap is spent on the wrapper),
  and added them to the `MegaMenu` footer next to city/support, gated `xl:hidden` (that footer is
  only reachable once "Каталог" is clicked, itself only available from `lg`, so effectively shows
  exactly in the `1024–1279px` window). At `≥1280px` (`xl:contents`) they're back in the header,
  unchanged from before this round.

Measured (same method as round 1) at the requested widths:

| Viewport | Search width | Account/theme in header row |
|---|---|---|
| 1024 | 242px (was 138px) | hidden — in mega-menu footer instead |
| 1280 | 330px (unchanged) | visible (≥1280 unchanged, as asked) |
| 1440 | 368px (unchanged) | visible |

1024 improved by exactly the 104px freed (52px account + 52px theme, confirmed by removing them
from the DOM count), landing at 242px — short of the requested "≥260px". The remaining gap is the
same structural ceiling as round 1 (logo + catalog button + cart button + lang switch, none of it
mine to shrink); reaching 260 would need touching elements outside this task's named scope (only
"account icon and theme toggle" were asked to move). Reporting the real number rather than closing
the gap by touching un-asked-for elements.

Screenshots: `out-fix2/header-{1024,1280,1440}.png`, `out-fix2/mega-1279.png` (mega-menu footer with
both fallback rows), `out-fix2/pop-city.png`, `out-fix2/pop-support.png`,
`out-fix2/checkout-1440-{light,dark}.png`, `out-fix2/checkout-390-{light,dark}.png` (cart seeded with
one item first — an empty cart short-circuits to the empty state, not the form). No console/page
errors in any capture. Also spot-checked buyer-type → invoice-label switching interactively
(fop/company/person all render the right label).

Blocked ~6 minutes mid-verification: another builder's concurrent edit to `src/components/catalog/filters.tsx`
(unterminated regexp literal) 500'd the whole dev server; waited for it to self-resolve rather than
touch a file outside this task's ownership. `npx tsc --noEmit` still reports two errors from other
builders' in-progress files (`catalog/filters.tsx` syntax error, `product.toCart` key mismatch between
`ua.ts`/`ru.ts`) — neither in `nav`/`checkout` or any file this task owns. `npx eslint` on all files
touched this round: clean.
