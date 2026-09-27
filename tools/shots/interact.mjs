import puppeteer from "puppeteer-core";
import { chromePath } from "./chrome.mjs";

const [url, width, out, action, height = "1000"] = process.argv.slice(2);
const browser = await puppeteer.launch({
  executablePath: chromePath,
  headless: true,
});
const page = await browser.newPage();
const w = Number(width);
await page.setViewport({ width: w, height: Number(height), deviceScaleFactor: 1, isMobile: w < 500, hasTouch: w < 500 });
// THEME=light|dark, SEED='{"key":value}' — тот же контракт, что и в shot.mjs.
if (process.env.THEME) {
  await page.evaluateOnNewDocument((theme) => localStorage.setItem("profitool-theme", theme), process.env.THEME);
}
if (process.env.SEED) {
  await page.evaluateOnNewDocument((seed) => {
    for (const [k, v] of Object.entries(seed)) localStorage.setItem(k, JSON.stringify(v));
  }, JSON.parse(process.env.SEED));
}
await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
await new Promise((r) => setTimeout(r, 300));

if (action === "megamenu") {
  // "Каталог" перестал быть signal-btn (006, раунд 2) — свой data-атрибут, как у tablet/mobile.
  const btn = await page.$('[data-menu-trigger="desktop"]');
  if (btn) await btn.click();
}
if (action === "mobilemenu") {
  const btn = await page.$('[data-menu-trigger="mobile"]');
  if (btn) await btn.click();
}
if (action === "tabletmenu") {
  const btn = await page.$('[data-menu-trigger="tablet"]');
  if (btn) await btn.click();
}
if (action === "citypop") {
  const btns = await page.$$('button');
  for (const b of btns) {
    const label = await page.evaluate((el) => el.getAttribute("aria-label") || "", b);
    if (label.includes("Місто") || label.includes("Город")) { await b.click(); break; }
  }
}
if (action === "supportpop") {
  const btns = await page.$$('button');
  for (const b of btns) {
    const label = await page.evaluate((el) => el.getAttribute("aria-label") || "", b);
    if (label === "Підтримка" || label === "Поддержка") { await b.click(); break; }
  }
}
if (action === "focusring") {
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
}
if (action === "scrollprod") {
  await page.evaluate(() => window.scrollBy(0, 900));
}
if (action === "cardhover") {
  // Наведение на кнопку «У кошик»/«В корзину» первой карточки (006, раунд 3, tint-btn).
  const btn = await page.$(".tint-btn");
  if (btn) await btn.hover();
}
if (action === "cardfocus") {
  // Клавиатурный фокус до первой .tint-btn — реальный Tab, не programmatic focus(),
  // иначе :focus-visible может не сработать.
  for (let i = 0; i < 200; i++) {
    await page.keyboard.press("Tab");
    const onBtn = await page.evaluate(() => document.activeElement?.classList?.contains("tint-btn") ?? false);
    if (onBtn) break;
  }
}

await new Promise((r) => setTimeout(r, 400));
await page.screenshot({ path: out, fullPage: false });
console.log("done", out);
await browser.close();
