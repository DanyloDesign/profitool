# 005 — План

Решение власника 2026-09-21: UI не чіпаємо, базова тема світла, UX вирівнюємо з референсом `PROFITOOL Site.html`.
Відкриті питання з `request.md` я закрив так, поки власник не скаже інакше:
- асортимент і фокус на платформах лишаються, 12 категорій і B2B не додаю;
- забраковане (розділ B) не повертаю;
- вигаданих даних (відгуки, салони, адреси) не додаю.

## Зроблено до запуску агентів (оркестратор)
- Світла тема за замовчуванням: `layout.tsx` рендерить `data-theme="light"`, `theme-toggle.tsx` читає light за замовчуванням, `lib/theme.ts`.
- `src/store/cart-ui.ts`: стан вікон кошика (`mini` | `modal`), `announceAdded()`.
- `src/components/cart/cart-button.tsx`: кнопка кошика винесена з шапки.
- `src/store/shop.ts`: `useLastOrder` для «Повторити замовлення».

## Пакети (паралельно, Sonnet, спільне дерево, файли не перетинаються)
| Пакет | Власник файлів | Що з референсу | Перевірка |
|---|---|---|---|
| B1 Кошик | `components/cart/cart-view.tsx`, `cart-button.tsx`, нові `mini-cart.tsx`, `cart-modal.tsx`, `app/[locale]/cart/page.tsx` | A1 A2 A3, повтор замовлення | tsc, eslint |
| B2 Товар | `app/[locale]/product/[slug]/page.tsx`, `components/product/*` | A4 A6 A7 A8, ключові характеристики, доставка й оплата | tsc, eslint |
| B3 Каталог | `app/[locale]/catalog/**`, `components/catalog/filters.tsx`, `product-card.tsx`, `lib/shop.ts` | A9 A10 A11, міні-кошик після «В кошик» з картки | tsc, eslint |
| B4 Шапка і чекаут | `components/layout/header.tsx`, `components/cart/checkout-form.tsx`, `app/[locale]/checkout/page.tsx`, новий `store/location.ts` | A12 A13 A14 | tsc, eslint |

Словники `i18n/ua.ts` і `i18n/ru.ts` спільні: кожен пакет додає ключі лише у свою секцію.

## Після пакетів
1. `pnpm build`, `node tools/shots/smoke.mjs`.
2. Рев'юер зі свіжим контекстом: бриф + результат.
3. Перевірка в Chrome на 1440 і 390, світла й темна тема. Заблоковано: розширення Chrome підключене на Mac, а не на цьому ПК.
4. Нове захоплення у Figma: старе зроблене з Mac і показує стару версію сайту.

## Ризики
- Галерея (A5) заблокована: на товар є одне фото, скляні рендери в товарах забраковані.
- Відгуки: даних немає, вкладка показує порожній стан.
- Розмір L.
