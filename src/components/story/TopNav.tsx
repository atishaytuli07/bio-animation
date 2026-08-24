import { useEffect, useState } from "react";

/**
 * Persistent top navigation — the judge's way in.
 *
 * This replaces the labelled left rail. The rail only appeared after the hero,
 * vanished again during the dark beat, was desktop-only, and ate a 256px
 * gutter on every section. For an iGEM wiki that is the wrong trade: judging
 * scores content a judge can *find*, so navigation has to be present from the
 * first frame and on every device.
 *
 * The chapter links are the story; "The Work" is deliberately set apart as a
 * button, because it is the layer judges are actually looking for.
 */

export const CHAPTERS = [
  { id: "opening", label: "Start" },
  { id: "problem", label: "The Problem" },
  { id: "why", label: "Why It Happens" },
  { id: "discovery", label: "The Discovery" },
  { id: "solution", label: "The Solution" },
  { id: "results", label: "The Results" },
  { id: "future", label: "The Future" },
] as const;

const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

export function TopNav() {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? window.scrollY / h : 0);
      setSolid(window.scrollY > window.innerHeight * 0.4);

      // The chapter whose top has most recently passed the reading line.
      const mid = window.innerHeight * 0.45;
      let current = 0;
      CHAPTERS.forEach((c, i) => {
        const el = document.getElementById(c.id);
        if (el && el.getBoundingClientRect().top <= mid) current = i;
      });
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="fixed inset-x-0 top-0 z-50"
      style={{
        // Transparent over the opening so the first frame is pure visual;
        // it earns its background once the story starts.
        background: solid ? "color-mix(in oklab, var(--paper) 82%, transparent)" : "transparent",
        backdropFilter: solid ? "blur(12px)" : "none",
        borderBottom: solid ? "1px solid var(--hairline)" : "1px solid transparent",
        transition: "background 400ms ease, border-color 400ms ease",
      }}
    >
      {/* Position within the whole story, as a hairline across the very top. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5">
        <div
          className="h-full"
          style={{
            // Grow by width, not scaleX — scaling a gradient smears the ramp.
            width: `${progress * 100}%`,
            background: "linear-gradient(90deg, var(--violet), var(--coral), var(--signal))",
          }}
        />
      </div>

      <nav
        aria-label="Sections"
        className="mx-auto flex h-14 max-w-[100rem] items-center justify-between gap-6 px-5 md:px-8"
      >
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="poster-line shrink-0 cursor-pointer text-[15px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
          style={{ color: "var(--ink)", letterSpacing: "0.01em" }}
        >
          Chemo<span style={{ color: "var(--signal)" }}>Guard</span>
        </button>

        {/* Chapter links collapse below lg — the wordmark and The Work stay. */}
        <ul className="hidden items-center gap-7 lg:flex">
          {CHAPTERS.map((c, i) => {
            const isActive = i === active;
            return (
              <li key={c.id}>
                <button
                  onClick={() => go(c.id)}
                  aria-current={isActive ? "true" : undefined}
                  className="relative cursor-pointer whitespace-nowrap py-1 text-[11px] uppercase tracking-[0.18em] transition-colors duration-300 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
                  style={{ color: isActive ? "var(--ink)" : "var(--ink-faint)" }}
                >
                  {c.label}
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-0.5 block h-px origin-left transition-transform duration-500"
                    style={{
                      background: "var(--signal)",
                      transform: `scaleX(${isActive ? 1 : 0})`,
                    }}
                  />
                </button>
              </li>
            );
          })}
        </ul>

        <button
          onClick={() => go("work")}
          className="sticker shrink-0 cursor-pointer px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          style={{ background: "var(--paper)", color: "var(--ink)" }}
        >
          The Work
        </button>
      </nav>
    </header>
  );
}
