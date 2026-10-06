import { createFileRoute } from "@tanstack/react-router";

import { asset, C, L, R } from "@/components/hero/palette";
import { Awaiting, P, PageLink, PageShell, Section } from "@/components/story/PageShell";

// Team. Only the team can write this page, so it is built as an empty shape: a roster grid that renders
// whatever it is given, with visible placeholder cards so a missing entry cannot look like a finished page.
// Roles matter more than names. "Member" tells a judge nothing; "designed the assay" tells them who to ask.

const TITLE = "Team — ChemoGuard";
const DESCRIPTION =
  "The NIS Kazakhstan iGEM 2026 team behind ChemoGuard — students, advisors and supervisors, and who did what.";

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

// The team, photographed. Two group shots the team supplied, shown large because the point of them is finding
// faces. Each is served at two widths, so a phone downloads 60-80 kB rather than the full frame, and both carry
// their pixel size so the page does not jump when they arrive.
// The captions say only what the pictures show. Who is who belongs to the roster below, and only the team can
// write that.
const PHOTOS = [
  {
    file: "team-steps",
    alt: "The team standing together in three rows on the steps outside their school, all wearing white ChemoGuard T-shirts.",
    caption: "The ChemoGuard team on the school steps.",
  },
  {
    file: "team-hall",
    alt: "Team members standing in a line in the school entrance hall, in white ChemoGuard T-shirts, in front of a wall sign reading NIS Shymkent.",
    caption: "In the entrance hall, in front of the school's sign.",
  },
] as const;

function TeamPhoto({ photo, lead }: { photo: (typeof PHOTOS)[number]; lead: boolean }) {
  return (
    <figure className="m-0">
      <img
        src={asset(`${photo.file}-1280.webp`)}
        srcSet={`${asset(`${photo.file}-800.webp`)} 800w, ${asset(`${photo.file}-1280.webp`)} 1280w`}
        sizes="(min-width: 1024px) 768px, 100vw"
        width={1280}
        height={960}
        alt={photo.alt}
        // the first is what the section opens on; the second is below it and can wait
        loading={lead ? "eager" : "lazy"}
        decoding="async"
        className="block h-auto w-full"
        style={{ border: `2.5px solid ${C.ink}`, borderRadius: R.md }}
      />
      <figcaption className="mt-2 text-[14px] leading-relaxed" style={{ color: C.inkNote }}>
        {photo.caption}
      </figcaption>
    </figure>
  );
}

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
      piece="crew"
      sections={SECTIONS}
    >
      <Section id="students" title="The team">
        <div className="flex flex-col gap-8">
          {PHOTOS.map((photo, i) => (
            <TeamPhoto key={photo.file} photo={photo} lead={i === 0} />
          ))}
        </div>

        <div className="mt-10">
          <P>
            Each card below takes a name and one line saying what that person actually worked on.
            The line is the useful part: it tells a judge who to ask about the assay, the modelling
            or the outreach, and it is where the Attributions page gets its evidence.
          </P>
        </div>
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
              {/* A 4:5 slot for the photo, sized now so adding the images later cannot reflow the page. */}
              <div
                className="grid aspect-[4/5] place-items-center"
                style={{ background: `${C.lavender}1a` }}
              >
                {/* inkBody, and no second dimming: the note colour at 70% opacity measured 2.63:1 here against the
                    4.5:1 an 11px label is held to. A placeholder still has to be readable to say it is one. */}
                <span className={L.note} style={{ color: C.inkBody }}>
                  portrait
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
            The group photographs are in. Still needed for each member: their name as it should
            appear, one line on what they worked on, and a portrait if the team wants individual
            cards. Say how many members there are — the eight slots above are a placeholder, not a
            count.
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
