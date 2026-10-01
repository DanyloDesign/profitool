# refs-018: dense desktop catalog grids (measured 2026-10-01)

Method: live sites opened in Chrome (Claude in Chrome), values read with getComputedStyle / getBoundingClientRect on the first repeated product card of a catalog page. All numbers are CSS px, "(C)" = computed from live DOM/CSS, "(E)" = estimate or inferred. Viewport was 1536 CSS px wide (1920 screen at 125%), except allo.ua at 1707 (browser reported dpr 1.125). Not exactly 1440-1512, so scale mentally (+-5%). Catalog pages only; home pages not measured except where noted.

Dropped (could not verify): zalando.pl (my catalog URLs returned a 404 page, no grid measured), apple store, dyson, milwaukeetool.com (not opened, time-boxed). Not invented, simply not measured.

## Summary table (catalog page, ~1536 px viewport)

| Store | Container | Cols (with filter sidebar) | Col gap / row gap | Card w x h | Image | Title | Price | Header | Body |
|---|---|---|---|---|---|---|---|---|---|
| jabko.ua /navushnyky/ | max 1430 (C), 15 pad | 4 (C) | 10 / not measured | 255 x 365 | 195x195 (C) | 15px / 21 lh, w700 (C) | 14px w500 (C) | 94 fixed (C) | 14px Gotham Pro |
| answear.ua /k/vin/odyag/kofty | max 1840 grid-container, 61 side pad (C); list column 1084 | 4 (C), 3 at m-4 breakpoint class `l-3` | 12 / 12 (C) | 262 x 487 | 264x396 portrait (C) | 12px / 18 lh, w600 brand (C) | 14px w400 (C) | not measured | 14px Euclid Circular A |
| rozetka.com.ua (new rz-catalog-tile) | max 1600, 32 pad (C) | 5 (C) | 0 / 0, padding inside tile (C) | 241 x 538 | 225x292 (C) | 14px w400 (C) | 20px w700 (C) | 64 static (C) | html 16px, body 10px |
| allo.ua /perforatory/ | max 1600 (C), 0 pad | 4 (C) at 1707 vw | 4 / 4 (C) | 314 x 412 | 184x184 (C) | 14px w400 (C) | 18px w700 new, 12px w400 old (C) | 112 sticky (C) | 11px Arial |
| epicentrk.ua /shop/perforatory/ | max 1600, 8 pad inside main max 1920 (C) | 3 (C) | 4 / 4 (C) | 317 x 508 | 190x162 (C) | 13px w700 (C) | 21px w700 (C) | 102 static (C) | 13px Roboto |
| toolstation.com /power-tools/drills/c719 | max 1330, 16 pad (C) | 3 (C) | 24 / 24 (C) | 307 x 525 | not measured (48x48 read was a badge) | 15px w600 (C) | 20px w700 (C) | 191 relative (C) | 16px Source Sans Pro |
| ssense.com /en-us/men/sneakers | no max found; grid column area 996 wide, 255 left / 285 right inset (C) | 4 (C) | 10 / 20 (C) | 241 x 417 | 241x362 portrait (C) | 11px w400 (C) | 11px w400 (C) | not measured | 11px interFont |

Left/right grid insets (card edge to window edge) at 1536: jabko 410 / 76, answear 375 / 77, rozetka 282 / 47, allo 330 / 107 (at 1707), epicentr 129 / 449, ssense 255 / 285. Left value includes the filter sidebar. Epicentr right 449 is probably another column or empty space; I did not verify what fills it.

## Per reference: what to take

**rozetka.com.ua** (best for density in this set). 5 columns at 1536 with a 1600 max container and 32 px page padding. Tile is 241 px wide, image 225x292, title 14px, price 20px bold, so price is the loudest thing and the title stays small. Header is 64 px, the slimmest measured. Take: 5-up grid with zero grid gap and internal padding (hairline separation fits our no-card, hairline style), compact 64 px header, price at ~20px. Avoid: its badge/delivery/bonus text clutter (the owner rejected "too much info"). Note body font reads 10px; real text sizes live on components.

