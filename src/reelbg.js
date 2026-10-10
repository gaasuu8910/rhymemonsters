const REEL = (() => {
const W = 1920, H = 1080, DUR = 15, FPS = 30;
const C = { ink: '#0B0B14', cobalt: '#2438FF', flare: '#FF4D1A', bone: '#F3EFE6', rose: '#FFB3D1' };
const RGB = { ink: [11,11,20], cobalt: [36,56,255], flare: [255,77,26], bone: [243,239,230], rose: [255,179,209] };
const FD = '"Bricolage Grotesque", "Arial Black", sans-serif';
const FM = '"Martian Mono", ui-monospace, monospace';
const FJ = '"Dela Gothic One", "Hiragino Sans", sans-serif';
const PI = Math.PI, TAU = PI * 2;

const cv = document.createElement('canvas'); cv.width = 960; cv.height = 540; let SC = .5;
const ctx = cv.getContext('2d');

/* ---------- math ---------- */
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const E = {
  outExpo: t => t >= 1 ? 1 : 1 - Math.pow(2, -10 * t),
  inExpo: t => t <= 0 ? 0 : Math.pow(2, 10 * t - 10),
  inOutExpo: t => t <= 0 ? 0 : t >= 1 ? 1 : t < .5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2,
  inOutCubic: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  outCubic: t => 1 - Math.pow(1 - t, 3),
  inCubic: t => t * t * t,
  outBack: t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  outElastic: t => t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - .75) * TAU / 3) + 1,
};
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const mix = (a, b, t) => `rgb(${(a[0] + (b[0] - a[0]) * t) | 0},${(a[1] + (b[1] - a[1]) * t) | 0},${(a[2] + (b[2] - a[2]) * t) | 0})`;

/* ---------- drawing helpers ---------- */
function bg(c) { ctx.fillStyle = c; ctx.fillRect(0, 0, W, H); }
function font(w, s, f) { return `${w} ${s}px ${f}`; }
// per-letter layout keeping kerning: x offset of each glyph from the start of the line
function layout(str, f) {
  ctx.font = f; ctx.letterSpacing = '0px';
  const chars = [...str], xs = [];
  for (let i = 0; i < chars.length; i++) xs.push(ctx.measureText(chars.slice(0, i).join('')).width);
  return { chars, xs, ws: chars.map(c => ctx.measureText(c).width), total: ctx.measureText(str).width };
}
function label(str, x, y, size, color, align = 'left', spacing = 3, weight = 400) {
  ctx.font = font(weight, size, FM); ctx.letterSpacing = spacing + 'px';
  ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = color; ctx.fillText(str, x, y);
  ctx.letterSpacing = '0px'; ctx.textAlign = 'left';
}

