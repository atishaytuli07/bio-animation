# DPYD Diagnostics — merged story site

This project combines the two Lovable prototypes:

- **pharmaco-story-path** (`../DPYD Diagnostics Navigator`) — the six-chapter
  storyline. Used here as the base, because it is the only one of the
  prototypes with a complete arc through to a closing beat.
- **gene-story** (`../lovable-project-2ec7cd80`) — the WebGL DNA hero. Ported in
  as the new opening chapter.

NOTE (2026-08-08): the three original template folders were removed from
`bio/` — only this merged project remains. There are no reference copies left.

## What changed

**A DNA hero now opens the site.** `src/components/story/ChapterHero.tsx` is a
new chapter zero: a three.js double helix the camera falls into over ~4
viewports, ending on the `c.1905+1G>A` variant igniting in red. That hands
straight into the original opening line, "One dose doesn't fit everyone."

**One scroll engine, not two.** The gene-story hero was driven by GSAP
ScrollTrigger + Lenis; the storyline is driven by the spring integrator in
`src/hooks/use-scroll-progress.ts`. Rather than shipping both, the 3D scene was
re-pointed at the existing spring. GSAP and Lenis are **not** dependencies here.
Per-frame 3D values travel through the mutable `src/three/state.ts` object —
never React state.

**Act One is bright.** It previously played white-on-near-black and graded to
paper at the solution. The page is now paper throughout: the `WHITE()` helper in
`ActOne.tsx` became `TONE()` (a dilution of `--ink`), and the same substitution
was made across the shared SVG primitives in `visuals.tsx`. Drama comes from
colour rather than darkness — one deep-plum beat survives at `ChapterSilence`,
which is the emotional low point of the story, not the opening.

**Palette.** The gene-story accents (`--signal`, `--coral`, `--violet`,
`--cyan`, `--blush`) were added to `src/styles.css` and `--alarm` now aliases
`--signal`, so the whole story alarms in one colour.

## Notes for whoever picks this up

- The hero is capability-gated: reduced-motion, no WebGL, or fewer than 4 cores
  gets the static SVG helix instead. Depth of field is desktop-only (≥1024px).
- The canvas mounts and unmounts on a **symmetric** viewport check, so it comes
  back when you scroll up. The gene-story original had a one-way flag and lost
  the helix permanently on reverse — that bug was not carried over.
- `SceneHost` is memoised. The scroll spring re-renders the hero every frame and
  the canvas must not re-reconcile with it.
- The aurora wash is CSS keyframes on `transform`, not per-frame JS.
- The helix eases to `VARIANT_FACING_ANGLE` during the dive so the variant base
  is guaranteed to face the camera when the callout fires. If you change `PAIRS`
  or the turn count in `HelixGL.tsx`, recompute that constant — the derivation
  is in the comment above it.
- The statistics in Act Two are still placeholders, as disclosed in the footer.

## Cleanup already done

The template's dead weight has been removed — don't re-add it by pasting
shadcn components back in without need:

- Deleted `src/components/ui` (49 unreferenced components), `use-mobile`,
  `lib/utils.ts`, and `components.json`.
- Dropped 43 packages: the whole Radix tree, recharts, react-hook-form, zod,
  embla, vaul, sonner, cmdk, date-fns, lucide, input-otp, react-day-picker,
  react-resizable-panels, clsx, tailwind-merge, cva.
- `Tall` (the sticky section wrapper) lived twice, once per act, byte-identical
  under two names. It's now one export in `visuals.tsx`.
- `TONE` was duplicated in ActOne and visuals; now exported once from
  `visuals.tsx`. Dead exports removed: `ease`, `useScrollProgress`,
  `useScrollVelocity`, `resetSceneState`, and 5 unused `PALETTE` entries.

`eslint .` reports zero errors and zero warnings across the project. Keep it
that way.

## Deploying

The app is SSR (TanStack Start on nitro). Deploy to a host that runs a server:

- **Vercel** — import the repo; nitro auto-detects Vercel in CI and switches
  off the Cloudflare default preset. Build command `npm run build`; leave the
  output directory alone. If the first deploy fails, pin it explicitly with
  `nitro: { preset: "vercel" }` in `vite.config.ts`.
- **Lovable** — its sandbox forces its own nitro config; nothing to do.

