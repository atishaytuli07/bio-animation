import { createFileRoute } from "@tanstack/react-router";

import { C } from "@/components/hero/palette";
import { CiteMark, SourceList, type Source } from "@/components/story/Cite";
import { P, PageLink, PageShell, Section } from "@/components/story/PageShell";
import { SECTIONS_OF } from "@/components/story/page-sections";
import { Bullets, Figure, Sub, type Shot } from "@/components/story/Prose";

// Human Practices. The text is the team's own, from their document for this page, set without rewording: only
// spaced hyphens used as dashes were changed to the site's punctuation. The claims it makes about the world outside
// the project are marked with the sources the team still has to supply.

const TITLE = "Human Practices · ChemoGuard";
const DESCRIPTION =
  "Behind every statistic there is a human story: who the team listened to, from patients and advocates to doctors, laboratories and regulators, and how each conversation changed ChemoGuard.";

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
    id: "who-list",
    supports:
      "That fluoropyrimidines are on the WHO Model List of Essential Medicines and are among the most commonly prescribed chemotherapy drugs for solid tumors.",
  },
  {
    id: "guide",
    supports:
      "The Guide for Implementing DPYD Genotyping for Systemic Fluoropyrimidines into Clinical Practice.",
  },
  {
    id: "who-children",
    supports:
      "The WHO figures: more than 80% of children with cancer cured in high income countries, below 30% in many low and middle income countries.",
  },
] as const satisfies readonly Source[];

type SourceId = (typeof SOURCES)[number]["id"];

function Cite({ id }: { id: SourceId }) {
  return <CiteMark sources={SOURCES} id={id} />;
}

/** The index rail; ids match the sections below. */
const SECTIONS = SECTIONS_OF["/human-practices"];

// The document's photographs and screenshots, uploaded to iGEM's server. Two are the same pictures the Education
// page already shows, and use those files.
const shot = (file: string, w: number, h: number, alt: string): Shot => ({ file, w, h, alt });

const SHOTS = {
  surveyAge: shot(
    "ihp-survey-age",
    1055,
    444,
    "A pie chart of survey answers to the question of age, in Russian, Kazakh and English, from three responses.",
  ),
  surveyGender: shot(
    "ihp-survey-gender",
    1091,
    459,
    "A pie chart of survey answers to the question of gender, in Russian, Kazakh and English, from three responses.",
  ),
  merritt: shot(
    "ihp-merritt-call",
    1400,
    1050,
    "A laptop screen showing an online call, with a slide reading Q&A Time beside the video of the interviewee.",
  ),
  pirmohamed: shot(
    "ihp-pirmohamed-call",
    1400,
    565,
    "A screenshot of an online call with a slide titled Population Variants and the video tiles of the participants.",
  ),
  hertz: shot(
    "ihp-hertz-call",
    1400,
    1050,
    "A laptop screen showing an online call, with the interviewee's video filling the screen and team members in small tiles above.",
  ),
  lab: shot(
    "ihp-ncb-lab",
    1280,
    960,
    "Team members in white lab coats posing together in a laboratory.",
  ),
  meditor: shot(
    "ihp-meditor-call",
    1400,
    722,
    "A screenshot of an online call with five participants in video tiles.",
  ),
  oncology: shot(
    "ihp-oncology-center",
    1170,
    634,
    "Team members presenting to children around a white table in a bright classroom with a world map on the wall.",
  ),
  kindergarten: shot(
    "ihp-kindergarten",
    411,
    532,
    "Team members speaking to children seated at a round table in a classroom with a screen.",
  ),
  hospital: shot(
    "ihp-childrens-hospital",
    868,
    488,
    "Children at a white table cutting out paper shapes, helped by team members.",
  ),
  library: shot(
    "outreach/library-handover",
    1280,
    960,
    "Four team members standing with a woman who is holding two handmade felt books.",
  ),
  workshop: shot(
    "ihp-school-workshop",
    720,
    1280,
    "Team members presenting on a screen at the front of a classroom of seated students.",
  ),
  schoolGroup: shot(
    "ihp-school-group",
    1280,
    720,
    "A group of students and team members standing in a line at the front of a classroom.",
  ),
  munWho: shot(
    "outreach/mun-who",
    1280,
    960,
    "Students seated around a horseshoe of desks in a committee room during a debate.",
  ),
  munCommittee: shot(
    "ihp-mun-committee",
    1280,
    960,
    "Students seated at desks arranged in a square in a classroom, some with laptops.",
  ),
  camp: shot(
    "ihp-camp-poster",
    989,
    1400,
    "A poster reading NIS Kazakhstan Summer Camp, Synthetic Biology and Personalized Medicine, 20.07.2026 to 31.07.2026.",
  ),
  jaryqTeam: shot(
    "ihp-jaryq-team",
    1400,
    788,
    "The team and performers posing together on a stage lit in red and green.",
  ),
  jaryqAudience: shot("ihp-jaryq-audience", 589, 1280, "A full audience seated in a school hall."),
  concertMagic: shot(
    "ihp-hospital-concert-magic",
    1280,
    720,
    "A magician in a red shirt performing a trick with a child in a hospital hall.",
  ),
  concertDance: shot(
    "ihp-hospital-concert-dance",
    1280,
    960,
    "Dancers in polka-dot dresses performing for children and parents seated in a hall.",
  ),
  denmark: shot(
    "ihp-bk-denmark-call",
    1280,
    960,
    "A laptop showing an online call, with a book page reading The End shared on screen beside the participants' video tiles.",
  ),
  youtube: shot(
    "ihp-youtube-channel",
    750,
    1280,
    "The team's YouTube channel page, iGEM&NIS-KAZAKHSTAN, with its latest videos listed.",
  ),
  incubator: shot(
    "ihp-startup-incubator",
    1280,
    800,
    "A screenshot of a large online meeting with many participants' tiles.",
  ),
} as const;

