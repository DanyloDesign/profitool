# Proposal

- `DeliveryMethod = "novapost" | "ukrpost" | "pickup"`. `DELIVERY_COST` (120 ₴ stub) is removed.
- Below `FREE_DELIVERY_FROM` (5 000 ₴) the buyer pays the carrier's tariff on receipt; the shop does not
  know the amount, so `orderTotals` returns `delivery: null` and the total excludes delivery.
  From 5 000 ₴ delivery is free by Nova Poshta or Ukrposhta. Pickup is always free.
- Checkout: third radio "Укрпошта"; address field asks for a branch or postcode.
- Delivery page: three equal columns (Nova Poshta, Ukrposhta, pickup) with term, price rule and a link to the
  carrier's tariffs. The free-delivery rule sits above them in one line.
- Cart, cart drawer, product page and account history mention both carriers where they named only Nova Poshta.
- Terms: Nova Poshta 1–2 days (existing copy), Ukrposhta 3–5 days (typical standard parcel; not confirmed by the owner).

Out of scope: real carrier APIs (cities, branches, TTN). MVP0 needs them, but they belong to the backend.
