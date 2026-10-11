import { BASES_ON_FIELD, BODY, C } from "./palette";

// The arrival: the strand resolved into DNA you can read, and the payoff of the whole descent. The hero taught
// the base-pair colours by hover; here those colours become letters and the one that matters changes in front of
// the reader rather than being described to them.
// The letters assemble outward from the variant, not left to right, so the eye is anchored on the base that
// matters before the context arrives around it.
// There is no flanking sequence. This used to show six invented bases on each side: decorative ACGT, not the
// reference sequence, and iGEM's policy is that nothing on a wiki may be fabricated. A judge checking a rendered
// sequence against the reference genome is a realistic thing to happen.
// What is shown instead is verifiable from the variant's own name, and is the part that matters. DPYD
// c.1905+1G>A (rs3918290, the DPYD*2A allele) sits at position +1 of intron 14, immediately after the end of
// exon 14. Positions +1 and +2 of an intron carry the conserved GT of the 5' splice donor site; the variant
// changes that G to an A, so the site reads AT and may no longer be recognised, which can lead to exon 14 being
// skipped. Worded to the client's science review: "may" and "can", never "is skipped".
// So the frame shows the boundary, the two donor letters, and the G becoming an A. The team should still attach
// its own citation before the freeze.
const REF_BASE = "G";
const ALT_BASE = "A";
/** Intron position +2. Canonical donor is GT, so this letter follows. */
const DONOR_SECOND = "T";

// Base to colour, the same mapping the hero's rungs use, in its on-field tint. The four hexes used to be copied
// here by hand from BASES: the rung colours exactly, which is right for a stroke on a white backbone and wrong
// for a 51px letter on bare purple. Imported now, so the two cannot drift apart.
const TONE = BASES_ON_FIELD;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
// How the annotations go as the camera retreats: out by a little under half way, and then not painted at all.
// They used to fade over the whole retreat while the group shrank, so for most of it they were 8 to 11px of text
// at 4 to 9% opacity, which read as something that had failed to clear.
const leave = (far: number) => clamp01(1 - far * 2.3);
/** Fast at first, settling at the end — a camera decelerating, not a linear tween. */
const easeOutCubic = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);

/** The wave's half-period at rest, and at full retreat. Half the period, twice the DNA. */
const WAVE_NEAR = 300;
const WAVE_FAR = 150;
/** Vertical reach of the backbone, in the strand's own units. */
const AMP_NEAR = 90;
const AMP_FAR = 68;
/** The strand's drawing width, in its own units. */
const SPAN = 1200;
const MID = 130;

// One backbone of the strand, generated rather than hardcoded. It used to be two literal `d` strings with the
// period baked in, so the strand could never change shape. It has to: pulling the camera back must fit more of
// the molecule into the same frame, which is a shorter period, not a smaller drawing.
// At half = 300 this reproduces the original path exactly.
const backbone = (half: number, amp: number, startUp: boolean) => {
  let d = `M0 ${MID}`;
  let up = startUp;
  for (let x = 0; x < SPAN - 0.5; x += half) {
    const y = up ? MID - amp : MID + amp;
    const end = Math.min(SPAN, x + half);
    d += ` C ${(x + half / 3).toFixed(1)} ${y.toFixed(1)}, ${(x + (half * 2) / 3).toFixed(1)} ${y.toFixed(1)}, ${end.toFixed(1)} ${MID}`;
    up = !up;
  }
  return d;
};

/**
 * A named region rather than spelled-out bases. "exon 14" is verifiable, six invented letters are not, and
 * this reads as an annotated locus instead of a sequence nobody can check.
 */
