import { C } from "@/components/hero/palette";
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
  /** Whether the enzyme is present and working. */
  working: boolean;
  flow: number;
  /** 0→1 accumulation, only meaningful when !working. */
  build: number;
  alarm: number;
  label: string;
  caption: string;
  captionOn: number;
}) {
  const t = useTime(flow > 0.01);
  const W = 220;
  const H = 520;
  const top = 40;
  const bottom = H - 60;
  const ey = top + (bottom - top) * ENZYME_AT;
  const drugTone = alarm > 0.5 ? C.red : C.coral;

  // The pile: molecules that arrived and were never broken down.
  const pileN = working ? 0 : Math.round(build * 12);
  const pile = Array.from({ length: pileN }, (_, i) => {
    const row = Math.floor(i / 4);
    const col = i % 4;
    const jitter = ((i * 37) % 7) - 3;
    return { x: 50 + col * 40 + (row % 2 ? 20 : 0) + jitter, y: bottom - 10 - row * 26 };
  });

  return (
    <div className="flex flex-col items-center gap-3">
      <span
        className="text-[11px] font-bold uppercase tracking-[0.22em]"
        style={{ color: C.paper, opacity: q(captionOn) }}
      >
        {label}
      </span>

      <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-auto" aria-hidden="true">
        {/* the vessel */}
        <rect
          x="30"
          y={top - 20}
          width={W - 60}
          height={bottom - top + 60}
          rx="60"
          fill={`${C.paper}22`}
          stroke={C.paper}
          strokeWidth="3"
          strokeOpacity="0.55"
        />

        {/* the enzyme — present and solid, or a ghost of where it should be */}
        <g transform={`translate(${W / 2 - 40} ${ey - 40})`} opacity={working ? 1 : 0.32}>
          <path
            d="M14 24 Q14 12 26 12 L54 12 Q66 12 66 24 L66 34 Q52 34 52 42 Q52 50 66 50 L66 58 Q66 70 54 70 L26 70 Q14 70 14 58 Z"
            fill={working ? C.green : "none"}
            stroke={working ? C.ink : C.paper}
            strokeWidth="3.5"
            strokeDasharray={working ? undefined : "6 6"}
            strokeLinejoin="round"
          />
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
            const s = (((t * 0.16 + i / IN_FLIGHT) % 1) + 1) % 1;
            const x = W / 2 + Math.sin(s * 9 + i) * 26;
            if (working && s > ENZYME_AT) {
              // past the enzyme: two fragments drifting apart and fading
              const u = (s - ENZYME_AT) / (1 - ENZYME_AT);
              const y = ey + u * (bottom - ey) * 0.6;
              return (
                <g key={i} opacity={(1 - u) * flow}>
                  <circle
                    cx={x - 8 - u * 22}
                    cy={y}
                    r="4.5"
                    fill={C.paper}
                    stroke={C.ink}
                    strokeWidth="2"
                  />
                  <circle
                    cx={x + 8 + u * 22}
                    cy={y + 6}
                    r="3.5"
                    fill={C.paper}
                    stroke={C.ink}
                    strokeWidth="2"
                  />
                </g>
              );
            }
            const endY = working ? ey : bottom - 10 - Math.floor(pileN / 4) * 26;
            const y = top + s * (endY - top);
            if (!working && s > 0.985) return null;
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

      <p
        className="min-h-[3.9em] max-w-[26ch] text-center text-[13px] font-semibold leading-snug md:text-[15px]"
        style={{ color: C.paper, opacity: q(captionOn) }}
      >
        {caption}
      </p>
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
        className="sticky top-0 h-screen overflow-hidden [--vessel:44vh] md:[--vessel:min(58vh,560px)]"
        style={{
          backgroundImage: `repeating-linear-gradient(102deg, rgba(255,255,255,0.05) 0 3px, transparent 3px 26px), linear-gradient(160deg, color-mix(in oklab, ${C.coral} ${q(warm) * 40}%, ${C.lavender}), color-mix(in oklab, ${C.red} ${q(warm) * 30}%, ${C.lavenderDeep}))`,
        }}
      >
        {/* chapter label */}
        <div className="absolute left-6 top-24 z-20 md:left-10 md:top-28">
          <span
            className="inline-flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.22em]"
            style={{ color: C.paper, opacity: q(enter) }}
          >
            <span className="block h-0.5 w-7" style={{ background: C.paper }} />
            03 · Why
          </span>
        </div>

        {/* the question — short, on colour, never a black screen */}
        <div
          className="pointer-events-none absolute inset-x-0 top-[12vh] z-20 flex justify-center px-6 md:top-[20vh]"
          style={{ opacity: q(title) }}
        >
          <p
            className="text-center font-black"
            style={{
              fontSize: "clamp(2.4rem, 6vw, 5.4rem)",
              lineHeight: 1,
              letterSpacing: "-0.03em",
              color: C.paper,
              textShadow: `0 4px 24px ${C.lavenderDeep}88`,
              transform: `translateY(${((1 - title) * 16).toFixed(1)}px)`,
            }}
          >
            Why?
          </p>
        </div>

        {/* the two vessels */}
        <div
          className="absolute inset-x-0 flex items-end justify-center gap-[8vw] md:gap-[14vw]"
          style={{
            bottom: "14vh",
            height: "var(--vessel)",
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
            label="Enzyme missing"
            caption="One letter off, and the enzyme is never built. The drug has nowhere to go."
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
