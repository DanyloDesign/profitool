# 013 · Fixes from the design critique · Proposal

- **Status:** waiting for the owner's decisions 1–5 (see the end) before phase 1
- **Opened:** 2026-09-27
- **Request:** `request.md`
- **Evidence:** `shots/`, 16 screenshots from the dev server on 2026-09-27 at `06996f9`. Code references are checked against `7043d5e` (static export), which moved catalog and search into `catalog-view.tsx` and `search-view.tsx`

## How the critique ran

9 pages at 1512×945 and 390×844, light and dark theme: `/ua`, `/ua/catalog`, a category,
a product, cart, checkout, compare, account and search. I reviewed the home page myself. Four
agents covered the rest in parallel: catalog and search; product, compare and wishlist;
cart, checkout, account and the mobile menu; and a measured audit of 56 page loads that
collected font sizes, tap targets, contrast, alt text, focus and overflow. I re-checked every 🔴
finding by eye or in code before writing it down.

## What stays as it is

The critique found these parts solid. The fixes must not break them.

- The hero in both themes: model, price and "Купити" on the first screen at 1512 and 390.
- Contrast: 0 text failures in 56 runs, the light-theme minimum is 5.02:1. The table in
  `DESIGN.md` matches the measurement within ±0.05.
- Token discipline: 0 hard-coded colours, no caps, no monospace. `lang` is `uk` / `ru`, and all
  756 images carry alt text.
- Filters live in the URL. The mobile filter sheet has a live "Показати N товарів" counter and
  traps focus. The cart modal handles focus, Escape and scroll lock.
- The card grid: buttons in a row sit on one line. "У кошик" gives instant feedback
  ("✓ У кошику", the sum in the header, the mini-cart).
- In the cart, a progress bar to free delivery and a relevant cross-sell (discs for a grinder).

## Workstreams

Severity: 🔴 costs orders or trust, 🟡 slows the buyer down, 🟢 polish.

### A · A photo per product 🔴

**What the critique found.** `imageOf()` (`src/lib/shop.ts:31`) builds the path from the
category's `tool` and the brand, so every Makita rotary hammer shares one picture.

- 9 of 49 products share a photo with another model: 3 Makita rotary hammers, 2 Makita
  grinders, 2 Makita sanders, 2 Bosch measuring tools.
- Wrong type of tool: the GLM 50-27 C rangefinder appears as the GLL 3-80 line laser. The corded
  GA5030 and DWE4157 appear as cordless grinders. The cordless DHR243Z and HR001GZ appear as the
  corded HR2470, whose model number is printed on the case. The M18 BOS125 sander appears as a
  die grinder. SK209GDZ appears as another maker's green laser.
- The DBO180Z photo shows a yellow sander labelled "Mackita". A buyer reads it as a fake.
- 17 products carry `K.noBattery`. About 9 of their photos show batteries and a charger, for
  example the DDF484Z shows a 12V CXT kit and the R18DD5-0 shows two 1.5 Ah packs.
- The "Продається без акумулятора" note sits 645px below the buy button at 390, inside an
  orange frame that `DESIGN.md` does not allow.

Evidence: `shots/photo-wrong-models.png`, `shots/photo-bare-tools-with-batteries.png`.

**Change.**

1. Add `image?: string` to `Product` (`src/data/types.ts`). `imageOf()` returns
   `asset(product.image)`, and the category-brand pair stays as the fallback.
2. Key the source map by product slug: `tools/products/rozetka-ids.json` becomes
   `{ "makita-dhr243z": id }`, and `prepare_photos.py` writes `/products/{slug}-photo.png`.
   New file names also sidestep the browser-cache rule in `CLAUDE.md`.
3. Pick per-model packshots for the mismatched products. For bare tools, pick a "tool only" shot.
   Remove the "Mackita" photo on day one.
4. Put the battery warning in the BuyBox as one line under the stock line: "Без акумулятора
   і зарядного". Drop the framed block on the product page (`page.tsx:117-128`).
5. Build a contact sheet of all 49 photos with model names. The owner approves it by eye.

- default: find a better photo for each category-brand pair | chosen: a photo per product slug
  | why: one picture cannot show a corded and a cordless model at the same time
