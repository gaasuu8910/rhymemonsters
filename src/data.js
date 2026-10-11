/* =========================================================
   1. RHYME — Japanese rhyme = matching vowel sequence from the end
   ========================================================= */
const VOW = {};
const ROWS = { a: 'あかさたなはまやらわがざだばぱぁゃゎ', i: 'いきしちにひみりぎじぢびぴぃ', u: 'うくすつぬふむゆるぐずづぶぷゔぅゅ', e: 'えけせてねへめれげぜでべぺぇ', o: 'おこそとのほもよろをごぞどぼぽぉょ' };
for (const v in ROWS) for (const ch of ROWS[v]) VOW[ch] = v;
const SMALL = 'ぁぃぅぇぉゃゅょゎ';
const toHira = s => s.replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
const norm = s => toHira(s.normalize('NFKC')).replace(/[\s・、。,.!！?？「」『』〜~]/g, '');
const KANA_RE = /^[ぁ-ゖー]+$/;
function moras(s) {
  const out = [];
  for (const ch of s) {
    const last = out[out.length - 1];
    if (SMALL.includes(ch) && last && !'っんー'.includes(last.slice(-1))) out[out.length - 1] += ch;
    else out.push(ch);
  }
  return out;
}
function vowelsOf(ms) {
  const v = [];
  // long vowels rhyme the way they sound: よう = よー, せい = せー
  ms.forEach(m => { const c = m.slice(-1), p = v[v.length - 1]; v.push(c === 'ー' ? (p || 'a') : (c === 'う' && m.length === 1 && (p === 'o' || p === 'u')) ? p : (c === 'い' && m.length === 1 && p === 'e') ? 'e' : c === 'っ' ? 'q' : c === 'ん' ? 'n' : (VOW[c] || '?')); });
  return v;
}
// for matching, long vowels may count either way: せい = se-i or se-e, こう = ko-u or ko-o, ー copies the vowel before
function vsets(ms) {
  const out = [];
  ms.forEach(m => { const c = m.slice(-1), p = out[out.length - 1], pv = p ? p.base : null; let base, alt = null;
    let long = false; if (c === 'ー') { base = pv || 'a'; long = true; }
    else if (c === 'っ') base = 'q'; else if (c === 'ん') base = 'n';
    else { base = VOW[c] || '?'; if (m.length === 1 && c === 'う' && (pv === 'o' || pv === 'u')) alt = pv; if (m.length === 1 && c === 'い' && pv === 'e') alt = 'e'; if (m.length === 1 && c === 'お' && pv === 'o') alt = 'o'; long = !!alt; }
    out.push({ base, alt, long }); });
  return out;
}
const vEq = (x, y) => x.base === y.base || (x.alt && x.alt === y.base) || (y.alt && y.alt === x.base) || (x.alt && y.alt && x.alt === y.alt);
// strict local rhyme: how many vowels match from the end, and whether the consonants actually change
const NGW = ['ちんこ', 'ちんぽ', 'ちんちん', 'まんこ', 'きんたま', 'せっくす', 'おっぱい', 'ぱいずり', 'れいぷ', 'しね', 'ころす', 'ふぇら', 'おなに', 'ぶす', 'きちがい', 'がいじ'];
function rhymeCore(prompt, reading) {
  prompt = norm(prompt || ''); reading = norm(reading || ''); // katakana / full-width in, hiragana out
  const P = moras(prompt), A = moras(reading), pv = vowelsOf(P), av = vowelsOf(A);
  const out = { P, A, pv, av, k: 0, diff: 0, R: 0, note: '' };
  if (!reading) return { ...out, note: '時間切れ' };
  if (reading === prompt) return { ...out, note: '同じ言葉はノーカウント' };
  if (reading.includes(prompt)) return { ...out, note: 'お題をそのまま含むのはナシ' };
  if (NGW.some(w => reading.includes(w))) return { ...out, note: 'それはアウト', ng: true };
  // a trailing long vowel may be dropped on either side (がっこう ≈ らっこ, せーかー ≈ えいが): try each pairing, keep the best
  const ps = vsets(P), as = vsets(A), tp = ps.length > 1 && ps[ps.length - 1].long ? 1 : 0, ta = as.length > 1 && as[as.length - 1].long ? 1 : 0;
  let k = 0, op = 0, oa = 0, best = -1;
  for (const dp of [0, tp]) for (const da of [0, ta]) { let kk = 0; while (kk < ps.length - dp && kk < as.length - da && vEq(ps[ps.length - 1 - dp - kk], as[as.length - 1 - da - kk])) kk++; const sc = kk / (ps.length - dp) - (dp !== da ? .01 : 0); if (sc > best) { best = sc; k = kk; op = dp; oa = da; } }
  let diff = 0; for (let i = 0; i < k; i++) if (P[P.length - 1 - op - i] !== A[A.length - 1 - oa - i]) diff++;
  const plen = pv.length - op, ratio = k / plen;
  let R = ratio >= 1 ? (diff / pv.length >= .5 ? 5 : 4) : ratio >= .75 ? 3 : (ratio >= .5 && k >= 2) ? 2 : k >= 2 ? 1 : 0;
  let note = ratio >= 1 ? `母音${k}つ全部一致` : k ? `後ろから母音${k}つ一致` : '母音がそろってない';
  if (k >= 2 && diff === 0) { R = 0; note = '語尾が丸ごと同じ音（子音を変えて踏もう）'; }
  else if (op !== oa && R > 3) { R = 3; note = `母音${k}つ一致（語尾の伸ばしは省略扱い）`; }
  // the same sounds copied from the end (かんせん / かんせん, くら / くら) is half a rhyme at best — the AI can't rescue it past 4
  { let t = 0; while (t < k && P[P.length - 1 - op - t] === A[A.length - 1 - oa - t]) t++; if (t >= 2 && R > 3) { R = 3; note = `母音${k}つ一致・後ろ${t}音が丸かぶり（頭以外の子音も変えよう）`; } }
  if (ratio >= 1 && R === 4 && !note.includes('丸かぶり') && !note.includes('省略')) note = `母音${k}つ一致・同じ音がかぶり気味（子音を変えるともっと硬い）`;
  // one vowel off with the same length (だんじょん / さんじょう): not a hit, but close enough to dodge the damage
  let near = false;
  if (R === 0 && !(k >= 2 && diff === 0)) for (const dp of [0, tp]) for (const da of [0, ta]) { const n1 = ps.length - dp, n2 = as.length - da; if (n1 !== n2 || n1 < 3) continue; let mm = 0; for (let i = 0; i < n1; i++) if (!vEq(ps[i], as[i])) mm++; if (mm === 1) near = true; }
  if (near) note = '母音が1つだけズレ（おしい！）';
  return { ...out, k, diff, R, note, near };
}
// final grade: rhyme hardness (R + ear) × artistry (link + play + punch), MC-battle style
function combine(core, ai) {
  if (!ai) return { ...core, grade: core.R, art: null };
  if (core.R === 0 || core.ng) return { ...core, grade: 0, art: 0 }; // no rhyme, no hit — however clever the line
  if (ai.ng) return { ...core, grade: 0, art: 0, note: 'それはアウト' };
  // a word counts as real if the AI says so OR it is in the built-in dictionary of everyday readings
  if (!ai.exists && !(typeof LEXR !== 'undefined' && LEXR.has(core.A.join('')))) return { ...core, grade: 0, art: 0, note: 'その言葉、辞書にもAIにも見つからない' };
  const R = Math.min(5, core.R + (core.k ? (ai.ear || 0) * .5 : 0)), art = (ai.link || 0) + (ai.play || 0) + (ai.punch || 0);
  const sc = R * .6 + art * .5;
  const raw = sc >= 4.5 ? 5 : sc >= 3.6 ? 4 : sc >= 2.6 ? 3 : sc >= 1.7 ? 2 : sc >= 1 ? 1 : 0;
  const grade = Math.max(1, Math.min(raw, core.R >= 4 ? 5 : core.R + 1)); // the rhyme sets the ceiling; the AI can lift it one step at most
  return { ...core, grade, art, Rx: R, sc };
}
function judge(prompt, ans) { return combine(rhymeCore(prompt, ans), null); }
window.__judge = judge;

