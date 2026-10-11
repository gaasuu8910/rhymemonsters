/* ---------- RHYME KARAOKE: the monster raps over the beat, you fill the blank, it raps your word ---------- */
const VB = 8; // bars per verse: 0-1 setup line · 2-3 hook (setup line again, hotter) · 4-5 punch line with the blank · 6-7 hype (tap notes)
const L1 = ['きょうの おだいは', 'つぎの おだいは', 'さあ ふんでみろ おだいは'];
// the rival's second pass is a jab that lands on the prompt word: [sung kana, caption]
const DISS = [['おまえの らいむは まるで', 'お前のライムはまるで'], ['そのふろう しょせんは', 'そのフロウ、しょせんは'], ['かるいな おまえは ただの', '軽いなお前はただの'], ['ここじゃ おまえは ただの', 'ここじゃお前はただの'],
  ['ききあきた そのねた まるで', '聞き飽きたそのネタ、まるで'], ['かえれよ るーきー おまえは', '帰れよルーキー、お前は'], ['そのていど しょせん', 'その程度？ しょせん'], ['ねむいぜ おまえの らっぷは', '眠いぜお前のラップは'], ['まいくを おけよ おまえは', 'マイクを置けよ、お前は']];
const L2 = ['かえす ことばは', 'おれの こたえは', 'こたえは ずばり', 'それなら こっちは', 'ここで ふむのは', 'ならば かえすぜ こたえは'];
const PAT = [[0, 4, 8, 12, 16, 20, 24, 28], [0, 4, 6, 8, 12, 16, 20, 22, 24, 28], [0, 4, 6, 8, 12, 16, 18, 20, 22, 24, 28, 30], [0, 3, 6, 8, 12, 14, 16, 19, 22, 24, 27, 30], [0, 2, 4, 6, 8, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30]];
const V = { n: 0, s0: 0, t0: 0, sx: .13, voc: new Map(), word: '', l1: '', l2: '', slotS: 0, slotN: 0, dead: 0, sent: false, raw: '', reading: '', ai: null, aiDone: false, slotDone: false, revealAt: 0, revealed: false, notes: [], tap: 0, tapMax: 0, phase: '', contS: 0, choice: 'yes', cntS: 0 };
const voicePitch = () => [74, 71, 67, 64, 60][G.sp.vst ?? G.sp.stage];
function vocAt(step, n) { const k = Math.floor(step), off = step - k; if (!V.voc.has(k)) V.voc.set(k, []); V.voc.get(k).push({ ...n, off }); }
function layLine(text, s0, endStep, rhymeWord, slotLen) {
  // returns spans [{m, step, v, rw}] laid on 16th notes; rhyme word right-aligned to endStep
  const lead = [], rw = rhymeWord ? moras(rhymeWord) : [];
  text.split(' ').forEach((w, i) => { if (i) lead.push(null); const ms = moras(w), vs = vowelsOf(ms); ms.forEach((m, j) => lead.push({ m, v: vs[j] })); });
  const rwLen = rhymeWord ? rw.length : slotLen;
  const rwStart = endStep - (rwLen - 1) * Math.min(2, 20 / Math.max(rwLen, 1));
  const rwStep = rwLen > 1 ? (endStep - rwStart) / (rwLen - 1) : 1;
  const room = rwStart - 2 - s0, sp = Math.min(2, room / Math.max(1, lead.length));
  const out = [];
  lead.forEach((x, i) => { if (x) out.push({ m: x.m, step: s0 + i * sp, v: x.v }); else out.push({ gap: true }); });
  if (rhymeWord) { const vs = vowelsOf(rw); rw.forEach((m, i) => out.push({ m, step: rwStart + i * rwStep, v: vs[i], rw: true })); }
  return { spans: out, rwStart, rwStep };
}
const ENDLESS_BPM = 120, ENDLESS_MAX = 210, S0k = () => ST().k;
// a grown partner starts faster but every point is worth more: that is the trade, not a free buff
const EVO_BPM = [120, 132, 144, 156], STAGE_MULT = [1, 1.3, 1.7, 2.2];
// the staircase: every 3 rhymes one step — longer words, then a faster beat, then longer words again…
// once the beat passes MAX_ZONE_BPM the short words are gone for good
// every 2 rhymes one step; the beat dwells around 150 where the game is at its best, then climbs to the top zone
const STEP_HITS = 2, MAX_ZONE_BPM = 180, BPM_STEPS = [120, 120, 135, 135, 150, 150, 150, 150, 165, 165, 180];
function stair(h) { const s = Math.floor((h || 0) / STEP_HITS), base = s < BPM_STEPS.length ? BPM_STEPS[s] : 180 + 5 * (s - BPM_STEPS.length + 1), bpm = Math.min(ENDLESS_MAX, base + (startBpm() - ENDLESS_BPM)), max = bpm >= MAX_ZONE_BPM; return { s, bpm, max, len: max ? ENDLESS_LEN.length - 1 : Math.min(ENDLESS_LEN.length - 2, s) }; }
const stageIx = () => G.daily ? 0 : Math.max(0, Math.min(3, (G.sp && G.sp.stage) || 0)), startBpm = () => EVO_BPM[stageIx()], stageMult = () => STAGE_MULT[stageIx()];
function guardFx() { try { ring('#56D9F5', { big: 8 }); ring('#FFFFFF', { y: .6, big: 6 }); flash(.5, .5); SFX.gong(); FX.glint.emit({ x: 0, y: 1.4 * rigScale, z: 0, n: 120, color: ['#56D9F5', '#FFFFFF'], speed: [3, 7], size: [.3, .7] }); document.body.classList.add('guardhit'); setTimeout(() => document.body.classList.remove('guardhit'), 900); } catch (e) {} }
const guardEvery = d => Math.max(3, 9 - Math.round(d / 15)); // consecutive hits that charge one guard
function startVerse(step, t) {
  V.n++; V.s0 = step; V.t0 = t;
  if (!Seq.track) songFor(G.sp); // the song only changes when you continue or evolve
  const ease = !!G.ease; G.ease = false; // right after a miss: a slightly slower bar and an easier prompt
  if (G.endless && !G.daily) G.eBpm = stair(G.hits).bpm;
  const boost = G.boost || 0, flow = 1 - ST().k / 100 * .14, bpm = G.endless ? Math.round(G.eBpm || ENDLESS_BPM) : Math.round((Math.min(196, Seq.track.bpm * 1.15 + 10) + boost) * flow); // every hit pushes the tempo up a notch; endless: same slow start for everyone, climbing every verse
  if (G.endless) { const prev = G.prevBpm || ENDLESS_BPM, dl = Math.max(0, (t - AT()) * 1000); if (bpm < prev) { setTimeout(() => banner(`<b>TEMPO DOWN ▼${bpm}</b>`, 1100), dl); G.upFrom = bpm; } else if (bpm >= (G.upFrom || ENDLESS_BPM) + 10) { G.upFrom = bpm; setTimeout(() => { banner(`<b>テンポアップ！</b><small>BPM ${bpm}</small>`, 1500); skyU.uKick.value = 1.4; Cam.punch = Math.max(Cam.punch, .05); }, dl); } G.prevBpm = bpm; }
  else if (!ease && boost > (G.boostShown || 0)) setTimeout(() => { banner(`<b>テンポアップ！</b><small>BPM ${bpm}</small>`, 1500); skyU.uKick.value = 1.4; Cam.punch = Math.max(Cam.punch, .05); }, Math.max(0, (t - AT()) * 1000));
  G.boostShown = boost;
  if (false) setTimeout(() => banner(`<b>TEMPO DOWN ▼${bpm}</b>`, 1200), Math.max(0, (t - AT()) * 1000));
  Seq.battleBpm = bpm;
  Seq.bpm = Seq.target = bpm; V.sx = 60 / bpm / 4;
  setMusicLevel(); if (G.endless) { $('endBpm').textContent = bpm; const h = Math.max(0, G.hp || 0); $('endLives').textContent = '♥'.repeat(h) + '♡'.repeat(Math.max(0, G.hpMax - h)) + (G.guards ? ' 🛡' : ''); }
  if (G.endless && G.hits >= 6 && Math.floor(G.hits / 6) > (G.lastRot || 0)) { G.lastRot = Math.floor(G.hits / 6); mission('stage2', 0, G.lastRot); { const stn = G.lastRot, wasBoss = G.boss, bonus = 20 * stn * (wasBoss ? 3 : 1); G.boss = stn % 3 === 2; addCoins(bonus, true); addExp(30 * stn * (wasBoss ? 3 : 1)); setTimeout(() => { if (wasBoss) { PRG.bossKills = (PRG.bossKills || 0) + 1; if (!PRG.owned.includes('acc:neck:bossChain')) { PRG.owned.push('acc:neck:bossChain'); WEAR[G.sp.id] = { ...(WEAR[G.sp.id] || {}), ...wearPatch('acc', 'neck:bossChain') }; setMonster(G.sp, false); setTimeout(() => banner('<small>BOSS REWARD</small><b>BOSSチェーン 獲得！</b>', 2200), 1600); } save(); }
      slam(wasBoss ? 'BOSS DOWN!!!' : `STAGE ${stn} CLEAR!!`, `◎+${bonus} ・ EXP+${30 * stn * (wasBoss ? 3 : 1)}`, 'g5 evo'); SFX.crowd(1.6); confetti(180, { y: 2.5, burst: 8 }); ring('rainbow', { big: 6 }); }, Math.max(0, (t - AT()) * 1000) - 400); } removeOpp(); G.endOpp = pickRival(); spawnOpp(); camReset(); Seq.track = songFor(G.sp); const nt = Seq.track;
    if (G.boss) { G.endOpp = { ...G.endOpp, n: 'BOSS ' + G.endOpp.n }; if (oppRig) oppRig.root.scale.setScalar(1.15); }
    setTimeout(() => { banner(`<small>${G.boss ? '⚠ BOSS BATTLE ⚠' : 'NEXT CHALLENGER'}</small><b>${G.endOpp.n}</b><small>♪ ${nt.id} · ${nt.g}</small>`, 2200); SFX.scratch(); flash(.4); }, Math.max(0, (t - AT()) * 1000)); }
  V.voc.clear(); V.next = null; V.word = pickWord(ease);
  { const q = QBY[V.word], dd = typeof DISSD !== 'undefined' && DISSD[V.word]; V.l1 = dd ? dd[0] : (q && q.l) || pick(L1); V.l2 = dd ? dd[2] : (q && q.l2) || pick(L2); V.lt = dd ? dd[1] : q && q.lt; V.l2t = dd ? dd[3] : q && q.l2t; V.hasDiss = !!dd || !!(q && q.l && !(typeof COUP !== 'undefined' && COUP[V.word])); } // a couplet written for this very prompt and its model answer
  V.sent = false; V.raw = ''; V.reading = ''; V.ai = null; V.aiDone = false; V.slotDone = false; V.revealed = false; V.revealAt = 0; V.tap = 0; V.tapMax = 0; V.phase = 'input';
  const pv = voicePitch(), wn = moras(V.word).length, opp = OPPN(), op = opp.p;
  const a = layLine(V.l1, step, step + 28, V.word);
  // line 1 is the opponent's verse (its own voice); line 2 is yours, with the blank
  V.diss = V.hasDiss ? null : pick(DISS); const a2 = V.diss ? layLine(V.diss[0], step + 32, step + 60, V.word) : null;
  [[a, 0], [a2 || a, a2 ? 0 : 32]].forEach(([ln, off], pass) => ln.spans.forEach(sp => { if (sp.gap) return; const beat = Math.round(sp.step - step) % 4 === 0; vocAt(sp.step + off, { m: sp.m, v: sp.v, opp: true, pitch: !pass ? (sp.rw ? op + 5 - Math.round((sp.step - ln.rwStart) / Math.max(1, (step + 28 - ln.rwStart)) * 5) : op + (beat ? 2 : 0)) : (sp.rw ? op + 7 : op + 2 + (beat ? 3 : 0)), acc: sp.rw || beat, dur: V.sx * (sp.rw ? 1.6 : 1.1) }); }));
  const b = layLine(V.l2, step + 64, step + 92, null, wn);
  b.spans.forEach(sp => { if (sp.gap) return; const beat = Math.round(sp.step - step) % 4 === 0; vocAt(sp.step, { m: sp.m, v: sp.v, pitch: pv + (beat ? 2 : 0) - 1, acc: beat, dur: V.sx * 1.1 }); });
  V.slotS = b.rwStart; V.slotN = wn; V.slotStep = b.rwStep; V.dead = step + 92; // typing stays open right up to the end of the punch line
  // hype ad-libs and tap notes
  vocAt(step + 96, { m: 'い', v: 'i', pitch: pv + 7, acc: true, dur: V.sx * 1.5 }); vocAt(step + 97.5, { m: 'え', v: 'e', pitch: pv + 4, acc: true, dur: V.sx * 2 });
  vocAt(step + 112, { m: 'へ', v: 'e', pitch: pv + 7, acc: true, dur: V.sx * 1.2 }); vocAt(step + 113, { m: 'い', v: 'i', pitch: pv + 5, acc: true, dur: V.sx * 2 });
  V.notes = []; // rhythm lane removed
  V.tapMax = V.notes.length;
  // karaoke DOM
  const span = (sp, cls = '') => sp.gap ? '<i class="gap"></i>' : `<span class="m ${sp.rw ? 'rw' : ''} ${cls}" data-t="${(t + (sp.step - step) * V.sx).toFixed(3)}">${sp.m}<em>${sp.v}</em></span>`;
  $('kl1').innerHTML = a.spans.map(sp => span(sp)).join('');
  const qh = QBY[V.word], hv = qh && qh.a && !MODE().noHint && !(G.endless && (G.hintLv || 0) >= 3) ? vowelsOf(moras(qh.a)) : vowelsOf(moras(V.word));
  const hint = hv.map(v => `<span class="m ghost"><em>${v}</em>${v}</span>`).join('');
  $('kl2').innerHTML = b.spans.map(sp => span(sp)).join('') + `<span class="slot" id="slot">${hint}</span>`;
  V.q = QBY[V.word] || null; $('jc').hidden = true; const noHint = !!MODE().noHint;
  const hLv = G.endless ? Math.min(G.combo >= 12 ? 3 : G.combo >= 8 ? 2 : G.combo >= 4 ? 1 : 0, (G.hits || 0) >= 16 ? 3 : (G.hits || 0) >= 11 ? 2 : (G.hits || 0) >= 6 ? 1 : 0) : 0, hOff = noHint || hLv >= 3;
  if (G.endless && hLv !== (G.hintLv || 0)) { const msg = [['ヒント復活', 'ヒントがすぐ出るようになりました'], ['難易度アップ！', 'ヒントが出るのが遅くなります'], ['難易度アップ！', 'ヒントがさらに遅くなります'], ['難易度アップ！', 'ここからヒントなし！']][hLv]; setTimeout(() => banner(`<b>${msg[0]}</b><small>${msg[1]}</small>`, 1900), Math.max(0, (t - AT()) * 1000) + 300); } G.hintLv = hLv;
  if (G.endless && !G.daily) { const st = stair(G.hits), wl = st.len, dl = Math.max(0, (t - AT()) * 1000); if (st.max && !G.maxZone) { G.maxZone = true; setTimeout(() => { banner(`<b>最速ゾーン！</b><small>${st.bpm} BPM ・ ここからは長い単語だけ</small>`, 2200); flash(.5); SFX.crowd(1.4); ring('rainbow', { big: 7 }); }, dl + 1500); } else if (wl > (G.wordLv || 0)) setTimeout(() => { banner(`<b>難易度アップ！</b><small>お題の単語が長くなります（${ENDLESS_LEN[wl][0]}文字〜）</small>`, 1900); flash(.3); }, dl + 1500); G.wordLv = wl; }
  V.hintSeen = false; $('khint').innerHTML = V.q && !hOff ? `<b>HINT</b><span>${V.q.h}</span><i>${moras(V.q.a).length}文字</i>` : ''; $('khint').hidden = !V.q || hOff; if (V.q && !hOff && hLv) { $('khint').hidden = true; const vn = V.n; setTimeout(() => { if (V.n === vn && V.phase === 'input' && !V.sent) $('khint').hidden = false; }, Math.max(0, (t - AT()) * 1000) + [0, .4, .7][hLv] * (V.dead - step) * V.sx * 1000); } $('khint').classList.remove('ans');
  { const q = V.q, esc = s => String(s || '').replace(/[<>&]/g, ''); // who raps which line + written-Japanese captions over the karaoke kana
    $('kl1').insertAdjacentHTML('afterbegin', `<span class="kt"><b class="who opp">${esc(opp.n)}</b>${V.lt ? `${esc(V.lt)}${esc(q ? q.d : V.word)}` : ''}</span>`);
    $('kl2').insertAdjacentHTML('afterbegin', `<span class="kt"><b class="who you">${esc(petName())}</b>${V.l2t ? `${esc(V.l2t)}＿＿` : ''}</span>`);
    $('oppCard').classList.add('rap');
    if (V.diss) { const vn = V.n, dd = `${V.diss[1]}${q ? q.d : V.word}`; setTimeout(() => { if (V.n !== vn) return; const k = $('kl1').querySelector('.kt'); if (k) k.insertAdjacentHTML('beforeend', `<span class="kdiss">「${esc(dd)}」</span>`); }, Math.max(0, (t - AT()) * 1000 + 32 * V.sx * 1000)); } }
  $('kara').hidden = false; $('kara').className = 'kara'; $('knext').hidden = true;
  $('notes').innerHTML = V.notes.map((n, i) => `<i data-i="${i}"></i>`).join(''); V.notes.forEach((n, i) => n.el = $('notes').children[i]);
  // open input
  answerEl.value = ''; answerEl.disabled = false; sendEl.disabled = false; $('jpanel').innerHTML = ''; $('result').innerHTML = '';
  hintEl.textContent = `「${V.q ? V.q.d : V.word}」と韻を踏め。${noHint ? 'ノーヒント' : 'ヒント：' + (V.q ? V.q.h : '—')}（母音 ${vowelsOf(moras(V.word)).join('・')}）`;
  const delay = Math.max(0, (t - AT()) * 1000);
  setTimeout(() => { if (G.state !== 'kara') return; answerEl.focus({ preventScroll: true }); $('order').classList.add('on'); setTimeout(() => $('order').classList.remove('on'), 1400); bgCut('word', { word: V.q ? V.q.d : V.word, sub: `VERSE ${String(V.n).padStart(2, '0')} · ${Math.round(Seq.bpm)} BPM`, dur: 60 / Seq.bpm * 2, u0: 0, u1: .6, hold: true }); react('nod'); }, delay);
  setTimeout(() => { $('oppCard').classList.remove('rap'); }, delay + 64 * V.sx * 1000);
}
// a late answer still gets sung: squeeze it in right after it lands
function slotLate() {
  if (V.slotDone || !V.reading || G.state !== 'kara') return; V.slotDone = true;
  const pv = voicePitch(), ms = moras(V.reading), vs = vowelsOf(ms), n = ms.length, start = Seq.step + 2;
  const sp = n > 1 ? clamp((V.s0 + 95 - start) / (n - 1), 1, 2) : 1;
  ms.forEach((m, i) => vocAt(start + i * sp, { m, v: vs[i], pitch: pv + 5 - Math.round(i / Math.max(1, n - 1) * 5), acc: true, slot: true, dur: V.sx * 1.4 }));
  const slot = $('slot'); if (slot) slot.innerHTML = ms.map((m, i) => `<span class="m sl" data-t="${(V.t0 + (start + i * sp - V.s0) * V.sx).toFixed(3)}">${m}<em>${vs[i]}</em></span>`).join('');
}
function slotSchedule() {
  if (V.slotDone || !V.sent || !V.reading) return; V.slotDone = true;
  const pv = voicePitch();
  const ms = moras(V.reading), vs = vowelsOf(ms), n = ms.length;
  const end = V.s0 + 92, st = n > 1 ? Math.min(2, Math.max(1, end - V.slotS) / (n - 1)) : 2;
  const start = n > 1 ? end - (n - 1) * Math.min(st, (end - (V.s0 + 76)) / (n - 1)) : end;
  const step = n > 1 ? (end - start) / (n - 1) : 1;
  ms.forEach((m, i) => vocAt(start + i * step, { m, v: vs[i], pitch: pv + 5 - Math.round(i / Math.max(1, n - 1) * 5), acc: true, slot: true, dur: V.sx * 1.5 }));
  const slot = $('slot'); if (slot) slot.innerHTML = ms.map((m, i) => `<span class="m sl" data-t="${(V.t0 + (start + i * step - V.s0) * V.sx).toFixed(3)}">${m}<em>${vs[i]}</em></span>`).join('');
}
function karaHook(step, t) {
  if (step % 16 === 0) {
    if (G.state === 'countin') { if (step >= V.cntS + 16) { G.state = 'kara'; startVerse(step, t); } }
    else if (G.state === 'cont') { if (step >= V.contS + 32) { const yes = V.choice !== 'no'; setTimeout(() => { $('cont').hidden = true; }, Math.max(0, (t - AT()) * 1000)); if (yes) { G.state = 'kara'; showVS(true); startVerse(step, t); } else { G.state = 'leaving'; setTimeout(() => toHub(), Math.max(0, (t - AT()) * 1000)); } } }
    else if (G.state === 'kara') { const vb = (step - V.s0) / 16;
      const at = Math.max(0, (t - AT()) * 1000);
      if (vb >= 0 && vb < VB) setTimeout(() => { if (G.state === 'kara') { shot(G.oppOn ? ['opp', 'oppFace', 'wide', 'opp', 'face', 'face', 'wide', 'wide'][vb] : ['wide', 'face', 'low', 'wide', 'wide', 'face', 'low', 'wide'][vb]); Cam.auto = 0; if (vb === 1 || vb === 5 || vb === 3) flash(.18, .12); } }, at);
      if (vb === 2) setTimeout(() => { if (G.state === 'kara') { const o = $('order'); o.textContent = 'YOUR TURN!'; o.classList.add('on'); setTimeout(() => { o.classList.remove('on'); o.textContent = '韻を踏め！'; }, 900); } }, at);
      if (vb === 6) { V.revealAt = t; V.phase = 'hype'; }
      if (vb === VB) endVerse(step, t); }
  } else if (G.state === 'kara') {
    if (step === V.dead) closeInput(t);
    if (step === Math.floor(V.slotS) - 1) slotSchedule();
  }
  const q = V.voc.get(step); if (q) { q.forEach(n => sing(toAC(t + n.off * V.sx), n)); V.voc.delete(step); }
}
function closeInput(t) {
  if (!V.sent) { answerEl.disabled = sendEl.disabled = true; V.phase = 'locked'; }
}
// offline 'meaning' judge: hand-made answers that rhyme AND make sense in the player's line
const fitOf = w => { const L = FITS[w]; if (!L) return null; if (!L._m) { L._m = new Map(L.map(([a, d]) => [a, d])); L._d = new Map(L.map(([a, d]) => [d, a])); } return L; };
const fitHas = (w, kana) => { const L = fitOf(w); return !!(L && L._m.has(kana)); };
// kanji typed without AI: accept it when it is a known display form for this prompt (model answer or a fitting answer)
function kanaFor(w, raw) { const q = QBY[w]; if (q && raw === q.k) return q.a; const L = fitOf(w); return L && L._d.has(raw) ? L._d.get(raw) : ''; }
function submitAnswer() {
  if (G.state === 'bonus') return bonusSubmit();
  if (G.state !== 'kara' || V.sent || V.phase !== 'input') return;
  const raw = answerEl.value.normalize('NFKC').replace(/[\s・、。,.!！?？「」『』〜~]/g, '');
  if (!raw) return;
  const kana = norm(raw);
  const bad = msg => { answerEl.classList.remove('bad'); void answerEl.offsetWidth; answerEl.classList.add('bad'); hintEl.textContent = msg; SFX.miss(); };
  const kk = aiMode !== 'on' && !KANA_RE.test(kana) ? kanaFor(V.word, raw) : '';
  if (aiMode !== 'on' && !KANA_RE.test(kana) && !kk) return bad('ひらがなで入力してね（変換せずにEnter）');
  if (!JA_RE.test(raw)) return bad('日本語の言葉で返して');
  V.sent = true; V.sendSec = Math.max(0, AT() - V.t0); V.raw = raw; V.reading = KANA_RE.test(kana) ? kana : (typeof kk !== 'undefined' && kk) || ''; V.phase = 'sent';
  answerEl.disabled = sendEl.disabled = true; SFX.scratch(); SFX.ui();
  $('slot').classList.add('filled'); $('slot').innerHTML = `<span class="raw">${raw.replace(/[<>&]/g, '')}</span>`;
  hintEl.textContent = 'LOCK IN! 空欄でモンスターが歌うよ'; react('wow');
  FX.glint.emit({ x: 0, y: 1.4 * rigScale, z: 0, n: 30, color: ['#FF4D1A', '#F3EFE6', '#2438FF'], speed: [2, 4], size: [.2, .45] });
  if (Seq.step >= Math.floor(V.slotS) - 1) slotLate();
  if (aiMode === 'on') {
    $('jpanel').innerHTML = '<span class="s"><b>JUDGING…</b></span>';
    const ctl = new AbortController(); G.judgeCtl = ctl; const vn = V.n;
    sampleFn.json(judgePrompt(V.word, raw), { modelTier: 'quick', signal: ctl.signal })
      .then(res => { if (V.n !== vn) return; V.ai = cleanAI(res, raw); if (V.ai.reading) V.reading = V.ai.reading; V.aiDone = true; if (!V.slotDone && Seq.step >= Math.floor(V.slotS) - 1) slotLate(); })
      .catch(e => { if (V.n !== vn) return; if (['not_granted', 'sampling_disabled', 'not_declared', 'capability_disabled', 'capability_removed'].includes(e?.code)) setAi('off'); V.ai = null; V.aiDone = true; V.aiFail = true; });
  } else V.aiDone = true;
}
function reveal() {
  V.revealed = true;
  const raw = V.raw, q = V.q, nr = norm(raw || '');
  const model = !!(q && V.sent && (V.reading === q.a || nr === q.a || nr === norm(q.k)));
  const ans = model ? q.a : V.reading;
  const r = combine(rhymeCore(V.word, ans), V.ai);
  if (model) { r.grade = Math.max(r.grade, r.R >= 5 || (V.ai && (V.ai.play + V.ai.punch) >= 2) ? 5 : 4); r.note = '模範解答！ヒントを読み切った'; r.model = true; }
  if (!model && V.sent && ans && !V.ai) {
    // no AI: the word must exist (built-in dictionary of ~77k everyday readings or the hand-made answer list)
    if (!fitHas(V.word, ans) && !LEXR.has(ans)) { r.grade = 0; r.R = 0; r.near = false; r.nodict = true; r.note = '辞書にない言葉'; }
    // …and an answer that also makes sense in the line gets the meaning bonus the AI would give
    else if (r.R >= 3 && fitHas(V.word, ans)) { r.fit = true; r.grade = Math.max(r.grade, Math.min(5, r.R + 1)); r.note = '韻も意味もハマった！'; }
  } else if (!model && V.ai && r.R >= 3 && fitHas(V.word, ans)) { r.fit = true; r.grade = Math.max(r.grade, Math.min(5, r.R + 1)); }
  let g = V.sent && (ans || model) ? r.grade : 0;
  r.reason = !V.sent ? '間に合わなかった' : !ans ? '読みが分からず判定できなかった（ひらがなで返すと確実）' : V.aiFail ? 'AI審査に失敗 → 韻の硬さだけで判定' : r.note;
  if (MODE().strict && g > 0 && !model && r.R < 3) { g = 0; r.reason = `韻が浅い：${r.note}`; r.strictMiss = true; }
  r.grade = g; r.ai = V.ai; r.raw = raw || ans;
  if (G.daily) (G.dres = G.dres || []).push(g);
  if (q && g > 0) { PRG.dex = PRG.dex || {}; const was = PRG.dex[V.word] || 0, now = was | (model ? 1 : 0) | (g >= 4 && !model ? 2 : 0) | (g >= 5 ? 4 : 0); if (now !== was) { PRG.dex[V.word] = now; G.dexNew = (G.dexNew || 0) + 1; } }
  if (g >= 3 && (!G.best || g >= G.best.g)) G.best = { g, w: q ? q.d : V.word, a: model ? q.k : (raw || ans) };
  { G.usedA = G.usedA || []; if (q && q.a) G.usedA.push(q.a); if (ans) { G.usedA.push(ans); G.recent.push(ans); } if (G.usedA.length > 60) G.usedA.splice(0, G.usedA.length - 60); }
  const win = Math.max(1, (V.dead - V.s0) * V.sx);
  G.stats.push({ g, t: V.sent ? V.sendSec : 10, frac: V.sent ? V.sendSec / win : 1, sent: V.sent, model, script: /[一-龯々ァ-ヶ]/.test(raw || '') });
  G.r6.push(g); if (G.r6.length > 6) G.r6.shift();
  G.m6 = G.m6 || []; G.m6.push(model); if (G.m6.length > 6) G.m6.shift();
  if (model && r.ai) r.ai = { ...r.ai, tags: ['模範解答', ...r.ai.tags].slice(0, 3) };
  showResult(r, ans || raw);
  // show exactly which vowels rhymed: matched moras glow, the rest of the word fades
  { const mark = els => els.forEach((e, i) => { e.classList.remove('vh', 'vm'); e.classList.add(els.length - 1 - i < r.k ? 'vh' : 'vm'); });
    mark([...$('kl1').querySelectorAll('.m.rw')]); const sl = [...$('slot').querySelectorAll('.m.sl')]; if (sl.length) mark(sl);
    else if (ans) { $('slot').innerHTML = moras(ans).map(m => `<span class="m sl">${m}<em>${vowelsOf([m])[0]}</em></span>`).join(''); mark([...$('slot').querySelectorAll('.m.sl')]); } }
  if (q) { const fl = fitOf(V.word), alt = fl && fl.length ? fl.filter(([a]) => a !== ans).sort(() => Math.random() - .5).slice(0, 2).map(([a, d]) => d) : typeof rhymeIdeas === 'function' ? rhymeIdeas(V.word, q.a).filter(w => w !== ans).slice(0, 2) : []; $('khint').innerHTML = `<b>${model ? 'BINGO' : 'ANSWER'}</b><span>${q.k}${q.k === q.a ? '' : `（${q.a}）`}</span><i>${q.h}</i>`; if (alt.length) $('kl2').insertAdjacentHTML('beforeend', `<span class="kalt">ほかにも踏める：${alt.join('・')}</span>`); $('khint').classList.add('ans'); }
  if (q) $('khint').hidden = false;
  if (g > 0) addCoins([0, 2, 4, 6, 10, 15][g]);
  if (g > 0 && r.raw) { G.lastAns = r.raw; PRG.words = [...(PRG.words || []).filter(x => x !== r.raw), r.raw].slice(-16); }
  if (!V.sent) { bubble('間に合わなかった…', petName()); clearTimeout(reveal.bt); reveal.bt = setTimeout(hideBubble, 2600); }
  if (q) hintEl.textContent = (model ? '模範解答ど真ん中！ ' : (r.reason || '') + '　') + `模範解答：${q.k}${q.k === q.a ? "" : `（${q.a}）`}`;
  const ai = V.ai;
  if (G.endless) { const P0 = (typeof PUNCH !== 'undefined' && PUNCH[G.sp.id]) || null; const L = g <= 0 ? (ans ? [`「${ans}」もいい線！`, 'ドンマイ！つぎいこ！', 'いまのは惜しい！', 'だいじょうぶ、まだいける！'] : ['間に合わなかったね、つぎ！', 'ドンマイ！つぎいこ！']) : g >= 5 && P0 && Math.random() < .6 ? P0 : g >= 5 ? ['きまった！', 'ヤバすぎ！', '神ってる！', 'それそれ！'] : g >= 3 ? ['ナイス！', 'いいね！', 'のってきた！'] : g > 0 ? ['セーフ…', 'まだいける！'] : ['くっ…', 'つぎ！つぎ！', 'ドンマイ！']; bubble(pick(L), petName()); clearTimeout(reveal.bt); reveal.bt = setTimeout(hideBubble, 1400); }
  if (g > 0) {
    G.combo++; G.maxCombo = Math.max(G.maxCombo, G.combo); G.boost = Math.min(18, (G.boost || 0) + 3); G.hits = (G.hits || 0) + 1; G.maxBpm = Math.max(G.maxBpm || 0, Math.round(Seq.bpm));
    const orig = !!(q && !model && g >= 4); // your own rhyme, not the textbook one — worth more
    const spd = G.endless && V.sent ? 1 + .6 * clamp((7 - V.sendSec) / 5) : 1; // answer early, score more
    if (G.endless) { if (spd >= 1.3) mission('speed5', 1); mission('combo10', 0, G.combo + 1); mission('hits15', 0, (G.hits || 0)); mission('bpm150', 0, Math.round(Seq.bpm)); }
    G.origRun = orig ? (G.origRun || 0) + 1 : 0;
    if (G.endless && !G.guards && ++G.guardC >= G.guardN) { G.guards = 1; G.guardC = 0; setTimeout(() => banner('<b>🛡 GUARD READY</b>', 1200), 900); }
    if (g >= 3) { SFX.crowd(g === 5 ? 1.5 : g === 4 ? 1 : .45); crowdPop(g); }
    oppReact('hurt');
    const S = ST(), armed = G.skillArmed; G.skillArmed = false;
    if (G.endless) { const mult = stageMult() * (1 + S.a / 200) * (armed ? 2 : 1) * (orig ? 1.5 * (1 + Math.min(4, Math.max(0, (G.origRun || 0) - 1)) * .15) : 1) * spd, ep = Math.round(g * g * 10 * mult * (1 + Math.min(G.combo, 30) * (.08 + S.c / 1000))); G.endScore = (G.endScore || 0) + ep; $('endScore').textContent = G.endScore.toLocaleString(); tapPop(innerWidth / 2, innerHeight * .4, `+${ep}`, 34, '#D4FF3A'); }
    const gain = (G.endless ? 0 : 1) * BASE[g] * RU().gain * (1 + Math.min(G.combo, 10) * .03) * (.75 + S.a / 100 * .6) * (armed ? 2 : 1) * (orig ? 1.25 : 1);
    if (!G.endless) G.skill = Math.min(100, (G.skill || 0) + g * (5 + S.c * .14)); updateSkill(); if (armed) { slam('CHARISMA HIT!!', '', 'g5 evo'); SFX.crowd(2); }
    feed(r.A, g, gain);
    const pts = Math.round(g * g * 10 * (RND() + 1) * (1 + G.combo * .1));
    G.score += pts; G.bScore += pts;
    slam(SLAM[g][0], G.endless ? `${orig ? 'ORIGINAL! ' : ''}${spd >= 1.15 ? 'SPEED ×' + spd.toFixed(1) + ' ' : ''}${G.combo >= 2 ? G.combo + ' COMBO' : ''}` : `${orig ? 'ORIGINAL! ' : ''}${Math.round(gain * 100)} DAMAGE`, SLAM[g][1], '');
    bgCut('word', { word: r.raw, v: g >= 4 ? 0 : 2, sub: `GRADE ${g} / ${['', 'GREEN', 'ORANGE', 'BLUE', 'GOLD', 'RAINBOW'][g]}`, dur: .9, u0: 0, u1: .6, hold: true });
    vignette(VIG[g], g >= 4 ? .9 : .6); SFX.grade(g);
    { const F = outfitOf(G.sp) || {}; if (F.hat === 'phones' || F.neck === 'phonesNeck') try { SFX.scratch(); } catch (e) {} if (F.mic && orig) { bubble('MIC DROP!! 🎤', petName()); } if (F.hat === 'crown' && g >= 4) ring('#FFC93D', { big: 7 }); if (F.fx === 'fire' && g >= 4) FX.star.emit({ x: 0, y: 1.2 * rigScale, z: 0, n: 60, color: ['#FF4D1A', '#FFC93D'], speed: [3, 6], up: .9, size: [.3, .6] }); if (F.glasses === 'shades' && g >= 5) slam('COOL…', '', 'g4'); if (/cap/.test(F.hat || '') && g >= 3) FX.star.emit({ x: 0, y: 2 * rigScale, z: 0, n: 30, color: ['#FFE066', '#FFFFFF'], speed: [2, 4], up: .6, size: [.2, .45] }); if (F.shoes === 'sneakers' && G.combo >= 3) try { S.kick(toAC(AT()), .6); } catch (e) {} if (F.shoeStyle === 'goldkicks' && g >= 5) confetti(80, { y: .5, burst: 7 }); if (F.neck === 'bossChain' && g >= 5) { flash(.5, .3); ring('#FF2E4D', { big: 8 }); } }
    FX.star.emit({ x: 0, y: 1.3 * rigScale, z: 0, n: [0, 30, 50, 80, 120, 160][g], speed: [2, 5], up: .5, rainbow: g === 5, color: GHEX[g], whiten: .3, size: [.25, .55] });
    ring(g === 5 ? 'rainbow' : GHEX[g]); if (g >= 4) { setTimeout(() => ring(g === 5 ? 'rainbow' : GHEX[g], { y: .4 }), 120); Cam.punch = .12; }
    if (g === 5) { confetti(120, { y: 2, burst: 7 }); flash(.35, .4); shakeStage(); FX.glint.emit({ x: 0, y: 1.3, z: 0, n: 80, rainbow: true, speed: [3, 7], size: [.3, .7] }); }
    react(g >= 3 ? 'joy' : 'nod');
    $('kara').classList.add('g' + g);
    if (G.combo >= 2) { const c = $('combo'); c.hidden = false; $('comboN').textContent = G.combo; c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); }
  } else if (G.endless && V.sent && r.near && !r.ng && !(ai && (ai.ng || (!ai.exists && !LEXR.has(r.A.join('')))))) {
    // one vowel off: no hit, no damage — the combo survives, the tempo holds
    slam('おしい!', 'ノーダメ回避 ・ 母音1つズレ', 'g1', ''); SFX.aww(); react('hurt'); oppReact('hurt'); $('kara').classList.add('g1');
    G.nearRun = (G.nearRun || 0) + 1;
  } else {
    G.combo = G.endless ? Math.floor(G.combo / 2) : 0; $('combo').hidden = !G.combo; if (G.endless) { if (G.guards > 0) { G.guards--; G.guarded = true; } else G.hp = Math.max(0, G.hp - 1); G.guardC = 0; G.lives = G.hp; } else { const S = ST(), dmg = Math.round(42 * (1 - S.d / 170)); G.hp = Math.max(0, G.hp - dmg); G.lives = G.hp > 0 ? 1 : 0; gaugePop(`-${dmg} HP`, true); } oppReact('joy'); SFX.aww();
    const loss = MISS * (1 + RND() * .25);
    if (!G.endless) { G.bar = Math.max(0, G.bar - loss); gaugePop(`-${Math.round(loss * 100)}%`, true); }
    const gEl = $('gauge'); gEl.classList.remove('hurt', 'mehurt'); void gEl.offsetWidth; gEl.classList.add('mehurt');
    slam(!V.sent ? '間に合わず!' : r.nodict ? 'ないわ!' : ai && !ai.exists && !LEXR.has(r.A.join('')) ? 'ないわ!' : ai && ai.ng ? 'アウト!' : r.strictMiss ? '甘い!' : 'ハズした!', G.endless ? (G.guarded ? (G.guarded = false, guardFx(), '🛡 GUARD!! ライフ無事') : `LIFE ${'♥'.repeat(G.hp)}${'♡'.repeat(Math.max(0, G.hpMax - G.hp))}`) : `${OPPN().n} HP +${Math.round(loss * 100)}%`, 'g0', V.sent ? r.reason : ''); skyU.uHurt.value = 1;
    vignette(VIG[0], .85); SFX.miss(); react('hurt'); shakeStage(); $('kara').classList.add('g0');
  }
  setMusicLevel(); updateHud(); save();
}
function tapNote(cx, cy) {
  if (G.state !== 'kara') return false;
  const now = AT(); let best = null, bd = 1;
  for (const n of V.notes) { if (n.hit) continue; const d = Math.abs(n.t - now); if (d < bd) { bd = d; best = n; } }
  if (!best || bd > .16) return false;
  const q = bd <= .05 ? 3 : bd <= .1 ? 2 : 1; best.hit = q; V.tap += [0, .4, .7, 1][q];
  best.el && best.el.classList.add('hit', 'q' + q);
  const j = $('tjudge'); j.textContent = ['', 'GOOD', 'GREAT', 'PERFECT'][q]; j.className = 'tj q' + q; void j.offsetWidth; j.className = 'tj show q' + q;
  SFX.hit(q); if (q === 3) { FX.glint.emit({ x: 0, y: .4, z: 1.4, n: 14, color: ['#FF4D1A', '#FFC21A', '#F3EFE6'], speed: [2, 5], up: .6, size: [.2, .45] }); Cam.punch = Math.max(Cam.punch, .03); }
  if (rig && !rig.react) react(q === 3 ? 'boing' : 'nod');
  return true;
}
function endVerse(step, t) {
  // tap bonus
  const acc = V.tapMax ? V.tap / V.tapMax : 0;
  if (acc > 0) { const bonus = acc * .06 * RU().gain; G.bar = Math.min(1, G.bar + bonus); setTimeout(() => gaugePop(`+${Math.round(bonus * 100)}% HYPE ${Math.round(acc * 100)}%`), Math.max(0, (t - AT()) * 1000)); G.score += Math.round(acc * 50 * (G.sp.stage + 1)); }
  if (!V.revealed && V.revealAt) reveal();
  { const pend = foods.reduce((s, f) => s + (f.per || 0), 0); if (pend > 0) { G.bar = Math.min(1, G.bar + pend); foods.forEach(f => f.per = 0); } } // food still in flight counts
  if (G.daily) { if (V.n >= 5) { hideKara(); G.state = 'over'; return setTimeout(dailyOver, Math.max(0, (t - AT()) * 1000)); } return startVerse(step, t); }
  if (G.endless) { if (G.hp <= 0) { hideKara(); G.state = 'over'; return setTimeout(endlessOver, Math.max(0, (t - AT()) * 1000)); } return startVerse(step, t); }
  if (G.bar >= 1) { hideKara(); G.state = 'verdict'; oppReact('hurt'); const nx = G.sp.kids.length ? branchTarget() : null; return setTimeout(() => startBonus(() => { oppReact('ko'); verdict(true, () => { removeOpp(); evolve(null, true); }); }, () => { seqMode('battle', { bpm: Seq.battleBpm }); G.bar = .8; G.barShown = 1; G.state = 'countin'; V.cntS = Infinity; G.noIntro = true; }), Math.max(0, (t - AT()) * 1000)); }
  if (G.lives <= 0) { hideKara(); G.state = 'verdict'; oppReact('joy'); return setTimeout(() => verdict(false, () => { removeOpp(); battleOver(); }), Math.max(0, (t - AT()) * 1000)); }
  startVerse(step, t);
}
function showNext() { return; if (!V.next || G.state !== 'kara') return; const n = $('knext'); const nq = QBY[V.next.word]; n.innerHTML = `<b>NEXT ▶</b> 「${nq ? nq.d : V.next.word}」と踏め　<span>${nq ? 'HINT：' + nq.h : vowelsOf(moras(V.next.word)).join('・')}</span>`; n.hidden = false; }
function hideKara() { $('jc').hidden = true; $('oppCard').classList.remove('rap'); $('knext').hidden = true; $('kara').hidden = true; answerEl.disabled = sendEl.disabled = true; V.voc.clear(); }
function startBattle(endless) {
  if (!PRG.tutDone && !PRG.endBest && G.state !== 'tut') { const ps = G.state; G.state = 'tut'; return showTut(() => { G.state = ps; startBattle(endless); }); }
  audioInit(); stopDance(); hideBubble(); genQuiz(); G.endless = endless === true; document.body.classList.toggle('endless', G.endless); G.endScore = 0; $('endScore').textContent = '0';
  { const S = ST(); G.hpMax = G.endless ? 3 + Math.floor(S.h / 40) : Math.round(60 + S.h * .9); G.hp = G.hpMax; G.guards = G.endless && S.d >= 50 ? 1 : 0; G.guardC = 0; G.guardN = guardEvery(S.d); G.origRun = 0; G.skill = 0; G.skillArmed = false; updateSkill(); }
  G.lives = 3; G.best = null; G.hits = 0; G.maxBpm = 0; G.hintLv = 0; G.wordLv = 0; G.maxZone = false; G.boss = false; G.dexNew = 0; G.dres = []; G.eBpm = startBpm(); G.prevBpm = startBpm(); G.upFrom = startBpm(); G.runCoins = PRG.coins || 0; G.runExp = PRG.exp || 0; G.combo = 0; G.maxCombo = 0; G.bScore = 0; G.bStartBar = G.bar; V.n = 0; G.boost = 0; G.boostShown = 0;
  document.body.classList.add('battle'); $('combo').hidden = true; $('cont').hidden = true;
  const tk = songFor(G.sp), b0 = G.endless ? startBpm() : Math.round(Math.min(196, tk.bpm * 1.15 + 10)); Seq.battleBpm = b0; seqMode('battle', { bpm: b0 }); setMusicLevel();
  setTimeout(() => banner(`<b>♪ ${tk.id}</b><small>${tk.g} · ${b0} BPM</small>`, 2600), 2600);
  G.state = 'countin'; V.cntS = Infinity;
  if (G.endless) { G.endOpp = pickRival(); G.lastRot = 0; spawnOpp(); camReset(); slam(`VS ${G.endOpp.n}`, stageIx() ? `BPM ${startBpm()} START ・ SCORE ×${stageMult()}` : 'ENDLESS', 'g5'); } else { spawnOpp(); camReset(); showVS(); } shot('wide'); SFX.milestone(); flash(.4);
  ring('rainbow'); confetti(80, { y: 1.5, burst: 6 });
  answerEl.value = ''; $('result').innerHTML = ''; $('jpanel').innerHTML = ''; hintEl.textContent = '上の行の最後の言葉と韻を踏んで、下の行の空欄を埋めよう。';
  updateHud();
}
function continuePrompt() {
  G.state = 'bracket'; G.evoPhase = ''; Cam.auto = 0; camReset(); Seq.bpm = Seq.target = Seq.battleBpm; BG.hold = false; BG.holdUntil = 0;
  answerEl.value = ''; $('result').innerHTML = ''; $('jpanel').innerHTML = ''; hintEl.textContent = '';
  G.r6 = []; save(); updateHud();
  if (G.pendingClear) { const pc = G.pendingClear; G.pendingClear = null; return setTimeout(() => showBracket('champ', pc), 300); }
  setTimeout(() => showBracket('win'), 300);
}
function chooseCont(yes) { if (G.state !== 'cont') return; V.choice = yes ? 'yes' : 'no'; $('contYes').classList.toggle('sel', yes); $('contNo').classList.toggle('sel', !yes); SFX.hit(yes ? 3 : 2); }
function karaLoop() {
  const now = AT(); if (G.state === 'bonus') bonusLoop(now);
  if (G.state === 'countin' && V.cntS === Infinity) { const bar = 16 * 60 / Seq.bpm / 4, intro = G.noIntro ? 1 : Math.max(1, Math.ceil(5.2 / bar)); G.noIntro = false; V.cntS = Math.ceil((Seq.step + 2) / 16) * 16 + 16 * (intro - 1); } // instrumental intro while the VS splash and the song title are up
  if (G.state === 'cont' && V.contS === Infinity) { V.contS = Math.ceil((Seq.step + 2) / 16) * 16; const pv = voicePitch(); ['ま', 'だ', 'ま', 'だ', 'い', 'け', 'る'].forEach((m, i) => vocAt(V.contS + i * 2, { m, v: vowelsOf([m])[0], pitch: pv + (i === 6 ? 5 : i % 2 * 2), acc: i % 2 === 0, dur: .14 })); }
  if (G.state !== 'kara') { if (!$('lane').hidden) $('lane').hidden = true; return; }
  // karaoke wipe
  const rep = V.t0 + 32 * V.sx, rep2 = V.t0 + 64 * V.sx;
  $('kara').querySelectorAll('.m[data-t]').forEach(el => { const t1 = +el.dataset.t, l1 = el.closest('#kl1'); const on = l1 ? ((now >= t1 && now < rep) || (now >= t1 + 32 * V.sx && now < rep2) || now >= rep2) : now >= t1; if (on !== el.classList.contains('on')) { el.classList.toggle('on', on); if (on && el.classList.contains('sl')) FX.glint.emit({ x: 0, y: 1.2 * rigScale, z: .8, n: 6, color: ['#FF4D1A', '#F3EFE6'], speed: [1, 3], size: [.2, .4] }); } });
  // input countdown to the blank
  const dt = V.t0 + (V.dead - V.s0) * V.sx, total = (V.dead - V.s0) * V.sx, left = dt - now;
  $('timerBar').style.transform = `scaleX(${V.phase === 'input' ? clamp(left / total) : 0})`; $('timer').classList.toggle('hurry', V.phase === 'input' && left < 2);
  $('tnum').textContent = V.phase === 'input' ? Math.max(0, left).toFixed(1) : V.sent ? 'LOCK' : '—';
  // hype lane
  const showLane = false; $('lane').hidden = !showLane;
  if (showLane) { const w = $('lane').clientWidth, hx = w * .16, pps = w * .55; V.notes.forEach(n => { if (!n.el) return; const x = hx + (n.t - now) * pps; n.el.style.transform = `translateX(${x}px)`; n.el.style.opacity = x < -20 || x > w + 20 ? 0 : 1; if (!n.hit && now - n.t > .16 && !n.el.classList.contains('miss')) n.el.classList.add('miss'); }); }
  // reveal once the judge is in (latency hides under the punch line)
  if (V.revealAt && !V.revealed && now >= V.revealAt && (V.aiDone || !V.sent || now > V.revealAt + 3.5)) reveal();
}
Seq.hook = karaHook;

