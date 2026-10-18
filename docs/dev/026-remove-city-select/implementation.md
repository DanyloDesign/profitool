# Implementation

2026-10-18. Done as proposed. Old `profitool-location` values in browsers stay unused; the privacy view's
"forget" still clears every `profitool-*` key.

Checks: `tsc`, `eslint src` clean; `smoke.mjs` 30/30; screenshots of the header at 1512 and 1024, the phone menu at 500,
the checkout at 1512 (city field empty). The search field takes the freed width.
