import puppeteer from "puppeteer-core";
import { readFileSync } from "node:fs";
import { chromePath } from "./chrome.mjs";

// Proposal prototypes: node proto.mjs <url> <out.jpg> <zoom> <css-file|-> [scrollY]
// Emulates browser zoom (layout width 1512 / zoom, image 1512x945) and injects a CSS override.
const [url, out, zoom = "1", css = "-", scroll = "0"] = process.argv.slice(2);
const z = Number(zoom);
const browser = await puppeteer.launch({ executablePath: chromePath, headless: true });
const page = await browser.newPage();
await page.setViewport({ width: Math.round(1512 / z), height: Math.round(945 / z), deviceScaleFactor: z });
if (process.env.THEME) await page.evaluateOnNewDocument((t) => localStorage.setItem("profitool-theme", t), process.env.THEME);
await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
await page.addStyleTag({ content: "nextjs-portal{display:none!important}" + (css === "-" ? "" : readFileSync(css, "utf8")) });
await page.evaluate(async (y) => {
  for (let t = 0; t < document.body.scrollHeight; t += 600) { window.scrollTo({ top: t, behavior: "instant" }); await new Promise((r) => setTimeout(r, 80)); }
  window.scrollTo({ top: y, behavior: "instant" });
}, Number(scroll));
await new Promise((r) => setTimeout(r, 900));
const cards = await page.evaluate(() => [...document.querySelectorAll("article")].filter((a) => { const r = a.getBoundingClientRect(); return r.width > 0 && r.top >= 0 && r.bottom <= innerHeight; }).length);
await page.screenshot({ path: out, type: "jpeg", quality: 78 });
console.log(JSON.stringify({ out: out.split("/").pop(), cards }));
await browser.close();
