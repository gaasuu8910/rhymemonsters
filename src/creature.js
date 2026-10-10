/* =========================================================
   CREATURES — "designer-toy" monsters
   one soft, fused mochi silhouette (big head, low glossy eyes, tiny limbs),
   painted two-tone vertex colour, satin plush finish (sheen + light clearcoat + rim glow)
   egg → baby → kid → hero → final   ·   A: stars & moons · B: wind & birds · C: forest & stone
   ========================================================= */
const OUT = { isOutline: true };
const LIN = c => new THREE.Color(c).convertSRGBToLinear();
const SAT = c => { const k = new THREE.Color(c), h = {}; k.getHSL(h); if (h.s > .05) k.setHSL(h.h, Math.min(1, h.s * .82), h.l < .2 ? h.l : Math.min(.93, h.l + (1 - h.l) * .16)); return k.convertSRGBToLinear(); }; // soft pastel toys
const MATS = {};
function pm(c, o = {}) {
  const k = c + JSON.stringify(o); if (MATS[k]) return MATS[k];
  const m = new THREE.MeshPhysicalMaterial({
    color: SAT(c), roughness: o.r ?? .45, metalness: o.m ?? 0, clearcoat: o.cc ?? .35, clearcoatRoughness: o.ccr ?? .3,
    emissive: o.e ? LIN(o.e) : new THREE.Color(0), emissiveIntensity: o.ei ?? 1,
    envMapIntensity: o.env ?? .6, transparent: o.op != null, opacity: o.op ?? 1, side: o.ds ? THREE.DoubleSide : THREE.FrontSide, map: o.map || null, emissiveMap: o.emap || null,
  });
  if (o.sh) m.sheen = new THREE.Color(o.sh).convertSRGBToLinear().multiplyScalar(.55);
  if (o.rim) addRim(m, o.rim, o.rimK ?? .5);
  return MATS[k] = m;
}
// fake subsurface: a soft fresnel glow tinted by the skin (what makes vinyl toys look "lit from inside")
function addRim(m, col, k) {
  const rc = LIN(col).multiplyScalar(k);
  m.onBeforeCompile = sh => { sh.uniforms.uRim = { value: rc };
    sh.fragmentShader = 'uniform vec3 uRim;\n' + sh.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n totalEmissiveRadiance += uRim * pow(1.0 - saturate(dot(normalize(vViewPosition), normal)), 2.6);'); };
  m.customProgramCacheKey = () => 'rim';
}
const glowMat = c => new THREE.MeshBasicMaterial({ color: LIN(c), toneMapped: false });
function M(geo, mat, s = [1, 1, 1], p = [0, 0, 0], r = [0, 0, 0]) { const m = new THREE.Mesh(geo, mat); m.scale.set(...s); m.position.set(...p); m.rotation.set(...r); m.castShadow = true; m.receiveShadow = true; return m; }
const SPH = new THREE.SphereGeometry(1, 40, 28), SPHL = new THREE.SphereGeometry(1, 20, 14);
const GEO = { sphere: SPH, cone: new THREE.ConeGeometry(1, 1, 24), octa: new THREE.OctahedronGeometry(1, 0), dodeca: new THREE.DodecahedronGeometry(1, 1), tetra: new THREE.TetrahedronGeometry(1, 0) };
GEO.egg = (() => { const g = new THREE.SphereGeometry(1, 64, 48); const p = g.attributes.position; for (let i = 0; i < p.count; i++) { let x = p.getX(i), y = p.getY(i), z = p.getZ(i); if (y > 0) { const k = 1 - .2 * y; x *= k; z *= k; y *= 1.28; } p.setXYZ(i, x, y, z); } g.computeVertexNormals(); return g; })();
// soft rounded 5-point star (extruded, bevelled)
GEO.star = (() => { const s = new THREE.Shape(), n = 5, R = 1, r = .48;
  for (let i = 0; i <= n * 2; i++) { const a = Math.PI / 2 + i * Math.PI / n, rr = i % 2 ? r : R, x = Math.cos(a) * rr, y = Math.sin(a) * rr; if (!i) s.moveTo(x, y); else { const pa = Math.PI / 2 + (i - .5) * Math.PI / n, pr = (i % 2 ? (R + r) / 2 : (R + r) / 2) * .92; s.quadraticCurveTo(Math.cos(pa) * pr * (i % 2 ? 1.08 : .98), Math.sin(pa) * pr * (i % 2 ? 1.08 : .98), x, y); } }
  const g = new THREE.ExtrudeGeometry(s, { depth: .2, bevelEnabled: true, bevelThickness: .16, bevelSize: .14, bevelSegments: 5, curveSegments: 8 }); g.center(); g.computeVertexNormals(); return g; })();
// teardrop (feathers, ears, leaves, petals): unit sphere stretched toward +y with a soft point
GEO.drop = (() => { const g = new THREE.SphereGeometry(1, 28, 20), p = g.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i), t = (y + 1) / 2, w = Math.sin(Math.PI * Math.pow(t, .78)) * .92 + .08 * (1 - t); p.setXYZ(i, p.getX(i) * w, y + .25 * t * t, p.getZ(i) * w); } g.computeVertexNormals(); return g; })();
GEO.leaf = (() => { const g = new THREE.SphereGeometry(1, 28, 20), p = g.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i), t = (y + 1) / 2, w = Math.pow(Math.sin(Math.PI * t), 1.1); p.setXYZ(i, p.getX(i) * w, y, p.getZ(i) * w * (1 - .4 * Math.abs(p.getX(i)))); } g.computeVertexNormals(); return g; })();
function taper(pts, r0, r1, seg = 40, rad = 18) {
  const curve = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p)));
  const g = new THREE.TubeGeometry(curve, seg, 1, rad, false), pos = g.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i <= seg; i++) { const c = curve.getPointAt(i / seg), rr = lerp(r0, r1, Math.pow(i / seg, .9)); for (let j = 0; j <= rad; j++) { const idx = i * (rad + 1) + j; v.fromBufferAttribute(pos, idx).sub(c).multiplyScalar(rr).add(c); pos.setXYZ(idx, v.x, v.y, v.z); } }
  g.computeVertexNormals(); g.userData.end = curve.getPointAt(1); g.userData.start = curve.getPointAt(0); return g;
}
function limb(group, mat, pts, r0, r1, cap = true) { const g = taper(pts, r0, r1, 24, 16); group.add(M(g, mat)); if (cap) { group.add(M(SPHL, mat, [r0, r0, r0], pts[0])); group.add(M(SPHL, mat, [r1 * 1.05, r1 * 1.05, r1 * 1.05], pts[pts.length - 1])); } return g; }
function darken(hex, k) { const c = new THREE.Color(hex); c.multiplyScalar(k); return '#' + c.getHexString(); }
function mixHex(a, b, t) { const c = new THREE.Color(a); c.lerp(new THREE.Color(b), t); return '#' + c.getHexString(); }
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };

