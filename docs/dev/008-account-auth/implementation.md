# 008 — реалізація

Файли: `src/components/account/account-view.tsx` (переписано), `src/app/[locale]/account/page.tsx`
(обгорнуто в `<Suspense>` — компонент читає `useSearchParams`), `src/i18n/ua.ts`, `src/i18n/ru.ts`
(додано `toLoginLead/Action`, `toRegisterLead/Action`). Хедер (`header.tsx:153,190`) уже вів на
чистий `/account` без query — змін не потребував, реєстрація за замовчуванням лишається.

## Поведінка
Одна форма за раз, режим у `?mode=login`. Дефолт — реєстрація. Перемикач — `<Link scroll={false}>`
під кнопкою форми, змінює query без релоаду. Заголовок Panel (`aria-live="polite"`) міняється разом
з формою. Фокус переходить на перше поле нової форми через `useEffect([mode])`, пропущено на
першому монтуванні, щоб не красти фокус при заході на сторінку. Анімацію не додавав: у DESIGN.md
чітко сказано — одна анімація на весь сайт (скейл фото товару), нову не плодити.

## Перевірка
- `npx tsc --noEmit` — чисто.
- `pnpm lint` — чисто.
- `node tools/shots/smoke.mjs` — 28/28 passed.
- Клік по посиланню-перемикачу (тимчасовий скрипт на базі `click.mjs`, видалений після перевірки):
  URL → `.../ua/account?mode=login`, `document.activeElement` → `#login-email`. Підтверджено.
- Скріншоти в `shots/`: `ua-account-1440-dark.png`, `ua-account-login-1440-dark.png`,
  `ua-account-390-light.png`, `ua-account-login-390-light.png`, `ru-account-1440-light.png`,
  `ua-account-1440-after-switch.png` (стан після кліку). Жодного горизонтального скролу на 390.

## Дефекти
Не знайдено. Не перевіряв `prefers-reduced-motion` окремо — анімації немає взагалі, тож вимога
виконується тривіально.

## Orchestrator fixes + check (2026-09-23)
- `page.tsx`: h1 «Кабінет» moved into the same 440px column as the form (was left-aligned against a centered form).
- `account-view.tsx`: one border for both modes (the orange accent on register was left over from the two-forms layout and flickered on switch).
- `account-view.tsx`: first field got focus on page load in dev (StrictMode runs the effect twice, the "mounted" flag failed). Now focus moves only when `mode` changes.
- Probe via puppeteer: on load active = BODY; click «Увійти» → `?mode=login`, focus `#login-email`, h2 «Вхід»; browser Back → register, h2 «Реєстрація». tsc and eslint clean.
- Shot: `shots/r2-account-1440-dark.png` (taken before the focus fix; the orange ring on the email field there is that bug).
