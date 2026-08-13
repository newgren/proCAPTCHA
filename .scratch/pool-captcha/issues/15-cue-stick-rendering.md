# 15 — Rendered cue stick graphic

**What to build:** Replace the current plain white aim line (`drawAimLine()`, ~index.html line 597) with an actual rendered cue stick graphic that draws in along the aim line during `aiming`/`armed`/`pulling`, and visibly pulls back/forward with `pullPower` the way a real cue stick would during the power gesture — similar in spirit to the stick shown in the Miniclip-style reference photo from the 2026-08-13 `/grilling` session (see ticket 14's Comments for that session's other settled decisions; this ticket was explicitly split out as its own effort rather than folded into ticket 14).

**Blocked by:** None, but likely sequenced after ticket 14 (rail/pocket/ball restyle) so the stick's styling can be tuned against the finished table look rather than the old flat one.

**Status:** ready-for-triage — not yet speced. This ticket is a placeholder/backlog entry; needs its own scoping pass (art style for the stick, how it animates with power pull-back, whether it disappears during ball animation, mobile/touch legibility at small sizes) before it's ready-for-agent.

## Comments

Opened 2026-08-13. Deliberately deferred out of ticket 14 — Travis wants the table depth/gloss restyle done first and the cue stick handled as a separate, later effort.
