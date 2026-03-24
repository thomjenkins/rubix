/**
 * Rubix — F2L practice from scramble. Ties cube state, 3D view, and controls.
 */

import { createScene } from './renderer.js';
import {
  createSolvedState,
  applyMove,
  fromScramble,
} from './cube.js';
import { F2L_CASES, F2L_GROUPS } from './f2l-cases.js';

const scrambleInput = document.getElementById('scramble-input');
const btnApply = document.getElementById('btn-apply');
const btnReset = document.getElementById('btn-reset');
const presetBtns = document.getElementById('preset-btns');
const groupSelect = document.getElementById('f2l-group');
const container = document.getElementById('cube-container');

let state = createSolvedState();
const { updateState } = createScene(container, {
  onFaceTurn(move) {
    applyMove(state, move);
    updateState(state);
  },
});
updateState(state);

function setState(newState) {
  state = newState.slice();
  updateState(state);
}

btnApply.addEventListener('click', () => {
  const raw = scrambleInput.value.trim();
  if (!raw) return;
  try {
    const newState = fromScramble(raw);
    setState(newState);
  } catch (e) {
    console.warn('Scramble parse issue:', e);
  }
});

btnReset.addEventListener('click', () => {
  setState(createSolvedState());
  scrambleInput.value = '';
});

// Preloaded F2L: group filter + buttons for all 41 cases
function filterCasesByGroup() {
  const group = groupSelect ? groupSelect.value : '';
  return group ? F2L_CASES.filter((c) => c.group === group) : F2L_CASES;
}

function renderF2LButtons() {
  presetBtns.textContent = '';
  const cases = filterCasesByGroup();
  cases.forEach(({ id, name, scramble }) => {
    const btn = document.createElement('button');
    btn.textContent = id;
    btn.title = `${name}\n${scramble}`;
    btn.addEventListener('click', () => {
      scrambleInput.value = scramble;
      setState(fromScramble(scramble));
    });
    presetBtns.appendChild(btn);
  });
}

if (groupSelect) {
  groupSelect.innerHTML = '<option value="">All cases</option>' +
    F2L_GROUPS.map((g) => `<option value="${g}">${g}</option>`).join('');
  groupSelect.addEventListener('change', renderF2LButtons);
}
renderF2LButtons();

// Keyboard: R L U D F B (face moves), X Y Z (whole-cube rotations), with ' or 2
const keyToMove = {
  R: 'R', L: 'L', U: 'U', D: 'D', F: 'F', B: 'B',
  X: 'x', Y: 'y', Z: 'z',
};
let modifier = null; // 'prime' or '2'

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const key = e.key.toUpperCase();
  if (key === "'" || key === '′') { modifier = 'prime'; return; }
  if (key === '2') { modifier = '2'; return; }
  const face = keyToMove[key];
  if (!face) return;
  e.preventDefault();
  const move = {
    face,
    prime: modifier === 'prime',
    double: modifier === '2',
  };
  modifier = null;
  applyMove(state, move);
  updateState(state);
});

document.addEventListener('keyup', (e) => {
  const k = e.key.toUpperCase();
  if (k === "'" || k === '2') modifier = null;
});
