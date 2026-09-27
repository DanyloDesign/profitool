import puppeteer from "puppeteer-core";

// node smoke.mjs [baseUrl]   сквозная проверка: корзина, избранное, сравнение, фильтры, оформление, ящик фильтров
const base = process.argv[2] ?? "http://localhost:3000";
const results = [];
const check = (name, ok, detail = "") => {
  results.push(ok);
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  " + detail : ""}`);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({ executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", headless: true });

async function clickByText(page, selector, text) {
  const ok = await page.evaluate(
    (sel, txt) => {
      const el = [...document.querySelectorAll(sel)].find((node) => node.textContent.trim().startsWith(txt));
      if (!el) return false;
      el.click();
      return true;
    },
    selector,
    text,
  );
  return ok;
}

// ── Десктоп ──
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1512, height: 900 });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

  await page.goto(`${base}/ua/catalog/rotary-hammers`, { waitUntil: "networkidle0" });
  check("каталог: 7 карточек", (await page.$$eval("article", (a) => a.length)) === 7);

  await clickByText(page, "article button", "У кошик");
  await sleep(400);
  const cart = await page.$eval('header a[href$="/cart"]', (a) => a.getAttribute("aria-label"));
  check("шапка: корзина после добавления", /Кошик, 1/.test(cart), cart);

  await page.click('article button[aria-label^="Додати"]');
  await page.click('article button[aria-label^="Порівняти"]');
  await sleep(400);
  const wish = await page.$eval('header a[href$="/wishlist"]', (a) => a.getAttribute("aria-label"));
  const cmp = await page.$eval('header a[href$="/compare"]', (a) => a.getAttribute("aria-label"));
  check("шапка: счётчик обраного", /, 1$/.test(wish), wish);
  check("шапка: счётчик порівняння", /, 1$/.test(cmp), cmp);
  check("панель порівняння видна", await page.evaluate(() => document.body.textContent.includes("у порівнянні")));

  await page.click('input.check');
  await sleep(700);
  check("фильтр пишет в адрес", /[?&](power|brand)=/.test(page.url()), page.url());

  await page.goto(`${base}/ua/cart`, { waitUntil: "networkidle0" });
  check("корзина: одна позиция", (await page.$$eval("section article", (a) => a.length)) === 1);
  await page.click('button[aria-label="Збільшити кількість"]');
  await sleep(300);
  const qty = await page.$eval("section article span[aria-live]", (s) => s.textContent.trim());
  check("корзина: количество растёт", qty === "2", qty);

  await page.goto(`${base}/ua/checkout`, { waitUntil: "networkidle0" });
  await clickByText(page, "button", "Підтвердити");
  await sleep(500);
  check("оформлення: пустая форма даёт ошибки", (await page.$$('[role="alert"]')).length >= 3);
  await page.type("#name", "Олег Ткаченко");
  await page.type("#phone", "+380989251199");
  await page.type("#email", "oleg@example.com");
  await page.type("#city", "Київ");
  await page.type("#branch", "Відділення 12");
  await clickByText(page, "button", "Підтвердити");
  await page.waitForFunction(() => document.body.textContent.includes("Замовлення прийнято"), { timeout: 5000 }).catch(() => {});
  check("оформлення: успех", await page.evaluate(() => document.body.textContent.includes("Замовлення прийнято")));
  const cartAfter = await page.$eval('header a[href$="/cart"]', (a) => a.getAttribute("aria-label"));
  check("корзина очищена после заказа", !/, \d/.test(cartAfter), cartAfter);

  await page.goto(`${base}/ua/wishlist`, { waitUntil: "networkidle0" });
  check("обране: товар на месте", (await page.$$eval("article", (a) => a.length)) === 1);
  await page.goto(`${base}/ua/compare`, { waitUntil: "networkidle0" });
  check("порівняння: таблица", (await page.$$("table")).length === 1);

  await page.goto(`${base}/ua/account`, { waitUntil: "networkidle0" });
  await page.type("#reg-password", "abc");
  await sleep(200);
  const ruleOk = await page.$$eval("#password-rules li", (l) => l.length);
  check("кабінет: три правила пароля", ruleOk === 3);
  await clickByText(page, "button[type=submit]", "Створити");
  await sleep(300);
  check("кабінет: слабый пароль отклонён", (await page.$$('[role="alert"]')).length >= 1);

  await page.goto(`${base}/ru`, { waitUntil: "networkidle0" });
  const ru = await page.evaluate(() => document.body.textContent);
  check("RU: главная переведена", ru.includes("Хит недели") && ru.includes("Распродажа") && ru.includes("Новинки"));

  check("нет ошибок в консоли", errors.length === 0, errors.slice(0, 2).join(" | "));

  const res = await page.goto(`${base}/ua/catalog/nope`, { waitUntil: "networkidle0" });
  check("несуществующая категория даёт 404", res.status() === 404, String(res.status()));

  // ── Тема ──
  await page.goto(`${base}/ua`, { waitUntil: "networkidle0" });
  const bg = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  const theme = () => page.evaluate(() => document.documentElement.dataset.theme ?? "light");
  // С 2026-09-21 базовая тема светлая, тёмная включается кнопкой.
  check("тема по умолчанию светлая, фон белый", (await theme()) === "light" && (await bg()) === "rgb(255, 255, 255)", await bg());
  await page.click('header button[aria-label="Темна тема"]');
  await sleep(200);
  check("переключатель: тёмная, фон чёрный", (await theme()) === "dark" && (await bg()) === "rgb(0, 0, 0)", await bg());
  await page.reload({ waitUntil: "domcontentloaded" });
  check("выбор сохраняется после перезагрузки (до отрисовки)", (await theme()) === "dark");
  await page.waitForNetworkIdle();
  await page.click('header button[aria-label="Світла тема"]');
  await sleep(200);
  check("переключатель: обратно светлая", (await theme()) === "light" && (await bg()) === "rgb(255, 255, 255)");
  await page.close();
}

// ── Телефон ──
{
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto(`${base}/ua/catalog/rotary-hammers`, { waitUntil: "networkidle0" });
  await page.click('main button[aria-haspopup="dialog"]');
  await sleep(300);
  check("ящик фильтров открывается как диалог", (await page.$('[role="dialog"]')) !== null);
  await page.keyboard.press("Escape");
  await sleep(300);
  check("Escape закрывает ящик", (await page.$('[role="dialog"]')) === null);
  const focusBack = await page.evaluate(() => document.activeElement?.getAttribute("aria-haspopup") === "dialog");
  check("фокус вернулся на кнопку", focusBack);

  // мобильное меню. С 006 в DOM два тригера "Меню" (мобільний рядок і планшетний шар 2,
  // приховані по ширині через клас на предку) — обираємо явно мобільний, щоб не влучити
  // в прихований (Puppeteer не клікає по display:none).
  await page.click('header button[data-menu-trigger="mobile"]');
  await sleep(300);
  const menuH = await page.evaluate(() => {
    return document.querySelector("header div.fixed")?.getBoundingClientRect().height ?? 0;
  });
  check("мобильное меню раскрывается на экран", menuH > 500, String(Math.round(menuH)));

  await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "Темна тема")?.click());
  await sleep(200);
  check("мобильное меню: строка темы работает", (await page.evaluate(() => document.documentElement.dataset.theme)) === "dark");

  const w = await page.evaluate(() => document.documentElement.scrollWidth);
  check("нет горизонтального скролла на 390", w === 390, String(w));
  await page.close();
}

await browser.close();
const failed = results.filter((r) => !r).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
