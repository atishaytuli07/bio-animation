import { useRef, useState } from "react";

import { asset, C, L, T } from "@/components/hero/palette";
import { BOT, ENZYME, EY, H, Hex, TOP, VesselShell, W } from "@/components/story/vessel";
import { usePageProgress } from "@/hooks/use-page-progress";
import {
  band,
  beat,
  easeOut,
  range,
  useSmoothProgress,
  useTime,
} from "@/hooks/use-scroll-progress";

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

/**
 * A small annotation pinned over the vessel, with a leader dot.
 *
 * Deliberately integrated rather than floating in the margin — the client
 * asked for "a small integrated label", and a caption parked at the edge of
 * the screen does not tell you which thing it is naming.
 */
function Tag({
  on,
  x,
  y,
  title,
  sub,
  tone,
}: {
  on: number;
  x: number;
  y: number;
  title: string;
  sub: string;
  tone: string;
}) {
  if (on <= 0.004) return null;
  return (
    <div
      /*
        The anchor is a CSS variable rather than an inline `left` so that a
        media query can override it: on a phone the vessel is centred and
        narrow, and a tag pointing right from 62% ran off the screen. Below md
        it flips — anchored to the right edge with the row reversed, so the box
        sits inboard and the leader points back at the thing it names.
      */
      className="pointer-events-none absolute flex items-center gap-2 left-[var(--tx)] max-md:left-auto max-md:right-[1%] max-md:flex-row-reverse"
      style={{
        ["--tx" as string]: `${x}%`,
        top: `${y}%`,
        opacity: q(easeOut(on)),
        transform: `translateY(${((1 - easeOut(on)) * 8).toFixed(1)}px)`,
      }}
    >
      <span
        className="block h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ background: tone, border: `2px solid ${C.ink}` }}
      />
      <span className="block h-px w-4 shrink-0" style={{ background: `${C.ink}55` }} />
      <span
        className="whitespace-nowrap rounded-md px-2.5 py-1.5"
        style={{
          background: C.paper,
          border: `2px solid ${C.ink}`,
          boxShadow: `2px 2px 0 ${C.ink}`,
        }}
      >
        <span
          className="block text-[11px] font-black leading-none md:text-[12px]"
          style={{ color: C.ink }}
        >
          {title}
        </span>
        <span
          className="mt-0.5 block text-[10px] font-semibold leading-none md:text-[11px]"
          style={{ color: `${C.ink}a0` }}
        >
          {sub}
        </span>
      </span>
    </div>
  );
}

