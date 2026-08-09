import { Fragment, useId } from "react";

import { clamp01, lerp, useTime } from "@/hooks/use-scroll-progress";

/**
 * Ink at a given strength. The story plays on paper, so every grey in it is a
 * dilution of --ink rather than a dilution of white.
 */
export const TONE = (a: number) =>
  `color-mix(in oklab, var(--ink) ${Math.round(a * 100)}%, transparent)`;

/* ------------------------------------------------------------- structure */

/**
 * A tall scroll section with a full-viewport sticky stage — the skeleton of
 * every chapter. `vh` sets how much scroll the chapter owns.
 */
export function Tall({
  id,
  vh,
  children,
  refFn,
  ...rest
}: {
  id?: string;
  vh: number;
  children: React.ReactNode;
  refFn?: React.Ref<HTMLElement>;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <section id={id} ref={refFn} style={{ height: `${vh}vh` }} className="relative" {...rest}>
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden lg:pl-64">
        {children}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- atmosphere */

/** A whisper of grain and a soft vignette. Sits above everything, ignores pointer events. */
export function Atmosphere() {
  return (
    <div className="pointer-events-none fixed inset-0 z-40">
      <div className="absolute inset-0 grain" style={{ opacity: 0.05 }} />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 45%, transparent 55%, color-mix(in oklab, black 34%, transparent) 100%)",
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------- typography */

/**
 * Word-by-word mask reveal. `t` (0→1) scrubs the reveal; words rise out of a
 * clipped line the way a title card resolves in film.
 */
export function Reveal({
  text,
  t,
  className,
  style,
  stagger = 0.055,
}: {
  text: string;
  t: number;
  className?: string;
  style?: React.CSSProperties;
  stagger?: number;
}) {
  const lines = text.split("\n");
  let i = 0;
  return (
    <span className={className} style={{ display: "block", ...style }}>
      {lines.map((line, li) => (
        <span key={li} style={{ display: "block" }}>
          {line.split(" ").map((w) => {
            const delay = i++ * stagger;
            const local = clamp01((t - delay) / 0.42);
            // Gentle overshoot — the word settles like it has mass.
            const e =
              local >= 1
                ? 1
                : 1 - Math.pow(2, -9 * local) * Math.cos(local * 9.2 - 0.35) * (1 - local * 0.25);
            const rest = 1 - e;
            return (
              // The space is a real text node BETWEEN the word wrappers. A
              // fixed-width spacer span looks right but collapses its own
              // whitespace, so the headline copied as one run-on word and read
              // that way to screen readers.
              <Fragment key={`${w}-${delay}`}>
                <span
                  style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom" }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      transform: `translateY(${rest * 105}%) rotate(${rest * 2.4}deg) scale(${1 - rest * 0.04})`,
                      filter: local < 1 ? `blur(${rest * 6}px)` : undefined,
                      opacity: 0.1 + Math.min(1, local * 1.6) * 0.9,
                      willChange: "transform, filter",
                    }}
                  >
                    {w}
                  </span>
                </span>{" "}
              </Fragment>
            );
          })}
        </span>
      ))}
    </span>
  );
}

/**
 * The same word-by-word rise as `Reveal`, but played by CSS keyframes instead
 * of a scroll value. That matters for the very first thing on the page: CSS
 * animates from first paint, so the headline is legible before React hydrates
 * — a JS-driven reveal leaves it invisible until the bundle lands.
 */
export function RevealCSS({
  text,
  className,
  style,
  stagger = 55,
  delay = 120,
}: {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  /** ms between words */
  stagger?: number;
  /** ms before the first word */
  delay?: number;
}) {
  let i = 0;
  return (
    <span className={className} style={{ display: "block", ...style }}>
      {text.split("\n").map((line, li) => (
        <span key={li} style={{ display: "block" }}>
          {line.split(" ").map((w) => {
            const ms = delay + i++ * stagger;
            return (
              // Real space between wrappers — see the note in Reveal.
              <Fragment key={`${w}-${ms}`}>
                <span
                  style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom" }}
                >
                  <span className="word-in" style={{ animationDelay: `${ms}ms` }}>
                    {w}
                  </span>
                </span>{" "}
              </Fragment>
            );
          })}
        </span>
      ))}
    </span>
  );
}

/* ---------------------------------------------------------------- anatomy */

/** Line-art human figure. `alarm` bleeds red through the torso as toxicity rises. */
export function BodyFigure({
  alarm = 0,
  breath = 0,
  stroke = "var(--hairline-strong)",
  className,
  animate = true,
}: {
  alarm?: number;
  breath?: number;
  stroke?: string;
  className?: string;
  animate?: boolean;
}) {
  const time = useTime(animate);
  // Breathing keeps going on its own; scroll only modulates its phase.
  const s = 1 + Math.sin((breath + time * 0.22) * Math.PI * 2) * (0.012 + alarm * 0.01);
  return (
    <svg viewBox="0 0 120 300" className={className} style={{ overflow: "visible" }}>
      <g style={{ transform: `scale(${s})`, transformOrigin: "60px 150px" }}>
        <circle cx="60" cy="34" r="22" fill="none" stroke={stroke} strokeWidth="1.2" />
        <path
          d="M60 56 C40 62 30 78 28 104 L24 168 M60 56 C80 62 90 78 92 104 L96 168"
          fill="none"
          stroke={stroke}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M32 100 L34 190 C34 206 40 210 46 210 L74 210 C80 210 86 206 86 190 L88 100"
          fill={`color-mix(in oklab, var(--alarm) ${alarm * 42}%, transparent)`}
          stroke={stroke}
          strokeWidth="1.2"
        />
        <path
          d="M46 210 L42 292 M74 210 L78 292"
          fill="none"
          stroke={stroke}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        {/* liver, upper right of the abdomen */}
        <path
          d="M52 138 C64 130 82 132 86 142 C89 152 78 162 66 160 C56 158 50 148 52 138 Z"
          fill={`color-mix(in oklab, var(--alarm) ${18 + alarm * 60}%, transparent)`}
          stroke={stroke}
          strokeWidth="0.9"
          opacity={0.9}
        />
      </g>
    </svg>
  );
}

/** Beating ECG trace whose rate and agitation follow `bpm`. */
export function ECG({ bpm, color, className }: { bpm: number; color: string; className?: string }) {
  const dur = (60 / bpm) * 2.2;
  const amp = lerp(1, 1.9, clamp01((bpm - 70) / 90));
  const d = `M0 40 H70 l8 0 l7 ${-24 * amp} l9 ${46 * amp} l8 ${-22 * amp} H160 l6 -6 l6 6 H300`;
  return (
    <svg viewBox="0 0 300 80" className={className} preserveAspectRatio="none">
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="1.4"
        strokeLinejoin="round"
        opacity={0.25}
      />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeDasharray="120 620"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="740"
          to="0"
          dur={`${dur}s`}
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
}

/** A vessel cross-section with drug molecules flowing left → right. */
/**
 * Anatomy asset note — the liver and cell geometry below are adapted from CC0
 * sources (svgrepo.com/svg/80409/liver, svgrepo.com/svg/2758/cell). Fills are
 * driven by design tokens rather than the originals' colours so they belong to
 * this palette instead of sitting on top of it.
 */

/** One red blood cell: a biconcave disc seen at an angle. */
function RedCell({
  x,
  y,
  r,
  tilt,
  o,
}: {
  x: number;
  y: number;
  r: number;
  tilt: number;
  o: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt})`} opacity={o}>
      <ellipse
        rx={r}
        ry={r * 0.62}
        fill="color-mix(in oklab, var(--coral) 34%, transparent)"
        stroke="color-mix(in oklab, var(--coral) 62%, transparent)"
        strokeWidth="0.8"
      />
      {/* the dimple that makes it read as a red cell and not a dot */}
      <ellipse
        rx={r * 0.42}
        ry={r * 0.26}
        fill="color-mix(in oklab, var(--coral) 46%, transparent)"
      />
    </g>
  );
}

/**
 * A vessel cross-section carrying two populations: red cells (the ordinary
 * traffic) and 5-FU molecules (the cargo this story is about). Both are drawn
 * as simple primitives on purpose — the detailed stock illustration is ~100
 * paths, and fourteen animated copies of it would be ~1,400 animated nodes.
 */
export function Vessel({
  flow,
  density = 9,
  tint = "var(--alarm)",
  animate = true,
}: {
  flow: number;
  density?: number;
  tint?: string;
  animate?: boolean;
}) {
  const time = useTime(animate);
  const wall = useId().replace(/:/g, "");

  // Double-wrap the phase: the scroll spring overshoots below 0 and JS `%`
  // keeps the sign, which used to yield a negative width on the tail rect.
  const phaseOf = (i: number, speed: number, n: number) =>
    (((flow * 1.15 + time * 0.055 * speed + i / n) % 1) + 1) % 1;

  return (
    <svg viewBox="0 0 800 120" className="w-full">
      <defs>
        <linearGradient id={`${wall}-w`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={TONE(0.09)} />
          <stop offset="0.5" stopColor={TONE(0.03)} />
          <stop offset="1" stopColor={TONE(0.09)} />
        </linearGradient>
        <linearGradient id={`${wall}-t`} x1="0" x2="1">
          <stop offset="0" stopColor={tint} stopOpacity="0" />
          <stop offset="1" stopColor={tint} stopOpacity=".55" />
        </linearGradient>
      </defs>
      <rect x="0" y="26" width="800" height="68" rx="34" fill={`url(#${wall}-w)`} />
      <rect x="0" y="26" width="800" height="68" rx="34" fill="none" stroke={TONE(0.12)} />

      {/* red cells — the ordinary traffic, drifting behind the drug */}
      {Array.from({ length: density }).map((_, i) => {
        const speed = 0.42 + ((i * 7) % 5) / 12;
        const phase = phaseOf(i, speed, density);
        const y = 44 + ((i * 29) % 34) + Math.sin(time * 1.2 + i) * 3;
        return (
          <RedCell
            key={`rbc${i}`}
            x={phase * 800}
            y={y}
            r={7.5 + ((i * 11) % 3)}
            tilt={(i * 47) % 180}
            o={0.25 + 0.75 * Math.sin(phase * Math.PI)}
          />
        );
      })}

      {/* 5-FU molecules — smaller, faster, and the only thing wearing alarm */}
      {Array.from({ length: density - 2 }).map((_, i) => {
        const n = density - 2;
        const speed = 0.8 + ((i * 13) % 4) / 8;
        const phase = phaseOf(i + 3, speed, n);
        const y = 40 + ((i * 41) % 42) + Math.sin(time * 1.9 + i) * 3.5;
        const r = 3.4;
        const o = 0.25 + 0.75 * Math.sin(phase * Math.PI);
        return (
          <g key={`drug${i}`}>
            <rect
              x={Math.max(0, phase * 800 - 30)}
              y={y - r * 0.5}
              width={Math.min(30, phase * 800)}
              height={r}
              rx={r / 2}
              fill={`url(#${wall}-t)`}
              opacity={o * 0.55}
            />
            <circle cx={phase * 800} cy={y} r={r} fill={tint} opacity={o} />
          </g>
        );
      })}
    </svg>
  );
}

/** Key for the two populations above — the animation has to teach, not decorate. */
export function VesselLegend() {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] uppercase tracking-[0.18em]">
      <span className="flex items-center gap-2" style={{ color: "var(--ink-faint)" }}>
        <svg viewBox="-9 -9 18 18" className="h-3 w-3">
          <ellipse
            rx="7.5"
            ry="4.6"
            fill="color-mix(in oklab, var(--coral) 34%, transparent)"
            stroke="color-mix(in oklab, var(--coral) 62%, transparent)"
          />
        </svg>
        Red cells
      </span>
      <span className="flex items-center gap-2" style={{ color: "var(--ink-faint)" }}>
        <span className="block size-2 rounded-full" style={{ background: "var(--alarm)" }} />
        5-FU
      </span>
    </div>
  );
}

