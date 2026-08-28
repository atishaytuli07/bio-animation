import { useEffect, useRef, useState } from "react";

import { C, L, T } from "@/components/hero/palette";
import { band, range, useSmoothProgress, useTime } from "@/hooks/use-scroll-progress";

/**
 * Stop three — "Why".
 *
 * Stop two showed two bodies responding differently. This shows the machine
 * inside them that makes the difference, as one diagram run twice: the drug
 * flows down a vessel, meets the enzyme DPYD builds, and is broken down — or
 * meets no enzyme, passes through untouched, and piles up.
 *
 * Nothing here is a paragraph. The reader watches molecules hit an enzyme and
 * split, then watches the same molecules pile up where the enzyme is missing.
 * The three-step chain at the end — one letter → less enzyme → drug builds up
 * — is the only text that explains, and it arrives after the reader has seen
 * every step of it happen.
 *
 * Same world as the two stops before it: the striped field, the ink-outlined
 * elements, coral for the drug and green for the enzyme.
 *
 * PLACEHOLDER SCIENCE, marked like the rest: the mechanism is textbook (DPD
 * catabolises fluoropyrimidines; DPYD variants reduce DPD activity), but the
 * wording must be confirmed by the team before this ships. iGEM's rule is that
 * nothing on a wiki may be unverifiable.
 */

const q = (v: number) => Math.round(v * 20) / 20;

/**
 * A drug molecule drawn natively in this SVG's coordinate space. The shared
 * <Molecule> is its own <svg> sized in CSS pixels, and a nested svg inside an
 * svg ignores that and fills its parent — which rendered each molecule the
 * size of the vessel.
 */
function Hex({ x, y, r, tone }: { x: number; y: number; r: number; tone: string }) {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
    return [x + Math.cos(a) * r, y + Math.sin(a) * r] as const;
  });
  return (
    <g>
      <polygon
        points={pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ")}
        fill={tone}
        stroke={C.ink}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {pts.map((p, i) => (
        <circle
          key={i}
          cx={p[0]}
          cy={p[1]}
          r={r * 0.22}
          fill={C.paper}
          stroke={C.ink}
          strokeWidth="1.6"
        />
      ))}
    </g>
  );
}

/** How many drug molecules are in flight per vessel. */
const IN_FLIGHT = 7;
/** Where, down the vessel (0→1), the enzyme sits. */
const ENZYME_AT = 0.5;

/**
 * One vessel: drug descends, meets the enzyme (or doesn't), and either splits
 * into harmless fragments or reaches the bottom and stays there.
 *
 * Two interactions, both of which teach:
 *   · hover or press the vessel and the drug is pushed through faster — on the
 *     right that means the pile grows visibly quicker, which is the point
 *   · hover the enzyme, or the dashed gap where it should be, and it names
 *     itself — the same hover-to-name move as the hero's base pairs
 */
