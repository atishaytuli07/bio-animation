import { createFileRoute, Link } from "@tanstack/react-router";

import { C, L } from "@/components/hero/palette";
import { ART } from "@/components/story/PageHero";
import { Awaiting, P, PageShell, Section } from "@/components/story/PageShell";

/**
 * Engineering.
 *
 * iGEM judges this page against the engineering cycle — Design, Build, Test,
 * Learn — and against whether the team went round it more than once. A single
 * pass with a good result scores less than two passes where the first one
 * failed and the team said why.
 *
 * So this page is STRUCTURED rather than written. The cycle is laid out with
 * its four phases named, because that structure is itself the thing being
 * judged and it is worth having in place before the content arrives. Every
 * phase is an Awaiting panel: none of it can be written from the literature,
 * and none of it is known to whoever writes this file.
 *
 * The prompts inside each panel are deliberately specific. "Describe your
 * design" produces a paragraph; "what did you expect to happen, and what
 * actually happened" produces the thing judges are looking for.
 */

const TITLE = "Engineering — ChemoGuard";

export const Route = createFileRoute("/engineering")({
  head: () => ({
    meta: [
      { title: TITLE },
      {
        name: "description",
        content:
          "How ChemoGuard was designed, built, tested and revised — the engineering cycle behind the project.",
      },
    ],
  }),
  component: Engineering,
});

/** The four phases, with the question each one has to answer. */
const CYCLE = [
  {
    phase: "Design",
    ask: "What was decided, and why that rather than the alternatives",
    prompt:
      "The requirement the design had to meet, the options considered, and the reason this one was chosen. A judge is looking for a decision with a justification, not a description of the final object.",
  },
  {
    phase: "Build",
    ask: "What was actually made",
    prompt:
      "Constructs, parts, assemblies, protocols. What came from a registry or a previous team, and what is new. Part numbers where they exist.",
  },
  {
    phase: "Test",
    ask: "What was expected, and what happened",
    prompt:
      "The experiment, the controls, the readout, and the result — including the results that did not work. Negative results are worth more here than a clean story, because they are what the next phase is built on.",
  },
  {
    phase: "Learn",
    ask: "What changed as a result",
    prompt:
      "What the test showed, what was wrong with the design because of it, and what was done differently next time. This is the phase most teams skip, and it is the one that carries the criterion.",
  },
];

/** The index rail; ids match the sections below. */
const SECTIONS = [
  { id: "cycle", label: "The cycle" },
  ...CYCLE.map((c) => ({ id: c.phase.toLowerCase(), label: c.phase })),
  { id: "later", label: "Later passes" },
  { id: "contribution", label: "Contribution" },
];

function Engineering() {
  return (
    <PageShell
      title="Engineering"
      lede="How the project was designed, built, tested and then changed because of what the testing showed. Each pass round the cycle is recorded here, including the ones that did not work."
      art={ART.engineering}
      sections={SECTIONS}
    >
      <Section id="cycle" title="The cycle">
        <P>
          Engineering is not a straight line from an idea to a result. Each pass through design,
          build, test and learn changes what the next pass attempts — and the passes that failed are
          the ones that explain why the final design looks the way it does.
        </P>
      </Section>

      {CYCLE.map((step, i) => (
        <section
          key={step.phase}
          id={step.phase.toLowerCase()}
          className="mt-10 scroll-mt-28 md:mt-12"
        >
          <div className="flex items-baseline gap-3">
            <span className={L.note} style={{ color: C.redDeep }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <h2 className="text-[22px] font-black md:text-[26px]" style={{ color: C.ink }}>
              {step.phase}
            </h2>
          </div>
          <p
            className="mt-1 max-w-[62ch] text-[14px] font-semibold md:text-[15px]"
            style={{ color: C.inkNote }}
          >
            {step.ask}
          </p>
          <div className="mt-4">
            <Awaiting what={`Needs the team: ${step.phase.toLowerCase()}`}>{step.prompt}</Awaiting>
          </div>
        </section>
      ))}

      <Section id="later" title="Later passes">
        <P>
          A second and third time round the cycle belong here, in the same four phases. If the
          project only went round once, say so and say why — an honest single pass reads better than
          an invented second one.
        </P>
        <Awaiting what="Needs the team: further iterations" />
      </Section>

      <Section id="contribution" title="Contribution">
        <P>
          What the next team can use: a characterised part, a protocol that works, a measurement, or
          a documented failure that saves them the same month of work.
        </P>
        <Awaiting what="Needs the team: what is left behind for others" />
      </Section>

      <div className="mt-14 md:mt-20 flex flex-wrap gap-3">
        <Link
          to="/description"
          className="inline-block px-6 py-3 text-[15px] font-bold"
          style={{
            background: C.redDeep,
            color: "#fff",
            border: `2.5px solid ${C.ink}`,
            borderRadius: 6,
            boxShadow: `4px 4px 0 ${C.ink}`,
          }}
        >
          What the project is
        </Link>
        <Link
          to="/new"
          className="inline-block px-6 py-3 text-[15px] font-bold"
          style={{
            background: C.paper,
            color: C.ink,
            border: `2.5px solid ${C.ink}`,
            borderRadius: 6,
            boxShadow: `4px 4px 0 ${C.ink}`,
          }}
        >
          See it happen
        </Link>
      </div>
    </PageShell>
  );
}