**jabko.ua** (the owner's spirit reference). Catalog container max 1430 px, 4 columns of 255 px, gap 10 px, 195 px square image, title 15px bold (21 lh), price 14px/500. Header 94 px fixed. Body 14px. Take: the very small gap (10 px), square image around 195 px inside a 255 px card (~76 percent fill), body 14px. At 1536 the grid is 4-up only because of the 1430 container plus left filters; at 2048 (75 percent zoom) the container still caps at 1430, so jabko does not use full width. Home carousel card measured 289 wide, image 229, but that is a slider, not a grid (E).

**answear.ua** (the owner's other reference). Wide container max 1840 with ~61 px side padding, list column 1084 px next to filters, 4 columns of 262 px, 12 px gaps both ways, portrait 264x396 image, brand 12px bold, price 14px regular. Header not measured. Take: gap 12 px, small regular-weight price, image-led portrait card, the generous 1840 max that does use width on big screens. The grid class names suggest breakpoints (xs-6, m-4, l-3), meaning 2/3/4 columns by breakpoint (E from class names, 4 confirmed at 1536). Weakness: only 4 columns even with 1840 container; cards are tall (487).

**allo.ua**. Max 1600, 4 columns of 314 px at 1707 viewport, gap 4 px both ways, image 184 px square inside a 314 px card (small image, lots of padding), title 14px, price 18px bold with 12px strike-through old price. Header 112 px sticky. Body 11px Arial. Take: 4 px gap and the price hierarchy (18 bold vs 12 old). Avoid: image occupying only 59 percent of the card width, 11px body, 112 px sticky header (eats the screen).

**epicentrk.ua**. Container max 1600 inside a 1920 main, 6-column inner grid, cards span 2 so 3 per row, 317x508 card, 4 px gaps, 13px bold title, 21px bold price. Header 102 px. Only 3 per row at 1536. Take: nothing for density; it is the counter-example. Price at 21px bold shows the same pattern as rozetka (price 20-21px).

**toolstation.com**. Container max 1330, 3 columns of 307 px, gap 24 px, title 15px/600, price 20px/700, header 191 px (promo bars plus nav). Take: only the clear price emphasis. It is the least dense: 3 columns, 24 px gaps, 191 px header. Use as the thing to avoid. Image size not measured.

**ssense.com**. 4 columns of 241 px, gap 10 px horizontal, 20 px vertical, portrait image 241x362 (full card width), brand/name/price all 11px regular, no card chrome. The grid area is 996 px with large side insets (255 / 285), so a lot of screen is empty (I did not verify whether the insets are sidebar and margin or a centered column). Take: type tiny and uniform, image fills the full card width, row gap bigger than column gap (20 vs 10), no borders. It is the stylistic twin of black/white minimal. Warning: 11px text is below our 14px floor (CLAUDE.md: nothing under 14px for text), so copy the structure, not the size.

## Patterns across the set (all (C) unless marked (E))
- Gaps are tiny: 0, 4, 4, 10, 10-12, 24. Median 10. Our target: 10-12 px.
- Image is 195-264 px wide inside 241-317 px cards. Fill is 59 to 100 percent; ssense and answear (full width) look best.
- Title 12-15px, price 14-21px. Stores that sell on price (rozetka, epicentr, toolstation, allo) make price 18-21px bold; the fashion/Apple-like ones (answear, jabko, ssense) keep price 11-14px.
- Header 64 (rozetka), 94 (jabko), 102, 112, 191. Slimmer header means more products above the fold.
- Container: 1330, 1430, 1600, 1600, 1840. Nobody goes full-bleed; max widths 1430-1840 with 16-61 px side padding. Columns at 1536 with filters: 3-5.
- Owner's "75 percent zoom" equals a 2048 CSS px viewport at 1536 screen width: 1536/0.75. Of these sites only rozetka/allo/epicentr/answear caps (1600/1600/1600/1840) would keep growing columns via max-width; I did not test 2048 on any site (not measured).

## Not measured / caveats
- Home pages: not measured (jabko home was a slider).
- Row gaps for jabko, header height for answear and ssense: not measured.
- Auto-detected "first card" can be a promo tile; I checked jabko, rozetka (card text), allo and epicentr (64 li) by hand, the rest by the heuristic.
- Toolstation image size, zalando, apple, dyson, milwaukee: not measured.
- Sites change; values are of 2026-10-01 on one machine (dpr 1.25 and 1.125).
