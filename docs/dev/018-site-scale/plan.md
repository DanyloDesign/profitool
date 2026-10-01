# 018 · Plan

Jira: [KAN-31](https://deangeme.atlassian.net/browse/KAN-31) · branch `KAN-31-desktop-density`

## Decision (2026-10-01)

The owner left the choice to the agent ("Роби як ти вважаєш правильним"). Picked: grid B with the
home first screen of C.

- Scale: CSS `zoom` on the root. 0.8 from 1280px, 0.75 from 1440px (the owner's 1512 MacBook gets
  exactly the 75% he liked). Below 1280px nothing changes: at 1024-1279 a 75% zoom would put body
  text under 13px on small laptops.
- Grid: shell cap 1440 → 1920 CSS px (≈1440 on screen at 0.75), so the page fills the screen.
- Catalog: 5 columns from 1280px, filter column 264 → 240px. Not 6 (C): photos would drop to
  ~210px on screen, and the owner asked for large objects.
- Home: hero becomes a band (no description line, image 560 → 340px), sale row moves directly
  under the battery picker, categories after it. Home rows of 5 (take 4 → 5).
- Wishlist grid 4 → 5 columns to match.
- Phones and tablets: unchanged.

## Steps

| # | Step | Files | Check |
|---|---|---|---|
| 1 | Root zoom 0.8 / 0.75, shell 1920 | `globals.css` | 1512 shot: no side voids; mega menu, search, cart drawer, sticky filters positioned right |
| 2 | Catalog and wishlist 5 columns | `catalog-view.tsx`, `wishlist-view.tsx`, `product-section.tsx` | catalog first screen ≥5 cards |
| 3 | Home band and order | `page.tsx` | home first screen shows the sale row |
| 4 | Verify | `tools/shots` | 1512 light/dark, 1280, 1024, 390; smoke.mjs green; eslint, tsc clean |
| 5 | Review | reviewer subagent (fresh context) | defects list |
| 6 | PR, merge, Pages deploy, live check | | live shot |

## Risks

- `zoom` and `100dvh` in the search panel and menus: max-height may come out at 75% of the screen.
  Checked in step 1, compensated by dividing by the zoom factor if needed.
- Small text at 75%: ~10.5px labels. Accepted by the owner's own browser test; contrast unchanged.
- Size: M (≈3-4h of the 12h estimate went into the proposal).
