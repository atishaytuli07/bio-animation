import { Suspense, lazy, memo, useCallback, useEffect, useState } from "react";

import { clamp01, lerp, range, useSmoothProgress } from "@/hooks/use-scroll-progress";
import { sceneState } from "@/three/state";
// RevealCSS for the title (must paint before hydration); Reveal for the
// mid-scroll beat, which is genuinely scrubbed by scroll position.
import { Helix as HelixSVG, Reveal, RevealCSS } from "./visuals";

const Scene = lazy(() => import("@/three/Scene"));

/**
 * The scroll spring sets state every frame, so ChapterHero re-renders at 60fps.
 * The canvas must not re-reconcile with it — memo with no props bails out of
 * every one of those renders, leaving the scene graph alone. All per-frame 3D
 * values travel through sceneState instead.
 *
 * The Suspense fallback is null on purpose: the SVG placeholder lives *under*
 * this layer rather than inside it, so there is never a frame with no helix.
 */
const SceneHost = memo(function SceneHost({ onReady }: { onReady: () => void }) {
  return (
    <Suspense fallback={null}>
      <Scene onReady={onReady} />
    </Suspense>
  );
});

/**
 * WebGL is opt-in, not assumed. A machine that fails any of these gets the
 * static SVG helix instead — same composition, no canvas, no cost.
 */
function isCapable() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return false;
  if ((navigator.hardwareConcurrency ?? 8) < 4) return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") ??
      canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl"),
    );
  } catch {
    return false;
  }
}

/**
 * Flanking context around the variant. Deliberately short and bracketed by
 * ellipses so it reads as an excerpt rather than a claim about the full locus.
 *
 * NOTE: these flanking bases are illustrative, not the verified reference
 * sequence at chr1:97,450,058. Replace them with the real flank before this
 * goes in front of judges.
 */
const FLANK_LEFT = "ACGATC".split("");
const FLANK_RIGHT = "ATCGGT".split("");
const REF_BASE = "G";
const ALT_BASE = "A";

/** The variant readout that lights up once the camera finds it. */
function VariantCallout({ on }: { on: number }) {
  const lit = on > 0.45;
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-[14vh] px-6"
      style={{ opacity: on, transform: `translateY(${lerp(24, 0, on)}px)` }}
    >
      {/*
        The scrim is its own layer, extended past the content box and masked to
        transparent at both ends. Painting it as this element's own background
        clipped the gradient at the box edge, which drew two hard horizontal
        lines across the helix.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -inset-y-20"
        style={{
          background:
            "radial-gradient(66% 76% at 50% 50%, color-mix(in oklab, var(--paper) 92%, transparent), color-mix(in oklab, var(--paper) 62%, transparent) 46%, transparent 78%)",
          maskImage: "linear-gradient(to bottom, transparent, black 26%, black 74%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent, black 26%, black 74%, transparent)",
        }}
      />

      <div className="relative flex flex-col items-center gap-5">
        <p className="eyebrow" style={{ color: "var(--ink-faint)" }}>
          Chromosome 1 · 1p21.3 · DPYD
        </p>

        {/*
          Set as type, not as UI. Twenty-eight identical bordered chips read as
          a keyboard; bare monospace with one solid tile reads as a genome with
          one thing wrong in it. The reference base sits directly above the
          variant on a shared vertical axis, so "G became A" is one glance.
        */}
        <div
          className="flex items-center justify-center pt-8 font-mono text-lg md:text-2xl"
          style={{ letterSpacing: "0.34em" }}
        >
          <span style={{ color: "var(--ink-faint)", opacity: 0.5 }}>…</span>
          {FLANK_LEFT.map((b, i) => (
            <span key={`l${i}`} style={{ color: "var(--ink-soft)", opacity: 0.55 }}>
              {b}
            </span>
          ))}

          <span className="relative mx-1 inline-flex flex-col items-center">
            {/* what it used to be, on the same axis as what it became */}
            <span
              className="absolute bottom-full flex flex-col items-center"
              style={{
                opacity: lit ? clamp01(on * 2 - 0.9) : 0,
                transition: "opacity .45s ease",
              }}
            >
              <span
                className="text-sm leading-none line-through"
                style={{ color: "var(--ink-faint)", letterSpacing: 0 }}
              >
                {REF_BASE}
              </span>
              <span
                className="mt-1.5 block w-px"
                style={{ height: 14, background: "var(--hairline-strong)" }}
              />
            </span>

            <span
              className="inline-flex h-10 w-9 items-center justify-center rounded-[4px] md:h-11 md:w-10"
              style={{
                background: lit ? "var(--signal)" : "transparent",
                border: `1px solid ${lit ? "var(--signal)" : "var(--hairline)"}`,
                color: lit ? "#fff" : "var(--ink-soft)",
                letterSpacing: 0,
                transform: `scale(${lit ? 1 + on * 0.08 : 1})`,
                boxShadow: lit ? "0 10px 30px -10px var(--signal)" : "none",
                transition: "all .5s cubic-bezier(.18,1.4,.36,1)",
              }}
            >
              {lit ? ALT_BASE : REF_BASE}
            </span>
          </span>

          {FLANK_RIGHT.map((b, i) => (
            <span key={`r${i}`} style={{ color: "var(--ink-soft)", opacity: 0.55 }}>
              {b}
            </span>
          ))}
          <span style={{ color: "var(--ink-faint)", opacity: 0.5 }}>…</span>
        </div>

        <p
          className="max-w-xl text-center text-sm md:text-base"
          style={{
            color: "var(--ink-soft)",
            opacity: clamp01(on * 1.6 - 0.6),
            textWrap: "balance",
          }}
        >
          <span className="font-mono" style={{ color: "var(--signal)" }}>
            c.1905+1G&gt;A
          </span>{" "}
          — one letter. The enzyme that clears the drug is never built.
        </p>
      </div>
    </div>
  );
}

