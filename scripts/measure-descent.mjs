/**
 * Capture the ending of the descent, frame by frame, through the pull-back and
 * across the boundary into the two-patient scene.
 *
 * NOTE ON A BUG THIS SCRIPT USED TO HAVE. It read an element's opacity with
 * `+el.getAttribute("opacity") || 1`, and in JavaScript `0 || 1` is 1 — so
 * every frame where a layer was fully hidden was reported as fully visible.
 * That sent a diagnosis in completely the wrong direction for a while. Read the
 * attribute, then decide whether it is missing; never coalesce a numeric zero.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const URL = process.argv[2] ?? "http://localhost:8080/new";
const OUT = process.argv[3] ?? ".";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

/* The descent runs page 0.000 → ~0.203; the handoff into scene two ends at
   0.231. These stops walk the flip, the hold, the retreat and the boundary. */
const STOPS = [0.06, 0.09, 0.12, 0.145, 0.158, 0.168, 0.178, 0.186, 0.196, 0.212, 0.235, 0.26];

for (const pp of STOPS) {
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
    window.scrollTo(0, max * v);
  }, pp);
  await page.waitForTimeout(1400); // let the spring settle

  const m = await page.evaluate(() => {
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
    /** Read an SVG presentation attribute WITHOUT coalescing a real zero. */
    const attr = (el, name, fallback) => {
      const v = el?.getAttribute(name);
      return v == null || v === "" ? fallback : +v;
    };
    const r = (v) => (v == null ? null : +Number(v).toFixed(3));

    const helixSvg = document.querySelector('svg[viewBox="-260 0 680 760"]');
    const helixRoot = helixSvg?.querySelector("g");
    const seqStrand = document.querySelector('svg[viewBox="0 0 1200 260"]');
    const field = document.querySelector(".field");
    const groundStripes = document.querySelector(".env-stripes");

    // How dense is the sequence's strand right now? Count its rungs.
    const rungs = seqStrand ? seqStrand.querySelectorAll("line").length : null;

    // Is the closing statement up, and is the caption gone?
    const texts = [...document.querySelectorAll("p")];
    const closing = texts.find((t) => t.textContent?.includes("About three billion"));
    const caption = texts.find((t) => t.textContent?.includes("tell the cell where to cut"));

    return {
      helix: helixRoot ? r(attr(helixRoot, "opacity", 1)) : null,
      strandOpacity: seqStrand ? r(eff(seqStrand)) : null,
      rungs,
      field: field ? r(eff(field)) : null,
      stripes: groundStripes ? r(eff(groundStripes)) : null,
      closing: closing ? r(eff(closing)) : null,
      caption: caption ? r(eff(caption)) : null,
    };
  });

  await page.screenshot({
    path: `${OUT}/end-${String(Math.round(pp * 1000)).padStart(4, "0")}.png`,
  });
  console.log(
    `page ${pp.toFixed(3)}  helix=${m.helix}  strand=${m.strandOpacity} (${m.rungs} rungs)  field=${m.field}  stripes=${m.stripes}  caption=${m.caption}  closing=${m.closing}`,
  );
}

await browser.close();
