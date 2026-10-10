/* =========================================================
   ANIMALS — every monster is a chibi take on a real animal motif:
   its own ears / snout or beak / tail / wings / horns / coat pattern / material / dance
   ========================================================= */
const MOTIF = {
  // ---- A: stars & moons (mammals of the night sky)
  1: { an: 'うさぎ', c: '#FFC4DC', bel: '#FFF4F8', ears: 'bunny', muzzle: 'cat', tail: 'puff', mat: 'plush', dance: 'hop', feet: 'paw' },
  2: { an: 'きつね', c: '#FF9A4D', bel: '#FFF6EC', a: '#FFE066', ears: 'fox', muzzle: 'fox', tail: 'fox', pat: 'blaze', mat: 'fur', dance: 'flip', feet: 'paw' },
  3: { an: 'ねこ', c: '#B7A6F2', bel: '#F5F0FF', ears: 'cat', muzzle: 'cat', tail: 'cat', pat: 'tabby', mat: 'plush', dance: 'wiggle', feet: 'paw' },
  4: { an: 'ユニコーン', c: '#FFD8EC', bel: '#FFFFFF', a: '#FFE066', ears: 'pony', muzzle: 'pony', horn: 'unicorn', tail: 'pony', mane: '#B98CFF', wings: 'big', mat: 'satin', dance: 'prance', feet: 'hoof' },
  30: { an: 'チビドラ', c: '#7DD3F5', bel: '#F2FBFF', a: '#FFE066', ears: 'frill', muzzle: 'dragon', horn: 'dragon', wings: 'dragon', tail: 'dragon', mat: 'plush', dance: 'hop', feet: 'claw', head: [1.08, 1, 1] },
  31: { an: 'ラボット', c: '#E9E4F7', bel: '#FFFFFF', a: '#B36BFF', robot: true, mat: 'smooth', dance: 'bounce', feet: 'paw', tail: 'none', head: [1.1, .95, 1] },
  5: { an: 'ドラゴン', c: '#6A55E8', bel: '#F2E6FF', a: '#FFE066', ears: 'frill', muzzle: 'dragon', horn: 'dragon', wings: 'dragon', tail: 'dragon', mat: 'scale', dance: 'power', feet: 'claw' },
  6: { an: 'リス', c: '#E7A36B', bel: '#FFF1E0', ears: 'squirrel', muzzle: 'bear', tail: 'squirrel', pat: 'stripes', mat: 'fur', dance: 'flip', feet: 'paw' },
  28: { an: 'モモンガ', c: '#F4C7E0', bel: '#FFFFFF', a: '#56D9F5', ears: 'mouse', muzzle: 'cat', tail: 'comet', wings: 'glide', mat: 'plush', eyes: 'big', dance: 'float', feet: 'paw' },
  7: { an: 'コウモリ', c: '#7B6BD6', bel: '#E6DEFF', a: '#FFE9A8', ears: 'bat', muzzle: 'cat', wings: 'bat', tail: 'none', mat: 'plush', dance: 'float', feet: 'paw' },
  8: { an: 'ひつじ', c: '#F3EEFF', bel: '#FFFFFF', a: '#FFC93D', face: '#E9D9FF', ears: 'sheep', muzzle: 'cat', horn: 'ram', wool: true, tail: 'puff', mat: 'wool', dance: 'sway', feet: 'hoof' },
  9: { an: 'タヌキ', c: '#C9925E', bel: '#FFF0DC', a: '#6B4A33', ears: 'bear', muzzle: 'tanuki', tail: 'tanuki', pat: 'cheek', leaf: true, mat: 'fur', dance: 'drum', feet: 'paw' },
  // ---- B: wind & birds
  10: { an: 'ひよこ', c: '#FFE066', bel: '#FFF8D6', beak: 'chick', crest: 'tuft', wingArms: true, tail: 'bird', mat: 'feather', dance: 'bounce', feet: 'bird' },
  11: { an: 'ペンギン', c: '#3E5FA8', bel: '#FFFFFF', a: '#FFB13D', beak: 'penguin', pat: 'tux', flippers: true, tail: 'bird', mat: 'satin', body: [1.05, 1.2, 1], dance: 'waddle', feet: 'bird' },
  12: { an: 'アヒル', c: '#FFFFFF', bel: '#FFFFFF', a: '#FF9F1C', beak: 'duck', crest: 'tuft', wingArms: true, tail: 'bird', mat: 'feather', dance: 'waddle', feet: 'bird' },
  13: { an: 'ハヤブサ', c: '#3FA7F5', bel: '#EAF6FF', a: '#FFD34D', beak: 'hawk', crest: 'crest', brow: true, wings: 'big', tail: 'bird', pat: 'bars', mat: 'feather', dance: 'headbang', feet: 'bird' },
  14: { an: 'サンダーバード', c: '#2A4FD6', bel: '#DDF6FF', a: '#FFE066', beak: 'hawk', crest: 'crest', wings: 'crystal', tail: 'plumes', mat: 'feather', dance: 'spin', feet: 'bird' },
  15: { an: 'フクロウ', c: '#9C7BE0', bel: '#F3EDFF', a: '#FFC93D', ears: 'tufts', beak: 'owl', pat: 'disc', wingArms: true, tail: 'bird', eyes: 'big', mat: 'feather', dance: 'tilt', feet: 'bird' },
  16: { an: 'インコ', c: '#43D6A6', bel: '#FFF7B0', a: '#FF5C8A', beak: 'parrot', crest: 'crest', wingArms: true, tail: 'plumes', pat: 'cheek', mat: 'feather', dance: 'headbang', feet: 'bird' },
  17: { an: 'そらクジラ', c: '#7DB8FF', bel: '#F4FBFF', a: '#3FA7F5', whale: true, tail: 'fluke', flippers: true, pat: 'grooves', mat: 'satin', eyes: 'small', dance: 'float', feet: 'none' },
  18: { an: 'スズメ', c: '#C99C6E', bel: '#FFF5E6', a: '#E8643A', beak: 'chick', crest: 'tuft', wingArms: true, tail: 'bird', pat: 'cheek', mat: 'feather', dance: 'hop', feet: 'bird' },
  // ---- C: forest & stone
  19: { an: 'こぐま', c: '#C99A6A', bel: '#FFF0DA', ears: 'bear', muzzle: 'bear', tail: 'nub', mat: 'plush', dance: 'sway', feet: 'paw' },
  20: { an: 'カエル', c: '#7AD65A', bel: '#F4FFD8', frog: true, tail: 'none', mat: 'smooth', dance: 'wiggle', feet: 'web', head: [1.22, .86, 1] },
  21: { an: 'ハリネズミ', c: '#E9C9A0', bel: '#FFF1DE', face: '#FFE6CC', ears: 'mouse', muzzle: 'fox', spikes: true, tail: 'nub', mat: 'fur', dance: 'roll', feet: 'paw' },
  22: { an: 'カメ', c: '#9BE07A', bel: '#FFF4C8', a: '#C9844A', shell: true, tail: 'nub', mat: 'smooth', dance: 'sway', feet: 'paw' },
  23: { an: 'シカの王', c: '#C9925E', bel: '#FFF2DC', a: '#5DAF4C', ears: 'deer', muzzle: 'pony', horn: 'antler', tail: 'puff', pat: 'spots', mat: 'fur', dance: 'stomp', feet: 'hoof' },
  24: { an: 'パンダ', c: '#FFFFFF', bel: '#FFFFFF', a: '#FF8FB1', ears: 'panda', muzzle: 'bear', pat: 'panda', flowerCrown: true, tail: 'nub', mat: 'plush', dance: 'roll', feet: 'paw', limbs: '#2B2633' },
  29: { an: '九尾のきつね', c: '#FFE1EC', bel: '#FFFFFF', a: '#FFC93D', ears: 'fox', muzzle: 'fox', tail: 'kyubi', pat: 'blaze', mat: 'plush', dance: 'spin', feet: 'paw' },
  25: { an: 'サイ', c: '#A39A90', bel: '#E8E0D6', a: '#FF7A3D', ears: 'bear', muzzle: 'rhino', horn: 'rhino', armor: true, tail: 'thin', mat: 'rock', dance: 'stomp', feet: 'hoof' },
  26: { an: 'マンモス', c: '#9A6B4A', bel: '#E9D6BE', a: '#FFC93D', ears: 'elephant', muzzle: 'trunk', wool: true, tail: 'thin', mat: 'wool', dance: 'stomp', feet: 'hoof' },
  27: { an: 'カピバラ', c: '#B58A5E', bel: '#E8D2B4', ears: 'capy', muzzle: 'capy', eyes: 'sleepy', yuzu: true, tail: 'none', mat: 'fur', dance: 'chill', feet: 'paw' },
};

