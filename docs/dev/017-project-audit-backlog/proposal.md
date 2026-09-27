# Proposal

## Method

1. Explore subagent (Sonnet) sweeps `docs/dev/*/implementation.md`, `src/`, `.github/workflows`,
   `package.json` for defects, deferred items, TODOs, hardcoded sizes, missing routes and metadata.
2. Orchestrator dedupes against the `CLAUDE.md` "Что осталось" list and the existing KAN board.
3. One ticket per independent piece of work. Owner-decision items get their own ticket so the
   decision is tracked, not buried in a code ticket.
4. Tickets go under the owner's epics. Type `Story` for user-visible features, `Task` for the rest.

## What was found

### Automation and quality gates
- CI (`.github/workflows/pages.yml`) runs only `build` and deploy. No eslint, no `tsc`, no smoke.
- No test files anywhere, no `test` or `typecheck` script in `package.json`.

### SEO and discoverability
- `generateMetadata` only in `src/app/[locale]/layout.tsx:37` and the product page. Every other
  page shares one title and OG image.
- No `not-found.tsx`, `sitemap.ts`, `robots.ts`, `manifest`, JSON-LD.

### Functional debt
- Order goes nowhere; checkout ends on a screen with a number (001).
- Footer social links point at platform roots, `src/components/layout/footer.tsx:10`.
- Header cart button shows item subtotal while the mini-cart shows total with delivery (009).
- "In cart" control on the product page opens the cart instead of removing the item (009 review).
- Stray "Прибрано з кошика" text in page text after placing an order (013).
- Demo account: no phone at sign-up, Nova Poshta branch not stored in orders (016).

### Design and UX leftovers
- Tablet drawer duplicates header controls, open since 006 round 1.
- Horizontal filters and live "Show N" count from the 015 canvas not built.
- 013 workstreams E and F: key spec per category, overlapping ranges, root sort, short
  breadcrumbs, compare bar inside the phone buy bar.
- Brand pages and service section missing since 002.
- Suspicious product photos and unresolved image rights (013).

### Tech debt
- 276 arbitrary Tailwind values in 35 files (was ~100 at 003). Worst: `checkout-form.tsx` 20,
  `header.tsx` 19, `cart-view.tsx` 13, `profile-view.tsx` 13.
- Dead code: `glass-variants.css`, unused i18n keys after removing mini-cart and tabs.
- 0 `@ts-ignore`, 0 `eslint-disable`, 0 `any`. Type hygiene is clean.

### Accessibility and performance
- No skip link. `prefers-reduced-motion` never tested against the 015 drawer and hover motion.
- Contrast of 006 header pills not re-measured. Screen reader and Safari never tested.
- Lighthouse never run. PNG photos served as-is on Pages.

### Not ticketed, on purpose
- Reviews and ratings, promo strips, "buy in one click", "notify when in stock": the owner
  rejected them or there is no backing function. Listed in `CLAUDE.md`.
- Real account backend: premature until order intake (KAN-26) exists.

## Alternatives considered

- One epic-sized ticket per area. Rejected: the owner works one ticket per PR, and the process
  rules require one tech design per ticket.
- Filling the Tech Desing field on every ticket now with a not-yet-existing folder. Rejected: the
  rules forbid pointing the field at a guessed path. The field is set when the folder exists.