/* ---------- prompt words (hiragana, grouped later by character count) ---------- */
const charLen = w => [...w].length;

/* =========================================================
   2. MONSTERS — 30 species, 4 lines of evolution
   ========================================================= */
const STAGE_NAME = ['ベビー', '第1形態', '第2形態', '最終形態'];
const TYPE_OF = sp => sp.stage === 0 ? '' : sp.stage === 1 ? ['スピード型', 'タフ型'][sp.bi] : ['パンチ型', 'ガード型'][sp.si] + '・' + ['スピード', 'タフ'][sp.bi];
const FINAL = 3, VST = [0, 1, 2, 4]; // game stage → how grown the body looks
const RULES = [
  { len: [3, 4], gain: 1, text: '栄養ゲージを満タンに' },
  { len: [3, 5], gain: .85, text: '栄養ゲージを満タンに' },
  { len: [4, 5], gain: .72, text: '栄養ゲージを満タンに' },
  { len: [5, 6], gain: .62, text: '満タン＋直近6回の条件' },
  { len: [5, 99], gain: .55, text: '満タンでフィーバー' },
];
const LINE_SKY = { egg: ['#FFE9D6', '#E6DCFF'], A: ['#FFE3F0', '#E4DBFF'], B: ['#D6F0FF', '#D9FBEF'], C: ['#E9F6CC', '#F7EBD6'] };
const SP = [
  { id: 0, name: 'タマゴン', stage: 0, line: 'egg', color: '#FFF4E0', accent: '#FF9F6B', kids: [1, 10, 19], cond: 'はじまり', desc: '言葉を聞くと殻の中でもぞもぞ動く。響きのいい韻を聞くと、ひびが一本ふえる。' },
  // ---- A: 美 (stars & moons)
  { id: 1, name: 'キラリン', stage: 1, line: 'A', color: '#FFD6E7', accent: '#FFC93D', shape: [1, .95, 1], ears: 'cat', tail: 'nub', extras: ['shell', 'star'], kids: [2, 3], cond: '美しさ優位（評価が高い）', desc: '大きな耳で、言葉の母音を聞きわける。韻がぴたりとそろうと、頭の星が光る。' },
  { id: 2, name: 'ホシリン', stage: 2, line: 'A', color: '#FFC2DD', accent: '#FFC93D', shape: [1, 1, 1], ears: 'cat', wings: 'small', tail: 'star', extras: ['star'], kids: [4, 6], cond: '平均回答 4秒未満', desc: '答えが速いほど星のしっぽが明るくなる。夜でも寝ない。' },
  { id: 3, name: 'ツキリン', stage: 2, line: 'A', color: '#D9CCFF', accent: '#FFE9A8', shape: [1, 1.05, 1], ears: 'long', tail: 'nub', extras: ['moon'], kids: [7, 9], cond: '平均回答 4秒以上', desc: 'じっくり考えてから話す。三日月の飾りは、聞いた韻を貯める器。' },
  { id: 4, name: 'リュウセイン', stage: 3, line: 'A', color: '#FF9FCB', accent: '#FFE066', shape: [1.05, 1.05, 1.1], horns: 1, wings: 'big', tail: 'comet', extras: ['star'], kids: [5], cond: '平均評価 3.8以上', desc: '流れ星のように一瞬で韻を返す。尾の光は答えた言葉の数だけ長い。' },
  { id: 5, name: 'ギンガロン', stage: 4, line: 'A', color: '#5B4BD6', belly: '#F2E6FF', accent: '#FFE066', shape: [1.15, 1.1, 1.15], horns: 2, wings: 'crystal', tail: 'comet', extras: ['halo', 'crystals'], kids: [], cond: '満タン＋直近6回の平均4.0以上', desc: '銀河をまとう王者。十文字を超える言葉にも、母音ひとつ外さず返す。' },
  { id: 6, name: 'ナガレボシ', stage: 3, line: 'A', color: '#FFB5A1', accent: '#FFF6D6', shape: [1, 1, 1.05], wings: 'small', tail: 'comet', extras: ['star'], kids: [28], cond: '平均評価 3.8未満', desc: '気まぐれに夜空を横切る。願いごとの語尾をよく聞き間違える。' },
  { id: 7, name: 'ミカヅキン', stage: 3, line: 'A', color: '#B9A6FF', accent: '#FFE9A8', shape: [1, 1.1, 1], ears: 'long', tail: 'long', extras: ['moon', 'crystals'], kids: [8], cond: '平均評価 3.8以上', desc: '月の満ち欠けで声色が変わる。満月の夜は虹色の韻しか言わない。' },
  { id: 8, name: 'ルナティア', stage: 4, line: 'A', color: '#EDE6FF', accent: '#FFC93D', shape: [1.05, 1.15, 1], ears: 'long', wings: 'crystal', tail: 'long', extras: ['halo', 'moon', 'crown'], kids: [], cond: '満タン＋直近6回の平均4.0以上', desc: '月の女王。彼女の前で語尾を外すと、静かに首をかしげられる。' },
  { id: 9, name: 'ユウヅキ', stage: 3, line: 'A', color: '#FFB86B', accent: '#7A5CFF', shape: [1, 1.05, 1], ears: 'long', tail: 'long', extras: ['moon'], kids: [], cond: '平均評価 3.8未満', desc: '夕暮れにだけ現れる。少しさびしい響きの言葉が好き。' },
  { id: 28, name: 'ホウキボシ', stage: 4, line: 'A', color: '#FFE3F1', accent: '#56D9F5', shape: [1.05, 1.05, 1.1], wings: 'big', tail: 'comet', extras: ['halo', 'star'], kids: [], cond: '満タン＋直近6回の平均4.0以上', desc: '何十年に一度だけ姿を見せる。通ったあとに虹色の粉が残る。' },
  // ---- B: 速 (wind & birds)
  { id: 10, name: 'ピュンタ', stage: 1, line: 'B', color: '#A8E6FF', accent: '#FFFFFF', shape: [.95, 1.05, .95], ears: 'fin', tail: 'nub', extras: ['shell', 'swirl'], kids: [11, 12], cond: '速さ優位（すばやく回答）', desc: '殻から飛び出した勢いのまま走り回る。答えを待つのが苦手。' },
  { id: 11, name: 'カゼピュン', stage: 2, line: 'B', color: '#7FD4FF', accent: '#E6FAFF', shape: [.95, 1.1, .95], ears: 'fin', wings: 'small', tail: 'nub', extras: ['swirl'], kids: [13, 15], cond: '平均回答 4秒未満', desc: '小さな翼で風をつかむ。言葉を聞いた瞬間にもう返事をしている。' },
  { id: 12, name: 'ソヨピュン', stage: 2, line: 'B', color: '#B8F2E6', accent: '#FFFFFF', shape: [1, 1.05, 1], ears: 'fin', tail: 'long', extras: ['swirl'], kids: [16, 18], cond: '平均回答 4秒以上', desc: 'そよ風のようにのんびり。間をとってから、ふわっと韻を返す。' },
  { id: 13, name: 'ハヤブサーン', stage: 3, line: 'B', color: '#3FA7F5', accent: '#FFD34D', shape: [1, 1.15, 1], horns: 1, wings: 'big', tail: 'long', extras: ['spikes'], kids: [14], cond: '平均評価 3.8以上', desc: '急降下しながら韻をつかむ狩人。三文字目までには答えが決まっている。' },
  { id: 14, name: 'アラシドリ', stage: 4, line: 'B', color: '#2A4FD6', belly: '#DDF6FF', accent: '#9DF0FF', shape: [1.1, 1.2, 1.05], horns: 2, wings: 'crystal', tail: 'comet', extras: ['swirl', 'halo', 'spikes'], kids: [], cond: '満タン＋直近6回の平均4.0以上', desc: '嵐を連れてくる鳥。長い言葉ほど速く、正確に返してくる。' },
  { id: 15, name: 'ツムジ', stage: 3, line: 'B', color: '#9EE6FF', accent: '#FF8FB1', shape: [.95, 1.05, .95], ears: 'fin', tail: 'nub', extras: ['swirl', 'swirl2'], kids: [], cond: '平均評価 3.8未満', desc: 'つむじ風をまとってくるくる回る。勢いで答えて、よく目を回す。' },
  { id: 16, name: 'カザグルマン', stage: 3, line: 'B', color: '#6FE0C8', accent: '#FFE066', shape: [1, 1.1, 1], wings: 'small', tail: 'long', extras: ['swirl', 'flower'], kids: [17], cond: '平均評価 3.8以上', desc: '頭の風車は、いい韻を聞くとよく回る。止まっていたら考え中。' },
  { id: 17, name: 'ソラノヌシ', stage: 4, line: 'B', color: '#E8FBFF', accent: '#3FA7F5', shape: [1.1, 1.15, 1.05], wings: 'big', tail: 'long', extras: ['halo', 'crown', 'swirl'], kids: [], cond: '満タン＋直近6回の平均4.0以上', desc: '空の主。雲の上で、世界中の語尾を聞き比べている。' },
  { id: 18, name: 'コガラシ', stage: 3, line: 'B', color: '#C9B79C', accent: '#E8643A', shape: [1, 1, 1], ears: 'fin', tail: 'nub', extras: ['leaves', 'swirl'], kids: [], cond: '平均評価 3.8未満', desc: '秋の終わりの風。落ち葉を集めては、ひと文字ずつ並べて遊ぶ。' },
  // ---- C: 長 (earth & plants)
  { id: 19, name: 'モリモ', stage: 1, line: 'C', color: '#B6E388', accent: '#5DAF4C', shape: [1.1, .9, 1.05], tail: 'nub', extras: ['shell', 'leaves'], kids: [20, 21], cond: '長さ優位（お題より長く返す）', desc: '頭の芽は、長い言葉を聞くほど伸びる。食べるのは主に語尾。' },
  { id: 20, name: 'ツタモリ', stage: 2, line: 'C', color: '#8FD16A', accent: '#3F8F33', shape: [1.1, .95, 1.05], ears: 'leaf', tail: 'leaf', extras: ['leaves'], kids: [22, 24], cond: '平均回答 4秒未満', desc: 'つるを伸ばして言葉に絡みつく。速いが、ときどき絡まる。' },
  { id: 21, name: 'イワモリ', stage: 2, line: 'C', color: '#C4B8A8', accent: '#8C7B6B', shape: [1.15, .95, 1.1], horns: 2, tail: 'nub', extras: ['rock'], kids: [25, 27], cond: '平均回答 4秒以上', desc: '岩のように動かない。でも一度話しはじめると長い。' },
  { id: 22, name: 'ツタモフ', stage: 3, line: 'C', color: '#5FBF4A', accent: '#FFD34D', shape: [1.15, 1, 1.15], horns: 2, wings: 'leaf', tail: 'leaf', extras: ['spikes', 'leaves'], kids: [23], cond: '平均評価 3.8以上', desc: '葉の翼を広げる守り神。長い言葉を、根っこから母音までからめとる。' },
  { id: 23, name: 'ジュカイオー', stage: 4, line: 'C', color: '#2F8F4E', belly: '#E6F7D8', accent: '#FFB3D1', shape: [1.25, 1.1, 1.2], horns: 2, wings: 'leaf', tail: 'leaf', extras: ['flower', 'crown', 'leaves'], kids: [], cond: '満タン＋直近6回の平均4.0以上', desc: '樹海の王。背中の森には、これまで聞いた韻が実っている。' },
  { id: 24, name: 'ハナモリ', stage: 3, line: 'C', color: '#F7C6D9', accent: '#7FC45E', shape: [1.1, 1, 1.05], ears: 'leaf', tail: 'nub', extras: ['flower', 'leaves'], kids: [29], cond: '平均評価 3.8未満', desc: '花を咲かせるのが得意。韻がそろうたびに花びらが一枚ふえる。' },
  { id: 25, name: 'ガンセキング', stage: 3, line: 'C', color: '#9C8F82', accent: '#FF7A3D', shape: [1.25, 1.05, 1.2], horns: 2, tail: 'long', extras: ['rock', 'spikes'], kids: [26], cond: '平均評価 3.8以上', desc: '重たい岩の体。言葉の重さを量ってから、ずしんと韻を落とす。' },
  { id: 26, name: 'ダイチノオウ', stage: 4, line: 'C', color: '#6B5A4A', belly: '#F2E4CC', accent: '#FFC93D', shape: [1.3, 1.1, 1.25], horns: 2, tail: 'long', extras: ['rock', 'crown', 'crystals', 'mane'], kids: [], cond: '満タン＋直近6回の平均4.0以上', desc: '大地の王。地鳴りのような声で、十文字超えの言葉を投げてくる。' },
  { id: 27, name: 'コケモリ', stage: 3, line: 'C', color: '#A3C78A', accent: '#6B8F4E', shape: [1.2, .95, 1.15], eyes: 'sleepy', tail: 'nub', extras: ['rock', 'leaves'], kids: [], cond: '平均評価 3.8未満', desc: '苔むしてほとんど眠っている。寝言で、たまにすごい韻を踏む。' },
  { id: 29, name: 'ハルノヌシ', stage: 4, line: 'C', color: '#FFE1EC', accent: '#7FC45E', shape: [1.15, 1.1, 1.1], ears: 'leaf', wings: 'leaf', tail: 'leaf', extras: ['flower', 'halo', 'crown'], kids: [], cond: 'ひみつ：直近6回のうち模範解答BINGOが3回以上で満タン', desc: '春そのもの。この子が笑うと、まわりの言葉が全部花の名前になる。', secret: true },
];
const BY = {}; SP.forEach(s => BY[s.id] = s);
/* ---------- TOURNAMENT: three eggs = three modes, one straight evolution line each, plus one hidden route ---------- */
const ROUND = ['1回戦', '準々決勝', '準決勝', '決勝戦'];
const ROUND_EN = ['ROUND 1', 'QUARTER FINAL', 'SEMI FINAL', 'FINAL'];
const VENUE = ['高架下ストリート', '地下クラブ', 'アリーナ', 'スタジアム'];
const VENUE_IX = [0, 2, 3, 4], VENUE_ALL = ['高架下ストリート', '屋上サイファー', '地下クラブ', 'アリーナ', 'スタジアム'];
const MODES = {
  N: { id: 'N', egg: 0, name: 'ノーマル', en: 'NORMAL', cup: 'ルーキーカップ', tag: 'しばりなし', desc: 'ヒントつき。韻が少しずれても、いい言葉なら届く。まずはここから。', line: [0, 19, 9, 24, 26], col: '#FF8A3D',
       len: [[3, 4], [3, 5], [4, 6], [5, 99]], gain: [1, .85, .65, .55] },
  H: { id: 'H', egg: 30, name: 'ノーヒント', en: 'NO HINT', cup: 'ハードコアカップ', tag: '高難度', desc: 'ヒントなし。お題の母音だけを頼りに踏め。', line: [30, 10, 11, 13, 14], col: '#3FA7F5', strict: true, noHint: true, lock: 'N',
       len: [[3, 4], [3, 5], [4, 6], [5, 99]], gain: [1.15, 1, .78, .66] },
  L: { id: 'L', egg: 31, name: 'ロングライム', en: 'LONG RHYME', cup: 'ロングライムカップ', tag: '高難度', desc: '出てくるお題はぜんぶ5文字以上。長い韻を最後まで踏みきれ。', line: [31, 1, 2, 4, 5], col: '#B36BFF', lock: 'N',
       len: [[5, 5], [5, 6], [6, 99], [6, 99]], gain: [1.1, .95, .78, .66] },
};
// ---------- THE NEW ROSTER: three starters, each a branching tree (1 → 2 → 4 → 4 → 4), every form a different animal ----------
// [id, name, color, accent, desc, [punch ×3]]
const SPECIES = [
  [100, 'ワンコロ', '#F2C98F', '#FF8A3D', 'しっぽを振るたび韻がこぼれる子犬。ほめられると3倍しゃべる。', ['ワンと鳴いて 韻を探す', 'しっぽ全開 テンション満開', '骨まで響く このワンフレーズ']],
  [101, 'ニャンタ', '#B7A6F2', '#FFE066', '気まぐれな猫。考えるより先に口が動く。', ['ニャンと言わせる 速攻フロウ', '気まぐれだけど 韻はガチ', '爪とぎしたての 鋭いライム']],
  [102, 'クマゴロ', '#C99A6A', '#FF8FB1', 'のんびり屋のこぐま。じっくり考えて、ずしっと踏む。', ['クマった時ほど 韻で勝負', 'はちみつより 甘くないフロウ', 'のっそり歩いて がっつり踏む']],
  [103, 'コンコ', '#FF9A4D', '#FFE066', '漢字が好きなきつね。難しい字ほどよく化かす。', ['化かし合いなら 負けはしない', 'コンと鳴らす 本気の音', '狐の嫁入り 晴れの舞台']],
  [104, 'ピョンタ', '#FFC4DC', '#FFFFFF', 'ひらがなで跳ねるうさぎ。耳で母音を聞きわける。', ['跳ねる言葉で 胸を突く', 'うさ耳で聞く 君の弱点', 'ピョンと飛び越す ハードル全部']],
  [105, 'パンダナ', '#FFFFFF', '#FF8FB1', '白黒はっきりつけたいパンダ。笹の葉で韻をメモする。', ['白黒つけるぜ このバトル', '笹食って 刺さる言葉', 'パンダだけど 甘くないんだ']],
  [106, 'ポンタ', '#C9925E', '#6B4A33', 'おなかで刻むタヌキ。ポンと鳴らせば場があたたまる。', ['ポンと鳴らせば 本気の音', '化かすのは 韻と人の目', '腹鼓で 決める鼓動']],
  [107, 'フェネル', '#F5D49A', '#FF8A3D', '大きな耳で、遠くの韻まで拾う砂漠のきつね。', ['砂漠の耳は 聞き逃さない', '遠くの韻まで 拾うアンテナ', '熱い砂より 熱いライム']],
  [108, 'ユキミミ', '#F4F6FF', '#7FD4FF', '雪原を跳ねる白うさぎ。足あとが母音の形になる。', ['雪に残すぜ 韻の足あと', '白い息ごと 吐き出すフロウ', '冬の夜でも 声はホット']],
  [109, 'レサパン', '#D9693A', '#FFF0DC', 'しましまのしっぽで拍をとるレッサーパンダ。', ['しましましっぽで 刻むビート', '立ち上がったら 止まらないフロウ', '小さくたって 主役は俺']],
  [110, 'アライグマ', '#9AA0AE', '#2B2633', '言葉を洗ってピカピカにするアライグマ。', ['洗い立ての 新しい韻', 'マスクの奥で 光る眼差し', '汚れた言葉は 洗い流す']],
  [111, 'クビラ', '#FFE1EC', '#FFC93D', '九つの尾を持つ伝説のきつね。尾の数だけ韻がある。', ['九つの尾で 九回KO', '狐火ともして 心を燃やす', '伝説はいつも 韻から始まる']],
  [112, 'ルナピョン', '#E3D9FF', '#FFE066', '月から来た羽うさぎ。満月の夜に韻が冴える。', ['月まで届けるぜ このライム', '羽ばたく耳で 夜を跳ぶ', '満月の下 韻は満タン']],
  [113, 'シロクマ', '#F6FAFF', '#56D9F5', '氷の上で踊る王者のクマ。冷静に、熱く踏む。', ['氷の上でも 滑らない韻', 'クールな顔して 熱いハート', '北極から来た 本物のフロウ']],
  [114, 'レオン', '#F2B544', '#C9762E', 'たてがみをなびかせるライオン。吠えれば会場が揺れる。', ['百獣の王の 百発百中', '吠えるたびに 揺れる会場', 'たてがみなびかせ 頂点へ']],
  [120, 'チビドラ', '#7DD3F5', '#FFE066', 'ヒントは聞かない主義のちびドラゴン。くしゃみで母音が出る。', ['ヒントはいらない 答えは中に', 'ちいさな翼で 大きな夢', 'くしゃみひとつで 火花のライム']],
  [121, 'ヒノコ', '#FF7A5C', '#FFE066', '火の粉を吐く赤い竜の子。速さで押し切る。', ['火の粉散らして 速攻勝負', '燃える言葉で 焼き尽くす', 'アツくなったら 止まらない']],
  [122, 'ミズチ', '#5FC8E8', '#FFFFFF', '水の中で育った竜。流れるようなフロウが得意。', ['水のように 流れるフロウ', '深い韻ほど 澄んだ声', '波に乗せるぜ このライム']],
  [123, 'イカヅチ', '#FFD84D', '#3D7BFF', '稲妻をまとう竜。漢字のように角ばった声で鳴く。', ['稲妻フロウで 会場停電', '雷鳴とどろく 一撃の韻', '光より先に 届く言葉']],
  [124, 'ハナリュウ', '#FFB3D1', '#7FC45E', '花を咲かせる竜。やわらかな言葉でとどめを刺す。', ['花びら舞わせ とどめの一句', 'やさしい顔して 刺す言葉', '咲かせてみせる 韻の花']],
  [125, 'コオリュウ', '#DFF4FF', '#56D9F5', '氷の結晶をまとう竜。凍るほど冷たい韻を吐く。', ['凍りつくほど 冷たい韻', '結晶みたいに 澄んだ言葉', '氷点下でも 熱いバース']],
  [126, 'モリュウ', '#7FCB6A', '#C9844A', '森の奥でねむる竜。角に小鳥が住んでいる。', ['森の奥から 響く韻', '根っこまで 届く言葉', '葉っぱ一枚 ひらりと勝つ']],
  [127, 'ワイバーン', '#B0413E', '#FFC93D', '大きな翼で空を制する竜。急降下の一撃は重い。', ['急降下で 狙うは頂上', '翼広げて 支配する空', '空から降らす 韻の雨']],
  [128, 'フェアドラ', '#C9F2E4', '#FF8FB1', '妖精の羽を持つ竜。ささやくだけで観客が沸く。', ['ささやく声で 沸かす会場', '妖精の羽で 韻を運ぶ', '小さな魔法で 大逆転']],
  [129, 'ユキリュウ', '#F3F0FF', '#B98CFF', 'もこもこの毛に包まれた雪山の竜。', ['もこもこだけど キレは鋭い', '雪山から 届くエコー', '吹雪の中でも 踏み外さない']],
  [130, 'ジュエルドラ', '#8E7BFF', '#FFE066', '宝石の角を持つ竜。磨いた言葉しか口にしない。', ['磨き抜いた 宝石の韻', '輝く角で 照らすステージ', '光る言葉は 色あせない']],
  [131, 'リュウオウ', '#FFC93D', '#FF4D1A', '竜の王。黄金のうろこは、勝った韻の数だけ光る。', ['竜の王が 告げる勝利', '黄金のうろこ 百戦錬磨', '頂点からの 宣言だ']],
  [132, 'セイリュウ', '#3FB8A8', '#FFE066', '東の空を守る青い竜。長い体で韻を巻き取る。', ['東の空から 吹かす風', '長い韻ほど 深い呼吸', '天を駆けるぜ このフロウ']],
  [133, 'ヒョウガ', '#A9D8FF', '#FFFFFF', '氷河をよろいにした竜。どんな韻も跳ね返す。', ['氷河のよろいで 全部はじく', '溶けない言葉 割れない心', '冷たい王の 熱い一撃']],
  [134, 'ジュカイリュウ', '#4E9A3D', '#FFB3D1', '樹海の主の竜。千年分の言葉を根に蓄えている。', ['千年分の 言葉を背負う', '樹海の奥で 鳴らす鼓動', '根を張る韻は 倒れない']],
  [140, 'ラボット', '#E9E4F7', '#B36BFF', '研究所生まれのちびロボ。胸のメーターで長い韻を解析する。', ['長い韻ほど 深いイン', '解析完了 次は勝利', 'ちいさな回路に でかい夢']],
  [141, 'ネジボ', '#C9D3E0', '#FF4D1A', 'ネジを巻くほど速くしゃべるロボ。', ['ネジ巻いて 加速するフロウ', '止まらないぜ この回転', 'ギア上げてく 次の段階']],
  [142, 'デンパ', '#FFE9A8', '#56D9F5', '耳のアンテナで電波を受け取るロボ。たまにラジオが混ざる。', ['電波に乗せて 届けるライム', 'アンテナ立てて 受信完了', '周波数ごと ジャックする']],
  [143, 'メカニャン', '#6E6688', '#D4FF3A', '猫型ロボ。漢字変換が爆速。', ['変換速度は 世界一', 'メカの爪で ひっかく韻', 'ニャンとびっくり 高性能']],
  [144, 'ドローボ', '#9EE6FF', '#FF8FB1', 'プロペラで浮かぶロボ。上空から韻を落とす。', ['上空から 落とすライム', 'プロペラ回して 浮かぶフロウ', '見下ろす景色は 勝者の目線']],
  [145, 'タンクボ', '#A39A90', '#FFC21A', '分厚い装甲のロボ。どっしり構えて言葉を撃つ。', ['装甲厚めで 効かない攻撃', '一発ずつ 重い言葉', 'どっしり構えて 打ち返す']],
  [146, 'ハカセボ', '#FFFFFF', '#2E9B5E', '博士の助手ロボ。辞書を丸ごと覚えている。', ['辞書ごと覚えた このライム', '研究成果を 披露する', '理屈も韻も 完璧だ']],
  [147, 'ロボワン', '#E8C27A', '#3D7BFF', '犬型ロボ。ご主人の言葉は一文字も聞き逃さない。', ['忠実に刻む ビートの上', 'しっぽのモーター 全開だ', '聞き逃さない 一文字も']],
  [148, 'ジェットボ', '#FF8FB1', '#56D9F5', 'ジェット噴射で飛ぶロボ。音速で韻を返す。', ['音速超えの 返しの韻', 'ジェット噴射で 一気に頂点', '置いていくぜ その言葉']],
  [149, 'メカモス', '#8A7F99', '#FFC21A', 'マンモス型の巨大ロボ。足音がそのままビートになる。', ['足音ひとつで 鳴らすビート', 'マンモス級の パンチライン', '巨体で踏む 重い韻']],
  [150, 'ネオンボ', '#B36BFF', '#D4FF3A', '夜の街で光るロボ。韻を踏むたび色が変わる。', ['ネオンの街で 光る韻', '色を変えるぜ 一節ごと', '夜を照らす このフロウ']],
  [151, 'ギガボット', '#3E5FA8', '#FFE066', '超巨大ロボ。声の出力がスタジアム級。', ['出力最大 ギガのライム', 'スタジアムごと 揺らす声', '巨大な言葉で 押しつぶす']],
  [152, 'コスモボ', '#2C3070', '#FFE066', '宇宙を旅するロボ。星の数だけ韻を知っている。', ['宇宙の果てまで 届く韻', '星の数ほど 知ってる言葉', '無重力でも 踏みはずさない']],
  [153, 'メカドラ', '#C9C4DA', '#FF4D1A', 'ドラゴン型の最終兵器ロボ。', ['最終兵器の 最終バース', '鋼の翼で 制する空', '起動完了 勝利確定']],
  [154, 'オーロボ', '#DFFBFF', '#B36BFF', 'オーロラ色に輝くロボ。見とれた相手はもう負けている。', ['オーロラ色の 夜明けの韻', '見とれた時点で 勝負あり', '光の帯で 包むフロウ']],
];
const TREE = {
  N: [100, [101, [103, 111], [104, 112]], [102, [105, 113], [106, 114]]],
  H: [120, [121, [123, 131], [124, 132]], [122, [125, 133], [126, 134]]],
  L: [140, [141, [143, 151], [144, 152]], [142, [145, 153], [146, 154]]],
};
const SECRET_FROM = -1, SECRET_LINE = [];
SP.forEach(s => { s.kids = []; delete s.parent; s.secret = false; s.mode = null; });
SPECIES.forEach(([id, name, color, accent, desc]) => SP.push({ id, name, color, accent, desc, stage: 0, line: 'A', kids: [], cond: '' }));
SP.forEach(s => BY[s.id] = s);
for (const [mk, [s0, ...branches]] of Object.entries(TREE)) {
  const m = MODES[mk], set = (id, st, par) => { const s = BY[id]; s.stage = st; s.mode = mk; s.line = mk === 'N' ? 'C' : mk === 'H' ? 'B' : 'A'; if (par != null) { s.parent = par; BY[par].kids.push(id); } };
  m.egg = s0; set(s0, 0, null); BY[s0].cond = m.lock ? 'ノーマルで RANK A 到達で解禁' : 'はじめから';
  branches.forEach(([s1, ...subs], bi) => { set(s1, 1, s0); BY[s1].bi = bi; BY[s1].cond = 'コインで進化（どちらか選べる）';
    subs.forEach(([s2, s4], si) => { set(s2, 2, s1); BY[s2].bi = bi; BY[s2].si = si; BY[s2].cond = 'コインで進化（どちらか選べる）'; set(s4, 3, s2); BY[s4].bi = bi; BY[s4].si = si; BY[s4].cond = 'コインで進化'; }); });
  m.line = [s0]; // kept for older callers (the starter)
}
const LINE_OF = id => BY[id].mode;
const treeIds = mk => { const [s0, ...b] = TREE[mk]; return [s0, ...b.flatMap(([s1, ...subs]) => [s1, ...subs.flat()])]; };
const ROSTER = [...treeIds('N'), ...treeIds('H'), ...treeIds('L')];
/* ---------- opponents: one MC per round, the unused 15 monsters ---------- */
const OPP = {
  N: [{ id: 12, n: 'MCガァコ', c: 'まだ駆け出しの路上MC。声だけはでかい。', p: 69 }, { id: 20, n: 'MCケロッパ', c: 'ため池育ち。ゲロゲロ韻で場を濡らす。', p: 57 }, { id: 21, n: 'MCチクチク', c: '言葉にトゲしかないスクラッチャー。', p: 72 }, { id: 25, n: 'MCツノダイン', c: '一撃が重いパワー系。踏み込みで床が割れる。', p: 52 }, { id: 23, n: 'MCロクオウ', c: 'ルーキーカップを三連覇中の絶対王者。', p: 55 }],
  H: [{ id: 18, n: 'MCチュンチュン', c: '朝いちばんのフリースタイル。早口。', p: 76 }, { id: 22, n: 'MCノロノロ', c: '一言ずつ、完璧な韻しか言わない達人。', p: 50 }, { id: 6, n: 'MCどんぐり', c: '韻を頬袋にためこんで、いっきに吐く。', p: 74 }, { id: 7, n: 'MCヨルノ', c: '真夜中のバトルでは負け知らず。', p: 58 }, { id: 17, n: 'MCグランブルー', c: '空を泳ぐ伝説の王者。声が雲を割る。', p: 48 }],
  L: [{ id: 27, n: 'MCユズユズ', c: '温泉につかったまま長い韻をのばす。', p: 54 }, { id: 16, n: 'MCピーコ', c: '相手の言葉をそのまま長く言い返す。', p: 78 }, { id: 3, n: 'MCニャンダム', c: '気まぐれな五七五で間合いをずらす。', p: 66 }, { id: 28, n: 'MCフライモモ', c: '滑空しながらロングトーンで刻む。', p: 70 }, { id: 8, n: 'MCメェルディ', c: '長すぎる韻で相手を眠らせる王者。', p: 53 }],
};
['N', 'H', 'L'].forEach(k => OPP[k].splice(2, 1));
OPP.S = OPP.N;
const oppFor = (mode, st, secret) => secret && st >= 3 ? OPP.S[st - 3] : OPP[mode][st];
SP.forEach(s => s.kids.forEach(k => BY[k].parent = s.id));
SP.forEach(s => s.vst = s.mode ? VST[s.stage] : s.stage);
const CUT_FORM = { 107: 103, 108: 104, 109: 105, 110: 106, 127: 123, 128: 124, 129: 125, 130: 126, 147: 143, 148: 144, 149: 145, 150: 146 }; // retired middle forms → the form before