/**
 * A quiet note that the molecule is still arriving. Deliberately not a spinner
 * or a full-screen overlay: the placeholder helix is already on screen, so this
 * only has to explain the difference. It waits 500ms before appearing, so a
 * fast connection never flashes it.
 */
function LoadingNote({ show }: { show: boolean }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!show) {
      setVisible(false);
      return;
    }
    const id = setTimeout(() => setVisible(true), 500);
    return () => clearTimeout(id);
  }, [show]);

  return (
    <div
      className="pointer-events-none absolute bottom-10 right-8 hidden items-center gap-3 md:flex"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 400ms ease" }}
      aria-hidden="true"
    >
      <span
        className="relative block h-0.5 w-16 overflow-hidden rounded-full"
        style={{ background: "color-mix(in oklab, var(--violet) 18%, transparent)" }}
      >
        <span className="sweep absolute inset-y-0 w-1/3" style={{ background: "var(--violet)" }} />
      </span>
      <span className="hand-note" style={{ color: "var(--ink-soft)" }}>
        rendering helix…
      </span>
    </div>
  );
}

const AURORA = [
  { c: "var(--violet)", x: 22, y: 30, size: 46, cls: "aurora-a" },
  { c: "var(--coral)", x: 76, y: 38, size: 40, cls: "aurora-b" },
  { c: "var(--cyan)", x: 50, y: 74, size: 44, cls: "aurora-c" },
];

/**
 * Slow-drifting colour wash behind the helix — it stops the page reading as
 * flat white. The drift is CSS keyframes on transform, not a per-frame JS
 * recompute, so it costs nothing on the main thread and stops under
 * prefers-reduced-motion for free.
 */
function Aurora({ intensity }: { intensity: number }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ opacity: intensity }}
    >
      {AURORA.map((b) => (
        <div
          key={b.cls}
          className={`absolute inset-0 ${b.cls}`}
          style={{
            background: `radial-gradient(${b.size}% ${b.size * 0.8}% at ${b.x}% ${b.y}%, color-mix(in oklab, ${b.c} 24%, transparent), transparent 68%)`,
            willChange: "transform",
          }}
        />
      ))}
    </div>
  );
}

