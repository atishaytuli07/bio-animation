import { createFileRoute, Link } from "@tanstack/react-router";

import { C, R } from "@/components/hero/palette";
import { PLATE } from "@/components/story/PageHero";
import { Awaiting, P, PageShell, Section } from "@/components/story/PageShell";
import { CiteMark, SourceList, type Source } from "@/components/story/Cite";
import { Figure } from "@/components/story/Figure";
import { ChainFigure, DoseFigure, SpliceFigure } from "@/components/story/diagrams";

/**
 * Project Description — the first content page, and the one the hero's second
 * button promises.
 *
 * WHAT IS WRITTEN HERE AND WHY. Everything on this page restates something the
 * animation already shows, in the plain prose a judge skimming for the
 * Description criterion expects to find. That is deliberate: the story carries
 * the argument visually, and this page is the same argument in words for
 * someone who will not scroll seventeen screens.
 *
 * WHAT IS NOT WRITTEN. Anything specific to ChemoGuard's own method — what the
 * device does, what sample it takes, what it reports, what was built in the
 * lab. None of that is known to whoever writes this file, and inventing it is
 * the failure this project has already had to undo once. Those blocks render
 * as visible <Awaiting> panels rather than TODO comments, so an unfinished
 * page cannot pass for a finished one on the deployed site.
 *
 * THE SCIENCE IS WORDED TO THE CLIENT'S REVIEW. Every claim here says what a
 * variant CAN do, not what it always does, and the test is described as
 * informing a dose under clinical guidelines rather than setting one. Keep new
 * copy to that standard: "may", "can", "is associated with".
 *
 * Every claim that needs a source carries a numbered mark, and a source the
 * team has not supplied renders as visibly missing — see Cite.tsx. iGEM
 * requires that nothing on a wiki be unverifiable, and references are a medal
 * criterion in their own right.
 */

const TITLE = "Description — ChemoGuard";

export const Route = createFileRoute("/description")({
  head: () => ({
    meta: [
      { title: TITLE },
      {
        name: "description",
        content:
          "How DPYD variants can raise the risk of toxicity from a standard dose of fluoropyrimidine chemotherapy, and what ChemoGuard proposes to do about it.",
      },
    ],
  }),
  component: Description,
});

/**
 * Sources, in the order they are first cited on the page.
 *
 * `supports` is what the source has to establish, written for the team to
 * match against their own reading. When they supply a reference, add it as
 * `cite` and the mark and the list both stop reading as missing.
 */
const SOURCES = [
  {
    id: "use",
    supports:
      "Fluoropyrimidines (5-FU and capecitabine) are among the most widely used chemotherapy drugs.",
  },
  {
    id: "catabolism",
    supports:
      "A large proportion of administered 5-FU is broken down by dihydropyrimidine dehydrogenase (DPD).",
  },
  {
    id: "splicing",
    supports:
      "DPYD c.1905+1G>A (rs3918290, DPYD*2A) alters the 5′ splice donor site of intron 14 and leads to skipping of exon 14.",
  },
  {
    id: "toxicity",
    supports:
      "Reduced DPD activity is associated with increased 5-FU exposure and a higher risk of severe toxicity.",
  },
  {
    id: "guidelines",
    supports:
      "The clinical guideline for pre-treatment DPYD genotyping and dose adjustment, named — the team supplies which one.",
  },
] as const satisfies readonly Source[];

type SourceId = (typeof SOURCES)[number]["id"];

/** A citation mark for one of this page's sources. */
function Cite({ id }: { id: SourceId }) {
  return <CiteMark sources={SOURCES} id={id} />;
}

/** The index rail; ids match the sections below. */
const SECTIONS = [
  { id: "problem", label: "The problem" },
  { id: "letter", label: "What a single letter does" },
  { id: "testing", label: "Why testing first matters" },
  { id: "building", label: "What we are building" },
  { id: "references", label: "References" },
];

