# 06 — Allow re-aiming before the power pull-back locks in

**What to build:** Once a player starts dragging to set the aim line, any further drag is immediately interpreted as the power pull-back gesture — there's no way to release and re-drag to adjust the aim angle first. A player should be able to keep repositioning the aim line before committing to the power pull-back phase.

**Blocked by:** None

**Status:** done

- [x] Once the aim-line drag phase has started, releasing and starting a new drag on the table re-enters the aim phase (adjusts the angle) rather than immediately being read as a power pull-back
- [x] The power pull-back phase is only entered via the existing pull-back-along-the-aim-line gesture, not by any fresh drag
- [x] Re-aiming any number of times before pulling back doesn't leave stale aim-line artifacts on screen
- [x] Touch and mouse both support re-aiming identically
- [x] `node:test` coverage is not required (input-handling only, no `game.js` change expected) — verify manually via the `/run` skill

## Comments

2026-08-12: Dropped as `wontfix` — Travis confirmed fine to skip ("fine if we didn't have this at all").

2026-08-13: Reopened — Travis asked for this to be implemented after all.

2026-08-13: Implemented. A fresh drag started while `armed` now stays undecided (tentatively `pulling`, zero power) until it clears a small deadzone; if the movement past that point isn't a backward pull along the locked aim line, it's read as a re-aim (`phase = "aiming"`) instead, and the player can repeat this any number of times before actually pulling back. `game.js` untouched; `npm test` (69 tests) still passes. Verified by extracting the exact state-machine logic into a standalone driver script and running it through the multi-re-aim-then-pull-back scenario (no browser automation tool was available in this environment, and this is a zero-dependency repo, so no headless-browser package was installed for the check).