function Region({
  label,
  t,
  align,
  far,
}: {
  label: string;
  t: number;
  align: "left" | "right";
  /** 0 to 1: the camera's retreat. The label leaves with it instead of shrinking to a size nobody can read. */
  far: number;
}) {
  return (
    <span
      /* 0.4em, floored at 11px: these are the smallest strings in the scene, and at 0.32em of the old mobile
                 size they rendered under 8px. */
      // The gap is part of the label. At px-1.5 the right-hand label's box began at exactly the T's right edge,
      // 809.4 against 809.4, so an 11px caption abutted a 51px glyph with nothing between them. It went unreported
      // while the label was dimmed to 0.62, below the overlap audit's visibility floor.
      // Fixed, not `em`. These used to be 0.4em of the row's own size, which was fine while that size was capped at
      // 51px and absurd once it was not: at a 90px base they would set at 38px and compete with the letters they
      // annotate. The letters are the subject and these are chrome.
      className="mx-3 text-[13px] font-bold uppercase md:mx-5 md:text-[15px] lg:text-[18px]"
      style={{
        fontFamily: BODY,
        color: C.paper,
        // Full strength while the camera is close. These name the exon/intron boundary, the mechanism the frame
        // exists to show. During the retreat the whole group scales down and they measured 9px on a desktop and
        // 6px on a phone, so they go rather than stay as specks.
        opacity: t * leave(far),
        visibility: leave(far) < 0.05 ? "hidden" : "visible",
        letterSpacing: "0.1em",
        // They arrive from outside, not from on top of the letters. The offsets used to be +14 for the left label and
        // -14 for the right, which pointed both inward: each began its entrance overlapping the glyph it labels, and at
        // page 0.125 "intron 14" sat 3.2px inside the T. Reversed, the pair opens outward as the sequence assembles.
        transform: `translateX(${((1 - t) * (align === "right" ? -14 : 14)).toFixed(1)}px)`,
        display: "inline-block",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

// The strand this is a piece of, running behind the letters. Without it the arrival was four glyphs alone in a
// very large purple field, the client's own example of a screen that felt empty. It is also the honest picture:
// we have descended into the strand, so the strand should still be there, too magnified to read except at the
// point of interest. It fades toward the centre so the letters sit in a clear window.
function Strand({ far, t }: { far: number; t: number }) {
  // The pull-back, drawn rather than tweened. Retreating from a molecule means more of it fits in the frame, so
  // the half-period shortens from 300 units to 150 and the rungs halve their spacing: the same window holds twice
  // as much DNA. The picture performs "about three billion letters" at the moment the statement says it.
  // Meanwhile the contrast drops, which is what stops the strand competing with the statement in front of it.
  const half = WAVE_NEAR - far * (WAVE_NEAR - WAVE_FAR);
  const amp = AMP_NEAR - far * (AMP_NEAR - AMP_FAR);
  const spacing = half / 10;
  const rungs = Math.round(SPAN / spacing);
  // The clear window the letters sit in closes as they recede into it: at rest the middle third is masked away so
  // nothing crosses the glyphs, and by full retreat the strand runs almost unbroken.
  const s1 = 0.2 - far * 0.12;
  const s2 = 0.38 + far * 0.09;
  const s3 = 0.62 - far * 0.09;
  const s4 = 0.8 + far * 0.12;
  return (
    <svg
      viewBox={`0 0 ${SPAN} 260`}
      className="pointer-events-none absolute left-1/2 top-1/2 w-[128vw] max-w-none -translate-x-1/2 -translate-y-1/2"
      aria-hidden="true"
      style={{ opacity: t * (0.5 - far * 0.17) }}
    >
      <defs>
        <linearGradient id="sq-fade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset={s1.toFixed(3)} stopColor="#fff" stopOpacity="0.85" />
          <stop offset={s2.toFixed(3)} stopColor="#fff" stopOpacity="0" />
          <stop offset={s3.toFixed(3)} stopColor="#fff" stopOpacity="0" />
          <stop offset={s4.toFixed(3)} stopColor="#fff" stopOpacity="0.85" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="sq-mask">
          <rect x="0" y="0" width={SPAN} height="260" fill="url(#sq-fade)" />
        </mask>
      </defs>
      <g mask="url(#sq-mask)" fill="none" stroke={C.paper} strokeWidth="3">
        <path d={backbone(half, amp, true)} />
        <path d={backbone(half, amp, false)} />
      </g>
      {/* rungs, coloured by the same base convention the hero taught */}
      <g mask="url(#sq-mask)">
        {Array.from({ length: rungs }, (_, i) => {
          const x = i * spacing + spacing / 2;
          const k = Math.sin((x / half) * Math.PI);
          const y1 = MID - k * (amp - 2);
          const y2 = MID + k * (amp - 2);
          return (
            <line
              key={i}
              x1={x}
              y1={y1}
              x2={x}
              y2={y2}
              stroke={TONE[["A", "T", "G", "C"][i % 4] as string]}
              strokeWidth={6 - far * 2.4}
              strokeLinecap="round"
              opacity="0.5"
            />
          );
        })}
      </g>
    </svg>
  );
}

export function Sequence({
  assemble,
  flip,
  recede = 0,
}: {
  /** 0 → 1: letters arrive, outward from the variant. */
  assemble: number;
  /** 0 → 1: the reference base becomes the variant. */
  flip: number;
  /**
   * 0 to 1: the camera retreats from the letters. The whole descent has pushed in, and this is the only time the
   * story reverses, which is what lets the closing statement take the frame without the DNA being deleted.
   * It is not a scale-down, since scaling one element reads as that element being removed. What sells a camera
   * move is differential motion: the letters recede hard while the strand behind them densifies and the ground
   * does not move at all.
   */
  recede?: number;
}) {
  if (assemble <= 0.001) return null;
  const lit = flip > 0.28;
  // Atmospheric perspective. "Let more DNA become visible" and "stop the DNA fighting the text" pull against each
  // other until you notice that distance drains contrast, so the strand gains extent and loses contrast at the
  // same time. More DNA, quieter DNA.
  const far = easeOutCubic(recede);
  /**
   * The explanatory sentence leaves before the closing statement arrives. Tuned against the caller's budget:
   * with `recede` running 0.80 to 1.00 of the scene, the caption is fully out by p 0.85, leaving 0.85 to 0.87 as
   * a breath with nothing on screen but the receding DNA before the statement starts at 0.87.
   */
  const captionOut = clamp01((recede - 0.06) / 0.2);

  /** Letters land in order of distance from the variant, not left to right. */
  const step = (distance: number) => {
    const start = 0.12 + distance * 0.11;
    return Math.min(1, Math.max(0, (assemble - start) / 0.22));
  };

  return (
    <div className="pointer-events-none relative flex flex-col items-center">
      <Strand far={far} t={step(2)} />
      {/* Everything the reader reads sits in this group, and the group is what the camera moves away from. The
          strand above is deliberately outside it: if the strand receded too, the frame would hold a smaller picture
          of the same thing. Letters shrinking into a strand that is gaining detail is what reads as distance. */}
      <div
        className="flex flex-col items-center"
        style={{
          // It lifts further than it used to (3.4vh): the closing statement is three lines now, and on a 600px
          // window it reached the locus line.
          transform: `translateY(${(-far * 7).toFixed(2)}vh) scale(${(1 - far * 0.42).toFixed(3)})`,
          transformOrigin: "50% 42%",
          // A light fade only. At 0.3 the letters themselves fell under their contrast floor mid-retreat (the T
          // measured 2.8:1), and the locus line with them.
          opacity: 1 - far * 0.1,
        }}
      >
        {/* The lower bound is 2rem, not 1.5rem. Everything in this block is sized in em off this one value, so it
            sets the scale of the whole climax of the descent, and at 4vw a 390px phone resolved to the 1.5rem floor:
            the boxed letters 36px, the locus line 13px and the region labels 7.7px. */}
        <div
          className="flex items-center font-mono font-bold"
          // The ceiling is what made the payoff small. 7vw resolves to 100px at 1440, so on every desktop the 3.2rem
          // ceiling was binding and the climax of the descent rendered at 51px: a 323x49 box, 1.2% of the frame.
          // 5.6rem lifts desktop to 90px without touching phones, since at 390px the 2rem floor still binds and 7vw does
          // not reach the new ceiling until about 1280px.
          // The G counts. It hangs above the row as absolute bottom-full, so it is outside the box the flex centring
          // measures, which is why the assembly always sat high. This margin is the G's own height (0.72em glyph +
          // 0.7em line + the gap), so what gets centred is the whole gesture from the struck letter down to the caption.
          style={{
            fontSize: "clamp(2rem, 7vw, 5.6rem)",
            letterSpacing: "0.24em",
            marginTop: "1.5em",
          }}
        >
          {/* the end of exon 14 — named, not spelled out */}
          <Region label="exon 14" t={step(3)} align="right" far={far} />
          {/* the boundary the variant sits on */}
          {/* It was 2px at half strength, the faintest mark in a frame that exists to show it. Now it is the
              height of the boxes and as solid as their letters, with a tick at each end so it reads as a boundary
              and not as a stray stroke. */}
          <span
            className="relative mx-2 block md:mx-3"
            style={{ width: 3, height: "2em", background: C.paper, opacity: step(2) }}
          >
            <span
              className="absolute -left-[4px] top-0 block h-[3px] w-[11px]"
              style={{ background: C.paper }}
            />
            <span
              className="absolute -left-[4px] bottom-0 block h-[3px] w-[11px]"
              style={{ background: C.paper }}
            />
          </span>

          {/* The donor pair, held as one unit so the bracket that names it is measured from the two boxes and
              nothing else. Sized from the row, the bracket sat 10px off the pair, because "exon 14" and "intron 14"
              are different widths and the row is centred on all of it. */}
          <span className="relative mx-2 inline-flex items-center md:mx-3">
            {/* the one that matters */}
            <span className="relative inline-flex flex-col items-center">
              {/* What it used to be, directly above what it became, on a shared vertical axis. "G struck through, A below
                it" is the whole story of this variant in two glyphs. */}
              <span
                className="absolute bottom-full flex flex-col items-center"
                style={{
                  opacity: Math.min(1, Math.max(0, flip * 2.4 - 0.12)),
                  transition: "opacity .4s ease",
                }}
              >
                {/* A slash across it, not a strike-through: a horizontal rule lands on the G's own crossbar and
                    the two together read as a different glyph. */}
                <span
                  className="relative text-[0.72em] leading-none"
                  style={{ color: C.paper, letterSpacing: 0 }}
                >
                  {REF_BASE}
                  <span
                    aria-hidden="true"
                    className="absolute -left-[14%] top-1/2 block h-[0.09em] w-[128%] -translate-y-1/2 -rotate-[32deg]"
                    style={{ background: C.paper }}
                  />
                </span>
                <span
                  className="mt-1 block w-px"
                  style={{ height: "0.7em", background: `${C.paper}88` }}
                />
              </span>

              <span
                className="inline-flex items-center justify-center rounded-[6px]"
                style={{
                  width: "1.5em",
                  height: "1.6em",
                  letterSpacing: 0,
                  background: lit ? C.red : "transparent",
                  // Scales with the box; floored so a phone still gets a real line.
                  border: `max(2px, 0.042em) solid ${lit ? C.red : `${C.paper}66`}`,
                  color: lit ? "#fff" : C.paper,
                  // No extra scale once it is lit. It grew 6%, which made it larger than the box it is paired
                  // with and pushed it past the end of the bracket under them.
                  transform: `scale(${step(0).toFixed(3)})`,
                  // No glow. A 34px red bloom behind the letter was doing what a neon sign does: the box is already the loudest
                  // object in the frame, being the only filled red thing on the page, and a halo made it look like a template.
                  transition: "background .45s ease, border-color .45s ease, color .45s ease",
                }}
              >
                {lit ? ALT_BASE : REF_BASE}
              </span>
            </span>

            {/* Intron position +2, boxed to match the variant. The claim of this frame is that these are a pair, the two
              letters that together say "cut here". A solid red box beside a small pale letter read as one important
              thing next to some background typography. */}
            <span
              className="ml-3 inline-flex items-center justify-center rounded-[6px] md:ml-[18px]"
              style={{
                width: "1.5em",
                height: "1.6em",
                letterSpacing: 0,
                border: `2px solid ${C.paper}55`,
                // cream, like the G beside it: in its base colour it was the same pink the scene uses for the
                // variant, so pink meant two things in one frame
                color: C.paper,
                opacity: step(1),
                transform: `scale(${(0.86 + step(1) * 0.14).toFixed(3)})`,
              }}
            >
              {DONOR_SECOND}
            </span>
            <span
              className="absolute inset-x-0 top-full flex flex-col items-center gap-1.5 pt-2 md:pt-2.5"
              style={{
                fontFamily: BODY,
                letterSpacing: 0,
                opacity: step(3) * leave(far),
                visibility: leave(far) < 0.05 ? "hidden" : "visible",
              }}
            >
              <span
                aria-hidden="true"
                className="block h-[7px] w-full rounded-b-[5px]"
                style={{ border: `2px solid ${C.paper}`, borderTop: 0 }}
              />
              <span
                className="whitespace-nowrap text-[13px] font-bold leading-none md:text-[15px]"
                style={{ color: C.paper }}
              >
                5′ splice donor site
              </span>
              {/* Which side of the boundary the pair is on. "Intron 14" stands to the right of the boxes, so
                  without this a reader can take G and T as lying between the exon and the intron. */}
              <span
                className="whitespace-nowrap text-[13px] font-semibold leading-none"
                style={{ color: C.paper }}
              >
                the first two letters of intron 14
              </span>
            </span>
          </span>
          <Region label="intron 14" t={step(3)} align="left" far={far} />
        </div>

        {/* The two states the pair can be in, under the bracket that names it (the margin is the bracket and its
            label, which hang below the row). Both are always shown and the one in force is the solid one, so
            wherever the reader stops the frame says which sequence this is: the flip used to be the only evidence
            that there had been a reference at all. */}
        <div
          className="mt-[64px] flex flex-col items-center md:mt-[68px]"
          style={{
            fontFamily: BODY,
            opacity: step(3) * leave(far),
            visibility: leave(far) < 0.05 ? "hidden" : "visible",
          }}
        >
          <span className="flex items-center gap-2 text-[13px] font-bold">
            {(
              [
                { name: "Reference", letters: `${REF_BASE}${DONOR_SECOND}`, on: !lit },
                { name: "Variant", letters: `${ALT_BASE}${DONOR_SECOND}`, on: lit },
              ] as const
            ).map((s) => (
              <span
                key={s.name}
                className="rounded-full px-2.5 py-1"
                style={{
                  // the one not in force keeps a dark ground of its own: bare, on the ground while it was still
                  // deepening, it measured 4.4:1
                  background: s.on ? C.paper : `${C.ink}59`,
                  color: s.on ? C.ink : C.paper,
                  border: `1.5px solid ${C.paper}`,
                  transition: "background .45s ease, color .45s ease",
                }}
              >
                {s.name} <span className="font-mono text-[1.12em]">{s.letters}</span>
              </span>
            ))}
          </span>
        </div>

        {/* The locus stays through the retreat. It is four tokens of monospace, it labels the thing on screen rather
            than explaining it, and at 58% of its original size it cannot compete with a display headline. */}
        <p
          className="mt-3 font-mono text-[14px] font-bold tracking-[0.1em] md:text-[17px]"
          style={{
            color: C.paper,
            opacity: Math.min(1, Math.max(0, flip * 2 - 0.3)),
            // It counter-scales, so the one label that stays through the retreat stays at the size it was set.
            // Inside the shrinking group it reached 9px on a desktop and under 8px on a phone.
            transform: `scale(${(1 / (1 - far * 0.42)).toFixed(3)})`,
          }}
        >
          DPYD · c.1905+1G&gt;A
        </p>
        {/* What the two letters were for. Without this the reader sees a letter change and has to take on faith that
            it matters; with it, the image is self-explaining.
            It leaves before the closing statement arrives. It used to hold for the rest of the scene, so the frame
            carried the mechanism and the stakes at once, two paragraphs stacked under a receding diagram. The
            caption's job is finished once the reader has understood the flip. */}
        {/* Two sentences on two clocks. What GT is for arrives with the letters, so it can be read while they are
            still the reference; what the change does arrives with the change. Together they were at full strength
            for about 16vh of scroll, which is not long enough for 24 words. Both are in the page from the start,
            so the second arriving moves nothing. */}
        <p
          className="mt-2 max-w-[40ch] text-center text-[14px] font-semibold leading-snug md:text-[16px]"
          style={{ fontFamily: BODY, color: C.paper, opacity: 1 - captionOut }}
        >
          <span style={{ opacity: step(3) }}>
            The conserved GT sequence marks the 5′ splice donor site.
          </span>{" "}
          <span style={{ opacity: clamp01(flip * 2.5 - 0.5) }}>
            When G changes to A, the splice site may no longer be recognised correctly.
          </span>
        </p>
      </div>
    </div>
  );
}
