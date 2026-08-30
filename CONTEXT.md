# ChemoGuard — project context

Working reference for the iGEM 2026 wiki, team **NIS Kazakhstan**, project
**ChemoGuard**. Written so that someone picking this up cold — or the same
person three weeks later — can see what the site is arguing, how it is built,
and what is still missing.

**[Standing rules](#standing-rules)** — what is already decided, and what the
client has already rejected. Read this first; most of it was learned by getting
it wrong.

**[Part 1 · The main page](#part-1--the-main-page)** — the scroll story, end to
end: the argument, the structure, every beat, and the engine underneath.

**[Part 2 · The side pages](#part-2--the-side-pages)** — the documentation
wiki: the site map, the page system, and what each page is waiting for.

Then: **[Assets](#assets)** · **[What is blocked](#what-is-blocked-and-on-whom)**
· **[Future work](#future-work)** · **[How to work on this](#how-to-work-on-this)**
· **[iGEM constraints](#igem-constraints)**.

Everything here was read out of the running site, not from memory. Where a
number appears — a boundary, a beat window, a contrast ratio, a frame rate — it
was measured, and the harness that measured it is described at the end.

**`PRODUCTION-BRIEF.md` sits beside this one and is still worth keeping.** It
holds the client's requirements in *her own words*, quoted rather than
paraphrased — what she rejected and why, in the wording she used. When a
question comes down to what she actually asked for, that is the file to open.
This document is the current state; that one is the record of how it was
agreed.

---

# Standing rules

Things already decided, already argued, or already rejected. **Read this before
proposing anything** — most of it was learned by getting it wrong first.

## The client rejected these. Do not bring them back.

| Rejected | Why |
|---|---|
| **three.js / WebGL** | Her words: *"we will not use threejs"*. The old 3D helix was "unintractive and not ever looking good". All illustration is now code-drawn SVG. |
| **Realistic / photographic people** | She asked for illustrated, cartoon-style characters. "Real characters real feel" means warm and human, not photoreal. |
| **Near-black sections** | Rejected outright. The emotional arc is carried by **saturation and hue, never by darkness**. When the drug accumulates, the room *warms*; it does not dim. |
| **A preloader morphing 5-FU into DNA** | Visually clever, scientifically misleading. Dropped on those grounds. |
| **Walls of large text** | *"communicated through illustrations and visual transitions, not primarily through large text"*. |
| **The old poster/serif direction** | Archivo Black + Newsreader, near-black chapters. Deleted, along with three.js — 3.2 MB → 1.1 MB. |

## Things she asked to keep

- **The purple.** She likes it. It was lightened one shade at her request
  (`#8B6BD1` → `#A084DD`), and `lavenderDeep` moved with it. Do not remove it.
- **The purple → pink transition.** She named it as working. It is taken in
  four steps rather than two.
- **The accumulation idea** and **the interactive control** — both her
  favourites. Keep them; refine how they read.
- **"Follow the gene"** as the homepage's organising idea.

## Rules that came out of mistakes

1. **Never invent science.** A fabricated flanking sequence shipped once and
   had to be removed. What replaced it is entailed by the variant's own name:
   `c.1905+1G>A` sits at intron 14 position +1, so the canonical GT donor reads
   AT. Every glyph is verifiable. See the note at the top of `Sequence.tsx`.
2. **Never overclaim.** "One letter *decides* your dose" became "*can change*".
   "The enzyme is never built" became "less is made". Variants **reduce**
   activity, they do not abolish it.
3. **A `range` where a `band` was meant** — a range reaches 1 and stays there,
   so the element never leaves. This exact bug appeared **twice** in
   `Why.tsx`. If something is still on screen long after its moment, check this
   first.
4. **Chapter names must not repeat the headline beneath them.** "03 · LOOK
   CLOSER" above "Look closer." was the client's own complaint; renaming the
   label into the rail kept the redundancy until the chapter became "Inside the
   body".
5. **One kind of thing, one spec.** Audits found four corner radii, three
   specs for one small label, three ink alphas, and two loose hex values. All
   now named in `palette.ts`.
6. **No control that does nothing.** Five nav buttons and both hero CTAs were
   dead. Audit for this after any structural change.

## Reference wikis

Studied for what "good" looks like in 2026: **KCIS-Xiugang-Taipei**,
**Wuxi-DSAS**, **Fudan / GlycoGarden**, **HeroYeast**. What they have that
mattered: a composed hero on every page, a section index that tracks scroll, a
real footer, and structured content blocks rather than prose. What they do
*not* have that we do: one continuous scroll story with a shared ground.

The base-pair colour convention came from GlycoGarden's SNFG-glyph insight —
colour that carries meaning rather than decoration.

## Commercial context

- **€450 agreed** for the work as originally scoped.
- Adina asked whether the documentation pages are included in that. **This is
  unresolved.** The page shell, Description and Engineering were built after
  Atishay said to proceed; Human Practices, Safety and Team are the same class
  of work.
- She has said most content is already prepared and can start arriving now.

---

# Part 1 — The main page

Route `/new`. `/` redirects here. About **16.7 screens** of scroll.

## The argument

The client's own spine, in eight beats. Every one is on screen:

```
DNA → DPYD → the variant → DPD activity → same treatment, two people
    → different drug processing → accumulation / toxicity risk
    → why testing matters
```

The governing idea is **scroll-as-microscope**: the reader's own scrolling
magnifies. The camera goes **in → out → back in** — down to a single letter,
out to two people, then back inside one of them. That shape is deliberate and
was arrived at by removing a version that went in → out → out, which repeated
the same A/B comparison twice.

## Structure

Three DOM sections, five named chapters. The rail names chapters; a chapter
boundary is not always a section boundary.

| Chapter | Page progress | Section | Height |
|---|---|---|---|
| 01 · The gene | 0.000 | `sec0` in `new.tsx` | 420vh |
| 02 · The enzyme | 0.203 | `two-people` | 580vh |
| 03 · Two people | 0.276 | (same section) | |
| 04 · Inside the body | 0.509 | `why` | 860vh |
| 05 · Before the first dose | 0.840 | (same section, after the turn) | |

Sections 2 and 3 carry `marginTop: -100vh` so the scene before them is still
painted while the next rises into frame.

**These numbers are measured, not chosen.** Change any section height and they
all move. Re-measure before retuning anything that references them (the ground
keyframes, the world's density schedule, the handoffs, the chapter thresholds).

## Beat by beat

### Scene 1 — the descent (`src/routes/new.tsx`)

Local progress `p`, 0→1 across 420vh.

| Beat | Window | What happens |
|---|---|---|
| `heroOut` | 0.06 → 0.20 | the hero copy leaves |
| `merge` | 0.08 → 0.44 | the cream/purple field grows to full screen |
| `zoom` | 0.12 → 0.66 | the helix magnifies, centred on the **variant's live position** |
| `followIn` | 0.16–0.24, out 0.30–0.36 | "One gene. One letter." |
| `focus` | 0.44 → 0.72 | the variant rung isolates |
| `flatten` | 0.66 → 0.80 | the strand's radius collapses |
| `assemble` | 0.70 → 0.88 | letters arrive **outward from the variant** |
| `flip` | 0.86 → 0.94 | G becomes A |
| `closing` | 0.90 → 0.98 | "About three billion letters. / This one can change your dose." |
| `handoff` | page 0.196 → 0.231 | dissolves into scene 2 |

Scale annotations during the descent: *your genome · about three billion
letters* → *chromosome 1 · 1p21.3* → *DPYD · builds the enzyme that clears the
drug*. Each is fully retired before the next arrives — overlapping them stacked
two labels at the same coordinates.

**The helix is interactive.** Drag rotates it 1:1 with no decay while held;
hovering a rung reveals its base-pair letters. `DRAG_SENS 0.012`,
`BASE_TILT 9`, `MAX_ZOOM 2.9`.

### Scene 2 — the enzyme, then two people (`story2/TwoPeople.tsx`)

Runs in two acts on one progress track. `pp = range(p, 0.24, 1)` remaps the
remainder so the two-patient beat keeps its original shape and simply starts
later.

**Act one — the bridge** (`bridge` 0.02–0.09, out 0.20–0.27)

The letter decides how much enzyme the body builds: five slots, two filled,
three dashed. This is the client's missing link, placed where she placed it —
after the variant, before the patients. Copy: *"A DPYD variant can reduce DPD
activity — limiting the body's ability to clear 5-FU."* (her wording, near
verbatim).

**Act two — two people** (on `pp`)

| Beat | Window | What happens |
|---|---|---|
| `enter` | eased 0.01 → 0.11 | figures, stands and bags arrive |
| `title` | 0.12–0.20, out 0.60–0.68 | "The same treatment." |
| `flow` | 0.20–0.26, out 0.88–0.94 | the dose travels down both lines |
| `uptake` | 0.24 → 0.50 | **both fill identically** — the hold is the point |
| `clearA` / `buildB` | 0.54 → 0.74 / 0.80 | she clears, he accumulates |
| `alarm` | 0.60 → 0.82 | his fill goes red |
| `outcome` | 0.80 → 0.90 | "…doesn't mean the same outcome." |
| `handoff` | page 0.489 → 0.526 | dissolves into scene 3 |

Both IV bags stay coral throughout. **The drug never differs — only the body
does** — so tinting one bag would tell the wrong story.

The patients **breathe** (always) and **react** (as load climbs, the figure
settles lower and tilts). Verified at page 0.66: A at `translateY(-0.47)`
unrotated, B at `translateY(5.9)` rotated 1.1°.

### Scene 3 — inside the body, and the turn (`story3/Why.tsx`)

**One scene, two acts, 860vh.** It was two sections that crossfaded; they
showed the same picture, so the dissolve stacked two figures and two headlines
through each other. Now the picture never restarts — its **state** changes.

| Beat | Window | What happens |
|---|---|---|
| `enter` | eased 0.01 → 0.06 | figure + vessel |
| `lineA` | 0.03–0.09, out 0.19–0.25 | "Look closer." |
| `flow` | 0.10–0.16, out 0.97–0.995 | the drug arrives |
| `drugLabel` | 0.13–0.19, out 0.28–0.33 | **5-FU named before anything accumulates** |
| `gap` | 0.24 → 0.32 | the dashed empty enzyme site |
| `link` | 0.30 → 0.40 | the red A drops a hairline onto it |
| `variantLabel` | 0.32–0.38, out 0.44–0.49 | "DPYD variant / c.1905+1G>A" |
| `build` / `alarm` | 0.38 → 0.56 / 0.58 | the pile grows and goes red |
| `enzymeLabel` | 0.46–0.52, out 0.57–0.62 | "DPD enzyme / less is made here" |
| `lineB` | 0.56–0.62, out 0.67–0.72 | "So the drug stays." |
| **`lineC`** | **0.68–0.74, out 0.80–0.85** | **"What if we knew first?" — the turn** |
| `result` | 0.72–0.78 | the result card; the in-vessel A hands over to it |
| `trim` | 0.76 → 0.85 | nine dose molecules become four |
| `drain` | 0.79 → 0.89 | **the pile drains away** |
| `heal` | 0.81 → 0.90 | the dashed enzyme fills solid green |
| `lineD` | 0.91 → 0.96 | "A dose that fits." |

The turn is the payoff and it only works because it is the **same pile** the
reader watched build. The hold control retires at the turn — once the result is
in, the dose is not the reader's to give.

**One molecule in four is cleared even before the turn.** DPYD variants reduce
activity, they do not abolish it, so the animation itself encodes "reduced, not
absent" rather than relying on a caption to walk it back.

## Continuity — how the site stopped reading as slides

The client's main note was that it felt like separate full-screen scenes. Four
things fixed it:

1. **One shared ground** (`story/Ground.tsx`) — a single fixed layer behind
   everything, interpolating through keyframes on whole-page progress. No scene
   paints its own rectangle, so no scene has an edge.
   Cream → lavender → plum → rose → **back to cream**. The page starts on
   `#FBF3E7` and ends on `#FBF3E7` — the same token, so the ends cannot drift.
2. **One travelling world** (`story/World.tsx`) — 16 objects and 26 motes
   declared once, drifting upward continuously. Each scene used to scatter its
   own set, which is why objects vanished at every boundary.
3. **Dissolves, not cuts** — each scene fades out only after its payoff line
   has landed, while the next rises into the same frame.
4. **Light on the subject, not the type** — the ground's bloom sits at
   `50% 64%`, and the top of the frame falls away. It used to sit at `50% 0%`,
   directly behind every headline, which is why cream type measured 2.84:1.

Measured continuity: **largest ground step is 16.5/255 per 1% of page**, and
every step above 14 falls inside a sustained ramp. No isolated jump anywhere.

## Colour rules (non-negotiable)

A colour means the same thing on every screen.

| Token | Hex | Means |
|---|---|---|
| `red` | `#E03A3E` | **the variant, and only the variant** (plus the brand mark) |
| `redDeep` | `#C42A2E` | button surfaces — clears AA where `red` does not |
| `coral` | `#F0653C` | the drug |
| `green` | `#3FA877` | the enzyme / a validated result |
| `lavender` | `#A084DD` | genetics |
| `lavenderDeep` | `#7355B4` | genetics, deep |
| `pink` | `#F2839C` | body |
| `blue` | `#4E92CF` | ambient only |
| `paper` | `#FBF3E7` | the ground, and type on the field |
| `ink` | `#241C2E` | every outline, every word on cream |
| `redOnField` / `greenOnField` | `#FFC9C4` / `#9BE8C4` | on-field tints of red and green |
| `inkBody` / `inkNote` | `ink` at `c4` / `a0` | body copy / a note under a title |

**Type follows the ground, not the scene: paper on the field, ink on cream.**
That rule is why the site reads in one voice. Measured on painted pixels:
5.46, 4.44, 3.57, 5.60, 13.50 — all above the 3:1 floor for large text.

`redOnField` and `greenOnField` exist because the mid-tones are built for cream
and go muddy on purple. Three components had hand-written hex before they were
named.

## The engine

- `useSmoothProgress` — spring-smoothed section progress, IntersectionObserver
  gated, **exactly one `getBoundingClientRect` per frame**, shared rAF ticker.
- `usePageProgress` — whole-page progress, quantised to 240 steps.
- `range` / `band` / `beat` / `easeOut` — beat helpers. **`beat` gives copy
  directional motion: in from below, out upward.** Copy used to fade out along
  the path it arrived on, which reads as un-arriving.
- Per-frame DOM writes go through refs, never React state.
- Opacity is quantised to 20 steps to cut repaints.
- **Everything moves by `transform`, never by `top`.** Animating `top` on the
  world's 42 elements lays out the whole layer every frame: it measured 43fps
  and 106 layout shifts before the fix.

**Performance:** 53–57 fps on the production build served statically, 9–14
layout shifts, 1.0 MB total, 397 kB JS.

---

# Part 2 — The side pages

The documentation wiki. The client's brief for these: *"professionally
designed, responsive, consistent with the same visual identity, and properly
integrated"* — not the homepage's storytelling, but they must look like the
same site, because they are judged beside 2026 wikis whose every page opens
with a composed hero.

## The site map is the single source of truth

`src/components/story/site-map.ts`:

```ts
{ label: "The story",        to: "/new",             ready: true  }
{ label: "Description",      to: "/description",     ready: true  }
{ label: "Engineering",      to: "/engineering",     ready: true  }
{ label: "Human Practices",  to: "/human-practices", ready: false }
{ label: "Safety",           to: "/safety",          ready: false }
{ label: "Team",             to: "/team",            ready: false }
{ label: "Attributions",     to: "/attributions",    ready: true  }
```

**Flipping `ready: true` is the entire wiring.** It lights up: the story page's
desktop nav, its mobile menu, every content page's nav and menu, the footer,
the hero's second CTA, and the static export's route list. There is no second
list to keep in step — that was a real bug twice (the nav, then the exporter).

A page that is not `ready` renders as dimmed text with no link and, on mobile,
an explicit "soon". Never a control that silently does nothing.

## The page system

**`PageShell`** — sticky header, hero, section index, content column, footer.
**`PageHero`** — badge, display title, two-rule treatment, lede panel, and an
illustration composed from the story's own `Cell` / `Molecule` / `Enzyme`. Art
arrangements live in `ART` in `PageHero.tsx`; a new page costs a config object.
**`Section` / `P` / `Awaiting`** — the content primitives.
**`Figure`** + `diagrams.tsx` — figures that reuse the story's diagrams.

### `Awaiting` — the rule that keeps this honest

A block only the team can write renders as a **visible dashed panel**, not a
TODO comment. An unfinished page must not be able to pass for a finished one on
the deployed site — to a judge or to us.

### Motion discipline

Figures reveal **once**, on entry, then hold. `useSeen` is a one-way latch for
exactly that reason: motion that replays every time you pass it is the single
most recognisable tell of a generated site. The only other motion on a content
page is a barely perceptible drift in the hero illustration. Everything else is
still. `prefers-reduced-motion` turns even the reveal off.

## Pages as they stand

| Page | State | Notes |
|---|---|---|
| `/new` | **Built** | the story, all eight beats |
| `/description` | **Built, awaiting content** | 3 figures; method, citations and lab work are `Awaiting` |
| `/engineering` | **Built, awaiting content** | Design/Build/Test/Learn laid out; every phase is `Awaiting` |
| `/attributions` | **Built, awaiting content** | AI use declared; team/lab/PI blocks visible and empty |
| `/human-practices` | **Not started** | |
| `/safety` | **Not started** | |
| `/team` | **Not started** | |

### Description

Sections: the problem · what a single letter does · why testing first matters ·
what we are building · references.

Three figures, drawn from the story's vocabulary:
1. **the splice donor** — `exon 14 │ A T │ intron 14` with the struck-through G
2. **the causal chain** — variant → less DPD → slower clearance → build-up →
   risk, as a vertical flow with a rail
3. **the two doses** — the same vessel under a standard and a matched dose

Figure 1 **replaces** the paragraph that described it. That is the point: a
reader who has not scrolled the animation gets the same picture at a glance.

### Engineering

iGEM judges this against the engineering cycle *and* against whether the team
went round it more than once. A single clean pass scores less than two passes
where the first failed and the team said why. The page is structured for that:
four phases, each with the question it has to answer, each `Awaiting`.

---

# Assets

Everything in `public/`, and where it came from.

| File | What it is |
|---|---|
| `patient-a.webp` `patient-b.webp` | The two illustrated patients. **AI-generated**, then keyed, defringed and colour-corrected. Declared on `/attributions`. 401×1418 and 415×1415. |
| `logo.webp` | The supplied mark. **Transparent wherever it should be white** — the reader's screen and the whole inside of the ring are alpha 0, so on purple the page showed through and the mark lost its structure. |
| `logo-mark.webp` | `logo.webp` composited onto white and cropped to its bounds. **This is the one to use.** It sits in a white chip so it holds on any ground. |
| `logo-full.webp` | The larger supplied lockup. Unused. |
| `favicon.svg` `favicon.ico` | Generated by `node scripts/make-favicon.mjs`. |

**Positioning anything on a patient plate must be measured, not estimated.**
The lens on the forearm was placed by eye twice and landed on his hip both
times. Reading the alpha channel row by row settles it: at y=622 the runs are
18–65, 91–340, 349–398, so 91–340 is torso and the near arm is 349–398. Note
also that plate coordinates are ~0.29 screen px per unit — a "46px" circle
rendered at 13px.

---

# What is blocked, and on whom

## Blocked on Adina / the team

1. **The method.** What ChemoGuard is, what sample the test takes, what it
   measures, what it reports, who uses it. **Nothing on the wiki describes it,
   deliberately** — inventing it is a failure this project has already had to
   undo once (a fabricated flanking sequence, since removed).
2. **Citations.** Especially the guidance for pre-treatment DPYD testing — the
   claim the whole project rests on. Also the "about three billion letters"
   figure and the mechanism wording.
3. **Lab content** — parts, protocols, results, what is new versus reused.
4. **Attributions** — who did the wet lab, who supervised, PIs, advisors,
   external help, Human Practices contacts.
5. **The typeface.** Currently Instrument Sans, self-hosted. Swapping is a
   change of import and family name.
6. **The three Special Awards** — Gold in 2026 is decided by them.
7. **Team photos and bios** for `/team`.

## Blocked on Atishay

- **Deploy.** There is no CI in the repo; pushing to GitHub publishes nothing.
  `bun run build:static` produces `dist-static/`, a plain folder to upload.
- **The team slug**, for `--base=<slug>`.
- **Whether the remaining three pages are in scope** for the €450.

---

# Future work

**Next, in order of value:**

1. **A cycle diagram for Engineering** — four stacked panels is the weakest
   page; the Design→Build→Test→Learn loop wants to be drawn as a loop.
2. **Human Practices, Safety, Team** — each is a route file plus an `ART`
   entry now.
3. **Drop content in** as it arrives; each `Awaiting` marks exactly what fits.
4. **A real deploy**, so there is a stable link.

**Known gaps, honestly:**

- The client's third handoff — *"zoom into the bloodstream"* — is a **callout
  with a lens and a drip line, not a continuous camera zoom.** It solves the
  "looks like his pocket" problem but is not the morph she described.
- `"The same treatment."` measures **3.57:1**. It passes AA for large text but
  it is the floor. Raising it means either deepening the purple (against her
  "one shade lighter" request) or inverting that headline (reintroducing the
  two-voices problem). Left passing rather than trading off something she asked
  for.
- The three.js dependency is gone, but `/` is still a redirect to `/new`. When
  the story is final it should move to `/` and the redirect should go.

---

# How to work on this

```bash
bun run dev            # localhost:8080
bun run verify         # lint + types + build, under `set -euo pipefail`
bun run build:static   # dist-static/ — what iGEM gets
bun run build:static -- --base=chemoguard   # under /chemoguard/
bun run audit          # the checks below — needs `bun run dev` running
```

**`bun run verify` exists because of a real failure.** The check being run was
`bun run build | grep "✓ built" | head -1 && git commit` — a pipeline takes its
exit status from the last command, and `head` always succeeds. The build could
fail, grep could match nothing, and the commit would run anyway. It did, and a
broken stylesheet shipped. Never chain a check through a pipe again.

## The static export

iGEM serves static files from GitLab Pages. TanStack Start's own prerenderer
**cannot** be used here: it boots a preview server that imports
`dist/server/server.js`, and this pipeline writes `.output/server/` instead. The
preview server fails to start, every prerender fetch returns 500, and the build
dies. That same missing file is why `vite preview` is broken.

`scripts/build-static.mjs` sidesteps it: builds with nitro's `node-server`
preset, runs that real server, crawls it over HTTP. It reads its route list
from the site map.

Base-path support needs **three** things, each fixing a different failure:
`vite`'s `base` (URLs inside bundled CSS), the router's `basepath` (without it
the first client navigation throws "Invariant failed"), and `asset()` (a
literal `src="/logo.webp"` gets patched in SSR HTML but React puts it straight
back on hydration).

## Verification harnesses

`scripts/audit.mjs`, run with the dev server up:

```bash
bun run dev                          # in another shell
bun run audit                        # every check, every page
node scripts/audit.mjs contrast      # one check
node scripts/audit.mjs --url=http://localhost:8190   # against the static build
```

Checks, and what each one caught that looking did not:

| Check | Found |
|---|---|
| `sweep` | overflow, clipped copy and console errors at 390 / 768 / 1440 / 1920 — caught "Safety" and "Team" clipped at tablet width |
| `contrast` | **painted-pixel** ratios — the computed-style method reports 1.00:1 on a gradient and passed a hero nobody could read |
| `controls` | buttons and links that do nothing — found the site's **main CTA had no handler** |
| `collisions` | overlapping text across 60 scroll positions |
| `system` | type and colour inventory — found four corner radii and three specs for one small label |
| `copy` | banned vocabulary, "not just X but Y", em-dash rate, sentence-length spread, repeated openers |

Exits non-zero on failure, so it can gate a commit. `system` and `copy` print
inventories rather than pass/fail — read them, do not skim them.

These lived in a temp directory for most of the build, which meant every fresh
session either rebuilt them or skipped the check. That is why they are in the
repo now.

## Credentials

This repo uses the **`atishaytuli07`** GitHub identity via the `github-acc1`
SSH host alias, set **repo-locally**. Global git config is untouched
(`sunil-dsb`). Do not set these globally.

---

# iGEM constraints

- **Freeze: 21 October 2026, 15:00 UTC. No extensions.**
- **No external CDNs.** Every asset served from the team's own wiki. The
  Google Fonts link was a live violation and was already failing —
  `ERR_CONNECTION_TIMED_OUT` in a headless run.
- **Nothing unverifiable.** A judge checking a rendered sequence against the
  reference genome is realistic. Everything not yet cited is marked.
- **AI use must be declared.** `/attributions` names it: the character plates
  are AI-generated, and the code, interaction design and copy drafts came from
  an assisted workflow. It also states what the model did *not* do — no
  scientific claim on this wiki was authored by it.
- Best Wiki is largely a **content** criterion. The design is not the risk; the
  empty pages are.