/* ---------- BONUS: after the K.O., rapid-fire rhymes on one word (with hints) ---------- */
const BZ = { on: false }; window.__BZ = BZ;
// a prompt word with at least five clue-able model answers that share all its vowels
function bonusTarget() {
  if (!bonusTarget.ix) { const m = {}; QUIZ.forEach(q => { const v = vowelsOf(moras(q[2])).join(''); (m[v] = m[v] || new Map()).set(q[2], { a: q[2], k: q[3], h: q[4] }); }); bonusTarget.ix = m;
    bonusTarget.pool = WORDS.filter(w => { const L = [...(m[vowelsOf(moras(w)).join('')] || new Map()).values()].filter(x => x.a !== w && rhymeCore(w, x.a).R >= 4); return L.length >= 5; }); }
  const w = pick(bonusTarget.pool.filter(x => !G.recent.includes(x)).length ? bonusTarget.pool.filter(x => !G.recent.includes(x)) : bonusTarget.pool);
  const used = new Set([...G.recent, ...(G.usedA || [])]); let L = [...bonusTarget.ix[vowelsOf(moras(w)).join('')].values()].filter(x => x.a !== w && rhymeCore(w, x.a).R >= 4); if (L.filter(x => !used.has(x.a)).length >= 5) L = L.filter(x => !used.has(x.a)); L = L.sort(() => Math.random() - .5).slice(0, 5);
  return { w, c: L };
}
// FINISH: the rival is down to its last hit. Land N chain rhymes on one word to K.O. — run out of time and it recovers.
function startBonus(done, fail) {
  const T0 = bonusTarget(), need = 3, dur = 20;
  Object.assign(BZ, { on: false, w: T0.w, cands: T0.c, used: new Set(), typed: new Set(), n: 0, pts: 0, need, dur, done, fail, hints: [] });
  G.state = 'bonus'; Seq.level = 4; Seq.chainLv = 0; seqMode('chain', { bpm: Math.max(118, Math.min(140, Seq.bpm)) }); document.body.classList.remove('chain1', 'chain2', 'chain3');
  const disp = QBY[T0.w] ? QBY[T0.w].d : T0.w, vw = vowelsOf(moras(T0.w)).join(' · ').toUpperCase();
  $('bzWord').textContent = disp; $('bzVow').textContent = vw; $('bzN').textContent = '0'; $('bzNeed').textContent = need; $('bzList').innerHTML = ''; $('bzMsg').textContent = '';
  $('bzHow').innerHTML = `<span>お題に対して<em>3つの言葉</em>で<br>韻を踏もう！</span>`;
  bzHints(); $('bonus').hidden = false; $('bonus').classList.remove('end', 'go'); $('bzHow').hidden = false; G.recent.push(T0.w);
  slam('FINISH!', '', 'g5'); SFX.crowd(1); flash(.4);
  answerEl.value = ''; answerEl.disabled = sendEl.disabled = true; answerEl.placeholder = `${disp} × ${need}`;
  setTimeout(() => { if (G.state !== 'bonus') return; $('bzHow').hidden = true; $('bonus').classList.add('go'); BZ.on = true; BZ.t0 = AT(); BZ.end = AT() + dur; answerEl.disabled = sendEl.disabled = false; answerEl.focus({ preventScroll: true }); SFX.scratch(); }, 2200);
}
function bzHints() { const vw = c => vowelsOf(moras(c.a)).join('·'); $('bzHints').innerHTML = BZ.cands.map((c, i) => `<li class="${BZ.used.has(c.a) ? 'got' : ''}"><i>${vw(c)}</i><span>${BZ.used.has(c.a) ? `<b>${c.k}</b>` : c.h}</span></li>`).join(''); }
function bonusSubmit() {
  if (!BZ.on) return; const raw = answerEl.value.normalize('NFKC').replace(/[\s・、。,.!！?？「」『』〜~]/g, ''); if (!raw) return; const kana = norm(raw); answerEl.value = '';
  const bad = msg => { answerEl.classList.remove('bad'); void answerEl.offsetWidth; answerEl.classList.add('bad'); hintEl.textContent = msg; $('bzMsg').textContent = msg; SFX.miss(); };
  if (!KANA_RE.test(kana)) return bad('ひらがな・カタカナで！');
  if (BZ.used.has(kana) || (BZ.typed && BZ.typed.has(kana)) || kana === BZ.w) return bad('もう使った'); (BZ.typed = BZ.typed || new Set()).add(kana);
  const core = rhymeCore(BZ.w, kana); if (core.ng) return bad('それはアウト'); const hit = BZ.cands.find(c => c.a === kana || norm(c.k) === kana); if (hit) BZ.used.add(hit.a); if (!hit && core.R < 3) return bad('母音がそろってない');
  if (!hit && !LEXR.has(kana)) return bad('辞書にない言葉');
  { const gg = core.R >= 5 ? 5 : core.R >= 4 ? 4 : 3; if (!G.best || gg > G.best.g) G.best = { g: gg, w: QBY[BZ.w] ? QBY[BZ.w].d : BZ.w, a: hit ? hit.k : kana }; }
  BZ.used.add(kana); BZ.n++; const p = 100 * BZ.n * (hit || core.R >= 4 ? 2 : 1); BZ.pts += p; G.score += p; addCoins(core.R >= 4 ? 5 : 3);
  $('bzN').textContent = BZ.n; $('bzMsg').textContent = ''; $('bzList').insertAdjacentHTML('afterbegin', `<span class="${core.R >= 4 ? 'hard' : ''}">${kana}</span>`);
  const pv = voicePitch(), ms = moras(kana), vs = vowelsOf(ms), sx = 60 / Seq.bpm / 4; ms.forEach((m, i) => sing(toAC(AT() + .04 + i * sx), { m, v: vs[i], pitch: pv + 4 - i, acc: true, slot: true, dur: sx * 1.2 }));
  SFX.hit(3); SFX.crowd(.5 + BZ.n * .25); react(BZ.n % 2 ? 'boing' : 'joy'); oppReact('hurt'); Cam.punch = .1; shakeStage();
  FX.star.emit({ x: OPP_X(), y: 1.2 * rigScale, z: 0, n: 40 + BZ.n * 10, speed: [2, 6], up: .6, rainbow: BZ.n >= BZ.need, color: GHEX[4], size: [.25, .55] });
  Seq.chainLv = BZ.n; Seq.target = Seq.bpm + 14; if (A.ac) { S.crash(toAC(AT()), .3); S.riser(toAC(AT()), .5, .3); } document.body.classList.add('chain' + Math.min(3, BZ.n)); flash(.25 + BZ.n * .15);
  slam(BZ.n >= BZ.need ? 'K.O.!!' : `${BZ.n} HIT!`, BZ.n >= BZ.need ? '' : 'TEMPO UP!', BZ.n >= BZ.need ? 'g5 evo' : 'g4');
  if (BZ.n >= BZ.need) { const left = Math.max(0, BZ.end - AT()); addCoins(Math.round(left * 3), true); return bonusEnd(true); }
  bzHints();
}
function bonusLoop(now) {
  if (!BZ.on) return; const left = BZ.end - now; $('bzBar').style.transform = `scaleX(${clamp(left / BZ.dur)})`; $('bzTime').textContent = Math.max(0, left).toFixed(1);
  if (left <= 0) bonusEnd(false);
}
function bonusEnd(ko) {
  if (!BZ.on) return; BZ.on = false; answerEl.disabled = sendEl.disabled = true; answerEl.placeholder = '空欄にはめる言葉'; $('bonus').classList.add('end');
  if (ko) { seqMode('drop', { bpm: 174, after: 'battle', len: 256 }); G.peakOn = true; SFX.crowd(2); confetti(200, { y: 2.5, burst: 8 }); flash(.8, .5); shakeStage(); Cam.punch = .2; }
  else { slam('しのがれた…', '', 'g0'); SFX.aww(); oppReact('joy'); }
  setTimeout(() => { $('bonus').hidden = true; const d = ko ? BZ.done : BZ.fail; BZ.done = BZ.fail = null; d && d(); document.body.classList.remove('chain1', 'chain2', 'chain3'); }, ko ? 900 : 1900);
}
function bonusStop() { G.peakOn = false; document.body.classList.remove('chain1', 'chain2', 'chain3'); if (BZ.on) { BZ.on = false; BZ.done = null; } $('bonus').hidden = true; answerEl.placeholder = '空欄にはめる言葉'; }

