import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState, type ReactNode } from "react";

import { Enzyme, Molecule } from "@/components/hero/elements";
import { C, DISPLAY, L, R } from "@/components/hero/palette";
import { Chart } from "@/components/playground/Chart";
import { LineKey, PatientColumn, Pip } from "@/components/playground/PatientColumn";
import {
  BAND,
  CEILING,
  clearanceOf,
  inBand,
  MAX_PATIENTS,
  mostInRange,
  SAMPLES,
  SETTLE,
  STEPS,
  type Mark,
  type Patient,
} from "@/components/playground/model";
import { SiteHeader } from "@/components/story/SiteHeader";
import { useTime } from "@/hooks/use-scroll-progress";
import { WIKI } from "@/lib/wiki";

// The story tells one argument in one order. This page hands the reader the one variable the story keeps fixed,
// how much DPD activity a patient has, and a short path of things worth finding out with it.
// No milligram, no hour and no patient figure appears anywhere on screen.

const TITLE = "Try it · ChemoGuard";
const DESCRIPTION =
  "Give up to four simulated patients the same dose of 5-FU, change each one's simulated DPD activity, and see where the drug settles in each of them.";

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

// The story's field stripes, at the same angle and spacing, over a light lavender.
const STAGE = `repeating-linear-gradient(102deg, rgba(255,255,255,0.4) 0 3px, transparent 3px 26px), color-mix(in oklab, ${C.lavender} 20%, ${C.paper})`;
const CARD = { border: `2px solid ${C.ink}`, borderRadius: R.md } as const;
const BUTTON = {
  border: `2.5px solid ${C.ink}`,
  borderRadius: R.sm,
  boxShadow: `3px 3px 0 ${C.ink}`,
} as const;

function KeyRow({ mark, children }: { mark: ReactNode; children: ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span aria-hidden="true" className="mt-[1px] grid h-4 w-6 shrink-0 place-items-center">
        {mark}
      </span>
      <span>{children}</span>
    </li>
  );
}

/** Every mark and colour on the page, said once. */
function Key() {
  return (
    <div className="px-3.5 py-3" style={{ ...CARD, background: `${C.paper}e6` }}>
      <p className={L.note} style={{ color: C.inkBody }}>
        Key
      </p>
      <ul
        className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1.5 text-[12.5px] font-semibold leading-snug sm:grid-cols-2"
        style={{ color: C.ink }}
      >
        <KeyRow
          mark={
            <span
              className="grid h-4 w-5 place-items-center"
              style={{ background: `${C.coral}59`, borderTop: `3px solid ${C.coral}` }}
            >
              <Pip />
            </span>
          }
        >
          Coral fill and hexagons: simulated 5-FU exposure
        </KeyRow>
        <KeyRow
          mark={
            <span
              className="block h-3 w-5"
              style={{
                background: `${C.green}33`,
                borderTop: `1.5px dashed ${C.green}`,
                borderBottom: `1.5px dashed ${C.green}`,
              }}
            />
          }
        >
          Green band: illustrative target range
        </KeyRow>
        <KeyRow mark={<span className="block h-[2.5px] w-5" style={{ background: C.red }} />}>
          Red line: illustrative threshold, higher simulated risk above it
        </KeyRow>
        <KeyRow mark={<Enzyme s={0.17} tone={C.green} line={C.ink} />}>
          Enzyme: simulated DPD activity, out of 5
        </KeyRow>
        <KeyRow
          mark={
            <span className="text-[12px] font-black leading-none" style={{ color: C.ink }}>
              ▲▼
            </span>
          }
        >
          Arrow: the level is still rising or falling
        </KeyRow>
        <KeyRow mark={<LineKey look={0} />}>
          Patient colour: the same patient’s line on the chart
        </KeyRow>
        <KeyRow
          mark={
            <span className="flex gap-[2px]">
              {[C.lavender, C.green, C.red].map((tone) => (
                <span
                  key={tone}
                  className="block h-2 w-2 rounded-full"
                  style={{ background: tone, border: `1px solid ${C.ink}` }}
                />
              ))}
            </span>
          }
        >
          Dot and glow: lavender below the range, green in it, red above it
        </KeyRow>
      </ul>
      <p className="mt-2 text-[12.5px] leading-snug" style={{ color: C.inkBody }}>
        The green band and red threshold are illustrative, not validated clinical thresholds.
      </p>
    </div>
  );
}

