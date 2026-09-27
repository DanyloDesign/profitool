import puppeteer from "puppeteer-core";
import { chromePath } from "./chrome.mjs";
const OUT = "../../docs/dev/009-cart-interactions/shots/";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: chromePath, headless: true });
const errors = [];
const log = (ok, msg) => console.log(ok ? "PASS" : "FAIL", msg);

async function open(w, h = 900) {
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h, isMobile: w < 500, hasTouch: w < 500 });
  page.on("console", (m) => m.type() === "error" && errors.push(`${w}: ${m.text()}`));
  page.on("pageerror", (e) => errors.push(`${w}: ${e.message}`));
  await page.goto("http://localhost:3000/ua/catalog", { waitUntil: "networkidle0", timeout: 60000 });
  await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
  return page;
}
const cart = (p) => p.evaluate(() => JSON.parse(localStorage.getItem("profitool-cart") || '{"state":{"items":[]}}').state.items);
const btnText = (p, i) => p.evaluate((i) => {
  const b = [...document.querySelectorAll("article .tint-btn:not([disabled])")][i];
  return [...b.querySelectorAll("span")].filter((s) => s.offsetParent).map((s) => s.textContent).join("|") || b.textContent;
}, i);
const center = (p, sel, i = 0) => p.evaluate((sel, i) => {
  const r = document.querySelectorAll(sel)[i].getBoundingClientRect();
  return [r.x + r.width / 2, r.y + r.height / 2];
}, sel, i);
const dialog = (p) => p.evaluate(() => !!document.querySelector('[aria-labelledby="mini-cart-title"]'));

// ---- desktop
const d = await open(1440);
const CARD = "article .tint-btn:not([disabled])";
let [x, y] = await center(d, CARD, 0);
await d.mouse.move(x, y); await d.mouse.down(); await d.mouse.up(); await sleep(400);
log((await cart(d)).length === 1, "card click adds item");
log(await dialog(d), "mini-cart opens after add");
log(!(await btnText(d, 0)).includes("Прибрати"), `label right after add (cursor still on it): ${await btnText(d, 0)}`);
await d.mouse.move(x, y + 200); await sleep(100); await d.mouse.move(x, y); await sleep(150);
log((await btnText(d, 0)).includes("Прибрати"), `label after leave+return: ${await btnText(d, 0)}`);
await d.screenshot({ path: OUT + "card-hover-remove-1440.png", clip: { x: x - 200, y: y - 380, width: 400, height: 440 } });
await d.mouse.down(); await d.mouse.up(); await sleep(300);
log((await cart(d)).length === 0, "second click removes item");
log((await btnText(d, 0)).includes("У кошик"), `label after remove: ${await btnText(d, 0)}`);

// add two for the header tests
for (const i of [1, 2]) { [x, y] = await center(d, CARD, i); await d.mouse.move(x, y); await d.mouse.down(); await d.mouse.up(); await sleep(300); }
await d.keyboard.press("Escape"); await d.mouse.move(700, 600); await sleep(4500);
log(!(await dialog(d)), "mini-cart closed before hover test");

