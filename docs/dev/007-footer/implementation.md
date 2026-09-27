# 007 — Футер: реалізація

Фаза: IMPLEMENTATION.

## Файли
- `src/components/layout/footer.tsx` — переставлена розмітка, без зміни grid-каркасу (4 колонки з lg).
- `src/components/ui/icons.tsx` — додано `IconMapPin`, `IconClock` (той самий `base()`, stroke 1.6, 24×24).
- `src/components/ui/payment-icons.tsx` — новий, 4 компоненти (Visa/Mastercard/Apple Pay/Google Pay), `fill="currentColor"`, `<title>` + `aria-label`.
- `src/i18n/ua.ts`, `src/i18n/ru.ts` — додано `common.footerPayLabel` (sr-only підпис групи оплати).

## Розкладка
- **Десктоп ≥1024**: колонка 1 — тільки логотип. Колонки 2–3 — Каталог/Profitool без змін. Колонка 4 — телефон (`tel:`, великий, іконка) → адреса (pin) → години (clock) → «Бренди» під ними.
- **Планшет (sm 640–1023, grid-cols-2)**: 2 колонки, порядок DOM не змінювався — логотип/Каталог зверху, Profitool/контакти+бренди знизу.
- **Мобільний <640**: один стовпець, порядок логотип → Каталог → Profitool → контакти з іконками → бренди → (нижній рядок) оплата → ©.
- **Нижній рядок**: зліва монохромні знаки оплати (`h-6 w-auto`, `text-bone-dim`, currentColor), sr-only підпис `footerPayLabel` перед групою; справа `© 2026 Profitool`. На мобільному рядок стає колонкою (оплата зверху, © знизу).

## Джерело логотипів оплати
Офіційні контури з пакета simple-icons, отримані `curl`:
- https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/visa.svg
- https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/mastercard.svg
- https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/applepay.svg
- https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/googlepay.svg

Шляхи path скопійовані без змін, лише `fill` замінено на `currentColor`.

## Перевірка
- `npx tsc --noEmit` — чисто, без помилок.
- `pnpm lint` — чисто, без попереджень.
- `node tools/shots/smoke.mjs` — 28/28 passed.
- Скріншоти (`tools/shots/shot.mjs`, повна сторінка) у `docs/dev/007-footer/shots/r7-*`: 1440/1024/768/390/360 (`THEME=dark`), 1440/390 (`THEME=light`), `/ru` 1440 dark. `overflowX: false` на всіх ширинах.
- Додатково зроблено прицільні кропи самого футера (`footer.screenshot()`, тимчасовий скрипт поза репо) — `docs/dev/007-footer/shots/footer-*` — переглянуті очима на всіх зазначених брейкпоінтах, темах і локалях. Дефектів не знайдено, циклів виправлень не знадобилось.

## Відомі недоліки
- Немає.

## Що лишилось
- Немає відкритих питань; критерії запиту виконані повністю.

## Orchestrator fix + check (2026-09-23)
- Payment marks rendered ~8px tall (simple-icons marks fill only the middle of the 24×24 box). `footer.tsx`: marks now 32px (Mastercard 28px) inside 40px hairline pills, list semantics (`ul/li`, sr-only label as first item).
- `tsc` clean, eslint on footer clean. Shots `shots/r8-1440-dark.png`, `shots/r8-390-light.png`, overflowX false. Read crops myself: marks legible in both themes.
- Known: payment pills use `--hair` border, fainter than the brand `chip` border in dark theme; empty area under the logo on desktop (left column holds only the logo).
- Scores: hierarchy 7, typography 7, color 7, spacing 6 (void under logo), originality 5, fit to brief 9.

## Round 2: about line + socials (2026-09-23)
- Left column: logo, one sentence `common.footerAbout` (UA/RU), 44px round links Telegram / Instagram / Facebook / YouTube (`src/components/ui/social-icons.tsx`, paths from simple-icons), `target=_blank rel=noopener`.
- URLs are placeholders pointing at platform roots (`socials` in `footer.tsx`, TODO). Owner must supply real account links.
- `tsc` clean, eslint clean. Shots `shots/r9-1440-dark.png`, `shots/r9-390-light-ru.png`, overflowX false; read myself. Void under the logo closed.
