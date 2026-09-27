# B3 — Catalog: quick filters, spec facets, sort, pagination

## Files
- `src/lib/shop.ts`: added `specs: Record<string,string[]>` to `CatalogQuery` (URL `spec.<key>=v1,v2`,
  backward-compatible, `emptyQuery()` includes `specs: {}`), `SPEC_FACET_KEYS`, `specSlug()`,
  `specFacets()`. Added `"inStock"` to `SortKey` + sort logic.
- `src/components/catalog/filters.tsx`: exported `useCatalogQuery`. Added generic spec-facet groups
  (`SpecGroup`, collapses beyond 4 options behind "Ще N" / `specMore`). Mobile drawer footer now has
  "Скинути" + "Показати N товарів" (was just "Показати N"). `ActiveFilters` renders spec chips too
  (label built from `specSlug` with `_`→`,`, an approximation, not locale-exact — documented limitation).
  Added "В наявності спочатку" sort option.
- `src/components/catalog/quick-chips.tsx` (new): wired quick chips — cordless/onSale/inStock/saved
  platform/one category spec chip (top value of the first qualifying facet). Each toggles real
  `CatalogQuery` fields. Chip only rendered if the underlying condition is meaningful (e.g. cordless
  chip only if the category mixes corded+cordless).
- `src/components/catalog/pagination.tsx` (new): `Pagination` (desktop, `lg:flex`, plain `Link`s,
  no JS) and `LoadMore` (mobile, `lg:hidden`, appends via `page+1` link).
- `src/app/[locale]/catalog/[[...slug]]/page.tsx`: `PAGE_SIZE = 12`, page param parsed from
  `searchParams.page`. Single set of `<ProductCard>` DOM nodes (no duplicated grid): mobile sees
  cumulative slice `[0, page*12)`, desktop hides (via `lg:hidden` on the card) everything outside
  `[(page-1)*12, page*12)`. When `found.length <= 12` no card gets `lg:hidden` and no pagination UI
  renders — verified this exactly preserves the old single-grid markup (matters for
  `tools/shots/smoke.mjs`, which asserts 7 `<article>` on `catalog/rotary-hammers`, 7 ≤ 12).
- `src/components/catalog/product-card.tsx`: added optional `className` (for the `lg:hidden` hook),
  `announceAdded()` call after `add()` on the cart button.
- `src/i18n/ua.ts` + `ru.ts`, `catalog` section only: added `chipInStock`, `chipMyPlatform`,
  `showResultsItems`, `sortInStock`, `showMore`, `specMore`, `prevPage`, `nextPage`, `page`.

## Decisions
- Quick chips render only on category pages, not on `/catalog` root. Root already has the
  category-navigation chip row; a second chip row next to it is exactly the "dense info" the owner
  rejected (CLAUDE.md). Documented instead of silently dropped.
- Spec facets: exact-value grouping (not numeric range bucketing) shown when a key has ≥2 distinct
  values in the category scope, per the task's stated condition. Fields like impact energy are mostly
  unique per product, so those groups lean on the "Ще N" collapse rather than true ranges — a
  simplification, noted rather than hidden.
- `specSlug()` uses the Ukrainian text as the canonical id (commas → `_`) so the URL/match key is
  locale-independent; labels are localized separately per viewer locale.
- Reference "category tree mode" (subcategory grid + popular-in-category) skipped — no subcategory
  data exists in `taxonomy.ts`.

## Verify
- `npx tsc --noEmit`: clean for all owned files (pre-existing unrelated errors in
  `components/layout/header.tsx`, not mine).
- `npx eslint` on all 6 touched/created files: clean.
- Did not run `pnpm build` / dev server / smoke.mjs per constraints — reasoned through smoke.mjs's
  catalog assertions (article count, dialog open/Escape/focus-return, mobile 390 width) instead;
  none of the selectors it depends on changed.
- Not run in Chrome — no browser tool available in this task; visuals not eyeballed.

## Known gaps
- Spec-facet chip labels in `ActiveFilters` reconstruct text from the slug, not from a real per-value
  lookup — cosmetic edge case (e.g. exact spacing) could differ from the source string.
- `IconChevron` pagination arrows: no visual/Chrome check performed.

