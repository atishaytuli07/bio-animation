import { useRef } from "react";

import { asset, C, L, T } from "@/components/hero/palette";
import { BOT, ENZYME, EY, H, Hex, TOP, VesselShell, W } from "@/components/story/vessel";
import {
  band,
  beat,
  easeOut,
  range,
  useSmoothProgress,
  useTime,
} from "@/hooks/use-scroll-progress";

/**
 * Stop five — "Before the first dose".
 *
 * This is the client's eighth and last spine beat, "why testing matters", and
 * it is the one section that could be built without knowing anything about
 * ChemoGuard's own method. It makes the ARGUMENT for testing, not a claim
 * about a device: what the reader has already watched happen is enough to
 * carry it.
 *
 * The mechanic is deliberately the previous scene run again. Same figure, same
 * lens on the same forearm, same vessel drawn from the same shared geometry —
 * and this time nothing accumulates. Everything the reader can see is
 * identical except the number of molecules arriving, which is exactly the
 * point: the variant has not changed, the drug has not changed, only the dose
 * has. A side-by-side comparison would have said this less well, because the
 * reader would be comparing two pictures instead of remembering one.
 *
 * WHAT IS AND IS NOT CLAIMED HERE. That a known DPYD variant can inform
 * fluoropyrimidine dosing is the established rationale for pre-treatment
 * testing, and it follows from the mechanism already shown. Nothing on this
 * screen describes how ChemoGuard's test works, what sample it takes or what
 * it reports — none of that is known yet, and inventing it is exactly the
 * failure this project has already had to undo once.
 *
 * PLACEHOLDER: the team must attach its own citation for pre-treatment DPYD
 * testing before the freeze, and confirm the wording of the closing line.
 */

const q = (v: number) => Math.round(v * 20) / 20;

/** In flight at a matched dose. The previous scene runs nine. */
const IN_FLIGHT = 4;
/** Standard dose, drawn as molecules, so the reduction is something you count. */
const STANDARD = 9;
const MATCHED = 4;

