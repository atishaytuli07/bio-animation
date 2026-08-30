import { C, L } from "@/components/hero/palette";
import { useSeen } from "@/hooks/use-seen";

/**
 * The story's diagrams, as still figures for the documentation pages.
 *
 * Each one is something the animation already shows. Drawing them again here
 * is not duplication — it is the point. A judge reading the Description page
 * gets the same picture the homepage gave them, at a glance, instead of a
 * paragraph describing a picture they may not have scrolled to.
 *
 * They are drawn in the same units, colours and stroke weights as the story so
 * the two cannot drift apart, and each reveals once on entry and then holds.
 */

const ease = "cubic-bezier(.22,1,.36,1)";

/**
 * The splice donor, and what the variant does to it.
 *
 * Positions +1 and +2 of an intron are the canonical GT that marks where the
 * cut goes. c.1905+1G>A changes that G to an A, the donor reads AT, and exon
 * 14 is skipped. The whole claim of the project is in two letters, so the
 * figure is two letters.
 */
export function SpliceFigure() {
  const [ref, seen] = useSeen<HTMLDivElement>();
  const box = (delay: number) => ({
    opacity: seen ? 1 : 0,
    transform: seen ? "translateY(0)" : "translateY(8px)",
    transition: `opacity 500ms ${ease} ${delay}ms, transform 500ms ${ease} ${delay}ms`,
  });
  return (
    <div ref={ref} className="flex flex-col items-center">
      <div className="flex items-center justify-center gap-1 md:gap-2">
        <span className={L.note} style={{ ...box(0), color: C.inkNote, whiteSpace: "nowrap" }}>
          exon 14
        </span>
        <span
          className="mx-2 block md:mx-3"
          style={{ ...box(80), width: 2, height: "2.6rem", background: `${C.ink}55` }}
        />

        {/* the letter that changed, with what it was struck through above */}
        <span className="relative inline-flex flex-col items-center">
          <span className="absolute bottom-full flex flex-col items-center" style={box(320)}>
            <span
              className="font-mono text-[1.1rem] font-bold leading-none line-through md:text-[1.3rem]"
              style={{ color: C.inkNote }}
            >
              G
            </span>
            <span
              className="mt-1 block w-px"
              style={{ height: "0.6rem", background: `${C.ink}55` }}
            />
          </span>
          <span
            className="inline-flex items-center justify-center rounded-[6px] font-mono font-bold"
            style={{
              ...box(160),
              width: "2.6rem",
              height: "2.8rem",
              fontSize: "1.5rem",
              background: C.red,
              color: "#fff",
              border: `2.5px solid ${C.ink}`,
            }}
          >
            A
          </span>
        </span>

        <span
          className="ml-1 inline-flex items-center justify-center rounded-[6px] font-mono font-bold md:ml-1.5"
          style={{
            ...box(240),
            width: "2.6rem",
            height: "2.8rem",
            fontSize: "1.5rem",
            border: `2px solid ${C.ink}55`,
            color: C.ink,
          }}
        >
          T
        </span>
        <span
          className={L.note}
          style={{ ...box(320), color: C.inkNote, whiteSpace: "nowrap", marginLeft: "0.5rem" }}
        >
          intron 14
        </span>
      </div>

      <p
        className="mt-6 max-w-[36ch] text-center text-[14px] font-semibold leading-snug md:text-[15px]"
        style={{ ...box(420), color: C.ink }}
      >
        These two letters tell the cell where to cut.
      </p>
    </div>
  );
}

/**
 * The causal chain, as five steps.
 *
 * The client asked for exactly this on the homepage and it is carried there by
 * the animation rather than by boxes. On a page a reader skims, the boxes are
 * the right form — and having it in both places means the argument survives
 * whichever one they read.
 */
const CHAIN = [
  { t: "A DPYD variant", tone: C.red, solid: true },
  { t: "less DPD activity", tone: C.green, solid: false },
  { t: "slower clearance", tone: C.coral, solid: false },
  { t: "the drug builds up", tone: C.coral, solid: false },
  { t: "higher toxicity risk", tone: C.red, solid: true },
];

