# 14 — Table depth/gloss restyle: near-black pockets, glossy balls, dimensional rail

**What to build:** Cherry-pick specific depth/contrast qualities from a reference photo of a glossy mobile pool game (Miniclip-style), layered onto the *existing* blue/Material palette — not a pivot to that reference's teal felt, wood rail, or photorealism. This came out of a `/grilling` session on 2026-08-13; every choice below reflects a decision the session settled, not agent judgment calls.

**Blocked by:** None (builds on the current `index.html` rendering from tickets 07/11/12)

**Status:** done

## Scope (settled)

- Canvas rendering only: felt, rail, pockets, balls. The CAPTCHA widget card, page chrome (`meridian.io` shell), and HUD text/badges are untouched.
- Cue stick rendering (a graphic replacing the current plain aim line) is explicitly **out of scope** — tracked separately as ticket 15.

## Pockets — push to near-solid black, high contrast

Current: `drawPocketMouth()` (~index.html line 495) fills a radial gradient from `#0a0b0d` (center) through `#1b1d21` (70%) to `#303338` (rim) — a soft, mid-toned graduation — plus a `rgba(255,255,255,0.2)` rim-highlight arc.

- [x] Recompute the gradient so the mouth reads as close to solid black rather than graduating up to a visible mid-gray rim (e.g. hold near-black through most of the radius and only brighten sharply in the last ~10-15%, or drop the gradient for a flat near-black fill plus a crisper/brighter rim-highlight arc) — the goal is a much higher-contrast "hole," not the current soft graduated look
- [x] Keep `POCKET_GEOM`'s corner-vs-side size differentiation (`corner: { railCut: 42, mouth: 24 }`, `side: { railCut: 34, mouth: 19 }`) and the rail-wrap-around shape from ticket 11 — this ticket changes shading/contrast, not the pocket geometry
- [x] The Called-Pocket selection ring (the `rgba(255,220,60,0.9)` arc drawn in `draw()` when calling the 8-ball's pocket) still reads clearly against the darker pocket — adjust its color/opacity only if the higher contrast makes it hard to see, otherwise leave it

## Balls — add a spherical gloss highlight, no new drop shadow

Current: `drawBall()` (~index.html line 555) fills a flat color (`colorFor(b.id)` for solids, white base + colored stripe band for stripes) with an existing subtle canvas shadow (`shadowBlur: 5, shadowOffsetY: 2`) already giving a faint drop shadow — that existing shadow is fine as-is and is not what this ticket is about.

- [x] Add a radial highlight to each ball suggesting a light source (conventionally upper-left) — e.g. a small bright/white radial gradient blended over the base fill, offset toward one edge of the ball, fading into the base color — giving a spherical, glossy look rather than the current flat-shaded circle
- [x] Apply consistently to both solids and stripes (and the cue ball), without obscuring the number-badge legibility
- [x] Do **not** add any new drop-shadow effect beyond what's already there — this was explicitly decided against in favor of just the highlight

## Rail — bevel shading + increased thickness, no diamond inlay dots

Current: `RAIL_COLOR = "#2c4faa"`, `RAIL_WIDTH = 28`. `drawRailAndPockets()` (~index.html line 451) fills a flat rail color with a drop shadow and a single thin `rgba(255,255,255,0.14)` highlight stroke where the rail meets the felt.

- [x] Increase `RAIL_WIDTH` beyond its current `28` for a more substantial, ornate look closer to the reference (tune visually — there's no exact target value, just noticeably beefier than now) — this will shrink the visible felt area somewhat, which is expected and accepted
- [x] Add bevel-style shading to the rail — a highlight/shadow gradient (not a flat fill) suggesting a raised, rounded cushion profile, using tints/shades of the existing `RAIL_COLOR` blue family — no wood tones, no new hues
- [x] Do **not** add the reference's brass diamond inlay dots (cushion-midpoint markers) — explicitly decided against; rail dimensionality comes from shading only
- [x] Existing pocket-hole punch-through (`destination-out` compositing) and rounded-corner geometry continue to work correctly against the new rail width/shading

## Felt — unchanged

- [x] Felt stays a completely flat solid `#4a72e0` fill — no vignette, no texture, no gradient. (Explicitly decided against in the grilling session — don't add this.)

- [x] `npm test` still passes (this ticket is pure canvas-rendering code in `index.html`; `game.js`/`input.js` are untouched and their suites should be unaffected)
- [x] Manual verification via the `/run` skill: load the Challenge, visually compare pockets/balls/rail against the "before" look and confirm pockets read near-black, balls read glossy/spherical, and the rail reads thicker and beveled — across all six pockets and a full rack of balls, not just one or two examples

## Comments

Opened 2026-08-13, following a `/grilling` session working from a reference screenshot of a glossy mobile pool game. Settled decisions, in order: (1) canvas-only scope, page chrome untouched; (2) cherry-pick specific qualities (pocket contrast, ball gloss, rail dimensionality) rather than a full aesthetic pivot — current blue felt/Material palette stays; (3) cue stick rendering deferred to ticket 15; (4) pockets go near-solid-black/high-contrast, keeping ticket 11's shape/size work; (5) balls get a gloss highlight only, no new drop shadow; (6) rail gets bevel shading in the existing blue family, no diamond inlay dots; (7) felt stays flat, no vignette; (8) rail gets visually thicker to give the bevel room to read.

Resolved (2026-08-13): All three changes implemented in `index.html`, canvas-only, `game.js`/`input.js` untouched.

- **Pockets** (`drawPocketMouth`): gradient recomputed to hold near-black through 85% of the radius (`#050506` → `#0a0b0d`) and only brighten to `#18191d` in the last 15% — still much darker than the old `#303338` rim — so the mouth reads as a near-solid-black hole instead of the old soft mid-gray graduation. `POCKET_GEOM`'s corner/side size split and the ticket 11 rail-wrap shape are untouched. Rim-highlight arc bumped from `rgba(255,255,255,0.2)`/2px to `rgba(255,255,255,0.32)`/2.5px so it still reads crisply against the darker fill. Called-Pocket selection ring color left as-is per the ticket's "otherwise leave it" — confirmed unchanged in the diff, not re-verified live since selecting a pocket requires reaching an 8-ball shot state, which is outside this ticket's rendering-only scope.
- **Balls** (`drawBall`): added a radial gloss highlight (white, offset upper-left at roughly `-0.35r, -0.4r`, fading from 85% to 0% opacity by ~0.95 ball radii) clipped to the ball circle, drawn after the base/stripe fill and before the number badge so the opaque badge stays fully legible on top. Applied unconditionally to every ball including the cue ball. The existing subtle drop shadow (`shadowBlur: 5, shadowOffsetY: 2`) was left completely untouched — no new shadow added.
- **Rail** (`drawRailAndPockets`): `RAIL_WIDTH` raised from `28` to `44`. Flat `RAIL_COLOR` fill replaced with a diagonal `createLinearGradient` (top-left to bottom-right) between two new same-hue constants, `RAIL_HIGHLIGHT_COLOR` (`#7699e6`) and `RAIL_SHADOW_COLOR` (`#152a63`), passing through the original `RAIL_COLOR` (`#2c4faa`) at the midpoint — no wood tones, no new hues, no diamond inlay dots added. Added a light outer-edge stroke and a darker inner-edge stroke on top of the existing inner highlight stroke to reinforce the raised-cushion read. The pocket punch-through (`destination-out`) and rounded-corner paths were untouched and still run against the wider rail.
- **Felt**: no changes made — still the flat `#4a72e0` fill with no vignette or texture.

Verified with `npm test` (34/34 passing, `game.js`/`input.js` suites unaffected) and a live browser pass: served the repo via `python3 -m http.server`, drove the real Verification Widget flow (click checkbox → Challenge) with Playwright against the cached `chromium-1228` "Google Chrome for Testing" build, and screenshotted the table at 3x device scale. Confirmed visually: all six pockets read near-black with a bright crisp rim arc (checked top-left and bottom-right corners directly); the full 15-ball rack plus cue ball all show a clear white gloss highlight offset upper-left with numbers still legible on top; the rail is visibly thicker than before and shows a light-blue-to-navy diagonal bevel gradient (lighter near the top-left corner, darker near the bottom-right corner) with no wood tones or inlay dots; the felt remains flat solid blue with no added texture or vignette anywhere on the table.
