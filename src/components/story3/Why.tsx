import { Link } from "@tanstack/react-router";
import { WIKI } from "@/lib/wiki";
import { useEffect, useRef, useState } from "react";

import { asset, BODY, C, DISPLAY, L, T } from "@/components/hero/palette";
import { Slot } from "@/components/story/EnzymeSlot";
import { usePageProgress } from "@/hooks/use-page-progress";
import { BOT, ENZYME, EY, H, Hex, TOP, VesselShell, W } from "@/components/story/vessel";
import { WHY_TRAVEL, whyAt } from "@/lib/story-map";
import { recordStory } from "@/lib/story-state";
import {
  band,
  beat,
  easeOut,
  range,
  useSmoothProgress,
  useTime,
} from "@/hooks/use-scroll-progress";

// Stop three, "Look closer". This section used to be two vessels side by side, which made it the second A/B
// split in a row: stop two already ran "same drug, two people, watch them separate", and repeating that move one
// scale down taught nothing new.
// It now goes in, out, back in. The reader already knows which of the two is in trouble; this stop enters his
// bloodstream and finds the reason. One vessel, not two, because the comparison has already happened.
// The payoff is the site's own vocabulary closing a loop: the red A the reader pulled out of the helix in stop
// one comes back, drops a hairline down the frame, and lands on the shortfall where a full complement of enzyme
// should have been. Gene, enzyme, drug, drawn as one line in one image.
// Accuracy here is load-bearing. DPYD variants reduce enzyme activity, they do not abolish it, and two things
// encode that rather than a caption walking it back: one molecule in four is still broken down while the pile is
// building, and the enzyme is drawn as a level, a dashed full outline with about two fifths filled, which never
// changes, because nothing the reader does changes how much DPD this body makes. Scene two says the same thing
// with five slots and two filled, and the two must agree.
// An earlier draft said the enzyme "is never built", which was wrong; the version after it filled the shape
// solid green at the turn, which was wrong the other way, telling the reader that lowering the dose restored the
// enzyme.
// Placeholder science: the mechanism is textbook, but the wording needs the team's confirmation before this
// ships, since iGEM requires that nothing on a wiki be unverifiable.

const q = (v: number) => Math.round(v * 20) / 20;

/** Cream at most of its strength: the ground under the two lines that explain the drawing. */
const NOTE_GROUND = `${C.paper}c7`;

/** Molecules in flight. Every 4th is still cleared — the enzyme is reduced. */
const IN_FLIGHT = 9;
const CLEARED_EVERY = 4;

// A small annotation for the vessel. On a wide screen it stands outside the vessel's left wall, in the empty third
// of the frame, with a leader running in to the thing it names; the leader's length is the tag's own, because the
// three things are at different depths. It used to hang off the right of its anchor, which is the side the man
// is on: at 1280x600 the first tag covered his face.
// Below 1024px there is no empty third, so the tag is a plain label centred over the vessel at a height where it
// covers nothing it names. On a phone it used to sit, boxed, on top of the enzyme row it was labelling.
// No ink border and no offset shadow: those mean "press this" here, and a label is not a control.
function Tag({
  on,
  x,
  y,
  narrowY,
  title,
  sub,
  tone,
}: {
  on: number;
  /** Where the leader ends, as a share of the vessel's width from its left edge. */
  x: number;
  /** Height on a wide screen, as a share of the vessel's height. */
  y: number;
  /** Height below 1024px, same measure. May be negative: above the vessel. */
  narrowY: number;
  title: string;
  sub: string;
  tone: string;
}) {
  if (on <= 0.004) return null;
  return (
    <div
      className="pointer-events-none absolute top-[var(--ny)] flex items-center max-lg:inset-x-0 max-lg:justify-center lg:right-[var(--tr)] lg:top-[var(--ty)] lg:-translate-y-1/2"
      style={
        {
          "--tr": `${((1 - x) * 100).toFixed(1)}%`,
          "--ty": `${y}%`,
          "--ny": `${narrowY}%`,
          opacity: q(easeOut(on)),
        } as React.CSSProperties
      }
    >
      <span
        className="whitespace-nowrap rounded-[6px] px-3 py-1.5"
        style={{ background: C.paper, border: `1.5px solid ${C.ink}47` }}
      >
        <span
          className="block text-[14px] font-black leading-none md:text-[15px]"
          style={{ color: C.ink }}
        >
          {title}
        </span>
        <span
          className="mt-1 block text-[12px] font-semibold leading-none md:text-[13px]"
          style={{ color: C.inkBody }}
        >
          {sub}
        </span>
      </span>
      {/* the leader, from the label across the wall to the thing itself */}
      <span
        className="hidden h-[1.5px] shrink-0 lg:block"
        style={{
          width: `calc(var(--vessel) * ${(0.692 * x + 0.03).toFixed(3)})`,
          background: `${C.ink}80`,
        }}
      />
      <span
        className="hidden h-2.5 w-2.5 shrink-0 rounded-full lg:block"
        style={{ background: tone, border: `1.5px solid ${C.ink}` }}
      />
    </div>
  );
}

