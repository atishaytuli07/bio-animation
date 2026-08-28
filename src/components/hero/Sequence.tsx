import { C } from "./palette";

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

/** Base → colour, the same mapping the hero's rungs use. */
const TONE: Record<string, string> = {
  A: "#5FD3A0",
  T: "#FF9EB5",
  G: "#C9A6FF",
  C: "#7CC0FF",
};

export function Sequence({
  assemble,
  flip,
}: {
  /** 0 → 1: letters arrive, outward from the variant. */
  assemble: number;
  /** 0 → 1: the reference base becomes the variant. */
  flip: number;
}) {
  if (assemble <= 0.001) return null;
  const lit = flip > 0.28;

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
        className="font-sans text-[0.32em] font-bold uppercase"
        style={{
          color: C.paper,
          opacity: t * 0.62,
          letterSpacing: "0.18em",
          transform: `translateX(${((1 - t) * (align === "right" ? 14 : -14)).toFixed(1)}px)`,
          display: "inline-block",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
    );
  };

  return (
    <div className="pointer-events-none flex flex-col items-center">
      <div
        className="flex items-center font-mono font-bold"
        style={{ fontSize: "clamp(1.5rem, 4vw, 3.2rem)", letterSpacing: "0.3em" }}
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
              className="text-[0.62em] leading-none line-through"
              style={{ color: C.paper, opacity: 0.9, letterSpacing: 0 }}
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
              boxShadow: lit ? `0 10px 34px -8px ${C.red}` : "none",
              transition: "background .45s ease, border-color .45s ease, color .45s ease",
            }}
          >
            {lit ? ALT_BASE : REF_BASE}
          </span>
        </span>

        {/* intron position +2 — the second half of the donor signal */}
        <Base letter={DONOR_SECOND} distance={1} />
        <Region label="intron 14" distance={3} align="left" />
      </div>

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
      */}
      <p
        className="mt-3 max-w-[34ch] text-center text-[13px] font-semibold leading-snug md:text-[15px]"
        style={{ color: C.paper, opacity: Math.min(1, Math.max(0, flip * 2 - 0.7)) * 0.8 }}
      >
        These two letters tell the cell where to cut. Change one, and the cut is made in the wrong
        place.
      </p>
    </div>
  );
}
