import { useEffect, useRef, useState, type RefObject } from "react";

import { subscribe } from "@/lib/ticker";

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** Maps p from [start,end] onto 0→1. */
export const range = (p: number, start: number, end: number) =>
  clamp01((p - start) / (end - start));
/**
 * Ease-out cubic, for anything the reader has to READ.
 *
 * A linear opacity ramp spends most of its length half-transparent, so a
 * headline sitting anywhere in the middle of its own entrance looks disabled
 * rather than arriving — the client's exact words were that she thought the
 * text was an unfinished element. This reaches 0.88 by the time the ramp is
 * a third done and 0.99 by two thirds, so copy is legible almost immediately
 * and only the last sliver of the fade is faint.
 *
 * Applied to a band it also slows the exit, which is the right asymmetry:
 * arrive fast, linger, leave gently.
 */
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * A line of copy with DIRECTIONAL motion: it arrives from below and leaves
 * upward, rather than fading in and back out along the same path.
 *
 * `band` alone cannot express this, because it collapses entry and exit into
 * one number and the caller can no longer tell which is happening. The result
 * was copy that sank back down as it left, which reads as un-arriving — a
 * line that never quite made it — and is part of why the client thought a
 * faded headline was an unfinished element rather than one on its way out.
 *
 * Returns opacity and a y offset in pixels.
 */
export function beat(p: number, a: number, b: number, c: number, d: number) {
  const inn = easeOut(range(p, a, b));
  const out = range(p, c, d);
  return { o: inn * (1 - out), y: (1 - inn) * 16 - out * 22 };
}

/** Ramps 0→1→0 across [a,b] and [c,d]. Use for "hold then release" beats. */
export const band = (p: number, a: number, b: number, c: number, d: number) =>
  range(p, a, b) - range(p, c, d);

const REDUCED =
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * Progress (0 → 1) of a tall scroll-driven section, driven by a real spring
 * (stiffness + damping, integrated per frame) so values carry momentum and
 * settle with a whisper of overshoot instead of exponentially crawling in.
 *
 * The section subscribes to the shared ticker only while it is near the
 * viewport — an IntersectionObserver decides that, so an off-screen chapter
 * costs literally nothing per frame. The returned `active` flag lets a chapter
 * switch off its own ambient animation for the same reason.
 */
export function useSmoothProgress<T extends HTMLElement>(
  damping = 0.11,
): [RefObject<T | null>, number, boolean] {
  const ref = useRef<T | null>(null);
  const current = useRef(0);
  const velocity = useRef(0);
  const [value, setValue] = useState(0);
  const [active, setActive] = useState(false);

  // One viewport's margin either side, so the spring is already settled by the
  // time the section scrolls into view.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setActive(Boolean(entry?.isIntersecting)), {
      rootMargin: "100% 0px 100% 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!active) return;

    // Map the old "damping" knob onto spring constants: lower = looser/floatier.
    const stiffness = lerp(90, 210, clamp01((damping - 0.05) / 0.2));
    const friction = 2 * Math.sqrt(stiffness) * 0.82; // slightly under-damped

    return subscribe((dt) => {
      const el = ref.current;
      if (!el) return;
      // Exactly one layout read per frame — the old version took two.
      const rect = el.getBoundingClientRect();
      const span = rect.height - window.innerHeight;
      const target =
        span <= 0 ? (rect.top < window.innerHeight / 2 ? 1 : 0) : clamp01(-rect.top / span);

      if (REDUCED) {
        current.current = target;
      } else {
        const d = target - current.current;
        velocity.current += (d * stiffness - velocity.current * friction) * dt;
        current.current += velocity.current * dt;
        if (Math.abs(d) < 0.0002 && Math.abs(velocity.current) < 0.002) {
          current.current = target;
          velocity.current = 0;
        }
      }
      setValue((v) => (Math.abs(v - current.current) > 0.0003 ? current.current : v));
    });
  }, [damping, active]);

  return [ref, value, active];
}

/** Monotonic seconds since mount — ambient motion that never stops. */
export function useTime(active = true) {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!active || REDUCED) return;
    const start = performance.now();
    return subscribe((_dt, now) => setT((now - start) / 1000));
  }, [active]);
  return t;
}
/**
 * `seen` latches true the first time the element enters the viewport (for
 * one-shot reveals); `visible` tracks whether it is on screen right now, which
 * is what ambient animation should be gated on — `seen` would keep it running
 * forever once scrolled past.
 */
export function useInView<T extends HTMLElement>(
  threshold = 0.35,
): [RefObject<T | null>, boolean, boolean] {
  const ref = useRef<T | null>(null);
  const [seen, setSeen] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const on = Boolean(entry?.isIntersecting);
        setVisible(on);
        if (on) setSeen(true);
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return [ref, seen, visible];
}
