import os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
r = lambda f: open(f).read()
guard = "\nif (!window.THREE) { document.body.insertAdjacentHTML('beforeend', '<p style=\"position:fixed;inset:auto 0 0 0;background:#fff;color:#000;padding:12px\">3D表示の読み込みに失敗しました。再読み込みしてください。</p>'); return; }\n"
code = '\n'.join([r('head.js'), r('data.js'), r('quiz.js'), r('diss.js'), r('fits.js'), r('lexr.js')]) + guard + '\n'.join([r('reelbg.js'), r('stagebg.js'), r('creature.js'), r('animals.js'), r('outfit_table.js'), r('roster.js'), r('wardrobe.js'), r('dress.js'), r('audio.js'), r('game.js'), r('karaoke.js'), r('outings.js'), r('opening.js'), r('tree.js'), r('boot.js')])
import base64
b64 = lambda s: base64.b64encode(s if isinstance(s, bytes) else s.encode()).decode()
EMB = r('emblem.svg'); FAV = r('favicon.svg')
code = f"const EMBLEM_URI = 'data:image/svg+xml;base64,{b64(EMB)}';\n" + code
html = r('shell.html').replace('/*__CODE__*/', code).replace('<!--EMBLEM-->', EMB.replace('xmlns="http://www.w3.org/2000/svg" ', 'aria-hidden="true" ', 1))
html = html.replace('__FAVICON__', 'data:image/svg+xml;base64,' + b64(FAV)).replace('__APPLEICON__', 'data:image/png;base64,' + b64(open('apple-touch-icon.png', 'rb').read()))
open('../index.html', 'w').write(html)
