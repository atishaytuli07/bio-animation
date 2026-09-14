import { createFileRoute, Link } from "@tanstack/react-router";

import { C, L, T } from "@/components/hero/palette";
import { SiteFooter } from "@/components/story/PageShell";
import { SiteHeader } from "@/components/story/SiteHeader";

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
    note: "The two patient figures in “Two people” and “Look closer”, and the illustrated scientists that open the documentation pages, are AI-generated raster illustrations. They were keyed, defringed, colour-corrected and re-encoded by the team before use. They depict no real person, they are not photographs, and no member of the team is portrayed by any of them.",
  },
  {
    what: "Page headings and titles",
    who: "Set in live text by the team — never part of an image",
    note: "Some of the illustrations were generated with a page title drawn into the artwork. None is used that way. Every heading on this wiki is real text so that it can be read by a screen reader, scaled without softening, and set in the site’s own typeface. Where a figure appears to hold a sign, the words beside her are HTML.",
  },
  {
    what: "Wiki code and interaction design",
    who: "Written with Claude (Anthropic), an AI coding assistant, directed and reviewed by the team",
    note: "The scroll engine, the SVG illustrations drawn in code, the animation timing, the layout and the build pipeline were produced in an assisted workflow: the team set the direction, reviewed the changes and is responsible for what ships.",
  },
  /*
    STATED AS IT HAPPENED. This entry used to say that no scientific claim on
    the wiki was authored by the model, and that every statement was checked
    against the cited literature before publication. Neither was true: the
    explanatory science wording was drafted in the assisted workflow and then
    corrected in the team's scientific review, and five sources are still
    marked "Source needed". iGEM 2026 treats AI disclosure as a rule, and a
    declaration that overstates the team's checking is worse than an
    incomplete one. Keep this entry true as the wording is replaced and the
    sources arrive — update it, do not delete it.
  */
  {
    what: "Copywriting and explanatory science text",
    who: "Drafted with AI assistance; scientific wording corrected in the team's scientific review",
    note: "Headlines, captions and the plain-language explanations of DPYD, DPD and fluoropyrimidine toxicity on the Description page and in the story were drafted in the same workflow. The scientific wording was then reviewed and corrected by the team's scientific reviewer. Claims that still show a \u201cSource needed\u201d marker on the Description page have not yet been verified against the literature.",
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
  "AI use (iGEM 2026 requirement): for each use above, the model name and version, what it was used for, and the team member who reviewed the output and signed off.",
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
    /*
      THE SHARED HEADER, which this page did not have. It was built before the
      page shell and rendered only a "Back to the story" link, so the one page
      iGEM requires every team to publish had no navigation — against the
      client's "one navigation on every page". The top padding drops by the
      header's height so the title sits where it did.
    */
    <div className="min-h-screen" style={{ background: C.paper }}>
      <SiteHeader />
      <main className="px-6 pb-24 pt-12 md:px-10 md:pt-16">
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
            What the team made, what came from elsewhere, and where generative AI was used. iGEM
            asks every team to declare this. We would rather over-declare than leave a reader
            guessing.
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
              This page is not finished. The items below can only be written by the people who did
              the work, and they are shown here rather than hidden so that an incomplete page is
              never mistaken for a complete one.
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
      {/* the footer carries the licence and repository link iGEM requires on every page */}
      <SiteFooter />
    </div>
  );
}
