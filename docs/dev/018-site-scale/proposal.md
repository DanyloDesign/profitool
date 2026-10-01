# 018 · Proposal

Jira: [KAN-31](https://deangeme.atlassian.net/browse/KAN-31)

## Baseline (measured 2026-10-01, 1512×945, real pages)

| | Catalog, cards fully in first screen | Home, cards in first screen |
|---|---|---|
| Today, 100% | 3 | 0 |
| Plain 75% zoom, no grid change | 3 | 0 |

Plain 75% zoom changes nothing commercially: the 1440px shell shrinks to 1080px and leaves 216px
of empty margin on each side, and the catalog stays at 3 columns. This confirms the owner's note.

## Directions

All three render at the owner's 75% scale on desktop (from 1024px). Prototypes are CSS overrides
on the live dev pages, screenshots in the comparison artifact.

Artifact: https://claude.ai/artifact/GKZjxQT5thArkFASzNJjAA
References with measured numbers: `references.md` (rozetka, jabko, answear, ssense, toolstation).
Takeaways: 10-12px gaps between cards (median of the set), 64px header (rozetka), price as the
loudest line on the card, wide container that still works on big screens (answear, 1840px).

### A. 75% and a wider shell (safe)
Shell 1440 → 1840px (≈1380px on screen), catalog 4 columns, home rows of 5.
Catalog first screen: 4. Home: 0.
Weakness: the home page still opens with no products; ~66px margins remain.

### B. Full width (recommended)
No shell cap, 48px gutters on screen, filters 264 → 240px, catalog 5 columns, home rows of 6,
hero image 560 → 440px. Catalog first screen: 5. Home: 0.
Weakness: the hero still fills the first home screen; on 1920px+ screens rows need a cap
(proposed: 1920px layout max, 6 columns).

### C. Storefront from the first screen (risky)
Full width, catalog 6 columns, hero collapsed to a band (no description, image 330px), sale row
moved directly under the hero, categories below it. Catalog first screen: 6. Home: 6.
Weakness: breaks the owner's earlier "large objects, air" rule; categories drop below the fold;
product photos shrink to ~210px on screen.

## Default check

- layout | default: centered 1440 container with margins | chosen: full-bleed grid with a fixed
  gutter (B, C) | why: the owner's complaint is exactly the empty margins and too few products.
- type | default: keep the type scale and only zoom | chosen: 75% of the current scale, Unbounded
  and Golos Text stay | why: the owner approved the look at 75%; faces are part of the system.
- color | default: unchanged | chosen: unchanged | why: out of scope, the brief is density.
- motion | default: unchanged | chosen: unchanged | why: out of scope.

## Implementation method (for the plan)

Two ways to reach 75%:
1. `zoom: 0.75` on the root from 1024px plus grid changes. Fast, exact match of what the owner saw.
   Risks: `vh`/`dvh` values and `getBoundingClientRect`-based popover positioning must be checked.
2. Rewrite the desktop type and spacing tokens to 75% values. Cleaner, but touches ~370 hardcoded
   px values (overlaps KAN-14), several times the effort.

Recommendation: method 1 now, KAN-14 later converts the remaining px to tokens.

## Known limits

- At 75% the 14px labels render at ~10.5px on screen and body text at ~12.75px. The owner
  accepted the look in the browser; contrast and readability are re-measured in implementation.
- Prototypes temporarily show 6 products per home section (`page.tsx` take 4 → 6); the plan
  decides the final count per direction.
