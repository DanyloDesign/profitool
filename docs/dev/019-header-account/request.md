# 019 · Account button in the header

Jira: [KAN-32](https://deangeme.atlassian.net/browse/KAN-32)

## Owner's words (verbatim, 2026-10-01)

> Also, please add a button for transitioning to the personal account, with registration and
> authentication, right up in the header, on the top right corner.

## Restatement

From 1024px the header has no way into the account: task 015 moved the account link to the footer.
The owner wants it back in the header, top right, as the entry point for sign-in and registration.

## Current state

- `src/components/layout/header.tsx:196` — account icon shows only on tablet; from 1024px it lives
  in the footer. Phones keep it in the header.
- Demo account from task 016: sign-in, registration, profile, order history, all client-side.

## Open points (answered in the proposal, not asked now)

- Guest state: one button "Увійти" leading to the sign-in / registration screen, or two entries.
- Signed-in state: initial or name, link to the profile.
- Placement depends on the new desktop grid from 018 (KAN-31), so 019 is designed after 018's
  direction is picked.

## Success criteria

- Visible at 1024, 1280 and 1512 in both themes, guest and signed-in states.
- Keyboard reachable with a visible focus ring; no duplicate account entry on the same screen.