/* ---------- charisma skill: fills on good rhymes; strike your pose for a double hit + heal ---------- */
function updateSkill() { const b = $('skillBtn'); if (!b) return; const tp = $('skillTip'); if (tp) tp.classList.toggle('ready', (G.skill || 0) >= 100 && !G.skillArmed); const p = Math.round(G.skill || 0); b.style.setProperty('--p', p + '%'); b.classList.toggle('ready', p >= 100); b.querySelector('span').textContent = G.skillArmed ? 'ON!' : p >= 100 ? 'SKILL' : p + '%'; }
$('skillBtn').addEventListener('click', e => {
  e.preventDefault(); if (G.state !== 'kara' || (G.skill || 0) < 100 || G.skillArmed) return;
  G.skill = 0; G.skillArmed = true; G.hp = Math.min(G.hpMax, G.hp + (G.endless ? 1 : Math.round(G.hpMax * .15))); if (G.endless) G.lives = G.hp; updateSkill();
  G.pose = PRG.pose || 'stand'; setTimeout(() => { if (G.pose === (PRG.pose || 'stand')) G.pose = null; }, 1800);
  slam('CHARISMA!!', G.endless ? '次の正解スコア2倍 ＋ ライフ+1' : '次の正解ダメージ2倍 ＋ HP 15%回復', 'g5'); $('skillTip').classList.add('on'); setTimeout(() => $('skillTip').classList.remove('on'), 2600); SFX.crowd(1.6); flash(.5, .4); ring('rainbow', { big: 5 }); Cam.punch = .12;
  FX.glint.emit({ x: PL_X(), y: 1.4 * rigScale, z: 0, n: 120, rainbow: true, speed: [2, 6], size: [.3, .6] });
  setTimeout(() => answerEl.focus({ preventScroll: true }), 30);
});

