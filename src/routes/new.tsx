import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { Helix } from "@/components/hero/Helix";
import { Sequence } from "@/components/hero/Sequence";
import { TwoPeople } from "@/components/story2/TwoPeople";
import { Why } from "@/components/story3/Why";
import { NAV, PAGES } from "@/components/story/site-map";
import { Ground } from "@/components/story/Ground";
import { World } from "@/components/story/World";
import { usePageProgress } from "@/hooks/use-page-progress";
import { band, easeOut, range, useSmoothProgress } from "@/hooks/use-scroll-progress";
import { Cell, Enzyme, Molecule } from "@/components/hero/elements";
import { asset, C, L, T } from "@/components/hero/palette";

/**
 * /new — the hero concept, built to the Production Brief.
 *
 * Everything here is drawn in code as SVG. No three.js: the old WebGL helix was
 * slow to load and read as generic, and an SVG strand can morph, recolour and
 * animate — which is what "the visuals carry the story" actually requires.
 *
 * The composition follows the client's hero checklist literally:
 *   · a large, immediately recognisable DNA visual
 *   · ChemoGuard branding
 *   · a short headline, not a page dominated by text
 *   · red/white identity plus coral, pink, blue, lavender, green
 *   · sophisticated illustrated scientific elements
 *   · much less empty background
 *
 * The notation idea from the brief is applied here: the rungs are coloured by
 * base-pair convention, and exactly ONE rung is ChemoGuard red — the variant.
 * Red is never used decoratively anywhere on this page, so the eye finds the
 * one thing that is wrong without a word of explanation. No jargon in the hero;
 * the reader should be curious, not taught.
 */