- default: keep the framed warning and move it up | chosen: one line in the BuyBox | why: the
  buyer reads it at the moment of the click, and the frame breaks "no panels"

### B · One total everywhere 🔴

**What the critique found.**

- `cartTotals()` (`shop.ts:57`) adds 120 ₴ delivery to any basket under 5 000 ₴ before the
  buyer picks a method. The header button shows 890 ₴, the mini-cart's "До сплати" shows 1 010 ₴,
  and no row explains the difference. Pickup is free, so the number is wrong for pickup buyers.
- `checkout-form.tsx:99-101` computes delivery a second way, by method.
- The cart summary shows "Товари, 4 шт 24 960 ₴" at old prices while the rows show new prices
  that add up to 21 680 ₴.
- The checkout shows rows that add up to 21 680, then "Знижка −3 280", then "До сплати 21 680".
  The buyer sees a discount that looks unapplied.
- The mini-cart title says "У кошику 4 позиції" for 2 lines and 4 pieces.

Evidence: `shots/minicart-two-totals-1512.png`, `shots/cart-gross-vs-rows-1512.png`,
`shots/checkout-discount-looks-unapplied-1512.png`.

**Change.**

1. One function in `shop.ts`, `orderTotals(items, method?)`. The header, mini-cart, cart and
   checkout all call it.
2. Without a method, delivery stays out of the total. The mini-cart shows "Разом 890 ₴" and no
   delivery line. The cart shows "Доставка: безкоштовно від 5 000 ₴" or "від 120 ₴" as a note
   and keeps it out of the sum. The checkout adds delivery once the buyer picks a method.
3. The rows show the old price struck through next to the new one, the way catalog cards do.
   The summary keeps "Товари", "Знижка", "До сплати", and now the rows add up (decision 2).
4. The mini-cart title counts pieces with the right word: "4 товари".

### C · The purchase funnel 🔴 / 🟡

**What the critique found.**

- 🔴 After "Підтвердити замовлення" the page stays scrolled down. At 390 the buyer sees only
  the footer (`scrollY` 1358, the heading at −950). Focus drops to `body`. The heading above
  still says "Оформлення". Evidence: `shots/checkout-done-shows-footer-390.png`.
- 🔴 The confirmation promises "Передзвонимо протягом 15 хвилин", and no call will come.
- 🔴 Pickup requires the address field, and the error says "Вкажи відділення". The courier error
  says the same, though its field is called "Адреса". Evidence:
  `shots/checkout-pickup-requires-address-1512.png`.
- 🔴 The phone regex `^\+?380\d{9}$` (`checkout-form.tsx:56`) rejects `+38 067 123 45 67`,
  `0671234567` and `067 123 45 67`, which browser autofill often produces.
- 🟡 Phone and email use `type="text"`. Error messages are not tied to their fields through
  `aria-describedby`. The checkout marks no field as required while the account form uses
  asterisks.
- 🟡 Fields show focus with a 1px border colour change only (`field` in `globals.css`).
- 🟡 In the dark theme the error colour `warn` `#FFB020` reads like the orange border of the
  selected delivery option. Evidence: `shots/checkout-errors-dark-1512.png`.
- 🟡 Buyer type and "Отримувач — інша особа" sit in the Contacts step for every private buyer.
  The email is required, though its label says it is for the receipt.
- 🟡 At 390 with 3 items, the total and "Оформити замовлення" start at y=1139, below the first
  screen.
- 🟡 "−" at quantity 1 removes the line with no undo and drops focus.
- 🟢 The "+" button greys out at the stock limit without a word.
- 🟡 Account: "Кабінет поки не працює" appears only after the form is filled, below the
  fold. "Забули пароль?" looks like a link and does nothing. The form sits in a framed panel with
  a 32px radius (`account-view.tsx:56`).

**Change.**

1. Confirmation: `scrollTo(0, 0)`, focus on an `h1` with `tabIndex={-1}`, drop the "Оформлення"
   heading on that screen. The copy tells the truth: this is a demo, the order went nowhere,
   number PT-… stays in this browser. Under it, the order summary: items, total, delivery,
   payment (decision 5).
