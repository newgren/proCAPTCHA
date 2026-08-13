# Enforce a subset of real BCA 8-ball rules

We're implementing real BCA 8-ball rules rather than a simplified pool variant, since the joke depends on it being an actual game of pool. But full BCA play includes rules that are obscure, only matter once (the break), or add UI cost disproportionate to their payoff for a fast demo.

We enforce: Scratch, Wrong-Ball-First, and No-Rail-After-Contact (all → Ball-in-Hand), plus calling the pocket for the 8-ball only. We deliberately skip: the break-specific foul (fewer than 4 balls reaching a rail off the break), calling the pocket on non-8-ball shots, and any off-table-ball foul (not reachable under our physics model). Reference apps like Miniclip's 8 Ball Pool make the same cut.

## Consequences

If someone later wants stricter tournament-accurate play, the break-foul and full shot-calling are the two rules to add back — both require new state tracking (rail-contact-since-break, and a "call pocket" UI step on every shot, not just the 8-ball).
