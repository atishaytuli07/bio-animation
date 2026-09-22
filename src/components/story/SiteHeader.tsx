import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";

import { asset, C, DISPLAY, L, R } from "@/components/hero/palette";
import { NAV } from "@/components/story/site-map";
import { Underline } from "@/components/story/Underline";

/**
 * The one header, on every page.
 *
 * THERE WERE TWO. The documentation pages had a cream bar that stayed; the
 * story had its own, transparent over the hero and a plum bar after it, and it
 * lived inside the first scene's pinned stage — so it scrolled away with that
 * scene and the reader went through the rest of the story with no navigation
 * at all. The client asked for one cream, full-width navigation that stays
 * while scrolling, on every page including the story. One component is the only
 * way that stays true: two copies drift, and these already had.
 *
 * CREAM IS ALSO WHAT ENDED THE CONTRAST FIGHT. The story's header had to switch
 * type colour and backing as the ground under it went from cream to deep
 * purple, and every version of that switch had a frame where something was
 * unreadable. A bar that owns its own ground has no such frame: ink on paper
 * is the same ratio at every scroll position.
 *
 * `fixed` on the story, `sticky` everywhere else. Sticky takes 68px of the
 * document's height, and every scene on the story is timed against scroll
 * position — adding height above them would move every beat. Fixed sits over
 * the page without changing its length; the story's first screen already
 * leaves the header's height clear.
 */
export function SiteHeader({
  position = "sticky",
  rail,
}: {
  position?: "sticky" | "fixed";
  /**
   * Drawn along the bottom edge of the bar — the story's progress rail.
   *
   * INSIDE the header rather than in a fixed layer above it. As a layer above,
   * it and the chapter label painted over the phone menu when it opened: the
   * label read through as faint white text between "The story" and
   * "Description", and the knob sat on the menu's border. Inside, the menu is
   * simply stacked over it.
   */
  rail?: ReactNode;
}) {
  const [menu, setMenu] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header
      className={`${position === "fixed" ? "fixed inset-x-0" : "sticky"} top-0 z-40`}
      style={{ background: C.paper, borderBottom: `2px solid ${C.ink}14` }}
    >
      {/* `relative` so the rail can hang off the bottom of the bar row, which
          stays put when the menu opens beneath it. */}
      <div className="relative">
        <div className="mx-auto flex max-w-[92rem] items-center justify-between gap-6 px-6 py-3.5 md:px-10">
          <Link to="/new" className="flex items-center gap-2.5">
            <span
              className="grid h-[34px] w-[34px] shrink-0 place-items-center overflow-hidden rounded-full md:h-[38px] md:w-[38px]"
              style={{ background: "#fff", boxShadow: `0 0 0 2px ${C.ink}1f` }}
            >
              <img
                src={asset("logo-mark.webp")}
                alt="ChemoGuard — NIS Kazakhstan, iGEM 2026"
                width={28}
                height={34}
                className="h-[27px] w-auto md:h-[30px]"
              />
            </span>
            <span
              className="text-[19px] font-extrabold leading-none md:text-[21px]"
              style={{ fontFamily: DISPLAY, letterSpacing: "-0.01em", color: C.ink }}
            >
              Chemo<span style={{ color: C.red }}>Guard</span>
            </span>
          </Link>

          {/* The hand-drawn underline marks the page you are on. */}
          <nav
            aria-label="Pages"
            className="hidden items-center gap-7 lg:flex"
            style={{ fontFamily: DISPLAY }}
          >
            {NAV.map((page, i) =>
              page.ready ? (
                <Link
                  key={page.label}
                  to={page.to}
                  className="group relative whitespace-nowrap pb-2 text-[15px] font-bold"
                  style={{ color: C.ink }}
                >
                  {page.label}
                  <Underline index={i} active={page.to === pathname} />
                </Link>
              ) : (
                <span
                  key={page.label}
                  aria-disabled="true"
                  title="Not written yet"
                  className="whitespace-nowrap text-[15px] font-bold"
                  style={{ color: C.ink, opacity: 0.4 }}
                >
                  {page.label}
                </span>
              ),
            )}
          </nav>

          <button
            type="button"
            aria-label={menu ? "Close menu" : "Menu"}
            aria-expanded={menu}
            onClick={() => setMenu((v) => !v)}
            className="flex size-9 items-center justify-center lg:hidden"
            style={{
              background: C.paper,
              border: `2.5px solid ${C.ink}`,
              borderRadius: R.sm,
              boxShadow: `3px 3px 0 ${C.ink}`,
            }}
          >
            <svg width="16" height="12" viewBox="0 0 16 12" aria-hidden="true">
              {/* three bars closed, a cross open — so the same button visibly closes it */}
              {(menu
                ? [
                    [2, 0, 14, 12],
                    [2, 12, 14, 0],
                  ]
                : [
                    [1, 1, 15, 1],
                    [1, 6, 15, 6],
                    [1, 11, 15, 11],
                  ]
              ).map(([x1, y1, x2, y2], i) => (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={C.ink}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              ))}
            </svg>
          </button>
        </div>
        {rail && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-full z-[1]">
            {rail}
          </div>
        )}
      </div>

      {menu && (
        <div
          aria-label="Pages"
          role="navigation"
          /*
            Scrolls inside itself. The header is fixed on the story, so a menu
            taller than the window could not be scrolled to — on a landscape
            phone the last rows were out of reach.
          */
          className="relative z-[2] mx-6 mb-4 max-h-[calc(100dvh-6rem)] overflow-y-auto lg:hidden"
          style={{
            background: C.paper,
            border: `2.5px solid ${C.ink}`,
            borderRadius: R.md,
            boxShadow: `4px 4px 0 ${C.ink}`,
          }}
        >
          {NAV.map((page, i) =>
            page.ready ? (
              <Link
                key={page.label}
                to={page.to}
                onClick={() => setMenu(false)}
                className="flex w-full items-center justify-between px-5 py-3 text-left text-[15px] font-bold"
                style={{ color: C.ink, borderTop: i ? `1.5px solid ${C.ink}22` : undefined }}
              >
                {page.label}
                {/* A phone menu is a stack of rows with no baseline for the
                    squiggle, so the current page is marked with a coral dot. */}
                {page.to === pathname && (
                  <span
                    aria-hidden="true"
                    className="block size-2 shrink-0 rounded-full"
                    style={{ background: C.coral }}
                  />
                )}
              </Link>
            ) : (
              <span
                key={page.label}
                aria-disabled="true"
                className="flex w-full items-center justify-between px-5 py-3 text-left text-[15px] font-bold"
                style={{
                  color: C.ink,
                  opacity: 0.45,
                  borderTop: i ? `1.5px solid ${C.ink}22` : undefined,
                }}
              >
                {page.label}
                <span className={L.note} style={{ opacity: 0.7 }}>
                  soon
                </span>
              </span>
            ),
          )}
        </div>
      )}
    </header>
  );
}
