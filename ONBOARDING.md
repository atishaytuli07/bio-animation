# Prompts for a fresh session

Paste **Prompt 1** after `/clear` at the start of any new session. Use
**Prompt 2** for short follow-ups once the model is already oriented.

The point of both is the same: make the model *look* before it acts, and make
it say "I don't know" instead of inventing. Everything in them exists because
something went wrong without it.

---

## Prompt 1 — cold start

```
This is an iGEM 2026 competition wiki: team NIS Kazakhstan, project
ChemoGuard, about DPYD gene variants and 5-FU chemotherapy toxicity.
The client is Adina. The competition freeze is 21 October 2026, 15:00 UTC,
with no extensions.

Before you write any code, do this in order and tell me what you found:

1. Read CONTEXT.md end to end. It is the project's own reference — the story,
   the build, the standing rules, and what is still missing. Its "Standing
   rules" section lists things the client has ALREADY REJECTED. Do not propose
   any of them.

2. Read these files, in this order, and actually open them rather than
   guessing from their names:
      src/components/hero/palette.ts     the whole design system
      src/components/story/site-map.ts   the single source of truth for pages
      src/routes/new.tsx                 the story page
      src/components/story2/TwoPeople.tsx
      src/components/story3/Why.tsx
      src/components/story/PageShell.tsx the content-page frame
   The long comment blocks at the top of each file explain WHY things are the
   way they are, usually because an earlier version was wrong. Read them.

3. Run `bun run verify` and confirm it passes. Then start the dev server
   (`bun run dev`) and run `bun run audit` — six checks across every page.
   Tell me the result. Do not skip this; it is how you find out what state
   the site is actually in rather than what CONTEXT.md says it was in.

4. Then ask me your questions. I expect real questions about things that are
   genuinely ambiguous, not a summary of what you just read.

Rules for this project — these are not preferences:

- NEVER invent scientific content. Not a sequence, not a citation, not a
  number, not a description of how our test works. A fabricated flanking
  sequence shipped once and had to be removed. If something is unknown, mark
  it with the <Awaiting> component so it is visible on the page, and tell me.

- MEASURE, do not eyeball. If you claim a contrast ratio, a frame rate, a
  boundary or an overlap, you must have run something that produced that
  number. `bun run audit` covers most of it; Playwright is there for the rest.
  "It looks fine" is not a verification.

- Contrast must be measured on PAINTED PIXELS. The computed-style method
  reports 1.00:1 on a gradient background and will pass a page nobody can
  read.

- Never chain a check through a pipe. `build | grep | head` takes its exit
  code from `head`, which always succeeds — a broken build shipped that way.
  Use `bun run verify`.

- The scroll boundaries and beat windows are MEASURED, not chosen. If you
  change any section height, re-measure and retune everything that references
  it: the ground keyframes, the world density schedule, all handoffs, the
  chapter thresholds.

- Tell me plainly when something is wrong, including when it is something you
  did earlier in the session. Do not soften it.

Do not start building until I have answered your questions.
```

---

## Prompt 2 — resuming, when the model is already oriented

```
Re-read CONTEXT.md and the file(s) you are about to change before editing
them. Same rules as before: never invent science, measure rather than eyeball,
contrast on painted pixels, `bun run verify` before any commit, and re-measure
the boundaries if you change a section height.

Today: <what you want done>
```

---

## Prompt 3 — when you want a review rather than a build

```
Do not change anything yet. Audit and report.

Read CONTEXT.md, then run `bun run audit` and read every line of it — the
`system` and `copy` sections print inventories rather than pass/fail, so they
need judgement rather than skimming. Then look at <the pages or sections you
care about> yourself for anything the audit cannot see: hierarchy, rhythm,
whether a diagram is doing the work a paragraph is doing.

Report what you find, ranked worst first, with the measurement that proves
each one. Then wait for me to say which to fix.
```

---

## Why these work

**Read-before-write, in a named order.** Left to itself a model will infer a
file's contents from its name and be confidently wrong. Naming six files and
saying "actually open them" removes the excuse. The comment blocks matter more
than the code here — most of them record a mistake, so reading them prevents
repeating it.

**"Standing rules" up front.** The most expensive thing a fresh session can do
is enthusiastically rebuild something the client already rejected. That section
exists so nobody proposes three.js again.

**"Ask me questions, not a summary."** Without this you get a confident recap
of what it just read, which proves nothing. Real questions reveal whether it
actually understood.

**"Measure, do not eyeball" with the specific traps named.** Generic
instructions to be careful do nothing. Naming the exact failures — the pipe
that swallowed a build failure, the contrast method that passes unreadable
pages — is what changes behaviour.

**"Do not start building until I answer."** Models default to action. Without
an explicit stop they will read, summarise, and start editing in one turn.

---

## What to say when you paste new client feedback

Give the model her message verbatim, then:

```
That is the client's message, word for word. Before proposing anything:

1. List every distinct point she made, in her order, including the small ones.
2. For each, say whether it is already done, partly done, or not started —
   and check the code rather than assuming.
3. Flag any point that conflicts with something we already decided or that
   she asked for earlier.
4. Then propose what to do, and wait.
```

That numbered form matters. Asked to "address the feedback", a model will act
on the loudest two or three points and quietly drop the rest.
