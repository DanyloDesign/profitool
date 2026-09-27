# Current site map (explorer report, 2026-09-21)

Routes: `/`, `/catalog/[[...slug]]`, `/product/[slug]`, `/search`, `/cart`, `/checkout`, `/compare`, `/wishlist`, `/account` under `[locale]` = ua | ru.

## Pages
- Home: hero product → categories grid → sale rail → bestsellers rail → new rail → PlatformPicker.
- Catalog: breadcrumbs → title, count, SortSelect → category chips (root only) → Filters aside + ActiveFilters + grid / EmptyState.
- Product: breadcrumbs → brand, title, sku, description, image + sticky BuyBox → no-battery notice → specs → kit → related rail.
- Search: title → mobile SearchBox → count → grid / EmptyState.
- Cart: page only, qty stepper, remove, free-delivery progress, totals.
- Checkout: 3 steps (contacts, delivery Nova Post/courier/pickup, payment) + summary, demo submit → success with order number.
- Compare: table, "only differences", remove per column, add to cart.
- Wishlist: grid / EmptyState.
- Account: login + register UI, no backend (stub notice).

## Features
- Header: sticky; desktop MegaMenu (categories, platforms, brands); mobile full-screen menu; SearchBox with top-5 suggestions from 2 chars; badges for compare/wishlist/cart; lang switch; theme toggle.
- Filters: URL-driven; brand/platform/power checkboxes with counts, price range, in-stock/on-sale, saved-platform chip; mobile full-screen dialog.
- Product card: compare (max 4), wishlist, add to cart with in-cart state, badges, stock states.
- Compare bar: fixed bottom, site-wide except /compare.
- Platform picker: persisted battery platform, drives compatibility in BuyBox.
- State: zustand + localStorage (cart, compare, wishlist, platform).

## Gaps
- No toasts. No cart drawer. No quick view. Account and checkout have no backend. Search is substring only.

## Data
- `src/data/types.ts:58` Product; `src/data/products.ts` 49 products; `src/data/taxonomy.ts` 6 brands, 7 platforms, 8 categories.
