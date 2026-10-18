import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { C } from "@/components/hero/palette";
import { CiteMark, SourceList, type Source } from "@/components/story/Cite";
import { SECTIONS_OF } from "@/components/story/page-sections";
import { P, PageLink, PageShell, Section } from "@/components/story/PageShell";
import { NOTES } from "@/components/story/hp-notes";
import { Bullets, Changed, Quote, Sub } from "@/components/story/Prose";

// Human Practices. The text is the team's own essay, "From Human to Test and Back to Human", set without
// rewording: only its dashes were changed to the site's punctuation. The claims it makes about the world outside
// the project are marked with the sources the team still has to supply.

const TITLE = "Human Practices · ChemoGuard";
const DESCRIPTION =
  "From human to test and back to human: what patients, an oncologist, a pharmacogeneticist, a clinical pharmacist and a patient advocate told the team, and what changed because of it.";

export const Route = createFileRoute("/human-practices")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
    ],
  }),
  component: HumanPractices,
});

// Sources, in the order they are first cited. The team supplies them: we name no reference for them.
const SOURCES = [
  {
    id: "who",
    supports:
      "That fluoropyrimidines are on the WHO Model List of Essential Medicines and are among the most frequently prescribed chemotherapy drugs for solid tumours.",
  },
  {
    id: "dpd",
    supports:
      "That most administered 5-fluorouracil is broken down by dihydropyrimidine dehydrogenase, encoded by DPYD, and that reduced activity leads to accumulation and severe toxicity.",
  },
  {
    id: "cpic",
    supports:
      "The CPIC guideline describing the standard panel of clinically significant DPYD variants and the dose adjustment rules.",
  },
  {
    id: "ema",
    supports:
      "The European regulators' recommendation to assess DPD status before starting fluoropyrimidine therapy.",
  },
  {
    id: "fda",
    supports: "The FDA boxed warning on fluoropyrimidine labels recommending testing.",
  },
  {
    id: "guide",
    supports:
      "The Guide for Implementing DPYD Genotyping for Systemic Fluoropyrimidines into Clinical Practice, by Dr. Hertz and colleagues.",
  },
] as const satisfies readonly Source[];

type SourceId = (typeof SOURCES)[number]["id"];

function Cite({ id }: { id: SourceId }) {
  return <CiteMark sources={SOURCES} id={id} />;
}

/** The index rail; ids match the sections below. */
const SECTIONS = SECTIONS_OF["/human-practices"];

// Professor Pirmohamed's interview was written up by the team in Russian. This is a plain translation of it.
const PIRMOHAMED_NOTES = [
  "The interview followed the standard format: the team joined online, there was first a short presentation of the project, then questions, first from the team leader, and at the end the other members joined in. Professor Pirmohamed (University of Liverpool) gave detailed and practically applicable answers.",
  "On the choice of DPYD variants, the professor advised starting with the standard CPIC panel of 4 variants and then gradually adding new ones as local data accumulates, noting that the genetics of the Kazakhstani population may overlap with other Asian populations (for example, South Asian) rather than being entirely unique. About MOLGEN he said that his team has already found something, but the results are not yet published. On sample type he gave a clear recommendation in favour of blood: saliva is more prone to contamination and is generally less effective for reliable genotyping.",
  "The professor named clinician engagement as the main barrier to scaling testing in the NHS: in his words, any promotion of the test is useless if clinicians themselves are not ready to use it. Asked what makes a diagnostic test credible, he answered that an important indicator of readiness is approval by a regulatory body (an equivalent of the MHRA).",
  "He gave a separate, useful piece of advice on presenting the product itself: it is more logical to build communication with the patient around a specific drug, capecitabine (by analogy with the wording of an “allergy” to a drug), rather than around genetic terms, because this gives patients a more understandable confidence in the result. For patient information materials he advised presenting everything as simply as possible, guided by what the target audience can understand.",
  "In the final part, one of the team members asked about the target turnaround time. The professor recommended aiming for up to 5 days, noting that a faster result does not give substantial additional clinical meaning.",
  "Overall, the interview gave several concrete reference points for the project: keep to the standard 4-variant panel as the base, prioritise blood as the sample type, build work with doctors and future regulatory approval into the roadmap, use a drug-oriented (rather than gene-oriented) frame in communication with patients, and aim for a turnaround time of up to 5 days.",
];

