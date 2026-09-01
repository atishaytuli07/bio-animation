import { C } from "@/components/hero/palette";
import { track, usePageProgress } from "@/hooks/use-page-progress";

/**
 * The ground: one continuous surface under the entire story.
 *
 * THE PROBLEM THIS EXISTS TO SOLVE. Every scene used to paint its own
 * background inside its own sticky stage, so the reader crossed a hard edge at
 * every section boundary — cream, then suddenly full purple, then pink/purple,
 * then suddenly cream again. Three separate rectangles cannot fade into one
 * another no matter how carefully each one is animated, because at the seam the
 * old stage stops existing and the new one starts.
 *
 * So the colour is lifted out of the scenes entirely and put here: a single
 * fixed layer, driven by progress through the whole document, interpolating
 * along one timeline. Nothing about the palette changes — every colour the
 * client liked is still here, in the same order, including the purple she
 * singled out. What changes is that there is no longer a moment where one ends
 * and the next begins.
 *
 * The two-layer build (a base colour plus a gradient wash that changes
 * strength) is what gives the "lighting change" she asked for rather than a
 * flat recolour: the wash brightens and shifts angle through the descent, so
 * the room reads as lit rather than filled.
 */

/**
 * The journey, in document progress.
 *
 * Positions are MEASURED against the real section boundaries, not guessed:
 * scene one runs 0 → 0.31, the two patients 0.31 → 0.658, the bloodstream
 * 0.658 → 0.987. The important entries are the ones AT those boundaries —
 * 0.31 and 0.658 both sit mid-ramp rather than on a keyframe, so the colour is
 * already mid-change when one scene hands over to the next and there is
 * nothing for the eye to catch on.
 */
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
  /*
    The turn is at 0.84, and the ground turns with it. Green already means "a
    validated result" everywhere in this palette, so the resolution is carried
    by a colour that already means something rather than one picked for calm.
  */
  /*
    The resolution keeps a TINT, and it is LAVENDER-PINK, not green.

    Green was used here because it means "a validated result" elsewhere in this
    palette. Measured, it did not work: the last stretch landed at
    rgb(230,231,216), a neutral greenish beige, and the client's note was that
    the turn stopped feeling like part of the same world. Mixing green over a
    lavender base made it WORSE, not better — the colour spread fell from 15 to
    6, because green and lavender are near-opposites and cancel to grey.

    So the resolution is carried by the palette's own pink and lavender, which
    is what she asked for. The green meaning is still on screen where it belongs
    — in the enzyme itself.

    AND IT HAD TO BE MOSTLY PINK, not lavender, which is not obvious. Lavender
    is a purple: positive `a` and NEGATIVE `b` in oklab. Warm paper has positive
    `b`. Mixing them cancels the blue against the warmth, so raising the
    lavender from 19% to 34% moved the rendered colour from a spread of 5 to a
    spread of 2 — flatter, not richer. Pink carries positive `a` AND positive
    `b`, so it reinforces the paper instead of fighting it. A little lavender is
    still in the mix to keep the hue from going candy.
  */
  [0.86, `color-mix(in oklab, ${C.pink} 20%, ${C.paper})`],
  /*
    Green for the resolution — it already means "a validated result" in this
    palette — and then all the way back to paper for the last screen.

    Ending on the exact colour the page opened with is the point: the reader
    is returned to where they started, which is what closes the journey rather
    than just stopping it. It is C.paper itself, not a hex sampled from a
    screenshot, so the two ends are the same value and can never drift apart.
  */
  [0.92, `color-mix(in oklab, ${C.green} 12%, color-mix(in oklab, ${C.lavender} 13%, ${C.paper}))`],
  /*
    The page still ENDS on the exact colour it opened with — that symmetry is
    what closes the journey — but it arrives there from a tinted resolution
    rather than draining to neutral several screens early.
  */
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

/**
 * The surface pattern's own opacity track — deliberately NOT tied to `light`.
 *
 * It used to ride `light * 0.55`, which meant the texture rose and fell with
 * the lighting. Lighting is a mood; a surface is a fact. When the hero's colour
 * field (which painted its own identical stripes at a higher alpha) dissolved
 * into this layer, the pattern dropped fivefold and stayed there. The stripes
 * now live here alone, and this track holds them CONSTANT for the whole
 * coloured stretch of the story.
 *
 * It ramps up while the hero's field is still opaque on top of it, so by the
 * time that field begins to fade at page 0.069 the surface underneath is
 * already identical and there is nothing to see change. It leaves only at the
 * very end, as the ground returns to cream and white-on-cream stripes would be
 * invisible anyway.
 */
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

  // color-mix nests, so two arbitrary keyframe colours blend without needing
  // to parse either of them into channels.
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
      {/*
        The light falls on the SUBJECT, not on the type.

        The bloom used to sit at 50% 0% — the top centre of the frame, which is
        exactly where every headline is pinned. It made the copy band the
        brightest part of the screen, so cream type on it measured 2.84:1 and
        the fix looked like it had to be inverting the type to near-black. It
        did not. Moving the light down onto the figures, and letting the top of
        the frame fall away, is how the scene would actually be lit — and it
        gives the copy band its depth back without a scrim behind any word.
      */}
      <div
        className="absolute inset-0"
        style={{
          opacity: light,
          background: `linear-gradient(${angle.toFixed(0)}deg, rgba(255,255,255,0.14), rgba(255,255,255,0) 52%), radial-gradient(95% 62% at 50% 64%, rgba(255,255,255,0.2), rgba(255,255,255,0) 72%)`,
        }}
      />
      {/*
        The top of the room, further from the light. Scaled by the same `light`
        value so it exists only where there is a lit field to fall away from —
        on the cream sections at either end it is absent entirely.
      */}
      <div
        className="absolute inset-x-0 top-0 h-[46%]"
        style={{
          opacity: light,
          background: `linear-gradient(180deg, ${C.ink}5e, ${C.ink}00)`,
        }}
      />
      {/*
        The stripes the client liked in the DNA section — and now the ONLY
        place on the site that draws them.

        The hero's colour field used to paint its own copy at a different alpha,
        so the handover between the two was a visible fivefold drop in texture.
        A surface belongs to the environment, not to whichever scene happens to
        be on screen, so it is declared once here and held constant across every
        beat. See PATTERN above and `.env-stripes` in styles.css.

        The wrapper clips; the inner element is 300% tall and drifts upward by
        transform, which composites. Animating the background-position instead
        repaints the full viewport every frame and measured about 9fps.
      */}
      <div className="absolute inset-0 overflow-hidden" style={{ opacity: pattern }}>
        <span className="env-stripes absolute inset-x-0 top-0 block h-[300%]" />
      </div>
    </div>
  );
}
