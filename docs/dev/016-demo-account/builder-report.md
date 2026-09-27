# 016 — Demo account: builder report

`pnpm exec tsc --noEmit` and `pnpm exec eslint` on all changed files: clean, no errors, no warnings.
Verified with curl against the running dev server (not started by me): `/ua/account`, `/ru/account`,
`/ua/account/profile`, `/ru/account/profile`, `/ua/checkout`, `/ua/cart` all return 200.
No visual/browser check was run — the orchestrator owns the Chrome QA pass per CLAUDE.md section 9.

## Files changed

- `src/store/account.ts` (new) — `useAccount` (persist key `profitool-account`): `session: {name,email,phone}|null`,
  `login`, `logout`, `update(partial)`. `useOrders` (persist key `profitool-orders`): `orders: Order[]`, `add(order)`
  prepends (newest first). `Order.lines` store only `{slug, qty, price, oldPrice?}`, not product objects.
  Also exports `Payment = "card"|"delivery"|"invoice"` (single source now, see checkout-form.tsx).
- `src/lib/phone.ts` (new) — `normalizePhone` moved out of `checkout-form.tsx` so `profile-view.tsx` can reuse it
  (it was not exported before, plan explicitly asked to move it if so).
- `src/components/cart/checkout-form.tsx` — imports `normalizePhone` from `@/lib/phone` and `Payment`/`OrderLine`
  from `@/store/account` (local duplicate types removed). Added: session-based prefill of name/phone/email via
  the same `useRef` "preset once" pattern already used for the city field; on confirmed submit, maps `lines` to
  `OrderLine[]` (slug + qty + price + oldPrice) and calls `useOrders().add(...)` before `clear()`. No other
  behaviour touched.
- `src/components/account/account-view.tsx` — `AccountView` now redirects to `/account/profile` via
  `router.replace` when a session already exists (guarded by `useMounted`, renders a loading placeholder until
  then, same pattern as `CheckoutForm`/`CartView`). `LoginForm`/`RegisterForm`: on valid submit, create a demo
  session (`nameFromEmail` — part before `@`, capitalised) and `router.push` to `/account/profile` instead of
  showing the "not working yet" notice. Removed: `Notice` component, `done` state, `IconAlert` import, and the
  `unavailable`/`toCatalog` dict keys it used (grepped the repo, no other consumer). Forgot-password text/link
  behaviour untouched.
- `src/app/[locale]/account/profile/page.tsx` (new) — server component, same shell/pattern as `cart`/`checkout`
  pages (`<div className="shell pb-8 pt-10">`), no metadata (matches `cart`/`checkout`/`account`, which also
  have none — only the product page and root layout set metadata in this codebase).
- `src/components/account/profile-view.tsx` (new) — client component, one column, `mx-auto max-w-[640px]`
  inside the page's `shell`. No session → `router.replace` to `/account?mode=login` (guarded by `useMounted`).
  Sections, each separated by `border-[var(--hair)]`:
  - Header: `t-h1` "Привіт, {first name}", demo note (`text-bone-dim`), "Вийти" (`ghost-btn btn-sm`) → logout +
    push to `/account`.
  - "Замовлення": `EmptyState` when empty (CTA reuses `dict.cart.emptyCta`). Otherwise a list of rows, each a
    full-width `<button aria-expanded aria-controls>` showing `PT-xxxxxx · <short date> · <total> ₴` and a short
    delivery-method label on the right; the panel (always in the DOM, `hidden={!open}`, same pattern as
    `product-tabs.tsx`'s mobile accordion) shows resolved product lines (thumbnail via `imageOf`, `next/image`
    `fill`+`sizes`, brand+model×qty, sum with old-price strikethrough) then a `dl` mirroring the checkout
    confirmation screen's delivery/payment/total block (reuses `dict.cart.delivery/deliveryFree/total` and
    `dict.checkout.payment/methodX/payX`). Unknown slugs are filtered out silently. First (newest) order is
    expanded by default.
  - "Профіль": definition list (Ім'я / Телефон / Пошта / Місто, city from `useLocation`+`cityName`, "Не вказано"
    fallback for empty phone/city) with a "Змінити" ghost-btn that swaps to an inline form (same `field`
    utility, `normalizePhone`/email-regex validation, `aria-describedby` errors) with Зберегти/Скасувати. City is
    shown but not editable here (it belongs to the header city picker / `useLocation`, outside `Session`).
