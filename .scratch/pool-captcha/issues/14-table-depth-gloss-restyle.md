# 14 — Table depth/gloss restyle: near-black pockets, glossy balls, dimensional rail

**What to build:** Cherry-pick specific depth/contrast qualities from a reference photo of a glossy mobile pool game (Miniclip-style), layered onto the *existing* blue/Material palette — not a pivot to that reference's teal felt, wood rail, or photorealism. This came out of a `/grilling` session on 2026-08-13; every choice below reflects a decision the session settled, not agent judgment calls.

**Blocked by:** None (builds on the current `index.html` rendering from tickets 07/11/12)

**Status:** ready-for-agent

## Scope (settled)

- Canvas rendering only: felt, rail, pockets, balls. The CAPTCHA widget card, page chrome (`meridian.io` shell), and HUD text/badges are untouched.
- Cue stick rendering (a graphic replacing the current plain aim line) is explicitly **out of scope** — tracked separately as ticket 15.

## Pockets — push to near-solid black, high contrast

Current: `drawPocketMouth()` (~index.html line 495) fills a radial gradient from `#0a0b0d` (center) through `#1b1d21` (70%) to `#303338` (rim) — a soft, mid-toned graduation — plus a `rgba(255,255,255,0.2)` rim-highlight arc.

- [ ] Recompute the gradient so the mouth reads as close to solid black rather than graduating up to a visible mid-gray rim (e.g. hold near-black through most of the radius and only brighten sharply in the last ~10-15%, or drop the gradient for a flat near-black fill plus a crisper/brighter rim-highlight arc) — the goal is a much higher-contrast "hole," not the current soft graduated look
- [ ] Keep `POCKET_GEOM`'s corner-vs-side size differentiation (`corner: { railCut: 42, mouth: 24 }`, `side: { railCut: 34, mouth: 19 }`) and the rail-wrap-around shape from ticket 11 — this ticket changes shading/contrast, not the pocket geometry
- [ ] The Called-Pocket selection ring (the `rgba(255,220,60,0.9)` arc drawn in `draw()` when calling the 8-ball's pocket) still reads clearly against the darker pocket — adjust its color/opacity only if the higher contrast makes it hard to see, otherwise leave it

## Balls — add a spherical gloss highlight, no new drop shadow

Current: `drawBall()` (~index.html line 555) fills a flat color (`colorFor(b.id)` for solids, white base + colored stripe band for stripes) with an existing subtle canvas shadow (`shadowBlur: 5, shadowOffsetY: 2`) already giving a faint drop shadow — that existing shadow is fine as-is and is not what this ticket is about.

- [ ] Add a radial highlight to each ball suggesting a light source (conventionally upper-left) — e.g. a small bright/white radial gradient blended over the base fill, offset toward one edge of the ball, fading into the base color — giving a spherical, glossy look rather than the current flat-shaded circle
- [ ] Apply consistently to both solids and stripes (and the cue ball), without obscuring the number-badge legibility
- [ ] Do **not** add any new drop-shadow effect beyond what's already there — this was explicitly decided against in favor of just the highlight

## Rail — bevel shading + increased thickness, no diamond inlay dots

Current: `RAIL_COLOR = "#2c4faa"`, `RAIL_WIDTH = 28`. `drawRailAndPockets()` (~index.html line 451) fills a flat rail color with a drop shadow and a single thin `rgba(255,255,255,0.14)` highlight stroke where the rail meets the felt.

- [ ] Increase `RAIL_WIDTH` beyond its current `28` for a more substantial, ornate look closer to the reference (tune visually — there's no exact target value, just noticeably beefier than now) — this will shrink the visible felt area somewhat, which is expected and accepted
- [ ] Add bevel-style shading to the rail — a highlight/shadow gradient (not a flat fill) suggesting a raised, rounded cushion profile, using tints/shades of the existing `RAIL_COLOR` blue family — no wood tones, no new hues
- [ ] Do **not** add the reference's brass diamond inlay dots (cushion-midpoint markers) — explicitly decided against; rail dimensionality comes from shading only
- [ ] Existing pocket-hole punch-through (`destination-out` compositing) and rounded-corner geometry continue to work correctly against the new rail width/shading

## Felt — unchanged

- [ ] Felt stays a completely flat solid `#4a72e0` fill — no vignette, no texture, no gradient. (Explicitly decided against in the grilling session — don't add this.)

- [ ] `npm test` still passes (this ticket is pure canvas-rendering code in `index.html`; `game.js`/`input.js` are untouched and their suites should be unaffected)
- [ ] Manual verification via the `/run` skill: load the Challenge, visually compare pockets/balls/rail against the "before" look and confirm pockets read near-black, balls read glossy/spherical, and the rail reads thicker and beveled — across all six pockets and a full rack of balls, not just one or two examples

## Comments

Opened 2026-08-13, following a `/grilling` session working from a reference screenshot of a glossy mobile pool game. Settled decisions, in order: (1) canvas-only scope, page chrome untouched; (2) cherry-pick specific qualities (pocket contrast, ball gloss, rail dimensionality) rather than a full aesthetic pivot — current blue felt/Material palette stays; (3) cue stick rendering deferred to ticket 15; (4) pockets go near-solid-black/high-contrast, keeping ticket 11's shape/size work; (5) balls get a gloss highlight only, no new drop shadow; (6) rail gets bevel shading in the existing blue family, no diamond inlay dots; (7) felt stays flat, no vignette; (8) rail gets visually thicker to give the bevel room to read.
