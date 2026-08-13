Status: ready-for-agent

# Pool CAPTCHA

## Problem Statement

Ordinary CAPTCHAs are a boring, mildly annoying speed bump — click a checkbox, maybe pick out some crosswalks. There's no reason "prove you're human" verification has to be tedious; it could be an actual, entertaining challenge to complete. The person visiting the demo wants a CAPTCHA that's funny specifically *because* it's real: to get verified, you have to win a genuine 1-on-1 game of 8-ball pool against a Computer Opponent, not just tick a box.

## Solution

A Verification Widget styled like a familiar "I'm not a robot" checkbox. Checking it expands into a connected card containing a real, playable 8-ball Challenge (mouse or touch, mobile-first). Win the Challenge under real BCA 8-ball rules and the widget shows a verified/passed state. Lose, and the widget shows a failed state with a "Try Again" button that racks a brand-new Challenge in place, no page reload required.

## User Stories

1. As a visitor, I want to see a familiar checkbox-style CAPTCHA card on page load, so that I recognize it as "a CAPTCHA" before anything unusual happens.
2. As a visitor, I want clicking the checkbox to show a brief loading spinner, so that the reveal feels like a real verification check running.
3. As a visitor, I want the checkbox card to expand into a connected card below it (with a small arrow linking them) once the spinner finishes, so that the Challenge visually reads as part of the same verification flow.
4. As a visitor, I want the Challenge to be a real pool table with balls in a standard triangle Rack, so that I immediately recognize the game as 8-ball pool.
5. As a visitor on a phone, I want the pool table to stay landscape-oriented and fit inside the widget without needing to rotate my device, so that I can play comfortably in normal portrait scrolling.
6. As a visitor, I want to always take the break shot (I always shoot first), so that every game/retry starts from an identical, predictable state.
7. As a visitor, I want to aim by dragging anywhere to rotate an aim line around the cue ball, so that setting my shot angle feels natural on both mouse and touch.
8. As a visitor, I want to set shot power by pulling back along the aim line (a power meter), releasing to fire, so that aiming and power-setting are distinct, deliberate actions.
9. As a visitor, I want dragging on the table to never scroll or zoom the page, so that aiming a shot doesn't fight my phone's browser gestures.
10. As a visitor, I want balls to bounce naturally off the cushions and slow down realistically from friction, so that the physics feels like real pool, not floaty arcade physics.
11. As a visitor, I want the table to start "open" (Group not yet assigned to either player), so that the first legally pocketed ball is what determines who's Solids and who's Stripes.
12. As a visitor, I want my Group (Solids or Stripes) to be assigned automatically the moment either player legally pockets a ball, so that I don't have to declare it manually.
13. As a visitor, I want to see whose turn it is and which Group I've been assigned, so that I always know what I'm aiming for.
14. As a visitor, I want to keep shooting as long as I keep legally pocketing my own Group's balls without fouling, so that a good run of shots doesn't hand the turn back to the Computer Opponent prematurely.
15. As a visitor, I want a clean miss (no foul, nothing pocketed) to simply pass the turn to the Computer Opponent, so that missing feels like a normal part of pool.
16. As a visitor, I want pocketing the cue ball (a Scratch) to be a Foul that gives my opponent Ball-in-Hand, so that scratching carries a real, recognizable penalty.
17. As a visitor, I want hitting a ball outside my assigned Group first (once Groups are assigned) to be a Foul (Wrong-Ball-First) that gives my opponent Ball-in-Hand, so that I can't just attack my opponent's balls.
18. As a visitor, I want a shot where no ball reaches a rail after contact (and nothing is pocketed) to be a Foul (No-Rail-After-Contact) that gives my opponent Ball-in-Hand, so that soft "safety" taps that go nowhere are penalized like real pool.
19. As a visitor granted Ball-in-Hand, I want to tap anywhere legal on the table to place the cue ball, then aim and shoot as a separate action, so that placement and aiming don't get mixed into one fumble-prone gesture.
20. As a visitor, I want to be required to call a pocket before attempting to pot the 8-ball (tapping the pocket I'm aiming for), so that the final shot has real stakes, matching how mobile pool apps handle it.
21. As a visitor, I want pocketing the 8-ball in my called pocket, after clearing my Group, with no foul on that shot, to be an immediate win (Legal Win), so that the Challenge has a clear, satisfying finish line.
22. As a visitor, I want pocketing the 8-ball before I've cleared my Group (an Early Pot) to be an immediate loss, so that the classic "don't sink the 8 early" tension of real pool is present.
23. As a visitor, I want pocketing the 8-ball in the wrong (uncalled) pocket to be an immediate loss, so that calling my shot actually matters.
24. As a visitor, I want fouling on the same shot where I pocket the 8-ball (e.g. scratching while potting it) to be an immediate loss even if it went in the right pocket, so that the 8-ball shot carries real risk.
25. As a visitor, I want to watch the Computer Opponent's turn play out with the same visuals as my own turn (aim line, power pull-back, ball movement), so that it reads as a real opponent taking a real shot, not a scripted cutscene.
26. As a visitor, I want the Computer Opponent to go for the clearest/easiest shot among its remaining Group balls, so that its behavior looks like sensible, intentional play rather than random flailing.
27. As a visitor, I want the Computer Opponent to make its shot roughly 90% of the time (with occasional realistic misses), so that it's genuinely beatable without feeling like a pushover.
28. As a visitor, I want the same Foul, Ball-in-Hand, and win/loss rules to apply to the Computer Opponent's turns as apply to mine, so that the game feels fair in both directions.
29. As a visitor who wins, I want the widget to show a clear "verified" success state (e.g. a checkmark), so that the payoff of winning is obvious and satisfying.
30. As a visitor who loses, I want the widget to show a clear failure state with a "Try Again" button, so that I can immediately rack a new Challenge without reloading the page.
31. As a visitor, I want "Try Again" to fully reset the table to a fresh Rack with me breaking again, so that every retry is a clean, fair new game.
32. As a visitor, I want the Verification Widget's icon and wordmark to be original (not Google's actual reCAPTCHA logo), so that the joke reads as a parody rather than an impersonation of a real product.
33. As a developer, I want the game/physics/rules logic isolated from all rendering and DOM code, so that the rules engine can be unit tested without a browser.