/* ---------- precomputed data ---------- */
const N = 720;
const parts = (() => { const r = rng(7); return Array.from({ length: N }, (_, i) => ({ sx: r() * W, sy: r() * H, hi: i % 11 === 0, j: r() })); })();
const cells = (() => {
  const r = rng(42), out = [], cols = [C.ink, C.cobalt, C.flare, C.rose, C.ink, C.cobalt];
  for (let y = 0; y < 9; y++) for (let x = 0; x < 16; x++) {
    let fg = cols[(r() * cols.length) | 0], b = r() < .62 ? C.bone : cols[(r() * cols.length) | 0];
    if (b === fg) b = C.bone;
    if (b === C.bone && fg === C.bone) fg = C.ink;
    out.push({ cx: x * 120 + 60, cy: y * 120 + 60, type: (r() * 5) | 0, fg, bg: b, rot0: ((r() * 4) | 0) * PI / 2 });
  }
  return out;
})();
const knot = (() => {
  const pts = [], S = 300, R = 9;
  for (let k = 0; k < S; k++) {
    const f = k / S * TAU;
    const P = phi => { const rr = Math.cos(3 * phi) + 2; return [rr * Math.cos(2 * phi), rr * Math.sin(2 * phi), -Math.sin(3 * phi)]; };
    const p = P(f), q = P(f + .001);
    let T = [q[0] - p[0], q[1] - p[1], q[2] - p[2]]; let l = Math.hypot(...T); T = T.map(v => v / l);
    let Nn = [T[1], -T[0], 0]; l = Math.hypot(...Nn) || 1; Nn = Nn.map(v => v / l);
    const B = [T[1] * Nn[2] - T[2] * Nn[1], T[2] * Nn[0] - T[0] * Nn[2], T[0] * Nn[1] - T[1] * Nn[0]];
    for (let j = 0; j < R; j++) { const a = j / R * TAU + k * .05; pts.push({ p, n: [Math.cos(a) * Nn[0] + Math.sin(a) * B[0], Math.cos(a) * Nn[1] + Math.sin(a) * B[1], Math.cos(a) * Nn[2] + Math.sin(a) * B[2]], j, k }); }
  }
  return pts;
})();
const grain = (() => {
  const g = document.createElement('canvas'); g.width = g.height = 256; const gx = g.getContext('2d');
  const im = gx.createImageData(256, 256), r = rng(3);
  for (let i = 0; i < im.data.length; i += 4) { const v = (r() * 255) | 0; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
  gx.putImageData(im, 0, 0); return g;
})();
const blobLow = document.createElement('canvas'); blobLow.width = 480; blobLow.height = 270;
const blobLowCtx = blobLow.getContext('2d');
const blobImg = blobLowCtx.createImageData(480, 270);
const layer = document.createElement('canvas'); layer.width = W; layer.height = H;
const lctx = layer.getContext('2d');

/* ---------- scenes: each draws a full frame for local time u and returns a caption ---------- */

function sSlate(u) {
  bg(C.ink);
  ctx.strokeStyle = 'rgba(243,239,230,.2)'; ctx.lineWidth = 2;
  const guides = [['h', H / 2], ['v', W / 2], ['h', H * .25], ['h', H * .75], ['v', W * .25], ['v', W * .75]];
  guides.forEach(([d, v], i) => {
    const p = E.outExpo(prog(u, .02 + i * .05, .75 + i * .05)); if (p <= 0) return;
    ctx.beginPath();
    if (d === 'h') { ctx.moveTo(W / 2 - W / 2 * p, v); ctx.lineTo(W / 2 + W / 2 * p, v); }
    else { ctx.moveTo(v, H / 2 - H / 2 * p); ctx.lineTo(v, H / 2 + H / 2 * p); }
    ctx.stroke();
  });
  // ticking dial
  const cp = E.outExpo(prog(u, .08, .95));
  ctx.save(); ctx.translate(W / 2, H / 2);
  ctx.strokeStyle = C.flare; ctx.lineWidth = 8; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(0, 0, 340, -PI / 2, -PI / 2 + TAU * cp); ctx.stroke();
  ctx.rotate(u * .6);
  for (let i = 0; i < 72; i++) {
    const tp = prog(cp, i / 72 * .8, i / 72 * .8 + .2); if (tp <= 0) continue;
    const a = i / 72 * TAU, long = i % 6 === 0;
    ctx.strokeStyle = long ? C.bone : 'rgba(243,239,230,.45)'; ctx.lineWidth = long ? 3 : 2;
    ctx.beginPath(); ctx.moveTo(Math.cos(a) * 372, Math.sin(a) * 372); ctx.lineTo(Math.cos(a) * (372 + (long ? 30 : 14) * tp), Math.sin(a) * (372 + (long ? 30 : 14) * tp)); ctx.stroke();
  }
  ctx.restore();
  // countdown digit inside the dial, one per beat
  const beat = Math.min(2, Math.floor(u / .5));
  // title letters rise through a mask
  const f = font(800, 178, FD), L = layout('MOTION REEL', f), x0 = W / 2 - L.total / 2, base = H / 2 + 62;
  ctx.save(); ctx.beginPath(); ctx.rect(0, base - 150, W, 190); ctx.clip();
  ctx.font = f; ctx.fillStyle = C.bone; ctx.textBaseline = 'alphabetic';
  L.chars.forEach((ch, i) => {
    const p = E.outExpo(prog(u, .22 + i * .035, .85 + i * .035));
    ctx.fillStyle = (i === 7) ? C.flare : C.bone;
    ctx.fillText(ch, x0 + L.xs[i], base + (1 - p) * 200);
  });
  ctx.restore();
  const lp = E.outCubic(prog(u, .45, .8));
  ctx.globalAlpha = lp;
  label('CLAUDE  ·  SHOWREEL', W / 2, H / 2 - 128 + (1 - lp) * 20, 24, C.bone, 'center', 8);
  label(`2026   —   ${3 - beat}`, W / 2, H / 2 + 150 - (1 - lp) * 20, 24, C.rose, 'center', 8);
  ctx.globalAlpha = 1;
  // iris out into cobalt
  const ip = E.inExpo(prog(u, 1.2, 1.5));
  if (ip > 0) { ctx.fillStyle = C.cobalt; ctx.beginPath(); ctx.arc(W / 2, H / 2, ip * 1160, 0, TAU); ctx.fill(); }
  return 'stroke-dashoffset · stagger 35ms · iris';
}

function sKinetic(u) {
  const k = clamp(Math.floor(u / .5), 0, 3), w = u - k * .5;
  let cap = '';
  if (k === 0) {
    bg(C.cobalt);
    const f = font(800, 470, FD); ctx.font = f; ctx.textAlign = 'center'; ctx.fillStyle = C.bone;
    const drop = E.inCubic(prog(w, 0, .12));
    let sx = .86, sy = 1.32, y = H / 2 + 170 - (1 - drop) * 1000;
    if (w >= .12) { const e = E.outElastic(prog(w, .12, .5)); sy = lerp(.55, 1, e); sx = 1 / Math.sqrt(sy); y = H / 2 + 170; }
    ctx.save(); ctx.translate(W / 2, y); ctx.scale(sx, sy); ctx.fillText('MOVE', 0, 0); ctx.restore();
    ctx.textAlign = 'left';
    cap = 'squash & stretch · outElastic';
  } else if (k === 1) {
    bg(C.ink);
    const f = font(800, 430, FD); ctx.font = f; ctx.textAlign = 'center';
    const bands = 7, top = H / 2 - 210, bh = 400 / bands;
    for (let i = 0; i < bands; i++) {
      const p = E.outExpo(prog(w, i * .025, .32 + i * .025)), dir = i % 2 ? 1 : -1;
      ctx.save(); ctx.beginPath(); ctx.rect(0, top + i * bh, W, bh + 1); ctx.clip();
      ctx.fillStyle = C.bone; ctx.fillText('WITH', W / 2 + dir * (1 - p) * 1500, H / 2 + 160); ctx.restore();
    }
    const lp = E.outExpo(prog(w, .1, .45));
    ctx.fillStyle = C.flare; ctx.fillRect(W / 2 - 520 * lp, H / 2 + 215, 1040 * lp, 14);
    ctx.textAlign = 'left';
    cap = 'slice offset · 7 bands · outExpo';
  } else if (k === 2) {
    bg(C.bone);
    const f = font(800, 440, FD), L = layout('PURE', f), x0 = W / 2 - L.total / 2;
    ctx.font = f; ctx.textAlign = 'center';
    L.chars.forEach((ch, i) => {
      const p = prog(w, i * .05, .32 + i * .05), s = E.outBack(p), r = (1 - E.outCubic(p)) * -.9;
      if (p <= 0) return;
      ctx.save(); ctx.translate(x0 + L.xs[i] + L.ws[i] / 2, H / 2 + 20); ctx.rotate(r); ctx.scale(s, s);
      ctx.fillStyle = i === 3 ? C.flare : C.ink; ctx.fillText(ch, 0, 150); ctx.restore();
    });
    ctx.textAlign = 'left';
    cap = 'per-letter scale + rotate · outBack';
  } else {
    bg(C.cobalt);
    const f = font(800, 400, FD); ctx.font = f; ctx.textAlign = 'center';
    const rp = E.outExpo(prog(w, 0, .3)), tw = ctx.measureText('INTENT.').width;
    for (let e = 3; e >= 1; e--) {
      const ep = E.outExpo(prog(w, .04 * e, .4 + .04 * e));
      ctx.strokeStyle = `rgba(255,179,209,${.85 - e * .2})`; ctx.lineWidth = 3;
      ctx.strokeText('INTENT.', W / 2, H / 2 + 145 - e * 115 * ep);
    }
    ctx.save(); ctx.beginPath(); ctx.rect(W / 2 - tw / 2 - 20, 0, (tw + 40) * rp, H); ctx.clip();
    ctx.fillStyle = C.bone; ctx.fillText('INTENT', W / 2 - ctx.measureText('.').width / 2, H / 2 + 145);
    ctx.fillStyle = C.flare; ctx.textAlign = 'left'; ctx.fillText('.', W / 2 + tw / 2 - ctx.measureText('.').width, H / 2 + 145);
    ctx.restore();
    ctx.textAlign = 'left';
    cap = 'mask wipe · echo trail';
  }
  // slash wipe into the particle scene
  const sp = E.inOutCubic(prog(u, 1.72, 2.0));
  if (sp > 0) {
    const X = lerp(-400, W + 420, sp);
    ctx.fillStyle = C.flare; ctx.beginPath(); ctx.moveTo(-400, 0); ctx.lineTo(X + 320, 0); ctx.lineTo(X - 320, H); ctx.lineTo(-400, H); ctx.fill();
  }
  return cap;
}

function shapePos(s, i, u) {
  const n = i / N;
  switch (s) {
    case 0: return [parts[i].sx, parts[i].sy];
    case 1: { const a = n * TAU + u * 1.4, r = 330 + Math.sin(n * TAU * 6 + u * 6) * 36; return [W / 2 + Math.cos(a) * r, H / 2 + Math.sin(a) * r]; }
    case 2: { const gx = i % 30, gy = (i / 30) | 0, x = (gx - 14.5) * 24, y = (gy - 11.5) * 24, a = PI / 4 + (u - .55) * .5; return [W / 2 + x * Math.cos(a) - y * Math.sin(a), H / 2 + x * Math.sin(a) + y * Math.cos(a)]; }
    case 3: { const r = 15.5 * Math.sqrt(i), a = i * 2.39996 + u * .9; return [W / 2 + Math.cos(a) * r, H / 2 + Math.sin(a) * r]; }
    case 4: { const x = lerp(-60, W + 60, n); return [x, H / 2 + Math.sin(n * TAU * 2.5 - u * 9) * 190 * Math.sin(n * PI)]; }
  }
}
function sParticles(u) {
  bg(C.flare);
  const kf = [[1, .02], [2, .52], [3, 1.02], [4, 1.5]];
  const pulse = Math.exp(-(u % .5) * 9);
  for (let i = 0; i < N; i++) {
    let [x, y] = shapePos(0, i, u);
    const d = (i / N) * .13;
    for (const [s, t0] of kf) {
      const p = E.inOutCubic(prog(u, t0 + d, t0 + d + .36)); if (p <= 0) break;
      const [tx, ty] = shapePos(s, i, u); x = lerp(x, tx, p); y = lerp(y, ty, p);
    }
    const r = 4.5 + pulse * 3 * parts[i].j + (parts[i].hi ? 3 : 0);
    ctx.fillStyle = parts[i].hi ? C.bone : C.ink;
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  }
  const names = ['scatter → ring', 'ring → grid', 'grid → phyllotaxis', 'phyllotaxis → wave'];
  return `720 particles · ${names[clamp(Math.floor(u / .5), 0, 3)]}`;
}

function sKnot(u) {
  bg(C.ink);
  const ry = u * 1.5 + .4, rx = .7 + u * .6, cy = Math.cos(ry), sy = Math.sin(ry), cx = Math.cos(rx), sx = Math.sin(rx);
  let S = 175 * E.outExpo(prog(u, 0, .55));
  const push = E.inExpo(prog(u, 1.45, 2));
  S *= 1 + push * 7;
  const tube = .3 + push * .6;
  // orbit ring
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(-.35 + u * .2);
  ctx.strokeStyle = 'rgba(255,77,26,.85)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(0, 0, 820 * E.outExpo(prog(u, .1, .8)), 230 * E.outExpo(prog(u, .1, .8)), 0, 0, TAU); ctx.stroke();
  const oa = u * 3.2; ctx.fillStyle = C.flare; ctx.beginPath(); ctx.arc(Math.cos(oa) * 820, Math.sin(oa) * 230, 12, 0, TAU); ctx.fill();
  ctx.restore();
  const proj = [];
  for (const q of knot) {
    let x = q.p[0] + q.n[0] * tube, y = q.p[1] + q.n[1] * tube, z = q.p[2] + q.n[2] * tube;
    let x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
    let y1 = y * cx - z1 * sx, z2 = y * sx + z1 * cx;
    const pf = 6 / (6 - z2);
    proj.push([W / 2 + x1 * S * pf, H / 2 + y1 * S * pf, z2, pf, q.j]);
  }
  proj.sort((a, b) => a[2] - b[2]);
  for (const [x, y, z, pf, j] of proj) {
    if (x < -50 || x > W + 50 || y < -50 || y > H + 50) continue;
    const dz = clamp((z + 3.2) / 6.4);
    ctx.fillStyle = j === 0 ? C.flare : mix(RGB.cobalt, RGB.bone, dz);
    const r = (1.6 + dz * 3.4) * pf * Math.sqrt(S / 175);
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  }
  const fl = E.inExpo(prog(u, 1.75, 2));
  if (fl > 0) { ctx.globalAlpha = fl; bg(C.bone); ctx.globalAlpha = 1; }
  return '2,700 pts · torus knot (2,3) · perspective';
}

function drawCell(c, u, k) {
  const d0 = Math.hypot(c.cx - W / 2, c.cy - H / 2) / 1100;
  let s = E.outBack(prog(u, d0 * .35, d0 * .35 + .3));
  s *= 1 - E.inCubic(prog(u, 1.68 + d0 * .18, 1.84 + d0 * .18));
  if (s <= 0.001) return;
  const origins = [[0, H / 2], [W, 0], [W / 2, H / 2], [0, H]];
  let rot = c.rot0, pop = 0;
  for (let b = 1; b <= 3; b++) {
    const o = origins[b], dd = Math.hypot(c.cx - o[0], c.cy - o[1]) / 3000;
    const p = prog(u, b * .5 - .08 + dd, b * .5 - .08 + dd + .26);
    rot += E.inOutCubic(p) * PI / 2; pop = Math.max(pop, Math.sin(p * PI));
  }
  ctx.save(); ctx.translate(c.cx, c.cy); ctx.scale(s, s);
  ctx.fillStyle = c.bg; ctx.fillRect(-60.5, -60.5, 121, 121);
  ctx.rotate(rot); const z = 1 - pop * .22; ctx.scale(z, z);
  ctx.fillStyle = c.fg; ctx.beginPath();
  switch (c.type) {
    case 0: ctx.moveTo(-60, -60); ctx.arc(-60, -60, 120, 0, PI / 2); ctx.closePath(); break;
    case 1: ctx.arc(0, 60, 60, PI, TAU); ctx.closePath(); break;
    case 2: ctx.arc(0, 0, 44, 0, TAU); break;
    case 3: ctx.moveTo(-60, -60); ctx.lineTo(60, -60); ctx.lineTo(-60, 60); ctx.closePath(); break;
    case 4: ctx.moveTo(-60, 60); ctx.arc(-60, 60, 120, -PI / 2, 0); ctx.closePath(); ctx.moveTo(60, -60); ctx.arc(60, -60, 120, PI / 2, PI); ctx.closePath(); break;
  }
  ctx.fill(); ctx.restore();
}
function sGrid(u) {
  bg(C.cobalt);
  for (const c of cells) drawCell(c, u);
  return '144 cells · delay = distance / 3000';
}

function sFluid(u) {
  bg(C.cobalt);
  const spread = E.outExpo(prog(u, 0, .7)) * (1 - E.inOutCubic(prog(u, 1.45, 1.95)));
  const grow = E.outBack(prog(u, 0, .45)) * (1 + E.inExpo(prog(u, 1.55, 2)) * 1.6);
  const balls = [];
  for (let i = 0; i < 7; i++) {
    const a = i / 7 * TAU, r = 90 + (i % 3) * 30;
    balls.push([W / 2 + Math.sin(u * (1.3 + i * .21) + a) * 560 * spread, H / 2 + Math.cos(u * (1.7 + i * .17) + a * 1.3) * 300 * spread, r * grow]);
  }
  const bw = 480, bh = 270, sc = W / bw, d = blobImg.data;
  for (let py = 0; py < bh; py++) for (let px = 0; px < bw; px++) {
    const X = px * sc + sc / 2, Y = py * sc + sc / 2; let f = 0;
    for (let b = 0; b < 7; b++) { const dx = X - balls[b][0], dy = Y - balls[b][1]; f += balls[b][2] * balls[b][2] / (dx * dx + dy * dy + 1); }
    const a = sstep(.92, 1.08, f), core = sstep(2.5, 2.75, f), ring = sstep(1.55, 1.65, f) * (1 - sstep(1.7, 1.8, f));
    const o = (py * bw + px) * 4;
    const cr = lerp(lerp(255, 255, core), 243, ring), cg = lerp(lerp(179, 77, core), 239, ring), cb = lerp(lerp(209, 26, core), 230, ring);
    d[o] = cr; d[o + 1] = cg; d[o + 2] = cb; d[o + 3] = a * 255;
  }
  blobLowCtx.putImageData(blobImg, 0, 0);
  lctx.clearRect(0, 0, W, H); lctx.imageSmoothingEnabled = true; lctx.imageSmoothingQuality = 'high';
  lctx.drawImage(blobLow, 0, 0, W, H);
  // text knocks out of the blobs
  lctx.globalCompositeOperation = 'source-atop';
  lctx.font = font(800, 400, FD); lctx.textAlign = 'center'; lctx.fillStyle = C.cobalt; lctx.fillText('FLUID', W / 2, H / 2 + 140);
  lctx.globalCompositeOperation = 'source-over'; lctx.textAlign = 'left';
  ctx.drawImage(layer, 0, 0);
  const tp = E.outExpo(prog(u, .1, .5));
  ctx.font = font(800, 400, FD); ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = `rgba(243,239,230,${tp})`;
  ctx.save(); ctx.translate(W / 2, H / 2 + 140); ctx.scale(lerp(1.15, 1, tp), lerp(1.15, 1, tp)); ctx.strokeText('FLUID', 0, 0); ctx.restore();
  ctx.textAlign = 'left';
  return 'metaballs · Σ r²/d² ≥ 1 · knockout type';
}


const WCOL = [[C.cobalt, C.bone, C.flare], [C.ink, C.flare, C.rose], [C.bone, C.ink, C.flare], [C.flare, C.ink, C.bone], [C.rose, C.ink, C.cobalt]];
function sWord(word, u, v, sub) {
  const [bgc, fg, ac] = WCOL[v % WCOL.length]; bg(bgc);
  const chars = [...word];
  // scrolling outline rows behind
  ctx.save(); ctx.globalAlpha = .16; ctx.strokeStyle = fg; ctx.lineWidth = 2; ctx.font = font(400, 150, FJ); ctx.textBaseline = 'alphabetic';
  const rowW = Math.max(400, ctx.measureText(word + '　').width);
  for (let r = 0; r < 6; r++) { const off = ((u * 600 * (r % 2 ? 1 : -1)) % rowW + rowW) % rowW; for (let x = -rowW + off; x < W + rowW; x += rowW) ctx.strokeText(word, x, 150 + r * 190); }
  ctx.restore();
  let size = Math.min(560, 1650 / Math.max(1, chars.length) * 1.05);
  let f = font(400, size, FJ), L = layout(word, f);
  if (L.total > 1700) { size *= 1700 / L.total; f = font(400, size, FJ); L = layout(word, f); }
  const x0 = W / 2 - L.total / 2, base = H / 2 + size * .36, st = v % 4;
  ctx.font = f; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  if (st === 0) {
    const drop = E.inCubic(prog(u, 0, .12)); let sx = .86, sy = 1.3, y = base - (1 - drop) * 1000;
    if (u >= .12) { const e = E.outElastic(prog(u, .12, .55)); sy = lerp(.55, 1, e); sx = 1 / Math.sqrt(sy); y = base; }
    ctx.save(); ctx.translate(W / 2, y); ctx.scale(sx, sy); ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.fillText(word, 0, 0); ctx.restore();
  } else if (st === 1) {
    const bands = 7, top = base - size * .95, bh = size * 1.15 / bands;
    for (let i = 0; i < bands; i++) { const p = E.outExpo(prog(u, i * .025, .35 + i * .025)), dir = i % 2 ? 1 : -1; ctx.save(); ctx.beginPath(); ctx.rect(0, top + i * bh, W, bh + 1); ctx.clip(); ctx.fillStyle = fg; ctx.fillText(word, x0 + dir * (1 - p) * 1500, base); ctx.restore(); }
    const lp = E.outExpo(prog(u, .1, .45)); ctx.fillStyle = ac; ctx.fillRect(W / 2 - L.total / 2 * lp, base + size * .14, L.total * lp, 14);
  } else if (st === 2) {
    L.chars.forEach((ch, i) => { const p = prog(u, i * .05, .32 + i * .05); if (p <= 0) return; const s = E.outBack(p), r = (1 - E.outCubic(p)) * -.9; ctx.save(); ctx.translate(x0 + L.xs[i] + L.ws[i] / 2, base - size * .35); ctx.rotate(r); ctx.scale(s, s); ctx.fillStyle = i === L.chars.length - 1 ? ac : fg; ctx.textAlign = 'center'; ctx.fillText(ch, 0, size * .35); ctx.restore(); });
  } else {
    for (let e = 3; e >= 1; e--) { const ep = E.outExpo(prog(u, .04 * e, .42 + .04 * e)); ctx.strokeStyle = ac; ctx.globalAlpha = .9 - e * .2; ctx.lineWidth = 3; ctx.strokeText(word, x0, base - e * size * .3 * ep); }
    ctx.globalAlpha = 1; const rp = E.outExpo(prog(u, 0, .3));
    ctx.save(); ctx.beginPath(); ctx.rect(x0 - 20, 0, (L.total + 40) * rp, H); ctx.clip(); ctx.fillStyle = fg; ctx.fillText(word, x0, base); ctx.restore();
  }
  if (sub) { label(sub, 100, 120, 26, fg, 'left', 8); label(`${chars.length} CHARS`, W - 100, 120, 26, fg, 'right', 8); }
}
const SCN = { slate: sSlate, kinetic: sKinetic, particles: sParticles, knot: sKnot, grid: sGrid, fluid: sFluid };
function draw(name, u, o = {}) {
  ctx.setTransform(SC, 0, 0, SC, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.letterSpacing = '0px';
  if (name === 'word') sWord(o.word || 'いん', u, o.v || 0, o.sub); else SCN[name](u);
}
function setScale(s) { SC = s; cv.width = Math.round(W * s); cv.height = Math.round(H * s); }
return { canvas: cv, draw, setScale, W, H };
})();