- `src/i18n/ua.ts`, `src/i18n/ru.ts` — added `account.profile.*` (hello/demo/logout, orders section incl. short
  delivery-method labels, profile section incl. field labels/edit-save-cancel/errName/notSpecified). Removed
  the now-dead `account.unavailable`/`account.toCatalog` keys. No em dashes in the new copy.

## Deviations from the brief

- **Thumbnail `unoptimized` prop**: the brief says "next/image unoptimized like other small thumbnails". I
  checked `cart-view.tsx` and `checkout-form.tsx` (the two closest precedents for a small product thumbnail) —
  neither uses `unoptimized`, only `logo.tsx` does (for the static brand mark). I kept the order-line thumbnail
  consistent with `cart-view.tsx`/`checkout-form.tsx` (plain `fill`+`sizes`, no `unoptimized`) rather than
  introducing a one-off. Flag if you want it added anyway.
- **Content width**: the brief says "max width like other text pages (look at cart/checkout for the shell and
  widths)", but `cart`/`checkout` actually use the full 1440px `shell` with their own internal grids, not a
  narrow single column. Since the owner picked "one column" with order rows + a profile dl (needs more room
  than the 440px login form), I used `mx-auto max-w-[640px]` inside `shell` as a middle ground. Worth a visual
  check at 1440 and 390 — this was my judgment call, not measured against a reference.
- **Login form phone**: the login form has no phone field, so the demo session created from login has
  `phone: ""`. This only affects checkout prefill (phone stays blank, same as before login existed) and shows
  "Не вказано" in the profile dl until the shopper edits it.
- Removed `account.unavailable`/`account.toCatalog` dict keys instead of leaving them dead — grepped first,
  confirmed no other reference (only historical text in `docs/dev/013-.../proposal.md`, untouched).

## Not done / out of scope

- No visual QA in Chrome (1440/390, both themes, states) — per instructions this is the orchestrator's job.
- Did not run `pnpm build`, `pnpm exec eslint` project-wide, or the smoke script, per instructions. Reasoned
  through `tools/shots/smoke.mjs`'s `/ua/account` block by hand (types a weak password, expects a `role="alert"`
  on failed submit, never completes a valid submit) — the new code still surfaces `role="alert"` errors the same
  way, so it should still pass, but this was not executed.
- Did not touch `header.tsx`/`footer.tsx` account links — they already point at `/account`, which now forwards
  logged-in users to `/account/profile` client-side, per plan.

## States to check visually

- Orders empty state (fresh browser / cleared localStorage).
- One order, several orders (expand/collapse, only one open at a time), an order whose product slug no longer
  exists in the catalog (line silently dropped — check the panel doesn't look broken with 0 lines).
- Long product names / long email wrapping in the row and in the profile dl (`truncate` is used in a few spots,
  worth checking it doesn't cut off something important on 390px).
- Profile edit: validation errors (empty name, malformed phone, malformed email), successful save, cancel
  discards edits.
- Both locales (ua/ru), both themes, 1440 and 390 widths, keyboard-only pass (Tab through order rows and the
  edit form, Enter/Space on the row buttons).
- Checkout: confirm an order while logged in (prefill + history) and while logged out (unchanged flow, no
  history entry visible until they log in later — by design, orders are tied to the browser storage key, not
  the session, so a guest checkout still writes to `profitool-orders` and will show up once they log in).
