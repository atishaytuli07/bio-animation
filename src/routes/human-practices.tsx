import { createFileRoute, Link } from "@tanstack/react-router";

import { C, L, R } from "@/components/hero/palette";
import { ART } from "@/components/story/PageHero";
import { Awaiting, P, PageShell, Section } from "@/components/story/PageShell";

/**
 * Human Practices.
 *
 * The heaviest of the three remaining pages, and the one most often written
 * badly. iGEM's criterion is not "did you do outreach" — it is whether the
 * work is responsible and good for the world, and whether what the team
 * learned outside the lab CHANGED the project. A page that lists talks given
 * and posts published scores nothing; a page that says "we believed X, a
 * clinician told us Y, so we did Z instead" scores the medal.
 *
 * So the structure below is built around that arc rather than around
 * activities, and the section that matters most is "What changed because of
 * it". Every prompt asks for a decision with a cause, not a description.
 *
 * NOTHING HERE IS WRITTEN FOR THE TEAM. This project has already had to undo
 * one invented claim, and Human Practices is the page where invention would be
 * least recoverable — the people, the conversations and the changes are facts
 * about what a specific group of students actually did. The prose on this page
 * describes what each section is for; every claim is an Awaiting panel.
 */

const TITLE = "Human Practices — ChemoGuard";

export const Route = createFileRoute("/human-practices")({
  head: () => ({
    meta: [
      { title: TITLE },
      {
        name: "description",
        content:
          "Who ChemoGuard is for, who the team spoke to about it, and what changed in the project as a result.",
      },
    ],
  }),
  component: HumanPractices,
});

/**
 * The people a DPYD test touches, and what each of them needs from it.
 *
 * This list is the one piece of content on the page that can be written from
 * the project's own premise rather than from the team's work: if a test is
 * meant to run before a first dose of fluoropyrimidine chemotherapy, then
 * these are the people it has to fit around. The team still has to say who
 * they actually spoke to, which is the Awaiting panel underneath.
 */
const STAKEHOLDERS = [
  {
    who: "Patients about to start treatment",
    stake:
      "They carry the risk. A test that arrives after the first dose, or that nobody explains to them, is not a benefit to them at all.",
  },
  {
    who: "Oncologists and pharmacists",
    stake:
      "They decide the dose. What they need is a result they can act on, in time, with guidance on what to do with it.",
  },
  {
    who: "Laboratory staff",
    stake:
      "They run it. Sample type, turnaround, equipment and cost decide whether a test is adopted or quietly skipped.",
  },
  {
    who: "Health systems and payers",
    stake:
      "They fund it. Who is offered the test, and whether it reaches people outside well-resourced hospitals, is decided here.",
  },
];

/** The index rail; ids match the sections below. */
const SECTIONS = [
  { id: "why", label: "Why this matters" },
  { id: "who", label: "Who it affects" },
  { id: "spoke", label: "Who we spoke to" },
  { id: "heard", label: "What we heard" },
  { id: "changed", label: "What changed" },
  { id: "ethics", label: "Ethics and access" },
  { id: "reflection", label: "Reflection" },
];

