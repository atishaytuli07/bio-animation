import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import { asset, C, L, T } from "@/components/hero/palette";
import { PageHero, type Art } from "@/components/story/PageHero";
import { NAV, PAGES } from "@/components/story/site-map";

/**
 * The frame every content page sits in.
 *
 * The story route paints its own header because that one is scroll-driven. A
 * content page has none of that, so it gets a plain static header here rather
 * than the story's bent into a shape it was not built for. What must NOT
 * diverge is the navigation, and it cannot: both are generated from the site
 * map, so a page appearing or being renamed shows up everywhere at once.
 *
 * The first version of this was a header, an h1 and some paragraphs. It was
 * honest and it was plain, and the client was right that plain is not enough:
 * the documentation pages do not need the homepage's storytelling, but they do
 * need to look like the same site, because they are judged beside wikis whose
 * every page opens with a composed hero and closes with a real footer.
 *
 * So a page now gets a hero, a section index that follows the reader, and a
 * footer — all built from vocabulary the story already owns.
 */

export function PageShell({
  title,
  lede,
  art,
  sections,
  children,
}: {
  title: string;
  lede: string;
  art: Art;
  /** Ids and labels for the index rail; must match the <Section id>s below. */
  sections: { id: string; label: string }[];
  children: ReactNode;
}) {
  const [menu, setMenu] = useState(false);
  const [active, setActive] = useState(sections[0]?.id ?? "");

  /*
    Which section the reader is in. An IntersectionObserver rather than a
    scroll handler, so this costs nothing per frame: the browser reports when a
    section crosses the line instead of us asking on every pixel of scroll.
  */
  useEffect(() => {
    const seen = new Map<string, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) seen.set(e.target.id, e.intersectionRatio);
        let best = "";
        let top = -1;
        for (const [id, ratio] of seen) if (ratio > top) [best, top] = [id, ratio];
        if (best && top > 0) setActive(best);
      },
      { rootMargin: "-25% 0px -60% 0px", threshold: [0, 0.5, 1] },
    );
    for (const s of sections) {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [sections]);

  return (
    <div className="min-h-screen" style={{ background: C.paper, color: C.ink }}>
      <header
        className="sticky top-0 z-40"
        style={{ background: C.paper, borderBottom: `2px solid ${C.ink}14` }}
      >
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

      <PageHero title={title} lede={lede} art={art} />

      <div className="mx-auto flex max-w-[92rem] gap-12 px-6 pb-24 pt-12 md:px-10 md:pt-16">
        {/*
          The section index. Competing wikis all carry one, and on a long
          documentation page it is the difference between a reader finding the
          part they came for and scrolling past it. Sticky, so it stays with
          them, and it marks where they are rather than only offering links.
        */}
        <aside className="hidden w-[15rem] shrink-0 xl:block">
          <nav className="sticky top-28">
            <span className={L.note} style={{ color: C.inkNote }}>
              On this page
            </span>
            <ul className="mt-4 space-y-1">
              {sections.map((s) => {
                const on = s.id === active;
                return (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="flex items-center gap-2.5 py-1.5 text-[14px] font-semibold transition-colors"
                      style={{ color: on ? C.redDeep : C.inkNote }}
                    >
                      <span
                        className="block h-[2px] shrink-0 transition-all"
                        style={{ width: on ? 18 : 9, background: on ? C.red : `${C.ink}44` }}
                      />
                      {s.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        <main className="min-w-0 max-w-3xl">{children}</main>
      </div>

      <SiteFooter />
    </div>
  );
}

/** A section of a content page. The id is what the index rail points at. */
export function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="mt-14 scroll-mt-28 first:mt-0 md:mt-16">
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
 * able to pass for a finished one at a glance, to a judge or to us. A TODO in
 * a comment is invisible on the deployed site; this is not.
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

/**
 * The footer, on every content page.
 *
 * Competing wikis close with one; ours closed with a thin rule and two links.
 * It carries the mark, the whole site map — including what is not written yet,
 * which is honest and also shows a judge the shape of the wiki — and the
 * attribution line iGEM expects to find.
 */
function SiteFooter() {
  return (
    <footer style={{ background: C.ink, color: C.paper }}>
      <div className="mx-auto max-w-[92rem] px-6 py-14 md:px-10 md:py-16">
        <div className="flex flex-wrap items-start justify-between gap-10">
          <div>
            <div className="flex items-center gap-2.5">
              <span
                className="grid h-[34px] w-[34px] shrink-0 place-items-center overflow-hidden rounded-full"
                style={{ background: "#fff" }}
              >
                <img
                  src={asset("logo-mark.webp")}
                  alt=""
                  width={28}
                  height={34}
                  className="h-[27px] w-auto"
                />
              </span>
              <span className="text-[20px] font-extrabold leading-none">
                Chemo<span style={{ color: C.redOnField }}>Guard</span>
              </span>
            </div>
            <p className="mt-4 max-w-[38ch] text-[14px] leading-relaxed" style={{ opacity: 0.72 }}>
              A pre-treatment test for DPYD variants, so a standard dose of fluoropyrimidine
              chemotherapy is never the first thing that tells you something is wrong.
            </p>
          </div>

          <nav>
            <span className={L.note} style={{ opacity: 0.6 }}>
              Pages
            </span>
            <ul className="mt-4 space-y-2">
              {PAGES.map((p) => (
                <li key={p.label}>
                  {p.ready ? (
                    <Link to={p.to} className="text-[14px] font-semibold hover:underline">
                      {p.label}
                    </Link>
                  ) : (
                    <span className="text-[14px] font-semibold" style={{ opacity: 0.4 }}>
                      {p.label}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div
          className="mt-12 flex flex-wrap items-center justify-between gap-3 pt-6 text-[13px]"
          style={{ borderTop: `1px solid ${C.paper}22`, opacity: 0.6 }}
        >
          <span>ChemoGuard · NIS Kazakhstan · iGEM 2026</span>
          <span>Content on this wiki is the team&rsquo;s own unless attributed.</span>
        </div>
      </div>
    </footer>
  );
}