function Bench() {
  const nextId = useRef(2);
  const [patients, setPatients] = useState<Patient[]>([{ id: 1, activity: 5, look: 0 }]);
  const [dose, setDose] = useState(0);
  /** The line each finished step left behind, in order. Its length is the step in hand. */
  const [found, setFound] = useState<string[]>([]);
  const [hover, setHover] = useState<number | null>(null);
  const [pinned, setPinned] = useState<number | null>(null);

  // The run. Levels and samples live in refs and are integrated once per frame on the page's shared ticker, so
  // this adds no second loop. `useTime` re-renders each frame, which is what paints the gauges.
  const level = useRef<Record<number, number>>({});
  const trace = useRef<Record<number, (number | null)[]>>({});
  /** The level each patient had when their activity was last lowered. */
  const lowered = useRef<Record<number, number>>({});
  const marks = useRef<Mark[]>([]);
  const tick = useRef(0);
  const sampleIn = useRef(0);
  const held = useRef(0);
  const last = useRef(0);
  const t = useTime(true);

  const live = patients.filter((p) => !p.out);
  const at = (p: Patient) => level.current[p.id] ?? 0;
  const step = STEPS[found.length];

  if (t !== last.current) {
    const dt = Math.min(0.05, t - last.current);
    last.current = t;
    for (const p of live) {
      level.current[p.id] = Math.max(
        0,
        Math.min(CEILING, at(p) + (dose - clearanceOf(p) * at(p)) * dt),
      );
    }

    // Only the step in hand is watched, and its state has to hold for a moment, so a level passing through the
    // band on its way somewhere else is not counted as having been put there.
    if (step) {
      const full = live.filter((p) => p.activity === 5);
      const two = live.filter((p) => p.activity === 2);
      const best = mostInRange(live);
      const met =
        step.id === "dose"
          ? full.some((p) => inBand(at(p)))
          : step.id === "compare"
            ? two.some((p) => at(p) > BAND.hi && full.some((f) => at(p) > at(f) + 0.15))
            : step.id === "difference"
              ? two.some((p) => inBand(at(p))) && full.some((p) => !inBand(at(p)))
              : step.id === "why"
                ? live.some((p) => at(p) > (lowered.current[p.id] ?? Infinity) + 0.12)
                : live.length >= 4 &&
                  new Set(live.map((p) => p.activity)).size >= 4 &&
                  live.filter((p) => inBand(at(p))).length >= Math.min(2, best);
      held.current = met ? held.current + dt : 0;
      if (held.current >= SETTLE) {
        held.current = 0;
        const line =
          step.id === "group"
            ? `With these four simulated patients, one dose keeps at most ${best} in range.`
            : step.found;
        const n = found.length;
        setFound((was) => (was.length === n ? [...was, line] : was));
      }
    }

    // Ten samples a second is enough for a smooth curve and a twentieth of the points a frame would give.
    sampleIn.current -= dt;
    if (sampleIn.current <= 0) {
      sampleIn.current = 0.1;
      tick.current += 1;
      for (const p of live) {
        const line = (trace.current[p.id] ??= []);
        line.push(at(p));
        if (line.length > SAMPLES) line.shift();
      }
    }
  }

  // A change made within three seconds of the last one replaces it, so dragging the slider leaves one mark.
  const note = (kind: Mark["kind"]) => {
    const m = marks.current;
    const prev = m[m.length - 1];
    if (prev && tick.current - prev.at < 30) m.pop();
    m.push({ at: tick.current, kind });
    if (m.length > 6) m.shift();
  };

  const addPatient = () => {
    if (live.length >= MAX_PATIENTS) return;
    const id = nextId.current++;
    // a patient who joins now has no past: their line starts here, as a gap up to this sample
    trace.current[id] = Array.from({ length: Math.min(tick.current, SAMPLES) }, () => null);
    const looks = new Set(live.map((p) => p.look));
    const look = [0, 1, 2, 3].find((n) => !looks.has(n)) ?? 0;
    // the next activity not on the page yet, so each new patient is a new case rather than a repeat
    const taken = new Set(live.map((p) => p.activity));
    const activity = [2, 3, 4, 1, 5, 0].find((n) => !taken.has(n)) ?? 2;
    note("added");
    setPatients((ps) => [...ps.filter((p) => !p.out), { id, activity, look }]);
  };
  const removePatient = (id: number) => {
    setPatients((ps) => ps.map((p) => (p.id === id ? { ...p, out: true } : p)));
    if (pinned === id) setPinned(null);
    if (hover === id) setHover(null);
    window.setTimeout(() => {
      delete level.current[id];
      delete trace.current[id];
      delete lowered.current[id];
      setPatients((ps) => ps.filter((p) => p.id !== id));
    }, 220);
  };
  const setActivity = (p: Patient, n: number) => {
    const activity = Math.max(0, Math.min(5, n));
    if (activity === p.activity) return;
    if (activity < p.activity) lowered.current[p.id] ??= at(p);
    else delete lowered.current[p.id];
    note("DPD");
    setPatients((ps) => ps.map((x) => (x.id === p.id ? { ...x, activity } : x)));
  };
  const restart = () => {
    level.current = {};
    trace.current = {};
    lowered.current = {};
    marks.current = [];
    tick.current = 0;
    held.current = 0;
    setDose(0);
    setPatients([{ id: nextId.current++, activity: 5, look: 0 }]);
    setFound([]);
    setHover(null);
    setPinned(null);
  };

  const shown = Math.min(tick.current, SAMPLES);
  const active = hover ?? pinned;
  const holding = Math.min(1, held.current / SETTLE);
  const latest = found[found.length - 1];

  return (
    <div
      className="relative flex min-h-[100dvh] flex-col"
      style={{
        color: C.ink,
        background: `linear-gradient(155deg, color-mix(in oklab, ${C.lavender} 26%, ${C.paper}) 0%, ${C.paper} 46%, color-mix(in oklab, ${C.pink} 16%, ${C.paper}) 100%)`,
      }}
    >
      <SiteHeader />

      {/* Two outlines from the story, large and faint, in opposite corners. Nothing floats over the controls. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block"
      >
        <span className="absolute -left-24 top-[96px] opacity-[0.16]">
          <Enzyme s={3.4} tone="transparent" line={C.lavenderDeep} />
        </span>
        <span className="absolute -right-24 bottom-[-60px] opacity-[0.14]">
          <Molecule s={3} tone="transparent" line={C.coral} />
        </span>
      </div>

      <main
        className="relative mx-auto flex w-full max-w-[82rem] flex-1 flex-col gap-3.5 px-4 py-4 md:px-8 lg:grid lg:grid-cols-[minmax(0,1fr)_25.5rem] lg:items-start lg:gap-7 lg:py-6"
        style={{ ["--stage" as string]: STAGE }}
      >
        {/* The simulation: the patients, and under them the same levels drawn over time. On a phone its two parts
            are laid into the page's own column, around the controls. */}
        <div
          className="contents lg:flex lg:flex-col lg:gap-4 lg:self-stretch lg:p-5"
          style={{ background: STAGE, ...CARD }}
        >
          <section
            aria-label="The simulated patients"
            className="order-3 flex flex-col gap-3 max-lg:rounded-[10px] max-lg:border-2 max-lg:border-[#241C2E] max-lg:[background:var(--stage)] max-lg:p-3 lg:order-none lg:min-h-0 lg:flex-1"
          >
            <div className="flex h-[348px] items-stretch justify-center gap-2 sm:gap-4 lg:h-auto lg:min-h-[330px] lg:flex-1 lg:gap-6">
              {patients.map((p) => (
                <PatientColumn
                  key={p.id}
                  patient={p}
                  count={patients.length}
                  level={at(p)}
                  rate={dose - clearanceOf(p) * at(p)}
                  dimmed={active !== null && active !== p.id}
                  pinned={pinned === p.id}
                  onPin={() => setPinned((was) => (was === p.id ? null : p.id))}
                  onActivity={(n) => setActivity(p, n)}
                  onRemove={live.length > 1 && !p.out ? () => removePatient(p.id) : null}
                  onFocus={(on) => setHover(on ? p.id : null)}
                />
              ))}
              {/* The next patient's place. It fills the panel while there is room, and it is the way to add one. */}
              {live.length < MAX_PATIENTS && (
                <button
                  type="button"
                  onClick={addPatient}
                  className="hidden max-w-[150px] flex-1 flex-col items-center justify-center gap-2 px-2 text-[13px] font-bold leading-tight sm:flex"
                  style={{
                    color: C.inkBody,
                    border: `2px dashed ${C.ink}66`,
                    borderRadius: R.md,
                    background: `${C.paper}66`,
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="grid h-9 w-9 place-items-center rounded-full text-[20px] leading-none"
                    style={{ border: `2px solid ${C.ink}99`, color: C.ink }}
                  >
                    +
                  </span>
                  Add a patient
                </button>
              )}
            </div>
            <p className="text-[12.5px] leading-snug md:text-[13px]" style={{ color: C.inkBody }}>
              Adjust the simulated enzyme activity to see how it affects drug exposure. This does
              not represent a treatment: ChemoGuard does not change DPD activity. 5/5 is full
              activity in this model, and each step down is one fifth less. The point is to show why
              knowing a patient’s genetic characteristics before treatment can be useful.
            </p>
          </section>

          <section
            aria-label="Exposure over time"
            className="order-5 max-lg:rounded-[10px] max-lg:border-2 max-lg:border-[#241C2E] max-lg:[background:var(--stage)] max-lg:p-3 lg:order-none"
          >
            <Chart
              patients={live}
              lines={live.map((p) => trace.current[p.id] ?? [])}
              marks={marks.current
                .map((m) => ({ ...m, x: (m.at - (tick.current - shown)) / (SAMPLES - 1) }))
                .filter((m) => m.x >= 0)}
              active={active}
              pinned={pinned}
              onHover={setHover}
              onPin={(id) => setPinned((was) => (was === id ? null : id))}
            />
          </section>
        </div>

        <div className="contents lg:flex lg:flex-col lg:gap-3.5">
          <div className="order-1 lg:order-none">
            <p className={L.note} style={{ color: C.lavenderDeep }}>
              Try it · a simulation
            </p>
            <h1
              className="mt-1.5 font-semibold leading-none"
              style={{
                fontFamily: DISPLAY,
                fontSize: "clamp(1.5rem, 2vw, 1.72rem)",
                letterSpacing: "-0.03em",
                color: C.ink,
              }}
            >
              Same dose. Different patients.
            </h1>
            <p
              className="mt-2 max-w-[54ch] text-[14px] leading-snug md:text-[15px]"
              style={{ color: C.inkBody }}
            >
              Each column is a simulated patient receiving the chemotherapy drug 5-FU. The shared
              dose flows in, and the patient’s DPD enzyme clears it. This is a conceptual
              illustration, not a clinical or quantitative model.
            </p>
          </div>

          {/* One step at a time: what to do, and why. */}
          <div className="order-2 lg:order-none">
            {step ? (
              <div
                className="px-4 py-3"
                style={{ ...CARD, background: `color-mix(in oklab, ${C.coral} 20%, ${C.paper})` }}
              >
                <p className={L.note} style={{ color: C.inkBody }}>
                  Step {found.length + 1} of {STEPS.length}
                  {holding > 0 ? " · hold it there" : ""}
                </p>
                <h2
                  className="mt-1 text-[19px] font-semibold leading-tight md:text-[21px]"
                  style={{ fontFamily: DISPLAY, letterSpacing: "-0.02em" }}
                >
                  {step.title}
                </h2>
                <p className="mt-1 text-[14px] font-semibold leading-snug md:text-[15px]">
                  {step.ask}
                </p>
                <p className="mt-1 text-[13px] leading-snug" style={{ color: C.inkBody }}>
                  {step.why}
                </p>
                {/* A step is counted once its state has held for a moment. The bar shows that count running. */}
                <span
                  aria-hidden="true"
                  className="mt-2 block h-[4px] overflow-hidden rounded-full"
                  style={{ background: `${C.ink}22` }}
                >
                  <span
                    className="block h-full"
                    style={{ width: `${holding * 100}%`, background: C.ink }}
                  />
                </span>
              </div>
            ) : (
              // The takeaway, in the words the science review settled on: testing can inform a decision, it does
              // not make one.
              <div
                className="bench-in px-4 py-4"
                style={{ ...CARD, background: C.lavenderDeep, color: C.paper }}
              >
                <p className={L.note} style={{ color: `${C.paper}d9` }}>
                  What you found
                </p>
                <h2
                  className="mt-1.5 text-[24px] font-semibold leading-[1.05] md:text-[28px]"
                  style={{ fontFamily: DISPLAY, letterSpacing: "-0.025em" }}
                >
                  Same dose. Different drug exposure.
                </h2>
                <p className="mt-2 text-[14px] leading-snug md:text-[15px]">
                  Patients with different DPD activity may require different starting-dose
                  decisions. Pre-treatment DPYD testing can help inform those decisions.
                </p>
                <Link
                  to="/description"
                  hash="testing"
                  className="mt-2.5 inline-block text-[14px] font-bold underline underline-offset-4"
                >
                  Why testing first matters
                </Link>
                {latest && (
                  <p className="mt-2.5 text-[13px] leading-snug" style={{ color: `${C.paper}e6` }}>
                    {latest}
                  </p>
                )}
              </div>
            )}
            {latest && step && (
              <p
                key={found.length}
                className="bench-in mt-2 flex gap-2 text-[13px] font-semibold leading-snug"
              >
                <span
                  aria-hidden="true"
                  className="mt-[2px] grid h-4 w-4 shrink-0 place-items-center rounded-full text-[12px] font-black leading-none"
                  style={{ background: C.green, border: `1.5px solid ${C.ink}` }}
                >
                  ✓
                </span>
                {latest}
              </p>
            )}
            <p aria-live="polite" className="sr-only">
              {latest ? `Found: ${latest}` : ""}
            </p>
          </div>

          <div
            className="order-4 px-4 py-3 lg:order-none"
            style={{ ...CARD, background: `${C.paper}e6` }}
          >
            <label className={`${L.note} block`} style={{ color: C.inkBody }} htmlFor="dose">
              Shared simulated dose
            </label>
            <input
              id="dose"
              type="range"
              min={0}
              max={50}
              step={1}
              value={Math.round(dose * 100)}
              onChange={(e) => {
                note("dose");
                setDose(Number(e.target.value) / 100);
              }}
              aria-valuetext={`${Math.round(dose * 200)} percent of the highest dose in this simulation`}
              className="dose-range mt-1.5 w-full"
              style={{ ["--fill" as string]: `${dose * 200}%` }}
            />
            <div
              className="flex justify-between text-[12px] font-semibold leading-none"
              style={{ color: C.inkBody }}
            >
              <span>none</span>
              <span>every patient gets this dose</span>
              <span>higher</span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={addPatient}
                disabled={live.length >= MAX_PATIENTS}
                className="px-3.5 py-1.5 text-[14px] font-bold disabled:opacity-40"
                style={{ ...BUTTON, background: C.lavenderDeep, color: "#fff" }}
              >
                Add a patient
              </button>
              <button
                type="button"
                onClick={restart}
                className="px-3.5 py-1.5 text-[14px] font-bold"
                style={{ ...BUTTON, background: C.paper, color: C.ink }}
              >
                Start again
              </button>
            </div>
          </div>

          <div className="order-6 lg:order-none">
            <Key />
          </div>
        </div>
      </main>

      {/* The page's caveat, then the licence and the repository, which iGEM asks for on every page. */}
      <footer
        className="relative mx-auto w-full max-w-[82rem] px-4 pb-4 pt-1 text-[13px] leading-snug md:px-8"
        style={{ color: C.inkBody }}
      >
        <p>
          <strong style={{ color: C.ink }}>A conceptual illustration, </strong>
          not a quantitative pharmacokinetic model. The scale is relative, not milligrams, and in
          this simulation DPD is the only route out. Real fluoropyrimidine pharmacokinetics involve
          additional processes.
        </p>
        <p className="mt-1">
          Licensed under{" "}
          <a href={WIKI.license.url} rel="license" className="underline underline-offset-2">
            CC BY 4.0
          </a>
          . Source at{" "}
          <a href={WIKI.repo} className="underline underline-offset-2">
            {WIKI.repo.replace("https://", "")}
          </a>
          .
        </p>
      </footer>
    </div>
  );
}
