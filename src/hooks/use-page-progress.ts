import { useEffect, useState } from "react";

import { subscribe } from "@/lib/ticker";
import { clamp01 } from "./use-scroll-progress";

/**
 * Progress through the whole document, 0 → 1.
 *
 * Every scene already has its own local progress, which is what makes each one
 * animate. What was missing was something that knows where the reader is in
 * the STORY rather than in a section, and without that there is nothing a
 * continuous background or a persistent world can be driven by — each section
 * could only ever paint its own rectangle, which is exactly why the site read
 * as separate slides.
 *
 * Rides the shared ticker rather than a scroll listener so it costs one layout
 * read per frame alongside everything else, and it is quantised before it
 * leaves here: a background repaint every 1/500th of the page is invisible, and
 * repainting a full-viewport gradient on every pixel of scroll is not free.
 */
/**
 * Where the STORY ends, if the page says so.
 *
 * This used to divide by the whole document, which quietly made every measured
 * constant on the page a function of how much furniture followed the story.
 * Sixteen ground keyframes, five chapter thresholds, two section handoffs, the
 * header's switch and the world's density schedule are all expressed as page
 * fractions — so appending a closing section to the end of the page would have
 * moved all of them at once, by roughly the share of the page it occupied.
 * That is not a tuning problem, it is a coupling problem: the story's timeline
 * should not depend on what comes after the story.
 *
 * So the page can plant a marker at the end of the last scene and everything
 * past it is furniture. Absent the marker this behaves exactly as before, which
 * is what any other consumer of this hook still gets.
 */
const STORY_END = "story-end";

export function usePageProgress(steps = 240) {
  const [p, setP] = useState(0);

  useEffect(() => {
    let last = -1;
    return subscribe(() => {
      const doc = document.documentElement;
      const end = document.getElementById(STORY_END);
      /*
        `offsetTop` is read every frame rather than cached because the ticker
        already costs one layout read here and the marker moves with anything
        above it — a font loading late, an image settling, a viewport resize.
        A cached value would be wrong for exactly as long as it mattered.
      */
      const span = (end ? end.offsetTop : doc.scrollHeight) - window.innerHeight;
      const raw = span > 0 ? clamp01(window.scrollY / span) : 0;
      const next = Math.round(raw * steps) / steps;
      if (next !== last) {
        last = next;
        setP(next);
      }
    });
  }, [steps]);

  return p;
}

/**
 * Interpolate a value along a keyframe track.
 *
 * Keyframes are [position, value] pairs in ascending position. Returns the
 * blend factor between the two frames that bracket p, so a caller can mix
 * colours, opacities or anything else along one continuous timeline instead of
 * switching between discrete states at a boundary.
 */
export function track<T>(p: number, frames: readonly (readonly [number, T])[]) {
  if (frames.length === 0) throw new Error("track() needs at least one keyframe");
  const first = frames[0]!;
  if (p <= first[0]) return { from: first[1], to: first[1], t: 0 };
  for (let i = 1; i < frames.length; i++) {
    const a = frames[i - 1]!;
    const b = frames[i]!;
    if (p <= b[0]) {
      const span = b[0] - a[0];
      return { from: a[1], to: b[1], t: span > 0 ? (p - a[0]) / span : 0 };
    }
  }
  const last = frames[frames.length - 1]!;
  return { from: last[1], to: last[1], t: 0 };
}
