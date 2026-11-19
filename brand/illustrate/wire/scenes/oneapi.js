// One API hub: a central hall (the API) with agent units on pads, each wired into the hall by ground trunking.
// Four units on the front, four on the end, centred on the hall's faces. Units ~ feet. x along the front, y back-to-front, z up.
function buildScene(g) {
  const { T, span, hatch, range, lin, SLAB, EDGE, INSET, seams, shell, grid, plinth, louver, louverH } = makeKit(g);

  // base
  const PX0 = 0, PY0 = 0, PX1 = 240, PY1 = 206;
  plinth(PX0, PY0, PX1, PY1);

  // hall
  const HX0 = 50, HY0 = 30, HX1 = 174, HY1 = 136, HZ = 40;
  // units: pad, body and trunk sizes
  const PADW = 16, UW = 12, UH = 10, TW = T(6, 'D'), TH = 3;
  const FC = lin(HX0, HX1, 8).filter((_, i) => i % 2 === 1);           // 4 centres on the front face
  const RC = lin(HY0, HY1, 8).filter((_, i) => i % 2 === 1);           // 4 centres on the end face
  const FPY0 = 166, FPY1 = FPY0 + PADW, FBY0 = FPY0 + (PADW - UW) / 2; // front pads and unit bodies
  const RPX0 = 206, RPX1 = RPX0 + PADW, RBX0 = RPX0 + (PADW - UW) / 2; // end pads and unit bodies

  // ground grid on a 40 module, cut out of the hall, pads and trunk runs
  const clip = [[HX0, HX1, HY0, HY1]];
  for (const c of FC) clip.push([c - PADW / 2, c + PADW / 2, FPY0, FPY1], [c - TW / 2, c + TW / 2, HY1, FPY0]);
  for (const c of RC) clip.push([RPX0, RPX1, c - PADW / 2, c + PADW / 2], [HX1, RPX0, c - TW / 2, c + TW / 2]);
  grid(PX0, PY0, PX1, PY1, 40, clip, 10);

  shell(HX0, HY0, HX1, HY1, HZ, 'hall');
  const ZM = HZ / 2, ZT = HZ - T(6, 'E', 'F');
  // front face: seams every ~10.3, trunk entries and a louver band stop them
  const LVN = 4, LVH = louverH(LVN), LZ = ZM + 3;
  const FO = FC.map(c => ({ u0: c - TW / 2, u1: c + TW / 2, v0: 0, v1: TH }));
  const flv = FC.map(c => c - 8); for (const x of flv) FO.push({ u0: x, u1: x + 16, v0: LZ, v1: LZ + LVH });
  seams('y', HY1, HX0, HX1, 0, HZ, lin(HX0, HX1, 12).slice(1, -1), [ZM, ZT], FO);
  for (const x of flv) louver('y', HY1, x, x + 16, LZ, LVN);
  // end face
  const RO = RC.map(c => ({ u0: c - TW / 2, u1: c + TW / 2, v0: 0, v1: TH }));
  const rlv = RC.map(c => c - 8); for (const y of rlv) RO.push({ u0: y, u1: y + 16, v0: LZ, v1: LZ + LVH });
  seams('x', HX1, HY0, HY1, 0, HZ, lin(HY0, HY1, 10).slice(1, -1), [ZM, ZT], RO);
  for (const y of rlv) louver('x', HX1, y, y + 16, LZ, LVN);

  // roof: one unit centred on the hall
  const RX0 = (HX0 + HX1) / 2 - 18, RY0 = (HY0 + HY1) / 2 - 12;
  g.box(RX0, RY0, HZ, RX0 + 36, RY0 + 24, HZ + 8, 'mid', 'E');
  g.rect('y', RY0 + 24, RX0 + EDGE, RX0 + 36 - EDGE, HZ + EDGE, HZ + 8 - EDGE, 'lo', 'D');
  g.rect('x', RX0 + 36, RY0 + EDGE, RY0 + 24 - EDGE, HZ + EDGE, HZ + 8 - EDGE, 'lo', 'D');

  // units: pad, body with an inset panel on both visible faces, trunk from the hall face into the body
  const unit = (bx0, by0) => { const z0 = SLAB, z1 = SLAB + UH;
    g.box(bx0, by0, z0, bx0 + UW, by0 + UW, z1, 'lit', 'E');
    g.rect('y', by0 + UW, bx0 + EDGE, bx0 + UW - EDGE, z0 + EDGE, z1 - EDGE, 'lit', 'F');
    g.rect('x', bx0 + UW, by0 + EDGE, by0 + UW - EDGE, z0 + EDGE, z1 - EDGE, 'lit', 'F'); };
  for (const c of FC) { g.box(c - PADW / 2, FPY0, 0, c + PADW / 2, FPY1, SLAB, 'lo', 'D'); unit(c - UW / 2, FBY0);
    g.box(c - TW / 2, HY1, 0, c + TW / 2, FBY0, TH, 'mid', 'D'); }
  for (const c of RC) { g.box(RPX0, c - PADW / 2, 0, RPX1, c + PADW / 2, SLAB, 'lo', 'D'); unit(RBX0, c - UW / 2);
    g.box(HX1, c - TW / 2, 0, RBX0, c + TW / 2, TH, 'mid', 'D'); }
}
if (typeof module !== 'undefined') module.exports = { buildScene };
