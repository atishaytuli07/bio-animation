import { useInView } from "@/hooks/use-scroll-progress";
import { TONE } from "./visuals";

/**
 * The reference layer — the part a judge reads rather than experiences.
 *
 * The story above is a film; this is the wiki. It deliberately breaks the
 * scroll-driven language: no pinning, no scrubbed animation, smaller type,
 * denser layout, everything skimmable and linkable. Detail lives in native
 * <details> panels so it collapses by default (a casual reader is never
 * walled off by protocol text) and still works with JavaScript disabled.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * CONTENT IS INTENTIONALLY EMPTY. Every panel below is a labelled slot, not
 * invented content. Do not ship placeholder prose as if it were real: fill
 * these from the team's own notebook, protocols and attribution records.
 * ─────────────────────────────────────────────────────────────────────────
 */
type Panel = { title: string; hint: string };

const SECTIONS: { id: string; label: string; blurb: string; panels: Panel[] }[] = [
  {
    id: "work-project",
    label: "Project",
    blurb: "How the assay is designed, and why each decision was made.",
    panels: [
      { title: "Design", hint: "Assay architecture, and the reasoning behind each choice." },
      {
        title: "Engineering cycle",
        hint: "Design → build → test → learn, one entry per iteration.",
      },
      { title: "Parts", hint: "Registry parts used and contributed, with links." },
      { title: "Contribution", hint: "What this leaves behind for the next team." },
    ],
  },
  {
    id: "work-lab",
    label: "Lab",
    blurb: "Everything needed to reproduce the work.",
    panels: [
      { title: "Protocols", hint: "Step-by-step methods, reagents, and conditions." },
      { title: "Notebook", hint: "Dated experimental record." },
      { title: "Results & data", hint: "Raw and processed data, with what each run showed." },
      { title: "Safety", hint: "Risk assessment, containment, and institutional approvals." },
    ],
  },
  {
    id: "work-people",
    label: "People & practice",
    blurb: "Who did the work, who helped, and who it is for.",
    panels: [
      { title: "Team", hint: "Members, roles, and photographs." },
      {
        title: "Human practices",
        hint: "Stakeholders consulted and how their input changed the design.",
      },
      { title: "Education & outreach", hint: "Activities, audiences, and what came of them." },
      {
        title: "Attributions",
        hint: "Exactly who did what, and every outside contribution. NOTE: the liver and cell artwork are adapted from CC0 sources (svgrepo.com) — no credit required, but list them here anyway. Any CC-BY asset added later MUST be credited in this panel.",
      },
    ],
  },
];

function Section({ section }: { section: (typeof SECTIONS)[number] }) {
  const [ref, seen] = useInView<HTMLDivElement>(0.15);
  return (
    <div
      ref={ref}
      id={section.id}
      className="scroll-mt-24 border-t pt-10"
      style={{
        borderColor: "var(--hairline)",
        opacity: seen ? 1 : 0,
        transform: `translateY(${seen ? 0 : 12}px)`,
        transition: "opacity 700ms ease, transform 700ms ease",
      }}
    >
      <div className="grid gap-8 md:grid-cols-[220px_minmax(0,1fr)]">
        <div>
          <h3 className="text-xl text-ink md:text-2xl" style={{ letterSpacing: "-0.03em" }}>
            {section.label}
          </h3>
          <p className="mt-2 max-w-[26ch] text-sm leading-relaxed text-ink-faint">
            {section.blurb}
          </p>
        </div>

        <div className="grid gap-2 overflow-hidden rounded-sm">
          {section.panels.map((p) => (
            <details key={p.title} className="group glass-card">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm text-ink transition-colors hover:bg-[color-mix(in_oklab,var(--ink)_6%,transparent)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink md:text-base">
                <span>{p.title}</span>
                <span
                  aria-hidden="true"
                  className="text-lg leading-none transition-transform duration-300 group-open:rotate-45"
                  style={{ color: "var(--ink-faint)" }}
                >
                  +
                </span>
              </summary>
              <div className="px-5 pb-5 text-sm leading-relaxed" style={{ color: TONE(0.62) }}>
                {p.hint}
                <p className="mt-2 text-xs" style={{ color: "var(--ink-faint)" }}>
                  Content to be added by the team.
                </p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}

export function StoryAppendix() {
  return (
    <section id="work" className="px-6 py-28 md:py-40 lg:pl-64">
      <div className="mx-auto max-w-5xl">
        <p className="eyebrow mb-4" style={{ color: "var(--ink-faint)" }}>
          The Work
        </p>
        <h2
          className="max-w-2xl text-3xl text-ink md:text-5xl"
          style={{ letterSpacing: "-0.04em", textWrap: "balance" }}
        >
          The evidence behind the story.
        </h2>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft">
          Everything above is the argument. Everything below is the record — methods, data, people,
          and what we owe to others. Open any panel to read the detail.
        </p>

        <div className="mt-16 space-y-14">
          {SECTIONS.map((s) => (
            <Section key={s.id} section={s} />
          ))}
        </div>
      </div>
    </section>
  );
}
