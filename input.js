// Pure, DOM-free gesture classifier for the aim -> armed -> pull-back input flow.
// No canvas, no pointer events — takes plain positions/angles in and returns a
// classification. See index.html's pointerdown/pointermove/pointerup listeners
// for how this gets wired to the actual gesture.
//
// Ticket 13: two prior fixes classified a post-armed drag as a pull-back vs. a
// re-aim using *only* the drag's direction relative to the locked aim angle —
// first a sign check, then a 45° cone. Both were computed relative to wherever
// the second pointerdown happened to land, which is never required to be near
// the cue ball (the original idle -> aiming gesture already lets a player click
// anywhere on the canvas to aim, and players do the same thing to re-aim). A
// second click landing away from the cue ball can have a direction, relative to
// that arbitrary start point, that coincidentally falls inside any "back" cone
// — no angle threshold fixes that.
//
// The fix here is structural, not another angle tweak: WHERE the gesture starts
// decides everything. A pointerdown landing close to the cue ball begins a
// candidate pull-back (existing deadzone + alignment-cone logic applies from
// there, since at that point the start position stands in for the cue ball's
// position closely enough). A pointerdown landing anywhere else on the table is
// unconditionally a re-aim, immediately, regardless of which way it's later
// dragged — that's what makes the "drag in a direction that would fool the old
// cone" case impossible to misclassify.

export const NEAR_CUE_RADIUS = 60; // table units; how close a second pointerdown must land to the cue ball to be a pull-back candidate at all
export const REAIM_DEADZONE = 10; // table units a pull candidate must move before it commits to pull vs. re-aim
export const PULL_ALIGNMENT_MIN = Math.cos(Math.PI / 4); // drag must stay within 45° of straight-back to count as a pull
export const MAX_PULL = 220; // table units of drag distance mapping to full power

export function classifyReaimGesture({
  cue,
  aimAngle,
  gestureStart,
  pointer,
  nearCueRadius = NEAR_CUE_RADIUS,
  deadzone = REAIM_DEADZONE,
  alignmentMin = PULL_ALIGNMENT_MIN,
  maxPull = MAX_PULL,
}) {
  const aimTowardPointer = () => Math.atan2(pointer.y - cue.y, pointer.x - cue.x);

  const startDistFromCue = Math.hypot(gestureStart.x - cue.x, gestureStart.y - cue.y);
  if (startDistFromCue > nearCueRadius) {
    // Gesture didn't start near the cue ball: never a pull-back candidate, no
    // matter which way it's dragged. Re-enter aiming immediately, same as the
    // original idle -> aiming gesture.
    return { type: "reaim", angle: aimTowardPointer() };
  }

  // Gesture started near the cue ball: it's a candidate pull-back. Fall back to
  // the existing deadzone + alignment-cone logic to distinguish an actual
  // backward pull from a re-aim that happens to start right by the cue ball.
  const dx = pointer.x - gestureStart.x;
  const dy = pointer.y - gestureStart.y;
  const dragDist = Math.hypot(dx, dy);

  if (dragDist < deadzone) {
    return { type: "undecided" };
  }

  const backX = -Math.cos(aimAngle);
  const backY = -Math.sin(aimAngle);
  const pulled = dx * backX + dy * backY;
  const alignment = pulled / dragDist;

  if (alignment > alignmentMin) {
    return { type: "pull", power: Math.max(0, Math.min(1, pulled / maxPull)) };
  }

  return { type: "reaim", angle: aimTowardPointer() };
}
