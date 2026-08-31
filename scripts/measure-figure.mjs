/**
 * Measure scene 3's figure and vessel at phone width, so "it fits" is a number
 * rather than an impression. Reports the rendered box of the patient plate, the
 * vessel, the gap between them, and how much of the 390px viewport is left over.
 */
import { chromium } from "playwright";

const URL = process.argv[2] ?? "http://localhost:8080/new";

const browser = await chromium.launch();

for (const [name, width, height] of [
  ["iphone-se", 375, 667],
  ["iphone", 390, 844],
  ["tablet", 768, 1024],
]) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(URL, { waitUntil: "networkidle" });

  // Scene 3 act one: page progress ~0.65 (the vessel + figure + tags frame).
  await page.evaluate(() => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo(0, max * 0.65);
  });
  await page.waitForTimeout(900);

  const m = await page.evaluate(() => {
    /*
      Scoped to #why. patient-b.webp is used in BOTH scene 2 and scene 3, and
      scene 2 is still mounted here — hidden, but visibility:hidden still
      returns a bounding box, so an unscoped query silently measures the wrong
      figure and reports it as if it were this one.
    */
    const why = document.querySelector("#why");
    const img = [...why.querySelectorAll("img")].find((i) =>
      i.getAttribute("src")?.includes("patient-b"),
    );
    const svg = [...why.querySelectorAll("svg")].find(
      (s) => s.getAttribute("viewBox") === "0 0 360 520",
    );
    const box = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        w: +r.width.toFixed(1),
        h: +r.height.toFixed(1),
        left: +r.left.toFixed(1),
        right: +r.right.toFixed(1),
        visible: r.width > 0 && r.height > 0 && r.right > 0 && r.left < window.innerWidth,
      };
    };
    return { figure: box(img), vessel: box(svg), vw: window.innerWidth };
  });

  const f = m.figure;
  const v = m.vessel;
  console.log(`\n── ${name}  ${width}×${height} ──`);
  if (!f) {
    console.log("  figure   NOT RENDERED");
  } else {
    console.log(
      `  figure   ${f.w}×${f.h}px   x ${f.left}→${f.right}   ${f.visible ? "visible" : "OFF-SCREEN"}`,
    );
  }
  if (v) console.log(`  vessel   ${v.w}×${v.h}px   x ${v.left}→${v.right}`);
  if (f && v) {
    console.log(`  gap      ${(v.left - f.right).toFixed(1)}px`);
    console.log(
      `  used     ${(v.right - f.left).toFixed(1)}px of ${m.vw}px  (${(((v.right - f.left) / m.vw) * 100).toFixed(0)}%)`,
    );
    console.log(`  figure is ${((f.w / m.vw) * 100).toFixed(1)}% of viewport width`);
  }
  await page.close();
}

await browser.close();