export function Why() {
  const [ref, p] = useSmoothProgress<HTMLElement>(0.1);
  const [hot, setHot] = useState(false);

  // Dissolve out across the measured boundary at 0.753, as the closing scene
  // rises into the same frame. Without this the two overlap for a full screen
  // of scroll with both painted.
  const pageP = usePageProgress();
  const handoff = range(pageP, 0.745, 0.782);

  /* ---- beats ---------------------------------------------------------------
     enter → look closer → the drug arrives → the gap → the letter connects →
     it piles up. Each line of copy lands on the frame that earns it, and no
     two are ever on screen together.                                       */
  const enter = range(p, 0.02, 0.12);
  const lineA = beat(p, 0.04, 0.12, 0.3, 0.38);
  const flow = band(p, 0.16, 0.24, 0.9, 0.96);
  const drugLabel = band(p, 0.2, 0.28, 0.44, 0.52);
  const gap = range(p, 0.34, 0.46);
  const link = range(p, 0.44, 0.58);
  /*
    Both tags were on screen together at the end, which is the crowding the
    client described. The variant tag was driven by `link`, a range — so once
    it reached 1 it stayed there for the rest of the section and never left.
    Each tag now has its own band, and they hand over rather than accumulate.
  */
  const variantLabel = band(p, 0.46, 0.56, 0.62, 0.68);
  const enzymeLabel = band(p, 0.7, 0.78, 0.84, 0.9);
  /*
    "One letter, and far less enzyme" is deliberately gone. The client found
    this screen crowded — figure, vessel, molecules, variant, enzyme, two tags,
    a heading and a button all at once — and this line was the most redundant
    thing in it: the two tags beside the diagram already say it, and say it
    pointing at the thing they describe. One headline in, one out, tags in
    between.
  */
  const build = range(p, 0.56, 0.9);
  const alarm = range(p, 0.66, 0.86);
  const warm = range(p, 0.6, 0.88);
  const lineC = beat(p, 0.88, 0.95, 1.2, 1.3);

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
    <section
      id="why"
      ref={ref}
      style={{ height: "440vh", marginTop: "-100vh" }}
      className="relative"
    >
      <div
        className="sticky top-0 h-screen overflow-hidden [--vessel:44vh] md:[--vessel:min(56vh,520px)]"
        style={{ opacity: 1 - q(handoff), visibility: handoff > 0.99 ? "hidden" : "visible" }}
      >
        {/* The chapter label lives in the story rail now — see StoryProgress. */}

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
          The figure and the magnified vessel, side by side. Without him this
          was a tube floating on a colour and the reader had no reason to
          believe it was anyone's bloodstream.
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
              src={asset("patient-b.webp")}
              alt=""
              draggable={false}
              className="h-full w-auto select-none"
            />
            {/*
              THE ENTRY POINT. The lens used to sit at y=720 in the plate's
              space, which is his wrist — and beside his hip, so the client read
              the whole thing as zooming into his pocket. Measured against the
              plate's alpha channel, the hands are the widest span at y 594–707,
              so the elbow is above that.

              It is also no longer a bare circle. The drip line from the
              previous scene runs down into a cannula at exactly that point and
              the vein is drawn through the lens, so the reader is following the
              drug into the arm rather than being asked to accept an arbitrary
              magnifier somewhere on a body.
            */}
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
              />
              <path
                d="M356 430 C 388 520, 390 660, 366 790"
                fill="none"
                stroke={C.lavenderDeep}
                strokeWidth="13"
                strokeLinecap="round"
                opacity="0.5"
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
              />
              <circle
                cx="373"
                cy="656"
                r="104"
                fill="none"
                stroke={C.ink}
                strokeWidth="12"
                strokeDasharray="30 26"
                opacity="0.8"
              />
              <path
                d="M485 656 L 700 656"
                fill="none"
                stroke={C.ink}
                strokeWidth="11"
                strokeDasharray="26 24"
                strokeLinecap="round"
                opacity="0.5"
              />
            </svg>
          </div>

          <div className="relative w-fit shrink-0" style={{ height: "var(--vessel)" }}>
            <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-auto select-none" aria-hidden="true">
              <VesselShell id="wy" lit={hot} flow={flow} phase={ph} />

              {/* where the enzyme should be */}
              <path
                d={ENZYME}
                transform={`translate(${W / 2 - 60} ${EY - 62}) scale(1.5)`}
                fill="none"
                stroke={C.ink}
                strokeWidth="2.4"
                strokeDasharray="6 6"
                strokeLinejoin="round"
                opacity={q(gap) * 0.85}
              />

              {/*
                The causal line: the variant the reader pulled out of the helix
                in stop one returns, drops a hairline down the frame, and lands
                on the empty place where the enzyme should have been.
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

            {/*
              ANNOTATIONS. The drug label arrives with the first molecules and
              retires before a single one has settled — the client's requirement
              was that the viewer must know what these are BEFORE the
              accumulation begins, because otherwise the pile is just red
              shapes. The other two answer both halves of her question about
              the A: not only why a letter appeared, but how it is causing what
              happens below.
            */}
            <Tag
              on={drugLabel}
              x={62}
              y={16}
              title="5-FU"
              sub="the chemotherapy drug"
              tone={C.coral}
            />
            <Tag
              on={enzymeLabel}
              x={64}
              y={49}
              title="DPD enzyme"
              sub="less is made here"
              tone={C.green}
            />
            <Tag on={link} x={57} y={2} title="DPYD variant" sub="c.1905+1G>A" tone={C.red} />
          </div>
        </div>

        {/*
          THE CONTROL. This used to be a line of small caps saying "hold to
          keep the standard dose running", with the whole SVG as an invisible
          hit target — the client liked the idea but could not tell what she was
          supposed to hold. It is a button now, in the same paper/ink/offset
          language as every other pressable thing here, and it fills while held
          so the reader can see their own input doing something.
        */}
        <div
          className="absolute inset-x-0 bottom-[3vh] z-20 flex justify-center px-6"
          style={{ opacity: q(easeOut(flow)) }}
        >
          <span className="relative inline-flex">
            <button
              type="button"
              className="relative select-none overflow-hidden rounded-full px-5 py-2.5 text-[12px] font-bold tracking-[0.06em] transition-transform active:translate-y-px md:text-[13px]"
              style={{
                background: C.paper,
                color: C.ink,
                border: `2.5px solid ${C.ink}`,
                boxShadow: hot ? `1px 1px 0 ${C.ink}` : `3px 3px 0 ${C.ink}`,
                touchAction: "none",
              }}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                setHot(true);
              }}
              onPointerUp={() => setHot(false)}
              onPointerCancel={() => setHot(false)}
              onPointerLeave={() => setHot(false)}
            >
              {/*
                A hairline along the base, not a wash across the face. Filling
                the whole button turned it into a loading bar — a progress toy
                rather than a control, and cheap beside everything around it.
                This says the same thing and stays out of the way.
              */}
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-[3px]"
                style={{
                  transform: `scaleX(${Math.min(1, extra.current / 0.4).toFixed(3)})`,
                  transformOrigin: "left",
                  background: C.redDeep,
                  transition: "transform 140ms linear",
                }}
              />
              <span className="relative">{hot ? "Dosing…" : "Hold — give the standard dose"}</span>
            </button>
          </span>
        </div>
      </div>
    </section>
  );
}
