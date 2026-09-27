# 006 — Implementation

Phase: IMPLEMENTATION, done.

## Files changed

- `src/components/layout/header.tsx` — rebuilt into two layers (md+) and a separate mobile
  two-row block (<768). Layer 1: `Logo` left, `CitySelect` / `SupportMenu` / new `LangSwitch`
  pill / `ThemeToggle` right, hidden below md. Layer 2: burger (768–1023, opens `MobileMenu`) or
  signal-btn "Каталог" (≥1024, opens `MegaMenu`), `SearchBox` (`flex-1 max-w-[660px]`), then
  `Actions` (account, wishlist, compare, cart — theme and language removed from here, they moved
  to layer 1). Mobile (<768): row 1 burger/logo/account/cart, row 2 full-width `SearchBox`
  (replaces the old mobile search-icon link to `/search`). `MegaMenu` footer no longer repeats
  city/support/account/theme (they're always visible in the header at md+ now); `MobileMenu` is
  unchanged in content, still carries city/support/language/theme for <1024 (kept per brief).
  Two `data-menu-trigger="mobile"|"tablet"` attributes added to the two burger buttons so tooling
  can target the visible one (both share `aria-label={dict.nav.menu}`, only one is ever rendered
  visible via CSS at a given width).
- `src/components/layout/support-menu.tsx` — `fullWidth` prop replaced with `variant: "bar" | "full"`.
  `"bar"` (new default) is a bordered `ghost-btn btn-sm` pill (icon always, label + chevron
  `hidden lg:inline`) for layer 1. `"full"` is the unchanged mobile-menu chip.
- `src/components/layout/city-select.tsx` — inline label truncation widened at lg
  (`max-w-[64px] lg:max-w-[120px]`) so the city name isn't over-truncated on wide screens; no
  other change (its popover was already anchored correctly, see Defect 10 below).
- `src/app/globals.css` — `--header-h` is now `calc(var(--header-l1) + var(--header-l2))`, with
  `--header-l1`/`--header-l2` set per breakpoint (see Heights). All existing `--header-h`
  consumers (`scroll-padding-top`, product page sticky column, cart/checkout sticky aside,
  MegaMenu/MobileMenu `top-`) needed no code change, they read the recomputed variable.
- `DESIGN.md` — header paragraph rewritten for the two-layer structure.
- `tools/shots/smoke.mjs` — mobile-menu click selector now targets `[data-menu-trigger="mobile"]`
  (two burger buttons now exist in the DOM, one per breakpoint; the untargeted selector matched
  the CSS-hidden tablet one at 390px and Puppeteer refused to click it).
- `tools/shots/overflow.mjs` — added an optional width CLI arg (was hardcoded to 390) to run it
  at 360 too, as the task required.
- `tools/shots/package.json` (new, untracked, not part of the deliverable) — minimal boundary
  file so `npm i puppeteer-core --no-save` doesn't collide with the pnpm-managed root
  `node_modules` (an npm/Arborist bug on this machine, unrelated to the header work).

## Sticky behaviour

Chosen: whole header stays `sticky top-0` (unchanged), both layers scroll with it as one unit.
Simpler and robust, matches what `MegaMenu`/`MobileMenu`/`--header-h` consumers already assumed;
"layer 1 scrolls away" would need a second sticky context and its own height bookkeeping for no
clear benefit the brief asked for.

## Header heights (`--header-l1` / `--header-l2` / `--header-h`)

| Breakpoint | l1 | l2 | total |
|---|---|---|---|
| <768 (mobile, two rows) | 56px | 64px | 120px |
| 768–1023 (tablet, compressed) | 48px | 64px | 112px |
| ≥1024 (desktop) | 52px | 72px | 124px |

## Defect 10 (popover anchoring)

`CitySelect`/`SupportMenu` already wrapped trigger+popover in their own `relative` div with the
popover `absolute left-0 top-[...]` against it — structurally correct already in the working
tree I started from. Verified in the browser: city popover opens flush under the city button at
1440px (screenshot `ua-1440-city-popover.png`). No code change was needed for the anchoring
itself; I only widened the desktop truncation width in `city-select.tsx`.

## Verification

- `npx tsc --noEmit` — 0 errors.
- `pnpm lint` — 0 issues (whole project, not just touched files).
- `node tools/shots/smoke.mjs` — 28/28 passed (after fixing the mobile-menu selector, see above).
- `node tools/shots/overflow.mjs http://localhost:3000/ua 390|360` — no overflow.
- `node tools/shots/overflow.mjs http://localhost:3000/ua/catalog/grinders 390|360` — one false
  positive: the quick-filter chip strip (`src/components/catalog/quick-chips.tsx`, pre-existing,
  untouched) is an intentional `overflow-x-auto` row; `scrollWidth === viewport` in both runs, so
  the page itself does not scroll horizontally. Not a header defect.
- Screenshots in `shots/`: `ua-1440-light.png`, `ua-1024-light.png`, `ua-768-light.png`,
  `ua-390-light.png`, `ua-1440-dark.png`, `ua-390-dark.png`, `catalog-1440-light.png`,
  `catalog-390-light.png`, `ua-1440-city-popover.png`, `product-1440-light.png`, plus tight
  header-only crops `hdr-1440/1024/768/390/360.png`. Looked at all of them: layer order matches
  `ref-header.md` (logo → city/support/lang/theme; catalog/burger → search → account/wishlist/
  compare/cart), no duplicated controls at any width, no our-style regressions (still our orange
  signal button, pill shapes, hairline separators, Golos/Unbounded, no promo strip, no gradient).
  Dark theme unaffected. Product/catalog pages: content starts correctly below the taller header,
  sticky buy-box column doesn't overlap it.

## Known defects / deviations

- Language switch is a direct link toggling the two locales (labelled with the *current* locale,
  "Укр"/"Рус", bordered pill + chevron, matching the reference's look) rather than a real
  dropdown — there are only two locales, a popover would be needless complexity. Documented as a
  deliberate simplification.
- Tablet (768–1023) reuses the existing burger → `MobileMenu` (categories drawer) instead of the
  "Каталог" signal-btn / `MegaMenu`, per the plan's explicit allowance ("burger may replace
  catalog text"). Simpler and avoids squeezing the `MegaMenu` two-column grid into tablet width.
- At tablet width, opening the `MobileMenu` drawer (via that burger) repeats city/support/
  language/theme/account/wishlist/compare, which are already visible in the persistent layer 1/2
  above it. The brief explicitly says to keep these in `MobileMenu`; not fixed, flagged for the
  owner's call if it's worth a tablet-specific drawer content later.
- Did not verify contrast numbers for the new `ghost-btn`-style support/language pills in layer 1
  — they reuse the existing `ghost-btn` utility and `--hair-strong`/`--bone` tokens already
  measured in `DESIGN.md`, so no new colors were introduced, but I did not re-run
  `tools/shots/contrast.mjs`.

## Fix round 1 (2026-09-22)

Fixed defects 1 and 2 from `review.md`. Defects 3 (contrast) and 4 (pre-existing, out of scope) untouched.

**Defect 1 (BLOCKER, duplicate drawer controls)** — `header.tsx` `MobileMenu`: wrapped the
city/support block, the compare/wishlist/theme block, and the language row in `md:hidden`
(they duplicate layer 1 + Actions from 768px up). Removed the Account `MenuLink` entirely — it
was always a duplicate (mobile row 1 and tablet+ Actions both show it). Catalog categories stay
unconditional (never shown elsewhere). Result: tablet drawer (768–1023) shows only catalog nav;
mobile drawer (<768) shows catalog + city/support/language/theme/wishlist/compare, no account.

**Defect 2 (MAJOR, inconsistent layer-1 controls)** — unified all four to `ghost-btn btn-sm`:
`city-select.tsx` non-fullWidth button now `ghost-btn btn-sm shrink-0 gap-1.5 !px-3` (was a
borderless text button); `theme-toggle.tsx` `ThemeToggle` now `ghost-btn btn-sm w-11 shrink-0
!px-0` (was `icon-btn`, borderless circle) — same 44px height/border as the others, square-ish
footprint, icon unchanged; `support-menu.tsx` bar variant gap unified to `gap-1.5` (was `gap-2`).
`LangSwitch` chevron removed (`header.tsx`) — it implied a dropdown menu that doesn't exist;
kept the plain current-locale label, no globe/swap icon added. Removed the now-unused
`IconChevron` import from `header.tsx`. `DESIGN.md:114` already described this target state
(`ghost-btn btn-sm` for all four); no doc change needed.

**Verified**
- `npx tsc --noEmit` — clean, no errors.
- `pnpm lint` — clean, no warnings.
- `node tools/shots/smoke.mjs` — 28/28 passed (incl. theme-toggle and mobile-menu checks).
- Screenshots read directly: `hdr-1440.png`, `hdr-1024.png`, `hdr-768.png`, `hdr-390.png`,
  `hdr-1440-dark.png`, `drawer-768.png`, `drawer-390.png` (`tools/shots/shot.mjs` /
  `click.mjs` on `[data-menu-trigger="tablet"]` / `[data-menu-trigger="mobile"]`).
  City/support/lang/theme are now one visual language (bordered pill/circle, 44px, same gap) at
  1440/1024/768, in light and dark. `drawer-768.png` shows categories only, no repeated controls.
  `drawer-390.png` shows categories + city/support/compare/wishlist/theme/language, no account
  (already in the mobile header row) and no catalog duplication.

**Not fixed / deferred**: defect 3 (contrast re-measure) and defect 4 (catalog aside sticky,
pre-existing, not a 006 regression) — out of scope for this round, per the task.

**Known defect found this round**: none new. Search width and unrelated uncommitted changes
untouched, per instructions.

## Round 2 (owner edits)

**Edit 1 revised mid-task**: owner cancelled "widen layer 1 past the container" — kept `shell`
on both layers (logo aligned above "Каталог"). Fixed instead: 44px pills had ~2–4px top/bottom
padding. `--header-l1` raised 48/52→60px at 768/1024px tiers, 8px each side, `--header-h` unchanged formula.

**Files**: `src/app/globals.css` (tokens, `:root`, light theme, `--header-l1` media queries,
`signal-btn`), `src/components/layout/header.tsx` (Каталог button), `src/components/ui/icons.tsx`
(`IconGradientDefs`, `gradient` prop on `IconCompare`/`IconHeart`), `src/app/[locale]/layout.tsx`
(renders defs once), `product-card.tsx`, `buy-box.tsx`, `DESIGN.md`, `tools/shots/interact.mjs`
(megamenu selector was `.signal-btn`, stale after Каталог lost that class — swapped for new
`data-menu-trigger="desktop"`).

**Tokens**: `--color-brand-a-text`/`-b-text` (dark = brand-a/b, light = `#C2410C`/`#B45309`),
`--grad-brand` (buttons, fixed both themes), `--grad-brand-text` (Каталог text + active
compare/wishlist icon, theme-aware).

**Contrast** (WCAG formula, brand-b end = worst case): black text on `--grad-brand` 7.6–10.1:1
(≥7 required). `--grad-brand-text` on white 5.0–5.2:1 (≥3 required), on black 7.6–10.1:1.

**Commands**: `tsc --noEmit` clean, `pnpm lint` clean, `smoke.mjs` 28/28, `overflow.mjs` 390/360 clean.

**Shots** (`shots/r2-*`): header 1440/1024/768/390 × light/dark, home hero (gradient "Купити"),
catalog grid, PDP (gradient "У кошик"), catalog with compare active (seeded, gradient icon on
one card only), focus ring on Каталог, MegaMenu still opens. Looked at all: layer-1 padding
fixed, logo/Каталог misaligned as owner accepted, gradients render both themes, no defects.
Caught+fixed one bug pre-shots: `decoration-transparent` hover-underline rendered solid even
unhovered — replaced with `hover:-translate-y-0.5`.

**Known defects**: no `:hover` in headless shots, checked via computed-style + click instead.
Tablet drawer duplication (round-1 defect) untouched, out of scope.

## Orchestrator check after round 2 (2026-09-22)
- Read r2 shots 1440 light/dark, catalog with compare active; re-shot `/ua/catalog/grinders` 1440: no underline under «Каталог» (the one in `r2-catalog-compare-active-1440-light.png` is a stale pre-fix frame), overflowX false.
- Gradient: «Каталог» label, filled buttons («Купити», «Порівняти» in compare bar), active compare icon. Card «У кошик» buttons are outline, stay without gradient — asked owner.
- Pre-existing, outside 006: sort label clipped to «Сортуванн» on catalog at 1440.
- Dev server was killed during round 2; restarted by orchestrator.
- Chrome extension still cannot reach localhost; checks via `tools/shots` only.
- Scores: hierarchy 7, typography 7, color 7, spacing 7, originality 5, fit to brief 8.

## Round 3 (card buttons)

**Files**: `globals.css` (`--tint-btn-bg`/`-border` tokens, `@utility tint-btn`,
`.tint-btn[data-state="added"]`), `product-card.tsx` (`ghost-btn`→`tint-btn` + `data-state`),
`filters.tsx` (sort fix), `interact.mjs` (`cardhover`/`cardfocus`, THEME/SEED support), `DESIGN.md`.
**Tokens**: rest = brand-a/b via `color-mix(...,transparent)`, 16% alpha light / 20% dark, border
32%/34%. Hover/focus = full `--grad-brand` via `::before` opacity 0→1, 180ms, black text; base
transitions 150ms — reduced-motion covered by the existing global rule, no local override.
**Contrast**: rest text on tint 13.7–16.5:1 (need 4.5:1) both themes — large headroom by design.
Hover reuses `signal-btn`'s 7.6–10.1:1 black-on-`--grad-brand`.
**Commands**: `tsc --noEmit` clean, `pnpm lint` clean, `smoke.mjs` 28/28, `overflow.mjs` 390/360
clean (one pre-existing 3px chip overflow, unrelated).
**Sort fix**: span lacked `shrink-0`/`nowrap`, select was `w-full` inside an auto-width flex
`<label>` — circular sizing let select win, hiding «Сортування»'s "я" behind it. Fixed: span
`shrink-0 whitespace-nowrap`, select `flex-1 min-w-0`.
**Shots** (`shots/r3-*`): catalog 1440/390 light/dark, home 1440 dark, RU catalog, card
hover/focus (ring + full gradient via `:focus-visible`), in-cart (green, distinct). Read all: tint
reads as warm hint next to photo/price, not a block; hover pops one card; in-cart stays green.
**Known defects**: none this round. Pre-existing chip overflow and round-1 drawer dup untouched.

## Orchestrator check after round 3 (2026-09-22)
- Read r3 catalog 1440 light/dark and hover light. Light: peach tint sits quietly under prices, hover gradient singles out one card. Sort label now full.
- Dark: 20% tint on black reads as muddy brown, heavier than the light variant; proposed to owner a lower alpha or a gradient hairline border instead.
- Scores: hierarchy 7, typography 7, color 6 (dark tint), spacing 7, originality 6, fit to brief 8.

## Round 4 — Liquid Glass variants (proposal, 2026-09-22)
- Artifact: https://claude.ai/artifact/4CGKwbBn1B25c3PmZqjNdo (v2). CSS drafts: `glass-variants.css`. Shots: `shots/r4-variants-*.png`.
- v1 was rejected by orchestrator: glass renders instead of real photos, decorative blobs behind cards. v2 uses real catalog photos and flat backgrounds.
- Orchestrator verdict: A reads as a gray pill on black (weak). B is the only one that reads as glass on a flat bg, close to current tint-btn. C covers the lower part of the product photo, needs a scrim, changes the card layout.
- Waiting for owner's pick. Site code unchanged in this round.
- 2026-09-22: owner cancelled the glass idea. Card buttons stay on `tint-btn` from round 3. `glass-variants.css` kept only as a record.
- 2026-09-22: owner cancelled gradient on header icons before any edit; agent stopped, no files changed.

## Hero photo fix (2026-09-22)
- `public/products/rotary_hammer-milwaukee-photo.png`: opaque white fill inside the handle loop (14 148 px, flood fill from 575,330) made transparent, 3px edge ring faded and darkened against halo. Original: `docs/dev/006-two-layer-header/rotary_hammer-milwaukee-photo.orig.png`. Lettering and marks untouched.
- Checked: crops on black and white, home 1440/390 dark (`shots/r6-hero-*-dark.png`), overflowX false.
- Scan of all `*-photo.png` for large opaque near-white regions flagged candidates to review by eye (many are real white parts): circular_saw-bosch, rotary_hammer-metabo, grinder-metabo, grinder-bosch, circular_saw-metabo, rotary_hammer-ryobi. Not fixed, waiting for owner.