/* ---------- painted skin: vertex-coloured blobs sharing one satin material per monster ---------- */
function skinMat(base, o = {}) {
  const m = new THREE.MeshPhysicalMaterial({ color: 0xffffff, vertexColors: true, roughness: o.r ?? .5, clearcoat: o.cc ?? .3, clearcoatRoughness: .34, envMapIntensity: .55 });
  m.sheen = LIN(mixHex(base, '#FFFFFF', .4)).multiplyScalar(.32);
  addRim(m, mixHex(base, '#FFFFFF', .3), o.rim ?? .26);
  return m;
}
// paint(v) gets the unit-sphere direction of each vertex and returns a hex
function blob(mat, R, paint, deform) {
  const g = new THREE.SphereGeometry(1, 56, 40), p = g.attributes.position, col = new Float32Array(p.count * 3), v = new THREE.Vector3(), c = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    v.set(p.getX(i), p.getY(i), p.getZ(i));
    c.copy(paint(v)); col.set([c.r, c.g, c.b], i * 3);
    if (deform) deform(v);
    p.setXYZ(i, v.x * R[0], v.y * R[1], v.z * R[2]);
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.computeVertexNormals();
  return M(g, mat);
}
// two-tone toy paint: base colour, cream belly/face patch toward `dir`, lighter crown, deeper underside
const VIVID = c => { const k = new THREE.Color(c), h = {}; k.getHSL(h); if (h.s > .06) k.setHSL(h.h, Math.max(.58, Math.min(1, h.s * 1.25)), Math.min(h.l, .74)); return k; };
function toyPaint(base, belly, dir, amt = 1, o = {}) {
  base = '#' + VIVID(base).getHexString();
  const B = SAT(base), W = SAT(belly), D = SAT(darken(base, .78)), T = SAT(mixHex(base, '#FFFFFF', .22)), d = new THREE.Vector3(...dir).normalize(), out = new THREE.Color();
  return v => {
    out.copy(B);
    if (o.rainbow) out.setHSL(((Math.atan2(v.z, v.x) / Math.PI + 1) / 2 + v.y * .15) % 1, .75, .78).convertSRGBToLinear();
    out.lerp(T, sstep(.35, 1, v.y) * .5);
    out.lerp(D, sstep(-.2, -1, v.y) * (o.under ?? .35));
    if (amt) out.lerp(W, sstep(o.lo ?? .42, o.hi ?? .78, v.dot(d)) * amt);
    if (o.tip) out.lerp(SAT(o.tip), sstep(o.tipLo ?? .55, 1, o.tipAxis ? v.dot(o.tipAxis) : v.y));
    return out;
  };
}
const mochi = v => { if (v.y < 0) v.y *= .86; v.x *= 1 + .04 * (1 - v.y * v.y); };

