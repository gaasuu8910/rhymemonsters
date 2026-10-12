window.addEventListener('error', e => { try { let b = document.getElementById('errTag'); if (!b) { b = document.createElement('button'); b.id = 'errTag'; b.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:99;max-width:70vw;background:#FF2E4D;color:#fff;font:600 11px ui-monospace,monospace;padding:6px 10px;border:0;border-radius:4px;text-align:left;cursor:pointer'; b.onclick = () => b.remove(); document.body.appendChild(b); } b.textContent = 'ERROR: ' + (e.message || e.error) + ' (' + (e.lineno || '') + ')  ✕'; } catch (_) {} });
const $ = id => document.getElementById(id);
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const outBack = t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const outCubic = t => 1 - Math.pow(1 - t, 3);
const pick = a => a[(Math.random() * a.length) | 0];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const store = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
/* play counter: anonymous random id + event name, only on the live site (no personal data) */
const TRACK_ON = /\.workers\.dev$|^rhymemonsters\./.test(location.hostname) && location.protocol === 'https:';
const RM_UID = (() => { try { let u = localStorage.getItem('rm.uid'); if (!u) { u = Math.random().toString(36).slice(2, 12) + Date.now().toString(36); localStorage.setItem('rm.uid', u); } return u; } catch (e) { return ''; } })();
function track(e, m) { if (!TRACK_ON || !RM_UID) return; try { const b = JSON.stringify({ e, m: m || '', u: RM_UID }); if (!(navigator.sendBeacon && navigator.sendBeacon('/api/e', new Blob([b], { type: 'text/plain' })))) fetch('/api/e', { method: 'POST', body: b, keepalive: true }).catch(() => {}); } catch (err) {} }
track('visit');

