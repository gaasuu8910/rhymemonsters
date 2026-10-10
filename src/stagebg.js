/* =========================================================
   STAGE BG — original motion graphics drawn live into the reel canvas
   · hub: five tournament venues (one per round), tinted by the cup
   · battle: one visual language per song template, built around the rhyme words
   ========================================================= */
const STAGEBG = (() => {
const cv = REEL.canvas, ctx = cv.getContext('2d'), W = 1920, H = 1080, PI = Math.PI, TAU = PI * 2;
const FD = '"Bricolage Grotesque", "Arial Black", sans-serif', FM = '"Martian Mono", ui-monospace, monospace', FJ = '"Dela Gothic One", "Hiragino Sans", sans-serif';
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), lerp = (a, b, t) => a + (b - a) * t;
const outBack = t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const outExpo = t => t >= 1 ? 1 : 1 - Math.pow(2, -10 * t), outCubic = t => 1 - Math.pow(1 - t, 3);
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const hash = (i, k = 0) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
const hex = (h, a = 1) => { const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; };
function begin() { const s = cv.width / W; ctx.setTransform(s, 0, 0, s, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.letterSpacing = '0px'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.shadowBlur = 0; }
function layer(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }
function rrect(x, y, w, h, r, c = ctx) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
// visible window of the 16:9 canvas on this screen (portrait phones only see the middle strip)
let VX0 = 0, VX1 = W;
const vx = f => lerp(VX0, VX1, f);

/* ---------- palettes per cup ---------- */
const PAL = {
  N: { sky: ['#1E0E3D', '#7B2C8F', '#FF6A3D'], neon: '#FF4D8D', acc: '#FFC93D', cool: '#56D9F5', ink: '#140A24' },
  H: { sky: ['#030A1E', '#0C2E73', '#1C7BD6'], neon: '#3FA7F5', acc: '#56F5D9', cool: '#FFFFFF', ink: '#040B1C' },
  L: { sky: ['#12061F', '#4A1C7A', '#C46BDB'], neon: '#B36BFF', acc: '#FFB3F0', cool: '#7DE3FF', ink: '#0E0518' },
  S: { sky: ['#140802', '#6B2A0E', '#F0A030'], neon: '#FFC93D', acc: '#FFE9A8', cool: '#FF8FB1', ink: '#120804' },
};
function skyGrad(p, c = ctx, h = H) { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, p.sky[0]); g.addColorStop(.55, p.sky[1]); g.addColorStop(1, p.sky[2]); return g; }

/* ---------- reusable bits ---------- */
const STARS = Array.from({ length: 220 }, (_, i) => ({ x: hash(i, 1) * W, y: hash(i, 2) * H * .6, r: .8 + hash(i, 3) * 2.2, p: hash(i, 4) * TAU }));
function stars(t, a = 1) { for (const s of STARS) { const tw = .4 + .6 * Math.abs(Math.sin(t * 1.3 + s.p)); ctx.globalAlpha = tw * a; ctx.fillStyle = '#FFFFFF'; ctx.fillRect(s.x, s.y, s.r, s.r); } ctx.globalAlpha = 1; }
function halftone(c, x0, y0, w, h, col, step, f) { c.fillStyle = col; for (let y = y0; y < y0 + h; y += step) for (let x = x0 + ((y / step) % 2 ? step / 2 : 0); x < x0 + w; x += step) { const r = f(x, y) * step * .48; if (r > .3) { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); } } }
// chunky graffiti tag: fat outline, inner fill, drips
function graffiti(c, text, x, y, size, fill, line, rot) {
  c.save(); c.translate(x, y); c.rotate(rot); c.font = `400 ${size}px ${FJ}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
  c.strokeStyle = '#0B0B14'; c.lineWidth = size * .32; c.strokeText(text, size * .06, size * .08);
  c.strokeStyle = line; c.lineWidth = size * .2; c.strokeText(text, 0, 0);
  const g = c.createLinearGradient(0, -size / 2, 0, size / 2); g.addColorStop(0, '#FFFFFF'); g.addColorStop(.35, fill); g.addColorStop(1, fill); c.fillStyle = g; c.fillText(text, 0, 0);
  const w = c.measureText(text).width, r = rng(text.length * 31 + size);
  c.fillStyle = line; for (let i = 0; i < 7; i++) { const dx = (r() - .5) * w * .9, len = size * (.2 + r() * .7); c.fillRect(dx, size * .3, size * .05, len); c.beginPath(); c.arc(dx + size * .025, size * .3 + len, size * .045, 0, TAU); c.fill(); }
  c.fillStyle = 'rgba(255,255,255,.85)'; for (let i = 0; i < 5; i++) { c.beginPath(); c.arc((r() - .5) * w * .8, -size * .22, size * .03, 0, TAU); c.fill(); }
  c.restore();
}
// dot-matrix text: render once, sample, then draw as LED dots
const DM = {};
function dotText(text, rows = 16) {
  const k = text + rows; if (DM[k]) return DM[k];
  const [c, x] = layer(10, rows); x.font = `400 ${rows * .95}px ${FJ}`; const w = Math.ceil(x.measureText(text).width) + rows; c.width = w; x.font = `400 ${rows * .95}px ${FJ}`; x.fillStyle = '#fff'; x.textBaseline = 'middle'; x.fillText(text, rows / 2, rows / 2 + 1);
  const d = x.getImageData(0, 0, w, rows).data, on = new Uint8Array(w * rows); for (let i = 0; i < w * rows; i++) on[i] = d[i * 4 + 3] > 110 ? 1 : 0;
  return DM[k] = { w, h: rows, on };
}
function ledBoard(text, x, y, cols, rows, cell, col, scroll, t) {
  const m = dotText(text, rows); ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(x - cell, y - cell, cols * cell + cell * 2, rows * cell + cell * 2);
  const off = Math.floor(scroll) % (m.w + cols);
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const sx = i - cols + off, lit = sx >= 0 && sx < m.w && m.on[j * m.w + sx];
    ctx.fillStyle = lit ? col : 'rgba(255,255,255,.06)'; ctx.beginPath(); ctx.arc(x + i * cell + cell / 2, y + j * cell + cell / 2, cell * (lit ? .42 : .3), 0, TAU); ctx.fill();
  }
}
function beam(x, y, ang, len, w, col, a) {
  const g = ctx.createLinearGradient(x, y, x + Math.cos(ang) * len, y + Math.sin(ang) * len); g.addColorStop(0, hex(col, a)); g.addColorStop(1, hex(col, 0));
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x, y);
  ctx.lineTo(x + Math.cos(ang - w) * len, y + Math.sin(ang - w) * len); ctx.lineTo(x + Math.cos(ang + w) * len, y + Math.sin(ang + w) * len); ctx.closePath(); ctx.fill();
}
function crowd(y0, n, col, t, beat, kick, hands = .5, seed = 1) {
  ctx.fillStyle = col;
  for (let i = 0; i < n; i++) {
    const x = lerp(VX0 - 40, VX1 + 40, (i + hash(i, seed) * .6) / n), sc = .8 + hash(i, seed + 1) * .5, ph = hash(i, seed + 2) * TAU;
    const bob = Math.abs(Math.sin(beat * PI + ph * .3)) * 14 * sc + kick * 6, y = y0 - bob + hash(i, seed + 3) * 30;
    ctx.beginPath(); ctx.arc(x, y - 52 * sc, 24 * sc, 0, TAU); ctx.fill();
    rrect(x - 36 * sc, y - 30 * sc, 72 * sc, 140 * sc, 28 * sc); ctx.fill();
    if (hash(i, seed + 4) < hands) { const up = Math.sin(beat * PI * .5 + ph) * .25; ctx.save(); ctx.translate(x + 26 * sc, y - 20 * sc); ctx.rotate(-.35 + up); rrect(-8 * sc, -95 * sc, 16 * sc, 95 * sc, 8 * sc); ctx.fill(); ctx.restore(); }
  }
}

/* =========================================================
   HUB VENUES
   ========================================================= */
const ST = { last: 0, fw: [], flash: [], conf: [], stick: [], lastBar: -1, lastBeat: -1, key: '' };
let staticLayer = null;
function buildStatic(v, p) {
  const [c, x] = layer(960, 540); x.scale(.5, .5);
  x.fillStyle = skyGrad(p, x); x.fillRect(0, 0, W, H);
  if (v === 0) { // under the elevated railway: brick walls, graffiti, posters
    // far city
    x.fillStyle = hex(p.sky[0], .55); for (let i = 0; i < 40; i++) { const bw = 40 + hash(i, 9) * 90, bh = 120 + hash(i, 8) * 260; x.fillRect(i * 50 - 20, 760 - bh, bw, bh + 40); }
    // sun with retro cuts
    const sx = W / 2, sy = 520; const g = x.createLinearGradient(0, sy - 330, 0, sy + 330); g.addColorStop(0, '#FFE066'); g.addColorStop(1, p.neon); x.fillStyle = g; x.beginPath(); x.arc(sx, sy, 330, 0, TAU); x.fill();
    x.fillStyle = skyGrad(p, x); for (let i = 0; i < 9; i++) x.fillRect(sx - 340, sy + 40 + i * 34, 680, 6 + i * 2.2);
    // walls
    [[0, 330, 640], [W - 640, 330, 640]].forEach(([wx, wy, ww], side) => {
      x.fillStyle = '#5A2A2E'; x.fillRect(wx, wy, ww, H - wy);
      for (let r = 0; r * 34 < H - wy; r++) for (let k = -1; k * 78 < ww; k++) { const bx = wx + k * 78 + (r % 2 ? 39 : 0), by = wy + r * 34; x.fillStyle = `hsl(${4 + hash(r * 40 + k, side) * 12},${38 + hash(k, r) * 18}%,${24 + hash(r, k + side) * 12}%)`; x.fillRect(bx + 3, by + 3, 72, 28); }
      x.fillStyle = 'rgba(0,0,0,.35)'; x.fillRect(side ? wx : wx + ww - 30, wy, 30, H - wy);
    });
    graffiti(x, 'ライム', 300, 560, 170, p.acc, p.neon, -.12);
    graffiti(x, 'RHYME', W - 320, 520, 150, p.cool, '#FF4D1A', .1);
    graffiti(x, '韻', 160, 860, 210, '#FFFFFF', p.neon, .2);
    graffiti(x, 'MIC', W - 200, 850, 130, p.acc, '#2438FF', -.15);
    // posters
    [[470, 760, -.05, '#F3EFE6', 'CYPHER'], [W - 520, 700, .06, p.acc, 'TONIGHT']].forEach(([px, py, r, col, tx]) => { x.save(); x.translate(px, py); x.rotate(r); x.fillStyle = col; x.fillRect(-80, -110, 160, 220); x.fillStyle = '#0B0B14'; x.font = `800 30px ${FD}`; x.textAlign = 'center'; x.fillText(tx, 0, -50); x.fillRect(-60, -20, 120, 90); x.fillStyle = col; x.beginPath(); x.arc(0, 25, 30, 0, TAU); x.fill(); x.restore(); });
    // elevated deck
    x.fillStyle = '#2A2238'; x.fillRect(0, 150, W, 120); x.fillStyle = '#3A3050'; x.fillRect(0, 150, W, 18); x.fillStyle = '#1A1426'; x.fillRect(0, 252, W, 22);
    for (let i = 0; i < 24; i++) { x.fillStyle = 'rgba(255,255,255,.15)'; x.beginPath(); x.arc(40 + i * 80, 210, 5, 0, TAU); x.fill(); }
    [[150], [W - 150]].forEach(([px]) => { x.fillStyle = '#2A2238'; x.fillRect(px - 60, 270, 120, H); x.fillStyle = 'rgba(0,0,0,.3)'; x.fillRect(px + 30, 270, 30, H); });
    // ground
    x.fillStyle = '#1A1220'; x.fillRect(0, 960, W, 120);
  }
  if (v === 1) { // rooftop: three skyline layers
    [[.35, 620, 220, 16], [.65, 760, 300, 24], [1, 900, 380, 34]].forEach(([dk, base, maxh, n], L) => {
      for (let i = 0; i < n; i++) { const bw = W / n * (1.1 + hash(i, L) * .6), bx = i * W / n - 20, bh = maxh * (.35 + hash(i, L + 5) * .65);
        x.fillStyle = `rgba(${10 + L * 4},${8 + L * 3},${30 + L * 6},${.55 + dk * .45})`; x.fillRect(bx, base - bh, bw, bh + 200);
        if (L === 0) { x.fillStyle = hex(p.cool, .25); for (let wy = base - bh + 14; wy < base; wy += 22) for (let wx = bx + 8; wx < bx + bw - 10; wx += 16) if (hash(wx, wy) < .3) x.fillRect(wx, wy, 6, 9); }
      } });
    // water tower
    const tx = W - 300, ty = 520; x.fillStyle = '#0E0A1C'; x.fillRect(tx - 70, ty, 140, 150); x.beginPath(); x.moveTo(tx - 80, ty); x.lineTo(tx, ty - 60); x.lineTo(tx + 80, ty); x.fill(); for (let i = -1; i <= 1; i += 2) x.fillRect(tx + i * 55 - 5, ty + 150, 10, 200);
    // rooftop ledge + railing
    x.fillStyle = '#0A0714'; x.fillRect(0, 930, W, 150); x.fillStyle = '#1C1530'; x.fillRect(0, 920, W, 14);
    x.strokeStyle = '#1C1530'; x.lineWidth = 6; x.beginPath(); x.moveTo(0, 860); x.lineTo(W, 860); x.stroke(); for (let i = 0; i < W; i += 60) { x.beginPath(); x.moveTo(i, 860); x.lineTo(i, 925); x.stroke(); }
  }
  if (v === 2) { // underground club
    x.fillStyle = '#07050D'; x.fillRect(0, 0, W, H);
    x.fillStyle = hex(p.neon, .08); x.fillRect(0, 0, W, H);
    // truss
    x.strokeStyle = '#2A2440'; x.lineWidth = 6; x.strokeRect(-10, 90, W + 20, 60); x.lineWidth = 3; x.beginPath(); for (let i = 0; i < W; i += 60) { x.moveTo(i, 90); x.lineTo(i + 30, 150); x.lineTo(i + 60, 90); } x.stroke();
    // speaker stacks
    [VX0 + 30, VX1 - 290].forEach(sx => { for (let k = 0; k < 3; k++) { const by = 420 + k * 210; x.fillStyle = '#121019'; rrect(sx, by, 260, 200, 14, x); x.fill(); x.strokeStyle = '#2B2740'; x.lineWidth = 4; x.stroke(); } });
    // floor glow
    const g = x.createRadialGradient(W / 2, H, 50, W / 2, H, 900); g.addColorStop(0, hex(p.neon, .35)); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, W, H);
  }
  if (v === 3) { // arena: tiered seating + big screen frame
    x.fillStyle = '#05040B'; x.fillRect(0, 0, W, H);
    for (let r = 0; r < 7; r++) { x.strokeStyle = `rgba(255,255,255,${.04 + r * .012})`; x.lineWidth = 46; x.beginPath(); x.ellipse(W / 2, 1150, 1100 + r * 120, 520 + r * 85, 0, PI * 1.02, PI * 1.98); x.stroke(); }
    x.fillStyle = '#100E1C'; rrect(W / 2 - 520, 40, 1040, 300, 18, x); x.fill(); x.strokeStyle = '#2A2640'; x.lineWidth = 10; x.stroke();
    x.fillStyle = '#16131F'; x.fillRect(W / 2 - 12, 0, 24, 40);
  }
  if (v === 4) { // stadium bowl under a night sky
    x.fillStyle = skyGrad({ sky: ['#02020A', p.sky[0], p.sky[1]] }, x); x.fillRect(0, 0, W, H);
    for (let r = 0; r < 9; r++) { x.fillStyle = `rgba(${12 + r * 3},${10 + r * 2},${24 + r * 4},1)`; x.beginPath(); x.ellipse(W / 2, 1100, 1500 - r * 70, 720 - r * 52, 0, PI, TAU); x.fill(); }
    x.strokeStyle = '#3A3550'; x.lineWidth = 16; x.beginPath(); x.ellipse(W / 2, 1100, 1520, 740, 0, PI * 1.05, PI * 1.95); x.stroke();
    // light towers
    [VX0 + 140, VX1 - 140].forEach(lx => { x.fillStyle = '#14121E'; x.fillRect(lx - 10, 120, 20, 500); x.fillStyle = '#E9E6F5'; for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) x.fillRect(lx - 45 + j * 32, 80 + i * 22, 26, 16); });
  }
  return c;
}
const WIN1 = (() => { const out = [], r = rng(5); for (let i = 0; i < 26; i++) { const bx = i * W / 24 - 20, bw = W / 24 * (1.1 + r() * .6), bh = 300 * (.35 + r() * .65); for (let wy = 760 - bh + 16; wy < 760; wy += 28) for (let wx = bx + 10; wx < bx + bw - 12; wx += 22) out.push([wx, wy, i]); } return out; })();

function hub(o) {
  begin();
  const p = PAL[o.mode] || PAL.N, v = o.venue | 0, t = o.t, kick = o.kick || 0, beat = o.beat || 0, bar = Math.floor(beat / 4);
  const vis = clamp(o.vis ?? 1, .25, 1); VX0 = W / 2 - W * vis / 2; VX1 = W / 2 + W * vis / 2;
  const key = v + o.mode + Math.round(vis * 20); if (key !== ST.key || !staticLayer) { ST.key = key; staticLayer = buildStatic(v, p); ST.fw = []; ST.stick = []; }
  const dt = Math.min(.1, Math.max(0, t - ST.last)); ST.last = t;
  const newBeat = Math.floor(beat) !== ST.lastBeat; ST.lastBeat = Math.floor(beat); const newBar = bar !== ST.lastBar; ST.lastBar = bar;
  ctx.drawImage(staticLayer, 0, 0, W, H);
  const words = (o.words && o.words.length ? o.words : ['ライム', 'モンスター', '韻を踏め', 'フロウ', 'パンチライン', 'バース']);

  if (v === 0) { // ---------- STREET
    // train over the deck every 8 bars
    const tp = ((beat / 32) % 1) * 1.6 - .3;
    if (tp > -.3 && tp < 1.3) { const tx = lerp(-1400, W + 200, tp); for (let k = 0; k < 4; k++) { const cx = tx + k * 330; ctx.fillStyle = '#C9C3D9'; rrect(cx, 92, 320, 62, 10); ctx.fill(); ctx.fillStyle = p.neon; ctx.fillRect(cx, 140, 320, 6); for (let w = 0; w < 6; w++) { ctx.fillStyle = (Math.floor(t * 3) + w + k) % 5 ? '#FFF3C4' : '#3A3050'; ctx.fillRect(cx + 16 + w * 50, 104, 36, 22); } } }
    // street lamps: flickering cones
    [vx(.16), vx(.84)].forEach((lx, i) => { const fl = .55 + .45 * (Math.sin(t * 23 + i) > -.92 ? 1 : 0) + kick * .2; ctx.globalCompositeOperation = 'lighter'; beam(lx, 300, PI / 2, 760, .32, p.acc, .22 * fl); ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#FFF6D0'; ctx.beginPath(); ctx.arc(lx, 300, 16, 0, TAU); ctx.fill(); });
    // sticker bomb: your words slap onto the walls on the beat
    if (newBeat) { const i = Math.floor(beat), side = i % 2, f = side ? .74 + hash(i, 3) * .22 : .04 + hash(i, 3) * .22; ST.stick.push({ x: vx(f), y: 360 + hash(i, 4) * 520, r: (hash(i, 5) - .5) * .5, w: words[i % words.length], c: [p.acc, p.cool, '#F3EFE6', p.neon][i % 4], t0: t }); if (ST.stick.length > 14) ST.stick.shift(); }
    ST.stick.forEach(s => { const a = clamp((t - s.t0) / .3), sc = outBack(a); ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.r); ctx.scale(sc, sc); ctx.font = `400 46px ${FJ}`; const w = Math.min(420, ctx.measureText(s.w).width) + 44; ctx.fillStyle = 'rgba(0,0,0,.35)'; rrect(-w / 2 + 8, -38, w, 80, 16); ctx.fill(); ctx.fillStyle = s.c; rrect(-w / 2, -46, w, 80, 16); ctx.fill(); ctx.strokeStyle = '#0B0B14'; ctx.lineWidth = 5; ctx.stroke(); ctx.fillStyle = '#0B0B14'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s.w, 0, -4, 400); ctx.restore(); });
    // speaker rings on the pillars
    [vx(.08), vx(.92)].forEach(sx => { for (let k = 0; k < 3; k++) { ctx.strokeStyle = hex(p.neon, .5 * (1 - k / 3) * (.4 + kick)); ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(sx, 720, 40 + k * 26 + kick * 20, 0, TAU); ctx.stroke(); } });
    // dust in the lamp light
    ctx.fillStyle = 'rgba(255,240,200,.5)'; for (let i = 0; i < 60; i++) { const x = vx(hash(i, 7)), y = (hash(i, 8) * H + t * 20 * (1 + hash(i, 9))) % H; ctx.fillRect(x, y, 3, 3); }
  }
  if (v === 1) { // ---------- ROOFTOP
    stars(t, .9);
    // vinyl moon, spinning
    const mx = vx(.5), my = 250, mr = 170 + kick * 6; ctx.save(); ctx.translate(mx, my); ctx.rotate(t * .9);
    ctx.fillStyle = '#121019'; ctx.beginPath(); ctx.arc(0, 0, mr, 0, TAU); ctx.fill();
    for (let k = 0; k < 14; k++) { ctx.strokeStyle = `rgba(255,255,255,${.04 + (k % 3 === 0 ? .05 : 0)})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, mr * (.38 + k * .045), 0, TAU); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(0, 0, mr * .8, -.6, -.1); ctx.stroke();
    ctx.fillStyle = p.acc; ctx.beginPath(); ctx.arc(0, 0, mr * .32, 0, TAU); ctx.fill(); ctx.fillStyle = '#121019'; ctx.font = `800 ${mr * .16}px ${FD}`; ctx.textAlign = 'center'; ctx.fillText('RHYME', 0, -mr * .06); ctx.font = `600 ${mr * .09}px ${FM}`; ctx.fillText(`${Math.round(o.bpm || 100)} BPM`, 0, mr * .12); ctx.beginPath(); ctx.arc(0, 0, 8, 0, TAU); ctx.fillStyle = '#F3EFE6'; ctx.fill(); ctx.restore();
    const glow = ctx.createRadialGradient(mx, my, mr, mx, my, mr * 1.9); glow.addColorStop(0, hex(p.acc, .25 + kick * .2)); glow.addColorStop(1, hex(p.acc, 0)); ctx.fillStyle = glow; ctx.fillRect(mx - mr * 2, my - mr * 2, mr * 4, mr * 4);
    // windows light up like an equalizer
    for (const [wx, wy, col] of WIN1) { const lv = .5 + .5 * Math.sin(beat * PI * .5 + col * .7) + kick * .4, h01 = (760 - wy) / 300; if (h01 < lv * .9) { ctx.fillStyle = col % 3 === 0 ? p.acc : col % 3 === 1 ? '#FFF1C4' : p.cool; ctx.globalAlpha = .55 + .45 * hash(wx, wy); ctx.fillRect(wx, wy, 10, 14); } }
    ctx.globalAlpha = 1;
    // near skyline (drawn over the windows layer)
    ctx.fillStyle = '#06040E'; for (let i = 0; i < 14; i++) { const bw = W / 13, bh = 120 + hash(i, 21) * 160; ctx.fillRect(i * bw - 10, 900 - bh, bw * .8, bh); }
    // string lights swinging across the top
    for (let s = 0; s < 2; s++) { const y0 = 70 + s * 70, sag = 90 + Math.sin(t * 1.2 + s) * 12; ctx.strokeStyle = 'rgba(20,16,30,.9)'; ctx.lineWidth = 3; ctx.beginPath(); for (let i = 0; i <= 40; i++) { const f = i / 40, x = lerp(VX0 - 20, VX1 + 20, f), y = y0 + Math.sin(f * PI) * sag; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
      for (let i = 1; i < 20; i++) { const f = i / 20, x = lerp(VX0 - 20, VX1 + 20, f), y = y0 + Math.sin(f * PI) * sag + 10, on = (i + Math.floor(beat) + s) % 3 === 0; ctx.fillStyle = on ? p.acc : '#FFE9B8'; ctx.globalAlpha = on ? 1 : .55; ctx.beginPath(); ctx.arc(x, y, on ? 11 + kick * 5 : 8, 0, TAU); ctx.fill(); if (on) { ctx.globalAlpha = .25; ctx.beginPath(); ctx.arc(x, y, 30, 0, TAU); ctx.fill(); } } ctx.globalAlpha = 1; }
    // shooting star every 4 bars
    const sp = (beat % 16) / 16; if (sp < .12) { const k = sp / .12, x = lerp(vx(.85), vx(.3), k), y = lerp(80, 300, k); const g = ctx.createLinearGradient(x, y, x + 260, y - 90); g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.strokeStyle = g; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 260, y - 90); ctx.stroke(); }
  }
  if (v === 2) { // ---------- CLUB
    // LED wall scrolling the round + rival
    ledBoard(`${o.round || ''} VS ${o.opp || ''}  ✦  ${o.cup || ''}  ✦  `, vx(.5) - 33 * 14, 175, 66, 14, 14, p.acc, t * 9, t);
    // moving heads from the truss
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 6; i++) { const bx = vx((i + .5) / 6), ang = PI / 2 + Math.sin(t * (.6 + i * .07) + i * 1.3 + (bar % 2) * PI) * .55, col = [p.neon, p.cool, p.acc][(i + bar) % 3]; beam(bx, 150, ang, 1100, .06 + kick * .02, col, .32 + kick * .25); }
    // mirror ball spots
    for (let i = 0; i < 40; i++) { const a = hash(i, 2) * TAU + t * .35, rr = 300 + hash(i, 3) * 700, x = W / 2 + Math.cos(a) * rr, y = 520 + Math.sin(a) * rr * .5; ctx.fillStyle = hex('#FFFFFF', .18 + hash(i, 5) * .25); ctx.beginPath(); ctx.arc(x, y, 6 + hash(i, 4) * 6, 0, TAU); ctx.fill(); }
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#DDD9EA'; ctx.beginPath(); ctx.arc(W / 2, 175 + 14 * 7 + 70, 34, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(0,0,0,.25)'; for (let i = 0; i < 6; i++) ctx.fillRect(W / 2 - 34, 230 + i * 11, 68, 2);
    // speaker cones pump on the kick
    [VX0 + 30, VX1 - 290].forEach(sx => { for (let k = 0; k < 3; k++) { const cx = sx + 130, cy = 420 + k * 210 + 100, s = 1 + kick * .12; ctx.fillStyle = '#1E1B2A'; ctx.beginPath(); ctx.arc(cx, cy, 78 * s, 0, TAU); ctx.fill(); ctx.strokeStyle = hex(p.neon, .5 + kick * .5); ctx.lineWidth = 5; ctx.stroke(); ctx.fillStyle = '#2E2A40'; ctx.beginPath(); ctx.arc(cx, cy, 30 * s, 0, TAU); ctx.fill(); } });
    crowd(1070, 18, '#030207', t, beat, kick, .6, 3);
  }
  if (v === 3) { // ---------- ARENA
    // big screen
    const sx = W / 2 - 500, sy = 60, sw = 1000, sh = 260; ctx.save(); rrect(sx, sy, sw, sh, 10); ctx.clip();
    const g = ctx.createLinearGradient(sx, sy, sx + sw, sy + sh); g.addColorStop(0, p.sky[1]); g.addColorStop(1, p.neon); ctx.fillStyle = g; ctx.fillRect(sx, sy, sw, sh);
    const show = bar % 4 < 2; ctx.textAlign = 'center'; ctx.fillStyle = '#FFFFFF';
    if (show) { ctx.font = `800 120px ${FD}`; ctx.fillText('SEMI FINAL', W / 2, sy + 150 + Math.sin(t * 3) * 4); ctx.font = `600 26px ${FM}`; ctx.fillText(o.cup || '', W / 2, sy + 210); }
    else { ctx.font = `400 92px ${FJ}`; ctx.fillText(`VS ${o.opp || ''}`, W / 2, sy + 160, sw - 60); }
    ctx.fillStyle = 'rgba(0,0,0,.18)'; for (let y = sy; y < sy + sh; y += 6) ctx.fillRect(sx, y, sw, 2); ctx.restore();
    // phone lights on the tiers, waving
    for (let i = 0; i < 260; i++) { const r = i % 7, a = PI * 1.04 + hash(i, 1) * PI * .92, ex = 1100 + r * 120, ey = 520 + r * 85, x = W / 2 + Math.cos(a) * ex + Math.sin(t * 2 + i) * 6, y = 1150 + Math.sin(a) * ey; if (x < VX0 - 20 || x > VX1 + 20) continue; const on = .5 + .5 * Math.sin(t * 3 + hash(i, 2) * 9 + beat * .5); ctx.fillStyle = hash(i, 3) < .2 ? p.acc : '#FFFFFF'; ctx.globalAlpha = .35 + on * .65; ctx.fillRect(x, y, 5, 8); }
    ctx.globalAlpha = 1;
    // spotlights from the corners onto the stage
    ctx.globalCompositeOperation = 'lighter';
    [[VX0, 0], [VX1, 0]].forEach(([x, y], i) => { const tgt = Math.atan2(800 - y, W / 2 - x) + Math.sin(t * .8 + i * 2) * .25; beam(x, y, tgt, 1500, .07, i ? p.cool : p.acc, .35 + kick * .2); });
    ctx.globalCompositeOperation = 'source-over';
    // pyro columns every 4 bars
    const pp = (beat % 16) / 16; if (pp < .18) { const k = pp / .18; [vx(.1), vx(.9)].forEach(x => { for (let j = 0; j < 26; j++) { const y = 1000 - k * 700 * (j / 26) - hash(j, x) * 60, rr = 30 * (1 - j / 26) + 10; const g2 = ctx.createRadialGradient(x, y, 0, x, y, rr); g2.addColorStop(0, 'rgba(255,240,180,.95)'); g2.addColorStop(.5, hex(p.neon, .6)); g2.addColorStop(1, 'rgba(255,80,0,0)'); ctx.fillStyle = g2; ctx.beginPath(); ctx.arc(x + Math.sin(j + t * 20) * 10, y, rr, 0, TAU); ctx.fill(); } }); }
    crowd(1090, 16, '#020104', t, beat, kick, .7, 7);
  }
  if (v === 4) { // ---------- STADIUM FINAL
    stars(t, .6);
    // camera flashes all over the bowl
    for (let i = 0; i < 9; i++) ST.flash.push({ x: W / 2 + (Math.random() - .5) * 2800, y: 500 + Math.random() * 520, t0: t });
    ST.flash = ST.flash.filter(f => t - f.t0 < .25);
    ST.flash.forEach(f => { const a = 1 - (t - f.t0) / .25; ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.beginPath(); ctx.arc(f.x, f.y, 3 + a * 5, 0, TAU); ctx.fill(); });
    // the crowd wave travels around the bowl
    for (let r = 0; r < 9; r++) { const ex = 1500 - r * 70, ey = 720 - r * 52; for (let i = 0; i < 70; i++) { const a = PI + (i + .5) / 70 * PI, x = W / 2 + Math.cos(a) * ex, y = 1100 + Math.sin(a) * ey; if (x < VX0 - 20 || x > VX1 + 20) continue; const wave = Math.max(0, Math.cos(a * 2 - t * 2.2)) ** 6; ctx.fillStyle = wave > .3 ? p.acc : hex('#FFFFFF', .12 + hash(i, r) * .2); ctx.fillRect(x - 5, y - wave * 14, 10, 6 + wave * 10); } }
    // light-tower beams
    ctx.globalCompositeOperation = 'lighter';
    [VX0 + 140, VX1 - 140].forEach((lx, i) => { for (let k = 0; k < 2; k++) beam(lx, 120, PI / 2 + (i ? -1 : 1) * (.25 + k * .2) + Math.sin(t * .7 + k + i) * .2, 1300, .05, '#FFFFFF', .22 + kick * .15); });
    ctx.globalCompositeOperation = 'source-over';
    // fireworks every 2 bars
    if (newBar && bar % 2 === 0) for (let k = 0; k < 2; k++) { const fx = vx(.2 + Math.random() * .6), fy = 120 + Math.random() * 220, col = [p.acc, p.neon, p.cool, '#FFFFFF'][Math.floor(Math.random() * 4)]; for (let j = 0; j < 70; j++) { const a = j / 70 * TAU, sp = 260 + Math.random() * 160; ST.fw.push({ x: fx, y: fy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1.4 + Math.random() * .6, c: col }); } }
    ST.fw.forEach(f => { f.life -= dt; f.vy += 160 * dt; f.vx *= Math.pow(.3, dt); f.vy *= Math.pow(.5, dt); f.x += f.vx * dt; f.y += f.vy * dt; }); ST.fw = ST.fw.filter(f => f.life > 0);
    ST.fw.forEach(f => { ctx.globalAlpha = clamp(f.life); ctx.fillStyle = f.c; ctx.fillRect(f.x - 3, f.y - 3, 6, 6); }); ctx.globalAlpha = 1;
    // hologram headline
    const title = o.champ ? 'CHAMPION' : 'FINAL', sz = Math.min(230, (VX1 - VX0) / (title.length * .62)); ctx.font = `800 ${sz}px ${FD}`; ctx.textAlign = 'center';
    const hg = ctx.createLinearGradient(VX0, 0, VX1, 0); const sh = (t * .25) % 1; hg.addColorStop(0, p.acc); hg.addColorStop(clamp(sh), '#FFFFFF'); hg.addColorStop(1, p.neon);
    ctx.globalAlpha = .9; ctx.lineWidth = 4; ctx.strokeStyle = hg; ctx.strokeText(title, W / 2, 120 + sz * .78); ctx.globalAlpha = .18 + kick * .2; ctx.fillStyle = hg; ctx.fillText(title, W / 2, 120 + sz * .78); ctx.globalAlpha = 1;
    { const tx = `${o.cup || ''} · VS ${o.opp || ''}`; ctx.letterSpacing = '6px'; fitFont(tx, (VX1 - VX0) * .86, 24, FJ); ctx.textAlign = 'center'; ctx.fillStyle = '#F3EFE6'; ctx.fillText(tx, W / 2, 120 + sz * .78 + 50); ctx.letterSpacing = '0px'; }
    // gold confetti strips
    if (ST.conf.length < 90) ST.conf.push({ x: vx(Math.random()), y: -20, vy: 80 + Math.random() * 120, r: Math.random() * TAU, vr: (Math.random() - .5) * 8 });
    ST.conf.forEach(c => { c.y += c.vy * dt; c.r += c.vr * dt; }); ST.conf = ST.conf.filter(c => c.y < H + 20);
    ST.conf.forEach((c, i) => { ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.r); ctx.fillStyle = i % 3 ? '#FFD34D' : p.acc; ctx.fillRect(-9, -3 * Math.abs(Math.cos(c.r * 2)) - 1, 18, 6 * Math.abs(Math.cos(c.r * 2)) + 2); ctx.restore(); });
  }
  // shared finish: venue caption plate + soft vignette
  const vg = ctx.createRadialGradient(W / 2, H * .55, 300, W / 2, H * .55, 1200); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.45)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
}