export const Route = createFileRoute("/new")({
  head: () => ({
    /*
      The title and the noindex were both set when this route was a
      work-in-progress preview sitting beside the old homepage. It is the
      homepage now: it needs a title a judge can read in a tab and a browser
      history, and it should not be asking search engines to ignore it.
    */
    meta: [
      { title: "ChemoGuard: one gene decides your dose" },
      {
        name: "description",
        content:
          "A DPYD variant can reduce how fast the body clears fluoropyrimidine chemotherapy. Follow the gene, the enzyme and the drug — and see why testing comes before the first dose.",
      },
      { property: "og:title", content: "ChemoGuard: one gene decides your dose" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: HeroConcept,
});

/**
 * Display stack.
 *
 * INTERIM. The single biggest remaining gap versus the reference wikis is that
 * they all have a real display face with personality — Wuxi's marker, KCIS's
 * custom lettering, GlycoGarden's rounded geometric — and this is a stack of
 * whatever happens to be installed. It prefers geometric-rounded faces so the
 * page leans warm rather than neutral, but it will render differently on every
 * machine, which is not acceptable for a design-critical page.
 *
 * The fix is one self-hosted font file. iGEM bans external CDNs (Google Fonts
 * included), so it has to be self-hosted regardless — this is required work,
 * not a nice-to-have.
 */
const DISPLAY =
  '"Avenir Next", Avenir, "Century Gothic", "URW Gothic", Futura, "Trebuchet MS", ui-rounded, system-ui, sans-serif';

/**
 * A hand-drawn underline, the signature detail of Wuxi's navigation.
 *
 * The point is that it is NOT a straight rule. Each one is a slightly
 * different squiggle — the control points are derived from the item's index so
 * no two match — which is what makes it read as drawn by a person rather than
 * generated. It also overshoots the word at both ends, the way a marker
 * stroke does.
 */
function Underline({ index, active = false }: { index: number; active?: boolean }) {
  const wob = ((index * 37) % 7) - 3; // −3…3, deterministic per item
  const lift = ((index * 23) % 5) - 2;
  return (
    <svg
      viewBox="0 0 100 10"
      preserveAspectRatio="none"
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-[-8%] bottom-0 h-[9px] w-[116%] origin-left transition-[opacity,transform] duration-300"
      style={{
        opacity: active ? 1 : 0,
        transform: active ? "scaleX(1)" : "scaleX(0.55)",
      }}
      data-underline=""
    >
      <path
        d={`M2 ${6 + lift * 0.3} C 24 ${3 + wob}, 48 ${8 - wob * 0.6}, 72 ${5 + wob * 0.4} S 92 ${7 - lift * 0.4}, 98 ${5 + lift * 0.2}`}
        fill="none"
        stroke={C.coral}
        strokeWidth={3.4}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/**
 * The journey, as the client described it: "follow the highlighted DPYD region
 * into the DNA and gradually discover why two people can respond differently
 * to the same treatment, then move into detection and finally ChemoGuard."
 *
 * Only the first stop is built. The rest are listed because the progress rail
 * has to show a whole journey to mean anything — a reader needs to see where
 * they are going, not just where they are.
 */
/**
 * Quantise a scroll-driven value to 20 steps.
 *
 * A value that changes by a thousandth every frame repaints exactly as hard as
 * one that changes by a tenth — so fades that are driven continuously by
 * scroll cost a full repaint per frame for a difference nobody can see. Twenty
 * steps is smooth to the eye and a twentieth of the work.
 */
const q = (v: number) => Math.round(v * 20) / 20;

/** The page the hero's second button promises, once it exists. */
const DESCRIPTION = PAGES.find((p) => p.to === "/description");

const JOURNEY = [
  "The gene",
  "The enzyme",
  "Two people",
  "Inside the body",
  "Before the first dose",
] as const;

/**
 * The scale stops named during the descent.
 *
 * These are textbook and citable: the human haploid genome is about 3.1
 * billion base pairs, and DPYD sits at 1p21.3. The figure reads "about 3
 * billion" rather than "3,000,000,000" — the exact-looking number implied a
 * precision the rounded figure does not have, and a wiki that fakes precision
 * invites a judge to check the one number that is wrong.
 *
 * The team should still attach its own citation before the freeze; that is a
 * medal criterion, not just good manners.
 */
const SCALE_STOPS = [
  // in/out are scroll positions; each is fully retired before the next arrives.
  // Overlapping them stacked two labels at the same coordinates.
  { label: "Your genome", note: "about three billion letters", in: 0.34, out: 0.42 },
  { label: "Chromosome 1", note: "1p21.3", in: 0.48, out: 0.56 },
  { label: "DPYD", note: "builds the enzyme that clears the drug", in: 0.6, out: 0.68 },
] as const;

/**
 * The story progress rail: a hairline across the very top that fills as the
 * reader moves through the whole journey, not through one section.
 *
 * It carried the five stop names for a while, and they had to go. They sat in
 * the same band as the header, so on a shorter viewport they crowded the
 * wordmark and shoved the chapter badge up underneath it. "Subtle" was the
 * client's own word — a bar is subtle, a second row of navigation is not, and
 * every section already states its own name in its numbered label.
 */
/**
 * The story rail: where you are, and what you are looking at, in one place.
 *
 * The client found the small left-hand labels confusing on first viewing, and
 * the diagnosis is that there were TWO systems dressed identically: chapter
 * labels ("01 · THE GENE") and scale annotations inside the diagram ("YOUR
 * GENOME"), both small, uppercase and letterspaced, so neither read as a
 * system. She also pointed out that "03 · LOOK CLOSER" sat next to a headline
 * reading "Look closer." — the same words twice.
 *
 * So the chapter labels are gone from the scenes and live here instead, in the
 * one place that already meant "where am I in the story". The annotations
 * inside the diagram keep their own look, and now they are the only thing that
 * looks like that.
 */
/*
  Chapter names are deliberately NOT the same words as the headline of the
  scene they cover. "04 · Look closer" sitting above a headline reading "Look
  closer." was the client's own complaint about redundancy, and renaming the
  per-scene label into the rail had simply relocated it.
*/
const CHAPTERS = [
  { at: 0.0, n: "01", name: "The gene" },
  { at: 0.203, n: "02", name: "The enzyme" },
  { at: 0.276, n: "03", name: "Two people" },
  { at: 0.509, n: "04", name: "Inside the body" },
  // Not a new section — the same scene, after it turns. The rail names the
  // argument even though the picture never restarts.
  { at: 0.84, n: "05", name: "Before the first dose" },
] as const;

function StoryProgress() {
  const p = usePageProgress(200);
  const chapter = [...CHAPTERS].reverse().find((c) => p >= c.at) ?? CHAPTERS[0];

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-40">
      <div className="h-[3px] w-full" style={{ background: `${C.ink}12` }}>
        <div
          className="h-full origin-left"
          style={{
            width: `${(p * 100).toFixed(1)}%`,
            background: `linear-gradient(90deg, ${C.lavender}, ${C.coral}, ${C.red})`,
          }}
        />
      </div>
      {/*
        The name rides just under the bar, and only once the reader has left the
        opening screen — the hero states the chapter itself and does not need
        telling twice.
      */}
      {/*
        Pinned to the SAME coordinate the per-scene labels used, which is also
        the first line clear of the header. At `pt-3` it sat directly on top of
        the logo — the bar is fixed to the very top of the viewport and the
        header is right underneath it.
      */}
      <div className={L.label} style={{ opacity: q(easeOut(range(p, 0.062, 0.11))) }}>
        <span
          className={L.labelType}
          style={{
            color: p > 0.06 && p < 0.6 ? C.paper : C.redDeep,
            transition: "color 400ms ease",
          }}
        >
          <span
            className="block h-0.5 w-7"
            style={{
              background: p > 0.06 && p < 0.6 ? C.paper : C.red,
              transition: "background 400ms ease",
            }}
          />
          {chapter.n} · {chapter.name}
        </span>
      </div>
    </div>
  );
}

/** Scattered field of scientific elements — the "much less empty background". */
const FIELD = [
  /*
    DELIBERATELY FEW. The hero was running this array, a separate DOTS layer,
    and the global World all at once — 58 drifting elements on the one screen
    whose copy is left-aligned rather than centred. Three of them sat directly
    on the paragraph, the button and the chapter label. What survives here is
    only what the global world cannot do: objects that straddle the cream/purple
    seam, which is what stops that edge reading as a wall.

    Positions are percentages of the viewport, and the layout changes shape at
    md: side-by-side above it, stacked below. Objects tuned for the seam
    therefore land on the copy once the columns stack, so the ones that would
    collide are marked `hideSm` and simply do not render on phones. Fewer
    objects on a small screen is the right answer anyway.

    depth: 0 = far (small, soft, barely moves) … 1 = near (large, sharp, moves most)
  */
  { k: "enz", x: 72, y: 12, s: 0.5, r: 10, tone: C.green, depth: 0.5 },

  /*
    Straddling the seam. The field's edge sits near x = 42%, so these sit ON
    it: half on cream, half on the purple. That is what stops the boundary
    reading as a wall — the world carries across it. They are the nearest
    objects in the scene, so they travel furthest with the pointer and read as
    being in front of both sides.
  */
  { k: "mol", x: 43, y: 20, s: 0.74, r: -14, tone: C.coral, depth: 1 },
  { k: "cell", x: 41, y: 79, s: 0.72, r: 8, tone: C.pink, depth: 0.92, hideSm: true },
  { k: "enz", x: 56, y: 47, s: 0.42, r: 16, tone: C.green, depth: 0.36, hideSm: true },

  // deep in the field: small, soft, slow
  { k: "cell", x: 95, y: 72, s: 0.5, r: -8, tone: C.blue, depth: 0.3, hideSm: true },
  { k: "mol", x: 90, y: 16, s: 0.38, r: 20, tone: C.coral, depth: 0.2 },
] as const;

/* --------------------------------------------------------------- the page */

function HeroConcept() {
  const stage = useRef<HTMLElement>(null);
  const [track, p] = useSmoothProgress<HTMLElement>(0.1);
  /*
    Sections overlap by a viewport so the next scene begins the instant this
    one lands — but overlap alone is a collision, not a transition. This is the
    dissolve, measured against the real boundary at 0.31: scene one releases
    the frame exactly as the patients rise into it, and only after its own
    closing line has finished arriving.
  */
  const pageP = usePageProgress();
  const handoff = range(pageP, 0.196, 0.231);
  /** True while the ground is the deep field rather than cream. */
  const onField = pageP > 0.06 && pageP < 0.6;

  /* ---- one section, four beats -------------------------------------------
     The principle: THE SCROLL IS THE MICROSCOPE. The reader's own hand is what
     magnifies, which is what makes the interaction mean something rather than
     decorate something — and it is the only reason a story about scale can be
     told by scrolling at all.

       A  the descent begins, and the strand is named: your genome
       B  structure resolves; the annotation narrows to chromosome 1 · DPYD
       C  the helix folds shut and the sequence assembles, readable
       D  one letter changes, and the stakes land

     The drama of DPYD is scale: three billion letters, and one of them decides
     whether a standard dose treats you or harms you. That is the idea this
     screen exists to carry, and nothing before it says so.                  */
  const heroOut = 1 - range(p, 0.06, 0.2);
  const zoom = range(p, 0.12, 0.66);
  const focus = range(p, 0.44, 0.72);
  const flatten = range(p, 0.66, 0.8);
  const assemble = range(p, 0.7, 0.88);
  const flip = range(p, 0.86, 0.94);
  const closing = range(p, 0.9, 0.98);
  // Her phrase, once, before the annotations start narrating. It is fully
  // gone by 0.36 so it never shares the frame with a scale label.
  const followIn = band(p, 0.16, 0.24, 0.3, 0.36);
  // The cream side gives way as we travel in, so the two halves become one
  // space rather than staying a split screen.
  const merge = range(p, 0.08, 0.44);
  // How far inward the reader has travelled; the ambient scene defers to it.
  const travel = range(p, 0.12, 0.6);
  // Objects clear out well before the first annotation lands.
  const ambientOut = range(p, 0.06, 0.26);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const el = stage.current;
    if (!el) return;
    let raf = 0;
    let tx = 0;
    let ty = 0;
    const target = { x: 0, y: 0 };

    // The loop stops once the easing has caught up with the pointer and
    // restarts on the next move. A rAF that runs forever writing values that
    // are not changing is pure waste, and this page already runs one for the
    // strand.
    const start = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onMove = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = (e.clientY / window.innerHeight) * 2 - 1;
      start();
    };
    const tick = () => {
      tx += (target.x - tx) * 0.05;
      ty += (target.y - ty) * 0.05;
      el.style.setProperty("--px", (tx * 26).toFixed(2) + "px");
      el.style.setProperty("--py", (ty * 18).toFixed(2) + "px");
      if (Math.abs(target.x - tx) < 0.001 && Math.abs(target.y - ty) < 0.001) {
        raf = 0; // settled — nothing left to write until the pointer moves
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    start();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  // The affordance hint retires the moment the visitor proves they don't need
  // it — the same move as Wuxi's "Scroll to follow the signal".
  const [dragged, setDragged] = useState(false);
  const [menu, setMenu] = useState(false);

  return (
    <main
      ref={stage}
      className="relative [&_*]:[-webkit-tap-highlight-color:transparent]"
      style={
        {
          // Grain as a background LAYER, not a blended overlay. A
          // mix-blend-mode across the viewport measured at ~19fps of cost,
          // because it forces the whole stacking context to re-composite
          // every frame. As a background image it costs nothing.
          // Grain only. The COLOUR now lives in <Ground />, one continuous
          // surface under the whole story — see that file for why.
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='0.1'/%3E%3C/svg%3E")`,
          color: C.ink,
          "--paper-c": C.paper,
          "--ink-c": C.ink,
        } as React.CSSProperties
      }
    >
      <Ground />
      <World />

      <StoryProgress />

      {/*
        ONE section. The client asked to follow the gene as the homepage's
        central idea, so this is that transition built once and proven before
        anything downstream is committed to: a tall track with a pinned stage,
        and every beat driven by scroll position rather than by a timer.
      */}
      <section ref={track} style={{ height: "420vh" }} className="relative">
        <div
          className="sticky top-0 h-screen overflow-hidden"
          style={{ opacity: 1 - q(handoff), visibility: handoff > 0.99 ? "hidden" : "visible" }}
        >
          {/*
        A committed colour field with a hard edge, not a gradient mesh. Every
        reference wiki does this — GlycoGarden meets green to blue on a crisp
        horizon, KCIS is one flat blue, Wuxi is flat cream. A soft pastel wash
        is what a page looks like when it has not decided on a colour, and it
        is the single strongest "AI-generated" tell.

        The field is lavender because lavender means genetics everywhere on
        this site — so the strand sits literally inside its own meaning.
      */}
          <div
            aria-hidden="true"
            className="field pointer-events-none absolute"
            style={{
              // Widening as the journey starts: the two halves stop being a split
              // screen and become one space. This is the client's "the two sides
              // feel more connected" taken to its conclusion.
              ["--merge" as string]: merge,
              /*
                And then it hands over. Once merged, this field is a
                full-screen OPAQUE rectangle sitting on top of <Ground /> and
                <World /> — which is exactly why the descent and the sequence
                arrival looked like an object alone in a void. It dissolves
                into the ground, which is already running the same
                lavender→lavenderDeep by then, so the swap is invisible and the
                travelling world becomes visible behind the strand.
              */
              opacity: 1 - range(merge, 0.72, 1),
              // Striping layered over the field, the way GlycoGarden stripes its
              // green. It is barely visible and it is the difference between a
              // colour and a surface.
              //
              // It also drifts, very slowly. This is the one exception to the
              // "no ambient motion" rule and it earns it: a continuous surface
              // moving reads as LIGHT passing over the scene, where discrete
              // objects bobbing read as things jiggling. 48s per cycle, so you
              // register it as atmosphere rather than as animation.
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='0.1'/%3E%3C/svg%3E"), linear-gradient(160deg, ${C.lavender}, ${C.lavenderDeep})`,
            }}
          >
            {/*
          The drifting stripes live on their own child and move by transform.
          Animating background-position repaints the entire field every frame
          (~9fps); a transform is composited and repaints nothing.
        */}
            <span className="sheen absolute inset-x-0 top-0 block h-[300%]" />
          </div>
          {/* a thin ink keyline along the field edge — the reference wikis all
          outline their shapes rather than letting them dissolve */}
          <div
            aria-hidden="true"
            className="field pointer-events-none absolute"
            style={{
              // Widening as the journey starts: the two halves stop being a split
              // screen and become one space. This is the client's "the two sides
              // feel more connected" taken to its conclusion.
              ["--merge" as string]: merge,
              border: `3px solid ${C.ink}`,
              opacity: 0.14,
            }}
          />

          {/* the scientific world, drifting */}
          <div aria-hidden="true" className="absolute inset-0">
            {FIELD.map((f, i) => (
              <div
                key={i}
                className={`parallax absolute enter${"hideSm" in f && f.hideSm ? " max-md:hidden" : ""}`}
                style={{
                  left: `${f.x}%`,
                  top: `${f.y}%`,
                  // Custom properties: the entrance keyframe restores the object's
                  // own rotation instead of flattening it, and --d drives how far
                  // this object travels with the pointer.
                  ["--rot" as string]: `${f.r}deg`,
                  ["--d" as string]: f.depth,
                  animationDelay: `${240 + i * 90}ms`,
                  // Far objects sit back: softer, slightly desaturated, blurred a
                  // touch. Near objects are sharp and cast a shadow.
                  // The ambient world thins as the journey goes inward: we are
                  // leaving the bloodstream for the gene, and the nearest
                  // objects — which would otherwise sail past the camera —
                  // clear out first.
                  opacity: q((0.45 + f.depth * 0.55) * (1 - ambientOut)),
                  // Out of paint once faded: for most of this section these are
                  // invisible but were still filtered and composited every
                  // frame. Kept MOUNTED though — unmounting made them replay
                  // their staggered entrance every time the reader scrolled
                  // back up to the hero.
                  display: ambientOut > 0.99 ? "none" : undefined,
                  filter:
                    f.depth > 0.7
                      ? `drop-shadow(0 ${(6 * f.depth).toFixed(1)}px ${(10 * f.depth).toFixed(1)}px rgba(36,28,46,0.22))`
                      : `blur(${((1 - f.depth) * 1.6).toFixed(2)}px)`,
                }}
              >
                {f.k === "cell" ? (
                  <Cell s={f.s} tone={f.tone} />
                ) : f.k === "mol" ? (
                  <Molecule s={f.s} tone={f.tone} />
                ) : (
                  <Enzyme s={f.s} tone={f.tone} />
                )}
              </div>
            ))}
          </div>

          {/* ---------------------------------------------------------- nav */}
          {/*
            A scrim under the header, arriving with the descent. At hero scale
            the header sits on flat colour and needs nothing; once the strand
            has grown it passes straight through "Wet Lab" and "Human
            Practices", and navigation that cannot be read is worse than
            navigation that is not there.
          */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 z-20 h-32"
            style={{
              background: `linear-gradient(to bottom, ${C.lavenderDeep}b3, transparent)`,
              opacity: q(travel),
            }}
          />

          <header className="absolute inset-x-0 top-0 z-30 mx-auto flex max-w-[92rem] items-center justify-between px-6 py-5 md:px-10 md:py-7">
            <div className="flex items-center gap-2.5">
              {/*
            The team's own emblem — DNA dissolving into hexagons above a
            handheld reader, held in two hands. Note it already contains the
            same two ideas this hero is built on: the strand and the molecule.
            White keyed out of the supplied JPEG and un-premultiplied, so the
            edges stay red instead of going pink on a coloured ground.
          */}
              {/*
                On a white chip, because the supplied artwork is transparent
                wherever it should be white — the reader's screen and the whole
                inside of the ring are alpha 0, so on the purple ground the
                page showed through and the mark lost its structure. Compositing
                it onto white restores the original, and the chip keeps it
                legible on every ground the story passes through.
              */}
              <span
                className="grid h-[34px] w-[34px] shrink-0 place-items-center overflow-hidden rounded-full md:h-[40px] md:w-[40px]"
                style={{ background: "#fff", boxShadow: `0 0 0 2px ${C.ink}1f` }}
              >
                <img
                  src={asset("logo-mark.webp")}
                  alt="ChemoGuard — NIS Kazakhstan, iGEM 2026"
                  width={30}
                  height={36}
                  className="h-[27px] w-auto md:h-[32px]"
                />
              </span>
              <span
                className="text-[21px] font-extrabold leading-none"
                style={{
                  fontFamily: DISPLAY,
                  letterSpacing: "-0.01em",
                  /*
                    The wordmark obeys the same rule as every other word on the
                    site: ink on cream, paper on the field. It was pinned to ink
                    at md and up by a media query, which is right for the hero's
                    cream half and wrong the moment the field merges to full
                    purple underneath it.
                  */
                  color: onField ? C.paper : C.ink,
                  transition: "color 400ms ease",
                }}
              >
                Chemo<span style={{ color: C.red }}>Guard</span>
              </span>
              <span
                className="hidden text-[10px] tracking-[0.22em] opacity-60 sm:inline"
                style={{
                  fontFamily: DISPLAY,
                  color: onField ? C.paper : C.ink,
                  transition: "color 400ms ease",
                }}
              >
                iGEM 2026
              </span>
            </div>
            {/* These links sit over the deep field, so they are paper-white, not
            ink — dark type on the purple was unreadable. */}
            <nav
              // lg, not md: six items overflow a 768px viewport and the last
              // two were clipped off the right edge.
              className="hidden items-center gap-9 lg:flex"
              style={{ color: C.paper, fontFamily: DISPLAY }}
            >
              {/*
                Generated from the site map, not a hard-coded list. A page that
                is not written yet renders as plain dimmed text with no link and
                no pointer — an honest "not here yet" rather than a control that
                silently does nothing, which is what these five were.
              */}
              {NAV.map((page, i) =>
                page.ready ? (
                  <Link
                    key={page.label}
                    to={page.to}
                    className="group relative whitespace-nowrap pb-2 text-[16px] font-bold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
                    style={{ letterSpacing: "0.01em", fontFamily: "inherit", color: "inherit" }}
                  >
                    {page.label}
                    <Underline index={i} active={page.to === "/new"} />
                  </Link>
                ) : (
                  <span
                    key={page.label}
                    aria-disabled="true"
                    title="Not written yet"
                    className="whitespace-nowrap pb-2 text-[16px] font-bold"
                    style={{ letterSpacing: "0.01em", fontFamily: "inherit", opacity: 0.45 }}
                  >
                    {page.label}
                  </span>
                ),
              )}
            </nav>

            {/* Phones had no navigation at all — the links were simply hidden below
            md. For an iGEM wiki that is the worst possible thing to drop on
            small screens, since findability is a judging criterion. */}
            <button
              type="button"
              aria-label="Menu"
              aria-expanded={menu}
              onClick={() => setMenu((v) => !v)}
              className="flex size-10 items-center justify-center lg:hidden"
              style={{
                background: C.paper,
                border: `2.5px solid ${C.ink}`,
                borderRadius: 8,
                boxShadow: `3px 3px 0 ${C.ink}`,
              }}
            >
              <svg width="18" height="14" viewBox="0 0 18 14" aria-hidden="true">
                {(menu ? [7] : [1, 7, 13]).map((y, i) => (
                  <line
                    key={i}
                    x1="1"
                    y1={y}
                    x2="17"
                    y2={y}
                    stroke={C.ink}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                ))}
              </svg>
            </button>
          </header>

          {menu && (
            <div
              className="absolute inset-x-6 top-[74px] z-30 lg:hidden"
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
                    style={{
                      fontFamily: DISPLAY,
                      color: C.ink,
                      borderTop: i ? `1.5px solid ${C.ink}22` : undefined,
                    }}
                  >
                    {page.label}
                  </Link>
                ) : (
                  <span
                    key={page.label}
                    aria-disabled="true"
                    className="flex w-full items-center justify-between px-5 py-3 text-left text-[15px] font-bold"
                    style={{
                      fontFamily: DISPLAY,
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

          {/* --------------------------------------------------------- hero */}
          <div className="relative z-10 mx-auto grid h-full max-w-[92rem] items-center gap-3 px-6 pb-8 pt-24 md:grid-cols-[1.05fr_0.95fr] md:gap-8 md:px-10 md:pb-24 md:pt-28">
            <div
              className="order-2 md:order-1"
              style={{
                opacity: q(heroOut),
                transform: `translateY(${((1 - heroOut) * -28).toFixed(1)}px)`,
                visibility: heroOut < 0.02 ? "hidden" : "visible",
              }}
            >
              {/*
            A chapter label, not a control. It used to carry the same paper
            fill, ink border and hard offset shadow as the secondary button —
            two different affordances wearing one appearance, which made the
            page ambiguous about what could be pressed. The offset shadow now
            means exactly one thing: pressable.

            Neither reference wiki boxes its chapter label. Wuxi's "02 · HOW
            THE KIDNEY WORKS" and GlycoGarden's "ACT I — WHY GLYCANS MATTER"
            are plain letterspaced colour, and so is this.
          */}
              <span className={L.labelType} style={{ fontFamily: DISPLAY, color: C.redDeep }}>
                <span className="block h-0.5 w-7" style={{ background: C.red }} />
                01 · The gene
              </span>

              <h1
                className="mt-4 font-black md:mt-7"
                style={{
                  ...T.display,
                }}
              >
                It starts <br />
                with one <br />
                <span style={{ color: C.red }}>gene.</span>
              </h1>

              <p
                className="mt-4 max-w-md text-[16px] font-medium leading-relaxed md:mt-6 md:text-[17px]"
                style={{ color: C.inkBody }}
              >
                One gene sets how fast your body clears a widely used chemotherapy drug. For some
                people, a standard dose is more than they can handle.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3 md:mt-8">
                <button
                  className="px-6 py-3 text-[15px] font-bold text-white transition-transform hover:-translate-y-0.5"
                  style={{
                    fontFamily: DISPLAY,
                    background: C.redDeep,
                    border: `2.5px solid ${C.ink}`,
                    borderRadius: 6,
                    boxShadow: `4px 4px 0 ${C.ink}`,
                  }}
                  onClick={() => {
                    /*
                      This did nothing at all. It is the site's primary call to
                      action, sitting under the headline on the opening screen,
                      and pressing it was silent — the same fault as the five
                      nav buttons. It now starts the descent.
                    */
                    const quiet = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                    window.scrollTo({
                      top: window.innerHeight * 1.1,
                      behavior: quiet ? "auto" : "smooth",
                    });
                  }}
                >
                  Follow the gene
                </button>
                {/*
                  The second call to action pointed nowhere either. It is
                  rendered from the site map, so it appears the moment the page
                  it promises exists and stays absent until then — one working
                  button beats one working button and one that lies.
                */}
                {DESCRIPTION?.ready && (
                  <Link
                    to={DESCRIPTION.to}
                    className="px-6 py-3 text-[15px] font-bold transition-transform hover:-translate-y-0.5"
                    style={{
                      fontFamily: DISPLAY,
                      background: C.paper,
                      color: C.ink,
                      border: `2.5px solid ${C.ink}`,
                      borderRadius: 6,
                      boxShadow: `4px 4px 0 ${C.ink}`,
                    }}
                  >
                    Explore the project
                  </Link>
                )}
              </div>
            </div>

            {/* the strand */}
            <div className="order-1 flex justify-center md:order-2">
              <div className="relative h-[34vh] w-full max-w-[520px] md:h-[82vh]">
                <Helix
                  onFirstDrag={() => setDragged(true)}
                  zoom={zoom}
                  focus={focus}
                  flatten={flatten}
                />
                <div
                  className="pointer-events-none absolute inset-x-0 -bottom-1 flex justify-center"
                  style={{
                    // Retires once the reader drags OR once the journey
                    // starts — it invites you into the hero, it is not a
                    // caption for the trip inward.
                    opacity: dragged ? 0 : q(heroOut),
                    transition: "opacity 500ms ease",
                  }}
                >
                  <span
                    className={`flex items-center gap-2 px-3 py-1.5 ${L.note}`}
                    style={{ color: C.paper, opacity: 0.75 }}
                  >
                    <svg width="26" height="10" viewBox="0 0 26 10" aria-hidden="true">
                      <path
                        d="M2 5h22M2 5l4-3.5M2 5l4 3.5M24 5l-4-3.5M24 5l-4 3.5"
                        stroke={C.paper}
                        strokeWidth="1.6"
                        fill="none"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="md:hidden">Drag the strand</span>
                    <span className="hidden md:inline">Drag the strand · hover a pair</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/*
            The scale annotation. It names where the reader currently is as the
            descent deepens — your genome, then the chromosome, then the gene.
            Three stops: enough to feel the descent, not so many it becomes a
            lecture. This is the "annotated diagram" mechanic every reference
            wiki uses, applied to a journey instead of a still.

            PLACEHOLDER FIGURES — the team must confirm these before shipping.
            iGEM's rule is that nothing on a wiki may be unverifiable, and the
            first hard number on this site should not be one I wrote.
          */}
          {SCALE_STOPS.map((stop, i) => {
            const on = band(p, stop.in, stop.in + 0.06, stop.out, stop.out + 0.06);
            if (on < 0.02) return null;
            return (
              <div
                key={stop.label}
                // Left-anchored, not centred. Centred, the label sat exactly
                // where the growing strand passes and was crossed by the
                // backbone; the left half of the frame is empty for the whole
                // descent, so the "you are here" reads cleanly there.
                className="pointer-events-none absolute left-6 z-20 md:left-10"
                style={{ top: "20vh", opacity: q(easeOut(on)) }}
              >
                <span
                  // Same spec as every other small label on the site. This had
                  // its own tracking (0.26em) and its note had its own size and
                  // spacing, so one kind of thing was wearing three costumes.
                  className="flex flex-col gap-1.5 text-[11px] font-bold uppercase tracking-[0.22em]"
                  style={{ fontFamily: DISPLAY, color: C.paper }}
                >
                  <span className="flex items-center gap-3">
                    <span className="block h-px w-8" style={{ background: `${C.paper}99` }} />
                    {stop.label}
                  </span>
                  <span className={`pl-11 normal-case opacity-70 ${L.sub}`}>{stop.note}</span>
                </span>
              </div>
            );
          })}

          {/*
            Beat A's title: her own phrase, at the moment the journey begins.
            It leaves before the sequence arrives, so the frame never carries
            two thoughts at once.
          */}
          <div
            className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-6"
            style={{ opacity: q(followIn), visibility: followIn < 0.02 ? "hidden" : "visible" }}
          >
            {/*
              No scrim. There used to be a purple radial blob behind this line
              AND a text halo on it, both compensating for the same mistake:
              paper-coloured type on a ground that is still cream at this point
              in the scroll. Measured at 1.22:1 once the halo came off — not a
              contrast problem to paper over, a wrong colour. It is ink, which
              is what the ground here actually calls for, and measures 12:1.
            */}
            <p
              className="relative text-center font-black"
              style={{
                fontFamily: DISPLAY,
                ...T.headline,
                /*
                  Paper, like every other headline set on the field. This was
                  briefly ink, chasing a contrast number — but near-black type
                  on the purple reads as a caption stamped onto the scene, and
                  it made the site speak in two voices on what looks to a
                  reader like the same background. The ground carries the
                  contrast now; the type stays in one voice.
                */
                color: C.paper,
                transform: `translateY(${((1 - followIn) * 22).toFixed(1)}px)`,
              }}
            >
              One gene. One letter.
            </p>
          </div>

          {/*
            Beats C and D: the strand has folded shut and handed the frame to
            DNA you can read. The mutation then happens in front of the reader
            instead of being described to them.
          */}
          <div
            className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-4"
            style={{ visibility: assemble < 0.02 ? "hidden" : "visible" }}
          >
            <Sequence assemble={assemble} flip={flip} />
          </div>

          {/*
            The stakes, last. It closes the loop on the hero's headline — "Your
            genes decide your dose" — and pays it off with scale rather than
            repeating it.
          */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-[13vh] z-20 flex justify-center px-6"
            style={{
              opacity: q(easeOut(closing)),
              visibility: closing < 0.02 ? "hidden" : "visible",
            }}
          >
            <p
              className="max-w-3xl text-center font-black"
              style={{
                fontFamily: DISPLAY,
                ...T.sub,
                color: C.paper,
                transform: `translateY(${((1 - closing) * 18).toFixed(1)}px)`,
              }}
            >
              About three billion letters.
              <br />
              <span style={{ color: C.redOnField }}>This one can change your dose.</span>
            </p>
          </div>
        </div>
      </section>

      <TwoPeople />
      <Why />

      {/*
        The footer exists mainly to carry the Attributions link. iGEM requires
        that page, and a required page nothing links to is a page judges do not
        find — the AI declaration in particular has to be reachable from the
        story, not only by typing the URL.
      */}
      <footer
        className="relative z-10 px-6 py-10 md:px-10 md:py-12"
        style={{ background: C.paper, borderTop: `2px solid ${C.ink}18` }}
      >
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
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

      <style>{`
        /*
          One authored entrance with anticipation and overshoot, instead of
          eight objects bobbing on infinite sine loops. Ambient motion
          everywhere is what makes a page read as generated; the reference
          wikis hold still and move one thing deliberately.
        */
        /*
          The entrance carries the parallax offset as well, so an object does
          not jump the instant the animation hands back to the static rule.
          var() resolves at use time, so the live pointer values apply here.
        */
        @keyframes enter {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) var(--par) rotate(var(--rot, 0deg)) scale(0.6);
          }
          70% {
            opacity: 1;
            transform: translate(-50%, -50%) var(--par) rotate(var(--rot, 0deg)) scale(1.06);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) var(--par) rotate(var(--rot, 0deg)) scale(1);
          }
        }

        /*
          Depth parallax. Each object offsets by its own --d, so near objects
          travel and far ones barely move — the cue that actually reads as
          space. The transform runs only after the entrance has finished, so
          the two never fight over the same property.
        */
        .parallax {
          --par: translate(calc(var(--px, 0px) * var(--d, 0.5)), calc(var(--py, 0px) * var(--d, 0.5)));
          transform: translate(-50%, -50%) var(--par) rotate(var(--rot, 0deg));
        }
        .parallax.enter { animation-fill-mode: backwards; }
        .enter {
          animation: enter 760ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        /* Particles in suspension actually drift, so this motion is earned. */
        @keyframes float {
          0%, 100% { transform: translate(-50%,-50%) translateY(0); }
          50%      { transform: translate(-50%,-50%) translateY(-10px); }
        }
        .float {
          animation: float ease-in-out infinite;
        }

        /* The callout draws itself, the way a diagram is annotated. */
        /*
          Portrait: the field is a band across the TOP, curving away at its
          lower edge, with the strand inside it and the copy on cream below.
          Landscape: it returns to the right-hand column.
        */
        .field {
          inset: 0 0 auto 0;
          width: 100%;
          height: calc(46% + var(--merge, 0) * 54%);
          /*
            The curved lower edge straightens out as the field merges to full
            height. Left at 100%, the ellipse kept biting the bottom corners
            once the field filled the screen, leaving a cream sliver between
            this stop and the next.
          */
          clip-path: ellipse(150% calc(100% + var(--merge, 0) * 90%) at 50% 0%);
        }
        @media (min-width: 768px) {
          .field {
            inset: 0 0 0 auto;
            width: calc(58% + var(--merge, 0) * 42%);
            height: 100%;
            /*
              A straight edge, deliberately.

              This was an ellipse for a while and it only ever produced
              accidents: off-centre it bevelled the bottom-left corner like a
              rendering fault, and centred it bulged and sliced through the
              objects sitting on the seam. The stated principle here was always
              "a committed colour field with a HARD edge" — GlycoGarden's crisp
              horizon, KCIS's flat blue — and a clean vertical line is that.
              The seam is softened by the objects that straddle it, which is
              the job those objects exist to do.

              A value of none must be stated explicitly: without it the portrait
              rule above still applies here and curves the bottom edge.
            */
            clip-path: none;
          }
        }

        /* The field's stripes drift — light moving across the scene. */
        .sheen {
          background-image: repeating-linear-gradient(
            102deg,
            rgba(255, 255, 255, 0.05) 0 3px,
            transparent 3px 26px
          );
          animation: sheen 60s linear infinite;
        }
        @keyframes sheen {
          from { transform: translate3d(0, -33.333%, 0); }
          to   { transform: translate3d(0, 0, 0); }
        }

        /* Hover paints the marker stroke on, left to right. */
        .group:hover [data-underline] { opacity: 1 !important; transform: scaleX(1) !important; }

        @keyframes draw { to { stroke-dashoffset: 0; } }
        @keyframes popIn {
          0%   { opacity: 0; transform: scale(0.82); }
          70%  { opacity: 1; transform: scale(1.04); }
          100% { opacity: 1; transform: scale(1); }
        }

        @media (prefers-reduced-motion: reduce) {
          .enter, .float { animation: none; }
          .sheen { animation: none; }
        }
      `}</style>
    </main>
  );
}