/* ---------- face ---------- */
function surf(R, th, ph, deform) { // point + normal on a (deformed) ellipsoid
  const d = new THREE.Vector3(Math.sin(th) * Math.cos(ph), Math.sin(ph), Math.cos(th) * Math.cos(ph));
  const n = new THREE.Vector3(d.x / R[0], d.y / R[1], d.z / R[2]).normalize();
  const q = d.clone(); if (deform) deform(q);
  return { p: new THREE.Vector3(q.x * R[0], q.y * R[1], q.z * R[2]), n };
}
function stick(parent, R, th, ph, deform, inset = 0) { const { p, n } = surf(R, th, ph, deform); const g = new THREE.Group(); g.position.copy(p).addScaledVector(n, -inset); g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n); parent.add(g); return g; }
const HI = new THREE.MeshBasicMaterial({ color: LIN('#EDEDED') });
const EYE_DARK = pm('#16102A', { r: .06, cc: 1, ccr: .04, env: 1 });
// eyes: one glossy dark ellipsoid + a painted decal shell (planar UVs), so nothing can poke out from any angle
const EYE_TEX = {};
function eyeTex(iris, side) {
  const k = iris + side; if (EYE_TEX[k]) return EYE_TEX[k];
  const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
  x.save(); x.beginPath(); x.arc(128, 128, 124, 0, Math.PI * 2); x.clip();
  const g = x.createLinearGradient(0, 70, 0, 236); g.addColorStop(0, mixHex(iris, '#140C24', .55)); g.addColorStop(.55, iris); g.addColorStop(1, mixHex(iris, '#FFFFFF', .55));
  x.fillStyle = g; x.beginPath(); x.ellipse(128, 156, 62, 72, 0, 0, Math.PI * 2); x.fill();
  x.fillStyle = 'rgba(20,12,36,.92)'; x.beginPath(); x.ellipse(128, 146, 34, 42, 0, 0, Math.PI * 2); x.fill();
  const gl = x.createRadialGradient(128, 206, 4, 128, 206, 50); gl.addColorStop(0, 'rgba(255,255,255,.55)'); gl.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gl; x.beginPath(); x.ellipse(128, 200, 50, 28, 0, 0, Math.PI * 2); x.fill();
  x.fillStyle = '#FFFFFF'; x.save(); x.translate(128 - side * 42, 78); x.rotate(side * .5); x.beginPath(); x.ellipse(0, 0, 36, 26, 0, 0, Math.PI * 2); x.fill(); x.restore();
  x.beginPath(); x.arc(128 + side * 44, 168, 13, 0, Math.PI * 2); x.fill();
  x.beginPath(); x.arc(128 - side * 6, 52, 7, 0, Math.PI * 2); x.fill();
  x.restore();
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return EYE_TEX[k] = t;
}
const EYE_CAP = (() => { const g = new THREE.SphereGeometry(1, 40, 28); const p = g.attributes.position, uv = g.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) * .5 + .5, p.getY(i) * .5 + .5); uv.needsUpdate = true; return g; })();
// "yuru" bead eyes: a small glossy black bean with one bright catch-light — simple reads as cute
const BEAD = pm('#1A1420', { r: .12, cc: 1, ccr: .03, env: 1.2 });
function eye(g, w, h, iris, side) {
  const bw = w * .44, bh = h * .52;
  g.add(M(SPH, BEAD, [bw, bh, bw * .62], [0, -h * .05, 0]));
  g.add(M(SPHL, HI, [bw * .34, bh * .3, bw * .12], [-side * bw * .28, bh * .32, bw * .5]));
  g.add(M(SPHL, HI, [bw * .14, bh * .12, bw * .08], [side * bw * .3, -bh * .3, bw * .52]));
}
function face(rig, head, R, deform, f) {
  const iris = f.iris, w = f.ew, h = f.eh;
  [-1, 1].forEach(d => { const g = stick(head, R, d * f.ex * 1.16, f.ey - .07, deform, w * .08); const e = new THREE.Group(); g.add(e); eye(e, w, h, iris, d); rig.eyes.push(e); });
  // mouth: tiny ω (or a beak for birds)
  const mg = stick(head, R, 0, f.my, deform, 0); rig.mouth = mg;
  const sm = new THREE.Group(); mg.add(sm); rig.smile = sm;
  const ms = f.ms * .78, dark = pm('#3B1C2C', { r: .35, cc: .2 });
  if (f.beak) {
    sm.add(M(GEO.drop, pm(f.beak, { r: .32, cc: .6, rim: '#FFFFFF', rimK: .2 }), [ms * 1.7, ms * 1.4, ms * 1.2], [0, ms * .2, ms * .6], [Math.PI, 0, 0]));
  } else {
    [-1, 1].forEach(d => { const a = new THREE.Mesh(new THREE.TorusGeometry(ms, ms * .34, 10, 18, Math.PI), dark); a.rotation.z = Math.PI; a.position.set(d * ms * .98, ms * .25, ms * .15); sm.add(a); });
  }
  const mo = M(SPHL, pm('#9E2A4A', { r: .5, cc: .1, e: '#3A0A18', ei: .3 }), [ms * 2.1, .001, ms * .7], [0, -ms * .5, 0]); mg.add(mo); rig.mouthO = mo; mo.userData.h = ms * 1.5;
  mo.add(M(SPHL, pm('#FF8FAE', { r: .5 }), [.55, .5, .6], [0, -.35, .35]));
  // blush
  [-1, 1].forEach(d => { const g = stick(head, R, d * f.cx, f.cy, deform, -.004); const ck = M(SPHL, pm('#FF8FB1', { r: 1, cc: 0, op: .42 }), [f.cs * 1.15, f.cs * .62, .012]); ck.castShadow = false; ck.receiveShadow = false; ck.renderOrder = 2; g.add(ck); rig.cheeks.push(ck); });
}