function Vessel({
  working,
  flow,
  build,
  alarm,
  label,
  caption,
  captionOn,
}: {
  working: boolean;
  flow: number;
  build: number;
  alarm: number;
  label: string;
  caption: string;
  captionOn: number;
}) {
  const [hot, setHot] = useState(false);
  const [named, setNamed] = useState(false);
  const t = useTime(flow > 0.01);

  // Flow is an accumulated phase, not t × speed — multiplying t by a speed
  // that changes on hover would make every molecule jump. Accumulating lets
  // the speed change smoothly mid-flight.
  const phase = useRef(0);
  const lastT = useRef(t);
  const speed = useRef(1);
  speed.current += ((hot ? 2.6 : 1) - speed.current) * 0.15;
  phase.current += (t - lastT.current) * speed.current;
  lastT.current = t;
  const ph = phase.current;

  const W = 300;
  const H = 420;
  const top = 34;
  const bottom = H - 44;
  const ey = top + (bottom - top) * ENZYME_AT;
  const drugTone = alarm > 0.5 ? C.red : C.coral;

  // Pushing the drug through faster also piles it faster: the hover adds to
  // the scroll-driven build, capped, so the reader's own hand makes it worse.
  const extra = useRef(0);
  useEffect(() => {
    if (!hot || working) return;
    const id = setInterval(() => {
      extra.current = Math.min(0.35, extra.current + 0.02);
    }, 120);
    return () => clearInterval(id);
  }, [hot, working]);
  const pileN = working ? 0 : Math.min(16, Math.round((build + extra.current) * 12));
  const pile = Array.from({ length: pileN }, (_, i) => {
    const row = Math.floor(i / 5);
    const col = i % 5;
    const jitter = ((i * 37) % 7) - 3;
    return { x: 66 + col * 42 + (row % 2 ? 21 : 0) + jitter, y: bottom - 12 - row * 26 };
  });

  return (
    <div
      className="flex flex-col items-center gap-2 md:gap-3"
      onPointerEnter={() => setHot(true)}
      onPointerLeave={() => {
        setHot(false);
        setNamed(false);
      }}
      onPointerDown={() => setHot(true)}
      onPointerUp={() => setHot(false)}
    >
      <span
        className="text-[10px] font-bold uppercase tracking-[0.22em] md:text-[11px]"
        style={{ color: C.ink, opacity: q(captionOn) * 0.7 }}
      >
        {label}
      </span>

      {/* explicit height: a percentage chain through an auto-height flex
          column resolves to nothing, and the SVG collapsed to zero on phones */}
      <div className="relative" style={{ height: "var(--vessel)" }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-full w-auto cursor-pointer select-none touch-none"
          aria-hidden="true"
        >
          {/* the vessel — brightens under the hand */}
          <rect
            x="30"
            y={top - 18}
            width={W - 60}
            height={bottom - top + 52}
            rx="80"
            fill={`${C.pink}${hot ? "4a" : "30"}`}
            stroke={C.ink}
            strokeWidth="3"
            style={{ transition: "fill 300ms ease" }}
          />

          {/* the enzyme — present and solid, or a ghost of where it should be */}
          <g
            transform={`translate(${W / 2 - 40} ${ey - 40})`}
            opacity={working ? 1 : 0.28}
            onPointerEnter={() => setNamed(true)}
            onPointerLeave={() => setNamed(false)}
            style={{ cursor: "help" }}
          >
            {/* generous invisible hit area so the ghost is hoverable too */}
            <rect x="0" y="0" width="80" height="82" fill="transparent" />
            <path
              d="M14 24 Q14 12 26 12 L54 12 Q66 12 66 24 L66 34 Q52 34 52 42 Q52 50 66 50 L66 58 Q66 70 54 70 L26 70 Q14 70 14 58 Z"
              fill={working ? C.green : "none"}
              stroke={C.ink}
              strokeWidth="3.5"
              strokeDasharray={working ? undefined : "6 6"}
              strokeLinejoin="round"
              style={{
                transform: named ? "scale(1.08)" : "scale(1)",
                transformOrigin: "40px 41px",
                transition: "transform 250ms cubic-bezier(.22,1,.36,1)",
              }}
            />
            {!working && (
              <g transform="translate(58 -6)">
                <rect width="24" height="26" rx="5" fill={C.red} stroke={C.ink} strokeWidth="2.5" />
                <text
                  x="12"
                  y="19"
                  textAnchor="middle"
                  fill="#fff"
                  style={{ font: "800 15px ui-monospace, monospace" }}
                >
                  A
                </text>
              </g>
            )}
            {working &&
              [22, 32, 42, 52].map((y, i) => (
                <line
                  key={i}
                  x1={20}
                  y1={y}
                  x2={i % 2 ? 44 : 38}
                  y2={y}
                  stroke={C.ink}
                  strokeWidth="2"
                  opacity="0.22"
                />
              ))}
          </g>

          {/* drug in flight */}
          {flow > 0.01 &&
            Array.from({ length: IN_FLIGHT }, (_, i) => {
              const sPos = (((ph * 0.16 + i / IN_FLIGHT) % 1) + 1) % 1;
              const x = W / 2 + Math.sin(sPos * 9 + i) * 34;
              if (working && sPos > ENZYME_AT) {
                const u = (sPos - ENZYME_AT) / (1 - ENZYME_AT);
                const y = ey + u * (bottom - ey) * 0.6;
                return (
                  <g key={i} opacity={(1 - u) * flow}>
                    <circle
                      cx={x - 8 - u * 24}
                      cy={y}
                      r="4.5"
                      fill={C.paper}
                      stroke={C.ink}
                      strokeWidth="2"
                    />
                    <circle
                      cx={x + 8 + u * 24}
                      cy={y + 6}
                      r="3.5"
                      fill={C.paper}
                      stroke={C.ink}
                      strokeWidth="2"
                    />
                  </g>
                );
              }
              const endY = working ? ey : bottom - 12 - Math.floor(pileN / 5) * 26;
              const y = top + sPos * (endY - top);
              if (!working && sPos > 0.985) return null;
              return (
                <g key={i} opacity={flow}>
                  <Hex x={x} y={y} r={11} tone={drugTone} />
                </g>
              );
            })}

          {/* the pile */}
          {pile.map((m, i) => (
            <Hex key={`p${i}`} x={m.x} y={m.y} r={11} tone={drugTone} />
          ))}
        </svg>

        {/* the enzyme names itself */}
        <div
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md px-3 py-1.5 text-[11px] font-bold tracking-[0.04em] md:text-[12px]"
          style={{
            top: `${((ey - 62) / H) * 100}%`,
            background: C.paper,
            color: C.ink,
            border: `2.5px solid ${C.ink}`,
            boxShadow: `3px 3px 0 ${C.ink}`,
            opacity: named ? 1 : 0,
            transform: `translate(-50%, ${named ? 0 : 6}px)`,
            transition: "opacity 200ms ease, transform 200ms ease",
          }}
        >
          {working ? "DPD enzyme · built by DPYD" : "DPD enzyme · reduced by the variant"}
        </div>
      </div>

      <p
        className="min-h-[4.3em] max-w-[26ch] text-center text-[12px] font-semibold leading-snug md:text-[15px]"
        style={{ color: C.ink, opacity: q(captionOn) }}
      >
        {caption}
      </p>

      {/* the affordance, only while the reader has not found it */}
      <span
        className="text-[10px] font-bold uppercase tracking-[0.18em]"
        style={{
          color: C.ink,
          opacity: hot ? 0 : q(captionOn) * 0.4,
          transition: "opacity 300ms ease",
        }}
      >
        {working ? "" : "press and hold — and watch it pile up"}
      </span>
    </div>
  );
}

export function Why() {
  const [ref, p] = useSmoothProgress<HTMLElement>(0.1);

  const enter = range(p, 0.02, 0.14);
  const title = band(p, 0.06, 0.14, 0.34, 0.42);
  const flow = band(p, 0.18, 0.26, 0.9, 0.96);
  const captions = range(p, 0.3, 0.4);
  const build = range(p, 0.34, 0.8);
  const alarm = range(p, 0.58, 0.82);
  const warm = range(p, 0.56, 0.86);
  const chain = range(p, 0.8, 0.94);
  // the captions step aside as the chain arrives; one thought at a time
  const captionsOn = captions * (1 - chain);

  return (
    <section id="why" ref={ref} style={{ height: "440vh" }} className="relative">
      <div
        className="sticky top-0 h-screen overflow-hidden [--vessel:30vh] md:[--vessel:min(44vh,420px)]"
        style={{
          // Cream, like the hero's ground. Three purple screens in a row read
          // as wallpaper; the field is something this world HAS, not every
          // room's colour. Lavender survives inside the vessels, so the link
          // to genetics is still there. Warms toward pink as the pile grows.
          background: `color-mix(in oklab, ${C.pink} ${q(warm) * 22}%, ${C.paper})`,
        }}
      >
        {/* chapter label */}
        <div className={L.label}>
          <span className={L.labelType} style={{ color: C.redDeep, opacity: q(enter) }}>
            <span className="block h-0.5 w-7" style={{ background: C.red }} />
            03 · Why
          </span>
        </div>

        {/* the question — short, on colour, never a black screen */}
        <div className={L.headline} style={{ opacity: q(title) }}>
          <p
            className="text-center font-black"
            style={{
              ...T.headline,
              color: C.ink,
              transform: `translateY(${((1 - title) * 16).toFixed(1)}px)`,
            }}
          >
            Why?
          </p>
        </div>

        {/* the two vessels */}
        <div
          className="absolute inset-x-0 flex items-end justify-center gap-[6vw] md:gap-[12vw]"
          style={{
            bottom: "10vh",
            opacity: q(enter),
            transform: `translateY(${((1 - enter) * 30).toFixed(1)}px)`,
          }}
        >
          <Vessel
            working
            flow={flow}
            build={0}
            alarm={0}
            label="Enzyme present"
            caption="The drug meets the enzyme and is broken down."
            captionOn={captionsOn}
          />
          <Vessel
            working={false}
            flow={flow}
            build={build}
            alarm={alarm}
            label="Enzyme reduced"
            caption="One letter off, and far less working enzyme is built. The drug has nowhere to go."
            captionOn={captionsOn}
          />
        </div>

        {/*
          The chain. The only explanatory text in the stop, and it arrives only
          after every step of it has been watched.
        */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-[4vh] z-20 flex justify-center px-6 md:bottom-[5vh]"
          style={{ opacity: q(chain) }}
        >
          <div
            className="flex flex-wrap items-center justify-center gap-2 md:gap-3"
            style={{ transform: `translateY(${((1 - chain) * 16).toFixed(1)}px)` }}
          >
            {["One letter changes", "less enzyme is built", "the drug builds up"].map((step, i) => (
              <span key={step} className="flex items-center gap-2 md:gap-3">
                <span
                  className="rounded-md px-3 py-1.5 text-[13px] font-bold md:px-4 md:py-2 md:text-[16px]"
                  style={{
                    background: i === 2 ? C.red : C.paper,
                    color: i === 2 ? "#fff" : C.ink,
                    border: `2.5px solid ${C.ink}`,
                    boxShadow: `3px 3px 0 ${C.ink}`,
                    opacity: q(range(chain, i * 0.3, i * 0.3 + 0.4)),
                  }}
                >
                  {step}
                </span>
                {i < 2 && (
                  <span
                    className="text-[18px] font-black md:text-[22px]"
                    style={{
                      color: C.paper,
                      opacity: q(range(chain, i * 0.3 + 0.2, i * 0.3 + 0.5)),
                    }}
                  >
                    →
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
