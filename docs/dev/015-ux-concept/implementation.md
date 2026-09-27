# 015 · UX concept · Implementation

- **Date:** 2026-09-27
- **Branch:** `feat/015-ux-concept` (from `origin/master` at `96d45a9`), PR from the `vladislavkovalskyi` fork
- **Canvas:** https://claude.ai/artifact/MqHdx1bJGYbBCJWx3YZEWX

## How it was built

One foundation commit, then four streams in parallel git worktrees, each owning its own files, then
a merge with checks on the merged tree. No merge conflicts: every stream wrote its i18n keys and CSS
into its own section, which the foundation laid out in advance.

| Step | Commits | What |
|---|---|---|
| Foundation | `4bd2dad`, `2257028` | `src/lib/search.ts`, `src/lib/card.ts`, `kitKind()`/`kitBattery()`, `categoryPhoto()`, motion tokens, per-stream i18n and CSS sections, `tools/shots/chrome.mjs` |
| A · Header and search | `6b5e779`, `3e311ee` | One-row desktop header, search panel, mega menu with photos, platform chip |
| B · Card and home | `c8f8da9`, `524fad9`, `8cfe31f` | Card reveal, "без АКБ" key line, compatibility mark, battery row, photo tiles |
| C · Cart drawer | `53c1415` | Drawer and phone sheet instead of the mini-cart and the modal |
| D · Product page and catalog | `eaa3019`, `54fc77f` | Kit truth, box contents, stacked sections, task pills, platform suggestion |
| Merge fixes | `4e7f54d`, `1573839` | Smoke test for the modal drawer; phone tiles as photo rows; DCD791D2 batteries |

## What the buyer gets

**Search** (`src/lib/search.ts`, `src/components/search/`)
- One matcher for the header, `/search` and the catalog. It understands section names and common
  words ("болгарка", "КШМ", "шуруповерт", "дрель"), Cyrillic brand names ("Макіта", "бош"), models
  typed with spaces ("DDF 484"), platforms ("M18", "LXT"), power ("акумуляторний") and spec values.
  Every word of the query has to find something.
- A script test on the merged code: "шурупокрут" 6, "перфоратор" 7, "болгарка" 6, "КШМ" 6, "каска" 6,
  "Макіта" 12, "DDF 484" 1, "M18" 5, "qwerty" 0. Every completion the panel offers returns products.
- The panel: popular queries and sections when empty; section hits, completions with the completed
  part in bold and up to 3 products when typed; ↑↓ Enter Esc; combobox ARIA; a no-results state.
  `/search` lost its duplicate field on phones and fills the header field with the query.

**Header** (`src/components/layout/header.tsx`)
- From 1024px one row, 72px instead of 121px: logo (mark 32px), dark "Каталог" pill, open search,
  quiet utility cluster, platform chip, wishlist, compare, cart pill. Tablets and phones keep their
  layout.
- The mega menu shows real product photos per section and platforms as "Makita · LXT 18V" with counts;
  a click saves the platform and opens the filtered catalog.

**Product card** (`src/components/catalog/product-card.tsx`)
- On pointer devices from 1024px, hover or keyboard focus makes the photo step back and reveals a short
  line, three specs and the kit line inside the photo frame. Nothing below moves, no neighbour is
  covered, Esc closes it, reduced motion gets a fade.
- The key line keeps "без АКБ" visible on every bare tool; the brand line says "до твоїх батарей" when
  the product fits the remembered platform.

**Home** (`src/app/[locale]/page.tsx`, `platform-picker.tsx`)
- The hero states the kit truth under the price. "Мої батареї" moved from the bottom of the page to
  right under the hero as a one-row picker with counts and a link to the filtered catalog.
- Section tiles use real photos: 8 in a row on desktop, photo rows in two columns on phones (names fit
  whole in both languages). Section links are visible on phones.

**Cart** (`src/components/cart/cart-drawer.tsx`)
- "У кошик" and the cart pill open a right drawer (phones: a bottom sheet with a drag handle). It stays
  until the buyer closes it, traps focus, closes on Esc, scrim or the close button, returns focus.
  Inside: lines with the kit line and a stepper, free-delivery progress, one cross-sell, total,
  "Оформити замовлення", "Продовжити покупки", "Відкрити кошик".
- The cart pill flashes the brand gradient for 1.2s after an add. The mini-cart popover and the cart
  modal are gone.

**Product page** (`src/app/[locale]/product/[slug]/page.tsx`, `src/components/product/`)
- Four big figures, one short lead instead of the repeated description, the kit line right under the
  price (green when it fits the remembered platform), delivery, pickup with hours, warranty, returns.
- "Що в коробці" with ✓/✗: bare tools list "Акумулятор ✗" and "Зарядний пристрій ✗". This also fixes
  the old by-reference comparison that showed "Без акумулятора і зарядного" with a ✓.
- Sections stacked instead of tabs (accordions on phones); SKU and warranty moved into the specs.
- The phone buy bar watches the buy button, so price and "У кошик" are on the first screen at 390×844.
- "Ще перфоратори": the same section first.

**Catalog** (`src/components/catalog/`)
- Rotary hammers get "Під яку роботу" pills by impact energy (`?task=home|daily|heavy`).
- A remembered platform shows up as one dashed chip "+ Лише під мої M18".
- Filter counts follow the other active filters and disable options with 0; price chips read
  "до 12 000 ₴"; the phone sort select has a label and short options.

**Data**
- `short` lines for eight products whose first sentence runs past two card lines.
- DeWalt DCD791D2 kit: two batteries of 2,0 Ah, matching its spec (was 5,0).

## Checks on the merged branch

| Check | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `pnpm exec eslint src` | clean |
| `node tools/shots/smoke.mjs` | 30/30 (two new checks: the drawer opens after an add and closes on Esc) |
| `GITHUB_PAGES=true pnpm build` + `postexport` | builds all pages |
| Screenshots 1512 and 390, both themes | `shots/final-*.png` plus per-stream `a-*`, `b-*`, `c-*`, `d-*` |

Every stream also ran tsc, eslint, the smoke test and its own screenshots against its own dev server.

## Where the build differs from the canvas

- The kit chooser, the battery slot, "Пасує до нього" with placeholders and extra photos stay out:
  the shop has no kit variants, no batteries and one photo per product.
- The card reveal starts at 1024px. At 768–1023 the home cards are about 142px wide and the panel
  does not fit.
- The header hides the account icon from 1024px (it stays in the footer, on tablets and phones), and
  the mega menu dropped the brand chips, as on the canvas.
- On the product page the quantity stepper moved to the cart and drawer.
- On rotary hammers the "Енергія удару" filter group gives way to the task pills; they used different
  thresholds (2,6 J against 2,5 J) and contradicted each other.
- Horizontal filters from the canvas were not built; the catalog keeps its sidebar.

## Left for later

- Horizontal filters and a live "Показати N" count while toggling on phones.
- Accessories by fit (needs shank and disc attributes), batteries and kit variants (a stock decision).
- One key spec per category, overlapping spec ranges, the catalog root sort, short breadcrumbs,
  folding the compare bar into the phone buy bar (013, workstream F and E leftovers).
- Unused dictionary keys left by the removed mini-cart and tabs.
