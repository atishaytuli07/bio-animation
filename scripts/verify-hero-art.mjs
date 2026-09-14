/**
 * Hero objects never touch the character or the copy.
 *
 * PAINTED PIXELS, not boxes. A character plate is a cutout whose box is mostly
 * transparent, so a box test reports everything as overlapping. The plate is
 * drawn into a canvas and its alpha is read under each object's own drawing,
 * grown by MARGIN on every side — enough for the drift (objects ±7px, the plate
 * ±4px) plus a gap a reader can see.
 *
 * Checked on every page with a plate, from xl up (below it the objects are not
 * rendered — that is asserted too, because that rule is what keeps them off the
 * copy at tablet width): Engineering's scattered objects, and Description's
 * docked DPD + 5-FU pair, including its labels.
 *
 * Found, when first run: Engineering's small enzyme sat on the character's hand
 * and the test device at 1280 (2651 px within 14px) and 1366 (970 px) — he holds
 * the device out in front of him, so he reaches further left than `lead` says.
 *
 * Usage: node scripts/verify-hero-art.mjs [origin=http://localhost:8080]
 */
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:8080";
const MARGIN = 14;
/** Pages whose hero carries a character plate. */
const PAGES = ["/description", "/engineering"];

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
        ...hero.querySelectorAll("[data-dock]"),
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
      const dock = hero.querySelector("[data-dock]");
      if (dock) {
        dock.querySelectorAll("svg").forEach((s, i) =>
          targets.push({
            name: i === 0 ? "dock: DPD" : "dock: 5-FU",
            box: s.getBoundingClientRect(),
          }),
        );
        dock
          .querySelectorAll("[data-dock-label]")
          .forEach((l) =>
            targets.push({ name: `dock label "${l.textContent}"`, box: l.getBoundingClientRect() }),
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

await browser.close();
console.log(fails ? `\n${fails} FAILED\n` : "\nHERO ART VERIFIED\n");
process.exit(fails ? 1 : 0);
