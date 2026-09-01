import { useRef, useState } from "react";

import { asset, C, L, T } from "@/components/hero/palette";
import { usePageProgress } from "@/hooks/use-page-progress";
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
 * frame, and lands on the shortfall where a full complement of enzyme should
 * have been. Gene → enzyme → drug, drawn as one line, in one image.
 *
 * ACCURACY, and it is load-bearing rather than a disclaimer: DPYD variants
 * REDUCE enzyme activity, they do not abolish it. Two things encode that here
 * rather than a caption walking it back. One molecule in four is still broken
 * down while the pile is building. And the enzyme is drawn as a LEVEL — a
 * dashed full outline with about two fifths of it filled — which never changes
 * for the whole section, because nothing the reader does changes how much DPD
 * this body makes. Scene two says the same thing with five slots and two
 * filled; the two must agree, and an earlier version of this file did not.
 *
 * An earlier draft said the enzyme "is never built", which was wrong. The
 * version after it filled the shape solid green at the turn, which was wrong in
 * the opposite direction: it told the reader that lowering the dose restored
 * the enzyme.
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
        <span className="block text-[13px] font-black leading-none" style={{ color: C.ink }}>
          {title}
        </span>
        <span className={`mt-0.5 block ${L.sub}`} style={{ color: C.inkNote }}>
          {sub}
        </span>
      </span>
    </div>
  );
}

