import { createFileRoute } from "@tanstack/react-router";

import { asset, C, L, R } from "@/components/hero/palette";
import { SECTIONS_OF } from "@/components/story/page-sections";
import { Awaiting, P, PageLink, PageShell, Section } from "@/components/story/PageShell";

// Team. Only the team can write this page, so it is built as an empty shape: a roster grid that renders
// whatever it is given, with visible placeholder cards so a missing entry cannot look like a finished page.
// Roles matter more than names. "Member" tells a judge nothing; "designed the assay" tells them who to ask.

const TITLE = "Team · ChemoGuard";
const DESCRIPTION =
  "The NIS Kazakhstan iGEM 2026 team behind ChemoGuard: students, advisors and supervisors, and who did what.";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
    ],
  }),
  component: Team,
});

// The team, photographed. Two group shots the team supplied, and they are what the page opens on: the hero
// shows them in turn, whole, because the point of them is finding faces. Each is served at two widths, so a
// phone downloads 60-80 kB rather than the full frame.
// The captions say only what the pictures show. Who is who belongs to the roster below, and only the team can
// write that.
// The two group photographs, full width behind the title, one after the other. The steps first: it is the one
// the team chose to open on.
const PHOTOS = [
  {
    file: "team-steps",
    alt: "The ChemoGuard team standing together in rows on the steps outside their school, all wearing white ChemoGuard T-shirts.",
    caption: "The ChemoGuard team on the school steps.",
  },
  {
    file: "team-hall",
    alt: "Team members standing in a line in the school entrance hall, in white ChemoGuard T-shirts, in front of a wall sign reading NIS Shymkent.",
    caption: "In the entrance hall, in front of the school's sign.",
  },
] as const;

// The team, as the team sent it: a name and the portrait each member uploaded to iGEM's server. `role` is the
// one line on what that person worked on; a card without one shows the name alone rather than an invented line.
type Member = { name: string; photo: string; role?: string };

const MEMBERS: Member[] = [
  { name: "Rayana Askarova", photo: "photo-5377676054396347437-y.avif" },
  { name: "Nazerke Karatay", photo: "photo-5377676054396347452-y.avif" },
  { name: "Adina Medetkhan", photo: "photo-5379927854210033018-y.avif" },
  { name: "Aidana Amankul", photo: "photo-5379927854210033027-y.avif" },
  { name: "Gia Bao Phan", photo: "photo-5379942435624001180-y.avif" },
];

/** The index rail; ids match the sections below. */
const SECTIONS = SECTIONS_OF["/team"];

function Team() {
  return (
    <PageShell
      title="Team"
      lede="ChemoGuard is built by students at Nazarbayev Intellectual Schools, Kazakhstan, for iGEM 2026. This page is who we are and what each of us worked on."
      photo={PHOTOS}
      sections={SECTIONS}
    >
      <Section id="students" title="The team">
        <div>
          <P>The students who built ChemoGuard.</P>
        </div>
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
          {MEMBERS.map((m) => (
            <li
              key={m.name}
              className="overflow-hidden"
              style={{
                background: "#fff",
                border: `2px solid ${C.ink}`,
                borderRadius: R.md,
                boxShadow: `3px 3px 0 ${C.ink}`,
              }}
            >
              <img
                src={asset(m.photo)}
                alt={`Portrait of ${m.name}`}
                width={960}
                height={1200}
                loading="lazy"
                decoding="async"
                className="block aspect-[4/5] h-auto w-full object-cover object-top"
                style={{ background: `${C.lavender}1a` }}
              />
              <div className="px-3 py-2.5 md:px-3.5 md:py-3">
                <p
                  className="text-[15px] font-bold leading-tight md:text-[16px]"
                  style={{ color: C.ink }}
                >
                  {m.name}
                </p>
                {m.role && (
                  <p
                    className="mt-1 text-[13px] leading-snug md:text-[14px]"
                    style={{ color: C.inkBody }}
                  >
                    {m.role}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-5">
          <Awaiting what="Needs the team: the roster">
            The rest of the team, each with their portrait, and one line for every member on what
            they worked on.
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
          practical help: the Attributions page has to draw that line, and it is easier to draw here
          first.
        </Awaiting>
      </Section>

      <Section id="who-did-what" title="Who did what">
        <P>
          A short breakdown by area (wet lab, modelling, human practices, design and wiki, outreach)
          with who led each. This is the page a judge cross-references against Attributions, so the
          two should agree.
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
        <PageLink to="/attributions">Attributions</PageLink>
        <PageLink to="/" tone="quiet">
          See the project
        </PageLink>
      </div>
      <p className={`mt-6 ${L.note}`} style={{ color: C.inkNote }}>
        Every panel above marked &ldquo;needs the team&rdquo; is written by NIS Kazakhstan
      </p>
    </PageShell>
  );
}
