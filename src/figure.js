/* ---------- FIGURE FINISH: painted-PVC look for every monster and its gear ----------
   smooth, hard surfaces with a clear lacquer coat, crisp reflections, a faint inner glow.
   applied after a monster is built (gear included), so every creature and outfit gets it.  #plush in the URL = old look */
const FIG = !/plush/.test(location.hash);
const FIG_DONE = new WeakSet();
function figurize(m) {
  if (!m || FIG_DONE.has(m)) return; FIG_DONE.add(m);
  if (!m.isMeshPhysicalMaterial && !m.isMeshStandardMaterial) return;
  if (m.metalness > .4) { m.roughness = Math.min(m.roughness, .22); m.envMapIntensity = Math.max(m.envMapIntensity, 1.3); return; }
  const tex = !!m.map;                                   // printed fabrics keep a little texture
  if (m.color) { const h = {}; m.color.getHSL(h); m.color.setHSL(h.h, Math.min(1, h.s * 1.12), Math.min(h.l, .7)); }   // painted, not pastel: a touch richer, whites never blow out
  m.roughness = Math.min(.48, Math.max(.16, m.roughness * .42 + .06));
  if (m.isMeshPhysicalMaterial) { m.clearcoat = Math.max(m.clearcoat, tex ? .55 : .85); m.clearcoatRoughness = Math.min(m.clearcoatRoughness, .1); if (m.sheen) m.sheen.multiplyScalar(.2); }
  m.envMapIntensity = Math.max(m.envMapIntensity, .85);
  if (m.bumpMap) m.bumpScale *= tex ? .5 : .18;           // sculpted smooth, not fuzzy
  m.needsUpdate = true;
}
/* baked contact shadow: every big rounded part (head, body, cheeks, ears…) is an ellipsoid occluder;
   each vertex darkens by how much of its sky those parts cover — creases where parts meet, like a real moulded figure */
const VC_MAT = new WeakMap();
function vcMat(m) { if (m.vertexColors) return m; let c = VC_MAT.get(m); if (c) return c; c = m.clone(); c.vertexColors = true; c.onBeforeCompile = m.onBeforeCompile; c.customProgramCacheKey = m.customProgramCacheKey; if (m.sheen) c.sheen = m.sheen.clone(); FIG_DONE.add(c); VC_MAT.set(m, c); return c; }
const AO_CACHE = new Map();
function bakeAO(root, key) {
  root.updateMatrixWorld(true);
  const all = [], box = new THREE.Box3(), tb = new THREE.Box3();
  root.traverse(o => { if (o.isMesh && o.visible && o.geometry && o.geometry.attributes.position && o.geometry.attributes.normal && !Array.isArray(o.material) && (o.material.isMeshPhysicalMaterial || o.material.isMeshStandardMaterial) && !o.material.transparent) all.push(o); });
  const cached = key && AO_CACHE.get(key);
  if (!cached || cached.length !== all.length) {
    all.forEach(o => box.union(tb.setFromObject(o))); const H = box.getSize(new THREE.Vector3()).y || 1;
    const occ = []; all.forEach((o, j) => { tb.setFromObject(o); const sz = tb.getSize(new THREE.Vector3()), mn = Math.min(sz.x, sz.y, sz.z), mx = Math.max(sz.x, sz.y, sz.z);
      if (mx > H * .1 && mn > mx * .32) { const c = tb.getCenter(new THREE.Vector3()); occ.push([j, c.x, c.y, c.z, 2 / sz.x, 2 / sz.y, 2 / sz.z, sz.x / 2, sz.y / 2, sz.z / 2]); } });
    const res = [], tc = new THREE.Color(), th = {}, nm = new THREE.Matrix3();
    all.forEach((o, j) => {
      const pos = o.geometry.attributes.position, nor = o.geometry.attributes.normal, old = o.geometry.attributes.color, N = pos.count, col = new Float32Array(N * 3);
      const e = o.matrixWorld.elements; nm.getNormalMatrix(o.matrixWorld); const q = nm.elements, P = pos.array, Nn = nor.array, ps = pos.itemSize, ns = nor.itemSize;
      const occs = occ.filter(O => O[0] !== j);
      for (let i = 0; i < N; i++) {
        const x0 = P[i * ps], y0 = P[i * ps + 1], z0 = P[i * ps + 2];
        const vx = e[0] * x0 + e[4] * y0 + e[8] * z0 + e[12], vy = e[1] * x0 + e[5] * y0 + e[9] * z0 + e[13], vz = e[2] * x0 + e[6] * y0 + e[10] * z0 + e[14];
        const a0 = Nn[i * ns], a1 = Nn[i * ns + 1], a2 = Nn[i * ns + 2];
        let nx = q[0] * a0 + q[3] * a1 + q[6] * a2, ny = q[1] * a0 + q[4] * a1 + q[7] * a2, nz = q[2] * a0 + q[5] * a1 + q[8] * a2;
        let vis = 1;
        for (let k = 0; k < occs.length; k++) { const O = occs[k];
          const qx = (O[1] - vx) * O[4], qy = (O[2] - vy) * O[5], qz = (O[3] - vz) * O[6], d2 = qx * qx + qy * qy + qz * qz; if (d2 > 16) continue;
          const mx = nx * O[7], my = ny * O[8], mz = nz * O[9], ml = Math.sqrt(mx * mx + my * my + mz * mz) || 1, cs = (mx * qx + my * qy + mz * qz) / (ml * Math.sqrt(d2)); if (cs <= 0) continue;
          vis *= 1 - .85 * cs * Math.min(1, 1.3 / d2); }
        const a = .3 + .7 * vis;
        if (old) { tc.setRGB(old.getX(i), old.getY(i), old.getZ(i)); tc.getHSL(th); tc.setHSL(th.h, Math.min(1, th.s * 1.12), Math.min(th.l, .7)); } else tc.setRGB(1, 1, 1);
        col[i * 3] = tc.r * a; col[i * 3 + 1] = tc.g * a; col[i * 3 + 2] = tc.b * a; }
      res.push(col); });
    if (key) { AO_CACHE.set(key, res); if (AO_CACHE.size > 60) AO_CACHE.delete(AO_CACHE.keys().next().value); }
    return apply(all, res);
  }
  return apply(all, cached);
  function apply(list, cols) { list.forEach((o, j) => { if (!cols[j] || cols[j].length !== o.geometry.attributes.position.count * 3) return; const g = o.geometry.clone(); g.setAttribute('color', new THREE.BufferAttribute(cols[j], 3)); o.geometry = g; o.material = vcMat(o.material); }); }
}
let _rawBuild = null; if (FIG) { const _bm = buildMonster; _rawBuild = _bm; buildMonster = function (sp) { const r = _bm(sp);
  try { bakeAO(r.root, sp && sp.id + '|' + (typeof WEAR !== 'undefined' ? JSON.stringify(WEAR[sp.id] || {}) : '')); } catch (e) { console.warn('ao', e); }
  r.root.traverse(o => { if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(figurize); }); return r; }; }