/** Anatomical liver silhouette (adapted, CC0 — svgrepo.com/svg/80409/liver). */
const LIVER_OUTLINE =
  "M54.36,2.487H32.975h-2h-17.72c-6.24,0-21.971,9.785-6.951,42.532L6.285,45.55c-0.017,0.519,0.41,0.939,0.928,0.909c3.061-0.176,12.536-1.414,15.04-9.972c0,0,19.354,1.293,21.91-15.572v0c5.174-3.341,10.181-8.539,11.779-16.505C56.142,3.417,55.372,2.487,54.36,2.487z";
/** The division between the two lobes — the line that makes it read as a liver. */
const LIVER_LOBE =
  "M30.254,26.487C11.359,29.842,7.188,38.431,6.364,43.189L6.285,45.55c-0.017,0.519,0.41,0.939,0.928,0.909c3.061-0.176,12.536-1.414,15.04-9.972c0,0,19.354,1.293,21.91-15.572C37.354,25.312,30.254,26.487,30.254,26.487z";

/**
 * `fill` raises the drug level inside the organ; `alarm` turns that level red
 * as clearance fails. Real anatomy rather than the blob this used to be — a
 * judge should recognise the organ, not decode it.
 */
export function Liver({ fill, alarm = 0 }: { fill: number; alarm?: number }) {
  // Two Livers render on the page at once; a hardcoded clip id made the second
  // one inherit the first one's clip.
  const clip = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 62 50" className="w-full">
      <defs>
        <clipPath id={clip}>
          <path d={LIVER_OUTLINE} />
        </clipPath>
      </defs>
      <path d={LIVER_OUTLINE} fill={TONE(0.05)} />
      <g clipPath={`url(#${clip})`}>
        <rect x="0" y={50 - fill * 50} width="62" height="50" fill={TONE(0.14)} />
        <rect
          x="0"
          y={50 - fill * 50}
          width="62"
          height="50"
          fill={`color-mix(in oklab, var(--alarm) ${alarm * 78}%, transparent)`}
        />
      </g>
      <path d={LIVER_LOBE} fill="none" stroke={TONE(0.2)} strokeWidth="0.5" />
      <path d={LIVER_OUTLINE} fill="none" stroke={TONE(0.42)} strokeWidth="0.7" />
    </svg>
  );
}

