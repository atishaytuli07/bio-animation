/**
 * The checks that caught things looking never did.
 *
 * These began as one-off scripts in a temp directory, which meant every fresh
 * session either rebuilt them or skipped them. They are here so they survive,
 * and so a claim like "contrast passes" can be reproduced rather than trusted.
 *
 *   node scripts/audit.mjs                 every check, every page
 *   node scripts/audit.mjs sweep           responsive: overflow, clipping, console
 *   node scripts/audit.mjs contrast        painted-pixel contrast
 *   node scripts/audit.mjs controls        buttons and links that do nothing
 *   node scripts/audit.mjs collisions      overlapping text on the story page
 *   node scripts/audit.mjs system          type and colour inventory
 *   node scripts/audit.mjs copy            generated-writing patterns
 *
 * Needs the dev server: `bun run dev` first. Override with --url=…
 *
 * WHY CONTRAST IS MEASURED ON PIXELS. The obvious method — read `color` and
 * walk up for `backgroundColor` — reports 1.00:1 when the background is a
 * linear-gradient, because `backgroundColor` is transparent all the way up. It
 * passed a hero nobody could read. These checks screenshot the element's box
 * and compare its darkest and lightest pixels instead.
 */
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { PNG } from "pngjs";

const arg = (k, d) => {
  const f = process.argv.find((a) => a.startsWith(`--${k}=`));
  return f ? f.slice(k.length + 3) : d;
};
const BASE = arg("url", "http://localhost:8080");
const only = process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2] : null;

/**
 * Every route, and it has to stay that way.
 *
 * This was a hand-written list of four while the site map already knew about
 * seven, so three routes could have shipped without a single sweep, contrast
 * reading or dead-control check run against them. A page that no harness looks
 * at is a page nobody has checked.
 *
 * Read from the site map rather than repeated here, so adding a route to the
 * wiki adds it to the audit in the same edit. That is the same rule the nav,
 * the footer and the static exporter already follow — and the two times it was
 * broken before, it was broken by a second list drifting from the first.
 */
const PAGES = (() => {
  /*
    AND IT IS READ, NOT IMPORTED, AND IT THROWS RATHER THAN FALLING BACK.

    The first attempt at this was a dynamic `import()` of the .ts module with a
    `.catch(() => null)` and the old array behind a `??`. Node cannot parse
    TypeScript, so the import threw on every run, the catch swallowed it, and
    the audit quietly went on auditing exactly the four pages it always had —
    while printing nothing to say so. A fallback that hides its own failure is
    worse than no fallback: the check reported "all passed" for a set of pages
    it had never loaded.

    So it parses the source text, and if it finds nothing it stops. An audit
    that cannot determine what to audit has no business exiting zero.
  */
  const src = readFileSync(new URL("../src/components/story/site-map.ts", import.meta.url), "utf8");
  const routes = [...src.matchAll(/to:\s*"([^"]+)"[^}]*ready:\s*true/g)].map((m) => m[1]);
  if (!routes.length) {
    console.error("audit: could not read any ready routes from site-map.ts");
    process.exit(2);
  }
  return routes;
})();
const WIDTHS = [
  [390, 844, "iphone"],
  [768, 1024, "tablet"],
  [1440, 900, "desktop"],
  [1920, 1080, "wide"],
];

