# ChemoGuard — Production Brief

Single source of truth. Supersedes `ART-DIRECTION.md` and `IGEM-CONSTRAINTS.md`
(both folded in here). `RESTRUCTURE.md` and `MERGE-NOTES.md` are historical.

**The rule that governs this document:** six visual directions have been built
and rejected. Every one was built from a *description* of what the client
wanted rather than from something she pointed at. Nothing gets built from
adjectives again — only from a reference she has confirmed, or a frame she has
approved.

---

## 00 — Status

### THE VISUAL DIRECTION IS APPROVED (client, on /new)

> "This is MUCH closer to the visual direction I mean. Please keep this overall
> illustrated and colorful style — this is the first version where I feel the
> visual language is going in the right direction."

Approved by name: DNA immediately visible in the hero · the richer palette ·
the playful scientific illustration style · the small cells and elements.

**Do not restyle again.** Her words: *"I don't want to completely redesign this
direction now. I would rather make it more polished and immersive."* Everything
from here is refinement, depth, transitions and storytelling.

### What she asked for next

1. **The 50/50 split is too rigid.** The two sides should feel connected, with
   elements crossing between them, and more depth.
2. **The DNA should feel slightly more dimensional and interactive** — while
   staying illustrated. Not realistic, not overly 3D.
3. **"Follow the gene" becomes the central storytelling idea of the homepage.**
   Scroll follows the highlighted DPYD region into the DNA → why two people
   respond differently to the same treatment → detection → ChemoGuard.
4. **A subtle story progress system at the top**, so a visitor always knows
   where they are.

Note that (3) is her own phrase taken from the hero's CTA, and it matches the
DNA-as-visual-thread spine already agreed in §07. The story and the visual
language now point the same way for the first time.

## 00b — Previous status

| | |
| --- | --- |
| Story | **Approved by client**, twice, unprompted |
| Visual direction | **Not agreed.** Six rejected |
| Current deploy | Stale — predates ChemoGuard branding entirely |
| Content | Placeholder. Medal-critical |
| Next deliverable | **One hero frame.** Nothing else |

The client's own instruction: *"please don't continue developing this current
design yet… could you please focus ONLY on the first viewport/hero and show me
a proper visual concept before building the rest?"*

---

## 01 — Scientific source of truth · BLOCKED

Nothing here may be invented. iGEM's own AI policy is explicit: never fabricate
"experimental results, data, measurements, citations, references, statistics or
attributions."

Currently placeholder and **must** come from the team:

- Statistics, each with a source
- The actual assay / diagnostic method
- Experiments, results, validation data
- The verified DPYD reference sequence and flanking bases
- Human Practices, Safety, Attributions, Contribution

This has the longest lead time of anything in the project. Request it now, in
parallel with design — not after.

---

## 02 — What the client wants

Taken from her own messages, not paraphrased.

**Rejected outright**

- Realistic/photographic people — *"more like a conventional medical advertisement"*
- *"Extremely basic line figures"*
- *"Large sections that are almost completely black or extremely minimal"*
- *"Beige, black and grey"*
- Pages *"dominated by text"* with *"mostly empty space"*
- *"Another variation of this beige/black minimalist direction"*

**Required**

- *"DNA/genetics to be a major visual element from the very first screen"* but not the threejs one which we have it is so bad and not good looking and also take too much time to get load so we will not use threejs 
- Illustrated / cartoon-like characters **and** scientific elements, *"all feel
  like part of one custom illustrated visual world"* real characters real feel 
- Red + white as identity, supported by **coral, pink, blue, lavender, green**
- ChemoGuard branding in the hero
- A short headline
- *"Much less empty background"*
- *"Playful but still professional, scientifically meaningful, and much more distinctive"*
- Story told through *"illustrations, animated scientific elements and visual
  transitions, not primarily through large text"*

### The reinterpretation that unblocks the hero

We read "don't open with text" as *remove the words*. That was wrong.
Wuxi/ReNovo's hero — the strongest reference — carries a wordmark, a tagline, a
full descriptive paragraph **and two buttons**. More words than the hero she
rejected.

The difference is density. **She is objecting to emptiness, not to text.** The
fix is to fill the frame, not to strip the copy.

---

## 03 — What the best 2026 wikis actually do

Measured, not assumed.

| Wiki | Homepage length |
| --- | --- |
| GlycoGarden (Fudan) | 11.2 screens |
| KCIS-Xiugang-Taipei | 12.8 screens |
| Wuxi-DSAS (ReNovo) | 13.3 screens |
| **Ours today** | **43.8 screens** |

**Target ≈ 12 screens.**

**Navigation.** All three keep a conventional persistent top menu with
dropdowns (Project / Wet Lab / Dry Lab / Team); GlycoGarden adds search with a
⌘K shortcut. None hides navigation behind a single button. *The earlier
"INDEX-only" plan is withdrawn* — a normal visible menu is both what the best
wikis do and what the judge-findability criterion rewards.

