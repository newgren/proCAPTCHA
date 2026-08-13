# 02 — Turn/rules engine (two human-controlled sides)

**What to build:** Real 8-ball turn structure, playable by hand on both sides (local pass-and-play — no Computer Opponent yet). The table starts Open; the first side to legally pocket a ball gets that ball's Group (Solids or Stripes) assigned automatically, and the other side gets the opposite Group. A side keeps shooting as long as they keep legally pocketing their own Group's balls with no Foul; a clean miss passes the turn with no penalty. All three enforced Fouls — Scratch, Wrong-Ball-First (only once Groups are assigned), No-Rail-After-Contact — pass the turn and grant the other side Ball-in-Hand, placed via tap-to-place followed by the normal aim-and-shoot. The UI shows whose turn it is and which Group they've been assigned.

**Blocked by:** 01 — Physics sandbox foundation

**Status:** ready-for-agent

- [ ] `simulateShot` emits a Group-assignment event the instant either side's shot legally pockets a ball while the table is Open
- [ ] `simulateShot` emits a Foul event with reason `Scratch` when the cue ball is pocketed
- [ ] `simulateShot` emits a Foul event with reason `Wrong-Ball-First` when the cue ball's first contact is a ball outside the shooter's Group — only once Groups are assigned, never on an Open Table
- [ ] `simulateShot` emits a Foul event with reason `No-Rail-After-Contact` when, after cue-ball contact, no ball reaches a rail and nothing is pocketed
- [ ] Any Foul event results in the turn passing and the opponent being granted Ball-in-Hand
- [ ] Legally pocketing one or more of the shooter's own Group balls with no Foul keeps the turn with the same shooter
- [ ] A clean miss (nothing pocketed, no Foul) passes the turn with no Ball-in-Hand penalty
- [ ] When a side has Ball-in-Hand, tapping anywhere legal on the table places the cue ball there, followed by the normal two-phase aim-and-shoot
- [ ] The UI displays whose turn it is and their assigned Group (or "Open Table" before assignment)
- [ ] `node:test` unit tests cover: Group assignment on first legal pot, each of the three Foul reasons firing correctly, turn-continues-on-legal-pot, and turn-passes-on-miss
