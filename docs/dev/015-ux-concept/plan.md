# 015 · UX concept · Plan

Owner's go-ahead (2026-09-27): «все братан, можешь это имплементировать на фронте, потом сделай PR».
Branch `feat/014-ux-concept` from `origin/master` at `96d45a9`. One PR from the `vladislavkovalskyi`
fork to `DanyloDesign/profitool`.

## Step 0 · Foundation (done in `4bd2dad` and the commit after it)

- `src/lib/search.ts`: one matcher for the header, the search page and `applyQuery`: section
  synonyms, Cyrillic brands, models without spaces, platforms, power, spec values. Every completion
  the panel offers returns products.
- `src/lib/card.ts`: `shortOf()` and `revealSpecs()` for the card reveal; `SHORT` overrides in
  `products.ts` for eight products.
- `kitKind()` / `kitBattery()` in `products.ts`, comparing kit items by value.
- `categoryPhoto()` in `shop.ts`: a real product photo per section for menus and home tiles.
- Motion tokens (`--dur-*`, `--ease-*`), per-stream i18n sections (`header`, `card`, `drawer`,
  `pdp`, `listing`) and per-stream CSS blocks at the end of `globals.css`.
- `tools/shots/chrome.mjs`: `CHROME_PATH` or the OS default, so the scripts run on macOS.

## Steps 1–4 · Four streams in parallel worktrees

Each stream owns its files. A stream does not edit another stream's files; it reads them.

| Stream | Owns | i18n sections | CSS block |
|---|---|---|---|
| A · Header and search | `layout/header.tsx`, `logo.tsx`, `city-select.tsx`, `support-menu.tsx`, `theme-toggle.tsx`, `use-popover.ts`, `search/*`, the `--header-*` variables | `header`, `nav`, `search` | `015 header` |
| B · Card and home | `catalog/product-card.tsx`, `product-section.tsx`, `platform-picker.tsx`, `app/[locale]/page.tsx` | `card`, `home` | `015 product card` |
| C · Cart drawer | `cart/cart-button.tsx`, `mini-cart.tsx`, `cart-modal.tsx`, new `cart-drawer.tsx`, `cross-sell.tsx`, `store/cart-ui.ts`, `app/[locale]/layout.tsx` (mount only) | `drawer`, `cart` | `015 cart drawer` |
| D · Product page and catalog | `app/[locale]/product/[slug]/page.tsx`, `product/*`, `catalog/catalog-view.tsx`, `filters.tsx`, `quick-chips.tsx`, `pagination.tsx`; in `shop.ts` only `relatedTo`, `parseQuery`, `queryToParams` and new filter lines in `applyQuery` | `product`, `catalog`, `pdp`, `listing` | `015 product page and catalog` |

What each stream builds (the canvas is the reference):

- **A.** From 1024px one header row, 72px: logo (mark 32, word 18), "Каталог", an open search
  field, a quiet utility cluster (city, language, theme as `bar-btn`, 14–15px), the remembered
  battery platform as a chip, wishlist, compare, cart. Row 1 disappears from 1024px; 768–1023 and
  phones keep their layout. The search panel: empty state with popular queries and sections;
  typed state with section hits first, completions with the completed part in bold, products with
  photo and price; ↑↓ Enter Esc, combobox ARIA. The mega menu uses `categoryPhoto()` and names
  platforms with their brand. `/search` drops its duplicate field and fills the header field.
- **B.** The card reveal: on hover or focus-within (pointer devices only) the photo steps back and
  a panel rises inside the photo frame with `shortOf()`, `revealSpecs()` and the kit line; Esc
  closes; price and button never move. The key line says "без АКБ" for bare tools; the brand line
  says "до твоїх батарей" when the product fits the remembered platform. Home: the kit line under
  the hero price, "Мої батареї" as a one-line picker right under the hero, section tiles with
  `categoryPhoto()` (8 in a row on desktop, 4×2 on phones), section links visible on phones.
- **C.** `announceAdded()` and the cart pill open a right drawer (desktop) or a bottom sheet
  (phones): item lines newest first with the kit line, free-delivery progress, one cross-sell,
  "Разом", "Оформити замовлення", "Продовжити покупки". It never closes by itself; Esc, the scrim
  and the close button close it; focus is trapped and returned. The cart pill flashes the brand
  gradient for 1.2s after an add. The mini-cart popover and the cart modal go away.
- **D.** Product page: four big figures, the calm kit line under the price, "Що в коробці" with ✓/✗
  (fixes the by-reference bug in `product-tabs.tsx`), sections stacked instead of tabs, the lead
  paragraph not repeated, SKU moved into the specs, a "Ще <розділ>" shelf from the same section,
  the sticky bar watching the buy button. Catalog: task chips for rotary hammers by impact energy
  (`?task=`), and the remembered platform offered as a one-tap filter.

Every stream checks its own work: `npx tsc --noEmit`, `pnpm exec eslint` on changed files,
screenshots at 1512 and 390 (light, plus one dark), `node tools/shots/smoke.mjs` against its own
dev server. Shots go to `docs/dev/015-ux-concept/shots/<stream>-*.png`.

## Step 5 · Merge, check, PR

Merge the four branches, resolve conflicts, then `npx tsc --noEmit`, eslint, the smoke test,
`GITHUB_PAGES=true pnpm build`, and screenshots of every changed page at 1512 and 390 in both
themes. Write `implementation.md`, push to the fork, open the PR.
