import puppeteer from "puppeteer-core";
// node overflow.mjs <url> [width=390]
const width = Number(process.argv[3] ?? 390);
const browser = await puppeteer.launch({ executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", headless: true });
const page = await browser.newPage();
await page.setViewport({ width, height: 900, deviceScaleFactor: 1, isMobile: false });
await page.goto(process.argv[2], { waitUntil: "networkidle0", timeout: 60000 });
const r = await page.evaluate(() => {
  const vw = document.documentElement.clientWidth;
  const bad = [];
  for (const el of document.querySelectorAll("body *")) {
    const b = el.getBoundingClientRect();
    if (b.width > 0 && b.right > vw + 1) bad.push({ tag: el.tagName.toLowerCase(), cls: String(el.className).slice(0, 70), right: Math.round(b.right), w: Math.round(b.width) });
  }
  return { vw, scrollWidth: document.documentElement.scrollWidth, bad: bad.slice(0, 14) };
});
console.log(JSON.stringify(r, null, 1));
await browser.close();