2. Pickup hides city and address and skips their validation. The error text follows the method:
   "Вкажи відділення" or "Вкажи адресу".
3. Phone: strip everything but digits, turn `0XXXXXXXXX` into `380XXXXXXXXX`, then validate.
   Show the mask as a hint only. `type="tel"`, `inputMode="tel"`, `autoComplete="tel"`. Email:
   `type="email"`, `autoComplete="email"`, optional. Name: `autoComplete="name"`.
4. Errors get `id` and `aria-describedby`. Required fields get the same mark as in the account.
5. `field` gets a 2px ring on `:focus-visible`, the same ring buttons already have.
6. Buyer type moves to the Payment step as a link, "Потрібен рахунок для ФОП або компанії?".
   The recipient toggle moves to the Delivery step (decision 6).
7. Below 768px the cart gets a bar pinned to the bottom: "До сплати 21 680 ₴ · Оформити".
8. "−" is disabled at quantity 1, and the trash icon removes the line (decision 4). At the stock
   limit a line under the stepper says "Більше немає в наявності".
9. Account: one line under the heading says the account does not work yet. "Забули пароль?"
   becomes a button with the same message. The panel frame goes, and a hairline separates
   the form.
10. `warn` in the dark theme moves towards red, for example `#FF6B5E`, measured with
    `node tools/shots/contrast.mjs`. Errors get an icon (decision 8).

### D · Search in Ukrainian and Russian 🔴

