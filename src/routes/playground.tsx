import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";

import { Enzyme } from "@/components/hero/elements";
import { asset, C, DISPLAY, L, R } from "@/components/hero/palette";
import { useTime } from "@/hooks/use-scroll-progress";
import { SiteHeader } from "@/components/story/SiteHeader";
import { WIKI } from "@/lib/wiki";

// The play area: two bloodstreams running live, and one valve in the reader's hand.
// The story tells them a standard dose is a gamble. Here they hold the drip themselves and find out — the rate
// that brings one person into the treating range drives the other past it, because each body clears the drug at
// its own rate. Twenty seconds of trying teaches what a paragraph only asserts.
// The model is first-order elimination and nothing more: what arrives is the rate you set, and what leaves is
// proportional to how much is there and to how much enzyme this body builds. That is the textbook shape of the
// mechanism. No milligram, no hour and no patient figure appears anywhere on screen.

const TITLE = "Play — ChemoGuard";
const DESCRIPTION =
  "Hold the drip for two people at once. One valve, two bodies that clear the drug at different rates, and no setting that suits both.";

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
  component: Playground,
});

// Two people, and the arithmetic that makes one valve unwinnable.
// A body settles where what arrives equals what leaves, so its level is rate / clearance. A builds five enzymes
// of five and clears at K; B builds two and clears at 0.4K, so at any shared rate B settles two and a half times
// higher. Treating is 0.35 to 0.75, which asks a rate of 0.21–0.45 for A and 0.084–0.18 for B: two windows that
// do not touch. Set the drip where A is treated and B crosses the line at 1.0.
const K = 0.6;
/** What arrives while the drip is open.
 *  Held without pause, a body settles at IN / clearance: A at 0.36/0.6 = 0.60, the middle of the treating band,
 *  and B at 0.36/0.24 = 1.50, half again past the line. So A can simply be held, while B needs the drip open
 *  about four seconds in ten — and with one button between them, holding A in range at 58% of the time puts B
 *  at 0.87, above the band. There is no duty cycle that suits both, which is the point of the first round. */
const IN = 0.36;
/** Seconds a body may spend past the line before the run ends. */
const HARM = 4;
/** How much of the run the trace keeps: ten samples a second, twenty seconds of history. */
const SAMPLES = 200;
const BAND = { lo: 0.35, hi: 0.75 };
const OVER = 1;
const CEILING = 1.4;
/** Hold both inside the treating range for this long and the run is won. */
const GOAL = 8;

const PEOPLE = [
  { id: "a", name: "Patient A", enzymes: 5, dpd: "Normal DPD activity", plate: "patient-a.webp" },
  { id: "b", name: "Patient B", enzymes: 2, dpd: "Reduced DPD activity", plate: "patient-b.webp" },
] as const;

type Person = (typeof PEOPLE)[number];

const clearanceOf = (p: Person) => (p.enzymes / 5) * K;
const inBand = (c: number) => c >= BAND.lo && c <= BAND.hi;
/** The drug's own colour, which is coral everywhere on this site, and red once it is past the line. */
const drugTone = (c: number) => (c > OVER ? C.red : C.coral);
/** The state of the body, which is the green of a validated result when the level is where it should be. */
const stateTone = (c: number) => (c > OVER ? C.red : inBand(c) ? C.green : C.coral);
const wordFor = (c: number) =>
  c > OVER ? "Past the line" : inBand(c) ? "Treating" : c < BAND.lo ? "Not enough" : "Too much";

// What a result may say, and what it may not. The client's science review drew this line and the page keeps it:
// a test reports what it found, published guidance turns that into a starting dose, and a clinician decides.
const REPORTS = [
  {
    id: "sets",
    text: "Reduce the dose by half.",
    ok: false,
    why: "A test reports what it measured. It does not prescribe — the dose is a clinical decision taken under guidelines.",
  },
  {
    id: "informs",
    text: "Variant detected. Guidelines recommend considering a reduced starting dose.",
    ok: true,
    why: "This is what a result can carry: what was found, and what published guidance says to consider. The decision stays with the clinician.",
  },
  {
    id: "safe",
    text: "No variant detected — safe to treat.",
    ok: false,
    why: "A negative result is not a promise. This test looks for particular variants, and toxicity has other causes it never sees.",
  },
] as const;

