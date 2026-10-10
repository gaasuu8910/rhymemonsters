const gradTex = (() => { const d = new Uint8Array([120,120,120,255, 200,200,200,255, 255,255,255,255]); const t = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
const OUT = new THREE.MeshBasicMaterial({ color: 0x2b2545, side: THREE.BackSide });
const GEO = {
  sphere: new THREE.SphereGeometry(1, 32, 22),
  cone: new THREE.ConeGeometry(1, 1, 18),
  octa: new THREE.OctahedronGeometry(1, 0),
  dodeca: new THREE.DodecahedronGeometry(1, 0),
  tetra: new THREE.TetrahedronGeometry(1, 0),
};
GEO.egg = (() => { const g = new THREE.SphereGeometry(1, 40, 28); const p = g.attributes.position; for (let i = 0; i < p.count; i++) { let x = p.getX(i), y = p.getY(i), z = p.getZ(i); if (y > 0) { const k = 1 - .2 * y; x *= k; z *= k; y *= 1.28; } else y *= 1.02; p.setXYZ(i, x, y, z); } g.computeVertexNormals(); return g; })();
GEO.shell = new THREE.SphereGeometry(1, 24, 10, 0, Math.PI * 2, 0, Math.PI * .4);
const mats = {};
function mat(c) { return mats[c] || (mats[c] = new THREE.MeshToonMaterial({ color: new THREE.Color(c), gradientMap: gradTex })); }
function part(geo, color, { outline = true, s = [1, 1, 1], p = [0, 0, 0], r = [0, 0, 0], w = 1.07 } = {}) {
  const g = new THREE.Group();
  const m = new THREE.Mesh(geo, mat(color)); m.castShadow = true; g.add(m);
  if (outline) { const o = new THREE.Mesh(geo, OUT); o.scale.setScalar(w); g.add(o); }
  g.scale.set(...s); g.position.set(...p); g.rotation.set(...r);
  return g;
}
function darken(hex, k) { const c = new THREE.Color(hex); c.multiplyScalar(k); return '#' + c.getHexString(); }

function buildMonster(sp) {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const rig = { root, body, wings: [], spin: [], floaters: [], eyes: [], cheeks: [], sp };
  const c = sp.color, a = sp.accent;
  if ((sp.vst ?? sp.stage) === 0) {
    body.add(part(GEO.egg, c, { s: [.95, .95, .95], p: [0, 1, 0] }));
    [[.45, 1.55, .55, .16], [-.5, 1.1, .6, .2], [.2, .55, .85, .14], [-.15, 1.85, .45, .12], [.62, .9, .5, .13]].forEach(([x, y, z, r]) => body.add(part(GEO.sphere, a, { outline: false, s: [r, r, r * .35], p: [x, y, z * 1.08], r: [0, Math.atan2(x, z), 0] })));
    const eg = new THREE.Group(); eg.position.set(0, 1.12, .86); body.add(eg); rig.eyes.push(eg);
    [-.24, .24].forEach(x => { eg.add(part(GEO.sphere, '#2b2545', { outline: false, s: [.09, .13, .05], p: [x, 0, 0] })); eg.add(part(GEO.sphere, '#ffffff', { outline: false, s: [.03, .03, .02], p: [x + .03, .05, .04] })); });
    const mg = new THREE.Group(); mg.position.set(0, .95, .95); body.add(mg); rig.mouth = mg;
    rig.top = 2.3; rig.center = 1.1;
    return rig;
  }
  const [sx, sy, sz] = sp.shape || [1, 1, 1];
  const top = 1 + sy;
  body.add(part(GEO.sphere, c, { s: [sx, sy, sz], p: [0, 1, 0] }));
  body.add(part(GEO.sphere, sp.belly || '#FFFFFF', { outline: false, s: [sx * .62, sy * .55, .25], p: [0, .82, sz * .8] }));
  // eyes
  const eg = new THREE.Group(); eg.position.set(0, 1.18, sz * .84); body.add(eg); rig.eyes.push(eg);
  const es = (sp.vst ?? sp.stage) >= 3 ? .95 : 1.1;
  [-1, 1].forEach(d => {
    const x = d * .34 * sx;
    eg.add(part(GEO.sphere, '#FFFFFF', { s: [.19 * es, .22 * es, .1], p: [x, 0, 0], w: 1.12 }));
    eg.add(part(GEO.sphere, '#2b2545', { outline: false, s: [.12 * es, .15 * es, .06], p: [x, -.01, .06] }));
    eg.add(part(GEO.sphere, '#FFFFFF', { outline: false, s: [.045, .045, .02], p: [x + .04, .06, .12] }));
    const ck = part(GEO.sphere, '#FF9DB8', { outline: false, s: [.13, .07, .04], p: [d * .62 * sx, .98, sz * .76], r: [0, d * .5, 0] }); body.add(ck); rig.cheeks.push(ck);
  });
  if (sp.eyes === 'sleepy') eg.scale.y = .35;
  const mouth = new THREE.Group(); mouth.position.set(0, 1.0, sz * .97); body.add(mouth); rig.mouth = mouth;
  const smile = new THREE.Mesh(new THREE.TorusGeometry(.07, .022, 8, 16, Math.PI), mat('#2b2545')); smile.rotation.z = Math.PI; mouth.add(smile); rig.smile = smile;
  const mo = new THREE.Mesh(GEO.sphere, mat('#7A2345')); mo.scale.set(.13, .001, .06); mo.position.z = -.01; mouth.add(mo); rig.mouthO = mo;
  // feet & arms
  [-1, 1].forEach(d => body.add(part(GEO.sphere, darken(c, .92), { s: [.22 * sx, .14, .3], p: [d * .42 * sx, .12, .25] })));
  if ((sp.vst ?? sp.stage) >= 2) [-1, 1].forEach(d => body.add(part(GEO.sphere, c, { s: [.17, .26, .17], p: [d * sx * .97, .92, .15], r: [0, 0, d * .5] })));
  // ears
  const E = sp.ears;
  [-1, 1].forEach(d => {
    if (E === 'cat') body.add(part(GEO.cone, c, { s: [.22, .45, .22], p: [d * .48 * sx, top - .12, 0], r: [0, 0, -d * .35] }));
    if (E === 'long') body.add(part(GEO.sphere, c, { s: [.15, .52, .11], p: [d * .32 * sx, top + .32, -.05], r: [0, 0, -d * .2] }));
    if (E === 'fin') body.add(part(GEO.cone, a === '#FFFFFF' ? '#E6F8FF' : a, { s: [.16, .55, .08], p: [d * (sx + .05), 1.3, 0], r: [0, 0, -d * 1.2] }));
    if (E === 'leaf') body.add(part(GEO.sphere, a, { s: [.12, .38, .04], p: [d * .36 * sx, top + .12, 0], r: [0, 0, -d * .55] }));
  });
  // horns
  if (sp.horns === 1) body.add(part(GEO.cone, a, { s: [.12, .45, .12], p: [0, top + .05, .25], r: [.35, 0, 0] }));
  if (sp.horns === 2) [-1, 1].forEach(d => body.add(part(GEO.cone, a, { s: [.11, .42, .11], p: [d * .26 * sx, top - .05, .12], r: [.2, 0, -d * .3] })));
  // wings
  if (sp.wings) [-1, 1].forEach(d => {
    const piv = new THREE.Group(); piv.position.set(d * sx * .7, 1.3, -.35 * sz); body.add(piv); rig.wings.push([piv, d]);
    const W = sp.wings;
    if (W === 'small') piv.add(part(GEO.sphere, a === '#FFFFFF' ? '#E6F8FF' : a, { s: [.45, .25, .06], p: [d * .4, .1, 0], r: [0, 0, d * .35] }));
    if (W === 'big') { piv.add(part(GEO.sphere, a, { s: [.9, .42, .06], p: [d * .85, .3, 0], r: [0, 0, d * .4] })); piv.add(part(GEO.sphere, c, { s: [.6, .25, .05], p: [d * .65, .05, .03], r: [0, 0, d * .25] })); }
    if (W === 'crystal') { piv.add(part(GEO.octa, a, { s: [.95, .5, .08], p: [d * .9, .4, 0], r: [0, 0, d * .5] })); piv.add(part(GEO.octa, '#FFFFFF', { s: [.55, .3, .07], p: [d * .7, .05, .02], r: [0, 0, d * .2] })); }
    if (W === 'leaf') { piv.add(part(GEO.sphere, a, { s: [.85, .3, .05], p: [d * .8, .35, 0], r: [0, 0, d * .55] })); piv.add(part(GEO.sphere, darken(a, .8), { s: [.6, .22, .04], p: [d * .6, .02, .02], r: [0, 0, d * .15] })); }
  });
  // tail
  const T = sp.tail, tz = -sz * .92;
  if (T === 'nub') body.add(part(GEO.sphere, c, { s: [.18, .18, .18], p: [0, .5, tz] }));
  if (T && T !== 'nub') {
    const n = T === 'comet' ? 6 : 4;
    for (let i = 0; i < n; i++) {
      const r = .2 - i * .025, col = T === 'comet' ? (i % 2 ? '#FFFFFF' : a) : c;
      body.add(part(GEO.sphere, col, { outline: T !== 'comet', s: [r, r, r], p: [0, .5 + i * .14, tz - i * .2] }));
    }
    const ex = [0, .5 + n * .14, tz - n * .2];
    if (T === 'star' || T === 'comet') { const st = part(GEO.octa, '#FFE066', { s: [.22, .22, .09], p: ex }); body.add(st); rig.spin.push(st); }
    if (T === 'leaf') body.add(part(GEO.sphere, a, { s: [.14, .32, .04], p: ex, r: [.6, 0, 0] }));
  }
  // extras
  for (const X of sp.extras || []) {
    if (X === 'shell') body.add(part(GEO.shell, '#FFF4E0', { s: [.62 * sx, .7, .62 * sz], p: [0, top - .32, 0], r: [0, 0, .18] }));
    if (X === 'star') { const st = part(GEO.octa, a === '#FFF6D6' ? '#FFE066' : a, { s: [.24, .24, .1], p: [0, top + .55, 0] }); body.add(st); rig.floaters.push(st); }
    if (X === 'moon') { const m = part(new THREE.TorusGeometry(.3, .08, 12, 28, Math.PI * 1.25), a, { p: [.45 * sx, top + .2, 0], r: [0, 0, .9] }); body.add(m); }
    if (X === 'halo') { const h = new THREE.Mesh(new THREE.TorusGeometry(.48, .045, 10, 40), mat(a)); h.position.y = top + .45; h.rotation.x = Math.PI / 2; body.add(h); rig.floaters.push(h); }
    if (X === 'crystals') [[0, 1.55, -.8, .3], [.35, 1.2, -.85, .22], [-.35, 1.25, -.85, .24]].forEach(([x, y, z, r]) => body.add(part(GEO.octa, a, { s: [r * .6, r, r * .6], p: [x * sx, y, z * sz], r: [-.4, 0, x] })));
    if (X === 'swirl' || X === 'swirl2') { const s = new THREE.Mesh(new THREE.TorusGeometry(1.25 * sx, .035, 8, 64, Math.PI * 1.4), mat(a === '#FFFFFF' ? '#FFFFFF' : a)); s.position.y = X === 'swirl' ? .75 : 1.5; s.rotation.x = Math.PI / 2 + (X === 'swirl' ? .15 : -.2); body.add(s); rig.spin.push(s); }
    if (X === 'spikes') for (let i = 0; i < 4; i++) { const ang = .5 + i * .38; body.add(part(GEO.cone, a, { s: [.12, .32, .12], p: [0, 1 + Math.cos(ang) * sy * 1.02, -Math.sin(ang) * sz * 1.02], r: [-ang, 0, 0] })); }
    if (X === 'leaves') { body.add(part(GEO.cone, '#6B8F4E', { s: [.03, .25, .03], p: [0, top + .08, 0], outline: false })); [-1, 1].forEach(d => body.add(part(GEO.sphere, a === '#FFFFFF' ? '#7FC45E' : (sp.line === 'C' ? a : '#E8643A'), { s: [.2, .08, .1], p: [d * .16, top + .22, 0], r: [0, 0, d * .5] }))); }
    if (X === 'rock') [[.55, 1.55, -.55, .28], [-.6, 1.4, -.5, .24], [0, 1.85, -.35, .22]].forEach(([x, y, z, r]) => body.add(part(GEO.dodeca, darken(a, .9), { s: [r, r * .8, r], p: [x * sx, y * (sy * .9 + .1), z * sz], r: [x, y, z] })));
    if (X === 'flower') { const f = new THREE.Group(); f.position.set(-.42 * sx, top - .05, .2); f.rotation.set(.3, 0, .4); body.add(f); for (let i = 0; i < 5; i++) { const ang = i / 5 * Math.PI * 2; f.add(part(GEO.sphere, sp.line === 'B' ? a : '#FF8FB1', { s: [.16, .09, .04], p: [Math.cos(ang) * .16, Math.sin(ang) * .16, 0], r: [0, 0, ang] })); } f.add(part(GEO.sphere, '#FFE066', { s: [.08, .08, .06], outline: false })); rig.spin.push(f); }
    if (X === 'crown') { const cr = new THREE.Group(); cr.position.y = top - .02; body.add(cr); cr.add(part(new THREE.CylinderGeometry(.3, .34, .14, 10, 1), '#FFC93D')); for (let i = 0; i < 5; i++) { const ang = i / 5 * Math.PI * 2; cr.add(part(GEO.cone, '#FFC93D', { s: [.07, .2, .07], p: [Math.cos(ang) * .3, .15, Math.sin(ang) * .3] })); } }
    if (X === 'mane') for (let i = 0; i < 9; i++) { const ang = i / 9 * Math.PI * 2; body.add(part(GEO.sphere, a, { s: [.22, .22, .22], p: [Math.cos(ang) * sx * .98, 1.35 + Math.sin(ang * 2) * .04, Math.sin(ang) * sz * .98 - .05] })); }
  }
  rig.top = top + .5; rig.center = 1.1;
  return rig;
}

