# 006 — Review (fresh eyes)

Formed independently from request.md / ref-header.md / CLAUDE.md / DESIGN.md / code / screenshots,
before reading implementation.md.

## Defects

### 1. BLOCKER — duplicate controls at tablet width (768–1023px)
Opening the burger (`data-menu-trigger="tablet"`) shows `MobileMenu`, which unconditionally
renders City, Support, Theme, Language *and* Account/Wishlist/Compare rows
(`src/components/layout/header.tsx:503-519`) with no breakpoint gate. At 768–1023px, layer 1
(`header.tsx:73-83`, visible from `md:`) and layer 2's Actions (`header.tsx:113-115`, visible from
`md:`) already show these same controls above the drawer. Result: City/Support/Theme/Language/
Account/Wishlist/Compare each exist twice on screen at once. Violates the request's own success
criterion "без дублювання кнопок" and my brief's "every control appears exactly once per
breakpoint." Verified live: `tabletmenu900.png` (900px, burger open) — "Київ" and "Підтримка" pills
sit both in the header above and again inside the drawer.
Note: `implementation.md` line 77 ("no duplicated controls at any width") contradicts its own
"Known defects" section (lines 91-94), which already admits this and leaves it unfixed.
Fix: wrap the city/support/theme/language/account/wishlist/compare rows in `MobileMenu` with
`md:hidden`, or give the tablet burger a categories-only drawer body.

### 2. MAJOR — layer-1 controls don't share one visual language, contradicts DESIGN.md
`DESIGN.md:114` describes all four right-side controls as "окантовані пілюлі `ghost-btn btn-sm`."
In code only `SupportMenu` and `LangSwitch` use `ghost-btn btn-sm` (bordered pill).
`CitySelect` (`city-select.tsx:54-58`) is an unbordered plain-text button; `ThemeToggle`
(`theme-toggle.tsx:42`) is a round, unbordered, label-less icon button. Three distinct shapes sit
in one row (`hdr-1440.png`, `hdr-1024.png`). This reproduces `ref-header.md`'s own inconsistency
(city unbordered, support/language bordered, lines 18-36) instead of the single "наш стиль" the
owner asked for when confirming structure-only reuse.
Fix: put City and Theme in the same `ghost-btn btn-sm` treatment as Support/Language (or the
reverse — drop borders from all four) and correct DESIGN.md to match whichever is chosen.

### 3. MINOR — layer-1 contrast never re-measured against its real surface
`implementation.md:95-98` admits `tools/shots/contrast.mjs` was not re-run. The general
`bone`/`bone-dim` AA numbers in `DESIGN.md` were measured against flat `ink-900`, not against the
header's actual `bg-ink-900/90` + `backdrop-blur-xl` translucent surface over a scrolled page. No
new tokens were introduced, so this is unlikely to fail, but it is unverified, not confirmed safe.

### 4. MINOR — catalog filters aside was never made sticky
`src/app/[locale]/catalog/[[...slug]]/page.tsx:119` — `<aside>` has no sticky class at all, so it
isn't part of the "sticky element hidden under header" risk to begin with. Pre-existing, not a
006 regression, listing it because the review brief asked to check this specific element.

## What checked out
- Element order matches `ref-header.md` at ≥1024 (logo → city/support/lang/theme; catalog →
  search → account/wishlist/compare/cart) and on mobile (burger/logo/account/cart, then search).
- No horizontal overflow 360–1440 on `/ua`, `/ua/catalog`, `/ua/product/makita-ga5030`
  (`overflow.mjs`, all widths clean).
- City/Support popovers anchor flush under their own triggers and aren't clipped at 768–1440
  (`ua-1440-city-popover.png`, `citypop768.png`, `supportpop1024.png`) — fixes review-005 defect 10.
- Sticky BuyBox / cart aside / checkout aside all key off `top-[calc(var(--header-h)+24px)]`,
  and `--header-h` is `calc(l1 + l2)` (`globals.css:53-58`), so they track the taller header
  automatically; MegaMenu/MobileMenu `top-[var(--header-h)]` likewise correct.
- `node tools/shots/smoke.mjs` — 28/28 passed. RU header (`ru1440.png`) doesn't clip with longer
  labels. No promo strip, no gradient stripe, no brown palette (rejected list respected).
- Keyboard order in DOM is layer 1 before layer 2 (`header.tsx:73` before `:86`).

## Scores (1–10)
- Hierarchy: 6 — order is right, but three competing button shapes in layer 1 undercut it.
- Typography: 7 — existing type scale reused correctly, nothing new introduced.
- Color: 6 — no new tokens, but translucent-surface contrast unverified.
- Spacing: 7 — all layer-1 controls are 44px tall, rhythm holds across breakpoints.
- Originality: 5 — intentionally a structural port per owner's call, not a knock by itself.
- Fit to brief: 6 — matches reference structure and rejected-list constraints, but breaks its own
  "no duplicate buttons" success criterion at tablet width.