## Implementation Decisions

**Files & seam.** Two files, no bundler, no framework, no build step, no third-party dependencies:
- `game.js` — a dependency-free ES module owning all state, physics, and rules logic. Exposes two entry points that form the tested seam:
  - `simulateShot(state, shot)` → `{ state: newState, events: Event[] }`. Runs the full physics simulation for one shot (cue ball struck with a given angle/power, or the Computer Opponent's shot) through to rest, then evaluates BCA rules against what happened. Emits structured events such as: ball pocketed (per ball), Group assigned, Foul (with a reason: Scratch / Wrong-Ball-First / No-Rail-After-Contact), Legal Win, Early Pot loss, uncalled-pocket loss, turn continues, turn passes.
  - `chooseComputerShot(state)` → `shot`. Pure decision function: scans the Computer Opponent's remaining Group balls (or, on an Open Table, all remaining object balls), picks the one with the clearest/least-obstructed line to any pocket ("Easiest Shot"), returns an angle/power/called-pocket (the last only when the 8-ball is the target) with a small randomized inaccuracy applied so real-shot accuracy lands around 90%.
- `index.html` — canvas rendering, pointer/touch input handling (two-phase aim-then-power drag, tap-to-place for Ball-in-Hand, tap-to-call-pocket for the 8-ball), the Verification Widget shell/animation states (checkbox → spinner → expand → pass/fail → Try Again), and orchestration (calling `simulateShot`/`chooseComputerShot` and driving the animation from their results). This file is the sole browser consumer of `game.js`.

**Rules engine (BCA subset — see ADR-0001).** Enforced: Scratch, Wrong-Ball-First (only once a Group is assigned; inapplicable on an Open Table), No-Rail-After-Contact — each a Foul granting the opponent Ball-in-Hand. Explicitly not enforced: the break-specific 4-balls-to-a-rail foul, calling the pocket on any shot other than the 8-ball, and any off-table-ball foul (not reachable under this physics model regardless).

**Turn flow.** Legally pocketing one or more of your own Group's balls with no Foul on that shot keeps your turn. A clean miss (nothing pocketed, no Foul) passes the turn with no penalty. Any Foul passes the turn and grants the opponent Ball-in-Hand (cue ball placed anywhere legal on the table, via tap-to-place, before their next shot). Groups are assigned the instant either player's shot legally pockets a ball while the table is Open; Wrong-Ball-First checks only apply after that point.

**8-ball shot resolution.** Once a shooter has cleared their Group, their next shot targeting the 8-ball requires a Called Pocket (tap a pocket before shooting). Outcomes: potted in the called pocket with no foul on that shot → Legal Win for the shooter; potted in any other pocket → immediate loss for the shooter; potted while fouling on that same shot (e.g. a scratch) → immediate loss for the shooter regardless of pocket; potted before the shooter's Group is cleared (by either player, at any point) → Early Pot, immediate loss for whoever pocketed it; not potted, no foul → normal turn-passing rules apply.

**Computer Opponent.** Not literally AI/ML — a scripted heuristic (`chooseComputerShot`). Single fixed difficulty tier, no difficulty dial. Its turn runs through the exact same `simulateShot`/rules path as the player's, then plays out with the same rendering/animation as a player shot (aim line draws in, power pulls back, balls roll) — no shortcut/instant-resolve path, no artificial "thinking" delay.

**Aiming & input.** Two-phase gesture: (1) drag anywhere to rotate an aim line around the cue ball (angle only), (2) pull back along that line as a power meter, release to fire. Ball-in-Hand placement is a separate tap-to-place step, followed by the normal two-phase aim-shoot. Touch handling disables page scroll/pinch-zoom over the canvas area so dragging never fights native browser gestures.

**Table orientation.** Always landscape, letterboxed to fit inside a landscape-shaped Verification Widget card even on a portrait phone screen — never rotated to a vertical layout.

**Verification Widget states.** Checkbox card (idle) → brief spinner on click → expands into a connected card below (small arrow linking the two, matching the wesbos/Kitboga-captcha structural reference) containing the live Challenge → on Legal Win, a verified/checkmark success state → on any loss, a failure state with a "Try Again" button that racks a fresh game (new `game.js` state, player breaks again) in place without a page reload.

**Iconography (see ADR-0002).** The widget's icon/wordmark are original, not Google's actual reCAPTCHA logo/branding — same layout and interaction pattern as the visual/structural references, different assets.

## Testing Decisions

A good test here exercises `simulateShot`/`chooseComputerShot` purely through their public input (a `state` object plus a `shot`) and asserts on their output (`{ state, events }`) — never on internal physics intermediate steps (per-frame ball positions mid-simulation, internal collision math) or on rendering. This keeps tests stable against internal refactors of the physics stepping.

- **Module under test**: `game.js` only, via its two exported entry points. No canvas, DOM, or animation code is exercised.
- **Tool**: Node's built-in `node:test` + `node:assert`, run directly against the ES module with no bundler, transpiler, or third-party test framework — consistent with the project's zero-dependency, zero-build-step posture.
- **Approach**: construct contrived `state` objects (hand-placed ball positions covering scenarios like: guaranteed Scratch, guaranteed Wrong-Ball-First, a shot with no rail contact, a clean Legal Win setup, an Early Pot setup, an uncalled-pocket 8-ball pot, a Computer Opponent state with exactly one clear shot available) and assert on the emitted `events` and resulting `state`.
- **Prior art**: none in this repo — it's a greenfield project. No existing test conventions to match.
- Rendering, input handling, and the Verification Widget's visual states are not covered by automated tests; verify those manually by running the page (e.g. via the `/run` skill) and playing through a full game.

## Out of Scope

- The break-specific "4 balls must reach a rail" BCA foul (see ADR-0001)
- Calling the pocket on any shot other than the 8-ball
- Any foul for a ball leaving the table (not reachable under this physics model)
- Alternating or randomized break assignment — the player always breaks
- A difficulty dial or multiple Computer Opponent difficulty tiers — one fixed tuning (~90% accuracy, easiest-shot heuristic)
- Sound effects or music
- Any real gated content/page behind a Legal Win — the "verified" state is cosmetic only, nothing is actually being protected
- Reproducing Google's actual reCAPTCHA logo, wordmark, or branding (see ADR-0002)
- Automated browser/rendering/end-to-end tests — covered by manual play-testing only
- Multiplayer, networking, persistence, or score/history tracking across games

## Further Notes

Domain vocabulary (Verification Widget, Challenge, Rack, Group, Open Table, Foul, Scratch, Wrong-Ball-First, No-Rail-After-Contact, Ball-in-Hand, Called Pocket, Legal Win, Early Pot, Try Again, Computer Opponent) is defined in `CONTEXT.md` at the repo root — use those exact terms in any follow-on tickets or code review. Two ADRs in `docs/adr/` bear directly on this spec: `0001-bca-rule-subset.md` (which real BCA rules are enforced vs. skipped) and `0002-original-captcha-iconography.md` (why the widget doesn't reproduce Google's real branding, and a note not to "fix" that later). Both resulted from a `/grilling` + `/grill-with-docs` session on 2026-08-12.