export function ChapterHero({ onStageReady }: { onStageReady?: () => void }) {
  const [ref, p] = useSmoothProgress<HTMLElement>(0.1);
  const [capable, setCapable] = useState(false);
  const [near, setNear] = useState(true);
  const [sceneReady, setSceneReady] = useState(false);
  const onSceneReady = useCallback(() => {
    setSceneReady(true);
    onStageReady?.();
  }, [onStageReady]);

  useEffect(() => {
    const ok = isCapable();
    setCapable(ok);
    // No WebGL path — the SVG placeholder IS the stage, so it is ready now.
    if (!ok) onStageReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mount the canvas only while the hero is in play — and, critically, mount it
  // again on the way back up. This check is symmetric, so scrolling up restores it.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const r = el.getBoundingClientRect();
      setNear(r.bottom > -window.innerHeight * 0.5 && r.top < window.innerHeight);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ref]);

  // Scroll choreography: the camera falls into the helix, colour drains from
  // everything outside DPYD, and the variant base ignites last. The dive stops
  // at z≈8 — close enough to read individual bases, never so close that
  // spheres crop into abstract blobs.
  const dive = range(p, 0.16, 0.78);
  const variant = range(p, 0.6, 0.82);
  useEffect(() => {
    sceneState.camZ = lerp(14, 8, dive);
    // The variant pair sits at world y ≈ +1.6 once the strand stretches; the
    // camera rises WITH it and looks AT it, so the red base ends centre-frame,
    // slightly above the callout that names it.
    sceneState.camY = lerp(0, 1.7, dive);
    sceneState.lookY = lerp(0, 1.45, dive);
    sceneState.camX = lerp(0, 0.2, range(p, 0.45, 0.9));
    sceneState.focusDistance = lerp(0.02, 0.008, dive);
    sceneState.desat = range(p, 0.34, 0.72);
    sceneState.variant = variant;
    sceneState.variantScale = variant * 0.55;
    sceneState.dive = dive;
  }, [p, dive, variant]);

  // Text beats: strictly non-overlapping windows — each line fully leaves
  // before the next enters, so two layers never double-expose.
  const titleOut = 1 - range(p, 0.2, 0.28);
  const subT = range(p, 0.3, 0.4);
  const subOut = 1 - range(p, 0.46, 0.54);
  const midIn = range(p, 0.56, 0.66);
  const midOut = 1 - range(p, 0.72, 0.78);
  const cue = 1 - range(p, 0.04, 0.12);
  // One scrim serves whichever beat is on screen.
  const scrim = Math.max(titleOut, Math.min(subT, subOut), Math.min(midIn, midOut));

  // Shorter on phones: the same choreography over less thumb-travel.
  return (
    <section ref={ref} className="relative h-[300vh] md:h-[420vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <Aurora intensity={1 - range(p, 0.7, 1) * 0.45} />

        {/* The helix stage. The SVG placeholder is always mounted underneath;
            the canvas fades in over it once GL is live. There is never a frame
            with an empty stage — that was the hole the old null fallback left
            while the ~1MB three.js chunk was still in flight. */}
        <div className="absolute inset-0" style={{ opacity: 1 - range(p, 0.9, 1) * 0.35 }}>
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              opacity: sceneReady ? 0 : 1,
              transition: "opacity 700ms ease",
            }}
          >
            {/* As the loading state this is the only thing on screen, so it
                gets the brand violet rather than a bare hairline — it should
                read as deliberate art, not as a missing asset. */}
            <HelixSVG
              spin={p * 6}
              rungs={22}
              flag={variant > 0.4 ? 14 : -1}
              stroke="color-mix(in oklab, var(--cyan) 78%, transparent)"
              className="h-[70vh]"
              animate={near && !sceneReady}
            />
          </div>

          {capable && near ? (
            <div
              className="absolute inset-0"
              style={{ opacity: sceneReady ? 1 : 0, transition: "opacity 700ms ease" }}
            >
              <SceneHost onReady={onSceneReady} />
            </div>
          ) : null}
        </div>

        {/* Only while the 3D is genuinely still coming. */}
        <LoadingNote show={capable && !sceneReady} />

        {/* Legibility scrim: a soft pool of paper behind the type so words stay
            crisp over the molecule. Fades out with the text it protects. */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: scrim * 0.92,
            // Light-first: the type is deep ink on cream, so the scrim pools
            // PAPER behind it — a soft wash of the page colour over the helix.
            background:
              "radial-gradient(50% 38% at 50% 50%, color-mix(in oklab, var(--paper) 80%, transparent) 26%, color-mix(in oklab, var(--paper) 48%, transparent) 58%, transparent 78%)",
          }}
        />

        {/* type sits above the canvas, never inside it */}
        <div className="pointer-events-none relative flex h-full flex-col items-center justify-center px-6 text-center">
          <div style={{ opacity: titleOut, visibility: titleOut > 0.01 ? "visible" : "hidden" }}>
            <p className="eyebrow mb-6" style={{ color: "var(--ink-soft)" }}>
              iGEM 2026 · Diagnostics
            </p>
            <RevealCSS
              text={"Precision starts\nin your DNA."}
              className="story-line"
              style={{ color: "var(--ink)" }}
            />
          </div>

          <p
            className="absolute max-w-xl text-lg font-medium md:text-2xl"
            style={{
              color: "var(--ink)",
              opacity: Math.min(subT, subOut),
              visibility: Math.min(subT, subOut) > 0.01 ? "visible" : "hidden",
              transform: `translateY(${lerp(18, -18, range(p, 0.3, 0.54))}px)`,
            }}
          >
            Three billion letters. Every one of them a decision your body has already made about the
            medicine you are about to be given.
          </p>

          <div
            className="absolute w-full max-w-5xl px-6"
            style={{
              opacity: Math.min(midIn, midOut),
              visibility: Math.min(midIn, midOut) > 0.01 ? "visible" : "hidden",
            }}
          >
            <Reveal
              text={"One gene decides\nwhether the cure is safe."}
              t={midIn}
              className="story-line-sm"
              style={{ color: "var(--ink)" }}
            />
          </div>
        </div>

        <VariantCallout on={range(p, 0.72, 0.92)} />

        <div
          className="pointer-events-none absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3"
          style={{ opacity: cue }}
        >
          <span className="hand-note" style={{ color: "var(--ink-faint)" }}>
            scroll
          </span>
          <span
            className="block h-10 w-px"
            style={{ background: "linear-gradient(var(--hairline-strong), transparent)" }}
          />
        </div>
      </div>
    </section>
  );
}
