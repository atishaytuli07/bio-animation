// The exported wiki, checked the way iGEM will serve it.
// Every other harness reads the dev server at the domain root. The wiki does not live there: it is a folder of static
// files served under /<team-slug>/, with no server to run a redirect or render a route. A path that works on
// localhost:8080 and escapes the base path on the real host is invisible to every other check in this folder — and on
// a shared wiki domain an escaped "/favicon.svg" is not a 404, it is a request to someone else's site.
// So this serves dist-static/ under the base path from a deliberately strict server — it refuses anything outside the
// base — and then, for every route in the site map, at phone and desktop width:
//   - loads it by its deep link, the way a judge's bookmark would
//   - scrolls the whole page, so late-loaded images and scenes are requested
//   - records every request that failed, every request outside the base, and every console error or uncaught
//     exception
//   - checks the page rendered its header and its own <h1> or story
// Then it clicks through the header's nav from the story, so client-side navigation is covered as well as deep links,
// and loads the root to check the redirect document.
// Usage (build first, with the same slug):
//   node scripts/build-static.mjs --base=nis-kazakhstan
//   node scripts/verify-static.mjs --base=nis-kazakhstan
// Without --base it checks a root-served export.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { chromium } from "playwright";

const ROOT = resolve(import.meta.dirname, "..");
const OUT = join(ROOT, "dist-static");
const baseArg = process.argv.find((a) => a.startsWith("--base="));
// last segment only — see build-static.mjs for why (MSYS path mangling)
const slug = baseArg ? baseArg.slice(7).split("/").filter(Boolean).pop() : null;
const BASE = slug ? `/${slug}/` : "/";
const PORT = 8097;
const ORIGIN = `http://127.0.0.1:${PORT}`;

const ROUTES = (() => {
  const src = readFileSync(join(ROOT, "src/components/story/site-map.ts"), "utf8");
  const r = [...src.matchAll(/to:\s*"([^"]+)"\s*,\s*ready:\s*true/g)].map((m) => m[1]);
  if (!r.length) {
    console.error("no ready routes found in site-map.ts");
    process.exit(2);
  }
  return r;
})();

try {
  await stat(join(OUT, "index.html"));
} catch {
  console.error(
    `No export found. Run: node scripts/build-static.mjs${slug ? ` --base=${slug}` : ""}`,
  );
  process.exit(2);
}
// An export built for a different base is a wrong answer, not a slow one.
{
  const html = readFileSync(join(OUT, "index.html"), "utf8");
  const built = html.match(/<script[^>]+src="([^"]*?)assets\//)?.[1] ?? "";
  if (built !== BASE) {
    console.error(
      `dist-static was built for base "${built}", not "${BASE}". Rebuild with the same --base.`,
    );
    process.exit(2);
  }
}

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".webp": "image/webp",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".json": "application/json",
  ".txt": "text/plain",
};

/** Requests that left the base path, keyed by path, with the page that made them. */
const escaped = new Map();

const server = createServer(async (req, res) => {
  const path = decodeURIComponent(req.url.split("?")[0]);
  if (!path.startsWith(BASE) && path !== BASE.slice(0, -1)) {
    escaped.set(path, (escaped.get(path) ?? 0) + 1);
    res.writeHead(404);
    return res.end("outside the wiki's base path");
  }
  let file = join(OUT, path.slice(BASE.length));
  try {
    if ((await stat(file)).isDirectory()) {
      // a static host serves /x as a redirect to /x/, and /x/ as /x/index.html
      if (!path.endsWith("/")) {
        res.writeHead(301, { location: path + "/" });
        return res.end();
      }
      file = join(file, "index.html");
    }
    res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
    res.end(await readFile(file));
  } catch {
    res.writeHead(404);
    res.end("not found");
  }
}).listen(PORT);

let fails = 0;
const say = (ok, what, detail = "") => {
  if (!ok) fails++;
  console.log(`  ${ok ? "ok  " : "FAIL"}  ${what}${detail ? `\n        ${detail}` : ""}`);
};

