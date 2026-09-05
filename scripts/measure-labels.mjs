/**
 * One label at a time.
 *
 * WHY THIS EXISTS SEPARATELY FROM THE COLLISION CHECK. `audit.mjs collisions`
 * only considers elements above 0.45 effective opacity, which is the right
 * threshold for "is this text unreadable because something is on top of it".
 * It is the wrong threshold for a different fault: two elements pinned to the
 * SAME coordinates, cross-fading through each other at low opacity. That does
 * not make either unreadable — it makes the frame look smeared, and it is
 * invisible to a 0.45 gate.
 *
 * It has happened twice. The scale annotations during the descent stacked at
 * 0.167 and 0.333 while both were "invisible" to the audit, and the two
 * headlines either side of the turn in scene three did the same thing.
 *
 * So this walks the story at fine resolution and asserts that each group of
 * co-located elements has at most ONE member above a low floor.
 *
 *   node scripts/measure-labels.mjs                       # needs `bun run dev`
 *   node scripts/measure-labels.mjs --from=0 --to=0.25    # just the descent
 *
 * RESOLUTION AND SETTLE TIME ARE THE WHOLE GAME, and the first version of this
 * script got both wrong and therefore passed against a defect it was written to
 * catch. Two things to keep in mind if you change them:
 *
 *   · The offending overlap was 0.004 of PAGE progress wide. Sampling the whole
 *     page in 150 steps gives a stride of 0.0067 — wider than the fault, so it
 *     lands between samples more often than not. Steps must be finer than the
 *     narrowest window you care about.
 *   · Section progress is spring-smoothed. Scrolling and reading 70ms later
 *     measures where the spring HAS GOT TO, not where it is going, so samples
 *     cluster and skip. It needs a few hundred ms to settle.
 *
 * A check that has never been run against a known failure is not evidence.
 * Break the thing on purpose, watch this go red, then put it back.
 */
import { chromium } from "playwright";

const arg = (k, d) => {
  const f = process.argv.find((a) => a.startsWith(`--${k}=`));
  return f ? f.slice(k.length + 3) : d;
};
const BASE = arg("url", "http://localhost:8080");
/**
 * Anything above this counts as "on screen" for the purposes of stacking.
 *
 * Set where the artefact becomes PERCEPTIBLE, not at the noise floor. At 0.04
 * this reported the hero copy crossing "One gene. One letter." while the second
 * was at 5% opacity — true, and not something any reader can see. Two elements
 * both at 12% or more in one slot is a visible smear; below that it is arithmetic.
 *
 * It still has teeth: in the known scale-label defect the two labels crossed at
 * 0.15 and 0.35, so this floor catches it. Check that again before raising it.
 */
const FLOOR = Number(arg("floor", "0.12"));
/** Scan window, in page progress. Defaults to the descent, where the risk is. */
const FROM = Number(arg("from", "0"));
const TO = Number(arg("to", "0.28"));
/** Stride must be finer than the narrowest overlap worth catching. */
const STEPS = Number(arg("steps", "240"));
/** Section progress is spring-smoothed; it needs time to arrive. */
const SETTLE = Number(arg("settle", "230"));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(BASE + "/new", { waitUntil: "networkidle" });
await page.waitForTimeout(2200);

const failures = [];
let checked = 0;

