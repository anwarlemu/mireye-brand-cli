// Filled-outline finishing. Every visible line becomes a filled band, so each end can be cut along any
// line: a line that runs into another stops exactly on that line's edge, corners meet in one mitred point,
// lines that touch tangentially continue flush, and ends that stop just short of a line are carried onto it.
function toFills(R, so) {
  so = so || {};
  const TONES = ['lit', 'hi', 'mid', 'lo', 'faint'], WTS = ['E', 'D', 'F'];
  const S = so.S, pad = so.pad == null ? 20 : so.pad; const [X0, Y0, X1, Y1] = R.bounds;
  const W = Math.ceil((X1 - X0) * S + 2 * pad), H = Math.ceil((Y1 - Y0) * S + 2 * pad), ox = -X0 * S + pad, oy = -Y0 * S + pad;
  const WID = so.widths, HW = so.hidW || 0.5, RE = so.re || 0.6, RT = so.rt || 0.6;
  const SP = p => { const q = R.PJ(p); return [q[0] * S + ox, q[1] * S + oy]; }, SV = d => { const q = R.PJ(d); return [q[0] * S, q[1] * S]; };
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1]], add = (a, b) => [a[0] + b[0], a[1] + b[1]], mul = (a, k) => [a[0] * k, a[1] * k];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1], crs = (a, b) => a[0] * b[1] - a[1] * b[0], len = a => Math.hypot(a[0], a[1]);
  const nrm = a => { const l = len(a) || 1; return [a[0] / l, a[1] / l]; }, nL = d => [-d[1], d[0]], dist = (a, b) => len(sub(a, b));
  // ---- pieces ----
  const items = [];
  for (const pc of R.out) { if (so.skip && so.skip.has(pc)) continue;
    let key, col, w; if (pc.vis) { key = 'v' + pc.r; col = TONES[Math.floor(pc.r / 3)]; w = WID[WTS[pc.r % 3]]; } else { if (!pc.gh) continue; key = 'h'; col = 'hid'; w = HW; }
    const it = { key, col, w, k: pc.k, src: pc, vis: !!pc.vis, sm: pc.sm };
    if (pc.k === 'L') { it.p0 = SP(pc.a); it.p1 = SP(pc.b); if (dist(it.p0, it.p1) < 1e-4) continue; }
    else { it.C = SP(pc.c); const U = SV(pc.u), V = SV(pc.v); it.U = mul(U, pc.rad); it.V = mul(V, pc.rad); it.t0 = pc.t0; it.t1 = pc.t1; it.closed = !!pc.closed }
    items.push(it); }
  const A = (it, t) => [it.C[0] + it.U[0] * Math.cos(t) + it.V[0] * Math.sin(t), it.C[1] + it.U[1] * Math.cos(t) + it.V[1] * Math.sin(t)];
  const dA = (it, t) => [-it.U[0] * Math.sin(t) + it.V[0] * Math.cos(t), -it.U[1] * Math.sin(t) + it.V[1] * Math.cos(t)];
  const endPt = (it, e) => it.k === 'L' ? (e ? it.p1 : it.p0) : A(it, e ? it.t1 : it.t0);
  const outDir = (it, e) => { if (it.k === 'L') return nrm(e ? sub(it.p1, it.p0) : sub(it.p0, it.p1)); const s = Math.sign(it.t1 - it.t0) || 1, d = dA(it, e ? it.t1 : it.t0); return nrm(e ? mul(d, s) : mul(d, -s)); };
  // tiny stray pieces at corners (no straight continuation at both ends) are dropped before chaining
  { const plen0 = it => it.k === 'L' ? dist(it.p0, it.p1) : Math.abs(it.t1 - it.t0) * Math.max(len(it.U), len(it.V)); const eg = new Map(), ek = p => Math.floor(p[0] / 0.5) + ',' + Math.floor(p[1] / 0.5);
    items.forEach((it, i) => { if (it.closed) return; for (const e of [0, 1]) { const k = ek(endPt(it, e)); if (!eg.has(k)) eg.set(k, []); eg.get(k).push([i, e]); } });
    const cont = (i, e) => { const it = items[i], p = endPt(it, e), d = outDir(it, e); const gx = Math.floor(p[0] / 0.5), gy = Math.floor(p[1] / 0.5);
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (const [j, ej] of (eg.get((gx + dx) + ',' + (gy + dy)) || [])) { if (j === i || items[j].vis !== it.vis) continue; if (dist(endPt(items[j], ej), p) < 0.12 && dot(d, outDir(items[j], ej)) < -0.9) return true; } return false; };
    const drop = new Set(); items.forEach((it, i) => { if (!it.closed && plen0(it) < 0.35 && !(cont(i, 0) && cont(i, 1))) drop.add(i); });
    if (drop.size) { const kept = items.filter((_, i) => !drop.has(i)); items.length = 0; items.push(...kept); } }
  // ---- chain pieces of one style that share ends ----
  const buildChains = () => { const byKey = {}; items.forEach((it, i) => (byKey[it.key] = byKey[it.key] || []).push(i));
  const chains = [];
  for (const key of Object.keys(byKey)) { const ids = byKey[key]; const NC = 0.5, ngrid = new Map(), nodes = [];
    const nodeOf = p => { const gx = Math.floor(p[0] / NC), gy = Math.floor(p[1] / NC);
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) { const L = ngrid.get((gx + dx) + ',' + (gy + dy)); if (L) for (const n of L) if (dist(nodes[n].p, p) < 0.12) return n; }
      const n = nodes.length; nodes.push({ p, ends: [] }); const k = gx + ',' + gy; if (!ngrid.has(k)) ngrid.set(k, []); ngrid.get(k).push(n); return n; };
    const ends = {}; for (const i of ids) { const it = items[i]; if (it.closed) continue; const a = nodeOf(endPt(it, 0)), b = nodeOf(endPt(it, 1)); ends[i] = [a, b]; nodes[a].ends.push([i, 0]); nodes[b].ends.push([i, 1]); }
    const used = new Set();
    for (const i of ids) { if (used.has(i)) continue; used.add(i); if (items[i].closed) { chains.push({ key, parts: [[i, 0]], closed: true }); continue; }
      const parts = [[i, 0]];
      const extend = front => { while (true) { const [ci, rev] = front ? parts[0] : parts[parts.length - 1]; const e = front ? (rev ? 1 : 0) : (rev ? 0 : 1); const node = ends[ci][e], d = outDir(items[ci], e);
          let best = null, bd = -2; for (const [j, ej] of nodes[node].ends) { if (used.has(j)) continue; const dd = -dot(d, outDir(items[j], ej)); if (dd > bd) { bd = dd; best = [j, ej]; } }
          if (!best || bd < -0.6) return; used.add(best[0]);
          if (front) parts.unshift([best[0], best[1] === 1 ? 0 : 1]); else parts.push([best[0], best[1] === 0 ? 0 : 1]); } };
      extend(false); extend(true);
      const f = parts[0], l = parts[parts.length - 1]; const sN = ends[f[0]][f[1] ? 1 : 0], eN = ends[l[0]][l[1] ? 0 : 1];
      chains.push({ key, parts, closed: parts.length > 1 && sN === eN }); } }
  return chains; };
  let chains = buildChains();
  // a short run that carries straight on between two lines of one other style takes that style (no notch in a line)
  { const cEnds = []; chains.forEach((c, ci) => { if (c.closed) return; const [fi, fr] = c.parts[0], [li, lr] = c.parts[c.parts.length - 1]; cEnds.push({ ci, it: items[fi], e: fr ? 1 : 0 }, { ci, it: items[li], e: lr ? 0 : 1 }); });
    const clen = c => c.parts.reduce((a, [i]) => { const it = items[i]; return a + (it.k === 'L' ? dist(it.p0, it.p1) : Math.abs(it.t1 - it.t0) * Math.max(len(it.U), len(it.V))); }, 0);
    let changed = false;
    chains.forEach((c, ci) => { if (c.closed || !items[c.parts[0][0]].vis || clen(c) > 3) return; const mine = cEnds.filter(x => x.ci === ci);
      const partners = mine.map(m => { const p = endPt(m.it, m.e), d = outDir(m.it, m.e); return cEnds.filter(x => x.ci !== ci && x.it.key !== m.it.key && x.it.vis && dist(endPt(x.it, x.e), p) < 0.15 && dot(d, outDir(x.it, x.e)) < -0.95).map(x => x.it); });
      if (mine.length < 2 || !partners[0].length || !partners[1].length) return; const k = partners[0].find(a => partners[1].some(b => b.key === a.key)); if (!k) return;
      for (const [i] of c.parts) { items[i].key = k.key; items[i].col = k.col; items[i].w = k.w; } changed = true; });
    if (changed) chains = buildChains(); }
  // ---- centre polylines (arcs sampled finely enough that facets stay far below a device pixel) ----
  const arcPts = (it, ta, tb) => { const T = dot(it.U, it.U) + dot(it.V, it.V), D = Math.abs(crs(it.U, it.V)); const q = Math.sqrt(Math.max(0, T * T / 4 - D * D));
    const s1 = Math.sqrt(T / 2 + q), s2 = Math.sqrt(Math.max(1e-9, T / 2 - q)); const rho = s2 * s2 / s1; const step = Math.min(0.1, Math.sqrt(8 * 0.0012 / Math.max(rho, 1e-3)));
    const n = Math.max(2, Math.ceil(Math.abs(tb - ta) / step)); const r = []; for (let i = 0; i <= n; i++) r.push(A(it, ta + (tb - ta) * i / n)); return r; };
  let ARCID = 0;
  const CH = chains.map(c => { const it0 = items[c.parts[0][0]]; let pts = [], fl = [];
    for (const [i, rev] of c.parts) { const it = items[i]; let P, F; if (it.k === 'L') { P = rev ? [it.p1, it.p0] : [it.p0, it.p1]; F = it.sm != null ? [1e6 + it.sm, 1e6 + it.sm] : [-1, -1]; } else { P = rev ? arcPts(it, it.t1, it.t0) : arcPts(it, it.t0, it.t1); const id = ARCID++; F = P.map((_, k) => k === 0 || k === P.length - 1 ? -1 : id); }
      if (pts.length && dist(pts[pts.length - 1], P[0]) < 0.2) { P = P.slice(1); F = F.slice(1); } P.forEach((p, k) => { if (!pts.length || dist(pts[pts.length - 1], p) > 1e-6) { pts.push(p); fl.push(F[k]); } }); }
    if (c.closed && pts.length > 2 && dist(pts[0], pts[pts.length - 1]) < 0.2) { pts.pop(); fl.pop(); }
    // remove tiny back-tracks (a curve touching a silhouette can overshoot and turn back): they would fold the outline
    { let ch = true; while (ch && pts.length > 2) { ch = false; for (let i = 1; i < pts.length - 1; i++) { const a = sub(pts[i], pts[i - 1]), b = sub(pts[i + 1], pts[i]), la = len(a), lb = len(b);
        if (la < 1e-9 || lb < 1e-9 || (dot(a, b) / (la * lb) < -0.5 && Math.min(la, lb) < it0.w * 1.5)) { pts.splice(i, 1); fl.splice(i, 1); ch = true; break; } } } }
    const cum = [0]; for (let k = 1; k < pts.length; k++) cum.push(cum[k - 1] + dist(pts[k], pts[k - 1]));
    let L = cum[cum.length - 1]; if (c.closed) L += dist(pts[0], pts[pts.length - 1]);
    const [fi, fr] = c.parts[0], [li, lr] = c.parts[c.parts.length - 1];
    const plen = it => it.k === 'L' ? dist(it.p0, it.p1) : Math.abs(it.t1 - it.t0) * Math.max(len(it.U), len(it.V));
    const polyDir = (fromEnd) => { const n = pts.length; let k = fromEnd ? n - 1 : 0, acc = 0; const P0 = pts[k]; while (acc < Math.min(0.6, L / 2) && (fromEnd ? k > 0 : k < n - 1)) { const k2 = fromEnd ? k - 1 : k + 1; acc += dist(pts[k], pts[k2]); k = k2; } return nrm(sub(P0, pts[k])); };
    const uS = c.closed ? null : (plen(items[fi]) >= 0.3 ? outDir(items[fi], fr ? 1 : 0) : polyDir(false)), uE = c.closed ? null : (plen(items[li]) >= 0.3 ? outDir(items[li], lr ? 0 : 1) : polyDir(true));
    return { c, key: c.key, col: it0.col, w: it0.w, vis: it0.vis, pts, fl, cum, L, closed: c.closed || pts.length < 2,
      u0: uS, u1: uE, srcs: c.parts.map(([i]) => items[i].src), e3: [[items[fi].src, fr ? 1 : 0], [items[li].src, lr ? 0 : 1]] }; });
  // specks: open chains shorter than their own width are dropped, then the pass reruns so neighbours finish cleanly without them
  if (!so.skip) { const sp = CH.filter(h => !h.closed && h.L < (h.vis ? 1.0 : 1.5) * h.w); if (sp.length) { const r2 = toFills(R, Object.assign({}, so, { skip: new Set(sp.flatMap(h => h.srcs)) })); r2.specks = sp.length + r2.specks; return r2; } }
  // ---- spatial index of fine segments and chain ends ----
  const FC = 3, fgrid = new Map(), fine = [], egrid = new Map(), ENDS = [];
  const put = (gm, x, y, v) => { const k = Math.floor(x / FC) + ',' + Math.floor(y / FC); if (!gm.has(k)) gm.set(k, []); gm.get(k).push(v); };
  CH.forEach((h, ci) => { const n = h.pts.length, segN = h.closed ? n : n - 1;
    for (let k = 0; k < segN; k++) { const a = h.pts[k], b = h.pts[(k + 1) % n], id = fine.length; fine.push({ a, b, ci, k, s0: h.cum[k], s1: h.cum[k] + dist(a, b) });
      for (let gx = Math.floor(Math.min(a[0], b[0]) / FC); gx <= Math.floor(Math.max(a[0], b[0]) / FC); gx++) for (let gy = Math.floor(Math.min(a[1], b[1]) / FC); gy <= Math.floor(Math.max(a[1], b[1]) / FC); gy++) { const kk = gx + ',' + gy; if (!fgrid.has(kk)) fgrid.set(kk, []); fgrid.get(kk).push(id); } }
    if (!h.closed) { for (const e of [0, 1]) { const [pc3, e3] = h.e3[e]; const E = { ci, e, P: e ? h.pts[n - 1] : h.pts[0], u: e ? h.u1 : h.u0, w: h.w, vis: h.vis, occ: !!(pc3.oc && pc3.oc[e3]) }; ENDS.push(E); put(egrid, E.P[0], E.P[1], E); } } });
  const near = (gm, p, r) => { const out = new Set(); for (let gx = Math.floor((p[0] - r) / FC); gx <= Math.floor((p[0] + r) / FC); gx++) for (let gy = Math.floor((p[1] - r) / FC); gy <= Math.floor((p[1] + r) / FC); gy++) { const L = gm.get(gx + ',' + gy); if (L) for (const v of L) out.add(v); } return out; };
  const projSeg = (p, a, b) => { const d = sub(b, a), L2 = dot(d, d); let t = L2 ? dot(sub(p, a), d) / L2 : 0; t = Math.max(0, Math.min(1, t)); const q = add(a, mul(d, t)); return { t, q, d: dist(p, q) }; };
  // ---- arms meeting at each chain end ----
  const freeEnds = [];
  const endCut = E => { const h = CH[E.ci], P = E.P, w = E.w, own = { d: mul(E.u, -1), o: P, w, term: true }; const arms = [];
    for (const E2 of near(egrid, P, RE)) { if (E2 === E || E2.vis !== E.vis || dist(E2.P, P) > RE || E2.occ) continue; arms.push({ d: mul(E2.u, -1), o: E2.P, w: E2.w, term: !E.occ, vtx: E.occ }); }
    const best = new Map(); const endPos = E.e ? h.L : 0;
    for (const fid of near(fgrid, P, RT)) { const f = fine[fid], hb = CH[f.ci]; if (hb.vis !== E.vis) continue; const pr = projSeg(P, f.a, f.b); if (pr.d > RT) continue;
      if (f.ci === E.ci) { const s = f.s0 + (f.s1 - f.s0) * pr.t; if (Math.abs(s - endPos) < 2.5 * w + RT + 0.5 || (h.closed && Math.abs(h.L - Math.abs(s - endPos)) < 2.5 * w + RT + 0.5)) continue; }
      if (!hb.closed) { const sPos = f.s0 + (f.s1 - f.s0) * pr.t; if ((sPos < RE + 1e-6 || hb.L - sPos < RE + 1e-6) && f.ci !== E.ci) continue; } // that chain ends here: already an end arm
      const cur = best.get(f.ci); if (!cur || pr.d < cur.pr.d) best.set(f.ci, { f, pr }); }
    for (const { f, pr } of best.values()) { const hb = CH[f.ci], n = hb.pts.length; let vi = -1, vd = 1e9;
      for (const cand of [f.k, (f.k + 1) % n]) { if (!hb.closed && (cand === 0 || cand === n - 1)) continue; const dv = dist(P, hb.pts[cand]); if (dv < RT + hb.w && dv < vd) { const v = hb.pts[cand], d1 = nrm(sub(hb.pts[(cand - 1 + n) % n], v)), d2 = nrm(sub(hb.pts[(cand + 1) % n], v)); if (dot(d1, d2) > -0.985) { vi = cand; vd = dv; } } }
      if (vi >= 0) { const v = hb.pts[vi], d1 = nrm(sub(hb.pts[(vi - 1 + n) % n], v)), d2 = nrm(sub(hb.pts[(vi + 1) % n], v));
        arms.push({ d: d1, o: v, w: hb.w, term: false, bar: f.ci, vtx: true }); arms.push({ d: d2, o: v, w: hb.w, term: false, bar: f.ci, vtx: true }); continue; }
      const t = nrm(sub(f.b, f.a)); arms.push({ d: t, o: pr.q, w: hb.w, term: false, bar: f.ci }); arms.push({ d: mul(t, -1), o: pr.q, w: hb.w, term: false, bar: f.ci }); }
    /*dbg*/ if (toFills.dbg && dist(P, toFills.dbg) < 2.5) console.log('E0', E.ci, E.e, 'P', P.map(v => v.toFixed(2)), 'w', w, 'u', E.u.map(v => v.toFixed(3)), CH[E.ci].key, 'L', CH[E.ci].L.toFixed(2), 'arms', arms.map(b => [b.term ? 'T' : b.vtx ? 'V' : 'B', b.d.map(v => v.toFixed(2)), b.o.map(v => v.toFixed(2)), b.w].join(' ')).join(' | '));
    if (!arms.length) { if (E.vis) freeEnds.push(E); return null; }
    // a line that carries straight on into another (style change along one edge) just abuts it square
    const anti = (x, y) => dot(x.d, y.d) < -0.966;
    if (arms.some(b => b.term && anti(own, b))) return { left: null, right: null, mid: null, reach: 0 };
    // two ends that carry straight through this point act as one continuous line for everything else
    const T0 = arms.filter(b => b.term); for (const b of T0) if (T0.some(c => c !== b && anti(b, c))) b.term = false;
    // the corner point: where the centre lines actually meet (closes small gaps and trims small overshoots)
    const TT = arms.filter(b => b.term); let node = P;
    if (TT.length === 1) { const b = TT[0], den = crs(own.d, b.d); if (Math.abs(den) > 0.2) { const X = add(P, mul(own.d, crs(sub(b.o, P), b.d) / den)); if (dist(X, P) < 2 * RE && dist(X, b.o) < 2 * RE) node = X; } }
    else if (TT.length > 1) node = mul(TT.reduce((acc, b) => add(acc, b.o), P), 1 / (TT.length + 1));
    const ang = d => Math.atan2(d[1], d[0]), a0 = ang(own.d); let Lb = null, Rb = null, Ld = 9, Rd = -9;
    for (const b of arms) { let D = ang(b.d) - a0; while (D <= 1e-9) D += 2 * Math.PI; while (D > 2 * Math.PI + 1e-9) D -= 2 * Math.PI; b.D = D; if (D < Ld) { Ld = D; Lb = b; } if (D > Rd) { Rd = D; Rb = b; } }
    const facing = (b, side) => ({ p: add(b.o, mul(nL(b.d), side * b.w / 2)), d: b.d }); // side -1: b's right side, +1: b's left side
    const maxw = Math.max(w, ...arms.map(b => b.w));
    // left of own arm faces the right side of Lb; right of own arm faces the left side of Rb
    const sideOK = D => Math.abs(Math.sin(D)) > 0.26;
    const Lline = sideOK(Lb.D) ? facing(Lb, -1) : null, Rline = sideOK(Rb.D) ? facing(Rb, +1) : null;
    let mid = null;
    if (Lline && Rline) { const tL = Lb.term, tR = Rb.term;
      if (tL && tR) mid = node;
      else if (!tL && !tR) { if (Math.abs(crs(Lline.d, Rline.d)) > 0.05) { const m = crs(sub(Rline.p, Lline.p), Rline.d) / crs(Lline.d, Rline.d); mid = add(Lline.p, mul(Lline.d, m)); } }
      else { const ln = tL ? Rline : Lline; mid = add(ln.p, mul(ln.d, dot(sub(node, ln.p), ln.d))); }
      if (mid && dist(mid, P) > 2.5 * maxw + RT) mid = null; }
    // map arm sides to chain sides: at the start the arm's left is the chain's left; at the end it is the chain's right
    /*dbg*/ if (toFills.dbg && dist(P, toFills.dbg) < 1.5) console.log('END', E.ci, E.e, 'P', P.map(v => v.toFixed(2)), 'w', w, 'u', E.u.map(v => v.toFixed(3)), 'key', CH[E.ci].key, 'L', CH[E.ci].L.toFixed(2), '\n  arms', arms.map(b => [b.term ? 'T' : b.vtx ? 'V' : 'B', b.bar, b.d.map(v => v.toFixed(3)), b.o.map(v => v.toFixed(2)), b.w, (b.D * 180 / Math.PI).toFixed(1)].join(' ')).join(' | '), '\n  Lb', (Lb.D * 180 / Math.PI).toFixed(1), 'Rb', (Rb.D * 180 / Math.PI).toFixed(1), 'Lline', !!Lline, 'Rline', !!Rline, 'mid', mid && mid.map(v => v.toFixed(2)), 'node', node.map(v => v.toFixed(2)));
    /*dbg*/ if (toFills.jx) toFills.jx.push({ P, type: (Lb.term ? 'T' : Lb.vtx ? 'V' : 'B') + (Rb.term ? 'T' : Rb.vtx ? 'V' : 'B') + (Lline ? '' : 'p') + (Rline ? '' : 'p'), vis: E.vis });
    return { left: E.e ? Rline : Lline, right: E.e ? Lline : Rline, mid, reach: 3 * maxw + RT + 1, lim: 2.5 * maxw + 0.3 }; };
  // ---- offset a polyline ----
  const offsets = (pts, hw, closed) => { const n = pts.length, Lp = [], Rp = [];
    const segD = k => nrm(sub(pts[(k + 1) % n], pts[k]));
    for (let i = 0; i < n; i++) { let nn;
      if (!closed && i === 0) nn = nL(segD(0)); else if (!closed && i === n - 1) nn = nL(segD(n - 2));
      else { const a = nL(segD((i - 1 + n) % n)), b = nL(segD(i)); const m = nrm(add(a, b)); const c = Math.max(0.25, dot(m, b)); nn = mul(m, 1 / c); }
      Lp.push(add(pts[i], mul(nn, hw))); Rp.push(sub(pts[i], mul(nn, hw))); }
    return [Lp, Rp]; };
  const hitLine = (a, b, ln) => { const den = crs(sub(b, a), ln.d); if (Math.abs(den) < 1e-12) return null; const lam = crs(sub(ln.p, a), ln.d) / den; return lam >= -1e-9 && lam <= 1 + 1e-9 ? lam : null; };
  // trim one side polyline between a start cut line and an end cut line (null = square end)
  const trimSide = (sp, fl, f0, f1, cs, ce, reachS, reachE) => { const n = sp.length; const ext = Math.max(reachS, reachE);
    const X = [sub(sp[0], mul(f0, ext)), ...sp, add(sp[n - 1], mul(f1, ext))], XF = [-1, ...fl, -1]; // f0: forward dir at start, f1: forward dir at end
    let s = { k: 0, lam: 1 }, e = { k: n, lam: 0 }; // default: exactly the original ends (segment 0 ends at sp[0]; segment n starts at sp[n-1])
    if (cs) { let acc = 0; for (let k = 0; k < X.length - 1 && acc <= reachS; k++) { const lam = hitLine(X[k], X[k + 1], cs); if (lam != null) { s = { k, lam }; break; } if (k > 0) acc += dist(X[k], X[k + 1]); } }
    if (ce) { let acc = 0; for (let k = X.length - 2; k >= 0 && acc <= reachE; k--) { const lam = hitLine(X[k], X[k + 1], ce); if (lam != null) { e = { k, lam }; break; } if (k < X.length - 2) acc += dist(X[k], X[k + 1]); } }
    /*dbg*/ if ((cs && s.k === 0 && s.lam === 1 && !hitLine(X[0], X[1], cs)) || (ce && e.k === n && e.lam === 0 && !hitLine(X[n], X[n + 1], ce))) (toFills.misses = toFills.misses || []).push(cs && s.k === 0 && s.lam === 1 ? sp[0] : sp[n - 1]);
    if (e.k < s.k || (e.k === s.k && e.lam <= s.lam)) return null;
    const P = (k, lam) => add(X[k], mul(sub(X[k + 1], X[k]), lam));
    const farS = !!(cs && dist(P(s.k, s.lam), sp[0]) > cs.lim), farE = !!(ce && dist(P(e.k, e.lam), sp[n - 1]) > ce.lim);
    const out = [{ p: P(s.k, s.lam), f: -1 }]; for (let k = s.k + 1; k <= e.k; k++) out.push({ p: X[k], f: XF[k] }); out.push({ p: P(e.k, e.lam), f: -1 }); const r = out.filter((q, i, arr) => i === 0 || dist(q.p, arr[i - 1].p) > 1e-6); r.farS = farS; r.farE = farE; return r; };
  // ---- build outlines ----
  const polys = {}; const area = poly => { let a = 0; for (let i = 0; i < poly.length; i++) { const p = poly[i].p, q = poly[(i + 1) % poly.length].p; a += p[0] * q[1] - q[0] * p[1]; } return a / 2; };
  const tag = (P, F) => P.map((p, k) => ({ p, f: F[k] }));
  const emit = (col, loops) => (polys[col] = polys[col] || []).push(loops);
  const cutOf = new Map(); for (const E of ENDS) cutOf.set(E.ci + ':' + E.e, endCut(E));
  CH.forEach((h, ci) => { if (h.pts.length < 2) return; const hw = h.w / 2;
    if (h.closed) { const [Lp, Rp] = offsets(h.pts, hw, true); let o = tag(Lp, h.fl), i = tag(Rp, h.fl).reverse(); if (Math.abs(area(o)) < Math.abs(area(i))) { const t = o; o = i; i = t; } if (area(o) < 0) { o.reverse(); i.reverse(); }
      /*dbg*/ if (toFills.dbgPoly && o.some((q, k) => projSeg(toFills.dbgPoly, q.p, o[(k + 1) % o.length].p).d < 2)) (toFills.dbgOut = toFills.dbgOut || []).push({ ci, key: h.key, poly: o.map(q => q.p), inner: i.map(q => q.p), closed: true });
      emit(h.col, [o, i]); return; }
    const [Lp, Rp] = offsets(h.pts, hw, false); const cs = cutOf.get(ci + ':0'), ce = cutOf.get(ci + ':1');
    const f0 = mul(h.u0, -1), f1 = h.u1;
    const LN = (c, side) => c && c[side] ? Object.assign({ lim: c.lim }, c[side]) : null;
    let sOK = true, eOK = true, left, right;
    for (let pass = 0; pass < 2; pass++) {
      left = trimSide(Lp, h.fl, f0, f1, sOK ? LN(cs, 'left') : null, eOK ? LN(ce, 'left') : null, cs ? cs.reach : 0, ce ? ce.reach : 0);
      right = trimSide(Rp, h.fl, f0, f1, sOK ? LN(cs, 'right') : null, eOK ? LN(ce, 'right') : null, cs ? cs.reach : 0, ce ? ce.reach : 0);
      if (!left || !right) break; const fs = left.farS || right.farS, fe = left.farE || right.farE; if (!fs && !fe) break; if (fs) sOK = false; if (fe) eOK = false; }
    let midS = sOK && cs && cs.mid, midE = eOK && ce && ce.mid;
    /*dbg*/ if (!left || !right) (toFills.fallbacks = toFills.fallbacks || []).push({ ci, P: h.pts[0], Q: h.pts[h.pts.length - 1], e3: h.e3, L: h.L, w: h.w });
    if (!left || !right) { left = tag(Lp, h.fl); right = tag(Rp, h.fl); midS = midE = null; }
    const poly = [...left]; if (midE) poly.push({ p: midE, f: -1 }); poly.push(...right.slice().reverse()); if (midS) poly.push({ p: midS, f: -1 });
    if (area(poly) < 0) poly.reverse();
    /*dbg*/ if (toFills.dbgPoly && poly.some((q, k) => projSeg(toFills.dbgPoly, q.p, poly[(k + 1) % poly.length].p).d < 2)) (toFills.dbgOut = toFills.dbgOut || []).push({ ci, key: h.key, poly: poly.map(q => q.p), midS, midE });
    emit(h.col, [poly]); });
  // ---- svg ----
  const f = n => { const s = n.toFixed(3); return s.replace(/\.?0+$/, '').replace(/^-0$/, '0'); };
  const ORDER = ['hid', 'faint', 'lo', 'mid', 'hi', 'lit'];
  const enc = L => { const n = L.length; let d = 'M' + f(L[0].p[0]) + ' ' + f(L[0].p[1]); const Pt = p => f(p[0]) + ' ' + f(p[1]);
    let i = 1; while (i < n) { const id = L[i].f; let j = i; if (id >= 0) while (j + 1 < n && L[j + 1].f === id) j++;
      if (id < 0 || j - i < 3) { d += 'L' + Pt(L[i].p); i++; continue; }
      // run i..j of samples from one arc: derivative per sample index by central differences inside the run
      const T = k => { const a = L[Math.max(i, k - 1)].p, b = L[Math.min(j, k + 1)].p, m = Math.min(j, k + 1) - Math.max(i, k - 1); return mul(sub(b, a), 1 / m); };
      d += 'L' + Pt(L[i].p); let a = i;
      while (a < j) { let b = a, turn = 0; while (b < j && b - a < 40) { const u1 = sub(L[b + 1].p, L[b].p), u0 = b > a ? sub(L[b].p, L[b - 1].p) : u1; turn += Math.abs(Math.atan2(crs(u0, u1), dot(u0, u1))); if (turn > 1.0 && b > a) break; b++; }
        const ta = T(a), tb = T(b), k = (b - a) / 3; d += 'C' + Pt(add(L[a].p, mul(ta, k))) + ' ' + Pt(sub(L[b].p, mul(tb, k))) + ' ' + Pt(L[b].p); a = b; }
      i = j + 1; }
    return d + 'Z'; };
  const paths = ORDER.filter(c => polys[c]).map(c => { const d = polys[c].map(loops => loops.map(enc).join('')).join('');
    return { col: c, d }; });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` + paths.map(p => `<path d="${p.d}" fill="${so.colors[p.col]}"/>`).join('') + '</svg>';
  return { svg, W, H, ox, oy, S, chains: CH.length, freeEnds, specks: 0, paths: paths.length, CH };
}
if (typeof module !== 'undefined') module.exports = { toFills };
