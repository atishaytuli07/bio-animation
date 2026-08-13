import { useEffect, useState } from "react";
import { useSmoothProgress, useInView, range, clamp01 } from "@/hooks/use-scroll-progress";
import { Tall, Reveal, Helix } from "./visuals";

/* -------------------------------------------------- 7. the solution (light) */

const STEPS = [
  {
    k: "01",
    t: "A cheek swab",
    d: "No blood draw. No hospital visit. Two minutes, before day one.",
  },
  {
    k: "02",
    t: "We read DPYD",
    d: "Our assay checks the four variants behind most DPD deficiency.",
  },
  {
    k: "03",
    t: "A result in hours",
    d: "Normal, reduced, or absent enzyme activity — with a confidence score.",
  },
  {
    k: "04",
    t: "The dose is adjusted",
    d: "The oncologist starts safe instead of discovering the problem afterwards.",
  },
];

/** Line-art of the assay: swab → tube → reader → report. Draws itself in. */
function AssayArt({ step, t }: { step: number; t: number }) {
  const on = (i: number) => (i <= step ? 1 : 0.14);
  const ink = "var(--ink)";
  return (
    <svg viewBox="0 0 720 130" className="w-full">
      {/* connecting line */}
      <line x1="60" y1="65" x2="660" y2="65" stroke="var(--hairline)" strokeWidth="1" />
      <line
        x1="60"
        y1="65"
        x2={60 + 600 * clamp01(t)}
        y2="65"
        stroke="var(--clinical)"
        strokeWidth="1.5"
      />
      {/* swab */}
      <g opacity={on(0)}>
        <ellipse cx="60" cy="34" rx="9" ry="13" fill="none" stroke={ink} strokeWidth="1.2" />
        <line x1="60" y1="47" x2="60" y2="65" stroke={ink} strokeWidth="1.2" />
      </g>
      {/* tube */}
      <g opacity={on(1)} transform="translate(260 18)">
        <path d="M-12 0 H12 V34 A12 12 0 0 1 -12 34 Z" fill="none" stroke={ink} strokeWidth="1.2" />
        <path
          d="M-12 22 H12 V34 A12 12 0 0 1 -12 34 Z"
          fill="color-mix(in oklab, var(--clinical) 35%, transparent)"
          stroke="none"
        />
        <line x1="0" y1="46" x2="0" y2="47" stroke={ink} />
      </g>
      {/* reader */}
      <g opacity={on(2)} transform="translate(440 20)">
        <rect
          x="-30"
          y="0"
          width="60"
          height="42"
          rx="6"
          fill="none"
          stroke={ink}
          strokeWidth="1.2"
        />
        {[0, 1, 2].map((i) => (
          <line
            key={i}
            x1={-18 + i * 18}
            y1="10"
            x2={-18 + i * 18}
            y2="32"
            stroke={i === 1 ? "var(--alarm)" : "var(--clinical)"}
            strokeWidth="3"
          />
        ))}
      </g>
      {/* report */}
      <g opacity={on(3)} transform="translate(660 16)">
        <rect
          x="-22"
          y="0"
          width="44"
          height="50"
          rx="4"
          fill="none"
          stroke={ink}
          strokeWidth="1.2"
        />
        <line x1="-12" y1="14" x2="12" y2="14" stroke="var(--ink-faint)" />
        <line x1="-12" y1="24" x2="4" y2="24" stroke="var(--ink-faint)" />
        <circle cx="-6" cy="38" r="4" fill="var(--vital)" />
        <line x1="2" y1="38" x2="12" y2="38" stroke="var(--ink-faint)" />
      </g>
      {[60, 260, 440, 660].map((x, i) => (
        <circle
          key={x}
          cx={x}
          cy="65"
          r={i <= step ? 5 : 3}
          fill={i <= step ? "var(--clinical)" : "var(--hairline-strong)"}
        />
      ))}
    </svg>
  );
}

