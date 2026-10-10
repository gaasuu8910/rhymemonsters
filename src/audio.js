/* =========================================================
   AUDIO — a tiny procedural EDM engine (WebAudio)
   modes: hub (lofi 90) · dance (124) · battle (112→152 with gauge) · build (150, 2 bars) · drop (150, 4 bars)
   ========================================================= */
const A = { ac: null, master: null, music: null, sfx: null, duck: null, rev: null, an: null, noise: null, muted: false, freq: null };
// game clock never depends on the AudioContext (which may stay suspended); audio times are mapped at schedule time
function AT() { return performance.now() / 1000; }
function ACT() { return A.ac ? A.ac.currentTime : 0; }
function toAC(t) { return A.ac ? Math.max(0, t - performance.now() / 1000 + A.ac.currentTime) : Math.max(0, t); }
function wakeAudio() { try { if (A.ac && A.ac.state !== 'running') A.ac.resume().catch(() => {}); } catch (e) {} }
['pointerdown', 'keydown', 'click', 'touchend'].forEach(k => document.addEventListener(k, wakeAudio, { capture: true, passive: true }));
function audioInit() {
  if (!Seq.next) Seq.next = AT() + .1; // the beat clock runs even with no audio at all
  if (A.ac) { wakeAudio(); return; }
  try { audioBuild(); } catch (e) { console.warn('audio off', e); A.ac = null; }
}
function audioBuild() {
  A.ac = new (window.AudioContext || window.webkitAudioContext)();
  const ac = A.ac;
  A.master = ac.createGain(); A.master.gain.value = A.muted ? 0 : .85;
  const comp = ac.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 5; comp.attack.value = .003; comp.release.value = .15;
  A.an = ac.createAnalyser(); A.an.fftSize = 256; A.an.smoothingTimeConstant = .72; A.freq = new Uint8Array(A.an.frequencyBinCount);
  A.master.connect(comp); comp.connect(A.an); A.an.connect(ac.destination);
  A.music = ac.createGain(); A.music.gain.value = .9; A.music.connect(A.master);
  A.duck = ac.createGain(); A.duck.connect(A.music);
  A.sfx = ac.createGain(); A.sfx.gain.value = .9; A.sfx.connect(A.master);
  // reverb from generated impulse
  A.rev = ac.createConvolver(); const len = ac.sampleRate * 2.2, ir = ac.createBuffer(2, len, ac.sampleRate);
  for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
  A.rev.buffer = ir; const rg = ac.createGain(); rg.gain.value = .28; A.rev.connect(rg); rg.connect(A.master);
  A.noise = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate); const nd = A.noise.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  wakeAudio();
}
function setMuted(m) { A.muted = m; if (A.master) A.master.gain.setTargetAtTime(m ? 0 : .85, ACT(), .05); }
const midi = n => 440 * Math.pow(2, (n - 69) / 12);
function env(g, t, a, peak, d, hold = 0) { g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(peak, t + a); if (hold) g.gain.setValueAtTime(peak, t + a + hold); g.gain.exponentialRampToValueAtTime(.0001, t + a + hold + d); }
function O(type, f, t, dur) { t = Math.max(0, t); const o = A.ac.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); o.start(t); o.stop(t + dur + .1); return o; }
function N(t, dur) { t = Math.max(0, t); const s = A.ac.createBufferSource(); s.buffer = A.noise; s.start(t, Math.random() * 1.5); s.stop(t + dur + .05); return s; }
function F(type, f, q = 1) { const b = A.ac.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b; }
function G_(v = 1) { const g = A.ac.createGain(); g.gain.value = v; return g; }
function chain(...n) { for (let i = 0; i < n.length - 1; i++) n[i].connect(n[i + 1]); return n[n.length - 1]; }

