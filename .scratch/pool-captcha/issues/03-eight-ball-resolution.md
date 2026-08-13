# 03 — 8-ball win/loss resolution

**What to build:** Once a side has cleared their Group, their next shot targeting the 8-ball requires calling a pocket first (tap a pocket before shooting). The shot then resolves to one of: Legal Win (potted in the called pocket, no foul on that shot), an immediate loss for potting in the wrong pocket, an immediate loss for fouling on the same shot the 8-ball is potted (e.g. a scratch), or an immediate loss for an Early Pot (the 8-ball potted by either side before the shooter's Group is cleared). A full local two-player game (from ticket 02) can now actually be won or lost, ending the game.

**Blocked by:** 02 — Turn/rules engine

**Status:** ready-for-agent

- [ ] Once a side clears their Group, attempting to target the 8-ball requires a Called Pocket (tap a pocket before the shot); the shot cannot be taken without one
- [ ] Potting the 8-ball in the Called Pocket with no Foul on that shot emits a Legal Win event for the shooter and ends the game
- [ ] Potting the 8-ball in any pocket other than the Called Pocket emits an immediate-loss event for the shooter and ends the game
- [ ] Potting the 8-ball while also committing a Foul on that same shot (e.g. a scratch) emits an immediate-loss event for the shooter and ends the game, regardless of which pocket it went in
- [ ] Potting the 8-ball before the shooter's Group is cleared (Early Pot) emits an immediate-loss event for whichever side pocketed it and ends the game, at any point in the game
- [ ] A missed or non-foul 8-ball shot that doesn't pot the 8-ball falls back to the normal turn-passing rules from ticket 02
- [ ] The UI clearly announces the winner/loser and the reason (Legal Win / wrong pocket / foul on the eight / Early Pot) when the game ends
- [ ] `node:test` unit tests cover all four 8-ball resolution outcomes as distinct `simulateShot` events, plus the call-pocket requirement being enforced
