# 021 · Proposal

One rule in `globals.css`: `:root { zoom: 0.9 }` from 1024px. `zoom` scales every px, rem,
border and image at once, which is what browser zoom does. No component, class or markup changes.

Side effects handled in CSS only:
- Viewport units are not zoomed, so `100dvh` inside a zoomed root is 10% short on screen.
  The two panels that use `dvh` (search panel, mobile sheet) divide by `--zoom`.
- The sticky buy column gate (`min-height: 880px`) measures the real viewport while the column
  is drawn at 0.9, so the gate becomes 792px.

Below 1024px nothing changes: phones and tablets keep 100%, inputs stay 16px (iOS focus zoom).

Difference from real browser zoom: browser zoom also widens the CSS viewport by 1/0.9, so
breakpoints switch earlier. `zoom` keeps breakpoints on real pixels; this is what keeps the
structure identical, as the owner asked.

Rejected:
- `html { font-size: 90% }`: scales rem only, px sizes (header, icons, photos) stay, proportions break.
- `transform: scale(0.9)`: does not reflow, leaves empty space and breaks `position: fixed`.
- Rewriting tokens to 90% values: touches every component, the opposite of the brief.
