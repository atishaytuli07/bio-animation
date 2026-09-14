import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

/*
  Self-hosted typefaces, replacing a Google Fonts <link>. All three are OFL, so
  redistributing them inside the wiki build is permitted.

  Instrument Sans is the body face for the whole site. Archivo Black and
  Newsreader went with the deleted direction — they were only ever used by its
  poster and serif utilities.

  The package publishes one stylesheet per axis rather than per subset, so its
  Cyrillic, Greek and Vietnamese faces are declared too; each carries a
  unicode-range, so a reader only downloads the subset the page actually sets.
*/
import "@fontsource-variable/instrument-sans/wght.css";

import { C, T } from "@/components/hero/palette";
import { SiteHeader } from "@/components/story/SiteHeader";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

/*
  A missing page still gets the site's navigation, so a mistyped link leaves
  the reader one click from anywhere rather than on a dead end. It was the
  starter template's grey page, with nothing of the wiki in it.
*/
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
            <Link
              to="/new"
              className="inline-block px-6 py-3 text-[15px] font-bold"
              style={{
                background: C.redDeep,
                color: "#fff",
                border: `2.5px solid ${C.ink}`,
                borderRadius: 6,
                boxShadow: `4px 4px 0 ${C.ink}`,
              }}
            >
              Back to the story
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
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
      /*
        NO EXTERNAL STYLESHEETS OR FONT CDNs.

        iGEM wikis must serve every asset from the team's own wiki; a request to
        fonts.googleapis.com is a rule violation and, on competition
        infrastructure, a request that simply fails. It was failing here too —
        a headless run of this page logged ERR_CONNECTION_TIMED_OUT against
        that host, so the typography was already at the mercy of a network
        call.

        The typeface is now installed as a package and imported at the top of
        this file. Vite fingerprints the woff2 files into the build
        output, so they ship with the wiki and resolve locally. Swapping in the
        team's own typeface later is a change of import and family name; the
        mechanism does not change.
      */
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
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
