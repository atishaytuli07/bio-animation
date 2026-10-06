// Hero objects never touch the character or the copy.
// Painted pixels, not boxes. A character plate is a cutout whose box is mostly transparent, so a box test reports
// everything as overlapping. The plate is drawn into a canvas and its alpha is read under each object's own drawing,
// grown by margin on every side — enough for the drift (objects ±7px, the plate ±4px) plus a gap a reader can see.
// Checked on every page with a plate, from xl up (below it the objects are not rendered — that is asserted too,
// because that rule is what keeps them off the copy at tablet width): Engineering's scattered objects, and
// Description's docked DPD + 5-fu pair, including its labels.
// Found, when first run: Engineering's small enzyme sat on the character's hand and the test device at 1280 (2651 px
// within 14px) and 1366 (970 px) — he holds the device out in front of him, so he reaches further left than `lead`
// says.
// Usage: node scripts/verify-hero-art.mjs [origin=http://localhost:8080]
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:8080";
const MARGIN = 14;
/** Pages whose hero carries a character plate. */
const PAGES = ["/description", "/engineering"];
// Pages with no character: the piece sits in the empty band instead, from lg. Each is a different object on purpose —
// the client asked for fewer, larger, meaningful elements but not four identical heroes.
const PIECE_ONLY = ["/human-practices", "/safety-and-security"];

let fails = 0;
const say = (ok, what, detail = "") => {
  if (!ok) fails++;
  console.log(`  ${ok ? "ok  " : "FAIL"}  ${what}${detail ? `\n        ${detail}` : ""}`);
};

const browser = await chromium.launch();

for (const route of PAGES) {
  console.log(`\n── ${route}`);

  // below xl, nothing floats beside the character
  for (const w of [768, 1024]) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 } });
    await page.goto(BASE + route, { waitUntil: "networkidle" });
    const shown = await page.evaluate(() => {
      const hero = document.querySelector("section");
      const els = [
        ...[...hero.querySelectorAll("div[aria-hidden='true']")].filter((d) =>
          d.className.includes("w-[42%]"),
        ),
        ...hero.querySelectorAll("[data-piece]"),
      ];
      return els.filter((e) => {
        const r = e.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && e.children.length > 0;
      }).length;
    });
    say(
      shown === 0,
      `${w}px: no objects beside the character`,
      shown ? `${shown} layer(s) rendered` : "",
    );
    await page.close();
  }

  for (const w of [1280, 1366, 1440, 1600, 1920]) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 } });
    await page.goto(BASE + route, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    const rows = await page.evaluate(async (MARGIN) => {
      const hero = document.querySelector("section");
      const img = [...hero.querySelectorAll("img")].find((i) => /hero-/.test(i.src));
      if (!img) return { error: "no character plate" };
      await img.decode();
      const ir = img.getBoundingClientRect();
      const c = document.createElement("canvas");
      c.width = Math.round(ir.width);
      c.height = Math.round(ir.height);
      const g = c.getContext("2d");
      g.drawImage(img, 0, 0, c.width, c.height);
      const alpha = g.getImageData(0, 0, c.width, c.height).data;
      const lede = hero.querySelector("p").getBoundingClientRect();

      /** Every drawn thing to test: each scattered object's svg, the dock's svgs and labels. */
      const targets = [];
      const band = [...hero.querySelectorAll("div[aria-hidden='true']")].find((d) =>
        d.className.includes("w-[42%]"),
      );
      if (band)
        [...band.children].forEach((el, i) => {
          const s = el.querySelector("svg");
          if (s) targets.push({ name: `object #${i}`, box: s.getBoundingClientRect() });
        });
      // Whatever piece the page carries, not Description's dock by name. This block used to look for the dock
      // alone; the day Engineering swapped its scatter for its own piece, the check found nothing and said so,
      // which is the only reason it did not quietly stop testing that page.
      const piece = hero.querySelector("[data-piece]");
      if (piece) {
        piece
          .querySelectorAll("svg, img")
          .forEach((el, i) =>
            targets.push({ name: `piece part ${i + 1}`, box: el.getBoundingClientRect() }),
          );
        piece
          .querySelectorAll("[data-piece-label]")
          .forEach((l) =>
            targets.push({ name: `label "${l.textContent}"`, box: l.getBoundingClientRect() }),
          );
      }

      return targets
        .filter((t) => t.box.width > 0)
        .map((t) => {
          const x0 = Math.floor(t.box.left - MARGIN - ir.left);
          const x1 = Math.ceil(t.box.right + MARGIN - ir.left);
          const y0 = Math.floor(t.box.top - MARGIN - ir.top);
          const y1 = Math.ceil(t.box.bottom + MARGIN - ir.top);
          let hits = 0;
          for (let y = Math.max(0, y0); y < Math.min(c.height, y1); y++)
            for (let x = Math.max(0, x0); x < Math.min(c.width, x1); x++)
              if (alpha[(y * c.width + x) * 4 + 3] > 40) hits++;
          return { name: t.name, hits, ledeGap: Math.round(t.box.left - lede.right) };
        });
    }, MARGIN);

    if (rows.error) {
      say(false, `${w}px`, rows.error);
    } else {
      const bad = rows.filter((r) => r.hits > 0 || r.ledeGap < 24);
      say(
        rows.length > 0 && bad.length === 0,
        `${w}px: ${rows.length} drawn things clear of the character and the copy`,
        rows.length === 0
          ? "nothing found to test — has the hero markup changed?"
          : bad
              .map(
                (r) =>
                  `${r.name}: ${r.hits} character px within ${MARGIN}px, ${r.ledeGap}px from the lede`,
              )
              .join("\n        "),
      );
    }
    await page.close();
  }
}