/* ---------- endless challenge result ---------- */
/* endless rank board: how far up the ladder this run climbed */
const ERANKS = [['F', 'ベビーMC', 0, '#9AA0AE'], ['E', '路上デビュー', 1000, '#7FD4FF'], ['D', 'サイファー常連', 3000, '#56D9F5'], ['C', 'フロアの主役', 6000, '#2EE88A'], ['B', 'ヘッドライナー', 10000, '#D4FF3A'], ['A', 'チャンピオン', 20000, '#FFC93D'], ['S', 'レジェンドMC', 30000, '#FF8A3D'], ['SS', 'ライムモンスター', 50000, '#FF5C8A']];
const rankIx = sc => { let i = 0; ERANKS.forEach((r, k) => { if (sc >= r[2]) i = k; }); return i; };
function rankBoard(el, sc, best) {
  const me = rankIx(sc), bi = rankIx(best), nx = ERANKS[me + 1], n = ERANKS.length;
  // a pyramid: SS on top, F at the base — you climb it
  el.innerHTML = `<div class="pyr">${ERANKS.map((r, k) => `<div class="pr${k}" data-k="${k}" style="--rc:${r[3]};--wk:${100 - k * 8.5}%"><i>${r[0]}</i><b>${r[1]}${k === bi && bi !== me ? '<u>BEST</u>' : ''}</b><em>${r[2].toLocaleString()}</em></div>`).reverse().join('')}</div>`
    + `<div class="rnext">${nx ? `NEXT <b>${nx[0]}</b> まで あと ${(nx[2] - sc).toLocaleString()} pt` : 'TOP RANK!!'}</div>`;
  el.hidden = false; const rows = [...el.querySelectorAll('.pyr > div')].reverse();
  rows.forEach((row, k) => { if (k > me) return; setTimeout(() => { row.classList.add('lit'); try { SFX.hit(k === me ? 3 : 1); } catch (e) {} if (k === me) { row.classList.add('me'); if (me >= 4) { SFX.crowd(1 + (me - 4) * .3); confetti(60 + me * 20, { y: 2.5, burst: 6 }); } } }, 300 + k * 200); });
}
function endlessOver() {
  const firstRun = !PRG.onbDone && !(PRG.endBest > 0); if (!firstRun && !PRG.onbDone) PRG.onbDone = true; G.onbPending = firstRun;
  hideKara(); seqMode('hub', { bpm: 92 }); const sc = G.endScore || 0, best = Math.max(PRG.endBest || 0, sc), isBest = sc > (PRG.endBest || 0); PRG.endBest = best; addCoins(Math.round(sc / 40), true); addExp(Math.round(sc / 8)); save();
  $('overEy').textContent = isBest ? 'ENDLESS MC BATTLE · NEW RECORD!!' : 'ENDLESS MC BATTLE · GAME OVER'; $('overTitle').textContent = `${G.hits || 0}韻・最高${G.maxBpm || startBpm()}BPM`;
  $('ovScore').textContent = sc.toLocaleString(); $('ovCombo').textContent = G.maxCombo; $('ovCombo').nextElementSibling.textContent = 'MAX COMBO'; $('ovGauge').textContent = best.toLocaleString();
  $('ovGauge').nextElementSibling.textContent = 'BEST'; $('ovMsg').textContent = ''; $('ovShare').hidden = false; const M = $('overModal'); M.hidden = false; M.classList.add('endres'); M.dataset.step = '1'; rankBoard($('ovRanks'), sc, best);
  if (isBest) { confetti(200, { y: 2.5, burst: 8 }); SFX.crowd(1.6); }
  let head = '';
  if (sc >= CLEAR_SCORE && !PRG.cleared[G.mode]) { PRG.cleared[G.mode] = true; PRG.wins[G.mode] = (PRG.wins[G.mode] || 0) + 1; save(); G.pendingEnd = { first: true, mode: G.mode }; head = '<b class="clr">RANK A 到達 ― 制覇！</b>'; }
  const hh = G.hits || 0, earned = Math.max(1, (PRG.exp || 0) - (G.runExp || 0)), coins = Math.max(0, (PRG.coins || 0) - (G.runCoins || 0));
  const first = firstRun;
  // what powering up would buy right now — the reason to press the button
  const kids = G.sp.kids || [], cost = kids.length ? EVO_COST[BY[kids[0]].stage] : 0, canEvo = kids.length && (PRG.exp || 0) >= cost, nb = typeof nextBuy === 'function' && nextBuy(), canBuy = nb && (PRG.coins || 0) >= nb.p;
  const pw = canEvo ? '進化できる！ 速いBPMで高得点を狙え' : canBuy ? `◎で「${nb.n}」が買える！` : kids.length ? `進化まで あと EXP ${(cost - (PRG.exp || 0)).toLocaleString()}` : 'ギアで相棒をパワーアップ';
  const pal = `<div class="pal"><b>${petName()}</b>「${first ? 'EXPとコインがたまったよ！ ぼくを強くして！' : canEvo || canBuy ? 'ねえ、ぼくもっと強くなれるよ！' : hh >= 20 ? 'いまのセッション、伝説だったよ…！' : hh >= 10 ? 'のってきたね！もう1曲いこ！' : 'だいじょうぶ、一緒に練習しよ！'}」</div>`;
  $('ovMsg').innerHTML = head
    + `<div class="ov1"><button class="sharecta" data-act="share"><span class="scimg"><img alt=""></span><span class="sct"><b>${isBest ? '自己ベスト更新！' : 'スコアカードができた！'}</b><small>相棒と一緒にみんなに見せよう</small><em>𝕏 でポスト ▶</em></span></button><button class="go" data-act="next">次へ ▶</button></div>`
    + `<div class="ov2"><div class="ov2h">REWARD GET!</div><div class="gain"><span><i>EXP</i><b>+${earned.toLocaleString()}</b></span><span><i>COIN</i><b>◎+${coins.toLocaleString()}</b></span></div>${pal}`
    + (first ? `<button class="go big1 hot" data-act="hub">楽屋で相棒を育てる ▶</button>`
      : `<button class="go big1" data-act="again">もう一回 ▶</button><button class="go ch pw${canEvo || canBuy ? ' hot blink' : ''}" data-act="power">${canEvo || canBuy ? '<u class="upb">UP!</u>' : ''}<b>相棒を強化する</b><small>${pw}</small></button><div class="pwsub" hidden><button class="go sub${canEvo ? ' hot blink' : ''}" data-act="evo" ${kids.length ? '' : 'disabled'}><b>進化</b><small>${kids.length ? (canEvo ? 'できる！' : `EXP ${(PRG.exp || 0).toLocaleString()}/${cost.toLocaleString()}`) : '最終形態'}</small></button><button class="go sub${canBuy ? ' hot blink' : ''}" data-act="shop"><b>ショップ</b><small>◎${(PRG.coins || 0).toLocaleString()}</small></button></div><button class="go sub ch" data-act="hub"><b>楽屋へ戻る</b></button>`)
    + `</div>`;
  setTimeout(() => { try { shareCard({ kind: 'endless' }, u => { const im = $('ovMsg').querySelector('.scimg img'); if (im) { im.src = u; im.parentElement.classList.add('on'); } }); } catch (e) { console.error('preview', e); } }, 900);
}
const CLEAR_SCORE = 20000;


