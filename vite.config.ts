import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

// The build, written out plugin by plugin. This was a one-line call to a scaffold's wrapper config, which
// assembled the same plugins and added editor tooling on top: devtools in development, error loggers wired to
// its own preview, an HMR gate, an asset proxy and a Cloudflare deploy target. A wiki on iGEM's GitLab uses none
// of it, so the wrapper is gone and what the site needs is listed here.
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
