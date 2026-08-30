import { createFileRoute, Link } from "@tanstack/react-router";

import { C } from "@/components/hero/palette";
import { ART } from "@/components/story/PageHero";
import { Awaiting, P, PageShell, Section } from "@/components/story/PageShell";

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
 * PLACEHOLDER SCIENCE, marked like everywhere else: the mechanism is textbook,
 * but the team must attach its own citations before the freeze. iGEM requires
 * that nothing on a wiki be unverifiable, and references are a medal
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
          "Why a single DPYD variant changes what a safe dose of fluoropyrimidine chemotherapy is, and what ChemoGuard proposes to do about it.",
      },
    ],
  }),
  component: Description,
});

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
      lede="Two people can be given the same chemotherapy, at the same dose, on the same day, and one of them can be harmed by it. This page explains why, and what we propose to do about it."
      art={ART.description}
      sections={SECTIONS}
    >
      <Section id="problem" title="The problem">
        <P>
          Fluoropyrimidines — 5-FU and its oral form capecitabine — are among the most widely used
          chemotherapy drugs in the world. Most of the dose a patient receives is not used to treat
          the tumour at all: it is broken down and cleared, by an enzyme called dihydropyrimidine
          dehydrogenase, or DPD.
        </P>
        <P>
          DPD is built from instructions in the <strong>DPYD</strong> gene. Some people carry a
          variant in that gene which reduces how much working enzyme their body makes. They are
          given a standard dose, because nothing about them looks different — and their body cannot
          clear it at the expected rate.
        </P>
      </Section>

      <Section id="letter" title="What a single letter does">
        <P>
          The variant this project focuses on is <strong>DPYD c.1905+1G&gt;A</strong>, also known as
          rs3918290 or the DPYD*2A allele. It sits at the first position of intron 14, immediately
          after the end of exon 14 — the two letters that tell the cell where to cut when it
          assembles the finished instructions.
        </P>
        <P>
          Change that G to an A and the cut is made in the wrong place. Exon 14 is skipped, and the
          enzyme built from the result does not work as it should. The chain is short and it is the
          whole story: one letter changes, less working DPD is made, the drug is cleared more
          slowly, it accumulates, and the risk of severe toxicity rises.
        </P>
        <P>
          It is worth being precise about what this does <em>not</em> mean. A variant reduces enzyme
          activity; it does not usually abolish it, and carrying one does not mean a patient cannot
          be treated. It means the dose that is safe for them is not the standard one.
        </P>
      </Section>

      <Section id="testing" title="Why testing first matters">
        <P>
          The variant is knowable before treatment begins. If it is found first, the dose can be
          matched to the enzyme activity the patient actually has, rather than to the average of
          people who do not carry it. Nothing about the diagnosis changes and nothing about the drug
          changes — only the amount.
        </P>
        <Awaiting what="Needs the team: citation">
          The clinical guidance for pre-treatment DPYD testing and dose adjustment must be cited
          here from the team&rsquo;s own reading, with the source named. Do not publish this section
          without it — unverifiable claims cost marks, and this is the claim the whole project rests
          on.
        </Awaiting>
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
        <Awaiting what="Needs the team: reference list">
          Every factual claim on this page and in the animation, with its source. The mechanism
          described above is textbook, but textbook is not the same as cited.
        </Awaiting>
      </Section>

      <div className="mt-14 md:mt-20">
        <Link
          to="/new"
          className="inline-block px-6 py-3 text-[15px] font-bold"
          style={{
            background: C.redDeep,
            color: "#fff",
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
