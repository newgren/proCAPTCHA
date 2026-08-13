# 01 — Physics sandbox foundation

**What to build:** Establish the `game.js`/`index.html` seam. A bare page renders a landscape, letterboxed pool table with a full Rack of balls. Pointer-based input (unified mouse/touch from the start, so mobile-first is baked into the foundation rather than retrofitted) drives the two-phase gesture: drag to rotate an aim line around the cue ball, then pull back along that line as a power meter, release to fire. The canvas disables page scroll/pinch-zoom so dragging never fights the browser. Balls collide with each other and the cushions, slow down via friction, and are removed from play once pocketed. No turns, no fouls, no rules, no Computer Opponent yet — the cue ball can just be shot repeatedly.

**Blocked by:** None — can start immediately

**Status:** ready-for-agent

- [ ] `game.js` exists as a dependency-free ES module; `index.html` is its only browser consumer
- [ ] `simulateShot(state, shot)` runs a full physics simulation (cue ball struck at a given angle/power) through to rest and returns the resulting state
- [ ] Page loads showing a landscape-oriented table with a standard 15-ball triangle Rack plus cue ball, letterboxed to fit within a portrait phone screen
- [ ] Dragging on the table rotates a visible aim line around the cue ball; pulling back along that line shows a power indicator; releasing fires the shot
- [ ] Touch and mouse input both work identically via the same input handling path
- [ ] Dragging on the canvas never scrolls or zooms the page
- [ ] Balls bounce off cushions and off each other, decelerating from friction to a natural stop
- [ ] A ball reaching a pocket is removed from play
- [ ] `node:test` unit tests cover `simulateShot`'s physics behavior: cushion bounce, ball-ball collision, friction deceleration, and pocket detection — run via Node directly, no bundler or test framework dependency
