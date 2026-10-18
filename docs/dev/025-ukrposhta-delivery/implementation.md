# Implementation

2026-10-18.

- `src/lib/shop.ts`: `DeliveryMethod` adds `ukrpost`; `DELIVERY_COST` (120 ₴ stub) removed. `orderTotals` returns
  `delivery: null` below `FREE_DELIVERY_FROM` for a carrier; the total excludes it.
- `src/store/account.ts`: `Order.delivery` is `number | null`. Old orders saved with 120 ₴ still show 120 ₴.
- Checkout: third radio "Укрпошта, відділення"; the branch field reads "Відділення або індекс" for Ukrposhta;
  delivery rows show "За тарифом перевізника", "Безкоштовно" or a sum.
- Cart: "Доставка: за тарифом перевізника, безкоштовно від 5 000 ₴". Drawer: "Доставка безкоштовна" without carrier.
- Account history: Ukrposhta label, tariff text.
- Delivery page: `delivery-calculator.tsx` → `delivery-options.tsx`. Free rule on top with a cart progress line
  (only when the cart has items), then Nova Poshta, Ukrposhta and pickup as three columns with term and
  links to carrier rates (novaposhta.ua/shipping-cost, ukrposhta.ua/ua/taryfy; both answered 200 on 2026-10-18).
- Copy: footer, product page delivery line, payment and privacy pages now mention both carriers or "пошта".
  Returns copy still names Nova Poshta: that is the return shipping the shop pays for, not a delivery option.

## Checks
- `tsc`, `eslint src` clean, `smoke.mjs` 30/30.
- Screenshots: delivery page ua 1512 (cart above and below 5 000 ₴), en 1512 dark, en 390; checkout ua 1512
  above and below the threshold; cart ua 1512 below the threshold. No overflow.

## Fixed during the check
- The free-delivery line was set larger than the page title; now `t-h3`.
- Pickup hours broke as "09:00–" / "19:00"; now on one line.

## Known defects and open points
- Ukrposhta term "3–5 днів" is a typical standard-parcel time, not confirmed by the owner.
- No real carrier API: city and branch are free text. MVP0 needs Nova Poshta and Ukrposhta APIs (backend).
- Cart page: the old price "2 540 ₴" wraps under the current price at 1512 (existed before this task).
