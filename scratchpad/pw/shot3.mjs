/* Capturas: node shot3.mjs <url> <prefijo> <vistas>  (vistas: a=defecto b=frente c=trasera d=bajo e=explosión f=detalle) */
import { chromium } from "playwright";
const [url, prefix, views = "ac"] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--enable-webgl"] });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const errs = []; page.on("pageerror", (e) => errs.push(String(e).slice(0, 160))); page.on("console", (m) => { if (m.type() === "error") errs.push(m.text().slice(0, 160)); });
await page.goto(url, { waitUntil: "networkidle" }); await page.waitForTimeout(1200);
await page.locator(".visual-expand").first().click();
const canvas = page.locator("canvas").first(); await canvas.waitFor({ timeout: 15000 }); await page.waitForTimeout(2500);
const card = page.locator(".visual-modal-card"); const box = await canvas.boundingBox();
const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
const drag = async (dx, dy, steps = 18) => { await page.mouse.move(cx, cy); await page.mouse.down(); for (let i = 1; i <= steps; i++) { await page.mouse.move(cx + dx * i / steps, cy + dy * i / steps); await page.waitForTimeout(15); } await page.mouse.up(); await page.waitForTimeout(900); };
const reset = async () => { await page.locator(".three-reset").click(); await page.waitForTimeout(700); };
const wheel = async (dy) => { await page.mouse.move(cx, cy); await page.mouse.wheel(0, dy); await page.waitForTimeout(700); };
for (const v of views) {
  if (v === "a") await card.screenshot({ path: `${prefix}-a-defecto.png` });
  if (v === "b") { await drag(-260, 60); await card.screenshot({ path: `${prefix}-b-frente.png` }); await reset(); }
  if (v === "c") { await drag(320, -40); await card.screenshot({ path: `${prefix}-c-trasera.png` }); await reset(); }
  if (v === "d") { await drag(0, 170); await card.screenshot({ path: `${prefix}-d-bajo.png` }); await reset(); }
  if (v === "e") { const slider = page.locator(".three-explode input"); await slider.fill("1"); await page.waitForTimeout(900); await card.screenshot({ path: `${prefix}-e-explosion.png` }); await slider.fill("0"); await page.waitForTimeout(600); }
  if (v === "f") { await wheel(-900); await drag(-80, 20); await card.screenshot({ path: `${prefix}-f-detalle.png` }); await reset(); }
}
console.log(prefix, "errores:", errs.length); errs.slice(0, 5).forEach((e) => console.log("  ", e));
await browser.close();