/* ---------- 今日の5韻: the same five prompts for everyone today, a Wordle-style grid to post ---------- */
function dailyFive() { const d = dayKey(); let h = (d * 2654435761) % 4294967296; const out = []; while (out.length < 5) { h = (h * 1103515245 + 12345) % 2147483648; const w = QUIZ[h % QUIZ.length][0]; if (!out.includes(w) && charLen(w) <= 5) out.push(w); } return out; }
function startDaily() { G.daily = true; G.dailyDone = false; G.dailyList = dailyFive(); startBattle(true); }
const GRID = g => g >= 4 ? '🟩' : g === 3 ? '🟨' : g > 0 ? '🟧' : '⬛';
function dailyOver() {
  hideKara(); seqMode('hub', { bpm: 92 }); const res = (G.dres || []).slice(0, 5), hits = res.filter(g => g > 0).length, sc = G.endScore || 0, d = dayKey();
  const S0 = PRG.streak || { day: 0, n: 0 }; const first = S0.day !== d; if (first) { PRG.streak = { day: d, n: S0.day === d - 1 ? S0.n + 1 : 1 }; addExp(100 + 20 * hits); addCoins(30 + 10 * hits, true); }
  if (first) PRG.dailyBest = { day: d, sc, grid: res }; save();
  $('overEy').textContent = `今日の5韻${first ? '' : '（練習）'} ・ 🔥${PRG.streak.n}日連続`; $('overTitle').innerHTML = `<span class="dgrid">${res.map(GRID).join('')}</span><br>${hits}/5韻`;
  $('ovScore').textContent = sc.toLocaleString(); $('ovCombo').textContent = G.maxCombo; $('ovCombo').nextElementSibling.textContent = 'MAX COMBO'; $('ovGauge').textContent = `${PRG.streak.n}`; $('ovGauge').nextElementSibling.textContent = '連続日数';
  $('ovMsg').innerHTML = (first ? `今日のボーナス EXP+${100 + 20 * hits} ・ ◎+${30 + 10 * hits}` : '練習モード：シェアされるのは今日1回目の結果') + '<br><small>🟩うまっ以上　🟨ナイス　🟧おしい　⬛ミス</small>'; $('ovMsg').insertAdjacentHTML('afterbegin', `<div class="pal"><b>${petName()}</b>「${hits >= 4 ? 'きょうの5韻、キレてたね！' : hits >= 2 ? 'あしたはもっといける！' : 'つぎは一緒にリベンジしよ！'}」</div>`); $('ovRanks').hidden = true; $('ovShare').hidden = false; $('overModal').classList.remove('endres'); delete $('overModal').dataset.step; $('overModal').hidden = false; G.dailyDone = true;
  if (hits >= 4) { confetti(200, { y: 2.5, burst: 8 }); SFX.crowd(1.5); }
}
function dailyText() { const b = PRG.dailyBest || { grid: G.dres || [], sc: G.endScore || 0 }, dt = new Date(Date.now() + 9 * 3600e3), k = `${dt.getUTCMonth() + 1}/${dt.getUTCDate()}`;
  return `#ライモン今日の5韻 ${k} 🔥${(PRG.streak || {}).n || 1}日連続\n${b.grid.map(GRID).join('')} ${b.grid.filter(g => g > 0).length}/5韻・${(b.sc || 0).toLocaleString()}pt\nあなたは何韻？ ▶ ${GAME_URL}`; }

