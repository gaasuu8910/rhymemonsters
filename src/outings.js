/* =========================================================
   OUTINGS — coins, the clothes shop, dance lessons (rhythm game) and the backstage photo studio
   ========================================================= */
PRG.coins = PRG.coins || 0; PRG.owned = PRG.owned || []; PRG.wear = PRG.wear || {}; PRG.lessons = PRG.lessons || {};
WEAR = PRG.wear;
const coinsEl = () => $('coins');
function addExp(n) { if (!n) return; PRG.exp = Math.max(0, (PRG.exp || 0) + n); save(); try { updateEvoChip(); } catch (e) {} }
function addCoins(n, why) { if (!n) return; PRG.coins = Math.max(0, (PRG.coins || 0) + n); save(); updateCoins(); try { updateShopBadge(); } catch (e) {} try { updateEvoChip(); } catch (e) {} if (n > 0 && why) { const c = $('coinChip'); c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); } }
function updateCoins() { const v = (PRG.coins || 0).toLocaleString(); document.querySelectorAll('[data-coins]').forEach(e => e.textContent = v); }

/* ---------- unlocks: poses & photo backdrops come from dance lessons ---------- */
const POSES = {
  stand: { n: 'キメ立ち', f: t => ({ ry: .18, rz: .03, arms: [.35, .4], hz: .06, mouth: .2 }) },
  peace: { n: 'ピース', f: t => ({ ry: -.22, rz: -.16, arms: [.3, 2.2], hz: .32, eyeS: .35, mouth: .8 }) },
  mic: { n: 'マイクパフォ', f: t => ({ rx: -.16, ry: .38, rz: .1, arms: [.6, 1.3], ax: -.9, hz: -.14, mouth: 1 }) },
  jump: { n: 'ジャンプ', f: t => ({ y: .7, rx: -.12, rz: .12, arms: [2.5, 2.5], eyeS: .35, mouth: 1 }) },
  cool: { n: 'クール', f: t => ({ ry: -.7, rz: .08, arms: [.1, .1], hz: -.16, hx: .1, eyeS: .5, mouth: 0 }) },
  point: { n: '指さし', f: t => ({ rx: -.1, ry: .45, rz: -.14, arms: [.4, 1.6], ax: -1.2, hz: .16, mouth: .6 }) },
  king: { n: '王者', f: t => ({ y: .12, arms: [2.75, 2.75], hx: -.18, mouth: 1 }) },
};
const BGS = {
  studio: { n: 'スタジオ' }, street: { n: '高架下', venue: 0 }, rooftop: { n: '屋上', venue: 1 }, club: { n: '地下クラブ', venue: 2 },
  arena: { n: 'アリーナ', venue: 3 }, stadium: { n: 'スタジアム', venue: 4 }, gold: { n: 'ゴールド' },
};
const LESSONS = [
  { n: 'はじめてのステップ', tpl: 'BACKPACK CYPHER', bpm: 92, dens: 1, bars: 12, pose: 'peace', bg: 'street', coins: 40 },
  { n: 'ハウスのノリ', tpl: 'ROOFTOP HOUSE', bpm: 120, dens: 2, bars: 12, pose: 'mic', bg: 'rooftop', coins: 60 },
  { n: '2ステップの揺れ', tpl: 'NIGHT BUS 2-STEP', bpm: 130, dens: 2, bars: 14, pose: 'jump', bg: 'club', coins: 80 },
  { n: 'トラップの間合い', tpl: '808 SUPERSTAR', bpm: 141, dens: 3, bars: 14, pose: 'cool', bg: 'arena', coins: 100 },
  { n: 'フットワーク特訓', tpl: 'FOOTWORK FRENZY', bpm: 160, dens: 3, bars: 16, pose: 'point', bg: 'stadium', coins: 130 },
  { n: 'ドラムンベース免許皆伝', tpl: 'AMEN ROLLER', bpm: 174, dens: 4, bars: 16, pose: 'king', bg: 'gold', coins: 180 },
];
const poseOk = k => k === 'stand' || PRG.owned.includes('pose:' + k);
const maxStage = () => Math.max(0, ...Object.values(PRG.runs || {}).map(r => BY[r.sp] ? BY[r.sp].stage : 0));
const bgOk = k => k === 'studio' || k === 'street' || (BGS[k].venue != null ? maxStage() >= BGS[k].venue : Object.keys(PRG.cleared || {}).length > 0);
const lessonOpen = i => i === 0 || !!PRG.lessons[i - 1];

/* ---------- punchlines: three per monster, all different ---------- */
const PUNCH0 = {
  0: ['殻の中から 下剋上', 'まだ割れてない でも冴えてる', 'たまごでも 声はでかいぞ'],
  19: ['フードの奥で 燃えるモード', 'クマった時ほど 韻で勝負', 'はちみつより 甘くないフロウ'],
  9: ['化かすのは 韻と人の目', '夕暮れ時が 勝負どき', 'ポンと鳴らせば 本気の音'],
  24: ['白黒つけるぜ このバトル', '笹食って 刺さる言葉', 'パンダだけど 甘くないんだ'],
  26: ['地鳴りのビートで 地位を取る', 'マンモス級の パンチライン', '氷河期でも 熱いこのライム'],
  15: ['夜ふかしの 鋭い眼差し', 'ホーホー言わせる 強烈フロー', 'つむじ風で 吹き飛ぶ君'],
  29: ['九つの尾で 九回KO', '春を呼ぶのは この声のショー', '狐火ともして 心を燃やす'],
  30: ['ヒントはいらない 答えは中に', '黙って踏む それがスタイル', '黒い殻ほど 光る才'],
  10: ['ピヨってないぜ ビビってないぜ', 'ひよこの一歩 未来への一歩', 'ピュンと飛ばすぜ 一番の言葉'],
  11: ['スーツの襟立て 吹かす風', '氷の上でも 滑らないフロウ', 'クールに決める ペンギンの流儀'],
  13: ['急降下で 狙うは頂上', '速さは正義 言葉は刃', '羽ばたく前に もう着地'],
  14: ['雷鳴とどろく 頂の王', '嵐を呼ぶのは 俺の名前', '稲妻フロウで 会場停電'],
  31: ['長い韻ほど 深いイン', 'しましまの殻に 秘めた戦慄', '伸ばせ伸ばせ 言葉の旋律'],
  1: ['キラッと光る 韻のピアス', 'うさ耳で聞く 君の弱点', '跳ねる言葉で 胸を突く'],
  2: ['星に願いを 韻に誓いを', '狐の嫁入り 晴れの舞台', '化かし合いなら 負けはしない'],
  4: ['流れ星より 速いライム', 'ツノで刻む 夢のリズム', '流星群で 埋め尽くすステージ'],
  5: ['銀河の果てまで 届けるライム', '星屑集めて 王冠にする', '宇宙規模の 韻の帝王'],
};

