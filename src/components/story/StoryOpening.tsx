import { Suspense, lazy, memo, useEffect, useState } from "react";

import {
  band,
  clamp01,
  lerp,
  range,
  useSmoothProgress,
  useTime,
} from "@/hooks/use-scroll-progress";
import { sceneState } from "@/three/state";
import { TONE, Reveal, BodyFigure, ECG, Helix as HelixSVG } from "./visuals";

const Scene = lazy(() => import("@/three/Scene"));

/**
 * The opening — ONE continuous scene, replacing the old HeroSplash +
 * ChapterOpening pair.
 *
 * The client asked for three things that the two-section version couldn't do:
 * "I don't want the website to open mainly with text", "the opening visual
 * should evolve into the story", and "start with the patient, not the
 * science". All three are structural, so this is one section with one stage
 * and five beats:
 *
 *   0.00–0.10  the helix alone, turning. No words at all.
 *   0.10–0.36  it drifts aside; ChemoGuard arrives beside it.
 *   0.36–0.56  THE PULL-OUT — the camera retreats from the strand and two
 *              people resolve out of the cell field. The DNA doesn't get
 *              swapped for the story; the story is what the DNA was inside.
 *   0.56–0.84  the same dose runs into both. One clears it. One doesn't.
 *   0.84–1.00  the thesis, stated once, after the visuals have earned it.
 *
 * Opening on DNA-as-an-object rather than DNA-as-science is what lets the
 * first frame be a visual and the first *story* beat still be a person: there
 * is no jargon on screen until The Discovery, three chapters later.
 */

/** Ambient field of blood cells drifting at different depths. */
const FIELD = Array.from({ length: 16 }, (_, i) => ({
  x: (i * 61) % 100,
  y: (i * 37 + 11) % 100,
  size: 14 + ((i * 23) % 52),
  red: i % 3 === 0,
  depth: 0.3 + ((i * 13) % 7) / 10, // 0.3 near … 1.0 far
  phase: (i * 1.7) % (Math.PI * 2),
}));

