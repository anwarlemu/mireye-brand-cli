// Residential parcel block (Mireye 4:5 post). Units ~ feet. x along the street, y back-to-front, z up.
// Five lots on a corner block: four flat-roof houses with garages and driveways, the middle lot vacant and marked
// (bright outline, iso diamond nodes on its corners, screen-vertical ground hatch like the brand's parcel fill),
// utility poles with two hanging lines on the rear easement.
function buildScene(g) {
  const { S, LW, K, T, TV, TR, span, hatch, even, range, lin, SLAB, SLAB_E, INSET, EDGE, HO, PIL,
    seams, door, louverH, louver, shell, fenceRun, fence, bays, grid, plinth } = makeKit(g);

  const PW = 260, PD = 140;
  plinth(0, 0, PW, PD);
  // ---------------- streets: front road and a side road on the right, centre lines tee together ----------------
  const RY0 = 118, RY1 = 134, SX0 = 228, SX1 = 244, RYC = (RY0 + RY1) / 2, SXC = (SX0 + SX1) / 2;
  g.seg([0, RY0, 0], [SX0, RY0, 0], 'lo', 'F'); g.seg([SX1, RY0, 0], [PW, RY0, 0], 'lo', 'F'); g.seg([0, RY1, 0], [PW, RY1, 0], 'lo', 'F');
  for (const x of [SX0, SX1]) g.seg([x, 0, 0], [x, RY0, 0], 'lo', 'F');
  g.seg([0, RYC, 0], [PW, RYC, 0], 'faint', 'F'); g.seg([SXC, 0, 0], [SXC, RYC, 0], 'faint', 'F');

  // ---------------- lots ----------------
  const LX = range(0, 5, 1).map(k => 4 + 44 * k), LF = 112, LB = 30, VAC = 2, VX0 = LX[VAC], VX1 = LX[VAC + 1];
  // diamond nodes: small ground squares (they read as diamonds in iso) on the vacant lot's corners; lines stop at them
  const NS = T(2, 'D'), NODES = [[VX0, LB], [VX1, LB], [VX1, LF], [VX0, LF]];
  const cut = (a, b, tone, w) => {   // ground segment along x or y with the node squares taken out
    const k = a[0] !== b[0] ? 0 : 1, o = 1 - k; let iv = [[Math.min(a[k], b[k]), Math.max(a[k], b[k])]];
    for (const n of NODES) if (Math.abs(n[o] - a[o]) < NS) iv = iv.flatMap(([p, q]) => { const r = []; if (n[k] - NS > p) r.push([p, Math.min(q, n[k] - NS)]); if (n[k] + NS < q) r.push([Math.max(p, n[k] + NS), q]); return r; });
    for (const [p, q] of iv) { const A = a.slice(), B = a.slice(); A[k] = p; B[k] = q; g.seg(A, B, tone, w); } };

  // houses: main block (parapet shell) and a garage, mirrored on the right half of the block
  // garage door: two panel joints 4 px apart from the ground up, frame top 4 px above them, garage roof 2 px above that;
  // the main block's roof sits 4 px above the garage roof
  const J1 = T(4, 'E', 'F'), J2 = J1 + T(4, 'F'), GDT = J2 + T(4, 'F', 'D'), GZ = GDT + EDGE, MZ = GZ + T(4, 'E');
  const MW = 20, GW = 12, MY0 = 72, MY1 = 94, GY0 = 76, SD = (44 - MW - GW) / 2;
  const drives = [];
  LX.slice(0, 5).forEach((x0, i) => { if (i === VAC) return;
    // centred in the lot: main then garage on the left half of the block, garage then main on the right half
    const right = i < VAC, s0 = x0 + SD;
    const m0 = right ? s0 : s0 + GW, m1 = m0 + MW, g0 = right ? m1 : s0, g1 = g0 + GW;
    shell(m0, MY0, m1, MY1, MZ, 'h' + i);
    g.box(g0, GY0, 0, g1, MY1, GZ, 'hi', 'E');
    const d0 = g0 + EDGE, d1 = g1 - EDGE;
    g.rect('y', MY1, d0, d1, 0, GDT, 'mid', 'D');
    for (const z of [J1, J2]) g.line('y', MY1, d0, z, d1, z, 'lo', 'F');
    // front: door with its step and a window, 4 px apart and 6 px in from the corners; the leaf is 6 px wide
    const C6 = T(6, 'E', 'D'), G6 = T(4, 'D'), DW = T(6, 'F') + 2 * INSET, DH = 7, SILL = T(4, 'E', 'D');
    const fd0 = right ? m0 + C6 : m1 - C6 - DW, fd1 = fd0 + DW;
    door('y', MY1, fd0, fd1, 0, DH, 'mid', right ? 1 : -1); g.box(fd0 - T(2, 'D'), MY1, 0, fd1 + T(2, 'D'), MY1 + 3, SLAB, 'lo', 'D');
    const w0 = right ? fd1 + G6 : m0 + C6, w1 = right ? m1 - C6 : fd0 - G6;
    g.rect('y', MY1, w0, w1, SILL, DH, 'mid', 'D');
    g.rect('x', m1, MY0 + 6, MY1 - 6, SILL, DH, 'mid', 'D');
    // driveway from the garage door to the curb
    drives.push([d0, d1]); g.seg([d0, MY1, 0], [d0, RY0, 0], 'lo', 'F'); g.seg([d1, MY1, 0], [d1, RY0, 0], 'lo', 'F'); });

  // lot lines: rear and side lines, the front line cut at the driveways; the vacant lot bright, cut at its nodes
  for (const x of LX) cut([x, LB, 0], [x, LF, 0], x === VX0 || x === VX1 ? 'hi' : 'lo', x === VX0 || x === VX1 ? 'D' : 'F');
  cut([LX[0], LB, 0], [VX0, LB, 0], 'lo', 'F'); cut([VX0, LB, 0], [VX1, LB, 0], 'hi', 'D'); cut([VX1, LB, 0], [LX[5], LB, 0], 'lo', 'F');
  { let x = LX[0]; for (const [a, b] of drives.sort((p, q) => p[0] - q[0])) { if (x < VX0 && a > VX1) { cut([x, LF, 0], [VX0, LF, 0], 'lo', 'F'); cut([VX0, LF, 0], [VX1, LF, 0], 'hi', 'D'); cut([VX1, LF, 0], [a, LF, 0], 'lo', 'F'); } else cut([x, LF, 0], [a, LF, 0], 'lo', 'F'); x = b; }
    cut([x, LF, 0], [LX[5], LF, 0], 'lo', 'F'); }
  for (const [x, y] of NODES) g.rect('z', 0, x - NS, x + NS, y - NS, y + NS, 'lit', 'D');
  // screen-vertical hatch inside the vacant lot: ground lines x − y = c, 8 px apart, kept out of the nodes
  { const step = 8 / (Math.SQRT1_2 * S);
    for (let c = VX0 - LF + step / 2; c < VX1 - LB; c += step) { let a = Math.max(VX0, LB + c), b = Math.min(VX1, LF + c); if (b - a < 0.5) continue;
      // the line runs at 45° in plan: an end inside a node square moves to where the line leaves the square
      for (const n of NODES) { if (Math.abs(a - n[0]) <= NS && Math.abs(a - c - n[1]) <= NS) a = Math.min(n[0] + NS, n[1] + NS + c);
        if (Math.abs(b - n[0]) <= NS && Math.abs(b - c - n[1]) <= NS) b = Math.max(n[0] - NS, n[1] - NS + c); }
      if (b - a > 0.5) g.seg([a, a - c, 0], [b, b - c, 0], 'faint', 'F'); } }

  // ---------------- utility poles on the rear easement, two lines hanging between them, a transformer drum ----------------
  const PY = 6, PX = [LX[0] + 22, LX[2] + 22, LX[4] + 22], PZ = 26, CAP = T(2, 'D') / 2;
  for (const x of PX) { g.seg([x, PY, 0], [x, PY, PZ], 'mid', 'D'); g.box(x - CAP, PY - CAP, PZ, x + CAP, PY + CAP, PZ + T(2, 'D'), 'hi', 'D'); }
  for (const z0 of [PZ - 2, PZ - 5]) for (let k = 0; k < PX.length - 1; k++) { const a = PX[k], b = PX[k + 1], n = 24; let p = [a, PY, z0];
    for (let i = 1; i <= n; i++) { const t = i / n, q = [a + (b - a) * t, PY, z0 - 2 * 4 * t * (1 - t)]; g.seg(p, q, 'mid', 'F'); p = q; } }
  // drum hung on the pole's viewer side, centred on it in screen so the pole shows above and below
  g.cyl('z', [PX[1] + 1.4, PY + 1.4, PZ - 15], 1.4, 4, 'mid', 'D');
}
if (typeof module !== 'undefined') module.exports = { buildScene };
