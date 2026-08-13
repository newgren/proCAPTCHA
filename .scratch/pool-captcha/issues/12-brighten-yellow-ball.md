# 12 — Brighten the 1/9-ball yellow

**What to build:** The 1-ball (solid) and 9-ball (stripe) currently share `BALL_COLORS[1] = "#d4b106"`, a muted/dark gold that reads flat, especially against the new blue felt from ticket 07. Bump its brightness/saturation somewhat so it pops more on the table while still clearly reading as "yellow" (not white or pale gold). The same hex also drives `--accent-yellow`, which colors one quadrant of the Verification Widget icon (ticket 09) — update both together so the icon and the in-game ball stay the same shade.

**Blocked by:** None

**Status:** ready-for-human

- [x] `BALL_COLORS[1]` in `index.html` is a brighter yellow than `#d4b106`, still clearly "yellow" rather than white/pale
- [x] `--accent-yellow` CSS custom property is updated to the same new value so the icon quadrant and the 1/9 balls match
- [x] Number label / stripe rendering on the 1-ball and 9-ball stays legible against the new, brighter fill
- [ ] Manual verification via the `/run` skill — compare old vs. new shade on the table and on the widget's idle-state icon

## Comments

Opened 2026-08-13: Travis likes the new blue table color from ticket 07 but wants the yellow bumped slightly brighter.

Implemented 2026-08-13: `#d4b106` replaced with `#ffd91a` (same ~50° gold-yellow hue, saturation raised to 100% and lightness raised from ~43% to ~55%) in `BALL_COLORS[1]`, `--accent-yellow`, and the widget-brand icon's matching hardcoded quadrant fill (was previously duplicating the same hex outside the CSS var) so the in-game balls, the checking-state loader, and the idle-state icon all stay the same shade. Number labels sit on a separate off-white disc drawn on top of the ball fill, so legibility is unaffected by the fill color change. `npm test` passes (23/23). Remaining checkbox needs a human/interactive `/run` pass to eyeball the new shade.
