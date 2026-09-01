import { asset, C, ENZYME_PATH, L, T } from "@/components/hero/palette";
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
 * Stop two — "Two people".
 *
 * The descent ended on a letter. This is what that letter means for a person.
 * Two patients, the same drug, the same dose, at the same time — and for a
 * deliberately long stretch nothing separates them. Then one body clears the
 * drug and the other cannot, and only once the reader has watched that happen
 * does the sentence finish: "…doesn't mean the same outcome."
 *
 * The characters are illustrated plates (AI-generated, to be declared in
 * Attributions). Everything that moves is drawn in code on top: the IV
 * hardware, the dose travelling, and — the mechanic that carries the beat —
 * the drug visibly filling one body, using the plate's own alpha as a CSS
 * mask so the tint is inside the person rather than a rectangle over them.
 *
 * The room warms as B's load climbs. It does NOT go dark: the client rejected
 * near-black sections outright, and the brief's rule is that the emotional arc
 * is carried by saturation and hue, never by darkness. That warming is not done
 * here — it comes from <Ground />, whose keyframes at page 0.35 and 0.44 mix
 * coral and then red into the field while this scene is on screen. This file
 * used to compute its own `warm` value for it, which stopped being read when
 * the colour moved to the ground and sat here as dead code afterwards.
 *
 * The scattered ambient objects are not here either, for the same reason: they
 * belong to <World />, which travels the whole story. A local FIELD2 array
 * lingered here long after that move.
 */

const q = (v: number) => Math.round(v * 20) / 20;

/** IV stand, bag, drip chamber and line — all SVG, so the dose can move. */
/**
 * The drug in the bag is ALWAYS coral, on both stands, all the way through.
 * The whole point of the beat is that the treatment is identical — only the
 * body's response differs — so tinting one bag would quietly tell the wrong
 * story.
 */
function IV({ dose, flow, flip }: { dose: number; flow: number; flip: boolean }) {
  const t = useTime(flow > 0.01);
  const fluid = 1 - dose * 0.85;
  const drug = C.coral;
  return (
    <svg
      viewBox="0 0 120 420"
      className="h-full w-auto overflow-visible"
      aria-hidden="true"
      style={{ transform: flip ? "scaleX(-1)" : undefined }}
    >
      {/* pole + base */}
      <line x1="30" y1="40" x2="30" y2="400" stroke={C.ink} strokeWidth="4" strokeLinecap="round" />
      <path
        d="M8 404 Q30 392 52 404"
        fill="none"
        stroke={C.ink}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <line x1="30" y1="40" x2="74" y2="40" stroke={C.ink} strokeWidth="4" strokeLinecap="round" />
      {/* bag */}
      <rect
        x="56"
        y="48"
        width="36"
        height="76"
        rx="8"
        fill={C.paper}
        stroke={C.ink}
        strokeWidth="3.5"
      />
      <rect
        x="59"
        y={51 + (1 - fluid) * 70}
        width="30"
        height={fluid * 70}
        rx="6"
        fill={drug}
        opacity={0.85}
      />
      {/* drip chamber */}
      <rect
        x="66"
        y="132"
        width="16"
        height="30"
        rx="5"
        fill={C.paper}
        stroke={C.ink}
        strokeWidth="3"
      />
      {flow > 0.01 && (
        <circle cx="74" cy={140 + ((t * 1.4) % 1) * 16} r="2.6" fill={drug} opacity={flow} />
      )}
      {/* line to the arm */}
      <path
        d="M74 162 C 74 214, 22 250, -30 226"
        fill="none"
        stroke={`${C.ink}55`}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <rect
        x="-38"
        y="221"
        width="14"
        height="6"
        rx="3"
        fill={C.paper}
        stroke={C.ink}
        strokeWidth="2.5"
      />
      {/* the dose travelling */}
      {flow > 0.01 &&
        [0, 0.22, 0.41, 0.63, 0.84].map((off, i) => {
          const s = (((t * 0.28 + off) % 1) + 1) % 1;
          // sample the cubic that draws the line
          const P = (u: number): [number, number] => {
            const k = 1 - u;
            const b0 = k * k * k,
              b1 = 3 * k * k * u,
              b2 = 3 * k * u * u,
              b3 = u * u * u;
            return [
              b0 * 74 + b1 * 74 + b2 * 22 + b3 * -30,
              b0 * 162 + b1 * 214 + b2 * 250 + b3 * 226,
            ];
          };
          const [x, y] = P(s);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="3.4"
              fill={drug}
              opacity={flow * (0.35 + 0.65 * Math.sin(s * Math.PI))}
            />
          );
        })}
    </svg>
  );
}