const lum = (c) => {
  const [r, g, b] = c.map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

/** Effective opacity, walking up the tree. Inline opacity does not inherit in getComputedStyle. */
const EFF = `(e)=>{let o=1,n=e;while(n&&n!==document.documentElement){const s=getComputedStyle(n);if(s.visibility==="hidden"||s.display==="none")return 0;o*=+s.opacity;n=n.parentElement;}return o;}`;

let failures = 0;
const say = (ok, msg) => {
  if (!ok) failures++;
  console.log(`  ${ok ? "ok  " : "FAIL"}  ${msg}`);
};

/* ---------------------------------------------------------------- sweep */
async function sweep(browser) {
  console.log("\n── responsive ────────────────────────────────────");
  for (const [w, h, tag] of WIDTHS) {
    const pg = await browser.newPage({ viewport: { width: w, height: h } });
    const errs = [];
    pg.on("pageerror", (e) => errs.push(e.message.slice(0, 80)));
    pg.on("console", (m) => m.type() === "error" && errs.push(m.text().slice(0, 80)));
    for (const p of PAGES) {
      await pg.goto(BASE + p, { waitUntil: "networkidle" });
      await pg.waitForTimeout(1400);
      const r = await pg.evaluate((es) => {
        const eff = eval(es);
        const clipped = [...document.querySelectorAll("h1,h2,p,span,button,a")]
          .filter((e) => {
            const b = e.getBoundingClientRect();
            return (
              e.children.length === 0 &&
              (e.textContent || "").trim() &&
              eff(e) > 0.5 &&
              b.width > 10 &&
              (b.right > innerWidth + 2 || b.left < -2)
            );
          })
          .map((e) => (e.textContent || "").trim().slice(0, 24));
        return { ovX: document.documentElement.scrollWidth > innerWidth + 1, clipped };
      }, EFF);
      say(
        !r.ovX && !r.clipped.length,
        `${tag.padEnd(8)} ${p.padEnd(15)} ${r.ovX ? "overflows-x " : ""}${r.clipped.length ? "clipped: " + r.clipped.join(", ") : ""}`,
      );
    }
    say(
      !errs.length,
      `${tag.padEnd(8)} console        ${errs.length ? [...new Set(errs)].slice(0, 2).join(" | ") : ""}`,
    );
    await pg.close();
  }
}

/* ------------------------------------------------------------- contrast */
async function contrast(browser) {
  console.log("\n── contrast (painted pixels) ─────────────────────");
  const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  for (const p of PAGES) {
    await pg.goto(BASE + p, { waitUntil: "networkidle" });
    await pg.waitForTimeout(1600);
    // A fraction of the STORY. See the note in measure-labels.mjs — the page
    // no longer ends at the last scene, so `scrollHeight` would move every
    // sampled position relative to what it was calibrated against.
    const H = await pg.evaluate(() => {
      const e = document.getElementById("story-end");
      return (e ? e.offsetTop : document.documentElement.scrollHeight) - innerHeight;
    });
    const stops = p === "/new" ? [0.05, 0.24, 0.36, 0.56, 0.86] : [0];
    for (const f of stops) {
      await pg.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), Math.round(H * f));
      await pg.waitForTimeout(1200);
      const boxes = await pg.evaluate((es) => {
        const eff = eval(es);
        return [...document.querySelectorAll("h1,h2,p,a,button")]
          .filter((e) => {
            const b = e.getBoundingClientRect();
            return (
              e.children.length === 0 &&
              (e.textContent || "").trim() &&
              eff(e) > 0.75 &&
              b.top > 0 &&
              b.bottom < innerHeight &&
              b.width > 24 &&
              b.height > 8
            );
          })
          .slice(0, 8)
          .map((e) => {
            const b = e.getBoundingClientRect();
            return {
              t: (e.textContent || "").trim().slice(0, 26),
              fs: Math.round(parseFloat(getComputedStyle(e).fontSize)),
              x: Math.round(b.x),
              y: Math.round(b.y),
              w: Math.min(Math.round(b.width), 620),
              h: Math.round(b.height),
            };
          });
      }, EFF);
      for (const t of boxes) {
        const img = PNG.sync.read(
          await pg.screenshot({ clip: { x: t.x, y: t.y, width: t.w, height: t.h } }),
        );
        let dark = [255, 255, 255];
        let light = [0, 0, 0];
        for (let i = 0; i < img.data.length; i += 4) {
          const q = [img.data[i], img.data[i + 1], img.data[i + 2]];
          if (lum(q) < lum(dark)) dark = q;
          if (lum(q) > lum(light)) light = q;
        }
        const c = ratio(dark, light);
        // WCAG AA: 3:1 for >=24px (or >=18.66px bold), 4.5:1 otherwise.
        const need = t.fs >= 24 ? 3 : 4.5;
        if (c < need)
          say(false, `${p} @${f}  ${c.toFixed(2)}:1 (needs ${need})  ${t.fs}px  ${t.t}`);
      }
    }
  }
  say(true, "every visible string measured; only failures are listed above");
  await pg.close();
}

/* ------------------------------------------------------------- controls */
async function controls(browser) {
  console.log("\n── controls that do nothing ──────────────────────");
  const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  for (const p of PAGES) {
    await pg.goto(BASE + p, { waitUntil: "networkidle" });
    await pg.waitForTimeout(1600);
    // A fraction of the STORY. See the note in measure-labels.mjs — the page
    // no longer ends at the last scene, so `scrollHeight` would move every
    // sampled position relative to what it was calibrated against.
    const H = await pg.evaluate(() => {
      const e = document.getElementById("story-end");
      return (e ? e.offsetTop : document.documentElement.scrollHeight) - innerHeight;
    });
    const dead = new Set();
    for (let i = 0; i <= 20; i++) {
      await pg.evaluate(
        (y) => window.scrollTo({ top: y, behavior: "instant" }),
        Math.round((H * i) / 20),
      );
      await pg.waitForTimeout(120);
      for (const d of await pg.evaluate((es) => {
        const eff = eval(es);
        return (
          [...document.querySelectorAll("button,a")]
            .filter((e) => {
              const b = e.getBoundingClientRect();
              return eff(e) > 0.3 && b.width > 10 && b.bottom > 0 && b.top < innerHeight;
            })
            /*
            `tagName` is UPPERCASE for HTML elements and case-preserved for SVG
            ones, so an SVG <a> reports "a" and this read it as a button with no
            handler. It flagged the four working links in the engineering cycle
            diagram as dead controls. Compare case-insensitively.
          */
            .filter((e) =>
              e.tagName.toUpperCase() === "A"
                ? !e.getAttribute("href")
                : !Object.keys(e).some(
                    (k) =>
                      k.startsWith("__react") &&
                      /onClick|onPointerDown/.test(
                        JSON.stringify(Object.keys(e[k]?.memoizedProps || {})),
                      ),
                  ),
            )
            .map(
              (e) =>
                (e.textContent || "").trim().slice(0, 24) ||
                e.getAttribute("aria-label") ||
                "(icon)",
            )
        );
      }, EFF))
        dead.add(d);
    }
    say(dead.size === 0, `${p.padEnd(15)} ${dead.size ? [...dead].join(", ") : "all wired"}`);
  }
  await pg.close();
}

