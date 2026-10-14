# 021 · Implementation

Jira: [KAN-121](https://deangeme.atlassian.net/browse/KAN-121) · branch `KAN-121-site-scale-90`

## What changed

Only `src/app/globals.css`:
- `:root { --zoom: 0.9; zoom: var(--zoom) }` from 1024px.
- Search/catalog panel `max-height` and the mobile sheet `85dvh` divide by `var(--zoom, 1)`.
- Sticky buy column gate `min-height` 880 → 792px (880 × 0.9).

No markup, component, grid or token changes. Below 1024px the site is untouched.

## Checks

- Chrome (owner's browser, tab group): home, catalog, product page, search panel open. Root zoom
  computes to 0.9, no horizontal scroll, console clean. Search panel fits the viewport.
- Puppeteer 1512×945 and 390×844: `shots/home-1512.png`, `shots/home-390.png`. 390 is unchanged.
- `smoke.mjs` 30/30.

## Known issues

- The owner's Chrome keeps 90% browser zoom for `localhost:3000` (measured `devicePixelRatio`
  1.125 = 1.25 Windows scaling × 0.9). With the CSS zoom on top the page shows at 81% until the
  browser zoom is reset with Ctrl+0.
- Product page spec tile "125 × 1,0 мм" wraps onto two lines; seen after the change, not compared
  with the state before.
- Browser zoom also moves breakpoints (CSS viewport grows by 1/0.9); CSS `zoom` does not. Near
  1024 / 1280 / 1536px the layout can differ from what the owner saw with Ctrl+minus.
- Firefox older than 126 ignores `zoom` and shows 100%.

## Scores

hierarchy 8 · typography 7 · color 8 (unchanged) · spacing 8 · originality n/a (scale only) ·
fit to brief 8.
