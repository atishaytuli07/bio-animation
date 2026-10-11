import { C } from "@/components/hero/palette";
import { track, usePageProgress } from "@/hooks/use-page-progress";

// The ground: one continuous surface under the entire story. Every scene used to paint its own background
// inside its own sticky stage, so the reader crossed a hard edge at every section boundary. Three rectangles
// cannot fade into one another however carefully each is animated, because at the seam the old stage stops
// existing and the new one starts.
// So the colour lives here: a single fixed layer, driven by progress through the whole document, interpolating
// along one timeline. Every colour the client liked is still here, in the same order.
// The two-layer build, a base colour plus a gradient wash that changes strength, is what gives the lighting
// change she asked for rather than a flat recolour: the wash brightens and shifts angle through the descent.

// The journey, in story coordinates (see story-map.ts). Positions are measured against the section boundaries.
// The three stages are 420vh, 580vh and 860vh, each overlapping the last by a viewport, so the story spans
// 1560vh and scene one hands over at 320/1560 = 0.205 and the two patients at 800/1560 = 0.513.
// Neither boundary sits on a keyframe: 0.205 falls between 0.17 and 0.26, 0.513 between 0.5 and 0.55, so the
// colour is already mid-change when one scene hands over to the next.
// The three purple chapters are three hues, not three depths of one. They were all hue 259 and differed by a few
// points of lightness, which is the sameness the client named: darker and lighter read as one colour under
// different light. The gene's own lavender sits between a cooler indigo for the variant and a warmer violet for
// the enzyme, so each chapter has a colour that can be told from its neighbours side by side.
/** The variant: lavender pulled towards blue and a step towards ink. The deepest ground in the story. */
const DEEPEST = `color-mix(in oklab, color-mix(in oklab, ${C.lavenderDeep} 76%, ${C.blue}) 76%, ${C.ink})`;

/** The enzyme: lavender warmed with pink, held dark enough for the cream headline set on it. */
const ENZYME = `color-mix(in oklab, color-mix(in oklab, ${C.lavenderDeep} 80%, ${C.pink}) 84%, ${C.ink})`;

const BASE = [
  [0.0, C.paper],
  // Cream for as long as the hero's copy is on it, then straight to the deep lavender the hero's field has
  // darkened to by the time it covers the screen. It used to pass through a pale mix at 0.09, and since the
  // field had already dissolved by then the descent crossed a washed-out band where the cream backbone measured
  // 1.44:1.
  // The change waits until the hero's field covers the screen, at page 0.0615. Starting at 0.035 it showed as a
  // grey-lavender strip down the left edge, beside the field, for as long as the field was still widening.
  [0.058, C.paper],
  [0.068, C.lavenderDeep],
  [0.11, C.lavenderDeep],
  // The sequence and the variant sit on the deepest ground in the story: it is the chapter's own colour, and it
  // is what lets cream and pink type pass where they measured 2.4 to 3.4:1 on the lighter purple.
  [0.15, DEEPEST],
  [0.2, DEEPEST],
  // The enzyme chapter is a step lighter than the variant's, and its diagram sits on a pale panel. It holds until
  // the bridge has gone at 0.315 and is no lighter than this: the headline under the panel is cream with two
  // tinted words, which measured 2.4:1 when the ground had already started towards the next chapter's plum.
  [0.26, ENZYME],
  [0.318, ENZYME],
  // The patients' chapter: the stronger purple, warming towards plum as his load climbs. It began on the light
  // lavender, where the cream headline measured under 3:1.
  // It steps to plum as the patients arrive. It used to open on the enzyme chapter's own violet and drift for a
  // screen before it could be told from it.
  [0.35, `color-mix(in oklab, ${C.lavenderDeep} 74%, ${C.red})`],
  [0.44, `color-mix(in oklab, ${C.lavenderDeep} 60%, ${C.red})`],
  // The purple→pink handover the client asked to keep, taken in four steps.
  [0.5, `color-mix(in oklab, ${C.lavenderDeep} 52%, ${C.pink})`],
  [0.537, `color-mix(in oklab, ${C.lavenderDeep} 30%, ${C.pink})`],
  [0.582, `color-mix(in oklab, ${C.pink} 74%, ${C.paper})`],
  [0.648, `color-mix(in oklab, ${C.pink} 46%, ${C.paper})`],
  [0.722, `color-mix(in oklab, ${C.pink} 30%, ${C.paper})`],
  // The turn is at 0.79, and the ground turns with it, to a warm cream: cream with a little of the drug's coral
  // left in it. This stretch used to pass through a mix with green in it that rendered as a cool grey
  // (#dcded9), the one frame in the story that looked drained, and it was the resolution. The client asked for
  // the decision to sit on warm cream; it is also the colour the story opened on, so the ending comes home.
  [0.799, `color-mix(in oklab, ${C.pink} 18%, ${C.paper})`],
  [0.855, `color-mix(in oklab, ${C.coral} 7%, ${C.paper})`],
  [0.983, `color-mix(in oklab, ${C.coral} 5%, ${C.paper})`],
  // It is C.paper itself at the end, not a hex sampled from a screenshot, so the two ends of the journey are the
  // same value and cannot drift apart.
  [1.0, C.paper],
] as const;

