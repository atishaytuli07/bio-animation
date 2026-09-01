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

/**
 * Is this pixel the enzyme's green?
 *
 * BY HUE, NOT BY DISTANCE TO A HEX. The enzyme is painted at fillOpacity 0.9
 * over a semi-transparent lumen over the page's ground — and that ground
 * travels from pink to cream across exactly the stretch this check samples. So
 * the composited RGB of the same unchanged shape genuinely moves, and a
 * fixed-radius match around #3FA877 counts a different number of its
 * antialiased edge pixels at each stop. That alone produced an 11–14% "change"
 * in a drawing that is provably identical.
 *
 * Green dominance survives the backdrop moving under it: C.green has g−r=105
 * and g−b=49, while paper, pink, coral and ink are all negative on the first.
 *
 * AND THE THRESHOLD IS SET AT THE CORE, NOT AT THE EDGE. A loose test (g−r>25)
 * still moved 10–13%, because two things that are not the enzyme pass it: the
 * antialiased rim, which composites against whatever is behind it, and the
 * GROUND ITSELF — the resolution's ground carries 12% C.green at page 0.92, so
 * the check was counting the room the enzyme stands in. The instrumented proof
 * that the shape is innocent: across pages 0.70→0.94 its rect is 348.9x504 at
 * (635,324), its transform, its fill-opacity and its group opacity are byte
 * identical. Nothing about the drawing changes; only what is behind it does.
 *
 * Composited over the lumen the enzyme's core sits at g−r≈93; the ground at its
 * greenest reaches g−r≈7. 60 is comfortably between them.
 */
const isGreen = (r, g, b) => g - r > 60 && g - b > 25;

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

      All five, with padding. The row is `x = 38.4 + 55i` at `scale(0.8)` and a
      glyph occupies [13s, 66s] from its translate point, so it spans x
      48.8→311.2 and y 248.4→295.6 of the 360x520 viewBox. RE-DERIVED, not
      nudged: these numbers come from the same three constants the component
      uses, so checking them against the source is a two-line job.
    */
    return {
      clip: {
        x: Math.max(0, Math.round(r.left + r.width * (44 / 360)) - 4),
        y: Math.max(0, Math.round(r.top + r.height * (244 / 520)) - 4),
        width: Math.round(r.width * ((316 - 44) / 360)) + 8,
        height: Math.round(r.height * ((300 - 244) / 520)) + 8,
      },
    };
  });
  if (!info) return null;

  /*
    THE OCCLUDERS ARE HIDDEN, AND THAT IS THE WHOLE POINT OF THE CHECK.

    The claim under test is "the enzyme drawing does not change across the
    turn". Drug molecules and red cells drift over it on a time clock that has
    nothing to do with scroll, so any screenshot measures the enzyme MINUS
    whatever happened to be in front of it at that millisecond. That is not the
    claim, and it is not stable either.

    Taking the largest of N frames was the previous answer and it does not hold
    now that the row spans most of the lumen: at eight frames this measured
    7.6%, 6.7% and 10.2% on three consecutive runs against a 10% threshold, and
    then 10.1%, 6.9%, 9.5% on three more. A check that fails one run in three
    is not a check, it is a coin toss — and sampling harder was solving the
    wrong problem.

    So the drug and the red cells are hidden for the screenshot and restored
    straight after. What is left in the window is the enzyme and the lumen
    behind it, which is exactly what the claim is about — one frame,
    deterministic, instead of eight and a prayer.

    CIRCLES ARE PART OF THE DRUG. Hiding only `polygon, ellipse` left a smooth
    12–15% dip that looked exactly like the enzyme shrinking through the turn,
    and it survived every attempt to tune the colour test — because a `Hex` is
    a polygon PLUS six ink-outlined vertex dots, and the dots were still there.
    Sampling the core pixel settled it: at page 0.85 it read rgb(39,39,52),
    which is C.ink, not green. Half-hiding an occluder is worse than not hiding
    it, because what is left is small enough to look like a property of the
    thing behind it.
  */
  const HIDE = `(v) => {
    const svg = [...document.querySelectorAll("#why svg")]
      .find(s => s.getAttribute("viewBox") === "0 0 360 520");
    for (const el of svg.querySelectorAll("polygon, ellipse, circle")) el.style.visibility = v;
  }`;
  await page.evaluate(`(${HIDE})("hidden")`);
  const png = PNG.sync.read(await page.screenshot({ clip: info.clip }));
  await page.evaluate(`(${HIDE})("")`);
  let green = 0;
  for (let i = 0; i < png.data.length; i += 4) {
    if (png.data[i + 3] > 200 && isGreen(png.data[i], png.data[i + 1], png.data[i + 2])) green++;
  }
  const total = png.width * png.height;
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
