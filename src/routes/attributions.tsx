import { createFileRoute, Link } from "@tanstack/react-router";

import { C, L, T } from "@/components/hero/palette";

/**
 * Attributions.
 *
 * iGEM requires this page, and requires it to be honest: every team must say
 * what was done by the team, what was done by others, and — new for 2026 —
 * where generative AI was used and how. A wiki that quietly omits AI use is
 * risking more than a lost medal criterion.
 *
 * So this page names the AI use plainly, including the parts that are
 * uncomfortable to name: the character illustrations are generated images, and
 * the site's code and interaction design were written with an AI assistant.
 * Saying so costs nothing. Being found out would cost the medal.
 *
 * THE TEAM MUST STILL COMPLETE THIS PAGE. Everything under "Still to be
 * completed" is a placeholder that only the team can fill — who did the lab
 * work, who supervised, which external groups helped. Those blocks are visible
 * on the page ON PURPOSE, so that an unfinished attributions page cannot be
 * mistaken for a finished one during a review.
 */

const TITLE = "Attributions — ChemoGuard";

export const Route = createFileRoute("/attributions")({
  head: () => ({
    meta: [
      { title: TITLE },
      {
        name: "description",
        content:
          "Who built what on the ChemoGuard wiki, which work came from outside the team, and where generative AI was used.",
      },
    ],
  }),
  component: Attributions,
});

/** A declared item: what it is, and who or what made it. */
type Entry = { what: string; who: string; note?: string };

const AI_USE: Entry[] = [
  {
    what: "Character illustrations",
    who: "Generated with an AI image model, then edited by the team",
    note: "The two patient figures in “Two people” and “Look closer” are AI-generated raster illustrations. They were keyed, defringed and colour-corrected by the team before use. They depict no real person and are not photographs.",
  },
  {
    what: "Wiki code and interaction design",
    who: "Written by the team with Claude, an AI assistant",
    note: "The scroll engine, the SVG illustrations drawn in code, the animation timing and the layout were produced in an assisted workflow: the team set the direction, reviewed every change and is responsible for what ships. No scientific claim on this wiki was authored by the model.",
  },
  {
    what: "Copywriting",
    who: "Drafted with AI assistance, edited by the team",
    note: "Headlines and captions were drafted in the same workflow and rewritten by the team. Every statement about DPYD, DPD or fluoropyrimidine toxicity is checked against the cited literature by a team member before publication.",
  },
];

const THIRD_PARTY: Entry[] = [
  {
    what: "Instrument Sans",
    who: "Rodrigo Fuenzalida and Nicole Fally — SIL Open Font License 1.1",
    note: "Self-hosted from this wiki. No external font service is used anywhere on the site.",
  },
  {
    what: "React, TanStack Router, Vite, Tailwind CSS",
    who: "Their respective authors — MIT licence",
  },
];

/** Blocks only the team can fill. Rendered visibly so they cannot be missed. */
const TODO = [
  "Wet-lab work: who performed which experiments, and under whose supervision.",
  "Dry-lab and modelling: who built the model, and on whose prior work it builds.",
  "Principal investigators, advisors and instructors, named individually.",
  "Any external lab, company or institution that donated materials, equipment, sequencing or time.",
  "Any protocol, part or dataset taken from a previous iGEM team, with the team and year.",
  "Human Practices: everyone interviewed or consulted, with their affiliation.",
];

function Section({ title, entries }: { title: string; entries: Entry[] }) {
  return (
    <section className="mt-14 md:mt-20">
      <h2 className="font-black" style={{ ...T.sub, color: C.ink }}>
        {title}
      </h2>
      <dl className="mt-6 space-y-6 md:space-y-7">
        {entries.map((e) => (
          <div
            key={e.what}
            className="border-l-2 pl-4 md:pl-5"
            style={{ borderColor: `${C.ink}22` }}
          >
            <dt className="text-[15px] font-bold md:text-[17px]" style={{ color: C.ink }}>
              {e.what}
            </dt>
            <dd
              className="mt-1 text-[14px] font-semibold md:text-[15px]"
              style={{ color: C.redDeep }}
            >
              {e.who}
            </dd>
            {e.note && (
              <dd
                className="mt-2 max-w-[62ch] text-[14px] leading-relaxed md:text-[15px]"
                style={{ color: C.inkBody }}
              >
                {e.note}
              </dd>
            )}
          </div>
        ))}
      </dl>
    </section>
  );
}

function Attributions() {
  return (
    <main
      className="min-h-screen px-6 pb-24 pt-20 md:px-10 md:pt-28"
      style={{ background: C.paper }}
    >
      <div className="mx-auto max-w-3xl">
        <Link to="/new" className={L.labelType} style={{ color: C.redDeep }}>
          <span className="block h-0.5 w-7" style={{ background: C.red }} />
          Back to the story
        </Link>

        <h1 className="mt-6 font-black md:mt-8" style={{ ...T.headline, color: C.ink }}>
          Attributions
        </h1>
        <p
          className="mt-5 max-w-[62ch] text-[15px] leading-relaxed md:text-[17px]"
          style={{ color: C.inkBody }}
        >
          What the team made, what came from elsewhere, and where generative AI was used. iGEM asks
          every team to declare this. We would rather over-declare than leave a reader guessing.
        </p>

        <Section title="Where generative AI was used" entries={AI_USE} />
        <Section title="Third-party work" entries={THIRD_PARTY} />

        <section className="mt-14 md:mt-20">
          <h2 className="font-black" style={{ ...T.sub, color: C.ink }}>
            Still to be completed by the team
          </h2>
          <p
            className="mt-3 max-w-[62ch] text-[14px] leading-relaxed md:text-[15px]"
            style={{ color: C.inkBody }}
          >
            This page is not finished. The items below can only be written by the people who did the
            work, and they are shown here rather than hidden so that an incomplete page is never
            mistaken for a complete one.
          </p>
          <ul className="mt-6 space-y-3">
            {TODO.map((t) => (
              <li
                key={t}
                className="flex gap-3 text-[14px] leading-relaxed md:text-[15px]"
                style={{ color: C.ink }}
              >
                <span
                  aria-hidden="true"
                  className="mt-2 block h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: C.red }}
                />
                {t}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
