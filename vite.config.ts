import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

/*
  The build, written out plugin by plugin.

  This used to be a one-line call to @lovable.dev/vite-tanstack-config, which
  assembled the same plugins behind the scenes and added Lovable's editor
  tooling on top: TanStack devtools injected in development, SSR and
  server-function error loggers wired to its preview, an HMR gate, an asset
  proxy to lovable.app, and a Cloudflare default deploy target. None of that is
  used by a wiki built on iGEM's GitLab, so the wrapper is gone and what the
  site actually needs is listed here, in the order the wrapper applied it.
*/
export default defineConfig(({ command }) => ({
  /*
    The wiki's base path, for iGEM. An iGEM wiki is served from
    /<team-slug>/, not from the domain root, so asset URLs — including the
    ones inside bundled CSS, which no amount of HTML rewriting can reach —
    have to be built with that prefix.

    Set by `scripts/build-static.mjs --base=<slug>`; "/" for local development.
  */
  base: process.env["WIKI_BASE"] || "/",

  plugins: [
    tailwindcss(),
    // the `@/` import alias, read from tsconfig.json's `paths`
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart(),
    /*
      nitro turns the app into a runnable server, which the static export
      starts and crawls. Build only. Its preset comes from NITRO_PRESET, which
      build-static.mjs sets to node-server.
    */
    command === "build" ? nitro() : null,
    viteReact(),
  ],

  // Port 8080: the dev server every check in scripts/ expects.
  server: { host: "::", port: 8080 },

  /*
    Deploy notes:
    - `vite preview` does not work here: it imports dist/server/server.js,
      and the nitro build writes .output/server/ instead.
    - That same missing file is why tanstackStart's own prerenderer fails —
      it boots that preview server before crawling, so every page comes back
      500. Which is why the static export does not use it.
    - For iGEM's static HTML, use `bun run build:static` (or CI's
      scripts/ci-build.sh). It builds with nitro's node-server preset, runs
      that real server and crawls it.
  */
}));
