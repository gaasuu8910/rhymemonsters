const TALL_EARS = ['bunny', 'cat', 'fox', 'bat', 'deer', 'pony', 'mouse'];
/* =========================================================
   DRESS — builds each outfit piece with real construction details
   ========================================================= */
function dressUp(rig, o) {
  const F = outfitOf(rig.sp); if (!F) return;
  const { head, body, R, B, BR, by, ex, ey, ew, eh, st } = o, r0 = R[0];
  const preHead = new Set(head.children);
  const front = y => { const k = clamp(1 - Math.pow((y - by) / BR[1], 2), 0, 1); return BR[2] * Math.sqrt(k); };
  const ny = head.position.y - R[1] * .78, neckR = [BR[0] * .56, BR[2] * .6];
  const darkOf = c => mixHex(c, '#000000', .16), lightOf = c => mixHex(c, '#FFFFFF', .45);
  const KIND = { hoodie: 'fleece', tee: 'cotton', suit: 'suit', varsity: 'felt', puffer: 'nylon', jersey: 'mesh', tracksuit: 'nylon', overalls: 'cotton' };
  const add = (geo, mat, pos = [0, 0, 0], rot = [0, 0, 0], sc = [1, 1, 1], par = body) => { const m = new THREE.Mesh(geo, mat); m.position.set(...pos); m.rotation.set(...rot); m.scale.set(...sc); m.castShadow = true; m.receiveShadow = true; par.add(m); return m; };

  /* ---------------- TOPS ---------------- */
  if (F.top) {
    const kind = KIND[F.top], col = F.top === 'overalls' ? '#FFFFFF' : F.topC, mat = F.top === 'tracksuit' ? cloth(col, 'nylon', { rep: [6, 3] }) : cloth(col, kind);
    const t1 = F.top === 'tee' || F.top === 'jersey' ? Math.PI * .7 : Math.PI * .76;
    add(garmentGeo(0, t1, { inflate: F.top === 'puffer' ? .12 : .065, fold: F.top === 'suit' ? .012 : F.top === 'puffer' ? .01 : .03, quilt: F.top === 'puffer' ? .06 : 0, seed: rig.sp.id, flare: F.top === 'tee' ? .02 : 0 }), mat, [0, by, 0], [0, 0, 0], BR);
    // hem band
    const ribC = F.top === 'varsity' ? '#FFFFFF' : darkOf(col);
    if (['hoodie', 'varsity', 'tracksuit', 'puffer'].includes(F.top)) { add(garmentGeo(t1 - Math.PI * .07, t1 + Math.PI * .005, { inflate: F.top === 'puffer' ? .12 : .085, fold: 0 }), F.top === 'puffer' ? cloth(darkOf(col), 'nylon') : cloth(ribC, 'rib'), [0, by, 0], [0, 0, 0], BR);
      if (F.top === 'varsity') [0, 1].forEach(k => add(garmentGeo(t1 - Math.PI * (.05 - k * .02), t1 - Math.PI * (.04 - k * .02), { inflate: .095, fold: 0 }), cloth(F.topC, 'rib'), [0, by, 0], [0, 0, 0], BR)); }
    else if (F.top !== 'suit') add(garmentGeo(t1 - Math.PI * .025, t1 + Math.PI * .004, { inflate: .085, fold: 0 }), cloth(darkOf(col), kind), [0, by, 0], [0, 0, 0], BR);
    // sleeves: partial shells over the upper arms, with cuffs (paws peek out)
    rig.arms.forEach(([piv, d]) => { const a = piv.children[0]; if (!a || a.geometry !== SPH) return; const g = new THREE.Group(); g.position.copy(a.position); g.rotation.copy(a.rotation); g.scale.copy(a.scale).multiplyScalar(1.17); piv.add(g);
      const sm = F.top === 'varsity' ? cloth('#FFFFFF', 'leather') : F.top === 'tracksuit' ? cloth(col, 'nylon', { rep: [3, 2] }) : cloth(col, kind, { rep: [3, 2] }), cutT = F.top === 'tee' || F.top === 'jersey' ? Math.PI * .45 : Math.PI * .68;
      const sl = new THREE.Mesh(garmentGeo(0, cutT, { inflate: 0, fold: .05, deform: v => v, seed: d * 3 }), sm); sl.castShadow = true; g.add(sl);
      const cy = Math.cos(cutT), cr = Math.sin(cutT), cuffM = F.top === 'tee' || F.top === 'jersey' ? cloth(F.top === 'jersey' ? '#FFFFFF' : darkOf(col), kind) : cloth(F.top === 'varsity' ? F.topC : darkOf(col), F.top === 'puffer' ? 'nylon' : 'rib');
      g.add(M(new THREE.TorusGeometry(cr, .09, 10, 32), cuffM, [1, 1, 1], [0, cy, 0], [Math.PI / 2, 0, 0]));
      if (F.top === 'tracksuit') [-.06, .06].forEach(k => { const pts = []; for (let i = 0; i <= 10; i++) { const t = i / 10 * cutT * .98, ph = Math.PI / 2 * d + k; pts.push(new THREE.Vector3(Math.sin(t) * Math.cos(ph) * 1.01 * d * d, Math.cos(t), Math.sin(t) * Math.sin(ph) * .2)); } g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(d * Math.sin(Math.acos(clamp(p.y, -1, 1))) * 1.01, p.y, k * 1.5))), 20, .035, 6), cloth('#FFFFFF', 'nylon'))); });
      if (F.top === 'jersey') g.add(M(new THREE.TorusGeometry(cr * 1.01, .05, 8, 32), cloth(F.topC === '#FFFFFF' ? '#2B2633' : '#2B2633', 'mesh'), [1, 1, 1], [0, cy + .06, 0], [Math.PI / 2, 0, 0]));
    });
    const chestY = by + BR[1] * .22, chestZ = front(chestY) * 1.075 + B * .01;
    // ---- per-garment construction
    if (F.top === 'hoodie') {
      // kangaroo pocket: a bent trapezoid panel with a bevelled edge and stitched hem
      const ps = new THREE.Shape(), w = BR[0] * 1.05, h = BR[1] * .42; ps.moveTo(-w * .5, -h * .5); ps.lineTo(w * .5, -h * .5); ps.lineTo(w * .32, h * .5); ps.lineTo(-w * .32, h * .5); ps.lineTo(-w * .5, -h * .5);
      const pg = bendAround(ext(ps, B * .015, B * .012), BR[2] * 1.06), py = by - BR[1] * .2; add(pg, cloth(darkOf(F.topC), 'fleece'), [0, py, front(py) * 1.06 + B * .02], [-.08, 0, 0]);
      if (!F.hood) { const back = add(new THREE.TorusGeometry(1, .28, 14, 40, Math.PI * 1.3), cloth(F.topC, 'fleece'), [0, ny + B * .02, -B * .08], [Math.PI / 2 + .3, 0, Math.PI * .5 + Math.PI * .35], [neckR[0] * 1.15, neckR[1] * 1.3, B * .7]); }
      const logo = decalTex((x, W, H) => embroider(x, W, H, 'RHYME', mixHex(F.topC, '#000000', .55) === '#000000' ? '#FFFFFF' : (F.topC === '#FFFFFF' ? '#FF5C8A' : '#FFFFFF'), 'rgba(0,0,0,.35)', H * .7), B * .5, B * .14, { bend: BR[2] * 1.08, bump: .004 }); logo.position.set(0, chestY + B * .02, chestZ); body.add(logo);
    }
    if (F.top === 'tee') {
      add(new THREE.TorusGeometry(1, .14, 12, 40), cloth(darkOf(F.topC), 'rib'), [0, ny - B * .02, B * .02], [Math.PI / 2 + .25, 0, 0], [neckR[0], neckR[1], B * .45]);
      if (F.print) { const p = decalTex((x, W, H) => { x.save(); x.translate(W / 2, H * .44); const s = H * .3; x.fillStyle = F.print === 'heart' ? '#FF3D7F' : F.print === 'moon' ? '#FFE066' : '#FFC93D'; x.strokeStyle = '#FFFFFF'; x.lineWidth = s * .12; x.font = `${s * 2}px serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.strokeText(F.print === 'heart' ? '♥' : F.print === 'moon' ? '☾' : '★', 0, 0); x.fillText(F.print === 'heart' ? '♥' : F.print === 'moon' ? '☾' : '★', 0, 0); x.restore();
        x.font = `900 ${H * .1}px "Arial Black", Arial`; x.textAlign = 'center'; x.fillStyle = '#FFFFFF'; x.fillText('RHYME MONSTERS', W / 2, H * .88, W * .92); x.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 260; i++) { x.fillStyle = `rgba(0,0,0,${Math.random() * .5})`; x.fillRect(Math.random() * W, Math.random() * H, 2 + Math.random() * 3, 1 + Math.random() * 2); } }, B * .62, B * .62, { bend: BR[2] * 1.08, r: .85 }); p.position.set(0, chestY - B * .06, chestZ); body.add(p); }
    }
    if (F.top === 'jersey') {
      [-1, 1].forEach(d => { const pts = [new THREE.Vector3(d * neckR[0] * .95, ny + B * .02, B * .1), new THREE.Vector3(d * neckR[0] * .5, ny - B * .14, front(ny - B * .14) * 1.08), new THREE.Vector3(0, ny - B * .28, front(ny - B * .28) * 1.08)]; body.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, B * .035, 8), cloth('#2B2633', 'rib'))); });
      const p = decalTex((x, W, H) => { x.font = `900 ${H * .66}px "Arial Black", Arial`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round'; x.strokeStyle = '#2B2633'; x.lineWidth = H * .1; x.strokeText(F.num || '1', W / 2, H * .6); x.strokeStyle = '#FFFFFF'; x.lineWidth = H * .05; x.strokeText(F.num || '1', W / 2, H * .6); x.fillStyle = '#E8452C'; x.fillText(F.num || '1', W / 2, H * .6); x.font = `900 ${H * .13}px "Arial Black"`; x.fillStyle = '#2B2633'; x.fillText('MONSTERS', W / 2, H * .14); }, B * .62, B * .62, { bend: BR[2] * 1.08, bump: .006 }); p.position.set(0, chestY - B * .04, chestZ); body.add(p);
    }
    if (F.top === 'suit') {
      // shirt + collar points
      const sh = decalTex((x, W, H) => { x.fillStyle = '#FFFFFF'; x.beginPath(); x.moveTo(W * .12, 0); x.lineTo(W * .88, 0); x.lineTo(W * .5, H); x.fill(); x.strokeStyle = 'rgba(0,0,0,.08)'; for (let i = 0; i < W; i += 10) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, H); x.stroke(); } }, B * .7, B * .62, { bend: BR[2] * 1.09 }); sh.position.set(0, ny - B * .3, front(ny - B * .3) * 1.08 + B * .015); sh.rotation.x = -.32; body.add(sh);
      [-1, 1].forEach(d => { const cs = new THREE.Shape(); cs.moveTo(0, 0); cs.lineTo(d * B * .16, B * .02); cs.lineTo(d * B * .06, -B * .14); cs.lineTo(0, 0); add(ext(cs, B * .01, B * .006), pm('#FFFFFF', { r: .5, cc: .2 }), [d * B * .02, ny - B * .03, front(ny - B * .03) * 1.08 + B * .05], [-.5, 0, 0]); });
      // notched lapels, bent to the chest
      [-1, 1].forEach(d => { const L = new THREE.Shape(), k = B; const P = [[-.03, -.12], [-.34, .2], [-.31, .35], [-.22, .33], [-.25, .46], [-.09, .43], [-.06, .14]]; L.moveTo(P[0][0] * k, P[0][1] * k); P.slice(1).forEach(([a, b]) => L.lineTo(a * k, b * k)); L.lineTo(P[0][0] * k, P[0][1] * k);
        const g = bendAround(ext(L, B * .018, B * .01), BR[2] * 1.08); if (d > 0) { g.scale(-1, 1, 1); g.computeVertexNormals(); } const m = add(g, cloth(mixHex(F.topC, '#FFFFFF', .28), 'suit'), [0, ny - B * .42, front(ny - B * .2) * 1.07 + B * .02], [-.3, 0, 0]); m.material.side = THREE.DoubleSide; });
      // pocket square, breast pocket line, buttons with four holes
      const pq = new THREE.Shape(); pq.moveTo(-B * .08, 0); pq.lineTo(B * .08, 0); pq.lineTo(B * .03, B * .09); pq.lineTo(-B * .01, B * .05); pq.lineTo(-B * .05, B * .1); pq.lineTo(-B * .08, 0); add(ext(pq, B * .01, B * .004), pm(F.neckC || '#E8452C', { r: .45, cc: .4 }), [B * .33, chestY + B * .02, front(chestY) * 1.07 + B * .01], [-.2, .45, 0]);
      add(new THREE.BoxGeometry(B * .2, B * .015, B * .02), cloth(darkOf(F.topC), 'suit'), [B * .33, chestY, front(chestY) * 1.07], [-.2, .45, 0]);
      [0, 1].forEach(i => { const y = by - BR[1] * (.12 + i * .26), z = front(y) * 1.075 + B * .01, b2 = new THREE.Group(); b2.position.set(B * .02, y, z); body.add(b2); b2.add(M(new THREE.CylinderGeometry(B * .045, B * .045, B * .02, 20), pm('#2B2633', { r: .3, cc: .9 }), [1, 1, 1], [0, 0, 0], [Math.PI / 2, 0, 0])); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([u, v]) => b2.add(M(SPHL, pm('#0B0B14'), [B * .008, B * .008, B * .006], [u * B * .013, v * B * .013, B * .011]))); });
    }
    if (F.top === 'varsity') {
      // snap buttons down the front, chenille letter patch with a felt border
      for (let i = 0; i < 4; i++) { const y = ny - B * .12 - i * BR[1] * .26, z = front(y) * 1.075 + B * .008; add(new THREE.CylinderGeometry(B * .035, B * .035, B * .02, 20), metal('#E9E9F2'), [B * .03, y, z], [Math.PI / 2, 0, 0]); }
      const p = decalTex((x, W, H) => { x.font = `900 ${H * .9}px "Arial Black", Arial`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round'; x.strokeStyle = '#FFC93D'; x.lineWidth = H * .16; x.strokeText('R', W / 2, H * .56); x.strokeStyle = '#FFFFFF'; x.lineWidth = H * .08; x.strokeText('R', W / 2, H * .56); x.fillStyle = F.topC; x.fillText('R', W / 2, H * .56);
        for (let i = 0; i < 2600; i++) { x.globalCompositeOperation = 'source-atop'; x.fillStyle = `rgba(255,255,255,${Math.random() * .12})`; x.fillRect(Math.random() * W, Math.random() * H, 2, 2); } x.globalCompositeOperation = 'source-over'; }, B * .34, B * .34, { bend: BR[2] * 1.08, bump: .01, r: .95 }); p.position.set(-B * .26, chestY + B * .03, front(chestY) * 1.075 + B * .01); p.rotation.y = -.32; body.add(p);
      add(new THREE.TorusGeometry(1, .16, 12, 40), cloth('#FFFFFF', 'rib'), [0, ny, B * .02], [Math.PI / 2 + .25, 0, 0], [neckR[0], neckR[1], B * .5]);
      add(new THREE.TorusGeometry(1, .07, 10, 40), cloth(F.topC, 'rib'), [0, ny - B * .03, B * .02], [Math.PI / 2 + .25, 0, 0], [neckR[0] * 1.02, neckR[1] * 1.02, B * .5]);
    }
    if (F.top === 'puffer' || F.top === 'tracksuit') {
      // stand-up collar + zipper with a pull tab
      add(garmentGeo(0, Math.PI, { inflate: 0, fold: 0, deform: v => v }), F.top === 'puffer' ? cloth(darkOf(F.topC), 'nylon') : cloth(F.topC, 'nylon'), [0, ny + B * .02, B * .02], [0, 0, 0], [neckR[0] * 1.1, B * (F.top === 'puffer' ? .16 : .1), neckR[1] * 1.15]);
      const pts = []; for (let i = 0; i <= 14; i++) { const y = ny - B * .05 - i / 14 * (ny - (by - BR[1] * .62)); pts.push(new THREE.Vector3(0, y, front(y) * (F.top === 'puffer' ? 1.125 : 1.075) + B * .006)); }
      body.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, B * .018, 6), metal('#C9C9D6')));
      add(new THREE.BoxGeometry(B * .05, B * .1, B * .02), metal('#C9C9D6'), [B * .02, pts[2].y, pts[2].z + B * .02]);
      if (F.top === 'tracksuit') [-1, 1].forEach(d => [-.03, .03].forEach(k => { const sp = []; for (let i = 0; i <= 12; i++) { const t = i / 12, y = by + BR[1] * (.6 - t * 1.25), kk = clamp(1 - Math.pow((y - by) / (BR[1] * 1.07), 2), 0, 1); sp.push(new THREE.Vector3(d * BR[0] * 1.075 * Math.sqrt(kk) * Math.cos(k), y, BR[2] * Math.sqrt(kk) * Math.sin(k) * 1.075)); } body.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(sp), 24, B * .02, 6), cloth('#FFFFFF', 'nylon'))); }));
    }
    if (F.top === 'overalls') {
      const den = cloth(F.topC, 'denim'), bw = BR[0] * .78, bh = BR[1] * .62, bs = roundedShape(bw, bh, B * .05), bg = bendAround(ext(bs, B * .02, B * .01), BR[2] * 1.08), byy = by - BR[1] * .02;
      add(bg, den, [0, byy, front(byy) * 1.07 + B * .02], [-.12, 0, 0]);
      add(garmentGeo(Math.PI * .56, Math.PI * .8, { inflate: .1, fold: .02 }), den, [0, by, 0], [0, 0, 0], BR);
      const pk = bendAround(ext(roundedShape(bw * .42, bh * .3, B * .025), B * .012, B * .006), BR[2] * 1.1); add(pk, cloth(darkOf(F.topC), 'denim'), [0, byy + bh * .05, front(byy) * 1.07 + B * .05], [-.12, 0, 0]);
      stitch(body, [-1, -.5, 0, .5, 1].map(t => new THREE.Vector3(t * bw * .44, byy + bh * .44, front(byy + bh * .44) * 1.07 + B * .045)), '#FFC93D', B * .006);
      [-1, 1].forEach(d => { const top = byy + bh * .48, pts = [new THREE.Vector3(d * bw * .38, top, front(top) * 1.07 + B * .02), new THREE.Vector3(d * BR[0] * .46, ny + B * .06, B * .12), new THREE.Vector3(d * BR[0] * .44, ny + B * .02, -BR[2] * .55), new THREE.Vector3(d * BR[0] * .3, by - BR[1] * .1, -BR[2] * 1.08)]; body.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 30, B * .04, 8), den));
        add(new THREE.TorusGeometry(B * .045, B * .014, 8, 20), metal(), [d * bw * .38, top - B * .03, front(top) * 1.07 + B * .05], [0, 0, 0]); add(new THREE.CylinderGeometry(B * .03, B * .03, B * .015, 16), metal(), [d * bw * .38, top - B * .03, front(top) * 1.07 + B * .06], [Math.PI / 2, 0, 0]); });
    }
  }

  /* ---------------- HOOD (up): outer fleece, darker lining, ribbed rim, eyelets, sewn-on ears ---------------- */
  if (F.hood) {
    const hc = F.topC || '#FFFFFF', HR = [R[0] * 1.14, R[1] * 1.14, R[2] * 1.14], hg = hoodGeo(.92);
    add(hg, cloth(hc, 'fleece'), [0, 0, 0], [0, 0, 0], HR, head);
    const lin = add(hg, cloth(darkOf(hc), 'fleece'), [0, 0, 0], [0, 0, 0], HR.map(v => v * .975), head); lin.material = lin.material.clone(); lin.material.side = THREE.BackSide;
    const fd = new THREE.Vector3(0, -.12, 1).normalize(), ring = M(new THREE.TorusGeometry(Math.sin(.92), .042, 12, 48), cloth(hc, 'rib', { rep: [30, 1] }), HR); ring.position.copy(fd).multiplyScalar(Math.cos(.92)).multiply(new THREE.Vector3(...HR)); ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), fd); head.add(ring);
    const sew = []; for (let i = 0; i <= 20; i++) { const t = i / 20 * Math.PI * 2 * .98 - Math.PI * .49, a = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(1, 0, 0), 0); const v = new THREE.Vector3(Math.sin(t) * .02, Math.cos(t * .5) * 1.0, -Math.cos(t * .5) * .1); sew.push(new THREE.Vector3(0, Math.cos(i / 20 * Math.PI) * HR[1] * 1.005, -Math.sin(i / 20 * Math.PI) * HR[2] * 1.005)); }
    stitch(head, sew.filter(p => p.y > -HR[1] * .55), lightOf(hc), r0 * .008);
    if (F.hoodEars === 'cat') [-1, 1].forEach(d => { const g = stick(head, HR, d * .55, .78, mochi, r0 * .02); g.quaternion.setFromEuler(new THREE.Euler(-.12, 0, -d * .4)); const ef = cloth(hc, 'fleece');
      g.add(M(GEO.cone, ef, [r0 * .26, r0 * .44, r0 * .14], [0, r0 * .2, 0])); g.add(M(GEO.cone, cloth(F.hoodIn || '#FF8FB1', 'felt'), [r0 * .15, r0 * .28, r0 * .06], [0, r0 * .17, r0 * .09])); });
    else if (F.hoodEars) [-1, 1].forEach(d => { const g = stick(head, HR, d * .62, .72, mochi, r0 * .03); g.quaternion.setFromEuler(new THREE.Euler(-.1, 0, -d * .55)); g.add(M(SPH, cloth(hc, 'fleece'), [r0 * .26, r0 * .25, r0 * .15], [0, r0 * .19, 0])); g.add(M(SPH, cloth(lightOf(hc), 'felt'), [r0 * .15, r0 * .14, r0 * .07], [0, r0 * .19, r0 * .11])); });
    rig.ears.forEach(([p]) => { if (rig.motif === 'こぐま') p.visible = false; });
  }

  /* ---------------- HATS ---------------- */
  if (F.hat) {
    const hc = F.hatC || '#2B2633', back = F.hat === 'capBack';
    if (F.hat === 'cap' || back || F.hat === 'snapback') {
      const g = new THREE.Group(); g.position.set(0, R[1] * .1, 0); g.rotation.set(-.12, back ? Math.PI : 0, 0); head.add(g);
      const CR = [R[0] * 1.03, R[1] * 1.06, R[2] * 1.03], tmax = Math.PI * .4;
      add(garmentGeo(0, tmax, { inflate: .04, fold: 0, deform: mochi }), cloth(hc, 'cotton', { rep: [8, 2] }), [0, 0, 0], [0, 0, 0], CR, g);
      // six panel seams with stitching, eyelets, top button
      for (let k = 0; k < 6; k++) { const ph = k / 6 * Math.PI * 2, pts = []; for (let i = 0; i <= 12; i++) { const t = .03 + i / 12 * (tmax - .03); pts.push(new THREE.Vector3(Math.sin(t) * Math.sin(ph) * CR[0] * 1.045, Math.cos(t) * CR[1] * 1.045, Math.sin(t) * Math.cos(ph) * CR[2] * 1.045)); } g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, r0 * .012, 6), cloth(darkOf(hc), 'cotton')));
        const ph2 = ph + Math.PI / 6, te = tmax * .55; g.add(M(new THREE.TorusGeometry(r0 * .022, r0 * .007, 6, 14), pm(darkOf(darkOf(hc)), { r: .5 }), [1, 1, 1], [Math.sin(te) * Math.sin(ph2) * CR[0] * 1.045, Math.cos(te) * CR[1] * 1.045, Math.sin(te) * Math.cos(ph2) * CR[2] * 1.045], [0, ph2, 0])); }
      g.add(M(SPH, cloth(hc, 'cotton'), [r0 * .07, r0 * .035, r0 * .07], [0, CR[1] * 1.05, 0]));
      // curved brim: an extruded half-oval, bent down at the sides, with a darker underside
      const bs = new THREE.Shape(), bw = r0 * .78, bd = r0 * .8; bs.moveTo(-bw, 0); bs.bezierCurveTo(-bw, bd * .9, bw, bd * .9, bw, 0); bs.bezierCurveTo(bw * .5, bd * .18, -bw * .5, bd * .18, -bw, 0);
      const bg = ext(bs, r0 * .02, r0 * .012); bg.rotateX(Math.PI / 2); const pp = bg.attributes.position; for (let i = 0; i < pp.count; i++) { const x = pp.getX(i); pp.setY(i, pp.getY(i) - x * x / (bw * bw) * r0 * .16); } bg.computeVertexNormals();
      const ry = Math.cos(tmax) * CR[1] * 1.03, rz = Math.sin(tmax) * CR[2] * .92;
      add(bg, cloth(hc, 'cotton', { rep: [3, 2] }), [0, ry, rz * .9], [.18, 0, 0], [1, 1, 1], g);
      add(bg, cloth(darkOf(darkOf(hc)), 'cotton'), [0, ry - r0 * .012, rz * .9], [.18, 0, 0], [.97, 1, .97], g);
      for (let k = 1; k <= 3; k++) { const pts = []; for (let i = 0; i <= 16; i++) { const t = i / 16, x = (t - .5) * 2 * bw * (1 - k * .18), zz = bd * .68 * (1 - Math.pow(2 * t - 1, 2)) * (1 - k * .2) + bd * .12; pts.push(new THREE.Vector3(x, ry + r0 * .022 - x * x / (bw * bw) * r0 * .16, rz * .9 + zz)); } stitch(g, pts, lightOf(hc), r0 * .006); }
      // front embroidery / back strap
      const logo = decalTex((x, W, H) => embroider(x, W, H, F.hat === 'snapback' ? 'RM' : '★', '#FFFFFF', 'rgba(0,0,0,.3)', H * .75), r0 * .5, r0 * .3, { bend: CR[2] * 1.05, bump: .004 }); logo.position.set(0, Math.cos(tmax * .45) * CR[1] * 1.04, Math.sin(tmax * .45) * CR[2] * 1.045); logo.rotation.x = -tmax * .45; g.add(logo);
      const strap = decalTex((x, W, H) => { x.fillStyle = '#1a1a22'; x.beginPath(); x.ellipse(W / 2, H, W * .32, H * .75, 0, Math.PI, 0); x.fill(); x.fillStyle = darkOf(hc); x.fillRect(W * .2, H * .62, W * .6, H * .16); for (let i = 0; i < 6; i++) { x.fillStyle = '#fff'; x.beginPath(); x.arc(W * (.26 + i * .1), H * .7, H * .03, 0, 7); x.fill(); } }, r0 * .55, r0 * .3, { bend: CR[2] * 1.05 }); strap.position.set(0, ry + r0 * .17, -Math.sin(tmax * .8) * CR[2] * 1.02); strap.rotation.y = Math.PI; g.add(strap);
    }
    if (F.hat === 'beanie') {
      const BRh = [R[0] * 1.04, R[1] * 1.05, R[2] * 1.04];
      add(garmentGeo(0, Math.PI * .46, { inflate: .06, fold: .03, deform: v => { mochi(v); if (v.y > .15) { const k = v.y - .15; v.y += k * .55; v.z -= k * k * .55; v.x *= 1 - k * .12; } } }), cloth(hc, 'knit', { rep: [16, 3] }), [0, R[1] * .1, 0], [0, 0, 0], BRh, head);
      add(garmentGeo(Math.PI * .35, Math.PI * .49, { inflate: .085, fold: 0, deform: mochi }), cloth(darkOf(hc), 'rib', { rep: [40, 1] }), [0, R[1] * .1, 0], [0, 0, 0], BRh, head);
      const tag = decalTex((x, W, H) => { x.fillStyle = '#2B2633'; x.fillRect(0, 0, W, H); x.strokeStyle = '#FFC93D'; x.lineWidth = 8; x.strokeRect(10, 10, W - 20, H - 20); x.fillStyle = '#FFFFFF'; x.font = `900 ${H * .5}px "Arial Black"`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('RHYME', W / 2, H / 2); }, r0 * .34, r0 * .12, { bend: R[2] * 1.2, cc: .3 }); tag.position.set(0, R[1] * .26, R[2] * 1.13); tag.rotation.x = -.15; head.add(tag);
      const pom = new THREE.Group(); pom.position.set(0, R[1] * 1.5, -R[2] * .5); head.add(pom); const pf = cloth(lightOf(hc), 'felt', { bump: .03 });
      pom.add(M(SPH, pf, [r0 * .17, r0 * .17, r0 * .17])); for (let i = 0; i < 36; i++) { const u = Math.random() * 2 - 1, a = Math.random() * 7, rr = Math.sqrt(1 - u * u); pom.add(M(SPHL, pf, [r0 * .07, r0 * .07, r0 * .07], [Math.cos(a) * rr * r0 * .16, u * r0 * .16, Math.sin(a) * rr * r0 * .16])); }
      rig.floaters.push(pom);
    }
    if (F.hat === 'bucket') {
      const BRh = [R[0] * 1.05, R[1] * 1.06, R[2] * 1.05], tm = Math.PI * .37;
      add(garmentGeo(0, tm, { inflate: .05, fold: 0, deform: v => { mochi(v); if (v.y > .75) v.y = .75 + (v.y - .75) * .35; } }), cloth(hc, 'cotton', { rep: [8, 2] }), [0, R[1] * .12, 0], [0, 0, 0], BRh, head);
      const by2 = R[1] * .12 + Math.cos(tm) * BRh[1] * 1.0, br = Math.sin(tm) * BRh[0] * 1.04;
      const brim = add(new THREE.CylinderGeometry(br, br * 1.5, r0 * .3, 64, 1, true), cloth(hc, 'cotton', { rep: [12, 1], ds: true }), [0, by2 - r0 * .12, 0], [0, 0, 0], [1, 1, R[2] / R[0]], head);
      add(new THREE.CylinderGeometry(br * 1.005, br * 1.005, r0 * .07, 64, 1, true), cloth(darkOf(hc), 'cotton', { ds: true }), [0, by2 + r0 * .02, 0], [0, 0, 0], [1, 1, R[2] / R[0]], head);
      [.3, .6, .9].forEach(t => add(new THREE.TorusGeometry(br * (1 + .5 * t), r0 * .006, 4, 64), pm(lightOf(hc), { r: .7 }), [0, by2 - r0 * .12 + r0 * .15 - t * r0 * .3, 0], [Math.PI / 2, 0, 0], [1, R[2] / R[0], 1], head));
    }
    rig.ears.forEach(([p]) => { if (F.hat !== 'beanie') p.scale.setScalar(.85); });
  }

  /* ---------------- EYEWEAR: framed lenses, bridge, temples back to the ears ---------------- */
  if (F.glasses) {
    const type = F.glasses, pts = [-1, 1].map(d => surf(R, d * ex, ey, mochi));
    const frameM = type === 'round' ? metal() : type === 'star' ? pm('#FFE066', { r: .25, cc: .9 }) : type === 'heart' ? pm('#FF8FB1', { r: .2, cc: 1 }) : pm('#15121F', { r: .22, cc: 1, ccr: .05 });
    const lensM = type === 'heart' ? pm('#FF2E7E', { r: .05, cc: 1, op: .72, env: 1.4 }) : type === 'round' ? pm('#BFE6FF', { r: .05, cc: 1, op: .22, env: 1.5 }) : type === 'star' ? pm('#FF5C8A', { r: .05, cc: 1, op: .65, env: 1.2 }) : pm('#120E20', { r: .02, cc: 1, ccr: .01, op: .97, env: 2.4, m: .45 });
    if (type === 'visor') {
      const v = add(new THREE.CylinderGeometry(1, 1, eh * 1.6, 64, 1, true, -1.05, 2.1), pm('#6A5CFF', { m: .65, r: .08, cc: 1, ds: true, env: 2, op: .9 }), [0, (pts[0].p.y + pts[1].p.y) / 2, 0], [0, 0, 0], [R[0] * 1.12, 1, R[2] * 1.16], head);
      add(new THREE.TorusGeometry(1, .012, 6, 64, 2.2), metal('#E9E9F2'), [0, (pts[0].p.y + pts[1].p.y) / 2 + eh * .8, 0], [Math.PI / 2, 0, Math.PI / 2 - 1.1], [R[0] * 1.125, R[2] * 1.165, 1], head);
    } else {
      const w = ew * 1.15, h = eh * (type === 'shades' ? .82 : 1);
      pts.forEach(({ p, n }, i) => { const d = i ? 1 : -1, g = new THREE.Group(); g.position.copy(p).addScaledVector(n, ew * .42); g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n); head.add(g);
        let outer, inner;
        if (type === 'round') { outer = new THREE.Shape(); outer.absellipse(0, 0, w, w, 0, Math.PI * 2); inner = new THREE.Path(); inner.absellipse(0, 0, w * .86, w * .86, 0, Math.PI * 2); }
        else if (type === 'heart') { outer = new THREE.Shape(); const s2 = w * 1.2; outer.moveTo(0, -s2 * .85); outer.bezierCurveTo(s2 * .9, -s2 * .2, s2 * 1.05, s2 * .65, s2 * .5, s2 * .75); outer.bezierCurveTo(s2 * .2, s2 * .8, 0, s2 * .55, 0, s2 * .35); outer.bezierCurveTo(0, s2 * .55, -s2 * .2, s2 * .8, -s2 * .5, s2 * .75); outer.bezierCurveTo(-s2 * 1.05, s2 * .65, -s2 * .9, -s2 * .2, 0, -s2 * .85); inner = null; }
        else if (type === 'star') { outer = new THREE.Shape(); for (let k = 0; k <= 10; k++) { const a = Math.PI / 2 + k * Math.PI / 5, rr = (k % 2 ? .5 : 1) * w * 1.25; k ? outer.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : outer.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); } inner = null; }
        else { outer = new THREE.Shape(); const W = w, H = h; outer.moveTo(-W, H * .7); outer.quadraticCurveTo(-W, H, -W * .7, H); outer.lineTo(W * .8, H); outer.quadraticCurveTo(W * 1.05, H, W, H * .6); outer.quadraticCurveTo(W * .9, -H * 1.05, 0, -H * .95); outer.quadraticCurveTo(-W * 1.0, -H * .9, -W, H * .7); if (d < 0) { /* mirror */ } inner = new THREE.Path(); inner.moveTo(-W * .86, H * .62); inner.quadraticCurveTo(-W * .86, H * .84, -W * .62, H * .84); inner.lineTo(W * .74, H * .84); inner.quadraticCurveTo(W * .9, H * .84, W * .86, H * .52); inner.quadraticCurveTo(W * .76, -H * .88, 0, -H * .8); inner.quadraticCurveTo(-W * .86, -H * .76, -W * .86, H * .62); }
        if (inner) outer.holes.push(inner);
        const fg = ext(outer, ew * .12, ew * .04); if (type === 'shades' && d > 0) { fg.scale(-1, 1, 1); fg.computeVertexNormals(); } const fm = new THREE.Mesh(fg, frameM); fm.castShadow = true; g.add(fm);
        const lg = new THREE.ShapeGeometry(type === 'star' || type === 'heart' ? outer : (() => { const s = new THREE.Shape(); s.curves = inner.curves; return s; })(), 24); if (type === 'shades' && d > 0) lg.scale(-1, 1, 1); lensM.side = THREE.DoubleSide; const lm = new THREE.Mesh(lg, lensM); lm.position.z = ew * .02; lm.renderOrder = 2; g.add(lm);
        if (type === 'shades') { const glint = new THREE.Mesh(new THREE.PlaneGeometry(w * .5, h * .14), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .55 })); glint.position.set(-w * .2 * d, h * .4, ew * .09); glint.rotation.z = .5 * d; g.add(glint); }
        // temple arm back toward the ear
        const side = surf(R, d * 1.45, ey + .05, mochi).p, start = new THREE.Vector3(d * w * .95, h * .3, 0).applyQuaternion(g.quaternion).add(g.position);
        head.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([start, start.clone().lerp(side, .5).multiplyScalar(1.04), side.clone().multiplyScalar(1.02)]), 12, ew * .05, 6), frameM));
      });
      const a = pts[0].p.clone().addScaledVector(pts[0].n, ew * .42), b = pts[1].p.clone().addScaledVector(pts[1].n, ew * .42), mid = a.clone().add(b).multiplyScalar(.5).add(new THREE.Vector3(0, eh * .3, ew * .12));
      head.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([a.clone().add(new THREE.Vector3(w * .7, eh * .3, 0)), mid, b.clone().add(new THREE.Vector3(-w * .7, eh * .3, 0))]), 12, ew * .06, 6), frameM));
    }
    rig.glasses = true;
  }

  /* ---------------- NECKWEAR ---------------- */
  if (F.neck === 'chain' || F.neck === 'bigChain' || F.neck === 'bossChain') {
    const big = F.neck !== 'chain', gold = metal(), n = big ? 44 : 34, rx = neckR[0] * 1.08, rz = neckR[1] * 1.12, sag = B * (big ? .3 : .2), lr = B * (big ? .045 : .03);
    const pos = a => new THREE.Vector3(Math.sin(a) * rx, ny - (Math.cos(a) * .5 + .5) * sag - B * .02, Math.cos(a) * rz + B * .04);
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, p = pos(a), q = pos(a + .01).sub(p).normalize(), m = M(new THREE.TorusGeometry(lr, lr * .38, 8, 14), gold); m.position.copy(p); m.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), q); m.rotateX(i % 2 ? Math.PI / 2 : 0); body.add(m); }
    const pp = pos(0), pz = Math.max(front(pp.y - B * .12) * 1.1, pp.z) + B * .03, py = pp.y - B * (big ? .17 : .12);
    if (big) { add(ext((() => { const s = new THREE.Shape(); for (let k = 0; k <= 10; k++) { const a = Math.PI / 2 + k * Math.PI / 5, rr = (k % 2 ? .45 : 1) * B * .17; k ? s.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : s.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); } return s; })(), B * .04, B * .02), gold, [0, py, pz]); add(GEO.octa, pm('#FF5C8A', { r: .05, cc: 1, e: '#FF5C8A', ei: .5, env: 1.5 }), [0, py, pz + B * .04], [0, 0, 0], [B * .05, B * .07, B * .03]); add(new THREE.TorusGeometry(B * .025, B * .008, 6, 12), gold, [0, py + B * .17, pz - B * .01]); }
    else { add(new THREE.CylinderGeometry(B * .1, B * .1, B * .03, 32), gold, [0, py, pz], [Math.PI / 2, 0, 0]); const m = decalTex((x, W, H) => { x.fillStyle = '#B8860B'; x.font = `900 ${H * .7}px "Arial Black"`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('R', W / 2, H * .55); }, B * .14, B * .14, { cc: 1, r: .2 }); m.position.set(0, py, pz + B * .017); body.add(m); }
  }
  if (F.neck === 'tie' || F.top === 'suit' && F.neck === 'tie') {
    const tc = F.neckC || '#E8452C', tex = decalTex((x, W, H) => { x.fillStyle = tc; x.fillRect(0, 0, W, H); x.strokeStyle = mixHex(tc, '#000000', .3); x.lineWidth = W * .07; for (let i = -H; i < H * 2; i += W * .32) { x.beginPath(); x.moveTo(0, i); x.lineTo(W, i + W * .7); x.stroke(); } }, 1, 1).material.map;
    const tm = new THREE.MeshPhysicalMaterial({ map: tex, roughness: .4, clearcoat: .5, sheen: new THREE.Color(.3, .3, .3) }), y0 = ny - B * .08, z0 = front(y0) * 1.09 + B * .04;
    add(SPH, tm, [0, y0, z0], [0, 0, 0], [B * .07, B * .055, B * .05]);
    const ts = new THREE.Shape(); ts.moveTo(-B * .04, 0); ts.lineTo(B * .04, 0); ts.lineTo(B * .1, -B * .42); ts.lineTo(0, -B * .52); ts.lineTo(-B * .1, -B * .42); ts.lineTo(-B * .04, 0);
    const tg = bendAround(ext(ts, B * .015, B * .008), BR[2] * 1.1); add(tg, tm, [0, y0 - B * .03, front(y0 - B * .3) * 1.09 + B * .03], [-.28, 0, 0]);
  }
  if (F.neck === 'bowtie') { const tc = F.neckC || '#E8452C', bm = cloth(tc, 'cotton', { rep: [2, 1] }), y = ny - B * .04, z = front(y) * 1.06 + B * .09; [-1, 1].forEach(d => { const g = new THREE.SphereGeometry(1, 24, 16), p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i); const pinch = .35 + .65 * Math.abs(x); p.setY(i, p.getY(i) * pinch); p.setZ(i, p.getZ(i) * pinch); } g.computeVertexNormals(); add(g, bm, [d * B * .11, y, z], [0, 0, 0], [B * .12, B * .1, B * .06]); }); add(SPH, cloth(darkOf(tc), 'cotton'), [0, y, z + B * .01], [0, 0, 0], [B * .045, B * .055, B * .045]); }
  if (F.neck === 'bandana') { const tc = F.neckC || '#E8452C', tex = decalTex((x, W, H) => { x.fillStyle = tc; x.fillRect(0, 0, W, H); x.strokeStyle = '#FFFFFF'; x.fillStyle = '#FFFFFF'; x.lineWidth = 5; for (let i = 0; i < 26; i++) { const px = Math.random() * W, py = Math.random() * H; x.beginPath(); x.arc(px, py, 10, 0, Math.PI * 1.4); x.stroke(); x.beginPath(); x.arc(px + 18, py + 10, 4, 0, 7); x.fill(); } x.strokeRect(12, 12, W - 24, H - 24); }, 1, 1).material.map;
    const bm = new THREE.MeshPhysicalMaterial({ map: tex, roughness: .85, side: THREE.DoubleSide, sheen: new THREE.Color(.3, .3, .3) }), tri = new THREE.Shape(); tri.moveTo(-BR[0] * .55, 0); tri.lineTo(BR[0] * .55, 0); tri.quadraticCurveTo(B * .1, -B * .25, 0, -B * .42); tri.quadraticCurveTo(-B * .1, -B * .25, -BR[0] * .55, 0);
    const g = new THREE.ShapeGeometry(tri, 16); bendAround(g, BR[2] * .9); const uv = g.attributes.uv; add(g, bm, [0, ny + B * .02, front(ny - B * .2) * 1.08 + B * .03], [-.35, 0, 0]);
    add(new THREE.TorusGeometry(1, .12, 10, 40), bm, [0, ny, B * .03], [Math.PI / 2 + .25, 0, 0], [neckR[0] * 1.05, neckR[1] * 1.08, B * .5]); }
  if (F.neck === 'scarf') { const sm = cloth(F.neckC || '#FFFFFF', 'knit', { rep: [12, 2] }); add(new THREE.TorusGeometry(1, .22, 14, 40), sm, [0, ny, B * .03], [Math.PI / 2 + .15, 0, 0], [neckR[0] * 1.08, neckR[1] * 1.1, B * .6]);
    const tail = add(new THREE.BoxGeometry(B * .2, B * .45, B * .06, 2, 6, 1), sm, [B * .22, ny - B * .32, front(ny - B * .32) * 1.08 + B * .04], [-.2, 0, .12]); for (let i = 0; i < 6; i++) add(new THREE.CylinderGeometry(B * .01, B * .01, B * .08, 4), sm, [B * (.14 + i * .03), ny - B * .6, front(ny - B * .6) * 1.08 + B * .06], [0, 0, .12]); }
  if (F.neck === 'phonesNeck') {
    const band = pm('#2B2633', { r: .3, cc: .9 }), cupC = F.topC ? lightOf(F.topC) : '#FF5C8A', y = ny + B * .03;
    body.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([-1, -.6, 0, .6, 1].map(t => new THREE.Vector3(t * neckR[0] * 1.15, y - (1 - t * t) * B * .02, -Math.sqrt(1 - t * t) * neckR[1] * 1.15 + B * .02))), 30, B * .035, 8), band));
    [-1, 1].forEach(d => { const g = new THREE.Group(); g.position.set(d * neckR[0] * 1.15, y - B * .02, B * .12); g.rotation.set(-.5, d * .5, 0); body.add(g);
      g.add(M(new THREE.CylinderGeometry(B * .17, B * .17, B * .1, 32), pm(cupC, { r: .25, cc: 1 }), [1, 1, 1], [0, 0, 0], [0, 0, Math.PI / 2])); g.add(M(new THREE.TorusGeometry(B * .13, B * .045, 10, 28), pm('#1a1a22', { r: .6, cc: .2 }), [1, 1, 1], [-d * B * .06, 0, 0], [0, Math.PI / 2, 0])); g.add(M(new THREE.CylinderGeometry(B * .08, B * .08, B * .02, 24), metal('#E9E9F2'), [1, 1, 1], [d * B * .055, 0, 0], [0, 0, Math.PI / 2])); });
  }

  /* ---------------- SNEAKERS: upper, toe cap, thick midsole, gum outsole, side stripe, crossed laces, heel tab ---------------- */
  if (F.shoes === 'sneakers' && o.feet) o.feet.forEach(([x, z]) => {
    const g = new THREE.Group(), d = Math.sign(x) || 1; g.position.set(x, 0, z - B * .02); body.add(g);
    const sc = F.shoeC || '#FF5C8A', up = cloth('#FFFFFF', 'leather', { rep: [2, 1] }), acc = pm(sc, { r: .35, cc: .7 });
    const foot = new THREE.Shape(), L = B * .5, W = B * .3; foot.moveTo(0, -L * .55); foot.bezierCurveTo(W * .7, -L * .55, W * .62, L * .1, W * .55, L * .3); foot.bezierCurveTo(W * .5, L * .62, -W * .5, L * .62, -W * .55, L * .3); foot.bezierCurveTo(-W * .62, L * .1, -W * .7, -L * .55, 0, -L * .55);
    const mid = ext(foot, B * .07, B * .025); mid.rotateX(Math.PI / 2); add(mid, pm('#F7F4EC', { r: .55, cc: .2 }), [0, B * .055, 0], [0, 0, 0], [1, 1, 1], g);
    const out = ext(foot, B * .02, B * .01); out.rotateX(Math.PI / 2); add(out, pm(d > 0 ? '#3B3346' : '#3B3346', { r: .8 }), [0, B * .012, 0], [0, 0, 0], [1.04, 1, 1.04], g);
    add(SPH, up, [0, B * .17, -B * .03], [0, 0, 0], [W * .9, B * .14, L * .58], g); add(SPH, cloth('#FFFFFF', 'leather'), [0, B * .14, L * .3], [0, 0, 0], [W * .78, B * .1, L * .3], g);
    add(new THREE.TorusGeometry(B * .12, B * .035, 10, 24), pm('#2B2633', { r: .6 }), [0, B * .3, -B * .1], [Math.PI / 2 - .3, 0, 0], [1, 1.1, 1], g);
    add(GEO.drop, cloth(sc, 'mesh'), [0, B * .29, B * .02], [-1.2, 0, 0], [B * .07, B * .13, B * .04], g);
    for (let i = 0; i < 3; i++) [-1, 1].forEach(s => add(new THREE.CylinderGeometry(B * .011, B * .011, B * .17, 5), pm('#FFFFFF', { r: .6 }), [0, B * (.27 - i * .028), B * (.03 + i * .075)], [-.35, 0, s * .7 + Math.PI / 2], [1, 1, 1], g));
    const sw = new THREE.Shape(); sw.moveTo(-L * .35, -B * .02); sw.quadraticCurveTo(L * .05, -B * .06, L * .32, B * .06); sw.quadraticCurveTo(L * .02, B * .0, -L * .3, B * .03); sw.lineTo(-L * .35, -B * .02);
    [-1, 1].forEach(s => { const m = add(ext(sw, B * .008, B * .004), acc, [s * W * .86, B * .15, 0], [0, s * Math.PI / 2, 0], [1, 1, 1], g); });
    add(new THREE.BoxGeometry(B * .08, B * .1, B * .02), acc, [0, B * .2, -L * .52], [-.15, 0, 0], [1, 1, 1], g);
  });

  /* ---------------- MIC: grip rings, mesh grille, gold band ---------------- */
  if (F.mic) { const arm = rig.arms.find(([, d]) => d > 0); if (arm) { const [piv] = arm, a = piv.children[0]; const g = new THREE.Group(); g.position.set(a.position.x * 1.5, a.position.y * 1.75, B * .15); g.rotation.set(-.6, 0, .4); piv.add(g);
    g.add(M(new THREE.CylinderGeometry(B * .05, B * .032, B * .42, 20), pm('#1E1A2E', { r: .3, cc: .9 }))); for (let i = 0; i < 4; i++) g.add(M(new THREE.TorusGeometry(B * .046 - i * .004, B * .006, 6, 18), pm('#3B3346', { r: .5 }), [1, 1, 1], [0, -B * (.05 + i * .04), 0], [Math.PI / 2, 0, 0]));
    g.add(M(new THREE.CylinderGeometry(B * .062, B * .05, B * .05, 20), metal(), [1, 1, 1], [0, B * .22, 0])); g.add(M(new THREE.SphereGeometry(1, 24, 16, 0, Math.PI * 2, 0, Math.PI * .6), cloth('#D6D6E0', 'mesh', { rep: [4, 2] }), [B * .1, B * .11, B * .1], [0, B * .25, 0])); g.add(M(SPHL, pm('#2B2633', { r: .5 }), [B * .085, B * .02, B * .085], [0, B * .245, 0])); } }

  /* ---------------- STATEMENT PIECES: big, readable silhouettes ---------------- */
  const hc2 = F.hatC || '#FFC21A', top = R[1] * .92;
  if (F.hat === 'crown') { const g = new THREE.Group(); g.position.set(0, top, 0); g.rotation.x = -.08; head.add(g); const gold = metal('#FFC93D'), cw = r0 * .58;
    g.add(M(new THREE.CylinderGeometry(cw, cw * .92, r0 * .2, 40, 1, true), gold, [1, 1, 1], [0, r0 * .06, 0]));
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; g.add(M(new THREE.ConeGeometry(r0 * .1, r0 * .3, 12), gold, [1, 1, 1], [Math.sin(a) * cw, r0 * .3, Math.cos(a) * cw])); g.add(M(SPHL, metal('#FFFFFF'), [r0 * .045, r0 * .045, r0 * .045], [Math.sin(a) * cw, r0 * .47, Math.cos(a) * cw])); }
    [['#FF2E4D', 0], ['#3D7BFF', Math.PI / 2], ['#2ED16B', -Math.PI / 2], ['#B36BFF', Math.PI]].forEach(([c, a]) => g.add(M(SPHL, pm(c, { r: .05, cc: 1, e: c, ei: .3, env: 2 }), [r0 * .07, r0 * .07, r0 * .04], [Math.sin(a) * cw * 1.02, r0 * .06, Math.cos(a) * cw * 1.02]))); rig.floaters.push(g); }
  if (F.hat === 'afro') { const g = new THREE.Group(); g.position.set(0, R[1] * .35, -R[2] * .1); head.add(g); const hm = cloth(F.hatC || '#2B2633', 'fleece', { bump: .05 });
    for (let i = 0; i < 46; i++) { const u = Math.random(), v = Math.random() * .8, th = u * Math.PI * 2, ph = Math.acos(1 - v * 1.4), rr = r0 * (1.15 + Math.random() * .12); const x = Math.sin(ph) * Math.cos(th) * rr * 1.08, y = Math.cos(ph) * rr * .95, z = Math.sin(ph) * Math.sin(th) * rr; if (z > r0 * .55 && y < r0 * .5) continue; g.add(M(SPHL, hm, [r0 * .32, r0 * .32, r0 * .32], [x, y, z])); }
    g.add(M(new THREE.BoxGeometry(r0 * .08, r0 * .5, r0 * .03), pm('#FF4D1A', { r: .3, cc: 1 }), [1, 1, 1], [r0 * .5, r0 * 1.05, r0 * .4], [0, 0, -.4])); }
  if (F.hat === 'phones') { const band = pm('#1E1A2E', { r: .3, cc: 1 }), cupM = pm(hc2, { r: .2, cc: 1, ccr: .08 }), pad = pm('#F3EFE6', { r: .8, sh: '#FFFFFF' });
    head.add(M(new THREE.TorusGeometry(1, .07, 12, 64, Math.PI), band, [R[0] * 1.08, R[1] * 1.1, 1], [0, R[1] * .02, 0]));
    [-1, 1].forEach(d => { const g = new THREE.Group(); g.position.set(d * R[0] * 1.06, R[1] * .02, 0); g.rotation.z = d * Math.PI / 2; head.add(g);
      g.add(M(new THREE.CylinderGeometry(r0 * .34, r0 * .36, r0 * .22, 32), cupM)); g.add(M(new THREE.TorusGeometry(r0 * .27, r0 * .08, 10, 32), pad, [1, 1, 1], [0, r0 * .12, 0], [Math.PI / 2, 0, 0]));
      g.add(M(new THREE.CylinderGeometry(r0 * .2, r0 * .2, r0 * .03, 24), pm('#FFFFFF', { e: hc2, ei: .6, cc: 1 }), [1, 1, 1], [0, -r0 * .125, 0])); }); }
  if (F.hat === 'party') { const g = new THREE.Group(); g.position.set(r0 * .2, top, 0); g.rotation.z = -.22; head.add(g);
    const tex = decalTex((x, W, H) => { for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#FFFFFF' : hc2; x.fillRect(0, i * H / 8, W, H / 8); } x.fillStyle = '#FF4D8D'; for (let i = 0; i < 18; i++) { x.beginPath(); x.arc(Math.random() * W, Math.random() * H, 6, 0, 7); x.fill(); } }, 1, 1);
    const mt = tex.material ? tex.material.map : null, cm = mt ? new THREE.MeshPhysicalMaterial({ map: mt, roughness: .4, clearcoat: .6 }) : pm(hc2);
    g.add(M(new THREE.ConeGeometry(r0 * .34, r0 * 1.0, 32, 1, true), cm, [1, 1, 1], [0, r0 * .5, 0])); g.add(M(SPHL, cloth('#FFFFFF', 'felt'), [r0 * .13, r0 * .13, r0 * .13], [0, r0 * 1.02, 0])); g.add(M(new THREE.TorusGeometry(r0 * .34, r0 * .05, 8, 32), cloth('#FF4D8D', 'felt'), [1, 1, 1], [0, 0, 0], [Math.PI / 2, 0, 0])); }
  if (F.back === 'cape') { const cm = cloth(F.backC || '#7B2BFF', 'suit', { ds: true }), w = BR[0] * 1.5, h = BR[1] * 2.1;
    const geo = new THREE.PlaneGeometry(w, h, 16, 16), pos = geo.attributes.position; for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), y = pos.getY(i), t = (h / 2 - y) / h; pos.setX(i, x * (.55 + t * .65)); pos.setZ(i, -Math.cos(x / w * Math.PI) * w * .35 * (.4 + t) + Math.sin(x * 9 + t * 4) * w * .03); } geo.computeVertexNormals();
    const cm2 = cm.clone(); cm2.side = THREE.DoubleSide; const cape = new THREE.Mesh(geo, cm2); cape.position.set(0, ny - h / 2 + B * .06, -BR[2] * 1.18); cape.rotation.x = .12; cape.castShadow = true; body.add(cape);
    body.add(M(new THREE.TorusGeometry(neckR[0] * 1.05, B * .05, 10, 36, Math.PI), cloth('#FFC21A', 'felt'), [1, neckR[1] / neckR[0], 1], [0, ny + B * .02, 0], [Math.PI / 2, 0, Math.PI])); rig.cape = cape; }
  if (F.back === 'wings') { const fm = pm('#FFFFFF', { r: .5, sh: '#FFFFFF', rim: '#BFE6FF', rimK: .4 });
    [-1, 1].forEach(d => { const g = new THREE.Group(); g.position.set(d * BR[0] * .4, by + BR[1] * .95, -BR[2] * 1.1); g.rotation.set(.2, -d * .5, d * .25); body.add(g);
      for (let i = 0; i < 6; i++) g.add(M(SPH, fm, [B * (.62 - i * .05), B * .16, B * .07], [d * B * (.42 + i * .22), B * (.55 - i * .2), 0], [0, 0, d * (.45 + i * .16)]));
      rig.wings.push([g, -d]); g.userData.base = .25; }); }
  if (F.back === 'boombox') { const g = new THREE.Group(); g.position.set(0, by + BR[1] * .1, -BR[2] * 1.32); body.add(g); const bw = BR[0] * 1.3, bh = BR[1] * .8;
    g.add(M(new THREE.BoxGeometry(bw, bh, B * .35), pm(F.backC || '#3D7BFF', { r: .25, cc: 1 }))); [-1, 1].forEach(d => { g.add(M(new THREE.CylinderGeometry(bh * .3, bh * .3, B * .06, 28), pm('#1E1A2E', { r: .4 }), [1, 1, 1], [d * bw * .27, -bh * .05, -B * .2], [Math.PI / 2, 0, 0])); g.add(M(new THREE.CylinderGeometry(bh * .12, bh * .12, B * .07, 20), metal(), [1, 1, 1], [d * bw * .27, -bh * .05, -B * .22], [Math.PI / 2, 0, 0])); });
    g.add(M(new THREE.BoxGeometry(bw * .3, bh * .2, B * .06), pm('#56F5D9', { e: '#56F5D9', ei: .8 }), [1, 1, 1], [0, bh * .2, -B * .2])); g.add(M(new THREE.TorusGeometry(bw * .3, B * .04, 8, 24, Math.PI), metal('#C9C9D6'), [1, 1, 1], [0, bh * .5, 0])); rig.boombox = g; }

  /* ---------------- BOTTOMS: a shell over the lower body with a waistband ---------------- */
  if (F.bottom) {
    const kind = F.bottom, col = F.bottomC || { shorts: '#3D7BFF', jogger: '#2B2633', jeans: '#3E5FA8', cargo: '#6B7A4A', gold: '#FFC21A' }[kind] || '#3D7BFF';
    const fab = kind === 'jeans' ? 'denim' : kind === 'jogger' ? 'fleece' : kind === 'gold' ? 'satin' : 'cotton';
    const mat = kind === 'gold' ? metal('#FFC93D') : cloth(col, fab, { rep: [5, 2] });
    const t0 = Math.PI * .62, t1 = kind === 'shorts' ? Math.PI * .86 : Math.PI * .97;
    add(garmentGeo(t0, t1, { inflate: .085, fold: .025, seed: rig.sp.id + 3 }), mat, [0, by, 0], [0, 0, 0], BR);
    add(garmentGeo(t0 - Math.PI * .015, t0 + Math.PI * .045, { inflate: .1, fold: 0 }), cloth(kind === 'gold' ? '#2B2633' : mixHex(col, '#000000', .3), 'rib'), [0, by, 0], [0, 0, 0], BR);
    if (kind === 'cargo') [-1, 1].forEach(d => { const y = by - BR[1] * .45; add(new THREE.BoxGeometry(BR[0] * .3, BR[1] * .26, B * .08), cloth(mixHex(col, '#000000', .15), 'cotton'), [d * BR[0] * .78, y, BR[2] * .38], [0, d * .9, 0]); });
    if (kind === 'jogger') [-1, 1].forEach(d => { const pts = []; for (let i = 0; i <= 10; i++) { const t = t0 + (t1 - t0) * i / 10; pts.push(new THREE.Vector3(d * Math.sin(t) * BR[0] * 1.09, by + Math.cos(t) * BR[1] * 1.09, 0)); } body.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, B * .022, 6), cloth('#FFFFFF', 'nylon'))); });
    if (kind === 'jeans') stitch(body, Array.from({ length: 17 }, (_, i) => { const a = i / 16 * Math.PI * 2; return new THREE.Vector3(Math.sin(a) * Math.sin(t0 + .08) * BR[0] * 1.1, by + Math.cos(t0 + .08) * BR[1] * 1.1, Math.cos(a) * Math.sin(t0 + .08) * BR[2] * 1.1); }), '#FFC93D', B * .008);
  }
  /* ---------------- SHOE STYLES: high tops get a tall collar, gold kicks go metallic ---------------- */
  if (F.shoes === 'sneakers' && o.feet && F.shoeStyle && F.shoeStyle !== 'sneakers') o.feet.forEach(([x, z]) => {
    if (F.shoeStyle === 'hightop') add(new THREE.CylinderGeometry(B * .17, B * .19, B * .2, 20, 1, true), cloth(F.shoeC || '#E8452C', 'leather', { ds: true }), [x, B * .36, z - B * .1]);
    if (F.shoeStyle === 'goldkicks') add(SPH, metal('#FFC93D'), [x, B * .2, z - B * .02], [0, 0, 0], [B * .29, B * .16, B * .34]);
  });
  /* ---------------- HATS never let hair, tufts or crests poke through ---------------- */
  if ((F.hat && F.hat !== 'phones') || F.hood) head.children.forEach(c => { if (!preHead.has(c)) return; const p = c.position; if (p.y > R[1] * .42 && Math.abs(p.x) < R[0] * .74 && !rig.eyes.some(e => e.parent === c) && !(F.hat && !F.hood && TALL_EARS.includes(MOTIF[rig.sp.id]?.ears) && rig.ears.some(([q]) => q.parent === c))) c.visible = false; });
}
