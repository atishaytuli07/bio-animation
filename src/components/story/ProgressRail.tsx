import { useEffect, useState } from "react";

export const CHAPTERS = [
  { id: "problem", label: "The Problem" },
  { id: "why", label: "Why It Happens" },
  { id: "discovery", label: "The Discovery" },
  { id: "solution", label: "The Solution" },
  { id: "results", label: "The Results" },
  { id: "future", label: "The Future" },
  // The reference layer. Judges need a way into the evidence without
  // scrubbing the whole film to find it.
  { id: "work", label: "The Work" },
] as const;

/** Row pitch: marker box (12px) + gap (20px). The spine is drawn to match. */
const ROW = 32;

export function ProgressRail() {
  const [active, setActive] = useState(0);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    const onScroll = () => {
      // Stay out of the way until the hero has handed off to the story proper —
      // and again during the dark beat, where ink-on-plum would be unreadable
      // and the chrome would undercut the pause the beat is there to create.
      const first = document.getElementById(CHAPTERS[0].id);
      const beforeStory = !first || first.getBoundingClientRect().top > window.innerHeight * 0.6;
      const mid = window.innerHeight * 0.45;
      const dark = document.querySelector("[data-dark-beat]");
      const inDark =
        !!dark &&
        (() => {
          const r = dark.getBoundingClientRect();
          return r.top <= mid && r.bottom >= mid;
        })();
      setHidden(beforeStory || inDark);

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

  const spineTop = 6; // centre of the first marker
  const spineLength = (CHAPTERS.length - 1) * ROW;

  return (
    <nav
      aria-label="Chapters"
      className="fixed left-8 top-1/2 z-50 hidden -translate-y-1/2 lg:block"
      style={{ opacity: hidden ? 0 : 1, transition: "opacity 700ms ease" }}
    >
      <div className="relative">
        {/* The spine turns six loose dashes into one object. */}
        <span
          aria-hidden="true"
          className="absolute left-[5px] w-px"
          style={{ top: spineTop, height: spineLength, background: "var(--hairline)" }}
        />
        <span
          aria-hidden="true"
          className="absolute left-[5px] w-px origin-top"
          style={{
            top: spineTop,
            height: spineLength,
            background: "var(--ink)",
            transform: `scaleY(${active / (CHAPTERS.length - 1)})`,
            transition: "transform 700ms cubic-bezier(.4,0,.2,1)",
          }}
        />

        <ul style={{ display: "grid", rowGap: ROW - 12 }}>
          {CHAPTERS.map((c, i) => {
            const isActive = i === active;
            const isPast = i < active;
            return (
              <li key={c.id} className="h-3">
                <button
                  onClick={() =>
                    document.getElementById(c.id)?.scrollIntoView({ behavior: "smooth" })
                  }
                  aria-current={isActive ? "true" : undefined}
                  className="group flex h-3 items-center gap-4 text-left focus-visible:outline-none"
                >
                  {/* Square markers, not dots — flat and hairline, like the rest. */}
                  <span
                    className="block size-[11px] shrink-0 border transition-all duration-500 group-focus-visible:ring-2 group-focus-visible:ring-signal group-focus-visible:ring-offset-2"
                    style={{
                      borderColor: isActive || isPast ? "var(--ink)" : "var(--hairline-strong)",
                      background: isActive || isPast ? "var(--ink)" : "transparent",
                      // The current chapter is the filled square plus a halo —
                      // an inset ring at 11px just reads as mud.
                      boxShadow: isActive
                        ? "0 0 0 3px color-mix(in oklab, var(--ink) 26%, transparent)"
                        : "none",
                    }}
                  />
                  <span
                    className="w-6 text-[10px] tabular-nums tracking-[0.14em] transition-colors duration-500"
                    style={{ color: isActive ? "var(--ink)" : "var(--ink-faint)" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="whitespace-nowrap text-[11px] uppercase tracking-[0.2em] transition-colors duration-500 group-hover:text-ink"
                    style={{
                      color: isActive
                        ? "var(--ink)"
                        : isPast
                          ? "var(--ink-soft)"
                          : "var(--ink-faint)",
                    }}
                  >
                    {c.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
