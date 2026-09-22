/**
 * Accessibility, on every page and on the story's controls.
 *
 * iGEM's own recommendations ask for alt text and readable contrast, and a
 * judge reading with a keyboard or a screen reader is not a hypothetical. This
 * checks three things the other harnesses cannot see:
 *
 *   1. axe-core on every route, failing on serious and critical violations.
 *      Contrast is left to audit.mjs, which measures PAINTED pixels — axe reads
 *      authored colours and reports nothing useful on a gradient.
 *   2. THE STORY IS OPERABLE BY KEYBOARD. Its two hold controls and its dose
 *      slider are the only interactive things on the site, and both holds were
 *      pointer-only once: focusable, and impossible to operate.
 *   3. REDUCED MOTION IS HONOURED. The story is scroll-driven, which is fine —
 *      scroll-linked motion is the reader's own — but nothing may animate on a
 *      clock of its own when the reader has asked for stillness.
 *
 * Usage: node scripts/verify-a11y.mjs [origin=http://localhost:8080]
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { chromium } from "playwright";

const require = createRequire(import.meta.url);
const AXE = require.resolve("axe-core");
const BASE = process.argv[2] ?? "http://localhost:8080";

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

const browser = await chromium.launch();

console.log("\n── 1 · axe-core, every page");
for (const route of routes) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(BASE + route, { waitUntil: "networkidle" });
  // the story mounts scenes as they are reached; walk it before auditing
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y <= h; y += 900) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(route === "/new" ? 120 : 30);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  await page.addScriptTag({ path: AXE });
  const result = await page.evaluate(async () => {
    // colour-contrast is audit.mjs's job: it reads painted pixels, axe reads
    // authored values and cannot see a gradient or a semi-transparent scrim
    return await window.axe.run(document, {
      resultTypes: ["violations"],
      rules: { "color-contrast": { enabled: false } },
    });
  });
  const bad = result.violations.filter((v) => ["serious", "critical"].includes(v.impact));
  say(
    bad.length === 0,
    `${route} — ${result.violations.length} violation(s), ${bad.length} serious or critical`,
    bad
      .map((v) => `${v.impact}: ${v.id} — ${v.nodes.length}× ${v.nodes[0]?.target?.join(" ")}`)
      .join("\n        "),
  );
  await page.close();
}

console.log("\n\u2500\u2500 2 \u00b7 the story's controls work from the keyboard");
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(BASE + "/new", { waitUntil: "networkidle" });

  /** Scroll to a fraction of the story, in steps, the way a reader would. */
  const at = async (f, from = 0) => {
    for (let s = from; s <= f; s += 0.02) {
      await page.evaluate((s) => {
        const e = document.getElementById("story-end");
        window.scrollTo(0, (e.offsetTop - innerHeight) * s);
      }, s);
      await page.waitForTimeout(25);
    }
    await page.waitForTimeout(700);
  };

  /**
   * WHERE A CONTROL IS ACTUALLY LIVE, found rather than hard-coded.
   *
   * Every control on this page arrives and leaves on its own scroll window,
   * and the first version of this check tested the slider at 0.66 and a hold
   * at 0.86 — numbers that read plausibly and were both wrong. It reported two
   * failures against controls that work. A check that asserts a scene's timing
   * from memory breaks every time a beat is retuned; this one looks.
   */
  const liveAt = async (selector, nth = 0) => {
    let from = 0;
    for (let f = 0.3; f <= 0.98; f += 0.01) {
      await at(f, from);
      from = f;
      const live = await page.evaluate(
        ([selector, nth]) => {
          const el = document.querySelectorAll(selector)[nth];
          if (!el) return false;
          const cs = getComputedStyle(el);
          if (cs.pointerEvents === "none" || cs.visibility === "hidden") return false;
          let a = 1;
          for (let n = el; n && n !== document.body; n = n.parentElement)
            a *= Number(getComputedStyle(n).opacity);
          return a > 0.5;
        },
        [selector, nth],
      );
      if (live) return f;
    }
    return null;
  };

  // the dose slider: a native range input, so arrow keys must move it
  const sliderAt = await liveAt('input[type="range"]');
  if (sliderAt === null) {
    say(false, "the dose slider is live somewhere in the story", "never interactive");
  } else {
    const slider = page.locator('input[type="range"]').first();
    const before = await slider.inputValue();
    await slider.focus();
    for (let i = 0; i < 6; i++) await page.keyboard.press("ArrowLeft");
    const after = await slider.inputValue();
    say(
      before !== after,
      `the dose slider moves with the arrow keys (live at ${sliderAt.toFixed(2)})`,
      `${before} \u2192 ${after}`,
    );
  }

  /*
    Both hold controls, not just the first: they are the only way to act in the
    story, and both were pointer-only once — focusable, and impossible to
    operate. Held, each says "Dosing…" itself, which is what is read back here.
  */
  for (const nth of [0, 1]) {
    const holdAt = await liveAt("#why button", nth);
    if (holdAt === null) {
      say(false, `hold control ${nth + 1} is live somewhere in the story`, "never interactive");
      continue;
    }
    const hold = page.locator("#why button").nth(nth);
    const shape = await hold.evaluate((el) => ({
      tag: el.tagName,
      tabbable: el.tabIndex >= 0,
      name: (el.textContent || "").trim().slice(0, 32),
    }));
    await hold.focus();
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    await page.keyboard.down("Space");
    await page.waitForTimeout(700);
    const during = await page.evaluate(() => (document.activeElement?.textContent || "").trim());
    await page.keyboard.up("Space");
    say(
      shape.tag === "BUTTON" && shape.tabbable && focused === "BUTTON",
      `hold control ${nth + 1} is a real, focusable button ("${shape.name}")`,
      `${shape.tag}, tabIndex ${shape.tabbable ? "\u2265 0" : "< 0"}, focus landed on ${focused}`,
    );
    say(
      during.includes("\u2026"),
      `holding Space operates hold control ${nth + 1} (live at ${holdAt.toFixed(2)})`,
      during ? `label while held: "${during}"` : "pressing Space changed nothing",
    );
  }
  await page.close();
}

console.log("\n── 3 · reduced motion stops what runs on its own clock");
{
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
    reducedMotion: "reduce",
  });
  await page.goto(BASE + "/description", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  const sample = () =>
    page.evaluate(() => {
      const el = document.querySelector("section [data-piece], section img");
      return el ? getComputedStyle(el).transform : "none";
    });
  const a = await sample();
  await page.waitForTimeout(1500);
  const b = await sample();
  say(a === b, "the hero does not drift when reduced motion is set", `${a} vs ${b}`);

  const css = await page.evaluate(() => {
    const running = [];
    for (const el of document.querySelectorAll("*")) {
      const s = getComputedStyle(el);
      if (s.animationName !== "none" && s.animationPlayState === "running")
        running.push(
          `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 24)}: ${s.animationName}`,
        );
    }
    return running;
  });
  say(css.length === 0, "no CSS animation is running either", css.join("\n        "));
  await page.close();
}

await browser.close();
console.log(fails ? `\n${fails} FAILED\n` : "\nACCESSIBILITY VERIFIED\n");
process.exit(fails ? 1 : 0);