const PUNCH = { ...PUNCH0 }; SPECIES.forEach(r => PUNCH[r[0]] = r[5]);
/* ---------- gear shop: six slots, every piece powers up a stat (ATK / DEF / HP / 滑舌 / カリスマ) ---------- */
// item: [id, name, price, {a, d, h, k, c}]
const SLOTS = {
  head: { n: '頭', items: [['none', 'なし', 0, {}], ['cap', 'キャップ', 80, { a: 4, k: 2 }], ['capBack', 'うしろキャップ', 90, { a: 3, c: 4 }], ['beanie', 'ニット帽', 100, { d: 5, h: 3 }], ['bucket', 'バケハ', 120, { d: 6, k: 3 }], ['snapback', 'スナップバック', 150, { a: 6, c: 4 }], ['party', 'パーティ帽', 120, { c: 9 }], ['phones', 'DJヘッドホン', 240, { k: 12, c: 5 }], ['afro', 'アフロ', 280, { h: 10, c: 10 }], ['crown', '王冠', 480, { a: 8, c: 18 }]] },
  face: { n: '顔', items: [['none', 'なし', 0, {}], ['round', '丸メガネ', 90, { k: 7 }], ['shades', 'サングラス', 130, { a: 6, c: 4 }], ['star', 'スターグラス', 170, { c: 10 }], ['heart', 'ハートグラス', 170, { h: 6, c: 6 }], ['visor', 'サイバーバイザー', 320, { a: 9, k: 9 }]] },
  top: { n: '上', items: [['none', 'なし', 0, {}], ['tee', 'Tシャツ', 60, { h: 4 }], ['hoodie', 'パーカー', 120, { d: 6, h: 4 }], ['hoodieUp', 'フードかぶり', 160, { d: 9, k: 3 }], ['jersey', 'ジャージー', 150, { a: 6, h: 4 }], ['tracksuit', 'セットアップ', 190, { k: 8, d: 4 }], ['overalls', 'オーバーオール', 170, { h: 10 }], ['varsity', 'スタジャン', 240, { a: 7, c: 7 }], ['puffer', 'ダウン', 260, { d: 14, h: 6 }], ['suit', 'スーツ', 300, { c: 14, k: 4 }]] },
  bottom: { n: '下', items: [['none', 'なし', 0, {}], ['shorts', 'ハーフパンツ', 70, { k: 4 }], ['jogger', 'ジョガーパンツ', 130, { k: 6, h: 3 }], ['jeans', 'デニム', 160, { d: 7, h: 3 }], ['cargo', 'カーゴパンツ', 220, { d: 8, a: 5 }], ['gold', 'ゴールドパンツ', 380, { c: 12, a: 6 }]] },
  shoes: { n: '靴', items: [['none', 'はだし', 0, {}], ['sneakers', 'スニーカー', 100, { k: 6 }], ['hightop', 'ハイカット', 180, { d: 6, k: 6 }], ['goldkicks', 'ゴールドキックス', 360, { a: 6, k: 8, c: 8 }]] },
  acc: { n: 'アクセ', items: [['none', 'なし', 0, {}], ['neck:bandana', 'バンダナ', 70, { h: 4 }], ['neck:bowtie', '蝶ネクタイ', 90, { c: 6 }], ['neck:tie', 'ネクタイ', 90, { k: 5 }], ['neck:scarf', 'マフラー', 100, { d: 6 }], ['neck:chain', 'チェーン', 160, { a: 6, c: 4 }], ['neck:bossChain', 'BOSSチェーン', 99999, { a: 12, c: 12 }], ['neck:phonesNeck', '首ヘッドホン', 170, { k: 9 }], ['mic:mic', 'ゴールドマイク', 230, { a: 8, k: 6 }], ['fx:notes', '音符オーラ', 160, { k: 6, c: 4 }], ['fx:hearts', 'ハートオーラ', 160, { h: 8 }], ['fx:fire', 'ファイヤー', 280, { a: 14 }], ['back:boombox', 'ラジカセ', 260, { a: 6, k: 8 }], ['back:cape', 'ヒーローマント', 300, { d: 10, c: 8 }], ['neck:bigChain', '極太チェーン', 340, { a: 10, c: 10 }], ['back:wings', '天使のはね', 420, { h: 14, c: 10 }]] },
  pose: { n: 'ポーズ', pose: true, items: [['stand', 'キメ立ち', 0], ['peace', 'ピース', 60], ['point', '指さし', 90], ['mic', 'マイクパフォ', 120], ['cool', 'クール', 150], ['jump', 'ジャンプ', 180], ['king', '王者', 300]] },
};
const SHOP = SLOTS;
const STAT_KEYS = [['a', '攻撃', 'ATK'], ['d', '防御', 'DEF'], ['h', 'HP', 'HP'], ['k', '滑舌', 'FLOW'], ['c', 'カリスマ', 'CHARISMA']];
const ACC_KEYS = ['neck', 'mic', 'fx', 'back'];
function slotOf(F, slot) {
  if (slot === 'head') return F.hat || 'none';
  if (slot === 'face') return F.glasses || 'none';
  if (slot === 'top') return F.top ? (F.top === 'hoodie' && F.hood ? 'hoodieUp' : F.top) : 'none';
  if (slot === 'bottom') return F.bottom || 'none';
  if (slot === 'shoes') return F.shoes ? (F.shoeStyle || F.shoes) : 'none';
  if (slot === 'acc') { if (F.back) return 'back:' + F.back; if (F.mic) return 'mic:mic'; if (F.neck) return 'neck:' + F.neck; if (F.fx) return 'fx:' + F.fx; return 'none'; }
}
function curValue(slot) { return slot === 'pose' ? (PRG.pose || 'stand') : slotOf(outfitOf(G.sp) || {}, slot); }
function wearPatch(slot, v) {
  if (slot === 'head') return { hat: v === 'none' ? null : v };
  if (slot === 'face') return { glasses: v === 'none' ? null : v };
  if (slot === 'top') return v === 'none' ? { top: null, hood: false } : v === 'hoodieUp' ? { top: 'hoodie', hood: true } : { top: v, hood: false };
  if (slot === 'bottom') return { bottom: v === 'none' ? null : v };
  if (slot === 'shoes') return v === 'none' ? { shoes: null, shoeStyle: null } : { shoes: 'sneakers', shoeStyle: v };
  if (slot === 'acc') { const p = { neck: null, mic: false, fx: null, back: null }; if (v !== 'none') { const [k, x] = v.split(':'); p[k] = k === 'mic' ? true : x; } return p; }
}
const ownedItem = (slot, v) => v === 'none' || (slot === 'pose' && v === 'stand') || PRG.owned.includes(slot + ':' + v);
function isDefault(slot, v) { if (slot === 'pose') return false; const b = OUTFIT[G.sp.id] || {}; return slotOf(b, slot) === v; }
const itemOf = (slot, v) => (SLOTS[slot].items.find(i => i[0] === v) || [])[3] || {};
// base stats grow with each evolution; gear adds on top; everything caps at 100
// base stats: normal line climbs ~10 → 60, the hard lines start ~35 and top out ~85; each species leans its own way
function baseStats(sp) {
  const st = sp.stage, hard = sp.mode !== 'N', A = MOTIF[sp.id] || {}, b = (hard ? 35 : 10) + st * 50 / 3, t = { a: b, d: b, h: b, k: b, c: b };
  const bx = (A.body || [1])[0], lean = (k, v) => t[k] += v * (.5 + st * .2);
  if (bx >= 1.15) { lean('h', 9); lean('d', 6); lean('k', -8); } else if (bx <= .9) { lean('k', 9); lean('a', 4); lean('d', -6); }
  if (A.cool) { lean('a', 9); lean('c', 4); lean('h', -5); } if (A.wings) lean('k', 3); if (A.robot) { lean('d', 4); lean('c', -3); }
  if (A.horn) lean('a', 4); if (A.armor) lean('d', 8); if (A.eyes === 'big' || A.flowerCrown) lean('c', 7); if (A.tail === 'kyubi' || A.mane) lean('c', 8);
  // the branch you pick sets the build: speed / tough at stage 1, punch / guard from stage 2
  if (sp.bi === 0) { lean('k', 10); lean('a', 5); lean('h', -6); } else if (sp.bi === 1) { lean('h', 10); lean('d', 5); lean('k', -6); }
  if (sp.si === 0) { lean('a', 9); lean('c', 7); lean('d', -6); } else if (sp.si === 1) { lean('d', 11); lean('h', 5); lean('c', -6); }
  if (sp.mode === 'H') lean('a', 4); if (sp.mode === 'L') lean('k', 4); if (sp.secret) t.c += 6;
  for (const k in t) t[k] = Math.max(5, Math.min(92, Math.round(t[k]))); return t;
}
function statsOf(sp, F = outfitOf(sp) || {}) {
  const b = baseStats(sp), g = { a: 0, d: 0, h: 0, k: 0, c: 0 };
  if (sp.stage > 0 || true) ['head', 'face', 'top', 'bottom', 'shoes', 'acc'].forEach(sl => { const it = itemOf(sl, slotOf(F, sl)); for (const k in it) g[k] += it[k]; });
  const tot = {}; for (const k in b) tot[k] = Math.min(100, b[k] + g[k]); return { base: b, gear: g, tot };
}
const ST = () => statsOf(G.sp).tot;
const ICON = { 'neck:bossChain': '🔱', none: '✖', stand: '🧍', peace: '✌️', point: '👉', king: '🙌', cool: '😎', jump: '🦘', shorts: '🩳', jogger: '👖', jeans: '👖', cargo: '🪖', gold: '✨', hightop: '👟', goldkicks: '🥇', 'neck:bandana': '🧣', 'neck:bowtie': '🎀', 'neck:tie': '👔', 'neck:scarf': '🧣', 'neck:chain': '⛓️', 'neck:phonesNeck': '🎧', 'mic:mic': '🎤', 'fx:notes': '🎵', 'fx:hearts': '💗', 'fx:fire': '🔥', 'back:boombox': '📻', 'back:cape': '🦸', 'neck:bigChain': '💰', 'back:wings': '🪽', cap: '🧢', capBack: '🧢', snapback: '🧢', beanie: '🧶', bucket: '👒', crown: '👑', afro: '🌀', phones: '🎧', party: '🥳', tee: '👕', hoodie: '🧥', hoodieUp: '🧥', jersey: '🎽', tracksuit: '🏃', overalls: '👖', varsity: '🏈', puffer: '🧥', suit: '🤵', round: '👓', shades: '🕶️', star: '⭐', heart: '💖', visor: '🥽', bandana: '🧣', tie: '👔', bowtie: '🎀', scarf: '🧣', chain: '⛓️', phonesNeck: '🎧', bigChain: '💰', sneakers: '👟', mic: '🎤', cape: '🦸', wings: '🪽', boombox: '📻', sparkle: '✨', fire: '🔥', notes: '🎵', hearts: '💗' };
// aura: particles around the monster, everywhere (lobby, battles, photos)
let auraT = 0;
function auraLoop(dt) {
  if (!rig || OP.on) return; const F0 = outfitOf(G.sp) || {}, st = G.sp.vst ?? G.sp.stage, F = F0.fx ? F0 : { fx: st >= 4 ? 'royal' : st >= 3 ? 'sparkle' : st >= 2 ? 'motes' : null }; if (!F.fx) return;
  const H = (rig.H || 2), R = (rig.R || 1) * 1.15; auraT += dt;
  const rate = F.fx === 'fire' ? .03 : F.fx === 'sparkle' ? (F0.fx ? .05 : .11) : F.fx === 'royal' ? .045 : F.fx === 'motes' ? .2 : .16;
  while (auraT > rate) { auraT -= rate; const a = Math.random() * Math.PI * 2, x = Math.cos(a) * R, z = Math.sin(a) * R * .8;
    if (F.fx === 'motes') FX.glint.emit({ x, y: Math.random() * H * .8, z, n: 1, color: ['#FFFFFF', '#BFE6FF'], speed: [.05, .2], up: .3, size: [.15, .3], life: [.8, 1.4], grav: -.2 });
    if (F.fx === 'royal') { FX.glint.emit({ x, y: Math.random() * H, z, n: 1, color: ['#FFE066', '#FFFFFF', '#FFC21A'], speed: [.1, .5], up: .5, size: [.3, .65], life: [.7, 1.2], grav: -.3 }); if (Math.random() < .25) FX.star.emit({ x: x * .6, y: H * 1.05, z: z * .6, n: 1, color: ['#FFE066'], speed: [.2, .6], up: 1, size: [.25, .45], life: [.8, 1.2], grav: .5 }); }
    if (F.fx === 'sparkle') FX.glint.emit({ x, y: Math.random() * H, z, n: 1, color: ['#FFFFFF', '#FFE066', '#BFE6FF'], speed: [.1, .4], up: .3, size: [.25, .55], life: [.6, 1.1], grav: 0 });
    if (F.fx === 'fire') FX.glint.emit({ x: x * .9, y: Math.random() * H * .25, z: z * .9, n: 2, color: ['#FF4D1A', '#FFC21A', '#FF2E4D'], speed: [.2, .6], up: 1, size: [.35, .7], life: [.45, .8], grav: -2.4 });
    if (F.fx === 'notes') FX.note.emit({ x, y: Math.random() * H * .6, z, n: 1, color: ['#FF4D8D', '#56D9F5', '#FFC21A', '#B36BFF'], speed: [.3, .7], up: 1, grav: -.4, size: [.3, .5], life: [1, 1.6] });
    if (F.fx === 'hearts') FX.heart.emit({ x, y: Math.random() * H * .6, z, n: 1, color: ['#FF3D7F', '#FF8FB1'], speed: [.3, .7], up: 1, grav: -.4, size: [.3, .5], life: [1, 1.6] }); }
}
function shopCam(tab) { // zoom to whatever you are changing
  const h = rig ? rig.H : 2; Cam.lastUser = 1e9;
  if (tab === 'head' || tab === 'face') { Cam.tTgt.set(0, -h * .05, 0); Cam.tDist = Cam.base * .8; Cam.tAz = 0; Cam.tEl = .14; }
  else if (tab === 'acc' && false) { Cam.tTgt.set(0, -h * .2, 0); Cam.tDist = Cam.base * .9; Cam.tAz = Math.PI * .78; Cam.tEl = .16; }
  else if (tab === 'shoes' || tab === 'bottom') { Cam.tTgt.set(0, -h * .5, 0); Cam.tDist = Cam.base * .9; Cam.tAz = .3; Cam.tEl = .3; }
  else frameFor('shop');
}
const SWATCH = ['#FFFFFF', '#2B2633', '#E8452C', '#FFC21A', '#3D7BFF', '#2E9B5E', '#FF8FB1', '#B36BFF', '#56D9F5', '#6B4A33'];

