# 018 · Site scale to 80%

Jira: [KAN-31](https://deangeme.atlassian.net/browse/KAN-31)

## Owner's words (verbatim, 2026-10-01)

> Працюємо далі над дизайном. маштаб сайту в цільому дуже великий.ю зроби його на 80%

## Restatement

At the owner's working width (1512 px, MacBook) everything reads too large: type, header, cards,
gaps. The owner wants the whole interface rendered at 80% of its current size, the way the page
looks at 80% browser zoom.

## Current state

- Body text 17px, `t-tag` / `t-eyebrow` 14px (project rule: no text below 14px).
- Sizes are mixed: rem in the type scale, px in `globals.css` (~176 values) and ~190 arbitrary
  `text-[Npx]`, `h-[Npx]`, `w-[Npx]` in components (KAN-14 tracks the cleanup).
- Layout: `--container-shell` 1440px, `--gutter` 72px from 1280px, header row 72px from 1024px.

## Owner's answer (2026-10-01, round 2)

> First of all, I don't like the site's scale because, in fact, it's not selling-oriented; due to
> the fact that in its default scale, too few elements are visible, and also, overall, it looks too
> large. If you scroll the browser's zoom to 80%, down to around 75%, it will look great. I would
> like you to reduce the site's scale to 75%, but if you set the site's scale to 75%, there will be
> too much empty space on the left and right. You need to completely redesign the entire grid and
> all elements so that everything is clear and neat. Please think about this.

(The same message asks for an account button in the header; that is a separate task, 019 / KAN-32.)

## Restatement, round 2

- Target scale: what the owner sees at 75% browser zoom. The goal is commercial: more products and
  more information per screen, a storefront that sells.
- Scaling alone is not the job. Shrinking leaves wide empty margins at 1512px, so the grid itself
  is redesigned for the new density: shell width, columns per row, gutters, header, cards, type.
- Small text at ~75% is implicitly accepted by the owner (he liked the zoomed look); the proposal
  still has to say where it lands and keep WCAG AA contrast.

## Assumptions (stated, not asked)

- Scope is desktop from 1024px. The owner judged by browser zoom on the MacBook; phones and the
  768-1023 tablet layout stay as they are unless he says otherwise.

## Success criteria

- At 1512px the site reads like the owner's 75% zoom, with no wide empty margins; owner confirms
  by screenshot.
- More products visible per screen on home and catalog than today (count before and after).
- Header, mega menu, cart drawer, search panel, sticky elements stay in place.
- Screenshots at 1512 and 390 in both themes, console clean, live Pages deploy checked.