const browser = await chromium.launch();

function watch(page) {
  const log = { failed: [], errors: [] };
  page.on("requestfailed", (r) => log.failed.push(`${r.failure()?.errorText} ${r.url()}`));
  page.on("response", (r) => {
    if (r.status() >= 400) log.failed.push(`${r.status()} ${r.url()}`);
  });
  page.on("console", (m) => {
    if (m.type() === "error") log.errors.push(m.text());
  });
  page.on("pageerror", (e) => log.errors.push(e.message));
  return log;
}

async function scrollThrough(page) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y <= h; y += 500) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(30);
  }
  await page.waitForTimeout(600);
}

console.log(`\n── every route by deep link, under ${BASE}`);
for (const [vw, vh] of [
  [390, 844],
  [1440, 900],
]) {
  for (const route of ROUTES) {
    const page = await browser.newPage({ viewport: { width: vw, height: vh } });
    const log = watch(page);
    const url = `${ORIGIN}${BASE}${route.replace(/^\//, "")}/`;
    const res = await page.goto(url, { waitUntil: "networkidle" });
    await scrollThrough(page);
    const shape = await page.evaluate(() => ({
      header: !!document.querySelector("header nav, header button[aria-label]"),
      heading: document.querySelector("h1")?.textContent?.trim() ?? "",
      images: [...document.images]
        .filter((i) => i.complete && i.naturalWidth === 0)
        .map((i) => i.src),
    }));
    const problems = [
      ...(res?.status() !== 200 ? [`document ${res?.status()}`] : []),
      ...log.failed,
      ...log.errors.map((e) => `console: ${e.slice(0, 160)}`),
      ...shape.images.map((s) => `broken image: ${s}`),
      ...(!shape.header ? ["no header"] : []),
      ...(!shape.heading ? ["no h1"] : []),
    ];
    say(problems.length === 0, `${vw}px ${route}`, problems.join("\n        "));
    await page.close();
  }
}

console.log("\n── client-side navigation from the story, through the header");
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const log = watch(page);
  await page.goto(`${ORIGIN}${BASE}new/`, { waitUntil: "networkidle" });
  // The links the header actually shows, read from the page. This was the site map minus two hand-listed exceptions,
  // and it timed out the day a page was added to the footer instead of the header — a check that restates a design
  // decision breaks when the decision changes.
  const navRoutes = await page.$$eval("header nav a", (as) =>
    as.map((a) => new URL(a.href).pathname.replace(/\/$/, "").split("/").pop()),
  );
  for (const route of navRoutes.filter((r) => r && r !== "new").map((r) => `/${r}`)) {
    const before = log.failed.length + log.errors.length;
    await page.click(`header nav a[href$="${route}"], header nav a[href$="${route}/"]`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(400);
    const at = new URL(page.url()).pathname;
    const inside = at.startsWith(BASE);
    const heading = await page.evaluate(
      () => document.querySelector("h1")?.textContent?.trim() ?? "",
    );
    const fresh = [...log.failed, ...log.errors].slice(before);
    say(
      inside && heading && fresh.length === 0,
      `→ ${route}`,
      `${at}  h1 "${heading}"${fresh.length ? "\n        " + fresh.join("\n        ") : ""}`,
    );
    // And reload it. Client-side navigation leaves the address bar at /<base>/description with no trailing slash,
    // which is exactly the URL a reader copies or refreshes — and the one a static host has to resolve without the
    // app's router.
    const reloaded = await page.goto(page.url(), { waitUntil: "networkidle" });
    const after = await page.evaluate(
      () => document.querySelector("h1")?.textContent?.trim() ?? "",
    );
    say(
      reloaded?.ok() && after === heading,
      `  reload ${at}`,
      `${reloaded?.status()} → ${new URL(page.url()).pathname}  h1 "${after}"`,
    );
    // back to the story for the next hop, the way a reader would
    await page.goBack({ waitUntil: "networkidle" });
  }
  await page.close();
}

