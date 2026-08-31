# The display typeface — a decision, not a preference

**Status: open.** Once decided, this folds into `CONTEXT.md` and this file is
deleted. It exists because the site currently has no answer to "what face is
the homepage set in", and that is not a question a judged wiki should leave open.

---

## The problem, measured

`src/routes/__root.tsx` imports **one** typeface — Instrument Sans, self-hosted
via `@fontsource-variable/instrument-sans`, set on `body` in `styles.css:256`.
That is the face `CONTEXT.md` refers to, and for body copy it is accurate.

The homepage does not use it. `src/routes/new.tsx:74` declares:

```js
const DISPLAY =
  '"Avenir Next", Avenir, "Century Gothic", "URW Gothic", Futura, "Trebuchet MS", ui-rounded, system-ui, sans-serif';
```

and applies it at **11 sites** (lines 573, 591, 605, 689, 702, 739, 767, 800,
882, 914, 959): the wordmark, the iGEM tag, the desktop nav, both mobile-menu
states, the chapter label, both hero buttons, the scale annotations, and the two
scroll-driven headlines — *"One gene. One letter."* and *"About three billion
letters."*

**It is not on the `<h1>`.** The hero headline at line 744 sets `...T.display`
and no family at all, so the largest type on the site inherits Instrument Sans —
while the chapter label directly above it and the two buttons directly below it
are in the system stack. Three display-size strings on one screen, two faces.

**And it splits the story against itself.** Scenes two and three set their
headlines with `...T.headline` and no family (`TwoPeople.tsx:425` and `:439`,
`Why.tsx:257`), so they render in Instrument Sans. Scene one's headline at
`new.tsx:914` carries `DISPLAY`. The same headline role, one scroll apart, in
two different typefaces.

**None of the stacked faces is bundled with the site.** Each reader gets
whichever one their machine happens to have:

| Reader's machine | What they actually see |
|---|---|
| macOS | Avenir Next |
| Windows with Office | Century Gothic |
| Windows without Office | Trebuchet MS |
| Linux | URW Gothic, or the generic UI font |

Meanwhile every content page renders through `PageShell`, which never sets
`DISPLAY` — so those pages are in Instrument Sans on every machine.

**So there is no single answer to "what face is this site set in".** The story
page mixes two, inconsistently and within a single screen; the content pages use
one; and the half that comes from the stack is a different face on every
reader's machine. There is no version of this that is correct — the current
state is not a choice anyone made, it is the residue of two directions.

The audit sees it too. `node scripts/audit.mjs system` reports the wordmark at
two specs that differ only in tracking:

```
  62  21px/800/-0.24px     ← content pages (inherited tracking)
   7  21px/800/-0.21px     ← story page (explicit -0.01em)
```

Same wordmark. Two specifications. That is the definition of drift, and it is
the same root cause.

The code already knows. The comment above `DISPLAY` reads:

> INTERIM. […] it will render differently on every machine, which is not
> acceptable for a design-critical page.

---

## The constraints

1. **No external CDNs.** iGEM serves the wiki from its own infrastructure. The
   Google Fonts `<link>` was already removed once as a live violation. Whatever
   is chosen must be self-hosted — in practice, an `@fontsource-variable`
   package, the same mechanism Instrument Sans already uses.
2. **Redistributable licence.** The font file ships inside the wiki build, so
   it must be OFL or equivalent. All candidates below are OFL.
3. **Must reach weight 900.** Every headline on the site uses `font-black`, and
   the type scale pairs large sizes with tight negative tracking
   (`display` is `-0.042em`). A face that stops at 800 silently lightens every
   headline on the homepage.
4. **Must sit with the illustration.** The visual language is ink outlines,
   flat fills and hard offset shadows — things that look drawn. The face has to
   belong beside that, not argue with it.

---

## The candidates

All three are on npm as `@fontsource-variable/<name>` (verified — registry
returns 200 for each), and all are variable, so one file covers every weight.

### Gabarito — *recommended*

`@fontsource-variable/gabarito` · OFL · variable 400–900

Geometric, but with flattened joins and slightly squared bowls that give it a
drawn quality rather than a mechanical one. It looks like the illustrations
instead of merely sitting next to them. Reaches 900, so no existing weight
changes. Considerably less used than the alternatives, so it does not carry
another site's associations.

**Risk:** newer and less proven at very large sizes. Its lowercase `a` and `g`
are distinctive enough that Adina may simply dislike them — check the wordmark
before committing.

### Outfit — *the safe fallback*

`@fontsource-variable/outfit` · OFL · variable 100–900

The face the current stack was reaching for: circular, warm, a direct match for
the drawn circles and hexagons. Reaches 900. Nothing about it will go wrong.

**Risk:** it is the default geometric choice and it is everywhere. Beside a wiki
that used Poppins it reads as the same decision. All the personality would have
to come from the illustration.

### Bricolage Grotesque — *most character, one real cost*

`@fontsource-variable/bricolage-grotesque` · OFL · variable 200–800

Drawn as a display face, so it stays interesting at 5rem instead of just getting
bigger. Closest of the three to the custom lettering the reference wikis have.

**Risk:** it stops at **800**. Every `font-black` headline on the site would
render as ExtraBold and lose weight against the ink outlines. Its quirk also
pulls away from the round, friendly illustration style.

---

## Recommendation

**Gabarito**, with **Outfit** as the fallback if Adina dislikes the letterforms.

The site's whole language is hand-drawn marks. Gabarito is the only candidate
whose letterforms share that quality *and* reach the 900 weight the type scale
already asks for. Bricolage has more personality but the weight ceiling is a
real, visible cost on every headline. Outfit fits perfectly and says nothing.

### To look at them before deciding

Open these and set the sample text to **It starts with one gene.**

- <https://fonts.google.com/specimen/Gabarito>
- <https://fonts.google.com/specimen/Outfit>
- <https://fonts.google.com/specimen/Bricolage+Grotesque>

Judge them at weight 900, not at the default. That is where they will live.

---

## What implementing it costs

Small, and reversible:

1. `bun add @fontsource-variable/<name>` and one import line in `__root.tsx`,
   beside the Instrument Sans import.
2. Move `DISPLAY` out of `new.tsx` and into `palette.ts` as a token, so the
   story page and `PageShell` read the same value and cannot drift again. This
   is the part that fixes the wordmark's two trackings.
3. Delete the dead `poster-head` utility in `styles.css`, which still calls for
   Archivo Black — a face that is **not** self-hosted. Anyone using it today
   gets Arial Black.

Swapping Gabarito for Outfit later is the same two lines. Nothing here locks.

**Timing:** this should land before Human Practices, Safety and Team are built,
so those pages are designed in the final voice rather than retrofitted into it.
