import puppeteer from "puppeteer-core";

// node click.mjs <url> <width> <out.png> <css-selector-to-click> [height]
const [url, width, out, selector, height = "900"] = process.argv.slice(2);
const browser = await puppeteer.launch({ executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", headless: true });
const page = await browser.newPage();
const w = Number(width);
await page.setViewport({ width: w, height: Number(height), deviceScaleFactor: 1, isMobile: w < 500, hasTouch: w < 500 });
// THEME=light|dark выбирает тему до загрузки страницы
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
await page.click(selector);
await new Promise((r) => setTimeout(r, 900));
await page.screenshot({ path: out, fullPage: false });
console.log("ok", out);
await browser.close();
