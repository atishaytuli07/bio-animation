import { useEffect, useState } from "react";

import { asset, C, L, R, T } from "@/components/hero/palette";
import { Slot } from "@/components/story/EnzymeSlot";
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
// The end is on the back of the hand, measured from the artwork. Both plates have the near arm hanging at the
// side with the hand between 50% and 55% of the figure's height: patient A's spans 85 to 98% of the plate's
// width there and patient B's 5.5 to 17%. The end used to sit at 42.5% down, which is on the forearm but level
// with the waistband, and it was painted under the figure, so what showed was a tube stopping at a hip. The
// client raised it twice.
// The figure is 1/1.18 of this drawing's height and the gap between them is a fixed share of that height (see
// GAP), so one point lands on the same place at every screen size: (-22, 249) is 90% across A and 9.5% across B,
// 52% down both.
const TUBE = { p0: [74, 162], p1: [74, 232], p2: [34, 294], p3: [-22, 249] } as const;
/** The dressing that holds the line on the hand, centred on the tube's end. */
const CANNULA = { x: -28, y: 244, w: 12, h: 10 } as const;
/** Space between a figure and its stand, as a share of the figure's height. 16px at the desktop size it was set at. */
const GAP = "calc(var(--fig2) * 0.034)";

/** The headlines' place on a phone: just under the chapter label, which ends near 124px. */
const PHONE_HEAD = "max-md:top-[max(128px,16vh)]";
/** The most drug either figure holds in this scene: the shared uptake plus all of what patient B cannot clear. */
const PEAK = 0.7;

function IV({
  dose,
  amount,
  flow,
  flip,
}: {
  /** How far the infusion has run, 0 to 1. */
  dose: number;
  /** How much was hung to begin with, 0 to 1 of a standard dose. */
  amount: number;
  flow: number;
  flip: boolean;
}) {
  const t = useTime(flow > 0.01);
  // A lower dose is less in the bag. It used to be the same bag drained less far, so turning the dose down made
  // the bag look fuller.
  const fluid = amount * (1 - dose * 0.85);
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
      {/* the tape across it, which is what makes a small pale rectangle read as a dressing */}
      <path
        d={`M${CANNULA.x + 4} ${CANNULA.y} v${CANNULA.h} M${CANNULA.x + 8} ${CANNULA.y} v${CANNULA.h}`}
        stroke={C.ink}
        strokeWidth="1.5"
      />
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
  // Coral throughout. It used to turn red as the load climbed, and red is the variant: the drug does not become
  // something else by accumulating. More of it is shown as more of it, by depth and by strength.
  const tint = C.coral;
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
          // The settle is a share of the figure's own height (1.5%, which is 7px at the size it was drawn for).
          // As a fixed 7px it sank a 141px figure on a small phone below the foot of its own stand.
          transform: `translateY(calc(${breath.toFixed(2)}px + ${(load * 1.5).toFixed(2)}%)) rotate(${(load * 1.1).toFixed(2)}deg)`,
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
              // Lighter than it was (0.42 rising to 0.72). The tint is the exposure, but it should not be the
              // loudest thing in the frame: the client asked for the difference to be carried by DPD activity
              // and exposure, and each patient's tag now states both.
              opacity: q(0.34 + alarm * 0.16),
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

// The enzyme bridge's two rows: the reference sequence and the variant, as named in the scene before, and the DPD
// activity each goes with. The reason sits under the variant row in the science review's own sentence.
const STATES = [
  {
    state: "Reference",
    pair: "GT",
    letter: "G",
    variant: false,
    activity: "expected DPD activity",
    why: "",
  },
  {
    state: "Variant",
    pair: "AT",
    letter: "A",
    variant: true,
    activity: "DPD activity can be reduced",
    why: "Abnormal splicing can reduce the amount of functional DPD produced.",
  },
] as const;

/**
 * Who this patient is, over their head: a letter and their DPD activity, with the five slots from the scene
 * before. The scene used to tell the two apart only by which one turned red, and by "Her" and "Him" on the
 * slider, so nothing stopped a reader concluding the difference was their sex. This says what the difference is
 * for as long as they are on screen.
 */
function PatientTag({
  name,
  activity,
  made,
  exposure,
  side,
}: {
  name: string;
  activity: string;
  made: number;
  /** How much drug is in this patient now, 0 to 1 of the most the scene shows. */
  exposure: number;
  /** Which side of the pair this patient stands on, so the tag can keep to the outside. */
  side: "left" | "right";
}) {
  return (
    <div
      // Over the head on a phone or tablet. On a phone it is wider than the figure, so it sits above the top of
      // the stand as well (the stand is 18% taller than the figure) and crosses neither. From 1024px it
      // moves to the patient's outer side at shoulder height: over the head there it sat 50 to 74px into the
      // headline. Both sets of classes are written out whole, because Tailwind only builds what it can read.
      className={`absolute bottom-full mb-[calc(var(--fig2)*0.2)] max-[339px]:mb-[calc(var(--fig2)*0.1)] w-[104px] px-2 py-1.5 text-center max-md:[@media(max-height:700px)]:w-[88px] max-md:[@media(max-height:700px)]:px-1 md:mb-3 md:w-max md:px-3 md:py-2 lg:bottom-auto lg:top-[16%] lg:mb-0 ${side === "left" ? "left-0 max-md:[@media(max-height:700px)]:-left-5 lg:left-auto lg:right-full lg:mr-4" : "right-0 max-md:[@media(max-height:700px)]:-right-5 lg:left-full lg:right-auto lg:ml-4"}`}
      style={{ background: PANEL, borderRadius: R.sm, color: C.ink }}
    >
      <p className="text-[12px] font-black leading-none md:text-[13px]">{name}</p>
      <p className="mt-1 text-[12px] font-semibold leading-tight md:text-[13px]">{activity}</p>
      {/* a short phone has no room for the row, and the words above it say the same thing */}
      <span
        className="mt-1.5 flex justify-center gap-0.5 max-md:[@media(max-height:700px)]:hidden"
        aria-hidden="true"
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <Slot key={i} made={i < made ? 1 : 0} small />
        ))}
      </span>
      {/* The exposure as a measure, in the drug's own colour, so the difference between the two can be read off
          a labelled bar and does not depend on noticing that one figure has changed colour. */}
      <span className="mt-1.5 block max-md:[@media(max-height:700px)]:hidden" aria-hidden="true">
        <span className="block text-[12px] font-semibold leading-none">5-FU exposure</span>
        <span
          className="mt-1 block h-[6px] overflow-hidden rounded-full"
          style={{ background: `${C.ink}24` }}
        >
          <span
            className="block h-full rounded-full"
            style={{ width: `${Math.round(Math.min(1, exposure) * 100)}%`, background: C.coral }}
          />
        </span>
      </span>
    </div>
  );
}

