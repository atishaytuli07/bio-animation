// Static HTML export, for iGEM. Wikis are served as static files from GitLab Pages, so an SSR-only build
// cannot be submitted.
// The obvious route does not work: TanStack Start's prerenderer boots a preview server before crawling, and that
// preview server imports dist/server/server.js, while this project builds through nitro, which writes
// .output/server/ instead. The preview server fails to start, every prerender fetch comes back 500, and the
// build dies on "Failed to fetch" for the first route. It is also why `vite preview` is broken here.
// So this script sidesteps the preview server: it builds with nitro's node-server preset, runs that real server,
// crawls it over HTTP and writes what comes back to disk.
// Usage:
//   bun run build:static                 dist-static/
//   bun run build:static -- --base=/x/   paths rewritten under /x/
// The --base flag exists because an iGEM wiki lives at /<team-slug>/, not at the domain root.
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { cp, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const OUT = join(ROOT, "dist-static");

// Routes to export, read from the site map rather than listed again here. A second hand-maintained list is the
// bug this project already fixed in the navigation: a page gets built, one list is updated and the other is not,
// and the page silently never ships.
const ALIASES = (() => {
  const src = readFileSync(join(ROOT, "src/components/story/site-map.ts"), "utf8");
  const re = /\{\s*from:\s*"([^"]+)"\s*,\s*to:\s*"([^"]+)"\s*\}/g;
  return [...src.matchAll(re)].map((m) => ({ from: m[1], to: m[2] }));
})();

const ROUTES = (() => {
  const src = readFileSync(join(ROOT, "src/components/story/site-map.ts"), "utf8");
  const routes = [...src.matchAll(/to:\s*"([^"]+)"\s*,\s*ready:\s*(true|false)/g)]
    .filter(([, , ready]) => ready === "true")
    .map(([, to]) => to);
  if (!routes.length)
    throw new Error("no ready routes found in site-map.ts — has its shape changed?");
  return routes;
})();

// The wiki's base path, given as the team slug: --base=chemoguard becomes /chemoguard/.
// Only the last path segment is used, deliberately. Git Bash and other MSYS shells rewrite any argument that
// looks like a Unix absolute path into a Windows one, so --base=/chemoguard/ arrives as
// "C:/Program Files/Git/chemoguard/". Taking the final segment makes the flag behave the same either way.
const baseArg = process.argv.find((a) => a.startsWith("--base="));
const slug = baseArg ? baseArg.slice(7).split("/").filter(Boolean).pop() : null;
const BASE = slug ? `/${slug}/` : "/";

const log = (m) => process.stdout.write(`[static] ${m}\n`);

/** An OS-assigned free port, so a stale dev server never collides with this. */
function freePort() {
  return new Promise((res, rej) => {
    const s = createServer();
    s.on("error", rej);
    s.listen(0, () => {
      const { port } = s.address();
      s.close(() => res(port));
    });
  });
}

function run(cmd, args, env) {
  return new Promise((res, rej) => {
    const p = spawn(cmd, args, {
      cwd: ROOT,
      stdio: "inherit",
      shell: true,
      env: { ...process.env, ...env },
    });
    p.on("exit", (c) => (c === 0 ? res() : rej(new Error(`${cmd} exited ${c}`))));
  });
}

// Rewrite the few root-absolute URLs that vite does not already handle. Vite's `base` covers everything it
// bundles and the app resolves public files through asset(), so what remains is the literal paths in route head
// config, the preload links and the favicon, which are plain strings vite never sees.
// The negative lookahead for the base itself is load-bearing: without it this prefixed paths vite had already
// prefixed, and every asset 404'd at /chemoguard/chemoguard/assets/...
// Narrow in the other direction too: a blanket replace of "/" would corrupt inline SVG path data, and this page
// is mostly inline SVG.
function rebase(html) {
  if (BASE === "/") return html;
  const already = BASE.slice(1, -1).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(<(?:link|meta)\\b[^>]*?\\b(?:href|content)=")/(?!/|${already}/)`, "g");
  return html.replace(re, `$1${BASE}`);
}

async function main() {
  log(`base path: ${BASE}`);
  log("building with nitro's node-server preset…");
  await rm(join(ROOT, ".output"), { recursive: true, force: true });
  await run("bun", ["run", "build"], { NITRO_PRESET: "node-server", WIKI_BASE: BASE });

  const port = await freePort();
  log(`starting the built server on :${port}`);
  const server = spawn("node", [join(ROOT, ".output", "server", "index.mjs")], {
    cwd: ROOT,
    env: { ...process.env, PORT: String(port), NODE_ENV: "production" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let serverErr = "";
  server.stderr.on("data", (d) => (serverErr += d.toString()));

  const origin = `http://127.0.0.1:${port}`;
  try {
    // Wait for it to accept connections rather than sleeping a fixed time.
    const deadline = Date.now() + 30_000;
    for (;;) {
      try {
        await fetch(origin + "/");
        break;
      } catch {
        if (Date.now() > deadline) throw new Error(`server never came up.\n${serverErr}`);
        await new Promise((r) => setTimeout(r, 250));
      }
    }

    await rm(OUT, { recursive: true, force: true });
    await mkdir(OUT, { recursive: true });

    log("copying assets…");
    await cp(join(ROOT, ".output", "public"), OUT, { recursive: true });

    for (const route of ROUTES) {
      const res = await fetch(origin + route);
      if (!res.ok) throw new Error(`${route} returned ${res.status}`);
      const html = rebase(await res.text());
      if (!html.includes("<!DOCTYPE html"))
        throw new Error(`${route} did not return an HTML document`);
      const dir = join(OUT, route.replace(/^\//, ""));
      await mkdir(dir, { recursive: true });
      await writeFile(join(dir, "index.html"), html, "utf8");
      log(
        `  ${route} → ${route.replace(/^\//, "")}/index.html  (${(html.length / 1024).toFixed(0)} kB)`,
      );
    }

    // The story is the root, so every page in the site map is a real document and was written above. What is
    // left is the aliases: an address this wiki answers under another name gets a meta refresh plus a visible
    // link, which works with scripting disabled. A static host cannot redirect for us.
    const writeRedirect = async (at, toRoute) => {
      // the root is the base itself; anything else is a folder under it
      const target = toRoute === "/" ? BASE : `${BASE}${toRoute.replace(/^\//, "")}/`;
      const dir = join(OUT, at.replace(/^\//, ""));
      await mkdir(dir, { recursive: true });
      await writeFile(
        join(dir, "index.html"),
        `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">` +
          `<meta http-equiv="refresh" content="0; url=${target}">` +
          `<link rel="canonical" href="${target}"><title>ChemoGuard — iGEM 2026</title>` +
          `</head><body><p><a href="${target}">Continue to ChemoGuard</a></p></body></html>\n`,
        "utf8",
      );
      log(`  ${at} → ${at.replace(/^\//, "")}/index.html (redirect to ${target})`);
    };

    for (const alias of ALIASES) await writeRedirect(alias.from, alias.to);
  } finally {
    server.kill();
  }

  const top = (await readdir(OUT)).length;
  log(`done — dist-static/ has ${top} top-level entries. Upload this folder.`);
}

main().catch((e) => {
  process.stderr.write(`[static] FAILED: ${e.message}\n`);
  process.exit(1);
});