export function Why() {
  const [ref, p] = useSmoothProgress<HTMLElement>(0.1);
  const pageP = usePageProgress();
  const [hot, setHot] = useState(false);
  /**
   * The second press. The reader gives the dose twice in this scene: once with nothing to go on, and once with
   * the result in hand. `hot` is the first and this is the second. Same gesture, different information.
   */
  const [hot2, setHot2] = useState(false);

  // One scene, two acts. This used to be two sections that crossfaded, and the client caught it immediately: they
  // show the same picture, the same man, the same lens, the same vessel, so dissolving between them stacked two
  // figures and two headlines for a whole screen of scroll.
  // Nothing about the picture changes at the turn. What changes is its state: the drug piles up under a standard
  // dose, then the variant is known, the dose comes down and the pile drains. The enzyme does not change. One
  // vessel, one figure, one continuous scroll, so the story turns and the scene does not restart.

  // The timeline, in vh of scroll, since that is what the reader spends. The scene travelled 760vh and showed
  // about six distinct pictures in it; the client asked for 20 to 30% less. What went is the waiting, not the
  // beats: the empty vessel before the drug arrives (76vh to 40), the three labels that used to take turns on one
  // unchanging picture (290vh to 170, by arriving together), the hold after "exposure can increase", and a blank
  // tail. What came in is the one beat the story did not have, the project itself, at the turn. 600vh in all,
  // which is 21% less scroll than before.
  //     0 to  40   the man and an empty vessel               "Look closer."
  //    40 to 120   the drug arrives, and is named
  //   120 to 262   the enzyme, the variant above it, and the load building as they are named
  //   262 to 344   "So 5-FU exposure can increase."
  //   344 to 425   the turn                                   "What if we knew first?"
  //   398 to 496   ChemoGuard: know before the first dose. The scene steps back for it.
  //   478 to 545   the result, and the dose comes down
  //   522 to 582   what had accumulated drains
  //   540 to 600   the closing line, held, and the scene's exit
  /** A position in this scene, in vh from its start, as the local progress its beats are driven by. */
  const v = (vh: number) => vh / WHY_TRAVEL;

  /* act one — what a standard dose does */
  const enter = easeOut(range(p, v(5), v(30)));
  const lineA = beat(p, v(8), v(28), v(95), v(115));
  const flow = band(p, v(40), v(70), 0.97, 0.995);
  const drugLabel = band(p, v(55), v(80), v(110), v(130));
  const gap = range(p, v(120), v(160));
  const link = range(p, v(135), v(175));
  const variantLabel = band(p, v(150), v(175), v(235), v(255));
  const build = range(p, v(175), v(270));
  const alarm = range(p, v(205), v(275));
  // With the variant's label, not after it. On a wide screen they stand at different heights outside the vessel
  // and on a narrow one above and below it, so the two can share the frame, and the reader sees the letter and
  // what it does to the enzyme as one statement.
  const enzymeLabel = band(p, v(165), v(190), v(250), v(270));
  // Each headline is out before the next is in. `beat` eases the entrance and leaves the exit linear, so two
  // windows that merely touch still put both lines above half strength for a moment: the next line's entrance
  // starts where this one's exit ends, never inside it.
  const lineB = beat(p, v(262), v(292), v(312), v(344));

  /* the turn — and everything after it undoes what act one built */
  const lineC = beat(p, v(344), v(380), v(400), v(425));
  // The project's own moment, and the answer to the question still on screen as it arrives. The story explained
  // why testing matters for five chapters without once naming the thing the team is building. It takes the whole
  // frame, the scene dimming behind it, because it is the one beat that is not about this patient.
  const moment = band(p, v(398), v(428), v(470), v(496));
  const result = band(p, v(478), v(510), 0.97, 0.995);
  /** 9 molecules of standard dose come down to 4. */
  const trim = range(p, v(498), v(545));
  // What had accumulated drains away. It waits for the second control to be up (488 to 516) so that a press can
  // be seen to do it, then goes anyway, so a reader who never touches the control still gets the resolution.
  const drain = range(p, v(522), v(582));
  // The dose comes down to meet the enzyme this person has. Nothing about the enzyme moves on this beat: a
  // carrier makes less DPD before the test and exactly the same amount after it. What moves is the load.
  const adjusted = range(p, v(512), v(566));
  // The story's last line. Full by 566 and held until the stage starts to leave at 588.
  const lineD = beat(p, v(540), v(566), v(590), v(599));
  // The scene leaves as a whole, on real scroll position and not on the section's spring-smoothed progress,
  // which lags a fast scroll: by the time it reached the fade the stage had already unpinned.
  const exit = range(pageP, whyAt(588), whyAt(599.5));
  /** The in-vessel letter hands over to the report card at the turn. */
  const handover = range(p, v(465), v(500));
  /** How far the scene stands back for the ChemoGuard moment. */
  const aside = 1 - moment * 0.88;

  const t = useTime(flow > 0.01);

  // Phase is accumulated per frame rather than computed as t x speed: changing the speed of a t x speed term
  // teleports every molecule at once. Guarding on t also makes this idempotent, so React's development
  // double-render cannot advance the animation twice in one frame.
  const phase = useRef(0);
  const lastT = useRef(t);
  const speed = useRef(1);
  const extra = useRef(0);
  /**
   * How much of the clearing the reader's own press has done. The drain is scroll-driven and complete on its
   * own, so a reader who never touches the control still gets the resolution. What the press does is bring the
   * clearing forward under the reader's thumb, so the vessel empties because they gave the adjusted dose rather
   * than because they kept scrolling. It can only add to the drain, never take it past the same 78%: "reduced,
   * not absent" is a science rule, not a UI one.
   */
  const cleared = useRef(0);
  if (t !== lastT.current) {
    const dt = t - lastT.current;
    // Only the first press speeds the infusion. Letting the second inherit the 2.4x boost was backwards, and
    // measured: holding the adjusted dose took the held count from 8 down to 4 in 1.2s, then the faster inflow
    // refilled it to 8 while the thumb was still down. An adjusted dose is less arriving, not more.
    speed.current += ((hot ? 2.4 : 1) - speed.current) * 0.15;
    phase.current += dt * speed.current;
    // Holding keeps the infusion running, so the load climbs faster. Ridden on the same clock as everything else —
    // this used to be its own setInterval, which only happened to work because useTime re-renders every frame.
    if (hot) extra.current = Math.min(0.4, extra.current + dt * 0.22);
    // Only once the result is actually on screen. The control is faded out before that, but a faded control is still
    // a control: an invisible button that accepted the pointer drained the vessel before the test existed.
    if (hot2 && result > 0.5) cleared.current = Math.min(1, cleared.current + dt * 0.55);
    lastT.current = t;
  }
  const ph = phase.current;

  // Coral, always. It used to turn red while it accumulated, the exact red of the variant badge it was piling up
  // beside, so one colour was saying two things in the same frame. More of the drug is drawn as more of the drug.
  const drugTone = C.coral;

  // A residual survives the turn, about a fifth rather than none. `1 - drain` emptied the vessel completely,
  // which draws "no drug". The treatment does not stop when the dose is adjusted: it is still 5-FU, still
  // circulating, at an exposure the person's own DPD can keep up with. The drain takes 78% and the tone returns to
  // coral rather than red, lower concentration rather than absence.
  const draining = Math.min(1, drain + cleared.current);
  // He carries the load, and sheds it when the reader does. In scene two he sags and tints as the drug builds;
  // here he stood beside the vessel as a still picture, so the second press emptied a tube and not a person.
  // These are the same quantities the vessel is drawn from, `build` and `alarm` on the way up and `draining` on
  // the way down, so the man and the column can never disagree.
  const load = alarm * (1 - draining);
  // A level, not a recolour. `build` reaches 1, so an uncapped level filled him to the crown and he read as a
  // different, darker character rather than the man from the scene before. Scene two's own fill tops out near
  // 0.70 of the figure; 0.62 here keeps him recognisably himself with the load plainly rising up him.
  const carried = 0.62 * build * (1 - draining * 0.78);
  const bodyTint = C.coral;
  // What does not get cleared, suspended rather than settled. These used to stack in rows on the floor of the
  // vessel, and the client read exactly what that draws: a drug that physically sinks. What happens when DPD
  // activity is reduced is that the concentration in the blood stays high, the same molecules, more of them,
  // still circulating.
  // So they are distributed through the whole column and drift with the flow, more slowly than the ones arriving.
  // The load still climbs, because the count still climbs; there is no sediment.
  // Positions are deterministic per index, a hash of `i` rather than Math.random, so a molecule keeps its lane
  // between frames instead of teleporting when the count changes.
  const heldN = Math.min(22, Math.round((build + extra.current) * 18 * (1 - draining * 0.78)));
  const held = Array.from({ length: heldN }, (_, i) => {
    const lane = ((i * 67) % 100) / 100;
    const drift = (((ph * 0.045 + ((i * 37) % 100) / 100) % 1) + 1) % 1;
    const wobble = Math.sin(ph * 0.5 + i * 1.3) * 9;
    return {
      x: 58 + lane * (W - 130) + wobble,
      y: TOP + 24 + drift * (BOT - TOP - 48),
    };
  });

  // Remember what the reader did, for the closing section. Peak is taken before the turn so the second press
  // cannot lower it, and the final count is whatever is left once the drain has resolved. The store ignores
  // identical values, so writing on every change is cheap.
  const peak = useRef(0);
  if (drain < 0.01 && heldN > peak.current) peak.current = heldN;
  useEffect(() => {
    recordStory({
      standardGiven: extra.current > 0.05 ? true : undefined,
      adjustedGiven: cleared.current > 0.05 ? true : undefined,
      peakHeld: peak.current,
      finalHeld: draining > 0.95 ? heldN : undefined,
    });
  }, [heldN, draining]);

  const COPY = [
    { on: lineA, text: <>Look closer.</> },
    {
      on: lineB,
      fit: true,
      text: <>So 5-FU exposure can increase.</>,
    },
    { on: lineC, text: <>What if we knew first?</> },
    {
      on: lineD,
      fit: true,
      text: <>A more informed starting dose.</>,
    },
  ];

  return (
    <section
      id="why"
      ref={ref}
      style={{ height: `${WHY_TRAVEL + 100}vh`, marginTop: "-100vh" }}
      className="relative"
    >
      {/* --fig3 exists because the figure used to be hidden md:block, which quietly broke the story on phones: this
          scene's premise is that we are inside the body of the man the reader watched accumulate the drug. Without
          him, a mobile reader gets a tube floating on a colour. The composition may simplify on a small screen; the
          character and the causal link may not disappear. */}
      <div
        // --floor is where the figure and the vessel stand: above the control and above the key that explains the
        // drawing. A short window gets a shorter vessel, because the headline over it and the key under it do not
        // shrink.
        className="sticky top-0 h-screen overflow-hidden [--fig3:26vh] [--vessel:34vh] [--floor:calc(3vh+128px)] max-md:[@media(max-height:700px)]:[--fig3:20vh] max-md:[@media(max-height:700px)]:[--vessel:22vh] md:[--fig3:46vh] md:[--vessel:min(54vh,520px)] md:[--floor:calc(3vh+100px)] lg:[@media(max-height:700px)]:[--fig3:34vh] lg:[@media(max-height:700px)]:[--vessel:40vh]"
        style={{ opacity: 1 - q(exit), visibility: exit > 0.99 ? "hidden" : "visible" }}
      >
        {/* The chapter label lives in the story rail now — see StoryProgress. */}

        {COPY.map((b, i) => (
          <div key={i} className={L.headline} style={{ opacity: q(b.on.o) }}>
            <p
              className={`text-center font-black ${L.headlineWidth}`}
              style={{
                ...T.headline,
                // The longer lines are sized to fit the width a headline is allowed on one line. At the full
                // headline size the last one wrapped on a short laptop window and came down onto the result card.
                ...("fit" in b
                  ? { fontSize: "clamp(1.75rem, min(4.8vw, (100vw - 34rem) / 16.8), 3.8rem)" }
                  : null),
                color: C.ink,
                transform: `translateY(${b.on.y.toFixed(1)}px)`,
              }}
            >
              {b.text}
            </p>
          </div>
        ))}

        {/* The figure and the magnified vessel, side by side. Without him this was a tube floating on a colour and
            the reader had no reason to believe it was anyone's bloodstream. */}
        <div
          // Mirrored: the vessel on the left, the man on the right. Two faults had one cause. The cannula was on his
          // right arm here and on his left in the scene before, since his stand was on his left, and the pair sat with all
          // its weight on the left of the frame with nothing in the right third. Flipping the row puts the cannula back on
          // the arm the reader just watched it go into, brings the tube in from the side his stand was on, sends the
          // guides a short way left to the vessel instead of across his body, and hands the right third to the man and
          // the card.
          className="absolute inset-x-0 flex flex-row-reverse items-end justify-center gap-[2vw] md:gap-[4vw]"
          style={{
            bottom: "var(--floor)",
            opacity: q(enter * aside),
            transform: `translateY(${((1 - enter) * 30).toFixed(1)}px)`,
          }}
        >
          <div
            className="relative block shrink-0"
            style={{
              height: "var(--fig3)",
              // The same settle-and-tilt scene two uses, on the whole block so the cannula and guides move with the
              // wrist they are drawn on.
              // a share of his own height, as in the scene before, so a small figure does not sink further
              transform: `translateY(${(load * 1.5).toFixed(2)}%) rotate(${(load * 1.1).toFixed(2)}deg)`,
              transformOrigin: "50% 100%",
              transition: "transform 180ms ease-out",
            }}
          >
            {/* The drip line, behind him. It used to be drawn over the figure, sweeping in from off the top-left corner
                and across his chest to the wrist, with a second purple stroke down the forearm to suggest the vein. The
                client's reading was exact: two lines, one of them going nowhere. A stroke laid over a raster figure does
                not read as anatomy, it reads as a stroke.
                The tube now hangs from above, just left of him, and passes behind the body, since this svg sits before the
                img in the DOM: visible where it descends, hidden behind the torso, and the cannula on the wrist is where it
                arrives. That is how an IV line looks on a person.
                DOM order is not enough. This svg is absolutely positioned and the img is static, and a positioned box
                paints above every static sibling whatever the source order says, so on the first pass the tube was still
                drawn across his shirt. The three layers carry explicit z-indexes: tube 0, figure 1, cannula and guides 2. */}
            <svg
              viewBox="0 0 415 1415"
              className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible"
              aria-hidden="true"
            >
              <path
                d="M-70 -160 C -70 340, 0 560, 39 736"
                fill="none"
                stroke={`${C.ink}66`}
                strokeWidth="9"
                strokeLinecap="round"
              />
            </svg>
            <img
              src={asset("patient-b.webp")}
              alt=""
              draggable={false}
              className="relative z-[1] h-full w-auto select-none"
            />
            {carried > 0.004 && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-[1]"
                style={{
                  maskImage: `url(${asset("patient-b.webp")})`,
                  WebkitMaskImage: `url(${asset("patient-b.webp")})`,
                  maskSize: "100% 100%",
                  WebkitMaskSize: "100% 100%",
                  maskRepeat: "no-repeat",
                  WebkitMaskRepeat: "no-repeat",
                  background: `linear-gradient(to top, ${bodyTint} 0%, ${bodyTint} ${(carried * 100).toFixed(1)}%, transparent ${Math.min(100, carried * 100 + 18).toFixed(1)}%)`,
                  opacity: q(0.3 + load * 0.14),
                  mixBlendMode: "multiply",
                  transition: "opacity 180ms ease-out",
                }}
              />
            )}
            {/* The entry point, and there is no lens. There was a dashed circle here, moved twice trying to get it onto
                the arm. It was on the arm, centred at x=373 with the near arm at that height measuring 358 to 399: the
                circle was simply too big. At r=104 on a 415-wide plate it spanned x 269 to 477, so most of its area lay
                over the torso and the hip. The client read it, twice, as zooming into his pocket.
                No amount of repositioning fixes a marker wider than the thing it marks, so it is gone. The transition
                follows the tube instead: the drip line arrives from the scene before, meets the cannula on the forearm, and
                two guides open from that point out to the magnified vessel.
                The left arm now, the one the drip went into in the scene before. From the plate's alpha channel, in viewBox
                units, it spans x 12 to 70 at 42 to 46% down, and the cannula sits at x 18 to 64, y 628 to 648.
                Anatomy of this plate, from its alpha channel, in viewBox units:
                  38% down   torso and near arm merged   97 to 398
                  42% down   arm separates               341 to 399
                  46% down   forearm, beside the hip     358 to 399
                  56% down   the legs begin to divide
                The cannula sits at y 628 to 648, which is 44 to 46%, the forearm. */}
            <svg
              viewBox="0 0 415 1415"
              className="pointer-events-none absolute inset-0 z-[2] h-full w-full overflow-visible"
              aria-hidden="true"
            >
              {/* On the back of the hand, where the scene before left it: 9.5% across the plate and 52% down. It was on
                  the forearm here, 44 to 46% down, so the same man's line moved between two consecutive scenes. */}
              <rect
                x="20"
                y="722"
                width="38"
                height="28"
                rx="8"
                fill={C.paper}
                stroke={C.ink}
                strokeWidth="8"
              />
              <path d="M33 722 v28 M45 722 v28" stroke={C.ink} strokeWidth="5" />
              {/* The two guides. They start at the cannula, not around it, and open outward to meet the vessel's top and
                  bottom, so the eye is carried from the point of entry to the magnified view along the path the drug takes.
                  Faint and unclosed, because they are a camera move rather than an object in the scene. */}
              <path
                d="M20 728 L -484 300"
                fill="none"
                stroke={C.ink}
                strokeWidth="7"
                strokeDasharray="22 20"
                strokeLinecap="round"
                opacity="0.34"
              />
              <path
                d="M20 744 L -484 1120"
                fill="none"
                stroke={C.ink}
                strokeWidth="7"
                strokeDasharray="22 20"
                strokeLinecap="round"
                opacity="0.34"
              />
            </svg>
          </div>

          <div className="relative w-fit shrink-0" style={{ height: "var(--vessel)" }}>
            <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-auto select-none" aria-hidden="true">
              <VesselShell id="wy" lit={hot || hot2} flow={flow} phase={ph} />

              {/* The enzyme: five places, two filled, and it never changes. This was one large shape filled to a horizontal
                  line and the client read it as a bowl. Two attempts at a more protein-like outline did not fix that, because
                  the outline was never the problem: a shape filled to a flat top edge is how liquid in a container is drawn,
                  whatever silhouette you put around it.
                  So the quantity is carried by count, which cannot read as a fill level, and it is the grammar scene two
                  already uses for the same fact. The two scenes now state "reduced, not absent" the same way.
                  Each glyph is the same globular protein with a cleft on its right; the two that exist are solid and the
                  three that are not made are dashed. Nothing here changes across the turn: the variant is still there
                  afterwards and DPD is still reduced. The payoff belongs to the molecules, not to the enzyme. */}
              <g opacity={q(gap) * 0.95}>
                {[0, 1, 2, 3, 4].map((i) => {
                  const made = i < 2;
                  // Bigger, and actually centred. At scale 0.66 with a 52 pitch the row spanned x 84.6 to 327.6 against a lumen
                  // of 32 to 328, centred on 206 where the vessel centres on 180, so it sat 26 units right and the fifth glyph
                  // touched the wall while the first left a 50-unit margin.
                  // Derived rather than nudged: a glyph occupies [13s, 66s] from its translate point, so at s=0.80 it is 42.4
                  // wide, and five at a 55 pitch span 262.4, which centres on 180 by starting the drawn edge at 48.8, leaving
                  // 16.8 units of margin at both walls. Vertically it centres on EY the same way.
                  // Size matters beyond composition here: this row is the thing the reader has to see not changing across the
                  // turn, and it was small enough to be lost behind the drug molecules drifting over it.
                  const s = 0.8;
                  const x = 38.4 + i * 55;
                  return (
                    <g
                      key={i}
                      transform={`translate(${x} ${(EY - 41.5 * s).toFixed(1)}) scale(${s})`}
                    >
                      <path
                        d={ENZYME}
                        fill={made ? C.green : "none"}
                        fillOpacity={made ? 0.9 : 0}
                        stroke={C.ink}
                        strokeWidth={made ? 3.4 : 3}
                        strokeDasharray={made ? undefined : "7 7"}
                        strokeLinejoin="round"
                        opacity={made ? 1 : 0.45}
                      />
                    </g>
                  );
                })}
              </g>

              {/* The causal line: the variant the reader pulled out of the helix in stop one returns, drops a hairline down
                  the frame, and lands on the shortfall between the dashed outline and the green.
                  It retires at the turn, and not because the shortfall goes away, since the enzyme below is deliberately
                  drawn the same before and after. It is that the letter stops being an unexplained thing in the blood: at the
                  turn it moves into the report card, where it is a known result that a dose was chosen from. */}
              <path
                d={`M${W / 2} 76 L ${W / 2} ${EY - 30}`}
                fill="none"
                stroke={C.red}
                strokeWidth="2.5"
                strokeLinecap="round"
                pathLength="1"
                strokeDasharray="1"
                strokeDashoffset={1 - q(link)}
                opacity={q(link) * (1 - q(handover))}
              />

              {/* the drug */}
              {flow > 0.01 &&
                Array.from({ length: Math.max(4, Math.round(IN_FLIGHT - trim * 5)) }, (_, i) => {
                  const s = (((ph * 0.14 + i / IN_FLIGHT) % 1) + 1) % 1;
                  // One in four is cleared under a standard dose: the enzyme is reduced, not absent. Once the dose is adjusted
                  // all of them are, not because there is more enzyme but because there is less drug for the same enzyme.
                  const cleared = adjusted > 0.5 || i % CLEARED_EVERY === 0;
                  const x = W / 2 + Math.sin(s * 8 + i * 1.7) * 96;

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
                  // An uncleared molecule runs the full length of the vessel and carries on out of frame. It used to stop short
                  // at the top of a pile on the floor, which is what made the drug look like sediment. Nothing settles.
                  const endY = cleared ? EY : BOT;
                  const y = TOP + s * (endY - TOP);
                  return <Hex key={i} x={x} y={y} r={12} tone={drugTone} o={flow} />;
                })}

              {/* What has not been cleared, held in suspension across the whole column rather than stacked on the floor.
                  See `held` above. */}
              {held.map((m, i) => (
                <Hex key={`h${i}`} x={m.x} y={m.y} r={12} tone={drugTone} o={0.92} />
              ))}
              <g
                transform={`translate(${W / 2 - 20} ${34 - (1 - q(link)) * 12})`}
                opacity={q(link) * (1 - q(handover))}
              >
                {/* 40 by 42 with a 26-unit letter. At 30 by 32 the letter measured 7.5 to 10px on a phone. */}
                <rect width="40" height="42" rx="7" fill={C.red} stroke={C.ink} strokeWidth="2.5" />
                <text
                  x="20"
                  y="30.5"
                  textAnchor="middle"
                  fill="#fff"
                  style={{ font: `800 26px ${BODY}` }}
                >
                  A
                </text>
              </g>
            </svg>

            {/* Annotations. The drug label arrives with the first molecules and retires before a single one has settled:
                the client's requirement was that the viewer must know what these are before the accumulation begins,
                because otherwise the pile is just red shapes. The other two answer both halves of her question about the A,
                not only why a letter appeared but how it is causing what happens below. */}
            <Tag
              on={drugLabel}
              x={0.3}
              y={20}
              narrowY={-13}
              title="5-FU"
              sub="the chemotherapy drug"
              tone={C.coral}
            />
            {/* "reduced activity", and no "here". It read "less is made here" with its leader ending in open blood,
                which says DPD is made in the bloodstream. Where it does act is in the note under the vessel. */}
            <Tag
              on={enzymeLabel}
              x={0.09}
              y={52.3}
              narrowY={64}
              title="DPD enzyme"
              sub="activity can be reduced"
              tone={C.green}
            />
            <Tag
              on={variantLabel}
              x={0.44}
              y={9.6}
              narrowY={-13}
              title="DPYD variant"
              sub="c.1905+1G>A"
              tone={C.red}
            />
          </div>
        </div>

        {/* What the drawing is, for as long as it is on screen. The dashed enzymes had no key in this scene and the
            scene had no disclaimer at all, though it is the one where the reader gives a dose.
            The second sentence answers the science review: DPD is drawn beside the blood it clears 5-FU from, but
            it does not act there, and the old label said outright that it was made there. */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-[calc(3vh+50px)] z-10 flex flex-col items-center gap-1 px-5 text-center"
          style={{ opacity: q(enter * aside) }}
        >
          <p
            className="flex w-fit flex-wrap items-center justify-center gap-x-3 gap-y-0.5 rounded px-2.5 py-0.5 text-[12px] font-semibold md:gap-x-4 md:text-[13px]"
            style={{ color: C.ink, background: NOTE_GROUND, opacity: q(gap) }}
          >
            <span className="font-black">DPD enzyme</span>
            <span className="flex items-center gap-1.5">
              <Slot made={1} small /> functional
            </span>
            <span className="flex items-center gap-1.5">
              <Slot made={0} small /> may not be produced
            </span>
          </p>
          <p
            // On a ground of its own. It carries the science review's correction about where DPD acts, and bare, on
            // the dark pink the scene opens on, it measured 3.8:1.
            className="w-fit max-w-[62ch] rounded px-2.5 py-0.5 text-[12px] leading-snug md:text-[13px]"
            style={{ color: C.ink, background: NOTE_GROUND }}
          >
            Illustrative simulation, not a clinical prediction. DPD acts inside cells, particularly
            in the liver. {WIKI.aiImageCredit}.
          </p>
        </div>

        {/* ChemoGuard, once, at the turn. Three steps and no more: what goes in, what is looked for, what the answer
            is for. They carry numbers and not pictures on purpose. The team has not yet published the sample it
            takes, the method it uses or what its readout looks like, and a drawing of a tube or a strip would be
            a claim about one of them. The last step is in the science review's words: a result informs a
            clinical decision, it does not make one. */}
        {moment > 0.004 && (
          <div
            className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center px-5 pt-[68px]"
            style={{ opacity: q(easeOut(moment)) }}
          >
            <div
              // Sized as a card in the scene, not a second hero: at 900px wide with a full-size headline it filled the frame
              // and its corner reached the chapter label.
              className="w-full max-w-[720px] px-5 py-5 text-center md:px-9 md:py-8"
              style={{
                background: C.paper,
                border: `1.5px solid ${C.ink}33`,
                borderRadius: 10,
                transform: `translateY(${((1 - easeOut(moment)) * 18).toFixed(1)}px)`,
              }}
            >
              <p
                className="text-[19px] font-black leading-none md:text-[22px]"
                style={{ fontFamily: DISPLAY, letterSpacing: "-0.01em", color: C.ink }}
              >
                Chemo<span style={{ color: C.red }}>Guard</span>
              </p>
              <p className="mt-2.5 font-black md:mt-3" style={{ ...T.sub, color: C.ink }}>
                Know before the first dose.
              </p>
              <ol className="mt-5 flex flex-col items-stretch gap-2 text-left md:mt-7 md:flex-row md:items-stretch md:gap-2.5">
                {["Patient sample", "DPYD testing", "Result informs clinical decision-making"].map(
                  (step, i) => (
                    <li
                      key={step}
                      // the first two are as wide as their words and the third, the long one, takes what is left: at equal
                      // shares it wrapped to four lines
                      className={`flex flex-col gap-2 md:flex-row md:items-center md:gap-2.5 ${i === 2 ? "md:flex-1" : "md:flex-none md:whitespace-nowrap"}`}
                    >
                      {i > 0 && (
                        // an arrow drawn here, because neither bundled typeface has one
                        <svg
                          viewBox="0 0 34 14"
                          className="h-3 w-7 shrink-0 rotate-90 self-center md:h-3.5 md:w-8 md:rotate-0"
                          aria-hidden="true"
                          fill="none"
                          stroke={C.ink}
                          strokeWidth="2.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M2 7H31M25 2l6 5-6 5" />
                        </svg>
                      )}
                      <span
                        className="flex flex-1 items-center gap-2.5 rounded-[6px] px-3 py-2.5 md:px-3.5 md:py-3"
                        style={{ background: `${C.lavender}26` }}
                      >
                        <span
                          className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[13px] font-bold leading-none"
                          style={{ background: C.ink, color: C.paper }}
                        >
                          {i + 1}
                        </span>
                        <span className="text-[14px] font-bold leading-snug md:text-[15px]">
                          {step}
                        </span>
                      </span>
                    </li>
                  ),
                )}
              </ol>
              <p
                className="mt-4 text-[12px] leading-snug md:mt-5 md:text-[13px]"
                style={{ color: C.inkBody }}
              >
                A conceptual overview: where the test sits, not how it works.
              </p>
            </div>
          </div>
        )}

        {/* The result, and the dose that follows from it. It arrives at the turn and stays for the rest of the scene,
            so the reader can see why the pile below is draining. Drawn only in vocabulary already owned: the red A
            badge from the descent, and the drug molecules from this same vessel. The dose is something you can see,
            nine with four kept and five fading, so "reduced" is a picture rather than a word. It is a schematic count,
            not a dose: the label says the reduction follows clinical guidelines, because the client's review is
            explicit that the test informs a dose and does not set one. */}
        {/* On a wide screen the card sits in the left third, beside the figure. Centred at the top it collided with
            the headline above it and the vessel's badge below it while the left and right thirds sat empty: overlapping
            content and leaving a hole at once. Below md there is one column, so it stays above the scene. */}
        <div
          // On a phone this sits below the headline, and the floor is in pixels for the same reason the headline's is:
          // 23vh was 170px on a 740px phone, and once the headline gained its own floor at 140px its two wrapped lines ran
          // to about 236px, so the card and the headline measured 100% overlap at 320 and 360. 248px clears the deepest
          // wrap. On md and up the card moves out of the centre column entirely.
          className="pointer-events-none absolute inset-x-0 top-[max(214px,27vh)] z-20 flex justify-center px-6 md:inset-x-auto md:right-[3vw] md:top-[max(212px,26vh)] md:block md:px-0 lg:right-[6vw]"
          style={{ opacity: q(easeOut(result)) }}
        >
          <div
            className="rounded-[10px] px-4 py-3 md:max-w-[330px] md:px-5 md:py-4"
            style={{
              background: C.paper,
              // a hairline and no offset shadow: this is a result to read, not a thing to press
              border: `1.5px solid ${C.ink}47`,
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
                  style={{ font: `800 17px ${BODY}` }}
                >
                  A
                </text>
              </svg>
              <span>
                <span
                  className="block text-[14px] font-black leading-none"
                  style={{ color: C.ink }}
                >
                  Variant found before treatment
                </span>
                <span
                  className="mt-1 block text-[13px] font-semibold leading-snug"
                  style={{ color: C.inkBody }}
                >
                  reduced DPD activity expected
                </span>
              </span>
            </div>

            <div className="mt-3 flex items-center gap-1.5 max-md:[@media(max-height:700px)]:hidden md:mt-4 md:gap-[7px]">
              {Array.from({ length: 9 }, (_, i) => {
                const dropped = i >= 4;
                const gone = dropped
                  ? easeOut(range(trim, (i - 4) * 0.12, (i - 4) * 0.12 + 0.4))
                  : 0;
                return (
                  <svg
                    key={i}
                    viewBox="0 0 26 26"
                    className="h-3.5 w-3.5 md:h-4 md:w-4"
                    aria-hidden="true"
                  >
                    <g opacity={1 - gone * 0.86}>
                      <Hex x={13} y={13} r={11} tone={C.coral} />
                    </g>
                  </svg>
                );
              })}
            </div>
            {/* What the result is for, in the science review's words: it can inform a dose under guidelines, it
                does not set one. The source for that is on the Description page, where the wiki's references
                are, so the claim is one click from its evidence. */}
            <span
              className="mt-2.5 block text-[12.5px] font-semibold leading-snug md:text-[13px]"
              style={{ color: C.ink, opacity: q(easeOut(trim)) }}
            >
              The result can inform dose adjustment under clinical guidelines.{" "}
              <Link
                to="/description"
                hash="testing"
                className="pointer-events-auto underline underline-offset-2"
              >
                Sources
              </Link>
            </span>
            {/* The enzyme row beside this card is the same before and after, and nothing on screen used to say
                so, which left room to read the clearing vessel as the enzyme recovering. */}
            <span
              className="mt-1.5 block text-[12.5px] leading-snug md:text-[13px]"
              style={{ color: C.inkBody, opacity: q(easeOut(trim)) }}
            >
              DPD activity itself does not change. Illustrative count, not a dose.
            </span>
          </div>
        </div>

        {/* The control. This used to be a line of small caps saying "hold to keep the standard dose running", with
            the whole SVG as an invisible hit target: the client liked the idea but could not tell what she was supposed
            to hold. It is a button now, in the same paper, ink and offset language as every other pressable thing, and
            it fills while held so the reader can see their own input doing something. */}
        <div
          className="absolute inset-x-0 bottom-[3vh] z-20 flex justify-center px-6"
          // the hold belongs to act one; once the test arrives it is not the reader's dose to give any more
          style={{
            opacity: q(easeOut(flow)) * (1 - q(range(p, v(322), v(344)))),
            // A control at opacity 0 still takes the pointer. Off means off.
            pointerEvents:
              q(easeOut(flow)) * (1 - q(range(p, v(322), v(344)))) > 0.3 ? "auto" : "none",
          }}
        >
          <span className="relative inline-flex">
            <button
              type="button"
              className="relative select-none overflow-hidden rounded-full px-5 py-2.5 text-[13px] font-bold tracking-[0.04em] transition-transform active:translate-y-px md:text-[14px]"
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
              // Keyboard: hold Space or Enter. Without this the control could be focused and not operated, which is worse
              // than not being focusable at all.
              onKeyDown={(e) => {
                if ((e.key === " " || e.key === "Enter") && !e.repeat) {
                  e.preventDefault();
                  setHot(true);
                }
              }}
              onKeyUp={(e) => {
                if (e.key === " " || e.key === "Enter") setHot(false);
              }}
              onBlur={() => setHot(false)}
            >
              {/* A hairline along the base, not a wash across the face. Filling the whole button turned it into a loading
                  bar, a progress toy rather than a control. This says the same thing and stays out of the way. */}
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-[3px]"
                style={{
                  transform: `scaleX(${Math.min(1, extra.current / 0.4).toFixed(3)})`,
                  transformOrigin: "left",
                  // the drug's colour: this bar is the dose going in
                  background: C.coral,
                  transition: "transform 140ms linear",
                }}
              />
              <span className="relative">{hot ? "Dosing…" : "Hold to give the standard dose"}</span>
            </button>
          </span>
        </div>

        {/* The second control, and the reason the first one exists. The first press was made with nothing to go on:
            the man looked fine, the reader gave the standard dose, and it accumulated. That press was the mistake, and
            it was not the reader's fault, since it is the position a clinician is in without a test. Now the result is
            on screen and the same gesture is offered again.
            It arrives with the result card, which is full at 0.78 and legible by 0.79, and it leaves with the scene. It
            never shares the frame with the first control, which is gone by 0.70. */}
        <div
          className="absolute inset-x-0 bottom-[3vh] z-20 flex justify-center px-6"
          style={{
            opacity: q(easeOut(range(p, v(488), v(516)))),
            pointerEvents: q(easeOut(range(p, v(488), v(516)))) > 0.3 ? "auto" : "none",
          }}
        >
          <span className="relative inline-flex">
            <button
              type="button"
              className="relative select-none overflow-hidden rounded-full px-5 py-2.5 text-[13px] font-bold tracking-[0.04em] transition-transform active:translate-y-px md:text-[14px]"
              style={{
                background: C.paper,
                color: C.ink,
                border: `2.5px solid ${C.ink}`,
                boxShadow: hot2 ? `1px 1px 0 ${C.ink}` : `3px 3px 0 ${C.ink}`,
                touchAction: "none",
              }}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                setHot2(true);
              }}
              onPointerUp={() => setHot2(false)}
              onPointerCancel={() => setHot2(false)}
              onPointerLeave={() => setHot2(false)}
              onKeyDown={(e) => {
                if ((e.key === " " || e.key === "Enter") && !e.repeat) {
                  e.preventDefault();
                  setHot2(true);
                }
              }}
              onKeyUp={(e) => {
                if (e.key === " " || e.key === "Enter") setHot2(false);
              }}
              onBlur={() => setHot2(false)}
            >
              {/* Green, not red: this is the press that clears. */}
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-[3px]"
                style={{
                  transform: `scaleX(${Math.min(1, cleared.current).toFixed(3)})`,
                  transformOrigin: "left",
                  background: C.green,
                  transition: "transform 140ms linear",
                }}
              />
              <span className="relative">
                {hot2 ? "Dosing…" : "Hold to give the adjusted dose"}
              </span>
            </button>
          </span>
        </div>
      </div>
    </section>
  );
}
