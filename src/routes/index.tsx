import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { Helix } from "@/components/hero/Helix";
import { Sequence } from "@/components/hero/Sequence";
import { TwoPeople } from "@/components/story2/TwoPeople";
import { Why } from "@/components/story3/Why";
import { PAGES } from "@/components/story/site-map";
import { Ground } from "@/components/story/Ground";
import { Landing } from "@/components/story/Landing";
import { ClosingBand, SiteFooter } from "@/components/story/PageShell";
import { SiteHeader } from "@/components/story/SiteHeader";
import { World } from "@/components/story/World";
import { usePageProgress } from "@/hooks/use-page-progress";
import { band, easeOut, range, useSmoothProgress } from "@/hooks/use-scroll-progress";
import { Cell, Enzyme, Molecule } from "@/components/hero/elements";
import { C, DISPLAY, L, R, T } from "@/components/hero/palette";

// The story, and the wiki's front door. Everything is drawn in code as SVG. No three.js: the old WebGL helix was slow to
// load, read as generic, and could not morph or recolour.
// The hero follows the client's checklist literally: a large DNA visual, ChemoGuard branding, a short headline,
// the red and white identity plus coral, pink, blue, lavender and green, and little empty background.
// Rungs are coloured by base-pair convention and exactly one rung is red, the variant. Red is never decorative
// on this page, so the eye finds the one thing that is wrong without a word of explanation.

