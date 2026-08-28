import { createFileRoute, redirect } from "@tanstack/react-router";

const TITLE = "ChemoGuard — Precision starts in your DNA";
const DESCRIPTION =
  "An interactive story about DPYD gene variants, DPD deficiency and fluoropyrimidine chemotherapy toxicity — and the pre-treatment test that prevents it.";

/**
 * The root redirects to /new, which is the approved direction and the only
 * version being shown to the client.
 *
 * This route used to also carry the whole previous visual direction — the
 * three.js helix, the near-black chapters and the poster hero the client
 * rejected — behind a redirect that made it unreachable. Unreachable is not
 * the same as gone: it still compiled, still shipped, and @react-three/drei
 * alone was 2.1 MB of the server bundle for a page nobody could open.
 *
 * That direction is deleted rather than commented out. It is recoverable from
 * git if it is ever wanted, which is the right place for it — carrying a dead
 * alternative in the build costs every reader a slower wiki, and iGEM's
 * infrastructure is not fast.
 *
 * The redirect stays because the client has been given the /new link; both the
 * root and that link must keep working. When /new becomes the finished
 * homepage it should move here and this file becomes the page itself.
 */
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/new" });
  },
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "author", content: "ChemoGuard — iGEM 2026" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
  }),
});
