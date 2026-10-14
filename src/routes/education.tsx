import { createFileRoute, Link } from "@tanstack/react-router";

import { C } from "@/components/hero/palette";
import { SECTIONS_OF } from "@/components/story/page-sections";
import { P, PageLink, PageShell, Section } from "@/components/story/PageShell";
import { Bullets, DataTable, Figure, type Shot } from "@/components/story/Prose";

// Education. The text and photographs are the team's own, from their document for this page, set without
// rewording. Nothing here is written by us.

const TITLE = "Education · ChemoGuard";
const DESCRIPTION =
  "What the team taught about DNA and medicines, from a kindergarten to a library for the blind, and what each audience taught them back.";

export const Route = createFileRoute("/education")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
    ],
  }),
  component: Education,
});

const SLIDES = [
  {
    file: "outreach/kindergarten-group",
    alt: "Team members and about fifteen young children waving from small tables in a kindergarten classroom.",
    caption: "Gulzhamal kindergarten, Shymkent, 4 August.",
  },
  {
    file: "outreach/mun-group",
    alt: "A large group of school students in formal dress posing together in a school hall.",
    caption: "iGEM Model United Nations, NIS Karatau, 12 September.",
  },
  {
    file: "outreach/library-handover",
    alt: "Four team members standing with a librarian who is holding two handmade felt books.",
    caption: "Handing the felt books to the city library for the blind, 28 September.",
  },
] as const;

const shot = (file: string, w: number, h: number, alt: string): Shot => ({
  file: `outreach/${file}`,
  w,
  h,
  alt,
});

const SHOTS = {
  campTest: shot(
    "camp-test-results",
    910,
    644,
    "A results sheet from the first-day test listing anonymous participant codes with scores between 6 and 15 out of 15.",
  ),
  campFeedback: shot(
    "camp-feedback",
    778,
    1100,
    "Five chat messages from camp participants after day two, thanking the team and praising the simple explanations and real-life examples.",
  ),
  truthOrMyth: shot(
    "kazygurt-truth-or-myth",
    618,
    1100,
    "School children standing in a classroom holding up green cards.",
  ),
  poster1: shot(
    "kazygurt-poster-1",
    618,
    1100,
    "A poster on a desk with picture cards arranged along two branching paths drawn from a DNA symbol, with handwritten notes.",
  ),
  poster2: shot(
    "kazygurt-poster-2",
    618,
    1100,
    "A second poster with picture cards arranged along two branching paths, one marked with a green plus and one in red.",
  ),
  kindergarten: shot(
    "kindergarten-group",
    1280,
    720,
    "Team members and about fifteen young children waving from small tables in a kindergarten classroom.",
  ),
  cartoon: shot(
    "cartoon-frame",
    768,
    576,
    "A cartoon frame of a girl in a lab coat and goggles waving beside a smiling DNA helix in a laboratory.",
  ),
  marshmallow: shot(
    "marshmallow-dna",
    1179,
    652,
    "A child's hands pushing a toothpick into marshmallows to build a model of DNA.",
  ),
  samgau: shot(
    "samgau-class",
    619,
    1100,
    "A class of students and team members standing together at the back of a classroom.",
  ),
  catalaseSamgau: shot(
    "catalase-samgau",
    614,
    1100,
    "Students in lab coats, goggles and gloves working with test tubes at a wooden bench.",
  ),
  catalaseAuzhan: shot(
    "catalase-auzhan",
    618,
    1100,
    "Three students in aprons and gloves leaning over a rack of test tubes.",
  ),
  auzhan: shot(
    "auzhan-class",
    1280,
    960,
    "A class of students in aprons standing behind tables set with test tube racks in a school library.",
  ),
  munWho: shot(
    "mun-who",
    1280,
    960,
    "Students seated around a horseshoe of desks in a committee room during a debate.",
  ),
  munVote: shot(
    "mun-vote",
    1280,
    960,
    "Delegates at desks with small flags raising placards to vote.",
  ),
  munGroup: shot(
    "mun-group",
    1280,
    960,
    "A large group of school students in formal dress posing together in a school hall.",
  ),
  librarySession: shot(
    "library-session",
    1280,
    715,
    "Readers of the library, teenagers and adults, seated and listening during the session.",
  ),
  feltCover: shot(
    "felt-cover",
    825,
    1100,
    "A handmade felt book. Its cover reads NIS Kazakhstan and shows a tree with a flask, a light bulb, a heart and a book on its branches.",
  ),
  feltLab: shot(
    "felt-lab",
    1000,
    558,
    "A felt page with a petri dish of coloured microbes and a felt magnifying glass.",
  ),
  feltGerms: shot(
    "felt-germs",
    1000,
    558,
    "A felt page of round blue and purple germs with faces, one being lifted off by a hand.",
  ),
  feltPatient: shot(
    "felt-patient",
    1000,
    558,
    "A felt page showing a sick child in bed above a row of felt medicines.",
  ),
  feltBody: shot(
    "felt-body",
    1000,
    558,
    "A felt page with the outline of a human body surrounded by a felt heart, lungs, brain, liver and stomach.",
  ),
  usb: shot("audiobook-usb", 675, 900, "Three USB drives lying on a white surface."),
  handover: shot(
    "library-handover",
    1280,
    960,
    "Four team members standing with a librarian who is holding two handmade felt books.",
  ),
  libraryGroup: shot(
    "library-group",
    1280,
    960,
    "The team and readers of the library standing in a line in the library hall.",
  ),
  course: shot(
    "youtube-course",
    706,
    1100,
    "A list of video thumbnails from the team's YouTube channel, with titles in Russian and English.",
  ),
  analytics: shot(
    "youtube-analytics",
    1125,
    1047,
    "A channel analytics screen showing 56 subscribers, 3.2 thousand views, 241 likes, 12 comments, 35 shares and 150 views in the last 7 days.",
  ),
} as const;

