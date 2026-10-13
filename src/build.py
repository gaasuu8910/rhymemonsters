import os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
r = lambda f: open(f).read()
# EMBED=1 → one self-contained file (Claude artifact preview). Default → production: heavy assets as separate cached files.
EMBED = os.environ.get('EMBED') == '1'
OUT = '../dist'; os.makedirs(OUT + '/vendor', exist_ok=True)
LEXSTUB = "window.LEXR = window.LEXR || { has: () => true, stub: true }; // real dictionary arrives from lex.js right after the page loads\naddEventListener('load', () => { const s = document.createElement('script'); s.src = 'lex.js?v=' + LEX_V; document.head.appendChild(s); });"
guard = "\nif (!window.THREE) { window.__bootOff && window.__bootOff(); document.body.insertAdjacentHTML('beforeend', '<p style=\"position:fixed;inset:auto 0 0 0;background:#fff;color:#000;padding:12px\">3D表示の読み込みに失敗しました。再読み込みしてください。</p>'); return; }\n"
code = '\n'.join([r('head.js'), r('data.js'), r('quiz.js'), r('diss.js'), r('fits.js'), (r('lexr.js') if EMBED else LEXSTUB)]) + guard + '\n'.join([r('reelbg.js'), r('stagebg.js'), r('creature.js'), r('animals.js'), r('outfit_table.js'), r('roster.js'), r('wardrobe.js'), r('dress.js'), r('figure.js'), r('audio.js'), r('game.js'), r('karaoke.js'), r('outings.js'), r('opening.js'), r('tree.js'), r('boot.js')])
EMB = r('emblem.svg'); FAV = r('favicon.svg')
import base64
b64 = lambda s: base64.b64encode(s if isinstance(s, bytes) else s.encode()).decode()
FD = '../figs_s' if os.path.isdir('../figs_s') else '../figs'
FIGL = sorted(int(f[:-5]) for f in os.listdir(FD) if f.endswith('.webp')) if os.path.isdir(FD) else []
FIGD = ','.join((f"{i}:'data:image/webp;base64,{b64(open(f'{FD}/{i}.webp','rb').read())}'" if EMBED else f"{i}:'figs_s/{i}.webp'") for i in FIGL)
import hashlib
LEX = r('lexr.js').replace('const LEXR = ', 'window.LEXR = ', 1); LEX_V = hashlib.md5(LEX.encode()).hexdigest()[:8]
if not EMBED:
    open(OUT + '/lex.js', 'w').write(LEX)
    VEN = '/tmp/claude-0/three/package/'
    parts = ['build/three.min.js'] + ['examples/js/' + x for x in ['shaders/CopyShader.js', 'shaders/LuminosityHighPassShader.js', 'postprocessing/EffectComposer.js', 'postprocessing/RenderPass.js', 'postprocessing/ShaderPass.js', 'postprocessing/UnrealBloomPass.js', 'environments/RoomEnvironment.js']]
    if os.path.isdir(VEN): open(OUT + '/vendor/three-r128.js', 'w').write('\n;'.join(open(VEN + x).read() for x in parts))
code = 'const FIG_DATA = {' + FIGD + '};\n' + (f"const CHEER_URI = 'data:audio/mpeg;base64,{b64(open('cheer.mp3', 'rb').read())}';\n" if EMBED else "const CHEER_URI = 'cheer.mp3';\n") + f"const LEX_V = '{LEX_V}';\n" + f"const EMBLEM_URI = 'data:image/svg+xml;base64,{b64(EMB)}';\n" + code
html = r('shell.html').replace('/*__CODE__*/', code).replace('<!--EMBLEM-->', EMB.replace('xmlns="http://www.w3.org/2000/svg" ', 'aria-hidden="true" ', 1))
# Cloudflare Web Analytics: paste the site token here (Dashboard → Analytics & Logs → Web Analytics)
CF_BEACON_TOKEN = '3ebbd95bf68a4664923837cba49eef37'
html = html.replace('<title>', ('<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon=\'{"token": "%s"}\'></script>\n' % CF_BEACON_TOKEN if CF_BEACON_TOKEN else '') + '<title>', 1)
html = html.replace('__EMBLEM_URI__', 'data:image/svg+xml;base64,' + b64(EMB))
html = html.replace('__FAVICON__', 'data:image/svg+xml;base64,' + b64(FAV)).replace('__APPLEICON__', 'data:image/png;base64,' + b64(open('apple-touch-icon.png', 'rb').read()))
if not EMBED:
    import re
    tags = re.findall(r'<script src="https://cd[^"]*three[^"]*"></script>\n?', html); assert len(tags) == 8, len(tags)
    html = html.replace(tags[0], '<script src="vendor/three-r128.js"></script>\n', 1)
    for t in tags[1:]: html = html.replace(t, '', 1)
    html = html.replace('data:image/png;base64,' + b64(open('apple-touch-icon.png', 'rb').read()), 'apple-touch-icon.png')
open('../intama.html' if EMBED else OUT + '/index.html', 'w').write(html)
