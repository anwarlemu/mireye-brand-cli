// Solar farm on sloped ground (Mireye 4:5 post). Units ~ feet. x along the rows, y back-to-front, z up.
// Three graded terraces step up toward the back. Fixed-tilt tables face the viewer in two blocks either side of a
// central aisle, an inverter skid sits in the aisle on every terrace, an access track runs along the front terrace.
// Tilted tables are drawn as lines (no occluder), so rows keep clear of every line behind them in screen space
// (screen position depends only on x−z and y−z).
function buildScene(g) {
  const { S, LW, K, T, TV, TR, span, hatch, even, range, lin, SLAB, SLAB_E, INSET, EDGE, HO, PIL,
    seams, door, louverH, louver, shell, fenceRun, fence, bays, grid, plinth } = makeKit(g);

  const W = 250, D = 160;
  plinth(0, 0, W, D);
  // terraces: back (y 0..52) top z 12, middle (y 52..104) top z 6, front stays at z 0
  g.box(0, 0, 0, W, 104, 6, 'lo', 'E');
  g.box(0, 0, 6, W, 52, 12, 'lo', 'E');
  // fixed-tilt tables: high edge at the back, low edge at the front
  const BLK = [[12, 110], [140, 238]], RW = 8, ZH = 8, ZL = 4, MOD = 7;
  // rows: the first sits 4 px clear of the terrace's back line, then 6 px clear between rows (screen gaps along y−z)
  const G0 = T(4, 'E', 'D'), PITCH = RW + ZH - ZL + T(6, 'D');
  const rows = (yb, n) => range(0, n - 1, 1).map(k => yb + ZH + G0 + k * PITCH);
  const TER = [{ z: 12, rows: rows(0, 3) }, { z: 6, rows: rows(52, 3) }, { z: 0, rows: rows(104, 2) }];
  const table = (x0, x1, y0, zt) => {
    const y1 = y0 + RW, zh = zt + ZH, zl = zt + ZL, m = (zl - zh) / RW;
    g.poly([[x0, y0, zh], [x1, y0, zh], [x1, y1, zl], [x0, y1, zl]], 'hi', 'D', true);
    for (let x = x0 + MOD; x < x1 - 1e-6; x += MOD) g.seg([x, y0, zh], [x, y1, zl], 'lo', 'F');
    g.seg([x0, y0 + RW / 2, (zh + zl) / 2], [x1, y0 + RW / 2, (zh + zl) / 2], 'lo', 'F');
    // front posts: visible from the ground up to where they pass behind the low edge (meets it at a module centre)
    const yp = y1 - 1, zv = zl - m * (y1 - yp) - (1 - m) * (y1 - yp);
    for (const k of [1, 4, 9, 12]) { const x = x0 + MOD * k + MOD / 2 - (y1 - yp); g.seg([x, yp, zt], [x, yp, zv], 'mid', 'D'); }
  };
  for (const t of TER) for (const y of t.rows) for (const [a, b] of BLK) table(a, b, y, t.z);

  // inverter skids in the aisle, centred on each terrace's rows
  const skid = (yc, zt) => {
    const xc = 125, pw = 5, pd = 6, cw = 3.5, cd = 4.5, ch = 8, zb = zt + SLAB;
    g.box(xc - pw, yc - pd, zt, xc + pw, yc + pd, zb, 'lo', 'D');
    g.box(xc - cw, yc - cd, zb, xc + cw, yc + cd, zb + ch, 'mid', 'E');
    door('y', yc + cd, xc - cw + EDGE, xc + cw - EDGE, zb, zb + ch - T(4, 'E', 'D'), 'mid', 0);
  };
  for (const t of TER) skid((t.rows[0] + t.rows[t.rows.length - 1] + RW) / 2, t.z);

  // access track along the front terrace, closed outline
  g.rect('z', 0, 0, W, 144, 152, 'lo', 'F');
}
if (typeof module !== 'undefined') module.exports = { buildScene };
