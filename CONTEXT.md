# Pool CAPTCHA

A joke CAPTCHA demo: to verify as human, the user must win a game of 8-ball pool against a computer opponent.

## Language

**Verification Widget**:
The CAPTCHA-styled UI shell — a checkbox card that expands into a connected card holding the Challenge.
_Avoid_: CAPTCHA box, widget

**Challenge**:
The pool game itself — the thing the user must complete to pass verification.
_Avoid_: game, the pool thing

**Computer Opponent**:
The scripted, non-ML opponent the user plays against. On its turn it selects the Easiest Shot among its own Group's remaining balls and executes it with ~90% accuracy.
_Avoid_: AI, AI opponent, bot

**Rack**:
A fresh set of 15 object balls plus the cue ball in starting triangle formation, at the start of a Challenge.

**Group**:
A player's assigned set of balls — Solids (1-7) or Stripes (9-15) — determined by the first ball either player legally pockets after an Open Table.
_Avoid_: suit, category, type

**Open Table**:
The state before any Group has been assigned. Either player may legally strike any object ball; Wrong-Ball-First does not apply yet.

**Foul**:
An illegal shot outcome that grants the opponent Ball-in-Hand. The enforced fouls are Scratch, Wrong-Ball-First, and No-Rail-After-Contact.

**Scratch**:
A Foul where the cue ball is pocketed on a shot.

**Wrong-Ball-First**:
A Foul where the cue ball's first contact is with a ball outside the shooter's Group. Only applies once Groups are assigned (not on an Open Table).

**No-Rail-After-Contact**:
A Foul where, after the cue ball contacts an object ball, no ball reaches a rail and no ball is pocketed.

**Ball-in-Hand**:
The right to place the cue ball anywhere on the table before the next shot, granted to a player after their opponent commits a Foul.

**Called Pocket**:
The pocket the shooter designates before attempting to pot the 8-ball. Required only for the 8-ball shot, not for any other shot.

**Legal Win**:
The shooter pockets the 8-ball in the Called Pocket, after having cleared their Group, without fouling on that shot.

**Early Pot**:
The 8-ball is pocketed before the shooter has cleared their Group. Immediate loss for whichever player pocketed it.

**Try Again**:
The retry action shown after a failed Challenge. Racks a brand-new game inside the same Verification Widget, without a page reload.