/** One drug molecule, at the size this column can hold: the same hexagon the story's vessel is full of. */
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
 * A person, with the drug inside them.
 *
 * The same technique the story's two-patient scene uses: the plate's own alpha masks a bottom-up gradient, so
 * the tint is inside the silhouette rather than a rectangle laid over it. The figure settles and tilts as the
 * load climbs — the body answering before the reader has read a word — and the tint turns from coral to red as
 * it passes the line.
 */
function Figure({ person, level }: { person: Person; level: number }) {
  const load = Math.min(1, Math.max(0, (level - BAND.hi) / (CEILING - BAND.hi)));
  const fill = Math.min(100, (level / CEILING) * 100);
  const tint =
    level > OVER ? C.red : `color-mix(in oklab, ${C.red} ${(load * 70).toFixed(0)}%, ${C.coral})`;
  const src = asset(person.plate);
  const mask = {
    maskImage: `url(${src})`,
    WebkitMaskImage: `url(${src})`,
    maskSize: "contain",
    WebkitMaskSize: "contain",
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
    maskPosition: "bottom center",
    WebkitMaskPosition: "bottom center",
  } as const;

  return (
    <div className="relative h-full min-w-0 max-w-[168px] flex-1" aria-hidden="true">
      <div
        className="relative h-full"
        style={{
          transform: `translateY(${(load * 7).toFixed(1)}px) rotate(${(load * 1.1).toFixed(2)}deg)`,
          transformOrigin: "50% 100%",
        }}
      >
        <img
          src={src}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full select-none object-contain object-bottom"
        />
        <div
          className="absolute inset-0"
          style={{
            ...mask,
            background: `linear-gradient(to top, ${tint} 0%, ${tint} ${fill}%, transparent ${Math.min(100, fill + 14)}%)`,
            opacity: 0.46 + load * 0.3,
            mixBlendMode: "multiply",
          }}
        />
      </div>
    </div>
  );
}

/**
 * A steady rate for one person, once a result says what that person can take.
 *
 * The first round is held by hand, because without a result there is nothing to set it to and the reader has to
 * juggle. This round is a dial you set and leave: that is the difference a test makes, and it is worth the
 * control changing under the reader's hands to say so.
 */
function Valve({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="min-w-0 flex-1">
      <label className={L.note} style={{ color: C.inkNote, display: "block" }} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={50}
        step={1}
        value={Math.round(value * 100)}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="mt-3 w-full"
        style={{ accentColor: C.redDeep }}
      />
    </div>
  );
}

/**
 * The stand beside the patient: a bag of the drug, the line down to the arm, and the cannula at the end of it.
 *
 * The story draws the same hardware in its two-patient scene, for the same reason — a figure with a drip in
 * their arm is a patient, and a figure without one is a drawing of a person.
 */
function Stand({ flowing, tone }: { flowing: boolean; tone: string }) {
  // Placed in fractions of the stand's own height, because the stage gives the patients whatever is left of the
  // screen and a stand measured in pixels would come apart from the figure the moment that changed.
  return (
    <div className="relative h-full w-[20px] shrink-0 md:w-[26px]" aria-hidden="true">
      <span
        className="absolute left-1/2 top-0 block -translate-x-1/2"
        style={{
          width: 16,
          height: "12%",
          minHeight: 12,
          background: `${tone}4d`,
          border: `2px solid ${C.ink}`,
          borderRadius: 3,
        }}
      />
      <span
        className="absolute left-1/2 block -translate-x-1/2"
        style={{ top: "12%", width: 2, height: "40%", background: `${C.ink}59` }}
      />
      <span
        className="absolute left-1/2 block -translate-x-1/2"
        style={{
          top: "52%",
          width: 12,
          height: 6,
          background: C.paper,
          border: `1.5px solid ${C.ink}`,
          borderRadius: 2,
        }}
      />
      {flowing &&
        [0, 1].map((i) => (
          <span
            key={i}
            className="pg-drop absolute left-1/2 block"
            style={{ animationDelay: `${i * 0.35}s` }}
          >
            <Pip tone={tone} />
          </span>
        ))}
    </div>
  );
}