/* ---------- parts ---------- */
function feather(par, mat, len, wid, pos, rot) { return par.add(M(GEO.drop, mat, [wid, len * .5, wid * .32], pos, rot)); }
function wing(rig, parent, type, side, span, c, a, pos) {
  const piv = new THREE.Group(); piv.position.set(side * pos[0], pos[1], pos[2]); piv.userData.base = pos[3] ?? .15; parent.add(piv); rig.wings.push([piv, side]);
  const w = new THREE.Group(); w.rotation.y = side * .38; w.rotation.x = -.1; piv.add(w);
  const mc = pm(c, { r: .5, cc: .25, sh: '#FFFFFF', rim: mixHex(c, '#FFFFFF', .5), rimK: .4 }), ma = pm(a, { r: .45, cc: .3, sh: '#FFFFFF', rim: mixHex(a, '#FFFFFF', .5), rimK: .4 }), mw = pm(mixHex(a, '#FFFFFF', .55), { r: .5, cc: .25, sh: '#FFFFFF' });
  if (type === 'small') {
    for (let i = 0; i < 3; i++) { const ang = lerp(.9, .25, i / 2), L = span * lerp(.75, 1, Math.sin((i / 2) * Math.PI * .9 + .2)); feather(w, i === 1 ? ma : mc, L, L * .3, [side * Math.sin(ang) * L * .42, Math.cos(ang) * L * .3, -i * .02], [0, 0, -side * ang]); }
  } else if (type === 'big' || type === 'feather') {
    const n = 7;
    for (let i = 0; i < n; i++) { const t = i / (n - 1), ang = lerp(1.25, .1, t), L = span * lerp(.55, 1, Math.sin(t * Math.PI * .75 + .25));
      feather(w, i % 2 ? ma : mc, L, L * .22, [side * Math.sin(ang) * L * .45, Math.cos(ang) * L * .4 - .05, -t * .06], [0, 0, -side * ang]);
      if (i % 2 === 0) feather(w, mw, L * .62, L * .16, [side * Math.sin(ang) * L * .3, Math.cos(ang) * L * .26 - .02, .03], [0, 0, -side * ang]); }
    w.add(M(SPH, mc, [span * .2, span * .16, span * .09], [side * span * .1, span * .06, .02]));
  } else if (type === 'leaf') {
    for (let i = 0; i < 3; i++) { const ang = lerp(1.05, .35, i / 2), L = span * lerp(.7, 1, i / 2); w.add(M(GEO.leaf, i === 1 ? ma : pm(mixHex(a, '#2E7D32', .35), { r: .5, cc: .35, sh: '#E8FFD0' }), [L * .22, L * .5, .045], [side * Math.sin(ang) * L * .5, Math.cos(ang) * L * .45, -i * .03], [0, 0, -side * ang])); }
  } else if (type === 'crystal') {
    const cm = pm(mixHex(a, '#FFFFFF', .35), { r: .05, cc: 1, ccr: .02, e: a, ei: .55, op: .82, env: 1.2 });
    for (let i = 0; i < 5; i++) { const t = i / 4, ang = lerp(1.15, .2, t), L = span * lerp(.6, 1, Math.sin(t * Math.PI * .8 + .2)); w.add(M(GEO.octa, i % 2 ? cm : pm('#FFFFFF', { r: .05, cc: 1, e: a, ei: .35, op: .9 }), [L * .14, L * .48, .06], [side * Math.sin(ang) * L * .46, Math.cos(ang) * L * .42, -t * .05], [0, 0, -side * ang])); }
  }
  return piv;
}
function tail(rig, parent, base, size, type, c, a, st) {
  const piv = new THREE.Group(); piv.position.set(...base); parent.add(piv); rig.tail = piv;
  const mc = pm(c, { r: .5, cc: .3, sh: '#FFFFFF', rim: mixHex(c, '#FFFFFF', .45), rimK: .4 }), ma = pm(a, { r: .4, cc: .4, sh: '#FFFFFF', rim: mixHex(a, '#FFFFFF', .45), rimK: .4 });
  const curl = (n, L) => { const pts = []; for (let i = 0; i < n; i++) { const t = i / (n - 1); pts.push([Math.sin(t * 2.2) * L * .25, Math.sin(t * Math.PI) * L * .35 + t * L * .35, -t * L]); } return pts; };
  if (type === 'nub') { piv.add(M(SPH, mc, [size * .32, size * .3, size * .3], [0, 0, -size * .1])); return piv; }
  if (type === 'fluff') { [[0, 0, 0, .42], [.12, .14, -.16, .3], [-.12, .12, -.14, .3], [0, .25, -.05, .28]].forEach(([x, y, z, r]) => piv.add(M(SPH, pm(mixHex(c, '#FFFFFF', .55), { r: .7, cc: .05, sh: '#FFFFFF' }), [r * size, r * size, r * size], [x * size, y * size, z * size - size * .2]))); return piv; }
  const L = size * (st >= 4 ? 2.1 : st === 3 ? 1.6 : 1.1);
  const pts = curl(6, L);
  const g = limb(piv, mc, pts, size * .2, size * .07, false), e = g.userData.end;
  if (type === 'star' || type === 'comet') {
    const s = M(GEO.star, pm('#FFE066', { r: .2, cc: .8, e: '#FFC21A', ei: .55 }), [size * .32, size * .32, size * .32], [e.x, e.y + size * .1, e.z]); piv.add(s); rig.spin.push(s);
    if (type === 'comet') for (let i = 1; i < 7; i++) piv.add(M(SPHL, glowMat(i % 2 ? a : '#FFFFFF'), [.07 - i * .008, .07 - i * .008, .07 - i * .008], [e.x - Math.sin(i) * .08, e.y - i * .05, e.z + i * .16]));
  }
  if (type === 'long') piv.add(M(GEO.drop, ma, [size * .2, size * .32, size * .2], [e.x, e.y + size * .08, e.z], [-.9, 0, 0]));
  if (type === 'leaf') piv.add(M(GEO.leaf, ma, [size * .24, size * .46, .05], [e.x, e.y + size * .25, e.z], [-.5, 0, 0]));
  if (type === 'feathers') for (let i = -1; i <= 1; i++) piv.add(M(GEO.drop, i ? ma : mc, [size * .1, size * .34, size * .04], [e.x + i * size * .1, e.y + size * .15, e.z], [-.9, 0, i * .45]));
  return piv;
}
function ears(rig, head, R, deform, type, c, a, L) {
  const inner = pm('#FFB7CF', { r: .6, cc: .1, sh: '#FFFFFF' }), mc = pm(c, { r: .5, cc: .3, sh: '#FFFFFF', rim: mixHex(c, '#FFFFFF', .45), rimK: .45 }), ma = pm(a, { r: .45, cc: .35, sh: '#FFFFFF', rim: mixHex(a, '#FFFFFF', .45), rimK: .4 });
  const TILT = { cat: .38, long: .22, round: .55, fin: 1.25, leaf: .95 };
  const add = (d, th, ph, fn) => { const g = stick(head, R, d * th, ph, deform, R[0] * .04); g.quaternion.setFromEuler(new THREE.Euler(-.12, 0, -d * TILT[type])); const p = new THREE.Group(); g.add(p); fn(p); rig.ears.push([p, d]); };
  [-1, 1].forEach(d => {
    if (type === 'cat') add(d, .5, .82, p => { p.add(M(GEO.drop, mc, [R[0] * .32, R[0] * .46, R[0] * .18], [0, R[0] * .36, 0])); p.add(M(GEO.drop, inner, [R[0] * .17, R[0] * .27, R[0] * .08], [0, R[0] * .38, R[0] * .1])); });
    if (type === 'long') add(d, .32, .95, p => { p.rotation.x = -.18; p.add(M(GEO.drop, mc, [R[0] * .22, R[0] * .7, R[0] * .14], [0, R[0] * .72, 0])); p.add(M(GEO.drop, inner, [R[0] * .12, R[0] * .52, R[0] * .07], [0, R[0] * .7, R[0] * .08])); p.add(M(GEO.drop, ma, [R[0] * .15, R[0] * .2, R[0] * .11], [0, R[0] * 1.38, 0])); });
    if (type === 'round') add(d, .58, .78, p => { p.add(M(SPH, mc, [R[0] * .26, R[0] * .25, R[0] * .16], [0, R[0] * .2, 0])); p.add(M(SPH, inner, [R[0] * .15, R[0] * .14, R[0] * .08], [0, R[0] * .2, R[0] * .1])); });
    if (type === 'fin') add(d, 1.25, .3, p => { [0, 1, 2].forEach(i => p.add(M(GEO.drop, i === 1 ? ma : mc, [R[0] * .14, R[0] * (.42 - i * .07), R[0] * .06], [d * i * R[0] * .07, R[0] * .2, -i * R[0] * .08], [0, 0, -d * (i - 1) * .35]))); });
    if (type === 'leaf') add(d, .78, .72, p => { p.add(M(GEO.leaf, ma, [R[0] * .24, R[0] * .46, R[0] * .06], [0, R[0] * .5, 0])); p.add(M(new THREE.CylinderGeometry(.008, .012, R[0] * .6, 6), pm(darken(a, .7)), [1, 1, 1], [0, R[0] * .36, R[0] * .045])); });
  });
}
function topper(rig, head, R, deform, L, sp, st) {
  const a = sp.accent;
  if (L === 'B') { const g = stick(head, R, 0, 1.2, deform, R[1] * .04); g.quaternion.setFromEuler(new THREE.Euler(-.35, 0, 0)); const n = st >= 3 ? 5 : 3; for (let j = 0; j < n; j++) { const i = j - (n - 1) / 2; g.add(M(GEO.drop, pm(Math.abs(i) < .6 ? a : '#' + VIVID(sp.color).getHexString(), { r: .45, cc: .3, sh: '#FFFFFF' }), [R[0] * .1, R[0] * (.42 - Math.abs(i) * .08) * (st >= 3 ? 1.3 : 1), R[0] * .07], [i * R[0] * .1, R[0] * .3, -Math.abs(i) * R[0] * .05], [-.25, 0, -i * .38])); } }
  if (L === 'C' && st <= 2 && !(sp.extras || []).includes('rock')) { const g = stick(head, R, 0, 1.3, deform, 0); g.quaternion.identity(); g.add(M(new THREE.CylinderGeometry(.022, .03, .24, 8), pm('#5E9E3A'), [1, 1, 1], [0, .1, 0])); [-1, 1].forEach(d => g.add(M(GEO.leaf, pm(d < 0 ? '#6CC644' : '#9BE36A', { r: .45, cc: .4, sh: '#F0FFE0' }), [.12, .22, .03], [d * .14, .26, 0], [0, 0, -d * 1.1]))); const p = g; rig.floaters.push(p); }
}
function horns(head, R, deform, n, a, big) {
  const hm = pm(mixHex(a, '#FFFFFF', .25), { r: .25, cc: .9, ccr: .1, sh: '#FFFFFF', rim: '#FFFFFF', rimK: .25 });
  if (n === 1) { const g = stick(head, R, 0, .92, deform, 0); g.rotation.x -= .25; const len = R[0] * (big ? .62 : .45); g.add(M(GEO.cone, hm, [R[0] * .1, len, R[0] * .1], [0, len * .45, 0])); for (let i = 0; i < 3; i++) g.add(M(new THREE.TorusGeometry(R[0] * (.085 - i * .02), R[0] * .018, 8, 20), pm('#FFFFFF', { r: .3 }), [1, 1, 1], [0, len * (.15 + i * .25), 0], [Math.PI / 2, 0, 0])); }
  if (n === 2) [-1, 1].forEach(d => { const g = stick(head, R, d * .38, .98, deform, 0); g.rotation.z += -d * .35; g.rotation.x -= .3; const len = R[0] * (big ? .5 : .32); g.add(M(GEO.cone, hm, [R[0] * .09, len, R[0] * .09], [0, len * .45, 0])); g.add(M(SPHL, hm, [R[0] * .09, R[0] * .06, R[0] * .09], [0, 0, 0])); });
}
function extras(rig, head, body, sp, top, hz, R, deform, B) {
  const a = sp.accent, X = sp.extras || [], st = sp.vst ?? sp.stage;
  const hp = head.position;
  if (X.includes('halo')) { const h = new THREE.Mesh(new THREE.TorusGeometry(R[0] * .62, .035, 12, 64), glowMat(a)); h.position.set(0, top + .3, hp.z - .05); h.rotation.x = Math.PI / 2 - .25; body.add(h); rig.floaters.push(h); }
  if (X.includes('crown')) { const cr = stick(head, R, 0, 1.1, deform, R[1] * .06); const gold = pm('#FFC93D', { m: .85, r: .25, cc: .6, env: 1 }); cr.add(M(new THREE.CylinderGeometry(R[0] * .26, R[0] * .3, R[0] * .14, 28, 1, true), gold, [1, 1, 1], [0, R[0] * .06, 0])); for (let i = 0; i < 5; i++) { const an = i / 5 * Math.PI * 2; cr.add(M(SPHL, gold, [R[0] * .055, R[0] * .055, R[0] * .055], [Math.cos(an) * R[0] * .28, R[0] * .2, Math.sin(an) * R[0] * .28])); cr.add(M(SPHL, pm(i % 2 ? '#FF4D6D' : '#3D7BFF', { r: .05, cc: 1 }), [R[0] * .04, R[0] * .04, R[0] * .03], [Math.cos(an) * R[0] * .29, R[0] * .06, Math.sin(an) * R[0] * .29])); } }
  if (X.includes('moon')) { const g = stick(head, R, -.42, .7, deform, 0); g.add(M(new THREE.TorusGeometry(R[0] * .17, R[0] * .06, 14, 32, Math.PI * 1.3), pm('#FFE9A8', { e: '#FFD34D', ei: .5, r: .2, cc: .8 }), [1, 1, 1], [0, R[0] * .1, R[0] * .02], [0, 0, .8])); }
  if (X.includes('star')) { const s = M(GEO.star, pm('#FFE066', { e: '#FFC21A', ei: .6, r: .2, cc: .9 }), [R[0] * .17, R[0] * .17, R[0] * .17], [0, top + .32, hp.z]); body.add(s); rig.floaters.push(s); }
  if (X.includes('crystals')) [[0, .2, -.75, .3], [.32, .1, -.68, .2], [-.32, .12, -.68, .22]].forEach(([x, y, z, r]) => body.add(M(GEO.octa, pm(mixHex(a, '#FFFFFF', .3), { r: .05, cc: 1, e: a, ei: .45, op: .88 }), [r * .45 * B, r * B, r * .45 * B], [x * B, B * 1.35 + y * B, z * B], [-.5, 0, x])));
  if (X.includes('rock')) { const rm = pm(darken(sp.color, .72), { r: .85, cc: .05, sh: '#FFFFFF' }); [[0, .45, -.82, .42], [.42, .3, -.6, .28], [-.42, .32, -.62, .3], [0, 1.0, -.6, .26]].forEach(([x, y, z, r]) => body.add(M(GEO.dodeca, rm, [r * B, r * .78 * B, r * B], [x * B, B + y * B, z * B], [x * 2, y * 3, z]))); }
  if (X.includes('flower')) { const f = stick(head, R, -.55, .8, deform, 0); const pet = pm(sp.line === 'C' ? '#FF8FB1' : a, { r: .45, cc: .35, sh: '#FFFFFF' }); for (let i = 0; i < 6; i++) { const an = i / 6 * Math.PI * 2; f.add(M(GEO.drop, pet, [R[0] * .09, R[0] * .14, R[0] * .04], [Math.cos(an) * R[0] * .12, Math.sin(an) * R[0] * .12, R[0] * .04], [0, 0, an - Math.PI / 2])); } f.add(M(SPHL, pm('#FFE066', { r: .3, e: '#FFB300', ei: .2 }), [R[0] * .08, R[0] * .08, R[0] * .06], [0, 0, R[0] * .06])); }
  if (X.includes('leaves') && !(st <= 2 && sp.line === 'C')) { const g = stick(head, R, .5, .85, deform, 0); [-1, 1].forEach(d => g.add(M(GEO.leaf, pm(d < 0 ? '#7BCB4E' : '#E8643A', { r: .45, cc: .35, sh: '#F0FFE0' }), [R[0] * .1, R[0] * .22, .025], [d * R[0] * .1, R[0] * .16, 0], [0, 0, -d * .9]))); }
  if (X.includes('mane')) { const mm = pm(mixHex(a, '#FFFFFF', .2), { r: .7, cc: .05, sh: '#FFFFFF' }); for (let i = 0; i < 12; i++) { const an = i / 12 * Math.PI * 2; body.add(M(SPH, mm, [B * .2, B * .2, B * .2], [Math.cos(an) * B * .62, hp.y - R[1] * .62 + Math.sin(an) * .06, Math.sin(an) * B * .5 + .05])); } }
  if (false) { const wm = pm('#FFFFFF', { r: .7, cc: 0, sh: '#DDF6FF', op: .85 }); const ring = new THREE.Group(); ring.position.y = top * .45; rig.root.add(ring); rig.spin.push(ring); ring.rotation.x = Math.PI / 2 + .25; for (let i = 0; i < (X.includes('swirl2') ? 5 : 3); i++) { const an = i / 3 * Math.PI * 2, g = new THREE.Group(); g.position.set(Math.cos(an) * B * 1.7, Math.sin(an) * B * 1.7, 0); ring.add(g); [[0, 0, .14], [.13, .03, .1], [-.12, .02, .1]].forEach(([x, y, r]) => g.add(M(SPHL, wm, [r, r * .8, r], [x, y, 0]))); } }
  if (X.includes('spikes')) for (let i = 0; i < 4; i++) { const t = i / 3; body.add(M(SPH, pm(a, { r: .4, cc: .4, sh: '#FFFFFF' }), [B * .1, B * .14, B * .1], [0, B * (1.75 - t * .6), -B * (.55 + t * .2)], [-.6 - t * .3, 0, 0])); }
}

