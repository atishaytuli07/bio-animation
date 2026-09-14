/**
 * Who this wiki belongs to, as iGEM identifies the team.
 *
 * From iGEM's own team record (api.igem.org/v1/teams/6493): name
 * "NIS-Kazakhstan", slug "nis-kazakhstan", 2026. The wiki is served at
 * https://2026.igem.wiki/nis-kazakhstan/ and built from the repository at
 * https://gitlab.igem.org/2026/nis-kazakhstan — the same `{year}/{slug}` shape
 * iGEM's official template builds its footer link from.
 *
 * The footer links to the repository because iGEM requires it on every page,
 * next to the licence: "Your wiki footer must include a visible link to your
 * team's GitLab repository." The build's base path is NOT read from here — CI
 * passes the project's own name, so a renamed repository cannot ship a site
 * whose links point at the old one.
 */
export const WIKI = {
  year: 2026,
  slug: "nis-kazakhstan",
  repo: "https://gitlab.igem.org/2026/nis-kazakhstan",
  /** Team-authored content, per iGEM's wiki requirements. */
  license: {
    name: "Creative Commons Attribution 4.0",
    url: "https://creativecommons.org/licenses/by/4.0/",
  },
} as const;
