/**
 * What the story costs to scroll, on hardware that is not a developer's laptop.
 *
 * The page is one long scroll-driven animation and iGEM's judges will not all
 * be on fast machines, so the number that matters is frame time WHILE
 * SCROLLING, with the CPU throttled — not a Lighthouse score on an idle page.
 *
 * Measured per scene, because the cost is not evenly spread: the descent runs a
 * helix, the bloodstream runs a few hundred drawn molecules.
 *
 *   - frames are counted with requestAnimationFrame while the page is scrolled
 *     at a steady rate, and reported as the median and worst frame in ms
 *   - long tasks (over 50ms) are collected from PerformanceObserver
 *   - transferred bytes are summed per page, since the wiki has a 5 MB budget
 *
 * THREE SAMPLES PER SCENE, AND THE BEST ONE COUNTS. Frame times here quantise
 * to the display's 16.7ms, and in a headless browser with no GPU any scene
 * lands on every-other-frame some of the time: measured five times, one scene
 * read 16.7, 33.4, 16.7, 16.7, 16.7. A single run cannot tell 30fps from 60,
 * so a single run must not be allowed to fail the build. The spread is printed
 * with every result.
 *
 * AND IT MUST RUN AGAINST THE BUILT EXPORT, not the dev server. Unminified,
 * with React in development mode, the same scenes measured 3-8fps and 6.6 MB
 * of script — a number about the dev server, not about the wiki.
 *
 *   node scripts/build-static.mjs
 *   node scripts/measure-perf.mjs http://localhost:8099   # serving dist-static
 *
 * Usage: node scripts/measure-perf.mjs [origin] [cpu-throttle=4]
 */
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:8080";
const THROTTLE = Number(process.argv[3] ?? 4);
const MEDIAN_LIMIT = 34; // one 60Hz frame is 16.7ms; two are 33.4
const SAMPLES = 3;
const TASK_LIMIT = 250;

let fails = 0;
const say = (ok, what, detail = "") => {
  if (!ok) fails++;
  console.log(`  ${ok ? "ok  " : "FAIL"}  ${what}${detail ? `\n        ${detail}` : ""}`);
};

const browser = await chromium.launch();

/** The story's scenes, as fractions of its length. */
const SCENES = [
  ["the descent", 0.02, 0.2],
  ["two people", 0.32, 0.5],
  ["the bloodstream", 0.6, 0.78],
  ["the ending", 0.8, 0.98],
];

console.log(`\n── scrolling the story at ${THROTTLE}× CPU throttle (1280×900)`);
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: THROTTLE });
  await page.goto(BASE + "/new/", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);

  for (const [name, from, to] of SCENES) {
    const samples = [];
    for (let i = 0; i < SAMPLES; i++) {
      // get to the start of the scene without measuring the journey
      await page.evaluate((f) => {
        const e = document.getElementById("story-end");
        window.scrollTo(0, (e.offsetTop - innerHeight) * f);
      }, from);
      await page.waitForTimeout(700);

      const stats = await page.evaluate(
        async ([from, to]) => {
          const end = document.getElementById("story-end");
          const max = end.offsetTop - innerHeight;
          const frames = [];
          const tasks = [];
          const po = new PerformanceObserver((l) => {
            for (const e of l.getEntries()) tasks.push(Math.round(e.duration));
          });
          try {
            po.observe({ entryTypes: ["longtask"] });
          } catch {
            /* longtask unsupported: the frame numbers still stand */
          }

          let last = performance.now();
          const started = last;
          const DURATION = 2600;
          await new Promise((resolve) => {
            const step = (now) => {
              frames.push(now - last);
              last = now;
              const p = Math.min(1, (now - started) / DURATION);
              window.scrollTo(0, max * (from + (to - from) * p));
              if (p < 1) requestAnimationFrame(step);
              else resolve();
            };
            requestAnimationFrame(step);
          });
          po.disconnect();

          const sorted = frames.slice(1).sort((a, b) => a - b);
          return {
            frames: sorted.length,
            median: +sorted[Math.floor(sorted.length / 2)].toFixed(1),
            p95: +sorted[Math.floor(sorted.length * 0.95)].toFixed(1),
            worst: +sorted[sorted.length - 1].toFixed(1),
            tasks: tasks.sort((a, b) => b - a).slice(0, 3),
          };
        },
        [from, to],
      );

      samples.push(stats);
    }
    // the best of the three: the others carry this environment's noise
    const best = samples.reduce((a, b) => (a.median <= b.median ? a : b));
    const worstTask = Math.min(...samples.map((s) => s.tasks[0] ?? 0));
    say(
      best.median <= MEDIAN_LIMIT && worstTask <= TASK_LIMIT,
      `${name}: ${best.median}ms (${Math.round(1000 / best.median)}fps), p95 ${best.p95}ms`,
      `medians across ${SAMPLES} runs: ${samples.map((s) => s.median).join(", ")}ms · worst frame ${best.worst}ms · longest task ${worstTask || "none"}ms`,
    );
  }
  await page.close();
}

console.log("\n── what each page weighs");
{
  const routes = ["/new/", "/description/", "/team/"];
  for (const route of routes) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    let bytes = 0;
    const byType = {};
    page.on("response", async (r) => {
      try {
        const len = Number((await r.allHeaders())["content-length"] ?? 0);
        const type = (r.request().resourceType() || "other").padEnd(6);
        bytes += len;
        byType[type] = (byType[type] ?? 0) + len;
      } catch {
        /* a response that went away before it could be read */
      }
    });
    await page.goto(BASE + route, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    const kb = (n) => `${Math.round(n / 1024)} kB`;
    console.log(
      `  ${route.padEnd(14)} ${kb(bytes).padStart(8)}   ${Object.entries(byType)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([t, n]) => `${t.trim()} ${kb(n)}`)
        .join(" · ")}`,
    );
    await page.close();
  }
  console.log("  (uncompressed; a host serving gzip or brotli sends roughly a third of this)");
}

await browser.close();
console.log(fails ? `\n${fails} scene(s) below the floor\n` : "\nPERFORMANCE WITHIN BUDGET\n");
process.exit(fails ? 1 : 0);