/**
 * A cell: membrane, cytoplasm, organelle arcs, nucleus. Structure adapted from
 * a CC0 source (svgrepo.com/svg/2758/cell); the nucleus carries the accent
 * because that is where the story is going next.
 */
export function Cell({ stroke = "var(--hairline-strong)" }: { stroke?: string }) {
  return (
    <svg viewBox="0 0 512 512" className="w-full">
      {/* membrane */}
      <circle cx="256" cy="256" r="248" fill={TONE(0.04)} stroke={stroke} strokeWidth="8" />
      {/* cytoplasm */}
      <circle cx="256" cy="256" r="215" fill={TONE(0.03)} stroke="none" />
      {/* organelle arcs — the curved bodies of the original, as strokes */}
      <g fill="none" stroke={stroke} strokeWidth="14" strokeLinecap="round" opacity="0.55">
        <path d="M168.7,395.9c-13.2-9.8-24.9-21.5-34.7-34.7" />
        <path d="M411,322.5c6.5-15.1,10.8-31.1,12.7-47.4" />
        <path d="M343.3,116.1c13.2,9.8,24.9,21.5,34.7,34.7" />
      </g>
      {/* inner tracings */}
      <g fill="none" stroke={stroke} strokeWidth="9" strokeLinecap="round" opacity="0.35">
        <path d="M320.7,368.1a138,138,0,0,1-64.7,17.3" />
        <path d="M191.3,143.9A146,146,0,0,0,118.2,256" />
        <path d="M188.4,188.4a112,112,0,0,0-33,67.6" />
      </g>
      {/* small vesicles */}
      <circle cx="221.7" cy="425.4" r="9" fill={TONE(0.3)} />
      <circle cx="202.5" cy="92.8" r="9" fill={TONE(0.3)} />
      <circle
        cx="256"
        cy="111.3"
        r="22"
        fill="none"
        stroke={stroke}
        strokeWidth="8"
        opacity="0.6"
      />
      {/* nucleus — where DPYD lives, so it gets the accent */}
      <circle
        cx="256"
        cy="256"
        r="70"
        fill="color-mix(in oklab, var(--violet) 42%, transparent)"
        stroke="color-mix(in oklab, var(--violet) 78%, transparent)"
        strokeWidth="6"
      />
    </svg>
  );
}

