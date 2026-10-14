import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";

import { asset, C, DISPLAY, L, R } from "@/components/hero/palette";
import { MENU, pageAt, type MenuItem } from "@/components/story/site-map";
import { Underline } from "@/components/story/Underline";

// The one header, on every page.
// There were two. The documentation pages had a cream bar that stayed; the story had its own, transparent over
// the hero and plum after it, and it lived inside the first scene's pinned stage, so it scrolled away with that
// scene and the reader went through the rest of the story with no navigation. The client asked for one cream,
// full-width navigation that stays while scrolling, on every page. One component is the only way that stays
// true: two copies drift, and these already had.
// Cream also ended the contrast fight. The story's header had to switch type colour and backing as the ground
// went from cream to deep purple, and every version of that switch had a frame where something was unreadable.
// A bar that owns its own ground has no such frame: ink on paper is the same ratio at every scroll position.
// fixed on the story, sticky everywhere else. Sticky takes the bar's height out of the document, and every scene
// on the story is timed against scroll position, so adding height above them would move every beat.

/** One menu's panel: the pages in the group, and nothing else. */
function Panel({ item, end, onGo }: { item: MenuItem; end: boolean; onGo: () => void }) {
  return (
    // Under its own label; the last menu hangs from its right edge instead, so it cannot leave the window.
    // The padding above is part of the hover area, so the pointer can cross from the label to the panel.
    <div className={`absolute top-full z-50 pt-2 ${end ? "right-0" : "left-0"}`}>
      <ul
        className="menu-in min-w-[11rem] py-1.5"
        style={{
          background: C.paper,
          border: `2.5px solid ${C.ink}`,
          borderRadius: R.md,
          boxShadow: `4px 4px 0 ${C.ink}`,
        }}
      >
        {item.pages.map((to) => (
          <li key={to}>
            <Link
              to={to}
              onClick={onGo}
              className="menu-row block whitespace-nowrap px-4 py-2 text-[15px] font-bold"
              style={{ color: C.ink }}
            >
              {pageAt(to).label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteHeader({
  position = "sticky",
  rail,
}: {
  position?: "sticky" | "fixed";
  /**
   * Drawn along the bottom edge of the bar: the story's progress rail.
   * Inside the header rather than in a fixed layer above it. As a layer above, it and the chapter label painted
   * over the phone menu when it opened, the label reading through as faint white text between two nav rows.
   */
  rail?: ReactNode;
}) {
  const [menu, setMenu] = useState(false);
  /** Which desktop menu is open, by its label. */
  const [open, setOpen] = useState<string | null>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const here = (to: string) => to === pathname || `${to}/` === pathname;

  return (
    <header
      className={`${position === "fixed" ? "fixed inset-x-0" : "sticky"} top-0 z-40`}
      style={{ background: C.paper, borderBottom: `2px solid ${C.ink}14` }}
    >
      {/* relative, so the rail can hang off the bottom of the bar row, which stays put when the menu opens. */}
      <div className="relative">
        <div className="mx-auto flex max-w-[92rem] items-center justify-between gap-5 px-5 py-2 md:px-10">
          <div className="flex items-center gap-2 md:gap-3">
            <Link to="/" className="flex items-center gap-2.5 md:gap-3">
              <span
                className="grid h-[42px] w-[42px] shrink-0 place-items-center overflow-hidden rounded-full md:h-[52px] md:w-[52px]"
                style={{ background: "#fff", boxShadow: `0 0 0 2.5px ${C.ink}26` }}
              >
                <img
                  src={asset("logo-mark.webp")}
                  alt="ChemoGuard, NIS Kazakhstan, iGEM 2026"
                  width={36}
                  height={44}
                  className="h-[34px] w-auto md:h-[42px]"
                />
              </span>
              <span
                className="text-[23px] font-extrabold leading-none md:text-[29px]"
                style={{ fontFamily: DISPLAY, letterSpacing: "-0.015em", color: C.ink }}
              >
                Chemo<span style={{ color: C.red }}>Guard</span>
              </span>
            </Link>
          </div>

          {/* The rule under a label marks the group you are in. A label is a link to its group's first page; the
              arrow beside it, or the pointer resting on it, opens the menu of the pages in the group. */}
          <nav aria-label="Pages" className="hidden items-center gap-6 lg:flex xl:gap-9">
            {MENU.map((item) => {
              const first = item.pages[0] ?? "/";
              const active = item.pages.some(here);
              const plain = item.pages.length === 1;
              const label = (
                <Link
                  to={first}
                  aria-current={here(first) ? "page" : undefined}
                  onClick={() => setOpen(null)}
                  className="group relative block whitespace-nowrap py-2 text-[15px] font-bold"
                  style={{ color: C.ink }}
                >
                  {item.label}
                  <Underline active={active} />
                </Link>
              );
              // Every item is the same box, a menu or not, so all six labels sit on one line.
              if (plain)
                return (
                  <div key={item.label} className="flex items-center">
                    {label}
                  </div>
                );
              const shown = open === item.label;
              return (
                <div
                  key={item.label}
                  className="relative flex items-center gap-1"
                  onMouseEnter={() => setOpen(item.label)}
                  onMouseLeave={() => setOpen(null)}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget)) setOpen(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setOpen(null);
                  }}
                >
                  {label}
                  <button
                    type="button"
                    aria-label={`${item.label} menu`}
                    aria-expanded={shown}
                    // a pointer that can hover has already opened it by arriving, so a click there keeps it open
                    onClick={() =>
                      setOpen((was) =>
                        was === item.label && !window.matchMedia("(hover: hover)").matches
                          ? null
                          : item.label,
                      )
                    }
                    className="grid h-[22px] w-[18px] place-items-center"
                  >
                    <svg
                      width="11"
                      height="7"
                      viewBox="0 0 11 7"
                      aria-hidden="true"
                      className="transition-transform duration-200"
                      style={{ transform: shown ? "rotate(180deg)" : "none" }}
                    >
                      <path
                        d="M1 1 L5.5 5.5 L10 1"
                        fill="none"
                        stroke={C.ink}
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  {shown && (
                    <Panel
                      item={item}
                      end={item === MENU[MENU.length - 1]}
                      onGo={() => setOpen(null)}
                    />
                  )}
                </div>
              );
            })}
          </nav>

          <button
            type="button"
            aria-label={menu ? "Close menu" : "Menu"}
            aria-expanded={menu}
            onClick={() => setMenu((v) => !v)}
            className="flex size-9 shrink-0 items-center justify-center lg:hidden"
            style={{
              background: C.paper,
              border: `2.5px solid ${C.ink}`,
              borderRadius: R.sm,
              boxShadow: `3px 3px 0 ${C.ink}`,
            }}
          >
            <svg width="16" height="12" viewBox="0 0 16 12" aria-hidden="true">
              {/* three bars closed, a cross open, so the same button visibly closes it */}
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
          // Scrolls inside itself. The header is fixed on the story, so a menu taller than the window could not be
          // scrolled to: on a landscape phone the last rows were out of reach.
          className="relative z-[2] mx-5 mb-4 max-h-[calc(100dvh-6rem)] overflow-y-auto lg:hidden"
          style={{
            background: C.paper,
            border: `2.5px solid ${C.ink}`,
            borderRadius: R.md,
            boxShadow: `4px 4px 0 ${C.ink}`,
          }}
        >
          {/* The same groups as the desktop bar: a group of several pages gets its name above them. */}
          {MENU.map((item, g) => (
            <div key={item.label} style={{ borderTop: g ? `1.5px solid ${C.ink}22` : undefined }}>
              {item.pages.length > 1 && (
                <span className={`${L.note} block px-5 pt-3`} style={{ color: C.lavenderDeep }}>
                  {item.label}
                </span>
              )}
              {item.pages.map((to) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMenu(false)}
                  aria-current={here(to) ? "page" : undefined}
                  className={`flex w-full items-center justify-between px-5 text-left text-[15px] font-bold ${item.pages.length > 1 ? "py-2" : "py-3"}`}
                  style={{ color: C.ink }}
                >
                  {pageAt(to).label}
                  {/* A phone menu is a stack of rows with no baseline for a rule, so the current page gets a dot. */}
                  {here(to) && (
                    <span
                      aria-hidden="true"
                      className="block size-2 shrink-0 rounded-full"
                      style={{ background: C.ink }}
                    />
                  )}
                </Link>
              ))}
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
