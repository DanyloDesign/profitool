# Plan

1. Mechanical rename `ru` to `en` (keys, file, locale list, header switch, date format, search, smoke test). Check: `tsc`.
2. Translate in parallel, one file per subagent: `en.ts`; `products.ts`; `info.ts` + `taxonomy.ts` + small files.
3. Check: no Cyrillic left under `en` keys, `tsc`, `eslint`, static build.
4. Screenshots `/en` and `/ua` at 1512 and 390, `smoke.mjs`.
5. Commit to `master`, watch the Pages deploy, check the live `/en/`.