/* ---------- body plans ---------- */
const IRIS = { A: '#8A5BFF', B: '#1E8BFF', C: '#22B35E', egg: '#FF7A2F' };
function buildMonster(sp) {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const rig = { root, body, wings: [], spin: [], floaters: [], eyes: [], cheeks: [], ears: [], arms: [], sp, head: null, tail: null };
  const c = sp.color, a = sp.accent, bel = sp.belly || '#FFF5E8', L = sp.line, st = sp.vst ?? sp.stage, X = sp.extras || [];
  const iris = sp.secret ? '#FF9F1C' : sp.pat === 'bolt' ? '#3FA7F5' : sp.pat === 'stripe' ? '#B36BFF' : IRIS[L];
  if (st === 0 && !(typeof MOTIF !== 'undefined' && MOTIF[sp.id])) {
    const tex = eggTextures(c, a, sp.pat); const em = pm('#FFFFFF', { map: tex.map, emap: tex.emap, e: sp.pat === 'bolt' ? '#5CC8FF' : sp.pat === 'stripe' ? '#D29BFF' : '#FFB25C', ei: 0, r: sp.pat === 'bolt' ? .3 : .38, cc: .7, ccr: .12, sh: '#FFFFFF', rim: sp.pat === 'bolt' ? '#6FD0FF' : sp.pat === 'stripe' ? '#F0E0FF' : '#FFE6CC', rimK: .3 });
    body.add(M(GEO.egg, em, [.95, .95, .95], [0, 1, 0])); rig.crack = em;
    const head = new THREE.Group(); head.position.set(0, 1, 0); body.add(head); rig.head = head;
    const R = [.95, .95 * 1.28, .95], dz = v => { if (v.y > 0) { const k = 1 - .2 * v.y; v.x *= k; v.z *= k; } };
    // the egg peeks out through its shell: big eyes + blush + tiny ω
    face(rig, head, [.95, .95, .95], dz, { iris, ex: .33, ey: .05, ew: .17, eh: .21, my: -.17, ms: .035, cx: .56, cy: -.1, cs: .12 });
    [-1, 1].forEach(d => body.add(M(SPH, pm(mixHex(c, '#FFFFFF', .2), { r: .5, cc: .3, sh: '#FFFFFF' }), [.21, .13, .27], [d * .34, .1, .22])));
    if (sp.pat === 'bolt') { // shades pushed up on the forehead
      const g = stick(head, R, 0, .58, dz, -.015); g.rotateX(-.12);
      const lens = pm('#120E20', { r: .04, cc: 1, ccr: .02, m: .45, env: 2.2 }), fr = pm('#3FA7F5', { r: .25, cc: 1 });
      [-1, 1].forEach(d => { const L = new THREE.Group(); L.position.set(d * .2, 0, 0); L.rotation.y = d * .28; g.add(L);
        L.add(M(new THREE.CylinderGeometry(.16, .16, .05, 32), fr, [1.12, 1, .82], [0, 0, 0], [Math.PI / 2, 0, 0]));
        L.add(M(new THREE.CylinderGeometry(.16, .16, .05, 32), lens, [1, 1, .72], [0, 0, .012], [Math.PI / 2, 0, 0]));
        const gl = new THREE.Mesh(new THREE.PlaneGeometry(.12, .03), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .6 })); gl.position.set(-.04, .05, .045); gl.rotation.z = .5; L.add(gl); });
      g.add(M(new THREE.BoxGeometry(.12, .035, .04), fr, [1, 1, 1], [0, .03, 0]));
    }
    if (sp.pat === 'stripe') { // big DJ headphones over the shell
      const band = pm('#2B2633', { r: .3, cc: .8 }), cup = pm(a, { r: .25, cc: 1, ccr: .1 }), pad = pm('#F3EFE6', { r: .8, sh: '#FFFFFF' });
      const b = M(new THREE.TorusGeometry(1, .055, 12, 64, Math.PI), band, [1.03, 1.18, 1], [0, .05, -.05]); head.add(b);
      [-1, 1].forEach(d => { const g = new THREE.Group(); g.position.set(d * .99, .04, -.05); g.rotation.z = d * Math.PI / 2; head.add(g);
        g.add(M(new THREE.CylinderGeometry(.25, .27, .16, 32), cup, [1, 1, 1], [0, -.04, 0]));
        g.add(M(new THREE.TorusGeometry(.2, .06, 10, 32), pad, [1, 1, 1], [0, .05, 0], [Math.PI / 2, 0, 0]));
        g.add(M(new THREE.CylinderGeometry(.13, .13, .03, 24), pm('#FFFFFF', { r: .2, cc: 1, e: a, ei: .4 }), [1, 1, 1], [0, -.13, 0])); });
    }
    rig.top = 2.3; rig.center = 1.1; return rig;
  }
  if (typeof buildAnimal === 'function' && MOTIF[sp.id]) return buildAnimal(sp, rig);
  // proportions by stage: big head, small body, the head keeps dominating even at the final form
  const P = [null, { B: .44, H: .62, leg: 0, tall: 1 }, { B: .52, H: .66, leg: .1, tall: 1.05 }, { B: .62, H: .72, leg: .24, tall: 1.14 }, { B: .8, H: .84, leg: .32, tall: 1.2 }][st];
  const sh0 = sp.shape || [1, 1, 1], sh = [sh0[0], sh0[1] * P.tall, sh0[2]], B = P.B;
  const skin = skinMat(c, { rim: sp.secret ? .5 : .26 });
  const bellyDir = [0, -.25, 1];
  const paintBody = toyPaint(c, bel, bellyDir, .95, { lo: .55, hi: .8, rainbow: sp.secret });
  const by = P.leg + B * sh[1] * .78;
  const bodyM = blob(skin, [B * sh[0] * 1.08, B * sh[1] * .9, B * sh[2] * .98], paintBody, v => { if (v.y < 0) v.y *= .82; v.x *= 1 + .08 * Math.max(0, -v.y); }); bodyM.position.set(0, by, 0); body.add(bodyM);
  // head
  const head = new THREE.Group(); body.add(head); rig.head = head;
  const Hr = P.H, R = [Hr * 1.1, Hr * .95, Hr * 1.0];
  head.position.set(0, by + B * sh[1] * .42 + Hr * .58, B * .02);
  const facePatch = L === 'B' ? .85 : L === 'C' ? .4 : 0;
  head.add(blob(skin, R, toyPaint(c, bel, [0, -.45, 1], facePatch, { lo: .5, hi: .85, rainbow: sp.secret, under: 0 }), mochi));
  const big = st >= 3;
  face(rig, head, R, mochi, { iris, ex: .36, ey: -.1, ew: Hr * (st === 1 ? .27 : st === 2 ? .25 : .23), eh: Hr * (st === 1 ? .33 : st === 2 ? .31 : .29), my: -.34, ms: Hr * .055, cx: .62, cy: -.27, cs: Hr * .16, beak: L === 'B' ? '#FFB13D' : null });
  // ears / head décor
  const earType = sp.ears || (L === 'C' ? 'round' : L === 'A' ? 'cat' : null);
  if (earType) ears(rig, head, R, mochi, earType, '#' + VIVID(c).getHexString(), a, L);
  topper(rig, head, R, mochi, L, sp, st);
  if (sp.horns) horns(head, R, mochi, sp.horns, a, big);
  // arms: little nubs on pivots (they wave when dancing)
  const cv = '#' + VIVID(c).getHexString(), am = pm(cv, { r: .5, cc: .3, sh: '#FFFFFF', rim: mixHex(c, '#FFFFFF', .45), rimK: .42 });
  if (L !== 'B') [-1, 1].forEach(d => { const piv = new THREE.Group(); piv.position.set(d * B * sh[0] * .82, by + B * .25, B * .12); body.add(piv); piv.userData.base = .55; rig.arms.push([piv, d]);
    const len = B * (st >= 3 ? .62 : .5); piv.add(M(SPH, am, [B * .2, len * .62, B * .2], [d * len * .25, -len * .45, 0], [0, 0, d * .35])); });
  // feet
  const fm = pm(mixHex(cv, '#FFFFFF', .15), { r: .5, cc: .3, sh: '#FFFFFF' }), pad = pm('#FFB7CF', { r: .6 });
  [-1, 1].forEach(d => {
    if (P.leg) body.add(M(SPH, am, [B * .26, P.leg * .9 + B * .2, B * .28], [d * B * .4, P.leg * .7, 0]));
    body.add(M(SPH, fm, [B * .3, B * .17, B * .4], [d * B * .42, B * .1, B * .2]));
    if (st >= 3) for (let i = -1; i <= 1; i++) body.add(M(SPHL, fm, [B * .09, B * .08, B * .09], [d * B * .42 + i * B * .13, B * .1, B * .55]));
    body.add(M(SPHL, pad, [B * .14, .01, B * .16], [d * B * .42, .005, B * .22]));
  });
  // wings
  const wt = sp.wings === 'crystal' ? 'crystal' : sp.wings === 'leaf' ? 'leaf' : sp.wings === 'big' ? 'big' : sp.wings === 'small' ? 'small' : null;
  if (wt) { const c2 = cv; const span = { small: .62, big: st >= 4 ? 2.1 : 1.25, leaf: st >= 4 ? 1.9 : 1.05, crystal: st >= 4 ? 2.1 : 1.3 }[wt] * (B / .64);
    [-1, 1].forEach(d => wing(rig, body, wt, d, span, c2, a, [B * sh[0] * .5, by + B * .45, -B * .55, st >= 4 ? .35 : .18])); }
  if (L === 'B') [-1, 1].forEach(d => { const w = wing(rig, body, 'small', d, .62 * (B / .5), cv, a, [B * .9, by + B * .05, B * .05, .25]); rig.arms.push([w, d]); rig.wings.pop(); });
  // tail
  const tt = sp.tail === 'comet' ? 'comet' : sp.tail === 'star' ? 'star' : sp.tail === 'long' ? 'long' : sp.tail === 'leaf' ? 'leaf' : sp.tail === 'fluff' ? 'fluff' : sp.tail === 'nub' ? 'nub' : L === 'B' ? 'feathers' : 'nub';
  tail(rig, body, [0, by - B * .25, -B * sh[2] * .85], B * (st >= 3 ? 1.1 : 1), tt === 'nub' && L === 'B' ? 'feathers' : tt, cv, a, st);
  // growth cues: chest ruff from stage 3, full collar + glowing forehead gem + cheek marks at the final form
  if (st >= 3) {
    const fl = pm(mixHex(bel, '#FFFFFF', .35), { r: .7, cc: .05, sh: '#FFFFFF', rim: '#FFFFFF', rimK: .2 }), fa = pm(mixHex(a, '#FFFFFF', .2), { r: .6, cc: .1, sh: '#FFFFFF' });
    const ny = by + B * sh[1] * .56, n = st >= 4 ? 22 : 7, span = st >= 4 ? Math.PI * 2 : 1.6;
    for (let i = 0; i < n; i++) { const t = st >= 4 ? i / n * span : (i / (n - 1) - .5) * span; const rr = st >= 4 ? .92 : .86;
      const tuft = new THREE.Group(); tuft.position.set(Math.sin(t) * B * sh[0] * rr, ny, Math.cos(t) * B * sh[2] * rr); tuft.rotation.y = t; body.add(tuft);
      tuft.add(M(SPH, fl, [B * .24, B * .19, B * .17], [0, -B * .02, 0])); }
  }
  if (st >= 4) {
    const gem = stick(head, R, 0, .42, mochi, -.01); gem.add(M(GEO.octa, pm(a, { r: .05, cc: 1, e: a, ei: .9, env: 1.3 }), [R[0] * .09, R[0] * .13, R[0] * .05]));
    [-1, 1].forEach(d => { const g = stick(head, R, d * .78, .12, mochi, -.006); g.add(M(GEO.star, glowMat(mixHex(a, '#FFFFFF', .3)), [R[0] * .045, R[0] * .045, .01])); });
  }
  const top = head.position.y + R[1] * .95, hz = head.position.z;
  body.userData.top = top - .3;
  extras(rig, head, body, sp, top, hz, R, mochi, B);
  rig.top = top + .3; rig.center = top * .5;
  return rig;
}
// egg pattern & crack textures
function eggTextures(c, a, pat) {
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 256; const x = cv.getContext('2d');
  x.fillStyle = c; x.fillRect(0, 0, 512, 256);
  if (pat === 'bolt') { // black egg with an electric zigzag and tiny sparks
    x.fillStyle = a; x.beginPath(); x.moveTo(0, 140); for (let i = 0; i <= 8; i++) x.lineTo(i * 64, i % 2 ? 108 : 150); x.lineTo(512, 176); for (let i = 8; i >= 0; i--) x.lineTo(i * 64, i % 2 ? 134 : 176); x.fill();
    x.fillStyle = '#FFE066'; x.beginPath(); x.moveTo(0, 186); for (let i = 0; i <= 16; i++) x.lineTo(i * 32, i % 2 ? 180 : 190); x.lineTo(512, 196); for (let i = 16; i >= 0; i--) x.lineTo(i * 32, i % 2 ? 186 : 196); x.fill();
    for (let i = 0; i < 16; i++) { const px = Math.random() * 512, py = 20 + Math.random() * 70, r = 3 + Math.random() * 5; x.globalAlpha = .8; x.fillStyle = i % 3 ? a : '#FFFFFF'; x.beginPath(); for (let k = 0; k < 8; k++) { const ang = k * Math.PI / 4, rr = k % 2 ? r * .35 : r; x.lineTo(px + Math.cos(ang) * rr, py + Math.sin(ang) * rr); } x.fill(); }
  } else if (pat === 'stripe') { // lilac egg with candy stripes that stretch toward the bottom
    for (let i = 0; i < 16; i++) { x.fillStyle = i % 2 ? a : '#FFFFFF'; x.globalAlpha = i % 2 ? .85 : .55; x.beginPath(); x.moveTo(i * 32, 0); x.lineTo(i * 32 + 12, 0); x.lineTo(i * 32 + 24, 256); x.lineTo(i * 32 + 6, 256); x.fill(); }
    x.globalAlpha = 1; x.fillStyle = '#FFC93D'; x.fillRect(0, 150, 512, 14); x.fillStyle = a; x.fillRect(0, 164, 512, 5);
  } else {
    x.fillStyle = a; x.beginPath(); x.moveTo(0, 150); for (let i = 0; i <= 16; i++) x.lineTo(i * 32, i % 2 ? 128 : 150); x.lineTo(512, 175); for (let i = 16; i >= 0; i--) x.lineTo(i * 32, i % 2 ? 160 : 182); x.fill();
    for (let i = 0; i < 22; i++) { x.globalAlpha = .55; x.beginPath(); x.arc(Math.random() * 512, 20 + Math.random() * 80, 4 + Math.random() * 10, 0, 7); x.fill(); }
  }
  const map = new THREE.CanvasTexture(cv); map.encoding = THREE.sRGBEncoding;
  const ce = document.createElement('canvas'); ce.width = 512; ce.height = 256; const y = ce.getContext('2d'); y.fillStyle = '#000'; y.fillRect(0, 0, 512, 256);
  y.strokeStyle = '#fff'; y.lineWidth = 3; y.lineJoin = 'round';
  for (let k = 0; k < 4; k++) { let px = 40 + k * 128, py = 30; y.beginPath(); y.moveTo(px, py); for (let s = 0; s < 6; s++) { px += (Math.random() - .5) * 40; py += 14 + Math.random() * 10; y.lineTo(px, py); } y.stroke(); }
  return { map, emap: new THREE.CanvasTexture(ce) };
}
function part(geo, color, o = {}) { const m = M(geo, pm(color)); if (o.s) m.scale.set(...o.s); if (o.p) m.position.set(...o.p); if (o.r) m.rotation.set(...o.r); return m; }
