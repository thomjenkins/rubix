/**
 * 3D Rubik's cube renderer using Three.js.
 * State: 54 facelets, face order U D F B R L, row-major 0-8 per face.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Standard Rubik's cube colors (U=white, D=yellow, F=green, B=blue, R=red, L=orange)
const COLOR_MAP = {
  0: 0xffffff, // U white
  1: 0xffd700, // D yellow
  2: 0x009a44, // F green
  3: 0x003da5, // B blue
  4: 0xba0c2f, // R red
  5: 0xfe5000, // L orange
};

// Face index -> normal and right vector for positioning 9 facelets
const FACE_AXES = {
  0: { n: new THREE.Vector3(0, 1, 0),  u: new THREE.Vector3(1, 0, 0), v: new THREE.Vector3(0, 0, -1) },  // U
  1: { n: new THREE.Vector3(0, -1, 0), u: new THREE.Vector3(1, 0, 0), v: new THREE.Vector3(0, 0, 1) },   // D
  2: { n: new THREE.Vector3(0, 0, 1),  u: new THREE.Vector3(1, 0, 0), v: new THREE.Vector3(0, 1, 0) },  // F
  3: { n: new THREE.Vector3(0, 0, -1), u: new THREE.Vector3(-1, 0, 0), v: new THREE.Vector3(0, 1, 0) }, // B
  4: { n: new THREE.Vector3(1, 0, 0),  u: new THREE.Vector3(0, 0, -1), v: new THREE.Vector3(0, 1, 0) }, // R
  5: { n: new THREE.Vector3(-1, 0, 0), u: new THREE.Vector3(0, 0, 1), v: new THREE.Vector3(0, 1, 0) },  // L
};

const FACE_SIZE = 0.98;
const GAP = 0.02;
const FACELET_SIZE = (FACE_SIZE - 2 * GAP) / 3;

const FACE_LETTERS = ['U', 'D', 'F', 'B', 'R', 'L'];

/** Min pointer travel (px) before a drag counts as a face turn. */
const MIN_DRAG_PX = 12;

/** Min in-plane drag (world units) to apply a move. */
const MIN_DRAG_WORLD = 0.04;

/**
 * @param {HTMLElement} container
 * @param {{ onFaceTurn?: (move: { face: string, prime: boolean, double: boolean }) => void }} [options]
 */
