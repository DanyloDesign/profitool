# Implementation

2026-10-18. File: https://www.figma.com/design/GQy0Lbtel5mdciT9nqWEvc (owner's drafts, team plan Starter).

## Starter plan limits and what they changed
- 3 pages only: Foundations (cover + tokens), Components, Screens (desktop row and mobile row).
- 1 mode per variable collection: light and dark themes are two collections, "Color" and "Color · Dark",
  with identical variable names. Components and screens are bound to "Color" (light, the site default).

## Contents
- Variables: 23 colours × 2 themes, 22 sizes (radius/choice added for checkout options). Every colour has WEB code
  syntax matching globals.css.
- Text styles: 23 (Display, Mobile, Price, UI). Sizes are the desktop maximums of the clamp() values plus the 390 values.
- Components: 24 icons, Logo (3 variants), Button (27 variants, Label and Icon properties), IconButton (6), Field (6),
  Textarea, Checkbox, Radio, Chip, Choice, Badge, Toggle, Stepper, ProductCard (text, boolean and badge-swap
  properties), Header (Desktop/Mobile), Footer (Desktop/Mobile).
- Screens: Home, Catalog, Product, Cart, Checkout, Delivery at 1440 and 390, built from instances.

## Checks
Every component and screen was checked with Figma's own screenshots; fixed during the check: fixed widths after resize
(buttons, chips, badges, card height, footers), escaped quotes in descriptions, clipped key figures and price row on the
product page, unwrapped notes in the cart and delivery pages, a broken Truck icon path from the conversion script.
The file was not opened in Chrome.

## Known gaps
- Hover-reveal panel on product cards, the catalog mega menu, cart drawer, mobile menu, filter drawer, account pages,
  returns/warranty/payment/privacy pages are not drawn.
- Mobile cards reuse the desktop ProductCard at 169px, so the model line is 19px where the phone layout may differ slightly.
- Field "Placeholder" variants are detached from the Value text property (edit the text directly).
- The site offers "Карткою онлайн" on checkout; MVP0 excludes online card processing. The file mirrors the site.