/** The team's own write-up of one interview, folded away under the account of it. */
function Notes({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details
      className="max-w-[62ch] px-4 py-3"
      style={{ border: `2px solid ${C.ink}26`, borderRadius: 10, background: "#fffaf2" }}
    >
      <summary
        className="cursor-pointer text-[15px] font-bold md:text-[16px]"
        style={{ color: C.ink }}
      >
        {title}
      </summary>
      <div
        className="mt-3 space-y-3 text-[14px] leading-relaxed md:text-[15px]"
        style={{ color: C.inkBody }}
      >
        {children}
      </div>
    </details>
  );
}

function Lines({ of }: { of: readonly string[] }) {
  return (
    <>
      {of.map((t) => (
        <p key={t}>{t}</p>
      ))}
    </>
  );
}

function Numbered({ of }: { of: readonly string[] }) {
  return (
    <ol className="list-decimal space-y-2 pl-5">
      {of.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ol>
  );
}

function HumanPractices() {
  return (
    <PageShell
      title="Human Practices"
      lede="From human to test and back to human. We did not start with the thought, &ldquo;Let's make a DPYD test.&rdquo; We started with an observation that was hard to ignore, and with the people who had already gone through treatment."
      piece="voices"
      sections={SECTIONS}
    >
      <Section id="question" title="A question born outside the laboratory">
        <P>
          We did not start with the thought, &ldquo;Let&rsquo;s make a DPYD test.&rdquo; We started
          with an observation that was hard to ignore.
        </P>
        <P>
          An oncology diagnosis stopped being something distant. It appeared in conversations about
          acquaintances, in classmates&rsquo; families, and in stories told at home. In almost every
          such story, a familiar plot repeated: a person undergoes grueling treatment, takes strong
          medications, hopes for recovery, and the side effects of the treatment itself turn out to
          be the main ordeal.
        </P>
        <P>For us, this stopped being statistics. These were people we knew.</P>
        <P>
          Yet we understood something else: personal impressions are easily confused with
          regularities. Therefore, the first step was neither a literature search nor looking for a
          ready-made technical solution. The first step was talking to those who had already gone
          through the treatment.
        </P>
      </Section>

      <Section id="survey" title="Survey: what patients told us">
        <P>
          We conducted a survey among people with a history of cancer treatment. We were interested
          in three things: whether they had heard that a genetic test could be done before starting
          chemotherapy; whether anyone had offered them such testing; and what side effects they
          faced.
        </P>
        <P>The responses shifted our picture of the problem.</P>
        <P>
          For most respondents, the very idea of genetic testing before therapy was news. Not a
          rejected opportunity, not a service they couldn&rsquo;t afford or wait for, but simply a
          blank spot. Later, in conversations with experts, we learned an important detail: major
          medical centers in Kazakhstan are generally capable of performing DPYD testing. This meant
          the issue wasn&rsquo;t just a lack of technology. The test exists, but it is not a
          standard part of the patient pathway, and a person going through that pathway simply
          doesn&rsquo;t know about it.
        </P>
        <P>
          The patients we spoke with described something else: a diagnosis already subjects a person
          to dozens of procedures, and they have neither the strength nor the reasons to
          additionally figure out something no one mentioned.
        </P>
        <P>
          Here we first formulated what later became the project&rsquo;s axis: you cannot ask for
          something whose existence you do not suspect. A patient cannot demand safety regarding a
          mechanism they do not know. Consequently, the responsibility for this does not lie with
          them.
        </P>
        <P>
          And we had a question: if there is a way to know in advance that a specific person&rsquo;s
          organism is especially sensitive to a certain drug, why do so few people know about it?
        </P>
      </Section>

      <Section id="why-dpyd" title="Why DPYD">
        <P>
          We went looking for the answer in scientific publications, and rather quickly landed on
          one specific point.
        </P>
        <P>
          Fluoropyrimidines, primarily 5-fluorouracil and capecitabine, are included in treatment
          regimens for colorectal cancer, stomach cancer, breast cancer, and head and neck cancer.
          These are among the most frequently prescribed chemotherapy drugs for solid tumors, and
          they are on the WHO Model List of Essential Medicines.
          <Cite id="who" /> Most of the administered 5-fluorouracil is broken down by the enzyme
          dihydropyrimidine dehydrogenase, which is encoded by the DPYD gene. If enzyme activity is
          reduced, the drug is eliminated slower and accumulates.
          <Cite id="dpd" /> A standard dose for the majority is no longer standard for such a
          person.
        </P>
        <P>
          Clinically, this looks like severe mucositis, neutropenia, diarrhea, and skin damage. In
          rare cases, it results in patient death from the treatment rather than the disease.
        </P>
        <P>
          The longer we read, the clearer it became that we were looking at more than just another
          genetic marker. This is one of the few cases in oncology where risk can be assessed before
          the first dose: not reacting to a complication, but preventing it.
        </P>
        <P>
          Moreover, the regulatory framework for this already exists. CPIC describes a standard
          panel of clinically significant DPYD variants and dose adjustment rules.
          <Cite id="cpic" /> European regulators recommended assessing enzyme status before starting
          fluoropyrimidine therapy.
          <Cite id="ema" /> And the FDA relatively recently added a boxed warning to
          fluoropyrimidine labels recommending testing, which effectively brought the US position
          closer to Europe&rsquo;s.
          <Cite id="fda" />
        </P>
        <P>
          That is, the drug is on the WHO list, the risk is known, the test exists, and the
          guidelines are written. And yet, a person undergoing treatment has never heard of such an
          option.
        </P>
        <P>This means the real problem does not lie in science.</P>
        <P>
          Thus, our question changed a second time. We stopped asking &ldquo;can such a test be
          made?&rdquo; and began asking: why does a test that already exists not reach the patient?
        </P>
        <P>
          Next came questions that articles do not answer. Will the doctor order it? Will the result
          arrive before therapy begins? Will the hospital be able to integrate this into its
          workflow? Will the result from the laboratory reach a real clinical decision? We realized
          we couldn&rsquo;t answer these ourselves and began looking at people who had already
          walked this path.
        </P>
      </Section>

      <Section id="joerger" title="Markus Joerger: the bottleneck wasn't the test">
        <P>
          First was Dr. Markus Joerger, a medical oncologist with experience implementing DPYD
          testing in Switzerland.
        </P>
        <P>
          We asked him what a researcher should keep in mind when developing personalized
          diagnostics, easily getting bogged down in genetic data and laboratory results. He replied
          that personalization is especially needed in two situations: when you have a vulnerable
          patient (weakened, elderly, a child) whom you cannot harm, and when there is a very large
          individual variability in response among people. DPYD falls into both categories.
        </P>
        <P>He formulated the general goal of treatment as follows:</P>
        <Quote by="Dr. Markus Joerger">
          &ldquo;In medicine, we have two main goals: a good response to treatment and as little
          toxicity as possible.&rdquo;
        </Quote>
        <P>
          At the same time, he immediately separated them: most personalized approaches in oncology
          work on the first half of the formula, on efficacy. DPYD testing works on the second, on
          preventing severe toxicity. And precisely the second half, according to him, always
          advances with more difficulty. Preventing a complication is less noticeable and less
          attractive than a new drug with better activity.
        </P>
        <P>Then he said something that truly stopped us in our tracks.</P>
        <P>
          Behind a new drug stands a company. It hires people who go to clinicians, show data,
          explain, and persuade. Behind a diagnostic test, there is no such company. He told us
          straight out: you are developing a test, which means you will have to promote it
          yourselves. In medicine, it is easy to think that data will reach everyone on its own and
          everyone will start doing what is best for the patient, but that is not how it works.
        </P>
        <P>
          And he described what it looked like in Switzerland. The test was available everywhere.
          The bottleneck was not the test. The bottleneck was that clinicians needed time to be
          convinced of its usefulness and to integrate it into their daily routine: determine
          timelines, blood shipping procedures, turnaround time. He added that it is worth checking
          the payment question in advance: if a doctor knows the patient will have to pay for the
          test themselves, they will prescribe it more cautiously.
        </P>
        <P>
          When we asked what from the Swiss experience would be useful for Kazakhstan, he advised a
          concrete action: gather clinicians, in person or via a call like ours, show them data,
          present the test itself, and immediately answer practical questions: how much it costs,
          how to handle the sample, in how many days the result will arrive. He honestly said they
          hadn&rsquo;t done this themselves and that in hindsight, it looks like an omission.
        </P>
        <P>
          Separately, we asked how to communicate a genetic test result to a patient without
          frightening them. He pointed out a distinction we hadn&rsquo;t made before: DPYD is
          germline genetics, but it is not the same as testing for hereditary cancer syndromes like
          Lynch syndrome. Here, it is not about a disease or a predisposition to it, but only about
          sensitivity to a specific group of drugs. Informing the patient before the test is
          necessary, but this conversation is fundamentally different and much less frightening.
        </P>
        <P>
          And at the end, he gave advice we would return to later: check which hot spots in the gene
          are significant specifically for our population, because the four variants described for
          Europeans might work differently in Asian populations.
        </P>
        <Changed>
          We stopped describing the project as a genetic test and began describing it as a clinical
          decision tool: the test itself changes nothing; the change happens at the moment when the
          result timely reaches the doctor. From this followed a practical step: working with
          clinicians is not &ldquo;external communication,&rdquo; but part of the project itself,
          and we baked seminars for doctors into the roadmap following the scheme described by Dr.
          Joerger, with a mandatory block on cost, sample handling, and turnaround time.
        </Changed>
        <Notes title="Interview notes: Dr. Markus Joerger">
          <p className="font-bold" style={{ color: C.ink }}>
            {NOTES.joergerTitle}
          </p>
          <Lines of={NOTES.joerger} />
        </Notes>
      </Section>

      <Section id="pirmohamed" title="Munir Pirmohamed: whose test is it?">
        <P>
          We went to Professor Munir Pirmohamed from the University of Liverpool with a different
          mindset. We didn&rsquo;t want to just repeat a solution that works in another country. We
          wanted to understand how well it fits our population at all.
        </P>
        <P>The conversation turned out to be the most concrete from the scientific side.</P>
        <P>
          Regarding the choice of variants, he advised starting with the standard CPIC panel of four
          variants and expanding it gradually as local data accumulates. But he added a
          clarification that turned out to be more important to us than the recommendation itself:
          the genetics of the Kazakhstani population are likely not unique; they may overlap with
          other Asian populations, such as South Asian. That means we shouldn&rsquo;t search for
          &ldquo;our own special set of variants from scratch,&rdquo; but understand which already
          studied populations we are closest to.
        </P>
        <P>
          This connected with Dr. Joerger&rsquo;s advice about hot spots in Asian populations. Two
          independent experts told us the same thing from different angles, and we stopped treating
          the CPIC panel as a finished answer. Now it is our foundation, not the final
          configuration.
        </P>
        <P>
          Regarding sample type, he gave an unambiguous recommendation in favor of blood: saliva is
          more prone to contamination and generally less reliable for genotyping.
        </P>
        <P>
          For us, this turned out to be more than just a laboratory question. Blood means a medical
          institution, personnel, collection, transportation. Saliva means a sample can be collected
          where the lab is far away. The choice between them is a choice between reliability of the
          result and coverage. We adopted reliability as a priority: someone will believe a result
          that cannot be trusted anyway and change the dose based on it. But the coverage question
          wasn&rsquo;t closed by this, and we would return to it.
        </P>
        <P>
          The professor called clinicians&rsquo; engagement the main barrier when scaling testing in
          the NHS. His phrasing was harsh: any advocacy for the test is useless if clinicians
          themselves are not ready to use it. And to the question of what makes a diagnostic test
          trustworthy, he replied that the key indicator is regulatory approval.
        </P>
        <P>
          He also gave communication advice we didn&rsquo;t expect. It is better to talk to the
          patient around the drug rather than the gene: not &ldquo;you have a DPYD variant,&rdquo;
          but &ldquo;we are checking how you tolerate capecitabine,&rdquo; by analogy with how
          people talk about drug allergies. Such a framework gives a person understandable
          confidence, while genetic terminology only adds anxiety. Information materials, he said,
          should be made as simple as possible, focusing on the real audience rather than how things
          are customarily written in science.
        </P>
        <P>
          At the end, one of us asked about the target turnaround time for the assay. He recommended
          aiming for up to five days and noted that a faster result does not carry significant
          additional clinical meaning.
        </P>
        <Changed>
          The CPIC four-variant panel became our starting base, and a separate item was added to the
          work plan: compare the Kazakhstani population with already described Asian populations and
          decide how to expand the panel based on that. Blood was fixed as the sample type. A
          timeframe of up to five days was adopted as a project requirement rather than a wish.
          Regulatory approval was added to the roadmap as a condition of clinical applicability
          rather than a formality at the end. And all our patient materials were rewritten from the
          gene to the drug.
        </Changed>
        <Notes title="Interview notes: Professor Munir Pirmohamed">
          <Lines of={PIRMOHAMED_NOTES} />
        </Notes>
      </Section>

      <Section id="merritt" title="Karen Merritt: a human, not a variable">
        <P>
          By this point, we saw the gap between the laboratory and the patient. But we lacked the
          voice of someone who knows this problem not from an article.
        </P>
        <P>
          Karen Merritt is the co-founder of Advocates for Universal DPD/DPYD Testing (AUDT) and a
          patient advocate. She came to this topic after losing her mother to fluoropyrimidine
          toxicity caused by an undetected DPYD variant. AUDT arose precisely like this: families
          who lost loved ones to the same cause united so that this would stop happening.
        </P>
        <P>
          Before talking to her, we freely operated with words like &ldquo;toxicity,&rdquo;
          &ldquo;genetic variant,&rdquo; &ldquo;pharmacogenetics,&rdquo; and &ldquo;clinical
          guidelines.&rdquo; These words are convenient because no one is visible behind them.
        </P>
        <P>
          She named awareness, education, and test accessibility as the main barriers. And she
          emphasized what we later put at the beginning of our text: fluoropyrimidines are on the
          WHO Model List of Essential Medicines and belong to the most frequently prescribed
          chemotherapy drugs for solid tumors. The preventable risk of severe toxicity is associated
          not with a rare experimental drug, but with one of the most common.
        </P>
        <P>
          She also spoke about the economic barrier in the US: the system initially reluctantly paid
          for testing. This barrier was largely removed, not by arguments, but by evidence that the
          test is cost-effective when comparing its cost with the cost of treating severe
          complications. For us, this became a direct indication of what argument would be needed in
          conversation with the healthcare system, not just the doctor.
        </P>
        <P>
          Separately, she described the generational gap. Younger physicians perceive DPYD testing
          noticeably better: they studied fluoropyrimidine toxicity during training and are familiar
          with pharmacogenetics. Some more experienced clinicians remain skeptical. This is not a
          matter of goodwill, but a matter of what a person was taught.
        </P>
        <P>
          We asked her about what bothered us the most. A person has just received a diagnosis, is
          under huge pressure, and faces a dozen procedures. How at such a moment to tell them about
          pharmacogenetics as well without adding panic?
        </P>
        <P>
          Her answer was simple and changed our logic: present testing as part of the initial
          examination, before treatment starts, as a regular safety measure. Do not make the patient
          ask for the test.
        </P>
        <P>
          For us, this was a turnaround. Until then, we designed communication as if the task was to
          make the patient want the test. But the task is different: to make sure the patient never
          has to want it. The way the test is introduced into conversation is no less important than
          the test itself: as a separate procedure it looks like a burden, as part of preparation
          for treatment, protection.
        </P>
        <P>
          Another of her thoughts we initially underestimated. She said that integrating DPYD
          testing into clinical protocols makes it part of the institution&rsquo;s risk management,
          not just a matter of patient safety. This changes motivation: the doctor gets not only an
          ethical but also a professional basis to follow the recommendation.
        </P>
        <P>Regarding myths around genetics, she said:</P>
        <Quote by="Karen Merritt, co-founder of AUDT">
          &ldquo;General public doesn&rsquo;t understand that all people are different, we all
          process medications differently.&rdquo;
        </Quote>
        <P>
          And her advice on materials was practical: simple language, low text complexity level, and
          interactive formats, because a game engages and explains complex things better than text.
        </P>
        <P>
          She didn&rsquo;t just give advice. She connected us with Dr. Dan Hertz, AUDT medical
          advisor, and passed on a practical guide to implementing DPYD genotyping into clinical
          practice written by him and his colleagues.
          <Cite id="guide" />
        </P>
        <Changed>
          In all our materials, the test is now described as part of pre-treatment examination
          rather than an additional service. We added an economic line to the argumentation for the
          healthcare system: test cost versus the cost of treating severe toxicity. And we
          completely rebuilt the educational part of the project following her advice.
        </Changed>
        <Notes title="Interview notes: Karen Merritt">
          <Lines of={NOTES.merritt} />
          <Lines of={NOTES.merrittSummary} />
          <p className="font-bold" style={{ color: C.ink }}>
            Questions for Karen Merritt, advocate for DPYD testing
          </p>
          <Numbered of={NOTES.merrittQuestions} />
          <p className="font-bold" style={{ color: C.ink }}>
            Q&amp;A session questions
          </p>
          <Numbered of={NOTES.merrittFollowUps} />
        </Notes>
      </Section>

      <Section id="explaining" title="If a person didn't understand, we didn't explain well enough">
        <P>We took Karen&rsquo;s advice about simple language and interactive formats literally.</P>
        <P>
          We are developing a VR game where a person learns about oncology and personalized medicine
          through personal experience rather than text on a screen. We made a card-based board game
          that turns complex medical information into a conversation between players: they have to
          explain things to each other themselves, which works better than a lecture. We hold
          educational classes for children and a training session in Kazygurt, a rural area where
          the gap in access to diagnostics and information is especially noticeable. That is why we
          went there instead of staying in the city.
        </P>
        <P>
          And we are writing a book of ten patient stories, for the same reason our conversation
          with Karen changed our view. Behind medical statistics, there are always specific people,
          and a text where they are visible reaches where a percentage cannot.
        </P>
        <P>
          None of these projects were planned at the beginning. All of them appeared as a direct
          response to what we heard.
        </P>
      </Section>

      <Section id="hertz" title="Dan Hertz: how to fit it into a doctor's ordinary day">
        <P>
          We already understood why the test is needed and why doctors don&rsquo;t start using it
          immediately. One last question remained: how to practically make it part of routine
          treatment?
        </P>
        <P>
          To Dr. Dan Hertz, a clinical pharmacist and medical advisor for AUDT, we posed an
          objection that seemed like the main obstacle: if patients with intermediate enzyme
          activity have their dose reduced, won&rsquo;t tumor control suffer?
        </P>
        <P>
          He replied that data shows otherwise. This is not the main concern of oncologists. The
          problem is that guidelines are not followed due to weak understanding of basic
          pharmacology.
        </P>
        <P>
          And he suggested explaining this through an analogy familiar to any clinician: doses are
          reduced in liver or kidney insufficiency, and no one considers this refusing treatment.
          The logic is the same: the dose is tailored to how a specific person&rsquo;s body manages
          drug elimination.
        </P>
        <P>
          We asked how AUDT works with doctors, hospital administrations, and decision-makers. He
          shared that before the FDA warning appeared, they would travel to places where a patient
          death occurred and work directly with quality of care and personalized medicine teams. Now
          that the labeling is in place, the focus has completely shifted to education and outreach.
        </P>
        <P>
          When we told him about our educational projects and asked what myths are worth debunking,
          he answered not what we expected to hear.
        </P>
        <Quote by="Dr. Dan Hertz, clinical pharmacist and AUDT medical advisor">
          &ldquo;Patients do what clinicians recommend, so I think all of this should focus on the
          clinicians side.&rdquo;
        </Quote>
        <P>
          He said educational efforts should not be aimed solely at the general public: the main
          addressee is clinicians.
        </P>
        <P>
          And to the question of how to transition hospitals from &ldquo;can be considered&rdquo; to
          mandatory screening before treatment starts where there is no US infrastructure, he
          advised betting on an inexpensive, rapid point-of-care test so results arrive in a few
          hours or a day.
        </P>
        <Changed>
          We built materials for doctors around the analogy with renal and hepatic insufficiency:
          this proved more effective than explaining pharmacogenetics from scratch. And we added
          something to the project that wasn&rsquo;t there before: a separate educational track for
          clinicians, not just patients and schoolchildren.
        </Changed>
        <Notes title="Interview notes: Dr. Dan Hertz">
          <Lines of={NOTES.hertz} />
        </Notes>
      </Section>

      <Section id="disagreed" title="Where the experts disagreed">
        <P>
          The most useful thing for us was not where the experts agreed, but where they disagreed.
        </P>
        <Sub>How long the test can take</Sub>
        <P>
          Professor Pirmohamed said: up to five days, faster without additional clinical meaning.
          Dr. Hertz said: an inexpensive rapid point-of-care test is needed, with results in hours
          or a day.
        </P>
        <P>
          At first, this looked like a contradiction. Then we realized they were answering different
          questions. Pirmohamed speaks about what is clinically acceptable when the laboratory
          pathway is already established, as in the NHS. Hertz speaks about what to do where such a
          pathway doesn&rsquo;t exist: if a sample needs to be driven hundreds of kilometers,
          &ldquo;five days&rdquo; on paper easily turns into two weeks in practice, and the doctor
          starts treatment without waiting for the result.
        </P>
        <P>
          Both are true for Kazakhstan. We adopted five days as a clinical requirement for
          turnaround time and simultaneously recorded simplicity and low cost of the format as a
          condition without which this timeframe is unattainable outside major centers. This also
          partially answers our unresolved question about blood and saliva: coverage is achieved not
          by using a less reliable sample, but by making the test available closer to the patient.
        </P>
        <Sub>Who to target with outreach</Sub>
        <P>
          Karen Merritt advised simple language and interactive formats for a broad audience. Dr.
          Hertz said the main addressee is doctors.
        </P>
        <P>
          Here, too, we didn&rsquo;t choose just one. We kept everything we do for patients and
          schoolchildren and added a track for clinicians that wasn&rsquo;t there before. These are
          different tasks: a patient needs to understand why a test is offered, and a doctor needs
          to understand why dose reduction does not mean undertreatment.
        </P>
      </Section>

      <Section id="agreed" title="What all four said the same thing about">
        <P>
          We spoke with an oncologist, a pharmacogeneticist, a clinical pharmacist, and a patient
          advocate. They have different backgrounds, different countries, and different healthcare
          systems. And all four independently named the exact same bottleneck.
        </P>
        <Bullets
          items={[
            "Dr. Joerger: in Switzerland, the test was available everywhere, but clinicians needed time to be convinced of its usefulness.",
            "Professor Pirmohamed: any test advocacy is useless if doctors aren't ready to use it.",
            "Karen Merritt: guidelines and labeling are already in place, now oncologists need to follow them.",
            "Dr. Hertz: the problem is not the fear of doing harm, but that guidelines are not followed.",
          ]}
        />
        <P>
          This is the main result of our work in Human Practices, and it is an uncomfortable one. We
          started the project thinking we were creating a missing technology. It turned out that
          technology is not what is missing. What&rsquo;s missing is people actually starting to use
          it.
        </P>
        <P>
          Everything else follows from this. If we simply made a good test and stopped, we would
          repeat the situation all four describe in their countries: the test exists, but the
          patient doesn&rsquo;t get it. Therefore, working with doctors, the economic argument for
          the system, a simple framework for talking to patients, and the requirement for turnaround
          time are not project appendages. This is the project.
        </P>
        <P>
          And one more coincidence we didn&rsquo;t notice right away. Professor Pirmohamed advised
          talking to the patient not about the gene, but about the drug, by analogy with an allergy.
          Dr. Joerger separately explained that DPYD is not the same as testing for hereditary
          cancer syndromes, and the conversation with the patient here is fundamentally different.
          Dr. Hertz suggested an analogy with kidneys and livers for doctors. Three different
          people, three different audiences, and one common conclusion: to make a new idea take
          root, you don&rsquo;t need to invent a new language. You need to find a place in what a
          person already knows where it fits without explanation.
        </P>
      </Section>

      <Section id="shifted" title="Where our question shifted">
        <ol className="max-w-[62ch] space-y-3">
          {[
            ["At the beginning, we had the question:", "How to create a DPYD test?"],
            ["After initial research, another appeared:", "How to make it clinically useful?"],
            ["After conversations with doctors:", "How to make sure it is actually used?"],
            [
              "After talking to Karen:",
              "How to make sure the patient gets this opportunity on time and understands why it's needed?",
            ],
            [
              "And now our question sounds broader:",
              "What needs to happen for our test result to reach a specific person and change their treatment?",
            ],
          ].map(([when, question]) => (
            <li
              key={when}
              className="px-4 py-3"
              style={{ border: `2px solid ${C.ink}1f`, borderRadius: 10, background: "#fffaf2" }}
            >
              <span
                className="block text-[12px] font-bold uppercase tracking-[0.12em]"
                style={{ color: C.inkNote }}
              >
                {when}
              </span>
              <span
                className="mt-1 block text-[16px] font-semibold leading-snug md:text-[18px]"
                style={{ color: C.ink }}
              >
                {question}
              </span>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="unresolved" title="What remains unresolved">
        <P>We don&rsquo;t want to end as if everything was neatly wrapped up.</P>
        <P>
          We still don&rsquo;t know which DPYD variants are significant specifically for the
          Kazakhstani population. We have a direction (comparing ourselves with already described
          Asian populations, as Professor Pirmohamed advised) but data is not yet available, and we
          have yet to obtain it.
        </P>
        <P>
          We haven&rsquo;t checked the payment question Dr. Joerger warned about: who in Kazakhstan
          will pay for the test and won&rsquo;t that become the very factor preventing a doctor from
          ordering it?
        </P>
        <P>
          And most importantly: all our interviewees described how it is arranged in their systems.
          None of them works in ours. The next conversation we need is not another international
          interview, but a conversation with a practicing Kazakhstani oncologist who will tell us
          what out of all this will withstand a collision with a real ward. The seminar for
          clinicians that Dr. Joerger advised is our next step.
        </P>
        <P>
          We do not consider this question closed. And perhaps this is the most honest result of our
          work.
        </P>
      </Section>

      <Section id="path" title="Where our path leads">
        <P>
          We started with test development. Gradually we realized that the real result is not a test
          tube with a sample, not a genetic variant, or even a line in a lab report.
        </P>
        <P>
          The real result is the moment when a doctor receives information on time, understands it,
          and makes a safer decision for a specific person because of it.
        </P>
        <P>
          Therefore, our path does not go from science to the test. It goes from human to science,
          from science to the clinic, and from the clinic back to the human.
        </P>
      </Section>

      <Section id="references" title="References">
        <SourceList sources={SOURCES} />
      </Section>

      <div className="mt-14 flex flex-wrap gap-3 md:mt-20">
        <PageLink to="/education">What we taught, and learned</PageLink>
        <PageLink to="/safety-and-security" tone="quiet">
          How we work safely
        </PageLink>
      </div>
    </PageShell>
  );
}
