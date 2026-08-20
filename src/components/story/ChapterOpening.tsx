import { clamp01, lerp, range, useSmoothProgress, useTime } from "@/hooks/use-scroll-progress";
import { TONE, Tall, Reveal, BodyFigure, ECG } from "./visuals";

/**
 * The opening scene — visual first, zero jargon.
 *
 * Two patients. Same dose. As the reader scrolls, the medicine drips into
 * both; one body clears it, the other begins to fill with red. The whole
 * problem lands in the first few seconds without a single scientific term —
 * the science is earned later, chapter by chapter. (This is the client brief
 * and the original mentor spec: "don't start with science, start with
 * emotion".)
 */

/** Ambient field of blood cells drifting at different depths, like the ref. */
const FIELD = Array.from({ length: 16 }, (_, i) => ({
  x: (i * 61) % 100,
  y: (i * 37 + 11) % 100,
  size: 14 + ((i * 23) % 52),
  red: i % 3 === 0,
  depth: 0.3 + ((i * 13) % 7) / 10, // 0.3 near … 1.0 far
  phase: (i * 1.7) % (Math.PI * 2),
}));

function CellField({ p, active }: { p: number; active: boolean }) {
  const t = useTime(active);
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      {FIELD.map((c, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${c.x}%`,
            top: `${c.y}%`,
            width: c.size,
            height: c.size * 0.9,
            background: c.red
              ? `color-mix(in oklab, var(--signal) ${lerp(85, 55, c.depth)}%, var(--paper))`
              : `color-mix(in oklab, var(--ink) ${lerp(16, 8, c.depth)}%, var(--paper))`,
            // far cells blur — cheap depth, exactly the reference's trick
            filter: c.depth > 0.65 ? `blur(${(c.depth - 0.6) * 9}px)` : undefined,
            transform: `translate3d(${Math.sin(t * 0.3 + c.phase) * 14 * (1 - c.depth)}px, ${
              Math.cos(t * 0.24 + c.phase) * 10 * (1 - c.depth) - p * 120 * (1 - c.depth)
            }px, 0)`,
            boxShadow: c.red ? "inset -3px -4px 8px oklch(0 0 0 / 0.12)" : undefined,
            opacity: lerp(0.9, 0.45, c.depth),
          }}
        />
      ))}
    </div>
  );
}

/** A vertical IV drip of drug particles entering a body. */
function Drip({ on, alarm, active }: { on: number; alarm: number; active: boolean }) {
  const t = useTime(active);
  if (on <= 0.01) return null;
  return (
    <svg viewBox="0 0 40 120" className="h-28 w-10" aria-hidden="true">
      <line x1="20" y1="0" x2="20" y2="120" stroke={TONE(0.14)} strokeWidth="1" />
      {Array.from({ length: 6 }).map((_, i) => {
        const phase = (((t * 0.35 + i / 6) % 1) + 1) % 1;
        return (
          <circle
            key={i}
            cx="20"
            cy={phase * 120}
            r={2.6}
            fill={alarm > 0.4 ? "var(--alarm)" : "var(--coral)"}
            opacity={on * (0.3 + 0.7 * Math.sin(phase * Math.PI))}
          />
        );
      })}
    </svg>
  );
}

function Patient({
  label,
  alarm,
  bpm,
  drip,
  cleared,
  active,
}: {
  label: string;
  alarm: number;
  bpm: number;
  drip: number;
  cleared: number;
  active: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <Drip on={drip} alarm={alarm} active={active} />
      <BodyFigure
        className="h-[26vh] min-h-40"
        stroke={TONE(0.45)}
        alarm={alarm}
        animate={active}
      />
      <div className="mt-3 h-10 w-40">
        <ECG
          bpm={bpm}
          color={alarm > 0.4 ? "var(--alarm)" : cleared > 0.4 ? "var(--vital)" : TONE(0.6)}
          className="h-8 w-full"
        />
      </div>
      <span className="hand-note mt-1" style={{ color: TONE(0.5) }}>
        {label}
      </span>
    </div>
  );
}

export function ChapterOpening() {
  const [ref, p, active] = useSmoothProgress<HTMLElement>(0.1);

  const figuresIn = range(p, 0.02, 0.14);
  const drip = band(p, 0.16, 0.3, 0.72, 0.85);
  const diverge = range(p, 0.42, 0.72); // right patient starts failing
  const title = range(p, 0.74, 0.92);
  const cue = 1 - range(p, 0.02, 0.08);

  return (
    <Tall vh={380} refFn={ref}>
      <CellField p={p} active={active} />

      {/* the two patients, centre stage — no words needed yet */}
      <div
        className="relative flex items-end justify-center gap-[12vw] px-6"
        style={{ opacity: figuresIn, transform: `translateY(${lerp(30, 0, figuresIn)}px)` }}
      >
        <Patient
          label="patient one"
          alarm={0}
          bpm={lerp(70, 72, p)}
          drip={drip}
          cleared={diverge}
          active={active}
        />
        <div
          className="hand-note pb-24 text-center"
          style={{ color: TONE(0.55), opacity: band(p, 0.2, 0.3, 0.68, 0.8) }}
        >
          the same dose
          <span className="mx-auto mt-2 block h-px w-16" style={{ background: TONE(0.25) }} />
        </div>
        <Patient
          label="patient two"
          alarm={diverge}
          bpm={lerp(70, 138, diverge)}
          drip={drip}
          cleared={0}
          active={active}
        />
      </div>

      {/* the title arrives only after the visuals have made the point */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-[10vh] px-6 text-center"
        style={{ opacity: title }}
      >
        <Reveal
          text={"Same treatment.\nDifferent outcome."}
          t={title}
          className="story-line-sm"
          style={{ color: TONE(0.97) }}
        />
      </div>

      <div
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
        style={{ opacity: cue }}
      >
        <span className="hand-note" style={{ color: TONE(0.45) }}>
          scroll
        </span>
        <span
          className="block h-8 w-px"
          style={{ background: "linear-gradient(var(--hairline-strong), transparent)" }}
        />
      </div>
    </Tall>
  );
}

/** Ramps 0→1→0 across [a,b] and [c,d] — local copy to avoid a wide import. */
function band(p: number, a: number, b: number, c: number, d: number) {
  return clamp01((p - a) / (b - a)) - clamp01((p - c) / (d - c));
}