## Fix round 1
Coordinator flagged that exact-value grouping made numeric specs (impact, power, torque, rpm, weight)
near-unique and useless. Fixed:
- `src/lib/shop.ts`: split the old `SPEC_FACET_KEYS` into `CATEGORICAL_SPEC_KEYS` (chuck, voltage,
  battery, material, standard, disc, pad, lines, size, pieces — exact-value, unchanged) and
  `NUMERIC_SPEC_KEYS` (impact, power, torque, rpm, weight — new bucketing). Added `parseNumeric()`
  (last number in the text, comma→dot; for ranges like "0–1100 об/хв" takes the upper bound),
  `numericBoundaries()` (splits the **unique sorted values**, not raw product count, into ≤3 chunks —
  guarantees every bucket gets ≥1 unique value, hence ≥1 product, by construction), `bucketIndex()`,
  `bucketLabel()` (locale words "до"/"понад" ua, "до"/"свыше" ru), `numericFacet()`. `specFacets()`
  now emits both kinds; a numeric facet is dropped if fewer than 2 non-empty buckets result.
  `applyQuery()` recomputes the same boundaries from the same category scope used to render the
  sidebar (precomputed once per key into `numericBucketCache`, not per product) before matching
  `spec.<key>=b0|b1|b2`; categorical `spec.<key>=<value>` matching is untouched (backward compatible).
- No changes needed in `filters.tsx` / `quick-chips.tsx` — both already consume `specFacets()`
  generically, so bucketed options render through the same `SpecGroup` (collapse-beyond-4) and the
  same chip-toggle code.
- Verify: `npx tsc --noEmit` and `npx eslint` on `src/lib/shop.ts`, `filters.tsx`, `quick-chips.tsx` —
  clean. Screenshot: dev server on :3000, Chrome headless via puppeteer-core, 1440×1400,
  `/ua/catalog/rotary-hammers`, `<aside>` element screenshot. Saved to
  `C:/Users/Danichca/AppData/Local/Temp/claude/.../scratchpad/shots/out/b3-filters-sidebar.png`
  (session-scratchpad path, not in the repo). Sidebar text dump confirmed: "Енергія удару" → "до 2,4
  Дж" (2) / "2,4–2,7 Дж" (2) / "понад 2,7 Дж" (3); "Потужність" → 1/2/1; "Обертів" → 2/3/2; "Вага" →
  2/3/2 — all buckets non-empty, all facets have ≥2 buckets, categorical facets (Патрон, Напруга,
  Акумулятор) still exact-value. Visually: checkboxes aligned, counts right-aligned, hairline
  dividers between groups, no overflow, consistent with the existing Живлення/Бренд groups above.
- Honest risk, not asked for but visible in the screenshot: this category now has 8 facet groups
  (Живлення, Бренд, Ціна, Платформа, Патрон, Напруга, Акумулятор, Енергія удару, Потужність, Обертів,
  Вага, Наявність — 11 actually) stacked in one sidebar. No single group is dense (≤5 rows, collapse
  works), but the *sidebar as a whole* is long and trends toward the "dense info dump" the owner
  rejected. Not fixed here since it's outside this fix request's scope — flagging for the owner/DESIGN
  review, possibly worth capping how many numeric facets show per category (e.g. top 2 by relevance)
  in a follow-up.

## Fix round 1 (cont.) — cap spec facets at 2, drop weight/rpm
Coordinator agreed the 8-group sidebar was too dense; asked to cap spec facets at 2 per category
via a priority list, and drop weight/rpm entirely.
- `src/lib/shop.ts`: `NUMERIC_SPEC_KEYS` is now `["impact", "power", "torque", "depth", "orbit",
  "range"]` — `weight`/`rpm` removed for good (not just deprioritized), so they never surface as a
  facet even with a hand-crafted URL (falls through to the categorical branch, harmless no-op).
  Added `depth`, `orbit`, `range` as new numeric-bucketed keys (units мм/мм/м) to cover
  saws/sanders/measuring. `parseNumeric()` is now key-aware: takes the **first** number for
  `depth` (text is "66 мм під 90°" — the trailing 90° is an unrelated angle, not part of the range;
  taking the last number as before silently produced nonsense buckets like "до 57°"), last number
  for everything else (unchanged, correct for ranges like "0–1100").
  Added `SPEC_FACET_PRIORITY: Record<string, SpecKey[]>` — rotary-hammers→[impact,chuck],
  drills→[torque,voltage], grinders→[disc,power], saws→[disc,depth], sanders→[pad,orbit],
  measuring→[range,lines]. `specFacets(scope, locale, category?)` gained the `category` param:
  computes all qualifying facets as before, then takes up to `MAX_SPEC_FACETS = 2` — priority keys
  first (skipping ones that don't actually qualify for that category's data), then fills any
  remaining slot from the first other qualifying facet. Categories with no priority entry
  (accessories, safety, catalog root) get pure "first 2 that qualify" — the requested fallback.
