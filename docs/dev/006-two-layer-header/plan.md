# 006 — План

Розмір: M. Файли: `src/components/layout/header.tsx`, за потреби `city-select.tsx`, `support-menu.tsx`,
`globals.css` (`--header-h`), `DESIGN.md` (опис шапки), `tools/shots/smoke.mjs` (якщо ламаються селектори).

| Крок | Хто | Перевірка |
|---|---|---|
| 1. Перебудова шапки в два шари, ≥1024 | builder (Sonnet) | порядок елементів як у `ref-header.md`, без дублів |
| 2. Планшет 768–1023 і мобільний <768: два ряди, пошук другим | той самий builder | 360/390/768 без overflowX |
| 3. Поповери під своїми тригерами (дефект 10 з 005) | той самий builder | координати поповера = тригер |
| 4. `--header-h`, sticky, відступи сторінок і sticky-елементів під шапкою | той самий builder | sticky BuyBox, фільтри, compare-bar не ховаються під шапку |
| 5. `tsc`, `lint`, `smoke.mjs`, скріншоти 1440/1024/768/390, обидві теми | builder, потім reviewer | 0 помилок, скріни в `shots/` |
| 6. Рев'ю свіжим контекстом | reviewer (Sonnet) | список дефектів |

Ризики: зміна висоти шапки зсуває все, що прив'язане до `--header-h` (sticky-панелі, scroll-margin).
Chrome-розширення не відкриває localhost, тому візуальна перевірка йде через `tools/shots` (puppeteer, локальний Chrome).
