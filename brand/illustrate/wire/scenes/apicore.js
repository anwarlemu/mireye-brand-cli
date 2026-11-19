// One API, object version: a core block on a board, eight agent modules (two per side) cabled into it.
// Cables are cylinders with a connector sleeve at both ends, sitting on the faces they plug into. Units are abstract.
function buildScene(g) {
  const { T, TR, TV, lin, SLAB, SLAB_E, EDGE, grid } = makeKit(g);

  // board
  const B0 = 0, B1 = 250, C = 125;
  g.box(B0, B0, -2 * SLAB_E, B1, B1, 0, 'lo', 'E');

  // core: pad, block, die on top
  const K0 = C - 34, K1 = C + 34, KH = 36, KP = 4;
  const D0 = C - 19, D1 = C + 19, DH = 5;
  // agents: cubes, two per side, on the port lines
  const AW = 18, AG = 46, PZ = 9;
  const P = [C - 17, C + 17];                              // port lines on every face
  const A0 = K1 + AG, A1 = A0 + AW, Z0 = K0 - AG - AW, Z1 = K0 - AG;   // near ring (front/right) and far ring (back/left)

  // faint grid, cut out of the core pad and the agent footprints
  const clip = [[K0 - KP, K1 + KP, K0 - KP, K1 + KP]];
  for (const p of P) { const h = AW / 2; clip.push([p - h, p + h, A0, A1], [A0, A1, p - h, p + h], [p - h, p + h, Z0, Z1], [Z0, Z1, p - h, p + h]); }
  grid(B0, B0, B1, B1, 25, clip, 12);

  g.box(K0 - KP, K0 - KP, 0, K1 + KP, K1 + KP, SLAB, 'lo', 'D');
  g.box(K0, K0, SLAB, K1, K1, KH, 'hi', 'E', { ghost: true });
  // bands on the two visible faces
  const ZB = KH - T(6, 'E', 'F');
  g.line('y', K1, K0, ZB, K1, ZB, 'lo', 'F'); g.line('x', K1, K0, ZB, K1, ZB, 'lo', 'F');
  // die: block, inset frame, inner square
  g.box(D0, D0, KH, D1, D1, KH + DH, 'lit', 'E');
  g.rect('z', KH + DH, D0 + EDGE, D1 - EDGE, D0 + EDGE, D1 - EDGE, 'mid', 'D');
  const I = 8; g.rect('z', KH + DH, C - I, C + I, C - I, C + I, 'lit', 'D');

  // agent modules: cube, inset panel on the top and on both visible faces
  const agent = (x0, y0) => { const x1 = x0 + AW, y1 = y0 + AW, z0 = 0, z1 = AW;
    g.box(x0, y0, z0, x1, y1, z1, 'mid', 'E');
    g.rect('z', z1, x0 + EDGE, x1 - EDGE, y0 + EDGE, y1 - EDGE, 'lo', 'D'); };
  for (const p of P) { agent(p - AW / 2, A0); agent(A0, p - AW / 2); agent(p - AW / 2, Z0); agent(Z0, p - AW / 2); }

  // cables: radius R, sleeve radius RS, sleeve length SL, from face to face
  const R = 1.8, RS = R + TR(2, 'D'), SL = 3.5;
  const cable = (axis, at, z, from, to) => { const len = to - from;
    const c0 = axis === 'y' ? [at, from, z] : [from, at, z], k = axis === 'y' ? 1 : 0;
    const cc = c0.slice(); cc[k] = from + SL; g.cyl(axis, cc, R, len - 2 * SL, 'lit', 'D');
    const s0 = c0.slice(), s1 = c0.slice(); s1[k] = to - SL;
    g.cyl(axis, s0, RS, SL, 'lit', 'D'); g.cyl(axis, s1, RS, SL, 'lit', 'D'); };
  for (const p of P) {
    cable('y', p, PZ, K1, A0); cable('x', p, PZ, K1, A0);
    cable('y', p, PZ, Z1, K0); cable('x', p, PZ, Z1, K0); }
}
if (typeof module !== 'undefined') module.exports = { buildScene };
