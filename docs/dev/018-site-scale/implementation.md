# 018 · Implementation

Jira: [KAN-31](https://deangeme.atlassian.net/browse/KAN-31) · branch `KAN-31-desktop-density`
Proposal artifact: https://claude.ai/artifact/GKZjxQT5thArkFASzNJjAA

## What changed

- `globals.css`: root `zoom` 0.8 from 1280px, 0.75 from 1440px, `--zoom` token; shell cap
  1440 → 2048px from 1280px. Panels with `dvh` divide by `--zoom` (viewport units are not zoomed,
  measured: search panel max-height came out at 631px on a 945px screen before the fix).
  Product photo 560 → 680px from 1280px; the sticky buy column height gate gets zoomed variants.
- Catalog and wishlist: 5 columns from 1280px (was 3 and 4). Home sections: 5 cards from 1280px,
  4 below (5th hidden with `max-xl:`), `take()` 4 → 5.
- Home from 1280px: hero image 560 → 420px and tighter paddings, sale row right under the battery
  picker, categories after it. Phones and tablets keep categories first (two renders, one hidden
  per range, so DOM order equals visual order).
- Product page: buy column 440 → 520px from 1280px. Mega menu: 3 category columns from 1280px.

## Result (1512×945)

| | Catalog cards, first screen | Home |
|---|---|---|
| Before | 3 | 0 products visible |
| After | 5 | sale row visible (photos, names, prices; buttons below the fold) |

## Checks

- `smoke.mjs` 30/30 (1512 and 390), eslint on changed files clean, `tsc --noEmit` clean.
- Shots 1512 light/dark: home, catalog, product, mega menu, search panel, cart drawer; 1280, 1024
  (unchanged), 390 (unchanged, no overflow). In `shots/`.
- Reviewer (fresh context) found 5 major, 9 minor. Fixed: phone order leak, product page void,
  hero description dropped, filter column too narrow, mega menu dead space, sticky gate.

## Deviations

- Implemented by the orchestrator, not a builder subagent: one tightly coupled CSS change across
  six files, faster than briefing.
- Tech Desing field cannot be set through the API (not on the KAN screen, see 017); the link is in
  the ticket description.

## Known defects (not fixed)

- Small text: brand line, card meta, filter counts render at ~9-10.5px on screen at 0.75. The owner
  approved the 75% look; if it reads too small, raise the small tokens at xl only.
- 1279 → 1280px is a visible jump in scale. A 1280×720 laptop shows one product row.
- Home hero still has empty space between text and photo at 1512.
- 5 columns leave short last rows (7 rotary hammers = 5 + 2).
- `min-h-[40vh]` / `[60vh]` placeholders are not zoom-compensated (render ~25% shorter). Harmless.
- Firefox older than 126 ignores `zoom` and shows the 2048px shell at 100%.

## Scores

hierarchy 7 · typography 6 (small labels) · color 8 (unchanged) · spacing 7 · originality 5
(a density pass, no new form) · fit to brief 8.
