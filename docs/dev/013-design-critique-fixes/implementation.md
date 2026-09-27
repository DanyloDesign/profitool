# 013 · Implementation

## Phase 1 (2026-09-27): photos, totals, checkout

Owner decisions 1–5 taken from the proposal's recommendations after the owner approved PR #1 ("виконуй"). See `plan.md`.

### Done
- **A. Photo per product.** `Product.image`; `imageOf()` prefers it. 19 products got their own packshot `/products/{slug}-photo.png` (`photo-report.md`, `shots/photo-contact-sheet.png`): the 8 wrong-type/"Mackita" photos, the shared Makita/Bosch photos and bare tools that showed batteries. Three extra wrong-type photos found and fixed: Milwaukee M12 3PL, Metabo KS 18 LTX 57, Ryobi R18CS7. `HIDDEN_UNTIL_PHOTO` is empty now, so no product is hidden. Rozetka was behind a Cloudflare check; photos come from manufacturer sites and other retailers.
- **Battery line.** "Без акумулятора і зарядного" under the stock line in the BuyBox; the framed block on the product page is gone. Fixed a builder bug: the kit was compared by reference, which never matches after server→client serialisation.
- **B. One total.** `orderTotals(items, method?)` in `shop.ts` feeds the header, mini-cart, cart and checkout. Checked: one basket shows 9 780 ₴ in all four; 10 530 − 750 = 9 780. Old price struck through in rows. Mini-cart title counts pieces.
- **C.1–C.4 Checkout.** Confirmation at the top with focus on its h1 and honest demo copy plus order summary; pickup hides city and address; phone accepts `067 123 45 67` and other common formats; `type="tel"`/`type="email"`, `aria-describedby`, required marks; "−" disabled at quantity 1. Fixed a label/value overlap in the confirmation summary at 390.

### Verification
- `pnpm exec tsc --noEmit`, eslint on changed files: clean.
- `node tools/shots/smoke.mjs`: 28/28.
- Puppeteer on the dev server, 1512 and 390, light and dark: `shots/p1-*.png`. No console errors, no broken images in 5 categories.
- Chrome extension check: not run.

### Scores
Hierarchy 7, typography 7, colour 7, spacing 7, originality 5 (fixes, no new form), fit to brief 8.

### Known defects
- Bosch GEX 125-1 AE (corded) photo may show a cordless model; it was not in the replacement list. Needs a look.
- DDF484Z and GSR 18V-55 packshots show the battery as a translucent ghost (manufacturer render). The battery line explains it, but the owner should confirm.
- DHR243Z and HR001GZ photos may include a battery on the tool; check against the contact sheet.
- Two photos were edited by the agent (promo sticker removed on M18 FPD2, bundle crop on M12 3PL). Image rights for a public launch are still open.
- A text "Прибрано з кошика: …" appears in the page text after an order; source not checked.
- Catalog sort label truncates at 390 ("Спочатку по"): phase 2, workstream E.