/**
 * The scale the figure is filling against: the treating band, the line, and where this body is right now.
 *
 * The figure alone cannot say "between 0.35 and 0.75" — it can only say "filling". This is the instrument
 * beside the patient, and it is what the reader actually aims with.
 */
function Gauge({ level }: { level: number }) {
  const pct = (v: number) => `${(Math.min(v, CEILING) / CEILING) * 100}%`;
  return (
    <div
      className="relative w-6 shrink-0 overflow-hidden md:w-9"
      aria-hidden="true"
      style={{ background: C.paper, border: `2px solid ${C.ink}`, borderRadius: R.sm }}
    >
      <span
        className="absolute inset-x-0 block"
        style={{
          bottom: pct(BAND.lo),
          height: pct(BAND.hi - BAND.lo),
          background: `${C.green}2e`,
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
        style={{ height: pct(level), background: `${drugTone(level)}5c` }}
      />
      <span
        className="absolute inset-x-0 block"
        style={{ bottom: pct(level), height: 3, background: level > OVER ? C.red : C.ink }}
      />
    </div>
  );
}

/**
 * The run, drawing itself.
 *
 * Two lines under one identical input: this is the whole argument as a figure, and the reader's own hand draws
 * it. Samples are taken ten times a second and the last stretch is kept, so the chart scrolls rather than
 * shrinking — a curve that keeps rescaling cannot be read while you are playing.
 */
function Trace({ a, b, tested }: { a: number[]; b: number[]; tested: boolean[] }) {
  const W = 1000;
  const H = 150;
  const y = (v: number) => H - (Math.min(v, CEILING) / CEILING) * H;
  const path = (xs: number[]) =>
    xs.length < 2
      ? ""
      : xs
          .map(
            (v, i) =>
              `${i === 0 ? "M" : "L"}${((i / (SAMPLES - 1)) * W).toFixed(1)},${y(v).toFixed(1)}`,
          )
          .join(" ");
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="block h-full w-full"
      role="img"
      aria-label="A chart of both levels over the last twenty seconds, drawn as you play."
      style={{ background: C.paper, border: `2px solid ${C.ink}`, borderRadius: R.sm }}
    >
      <rect x="0" y={y(BAND.hi)} width={W} height={y(BAND.lo) - y(BAND.hi)} fill={`${C.green}24`} />
      <line
        x1="0"
        y1={y(BAND.lo)}
        x2={W}
        y2={y(BAND.lo)}
        stroke={C.green}
        strokeWidth="1.5"
        strokeDasharray="6 5"
        vectorEffect="non-scaling-stroke"
      />
      <line
        x1="0"
        y1={y(BAND.hi)}
        x2={W}
        y2={y(BAND.hi)}
        stroke={C.green}
        strokeWidth="1.5"
        strokeDasharray="6 5"
        vectorEffect="non-scaling-stroke"
      />
      <line
        x1="0"
        y1={y(OVER)}
        x2={W}
        y2={y(OVER)}
        stroke={C.red}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
      {/* where the reader stopped guessing */}
      {tested.indexOf(true) > 0 && (
        <line
          x1={(tested.indexOf(true) / (SAMPLES - 1)) * W}
          y1="0"
          x2={(tested.indexOf(true) / (SAMPLES - 1)) * W}
          y2={H}
          stroke={C.ink}
          strokeWidth="1.5"
          strokeDasharray="4 4"
          opacity="0.6"
          vectorEffect="non-scaling-stroke"
        />
      )}
      <path
        d={path(a)}
        fill="none"
        stroke={C.ink}
        strokeWidth="2.5"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d={path(b)}
        fill="none"
        stroke={C.redDeep}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeDasharray="7 4"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** One person's readout, kept to two lines and a bar so the whole run fits one screen. */
function Readout({
  person,
  level,
  harm,
  tested,
}: {
  person: Person;
  level: number;
  harm: number;
  tested: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <div className="flex flex-wrap items-center justify-between gap-x-2">
        <span
          className="text-[14px] font-black md:text-[16px]"
          style={{ fontFamily: DISPLAY, color: C.ink }}
        >
          {person.name}
        </span>
        {/* Colour marks the state; the word carries it. The palette's green and red are both under 4.5:1 as
            type on cream, and a reader who cannot separate the two hues would otherwise have nothing to read. */}
        <span
          className="flex items-center gap-1.5 text-[13px] font-bold md:text-[14px]"
          style={{ color: C.ink }}
        >
          <span
            aria-hidden="true"
            className="block h-2.5 w-2.5 shrink-0"
            style={{ background: stateTone(level), border: `1.5px solid ${C.ink}` }}
          />
          {wordFor(level)}
        </span>
      </div>

      {/* What the test found, in the story's own five slots. The line keeps its height before the test too, so
          revealing it does not shove the rest of the screen down. */}
      <div className="flex min-h-[38px] flex-col justify-center gap-0.5">
        {tested ? (
          <>
            <span className="flex shrink-0 items-end gap-0.5" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((i) => (
                <span key={i} style={{ opacity: i < person.enzymes ? 1 : 0.45 }}>
                  <Enzyme
                    s={0.2}
                    tone={i < person.enzymes ? C.green : "transparent"}
                    line={C.ink}
                  />
                </span>
              ))}
            </span>
            <span
              className="whitespace-nowrap text-[11.5px] leading-tight md:text-[13px]"
              style={{ color: C.inkBody }}
            >
              {person.enzymes} of 5 · {person.dpd}
            </span>
          </>
        ) : (
          <span className={L.note} style={{ color: C.inkNote }}>
            not tested
          </span>
        )}
      </div>

      {/* What the time past the line has cost. It only ever grows, which is the honest shape of it: a body does
          not un-accumulate the drug it could not clear. The track is always there, so the bar has somewhere to
          appear without moving anything. */}
      <span className="block h-[5px] w-full" style={{ background: `${C.ink}14`, borderRadius: 2 }}>
        <span
          className="block h-full"
          style={{ width: `${(harm / HARM) * 100}%`, background: C.red, borderRadius: 2 }}
        />
      </span>
    </div>
  );
}

/**
 * The drip, held open by hand.
 *
 * A dial would let the reader set a number and watch. Holding is the point of the first round: the drug arrives
 * only while the button is down, and the moment it is released each body starts clearing at its own rate. That
 * difference is what this page exists to teach, and it is felt in the thumb rather than read off a scale.
 *
 * Pointer capture rather than onPointerLeave, so sliding a thumb off the button does not strand it open. Space
 * and Enter hold it too: a control only a mouse can work is not a control.
 */
function Drip({
  id,
  label,
  open,
  setOpen,
}: {
  id: string;
  label: string;
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  return (
    <div className="min-w-0 flex-1">
      <span className={L.note} style={{ color: C.inkNote, display: "block" }}>
        {label}
      </span>
      <button
        id={id}
        type="button"
        aria-pressed={open}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          setOpen(true);
        }}
        onPointerUp={() => setOpen(false)}
        onPointerCancel={() => setOpen(false)}
        onKeyDown={(e) => {
          if ((e.key === " " || e.key === "Enter") && !e.repeat) {
            e.preventDefault();
            setOpen(true);
          }
        }}
        onKeyUp={(e) => {
          if (e.key === " " || e.key === "Enter") setOpen(false);
        }}
        onBlur={() => setOpen(false)}
        className="mt-2 w-full touch-none select-none px-5 py-3.5 text-[15px] font-bold"
        style={{
          fontFamily: DISPLAY,
          background: open ? C.redDeep : C.paper,
          color: open ? "#fff" : C.ink,
          border: `2.5px solid ${C.ink}`,
          borderRadius: R.sm,
          // pressed in, rather than standing proud: the shadow is the affordance everywhere else on this site
          boxShadow: open ? "none" : `4px 4px 0 ${C.ink}`,
          transform: open ? "translate(2px, 2px)" : "none",
        }}
      >
        {open ? "Flowing" : "Hold to open the drip"}
      </button>
    </div>
  );
}

function Playground() {
  // One drip for both, which is what standard dosing is, until the reader tests and earns a second one.
  const [open, setOpen] = useState({ a: false, b: false });
  const [dose, setDose] = useState({ a: 0.18, b: 0.08 });
  const [tested, setTested] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [won, setWon] = useState(false);
  const [lost, setLost] = useState<string | null>(null);

  const over = won || lost !== null;
  // Held by hand in the first round; set and left in the second.
  const flowing = (p: Person) => !over && (tested ? dose[p.id] > 0.01 : open.a);
  const rateFor = (p: Person) => (over ? 0 : tested ? dose[p.id] : open.a ? IN : 0);

  // The run. Levels live in refs and are integrated once per frame on the page's shared ticker — the same clock
  // the rest of the site animates on, so this adds no second loop. `useTime` re-renders each frame, which is
  // what paints the columns; only the win is state, because only the win changes the page.
  const level = useRef({ a: 0, b: 0 });
  const harm = useRef({ a: 0, b: 0 });
  const trace = useRef<{ a: number[]; b: number[]; tested: boolean[] }>({
    a: [],
    b: [],
    tested: [],
  });
  const sampleIn = useRef(0);
  const held = useRef(0);
  const best = useRef(0);
  const last = useRef(0);
  const elapsed = useRef(0);
  const t = useTime(true);

  // Once the run is won or lost, nothing moves again until it is replayed. The reader is meant to look at what
  // happened: letting the levels drain away after "both treated" left a screen that contradicted its own line.
  if (t !== last.current && over) last.current = t;
  if (t !== last.current) {
    const dt = Math.min(0.05, t - last.current);
    last.current = t;
    elapsed.current += dt;
    let all = true;
    for (const p of PEOPLE) {
      const c = level.current[p.id];
      // what arrives, less what this body clears: proportional to the level, and to the enzyme it builds
      const next = Math.max(0, Math.min(CEILING, c + (rateFor(p) - clearanceOf(p) * c) * dt));
      level.current[p.id] = next;
      if (!inBand(next)) all = false;
      // Time spent past the line is the one thing that does not undo itself. It is what a body that cannot clear
      // the drug actually accumulates, and it is why this run can be lost as well as won.
      if (!over) {
        harm.current[p.id] = Math.min(HARM, harm.current[p.id] + (next > OVER ? dt : 0));
        if (harm.current[p.id] >= HARM && !lost) setLost(p.name);
      }
    }
    if (!over) {
      held.current = all ? held.current + dt : 0;
      if (held.current > best.current) best.current = held.current;
      if (held.current >= GOAL) setWon(true);
    }
    // Ten samples a second is enough to draw a smooth curve and a twentieth of the points a frame would give.
    sampleIn.current -= dt;
    if (sampleIn.current <= 0) {
      sampleIn.current = 0.1;
      for (const p of PEOPLE) {
        const line = trace.current[p.id];
        line.push(level.current[p.id]);
        if (line.length > SAMPLES) line.shift();
      }
      trace.current.tested.push(tested);
      if (trace.current.tested.length > SAMPLES) trace.current.tested.shift();
    }
  }

  const reset = () => {
    level.current = { a: 0, b: 0 };
    harm.current = { a: 0, b: 0 };
    trace.current = { a: [], b: [], tested: [] };
    held.current = 0;
    best.current = 0;
    elapsed.current = 0;
    setOpen({ a: false, b: false });
    setDose({ a: 0.18, b: 0.08 });
    setTested(false);
    setAnswer(null);
    setWon(false);
    setLost(null);
  };

  const picked = REPORTS.find((r) => r.id === answer);
  const button = {
    fontFamily: DISPLAY,
    border: `2.5px solid ${C.ink}`,
    borderRadius: R.sm,
    boxShadow: `3px 3px 0 ${C.ink}`,
  } as const;

  return (
    // One screen, and nothing scrolls. A reader holding the drip has to see what it does while they hold it, and
    // a chart below the fold is a result nobody is looking at. On a wide screen the run sits beside the patients;
    // on a phone it sits under them, and in both the patients take whatever height is left over.
    <div
      className="flex h-[100dvh] flex-col overflow-hidden"
      style={{ background: C.paper, color: C.ink }}
    >
      <SiteHeader />

      <main className="mx-auto grid min-h-0 w-full max-w-[66rem] flex-1 grid-cols-1 grid-rows-[auto_minmax(96px,1fr)_auto_auto_auto] gap-x-14 gap-y-2.5 overflow-y-auto px-5 py-3 md:px-10 md:py-5 lg:py-3 lg:grid-cols-[minmax(0,1fr)_24rem] lg:grid-rows-[minmax(0,1fr)] lg:items-center xl:gap-x-20">
        {/* The two of them, with the stand and the instrument beside each. On a phone this is the row that gives
            way, taking what the screen has left. On a wide screen it has a size of its own: at full height the
            figures ran 560px tall and read as zoomed in, so they stop at 460 and sit centred beside the panel. */}
        <div className="order-2 flex min-h-0 flex-col gap-2 lg:order-none lg:h-full lg:max-h-[520px] lg:self-center">
          <div className="flex min-h-0 flex-1 items-end gap-3 md:gap-8">
            {PEOPLE.map((p) => (
              <div
                key={p.id}
                className="flex h-full min-w-0 flex-1 items-stretch justify-center gap-1.5 md:gap-2.5"
              >
                <Figure person={p} level={level.current[p.id]} />
                <Stand flowing={flowing(p)} tone={drugTone(level.current[p.id])} />
                <Gauge level={level.current[p.id]} />
              </div>
            ))}
          </div>
          {/* On a phone the readouts step aside once the run is won: the gauges still say where each body is,
              and the closing question needs the height more than a second copy of that does. */}
          <div className={`shrink-0 gap-3 md:gap-8 ${won ? "hidden sm:flex" : "flex"}`}>
            {PEOPLE.map((p) => (
              <Readout
                key={p.id}
                person={p}
                level={level.current[p.id]}
                harm={harm.current[p.id]}
                tested={tested}
              />
            ))}
          </div>
        </div>

        {/* The panel. On a phone its four parts are laid straight into the page's grid, around the patients; on
            a wide screen they are one column with a width of its own, so nothing in it is stretched to fit. */}
        <div className="contents lg:flex lg:flex-col lg:gap-4">
          <div className="order-1 lg:order-none">
            <h1
              className="font-black leading-none"
              style={{
                fontFamily: DISPLAY,
                fontSize: "clamp(1.5rem, 2.3vw, 2rem)",
                letterSpacing: "-0.03em",
                color: C.ink,
              }}
            >
              Hold the line.
            </h1>
            <p
              // On a phone, once an answer is showing, this line steps aside for it: the smallest screens have room
              // for one closing thought at a time, and the answer is the one the reader just asked for.
              className={`mt-1.5 max-w-[52ch] text-[13.5px] leading-snug md:mt-2.5 md:text-[15.5px] ${picked ? "hidden sm:block" : ""}`}
              style={{ color: won ? C.ink : C.inkBody, fontWeight: won ? 700 : 400 }}
            >
              {won
                ? "Two people, two rates. Neither body changed — the only thing that changed is that someone looked first."
                : tested
                  ? "Now you know what each body can clear. Set each drip to what that person takes — no juggling."
                  : "Hold the drip open and the drug goes in. Each body clears it at its own rate. Get both into the green and keep them there for eight seconds."}
            </p>
          </div>

          {/* One slot, three occupants in turn: the drip held by hand, the two dials, and — once the run is won and
            there is nothing left to hold — what a result may say. Reusing the slot is what keeps this to a screen. */}
          <div className="order-3 lg:order-none">
            {won ? (
              <div>
                <div className="flex items-center justify-between gap-3">
                  <h2
                    className="text-[14px] font-black md:text-[16px]"
                    style={{ fontFamily: DISPLAY, color: C.ink }}
                  >
                    And what may the result say?
                  </h2>
                  <button
                    type="button"
                    onClick={reset}
                    className="shrink-0 px-3 py-1.5 text-[12.5px] font-bold md:text-[13.5px]"
                    style={{ ...button, background: C.paper, color: C.ink }}
                  >
                    Run it again
                  </button>
                </div>
                <div className="mt-1.5 flex flex-col gap-1.5">
                  {REPORTS.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setAnswer(r.id)}
                      aria-pressed={answer === r.id}
                      className="px-3 py-1.5 text-left text-[13px] font-semibold md:text-[14px]"
                      style={{
                        background: C.paper,
                        color: C.ink,
                        border: `2.5px solid ${answer === r.id ? (r.ok ? C.green : C.red) : C.ink}`,
                        borderRadius: R.sm,
                      }}
                    >
                      {r.text}
                    </button>
                  ))}
                </div>
                {/* One place for the answer rather than one inside each button, so choosing does not resize the
                  screen. */}
                <p
                  aria-live="polite"
                  className="mt-1.5 text-[12.5px] leading-snug md:min-h-[2.8em] md:text-[13.5px]"
                  style={{ color: C.inkBody }}
                >
                  {picked ? `${picked.ok ? "Yes. " : "No. "}${picked.why}` : ""}
                </p>
              </div>
            ) : tested ? (
              <div className="flex gap-4 md:gap-8">
                {PEOPLE.map((p) => (
                  <Valve
                    key={p.id}
                    id={`drip-${p.id}`}
                    label={`${p.name}'s drip`}
                    value={dose[p.id]}
                    onChange={(v) => setDose((d) => ({ ...d, [p.id]: v }))}
                  />
                ))}
              </div>
            ) : lost ? null : (
              <Drip
                id="drip-shared"
                label="The drip they both receive"
                open={open.a}
                setOpen={(v) => setOpen({ a: v, b: v })}
              />
            )}
          </div>

          <div
            className={`order-4 flex-wrap items-center gap-x-4 gap-y-2 lg:order-none ${won ? "hidden" : "flex"}`}
          >
            <p
              aria-live="polite"
              className="text-[13.5px] font-bold md:text-[15px]"
              style={{ color: C.ink }}
            >
              {lost
                ? `${lost} was past the line too long. That is the part a test is meant to prevent.`
                : won
                  ? ""
                  : `Both treating: ${held.current.toFixed(1)}s of ${GOAL.toFixed(0)}`}
              {!over && best.current > 0.1 ? `  ·  best ${best.current.toFixed(1)}s` : ""}
            </p>

            {lost && (
              <button
                type="button"
                onClick={reset}
                className="px-4 py-2 text-[13px] font-bold md:text-[14px]"
                style={{ ...button, background: C.paper, color: C.ink }}
              >
                Run it again
              </button>
            )}

            {!tested && !over && (
              <button
                type="button"
                onClick={() => setTested(true)}
                className="px-4 py-2 text-[13px] font-bold md:text-[14px]"
                style={{ ...button, background: C.redDeep, color: "#fff" }}
              >
                Test them both
              </button>
            )}

            {(lost || elapsed.current > 25) && !tested && (
              <span
                className="text-[13px] font-semibold md:text-[14px]"
                style={{ color: C.redDeep }}
              >
                No single drip holds both. Find out what each body can clear.
              </span>
            )}
          </div>

          {/* The result, in view the whole time. */}
          <div className="order-5 flex min-h-0 flex-col lg:order-none">
            <span className={L.note} style={{ color: C.inkNote, display: "block" }}>
              Your run — A solid, B dashed
            </span>
            <div className="mt-1 h-[64px] min-h-0 sm:h-[88px] lg:h-[clamp(84px,17vh,160px)]">
              <Trace a={trace.current.a} b={trace.current.b} tested={trace.current.tested} />
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
        Schematic: a scale, not milligrams
        <span className="hidden sm:inline">, and nothing here is patient data</span>. Licensed under{" "}
        <a href={WIKI.license.url} rel="license" className="underline underline-offset-2">
          CC BY 4.0
        </a>
        . Source at{" "}
        <a href={WIKI.repo} className="underline underline-offset-2">
          {WIKI.repo.replace("https://", "")}
        </a>
        .
      </footer>

      <style>
        {`
        /* One drop, falling down the line from the bag to the cannula. It runs only while the drip is open, so
           nothing on this page moves on a timer of its own. The fall is in fractions of the stand, because the
           stand is whatever height the screen leaves it. */
        .pg-drop {
          transform: translateX(-50%);
          animation: pg-drop 700ms linear infinite;
        }
        @keyframes pg-drop {
          from { top: 13%; opacity: 0; }
          12%  { opacity: 1; }
          88%  { opacity: 1; }
          to   { top: 49%; opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .pg-drop { animation: none; top: 30%; opacity: 0.85; }
        }
      `}
      </style>
    </div>
  );
}
