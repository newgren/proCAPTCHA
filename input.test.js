import { test } from "node:test";
import assert from "node:assert/strict";
import {
  classifyReaimGesture,
  NEAR_CUE_RADIUS,
  REAIM_DEADZONE,
  MAX_PULL,
} from "./input.js";

// A fixed cue ball position and locked aim angle (pointing along +x, i.e. "forward"
// is +x and "straight back" is -x) shared by most cases below.
const CUE = { x: 500, y: 250 };
const AIM_ANGLE = 0;

function classify(gestureStart, pointer, overrides = {}) {
  return classifyReaimGesture({
    cue: CUE,
    aimAngle: AIM_ANGLE,
    gestureStart,
    pointer,
    ...overrides,
  });
}

test("bare tap/click with ~zero movement near the cue ball while armed: undecided, no pull, no re-aim", () => {
  const start = { x: 505, y: 252 }; // a few units off the cue ball's exact pixel, like a real click
  const result = classify(start, start);
  assert.equal(result.type, "undecided");
});

test("a tiny jitter under the deadzone near the cue ball is still undecided", () => {
  const start = { x: 505, y: 252 };
  const pointer = { x: start.x - (REAIM_DEADZONE - 1), y: start.y };
  const result = classify(start, pointer);
  assert.equal(result.type, "undecided");
});

test("drag starting near the cue ball, roughly backward along the aim line: recognized as a pull, power scales with distance", () => {
  const start = { x: 508, y: 246 }; // near the cue ball, not its exact pixel
  const near = classify(start, { x: start.x - 40, y: start.y + 2 });
  assert.equal(near.type, "pull");
  assert.ok(near.power > 0 && near.power < 1);

  const farther = classify(start, { x: start.x - 120, y: start.y + 2 });
  assert.equal(farther.type, "pull");
  assert.ok(farther.power > near.power, "power should increase as the pull-back drags farther");
});

test("a full pull-back reaching MAX_PULL fires at (or clamped to) full power", () => {
  const start = { x: 500, y: 250 };
  const atMax = classify(start, { x: start.x - MAX_PULL, y: start.y });
  assert.equal(atMax.type, "pull");
  assert.ok(atMax.power >= 0.99, `expected power near 1, got ${atMax.power}`);

  const overshoot = classify(start, { x: start.x - MAX_PULL - 200, y: start.y });
  assert.equal(overshoot.type, "pull");
  assert.equal(overshoot.power, 1, "power should clamp at 1, not exceed it");
});

test("drag starting near the cue ball but sideways (perpendicular to the aim line): recognized as a re-aim, not a pull", () => {
  const start = { x: 505, y: 252 };
  const result = classify(start, { x: start.x, y: start.y + 100 });
  assert.equal(result.type, "reaim");
  assert.ok(typeof result.angle === "number");
});

test("drag starting near the cue ball but forward (toward the target, not backward): recognized as a re-aim, not a pull", () => {
  const start = { x: 505, y: 252 };
  const result = classify(start, { x: start.x + 100, y: start.y });
  assert.equal(result.type, "reaim");
});

test("re-aim angle is measured from the cue ball to the current pointer, not from the gesture start", () => {
  const start = { x: 505, y: 252 };
  const pointer = { x: start.x, y: start.y + 100 };
  const result = classify(start, pointer);
  assert.equal(result.type, "reaim");
  const expectedAngle = Math.atan2(pointer.y - CUE.y, pointer.x - CUE.x);
  assert.ok(Math.abs(result.angle - expectedAngle) < 1e-9);
});

test("a pointerdown that lands away from the cue ball is a re-aim immediately, before any drag movement", () => {
  const start = { x: 750, y: 150 }; // far from the cue ball, a plausible click elsewhere on the table
  const result = classify(start, start);
  assert.equal(result.type, "reaim");
  const expectedAngle = Math.atan2(start.y - CUE.y, start.x - CUE.x);
  assert.ok(Math.abs(result.angle - expectedAngle) < 1e-9);
});

test("a drag starting away from the cue ball, dragged in the exact direction that would fool the old direction-only cone check, is still a re-aim", () => {
  // Mirrors Travis's real bug report: the second pointerdown lands somewhere on the
  // table that is NOT the cue ball, then the player drags in a direction that happens
  // to point numerically "backward" relative to the locked aim line. A direction-only
  // heuristic computed from this arbitrary start point reads this as a pull-back.
  const start = { x: 750, y: 150 }; // far from CUE = (500, 250)
  // Drag straight in the -x direction, which is exactly AIM_ANGLE's "back" direction —
  // this is the case that fools a cone check anchored at `start` instead of the cue ball.
  const pointer = { x: start.x - 100, y: start.y };
  const result = classify(start, pointer);
  assert.equal(result.type, "reaim", "a drag starting away from the cue ball must never be read as a pull-back");
});

test("drags starting away from the cue ball are always a re-aim, regardless of direction", () => {
  const start = { x: 200, y: 400 }; // far from CUE = (500, 250), a different spot than other cases
  const directions = [
    { x: start.x - 80, y: start.y }, // "backward"-looking relative to AIM_ANGLE
    { x: start.x + 80, y: start.y }, // "forward"-looking
    { x: start.x, y: start.y - 80 }, // sideways
    { x: start.x - 60, y: start.y - 60 }, // diagonal, inside the old 45deg cone
  ];
  for (const pointer of directions) {
    const result = classify(start, pointer);
    assert.equal(
      result.type,
      "reaim",
      `expected re-aim for drag from (${start.x},${start.y}) to (${pointer.x},${pointer.y}), got ${result.type}`
    );
  }
});

test("gesture start just inside the near-cue radius is a pull candidate; just outside is an immediate re-aim", () => {
  const insideStart = { x: CUE.x + (NEAR_CUE_RADIUS - 5), y: CUE.y };
  const insideResult = classify(insideStart, insideStart);
  assert.equal(insideResult.type, "undecided", "just inside the radius should still be a candidate pull (undecided at zero movement)");

  const outsideStart = { x: CUE.x + (NEAR_CUE_RADIUS + 5), y: CUE.y };
  const outsideResult = classify(outsideStart, outsideStart);
  assert.equal(outsideResult.type, "reaim", "just outside the radius should immediately re-aim");
});