// debug: dump a monster as plain mesh data (for offline Blender renders)
window.__exportRig = function (id) { const r = (FIG ? _rawBuild : buildMonster)(BY[id]); const root = r.root; root.rotation.y = 0; root.updateMatrixWorld(true); const out = [];
  const imgOf = t => { try { const im = t && t.image; if (!im) return null; if (im.toDataURL) return im.toDataURL('image/png'); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; c.getContext('2d').drawImage(im, 0, 0); return c.toDataURL('image/png'); } catch (e) { return null; } };
  const nm = new THREE.Matrix3(), v = new THREE.Vector3();
  root.traverse(o => { if (!o.isMesh || !o.visible || Array.isArray(o.material)) return; let p = o.parent, vis = true; while (p) { if (!p.visible) vis = false; p = p.parent; } if (!vis) return;
    const g = o.geometry.index ? o.geometry : o.geometry, a = g.attributes, m = o.material; if (!a.position) return; nm.getNormalMatrix(o.matrixWorld);
    const P = [], N = []; for (let i = 0; i < a.position.count; i++) { v.fromBufferAttribute(a.position, i).applyMatrix4(o.matrixWorld); P.push(+v.x.toFixed(5), +v.y.toFixed(5), +v.z.toFixed(5)); if (a.normal) { v.fromBufferAttribute(a.normal, i).applyMatrix3(nm).normalize(); N.push(+v.x.toFixed(4), +v.y.toFixed(4), +v.z.toFixed(4)); } }
    const I = g.index ? Array.from(g.index.array) : null, C = a.color && m.vertexColors ? Array.from(a.color.array, x => +x.toFixed(4)) : null, U = a.uv ? Array.from(a.uv.array, x => +x.toFixed(5)) : null;
    const col = m.color ? [m.color.r, m.color.g, m.color.b] : [1, 1, 1];
    out.push({ P, N, I, C, U, side: m.side, mat: { basic: !!m.isMeshBasicMaterial, col, r: m.roughness ?? 1, met: m.metalness || 0, cc: m.clearcoat || 0, ccr: m.clearcoatRoughness || 0, em: m.emissive ? [m.emissive.r * (m.emissiveIntensity ?? 1), m.emissive.g * (m.emissiveIntensity ?? 1), m.emissive.b * (m.emissiveIntensity ?? 1)] : [0, 0, 0], op: m.transparent ? m.opacity : 1, map: m.map ? imgOf(m.map) : null, rep: m.map ? [m.map.repeat.x, m.map.repeat.y, m.map.offset.x, m.map.offset.y] : null, key: m.uuid } }); });
  return out; };

// pre-rendered Blender figures (figs/ID.webp) for the showcase screens: 図鑑, evolution choice, ending, rivals
const FIG_IDS = new Set(typeof FIG_IDS_LIST !== 'undefined' ? FIG_IDS_LIST : []);
function figImg(id) { return FIG && FIG_IDS.has(+id) ? 'figs/' + id + '.webp' : null; }
function figThumbs(px, ry, ids) { const out = {}, need = []; ids.forEach(id => { const f = figImg(id); if (f) out[id] = f; else need.push(id); }); if (need.length) Object.assign(out, makeThumbs(px, ry, need)); return out; }
