import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";

import { Enzyme } from "@/components/hero/elements";
import { C, DISPLAY, L, R } from "@/components/hero/palette";
import { useTime } from "@/hooks/use-scroll-progress";
import { SiteHeader } from "@/components/story/SiteHeader";
import { WIKI } from "@/lib/wiki";

// The bench. The story tells one argument in one order; this is where a reader asks their own questions of it.
// It was first built as a second telling of the story, with the same two patients and the same ending, and a
// reader who had scrolled the homepage learned nothing new from it. So the plot is gone. What is left is the one
// variable the story keeps fixed, how much enzyme a body builds, put in the reader's hands, and a short list of
// things worth finding out with it.
// The model is first-order elimination and nothing more: what arrives is the drip, and what leaves is
// proportional to the level and to the enzyme this body builds. No milligram, no hour and no patient figure
// appears anywhere on screen.

const TITLE = "Try it — ChemoGuard";
const DESCRIPTION =
  "Give up to five patients the same dose of 5-FU, change how much DPD enzyme each one has, and see where the drug settles in each of them.";

export const Route = createFileRoute("/playground")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
    ],
  }),
  component: Bench,
});

// A body settles where what arrives equals what leaves, so its level is drip / clearance, and clearance is the
// share of the enzyme it builds: K for five of five, 0.4K for two. Everything a reader can find on this page
// follows from that one line. The same drip settles 2.5 times higher at two of five; the drip that suits it is
// two fifths of the first; and at none of five nothing leaves, so there is no level to settle at.
const K = 0.6;
const BAND = { lo: 0.35, hi: 0.75 };
const OVER = 1;
const CEILING = 1.4;
const MAX_BODIES = 5;
/** Ten samples a second, twenty seconds of history. */
const SAMPLES = 200;
/** How long a body has to stay somewhere before the bench counts it as found rather than passed through. */
const SETTLE = 2.5;

type Body = { id: number; enzymes: number };

const clearanceOf = (b: Body) => (b.enzymes / 5) * K;
const inBand = (c: number) => c >= BAND.lo && c <= BAND.hi;
/** The drug's own colour, which is coral everywhere on this site, and red once it is past the line. */
const drugTone = (c: number) => (c > OVER ? C.red : C.coral);
/** The state of the body: the green of a validated result when the level is where it should be. */
const stateTone = (c: number) => (c > OVER ? C.red : inBand(c) ? C.green : C.coral);
// One short word each, so a label keeps to one line over the narrowest glass. "At risk", not "toxic": the
// line marks where the risk of toxicity rises, and this page does not say what happens to anyone.
const wordFor = (c: number) =>
  c > OVER ? "At risk" : inBand(c) ? "In range" : c < BAND.lo ? "Too low" : "Too high";

// The five things to find. Each is a question the story does not answer, and each is ticked by the bench itself
// when the reader has actually done it, so the line that replaces the question is something they have just seen.
const FINDS = [
  {
    id: "steady",
    ask: "Drag the dose slider until Patient 1’s drug level rests in the green band.",
    found:
      "A steady dose settles at a steady level: where what drips in equals what the enzyme breaks down.",
  },
  {
    id: "same",
    ask: "Leave the dose where it is and press Add a patient. This one has only 2 of 5 enzyme.",
    found: "Same dose, less enzyme: here the level settles well above the green.",
  },
  {
    id: "suits",
    ask: "Now lower the dose until the 2-of-5 patient is in the green band.",
    found:
      "A lower dose brought this patient back into range. It would be too low for one with all five.",
  },
  {
    id: "none",
    ask: "Press − under any patient until they have 0 of 5 enzyme.",
    found:
      "With no enzyme, nothing in this sketch breaks the drug down, so the level never settles.",
  },
  {
    id: "four",
    ask: "Add patients until four have different amounts of enzyme, then find a dose that puts two of them in the green.",
    found:
      "No single dose puts them all in range. People with different DPD activity can need different doses.",
  },
] as const;

type FindId = (typeof FINDS)[number]["id"];