export function BeforeTheDose() {
  const [ref, p] = useSmoothProgress<HTMLElement>(0.1);

  /* ---- beats ---------------------------------------------------------------
     the question → the result → the dose comes down → the same vessel, clear.
     The last line only arrives once the reader has watched nothing pile up. */
  const enter = range(p, 0.02, 0.12);
  const lineA = beat(p, 0.04, 0.12, 0.26, 0.34);
  const result = band(p, 0.2, 0.3, 0.72, 0.8);
  const trim = range(p, 0.36, 0.52);
  const flow = band(p, 0.44, 0.54, 0.92, 0.97);
  const lineB = beat(p, 0.4, 0.5, 0.62, 0.7);
  const lineC = beat(p, 0.78, 0.88, 1.2, 1.3);
  const calm = range(p, 0.42, 0.6);

  const t = useTime(flow > 0.01);
  const phase = useRef(0);
  const lastT = useRef(t);
  if (t !== lastT.current) {
    phase.current += t - lastT.current;
    lastT.current = t;
  }
  const ph = phase.current;

  const COPY = [
    { on: lineA, text: <>What if we knew first?</> },
    { on: lineB, text: <>Same variant. Same drug.</> },
    {
      on: lineC,
      text: (
        <>
          A dose that <span style={{ color: C.redDeep }}>fits.</span>
        </>
      ),
    },
  ];

  return (
    <section
      id="before-the-dose"
      ref={ref}
      style={{ height: "460vh", marginTop: "-100vh" }}
      className="relative"
    >
      <div className="sticky top-0 h-screen overflow-hidden [--vessel:44vh] md:[--vessel:min(56vh,520px)]">
        {/* The chapter label lives in the story rail — see StoryProgress. */}

        {COPY.map((b, i) => (
          <div key={i} className={L.headline} style={{ opacity: q(b.on.o) }}>
            <p
              className="text-center font-black"
              style={{
                ...T.headline,
                color: C.ink,
                transform: `translateY(${b.on.y.toFixed(1)}px)`,
              }}
            >
              {b.text}
            </p>
          </div>
        ))}

        {/*
          The result, and the dose that follows from it. Drawn in vocabulary
          the reader already owns: the red badge from the descent, the enzyme
          slots from the bridge, and the drug molecules from the two scenes
          before this one. Nothing new to learn at the moment of the payoff.
        */}
        <div
          className="pointer-events-none absolute inset-x-0 top-[23vh] z-20 flex justify-center px-6"
          style={{ opacity: q(easeOut(result)) }}
        >
          <div
            className="rounded-xl px-4 py-3 md:px-6 md:py-4"
            style={{
              background: C.paper,
              border: `2.5px solid ${C.ink}`,
              boxShadow: `4px 4px 0 ${C.ink}`,
              transform: `translateY(${((1 - easeOut(result)) * 12).toFixed(1)}px)`,
            }}
          >
            <div className="flex items-center gap-3 md:gap-4">
              <svg viewBox="0 0 30 32" className="h-7 w-auto md:h-8" aria-hidden="true">
                <rect width="30" height="32" rx="6" fill={C.red} stroke={C.ink} strokeWidth="2.5" />
                <text
                  x="15"
                  y="23"
                  textAnchor="middle"
                  fill="#fff"
                  style={{ font: "800 17px ui-monospace, monospace" }}
                >
                  A
                </text>
              </svg>
              <span>
                <span
                  className="block text-[12px] font-black leading-none md:text-[14px]"
                  style={{ color: C.ink }}
                >
                  Variant found before treatment
                </span>
                <span
                  className="mt-1 block text-[11px] font-semibold leading-none md:text-[12px]"
                  style={{ color: `${C.ink}a0` }}
                >
                  less DPD expected — so the dose is matched to it
                </span>
              </span>
            </div>

            {/* the dose itself, as something you can count */}
            <div className="mt-3 flex items-center gap-1.5 md:mt-4 md:gap-2">
              {Array.from({ length: STANDARD }, (_, i) => {
                const dropped = i >= MATCHED;
                const gone = dropped
                  ? easeOut(range(trim, (i - MATCHED) * 0.12, (i - MATCHED) * 0.12 + 0.4))
                  : 0;
                return (
                  <svg
                    key={i}
                    viewBox="0 0 26 26"
                    className="h-3.5 w-3.5 md:h-4 md:w-4"
                    aria-hidden="true"
                  >
                    <g
                      opacity={1 - gone * 0.86}
                      transform={`scale(${(1 - gone * 0.3).toFixed(3)})`}
                    >
                      <Hex x={13} y={13} r={11} tone={dropped ? `${C.coral}` : C.coral} />
                    </g>
                  </svg>
                );
              })}
              <span
                className="ml-1.5 text-[10px] font-bold uppercase tracking-[0.18em] md:ml-2 md:text-[11px]"
                style={{ color: C.ink, opacity: q(easeOut(trim)) * 0.65 }}
              >
                dose reduced
              </span>
            </div>
          </div>
        </div>

        {/* the figure and the vessel — the same pair as the scene before */}
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
              src={asset("patient-b.webp")}
              alt=""
              draggable={false}
              className="h-full w-auto select-none"
            />
            <svg
              viewBox="0 0 415 1415"
              className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
              aria-hidden="true"
            >
              <path
                d="M-150 30 C -150 260, 300 380, 366 626"
                fill="none"
                stroke={`${C.ink}66`}
                strokeWidth="9"
                strokeLinecap="round"
                opacity={q(enter) * 0.6}
              />
              <rect
                x="350"
                y="628"
                width="46"
                height="20"
                rx="10"
                fill={C.paper}
                stroke={C.ink}
                strokeWidth="9"
                opacity={q(enter)}
              />
              <circle
                cx="373"
                cy="656"
                r="104"
                fill="none"
                stroke={C.ink}
                strokeWidth="12"
                strokeDasharray="30 26"
                opacity={q(enter) * 0.6}
              />
              <path
                d="M485 656 L 700 656"
                fill="none"
                stroke={C.ink}
                strokeWidth="11"
                strokeDasharray="26 24"
                strokeLinecap="round"
                opacity={q(enter) * 0.4}
              />
            </svg>
          </div>

          <div style={{ height: "var(--vessel)" }}>
            <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-auto" aria-hidden="true">
              <VesselShell id="btd" flow={flow} phase={ph} />

              {/*
                The enzyme is still reduced — the variant did not go away. It is
                drawn solid rather than as a dashed absence, because at a
                matched dose the enzyme there is enough. That is the whole
                argument of the section in one shape.
              */}
              <path
                d={ENZYME}
                transform={`translate(${W / 2 - 60} ${EY - 62}) scale(1.5)`}
                fill={C.green}
                fillOpacity={q(calm) * 0.85}
                stroke={C.ink}
                strokeWidth="2.4"
                strokeLinejoin="round"
                opacity={q(range(p, 0.3, 0.42))}
              />

              {/* the drug, at a dose this body can clear */}
              {flow > 0.01 &&
                Array.from({ length: IN_FLIGHT }, (_, i) => {
                  const s = (((ph * 0.12 + i / IN_FLIGHT) % 1) + 1) % 1;
                  const x = W / 2 + Math.sin(s * 8 + i * 1.7) * 96;
                  // Every one of them is broken down: past the enzyme they
                  // leave as fragments, and nothing reaches the bottom.
                  if (s > 0.52) {
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
                  const y = TOP + s * (EY - TOP);
                  return <Hex key={i} x={x} y={y} r={12} tone={C.coral} o={flow} />;
                })}

              {/* deliberately nothing at the bottom of this frame */}
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
