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

// The journey, in document progress. Positions are measured against the real section boundaries, not guessed.
// The three stages are 420vh, 580vh and 860vh, each overlapping the last by a viewport, so the story spans
// 1560vh and scene one hands over at 320/1560 = 0.205 and the two patients at 800/1560 = 0.513.
// Neither boundary sits on a keyframe: 0.205 falls between 0.17 and 0.26, 0.513 between 0.5 and 0.55, so the
// colour is already mid-change when one scene hands over to the next.
const BASE = [
  [0.0, C.paper],
  [0.04, C.paper],
  [0.09, `color-mix(in oklab, ${C.lavender} 45%, ${C.paper})`],
  [0.13, C.lavender],
  [0.17, C.lavenderDeep],
  [0.26, C.lavenderDeep],
  [0.35, `color-mix(in oklab, ${C.lavender} 85%, ${C.coral})`],
  [0.44, `color-mix(in oklab, ${C.lavenderDeep} 72%, ${C.red})`],
  // The purple→pink handover the client asked to keep, taken in four steps.
  [0.5, `color-mix(in oklab, ${C.lavenderDeep} 52%, ${C.pink})`],
  [0.55, `color-mix(in oklab, ${C.lavenderDeep} 30%, ${C.pink})`],
  [0.6, `color-mix(in oklab, ${C.pink} 74%, ${C.paper})`],
  [0.68, `color-mix(in oklab, ${C.pink} 46%, ${C.paper})`],
  [0.78, `color-mix(in oklab, ${C.pink} 30%, ${C.paper})`],
  // The turn is at 0.84, and the ground turns with it. The resolution is carried mostly by pink, with a trace of
  // the green that means "a validated result" everywhere else in this palette.
  // Green alone did not work: the last stretch landed at rgb(230,231,216), a neutral greenish beige, and the turn
  // stopped feeling like part of the same world. Mixing more green over a lavender base made it worse, since the
  // colour spread fell from 15 to 6 because green and lavender are near-opposites and cancel to grey.
  // Pink rather than lavender, which is not obvious. Lavender is a purple, positive a and negative b in oklab,
  // while warm paper has positive b, so mixing them cancels the blue against the warmth: raising the lavender
  // from 19% to 34% moved the rendered colour from a spread of 5 to a spread of 2. Pink carries positive a and
  // positive b, so it reinforces the paper.
  [0.86, `color-mix(in oklab, ${C.pink} 20%, ${C.paper})`],
  // The one green frame, at 12% over a mostly-paper base: enough to read as the resolution, not enough to turn
  // the screen beige. A little lavender keeps the hue from going candy.
  [0.92, `color-mix(in oklab, ${C.green} 12%, color-mix(in oklab, ${C.lavender} 13%, ${C.paper}))`],
  // Then back to the colour the page opened with, arriving through a pink tint rather than draining to neutral
  // several screens early. It is C.paper itself, not a hex sampled from a screenshot, so the two ends of the
  // journey are the same value and cannot drift apart.
  [0.985, `color-mix(in oklab, ${C.pink} 9%, ${C.paper})`],
  [1.0, C.paper],
] as const;

/** The light in the room: strength of the wash, and where it falls from. */
const LIGHT = [
  [0.0, 0],
  [0.07, 0.2],
  [0.13, 0.6],
  [0.2, 0.66],
  [0.38, 0.7],
  [0.5, 0.58],
  [0.62, 0.24],
  [0.78, 0.1],
  [1.0, 0.05],
] as const;

const ANGLE = [
  [0.0, 150],
  [0.2, 168],
  [0.51, 196],
  [0.84, 208],
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
