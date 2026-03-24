# Rubix — F2L practice from scramble

A small Rubik's cube simulator that **starts from a given scramble**, so you can drill intuitive F2L cases (e.g. from [logiqx F2L](https://logiqx.github.io/cubing-algs/html/if2l.html)) without rescrambling a real cube.

## Deploy (GitHub Pages)

1. In the repo on GitHub: **Settings → Pages → Build and deployment**, set **Source** to **GitHub Actions**.
2. Push to `main`; the workflow **Deploy GitHub Pages** uploads `index.html` and `js/`.
3. Site URL: `https://<your-username>.github.io/rubix/` (for this fork: `https://thomjenkins.github.io/rubix/`).

## Run locally

Serve the folder with any static server (ES modules need same-origin):

```bash
# Option 1: npx
npx serve .

# Option 2: Python
python3 -m http.server 8080
```

Then open **http://localhost:3000** (or 8080) and use the **Scramble** panel.

## Usage

1. **Apply scramble** — Paste or type a scramble (e.g. `R U R' U'`) and click **Apply scramble** to set the cube to that state.
2. **Quick F2L setups** — Use the preset buttons to load common F2L cases.
3. **Practice** — Use the keyboard to turn faces: **R L U D F B** (with **'** for prime and **2** for half turn). Drag to rotate the view.
4. **Reset** — Back to solved.

Notation is standard WCA: `R L U D F B` clockwise; `R'` / `R2`. Whole-cube rotations: `x` (like R), `y` (like U), `z` (like F), with `x'` / `x2` etc.

## Files

- `js/cube.js` — Cube state and move execution (notation parser, apply scramble).
- `js/renderer.js` — 3D cube (Three.js).
- `js/main.js` — UI and keyboard controls.
- `index.html` — Layout and scramble input.
