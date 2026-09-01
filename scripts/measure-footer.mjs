/**
 * The closing band and the site footer, as painted.
 *
 * Everything here is read off SCREENSHOT PIXELS rather than computed style, and
 * both halves of that matter:
 *
 *   CONTRAST — the band is a gradient and its type is set in 8-digit hex over
 *   it, so getComputedStyle reports the authored colour on the authored
 *   background and neither is what the eye receives. The wordmark that this
 *   check was written for measured 1.29:1 that way and looked like a bug in the
 *   renderer; sampled properly it was simply set at 12% alpha.
 *
 *   CLEARANCE — the two edge figures are WebPs with transparent margins, so
 *   their bounding boxes overlap the sign-off on a phone by 24px while their
 *   painted silhouettes clear it by 13. A box test fails a layout that is fine.
 *   This walks each row of the text band inward from both edges until the pixel
 *   matches the ground, which is where the figure actually ends.
 *
 *   node scripts/measure-footer.mjs      # needs `bun run dev`
 */
import { chromium } from "playwright";
import { PNG } from "pngjs";

const BASE = process.argv[2] ?? "http://localhost:8080";
const browser = await chromium.launch();
let fails = 0;

const lum = ([r, g, b]) => {
  const f = (c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
const say = (ok, label, detail) => {
  if (!ok) fails++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${detail ? "\n        " + detail : ""}`);
};

for (const width of [1900, 1440, 768, 390]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.goto(BASE + "/description", { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1100);

  const geo = await page.evaluate(() => {
    const band = document.querySelector("section[aria-hidden='true']");
    const foot = document.querySelector("footer");
    const box = (e) => (e ? e.getBoundingClientRect().toJSON() : null);
    const find = (root, text) =>
      [...root.querySelectorAll("span,p")].filter((e) => e.textContent.trim() === text).pop();
    return {
      bandRule: getComputedStyle(band).borderTopWidth,
      mark: box([...band.querySelectorAll("span")].find((s) => s.textContent.startsWith("Chemo"))),
      bandTeam: box(find(band, "NIS Kazakhstan · iGEM 2026")),
      footTeam: box(find(foot, "NIS Kazakhstan · iGEM 2026")),
      footGuard: box(find(foot, "Guard")),
      attrib: box(find(foot, "Content on this wiki is the team’s own unless attributed.")),
      rules: [...foot.querySelectorAll("*")].filter((e) => {
        const s = getComputedStyle(e);
        return parseFloat(s.borderTopWidth) > 0 || parseFloat(s.borderBottomWidth) > 0;
      }).length,
    };
  });

  // The sign-off is hidden for the clearance pass, so the band's mid-column is
  // pure ground and can serve as the per-row reference colour.
  await page.evaluate(() => {
    document.querySelector("section[aria-hidden='true'] div.relative.z-10").style.visibility =
      "hidden";
  });
  const bare = PNG.sync.read(await page.screenshot());
  await page.evaluate(() => {
    document.querySelector("section[aria-hidden='true'] div.relative.z-10").style.visibility = "";
  });
  const shot = PNG.sync.read(await page.screenshot());

  const at = (img, x, y) => {
    const i = (Math.round(y) * img.width + Math.round(x)) * 4;
    return [img.data[i], img.data[i + 1], img.data[i + 2]];
  };
  const near = (a, b) => a.every((v, i) => Math.abs(v - b[i]) < 10);

  /** Strongest ink in a text box, against the ground just above it. */
  const read = (b, dark) => {
    let best = dark ? [255, 255, 255] : [0, 0, 0];
    for (let y = Math.ceil(b.y) + 1; y < b.y + b.height - 1; y++)
      for (let x = Math.ceil(b.x); x < b.x + b.width; x++) {
        const p = at(shot, x, y);
        if (dark ? lum(p) < lum(best) : lum(p) > lum(best)) best = p;
      }
    return { ratio: ratio(best, at(shot, b.x + b.width / 2, b.y - 6)), ink: best };
  };

  /** How far the painted figures stay clear of a text box, left and right. */
  const clearance = (b) => {
    let lr = 0;
    let rl = width;
    for (let y = Math.ceil(b.y); y < b.y + b.height; y++) {
      const ref = at(bare, width / 2, y);
      let x = 0;
      while (x < width && !near(at(bare, x, y), ref)) x++;
      lr = Math.max(lr, x);
      let z = width - 1;
      while (z >= 0 && !near(at(bare, z, y), ref)) z--;
      rl = Math.min(rl, z);
    }
    return { left: b.x - lr, right: rl - (b.x + b.width) };
  };

  console.log(`\n══ ${width}px ═══════════════════════════════════════`);
  say(geo.bandRule === "0px", "no rule across the top of the closing band", `border-top: ${geo.bandRule}`);
  say(geo.rules === 0, "no separator rules inside the footer", `${geo.rules} bordered element(s)`);

  for (const [name, b] of [
    ["wordmark", geo.mark],
    ["team line", geo.bandTeam],
  ]) {
    const c = clearance(b);
    say(
      Math.min(c.left, c.right) >= 8,
      `the band's ${name} clears the painted figures`,
      `${c.left.toFixed(0)}px left, ${c.right.toFixed(0)}px right`,
    );
  }

  const m = read(geo.mark, true);
  say(m.ratio >= 3, "band wordmark clears 3:1 (AA, large text)", `${m.ratio.toFixed(2)}:1  rgb(${m.ink})`);
  say(read(geo.bandTeam, true).ratio >= 4.5, "band team line clears 4.5:1 (AA, small text)",
    `${read(geo.bandTeam, true).ratio.toFixed(2)}:1`);
  say(read(geo.footTeam, false).ratio >= 4.5, "footer team line clears 4.5:1",
    `${read(geo.footTeam, false).ratio.toFixed(2)}:1`);
  say(read(geo.attrib, false).ratio >= 4.5, "footer attribution clears 4.5:1",
    `${read(geo.attrib, false).ratio.toFixed(2)}:1`);

  /*
    The footer's "Guard" is the brand red, not the pale on-field tint, and it
    has to stay legible at that weight: 20px/800 is large text by WCAG, so 3:1.
  */
  const guard = read(geo.footGuard, false);
  say(
    guard.ratio >= 3 && Math.abs(guard.ink[0] - 224) < 26 && guard.ink[1] < 110,
    "footer wordmark uses the brand red, the same one the header wears",
    `${guard.ratio.toFixed(2)}:1  rgb(${guard.ink})`,
  );

  await page.close();
}
await browser.close();
console.log(fails === 0 ? "\nFOOTER OK\n" : `\n${fails} PROBLEM(S)\n`);
process.exit(fails ? 1 : 0);
