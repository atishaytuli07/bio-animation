import { createFileRoute, Link } from "@tanstack/react-router";

import { C, L, R } from "@/components/hero/palette";
import { ART } from "@/components/story/PageHero";
import { Awaiting, P, PageShell, Section } from "@/components/story/PageShell";

/**
 * Safety.
 *
 * Two different things are judged here and they are easy to conflate. iGEM
 * asks about LABORATORY safety — organisms, containment, training, waste — and
 * separately about whether the project itself is safe to exist, which for a
 * diagnostic means human samples, genetic data and what a wrong answer costs.
 * A page that covers only the first reads as a lab induction; a page that
 * covers only the second reads as an essay. Both sections are here.
 *
 * There is also a real safety question specific to THIS project, and it is not
 * a biosafety one: a false reassurance is more dangerous than no test. A
 * result that says "normal" for someone who is not, and a dose that is then
 * given at full strength on the strength of it, is the failure mode this page
 * has to name honestly. It has its own section.
 *
 * As everywhere else on this wiki, nothing is written on the team's behalf.
 * The prose says what each section is for; every claim is an Awaiting panel.
 */

const TITLE = "Safety — ChemoGuard";

export const Route = createFileRoute("/safety")({
  head: () => ({
    meta: [
      { title: TITLE },
      {
        name: "description",
        content:
          "Laboratory safety, biological materials, human samples and genetic data — and the failure mode a pre-treatment test has to be honest about.",
      },
    ],
  }),
  component: Safety,
});

/** The index rail; ids match the sections below. */
const SECTIONS = [
  { id: "lab", label: "In the laboratory" },
  { id: "materials", label: "Biological materials" },
  { id: "samples", label: "Human samples and data" },
  { id: "failure", label: "If the test is wrong" },
  { id: "not", label: "What we did not do" },
  { id: "forms", label: "iGEM safety forms" },
];

function Safety() {
  return (
    <PageShell
      title="Safety"
      lede="What we worked with, how we contained it, and what a test that informs a chemotherapy dose has to be careful about — including the way it could do harm by being wrong."
      art={ART.generic}
      sections={SECTIONS}
    >
      <Section id="lab" title="In the laboratory">
        <P>
          Where the work was done, under whose supervision, at what containment level, and what
          training everyone had before they started. This is the section a safety committee reads
          first, and it should be specific enough to be checked.
        </P>
        <Awaiting what="Needs the team: the lab">
          Institution and room, biosafety level, the supervisor responsible, the safety training
          each member completed and when, and how waste was handled and disposed of.
        </Awaiting>
      </Section>

      <Section id="materials" title="Biological materials">
        <P>
          Every organism, part and reagent that carried a risk, with its risk group and where it
          came from. Chassis strains, any pathogen-derived sequence, and anything obtained from
          another team or a registry all belong here.
        </P>
        <Awaiting what="Needs the team: the parts list">
          Organisms and strains with risk groups; parts used, and which were taken from the registry
          versus made here; any sequence derived from a pathogen, with what it does and why it was
          needed.
        </Awaiting>
      </Section>

      <Section id="samples" title="Human samples and genetic data">
        <P>
          A test that reads a person&rsquo;s DPYD genotype handles two sensitive things at once: a
          human sample, and a genetic result that is also information about that person&rsquo;s
          relatives. Consent, storage, access and deletion all have to be answered before a sample
          is taken, not after.
        </P>
        <P>
          If no human samples were used, that is a complete and perfectly good answer — say so
          plainly, and say what was used instead.
        </P>
        <Awaiting what="Needs the team: samples, consent and data">
          Whether human samples were used at all. If they were: what kind, from whom, under what
          consent and which ethics approval, how they were stored, who could access the resulting
          data, and what happens to it now. If synthetic or purchased material stood in for human
          DNA, name it.
        </Awaiting>
      </Section>

      <Section id="failure" title="If the test is wrong">
        {/*
          The section that is specific to this project rather than to iGEM's
          form, and the one a judge is most likely to remember. The asymmetry is
          real and worth stating in the page's own voice, because it is a
          consequence of the project's premise rather than a claim about what
          the team built.
        */}
        <P>
          The risk this project carries is not mainly a biosafety risk. It is that a clinician
          changes a chemotherapy dose because of a result, and the result is wrong.
        </P>
        <P>
          The two ways of being wrong are not equally bad. A test that wrongly flags a variant leads
          to a reduced dose in someone who could have tolerated a full one — undertreatment, which
          is serious. A test that wrongly reports normal gives false reassurance and a full dose to
          someone who cannot clear it, which is the harm the project exists to prevent. A test like
          this has to be built and described with that asymmetry in front of it.
        </P>
        <P>
          It is also a partial test by design. Screening a set of variants tells you about those
          variants and nothing else, so a negative result means &ldquo;none of the variants we
          looked for&rdquo;, not &ldquo;no risk&rdquo;. How that is communicated on a report is a
          safety decision, not a wording decision.
        </P>
        <Awaiting what="Needs the team: limits, controls and wording">
          Which variants the assay covers and which known ones it does not. What controls guard
          against a false negative. What a result actually says to the clinician who reads it, and
          who is responsible for interpreting it. These need the team&rsquo;s own method and its own
          citations — nothing here may be inferred.
        </Awaiting>
      </Section>

      <Section id="not" title="What we did not do">
        <P>
          Deliberate limits are part of a safety record. Anything considered and then ruled out on
          safety grounds — an organism, a modification, a sample source, a claim — is worth naming,
          along with the reason.
        </P>
        <Awaiting what="Needs the team: the limits you set" />
      </Section>

      <Section id="forms" title="iGEM safety forms">
        <P>
          iGEM requires the Safety and Security policies to be followed and the relevant forms to be
          submitted through the competition&rsquo;s own system. That submission is separate from
          this page; this page is where a reader finds out what was submitted and why.
        </P>
        <Awaiting what="Needs the team: submissions">
          Which forms were submitted and when — including any check-in for parts or organisms
          requiring one. Link to the team&rsquo;s safety documentation where iGEM hosts it.
        </Awaiting>
      </Section>

      <div className="mt-14 flex flex-wrap gap-3 md:mt-20">
        <Link
          to="/human-practices"
          className="inline-block px-6 py-3 text-[15px] font-bold"
          style={{
            background: C.redDeep,
            color: "#fff",
            border: `2.5px solid ${C.ink}`,
            borderRadius: R.sm,
            boxShadow: `4px 4px 0 ${C.ink}`,
          }}
        >
          Who this is for
        </Link>
        <Link
          to="/engineering"
          className="inline-block px-6 py-3 text-[15px] font-bold"
          style={{
            background: C.paper,
            color: C.ink,
            border: `2.5px solid ${C.ink}`,
            borderRadius: R.sm,
            boxShadow: `4px 4px 0 ${C.ink}`,
          }}
        >
          How it was built
        </Link>
      </div>
      <p className={`mt-6 ${L.note}`} style={{ color: C.inkNote }}>
        Every panel above marked &ldquo;needs the team&rdquo; is written by NIS Kazakhstan
      </p>
    </PageShell>
  );
}
