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
  // Deploy notes:
  // - `npx vite preview` is BROKEN in this template (expects dist/server/server.js,
  //   which the Lovable/nitro pipeline never writes). Don't use it.
  // - Both tanstackStart.prerender and nitro's prerenderer also fail against
  //   this pipeline, so there is no static-HTML export. Deploy to a host that
  //   runs the server: Vercel auto-detects nitro (preset switches from the
  //   Cloudflare default automatically in its CI), or deploy via Lovable.
});
