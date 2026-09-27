# PROFITOOL reference site — structure & feature extraction

Source: `ref-site/index.html` (unpacked "design canvas" bundle, React/DC component, single `<script type="text/x-dc">` block holds all state/logic/data). All line refs are `index.html:LINE`. UI copy is Ukrainian, e-commerce for a power-tool store.

This is **not a real multi-page site** — it's a single-file interactive prototype. One `Component` (`index.html:3259`) holds all state; "pages" are `sc-if` blocks toggled by `state.page`, all rendered inside one artificial browser-frame mockup with its own prototype toolbar (page switcher + desktop/tablet/mobile switcher) that is NOT part of the real site (`index.html:1774-1791`). Ignore that toolbar when rebuilding the real site — it's tooling chrome for this Figma-like canvas.

## 1. Screens and navigation model

State: `page`, `panel`, `catMode`, `tab`, `step`, `mode` (viewport), `drawer`, `cartOpen`, `hoverCat`, `shot`, `qty`, `ship`, `pay` — all in one `state` object (`index.html:3260-3267`). No real router; `go(page)` (`index.html:3382`) just sets `state.page` and resets `panel`/`drawer`/`step`.

Pages (`PAGES` const, `index.html:3084-3090`):
1. `home` — Головна
2. `catalog` — Каталог (category/listing page)
3. `product` — Товар (PDP)
4. `cart` — Кошик
5. `checkout` — Чекаут

Sub-states inside pages (not separate routes):
- Catalog: `catMode` = `tree` (subcategory grid) | `listing` (product grid) — toggle buttons "Дерево категорій" / "Листинг товарів" (`index.html:2216-2219`).
- Product: `tab` = `specs` | `desc` | `kit` | `reviews` (desktop tabs; mobile renders as accordion, see §3).
- Checkout: `step` = `form` | `done` (order confirmation).
- Global overlay `panel` = `null` | `menu` | `city` | `support` | `mini` (mega-menu / city dropdown / support dropdown / mini-cart dropdown — mutually exclusive, toggled via `toggle(p)` `index.html:3383`, closed on any `go()`).
- `drawer` (boolean) — mobile/tablet filters slide-in panel, independent of `panel`.
- `cartOpen` — desktop/tablet cart is a **modal over the page**, not a separate route; opening the "cart" page just also sets `cartOpen: true` unless viewport is mobile (`index.html:3382,3594`). On mobile the cart is a normal in-page section (no modal).

Header navigation triggers (`index.html:1811-1906`, desktop 52px dark bar + city/support bar + gradient stripe; mobile collapsed header + search row):
- Logo → `goHome`.
- "Каталог товарів" burger button → toggles `menu` panel (full-width mega-menu, desktop only shows subcategory columns).
- Search field → decorative typing animation only (no real suggestions, see §3).
- City chevron → `city` panel (dropdown with 6 stores/cities).
- "Служба підтримки" → `support` panel (contact links list).
- Cart icon w/ counter badge → `mini` panel (mini-cart dropdown, desktop/mobile both).
- Heart / compare icons in header exist only as static icons (no bound state — `index.html:1851,1856`), i.e. wishlist/compare are visual placeholders on the header level.

## 2. Per-screen section breakdown

