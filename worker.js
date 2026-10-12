// RHYME MONSTERS — static game + tiny anonymous play counter.
// POST /api/e   {e, m, u}  → counts one event (u = random id the game keeps in localStorage)
// GET  /stats?k=STATS_KEY  → numbers page (STATS_KEY is a secret set in the Cloudflare dashboard)
import { DurableObject } from 'cloudflare:workers';

const EVENTS = ['visit', 'play', 'win', 'champ', 'lose', 'quit', 'evolve', 'daily', 'endless_end', 'post'];
const LABEL = { visit: '起動', play: 'バトル開始', win: '勝利', champ: '優勝', lose: '敗北', quit: '中断', evolve: '進化', daily: '今日の5韻', endless_end: 'エンドレス終了', post: 'Xポスト' };
const jstDay = (t = Date.now()) => new Date(t + 9 * 3600e3).toISOString().slice(0, 10);

export class Stats extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    this.sql.exec(`CREATE TABLE IF NOT EXISTS ev (day TEXT, e TEXT, m TEXT, n INTEGER, PRIMARY KEY (day, e, m));
      CREATE TABLE IF NOT EXISTS du (day TEXT, e TEXT, u TEXT, PRIMARY KEY (day, e, u));
      CREATE TABLE IF NOT EXISTS au (e TEXT, u TEXT, first TEXT, PRIMARY KEY (e, u));`);
  }
  add(e, m, u) {
    const d = jstDay();
    this.sql.exec('INSERT INTO ev VALUES (?,?,?,1) ON CONFLICT DO UPDATE SET n = n + 1', d, e, m);
    if (u) {
      this.sql.exec('INSERT OR IGNORE INTO du VALUES (?,?,?)', d, e, u);
      this.sql.exec('INSERT OR IGNORE INTO au VALUES (?,?,?)', e, u, d);
    }
  }
  summary() {
    const q = (s, ...a) => this.sql.exec(s, ...a).toArray();
    return {
      total: q('SELECT e, SUM(n) n FROM ev GROUP BY e'),
      people: q('SELECT e, COUNT(*) n FROM au GROUP BY e'),
      days: q(`SELECT day, e, SUM(n) n FROM ev WHERE day >= ? GROUP BY day, e`, jstDay(Date.now() - 29 * 864e5)),
      dayPeople: q(`SELECT day, e, COUNT(*) n FROM du WHERE day >= ? GROUP BY day, e`, jstDay(Date.now() - 29 * 864e5)),
      modes: q(`SELECT m, SUM(n) n FROM ev WHERE e = 'play' GROUP BY m ORDER BY n DESC`),
    };
  }
}

const stub = env => env.STATS.get(env.STATS.idFromName('all'));

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname === '/api/e') {
      if (req.method !== 'POST') return new Response(null, { status: 405 });
      try {
        const b = JSON.parse((await req.text()).slice(0, 400));
        const e = String(b.e || ''), m = String(b.m || '').slice(0, 12), u = /^[a-z0-9]{6,32}$/.test(b.u || '') ? b.u : '';
        if (EVENTS.includes(e)) await stub(env).add(e, m, u);
      } catch (err) {}
      return new Response(null, { status: 204 });
    }
    if (url.pathname === '/stats') {
      if (!env.STATS_KEY || url.searchParams.get('k') !== env.STATS_KEY) return new Response('Not found', { status: 404 });
      const s = await stub(env).summary();
      if (url.searchParams.has('json')) return Response.json(s);
      return new Response(page(s), { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
    }
    return env.ASSETS.fetch(req);
  },
};

function page(s) {
  const tot = Object.fromEntries(s.total.map(r => [r.e, r.n])), ppl = Object.fromEntries(s.people.map(r => [r.e, r.n]));
  const days = [];
  for (let i = 0; i < 30; i++) days.push(jstDay(Date.now() - i * 864e5));
  const cell = (rows, d, e) => (rows.find(r => r.day === d && r.e === e) || {}).n || 0;
  const big = [['プレイ人数', ppl.play || 0, 'バトルを1回以上始めた人'], ['訪問人数', ppl.visit || 0, 'ゲームを開いた人'], ['バトル回数', tot.play || 0, '累計'], ['起動回数', tot.visit || 0, '累計']];
  const maxP = Math.max(1, ...days.map(d => cell(s.dayPeople, d, 'play')));
  const rows = days.map(d => {
    const p = cell(s.dayPeople, d, 'play');
    return `<tr><td>${d.slice(5).replace('-', '/')}</td><td>${cell(s.dayPeople, d, 'visit')}</td><td class="b"><i style="width:${p / maxP * 100}%"></i><span>${p}</span></td><td>${cell(s.days, d, 'play')}</td><td>${cell(s.days, d, 'win')}</td><td>${cell(s.days, d, 'champ')}</td><td>${cell(s.days, d, 'post')}</td></tr>`;
  }).join('');
  const evs = EVENTS.map(e => `<tr><td>${LABEL[e]}</td><td>${tot[e] || 0}</td><td>${ppl[e] || 0}</td></tr>`).join('');
  const MODE = { N: 'ノーマル', H: 'ノーヒント', L: 'ロングライム', endless: 'エンドレス', daily: '今日の5韻' };
  const modes = s.modes.map(r => `<tr><td>${MODE[r.m] || r.m || '—'}</td><td>${r.n}</td></tr>`).join('');
  return `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>RHYME MONSTERS 数字</title>
<style>body{margin:0;background:#0E0B22;color:#eee;font:15px/1.5 system-ui,sans-serif;padding:20px 16px 40px}h1{font-size:18px;letter-spacing:.08em;color:#D4FF3A;margin:0 0 4px}p.s{color:#9a93c4;margin:0 0 18px;font-size:12px}
.k{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:24px}.k div{background:#1b1640;border-radius:10px;padding:12px 14px}.k b{display:block;font-size:30px;color:#fff}.k small{color:#9a93c4;font-size:11px}
h2{font-size:13px;color:#9a93c4;letter-spacing:.12em;margin:22px 0 8px}table{border-collapse:collapse;width:100%;max-width:900px;font-variant-numeric:tabular-nums}td,th{padding:6px 8px;border-bottom:1px solid #26205a;text-align:right;white-space:nowrap}th{color:#9a93c4;font-weight:600;font-size:12px}td:first-child,th:first-child{text-align:left}
.b{position:relative;min-width:120px}.b i{position:absolute;left:0;top:6px;bottom:6px;background:#D4FF3A33;border-radius:3px}.b span{position:relative}.w{overflow-x:auto}</style>
<h1>RHYME MONSTERS — 数字</h1><p class="s">日付は日本時間。人数は端末ごとの匿名IDで数えています（同じ人でも別の端末・ブラウザだと別カウント）。</p>
<div class="k">${big.map(([a, n, c]) => `<div><small>${a}</small><b>${n.toLocaleString()}</b><small>${c}</small></div>`).join('')}</div>
<h2>日別（直近30日）</h2><div class="w"><table><tr><th>日付</th><th>訪問人数</th><th>プレイ人数</th><th>バトル</th><th>勝利</th><th>優勝</th><th>ポスト</th></tr>${rows}</table></div>
<h2>累計</h2><div class="w"><table><tr><th>イベント</th><th>回数</th><th>人数</th></tr>${evs}</table></div>
<h2>モード別バトル回数</h2><div class="w"><table><tr><th>モード</th><th>回数</th></tr>${modes}</table></div>`;
}
