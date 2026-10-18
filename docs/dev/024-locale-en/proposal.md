# Proposal

Replace the `ru` locale with `en` in place. All UI and content stay keyed by locale, so the switch
is a key rename plus translation.

- `src/i18n/ru.ts` becomes `en.ts`. `locales = ["ua", "en"]`, `htmlLang.en = "en"`.
- English needs two plural forms, not three, so `plural.ts` gets `pluralEn(n, [one, other])`.
- Content: every `Localized` value (`products.ts`, `taxonomy.ts`, `info.ts`, `location.ts`, `shop.ts`)
  changes its `ru` key to `en` and gets an English translation.
- Header switch: "Укр" / "Eng", full names "Українська" / "English", `hrefLang` "uk" / "en".
- Dates use `en-GB`. Prices keep `uk-UA` grouping and ₴: the shop sells in Ukraine.
- URLs become `/en/...`. Old `/ru/...` links on the Pages site return 404. GitHub Pages has no
  redirects, and the site has no external links yet, so this is accepted.

Translation: plain British-neutral English, same tone as the Ukrainian (short, direct). Model names,
units and numbers stay untouched. Marketing lines are translated by meaning, not word for word.
No native speaker reviewed it.

Out of scope: SEO metadata beyond what the dictionaries already hold, an `en` fallback policy.
