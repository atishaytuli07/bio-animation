/**
 * The client's science review, checked against the RENDERED site.
 *
 * Adina's review of the Description page (September 2026) replaced specific
 * sentences and ruled out specific framings: a variant CAN do something, it
 * does not always; the test INFORMS a dose under clinical guidelines, it never
 * sets one. This checks both halves against what a reader receives — including
 * text drawn inside figures, CSS-capitalised labels and the <title> — not the
 * source, because the source can be right while a component renders something
 * else.
 *
 *   1. Every sentence she supplied is on the Description page.
 *   2. Every citation mark points at a listed source and lands below the header.
 *   3. No phrase she corrected survives on ANY page.
 *
 * THE STORY IS READ ACROSS ITS WHOLE LENGTH. It mounts some text only when its
 * scene is reached, so a single read of the document at the top misses it. The
 * first version of this check did exactly that and passed /new without ever
 * having seen the scene-one caption.
 *
 * Usage: node scripts/verify-wording.mjs [origin=http://localhost:8080]
 */
import { readFileSync } from "node:fs";
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:8080";

/** Her sentences, with the deliberate adjustments recorded in CONTEXT.md. */
const REQUIRED = [
  "Two patients can receive the same fluoropyrimidine treatment at the same dose, yet experience very different toxicity because of differences in drug metabolism.",
  "A large proportion of 5-FU is normally broken down by the enzyme dihydropyrimidine dehydrogenase (DPD), which helps control systemic drug exposure.",
  "DPD is encoded by the DPYD gene.",
  "Some DPYD variants disrupt normal gene processing and reduce functional DPD activity.",
  "The conserved GT sequence marks the 5′ splice donor site used during pre-mRNA processing.",
  "Without pre-treatment DPYD testing, reduced DPD activity may not be known before fluoropyrimidine therapy begins.",
  "When G changes to A, the splice site may no longer be recognised correctly.",
  "Abnormal splicing can reduce the amount of functional DPD produced.",
  "5-FU exposure increases",
  "This pathway illustrates the expected biological consequence associated with reduced DPD activity. Individual clinical effects can vary.",
  "If a clinically relevant DPYD variant is identified before treatment, the result can inform dose adjustment according to established clinical guidelines.",
  "Conceptual illustration, not a quantitative pharmacokinetic model.",
];

/**
 * Framings that were corrected once and must not come back, anywhere.
 * Lower-case substrings of rendered text.
 */
const BANNED = [
  "not used to treat the tumour", // replaced by "a large proportion … broken down"
  "built from instructions", // "encoded by"
  "builds the enzyme", // same framing, on the story
  "tell the cell where to cut", // the splice donor wording
  "cut is made in the wrong place",
  "drug builds up", // "5-FU exposure increases"
  "only the amount", // removed outright
  "matched dose", // the test informs a dose, it does not set one
  "matched to the result",
  "matched to it",
  "dose that fits",
  "decides your dose",
  "change your dose",
  "cannot clear it", // "may not"
  "test that prevents",
  "changes a chemotherapy dose is",
];

const routes = (() => {
  const src = readFileSync(new URL("../src/components/story/site-map.ts", import.meta.url), "utf8");
  const r = [...src.matchAll(/to:\s*"([^"]+)"\s*,\s*ready:\s*true/g)].map((m) => m[1]);
  if (r.length < 5) {
    console.error("could not read routes from site-map.ts");
    process.exit(2);
  }
  return r;
})();

let fails = 0;
const say = (ok, what, detail = "") => {
  if (!ok) fails++;
  console.log(`  ${ok ? "ok  " : "FAIL"}  ${what}${detail ? `\n        ${detail}` : ""}`);
};
const norm = (s) => s.replace(/\s+/g, " ").replace(/’/g, "'").trim();

const browser = await chromium.launch();

console.log("\n── 1 · her sentences are on the Description page");
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(BASE + "/description", { waitUntil: "networkidle" });
// walk the page so every once-only figure reveal has fired
const h = await page.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y <= h; y += 400) {
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await page.waitForTimeout(40);
}
await page.waitForTimeout(1000);
/*
  innerText, lower-cased: labels are capitalised by CSS and innerText returns
  them that way. Citation numbers sit straight after punctuation in innerText
  ("activity.4 Individual") and are stripped so a sentence still matches whole.
*/
const text = norm(await page.evaluate(() => document.body.innerText))
  .replace(/([.,)])\d+(?=\s|$)/g, "$1")
  .toLowerCase();
for (const s of REQUIRED) {
  const ok = text.includes(norm(s).toLowerCase());
  say(ok, s.length > 70 ? s.slice(0, 67) + "…" : s, ok ? "" : "missing from the rendered page");
}

console.log("\n── 2 · citations point at listed sources and land below the header");
const marks = await page.$$eval("sup a[href^='#ref-']", (as) =>
  as.map((a) => a.getAttribute("href")),
);
const listed = await page.$$eval("li[id^='ref-']", (ls) => ls.map((l) => "#" + l.id));
const dangling = marks.filter((m) => !listed.includes(m));
say(
  marks.length > 0 && dangling.length === 0,
  `${marks.length} marks → ${listed.length} sources, none dangling`,
  dangling.join(" "),
);
const unused = listed.filter((l) => !marks.includes(l));
say(unused.length === 0, "every listed source is cited somewhere", unused.join(" "));
for (const href of [...new Set(marks)]) {
  await page.click(`sup a[href='${href}']`);
  await page.waitForTimeout(600);
  const r = await page.evaluate((id) => {
    const b = document.querySelector(id).getBoundingClientRect();
    const hd = document.querySelector("header").getBoundingClientRect();
    return { top: Math.round(b.top), header: Math.round(hd.bottom), vh: innerHeight };
  }, href);
  say(
    r.top >= r.header && r.top < r.vh,
    `${href} lands below the header`,
    `top ${r.top}px, header ends ${r.header}px`,
  );
}
await page.close();

console.log("\n── 3 · no corrected phrase survives, on any page");
for (const route of routes) {
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(BASE + route, { waitUntil: "networkidle" });
  let seen = "";
  const H = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y <= H; y += 250) {
    await p.evaluate((y) => window.scrollTo(0, y), y);
    await p.waitForTimeout(route === "/new" ? 60 : 5);
    seen += " " + (await p.evaluate(() => document.documentElement.textContent));
  }
  seen = norm(seen + " " + (await p.title())).toLowerCase();
  const found = BANNED.filter((b) => seen.includes(b));
  say(found.length === 0, route, found.length ? `found: ${found.join(" | ")}` : "");
  await p.close();
}

await browser.close();
console.log(fails ? `\n${fails} FAILED\n` : "\nWORDING VERIFIED\n");
process.exit(fails ? 1 : 0);