function HumanPractices() {
  return (
    <PageShell
      title="Human Practices"
      lede="A test that changes a chemotherapy dose is not only a technical problem. This page records who ChemoGuard is meant to serve, what the people around it told us, and the decisions we made differently because of what we heard."
      art={ART.generic}
      sections={SECTIONS}
    >
      <Section id="why" title="Why this matters">
        <P>
          Fluoropyrimidine chemotherapy is given to very large numbers of people, and the dose is
          usually calculated from body surface area rather than from how quickly a particular body
          can clear the drug. For a person carrying a DPYD variant that reduces DPD activity, a
          standard dose can be more than they can handle.
        </P>
        <P>
          That makes this a project about a decision someone else makes on your behalf, before you
          have any symptoms to report. The questions that follow — who is offered the test, how fast
          the result comes back, who explains it, and what happens to people the test is never
          offered to — are not downstream of the science. They decide whether the science helps
          anyone.
        </P>
        <Awaiting what="Needs the team: the local picture">
          Fluoropyrimidine use and DPYD testing practice in Kazakhstan specifically — whether
          pre-treatment testing is currently done, by whom, and what it costs. This is the fact that
          makes the project local rather than generic, and it needs a source.
        </Awaiting>
      </Section>

      <Section id="who" title="Who it affects">
        <P>
          Four groups have to be satisfied for a pre-treatment test to reach the person it is meant
          to protect. A design that works for one and not the others does not get used.
        </P>
        <div className="mt-5 space-y-3">
          {STAKEHOLDERS.map((s) => (
            <div
              key={s.who}
              className="rounded-[10px] px-4 py-3.5 md:px-5"
              style={{ background: `${C.lavender}14`, border: `2px solid ${C.ink}14` }}
            >
              <span className="text-[15px] font-black md:text-[16px]" style={{ color: C.ink }}>
                {s.who}
              </span>
              <p
                className="mt-1 max-w-[62ch] text-[14px] leading-relaxed md:text-[15px]"
                style={{ color: C.inkBody }}
              >
                {s.stake}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="spoke" title="Who we spoke to">
        <P>
          Names, roles and affiliations, with the date of each conversation. A judge reads this
          section to find out whether the project was checked against people who would actually use
          it, so a short list of real conversations is worth more than a long list of activities.
        </P>
        <Awaiting what="Needs the team: the people">
          For each: who they are, what they do, when you spoke, and what you asked them. Include the
          people who were sceptical — a stakeholder who disagreed is more useful evidence than five
          who approved. Anyone quoted or named must have agreed to it.
        </Awaiting>
      </Section>

      <Section id="heard" title="What we heard">
        <P>
          The substance of those conversations, including the parts that were inconvenient. This
          section is not a summary of agreement; it is where the project's assumptions were tested
          against people who know the setting.
        </P>
        <Awaiting what="Needs the team: what they told you">
          What each person said that you did not already know or believe. Where two of them
          disagreed with each other, say so and say which way you went.
        </Awaiting>
      </Section>

      <Section id="changed" title="What changed because of it">
        {/*
          The section the medal actually turns on, and the one teams leave
          thinnest. It is deliberately placed after "what we heard" so the cause
          sits directly above the effect, and its prompt asks for the shape of
          an answer — believed X, learned Y, did Z — rather than for a
          description.
        */}
        <P>
          This is the part the criterion rewards, and the part most often missing. Integrated Human
          Practices means the project is different because of what was learned outside the lab — not
          that the team went outside the lab and then carried on.
        </P>
        <P>
          The useful shape is a decision with a cause:{" "}
          <em>we assumed this, we were told that, so we changed this specific thing.</em> A change
          to the sample type, the readout, the turnaround target, the wording of a result, or the
          decision not to build something at all — any of those counts, and an abandoned idea counts
          as much as a built one.
        </P>
        <Awaiting what="Needs the team: decisions with causes">
          Each change: what the project was going to do, what you learned, what it does now, and who
          or what prompted it. If nothing changed, say that plainly and say why — an honest account
          of a project that did not move reads far better than an invented one.
        </Awaiting>
      </Section>

      <Section id="ethics" title="Ethics and access">
        <P>
          A test only helps the people it reaches. The questions here are who gets offered it, what
          the result means for someone who cannot act on it, how a genetic result is stored and who
          can see it, and what happens when the test is unavailable or unaffordable.
        </P>
        <P>
          A result that says &ldquo;reduce the dose&rdquo; is not useful in a setting with no way to
          adjust it, and a genetic result is information about a family, not only about the person
          who gave the sample. Both belong here.
        </P>
        <Awaiting what="Needs the team: consent, data and equity">
          How samples and genetic data would be consented, stored and shared. Who would be offered
          the test and who would not. What the project does about the gap between those two.
        </Awaiting>
      </Section>

      <Section id="reflection" title="Reflection">
        <P>
          What the team would do differently, and what remains unresolved. Naming a limitation is
          not a weakness on this page — it is the evidence that the work was examined rather than
          defended.
        </P>
        <Awaiting what="Needs the team: what is still open" />
      </Section>

      <div className="mt-14 flex flex-wrap gap-3 md:mt-20">
        <Link
          to="/description"
          className="inline-block px-6 py-3 text-[15px] font-bold"
          style={{
            background: C.redDeep,
            color: "#fff",
            border: `2.5px solid ${C.ink}`,
            borderRadius: R.sm,
            boxShadow: `4px 4px 0 ${C.ink}`,
          }}
        >
          What the project is
        </Link>
        <Link
          to="/safety"
          className="inline-block px-6 py-3 text-[15px] font-bold"
          style={{
            background: C.paper,
            color: C.ink,
            border: `2.5px solid ${C.ink}`,
            borderRadius: R.sm,
            boxShadow: `4px 4px 0 ${C.ink}`,
          }}
        >
          How we work safely
        </Link>
      </div>
      <p className={`mt-6 ${L.note}`} style={{ color: C.inkNote }}>
        Every panel above marked &ldquo;needs the team&rdquo; is written by NIS Kazakhstan
      </p>
    </PageShell>
  );
}
