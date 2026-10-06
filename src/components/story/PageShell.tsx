import { Link, type LinkProps } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import { Cell, Enzyme, Molecule } from "@/components/hero/elements";
import { asset, C, DISPLAY, L, R, T } from "@/components/hero/palette";
import type { Slide } from "@/components/story/HeroCarousel";
import { PageHero, type Piece, type Plate } from "@/components/story/PageHero";
import { SiteHeader } from "@/components/story/SiteHeader";
import { PAGES } from "@/components/story/site-map";
import { WIKI } from "@/lib/wiki";

// The frame every content page sits in. The header is SiteHeader, the same component the story uses, so the
// navigation cannot diverge between the two: one bar, generated from the site map, on every page.
// A content page does not need the homepage's storytelling, but it has to look like the same site, since it is
// judged beside wikis whose every page opens with a composed hero and closes with a real footer. So a page gets
// a hero, a section index that follows the reader, and a footer, all built from vocabulary the story owns.

export function PageShell({
  title,
  lede,
  plate,
  piece,
  slides,
  sections,
  children,
}: {
  title: string;
  lede: string;
  /** Optional illustrated character for the hero. See PLATE in PageHero. */
  plate?: Plate | undefined;
  /** The one composed object this page's hero carries. See Piece in PageHero. */
  piece?: Piece | undefined;
  /** Photographs for the hero to open on, in place of the purple field. */
  slides?: readonly Slide[] | undefined;
  /** Ids and labels for the index rail; must match the <Section id>s below. */
  sections: { id: string; label: string }[];
  children: ReactNode;
}) {
  const [active, setActive] = useState(sections[0]?.id ?? "");

  // Which section the reader is in. An IntersectionObserver rather than a scroll handler, so it costs nothing
  // per frame: the browser reports when a section crosses the line instead of us asking on every pixel.
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
      <SiteHeader />

      <PageHero title={title} lede={lede} plate={plate} piece={piece} slides={slides} />

      <div className="mx-auto flex max-w-[92rem] gap-12 px-6 pb-24 pt-12 md:px-10 md:pt-16">
        {/* The section index. On a long documentation page it is the difference between a reader finding the part
            they came for and scrolling past it. Sticky, and it marks where they are rather than only offering links. */}
        <aside className="hidden w-[15rem] shrink-0 xl:block">
          <nav aria-label="On this page" className="sticky top-28">
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
                      aria-current={on ? "true" : undefined}
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

// The button at the foot of a content page, in two tones. This markup was copied into eleven places, so the
// one pressable style on these pages lived in eleven places too.
export function PageLink({
  to,
  tone = "primary",
  children,
}: {
  to: NonNullable<LinkProps["to"]>;
  tone?: "primary" | "quiet";
  children: ReactNode;
}) {
  return (
    <Link
      to={to}
      className="inline-block px-6 py-3 text-[15px] font-bold"
      style={{
        background: tone === "primary" ? C.redDeep : C.paper,
        color: tone === "primary" ? "#fff" : C.ink,
        border: `2.5px solid ${C.ink}`,
        borderRadius: R.sm,
        boxShadow: `4px 4px 0 ${C.ink}`,
      }}
    >
      {children}
    </Link>
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

// A block only the team can write, rendered visibly. An unfinished page must not be able to pass for a
// finished one, to a judge or to us, and a TODO in a comment is invisible on the deployed site.
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

// The band that closes a content page, above the footer. Two figures lean in from the left and right edges and
// the page's last words sit in the gap between them. It is the one place on a documentation page where the
// illustration is the loudest thing, because the reader has finished the content by then.
// They are cropped by the edges on purpose: a figure fully contained in a box reads as an illustration placed on
// the page, one walking in from off-screen reads as a world that continues past it.
// The plate is a single wide cutout containing both figures and the gap, so this costs one 98 kB image, not two.
export function ClosingBand() {
  return (
    <section
      aria-hidden="true"
      className="relative overflow-hidden"
      // No rule across the top. A 2px hairline drawn the full width of the page catches the eye before the sign-off
      // does, and it carried nothing: the gradient below starts at C.paper, the colour the content area ends on, so
      // the two meet cleanly and the band arrives as the page warming rather than as a new box.
      style={{
        background: `linear-gradient(180deg, ${C.paper}, color-mix(in oklab, ${C.lavender} 16%, ${C.paper}))`,
      }}
    >
      {/* Two separate crops, one anchored to each edge. The source is a single wide plate with both figures and a
          gap; used whole it puts them side by side in the middle with empty space either side. Cut in two and pinned
          to opposite edges, each leans in from off-screen and the page's own width becomes the gap. */}
      <div className="relative flex h-[150px] items-center justify-center md:h-[210px]">
        <img
          src={asset("figure-left.webp")}
          alt=""
          draggable={false}
          className="pointer-events-none absolute bottom-0 left-0 h-[118%] w-auto max-w-none select-none md:left-[2vw]"
          style={{ transform: "translateX(-14%)" }}
        />
        {/* The sign-off sits in the gap the two of them leave. Measured, that gap is 1047px at 1440 and 1489px at
            1900, 73% and 78% of the viewport, so whatever goes here has to be big enough to hold it.
            It used to be invisible: the wordmark was ink at 12% alpha, rgb(216,207,208) on the band's rgb(243,234,231),
            1.29:1, a 212px smudge adrift in 1489px of nothing. The strengths are chosen against the thresholds instead:
            the wordmark measures 3.6:1 and the red 3.1:1 against the 3:1 floor for large text, and the team line 6.0:1
            against the 4.5:1 floor for small text. Still quieter than body copy, but readable.
            NIS Kazakhstan is who made this, and the last thing a reader sees before the footer should say so.
            Decorative, and the band stays aria-hidden: the footer below announces the same name and the same team. */}
        <div className="relative z-10 flex select-none flex-col items-center gap-2 px-6 text-center">
          <span
            className="font-extrabold leading-none"
            style={{
              // The floor is set by the gap, not by legibility. At 1.9rem the wordmark measured 186px on a 390px phone and
              // left 13px between the "C" and the boy's arm: clearance passed, and it still read as cramped. The figures are
              // widest exactly where this line sits, so the phone end of the clamp gives. 4.2vw reaches the ceiling at about
              // 740px, so nothing above a small tablet moves.
              fontFamily: DISPLAY,
              fontSize: "clamp(1.55rem, 4.2vw, 3.1rem)",
              letterSpacing: "-0.03em",
              color: C.inkSignoff,
            }}
          >
            Chemo<span style={{ color: C.redSignoff }}>Guard</span>
          </span>
          <span className={L.note} style={{ color: C.inkBody }}>
            NIS Kazakhstan · iGEM 2026
          </span>
        </div>
        <img
          src={asset("figure-right.webp")}
          alt=""
          draggable={false}
          className="pointer-events-none absolute bottom-0 right-0 h-[118%] w-auto max-w-none select-none md:right-[2vw]"
          style={{ transform: "translateX(14%)" }}
        />
      </div>
      {/* No fade into the footer. A soft ink wash along the base was meant to sit the figures on the dark band, but
          a gradient ending at quarter-strength ink still meets a full-strength ink footer: the seam stays and a grey
          smear appears above it. Cream against ink is the cleanest edge, and the figures crop against it as if they
          were standing behind the footer. */}
    </section>
  );
}

// The drifting band along the footer's floor. The one piece of purely ambient motion on a content page, and it
// is confined here: figures elsewhere reveal once and then hold, because motion that replays every time you pass
// it is the clearest tell of a generated site. A footer is the exception, since the reader has finished.
// One row duplicated and translated by exactly -50%, so the second copy lands where the first began and there
// is no jump at the wrap. It moves by transform, so it composites instead of repainting, and
// prefers-reduced-motion stops it dead.
// The elements carry paper outlines: ink on the ink-coloured footer is invisible.
const DRIFT = [
  // Sizes, gaps, lifts and angles are deliberately uneven. An evenly spaced row at one size reads as a border
  // pattern: the eye locks onto the repeat and it stops looking like objects. Mixed scales, a few nearly touching
  // and the occasional wider break is what makes a drifting crowd read as a crowd.
  // gap is the space before each item, in px. lift raises it off the floor.
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
      {/* Sitting on the floor, not through it. At bottom:-14px the row hung below the band and the overflow clipped
          it, so at the very end of the page the elements were sliced in half by the edge of the document. */}
      <div className="footer-drift absolute bottom-3 left-0 flex items-end">
        {row("a")}
        {row("b")}
      </div>
    </div>
  );
}

// The footer, on every content page. It carries the mark, the whole site map including what is not written
// yet, which is honest and shows a judge the shape of the wiki, and the attribution line iGEM expects.
export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden" style={{ background: C.ink, color: C.paper }}>
      <div className="mx-auto max-w-[92rem] px-6 pb-4 pt-12 md:px-10 md:pt-14">
        {/* Mark, links, one line. The footer used to carry a paragraph restating the project beside a vertical list of
            every page, a lot of reading at the point where the reader has stopped. What a judge needs from a footer is
            where else to go and whose wiki this is. */}
        <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-6">
          {/* The mark, and directly under it who made this. The team used to appear only in the small grey line at the
              very bottom, the least read position on the page. On a competition wiki the team is the byline. */}
          <Link to="/" className="flex items-center gap-2.5">
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
            <span className="flex flex-col gap-1.5">
              {/* The brand red, the same one the header wears, not the on-field tint. redOnField exists because mid red goes
                  muddy on the deep purple of the story's field, and the footer inherited it by association. Measured on this
                  ground, #E03A3E gives 3.79:1 against C.ink, clearing the 3:1 floor this 20px/800 wordmark is held to, so the
                  pale tint was buying nothing and costing the mark its colour. */}
              <span
                className="text-[20px] font-extrabold leading-none"
                style={{ fontFamily: DISPLAY, letterSpacing: "-0.01em" }}
              >
                Chemo<span style={{ color: C.red }}>Guard</span>
              </span>
              {/* 0.7 against the legal line's 0.55 below: a real step, not the 0.05 that reads as two people picking a
                  number. This is who made the wiki; that is a licence note. */}
              <span className={L.note} style={{ opacity: 0.7 }}>
                NIS Kazakhstan · iGEM 2026
              </span>
            </span>
          </Link>

          {/* Horizontal, and it still shows what is not written yet. A judge reading a dimmed "Safety" learns the shape
              of the wiki; a judge reading a link that goes nowhere learns it is broken. */}
          <nav
            aria-label="All pages"
            className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px] font-semibold"
            style={{ fontFamily: DISPLAY }}
          >
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

        {/* No rule here either, and one line where there were two. The divider separated a row from a row that
            restated it: the left half read "ChemoGuard - NIS Kazakhstan - iGEM 2026" directly beneath a ChemoGuard
            wordmark. Delete the duplicate and the rule has nothing to hold apart. */}
        {/* The licence and the repository, which iGEM requires in the footer of every page: "The license link must
            appear in your wiki footer", and "Your wiki footer must include a visible link to your team's GitLab
            repository". The official template marks both MUST and asks that they are never removed. Underlined, because
            a link that looks like the rest of a grey line is a link a judge does not find. */}
        <div className="mt-10 space-y-1.5 text-[13px]" style={{ opacity: 0.72 }}>
          <p>
            Team-authored content on this wiki is licensed under{" "}
            <a href={WIKI.license.url} rel="license" className="underline underline-offset-2">
              {WIKI.license.name}
            </a>
            . Third-party material is credited where it appears.
          </p>
          <p>
            The source for this wiki is at{" "}
            {/* one unit: on a phone it broke at the hyphen, "nis-" / "kazakhstan" */}
            <a href={WIKI.repo} className="whitespace-nowrap underline underline-offset-2">
              {WIKI.repo.replace("https://", "")}
            </a>
            .
          </p>
        </div>
      </div>

      <FooterDrift />
    </footer>
  );
}
