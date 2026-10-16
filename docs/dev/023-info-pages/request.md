# 023 · Request

Jira: [KAN-122](https://deangeme.atlassian.net/browse/KAN-122) · branch `KAN-122-info-pages`

## Owner's words (2026-10-16, Ukrainian, verbatim)

> Добре розберемося з проблемою 1. Немає сторінок і посилань про доставку, оплату, повернення,
> гарантію, політику конфіденційності. зроби ці сторінки

## Source

Problem 1 of the usability walkthrough, `docs/dev/022-usability-walkthrough/report.md`. The visitor
looked for delivery, payment, return, warranty and privacy terms and found none. The registration form
says "you agree to data processing" with no link to what that means.

## Restatement

Add five customer info pages in both locales and link them from every place that promises a term
without explaining it: footer, product page terms list, checkout, registration consent.

## Owner's answers (2026-10-16)

- Structure: separate pages, one per topic, with navigation between them.
- Legal entity data (company name, EDRPOU, contact email) are not known: use visible placeholders.
  Do not invent a company.
- No design variants: build straight in the site's existing style, show screenshots at 1512 and 390.

## Success criteria

- `/ua/info/{delivery,payment,returns,warranty,privacy}` and the `/ru` twins render, static export works.
- Every number on the pages comes from the code that charges it (`FREE_DELIVERY_FROM`, `DELIVERY_COST`)
  or from copy the site already shows. No new promises.
- A visitor reaches each page in one click from the footer, and from the product page, checkout and
  registration where the topic comes up.