/* ---------- coat materials: each preset has its own sheen, gloss and a procedural bump (fur, feathers, scales, wool, shell, stone) ---------- */
const BUMPS = {};
function bumpTex(kind) {
  if (BUMPS[kind] !== undefined) return BUMPS[kind];
  if (kind === 'smooth' || kind === 'satin') return BUMPS[kind] = null;
  const W = 256, H = 128, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const x = cv.getContext('2d');
  x.fillStyle = '#808080'; x.fillRect(0, 0, W, H);
  let seed = kind.length * 977; const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  if (kind === 'fur' || kind === 'plush') { const n = kind === 'fur' ? 2600 : 1600; for (let i = 0; i < n; i++) { const px = r() * W, py = r() * H, l = kind === 'fur' ? 5 : 3; x.strokeStyle = r() < .5 ? 'rgba(255,255,255,.35)' : 'rgba(0,0,0,.3)'; x.lineWidth = 1; x.beginPath(); x.moveTo(px, py); x.lineTo(px + (r() - .5) * 2, py + l); x.stroke(); } }
  if (kind === 'feather' || kind === 'scale') { const s = kind === 'feather' ? 16 : 9; for (let row = 0; row * s * .55 < H + s; row++) for (let col = -1; col * s < W + s; col++) { const cx = col * s + (row % 2) * s / 2, cy = row * s * .55; const g = x.createRadialGradient(cx, cy, 0, cx, cy, s * .62); g.addColorStop(0, '#b0b0b0'); g.addColorStop(.8, '#8a8a8a'); g.addColorStop(1, '#505050'); x.fillStyle = g; x.beginPath(); x.arc(cx, cy, s * .6, 0, Math.PI); x.fill(); } }
  if (kind === 'wool') for (let i = 0; i < 420; i++) { const px = r() * W, py = r() * H, rr = 3 + r() * 6, g = x.createRadialGradient(px, py, 0, px, py, rr); g.addColorStop(0, '#d8d8d8'); g.addColorStop(1, 'rgba(80,80,80,0)'); x.fillStyle = g; x.beginPath(); x.arc(px, py, rr, 0, 7); x.fill(); }
  if (kind === 'rock') for (let i = 0; i < 260; i++) { const px = r() * W, py = r() * H, rr = 4 + r() * 12; x.fillStyle = `rgba(${r() < .5 ? '40,40,40' : '210,210,210'},.35)`; x.beginPath(); for (let k = 0; k < 6; k++) { const a = k / 6 * 7; x.lineTo(px + Math.cos(a) * rr * (.7 + r() * .4), py + Math.sin(a) * rr * (.7 + r() * .4)); } x.fill(); }
  const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(kind === 'scale' ? 10 : kind === 'feather' ? 7 : 6, kind === 'scale' ? 5 : 3);
  return BUMPS[kind] = t;
}
const MAT_PRESET = {
  plush: { r: .6, cc: .14, sheen: .5, bump: .005 }, fur: { r: .64, cc: .1, sheen: .48, bump: .009 }, feather: { r: .5, cc: .2, sheen: .36, bump: .008 },
  satin: { r: .32, cc: .55, sheen: .18, bump: 0 }, smooth: { r: .22, cc: .9, sheen: .08, bump: 0 }, scale: { r: .3, cc: .7, sheen: .12, bump: .012 },
  wool: { r: .85, cc: 0, sheen: .7, bump: .016 }, rock: { r: .78, cc: .08, sheen: .1, bump: .02 },
};
function coatMat(base, preset, rim = .26) {
  const P = MAT_PRESET[preset] || MAT_PRESET.plush, b = bumpTex(preset);
  const m = new THREE.MeshPhysicalMaterial({ color: 0xffffff, vertexColors: true, roughness: Math.max(.72, P.r), clearcoat: P.cc * .2, clearcoatRoughness: .6, envMapIntensity: .45, bumpMap: b, bumpScale: P.bump });
  m.sheen = LIN(mixHex(base, '#FFFFFF', .55)).multiplyScalar(Math.max(.5, P.sheen));
  addRim(m, mixHex(base, '#FFFFFF', .5), rim * .7);
  return m;
}
const partMat = (c, preset = 'plush', o = {}) => { const P = MAT_PRESET[preset] || MAT_PRESET.plush; return pm(c, { r: Math.max(.7, P.r), cc: P.cc * .2, sh: '#FFFFFF', rim: mixHex(c, '#FFFFFF', .5), rimK: .22, ...o }); };

/* ---------- coat patterns painted into the vertex colours ---------- */
function withPattern(fn, pat, part, A, cols) {
  if (!pat) return fn;
  const D = SAT(cols.dark), W = SAT(cols.light), E = [-1, 1].map(d => new THREE.Vector3(Math.sin(d * .36) * Math.cos(-.1), Math.sin(-.1), Math.cos(d * .36) * Math.cos(-.1)));
  return v => {
    const c = fn(v);
    if (part === 'head') {
      if (pat === 'mask') c.lerp(D, sstep(.2, .15, Math.abs(v.y + .06)) * sstep(.1, .16, Math.abs(v.x)) * sstep(.25, .4, v.z) * .92);
      if (pat === 'panda') { const a = Math.max(...E.map(e => sstep(.5, .32, Math.acos(clamp(v.dot(e), -1, 1))))); c.lerp(D, a); }
      if (pat === 'disc') c.lerp(W, sstep(.15, .5, v.z) * sstep(.75, .35, v.y) * .95);
      if (pat === 'blaze' || pat === 'tux') c.lerp(W, sstep(.25, .6, v.z) * sstep(.15, -.25, v.y) * .95);
      if (pat === 'cheek') c.lerp(D, Math.max(...[-1, 1].map(d => sstep(.3, .18, Math.hypot(v.x - d * .62, v.y + .22)))) * .7);
      if (pat === 'tabby') c.lerp(D, sstep(.55, .9, Math.cos(Math.atan2(v.x, v.z) * 7)) * sstep(.55, .8, v.y) * .45);
    } else {
      if (pat === 'tux') c.lerp(W, sstep(-.35, .15, v.z) * .97);
      if (pat === 'stripes' || pat === 'tabby') c.lerp(D, sstep(.6, .92, Math.cos(v.x * 16)) * sstep(-.1, -.5, v.z) * .55);
      if (pat === 'bars') c.lerp(D, sstep(.65, .95, Math.cos(v.y * 22)) * sstep(.2, .6, v.z) * .35);
      if (pat === 'panda') c.lerp(D, sstep(.28, .12, Math.abs(v.y - .5)) * .95);
      if (pat === 'spots') { const s = Math.sin(v.x * 23 + 1.3) * Math.sin(v.y * 19 + .7) * Math.sin(v.z * 21); c.lerp(W, sstep(.55, .75, s) * sstep(-.1, -.5, v.z)); }
      if (pat === 'grooves') c.lerp(D, sstep(.7, .95, Math.cos(v.x * 30)) * sstep(.2, .7, v.z) * sstep(.1, -.5, v.y) * .25);
    }
    return c;
  };
}

