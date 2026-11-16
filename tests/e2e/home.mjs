// Key scenarios of the homepage in a real browser (no test dependency in the site: Playwright comes from ~/.veon/tools).
// Usage: npm run preview (or dev) → BASE_URL=http://localhost:4321/ npm run test:e2e
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";

const tools = process.env.VEON_TOOLS_DIR || path.join(os.homedir(), ".veon", "tools");
const require = createRequire(path.join(tools, "package.json"));
const { chromium } = require("playwright");
const BASE = process.env.BASE_URL || "http://localhost:4321/";
const CHROME = process.env.CHROME_PATH || (process.platform === "win32" ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" : undefined);

let failed = 0;
const check = (ok, msg) => { console.log(`${ok ? "PASS" : "FAIL"} ${msg}`); if (!ok) failed += 1; };

const browser = await chromium.launch(CHROME ? { executablePath: CHROME } : {}).catch(() => chromium.launch());

for (const width of [320, 375, 390, 768, 1024, 1440]) {
  const ctx = await browser.newContext({ viewport: { width, height: width < 768 ? 844 : 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(BASE, { waitUntil: "networkidle" });
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  check(sw <= width, `${width}: no horizontal scroll (scrollWidth ${sw})`);
  const cta = page.locator("#top a.btn[data-picker]");
  const box = await cta.boundingBox();
  check(!!box && box.y + box.height <= (width < 768 ? 844 : 900) && box.x >= 0 && box.x + box.width <= width, `${width}: main CTA fully visible on the first screen`);
  const hdr = await page.locator("#header .header__cta").boundingBox();
  check(!!hdr && hdr.x + hdr.width <= width, `${width}: header CTA inside the screen`);
  check(errors.length === 0, `${width}: no script errors ${errors.join(" | ")}`);
  await ctx.close();
}

// Branch picker: opens from the hero, real tel: links, closes by Esc and returns focus
for (const width of [390, 1440]) {
  const ctx = await browser.newContext({ viewport: { width, height: width < 768 ? 844 : 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.locator("#top a.btn[data-picker]").click();
  const dlg = page.locator("#picker");
  await page.waitForTimeout(300);
  check(await dlg.evaluate((d) => d.open), `${width}: CTA opens the branch picker`);
  const tels = await dlg.locator('a[href^="tel:"]').evaluateAll((as) => as.map((a) => a.getAttribute("href")));
  check(tels.join() === "tel:+380673106720,tel:+380967783131", `${width}: picker has both branch phones (${tels.join(", ")})`);
  check(await dlg.locator('a[href^="viber://"]').count() === 1, `${width}: Viber only for «Центр»`);
  const pBox = await dlg.boundingBox();
  check(!!pBox && pBox.x >= 0 && pBox.x + pBox.width <= width && pBox.y >= 0, `${width}: picker inside the screen`);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
  check(!(await dlg.evaluate((d) => d.open)), `${width}: Esc closes the picker`);
  check(await page.evaluate(() => document.activeElement?.closest("#top") !== null), `${width}: focus returns to the CTA`);
  // anchors
  if (width === 1440) {
    await page.locator('#header nav a[href="#prices"]').click();
    await page.waitForTimeout(900);
    const top = await page.locator("#prices h2").boundingBox();
    check(!!top && top.y > 70 && top.y < 400, `1440: «Вартість» anchor lands under the sticky header (h2 at ${Math.round(top?.y ?? -1)}px)`);
    await page.locator('#top .ruler a[href="#age-3-5"]').scrollIntoViewIfNeeded().catch(() => {});
  } else {
    await page.locator(".menu__toggle").click();
    check(await page.locator(".menu__panel").isVisible(), "390: hamburger opens the menu");
    await page.locator('.menu__links a[href="#branches"]').click();
    await page.waitForTimeout(900);
    check(!(await page.locator("[data-menu]").evaluate((d) => d.open)), "390: menu closes after an anchor");
    check(await page.locator("[data-bar]").evaluate((b) => b.classList.contains("is-shown")), "390: bottom bar shown after the first screen");
    const hb = await page.locator("#branches h2").boundingBox();
    const hh = await page.locator("#header").boundingBox();
    check(!!hb && !!hh && hb.y >= hh.y + hh.height - 1 && hb.y < 844, `390: «Філії» anchor lands under the sticky header (h2 at ${Math.round(hb?.y ?? -1)}px, header ${Math.round((hh?.y ?? 0) + (hh?.height ?? 0))}px)`);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(500);
    const bar = await page.locator("[data-bar]").boundingBox();
    const legal = await page.locator(".footer__legal").boundingBox();
    check(!!bar && !!legal && legal.y + legal.height <= bar.y + 1, "390: bottom bar does not cover the end of the footer");
    const bb = await page.locator("[data-bar] a").evaluateAll((as) => as.map((a) => a.getBoundingClientRect().height));
    check(bb.every((h) => h >= 44), `390: bottom bar buttons are at least 44px tall (${bb.join(", ")})`);
    // tap on a FutureLink shows its note
    const fl390 = page.locator("#programs .future-link").first();
    await fl390.scrollIntoViewIfNeeded();
    await fl390.click({ force: true });
    await page.waitForTimeout(350);
    const op = await fl390.locator(".future-link__note").evaluate((n) => getComputedStyle(n).opacity);
    check(Number(op) > 0.5, `390: tap on FutureLink shows «Розділ у розробці» (opacity ${op})`);
  }
  // FutureLink
  const fl = page.locator(".future-link").first();
  check((await fl.getAttribute("aria-disabled")) === "true" && (await fl.getAttribute("href")) === null && (await fl.getAttribute("tabindex")) === null, `${width}: FutureLink is inactive, without href, out of Tab order`);
  await ctx.close();
}

// No script: content visible, CTA goes to #branches
{
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto(BASE);
  check(await page.locator("h1").isVisible(), "no JS: h1 visible");
  check((await page.locator("#top a.btn[data-picker]").getAttribute("href")) === "#branches", "no JS: CTA is a link to #branches");
  check(await page.locator("#branches a[href='tel:+380967783131']").isVisible(), "no JS: phones visible");
  await ctx.close();
}

// Reduced motion: picker opens without animation, ruler in place
{
  const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  const anim = await page.locator(".ruler__ages li").first().evaluate((el) => getComputedStyle(el).animationName);
  check(anim === "none", `reduced motion: ruler has no animation (${anim})`);
  await ctx.close();
}

await browser.close();
console.log(failed ? `RESULT: FAIL (${failed})` : "RESULT: PASS");
process.exit(failed ? 1 : 0);