**Loaders.** GlycoGarden has **none** — it renders straight into the scene.
Wuxi has an illustrated one (a magnifier sweeping a test-tube rack — the
project's own metaphor of searching for a hidden signal), on warm cream, ~3–4s,
**with a Skip button**. KCIS uses a black screen with a "28% LOADING" counter —
exactly what our client rejected.

→ A preloader is **optional**. If built: illustrated, on-metaphor, skippable,
never black.

**Scientific honesty.** Wuxi labels uncertainty inline: *"Evidence boundary.
Exploratory metabolomics studies have reported gentisic acid as a potential
RCC-associated urinary analyte, but results are limited and inconsistent."*
Adopt this as policy — we are making claims about chemotherapy toxicity.

**Tonal warning.** KCIS is a pastel mascot cartoon. Charming for yeast and food
waste; wrong for patients hospitalised by drug toxicity. "Playful but
professional" means Wuxi's register, not KCIS's.

---

## 04 — iGEM requirements & judging

**Medals.** Bronze: participation, presentation, a contribution future teams
can build on. Silver: Engineering Success **and Human Practices**.

**Gold is new in 2026** and is assessed entirely through **the three Special
Awards the team selected on the Judging Form** — judges cast no separate Gold
vote, and all three must come back "yes."

> **Open question, high priority: which three awards did ChemoGuard select?**
> If Best Wiki is among them, this site is one third of their Gold criterion.

**Human Practices** is an explicit Silver criterion and a scored judging
question. It cannot be a footer link inside a "judge layer."

**Freeze** is 15:00 UTC on the published date, no extensions, judging begins
immediately after. *Reported as 21 Oct 2026 — the time convention is confirmed,
the date still needs reading off the official calendar.*

**AI policy** (`.claude/RESPONSIBLE_AI_USE.md`, shipped in iGEM's own template):
team is fully accountable and must be able to defend every line; never
fabricate; human in the loop; credit sources — *"the Attributions Form is a
judging requirement, not a formality."* It does **not** explicitly address
AI-generated illustration; do not claim a specific attribution format for
images without verifying it.

---

## 05 — Technical constraints

From iGEM's official `wiki-react-vite` template. These are hard.

> *"Everything your wiki loads (CSS, JavaScript, fonts, images) must be served
> from iGEM infrastructure. Do not link to external or third-party CDNs (for
> example Google Fonts, jsDelivr, cdnjs)"*

> *"Images, photos, icons and fonts **MUST** be stored on `static.igem.wiki`"*

Videos embed from `video.igem.org`. Deployment is GitLab Pages CI on Node 22:
`yarn build → dist → public`, plus `echo '/* /index.html 200' > public/_redirects`.
Base path is a **subdirectory**: `base: /<team-slug>/`.

| Constraint | Our state | Action |
| --- | --- | --- |
| No external CDNs | Loads 3 faces from **fonts.googleapis.com** | Self-host via the uploads tool. Explicitly named in the ban |
| Static build only | TanStack Start + **nitro SSR**, cloudflare preset | Ship a static SPA. `_redirects` preserves client-side routing; SSR goes |
| Base `/<team-slug>/` | Root-absolute paths | Every asset and route must be base-aware |
| Images on static.igem.wiki | Images in `public/` | Upload; reference absolutely. Keeps art out of the repo |

WebGL/three.js is not prohibited, but must be self-hosted and counts toward
page weight.

**These three tasks are invisible to the client and independent of art
direction** — font self-hosting, static-SPA conversion, base-path correctness —
so they can proceed during design without risking another rejection.

---

## 06 — Visual system · THE OPEN DECISION

GlycoGarden's real lesson is not "choose a nice style." Their garden flowers
**are SNFG glyphs** — purple diamond = sialic acid, blue square = GlcNAc,
yellow circle = galactose. They grew a world out of their field's own standard
notation, and chose flat geometry because it was *"closest to the SNFG logic we
began with."*

So the question for ChemoGuard is not *which art style* but:

> **What is our notation?**

Candidates to decide between:

- **Base-pair colour convention** (A/T/G/C) — instantly legible as genetics
- **Chromosome ideogram banding** — gives a native way to "zoom to locus"
- **Pharmacokinetic clearance curve** — the shape of the whole story: one curve
  clears, one accumulates

Everything — characters, cells, enzymes, molecules, charts, UI, transitions —
derives from the chosen system. That is what would make this original rather
than another colourful illustrated wiki, and it is the strongest available
argument for a Best Wiki nomination.

### The palette · proposed, for review

Her named colours, given concrete values. Red and white are identity; the rest
are supports and must stay controlled — she asked for *"other complementary
colors"*, not a rainbow.

| Role | Name | Hex | Used for |
| --- | --- | --- | --- |
| **Identity** | ChemoGuard Red | `#E03A3E` | Brand, the drug, the signal, danger |
| **Identity** | Paper | `#FDFBF9` | Ground, surfaces, type on dark |
| Support | Coral | `#F5714F` | The medicine in transit, warmth, rising exposure |
| Support | Pink | `#F79AB0` | Tissue, bodies, soft biological fill |
| Support | Soft Blue | `#6FA8DC` | Clinical, calm, the cleared pathway |
| Support | Lavender | `#A98CE0` | Genetics — DNA, nucleus, the variant |
| Support | Green | `#5FBF8F` | Results, validated data, safe outcome |
| Structure | Ink | `#2B2320` | Type, outlines, diagram strokes |

**One assignment rule that must hold everywhere:** a colour means the same
thing on every screen. Lavender is always genetics. Green is always a validated
result. Coral is always the drug. If colour is decorative on one screen and
meaningful on another, the whole system reads as decoration.

**Emotional progression is carried by saturation and hue, never by darkness.**
She rejected near-black sections explicitly.

| Beat | Dominant |
| --- | --- |
| 1 Hero | Full palette, balanced |
| 2–3 Patients, medicine | Paper + coral + soft blue |
| 4–5 Inside, DPD | Soft blue + lavender |
| 6 DPYD variant | Lavender + blue, red entering |
| 7 Toxicity | Deep saturated coral→red. Hot, dense, **not dark** |
| 8 The question | Palette lifts, blue returns |
| 9 Solution | Blue + lavender + coral |
| 10 Results | Green + ink |
| 11 Impact | Brightest, full palette |

### The style · three candidates, her decision

All three satisfy her brief. They differ in how they're produced and how well
they animate — which matters, because her requirement is that *visuals carry
the story*, and only vector morphs.

**A · Scientific Editorial** — flat vector, bold confident shapes, no rendering,
minimal outlines, geometric simplification.
*Animates best; nearest to something drawable entirely in code; lowest asset
risk. Least "warm" of the three.*

**B · Organic Scientific World** — soft gradients with fine grain, rounded
tactile forms, premium and warm. Closest to current award-winning science
communication.
*Warmest and most "premium"; gradients and grain are harder to reproduce
consistently in code across a hundred elements.*

**C · Geometric from the Notation** — everything constructed from the primitives
of whichever notation we choose in §06, the way GlycoGarden built a garden from
SNFG glyphs.
*Most original and the strongest Best Wiki argument; requires the notation
decision first, so it cannot be drawn until that is settled.*

**Character production remains the biggest unsolved risk.** Twelve sections of
consistent illustrated characters is an illustrator, a licensed library, or a
tightly controlled AI pipeline. Vector-in-code covers the scientific elements
(they must morph — raster cannot); it does not cover the people.

---

## 07 — Story architecture · APPROVED

Twelve beats, matching the ~12-screen target. **The DNA is the visual thread**:
present from the first frame, then the body, then the variant, then the basis
for the test — mysterious, then scientific, then explanatory.

1. **Hero** — DNA large, characters integrated, branding, short headline, dense
2. **The patients** — *"The same treatment."* Visually identical
3. **The medicine** — enters both, identically. Held longer than comfortable
4. **Inside** — into the bloodstream and cell; DPD introduced
5. **Two paths** — A metabolises; B's exposure begins to build
6. **The genetic difference** — return to the hero's own DNA; DPYD, the variant
7. **Toxicity** — *scroll drives the accumulation.* Climax: *"…doesn't mean the
   same outcome."* First time the full sentence appears
8. **The question** — elements rearrange into *"What if we knew before?"* Palette lifts
9. **The solution** — the diagnostic journey, as one illustrated process
10. **Results** — the team's real data, in the same visual system
11. **Impact** — one patient → many; brightest palette
12. **The Work** — full documentation, reachable from the top nav throughout

**Fixes already applied:** "Follow the DNA" folded into beat 4 (it was a
transition, not a section); Solution and "Test before treatment" merged (they
were the same sequence twice); characters no longer "appear" in beat 2 having
already been in the hero — beat 2 moves toward them.

**Do not reuse the headline "Precision starts in your DNA."** It is the Lovable
template's tagline and the title of the exact build she rejected. The real
ChemoGuard line is still unknown.

---

## 08 — Blockers

| # | Needed | From |
| --- | --- | --- |
| 1 | Confirm the reference wikis — send her the four links and ask "are these the ones you meant?" | Client |
| 2 | The three selected Special Awards | Team |
| 3 | ChemoGuard logo file | Client |
| 4 | The real tagline | Client |
| 5 | All scientific content (§01) | Team |
| 6 | Exact wiki freeze date | Official calendar |

---

## 09 — Sequence

1. Send one message: storyline locked · confirm references · request content ·
   ask the three awards · scope conversation.
2. **In parallel, invisible to her:** self-host fonts, prove the static SPA
   build on a subpath.
3. Decide the notation (§06).
4. Three hero concepts derived from it → one review page → **she picks one**.
5. Only then build the hero. Then the remaining eleven beats.