**What the critique found.** `applyQuery()` matches the query against
`brand model sku slug` (`shop.ts:185`). The header suggestions use a second matcher that looks at
`brand model` only (`header.tsx:354`). "шурупокрут" (the name of the site's own section),
"перфоратор", "болгарка", "дриль", "каска", "Макіта", "LXT" and "DDF 484" all return 0 results.
The search page shows two search fields at 390, and on desktop neither field holds the query, so
fixing a typo means typing the query again. The empty state repeats the same message twice.
Evidence: `shots/search-empty-390.png`.

**Change.**

1. One matcher in `shop.ts`, `matchProduct(product, query)`, used by `applyQuery()` and the header
   suggestions.
2. The haystack adds the category name in ua and ru, a synonym list per category (болгарка,
   КШМ, кутова шліфмашина, шуруповерт, дрель, дриль …), the platform name, and brand names in
   Cyrillic (Макіта / Макита, Бош, Деволт, Метабо, Мілвокі, Рьобі).
3. Normalise both sides: lower case, drop spaces and hyphens for model codes ("DDF 484" finds
   DDF484Z). Split the query into words and require all of them.
4. `search-view.tsx:37` drops its own SearchBox (shown below `md`), and the header field gets `q`.
5. One empty state: no counter line at zero, eight category chips below the message. The
   catalog's empty state uses the same `EmptyState`.

### E · Layout on the phone 🔴 / 🟡

| Finding | Severity | Change |
|---|---|---|
| Compare at 390: values slide under the sticky label column ("00 Вт", ",7 Дж"), one product of three is visible (`compare-table.tsx`). `shots/compare-broken-390.png` | 🔴 | Below 768px the label becomes a full-width row, with two value columns under it and snap scrolling. The sticky column gets a background and a divider |
| Home: "Усі 10 акційних" and "Дивитись усе" are hidden below 640px (`product-section.tsx:31`, `hidden sm:inline-flex`), with nothing in their place. `shots/home-no-see-all-390.png` | 🟡 | Below `sm`, show the link as a ghost button under the rail |
| Home: 8 category rows take about 800px before the first product | 🟡 | A two-column grid of icon and name on the phone, no subtitle (decision 10) |
| Product at 390×844: the price is visible, and the buy button starts at y=886. The sticky bar watches the price block (`sticky-buy-bar.tsx:38`) and stays hidden. `shots/pdp-no-cta-first-screen-390.png` | 🟡 | The sticky bar watches the button. On the phone the lead paragraph moves below the BuyBox |
| Product at 390: the buy bar (69px) and the compare bar (81px) stack, 32% of the screen together with the header. `shots/pdp-two-sticky-bars-390.png` | 🟡 | On the product page on a phone, the compare bar folds into an icon with a count inside the buy bar |
| Product at 1512: the right column sticks for about 130px of scroll, then price and button leave the screen | 🟡 | Only the BuyBox sticks. The platform and terms blocks move out of the sticky wrapper |
| Catalog at 390: the sort select cuts its label ("Спочатку по"), 146px wide for 148px of text. `shots/catalog-sort-truncated-390.png` | 🟡 | Short labels on the phone: "Популярні", "Дешевші", "Дорожчі", "Нові" |
| Catalog root at 390: category chips wrap into 4 rows, 6 with filters; the first card starts near 660px (`catalog-view.tsx:100`). `shots/catalog-chip-wall-390.png` | 🟡 | Horizontal scroll below `lg`, the way `QuickChips` already works |
| The mobile menu has no `role="dialog"`, keeps focus on the burger, lets Tab reach the page underneath and lets the page scroll (`header.tsx:792`) | 🟡 | Same pattern as `CartModal`: dialog role, focus trap, scroll lock |
| The checkout header at 390 is 120px with the search row and its typing animation | 🟡 | Hide the search row on `/checkout` below 768px (decision 7) |
| Breadcrumbs at 390 wrap, and the last line starts with "·" | 🟢 | Below `sm`, show "‹ Перфоратори" only |
| Two-column cards: a long spec line or old price wraps and pushes prices out of line | 🟢 | Clamp the spec line to one line; the old price does not wrap |

### F · Catalog and product logic 🟡

| Finding | Change |
|---|---|
| Filter counts ignore the other active filters (`filters.tsx:74`). With Makita + Milwaukee chosen, XR 18V and ONE+ 18V still appear and lead to 0 | Count against the current query minus the filter's own group; grey out options with 0 |
| The key parameter differs inside one category: grinders show "125 мм", "750 Вт", "900 Вт" | One `key` per category in `products.ts` |
| Range buckets overlap and follow raw data: "до 54 Н·м" and "54–70 Н·м"; "720–750 Вт" for one product (`shop.ts` buckets) | Round the edges to readable steps, no overlap |
| The price chip reads "0 – 12000 ₴", "15000 – ∞ ₴" | "до 12 000 ₴" / "від 15 000 ₴" through `price()` |
| "Схожі товари" for the M18 rotary hammer: a drill, a grinder, a saw, a sander (`relatedTo()`, `shop.ts:398`) | Two shelves: "Ще перфоратори" and "На платформі M18" with a `?platform=` link |
| The cart cross-sell after an SDS-Plus hammer offers 1/4″ bits and a helmet | Cross-sell by fit: SDS-Plus drill bits for SDS-Plus hammers. Batteries and chargers are missing from the catalog (decision 12) |
| The product page repeats itself: the "Опис" tab copies the lead, warranty sits in specs and in terms, "Акумулятор: Не входить" repeats the kit | Drop the "Опис" tab and the warranty spec row |
| The SKU "MW-M18CHX" sits between the title and the lead | Move it into the spec table |
| Compare: corded and cordless models show "—" in "Потужність" and "Напруга"; the column head has no stock or old price | Add a "Живлення" row ("мережа 780 Вт" / "акумулятор 18 В"), fill the missing specs, add stock and old price to the column head |
| The catalog root opens with bit sets at 390 and 890 ₴ | Power tools first on the root, or sort by revenue |
| "Зі знижкою" sits in the "Наявність" group | Its own group, or rename the group |

### G · Design-system hygiene and accessibility 🟡 / 🟢

Measured by the audit, confirmed with grep.

| Finding | Where | Change |
|---|---|---|
| Text below 14px in 7 places: discount and "Новинка" badges 13px, header counters 11–12px, the "Фільтри" counter 12px, the city popover 13px | `product-card.tsx:72,76`, `cart-button.tsx:135`, `header.tsx:239`, `filters.tsx:293`, `city-select.tsx:87,105` | 14px; a counter becomes a 20–22px dot |
| The `chip` utility is 40px high, six places override it with `!h-11` | `globals.css` | Raise `chip` to 44px and delete the overrides |
| Tap targets below 44px: the filter cross 28×28, breadcrumbs 20px, footer links 18px, "Змінити" 55×22, "Скинути" 58×20, city rows 43px | `filters.tsx:406` and others | Padding or a pseudo-element to reach 44px |
| Inputs with 15px text on the phone; iOS zooms on focus (computed size only, zoom not tested) | `filters.tsx:488,540`, `city-select.tsx:114` | 16px below `sm` |
| The search field has `outline-none`; focus shows as a 1px border at 3.17:1 | `header.tsx:310` | A `focus-within` ring on the wrapper |
| No skip link; 12 Tab presses to the first content button | layout | A "До вмісту" link, `sr-only focus:not-sr-only` |
| The mobile sort select has no accessible name: its label is `hidden` below `sm` | `filters.tsx:536` | `aria-label`, or `sr-only` instead of `hidden` |
| 8 of 9 pages share one `<title>` and description | only `[locale]/layout.tsx` and `product/[slug]` set metadata | `generateMetadata` per route; the catalog uses the category name |
| Panels: the account card (32px radius) and 5 popovers on `ink-850` with 24–28px radii | `account-view.tsx:56`, popovers | The account panel goes (C.9). Popovers stay as floating layers: `DESIGN.md` names them as the one exception and gets a radius token |
| 213 arbitrary Tailwind values. `text-[15px]` appears 45 times with no utility. `border-[var(--hair)]` appears 55 times while the `hair*` utilities go unused | `header.tsx` 32, `cart-view.tsx` 16, `page.tsx` 15, `product-card.tsx` 15 | A 15px text utility, the `hair` utilities, then the arbitrary values in the files this work touches |
| The quantity stepper exists twice; about 10 hand-built buttons repeat `icon-btn` or `ghost-btn` | `cart-view.tsx:96`, `buy-box.tsx:53`, `header.tsx:233`, `pagination.tsx:46`, `footer.tsx:37`, `cross-sell.tsx:130`, `cart-button.tsx:128` | One `Stepper` component; the utilities instead of hand-built buttons |
| The mega-menu scrim uses `bg-ink-900/70`, the cart modal uses `--scrim` | `header.tsx:437` | `--scrim` in both |
| Chrome's native blue clear button in the search field; native select arrows pressed against the rounded edge | `header.tsx:315`, sort and buyer type | Hide `::-webkit-search-cancel-button` and draw a cross in `bone-dim`; `appearance-none` with our own arrow |
| Each product card has two tab stops, one on the photo and one on the name | `product-card.tsx` | `tabIndex={-1}` and `aria-hidden` on the photo link |
| `DESIGN.md` says hair-strong is about 1.9:1 in the dark theme; the measurement gives 1.79:1. The `tint-btn` contrast is missing from the table (fill on white 1.32–1.45, border 1.82) | `DESIGN.md` | Correct the numbers and add the row. Whether to raise the borders stays with the owner, as before |

### H · Visual hierarchy, owner's call

These are taste decisions. None of them ships without the owner's word.

- "Категорії" uses a 16px heading while "Розпродаж", "Популярні товари" and "Новинки" use about
  44px. The section that opens the home page reads as secondary. Proposal: the same heading
  level as the other sections (decision 14).
- The section action has two looks: a ghost pill "Усі 10 акційних →" and grey text
  "Дивитись усе". Proposal: the ghost pill everywhere.
- "Залишилось N" shows for stock ≤5 (`product-card.tsx:121`), so all four new arrivals carry it
  in orange. The hero says the same thing in grey: "4 шт у Києві". Proposal: threshold ≤2, one
  style (decision 11).
- The glass category icons are teal and pale on white, and they fight the orange brand.
  `DESIGN.md` admits it. Proposal: re-render them for the light theme (decision 13).
- Platform chips read "XR 18V", "CAS 18V", "ONE+ 18V", which only people who know the lines
  understand. Proposal: "DeWalt XR 18V" on the home page, in the mega-menu and in the filters.
- The row of four peach "У кошик" buttons forms the heaviest band in each rail, heavier than the
  prices (`shots/home-rails-1512.png`). The owner chose this in 011. It stays unless the
  owner asks.
- The footer draws three hairline widths: full-bleed above, 108–1404 in content, 36–1476 at the
  bottom. Proposal: the content width for all of them.

### I · Tooling 🟢

`tools/shots/*.mjs` hard-code the Windows Chrome path, so the critique ran on a patched copy.
Read `CHROME_PATH` from the environment, with defaults for Windows and macOS. Keep the audit as
`tools/shots/audit.mjs`, so the numbers above can be measured again after each phase.

## Order of work

| Phase | Workstreams | Why this order |
|---|---|---|
| 1 | A (code part, the BuyBox line, removing "Mackita"), B, C.1–C.4 | Wrong photos and totals that don't add up cost orders today. Photo sourcing runs in parallel, since it touches only `tools/products` and `public/products` |
| 2 | D, E | Finding a tool and buying it on a phone |
| 3 | F, G, I | Logic and hygiene. They also pay off the arbitrary sizes that `CLAUDE.md` lists as unfinished |
| after the owner decides | H, C.6, C.10, E (decisions 7 and 10) | Taste and copy |

`src/lib/shop.ts` sits in A, B, D and F, and the cart files sit in B and C. One agent takes
each chain in turn; only photo sourcing and the tooling run beside it. `plan.md` splits the
files.

Every phase ends with screenshots at 1512 and 390 in both themes, a green
`node tools/shots/smoke.mjs`, and a note in `implementation.md`.

## Decisions for the owner

Needed before phase 1:

1. **Photos.** Per-model packshots from the same source, about 18 products to redo. Until a
   product has its own photo: (a) hide it from the rails and the catalog, or (b) keep it with the
   pair photo and the battery line. Recommendation: (a) for the wrong-type photos and "Mackita",
   and all replacements done inside phase 1.
2. **Discount in the cart.** (a) The old price struck through in each row, with the summary as
   now. (b) Rows at new prices and a separate "Ви заощаджуєте 3 280 ₴" line outside the sum.
   Recommendation: (a), it matches the catalog cards.
3. **Mini-cart total.** It shows the goods total and leaves delivery to the checkout.
   Recommendation: yes.
4. **"−" at quantity 1.** Disabled, or removes with a five-second "Прибрано · Повернути".
   Recommendation: disabled, since the trash icon sits next to it.
5. **Confirmation copy.** An honest demo message with the order summary. Recommendation: yes,
   until orders go somewhere real.

Can wait:

6. Buyer type and recipient toggle leave the Contacts step.
7. The checkout header on the phone hides its search row.
8. `warn` in the dark theme moves towards red.
9. The site speaks with "ти" or "ви". Today the checkout says "Вкажи" and the account says
   "Вже маєте акаунт?".
10. Categories on the phone home page as a two-column grid.
11. "Залишилось" from ≤2.
12. Batteries and chargers enter the catalog, so bare tools have something to sell alongside.
13. Glass icons re-rendered for the light theme.
14. The "Категорії" heading at the level of the other sections.

## Out of scope

Sending orders, payment, working accounts, brand pages, the service section, reviews and
ratings (rejected), a Lighthouse run, and a restyle of `tint-btn` (the owner's 011 decision).

## Verification

- `smoke.mjs` grows three scenarios: a pickup order at 390 with the phone `067 123 45 67` and
  the confirmation at the top of the viewport; equal totals in the header, mini-cart, cart and
  checkout; search for the words from the acceptance criteria.
- `tools/shots/audit.mjs` after phases 1 and 3: no text below 14px, no tap target below 44px
  outside prose.
- `contrast.mjs` for any new colour.
- A contact sheet of all 49 photos with model names, approved by the owner.

## Risks

- Per-model packshots of bare tools are harder to find than kits, and the search often returns
  banners (`CLAUDE.md` notes it). Some photos will need a manual pick.
- The photos come from a retailer. Before a public launch the owner needs the rights, or the
  manufacturers' media kits.
- The totals change touches the header, the mini-cart, the cart and the checkout at once. A
  missed caller brings the two-totals bug back, so the smoke test checks all four.