/* ---------- animal parts ---------- */
function animalEars(rig, head, R, deform, type, c, A, preset) {
  const inner = partMat('#FFB7CF', 'plush'), mc = partMat(c, preset), dark = partMat(A.limbs || darken(c, .45), preset), r0 = R[0];
  const add = (d, th, ph, tilt, fn) => { const g = stick(head, R, d * th, ph, deform, r0 * .04); g.quaternion.setFromEuler(new THREE.Euler(-.12, 0, -d * tilt)); const p = new THREE.Group(); g.add(p); fn(p, d); rig.ears.push([p, d]); };
  [-1, 1].forEach(d => {
    if (type === 'bunny') add(d, .3, .95, .2, p => { p.rotation.x = -.15; p.add(M(GEO.drop, mc, [r0 * .22, r0 * .75, r0 * .15], [0, r0 * .74, 0])); p.add(M(GEO.drop, inner, [r0 * .12, r0 * .56, r0 * .07], [0, r0 * .72, r0 * .09])); });
    if (type === 'fox') add(d, .52, .78, .42, p => { p.add(M(GEO.drop, mc, [r0 * .34, r0 * .56, r0 * .16], [0, r0 * .42, 0])); p.add(M(GEO.drop, partMat('#FFFFFF', preset), [r0 * .2, r0 * .38, r0 * .08], [0, r0 * .4, r0 * .1])); p.add(M(GEO.drop, dark, [r0 * .14, r0 * .16, r0 * .12], [0, r0 * .82, 0])); });
    if (type === 'cat') add(d, .52, .8, .36, p => { p.add(M(GEO.drop, mc, [r0 * .3, r0 * .42, r0 * .17], [0, r0 * .34, 0])); p.add(M(GEO.drop, inner, [r0 * .17, r0 * .27, r0 * .08], [0, r0 * .34, r0 * .1])); });
    if (type === 'squirrel') add(d, .48, .82, .3, p => { p.add(M(GEO.drop, mc, [r0 * .22, r0 * .36, r0 * .14], [0, r0 * .3, 0])); p.add(M(GEO.drop, mc, [r0 * .08, r0 * .2, r0 * .06], [0, r0 * .62, 0], [0, 0, -d * .3])); });
    if (type === 'bear') add(d, .6, .76, .55, p => { p.add(M(SPH, mc, [r0 * .25, r0 * .24, r0 * .15], [0, r0 * .2, 0])); p.add(M(SPH, inner, [r0 * .14, r0 * .13, r0 * .08], [0, r0 * .2, r0 * .1])); });
    if (type === 'panda') add(d, .6, .76, .55, p => { p.add(M(SPH, dark, [r0 * .26, r0 * .25, r0 * .16], [0, r0 * .2, 0])); });
    if (type === 'mouse') add(d, .62, .68, .7, p => { p.add(M(SPH, mc, [r0 * .3, r0 * .3, r0 * .08], [0, r0 * .24, 0])); p.add(M(SPH, inner, [r0 * .2, r0 * .2, r0 * .05], [0, r0 * .24, r0 * .05])); });
    if (type === 'bat') add(d, .55, .72, .45, p => { p.add(M(GEO.drop, mc, [r0 * .36, r0 * .62, r0 * .1], [0, r0 * .48, 0])); p.add(M(GEO.drop, inner, [r0 * .22, r0 * .44, r0 * .05], [0, r0 * .46, r0 * .06])); });
    if (type === 'pony') add(d, .45, .82, .3, p => { p.add(M(GEO.drop, mc, [r0 * .16, r0 * .32, r0 * .1], [0, r0 * .26, 0])); p.add(M(GEO.drop, inner, [r0 * .08, r0 * .2, r0 * .05], [0, r0 * .26, r0 * .06])); });
    if (type === 'deer') add(d, .82, .4, 1.25, p => { p.add(M(GEO.leaf, mc, [r0 * .2, r0 * .34, r0 * .08], [0, r0 * .28, 0])); p.add(M(GEO.leaf, inner, [r0 * .1, r0 * .22, r0 * .04], [0, r0 * .28, r0 * .05])); });
    if (type === 'sheep') add(d, .95, .15, 1.9, p => { p.add(M(GEO.leaf, partMat(A.face || c, 'plush'), [r0 * .2, r0 * .36, r0 * .1], [0, r0 * .28, 0])); });
    if (type === 'elephant') add(d, 1.05, .05, 1.55, p => { p.add(M(SPH, mc, [r0 * .5, r0 * .52, r0 * .08], [0, r0 * .3, -r0 * .05])); p.add(M(SPH, inner, [r0 * .36, r0 * .38, r0 * .05], [0, r0 * .3, r0 * .01])); });
    if (type === 'capy') add(d, .62, .62, .7, p => { p.add(M(SPH, partMat(darken(c, .8), preset), [r0 * .12, r0 * .1, r0 * .07], [0, r0 * .07, 0])); });
    if (type === 'tufts') add(d, .5, .82, .25, p => { [0, 1].forEach(i => p.add(M(GEO.drop, mc, [r0 * .1, r0 * (.36 - i * .1), r0 * .06], [d * i * r0 * .09, r0 * .26, -i * r0 * .03], [0, 0, -d * i * .35]))); });
    if (type === 'floppy') add(d, .72, .62, 2.55, p => { p.add(M(GEO.drop, partMat(A.ear || darken(c, .78), preset), [r0 * .24, r0 * .46, r0 * .12], [0, r0 * .36, 0])); });
    if (type === 'frill') add(d, 1.0, .35, 1.45, p => { [0, 1, 2].forEach(i => p.add(M(GEO.drop, partMat(A.a || '#FFE066', 'scale'), [r0 * .1, r0 * (.36 - i * .07), r0 * .05], [d * i * r0 * .06, r0 * .24, -i * r0 * .07], [0, 0, -d * (i - 1) * .3]))); });
  });
}
// snout / muzzle; returns how far forward the mouth should move
function animalMuzzle(rig, head, R, deform, type, c, A, preset) {
  if (!type) return 0;
  const r0 = R[0], g = stick(head, R, 0, -.24, deform, r0 * .05), light = partMat(A.bel || '#FFF5E8', preset), nose = pm('#2B1D2A', { r: .25, cc: .9 }), skin = partMat(c, preset);
  if (type === 'cat') { g.add(M(SPHL, pm('#FF8FB1', { r: .3, cc: .8 }), [r0 * .06, r0 * .045, r0 * .04], [0, r0 * .08, r0 * .04])); return 0; }
  if (type === 'tanuki') { g.add(M(SPHL, nose, [r0 * .08, r0 * .06, r0 * .06], [0, r0 * .09, r0 * .05])); return 0; }
  if (type === 'fox') { g.add(M(GEO.drop, light, [r0 * .24, r0 * .32, r0 * .2], [0, r0 * .03, r0 * .16], [Math.PI / 2 - .15, 0, 0])); g.add(M(SPHL, nose, [r0 * .07, r0 * .055, r0 * .06], [0, r0 * .08, r0 * .45])); return r0 * .25; }
  if (type === 'bear') { g.add(M(SPH, light, [r0 * .3, r0 * .22, r0 * .2], [0, 0, r0 * .06])); g.add(M(SPHL, nose, [r0 * .1, r0 * .07, r0 * .07], [0, r0 * .09, r0 * .24])); return r0 * .17; }
  if (type === 'pony') { g.add(M(SPH, light, [r0 * .36, r0 * .26, r0 * .24], [0, -r0 * .03, r0 * .08])); [-1, 1].forEach(d => g.add(M(SPHL, nose, [r0 * .035, r0 * .025, r0 * .02], [d * r0 * .12, r0 * .05, r0 * .3]))); return r0 * .2; }
  if (type === 'dragon' && A.cool) { g.add(M(SPH, skin, [r0 * .3, r0 * .2, r0 * .42], [0, r0 * .02, r0 * .2])); [-1, 1].forEach(d => g.add(M(GEO.drop, nose, [r0 * .025, r0 * .05, r0 * .02], [d * r0 * .12, r0 * .16, r0 * .44], [-.6, 0, d * .5]))); return r0 * .34; }
  if (type === 'dragon') { g.add(M(SPH, skin, [r0 * .34, r0 * .24, r0 * .26], [0, -r0 * .02, r0 * .1])); [-1, 1].forEach(d => g.add(M(SPHL, nose, [r0 * .03, r0 * .022, r0 * .02], [d * r0 * .1, r0 * .07, r0 * .34]))); return r0 * .22; }
  if (type === 'capy') { g.add(M(SPH, partMat(darken(c, .9), preset), [r0 * .46, r0 * .32, r0 * .3], [0, 0, r0 * .1])); g.add(M(SPHL, nose, [r0 * .16, r0 * .05, r0 * .05], [0, r0 * .14, r0 * .37])); return r0 * .28; }
  if (type === 'rhino') { g.add(M(SPH, skin, [r0 * .4, r0 * .3, r0 * .28], [0, 0, r0 * .1])); [-1, 1].forEach(d => g.add(M(SPHL, nose, [r0 * .03, r0 * .022, r0 * .02], [d * r0 * .12, r0 * .1, r0 * .36]))); return r0 * .25; }
  if (type === 'trunk') { const tm = partMat(c, preset); limb(g, tm, [[0, r0 * .05, r0 * .05], [0, -r0 * .2, r0 * .3], [0, -r0 * .45, r0 * .32], [0, -r0 * .55, r0 * .45]], r0 * .17, r0 * .1); const tusk = pm('#FFF8E8', { r: .3, cc: .8 }); [-1, 1].forEach(d => limb(g, tusk, [[d * r0 * .2, -r0 * .08, r0 * .1], [d * r0 * .32, -r0 * .32, r0 * .3], [d * r0 * .22, -r0 * .42, r0 * .55]], r0 * .07, r0 * .025)); rig.trunk = g; return -1; }
  return 0;
}
function animalBeak(type) {
  return { chick: ['#FFB13D', 1], duck: ['#FF9F1C', 1.5], penguin: ['#2B2633', .9], hawk: ['#FFD34D', 1.3], owl: ['#E8A83D', .8], parrot: ['#FF9F1C', 1.6] }[type] || null;
}
function animalTail(rig, body, base, B, type, c, A, preset, st) {
  const piv = new THREE.Group(); piv.position.set(...base); body.add(piv); rig.tail = piv;
  const mc = partMat(c, preset), white = partMat(A.bel || '#FFFFFF', preset), acc = partMat(A.a || '#FFE066', preset);
  if (type === 'puff') piv.add(M(SPH, partMat('#FFFFFF', 'wool'), [B * .24, B * .24, B * .22], [0, 0, -B * .08]));
  if (type === 'nub') piv.add(M(SPH, mc, [B * .14, B * .13, B * .13], [0, 0, -B * .05]));
  if (type === 'fox' || type === 'kyubi') {
    const n = type === 'kyubi' ? 9 : 1;
    for (let i = 0; i < n; i++) { const t = n > 1 ? i / (n - 1) - .5 : 0, g = new THREE.Group(); g.rotation.set(-.32, 0, t * 2.6); piv.add(g);
      g.add(M(GEO.drop, type === 'kyubi' ? partMat(i % 2 ? '#FFFFFF' : mixHex(c, A.a, .35), preset) : mc, [B * .38, B * .95, B * .38], [0, B * .85, 0])); g.add(M(GEO.drop, white, [B * .26, B * .38, B * .26], [0, B * 1.62, 0])); }
  }
  if (type === 'squirrel') { const tm = partMat(darken(c, .95), preset); [[0, .4, -.15, .38], [0, .95, -.38, .44], [0, 1.4, -.2, .38], [0, 1.55, .15, .28]].forEach(([x, y, z, r]) => piv.add(M(SPH, tm, [B * r, B * r * 1.1, B * r], [x, B * y, B * z]))); }
  if (type === 'cat') { limb(piv, mc, [[0, 0, 0], [0, B * .25, -B * .4], [0, B * .7, -B * .45], [B * .12, B * .95, -B * .25]], B * .09, B * .07); }
  if (type === 'thin') { limb(piv, mc, [[0, 0, 0], [0, -B * .15, -B * .3]], B * .05, B * .03); piv.add(M(GEO.drop, partMat(darken(c, .6), preset), [B * .06, B * .12, B * .06], [0, -B * .2, -B * .34], [2.6, 0, 0])); }
  if (type === 'tanuki') { const dark = partMat(A.a || '#6B4A33', preset); piv.rotation.x = -.35; [0, 1, 2, 3, 4].forEach(i => piv.add(M(SPH, i % 2 ? dark : mc, [B * (.36 - i * .03), B * .26, B * (.36 - i * .03)], [0, B * (.15 + i * .26), -B * .12]))); }
  if (type === 'pony') { const hm = partMat(A.mane || A.a || '#B98CFF', 'satin'); [-1, 0, 1].forEach(i => limb(piv, hm, [[i * B * .05, 0, 0], [i * B * .1, -B * .2, -B * .3], [i * B * .14, -B * .55, -B * .35]], B * .1, B * .04)); }
  if (type === 'dragon' || type === 'comet') {
    const L = B * (st >= 4 ? 2 : 1.4), pts = []; for (let i = 0; i < 6; i++) { const t = i / 5; pts.push([Math.sin(t * 2.2) * L * .25, Math.sin(t * Math.PI) * L * .25 + t * L * .2, -t * L]); }
    const g = limb(piv, mc, pts, B * .2, B * .06, false), e = g.userData.end;
    if (type === 'dragon') piv.add(M(GEO.octa, acc, [B * .2, B * .26, B * .06], [e.x, e.y, e.z], [-.9, 0, 0]));
    else { const s = M(GEO.star, pm('#FFE066', { r: .2, cc: .8, e: '#FFC21A', ei: .55 }), [B * .3, B * .3, B * .3], [e.x, e.y + B * .1, e.z]); piv.add(s); rig.spin.push(s); for (let i = 1; i < 7; i++) piv.add(M(SPHL, glowMat(i % 2 ? (A.a || '#56D9F5') : '#FFFFFF'), [.07 - i * .008, .07 - i * .008, .07 - i * .008], [e.x - Math.sin(i) * .08, e.y - i * .05, e.z + i * .16])); }
  }
  if (type === 'bird') [-1, 0, 1].forEach(i => piv.add(M(GEO.drop, i ? mc : acc, [B * .1, B * .34, B * .04], [i * B * .1, B * .12, -B * .05], [-1.1, 0, i * .45])));
  if (type === 'plumes') [-2, -1, 0, 1, 2].forEach(i => { const L = B * (st >= 4 ? 1.6 : 1.1) * (1 - Math.abs(i) * .12); const g = new THREE.Group(); g.rotation.set(-1.05, 0, i * .22); piv.add(g); g.add(M(GEO.drop, i % 2 ? acc : mc, [B * .1, L * .5, B * .04], [0, L * .5, 0])); g.add(M(GEO.drop, partMat('#FFFFFF', preset), [B * .07, B * .14, B * .03], [0, L * 1.05, 0])); });
  if (type === 'fluke') { const fm = partMat(c, preset); limb(piv, fm, [[0, 0, 0], [0, B * .1, -B * .5], [0, B * .3, -B * .8]], B * .26, B * .1, false); [-1, 1].forEach(d => piv.add(M(GEO.leaf, fm, [B * .26, B * .5, B * .06], [d * B * .28, B * .38, -B * .85], [Math.PI / 2, 0, d * 1.1]))); }
  return piv;
}
function animalWings(rig, body, type, A, c, a, B, st, by, sh) {
  if (!type) return;
  if (type === 'bat' || type === 'dragon' || type === 'glide') {
    const span = B * (type === 'glide' ? 1.1 : st >= 4 ? 2.6 : 1.7), mem = pm(type === 'glide' ? mixHex(c, '#FFFFFF', .3) : darken(c, .8), { r: .5, cc: .3, ds: true, op: .96, sh: '#FFFFFF' }), bone = partMat(c, 'satin');
    [-1, 1].forEach(d => { const piv = new THREE.Group(); piv.position.set(d * B * sh[0] * .6, by + B * .4, -B * .45); piv.userData.base = .35; body.add(piv); rig.wings.push([piv, d]);
      const w = new THREE.Group(); w.rotation.y = d * .45; piv.add(w);
      const s = new THREE.Shape(); s.moveTo(0, 0); s.quadraticCurveTo(span * .5, span * .6, span, span * .42);
      const pts = [[span * .86, span * .05], [span * .66, span * .12], [span * .56, -span * .12], [span * .36, span * .04], [span * .22, -span * .16], [0, -span * .08]];
      pts.forEach(([px, py], i) => s.quadraticCurveTo((px + (i ? pts[i - 1][0] : span)) / 2, py + span * .1, px, py)); s.lineTo(0, 0);
      const g = new THREE.ShapeGeometry(s, 20); if (d < 0) g.scale(-1, 1, 1); const m = new THREE.Mesh(g, mem); m.castShadow = true; w.add(m);
      limb(w, bone, [[0, 0, 0], [d * span * .5, span * .5, .02], [d * span, span * .42, 0]], B * .06, B * .025);
      if (type === 'dragon') w.add(M(GEO.cone, partMat(A.a || '#FFE066', 'scale'), [B * .05, B * .14, B * .05], [d * span * .5, span * .58, 0]));
    });
    return;
  }
  const span = { small: .62, big: st >= 4 ? 2.1 : 1.3, crystal: st >= 4 ? 2.1 : 1.3, leaf: st >= 4 ? 1.9 : 1.05 }[type] * (B / .64);
  [-1, 1].forEach(d => wing(rig, body, type, d, span, c, a, [B * sh[0] * .5, by + B * .45, -B * .55, st >= 4 ? .35 : .18]));
}
function animalExtras(rig, head, body, A, sp, R, deform, B, by, sh, preset, c) {
  const st = sp.vst ?? sp.stage, r0 = R[0];
  if (A.mane) { const mm = partMat(A.mane, 'satin'); for (let i = 0; i < 6; i++) { const t = i / 5, g = stick(head, R, 0, 1.1 - t * 1.5, deform, 0); g.add(M(GEO.drop, mm, [r0 * .16, r0 * .26, r0 * .12], [0, r0 * .05, -r0 * .02], [-.6, 0, (i % 2 - .5) * .5])); } for (let i = 0; i < 4; i++) body.add(M(GEO.drop, mm, [B * .16, B * .26, B * .12], [0, by + B * (.55 - i * .2), -B * (.75 + i * .05)], [-1.8, 0, 0])); }
  if (A.wool) { const wm = partMat(A.wool === true ? (sp.id === 26 ? darken(c, .9) : '#FFFFFF') : A.wool, 'wool'); for (let i = 0; i < 26; i++) { const th = i / 26 * Math.PI * 2 * 3.1, ph = -.6 + (i % 7) / 7 * 1.6; const x = Math.cos(th) * Math.cos(ph), y = Math.sin(ph), z = Math.sin(th) * Math.cos(ph); if (z > .55 && y < .4) continue; body.add(M(SPH, wm, [B * .3, B * .26, B * .3], [x * B * sh[0] * 1.02, by + y * B * sh[1] * .85, z * B * sh[2]])); } [0, 1, 2, 3, 4].forEach(i => { const g = stick(head, R, (i - 2) * .3, 1.0 - Math.abs(i - 2) * .12, deform, r0 * .02); g.add(M(SPH, wm, [r0 * .2, r0 * .17, r0 * .2])); }); }
  if (A.spikes) { const sm = partMat('#7A5A44', 'satin'); for (let i = 0; i < 70; i++) { const th = Math.PI + (i / 70 - .5) * 3.4 + Math.sin(i * 7) * .1, ph = -.5 + ((i * 7) % 11) / 11 * 1.5; const n = new THREE.Vector3(Math.sin(th) * Math.cos(ph), Math.sin(ph), Math.cos(th) * Math.cos(ph)); if (n.z > .15) continue; const m = M(GEO.cone, sm, [B * .08, B * .42, B * .08], [n.x * B * sh[0] * 1.05, by + n.y * B * sh[1] * .9, n.z * B * sh[2] * 1.05]); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), n); body.add(m); }
    for (let i = 0; i < 26; i++) { const th = (i / 26 - .5) * 3.6 + Math.PI, g = stick(head, R, th, .3 + (i % 4) * .28, deform, 0); g.add(M(GEO.cone, sm, [r0 * .08, r0 * .36, r0 * .08], [0, 0, r0 * .15], [Math.PI / 2, 0, 0])); } }
  if (A.shell) { const shm = partMat(A.a || '#4E9A3D', 'smooth'), rim = partMat('#FFF4C8', 'satin'); const sh2 = M(new THREE.SphereGeometry(1, 40, 24, 0, Math.PI * 2, 0, Math.PI * .5), shm, [B * sh[0] * 1.32, B * sh[1] * 1.12, B * sh[2] * .95], [0, by, -B * .35], [-Math.PI / 2, 0, 0]); body.add(sh2); const dep = B * sh[1] * 1.12, cz = -B * .35; for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2, rr = i ? .55 : 0, px = Math.cos(a) * rr * .75, py = Math.sin(a) * rr * .75, pz = Math.sqrt(Math.max(0, 1 - px * px - py * py)); body.add(M(GEO.dodeca, partMat(mixHex(A.a || '#4E9A3D', '#FFE066', .3), 'smooth'), [B * .26, B * .26, B * .1], [px * B * sh[0] * 1.32, by + py * B * sh[2] * .95, cz - pz * dep])); }  if (st >= 3) [[-.3, .5], [.35, .2], [0, -.2]].forEach(([x, y]) => body.add(M(GEO.leaf, pm('#7BCB4E', { r: .45, cc: .4, sh: '#F0FFE0' }), [B * .12, B * .24, .03], [x * B, by + y * B + B * .3, -B * 1.32], [0, 0, x * 2]))); }
  if (A.armor) { const am = partMat(darken(c, .82), 'rock'); [[0, .55, -.8, .38], [.45, .35, -.55, .28], [-.45, .35, -.55, .28], [0, 1.0, -.55, .3], [.55, .75, -.2, .22], [-.55, .75, -.2, .22]].forEach(([x, y, z, r]) => body.add(M(GEO.dodeca, am, [r * B, r * .62 * B, r * B], [x * B, B * .2 + y * B, z * B], [x * 2, y * 3, z]))); }
  if (A.leaf) { const g = stick(head, R, .1, 1.15, deform, 0); g.add(M(GEO.leaf, pm('#6CC644', { r: .45, cc: .4, sh: '#F0FFE0' }), [r0 * .22, r0 * .4, .03], [0, r0 * .22, 0], [0, 0, -.35])); }
  if (A.yuzu) { const g = stick(head, R, .05, 1.35, deform, -r0 * .02); g.add(M(SPH, pm('#FFC21A', { r: .55, cc: .5, sh: '#FFF6B0' }), [r0 * .3, r0 * .26, r0 * .3], [0, r0 * .18, 0])); g.add(M(GEO.leaf, pm('#5E9E3A', { r: .45 }), [r0 * .08, r0 * .14, .02], [r0 * .08, r0 * .45, 0], [0, 0, -.8])); }
  if (A.flowerCrown) { const cols = ['#FF8FB1', '#FFE066', '#B98CFF', '#7FD4FF']; for (let i = 0; i < 9; i++) { const g = stick(head, R, (i / 8 - .5) * 2.4, .72 + Math.cos((i / 8 - .5) * 2.4) * .18, deform, 0); const pet = pm(cols[i % 4], { r: .45, cc: .35, sh: '#FFFFFF' }); for (let k = 0; k < 5; k++) { const an = k / 5 * Math.PI * 2; g.add(M(SPHL, pet, [r0 * .06, r0 * .04, r0 * .02], [Math.cos(an) * r0 * .06, Math.sin(an) * r0 * .06, r0 * .02])); } g.add(M(SPHL, pm('#FFF6D6', { r: .4 }), [r0 * .03, r0 * .03, r0 * .03], [0, 0, r0 * .04])); } }
  if (A.crest) { const g = stick(head, R, 0, 1.15, deform, r0 * .04); g.quaternion.setFromEuler(new THREE.Euler(-.45, 0, 0)); const n = A.crest === 'crest' ? (st >= 3 ? 5 : 4) : 3; for (let j = 0; j < n; j++) { const i = j - (n - 1) / 2; g.add(M(GEO.drop, partMat(Math.abs(i) < .6 ? (A.a || '#FFE066') : c, 'feather'), [r0 * .1, r0 * (A.crest === 'crest' ? .55 : .36) * (1 - Math.abs(i) * .15), r0 * .06], [i * r0 * .09, r0 * .3, -Math.abs(i) * r0 * .06], [-.4 - Math.abs(i) * .1, 0, -i * .3])); } }
  if (A.brow) [-1, 1].forEach(d => { const g = stick(head, R, d * .36, .18, deform, -r0 * .01); g.add(M(GEO.drop, pm('#2B2633', { r: .4 }), [r0 * .05, r0 * .16, r0 * .03], [0, 0, 0], [0, 0, d * 1.25])); });
  if (A.frog) [-1, 1].forEach(d => { const g = stick(head, R, d * .4, .62, deform, r0 * .26); g.add(M(SPH, partMat(c, 'smooth'), [r0 * .27, r0 * .25, r0 * .2], [0, r0 * .04, -r0 * .1])); });
}
// horns & antlers
function animalHorn(head, R, deform, type, A, big, st) {
  const r0 = R[0], hm = pm(mixHex(A.a || '#FFE066', '#FFFFFF', .25), { r: .25, cc: .9, ccr: .1, sh: '#FFFFFF', rim: '#FFFFFF', rimK: .25 });
  if (type === 'unicorn') { const g = stick(head, R, 0, .85, deform, 0); g.rotation.x -= .2; const len = r0 * (big ? .7 : .5); g.add(M(GEO.cone, hm, [r0 * .11, len, r0 * .11], [0, len * .45, 0])); for (let i = 0; i < 3; i++) g.add(M(new THREE.TorusGeometry(r0 * (.09 - i * .022), r0 * .018, 8, 20), pm('#FFFFFF', { r: .3 }), [1, 1, 1], [0, len * (.15 + i * .25), 0], [Math.PI / 2, 0, 0])); }
  if (type === 'dragon') [-1, 1].forEach(d => { const g = stick(head, R, d * .4, .95, deform, 0); g.rotation.z += -d * .45; g.rotation.x -= .4; const len = r0 * (big ? .55 : .35) * (A.cool ? 2.6 : 1); if (A.cool) g.rotation.z -= d * .15; g.add(M(GEO.cone, hm, [r0 * (A.cool ? .17 : .1), len, r0 * (A.cool ? .17 : .1)], [0, len * .45, 0])); });
  if (type === 'ram') [-1, 1].forEach(d => { const g = stick(head, R, d * .62, .55, deform, 0); g.add(M(new THREE.TorusGeometry(r0 * .18, r0 * .07, 12, 24, Math.PI * 1.5), hm, [1, 1, 1], [d * r0 * .08, 0, 0], [0, d * Math.PI / 2, 0])); });
  if (type === 'rhino') { const g = stick(head, R, 0, -.05, deform, 0); g.rotation.x -= .6; g.add(M(GEO.cone, pm('#FFF2DC', { r: .4, cc: .5 }), [r0 * .16, r0 * .5, r0 * .16], [0, r0 * .38, r0 * .2])); g.add(M(GEO.cone, pm('#FFF2DC', { r: .4, cc: .5 }), [r0 * .1, r0 * .26, r0 * .1], [0, r0 * .3, -r0 * .08])); }
  if (type === 'antler') { const am = pm('#E9D6BE', { r: .5, cc: .3, sh: '#FFFFFF' }); [-1, 1].forEach(d => { const g = stick(head, R, d * .42, .95, deform, 0); g.quaternion.setFromEuler(new THREE.Euler(-.2, 0, -d * .35)); const s = r0 * (big ? 1.25 : .8);
    limb(g, am, [[0, 0, 0], [d * s * .1, s * .45, -s * .05], [d * s * .3, s * .85, -s * .1]], r0 * .07, r0 * .035); limb(g, am, [[d * s * .08, s * .4, -s * .04], [d * s * .38, s * .52, 0]], r0 * .045, r0 * .025); limb(g, am, [[d * s * .2, s * .68, -s * .08], [d * s * .02, s * .98, -s * .05]], r0 * .04, r0 * .022);
    [[.38, .52], [.3, .85], [.02, .98]].forEach(([x, y], i) => g.add(M(GEO.leaf, pm(i === 1 ? '#FF8FB1' : '#7BCB4E', { r: .45, cc: .35, sh: '#F0FFE0' }), [s * .09, s * .16, .02], [d * x * s, y * s + s * .06, 0], [0, 0, -d * .6]))); }); }
}

