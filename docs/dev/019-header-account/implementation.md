# 019 · Implementation

Jira: [KAN-32](https://deangeme.atlassian.net/browse/KAN-32)

## What changed

`src/components/layout/header.tsx`: new `AccountPill`, the last element of the header row from
1024px, so it sits in the top right corner.

- Guest: user icon and "Увійти" / "Войти" (`dict.account.submitLogin`), link to `/account` where
  sign-in and registration are tabs.
- Signed in: initial in a `bone` circle and the first name (truncated at 12ch), link to
  `/account/profile`, `aria-label` "Кабінет: <full name>".
- On any `/account` page the border turns `signal` and `aria-current="page"` is set.
- Before hydration the guest state renders (`useMounted`), no hydration mismatch.
- Phones and tablets keep the existing icon; the footer link stays.

## Checks

- Shots in `shots/`: guest 1512 light, 1280 light with keyboard focus, 1024 dark; signed in 1512
  dark and light with focus. Pill ends 54px from the right edge at 1512 (the page gutter).
- smoke 30/30, no horizontal overflow at 1024, eslint and tsc clean.

## Known defects

- The pill shows the first word of the name; a single long word is cut with an ellipsis at 12ch.
- No review subagent: one component, ~45 lines.

## Scores

hierarchy 8 · typography 8 · color 8 · spacing 8 · originality 5 (a standard pattern, on purpose)
· fit to brief 9.
