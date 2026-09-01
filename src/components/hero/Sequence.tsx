import { BASES_ON_FIELD, C } from "./palette";

/**
 * The arrival: the strand resolved into DNA you can actually read.
 *
 * This is the payoff of the whole descent. The hero taught the base-pair
 * colours by hover; here those same colours become letters, and the one that
 * matters changes in front of you. The reader watches the mutation happen
 * rather than being told about it — which is the client's "communicated
 * through illustrations and visual transitions, not primarily through large
 * text", applied to the moment that most needed it.
 *
 * The letters assemble outward FROM the variant, not left to right, so the eye
 * is anchored on the base that matters before the context arrives around it.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * WHY THERE IS NO FLANKING SEQUENCE HERE.
 *
 * This used to show six invented bases on each side of the variant. They were
 * decorative ACGT, not the reference sequence, and iGEM's policy is explicit
 * that nothing on a wiki may be fabricated — a judge checking a rendered
 * sequence against the reference genome is an entirely realistic thing to
 * happen, and inventing a locus is the kind of error that is not recoverable.
 *
 * What is shown instead is the part that is verifiable from the variant's own
 * name, and which happens to be the part that actually matters:
 *
 *   DPYD c.1905+1G>A (rs3918290, the DPYD*2A allele) sits at position +1 of
 *   intron 14, immediately after the end of exon 14. Positions +1 and +2 of an
 *   intron are the canonical GT splice donor — the two letters that mark where
 *   the cut goes. The variant changes that G to an A, so the donor reads AT,
 *   the spliceosome does not recognise it, and exon 14 is skipped.
 *
 * So the frame shows the boundary, the two donor letters, and the G becoming
 * an A. Every glyph on screen is entailed by the variant's name. Nothing is
 * invented, and the image now carries the mechanism rather than decoration.
 *
 * The team should still confirm the wording against their own cited source
 * before the freeze.
 * ─────────────────────────────────────────────────────────────────────────
 */
const REF_BASE = "G";
const ALT_BASE = "A";
/** Intron position +2. Canonical donor is GT, so this letter follows. */
const DONOR_SECOND = "T";

/**
 * Base → colour, the same mapping the hero's rungs use, in its on-field tint.
 *
 * The four hexes used to be copied here by hand from BASES. They were the rung
 * colours exactly, which is right for a stroke on a white backbone and wrong
 * for a 51px letter on bare purple — see BASES_ON_FIELD for the measurements.
 * Imported now, so the two can never drift apart again.
 */
const TONE = BASES_ON_FIELD;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
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