/* ---------- shared screen helpers ---------- */
function enterOuting(cls) { document.body.classList.add('outing', 'calm', cls); clearConfetti(); hideBubble(); if (cls === 'o-shop') G.bgOver = { studio: 'studio' }; }
function leaveOuting() { document.body.classList.remove('outing', 'calm', 'o-shop', 'o-lesson', 'o-photo'); G.state = 'idle'; G.pose = null; G.bgOver = null; camReset(); Cam.lastUser = -99; updateHud(); }
function frameFor(kind) { // keep the monster clear of the bottom sheet
  const h = rig ? rig.H : 2;
  if (kind === 'shop') { Cam.tTgt.set(0, -h * .55, 0); Cam.tDist = Cam.base * 1.15; }
  if (kind === 'photo') { Cam.tTgt.set(0, h * .16, 0); Cam.tDist = Cam.base * .84; }
  if (kind === 'lesson') { const wide = camera.aspect > 1.1; Cam.tTgt.set(-1.25 * Math.max(1, rigScale * .9), h * (wide ? .1 : -.05), 0); Cam.tDist = Cam.base * (wide ? 1.25 : 1.2); }
  Cam.tAz = 0; Cam.tEl = .14; Cam.lastUser = 1e9;
}

/* =========================================================
   おでかけ menu
   ========================================================= */
function openOut() { if (G.state !== 'idle') return; updateCoins(); $('outModal').hidden = false; SFX.ui(); }
$('outBtn').addEventListener('click', () => { if (G.state === 'idle') openShop(); });
$('statBtn').addEventListener('click', () => { if (G.state === 'idle') openStatus(); });
$('outClose').addEventListener('click', () => { $('outModal').hidden = true; });
$('outShop').addEventListener('click', () => { $('outModal').hidden = true; openShop(); });
$('outLesson').addEventListener('click', () => { $('outModal').hidden = true; openLessons(); });

/* =========================================================
   服屋 STREET THREADS
   ========================================================= */
const GAME_URL = 'https://rhymemonsters.gasugame.workers.dev/';
// 公開告知ポストのURL（例: https://x.com/アカウント/status/123…）を入れると、みんなの投稿がそのポストの引用になる
const QUOTE_URL = '';
// straight to X: the post composer with the text (+ the launch post as a quote when set)
function postToX(text) { const a = document.createElement('a'); a.href = 'https://x.com/intent/tweet?text=' + encodeURIComponent(text) + (QUOTE_URL ? '&url=' + encodeURIComponent(QUOTE_URL) : ''); a.target = '_blank'; a.rel = 'noopener'; document.body.appendChild(a); a.click(); a.remove(); }
// the best rhyme you landed this battle / run, for share cards and posts
function bestLine() { const b = G.best; if (!b) return null; return { w: b.w, a: b.a, lab: (SLAM[b.g] || ['', ''])[0] }; }
const SH = { tab: 'head', sel: null, prev: null };
function openShop() {
  G.state = 'shop'; enterOuting('o-shop'); stopDance(); G.pose = PRG.pose || 'stand';
  SH.tab = 'head'; SH.sel = null; WEAR_PREVIEW = null; shopCam(SH.tab); renderShop(); $('shop').hidden = false; SFX.ui();
}
function closeShop() { WEAR_PREVIEW = null; G.pose = null; setMonster(G.sp, false); $('shop').hidden = true; leaveOuting(); startDance(true); if (SH.ret === 'lobby') { SH.ret = null; showBracket('lobby'); } }
// five stat bars; with a preview, the change shows as a green/red segment
const STAT_INFO = { a: '正解1回のスコアが増える（100で1.5倍）', d: '連続正解でガード🛡がたまり、次のミスを1回防ぐ（10で8連続ごと → 100で3連続ごと）。50以上なら最初からガード1つ', h: 'ライフが増える（40で4つ、80で5つ）', k: 'テンポの上がり方がゆるやかになる（50で2割、100で4割ゆるやか）', c: 'コンボがつながるほど伸びるスコア倍率が上がる' };
function statBars(el, now, next, info) {
  el.innerHTML = STAT_KEYS.map(([k, ja, en]) => { const a = now.tot[k], b = next ? next.tot[k] : a, base = now.base[k], d = b - a;
    return `<div class="sb"><span class="sl"><b>${ja}</b><i>${en}</i></span><span class="sbar"><i class="bs" style="width:${base}%"></i><i class="bg" style="left:${base}%;width:${Math.max(0, Math.min(a, b) - base)}%"></i>${d > 0 ? `<i class="up" style="left:${a}%;width:${d}%"></i>` : d < 0 ? `<i class="dn" style="left:${b}%;width:${-d}%"></i>` : ''}</span><em>${b}${d ? `<small class="${d > 0 ? 'p' : 'm'}">${d > 0 ? '+' : ''}${d}</small>` : ''}</em>${info ? `<p class="si">${STAT_INFO[k]}</p>` : ''}</div>`; }).join('');
}
function fxDemo(v) { if (!GEAR_FX[v]) return; setTimeout(() => { try { if (/phones/.test(v)) SFX.scratch(); if (v === 'mic:mic') bubble('MIC DROP!! 🎤', petName()); if (v === 'crown') ring('#FFC93D', { big: 7 }); if (v === 'fx:fire') FX.star.emit({ x: 0, y: 1.2 * rigScale, z: 0, n: 60, color: ['#FF4D1A', '#FFC93D'], speed: [3, 6], up: .9, size: [.3, .6] }); if (v === 'shades') slam('COOL…', '', 'g4'); SFX.grade(5); } catch (e) {} }, 350); }
const GEAR_FX_MORE = { cap: '正解で星がはじける', sneakers: 'コンボで足音', goldkicks: '神韻で金ふぶき', 'neck:bossChain': '神韻で赤い稲妻' };
const GEAR_FX = { phones: '正解でスクラッチ', 'neck:phonesNeck': '正解でスクラッチ', 'mic:mic': 'ORIGINALでMIC DROP', crown: '神韻で金のリング', 'fx:fire': '神韻で炎', shades: '神韻で COOL…', ...GEAR_FX_MORE };
function renderShop() {
  updateCoins();
  const egg = false, c = SLOTS[SH.tab], cur = curValue(SH.tab);
  $('shopTabs').innerHTML = Object.entries(SLOTS).map(([k, t]) => `<button class="${k === SH.tab ? 'on' : ''}" data-t="${k}">${t.n}</button>`).join('');
  const items = c.items.slice().sort((x, y) => (GEAR_FX[y[0]] ? 1 : 0) - (GEAR_FX[x[0]] ? 1 : 0) || (x[0] === 'none' ? -1 : y[0] === 'none' ? 1 : 0));
  $('shopGrid').innerHTML = egg ? '<p class="shop-egg">🥚 ✕</p>' : items.map(([v, n, p, st]) => {
    const own = ownedItem(SH.tab, v) || isDefault(SH.tab, v), on = (SH.sel || cur) === v, worn = cur === v;
    const tags = (st ? STAT_KEYS.filter(([k]) => st[k]).map(([k, ja]) => `<u>${ja}+${st[k]}</u>`).join('') : '') + (GEAR_FX[v] ? `<u class="fxu">✨${GEAR_FX[v]}</u>` : '');
    return `<button class="it ${on ? 'on' : ''} ${worn ? 'worn' : ''} ${p >= 280 ? 'rare' : ''}" data-v="${v}"><i class="ic">${ICON[v] || '✦'}</i><b>${n}</b><span>${worn && !own ? '試着中' : worn ? 'EQUIP' : own ? 'OWNED' : p >= 99999 ? '🔒BOSS撃破' : `<i class="cn">◎</i>${p}`}</span>${tags ? `<em class="tg">${tags}</em>` : ''}</button>`; }).join('');
  // stat preview for the selected (or worn) item
  const now = statsOf(G.sp, outfitOf(G.sp)), F0 = outfitOf(G.sp) || {}, nx = SH.sel && !c.pose ? statsOf(G.sp, { ...F0, ...wearPatch(SH.tab, SH.sel) }) : null;
  $('shopStats').hidden = !!c.pose; if (!c.pose) statBars($('shopStats'), now, nx);
  $('shopColors').hidden = true;
  const sel = SH.sel && c.items.find(i => i[0] === SH.sel), need = sel && !(ownedItem(SH.tab, sel[0]) || isDefault(SH.tab, sel[0]));
  $('shopBuy').hidden = !need; $('shopNote').innerHTML = '';
  if (sel && nx) { const d = STAT_KEYS.filter(([k]) => nx.tot[k] !== now.tot[k]).map(([k, ja]) => `${ja} ${now.tot[k]}→<b>${nx.tot[k]}</b>`).join('　'); $('shopNote').innerHTML = (d || '') + (GEAR_FX[sel[0]] ? `　✨${GEAR_FX[sel[0]]}` : ''); }
  if (need && sel[2] >= 99999) { $('shopBuy').innerHTML = '🔒 BOSSを倒すと手に入る'; $('shopBuy').disabled = true; }
  else if (need) { const lack = sel[2] - (PRG.coins || 0); $('shopBuy').innerHTML = lack > 0 ? `試着中 ・ あと<i class="cn">◎</i>${lack}` : `◎${sel[2]} で買う！`; $('shopBuy').disabled = lack > 0; $('shopBuy').classList.toggle('can', lack <= 0); }
}
function applyWear(patch, preview) {
  if (preview) WEAR_PREVIEW = { ...patch };
  else { WEAR_PREVIEW = null; WEAR[G.sp.id] = { ...(WEAR[G.sp.id] || {}), ...patch }; save(); }
  setMonster(G.sp, false); shopCam(SH.tab);
}
$('shopTabs').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; SH.tab = b.dataset.t; SH.sel = null; if (WEAR_PREVIEW) { WEAR_PREVIEW = null; setMonster(G.sp, false); } G.pose = PRG.pose || 'stand'; shopCam(SH.tab); renderShop(); SFX.ui(); });
$('shopGrid').addEventListener('click', e => {
  const b = e.target.closest('.it'); if (!b) return; const v = b.dataset.v, slot = SH.tab;
  if (slot === 'pose') { G.pose = v; if (ownedItem('pose', v)) { PRG.pose = v; SH.sel = null; save(); react('joy'); } else SH.sel = v; SFX.ui(); return renderShop(); }
  if (ownedItem(slot, v) || isDefault(slot, v)) { SH.sel = null; applyWear(wearPatch(slot, v), false); react('joy'); SFX.hit(2); }
  else { SH.sel = v; applyWear(wearPatch(slot, v), true); react('wow'); SFX.ui(); fxDemo(v); FX.glint.emit({ x: 0, y: (rig ? rig.H : 2) * .6, z: .6, n: 30, rainbow: true, speed: [1.5, 3.5], up: .4, size: [.25, .5] }); }
  renderShop();
});
$('shopBuy').addEventListener('click', () => {
  const c = SLOTS[SH.tab], it = c.items.find(i => i[0] === SH.sel); if (!it || PRG.coins < it[2]) return;
  PRG.owned.push(SH.tab + ':' + it[0]); addCoins(-it[2]); SH.sel = null;
  if (c.pose) { PRG.pose = it[0]; G.pose = it[0]; save(); } else applyWear(wearPatch(SH.tab, it[0]), false);
  react('joy'); confetti(60, { y: 2, burst: 5 }); SFX.milestone(); banner(`<b>GET! ${it[1]}</b>`, 1400); renderShop();
});
$('shopBack').addEventListener('click', closeShop);
$('shopReset').addEventListener('click', () => { delete WEAR[G.sp.id]; save(); SH.sel = null; WEAR_PREVIEW = null; setMonster(G.sp, false); renderShop(); SFX.ui(); });

