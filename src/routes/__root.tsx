import { Outlet, createRootRoute, useRouter, HeadContent, Scripts } from "@tanstack/react-router";
import type { ReactNode } from "react";

// Instrument Sans, self-hosted (OFL, so shipping it inside the wiki is allowed). The package publishes one
// stylesheet per axis, and each face carries a unicode-range, so a reader downloads only the subset in use.
import "@fontsource-variable/instrument-sans/wght.css";

import { C, R, T } from "@/components/hero/palette";
import { PageLink, SiteFooter } from "@/components/story/PageShell";
import { SiteHeader } from "@/components/story/SiteHeader";

import appCss from "../styles.css?url";

// A missing page still gets the site's navigation, so a mistyped link is one click from anywhere.
function NotFoundComponent() {
  return (
    <div className="min-h-screen" style={{ background: C.paper, color: C.ink }}>
      <SiteHeader />
      <div className="flex items-center justify-center px-6 py-24">
        <div className="max-w-md text-center">
          <h1 className="font-black" style={{ ...T.headline }}>
            Page not found
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed" style={{ color: C.inkBody }}>
            The page you were looking for does not exist or has moved. Every page of the wiki is in
            the navigation above.
          </p>
          <div className="mt-8">
            <PageLink to="/">Back to the story</PageLink>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  // In the site's own palette. This was the last thing using the starter template's colour theme, which is
  // why that theme could be deleted from styles.css.
  const button = {
    border: `2.5px solid ${C.ink}`,
    borderRadius: R.sm,
    boxShadow: `4px 4px 0 ${C.ink}`,
  };
  return (
    <div
      className="flex min-h-screen items-center justify-center px-6"
      style={{ background: C.paper, color: C.ink }}
    >
      <div className="max-w-md text-center">
        <h1 className="font-black" style={{ ...T.headline }}>
          This page didn&rsquo;t load
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed" style={{ color: C.inkBody }}>
          Something went wrong on our side. Try again, or go back to the story.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="px-6 py-3 text-[15px] font-bold"
            style={{ ...button, background: C.redDeep, color: "#fff" }}
          >
            Try again
          </button>
          {/* The wiki's own root, not the domain's: on 2026.igem.wiki a bare "/" leaves the team's wiki. A plain
              anchor, not a router Link, because this renders when the app itself has failed. */}

          <a
            href={`${import.meta.env.BASE_URL}new/`}
            className="px-6 py-3 text-[15px] font-bold"
            style={{ ...button, background: C.paper, color: C.ink }}
          >
            Back to the story
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#F5F2F5" },
      // Per-route heads override title/description; these are the fallbacks.
      { title: "ChemoGuard — iGEM 2026" },
      {
        name: "description",
        content:
          "Pharmacogenomic screening for DPD deficiency before the first dose of fluoropyrimidine chemotherapy.",
      },
      { name: "author", content: "ChemoGuard — iGEM 2026" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      // No external stylesheets or font CDNs: iGEM wikis must serve every asset themselves, and a request to
      // fonts.googleapis.com both breaks that rule and timed out on competition infrastructure. The typeface is
      // an npm package, so vite fingerprints the woff2 files into the build and they resolve locally.

      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "alternate icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  // Required: nested routes render here. Removing <Outlet /> breaks all child routes.
  return <Outlet />;
}
