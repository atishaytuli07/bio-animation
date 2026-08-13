import { Fragment, useEffect, useRef, useState } from "react";

/**
 * The cold open — and the load gate.
 *
 * Two lines play on the night canvas while the three.js chunk loads. Scroll is
 * locked so nobody lands mid-story before the stage exists; the overlay fades
 * out once the scene is live AND the lines have had time to land. This is the
 * narrative loader from the client brief, not a spinner:
 *
 *   "The same treatment doesn't mean the same outcome."
 *   "What if one small gene could change everything?"
 *
 * Timing rules:
 *  - first visit: hold at least MIN_FIRST so both lines are readable
 *  - repeat visit this session: hold only MIN_REPEAT — people re-reading the
 *    site shouldn't rewatch the trailer
 *  - never hold past MAX_WAIT: if GL still isn't ready, reveal anyway — the
 *    SVG placeholder underneath means there is something to reveal.
 */
const LINE1 = "The same treatment doesn't mean the same outcome.".split(" ");
const LINE2 = "What if one small gene could change everything?".split(" ");

const L1_START = 0.35;
const L2_START = 2.05;
const STAGGER = 0.085;
const MIN_FIRST = 3.4;
const MIN_REPEAT = 1.2;
const MAX_WAIT = 7;

export function StoryLoader({ ready }: { ready: boolean }) {
  const [phase, setPhase] = useState<"show" | "exit" | "gone">("show");
  const minHold = useRef(MIN_FIRST);
  const born = useRef(0);

  useEffect(() => {
    born.current = performance.now();
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      // Lines appear instantly (word-in is disabled by the media query), so
      // they only need a beat, not a performance.
      minHold.current = 1.0;
    } else if (sessionStorage.getItem("dpyd-intro-seen") === "1") {
      minHold.current = MIN_REPEAT;
    }
    sessionStorage.setItem("dpyd-intro-seen", "1");
  }, []);

  // Scroll lock for the loader's whole life — the reader cannot start the
  // film before the projector is running.
  useEffect(() => {
    if (phase === "gone") return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    window.scrollTo(0, 0);
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = prev;
    };
  }, [phase]);

  // Exit when (ready AND minimum hold elapsed) or at the hard cap.
  useEffect(() => {
    if (phase !== "show") return;
    const begin = () => setPhase("exit");
    const elapsed = (performance.now() - born.current) / 1000;
    const timers: ReturnType<typeof setTimeout>[] = [];
    if (ready) {
      timers.push(setTimeout(begin, Math.max(0, (minHold.current - elapsed) * 1000)));
    }
    timers.push(setTimeout(begin, Math.max(0, (MAX_WAIT - elapsed) * 1000)));
    return () => timers.forEach(clearTimeout);
  }, [ready, phase]);

  useEffect(() => {
    if (phase !== "exit") return;
    const t = setTimeout(() => setPhase("gone"), 750);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === "gone") return null;

  return (
    <div
      aria-hidden={phase === "exit"}
      className="fixed inset-0 z-100 flex flex-col items-center justify-center gap-8 px-6"
      style={{
        // A deepened version of the story's opening canvas, not the old plum
        // --night. The centre sits at the setup colour and the edges fall away,
        // so the fade-out lands continuously on the hero instead of cutting.
        background:
          "radial-gradient(125% 95% at 50% 42%, var(--act-setup), color-mix(in oklab, var(--act-setup) 72%, var(--ink)) 100%)",
        opacity: phase === "exit" ? 0 : 1,
        transition: "opacity 750ms ease",
        pointerEvents: phase === "exit" ? "none" : "auto",
      }}
    >
      {/* a slow swell of colour behind the words — depth, not decoration */}
      <div
        aria-hidden="true"
        className="loader-breathe pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(46% 32% at 50% 45%, color-mix(in oklab, var(--glow-amber) 30%, transparent), transparent 72%), radial-gradient(38% 26% at 62% 60%, color-mix(in oklab, var(--glow-cyan) 14%, transparent), transparent 74%)",
        }}
      />
      <div
        aria-hidden="true"
        className="grain pointer-events-none absolute inset-0"
        style={{ opacity: 0.06 }}
      />
      {/* `relative` on the copy: the background layers above are positioned, and
          positioned elements paint over in-flow content regardless of DOM order. */}
      <p
        className="relative max-w-3xl text-center"
        style={{
          fontSize: "clamp(1.6rem, 3.6vw, 2.9rem)",
          lineHeight: 1.2,
          letterSpacing: "-0.03em",
          fontWeight: 500,
          color: "var(--ink)",
          textWrap: "balance",
        }}
      >
        {LINE1.map((w, i) => (
          // Real space between the wrappers, not a fixed-width spacer span —
          // that collapsed its own whitespace, so the line copied (and read to
          // screen readers) as "Whatifonesmallgene…".
          <Fragment key={i}>
            <span className="inline-block overflow-hidden align-bottom">
              <span className="word-in" style={{ animationDelay: `${L1_START + i * STAGGER}s` }}>
                {w}
              </span>
            </span>{" "}
          </Fragment>
        ))}
      </p>

      <p
        className="quiet-line relative max-w-2xl text-center"
        style={{
          // Clearly subordinate to the opening line — it's the aside, not the
          // statement, and at 2.1rem the two lines were competing.
          fontSize: "clamp(1rem, 1.8vw, 1.45rem)",
          lineHeight: 1.35,
          color: "var(--ink-soft)",
          textWrap: "balance",
        }}
      >
        {LINE2.map((w, i) => (
          // Real space between the wrappers, not a fixed-width spacer span —
          // that collapsed its own whitespace, so the line copied (and read to
          // screen readers) as "Whatifonesmallgene…".
          <Fragment key={i}>
            <span className="inline-block overflow-hidden align-bottom">
              <span className="word-in" style={{ animationDelay: `${L2_START + i * STAGGER}s` }}>
                {w}
              </span>
            </span>{" "}
          </Fragment>
        ))}
      </p>

      {/* quiet progress affordance — appears only after the lines have played */}
      <span
        className="word-in relative mt-6 block h-0.5 w-24 overflow-hidden rounded-full"
        style={{
          animationDelay: `${L2_START + LINE2.length * STAGGER + 0.5}s`,
          background: "color-mix(in oklab, var(--ink) 16%, transparent)",
        }}
      >
        <span className="sweep absolute inset-y-0 w-1/3" style={{ background: "var(--ink)" }} />
      </span>
    </div>
  );
}