/* ----------------------------------------------------------- collisions */
async function collisions(browser) {
  console.log("\n── overlapping text (story page) ─────────────────");
  const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await pg.goto(BASE + "/new", { waitUntil: "networkidle" });
  await pg.waitForTimeout(2400);
  // A fraction of the STORY. See the note in measure-labels.mjs — the page
  // no longer ends at the last scene, so `scrollHeight` would move every
  // sampled position relative to what it was calibrated against.
  const H = await pg.evaluate(() => {
    const e = document.getElementById("story-end");
    return (e ? e.offsetTop : document.documentElement.scrollHeight) - innerHeight;
  });
  const hits = new Set();
  for (let i = 0; i <= 60; i++) {
    await pg.evaluate(
      (y) => window.scrollTo({ top: y, behavior: "instant" }),
      Math.round((H * i) / 60),
    );
    await pg.waitForTimeout(110);
    for (const h of await pg.evaluate((es) => {
      const eff = eval(es);
      const items = [...document.querySelectorAll("h1,h2,p,span,button,a")]
        .filter((e) => {
          const b = e.getBoundingClientRect();
          return (
            e.children.length === 0 &&
            (e.textContent || "").trim() &&
            eff(e) > 0.45 &&
            b.bottom > 0 &&
            b.top < innerHeight &&
            b.width > 14 &&
            b.height > 6
          );
        })
        .map((e) => ({
          t: (e.textContent || "").trim().slice(0, 22),
          b: e.getBoundingClientRect(),
        }));
      const out = [];
      for (let a = 0; a < items.length; a++)
        for (let c = a + 1; c < items.length; c++) {
          const A = items[a].b;
          const B = items[c].b;
          if (
            Math.min(A.right, B.right) - Math.max(A.left, B.left) > 6 &&
            Math.min(A.bottom, B.bottom) - Math.max(A.top, B.top) > 6
          )
            out.push(`${items[a].t} / ${items[c].t}`);
        }
      return out;
    }, EFF))
      hits.add(h);
  }
  say(
    hits.size === 0,
    hits.size ? [...hits].slice(0, 5).join("  ·  ") : "none across 60 scroll positions",
  );
  await pg.close();
}

/* -------------------------------------------------------------- system */
async function system(browser) {
  console.log("\n── type and colour inventory ─────────────────────");
  const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const specs = new Map();
  const colours = new Map();
  for (const p of PAGES) {
    await pg.goto(BASE + p, { waitUntil: "networkidle" });
    await pg.waitForTimeout(1600);
    // A fraction of the STORY. See the note in measure-labels.mjs — the page
    // no longer ends at the last scene, so `scrollHeight` would move every
    // sampled position relative to what it was calibrated against.
    const H = await pg.evaluate(() => {
      const e = document.getElementById("story-end");
      return (e ? e.offsetTop : document.documentElement.scrollHeight) - innerHeight;
    });
    for (let i = 0; i <= 30; i++) {
      await pg.evaluate(
        (y) => window.scrollTo({ top: y, behavior: "instant" }),
        Math.round((H * i) / 30),
      );
      await pg.waitForTimeout(90);
      const r = await pg.evaluate((es) => {
        const eff = eval(es);
        return [...document.querySelectorAll("h1,h2,p,span,button,a,li")]
          .filter((e) => {
            const b = e.getBoundingClientRect();
            return (
              e.children.length === 0 &&
              (e.textContent || "").trim() &&
              eff(e) > 0.55 &&
              b.bottom > 0 &&
              b.top < innerHeight &&
              b.width > 14
            );
          })
          .map((e) => {
            const s = getComputedStyle(e);
            return {
              k: `${Math.round(parseFloat(s.fontSize))}px/${s.fontWeight}/${s.letterSpacing}${s.textTransform === "uppercase" ? "/upper" : ""}`,
              c: s.color,
            };
          });
      }, EFF);
      for (const x of r) {
        specs.set(x.k, (specs.get(x.k) || 0) + 1);
        colours.set(x.c, (colours.get(x.c) || 0) + 1);
      }
    }
  }
  console.log("  type specs in use:");
  for (const [k, v] of [...specs].sort((a, b) => b[1] - a[1]))
    console.log(`    ${String(v).padStart(4)}  ${k}`);
  console.log("  text colours in use:");
  for (const [k, v] of [...colours].sort((a, b) => b[1] - a[1]))
    console.log(`    ${String(v).padStart(4)}  ${k}`);
  console.log(
    "  → two specs that differ only slightly for the same job are drift. Name them in palette.ts.",
  );
  await pg.close();
}

