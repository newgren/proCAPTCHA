# 04 — Computer Opponent

**What to build:** Replace the second human-controlled side with the scripted Computer Opponent. On its turn, `chooseComputerShot` scans its remaining Group balls (or, on an Open Table, all remaining object balls), picks the one with the clearest/least-obstructed line to any pocket (the "Easiest Shot"), and returns an angle/power (and a Called Pocket, when the target is the 8-ball) with a small randomized inaccuracy applied so its real-shot success rate lands around 90%. Its turn runs through the exact same `simulateShot` path and the exact same rendering/animation as a player's turn (aim line draws in, power pulls back, balls roll) — no instant-resolve shortcut, no artificial delay. This is the first point where the demo is genuinely "1v1 against a computer."

**Blocked by:** 03 — 8-ball win/loss resolution

**Status:** ready-for-agent

- [ ] `chooseComputerShot(state)` is a pure function: given a state, it returns a shot (angle, power, and Called Pocket when targeting the 8-ball)
- [ ] It selects the target ball with the clearest/least-obstructed line to any pocket among its remaining Group balls, or among all object balls when the table is still Open
- [ ] It applies randomized inaccuracy to the returned angle/power such that its shots succeed roughly 90% of the time
- [ ] When its only remaining target is the 8-ball, it also selects and returns a Called Pocket using the same easiest-shot heuristic
- [ ] The Computer Opponent's turn is driven through `simulateShot` — identical Foul/Group/win-loss handling as the player's turns, no special-cased rules
- [ ] The Computer Opponent's turn animates through the same rendering path as the player's turn (visible aim line, power pull-back, ball movement) with no shortcut and no added "thinking" delay
- [ ] A full game can now be played and won/lost by the player against the Computer Opponent with no second human required
- [ ] `node:test` unit tests cover `chooseComputerShot` picking the expected easiest target across several contrived table states, including an Open Table state and a state where only the 8-ball remains
