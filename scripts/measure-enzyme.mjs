/**
 * Prove the enzyme is constant across scene 3.
 *
 * The claim: the enzyme shows the SAME amount of DPD before the test and after
 * it, because a dose reduction does not change how much enzyme a body makes.
 * That is a claim about pixels, so it is checked in pixels.
 *
 * It SWEEPS the section rather than sampling two points, because a two-point
 * sample cannot tell "the enzyme is constant" apart from "I sampled the wrong
 * two places". The sweep also prints where green first appears, which is the
 * `gap` beat, so the beat window can be checked against the source.
 */
import { chromium } from "playwright";
import { PNG } from "pngjs";

const URL = process.argv[2] ?? "http://localhost:8080/new";
const GREEN = [0x3f, 0xa8, 0x77]; // C.green

const near = (r, g, b, [tr, tg, tb], tol = 46) =>
  Math.abs(r - tr) < tol && Math.abs(g - tg) < tol && Math.abs(b - tb) < tol;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(URL, { waitUntil: "networkidle" });

async function sample(pageProgress) {
  await page.evaluate((pp) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo(0, max * pp);
  }, pageProgress);
  await page.waitForTimeout(700);

  const info = await page.evaluate(() => {
    const why = document.querySelector("#why");
    const svg = [...why.querySelectorAll("svg")].find(
      (s) => s.getAttribute("viewBox") === "0 0 360 520",
    );
    if (!svg) return null;
    const r = svg.getBoundingClientRect();
    if (r.width < 2 || r.bottom < 0 || r.top > window.innerHeight) return null;
    /*
      THE WINDOW FOLLOWS THE DRAWING, and it did not.

      This was x 141→219, which was correct when the enzyme was ONE shape
      centred on the vessel's axis. It is now five glyphs in a row and the two
      filled ones sit LEFT of centre: `x = W/2 - 104 + i*52` at `scale(0.66)`,
      so glyph i spans x = 84.6 + 52i to 119.6 + 52i. The old window missed the
      first filled glyph entirely and cut the second in half.

      The result looked exactly like a regression — the count fell from the
      ~2235 in CONTEXT.md to ~790 and swung 38% across the turn — because a
      narrow strip across one glyph's edge is mostly measuring whichever drug
      molecule is drifting through it. The enzyme had not changed; the harness
      had been left behind by the redraw the client asked for.

      All five, with padding: x 80→332, y 250→296 of the 360x520 viewBox.
    */
    return {
      clip: {
        x: Math.max(0, Math.round(r.left + r.width * (80 / 360)) - 4),
        y: Math.max(0, Math.round(r.top + r.height * (250 / 520)) - 4),
        width: Math.round(r.width * ((332 - 80) / 360)) + 8,
        height: Math.round(r.height * ((296 - 250) / 520)) + 8,
      },
    };
  });
  if (!info) return null;

  /*
    Six frames, and take the MAX.

    Drug molecules cross the enzyme on a time-based clock, independent of
    scroll. A single screenshot therefore measures "the enzyme minus whatever
    happened to be in front of it at that millisecond", and a hexagon parked
    over the shape reads as the enzyme having shrunk. Taking the largest frame
    samples the least-occluded moment, which is the enzyme itself.

    THREE WAS ENOUGH FOR ONE BIG SHAPE AND IS NOT ENOUGH FOR FIVE SMALL ONES.
    The window is now three times wider, so more molecules sit inside it at any
    moment and an unoccluded frame is rarer. Six.
  */
  let green = 0;
  let total = 0;
  for (let f = 0; f < 6; f++) {
    const png = PNG.sync.read(await page.screenshot({ clip: info.clip }));
    let n = 0;
    for (let i = 0; i < png.data.length; i += 4) {
      if (png.data[i + 3] > 200 && near(png.data[i], png.data[i + 1], png.data[i + 2], GREEN)) n++;
    }
    green = Math.max(green, n);
    total = png.width * png.height;
    if (f < 5) await page.waitForTimeout(380);
  }
  return { green, total };
}

const STOPS = [0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.94, 0.97];
const rows = [];

console.log("\n── enzyme green pixels across scene 3 ──────────────");
for (const pp of STOPS) {
  const s = await sample(pp);
  if (!s) {
    console.log(`  page ${pp.toFixed(2)}   vessel not on screen`);
    continue;
  }
  rows.push({ pp, green: s.green });
  const bar = "█".repeat(Math.round(s.green / 90));
  console.log(
    `  page ${pp.toFixed(2)}   ${String(s.green).padStart(5)} px  ${((s.green / s.total) * 100).toFixed(1).padStart(5)}%  ${bar}`,
  );
}

/*
  Compare only the stops where the enzyme is FULLY drawn.

  `gap` fades the shape in over 0.24→0.32 local, which is intended, so the
  stops inside that ramp are partial by design — one of them measured a single
  pixel. Including them would compare the fade against the steady state and
  report a 99% "change" that is really just the entrance. The claim under test
  is that the enzyme does not change across the TURN, so the sample is every
  stop where it is at least half drawn.
*/
const peak = Math.max(...rows.map((r) => r.green));
const live = rows.filter((r) => r.green > peak * 0.5);
if (live.length < 2) {
  console.log("\n  INCONCLUSIVE  the enzyme was drawn at fewer than two sampled stops");
  await browser.close();
  process.exit(1);
}
const min = Math.min(...live.map((r) => r.green));
const max = Math.max(...live.map((r) => r.green));
const spread = (((max - min) / max) * 100).toFixed(1);

console.log(`\n  drawn from page ${live[0].pp.toFixed(2)} onward`);
console.log(`  min ${min} px · max ${max} px · spread ${spread}%`);

const ok = Number(spread) < 10;
console.log(
  ok
    ? "  PASS  constant across the turn — the dose changed, the body did not\n"
    : "  FAIL  the enzyme changes across the turn; it should not\n",
);

await browser.close();
process.exit(ok ? 0 : 1);
