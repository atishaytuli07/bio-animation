import { useSmoothProgress, range, band, lerp, clamp01 } from "@/hooks/use-scroll-progress";
import { TONE, Tall, VesselLegend, Reveal, BodyFigure, ECG, Vessel, Liver, Cell } from "./visuals";

/* ---------------------------------------------------------------- helpers */

function Eyebrow({ children, o = 1 }: { children: React.ReactNode; o?: number }) {
  return (
    <p className="eyebrow" style={{ color: TONE(0.34 * o), opacity: o }}>
      {children}
    </p>
  );
}

/* --------------------------------------------------- 1. opener — darkness */

export function ChapterOpen() {
  const [ref, p] = useSmoothProgress<HTMLElement>();
  const a = band(p, 0.03, 0.18, 0.24, 0.34);
  const b = band(p, 0.34, 0.44, 0.52, 0.62);
  const c = range(p, 0.64, 0.8);
  const pulse = range(p, 0, 0.9);

  return (
    <Tall id="problem" vh={340} refFn={ref}>
      {/* a single heartbeat of light behind the first words */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(60% 50% at 50% 50%, color-mix(in oklab, var(--blush) ${
            22 + pulse * 14
          }%, transparent), transparent 70%)`,
        }}
      />
      <div className="relative w-full max-w-5xl px-6 text-center">
        <div style={{ opacity: a }}>
          <Reveal
            text={"One dose\ndoesn't fit everyone."}
            t={range(p, 0.03, 0.24)}
            className="story-line"
            style={{ color: TONE(0.97) }}
          />
        </div>

        {/* The one passage of body copy in the act. It gets a real measure
            (~50ch) and near-full ink — at 875px wide in mid-grey it was the
            least readable thing on the site. */}
        <p
          className="absolute inset-x-0 top-1/2 mx-auto max-w-2xl px-6 text-xl leading-snug md:text-3xl"
          style={{
            color: TONE(0.82),
            opacity: b,
            transform: `translateY(calc(-50% + ${lerp(14, -14, range(p, 0.34, 0.62))}px))`,
          }}
        >
          Chemotherapy is dosed from height and weight — and almost nothing else.
        </p>

        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-6" style={{ opacity: c }}>
          <Reveal
            text={"For a few of them,\nthe cure is the danger."}
            t={range(p, 0.64, 0.9)}
            className="story-line-sm"
            style={{ color: TONE(0.97) }}
          />
        </div>
      </div>

      <div
        className="absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3"
        style={{ opacity: 1 - range(p, 0, 0.06) }}
      >
        <span className="hand-note" style={{ color: TONE(0.45) }}>
          scroll
        </span>
        <span
          className="block h-10 w-px"
          style={{ background: "linear-gradient(var(--hairline-strong), transparent)" }}
        />
      </div>
    </Tall>
  );
}

/* ------------------------------------------------------- 2. meet Emma     */

const EMMA_BEATS = [
  { t: "Meet Emma.", s: "She is not a statistic. Not yet." },
  { t: "43.", s: "Teacher. Two kids. A garden she's proud of." },
  { t: "Breast cancer.", s: "Stage II. Caught early. The prognosis is good." },
  { t: "Treatment begins today.", s: "Fluorouracil — 5-FU. Standard. Proven. Given to millions." },
];

export function ChapterEmma() {
  const [ref, p, active] = useSmoothProgress<HTMLElement>();
  const idx = Math.min(EMMA_BEATS.length - 1, Math.floor(p * EMMA_BEATS.length * 0.99));
  const beat = EMMA_BEATS[idx]!;
  const local = (p * EMMA_BEATS.length) % 1;
  const bpm = lerp(64, 71, p);

  return (
    <Tall vh={400} refFn={ref}>
      <div className="grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-6 md:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          <Eyebrow>A patient, not a statistic</Eyebrow>
          <div className="mt-6">
            <Reveal
              key={beat.t}
              text={beat.t}
              t={clamp01(0.1 + local * 5)}
              className="story-line"
              style={{ color: TONE(0.97) }}
            />
          </div>
          <p
            key={beat.s}
            className="mt-8 max-w-md text-lg md:text-xl"
            style={{
              color: TONE(0.52),
              opacity: clamp01(local * 4 - 0.5),
              transform: `translateY(${lerp(10, 0, clamp01(local * 4 - 0.5))}px)`,
            }}
          >
            {beat.s}
          </p>
        </div>

        {/* the only thing alive on screen */}
        <div className="hidden md:block">
          <BodyFigure
            className="mx-auto h-[300px]"
            breath={p * 6}
            stroke={TONE(0.4)}
            animate={active}
          />
          <ECG bpm={bpm} color={TONE(0.75)} className="mt-4 h-14 w-full" />
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl tabular-nums" style={{ color: TONE(0.9) }}>
              {Math.round(bpm)}
            </span>
            <span className="eyebrow" style={{ color: TONE(0.4) }}>
              bpm — stable
            </span>
          </div>
        </div>
      </div>
    </Tall>
  );
}

/* ------------------------------------------- 3. the drug enters the body  */

export function ChapterDrug() {
  const [ref, p, active] = useSmoothProgress<HTMLElement>();
  const flow = range(p, 0.05, 0.55);
  const arrive = range(p, 0.35, 0.7);
  const fail = range(p, 0.78, 1);

  return (
    <Tall id="why" vh={380} refFn={ref}>
      <div className="w-full max-w-6xl px-6">
        <Eyebrow>Chapter two — the drug</Eyebrow>

        <div className="mt-10 grid items-center gap-8 md:grid-cols-[1fr_240px]">
          <div>
            <div
              className="mb-2 flex justify-between text-[11px] uppercase tracking-[0.2em]"
              style={{ color: TONE(0.38) }}
            >
              <span>Bloodstream</span>
              <span>→ Liver</span>
            </div>
            <Vessel flow={flow} animate={active} />
            <VesselLegend />
            <div className="mt-6 flex gap-8">
              <Stat label="Dose delivered" v={`${Math.round(flow * 100)}%`} />
              <Stat label="DPD enzyme" v={fail > 0.4 ? "absent" : "clearing"} alarm={fail > 0.4} />
            </div>
          </div>
          <div>
            <Liver fill={arrive} alarm={fail} />
            <p className="hand-note mt-3 text-center" style={{ color: TONE(0.55) }}>
              the liver — where 5-FU is broken down
            </p>
          </div>
        </div>

        <div className="relative mt-14 h-[26vh]">
          <div className="absolute inset-x-0" style={{ opacity: band(p, 0.5, 0.62, 0.74, 0.84) }}>
            <Reveal
              text={"In the liver, one enzyme\nbreaks the drug down."}
              t={range(p, 0.5, 0.72)}
              className="story-line-sm"
              style={{ color: TONE(0.96) }}
            />
          </div>
          <div className="absolute inset-x-0" style={{ opacity: range(p, 0.84, 0.95) }}>
            <Reveal
              text={"Unless it can't."}
              t={range(p, 0.84, 1)}
              className="story-line"
              style={{ color: "var(--alarm)" }}
            />
          </div>
        </div>
      </div>
    </Tall>
  );
}

function Stat({ label, v, alarm }: { label: string; v: string; alarm?: boolean }) {
  return (
    <div>
      <p className="eyebrow" style={{ color: TONE(0.35) }}>
        {label}
      </p>
      <p
        className="mt-1 text-2xl tabular-nums md:text-3xl"
        style={{ color: alarm ? "var(--alarm)" : TONE(0.92) }}
      >
        {v}
      </p>
    </div>
  );
}

/* ----------------------------------------- 4. the zoom — human → mutation */

const ZOOM = [
  { label: "Human", note: "Emma — one body among millions" },
  { label: "Blood", note: "The drug, circulating" },
  { label: "Liver", note: "Where the breakdown is supposed to happen" },
  { label: "Cell", note: "One of two hundred billion — and inside it, the instruction manual" },
];

function ZoomArt({ i, spin, animate }: { i: number; spin: number; animate: boolean }) {
  const s = TONE(0.55);
  switch (i) {
    case 0:
      return <BodyFigure className="h-[220px]" stroke={s} breath={spin} animate={animate} />;
    case 1:
      // Red cells with 5-FU among them — the same two populations as the
      // vessel above, so the zoom reads as going closer, not as a new diagram.
      return (
        <svg viewBox="0 0 220 160" className="h-[200px]">
          {Array.from({ length: 8 }).map((_, k) => {
            const x = 30 + ((k * 47) % 165);
            const y = 32 + ((k * 63) % 96);
            return (
              <g key={k} transform={`translate(${x} ${y}) rotate(${(k * 41) % 180})`}>
                <ellipse
                  rx="17"
                  ry="10.5"
                  fill="color-mix(in oklab, var(--coral) 32%, transparent)"
                  stroke="color-mix(in oklab, var(--coral) 60%, transparent)"
                />
                <ellipse
                  rx="7"
                  ry="4.4"
                  fill="color-mix(in oklab, var(--coral) 44%, transparent)"
                />
              </g>
            );
          })}
          {Array.from({ length: 5 }).map((_, k) => (
            <circle
              key={`d${k}`}
              cx={48 + ((k * 71) % 150)}
              cy={54 + ((k * 37) % 70)}
              r="4.5"
              fill="var(--alarm)"
            />
          ))}
        </svg>
      );
    case 2:
      return (
        <div className="w-[300px]">
          <Liver fill={0.35} />
        </div>
      );
    default:
      return (
        <div className="w-[220px]">
          <Cell stroke={s} />
        </div>
      );
  }
}

export function ChapterZoom() {
  const [ref, p, active] = useSmoothProgress<HTMLElement>(0.09);
  const pos = p * (ZOOM.length - 1);
  const idx = Math.min(ZOOM.length - 1, Math.round(pos));

  return (
    <Tall vh={480} refFn={ref}>
      <div className="w-full max-w-6xl px-6">
        <Eyebrow>Keep scrolling — we go closer</Eyebrow>

        <div className="relative mt-8 h-[46vh]">
          {ZOOM.map((z, i) => {
            const d = pos - i;
            if (Math.abs(d) > 1.15) return null;
            const scale = Math.pow(3.4, d);
            return (
              <div
                key={z.label}
                className="absolute inset-0 flex flex-col items-center justify-center"
                style={{
                  opacity: Math.pow(1 - Math.min(1, Math.abs(d)), 1.4),
                  transform: `scale(${scale})`,
                  filter: `blur(${Math.abs(d) * 6}px)`,
                  pointerEvents: "none",
                  willChange: "transform",
                }}
              >
                <ZoomArt i={i} spin={p * 10} animate={active} />
                <p
                  className="mt-6 text-2xl md:text-4xl"
                  style={{
                    color: i === ZOOM.length - 1 ? "var(--alarm)" : TONE(0.95),
                    letterSpacing: "-0.03em",
                  }}
                >
                  {z.label}
                </p>
              </div>
            );
          })}
        </div>

        <p
          key={ZOOM[idx]!.note}
          className="mt-4 text-center text-base md:text-xl"
          style={{ color: TONE(0.55), animation: "fade-in .7s ease" }}
        >
          {ZOOM[idx]!.note}
        </p>

        {/* depth rail */}
        <div className="mt-8 flex items-center justify-center gap-2">
          {ZOOM.map((z, i) => (
            <span
              key={z.label}
              className="h-px transition-all duration-500"
              style={{
                width: i === idx ? 36 : 14,
                background: i <= idx ? TONE(0.8) : TONE(0.18),
              }}
            />
          ))}
        </div>
      </div>
    </Tall>
  );
}

/* ------------------------------- 5. you cause the accumulation by scrolling */

export function ChapterAccumulation() {
  const [ref, p] = useSmoothProgress<HTMLElement>(0.14);
  const load = range(p, 0.05, 0.85);
  const bpm = Math.round(lerp(72, 152, load));
  const shake = load > 0.6 ? (load - 0.6) * 6 : 0;

  return (
    <Tall vh={460} refFn={ref}>
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(120% 85% at 50% 62%, color-mix(in oklab, var(--alarm) ${load * 62}%, transparent), transparent 72%)`,
          animation:
            load > 0.35 ? `pulse-soft ${Math.max(0.4, 60 / bpm)}s ease-in-out infinite` : undefined,
        }}
      />
      <div
        className="relative w-full max-w-5xl px-6 text-center"
        style={{
          transform: `translate(${Math.sin(load * 90) * shake}px, ${Math.cos(load * 70) * shake * 0.6}px)`,
        }}
      >
        <p className="hand-note" style={{ color: TONE(0.5) }}>
          every scroll is another dose
        </p>
        <p className="story-line mt-6" style={{ color: TONE(0.97) }}>
          {load < 0.45 ? "The difference is invisible." : "Until it's too late."}
        </p>

        {/* the drug physically stacking up in the blood */}
        <div className="relative mx-auto mt-12 h-44 w-full max-w-2xl">
          <div
            className="absolute inset-x-0 bottom-0 rounded-t-xl"
            style={{
              height: `${load * 100}%`,
              background: `linear-gradient(to top, color-mix(in oklab, var(--alarm) 55%, transparent), transparent)`,
              transition: "height 120ms linear",
            }}
          />
          {Array.from({ length: 120 }).map((_, i) => {
            const seed = (i * 9301 + 49297) % 233280;
            const x = (seed / 233280) * 100;
            const rank = ((i * 37) % 120) / 120;
            const on = rank < load;
            const y = rank * 92;
            const drift = Math.sin(i + load * 8) * 3;
            return (
              <span
                key={i}
                className="absolute h-1.5 w-1.5 rounded-full"
                style={{
                  left: `${x}%`,
                  bottom: `${y}%`,
                  background: "var(--alarm)",
                  opacity: on ? 0.45 + rank * 0.55 : 0,
                  transform: `translateY(${on ? drift : 24}px)`,
                  transition: "opacity .5s ease, transform .5s ease",
                }}
              />
            );
          })}
          <div className="absolute inset-x-0 bottom-0 h-px" style={{ background: TONE(0.22) }} />
          <div
            className="absolute inset-x-0 flex justify-between text-[10px] uppercase tracking-[0.2em]"
            style={{ bottom: "72%", color: TONE(0.45) }}
          >
            <span>Safe threshold</span>
            <span style={{ color: load > 0.72 ? "var(--alarm)" : TONE(0.45) }}>
              {load > 0.72 ? "exceeded" : "holding"}
            </span>
          </div>
          <div
            className="absolute inset-x-0 border-t border-dashed"
            style={{ bottom: "72%", borderColor: TONE(0.28) }}
          />
        </div>

        <div className="mt-10 flex flex-wrap items-end justify-center gap-x-12 gap-y-6">
          <Metric
            label="5-FU in blood"
            value={`${Math.round(load * 620)}%`}
            of="of safe level"
            hot={load > 0.5}
          />
          <Metric label="Heart rate" value={`${bpm}`} of="bpm" hot={bpm > 110} />
          <Metric
            label="DPD activity"
            value={`${Math.round(lerp(100, 8, load))}%`}
            of="of normal"
            hot={load > 0.5}
          />
        </div>
        <div className="mx-auto mt-6 max-w-md">
          <ECG bpm={bpm} color={load > 0.5 ? "var(--alarm)" : TONE(0.7)} className="h-12 w-full" />
        </div>
      </div>
    </Tall>
  );
}