/**
 * The most bodies one drip can hold in the green at once.
 *
 * A body is in the band when drip / clearance is, so the bodies one drip can treat together are those whose
 * clearances sit within the band's own ratio, 0.75 / 0.35, of each other. A body that builds nothing is never
 * among them.
 */
function mostTreatable(bodies: readonly Body[]) {
  const ratio = BAND.hi / BAND.lo;
  let best = 0;
  for (const low of bodies) {
    if (low.enzymes === 0) continue;
    const n = bodies.filter(
      (b) => b.enzymes >= low.enzymes && b.enzymes <= low.enzymes * ratio + 1e-9,
    ).length;
    if (n > best) best = n;
  }
  return best;
}

/** The line each body draws on the chart, so five ink lines can be told apart without five colours. */
const DASH = ["", "7 4", "2 4", "11 3 2 3", "1 5"] as const;

/** One drug molecule: the same hexagon the story's vessel is full of. */
function Pip({ tone }: { tone: string }) {
  return (
    <svg width="11" height="12" viewBox="0 0 11 12" aria-hidden="true">
      <polygon
        points="5.5,0.9 10,3.4 10,8.6 5.5,11.1 1,8.6 1,3.4"
        fill={tone}
        stroke={C.ink}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * One body on the bench: a glass the drug fills, and under it the one thing the reader can change about it.
 *
 * A glass rather than a figure, on purpose. The story's patients are two particular people; up to five of the
 * same two faces would read as clones, and a row of glasses against one band and one line is the clearer
 * picture of what this page is about: the same drip, at a different level in every body.
 */
function Glass({
  body,
  index,
  level,
  rate,
  onEnzymes,
  onRemove,
}: {
  body: Body;
  index: number;
  level: number;
  /** How fast the level is changing: positive while it is still filling. */
  rate: number;
  onEnzymes: (n: number) => void;
  onRemove: (() => void) | null;
}) {
  const pct = (v: number) => `${(Math.min(v, CEILING) / CEILING) * 100}%`;
  const drawn = Math.round(Math.min(level, CEILING) * 9);
  const name = `Patient ${index + 1}`;
  const step = {
    fontFamily: DISPLAY,
    background: C.paper,
    color: C.ink,
    border: `2px solid ${C.ink}`,
    borderRadius: R.sm,
  } as const;

  return (
    <div className="flex h-full min-w-0 max-w-[132px] flex-1 flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span
          className="flex items-center gap-1 whitespace-nowrap text-[12px] font-black md:text-[13px]"
          style={{ fontFamily: DISPLAY, color: C.ink }}
        >
          <span className="sm:hidden lg:inline xl:hidden">{index + 1}</span>
          <span className="hidden sm:inline lg:hidden xl:inline">{name}</span>
          {/* this body's line on the chart, so the two can be matched without a legend */}
          <svg width="14" height="4" viewBox="0 0 14 4" aria-hidden="true">
            <line
              x1="0"
              y1="2"
              x2="14"
              y2="2"
              stroke={C.ink}
              strokeWidth="2.5"
              strokeDasharray={DASH[index]}
            />
          </svg>
        </span>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${name}`}
            className="grid h-6 w-6 min-w-6 shrink-0 place-items-center text-[14px] font-bold leading-none"
            style={{ color: C.inkNote }}
          >
            ×
          </button>
        )}
      </div>

      {/* Head and shoulders over the glass, so the pair reads as a person before the intro has been read: the
          glass is the body, and the drug is in it. It needs the height, so the shortest screens go without. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 44 30"
        className="-mb-1.5 hidden h-[30px] w-[44px] shrink-0 self-center [@media(min-height:700px)]:block"
      >
        <path
          d="M3 30 C3 21 10 17 22 17 C34 17 41 21 41 30"
          fill={C.paper}
          stroke={C.ink}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="22" cy="9" r="7.2" fill={C.paper} stroke={C.ink} strokeWidth="2.5" />
      </svg>

      <div
        className="relative min-h-0 w-full flex-1 overflow-hidden"
        aria-hidden="true"
        style={{
          background: C.paper,
          // the glass answers when the level crosses the line, so the reader need not be reading the word
          border: `2.5px solid ${level > OVER ? C.red : C.ink}`,
          borderRadius: R.md,
        }}
      >
        <span
          className="absolute inset-x-0 block"
          style={{
            bottom: pct(BAND.lo),
            height: pct(BAND.hi - BAND.lo),
            background: `${C.green}24`,
            borderTop: `1.5px dashed ${C.green}`,
            borderBottom: `1.5px dashed ${C.green}`,
          }}
        />
        <span
          className="absolute inset-x-0 block"
          style={{ bottom: pct(OVER), height: 2, background: C.red }}
        />
        <span
          className="absolute inset-x-0 bottom-0 block"
          style={{ height: pct(level), background: `${drugTone(level)}26` }}
        />
        {/* Molecules are placed from the index rather than at random, so each keeps its lane as the level moves. */}
        {Array.from({ length: drawn }, (_, i) => (
          <span
            key={i}
            className="absolute block"
            style={{
              left: `${4 + ((i * 53 + 17) % 74)}%`,
              bottom: `calc(${pct(level)} * ${(4 + ((i * 37 + 29) % 88)) / 100})`,
            }}
          >
            <Pip tone={drugTone(level)} />
          </span>
        ))}
        {/* which way the level is still heading, so a reader waiting on it can see it has not settled */}
        {Math.abs(rate) > 0.012 && level < CEILING && (
          <span
            className="absolute left-1/2 -translate-x-1/2 text-[11px] font-black leading-none"
            style={{ bottom: `calc(${pct(level)} + 2px)`, color: C.ink }}
          >
            {rate > 0 ? "▲" : "▼"}
          </span>
        )}
      </div>

      {/* Colour marks the state; the word carries it. The palette's green and red are both under 4.5:1 as type
          on cream, and a reader who cannot separate the two hues would otherwise have nothing to read. */}
      <span
        className="flex items-start gap-1 whitespace-nowrap text-[11.5px] font-bold leading-tight md:text-[13px]"
        style={{ color: C.ink }}
      >
        <span
          aria-hidden="true"
          className="mt-[1px] block h-2.5 w-2.5 shrink-0"
          style={{ background: stateTone(level), border: `1.5px solid ${C.ink}` }}
        />
        {wordFor(level)}
      </span>

      {/* The one thing about this patient the reader can change, named where it is changed. */}
      <span className="text-[10.5px] font-semibold leading-none" style={{ color: C.inkBody }}>
        <span className="sm:hidden">Enzyme</span>
        <span className="hidden sm:inline">DPD enzyme</span>
      </span>

      {/* The story's own five slots, and how many this body fills. */}
      <span className="hidden items-end gap-0.5 sm:flex" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} style={{ opacity: i < body.enzymes ? 1 : 0.4 }}>
            <Enzyme s={0.15} tone={i < body.enzymes ? C.green : "transparent"} line={C.ink} />
          </span>
        ))}
      </span>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => onEnzymes(body.enzymes - 1)}
          disabled={body.enzymes === 0}
          aria-label={`${name}: less enzyme`}
          className="grid h-6 w-6 shrink-0 place-items-center text-[15px] sm:h-7 sm:w-7 font-bold leading-none disabled:opacity-35"
          style={step}
        >
          −
        </button>
        <span
          className="whitespace-nowrap text-[12px] font-bold md:text-[13px]"
          style={{ color: C.ink }}
        >
          {body.enzymes}
          <span className="hidden sm:inline lg:hidden xl:inline"> of 5</span>
          <span className="sr-only sm:hidden lg:inline xl:hidden"> of 5</span>
        </span>
        <button
          type="button"
          onClick={() => onEnzymes(body.enzymes + 1)}
          disabled={body.enzymes === 5}
          aria-label={`${name}: more enzyme`}
          className="grid h-6 w-6 shrink-0 place-items-center text-[15px] sm:h-7 sm:w-7 font-bold leading-none disabled:opacity-35"
          style={step}
        >
          +
        </button>
      </div>
    </div>
  );
}

/**
 * The bench's record, drawing itself: one line per body, under the one drip they all share.
 *
 * Samples the bench has not taken for a body, because it was added later, are gaps rather than zeroes, so a new
 * body's line starts where it joined instead of pretending it was there all along.
 */
function Trace({ lines }: { lines: (number | null)[][] }) {
  const W = 1000;
  const H = 150;
  const y = (v: number) => H - (Math.min(v, CEILING) / CEILING) * H;
  const path = (xs: (number | null)[]) => {
    let d = "";
    let pen = false;
    xs.forEach((v, i) => {
      if (v === null) {
        pen = false;
        return;
      }
      d += `${pen ? "L" : "M"}${((i / (SAMPLES - 1)) * W).toFixed(1)},${y(v).toFixed(1)} `;
      pen = true;
    });
    return d;
  };
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="block h-full w-full"
      role="img"
      aria-label="A chart of every body's level over the last twenty seconds, drawn as you work."
      style={{ background: C.paper, border: `2px solid ${C.ink}`, borderRadius: R.sm }}
    >
      <rect x="0" y={y(BAND.hi)} width={W} height={y(BAND.lo) - y(BAND.hi)} fill={`${C.green}24`} />
      {[BAND.lo, BAND.hi].map((v) => (
        <line
          key={v}
          x1="0"
          y1={y(v)}
          x2={W}
          y2={y(v)}
          stroke={C.green}
          strokeWidth="1.5"
          strokeDasharray="6 5"
          vectorEffect="non-scaling-stroke"
        />
      ))}
      <line
        x1="0"
        y1={y(OVER)}
        x2={W}
        y2={y(OVER)}
        stroke={C.red}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
      {lines.map((xs, i) => (
        <path
          key={i}
          d={path(xs)}
          fill="none"
          stroke={C.ink}
          strokeWidth="2.2"
          strokeLinejoin="round"
          strokeDasharray={DASH[i]}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}

function Bench() {
  const nextId = useRef(2);
  const [bodies, setBodies] = useState<Body[]>([{ id: 1, enzymes: 5 }]);
  const [drip, setDrip] = useState(0);
  const [found, setFound] = useState<Partial<Record<FindId, string>>>({});

  // The run. Levels and samples live in refs and are integrated once per frame on the page's shared ticker, the
  // same clock the rest of the site animates on, so this adds no second loop. `useTime` re-renders each frame,
  // which is what paints the glasses; only a new find is state, because only that changes what the page says.
  const level = useRef<Record<number, number>>({});
  const trace = useRef<Record<number, (number | null)[]>>({});
  const samples = useRef(0);
  const sampleIn = useRef(0);
  const held = useRef<Record<FindId, number>>({ steady: 0, same: 0, suits: 0, none: 0, four: 0 });
  const last = useRef(0);
  const t = useTime(true);

  if (t !== last.current) {
    const dt = Math.min(0.05, t - last.current);
    last.current = t;
    for (const b of bodies) {
      const c = level.current[b.id] ?? 0;
      // what arrives, less what this body clears: proportional to the level, and to the enzyme it builds
      level.current[b.id] = Math.max(0, Math.min(CEILING, c + (drip - clearanceOf(b) * c) * dt));
    }

    // What the reader has found. Each needs to be held for a moment, so that a level passing through the band on
    // its way somewhere else is not counted as having been put there.
    const at = (b: Body) => level.current[b.id] ?? 0;
    const full = bodies.filter((b) => b.enzymes === 5);
    const two = bodies.filter((b) => b.enzymes === 2);
    const distinct = new Set(bodies.map((b) => b.enzymes)).size;
    const treated = bodies.filter((b) => inBand(at(b))).length;
    const best = mostTreatable(bodies);
    const now: Record<FindId, boolean> = {
      steady: full.some((b) => inBand(at(b))),
      // "that drip" is one that treats five of five, which is 0.35K to 0.75K
      same: drip >= BAND.lo * K && drip <= BAND.hi * K && two.some((b) => at(b) > BAND.hi),
      suits: two.some((b) => inBand(at(b))),
      none: bodies.some((b) => b.enzymes === 0 && at(b) > OVER),
      // two in the green at once is enough to have seen it; the best possible is reported, not demanded
      four: bodies.length >= 4 && distinct >= 4 && treated >= Math.min(2, best),
    };
    for (const f of FINDS) {
      held.current[f.id] = now[f.id] ? held.current[f.id] + dt : 0;
      if (held.current[f.id] >= SETTLE && !found[f.id]) {
        const line = f.id === "four" ? `${best} of ${bodies.length} at best. ${f.found}` : f.found;
        setFound((was) => (was[f.id] ? was : { ...was, [f.id]: line }));
      }
    }

    // Ten samples a second is enough for a smooth curve and a twentieth of the points a frame would give.
    sampleIn.current -= dt;
    if (sampleIn.current <= 0) {
      sampleIn.current = 0.1;
      samples.current = Math.min(SAMPLES, samples.current + 1);
      for (const b of bodies) {
        const line = (trace.current[b.id] ??= []);
        line.push(at(b));
        if (line.length > SAMPLES) line.shift();
      }
    }
  }

  const addBody = () => {
    if (bodies.length >= MAX_BODIES) return;
    const id = nextId.current++;
    // a body that joins now has no past: its line starts here, as a gap up to this sample
    trace.current[id] = Array.from({ length: samples.current }, () => null);
    // the next amount down that is not on the bench yet, so each new body is a new case rather than a repeat
    const taken = new Set(bodies.map((b) => b.enzymes));
    const enzymes = [2, 3, 4, 1, 0, 5].find((n) => !taken.has(n)) ?? 2;
    setBodies((bs) => [...bs, { id, enzymes }]);
  };
  const removeBody = (id: number) => {
    delete level.current[id];
    delete trace.current[id];
    setBodies((bs) => bs.filter((b) => b.id !== id));
  };
  const clear = () => {
    level.current = {};
    trace.current = {};
    samples.current = 0;
    held.current = { steady: 0, same: 0, suits: 0, none: 0, four: 0 };
    setDrip(0);
    setBodies([{ id: nextId.current++, enzymes: 5 }]);
    setFound({});
  };

  const done = FINDS.filter((f) => found[f.id]).length;
  const next = FINDS.find((f) => !found[f.id]);
  /** How far the step in hand is towards being counted, 0 to 1. */
  const holding = next ? Math.min(1, held.current[next.id] / SETTLE) : 0;
  const latest = [...FINDS].reverse().find((f) => found[f.id]);
  const button = {
    fontFamily: DISPLAY,
    border: `2.5px solid ${C.ink}`,
    borderRadius: R.sm,
    boxShadow: `3px 3px 0 ${C.ink}`,
  } as const;

  return (
    // One screen, and nothing scrolls: the glasses, the drip and the record are in view together, because the
    // point of changing something is seeing what it does.
    <div
      className="flex h-[100dvh] flex-col overflow-hidden"
      style={{ background: C.paper, color: C.ink }}
    >
      <SiteHeader />

      <main className="mx-auto grid min-h-0 w-full max-w-[68rem] flex-1 grid-cols-1 grid-rows-[auto_minmax(132px,1fr)_auto_auto_auto] gap-x-14 gap-y-2.5 overflow-y-auto px-5 py-2 sm:py-3 md:px-10 md:py-5 lg:grid-cols-[minmax(0,1fr)_25rem] lg:grid-rows-[minmax(0,1fr)] lg:items-center lg:py-3">
        {/* The bench itself. On a phone this is the row that gives way; on a wide screen it has a height of its
            own and sits centred beside the panel. */}
        <div className="order-2 flex min-h-0 items-stretch justify-center -mx-3 gap-1 sm:mx-0 sm:gap-2 md:gap-3 lg:order-none lg:h-full lg:max-h-[480px] lg:self-center">
          {bodies.map((b, i) => (
            <Glass
              key={b.id}
              body={b}
              index={i}
              level={level.current[b.id] ?? 0}
              rate={drip - clearanceOf(b) * (level.current[b.id] ?? 0)}
              onEnzymes={(n) =>
                setBodies((bs) =>
                  bs.map((x) =>
                    x.id === b.id ? { ...x, enzymes: Math.max(0, Math.min(5, n)) } : x,
                  ),
                )
              }
              onRemove={bodies.length > 1 ? () => removeBody(b.id) : null}
            />
          ))}
        </div>

        {/* The panel. On a phone its parts are laid straight into the page's grid, around the bench; on a wide
            screen they are one column with a width of its own, so nothing in it is stretched to fit. */}
        <div className="contents lg:flex lg:flex-col lg:gap-4">
          <div className="order-1 lg:order-none">
            <h1
              // the shortest phones keep the heading for a screen reader and give its line to the glasses
              className="font-black leading-none max-lg:[@media(max-height:600px)]:sr-only"
              style={{
                fontFamily: DISPLAY,
                fontSize: "clamp(1.35rem, 2vw, 1.7rem)",
                letterSpacing: "-0.03em",
                color: C.ink,
              }}
            >
              Same dose. Different bodies.
            </h1>
            <p
              className="mt-1.5 max-w-[52ch] text-[13.5px] leading-snug max-lg:[@media(max-height:600px)]:hidden md:mt-2 md:text-[15px]"
              style={{ color: C.inkBody }}
            >
              Each glass is a patient on the chemotherapy drug 5-FU. The dose drips in, and the
              patient’s DPD enzyme breaks it down. You set both.
            </p>
            {/* What the two marks in every glass mean. Without this the band and the line are decoration. */}
            <ul
              className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-[11.5px] font-semibold md:text-[12.5px]"
              style={{ color: C.ink }}
            >
              <li className="flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="block h-2.5 w-4"
                  style={{
                    background: `${C.green}24`,
                    borderTop: `1.5px dashed ${C.green}`,
                    borderBottom: `1.5px dashed ${C.green}`,
                  }}
                />
                <span className="sm:hidden">Green: the level aimed for</span>
                <span className="hidden sm:inline">Green band: the level aimed for</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="block h-[2px] w-4"
                  style={{ background: C.red }}
                />
                <span className="sm:hidden">Red line: higher risk</span>
                <span className="hidden sm:inline">
                  Above the red line: higher risk of toxicity
                </span>
              </li>
            </ul>
          </div>

          {/* What to do now. One instruction at a time, in the reader's own terms and naming the control to use:
              a list of five questions beside an unlabelled tool told nobody where to start. */}
          <div className="order-3 lg:order-none">
            <div
              className="px-3 py-2 md:px-3.5 md:py-2.5"
              style={{
                background: `${C.coral}1f`,
                border: `2.5px solid ${C.ink}`,
                borderRadius: R.md,
              }}
            >
              <p className={L.note} style={{ color: C.inkBody }}>
                {next
                  ? `Try this · step ${done + 1} of ${FINDS.length}${holding > 0 ? " · hold it there" : ""}`
                  : "What you just showed"}
              </p>
              {next ? (
                <p
                  className="mt-0.5 text-[13.5px] font-bold leading-snug md:text-[15.5px]"
                  style={{ color: C.ink }}
                >
                  {next.ask}
                </p>
              ) : (
                // What the five steps add up to, in the words the science review settled on: a result can inform
                // a dose under clinical guidelines, and it does not set one. The link goes to where the wiki
                // makes that case with its sources.
                <p
                  className="mt-0.5 text-[13px] font-bold leading-snug md:text-[14.5px]"
                  style={{ color: C.ink }}
                >
                  Same dose, different levels, and you could see why only because each patient’s
                  enzyme was on show. Before treatment it is not, unless it is tested for.{" "}
                  <Link to="/description" hash="testing" className="underline underline-offset-2">
                    Why testing first matters
                  </Link>
                  .
                </p>
              )}
              {/* A step is counted once its state has held for a moment. The bar shows that count running, so a
                  reader who has got there does not move on a second too early. */}
              {next && (
                <span
                  aria-hidden="true"
                  className="mt-1.5 block h-[3px]"
                  style={{ background: `${C.ink}22` }}
                >
                  <span
                    className="block h-full"
                    style={{ width: `${holding * 100}%`, background: C.ink }}
                  />
                </span>
              )}
            </div>

            {/* What each step showed. The whole list needs a wide screen at least 900px tall; anywhere shorter
                or narrower only the latest is kept, and it gives way to the conclusion at the end. The class is
                written out whole because Tailwind only builds what it can read. */}
            <ol className="mt-2 hidden space-y-1 lg:[@media(min-height:900px)]:block">
              {FINDS.filter((f) => found[f.id]).map((f) => (
                <li
                  key={f.id}
                  className="flex gap-2 text-[13px] leading-snug"
                  style={{ color: C.ink }}
                >
                  <span
                    aria-hidden="true"
                    className="mt-[3px] grid h-3.5 w-3.5 shrink-0 place-items-center text-[10px] font-black leading-none"
                    style={{ background: C.green, border: `1.5px solid ${C.ink}` }}
                  >
                    ✓
                  </span>
                  {found[f.id]}
                </li>
              ))}
            </ol>
            {latest && next && (
              <p
                className="mt-1 text-[12.5px] font-semibold leading-snug lg:[@media(min-height:900px)]:hidden"
                style={{ color: C.ink }}
              >
                <span aria-hidden="true">✓ </span>
                {found[latest.id]}
              </p>
            )}

            <p aria-live="polite" className="sr-only">
              {latest ? `Found: ${found[latest.id]}` : ""}
            </p>
          </div>

          <div className="order-4 lg:order-none">
            <label
              className={`${L.note} block max-lg:[@media(max-height:600px)]:sr-only`}
              style={{ color: C.inkNote }}
              htmlFor="drip"
            >
              The dose<span className="hidden sm:inline"> — the same for every patient</span>
            </label>
            <input
              id="drip"
              type="range"
              min={0}
              max={50}
              step={1}
              value={Math.round(drip * 100)}
              onChange={(e) => setDrip(Number(e.target.value) / 100)}
              className="mt-1 h-6 w-full"
              style={{ accentColor: C.redDeep }}
            />
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={addBody}
                disabled={bodies.length >= MAX_BODIES}
                className="px-3.5 py-1.5 text-[13px] font-bold disabled:opacity-40 md:text-[14px]"
                style={{ ...button, background: C.redDeep, color: "#fff" }}
              >
                Add a patient
              </button>
              <button
                type="button"
                onClick={clear}
                className="px-3.5 py-1.5 text-[13px] font-bold md:text-[14px]"
                style={{ ...button, background: C.paper, color: C.ink }}
              >
                Start again
              </button>
            </div>
          </div>

          <div className="order-5 flex min-h-0 flex-col max-lg:[@media(max-height:660px)]:hidden lg:order-none">
            <span className={L.note} style={{ color: C.inkNote, display: "block" }}>
              Drug level over time — one line per patient
            </span>
            <div className="mt-1 h-[58px] min-h-0 sm:h-[84px] lg:h-[clamp(60px,12vh,140px)]">
              <Trace lines={bodies.map((b) => trace.current[b.id] ?? [])} />
            </div>
          </div>
        </div>
      </main>

      {/* The licence and the repository, which iGEM asks for on every page. The full footer would be a second
          screen, so this page carries the two links and its own caveat on one line instead. */}
      <footer
        className="shrink-0 px-5 pb-2 pt-1 text-[11px] leading-snug md:px-10 md:text-[12px]"
        style={{ color: C.inkNote }}
      >
        Conceptual illustration, not a quantitative pharmacokinetic model
        <span className="hidden sm:inline">
          : a scale, not milligrams, and here the enzyme is the only route out
        </span>
        . Licensed under{" "}
        <a href={WIKI.license.url} rel="license" className="underline underline-offset-2">
          CC BY 4.0
        </a>
        . Source at{" "}
        <a href={WIKI.repo} className="underline underline-offset-2">
          {WIKI.repo.replace("https://", "")}
        </a>
        .
      </footer>
    </div>
  );
}
