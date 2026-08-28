// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  /*
    The wiki's base path, for iGEM. An iGEM wiki is served from
    /<team-slug>/, not from the domain root, so asset URLs — including the
    ones inside bundled CSS, which no amount of HTML rewriting can reach —
    have to be built with that prefix.

    Set by `bun run build:static -- --base=<slug>`; empty for local
    development and for any root-hosted deploy.
  */
  vite: {
    base: process.env["WIKI_BASE"] || "/",
  },

  // Deploy notes:
  // - `npx vite preview` is BROKEN in this template: it imports
  //   dist/server/server.js, which the Lovable/nitro pipeline never writes
  //   (it writes .output/server/). Don't use it.
  // - That same missing file is why tanstackStart.prerender fails. Its
  //   prerenderer boots that preview server before crawling, so every page
  //   comes back 500 and the build dies. One missing file, two broken
  //   features — which is why the static export does not use it.
  // - For iGEM's static HTML, use `bun run build:static`. It builds with
  //   nitro's node-server preset, runs that real server and crawls it, so it
  //   depends on nothing the Lovable pipeline can take away.
  // - To run a server instead: Vercel auto-detects nitro, or deploy via
  //   Lovable.
});
