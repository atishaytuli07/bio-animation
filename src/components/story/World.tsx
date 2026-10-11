import { Cell } from "@/components/hero/elements";
import { C } from "@/components/hero/palette";
import { track, usePageProgress } from "@/hooks/use-page-progress";

// The world: one set of scientific objects that travels the whole story.
// Everything moves by transform, never by `top`. Setting `top` on all 42 elements each frame lays out the whole
// layer every frame: it measured 43fps and 106 layout shifts across a scroll of the page. The container is fixed
// and viewport-sized, so a percentage of it is exactly vh and the identical motion composites for free.
// Each scene used to scatter its own array, so the objects vanished and a different set appeared at every
// boundary. These are declared once and drift continuously, from the gene to the bloodstream.
// They drift upward as the page scrolls down, at speeds set by depth: the reader is descending past them.
// Density is scheduled, not constant. The client's note was that the DNA section feels rich while later screens
// feel empty, naming the sequence arrival alone in a large purple space, so presence peaks where a scene is
// otherwise sparse and drops back where a scene carries its own weight.

/** Presence across the story: high where a scene is sparse, low where it is busy. */
const DENSITY = [
  [0.0, 0.5], // hero — the helix already fills the frame
  [0.08, 0.75],
  [0.125, 0.8], // the descent, deep in the purple
  // The letter changes between 0.143 and 0.156. This was the densest stretch of the story, 30 drifting things
  // around the one change the reader is here to see, so the world steps back for it and returns for the retreat.
  [0.14, 0.4],
  [0.16, 0.4],
  [0.19, 0.8],
  [0.24, 0.4], // the enzyme bridge: copy + diagram, so pull back
  [0.33, 0.28], // the two patients carry their own frame
  [0.46, 0.24],
  // Act one of the bloodstream is the densest screen on the site: figure, vessel, molecules, a tag and a control. The
  // client asked for the ambient elements to stop competing there, so this is the quietest the world gets.
  [0.582, 0.28],
  [0.799, 0.42], // after the turn the frame is calmer, so the world breathes
  [1.0, 0.46],
] as const;

// x is a viewport percentage. Depth drives both parallax speed and blur, so the field has real front-to-back
// separation rather than being a flat sprinkle, and everything sits outside the centre column where the copy and
// figures live.
// That rule is right for every scene except the first. The hero is the only screen whose copy is left-aligned,
// so objects at x=6..21, safely outside a centre column, land on its headline, paragraph and buttons.
// `heroClear` steps them back while the hero is on screen and releases them once the descent begins.
// Cells only. There were sixteen objects here, ten of them drug molecules and enzymes: the shapes the story
// uses for 5-FU and for DPD, drifting through the gene scenes before either had been introduced.
const OBJECTS = [
  { x: 6, s: 0.5, tone: C.pink, depth: 0.9, phase: 0.05 },
  { x: 14, s: 0.3, tone: C.blue, depth: 0.5, phase: 0.62 },
  { x: 9, s: 0.36, tone: C.blue, depth: 0.55, phase: 0.31 },
  { x: 21, s: 0.22, tone: C.pink, depth: 0.16, phase: 0.93 },
  { x: 94, s: 0.46, tone: C.blue, depth: 0.85, phase: 0.2 },
  { x: 81, s: 0.26, tone: C.pink, depth: 0.22, phase: 0.11 },
  { x: 88, s: 0.24, tone: C.blue, depth: 0.4, phase: 0.58 },
  { x: 92, s: 0.3, tone: C.pink, depth: 0.72, phase: 0.82 },
] as const;

// Particles. Cheap, tiny, and they fill the deep middle of a frame without putting anything there the reader
// has to interpret. This is the particles and depth the client asked for, and the reason the sequence arrival no
// longer reads as an object alone in a void.
// Fourteen, where there were twenty-six: about twenty were on screen in every frame of the story, which is not
// depth, it is weather. None is coral, because coral is the drug and these drift through the gene scenes before
// the drug exists.
const MOTES = Array.from({ length: 14 }, (_, i) => ({
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

  // 1 while the hero fills the screen, 0 once the reader has scrolled past it. Holds the left-hand objects back
  // over the hero's copy column, the one place in the story where content is not centred.
  const overHero = Math.max(0, 1 - p / 0.085);
  /** How much an object at this x is suppressed while the hero is up. */
  const heroClear = (x: number) => (x < 44 ? 1 - overHero : 1);

  // The header band. Objects drift through the top of the viewport and one sat directly behind the logo; this
  // layer is behind the chrome, so it read as a smudge under the mark rather than as depth. Faded by position
  // rather than by a mask on the container: a mask on a -z-10 layer did not take, and fading each object as it
  // enters the band means they dim on the way in instead of popping.
  const headerClear = (topVh: number) => Math.min(1, Math.max(0, (topVh - 7) / 9));

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
              top: 0,
              transform: `translate(-50%, -50%) translateY(${(-10 + y * 120).toFixed(2)}vh)`,
              width: m.r * 2,
              height: m.r * 2,
              background: i % 3 === 0 ? C.pink : C.paper,
              opacity:
                Math.round(
                  edge *
                    density *
                    heroClear(m.x) *
                    headerClear(-10 + y * 120) *
                    (0.18 + m.depth * 0.34) *
                    20,
                ) / 20,
            }}
          />
        );
      })}

      {OBJECTS.map((o, i) => {
        // Travel wraps, so the supply never runs out over 13 screens of scroll. Deeper objects move less, which is what
        // reads as distance. The 1.3 span and the -15 offset keep the wrap point off-screen at both ends.
        const travel = 0.35 + o.depth * 1.15;
        const y = (((o.phase - p * travel) % 1) + 1) % 1;
        const top = -15 + y * 130;

        // Fade at both wrap edges so nothing ever pops in or out mid-frame.
        const edge = Math.min(1, Math.min(y, 1 - y) / 0.12);

        return (
          <div
            key={i}
            // Wide screens only. On a phone the scene fills the frame and a cell had nowhere to drift but across
            // it: one sat on the patient's label and another on the enzyme caption.
            className="absolute hidden md:block"
            style={{
              left: `${o.x}%`,
              top: 0,
              transform: `translate(-50%,-50%) translateY(${top.toFixed(2)}vh) rotate(${(i * 47) % 360}deg)`,
              opacity:
                Math.round(
                  edge * density * heroClear(o.x) * headerClear(top) * (0.62 + o.depth * 0.38) * 20,
                ) / 20,
              // Depth by blur, but far less of it. At 1.5px the far objects stopped reading as cells and molecules and read
              // as smudges on the field. 0.8px is still enough to sit them behind the subject.
              filter: o.depth > 0.7 ? undefined : `blur(${((1 - o.depth) * 0.8).toFixed(2)}px)`,
            }}
          >
            <Cell s={o.s} tone={o.tone} />
          </div>
        );
      })}
    </div>
  );
}
