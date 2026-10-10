function showTab(tree) {
  $('tabPlay').setAttribute('aria-pressed', !tree); $('tabTree').setAttribute('aria-pressed', tree);
  $('playView').hidden = tree; $('treeView').hidden = !tree;
  if (tree) { if (G.state === 'answer') { G.pausedAt = performance.now(); G.state = 'paused'; } selected = G.sp.id; renderTree(); }
  else { if (G.state === 'paused') { G.t0 += performance.now() - G.pausedAt; G.state = 'answer'; answerEl.focus({ preventScroll: true }); } resize(); }
}
$('tabPlay').addEventListener('click', () => showTab(false));
$('tabTree').addEventListener('click', () => showTab(true));
$('showAll').addEventListener('click', () => { showAll = !showAll; $('showAll').setAttribute('aria-pressed', showAll); renderTree(); });

setMonster(G.sp, false); G.state = 'title';

updateHud();
new ResizeObserver(resize).observe(stageEl); resize();
opSetup();
requestAnimationFrame(loop);
window.__game = { playEnding, endlessOver, renderTree, makeThumbs, AIQ, QBY, pickWord, branchTarget, secretCount, PRG, MODES, OPP, OPPN, loadMode, showModeSelect, showClear, showVS, REEL, STAGEBG, ST, statsOf, BEAT, beatTap, beatGrid, LS, PH, save, lnDown, lnUp, showBracket, verdict, TRACKS, SP_TRACK, G, V, BY, SP, setMonster: (s, p) => { setMonster(s, p); camDefaults(); camReset(); }, judge, Seq, startBattle, reveal, evolve, showTab, tapMonster, startDance, A, get foods() { return foods; } };