/** A patient: plate + the drug inside them, masked to their silhouette. */
/**
 * A patient: plate, the drug inside them masked to their silhouette, and — the
 * part the client asked for — movement.
 *
 * Her note was that the figures read as static illustrations placed on top of
 * the experience rather than being part of it, next to a DNA section that
 * moves. Two things move here, and they are deliberately different in kind:
 *
 *   breathing  — a slow rise and fall, always on. This is what stops a plate
 *                looking like a sticker. It is tiny on purpose; at this scale
 *                anything larger reads as a bobbing animation.
 *   reacting   — the body responds to its own drug load. As it climbs, the
 *                figure settles: a little lower, tilted a little off vertical.
 *                So the one who clears the drug stays upright and the one who
 *                cannot visibly tires, without anything cartoonish and without
 *                a single word.
 */
function Patient({
  src,
  fill,
  alarm,
  flip,
  animate,
  seed,
}: {
  src: string;
  fill: number;
  alarm: number;
  flip: boolean;
  animate: boolean;
  seed: number;
}) {
  const t = useTime(animate);
  // Two figures breathing in lockstep would read as a loop, so they are offset.
  const breath = Math.sin(t * 0.9 + seed) * 1.4;
  const load = Math.min(1, alarm);
  const level = fill * 100;
  const tint = alarm > 0.01 ? `color-mix(in oklab, ${C.red} ${alarm * 100}%, ${C.coral})` : C.coral;
  const mask = {
    maskImage: `url(${src})`,
    WebkitMaskImage: `url(${src})`,
    maskSize: "100% 100%",
    WebkitMaskSize: "100% 100%",
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
  } as const;
  return (
    <div className="relative h-full" style={{ transform: flip ? "scaleX(-1)" : undefined }}>
      <div
        className="h-full"
        style={{
          transform: `translateY(${(breath + load * 7).toFixed(2)}px) rotate(${(load * 1.1).toFixed(2)}deg)`,
          transformOrigin: "50% 100%",
        }}
      >
        <img src={src} alt="" draggable={false} className="h-full w-auto select-none" />
        {fill > 0.004 && (
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              ...mask,
              background: `linear-gradient(to top, ${tint} 0%, ${tint} ${level}%, transparent ${Math.min(100, level + 18)}%)`,
              opacity: q(0.42 + alarm * 0.3),
              mixBlendMode: "multiply",
            }}
          />
        )}
      </div>
      {/* contact shadow */}
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-full h-3 w-3/4 -translate-x-1/2 -translate-y-1/2 rounded-[50%]"
        style={{ background: `${C.ink}2e`, filter: "blur(4px)" }}
      />
    </div>
  );
}

