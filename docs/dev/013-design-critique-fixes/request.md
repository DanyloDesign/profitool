# 013 · Fixes from the design critique

- **Opened:** 2026-09-27
- **Phase:** PROPOSAL, waiting for the owner's decisions (see "Open questions")

## Request (verbatim)

The owner's first message, which started the critique:

> Привет! Разберись с дизайном.
> Мне нужно, чтобы ты был критиком и посмотрел на мой сайт, который запущен сейчас на http://localhost:3001/ua
>
> /design-critique

The owner's follow-up, after reading the critique:

> создай на основе этого request, proposal

## How I understood it

The owner asked for a critique of the live site, then asked to turn it into a work item. The work
item covers everything the critique found, sorted by how much it costs the shop:

1. **Trust.** Product photos show the wrong models. Seventeen cordless tools sell without a
   battery, and about nine of their photos show batteries and a charger. One photo carries a
   knock-off "Mackita" label.
2. **Money.** The header, the mini-cart, the cart and the checkout show different totals for the
   same basket.
3. **The purchase funnel on a phone.** After "Підтвердити замовлення" the buyer sees only the
   footer. Pickup demands an address. The phone field rejects `067 123 45 67`.
4. **Search.** Queries such as "шурупокрут", "перфоратор" and "болгарка" return nothing.
5. **Mobile layout.** Compare breaks at 390px. The product page shows no buy button on the first
   screen. Two sticky bars stack on top of each other.
6. **Design-system drift and accessibility.** Text below 14px, tap targets below 44px, panels
   that `DESIGN.md` forbids, weak focus on fields.

The critique covered 9 pages at 1512px and 390px in both themes: `/ua`, catalog, a category,
product, cart, checkout, compare, account and search. I reviewed the home page myself. Four
agents covered catalog and search, product/compare/wishlist, cart/checkout/account, and a
measured accessibility audit (56 runs). I re-checked every 🔴 finding by eye or in code.
The evidence is in `shots/`.

## Goal

A buyer finds the tool in Ukrainian or Russian and sees that exact tool in the photo. They see one
total everywhere and can finish an order on a phone without guessing.

## Constraints

- The owner's rejected list in `CLAUDE.md` stays closed: no grid background, no extra strips above
  the header, no monospace, no dense layouts, no "why us" or benefits strips, no SKUs or counters
  on cards, no caps, no glass renders for products, no Liquid Glass on the cart button, no reviews
  or ratings, no "pay in parts", "buy in one click" or "notify when in stock".
- `DESIGN.md`: tokens only, both themes, text ≥14px, tap targets ≥44px, hairlines instead of
  panels, one animation on the site.
- The owner chose the opaque `tint-btn` in 011. The critique notes its weight in the grid, but the
  button changes only on the owner's word.
- The order still goes nowhere and payment stays disconnected. This work makes the demo honest.
  It does not build a backend.
- The i18n rule stays: `dict` never crosses into a client component.

## Acceptance criteria

- Every product shows a photo of its own model. A tool sold without a battery shows no battery in
  the photo, or says "без акумулятора" next to the buy button.
- The header, the mini-cart, the cart and the checkout show the same total for the same basket
  and the same delivery choice. The rows add up to the total on screen.
- On 390×844 a buyer places an order with pickup and a phone typed as `067 123 45 67`. The
  confirmation screen appears at the top of the page and says the order is a demo.
- Search for "шурупокрут", "перфоратор", "болгарка", "шуруповерт", "дрель" and "Макіта"
  returns products.
- Compare at 390 shows readable values, and the product page at 390×844 shows the buy button on
  the first screen.
- The audit shows no text below 14px and no tap target below 44px, apart from inline links
  inside prose.
- `node tools/shots/smoke.mjs` stays green. Screenshots at 1512 and 390 in both themes go into
  `implementation.md`.

## Open questions

Listed in `proposal.md`, section "Decisions for the owner".
