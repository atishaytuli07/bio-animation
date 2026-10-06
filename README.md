# ChemoGuard — NIS-Kazakhstan, iGEM 2026

The team wiki for **ChemoGuard**, the iGEM 2026 project of NIS-Kazakhstan. It is
about DPYD gene variants, reduced DPD activity and fluoropyrimidine (5-FU)
chemotherapy toxicity — and why testing before the first dose matters.

Served at **https://2026.igem.wiki/nis-kazakhstan/** and built from
**https://gitlab.igem.org/2026/nis-kazakhstan**.

Team-authored content is licensed under
[Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/).
Where generative AI was used is declared on the wiki's Attributions page.

## What is in it

- **`/`** — the story: a scroll-driven explanation in nine beats, from the
  gene to a dose adjusted before treatment.
- **Documentation pages** — Description, Engineering, Human Practices, Safety,
  Team, Contribution and Attributions. Anything only the team can write is shown
  on the page as a visible "Needs the team" block rather than invented.

## Running it

```sh
bun install
bun run dev          # http://localhost:8080
bun run verify       # lint, types and build — must pass before a commit
bun run check        # browser checks; needs the dev server running
```

## Deploying

iGEM serves static files. The app renders on a server, so it is exported rather
than built with a plain `vite build`: `scripts/build-static.mjs` builds it, runs
it locally, crawls every page in the site map and writes static HTML under the
team's base path.

- **`.gitlab-ci.yml`** runs `scripts/ci-build.sh` on every push to `main` and
  publishes `public/`.
- **`bash scripts/test-ci.sh`** rehearses that job locally in the same `node:22`
  image and verifies what it publishes (needs Docker).
- **`node scripts/verify-static.mjs --base=nis-kazakhstan`** checks an export the
  way iGEM serves it: every page, every link and request inside the base path.

## Where things live

| Path | What |
|---|---|
| `src/routes/` | one file per page; `__root.tsx` is the document shell |
| `src/components/story/` | the page shell, header, footer, figures and the story's shared pieces |
| `src/components/story/site-map.ts` | every page, once — the nav, footer, export and checks all read it |
| `src/components/hero/`, `story2/`, `story3/` | the story's scenes |
| `src/components/hero/palette.ts` | colour and type — the site's design tokens |
| `src/lib/wiki.ts` | the team's iGEM identity: year, slug, repository, licence |
| `scripts/` | the static export, CI, and the verification checks |
| `CONTEXT.md` | why things are the way they are — read before changing anything |
