# 015 · UX concept

- **Opened:** 2026-09-27
- **Phase:** PROPOSAL. The concept lives on a Claude Design canvas; the link goes into `proposal.md`

## Request (verbatim)

> братуха, используй свои знания современных сайтов, предложи мне крутой дизайн на claude artifact
> касательно этого сайта, чтобы был ПРЕКРАСНЫЙ UX, чтобы userexperience был бомба, как для примера:
> при наведении на товар - показывалось описание его красивое и так далее, чтобы удобно было все
> тыкать, чтобы было всё основное видно - второстепенное, по типу "город, язык, переключатели всякие"
> были меньше, логотип меньше, проанализируй и сделай реально конфетку.
> Так как ты ИИ - у тебя нет ничего грандиозного в идеях, поэтому тебе нужно гуглить. Погугли
> принципы UX, UI, погугли как правильно делать крутой user experience

## How I understood it

1. Research first: UX and UI principles from primary sources (Baymard, Nielsen Norman Group,
   WCAG, Apple HIG, Material), patterns from live shops (the owner's references jabko.ua and
   answear.com, big retailers), and patterns from power-tool makers and tool shops.
2. Then a concept of the whole storefront on a Claude Design canvas, desktop and phone, with
   working interactions a viewer can click through.
3. Specific asks:
   - a product card reveals a well-designed description on hover;
   - everything is easy to hit and tap;
   - the primary things stay visible;
   - city, language and theme switches shrink;
   - the logo shrinks.
4. The concept keeps the brand: Unbounded and Golos Text, the logo gradient, white as the
   default theme, real product photos.

## Constraints

- The rejected list in `CLAUDE.md` stays closed. No grid background, no extra strips above the
  header, no monospace, no dense layouts, no "why us" or brand strips, no SKUs, power tags or
  counters on cards, no caps, no glass renders for products, no Liquid Glass on the cart button,
  no reviews or ratings, no "pay in parts", "buy in one click" or "notify when in stock".
- `DESIGN.md` still applies: text ≥14px, tap targets ≥44px, the buy button visible without
  hover. The hover reveal adds detail and never hides the button.
- Only photos that show the right model (see 013, workstream A). The concept uses 18 of them.
- Real prices, specs and copy from `src/data/products.ts`. No invented numbers.

## Acceptance

- The owner opens the canvas, clicks through the desktop and phone boards, and sees hover
  reveals, add-to-cart feedback, search and the battery-platform picker working.
- `proposal.md` names each pattern, the research behind it and what it would cost to build.