/** The light in the room: strength of the wash, and where it falls from. */
const LIGHT = [
  // The wash stays low through the gene chapter. At 0.6 it lifted the deep lavender from #7355B4 to about
  // #8066B9 under the type, which is where the chapter's contrast went.
  [0.0, 0],
  [0.07, 0.14],
  [0.13, 0.26],
  [0.2, 0.34],
  // still low through the enzyme chapter, for the same reason: "DPYD" and "DPD" measured 2.75 and 2.65:1 here
  [0.318, 0.34],
  [0.38, 0.46],
  [0.5, 0.5],
  [0.6, 0.24],
  [0.722, 0.1],
  [1.0, 0.05],
] as const;

const ANGLE = [
  [0.0, 150],
  [0.2, 168],
  [0.51, 196],
  [0.779, 208],
  [1.0, 218],
] as const;

// The surface pattern's own opacity track, deliberately not tied to `light`. It used to ride light * 0.55, so
// the texture rose and fell with the lighting: lighting is a mood, a surface is a fact. When the hero's colour
// field, which painted its own identical stripes at a higher alpha, dissolved into this layer, the pattern
// dropped fivefold and stayed there. This track holds it constant for the whole coloured stretch.
// It ramps up while the hero's field is still opaque on top of it, so by the time that field fades at page 0.069
// the surface underneath is already identical. It leaves at the very end, as the ground returns to cream and
// white-on-cream stripes would be invisible anyway.
const PATTERN = [
  [0.0, 0],
  [0.03, 0],
  [0.055, 1],
  [0.88, 1],
  [0.97, 0],
  [1.0, 0],
] as const;

const num = (p: number, frames: readonly (readonly [number, number])[]) => {
  const { from, to, t } = track(p, frames);
  return from + (to - from) * t;
};

export function Ground() {
  const p = usePageProgress();

  const base = track(p, BASE);
  const light = num(p, LIGHT);
  const angle = num(p, ANGLE);
  const pattern = num(p, PATTERN);

  // color-mix nests, so two arbitrary keyframe colours blend without needing to parse either of them into channels.
  const colour =
    base.t <= 0
      ? base.from
      : `color-mix(in oklab, ${base.from} ${(100 - base.t * 100).toFixed(1)}%, ${base.to})`;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-20"
      style={{ background: colour }}
    >
      {/* The light falls on the subject, not on the type. The bloom used to sit at 50% 0%, the top centre of the
          frame, which is exactly where every headline is pinned: it made the copy band the brightest part of the
          screen, so cream type on it measured 2.84:1. Moving the light down onto the figures is how the scene would
          actually be lit, and it gives the copy band its depth back without a scrim behind any word. */}
      <div
        className="absolute inset-0"
        style={{
          opacity: light,
          background: `linear-gradient(${angle.toFixed(0)}deg, rgba(255,255,255,0.14), rgba(255,255,255,0) 52%), radial-gradient(95% 62% at 50% 64%, rgba(255,255,255,0.2), rgba(255,255,255,0) 72%)`,
        }}
      />
      {/* The top of the room, further from the light. Scaled by the same `light` value, so it exists only where
          there is a lit field to fall away from and is absent on the cream sections at either end. */}
      <div
        className="absolute inset-x-0 top-0 h-[46%]"
        style={{
          opacity: light,
          background: `linear-gradient(180deg, ${C.ink}5e, ${C.ink}00)`,
        }}
      />
      {/* The stripes the client liked in the DNA section. The story draws them here and nowhere else: the hero's
          colour field used to paint its own copy at a different alpha, so the handover was a visible fivefold drop in
          texture. The pattern itself is declared in styles.css; this layer holds it constant across every beat,
          on the track in PATTERN above.
          The wrapper clips; the inner element is 300% tall and drifts upward by transform, which composites.
          Animating background-position instead repaints the full viewport every frame and measured about 9fps. */}
      <div className="absolute inset-0 overflow-hidden" style={{ opacity: pattern }}>
        <span className="env-stripes absolute inset-x-0 top-0 block h-[300%]" />
      </div>
    </div>
  );
}
