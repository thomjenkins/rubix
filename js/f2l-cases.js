/**
 * Preloaded F2L cases: setup scrambles from solved to practice each case.
 * All use standard notation (R L U D F B, no cube rotations).
 * Setup = inverse of the solution (apply this to solved to get the case).
 */

export const F2L_CASES = [
  // 1–8: Corner on top, FL color side, edge match / basic
  { id: 1, name: 'F2L 1 — Connected pair', group: 'Both in U', scramble: "R' F R F' R U R' U'" },
  { id: 2, name: 'F2L 2 — Edge flipped', group: 'Both in U', scramble: "F R' F' R U' R' U R" },
  { id: 3, name: 'F2L 3 — Edge left, corner URF', group: 'Both in U', scramble: "R U R' U2 R U' R'" },
  { id: 4, name: 'F2L 4 — Corner near slot', group: 'Both in U', scramble: "R U R' U2 R' U R" },
  { id: 5, name: 'F2L 5 — Corner twisted, edge back', group: 'Both in U', scramble: "R U R' U2 R U' R'" },
  { id: 6, name: 'F2L 6 — Yellow front-left', group: 'Both in U', scramble: "R' U R U2 R' U' R" },
  { id: 7, name: 'F2L 7 — Corner to back-right', group: 'Both in U', scramble: "R U R' U' R' U' R" },
  { id: 8, name: 'F2L 8 — Yellow front-left hide', group: 'Both in U', scramble: "R U' R' F R U R' U' F'" },
  // 9–16: Edge colors opposite / separated
  { id: 9, name: 'F2L 9 — Simple pair', group: 'Both in U', scramble: "R U R'" },
  { id: 10, name: 'F2L 10 — Mirror pair', group: 'Both in U', scramble: "R' U' R" },
  { id: 11, name: 'F2L 11 — Mismatched touch', group: 'Both in U', scramble: "R U R' U R U' R'" },
  { id: 12, name: 'F2L 12 — Mismatched touch 2', group: 'Both in U', scramble: "R U' R' U' R U R'" },
  { id: 13, name: 'F2L 13 — Misaligned touch', group: 'Both in U', scramble: "R U2 R' U' R' U R" },
  { id: 14, name: 'F2L 14 — Edge in layer', group: 'Both in U', scramble: "R' U2 R U R U' R'" },
  { id: 15, name: 'F2L 15 — Attached don\'t match', group: 'Both in U', scramble: "R U R' U' R' U' R" },
  { id: 16, name: 'F2L 16 — Pass by', group: 'Both in U', scramble: "R U' R' U2 R U R'" },
  // 17–24: Corner FL facing up
  { id: 17, name: 'F2L 17 — Yellow up', group: 'Both in U', scramble: "R U R' U R U2 R'" },
  { id: 18, name: 'F2L 18 — Yellow up, front wrong', group: 'Both in U', scramble: "R' U2 R U R' U' R" },
  { id: 19, name: 'F2L 19 — Edge far', group: 'Both in U', scramble: "R U' R' U' R U2 R' U R U' R'" },
  { id: 20, name: 'F2L 20 — Corner back-right', group: 'Both in U', scramble: "R U2 R' U' R' U R" },
  { id: 21, name: 'F2L 21 — Corner back-left', group: 'Both in U', scramble: "R U' R' U2 R U R' U R U' R'" },
  { id: 22, name: 'F2L 22 — Edge matches front', group: 'Both in U', scramble: "F' R U R' U' R' F R" },
  { id: 23, name: 'F2L 23 — Swap corner edge', group: 'Both in U', scramble: "R U' R' U2 R U R'" },
  { id: 24, name: 'F2L 24 — Reverse order', group: 'Both in U', scramble: "R U R' F' R U R' U' F" },
  // 25–30: Corner down, edge on top
  { id: 25, name: 'F2L 25 — Corner in, edge match', group: 'Corner in slot', scramble: "L' U' L U R U' R'" },
  { id: 26, name: 'F2L 26 — Corner in, edge top', group: 'Corner in slot', scramble: "R U R' U' R U R'" },
  { id: 27, name: 'F2L 27 — Corner in wrong orient', group: 'Corner in slot', scramble: "R U R' U' R' U R" },
  { id: 28, name: 'F2L 28 — Corner in misoriented', group: 'Corner in slot', scramble: "R U' R' U R U R'" },
  { id: 29, name: 'F2L 29 — Corner in, need F', group: 'Corner in slot', scramble: "R U' R' U R U' R'" },
  { id: 30, name: 'F2L 30 — Corner in, out then far', group: 'Corner in slot', scramble: "R U R' U R U2 R'" },
  // 31–36: Edge down, corner on top / both in slot
  { id: 31, name: 'F2L 31 — Almost paired', group: 'Easy insert', scramble: "R U R' U'" },
  { id: 32, name: 'F2L 32 — One R drop', group: 'Easy insert', scramble: "R'" },
  { id: 33, name: 'F2L 33 — Corner back-right', group: 'Easy insert', scramble: "U R U' R'" },
  { id: 34, name: 'F2L 34 — Twisted apart', group: 'Easy insert', scramble: "R' U' R U' R U R'" },
  { id: 35, name: 'F2L 35 — Corner back, lift edge', group: 'Easy insert', scramble: "R U' R' F' R U R'" },
  { id: 36, name: 'F2L 36 — Twisted together', group: 'Easy insert', scramble: "F R U R' U' F'" },
  // 37–41: Both in slot / wrong slot
  { id: 37, name: 'F2L 37 — Both in slot mismatch', group: 'Wrong slot', scramble: "R U' R' U R U' R' U2 R U R'" },
  { id: 38, name: 'F2L 38 — Separate R U\'', group: 'Wrong slot', scramble: "R U R' U' R U R'" },
  { id: 39, name: 'F2L 39 — Stuck misaligned', group: 'Wrong slot', scramble: "R U R' U R U' R' U2 R U' R'" },
  { id: 40, name: 'F2L 40 — Face each other', group: 'Wrong slot', scramble: "R U R'" },
  { id: 41, name: 'F2L 41 — Tangled swap', group: 'Wrong slot', scramble: "F' R U R' U' R' F R" },
];

export const F2L_GROUPS = [...new Set(F2L_CASES.map((c) => c.group))];
