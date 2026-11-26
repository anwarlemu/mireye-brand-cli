// Shared spacing system and builders for hidden-line isometric wireframe illustrations.
// Every small dimension is a TOKEN: the clear gap, in screen px, between two parallel lines, converted to world units
// for the weights of the two lines. Clear gaps allowed: 1, 2, 4, 6, 12 px. Weights: E 1.0 (volumes), D 0.7 (details),
// F 0.5 (hatching, seams, grid). Never type a small offset by eye; derive it from T / TV / TR / span.
function makeKit(g) {
  const S = g.S || 2.6, LW = g.LW || { E: 1.0, D: 0.7, F: 0.5 };
  const K = Math.SQRT1_2 * S;            // px between parallel straight lines per world unit of offset (any axis, true isometric)
  const KV = Math.sqrt(2 / 3) * S;       // px between stacked circles per world unit along their axis
  const KR = Math.sqrt(1 / 3) * S;       // px between concentric circles per world unit of radius (narrowest point)
  const T = (px, a = 'D', b = a) => (px + (LW[a] + LW[b]) / 2) / K;     // straight lines
  const TV = (px, a = 'D', b = a) => (px + (LW[a] + LW[b]) / 2) / KV;   // rings stacked along an axis
  const TR = (px, a = 'D', b = a) => (px + (LW[a] + LW[b]) / 2) / KR;   // concentric rings
  // n lines of weight wl between two edges of weight we, every clear gap exactly px: the container length
  const span = (n, px, we = 'D', wl = 'F') => ((n + 1) * px + n * LW[wl] + LW[we]) / K;
  // the n line positions inside a container that starts at a (use with span)
  const hatch = (a, n, px, we = 'D', wl = 'F') => { const r = [], f = (px + (LW[we] + LW[wl]) / 2) / K, p = (px + LW[wl]) / K; for (let i = 0; i < n; i++) r.push(a + f + i * p); return r; };
  // only when the container size is fixed by something else: count chosen so the gap is as close as possible to px
  const even = (a, b, px, we = 'D', wl = 'F') => { const sp = Math.abs(b - a) * K; let n = 0, bd = 1e9;
    for (let m = 0; m < 400; m++) { const gp = (sp - LW[we] - m * LW[wl]) / (m + 1); if (gp < 0.6) break; const d = Math.abs(gp - px); if (d < bd) { bd = d; n = m; } }
    const r = []; for (let i = 1; i <= n; i++) r.push(a + (b - a) * i / (n + 1)); return r; };
  const range = (a, b, s) => { const r = []; for (let v = a; v <= b + 1e-9; v += s) r.push(+v.toFixed(4)); return r; };
  const lin = (a, b, n) => { const r = []; for (let i = 0; i <= n; i++) r.push(a + (b - a) * i / n); return r; };   // n equal bays, n+1 lines
  const minus = (a, b, cuts) => { let parts = [[a, b]]; for (const [c0, c1] of cuts) { const nx = []; for (const [p, q] of parts) { if (c1 <= p || c0 >= q) { nx.push([p, q]); continue; } if (c0 > p) nx.push([p, c0]); if (c1 < q) nx.push([c1, q]); } parts = nx; } return parts.filter(([p, q]) => q - p > 0.05); };

  // tokens
  const SLAB = T(2, 'D'), SLAB_E = T(2, 'E');           // slab / pad / base / canopy thickness
  const INSET = T(1, 'D', 'F');                          // frame to leaf (doors, louvers, plates)
  const EDGE = T(2, 'E', 'D');                           // a detail sitting just inside a heavy outline
  const HO = T(2, 'F', 'D');                             // handle in from the leaf edge (leaf must be >= 2*HO wide)
  const PT = T(2, 'E'), PH = T(6, 'E');                  // parapet thickness and height
  const PIL = T(2, 'D');                                 // pilaster width and depth
  const STEP = T(12, 'E');                               // site plinth step height
  const RB = T(4, 'E', 'D');                             // ruler band below the plinth top

  // facade seams (tone lo, weight F) on a wall, cut around openings; an opening {u0,u1,v0,v1} stops seams that cross it
  const seams = (axis, at, u0, u1, v0, v1, us, vs, open) => {
    for (const u of us) { const cuts = open.filter(o => u > o.u0 - 1e-6 && u < o.u1 + 1e-6).map(o => [o.v0, o.v1]); for (const [p, q] of minus(v0, v1, cuts)) g.line(axis, at, u, p, u, q, 'lo', 'F'); }
    for (const v of vs) { const cuts = open.filter(o => v > o.v0 - 1e-6 && v < o.v1 + 1e-6).map(o => [o.u0, o.u1]); for (const [p, q] of minus(u0, u1, cuts)) g.line(axis, at, p, v, q, v, 'lo', 'F'); } };
  // door: frame (D) + leaf inset INSET (F); hand = 1 / -1 puts a short handle HO inside the leaf edge
  const door = (axis, at, u0, u1, v0, v1, tone, hand) => { g.rect(axis, at, u0, u1, v0, v1, tone || 'mid', 'D'); g.rect(axis, at, u0 + INSET, u1 - INSET, v0, v1 - INSET, 'lo', 'F');
    if (hand) { const u = hand > 0 ? u1 - INSET - HO : u0 + INSET + HO, v = v0 + (v1 - v0) * 0.48; g.line(axis, at, u, v - 0.6, u, v + 0.6, 'mid', 'D'); } };
  // louver: frame, inner frame, n slats 2 px apart; its height comes from the slat count
  const louverH = n => span(n, 2, 'F', 'F') + 2 * INSET;
  const louver = (axis, at, u0, u1, v0, n, tone) => { const v1 = v0 + louverH(n);
    g.rect(axis, at, u0, u1, v0, v1, tone || 'mid', 'D'); g.rect(axis, at, u0 + INSET, u1 - INSET, v0 + INSET, v1 - INSET, 'lo', 'F');
    for (const v of hatch(v0 + INSET, n, 2, 'F', 'F')) g.line(axis, at, u0 + INSET, v, u1 - INSET, v, 'lo', 'F'); return v1; };
  // building shell with a parapet: ONE occluder group (envelope + 4 parapet walls), x-ray lines for the footprint, the
  // outer verticals and the outer top run cleanly to the parapet corner; visible roof line at h, inner parapet lines
  const shell = (x0, y0, x1, y1, h, grp) => { const top = h + PH;
    g.occBox(x0, y0, 0, x1, y1, h, grp); g.occBox(x0, y0, h, x1, y0 + PT, top, grp); g.occBox(x0, y1 - PT, h, x1, y1, top, grp); g.occBox(x0, y0 + PT, h, x0 + PT, y1 - PT, top, grp); g.occBox(x1 - PT, y0 + PT, h, x1, y1 - PT, top, grp);
    const C = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], I = [[x0 + PT, y0 + PT], [x1 - PT, y0 + PT], [x1 - PT, y1 - PT], [x0 + PT, y1 - PT]];
    for (let k = 0; k < 4; k++) { const a = C[k], b = C[(k + 1) % 4], ai = I[k], bi = I[(k + 1) % 4];
      g.seg([a[0], a[1], 0], [b[0], b[1], 0], 'hi', 'E', true, grp); g.seg([a[0], a[1], 0], [a[0], a[1], top], 'hi', 'E', true, grp);
      g.seg([a[0], a[1], h], [b[0], b[1], h], 'hi', 'E'); g.seg([a[0], a[1], top], [b[0], b[1], top], 'hi', 'E', true, grp);
      g.seg([ai[0], ai[1], top], [bi[0], bi[1], top], 'hi', 'E'); g.seg([ai[0], ai[1], h], [bi[0], bi[1], h], 'hi', 'E'); g.seg([ai[0], ai[1], h], [ai[0], ai[1], top], 'hi', 'E'); } };
  // fence run: posts (lo D) at a pitch (step 0 = posts only at the two ends), top rail (lo D), ground line (faint F)
  const fenceRun = (a, b, step, fh = 8) => { const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = step ? Math.max(1, Math.round(L / step)) : 1;
    for (let i = 0; i <= n; i++) { const t = i / n, p = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; g.seg([p[0], p[1], 0], [p[0], p[1], fh], 'lo', 'D'); }
    g.seg([a[0], a[1], fh], [b[0], b[1], fh], 'lo', 'D'); g.seg([a[0], a[1], 0], [b[0], b[1], 0], 'faint', 'F'); };
  // rectangular enclosure; gate [xa, xb] on the front (y1) side: threshold, braces, top rail
  const fence = (x0, y0, x1, y1, step, gate, fh = 8) => { fenceRun([x0, y0], [x1, y0], step, fh); fenceRun([x1, y0], [x1, y1], step, fh); fenceRun([x0, y1], [x0, y0], step, fh);
    if (gate) { fenceRun([x0, y1], [gate[0], y1], step, fh); fenceRun([gate[1], y1], [x1, y1], step, fh); g.seg([gate[0], y1, 0], [gate[1], y1, 0], 'faint', 'F'); g.seg([gate[0], y1, 0], [gate[1], y1, fh], 'faint', 'F'); g.seg([gate[0], y1, fh], [gate[1], y1, 0], 'faint', 'F'); g.seg([gate[0], y1, fh], [gate[1], y1, fh], 'lo', 'D'); }
    else fenceRun([x1, y1], [x0, y1], step, fh); };
  // parking bays: n stalls between x0 and x1, closed by a line at both ends of the stalls (nothing pokes out)
  const bays = (x0, x1, n, y0, y1) => { const xs = lin(x0, x1, n); for (const x of xs) g.seg([x, y0, 0], [x, y1, 0], 'lo', 'F'); g.seg([x0, y0, 0], [x1, y0, 0], 'lo', 'F'); g.seg([x0, y1, 0], [x1, y1, 0], 'lo', 'F'); };
  // ground grid on the structural module, kept >= margin from the boundary, cut out of paving / enclosures (clip rects [x0,x1,y0,y1])
  const grid = (bx0, by0, bx1, by1, module, clip, margin = 8) => {
    for (let x = Math.ceil((bx0 + margin) / module) * module; x <= bx1 - margin; x += module) for (const [p, q] of minus(by0, by1, clip.filter(r => x > r[0] && x < r[1]).map(r => [r[2], r[3]]))) g.seg([x, p, 0], [x, q, 0], 'faint', 'F');
    for (let y = Math.ceil((by0 + margin) / module) * module; y <= by1 - margin; y += module) for (const [p, q] of minus(bx0, bx1, clip.filter(r => y > r[2] && y < r[3]).map(r => [r[0], r[1]]))) g.seg([p, y, 0], [q, y, 0], 'faint', 'F'); };
  // site plinth: two equal steps below the top (x0..x1, y0..y1 at z 0), a ruler band with ticks every `tick` on both visible faces
  const plinth = (x0, y0, x1, y1, inset = 16, tick = 10) => {
    g.box(x0 - inset, y0 - inset, -2 * STEP, x1 + inset, y1 + inset, -STEP, 'lo', 'E'); g.box(x0, y0, -STEP, x1, y1, 0, 'lo', 'E');
    g.seg([x0, y1, -RB], [x1, y1, -RB], 'lo', 'D'); g.seg([x1, y0, -RB], [x1, y1, -RB], 'lo', 'D');
    for (const x of range(x0 + tick, x1 - tick, tick)) g.seg([x, y1, 0], [x, y1, -RB], 'lo', 'F');
    for (const y of range(y0 + tick, y1 - tick, tick)) g.seg([x1, y, 0], [x1, y, -RB], 'lo', 'F'); };

  return { S, LW, K, KV, KR, T, TV, TR, span, hatch, even, range, lin, minus, SLAB, SLAB_E, INSET, EDGE, HO, PT, PH, PIL, STEP, RB,
    seams, door, louverH, louver, shell, fenceRun, fence, bays, grid, plinth };
}
if (typeof module !== 'undefined') module.exports = { makeKit };