/** The index rail; ids match the sections below. */
const SECTIONS = SECTIONS_OF["/education"];

const link = "font-semibold underline underline-offset-2";

function Education() {
  return (
    <PageShell
      title="Education"
      lede="This season we took our project out of the lab and into kindergartens, village schools, lyceums, a library, a UN simulation and a YouTube channel. This page is the story of what we taught, and of what our audiences taught us back."
      slides={SLIDES}
      sections={SECTIONS}
    >
      <Section id="why" title="Why we teach">
        <P>
          A tiny difference in one gene can turn a standard dose of chemotherapy into a dangerous
          one. That is the problem ChemoGuard works on: patients with certain variants of the DPYD
          gene break down fluoropyrimidines such as 5-fluorouracil too slowly, and the drug builds
          up in their body. A simple genetic test before treatment can warn the doctor in time.
        </P>
        <P>
          But while we were building a test, we kept running into the same thought. A test only
          helps if people understand why it exists. Pharmacogenetics, the idea that the same
          medicine can act differently in different people because their DNA is different, is still
          a young field in Kazakhstan (
          <a href="#references" className={link} style={{ color: C.ink }}>
            Zholdybayeva et al., 2014
          </a>
          ), and almost nobody learns it at school. If patients, parents and future doctors have
          never heard of it, a diagnostic tool stays on the shelf.
        </P>
        <P>
          So this season we took our project out of the lab and into kindergartens, village schools,
          lyceums, a library, a UN simulation and a YouTube channel. Everywhere we went, we tried to
          do two things: explain one idea well, and listen carefully to how people understood it.
          This page is the story of what we taught, and of what our audiences taught us back.
        </P>
      </Section>

      <Section id="idea" title="One idea, from age 4 to 28">
        <P>
          We did not want ten unrelated events. We wanted one message that could travel: your DNA is
          an instruction, everyone&rsquo;s instruction is a little different, and that is why one
          medicine can help one person and harm another.
        </P>
        <P>
          The message stayed the same; everything else changed with the audience. For four-year-olds
          it was a sweet DNA made of marshmallows. For fifth graders in a village school it was a
          poster on which they had to save a patient. For tenth graders it was an enzyme fizzing in
          a test tube. For camp participants it was their own research review, defended in front of
          a jury.
        </P>
        <P>
          A few rules guided us the whole way. Every session had something to make or test with your
          hands. Every session ended with the audience speaking, not us. We worked in Kazakh,
          Russian and English, so that language was never the reason someone stayed silent. And we
          were always honest: a genetic test does not replace a doctor, and it does not choose the
          treatment by itself.
        </P>
      </Section>

      <Section id="where" title="Where we went">
        <DataTable
          label="Where we went in 2026"
          head={["When (2026)", "Where", "Who", "Language"]}
          rows={[
            [
              "20 to 31 July",
              "Online Summer Camp “Synthetic Biology and Personalized Medicine”",
              "87 registered participants aged 11 to 28, from 9 countries",
              "English, Russian, Kazakh",
            ],
            [
              "30 July",
              "Kazygurt Intellectual School, rural Kazygurt district",
              "Grades 5 and 6, five groups",
              "Kazakh",
            ],
            ["4 August", "Gulzhamal kindergarten, Shymkent", "15 children aged 4 to 6", "Russian"],
            ["3 September", "Samgau school", "15 students, grades 9 and 10", "Kazakh"],
            ["4 September", "Auzhan KTL", "15 students, grade 10", "Kazakh"],
            [
              "12 September",
              "iGEM Model United Nations, NIS Karatau, Shymkent",
              "More than 50 school students",
              "Kazakh, Russian, English",
            ],
            [
              "28 September",
              "Shymkent City Special Library for Blind and Visually Impaired Citizens",
              "About 12 library readers, teenagers and adults",
              "Kazakh",
            ],
            [
              "All season",
              "YouTube course on pharmacogenetics",
              "Anyone online",
              "Russian and English, English subtitles",
            ],
          ]}
        />
      </Section>

      <Section id="camp" title="Nine countries, three languages, one summer camp">
        <P>
          We started with the people closest to us in age: students who love science but have no
          synthetic biology or personalized medicine in their schools. For twelve days in July we
          ran an online camp, and 87 participants aged 11 to 28 signed up from Kazakhstan,
          Uzbekistan, Kyrgyzstan, Russia, Turkey, Egypt, Bangladesh, China and the UAE.
        </P>
        <P>
          To make sure no one was left out because of language, we split into three groups: English
          (56), Russian (24) and Kazakh (7). Every presentation, lab guide and quiz existed in all
          three languages. Day by day we climbed from DNA and genes to enzymes, pharmacogenetics and
          diagnostics, and one whole lesson was about DPYD and fluoropyrimidines, the heart of our
          project. Participants ran virtual experiments on DNA sequencing and transgenic Drosophila,
          competed in Kahoot quizzes, and heard a guest lecture by Rasul Kemelov from the National
          Center for Biotechnology.
        </P>
        <P>
          On the first day everyone took an anonymous 15-question test. The first results ranged
          from 6 to 15 correct answers. Some participants already knew most of the material; others
          were meeting it for the first time. That gap is why we kept explanations simple and built
          each day on the one before.
        </P>
        <Figure
          shots={[SHOTS.campTest]}
          caption="First-day test results. Each participant chose a private code, so we could compare progress without collecting names."
        />
        <P>
          After every session we asked for feedback, and participants wrote to us in the chat. One
          of them told us the explanations were simple and to the point, and that the real-life
          examples helped most. We kept that in mind and leaned on real cases in the lessons that
          followed.
        </P>
        <Figure shots={[SHOTS.campFeedback]} caption="Messages from participants after day two." />
        <P>
          The camp ended with something we are proud of. Instead of a final exam, five teams of two
          wrote their own literature reviews and defended them in front of a jury with a 100-point
          rubric. They chose topics we would never have assigned: CAR-T cells controlled by logic
          gates, a biosensor for early Alzheimer&rsquo;s diagnosis, tooth regeneration,
          antithrombotic therapy, and how blue light changes the way we blink. In two weeks,
          participants went from learning about research to doing it.
        </P>
      </Section>

      <Section id="kazygurt" title="Two paths on one poster: Kazygurt">
        <P>
          On 30 July we drove out to Kazygurt Intellectual School, in a rural district where science
          events rarely come. Our audience was fifth and sixth graders, and we spoke with them in
          Kazakh.
        </P>
        <P>
          We began with a ball. Whoever caught it said their name and one thing they got from their
          mom or dad: eyes, height, a smile. From there the question asked itself: why do we look
          like our parents? The answer was DNA, which we described as the instruction booklet in a
          LEGO box. Then came genes, health, and what &ldquo;safe treatment&rdquo; means. To check
          ourselves, we played Truth or Myth, and the whole class voted with green and red cards.
        </P>
        <Figure
          shots={[SHOTS.truthOrMyth]}
          caption="Truth or Myth: green for truth, red for myth."
        />
        <P>
          The main task was a challenge called Save the patient through the DNA path. Each group got
          a set of picture cards: a sick child, a doctor, DNA, a genetic test, the right medicine, a
          healthy child. Mixed in were cards that did not belong: sweets, fast food, a game
          controller, a car, a dinosaur, a ball. The groups had to find the right cards, put them in
          order on a poster and defend it in 30 seconds.
        </P>
        <P>
          Five groups, five posters, and several of them did more than we asked. They drew a fork
          coming out of DNA: one road leads through the doctor, the genetic test and the right
          treatment to a healthy child; the other runs through sweets, fast food and video games to
          a sick one. Underneath, in their own handwriting: &ldquo;You need to be checked by a
          doctor.&rdquo; That is the whole idea of ChemoGuard, written by an eleven-year-old.
        </P>
        <Figure
          shots={[SHOTS.poster1, SHOTS.poster2]}
          caption="Two of the five posters. Both groups split DNA into a healthy path and an unhealthy one."
        />
        <P>
          The posters also showed us something we had not planned for. The children decided that
          fast food and sweets &ldquo;harm DNA&rdquo;. They took our new idea about genes and mixed
          it with a message they already knew well: eat healthy. Looking back, our extra cards
          invited exactly that, because all of them were about habits. The lesson for us was clear:
          the distractors you choose shape what children think the lesson is about. Next time, the
          extra cards will have nothing to do with health.
        </P>
        <P>
          The teachers thanked us and told us they appreciated a team coming all the way out to
          bring this kind of science lesson to their students.
        </P>
      </Section>

      <Section id="kindergarten" title="When DNA tastes like marshmallow: Gulzhamal kindergarten">
        <P>
          Preschoolers almost never get a science visitor. We wanted to know whether a four-year-old
          could hold on to one big idea: there is a small secret instruction inside each of us, and
          it is why no two people are exactly alike.
        </P>
        <P>
          On 4 August we spent the morning with 15 children aged 4 to 6 at Gulzhamal kindergarten in
          Shymkent. We passed a &ldquo;friendship ball&rdquo; around the circle and asked questions
          children love to answer: why aren&rsquo;t you identical, like two toys from a shop? Why
          does everyone have their own smile?
        </P>
        <Figure shots={[SHOTS.kindergarten]} caption="Saying goodbye at Gulzhamal kindergarten." />
        <P>
          Then we built DNA out of marshmallows and toothpicks, solved a team puzzle about how DNA
          copies itself, and played &ldquo;Feel like scientists&rdquo;: cutting two paper DNA
          strands, taping half of one to half of the other, and tucking the new strand into a paper
          bacterium. In between, the children watched two short cartoons that our team drew and
          animated ourselves: one about how DNA makes a copy of itself, the other about how
          scientists teach a bacterium to make medicine.
        </P>
        <Figure
          shots={[SHOTS.cartoon]}
          caption="A frame from one of the two cartoons we made for this session."
        />
        <P>
          At the end of each activity we asked simple check questions: Does everyone have DNA? Is
          DNA only in grown-ups? On average, 10 to 12 of the 15 children answered correctly. Their
          teacher thanked us and said the marshmallow model was a creative way to show what DNA
          looks like. She laughed that the children now think of DNA as something sweet.
        </P>
        <Figure
          shots={[SHOTS.marshmallow]}
          caption="The marshmallow model: the children's favourite part, and the hardest one."
        />
        <P>
          The marshmallow model taught us the most. It was by far the children&rsquo;s favourite
          part, and many of them could not finish it. Pushing toothpicks into soft marshmallows and
          keeping the pairs in a line takes fine motor skills that most four- and five-year-olds
          simply do not have yet. We had read their excitement as success. After this morning, we
          took the marshmallow DNA out of our programme for preschoolers and made the remaining
          activities simpler. A child enjoying an activity is not the same as an activity fitting
          the child.
        </P>
      </Section>

      <Section id="schools" title="A potato, some peroxide and ten myths: Samgau and Auzhan">
        <P>
          Ninth and tenth graders already know what an enzyme is from biology class. With them we
          could finally go all the way down to the mechanism behind ChemoGuard, and then let them
          see an enzyme at work with their own eyes.
        </P>
        <P>
          We ran the same programme on two days in a row: at Samgau school on 3 September (15
          students, grades 9 and 10) and at Auzhan KTL on 4 September (15 students, grade 10). The
          talk followed one chain: DNA, gene, protein, enzyme, and what the liver does with a
          medicine. Then we asked the question at the heart of our project: why can the same drug be
          safe for one person and dangerous for another? We were careful to add that a genetic test
          does not replace a doctor, because treatment always depends on more than genes.
        </P>
        <Figure shots={[SHOTS.samgau]} caption="Samgau school, 3 September." />
        <P>
          Next came ten statements and two cards each, green for truth and red for myth: &ldquo;All
          people have exactly the same genes.&rdquo; &ldquo;The same medicine always acts the same
          in everyone.&rdquo; &ldquo;A genetic test can choose a treatment instead of a
          doctor.&rdquo; At Auzhan KTL, 10 to 13 of the 15 students answered almost every statement
          correctly, and several came up afterwards to thank us for clearing up things they had
          believed.
        </P>
        <P>
          Every student also left with a QR code to Behind the Statistics There Is a Person, a book
          our team wrote ourselves for young readers. Cancer is usually explained through diagnoses
          and survival rates. Our book tells it through people: how treatment changes a
          person&rsquo;s everyday life, their family, their studies and their plans. We also
          recorded it as an audiobook in Kazakh, Russian and English.
        </P>
        <P>
          <a
            href="https://igemnis-kazakhstan.my.canva.site/read-our-book"
            className={link}
            style={{ color: C.ink }}
          >
            Read the book online
          </a>
          .
        </P>
        <P>
          Then the gloves and goggles went on. The class became a lab with one question: does an
          enzyme always work the same way? Students put equal pieces of potato into three test
          tubes, added solutions at pH 3, pH 7 and pH 11, then poured the same volume of hydrogen
          peroxide into each and started the stopwatch. The enzyme catalase in the potato splits
          peroxide into water and oxygen (2H₂O₂ → 2H₂O + O₂), and the oxygen rises as foam. The
          higher the foam, the harder the enzyme is working.
        </P>
        <P>
          Within minutes, the three tubes looked different. Students measured the foam with a ruler,
          filled in a results table, plotted foam height against pH and wrote their own conclusion.
          Along the way they practised real experimental thinking: pH was the variable they changed,
          foam height was what they measured, and the amount of potato, the volume of peroxide and
          the time stayed the same.
        </P>
        <P>
          This is where the experiment meets ChemoGuard. Students had just seen that the same enzyme
          can work fast or slow depending on its conditions. DPD, the enzyme that breaks down
          5-fluorouracil, is no different, except that in some people it works slowly because of a
          variant in their DPYD gene. When an enzyme is slow, the substance it should break down
          stays in the body longer, and with chemotherapy, that is where the danger begins.
        </P>
        <Figure
          shots={[SHOTS.catalaseSamgau, SHOTS.catalaseAuzhan]}
          caption="The catalase experiment at Samgau (left) and Auzhan KTL (right)."
        />
        <P>
          After the experiment, most students could explain in their own words what they had seen
          and why it mattered. Running the same session at two schools on two consecutive days also
          showed us that the programme does not depend on one particular class or teacher. With our
          slides, the myth list and the one-page lab worksheet, another team could run it tomorrow
          with nothing more than potatoes, peroxide and three test tubes.
        </P>
        <Figure shots={[SHOTS.auzhan]} caption="Auzhan KTL, 4 September." />
      </Section>

      <Section id="mun" title="Fifty delegates, three committees: iGEM Model United Nations">
        <P>
          Our school sessions explained the science. But the moment you accept that a test like
          ChemoGuard is useful, a harder question follows: why doesn&rsquo;t every patient get it?
          That question is no longer about biology. It is about money, hospitals, data and fairness
          between countries. Instead of answering it in a lecture, we let students work it out
          themselves.
        </P>
        <P>
          On 12 September, more than 50 students spent a full day, from 8 am to 5 pm, at an iGEM
          Model United Nations at NIS Karatau in Shymkent. They sat in three committees, each in its
          own language: the General Assembly in Kazakh, the WHO in Russian and UNICEF in English.
          Each delegate represented a country, wrote a position paper and then negotiated with
          others until their ideas became a resolution.
        </P>
        <Figure shots={[SHOTS.munWho]} caption="Delegates of the WHO committee during debate." />
        <P>
          What came out surprised us. The WHO committee proposed regional training in medical
          genetics and genetic counselling, and rules for sharing genomic data only with
          patients&rsquo; informed consent. The UNICEF committee wrote about treatment abandonment,
          childhood cancer registries and support for families who travel long distances to
          treatment. These are exactly the barriers a test like ChemoGuard would face in a real
          health system, and the students found them on their own.
        </P>
        <Figure shots={[SHOTS.munVote]} caption="Voting on a draft resolution." />
        <P>
          The full story of the MUN, including its link to the Sustainable Development Goals, is on
          our{" "}
          <Link to="/human-practices" className={link} style={{ color: C.ink }}>
            Human Practices page
          </Link>
          .
        </P>
        <Figure
          shots={[SHOTS.munGroup]}
          caption="Participants at the end of the day, 12 September."
        />
      </Section>

      <Section id="library" title="Learning by touch: the city library for the blind">
        <P>
          On 28 September we brought our session to about 12 readers of the Shymkent City Special
          Library for Blind and Visually Impaired Citizens. Our usual training is built on slides: a
          DNA helix, a cell, two people reacting differently to the same pill. For readers of this
          library almost none of it would work, and reading the slides aloud is not the same as
          teaching. So we rebuilt the whole session around what can be heard and touched.
        </P>
        <Figure
          shots={[SHOTS.librarySession]}
          caption="Readers of the library during our session, 28 September."
        />
        <P>
          The centre of it became a pair of bead strings. They feel almost identical, except that in
          one place a single bead has a different shape. Participants run their fingers along both
          strings until they find it. That one odd bead is a genetic variant: a tiny change in a
          long instruction, which is exactly what ChemoGuard looks for in the DPYD gene. Truth or
          Myth was played aloud instead of with cards, and we ended with open questions: if you were
          a scientist, what would you study? What should medicine look like in the future?
        </P>
        <P>
          We took the same idea further and made a whole book you read with your fingers. Our felt
          book has no text to read: every page is something to touch and move. On one page children
          find microbes in a petri dish and look at them through a felt magnifying glass. On another
          they meet the germs that make us ill. Then a sick child waits for the right medicine, and
          on the last page children place the heart, lungs, brain, liver and stomach inside a human
          body, piece by piece on Velcro. Each page leads to the next, from a single cell to a whole
          person who needs treatment.
        </P>
        <Figure
          shots={[SHOTS.feltCover]}
          caption="The cover: a tree of knowledge with a flask, a light bulb, a heart and a book on its branches."
        />
        <Figure
          shots={[SHOTS.feltLab, SHOTS.feltGerms]}
          caption="The lab page and the germs page. Every piece can be removed and put back."
        />
        <Figure
          shots={[SHOTS.feltPatient, SHOTS.feltBody]}
          caption="The patient page and the body page, where children assemble the organs themselves."
        />
        <P>
          Because the book is learned with the hands, it works for two audiences at once:
          preschoolers who cannot read yet and children who cannot see the pictures. We made three
          copies and handed copies to the library on 28 September, so its young readers can keep
          learning from them long after our visit.
        </P>
        <P>
          A session lasts an hour; we wanted to leave something behind. Earlier in the season our
          team wrote an online book, Behind the Statistics There Is a Person: real stories of people
          who went through cancer treatment and how it changed their lives, shared with their
          consent. A book on a screen is closed to someone who cannot see it, so we turned it into
          an audiobook. We voiced it with the AI speech platform TTSMaker in Kazakh, Russian and
          English, and loaded the three versions onto USB drives, which we handed to the library
          together with the felt books. Now the stories can be heard by anyone who prefers to listen
          rather than read.
        </P>
        <Figure
          shots={[SHOTS.usb]}
          caption="The audiobook in Kazakh, Russian and English, as handed to the library."
        />
        <Figure
          shots={[SHOTS.handover]}
          caption="Handing over the felt books and the audiobook to the library."
        />
        <Figure
          shots={[SHOTS.libraryGroup]}
          caption="With readers of the library after the session."
        />
        <P>
          Teaching without pictures made us find the core of each idea. A genetic variant became one
          odd bead. The human body became organs you place with your own hands. These simpler
          versions turned out to be clearer than our slides, and they are now part of the materials
          we share with other teams.
        </P>
      </Section>

      <Section id="course" title="A course that stays after we leave">
        <P>
          Every visit ends. The children go home, the classroom empties, and whatever we said lives
          only in their memory. We wanted something that stays: a resource a student can rewatch
          before an exam and a teacher can open in the middle of a lesson.
        </P>
        <P>
          So we made a YouTube course on pharmacogenetics: more than twenty short videos, two to six
          minutes each, in Russian or English, all with English subtitles. It follows the same path
          as our project. It starts with &ldquo;When does a medicine become a poison?&rdquo;, moves
          through 5-fluorouracil, the DPD enzyme and the DPYD gene, explains why chemotherapy causes
          hair loss and nausea, shows how enzymes work and how PCR finds a dangerous mutation, and
          ends with the future of personalized medicine. Half of the videos are tied to topics in
          the A-Level Biology curriculum, so a teacher can pick the exact one that matches
          today&rsquo;s lesson. Along the way we added videos on why cancer cells are called
          immortal, how fluorescent probes make a mutation visible, and how chemotherapy was born.
        </P>
        <Figure
          shots={[SHOTS.course, SHOTS.analytics]}
          caption="Part of the course on our channel (left) and channel analytics on 4 October 2026 (right)."
        />
        <P>
          As of 4 October 2026, the channel has 3,200 views, 56 subscribers, 241 likes and 35
          shares, with 150 views in the last week alone. The numbers are modest, but the people who
          come stay engaged: about one viewer in fourteen leaves a like.
        </P>
      </Section>

      <Section id="learned" title="What our audiences taught us">
        <P>
          We set out to teach. Looking back, each audience corrected us in a way we could not have
          figured out alone.
        </P>
        <Bullets
          items={[
            "The kindergarten showed us that excitement can hide failure. The children loved the marshmallow DNA and could not build it. Now we check whether an activity fits small hands, not only whether children enjoy it.",
            "Kazygurt showed us that children fill gaps with what they already know. Our health-themed extra cards turned a lesson about genetic testing into a lesson about junk food. The materials we put on the table are part of the message.",
            "Samgau and Auzhan showed us that misconceptions about genes are common even among students who study biology, and that a five-minute experiment makes an abstract enzyme real.",
            "The Model UN showed us that young people can see the social side of a diagnostic test (cost, data, access) as clearly as any expert, once they are given the space to argue it out.",
            "The library for the blind showed us how much of our teaching leaned on slides. Rebuilding it around touch gave us the bead strings and the felt book, two of our clearest tools for any audience.",
          ]}
        />
      </Section>

      <Section id="numbers" title="The season in numbers">
        <DataTable
          label="The season in numbers"
          head={["Measure", "Result"]}
          rows={[
            ["Direct participants", "More than 190, aged 4 to 28"],
            ["Countries", "9 (Summer Camp)"],
            ["Languages", "Kazakh, Russian, English"],
            [
              "Places visited",
              "A kindergarten, a rural school, two lyceums, NIS Karatau, the city library for the blind",
            ],
            ["Research reviews written by participants", "5"],
            ["Educational videos", "More than 20, with 3,200 channel views"],
            [
              "Materials handed over",
              "Felt books and an audiobook in three languages, to the city library for the blind",
            ],
          ]}
        />
      </Section>

      <Section id="reuse" title="Take it and use it">
        <P>
          Everything we made this season is free for other teams, teachers and parents to reuse: the
          presentations and lesson plans for each age group, our two kindergarten cartoons, the
          picture cards for Save the patient through the DNA path, the ten myth statements with
          answers, the one-page lab worksheet on how pH affects catalase, our book Behind the
          Statistics There Is a Person with its audiobook in three languages, the bead-string model,
          the page designs of our felt book, the Summer Camp programme and judging rubric, and the
          full YouTube course. If you run one of these sessions, we would love to hear what your
          audience taught you.
        </P>
      </Section>

      <Section id="references" title="References">
        <P>
          Zholdybayeva E, Iskakova A, Romanova A, Ramanculov E, Momynaliev K, et al. Pharmacogenetic
          research in Kazakhstan. Central Asian Journal of Global Health. 2013;2(2), published 24
          January 2014.{" "}
          <a href="https://doi.org/10.5195/cajgh.2013.87" className={link} style={{ color: C.ink }}>
            doi:10.5195/cajgh.2013.87
          </a>
        </P>
      </Section>

      <div className="mt-14 flex flex-wrap gap-3 md:mt-20">
        <PageLink to="/human-practices">Who we listened to</PageLink>
        <PageLink to="/description" tone="quiet">
          What the project is
        </PageLink>
      </div>
    </PageShell>
  );
}
