import { useRef, useState } from "react";

import { C, L, T } from "@/components/hero/palette";
import { band, range, useSmoothProgress, useTime } from "@/hooks/use-scroll-progress";

/**
 * Stop three — "Look closer".
 *
 * This section used to be two vessels side by side, which made it the second
 * A/B split in a row: stop two already ran "same drug, two people, watch them
 * separate", and repeating that move one scale down taught nothing new. The
 * camera went in (the gene) → out (two people) → out again.
 *
 * It now goes IN → OUT → BACK IN. The reader already knows which of the two is
 * in trouble; this stop enters his bloodstream and finds the reason. One
 * vessel, not two — the comparison has already happened.
 *
 * The payoff is the site's own vocabulary closing a loop. The red A the reader
 * pulled out of the helix in stop one comes back, drops a hairline down the
 * frame, and lands on the empty place where the enzyme should have been. Gene
 * → enzyme → drug, drawn as one line, in one image.
 *
 * ACCURACY, and it is load-bearing rather than a disclaimer: DPYD variants
 * REDUCE enzyme activity, they do not abolish it. So one molecule in four is
 * still broken down here, on screen. The animation itself encodes "reduced,
 * not absent" — an earlier draft said the enzyme "is never built", which was
 * both wrong and contradicted by the caption beneath it.
 *
 * PLACEHOLDER SCIENCE: the mechanism is textbook (DPD catabolises
 * fluoropyrimidines; DPYD variants reduce DPD activity), but the wording needs
 * the team's confirmation before this ships. iGEM requires that nothing on a
 * wiki be unverifiable.
 */

const q = (v: number) => Math.round(v * 20) / 20;

/** Molecules in flight. Every 4th is still cleared — the enzyme is reduced. */
const IN_FLIGHT = 9;
const CLEARED_EVERY = 4;

/* --- the vessel's own coordinate space ----------------------------------- */
const W = 360;
const H = 520;
const TOP = 10;
const BOT = 492;
/** Where the enzyme should be. */
const EY = 272;

/** The lumen: two soft walls, drawn as one closed path so it can be filled. */
const LUMEN =
  "M32 0 C 12 130, 52 260, 32 390 C 18 460, 38 500, 32 520 L 328 520 C 322 500, 342 460, 328 390 C 308 260, 348 130, 328 0 Z";
const WALL_L = "M32 0 C 12 130, 52 260, 32 390 C 18 460, 38 500, 32 520";
const WALL_R = "M328 0 C 348 130, 308 260, 328 390 C 342 460, 322 500, 328 520";
/** The enzyme's outline, at the origin; positioned by its parent. */
const ENZYME =
  "M14 24 Q14 12 26 12 L54 12 Q66 12 66 24 L66 34 Q52 34 52 42 Q52 50 66 50 L66 58 Q66 70 54 70 L26 70 Q14 70 14 58 Z";

/** A drug molecule, drawn natively in this SVG's units. */
function Hex({
  x,
  y,
  r,
  tone,
  o = 1,
}: {
  x: number;
  y: number;
  r: number;
  tone: string;
  o?: number;
}) {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
    return [x + Math.cos(a) * r, y + Math.sin(a) * r] as const;
  });
  return (
    <g opacity={o}>
      <polygon
        points={pts.map((pt) => `${pt[0].toFixed(1)},${pt[1].toFixed(1)}`).join(" ")}
        fill={tone}
        stroke={C.ink}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {pts.map((pt, i) => (
        <circle
          key={i}
          cx={pt[0]}
          cy={pt[1]}
          r={r * 0.22}
          fill={C.paper}
          stroke={C.ink}
          strokeWidth="1.6"
        />
      ))}
    </g>
  );
}

