// Hidden-line wireframe engine (true isometric by default in wire.js: az 45).
// Occluders: axis-aligned boxes and cylinders. Edges: straight segments, exact circles, saddle curves (pipe meets pipe).
// render() returns every edge split into pieces that are visible (vis), see-through (gh: hidden only by the object's
// own shell or occluder group, drawn as x-ray) or hard-hidden (dropped). Collinear edges merge, strongest style wins.
// Each piece carries oc flags (end cut by an occluder) and sm (saddle id). fill.js turns pieces into filled outlines.
function WireScene(opt) {
  opt = opt || {};
  const az = (opt.az == null ? 32 : opt.az) * Math.PI / 180, el = Math.atan(1 / Math.SQRT2);
  const ca = Math.cos(az), sa = Math.sin(az), se = Math.sin(el), ce = Math.cos(el);
  const PJ = (p) => [p[0] * ca - p[1] * sa, (p[0] * sa + p[1] * ca) * se - p[2] * ce];
  const V = (() => { const v = [sa * ce, ca * ce, se], l = Math.hypot(v[0], v[1], v[2]); return v.map(c => c / l); })();
  const OCC = [], SEG = [], CUR = []; let SMID = 0;
  const TONES = ['lit', 'hi', 'mid', 'lo', 'faint'], WTS = ['E', 'D', 'F'];
  const rankOf = (tone, w) => TONES.indexOf(tone || 'mid') * 3 + WTS.indexOf(w || 'D');
  const g = {};
  g.P = PJ; g.V = V; g.S = opt.S || 2;
  g.seg = (a, b, tone, w, gh, own) => { SEG.push({ a, b, r: rankOf(tone, w), gh: !!gh, own: own == null ? -1 : own }); };
  g.poly = (pts, tone, w, closed, gh) => { for (let i = 0; i < pts.length - (closed ? 0 : 1); i++) g.seg(pts[i], pts[(i + 1) % pts.length], tone, w, gh); };
  g.occBox = (x0, y0, z0, x1, y1, z1, grp) => OCC.push({ t: 0, grp, lo: [Math.min(x0, x1), Math.min(y0, y1), Math.min(z0, z1)], hi: [Math.max(x0, x1), Math.max(y0, y1), Math.max(z0, z1)] });
  g.box = (x0, y0, z0, x1, y1, z1, tone, w, o) => { o = o || {}; let own = -1; if (o.solid !== false) { own = OCC.length; g.occBox(x0, y0, z0, x1, y1, z1); }
    const c = [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]];
    for (const [i, j] of [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]]) g.seg(c[i], c[j], tone || 'mid', w || 'E', o.ghost, o.ghost ? own : -1); };
  const mk = (axis, at, u, v) => axis === 'x' ? [at, u, v] : axis === 'y' ? [u, at, v] : [u, v, at];
  g.mk = mk;
  g.rect = (axis, at, u0, u1, v0, v1, tone, w, gh) => g.poly([mk(axis, at, u0, v0), mk(axis, at, u1, v0), mk(axis, at, u1, v1), mk(axis, at, u0, v1)], tone, w, true, gh);
  g.line = (axis, at, u0, v0, u1, v1, tone, w, gh) => g.seg(mk(axis, at, u0, v0), mk(axis, at, u1, v1), tone, w, gh);
  // exact circle in a plane perpendicular to axis ('x'|'y'|'z'), centre in full coordinates
  const basis = axis => axis === 'z' ? [[1, 0, 0], [0, 1, 0]] : axis === 'x' ? [[0, 1, 0], [0, 0, 1]] : [[1, 0, 0], [0, 0, 1]];
  g.ring = (axis, c, r, tone, w, gh, own, kind) => { const [u, v] = basis(axis); CUR.push({ c: c.slice(), u, v, rad: r, r: rankOf(tone, w), gh: !!(gh === true), own: own == null ? -1 : own, kind: kind || 'free' }); };
  // axis-aligned cylinder: axis, centre of base (full coords), radius, length along axis
  g.cyl = (axis, c, r, len, tone, w, o) => { o = o || {}; const A = axis === 'x' ? 0 : axis === 'y' ? 1 : 2, I = A === 0 ? 1 : 0, J = A === 2 ? 1 : 2;
    let own = -1; if (o.solid !== false) { own = OCC.length; OCC.push({ t: 1, A, I, J, ci: c[I], cj: c[J], r, a0: Math.min(c[A], c[A] + len), a1: Math.max(c[A], c[A] + len) }); }
    const c2 = c.slice(); c2[A] += len; const startNear = (len < 0) === (V[A] > 0);
    if (!o.noStart) g.ring(axis, c, r, tone, w, o.ghost, own, startNear ? 'near' : 'far'); if (!o.noEnd) g.ring(axis, c2, r, tone, w, o.ghost, own, startNear ? 'far' : 'near');
    // silhouette generators, tangent to both end circles (radial basis matches ring basis)
    const [u, v] = basis(axis); const Vu = V[0] * u[0] + V[1] * u[1] + V[2] * u[2], Vv = V[0] * v[0] + V[1] * v[1] + V[2] * v[2];
    const phi = Math.atan2(-Vu, Vv);
    for (const f of [phi, phi + Math.PI]) { const p = c.slice(); for (let k = 0; k < 3; k++) p[k] += r * (Math.cos(f) * u[k] + Math.sin(f) * v[k]); const q = p.slice(); q[A] += len; SEG.push({ a: p, b: q, r: rankOf(tone, w), gh: !!o.ghost, sil: [I, J, c[I], c[J]], own }); }
    for (const b of (o.bands || [])) { const cb = c.slice(); cb[A] += b; g.ring(axis, cb, r, tone, o.bandW || 'F', o.ghost, own, 'band'); } };
  g.saddle = (ax1, p1, r1, ax2, p2, r2, sgn, tone, w, n) => { n = Math.max(192, n || 0); const A1 = 'xyz'.indexOf(ax1), A2 = 'xyz'.indexOf(ax2), K = 3 - A1 - A2; const pts = []; r1 += 2.5e-4; r2 += 2.5e-4;
    for (let i = 0; i < n; i++) { const th = i / n * 2 * Math.PI; const p = [0, 0, 0]; const dA2 = r1 * Math.cos(th), dK = r1 * Math.sin(th);
      p[A2] = p1[A2] + dA2; p[K] = p1[K] + dK; const rr = r2 * r2 - Math.pow(p[K] - p2[K], 2); p[A1] = p2[A1] + sgn * Math.sqrt(Math.max(0, rr)); pts.push(p); }
    const sm = SMID++; for (let i = 0; i < n; i++) SEG.push({ a: pts[i], b: pts[(i + 1) % n], r: rankOf(tone, w), gh: false, own: -1, sm }); };
  const hitBox = (p, o) => { let t0 = 1e-3, t1 = 1e9;
    for (let k = 0; k < 3; k++) { const d = V[k]; if (Math.abs(d) < 1e-12) { if (p[k] < o.lo[k] || p[k] > o.hi[k]) return false; continue; }
      let ta = (o.lo[k] - p[k]) / d, tb = (o.hi[k] - p[k]) / d; if (ta > tb) { const s = ta; ta = tb; tb = s; } if (ta > t0) t0 = ta; if (tb < t1) t1 = tb; if (t0 >= t1 - 1e-6) return false; }
    return true; };
  const hitCyl = (p, o) => { const vi = V[o.I], vj = V[o.J], pi = p[o.I] - o.ci, pj = p[o.J] - o.cj; const A = vi * vi + vj * vj, B = 2 * (pi * vi + pj * vj), C = pi * pi + pj * pj - o.r * o.r;
    let lo = 1e-3, hi = 1e9; if (A < 1e-12) { if (C > 0) return false; } else { const D = B * B - 4 * A * C; if (D <= 0) return false; const s = Math.sqrt(D); const t1 = (-B - s) / (2 * A), t2 = (-B + s) / (2 * A); if (t1 > lo) lo = t1; if (t2 < hi) hi = t2; }
    const va = V[o.A]; if (Math.abs(va) < 1e-12) { if (p[o.A] < o.a0 || p[o.A] > o.a1) return false; } else { let ta = (o.a0 - p[o.A]) / va, tb = (o.a1 - p[o.A]) / va; if (ta > tb) { const s = ta; ta = tb; tb = s; } if (ta > lo) lo = ta; if (tb < hi) hi = tb; }
    return lo < hi - 1e-6; };
  g.render = (ro) => {
    ro = ro || {}; const S = ro.S || opt.S || 2;
    const pb = OCC.map(o => { let corners = []; if (o.t === 0) { for (const x of [o.lo[0], o.hi[0]]) for (const y of [o.lo[1], o.hi[1]]) for (const z of [o.lo[2], o.hi[2]]) corners.push([x, y, z]); }
      else { for (const a of [o.a0, o.a1]) for (const di of [-o.r, o.r]) for (const dj of [-o.r, o.r]) { const q = [0, 0, 0]; q[o.A] = a; q[o.I] = o.ci + di; q[o.J] = o.cj + dj; corners.push(q); } }
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const q of corners) { const s = PJ(q); x0 = Math.min(x0, s[0]); y0 = Math.min(y0, s[1]); x1 = Math.max(x1, s[0]); y1 = Math.max(y1, s[1]); } return [x0, y0, x1, y1]; });
    const CELL = 12, grid = new Map(); pb.forEach((b, i) => { for (let gx = Math.floor(b[0] / CELL); gx <= Math.floor(b[2] / CELL); gx++) for (let gy = Math.floor(b[1] / CELL); gy <= Math.floor(b[3] / CELL); gy++) { const k = gx + ',' + gy; if (!grid.has(k)) grid.set(k, []); grid.get(k).push(i); } });
    const hit = (p, skip) => { const s = PJ(p); const L = grid.get(Math.floor(s[0] / CELL) + ',' + Math.floor(s[1] / CELL)); if (!L) return false;
      for (const i of L) { if (i === skip) continue; const b = pb[i]; if (s[0] < b[0] - 1e-6 || s[0] > b[2] + 1e-6 || s[1] < b[1] - 1e-6 || s[1] > b[3] + 1e-6) continue; const o = OCC[i]; if (o.t === 0 ? hitBox(p, o) : hitCyl(p, o)) return true; } return false; };
    // merge collinear axis-aligned segments
    const lines = new Map(), loose = [];
    for (const s of SEG) { const d = [0, 1, 2].filter(k => Math.abs(s.a[k] - s.b[k]) > 1e-6); if (d.length !== 1 || s.sil) { if (d.length) loose.push(s); continue; }
      const k = d[0], oi = [0, 1, 2].filter(i => i !== k), key = k + ':' + oi.map(i => s.a[i].toFixed(3)).join(','); const lo = Math.min(s.a[k], s.b[k]), hi = Math.max(s.a[k], s.b[k]);
      if (!lines.has(key)) lines.set(key, { k, o: oi, at: oi.map(i => s.a[i]), iv: [] }); lines.get(key).iv.push([lo, hi, s.r, s.gh, s.own]); }
    const FIN = [];
    for (const L of lines.values()) { const bps = [...new Set(L.iv.flatMap(v => [v[0], v[1]]))].sort((p, q) => p - q); let cur = null;
      for (let i = 0; i < bps.length - 1; i++) { const m = (bps[i] + bps[i + 1]) / 2; let best = 99, gh = false, own = -1; for (const v of L.iv) if (v[0] <= m && m <= v[1]) { if (v[2] < best) { best = v[2]; gh = v[3]; own = v[3] ? v[4] : -1; } else if (v[2] === best && v[3] && !gh) { gh = true; own = v[4]; } }
        if (best === 99) { if (cur) { FIN.push(cur); cur = null; } continue; }
        if (cur && cur.r === best && cur.gh === gh && cur.own === own && Math.abs(cur.hi - bps[i]) < 1e-9) cur.hi = bps[i + 1]; else { if (cur) FIN.push(cur); cur = { L, lo: bps[i], hi: bps[i + 1], r: best, gh, own }; } }
      if (cur) FIN.push(cur); }
    const pt = (L, t) => { const p = [0, 0, 0]; p[L.k] = t; L.o.forEach((i, j) => p[i] = L.at[j]); return p; };
    const all = FIN.map(s => ({ a: pt(s.L, s.lo), b: pt(s.L, s.hi), r: s.r, gh: s.gh, own: s.own })).concat(loose);
    const lerp = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t];
    let X0 = 1e9, Y0 = 1e9, X1 = -1e9, Y1 = -1e9; const grow = q => { X0 = Math.min(X0, q[0]); Y0 = Math.min(Y0, q[1]); X1 = Math.max(X1, q[0]); Y1 = Math.max(Y1, q[1]); };
    const out = [];
    // candidate occluders along a screen segment (grid walk)
    const candidates = (A, B) => { const set = new Set(); const L = Math.hypot(B[0] - A[0], B[1] - A[1]), n = Math.max(1, Math.ceil(L / (CELL * 0.5)));
      for (let i = 0; i <= n; i++) { const x = A[0] + (B[0] - A[0]) * i / n, y = A[1] + (B[1] - A[1]) * i / n; for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) { const Lc = grid.get((Math.floor(x / CELL) + dx) + ',' + (Math.floor(y / CELL) + dy)); if (Lc) for (const o of Lc) set.add(o); } }
      return set; };
    // exact parameter interval of a segment hidden by a box: lo <= a + s d + t V <= hi with t > tmin
    const boxIv = (a, d, o) => { let s0 = 0, s1 = 1; const Ls = [[1e-3, 0]], Us = [];
      for (let k = 0; k < 3; k++) { const v = V[k]; const lo = (o.lo[k] - a[k]) / v, hi = (o.hi[k] - a[k]) / v, b = -d[k] / v; if (v > 0) { Ls.push([lo, b]); Us.push([hi, b]); } else { Ls.push([hi, b]); Us.push([lo, b]); } }
      const E = 1e-7;
      for (const [la, lb] of Ls) for (const [ua, ub] of Us) { const cA = lb - ub, cB = ua - la - E; // cA * s < cB
        if (Math.abs(cA) < 1e-12) { if (cB <= 0) return null; continue; } if (cA > 0) s1 = Math.min(s1, cB / cA); else s0 = Math.max(s0, cB / cA); if (s0 >= s1) return null; }
      return s1 - s0 > 1e-9 ? [s0, s1] : null; };
    for (const s of all) { const A = PJ(s.a), B = PJ(s.b); grow(A); grow(B);
      const L = Math.hypot(B[0] - A[0], B[1] - A[1]) * S; if (L < 1e-4) continue;
      const d = [s.b[0] - s.a[0], s.b[1] - s.a[1], s.b[2] - s.a[2]];
      const ivs = [], soft = []; const cand = candidates(A, B);
      for (const oi of cand) { if (s.sil && oi === s.own) continue; const o = OCC[oi], bb = pb[oi]; const dst = (s.gh && (oi === s.own || (o.grp != null && o.grp === s.own))) ? soft : ivs;
        if (Math.max(A[0], B[0]) < bb[0] || Math.min(A[0], B[0]) > bb[2] || Math.max(A[1], B[1]) < bb[1] || Math.min(A[1], B[1]) > bb[3]) continue;
        if (o.t === 0) { const iv = boxIv(s.a, d, o); if (iv) dst.push(iv); continue; }
        // cylinder: dense sampling + bisection
        const probe = t => { const p = lerp(s.a, s.b, t); if (s.sil) { const [I, J, ci, cj] = s.sil, di = p[I] - ci, dj = p[J] - cj, l = Math.hypot(di, dj); p[I] += di / l * 1e-6; p[J] += dj / l * 1e-6; } return hitCyl(p, o); };
        const n = Math.max(4, Math.ceil(L / 0.25)); let prev = probe(0), start = prev ? 0 : null;
        for (let i = 1; i <= n; i++) { const t = i / n, v = probe(t); if (v !== prev) { let lo = (i - 1) / n, hi = t; for (let it = 0; it < 24; it++) { const m = (lo + hi) / 2; if (probe(m) === prev) lo = m; else hi = m; } const c = (lo + hi) / 2;
            if (v) start = c; else { dst.push([start, c]); start = null; } prev = v; } }
        if (start !== null) dst.push([start, 1]); }
      const inU = (list, t) => list.some(iv => iv[0] <= t && t <= iv[1]);
      const bps = [...new Set([0, 1, ...ivs.flat(), ...soft.flat()].map(t => Math.min(1, Math.max(0, t))))].sort((p, q) => p - q);
      let cur = null; const segs = [];
      for (let i = 0; i < bps.length - 1; i++) { const m = (bps[i] + bps[i + 1]) / 2, st = inU(ivs, m) ? 2 : inU(soft, m) ? 1 : 0;
        if (cur && cur[2] === st) cur[1] = bps[i + 1]; else { if (cur) segs.push(cur); cur = [bps[i], bps[i + 1], st]; } }
      if (cur) segs.push(cur);
      for (const [t0, t1, st] of segs) { if ((t1 - t0) * L < 1e-4 || st === 2) continue; out.push({ k: 'L', vis: st === 0, r: s.r, gh: s.gh && st === 1, a: lerp(s.a, s.b, t0), b: lerp(s.a, s.b, t1), oc: [t0 > 1e-9, t1 < 1 - 1e-9], sm: s.sm }); } }
    for (const c of CUR) { const at = (t, e) => { const R = c.rad + (e || 0); return [c.c[0] + R * (Math.cos(t) * c.u[0] + Math.sin(t) * c.v[0]), c.c[1] + R * (Math.cos(t) * c.u[1] + Math.sin(t) * c.v[1]), c.c[2] + R * (Math.cos(t) * c.u[2] + Math.sin(t) * c.v[2])]; };
      for (let k = 0; k < 16; k++) grow(PJ(at(k / 16 * 2 * Math.PI)));
      const eps = c.own >= 0 ? 1e-6 : 0, n = Math.max(64, Math.ceil(2 * Math.PI * c.rad * S / 0.25)), TT = 2 * Math.PI;
      const Vu = V[0] * c.u[0] + V[1] * c.u[1] + V[2] * c.u[2], Vv = V[0] * c.v[0] + V[1] * c.v[1] + V[2] * c.v[2];
      const probe = t => { if (hit(at(t, eps), c.own)) return 2; return ((c.kind === 'far' || c.kind === 'band') && Vu * Math.cos(t) + Vv * Math.sin(t) < 0) ? 1 : 0; }; const st = []; for (let i = 0; i < n; i++) st.push(probe((i + 0.5) / n * TT));
      const trans = []; for (let i = 0; i < n; i++) { const j = (i + 1) % n; if (st[i] !== st[j]) { let lo = (i + 0.5) / n * TT, hi = (i + 1.5) / n * TT; const s0 = st[i]; for (let it = 0; it < 26; it++) { const m = (lo + hi) / 2; if (probe(m) === s0) lo = m; else hi = m; } trans.push({ t: (lo + hi) / 2, to: st[j] }); } }
      const OUT = (stt, o) => { if (stt === 2) return; out.push(Object.assign({ k: 'A', vis: stt === 0, r: c.r, gh: c.gh && stt === 1, c: c.c, u: c.u, v: c.v, rad: c.rad, oc: [!o.closed, !o.closed] }, o)); };
      if (!trans.length) { OUT(st[0], { t0: 0, t1: TT, closed: true }); continue; }
      trans.sort((p, q) => p.t - q.t);
      { const arcPx = c.rad * S; let changed = true;
        while (changed && trans.length >= 2) { changed = false;
          for (let i = 0; i < trans.length; i++) { const j = (i + 1) % trans.length; let span = trans[j].t - trans[i].t; if (span <= 0) span += TT;
            if (span * arcPx < 0.02) { const keep = trans.filter((_, k) => k !== i && k !== j); trans.length = 0; trans.push(...keep); changed = true; break; } } }
        if (trans.length < 2) { OUT(trans.length ? trans[0].to : st[0], { t0: 0, t1: TT, closed: true }); continue; } }
      for (let i = 0; i < trans.length; i++) { const a = trans[i], b = trans[(i + 1) % trans.length]; let t1 = b.t; if (t1 <= a.t) t1 += TT; OUT(a.to, { t0: a.t, t1 }); } }
    return { out, bounds: [X0, Y0, X1, Y1], PJ };
  };
  return g;
}
if (typeof module !== 'undefined') module.exports = { WireScene };
