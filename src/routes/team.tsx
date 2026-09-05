import { createFileRoute, Link } from "@tanstack/react-router";

import { C, L, R } from "@/components/hero/palette";
import { ART } from "@/components/story/PageHero";
import { Awaiting, P, PageShell, Section } from "@/components/story/PageShell";

/**
 * Team.
 *
 * The one page on this wiki whose content nobody but the team can supply — not
 * even in outline. So it is built as a SHAPE waiting for data rather than as
 * prose: a roster grid that renders whatever it is given, and placeholder
 * cards that make the missing entries obvious rather than invisible.
 *
 * The cards are deliberately drawn even while empty. An unfinished page must
 * not be able to pass for a finished one, and a Team page with no visible slots
 * looks like a page nobody started; a Team page showing eight empty slots looks
 * like a page waiting for eight photographs, which is what it is.
 *
 * ROLES ARE THE PART THAT MATTERS, and teams routinely waste them. "Member"
 * against nine names tells a judge nothing; "designed the assay", "ran the
 * outreach", "built the wiki" tells them who to ask about what — and it is
 * also the evidence base for the Attributions page, which iGEM checks.
 */

const TITLE = "Team — ChemoGuard";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: TITLE },
      {
        name: "description",
        content:
          "The NIS Kazakhstan iGEM 2026 team behind ChemoGuard — students, advisors and supervisors, and who did what.",
      },
    ],
  }),
  component: Team,
});

/**
 * Placeholder roster slots.
 *
 * A fixed count of empty cards, because the alternative — rendering nothing
 * until data exists — makes an unfinished page look finished. Replace this
 * array with the real roster and the grid below needs no other change.
 */
const SLOTS = Array.from({ length: 8 }, (_, i) => i);

/** The index rail; ids match the sections below. */
const SECTIONS = [
  { id: "students", label: "The team" },
  { id: "supervisors", label: "Supervisors and advisors" },
  { id: "who-did-what", label: "Who did what" },
  { id: "school", label: "About NIS" },
  { id: "contact", label: "Contact" },
];

function Team() {
  return (
    <PageShell
      title="Team"
      lede="ChemoGuard is built by students at Nazarbayev Intellectual Schools, Kazakhstan, for iGEM 2026. This page is who we are and what each of us worked on."
      art={ART.generic}
      sections={SECTIONS}
    >
      <Section id="students" title="The team">
        <P>
          Each card takes a photograph, a name, and one line saying what that person actually worked
          on. The line is the useful part: it tells a judge who to ask about the assay, the
          modelling or the outreach, and it is where the Attributions page gets its evidence.
        </P>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
          {SLOTS.map((i) => (
            <div
              key={i}
              className="overflow-hidden"
              style={{
                background: C.paper,
                border: `2px dashed ${C.ink}2e`,
                borderRadius: R.md,
              }}
            >
              {/*
                A 4:5 well where the photograph goes, sized now so that adding
                the images later cannot reflow the page around them.
              */}
              <div
                className="grid aspect-[4/5] place-items-center"
                style={{ background: `${C.lavender}1a` }}
              >
                <span className={L.note} style={{ color: C.inkNote, opacity: 0.7 }}>
                  photo
                </span>
              </div>
              <div className="px-3 py-3">
                <div
                  className="h-[11px] w-3/4 rounded-full"
                  style={{ background: `${C.ink}1f` }}
                  aria-hidden="true"
                />
                <div
                  className="mt-2 h-[9px] w-full rounded-full"
                  style={{ background: `${C.ink}14` }}
                  aria-hidden="true"
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5">
          <Awaiting what="Needs the team: the roster">
            For each member: name as it should appear, a photograph, and one line on what they
            worked on. Say how many members there are — the eight slots above are a placeholder, not
            a count.
          </Awaiting>
        </div>
      </Section>

      <Section id="supervisors" title="Supervisors and advisors">
        <P>
          Principal investigators, teachers, and anyone outside the school who advised the project.
          iGEM expects these named, and it expects the distinction between someone who supervised
          the work and someone who did it.
        </P>
        <Awaiting what="Needs the team: PIs, instructors and advisors">
          Names, roles and affiliations. Note which advisors gave scientific guidance and which gave
          practical help — the Attributions page has to draw that line, and it is easier to draw
          here first.
        </Awaiting>
      </Section>

      <Section id="who-did-what" title="Who did what">
        <P>
          A short breakdown by area — wet lab, modelling, human practices, design and wiki, outreach
          — with who led each. This is the page a judge cross-references against Attributions, so
          the two should agree.
        </P>
        <Awaiting what="Needs the team: responsibilities by area" />
      </Section>

      <Section id="school" title="About NIS">
        <P>
          A short paragraph on Nazarbayev Intellectual Schools and how this team came together: how
          many students, how they were selected or volunteered, and how the work fitted alongside
          school. Judges read this to understand the conditions the project was done under, which is
          context a high-school team should not leave out.
        </P>
        <Awaiting what="Needs the team: the school and how the team formed" />
      </Section>

      <Section id="contact" title="Contact">
        <P>
          A team email address and any public accounts. One reachable address is enough; a broken
          one is worse than none.
        </P>
        <Awaiting what="Needs the team: how to reach us" />
      </Section>

      <div className="mt-14 flex flex-wrap gap-3 md:mt-20">
        <Link
          to="/attributions"
          className="inline-block px-6 py-3 text-[15px] font-bold"
          style={{
            background: C.redDeep,
            color: "#fff",
            border: `2.5px solid ${C.ink}`,
            borderRadius: R.sm,
            boxShadow: `4px 4px 0 ${C.ink}`,
          }}
        >
          Attributions
        </Link>
        <Link
          to="/new"
          className="inline-block px-6 py-3 text-[15px] font-bold"
          style={{
            background: C.paper,
            color: C.ink,
            border: `2.5px solid ${C.ink}`,
            borderRadius: R.sm,
            boxShadow: `4px 4px 0 ${C.ink}`,
          }}
        >
          See the project
        </Link>
      </div>
      <p className={`mt-6 ${L.note}`} style={{ color: C.inkNote }}>
        Every panel above marked &ldquo;needs the team&rdquo; is written by NIS Kazakhstan
      </p>
    </PageShell>
  );
}