/* =========================================================
   ダンスレッスン STEP STUDIO — the teacher dances a bar, you copy it on the next bar.
   TAP = a step (tap your monster), HOLD = a pose (press and keep holding until the bar marks it ends)
   ========================================================= */
const MOVES = {
  1: ['T...T...T...T...', 'T...T...H-------', 'H-------T...T...', 'T.......T.......'],
  2: ['T...T.T.T...T...', 'T...H---T...H---', 'T.T.T...H-------', 'H---....T.T.T...'],
  3: ['T..T..T.T...H---', 'T.T.H---T.T.H---', '..T...T...T.T.T.', 'H-..T.T.H-..T...'],
  4: ['T..T..T...T.H---', 'T.TT..T.T..TT...', 'H---T.T.H---TT..', '..T..T..T..TH---'],
  5: ['T.T.TT.TH---T.T.', 'TT..TT..H---TTT.', 'T..T..TTH-..T.T.', 'H-.TH-.TT.T.H---'],
  6: ['TTT.TT.TH-TTH---', 'T.TTH-TTT.TTH---', 'TT.TTT.TH---TTTT', 'H-TTH-TTTTH-H---'],
};
const TEACHERS = [[28, 'モモ先生'], [6, 'リス先生'], [3, 'ニャン先生'], [16, 'インコ先生'], [7, 'ヨル先生'], [20, 'ケロ先生']];
const LS = { on: false, ph: [], ev: [], t0: 0, s16: .1, end: 0, combo: 0, max: 0, hit: 0, tot: 0, score: 0, judged: { p: 0, g: 0, o: 0, m: 0 }, lesson: null, idx: 0, teacher: null, press: null, cur: -1 };
function parseMove(str) { const out = []; for (let i = 0; i < 16; i++) { const c = str[i]; if (c === 'T') out.push({ s: i, type: 'tap', len: 0 }); if (c === 'H') { let n = 1; while (str[i + n] === '-') n++; out.push({ s: i, type: 'hold', len: n }); } } return out; }
function openLessons() {
  updateCoins();
  $('lessonList').innerHTML = LESSONS.map((l, i) => { const open = lessonOpen(i), done = PRG.lessons[i];
    return `<button class="ls ${open ? '' : 'locked'} ${done ? 'done' : ''}" data-i="${i}" ${open ? '' : 'aria-disabled="true"'}><span class="lv">LESSON ${i + 1} · ${TEACHERS[i][1]}</span><b>${l.n}</b><em>${l.bpm} BPM・${'★'.repeat(Math.ceil(l.dens * 1.5))}</em><span class="rw">${done ? `CLEAR ${done.rank}` : open ? `🎁 ${POSES[l.pose].n} ／ ${BGS[l.bg].n}` : '🔒'}</span></button>`; }).join('');
  $('lessonModal').hidden = false;
}
$('lessonList').addEventListener('click', e => { const b = e.target.closest('.ls'); if (!b) return; const i = +b.dataset.i; if (!lessonOpen(i)) { SFX.miss(); return; } $('lessonModal').hidden = true; startLesson(i); });
$('lessonClose').addEventListener('click', () => { $('lessonModal').hidden = true; });
function lessonTrack(l) { const base = TRACKS.find(t => t.id === l.tpl) || TRACKS[0]; return { ...base, bpm: l.bpm, id: `LESSON — ${l.n}`, sp: -1 }; }
function placeTeacher(i) {
  if (LS.teacher) scene.remove(LS.teacher.root);
  const [id] = TEACHERS[i], t = buildMonster(BY[id]); t.root.position.set(-2.5 * Math.max(1, rigScale * .9), 0, -.6); t.root.rotation.y = .45; t.root.scale.setScalar(.82); scene.add(t.root); LS.teacher = t; t.hop = 0; t.hold = 0;
}
function startLesson(i) {
  const l = LESSONS[i]; audioInit(); stopDance();
  G.state = 'lesson'; enterOuting('o-lesson'); G.pose = null; G.bgOver = { venue: 2, mode: G.mode };
  const T = lessonTrack(l); Seq.home = T; Seq.lesson = true; seqMode('dance', { bpm: l.bpm }); G.dancing = false;
  const s16 = 60 / l.bpm / 4, g0 = Math.ceil((Seq.step + 4) / 16) * 16, t0 = Seq.next + (g0 - Seq.step) * s16 + 16 * s16; // one bar count-in
  const d = i + 1, bank = k => MOVES[Math.max(1, Math.min(6, k))], nPh = 7, ph = [];
  for (let p = 0; p < nPh; p++) { const src = p < 2 ? bank(d - 1) : bank(d); ph.push(src[(p * 3 + i) % src.length]); }
  const ev = []; ph.forEach((m, p) => parseMove(m).forEach(e => ev.push({ ...e, p, t: t0 + ((p * 2 + 1) * 16 + e.s) * s16, te: t0 + ((p * 2 + 1) * 16 + e.s + e.len) * s16, demo: t0 + (p * 2 * 16 + e.s) * s16, demoEnd: t0 + (p * 2 * 16 + e.s + e.len) * s16, done: false, score: 0 })));
  Object.assign(LS, { on: true, lesson: l, idx: i, ph, ev, t0, s16, end: t0 + nPh * 32 * s16 + 4 * s16, combo: 0, max: 0, hit: 0, score: 0, tot: ev.length, judged: { p: 0, g: 0, o: 0, m: 0 }, press: null, cur: -1, demoFired: new Set() });
  placeTeacher(i);
  $('lnTitle').textContent = `LESSON ${i + 1} · ${TEACHERS[i][1]}「${l.n}」`; $('lnJudge').textContent = ''; $('lnScore').textContent = '0'; $('lnCombo').textContent = '';
  frameFor('lesson'); $('lesson').hidden = false;
  const cd = $('lnCount'); cd.hidden = false; const beat = 60 / l.bpm; [3, 2, 1, 'お手本!'].forEach((x, k) => setTimeout(() => { cd.textContent = x; cd.classList.remove('pop'); void cd.offsetWidth; cd.classList.add('pop'); if (k === 3) setTimeout(() => cd.hidden = true, 600); }, Math.max(0, (t0 - 4 * beat + k * beat - AT()) * 1000)));
}
function drawPhrase(p, mine) {
  const evs = LS.ev.filter(e => e.p === p);
  $('lnTrack').innerHTML = Array.from({ length: 16 }, (_, k) => `<i class="cell ${k % 4 === 0 ? 'b' : ''}"></i>`).join('') + evs.map(e => `<span class="mv ${e.type}" data-k="${LS.ev.indexOf(e)}" style="left:${e.s / 16 * 100}%;${e.type === 'hold' ? `width:${e.len / 16 * 100}%` : ''}"><b>${e.type === 'tap' ? 'TAP' : 'HOLD'}</b></span>`).join('') + '<em class="head" id="lnHead"></em>';
  const L = $('lnTurn'); L.className = 'ln-turn ' + (mine ? 'you' : 'demo'); L.innerHTML = mine ? '<b>まねして！</b><small>YOUR TURN</small>' : `<b>お手本</b><small>${TEACHERS[LS.idx][1]}</small>`;
}
function lnJudge(q, e) {
  const J = $('lnJudge'), names = ['MISS', 'GOOD', 'GREAT', 'PERFECT'];
  J.textContent = names[q]; J.className = 'ln-judge q' + q; void J.offsetWidth; J.classList.add('show');
  if (e) { e.done = true; e.score = [0, .4, .75, 1][q]; const el = $('lnTrack').querySelector(`[data-k="${LS.ev.indexOf(e)}"]`); if (el) el.classList.add(q ? 'ok' : 'ng', 'q' + q); }
  if (q) { LS.combo++; LS.max = Math.max(LS.max, LS.combo); LS.hit += [0, .4, .75, 1][q]; LS.score += [0, 50, 80, 100][q] * (1 + Math.min(LS.combo, 40) * .025); SFX.hit(q); if (q === 3) FX.glint.emit({ x: 0, y: 1.2 * rigScale, z: .5, n: 24, color: ['#FFC21A', '#F3EFE6', '#56D9F5'], speed: [2, 5], up: .7, size: [.25, .5] }); }
  else LS.combo = 0;
  LS.judged[['m', 'o', 'g', 'p'][q]]++;
  $('lnCombo').textContent = LS.combo >= 3 ? `${LS.combo} COMBO` : ''; $('lnScore').textContent = Math.round(LS.score).toLocaleString();
}
const winQ = d => d <= .07 ? 3 : d <= .12 ? 2 : d <= .19 ? 1 : 0;
function lnDown(ts) {
  if (!LS.on || LS.press) return; const now = ts && ts > 1 ? ts / 1000 : AT(); // judged on the event's own timestamp
  LS.press = { t: now, e: null }; $('lnPad').classList.add('down');
  let best = null, bd = 1; for (const e of LS.ev) { if (e.done) continue; const d = Math.abs(e.t - now); if (d < bd) { bd = d; best = e; } }
  if (best && bd <= .19) { if (best.type === 'tap') { lnJudge(winQ(bd), best); react('boing'); } else { LS.press.e = best; LS.press.q0 = winQ(bd); G.pose = 'king'; } }
  else { react('nod'); }
}
function lnUp(ts) {
  if (!LS.on || !LS.press) return; const now = ts && ts > 1 ? ts / 1000 : AT(), pr = LS.press; LS.press = null; $('lnPad').classList.remove('down'); G.pose = null;
  if (pr.e && !pr.e.done) { const q1 = winQ(Math.abs(pr.e.te - now) * .8); lnJudge(Math.min(pr.q0, q1) || (q1 ? 1 : 0), pr.e); if (q1) react('joy'); }
}
$('lnPad').addEventListener('pointerdown', e => { e.preventDefault(); try { $('lnPad').setPointerCapture(e.pointerId); } catch (x) {} lnDown(e.timeStamp); });
['pointerup', 'pointercancel'].forEach(k => $('lnPad').addEventListener(k, e => lnUp(e.timeStamp)));
document.addEventListener('keydown', e => { if (!LS.on || e.repeat || (e.code !== 'Space' && e.key !== 'Enter')) return; e.preventDefault(); lnDown(e.timeStamp); });
document.addEventListener('keyup', e => { if (!LS.on || (e.code !== 'Space' && e.key !== 'Enter')) return; e.preventDefault(); lnUp(e.timeStamp); });
$('lnQuit').addEventListener('click', () => endLesson(true));
function endLesson(quit) {
  if (!LS.on) return; LS.on = false; Seq.lesson = false; $('lesson').hidden = true; G.pose = null; if (LS.teacher) { scene.remove(LS.teacher.root); LS.teacher = null; }
  const acc = LS.tot ? LS.hit / LS.tot : 0, rank = acc >= .95 ? 'S' : acc >= .85 ? 'A' : acc >= .7 ? 'B' : 'C', clear = !quit && acc >= .7, i = LS.idx, l = LS.lesson, first = clear && !PRG.lessons[i];
  if (clear) { const prev = PRG.lessons[i]; PRG.lessons[i] = { rank: prev && 'SABC'.indexOf(prev.rank) < 'SABC'.indexOf(rank) ? prev.rank : rank }; addCoins(first ? l.coins : Math.round(l.coins / 4), true); }
  save(); G.state = 'lessonDone';
  $('lrRank').textContent = quit ? '—' : rank; $('lrRank').className = 'lr-rank r' + (quit ? 'X' : rank);
  $('lrTitle').textContent = quit ? 'レッスン中断' : clear ? 'LESSON CLEAR!' : 'もう少し！';
  $('lrStats').innerHTML = `<div><b>${Math.round(acc * 100)}%</b><span>シンクロ率</span></div><div><b>${LS.max}</b><span>MAX COMBO</span></div><div><b>${LS.judged.p}</b><span>PERFECT</span></div>`;
  $('lrMsg').innerHTML = first ? `<b>NEW</b> ${POSES[l.pose].n} ／ ${BGS[l.bg].n}　◎${l.coins}` : clear ? `◎${Math.round(l.coins / 4)}` : '';
  $('lessonResult').hidden = false;
  if (clear) { confetti(160, { y: 2.5, burst: 7 }); SFX.milestone(); SFX.crowd(1); react('joy'); } else react('sad');
}
$('lrAgain').addEventListener('click', () => { $('lessonResult').hidden = true; startLesson(LS.idx); });
$('lrBack').addEventListener('click', () => { $('lessonResult').hidden = true; leaveOuting(); startDance(true); });
function lessonLoop(dt) {
  if (!LS.on) return; const now = AT(), bar = 16 * LS.s16, k = Math.floor((now - LS.t0) / bar), p = k >> 1, mine = k % 2 === 1;
  if (k >= 0 && k !== LS.cur && p < LS.ph.length) { LS.cur = k; drawPhrase(p, mine); if (!mine) { const t = LS.teacher; if (t) t.cheer = 1; } else SFX.ui(); }
  const head = $('lnHead'); if (head && k >= 0) head.style.left = clamp(((now - LS.t0) % bar) / bar) * 100 + '%';
  // the teacher performs the demo bar
  const t = LS.teacher; if (t) {
    for (const e of LS.ev) { const key = LS.ev.indexOf(e); if (!LS.demoFired.has(key) && now >= e.demo) { LS.demoFired.add(key); if (e.type === 'tap') { t.hop = 1; SFX.pop(4); } else { t.hold = e.demoEnd; SFX.boing(); } const el = $('lnTrack').querySelector(`[data-k="${key}"]`); if (el) { el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 260); } } }
    t.hop = Math.max(0, t.hop - dt * 5); const holding = now < (t.hold || 0);
    t.body.position.y = Math.sin(t.hop * Math.PI) * .45 + (holding ? .15 : 0); const sq = 1 - (t.hop > .85 ? .12 : 0) + (holding ? .04 : 0); t.body.scale.set(1 / Math.sqrt(sq), sq, 1 / Math.sqrt(sq));
    (t.arms || []).forEach(([pv, d]) => pv.rotation.z = d * (holding ? 2.6 : .35 + t.hop * 1.2)); if (t.head) t.head.rotation.z = Math.sin(now * 3) * .08;
    const blink = (now % 3.3) < .12 ? .1 : 1; t.eyes.forEach(e => e.scale.y = holding ? .35 : blink);
  }
  // misses: an event whose window passed untouched
  for (const e of LS.ev) if (!e.done && now > (e.type === 'hold' ? Math.max(e.t + .3, LS.press && LS.press.e === e ? e.te + .35 : e.t + .3) : e.t + .3)) { if (LS.press && LS.press.e === e) continue; lnJudge(0, e); }
  $('lnProg').style.transform = `scaleX(${clamp((now - LS.t0) / (LS.end - LS.t0))})`;
  if (now > LS.end) endLesson(false);
}
/* =========================================================
   楽屋フォト — 宣材写真
   ========================================================= */
