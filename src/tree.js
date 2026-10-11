let treeDirty = true, thumbs = null, selected = 0, showAll = false;
function makeThumbs(px = 192, ry = -.6, ids) {
  const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  r.setSize(px, px); r.setPixelRatio(1);
  r.outputEncoding = THREE.sRGBEncoding; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
  const sc = new THREE.Scene(); addLights(sc, r);
  const cam = new THREE.PerspectiveCamera(30, 1, .1, 50);
  const out = {};
  for (const sp of (ids ? ids.map(i => BY[i]) : SP)) {
    const m = buildMonster(sp); m.root.rotation.y = ry; sc.add(m.root);
    const box = new THREE.Box3().setFromObject(m.root), size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
    const d = Math.max(size.x, size.y) / (2 * Math.tan(15 * Math.PI / 180)) * 1.15;
    cam.position.set(c.x, c.y + size.y * .12, c.z + d); cam.lookAt(c);
    r.render(sc, cam); out[sp.id] = r.domElement.toDataURL('image/png'); sc.remove(m.root);
  }
  r.dispose(); try { r.forceContextLoss(); } catch (e) {} return out;
}
// three trees side by side in sections: starter → 2 → 4 → 4 → 4
function renderTree() {
  if (!thumbs) thumbs = {};
  ROSTER.forEach(id => { const f = figImg(id); if (f) thumbs[id] = f; });
  const need = ROSTER.filter(id => !thumbs[id]);
  if (need.length && !renderTree.busy) { renderTree.busy = true; const step = () => { const ids = ROSTER.filter(id => !thumbs[id]).slice(0, 3); if (!ids.length || $('treeView').hidden) { renderTree.busy = false; return; } try { Object.assign(thumbs, makeThumbs(160, -.5, ids)); } catch (e) {} ids.forEach(id => document.querySelectorAll(`[data-tid="${id}"]`).forEach(im => im.src = thumbs[id])); setTimeout(step, 30); }; setTimeout(step, 60); }
  const COLW = 190, ROWH = 76, TOP = 30, SEC = 4 * ROWH + 34;
  const tree = $('tree'), W = COLW * 3 + 172, H = TOP + 3 * SEC; tree.style.width = W + 'px'; tree.style.height = H + 'px';
  const known = id => showAll || discovered.has(id), pos = {};
  Object.keys(TREE).forEach((mk, mi) => { const y0 = TOP + mi * SEC + 18, [s0, ...b] = TREE[mk];
    b.forEach(([s1, ...subs], bi) => subs.forEach(([s2, s4], si) => { const r = bi * 2 + si; [[s2, 2], [s4, 3]].forEach(([id, st]) => pos[id] = { x: st * COLW, y: y0 + r * ROWH, mk }); }));
    b.forEach(([s1], bi) => pos[s1] = { x: COLW, y: y0 + (bi * 2 + .5) * ROWH, mk });
    pos[s0] = { x: 0, y: y0 + 1.5 * ROWH, mk }; });
  let svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true">`;
  ROSTER.forEach(id => BY[id].kids.forEach(k => { const a = pos[id], b = pos[k], x1 = a.x + 168, y1 = a.y + 32, x2 = b.x, y2 = b.y + 32, mx = (x1 + x2) / 2, on = discovered.has(k);
    svg += `<path d="M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}" fill="none" stroke="${on ? MODES[BY[k].mode].col : '#3A3858'}" stroke-width="${on ? 3 : 1.5}"/>`; }));
  svg += '</svg>';
  let html = svg + '<div class="cols">' + STAGE_NAME.map((n, i) => `<span style="position:absolute;left:${i * COLW}px">${n}</span>`).join('') + '</div>';
  Object.keys(TREE).forEach((mk, mi) => { const m = MODES[mk]; html += `<div class="rowlbl" style="top:${TOP + mi * SEC}px;color:${m.col}">${m.en} — ${m.cup}${unlocked(mk) ? '' : ' 🔒'}${PRG.cleared[mk] ? ' ♛' : ''}</div>`; });
  ROSTER.forEach(id => { const s = BY[id], k = known(id), p = pos[id];
    html += `<button class="node${k ? '' : ' unk'}${id === selected ? ' sel' : ''}${id === G.sp.id ? ' cur' : ''}" data-id="${id}" style="left:${p.x}px;top:${p.y}px"><img src="${thumbs[id] || ''}" data-tid="${id}" alt=""><span><span class="nm">${k ? s.name : '？？？'}</span><span class="cd" style="display:block">${s.cond}</span></span></button>`; });
  tree.innerHTML = html;
  tree.querySelectorAll('.node').forEach(b => b.addEventListener('click', () => { selected = +b.dataset.id; renderTree(); if (innerWidth < 760) $('detail').scrollIntoView({ behavior: 'smooth', block: 'start' }); }));
  $('treeCount').textContent = `発見 ${ROSTER.filter(id => discovered.has(id)).length} / ${ROSTER.length}　・　優勝 ${Object.keys(MODES).filter(k => PRG.cleared[k]).length} / 3`;
  const s = BY[selected] && BY[selected].mode ? BY[selected] : G.sp, k = known(s.id), par = s.parent !== undefined ? BY[s.parent] : null, m = MODES[s.mode];
  const can = k && s.id !== G.sp.id && unlocked(s.mode);
  $('detail').className = 'detail' + (k ? '' : ' unk');
  $('detail').innerHTML = `<img src="${thumbs[s.id] || ''}" data-tid="${s.id}" alt="${k ? s.name : '未発見'}"><div class="form">${m.en} · ${STAGE_NAME[s.stage]}</div><h3>${k ? s.name : '？？？'}</h3><p>${k ? s.desc : ''}</p>
    <div class="tpot"><small>${k ? 'ステータス' : 'POTENTIAL ― 進化するとこのくらい'}</small><div id="tpotBars"></div></div><dl><dt>進化元</dt><dd>${par ? (known(par.id) ? par.name : '？？？') : '—'}</dd><dt>進化条件</dt><dd>${s.cond}</dd></dl>${can ? `<button class="go" id="partner">この姿にする ▶</button>` : ''}`;
  { const b = baseStats(s); statBars($('tpotBars'), { base: b, tot: b }, null); }
  treeDirty = false;
}

function switchPartner(s) {
  if (G.state === 'evolve') { const b = $('partner'); if (b) { b.textContent = '進化の演出中…終わったらもう一度'; b.classList.add('wait'); } return; }
  if (document.body.classList.contains('battle') || G.state === 'over' || G.state === 'cont' || !$('overModal').hidden) { try { toHub(); } catch (e) { console.error(e); } }
  if (s.mode !== G.mode) loadMode(s.mode);
  G.sp = s; G.bar = 0; G.barShown = 0; G.stats = []; G.r6 = []; G.m6 = [];
  save(); updateHud(); treeDirty = true;
  showTab(false); setMonster(s, true); camDefaults(); camReset();
  try { react('boing'); confetti(80, { y: 1.5, burst: 5 }); ring('rainbow'); SFX.milestone(); } catch (e) {}
  startDance(true); banner(`<b><span class="nw">${s.name}</span></b>`, 1800);
}

$('detail').addEventListener('click', e => { const b = e.target.closest('#partner'); if (b) { e.preventDefault(); switchPartner(BY[selected]); } });
