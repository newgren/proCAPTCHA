import { test } from "node:test";
import assert from "node:assert/strict";
import { simulateShot, createInitialState, TABLE, BALL_RADIUS } from "./game.js";

function bareState(balls) {
  return {
    balls,
    turn: "A",
    groups: { A: null, B: null },
    tableOpen: true,
    ballInHand: null,
    calledPocket: null,
    gameOver: null,
  };
}

test("createInitialState racks a cue ball and 15 numbered balls", () => {
  const state = createInitialState();
  assert.equal(state.balls.length, 16);
  assert.ok(state.balls.find((b) => b.id === "cue"));
  for (let n = 1; n <= 15; n++) {
    assert.ok(state.balls.find((b) => b.id === String(n)), `missing ball ${n}`);
  }
});

test("cushion bounce: ball reflects off a rail instead of tunneling through", () => {
  const state = bareState([
    { id: "cue", x: 100, y: TABLE.height / 2, vx: 0, vy: 0, pocketed: false, group: "cue" },
  ]);
  const { frames } = simulateShot(state, { angle: 0, power: 1 });

  const cueFrames = frames.map((f) => f.balls[0]);
  const maxX = Math.max(...cueFrames.map((b) => b.x));
  assert.ok(maxX <= TABLE.width - BALL_RADIUS + 1, `ball tunneled through wall, maxX=${maxX}`);

  const last = cueFrames[cueFrames.length - 1];
  assert.ok(Math.abs(last.vx) < 0.01 && Math.abs(last.vy) < 0.01, "ball did not come to rest");

  let sawPositive = false;
  let bounced = false;
  for (const b of cueFrames) {
    if (b.vx > 1) sawPositive = true;
    if (sawPositive && b.vx < -1) bounced = true;
  }
  assert.ok(bounced, "ball never reversed direction off the cushion");
});

test("ball-ball collision: cue transfers momentum to the object ball", () => {
  const state = bareState([
    { id: "cue", x: 200, y: 250, vx: 0, vy: 0, pocketed: false, group: "cue" },
    { id: "1", x: 400, y: 250, vx: 0, vy: 0, pocketed: false, group: "solid" },
  ]);
  const { state: result } = simulateShot(state, { angle: 0, power: 0.7 });

  const cue = result.balls.find((b) => b.id === "cue");
  const obj = result.balls.find((b) => b.id === "1");

  assert.ok(obj.x > 400, "object ball did not move forward");
  assert.ok(cue.x < obj.x, "cue ball ended up ahead of the object ball");
  assert.ok(Math.abs(cue.vx) < 0.01 && Math.abs(obj.vx) < 0.01, "balls did not settle to rest");
});

test("friction: a ball shot with modest power comes to rest on its own, not by hitting the step cap", () => {
  const state = bareState([
    { id: "cue", x: 500, y: 250, vx: 0, vy: 0, pocketed: false, group: "cue" },
  ]);
  const { frames } = simulateShot(state, { angle: Math.PI / 2, power: 0.15 });

  assert.ok(frames.length < 400, `took too long to stop (${frames.length} frames) — friction may not be applied`);
  const last = frames[frames.length - 1].balls[0];
  assert.ok(Math.abs(last.vx) < 0.01 && Math.abs(last.vy) < 0.01);
  assert.ok(last.y > 250, "ball did not move at all");
});

test("pocket capture: an object ball hit toward a pocket is removed from play", () => {
  const state = bareState([
    { id: "cue", x: 300, y: 300, vx: 0, vy: 0, pocketed: false, group: "cue" },
    { id: "1", x: 150, y: 150, vx: 0, vy: 0, pocketed: false, group: "solid" },
  ]);
  const angle = Math.atan2(150 - 300, 150 - 300);
  const { state: result, events } = simulateShot(state, { angle, power: 1 });

  const obj = result.balls.find((b) => b.id === "1");
  assert.equal(obj.pocketed, true);
  assert.ok(events.some((e) => e.type === "pocketed" && e.ballId === "1"));
});
