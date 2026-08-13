// Pure state/physics/rules engine — no DOM, no canvas, no rendering.
// See CONTEXT.md for domain vocabulary (Rack, Group, Foul, etc.)

export const TABLE = { width: 1000, height: 500 };
export const BALL_RADIUS = 15;
export const POCKET_CAPTURE_RADIUS = 34;

export const POCKETS = [
  { x: 0, y: 0 },
  { x: TABLE.width / 2, y: 0 },
  { x: TABLE.width, y: 0 },
  { x: 0, y: TABLE.height },
  { x: TABLE.width / 2, y: TABLE.height },
  { x: TABLE.width, y: TABLE.height },
];

const CUSHION_RESTITUTION = 0.82;
const FRICTION_DECEL = 230; // units/s^2
const MAX_SHOT_SPEED = 900;
const STOP_SPEED = 3;
export const DT = 1 / 120;
const MAX_STEPS = 900;

function groupForBallId(id) {
  if (id === "cue") return "cue";
  const n = Number(id);
  if (n === 8) return "eight";
  return n <= 7 ? "solid" : "stripe";
}

function shuffled(array) {
  const copy = array.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function createInitialState() {
  const D = BALL_RADIUS * 2;
  const rowSpacing = D * Math.sin(Math.PI / 3);
  const apexX = TABLE.width * 0.75;
  const centerY = TABLE.height / 2;

  const remaining = shuffled([2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15]);
  const balls = [
    { id: "cue", x: TABLE.width * 0.25, y: centerY, vx: 0, vy: 0, pocketed: false, group: "cue" },
  ];

  for (let row = 0; row < 5; row++) {
    const count = row + 1;
    const x = apexX + row * rowSpacing;
    for (let i = 0; i < count; i++) {
      const y = centerY - (count - 1) * BALL_RADIUS + i * D;
      let id;
      if (row === 0) id = "1";
      else if (row === 2 && i === 1) id = "8";
      else id = String(remaining.pop());
      balls.push({ id, x, y, vx: 0, vy: 0, pocketed: false, group: groupForBallId(id) });
    }
  }

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

function cloneState(state) {
  return {
    ...state,
    balls: state.balls.map((b) => ({ ...b })),
    groups: { ...state.groups },
  };
}

function speed(b) {
  return Math.hypot(b.vx, b.vy);
}

function totalSpeed(balls) {
  return balls.reduce((sum, b) => sum + (b.pocketed ? 0 : speed(b)), 0);
}

function applyFriction(b, dt) {
  const s = speed(b);
  if (s === 0) return;
  const drop = FRICTION_DECEL * dt;
  const newSpeed = Math.max(0, s - drop);
  const scale = newSpeed / s;
  b.vx *= scale;
  b.vy *= scale;
}

function resolveCushions(b, railHits) {
  let hit = false;
  if (b.x - BALL_RADIUS < 0) {
    b.x = BALL_RADIUS;
    b.vx = -b.vx * CUSHION_RESTITUTION;
    hit = true;
  } else if (b.x + BALL_RADIUS > TABLE.width) {
    b.x = TABLE.width - BALL_RADIUS;
    b.vx = -b.vx * CUSHION_RESTITUTION;
    hit = true;
  }
  if (b.y - BALL_RADIUS < 0) {
    b.y = BALL_RADIUS;
    b.vy = -b.vy * CUSHION_RESTITUTION;
    hit = true;
  } else if (b.y + BALL_RADIUS > TABLE.height) {
    b.y = TABLE.height - BALL_RADIUS;
    b.vy = -b.vy * CUSHION_RESTITUTION;
    hit = true;
  }
  if (hit) railHits.add(b.id);
}

function resolvePocket(b) {
  for (let i = 0; i < POCKETS.length; i++) {
    const pocket = POCKETS[i];
    if (Math.hypot(b.x - pocket.x, b.y - pocket.y) <= POCKET_CAPTURE_RADIUS) {
      return i;
    }
  }
  return -1;
}

function resolveBallCollisions(balls, contacts) {
  for (let i = 0; i < balls.length; i++) {
    const a = balls[i];
    if (a.pocketed) continue;
    for (let j = i + 1; j < balls.length; j++) {
      const b = balls[j];
      if (b.pocketed) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy);
      const minDist = BALL_RADIUS * 2;
      if (dist > 0 && dist < minDist) {
        const nx = dx / dist;
        const ny = dy / dist;

        const overlap = minDist - dist;
        a.x -= (nx * overlap) / 2;
        a.y -= (ny * overlap) / 2;
        b.x += (nx * overlap) / 2;
        b.y += (ny * overlap) / 2;

        const relVel = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
        if (relVel > 0) {
          a.vx -= relVel * nx;
          a.vy -= relVel * ny;
          b.vx += relVel * nx;
          b.vy += relVel * ny;
          contacts.push([a.id, b.id]);
        }
      }
    }
  }
}

function groupCleared(balls, group) {
  if (!group) return false;
  const groupBalls = balls.filter((b) => b.group === group);
  return groupBalls.length > 0 && groupBalls.every((b) => b.pocketed);
}

export function simulateShot(state, shot) {
  if (state.gameOver) {
    return { state, events: [{ type: "shotRejected", reason: "game-over" }], frames: [], shotSummary: {} };
  }

  const shooterGroup = state.groups[state.turn];
  if (shooterGroup && groupCleared(state.balls, shooterGroup) && state.calledPocket == null) {
    return {
      state,
      events: [{ type: "shotRejected", reason: "call-pocket-required" }],
      frames: [],
      shotSummary: {},
    };
  }

  const balls = state.balls.map((b) => ({ ...b }));
  const cue = balls.find((b) => b.id === "cue");

  const clampedPower = Math.max(0, Math.min(1, shot.power));
  const sp = clampedPower * MAX_SHOT_SPEED;
  cue.vx = Math.cos(shot.angle) * sp;
  cue.vy = Math.sin(shot.angle) * sp;

  const frames = [];
  const events = [];
  let firstContactBallId = null;
  let railContactAfterFirstContact = false;
  let anyRailContact = false;

  for (let step = 0; step < MAX_STEPS; step++) {
    for (const b of balls) {
      if (b.pocketed) continue;
      b.x += b.vx * DT;
      b.y += b.vy * DT;
      applyFriction(b, DT);
    }

    const contacts = [];
    resolveBallCollisions(balls, contacts);
    for (const [id1, id2] of contacts) {
      if (firstContactBallId === null) {
        if (id1 === "cue") firstContactBallId = id2;
        else if (id2 === "cue") firstContactBallId = id1;
      }
    }

    const railHits = new Set();
    for (const b of balls) {
      if (b.pocketed) continue;
      resolveCushions(b, railHits);
    }
    if (railHits.size > 0) {
      anyRailContact = true;
      if (firstContactBallId !== null) railContactAfterFirstContact = true;
    }

    for (const b of balls) {
      if (b.pocketed) continue;
      const pocketIndex = resolvePocket(b);
      if (pocketIndex !== -1) {
        b.pocketed = true;
        b.vx = 0;
        b.vy = 0;
        events.push({ type: "pocketed", ballId: b.id, pocketIndex });
      }
    }

    frames.push({
      balls: balls.map((b) => ({ id: b.id, x: b.x, y: b.y, vx: b.vx, vy: b.vy, pocketed: b.pocketed })),
    });

    if (totalSpeed(balls) < STOP_SPEED) {
      for (const b of balls) {
        b.vx = 0;
        b.vy = 0;
      }
      frames.push({
        balls: balls.map((b) => ({ id: b.id, x: b.x, y: b.y, vx: b.vx, vy: b.vy, pocketed: b.pocketed })),
      });
      break;
    }
  }

  const newState = cloneState(state);
  newState.balls = balls;

  applyRules(state, newState, events, {
    firstContactBallId,
    railContactAfterFirstContact,
    anyRailContact,
  });

  return {
    state: newState,
    events,
    frames,
    shotSummary: { firstContactBallId, railContactAfterFirstContact, anyRailContact },
  };
}

function otherSide(side) {
  return side === "A" ? "B" : "A";
}

function applyRules(prevState, newState, events, shotSummary) {
  const shooter = prevState.turn;
  const opponent = otherSide(shooter);
  const wasOpen = prevState.tableOpen;
  const shooterGroupBefore = prevState.groups[shooter];

  const pocketedIds = events.filter((e) => e.type === "pocketed").map((e) => e.ballId);
  const cueScratched = pocketedIds.includes("cue");
  const legallyPocketedGroupBalls = pocketedIds.filter((id) => id !== "cue" && id !== "8");

  newState.calledPocket = null;

  if (wasOpen && legallyPocketedGroupBalls.length > 0) {
    const distinctGroups = new Set(legallyPocketedGroupBalls.map((id) => groupForBallId(id)));
    if (distinctGroups.size === 1) {
      const assigned = [...distinctGroups][0];
      newState.groups[shooter] = assigned;
      newState.groups[opponent] = assigned === "solid" ? "stripe" : "solid";
      newState.tableOpen = false;
      events.push({ type: "groupsAssigned", groups: { ...newState.groups } });
    }
  }

  let foul = null;
  if (cueScratched) {
    foul = "scratch";
  } else if (!wasOpen) {
    const requiredFirstContactGroup = groupCleared(prevState.balls, shooterGroupBefore)
      ? "eight"
      : shooterGroupBefore;
    const firstGroup = shotSummary.firstContactBallId ? groupForBallId(shotSummary.firstContactBallId) : null;
    if (firstGroup !== requiredFirstContactGroup) {
      foul = "wrong-ball-first";
    }
  }
  if (!foul) {
    const railOk = shotSummary.firstContactBallId
      ? shotSummary.railContactAfterFirstContact
      : shotSummary.anyRailContact;
    if (pocketedIds.length === 0 && !railOk) {
      foul = "no-rail-after-contact";
    }
  }

  const eightPocketedEvent = events.find((e) => e.type === "pocketed" && e.ballId === "8");
  if (eightPocketedEvent) {
    const groupWasCleared = groupCleared(prevState.balls, shooterGroupBefore);
    let outcome;
    if (!groupWasCleared) {
      outcome = "early-pot";
    } else if (foul) {
      outcome = "foul-on-eight";
    } else if (eightPocketedEvent.pocketIndex === prevState.calledPocket) {
      outcome = "legal-win";
    } else {
      outcome = "wrong-pocket";
    }

    const winner = outcome === "legal-win" ? shooter : opponent;
    const loser = outcome === "legal-win" ? opponent : shooter;
    newState.turn = null;
    newState.ballInHand = null;
    newState.gameOver = { winner, loser, reason: outcome };
    events.push({ type: "gameOver", winner, loser, reason: outcome });
    return;
  }

  if (foul) {
    events.push({ type: "foul", reason: foul });
    events.push({ type: "ballInHand", side: opponent });
    newState.turn = opponent;
    newState.ballInHand = opponent;
    events.push({ type: "turnPasses", from: shooter, to: opponent });
    return;
  }

  const shooterGroupNow = newState.groups[shooter];
  const pocketedOwn = legallyPocketedGroupBalls.some((id) => groupForBallId(id) === shooterGroupNow);
  const legalContinue = newState.tableOpen ? legallyPocketedGroupBalls.length > 0 : pocketedOwn;

  newState.ballInHand = null;
  if (legalContinue) {
    newState.turn = shooter;
    events.push({ type: "turnContinues", side: shooter });
  } else {
    newState.turn = opponent;
    events.push({ type: "turnPasses", from: shooter, to: opponent });
  }
}

export function placeCueBall(state, x, y) {
  const newState = cloneState(state);
  const cue = newState.balls.find((b) => b.id === "cue");
  cue.x = Math.max(BALL_RADIUS, Math.min(TABLE.width - BALL_RADIUS, x));
  cue.y = Math.max(BALL_RADIUS, Math.min(TABLE.height - BALL_RADIUS, y));
  cue.vx = 0;
  cue.vy = 0;
  cue.pocketed = false;
  newState.ballInHand = null;
  return newState;
}

export function callPocket(state, pocketIndex) {
  const newState = cloneState(state);
  newState.calledPocket = pocketIndex;
  return newState;
}

export function isEightBallShot(state) {
  const shooterGroup = state.groups[state.turn];
  return Boolean(shooterGroup) && groupCleared(state.balls, shooterGroup);
}

const MAX_CUT_ANGLE = Math.PI * 0.47; // ~85 degrees; beyond this a cut is not physically makeable
const COMPUTER_MISS_CHANCE = 0.1;

function segmentBlocked(ax, ay, bx, by, balls, excludeIds) {
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy);
  if (len === 0) return false;
  const ux = dx / len;
  const uy = dy / len;

  for (const ball of balls) {
    if (ball.pocketed || excludeIds.includes(ball.id)) continue;
    const t = (ball.x - ax) * ux + (ball.y - ay) * uy;
    if (t <= 0 || t >= len) continue;
    const closestX = ax + ux * t;
    const closestY = ay + uy * t;
    if (Math.hypot(ball.x - closestX, ball.y - closestY) < BALL_RADIUS * 2) return true;
  }
  return false;
}

