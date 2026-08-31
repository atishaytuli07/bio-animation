import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import { Cell, Enzyme, Molecule } from "@/components/hero/elements";
import { asset, C, L, T, R } from "@/components/hero/palette";
import { PageHero, type Art, type Plate } from "@/components/story/PageHero";
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
  plate,
  sections,
  children,
}: {
  title: string;
  lede: string;
  art: Art;
  /** Optional illustrated character for the hero. See PLATE in PageHero. */
  plate?: Plate | undefined;
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
              borderRadius: R.sm,
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

      <PageHero title={title} lede={lede} art={art} plate={plate} />

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

      <ClosingBand />
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
      className="rounded-[10px] px-4 py-3.5 md:px-5"
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
/**
 * The band that closes a content page, above the footer.
 *
 * Two figures lean in from the left and right edges with a gap between them,
 * and the page's last words sit in that gap. It is the one place on a
 * documentation page where the illustration is allowed to be the loudest thing,
 * because by then the reader has finished the content and the job of the frame
 * is to sign off rather than to inform.
 *
 * They are CROPPED BY THE EDGES on purpose — entering the frame rather than
 * posed inside it. A figure fully contained in a box reads as an illustration
 * placed on the page; one walking in from off-screen reads as the page having a
 * world that continues past it, which is the same idea the story's travelling
 * world is built on.
 *
 * The plate is a single wide cutout that already contains both figures with a
 * gap, so this costs one 98 kB image rather than two.
 */
function ClosingBand() {
  return (
    <section
      aria-hidden="true"
      className="relative overflow-hidden"
      style={{
        background: `linear-gradient(180deg, ${C.paper}, color-mix(in oklab, ${C.lavender} 16%, ${C.paper}))`,
        borderTop: `2px solid ${C.ink}14`,
      }}
    >
      {/*
        Two separate crops, one anchored to each edge.

        The source is a single wide plate with both figures and a gap between
        them, and used whole it puts them side by side in the middle of the band
        with empty space either side — posed in a frame, not entering one. Cut
        into two and pinned to opposite edges, each leans in from off-screen and
        the page's own width becomes the gap.
      */}
      <div className="relative flex h-[150px] items-center justify-center md:h-[210px]">
        <img
          src={asset("figure-left.webp")}
          alt=""
          draggable={false}
          className="pointer-events-none absolute bottom-0 left-0 h-[118%] w-auto max-w-none select-none md:left-[2vw]"
          style={{ transform: "translateX(-14%)" }}
        />
        {/*
          The mark sits in the gap the two of them leave.

          Without it the band is a hundred-odd pixels of empty cream between two
          figures looking at nothing, which reads as a layout that lost its
          middle. It is the wordmark rather than a new line of copy because the
          page has already said everything it has to say by this point, and a
          sign-off should close rather than add.

          Decorative, and the whole band is aria-hidden: the footer directly
          below announces the same name, and a screen reader does not need it
          twice.
        */}
        <span
          className="select-none text-[26px] font-extrabold leading-none md:text-[34px]"
          style={{ color: `${C.ink}1f`, letterSpacing: "-0.02em" }}
        >
          Chemo<span style={{ color: `${C.red}2e` }}>Guard</span>
        </span>
        <img
          src={asset("figure-right.webp")}
          alt=""
          draggable={false}
          className="pointer-events-none absolute bottom-0 right-0 h-[118%] w-auto max-w-none select-none md:right-[2vw]"
          style={{ transform: "translateX(14%)" }}
        />
      </div>
      {/*
        The figures meet the footer rather than floating above it: a short fade
        at the base sits them on the dark band below instead of leaving them
        hovering on a seam.
      */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-10"
        style={{ background: `linear-gradient(180deg, transparent, ${C.ink}22)` }}
      />
    </section>
  );
}

/**
 * The drifting band along the footer's floor.
 *
 * The one piece of purely ambient motion on a content page, and it is confined
 * here on purpose: the page's rule is that figures reveal once and then hold,
 * because motion that replays every time you pass it is the clearest tell of a
 * generated site. A footer is the exception worth making — the reader has
 * finished, nothing here is information, and a slow drift signs the page off
 * rather than competing with it.
 *
 * Built as one row duplicated and translated by exactly -50%, so the loop is
 * seamless with no popping at the wrap. It moves by transform, so it composites
 * instead of repainting, and `prefers-reduced-motion` stops it dead.
 *
 * The elements carry PAPER outlines rather than ink. Ink on the ink-coloured
 * footer is invisible — the same rule the story's type follows: paper on a dark
 * ground, ink on cream.
 */
const DRIFT = [
  /*
    Sizes, gaps, lifts and angles are all deliberately UNEVEN.

    An evenly spaced row at one size reads as a border pattern — the eye locks
    onto the repeat and it stops looking like objects and starts looking like
    wallpaper. Clustering them at mixed scales, with a few nearly touching and
    the occasional wider break, is what makes a drifting crowd read as a crowd.

    `gap` is the space BEFORE each item, in px. `lift` raises it off the floor.
  */
  { k: "cell", s: 0.78, tone: C.pink, gap: 0, lift: 0, rot: -6 },
  { k: "mol", s: 0.54, tone: C.coral, gap: 6, lift: 26, rot: 14 },
  { k: "enz", s: 0.68, tone: C.green, gap: 14, lift: 4, rot: -11 },
  { k: "mol", s: 0.86, tone: C.lavender, gap: 4, lift: 18, rot: 7 },
  { k: "cell", s: 0.46, tone: C.blue, gap: 34, lift: 2, rot: 12 },
  { k: "enz", s: 0.58, tone: C.green, gap: 8, lift: 30, rot: -16 },
  { k: "mol", s: 0.72, tone: C.coral, gap: 18, lift: 0, rot: 4 },
  { k: "cell", s: 0.62, tone: C.pink, gap: 5, lift: 22, rot: -9 },
  { k: "enz", s: 0.8, tone: C.green, gap: 26, lift: 8, rot: 10 },
  { k: "mol", s: 0.5, tone: C.lavender, gap: 7, lift: 34, rot: -13 },
  { k: "cell", s: 0.7, tone: C.blue, gap: 12, lift: 1, rot: 5 },
  { k: "mol", s: 0.6, tone: C.coral, gap: 30, lift: 20, rot: -7 },
] as const;

function FooterDrift() {
  const row = (key: string) => (
    <div key={key} className="flex shrink-0 items-end">
      {DRIFT.map((d, i) => (
        <span
          key={i}
          className="block shrink-0"
          style={{
            marginLeft: d.gap,
            transform: `translateY(${-d.lift}px) rotate(${d.rot}deg)`,
          }}
        >
          {d.k === "cell" ? (
            <Cell s={d.s} tone={d.tone} line={C.paper} />
          ) : d.k === "mol" ? (
            <Molecule s={d.s} tone={d.tone} line={C.paper} />
          ) : (
            <Enzyme s={d.s} tone={d.tone} line={C.paper} />
          )}
        </span>
      ))}
    </div>
  );
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative h-[104px] overflow-hidden md:h-[132px]"
    >
      {/*
        Sitting ON the floor, not through it. At bottom:-14px the row hung below
        the band and the overflow clipped it, so at the very end of the page —
        which is exactly where a reader sees this — the elements were sliced in
        half by the edge of the document.
      */}
      <div className="footer-drift absolute bottom-3 left-0 flex items-end">
        {row("a")}
        {row("b")}
      </div>
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="relative overflow-hidden" style={{ background: C.ink, color: C.paper }}>
      <div className="mx-auto max-w-[92rem] px-6 pb-4 pt-12 md:px-10 md:pt-14">
        {/*
          Mark, links, one line. The footer used to carry a paragraph restating
          the project alongside a vertical list of every page — a lot of reading
          at the point where the reader has stopped reading. What a judge needs
          from a footer is where else to go and whose wiki this is.
        */}
        <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-6">
          <Link to="/new" className="flex items-center gap-2.5">
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
          </Link>

          {/*
            Horizontal, and it still shows what is not written yet. A judge
            reading a dimmed "Safety" learns the shape of the wiki; a judge
            reading a link that goes nowhere learns it is broken.
          */}
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px] font-semibold">
            {PAGES.map((p) =>
              p.ready ? (
                <Link key={p.label} to={p.to} className="hover:underline">
                  {p.label}
                </Link>
              ) : (
                <span key={p.label} style={{ opacity: 0.4 }}>
                  {p.label}
                </span>
              ),
            )}
          </nav>
        </div>

        <div
          className="mt-8 flex flex-wrap items-center justify-between gap-3 pt-5 text-[13px]"
          style={{ borderTop: `1px solid ${C.paper}22`, opacity: 0.55 }}
        >
          <span>ChemoGuard · NIS Kazakhstan · iGEM 2026</span>
          <span>Content on this wiki is the team&rsquo;s own unless attributed.</span>
        </div>
      </div>

      <FooterDrift />
    </footer>
  );
}