/* ---------------------------------------------------------------- copy */
const BANNED =
  /\b(seamless(ly)?|leverage|empower(ing)?|unlock|dive in(to)?|delve|robust|cutting[- ]edge|state[- ]of[- ]the[- ]art|game[- ]chang\w+|revolutioni[sz]\w+|harness(ing)?|elevate|transformative|holistic|synerg\w+|pivotal|realm|landscape|tapestry|testament|underscore)\b/gi;

async function copy(browser) {
  console.log("\n── generated-writing patterns ────────────────────");
  const pg = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const strings = new Set();
  for (const p of PAGES) {
    await pg.goto(BASE + p, { waitUntil: "networkidle" });
    await pg.waitForTimeout(1800);
    for (const t of await pg.evaluate(() =>
      [...document.querySelectorAll("h1,h2,h3,p,li,figcaption,button,a,span")]
        .filter((e) => e.children.length === 0)
        .map((e) => (e.textContent || "").trim())
        .filter((t) => t.length > 3),
    ))
      strings.add(t);
  }
  const sentences = [...strings]
    .flatMap((t) => t.split(/(?<=[.?!])\s+/))
    .map((s) => s.trim())
    .filter((s) => s.length > 12);

  const banned = sentences.filter((s) => BANNED.test(s));
  BANNED.lastIndex = 0;
  say(
    !banned.length,
    `banned vocabulary: ${
      banned.length
        ? banned
            .slice(0, 3)
            .map((s) => s.slice(0, 44))
            .join(" | ")
        : "none"
    }`,
  );

  const notJust = sentences.filter((s) =>
    /\bnot (just|only|merely|simply)\b[^.?!]{0,60}\b(but|it['’]s)\b/i.test(s),
  );
  say(!notJust.length, `"not just X but Y": ${notJust.length || "none"}`);

  const dashed = sentences.filter((s) => (s.match(/—/g) || []).length > 0).length;
  const pct = Math.round((dashed / sentences.length) * 100);
  say(pct <= 20, `em-dashes in ${pct}% of sentences (over 20% reads as generated)`);

  const lens = sentences.map((s) => s.split(/\s+/).length).sort((a, b) => a - b);
  const spread = lens[lens.length - 1] - lens[0];
  say(
    spread > 15,
    `sentence length ${lens[0]}–${lens[lens.length - 1]} words, median ${lens[Math.floor(lens.length / 2)]} (uniform length reads as generated)`,
  );

  const open = new Map();
  for (const s of sentences) {
    const w = s
      .split(/\s+/)[0]
      .replace(/[^A-Za-z]/g, "")
      .toLowerCase();
    if (w.length > 1) open.set(w, (open.get(w) || 0) + 1);
  }
  const top = [...open].sort((a, b) => b[1] - a[1]).slice(0, 3);
  console.log(`  note  most repeated openers: ${top.map(([w, c]) => `"${w}" ×${c}`).join(", ")}`);
  console.log(
    "  → a repeated opener is fine for a UI label appearing many times, and a tic in prose.",
  );
  await pg.close();
}

/* ---------------------------------------------------------------- main */
const TASKS = { sweep, contrast, controls, collisions, system, copy };

// A stack trace from page.goto is a poor way to learn the server is not up.
try {
  await fetch(BASE);
} catch {
  console.error("");
  console.error(`Cannot reach ${BASE}.`);
  console.error("");
  console.error("  Start the dev server first:   bun run dev");
  console.error("  Or point at another origin:   node scripts/audit.mjs --url=<origin>");
  console.error("");
  process.exit(1);
}

const browser = await chromium.launch();
try {
  for (const [name, fn] of Object.entries(TASKS)) if (!only || only === name) await fn(browser);
} finally {
  await browser.close();
}

console.log(failures ? `\n${failures} check(s) failed.\n` : "\nAll checks passed.\n");
process.exit(failures ? 1 : 0);