### Global chrome (all pages)
1. Promo banner strip, dismissible — "14 днів знижок · до 40% на складські залишки", close (×) button hides it for the session (`index.html:1796-1809`, `hideBanner`).
2. Dark header bar (desktop): logo, city selector, support dropdown, language "Укр" (implicit) (`index.html:1811-1867`).
3. Search row (desktop, full width up to 660px) with a typewriter placeholder cycling through real queries (`index.html:1839-1848`).
4. Action icons: user (account, no state bound), wishlist (heart, static), compare (git-compare icon, static), cart with counter (`index.html:1845-1861`).
5. Mobile header: burger, logo, user, cart-with-badge in one row; second row = search + city + support + "Укр" (`index.html:1868-1904`).
6. Gradient accent stripe under header (`index.html:1906`).
7. City dropdown panel — list of 6 cities/stores, one marked "склад" (warehouse), footer link "Усі 12 салонів на карті" (`index.html:1908-1920`).
8. Support dropdown panel — phone-ish support block + 4 quick links: "Замовити дзвінок", "Доставка і оплата", "Гарантія і сервіс", "Повернення і обмін", "Оптовим клієнтам і прайси", "Статус ремонту" (`index.html:1921-1935`).
9. Mini-cart dropdown — header "У кошику N позиції" + "Очистити", scrollable row list (thumb, sku, name, qty×price, sum), footer total + "Кошик"/"Оформити" buttons (`index.html:1938-1967`).
10. Mega-menu — left column = 12 root categories (icon+name, active item has colored left border), right pane (desktop only) = up to 4 sub-columns of links per hovered category + optional promo tile ("фото — герой категорії" + "Комплекти 18 В зі знижкою до 25%") + footer row "Усі товари категорії — 1 248 позицій" + brand list (`index.html:1970-2016`).
11. Footer (dark) — logo, description, phone "0 800 30 12 12" + hours, social icons (telegram/fb/insta/youtube); 3 link columns from `FOOT_COLS` (Каталог / Покупцям / Сервіс); "Салон і склад" column with 2 addresses + "Усі 12 салонів на карті"; payment/brand logo strip; copyright + policy links (`index.html:2834-2897`).
12. Mobile filter drawer (right-side slide-in, all viewports where `L.showFilterBtn`) — header "Фільтри" + Скинути + close, scrollable `FilterGroup` list (max 4 visible options each), sticky footer CTA "Показати 184 товари" (`index.html:2899-2920`).
13. Cart modal (desktop/tablet only, centered overlay when on cart page and `cartOpen`) — see §3 "Cart".

### Home (`isHome`, `index.html:2019-2184`)
1. Category nav column (desktop/tablet only, `homeNav`) — vertical list of 12 categories with hover-triggered flyout, + "Подарункові сертифікати" pinned item (`index.html:2023-2038`).
2. Hero banner — real photo (`57e005c7-...png`, a Makita circular-saw action shot) as background, scrim gradient, "Розпродаж складу" eyebrow badge, H1 "Акумуляторні комплекти 18 В — до 25% до 30 вересня", body copy, CTA "Дивитись комплекти" + secondary "Умови акції" (desktop-only) (`index.html:2040-2057`).
3. Price-teaser cards row (3 cards: "Перфоратори SDS-Plus від 2 480", "Шурупокрути 18 В від 1 940", "Кутові шліфмашини від 1 500"), each opens catalog (`index.html:2058-2068`).
4. Category flyout overlay — absolutely positioned over hero+cards area when a nav item is hovered; shows icon+title+count header and a grid of subcategory tiles with photo placeholders (`index.html:2070-2086`).
5. Category tiles grid — mobile-only section ("Каталог" + "Усі категорії" link), 12 tiles with icon/name/count, "Ще 8 категорій" expand button on mobile (`index.html:2090-2112`).
6. Two promo cards side by side — "Оптовим клієнтам: Прайс-лист і персональні умови від 10 позицій" / "Сервіс: Ремонт інструменту в 18 містах — статус онлайн" (`index.html:2114-2129`).
7. Perks strip — 4 cells (delivery, warranty, repair, returns) from `PERKS` (`index.html:2131-2141`).
8. "Розпродаж" product grid — 4 `ProductCard`s + "Усі 214 товарів" link (`index.html:2143-2160`).
9. "Популярні товари" product grid — 4 more `ProductCard`s (`index.html:2162-2171`).
10. SEO/footer text block — 2-col: company description paragraph + "Доставка в містах" city list (`index.html:2173-2182`).

### Catalog (`isCatalog`, `index.html:2186-2355`)
1. Breadcrumbs (desktop) / plain text crumb (mobile) (`index.html:2189-2194`).
2. Title row — H1 "Перфоратори SDS-Plus" + description with count/price ("184 позиції · від 2 480 грн...") + category hero photo placeholder (desktop wide only) (`index.html:2196-2204`).
3. Quick-filter chip row — 8 pill chips from `QUICK` (static display, not wired to `toggleFilter`) (`index.html:2206-2213`).
4. Page-mode toggle — "Дерево категорій" vs "Листинг товарів" buttons (`index.html:2215-2219`).
5. Two-column layout: sticky sidebar (desktop/wide only) + main content.
   - Sidebar: Categories tree card (breadcrumb-style back link + active parent + 6 subcategory rows with counts) and Filters card (6 `FilterGroup`s from `FILTERS` + "Скинути" + "Показати 184 товари" CTA) (`index.html:2224-2255`).
   - Main / tree mode: subcategory card grid (photo+name+count+from-price) + "Популярне в категорії" product grid (`index.html:2260-2285`).
   - Main / listing mode: toolbar (result count, mobile "Фільтри · N" button opening drawer, applied-filter chips with × to remove, sort `Select`), product grid (6 cards), mobile "Показати ще 18" button, pagination row (range text + `Pagination` + per-page `Select`), SEO text block (`index.html:2287-2348`).

