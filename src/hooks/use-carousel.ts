import { useEffect, useState, useSyncExternalStore } from "react";

/** How long one photograph stays, in ms. */
export const HOLD = 6000;

const QUERY = "(prefers-reduced-motion: reduce)";
const watchMotion = (changed: () => void) => {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", changed);
  return () => mq.removeEventListener("change", changed);
};

export type Carousel = ReturnType<typeof useCarousel>;

// Which photograph is in view, and whether the set is moving on its own. It moves only while the reader wants
// it to, is not holding it with the pointer or the keyboard, and has not asked the system for less motion.
export function useCarousel(count: number) {
  const [at, setAt] = useState(0);
  const [wanted, setWanted] = useState(true);
  const [held, setHeld] = useState(false);
  const reduced = useSyncExternalStore(
    watchMotion,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
  const playing = wanted && !reduced && count > 1;

  // One timer per photograph rather than an interval, so going to a photograph by hand gives it its full time.
  useEffect(() => {
    if (!playing || held) return;
    const id = window.setTimeout(() => setAt((i) => (i + 1) % count), HOLD);
    return () => window.clearTimeout(id);
  }, [playing, held, count, at]);

  return {
    at,
    playing,
    /** False where the reader has asked for less motion: there is then nothing to play or pause. */
    canPlay: !reduced && count > 1,
    go: (i: number) => setAt(((i % count) + count) % count),
    toggle: () => setWanted((w) => !w),
    hold: setHeld,
  };
}
