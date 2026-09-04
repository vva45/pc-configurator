/* Capturas desde varios ángulos y con la vista explosionada. */
import { chromium } from "playwright";
const [url, prefix] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--enable-webgl"] });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const errs = []; page.on("pageerror", (e) => errs.push(String(e).slice(0, 160))); page.on("console", (m) => { if (m.type() === "error") errs.push(m.text().slice(0, 160)); });
await page.goto(url, { waitUntil: "networkidle" }); await page.waitForTimeout(1200);
await page.locator(".visual-expand").first().click();
const canvas = page.locator("canvas").first(); await canvas.waitFor({ timeout: 15000 }); await page.waitForTimeout(2500);
const card = page.locator(".visual-modal-card"); const box = await canvas.boundingBox();
const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
const drag = async (dx, dy, steps = 18) => { await page.mouse.move(cx, cy); await page.mouse.down(); for (let i = 1; i <= steps; i++) { await page.mouse.move(cx + dx * i / steps, cy + dy * i / steps); await page.waitForTimeout(15); } await page.mouse.up(); await page.waitForTimeout(900); };
await card.screenshot({ path: `${prefix}-a-defecto.png` });
await drag(-260, 60); await card.screenshot({ path: `${prefix}-b-frente.png` });           // gira hacia el frontal
await page.locator(".three-reset").click(); await page.waitForTimeout(700);
await drag(320, -40); await card.screenshot({ path: `${prefix}-c-trasera.png` });          // gira hacia la trasera
await page.locator(".three-reset").click(); await page.waitForTimeout(700);
await drag(0, 170); await card.screenshot({ path: `${prefix}-d-bajo.png` });               // mira desde abajo
await page.locator(".three-reset").click(); await page.waitForTimeout(700);
const slider = page.locator(".three-explode input"); await slider.fill("1"); await page.waitForTimeout(900);
await card.screenshot({ path: `${prefix}-e-explosion.png` });
console.log("errores:", errs.length); errs.slice(0, 5).forEach((e) => console.log("  ", e));
await browser.close();