const S = {
  kick(t, p = 1) { const o = O('sine', 160, t, .5); o.frequency.exponentialRampToValueAtTime(42, t + .11); const g = G_(); env(g, t, .002, .95 * p, .42); chain(o, g, A.music);
    const c = N(t, .02), cg = G_(); env(cg, t, .001, .25 * p, .02); chain(c, F('highpass', 2500), cg, A.music);
    // sidechain pump
    A.duck.gain.cancelScheduledValues(t); A.duck.gain.setValueAtTime(.18, t); A.duck.gain.linearRampToValueAtTime(1, t + .2); },
  snare(t, v = .5) { const n = N(t, .22), g = G_(); env(g, t, .001, v, .18); chain(n, F('bandpass', 1900, .8), g, A.music); const o = O('triangle', 190, t, .12), g2 = G_(); env(g2, t, .001, v * .45, .1); chain(o, g2, A.music); const s = G_(.2); g.connect(s); s.connect(A.rev); },
  clap(t, v = .5) { for (let i = 0; i < 3; i++) { const n = N(t + i * .011, .15), g = G_(); env(g, t + i * .011, .001, v * (i === 2 ? 1 : .6), i === 2 ? .16 : .02); chain(n, F('bandpass', 1300, 1.4), g, A.music); const s = G_(.25); g.connect(s); s.connect(A.rev); } },
  hat(t, v = .2, open = false) { const n = N(t, open ? .3 : .05), g = G_(); env(g, t, .001, v, open ? .22 : .035); chain(n, F('highpass', 8000), g, A.music); },
  rim(t, v = .15) { const o = O('square', 1700, t, .03), g = G_(); env(g, t, .001, v, .025); chain(o, F('bandpass', 1800, 2), g, A.music); },
  bass(t, n, d, v = .5, wave = 'sawtooth') { const o = O(wave, midi(n), t, d), o2 = O('square', midi(n - 12), t, d), f = F('lowpass', 900, 6), g = G_(); f.frequency.setValueAtTime(1600, t); f.frequency.exponentialRampToValueAtTime(220, t + d); env(g, t, .005, v, d * .9); const g2 = G_(.5); o2.connect(g2); g2.connect(f); chain(o, f, g, A.duck); },
  sub(t, n, d, v = .6) { const o = O('sine', midi(n), t, d), g = G_(); env(g, t, .005, v, d); chain(o, g, A.duck); },
  saw(t, notes, d, v = .1, cut = 3200) { const f = F('lowpass', cut, 1.5), g = G_(); env(g, t, .01, v, d * .85, d * .1); chain(f, g, A.duck); const s = G_(.35); g.connect(s); s.connect(A.rev);
    notes.forEach(n => [-14, -6, 0, 7, 15].forEach(dt => { const o = O('sawtooth', midi(n), t, d + .1); o.detune.value = dt; o.connect(f); })); },
  pluck(t, n, v = .12, d = .25) { const o = O('square', midi(n), t, d), f = F('lowpass', 3000, 4), g = G_(); f.frequency.setValueAtTime(5000, t); f.frequency.exponentialRampToValueAtTime(500, t + d); env(g, t, .002, v, d); chain(o, f, g, A.music); const s = G_(.5); g.connect(s); s.connect(A.rev); },
  bell(t, n, v = .1, d = .8) { const o = O('sine', midi(n), t, d), o2 = O('sine', midi(n) * 2.01, t, d), g = G_(); env(g, t, .002, v, d); o.connect(g); const g2 = G_(.4); o2.connect(g2); g2.connect(g); g.connect(A.music); const s = G_(.6); g.connect(s); s.connect(A.rev); },
  pad(t, notes, d, v = .05) { const f = F('lowpass', 1400, .7), g = G_(); g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(v, t + d * .3); g.gain.linearRampToValueAtTime(.0001, t + d); chain(f, g, A.duck); const s = G_(.8); g.connect(s); s.connect(A.rev); notes.forEach(n => [-8, 8].forEach(dt => { const o = O('triangle', midi(n), t, d); o.detune.value = dt; o.connect(f); })); },
  riser(t, d, v = .35) { const n = N(t, d), f = F('bandpass', 400, 3), g = G_(); f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(9000, t + d); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + d); g.gain.linearRampToValueAtTime(0, t + d + .03); chain(n, f, g, A.music);
    const o = O('sawtooth', 110, t, d), g2 = G_(); o.frequency.exponentialRampToValueAtTime(1760, t + d); g2.gain.setValueAtTime(.0001, t); g2.gain.exponentialRampToValueAtTime(v * .18, t + d); g2.gain.linearRampToValueAtTime(0, t + d + .03); chain(o, F('lowpass', 4000), g2, A.music); },
  crash(t, v = .3) { const n = N(t, 2), g = G_(); env(g, t, .001, v, 1.6); chain(n, F('highpass', 5000), g, A.music); const s = G_(.5); g.connect(s); s.connect(A.rev); },
  reese(t, n, d, v = .3) { const f = F('lowpass', 420, 5), ws = A.ac.createWaveShaper(); ws.curve = REESE_CURVE; const g = G_(); f.frequency.setValueAtTime(380, t); f.frequency.linearRampToValueAtTime(1500, t + d * .45); f.frequency.exponentialRampToValueAtTime(260, t + d); env(g, t, .01, v, d * .8, d * .15); [-22, 0, 19].forEach(dt => { const o = O('sawtooth', midi(n), t, d); o.detune.value = dt; o.connect(f); }); chain(f, ws, g, A.duck); },
  acid(t, n, d, accent, cut) { const o = O('sawtooth', midi(n), t, d + .02), f = F('lowpass', cut, 16), g = G_(); f.frequency.setValueAtTime(cut * (accent ? 3.2 : 1.7), t); f.frequency.exponentialRampToValueAtTime(160, t + d * 1.4); env(g, t, .004, accent ? .2 : .13, d); chain(o, f, g, A.duck); const s = G_(.2); g.connect(s); s.connect(A.rev); },
  stab(t, notes, v = .16) { const f = F('bandpass', 1300, .9), g = G_(); env(g, t, .004, v, .2); notes.forEach(n => { const o = O('sawtooth', midi(n), t, .3), q = O('square', midi(n) * 1.004, t, .3); o.connect(f); q.connect(f); }); chain(f, g, A.music); const s = G_(.6); g.connect(s); s.connect(A.rev); },
  ride(t, v = .08) { const n = N(t, .45), g = G_(); env(g, t, .001, v, .38); chain(n, F('bandpass', 9000, 2.5), g, A.music); },
  crackle(t) { const n = N(t, .008), g = G_(); env(g, t, .0005, .05 + Math.random() * .05, .006); chain(n, F('highpass', 2500), g, A.music); },
  keys(t, notes, d, v = .07) { const g = G_(), f = F('lowpass', 2400, .6), lfo = O('sine', 5.5, t, d), lg = G_(.25); lfo.connect(lg); lg.connect(g.gain); env(g, t, .01, v, d * .9, d * .1); notes.forEach(n => [0, 7].forEach(dt => { const o = O(dt ? 'sine' : 'triangle', midi(n), t, d); o.detune.value = dt; o.connect(f); })); chain(f, g, A.duck); const s = G_(.6); g.connect(s); s.connect(A.rev); },
  rumble(t, d, n) { const o = O('sine', midi(n - 12), t, d), g = G_(); env(g, t, .02, .22, d); chain(o, F('lowpass', 120), g, A.duck); const s = G_(.5); g.connect(s); s.connect(A.rev); },
  impact(t) { const o = O('sine', 110, t, 2), g = G_(); o.frequency.exponentialRampToValueAtTime(30, t + .8); env(g, t, .002, 1, 1.8); chain(o, g, A.music); S.crash(t, .45); const n = N(t, .5), g2 = G_(); env(g2, t, .001, .5, .4); chain(n, F('lowpass', 900), g2, A.music); },
};

