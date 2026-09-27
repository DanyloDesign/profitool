# tools/shots

Проверка вёрстки в настоящем Chrome. Зависимость `puppeteer-core` в проект не входит, ставится рядом:

```bash
cd tools/shots && npm i puppeteer-core --no-save
```

```bash
node tools/shots/shot.mjs http://localhost:3000/ua 390 out.png 844   # url, ширина, файл, высота окна
node tools/shots/overflow.mjs http://localhost:3000/ua               # какие элементы шире 390px
node tools/shots/contrast.mjs                                        # контраст пар цветов по WCAG
```

`shot.mjs` эмулирует устройство, прокручивает страницу ради ленивых картинок, печатает `overflowX`
и список битых картинок. Голый `chrome --headless --window-size=390` не годится: окно не уже
~500px, кадр обрезается и показывает ложное переполнение.

Путь к Chrome в скриптах жёстко прописан под Windows.
