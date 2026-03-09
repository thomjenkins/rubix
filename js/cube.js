/**
 * Rubik's cube state and move execution.
 * State: 6 faces × 9 facelets. Face order: U, D, F, B, R, L.
 * Colors: 0=W, 1=Y, 2=G, 3=B, 4=R, 5=O (white, yellow, green, blue, red, orange).
 */

const FACE_NAMES = ['U', 'D', 'F', 'B', 'R', 'L'];
const COLOR_NAMES = ['W', 'Y', 'G', 'B', 'R', 'O'];

// 3x3 face rotation: 90° clockwise permutation of 9 facelets (index 0..8 row-major)
const FACE_CW = [2, 5, 8, 1, 4, 7, 0, 3, 6];
const FACE_CCW = [6, 3, 0, 7, 4, 1, 8, 5, 2];

function createSolvedState() {
  const state = [];
  for (let f = 0; f < 6; f++) {
    for (let i = 0; i < 9; i++) state.push(f);
  }
  return state;
}

// Cycle four faces' strips (indices of 3 facelets each). Each array is [faceIndex, i0, i1, i2].
function cycle(state, ...groups) {
  const len = groups.length;
  const vals = groups.map(([f, a, b, c]) => [state[f * 9 + a], state[f * 9 + b], state[f * 9 + c]]);
  for (let g = 0; g < len; g++) {
    const next = (g + 1) % len;
    const [fn, a, b, c] = groups[next];
    const v = vals[g];
    state[fn * 9 + a] = v[0];
    state[fn * 9 + b] = v[1];
    state[fn * 9 + c] = v[2];
  }
}

// Rotate one face in place (face index 0..5, dir 1 = CW, -1 = CCW)
function rotateFace(state, face, dir) {
  const perm = dir === 1 ? FACE_CW : FACE_CCW;
  const base = face * 9;
  const copy = state.slice(base, base + 9);
  for (let i = 0; i < 9; i++) state[base + i] = copy[perm[i]];
}

// Face indices: U=0, D=1, F=2, B=3, R=4, L=5
// Each face 3x3 row-major: 0 1 2 / 3 4 5 / 6 7 8  => right column = 2,5,8; bottom = 6,7,8 etc.

function moveR(state, prime = false) {
  const dir = prime ? -1 : 1;
  rotateFace(state, 4, dir);
  // Strip around R: U right -> F right -> D right -> B right (all columns touching R)
  if (!prime) {
    cycle(state,
      [0, 2, 5, 8],   // U right
      [2, 2, 5, 8],   // F right
      [1, 2, 5, 8],   // D right
      [3, 2, 5, 8]    // B right (strip that touches R)
    );
  } else {
    cycle(state,
      [3, 2, 5, 8],   // B right
      [1, 2, 5, 8],   // D right
      [2, 2, 5, 8],   // F right
      [0, 2, 5, 8]    // U right
    );
  }
}

function moveL(state, prime = false) {
  const dir = prime ? 1 : -1;
  rotateFace(state, 5, dir);
  // Strip around L: U left -> B left -> D left -> F left
  if (!prime) {
    cycle(state,
      [0, 0, 3, 6],   // U left
      [3, 0, 3, 6],   // B left (strip that touches L)
      [1, 0, 3, 6],   // D left
      [2, 0, 3, 6]    // F left
    );
  } else {
    cycle(state,
      [3, 0, 3, 6],   // B left
      [1, 0, 3, 6],   // D left
      [2, 0, 3, 6],   // F left
      [0, 0, 3, 6]    // U left
    );
  }
}

function moveU(state, prime = false) {
  const dir = prime ? -1 : 1;
  rotateFace(state, 0, dir);
  if (!prime) {
    cycle(state,
      [2, 0, 1, 2],
      [4, 0, 1, 2],
      [3, 0, 1, 2],
      [5, 0, 1, 2]
    );
  } else {
    cycle(state,
      [2, 0, 1, 2],
      [5, 0, 1, 2],
      [3, 0, 1, 2],
      [4, 0, 1, 2]
    );
  }
}

function moveD(state, prime = false) {
  const dir = prime ? 1 : -1;
  rotateFace(state, 1, dir);
  if (!prime) {
    cycle(state,
      [2, 6, 7, 8],
      [5, 6, 7, 8],
      [3, 6, 7, 8],
      [4, 6, 7, 8]
    );
  } else {
    cycle(state,
      [2, 6, 7, 8],
      [4, 6, 7, 8],
      [3, 6, 7, 8],
      [5, 6, 7, 8]
    );
  }
}

function moveF(state, prime = false) {
  const dir = prime ? -1 : 1;
  rotateFace(state, 2, dir);
  // Strip around F: U bottom -> R left -> D top (row 0,1,2) -> L right
  if (!prime) {
    cycle(state,
      [0, 6, 7, 8],   // U bottom
      [4, 0, 3, 6],   // R left
      [1, 0, 1, 2],   // D top (row touching F)
      [5, 2, 5, 8]    // L right
    );
  } else {
    cycle(state,
      [5, 2, 5, 8],   // L right
      [1, 0, 1, 2],   // D top
      [4, 0, 3, 6],   // R left
      [0, 6, 7, 8]    // U bottom
    );
  }
}

