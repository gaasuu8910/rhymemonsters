/* =========================================================
   WARDROBE — tailored, textured streetwear for the monsters
   fabrics (cotton, fleece, knit, denim, nylon, suiting, mesh, leather, felt) are procedural
   detail+bump maps; garments are cut to the body's own shape, with hem folds and quilting
   ========================================================= */
const FAB = {};
function fabricTex(kind) {
  if (FAB[kind]) return FAB[kind];
  const S = 512, mk = () => { const c = document.createElement('canvas'); c.width = c.height = S; return c; };
  const cm = mk(), cb = mk(), m = cm.getContext('2d'), b = cb.getContext('2d');
  let seed = 7 + kind.length * 131; const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  m.fillStyle = '#ffffff'; m.fillRect(0, 0, S, S); b.fillStyle = '#808080'; b.fillRect(0, 0, S, S);
  const noise = (n, size, a, ctx = b) => { for (let i = 0; i < n; i++) { ctx.fillStyle = `rgba(${r() < .5 ? '255,255,255' : '0,0,0'},${a})`; ctx.fillRect(r() * S, r() * S, size, size); } };
  if (kind === 'cotton') { for (let y = 0; y < S; y += 3) { b.fillStyle = `rgba(0,0,0,${.12 + r() * .05})`; b.fillRect(0, y, S, 1); } for (let x = 0; x < S; x += 3) { b.fillStyle = 'rgba(255,255,255,.1)'; b.fillRect(x, 0, 1, S); } noise(4000, 1, .12, m); }
  if (kind === 'fleece') { for (let i = 0; i < 2600; i++) { const x = r() * S, y = r() * S, rr = 2 + r() * 4, g = b.createRadialGradient(x, y, 0, x, y, rr); g.addColorStop(0, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(128,128,128,0)'); b.fillStyle = g; b.fillRect(x - rr, y - rr, rr * 2, rr * 2); } noise(3000, 2, .06, m); }
  if (kind === 'knit' || kind === 'rib') { const cw = kind === 'rib' ? 10 : 16, ch = kind === 'rib' ? 10 : 14;
    for (let col = 0; col * cw < S; col++) for (let row = 0; row * ch < S + ch; row++) { const x = col * cw, y = row * ch; [0, 1].forEach(s => { const g = b.createLinearGradient(x + s * cw / 2, y, x + cw / 2, y + ch); g.addColorStop(0, '#5a5a5a'); g.addColorStop(.5, '#d8d8d8'); g.addColorStop(1, '#5a5a5a'); b.fillStyle = g; b.beginPath(); b.moveTo(x + s * cw, y); b.lineTo(x + cw / 2, y + ch * .55); b.lineTo(x + cw / 2, y + ch * 1.05); b.lineTo(x + s * cw, y + ch * .5); b.fill(); }); }
    for (let col = 0; col * cw < S; col++) { m.fillStyle = 'rgba(0,0,0,.08)'; m.fillRect(col * cw, 0, 1, S); } }
  if (kind === 'denim') { for (let i = -S; i < S; i += 4) { b.strokeStyle = `rgba(${r() < .5 ? 0 : 255},${r() < .5 ? 0 : 255},${r() < .5 ? 0 : 255},.25)`; b.lineWidth = 1.6; b.beginPath(); b.moveTo(i, 0); b.lineTo(i + S, S); b.stroke(); } for (let i = 0; i < 900; i++) { m.fillStyle = `rgba(255,255,255,${r() * .25})`; m.fillRect(r() * S, r() * S, 1 + r() * 6, 1); } }
  if (kind === 'nylon') { noise(1800, 2, .05); for (let y = 0; y < S; y += 2) { m.fillStyle = `rgba(255,255,255,${r() * .04})`; m.fillRect(0, y, S, 1); } }
  if (kind === 'suit') { const w = 8; for (let y = 0; y < S; y += w) for (let x = 0; x < S; x += w * 2) { const up = (Math.floor(x / (w * 2)) % 2) === 0; b.strokeStyle = 'rgba(255,255,255,.22)'; b.lineWidth = 1.4; b.beginPath(); b.moveTo(x, up ? y : y + w); b.lineTo(x + w * 2, up ? y + w : y); b.stroke(); } noise(2000, 1, .05, m); }
  if (kind === 'mesh') { for (let y = 0; y < S; y += 9) for (let x = (y / 9 % 2) * 4.5; x < S; x += 9) { b.fillStyle = '#2a2a2a'; b.beginPath(); b.arc(x, y, 2.4, 0, 7); b.fill(); m.fillStyle = 'rgba(0,0,0,.18)'; m.beginPath(); m.arc(x, y, 2.4, 0, 7); m.fill(); } }
  if (kind === 'leather') { for (let i = 0; i < 1400; i++) { const x = r() * S, y = r() * S, rr = 3 + r() * 9; b.strokeStyle = 'rgba(40,40,40,.25)'; b.lineWidth = 1; b.beginPath(); b.arc(x, y, rr, r() * 6, r() * 6 + 2); b.stroke(); } }
  if (kind === 'felt') { for (let i = 0; i < 9000; i++) { b.strokeStyle = `rgba(${r() < .5 ? '255,255,255' : '0,0,0'},.12)`; b.lineWidth = 1; const x = r() * S, y = r() * S, a = r() * 6; b.beginPath(); b.moveTo(x, y); b.lineTo(x + Math.cos(a) * 4, y + Math.sin(a) * 4); b.stroke(); } }
  const map = new THREE.CanvasTexture(cm), bump = new THREE.CanvasTexture(cb);
  [map, bump].forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; }); map.encoding = THREE.sRGBEncoding;
  return FAB[kind] = { map, bump };
}
const FAB_SPEC = {
  cotton: { r: .82, sheen: .35, cc: 0, bump: .006, rep: [6, 3] }, fleece: { r: .9, sheen: .6, cc: 0, bump: .008, rep: [5, 3] }, knit: { r: .88, sheen: .45, cc: 0, bump: .022, rep: [10, 5] },
  rib: { r: .85, sheen: .4, cc: 0, bump: .02, rep: [24, 2] }, denim: { r: .8, sheen: .2, cc: 0, bump: .01, rep: [6, 3] }, nylon: { r: .28, sheen: .25, cc: .85, bump: .003, rep: [4, 2] },
  suit: { r: .62, sheen: .3, cc: .1, bump: .005, rep: [10, 5] }, mesh: { r: .55, sheen: .2, cc: .3, bump: .012, rep: [10, 5] }, leather: { r: .38, sheen: .1, cc: .7, bump: .006, rep: [4, 2] },
  felt: { r: .95, sheen: .5, cc: 0, bump: .012, rep: [4, 2] },
};
const CLOTH = {};
function cloth(color, kind = 'cotton', o = {}) {
  const key = color + kind + JSON.stringify(o); if (CLOTH[key]) return CLOTH[key];
  const S = FAB_SPEC[kind] || FAB_SPEC.cotton, t = fabricTex(kind), rep = o.rep || S.rep;
  const map = t.map.clone(), bump = t.bump.clone(); [map, bump].forEach(x => { x.needsUpdate = true; x.repeat.set(...rep); });
  const m = new THREE.MeshPhysicalMaterial({ color: SAT(color), map, bumpMap: bump, bumpScale: o.bump ?? S.bump, roughness: S.r, clearcoat: S.cc, clearcoatRoughness: .25, envMapIntensity: .55, side: o.ds ? THREE.DoubleSide : THREE.FrontSide });
  m.sheen = LIN(mixHex(color, '#FFFFFF', .5)).multiplyScalar(S.sheen);
  addRim(m, mixHex(color, '#FFFFFF', .35), .18);
  return CLOTH[key] = m;
}
const bodyDeform = v => { if (v.y < 0) v.y *= .82; v.x *= 1 + .08 * Math.max(0, -v.y); };
// a garment cut to the body: upper part of the body ellipsoid, inflated, with hem folds / quilting channels
function garmentGeo(t0, t1, o = {}) {
  const g = new THREE.SphereGeometry(1, 96, 64, 0, Math.PI * 2, t0, t1 - t0), p = g.attributes.position, v = new THREE.Vector3(), d = new THREE.Vector3();
  const inflate = o.inflate ?? .06, fold = o.fold ?? .025, quilt = o.quilt || 0, seed = o.seed || 1, def = o.deform || bodyDeform;
  for (let i = 0; i < p.count; i++) {
    v.set(p.getX(i), p.getY(i), p.getZ(i)); const un = v.clone(); d.copy(v); def(d);
    const phi = Math.atan2(un.x, un.z), hem = sstep(Math.cos(t1) + .45, Math.cos(t1), un.y);
    let disp = inflate + fold * hem * (Math.sin(phi * 9 + seed) * .6 + Math.sin(phi * 5 + seed * 2.3) * .4);
    if (quilt) disp += quilt * (Math.pow(Math.abs(Math.cos(un.y * Math.PI * 2.6)), .6) - .5) + quilt * .25 * Math.abs(Math.cos(phi * 3));
    if (o.flare) disp += o.flare * hem;
    d.addScaledVector(un, disp); p.setXYZ(i, d.x, d.y, d.z);
  }
  g.computeVertexNormals(); return g;
}
function hoodGeo(open, thick = 0) {
  const g = new THREE.SphereGeometry(1, 64, 48).toNonIndexed(), p = g.attributes.position, keep = [], fd = new THREE.Vector3(0, -.12, 1).normalize(), v = new THREE.Vector3(), c = Math.cos(open);
  for (let i = 0; i < p.count; i += 3) { v.set(0, 0, 0); for (let k = 0; k < 3; k++) v.x += p.getX(i + k) / 3, v.y += p.getY(i + k) / 3, v.z += p.getZ(i + k) / 3; v.normalize();
    if (v.dot(fd) > c || v.y < -.62) continue; for (let k = 0; k < 3; k++) { const x = p.getX(i + k), y = p.getY(i + k), z = p.getZ(i + k), fz = Math.atan2(x, -z); const w = 1 + .025 * Math.sin(fz * 7) * sstep(.2, -.5, y); keep.push(x * w, y * w, z * w); } }
  const out = new THREE.BufferGeometry(); out.setAttribute('position', new THREE.Float32BufferAttribute(keep, 3)); out.computeVertexNormals();
  const uv = []; for (let i = 0; i < keep.length; i += 3) uv.push(Math.atan2(keep[i], keep[i + 2]) / (Math.PI * 2) + .5, keep[i + 1] * .5 + .5); out.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  return out;
}
// bend a flat (XY-plane) geometry so it wraps a vertical cylinder of radius rad, facing +z
function bendAround(geo, rad) { const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), a = x / rad; p.setXYZ(i, Math.sin(a) * (rad + z), p.getY(i), Math.cos(a) * (rad + z) - rad); } geo.computeVertexNormals(); return geo; }
function roundedShape(w, h, rr) { const s = new THREE.Shape(), x = -w / 2, y = -h / 2; s.moveTo(x + rr, y); s.lineTo(x + w - rr, y); s.quadraticCurveTo(x + w, y, x + w, y + rr); s.lineTo(x + w, y + h - rr); s.quadraticCurveTo(x + w, y + h, x + w - rr, y + h); s.lineTo(x + rr, y + h); s.quadraticCurveTo(x, y + h, x, y + h - rr); s.lineTo(x, y + rr); s.quadraticCurveTo(x, y, x + rr, y); return s; }
const ext = (shape, depth, bev) => { const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 4, curveSegments: 16 }); g.translate(0, 0, -depth / 2); return g; };
// stitches: a dashed thread along a curve
function stitch(parent, pts, color, rad) { const curve = new THREE.CatmullRomCurve3(pts), n = Math.max(6, Math.floor(curve.getLength() / (rad * 7))), mat = pm(color, { r: .7, cc: 0 }); for (let i = 0; i < n; i++) { const t = (i + .25) / n, t2 = (i + .7) / n, a = curve.getPointAt(t), b2 = curve.getPointAt(t2); const g = new THREE.CylinderGeometry(rad, rad, a.distanceTo(b2), 4); const m = new THREE.Mesh(g, mat); m.position.copy(a).add(b2).multiplyScalar(.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b2.clone().sub(a).normalize()); parent.add(m); } }
const metal = (c = '#FFC93D') => pm(c, { m: .92, r: .18, cc: .8, env: 1.4 });
function decalTex(draw, w, h, o = {}) { const cv = document.createElement('canvas'); cv.width = 512; cv.height = Math.round(512 * h / w); const x = cv.getContext('2d'); draw(x, cv.width, cv.height); const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4;
  const g = new THREE.PlaneGeometry(w, h, 16, 4); if (o.bend) bendAround(g, o.bend); const m = new THREE.Mesh(g, new THREE.MeshPhysicalMaterial({ map: t, transparent: true, roughness: o.r ?? .7, clearcoat: o.cc ?? 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, bumpMap: o.bump ? t : null, bumpScale: o.bump || 0 })); m.renderOrder = 3; return m; }
// embroidered text: thread-like strokes with an outline
function embroider(x, W, H, text, fill, line, size) { x.font = `900 ${size}px "Arial Black", Arial, sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round'; x.strokeStyle = line; x.lineWidth = size * .16; x.strokeText(text, W / 2, H / 2 + size * .05); x.fillStyle = fill; x.fillText(text, W / 2, H / 2 + size * .05);
  x.globalCompositeOperation = 'source-atop'; for (let i = -W; i < W * 2; i += 7) { x.strokeStyle = 'rgba(0,0,0,.14)'; x.lineWidth = 2; x.beginPath(); x.moveTo(i, 0); x.lineTo(i + H, H); x.stroke(); } x.globalCompositeOperation = 'source-over'; }