export function ChapterSolution() {
  const [ref, p] = useSmoothProgress<HTMLElement>();
  const active = Math.min(STEPS.length - 1, Math.floor(p * STEPS.length * 0.99));

  return (
    <Tall id="solution" vh={480} refFn={ref}>
      <div className="w-full max-w-6xl px-6">
        <p className="eyebrow mb-4 text-clinical">The Solution</p>
        <Reveal
          text={"Test first.\nThen treat."}
          t={range(p, 0, 0.16)}
          className="story-line mb-12 text-ink"
        />

        <AssayArt step={active} t={range(p, 0.05, 0.9)} />

        <ol className="mt-10 grid gap-10 md:grid-cols-4">
          {STEPS.map((s, i) => {
            const on = i <= active;
            return (
              <li
                key={s.k}
                className="transition-all duration-700"
                style={{ opacity: on ? 1 : 0.26, transform: `translateY(${on ? 0 : 14}px)` }}
              >
                <div
                  className="mb-5 h-px w-full origin-left transition-transform duration-700"
                  style={{
                    background: on ? "var(--clinical)" : "var(--hairline)",
                    transform: `scaleX(${on ? 1 : 0.2})`,
                  }}
                />
                <p className="eyebrow text-ink-faint">{s.k}</p>
                <p
                  className="mt-2 text-xl text-ink md:text-2xl"
                  style={{ letterSpacing: "-0.03em" }}
                >
                  {s.t}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{s.d}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </Tall>
  );
}

/* ----------------------------------------------- 8. split screen: two Emmas */

const LEFT = [
  "Emma — no DPYD variant",
  "Standard dose of 5-FU",
  "The enzyme clears the drug",
  "Mild, expected side effects",
  "Treatment completed",
];
const RIGHT_NOW = [
  "Emma — DPYD variant carrier",
  "Tested before day one",
  "Dose reduced by 50%",
  "The drug clears safely",
  "Treatment completed",
];
const RIGHT_BEFORE = [
  "Emma — DPYD variant carrier",
  "The same standard dose",
  "The drug accumulates",
  "Severe toxicity — hospital",
  "Treatment stopped",
];

export function ChapterSplit() {
  const [tested, setTested] = useState(true);
  const right = tested ? RIGHT_NOW : RIGHT_BEFORE;

  // No scroll-scrubbed reveal here. This chapter is the one the reader
  // *operates* — the toggle is the interaction, and drip-feeding the rows on
  // scroll fought it: flipping the switch showed a half-built column. Both
  // timelines are simply present, and comparing them is the point.
  return (
    <section className="relative px-6 py-28 md:py-40 lg:pl-64">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow mb-3 text-clinical">Same drug, different outcome</p>
            <h2 className="text-3xl text-ink md:text-5xl" style={{ letterSpacing: "-0.04em" }}>
              Two versions of the same day.
            </h2>
          </div>
          <div className="relative flex items-center rounded-full border border-hairline p-1">
            <span
              className="absolute h-[calc(100%-8px)] rounded-full bg-ink transition-transform duration-500"
              style={{
                width: "calc(50% - 4px)",
                transform: `translateX(${tested ? "100%" : "0%"})`,
              }}
            />
            {[
              { l: "Without the test", v: false },
              { l: "With the test", v: true },
            ].map((o) => (
              <button
                key={o.l}
                onClick={() => setTested(o.v)}
                className="relative z-10 w-1/2 whitespace-nowrap rounded-full px-4 py-2 text-xs uppercase tracking-[0.16em] transition-colors duration-300"
                style={{ color: tested === o.v ? "var(--paper)" : "var(--ink-faint)" }}
              >
                {o.l}
              </button>
            ))}
          </div>
        </div>

        <div
          className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-hairline"
          style={{ borderColor: "var(--glass-line)", boxShadow: "var(--glass-shadow)" }}
        >
          {[LEFT, right].map((col, ci) => (
            <div key={ci} className="relative bg-paper p-5 md:p-10">
              <p className="eyebrow mb-6 text-ink-faint">
                {ci === 0 ? "No variant" : "Variant carrier"}
              </p>
              {col.map((line, i) => {
                const bad = ci === 1 && !tested && i >= 2;
                return (
                  <div
                    key={line}
                    className="flex items-center gap-3 border-b border-hairline py-4 transition-all duration-500 last:border-0"
                    style={{ opacity: 1 }}
                  >
                    <span
                      className="relative inline-flex h-2 w-2 shrink-0 rounded-full"
                      style={{ background: bad ? "var(--alarm)" : "var(--vital)" }}
                    />
                    <span
                      className="text-sm md:text-lg"
                      style={{ color: bad ? "var(--alarm)" : "var(--ink)" }}
                    >
                      {line}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-ink-soft">
          The difference isn't the drug. It's knowing who's in front of you.
        </p>
      </div>
    </section>
  );
}

/* --------------------------------------------------------- 9. the results */

const RESULTS = [
  { n: 4, suffix: "", l: "DPYD variants detected", d: "*2A, *13, D949V, HapB3", bar: 1 },
  {
    n: 96,
    suffix: "%",
    l: "Concordance with sequencing",
    d: "Across 120 blinded samples",
    bar: 0.96,
  },
  { n: 3, suffix: " h", l: "Sample to result", d: "Single-tube, no thermocycler", bar: 0.25 },
  { n: 12, suffix: "×", l: "Cheaper per test", d: "Versus commercial panels", bar: 0.85 },
];

function Counter({ to, suffix }: { to: number; suffix: string }) {
  const [ref, seen] = useInView<HTMLSpanElement>(0.5);
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!seen) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 1400);
      setV(to * (1 - Math.pow(1 - t, 4)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, to]);
  return (
    <span ref={ref} className="tabular-nums">
      {Math.round(v)}
      {suffix}
    </span>
  );
}

export function ChapterResults() {
  const [ref, seen, active] = useInView<HTMLDivElement>(0.2);
  return (
    <section id="results" className="px-6 py-32 md:py-48 lg:pl-64">
      <div ref={ref} className="mx-auto max-w-6xl">
        <p className="eyebrow mb-4 text-clinical">The Results</p>
        <h2 className="story-line mb-16 text-ink">It works in the lab.</h2>
        <div className="grid gap-px bg-hairline md:grid-cols-4">
          {RESULTS.map((r, i) => (
            <div key={r.l} className="bg-paper py-10 md:px-8">
              <p className="text-5xl text-ink md:text-6xl" style={{ letterSpacing: "-0.05em" }}>
                <Counter to={r.n} suffix={r.suffix} />
              </p>
              <div className="mt-5 h-[3px] w-full bg-hairline">
                <div
                  className="h-full bg-clinical transition-[width] duration-[1400ms] ease-out"
                  style={{
                    width: seen ? `${r.bar * 100}%` : "0%",
                    transitionDelay: `${i * 140}ms`,
                  }}
                />
              </div>
              <p className="mt-4 text-base text-ink">{r.l}</p>
              <p className="mt-1 text-sm text-ink-faint">{r.d}</p>
            </div>
          ))}
        </div>

        <div className="mt-20 grid items-center gap-10 border-t border-hairline pt-16 md:grid-cols-[320px_1fr]">
          <Helix
            spin={0.6}
            rungs={18}
            flag={9}
            stroke="var(--hairline-strong)"
            className="h-[240px]"
            animate={active}
          />
          <div>
            <p className="text-2xl text-ink md:text-4xl" style={{ letterSpacing: "-0.04em" }}>
              The variant that would have hurt Emma takes three hours to find.
            </p>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft">
              A single-tube isothermal reaction, read on a phone camera. Everything a clinic needs
              to know before the first infusion — while there is still time to change the dose.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- 10. the future */

export function ChapterFuture() {
  const [ref, seen] = useInView<HTMLDivElement>(0.25);
  return (
    <section id="future" className="px-6 py-32 md:py-48 lg:pl-64">
      <div ref={ref} className="mx-auto max-w-6xl">
        <p className="eyebrow mb-4 text-clinical">The Future</p>
        <h2 className="story-line mb-14 text-ink">
          A test that costs less
          <br />
          than one hospital night.
        </h2>
        <div className="grid gap-10 md:grid-cols-3">
          {[
            {
              n: "01",
              t: "Into the clinic",
              d: "Validation with an oncology department, then a prospective pilot alongside standard care.",
            },
            {
              n: "02",
              t: "Beyond DPYD",
              d: "The same one-tube chemistry extends to UGT1A1 for irinotecan and TPMT for thiopurines.",
            },
            {
              n: "03",
              t: "Where it's needed most",
              d: "No thermocycler means clinics without genomics infrastructure can run it themselves.",
            },
          ].map((c, i) => (
            <div
              key={c.t}
              className="border-t border-hairline pt-6 transition-all duration-[900ms]"
              style={{
                opacity: seen ? 1 : 0,
                transform: `translateY(${seen ? 0 : 18}px)`,
                transitionDelay: `${i * 140}ms`,
              }}
            >
              <p className="eyebrow text-ink-faint">{c.n}</p>
              <p className="mt-2 text-xl text-ink" style={{ letterSpacing: "-0.03em" }}>
                {c.t}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{c.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------- 11. statistics — last, once they understand why */

export function ChapterStatistics() {
  const [ref, seen] = useInView<HTMLDivElement>(0.2);
  const stats = [
    { v: "7%", w: 0.07, l: "of people carry a DPYD variant that reduces DPD activity" },
    { v: "1 in 1000", w: 0.02, l: "have almost no enzyme activity at all" },
    { v: "30%", w: 0.3, l: "of carriers develop severe toxicity on a standard dose" },
    { v: "0.5–1%", w: 0.01, l: "of treated patients die from fluoropyrimidine toxicity" },
  ];
  return (
    <section className="px-6 py-32 md:py-48 lg:pl-64">
      <div ref={ref} className="mx-auto max-w-4xl">
        <p className="eyebrow mb-4 text-ink-faint">Now the numbers</p>
        <h2 className="mb-14 text-3xl text-ink md:text-5xl" style={{ letterSpacing: "-0.04em" }}>
          Emma isn't rare.
        </h2>
        {stats.map((s, i) => (
          <div
            key={s.v}
            className="border-b border-hairline py-8 transition-all duration-700"
            style={{
              opacity: seen ? 1 : 0,
              transform: `translateY(${seen ? 0 : 14}px)`,
              transitionDelay: `${i * 110}ms`,
            }}
          >
            <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:gap-10">
              <span
                className="w-44 shrink-0 text-4xl text-ink md:text-5xl"
                style={{ letterSpacing: "-0.05em" }}
              >
                {s.v}
              </span>
              <span className="text-base text-ink-soft md:text-lg">{s.l}</span>
            </div>
            {/* a hundred people; the affected ones fill in */}
            <div className="mt-5 flex flex-wrap gap-[3px]">
              {Array.from({ length: 100 }).map((_, k) => {
                const hit = k < Math.max(1, Math.round(s.w * 100));
                return (
                  <span
                    key={k}
                    className="h-2 w-2 rounded-[1px] transition-all duration-500"
                    style={{
                      background: hit ? "var(--alarm)" : "var(--hairline)",
                      opacity: seen ? 1 : 0,
                      transitionDelay: `${i * 110 + k * 4}ms`,
                    }}
                  />
                );
              })}
            </div>
          </div>
        ))}
        <p className="quiet-line mt-16 text-2xl text-ink md:text-3xl">
          Every one of those numbers is someone's Emma.
        </p>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- the close */

export function StoryFooter() {
  const [ref, seen] = useInView<HTMLDivElement>(0.3);
  return (
    <footer className="border-t border-hairline px-6 py-24">
      <div
        ref={ref}
        className="mx-auto flex max-w-6xl flex-col justify-between gap-8 md:flex-row md:items-end"
      >
        <p
          className="text-2xl text-ink transition-all duration-1000 md:text-4xl"
          style={{
            letterSpacing: "-0.04em",
            opacity: seen ? 1 : 0,
            transform: `translateY(${seen ? 0 : 14}px)`,
          }}
        >
          One dose doesn't fit everyone.
          <br />
          <span className="text-ink-faint">Now it doesn't have to.</span>
        </p>
        <p className="max-w-sm text-xs leading-relaxed text-ink-faint">
          iGEM 2026 — Diagnostics. Emma is a composite of documented patient cases; figures are
          placeholders pending the team's own data.
        </p>
      </div>
    </footer>
  );
}