// key of A minor: Am F C G
const REESE_CURVE = (() => { const c = new Float32Array(1024); for (let i = 0; i < 1024; i++) { const x = i / 512 - 1; c[i] = Math.tanh(x * 2.4); } return c; })();
const PROG = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]];
const ROOT = [45, 41, 48, 43];
const PENTA = [69, 72, 74, 76, 79, 81, 84];
const Seq = { mode: 'hub', bpm: 92, target: 92, battleBpm: 160, step: 0, next: 0, mstep: 0, mstart: 0, after: 'hub', level: 0, events: [], onDone: null };
function seqMode(m, opts = {}) {
  Seq.mode = m; Seq.mstep = Seq.inStep ? -1 : 0; Seq.mstart = (Seq.next || AT()) + (Seq.inStep ? sixteenth() : 0);
  if (opts.bpm) { Seq.bpm = Seq.target = opts.bpm; }
  if (opts.after) Seq.after = opts.after;
  Seq.onDone = opts.onDone || null; Seq.dropLen = opts.len || 64;
}
function sixteenth() { return 60 / Seq.bpm / 4; }
function seqTick() {
  const now = AT();
  if (Seq.next < now - .25) Seq.next = now + .05;
  while (Seq.next < now + .12) {
    Seq.inStep = true; playStep(Seq.next); Seq.inStep = false;
    Seq.bpm += (Seq.target - Seq.bpm) * .05;
    Seq.next += sixteenth(); Seq.step++; Seq.mstep++;
  }
  if (Seq.events.length > 220) Seq.events.splice(0, Seq.events.length - 220);
}
function ev(t, k, v) { Seq.events.push({ t, k, v }); }
function playStep(t) {
  const ta = toAC(t);
  const on = !!A.ac, st = Seq.step % 16, bar = Math.floor(Seq.step / 16), ch = PROG[bar % 4], rt = ROOT[bar % 4], m = Seq.mode, ms = Seq.mstep;
  const kick = (p = 1) => { if (on) S.kick(ta, p); ev(t, 'kick', p); };
  if (st === 0) ev(t, 'bar', bar);
  const sw = st % 2 ? sixteenth() * .2 : 0; // swing for the boom-bap
  if (m === 'hub') { // boom-bap hip-hop, swung, dusty
    Seq.target = 92; const tt = t + sw;
    if (st === 0 || st === 7 || st === 10) kick(st === 0 ? .9 : .7);
    if (st === 4 || st === 12) { if (on) { S.snare(ta + (tt - t), .38); S.clap(ta + (tt - t), .18); } ev(t, 'snare', .5); }
    if (st % 2 === 0 && on) S.hat(ta + (tt - t), st % 4 === 2 ? .09 : .05);
    if (on && Math.random() < .35) S.crackle(ta + Math.random() * sixteenth());
    if (st === 0 && on) { S.keys(ta, ch.map(n => n + 12), sixteenth() * 14, .07); }
    if ((st === 0 || st === 10) && on) S.sub(ta, rt, sixteenth() * 5, .32);
    if (on && st === 14 && bar % 2 === 1) S.keys(ta + (tt - t), [ch[2] + 24], sixteenth() * 2, .05);
  } else if (m === 'dance') { // the monster's own home theme, played laid-back
    const T = Seq.home || SP_TRACK[0]; Seq.target = T.bpm;
    if (on) playTrack(T, st, bar, t, rt, ch, Seq.lesson ? 3 : 1, kick); else { if (T.k[st] !== '.') ev(t, 'kick', 1); if ('xc'.includes(T.s[st])) ev(t, 'snare', 1); }
  } else if (m === 'battle') { // one of 10 tracks, chosen per battle
    if (on) playTrack(Seq.track || TRACKS[TRACKS.length - 1], st, bar, t, rt, ch, Seq.level, kick); else { const T = Seq.track || TRACKS[9]; if (T.k[st] !== '.') ev(t, 'kick', 1); if ('xc'.includes(T.s[st])) ev(t, 'snare', 1); }
  } else if (m === 'build') {
    if (ms === 0) { ev(t, 'build'); if (on) { S.riser(ta, sixteenth() * 32, .45); S.crash(ta, .2); } }
    const every = ms < 8 ? 4 : ms < 16 ? 2 : 1;
    if (ms % every === 0) { if (on) S.snare(ta, .15 + ms / 32 * .5); ev(t, 'snare', .4 + ms / 32); }
    if (ms < 16 && (ms % 16 === 0 || ms % 16 === 10)) kick(.9);
    if (ms % 4 === 0 && on) S.reese(ta, ROOT[3] + 12 + Math.floor(ms / 4), sixteenth() * 3.5, .22 + ms / 32 * .15);
    if (ms === 0 && on) S.pad(ta, PROG[3].map(n => n + 12), sixteenth() * 32, .08);
    if (ms >= 31) seqMode('drop', { bpm: 174, onDone: Seq.onDone });
  } else if (m === 'chain') { // EDM pre-chorus: every landed rhyme tightens the roll and lifts the tempo
    const L = Math.min(3, Seq.chainLv || 0), s16 = ms % 16;
    if (ms === 0 && on) S.crash(ta, .2);
    if (s16 % 4 === 0) kick(L >= 2 ? .85 : 1);
    const every = [8, 4, 2, 1][L];
    if (ms % every === 0) { if (on) S.snare(ta, .1 + L * .1 + s16 / 16 * .08); ev(t, 'snare', .3 + L * .25); }
    if (on && s16 % 4 === 2) S.hat(ta, .08 + L * .02, L >= 2);
    if (on && L >= 1 && s16 % 2 === 1) S.hat(ta, .035 + L * .01);
    if (on && s16 === 0) S.pad(ta, PROG[Math.floor(ms / 16) % 4].map(n => n + 12 + L), sixteenth() * 16, .06 + L * .025);
    if (on && s16 % 4 === 0) S.reese(ta, ROOT[3] + 12 + L * 2 + Math.floor(s16 / 4), sixteenth() * 3, .12 + L * .06);
    if (on && s16 === 0 && L >= 1) S.riser(ta, sixteenth() * 16, .12 + L * .1);
  } else if (m === 'drop') { // dnb drop
    const bi = Math.floor(ms / 16) % 4, dch = PROG[bi], drt = ROOT[bi], s16 = ms % 16;
    if (ms === 0) { ev(t, 'drop'); if (on) S.impact(ta); }
    if (s16 === 0 && ms && on) S.crash(ta, .26);
    if (s16 === 0 || s16 === 10 || s16 === 6 && bi % 2) kick(1.2);
    if (s16 === 4 || s16 === 12) { if (on) { S.snare(ta, .7); S.clap(ta, .4); } ev(t, 'snare', 1.2); }
    if (on && (s16 === 7 || s16 === 9 || s16 === 15)) S.snare(ta, .14);
    if (on) S.hat(ta, ms % 2 ? .06 : .11, s16 % 8 === 6);
    if (on && s16 % 2 === 0) S.reese(ta, drt + 12 + (s16 % 8 === 6 ? 7 : 0), sixteenth() * 1.7, .34);
    if (on && s16 === 0) S.sub(ta, drt, sixteenth() * 9, .6);
    if (on && (s16 === 6 || s16 === 14)) S.stab(ta, dch.map(n => n + 12), .2);
    if (on && s16 % 4 === 2) S.ride(ta, .09);
    if (ms >= (Seq.dropLen || 64) - 1) { const cb = Seq.onDone; seqMode(Seq.after, { bpm: Seq.after === 'hub' ? 92 : (Seq.battleBpm || 160) }); if (cb) cb(); }
  }
  Seq.lastT = t; Seq.lastStep = Seq.step;
  if (Seq.hook) Seq.hook(Seq.step, t);
}

