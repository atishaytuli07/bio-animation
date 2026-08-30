import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";

import { asset, C, L, T } from "@/components/hero/palette";
import { NAV } from "@/components/story/site-map";

/**
 * The frame every content page sits in.
 *
 * The story route paints its own header because that header is scroll-driven —
 * it changes colour with the ground beneath it and carries a scrim. A content
 * page has none of that, so it gets a plain static header here rather than the
 * story's one bent into a shape it was not built for.
 *
 * What must NOT diverge is the navigation, and it cannot: both are generated
 * from the same site map, so a page appearing or being renamed shows up in
 * every header at once. That is the whole reason the map exists.
 *
 * Everything else — the type scale, the palette, the label spec, the hard
 * offset shadow — comes from the same tokens the story uses, so a reader
 * moving from the animation to a written page stays in one place.
 */
export function PageShell({
  title,
  lede,
  children,
}: {
  title: string;
  lede: string;
  children: ReactNode;
}) {
  const [menu, setMenu] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: C.paper, color: C.ink }}>
      <header className="border-b" style={{ borderColor: `${C.ink}1a` }}>
        <div className="mx-auto flex max-w-[92rem] items-center justify-between gap-6 px-6 py-4 md:px-10">
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
            <span className="text-[19px] font-extrabold leading-none md:text-[21px]">
              Chemo<span style={{ color: C.red }}>Guard</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            {NAV.map((page) =>
              page.ready ? (
                <Link
                  key={page.label}
                  to={page.to}
                  className="whitespace-nowrap text-[15px] font-bold"
                  style={{ color: C.ink }}
                >
                  {page.label}
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

          {/*
            Below lg this was a single "← Story" link, so a reader on a tablet
            or phone could leave a content page but could not reach any other
            one. That is fine with two pages and broken with six. Same menu the
            story route offers, same source of truth.
          */}
          <button
            type="button"
            aria-label="Menu"
            aria-expanded={menu}
            onClick={() => setMenu((v) => !v)}
            className="flex size-9 items-center justify-center lg:hidden"
            style={{
              background: C.paper,
              border: `2.5px solid ${C.ink}`,
              borderRadius: 8,
              boxShadow: `3px 3px 0 ${C.ink}`,
            }}
          >
            <svg width="16" height="12" viewBox="0 0 16 12" aria-hidden="true">
              {[1, 6, 11].map((y) => (
                <line
                  key={y}
                  x1="1"
                  y1={y}
                  x2="15"
                  y2={y}
                  stroke={C.ink}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              ))}
            </svg>
          </button>
        </div>
        {menu && (
          <div
            className="mx-6 mb-4 lg:hidden"
            style={{
              background: C.paper,
              border: `2.5px solid ${C.ink}`,
              borderRadius: 10,
              boxShadow: `4px 4px 0 ${C.ink}`,
            }}
          >
            {NAV.map((page, i) =>
              page.ready ? (
                <Link
                  key={page.label}
                  to={page.to}
                  onClick={() => setMenu(false)}
                  className="block w-full px-5 py-3 text-left text-[15px] font-bold"
                  style={{ color: C.ink, borderTop: i ? `1.5px solid ${C.ink}22` : undefined }}
                >
                  {page.label}
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

      <main className="mx-auto max-w-3xl px-6 pb-24 pt-14 md:px-10 md:pt-20">
        <h1 className="font-black" style={{ ...T.headline, color: C.ink }}>
          {title}
        </h1>
        <p
          className="mt-5 max-w-[62ch] text-[16px] leading-relaxed md:text-[18px]"
          style={{ color: C.inkBody }}
        >
          {lede}
        </p>
        {children}
      </main>

      <footer className="px-6 py-10 md:px-10" style={{ borderTop: `2px solid ${C.ink}18` }}>
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-4">
          <span className="text-[13px] font-semibold" style={{ color: C.inkNote }}>
            ChemoGuard · iGEM 2026
          </span>
          <Link
            to="/attributions"
            className="text-[13px] font-bold underline-offset-4 hover:underline"
            style={{ color: C.redDeep }}
          >
            Attributions
          </Link>
        </div>
      </footer>
    </div>
  );
}

/** A section of a content page. */
export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-12 md:mt-16">
      <h2 className="font-black" style={{ ...T.sub, color: C.ink }}>
        {title}
      </h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

/** Body copy, at the one size content pages use. */
export function P({ children }: { children: ReactNode }) {
  return (
    <p
      className="max-w-[62ch] text-[15px] leading-relaxed md:text-[17px]"
      style={{ color: C.inkBody }}
    >
      {children}
    </p>
  );
}

/**
 * A block only the team can write, rendered VISIBLY.
 *
 * The same decision as the Attributions page: an unfinished page must not be
 * able to pass for a finished one at a glance, either to a judge or to us. A
 * TODO in a comment is invisible on the deployed site; this is not.
 */
export function Awaiting({ what, children }: { what: string; children?: ReactNode }) {
  return (
    <div
      className="rounded-lg px-4 py-3.5 md:px-5"
      style={{ background: `${C.red}0d`, border: `2px dashed ${C.red}66` }}
    >
      <span className={L.note} style={{ color: C.redDeep }}>
        {what}
      </span>
      {children && (
        <div
          className="mt-2 max-w-[62ch] text-[14px] leading-relaxed md:text-[15px]"
          style={{ color: C.inkBody }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