/* =========================================================
   BATTLE — one look per song, always built from the rhyme words
   ========================================================= */
const TS = {};
const fitFont = (txt, max, size, fam = FJ, w = 400) => { ctx.font = `${w} ${size}px ${fam}`; const m = ctx.measureText(txt).width; if (m > max) { size *= max / m; ctx.font = `${w} ${size}px ${fam}`; } return size; };
function centerWord(txt, y, maxW, size, fam, w) { const s = fitFont(txt, maxW, size, fam, w); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; return s; }
const ent = u => outBack(clamp(u / .35));

TS['BACKPACK CYPHER'] = (w, u, o) => { // boom bap: newsprint, rubber stamps, a spinning record
  ctx.fillStyle = '#EDE3CC'; ctx.fillRect(0, 0, W, H);
  halftone(ctx, 0, 0, W, H, 'rgba(60,40,20,.08)', 22, (x, y) => .3 + .3 * Math.sin(x * .004 + y * .003));
  // record
  ctx.save(); ctx.translate(vx(.82), 760); ctx.rotate(o.t * 3.5); ctx.fillStyle = '#16120E'; ctx.beginPath(); ctx.arc(0, 0, 300, 0, TAU); ctx.fill(); for (let k = 0; k < 12; k++) { ctx.strokeStyle = 'rgba(255,255,255,.05)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 120 + k * 14, 0, TAU); ctx.stroke(); } ctx.fillStyle = '#E8452C'; ctx.beginPath(); ctx.arc(0, 0, 100, 0, TAU); ctx.fill(); ctx.fillStyle = '#EDE3CC'; ctx.font = `800 30px ${FD}`; ctx.textAlign = 'center'; ctx.fillText('BOOM BAP', 0, 10); ctx.restore();
  // typewriter couplet lines
  ctx.fillStyle = 'rgba(30,20,10,.55)'; ctx.font = `500 30px ${FM}`; ctx.textAlign = 'left'; (o.lines || []).forEach((l, i) => ctx.fillText(l.slice(0, Math.floor((o.t * 14) % (l.length + 30))), VX0 + 80, 150 + i * 52));
  // stamped word
  const s = centerWord(w, 560, (VX1 - VX0) * .8, 330); const k = ent(u);
  ctx.save(); ctx.translate(W / 2, 560); ctx.rotate(-.04 + Math.sin(Math.floor(o.beat) * 1.7) * .03); ctx.scale(lerp(1.6, 1, k) * (1 + o.kick * .03), lerp(1.6, 1, k)); ctx.globalAlpha = clamp(u / .1);
  ctx.fillStyle = '#E8452C'; ctx.fillText(w, 10, 10); ctx.fillStyle = '#16120E'; ctx.fillText(w, 0, 0);
  ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = 'rgba(0,0,0,.35)'; for (let i = 0; i < 120; i++) ctx.fillRect((hash(i, 1) - .5) * s * w.length, (hash(i, 2) - .5) * s, 4 + hash(i, 3) * 10, 3); ctx.globalCompositeOperation = 'source-over';
  ctx.restore(); ctx.globalAlpha = 1;
  // circle stamp
  ctx.save(); ctx.translate(vx(.16), 860); ctx.rotate(o.t * .4); ctx.strokeStyle = '#E8452C'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(0, 0, 110, 0, TAU); ctx.stroke(); ctx.font = `700 22px ${FM}`; ctx.fillStyle = '#E8452C'; ctx.textAlign = 'center'; for (let i = 0; i < 16; i++) { ctx.save(); ctx.rotate(i / 16 * TAU); ctx.fillText('RHYME·'[i % 6], 0, -78); ctx.restore(); } ctx.restore();
};
TS['LOG DRUM SUNSET'] = (w, u, o) => { // amapiano: sunset, a log-drum bounce, waves
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2B1A5A'); g.addColorStop(.5, '#FF6A5C'); g.addColorStop(1, '#FFC46B'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const sy = 520; ctx.fillStyle = '#FFE7A1'; ctx.beginPath(); ctx.arc(W / 2, sy, 380, PI, TAU); ctx.fill(); ctx.fillStyle = '#FF8A5C'; for (let i = 0; i < 6; i++) ctx.fillRect(W / 2 - 400, sy - 60 - i * 50, 800, 8 + i * 2);
  for (let k = 0; k < 6; k++) { ctx.strokeStyle = `rgba(255,255,255,${.5 - k * .07})`; ctx.lineWidth = 6; ctx.beginPath(); for (let x = 0; x <= W; x += 20) { const y = sy + 60 + k * 70 + Math.sin(x * .006 + o.t * 1.5 + k) * (14 + k * 4); x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); }
  [vx(.06), vx(.94)].forEach((px, i) => { ctx.save(); ctx.translate(px, 1080); ctx.rotate((i ? -1 : 1) * .12 + Math.sin(o.t) * .03); ctx.fillStyle = '#1C0F2E'; ctx.fillRect(-14, -620, 28, 620); for (let f = 0; f < 7; f++) { ctx.save(); ctx.translate(0, -620); ctx.rotate(f / 7 * PI - PI / 2 + Math.sin(o.t * 1.4 + f) * .05); ctx.beginPath(); ctx.ellipse(130, 0, 150, 26, 0, 0, TAU); ctx.fill(); ctx.restore(); } ctx.restore(); });
  const b = Math.abs(Math.sin(o.beat * PI)) * 40; centerWord(w, 0, (VX1 - VX0) * .78, 300); const k = ent(u);
  ctx.save(); ctx.translate(W / 2, 440 - b * k); ctx.scale(k * (1 + o.kick * .05), k * (1 - o.kick * .04)); ctx.fillStyle = '#2B1A5A'; ctx.fillText(w, 8, 12); ctx.fillStyle = '#FFFFFF'; ctx.fillText(w, 0, 0); ctx.restore();
};
TS['ROOFTOP HOUSE'] = (w, u, o) => { // house: swiss blocks re-dealt on every beat
  const cols = ['#FF4D1A', '#2438FF', '#F3EFE6', '#FFC21A', '#0B0B14'], b = Math.floor(o.beat);
  for (let gy = 0; gy < 3; gy++) for (let gx = 0; gx < 4; gx++) { ctx.fillStyle = cols[(gx * 3 + gy * 5 + b) % 5]; ctx.fillRect(gx * W / 4, gy * H / 3, W / 4 + 1, H / 3 + 1); }
  ctx.fillStyle = 'rgba(11,11,20,.85)'; ctx.font = `800 120px ${FD}`; ctx.textAlign = 'left'; ctx.fillText(String(b % 4 + 1).padStart(2, '0'), VX0 + 40, H - 140);
  for (let r = 0; r < 5; r++) { const s = fitFont(w, 2000, 170); const off = ((o.t * 260 * (r % 2 ? 1 : -1)) % 900); ctx.textBaseline = 'middle'; ctx.fillStyle = r === 2 ? '#0B0B14' : 'rgba(11,11,20,.22)'; ctx.textAlign = 'left'; for (let x = -900 + off; x < W; x += Math.max(600, ctx.measureText(w).width + 120)) ctx.fillText(w, x, 150 + r * 200); }
  const k = ent(u); centerWord(w, 0, (VX1 - VX0) * .8, 280); ctx.save(); ctx.translate(W / 2, 550); ctx.scale(k, k); ctx.fillStyle = '#F3EFE6'; ctx.strokeStyle = '#0B0B14'; ctx.lineWidth = 24; ctx.lineJoin = 'round'; ctx.strokeText(w, 0, 0); ctx.fillText(w, 0, 0); ctx.restore();
};
TS['NIGHT BUS 2-STEP'] = (w, u, o) => { // UK garage: rainy night bus, LED destination sign
  ctx.fillStyle = '#060A1A'; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 14; i++) { const x = ((hash(i, 1) * W * 1.4 - o.t * 600 * (.6 + hash(i, 2))) % (W * 1.4) + W * 1.4) % (W * 1.4) - 200; const g = ctx.createRadialGradient(x, 640 + hash(i, 3) * 200, 0, x, 640 + hash(i, 3) * 200, 140); g.addColorStop(0, hex(['#FFB13D', '#FF4D8D', '#56D9F5'][i % 3], .45)); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x - 150, 450, 300, 400); }
  ctx.strokeStyle = 'rgba(180,200,255,.35)'; ctx.lineWidth = 2; for (let i = 0; i < 140; i++) { const x = hash(i, 4) * W, y = (hash(i, 5) * H + o.t * 1400) % H; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 18, y + 46); ctx.stroke(); }
  const cols = Math.min(64, Math.floor((VX1 - VX0 - 120) / 22)), x0 = W / 2 - cols * 11; ctx.fillStyle = '#111'; rrect(x0 - 40, 180, cols * 22 + 80, 26 * 22 / 1.45 + 60, 18); ctx.fill();
  ctx.fillStyle = '#FFB13D'; ctx.font = `800 64px ${FD}`; ctx.textAlign = 'left'; ctx.fillText('N29', x0 - 20, 160);
  ledBoard(`${w}  ⇢  ${w}  `, x0, 210, cols, 16, 22, '#FFB13D', (o.t * 14) + 30 * clamp(u * 3), o.t);
  const k = ent(u); ctx.save(); centerWord(w, 0, (VX1 - VX0) * .8, 220); ctx.translate(W / 2, 760); ctx.scale(k, k); ctx.fillStyle = 'rgba(255,177,61,.12)'; ctx.fillText(w, 0, 60); ctx.fillStyle = '#F3EFE6'; ctx.fillText(w, 0, 0); ctx.restore();
};
TS['ACID RUNNER'] = (w, u, o) => { // acid techno: black, 303 squiggles, strobe
  const inv = o.kick > .7 && Math.floor(o.beat) % 4 === 3; ctx.fillStyle = inv ? '#C6FF3D' : '#030303'; ctx.fillRect(0, 0, W, H);
  for (let k = 0; k < 7; k++) { ctx.strokeStyle = inv ? '#030303' : `hsla(${78 + k * 6},100%,${55 - k * 3}%,${.9 - k * .1})`; ctx.lineWidth = 6 - k * .6; ctx.beginPath(); for (let x = 0; x <= W; x += 8) { const ph = x * .01 + o.t * (3 + k), y = 540 + Math.sin(ph) * 120 * Math.sin(o.t * .7 + k) + Math.sin(ph * 3.3 + k) * 60 + Math.sign(Math.sin(ph * .5)) * 40 * (k % 2) + (k - 3) * 70; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); }
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; const s = fitFont(w.toUpperCase(), (VX1 - VX0) * .6, 140, FJ); for (let r = -4; r <= 4; r++) { ctx.globalAlpha = r ? .22 : 1; ctx.lineWidth = 3; ctx.strokeStyle = inv ? '#030303' : '#C6FF3D'; const y = 540 + r * s * 1.05 + ((o.t * 120) % (s * 1.05)); if (r) ctx.strokeText(w, W / 2, y); }
  ctx.globalAlpha = 1; const k = ent(u); ctx.save(); ctx.translate(W / 2, 540); ctx.scale(k, k); fitFont(w, (VX1 - VX0) * .8, 260); ctx.fillStyle = inv ? '#030303' : '#C6FF3D'; ctx.fillText(w, 0, 0); ctx.restore();
  ctx.font = `600 26px ${FM}`; ctx.fillStyle = inv ? '#030303' : '#C6FF3D'; ctx.textAlign = 'left'; ctx.fillText(`TB-303 · CUTOFF ${Math.round(400 + 300 * Math.sin(o.t))}Hz · RES 0.${Math.floor(60 + 30 * Math.sin(o.t * 2))}`, VX0 + 50, H - 90);
};
TS['808 SUPERSTAR'] = (w, u, o) => { // trap: chrome type, diamonds, slow zoom
  const g = ctx.createRadialGradient(W / 2, 540, 50, W / 2, 540, 1100); g.addColorStop(0, '#3A1460'); g.addColorStop(1, '#05010A'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.font = `800 620px ${FD}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.strokeStyle = 'rgba(255,255,255,.06)'; ctx.lineWidth = 6; ctx.strokeText('808', W / 2, 560);
  for (let i = 0; i < 26; i++) { const x = vx(hash(i, 1)), y = hash(i, 2) * H, tw = Math.max(0, Math.sin(o.t * 2 + i * 1.7)) ** 3, s = 10 + tw * 34; ctx.fillStyle = `rgba(255,255,255,${.3 + tw * .7})`; ctx.beginPath(); ctx.moveTo(x, y - s); ctx.lineTo(x + s * .22, y - s * .22); ctx.lineTo(x + s, y); ctx.lineTo(x + s * .22, y + s * .22); ctx.lineTo(x, y + s); ctx.lineTo(x - s * .22, y + s * .22); ctx.lineTo(x - s, y); ctx.lineTo(x - s * .22, y - s * .22); ctx.fill(); }
  const k = ent(u), z = 1 + (o.t % 8) * .01; const s = fitFont(w, (VX1 - VX0) * .8, 300, FJ); ctx.save(); ctx.translate(W / 2, 540); ctx.scale(k * z, k * z);
  const cg = ctx.createLinearGradient(0, -s / 2, 0, s / 2); cg.addColorStop(0, '#FFFFFF'); cg.addColorStop(.45, '#A9A3C9'); cg.addColorStop(.5, '#3B3557'); cg.addColorStop(.62, '#E8E4FF'); cg.addColorStop(1, '#7D77A8');
  ctx.lineJoin = 'round'; ctx.strokeStyle = '#B36BFF'; ctx.lineWidth = 18; ctx.strokeText(w, 0, 0); ctx.fillStyle = cg; ctx.fillText(w, 0, 0); ctx.restore();
};
TS['GRIME TIME'] = (w, u, o) => { // drill: concrete, caution tape, red glitch slices
  ctx.fillStyle = '#5B5B60'; ctx.fillRect(0, 0, W, H); for (let i = 0; i < 400; i++) { ctx.fillStyle = `rgba(0,0,0,${hash(i, 1) * .15})`; ctx.fillRect(hash(i, 2) * W, hash(i, 3) * H, 6 + hash(i, 4) * 40, 4 + hash(i, 5) * 30); }
  [[-.18, 300], [.14, 820]].forEach(([r, y], j) => { ctx.save(); ctx.translate(W / 2, y); ctx.rotate(r); ctx.fillStyle = '#FFD21A'; ctx.fillRect(-1600, -55, 3200, 110); ctx.fillStyle = '#111'; for (let x = -1600; x < 1600; x += 80) { ctx.beginPath(); ctx.moveTo(x, -55); ctx.lineTo(x + 40, -55); ctx.lineTo(x + 10, 55); ctx.lineTo(x - 30, 55); ctx.fill(); }
    ctx.fillStyle = '#FFD21A'; ctx.font = `400 60px ${FJ}`; ctx.textBaseline = 'middle'; const off = ((o.t * 300 * (j ? -1 : 1)) % 700); for (let x = -1700 + off; x < 1700; x += 700) { ctx.fillStyle = '#FFD21A'; ctx.fillRect(x - 20, -40, ctx.measureText(w).width + 40, 80); ctx.fillStyle = '#111'; ctx.fillText(w, x, 4); } ctx.restore(); });
  const k = ent(u); fitFont(w, (VX1 - VX0) * .8, 280); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (let i = 0; i < 6; i++) { const y0 = 400 + i * 50, sh = (o.kick > .4 ? (hash(i, Math.floor(o.t * 12)) - .5) * 80 : 0); ctx.save(); ctx.beginPath(); ctx.rect(0, y0, W, 50); ctx.clip(); ctx.translate(W / 2 + sh, 560); ctx.scale(k, k); ctx.fillStyle = i % 2 && o.kick > .4 ? '#FF2E2E' : '#F3EFE6'; ctx.fillText(w, 0, 0); ctx.restore(); }
  ctx.save(); ctx.beginPath(); ctx.rect(0, 700, W, 200); ctx.clip(); ctx.translate(W / 2, 560); ctx.scale(k, k); ctx.fillStyle = '#F3EFE6'; ctx.fillText(w, 0, 0); ctx.restore();
};
TS['HYPER RAVE'] = (w, u, o) => { // hyperpop: candy gradient, bubbly sticker type
  const g = ctx.createLinearGradient(0, 0, W, H); const h = (o.t * 30) % 360; g.addColorStop(0, `hsl(${h + 300},100%,72%)`); g.addColorStop(1, `hsl(${h + 180},100%,70%)`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 30; i++) { const x = vx(hash(i, 1)), y = (hash(i, 2) * H - o.t * 90 * (1 + hash(i, 3))) % H + H; const yy = y % H, s = 20 + hash(i, 4) * 40; ctx.save(); ctx.translate(x, yy); ctx.rotate(o.t + i); ctx.fillStyle = i % 2 ? '#FFFFFF' : '#FF4D8D'; if (i % 3) { ctx.beginPath(); for (let k = 0; k < 10; k++) { const a = k * PI / 5, rr = k % 2 ? s * .45 : s; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.fill(); } else { ctx.beginPath(); ctx.moveTo(0, s * .3); ctx.bezierCurveTo(s, -s * .5, s * .5, -s, 0, -s * .4); ctx.bezierCurveTo(-s * .5, -s, -s, -s * .5, 0, s * .3); ctx.fill(); } ctx.restore(); }
  const k = ent(u), wob = Math.sin(o.t * 6) * .04; fitFont(w, (VX1 - VX0) * .78, 300); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.save(); ctx.translate(W / 2, 540); ctx.rotate(wob); ctx.scale(k * (1 + o.kick * .06), k); ctx.lineJoin = 'round';
  ctx.fillStyle = 'rgba(80,0,120,.35)'; ctx.fillText(w, 14, 18); ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 44; ctx.strokeText(w, 0, 0);
  ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#00E5FF'; ctx.fillText(w, -6, 0); ctx.fillStyle = '#FF3DA8'; ctx.fillText(w, 6, 0); ctx.fillStyle = '#7A2BFF'; ctx.fillText(w, 0, 0); ctx.restore();
};
TS['FOOTWORK FRENZY'] = (w, u, o) => { // footwork: spinning checkerboard, stuttered type
  ctx.save(); ctx.translate(W / 2, 540); ctx.rotate(o.t * .3); const c = 120; for (let y = -12; y < 12; y++) for (let x = -12; x < 12; x++) { ctx.fillStyle = (x + y) % 2 ? '#FF6A00' : '#120800'; ctx.fillRect(x * c, y * c, c, c); } ctx.restore();
  const st = Math.floor(o.beat * 4) % 3; fitFont(w, (VX1 - VX0) * .8, 280); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (let i = 2; i >= 0; i--) { const s = ent(u) * (1 + i * .18 * (i <= st ? 1 : 0)); ctx.save(); ctx.translate(W / 2, 540); ctx.scale(s, s); ctx.globalAlpha = i ? .25 : 1; ctx.fillStyle = i ? '#FFFFFF' : '#FFE14D'; ctx.strokeStyle = '#120800'; ctx.lineWidth = 16; ctx.lineJoin = 'round'; if (!i) ctx.strokeText(w, 0, 0); ctx.fillText(w, 0, 0); ctx.restore(); }
  ctx.globalAlpha = 1; ctx.fillStyle = '#120800'; for (let i = 0; i < 12; i++) { const on = (Math.floor(o.beat * 3) + i) % 3 === 0; ctx.fillStyle = on ? '#FFE14D' : 'rgba(18,8,0,.7)'; ctx.fillRect(vx(.5) - 6 * 70 + i * 70, 960, 54, 30); }
};
TS['AMEN ROLLER'] = (w, u, o) => { // drum & bass: cobalt tunnel, the word flying at you
  ctx.fillStyle = '#04082A'; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 16; i++) { const z = ((i / 16 + o.t * .6) % 1), s = Math.pow(z, 2.2) * 2.4; ctx.strokeStyle = `rgba(36,56,255,${z})`; ctx.lineWidth = 2 + z * 10; ctx.strokeRect(W / 2 - 960 * s, 540 - 540 * s, 1920 * s, 1080 * s); }
  ctx.strokeStyle = 'rgba(243,239,230,.35)'; ctx.lineWidth = 3; for (let i = 0; i < 60; i++) { const a = hash(i, 1) * TAU, z = (hash(i, 2) + o.t * 1.2) % 1, r0 = 100 + z * 900, r1 = r0 + 80 + z * 200; ctx.beginPath(); ctx.moveTo(W / 2 + Math.cos(a) * r0, 540 + Math.sin(a) * r0 * .6); ctx.lineTo(W / 2 + Math.cos(a) * r1, 540 + Math.sin(a) * r1 * .6); ctx.stroke(); }
  fitFont(w, (VX1 - VX0) * .7, 260); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (let i = 0; i < 3; i++) { const z = ((o.t * .5 + i / 3) % 1), s = .2 + z * z * 2.2; ctx.save(); ctx.translate(W / 2, 540); ctx.scale(s, s); ctx.globalAlpha = (1 - z) * .5; ctx.fillStyle = '#FF4D1A'; ctx.fillText(w, 0, 0); ctx.restore(); }
  ctx.globalAlpha = 1; const k = ent(u); ctx.save(); ctx.translate(W / 2, 540); ctx.scale(k * (1 + o.kick * .05), k); ctx.fillStyle = '#F3EFE6'; ctx.fillText(w, 0, 0); ctx.restore();
};
function track(vis, w, u, o) {
  begin(); const v = clamp(o.vis ?? 1, .25, 1); VX0 = W / 2 - W * v / 2; VX1 = W / 2 + W * v / 2;
  (TS[vis] || TS['AMEN ROLLER'])(w || 'いん', u, o);
  if (o.sub) { ctx.font = `600 24px ${FM}`; ctx.letterSpacing = '6px'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = 'rgba(243,239,230,.8)'; ctx.fillText(o.sub, VX0 + 60, H - 100); ctx.letterSpacing = '0px'; }
}
/* ---------- photo backdrops: a seamless studio sweep, and the champion's gold ---------- */
function studio(o) {
  begin(); const p = PAL[o.mode] || PAL.N, t = o.t, v = clamp(o.vis ?? 1, .25, 1); VX0 = W / 2 - W * v / 2; VX1 = W / 2 + W * v / 2;
  if (o.kind === 'gold') {
    const g = ctx.createRadialGradient(W / 2, 480, 60, W / 2, 480, 1200); g.addColorStop(0, '#FFF3B0'); g.addColorStop(.35, '#FFC21A'); g.addColorStop(1, '#7A4A00'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.translate(W / 2, 480); ctx.rotate(t * .08); for (let i = 0; i < 24; i++) { ctx.rotate(TAU / 24); ctx.fillStyle = i % 2 ? 'rgba(255,255,255,.16)' : 'rgba(122,74,0,.12)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-90, -1600); ctx.lineTo(90, -1600); ctx.fill(); } ctx.restore();
    ctx.font = `800 300px ${FD}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(255,255,255,.45)'; fitFont('CHAMPION', (VX1 - VX0) * .96, 300, FD, 800); ctx.strokeText('CHAMPION', W / 2, 250);
    for (let i = 0; i < 80; i++) { const x = vx(hash(i, 1)), y = (hash(i, 2) * H + t * (60 + hash(i, 3) * 80)) % H, r = t * 2 + i; ctx.save(); ctx.translate(x, y); ctx.rotate(r); ctx.fillStyle = i % 3 ? '#FFFFFF' : '#FF4D1A'; ctx.fillRect(-8, -3, 16, 6 * Math.abs(Math.cos(r))); ctx.restore(); }
    const fl = ctx.createLinearGradient(0, 760, 0, H); fl.addColorStop(0, 'rgba(122,74,0,0)'); fl.addColorStop(1, 'rgba(60,30,0,.65)'); ctx.fillStyle = fl; ctx.fillRect(0, 760, W, H - 760);
    return;
  }
  // seamless paper sweep in the cup colour, with a soft key light and a giant faint monogram
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, p.sky[1]); g.addColorStop(.62, p.sky[2]); g.addColorStop(1, p.sky[1]); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const k = ctx.createRadialGradient(W / 2, 420, 40, W / 2, 420, 900); k.addColorStop(0, 'rgba(255,255,255,.55)'); k.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = k; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalAlpha = .1; ctx.fillStyle = '#FFFFFF'; ctx.font = `800 260px ${FD}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; for (let r = -1; r < 6; r++) { const off = ((t * 30) % 1400); ctx.fillText('RHYME  MONSTERS  ', W / 2 - 700 + (r % 2 ? off : -off), r * 220 + 60); } ctx.restore();
  halftone(ctx, 0, 0, W, H, 'rgba(255,255,255,.07)', 26, (x, y) => .25 + .25 * Math.sin((x + y) * .004 + t));
  const fl = ctx.createLinearGradient(0, 780, 0, H); fl.addColorStop(0, 'rgba(0,0,0,0)'); fl.addColorStop(1, 'rgba(0,0,0,.35)'); ctx.fillStyle = fl; ctx.fillRect(0, 780, W, H - 780);
}
return { hub, track, studio, has: k => !!TS[k] };
})();