const PH = { bg: 'studio', pose: 'stand', punch: 0, want: false };
function openPhoto() {
  if (G.state !== 'idle') return; G.state = 'photo'; enterOuting('o-photo'); stopDance();
  if (!bgOk(PH.bg)) PH.bg = 'studio'; if (!poseOk(PH.pose)) PH.pose = 'stand'; PH.punch = PH.punch % 3;
  G.pose = PH.pose; setPhotoBg(); frameFor('photo'); renderPhoto(); $('photo').hidden = false; SFX.ui();
}
function setPhotoBg() { const b = BGS[PH.bg]; G.bgOver = b.venue != null ? { venue: b.venue, mode: G.sp.secret ? 'S' : G.mode } : { studio: PH.bg }; }
function renderPhoto() {
  const lines = PUNCH[G.sp.id] || PUNCH[0];
  $('phBg').innerHTML = Object.entries(BGS).map(([k, b]) => `<button class="${k === PH.bg ? 'on' : ''} ${bgOk(k) ? '' : 'lk'}" data-k="${k}">${bgOk(k) ? b.n : '🔒'}</button>`).join('');
  $('phPose').innerHTML = Object.entries(POSES).map(([k, p]) => `<button class="${k === PH.pose ? 'on' : ''} ${poseOk(k) ? '' : 'lk'}" data-k="${k}">${poseOk(k) ? p.n : '🔒'}</button>`).join('');
  $('phPunch').innerHTML = lines.map((l, i) => `<button class="${i === PH.punch ? 'on' : ''}" data-k="${i}">${l}</button>`).join('');
  $('phLine').textContent = lines[PH.punch]; $('phWho').textContent = `${petName()} — ${G.sp.name}`;
}
const lockMsg = '🔒 LESSON';
$('phBg').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; if (!bgOk(b.dataset.k)) return banner(`<b>${lockMsg}</b>`, 1600); PH.bg = b.dataset.k; setPhotoBg(); renderPhoto(); SFX.ui(); });
$('phPose').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; if (!poseOk(b.dataset.k)) return banner(`<b>${lockMsg}</b>`, 1600); PH.pose = b.dataset.k; G.pose = PH.pose; renderPhoto(); SFX.ui(); });
$('phPunch').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; PH.punch = +b.dataset.k; renderPhoto(); SFX.ui(); });
$('phBack').addEventListener('click', () => { $('photo').hidden = true; leaveOuting(); startDance(true); });
$('phShoot').addEventListener('click', () => { PH.pr = renderer.getPixelRatio(); try { renderer.setPixelRatio(Math.min(3, PH.pr * 2)); if (composer && composer.setPixelRatio) composer.setPixelRatio(renderer.getPixelRatio()); resize(); } catch (e) {} PH.wait = 2; PH.want = true; PH.text = null; flash(.9, .5); SFX.scratch(); });
$('photoBtn').addEventListener('click', openPhoto);
// called right after the frame is rendered, while the WebGL buffer still holds it
function photoCapture() {
  if (!PH.want) return; if (PH.wait > 0) { PH.wait--; return; } PH.want = false;
  const fr = $('phFrame').getBoundingClientRect(), cr = cv.getBoundingClientRect(), sx = cv.width / cr.width, sy = cv.height / cr.height;
  const x0 = (fr.left - cr.left) * sx, y0 = (fr.top - cr.top) * sy, w0 = fr.width * sx, h0 = fr.height * sy;
  const W = 1080, H = 1350, out = document.createElement('canvas'); out.width = W; out.height = H; const x = out.getContext('2d');
  x.drawImage(cv, x0, y0, w0, h0, 0, 0, W, H);
  const FJ = '"Dela Gothic One", "Hiragino Sans", sans-serif', FD = '"Bricolage Grotesque", "Arial Black", sans-serif', FM = '"Martian Mono", ui-monospace, monospace';
  // frame & logo
  x.strokeStyle = 'rgba(243,239,230,.9)'; x.lineWidth = 6; const c = 46, m = 34; [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]].forEach(([px, py, dx, dy]) => { x.beginPath(); x.moveTo(px, py + dy * c); x.lineTo(px, py); x.lineTo(px + dx * c, py); x.stroke(); });
  x.font = `800 40px ${FD}`; x.fillStyle = '#F3EFE6'; x.textBaseline = 'top'; x.fillText('RHYME MONSTERS', 70, 66); x.fillStyle = '#FF4D1A'; x.fillText('/', 70 + x.measureText('RHYME MONSTERS').width + 4, 66);
  x.font = `600 20px ${FM}`; x.fillStyle = 'rgba(243,239,230,.85)'; x.textAlign = 'right'; x.fillText(`${MODE().cup} · ${ROUND[RND()]}`, W - 70, 76); x.textAlign = 'left';
  const crowns = Object.keys(MODES).filter(k => PRG.cleared[k]).length; if (crowns) { x.font = `400 34px ${FJ}`; x.fillStyle = '#FFC21A'; x.textAlign = 'right'; x.fillText('♛'.repeat(crowns), W - 70, 110); x.textAlign = 'left'; }
  // bottom: punchline
  const g = x.createLinearGradient(0, H * .58, 0, H); g.addColorStop(0, 'rgba(11,11,20,0)'); g.addColorStop(1, 'rgba(11,11,20,.92)'); x.fillStyle = g; x.fillRect(0, H * .58, W, H * .42);
  const line = (PUNCH[G.sp.id] || PUNCH[0])[PH.punch], parts = line.split(' ');
  let fs = 96; x.font = `400 ${fs}px ${FJ}`; const widest = Math.max(...parts.map(p => x.measureText(p).width)); if (widest > W - 160) fs *= (W - 160) / widest;
  x.font = `400 ${fs}px ${FJ}`; x.textBaseline = 'alphabetic'; let y = H - 190 - (parts.length - 1) * fs * 1.1;
  parts.forEach((p, i) => { const px = 76 + i * 40; x.fillStyle = '#FF4D1A'; x.fillText(p, px + 7, y + 7); x.strokeStyle = '#0B0B14'; x.lineWidth = 10; x.lineJoin = 'round'; x.strokeText(p, px, y); x.fillStyle = '#F3EFE6'; x.fillText(p, px, y); y += fs * 1.1; });
  x.font = `400 40px ${FJ}`; x.fillStyle = '#FFC21A'; x.fillText(`— ${petName()}`, 80, H - 96);
  x.font = `600 20px ${FM}`; x.fillStyle = 'rgba(243,239,230,.75)'; x.fillText(`${G.sp.name} · #ライムモンスターズ`, 82, H - 60);
  if (PH.pr) { try { renderer.setPixelRatio(PH.pr); if (composer && composer.setPixelRatio) composer.setPixelRatio(PH.pr); resize(); } catch (e) {} PH.pr = 0; }
  out.toBlob(b => { PH.blob = b; PH.url && URL.revokeObjectURL(PH.url); PH.url = URL.createObjectURL(b); $('prImg').src = PH.url; $('prBack').textContent = '撮りなおす'; $('photoResult').querySelector('.eyebrow').textContent = '宣材写真'; $('photoResult').hidden = false; }, 'image/png');
}
let downloadsNS = null; try { window.claude && window.claude.use && window.claude.use('downloads').then(d => { downloadsNS = d; }).catch(() => {}); } catch (e) {}
$('prSave').hidden = false;
$('prSave').addEventListener('click', async () => {
  if (!PH.blob) return; const name = `rhyme-monsters-${G.sp.name}.png`;
  if (downloadsNS) { try { await downloadsNS.save({ filename: name, data: PH.blob }); $('prNote').textContent = 'SAVED ✓'; } catch (e) { $('prNote').textContent = ''; } return; }
  let f = null; try { f = new File([PH.blob], name, { type: 'image/png' }); } catch (e) {}
  if (f && navigator.canShare && navigator.share) { let ok = false; try { ok = navigator.canShare({ files: [f] }); } catch (e) {} if (ok) { navigator.share({ files: [f] }).catch(() => {}); return; } }
  const a = document.createElement('a'); a.href = PH.url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); $('prNote').textContent = 'SAVED ✓';
});
$('prX').addEventListener('click', () => {
  const line = (PUNCH[G.sp.id] || PUNCH[0])[PH.punch];
  const text = PH.text || `「${line}」\n${petName()}が${MODE().cup}の${ROUND[RND()]}に参戦中🎤\n#ライムモンスターズ\nあなたは何点？ ▶ ${GAME_URL}`;
  postToX(text); $('prNote').textContent = '画像は「画像を保存」から添付してね';
});
$('prBack').addEventListener('click', () => { $('photoResult').hidden = true; if (PH.from === 'over') { PH.from = null; $('overModal').hidden = false; } });

