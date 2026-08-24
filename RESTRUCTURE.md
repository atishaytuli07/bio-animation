# Restructure decisions — the single spine

Recorded after a structured grill, because the site had accumulated five
visual directions without ever removing the previous one. **Before: 15
sections, 39,418px, 43.8 screens. Target: 9 sections, ~20 screens.**

The rule that produced these decisions: *this is an iGEM competition wiki.*
Judging scores content — Design, Engineering, Human Practices, Safety,
Attributions, Parts. A judge who cannot find them cannot award them.

## The nine decisions

1. **Judge-first wiki, story as the wrapper.** When a judge's needs and a
   first-time visitor's experience conflict, the judge wins. The story earns
   attention, then hands off to findable content.
2. **One opening, not two.** The poster hero and the two-patient scene merge
   into a single section: the mockup frame, then the helix recedes as two
   patients rise and diverge. This is the client's own "the opening visual
   should evolve into the story".
3. **The cold-open loader is cut.** It duplicated the thesis, delayed judges
   3.4s, and is technically unnecessary — the SVG placeholder already covers
   the WebGL load.
4. **Problem half → 5 beats.** Opening · Emma · Into the body (drug + zoom
   merged) · The gene (3D dive) · Accumulation (silence becomes its final
   frame). ChapterOpen is deleted outright: it restated the thesis twice.
5. **Solution half → 4 sections, ending on a callback.** Solution · Callback ·
   Evidence (Results + Statistics merged) · The Work. The closing scene
   deliberately reuses the opening's two-patient visual, but tested — both
   clear. Repetition with a changed ending is a rhyme, not duplication (this
   is the mentor spec's Chapter 9).
6. **Persistent top navigation**, and The Work expands from one accordion into
   a proper anchored area.
7. **Three type voices, each with one job.** Archivo Black owns *every*
   headline (not just the hero — that split is why the site reads as two
   websites). Instrument Sans for body and UI. Script survives only on diagram
   annotations. Newsreader serif is deleted.
8. **The labeled left rail is cut.** The top nav owns navigation; the thin
   progress bar keeps showing position. Frees the 256px left gutter.
9. **Ship a proof slice first** — merged opening + top nav + poster type on one
   downstream chapter — for sign-off before rolling the cuts through.

## The thesis is stated ONCE

It previously appeared four times before the story began (loader, opening,
and twice in ChapterOpen). It now appears only at the end of the merged
opening, after the visuals have made the point.

## The client's five asks, and where the build still contradicts them

Re-read the whole client thread in order and it is one request, repeated with
growing frustration — a *structural* request. Each time it arrived we answered
the *palette* question instead (light → seven-colour → warm → blush → poster).
That is why the site accumulated five visual directions: every restyle was a
wrong answer to a structural question, so the question came back.

| Her words | Status |
| --- | --- |
| "I don't want the website to open mainly with text" | **Contradicted.** `HeroSplash` is a badge + three-line headline + two buttons, helix beside it. |
| "The opening visual should evolve into the DPYD story" | **Contradicted.** Hero and opening are two separate scenes; nothing morphs. Decision 2 fixes this. |
| "Visuals transition through the story, not animated elements beside each section" | **Contradicted.** 13 sections each own a private visual driven by their own scroll hook. |
| "The 3D should be recognizable and meaningful, not abstract and oversized" | **Contradicted.** 40-unit helix, used twice, decorative at first use. |
| "More colorful — coral, pink, purple, soft blue, red/white still primary" | Met. Tokens already carry violet/coral/pink/blush. |

**The site is also branded wrong.** Zero occurrences of "ChemoGuard" in `src/`;
title, author and OG tags all say "DPYD Diagnostics". That is her team's name
missing from her team's wiki.

### Two grill decisions need amending

- **Decision 2** said merge the two openings. It must go further: the *visual*
  leads and the type arrives after it. A merged section that still opens on a
  poster headline fails her first sentence.
- **Decision 7** (Archivo Black owns every headline) is a *type* fix and stays,
  but it cannot be the answer to "feels too simple." Her "premium" means depth,
  composition and transitions — not a heavier font.

### The unpriced item

She asked directly whether €450 covers Wuxi-style transitioning storytelling,
and said it matters more to her than colour. It is the single largest piece of
work in the thread: one persistent stage that morphs across beats, replacing 13
per-section visuals. Answer it deliberately, not in passing.

## Proof slice — SHIPPED (decision 9)

Three changes, for client sign-off before the rest of the cuts roll through.

1. **`StoryOpening.tsx`** — one section, five beats, replacing `HeroSplash` +
   `ChapterOpening`. The strand alone with no words at all; ChemoGuard arrives
   beside it; the camera then *pulls out of the nucleus* (real `camZ` travel,
   44 → 92) as two patients resolve out of the cell field; the same dose runs
   into both; the thesis lands last. The 3D is no longer a crop of one turn at
   z=11.5 — the whole molecule is framed, so it reads as DNA before it reads as
   anything.
2. **`TopNav.tsx`** — persistent, present from the first frame and on every
   device, with "The Work" set apart as a button. The labelled left rail is
   deleted and its 256px gutter reclaimed on every section.
3. **`poster-head`** on The Solution — one headline voice, proving decision 7
   on a downstream chapter without touching the other twelve yet.

Also: the loader is gone, the duplicate "Precision starts in your DNA" at The
Discovery now reads "This is DPYD.", and the site is branded ChemoGuard rather
than the Lovable template's "DPYD Diagnostics".

Verified: typecheck, lint, production build; no console errors; no horizontal
overflow at 390px; reduced-motion still gets the SVG helix and never a blank
stage. Two real bugs found and fixed on the way — see MERGE-NOTES.md.

Not yet done (decisions 4, 5, 6): the chapter cuts, the merged Evidence
section, the callback ending, and expanding The Work. The page is still 14
sections; the cuts take it to 9.

## Still not real content

Unchanged by any of this, and now the critical path given decision 1:
placeholder statistics, empty Work panels, and an illustrative DNA flank.
