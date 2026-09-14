/**
 * The shared header on the story, where it has the most to get wrong.
 *
 * The story's header is `fixed` over a page whose every beat is timed against
 * scroll, and it carries the progress rail on its seam. Three things broke or
 * nearly broke when it was built, and none of them showed up in any other check:
 *
 *   1. THE PHONE MENU WAS PAINTED OVER. The rail and the chapter label lived in
 *      a fixed layer above the header, so opening the menu showed "03 · Two
 *      people" as faint text between its first two rows. This compares painted
 *      pixels: the open menu is captured, the rail and label layers are hidden,
 *      and it is captured again. Anything that changed was painting over it.
 *      (A hit-test cannot see this — both layers are pointer-events: none.)
 *
 *   2. THE RAIL MUST SIT ON THE SEAM at both header heights: its fill covers the
 *      header's bottom border and the knob is centred on the fill. The first
 *      version was 2px high on phones because it assumed the header's height
 *      instead of measuring it.
 *
 *   3. NOTHING RESTS UNDER THE BAR. Headlines, figures and controls that are
 *      substantially visible (opacity ≥ 0.6) must not intersect the header band
 *      at any sampled point of the story. Fainter frames are transitions — a
 *      headline fading in or out through the band for one sample — and are
 *      reported, not failed.
 *
 * Usage: node scripts/verify-header.mjs [origin=http://localhost:8080]
 */
import { PNG } from "pngjs";
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:8080";
let fails = 0;
const say = (ok, what, detail = "") => {
  if (!ok) fails++;
  console.log(`  ${ok ? "ok  " : "FAIL"}  ${what}${detail ? `\n        ${detail}` : ""}`);
};

const browser = await chromium.launch();

/** Scroll the story to fraction `f` of its length, in steps, the way a reader would. */
async function storyAt(page, f) {
  for (let s = 0; s <= f; s += 0.02) {
    await page.evaluate((s) => {
      const e = document.getElementById("story-end");
      window.scrollTo(0, (e.offsetTop - innerHeight) * s);
    }, s);
    await page.waitForTimeout(25);
  }
  await page.evaluate((f) => {
    const e = document.getElementById("story-end");
    window.scrollTo(0, (e.offsetTop - innerHeight) * f);
  }, f);
  await page.waitForTimeout(1200);
}

console.log("\n── 1 · nothing paints over the open phone menu");
for (const f of [0.05, 0.4, 0.9]) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(BASE + "/new", { waitUntil: "networkidle" });
  await storyAt(page, f);
  await page.click("header button[aria-label='Menu']");
  await page.waitForTimeout(400);
  const { clip, radius } = await page.evaluate(() => {
    const menu = [...document.querySelectorAll("header > div")].at(-1);
    const m = menu.getBoundingClientRect();
    return {
      clip: {
        x: Math.floor(m.left),
        y: Math.floor(m.top),
        width: Math.ceil(m.width),
        height: Math.ceil(m.height),
      },
      radius: parseFloat(getComputedStyle(menu).borderTopLeftRadius) || 0,
    };
  });
  /*
    ONLY PIXELS INSIDE THE MENU'S OWN SHAPE, border included. Its box is a
    rectangle but the menu is not: outside each rounded corner the rail line
    correctly shows through, and the first run of this check counted that as
    painting over the menu. The border stays in, because a knob sitting on the
    border was part of the original fault.
  */
  const inside = (x, y) => {
    const w = clip.width;
    const h = clip.height;
    const cx = x < radius ? radius : x > w - radius ? w - radius : x;
    const cy = y < radius ? radius : y > h - radius ? h - radius : y;
    return (x - cx) ** 2 + (y - cy) ** 2 <= (radius - 0.75) ** 2 || cx === x || cy === y;
  };
  const shot = async () => PNG.sync.read(await page.screenshot({ clip, animations: "disabled" }));
  const withLayers = await shot();
  // hide the two layers that sit near the menu: the rail inside the header,
  // and the fixed chapter-label layer outside it
  await page.addStyleTag({
    content: `header [aria-hidden="true"].pointer-events-none, body .fixed.inset-x-0.top-0:not(header) { visibility: hidden !important; }`,
  });
  await page.waitForTimeout(150);
  const without = await shot();
  let diff = 0;
  for (let i = 0; i < withLayers.data.length; i += 4) {
    const px = (i / 4) % withLayers.width;
    const py = Math.floor(i / 4 / withLayers.width);
    if (!inside(px + 0.5, py + 0.5)) continue;
    const d =
      Math.abs(withLayers.data[i] - without.data[i]) +
      Math.abs(withLayers.data[i + 1] - without.data[i + 1]) +
      Math.abs(withLayers.data[i + 2] - without.data[i + 2]);
    if (d > 24) diff++;
  }
  say(
    diff === 0,
    `story at ${f * 100}%: the menu's pixels do not depend on the rail or the chapter label`,
    `${diff} px changed when they were hidden`,
  );
  await page.close();
}