function outLoop(dt) { lessonLoop(dt); auraLoop(dt); }

/* ---------- status screen ---------- */
function openStatus() {
  const S = statsOf(G.sp), el = $('status');
  $('stName').textContent = petName(); $('stSp').textContent = `${G.sp.name} · ${STAGE_NAME[G.sp.stage]}`;
  statBars($('stBars'), S, null, true);
  const F = outfitOf(G.sp) || {};
  $('stGear').innerHTML = ['head', 'face', 'top', 'bottom', 'shoes', 'acc'].map(sl => { const v = slotOf(F, sl), it = SLOTS[sl].items.find(i => i[0] === v); return `<li><small>${SLOTS[sl].n}</small><b>${it && v !== 'none' ? `${ICON[v] || ''} ${it[1]}` : '—'}</b></li>`; }).join('') + `<li><small>ポーズ</small><b>${ICON[PRG.pose || 'stand'] || ''} ${POSES[PRG.pose || 'stand'].n}</b></li>`;
  try { $('stImg').src = makeThumbs(320, .3, [G.sp.id])[G.sp.id]; } catch (e) {}
  el.hidden = false; document.body.classList.add('calm'); clearConfetti(); SFX.ui();
}
$('stClose').addEventListener('click', () => { $('status').hidden = true; if (!document.body.classList.contains('outing')) document.body.classList.remove('calm'); });
$('stShop').addEventListener('click', () => { $('status').hidden = true; document.body.classList.remove('calm'); openShop(); });

/* ---------- share cards for X: champion & endless — the monster in its current gear ---------- */
const EMBLEM_IMG = new Image(); EMBLEM_IMG.src = EMBLEM_URI;
const CARD_THEMES = [['ブルー', '#2438FF', '#7A2BFF', '#D4FF3A'], ['ピンク', '#FF2E88', '#7A2BFF', '#FFE066'], ['サンセット', '#FF7A1A', '#E60012', '#FFF27A'], ['ミント', '#00C2A8', '#2438FF', '#FFFFFF'], ['モノクロ', '#151515', '#3A3A3A', '#D4FF3A']], CARD_ANG = [['ナナメ', .25], ['正面', 0], ['横顔', .8], ['うしろ', 2.6]];
PH.opt = PH.opt || { th: 0, ang: 0, line: 0 };
function shareCard(o, preview) {
  PH.lastO = o; const OP = PH.opt, TH = CARD_THEMES[OP.th % CARD_THEMES.length], AC = TH[3];
  const W = 1080, H = 1350, cv2 = document.createElement('canvas'); cv2.width = W; cv2.height = H; const x = cv2.getContext('2d');
  const FJ = '"Dela Gothic One", "Hiragino Sans", sans-serif', FD = '"Bricolage Grotesque", "Arial Black", sans-serif', FM = '"Martian Mono", ui-monospace, monospace';
  const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, TH[1]); g.addColorStop(1, TH[2]); x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.save(); x.globalAlpha = .14; x.strokeStyle = AC; x.lineWidth = 6; for (let i = -H; i < W + H; i += 34) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i - H * .7, H); x.stroke(); } x.restore();
  x.fillStyle = AC; x.save(); x.translate(0, 860); x.rotate(-.12); x.fillRect(-100, 0, W + 200, 120); x.restore();
  // burst + monster
  x.save(); x.translate(W / 2, 560); x.fillStyle = '#F3EFE6'; x.beginPath(); for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2, r = i % 2 ? 300 : 400; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); } x.fill(); x.restore();
  const img = new Image(); let src = ''; try { src = makeThumbs(760, CARD_ANG[OP.ang % CARD_ANG.length][1], [G.sp.id])[G.sp.id]; } catch (e) {}
  const draw = () => {
    if (img.width) x.drawImage(img, W / 2 - 380, 180, 760, 760);
    const MR = PRG.myRhyme || {};
    if (o.kind === 'endless') { // score, name, rank — nothing else
      const sc = G.endScore || 0, RK = ERANKS[rankIx(sc)];
      x.save(); x.translate(W - 205, 205); x.rotate(.08); x.fillStyle = '#0E0B22'; x.beginPath(); x.arc(12, 12, 150, 0, 7); x.fill(); x.fillStyle = RK[3]; x.beginPath(); x.arc(0, 0, 150, 0, 7); x.fill(); x.lineWidth = 10; x.strokeStyle = '#0E0B22'; x.stroke();
      x.fillStyle = '#0E0B22'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = `800 italic ${RK[0].length > 1 ? 150 : 200}px ${FD}`; x.fillText(RK[0], -4, -8); x.font = `700 30px ${FM}`; x.fillText('RANK', 0, 96); x.restore();
      x.textBaseline = 'alphabetic'; x.textAlign = 'center'; x.lineJoin = 'round';
      x.font = `800 italic 210px ${FD}`; x.lineWidth = 24; x.strokeStyle = '#0E0B22'; x.strokeText(sc.toLocaleString(), W / 2, 1110, W - 80); x.fillStyle = AC; x.fillText(sc.toLocaleString(), W / 2, 1110, W - 80);
      x.font = `400 74px ${FJ}`; x.lineWidth = 16; const rn = `「${RK[1]}」`; x.strokeText(rn, W / 2, 1220, W - 80); x.fillStyle = '#fff'; x.fillText(rn, W / 2, 1220, W - 80);
    }
    const title = o.kind === 'myrhyme' ? `${MR.A}×${MR.B}` : o.kind === 'champ' ? 'CHAMPION' : o.kind === 'endless' ? '' : 'RHYME BATTLE';
    if (title) { x.textAlign = 'center'; x.font = o.kind === 'myrhyme' ? `400 120px ${FJ}` : `800 italic ${o.kind === 'endless' ? 150 : 170}px ${FD}`; x.lineJoin = 'round'; x.lineWidth = 22; x.strokeStyle = '#0E0B22'; x.strokeText(title, W / 2, 1060, W - 80); x.fillStyle = AC; x.fillText(title, W / 2, 1060, W - 80); }
    const sub = o.kind === 'myrhyme' ? 'MY RHYME' : o.kind === 'champ' ? `${MODES[o.mode || G.mode].cup} 優勝！` : o.kind === 'endless' ? `${(G.endScore || 0).toLocaleString()}pt · RANK ${ERANKS[rankIx(G.endScore || 0)][0]}「${ERANKS[rankIx(G.endScore || 0)][1]}」` : ROUND[RND()];
    if (o.kind !== 'endless') { x.font = `400 64px ${FJ}`; x.lineWidth = 14; x.strokeText(sub, W / 2, 1160, W - 80); x.fillStyle = '#fff'; x.fillText(sub, W / 2, 1160, W - 80); }
    x.font = `400 ${o.kind === 'endless' ? 84 : 56}px ${FJ}`; x.fillStyle = '#F3EFE6'; x.textAlign = 'left'; x.lineWidth = 14; x.strokeStyle = '#0E0B22'; if (o.kind === 'endless') x.strokeText(petName(), 70, 130, W - 470); x.fillText(petName(), 70, 130, W - 470); { const PL = PUNCH[G.sp.id] || PUNCH[0] || [''], pl = PL[OP.line % PL.length]; if (pl) { x.font = `400 30px ${FJ}`; x.fillStyle = '#FFE066'; x.fillText(`「${pl}」`, 70, o.kind === 'endless' ? 232 : 210, W - 480); } } x.font = `700 28px ${FM}`; x.fillStyle = AC; x.fillText(`${G.sp.name} · ${STAGE_NAME[G.sp.stage]}`, 74, o.kind === 'endless' ? 182 : 165);
    if (o.kind !== 'endless') { const S = ST(); x.font = `700 26px ${FM}`; x.textAlign = 'right'; x.fillStyle = '#fff'; STAT_KEYS.forEach(([k, ja, en], i) => x.fillText(`${en} ${S[k]}`, W - 70, 90 + i * 34)); }
    const BL = o.kind === 'myrhyme' || o.kind === 'endless' ? null : bestLine(); if (BL) { x.textAlign = 'center'; x.font = `400 40px ${FJ}`; x.lineWidth = 10; x.strokeStyle = '#0E0B22'; const t2 = `BEST「${BL.w}」→「${BL.a}」${BL.lab}`; x.strokeText(t2, W / 2, 1232, W - 100); x.fillStyle = AC; x.fillText(t2, W / 2, 1232, W - 100); }
    x.textAlign = 'center'; x.font = `800 40px ${FD}`; x.fillStyle = '#F3EFE6'; { const tw = x.measureText('RHYME MONSTERS / #ライムモンスターズ').width, ex = W / 2 - tw / 2 - 86; if (EMBLEM_IMG.complete && EMBLEM_IMG.naturalWidth) x.drawImage(EMBLEM_IMG, ex, H - 128, 80, 85); x.fillText('RHYME MONSTERS / #ライムモンスターズ', W / 2 + 40, H - 60); }
    const U = GAME_URL, sc = (G.endScore || 0).toLocaleString(), rk = ERANKS[rankIx(G.endScore || 0)];
    PH.text = o.kind === 'myrhyme' ? `${petName()}（${G.sp.name}）今日の一本🎤\n「${MR.A}」×「${MR.B}」\nあなたはどんな韻を踏む？\n${U}\n\n#ライムモンスターズ`
      : o.kind === 'champ' ? `${petName()}が${MODES[o.mode || G.mode].cup}で優勝！🏆🎤\n#ライムモンスターズ\nあなたも挑戦する？\n${U}`
      : o.kind === 'endless' ? `${petName()} ${sc}pt ✨\nランク${rk[0]}「${rk[1]}」🎤\nあなたは何点？\n${U}\n\n#ライムモンスターズ`
      : `${petName()}がライムバトル中🎤\n#ライムモンスターズ\nあなたは何点？ ▶ ${U}`;
    cv2.toBlob(b => { if (preview) { const u = URL.createObjectURL(b); PH.blob = b; return preview(u); } PH.blob = b; PH.url && URL.revokeObjectURL(PH.url); PH.url = URL.createObjectURL(b); $('prImg').src = PH.url; $('prNote').textContent = ''; $('prBack').textContent = 'もどる'; $('photoResult').querySelector('.eyebrow').textContent = o.kind === 'myrhyme' ? 'MY RHYME' : o.kind === 'champ' ? '優勝カード' : o.kind === 'endless' ? 'スコアカード' : 'バトルカード'; renderCardOpts(); $('photoResult').hidden = false; }, 'image/png');
  };
  if (src) { img.onload = draw; img.src = src; } else draw();
}
function renderCardOpts() {
  const el = $('prOpts'); if (!el) return; const OP = PH.opt, PL = PUNCH[G.sp.id] || PUNCH[0] || [];
  const row = (k, lab, items) => `<div class="pro"><small>${lab}</small><div class="chips-x">${items.map((t, i) => `<button class="${OP[k] === i ? 'on' : ''}" data-k="${k}" data-i="${i}">${t}</button>`).join('')}</div></div>`;
  const nm = (G.name || '').replace(/^MC/, '');
  el.innerHTML = `<div class="pro"><small>名前</small><div class="prnw"><b>MC</b><input class="prn" id="prName" maxlength="8" value="${nm.replace(/["<>&]/g, '')}" aria-label="MCネーム"></div></div>` + row('th', 'カラー', CARD_THEMES.map(t => `<i style="background:linear-gradient(135deg,${t[1]},${t[2]});border-color:${t[3]}"></i>${t[0]}`)) + row('ang', 'アングル', CARD_ANG.map(a => a[0])) + (PL.length > 1 ? row('line', 'セリフ', PL.map(l => l.length > 9 ? l.slice(0, 9) + '…' : l)) : '');
}