const CART = 'header a[href$="/cart"]';
[x, y] = await center(d, CART);
await d.mouse.move(x, y); await sleep(300);
log(await dialog(d), "hover on header cart opens mini-cart");
await d.screenshot({ path: OUT + "mini-hover-1440.png", clip: { x: 900, y: 0, width: 540, height: 520 } });
await sleep(4500);
log(await dialog(d), "hover-opened mini-cart stays open past 4s while hovered");
const [rx, ry] = await center(d, "[data-remove-item]", 0);
await d.mouse.move(rx, ry, { steps: 8 }); await sleep(100);
log(await dialog(d), "moving from button into dropdown keeps it open");
console.log("hit:", await d.evaluate((x,y)=>{const e=document.elementFromPoint(x,y);return e?.outerHTML.slice(0,160)+" in dialog="+!!e?.closest("[aria-labelledby=mini-cart-title]")},rx,ry), rx, ry);
await d.mouse.down(); await d.mouse.up(); await sleep(300);
log((await cart(d)).length === 1 && (await dialog(d)), `remove in mini-cart: items=${(await cart(d)).length} dialog=${await dialog(d)}`);
log(await d.evaluate(() => document.activeElement?.hasAttribute("data-remove-item")), "focus moved to remaining remove button");
await d.mouse.move(700, 700); await sleep(500);
log(!(await dialog(d)), "pointer leave closes mini-cart");
[x, y] = await center(d, CART);
await d.mouse.move(x, y); await sleep(200); await d.mouse.down(); await d.mouse.up(); await sleep(500);
const modal = await d.evaluate(() => [...document.querySelectorAll('[role="dialog"]')].map((e) => e.getAttribute("aria-labelledby") || e.getAttribute("aria-label")));
log(!(await dialog(d)) && modal.length === 1, `click opens modal, dialogs: ${JSON.stringify(modal)}`);
await d.screenshot({ path: OUT + "modal-1440.png" });
await d.keyboard.press("Escape"); await sleep(300);
// keyboard: remove last item via mini-cart
await d.focus(CART); await d.keyboard.press("Tab"); await d.keyboard.down("Shift"); await d.keyboard.press("Tab"); await d.keyboard.up("Shift"); await sleep(300);
log(!(await dialog(d)), "keyboard focus on cart button does NOT open mini-cart");
await d.keyboard.press("Escape"); await sleep(200);
// modal must survive the mini-cart auto-close timer: hover, leave dropdown, click button, wait 4.5s
await d.mouse.move(700, 700); await sleep(100);
[x, y] = await center(d, CART); await d.mouse.move(x, y); await sleep(300);
const [ix, iy] = await center(d, "[data-remove-item]", 0); await d.mouse.move(ix - 150, iy, { steps: 6 }); await d.mouse.move(x, y, { steps: 6 });
await d.mouse.down(); await d.mouse.up(); await sleep(4800);
log(await d.evaluate(() => document.querySelectorAll('[role="dialog"]').length === 1 && !document.querySelector('[aria-labelledby="mini-cart-title"]')), "modal still open 4.8s after hover+click");
await d.keyboard.press("Escape"); await sleep(300);
log(!(await dialog(d)), "closing modal with Escape does not reopen mini-cart");

// ---- phone
const m = await open(390, 844);
await m.evaluate(() => localStorage.removeItem("profitool-cart")); await m.reload({ waitUntil: "networkidle0" });
await m.evaluate(()=>document.querySelector("article .tint-btn:not([disabled])").scrollIntoView({block:"center"})); await sleep(300);
[x, y] = await center(m, CARD, 0);
await m.touchscreen.tap(x, y); await sleep(400);
log((await cart(m)).length === 1, "390: tap adds");
await m.screenshot({ path: OUT + "card-added-390.png" });
await m.touchscreen.tap(x, y); await sleep(400);
log((await cart(m)).length === 0, `390: second tap removes: items=${(await cart(m)).length} dialog=${await dialog(m)} hit=${await m.evaluate((x,y)=>document.elementFromPoint(x,y)?.outerHTML.slice(0,120),x,y)}`);
await m.touchscreen.tap(x, y); await sleep(400);
await m.evaluate(()=>scrollTo(0,0)); await sleep(300);
const [cx, cy] = await center(m, CART, 1);
await m.touchscreen.tap(cx, cy); await sleep(1500);
log(m.url().endsWith("/cart"), `390: cart button (with 1 item) navigates: ${m.url()}`);
const overflow = await m.evaluate(() => document.documentElement.scrollWidth > innerWidth);
log(!overflow, "390: no horizontal scroll");

console.log("console errors:", errors.length ? errors : "none");
await browser.close();
