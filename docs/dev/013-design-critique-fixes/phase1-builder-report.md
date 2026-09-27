# 013 · Phase 1 · Builder report (steps 1a, 1b, 1c)

Builder: Sonnet, code-only. No `pnpm build`, no dev server, no commit/push (per plan.md risk note
and task constraints). Verified with `pnpm exec tsc --noEmit` and `pnpm exec eslint <files>` —
both clean on every file listed below. No Chrome check was run by me; see "Needs visual
verification" at the end.

## Files changed

- `src/data/types.ts` — `Product.image?: string`.
- `src/data/products.ts` — renamed the literal array to `allProducts`; added exported
  `HIDDEN_UNTIL_PHOTO: Set<string>` with the 8 slugs below; `products` is now
  `allProducts.filter(...)` and `productBySlug` builds from that filtered list.
- `src/lib/shop.ts` — `imageOf()` prefers `product.image`; `cartTotals()` replaced by
  `orderTotals(items, method?)` with a new exported `DeliveryMethod` type.
- `src/components/product/buy-box.tsx` — one line under the stock line for `K.noBattery`
  products, reusing `kitNoBattery[locale]` text directly (no new dict key needed, since
  `kitNoBattery` already holds exactly "Без акумулятора і зарядного" / "Без аккумулятора и
  зарядного").
- `src/app/[locale]/product/[slug]/page.tsx` — removed the framed "Продається без акумулятора"
  block and its now-unused imports/variable.
- `src/components/cart/cart-button.tsx`, `mini-cart.tsx`, `cart-view.tsx` — switched from
  `cartTotals` to `orderTotals`.
- `src/components/cart/checkout-form.tsx` — schema rewrite (phone normalisation, optional email,
  pickup skips city/address, per-method branch error), `type="tel"`/`type="email"`, required
  marks, `aria-describedby`, confirmation screen (scroll+focus+summary+honest copy), struck old
  price in line items, "Товари" row added to the summary.
- `src/app/[locale]/checkout/page.tsx` — the "Оформлення" `h1` moved into `CheckoutForm` (see
  deviation below).
- `src/i18n/ua.ts`, `src/i18n/ru.ts` — `miniTitle` word ("товари"/"товара" instead of
  "позиції"/"позиции"), new `cart.miniTotal`, `cart.deliveryNoteFree`/`deliveryNoteFrom`,
  `checkout.errAddress`, rewritten `checkout.doneText`.

## 1a — hidden slugs (exact)

`HIDDEN_UNTIL_PHOTO` in `src/data/products.ts`:

```
bosch-glm-50-27c        (Bosch GLM 50-27 C)
makita-ga5030           (Makita GA5030)
dewalt-dwe4157          (DeWalt DWE4157)
makita-dhr243z          (Makita DHR243Z)
makita-hr001gz          (Makita HR001GZ)
milwaukee-m18-bos125    (Milwaukee M18 BOS125-0)
makita-sk209gdz         (Makita SK209GDZ)
makita-dbo180z          (Makita DBO180Z)
```

Verified all 8 slugs exist verbatim in `allProducts` (49 total → 41 visible after the filter).
Filtering happens once at the `products` export, so catalog, rails, search, `relatedTo`,
cross-sell, compare, `generateStaticParams` and `productBySlug` all inherit the hide for free —
no other file needed a change for this. Un-hiding a product is exactly one line: remove its slug
from the `Set`. Cart/wishlist/compare stores already filtered on `productBySlug.get(...) ===
undefined` before this change (checked every consumer: `compare-bar.tsx`, `compare-table.tsx`,
`wishlist-view.tsx`, `cross-sell.tsx`, `orderTotals`'s own line-mapping) — a hidden slug sitting
in a saved localStorage cart/wishlist/compare list is silently dropped, confirmed by reading each
call site, not by running the app.

## Deviations from the proposal/plan and why

1. **Touched `checkout/page.tsx`**, which plan.md's file list for step 1c didn't include. The
   "Оформлення" `h1` used to live in the server page component; C.1 asks to hide it only on the
   confirmation screen, and that state lives in `CheckoutForm`'s client state. Moving the heading
   into `CheckoutForm` (rendered for the loading/empty/form branches, omitted on confirmation) was
   the only way to do this without lifting client state into a server component. Page.tsx now just
   wraps `<CheckoutForm />`; `dict`/`getDict` import removed there since it became unused.
2. **Mini-cart total label.** Proposal says the mini-cart should show "Разом 890 ₴", not
   "До сплати" (used everywhere else including the cart and checkout totals). Added
   `dict.cart.miniTotal` ("Разом" ua / "Итого" ru) instead of reusing `dict.cart.total`.
3. **Delivery note wording.** Proposal quotes the note text directly ("Доставка: безкоштовно від
   5 000 ₴" / "Доставка: від 120 ₴") but didn't name a dict key. Added
   `deliveryNoteFree(min)`/`deliveryNoteFrom(cost)` as functions so the numbers stay tied to
   `FREE_DELIVERY_FROM`/`DELIVERY_COST` instead of being hardcoded strings.
4. **Confirmation summary layout.** C.1 only says "order summary: items, total, delivery,
   payment"; I built a compact list (brand + model × qty, then delivery method + cost, payment
   method, total) styled with existing tokens, no new component. Captured via a `ConfirmedOrder`
   snapshot taken from `orderTotals(items, method)` *before* `clear()` runs (`items` becomes `[]`
   on the next render after `clear()`, so the confirmation screen can't read live cart state).
5. **`dict.product.noBatteryTitle`/`noBatteryText` left in the dict, now unused** (they were the
   framed block's copy). Not deleted — low risk either way, but leaving them avoids touching
   `Dict`'s shape in two files for a cosmetic cleanup outside this task's scope. Flag for later
   hygiene (workstream G) if the owner wants them gone.
6. **`errBranch` message reused as-is for Nova Poshta**, only courier gets the new `errAddress`
   ("Вкажи адресу") — matches the critique's exact complaint (both methods showed "Вкажи
   відділення" before).

## Left undone (intentionally, out of step 1a–1c scope)

- C.5 (2px focus ring on `field`), C.6 (buyer type / recipient toggle relocation), C.7 (hide
  checkout search row on phone), C.8 (`warn` colour shift in dark theme), C.9/C.10 and workstream
  H — all are decisions 6–14, explicitly still open per plan.md's owner-decisions note.
  Not touched.
  - The "sticky bottom bar" on `/cart` at <768px (proposal E, not in the C.1–C.4 list I was given)
    — not implemented.
- Photo sourcing (1d/1e) is another agent's job — I did not touch `tools/products` or
  `public/products`, and no product got a real `image` value yet, so all 8 hidden products stay
  hidden until that lands.
- No Chrome/browser check, no `pnpm build`, no static-export check, no `smoke.mjs` run — per the
  "don't run build/dev server" constraint and because this is a code-only builder pass.

## Needs visual verification (orchestrator / QA pass)

At 1512 and 390, both themes, unless noted:

1. `/ua/catalog`, `/ua` rails, `/ua/search` (any query) — confirm none of the 8 hidden slugs
   appear (rotary-hammers: DHR243Z, HR001GZ; grinders: GA5030; saws: DWE4157; sanders: BOS125,
   DBO180Z; measuring: GLM 50-27 C, SK209GDZ).
2. `/ua/product/makita-dhr243z` (and the other 7 hidden slugs) — should 404.
3. Any still-visible `K.noBattery` product page, e.g. `/ua/product/makita-ddf484z` (check the
   actual slug in `products.ts`) — BuyBox shows "Без акумулятора і зарядного" under the stock
   line, no framed block below the fold anymore.
4. Cart with ≥2 lines, at least one with `oldPrice`: header button sum, mini-cart "Разом", cart
   page "До сплати", and checkout "До сплати" for each of the three delivery methods (pickup =
   free) — confirm the numbers relate the way the proposal describes (goods-only until a method is
   picked, delivery added only at checkout).
5. Mini-cart title pluralisation at 1, 2, 4, 5 pieces (ua: товар/товари/товарів, ru:
   товар/товара/товаров).
6. Cart rows: "−" disabled and visibly dimmed at qty 1; trash icon still removes the line.
7. Checkout at 390×844: fill a pickup order with phone `067 123 45 67`, submit, confirm the page
   is scrolled to top and focus visibly lands on "Замовлення прийнято" (devtools a11y tree or
   visible focus outline), "Оформлення" heading is not shown on this screen, the order summary
   block (items/delivery/payment/total) is correct, no "Передзвонимо" text anywhere.
8. Checkout delivery step: switch method to "Самовивіз" — city/address fields disappear; "Кур'єр"
   with empty address shows "Вкажи адресу"; "Нова пошта" with empty branch shows "Вкажи
   відділення".
9. Phone field accepts `067 123 45 67`, `0671234567`, `+38 067 123 45 67`, `+380671234567`.
10. Required-field asterisks on name/phone/city/branch-or-address and (when shown) edrpou/
    recipient fields, visually matching the account form's `label *` style.