/* ---------- MY RHYME: write your own A × B, your partner performs it on stage, post it ---------- */
function dayKey() { return Math.floor((Date.now() + 9 * 3600e3) / 86400e3); }
function openDaily() { $('dyRes').hidden = true; $('dyShare').hidden = true; $('dailyModal').hidden = false; SFX.ui(); setTimeout(() => { try { $('dyA').focus({ preventScroll: true }); } catch (e) {} }, 80); }
function rhymeIdeas(A, B) { const pool = [...new Set(QUIZ.flatMap(q => [q[0], q[2]]))].filter(w => w !== A && w !== B), out = []; for (const w of pool.sort(() => Math.random() - .5)) { if (rhymeCore(A, w).R >= 4) out.push(w); if (out.length >= 3) break; } return out; }
$('dyRes').addEventListener('click', e => { const b = e.target.closest('[data-sug]'); if (!b) return; $('dyB').value = b.dataset.sug; $('dyForm').requestSubmit ? $('dyForm').requestSubmit() : $('dyForm').dispatchEvent(new Event('submit')); });
function vwHtml(ms, k) { const vs = vowelsOf(ms); return vs.map((v, i) => `<span class="${vs.length - 1 - i < k ? 'h' : 'm'}">${v}</span>`).join(' '); }
$('dailyBtn').addEventListener('click', () => { if (G.state === 'idle') openDaily(); });
$('dyClose').addEventListener('click', () => { $('dailyModal').hidden = true; updateDailyMark(); });
$('dyForm').addEventListener('submit', e => { e.preventDefault(); const A = norm($('dyA').value || ''), B = norm($('dyB').value || '');
  if (!A || !B) return; if (!KANA_RE.test(A) || !KANA_RE.test(B)) { $('dyRes').innerHTML = '<small>ひらがな・カタカナで！</small>'; $('dyRes').hidden = false; return; }
  const r = rhymeCore(A, B), r2 = rhymeCore(B, A), k = Math.max(r.k, r2.k), R = Math.max(r.R, r2.R), g = R, note = (r.R >= r2.R ? r : r2).note;
  if (g >= 2) mission('my1', 1);
  const first = PRG.myDay !== dayKey(), bonus = [0, 0, 30, 60, 100, 150][g]; PRG.myRhyme = { A, B, g, k }; if (first && bonus) { PRG.myDay = dayKey(); addExp(bonus); } save();
  const sug = g < 3 ? rhymeIdeas(A, B) : [];
  $('dyRes').innerHTML = `<div class="dy-pair"><span>${A}</span><i>×</i><span>${B}</span></div><div class="dy-vw">${vwHtml(moras(A), k)}　/　${vwHtml(moras(B), k)}</div><b>${g >= 1 ? SLAM[g][0] : 'ふめてない…'}</b><small>${note}${first && bonus ? `・今日の発表ボーナス EXP+${bonus}` : ''}</small>${sug.length ? `<p class="dy-sug">${petName()}「惜しい！こう踏める👉」 ${sug.map(w => `<button type="button" data-sug="${w}">${w}</button>`).join('')}</p>` : ''}`;
  $('dyRes').hidden = false; $('dyShare').hidden = g < 2;
  // the partner performs it: both words sung on the beat, a bubble, the crowd
  try { const pv = voicePitch(), sx = 60 / (Seq.bpm || 100) / 2, t0 = AT() + .2; [A, B].forEach((w, j) => { const ms = moras(w), vs = vowelsOf(ms); ms.forEach((m, i) => sing(toAC(t0 + j * (ms.length + 2) * sx + i * sx), { m, v: vs[i], pitch: pv + (j ? 4 : 1) - i % 2, acc: true, slot: true, dur: sx * 1.1 })); });
    bubble(`${A} × ${B}`, petName(), true); react(g >= 4 ? 'joy' : 'nod'); if (g >= 3) { SFX.crowd(1.2); confetti(90, { y: 2, burst: 6 }); } SFX.grade && SFX.grade(Math.max(0, g)); } catch (err) {}
  updateDailyMark(); });
$('dyShare').addEventListener('click', () => { const m = PRG.myRhyme; if (!m) return; $('dailyModal').hidden = true; PH.from = null; shareCard({ kind: 'myrhyme' }); });
function updateDailyMark() { $('dailyMark').textContent = PRG.myDay === dayKey() ? '✓' : 'NEW'; }
updateDailyMark();

/* what your coins can buy next — shown on the result screen and as a badge on the shop button */
function nextBuy() { let best = null; for (const [sl, c] of Object.entries(SLOTS)) for (const it of c.items) { if (!it[2] || ownedItem(sl, it[0]) || isDefault(sl, it[0])) continue; if (!best || it[2] < best.p) best = { sl, v: it[0], n: it[1], p: it[2] }; } return best; }
function updateShopBadge() { const b = nextBuy(), el = $('outBtn'); if (!el) return; el.classList.toggle('canbuy', !!(b && (PRG.coins || 0) >= b.p)); }

/* ---------- daily missions: three small goals a day, EXP + coins ---------- */
const MISSIONS = { orig3: ['ORIGINAL! を3回出す', 3], speed5: ['SPEED×1.3 以上で5回答える', 5], combo10: ['10コンボつなぐ', 10], hits15: ['1回のプレイで15韻', 15], bpm150: ['150BPM に到達', 150], stage2: ['STAGE 2 をクリア', 2], my1: ['MY RHYME で1本発表', 1] };
function missionsToday() { const d = dayKey(); if (!PRG.ms || PRG.ms.day !== d) { const keys = Object.keys(MISSIONS); let h = d * 2654435761 % 4294967296; const pick3 = []; while (pick3.length < 3) { h = (h * 1103515245 + 12345) % 2147483648; const k = keys[h % keys.length]; if (!pick3.includes(k)) pick3.push(k); } PRG.ms = { day: d, keys: pick3, prog: {}, done: {} }; } return PRG.ms; }
function mission(key, add, setTo) { const M = missionsToday(); if (!M.keys.includes(key) || M.done[key]) return; const goal = MISSIONS[key][1]; M.prog[key] = setTo != null ? Math.max(M.prog[key] || 0, setTo) : (M.prog[key] || 0) + add;
  if (M.prog[key] >= goal) { M.done[key] = true; addExp(80); addCoins(40, true); setTimeout(() => banner(`<small>DAILY MISSION CLEAR</small><b>${MISSIONS[key][0]}</b><small>EXP+80 ・ ◎+40</small>`, 2200), 300); SFX.milestone(); }
  save(); updateMissionChip(); }
function updateMissionChip() { const M = missionsToday(), n = M.keys.filter(k => M.done[k]).length; const el = $('missionBtn'); if (el) { $('missionN').textContent = `${n}/3`; el.classList.toggle('all', n >= 3); } }
function openMissions() { const M = missionsToday(); $('msList').innerHTML = M.keys.map(k => { const [t, goal] = MISSIONS[k], p = Math.min(goal, M.prog[k] || 0); return `<li class="${M.done[k] ? 'ok' : ''}"><b>${M.done[k] ? '✓' : '・'} ${t}</b><span><i style="width:${p / goal * 100}%"></i></span><em>${M.done[k] ? 'CLEAR' : `${p}/${goal}`}</em></li>`; }).join(''); $('msModal').hidden = false; SFX.ui(); }
$('missionBtn').addEventListener('click', () => { if (G.state === 'idle') openMissions(); });
$('msClose').addEventListener('click', () => { $('msModal').hidden = true; });
updateMissionChip();

