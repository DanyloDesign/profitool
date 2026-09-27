# Implementation

Date: 2026-09-27. Board: https://deangeme.atlassian.net/jira/software/projects/KAN/boards

## Tickets created

| Key | Epic | Type | Title (as on the board) | Priority | Estimate |
|---|---|---|---|---|---|
| KAN-10 | Frontend | Task | Аудит проєкту і наповнення беклогу в Jira | Medium | 2h |
| KAN-11 | Frontend | Task | CI: гейт lint, tsc і smoke перед деплоєм на Pages | High | 4h |
| KAN-12 | Frontend | Task | SEO: метадані для кожної сторінки і власна 404 | High | 4h |
| KAN-13 | Marketing | Task | SEO: sitemap, robots і JSON-LD Product | Medium | 3h |
| KAN-14 | Frontend | Task | Перевести хардкод розмірів на токени дизайн-системи | Medium | 8h |
| KAN-15 | Frontend | Task | Кошик: розбіжність суми в шапці та в міні-кошику | High | 1h |
| KAN-16 | Design | Task | Картка товару: кнопка «У кошику» відкриває кошик замість прибрати товар | Medium | 2h |
| KAN-17 | Frontend | Task | Після оформлення замовлення в тексті сторінки лишається «Прибрано з кошика» | Medium | 2h |
| KAN-18 | Frontend | Task | Демо-кабінет: телефон при вході й адреса відділення в історії замовлень | Low | 3h |
| KAN-19 | Frontend | Task | Прибрати мертвий код: glass-variants.css і невикористані ключі i18n | Low | 1h |
| KAN-20 | Frontend | Task | Доступність: skip link, reduced motion, контраст нових елементів, клавіатура | Medium | 6h |
| KAN-21 | Design | Task | Планшет 768–1023: ящик меню дублює елементи шапки | Medium | 3h |
| KAN-22 | Frontend | Story | Каталог на телефоні: горизонтальні фільтри і живий лічильник «Показати N» | Medium | 8h |
| KAN-23 | Frontend | Task | Каталог: хвости 013 | Low | 6h |
| KAN-24 | Design | Story | Сторінки брендів і розділ «Сервіс»: концепт і реалізація | Medium | 12h |
| KAN-25 | Design | Task | Фото товарів: перевірка сумнівних packshot і права на зображення | High | 4h |
| KAN-26 | Backend | Story | Замовлення доходить до власника: приймання замовлень зі статичного сайту | High | 10h |
| KAN-27 | Backend | Task | Дослідження: онлайн-оплата (Monobank, LiqPay, WayForPay) | Low | 3h |
| KAN-28 | Analytics | Task | Веб-аналітика без cookie-банера і події воронки покупки | Medium | 3h |
| KAN-29 | Marketing | Task | Контент від власника: адреси соцмереж, умови повернення й гарантії | Medium | 1h |
| KAN-30 | Frontend | Task | Lighthouse і продуктивність живого сайту на Pages | Medium | 4h |

Total estimate: 90h. All assigned to the owner (the only person on the board).

## Suggested order

1. KAN-29 owner content, KAN-25 photos: owner input, blocks nothing else but launch.
2. KAN-11 CI gate: everything after this lands with lint and types checked.
3. KAN-15, KAN-17 bugs, KAN-12 SEO basics.
4. KAN-26 order intake: the shop becomes a shop.
5. The rest by priority.

## Deviations from the process rules

- `Tech Desing` (`customfield_10449`) is not on any KAN screen. Jira answers
  `Field 'customfield_10449' cannot be set. It is not on the appropriate screen, or unknown.`
  The owner has to add the field to the Task and Story screens in project settings. Until then the
  tech design link lives in the description of each ticket.
- `~/.claude/workflow.md` referenced by the rules does not exist on this machine. The board's
  statuses were read from Jira instead: To Do, Tech design, In Progress, In Review, Done.
- Docs-only change committed straight to `master`, as the project `CLAUDE.md` allows for `docs/`.
- Docs in this folder are in English per the new rule; earlier folders stay in Russian and Ukrainian.

## Not verified

- No Chrome check: the task produced no visual change.
- Ticket descriptions were not proofread by a second agent.
