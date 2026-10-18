# Plan

1. `shop.ts`: add `ukrpost`, drop `DELIVERY_COST`, `delivery: number | null` below the threshold. Check: `tsc`.
2. Dictionaries: Ukrposhta method, branch-or-postcode label, "carrier's rate" texts. Copy that named only Nova Poshta.
3. Checkout, cart, account history: third method, nullable delivery.
4. Delivery page: replace the slider calculator with three columns (`delivery-options.tsx`).
5. Check: `tsc`, `eslint`, `smoke.mjs`, screenshots above and below 5 000 ₴, 1512 light/dark, 390.
6. Commit to `master`, watch the deploy, check the live page.