export function Why() {
  const [ref, p] = useSmoothProgress<HTMLElement>(0.1);
  const [hot, setHot] = useState(false);

  /* ---- beats ---------------------------------------------------------------
     enter → look closer → the drug arrives → the gap → the letter connects →
     it piles up. Each line of copy lands on the frame that earns it, and no
     two are ever on screen together.                                       */
  const enter = range(p, 0.02, 0.12);
  const lineA = band(p, 0.05, 0.13, 0.32, 0.4);
  const flow = band(p, 0.16, 0.24, 0.9, 0.96);
  const gap = range(p, 0.3, 0.44);
  const link = range(p, 0.42, 0.58);
  const lineB = band(p, 0.42, 0.5, 0.7, 0.76);
  const build = range(p, 0.52, 0.88);
  const alarm = range(p, 0.62, 0.84);
  const warm = range(p, 0.6, 0.88);
  const lineC = range(p, 0.82, 0.92);

  const t = useTime(flow > 0.01);

  /*
    Phase is accumulated per frame rather than computed as t × speed: changing
    the speed of a t × speed term teleports every molecule at once. Guarding on
    t also makes this idempotent, so React's development double-render cannot
    advance the animation twice in one frame.
  */
  const phase = useRef(0);
  const lastT = useRef(t);
  const speed = useRef(1);
  const extra = useRef(0);
  if (t !== lastT.current) {
    const dt = t - lastT.current;
    speed.current += ((hot ? 2.4 : 1) - speed.current) * 0.15;
    phase.current += dt * speed.current;
    // Holding keeps the infusion running, so the load climbs faster. Ridden on
    // the same clock as everything else — this used to be its own setInterval,
    // which only happened to work because useTime re-renders every frame.
    if (hot) extra.current = Math.min(0.4, extra.current + dt * 0.22);
    lastT.current = t;
  }
  const ph = phase.current;

  const drugTone = alarm > 0.5 ? C.red : C.coral;

  // What could not be cleared, settling at the bottom of the frame.
  const pileN = Math.min(18, Math.round((build + extra.current) * 14));
  const pile = Array.from({ length: pileN }, (_, i) => {
    const row = Math.floor(i / 6);
    const col = i % 6;
    const jitter = ((i * 37) % 7) - 3;
    return { x: 62 + col * 48 + (row % 2 ? 24 : 0) + jitter, y: BOT - 14 - row * 27 };
  });
  const pileTop = BOT - 14 - Math.floor(pileN / 6) * 27;

  const COPY = [
    { on: lineA, text: <>Look closer.</> },
    { on: lineB, text: <>One letter, and far less enzyme.</> },
    {
      on: lineC,
      text: (
        <>
          So the drug <span style={{ color: C.red }}>stays.</span>
        </>
      ),
    },
  ];

  return (
    <section id="why" ref={ref} style={{ height: "440vh" }} className="relative">
      <div
        className="sticky top-0 h-screen overflow-hidden [--vessel:44vh] md:[--vessel:min(56vh,520px)]"
        style={{
          // Cream, like the hero's ground — the field is something this world
          // has, not every room's colour. Warms toward pink as the load climbs.
          background: `color-mix(in oklab, ${C.pink} ${q(warm) * 20}%, ${C.paper})`,
        }}
      >
        <div className={L.label}>
          <span className={L.labelType} style={{ color: C.redDeep, opacity: q(enter) }}>
            <span className="block h-0.5 w-7" style={{ background: C.red }} />
            03 · Look closer
          </span>
        </div>

        {COPY.map((b, i) => (
          <div key={i} className={L.headline} style={{ opacity: q(b.on) }}>
            <p
              className="text-center font-black"
              style={{
                ...T.headline,
                color: C.ink,
                transform: `translateY(${((1 - b.on) * 16).toFixed(1)}px)`,
              }}
            >
              {b.text}
            </p>
          </div>
        ))}

        {/*
          The figure and the vessel, side by side. Without him the stop was a
          tube floating on cream and the reader had no reason to believe this
          was anyone's bloodstream. He is the same plate as stop two's right
          hand figure, so the descent is visibly INTO the person who could not
          clear the drug. Hidden on phones, where there is only room for one.
        */}
        <div
          className="absolute inset-x-0 flex items-end justify-center gap-[4vw]"
          style={{
            bottom: "8vh",
            opacity: q(enter),
            transform: `translateY(${((1 - enter) * 30).toFixed(1)}px)`,
          }}
        >
          <div className="relative hidden md:block" style={{ height: "46vh" }}>
            <img
              src="/patient-b.webp"
              alt=""
              draggable={false}
              className="h-full w-auto select-none"
            />
            {/* the lens: what the vessel beside him is a view of */}
            <svg
              viewBox="0 0 415 1415"
              className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
              aria-hidden="true"
            >
              <circle
                cx="378"
                cy="720"
                r="128"
                fill="none"
                stroke={C.ink}
                strokeWidth="12"
                strokeDasharray="30 26"
                opacity={q(enter) * 0.75}
              />
              <path
                d="M512 720 L 700 720"
                fill="none"
                stroke={C.ink}
                strokeWidth="11"
                strokeDasharray="26 24"
                strokeLinecap="round"
                opacity={q(enter) * 0.45}
              />
            </svg>
          </div>

          <div style={{ height: "var(--vessel)" }}>
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="h-full w-auto cursor-pointer select-none touch-none"
              aria-hidden="true"
              onPointerEnter={() => setHot(true)}
              onPointerLeave={() => setHot(false)}
              onPointerDown={() => setHot(true)}
              onPointerUp={() => setHot(false)}
            >
              <defs>
                {/*
                  Fade top and bottom. Without it the lumen ended in two flat
                  horizontal edges and read as a cut-out strip rather than a
                  vessel running on through the body.
                */}
                <linearGradient id="wy-fade" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#fff" stopOpacity="0" />
                  <stop offset="0.14" stopColor="#fff" stopOpacity="1" />
                  <stop offset="0.86" stopColor="#fff" stopOpacity="1" />
                  <stop offset="1" stopColor="#fff" stopOpacity="0" />
                </linearGradient>
                <mask id="wy-mask">
                  <rect x="0" y="0" width={W} height={H} fill="url(#wy-fade)" />
                </mask>
              </defs>

              {/* the lumen — this is body, so pink; brightens under the hand */}
              <g mask="url(#wy-mask)">
                <path
                  d={LUMEN}
                  fill={`${C.pink}${hot ? "44" : "2e"}`}
                  style={{ transition: "fill 300ms ease" }}
                />
                <path d={WALL_L} fill="none" stroke={C.ink} strokeWidth="3" />
                <path d={WALL_R} fill="none" stroke={C.ink} strokeWidth="3" />
              </g>

              {/* where the enzyme should be */}
              <path
                d={ENZYME}
                transform={`translate(${W / 2 - 60} ${EY - 62}) scale(1.5)`}
                fill="none"
                stroke={C.ink}
                strokeWidth="2.4"
                strokeDasharray="6 6"
                strokeLinejoin="round"
                opacity={q(gap) * 0.6}
              />

              {/*
                The causal line, drawn top to bottom: the variant the reader
                pulled out of the helix in stop one, a hairline, and the empty
                place where the enzyme should have been. The site's whole
                thesis in one image, using only vocabulary already taught.
              */}
              <path
                d={`M${W / 2} 76 L ${W / 2} ${EY - 68}`}
                fill="none"
                stroke={C.red}
                strokeWidth="2.5"
                strokeLinecap="round"
                pathLength="1"
                strokeDasharray="1"
                strokeDashoffset={1 - q(link)}
                opacity={q(link)}
              />
              <g
                transform={`translate(${W / 2 - 15} ${34 - (1 - q(link)) * 12})`}
                opacity={q(link)}
              >
                <rect width="30" height="32" rx="6" fill={C.red} stroke={C.ink} strokeWidth="2.5" />
                <text
                  x="15"
                  y="23"
                  textAnchor="middle"
                  fill="#fff"
                  style={{ font: "800 18px ui-monospace, monospace" }}
                >
                  A
                </text>
              </g>

              {/* the drug */}
              {flow > 0.01 &&
                Array.from({ length: IN_FLIGHT }, (_, i) => {
                  const s = (((ph * 0.14 + i / IN_FLIGHT) % 1) + 1) % 1;
                  const x = W / 2 + Math.sin(s * 8 + i * 1.7) * 96;
                  const cleared = i % CLEARED_EVERY === 0;

                  // the one in four that still finds working enzyme
                  if (cleared && s > 0.52) {
                    const u = (s - 0.52) / 0.48;
                    const y = EY + u * (BOT - EY) * 0.55;
                    return (
                      <g key={i} opacity={(1 - u) * flow}>
                        <circle
                          cx={x - 9 - u * 26}
                          cy={y}
                          r="4.5"
                          fill={C.paper}
                          stroke={C.ink}
                          strokeWidth="2"
                        />
                        <circle
                          cx={x + 9 + u * 26}
                          cy={y + 7}
                          r="3.5"
                          fill={C.paper}
                          stroke={C.ink}
                          strokeWidth="2"
                        />
                      </g>
                    );
                  }
                  if (!cleared && s > 0.985) return null;
                  const endY = cleared ? EY : pileTop;
                  const y = TOP + s * (endY - TOP);
                  return <Hex key={i} x={x} y={y} r={12} tone={drugTone} o={flow} />;
                })}

              {/* what could not be cleared */}
              {pile.map((m, i) => (
                <Hex key={`p${i}`} x={m.x} y={m.y} r={12} tone={drugTone} />
              ))}
            </svg>
          </div>
        </div>

        {/*
          The affordance, framed as the dose rather than as harm. An earlier
          draft read "press and hold — and watch it pile up", which invited the
          reader to make a patient sicker; on a wiki about chemotherapy
          toxicity that is the wrong invitation. The reader is holding the
          infusion open at a standard dose, and the pile is what a standard
          dose does to this particular body.
        */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-[3vh] flex justify-center px-6"
          style={{ opacity: hot ? 0 : q(flow) * 0.45, transition: "opacity 300ms ease" }}
        >
          <span
            className="text-[10px] font-bold uppercase tracking-[0.18em]"
            style={{ color: C.ink }}
          >
            hold to keep the standard dose running
          </span>
        </div>
      </div>
    </section>
  );
}