function Metric({
  label,
  value,
  of,
  hot,
}: {
  label: string;
  value: string;
  of: string;
  hot?: boolean;
}) {
  return (
    <div className="text-left">
      <p className="eyebrow" style={{ color: TONE(0.4) }}>
        {label}
      </p>
      <p
        className="mt-1 text-2xl tabular-nums md:text-4xl"
        style={{ color: hot ? "var(--alarm)" : TONE(0.95) }}
      >
        {value}{" "}
        <span className="text-xs uppercase tracking-widest" style={{ color: TONE(0.4) }}>
          {of}
        </span>
      </p>
    </div>
  );
}

/* ---------------------------------------------------------- 6. the silence */

export function ChapterSilence() {
  const [ref, p] = useSmoothProgress<HTMLElement>(0.08);
  const o = band(p, 0.24, 0.42, 0.76, 0.94);
  // Fade the dark in and out instead of letting the sticky panel slide up as a
  // hard band. Progress stays at 0 while the section is still below the fold,
  // so the panel is invisible until it already fills the screen — the lights
  // dim, rather than a black bar cutting the viewport in half.
  const dark = band(p, 0.02, 0.2, 0.8, 0.98);

  return (
    <Tall vh={280} refFn={ref} data-dark-beat="">
      {/* The one dark beat in the film. Deep plum, not black — it should feel
          like the lights dimming, not like a different website. */}
      <div className="absolute inset-0" style={{ background: "var(--night)", opacity: dark }} />
      <p
        className="relative px-6 text-center"
        style={{
          opacity: o,
          fontSize: "clamp(1.9rem, 5vw, 4rem)",
          lineHeight: 1.15,
          color: TONE(0.92),
          fontFamily: "var(--font-quiet)",
          fontStyle: "italic",
          fontWeight: 300,
          letterSpacing: "-0.02em",
        }}
      >
        What if this
        <br />
        could have been prevented?
      </p>
    </Tall>
  );
}