for (const route of PIECE_ONLY) {
  console.log(`\n\u2500\u2500 ${route}`);
  for (const w of [768, 1024, 1280, 1440, 1920]) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 } });
    await page.goto(BASE + route, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    const r = await page.evaluate(() => {
      const hero = document.querySelector("section");
      // The one on screen. Both arrangements are in the DOM — beside the copy from lg, in the corner below it under
      // lg — and the other is display: none. Taking the first match reported "no piece rendered" at 768 while the
      // phone one was sitting there perfectly.
      const piece = [...hero.querySelectorAll("[data-piece]")].find((el) => {
        const b = el.getBoundingClientRect();
        return b.width > 0 && b.height > 0;
      });
      const box = piece?.getBoundingClientRect();
      const lede = hero.querySelector("p").getBoundingClientRect();
      const shown = !!box && box.width > 0 && box.height > 0;
      return {
        shown,
        gap: shown ? Math.round(box.left - lede.right) : null,
        below: shown ? Math.round(box.top - lede.bottom) : null,
        right: shown ? Math.round(innerWidth - box.right) : null,
        bottom: shown
          ? Math.round(
              document.querySelector("section").getBoundingClientRect().bottom - box.bottom,
            )
          : null,
        labels: hero.querySelectorAll("[data-piece-label]").length,
      };
    });
    // Below lg the copy column is the full width, so the piece stands in the corner under it instead of beside it —
    // the same arrangement the character plates use on a phone. It still has to clear the copy, just downwards.
    if (w < 1024) {
      say(
        r.shown && r.below >= 8 && r.bottom >= 0,
        `${w}px: the piece stands under the copy, inside the hero`,
        r.shown
          ? `${r.below}px below the lede, ${r.bottom}px above the hero's floor`
          : "no piece rendered",
      );
    } else {
      say(
        r.shown && r.gap >= 24 && r.right >= 16,
        `${w}px: the piece clears the copy and the edge`,
        r.shown
          ? `gap to lede ${r.gap}px, ${r.right}px from the right edge, ${r.labels} label(s)`
          : "no piece rendered",
      );
    }
    await page.close();
  }
}

// Team opens on the team's photographs instead of a drawn piece. The frame has the same duties a piece has: it
// stays inside the hero, clear of the copy and the edges, and the photograph in it has actually arrived.
{
  console.log("\n── /team: the photographs");
  for (const w of [390, 768, 1024, 1280, 1440, 1920]) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 } });
    await page.goto(BASE + "/team", { waitUntil: "networkidle" });
    await page.waitForTimeout(300);
    const r = await page.evaluate(() => {
      const hero = document.querySelector("section[aria-labelledby='page-hero-title']");
      const frame = hero.querySelector("[aria-roledescription='carousel']");
      if (!frame) return null;
      const h = hero.getBoundingClientRect();
      const f = frame.getBoundingClientRect();
      const lede = hero.querySelector("h1 ~ p").getBoundingClientRect();
      const title = hero.querySelector("h1").getBoundingClientRect();
      const copy = { right: Math.max(lede.right, title.right), bottom: lede.bottom };
      const shown = [...frame.querySelectorAll("img")].find(
        (i) => getComputedStyle(i).opacity === "1",
      );
      return {
        inside: f.top >= h.top && f.bottom <= h.bottom + 0.5,
        edge: Math.round(Math.min(f.left, innerWidth - f.right)),
        // beside the copy or below it, never across it
        gap: Math.round(Math.max(f.left - copy.right, f.top - copy.bottom)),
        loaded: !!shown && shown.complete && shown.naturalWidth > 0,
        width: Math.round(f.width),
      };
    });
    say(
      !!r && r.inside && r.edge >= 16 && r.gap >= 16 && r.loaded,
      `${w}px: the photograph is inside the hero, clear of the copy and the edges`,
      r
        ? `${r.width}px wide, ${r.gap}px from the copy, ${r.edge}px from the edge${r.loaded ? "" : ", NOT LOADED"}${r.inside ? "" : ", OUTSIDE THE HERO"}`
        : "no carousel rendered",
    );
    await page.close();
  }
}

// And NO two heroes are the same picture. Human Practices, Safety and Team carried an identical four-icon scatter
// before this, which is what the client objected to: "I don't want every hero to look identical."
{
  console.log("\n\u2500\u2500 each hero is its own");
  const seen = new Map();
  for (const route of [...PAGES, ...PIECE_ONLY]) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(BASE + route, { waitUntil: "networkidle" });
    await page.waitForTimeout(300);
    const shape = await page.evaluate(() => {
      const p = document.querySelector("section [data-piece]");
      if (!p) return "none";
      // what it is made of and what it says, not where it sits
      const kinds = [...p.querySelectorAll("svg, img, span")].map((e) => e.tagName).join(",");
      const text = [...p.querySelectorAll("[data-piece-label]")]
        .map((e) => e.textContent)
        .join("|");
      return `${kinds}::${text}`;
    });
    const twin = seen.get(shape);
    say(!twin, `${route} is not a copy of another hero`, twin ? `identical to ${twin}` : "");
    seen.set(shape, route);
    await page.close();
  }
}

await browser.close();
console.log(fails ? `\n${fails} FAILED\n` : "\nHERO ART VERIFIED\n");
process.exit(fails ? 1 : 0);
