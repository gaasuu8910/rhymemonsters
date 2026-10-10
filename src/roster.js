/* looks for the new roster: animal parts + a default rapper outfit for each form */
Object.assign(MOTIF, {
  100: { ears: 'floppy', muzzle: 'bear', tail: 'puff', mat: 'plush', dance: 'hop', feet: 'paw', bel: '#FFF6E6' },
  101: { ears: 'cat', muzzle: 'cat', tail: 'cat', pat: 'tabby', mat: 'plush', dance: 'wiggle', feet: 'paw' },
  102: { ears: 'bear', muzzle: 'bear', tail: 'nub', mat: 'plush', dance: 'sway', feet: 'paw', bel: '#FFF0DA' },
  103: { ears: 'fox', muzzle: 'fox', tail: 'fox', pat: 'blaze', mat: 'fur', dance: 'flip', feet: 'paw', bel: '#FFF6EC' },
  104: { ears: 'bunny', muzzle: 'cat', tail: 'puff', mat: 'plush', dance: 'hop', feet: 'paw', bel: '#FFF4F8' },
  105: { ears: 'panda', muzzle: 'bear', pat: 'panda', tail: 'nub', mat: 'plush', dance: 'roll', feet: 'paw', limbs: '#2B2633' },
  106: { ears: 'bear', muzzle: 'tanuki', tail: 'tanuki', pat: 'cheek', leaf: true, mat: 'fur', dance: 'drum', feet: 'paw', bel: '#FFF0DC' },
  107: { ears: 'bat', muzzle: 'fox', tail: 'fox', mat: 'fur', dance: 'tilt', feet: 'paw', bel: '#FFF8E8', eyes: 'big' },
  108: { ears: 'bunny', muzzle: 'cat', tail: 'puff', mat: 'wool', dance: 'hop', feet: 'paw', bel: '#FFFFFF' },
  109: { ears: 'bear', muzzle: 'tanuki', tail: 'squirrel', pat: 'stripes', mat: 'fur', dance: 'bounce', feet: 'paw', bel: '#FFF0DC', limbs: '#5A2E1E' },
  110: { ears: 'bear', muzzle: 'fox', tail: 'tanuki', pat: 'mask', mat: 'fur', dance: 'headbang', feet: 'paw', bel: '#E6E8EE' },
  111: { ears: 'fox', muzzle: 'fox', tail: 'kyubi', pat: 'blaze', mat: 'plush', dance: 'spin', feet: 'paw' },
  112: { ears: 'bunny', muzzle: 'cat', horn: 'unicorn', wings: 'big', tail: 'puff', mat: 'satin', dance: 'float', feet: 'paw', bel: '#FFFFFF' },
  113: { ears: 'bear', muzzle: 'bear', tail: 'nub', mat: 'wool', dance: 'stomp', feet: 'paw', bel: '#FFFFFF' },
  114: { ears: 'bear', muzzle: 'cat', mane: '#C9762E', tail: 'thin', mat: 'fur', dance: 'power', feet: 'paw', bel: '#FFF0D0' },
  120: { ears: 'frill', muzzle: 'dragon', horn: 'dragon', wings: 'dragon', tail: 'dragon', mat: 'plush', dance: 'hop', feet: 'claw', head: [1.08, 1, 1], bel: '#F2FBFF' },
  121: { ears: 'bat', muzzle: 'dragon', horn: 'dragon', wings: 'dragon', tail: 'dragon', mat: 'scale', dance: 'headbang', feet: 'claw', bel: '#FFE9C8' },
  122: { ears: 'frill', muzzle: 'dragon', tail: 'fluke', mat: 'smooth', dance: 'sway', feet: 'claw', bel: '#E8FBFF' },
  123: { ears: 'frill', muzzle: 'dragon', horn: 'dragon', wings: 'crystal', tail: 'dragon', mat: 'scale', dance: 'spin', feet: 'claw', bel: '#FFF8D6' },
  124: { ears: 'pony', muzzle: 'dragon', horn: 'unicorn', wings: 'dragon', tail: 'dragon', flowerCrown: true, mat: 'plush', dance: 'prance', feet: 'claw', bel: '#FFF4F8' },
  125: { ears: 'frill', muzzle: 'dragon', horn: 'ram', wings: 'crystal', tail: 'dragon', mat: 'satin', dance: 'tilt', feet: 'claw', bel: '#FFFFFF' },
  126: { ears: 'deer', muzzle: 'dragon', horn: 'antler', tail: 'dragon', leaf: true, mat: 'scale', dance: 'sway', feet: 'claw', bel: '#F0FFE0' },
  127: { ears: 'bat', muzzle: 'dragon', horn: 'dragon', wings: 'bat', tail: 'dragon', mat: 'scale', dance: 'power', feet: 'claw', bel: '#FFDCC8' },
  128: { ears: 'pony', muzzle: 'dragon', wings: 'glide', tail: 'comet', mat: 'plush', dance: 'float', feet: 'claw', bel: '#FFFFFF', eyes: 'big' },
  129: { ears: 'frill', muzzle: 'dragon', horn: 'ram', wool: true, tail: 'dragon', mat: 'wool', dance: 'stomp', feet: 'claw', bel: '#FFFFFF' },
  130: { ears: 'frill', muzzle: 'dragon', horn: 'unicorn', wings: 'crystal', tail: 'dragon', mat: 'satin', dance: 'spin', feet: 'claw', bel: '#EDE8FF' },
  131: { ears: 'frill', muzzle: 'dragon', horn: 'dragon', wings: 'dragon', tail: 'dragon', mane: '#FF4D1A', mat: 'scale', dance: 'power', feet: 'claw', bel: '#FFF4CC' },
  132: { ears: 'frill', muzzle: 'dragon', horn: 'antler', tail: 'comet', mane: '#FFE066', mat: 'satin', dance: 'float', feet: 'claw', bel: '#E6FFF8' },
  133: { ears: 'frill', muzzle: 'dragon', horn: 'rhino', wings: 'crystal', armor: true, tail: 'dragon', mat: 'rock', dance: 'stomp', feet: 'claw', bel: '#F0F8FF' },
  134: { ears: 'deer', muzzle: 'dragon', horn: 'antler', wings: 'big', tail: 'dragon', leaf: true, flowerCrown: true, mat: 'scale', dance: 'sway', feet: 'claw', bel: '#E6F7D8' },
  140: { robot: true, mat: 'smooth', dance: 'bounce', feet: 'paw', tail: 'none', head: [1.1, .95, 1] },
  141: { robot: true, ears: 'bear', mat: 'smooth', dance: 'headbang', feet: 'paw', tail: 'none' },
  142: { robot: true, ears: 'bunny', mat: 'smooth', dance: 'hop', feet: 'paw', tail: 'none' },
  143: { robot: true, ears: 'cat', tail: 'cat', mat: 'smooth', dance: 'wiggle', feet: 'paw' },
  144: { robot: true, wings: 'big', mat: 'smooth', dance: 'float', feet: 'paw', tail: 'none' },
  145: { robot: true, armor: true, mat: 'smooth', dance: 'stomp', feet: 'paw', tail: 'none', body: [1.15, 1, 1.05] },
  146: { robot: true, ears: 'mouse', mat: 'smooth', dance: 'tilt', feet: 'paw', tail: 'none' },
  147: { robot: true, ears: 'floppy', muzzle: 'bear', tail: 'puff', mat: 'smooth', dance: 'hop', feet: 'paw' },
  148: { robot: true, wings: 'crystal', mat: 'smooth', dance: 'spin', feet: 'paw', tail: 'comet' },
  149: { robot: true, ears: 'elephant', muzzle: 'trunk', mat: 'smooth', dance: 'stomp', feet: 'hoof', tail: 'thin' },
  150: { robot: true, horn: 'unicorn', ears: 'pony', mat: 'satin', dance: 'prance', feet: 'paw', tail: 'none' },
  151: { robot: true, horn: 'rhino', armor: true, mat: 'smooth', dance: 'power', feet: 'paw', tail: 'none', body: [1.15, 1.05, 1.05] },
  152: { robot: true, wings: 'glide', mat: 'satin', dance: 'float', feet: 'paw', tail: 'comet' },
  153: { robot: true, ears: 'frill', horn: 'dragon', wings: 'dragon', tail: 'dragon', muzzle: 'dragon', mat: 'smooth', dance: 'power', feet: 'claw' },
  154: { robot: true, horn: 'unicorn', wings: 'crystal', mane: '#B36BFF', mat: 'satin', dance: 'spin', feet: 'paw', tail: 'none' },
});
// silhouettes: every species gets its own build so lines read apart even as black shapes
(() => { const S = {
  101: [[.82, 1.12, .9], [1.02, .95, 1]], 102: [[1.25, 1, 1.15], [1.1, 1, 1]], 103: [[.8, 1.15, .88], [.95, 1.02, 1.05]], 104: [[.9, .95, .95], [.95, 1.05, 1]],
  105: [[1.3, 1.05, 1.2]], 106: [[1.25, .95, 1.15]], 107: [[.78, 1.05, .85], [1.05, .95, 1]], 108: [[.95, .9, 1]], 109: [[.9, 1, .95]], 110: [[1.05, 1.05, 1]],
  111: [[.78, 1.2, .85], [.95, 1.05, 1.05]], 112: [[.85, 1.1, .9]], 113: [[1.4, 1, 1.25], [1.15, .95, 1.05]], 114: [[1.05, 1.12, 1], [1.15, 1.05, 1.05]],
  122: [[.85, 1.1, .9]], 126: [[1.2, .95, 1.15]], 128: [[.85, 1, .9]], 129: [[1.25, .95, 1.15]], 134: [[1.3, 1.05, 1.2]],
  141: [[1, 1.1, 1]], 142: [[.85, 1.05, .9]], 143: [[.85, 1.1, .9]], 144: [[.9, .85, .9], [1.15, .95, 1]], 145: [[1.35, .95, 1.2]], 146: [[.9, 1.1, .95], [1.12, 1.05, 1]],
  148: [[.82, 1.2, .88]], 149: [[1.45, 1, 1.3]], 150: [[.8, 1.2, .85]], 151: [[1.4, 1.2, 1.2]], 152: [[.85, 1.1, .9]], 154: [[.85, 1.15, .9]] };
  for (const id in S) { MOTIF[id].body = S[id][0]; if (S[id][1]) MOTIF[id].head = S[id][1]; }
  // cool dragons: tall lean build, sharp eyes + brows, big wings, long horns, back spikes
  [121, 123, 125, 127, 130, 131, 132, 133, 153].forEach(id => Object.assign(MOTIF[id], { cool: true, ears: MOTIF[id].ears === 'bat' ? 'frill' : MOTIF[id].ears, horn: MOTIF[id].horn || 'dragon', body: id === 133 ? [1.2, 1.22, 1.1] : [.88, 1.28, .95], head: [.9, .86, 1.05] }));
})();
// default rapper outfit by line & stage — richer as it evolves
(() => {
  const TOPS = ['hoodie', 'tee', 'varsity', 'tracksuit', 'jersey', 'puffer', 'overalls', 'suit'], HATS = ['cap', 'capBack', 'beanie', 'bucket', 'snapback'], NECK = ['chain', 'bandana', 'phonesNeck', 'scarf', 'bowtie'];
  const COLS = ['#FF4D1A', '#2438FF', '#2B2633', '#FFC21A', '#2E9B5E', '#FF8FB1', '#B36BFF', '#56D9F5', '#FFFFFF', '#E8452C'];
  ROSTER.forEach((id, k) => { const s = BY[id], st = s.vst ?? s.stage, h = (id * 7919) % 97; const F = { top: st === 0 ? 'tee' : TOPS[h % TOPS.length], topC: COLS[(h + st) % COLS.length], shoes: st >= 1 ? 'sneakers' : null, shoeC: COLS[(h + 3) % COLS.length] };
    if (st >= 1 && h % 3 !== 0 && !MOTIF[id].horn && MOTIF[id].ears !== 'bunny') { F.hat = HATS[h % HATS.length]; F.hatC = COLS[(h + 5) % COLS.length]; }
    if (st >= 2) F.neck = NECK[h % NECK.length], F.neckC = COLS[(h + 7) % COLS.length];
    if (st >= 3 && h % 2) F.bottom = ['jogger', 'jeans', 'cargo', 'shorts'][h % 4];
    if (st >= 4) { F.neck = 'bigChain'; F.mic = h % 2 === 0; }
    if (F.top === 'hoodie' && st >= 1 && h % 4 === 1) F.hood = true;
    if (id === 146) F.glasses = 'round';
    if (MOTIF[id].cool) { delete F.hat; delete F.bottom; delete F.hood; F.top = null; if (st < 2) delete F.neck; }
    OUTFIT[id] = F; });
})();
// signature items: some species are born with their look (hood, shades, headphones…)
(() => { const H = (c, ears) => ({ top: 'hoodie', hood: true, hoodEars: ears || false, topC: c, hat: null }), SIG = {
  101: { ...H('#2B2633', 'cat'), hoodIn: '#FF8FB1' }, 102: H('#FF8FB1', 1), 103: { glasses: 'round' }, 105: { glasses: 'shades', hat: null, neck: 'bandana', neckC: '#FF4D1A' },
  106: { hat: 'phones', hatC: '#2B2633' }, 107: { glasses: 'shades', hat: null }, 108: { neck: 'scarf', neckC: '#7FD4FF' }, 110: { glasses: 'shades', hat: null, neck: 'chain' },
  111: { glasses: 'visor', hat: null }, 112: { glasses: 'star' }, 113: { glasses: 'shades', hat: null }, 114: { glasses: 'shades', back: 'cape', backC: '#C9762E', hat: null },
  121: { glasses: 'shades' }, 123: { glasses: 'visor' }, 124: { glasses: 'heart' }, 128: { glasses: 'heart', hat: null }, 129: H('#FFFFFF', 1), 131: { hat: 'crown', back: 'cape', backC: '#B0182A' },
  141: { hat: 'phones', hatC: '#FF4D1A' }, 143: { glasses: 'visor' }, 144: { glasses: 'shades', hat: null }, 145: { back: 'boombox', hat: null }, 147: H('#3D7BFF'),
  149: { glasses: 'round', hat: null }, 150: { glasses: 'shades', hat: null, ...H('#2B2633') }, 151: { back: 'cape', backC: '#FF4D1A' }, 152: { glasses: 'visor', hat: null } };
  for (const id in SIG) { const F = OUTFIT[id]; if (!F) continue; Object.assign(F, SIG[id]); if (F.hat === null) delete F.hat; if (F.hood) delete F.hat; }
})();
