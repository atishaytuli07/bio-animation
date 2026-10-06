import type { CSSProperties } from "react";

import { C, L, R } from "@/components/hero/palette";
import { useSeen } from "@/hooks/use-seen";

// The story's diagrams, as still figures for the documentation pages. Each one is something the animation
// already shows: a judge reading the Description page gets the same picture at a glance instead of a paragraph
// describing a picture they may not have scrolled to.
// Drawn in the same units, colours and stroke weights as the story so the two cannot drift apart. Each reveals
// once on entry and then holds.

const ease = "cubic-bezier(.22,1,.36,1)";

// The splice donor, and what the variant does to it. Positions +1 and +2 of intron 14 carry the conserved GT of
// the 5' splice donor site; c.1905+1G>A changes that G to an A, so the site reads AT and may no longer be
// recognised. The whole claim is in two letters, so the figure is two letters, numbered, because the caption
// refers to them by position.
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
          <Position n="+1" style={box(160)} />
        </span>

        <span className="relative ml-1 inline-flex flex-col items-center md:ml-1.5">
          <span
            className="inline-flex items-center justify-center rounded-[6px] font-mono font-bold"
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
          <Position n="+2" style={box(240)} />
        </span>
        <span
          className={L.note}
          style={{ ...box(320), color: C.inkNote, whiteSpace: "nowrap", marginLeft: "0.5rem" }}
        >
          intron 14
        </span>
      </div>

      <p
        className="mt-10 text-center text-[14px] font-semibold leading-snug md:text-[15px]"
        style={{ ...box(420), color: C.ink }}
      >
        {/* One sentence a line, so a wide column cannot break "The" off the second. */}
        <span className="block">The conserved GT marks the 5′ splice donor site.</span>
        <span className="block">The variant changes it to AT.</span>
      </p>
    </div>
  );
}

// A base's position in the intron, hung below its box. Absolutely placed so it adds no height to the row: the
// exon and intron labels are centred on the boxes, and a taller row would pull them off-centre.
function Position({ n, style }: { n: string; style: CSSProperties }) {
  return (
    <span
      className="absolute top-full mt-1.5 font-mono text-[12px] font-bold leading-none"
      style={{ ...style, color: C.inkNote }}
    >
      {n}
    </span>
  );
}

// The causal chain, as five steps. The client asked for this on the homepage, where the animation carries it.
// On a page a reader skims, boxes are the right form, and having it in both places means the argument survives
// whichever one they read.
const CHAIN = [
  { t: "A DPYD variant", tone: C.red, solid: true },
  { t: "less DPD activity", tone: C.green, solid: false },
  { t: "slower clearance", tone: C.coral, solid: false },
  { t: "5-FU exposure increases", tone: C.coral, solid: false },
  { t: "higher toxicity risk", tone: C.red, solid: true },
];

