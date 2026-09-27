# Profitool — дизайн-система

Принято владельцем 2026-09-20. Направление A «Витрина». Макеты:
https://claude.ai/artifact/KKGjeqMnJ37qergEko91RA

Токены, шрифты и логотип перенесены в код (шаги 1, 2, 4 плана 003). Экраны переделываются по
шагам 5–9 в `docs/dev/003-brand-and-redesign/plan.md`, статус в `implementation.md`.

## Логотип

Векторный оригинал: `public/brand/logo.svg`, 152×152, один path с линейным градиентом.
Рисунок не трогаем. Растровые версии собраны из SVG, поэтому чёткие на любом размере:

| Файл | Где |
|---|---|
| `logo.svg` | единственный источник, всё остальное собирается из него |
| `mark-1024/512/256.png` | растры, прозрачный фон |
| `mark-180/128/64/48/32/16.png` | шапка, favicon, мелкие места |
| `apple-touch-icon.png` | 180×180, чёрная подложка, поле 10% |
| `og-base.png` | 1200×630, чёрный фон, знак слева |
| `mark-512-on-white.png`, `mark-512-on-black.png` | для чужих площадок, где прозрачность не поддерживается |

**Важно про знак.** Молоток и зубило нарисованы выбивкой: это не белая заливка, а просвет фона.
На белом они белые, на чёрном становятся чёрными. Поэтому на сайте знак ставится без подложки и
читается как оранжевый квадрат с тёмным инструментом. Ниже 32px деталь молотка теряется:
для favicon 16px это приемлемо, для активных элементов интерфейса знак мельче 32px не ставить.

Лок-ап в шапке: знак 44px, отступ 12px, слово «Profitool» в Unbounded 600, 24px, трекинг −0.01em.
На телефоне знак 34px, слово 19px.

## Цвет

Акцент взят из градиента логотипа.

| Токен | Значение | Где |
|---|---|---|
| `ink-900` | `#000000` | фон страницы |
| `bone` | `#F2EFE9` | основной текст |
| `bone-dim` | `#A0A19D` | вторичный текст, 8,1:1 на чёрном, 7,4:1 на `ink-800` |
| `bone-faint` | `#8A8B87` | подписи третьего плана, 6,1:1 на чёрном, 5,1:1 на `ink-700`. Старый `#6B6D6A` давал 3,7:1 |
| `signal` | `#F18F37` | заливка кнопок, бейдж скидки. Текст на ней только `#000000`, 8,7:1 |
| `signal-hot` / `signal-deep` | `#F5A04F` / `#B8641D` | наведение на кнопку, ползунок прокрутки |
| `signal-text` | `#F5A21A` | акцентный текст на чёрном, активный пункт меню, 10,1:1 |
| `brand-a` / `brand-b` | `#F5A21A` / `#ED7C53` | концы градиента логотипа, взяты из SVG. С 2026-09-22 (006, раунд 2) градиент используется: заливка `signal-btn` («Купити» в шапке и на PDP, «Порівняти» в панели сравнения — чёрный текст держит 7,6:1 и выше в любой точке), текст «Каталог» в шапке и активный индикатор сравнения/избранного на карточке и в buy-box. С раунда 3 та же пара — тонированная заливка `tint-btn` (кнопка «У кошик» на карточке товара в сетке каталога и на рейках): в покое на белом — непрозрачная смесь 38% бренда с белым, рамка 60% (с 2026-09-27, 011: прозрачные 16% сливались с фоном), на чёрном — 20% альфы, чтобы не спорить с фото и ценой; при наведении/фокусе — полная `--grad-brand`, как у `signal-btn`. Больше нигде — фон страницы, карточки, рамки и обычные ссылки остаются плоскими, свой градиент не плодить |
| `brand-a-text` / `brand-b-text` | `#F5A21A` / `#ED7C53` | та же пара, но для текста и иконок: тёмная тема совпадает с brand-a/b, светлая темнее (см. таблицу контраста ниже) — исходные концы дают только 2,1–2,8:1 на белом |
| `stock` | `#A6C34F` | точка «в наличии» |
| `hair` | `rgba(255,255,255,0.10)` | волосяные линии вместо рамок и теней |

Белый текст на `signal` даёт 2,4:1 и запрещён. Старый `#FF4A00` выведен из системы.
Значения замерены по формуле WCAG 2.x, все пары выше проходят AA (4,5:1).

## Светлая тема

Фон чисто белый `#FFFFFF`. Имена токенов те же, значения другие: компоненты про тему не знают.
Светлая включена по умолчанию (решение владельца 2026-09-21), тёмную включает кнопка солнца и луны в шапке (в мобильном меню строка
внизу). Выбор хранится в `localStorage`, ключ `profitool-theme`, `<html>` рендерится с `data-theme="light"`, сохранённый выбор
подставляет скрипт из `<head>` до первой отрисовки, поэтому мигания нет.

