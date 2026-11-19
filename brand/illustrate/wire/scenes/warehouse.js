// Logistics warehouse (Mireye 4:5 post). Units ~ feet. x along the long front, y back-to-front, z up.
// A long low shell with a row of dock doors on the front, trailers backed onto a mirrored set of docks, a truck court
// with lanes out to the gate, a glazed office on the left end with a car park in front of it, skylights on the roof.
function buildScene(g) {
  const { S, LW, K, T, TV, TR, span, hatch, even, range, lin, SLAB, SLAB_E, INSET, EDGE, HO, PIL,
    seams, door, louverH, louver, shell, fenceRun, fence, bays, grid, plinth } = makeKit(g);

  plinth(0, 0, 260, 150);
  const HX0 = 34, HX1 = 224, HY0 = 10, HY1 = 76, HZ = 24, XC = (HX0 + HX1) / 2;
  const OX0 = 8, OX1 = HX0, OY0 = 50, OY1 = 92, OZ = 18;

  // ---------------- paving: truck court with lanes to the gate, car park in front of the office ----------------
  const CX0 = OX1 + 4, CY1 = 126, GL = [XC - 8, XC + 8];
  g.rect('z', 0, CX0, HX1, HY1, CY1, 'lo', 'F');
  for (const x of GL) g.seg([x, CY1, 0], [x, 150, 0], 'lo', 'F');
  bays(6, OX1, 7, 104, 113); bays(6, OX1, 7, 113, 122);

  // ---------------- warehouse shell ----------------
  shell(HX0, HY0, HX1, HY1, HZ, 'hall');
  const ZT = HZ - T(6, 'E', 'F');
  // docks: 14 doors at a 12 ft pitch centred on the front, panels sized by their hatch
  const ND = 14, DP = 12, DW = DP - 2 * T(4, 'D', 'F'), DI = T(1, 'D'), DK0 = 4, DK1 = DK0 + 2 * DI + span(2, 4, 'D', 'F');
  const DC = range(0, ND - 1, 1).map(i => XC + (i - (ND - 1) / 2) * DP);
  // tilt-up panel joints midway between the docks, 4 px clear of the door frames
  const FO = DC.map(c => ({ u0: c - DW / 2, u1: c + DW / 2, v0: DK0, v1: DK1 }));
  seams('y', HY1, HX0, HX1, 0, HZ, DC.slice(0, -1).map(c => c + DP / 2), [ZT], FO);
  for (const c of DC) { const x0 = c - DW / 2, x1 = c + DW / 2;
    g.rect('y', HY1, x0, x1, DK0, DK1, 'lo', 'D'); g.rect('y', HY1, x0 + DI, x1 - DI, DK0 + DI, DK1 - DI, 'mid', 'D');
    for (const z of hatch(DK0 + DI, 2, 4, 'D', 'F')) g.line('y', HY1, x0 + DI, z, x1 - DI, z, 'lo', 'F'); }

  // trailers backed flush onto a mirrored set of docks (they cover the door), 2 px clear of the panel joints
  const TRL = [1, 4, 5, 8, 9, 12], HW = DP / 2 - T(2, 'E', 'F'), TL = 34, TZ = DK0 + 9.5;
  for (const i of TRL) { const c = DC[i], y0 = HY1, y1 = y0 + TL;
    g.box(c - HW, y0, DK0, c + HW, y1, TZ, 'mid', 'E');
    for (const y of [y0 + 5, y0 + 9]) g.cyl('x', [c - 3.5, y, 1.6], 1.6, 7, 'lo', 'D');
    for (const x of [c - 3, c + 3]) g.seg([x, y1 - 6, 0], [x, y1 - 6, DK0], 'lo', 'D'); }

  // end wall: a man door with its step, a louver above it
  { const yc = (HY0 + HY1) / 2, PDW = 5, PDH = 7.5; door('x', HX1, yc - PDW / 2, yc + PDW / 2, 0, PDH, 'mid', 1); g.box(HX1, yc - 5, 0, HX1 + 4, yc + 5, SLAB, 'lo', 'D');
    louver('x', HX1, yc - 10, yc + 10, ZT - T(6, 'E', 'F') - louverH(3), 3); }

  // ---------------- roof: two mirrored rows of skylights ----------------
  const RC = (HY0 + HY1) / 2;
  for (const yc of [RC - 12, RC + 12]) for (const xc of range(0, 6, 1).map(k => XC + (k - 3) * 24)) g.box(xc - 5, yc - 2, HZ, xc + 5, yc + 2, HZ + SLAB, 'lo', 'D');

  // ---------------- office on the left end, standing proud of the front ----------------
  shell(OX0, OY0, OX1, OY1, OZ, 'office');
  const GM = T(6, 'E', 'D'), GTOP = OZ - GM, TR1 = 8, TR2 = TR1 + T(4, 'D');
  { const xa = OX0 + GM, xb = OX1 - GM, xs = lin(xa, xb, 6), d0 = xs[2], d1 = xs[4];
    g.rect('y', OY1, xa, xb, 0, GTOP, 'mid', 'D');
    for (const x of xs.slice(1, -1)) { if (x > d0 + 1e-6 && x < d1 - 1e-6) g.line('y', OY1, x, TR1, x, GTOP, 'mid', 'D'); else g.line('y', OY1, x, 0, x, GTOP, 'mid', 'D'); }
    for (const z of [TR1, TR2]) g.line('y', OY1, xa, z, xb, z, 'mid', 'D');
    door('y', OY1, d0, d1, 0, TR1, 'hi'); g.box(xs[1], OY1, 0, xs[5], OY1 + 4, SLAB, 'lo', 'D'); }
  { const sm = T(4, 'E', 'D'), ya = HY1 + sm, yb = OY1 - sm;
    g.rect('x', OX1, ya, yb, 0, GTOP, 'mid', 'D'); for (const y of lin(ya, yb, 2).slice(1, -1)) g.line('x', OX1, y, 0, y, GTOP, 'mid', 'D'); for (const z of [TR1, TR2]) g.line('x', OX1, ya, z, yb, z, 'mid', 'D'); }
}
if (typeof module !== 'undefined') module.exports = { buildScene };
