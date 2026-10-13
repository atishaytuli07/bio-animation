// The client's science review, checked against the rendered site.
// Adina's review of the Description page (September 2026) replaced specific sentences and ruled out specific
// framings: a variant can do something, it does not always; the test informs a dose under clinical guidelines, it
// never sets one. This checks both halves against what a reader receives — including text drawn inside figures,
// CSS-capitalised labels and the <title> — not the source, because the source can be right while a component renders
// something else.
//   1. Every sentence she supplied is on the Description page.
//   2. Every citation mark points at a listed source and lands below the header.
//   3. No phrase she corrected survives on ANY page, her October sentences are on the story, and no page shows an
//      em dash.
// The story is read across its whole length. It mounts some text only when its scene is reached, so a single read of
// the document at the top misses it. The first version of this check did exactly that and passed the story without ever
// having seen the scene-one caption.
// Usage: node scripts/verify-wording.mjs [origin=http://localhost:8080]
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

// Framings that were corrected once and must not come back, anywhere. Lower-case substrings of rendered text.
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
  // Her October 2026 review of the story. Each of these was replaced by a sentence in STORY_REQUIRED below, or
  // by a label that says what the picture shows instead of what happens to a patient.
  "so the drug stays", // "So 5-FU exposure can increase."
  "safer starting dose", // "A more informed starting dose."
  "one gene affects how fast", // the hero's sentence
  "these two letters mark", // "The conserved GT sequence marks the 5′ splice donor site."
  "standard dose too much", // "…can increase the risk of severe fluoropyrimidine toxicity."
  "less is made here", // the DPD label that pointed at the bloodstream
  "dose reduced per guidelines", // the result informs an adjustment, it does not make one
  "that is the whole idea", // the closing section's old heading
];

// Pages set from the team's own documents, word for word. A phrase listed here is theirs on that page and is
// left as they wrote it; it stays banned everywhere else. "drug builds up" on Education is still worth raising
// with them, since their own science review replaced it on the story.
const TEAM_TEXT = {
  "/education": ["drug builds up", "that is the whole idea"],
};

/** Her October 2026 sentences for the story, as they must read on the homepage. Lower case, since some are set in capitals by CSS. */
const STORY_REQUIRED = [
  "a variation in the dpyd gene can affect how the body processes fluoropyrimidine chemotherapy, and why the same starting dose may carry very different risks.",
  "the conserved gt sequence marks the 5′ splice donor site.",
  "among billions of dna letters, a single change can increase the risk of severe fluoropyrimidine toxicity.",
  "so 5-fu exposure can increase.",
  "a more informed starting dose.",
  "illustrative simulation, not a clinical prediction.",
  "explore the science behind chemoguard, the engineering decisions that shaped our approach, and the people and research that brought the project to life.",
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
// innerText, lower-cased: labels are capitalised by CSS and innerText returns them that way. Citation numbers sit
// straight after punctuation in innerText ("activity.4 Individual") and are stripped so a sentence still matches
// whole.
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
    await p.waitForTimeout(route === "/" ? 60 : 5);
    seen += " " + (await p.evaluate(() => document.documentElement.textContent));
  }
  seen = norm(seen + " " + (await p.title())).toLowerCase();
  const theirs = TEAM_TEXT[route] ?? [];
  const found = BANNED.filter((b) => seen.includes(b) && !theirs.includes(b));
  say(found.length === 0, route, found.length ? `found: ${found.join(" | ")}` : "");
  if (route === "/") {
    const missing = STORY_REQUIRED.filter((r) => !seen.includes(r));
    say(missing.length === 0, "the story carries her October sentences", missing.join(" | "));
  }
  // The site owner's rule: no em dash in anything a reader sees. Read from what is rendered (innerText), not
  // textContent, which also holds the page's inline styles and scripts and their comments.
  const visible =
    (await p.evaluate(() => document.body.innerText)) +
    " " +
    (await p.title()) +
    " " +
    (await p.evaluate(() => document.querySelector("meta[name=description]")?.content ?? ""));
  const dashes = visible.split("\n").filter((l) => l.includes("\u2014"));
  say(dashes.length === 0, `${route} has no em dash`, dashes.slice(0, 3).join(" | "));
  // A tab title is a page's name and then the site's. Removing the dashes from them once left every page titled
  // with the site's name alone, and nothing here noticed.
  const title = await p.title();
  say(
    /^[A-Za-z][^·]* · ChemoGuard$/.test(title) || title.startsWith("ChemoGuard: "),
    `${route} has a tab title that names the page`,
    title,
  );
  await p.close();
}

await browser.close();
console.log(fails ? `\n${fails} FAILED\n` : "\nWORDING VERIFIED\n");
process.exit(fails ? 1 : 0);
