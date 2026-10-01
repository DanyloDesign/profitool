import puppeteer from "puppeteer-core";
import { chromePath } from "./chrome.mjs";

// Emulates browser zoom: node zoomshot.mjs <url> <out.png> <zoom> [screenW=1512] [screenH=945]
// The layout width becomes screenW / zoom, the image stays screenW px wide. Prints how many
// product cards are fully inside the first screen.
const [url, out, zoom = "1", sw = "1512", sh = "945"] = process.argv.slice(2);
const z = Number(zoom);
const browser = await puppeteer.launch({ executablePath: chromePath, headless: true });
const page = await browser.newPage();
await page.setViewport({ width: Math.round(Number(sw) / z), height: Math.round(Number(sh) / z), deviceScaleFactor: z });
if (process.env.THEME) await page.evaluateOnNewDocument((t) => localStorage.setItem("profitool-theme", t), process.env.THEME);
await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
if (process.env.SCROLL) await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), Number(process.env.SCROLL));
await new Promise((r) => setTimeout(r, 900));
const cards = await page.evaluate(() => {
  const h = window.innerHeight;
  return [...document.querySelectorAll("article")].filter((a) => {
    const r = a.getBoundingClientRect();
    return r.width > 0 && r.top >= 0 && r.bottom <= h;
  }).length;
});
await page.screenshot({ path: out });
console.log(JSON.stringify({ out, zoom: z, layoutWidth: Math.round(Number(sw) / z), cardsInFirstScreen: cards }));
await browser.close();
