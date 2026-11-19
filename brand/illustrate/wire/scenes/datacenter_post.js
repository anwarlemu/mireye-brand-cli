// Data center campus for the 4:5 poster (1080x1350 post, headline at the top, body and footer at the bottom).
// Same campus and composition as scenes/datacenter.js, drawn natively at S 1.67 so the whole site fits about 960 px wide
// with the same px weights (1.0 / 0.7 / 0.5) and the same px gaps (1, 2, 4, 6, 12) as every other illustration.
// Tokens grow in world units as S shrinks, so repeated details are thinned where they no longer fit:
// chiller panels 3 fins, fans as shrouds only, louvers 2 slats, dock doors 2 panel lines, genset louvers 1 slat and no end
// louver, radiators 3 fins, bushings 1 shed, office glazing 6 bays, no roof drains, no handles on leaves under 2*HO.
function buildScene(g) {
  const { S, LW, K, T, TV, TR, span, hatch, even, range, lin, SLAB, SLAB_E, INSET, EDGE, HO, PIL,
    seams, door, louverH, louver, shell, fenceRun, fence, bays, grid, plinth } = makeKit(g);
  const OV1 = T(1, 'E', 'D');   // a heavy body set back on its base or under its roof: 1 px clear
  const CR = (2 + LW.F) / (2 * Math.SQRT2 * K);   // thin cable / pipe radius: its two outlines (F) 2 px clear

  // ---------------- base: two equal plinth steps, ruler band, ground grid on the 30 ft structural module ----------------
  plinth(-66, -30, 446, 200, 16, 15);
  const BX0 = -54, BY0 = -18, BX1 = 434, BY1 = 188, GRID = 30;
  const G0 = 10, G1 = 80;
  const PAVE = [[0, 90, 136, 162], [-40, 0, 162, 180], [120, 270, 150, 168], [330, 430, -6, 126], [316, 412, 136, 176]];
  g.rect('z', 0, 0, 90, 136, 162, 'lo', 'F'); for (const x of [G0, G1]) g.seg([x, 162, 0], [x, BY1, 0], 'lo', 'F');
  bays(-40, 0, 4, 162, 180); bays(120, 270, 15, 150, 168);
  grid(BX0, BY0, BX1, BY1, GRID, PAVE);

  // ---------------- main hall: 10 bays of 30 on the front, 4 bays of 30 on the end ----------------
  const HX = 300, HY = 120, HZ = 40, BAY = 30;
  shell(0, 0, HX, HY, HZ, 'hall');
  // base seam, top seam; the mid seam sits a louver plus two 2 px gaps below the top seam, so the louvers fit between them
  const LVN = 2, LVH = louverH(LVN), LG = T(2, 'D', 'F');
  const ZB = T(4, 'E', 'F'), ZT = HZ - T(6, 'E', 'F'), ZM = ZT - (LVH + 2 * LG), LV0 = ZM + LG;
  const DS = T(2, 'F'), DSG = T(2, 'E', 'F');
  // front (y = HY)
  const FO = [];
  const DI = T(1, 'D'), DK0 = 3, DK1 = DK0 + 2 * DI + span(2, 4, 'D', 'F');
  const docks = [15, 45, 75].map(c => c - 7);
  for (const x of docks) FO.push({ u0: x, u1: x + 14, v0: DK0, v1: DK1 });
  const PDW = 5, PDH = 7.5, pdoors = [105, 195, 285].map(c => c - PDW / 2); for (const x of pdoors) FO.push({ u0: x, u1: x + PDW, v0: 0, v1: PDH }, { u0: x + PDW / 2 - 5 + 1e-3, u1: x + PDW / 2 + 5 - 1e-3, v0: 0, v1: PDH });
  const LVW = 18, lvx = [135, 165, 195, 225, 255].map(c => c - LVW / 2); for (const x of lvx) FO.push({ u0: x, u1: x + LVW, v0: LV0, v1: LV0 + LVH });
  const pil = range(BAY, HX - BAY, BAY); for (const x of pil) FO.push({ u0: x - PIL / 2, u1: x + PIL / 2, v0: 0, v1: HZ });
  const dsp = [DS + DSG, HX - DSG - DS]; for (const x of dsp) FO.push({ u0: x, u1: x + DS, v0: 0, v1: HZ });
  seams('y', HY, 0, HX, 0, HZ, range(10, HX - 10, 10), [ZB, ZM, ZT], FO);
  for (const x of pil) g.box(x - PIL / 2, HY, 0, x + PIL / 2, HY + PIL, HZ, 'hi', 'D');
  for (const x of dsp) g.box(x, HY, 0, x + DS, HY + DS, HZ, 'mid', 'F');
  for (const x of docks) { g.rect('y', HY, x, x + 14, DK0, DK1, 'lo', 'D'); g.rect('y', HY, x + DI, x + 14 - DI, DK0 + DI, DK1 - DI, 'mid', 'D');
    for (const z of hatch(DK0 + DI, 2, 4, 'D', 'F')) g.line('y', HY, x + DI, z, x + 14 - DI, z, 'lo', 'F');
    g.box(x + DI, HY, DK0 - SLAB, x + 14 - DI, HY + 6, DK0, 'mid', 'D'); }
  { const cz = 20.5; g.box(6, HY + PIL, cz, 84, HY + 12, cz + SLAB_E, 'mid', 'E'); for (const c of [15, 45, 75]) g.seg([c, HY + 12, cz + SLAB_E], [c, HY, ZT], 'lo', 'F'); }
  for (const x of pdoors) { door('y', HY, x, x + PDW, 0, PDH, 'mid'); g.box(x + PDW / 2 - 5, HY, 0, x + PDW / 2 + 5, HY + 4, SLAB, 'lo', 'D'); }
  for (const x of lvx) louver('y', HY, x, x + LVW, LV0, LVN);
  // end (x = HX)
  const RO = [];
  const rlv = [15, 45, 75].map(c => c - LVW / 2); for (const y of rlv) RO.push({ u0: y, u1: y + LVW, v0: LV0, v1: LV0 + LVH });
  const rdoor = 105 - PDW / 2; RO.push({ u0: rdoor, u1: rdoor + PDW, v0: 0, v1: PDH }, { u0: 100 + 1e-3, u1: 110 - 1e-3, v0: 0, v1: PDH });
  const BRZ = 13, BW = T(6, 'D'), BR0 = 85 - BW / 2, BR1 = 85 + BW / 2, TZ1 = BRZ + SLAB;
  const rpil = range(BAY, HY - BAY, BAY); for (const y of rpil) RO.push({ u0: y - PIL / 2, u1: y + PIL / 2, v0: 0, v1: HZ });
  seams('x', HX, 0, HY, 0, HZ, range(10, HY - 10, 10), [ZB, ZM, ZT], RO);
  for (const y of rpil) g.box(HX, y - PIL / 2, 0, HX + PIL, y + PIL / 2, HZ, 'hi', 'D');
  for (const y of rlv) louver('x', HX, y, y + LVW, LV0, LVN);
  door('x', HX, rdoor, rdoor + PDW, 0, PDH, 'mid'); g.box(HX, rdoor + PDW / 2 - 5, 0, HX + 4, rdoor + PDW / 2 + 5, SLAB, 'lo', 'D');

  // ---------------- roof: two symmetric rows of chillers, headers on the centre line ----------------
  const NP = 4, PWc = span(3, 2, 'D', 'F'), CW = NP * PWc, CD = 10, CH = 8, CG = 8, NC = 6;   // 4 coil panels, 3 fins each, 2 px apart
  const cx0 = (HX - (NC * CW + (NC - 1) * CG)) / 2, CX = lin(cx0, cx0 + (NC - 1) * (CW + CG), NC - 1);
  const RC = HY / 2, ROWS = [RC - 36 - CD, RC + 36];
  const FAN = 3.4, FANH = TV(2, 'D');
  for (const y0 of ROWS) for (const x0 of CX) {
    const z0 = HZ, z1 = HZ + CH; g.box(x0, y0, z0, x0 + CW, y0 + CD, z1, 'mid', 'E');
    for (const yy of [y0, y0 + CD]) for (let p = 0; p < NP; p++) { const px = x0 + p * PWc; g.rect('y', yy, px, px + PWc, z0 + EDGE, z1 - EDGE, 'lo', 'D'); for (const fx of hatch(px, 3, 2, 'D', 'F')) g.line('y', yy, fx, z0 + EDGE, fx, z1 - EDGE, 'faint', 'F'); }
    g.rect('x', x0 + CW, y0 + EDGE, y0 + CD - EDGE, z0 + EDGE, z1 - EDGE, 'lo', 'D'); g.line('x', x0 + CW, y0 + CD / 2, z0 + EDGE, y0 + CD / 2, z1 - EDGE, 'lo', 'F');
    for (let p = 0; p < NP; p++) g.cyl('z', [x0 + (p + 0.5) * PWc, y0 + CD / 2, z1], FAN, FANH, 'mid', 'D'); }
  const PR = 1.3, PB = 0.8, PY = (2 * PR * S + 4 + LW.E) / K / 2;
  const HDR = [RC - PY, RC + PY], ZH = HZ + PR, HXA = 10, HXB = HX - 10;
  for (const [y, row] of [[HDR[0], 0], [HDR[1], 1]]) { g.cyl('x', [HXA, y, ZH], PR, HXB - HXA, 'mid', 'E', { bands: range(BAY, HXB - HXA - BAY + 1e-6, 2 * BAY).map(v => v + 5) });
    for (const x0 of CX) { const bx = x0 + CW / 2; const FL = TV(2, 'D', 'F');
      if (row === 0) { const ya = ROWS[0] + CD; g.cyl('y', [bx, ya, ZH], PB, y - ya, 'mid', 'D', { bands: [FL], noEnd: true }); g.saddle('y', [bx, 0, ZH], PB, 'x', [0, y, ZH], PR, -1, 'mid', 'D'); }
      else { const yb = ROWS[1]; g.cyl('y', [bx, y, ZH], PB, yb - y, 'mid', 'D', { bands: [yb - y - FL], noStart: true }); g.saddle('y', [bx, 0, ZH], PB, 'x', [0, y, ZH], PR, 1, 'mid', 'D'); } } }
  { const hx = cx0 / 2 + 1, hy = RC - 30; g.box(hx - 3, hy - 3, HZ, hx + 3, hy + 3, HZ + T(4, 'D'), 'mid', 'D'); g.rect('z', HZ + T(4, 'D'), hx - 3 + INSET, hx + 3 - INSET, hy - 3 + INSET, hy + 3 - INSET, 'lo', 'F'); }
  { const ex = HX - cx0 / 2 - 1; for (const y of [RC - 30, RC + 30]) { g.box(ex - 3, y - 3, HZ, ex + 3, y + 3, HZ + SLAB, 'lo', 'D'); const zb = HZ + SLAB, BODY = 2.2;
      g.cyl('z', [ex, y, zb], BODY, TV(4, 'D'), 'mid', 'D'); g.cyl('z', [ex, y, zb + TV(4, 'D')], BODY + TR(1, 'D'), TV(2, 'D'), 'mid', 'D'); } }

  // ---------------- office block ----------------
  const OX0 = -48, OX1 = 0, OY0 = 72, OY1 = 142, OZ = 26;
  shell(OX0, OY0, OX1, OY1, OZ, 'office');
  const GM = T(6, 'E', 'D'), GTOP = OZ - GM, TR1 = 9, TR2 = TR1 + T(4, 'D');
  { const NB = 6, xa = OX0 + GM, xb = OX1 - GM, xs = lin(xa, xb, NB), dc = (xa + xb) / 2, d0 = xs[2], d1 = xs[4]; // 6 equal bays, the door is the middle two
    g.rect('y', OY1, xa, xb, 0, GTOP, 'mid', 'D');
    for (const x of xs.slice(1, -1)) { if (x > d0 - 1e-6 && x < d1 + 1e-6) { g.line('y', OY1, x, TR1, x, GTOP, 'mid', 'D'); } else g.line('y', OY1, x, 0, x, GTOP, 'mid', 'D'); }
    for (const z of [TR1, TR2]) g.line('y', OY1, xa, z, xb, z, 'mid', 'D');
    door('y', OY1, d0, d1, 0, TR1, 'hi'); g.line('y', OY1, dc, 0, dc, TR1 - INSET, 'mid', 'F');
    for (const s of [-1, 1]) { const u = dc + s * HO, v = TR1 * 0.48; g.line('y', OY1, u, v - 0.6, u, v + 0.6, 'mid', 'D'); }
    const ca = xs[1], cb = xs[5]; g.box(ca, OY1, TR2, cb, OY1 + 8, TR2 + SLAB_E, 'mid', 'E');   // cantilevered: at this scale posts would sit on the door frame
    g.box(ca - 2, OY1, 0, cb + 2, OY1 + 12, SLAB, 'lo', 'D'); }
  { const sm = T(4, 'E', 'D'), ya = HY + sm, yb = OY1 - sm;
    g.rect('x', OX1, ya, yb, 0, GTOP, 'mid', 'D'); for (const y of lin(ya, yb, 2).slice(1, -1)) g.line('x', OX1, y, 0, y, GTOP, 'mid', 'D'); for (const z of [TR1, TR2]) g.line('x', OX1, ya, z, yb, z, 'mid', 'D'); }
  { const ux = (OX0 + OX1) / 2, uy = (OY0 + OY1) / 2, uh = T(6, 'D'); g.box(ux - 6, uy - 6, OZ, ux + 6, uy + 6, OZ + uh, 'mid', 'D'); g.ring('z', [ux, uy, OZ + uh], 3.6, 'lo', 'F'); }

  // ---------------- cable trunking along the yard and the bridge into the hall ----------------
  const TX0 = 322.1, TX1 = TX0 + T(4, 'D'), TY0 = 0, TY1 = 120;
  g.box(TX0, TY0, BRZ, TX1, TY1, TZ1, 'mid', 'D'); g.box(HX, BR0, BRZ, TX0, BR1, TZ1, 'mid', 'D');
  for (const y of [60 - 64 / 3, 60, 60 + 64 / 3, 60 - 128 / 3, 60 + 128 / 3]) g.seg([(TX0 + TX1) / 2, y, 0], [(TX0 + TX1) / 2, y, BRZ], 'lo', 'D');

  // ---------------- generator yard: five gensets centred in the yard ----------------
  const YX0 = 330, YY0 = -6, YX1 = 430, YY1 = 126;
  // five gensets centred in the yard; no silencer at this scale (it would sit on the
  // skid lines of the genset behind), a plain exhaust stack on the roof instead; cables to the trunking as single lines
  const GY = [6, 30, 54, 78, 102], GX0 = 340, GX1 = 384;   // 2 further from the yard fence than the reference, so the roof edge clears its rail
  const SKID = T(4, 'E'), EI = T(2, 'E'), PM = OV1, ENC = 11.5;   // pad 1 px clear of the skid; enclosure height keeps its top edges clear of the grid lines behind
  // cables fan out from the yard centre (y 60) 25 apart, so each stays clear of the ground grid lines behind it
  GY.forEach((y0, i) => {
    g.box(GX0 - PM, y0 - PM, 0, GX1 + PM, y0 + 12 + PM, SLAB, 'lo', 'D');
    const zs = SLAB, zk = zs + SKID, ex0 = GX0 + EI, ex1 = GX1 - EI, ey0 = y0 + EI, ey1 = y0 + 12 - EI, zt = zk + ENC;
    g.box(GX0, y0, zs, GX1, y0 + 12, zk, 'mid', 'E'); g.box(ex0, ey0, zk, ex1, ey1, zt, 'hi', 'E', { ghost: true });
    const DG = T(6, 'D'), dw = (ex1 - ex0 - 2 * EDGE - 2 * DG) / 3; for (let i = 0; i < 3; i++) { const x = ex0 + EDGE + i * (dw + DG); door('y', ey1, x, x + dw, zk + EDGE, zt - EDGE, 'mid', 1); }
    const yc = (ey0 + ey1) / 2, stx = ex0 + 8, SKR = 1.4, CAPH = TV(2, 'F');   // stack with a cap 1 px proud, as in the reference
    g.cyl('z', [stx, yc, zt], SKR, 8, 'mid', 'D'); g.cyl('z', [stx, yc, zt + 8], SKR + TR(1, 'D', 'F'), CAPH, 'mid', 'F');
    g.cyl('x', [TX1, 60 + (i - 2) * 25, (BRZ + TZ1) / 2], CR, ex0 - TX1, 'lo', 'F');
  });
  const FH = 8;
  fence(YX0, YY0, YX1, YY1, 0, [(GX0 + GX1) / 2 - 9, (GX0 + GX1) / 2 + 9]);   // gate centred on the gensets

  // ---------------- substation: two transformers and switchgear, equal gaps across the pad ----------------
  const SX0 = 316, SX1 = 412, SY0 = 136, SY1 = 176;
  g.box(SX0, SY0, 0, SX1, SY1, SLAB, 'lo', 'D');
  // radiators 2*EDGE deep so their top edge keeps 2 px clear of the tank's top edge; base 1 px clear all round
  const XW = 16, RW = 2 * EDGE, XD = 14, RN = 4, RL = span(RN, 2, 'D', 'F'), WT = XW + 2 * RW + 2 * OV1, SGW = 20, gapS = (SX1 - SX0 - 2 * WT - SGW) / 4;
  const xfmr = (x0, y0) => { const zb = SLAB, zt0 = zb + T(2, 'D'), zt1 = zt0 + 9;
    g.box(x0 - RW - OV1, y0 - OV1, zb, x0 + XW + RW + OV1, y0 + XD + OV1, zt0, 'hi', 'D'); g.box(x0, y0, zt0, x0 + XW, y0 + XD, zt1, 'lit', 'E');
    const r0 = zt0 + EDGE, r1 = zt1 - EDGE, ya = y0 + (XD - RL) / 2, yb = ya + RL;
    for (const side of [0, 1]) { const xa = side ? x0 + XW : x0 - RW, xb = side ? x0 + XW + RW : x0, xo = side ? xb : xa;
      g.box(xa, ya, r0, xb, yb, r1, 'hi', 'D');
      for (const y of hatch(ya, RN, 2, 'D', 'F')) { g.seg([xo, y, r0], [xo, y, r1], 'hi', 'F'); g.seg([xa, y, r1], [xb, y, r1], 'hi', 'F'); } }
    const sh = TV(1, 'F'), cg = TV(2, 'F');
    for (const x of [x0 + XW / 4, x0 + XW / 2, x0 + 3 * XW / 4]) { const y = y0 + XD - 4; let z = zt1; const st = [];
      st.push([z, 0.5]); z += cg; st.push([z, 1.05]); z += sh; st.push([z, 0.5]); z += cg; st.push([z, 0.75]); z += sh; st.push([z]);
      for (let k = 0; k < st.length - 1; k++) g.cyl('z', [x, y, st[k][0]], st[k][1], st[k + 1][0] - st[k][0], 'lit', 'F'); }
    const CBD = 2.5, CBZ = zt0 + CBD - OV1, cb0 = x0 + XW / 2 - 4, cb1 = x0 + XW / 2 + 4; g.box(cb0, y0 + XD, CBZ, cb1, y0 + XD + CBD, zt1 - 2.5, 'hi', 'D'); g.rect('y', y0 + XD + CBD, cb0 + INSET, cb1 - INSET, CBZ + INSET, zt1 - 2.5 - INSET, 'mid', 'F'); };
  const TYB = SY0 + (SY1 - SY0 - (XD + 3.5)) / 2 + 2.5;
  const XA = SX0 + gapS + RW + OV1, XB = XA + WT + gapS; xfmr(XA, TYB); xfmr(XB, TYB);
  { const OV = OV1, sg0 = XB + XW + RW + OV1 + gapS, sg1 = sg0 + SGW, sy0 = (SY0 + SY1) / 2 - 7 + 1.5, sy1 = sy0 + 14, zb = SLAB, zt = zb + 9.7;
    g.box(sg0 + OV, sy0 + OV, zb, sg1 - OV, sy1 - OV, zt, 'hi', 'E'); g.box(sg0, sy0, zt, sg1, sy1, zt + SLAB, 'hi', 'D');
    const DG = T(2, 'D'), dw = (SGW - 2 * OV - 2 * EDGE - DG) / 2; for (let i = 0; i < 2; i++) { const x = sg0 + OV + EDGE + i * (dw + DG); door('y', sy1 - OV, x, x + dw, zb + EDGE, zt - OV - T(2, 'D'), 'mid'); } }

  // ---------------- bulk fuel tank: everything mirrored about its centre ----------------
  { const tx = 410.5, ty = 60, TL = 54, TRAD = 5.4, ty0 = ty - TL / 2, BUND = T(4, 'D'), SAD = T(2, 'D'), BW2 = 9;
    g.box(tx - BW2, ty0 - 6, 0, tx + BW2, ty0 + TL + 6, BUND, 'lo', 'D');
    const sw = 2.828, saz = BUND + SAD, taz = saz + Math.sqrt(TRAD * TRAD - sw * sw);
    for (const y of [ty - 22, ty, ty + 22]) { g.box(tx - 5.6, y - SAD / 2, BUND, tx + 5.6, y + SAD / 2, saz, 'mid', 'D'); for (const x of [tx - sw, tx + sw]) g.seg([x, y - SAD / 2, saz], [x, y + SAD / 2, saz], 'mid', 'D'); }
    g.cyl('y', [tx, ty0, taz], TRAD, TL, 'hi', 'E', { bands: [TL / 2 - 11, TL / 2 + 11], ghost: true });
    const ztop = taz + TRAD;
    g.cyl('z', [tx, ty, ztop - 0.12], 1.1, 1.1, 'mid', 'D', { noStart: true }); g.saddle('z', [tx, ty, 0], 1.1, 'y', [tx, 0, taz], TRAD, 1, 'mid', 'D');
    const lw = T(4, 'F'), ly = ty0 + TL + 1.5; for (const x of [tx - lw / 2, tx + lw / 2]) g.seg([x, ly, BUND], [x, ly, ztop], 'mid', 'F');
    for (const z of even(BUND, ztop, 2, 'F', 'F')) g.seg([tx - lw / 2, ly, z], [tx + lw / 2, ly, z], 'lo', 'F'); g.seg([tx - lw / 2, ly, ztop], [tx + lw / 2, ly, ztop], 'mid', 'F');
    g.cyl('x', [GX1 + PM, ty, 3.2], CR, tx - BW2 - GX1 - PM, 'lo', 'F'); }

  // ---------------- guard booth and barrier ----------------
  { const bx0 = 88, bx1 = 100, by0 = 163, by1 = 176, zr = 13, OV = OV1;
    g.box(bx0, by0, 0, bx1, by1, SLAB, 'lo', 'D'); g.box(bx0 + OV, by0 + OV, SLAB, bx1 - OV, by1 - OV, zr, 'hi', 'E', { ghost: true }); g.box(bx0, by0, zr, bx1, by1, zr + SLAB_E, 'mid', 'E');
    const wt = zr - OV - EDGE, wb = SLAB + EDGE;
    g.rect('y', by1 - OV, bx0 + OV + EDGE, bx1 - OV - EDGE, wb, wt, 'mid', 'D'); g.line('y', by1 - OV, (bx0 + bx1) / 2, wb, (bx0 + bx1) / 2, wt, 'lo', 'F');
    const dc = (by0 + by1) / 2; door('x', bx1 - OV, dc - 2.5, dc + 2.5, SLAB, wt, 'mid'); }
  { const px = G1, py = 172, a0 = G0 + 6, pw = T(2, 'D') / 2; g.box(px - pw, py - pw, 0, px + pw, py + pw, 5, 'mid', 'D'); const xs = lin(a0, px - pw, 12);
    for (let i = 0; i < 12; i++) g.seg([xs[i], py, 3.9], [xs[i + 1], py, 3.9], i % 2 ? 'faint' : 'hi', 'E'); g.seg([a0 + 3, py, 0], [a0 + 3, py, 3.9], 'lo', 'D'); }

  // ---------------- campus perimeter fence with the entry gate on the lanes ----------------
  { fenceRun([BX0, BY0], [BX1, BY0], 12); fenceRun([BX1, BY0], [BX1, BY1], 12); fenceRun([BX0, BY1], [BX0, BY0], 12); fenceRun([BX0, BY1], [G0, BY1], 12); fenceRun([G1, BY1], [BX1, BY1], 12);
    for (const x of [G0, G1]) g.seg([x, BY1, 0], [x, BY1, FH], 'mid', 'D'); g.seg([G0, BY1, 0], [G1, BY1, 0], 'faint', 'F'); }

}
if (typeof module !== 'undefined') module.exports = { buildScene, S: 1.67 };
