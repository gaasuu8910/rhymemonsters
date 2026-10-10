/* who wears what */
const OUTFIT = {
  1: { top: 'hoodie', topC: '#FFFFFF', hood: true, neck: 'chain', shoes: 'sneakers', shoeC: '#FF8FB1' },
  2: { top: 'varsity', topC: '#E8452C', hat: 'capBack', hatC: '#2B2633', shoes: 'sneakers', shoeC: '#E8452C' },
  3: { top: 'tee', topC: '#2B2633', print: 'star', hat: 'beanie', hatC: '#FFC93D', glasses: 'round', shoes: 'sneakers', shoeC: '#FFFFFF' },
  4: { top: 'puffer', topC: '#B98CFF', glasses: 'star', neck: 'chain', shoes: 'sneakers', shoeC: '#FFFFFF' },
  5: { top: 'puffer', topC: '#2B2633', glasses: 'shades', neck: 'bigChain', shoes: 'sneakers', shoeC: '#FFC93D', mic: true },
  6: { top: 'overalls', topC: '#3D7BFF', hat: 'bucket', hatC: '#FFE066', shoes: 'sneakers', shoeC: '#FFFFFF' },
  28: { top: 'hoodie', topC: '#56D9F5', neck: 'phonesNeck', shoes: 'sneakers', shoeC: '#FFFFFF', mic: true },
  7: { top: 'hoodie', topC: '#2B2633', hood: true, glasses: 'shades', shoes: 'sneakers', shoeC: '#2B2633' },
  8: { top: 'suit', topC: '#FFFFFF', neck: 'bowtie', neckC: '#FFC93D', glasses: 'star', shoes: 'sneakers', shoeC: '#FFFFFF' },
  9: { top: 'tracksuit', topC: '#2E9B5E', hat: 'bucket', hatC: '#2B2633', neck: 'chain', shoes: 'sneakers', shoeC: '#FFFFFF' },
  10: { top: 'tee', topC: '#FF5C8A', print: 'heart', hat: 'cap', hatC: '#3D7BFF', shoes: 'sneakers', shoeC: '#FFFFFF', mic: true },
  11: { top: 'suit', topC: '#1E1A2E', neck: 'tie', neckC: '#E8452C', glasses: 'shades', shoes: 'sneakers', shoeC: '#2B2633' },
  12: { top: 'jersey', topC: '#FFC21A', num: '23', hat: 'capBack', hatC: '#E8452C', shoes: 'sneakers', shoeC: '#FFFFFF' },
  13: { top: 'puffer', topC: '#E8452C', neck: 'chain', shoes: 'sneakers', shoeC: '#FFFFFF' },
  14: { top: 'varsity', topC: '#1E1A2E', glasses: 'visor', neck: 'bigChain', shoes: 'sneakers', shoeC: '#FFE066', mic: true },
  15: { top: 'tee', topC: '#FFFFFF', print: 'moon', glasses: 'round', neck: 'bowtie', neckC: '#E8452C', shoes: 'sneakers', shoeC: '#9C7BE0' },
  16: { top: 'tee', topC: '#2B2633', print: 'star', neck: 'bandana', neckC: '#E8452C', glasses: 'shades', shoes: 'sneakers', shoeC: '#43D6A6' },
  17: { hat: 'snapback', hatC: '#FF5C8A', neck: 'bigChain', glasses: 'shades' },
  18: { top: 'hoodie', topC: '#FFC93D', hat: 'beanie', hatC: '#E8452C', neck: 'scarf', neckC: '#FFFFFF', shoes: 'sneakers', shoeC: '#2B2633' },
  19: { top: 'hoodie', topC: '#E8452C', hood: true, hoodEars: true, neck: 'chain', shoes: 'sneakers', shoeC: '#FFFFFF' },
  20: { top: 'jersey', topC: '#3D7BFF', num: '8', neck: 'phonesNeck', shoes: 'sneakers', shoeC: '#FFFFFF' },
  21: { top: 'tee', topC: '#3D7BFF', print: 'star', neck: 'bandana', neckC: '#FF5C8A', shoes: 'sneakers', shoeC: '#FFFFFF' },
  22: { top: 'tee', topC: '#FFFFFF', print: 'heart', hat: 'capBack', hatC: '#3D7BFF', neck: 'chain', shoes: 'sneakers', shoeC: '#E8452C' },
  23: { top: 'suit', topC: '#2E5E3E', neck: 'bowtie', neckC: '#FFC93D', glasses: 'round', shoes: 'sneakers', shoeC: '#FFFFFF' },
  24: { top: 'tracksuit', topC: '#E8452C', neck: 'bigChain', shoes: 'sneakers', shoeC: '#FFFFFF' },
  25: { top: 'puffer', topC: '#FFC21A', glasses: 'shades', neck: 'bigChain', shoes: 'sneakers', shoeC: '#2B2633' },
  26: { top: 'varsity', topC: '#6B4A33', neck: 'bigChain', shoes: 'sneakers', shoeC: '#FFFFFF', mic: true },
  27: { top: 'tee', topC: '#7FC45E', print: 'heart', neck: 'phonesNeck', shoes: 'sneakers', shoeC: '#FFFFFF' },
  29: { top: 'hoodie', topC: '#FFFFFF', glasses: 'star', neck: 'bigChain', shoes: 'sneakers', shoeC: '#FFC93D', mic: true },
};

// dress-up: what you bought and put on overrides each monster's default look
let WEAR = {}, WEAR_PREVIEW = null;
function outfitOf(sp) { const base = OUTFIT[sp.id], w = WEAR[sp.id], pv = WEAR_PREVIEW && rig0Sp() === sp.id ? WEAR_PREVIEW : null; if (!w && !pv) return base; const r = { ...(base || {}), ...(w || {}), ...(pv || {}) }; if ((w && w.hat) || (pv && pv.hat) || r.top !== 'hoodie') { r.hood = false; r.hoodEars = false; } return r; }
function rig0Sp() { return typeof G !== 'undefined' && G.sp ? G.sp.id : -1; }