const link = "font-semibold underline underline-offset-2";

function HumanPractices() {
  return (
    <PageShell
      title="Human Practices"
      lede={"“Behind every statistic there is a human story.”"}
      piece="voices"
      sections={SECTIONS}
    >
      <Section id="prologue" title="Prologue: Where It All Started">
        <P>
          It all started not in the laboratory. It all started on social media, with the stories of
          people who had gone through chemotherapy and with one word that kept appearing again and
          again: DPYD. We did not know what it meant. We knew only one thing: behind it were real
          people whose treatment, which was supposed to save them, had instead caused them harm.
        </P>
        <P>
          We could have started with a hypothesis. Instead, we started with a question and decided
          not to answer it ourselves, but to ask people.
        </P>
        <P>
          We prepared a questionnaire for people who were undergoing or had already undergone
          chemotherapy and shared it through our own networks. We expected to receive data. Instead,
          we encountered silence.
        </P>
        <P>
          For many participants, it was physically difficult to answer. People refused to talk about
          how they felt after treatment and what complications they experienced. Some asked to skip
          the most painful questions. Others closed the form without completing it.
        </P>
        <Figure shots={[SHOTS.surveyAge]} />
        <Figure shots={[SHOTS.surveyGender]} />
        <P>
          This became our first real lesson in this project, long before we read our first
          scientific paper about the DPYD gene. Chemotherapy toxicity affects not only the body but
          also the mind. The topic that we planned to study as a biological problem turned out to be
          a deeply human wound that is not easy to open even through an anonymous questionnaire.
        </P>
        <P>
          At the same time, the survey confirmed what we had expected: side effects seriously affect
          patients&rsquo; everyday lives, and doctors sometimes have to change the treatment regimen
          or even stop the therapy altogether.
        </P>
        <P>
          We turned to international experience, studying publications, stories from patient
          organizations, and initiatives focused on fluoropyrimidine safety. We were especially
          impressed by the Advocates for Universal DPD/DPYD Testing (AUDT), an organization working
          to make DPYD genetic testing a mandatory step before treatment begins. The stories they
          collect clearly show that without timely testing, people can face consequences that could
          have been avoided.
        </P>
        <P>
          This was how ChemoGuard was born, not as a ready-made solution, but as a question that we
          decided to explore together with people, rather than for them.
        </P>
      </Section>

      <Section
        id="chapter-1"
        title="Chapter 1. The Perspective of Those Who Have Already Been Through It"
      >
        <P>Before talking to science, we decided to talk to people.</P>
        <P>
          Before this conversation, ChemoGuard was primarily a technical challenge for us: which
          primer would work, which variant panel would be optimal, how many hours would it take to
          get a result. We knew that patients were behind all of this, but, to be completely honest,
          we knew it more in our minds than in reality.
        </P>
        <P>
          This changed when we spoke with Karen Merritt. She is a co-founder of Advocates for
          Universal DPD/DPYD Testing. Karen lost her mother due to fluoropyrimidine toxicity caused
          by an undetected DPYD variant. She was not just another &ldquo;stakeholder from the
          list&rdquo; for us. She was a person who had literally paid the price for the absence of
          the test that we are now trying to make a reality.
        </P>
        <P>
          We asked her what she considered to be the main barrier to making DPYD testing a standard
          practice. Her answer was direct, without any softening: lack of awareness, education, and
          access to testing. She reminded us of something that we, immersed in the laboratory
          details, had almost forgotten: fluoropyrimidines are included in the WHO Model List of
          Essential Medicines and remain among the most commonly prescribed chemotherapy drugs for
          solid tumors.
          <Cite id="who-list" /> This is not a rare, exotic case on the margins of oncology. It
          happens to a huge number of people every day, and almost none of them know about it.
        </P>
        <P>
          It made us uncomfortable to realize how ordinary and &ldquo;normal&rdquo; this threat was.
          What we had been working on for months as a scientific problem was, for her, a personal
          loss that happened because no one had asked the system in time: &ldquo;Are you sure this
          particular person can receive this drug at the standard dose?&rdquo;
        </P>
        <P>
          She also told us about the economic barrier in the United States, how the healthcare
          system was initially reluctant to cover the cost of testing until Karen&rsquo;s advocacy
          and the accumulated data showed the obvious: testing is ultimately cheaper than treating
          the severe toxicity it can prevent. She also pointed out the generational gap within
          medicine, namely that young doctors who had already been trained with pharmacogenetics in
          mind tend to see testing as something natural, while some older doctors remain skeptical.
          We realized that we are fighting not only the cost of the test and not only genetics. We
          are fighting the inertia of an entire system, and this will have to be addressed as
          consciously as the PCR protocol itself.
        </P>
        <P>
          It was from Karen that we heard perhaps the most practical and, at the same time, most
          unexpected advice throughout the entire interview, and it literally changed how we think
          about implementing the test in Kazakhstan. She said that the test should not be something
          that the patient has to ask for themselves. It should be offered as a standard part of the
          initial examination in advance, calmly, as a routine safety measure, rather than as
          another frightening procedure among an already difficult diagnosis.
        </P>
        <P>
          Before this conversation, to be honest, we imagined the implementation of ChemoGuard as
          something like an option on a menu: a doctor could prescribe the test if they wanted to.
          After speaking with Karen, we realized that the idea of choice itself can become a
          barrier. If the test is not built into the standard protocol, it simply may not be
          offered, especially where doctors are not yet accustomed to pharmacogenetics. We started
          thinking not only about how to make the test cheap and fast, but also about how to
          integrate it into the standard patient pathway so that it would not require a separate
          effort from either the doctor or the patient.
        </P>
        <P>
          She also shared an observation that directly shaped our educational strategy: ordinary
          people often do not understand the simple fact that we are all biologically different and
          can respond differently to the same medicines. Her advice was very practical: use simple
          language and interactive materials, because games engage people and help them understand
          complex ideas in a way that dry text cannot. It was after this conversation that our
          decision to create a VR game and a board game stopped being just a &ldquo;nice addition to
          the project&rdquo;. We began to see them as an essential part of making sure the message
          actually reaches people rather than remaining as a beautiful presentation in a project
          folder.
        </P>
        <P>
          There was also a moment that touched us perhaps more than anything else in this
          conversation. We told Karen about Kazakhstan and about the fact that major medical centers
          are technically capable of performing DPYD testing, but it has still not become common
          practice. We also told her that patients we had spoken to admitted that they felt
          overwhelmed by the number of procedures they already face after an oncology diagnosis. We
          asked her: how can we present testing so that it feels like support rather than another
          burden? Her answer was very simple and for that reason especially memorable: present the
          test as part of the initial examination from the very beginning, in advance, before the
          patient even has time to become afraid, rather than as something they have to ask for in
          the middle of an already difficult treatment.
        </P>
        <P>
          Beyond the interview, Karen gave us something that no scientific paper could have given
          us: she introduced us to Dr. Dan Hertz, a medical advisor to AUDT, and shared the Guide
          for Implementing DPYD Genotyping for Systemic Fluoropyrimidines into Clinical Practice, a
          practical guide written by her colleagues.
          <Cite id="guide" /> This gesture was not simply about passing on a contact. Personally
          guiding us further along the chain was the first moment when we felt that we were not
          speaking to a &ldquo;source for the project&rdquo;, but to a person who genuinely wanted
          us to succeed in taking this work to the end.
        </P>
        <P>
          We left this conversation with a different ChemoGuard in our minds from the one we had
          brought with us. Not because the biological protocol itself had changed, but because for
          the first time throughout the project, we truly understood who we were doing all of this
          for.
        </P>
        <Figure shots={[SHOTS.merritt]} />
      </Section>

      <Section id="chapter-2" title="Chapter 2. The Voice of Science">
        <P>
          Next, we came to Dr. Markus Jörger with a question that seemed almost technical to us:
          what do researchers miss when they focus exclusively on genetic data? We did not expect
          the answer to make us rethink the very purpose of our project.
        </P>
        <P>
          Personalized medicine in oncology, he explained, comes down to two things: maximizing
          treatment effectiveness and minimizing toxicity. For DPYD testing, the second is
          especially important, particularly for vulnerable patients who may face the most serious
          consequences from severe toxicity. It was a simple statement, but it made us admit that,
          until that moment, we had implicitly thought of ChemoGuard as a way to &ldquo;find a
          genetic variant&rdquo;, as if finding it was already the goal. After this conversation, we
          began to think about it differently, as a clinical decision-making tool that helps a
          doctor develop a safer strategy for a particular patient, rather than simply recording a
          result in a genetic report.
        </P>
        <P>
          Dr. Jörger also explained why testing does not automatically become standard practice,
          even when it is already included in clinical guidelines: doctors and hospitals need time
          to integrate a new approach into their internal protocols and understand where to send
          samples, how long to wait for the result, and how to receive it before treatment begins.
          He emphasized the difficult imbalance: preventing toxicity is much less visible and
          &ldquo;marketable&rdquo; than developing a new drug. Pharmaceutical companies actively
          promote new medicines, while diagnostic tests usually do not receive the same support,
          without a promotional budget or someone coming to the clinic to explain them.
        </P>
        <P>
          This became a turning point for us that changed not the biology of the project, but its
          boundaries: we realized that it was not enough to create an accessible test and
          demonstrate its accuracy. Educational materials and professional communication with
          doctors stopped being a &ldquo;supplement&rdquo; to the project for us. They became an
          essential part of the implementation process, equally important as the PCR protocol
          itself.
        </P>
        <P>
          He also drew our attention to the role of reimbursement: if a hospital or patient has to
          pay for the test themselves, this becomes an additional barrier. This means that the
          accessibility of a test is determined not only by its laboratory cost, but also by the
          economic and organizational environment in which it is used. We heard a direct reflection
          of our own pricing model in this, because $30 per test sounds inexpensive only until you
          ask who exactly will pay for it and at what point in the treatment.
        </P>
        <P>
          When we asked what could accelerate the implementation of DPYD testing specifically in
          Kazakhstan, he suggested a concrete approach: organize meetings and workshops for doctors,
          present the evidence, and explain practical aspects such as reimbursement, sample
          processing, and timelines. Even an interview like ours, he said, already helps make the
          new technology more recognizable. His final advice directly influenced the scientific
          direction of the project: to pay attention specifically to the genetic variants that are
          relevant to our population, since significant DPYD variants may differ between
          populations. This became not just a general recommendation, but a specific direction for
          our further scientific work.
        </P>
        <P>
          After this, we had a meeting with Professor Munir Pirmohamed (University of Liverpool). He
          spoke with us as if we were already colleagues working on the same problem, in a detailed
          and very practical way, without looking down on the fact that we were a school team.
        </P>
        <P>
          Regarding the selection of DPYD variants, he advised us to start with the standard
          4-variant CPIC panel and then gradually expand it as local data accumulates, noting that
          the genetics of the Kazakh population may overlap with other Asian populations rather than
          being completely unique. This both simplified our plan and made us more realistic: we
          realized that we could not simply take an existing Western panel and call it universal. We
          would have to honestly check how well it fits our population. Regarding the sample type,
          he gave a clear recommendation in favor of blood, as saliva is more prone to contamination
          and is less reliable for genotyping.
        </P>
        <P>
          He identified the involvement of doctors as the main barrier to scaling testing within the
          NHS: any information campaign is useless if clinicians themselves are not ready to use the
          test. This echoed what we had already heard from Karen, but from the perspective of the
          healthcare system rather than patient advocacy. It finally convinced us that this was not
          a one-time observation from one person, but a systematic issue that would have to be
          considered in any country, including ours.
        </P>
        <P>
          When asked what makes a diagnostic test trustworthy, he answered briefly: regulatory
          approval. This phrase, spoken even before our conversation with MEDITOR, prepared us for
          the idea that the regulatory pathway is not simply a bureaucratic formality at the end of
          the project, but part of what makes a test a &ldquo;working test&rdquo;.
        </P>
        <P>
          Another piece of advice concerned communication with the patient: it would be more logical
          to build the explanation around the specific drug capecitabine, similar to describing an
          &ldquo;allergy&rdquo; to a medication, rather than around abstract genetic terms. This
          gives the patient a clearer and more confident understanding of what is happening, instead
          of frightening them with the word &ldquo;mutation&rdquo;.
        </P>
        <P>
          When asked about the target testing time, he recommended aiming for 5 days, noting that a
          faster result does not add significant clinical value. Hearing this was somewhat
          unexpected, considering that we are developing a test that takes 6 hours, but we did not
          see it as a reason to give up on speed. Instead, we saw it as confirmation that our
          advantage lies not only in clinical necessity, but also in organizational flexibility: a
          test that is ready during one patient visit, rather than requiring another visit, can
          itself reduce the burden on an already overloaded system.
        </P>
        <Figure shots={[SHOTS.pirmohamed]} />
        <P>
          Dr. Dan Hertz, a clinical pharmacist and medical advisor to AUDT, whom Karen referred us
          to, began the conversation by challenging one of our own assumptions. We thought that the
          main reason doctors did not follow dose reduction recommendations for intermediate
          metabolizers was the fear of losing treatment effectiveness. He told us that the data
          showed the opposite: the real problem was not this, but the fact that clinicians were
          simply not familiar enough with the basic pharmacology behind the issue. Hearing this was
          somewhat sobering. We had been preparing to convince doctors of the effectiveness of dose
          adjustment, but it turned out that the first step was simply to educate them. He suggested
          using a familiar analogy, such as dose reduction in cases of renal or hepatic impairment,
          to explain this logic to doctors in terms they already understand.
        </P>
        <P>
          He told us that before the FDA warning was added to drug labels, their approach was to
          work directly with clinics where tragic patient deaths had occurred, together with quality
          improvement and personalized medicine teams. Now, the focus has shifted entirely towards
          education and information campaigns, and, according to him, these efforts should primarily
          focus on educating doctors, not only the general public. This became an important
          correction for us. Before this conversation, we had focused a lot on educational materials
          for patients and children, but had hardly considered that doctors themselves could be an
          equally, and sometimes even more, important audience for education.
        </P>
        <P>
          The most practical advice concerned implementation in a system without developed
          infrastructure, such as in the United States. He suggested prioritizing the development of
          an affordable, rapid point-of-care test that could be performed directly at any clinic,
          providing a result within a few hours or a day. Hearing this from a medical advisor of an
          international patient organization, without him knowing our specific numbers beforehand,
          gave us direct confirmation of the direction we were already taking with ChemoGuard.
        </P>
        <Figure shots={[SHOTS.hertz]} />
      </Section>

      <Section id="chapter-3" title="Chapter 3. From an Idea to the Kazakh Reality">
        <P>
          Our conversations with international experts confirmed the value of the idea. But the next
          question we asked ourselves was different and much more difficult: could we actually do
          this here, in Kazakhstan, and not only in theory?
        </P>
        <P>
          Until this point, ChemoGuard existed mainly as a scientific hypothesis supported by
          interviews and literature. We understood the protocol on paper, but we did not have an
          answer to a simple question: who in the country could actually produce it?
        </P>
        <P>
          We found the answer when we started working with National Center for Biotechnology, a
          leading scientific institution in the field of biology in the country, specifically with
          the Molecular Diagnostics Laboratory under the leadership of Ilyas Amirkhanovich
          Akhmetollayev, Candidate of Biological Sciences, a specialist in molecular biology and the
          development of diagnostic test systems, and the author of more than 25 scientific
          publications and three patents.
        </P>
        <P>
          The moment when we realized that ChemoGuard had not only an idea, but also a real
          laboratory, real equipment, and a real specialist behind its production, became one of
          those quiet but important turning points in the project. Before this, we could talk as
          much as we wanted about an accessible test for Kazakhstan, but it was still abstract,
          without evidence that someone in the country could actually produce the reagents and carry
          out validation. This partnership moved ChemoGuard from being an &ldquo;interesting student
          project&rdquo; to something that could physically be produced inside the country by a
          domestic manufacturer. This was a point that, as we later learned during our conversation
          with MEDITOR, was also important from the perspective of the product&rsquo;s regulatory
          classification.
        </P>
        <Figure shots={[SHOTS.lab]} />
        <P>
          With this foundation, ChemoGuard took its current form: a multiplex PCR test for 4 key
          DPYD gene variants based on the CPIC panel, with a result available within 6 hours
          compared with 4–16 days for existing alternatives on the market, a cost of around 13
          dollars, and a target patient price of around 30 dollars compared with 70–80 dollars for
          individual foreign testing options.
        </P>
        <P>
          To understand how realistic this was not only from a scientific perspective, but also from
          a production and market perspective, we turned to professionals in the laboratory
          industry, namely InVivo and Gemotest, preparing detailed questions about production
          adaptation, logistics across the regions of Kazakhstan, realistic production costs,
          quality requirements, and how to properly organize informed consent for genetic testing.
        </P>
        <P>
          Our conversation with Gemotest gave us the first concrete answers about the market. We
          learned that the most realistic first customers for ChemoGuard would be private oncology
          clinics and laboratory networks rather than individual patients, since sample collection
          still needs to take place in a clinical setting. We also learned that the main reason an
          existing DPYD test is not routinely prescribed is not only limited awareness, but also
          reimbursement. Around 80% of chemotherapy in the region is covered through the state
          medical insurance system, while DPYD testing is not included in this coverage.
        </P>
        <P>
          The interview also confirmed that our 6 hour turnaround could be a real clinical
          advantage. According to the oncologist we spoke with, a same day result can allow doctors
          to make treatment decisions without delaying chemotherapy. At the same time, we learned
          that ChemoGuard should be presented as a screening test covering the most clinically
          significant variants, rather than as a complete genetic profile.
        </P>
        <P>
          The experts also helped us rethink how the test should be communicated to patients.
          Instead of presenting genetic testing as another complicated procedure, they suggested
          explaining it as a normal part of treatment preparation, similar to checking liver or
          kidney function before chemotherapy. This helped us see that accessibility is not only
          about price and speed, but also about whether the test can fit naturally into the existing
          clinical workflow.
        </P>
        <P>
          Gemotest also shared anonymized market data showing that DPYD testing in Kazakhstan is
          already growing. Testing volume doubled in 2025 compared with 2024, and during the first
          nine months of 2026 it was already 50% higher than the total volume for 2025. For us, this
          was important evidence that the need for DPYD testing already exists in Kazakhstan, even
          before a faster and more affordable domestic alternative is available.
        </P>
        <P>
          The discussion with InVivo is still ongoing, so we are waiting for their answers before
          drawing conclusions about production adaptation, regional logistics, quality requirements
          and informed consent. We decided not to fill these gaps with assumptions. Instead, we will
          add their findings once the interview is complete, keeping our development plan based on
          evidence rather than speculation.
        </P>
      </Section>

      <Section id="chapter-4" title="Chapter 4. From the Laboratory to Medical Reality">
        <P>
          A good test is not yet a ready medical product. This became clear to us during our meeting
          with regulatory specialists from the consulting company MEDITOR in Almaty, namely Sofia
          and Kamilla.
        </P>
        <P>
          We wanted to understand the real path that a product like ChemoGuard has to go through to
          enter the market in Kazakhstan, not just according to the law, but based on the experience
          of professionals.
        </P>
        <P>
          Before we even had a chance to ask about registration timelines, the specialists asked us
          to clearly classify the product: whether it was software or a physical device, what its
          risk level was, and where it was produced. This was an important lesson in itself. Until
          that moment, we had considered registration as one single process, but we learned that the
          pathway depends on this classification.
        </P>
        <P>
          When we described ChemoGuard as a physical device that detects genetic mutations and is
          produced domestically by a manufacturer from the National Center for Biotechnology, we
          were told that it would likely be classified as a Class 2B risk device, and that such
          devices are subject to genetic testing. The registration period would be around 8–11
          months, provided that the full documentation package is prepared and the production site
          successfully passes inspection. This became one of the most valuable concrete figures in
          our roadmap, not a guess, but a real reference point around which we could finally build
          an actual plan rather than approximate expectations.
        </P>
        <P>
          We asked what most often becomes a surprise for new applications and causes delays. The
          answer was reassuring in one way: MEDITOR reviews the documentation before submission to
          help prevent delays. If the National Expert Center has comments, the applicant is given
          several opportunities to correct them rather than just one. We were also given three
          specific reasons for direct rejection: missing the deadline for correcting comments, being
          unable to provide the necessary documents, and failing the production site inspection.
          However, we learned that the inspection plan is sent one week in advance, which reduces
          this risk.
        </P>
        <P>
          We asked about cold chain risks and scaling from one pilot to different regions. The
          answer revealed something we had not fully understood: after obtaining the registration
          certificate, distribution across regions is essentially unrestricted, without additional
          barriers. The logistical limitation concerns only the laboratory testing stage itself. The
          samples must meet the specified temperature storage conditions, otherwise they risk being
          rejected.
        </P>
        <P>
          The most unexpected and useful question was one that the specialists asked us rather than
          the other way around: whether our software/algorithm came from a foreign manufacturer or
          was an original development. We explained that ChemoGuard is not a completely new test,
          but an improvement of existing approaches, and we learned about a requirement we had not
          known about: for a domestic manufacturer, the software/algorithm must be registered
          separately in the software registry before the registration of the medical device itself
          begins. We would also need ISO certification of the production site because of the higher
          risk class. This was new information that had not been included in our initial questions,
          and it directly affected our development plan. Now we know that we need another type of
          expertise in our team, one that we had not even realized we would need a month earlier.
        </P>
        <P>
          At the same time, we did not receive answers to questions about typical wholesale markups,
          distributors&rsquo; willingness to work with the product at the RUO stage before full
          certification, or estimated sales volumes. The specialists honestly explained that these
          questions were outside their area of expertise. This became a useful, although unexpected,
          boundary: for questions about margins and sales volumes, we need a different type of
          contact, a real wholesale distributor rather than a regulatory consultant.
        </P>
        <Figure shots={[SHOTS.meditor]} />
      </Section>

      <Section id="chapter-5" title="Chapter 5. Meeting the People Behind the Statistics">
        <P>
          Science explains the mechanism. But behind every percentage in a toxicity table there is a
          real person and we wanted to see this side of the problem with our own eyes.
        </P>
        <Sub>Oncology Center</Sub>
        <P>
          We visited an oncology center and conducted a social and educational activity for
          patients. The atmosphere was noticeably different from what we would later see in the
          kindergarten: despite the similar format of our work the environment was much more tense,
          we were talking to children around 7-9 years old who were undergoing treatment themselves
          rather than simply learning about science in an abstract way.
        </P>
        <Figure shots={[SHOTS.oncology]} />
        <P>
          To make the statistics feel human and tangible not only for ourselves but also for our
          audience, we collected and adapted stories of people who had faced the consequences of a
          non personalized approach to chemotherapy from publicly available sources, including
          materials from the AUDT community and stories that people had shared publicly themselves.
          This is how the book &ldquo;The Hidden Code&rdquo; was created, &ldquo;Real Stories.
          Genetic Truths. A Stronger Future.&rdquo;, as written on its cover.
        </P>
        <P>
          We intentionally did not build the narrative around individual people as the central
          figures of the book. There are around ten stories in it, and each one is difficult in its
          own way. What was more important to us was to bring these stories together and make the
          book accessible to as many people as possible. We translated and recorded it in five
          languages, namely Russian, Kazakh, English, Vietnamese and Chinese, using TTSMaker speech
          synthesis technology, so that it could also be heard by people who are blind or visually
          impaired and by those who simply find it easier to receive information through audio.
        </P>
        <P>
          <a
            href="https://heyzine.com/flip-book/c91329e4a4.html"
            className={link}
            style={{ color: C.ink }}
          >
            heyzine.com/flip-book/c91329e4a4.html
          </a>
        </P>

        <Sub>School for Blind Students</Sub>
        <P>
          Therefore, we later visited a boarding school for blind students, where we presented our
          project and talked about DNA, genetics, enzymes and personalized medicine. To make the
          explanation more accessible, we used bracelets as a tactile model of DNA, which allowed
          the students to explore its structure themselves. We also discussed pharmacogenetics and
          explained why the same medicine can affect different people differently.
        </P>
        <P>
          A special part of the meeting was giving them our book The Hidden Code in an audio format
          in Kazakh and a story printed in Braille. We also gave them a felt book so that they could
          have an idea of medicine. It was important for us not only to talk about personalized
          medicine but also to make this information accessible to people with visual impairments.
        </P>
        <P>
          The meeting left us with very warm impressions. We saw the students&rsquo; genuine
          interest and felt that our work was truly going beyond the laboratory. This visit reminded
          us that accessibility in science is not only about the cost of a technology but also about
          every person&rsquo;s ability to understand and receive information about their own health.
        </P>
        <Figure shots={[SHOTS.library]} />

        <Sub>Kindergarten and Children&rsquo;s Hospital</Sub>
        <P>
          At the kindergarten, we conducted a &ldquo;World of DNA&rdquo; program for fifteen
          children aged 5-7, including an icebreaker game in a circle, a 3D DNA model, building DNA
          models from marshmallows and toothpicks, short educational cartoons and team DNA puzzles.
          The children were interested in discussing why everyone is different, and at the end they
          received sweets and felt a little like real scientists.
        </P>
        <P>
          We also conducted a similar but more condensed program at the Regional Children&rsquo;s
          Hospital of Shymkent with children aged 8-12 who were undergoing treatment. Due to the
          limited time, the program was reduced to one interactive activity: the children cut out
          colored templates of DNA fragments and attached them to a model of a bacterium, learning
          visually how scientists use bacteria to create medicines. Following the doctor&rsquo;s
          recommendation, we did not bring sweets and instead gave the children a paper template for
          assembling a 3D DNA model at home. The hospital staff noted that the children enjoyed this
          format of learning.
        </P>
        <Figure shots={[SHOTS.kindergarten, SHOTS.hospital]} />

        <Sub>School Workshops: Kazygurt, Samgau, Auzhan</Sub>
        <P>
          For older students, specifically fifth and sixth graders and later eighth and ninth
          graders from Kazygurt Intellectual School, Samgau and Auzhan, we conducted bilingual
          educational workshops about DNA, genes and the connection between genetics and medicine,
          with an interactive &ldquo;True or False&rdquo; game and a team activity called
          &ldquo;Save the Patient through the DNA Pathway.&rdquo;
        </P>
        <P>
          Our first workshop at Kazygurt showed us that even for this age group, DNA can be a
          difficult topic. This directly influenced how we simplified our approach for preschool
          children at the kindergarten: we removed the lecture part and added more games and
          creative activities. At Auzhan School, we also presented the idea of our 2026 project
          directly to the students and introduced the book &ldquo;The Hidden Code&rdquo; together
          with its audio version.
        </P>
        <Figure shots={[SHOTS.workshop, SHOTS.schoolGroup]} />
      </Section>

      <Section id="chapter-6" title="Chapter 6. From Conversation to Public Dialogue">
        <P>
          Personalized medicine is not only about science. It also raises questions of inequality in
          healthcare, access to diagnostics, international cooperation and the distribution of
          medical innovations. We realized that a regular lecture could not capture all this
          complexity and chose the Model United Nations (MUN) format.
        </P>
        <P>
          We organized a one day MUN conference for more than 50 participants, lasting from 8:00 to
          17:00, with three committees in three different languages:
        </P>
        <Bullets
          items={[
            "UNGA, in Kazakh, with the agenda: “Ensuring Equal Access to Personalized Medicine and Reducing Global Inequality in Healthcare”",
            "WHO, in Russian, with the agenda: “Improving International Cooperation in Genetic Research and the Exchange of Medical Innovations”",
            "UNICEF, in English, with the agenda: “Ensuring Equal Access to Diagnosis and Treatment of Childhood Cancer in Resource Limited Countries”",
          ]}
        />
        <P>
          We intentionally chose childhood cancer as one of the topics because it clearly
          demonstrates the consequences of inequality in healthcare: a child&rsquo;s access to
          diagnosis and treatment should not depend on where they were born. According to the WHO,
          more than 80% of children with cancer are cured in high income countries, while in many
          low and middle income countries this figure is below 30%.
          <Cite id="who-children" />
        </P>
        <P>
          The conference went through the full cycle of the policy making process: research →
          position paper → debate → negotiation → resolution. Participants defended not their
          personal opinions but the positions of their assigned countries or stakeholders, which
          required them to find compromises between competing priorities.
        </P>
        <P>
          The discussion in the UNGA committee changed our own understanding of the sustainability
          of the project: developing the technology is only part of the solution; its accessibility,
          affordability and real world implementation are equally important. We realized that if a
          new technology remains available only to those who already have financial or geographical
          access to healthcare, it will not solve the original problem but simply move it elsewhere.
        </P>
        <Figure shots={[SHOTS.munWho]} />
        <Figure shots={[SHOTS.munCommittee]} />
        <P>
          However, one day of MUN was not enough to cover all the questions that arose around
          personalized medicine. Therefore, we also continued the discussion in the format of an
          educational camp, where participants could not simply hear about the problem but explore
          it more deeply through teamwork, discussions and interactive activities.
        </P>
        <P>
          At the camp, we continued discussing genetics, personalized medicine, access to
          diagnostics and the role of technology in healthcare. Participants worked together,
          discussed different sides of medical issues and tried to look at the same situation from
          the perspectives of different stakeholders.
        </P>
        <P>
          For us, this format was especially valuable because the dialogue was not limited to ready
          made answers. Participants asked their own questions, debated, proposed solutions and
          faced the need to choose between an ideal solution and one that could actually be
          implemented in specific conditions.
        </P>
        <Figure shots={[SHOTS.camp]} />
        <P>
          The camp continued the same idea that we brought to MUN: medical innovation does not exist
          separately from society. Its success depends not only on how well the technology works,
          but also on whether people understand it, whether healthcare professionals are ready to
          use it and whether the healthcare system can provide equal access to it.
        </P>
        <P>
          The discussion in the UNGA committee and the experience of the camp changed our own
          understanding of the sustainability of the project: developing the technology is only part
          of the solution; its accessibility, affordability and real world implementation are
          equally important. We realized that if a new technology remains available only to those
          who already have financial or geographical access to healthcare, it will not solve the
          original problem but simply move it elsewhere.
        </P>
        <P>
          That is why after this stage we began to see ChemoGuard not simply as a test, but as part
          of a broader system, from informing the patient and educating doctors to accessible
          diagnostics and clinical decision making.
        </P>
      </Section>

      <Section id="chapter-7" title="Chapter 7. When Science Meets Compassion">
        <P>
          A project dedicated to preventing harm from chemotherapy could not remain limited to
          scientific work.
        </P>
        <Sub>JARYQ: Light</Sub>
        <P>
          Jaryq means &ldquo;light&rdquo; in Kazakh. This was the image we wanted to convey through
          our first charity concert on September 11 at NIS Karatau, a small ray of light and hope
          for a person going through a difficult period.
        </P>
        <P>
          The program brought together dance performances, a traditional Kazakh orchestra with ten
          dombra players and one kobyz player, a theatrical performance, a professional magic show
          and a vocal performance with a choir, violin and guitar. During the concert, we also
          explained the DPYD problem to the audience in simple language.
        </P>
        <P>
          The concert brought together around 200 students, teachers and school staff and helped
          raise 400,000 tenge (~$850) for the treatment of Inabat Narikovna.
        </P>
        <Figure shots={[SHOTS.jaryqTeam, SHOTS.jaryqAudience]} />

        <Sub>Concert at the Children&rsquo;s Oncology Hospital</Sub>
        <P>
          Our second concert, held on September 16, was organized differently. We intentionally made
          it non commercial. Instead of raising funds, we simply wanted to give the children
          undergoing treatment a short break from their hospital routine. Following the
          doctor&rsquo;s recommendation, we did not bring sweets.
        </P>
        <P>
          The parents and medical staff thanked us for bringing this kind of entertainment directly
          to the hospital. There was no financial result, but there was direct contact with the
          children and their sincere, warm reaction. This experience taught us that supporting
          people facing cancer is not limited to fundraising or science. Sometimes, it is simply
          about bringing a little joy during treatment.
        </P>
        <Figure shots={[SHOTS.concertMagic]} />
        <Figure shots={[SHOTS.concertDance]} />

        <Sub>Second JARYQ: NIS Abay</Sub>
        <P>
          On October 9, we held our third concert at NIS Abay Shymkent to raise funds for the
          treatment of Aliya Tulendiyevna Khanazarova, a school staff member. The concert raised
          500,000 tenge (~$1,050).
        </P>
        <P>
          Together, the two fundraising concerts raised 900,000 tenge (around $1,900) and, equally
          importantly, showed us that our initiative could continue rather than remain a one time
          gesture.
        </P>
      </Section>

      <Section id="chapter-8" title="Chapter 8. Beyond Kazakhstan">
        <Sub>International Team</Sub>
        <P>
          Our team is international from the beginning: it includes a student from Vietnam alongside
          students from Kazakhstan. This is part of how the team itself is structured and helps us
          look at the problem more broadly from the very beginning, rather than only within the
          borders of one country.
        </P>
        <Sub>BK Denmark</Sub>
        <P>
          On August 27, we held an online meeting via Google Meet with two members of the BK Denmark
          team. We shared our project topic through a short presentation, while the Danish team
          presented their idea, which focused on preventing methanol poisoning through synthetic
          biology in the context of addressing alcohol addiction.
        </P>
        <P>
          Although our topics were fundamentally different, this did not prevent us from sharing
          real experiences and challenges. The atmosphere of the meeting was very friendly despite
          the differences in language, culture and the subject areas of our projects.
        </P>
        <P>
          We shared our online book with them for translation, and they kindly agreed to help. The
          BK Denmark team also promised to let us know if any ideas or opportunities for further
          collaboration came up.
        </P>
        <Figure shots={[SHOTS.denmark]} />
        <Sub>YouTube Channel</Sub>
        <P>
          To make pharmacogenetics accessible to a much wider audience, including school students
          preparing for A-Level Biology and Chemistry, we developed a content strategy for our own
          YouTube channel: 3-5 minute videos twice a week, with a schedule covering more than 30
          topics.
        </P>
        <P>
          While developing this content plan, we learned a surprising amount ourselves. We explored
          the history of cancer treatment more deeply and looked into the complex mechanism of
          action of 5-fluorouracil, then searched for ways to explain it in simple language for our
          viewers. Filming the videos together also became an unexpectedly valuable experience for
          strengthening our team.
        </P>
        <Figure shots={[SHOTS.youtube]} />
        <P>
          <a
            href="https://youtube.com/@nis-kazakhstan?si=t3BjPpXhovZHdRg0"
            className={link}
            style={{ color: C.ink }}
          >
            youtube.com/@nis-kazakhstan
          </a>
        </P>
      </Section>

      <Section id="chapter-9" title="Chapter 9. From a Scientific Idea to a Working Solution">
        <P>
          A good test is not enough to simply invent. It needs to be brought to a real patient. To
          take the entrepreneurial and implementation side of ChemoGuard seriously, we applied to
          the NIS StartUP Incubator, a 12-week program for students and graduates of Nazarbayev
          Intellectual Schools, supported by the Corporate Fund Damu Qory.
        </P>
        <P>
          Out of 224 applications, the expert committee selected only 35 projects for the main
          program, and ours was among them. The program includes a full educational course,
          workshops, individual mentoring, work with product and pitching experts, and continues all
          the way to Demo Day in Astana.
        </P>
        <P>
          For us, this became the first truly independent confirmation that ChemoGuard is not just
          an idea on paper, but a project that people outside our own team believe has real
          potential.
        </P>
        <Figure shots={[SHOTS.incubator]} />
      </Section>

      <Section id="conclusion" title="Conclusion">
        <P>
          When we put everything together, it becomes not a list of activities, but one continuous
          journey.
        </P>
        <P>
          We started with a question on social media and received not data, but silence, which
          taught us more than any number could have. We turned to patient advocates and doctors and
          realized that creating an accurate test is not enough if no one is ready to use it. We
          went to laboratories and regulatory consultants in Kazakhstan and learned that the path
          from a prototype to a patient goes not only through science, but also through risk
          classification, a software registry, and eight to eleven months of paperwork. We went to
          children in a kindergarten, a hospital, and a school for blind students and realized that
          accessibility means not only &ldquo;affordable&rdquo;, but also
          &ldquo;understandable&rdquo; and &ldquo;reaching everyone&rdquo;. We organized debates for
          fifty school students in three languages and saw that even the most advanced solution is
          meaningless if it remains available only to those who already have access to it. We sang,
          danced, and performed magic tricks to raise almost two million tenge and give a few
          specific people a few hours of joy.
        </P>
        <P>
          And every time we returned from another conversation, we found ChemoGuard a little
          different, not because we decided to change it, but because the people we spoke to showed
          us what we could not see ourselves.
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
