# 023 · Proposal

## Route

`src/app/[locale]/info/[slug]/page.tsx`, slugs `delivery`, `payment`, `returns`, `warranty`, `privacy`.
Server component, `generateStaticParams` over locales × slugs, unknown slug → `notFound()`.
One route with data instead of five page files: the five pages share one layout and the content is
data, so a sixth page (for example "about") is one more entry.

Content lives in `src/data/info.ts` as `{ slug, title: Localized, lead: Localized, sections: [...] }`,
the same `name[locale]` pattern as `taxonomy.ts`. Numbers are pulled from `src/lib/shop.ts`
(`FREE_DELIVERY_FROM`, `DELIVERY_COST`), so the page and the checkout cannot disagree.

## Layout

Desktop: breadcrumbs, then two columns. Left: a short sticky list of the five pages, current one in
`bone`, others `bone-dim`. Right: one text column (~680px). Title `t-h1`, one lead sentence, then
sections split by `--hair` lines, each with a `t-h3` heading and two or three short paragraphs or a list.
Delivery and payment open with a row of two or three large figures (price, threshold, days), reusing the
look of the product page figures.

Phone: the side list becomes a horizontal row of `chip` links above the title. No horizontal page
scroll: the row scrolls inside itself.

```
default: long centered legal text wall | chosen: side nav + narrow column, big figures first | why: owner wants little text and big objects; the figure answers "how much, how fast" before any reading
default: accordion FAQ                  | chosen: plain sections, all open                   | why: accordions hide the answer and need a click; the pages are short
```

No new utilities, no new colors. Tokens and existing classes only (`t-h1`, `t-h3`, `chip`, `--hair`,
`--gutter`).

## Content rules

- Voice: "ти", like the rest of the site (checkout errors, hero).
- Only facts the site already states: Nova Poshta 1–2 days, 120 ₴, free from 5 000 ₴; courier in Kyiv;
  pickup Kyrylivska 102, Mon–Sat 09:00–19:00; card online, cash on delivery, invoice for FOP/company;
  manufacturer warranty, term on each product page; own service in Kyiv; returns within 14 days if unused.
- Unknown data shows as visible placeholders in square brackets: `[назва ФОП або ТОВ]`, `[ЄДРПОУ]`,
  `[пошта для звернень]`, `[строк повернення коштів]`.
- Privacy page says the truth about the demo: form data stays in the visitor's browser and is not sent.
- No legal article numbers. The owner or a lawyer has to check the wording before real launch.

## Links

| Where | What |
|---|---|
| Footer | New column "Покупцям" / "Покупателям" with the five links |
| Product page terms list | Delivery and pickup rows → delivery, warranty row → warranty, returns row → returns |
| Checkout | One line under the submit button: returns and privacy links |
| Registration | "обробку даних" becomes a link to privacy |

## Weaknesses

- The pages are text, and the owner dislikes text. The figure rows and short sections are the
  mitigation, not a cure.
- Placeholders in square brackets look unfinished on a demo. That is intended: they must not pass as
  real company data.
- A fifth footer column makes the footer denser at 1024–1280px. Checked in screenshots; fallback is to
  merge it into the "Profitool" column.