for (let i = 0; i <= STEPS; i++) {
  const pp = FROM + ((TO - FROM) * i) / STEPS;
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
    const max = (e ? e.offsetTop : document.documentElement.scrollHeight) - window.innerHeight;
    window.scrollTo({ top: max * v, behavior: "instant" });
  }, pp);
  await page.waitForTimeout(SETTLE);

  const groups = await page.evaluate((floor) => {
    const eff = (e) => {
      let o = 1,
        n = e;
      while (n && n !== document.documentElement) {
        const s = getComputedStyle(n);
        if (s.visibility === "hidden" || s.display === "none") return 0;
        o *= +s.opacity;
        n = n.parentElement;
      }
      return o;
    };

    /*
      GEOMETRY IS RECTANGLE INTERSECTION, not proximity.

      The first version bucketed elements by rounded position, which reported
      the locus line and the caption beneath it as "co-located" — they are two
      lines of one column about 24px apart, which is ordinary typography, not a
      fault. What actually matters is whether two things are drawn ON TOP of
      each other, so the test is: do the boxes overlap, and does that overlap
      cover a real share of the smaller one.
    */
    /*
      SELECT BY DIRECT TEXT, not by tag and class.

      Two earlier versions of this selector could not see the thing they were
      written to catch. `p, span[class*='uppercase']` missed the scale
      annotations because their uppercase span wraps a rule element beside the
      text, so it has element children and was filtered out; the inner spans
      carry no `uppercase` class of their own. `audit.mjs` has the same blind
      spot from the other direction — it keeps only `children.length === 0`,
      and these labels are never leaves.

      An element that owns a non-empty text node is drawing words, whatever it
      is called and whatever else it contains. That is the right test.
    */
    const ownsText = (el) => {
      for (const n of el.childNodes) {
        if (n.nodeType === 3 && (n.nodeValue || "").trim()) return true;
      }
      return false;
    };

    const items = [];
    for (const el of document.querySelectorAll("body *")) {
      if (!ownsText(el)) continue;
      /*
        COPY ONLY, not diagram internals.

        Text inside an <svg> is an annotation on a drawing — the helix's "DPYD"
        callout, a rung's letters. A full-frame headline is DESIGNED to pass
        over those; that is layering, and flagging it would make this check
        report a fault on every scene and be ignored within a week. The fault
        this exists to catch is two pieces of COPY occupying one slot.
      */
      if (el.closest("svg")) continue;
      const text = (el.textContent || "").trim();
      if (!text) continue;
      const o = eff(el);
      if (o <= floor) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 20 || r.height < 8 || r.bottom < 0 || r.top > window.innerHeight) continue;
      items.push({ el, t: text.slice(0, 34), o: +o.toFixed(3), r });
    }

    const out = [];
    for (let a = 0; a < items.length; a++) {
      for (let b = a + 1; b < items.length; b++) {
        /*
          Skip ancestors and descendants. Selecting by direct text means a
          paragraph and a <span> it wraps are both collected — "About three
          billion letters." and the "This one can change your dose." inside it,
          for instance — and a child is of course inside its parent's box. That
          is one piece of copy, not two things stacked.
        */
        if (items[a].el.contains(items[b].el) || items[b].el.contains(items[a].el)) continue;
        const A = items[a].r;
        const B = items[b].r;
        const w = Math.min(A.right, B.right) - Math.max(A.left, B.left);
        const h = Math.min(A.bottom, B.bottom) - Math.max(A.top, B.top);
        if (w <= 0 || h <= 0) continue;
        const share = (w * h) / Math.min(A.width * A.height, B.width * B.height);
        // A third of the smaller box covered is unambiguously "on top of".
        if (share < 0.34) continue;
        out.push({
          share: +share.toFixed(2),
          items: [
            { t: items[a].t, o: items[a].o },
            { t: items[b].t, o: items[b].o },
          ],
        });
      }
    }
    return out;
  }, FLOOR);

  checked++;
  for (const g of groups) failures.push({ pp: pp.toFixed(3), ...g });
}

const stride = ((TO - FROM) / STEPS).toFixed(5);
console.log(
  `\n── co-located text · page ${FROM}–${TO} · ${checked} samples · stride ${stride} · floor ${FLOOR} ──`,
);
if (!failures.length) {
  console.log("  ok    never two things sharing one anchor\n");
} else {
  // Collapse consecutive positions reporting the same pair.
  const seen = new Set();
  for (const f of failures) {
    const sig = f.items.map((i) => i.t).join(" | ");
    if (seen.has(sig)) continue;
    seen.add(sig);
    console.log(
      `  FAIL  page ${f.pp}  ${(f.share * 100).toFixed(0)}% overlap  ${f.items.map((i) => `"${i.t}" @${i.o}`).join("  +  ")}`,
    );
  }
  console.log(`\n  ${failures.length} position(s) across ${seen.size} distinct pair(s)\n`);
}

await browser.close();
process.exit(failures.length ? 1 : 0);
