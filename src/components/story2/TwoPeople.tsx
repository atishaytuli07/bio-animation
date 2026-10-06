import { useEffect, useState } from "react";

import { asset, C, ENZYME_PATH, L, T } from "@/components/hero/palette";
import { usePageProgress } from "@/hooks/use-page-progress";
import { recordStory } from "@/lib/story-state";
import {
  band,
  beat,
  easeOut,
  range,
  useSmoothProgress,
  useTime,
} from "@/hooks/use-scroll-progress";

// Stop two, "Two people". The descent ended on a letter; this is what that letter means for a person. Two
// patients, the same drug, the same dose, and for a deliberately long stretch nothing separates them. Then one
// body clears the drug and the other cannot, and only then does the sentence finish.
// The characters are illustrated plates, AI-generated and declared in Attributions. Everything that moves is
// drawn in code on top: the IV hardware, the dose travelling, and the drug visibly filling one body, using the
// plate's own alpha as a CSS mask so the tint is inside the person rather than a rectangle over them.
// The room warms as B's load climbs, and it does not go dark: the client rejected near-black sections, and the
// emotional arc is carried by saturation and hue. That warming comes from Ground, whose keyframes at page 0.35
// and 0.44 mix coral and then red into the field while this scene is on screen.
// The scattered ambient objects belong to World, which travels the whole story.

const q = (v: number) => Math.round(v * 20) / 20;

// The two ceilings the reader is asked to satisfy at once, and cannot. The slider gives one dose to both
// people, which is what standard dosing does: the dose comes from body surface area, not from how fast a
// particular body clears the drug. She has normal DPD and needs the full dose for it to be a treatment; he has
// reduced DPD and accumulates above a much lower one.
// The two bands do not overlap, and that is the point. Anything that treats her is too much for him, anything
// safe for him is not a treatment for her, so the reader hunts for a setting that satisfies both, fails, and
// concludes that the dose has to be per person, three beats before the story says so.
// These are positions on a slider, not milligrams. No dose figure appears anywhere on this wiki: real numbers
// belong to guidance the team has to cite. The claim the geometry makes is the project's own premise.
const HER_MIN = 0.7;
const HIS_MAX = 0.5;

/** IV stand, bag, drip chamber and line — all SVG, so the dose can move. */

// The drug in the bag is always coral, on both stands, all the way through. The point of the beat is that the
// treatment is identical and only the body's response differs, so tinting one bag would tell the wrong story.