/* signature element per evolved form: what orbits it */
const ELEM = (() => { const bolt = new THREE.Shape(); [[0, 1], [.5, .15], [.12, .15], [.45, -1], [-.45, .05], [-.05, .05], [-.35, 1]].forEach(([x, y], i) => i ? bolt.lineTo(x, y) : bolt.moveTo(x, y));
  const moon = new THREE.Shape(); moon.absarc(0, 0, 1, Math.PI * .25, Math.PI * 1.75, false); moon.absarc(.45, 0, .78, Math.PI * 1.6, Math.PI * .4, true);
  const heart = new THREE.Shape(); heart.moveTo(0, -.9); heart.bezierCurveTo(.9, -.2, 1.05, .65, .5, .9); heart.bezierCurveTo(.2, 1.02, 0, .8, 0, .55); heart.bezierCurveTo(0, .8, -.2, 1.02, -.5, .9); heart.bezierCurveTo(-1.05, .65, -.9, -.2, 0, -.9);
  const ex = sh => new THREE.ExtrudeGeometry(sh, { depth: .25, bevelEnabled: false }).center();
  const gear = (() => { const g = new THREE.Shape(), n = 8; for (let i = 0; i <= n * 4; i++) { const a = i / (n * 4) * Math.PI * 2, r = (i % 4 < 2) ? 1 : .75; i ? g.lineTo(Math.cos(a) * r, Math.sin(a) * r) : g.moveTo(Math.cos(a) * r, Math.sin(a) * r); } const h = new THREE.Path(); h.absarc(0, 0, .35, 0, Math.PI * 2, true); g.holes.push(h); return ex(g); })();
  return {
    fire: { g: GEO.drop, s: [.07, .14, .07], c: ['#FF4D1A', '#FFC93D', '#FF8A3D'] }, blue: { g: GEO.drop, s: [.07, .14, .07], c: ['#56D9F5', '#B36BFF', '#FFFFFF'] },
    ice: { g: GEO.octa, s: [.06, .12, .06], c: ['#BFF0FF', '#FFFFFF', '#7FD4FF'], spin: 1 }, bolt: { g: ex(bolt), s: [.1, .12, .1], c: ['#FFE066', '#FFFFFF'] },
    leaf: { g: GEO.leaf, s: [.07, .13, .03], c: ['#7BCB4E', '#FF8FB1', '#B8E986'], spin: 1 }, water: { g: SPHL, s: [.07, .07, .07], c: ['#56D9F5', '#BFF0FF'] },
    gem: { g: GEO.octa, s: [.07, .11, .07], c: ['#B36BFF', '#56D9F5', '#FF8FB1', '#FFE066'], spin: 1 }, gear: { g: gear, s: [.09, .09, .09], c: ['#D4FF3A', '#C9C4DA', '#FFC21A'], spin: 1 },
    star: { g: GEO.star, s: [.1, .1, .1], c: ['#FFE066', '#FFFFFF', '#B36BFF'], spin: 1 }, moon: { g: ex(moon), s: [.1, .1, .1], c: ['#FFE066', '#FFF4C8'] },
    heart: { g: ex(heart), s: [.09, .09, .09], c: ['#FF5C8A', '#FF8FB1', '#FFFFFF'] }, note: { g: GEO.star, s: [.08, .08, .08], c: ['#D4FF3A', '#56D9F5'] },
    gold: { g: GEO.octa, s: [.06, .1, .06], c: ['#FFC93D', '#FFE9A8'], spin: 1 }, neon: { g: ex(bolt), s: [.09, .11, .09], c: ['#D4FF3A', '#FF5C8A', '#56D9F5'] } };
})();
const ELEM_OF = { 103: 'fire', 104: 'heart', 105: 'leaf', 106: 'leaf', 107: 'gold', 108: 'ice', 109: 'leaf', 110: 'water', 111: 'blue', 112: 'moon', 113: 'ice', 114: 'gold',
  121: 'fire', 122: 'water', 123: 'bolt', 124: 'leaf', 125: 'ice', 126: 'leaf', 127: 'fire', 128: 'heart', 129: 'ice', 130: 'gem', 131: 'fire', 132: 'water', 133: 'ice', 134: 'leaf',
  144: 'bolt', 146: 'note', 148: 'bolt', 150: 'neon', 152: 'star', 153: 'fire', 154: 'gem' };