console.log("\n── 2 · the rail sits on the header's seam");
for (const [w, h] of [
  [390, 844],
  [1440, 900],
]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto(BASE + "/new", { waitUntil: "networkidle" });
  await storyAt(page, 0.3);
  const r = await page.evaluate(() => {
    const hd = document.querySelector("header");
    // the rail's wrapper specifically: the nav underline also uses origin-left
    const rail = hd.querySelector(":scope > div > [aria-hidden='true'].pointer-events-none");
    const fill = rail?.querySelector(".h-full.origin-left");
    const knob = rail?.querySelector("svg");
    if (!fill || !knob) return null;
    const b = hd.getBoundingClientRect();
    const border = parseFloat(getComputedStyle(hd).borderBottomWidth);
    const f = fill.getBoundingClientRect();
    const k = knob.getBoundingClientRect();
    return {
      bottom: b.bottom,
      border,
      fTop: f.top,
      fBottom: f.bottom,
      fillW: f.width,
      kMid: (k.top + k.bottom) / 2,
    };
  });
  if (!r) {
    say(false, `${w}px: rail found inside the header`, "no fill or knob inside <header>");
  } else {
    const covers = r.fTop <= r.bottom - r.border + 0.5 && r.fBottom >= r.bottom - 0.5;
    const centred = Math.abs(r.kMid - (r.fTop + r.fBottom) / 2) <= 1;
    say(
      covers && centred && r.fillW > 0,
      `${w}px: fill covers the ${r.border}px border and the knob is centred on it`,
      `header ends ${r.bottom}px · fill ${r.fTop}→${r.fBottom} · knob centre ${r.kMid}`,
    );
  }
  await page.close();
}

console.log("\n── 3 · nothing substantially visible rests under the bar");
for (const [w, h] of [
  [1024, 600],
  [1280, 600],
  [1440, 900],
  [768, 1024],
  [390, 844],
]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto(BASE + "/new", { waitUntil: "networkidle" });
  const band = await page.evaluate(
    () => document.querySelector("header").getBoundingClientRect().bottom,
  );
  const solid = new Map();
  const faint = new Set();
  for (let i = 0; i <= 100; i += 1.5) {
    await page.evaluate((f) => {
      const e = document.getElementById("story-end");
      window.scrollTo(0, (e.offsetTop - innerHeight) * f);
    }, i / 100);
    await page.waitForTimeout(220);
    const hits = await page.evaluate((band) => {
      const opacity = (el) => {
        let a = 1;
        for (let n = el; n && n !== document.body; n = n.parentElement) {
          const cs = getComputedStyle(n);
          if (cs.visibility === "hidden" || cs.display === "none") return 0;
          a *= Number(cs.opacity);
        }
        return a;
      };
      const out = [];
      for (const el of document.querySelectorAll("h1,h2,h3,p,span,a,button,img,input")) {
        // the header itself, and the fixed decorative layers meant to pass behind it
        if (el.closest("header") || el.closest(".fixed")) continue;
        // only elements that own text, or are an image or a control
        if (!/^(IMG|INPUT|BUTTON)$/.test(el.tagName)) {
          const own = [...el.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim());
          if (!own) continue;
        }
        if (el.closest("[aria-hidden='true']")) continue;
        const r = el.getBoundingClientRect();
        if (r.width < 6 || r.height < 6 || r.bottom <= 0 || r.top >= band) continue;
        if (r.right <= 0 || r.left >= innerWidth) continue;
        const a = opacity(el);
        if (a < 0.15) continue;
        const label =
          el.tagName === "IMG"
            ? `img ${el.src.split("/").pop()}`
            : `"${el.textContent.trim().slice(0, 36)}"`;
        out.push({ label, a: +a.toFixed(2), top: Math.round(r.top) });
      }
      return out;
    }, band);
    for (const x of hits) {
      if (x.a >= 0.6) solid.set(x.label, `${(i / 100).toFixed(3)} top ${x.top} a ${x.a}`);
      else faint.add(x.label);
    }
  }
  // the landing below the story scrolls normally under a header; that is expected
  say(
    solid.size === 0,
    `${w}x${h}: nothing at ≥60% opacity under the ${Math.round(band)}px bar`,
    [...solid].map(([k, v]) => `${k} at p ${v}`).join("\n        ") ||
      (faint.size ? `transitions through the band (allowed): ${[...faint].join(", ")}` : ""),
  );
  await page.close();
}

await browser.close();
console.log(fails ? `\n${fails} FAILED\n` : "\nHEADER VERIFIED\n");
process.exit(fails ? 1 : 0);