// The tube, as one cubic, used twice. The path that draws the line and the sampler that runs the dose along it
// used to carry the same four control points as separate literals, so moving the end meant editing two places
// and hoping they agreed.
// The end is on the forearm, measured. At (-30, 226) the cannula landed at x 81.3% of patient A's plate and
// 17.8% of patient B's, while at that height A's near arm spans 87 to 97% and B's spans 5 to 16%: both sat in
// the gap between the arm and the torso, at hip height, which is why the client saw them plugged into a pocket.
// Nine units toward the stand and nine up puts them at about 90% and 9%, inside the arm on both plates.
const TUBE = { p0: [74, 162], p1: [74, 214], p2: [22, 250], p3: [-16, 217] } as const;
/** The cannula, sitting on the tube's end. */
const CANNULA = { x: -29, y: 212, w: 14, h: 6 } as const;

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
        d={`M${TUBE.p0[0]} ${TUBE.p0[1]} C ${TUBE.p1[0]} ${TUBE.p1[1]}, ${TUBE.p2[0]} ${TUBE.p2[1]}, ${TUBE.p3[0]} ${TUBE.p3[1]}`}
        fill="none"
        stroke={`${C.ink}55`}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <rect
        x={CANNULA.x}
        y={CANNULA.y}
        width={CANNULA.w}
        height={CANNULA.h}
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
              b0 * TUBE.p0[0] + b1 * TUBE.p1[0] + b2 * TUBE.p2[0] + b3 * TUBE.p3[0],
              b0 * TUBE.p0[1] + b1 * TUBE.p1[1] + b2 * TUBE.p2[1] + b3 * TUBE.p3[1],
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
// A patient: plate, the drug inside them masked to their silhouette, and movement. The client's note was that
// the figures read as static illustrations placed on top of the experience rather than part of it. Two things
// move, and they are deliberately different in kind:
//   breathing  a slow rise and fall, always on, which is what stops a plate looking like a sticker. Tiny on
//              purpose; at this scale anything larger reads as a bobbing animation.
//   reacting   the body responds to its own drug load. As it climbs the figure settles, a little lower and
//              tilted off vertical, so the one who cannot clear the drug visibly tires without a word.
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
  // Dissolve out across the measured boundary at 0.513, as the bloodstream scene rises into the same frame.
  const pageP = usePageProgress();
  const handoff = range(pageP, 0.489, 0.526);

  // The beats: enter, the same treatment, identical and held, one clears while one fills, the sentence finishes.
  // The hold is the point, because the split only hurts if the reader has had time to believe there was no
  // difference.
  // The bridge, and it runs before anything else here. The client identified a missing link: we showed the gene
  // and the variant, then jumped to two people with different outcomes without showing the thing in between. Her
  // chain was variant, reduced DPD activity, reduced breakdown, accumulation, toxicity risk, and she asked for it
  // as a short visual transformation rather than an explanation.
  // So the letter the reader just watched change now decides how much enzyme this body builds, five slots and two
  // filled, and only then do the patients arrive. Everything after runs on `pp`, the remaining progress remapped
  // to 0 to 1, so the two-patient beat is unchanged in shape and simply starts later.
  // The bridge waits for the previous scene to finish leaving. It used to open at local 0.02, page 0.209, inside
  // the descent's handoff window of 0.196 to 0.231, so the enzyme diagram arrived while the previous closing line
  // was still fading: two unrelated pieces of information sharing a frame at the boundary that most needed to feel
  // clean. Opening at 0.13 puts it at page 0.243, after the descent has dissolved at 0.231. The cost is that the
  // two-patient act runs 377vh instead of 441vh, which is a fair price for a boundary that reads as continuous.
  const bridge = beat(p, 0.13, 0.2, 0.3, 0.37);
  const slots = range(p, 0.19, 0.31);
  const pp = range(p, 0.35, 1);

  // easeOut, not linear: a linear fade leaves the figures, stands and bags all half-transparent for about half a
  // screen of scrolling, which reads as an unfinished render rather than an entrance.
  const enter = easeOut(range(pp, 0.01, 0.11));
  const title = beat(pp, 0.12, 0.2, 0.6, 0.68);
  const flow = band(pp, 0.2, 0.26, 0.88, 0.94);
  const dose = range(pp, 0.2, 0.9);
  const uptake = 0.34 * range(pp, 0.24, 0.5); // both, identically
  const clearA = range(pp, 0.54, 0.74);
  const buildB = range(pp, 0.54, 0.8);
  const alarm = range(pp, 0.6, 0.82);
  const outcome = beat(pp, 0.8, 0.9, 1.2, 1.3);

  // The reader's dose. It starts at 1, the standard dose, so a reader who never touches the slider sees exactly
  // the scene that was here before it existed, and every harness that only scrolls measures the same thing.
  const [chosen, setChosen] = useState(1);
  const [moved, setMoved] = useState(false);

  // The story takes the dose back. The slider is a sidebar inside the hold, not a fork in the story: if the
  // reader left it on "reduced" he would never accumulate, and the closing line would land over a picture in which
  // the outcome is the same. So as the control fades out the dose eases back to standard.
  // That is not a cheat, it is the point. Without a test, the standard dose is what gets given, and the reader has
  // just discovered there is no dose that suits both of them.
  const resume = range(pp, 0.72, 0.8);
  const level = chosen + (1 - chosen) * resume;

  /** How far past his ceiling this dose is: 0 at or below it, 1 at standard. */
  const over = Math.max(0, Math.min(1, (level - HIS_MAX) / (1 - HIS_MAX)));
  /** Enough of a dose to still be a treatment for her. */
  const treated = level >= HER_MIN;

  const fillA = uptake * level * (1 - clearA);
  // He holds what she holds, plus what his reduced DPD cannot clear, and the slider governs only that second
  // term. At or below his ceiling it is zero and he behaves like her; at the standard dose it is the load the
  // scene was always showing.
  const fillB = (uptake + 0.36 * buildB * over) * level;
  const alarmB = alarm * over;

  useEffect(() => {
    recordStory({ sliderMoved: moved ? true : undefined });
  }, [moved]);

  return (
    <section
      id="two-people"
      ref={ref}
      style={{ height: "580vh", marginTop: "-100vh" }}
      className="relative"
      data-active={String(active)}
    >
      <div
        // --feet is where the figures stand. It was a bare 16vh at every width, and on a phone the dose slider, which
        // has to sit below them, is taller than that gap: the card ran 37px up into the figures at 390 and 14px at 768.
        // Three steps, not two. 768 is exactly Tailwind's md, so a two-step rule handed the tablet the desktop value and
        // the overlap there did not move. Phones get 22vh, tablets 19vh, desktop 17vh, one vh above the approved 16,
        // which is 8px on a 768-tall laptop and buys the card 16px of clearance instead of 8.
        className="sticky top-0 h-screen overflow-hidden [--fig2:36vh] [--feet:22vh] md:[--fig2:min(52vh,600px)] md:[--feet:19vh] lg:[--feet:17vh]"
        style={{ opacity: 1 - q(handoff), visibility: handoff > 0.99 ? "hidden" : "visible" }}
      >
        {/* No background and no scattered field here any more; both moved to Ground and World. A scene that paints
            its own rectangle cannot fade into the next one, and that hard edge was the client's main note. */}
        {/* The chapter label lives in the story rail now — see StoryProgress. */}

        {/* The bridge: one letter, and how much enzyme this body builds. Drawn with the vocabulary already
            established, the red variant badge from the descent and the green enzyme the next scene will find missing. */}
        {bridge.o > 0.004 && (
          <div
            className="pointer-events-none absolute inset-x-0 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center px-6"
            style={{ opacity: q(bridge.o), transform: `translateY(${bridge.y.toFixed(1)}px)` }}
          >
            {/* 560px was 6.8% of a 1440x900 frame and the headline beneath it measured 10.9%: the words took more of the
                screen than the picture at the moment the picture is supposed to be making the argument. What the client
                keeps rejecting is emptiness, not text, so the fix is to fill the frame rather than strip the copy. */}
            <svg viewBox="0 0 460 130" className="w-[min(92vw,860px)]" aria-hidden="true">
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

              {/* Five slots, two filled. "Reduced, not absent" is the accurate claim, and the picture makes it without a
                  sentence. */}
              {[0, 1, 2, 3, 4].map((i) => {
                const on = range(slots, i * 0.12, i * 0.12 + 0.3);
                const made = i < 2;
                return (
                  // The same object the bloodstream scene draws. This used to be an inline rounded rectangle with a notch, a
                  // second, older enzyme, so the reader was taught one silhouette here and shown another two scenes later. See
                  // ENZYME_PATH in palette.ts.
                  // 0.64 puts the canonical path's 53-unit width back on the 34 units this diagram was laid out around, so nothing
                  // else in the composition moves; the stroke is divided by the same factor to keep its painted weight.
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
            bottom: "var(--feet)",
            opacity: q(enter),
            // The camera is still moving when this scene starts, and it settles here rather than cutting to rest. The
            // previous scene ends on a pull-back, so the patients enter a fraction oversized and ease down to their resting
            // size: a camera decelerating to a stop, not a new composition being placed. Six percent is almost nothing,
            // enough that the boundary feels continuous and not enough to register as the figures moving.
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
            {/* Taller than the figure on purpose. At 92% the bag hung level with the patient's chest, so the only place
                the line could reach was their legs, which is what the client saw. A real stand is taller than the person,
                and once it is, the tube descends to the forearm the way it does in a ward. */}
            <div className="h-[118%]">
              <IV dose={dose * level} flow={flow} flip={false} />
            </div>
          </div>
          <div className="flex items-end gap-2 md:gap-4" style={{ height: "var(--fig2)" }}>
            <div className="h-[118%]">
              <IV dose={dose * level} flow={flow} flip />
            </div>
            <Patient
              src={asset("patient-b.webp")}
              fill={fillB}
              alarm={alarmB}
              flip={false}
              animate={active}
              seed={1.9}
            />
          </div>
        </div>

        {/* The slider: one dose, two people. It arrives only after the two have visibly diverged, because before that
            the long identical uptake is the beat and a control there would let the reader break it. It leaves at 0.72
            to 0.78, before the closing line arrives at 0.80, and the dose eases back to standard over the same window.
            The two readouts are the mechanism: she needs the dose kept up to be treated, he needs it brought down to be
            safe, and they never both go green. A reader who drags it end to end has run the whole argument. */}
        <div
          // The card has to fit under the figures at every height, and stacked it did not: 144px tall against a 13vh gap,
          // it ran 27px into them at 1440x900 and 48px at 1024x768, measured only after phone and tablet had been checked
          // and passed. From md the two readouts sit beside the slider, the card drops to about 95px, and it sits 2vh off
          // the floor instead of 3.
          className="absolute inset-x-0 bottom-[3vh] z-30 flex justify-center px-6 md:bottom-[2vh]"
          style={{
            opacity: q(easeOut(band(pp, 0.56, 0.62, 0.72, 0.78))),
            pointerEvents: q(easeOut(band(pp, 0.56, 0.62, 0.72, 0.78))) > 0.3 ? "auto" : "none",
          }}
        >
          <div
            className="w-full max-w-[420px] rounded-[10px] px-4 py-3 md:max-w-[640px] md:px-5 md:py-2.5"
            style={{
              background: C.paper,
              border: `2.5px solid ${C.ink}`,
              boxShadow: `4px 4px 0 ${C.ink}`,
            }}
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className={L.note} style={{ color: C.ink }}>
                One dose, both patients
              </span>
              <span className={L.note} style={{ color: C.inkNote }}>
                {level >= 0.95 ? "standard" : level <= HIS_MAX ? "reduced" : "lowered"}
              </span>
            </div>

            <div className="md:flex md:items-center md:gap-4">
              <input
                type="range"
                min={0.25}
                max={1}
                step={0.01}
                value={chosen}
                aria-label="Dose given to both patients"
                onChange={(e) => {
                  setChosen(Number(e.currentTarget.value));
                  setMoved(true);
                }}
                className="mt-3 w-full md:mt-0 md:flex-1"
                style={{ accentColor: C.redDeep, touchAction: "none" }}
              />

              <div className="mt-2.5 grid grid-cols-2 gap-2 md:mt-0 md:w-[270px] md:shrink-0">
                {[
                  { who: "Her", ok: treated, yes: "treated", no: "under-treated" },
                  { who: "Him", ok: over <= 0.02, yes: "clears it", no: "accumulating" },
                ].map((r) => (
                  <div
                    key={r.who}
                    className="rounded-[6px] px-2.5 py-1.5"
                    style={{
                      background: r.ok ? `${C.green}1f` : `${C.red}14`,
                      border: `2px solid ${r.ok ? C.green : C.red}66`,
                    }}
                  >
                    <span className={L.note} style={{ color: C.inkNote }}>
                      {r.who}
                    </span>
                    <span
                      className="mt-0.5 block text-[13px] font-black leading-none"
                      style={{ color: r.ok ? C.green : C.redDeep }}
                    >
                      {r.ok ? r.yes : r.no}
                    </span>
                  </div>
                ))}
              </div>
            </div>
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
