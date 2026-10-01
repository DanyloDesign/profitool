# 019 · Proposal

Jira: [KAN-32](https://deangeme.atlassian.net/browse/KAN-32)

## Solution

From 1024px the header's right cluster ends with an account pill, the last element on the row,
which is the top right corner the owner asked for:

`♡  ⫼  [🛒 Кошик]  [👤 Увійти]`

- Guest: `ghost-btn btn-sm` with the existing `IconUser` and the label "Увійти" / "Войти". It opens
  `/account`, where the demo sign-in and registration tabs already live (task 016). One entry, not
  two: the account page itself switches between sign-in and registration, two header buttons
  would cost width the search field needs.
- Signed in: the same pill shows a 24px initial circle and the first name (truncated at ~12ch),
  link to `/account/profile`. The label is the person's name, so they see they are signed in.
- Phones and tablets keep their current account icon (task 006/015), no change.
- The footer account link stays: it is far from the header and not on the same screen.

## Alternatives considered

- Icon only, like wishlist and compare: rejected, the owner asked for an explicit button for
  sign-in and registration; an icon does not say that.
- Account before the cart: rejected, the owner named the top right corner, the cart moves one
  step left.
- Two buttons "Увійти" and "Реєстрація": rejected, too wide next to the search, registration is
  one tab away.

## Default check

- layout | default: icon in the icon row | chosen: labelled pill at the end of the row | why: the
  owner asked for a visible sign-in button in the corner.
- type, color | default: unchanged | chosen: existing `ghost-btn` and tokens | why: no new styles.

## States

Guest, signed in (short and long name), hover, focus-visible, current page (`aria-current`),
before hydration (`useMounted`: render the guest pill to avoid a hydration mismatch, then swap).