/* ---------- the builder (stages 1–4) ---------- */
function buildAnimal(sp, rig) {
  const A = MOTIF[sp.id] || {}, body = rig.body, st = sp.vst ?? sp.stage, L = sp.line;
  const c0 = '#' + VIVID(A.c || sp.color).getHexString(), c = A.cool ? (k => { const h = {}; k.getHSL(h); k.setHSL(h.h, Math.min(1, h.s * 1.3 + .1), h.l * .74); return '#' + k.getHexString(); })(new THREE.Color(c0)) : c0, a = A.a || sp.accent, bel = A.cool ? mixHex(A.bel || '#FFF5E8', c, .25) : A.bel || sp.belly || '#FFF5E8', preset = A.mat || 'plush';
  const iris = sp.secret ? '#FF9F1C' : IRIS[L];
  const P = [{ B: .4, H: .62, leg: 0, tall: .95 }, { B: .44, H: .62, leg: 0, tall: 1 }, { B: .52, H: .66, leg: .1, tall: 1.05 }, { B: .62, H: .72, leg: .24, tall: 1.14 }, { B: .8, H: .84, leg: .32, tall: 1.2 }][st];
  const bs = A.body || [1, 1, 1], sh = [bs[0], bs[1] * P.tall, bs[2]], B = P.B * (A.whale ? 1.25 : 1);
  const skin = coatMat(c, preset, sp.secret ? .5 : .26);
  const cols = { dark: A.limbs || (A.pat === 'panda' ? '#2B2633' : A.pat === 'mask' ? '#4A3426' : darken(c, .55)), light: bel };
  const legH = A.feet === 'none' ? 0 : P.leg, by = legH + B * sh[1] * .78 + (A.whale ? .35 : 0);
  const bodyPaint = withPattern(toyPaint(c, bel, [0, -.25, 1], A.pat === 'tux' ? 0 : .95, { lo: .55, hi: .8, rainbow: sp.secret }), A.pat, 'body', A, cols);
  const bodyM = blob(skin, [B * sh[0] * 1.08, B * sh[1] * .9, B * sh[2] * .98], bodyPaint, v => { if (v.y < 0) v.y *= .82; v.x *= 1 + .08 * Math.max(0, -v.y); }); bodyM.position.set(0, by, 0); body.add(bodyM);
  // head
  const head = new THREE.Group(); body.add(head); rig.head = head;
  const hs = A.head || [1, 1, 1], Hr = P.H * (A.whale ? .95 : 1), R = [Hr * 1.1 * hs[0], Hr * .95 * hs[1], Hr * hs[2]];
  head.position.set(0, by + B * sh[1] * (A.whale ? .1 : .42) + Hr * (A.whale ? .3 : .58) * hs[1], B * (A.whale ? .45 : .02));
  const facePatch = L === 'B' ? .85 : L === 'C' ? .4 : 0;
  const headPaint = withPattern(toyPaint(A.face || c, bel, [0, -.45, 1], A.pat ? 0 : facePatch, { lo: .5, hi: .85, rainbow: sp.secret, under: 0 }), A.pat, 'head', A, cols);
  head.add(blob(skin, R, headPaint, mochi));
  const eyeK = A.eyes === 'big' ? 1.25 : A.eyes === 'small' ? .7 : 1, ew = Hr * (st === 1 ? .27 : st === 2 ? .25 : .23) * eyeK, eh = Hr * (st === 1 ? .33 : st === 2 ? .31 : .29) * eyeK;
  const bk = animalBeak(A.beak);
  const EX = A.frog ? .4 : A.eyes === 'big' ? .4 : .36, EY = A.frog ? .58 : -.1;
  face(rig, head, R, mochi, { iris, ex: EX, ey: EY, ew, eh, my: A.frog ? -.22 : -.34, ms: Hr * .055 * (bk ? bk[1] : A.frog ? 1.6 : 1), cx: .62, cy: -.27, cs: Hr * .16, beak: bk ? bk[0] : null });
  if (A.eyes === 'sleepy') rig.sleepy = true;
  // ears, snout, horns
  if (A.ears) animalEars(rig, head, R, mochi, A.ears, c, A, preset);
  const mz = animalMuzzle(rig, head, R, mochi, A.muzzle, c, { ...A, bel }, preset);
  if (mz > 0 && rig.mouth) rig.mouth.translateZ(mz); else if (mz < 0 && rig.mouth) rig.mouth.translateY(-R[1] * .1);
  if (A.horn && !(A.cool && A.horn === 'dragon')) animalHorn(head, R, mochi, A.horn, { ...A, a }, st >= 3, st);
  // arms: paws, flippers or little wings
  const limbC = A.limbs || c, am = partMat(limbC, preset);
  if (A.flippers) [-1, 1].forEach(d => { const piv = new THREE.Group(); piv.position.set(d * B * sh[0] * .95, by + B * .15, B * .05); piv.userData.base = .5; body.add(piv); rig.arms.push([piv, d]); piv.add(M(GEO.leaf, am, [B * .2, B * .48, B * .07], [d * B * .14, -B * .3, 0], [0, 0, d * .5])); });
  else if (A.wingArms) [-1, 1].forEach(d => { const w = wing(rig, body, 'small', d, .62 * (B / .5), c, a, [B * .9, by + B * .05, B * .05, .25]); rig.arms.push([w, d]); rig.wings.pop(); });
  else [-1, 1].forEach(d => { const piv = new THREE.Group(); piv.position.set(d * B * sh[0] * .82, by + B * .25, B * .12); body.add(piv); piv.userData.base = .55; rig.arms.push([piv, d]);
    const len = B * (st >= 3 ? .62 : .5); piv.add(M(SPH, am, [B * .2, len * .62, B * .2], [d * len * .25, -len * .45, 0], [0, 0, d * .35])); });
  // feet
  const fcol = A.feet === 'bird' || A.feet === 'web' ? (A.feet === 'web' ? mixHex(c, '#FFFFFF', .2) : '#FFB13D') : A.feet === 'hoof' ? darken(limbC, .55) : mixHex(limbC, '#FFFFFF', .12);
  const fm = partMat(fcol, A.feet === 'hoof' ? 'satin' : preset), pad = pm('#FFB7CF', { r: .6 });
  const OF = typeof outfitOf === 'function' ? outfitOf(sp) : null, sneak = !!(OF && OF.shoes === 'sneakers'), feetPos = [];
  if (A.feet !== 'none') [-1, 1].forEach(d => {
    if (legH) body.add(M(SPH, am, [B * .26, legH * .9 + B * .2, B * .28], [d * B * .4, legH * .7, 0]));
    if (sneak) { feetPos.push([d * B * .42, B * .2]); return; }
    if (A.feet === 'bird' || A.feet === 'web') [-1, 0, 1].forEach(i => body.add(M(GEO.drop, fm, [B * .07, B * .2, B * .05], [d * B * .4 + i * B * .1, B * .04, B * .2], [Math.PI / 2 - .1, 0, i * .45])));
    else { body.add(M(SPH, fm, [B * .3, B * .17, B * .4], [d * B * .42, B * .1, B * .2])); if (A.feet === 'paw' || A.feet === 'claw') { if (st >= 3) for (let i = -1; i <= 1; i++) body.add(M(SPHL, A.feet === 'claw' ? pm('#FFF2DC', { r: .3, cc: .8 }) : fm, [B * .08, B * .07, B * .09], [d * B * .42 + i * B * .12, B * .09, B * .56])); body.add(M(SPHL, pad, [B * .14, .01, B * .16], [d * B * .42, .005, B * .22])); } }
  });
  // wings & tail
  animalWings(rig, body, A.wings, A, c, a, B, st, by, sh);
  const tailType = A.tail === 'none' ? null : A.tail || 'nub';
  if (tailType) animalTail(rig, body, [0, by - B * .25, -B * sh[2] * .85], B * (st >= 3 ? 1.1 : 1), tailType, c, { ...A, bel }, preset, st);
  // growth cues: furry folk get a chest ruff from stage 3; every final form wears a glowing forehead gem
  const furry = ['plush', 'fur', 'wool'].includes(preset) && !A.wool;
  if (st >= 3 && furry) {
    const fl = partMat(mixHex(bel, '#FFFFFF', .35), 'wool'), ny = by + B * sh[1] * .56, n = st >= 4 ? 22 : 7, span = st >= 4 ? Math.PI * 2 : 1.6;
    for (let i = 0; i < n; i++) { const t = st >= 4 ? i / n * span : (i / (n - 1) - .5) * span, rr = st >= 4 ? .92 : .86, tuft = new THREE.Group(); tuft.position.set(Math.sin(t) * B * sh[0] * rr, ny, Math.cos(t) * B * sh[2] * rr); tuft.rotation.y = t; body.add(tuft); tuft.add(M(SPH, fl, [B * .24, B * .19, B * .17], [0, -B * .02, 0])); }
  }
  if (st >= 4) { const gem = stick(head, R, 0, A.frog ? .2 : .42, mochi, -.01); gem.add(M(GEO.octa, pm(a, { r: .05, cc: 1, e: a, ei: .9, env: 1.3 }), [R[0] * .09, R[0] * .13, R[0] * .05])); }
  const top = head.position.y + R[1] * .95, hz = head.position.z;
  body.userData.top = top - .3;
  animalExtras(rig, head, body, { ...A, a }, sp, R, mochi, B, by, sh, preset, c);
  if (A.robot) { // a little lab robot: antenna with a glowing bulb, ear bolts, a chest screen that pulses with the beat
    const metalM = pm('#C9C4DA', { m: .6, r: .28, cc: .6 }), glowM = new THREE.MeshBasicMaterial({ color: LIN(a), toneMapped: false });
    const ant = stick(head, R, 0, 1.25, mochi, -.01); ant.add(M(new THREE.CylinderGeometry(R[0] * .03, R[0] * .04, R[1] * .4, 10), metalM, [1, 1, 1], [0, 0, R[1] * .2], [Math.PI / 2, 0, 0]));
    const bulb = M(SPHL, glowM, [R[0] * .11, R[0] * .11, R[0] * .11], [0, 0, R[1] * .44]); ant.add(bulb); rig.floaters.push(bulb);
    [-1, 1].forEach(d => { const g = stick(head, R, d * 1.5, .05, mochi, .02); g.add(M(new THREE.CylinderGeometry(R[0] * .16, R[0] * .16, R[0] * .14, 20), metalM, [1, 1, 1], [0, 0, R[0] * .04], [Math.PI / 2, 0, 0])); g.add(M(new THREE.CylinderGeometry(R[0] * .08, R[0] * .08, R[0] * .16, 14), glowM, [1, 1, 1], [0, 0, R[0] * .08], [Math.PI / 2, 0, 0])); });
    const scr = new THREE.Group(); scr.position.set(0, by + B * .05, B * sh[2] * .98); body.add(scr);
    scr.add(M(new THREE.BoxGeometry(B * .62, B * .4, B * .06), pm('#2B2633', { r: .2, cc: 1 })));
    for (let i = 0; i < 5; i++) { const bar = M(new THREE.BoxGeometry(B * .07, B * .26, B * .02), glowM, [1, .3 + (i % 3) * .25, 1], [(i - 2) * B * .11, -B * .02, B * .035]); scr.add(bar); (rig.eqBars = rig.eqBars || []).push(bar); }
    [-1, 1].forEach(d => body.add(M(SPHL, pm(d < 0 ? '#FF5C8A' : '#56D9F5', { r: .3, cc: 1 }), [B * .06, B * .06, B * .04], [d * B * .2, by - B * .3, B * sh[2] * .95])));
  }
  extras(rig, head, body, { ...sp, extras: (sp.extras || []).filter(x => ['halo', 'crown', 'moon', 'star', 'crystals'].includes(x)) }, top, hz, R, mochi, B);
  if (A.cool) { // the cool-dragon kit
    if (A.horn === 'dragon') { const hM = pm('#2E2638', { r: .25, cc: .9 }), tipM = pm(a, { r: .2, cc: 1 }), len = R[0] * (.42 + st * .07);
      [-1, 1].forEach(d => { const hg = stick(head, R, d * .5, .72, mochi, .03), h = new THREE.Group(); h.rotation.set(Math.PI / 2 - .55, 0, -d * .35); hg.add(h);
        h.add(M(GEO.cone, hM, [R[0] * .14, len, R[0] * .14], [0, len * .45, 0])); h.add(M(GEO.cone, tipM, [R[0] * .05, len * .25, R[0] * .05], [0, len * .9, 0])); }); }
    const lidM = partMat(c, preset); rig.eyes.forEach((e, i) => { const d = i ? 1 : -1, g = e.parent; g.scale.set(1.15, 1, 1); g.add(M(SPH, lidM, [ew * .62, eh * .26, ew * .32], [d * ew * .04, eh * .4, ew * .02], [0, 0, d * .42])); });
    rig.wings.forEach(([w]) => w.scale.multiplyScalar(st >= 4 ? 1 : 1.25)); if (rig.tail) rig.tail.scale.multiplyScalar(1.35);
    if (st >= 1) { const spM = partMat(a, 'scale'), BRy = B * sh[1] * .9, BRz = B * sh[2] * .98, n = 2 + st;
      for (let i = 0; i < n; i++) { const t = .45 + i * (1.2 / n); body.add(M(GEO.cone, spM, [B * .07, B * (.22 - i * .02), B * .07], [0, by + BRy * Math.cos(t) * .93, -BRz * Math.sin(t) * .93], [-t, 0, 0])); } }
  }
  if (typeof dressUp === 'function') dressUp(rig, { head, body, R, B, BR: [B * sh[0] * 1.08, B * sh[1] * .9, B * sh[2] * .98], by, ex: EX, ey: EY, ew, eh, st, sh, feet: feetPos });
  rig.top = top + .3; rig.center = top * .5; rig.dance = A.dance || 'sway'; rig.float = !!A.whale; rig.motif = A.an;
  // evolved forms carry a signature: orbiting rhyme orbs that grow with each stage, a light ring for the final form
  if (st >= 2) { const og = new THREE.Group(); og.position.set(0, top * .45, 0); body.add(og); const n = st * 2, rr = B * 1.75 + (st - 2) * B * .15;
    const om = new THREE.MeshBasicMaterial({ color: LIN(a || '#FFE066'), toneMapped: false }), om2 = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false, transparent: true, opacity: .35 });
    const EL = ELEM[ELEM_OF[sp.id] || (A.robot ? 'gear' : '')], k0 = st >= 4 ? 2.4 : st >= 3 ? 2 : 1.6;
    for (let i = 0; i < n; i++) { const t = i / n * Math.PI * 2, o = new THREE.Group(); o.position.set(Math.cos(t) * rr, Math.sin(t * 2) * B * .18, Math.sin(t) * rr * .8); og.add(o);
      if (EL && st >= 2) { const em = new THREE.MeshBasicMaterial({ color: LIN(EL.c[i % EL.c.length]), toneMapped: false, transparent: true, opacity: .95, side: THREE.DoubleSide }), me = new THREE.Mesh(EL.g, em); me.scale.set(...EL.s.map(v => v * B * k0 * (1 + (i % 2) * .25))); me.rotation.set(Math.random() * (EL.spin ? 6 : 0), t, EL.spin ? Math.random() * 6 : 0); o.add(me); if (EL.spin) rig.spin.push(me); }
      else { o.add(new THREE.Mesh(SPHL, om)); o.children[0].scale.setScalar(B * (.06 + (i % 2) * .02)); }
      const h = new THREE.Mesh(SPHL, EL ? new THREE.MeshBasicMaterial({ color: LIN(EL.c[0]), toneMapped: false, transparent: true, opacity: .22 }) : om2); h.scale.setScalar(B * .14 * k0); o.add(h); }
    og.rotation.x = .18; rig.floaters.push(og); rig.orbs = og;
    if (st >= 4) { const ring = new THREE.Mesh(new THREE.TorusGeometry(R[0] * .62, R[0] * .045, 10, 48), new THREE.MeshBasicMaterial({ color: LIN(EL ? EL.c[0] : '#FFE9A8'), toneMapped: false })); ring.rotation.x = Math.PI / 2 - .25; ring.position.set(0, top + .12, -.05); body.add(ring); rig.floaters.push(ring); } }
  return rig;
}