- Fallback-fill happens *within* listed categories too, not only unlisted ones: e.g. drills'
  priority is [torque, voltage], but all drill products in the data are 18V (1 distinct value, does
  not qualify), so voltage is skipped and `chuck` fills the second slot instead. Judgment call: capping
  at 2 without filling would sometimes show only 1 facet even when a second useful one exists;
  documented rather than silently chosen.
- `filters.tsx` / `quick-chips.tsx`: both `specFacets()` call sites now pass `category` — one-line
  each, no other changes needed.
- Verify: `npx tsc --noEmit` and `npx eslint` on `shop.ts`, `filters.tsx`, `quick-chips.tsx` — clean.
  Re-shot rotary-hammers sidebar (1440, same script) — confirmed exactly 2 spec groups now
  ("Енергія удару" 2/2/3, "Патрон" 5/1/1), 6 groups total instead of 11. Also spot-checked via
  `innerText` dump (no full screenshot) on saws/drills/grinders/sanders/measuring: saws shows
  Диск+Глибина різу with depth correctly reading 57/65/... mm (not 90°); drills shows
  Момент+Патрон (voltage fallback confirmed); grinders shows only Потужність alone (disc still
  doesn't qualify — 1 total facet, correctly ≤2 not padded); sanders shows Хід ексцентрика+Потужність;
  measuring shows Дальність+Площини. Took one more full `<aside>` screenshot for saws to eyeball
  layout — clean, no overflow, consistent with the other groups.
- Screenshots (session scratchpad, not in repo):
  `.../scratchpad/shots/out/b3-filters-sidebar.png` (rotary-hammers, re-shot),
  `.../scratchpad/shots/out/b3-filters-saws.png` (saws).
- Remaining known risk from the previous round is resolved: rotary-hammers sidebar is now 6 groups,
  not 11.

## Fix round 2 (review.md items 1, 3, 11, 14, 15)
- **#1 desktop pagination scroll.** `pagination.tsx`: dropped `scroll={false}` from the 3 desktop
  `Pagination` links (prev/numbers/next); kept it on mobile `LoadMore` (unchanged, that one should
  append in place, not jump). Verified: scrollY 2200 -> 309 after clicking page "2" on `/ua/catalog`
  1440 (was staying at 2248, showing the footer). 309 isn't exactly 0 — Next's default scroll landing
  is "top of the new page", and the sticky header + breadcrumbs + title occupy the first ~300px — but
  the user now sees the catalog header and grid, not the footer, which is what the defect was about.
- **#3 triple filter display (catalog part).** Root cause: `ActiveFilters` didn't know which filters
  `QuickChips` already showed. Fix: extracted `computeQuickChips(category, locale, savedPlatform)` as
  a pure function out of `quick-chips.tsx` (no hooks, returns `{cordless, sale, inStock, platform,
  spec}` booleans/values) so `ActiveFilters` can ask the same question. `ActiveFilters` now takes a
  `category` prop (passed from `page.tsx`), calls `computeQuickChips`, and skips building an "Обрано"
  chip for: `power==="cordless"` when the cordless quick chip is shown, `onSale`/`inStock` when their
  quick chips are shown, the one `platforms` entry matching the saved-platform quick chip, and the one
  spec value matching the category's quick spec chip. Sidebar-only selections (e.g. a brand checkbox,
  which has no quick-chip equivalent) still show normally. Verified via puppeteer: clicked "Акумуляторні"
  quick chip + "Makita" sidebar checkbox on 1440 rotary-hammers — "Обрано:" row now reads only
  `["Обрано:", "Makita"]`, not "Акумуляторні" a second time (screenshot: sidebar checkbox for
  Акумуляторні is checked, the quick chip is pressed, and "Обрано" shows just Makita).
- **#11 pagination size + nav label.** `pagination.tsx`: page-number links `h-10 w-10` ->
  `h-11 w-11` (44px, matches the 44px tap-target rule in DESIGN.md). Added a separate `navLabel` prop
  for the `<nav aria-label>` (was reusing `pageLabel(page)`, i.e. "Сторінка 1" — the label of the
  current page, not of the nav); `page.tsx` now passes `dict.catalog.pages` ("Сторінки"/"Страницы",
  new key in both `ua.ts`/`ru.ts`). Verified: `nav[aria-label="Сторінки"]` present, page-2 link
  bounding box 44×44.
