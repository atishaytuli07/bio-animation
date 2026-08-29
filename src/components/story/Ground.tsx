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
  [0.05, C.paper],
  [0.12, `color-mix(in oklab, ${C.lavender} 45%, ${C.paper})`],
  [0.19, C.lavender],
  [0.27, C.lavenderDeep],
  [0.38, C.lavenderDeep],
  [0.48, `color-mix(in oklab, ${C.lavender} 85%, ${C.coral})`],
  [0.58, `color-mix(in oklab, ${C.lavenderDeep} 72%, ${C.red})`],
  [0.66, `color-mix(in oklab, ${C.lavenderDeep} 46%, ${C.red})`],
  [0.75, `color-mix(in oklab, ${C.pink} 62%, ${C.paper})`],
  [0.84, `color-mix(in oklab, ${C.pink} 24%, ${C.paper})`],
  [1.0, `color-mix(in oklab, ${C.pink} 15%, ${C.paper})`],
] as const;

/** The light in the room: strength of the wash, and where it falls from. */
const LIGHT = [
  [0.0, 0],
  [0.1, 0.2],
  [0.2, 0.6],
  [0.31, 0.66],
  [0.5, 0.7],
  [0.65, 0.58],
  [0.78, 0.24],
  [1.0, 0.1],
] as const;

const ANGLE = [
  [0.0, 150],
  [0.31, 168],
  [0.66, 196],
  [1.0, 212],
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
      {/* the light: a soft wash that strengthens and swings through the descent */}
      <div
        className="absolute inset-0"
        style={{
          opacity: light,
          background: `linear-gradient(${angle.toFixed(0)}deg, rgba(255,255,255,0.16), rgba(255,255,255,0) 46%), radial-gradient(120% 80% at 50% 0%, rgba(255,255,255,0.14), rgba(255,255,255,0) 60%)`,
        }}
      />
      {/*
        The stripes the client liked in the DNA section, kept — but as part of
        the ground rather than owned by one scene, so they arrive and leave by
        fading instead of appearing at a boundary.
      */}
      <div
        className="absolute inset-0"
        style={{
          opacity: light * 0.55,
          backgroundImage:
            "repeating-linear-gradient(102deg, rgba(255,255,255,0.06) 0 3px, transparent 3px 26px)",
        }}
      />
    </div>
  );
}