function Description() {
  return (
    <PageShell
      title="Description"
      lede="Two patients can receive the same fluoropyrimidine treatment at the same dose, yet experience very different toxicity because of differences in drug metabolism."
      piece="dock"
      plate={PLATE.description}
      sections={SECTIONS}
    >
      <Section id="problem" title="The problem">
        <P>
          Fluoropyrimidines — 5-FU and its oral prodrug capecitabine — are among the most widely
          used chemotherapy drugs in the world.
          <Cite id="use" /> A large proportion of 5-FU is normally broken down by the enzyme
          dihydropyrimidine dehydrogenase (DPD), which helps control systemic drug exposure.
          <Cite id="catabolism" />
        </P>
        <P>
          DPD is encoded by the <strong>DPYD</strong> gene. Some DPYD variants disrupt normal gene
          processing and reduce functional DPD activity.
          <Cite id="splicing" /> Without pre-treatment DPYD testing, reduced DPD activity may not be
          known before fluoropyrimidine therapy begins.
        </P>
      </Section>

      <Section id="letter" title="What a single letter does">
        <P>
          The variant this project focuses on is <strong>DPYD c.1905+1G&gt;A</strong>, also known as
          rs3918290 or the DPYD*2A allele. It sits at the first position of intron 14, immediately
          after the end of exon 14. The conserved GT sequence marks the 5′ splice donor site used
          during pre-mRNA processing. When G changes to A, the splice site may no longer be
          recognised correctly.
        </P>
        <Figure
          label="Figure 1 · the splice donor"
          caption={
            <>
              Positions +1 and +2 of intron 14 carry the conserved GT of the 5′ splice donor site.
              The variant changes that G to an A, so the site reads AT and may no longer be
              recognised, which can lead to exon 14 being skipped.
              <Cite id="splicing" />
            </>
          }
        >
          <SpliceFigure />
        </Figure>
        <P>
          Abnormal splicing can reduce the amount of functional DPD produced. What follows is short,
          and it is the whole argument of the project:
        </P>
        <Figure
          label="Figure 2 · from a letter to a risk"
          caption={
            <>
              This pathway illustrates the expected biological consequence associated with reduced
              DPD activity.
              <Cite id="toxicity" /> Individual clinical effects can vary.
            </>
          }
        >
          <ChainFigure />
        </Figure>
        <P>
          It is worth being precise about what this does <em>not</em> mean. A variant usually
          reduces DPD activity rather than abolishing it,
          <Cite id="toxicity" /> and carrying one does not mean a patient cannot be treated. It
          means a standard dose may not be appropriate for them.
        </P>
      </Section>

      <Section id="testing" title="Why testing first matters">
        <P>
          Testing does not have to wait for treatment to begin. If a clinically relevant DPYD
          variant is identified before treatment, the result can inform dose adjustment according to
          established clinical guidelines.
          <Cite id="guidelines" />
        </P>
        <Figure
          label="Figure 3 · two doses"
          caption="Conceptual illustration, not a quantitative pharmacokinetic model. Left: a standard dose in a person with reduced DPD activity. Right: the same person at a guideline-adjusted dose."
        >
          <DoseFigure />
        </Figure>
      </Section>

      <Section id="building" title="What we are building">
        <Awaiting what="Needs the team: the method">
          What ChemoGuard actually is. What the test does, what sample it takes, what it measures,
          what it reports, and who uses it. This is the one part of the project that cannot be
          written from the literature, and nothing on this wiki should describe it until the team
          has.
        </Awaiting>
        <Awaiting what="Needs the team: what was built">
          The parts, constructs, protocols and results from the lab, and what is new versus what
          came from previous work. This is what the Engineering page will expand on.
        </Awaiting>
      </Section>

      <Section id="references" title="References">
        <SourceList sources={SOURCES} />
      </Section>

      <div className="mt-14 md:mt-20">
        <Link
          to="/new"
          className="inline-block px-6 py-3 text-[15px] font-bold"
          style={{
            background: C.redDeep,
            color: "#fff",
            border: `2.5px solid ${C.ink}`,
            borderRadius: R.sm,
            boxShadow: `4px 4px 0 ${C.ink}`,
          }}
        >
          See it happen
        </Link>
      </div>
    </PageShell>
  );
}