export const Route = createFileRoute("/")({
  head: () => ({
    // A judge reads this in a tab and in browser history. The route was a preview beside the old homepage when
    // it was set to noindex; it is the homepage now.
    meta: [
      { title: "ChemoGuard: why testing comes before the first dose" },
      {
        name: "description",
        content:
          "A DPYD variant can reduce how fast the body clears fluoropyrimidine chemotherapy. Follow the gene, the enzyme and the drug — and see why testing comes before the first dose.",
      },
      { property: "og:title", content: "ChemoGuard: why testing comes before the first dose" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: HeroConcept,
});

// Quantise a scroll value to 20 steps. A value that moves a thousandth a frame repaints exactly as hard as one
// that moves a tenth, so a continuous fade costs a full repaint for a difference nobody can see.
const q = (v: number) => Math.round(v * 20) / 20;

/** The page the hero's second button promises, once it exists. */
const DESCRIPTION = PAGES.find((p) => p.to === "/description");

// The scale stops named during the descent. The haploid genome is about 3.1 billion base pairs and DPYD sits at
// 1p21.3. It reads "about three billion" because the exact-looking number implies a precision it does not have.
// The team still has to attach its own citation before the freeze.
const SCALE_STOPS = [
  // in/out are scroll positions, and each label is fully retired before the next arrives.
  // The spacing is load-bearing, and it is not `out` to `in`: the renderer adds a 0.06 out-ramp, so a label is on
  // screen until `out + 0.06` and two `in` values must be at least (out - in) + 0.06 = 0.13 apart. At
  // 0.28/0.39/0.49 two labels sat at the same coordinates at p 0.51, at 0.167 and 0.333 opacity.
  // These start where "One gene. One letter." finishes leaving.
  { label: "Your genome", note: "about three billion letters", in: 0.34, out: 0.41 },
  { label: "Chromosome 1", note: "1p21.3", in: 0.47, out: 0.54 },
  { label: "DPYD", note: "encodes DPD, which breaks down 5-FU", in: 0.6, out: 0.67 },
] as const;

// The story rail: where you are, and what you are looking at, in one place. The client found the small
// left-hand labels confusing, and the diagnosis was two systems dressed identically: chapter labels inside the
// scenes and scale annotations inside the diagram, both small, uppercase and letterspaced. The chapter labels
// live here now and the annotations are the only thing left that looks like that.
// Chapter names are deliberately not the words of the headline they sit over: "04 - Look closer" above a
// headline reading "Look closer." was her own complaint.
// Thresholds 02 and 03 are measured against the picture, not the section handoffs at 0.203 and 0.276. Traced at
// 0.01 steps, the enzyme bridge is not visible until 0.25 and the two patients do not appear until 0.32.
const CHAPTERS = [
  { at: 0.0, n: "01", name: "The gene" },
  { at: 0.245, n: "02", name: "The enzyme" },
  { at: 0.315, n: "03", name: "Two people" },
  { at: 0.509, n: "04", name: "Inside the body" },
  // Not a new section — the same scene, after it turns. The rail names the argument even though the picture never
  // restarts.
  { at: 0.84, n: "05", name: "Before the first dose" },
] as const;

// The marker riding the rail: one base pair seen end-on, on the same maths as the strand itself. The two nodes
// sit at plus and minus cos(a) of the axis and swap depth through sin(a), four turns across the page.
// Scroll-driven, not looping. A marker spinning on a timer would be ambient motion in the one place the reader
// looks to answer "how much is left", and ambient loops are what make a site read as generated.
// Paper fill with ink outlines, because the ground travels cream, purple, pink, cream: a filled dot in any
// palette colour disappears on one of those. Red would also mean the variant, and a progress marker is not that.
function RailKnob({ p }: { p: number }) {
  const a = p * Math.PI * 8;
  const cos = Math.cos(a);
  const near = (Math.sin(a) + 1) / 2;
  const x1 = 9 + cos * 5.4;
  const x2 = 9 - cos * 5.4;
  return (
    <div
      aria-hidden="true"
      className="absolute top-0 -translate-x-1/2"
      // max() keeps the knob a knob at the top of the page. At p=0 a centred marker at left:0 is half outside
      // the window and reads as a rendering fault rather than a starting position.
      style={{
        left: `max(10px, ${(p * 100).toFixed(2)}%)`,
        // Arrives with the fill. At p=0 a knob with no fill beside it measured as a stray glyph at the edge of
        // the bar, not a start position.
        opacity: q(range(p, 0, 0.015)),
      }}
    >
      <svg width="18" height="18" viewBox="0 0 18 18">
        <line
          x1={x1}
          y1="9"
          x2={x2}
          y2="9"
          stroke={C.ink}
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.55"
        />
        <circle
          cx={x2}
          cy="9"
          r={3 - near * 0.9}
          fill={C.paper}
          stroke={C.ink}
          strokeWidth="1.6"
          opacity="0.72"
        />
        <circle
          cx={x1}
          cy="9"
          r={2.1 + near * 0.9}
          fill={C.paper}
          stroke={C.ink}
          strokeWidth="1.8"
        />
      </svg>
    </div>
  );
}

// The progress rail, on the header's lower edge rather than across the top of it. The header used to scroll
// away and the rail hung 7px from the top of the window; the header stays now, so up there the knob would travel
// across the logo and every nav label. On the bar's bottom seam it crosses no text and sits half on cream.
// Positioned from the bottom of the bar row: -mt-[8px] with the 7px pad puts the 3px fill 1px above the row's
// end, covering the header's 2px border at both header heights, and centres the 18px knob on it.
function ProgressRail() {
  const p = usePageProgress(200);
  return (
    <div className="relative -mt-[8px] pt-[7px]">
      {/* No track. Drawing the untravelled part in 7% ink put the unfinished part of the story across the top of
          every frame. The fill and the marker say where you are; the remainder does not need painting. */}
      <div className="h-[3px] w-full">
        <div
          className="h-full origin-left"
          style={{
            width: `${(p * 100).toFixed(1)}%`,
            background: `linear-gradient(90deg, ${C.lavender}, ${C.coral}, ${C.red})`,
          }}
        />
      </div>
      <RailKnob p={p} />
    </div>
  );
}

function StoryProgress() {
  const p = usePageProgress(200);
  const chapter = [...CHAPTERS].reverse().find((c) => p >= c.at) ?? CHAPTERS[0];

  return (
    // z-30, under the header's z-40: the chapter label must not read through the phone menu when it opens.
    <div className="pointer-events-none fixed inset-x-0 top-0 z-30">
      {/* The name rides under the bar, once the reader has left the opening screen, pinned to the same coordinate
          the per-scene labels used, which is the first line clear of the header. At pt-3 it sat on the logo.
          A band, not a range: a range reaches 1 and stays, which left "05 - Before the first dose" pinned over a
          closing landing that is not part of the story. It goes out over the last two percent. */}
      <div className={L.label} style={{ opacity: q(easeOut(band(p, 0.062, 0.11, 0.975, 0.998))) }}>
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
  // Deliberately few. The hero ran this array, a separate DOTS layer and the global World at once: 58 drifting
  // elements on the one screen whose copy is left-aligned, three of them sitting on the paragraph, the button and
  // the chapter label. What is left is only what the global world cannot do, objects that straddle the seam.
  // Positions are percentages of the viewport, and the layout stacks below md, so objects tuned for the seam land
  // on the copy once the columns stack. The ones that would collide are marked hideSm and do not render there.
  // depth: 0 = far (small, soft, barely moves) to 1 = near (large, sharp, moves most)
  { k: "enz", x: 72, y: 12, s: 0.5, r: 10, tone: C.green, depth: 0.5 },

  // On the seam. The field's edge sits near x = 42%, so these sit half on cream and half on purple, which is what
  // stops the boundary reading as a wall. They are the nearest objects, so they travel furthest with the pointer.
  { k: "mol", x: 43, y: 20, s: 0.74, r: -14, tone: C.coral, depth: 1 },
  { k: "cell", x: 41, y: 79, s: 0.72, r: 8, tone: C.pink, depth: 0.92, hideSm: true },
  { k: "enz", x: 56, y: 47, s: 0.42, r: 16, tone: C.green, depth: 0.36, hideSm: true },

  // deep in the field: small, soft, slow
  { k: "cell", x: 95, y: 72, s: 0.5, r: -8, tone: C.blue, depth: 0.3, hideSm: true },
  { k: "mol", x: 90, y: 16, s: 0.38, r: 20, tone: C.coral, depth: 0.2 },
] as const;

function HeroConcept() {
  const stage = useRef<HTMLElement>(null);
  const [track, p] = useSmoothProgress<HTMLElement>(0.1);
  // Sections overlap by a viewport so the next scene begins as this one lands, but overlap alone is a collision,
  // not a transition. This is the dissolve, measured against the real boundary at 0.205: scene one releases the
  // frame as the patients rise into it, and only after its own closing line has finished arriving.
  const pageP = usePageProgress();
  const handoff = range(pageP, 0.196, 0.231);
  // One section, four beats. The scroll is the microscope: the reader's own hand is what magnifies, which is the
  // only reason a story about scale can be told by scrolling at all.
  //   A  the descent begins, and the strand is named: your genome
  //   B  structure resolves; the annotation narrows to chromosome 1, then DPYD
  //   C  the helix folds shut and the sequence assembles, readable
  //   D  one letter changes, and the stakes land
  // The drama of DPYD is scale: three billion letters, and one of them decides whether a standard dose treats you
  // or harms you.
  // The descent is compressed to pay for the ending. The scene used to travel inward until p 0.88 and then fit
  // the flip, the caption, the retreat and the closing statement into the last twelfth, about half a screen of
  // scroll for four pieces of information, so they landed on top of each other. p 0.76 to 1.0 is now the ending.
  // The section height is unchanged at 420vh, deliberately: the five chapter thresholds, the seventeen ground
  // keyframes, the world's density schedule and the section boundaries at 0.205 and 0.513 are all measured
  // against it, so re-proportioning inside the scene leaves every one of them valid.
  const heroOut = 1 - range(p, 0.05, 0.17);
  const zoom = range(p, 0.1, 0.54);
  const focus = range(p, 0.36, 0.58);
  // Reading the pairs, one per scroll. The window is measured, not reasoned from the section height: 0.16 to 0.50
  // looked like 32vh a pair but traced at 57vh for the whole walk, because `p` is the sticky stage's own progress
  // and reaches 1 well before the section has scrolled past. The ends are what the strand allows, since it cannot
  // start before the hero copy leaves and must finish before `flatten` at 0.55. 0.09 to 0.52 traces at about 19vh.
  const read = range(p, 0.09, 0.52);
  // The fold and the assembly overlap. Painted content fell from 12.8% of the frame to 3.4% and back to 9.7%
  // across three sampled positions, and the 3.4% frame was a ghost helix and one orphan letter: `flatten` began at
  // 0.52 and `assemble` at 0.56, so for four percent of the section neither owned the frame. The letters now start
  // arriving before the strand starts leaving, which is what a handover is.
  const flatten = range(p, 0.55, 0.68);
  const assemble = range(p, 0.5, 0.68);
  const flip = range(p, 0.7, 0.76);
  // The ending, budgeted in scroll rather than in numbers that looked right. p 0.70 to 1.0 is 0.30 of a 420vh
  // section, 126vh, and seven things have to happen in it:
  //   flip         0.70 to 0.76    25vh   G becomes A
  //   hold         0.76 to 0.80    17vh   the variant alone, nothing moving
  //   recede       0.80 to 1.00    84vh   the camera pulls back, running under the rest
  //   caption out  0.806 to 0.85   18vh   the explanatory sentence leaves
  //   breath       0.85 to 0.87     8vh   nothing on screen but the receding DNA
  //   closing in   0.87 to 0.93    25vh   the statement arrives
  //   hold         0.93 to 0.955   10vh   it sits alone before the scene dissolves
  // The hold at 0.76 and the breath at 0.85 deliberately do nothing. They are what make the retreat read as a
  // decision rather than the next item in a queue.

  // The camera reverses. Everything so far has gone inward, genome to chromosome to gene to sequence to one base,
  // and this is the single moment it pulls back out, which is what earns the closing line about scale. It keeps
  // running past the end of the section on purpose, so the handoff into the two-patient scene is a continuation.
  const recede = range(p, 0.8, 1);
  // The statement arrives after the caption has gone and the breath has passed.
  const closing = range(p, 0.87, 0.93);
  // The sequence retires at the very end of the scene. `assemble` is a range, so it reached 1 and stayed and the
  // letters were still fully painted when the section unpinned: on a 360px phone that dragged the assembly up
  // through the story rail and "02 - The enzyme" printed over a ghost of "A / T / INTRON 14". It runs 0.96 to 1.0,
  // after the closing statement has had its hold, so nothing leaves while the reader is still reading it.
  const seqOut = range(p, 0.96, 1);
  // Her phrase, once, before the annotations start narrating. It starts at 0.17, where the hero copy finishes
  // leaving, and is clear before the first scale label arrives at 0.34. Solve these against the opacity crossings
  // rather than the window numbers: this one is above 12% until 0.324, which is why the label waits for 0.34.
  const followIn = band(p, 0.17, 0.24, 0.28, 0.33);
  // The cream side gives way as we travel in, so the two halves become one space rather than staying a split screen.
  const merge = range(p, 0.07, 0.38);
  // Objects clear out well before the first annotation lands.
  const ambientOut = range(p, 0.05, 0.22);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const el = stage.current;
    if (!el) return;
    let raf = 0;
    let tx = 0;
    let ty = 0;
    const target = { x: 0, y: 0 };

    // The loop stops once the easing has caught up with the pointer and restarts on the next move. A rAF that runs
    // forever writing values that are not changing is pure waste, and this page already runs one for the strand.
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

  // The affordance hint retires the moment the visitor proves they don't need it — the same move as Wuxi's "Scroll to
  // follow the signal".
  const [dragged, setDragged] = useState(false);

  return (
    <main
      ref={stage}
      className="relative [&_*]:[-webkit-tap-highlight-color:transparent]"
      style={
        {
          // Grain as a background layer, not a blended overlay. A mix-blend-mode across the viewport measured at
          // ~19fps of cost, because it forces the whole stacking context to re-composite every frame. As a background
          // image it costs nothing. Grain only. The colour now lives in <Ground />, one continuous surface under the
          // whole story — see that file for why.
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='0.1'/%3E%3C/svg%3E")`,
          color: C.ink,
        } as React.CSSProperties
      }
    >
      <Ground />
      <World />

      {/* The shared header, fixed rather than sticky: every beat on this page is timed against scroll position,
          and sticky would add its height to the document above them. */}
      <SiteHeader position="fixed" rail={<ProgressRail />} />
      <StoryProgress />

      {/* One section, built once and proven before anything downstream is committed to: a tall track with a
          pinned stage, and every beat driven by scroll position rather than by a timer. */}
      <section ref={track} style={{ height: "420vh" }} className="relative">
        <div
          className="sticky top-0 h-screen overflow-hidden"
          style={{ opacity: 1 - q(handoff), visibility: handoff > 0.99 ? "hidden" : "visible" }}
        >
          {/* A committed colour field with a hard edge, not a gradient mesh. A soft pastel wash is what a page
              looks like when it has not decided on a colour, and it is the strongest AI-generated tell. Lavender
              means genetics everywhere on this site, so the strand sits inside its own meaning. */}
          <div
            aria-hidden="true"
            className="field pointer-events-none absolute"
            style={{
              // Widening as the journey starts: the two halves stop being a split screen and become one space. This
              // is the client's "the two sides feel more connected" taken to its conclusion.
              ["--merge" as string]: merge,
              // Once merged, this field is a full-screen opaque rectangle on top of Ground and World, which is
              // why the descent and the sequence looked like an object alone in a void. It dissolves into the
              // ground, which is already running the same lavender to lavenderDeep, so the swap is invisible.
              opacity: 1 - range(merge, 0.72, 1),
              // Grain and colour only, no stripes. This field used to paint its own copy of the surface pattern
              // at rgba(255,255,255,0.05) while Ground painted another at 0.06 x light x 0.55, so when the field
              // dissolved the texture fell from 0.0555 white to 0.0113 and never came back. Ground owns it now,
              // and dissolving this field is a pure colour handover with no texture change.
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='0.1'/%3E%3C/svg%3E"), linear-gradient(160deg, ${C.lavender}, ${C.lavenderDeep})`,
            }}
          />
          {/* a thin ink keyline along the field edge — the reference wikis all
          outline their shapes rather than letting them dissolve */}
          <div
            aria-hidden="true"
            className="field pointer-events-none absolute"
            style={{
              // Widening as the journey starts: the two halves stop being a split screen and become one space. This
              // is the client's "the two sides feel more connected" taken to its conclusion.
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
                  // Custom properties: the entrance keyframe restores the object's own rotation instead of flattening
                  // it, and --d drives how far this object travels with the pointer.
                  ["--rot" as string]: `${f.r}deg`,
                  ["--d" as string]: f.depth,
                  animationDelay: `${240 + i * 90}ms`,
                  // Far objects sit back: softer, slightly desaturated, blurred a touch. Near objects are sharp and
                  // cast a shadow. The ambient world thins as the journey goes inward: we are leaving the bloodstream
                  // for the gene, and the nearest objects — which would otherwise sail past the camera — clear out
                  // first.
                  opacity: q((0.45 + f.depth * 0.55) * (1 - ambientOut)),
                  // Out of paint once faded: for most of this section these are invisible but were still filtered and
                  // composited every frame. Kept mounted though — unmounting made them replay their staggered
                  // entrance every time the reader scrolled back up to the hero.
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

          {/* A corner wash for the left column, where the chapter label and the scale stops sit. "01 - The gene"
              measured 5.01:1 at the top of the story and 1.98:1 once the field had darkened under it. A corner
              rather than a full-width band, because the right half belongs to the strand; it also gives the left
              column weight, since the right half carries up to 11.8 times the painted content. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 z-10 h-[540px] w-[700px]"
            style={{
              background: `radial-gradient(120% 104% at 0% 0%, ${C.ink}c9, ${C.ink}70 56%, transparent 84%)`,
              // It arrives with the bar, not on its own slower ramp. Measured at page 0.09, "01 - The gene" ran
              // at 2.47:1, "Your genome" at 2.04 and its note at 1.65, recovering to 4.90 only by 0.12.
              opacity: q(range(pageP, 0.042, 0.08)),
            }}
          />

          <div className="relative z-10 mx-auto grid h-full max-w-[92rem] items-center gap-3 px-6 pb-8 pt-24 md:grid-cols-[1.05fr_0.95fr] md:gap-8 md:px-10 md:pb-24 md:pt-28">
            <div
              className="order-2 md:order-1"
              style={{
                opacity: q(heroOut),
                transform: `translateY(${((1 - heroOut) * -28).toFixed(1)}px)`,
                visibility: heroOut < 0.02 ? "hidden" : "visible",
              }}
            >
              {/* A chapter label, not a control. It used to carry the paper fill, ink border and hard offset
                  shadow of the secondary button, so two affordances wore one appearance. The offset shadow now
                  means exactly one thing: pressable. Neither reference wiki boxes its chapter label. */}
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
                One gene affects how fast your body clears a widely used chemotherapy drug. For some
                people, a standard dose can be more than they can handle.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3 md:mt-8">
                <button
                  className="px-6 py-3 text-[15px] font-bold text-white transition-transform hover:-translate-y-0.5"
                  style={{
                    fontFamily: DISPLAY,
                    background: C.redDeep,
                    border: `2.5px solid ${C.ink}`,
                    borderRadius: R.sm,
                    boxShadow: `4px 4px 0 ${C.ink}`,
                  }}
                  onClick={() => {
                    // This did nothing at all, and it is the site's primary call to action. It now starts the
                    // descent.
                    const quiet = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                    window.scrollTo({
                      top: window.innerHeight * 1.1,
                      behavior: quiet ? "auto" : "smooth",
                    });
                  }}
                >
                  Follow the gene
                </button>
                {/* Rendered from the site map, so it appears the moment the page it promises exists and stays
                    absent until then. */}
                {DESCRIPTION?.ready && (
                  <Link
                    to={DESCRIPTION.to}
                    className="px-6 py-3 text-[15px] font-bold transition-transform hover:-translate-y-0.5"
                    style={{
                      fontFamily: DISPLAY,
                      background: C.paper,
                      color: C.ink,
                      border: `2.5px solid ${C.ink}`,
                      borderRadius: R.sm,
                      boxShadow: `4px 4px 0 ${C.ink}`,
                    }}
                  >
                    Explore the project
                  </Link>
                )}
              </div>
            </div>

            {/* The strand, and it travels to the centre as the hero dissolves. Its column sat at x 825 to 1345,
                centre 1085 against a frame centre of 720, at every position from 0.00 to 0.18: the cream half
                merges away but the grid that put the strand in the right-hand column does not, so the reader was
                looking at a molecule pinned 365px right of centre with its right side cut by the frame.
                The shift is -25% of the container, because in an equal two-column grid the right column's centre
                sits a quarter of the container past the middle: -360 at 1440, -368 at 1920 and -256 at 1024,
                against measured needs of -365, -368 and -256. md only, since a phone is already one column. */}
            <div
              className="order-1 flex justify-center md:order-2 md:[transform:translateX(var(--strand-shift))]"
              style={
                {
                  "--strand-shift": `calc(min(92rem, 100vw) * ${(-0.25 * q(merge)).toFixed(4)})`,
                } as React.CSSProperties
              }
            >
              <div className="relative h-[34vh] w-full max-w-[520px] md:h-[82vh]">
                <Helix
                  onFirstDrag={() => setDragged(true)}
                  zoom={zoom}
                  focus={focus}
                  flatten={flatten}
                  read={read}
                />
                <div
                  className="pointer-events-none absolute inset-x-0 -bottom-1 flex justify-center"
                  style={{
                    // Retires once the reader drags or once the journey starts — it invites you into the hero, it is
                    // not a caption for the trip inward.
                    opacity: dragged ? 0 : q(heroOut),
                    transition: "opacity 500ms ease",
                  }}
                >
                  <span
                    className={`flex items-center gap-2 px-3 py-1.5 ${L.note}`}
                    // Ink, for the same reason as the nav beside it: this only exists on the hero, where the
                    // field is still light lavender. Paper tops out at 2.79:1 there and this measured 1.96:1,
                    // the least readable string on the opening screen.
                    style={{ color: C.ink, opacity: 0.96 }}
                  >
                    <svg width="26" height="10" viewBox="0 0 26 10" aria-hidden="true">
                      <path
                        d="M2 5h22M2 5l4-3.5M2 5l4 3.5M24 5l-4-3.5M24 5l-4 3.5"
                        stroke={C.ink}
                        strokeWidth="1.6"
                        fill="none"
                        strokeLinecap="round"
                      />
                    </svg>
                    {/* It no longer says "hover a pair". The pairs name themselves as you scroll, so that
                          promised work the reader does not have to do, and offered it to a phone with no hover.
                          What is left is the one thing hover cannot replace. */}
                    <span>Drag to spin the strand</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* The scale annotation names where the reader is as the descent deepens: your genome, the chromosome,
              the gene. Three stops, enough to feel the descent without becoming a lecture.
              Placeholder figures, and the team must confirm them before shipping. Nothing on a wiki may be
              unverifiable, and the first hard number on this site should not be one I wrote. */}
          {SCALE_STOPS.map((stop) => {
            const on = band(p, stop.in, stop.in + 0.06, stop.out, stop.out + 0.06);
            if (on < 0.02) return null;
            return (
              <div
                key={stop.label}
                // Left-anchored, not centred: centred, the label sat where the growing strand passes and was
                // crossed by the backbone, and the left half of the frame is empty for the whole descent.
                // The pixel floor is because it shares this column with the chapter label in the story rail,
                // which sits at a fixed top-24 / md:top-28, ending near 120px and 136px. A bare top: 20vh is
                // 88px on a 439px-tall window, under the label's 96px, so the two printed over each other.
                // Anything pinned to this column needs the same floor.
                className="pointer-events-none absolute left-6 top-[max(140px,20vh)] z-20 md:left-10 md:top-[max(156px,20vh)]"
                style={{ opacity: q(easeOut(on)) }}
              >
                <span
                  // Same spec as every other small label on the site. This had its own tracking (0.26em) and its note
                  // had its own size and spacing, so one kind of thing was wearing three costumes.
                  className="flex flex-col gap-1.5 text-[11px] font-bold uppercase tracking-[0.22em]"
                  style={{ fontFamily: DISPLAY, color: C.paper }}
                >
                  <span className="flex items-center gap-3">
                    <span className="block h-px w-8" style={{ background: `${C.paper}99` }} />
                    {stop.label}
                  </span>
                  {/* opacity-90, not 70. This is the only place a scale stop says anything, and at 0.7 an 11px
                        string never reached the 4.5:1 it is held to, however strong the wash behind it got. */}
                  <span className={`pl-11 normal-case opacity-95 ${L.sub}`}>{stop.note}</span>
                </span>
              </div>
            );
          })}

          {/* Beat A's title: her own phrase, at the moment the journey begins. It leaves before the sequence
              arrives, so the frame never carries two thoughts at once. */}
          <div
            className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-6"
            style={{ opacity: q(followIn), visibility: followIn < 0.02 ? "hidden" : "visible" }}
          >
            {/* No scrim. A purple radial blob and a text halo both compensated for the same mistake, paper type
                  on a ground that is still cream here: 1.22:1 once the halo came off. Ink measures 12:1. */}
            <p
              className="relative text-center font-black"
              style={{
                fontFamily: DISPLAY,
                ...T.headline,
                // Paper, like every other headline set on the field. Ink chased a contrast number, but near-black
                // type on the purple reads as a caption stamped onto the scene and made the site speak in two
                // voices on what looks like the same background. The ground carries the contrast instead.
                color: C.paper,
                transform: `translateY(${((1 - followIn) * 22).toFixed(1)}px)`,
              }}
            >
              One gene. One letter.
            </p>
          </div>

          {/* Beats C and D: the strand folds shut and hands the frame to DNA you can read. The mutation then
              happens in front of the reader instead of being described to them. */}
          {/* Centred below the header, not in the whole stage. inset-0 with items-center put the block's midpoint
              at half the viewport: the struck-through G ran under the header by 26px at 1280x600 and 6px at
              1371x640, with 176 to 326px of empty ground below the caption. The pad is the header's height. */}
          <div
            className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-4 pt-[70px]"
            style={{
              opacity: 1 - q(seqOut),
              visibility: assemble < 0.02 || seqOut > 0.99 ? "hidden" : "visible",
            }}
          >
            <Sequence assemble={assemble} flip={flip} recede={recede} />
          </div>

          {/* The stakes, last. It closes the loop on the hero's headline and pays it off with scale rather than
              repeating it. */}
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
                // Two even lines on a phone instead of one word left hanging.
                textWrap: "balance",
                transform: `translateY(${((1 - closing) * 18).toFixed(1)}px)`,
              }}
            >
              About three billion letters.
              <br />
              <span style={{ color: C.redOnField }}>
                This one can make a standard dose too much.
              </span>
            </p>
          </div>
        </div>
      </section>

      <TwoPeople />
      <Why />

      {/* The story ends here and the page does not. Everything above is measured in page fractions: seventeen
          ground keyframes, five chapter thresholds, two handoffs, the chapter label's colour switch. This marker
          is what usePageProgress divides by, so anything appended below is furniture rather than a change to all
          of them at once. */}
      <div id="story-end" aria-hidden="true" />

      {/* The page's ending, as opposed to the story's. What used to be here was a 118px strip carrying a
          copyright line and a single link, after sixteen screens of argument. */}
      <Landing />
      <ClosingBand />
      <SiteFooter />

      <style>
        {`
        /* One authored entrance with anticipation and overshoot, instead of eight objects bobbing on infinite sine
           loops. Ambient motion everywhere is what makes a page read as generated.
           It carries the parallax offset too, so an object does not jump when the animation hands back to the
           static rule; var() resolves at use time, so the live pointer values apply here. */
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

        /* Depth parallax. Each object offsets by its own --d, so near objects travel and far ones barely move.
           The transform runs only after the entrance has finished, so the two never fight over one property. */
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

        /* Portrait: the field is a band across the top, curving away at its lower edge, with the strand inside it
           and the copy on cream below. Landscape: it returns to the right-hand column. */
        .field {
          inset: 0 0 auto 0;
          width: 100%;
          height: calc(46% + var(--merge, 0) * 54%);
          /* The curved lower edge straightens as the field merges to full height. Left at 100%, the ellipse bit
             the bottom corners once the field filled the screen and left a cream sliver. */
          clip-path: ellipse(150% calc(100% + var(--merge, 0) * 90%) at 50% 0%);
        }
        @media (min-width: 768px) {
          .field {
            inset: 0 0 0 auto;
            width: calc(58% + var(--merge, 0) * 42%);
            height: 100%;
            /* A straight edge, deliberately. As an ellipse it only produced accidents: off-centre it bevelled the
               bottom-left corner like a rendering fault, and centred it bulged through the objects on the seam.
               The field is meant to have a hard edge, and the seam is softened by those objects instead.
               none must be stated: without it the portrait rule above still applies and curves the edge. */
            clip-path: none;
          }
        }

        /* The surface pattern is environment, not scenery, so it lives in .env-stripes in styles.css and is drawn
           once by Ground.
           No backticks anywhere in this template literal: a stray one ends the CSS string silently and turns the
           rest of the stylesheet into TypeScript. */

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
          /* .env-stripes carries its own reduced-motion rule in styles.css,
             beside the animation it disables. */
        }
      `}
      </style>
    </main>
  );
}