### Product / PDP (`isProduct`, `index.html:2357-2606`)
1. Breadcrumbs (desktop) (`index.html:2360-2362`).
2. Title block — badges (`Badge` components, e.g. "−14%"/"Хіт"), SKU, H1 product name, rating "★ 4.7" + "24 відгуки" link (jumps to reviews tab) + brand name (`index.html:2367-2383`).
3. Gallery — desktop: vertical thumbnail rail (6 shots) + large photo; tablet: horizontal thumbnail row below photo; mobile: dot indicators below photo. Selecting a thumb sets `shot` (highlighted border). "Акція" ribbon overlay on photo if `pHasOld` (`index.html:2385-2415`).
4. Warning `Alert` — "Комплектація неповна: Зубило плоске тимчасово відсутнє..." (`index.html:2417-2419`).
5. Desktop tab block (`Tabs`: Характеристики / Опис / Комплектація / Відгуки·24):
   - Specs tab: `SpecTable` (18 rows) + side "Документи" card (3 PDF links) (`index.html:2425-2434`).
   - Description tab: 3 copy paragraphs (`index.html:2437-2443`).
   - Kit tab: `SpecTable` of included items + photo placeholder (`index.html:2445-2450`).
   - Reviews tab: rating summary (big "4.7" + histogram bars for 5/4/3 stars + "Написати відгук" button), one sample review card (name, 5 stars, date, "купив тут" badge, text), "Усі 24 відгуки" link (`index.html:2452-2482`).
6. Mobile accordion — same 5 sections as rows with chevrons, first (Характеристики, using `specsShort`) expanded by default; Опис/Комплектація/Відгуки/"Доставка і оплата" collapsed (chevron-down, not wired to open — static in this prototype) (`index.html:2486-2513`).
7. Buy box (sticky on desktop) — `PriceBlock` (price+old price+note "Ціна діє до 30 вересня"), bulk-price row ("від 10 шт" → discounted unit price), `StockStatus`, `QuantityStepper` + "В кошик", "Купити в один клік" secondary CTA, "Порівняти"/"У бажане" links (`index.html:2516-2533`).
8. "Умови для цього товару" card — 3 rows (delivery/warranty/returns), last row shown disabled/greyed ("Повернення 60 днів" overridden to 30 for this item) (`index.html:2535-2551`).
9. "Доставка і оплата" card — 3 delivery-method/day rows + payment methods summary line (`index.html:2553-2564`).
10. "Ключові характеристики" card (desktop only) — top-3 specs + "Усі характеристики" link jump to specs tab (`index.html:2566-2576`).
11. "Схожі товари" grid — 4 `ProductCard`s (`index.html:2580-2589`).
12. Mobile sticky bottom bar — price(+old price) + `QuantityStepper` + "В кошик" (`index.html:2591-2604`).

