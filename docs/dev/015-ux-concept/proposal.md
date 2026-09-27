# 015 · UX concept · Proposal

- **Status:** concept on the canvas, waiting for the owner's review
- **Opened:** 2026-09-27
- **Canvas:** https://claude.ai/artifact/MqHdx1bJGYbBCJWx3YZEWX (private until the owner shares it)
- **Request:** `request.md`

## Direction: "Quiet shelf, instant answer"

The page stays calm: white shelf, big real photos, hairlines, Unbounded and Golos Text. Every action answers within
100 ms: a card opens up under the pointer, the cart shows the sum at once, search suggests a section after two letters.
Orange appears on one primary action per view and nowhere else.

The concept keeps the brand from `DESIGN.md` and changes how the shop behaves. It is not a restyle.

## Research behind it

Three research passes ran on 2026-09-27.

| Pass | Sources |
|---|---|
| UX principles | Baymard (product lists, quick views, hover information, search, autocomplete, filters, add-to-cart, product pages, mobile), Nielsen Norman Group (utility navigation, sticky headers, mega menus, timing, animation, bottom sheets, touch targets), WCAG 2.2 (1.4.13, 2.4.11, 2.5.8), Apple HIG, Material 3 motion, lawsofux.com |
| Live shops | jabko.ua, answear.ua, apple.com/shop, nike.com, rozetka, allo, comfy, moyo, ssense, two Awwwards e-commerce winners. The agent measured hover states, header sizes and add-to-cart flows in Chrome |
| Tool retail | Milwaukee, Makita, DeWalt, Bosch Professional, Metabo, Festool, Hilti, Ryobi, Screwfix, Toolstation, Rozetka, Epicentr, VseInstrumenty, Kulibin |

The findings, condensed to the rules the concept follows, are in the canvas notes and below.

## What the concept changes

| # | Pattern | Why (source) | Build cost |
|---|---|---|---|
| 1 | **Hover reveal inside the card.** The photo steps back and a short line, 3 specs and the kit line rise into the photo stage. Price and button stay put. Works on keyboard focus, Esc closes | Baymard: list items need spec detail for spec-driven goods; quick views waste a step. WCAG 1.4.13. Rozetka, allo and answear reveal specs; moyo and allo show 5–7 rows and cover neighbours, so the concept caps it at 3 | M: `product-card.tsx` + a `short` field per product |
| 2 | **One-row header.** Logo 28 px, "Каталог", an open search field, cart with the sum. City, language and theme shrink into a quiet 14 px cluster; on phones they move into the menu sheet | NN/g utility navigation and centred-logo studies; jabko and nike keep these items at 12–13 px | M: `header.tsx`, drops the 006 top layer |
| 3 | **Search that answers in words people use.** Section first ("болгар" → Кутові шліфмашини), completions with the completed part bold, products with photo and price, ↑↓ Enter Esc | Baymard: 46 % of sites do not send an exact section name straight to the section, 70 % miss synonyms | M: one matcher in `shop.ts` (see 013, D) + the panel |
| 4 | **"Мої батареї".** The buyer names their battery platform once. The header shows it, compatible cards say "до твоїх батарей", the catalog pre-filters | None of the 14 tool sites remembers the platform; VseInstrumenty filters by series, DeWalt by line. This is Profitool's own move | M: already half built (`platform-picker.tsx`, `profitool-platform` store) |
| 5 | **Three-layer add to cart.** Button turns into "✓ У кошику", the header pill flashes the brand gradient and shows the sum, a right drawer (phone: bottom sheet) holds the item, free-delivery progress, "Оформити" and "Продовжити покупки". It never closes by itself | NN/g cart feedback; Baymard added-to-cart confirmation; jabko's cross-sell modal is the anti-pattern | M: the drawer replaces the mini-cart popover |
| 6 | **Kit truth.** "без АКБ" in the key line on every bare tool, one calm line under the price, a "Що в коробці" list with ✓/✗, a kit chooser that shows `[ЦІНА]` until kits exist | Ryobi, VseInstrumenty, Milwaukee "Breakdown", Festool "Choose your set"; Rozetka hides it in the kit tab | S for the lines, L for real kit variants (data + stock) |
| 7 | **Choose by task.** Rotary hammers offer "Для дому · до 2,5 Дж", "Щодня на об'єкті · 2,5–3 Дж", "Важкий бетон · від 3 Дж" | Rozetka class filter, Bosch advisor, Milwaukee trades | S per category, editorial thresholds |
| 8 | **Horizontal filters with counts, applied chips, live "Показати N" on phones** | Baymard horizontal filtering and promoted filters; jabko's phone filter sheet | M: `filters.tsx` (also fixes 013, F) |
| 9 | **Accessories by fit.** SDS-Plus bits for an SDS-Plus hammer; a battery slot on bare tools | Bosch "Fits to", Hilti configurator, Ryobi | M once shank and platform attributes exist; batteries are a stock decision |
| 10 | **Motion budget.** 100 ms feedback, 200–260 ms panels, Material easing, reduced-motion fallback | NN/g animation duration, Material 3 motion tokens | S |

## What stays out

- Quick view (Baymard), a phone bottom tab bar (Baymard found little gain, and it fights the sticky buy bar), a
  second photo on hover (every product has one photo today).
- Everything on the owner's rejected list: no strips above the header, no counters or SKUs on cards, no caps, no
  monospace, no glass product renders, no reviews, no "pay in parts" or "buy in one click".

## Honest gaps in the concept

- Only 18 products appear, the ones whose photos show the right model (013, workstream A). The catalog board shows
  three rotary hammers with a "Фото уточнюється" frame.
- Kit variants, batteries and a photo in hand do not exist yet. The canvas marks them `[ЦІНА]` and `[Фото …]`.
- The drawer copy says delivery is counted at checkout, which matches decision 3 in 013.

## Decisions for the owner

1. Take the one-row header (pattern 2) over the two-layer header from 006?
2. Hover reveal as drawn: photo steps back inside the card, or a panel that drops over the next row like Rozetka?
3. Right drawer after "У кошик", or keep today's mini-cart popover that closes after 4 s?
4. "Мої батареї" as a first-class feature on the home page and in the header?
5. Stock kit variants and batteries, so pattern 6 and the battery slot become real?