export function createScene(container, options = {}) {
  const { onFaceTurn } = options;
  const width = container.clientWidth;
  const height = container.clientHeight;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a2e);

  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
  camera.position.set(4, 3.5, 4);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 3;
  controls.maxDistance = 12;
  controls.target.set(0, 0, 0);

  // Bright, neutral lighting so cube colors read correctly (no server restart needed)
  scene.add(new THREE.AmbientLight(0xffffff, 1.2));
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
  keyLight.position.set(5, 8, 5);
  scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.6);
  fillLight.position.set(-4, 4, -4);
  scene.add(fillLight);

  // 54 facelet meshes: group by face, then 9 planes
  const faceletMeshes = [];
  for (let f = 0; f < 6; f++) {
    const axes = FACE_AXES[f];
    const geom = new THREE.PlaneGeometry(FACELET_SIZE, FACELET_SIZE);
    for (let i = 0; i < 9; i++) {
      const row = Math.floor(i / 3);
      const col = i % 3;
      const u = (col - 1) * (FACELET_SIZE + GAP);
      const v = (1 - row) * (FACELET_SIZE + GAP);
      const pos = new THREE.Vector3()
        .copy(axes.n)
        .multiplyScalar(0.501)
        .add(axes.u.clone().multiplyScalar(u))
        .add(axes.v.clone().multiplyScalar(v));
      const mesh = new THREE.Mesh(
        geom.clone(),
        new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide })
      );
      mesh.position.copy(pos);
      // Orient so the front (colored) face points outward from the cube
      mesh.lookAt(pos.clone().add(axes.n));
      mesh.rotateY(Math.PI); // flip so exterior view sees the front face
      mesh.userData.faceIndex = f;
      mesh.userData.cellIndex = i;
      scene.add(mesh);
      faceletMeshes.push(mesh);
    }
  }

  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();

  /** @type {{ faceIndex: number, n: THREE.Vector3, u: THREE.Vector3, v: THREE.Vector3, worldPoint: THREE.Vector3, clientX: number, clientY: number, pointerId: number } | null} */
  let faceDrag = null;

  function pickFacelet(clientX, clientY) {
    const rect = renderer.domElement.getBoundingClientRect();
    ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObjects(faceletMeshes, false);
    return hits[0] ?? null;
  }

  /**
   * Intersect infinite plane (point P, unit-ish normal n) with ray; returns point or null.
   */
  function rayPlanePoint(ray, planePoint, planeNormal) {
    const denom = ray.direction.dot(planeNormal);
    if (Math.abs(denom) < 1e-6) return null;
    const t = planePoint.clone().sub(ray.origin).dot(planeNormal) / denom;
    if (t < 0) return null;
    return ray.origin.clone().add(ray.direction.clone().multiplyScalar(t));
  }

  function tryApplyFaceTurn(clientX, clientY) {
    if (!faceDrag || !onFaceTurn) return;

    const dx = clientX - faceDrag.clientX;
    const dy = clientY - faceDrag.clientY;
    if (dx * dx + dy * dy < MIN_DRAG_PX * MIN_DRAG_PX) return;

    const rect = renderer.domElement.getBoundingClientRect();
    ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(ndc, camera);
    const ray = raycaster.ray;

    const { n, u, v, worldPoint: P } = faceDrag;

    const Q = rayPlanePoint(ray, P, n);
    if (!Q) return;

    const d = Q.clone().sub(P);
    const dTan = d.sub(n.clone().multiplyScalar(d.dot(n)));
    if (dTan.length() < MIN_DRAG_WORLD) return;

    // Turn direction: match rigid motion of this layer about axis `n` through the
    // cube center. At hit point P, velocity for angular speed ω>0 is ω (n × r), r = P.
    // Choose prime so stickers move along dTan (same sign as dot(dTan, n × r)).
    // Center facelets: r ∥ n ⇒ n×r ≈ 0; use n × u (in-plane) as reference tangent.
    const r = P;
    const h = new THREE.Vector3().crossVectors(n, r);
    let ref = h;
    if (ref.lengthSq() < 1e-8) {
      ref = new THREE.Vector3().crossVectors(n, u);
    }
    if (ref.lengthSq() < 1e-8) {
      ref = new THREE.Vector3().crossVectors(n, v);
    }
    ref.normalize();
    const along = dTan.dot(ref);
    if (Math.abs(along) < 1e-5) return;

    // prime=false when drag matches +ω rotation (right-hand about outward n): v ∝ n×r.
    const prime = along < 0;

    const face = FACE_LETTERS[faceDrag.faceIndex];
    onFaceTurn({ face, prime, double: false });
  }

  function onPointerDown(e) {
    if (e.button !== 0 || !onFaceTurn) return;
    // Let Shift+drag keep camera orbit even when starting on a sticker.
    if (e.shiftKey) return;

    const hit = pickFacelet(e.clientX, e.clientY);
    if (!hit) return;

    e.preventDefault();
    e.stopImmediatePropagation();

    const faceIndex = hit.object.userData.faceIndex;
    const axes = FACE_AXES[faceIndex];
    faceDrag = {
      faceIndex,
      n: axes.n.clone(),
      u: axes.u.clone(),
      v: axes.v.clone(),
      worldPoint: hit.point.clone(),
      clientX: e.clientX,
      clientY: e.clientY,
      pointerId: e.pointerId,
    };

    try {
      renderer.domElement.setPointerCapture(e.pointerId);
    } catch (_) {
      /* ignore */
    }
  }

  function onPointerUp(e) {
    if (!faceDrag || e.pointerId !== faceDrag.pointerId) return;
    try {
      renderer.domElement.releasePointerCapture(e.pointerId);
    } catch (_) {
      /* ignore */
    }
    tryApplyFaceTurn(e.clientX, e.clientY);
    faceDrag = null;
  }

  function onPointerCancel(e) {
    if (!faceDrag || e.pointerId !== faceDrag.pointerId) return;
    try {
      renderer.domElement.releasePointerCapture(e.pointerId);
    } catch (_) {
      /* ignore */
    }
    faceDrag = null;
  }

  const canvas = renderer.domElement;
  canvas.addEventListener('pointerdown', onPointerDown, { capture: true });
  window.addEventListener('pointerup', onPointerUp, { passive: true });
  window.addEventListener('pointercancel', onPointerCancel, { passive: true });

  function updateState(state) {
    for (let i = 0; i < 54; i++) {
      const color = COLOR_MAP[state[i]] ?? 0x333333;
      faceletMeshes[i].material.color.setHex(color);
    }
  }

  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', resize);

  return { updateState, resize, canvas: renderer.domElement };
}