/* ---------- first-run tutorial: 5 slides, a mock screen, the spot to look at glows ---------- */
const TUT = [
  { h: 'ライバルの<em>最後の言葉</em>を見ろ', s: '', hl: ['.tm-rival'] },
  { h: '<em>母音</em>をそろえて踏み返せ', s: 'と・ん・ぼ → o・n・o', hl: ['.tm-rival', '.tm-you'] },
  { h: '打ちこんで<em>ふむ！</em>', s: '速いほど高得点', hl: ['.tm-in'] },
  { h: 'ミスで<em>♥−1</em>', s: '当てるほど BPM UP ↑', hl: ['.tm-hud'] },
  { h: '<em>RANK A</em> でクリア！', s: '', hl: [] },
];
const TS = { i: 0, done: null, timers: [] };
function tutClear() { TS.timers.forEach(clearTimeout); TS.timers = []; }
function tutLater(f, ms) { TS.timers.push(setTimeout(f, ms)); }
function tutGo(i) {
  tutClear(); TS.i = i; const t = TUT[i], el = $('tut'); el.dataset.s = i;
  el.querySelectorAll('.tm .hl').forEach(e => e.classList.remove('hl')); t.hl.forEach(s => el.querySelector(s).classList.add('hl'));
  $('tutStep').textContent = `${i + 1} / ${TUT.length}`; $('tutH').innerHTML = t.h; $('tutS').textContent = t.s;
  const cap = el.querySelector('.tut-cap'); cap.classList.remove('in'); void cap.offsetWidth; cap.classList.add('in');
  $('tutDots').innerHTML = TUT.map((_, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('');
  $('tutNext').textContent = i === TUT.length - 1 ? 'はじめる ▶' : 'つぎへ ▶';
  const box = $('tutType'), ans = $('tutAns'), pop = el.querySelector('.tm-pop'), fumu = el.querySelector('.tm-fumu');
  box.textContent = ''; box.classList.remove('typing'); ans.textContent = ''; pop.classList.remove('on'); fumu.classList.remove('press'); $('tutBpm').textContent = '120';
  try { SFX.hit(1); } catch (e) {}
  if (i === 1) tutLater(() => { ans.textContent = '？？？'; }, 600);
  if (i === 2) { const w = ['こ', 'こん', 'こんど']; box.classList.add('typing'); const loop = () => { box.textContent = ''; ans.textContent = ''; pop.classList.remove('on'); w.forEach((x, k) => tutLater(() => { box.textContent = x; }, 400 + k * 320)); tutLater(() => { fumu.classList.add('press'); box.classList.remove('typing'); }, 1500); tutLater(() => { fumu.classList.remove('press'); ans.textContent = 'こんど'; box.textContent = ''; pop.classList.add('on'); try { SFX.hit(3); } catch (e) {} }, 1650); tutLater(() => { box.classList.add('typing'); loop(); }, 3600); }; loop(); }
  if (i === 3) { let b = 120; const up = () => { b = b >= 140 ? 120 : b + 4; $('tutBpm').textContent = b; tutLater(up, 400); }; tutLater(up, 400); }
  if (i === 4) { try { SFX.milestone(); } catch (e) {} }
}
function showTut(done) { TS.done = done || null; $('tut').hidden = false; tutGo(0); }
function tutEnd() { tutClear(); $('tut').hidden = true; if (!PRG.tutDone) { PRG.tutDone = true; save(); } const d = TS.done; TS.done = null; if (d) d(); }
$('tutNext').addEventListener('click', e => { e.stopPropagation(); TS.i < TUT.length - 1 ? tutGo(TS.i + 1) : tutEnd(); });
$('tutSkip').addEventListener('click', e => { e.stopPropagation(); tutEnd(); });
{ let x0 = null; const st = $('tutStage'); st.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true }); st.addEventListener('touchend', e => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null; if (dx < -40 && TS.i < TUT.length - 1) tutGo(TS.i + 1); else if (dx > 40 && TS.i > 0) tutGo(TS.i - 1); }, { passive: true }); st.addEventListener('click', () => { TS.i < TUT.length - 1 ? tutGo(TS.i + 1) : tutEnd(); }); }
$('tutBtn').addEventListener('click', () => { if (G.state === 'idle') showTut(null); });