function moveB(state, prime = false) {
  const dir = prime ? 1 : -1;
  rotateFace(state, 3, dir);
  // Strip around B: U top -> L left -> D bottom -> R right
  if (!prime) {
    cycle(state,
      [0, 0, 1, 2],   // U top
      [5, 0, 3, 6],   // L left
      [1, 6, 7, 8],   // D bottom
      [4, 2, 5, 8]    // R right (order matches D bottom -> R)
    );
  } else {
    cycle(state,
      [0, 0, 1, 2],
      [4, 2, 5, 8],   // R right
      [1, 6, 7, 8],
      [5, 0, 3, 6]
    );
  }
}

// Copy face from srcBuf to destBuf, optionally rotate 90° (dir: 1 = CW, -1 = CCW, 0 = none)
function copyFaceBetween(srcBuf, destBuf, srcFace, destFace, rotDir = 0) {
  const perm = rotDir === 1 ? FACE_CW : rotDir === -1 ? FACE_CCW : null;
  const baseSrc = srcFace * 9;
  const baseDest = destFace * 9;
  if (!perm) {
    for (let i = 0; i < 9; i++) destBuf[baseDest + i] = srcBuf[baseSrc + i];
    return;
  }
  for (let i = 0; i < 9; i++) destBuf[baseDest + i] = srcBuf[baseSrc + perm[i]];
}

// Whole-cube rotations: x = like R, y = like U, z = like F
function moveX(state, prime = false) {
  const o = state.slice();
  if (!prime) {
    for (let i = 0; i < 9; i++) { state[0*9+i] = o[3*9+i]; state[2*9+i] = o[0*9+i]; state[1*9+i] = o[2*9+i]; state[3*9+i] = o[1*9+i]; }
  } else {
    for (let i = 0; i < 9; i++) { state[0*9+i] = o[2*9+i]; state[2*9+i] = o[1*9+i]; state[1*9+i] = o[3*9+i]; state[3*9+i] = o[0*9+i]; }
  }
}

function moveY(state, prime = false) {
  const o = state.slice();
  const rot = prime ? -1 : 1;
  if (!prime) {
    copyFaceBetween(o, state, 4, 2, rot); copyFaceBetween(o, state, 2, 5, rot);
    copyFaceBetween(o, state, 5, 3, rot); copyFaceBetween(o, state, 3, 4, rot);
  } else {
    copyFaceBetween(o, state, 5, 2, -rot); copyFaceBetween(o, state, 3, 5, -rot);
    copyFaceBetween(o, state, 4, 3, -rot); copyFaceBetween(o, state, 2, 4, -rot);
  }
  // U and D unchanged — only copy those from original (do not overwrite F/L/B/R we just wrote)
  for (let i = 0; i < 9; i++) { state[i] = o[i]; state[9 + i] = o[9 + i]; }
}

function moveZ(state, prime = false) {
  const o = state.slice();
  const rot = prime ? 1 : -1;
  if (!prime) {
    copyFaceBetween(o, state, 5, 0, rot); copyFaceBetween(o, state, 0, 4, rot);
    copyFaceBetween(o, state, 4, 1, rot); copyFaceBetween(o, state, 1, 5, rot);
  } else {
    copyFaceBetween(o, state, 4, 0, -rot); copyFaceBetween(o, state, 1, 4, -rot);
    copyFaceBetween(o, state, 5, 1, -rot); copyFaceBetween(o, state, 0, 5, -rot);
  }
  // F and B unchanged
  for (let i = 18; i < 36; i++) state[i] = o[i];
}

const moveFns = { R: moveR, L: moveL, U: moveU, D: moveD, F: moveF, B: moveB, x: moveX, y: moveY, z: moveZ };

/**
 * Parse a move string (e.g. "R", "R'", "x", "y2") and return { face, prime, double }.
 * face is lowercase for cube rotations (x,y,z), uppercase for face moves.
 */
function parseMove(s) {
  const t = s.trim();
  if (!t) return null;
  const face = t[0].toUpperCase();
  const isCubeRot = 'XYZ'.includes(face);
  if (!'RLUDFBXYZ'.includes(face)) return null;
  let prime = false;
  let double = false;
  for (let i = 1; i < t.length; i++) {
    const c = t[i];
    if (c === "'" || c === '′') prime = true;
    else if (c === '2') double = true;
  }
  return { face: isCubeRot ? face.toLowerCase() : face, prime, double };
}

/**
 * Apply one move to state. Returns state (mutated).
 */
function applyMove(state, move) {
  const fn = moveFns[move.face];
  if (!fn) return state;
  if (move.double) {
    fn(state, false);
    fn(state, false);
  } else {
    fn(state, move.prime);
  }
  return state;
}

/**
 * Parse scramble string (e.g. "R U R' U'" or "R U R' U'") and return array of moves.
 */
function parseScramble(str) {
  const tokens = str.split(/\s+/).filter(Boolean);
  const moves = [];
  for (const t of tokens) {
    const m = parseMove(t);
    if (m) moves.push(m);
  }
  return moves;
}

/**
 * Apply a scramble to a state. Returns new state (does not mutate input).
 */
function applyScramble(state, scrambleStr) {
  const s = state.slice();
  const moves = parseScramble(scrambleStr);
  for (const m of moves) applyMove(s, m);
  return s;
}

/**
 * Create state from scramble applied to solved cube.
 */
function fromScramble(scrambleStr) {
  return applyScramble(createSolvedState(), scrambleStr);
}

export {
  createSolvedState,
  applyMove,
  parseMove,
  parseScramble,
  applyScramble,
  fromScramble,
  FACE_NAMES,
  COLOR_NAMES,
};