function angleDiff(a, b) {
  let diff = Math.abs(a - b) % (Math.PI * 2);
  if (diff > Math.PI) diff = Math.PI * 2 - diff;
  return diff;
}

export function chooseComputerShot(state, rng = Math.random) {
  const balls = state.balls;
  const cue = balls.find((b) => b.id === "cue");
  const shooter = state.turn;
  const group = state.groups[shooter];

  let candidateIds;
  if (isEightBallShot(state)) {
    candidateIds = ["8"];
  } else if (group) {
    candidateIds = balls.filter((b) => !b.pocketed && b.group === group).map((b) => b.id);
  } else {
    candidateIds = balls.filter((b) => !b.pocketed && b.id !== "cue" && b.id !== "8").map((b) => b.id);
  }

  let best = null;
  for (const id of candidateIds) {
    const target = balls.find((b) => b.id === id);
    for (let pocketIndex = 0; pocketIndex < POCKETS.length; pocketIndex++) {
      const pocket = POCKETS[pocketIndex];
      const toTargetAngle = Math.atan2(target.y - cue.y, target.x - cue.x);
      const toPocketAngle = Math.atan2(pocket.y - target.y, pocket.x - target.x);
      const cutAngle = angleDiff(toTargetAngle, toPocketAngle);
      if (cutAngle >= MAX_CUT_ANGLE) continue;

      if (segmentBlocked(cue.x, cue.y, target.x, target.y, balls, [cue.id, target.id])) continue;
      if (segmentBlocked(target.x, target.y, pocket.x, pocket.y, balls, [target.id])) continue;

      const dist = Math.hypot(target.x - cue.x, target.y - cue.y) + Math.hypot(pocket.x - target.x, pocket.y - target.y);
      const score = cutAngle * 3 + dist * 0.001;

      if (!best || score < best.score) {
        best = { targetId: id, pocketIndex, score, target, pocket };
      }
    }
  }

  if (!best) {
    const target = balls.find((b) => b.id === candidateIds[0]) ?? cue;
    const angle = Math.atan2(target.y - cue.y, target.x - cue.x);
    const shot = { angle, power: 0.5, targetId: candidateIds[0] };
    if (candidateIds[0] === "8") shot.calledPocket = 0;
    return shot;
  }

  const dirTargetToPocket = Math.atan2(best.pocket.y - best.target.y, best.pocket.x - best.target.x);
  const aimX = best.target.x - Math.cos(dirTargetToPocket) * BALL_RADIUS * 2;
  const aimY = best.target.y - Math.sin(dirTargetToPocket) * BALL_RADIUS * 2;

  let angle = Math.atan2(aimY - cue.y, aimX - cue.x);
  const totalDist = Math.hypot(best.target.x - cue.x, best.target.y - cue.y) + Math.hypot(best.pocket.x - best.target.x, best.pocket.y - best.target.y);
  let power = Math.max(0.1, Math.min(1, 0.35 + totalDist / 900));

  if (rng() < COMPUTER_MISS_CHANCE) {
    angle += (rng() - 0.5) * 0.25;
    power *= 0.7 + rng() * 0.3;
  }

  const shot = { angle, power, targetId: best.targetId, pocketIndex: best.pocketIndex };
  if (best.targetId === "8") shot.calledPocket = best.pocketIndex;
  return shot;
}