/** Rotating DNA double helix; one rung can be flagged as the variant. */
export function Helix({
  spin,
  rungs = 26,
  flag = -1,
  stroke = "var(--hairline-strong)",
  className,
  animate = true,
}: {
  spin: number;
  rungs?: number;
  flag?: number;
  stroke?: string;
  className?: string;
  animate?: boolean;
}) {
  const W = 240;
  const H = 320;
  const time = useTime(animate);
  const s = spin + time * 0.22; // never fully still

  // Round to 0.1px: server and client can disagree in the last float digits,
  // and any difference in a serialized attribute is a hydration mismatch.
  const at = (t: number, offset: number) => {
    const a = t * Math.PI * 3 + s + offset;
    return {
      x: Math.round((W / 2 + Math.sin(a) * 74) * 10) / 10,
      y: Math.round((14 + t * (H - 28)) * 10) / 10,
      z: Math.round(Math.cos(a) * 1000) / 1000,
    };
  };

  // The rungs are the coarse ladder; the strands are sampled far more finely.
  // Reusing the rung count for the strand polyline (as this once did) turns
  // 1.5 turns of sine into a stack of hard diamonds instead of a helix.
  const STRAND_SEGMENTS = 96;
  const rungPts = (offset: number) =>
    Array.from({ length: rungs }, (_, i) => at(i / (rungs - 1), offset));
  const strandPath = (offset: number) =>
    Array.from({ length: STRAND_SEGMENTS }, (_, i) => at(i / (STRAND_SEGMENTS - 1), offset))
      .map((q, i) => `${i ? "L" : "M"}${q.x.toFixed(1)} ${q.y.toFixed(1)}`)
      .join(" ");

  const A = rungPts(0);
  const B = rungPts(Math.PI);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className}>
      {A.map((a, i) => {
        const b = B[i]!;
        const isFlag = i === flag;
        const depth = (a.z + 1) / 2; // 0 back → 1 front
        return (
          <line
            key={i}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke={isFlag ? "var(--alarm)" : stroke}
            strokeWidth={isFlag ? 3 : Math.round((0.7 + depth * 1.5) * 100) / 100}
            strokeLinecap="round"
            opacity={isFlag ? 1 : Math.round((0.14 + depth * 0.62) * 100) / 100}
            style={isFlag ? { filter: "drop-shadow(0 0 6px var(--alarm))" } : undefined}
          />
        );
      })}

      <path
        d={strandPath(0)}
        fill="none"
        stroke={stroke}
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d={strandPath(Math.PI)}
        fill="none"
        stroke={stroke}
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity="0.45"
      />
      {flag >= 0 && A[flag] && (
        <circle
          cx={(A[flag]!.x + B[flag]!.x) / 2}
          cy={A[flag]!.y}
          r="12"
          fill="none"
          stroke="var(--alarm)"
        >
          <animate attributeName="r" values="10;20;10" dur="2.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.9;0;0.9" dur="2.4s" repeatCount="indefinite" />
        </circle>
      )}
    </svg>
  );
}

