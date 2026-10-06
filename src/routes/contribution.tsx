import { createFileRoute } from "@tanstack/react-router";

import { Awaiting, P, PageLink, PageShell, Section } from "@/components/story/PageShell";

// Contribution, Bronze medal criterion 3. The URL must be exactly /contribution: a judge following the
// standard link to a 404 fails the criterion on a technicality, so the page exists before its content does.
// It has to say what the contribution is and why it helps future teams. Only the team can write that.

const TITLE = "Contribution — ChemoGuard";
const DESCRIPTION =
  "What ChemoGuard leaves behind for future iGEM teams, and why it is useful to them.";

export const Route = createFileRoute("/contribution")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
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
        <PageLink to="/engineering">How it was built</PageLink>
      </div>
    </PageShell>
  );
}
