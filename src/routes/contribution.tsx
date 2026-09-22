import { createFileRoute, Link } from "@tanstack/react-router";

import { C, R } from "@/components/hero/palette";
import { Awaiting, P, PageShell, Section } from "@/components/story/PageShell";

/**
 * Contribution — Bronze medal criterion #3.
 *
 * iGEM's wording: "Make a useful contribution for future iGEM teams", with
 * `/contribution` as the Required Standard URL. The page has to exist at
 * exactly that path whatever it ends up containing, which is why it is built
 * now and not when the content arrives: a judge following the standard URL to
 * a 404 is a medal criterion failed on a technicality.
 *
 * What counts, in iGEM's own examples (official React template,
 * src/contents/contribution.tsx): a new or significantly improved BioBrick
 * part in the Registry; software, tools or resources that considerably help
 * future teams; optimised protocols, techniques or methods; or any other
 * contribution with a clear benefit to future teams. The page must also
 * explain WHY the effort is a contribution — that is half of the criterion.
 *
 * As everywhere on this wiki, nothing is written on the team's behalf. What
 * the contribution is can only come from the work they did.
 */

const TITLE = "Contribution — ChemoGuard";

export const Route = createFileRoute("/contribution")({
  head: () => ({
    meta: [
      { title: TITLE },
      {
        name: "description",
        content:
          "What ChemoGuard leaves behind for future iGEM teams, and why it is useful to them.",
      },
    ],
  }),
  component: Contribution,
});

/** The index rail; ids match the sections below. */
const SECTIONS = [
  { id: "what", label: "What we contribute" },
  { id: "why", label: "Why it helps future teams" },
  { id: "use", label: "How to use it" },
];

function Contribution() {
  return (
    <PageShell
      title="Contribution"
      lede="What this project leaves behind for the teams that come after it — and why it is worth their time."
      piece="handoff"
      sections={SECTIONS}
    >
      <Section id="what" title="What we contribute">
        <P>
          iGEM asks every team to make a useful contribution for future iGEM teams and to document
          it here. Its examples are a new or significantly improved part in the Registry; software,
          tools or resources that considerably help future teams; optimised protocols, techniques or
          methods; or anything else with a clear benefit to the teams that follow.
        </P>
        <Awaiting what="Needs the team: the contribution">
          What it is, concretely — a part with its Registry name, a protocol, a dataset, a tool —
          and where a future team finds it. Only something the team actually made or measured
          belongs here.
        </Awaiting>
      </Section>

      <Section id="why" title="Why it helps future teams">
        <P>
          Documenting the contribution is half of the criterion; the other half is explaining why it
          is one. A reader should come away knowing which future project this saves time for, and
          what it would have cost them without it.
        </P>
        <Awaiting what="Needs the team: the case for it">
          Who would use it and for what, what it improves on, and any evidence that it works — with
          the data or characterisation behind that claim linked or shown.
        </Awaiting>
      </Section>

      <Section id="use" title="How to use it">
        <P>
          A contribution that cannot be reused is a description, not a contribution. This section is
          where a future team gets from reading about it to using it.
        </P>
        <Awaiting what="Needs the team: instructions">
          The steps, files, part numbers or links needed to reproduce or build on it, and any limits
          or caveats a future team should know before relying on it.
        </Awaiting>
      </Section>

      <div className="mt-14 md:mt-20">
        <Link
          to="/engineering"
          className="inline-block px-6 py-3 text-[15px] font-bold"
          style={{
            background: C.redDeep,
            color: "#fff",
            border: `2.5px solid ${C.ink}`,
            borderRadius: R.sm,
            boxShadow: `4px 4px 0 ${C.ink}`,
          }}
        >
          How it was built
        </Link>
      </div>
    </PageShell>
  );
}