/** The gene as a sequence of bases, with one letter substituted. */
export function Sequence({ reveal, mutate }: { reveal: number; mutate: number }) {
  const bases = "GATCCTGTAAGTACGATCGGTACCTGAA".split("");
  const mutIndex = 11;
  return (
    <div className="flex flex-wrap justify-center gap-[3px] font-mono text-sm md:text-xl">
      {bases.map((b, i) => {
        const on = i / bases.length < reveal;
        const isMut = i === mutIndex;
        return (
          <span
            key={i}
            className="inline-flex h-8 w-6 items-center justify-center rounded-[3px] md:h-11 md:w-8"
            style={{
              border: `1px solid ${isMut && mutate > 0.3 ? "var(--alarm)" : "var(--hairline)"}`,
              background:
                isMut && mutate > 0.3
                  ? `color-mix(in oklab, var(--alarm) ${mutate * 85}%, transparent)`
                  : "var(--surface)",
              color: isMut && mutate > 0.3 ? "#fff" : "var(--ink-soft)",
              opacity: on ? 1 : 0.07,
              transform: `translateY(${on ? 0 : 14}px) scale(${isMut ? 1 + mutate * 0.18 : on ? 1 : 0.9})`,
              transitionProperty: "opacity, transform, background, border-color",
              transitionDuration: ".5s, .62s, .5s, .5s",
              transitionTimingFunction: "ease, cubic-bezier(.18,1.5,.35,1), ease, ease",
              transitionDelay: `${(i % 8) * 18}ms`,
            }}
          >
            {isMut && mutate > 0.5 ? "A" : b}
          </span>
        );
      })}
    </div>
  );
}