Two dead ends already explored, so nobody repeats them:
- `npx vite preview` is **broken** in this template — the preview server
  imports `dist/server/server.js`, which this Lovable/nitro pipeline never
  writes (it outputs to `.output/`). Use `bun run dev` instead.
- **There is no static-HTML export.** Both `tanstackStart.prerender` and
  nitro's prerenderer fail here (the former hits the same preview-server path
  bug; the latter 404s on `/` inside its sandbox). A node-snapshot workaround
  worked but was reverted 2026-08-08 in favour of Vercel. If static hosting
  (e.g. static.igem.wiki) ever becomes a hard requirement, that is the
  approach to resurrect — plus a basepath, since wikis serve from a subpath.

React Query is installed and provided in `__root.tsx` but issues no queries;
it is kept deliberately so the template's shape matches Lovable's. The favicon
is ours (`scripts/make-favicon.mjs` → favicon.svg + .ico).

## The cold open (StoryLoader)

`StoryLoader.tsx` is the narrative loader from the client brief and the load
gate in one: the two intro lines play on the night canvas while the three.js
chunk loads, scroll is locked (html overflow hidden + pinned to top), and the
overlay fades once the stage reports ready. Rules: first visit holds ≥3.4s so
the lines land; repeat visits this session hold 1.2s (sessionStorage flag);
reduced-motion shows the lines statically and holds ~1s; a 7s hard cap reveals
regardless — the SVG placeholder beneath guarantees there is something to
reveal. "Stage ready" means GL context created (ChapterHero → onStageReady) or
capability check failed (the SVG fallback IS the stage).

## The hero's loading state

The rule is **never show nothing**. The SVG helix is always mounted underneath
the stage; the WebGL canvas fades in over it once `onCreated` fires (one rAF
later, so the first frame has actually landed). The Suspense fallback stays
`null` deliberately — the placeholder is a sibling, not a fallback.

- The title animates via CSS (`.word-in`), not a JS clock, so it paints at
  first paint — before hydration. It used to sit at ~10% opacity until React
  booted, which on a slow connection meant a hero with no headline.
- `LoadingNote` waits 500ms before appearing, so a fast connection never
  flashes it. It disappears the moment the scene is ready.
- Verified under Fast-3G emulation: **0 frames with an empty stage** across 40
  samples, headline readable from 750ms.

If you test this by blocking requests, block `/three/Scene` — **not** anything
matching "three". The hero imports `/src/three/state.ts`, so a broad block
stops hydration and makes the loading UI look broken when it isn't.

## Performance

Measured in headless Chrome over a scripted 4s scroll through the hero. The
absolute FPS is low because headless has no real GPU — compare the columns,
not the numbers to your own machine.

| | before | after |
|---|---|---|
| concurrent rAF loops | 18 | 2 (+2 from the harness) |
| layout reads / frame | 18.4 | 1.0 |
| triangles / frame | 109,683 | 47,643 |
| median frame | 50.0 ms | 33.9 ms |

What was actually wrong, and the rules that follow from it:

- **Every chapter ran its own rAF loop**, forever, on- or off-screen, and each
  took *two* `getBoundingClientRect` reads per frame. That's the 18 loops and
  the layout thrash. Now there is **one** shared loop (`src/lib/ticker.ts`);
  chapters subscribe via IntersectionObserver only while near the viewport, and
  the loop parks itself entirely when the tab is hidden. **Never call
  `requestAnimationFrame` directly in a component — subscribe to the ticker.**
- **Ambient SVG motion never stopped.** `BodyFigure`, `Vessel` and `Helix` kept
  a 60fps clock running for chapters far off screen. They now take an `animate`
  prop, and each chapter passes its own visibility (`useSmoothProgress` returns
  it as a third tuple element; `useInView` as `visible` — note `seen` latches
  and is the wrong flag for this).
- **The geometry was over-tessellated**: the 112 base spheres alone were 85k of
  the 109k triangles at 20×20 segments. Spheres are 16×12, strand tubes 160×6
  (from 380×10), motes 6×4. Screenshots before/after are pixel-identical.
- The per-frame colour loop in `HelixGL` idles out ~40 frames after its targets
  stop changing, so a parked hero does no per-node work at all.
- Canvas DPR is capped at 1.5 with `powerPreference: "high-performance"`.

The remaining 1.4 MB client bundle is three.js + drei. It is lazy-loaded into
its own chunk, so visitors on the static-SVG fallback path never download it.