### Cart page (`isCartPage`, `index.html:2608-2674`)
- Desktop/tablet: page body is basically empty — just an explainer note "На десктопі й планшеті кошик відкривається модальним вікном поверх сторінки" + "Відкрити кошик" button (`reopenCart`) (`index.html:2611-2617`). Real cart UI lives in the shared cart modal (§ Global chrome #13 / see below).
- Mobile: full in-page cart — H1 + "Очистити"; empty state (icon, "Кошик порожній", CTA "Перейти в каталог") when `cartEmpty`; else row cards (thumb, sku, name, `StockStatus`, `QuantityStepper`+sum+delete), promo-code input+"Застосувати", free-shipping note, sticky bottom summary (subtotal, discount, total, "Оформити замовлення") (`index.html:2619-2667`).

Cart modal (shared, `cartModalOpen` = desktop/tablet AND page===cart AND `cartOpen`, `index.html:2922-3025`):
- Header: "Кошик" + count label, "Очистити кошик", close ×.
- Two-column body: left = item table (header row on wide only: Товар/Ціна/Кількість/Сума), rows with thumb/sku/name/`StockStatus`/price/`QuantityStepper`/sum/delete; below rows, "Додати до замовлення" cross-sell block with 2 `addons` cards (photo, name, price, "В кошик"). Empty state variant with "Перейти в каталог" + "Повторити замовлення" (`restoreCart`, refills a fixed demo cart).
- Right (surface-2 background) = totals: subtotal/discount/total, promo code + Застосувати, primary "Оформити замовлення" CTA, secondary "Продовжити покупки", free-shipping note + "Вивантажити кошик у прайс, XLSX" link (`index.html:2971-3024`).

### Checkout (`isCheckout`, `index.html:2676-2831`)
- `isDone` state — success screen: green check badge, "Замовлення №28417 прийнято", explainer text, order summary card (delivery/date/payment/total), CTAs "Оплатити карткою" + "Повернутись до форми" (`index.html:2679-2696`).
- `isForm` state — numbered step cards (not a wizard, all shown at once, single page):
  1. Контактні дані — Прізвище+ім'я / Телефон / Email / Тип покупця `Select` (person/team/company) + "Увійти, щоб заповнити автоматично" link; checkboxes "Отримувач — інша особа", "Потрібні документи для юридичної особи" (`index.html:2709-2733`).
  2. Доставка — 4 radio-style shipping option cards (Нова Пошта/Самовивіз/Курʼєр/Перевізник, each with note+price) + Місто/Відділення `Select`s (`index.html:2735-2760`).
  3. Оплата — 4 radio-style payment option cards (Картка онлайн/При отриманні/Частинами/Безготівковий) (`index.html:2762-2778`).
  4. Склад замовлення — cart line items (readonly, "Змінити в кошику" link reopens cart) + order-comment `Textarea` (`index.html:2780-2804`).
  - Right sticky summary card — subtotal/discount/shipping-with-label/total, "Підтвердити замовлення" CTA (`confirmOrder` → sets `step: done`), legal disclaimer with oferta/privacy links, trust strip (warranty/returns/pre-ship inspection check) (`index.html:2807-2826`).

## 3. Interactive features ("фішки")

- **Mega-menu**: hover/click-driven (`tMenu` toggle on click). Left rail = all 12 root categories; clicking any always routes to `catalog` (no per-category real target — it's a flat prototype). Right pane hardcodes one category's 3 sub-columns + optional hero tile; not dynamic per hovered category (`index.html:1980-2013`).
- **Home category flyout**: separate from mega-menu — hovering a home-page category row (`c.enter`) sets `hoverCat`, shows a flyout panel absolutely positioned over the hero, listing that category's real subcategories from `HOME_SUBS` map (dynamic per category, unlike the header mega-menu). 200ms close-delay via `setTimeout` (`leaveCat`/`hideTimer`) so users can move the mouse into the panel; `keepFlyout` cancels the timer on re-entry (`index.html:2070-2086`, `3474-3501`).
- **Search bar**: purely decorative — no real input/suggestions. On mouse-enter shows the placeholder ("Пошук за назвою, артикулом або характеристикою"); on mouse-leave (default) plays a typewriter animation cycling through `TYPE_WORDS` (5 realistic queries incl. a SKU "PT-2415") with a blinking caret span, driven by `typeTick` on a self-rescheduling `setTimeout` loop; respects `prefers-reduced-motion` (skipped in `componentDidMount`) (`index.html:3363-3378`, `3438-3443`).
- **Filters**: checkbox-style `FilterGroup` per facet (brand, chuck type, power, impact energy, power source, kit contents) with counts; `toggleFilter` adds/removes a value from `state.filters` array; "applied filter chips" row above the grid lets you remove one at a time; "Скинути" clears all. Filter UI lives in sidebar on desktop/wide, or in a right slide-in `drawer` on mobile/tablet (opened via "Фільтри · N" button, closed via × or the "Показати N товарів" CTA) (`index.html:2246-2254`, `2899-2920`, `3530-3535`).
- **Sort & pagination**: `Select` for sort (5 options: популярність/дешевші/дорожчі/новинки/в наявності) and per-page size (18/36/72); `Pagination` component bound to `pageNum`/`setPage`; "Показано 37–54 з 184" range label; mobile has a flat "Показати ще 18" load-more button instead of/alongside pagination (`index.html:2307-2333`, `3551-3552`).
- **Category display mode**: toggle between "Дерево категорій" (subcategory tile grid + popular-in-category products) and "Листинг товарів" (flat filtered product grid) — two mutually exclusive `sc-if` branches, not combined (`index.html:2260-2349`, `3536-3543`).
- **Product card hover / quick actions**: cards are the `ProfiToolDesignSystem_41488b.ProductCard` component (imported, logic not visible in this file) wired with `on-add-to-cart`; clicking the wrapping `<div>` (not the card's internal buttons) navigates to PDP via `p.open`. Wrapper div's own hover state is not styled here — any hover reveal/second-image behavior would live inside the imported `ProductCard` component (not inlined in this file).
- **Add to cart**: two entry points — `wrap(p).add()` from grids (adds qty 1, opens `mini` header dropdown) and `addCurrent()` on PDP (adds current `qty` stepper value, also opens `mini` dropdown) (`index.html:3406-3408`, `3572`). Mini-cart auto-opens as feedback (a lightweight "toast"-like reveal, not a real toast).
- **Quantity stepper**: `QuantityStepper` component, used on PDP, in cart rows, and cart-modal rows; each row keeps its own qty in `state.cart[sku]`.
- **Mini-cart dropdown** ("toast/quick view"): opened from header cart icon (`tMini`), shows live rows, total, "Кошик"/"Оформити" buttons; "Очистити" clears cart (`index.html:1938-1967`).
- **Cart modal vs cart page split**: on desktop/tablet, navigating to `cart` page opens a **centered modal over the current page** (`cartModalOpen`); the underlying "cart" route itself is nearly blank with just a "reopen" button, implying the real target UX is "cart is always a modal on desktop, dedicated page on mobile" (`index.html:2608-2617`, `3594`).
- **Cart empty state**: distinct copy in mobile in-page cart and in the cart modal; modal empty state additionally offers "Повторити замовлення" (`restoreCart`) which reseeds a fixed demo cart — a "repeat last order" pattern (`index.html:2940-2947`, `3597`).
- **Cross-sell / addons**: 2 fixed "Додати до замовлення" suggestion cards inside the cart modal, each with its own "В кошик" adding a specific SKU (`index.html:2976-2987`, `3598-3601`).
- **Promo code**: plain text `Input` + "Застосувати" button in both mobile cart and cart modal — not wired to any discount logic (decorative) (`index.html:2650-2653`, `3006-3007`).
- **Free-shipping nudge**: static message "Безкоштовна доставка від 3 000 грн — умова виконана" shown once threshold is met (always true here, not dynamically computed) (`index.html:2654-2657`, `3013-3014`).
- **Cart → price-list export**: "Вивантажити кошик у прайс, XLSX" link inside cart modal (`index.html:3017-3018`) — B2B-oriented feature.
- **Product gallery**: 6 shots, `shot` index in state; thumbnail styling reacts (border width/color) to selection; layout adapts — desktop vertical rail, tablet horizontal strip, mobile dot pager (`index.html:2385-2415`).
- **Product tabs vs mobile accordion**: same 4 content blocks (specs/description/kit/reviews) rendered as `Tabs` on desktop and as a static accordion list on mobile — accordion in this prototype only visually shows chevrons, first section pre-expanded; no real expand/collapse wiring shown (a gap to fill for the real build).
- **Reviews**: rating breakdown bars (5/4/3 star %, counts), "Написати відгук" CTA, one example review with "купив тут" verified-purchase note.
- **Sticky elements**: header (`position:sticky;top:0`), catalog sidebar (`position:sticky;top:16px`), PDP buy-box (`sticky` on desktop, `static` on mobile — becomes a bottom-fixed bar instead), checkout summary card (`sticky`), mobile cart/cart-page bottom summary bar (`sticky;bottom:0`) (`index.html:3199,3226,3252` via `L.buyPos`).
- **Toggle hover animations** (defined as reusable handlers, applied via `sc-camel-on-mouse-enter/leave` on almost every button): `ghostEnter/ghostLeave` — animated gradient/terracotta/outline hover per `ghostHover` prop; `cardEnter/cardLeave` — border-gradient + shadow + 1.2% scale on card hover; `gradEnter/gradLeave` — icon stroke + text becomes gradient-filled on hover; `iconEnter/iconLeave` — icon lift + gradient stroke (`index.html:3269-3334`).
- **Checkout flow**: single-page multi-section form (not a stepper with URL/route changes) with 4 numbered cards; "Підтвердити замовлення" transitions `step` to `done` (client-side only, no real validation shown); success screen offers "Оплатити карткою" and "Повернутись до форми".
- **Responsive breakpoints**: exactly 3 modes — desktop 1440 / tablet 834 / mobile 390 (`MODES`, `LAYOUT`, `index.html:3092-3096`, `3177-3256`) — every dimension (paddings, grid columns, hero height, drawer width, modal width, etc.) is a token per mode, i.e. the whole layout is driven by ~70 named layout variables (`L.*`) rather than CSS breakpoints.
- **Mobile-specific patterns**: bottom sticky buy bar (PDP + cart), full-width bottom-sheet-style filter drawer (`drawerW:100%`), full-screen cart modal (`modalW:100%`, `modalPad:0px`) doubling as a page, tile category grid on home (desktop instead shows a side nav), dot pagination for gallery, "Ще N категорій" progressive disclosure.
- No wishlist, compare, or account functionality is actually implemented — icons exist (`heart`, `git-compare`, `user`) but are not wired to state; treat as icons to design for, not features to port state-for-state.
- No loading states, skeletons, or toasts (beyond the mini-cart reveal) are present anywhere in the file — genuinely absent, not just unread.

## 4. Data model hints

**Product** (`PRODUCTS`, `index.html:3034-3043`, 8 sample SKUs):
```
id, sku (e.g. "PT-2415"), name, price, oldPrice?, stock: "in"|"low"|"order",
stockLabel (free text), badges: [{label, tone: "danger"|"amber"|"brand"|"info"}],
specs: [[key, value], ...] (short list, 3 pairs used on cards)
```
Products span categories: rotary hammer, cordless drill/driver, angle grinder, welding inverter, laser level, saw blade, compressor, welding electrodes — i.e. mixed power tools + consumables, matching a general power-tool retailer catalog.

**Category tile** (`TILES`, `index.html:3045-3058`): `name, count ("N позицій"), icon` — 12 root categories: Електроінструмент, Акумуляторний інструмент, Ручний інструмент, Зварювальне обладнання, Вимірювальний інструмент, Оснастка і диски, Кріплення і витратні матеріали, Насосне обладнання, Генератори і компресори, Спецодяг і засоби захисту, Хімія і герметики, Садова техніка.

**Subcategories per root category** (`HOME_SUBS`, `index.html:3130-3143`) — 6-12 sub-names each, used only for the home flyout, e.g. Електроінструмент → Перфоратори SDS-Plus / SDS-Max, Відбійні молотки, Кутові шліфмашини, Дрилі та міксери, Пили дискові, Лобзики, Штроборізи, Фрезери, Рубанки, Шліфмашини вібраційні, Пилососи будівельні.

**Catalog subcategory card** (`SUBCATS`, `index.html:3107-3114`): `name, count, from (price)` — used for "Перфоратори і відбійні" parent (SDS-Plus/SDS-Max перфоратори, Відбійні молотки, Міксери, Бури і зубила, Пилососи будівельні).

**Filter facets** (`FILTERS`, `index.html:3098-3105`), each `{title, options: [{value,label,count}]}`:
- Бренд: Bosch, Makita, Metabo, DeWalt, Milwaukee, PROFITOOL, Einhell, Ryobi (with counts).
- Тип патрона: SDS-Plus, SDS-Max, Швидкозажимний, Ключовий.
- Потужність: до 700 Вт / 700-900 / 900-1200 / понад 1200.
- Сила удару: до 2 Дж / 2-3 / 3-5 / понад 5.
- Живлення: Мережа 230 В, Акумулятор — i.e. **corded vs cordless is a filter facet**, not a dedicated "platform/battery picker" UI (no battery-voltage-platform selector like an 18V-ecosystem picker exists in this prototype).
- Комплектація: Кейс, Акумулятор у комплекті, Набір бурів, Зубило.

**Quick filter chips** (`QUICK`, `index.html:3151`): Акумуляторні, Від 3 Дж, З кейсом, Bosch, Makita, Зі знижкою, В наявності, До 5 000 грн — static display, not bound to `toggleFilter`.

**Full spec table** (`SPECS_MAIN`, `index.html:3116-3122`) — 18 rows for the sample rotary hammer: Тип, Патрон, Потужність, Сила удару, Частота ударів, Обороти, Режими роботи, Макс. діаметр у бетоні/дереві, Реверс, Запобіжна муфта, Антивібраційна система, Вага, Довжина кабелю, Рівень шуму, Гарантія, Артикул, Країна виробництва.

**Kit/complectation** (`KIT`, `index.html:3124-3128`): Перфоратор, Бокова рукоятка, Обмежувач глибини, Бури SDS-Plus (3 шт), Зубило плоске, Кейс, Інструкція.

**Shipping options** (`SHIP`, `index.html:3153-3158`): Нова Пошта (90 грн), Самовивіз (0 грн), Курʼєр (160 грн), Перевізник (за тарифом) — each with a note (date/time window/location).

**Payment options** (`PAY`, `index.html:3160-3165`): Картка онлайн, При отриманні (+ комісія 20 грн + 2%), Оплата частинами (до 6 платежів), Безготівковий розрахунок за рахунком (для юросіб).

**Cities/stores** (`CITIES`, `index.html:3075-3082`): смт Софіївка (позначено як "склад"), Дніпро, Київ, Харків, Одеса, Львів.

**Perks** (`PERKS`, `index.html:3062-3067`): Доставка від 1 дня (безкоштовно від 3 000 грн), Гарантія 24 місяці (з сервісною книжкою), Ремонт у 18 містах (статус онлайн), Повернення 30 днів (60 днів для зареєстрованих).

**Footer link groups** (`FOOT_COLS`, `index.html:3069-3073`): Каталог / Покупцям / Сервіс, each 5-6 links.

Overall business facts embedded in copy: warehouse in смт Софіївка, 12 showrooms, 18 service cities, 18 640 total catalog positions, free shipping over 3 000 грн, 24-month warranty, 30-day returns (60 for registered users), B2B wholesale from 10 items with personal price lists, deferred payment for companies.

## 5. `data-props` (designer-tweakable options)

Only one component-level `data-props` block exists (`index.html:3033`), both options scoped to section **"Кнопки без заливки"** ("ghost/outline buttons"):

| Prop | Editor | Options / type | Default | Effect |
|---|---|---|---|---|
| `ghostHover` | enum | "Градієнт" / "Терракота" / "Рамка" | "Градієнт" | Controls the hover treatment for all borderless/ghost buttons and links wired to `ghostEnter`/`ghostLeave`: gradient background+dark text+shadow lift, OR solid terracotta fill+white text, OR transparent+brand-colored outline+text (`index.html:3269-3279`). |
| `ghostHoverLift` | boolean | — | `true` | Whether the hover state also translates the button up 1px (`transform: translateY(-1px)` vs `none`) (`index.html:3270-3271`). |

No other `data-props` blocks are present — everything else (layout tokens, copy, product data, filters) is hardcoded JS constants rather than exposed as designer knobs. This is a narrow tweak surface: only the ghost-button hover style is meant to be designer-adjustable in this canvas.

## Design-system components referenced (imported, not defined here)
`ProfiToolDesignSystem_41488b.{ProductCard, Breadcrumbs, FilterGroup, Select, Pagination, Alert, Tabs, SpecTable, PriceBlock, StockStatus, QuantityStepper, Badge, Input, Field, Checkbox, Textarea}` and `PtIcon` (lucide-style icon set, referenced by name e.g. `search`, `heart`, `git-compare`, `shopping-cart`, `truck`, `shield-check`, `map-pin`, `chevron-down`, `sliders-horizontal`, `star`, `trash-2`, `check`, `package`, `send`, `facebook`, `instagram`, `youtube`, `menu`, `user`, `x`, `phone-call`, `rotate-ccw`, `file-text`, `wrench`, `gift`, `layout-grid`, `drill`, `battery-charging`, `flame`, `ruler`, `disc`, `bolt`, `droplets`, `zap`, `hard-hat`, `spray-can`, `trees`). Their internal markup/behavior is not in this file — treat as black-box components to (re)design.
