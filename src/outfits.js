/* =========================================================
   OUTFITS — every monster dresses like a tiny rapper: hoodies, suits, varsity jackets, puffers,
   caps & beanies, shades, gold chains, headphones, sneakers, a mic in hand
   ========================================================= */
const OUTFIT = {
  1: { top: 'hoodie', topC: '#FFFFFF', hood: true, neck: 'chain', shoes: 'sneakers', shoeC: '#FF8FB1' },
  2: { top: 'varsity', topC: '#E8452C', hat: 'capBack', hatC: '#2B2633', shoes: 'sneakers', shoeC: '#E8452C' },
  3: { top: 'tee', topC: '#2B2633', print: 'star', hat: 'beanie', hatC: '#FFC93D', glasses: 'round', shoes: 'sneakers', shoeC: '#FFFFFF' },
  4: { top: 'puffer', topC: '#B98CFF', glasses: 'star', neck: 'chain', shoes: 'sneakers', shoeC: '#FFFFFF' },
  5: { top: 'puffer', topC: '#2B2633', glasses: 'shades', neck: 'bigChain', shoes: 'sneakers', shoeC: '#FFC93D', mic: true },
  6: { top: 'overalls', topC: '#3D7BFF', hat: 'bucket', hatC: '#FFE066', shoes: 'sneakers', shoeC: '#FFFFFF' },
  28: { top: 'hoodie', topC: '#56D9F5', neck: 'phonesNeck', shoes: 'sneakers', shoeC: '#FFFFFF', mic: true },
  7: { top: 'hoodie', topC: '#2B2633', hood: true, glasses: 'shades', shoes: 'sneakers', shoeC: '#2B2633' },
  8: { top: 'suit', topC: '#FFFFFF', neck: 'bowtie', neckC: '#FFC93D', glasses: 'star', shoes: 'sneakers', shoeC: '#FFFFFF' },
  9: { top: 'tracksuit', topC: '#2E9B5E', hat: 'bucket', hatC: '#2B2633', neck: 'chain', shoes: 'sneakers', shoeC: '#FFFFFF' },
  10: { top: 'tee', topC: '#FF5C8A', print: 'heart', hat: 'cap', hatC: '#3D7BFF', shoes: 'sneakers', shoeC: '#FFFFFF', mic: true },
  11: { top: 'suit', topC: '#1E1A2E', neck: 'tie', neckC: '#E8452C', glasses: 'shades', shoes: 'sneakers', shoeC: '#2B2633' },
  12: { top: 'jersey', topC: '#FFC21A', num: '23', hat: 'capBack', hatC: '#E8452C', shoes: 'sneakers', shoeC: '#FFFFFF' },
  13: { top: 'puffer', topC: '#E8452C', glasses: 'shades', neck: 'chain', shoes: 'sneakers', shoeC: '#FFFFFF' },
  14: { top: 'varsity', topC: '#1E1A2E', glasses: 'visor', neck: 'bigChain', shoes: 'sneakers', shoeC: '#FFE066', mic: true },
  15: { top: 'tee', topC: '#FFFFFF', print: 'moon', glasses: 'round', neck: 'bowtie', neckC: '#E8452C', shoes: 'sneakers', shoeC: '#9C7BE0' },
  16: { top: 'tee', topC: '#2B2633', print: 'star', neck: 'bandana', neckC: '#E8452C', glasses: 'shades', shoes: 'sneakers', shoeC: '#43D6A6' },
  17: { hat: 'snapback', hatC: '#FF5C8A', neck: 'bigChain', glasses: 'shades' },
  18: { top: 'hoodie', topC: '#FFC93D', hat: 'beanie', hatC: '#E8452C', neck: 'scarf', neckC: '#FFFFFF', shoes: 'sneakers', shoeC: '#2B2633' },
  19: { top: 'hoodie', topC: '#E8452C', hood: true, hoodEars: true, neck: 'chain', shoes: 'sneakers', shoeC: '#FFFFFF' },
  20: { top: 'jersey', topC: '#3D7BFF', num: '8', neck: 'phonesNeck', shoes: 'sneakers', shoeC: '#FFFFFF' },
  21: { top: 'tee', topC: '#3D7BFF', print: 'star', neck: 'bandana', neckC: '#FF5C8A', shoes: 'sneakers', shoeC: '#FFFFFF' },
  22: { top: 'tee', topC: '#FFFFFF', print: 'heart', hat: 'capBack', hatC: '#3D7BFF', neck: 'chain', shoes: 'sneakers', shoeC: '#E8452C' },
  23: { top: 'suit', topC: '#2E5E3E', neck: 'bowtie', neckC: '#FFC93D', glasses: 'round', shoes: 'sneakers', shoeC: '#FFFFFF' },
  24: { top: 'tracksuit', topC: '#E8452C', neck: 'bigChain', glasses: 'shades', shoes: 'sneakers', shoeC: '#FFFFFF' },
  25: { top: 'puffer', topC: '#FFC21A', glasses: 'shades', neck: 'bigChain', shoes: 'sneakers', shoeC: '#2B2633' },
  26: { top: 'varsity', topC: '#6B4A33', neck: 'bigChain', hat: 'capBack', hatC: '#FFC93D', shoes: 'sneakers', shoeC: '#FFFFFF', mic: true },
  27: { top: 'tee', topC: '#7FC45E', print: 'heart', neck: 'phonesNeck', shoes: 'sneakers', shoeC: '#FFFFFF' },
  29: { top: 'hoodie', topC: '#FFFFFF', glasses: 'star', neck: 'bigChain', shoes: 'sneakers', shoeC: '#FFC93D', mic: true },
};
const FABRIC = c => pm(c, { r: .78, cc: .04, sh: '#FFFFFF', rim: mixHex(c, '#FFFFFF', .35), rimK: .25 });
const GOLD = () => pm('#FFC93D', { m: .9, r: .2, cc: .7, env: 1.3 });
function decal(draw, w, h) { const cv = document.createElement('canvas'); cv.width = 256; cv.height = 256; const x = cv.getContext('2d'); draw(x); const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshPhysicalMaterial({ map: t, transparent: true, roughness: .6, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 })); return m; }
// garment shell: the upper part of an ellipsoid hugging the body
function shell(R, t0, t1, mat, phi0 = 0, phiL = Math.PI * 2) { const g = new THREE.SphereGeometry(1, 48, 32, phi0, phiL, t0, t1 - t0); const m = new THREE.Mesh(g, mat); m.scale.set(...R); m.castShadow = true; m.receiveShadow = true; return m; }
// a hood: the head shell with an oval face opening cut out at the front
function hoodGeo(open) {
  const g = new THREE.SphereGeometry(1, 56, 40).toNonIndexed(), p = g.attributes.position, keep = [], fd = new THREE.Vector3(0, -.12, 1).normalize(), v = new THREE.Vector3(), c = Math.cos(open);
  for (let i = 0; i < p.count; i += 3) { v.set(0, 0, 0); for (let k = 0; k < 3; k++) v.x += p.getX(i + k) / 3, v.y += p.getY(i + k) / 3, v.z += p.getZ(i + k) / 3; v.normalize();
    if (v.dot(fd) > c || v.y < -.62) continue; for (let k = 0; k < 3; k++) keep.push(p.getX(i + k), p.getY(i + k), p.getZ(i + k)); }
  const out = new THREE.BufferGeometry(); out.setAttribute('position', new THREE.Float32BufferAttribute(keep, 3)); out.computeVertexNormals(); return out;
}
function dressUp(rig, o) {
  const F = OUTFIT[rig.sp.id]; if (!F) return;
  const { head, body, R, B, BR, by, ex, ey, ew, eh, st, sh } = o, r0 = R[0];
  const front = (y) => { const k = clamp(1 - Math.pow((y - by) / BR[1], 2), 0, 1); return BR[2] * Math.sqrt(k); }; // body surface z at height y
  // ---- tops
  if (F.top) {
    const fab = F.top === 'puffer' ? pm(F.topC, { r: .3, cc: .9, ccr: .2, sh: '#FFFFFF' }) : FABRIC(F.topC);
    const top = shell([BR[0] * 1.06, BR[1] * 1.04, BR[2] * 1.06], 0, Math.PI * .72, fab); top.position.set(0, by, 0); body.add(top);
    const hemY = by + Math.cos(Math.PI * .72) * BR[1] * 1.04, hemR = Math.sin(Math.PI * .72);
    body.add(M(new THREE.TorusGeometry(1, .06, 10, 40), F.top === 'suit' ? fab : FABRIC(mixHex(F.topC, '#000000', .12)), [BR[0] * 1.06 * hemR, BR[2] * 1.06 * hemR, B * .9], [0, hemY, 0], [Math.PI / 2, 0, 0]));
    // sleeves over the arms (paws stay out)
    rig.arms.forEach(([piv, d]) => { if (piv.children[0] && piv.children[0].geometry === SPH && !F.noSleeves) { const a = piv.children[0], sl = M(SPH, F.top === 'varsity' ? FABRIC('#FFFFFF') : fab, [a.scale.x * 1.18, a.scale.y * .78, a.scale.z * 1.18], [a.position.x * .8, a.position.y * .72, a.position.z], [a.rotation.x, a.rotation.y, a.rotation.z]); piv.add(sl);
      if (F.top === 'tracksuit') piv.add(M(SPH, FABRIC('#FFFFFF'), [a.scale.x * .3, a.scale.y * .8, a.scale.z * 1.2], [a.position.x * .8 + d * a.scale.x * .9, a.position.y * .72, a.position.z], [a.rotation.x, a.rotation.y, a.rotation.z])); } });
    const cy = by + BR[1] * .15, cz = front(cy);
    if (F.top === 'hoodie') { body.add(M(SPH, FABRIC(mixHex(F.topC, '#000000', .08)), [BR[0] * .5, BR[1] * .26, B * .1], [0, by - BR[1] * .18, front(by - BR[1] * .18) * 1.02])); [-1, 1].forEach(d => { const s = M(new THREE.CylinderGeometry(B * .018, B * .018, B * .32, 6), pm('#FFFFFF', { r: .6 }), [1, 1, 1], [d * B * .12, by + BR[1] * .48, front(by + BR[1] * .48) * 1.08]); body.add(s); body.add(M(SPHL, pm('#FFFFFF', { r: .5 }), [B * .03, B * .045, B * .03], [d * B * .12, by + BR[1] * .3, front(by + BR[1] * .3) * 1.1])); }); }
    if (F.top === 'suit') { const shirt = decal(x => { x.fillStyle = '#FFFFFF'; x.beginPath(); x.moveTo(40, 0); x.lineTo(216, 0); x.lineTo(128, 250); x.fill(); }, B * .62, B * .7); shirt.position.set(0, by + BR[1] * .42, front(by + BR[1] * .42) * 1.07 + .005); shirt.rotation.x = -.35; body.add(shirt);
      [-1, 1].forEach(d => body.add(M(GEO.drop, FABRIC(mixHex(F.topC, '#FFFFFF', .12)), [B * .1, B * .34, B * .05], [d * B * .2, by + BR[1] * .4, front(by + BR[1] * .4) * 1.08], [-.3, 0, d * .5])));
      [0, 1].forEach(i => body.add(M(SPHL, GOLD(), [B * .035, B * .035, B * .02], [0, by - BR[1] * (.05 + i * .22), front(by - BR[1] * (.05 + i * .22)) * 1.08]))); }
    if (F.top === 'varsity') { const p = decal(x => { x.fillStyle = '#FFFFFF'; x.font = '900 220px Arial Black, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.strokeStyle = '#FFC93D'; x.lineWidth = 18; x.strokeText('R', 128, 140); x.fillText('R', 128, 140); }, B * .34, B * .34); p.position.set(-B * .28, cy, front(cy) * 1.08); p.rotation.y = -.35; body.add(p); [0, 1, 2].forEach(i => body.add(M(SPHL, pm('#FFFFFF', { r: .4 }), [B * .03, B * .03, B * .02], [B * .02, by + BR[1] * (.35 - i * .25), front(by + BR[1] * (.35 - i * .25)) * 1.07]))); }
    if (F.top === 'puffer') for (let i = 0; i < 3; i++) { const y = by + BR[1] * (.5 - i * .38), rr = Math.sqrt(Math.max(0, 1 - Math.pow((y - by) / (BR[1] * 1.06), 2))); body.add(M(new THREE.TorusGeometry(1, .07, 10, 40), fab, [BR[0] * 1.08 * rr, BR[2] * 1.08 * rr, B * .8], [0, y, 0], [Math.PI / 2, 0, 0])); }
    if (F.top === 'jersey') { const p = decal(x => { x.fillStyle = '#FFFFFF'; x.strokeStyle = '#2B2633'; x.lineWidth = 16; x.font = '900 190px Arial Black, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.strokeText(F.num || '1', 128, 140); x.fillText(F.num || '1', 128, 140); }, B * .55, B * .55); p.position.set(0, cy, front(cy) * 1.08); body.add(p); }
    if (F.top === 'tee' && F.print) { const p = decal(x => { x.fillStyle = F.print === 'heart' ? '#FF3D7F' : '#FFE066'; x.font = '200px serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(F.print === 'heart' ? '♥' : F.print === 'moon' ? '☾' : '★', 128, 140); }, B * .5, B * .5); p.position.set(0, cy, front(cy) * 1.08); body.add(p); }
    if (F.top === 'tracksuit') { body.add(M(new THREE.CylinderGeometry(B * .012, B * .012, BR[1] * 1.2, 6), GOLD(), [1, 1, 1], [0, by + BR[1] * .05, front(by + BR[1] * .05) * 1.07])); }
    if (F.top === 'overalls') { const den = FABRIC(F.topC); body.add(M(SPH, den, [BR[0] * .56, BR[1] * .42, B * .12], [0, by - BR[1] * .05, front(by - BR[1] * .05) * 1.0])); [-1, 1].forEach(d => { body.add(M(new THREE.CylinderGeometry(B * .05, B * .05, BR[1] * 1.1, 8), den, [1, 1, .4], [d * B * .28, by + BR[1] * .5, front(by + BR[1] * .5) * .9], [.5, 0, 0])); body.add(M(SPHL, GOLD(), [B * .045, B * .045, B * .02], [d * B * .26, by + BR[1] * .25, front(by + BR[1] * .25) * 1.12])); });
      top.material = FABRIC('#FFFFFF'); }
  }
  // ---- hood (up) — with little ears sewn on for the bear
  if (F.hood) {
    const hc = FABRIC(F.topC || '#FFFFFF'), hood = new THREE.Mesh(hoodGeo(.82), hc); hood.scale.set(R[0] * 1.14, R[1] * 1.14, R[2] * 1.14); hood.castShadow = true; head.add(hood);
    const fd = new THREE.Vector3(0, -.12, 1).normalize(), ring = M(new THREE.TorusGeometry(Math.sin(.82), .07, 10, 40), FABRIC(mixHex(F.topC || '#FFFFFF', '#000000', .1)), [R[0] * 1.14, R[1] * 1.14, R[2] * 1.14]);
    ring.position.copy(fd).multiplyScalar(Math.cos(.82)).multiply(new THREE.Vector3(R[0] * 1.14, R[1] * 1.14, R[2] * 1.14)); ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), fd); head.add(ring);
    if (F.hoodEars) [-1, 1].forEach(d => { const g = stick(head, [R[0] * 1.13, R[1] * 1.13, R[2] * 1.13], d * .62, .72, mochi, r0 * .02); g.quaternion.setFromEuler(new THREE.Euler(-.1, 0, -d * .55)); g.add(M(SPH, hc, [r0 * .25, r0 * .24, r0 * .14], [0, r0 * .18, 0])); g.add(M(SPH, FABRIC(mixHex(F.topC, '#FFFFFF', .5)), [r0 * .14, r0 * .13, r0 * .07], [0, r0 * .18, r0 * .1])); });
    rig.ears.forEach(([p]) => { if (rig.motif === 'こぐま') p.visible = false; });
  }
  // ---- hats
  if (F.hat) {
    const hm = FABRIC(F.hatC || '#2B2633'), back = F.hat === 'capBack';
    if (F.hat === 'cap' || back || F.hat === 'snapback') { const g = new THREE.Group(); g.position.set(0, R[1] * .12, 0); g.rotation.set(-.1, back ? Math.PI : 0, 0); head.add(g);
      g.add(shell([R[0] * 1.06, R[1] * 1.04, R[2] * 1.06], 0, Math.PI * .4, hm)); g.add(M(new THREE.CylinderGeometry(1, 1, .04, 32, 1, false, -Math.PI * .5, Math.PI), hm, [r0 * .62, 1, r0 * .55], [0, R[1] * .62, R[2] * .62], [.25, 0, 0]));
      g.add(M(SPHL, hm, [r0 * .06, r0 * .04, r0 * .06], [0, R[1] * 1.03, 0])); if (F.hat === 'snapback') { const p = decal(x => { x.fillStyle = '#FFFFFF'; x.font = '900 120px Arial Black'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('RM', 128, 128); }, r0 * .5, r0 * .5); p.position.set(0, R[1] * .55, R[2] * .86); p.rotation.x = -.55; g.add(p); } }
    if (F.hat === 'beanie') { head.add(shell([R[0] * 1.07, R[1] * 1.06, R[2] * 1.07], 0, Math.PI * .45, hm)); head.add(M(new THREE.TorusGeometry(1, .1, 10, 40), FABRIC(mixHex(F.hatC, '#000000', .12)), [R[0] * 1.02, R[2] * 1.02, R[1] * .9], [0, R[1] * .17, 0], [Math.PI / 2 + .08, 0, 0])); head.add(M(SPH, partMat('#FFFFFF', 'wool'), [r0 * .2, r0 * .2, r0 * .2], [0, R[1] * 1.08, 0])); }
    if (F.hat === 'bucket') { head.add(shell([R[0] * 1.07, R[1] * 1.05, R[2] * 1.07], 0, Math.PI * .36, hm)); head.add(M(new THREE.CylinderGeometry(1, 1.35, .25, 32, 1, true), hm, [r0 * .95, r0 * .5, r0 * .9], [0, R[1] * .48, 0])); }
    rig.ears.forEach(([p]) => { if (F.hat !== 'beanie') p.scale.setScalar(.85); });
  }
  // ---- eyewear (sits over the eyes)
  if (F.glasses) {
    const lens = F.glasses === 'shades' || F.glasses === 'visor' ? pm('#15121F', { r: .05, cc: 1, ccr: .02, env: 1.4, op: .82 }) : F.glasses === 'star' ? pm('#FF5C8A', { r: .1, cc: 1, op: .7 }) : null;
    const frame = F.glasses === 'round' ? GOLD() : pm(F.glasses === 'star' ? '#FFE066' : '#15121F', { r: .3, cc: .8 });
    const pts = [-1, 1].map(d => surf(R, d * ex, ey, mochi));
    pts.forEach(({ p, n }, i) => { const g = new THREE.Group(); g.position.copy(p).addScaledVector(n, ew * .45); g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n); head.add(g);
      if (F.glasses === 'round') g.add(M(new THREE.TorusGeometry(ew * 1.12, ew * .1, 10, 32), frame));
      else if (F.glasses === 'star') { g.add(M(GEO.star, lens, [ew * 1.25, ew * 1.25, ew * .25])); }
      else g.add(M(SPH, lens, [ew * 1.12, eh * .82, ew * .28]));
    });
    const mid = pts[0].p.clone().add(pts[1].p).multiplyScalar(.5).add(new THREE.Vector3(0, 0, ew * .6));
    if (F.glasses === 'visor') { const v = M(new THREE.TorusGeometry(R[0] * 1.02, eh * .55, 8, 40, Math.PI * .7), lens, [1, 1, 1], [0, mid.y, 0], [Math.PI / 2, 0, Math.PI * .15]); v.rotation.set(Math.PI / 2, 0, Math.PI / 2 - Math.PI * .35); head.add(v); }
    else head.add(M(new THREE.CylinderGeometry(ew * .08, ew * .08, Math.abs(pts[1].p.x - pts[0].p.x) * .5, 6), frame, [1, 1, 1], [mid.x, mid.y + eh * .25, mid.z], [0, 0, Math.PI / 2]));
    rig.glasses = true;
  }
  // ---- neckwear
  const ny = head.position.y - R[1] * .78, nz = B * .05;
  if (F.neck === 'chain' || F.neck === 'bigChain') { const big = F.neck === 'bigChain', gm = GOLD(), n = big ? 22 : 16, rx = BR[0] * .62, rz = BR[2] * .7;
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, y = ny - (Math.cos(a) * .5 + .5) * B * (big ? .32 : .22); body.add(M(SPHL, gm, [B * (big ? .07 : .045), B * (big ? .07 : .045), B * (big ? .07 : .045)], [Math.sin(a) * rx, y, Math.cos(a) * rz + nz])); }
    const py = ny - B * (big ? .42 : .3), pz = Math.max(front(py), rz) * 1.08; body.add(M(new THREE.CylinderGeometry(B * (big ? .16 : .1), B * (big ? .16 : .1), B * .04, 24), gm, [1, 1, 1], [0, py, pz], [Math.PI / 2, 0, 0])); if (big) body.add(M(GEO.star, pm('#FFFFFF', { r: .1, cc: 1, e: '#FFFFFF', ei: .3 }), [B * .09, B * .09, B * .05], [0, py, pz + B * .03])); }
  if (F.neck === 'tie') { const tm = pm(F.neckC || '#E8452C', { r: .5, cc: .3 }); const y = ny - B * .08; body.add(M(SPHL, tm, [B * .07, B * .06, B * .05], [0, y, front(y) * 1.1 + B * .02])); body.add(M(GEO.drop, tm, [B * .09, B * .3, B * .04], [0, y - B * .3, front(y - B * .3) * 1.1], [Math.PI - .25, 0, 0])); }
  if (F.neck === 'bowtie') { const tm = pm(F.neckC || '#E8452C', { r: .45, cc: .4 }); const y = ny - B * .04, z = front(y) * 1.05 + B * .08; [-1, 1].forEach(d => body.add(M(GEO.drop, tm, [B * .09, B * .15, B * .06], [d * B * .12, y, z], [0, 0, d * Math.PI / 2]))); body.add(M(SPHL, tm, [B * .05, B * .05, B * .04], [0, y, z + B * .01])); }
  if (F.neck === 'bandana') { const bm = pm(F.neckC || '#E8452C', { r: .7, cc: .05 }); body.add(M(GEO.drop, bm, [B * .32, B * .34, B * .08], [0, ny - B * .22, front(ny - B * .22) * 1.05 + B * .02], [Math.PI, 0, 0])); body.add(M(new THREE.TorusGeometry(1, .08, 8, 32), bm, [BR[0] * .6, BR[2] * .66, B], [0, ny, nz], [Math.PI / 2 + .25, 0, 0])); }
  if (F.neck === 'scarf') { const sm = FABRIC(F.neckC || '#FFFFFF'); body.add(M(new THREE.TorusGeometry(1, .16, 10, 32), sm, [BR[0] * .62, BR[2] * .66, B], [0, ny, nz], [Math.PI / 2 + .15, 0, 0])); body.add(M(GEO.drop, sm, [B * .12, B * .34, B * .08], [B * .22, ny - B * .3, front(ny - B * .3) * 1.06], [Math.PI, 0, .2])); }
  if (F.neck === 'phonesNeck') { const pm2 = pm('#2B2633', { r: .3, cc: .8 }), cup = pm(F.topC ? mixHex(F.topC, '#FFFFFF', .2) : '#FF5C8A', { r: .3, cc: .8 }); body.add(M(new THREE.TorusGeometry(1, .07, 8, 32, Math.PI), pm2, [BR[0] * .66, BR[2] * .7, B], [0, ny + B * .02, nz], [Math.PI / 2 + .3, 0, Math.PI])); [-1, 1].forEach(d => body.add(M(new THREE.CylinderGeometry(B * .17, B * .17, B * .11, 24), cup, [1, 1, 1], [d * BR[0] * .66, ny, nz + B * .12], [0, 0, Math.PI / 2]))); }
  // ---- sneakers replace the feet
  if (F.shoes === 'sneakers' && o.feet) o.feet.forEach(([x, z]) => { const sc = pm('#FFFFFF', { r: .45, cc: .5 }), band = pm(F.shoeC || '#FF5C8A', { r: .4, cc: .6 }), sole = pm('#F2EFE8', { r: .6 });
    body.add(M(SPH, sc, [B * .3, B * .19, B * .42], [x, B * .14, z])); body.add(M(SPH, sole, [B * .32, B * .07, B * .44], [x, B * .05, z])); body.add(M(GEO.drop, band, [B * .06, B * .3, B * .03], [x + Math.sign(x) * B * .27, B * .15, z + B * .02], [Math.PI / 2, Math.sign(x) * Math.PI / 2, 0]));
    [0, 1, 2].forEach(i => body.add(M(new THREE.CylinderGeometry(B * .012, B * .012, B * .16, 5), band, [1, 1, 1], [x, B * .27 - i * B * .02, z + B * (.12 + i * .08)], [0, 0, Math.PI / 2]))); });
  // ---- a mic in the right hand
  if (F.mic) { const arm = rig.arms.find(([, d]) => d > 0); if (arm) { const [piv] = arm, a = piv.children[0]; const g = new THREE.Group(); g.position.set(a.position.x * 1.5, a.position.y * 1.75, B * .15); g.rotation.set(-.6, 0, .4); piv.add(g);
    g.add(M(new THREE.CylinderGeometry(B * .045, B * .03, B * .38, 12), pm('#2B2633', { r: .3, cc: .8 }), [1, 1, 1], [0, 0, 0])); g.add(M(SPH, pm('#C9C9D6', { m: .8, r: .35, cc: .5 }), [B * .1, B * .1, B * .1], [0, B * .24, 0])); g.add(M(new THREE.TorusGeometry(B * .05, B * .012, 6, 16), GOLD(), [1, 1, 1], [0, B * .14, 0], [Math.PI / 2, 0, 0])); } }
}
