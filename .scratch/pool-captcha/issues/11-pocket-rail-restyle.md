# 11 — Pocket & rail restyle to match reference photo

**What to build:** Pockets currently render as flat, bare dark circles (`ctx.arc` fill, radius 22, soft shadow) dropped on top of the felt at each `POCKETS` entry — they don't read as cut into anything. Restyle the pockets and the rail around them to look like a real table's corner/side pocket the way the reference photo does: a rounded rail that visibly wraps around and frames each pocket mouth, with the pocket reading as a recessed cutout in the rail rather than a circle floating on the felt. Keep the current Material blue felt/rail color scheme from ticket 07 — this is about pocket/rail *shape and depth*, not reverting the color palette back toward the photo's green/mahogany.

**Blocked by:** 07 — Table & HUD visual restyle

**Status:** done

- [x] Rail geometry visually wraps around each pocket (rounded corner/edge cut) rather than the rail being a plain rectangle stroke with a circle drawn on top
- [x] Pocket mouth reads as recessed/cut into the rail (e.g. layered shading or an inner-shadow effect) rather than a single flat-filled circle
- [x] Corner pockets and side (middle-rail) pockets remain visually distinguishable from each other, matching the reference photo's proportions (corner pockets larger/more angled than side pockets is acceptable if it reads better — use judgment)
- [x] Existing pocket-selection affordance (the highlighted ring shown when calling the 8-ball's pocket) still renders correctly against the new pocket art
- [x] Table felt/rail color stays the current Material blue palette from ticket 07 — only pocket/rail shape and shading change
- [x] Manual verification via the `/run` skill — pockets look intentional and "cut in" at all six positions, not just the two currently easiest to eyeball

## Comments

Reopened context (2026-08-13): Travis flagged the current pockets as looking "weird" and pointed at a reference photo of a classic table — the rail-wrapped, recessed pocket look is what's being asked for, applied on top of the existing blue color scheme rather than a full revert.

Resolved (2026-08-13): Rail is now drawn as a rounded frame (outer rect minus inset felt-boundary rect via evenodd), with a hole punched through it at each `POCKETS` entry via `destination-out` compositing so the rail visibly curves around the pocket rather than stopping at a hard corner. Each pocket mouth is a radial-gradient-shaded circle (dark center, lighter rim) with a rim-highlight arc facing table center for depth, sized per pocket type (corner mouth 24 / rail cut 42, side mouth 19 / rail cut 34) so corner and side pockets stay visually distinct. Felt (`#4a72e0`) and rail (`#2c4faa`) colors from ticket 07 are unchanged. Verified via a Playwright-driven `/run` pass against the real Verification Widget flow (idle table, all six pockets) and a standalone harness forcing the Called-Pocket selection ring on at all six positions — both rendered cleanly with no console errors. `npm test` (game.js suite, untouched by this ticket) still passes 23/23.