/* ---------- battle repertoire: 10 tracks, every one a different genre and tempo ----------
   16-step lanes: k kick (X strong) · s snare (x snare, c clap, g ghost) · h hats (x closed, s soft, o open) · p perc (r rim, h ride)
   b bass (0-9,a,b,c = semitones over the chord root, '-' = hold) · c chords (x hit, '-' hold) · m melody (digit = chord tone, 3+ = octave up) */
const TRACKS = [
  { id: 'BACKPACK CYPHER', g: 'BOOM BAP', bpm: 96, tr: 0, sw: .22, k: 'X......x..x.....', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.', p: '...........r....', b: '0-----.0..3---..', bv: 'bass', c: 'x-------........', cv: 'keys', m: '....4.....2...0.', mv: 'bell' },
  { id: 'LOG DRUM SUNSET', g: 'AMAPIANO', bpm: 112, tr: -2, sw: .12, k: 'x...x...x...x...', s: '....c.......c...', h: 's.ss.ss.s.ss.ss.', p: '..r..r....r..r..', b: '0..0.3.....7.5..', bv: 'log', c: 'x-------x-------', cv: 'pad', m: '..4...3...2...0.', mv: 'pluck' },
  { id: 'ROOFTOP HOUSE', g: 'HOUSE', bpm: 124, tr: 3, sw: 0, k: 'X...x...x...x...', s: '....c.......c...', h: '..o...o...o...o.', p: 'x.x.x.x.x.x.x.x.', b: '..0...0...0..c.0', bv: 'bass', c: 'x.....x...x.....', cv: 'stab', m: '', mv: '' },
  { id: 'NIGHT BUS 2-STEP', g: 'UK GARAGE', bpm: 131, tr: 5, sw: .2, k: 'X.........x..x..', s: '....x.......x...', h: '.ss..s.s.ss..s.s', p: '...r......r...r.', b: '0.....0.7...5...', bv: 'sub', c: 'x..x....x..x....', cv: 'keys', m: '2.....4.......0.', mv: 'pluck' },
  { id: 'ACID RUNNER', g: 'TECHNO', bpm: 136, tr: -5, sw: 0, k: 'X...x...x...x...', s: '....c.......c...', h: '..o...o...o...o.', p: 's.sss.sss.sss.ss', b: '0.0c0.30.c0.3.50', bv: 'acid', c: '', cv: '', m: '', mv: '' },
  { id: '808 SUPERSTAR', g: 'TRAP', bpm: 141, tr: -3, sw: 0, k: 'X.........X..x..', s: '........x.......', h: 'xsxsxsxsxsxsxxxx', p: '', b: '0---------0--3--', bv: '808', c: '', cv: '', m: '4...2...0...2...', mv: 'bell' },
  { id: 'GRIME TIME', g: 'DRILL', bpm: 146, tr: 1, sw: 0, k: 'X.....x...x.....', s: '........x.....g.', h: 'x..x..x.x..x..x.', p: '....r.......r...', b: '0.....0...3--.2.', bv: '808', c: '', cv: '', m: '0.2.4.2.0.2.5.4.', mv: 'pluck' },
  { id: 'HYPER RAVE', g: 'HYPERPOP RAVE', bpm: 153, tr: 2, sw: 0, k: 'X...X...X...X...', s: '....c.......c...', h: '..o...o...o...o.', p: '', b: '.0.0.0.0.0.0.0.0', bv: 'bass', c: 'x...x...x...x...', cv: 'saw', m: '4.4.5.4.2.2.0.2.', mv: 'pluck' },
  { id: 'FOOTWORK FRENZY', g: 'FOOTWORK', bpm: 160, tr: 4, sw: 0, k: 'X..x..x...x..x..', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.', p: '..r...r...r..r..', b: '0..0..0...3..3..', bv: 'sub', c: 'x.......x.......', cv: 'stab', m: '', mv: '' },
  { id: 'AMEN ROLLER', g: 'DRUM & BASS', bpm: 174, tr: 0, sw: 0, k: 'X.........X.....', s: '....x..g.g..x..g', h: 'xsxsxsxsxsxsxsxs', p: '..h...h...h...h.', b: '0-----..0-.3----', bv: 'reese', c: '......x.......x.', cv: 'stab', m: '', mv: '' },
];
/* ---------- one theme per monster: the genre grows with its line, the tempo rises with every evolution ---------- */
const STAGE_BPM = [[108], [118, 122, 126], [136, 138, 140, 142, 144, 146], [156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167], [184, 187, 190, 193, 196, 199, 202, 205]];
const LINE_GENRE = {
  N: ['BACKPACK CYPHER', 'BACKPACK CYPHER', 'ROOFTOP HOUSE', 'HYPER RAVE', 'AMEN ROLLER'],
  S: [null, null, null, 'GRIME TIME', 'AMEN ROLLER'],
  H: ['NIGHT BUS 2-STEP', 'NIGHT BUS 2-STEP', 'ACID RUNNER', 'FOOTWORK FRENZY', 'AMEN ROLLER'],
  L: ['LOG DRUM SUNSET', 'BACKPACK CYPHER', 'LOG DRUM SUNSET', '808 SUPERSTAR', 'AMEN ROLLER'],
};
const GENRE_JA = { 'BACKPACK CYPHER': 'LO-FI BOOM BAP', 'ROOFTOP HOUSE': 'HOUSE', 'HYPER RAVE': 'HYPER RAVE', 'AMEN ROLLER': 'DRUM & BASS', 'NIGHT BUS 2-STEP': 'UK GARAGE', 'ACID RUNNER': 'ACID TECHNO', 'FOOTWORK FRENZY': 'FOOTWORK', 'LOG DRUM SUNSET': 'AMAPIANO', 'GRIME TIME': 'DRILL' };
const BASS_ALT = ['0-----.0..3---..', '0...0.....5.3...', '0--.0--.3--.5-..', '0.......7...5.3.', '0-.0-.0-.3-.2-..', '0---..0---..3-5-'];
const HAT_ALT = ['x.x.x.x.x.x.x.x.', 'xsxsxsxsxsxsxsxs', 's.xs.xs.s.xs.xsx', 'x..x..x.x..x..x.'];
const SP_TRACK = (() => {
  const out = {}, byStage = [[], [], [], [], []];
  SP.filter(s => s.mode).forEach(s => byStage[s.vst ?? s.stage].push(s));
  byStage.forEach((list, st) => list.forEach((s, i) => {
    let seed = s.id * 9301 + 49297; const rnd = () => (seed = (seed * 233280 + 12345) % 2147483647) / 2147483647;
    const base = TRACKS.find(t => t.id === LINE_GENRE[s.secret ? 'S' : s.mode][st]) || TRACKS[0];
    const T = { ...base };
    T.bpm = STAGE_BPM[st][i % STAGE_BPM[st].length];
    T.tr = [0, -2, 3, 5, -5, -3, 1, 2, 4, -1, -4, 6][(s.id * 5) % 12];
    // every theme gets its own melody, and some swap chord colour / bassline / hats so siblings never sound alike
    const dens = st >= 3 ? .45 : .3; let m = '';
    const need = st >= 3 ? 6 : 4;
    for (let tries = 0; tries < 20; tries++) { m = ''; for (let k = 0; k < 16; k++) m += (k % 2 === 0 || rnd() < .25) && rnd() < dens ? String(Math.floor(rnd() * (st >= 3 ? 6 : 5))) : '.'; if (m.replace(/\./g, '').length >= need) break; }
    T.m = m; T.mv = T.mv || (rnd() < .5 ? 'pluck' : 'bell');
    if (rnd() < .5 && T.bv !== 'acid') T.b = BASS_ALT[Math.floor(rnd() * BASS_ALT.length)];
    if (rnd() < .4) T.h = HAT_ALT[Math.floor(rnd() * HAT_ALT.length)];
    if (T.cv && rnd() < .5) T.cv = ['keys', 'stab', 'pad', 'saw'][Math.floor(rnd() * 4)];
    if (s.mode === 'L' && st === 4) { T.bv = 'sub'; T.cv = 'pad'; T.mv = 'bell'; T.gx = 'LIQUID DNB'; }
    if (s.mode === 'H' && st === 4) { T.bv = '808'; T.gx = 'JUNGLE'; }
    if (s.secret) { T.cv = 'saw'; T.mv = 'bell'; T.c = 'x...x...x...x...'; }
    T.vis = base.id; T.id = `${s.name}のテーマ`; T.g = T.gx || GENRE_JA[base.id] || base.g; T.sp = s.id;
    out[s.id] = T;
  }));
  return out;
})();
function trackFor(sp) { return Seq.track = SP_TRACK[sp.id] || TRACKS[0]; }
// home (idle / dance) theme: the monster's own track, a bit slower so the room breathes
function homeFor(sp) { const T = SP_TRACK[sp.id] || SP_TRACK[0]; return Seq.home = { ...T, bpm: Math.max(84, Math.min(132, Math.round(T.bpm * .78))) }; }
// battle songs: any of the 10 genres, a fresh key and melody every time — only the tempo belongs to the monster (it rises as it evolves)
function songFor(sp) {
  const own = SP_TRACK[sp.id] || SP_TRACK[0], pool = TRACKS.filter(t => t.id !== Seq.lastTpl), base = pool[Math.floor(Math.random() * pool.length)];
  const T = { ...base, vis: base.id, bpm: own.bpm, tr: Math.floor(Math.random() * 12) - 6 }; Seq.lastTpl = base.id;
  const st = sp.vst ?? sp.stage, need = st >= 3 ? 6 : 4; let m = '';
  for (let tries = 0; tries < 20; tries++) { m = ''; for (let k = 0; k < 16; k++) m += (k % 2 === 0 || Math.random() < .25) && Math.random() < .38 ? String(Math.floor(Math.random() * 6)) : '.'; if (m.replace(/\./g, '').length >= need) break; }
  T.m = m; T.mv = T.mv || (Math.random() < .5 ? 'pluck' : 'bell');
  if (Math.random() < .5 && T.bv !== 'acid') T.b = BASS_ALT[Math.floor(Math.random() * BASS_ALT.length)];
  if (Math.random() < .35) T.h = HAT_ALT[Math.floor(Math.random() * HAT_ALT.length)];
  if (T.cv && Math.random() < .5) T.cv = ['keys', 'stab', 'pad', 'saw'][Math.floor(Math.random() * 4)];
  return Seq.track = T;
}
function pickTrack() { const pool = TRACKS.filter(t => t !== Seq.track); Seq.track = pool[Math.floor(Math.random() * pool.length)]; return Seq.track; }
const runLen = (str, i) => { let n = 1; while (str && str[i + n] === '-') n++; return n; };
const OFF = c => c === 'a' ? 10 : c === 'b' ? 11 : c === 'c' ? 12 : +c;
function playTrack(T, st, bar, t, rt, ch, L, kick) {
  const tp = T.tr || 0, r0 = rt + tp, chord = ch.map(n => n + tp), s16 = sixteenth();
  const tt = toAC(t + (st % 2 ? s16 * (T.sw || 0) : 0)), at = str => str ? str[st] || '.' : '.';
  const k = at(T.k); if (k !== '.') kick(k === 'X' ? 1.1 : .9);
  const s = at(T.s); if (s === 'x' || s === 'c') { if (s === 'x') S.snare(tt, .6); else S.clap(tt, .55); if (L >= 1 && s === 'x') S.clap(tt, .2); ev(t, 'snare', 1); } else if (s === 'g') S.snare(tt, .11);
  const h = at(T.h); if (h === 'x') S.hat(tt, L >= 1 ? .1 : .075); else if (h === 's') S.hat(tt, .045); else if (h === 'o') S.hat(tt, .09, true);
  const p = at(T.p); if (p === 'r') S.rim(tt, .12); else if (p === 'h') S.ride(tt, .075); else if (p === 's') S.hat(tt, .035);
  const b = at(T.b);
  if (b !== '.' && b !== '-') { const n = r0 + OFF(b), d = s16 * runLen(T.b, st) * .95;
    if (T.bv === 'reese') S.reese(tt, n + 12, d, .3); else if (T.bv === 'sub') S.sub(tt, n, d, .55); else if (T.bv === 'acid') S.acid(tt, n + 12, s16 * .9, st % 4 === 2, 600 + L * 260);
    else if (T.bv === '808') { S.sub(tt, n, d, .62); S.bass(tt, n + 12, Math.min(d, s16 * 2), .12, 'triangle'); } else if (T.bv === 'log') S.pluck(tt, n, .26, s16 * 2.4); else S.bass(tt, n + 12, d, .4); }
  const c = at(T.c);
  if (c === 'x') { const d = s16 * runLen(T.c, st);
    if (T.cv === 'stab') S.stab(tt, chord.map(n => n + 12), .15); else if (T.cv === 'keys') S.keys(tt, chord, d, .07); else if (T.cv === 'pad') S.pad(tt, chord, d, .06); else if (T.cv === 'saw') S.saw(tt, chord.map(n => n + 12), s16 * 1.6, .07); else S.pluck(tt, chord[0] + 12, .1); }
  const m = at(T.m);
  if (m !== '.' && m !== '-') { const i = +m, n = chord[i % 3] + 12 * Math.floor(i / 3) + 12; if (T.mv === 'bell') S.bell(tt, n, .08, .5); else S.pluck(tt, n, .1, .22); }
  // the gauge drives intensity on top of any track
  if (L >= 2 && st % 4 === 2 && !T.p.includes('h')) S.ride(tt, .06);
  if (L >= 3 && (st === 6 || st === 14) && T.cv !== 'stab') S.stab(tt, chord.map(n => n + 12), .12);
  if (L >= 4 && bar % 2 === 1 && st >= 12) { S.snare(tt, .14 + (st - 12) * .06); ev(t, 'snare', .5); }
  if (L >= 4 && bar % 4 === 3 && st === 0) S.riser(tt, s16 * 16, .18);
}
/* ---------- rap voice: a vowel-formant synth so rhymes are audible ---------- */
const FORM = { a: [820, 1250], i: [300, 2300], u: [360, 1350], e: [520, 1900], o: [470, 850], n: [260, 1000] };
function consonantOf(m) { const c = m[0]; if ('かきくけこ'.includes(c)) return [2600, .028, .5]; if ('さしすせそ'.includes(c)) return [6200, .06, .35]; if ('たちつてと'.includes(c)) return [4200, .02, .6]; if ('はひふへほ'.includes(c)) return [1800, .05, .25]; if ('ぱぴぷぺぽ'.includes(c)) return [900, .015, .7]; return null; }
function sing(t, n) {
  if (!A.ac || n.v === 'q') return;
  const d = Math.max(.07, n.dur || .12), f0 = midi(n.pitch), fm = FORM[n.v] || FORM.a;
  const bus = G_(), g = G_(); env(g, t, .006, (n.acc ? .5 : .34) * (n.slot ? 1.15 : 1), d * .9, d * .25);
  const o1 = O(n.opp ? 'square' : 'sawtooth', f0, t, d + .1), o2 = O(n.opp ? 'triangle' : 'square', f0 * (n.slot ? 2.003 : n.opp ? .5 : 1.004), t, d + .1);
  o1.frequency.setValueAtTime(f0 * (n.acc ? 1.06 : 1.02), t); o1.frequency.exponentialRampToValueAtTime(f0, t + .05);
  const mixg = G_(n.slot ? .45 : .25); o2.connect(mixg); o1.connect(bus); mixg.connect(bus);
  const fk = n.opp ? .86 : 1, b1 = F('bandpass', fm[0] * fk, 7), b2 = F('bandpass', fm[1] * fk, 9), b3 = F('lowpass', 3500, .7), g1 = G_(1.6), g2 = G_(1.0), g3 = G_(.18);
  bus.connect(b1); bus.connect(b2); bus.connect(b3); b1.connect(g1); b2.connect(g2); b3.connect(g3); g1.connect(g); g2.connect(g); g3.connect(g);
  g.connect(A.music); const s = G_(n.slot ? .45 : .2); g.connect(s); s.connect(A.rev);
  const c = consonantOf(n.m || ''); if (c) { const nz = N(Math.max(0, t - .01), c[1]), cg = G_(); env(cg, Math.max(0, t - .01), .002, c[2] * .35, c[1]); chain(nz, F('bandpass', c[0], 2), cg, A.music); }
}
/* ---------- sfx ---------- */
const SFX = {
  chirp(p = 0) { if (!A.ac) return; const t = ACT(), f = 700 + p * 60 + Math.random() * 200; const o = O('sine', f, t, .2), g = G_(); o.frequency.exponentialRampToValueAtTime(f * (1.6 + Math.random() * .6), t + .08); o.frequency.exponentialRampToValueAtTime(f * 1.1, t + .18); env(g, t, .005, .16, .18); chain(o, g, A.sfx); },
  boing() { if (!A.ac) return; const t = ACT(), o = O('triangle', 180, t, .4), g = G_(); o.frequency.exponentialRampToValueAtTime(620, t + .12); o.frequency.exponentialRampToValueAtTime(260, t + .35); env(g, t, .005, .25, .35); chain(o, g, A.sfx); },
  spin() { if (!A.ac) return; const t = ACT(); for (let i = 0; i < 6; i++) { const o = O('sine', 500 + i * 140, t + i * .05, .1), g = G_(); env(g, t + i * .05, .002, .08, .08); chain(o, g, A.sfx); } },
  pop(n = 0) { if (!A.ac) return; const t = ACT(), o = O('sine', 900 + n * 30, t, .08), g = G_(); o.frequency.exponentialRampToValueAtTime(300, t + .07); env(g, t, .001, .2, .07); chain(o, g, A.sfx); },
  purr() { if (!A.ac) return; const t = ACT(), o = O('sawtooth', 70 + Math.random() * 10, t, .2), g = G_(), f = F('lowpass', 350); env(g, t, .02, .12, .16); chain(o, f, g, A.sfx); },
  nom(i) { if (!A.ac) return; const t = ACT(), f = midi(72 + [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24][i % 11]); const o = O('square', f, t, .12), g = G_(), fl = F('lowpass', 2200); env(g, t, .002, .1, .1); chain(o, fl, g, A.sfx); const n = N(t, .05), g2 = G_(); env(g2, t, .001, .12, .04); chain(n, F('bandpass', 900, 2), g2, A.sfx); },
  // the hit lands on the beat, in the song's key: chord tones of the current bar, climbing with the combo
  grade(g) { if (!A.ac) return; if (g <= 0) return; const s16 = sixteenth(), tq = Seq.next + (Seq.step % 2 ? 0 : s16), t = Math.max(ACT(), toAC(tq)), tr = (Seq.track && Seq.track.tr) || 0;
    const ch = PROG[Math.floor(Seq.step / 16) % 4].map(n => n + tr + 12), tones = [...ch, ...ch.map(n => n + 12), ...ch.map(n => n + 24), ...ch.map(n => n + 36)], c0 = Math.min(4, Math.floor(((G && G.combo) || 0) / 3));
    for (let i = 0; i < Math.min(g, 4); i++) S.bell(t + i * s16 * .5, tones[c0 + i], .1, .45);
    if (g >= 4) S.stab(t, ch.map(n => n + 12), .16); if (g === 5) { S.crash(t, .16); for (let i = 0; i < 6; i++) S.bell(t + s16 * 2 + i * s16 * .25, tones[c0 + 2 + (i % 4)] + 12, .05, .35); } },
  // crowd: a wash of band-passed noise (voices), random whistles, scattered claps — bigger p = bigger cheer
  crowd(p = 1) { if (!A.ac) return; if (p >= .4) SFX.woo(p); const t = ACT(), d = 1.1 + p * 1.1;
    [[650, .9], [1300, 1.2], [2600, 1.6]].forEach(([f, q], i) => { const n = N(t, d + .3), g = G_(); g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(.16 * p * (i === 1 ? 1.2 : .8), t + .14 + i * .03); g.gain.exponentialRampToValueAtTime(.0001, t + d); const bp = F('bandpass', f, q); bp.frequency.linearRampToValueAtTime(f * 1.25, t + .25); bp.frequency.linearRampToValueAtTime(f, t + d); chain(n, bp, g, A.sfx); });
    for (let i = 0; i < Math.round(3 + p * 5); i++) { const t0 = t + Math.random() * .6, f = 1700 + Math.random() * 1100, o = O('sine', f, t0, .5), g = G_(); o.frequency.linearRampToValueAtTime(f * 1.35, t0 + .18); o.frequency.exponentialRampToValueAtTime(f * .8, t0 + .45); env(g, t0, .03, .03 * p, .4); chain(o, g, A.sfx); }
    for (let i = 0; i < Math.round(18 * p); i++) { const t0 = t + .05 + Math.random() * d * .8, n = N(t0, .03), g = G_(); env(g, t0, .001, .07 * p * Math.random(), .03); chain(n, F('bandpass', 1500 + Math.random() * 900, 1.5), g, A.sfx); } },
  // a crowd going "うおーー!": a few dozen voices, each a buzzy glottal tone shaped by u→o→a formants, with vibrato and scattered onsets
  woo(p = 1) { if (!A.ac) return; const t = ACT(), n = Math.round(8 + p * 14), dur = .9 + p * .7, out = G_(.0001); out.gain.setValueAtTime(.0001, t); out.gain.linearRampToValueAtTime(.32 * Math.min(1.4, p), t + .12); out.gain.setValueAtTime(.32 * Math.min(1.4, p), t + dur * .6); out.gain.exponentialRampToValueAtTime(.0001, t + dur + .5); out.connect(A.sfx);
    const F1 = F('bandpass', 330, 3), F2 = F('bandpass', 760, 4), F3 = F('bandpass', 2600, 6), g1 = G_(1), g2 = G_(.7), g3 = G_(.15), bus = G_(1);
    [[F1, 330, 560], [F2, 760, 1000]].forEach(([f, a0, a1]) => { f.frequency.setValueAtTime(a0, t); f.frequency.linearRampToValueAtTime((a0 + a1) / 2, t + .3); f.frequency.linearRampToValueAtTime(a1, t + dur); });
    bus.connect(F1); bus.connect(F2); bus.connect(F3); F1.connect(g1); F2.connect(g2); F3.connect(g3); g1.connect(out); g2.connect(out); g3.connect(out);
    for (let i = 0; i < n; i++) { const t0 = t + Math.random() * .22, base = (i % 3 ? 120 + Math.random() * 90 : 220 + Math.random() * 120), o = O('sawtooth', base, t0, dur + .5), vg = G_(.0001);
      o.frequency.setValueAtTime(base * .92, t0); o.frequency.linearRampToValueAtTime(base * 1.12, t0 + .25); o.frequency.linearRampToValueAtTime(base * (1.02 + Math.random() * .1), t0 + dur);
      const lfo = O('sine', 5 + Math.random() * 2, t0, dur + .5), lg = G_(base * .03); lfo.connect(lg); lg.connect(o.frequency);
      vg.gain.setValueAtTime(.0001, t0); vg.gain.linearRampToValueAtTime(.09, t0 + .08); vg.gain.exponentialRampToValueAtTime(.0001, t0 + dur * (.8 + Math.random() * .4)); o.connect(vg); vg.connect(bus); }
    const br = N(t, dur), bg = G_(.0001); bg.gain.setValueAtTime(.0001, t); bg.gain.linearRampToValueAtTime(.05 * p, t + .1); bg.gain.exponentialRampToValueAtTime(.0001, t + dur); chain(br, F('bandpass', 1400, .8), bg, out);
  },
  aww() { if (!A.ac) return; const t = ACT(); const n = N(t, 1.6), g = G_(), bp = F('bandpass', 700, 1.2); bp.frequency.exponentialRampToValueAtTime(380, t + 1.4); g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(.18, t + .2); g.gain.exponentialRampToValueAtTime(.0001, t + 1.5); chain(n, bp, g, A.sfx); },
  drumroll(dur = 1.6) { if (!A.ac) return; const t = ACT(); for (let k = 0; k < dur / .045; k++) { const t0 = t + k * .045, n = N(t0, .04), g = G_(); env(g, t0, .001, .05 + k * .0025, .035); chain(n, F('bandpass', 2200, .8), g, A.sfx); } },
  gong() { if (!A.ac) return; const t = ACT(); [82, 123, 164, 247].forEach((f, i) => { const o = O('sine', f, t, 2.4), g = G_(); env(g, t, .004, .22 / (i + 1), 2.2); chain(o, g, A.sfx); }); const n = N(t, .3), g = G_(); env(g, t, .001, .3, .25); chain(n, F('lowpass', 1800), g, A.sfx); },
  miss() { if (!A.ac) return; const t = ACT(); [0, 6].forEach(d => { const o = O('sawtooth', 220, t, .5), g = G_(); o.detune.value = d * 10; o.frequency.exponentialRampToValueAtTime(70, t + .45); env(g, t, .005, .12, .45); chain(o, F('lowpass', 1200), g, A.sfx); }); },
  tick() { if (!A.ac) return; const t = ACT(), o = O('square', 1500, t, .04), g = G_(); env(g, t, .001, .05, .03); chain(o, g, A.sfx); },
  type() { if (!A.ac) return; const t = ACT(), n = N(t, .02), g = G_(); env(g, t, .001, .06, .015); chain(n, F('bandpass', 3000 + Math.random() * 2000, 3), g, A.sfx); },
  milestone() { if (!A.ac) return; const t = ACT(); [0, 4, 7, 12, 16, 19, 24].forEach((d, i) => S.bell(t + i * .045, 72 + d, .09, .5)); S.crash(t, .12); },
  scratch() { if (!A.ac) return; const t = ACT(), n = N(t, .5), f = F('bandpass', 600, 4), g = G_(); f.frequency.setValueAtTime(400, t); f.frequency.exponentialRampToValueAtTime(3500, t + .12); f.frequency.exponentialRampToValueAtTime(300, t + .3); f.frequency.exponentialRampToValueAtTime(2500, t + .42); env(g, t, .01, .35, .45); chain(n, f, g, A.sfx); },
  hit(q) { if (!A.ac) return; const t = ACT(); S.pluck(t, [0, 72, 76, 79, 84][q] || 72, .14, .12); if (q >= 3) S.hat(t, .18, true); },
  ui() { if (!A.ac) return; const t = ACT(), o = O('sine', 660, t, .08), g = G_(); o.frequency.exponentialRampToValueAtTime(990, t + .05); env(g, t, .002, .1, .07); chain(o, g, A.sfx); },
};