export function ChainFigure() {
  const [ref, seen] = useSeen<HTMLDivElement>();
  return (
    /*
      Vertical, with a rail down the side.

      A horizontal chain of five boxes does not fit a text column, and when it
      wraps it leaves an arrow dangling at the end of the first line and the
      last step stranded and centred below — it reads as broken rather than as
      a diagram. Vertical never wraps, works at every width without a second
      layout, and is how a flow is drawn in a document anyway.
    */
    <div ref={ref} className="mx-auto flex max-w-[26rem] flex-col">
      {CHAIN.map((step, i) => (
        <div key={step.t} className="flex items-stretch gap-4">
          {/* the rail: a dot per step, joined by a line except after the last */}
          <div className="flex w-4 shrink-0 flex-col items-center">
            <span
              className="mt-3.5 block size-3 shrink-0 rounded-full"
              style={{
                background: step.solid ? step.tone : C.paper,
                border: `2.5px solid ${C.ink}`,
                opacity: seen ? 1 : 0,
                transform: seen ? "scale(1)" : "scale(0.4)",
                transition: `opacity 380ms ${ease} ${i * 120}ms, transform 380ms ${ease} ${i * 120}ms`,
              }}
            />
            {i < CHAIN.length - 1 && (
              <span
                className="w-[2px] flex-1 origin-top"
                style={{
                  background: `${C.ink}33`,
                  transform: seen ? "scaleY(1)" : "scaleY(0)",
                  transition: `transform 320ms ${ease} ${i * 120 + 120}ms`,
                }}
              />
            )}
          </div>

          <span
            className="mb-3 whitespace-nowrap rounded-md px-3.5 py-2 text-[13px] font-bold md:text-[14px]"
            style={{
              background: step.solid ? step.tone : C.paper,
              color: step.solid ? "#fff" : C.ink,
              border: `2.5px solid ${C.ink}`,
              boxShadow: `3px 3px 0 ${C.ink}`,
              opacity: seen ? 1 : 0,
              transform: seen ? "translateX(0)" : "translateX(-8px)",
              transition: `opacity 420ms ${ease} ${i * 120}ms, transform 420ms ${ease} ${i * 120}ms`,
            }}
          >
            {step.t}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * The two outcomes, side by side: a standard dose against a matched one.
 *
 * The homepage makes this point by running the same vessel twice and letting
 * the pile drain. A still page cannot do that, so here it IS the comparison —
 * the one place a side-by-side is the right form rather than the lazy one.
 */
export function DoseFigure() {
  const [ref, seen] = useSeen<HTMLDivElement>();
  const col = (delay: number) => ({
    opacity: seen ? 1 : 0,
    transform: seen ? "translateY(0)" : "translateY(10px)",
    transition: `opacity 520ms ${ease} ${delay}ms, transform 520ms ${ease} ${delay}ms`,
  });
  const Vessel = ({ n, tone, label }: { n: number; tone: string; label: string }) => (
    <div className="flex flex-1 flex-col items-center">
      <svg viewBox="0 0 120 190" className="h-[190px] w-auto" aria-hidden="true">
        <rect
          x="18"
          y="6"
          width="84"
          height="178"
          rx="34"
          fill={`${C.paper}`}
          stroke={C.ink}
          strokeWidth="2.5"
        />
        {Array.from({ length: n }, (_, i) => {
          const row = Math.floor(i / 3);
          const c = i % 3;
          return (
            <circle
              key={i}
              cx={36 + c * 24 + (row % 2 ? 12 : 0)}
              cy={168 - row * 22}
              r="8.5"
              fill={tone}
              stroke={C.ink}
              strokeWidth="2"
            />
          );
        })}
      </svg>
      <span className={`mt-3 ${L.note}`} style={{ color: C.ink }}>
        {label}
      </span>
    </div>
  );
  return (
    <div ref={ref} className="flex items-start justify-center gap-8 md:gap-14">
      <div style={col(0)}>
        <Vessel n={11} tone={C.red} label="standard dose" />
      </div>
      <div style={col(180)}>
        <Vessel n={2} tone={C.coral} label="dose matched to the result" />
      </div>
    </div>
  );
}
