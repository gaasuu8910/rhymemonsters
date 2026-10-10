/* =========================================================
   OPENING — title sequence: lineup of final forms, marquee bands, slammed logo,
   tap → 2-bar DnB build → drop (logo lands on the beat) → name entry → wipe to HUB
   ========================================================= */
const OP = { on: true, phase: 'idle', rigs: [], bgT: 0, t: 0 };
const LINEUP = []; // one hero on stage: your own partner
function opLayout(ps) { platform.scale.set(ps, 1, ps); neon.userData.ps = ps; neon.scale.setScalar(ps); eqBars.forEach((b, i) => { const a = i / EQN * Math.PI * 2; b.position.set(Math.cos(a) * 2.9 * ps, -.1, Math.sin(a) * 2.9 * ps); }); }
function opSetup() {
  document.body.classList.add('opening-on');
  let i = 0;
  $('opTitle').querySelectorAll('.w1, .w2').forEach(w => { w.innerHTML = [...w.textContent].map(c => `<span class="ch" style="--i:${i++}">${c}</span>`).join(''); });
  setTimeout(() => { if (OP.phase === 'idle') $('opTitle').querySelectorAll('.ch').forEach(c => c.classList.add('wob')); }, 1500);
  opFrame();
  LINEUP.forEach(([id, x, z, ry]) => { const r = buildMonster(BY[id]); r.root.position.set(x, 0, z); r.root.rotation.y = ry; r.baseRY = ry; r.base = new THREE.Vector3(x, 0, z); r.ph = Math.random() * 6; scene.add(r.root); OP.rigs.push(r); });
  if (SAVE) { $('nameLabel').textContent = 'MC NAME — このままでいい？'; $('nameIn').value = G.name; $('go').textContent = 'つづきから ▶'; $('opNameH').innerHTML = `おかえり、<br>${petName()}`; }
  $('opStart').addEventListener('click', e => { e.stopPropagation(); quickEndless(); });
  $('opHub').addEventListener('click', e => { e.stopPropagation(); opGo(); });
  ['click'].forEach(k => $('startModal').addEventListener(k, e => { if (!e.target.closest('.op-name') && !e.target.closest('.op-acts')) quickEndless(); }));
  document.addEventListener('keydown', e => { if (OP.phase === 'idle' && e.target.tagName !== 'INPUT') { e.preventDefault(); quickEndless(); } });
}
// frame the hero: right of the title on wide screens, above it on phones
function opFrame(snap = true) { const wide = camera.aspect > 1.1, named = $('startModal').classList.contains('named'); Cam.tTgt.set(wide ? (named ? 1.6 : -2.1) : 0, wide ? 1.3 : .35, 0); Cam.tDist = wide ? 10.5 : 13; Cam.tEl = .12; Cam.tAz = 0; Cam.auto = 0; if (snap) Cam.snap = true; Cam.lastUser = 1e9; }
function opGo() {
  if (OP.phase !== 'idle') return;
  OP.phase = 'drop'; G.started = true;
  try { audioInit(); G.dancing = true; seqMode('dance', { bpm: homeFor(G.sp).bpm }); SFX.scratch(); } catch (e) { console.error(e); }
  const o = $('startModal'); o.classList.add('started', 'dropped');
  try { flash(.55, .4); confetti(160, { y: 2.5, burst: 7 }); ring('rainbow', { big: 7 }); react('joy'); } catch (e) {}
  setTimeout(opShowName, 450);
}
// one tap from the title straight into the first endless prompt; name & partner can wait
function quickEndless() {
  if (OP.phase !== 'idle') return; OP.phase = 'drop'; G.started = true;
  try { audioInit(); SFX.scratch(); } catch (e) {}
  if (!SAVE) { G.name = G.name || cleanMC('ルーキー'); PRG.quick = true; }
  closeOpening(); G.state = 'idle';
  setTimeout(() => { try { save(); updateHud(); startBattle(true); } catch (e) { console.error(e); } }, 620);
}
function opGoFx() {
  audioInit();
  const o = $('startModal'); o.classList.add('started', 'charge');
  $('opTitle').querySelectorAll('.ch').forEach(c => c.classList.remove('wob'));
  G.state = 'evolve'; G.evoTo = null; G.evoPhase = 'build'; G.evoSpin = 0;
  seqMode('build', { bpm: 174, after: 'hub', onDone: opDropDone }); G.evoT0 = Seq.mstart;
  Cam.tTgt.set(0, 1.3, .9); Cam.tDist = 8.5; Cam.tEl = .2; Cam.auto = .55;
  try { SFX.scratch(); } catch (e) {}
}
function opDrop() {
  if (OP.phase !== 'build') return;
  OP.phase = 'drop'; G.evoPhase = 'drop';
  const o = $('startModal'); o.classList.remove('charge'); o.classList.add('dropped', 'hot');
  setTimeout(opShowName, 60 / 174 * 4 * 1000);
  try { opDropFx(); } catch (e) { console.error(e); }
}
function opShowName() { $('startModal').classList.add('named'); $('opName').hidden = false; setTimeout(() => { try { $('nameIn').focus({ preventScroll: true }); } catch (e) {} }, 80); }
function opDropFx() {
  flash(1, .6); shakeStage();
  confetti(360, { y: 2.5, burst: 10 }); setTimeout(() => confetti(220, { rain: true }), 500);
  FX.glint.emit({ x: 0, y: 1.6, z: 0, n: 320, rainbow: true, speed: [4, 10], size: [.4, 1], life: [1, 2] });
  ring('rainbow', { big: 12 }); ring('#FFFFFF', { y: .5, big: 10 });
  Cam.tTgt.set(0, 1.3, -1.0); Cam.tDist = 11; Cam.tEl = .14; Cam.auto = 1.0; Cam.snap = true;
  OP.rigs.forEach(r => r.hop = 1);
}
function opDropDone() {
  setTimeout(() => { G.state = 'title'; G.evoPhase = ''; $('startModal').classList.remove('hot'); Cam.auto = .18; Cam.tDist = 15; }, 100);
}
function opBeat(e) {
  if (e.k === 'kick') { const o = $('startModal'); o.classList.add('beat'); setTimeout(() => o.classList.remove('beat'), 90); OP.rigs.forEach(r => r.kick = 1); }
}
function closeOpening() {
  const o = $('startModal'); o.classList.add('closing');
  flash(.7, .35);
  setTimeout(() => {
    o.hidden = true; OP.on = false; OP.phase = 'done'; document.body.classList.remove('opening-on');
    try { OP.rigs.forEach(r => scene.remove(r.root)); OP.rigs = []; setMonster(G.sp, true); camDefaults(); Cam.auto = 0; Cam.lastUser = -99; camReset(); Cam.snap = true; } catch (e) { console.error(e); }
  }, 520);
}
function opLoop(dt) {
  if (!OP.on) return;
  OP.t += dt;
  if (OP.phase !== 'done') opFrame(false); // keep the hero clear of the type, on any screen size
  OP.rigs.forEach((r, i) => {
    const T2 = OP.t + r.ph, spb = 60 / (Seq.bpm || 120);
    r.kick = Math.max(0, (r.kick || 0) - dt / spb);
    const hop = OP.phase === 'drop' ? Math.pow(r.kick, 2) * .5 : 0;
    r.body.position.y = Math.sin(T2 * 2) * .05 + hop; const sq = 1 + Math.sin(T2 * 2) * .02 - (r.kick > .85 && OP.phase === 'drop' ? .08 : 0);
    r.body.scale.set(1 / Math.sqrt(sq), sq, 1 / Math.sqrt(sq));
    r.wings.forEach(([p, d]) => p.rotation.z = d * (Math.sin(T2 * (OP.phase === 'drop' ? 11 : 4)) * .22 + (p.userData.base ?? .1)));
    if (r.tail) r.tail.rotation.y = Math.sin(T2 * 2.2) * .3;
    if (r.head) r.head.rotation.z = Math.sin(T2 * 1.5) * .06;
    r.spin.forEach(s => s.rotation.z += dt * 2); r.floaters.forEach(f => f.rotation.y += dt * 1.2);
    const blink = (T2 % 3.3) < .12 ? .1 : 1; r.eyes.forEach(e => e.scale.y = blink);
    if (r.crack) r.crack.emissiveIntensity = (OP.phase === 'idle' ? .4 + Math.sin(OP.t * 3) * .3 : 1.6) * (1 + skyU.uKick.value);
  });
}
