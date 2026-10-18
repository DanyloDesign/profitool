# Implementation

2026-10-18. Russian is removed; the second locale is English (`/en`).

- `src/i18n/ru.ts` → `en.ts`, translated. `locales = ["ua", "en"]`, `htmlLang.en = "en"`, `swapLocale` matches `ua|en`.
- `plural.ts`: new `pluralEn(n, [one, other])`. Used in `en.ts`, `privacy-view.tsx` (record count) and `shop.ts` (pieces).
- Content translated: `products.ts`, `taxonomy.ts`, `info.ts`, `location.ts` (cities), `shop.ts`, `search.ts`
  (English suggestions and search stems; Ukrainian and Russian stems stay, so typing in Russian still finds tools).
- Plain spec strings stay in Ukrainian units in the data. `localize()` in `types.ts` converts them for `en`:
  decimal point, W, J, kg, mm, cm, m, V, Nm. Range filter words: "up to" / "over".
- Header switch "Укр" / "Eng", "Українська" / "English", `hrefLang` uk / en. Dates in the account: `en-GB`.
- Removed the Russian hyphenation entries on the home page.
- Prices keep `uk-UA` grouping ("5 000 ₴") in both locales.
- `smoke.mjs` checks `/en` instead of `/ru`.

Translation was done by three subagents in parallel, one file group each, then reviewed by spot checks
and screenshots. No native speaker review.

## Checks
- `tsc`, `eslint src` clean. `smoke.mjs` 30/30.
- Screenshots `/en` at 1512 (home full page, catalog, product, returns) and 390: no Cyrillic, no overflow.

## Known defects
- Returns answer headline "You can return it" wraps "it" to its own line at 1512.
- Old `/ru/...` links return 404 on Pages.
- `context.tsx` error message and code comments are still Russian (not user-facing).