console.log("\n── the root, which is the story itself");
{
  const page = await browser.newPage();
  const log = watch(page);
  await page.goto(`${ORIGIN}${BASE}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  const at = new URL(page.url()).pathname;
  say(
    at === BASE && log.failed.length === 0,
    `${BASE} serves the story itself, with no redirect`,
    `${at}${log.failed.length ? "  " + log.failed.join("; ") : ""}`,
  );
  await page.close();
}

console.log("\n── the files themselves: no root-absolute or external links");
{
  // A browser does not request everything a page links to. This check was proven blind the first time it ran: a
  // planted <link rel="icon" href="/favicon.svg"> passed, because headless Chromium never fetches favicons, while a
  // planted preload beside it was caught. A real browser does fetch the icon, from outside the wiki. So the export is
  // also read as text.
  // Two scans. In HTML, every href/src/content/action/poster attribute: a root- absolute value must start with the
  // base, and nothing may point off-site (iGEM wikis must not load external resources). In HTML, CSS and js, any
  // quoted path to a file from public/ that lacks the base — that is the shape a hard-coded "/logo.webp" takes in a
  // bundle.
  const { readdir } = await import("node:fs/promises");
  const files = [];
  const walk = async (d) => {
    for (const e of await readdir(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) await walk(p);
      else if (/\.(html|css|js|mjs)$/.test(e.name)) files.push(p);
    }
  };
  await walk(OUT);
  const publicFiles = (await readdir(join(ROOT, "public"))).map((f) =>
    f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );
  const barePublic = new RegExp(`["'(]/(${publicFiles.join("|")})["')]`, "g");
  // Linking out is allowed; loading from outside is not. iGEM: "Linking to external sources is … encouraged", while
  // external requests at runtime are prohibited. So an external URL fails only on a tag that makes the browser fetch
  // it — a script, stylesheet, image, frame — never on an <a>. The footer's licence and repository links are exactly
  // the <a> this has to let through.
  const tag = /<([a-zA-Z][a-zA-Z0-9-]*)(\s[^>]*)?>/g;
  // preceded by whitespace, so `data-content=` is not read as `content=`
  const attr = /\s(href|src|srcset|content|action|poster|data)="([^"]*)"/g;
  const found = [];
  for (const f of files) {
    const text = readFileSync(f, "utf8");
    const rel = f.slice(OUT.length + 1).replace(/\\/g, "/");
    if (/\.html$/.test(f)) {
      for (const [, name, attrs = ""] of text.matchAll(tag)) {
        const el = name.toLowerCase();
        for (const [, key, v] of attrs.matchAll(attr)) {
          if (v.startsWith("/") && !v.startsWith("//") && BASE !== "/" && !v.startsWith(BASE))
            found.push(`${rel}: <${el} ${key}> root-absolute "${v}"`);
          const external = /^(https?:)?\/\//.test(v);
          const loads =
            el !== "a" &&
            !(el === "link" && /rel="(canonical|license)"/.test(attrs)) &&
            !(el === "meta" && key === "content");
          if (external && loads) found.push(`${rel}: <${el} ${key}> loads from outside "${v}"`);
        }
      }
    }
    if (BASE !== "/")
      for (const m of text.matchAll(barePublic)) found.push(`${rel}: bare public path ${m[0]}`);
  }
  say(
    found.length === 0,
    `${files.length} exported files scanned`,
    [...new Set(found)].slice(0, 20).join("\n        "),
  );
}

console.log("\n── nothing left the base path");
say(
  escaped.size === 0,
  `every request stayed under ${BASE}`,
  [...escaped].map(([p, n]) => `${p} ×${n}`).join("\n        "),
);

await browser.close();
server.close();
console.log(fails ? `\n${fails} FAILED\n` : "\nSTATIC EXPORT VERIFIED\n");
process.exit(fails ? 1 : 0);
