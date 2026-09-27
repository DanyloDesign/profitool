# 013 · Plan

- **Status:** phase 1 in progress
- **Owner decisions (2026-09-27):** the owner approved PR #1 and said "виконуй". Decisions 1–5 follow the proposal's recommendations: 1(a) hide products with a wrong-type photo and the "Mackita" photo until they have their own; 2(a) old price struck through in cart rows; 3 mini-cart shows the goods total without delivery; 4 "−" disabled at quantity 1; 5 honest demo confirmation with the order summary. Decisions 6–14 stay open.

## Phase 1

| Step | Who | Files | Check |
|---|---|---|---|
| 1a. `Product.image`, `imageOf()` prefers it; hide list for wrong photos; battery line in BuyBox, framed block removed | builder (Sonnet) | `src/data/types.ts`, `src/data/products.ts`, `src/lib/shop.ts`, `buy-box.tsx`, `product/[slug]/page.tsx` | hidden slugs absent from rails, catalog, search; PDP shows "Без акумулятора і зарядного" under stock |
| 1b. `orderTotals(items, method?)`, one total in header, mini-cart, cart, checkout; struck old price in rows; "4 товари" | builder | `shop.ts`, `cart-button.tsx`, `mini-cart.tsx`, `cart-view.tsx`, `checkout-form.tsx`, i18n | same sum in 4 places for one basket; rows add up |
| 1c. C.1–C.4: confirmation at top with focus and demo copy; pickup skips address; phone normalisation; tel/email types, aria-describedby, required marks | builder | `checkout-form.tsx`, i18n | 390×844 pickup order with `067 123 45 67` succeeds, confirmation in viewport |
| 1d. Per-model photos for the mismatched products → `/products/{slug}-photo.png`, contact sheet | photo agent (Sonnet) | `tools/products/*`, `public/products/*` | contact sheet reviewed by eye |
| 1e. Wire new photos into `Product.image`, unhide replaced products | me | `products.ts` | contact sheet, PDP screenshots |
| 1f. QA: eslint, tsc, smoke, screenshots 1512/390 both themes, static build; deploy; live check | me | — | green smoke, live site |

Phases 2 (D, E) and 3 (F, G, I) follow after phase 1 ships.

## Risks
- Photo sourcing may not find tool-only shots for every model; unmatched products stay hidden and are listed in the report.
- Low RAM on this PC: agents do not run `pnpm build` or a dev server in parallel.
