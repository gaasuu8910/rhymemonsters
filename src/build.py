import os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
r = lambda f: open(f).read()
guard = "\nif (!window.THREE) { document.body.insertAdjacentHTML('beforeend', '<p style=\"position:fixed;inset:auto 0 0 0;background:#fff;color:#000;padding:12px\">3D表示の読み込みに失敗しました。再読み込みしてください。</p>'); return; }\n"
code = '\n'.join([r('head.js'), r('data.js'), r('quiz.js'), r('diss.js'), r('fits.js'), r('lexr.js')]) + guard + '\n'.join([r('reelbg.js'), r('stagebg.js'), r('creature.js'), r('animals.js'), r('outfit_table.js'), r('roster.js'), r('wardrobe.js'), r('dress.js'), r('audio.js'), r('game.js'), r('karaoke.js'), r('outings.js'), r('opening.js'), r('tree.js'), r('boot.js')])
open('../index.html', 'w').write(r('shell.html').replace('/*__CODE__*/', code))