/* ---------- first-session onboarding: name → evolve → shop → MY RHYME → the real game ---------- */
const ONB = { step: -1, t: null, n0: 0, sub: '' }; window.__onb = ONB;
function coach(target, text, opt = {}) {
  const C = $('coach'); C.hidden = false; C.querySelector('.cb-t').innerHTML = text; C.querySelector('.cb-n').textContent = petName();
  C.querySelector('.cb-go').hidden = !opt.go; if (opt.go) C.querySelector('.cb-go').textContent = opt.go;
  C.querySelector('.cb-skip').hidden = !opt.skip; if (opt.skip) C.querySelector('.cb-skip').textContent = opt.skip;
  ONB.target = target; coachPlace();
}
function coachPlace() {
  const C = $('coach'), sp = C.querySelector('.cb-spot'), bub = C.querySelector('.cb-bub'), el = typeof ONB.target === 'string' ? document.querySelector(ONB.target) : ONB.target;
  const R = el && el.getBoundingClientRect(), H = innerHeight;
  if (!R || !R.width) { sp.hidden = true; bub.style.top = '38%'; bub.style.bottom = 'auto'; bub.style.left = ''; bub.style.transform = ''; C.classList.add('dim'); return; }
  C.classList.remove('dim'); sp.hidden = false; const pad = 8;
  Object.assign(sp.style, { left: R.left - pad + 'px', top: R.top - pad + 'px', width: R.width + pad * 2 + 'px', height: R.height + pad * 2 + 'px' });
  if (R.top > H * .5) { bub.style.top = 'auto'; bub.style.bottom = (H - R.top + 22) + 'px'; bub.dataset.arrow = 'down'; } else { bub.style.bottom = 'auto'; bub.style.top = (R.bottom + 22) + 'px'; bub.dataset.arrow = 'up'; }
  { const W = innerWidth, bw = bub.offsetWidth || 340, cx = R.left + R.width / 2, left = Math.max(12, Math.min(W - bw - 12, cx - bw / 2));
    bub.style.left = left + 'px'; bub.style.transform = 'none'; bub.style.setProperty('--ax', Math.max(22, Math.min(bw - 22, cx - left)) + 'px'); }
}
function coachHide() { $('coach').hidden = true; ONB.target = null; }
function startOnb() { ONB.step = 0; ONB.sub = ''; clearInterval(ONB.t); ONB.t = setInterval(onbTick, 250); onbEnter(0); }
function onbEnd(play) { clearInterval(ONB.t); ONB.step = -1; coachHide(); PRG.onbDone = true; save(); if (play) setTimeout(() => $('endBtn').click(), 300); }
function onbEnter(s) {
  ONB.step = s; ONB.sub = '';
  if (s === 0) { if (PRG.named) return onbEnter(1); coachHide(); $('nameBtn').click(); $('nameModal').querySelector('h2').textContent = 'まずは君のMCネームを決めよう'; }
  if (s === 1) { const kids = G.sp.kids || []; if (!kids.length) return onbEnter(2); const cost = EVO_COST[BY[kids[0]].stage]; if ((PRG.exp || 0) < cost) { const add = cost - (PRG.exp || 0); addExp(add); banner(`<small>はじめてボーナス</small><b>EXP +${add}</b>`, 1800); } updateHud(); coach('#evoBtn', '<b>EXP</b>がたまった！<br>ぼくを<b>進化</b>させて！'); }
  if (s === 2) { const nb = nextBuy(); if (nb && (PRG.coins || 0) < Math.max(100, nb.p)) { const add = Math.max(100, nb.p) - (PRG.coins || 0); addCoins(add, true); banner(`<small>はじめてボーナス</small><b>◎ +${add}</b>`, 1800); } updateHud(); ONB.n0 = PRG.owned.length; ONB.nb = null; coach('#outBtn', '<b>コイン</b>でギアを買うと<br>ステータスが上がるよ！'); }
  if (s === 3) coach('#dailyBtn', '最後に<b>今日の一本</b>！<br>自分の韻を考えてXで発表しよう', { skip: 'あとでやる ▶' });
  if (s === 4) coach(null, '準備OK！<br>たくさん<b>韻</b>を踏んで<br><b>ハイスコア</b>を目指そう！', { go: '閉じる' });
}
function onbTick() {
  const s = ONB.step; if (s < 0) return; if (!$('coach').hidden) coachPlace();
  const open = id => !$(id).hidden;
  if (s === 0) { if (!open('nameModal')) onbEnter(1); return; }
  if (s === 1) {
    if (G.state === 'evolve') { if (ONB.sub !== 'evo') { ONB.sub = 'evo'; coachHide(); } return; }
    if (ONB.sub === 'evo') { if (G.state === 'idle' && !document.querySelector('.modal:not([hidden])')) { ONB.sub = 'wait'; setTimeout(() => onbEnter(2), 1200); } return; }
    if (ONB.sub === 'wait') return;
    if (open('evoModal')) { if (ONB.sub !== 'modal') { ONB.sub = 'modal'; coach('#evoList', '好きな<b>進化先</b>をえらんで進化！<br><small>どちらでもOK。スタートBPMが上がるかわりに得点も大きくなる</small>'); } }
    else if (ONB.sub === 'modal') { ONB.sub = ''; coach('#evoBtn', '<b>EXP</b>がたまった！<br>ぼくを<b>進化</b>させて！'); }
    return;
  }
  if (s === 2) {
    if (open('shop')) {
      if (PRG.owned.length > ONB.n0) { if (ONB.sub !== 'bought') { ONB.sub = 'bought'; coach('#shopBack', 'いいね、似合ってる！<br>もどろう'); } return; }
      // walk them to one item they can afford: its tab → the item → the buy button
      const nb = ONB.nb || (ONB.nb = nextBuy()); if (!nb) { ONB.sub = 'bought'; coach('#shopBack', 'もどろう'); return; }
      if (ONB.sub !== 'shop' && ONB.sub !== 'tab' && ONB.sub !== 'item' && ONB.sub !== 'buy') { if (SH.tab !== nb.sl) { const t = document.querySelector(`#shopTabs [data-t="${nb.sl}"]`); if (t) t.click(); } }
      const want = SH.tab !== nb.sl ? 'tab' : SH.sel === nb.v ? 'buy' : 'item';
      if (ONB.sub !== want) { ONB.sub = want;
        if (want === 'tab') coach(`#shopTabs [data-t="${nb.sl}"]`, `「${SLOTS[nb.sl].n}」をタップ`);
        if (want === 'item') coach(`#shopGrid [data-v="${nb.v}"]`, `「${nb.n}」をタップして<b>試着</b>！<br><small>◎${nb.p}で買えるよ</small>`);
        if (want === 'buy') coach('#shopBuy', '似合う！<b>買う</b>ボタンで決定！'); }
      return; }
    if (['shop', 'tab', 'item', 'buy', 'bought'].includes(ONB.sub)) { ONB.sub = 'wait'; setTimeout(() => onbEnter(3), 600); }
    return;
  }
  if (s === 3) {
    if (open('dailyModal') || open('photoResult')) { if (ONB.sub !== 'my') { ONB.sub = 'my'; coachHide(); } return; }
    if (ONB.sub === 'my') { ONB.sub = 'wait'; setTimeout(() => onbEnter(4), 500); }
    return;
  }
}
$('coach').querySelector('.cb-skip').addEventListener('click', () => { if (ONB.step === 3) onbEnter(4); else if (ONB.step === 4) onbEnd(false); else onbEnd(false); });
$('coach').querySelector('.cb-go').addEventListener('click', () => onbEnd(false));   // the tutorial ends in the 楽屋

$('prOpts').addEventListener('click', e => { const b = e.target.closest('button[data-k]'); if (!b || !PH.lastO) return; PH.opt[b.dataset.k] = +b.dataset.i; SFX.ui(); shareCard(PH.lastO); });

// the name is chosen right where it shows: on the card you are about to post
document.addEventListener('change', e => { if (e.target && e.target.id === 'prName') { applyName(e.target.value || 'ルーキー'); if (PH.lastO) shareCard(PH.lastO); } });
document.addEventListener('keydown', e => { if (e.target && e.target.id === 'prName' && e.key === 'Enter' && !e.isComposing && e.keyCode !== 229) e.target.blur(); });

/* ---------- save code: the whole save as a copy-paste code, to move to another device ---------- */
const b64u = u8 => { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
const ub64u = s => { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; };
async function pipe(u8, T) { const st = new Blob([u8]).stream().pipeThrough(new T('deflate-raw')); return new Uint8Array(await new Response(st).arrayBuffer()); }
async function makeSaveCode() { save(); const json = JSON.stringify({ s: PRG, f: [...discovered] }), u8 = new TextEncoder().encode(json);
  if (typeof CompressionStream === 'function') { try { return 'RM1-' + b64u(await pipe(u8, CompressionStream)); } catch (e) {} } return 'RM0-' + b64u(u8); }
async function readSaveCode(code) { code = (code || '').replace(/\s+/g, ''); const m = code.match(/^RM([01])-([A-Za-z0-9_-]+)$/); if (!m) throw new Error('form');
  let u8 = ub64u(m[2]); if (m[1] === '1') u8 = await pipe(u8, DecompressionStream); const o = JSON.parse(new TextDecoder().decode(u8)); if (!o || !o.s || !o.s.runs) throw new Error('data'); return o; }
$('setCode').addEventListener('click', async () => { $('settings').hidden = true; $('codeMsg').textContent = ''; $('codeIn').value = ''; $('codeOut').value = '作成中…'; $('codeModal').hidden = false; SFX.ui(); try { $('codeOut').value = await makeSaveCode(); } catch (e) { $('codeOut').value = 'コードを作れませんでした'; } });
$('codeCopy').addEventListener('click', async () => { const v = $('codeOut').value; try { await navigator.clipboard.writeText(v); $('codeCopy').textContent = 'コピーしました！'; } catch (e) { $('codeOut').select(); document.execCommand && document.execCommand('copy'); $('codeCopy').textContent = 'コピーしました！'; } setTimeout(() => { $('codeCopy').textContent = 'コードをコピー'; }, 1600); });
$('codeLoad').addEventListener('click', async () => { try { const o = await readSaveCode($('codeIn').value); store.set('intama4.save', o.s); store.set('intama4.found', o.f || [100]); $('codeMsg').textContent = '読み込みました。再開します…'; setTimeout(() => location.reload(), 600); } catch (e) { $('codeMsg').textContent = 'コードが正しくありません。コピーしたコードをそのまま貼りつけてください。'; } });
$('codeClose').addEventListener('click', () => { $('codeModal').hidden = true; });