export function ChainFigure() {
  const [ref, seen] = useSeen<HTMLDivElement>();
  return (
    // Vertical, with a rail down the side. A horizontal chain of five boxes does not fit a text column, and when it
    // wraps it leaves an arrow dangling at the end of the first line and the last step stranded below. Vertical
    // never wraps, works at every width without a second layout, and is how a flow is drawn in a document anyway.
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
            className="mb-3 whitespace-nowrap rounded-[6px] px-3.5 py-2 text-[13px] font-bold md:text-[14px]"
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

// Where `n` molecules settle in a vessel, bottom row first. Rows alternate three and two, each centred, so the
// pile nests the way stacked balls do. The old grid shifted every other row of three by half a step, which
// pushed the third molecule through the vessel wall, and a pile of two sat against the left side.
function pile(n: number) {
  const out: { x: number; y: number }[] = [];
  for (let row = 0; out.length < n; row++) {
    const k = Math.min(row % 2 ? 2 : 3, n - out.length);
    for (let j = 0; j < k; j++) out.push({ x: 60 + (j - (k - 1) / 2) * 24, y: 168 - row * 22 });
  }
  return out;
}

function Vessel({ n, tone, label }: { n: number; tone: string; label: string }) {
  return (
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
        {pile(n).map((m, i) => (
          <circle key={i} cx={m.x} cy={m.y} r="8.5" fill={tone} stroke={C.ink} strokeWidth="2" />
        ))}
      </svg>
      <span className={`mt-3 ${L.note}`} style={{ color: C.ink }}>
        {label}
      </span>
    </div>
  );
}

// The two outcomes, side by side: a standard dose against an adjusted one. The homepage makes this point by
// running the same vessel twice and letting the pile drain; a still page cannot, so here it is the comparison.
// Conceptual, and labelled as such by the figure around it. The counts are a picture of "more" and "less", not a
// pharmacokinetic model. The right-hand label says "adjusted", never "matched to the result": the test informs a
// dose under clinical guidelines, it does not set one.
export function DoseFigure() {
  const [ref, seen] = useSeen<HTMLDivElement>();
  const col = (delay: number) => ({
    opacity: seen ? 1 : 0,
    transform: seen ? "translateY(0)" : "translateY(10px)",
    transition: `opacity 520ms ${ease} ${delay}ms, transform 520ms ${ease} ${delay}ms`,
  });
  return (
    <div ref={ref} className="flex items-start justify-center gap-8 md:gap-14">
      <div style={col(0)}>
        <Vessel n={11} tone={C.red} label="standard dose" />
      </div>
      <div style={col(180)}>
        <Vessel n={2} tone={C.coral} label="adjusted dose" />
      </div>
    </div>
  );
}

// The engineering cycle, drawn as a cycle. The Engineering page opened by saying "engineering is not a straight
// line from an idea to a result" and then presented four identical dashed panels stacked vertically. iGEM judges
// this page on whether a team went round the loop more than once, so the loop is the shape the page has to show.
// All SVG, including the text. A CSS grid of boxes with an SVG arrow layer over it drifts out of alignment the
// moment the two are measured differently; here the nodes and the arrows share one coordinate space.
// The nodes are real links to the sections below, the only interaction on the page: a reader who wants Test can
// go to Test.
// The return arrow is the point. Design, Build, Test is a process; the arrow from Learn back to Design is what
// makes it a cycle, and it is what the criterion rewards. It is heavier and it is the only arrow with a label.
const CYCLE_NODES = [
  { n: "01", name: "Design", id: "design", x: 40, y: 30 },
  { n: "02", name: "Build", id: "build", x: 380, y: 30 },
  { n: "03", name: "Test", id: "test", x: 380, y: 268 },
  { n: "04", name: "Learn", id: "learn", x: 40, y: 268 },
] as const;

const NODE_W = 200;
const NODE_H = 96;

export function CycleFigure() {
  const [ref, seen] = useSeen<HTMLDivElement>();

  /** Each arrow draws itself, in order, after the nodes have landed. */
  const draw = (i: number) => ({
    strokeDasharray: 1,
    strokeDashoffset: seen ? 0 : 1,
    transition: `stroke-dashoffset 520ms ${ease} ${420 + i * 190}ms`,
  });

  return (
    <div ref={ref}>
      {/* Not role="img". It carried role="img" with an empty aria-label, which is two faults at once: an image with
          no accessible name, and, because role="img" hides everything inside it, four working links invisible to a
          screen reader. It is a graphic that contains links, so the links stay reachable and each is named by the
          text drawn inside it; the arrows and shadows are hidden individually. */}
      <svg viewBox="0 0 620 394" className="h-auto w-full">
        <defs>
          <marker
            id="cyc-head"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="5.5"
            markerHeight="5.5"
            orient="auto-start-reverse"
          >
            <path d="M0 0 L10 5 L0 10 z" fill={C.ink} />
          </marker>
        </defs>

        {/* Design → Build, along the top */}
        <path
          d="M252 78 L 368 78"
          fill="none"
          stroke={C.ink}
          strokeWidth="2.5"
          strokeLinecap="round"
          markerEnd="url(#cyc-head)"
          aria-hidden="true"
          pathLength={1}
          style={draw(0)}
        />
        {/* Build → Test, down the right */}
        <path
          d="M480 138 L 480 256"
          fill="none"
          stroke={C.ink}
          strokeWidth="2.5"
          strokeLinecap="round"
          markerEnd="url(#cyc-head)"
          aria-hidden="true"
          pathLength={1}
          style={draw(1)}
        />
        {/* Test → Learn, back along the bottom */}
        <path
          d="M368 316 L 252 316"
          fill="none"
          stroke={C.ink}
          strokeWidth="2.5"
          strokeLinecap="round"
          markerEnd="url(#cyc-head)"
          aria-hidden="true"
          pathLength={1}
          style={draw(2)}
        />
        {/* Learn back to Design. The one that closes the loop, and the only one that carries a label. */}
        {/* Ink, not red, and heavier instead. The palette's first rule is that a colour means the same thing on every
            screen, and red means the variant. Inside chrome, red reads as the brand accent; inside an illustration it
            does not, and a red arrow here would quietly teach a reader that this edge is somehow the variant. The
            emphasis does not need colour: this edge is 4px against the others' 2.5 and it is the only one with a word. */}
        <path
          d="M140 256 L 140 138"
          fill="none"
          stroke={C.ink}
          strokeWidth="4"
          strokeLinecap="round"
          markerEnd="url(#cyc-head)"
          aria-hidden="true"
          pathLength={1}
          style={draw(3)}
        />
        <text
          x="128"
          y="202"
          textAnchor="end"
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            fill: C.ink,
            opacity: seen ? 1 : 0,
            transition: `opacity 420ms ${ease} 1100ms`,
          }}
        >
          again
        </text>

        {CYCLE_NODES.map((node, i) => (
          <a key={node.id} href={`#${node.id}`} aria-label={`${node.name} — go to that section`}>
            <g
              style={{
                opacity: seen ? 1 : 0,
                transform: seen ? "translateY(0)" : "translateY(10px)",
                transition: `opacity 420ms ${ease} ${i * 110}ms, transform 420ms ${ease} ${i * 110}ms`,
              }}
            >
              {/* the offset shadow every pressable thing on this site wears */}
              <rect
                x={node.x + 4}
                y={node.y + 4}
                width={NODE_W}
                height={NODE_H}
                rx={R.md}
                fill={C.ink}
              />
              <rect
                x={node.x}
                y={node.y}
                width={NODE_W}
                height={NODE_H}
                rx={R.md}
                fill={C.paper}
                stroke={C.ink}
                strokeWidth="2.5"
              />
              <text
                x={node.x + 22}
                y={node.y + 36}
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  fill: C.redDeep,
                }}
              >
                {node.n}
              </text>
              <text
                x={node.x + 22}
                y={node.y + 70}
                style={{
                  fontSize: 27,
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  fill: C.ink,
                }}
              >
                {node.name}
              </text>
            </g>
          </a>
        ))}
      </svg>
    </div>
  );
}