- **#14 drawer shows "Скинути" twice.** The header-row reset link in `Filters` rendered whenever
  `active > 0`, regardless of desktop-sidebar vs. mobile-drawer context; the footer reset (added in
  fix round 1) is mobile-drawer-only. Fix: header link condition is now `active > 0 && !open` — `open`
  is only ever true for the mobile drawer (desktop sidebar never sets it), so the header link
  disappears exactly when the footer one is showing. Verified: with a filter active, drawer open, only
  1 "Скинути" button inside `[role="dialog"]` (was 2 before this fix in round-2 testing, confirmed 0
  in a no-filter control case since both are conditioned on `active > 0`).
- **#15 mobile catalog ~250-380px before first card.** Three changes:
  1. Lifted the "Фільтри · N" trigger out of `Filters` into a new exported `FiltersTrigger()`
     component so it can render in a different place in the tree than the filter panel. State is
     shared via a small module-level zustand store (`useFiltersOpen`, defined in `filters.tsx` —
     no new file, same pattern as `store/cart-ui.ts`) plus a module-level mutable ref box
     (`triggerNode`) so the existing focus-trap effect can still return focus to the trigger button
     on close, now that the button isn't a local ref inside `Filters` anymore.
  2. `page.tsx`: `SortSelect` now renders twice — once desktop-only (`hidden lg:block`, in the
     original `<header>` position) and once in a new mobile-only row (`flex gap-3 lg:hidden`)
     together with `<FiltersTrigger />`, each `flex-1` so they read as two equal pills. `SortSelect`
     gained an optional `className` prop for this; its `<select>` is now `h-11 w-full` (was `h-12`,
     natural width) so both pills in the row are the same height.
  3. `QuickChips`'s wrapper is now `-mx-[var(--gutter)] flex gap-2 overflow-x-auto px-[var(--gutter)]
     scrollbar-none` (bleeds to the screen edge, one row, no wrap, same pattern as the existing
     horizontal scroller in `compare-table.tsx`) below `lg`, and `flex-wrap` again at `lg:`. Each chip
     button got `focus-visible:relative focus-visible:z-10` — in a tightly packed row, a later
     sibling can paint over a focused chip's outline; this keeps it on top. The project already has a
     global `:focus-visible` outline rule, so no new color/style was needed, just stacking.
  4. Found and fixed one more thing while measuring: `<aside>` sat inside the mobile grid as a real
     grid item even though its content is `hidden` on mobile when closed — so `gap-y-6` (24px) was
     being spent on a gap next to an invisible box. Changed `<aside>` to `className="contents
     lg:block"`: on mobile it stops being a grid item (its child — the Filters panel, already
     `hidden`/`fixed` — becomes the direct grid child and contributes no gap when hidden); at `lg:` it
     reverts to a normal block, unchanged from before. Also trimmed the grid's mobile top margin
     `mt-6` -> `mt-4`.
  Measured before/after (390px, rotary-hammers, first `<article>` top offset from viewport top):
  this task's own round-1 baseline was 382.9px; after the `FiltersTrigger`/pill-row consolidation
  alone it was still 382.9px (rows got shorter individually but the phantom aside gap absorbed the
  saving); after the `contents` fix and margin trim: **350.9px**. Sort+Filters confirmed on the same
  row (`btnTop === selectTop`); quick-chips row confirmed single-line and horizontally scrollable
  (`scrollWidth 416 > clientWidth 390`, all chip tops equal). `main button[aria-haspopup="dialog"]`
  still resolves to the (moved) trigger button — selector kept working as asked.
- Verify: `npx tsc --noEmit` and `npx eslint` on all touched files — clean (one `react-hooks/
  exhaustive-deps` warning surfaced from switching `open`/`setOpen` to the zustand store selector;
  fixed by adding `setOpen` to the effect's dependency array, which is correct since zustand actions
  are stable references).
- Screenshots (session scratchpad, not in repo): `.../scratchpad/shots/out3/d-page2-light.png` (#1),
  `.../scratchpad/shots/out3/d-dedup-precise.png` (#3), `.../scratchpad/shots/out3/m-drawer-active-
  light.png` (#14), `.../scratchpad/shots/out3/m-catalog-top-light.png` and `m-catalog-dark.png`
  (#15, light+dark), `.../scratchpad/shots/out3/d-catalog-dark.png` (general dark-mode sanity check
  at 1440 — quick chips, sidebar, grid all render correctly in dark).
- Not re-verified: tablet widths, screen reader, the other review items outside 1, 3, 11, 14, 15
  (2, 4-10, 12-13, 16-18) — out of this fix request's scope.