| Токен | Тёмная | Светлая | Замер светлой |
|---|---|---|---|
| `ink-900` фон | `#000000` | `#FFFFFF` | |
| `ink-800` / `ink-700` / `ink-600` | `#0E0F11` / `#191A1D` / `#24282C` | `#F5F4F1` / `#E8E6E1` / `#DCDAD4` | |
| `bone` текст | `#F2EFE9` | `#14130F` | 18,6:1 |
| `bone-dim` | `#A0A19D` | `#55564F` | 7,4:1 на белом, 6,0:1 на `ink-700` |
| `bone-faint` | `#8A8B87` | `#6B6C66` | 5,3:1 на белом, 4,8:1 на `ink-800` |
| `signal` заливка | `#F18F37` | `#DE7417` | чёрный текст на ней 6,6:1, граница на белом 3,2:1 |
| `signal-hot` | `#F5A04F` | `#EE923F` | чёрный текст 8,8:1 |
| `signal-text` | `#F5A21A` | `#A9490A` | 5,8:1 на белом, 5,2:1 на `ink-800` |
| `brand-a-text` / `brand-b-text` | `#F5A21A` / `#ED7C53` | `#C2410C` / `#B45309` | 5,0–5,2:1 на белом на всём градиенте (замерено по формуле WCAG, шаг 10%) |
| `stock` | `#A6C34F` | `#3F7D1A` | 5,1:1 |
| `warn` ошибки | `#FFB020` | `#B3261E` | 6,5:1 |
| `hair` / `hair-strong` | белый 10% / 22% | чёрный 10% / 36% | |

Акцент на белом темнее, потому что `#F18F37` на белом даёт 2,4:1: для границы выбранной карточки и для
акцентного текста этого мало. Текст на заливке `signal` остаётся чёрным в обеих темах.

Известное ограничение: обводка кнопок и полей (`hair-strong`) даёт около 1,9:1 в тёмной и 2,5:1 в светлой
теме, ниже 3:1 из WCAG 1.4.11 для границ компонентов. Подписи внутри проходят AA. Поднять обводку можно
одной переменной, но контуры станут тяжелее макета.

Фото товаров вырезаны без фона и лежат прозрачными, поэтому работают на обоих фонах. Стеклянные иконки
разделов нарисованы под чёрный и на белом бледнее, читаются, но перерисовка под светлую тему их улучшит.

## Шрифты

- **Unbounded** — заголовки, цены, слово в логотипе. Начертания 600 и 900. Кириллица полная.
- **Golos Text** — весь остальной текст. 400, 500, 600.
- Моноширинного нет. Sofia Sans Extra Condensed и Geologica выведены.

Шкала: hero 88/52, h1 52, h2 24-28, текст 17-19, вторичный 14-15. Меньше 14px не опускаться.

## Форма

- Скругления: кнопки и чипы полные (999px), миниатюры 18px. Панелей и карточек нет.
- Границы блоков задают волосяные линии, не рамки и не заливки.
- Товар лежит прямо на чёрном фоне. Высота кадра фиксирована: 300px в сетке главной,
  280px в каталоге, 220px в полке похожих.
- Кнопка покупки видна всегда. Появление по наведению запрещено: на телефоне его нет.
- Тап-цель не меньше 44px, включая крестики и степперы.

## Движение

Since 015 motion follows one budget, set as tokens in `globals.css`: hover feedback within
`--dur-fast` (100ms); panels in `--dur-panel-in` (240ms) with `--ease-in`, out `--dur-panel-out`
(180ms) with `--ease-out`; everything else `--ease-std`. Moving parts: the card reveal (the photo steps
back, details rise inside the photo frame), the search panel, the cart drawer or phone sheet, and the
cart pill flashing the brand gradient for 1.2s after an add. `prefers-reduced-motion` turns all of it
into fades. No page-wide fade-ins.


## Экраны

Макеты: https://claude.ai/artifact/KKGjeqMnJ37qergEko91RA

Главная, каталог, карточка товара, корзина, оформление, сравнение, вход и регистрация — 1440.
Главная — 390. Разбор ТЗ и список недостающих экранов: `docs/dev/003-brand-and-redesign/tz-analysis.md`.

## Повторяющиеся блоки

- **Header** (015). From 1024px one row, 72px: logo (mark 32px, word 18px), a dark "Каталог" pill
  that opens the mega menu, an open search field up to 620px, a quiet 14px utility cluster (city,
  support, language, theme as `bar-btn`), the remembered battery platform chip, wishlist, compare and
  the cart pill with the sum. 768–1023px keep two rows; phones keep row 1 (menu, logo, account, cart)
  and row 2 (full-width search). Heights live in `--header-l1`/`--header-l2`/`--header-h`. No service
  strip above the header and no gradient line under it (the owner rejected both).
- **Search panel** (015). Opens under the field. Empty: popular queries and the 8 sections. Typed:
  section hits first, completions with the completed part in bold, up to 3 products with photo and
  price. ↑↓ Enter Esc, combobox ARIA. One matcher for the panel, `/search` and the catalog:
  `src/lib/search.ts`.
- **Product card**. Photo frame of fixed height, brand, model, one key line (with "без АКБ" for bare
  tools), price, the "У кошик" button pinned to the bottom with `margin-top: auto` so buttons in a row
  line up. Discount badge top left, compare and wishlist top right. On pointer devices from 1024px,
  hover or keyboard focus reveals details inside the photo frame: one short line, three specs, the kit
  line. Price and button never move; Esc closes the reveal.
- **Cart drawer** (015). "У кошик" and the cart pill open a right drawer (phones: a bottom sheet) that
  stays until the buyer closes it: lines, free-delivery progress, one cross-sell, total,
  "Оформити замовлення", "Продовжити покупки".
- **Подвал**: логотип с адресом и телефоном, три колонки ссылок, бренды чипами, полоса оплаты.
