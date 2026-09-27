# 003 · Бренд и полная переделка дизайна — Plan

- **Статус:** черновик, ждёт выбора направления и материалов бренда

Шаги после того, как владелец выберет направление и пришлёт логотип.

| # | Шаг | Кто | Проверка |
|---|---|---|---|
| 1 | Достать палитру из логотипа, записать токены в `globals.css`, заменить #FF4A00 | сам | контраст текста и кнопок ≥ 4,5:1 замером |
| 2 | Подключить новую шрифтовую пару в `layout.tsx`, снести Sofia Sans и Geologica | сам | ґ, є, і, ї видны на скриншоте |
| 3 | Перевести ~124 захардкоженных значения на токены: радиусы, шкала текста, высоты контролов, `--header-h` | builder | `grep -c "text-\["` падает до нуля |
| 4 | Логотип в шапку, подвал, favicon, OG | сам | скриншот 1512 и 390 |
| 5 | Главная по выбранному направлению | builder | скриншот, сверка с макетом |
| 6 | Карточка товара: кнопка покупки без hover, тап ≥44px | builder | скриншот 390, проверка руками |
| 7 | Каталог и фильтры: ловушка фокуса в мобильном ящике, Escape, возврат фокуса | builder | клавиатурой |
| 8 | Карточка товара, корзина, чекаут, сравнение под новую систему | builder | скриншоты всех экранов |
| 9 | Страницы брендов и сервиса | builder | ссылки в меню перестают вести в никуда |
| 10 | `pnpm build`, `npx tsc --noEmit`, проход по `shots/` | сам | 110 страниц, ноль ошибок |

Размер: L. Риск: шаг 3 трогает все файлы разом, делать его отдельным коммитом до визуальных правок.

## Среда сборки

**С 2026-09-21 сборка идёт прямо в Windows.** Через winget поставлены Node 24 LTS и Git, pnpm 10.6.5
через `npm i -g`. `pnpm install` и `pnpm dev` работают в `D:\Project\profitool` без зеркала.
В оболочке Claude Code PATH не обновляется после установки, поэтому в начале команды нужна строка
`$env:Path = [Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [Environment]::GetEnvironmentVariable("Path","User")`.

Скриншоты снимает `puppeteer-core` с Chrome из Program Files, скрипты в `tools/shots/`.
Голый `chrome --headless --window-size=390` не годится: окно не уже ~500px, вёрстка считается
на 500 и кадр обрезается до 390, получается ложное переполнение. Скрипт эмулирует устройство,
проверяет `scrollWidth` и битые картинки.

Ниже описана прежняя схема с WSL, она устарела. В WSL не было Node. Поставлен Node 24.21 в `~/.local/node`, pnpm 10.6.5 через npm.
Диск `/mnt/d` смонтирован как 9p без metadata, поэтому `utimes` падает с EPERM и `pnpm install`
в `/mnt/d/Project/profitool` невозможен. Решение: зеркало проекта на линуксовой файловой системе.

```bash
export PATH="$HOME/.local/node/bin:$PATH"
rsync -a --delete --exclude node_modules --exclude .next --exclude .git \
      /mnt/d/Project/profitool/ ~/.cache/profitool/app/
cd ~/.cache/profitool/app && pnpm dev     # http://localhost:3000
```

Правки делаются в `/mnt/d/Project/profitool`, перед скриншотом гоняется rsync.
Скриншоты снимает Chrome из Windows, расширение Claude in Chrome в этой сессии недоступно:

```bash
"/mnt/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu \
  --hide-scrollbars --window-size=1512,2600 --virtual-time-budget=9000 \
  --screenshot="D:\Project\profitool\docs\dev\003-brand-and-redesign\shots\home.png" \
  http://localhost:3000/ua
```

Макеты артефакта проверяются локальной копией: `render.py` в скретчпаде разворачивает `.dc.html`
в обычный html в `D:\_profitool_preview` и снимает тем же Chrome.