/** The bridge's panel: cream with a little of the chapter's lavender in it. */
const PANEL = `color-mix(in oklab, ${C.paper} 90%, ${C.lavender})`;

export function TwoPeople() {
  const [ref, p, active] = useSmoothProgress<HTMLElement>(0.1);
  // Dissolve out across the measured boundary at 0.513, as the bloodstream scene rises into the same frame.
  const pageP = usePageProgress();
  const handoff = range(pageP, 0.489, 0.522);

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
  // It opens at 0.10, page 0.236, just after the descent has finished dissolving at 0.231. At 0.13 there was a
  // frame of bare ground between the two scenes.
  const bridge = beat(p, 0.1, 0.17, 0.3, 0.37);
  // The three enzymes go as the panel arrives, so it is read in the state its title describes. They used to go
  // across the whole of its stay, and for the first third of it the row under "reduced" was full.
  const slots = range(p, 0.13, 0.2);
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
  // In by 0.80. Arriving at 0.80 to 0.90 it reached full strength as the scene began to dissolve (pp 0.88), so
  // the line the whole scene builds to was above half strength for two hundredths of the page.
  const outcome = beat(pp, 0.72, 0.8, 1.2, 1.3);

  // How far the slider card is up. From 0.52, not 0.56: at full strength it used to be on screen for a fifth of
  // a screen's scroll, which is not long to find a control and use it.
  const card = easeOut(band(pp, 0.52, 0.58, 0.72, 0.78));

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

  // What each body settles at. Patient A clears most of what arrives but not all of it: the bar used to fall to
  // zero, which said a patient with expected DPD activity has no drug in them. Patient B clears less of the same
  // dose, by enough that half a dose leaves B where a whole one leaves A (0.6 x 0.5 = 0.3 x 1), which is the
  // level both readouts call "as expected". So the words and the bars now measure the same thing.
  const fillA = uptake * level * (1 - clearA * 0.7);
  // He holds what she holds, plus what his reduced DPD cannot clear, and the slider governs only that second
  // term. At or below his ceiling it is zero and he behaves like her; at the standard dose it is the load the
  // scene was always showing.
  const fillB = (uptake * (1 - clearA * 0.4 * (1 - over)) + 0.36 * buildB * over) * level;
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
        // The figures are capped by width as well as height. Sized by height alone, the pair with their stands came
        // to 416px on a 390px phone and 786px on a 768px tablet, so the outer arms were cut off by the frame.
        // A short screen gets smaller figures standing higher, because the card under them does not shrink. A
        // short laptop window gets smaller ones too: at 52vh the stands reached the headline, and the second
        // line of the closing sentence was drawn underneath both bags.
        className="sticky top-0 h-screen overflow-hidden [--fig2:min(34vh,62vw)] [--feet:22vh] max-md:[@media(max-height:700px)]:[--fig2:min(22vh,68vw)] max-md:[@media(max-height:700px)]:[--feet:200px] md:[--fig2:min(52vh,600px,60vw)] md:[--feet:19vh] lg:[--feet:max(17vh,120px)] lg:[@media(max-height:700px)]:[--fig2:38vh]"
        style={{ opacity: 1 - q(handoff), visibility: handoff > 0.99 ? "hidden" : "visible" }}
      >
        {/* No background and no scattered field here any more; both moved to Ground and World. A scene that paints
            its own rectangle cannot fade into the next one, and that hard edge was the client's main note. */}
        {/* The chapter label lives in the story rail now — see StoryProgress. */}

        {/* The bridge: the letter, and the enzyme that goes with it. Drawn with the vocabulary already established,
            the red variant from the descent and the green enzyme the next scene will find missing. */}
        {bridge.o > 0.004 && (
          <div
            // a little below centre on a phone, where the panel is tall enough to reach the chapter label, and centred in
            // the space under the header on a wider screen, not in the whole window
            className="pointer-events-none absolute inset-x-0 top-[55%] z-20 flex -translate-y-1/2 flex-col items-center px-6 md:top-[calc(50%+30px)]"
            style={{ opacity: q(bridge.o), transform: `translateY(${bridge.y.toFixed(1)}px)` }}
          >
            {/* The two states the reader has just met, each beside the enzyme it leaves the body with. One red
                letter followed by fewer green shapes showed a result and asked the reader to supply the rest: what
                the shapes are, what the dashed ones mean, and why one causes the other. Every one of those is
                written here, in type a phone can read, which a label inside the old drawing could not be.
                It sits on a pale panel so the enzyme's green and the variant's red are on the ground they were
                picked for. */}
            <div
              className="w-[min(92vw,620px)] px-4 py-3.5 text-left md:px-7 md:py-5"
              style={{ background: PANEL, borderRadius: R.md, color: C.ink }}
            >
              {/* The key comes first, so the shapes are named before the rows that use them. */}
              <p className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] font-semibold md:mb-4 md:text-[13px]">
                <span className="font-black">DPD enzyme</span>
                <span className="flex items-center gap-1.5">
                  <Slot made={1} small /> functional
                </span>
                <span className="flex items-center gap-1.5">
                  <Slot made={0} small /> may not be produced
                </span>
              </p>
              {STATES.map((s, row) => (
                <div key={s.letter} className={row ? "mt-3.5 md:mt-5" : undefined}>
                  <p className="text-[13px] font-semibold leading-snug md:text-[15px]">
                    <span className="font-black">
                      {s.state} <span className="font-mono text-[1.08em]">{s.pair}</span>
                    </span>
                    : {s.activity}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2 md:mt-2 md:gap-3.5">
                    <span
                      className="grid h-9 w-8 shrink-0 place-items-center font-mono text-[19px] font-extrabold md:h-12 md:w-11 md:text-[26px]"
                      style={{
                        background: s.variant ? C.red : C.paper,
                        color: s.variant ? "#fff" : C.ink,
                        border: `2.5px solid ${C.ink}`,
                        borderRadius: R.sm,
                      }}
                    >
                      {s.letter}
                    </span>
                    <svg
                      viewBox="0 0 34 14"
                      className="w-5 shrink-0 md:w-8"
                      aria-hidden="true"
                      fill="none"
                      stroke={C.ink}
                      strokeWidth="2.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 7H31M25 2l6 5-6 5" />
                    </svg>
                    <span className="flex gap-1 md:gap-2.5" aria-hidden="true">
                      {[0, 1, 2, 3, 4].map((i) => {
                        // With the variant, three of the five stop being made, one after another as the reader
                        // scrolls: the row starts as the reference row and becomes the reduced one.
                        const lost =
                          s.variant && i >= 2
                            ? range(slots, (i - 2) * 0.2, (i - 2) * 0.2 + 0.4)
                            : 0;
                        return <Slot key={i} made={1 - lost} />;
                      })}
                    </span>
                  </div>
                  {s.why && (
                    <p
                      className="mt-1.5 text-[12.5px] leading-snug md:text-[14px]"
                      style={{ color: C.inkBody }}
                    >
                      {s.why}
                    </p>
                  )}
                </div>
              ))}
              <p
                className="mt-3 border-t pt-2.5 text-[12px] leading-snug md:mt-4 md:pt-3 md:text-[13px]"
                style={{ borderColor: `${C.ink}26`, color: C.inkBody }}
              >
                Illustration, not a measured ratio.
              </p>
            </div>

            <p
              // wide enough for two lines: at 34ch the sentence ran to three, and with the panel above it the block was
              // taller than a laptop screen, so the panel's top went under the header
              className="mt-4 max-w-[46ch] text-center font-black md:mt-6"
              style={{ ...T.sub, color: C.paper }}
            >
              A <span style={{ color: C.redOnField }}>DPYD</span> variant can reduce{" "}
              <span style={{ color: C.greenOnField }}>DPD</span> activity, which can limit the
              body's ability to clear <span className="whitespace-nowrap">5-FU</span>.
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
          <div className="flex items-end" style={{ height: "var(--fig2)", gap: GAP }}>
            <div className="relative h-full">
              <PatientTag
                name="Patient A"
                activity="expected DPD activity"
                made={5}
                exposure={fillA / PEAK}
                side="left"
              />
              <Patient
                src={asset("patient-a.webp")}
                fill={fillA}
                alarm={0}
                flip={false}
                animate={active}
                seed={0}
              />
            </div>
            {/* Taller than the figure on purpose. At 92% the bag hung level with the patient's chest, so the only place
                the line could reach was their legs, which is what the client saw. A real stand is taller than the person,
                and once it is, the tube descends to the hand the way it does in a ward.
                Above the figure in paint order: the figure is a transformed layer, so without this the end of the
                line and its dressing were drawn underneath the hand they are on. */}
            <div className="relative z-10 h-[118%]">
              <IV dose={dose} amount={level} flow={flow} flip={false} />
            </div>
          </div>
          <div className="flex items-end" style={{ height: "var(--fig2)", gap: GAP }}>
            <div className="relative z-10 h-[118%]">
              <IV dose={dose} amount={level} flow={flow} flip />
            </div>
            <div className="relative h-full">
              <PatientTag
                name="Patient B"
                activity="reduced DPD activity"
                made={2}
                exposure={fillB / PEAK}
                side="right"
              />
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
        </div>

        {/* What the scene is, for as long as it is on screen and the slider card is not: the card carries the same
            two sentences, and it is only up for about half a screen. Without this the last frame of the scene, the
            one with the man visibly affected, had no disclaimer and nothing saying sex is not the cause. */}
        <p
          className="pointer-events-none absolute inset-x-0 bottom-[3vh] z-20 mx-auto w-fit max-w-[92vw] rounded px-3 py-1.5 text-center text-[12px] leading-snug md:text-[13px]"
          style={{ background: `${C.ink}cc`, color: C.paper, opacity: q(enter * (1 - card)) }}
        >
          Illustrative simulation, not a clinical prediction. The two differ in DPD activity, not
          because of their sex.
        </p>

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
            opacity: q(card),
            pointerEvents: q(card) > 0.3 ? "auto" : "none",
          }}
        >
          <div
            className="w-full max-w-[420px] rounded-[10px] px-4 py-2 md:max-w-[720px] md:px-5 md:py-2.5"
            // A hairline and no offset shadow. On this site the hard shadow means "press this", and this is a
            // panel holding a slider, not a button.
            style={{ background: C.paper, border: `1.5px solid ${C.ink}59` }}
          >
            <div className="flex items-baseline justify-between gap-3">
              {/* tighter than the house label, so it stays on one line beside the state on a 360px phone */}
              <span
                className="text-[12px] font-bold uppercase tracking-[0.08em] md:tracking-[0.14em]"
                style={{ color: C.ink }}
              >
                One dose, both patients
              </span>
              <span
                className="text-[12px] font-bold uppercase tracking-[0.08em] md:tracking-[0.14em]"
                style={{ color: C.inkBody }}
              >
                {/* "much lower", not "reduced": the tag beside it says "reduced DPD activity", and one word was
                    doing two jobs in one frame */}
                {level >= 0.95 ? "standard" : level <= HIS_MAX ? "much lower" : "lower"}
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
                className="mt-2 w-full md:mt-0 md:flex-1"
                // ink: red is the variant, and a slider is not
                style={{ accentColor: C.ink, touchAction: "none" }}
              />

              {/* What the picture shows at this dose, said as what it is: a dose, and an exposure. The readouts were
                  "treated" and "accumulating", which are outcomes, and a slider on a wiki cannot know those.
                  Ink on a tint, not green and red: green is the enzyme and red is the variant, and a reader who
                  cannot separate the two hues loses nothing. The tint is coral, the drug's, when there is more or
                  less of the drug than intended. */}
              <div className="mt-2 grid grid-cols-2 gap-2 md:mt-0 md:w-[372px] md:shrink-0">
                {[
                  {
                    who: "Patient A",
                    ok: treated,
                    // exposure for both, so the two read as one measure and neither repeats the dose named above
                    yes: "exposure as expected",
                    no: "exposure may be too low",
                  },
                  {
                    who: "Patient B",
                    ok: over <= 0.02,
                    yes: "exposure as expected",
                    no: "exposure can increase",
                  },
                ].map((r) => (
                  <div
                    key={r.who}
                    className="rounded-[6px] px-2.5 py-1.5"
                    style={{
                      background: r.ok ? `${C.ink}0a` : `${C.coral}2e`,
                      border: `1.5px solid ${r.ok ? `${C.ink}40` : C.coral}`,
                    }}
                  >
                    <span
                      className="block text-[12px] font-bold leading-none"
                      style={{ color: C.inkBody }}
                    >
                      {r.who}
                    </span>
                    <span
                      className="mt-1 block text-[12.5px] font-black leading-tight md:whitespace-nowrap md:text-[13px] md:leading-none"
                      style={{ color: C.ink }}
                    >
                      {r.ok ? r.yes : r.no}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-1.5 text-[12px] leading-tight" style={{ color: C.inkBody }}>
              Illustrative simulation, not a clinical prediction.
              {/* said outright, because the two are drawn as a woman and a man; a short phone has no line to spare */}
              <span className="max-md:[@media(max-height:700px)]:hidden">
                {" "}
                The two differ in DPD activity, not because of their sex.
              </span>
            </p>
          </div>
        </div>

        {/* "The same treatment." — arrives with the drip, leaves before the split. On a phone both headlines are set
            smaller and a little higher: at full size the second one wrapped onto two lines and ran into the
            patients' cards on screens 360px wide and under. */}
        <div className={`${L.headline} ${PHONE_HEAD}`} style={{ opacity: q(title.o) }}>
          <p
            className={`text-center font-black ${L.headlineWidth} max-md:!text-[1.6rem]`}
            style={{
              ...T.headline,
              color: C.paper,
              transform: `translateY(${title.y.toFixed(1)}px)`,
            }}
          >
            The same treatment.
          </p>
        </div>

        {/* The second half of the sentence, only after the split has happened. "Exposure", because that is what
            the picture shows: how much drug is in each body. An outcome is a different thing, and the science
            review asks for the two not to be swapped. */}
        <div className={`${L.headline} ${PHONE_HEAD}`} style={{ opacity: q(outcome.o) }}>
          <p
            className={`text-center font-black ${L.headlineWidth} max-md:!text-[1.4rem] max-md:[@media(max-height:700px)]:!text-[1.15rem]`}
            style={{
              ...T.headline,
              // Sized to stay on one line inside the width the headline is allowed (see L.headlineWidth). It is
              // longer than the first half of the sentence, and at the headline's full size it wrapped: the
              // second line was drawn across the tops of both stands.
              fontSize: "clamp(1.75rem, min(4.8vw, (100vw - 34rem) / 16.8), 3.8rem)",
              color: C.paper,
              transform: `translateY(${outcome.y.toFixed(1)}px)`,
            }}
          >
            &hellip;may not mean the same exposure.
          </p>
        </div>
      </div>
    </section>
  );
}
