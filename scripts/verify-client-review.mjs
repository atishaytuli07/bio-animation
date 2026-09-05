/**
 * Adina's review of 2026-09-01, checked point by point against the running page.
 *
 * Every item here is something a person spotted by looking, which no other
 * harness in this repo can see: they measure text overlap, contrast and pixel
 * counts, and none of them asks whether a picture says the right thing. This
 * one encodes the specific claims so they cannot quietly regress.
 *
 *   node scripts/verify-client-review.mjs      # needs `bun run dev`
 */
import { chromium } from "playwright";
import { PNG } from "pngjs";

const BASE = process.argv[2] ?? "http://localhost:8080";
const browser = await chromium.launch();
let fails = 0;
const say = (ok, label, detail) => {
  if (!ok) fails++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${detail ? "\n        " + detail : ""}`);
};

/** Scroll to a page fraction and let the spring settle. */
async function at(page, f, ms = 1500) {
  await page.evaluate((v) => {
    /*
      A fraction of the STORY, not of the document.

      Every window in this file was calibrated when the page ended at the last
      scene. It does not any more — a closing section follows it — so dividing
      by `scrollHeight` would silently point each of these numbers at a
      different moment than the one it was written for. The page marks where
      the story ends; `usePageProgress` divides by the same marker, so the
      harness and the page agree by construction rather than by coincidence.
    */
    const e = document.getElementById("story-end");
    const m = (e ? e.offsetTop : document.documentElement.scrollHeight) - innerHeight;
    window.scrollTo(0, m * v);
  }, f);
  await page.waitForTimeout(ms);
}

/**
 * Drug molecules in the vessel: hexagons, with their centre y in viewBox units.
 *
 * Invoke it as `page.evaluate(\`(${MOLECULES})()\`)`. Passing the bare string
 * makes Playwright evaluate it as an EXPRESSION, which yields the function
 * itself and not its result — the call then reads `undefined.filter` and dies.
 */
const MOLECULES = `() => {
  const svg = [...document.querySelectorAll("#why svg")].find(s => s.getAttribute("viewBox") === "0 0 360 520");
  if (!svg) return null;
  const out = [];
  for (const poly of svg.querySelectorAll("polygon")) {
    const pts = poly.getAttribute("points").trim().split(/\\s+/).map(p => p.split(",").map(Number));
    if (pts.length !== 6) continue;
    const g = poly.closest("g");
    let o = 1, n = poly;
    while (n && n !== document) { const s = getComputedStyle(n); o *= +s.opacity; n = n.parentElement; }
    if (o < 0.05) continue;
    out.push({ y: pts.reduce((a,p)=>a+p[1],0)/6, x: pts.reduce((a,p)=>a+p[0],0)/6 });
  }
  return out;
}`;

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(BASE + "/new", { waitUntil: "networkidle" });
await page.waitForTimeout(1800);

console.log("\n── 1 · the transition into the body ──────────────────────");
await at(page, 0.72);
{
  /*
    ALL the figure's svgs, not the first one.

    The drip line was moved into its own svg behind the <img> so the body
    occludes it, which made two svgs share this viewBox. `find` returned the
    tube layer — no rect, no dashed paths — and this reported the cannula and
    both guides missing while they were plainly on screen. A selector that
    assumes "one element matches" is a claim about the DOM, and the DOM changed.
  */
  const r = await page.evaluate(`(() => {
    const svgs = [...document.querySelectorAll("#why svg")].filter(s => s.getAttribute("viewBox") === "0 0 415 1415");
    if (!svgs.length) return { found:false };
    const all = sel => svgs.flatMap(s => [...s.querySelectorAll(sel)]);
    const guides = all("path").filter(p => (p.getAttribute("stroke-dasharray")||"").length);
    return {
      found: true,
      dashedCircles: all("circle").filter(c => (c.getAttribute("stroke-dasharray")||"").length).length,
      guideCount: guides.length,
      guideStarts: guides.map(g => (g.getAttribute("d")||"").slice(0, 10)),
      cannula: all("rect").length > 0,
      layers: svgs.length,
    };
  })()`);
  say(
    r.found && r.dashedCircles === 0,
    "the dashed circle over the hip is gone",
    `dashed circles found: ${r.dashedCircles}`,
  );
  say(
    r.guideCount >= 2,
    "guides carry the eye from the cannula to the vessel",
    `${r.guideCount} guide(s), starting ${r.guideStarts.join(" / ")}`,
  );
  say(r.cannula, "the cannula on the forearm is still drawn");
}

console.log("\n── 2 · the vessel moves like a vessel ────────────────────");
{
  const sample = async () =>
    page.evaluate(`(() => {
      const svg = [...document.querySelectorAll("#why svg")].find(s => s.getAttribute("viewBox") === "0 0 360 520");
      return [...svg.querySelectorAll("ellipse")].slice(0, 6).map(e => +e.getAttribute("cx"));
    })()`);
  const a = await sample();
  await page.waitForTimeout(1400);
  const b = await sample();
  const moved = a.filter((v, i) => b[i] !== undefined && Math.abs(v - b[i]) > 0.4).length;
  say(
    moved > 0,
    "blood cells drift sideways, not straight down",
    `${moved} of ${a.length} changed x over 1.4s`,
  );
}

console.log("\n── 3 · concentration through the column, not a pile ──────");
await at(page, 0.8);
{
  const mol = await page.evaluate(`(${MOLECULES})()`);
  const inVessel = mol.filter((m) => m.y > 10 && m.y < 500);
  const lowerThird = inVessel.filter((m) => m.y > 340).length;
  const bands = [0, 0, 0, 0];
  for (const m of inVessel) bands[Math.min(3, Math.floor(((m.y - 10) / 482) * 4))]++;
  const spread = bands.filter((b) => b > 0).length;
  say(
    spread === 4,
    "molecules occupy every quarter of the vessel",
    `top→bottom quarters: ${bands.join(" / ")}  (n=${inVessel.length})`,
  );
  say(
    lowerThird / inVessel.length < 0.55,
    "they are not heaped in the bottom third",
    `${((lowerThird / inVessel.length) * 100).toFixed(0)}% sit below y=340`,
  );
}

console.log("\n── 4 · the enzyme reads as protein, not a container ──────");
{
  const r = await page.evaluate(`(() => {
    const svg = [...document.querySelectorAll("#why svg")].find(s => s.getAttribute("viewBox") === "0 0 360 520");
    const paths = [...svg.querySelectorAll("path")].filter(p => (p.getAttribute("d")||"").startsWith("M40 12"));
    const filled = paths.filter(p => (p.getAttribute("fill")||"none") !== "none").length;
    return { total: paths.length, filled,
             usesClip: !!svg.querySelector("clipPath"),
             levelLines: [...svg.querySelectorAll("line")].length };
  })()`);
  say(
    r.total === 5 && r.filled === 2,
    "five enzyme places, two of them made",
    `${r.filled} filled of ${r.total}`,
  );
  say(!r.usesClip, "no fill-level clip — a flat top edge is what read as a bowl");
}
{
  /*
    AND SITE-WIDE, not scene-scoped.

    The check above looks only inside #why, because that is the scene the
    redraw touched. It passed for weeks while the two-patient scene and the
    ambient element still drew the OLD rounded rectangle with a notch — the
    exact silhouette the client described as a container. A check scoped to the
    place you just edited cannot tell you the edit was incomplete.

    It fails on any enzyme-sized closed shape built from the quadratic-and-line
    grammar those old copies used.

    AND IT HAS TO SWEEP. The first version of this wider check was itself a
    false pass: it ran at whatever scroll position the previous test left, and
    the two-patient scene's diagram only mounts inside its own beat, so there
    was nothing in the DOM to find. Re-introducing the old shape on purpose
    still gave a PASS. Every scene has to be brought on screen before it can be
    audited — the same mistake one level up.
  */
  const SCAN = `() => {
    const out = [];
    for (const el of document.querySelectorAll("path")) {
      const d = (el.getAttribute("d") || "").trim();
      if (!d.endsWith("Z") || d.length < 90 || d.length > 240) continue;
      if (d.startsWith("M40 12 C 54 12")) continue;      // the canonical one
      if (/Q\\d+ \\d+ \\d+ \\d+ L\\d+ \\d+/.test(d)) out.push(d.slice(0, 46));
    }
    return out;
  }`;
  const strays = new Set();
  for (const f of [0.0, 0.19, 0.23, 0.27, 0.33, 0.5, 0.8, 0.97]) {
    await at(page, f, 900);
    for (const d of await page.evaluate(`(${SCAN})()`)) strays.add(d);
  }
  say(
    strays.size === 0,
    "every enzyme drawn anywhere on the page is the one canonical silhouette",
    strays.size
      ? `stray shape(s): ${[...strays].join(" | ")}`
      : "no rounded-box-with-a-notch left, across 8 scroll positions",
  );
}

console.log("\n── 5 · the ending keeps a tint ───────────────────────────");
{
  /*
    PAINTED PIXELS, not getComputedStyle.

    The ground's colour is authored with color-mix, so the computed value comes
    back as `oklab(0.90 0.0019 0.0014)`. Pulling numbers out of that string and
    treating them as RGB yields rgb(1, 0, 0) and a spread of 1 — a confident,
    meaningless failure that looked exactly like a real one. Same rule as the
    contrast check: sample what was actually drawn.
  */
  const rows = [];
  for (const f of [0.9, 0.94, 0.97]) {
    await at(page, f, 1200);
    const shot = PNG.sync.read(
      await page.screenshot({ clip: { x: 8, y: 660, width: 40, height: 40 } }),
    );
    let r = 0,
      g = 0,
      b = 0,
      n = 0;
    for (let i = 0; i < shot.data.length; i += 4) {
      r += shot.data[i];
      g += shot.data[i + 1];
      b += shot.data[i + 2];
      n++;
    }
    const rgb = [r / n, g / n, b / n].map(Math.round);
    rows.push({ rgb, spread: Math.max(...rgb) - Math.min(...rgb) });
  }
  const worst = Math.min(...rows.map((x) => x.spread));
  say(
    worst >= 6,
    "the resolution keeps a tint rather than draining to neutral",
    rows
      .map((x, i) => `${[0.9, 0.94, 0.97][i]}: rgb(${x.rgb.join(",")}) spread ${x.spread}`)
      .join("   "),
  );
}

console.log("\n── 6 · after the dose is matched: fewer, not none ────────");
{
  await at(page, 0.8);
  const before = (await page.evaluate(`(${MOLECULES})()`)).length;
  await at(page, 0.97);
  const after = (await page.evaluate(`(${MOLECULES})()`)).length;
  say(after > 0, "drug is still present after adjustment", `${before} before → ${after} after`);
  say(
    after < before * 0.7,
    "and visibly reduced",
    `${((after / before) * 100).toFixed(0)}% of the loaded count`,
  );
}

console.log("\n── 7 · the enzyme is identical before and after ──────────");
{
  const shape = async () =>
    page.evaluate(`(() => {
      const svg = [...document.querySelectorAll("#why svg")].find(s => s.getAttribute("viewBox") === "0 0 360 520");
      return [...svg.querySelectorAll("path")].filter(p => (p.getAttribute("d")||"").startsWith("M40 12"))
        .map(p => (p.getAttribute("fill")||"none") + "|" + (p.getAttribute("stroke-dasharray")||"-")).join(" ");
    })()`);
  await at(page, 0.8);
  const before = await shape();
  await at(page, 0.97);
  const after = await shape();
  say(
    before === after && before.length > 0,
    "same fills and same dashes on both sides of the turn",
    before === after ? before.slice(0, 90) : `before: ${before}\n        after:  ${after}`,
  );
}

console.log("\n── 8 · the documentation nav stays put ───────────────────");
{
  const doc = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await doc.goto(BASE + "/description", { waitUntil: "networkidle" });
  await doc.waitForTimeout(1200);
  const rows = [];
  for (const f of [0, 0.4, 1]) {
    await at(doc, f, 500);
    rows.push(
      await doc.evaluate(() => {
        const h = document.querySelector("header");
        const r = h.getBoundingClientRect();
        return {
          pos: getComputedStyle(h).position,
          top: Math.round(r.top),
          h: Math.round(r.height),
        };
      }),
    );
  }
  say(
    rows.every((r) => r.pos === "sticky" && r.top === 0),
    "pinned at the top through the whole page",
    rows.map((r, i) => `${[0, 40, 100][i]}%: ${r.pos} top ${r.top}`).join("   "),
  );
  say(rows[0].h <= 76, "and compact", `${rows[0].h}px tall`);
  await doc.close();
}

await browser.close();
console.log(fails === 0 ? "\nALL POINTS VERIFIED\n" : `\n${fails} NOT SATISFIED\n`);
process.exit(fails ? 1 : 0);
