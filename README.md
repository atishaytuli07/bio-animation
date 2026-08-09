# bio-animation — DPYD Diagnostics

An interactive scroll-driven story about DPYD gene variants, DPD deficiency and
fluoropyrimidine (5-FU) chemotherapy toxicity — and the pre-treatment test that
prevents it. Built for **iGEM 2026 — Diagnostics**.

The site is one continuous scroll film in seven chapters (The Problem → Why It
Happens → The Discovery → The Solution → The Results → The Future → The Work),
opening on a WebGL DNA helix and closing on a skimmable reference layer for
judges.

## Running it

```sh
npm install       # or: bun install
npm run dev       # http://localhost:5178 (or the port Vite reports)
npm run build
npm run lint
```

> **Do not use `npx vite preview`.** It is broken in this template — it imports
> `dist/server/server.js`, which this Lovable/nitro pipeline never writes (it
> outputs to `.output/`). Use `npm run dev`.

## Deploying

The app is server-rendered (TanStack Start on nitro), so it needs a host that
runs a server — **Vercel** (nitro auto-detects it in CI) or Lovable. There is no
static-HTML export: both TanStack Start's and nitro's prerenderers fail against
this pipeline. If static hosting (e.g. `static.igem.wiki`) becomes a hard
requirement, see `MERGE-NOTES.md` for the approach to resurrect.

## Before this goes in front of judges

Three things are deliberately **not real yet**, and none of them are code
problems:

1. **The statistics are placeholders** — Act Two's prevalence/toxicity figures
   and the Results tiles. The footer discloses this.
2. **"The Work" panels are empty labelled slots** — protocols, notebook, team,
   attributions. Left empty on purpose so nobody ships invented content.
3. **The DNA flanking sequence in the hero is illustrative**, not the verified
   reference flank around `chr1:97,450,058`. Marked in code.

## Where things live

| Path | What |
|---|---|
| `src/routes/index.tsx` | chapter order — the spine of the story |
| `src/components/story/` | every chapter, plus the shared SVG primitives |
| `src/three/` | the WebGL helix (lazy-loaded, capability-gated) |
| `src/hooks/use-scroll-progress.ts` | the scroll spring every chapter subscribes to |
| `src/lib/ticker.ts` | the single shared rAF loop |
| `MERGE-NOTES.md` | **read this first** — architecture, perf rules, and the traps |

`MERGE-NOTES.md` documents the decisions that are easy to undo by accident:
one scroll engine (never call `requestAnimationFrame` in a component), the
three-canvas colour grade, the loader gate, and the measured performance rules.