/**
 * One backbone of the strand, generated rather than hardcoded.
 *
 * It used to be two literal `d` strings with the period baked in, which meant
 * the strand could never change shape. It has to: pulling the camera back must
 * fit MORE of the molecule into the same frame, and that is a shorter period,
 * not a smaller drawing. Scaling the whole thing down would just shrink the
 * picture, which is the "element being removed" reading we are trying to avoid.
 *
 * At `half = 300` this reproduces the original path exactly.
 */
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
   * 0 → 1: the camera retreats from the letters.
   *
   * The whole descent has pushed IN — genome, chromosome, gene, sequence, one
   * base. This is the first and only time the story reverses, and it is what
   * lets the closing statement take the frame without the DNA being deleted to
   * make room for it.
   *
   * It is NOT a scale-down. Scaling one element reads as that element being
   * removed. What sells a camera move is DIFFERENTIAL motion — near things
   * change fast, far things barely change — so the letters recede hard while
   * the strand behind them densifies and the ground does not move at all.
   */
  recede?: number;
}) {
  if (assemble <= 0.001) return null;
  const lit = flip > 0.28;
  /*
    Atmospheric perspective, and it settles what would otherwise be a
    contradiction in the brief: "let more DNA become visible" and "stop the DNA
    fighting the text" pull against each other until you notice that distance
    drains contrast. So the strand gains EXTENT and loses CONTRAST at the same
    time. More DNA, quieter DNA.
  */
  const far = easeOutCubic(recede);
  /**
   * The explanatory sentence leaves before the closing statement arrives.
   *
   * Tuned against the caller's budget: with `recede` running 0.80 → 1.00 of the
   * scene, this puts the caption fully out by p 0.85, which leaves p 0.85 →
   * 0.87 as a breath with nothing on screen but the receding DNA, before the
   * statement starts arriving at 0.87.
   */
  const captionOut = clamp01((recede - 0.03) / 0.22);

  /** Letters land in order of distance from the variant, not left to right. */
  const step = (distance: number) => {
    const start = 0.12 + distance * 0.11;
    return Math.min(1, Math.max(0, (assemble - start) / 0.22));
  };

  const Base = ({ letter, distance }: { letter: string; distance: number }) => {
    const t = step(distance);
    return (
      <span
        style={{
          color: TONE[letter] ?? C.paper,
          opacity: t,
          transform: `translateY(${((1 - t) * 14).toFixed(1)}px)`,
          display: "inline-block",
        }}
      >
        {letter}
      </span>
    );
  };

  /**
   * A named region rather than spelled-out bases. "exon 14" is verifiable;
   * six invented letters are not, and this reads as an annotated locus
   * instead of a sequence nobody can check.
   */
  const Region = ({
    label,
    distance,
    align,
  }: {
    label: string;
    distance: number;
    align: "left" | "right";
  }) => {
    const t = step(distance);
    return (
      <span
        /* 0.4em, floored at 11px: these are the smallest strings in the scene
           and at 0.32em of the old mobile size they rendered under 8px. */
        /*
          THE GAP IS PART OF THE LABEL. At px-1.5 the right-hand label's box
          began at exactly the T's right edge — 809.4 against 809.4, measured —
          so an 11px caption abutted a 51px glyph with nothing between them. It
          went unreported for as long as the label was dimmed to 0.62, which is
          below the overlap audit's visibility floor: raising it to something
          readable is what surfaced the collision, not what caused it.
        */
        className="font-sans text-[max(11px,0.4em)] font-bold uppercase mx-3 md:mx-5"
        style={{
          color: C.paper,
          /*
            0.9, not 0.62. These name the exon/intron boundary — the mechanism
            the whole frame exists to show — and at 0.62 paper on lavenderDeep
            they measured 2.53:1 against the 4.5:1 an 11px string is held to.
            The dimming was making the only verifiable labels in the scene the
            hardest thing in it to read.
          */
          opacity: t * 0.9,
          letterSpacing: "0.18em",
          /*
            THEY ARRIVE FROM OUTSIDE, not from on top of the letters.

            The offsets used to be +14 for the left label and -14 for the right
            one, which pointed both of them INWARD: each began its entrance
            overlapping the glyph it labels and slid off it. Measured at page
            0.125, "intron 14" sat 3.2px inside the T.

            Reversed, the pair opens outward as the sequence assembles — which
            is also the better gesture, since the letters are what the eye
            should land on first and the labels should get out of their way
            rather than peel off them.
          */
          transform: `translateX(${((1 - t) * (align === "right" ? -14 : 14)).toFixed(1)}px)`,
          display: "inline-block",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
    );
  };

  /*
    The strand this is a piece of, running behind the letters.

    Without it the arrival was four glyphs alone in a very large purple field —
    the client's own example of a screen that felt empty next to the DNA
    section. It is also the honest picture: we have descended INTO the strand,
    so the strand should still be there, just too magnified to read except at
    the point of interest. It fades out toward the centre so the letters sit in
    a clear window rather than fighting a pattern.
  */
  const Strand = () => {
    /*
      THE PULL-BACK, drawn rather than tweened.

      Retreating from a molecule means more of it fits in the frame, so the
      half-period shortens from 300 units to 150 and the rungs halve their
      spacing: the same window ends up holding twice as much DNA. The picture
      therefore PERFORMS "about three billion letters" at the exact moment the
      closing statement says it, instead of the copy asserting something the
      image does not show.

      Meanwhile the contrast drops — distance drains contrast, and it is what
      stops the strand competing with the statement now sitting in front of it.
      More DNA, quieter DNA.
    */
    const half = WAVE_NEAR - far * (WAVE_NEAR - WAVE_FAR);
    const amp = AMP_NEAR - far * (AMP_NEAR - AMP_FAR);
    const spacing = half / 10;
    const rungs = Math.round(SPAN / spacing);
    /*
      The clear window the letters sit in closes as they recede into it: at rest
      the middle third is masked away so nothing crosses the glyphs, and by full
      retreat the strand runs almost unbroken because the letters no longer need
      that much room.
    */
    const s1 = 0.2 - far * 0.12;
    const s2 = 0.38 + far * 0.09;
    const s3 = 0.62 - far * 0.09;
    const s4 = 0.8 + far * 0.12;
    return (
      <svg
        viewBox={`0 0 ${SPAN} 260`}
        className="pointer-events-none absolute left-1/2 top-1/2 w-[128vw] max-w-none -translate-x-1/2 -translate-y-1/2"
        aria-hidden="true"
        style={{ opacity: step(2) * (0.5 - far * 0.17) }}
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
  };

  return (
    <div className="pointer-events-none relative flex flex-col items-center">
      <Strand />
      {/*
        Everything the reader READS sits in this group, and the group is what
        the camera moves away from. The strand above is deliberately outside it:
        if the strand receded too, the frame would simply hold a smaller picture
        of the same thing. Letters shrinking INTO a strand that is gaining
        detail is what reads as distance rather than as an element leaving.
      */}
      <div
        className="flex flex-col items-center"
        style={{
          transform: `translateY(${(-far * 3.4).toFixed(2)}vh) scale(${(1 - far * 0.42).toFixed(3)})`,
          transformOrigin: "50% 42%",
          opacity: 1 - far * 0.3,
        }}
      >
        {/*
          The lower bound is 2rem, not 1.5rem.

          Everything in this block is sized in `em` off this one value, so it
          set the scale of the whole climax of the descent — and at 4vw a
          390px phone resolved to the 1.5rem floor, which made the boxed letters
          36px, the locus line 13px and the region labels (0.32em) SEVEN POINT
          SEVEN pixels. The most important frame in the story was its least
          legible one on the device most people will read it on.
        */}
        <div
          className="flex items-center font-mono font-bold"
          style={{ fontSize: "clamp(2rem, 7vw, 3.2rem)", letterSpacing: "0.24em" }}
        >
          {/* the end of exon 14 — named, not spelled out */}
          <Region label="exon 14" distance={3} align="right" />
          {/* the boundary the variant sits on */}
          <span
            className="mx-2 block md:mx-3"
            style={{
              width: 2,
              height: "1.5em",
              background: `${C.paper}80`,
              opacity: step(2),
            }}
          />

          {/* the one that matters */}
          <span className="relative mx-2 inline-flex flex-col items-center md:mx-3">
            {/*
            What it used to be, directly above what it became, on a shared
            vertical axis. "G struck through, A below it" is the whole story of
            this variant in two glyphs — far more legible than a sentence.
          */}
            <span
              className="absolute bottom-full flex flex-col items-center"
              style={{
                opacity: Math.min(1, Math.max(0, flip * 2.4 - 0.12)),
                transition: "opacity .4s ease",
              }}
            >
              <span
                className="text-[0.72em] leading-none line-through"
                style={{ color: C.paper, opacity: 1, letterSpacing: 0 }}
              >
                {REF_BASE}
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
                border: `2px solid ${lit ? C.red : `${C.paper}66`}`,
                color: lit ? "#fff" : C.paper,
                transform: `scale(${(step(0) * (lit ? 1 + flip * 0.06 : 1)).toFixed(3)})`,
                /*
                No glow. A 34px red bloom behind the letter was doing what a
                neon sign does — the box is already the loudest object in the
                frame because it is the only filled red thing on the page, and
                a halo only made it look like a template.
              */
                transition: "background .45s ease, border-color .45s ease, color .45s ease",
              }}
            >
              {lit ? ALT_BASE : REF_BASE}
            </span>
          </span>

          {/*
          Intron position +2, boxed to match the variant.

          The whole claim of this frame is that these are a PAIR — the two
          letters that together say "cut here". A solid red box beside a small
          pale letter read as one important thing next to some background
          typography, which is the opposite of that.
        */}
          <span
            className="ml-1 inline-flex items-center justify-center rounded-[6px] md:ml-1.5"
            style={{
              width: "1.5em",
              height: "1.6em",
              letterSpacing: 0,
              border: `2px solid ${C.paper}55`,
              color: TONE[DONOR_SECOND],
              opacity: step(1),
              transform: `scale(${(0.86 + step(1) * 0.14).toFixed(3)})`,
            }}
          >
            {DONOR_SECOND}
          </span>
          <Region label="intron 14" distance={3} align="left" />
        </div>

        {/*
          The locus stays through the retreat. It is four tokens of monospace,
          it labels the thing on screen rather than explaining it, and at 58% of
          its original size it cannot compete with a display headline. What
          leaves is the sentence below, which can.
        */}
        <p
          className="mt-7 font-mono text-[13px] font-bold tracking-[0.22em] md:text-[16px]"
          style={{ color: C.paper, opacity: Math.min(1, Math.max(0, flip * 2 - 0.3)) }}
        >
          DPYD · c.1905+1G&gt;A
        </p>
        {/*
          What the two letters were for. Without this the reader sees a letter
          change and has to take on faith that it matters; with it, the image is
          self-explaining — a two-letter signal that says "cut here", broken.

          AND IT LEAVES BEFORE THE CLOSING STATEMENT ARRIVES. It used to hold
          for the rest of the scene, so the frame carried the mechanism and the
          stakes at once — two paragraphs stacked under a receding diagram, each
          making the other harder to read. The caption's job is finished the
          moment the reader has understood the flip, and the small gap it leaves
          behind is the breathing beat before the statement lands.
        */}
        <p
          className="mt-3 max-w-[34ch] text-center text-[13px] font-semibold leading-snug md:text-[15px]"
          style={{
            color: C.paper,
            opacity: Math.min(1, Math.max(0, flip * 2 - 0.7)) * 0.8 * (1 - captionOut),
          }}
        >
          These two letters tell the cell where to cut. Change one, and the cut is made in the wrong
          place.
        </p>
      </div>
    </div>
  );
}
