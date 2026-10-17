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

## 2026-10-17 · Delivery page redesign

Owner's words (verbatim):

> Треба розібрптися з UI сторінок які ми створили. почнемо з сторінки доставки. Поперше внас немає
> доставки по місту а Магазин наший знаходиться за адресою https://maps.app.goo.gl/4GPKpEsfU2VBjeDz8.
> І зроби цю сторінку приємною до глаз. зараз сторінка виглядає дуже просто і не цікаво.

Facts: the link resolves to 48.044502, 33.863312, Sofiivka (Kryvyi Rih district, Dnipropetrovsk oblast).
Owner: write "смт Софіївка, вул. Лікарняна" for now, house number later. No courier anywhere. The address
and the courier removal are applied site-wide (implementation.md, 2026-10-17).

Three directions on one canvas: https://claude.ai/artifact/2W3SXQCZAd2P74huHV5snZ

| | Direction | Weakness |
|---|---|---|
| A | Route: Sofiivka → Nova Poshta → your branch as a line, then two columns with huge prices (120 ₴ / 0 ₴) and a drawn map for pickup | The route says little the numbers do not; the map is a drawing, not a real map |
| B | Calculator: pick method, drag the order sum, the price and the bar to free delivery change live | Needs client JS; a visitor with a cart already sees this in the cart |
| C (risky) | Waybill: the page is a shipping label with sender, recipient, term, price and a tear-off pickup stub | Can read as a gimmick; the label border is a panel the design system avoids |

```
default: text page with sections            | chosen: price and term as the largest objects on the page | why: owner wants big objects and little text
default: Google Maps iframe                  | chosen: drawn mini map + link to Google Maps              | why: no third-party load, matches both themes; a real map is one click away
default: same fade-in on every block         | chosen: no entrance motion; B moves only on input          | why: motion should explain the price change, nothing else
```

References (domains the owner named or well-known pages; individual pages not re-opened this session):
jabko.ua and answear.com (owner's tone: black and white, big objects, air), apple.com/shop/help/shipping_delivery
(delivery terms split by method, short), novaposhta.ua (the carrier's own wording for branch and parcel locker).

Decision (owner, 2026-10-17): direction B. Everything on the delivery page must fit one desktop screen
("працюй з масштабом"). Header city stays Kyiv. The exact store address comes from the owner later.

## 2026-10-17 · Payment page redesign

Owner: "Давай далі сторінку оплати. робимо по тій самій схемі через артефакт". Same rule as delivery:
the page fits one desktop screen.

Three directions: https://claude.ai/artifact/6TwmD6EJWpzzZdYfGp5vdh

| | Direction | Weakness |
|---|---|---|
| A | Three columns split by hairlines, a drawn object per method (cards, parcel, invoice), one line each, card brands as chips | Static; the drawings carry the page, the text is thin |
| B | Picker, same family as the delivery calculator: three method buttons on the left, on the right a headline and three numbered steps for the chosen one | "Одразу, за хвилину" and "Спершу дивишся, потім платиш" are copy promises the owner has to confirm; invoice steps assume the store sends the invoice and ships after payment |
| C (risky) | The page is a till receipt: three methods with dotted leaders, "Способів 3", a barcode, tilted 1.5° | Reads as a joke; tilt and zigzag edges are decoration only |

```
default: icon tile above each method        | chosen: drawn objects (A), live steps (B), receipt (C) | why: icon tiles are the stock AI pattern
default: payment logos as images            | chosen: brand names as text chips                       | why: no third-party marks to license or load; the footer already shows the logos
```

## 2026-10-17 · Returns page redesign

Owner: "Так давай далі" (returns next, same scheme, one screen).

Three directions: https://claude.ai/artifact/LY49QxJohLvt9urvdVjuK3

| | Direction | Weakness |
|---|---|---|
| A | A huge "14" with a strip of 14 day cells from the purchase day, then three columns: what you need, how to return, money | The day strip shows "day 4" as an example, which is not the visitor's real day |
| B | Check, same family as delivery and payment: days slider plus three yes/no questions, a verdict ("Можна повернути", "Строк минув", "Не вийде", "Це гарантія") with next steps | It reads like a legal decision; the owner has to confirm the rules behind each verdict |
| C (risky) | A drawn open box with the conditions as stickers on it | Playful; stickers overlap the drawing at narrow widths |

Rules B encodes (only what the site already states): 14 days, unused, packaging and receipt; a broken tool
goes to warranty at any time. Refund term stays a placeholder.