export function Why() {
  const [ref, p] = useSmoothProgress<HTMLElement>(0.1);
  const pageP = usePageProgress();
  const [hot, setHot] = useState(false);

  /* ---- ONE SCENE, TWO ACTS --------------------------------------------------
     This used to be two sections that crossfaded into each other, and the
     client caught it immediately: they show the SAME picture — the same man,
     the same lens, the same vessel — so dissolving between them stacked two
     figures and two headlines through each other for a whole screen of scroll.

     Nothing about the picture should change at the turn. What changes is its
     STATE. The drug piles up under a standard dose; then the variant is known,
     the dose comes down, the pile drains away and the enzyme fills in. One
     vessel, one figure, one continuous scroll — the story turns, the scene
     does not restart. It is also the client's own note about scenes
     transforming into each other rather than being swapped.               */

  /* act one — what a standard dose does */
  const enter = easeOut(range(p, 0.01, 0.06));
  const lineA = beat(p, 0.03, 0.09, 0.19, 0.25);
  const flow = band(p, 0.1, 0.16, 0.97, 0.995);
  const drugLabel = band(p, 0.13, 0.19, 0.28, 0.33);
  const gap = range(p, 0.24, 0.32);
  const link = range(p, 0.3, 0.4);
  const variantLabel = band(p, 0.32, 0.38, 0.44, 0.49);
  const build = range(p, 0.38, 0.56);
  const alarm = range(p, 0.44, 0.58);
  const enzymeLabel = band(p, 0.46, 0.52, 0.57, 0.62);
  /*
    lineB's exit and lineC's entrance MUST NOT overlap, and getting that right
    is not as simple as making the windows not touch.

    `beat` eases the entrance but leaves the exit linear — deliberately, so copy
    arrives fast and leaves gently. The consequence is that the two ramps are
    not symmetric: an entrance is already at 0.88 a third of the way through,
    while an exit is still at 0.55 at the same fraction. With the old windows
    (out 0.67→0.72, in 0.68→0.74) both lines sat above half opacity between
    p 0.6909 and 0.6975 — two headlines dissolving through each other at the
    same coordinates, at the turn.

    The audit's collision check found it, but only sometimes: the window is
    0.0066 of local progress and the check samples 60 scroll positions, so it
    landed inside about one run in five. It passed twice before it failed.

    These windows leave a gap of 0.031 between lineB dropping below 0.45 and
    lineC reaching it. Recompute both crossings if either window moves.
  */
  const lineB = beat(p, 0.56, 0.62, 0.655, 0.7);

  /* the turn — and everything after it undoes what act one built */
  const lineC = beat(p, 0.7, 0.76, 0.8, 0.85);
  const result = band(p, 0.72, 0.78, 0.97, 0.995);
  /** 9 molecules of standard dose come down to 4. */
  const trim = range(p, 0.76, 0.85);
  /** What had accumulated drains away — the payoff of the whole section. */
  const drain = range(p, 0.79, 0.89);
  /**
   * The dose comes down to meet the enzyme this person actually has.
   *
   * This used to be called `heal`, and it filled the enzyme shape in solid —
   * which told the reader that reducing the dose RESTORED enzyme activity. It
   * does not. A DPYD variant carrier makes less DPD before the test and exactly
   * the same amount after it; the only thing that changes is how much drug
   * arrives. Scene two already draws this correctly — five slots, two filled —
   * so scene three was contradicting it two screens later.
   *
   * Nothing about the enzyme moves on this beat now. What moves is the load.
   */
  const matched = range(p, 0.81, 0.9);
  /*
    "A dose that fits." — and it LEAVES, which it did not before.

    Two separate faults were fixed here, and the second was caused by the first.

    1. Its out-window was 1.2 → 1.3, past anything progress can reach, so it
       never retired. At the end of the page it scrolled up under the story rail
       still at full opacity: 64% over "05 · Before the first dose" on a 430px
       phone, 65% measured while actually wheel-scrolling at 1024.

    2. Moving it earlier to make room for the scene's exit put it INSIDE lineC's
       departure — the same mistake, and the same rule, as lineB/lineC above.
       lineC clears 12% opacity at 0.844; at an entrance of 0.82 this crossed it
       at 0.822, and "What if we knew first?" sat under "A dose that fits." at up
       to 65%. Entering at 0.86 crosses at 0.862, a clear 0.018 after lineC has
       gone.

    Full by roughly 0.88, which leaves a hold of about 45vh before the stage
    begins to fade at local 0.933.
  */
  const lineD = beat(p, 0.86, 0.91, 0.96, 0.99);
  /**
   * The scene leaves as a whole — driven by REAL SCROLL, not by the spring.
   *
   * The other two stops dissolve into the one after them; this is the last, so
   * it had no exit at all and simply scrolled out from under the rail with
   * every element at full opacity. At the end of the page that put the result
   * card over "05 · Before the first dose" at 65%.
   *
   * The first attempt used the section's own `p`, and it did not work. `p` is
   * spring-smoothed: it LAGS a real scroll by a fair fraction of a second, so
   * by the time it reached the fade window the stage had already unpinned and
   * travelled up under the rail. Measured with a continuous wheel rather than a
   * jump, the overlap was still 65%.
   *
   * `usePageProgress` reads the document position directly, so the fade happens
   * where the reader actually is. Anything anchored to the moment a section
   * leaves the viewport belongs on page progress, not on section progress.
   */
  const exit = range(pageP, 0.955, 0.99);
  /** The in-vessel letter hands over to the report card at the turn. */
  const handover = range(p, 0.74, 0.82);

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

  // Red while it is accumulating; back to coral once it is clearing again.
  const drugTone = alarm > 0.5 && drain < 0.5 ? C.red : C.coral;

  /*
    WHAT DOES NOT GET CLEARED — SUSPENDED, NOT SETTLED.

    These used to stack in rows on the floor of the vessel, and the client read
    exactly what that draws: a drug that physically sinks. It does not. What
    happens when DPD activity is reduced is that the CONCENTRATION in the blood
    stays high — the same molecules, more of them, still circulating.

    So they are distributed through the whole column now and they drift with the
    flow, at a slower rate than the ones arriving. The reader still sees the
    load climb, because the count still climbs; they no longer see sediment.

    Positions are deterministic per index — a hash of `i`, not Math.random — so
    a molecule keeps its lane between frames instead of teleporting when the
    count changes.
  */
  /*
    A RESIDUAL SURVIVES THE TURN — about a fifth, not none.

    `1 - drain` emptied the vessel completely, which draws "no drug". The
    treatment does not stop when the dose is matched; it is still 5-FU, still
    circulating, just at an exposure the person's own DPD can keep up with. So
    the drain takes 78% and leaves the rest, and the tone returns to coral
    rather than red — lower concentration, not absence.
  */
  const heldN = Math.min(22, Math.round((build + extra.current) * 18 * (1 - drain * 0.78)));
  const held = Array.from({ length: heldN }, (_, i) => {
    const lane = ((i * 67) % 100) / 100;
    const drift = (((ph * 0.045 + ((i * 37) % 100) / 100) % 1) + 1) % 1;
    const wobble = Math.sin(ph * 0.5 + i * 1.3) * 9;
    return {
      x: 58 + lane * (W - 130) + wobble,
      y: TOP + 24 + drift * (BOT - TOP - 48),
    };
  });

  const COPY = [
    { on: lineA, text: <>Look closer.</> },
    {
      on: lineB,
      text: (
        <>
          So the drug <span style={{ color: C.red }}>stays.</span>
        </>
      ),
    },
    { on: lineC, text: <>What if we knew first?</> },
    {
      on: lineD,
      text: (
        <>
          A dose that <span style={{ color: C.redDeep }}>fits.</span>
        </>
      ),
    },
  ];

  return (
    <section
      id="why"
      ref={ref}
      style={{ height: "860vh", marginTop: "-100vh" }}
      className="relative"
    >
      {/*
        --fig3 exists because the figure USED TO BE `hidden md:block`, and that
        quietly broke the story on phones: this scene's whole premise is that we
        are inside the body of the man the reader watched accumulate the drug in
        the previous scene. Without him, a mobile reader gets a tube floating on
        a colour — a generic biology lesson, which is the one thing this scene
        was rebuilt to stop being. The composition may simplify on a small
        screen; the character and the causal link may not disappear.
      */}
      <div
        className="sticky top-0 h-screen overflow-hidden [--fig3:27vh] [--vessel:38vh] md:[--fig3:46vh] md:[--vessel:min(56vh,520px)]"
        style={{ opacity: 1 - q(exit), visibility: exit > 0.99 ? "hidden" : "visible" }}
      >
        {/* The chapter label lives in the story rail now — see StoryProgress. */}

        {COPY.map((b, i) => (
          <div key={i} className={L.headline} style={{ opacity: q(b.on.o) }}>
            <p
              className={`text-center font-black ${L.headlineWidth}`}
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
          className="absolute inset-x-0 flex items-end justify-center gap-[2vw] md:gap-[4vw]"
          style={{
            bottom: "8vh",
            opacity: q(enter),
            transform: `translateY(${((1 - enter) * 30).toFixed(1)}px)`,
          }}
        >
          <div className="relative block shrink-0" style={{ height: "var(--fig3)" }}>
            <img
              src={asset("patient-b.webp")}
              alt=""
              draggable={false}
              className="h-full w-auto select-none"
            />
            {/*
              THE ENTRY POINT — AND THERE IS NO LENS.

              There was a dashed circle here, and it was moved twice trying to
              get it onto the arm. It was on the arm: centred at x=373, and the
              near arm at that height measures 358–399. The circle was simply
              TOO BIG. At r=104 on a 415-wide plate it spanned x 269–477, so
              most of its area lay over the torso and the hip and the rest hung
              off the edge of the figure. The client read it, twice, as zooming
              into his pocket — and she was right both times.

              No amount of repositioning fixes a marker wider than the thing it
              marks, so it is gone. The transition now follows the tube, which
              is what it should always have done: the drip line arrives from the
              scene before, meets the cannula on the forearm, and two guides
              open from that exact point out to the magnified vessel. Same
              grammar as any anatomical inset — the "this, enlarged" is carried
              by the guides rather than by a ring drawn over a hip.

              Anatomy of this plate, from its alpha channel, in viewBox units:
                38% down   torso and near arm merged   97–398
                42% down   arm separates               341–399
                46% down   forearm, beside the hip     358–399
                56% down   the legs begin to divide
              The cannula sits at y 628–648, which is 44–46% — the forearm.
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
              {/*
                The two guides. They start at the cannula — not around it — and
                open outward to meet the vessel's top and bottom, so the eye is
                carried from the point of entry to the magnified view along the
                same path the drug takes. Drawn faintly and unclosed, because
                they are a camera move, not an object in the scene.
              */}
              <path
                d="M398 632 L 900 300"
                fill="none"
                stroke={C.ink}
                strokeWidth="7"
                strokeDasharray="22 20"
                strokeLinecap="round"
                opacity="0.34"
              />
              <path
                d="M398 646 L 900 1120"
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
              <VesselShell id="wy" lit={hot} flow={flow} phase={ph} />

              {/*
                THE ENZYME — FIVE PLACES, TWO FILLED. AND IT NEVER CHANGES.

                This was one large shape filled to a horizontal line, and the
                client read it as a bowl. Two attempts at a more protein-like
                OUTLINE did not fix that, because the outline was never the
                problem: a shape filled to a flat top edge is exactly how liquid
                in a container is drawn, whatever silhouette you put around it.

                So the quantity is carried by COUNT instead, which cannot read
                as a fill level — and it is the grammar scene two already uses
                for the same fact, five slots with two filled. The two scenes
                now state "reduced, not absent" the same way, which is what
                makes them agree rather than merely not contradict.

                Each glyph is the same globular protein with a cleft on its
                right; the two that exist are solid, the three that are not made
                are dashed outlines. NOTHING HERE CHANGES ACROSS THE TURN. The
                variant is still there afterwards and DPD is still reduced; what
                changes is how much drug arrives. The payoff belongs to the
                molecules, not to the enzyme.
              */}
              <g opacity={q(gap) * 0.95}>
                {[0, 1, 2, 3, 4].map((i) => {
                  const made = i < 2;
                  const x = W / 2 - 104 + i * 52;
                  return (
                    <g key={i} transform={`translate(${x} ${EY - 26}) scale(0.66)`}>
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

              {/*
                The causal line: the variant the reader pulled out of the helix
                in stop one returns, drops a hairline down the frame, and lands
                on the shortfall between the dashed outline and the green.

                It RETIRES at the turn, and it is worth being exact about why,
                because the reason changed. It is NOT that the shortfall goes
                away — it does not, and the enzyme below is deliberately drawn
                the same before and after. It is that the letter stops being an
                unexplained thing in the blood: at the turn it moves into the
                report card, where it is a known result that a dose was chosen
                from. Same letter, different status.
              */}
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
              <g
                transform={`translate(${W / 2 - 15} ${34 - (1 - q(link)) * 12})`}
                opacity={q(link) * (1 - q(handover))}
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
                Array.from({ length: Math.max(4, Math.round(IN_FLIGHT - trim * 5)) }, (_, i) => {
                  const s = (((ph * 0.14 + i / IN_FLIGHT) % 1) + 1) % 1;
                  /*
                    One in four is cleared under a standard dose — the enzyme is
                    reduced, not absent. Once the dose is matched, all of them
                    are: not because there is more enzyme, but because there is
                    less drug for the same enzyme to get through.
                  */
                  const cleared = matched > 0.5 || i % CLEARED_EVERY === 0;
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
                  /*
                    An uncleared molecule now runs the FULL length of the
                    vessel and carries on out of frame. It used to stop short at
                    the top of a pile on the floor, which is what made the drug
                    look like sediment. Nothing settles; it keeps circulating,
                    and that is the whole point of the beat.
                  */
                  const endY = cleared ? EY : BOT;
                  const y = TOP + s * (endY - TOP);
                  return <Hex key={i} x={x} y={y} r={12} tone={drugTone} o={flow} />;
                })}

              {/*
                What has not been cleared — held in suspension across the whole
                column rather than stacked on the floor. See `held` above.
              */}
              {held.map((m, i) => (
                <Hex key={`h${i}`} x={m.x} y={m.y} r={12} tone={drugTone} o={0.92} />
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
              y={40}
              title="DPD enzyme"
              sub="less is made here"
              tone={C.green}
            />
            <Tag
              on={variantLabel}
              x={57}
              y={2}
              title="DPYD variant"
              sub="c.1905+1G>A"
              tone={C.red}
            />
          </div>
        </div>

        {/*
          THE RESULT, and the dose that follows from it. It arrives at the turn
          and stays for the rest of the scene, so the reader can see WHY the
          pile below it is draining. Drawn only in vocabulary already owned:
          the red A badge from the descent, and the drug molecules from this
          same vessel. The dose is something you can count — nine, four kept,
          five fading — so "reduced" is a quantity, not a word.
        */}
        {/*
          On a wide screen the card sits in the left third, beside the figure.

          Centred at the top it collided with the headline above it and with
          the vessel's own badge below it, while the left and right thirds of
          the frame sat empty — so it was overlapping content AND leaving a
          hole. Below md there is only one column, so it stays above the scene.
        */}
        <div
          /*
            On a phone this sits BELOW the headline, and the floor is in pixels
            for the same reason the headline's is: 23vh was 170px on a 740px
            phone, and once the headline gained its own floor at 140px its two
            wrapped lines ran to about 236px — the card and "What if we knew
            first?" measured 100% overlap at 320 and 360.

            248px clears the headline's deepest wrap. On md and up the card
            moves out of the centre column entirely, so this does not apply.
          */
          className="pointer-events-none absolute inset-x-0 top-[max(248px,33vh)] z-20 flex justify-center px-6 md:inset-x-auto md:left-[3vw] md:top-[184px] md:block md:px-0 lg:left-[6vw]"
          style={{ opacity: q(easeOut(result)) }}
        >
          <div
            className="rounded-xl px-4 py-3 md:max-w-[330px] md:px-5 md:py-4"
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
                  className="block text-[13px] font-black leading-none"
                  style={{ color: C.ink }}
                >
                  Variant found before treatment
                </span>
                <span className={`mt-1 block ${L.sub}`} style={{ color: C.inkNote }}>
                  less DPD expected — so the dose is matched to it
                </span>
              </span>
            </div>

            <div className="mt-3 flex items-center gap-1.5 md:mt-4 md:gap-[7px]">
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
            {/* its own line: beside nine molecules it wrapped to two */}
            <span
              className={`mt-2 block ${L.note}`}
              style={{ color: C.ink, opacity: q(easeOut(trim)) * 0.7 }}
            >
              dose reduced
            </span>
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
          // the hold belongs to act one; once the test arrives it is not the
          // reader's dose to give any more
          style={{ opacity: q(easeOut(flow)) * (1 - q(range(p, 0.64, 0.7))) }}
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
