// Try it, checked against the client's October review of it: the words she asked for are on the page, the
// five steps can be completed in order, and nothing is too small or off the side at any width.
// Usage: node scripts/verify-playground.mjs [origin=http://localhost:8080] [screenshot dir]
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:8080";
const SHOTS = process.argv[3];

let fails = 0;
const say = (ok, what, detail = "") => {
  if (!ok) fails++;
  console.log(`  ${ok ? "ok  " : "FAIL"}  ${what}${detail ? `\n        ${detail}` : ""}`);
};

const browser = await chromium.launch();
const errors = [];

async function open(w, h) {
  const p = await browser.newPage({ viewport: { width: w, height: h } });
  p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  p.on("pageerror", (e) => errors.push(String(e)));
  await p.goto(`${BASE}/playground`, { waitUntil: "networkidle" });
  await p.waitForTimeout(500);
  return p;
}
const dose = (p, v) =>
  p.evaluate((v) => {
    const el = document.querySelector("#dose");
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(el, String(v));
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }, v);
const title = (p) => p.evaluate(() => document.querySelector("main h2")?.textContent ?? "");
const reach = async (p, want, ms = 60000) => {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    if ((await title(p)) === want) return true;
    await p.waitForTimeout(300);
  }
  return false;
};
const shot = (p, name, full = false) =>
  SHOTS ? p.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: full }) : null;

console.log("\n── the words the review asked for");
{
  const p = await open(1440, 900);
  const text = await p.evaluate(() => document.body.innerText.replace(/\s+/g, " "));
  const lower = text.toLowerCase();
  for (const s of [
    "Simulated DPD activity",
    "5/5",
    "Adjust the simulated enzyme activity to see how it affects drug exposure. This does not represent a treatment",
    "ChemoGuard does not change DPD activity",
    "Shared simulated dose",
    "The green band and red threshold are illustrative, not validated clinical thresholds.",
    "Relative drug exposure",
    "Time",
    "Real fluoropyrimidine pharmacokinetics involve additional processes.",
    "Choose a dose",
  ])
    say(lower.includes(s.toLowerCase()), `on the page: "${s}"`);
  for (const s of ["0 of 5", "the same for every patient", "rests in the green band", "drips in"])
    say(!lower.includes(s.toLowerCase()), `gone from the page: "${s}"`);
  say(!/—/.test(text), "no em dash in the page's text");
  say(
    (await p.locator("[role=group] svg").count()) > 0,
    "the patient has an illustrated figure above the gauge",
  );
  await shot(p, "play-1-start");
  await p.close();
}

console.log("\n── the five steps, in order");
{
  const p = await open(1440, 900);
  say((await title(p)) === "Choose a dose", "opens on step 1, Choose a dose");
  await dose(p, 30);
  say(await reach(p, "Compare patients"), "a dose in the green range completes step 1");
  await p.getByRole("button", { name: "Add a patient" }).last().click();
  say(await reach(p, "Find the difference"), "adding the 2/5 patient completes step 2");
  await shot(p, "play-3");
  await dose(p, 13);
  say(await reach(p, "Discover why"), "a dose that suits only the 2/5 patient completes step 3");
  await p.getByRole("button", { name: "Patient 2: lower simulated DPD activity" }).click();
  say(await reach(p, "Widen the group"), "lowering a patient's activity completes step 4");
  await p.getByRole("button", { name: "Add a patient" }).last().click();
  await p.getByRole("button", { name: "Add a patient" }).last().click();
  await dose(p, 22);
  say(
    await reach(p, "Same dose. Different drug exposure.", 90000),
    "four different patients complete step 5 and show the takeaway",
  );
  const text = await p.evaluate(() => document.body.innerText.replace(/\s+/g, " "));
  say(
    text.includes(
      "Patients with different DPD activity may require different starting-dose decisions. Pre-treatment DPYD testing can help inform those decisions.",
    ),
    "the takeaway is the reviewed sentence, word for word",
  );
  say(
    /With these four simulated patients/.test(text),
    "the group result names the simulated patients",
  );

  // the chart: one legend entry and one coloured line per patient, and a hovered patient's line comes forward
  const chart = await p.evaluate(() => {
    const fig = document.querySelector("figure");
    const paths = [...fig.querySelectorAll("svg[role=img] path")];
    return {
      legend: fig.querySelectorAll("figcaption button").length,
      colours: new Set(paths.map((x) => x.getAttribute("stroke"))).size,
      lines: paths.length,
      marks: [...fig.querySelectorAll("span")].filter((s) => /changed|added/.test(s.textContent))
        .length,
    };
  });
  say(
    chart.legend === 4 && chart.lines === 4 && chart.colours === 4,
    "the chart has a legend entry and its own colour for each of the four patients",
    JSON.stringify(chart),
  );
  say(chart.marks > 0, "the chart says what was changed where a curve bends");
  await p.hover("figure figcaption button >> nth=1");
  const widths = await p.evaluate(() =>
    [...document.querySelectorAll("figure svg[role=img] path")].map((x) =>
      Number(x.getAttribute("stroke-width")),
    ),
  );
  say(
    widths[1] > widths[0] && widths[1] > widths[2],
    "pointing at a patient brings that patient's line forward",
    widths.join(", "),
  );
  await shot(p, "play-6-done");
  await p.close();
}

console.log("\n── every width");
for (const [w, h] of [
  [390, 844],
  [768, 1024],
  [1024, 768],
  [1280, 720],
  [1440, 900],
  [1920, 1080],
]) {
  const p = await open(w, h);
  await dose(p, 30);
  for (let i = 0; i < 3; i++) await p.getByRole("button", { name: "Add a patient" }).last().click();
  await p.waitForTimeout(4000);
  const r = await p.evaluate(() => {
    const visible = (e) => {
      const b = e.getBoundingClientRect();
      return b.width > 0 && b.height > 0 && getComputedStyle(e).visibility !== "hidden";
    };
    const own = (e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    const texts = [...document.querySelectorAll("main *, footer *")].filter(
      (e) => own(e) && visible(e) && !e.closest(".sr-only"),
    );
    const groups = [...document.querySelectorAll("[role=group]")];
    return {
      small: texts.filter((e) => parseFloat(getComputedStyle(e).fontSize) < 12).length,
      sideways: document.documentElement.scrollWidth > innerWidth,
      clipped: texts.filter((e) => e.scrollWidth > e.clientWidth + 1 && e.clientWidth > 0).length,
      narrowest: Math.round(Math.min(...groups.map((g) => g.getBoundingClientRect().width))),
      gauge: Math.round(
        Math.min(
          ...groups.map((g) => g.querySelector("div[aria-hidden]").getBoundingClientRect().height),
        ),
      ),
    };
  });
  say(
    r.small === 0 && !r.sideways && r.clipped === 0 && r.narrowest >= 70 && r.gauge >= 120,
    `${w}x${h}: four patients fit, nothing under 12px, nothing clipped`,
    JSON.stringify(r),
  );
  await shot(p, `play-${w}`, w < 1024);
  await p.close();
}

say(errors.length === 0, "no console errors", errors.slice(0, 3).join(" | "));
await browser.close();
console.log(fails ? `\n${fails} FAILED` : "\nTRY IT VERIFIED");
process.exit(fails ? 1 : 0);