export function CellField({
  p,
  active,
  swell = 0,
}: {
  p: number;
  active: boolean;
  /** 0→1 across the pull-out: cells surge past as the camera retreats. */
  swell?: number;
}) {
  const t = useTime(active);
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      {FIELD.map((c, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${c.x}%`,
            top: `${c.y}%`,
            width: c.size,
            height: c.size * 0.9,
            background: c.red
              ? `color-mix(in oklab, var(--signal) ${lerp(85, 55, c.depth)}%, var(--paper))`
              : `color-mix(in oklab, var(--ink) ${lerp(16, 8, c.depth)}%, var(--paper))`,
            // far cells blur — cheap depth, exactly the reference's trick
            filter: c.depth > 0.65 ? `blur(${(c.depth - 0.6) * 9}px)` : undefined,
            transform: `translate3d(${Math.sin(t * 0.3 + c.phase) * 14 * (1 - c.depth)}px, ${
              Math.cos(t * 0.24 + c.phase) * 10 * (1 - c.depth) - p * 120 * (1 - c.depth)
            }px, 0) scale(${1 + swell * (1 - c.depth) * 1.5})`,
            boxShadow: c.red ? "inset -3px -4px 8px oklch(0 0 0 / 0.12)" : undefined,
            opacity: lerp(0.9, 0.45, c.depth) * (1 - swell * 0.25),
          }}
        />
      ))}
    </div>
  );
}

/** A vertical IV drip of drug particles entering a body. */
function Drip({ on, alarm, active }: { on: number; alarm: number; active: boolean }) {
  const t = useTime(active);
  if (on <= 0.01) return null;
  return (
    <svg viewBox="0 0 40 120" className="h-28 w-10" aria-hidden="true">
      <line x1="20" y1="0" x2="20" y2="120" stroke={TONE(0.14)} strokeWidth="1" />
      {Array.from({ length: 6 }).map((_, i) => {
        const phase = (((t * 0.35 + i / 6) % 1) + 1) % 1;
        return (
          <circle
            key={i}
            cx="20"
            cy={phase * 120}
            r={2.6}
            fill={alarm > 0.4 ? "var(--alarm)" : "var(--coral)"}
            opacity={on * (0.3 + 0.7 * Math.sin(phase * Math.PI))}
          />
        );
      })}
    </svg>
  );
}

function Patient({
  label,
  alarm,
  bpm,
  drip,
  cleared,
  active,
}: {
  label: string;
  alarm: number;
  bpm: number;
  drip: number;
  cleared: number;
  active: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <Drip on={drip} alarm={alarm} active={active} />
      {/* Sized down on phones: at 26vh on an 844px-tall screen the two figures
          plus the gap overflowed 390px and clipped both labels. */}
      <BodyFigure
        className="h-[17vh] min-h-28 md:h-[26vh] md:min-h-40"
        stroke={TONE(0.45)}
        alarm={alarm}
        animate={active}
      />
      <div className="mt-3 h-10 w-24 md:w-40">
        <ECG
          bpm={bpm}
          color={alarm > 0.4 ? "var(--alarm)" : cleared > 0.4 ? "var(--vital)" : TONE(0.6)}
          className="h-8 w-full"
        />
      </div>
      <span className="hand-note mt-1" style={{ color: TONE(0.5) }}>
        {label}
      </span>
    </div>
  );
}

const SceneHost = memo(function SceneHost() {
  return (
    <Suspense fallback={null}>
      <Scene />
    </Suspense>
  );
});

/**
 * Camera distance at rest and at the end of the pull-out.
 *
 * With fov 50 the visible height is 2·z·tan(25°) ≈ 0.93·z world units, and the
 * strand spans 40, so z = 44 frames the whole molecule with a little air
 * either end. The old hero sat at 11.5 — one turn of red tube filling the
 * screen, which is exactly the client's "the 3D model feels quite abstract and
 * oversized". A complete object reads as DNA instantly; a crop of one reads as
 * decoration.
 */
const IDLE_Z = 44;
const PULLED_Z = 92;

function isCapable() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return false;
  if ((navigator.hardwareConcurrency ?? 8) < 4) return false;
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") ?? c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function StoryOpening() {
  const [ref, p, active] = useSmoothProgress<HTMLElement>(0.1);
  const [capable, setCapable] = useState(false);

  // Deferred by one frame on purpose. Setting this synchronously inside the
  // mount effect loses the update — the first committed instance is replaced
  // during hydration and the setter goes with it. An update raised from a
  // later callback lands on the surviving instance, which is also why the
  // IntersectionObserver-driven flags in useSmoothProgress work.
  useEffect(() => {
    const id = requestAnimationFrame(() => setCapable(isCapable()));
    return () => cancelAnimationFrame(id);
  }, []);

  // Nearness is tracked with a plain scroll listener that starts `true`, NOT
  // with the hook's IntersectionObserver `active`. The opening is the first
  // thing on the page: gating it on `active` leaves the first frame empty
  // until hydration lands, which on a slow phone is exactly the blank hero
  // the loader used to paper over.
  const [near, setNear] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const r = el.getBoundingClientRect();
      setNear(r.bottom > -window.innerHeight * 0.3 && r.top < window.innerHeight);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [ref]);

  /* ---- beats ---------------------------------------------------------- */

  // 1. The helix owns the frame alone, then slides aside for the wordmark.
  const aside = range(p, 0.1, 0.3);
  const brand = range(p, 0.14, 0.32);

  // 2. The pull-out. camZ retreats, the strand shrinks away and the cell
  //    field surges past — the camera is leaving the nucleus for the ward.
  const pullOut = range(p, 0.36, 0.58);

  // 3. The people the strand was inside.
  const figuresIn = range(p, 0.44, 0.62);
  const drip = band(p, 0.58, 0.66, 0.9, 0.97);
  const diverge = range(p, 0.68, 0.84);
  const title = range(p, 0.84, 0.96);

  // The scroll cue is the only mark on screen in the first beat, and it leaves
  // the moment the reader proves they don't need it.
  const cue = 1 - range(p, 0.03, 0.09);

  // Drive the real camera, so the pull-out is 3D depth rather than a CSS
  // scale. Written every frame the section is near — the Discovery dive owns
  // sceneState further down the page, so we re-assert the idle pose here.
  useEffect(() => {
    if (!near) return;
    sceneState.camX = 0;
    sceneState.camY = 0;
    // IDLE_Z frames roughly three full turns of the 40-unit strand. The old
    // hero sat at 11.5, which cropped it to a single turn of red tube — the
    // client's "the 3D model feels quite abstract and oversized". Recognisable
    // beats imposing: you should read "DNA" before you read anything else.
    sceneState.camZ = lerp(IDLE_Z, PULLED_Z, pullOut * pullOut); // eased: slow, then away
    sceneState.lookY = 0;
    sceneState.desat = 0;
    sceneState.variant = 0;
    sceneState.variantScale = 0;
    sceneState.dive = 0;
  }, [near, pullOut]);

  // Unmount the strand once it has receded — nothing left to draw, and the GL
  // context is better spent on the Discovery dive further down.
  const showStrand = near && pullOut < 0.995;

  return (
    <section id="opening" ref={ref} className="relative" style={{ height: "560vh" }}>
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <CellField p={p * 0.35} active={active} swell={pullOut} />

        {/* ---- the strand: centre stage first, then aside, then away ---- */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            opacity: (1 - range(p, 0.42, 0.58)) * (capable ? 1 : 0.9),
            transform: `translateX(${lerp(0, 22, aside)}%) scale(${lerp(1, 0.86, aside)})`,
            transition: "none",
          }}
        >
          {showStrand ? (
            capable ? (
              <SceneHost />
            ) : (
              <div className="flex h-full items-center justify-center">
                <HelixSVG spin={0.6} rungs={22} stroke="var(--pink)" className="h-[70vh]" animate />
              </div>
            )
          ) : null}
        </div>

        {/* ---- the brand, arriving second ------------------------------- */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-full flex-col justify-center px-6 md:w-[52%] md:pl-[8vw] lg:pl-[10vw]"
          style={{
            opacity: brand * (1 - range(p, 0.4, 0.5)),
            transform: `translateY(${lerp(18, 0, brand)}px)`,
          }}
        >
          <h1 className="poster-line" style={{ fontSize: "clamp(3rem, 8vw, 7rem)" }}>
            {/* Two words, two brand colours, no offset shadow. The mockup's
                hard drop-shadow turned pink-on-cream to mud at this size and
                fought the "premium and polished" the client asked for; the
                wordmark in the nav uses the same ink/signal pair. */}
            <span className="block" style={{ color: "var(--ink)" }}>
              Chemo
            </span>
            <span className="block pl-[0.6em]" style={{ color: "var(--signal)" }}>
              Guard
            </span>
          </h1>
          <p
            className="mt-7 max-w-sm text-base leading-relaxed md:text-lg"
            style={{ color: "var(--ink-soft)" }}
          >
            Precision starts in your DNA.
          </p>
        </div>

        {/* ---- the two patients the strand was inside -------------------- */}
        <div
          className="relative flex items-end justify-center gap-[5vw] px-4 md:gap-[12vw] md:px-6"
          style={{
            opacity: figuresIn,
            transform: `translateY(${lerp(22, 0, figuresIn)}vh) scale(${lerp(0.82, 1, figuresIn)})`,
            visibility: figuresIn > 0.01 ? "visible" : "hidden",
          }}
        >
          <Patient
            label="patient one"
            alarm={0}
            bpm={lerp(70, 72, p)}
            drip={drip}
            cleared={diverge}
            active={active}
          />
          <div
            className="hand-note pb-16 text-center text-xs md:pb-24 md:text-base"
            style={{ color: TONE(0.55), opacity: band(p, 0.6, 0.68, 0.86, 0.93) }}
          >
            the same dose
            <span className="mx-auto mt-2 block h-px w-16" style={{ background: TONE(0.25) }} />
          </div>
          <Patient
            label="patient two"
            alarm={diverge}
            bpm={lerp(70, 138, diverge)}
            drip={drip}
            cleared={0}
            active={active}
          />
        </div>

        {/* ---- the thesis, once, at the end ----------------------------- */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-[9vh] px-6 text-center"
          style={{ opacity: title }}
        >
          {/* Poster face, not the serif. The hero being Archivo Black while
              every chapter headline was Newsreader is what made the site read
              as two websites stitched together (decision 7). */}
          <Reveal
            text={"Same treatment.\nDifferent outcome."}
            t={title}
            className="poster-head"
            style={{ color: TONE(0.97) }}
          />
        </div>

        <div
          className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
          style={{ opacity: clamp01(cue) }}
        >
          <span className="hand-note" style={{ color: TONE(0.45) }}>
            scroll
          </span>
          <span
            className="block h-8 w-px"
            style={{ background: "linear-gradient(var(--hairline-strong), transparent)" }}
          />
        </div>
      </div>
    </section>
  );
}
