// Substation and transmission tower (Mireye 4:5 post). Units ~ feet. x along the long front, y back-to-front, z up.
// Tower on an easement to the left, the line drops into a gantry inside the fenced yard, a bus runs to the main transformer,
// control house by the gate. Every small dimension comes from the kit tokens.
function buildScene(g) {
  const { S, LW, K, T, TV, TR, span, hatch, even, range, lin, SLAB, SLAB_E, INSET, EDGE, HO, PIL,
    seams, door, louverH, louver, shell, fenceRun, fence, bays, grid, plinth } = makeKit(g);

  // ---------------- base ----------------
  plinth(0, 0, 240, 170);
  // easement around the tower: closed outline, ground grid inside it, tower footing pad
  const EX0 = 12, EX1 = 64, EY0 = 12, EY1 = 158, TXc = 38, TYc = 85, B0 = 9;
  g.rect('z', 0, EX0, EX1, EY0, EY1, 'lo', 'F');
  const FP = [TXc - B0 - 4, TXc + B0 + 4, TYc - B0 - 4, TYc + B0 + 4];
  g.rect('z', 0, FP[0], FP[1], FP[2], FP[3], 'lo', 'F');

  // ---------------- lattice tower ----------------
  const ZW = 60, BW = 3, ZT = 84, AH = 19;                      // waist height, column half width, crossarm height, crossarm half length
  const hw = z => z <= ZW ? B0 + (BW - B0) * z / ZW : BW;
  const LV = [0, 15, 30, 45, ZW, 72, ZT];
  const corner = (z, sx, sy) => [TXc + sx * hw(z), TYc + sy * hw(z), z];
  for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) for (let i = 0; i < LV.length - 1; i++) g.seg(corner(LV[i], sx, sy), corner(LV[i + 1], sx, sy), 'hi', 'D');
  for (const z of LV.slice(1, -1)) { const c = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) => corner(z, sx, sy)); for (let k = 0; k < 4; k++) g.seg(c[k], c[(k + 1) % 4], 'mid', 'F'); }
  // X bracing: visible faces lo, faces at the back faint
  const faces = [[[-1, 1], [1, 1], 'lo'], [[1, -1], [1, 1], 'lo'], [[-1, -1], [1, -1], 'faint'], [[-1, -1], [-1, 1], 'faint']];
  for (let i = 0; i < LV.length - 1; i++) for (const [a, b, tone] of faces) {
    g.seg(corner(LV[i], ...a), corner(LV[i + 1], ...b), tone, 'F'); g.seg(corner(LV[i], ...b), corner(LV[i + 1], ...a), tone, 'F'); }
  // crossarm and peak
  const XA = 1.2, XT = T(2, 'D');
  g.box(TXc - XA, TYc - AH, ZT, TXc + XA, TYc + AH, ZT + XT, 'hi', 'D');
  g.seg([TXc + XA, TYc - BW, ZT + XT], [TXc + XA, TYc, ZT + XT + 8], 'hi', 'D'); g.seg([TXc + XA, TYc + BW, ZT + XT], [TXc + XA, TYc, ZT + XT + 8], 'hi', 'D');

  // ---------------- conductors: tower to gantry, three phases ----------------
  const PH = [TYc - 15, TYc, TYc + 15], GX = 104, ZG = 34, IL = 5;
  for (const y of PH) {
    g.seg([TXc, y, ZT], [TXc, y, ZT - IL], 'mid', 'D');                         // tower insulator
    g.seg([GX, y, ZG], [GX, y, ZG - 4], 'mid', 'D');                            // gantry insulator
    const a = [TXc, y, ZT - IL], b = [GX, y, ZG - 4], n = 24, sag = 4; let p = a;
    for (let i = 1; i <= n; i++) { const t = i / n, q = [a[0] + (b[0] - a[0]) * t, y, a[2] + (b[2] - a[2]) * t - sag * 4 * t * (1 - t)]; g.seg(p, q, 'mid', 'D'); p = q; } }

  // ---------------- yard ----------------
  const YX0 = 76, YX1 = 228, YY0 = 14, YY1 = 158, GT = [196, 216];
  g.rect('z', 0, YX0 + 6, YX1 - 6, YY0 + 6, YY1 - 6, 'lo', 'F');               // gravel pad
  for (const x of GT) g.seg([x, YY1 - 6, 0], [x, 170, 0], 'lo', 'F');           // lanes from the pad through the gate

  // gantry: two columns on footings and a beam over the three phases
  const GC = [PH[0] - 10, PH[2] + 10], CW = T(2, 'D') / 2;
  for (const y of GC) g.box(GX - CW, y - CW, 0, GX + CW, y + CW, ZG, 'hi', 'D');
  g.box(GX - CW, GC[0] - 2, ZG, GX + CW, GC[1] + 2, ZG + XT, 'hi', 'D');

  const BPX = [118, 138];
  // bus: three lines at ZB on post insulators, droppers from the gantry
  const ZB = 22.5, BX0 = GX + 8, BXE = 155.5;
  for (const y of PH) {
    g.seg([BX0, y, ZB], [BXE, y, ZB], 'mid', 'E');
    g.seg([GX, y, ZG - 4], [BX0, y, ZB], 'mid', 'D');
    for (const x of BPX) { g.box(x - 1.5, y - 1.5, 0, x + 1.5, y + 1.5, SLAB, 'lo', 'D'); g.seg([x, y, SLAB], [x, y, ZB], 'mid', 'D'); } }

  // main transformer: pad, skid, tank, two radiator banks on the yard side, three bushings under the bus
  { const X0 = 150, X1 = 170, Y0 = 62, Y1 = 108, zs = SLAB, zk = zs + T(2, 'D'), zt = zk + 12;
    g.box(X0 - 6, Y0 - 6, 0, X1 + 10, Y1 + 6, SLAB, 'lo', 'D');
    g.box(X0 - 2, Y0 - 2, zs, X1 + 2, Y1 + 2, zk, 'hi', 'D');
    g.box(X0, Y0, zk, X1, Y1, zt, 'lit', 'E');
    const RW = 7, RL = span(10, 2, 'D', 'F'), r0 = zk + EDGE, r1 = zt - EDGE;
    for (const yc of [(Y0 + Y1) / 2 - 11, (Y0 + Y1) / 2 + 11]) { const ya = yc - RL / 2, yb = yc + RL / 2;
      g.box(X1, ya, r0, X1 + RW, yb, r1, 'hi', 'D');
      for (const y of hatch(ya, 10, 2, 'D', 'F')) { g.seg([X1 + RW, y, r0], [X1 + RW, y, r1], 'hi', 'F'); g.seg([X1, y, r1], [X1 + RW, y, r1], 'hi', 'F'); } }
    g.rect('y', Y1, X0 + EDGE, X1 - EDGE, zk + EDGE, zt - EDGE, 'hi', 'F');
    const bx = 155, sh = TV(1, 'F'), cg = TV(2, 'F');
    for (const y of PH) { let z = zt; const st = [[z, 0.5]]; z += cg; for (let k = 0; k < 2; k++) { st.push([z, 1.05]); z += sh; st.push([z, 0.5]); z += cg; } st.push([z]);
      for (let k = 0; k < st.length - 1; k++) g.cyl('z', [bx, y, st[k][0]], st[k][1], st[k + 1][0] - st[k][0], 'lit', 'F');
      g.seg([bx + 0.5, y, z], [bx + 0.5, y, ZB], 'mid', 'D'); } }

  // control house by the gate: parapet shell, door with step, louvers, one roof unit
  { const X0 = 182, X1 = 222, Y0 = 116, Y1 = 146, H = 14;
    shell(X0, Y0, X1, Y1, H, 'ctl');
    const PDW = 5, PDH = 7.5, dx = 192 - PDW / 2;
    door('y', Y1, dx, dx + PDW, 0, PDH, 'mid', 1); g.box(dx - 2.5, Y1, 0, dx + PDW + 2.5, Y1 + 4, SLAB, 'lo', 'D');
    const lv0 = H - T(6, 'E', 'D') - louverH(2); louver('y', Y1, 204, 216, lv0, 2); louver('x', X1, 122, 140, lv0, 2);
    const ux = 202, uy = 131, uh = T(6, 'D'); g.box(ux - 6, uy - 5, H, ux + 6, uy + 5, H + uh, 'mid', 'D'); g.ring('z', [ux, uy, H + uh], 3.2, 'lo', 'F'); }

  fence(YX0, YY0, YX1, YY1, 12, GT);
}
if (typeof module !== 'undefined') module.exports = { buildScene };
