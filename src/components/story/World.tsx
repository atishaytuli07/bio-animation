import { Cell, Enzyme, Molecule } from "@/components/hero/elements";
import { C } from "@/components/hero/palette";
import { track, usePageProgress } from "@/hooks/use-page-progress";

/**
 * The world: one set of scientific objects that travels the whole story.
 *
 * Each scene used to scatter its own array of cells and molecules, which meant
 * the objects vanished and a different set appeared at every boundary — part of
 * why the site read as separate stages rather than one journey. These are
 * declared once and drift continuously, so the same world carries the reader
 * from the gene to the bloodstream.
 *
 * They also drift UPWARD as the page scrolls down, at speeds set by depth. The
 * reader is descending past them, which is the same idea the whole story runs
 * on — the scroll is a microscope going deeper — and it means no screen is ever
 * completely still.
 *
 * DENSITY IS SCHEDULED, not constant. The client's note was that the DNA
 * section feels rich while later screens feel empty, and named the sequence
 * arrival sitting alone in a large purple space. So presence peaks exactly
 * where a scene is otherwise sparse and drops back where a scene is carrying
 * its own weight — detail where it is missing, restraint where it would
 * clutter.
 */

/** Presence across the story: high where a scene is sparse, low where it is busy. */
const DENSITY = [
  [0.0, 0.5], // hero — the helix already fills the frame
  [0.12, 0.75],
  [0.2, 0.92], // the descent, deep in the purple
  [0.28, 1.0], // the sequence arrival — the emptiest frame in the story
  [0.34, 0.85],
  [0.44, 0.45], // the two patients carry their own frame
  [0.6, 0.42],
  [0.72, 0.8], // into the bloodstream
  [0.86, 0.55],
  [1.0, 0.4],
] as const;

/**
 * x is a viewport percentage; depth drives both parallax speed and blur, so
 * the field has real front-to-back separation rather than being a flat sprinkle.
 * Everything sits outside the centre column, where the copy and figures live.
 */
const OBJECTS = [
  { k: "cell", x: 6, s: 0.5, tone: C.pink, depth: 0.9, phase: 0.05, sm: true },
  { k: "mol", x: 13, s: 0.34, tone: C.coral, depth: 0.45, phase: 0.62, sm: false },
  { k: "enz", x: 4, s: 0.38, tone: C.green, depth: 0.3, phase: 0.31, sm: false },
  { k: "mol", x: 18, s: 0.28, tone: C.coral, depth: 0.62, phase: 0.87, sm: false },
  { k: "cell", x: 9, s: 0.36, tone: C.blue, depth: 0.55, phase: 0.44, sm: false },
  { k: "enz", x: 16, s: 0.24, tone: C.green, depth: 0.2, phase: 0.15, sm: false },
  { k: "mol", x: 3, s: 0.26, tone: C.lavender, depth: 0.36, phase: 0.71, sm: false },
  { k: "cell", x: 21, s: 0.22, tone: C.pink, depth: 0.16, phase: 0.93, sm: false },
  { k: "cell", x: 94, s: 0.46, tone: C.blue, depth: 0.85, phase: 0.2, sm: true },
  { k: "enz", x: 87, s: 0.36, tone: C.green, depth: 0.4, phase: 0.74, sm: false },
  { k: "mol", x: 96, s: 0.3, tone: C.coral, depth: 0.28, phase: 0.45, sm: false },
  { k: "cell", x: 81, s: 0.26, tone: C.pink, depth: 0.22, phase: 0.11, sm: false },
  { k: "mol", x: 90, s: 0.24, tone: C.lavender, depth: 0.5, phase: 0.58, sm: false },
  { k: "enz", x: 98, s: 0.28, tone: C.green, depth: 0.66, phase: 0.03, sm: false },
  { k: "mol", x: 84, s: 0.2, tone: C.coral, depth: 0.14, phase: 0.36, sm: false },
  { k: "cell", x: 92, s: 0.3, tone: C.pink, depth: 0.72, phase: 0.82, sm: false },
] as const;

/**
 * Particles. Cheap, tiny, and they do the job the illustrated objects cannot:
 * fill the deep middle of a frame without putting anything there the reader
 * has to interpret. This is the "particles / depth" the client asked for, and
 * the reason the sequence arrival no longer reads as an object alone in a void.
 */
const MOTES = Array.from({ length: 26 }, (_, i) => ({
  x: (i * 37.4) % 100,
  phase: (i * 0.173) % 1,
  r: 1.5 + ((i * 7) % 5) * 0.7,
  depth: 0.15 + ((i * 13) % 9) / 12,
}));

const num = (p: number, frames: readonly (readonly [number, number])[]) => {
  const { from, to, t } = track(p, frames);
  return from + (to - from) * t;
};

export function World() {
  const p = usePageProgress();
  const density = num(p, DENSITY);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {MOTES.map((m, i) => {
        const travel = 0.3 + m.depth * 1.6;
        const y = (((m.phase - p * travel) % 1) + 1) % 1;
        const edge = Math.min(1, Math.min(y, 1 - y) / 0.14);
        return (
          <div
            key={`m${i}`}
            className="absolute rounded-full"
            style={{
              left: `${m.x}%`,
              top: `${(-10 + y * 120).toFixed(2)}%`,
              width: m.r * 2,
              height: m.r * 2,
              background: i % 5 === 0 ? C.coral : i % 3 === 0 ? C.pink : C.paper,
              opacity: Math.round(edge * density * (0.1 + m.depth * 0.3) * 20) / 20,
            }}
          />
        );
      })}

      {OBJECTS.map((o, i) => {
        /*
          Travel wraps, so the supply never runs out over 13 screens of scroll.
          Deeper objects move less, which is what reads as distance. The 1.3
          span and the -15 offset keep the wrap point off-screen at both ends.
        */
        const travel = 0.35 + o.depth * 1.15;
        const y = (((o.phase - p * travel) % 1) + 1) % 1;
        const top = -15 + y * 130;

        // Fade at both wrap edges so nothing ever pops in or out mid-frame.
        const edge = Math.min(1, Math.min(y, 1 - y) / 0.12);

        return (
          <div
            key={i}
            className={o.sm ? "absolute" : "absolute hidden md:block"}
            style={{
              left: `${o.x}%`,
              top: `${top.toFixed(2)}%`,
              transform: `translate(-50%,-50%) rotate(${(i * 47) % 360}deg)`,
              opacity: Math.round(edge * density * (0.4 + o.depth * 0.5) * 20) / 20,
              filter: o.depth > 0.7 ? undefined : `blur(${((1 - o.depth) * 1.5).toFixed(2)}px)`,
            }}
          >
            {o.k === "cell" ? (
              <Cell s={o.s} tone={o.tone} />
            ) : o.k === "mol" ? (
              <Molecule s={o.s} tone={o.tone} />
            ) : (
              <Enzyme s={o.s} tone={o.tone} />
            )}
          </div>
        );
      })}
    </div>
  );
}
