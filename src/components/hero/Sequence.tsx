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
 * PLACEHOLDER SEQUENCE — MUST BE REPLACED BEFORE THIS SHIPS.
 *
 * The flanking bases below are illustrative, NOT the verified reference
 * sequence around DPYD c.1905+1G>A. iGEM's own policy is explicit that
 * nothing on a wiki may be fabricated, and a judge checking this against the
 * reference genome is a realistic thing to happen. The team must supply the
 * real flank, and the ellipses are there to signal "excerpt" rather than
 * "this is the locus".
 * ─────────────────────────────────────────────────────────────────────────
 */
const FLANK_LEFT = ["A", "C", "G", "A", "T", "C"];
const FLANK_RIGHT = ["A", "T", "C", "G", "G", "T"];
const REF_BASE = "G";
const ALT_BASE = "A";

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

  return (
    <div className="pointer-events-none flex flex-col items-center">
      <div
        className="flex items-center font-mono font-bold"
        style={{ fontSize: "clamp(1.5rem, 4vw, 3.2rem)", letterSpacing: "0.3em" }}
      >
        <span style={{ color: C.paper, opacity: step(7) * 0.4 }}>…</span>
        {FLANK_LEFT.map((b, i) => (
          <Base key={`l${i}`} letter={b} distance={FLANK_LEFT.length - i} />
        ))}

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

        {FLANK_RIGHT.map((b, i) => (
          <Base key={`r${i}`} letter={b} distance={i + 1} />
        ))}
        <span style={{ color: C.paper, opacity: step(7) * 0.4 }}>…</span>
      </div>

      <p
        className="mt-7 font-mono text-[13px] font-bold tracking-[0.22em] md:text-[16px]"
        style={{ color: C.paper, opacity: Math.min(1, Math.max(0, flip * 2 - 0.3)) }}
      >
        DPYD · c.1905+1G&gt;A
      </p>
    </div>
  );
}