export function TwoPeople() {
  const [ref, p, active] = useSmoothProgress<HTMLElement>(0.1);
  // Dissolve out across the measured boundary at 0.658, as the bloodstream
  // scene rises into the same frame.
  const pageP = usePageProgress();
  const handoff = range(pageP, 0.489, 0.526);

  /* ---- beats ---------------------------------------------------------------
     enter → the same treatment → IDENTICAL, held → one clears, one fills →
     the sentence finishes. The hold is the point: the split only hurts if the
     reader has had time to believe there was no difference.                 */
  /*
    THE BRIDGE, and it runs before anything else here.

    The client identified a missing link: we showed the gene and the variant,
    then jumped to two people having different outcomes, without ever showing
    the thing in between. Her chain was DPYD variant → reduced DPD activity →
    reduced drug breakdown → accumulation → toxicity risk, and she asked for it
    as a short visual transformation rather than an explanation.

    So the letter the reader just watched change now visibly decides how much
    enzyme this body builds — five slots, two filled — and only then do the
    patients arrive. Everything after runs on `pp`, the remaining progress
    remapped to 0→1, so the two-patient beat is unchanged in shape and simply
    starts later.
  */
  /*
    THE BRIDGE WAITS FOR THE PREVIOUS SCENE TO FINISH LEAVING.

    It used to open at local 0.02, which is page 0.209 — inside the descent's
    handoff window of 0.196 → 0.231. So the enzyme diagram was arriving while
    "About three billion letters. This one can change your dose." was still on
    screen fading out: two unrelated pieces of information sharing a frame at
    the one boundary that most needed to feel clean.

    Opening at 0.13 puts it at page 0.243, which is after the descent has fully
    dissolved at 0.231, with a short breath in between. The cost is that the
    two-patient act loses about 64vh — it runs 377vh instead of 441vh — and that
    is a fair price for a boundary that reads as one continuous move.
  */
  const bridge = beat(p, 0.13, 0.2, 0.3, 0.37);
  const slots = range(p, 0.19, 0.31);
  const pp = range(p, 0.35, 1);

  // easeOut, not linear: a linear fade leaves the figures, stands and bags
  // all half-transparent for about half a screen of scrolling, which reads as
  // an unfinished render rather than an entrance.
  const enter = easeOut(range(pp, 0.01, 0.11));
  const title = beat(pp, 0.12, 0.2, 0.6, 0.68);
  const flow = band(pp, 0.2, 0.26, 0.88, 0.94);
  const dose = range(pp, 0.2, 0.9);
  const uptake = 0.34 * range(pp, 0.24, 0.5); // both, identically
  const clearA = range(pp, 0.54, 0.74);
  const buildB = range(pp, 0.54, 0.8);
  const alarm = range(pp, 0.6, 0.82);
  const outcome = beat(pp, 0.8, 0.9, 1.2, 1.3);

  const fillA = uptake * (1 - clearA);
  const fillB = uptake + 0.36 * buildB;

  return (
    <section
      id="two-people"
      ref={ref}
      style={{ height: "580vh", marginTop: "-100vh" }}
      className="relative"
      data-active={String(active)}
    >
      <div
        className="sticky top-0 h-screen overflow-hidden [--fig2:36vh] md:[--fig2:min(52vh,600px)]"
        style={{ opacity: 1 - q(handoff), visibility: handoff > 0.99 ? "hidden" : "visible" }}
      >
        {/*
          No background and no scattered field here any more; both moved to
          <Ground /> and <World />. A scene that paints its own rectangle
          cannot fade into the next one — at the seam this stage stops
          existing and the following one starts — and that hard edge, cream to
          purple to pink to cream, was the client's main note.
        */}
        {/* The chapter label lives in the story rail now — see StoryProgress. */}

        {/*
          The bridge: one letter → how much enzyme this body builds. Drawn with
          the vocabulary already established — the red variant badge from the
          descent, and the green enzyme shape the next scene will find missing.
        */}
        {bridge.o > 0.004 && (
          <div
            className="pointer-events-none absolute inset-x-0 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center px-6"
            style={{ opacity: q(bridge.o), transform: `translateY(${bridge.y.toFixed(1)}px)` }}
          >
            <svg viewBox="0 0 460 130" className="w-[min(88vw,560px)]" aria-hidden="true">
              {/* the letter, carried straight over from the sequence */}
              <g transform="translate(6 44)">
                <rect width="42" height="46" rx="9" fill={C.red} stroke={C.ink} strokeWidth="3" />
                <text
                  x="21"
                  y="33"
                  textAnchor="middle"
                  fill="#fff"
                  style={{ font: "800 25px ui-monospace, monospace" }}
                >
                  A
                </text>
              </g>
              <path
                d="M62 67 L 104 67"
                stroke={C.ink}
                strokeWidth="3"
                strokeLinecap="round"
                markerEnd=""
              />
              <path d="M96 60 L 106 67 L 96 74 Z" fill={C.ink} />

              {/*
                Five slots, two filled. "Reduced, not absent" is the accurate
                claim and the picture makes it without a sentence.
              */}
              {[0, 1, 2, 3, 4].map((i) => {
                const on = range(slots, i * 0.12, i * 0.12 + 0.3);
                const made = i < 2;
                return (
                  /*
                    THE SAME OBJECT THE BLOODSTREAM SCENE DRAWS. This used to be
                    an inline rounded rectangle with a notch cut out of it — a
                    second, older enzyme, which meant the reader was taught one
                    silhouette here and shown another two scenes later. See
                    ENZYME_PATH in palette.ts.

                    0.64 puts the canonical path's 53-unit width back on the
                    34 units this diagram was laid out around, so nothing else
                    in the composition moves; the stroke is divided by the same
                    factor to keep its painted weight.
                  */
                  <g key={i} transform={`translate(${124 + i * 68 - 0.7} 39) scale(0.64)`}>
                    <path
                      d={ENZYME_PATH}
                      fill={made ? C.green : "none"}
                      fillOpacity={made ? on : 0}
                      stroke={C.ink}
                      strokeWidth="4"
                      strokeDasharray={made ? undefined : "8 8"}
                      strokeLinejoin="round"
                      opacity={made ? 1 : 0.35}
                    />
                  </g>
                );
              })}
            </svg>

            <p
              className="mt-6 max-w-[34ch] text-center font-black md:mt-8"
              style={{ ...T.sub, color: C.paper }}
            >
              A <span style={{ color: C.redOnField }}>DPYD</span> variant can reduce{" "}
              <span style={{ color: C.greenOnField }}>DPD</span> activity — limiting the body's
              ability to clear 5-FU.
            </p>
          </div>
        )}

        {/* the two patients, facing each other */}
        <div
          className="absolute inset-x-0 flex items-end justify-center gap-[5vw] md:gap-[12vw]"
          style={{
            bottom: "16vh",
            opacity: q(enter),
            /*
              The camera is still moving when this scene starts, and it settles
              here rather than cutting to rest.

              The previous scene ends on a pull-back away from the DNA, so the
              patients enter a fraction oversized and ease down to their resting
              size — the read is a camera decelerating to a stop, not a new
              composition being placed. Six percent is deliberately almost
              nothing: enough that the boundary feels continuous, not enough to
              register as the figures themselves moving.
            */
            transform: `translateY(${((1 - enter) * 30).toFixed(1)}px) scale(${(1 + (1 - enter) * 0.06).toFixed(4)})`,
            transformOrigin: "50% 100%",
          }}
        >
          <div className="flex items-end gap-2 md:gap-4" style={{ height: "var(--fig2)" }}>
            <Patient
              src={asset("patient-a.webp")}
              fill={fillA}
              alarm={0}
              flip={false}
              animate={active}
              seed={0}
            />
            {/*
              Taller than the figure on purpose. At 92% the bag hung level with
              the patient's chest, so the only place the line could reach was
              their legs — which is exactly what the client saw. A real stand is
              taller than the person, and once it is, the tube descends to the
              forearm the way it does in a ward.
            */}
            <div className="h-[118%]">
              <IV dose={dose} flow={flow} flip={false} />
            </div>
          </div>
          <div className="flex items-end gap-2 md:gap-4" style={{ height: "var(--fig2)" }}>
            <div className="h-[118%]">
              <IV dose={dose} flow={flow} flip />
            </div>
            <Patient
              src={asset("patient-b.webp")}
              fill={fillB}
              alarm={alarm}
              flip={false}
              animate={active}
              seed={1.9}
            />
          </div>
        </div>

        {/* "The same treatment." — arrives with the drip, leaves before the split */}
        <div className={L.headline} style={{ opacity: q(title.o) }}>
          <p
            className={`text-center font-black ${L.headlineWidth}`}
            style={{
              ...T.headline,
              color: C.paper,
              transform: `translateY(${title.y.toFixed(1)}px)`,
            }}
          >
            The same treatment.
          </p>
        </div>

        {/* "…doesn't mean the same outcome." — only after the split has happened */}
        <div className={L.headline} style={{ opacity: q(outcome.o) }}>
          <p
            className={`text-center font-black ${L.headlineWidth}`}
            style={{
              ...T.headline,
              color: C.paper,
              transform: `translateY(${outcome.y.toFixed(1)}px)`,
            }}
          >
            &hellip;doesn&rsquo;t mean the{" "}
            <span style={{ color: C.redOnField }}>same outcome.</span>
          </p>
        </div>
      </div>
    </section>
  );
}
