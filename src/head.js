window.addEventListener('error', e => { try { let b = document.getElementById('errTag'); if (!b) { b = document.createElement('button'); b.id = 'errTag'; b.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:99;max-width:70vw;background:#FF2E4D;color:#fff;font:600 11px ui-monospace,monospace;padding:6px 10px;border:0;border-radius:4px;text-align:left;cursor:pointer'; b.onclick = () => b.remove(); document.body.appendChild(b); } b.textContent = 'ERROR: ' + (e.message || e.error) + ' (' + (e.lineno || '') + ')  ✕'; } catch (_) {} });
const $ = id => document.getElementById(id);
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const outBack = t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const outCubic = t => 1 - Math.pow(1 - t, 3);
const pick = a => a[(Math.random() * a.length) | 0];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const store = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
