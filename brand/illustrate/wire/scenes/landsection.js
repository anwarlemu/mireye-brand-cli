// Land section: a square parcel cut out of the ground like a survey sample, for a 4:5 post (1080x1350) in the poster
// layout (headline at the top, body and footer at the bottom), so the block sits in the band between them.
// Top: parcel boundary with corner markers, setback line, buildable grid, access road and gate.
// Cut faces: soil and rock layers, depth ruler on both sides of the front corner. Units ~ feet.
function buildScene(g) {
  const { T, lin, range, SLAB, PIL, RB, EDGE } = makeKit(g);

  // block: W x D plan, DZ deep; about 846 x 853 px, the band between the poster headline and body
  const W = 228, D = 228, DZ = 175;
  g.box(0, 0, -DZ, W, D, 0, 'hi', 'E');

  // ---------------- cut faces: strata ----------------
  // perimeter parameter s runs along the left face (y = D, x 0..W) then the right face (x = W, y D..0)
  const P = W + D, at = s => s <= W ? [s, D] : [W, D - (s - W)];
  // depth ruler: a band RB in from the front corner on both faces, ticks every 10
  const R0 = W - RB, R1 = W + RB;                       // s positions of the two ruler lines
  g.seg([R0, D, 0], [R0, D, -DZ], 'lo', 'D'); g.seg([W, D - RB, 0], [W, D - RB, -DZ], 'lo', 'D');
  for (const z of range(10, DZ - 10, 10)) { g.seg([R0, D, -z], [W, D, -z], 'lo', 'F'); g.seg([W, D, -z], [W, D - RB, -z], 'lo', 'F'); }
  // layer boundaries: mean depth, gentle undulation (amplitude, waves across the visible perimeter, phase)
  const TOP = T(6, 'E', 'D');                           // topsoil band, the same 6 px as the parapet height
  const LAYERS = [[TOP, 0, 0, 0], [18, 2, 1.5, 0.6], [44, 3, 1, 2.2], [76, 4, 1.5, 4.1], [112, 3, 1, 1.0], [140, 4.5, 1.25, 3.0]];
  const zOf = (L, s) => -(L[0] + L[1] * Math.sin(2 * Math.PI * L[2] * s / P + L[3]));
  const STEP_S = 3;                                     // sampling step along the face (world units)
  for (const L of LAYERS) {
    for (const [a, b] of [[0, R0], [R1, P]]) {
      const n = Math.max(1, Math.round((b - a) / STEP_S)), pts = lin(a, b, n).map(s => { const [x, y] = at(s); return [x, y, zOf(L, s)]; });
      for (let i = 0; i < n; i++) g.seg(pts[i], pts[i + 1], 'lo', 'D');
    }
  }

  // textures, one per zone and sparse: gravel as small pebbles in a staggered grid, bedrock as two jointed courses
  const faces = [[0, R0], [R1, P]], M = T(4, 'D', 'F');   // keep textures 4 px clear of the ruler and the face edges
  const inFace = s => faces.some(([a, b]) => s > a + M && s < b - M);
  const ptOn = (s, z) => { const [x, y] = at(s); return [x, y, z]; };
  { const top = LAYERS[3], bot = LAYERS[4], PR = 1.2, DX = 14, DZp = 10;
    for (let row = 0; row < 20; row++) { const off = row % 2 ? DX / 2 : 0;
      for (let s = off; s < P; s += DX) { if (!inFace(s) || Math.abs(s - W) < DX / 2) continue; const z = zOf(top, s) - 6 - row * DZp; if (z - PR - 3 < zOf(bot, s)) continue;
        const [x, y] = at(s); g.ring(s <= W ? 'y' : 'x', [x, y, z], PR, 'lo', 'F'); } } }
  { const rock = LAYERS[5], J = 19;
    const zb = s => -((rock[0] + DZ) / 2 + 2 * Math.sin(2 * Math.PI * s / P + 5.0));   // bedding line halfway down the rock
    for (const [a, b] of faces) { const n = Math.max(1, Math.round((b - a) / STEP_S)), pts = lin(a, b, n).map(s => ptOn(s, zb(s))); for (let i = 0; i < n; i++) g.seg(pts[i], pts[i + 1], 'lo', 'F'); }
    for (const [a, b] of faces) { const n = Math.round((b - a) / J);
      lin(a, b, n).slice(1, -1).forEach((s, i) => { g.seg(ptOn(s, zOf(rock, s)), ptOn(s, zb(s)), 'lo', 'F'); });
      lin(a, b, n).slice(0, -1).forEach((s0, i, arr) => { const s = s0 + (b - a) / n / 2; g.seg(ptOn(s, zb(s)), ptOn(s, -DZ), 'lo', 'F'); }); } }

  // ---------------- top: parcel, setback, buildable grid, access road, gate ----------------
  const PB = 12, SB = PB + 18;                          // parcel boundary and setback inset from the block edge
  g.rect('z', 0, PB, W - PB, PB, D - PB, 'mid', 'D');
  g.rect('z', 0, SB, W - SB, SB, D - SB, 'faint', 'F');
  const RW = 24, rc = W / 2, ra = rc - RW / 2, rb = rc + RW / 2;   // road centred on the left face, running in to the setback
  const xs = lin(SB, W - SB, 6), ys = lin(SB, D - SB, 6);
  for (const x of xs.slice(1, -1)) g.seg([x, SB, 0], [x, D - SB, 0], 'faint', 'F');
  for (const y of ys.slice(1, -1)) g.seg([SB, y, 0], [W - SB, y, 0], 'faint', 'F');
  for (const x of [ra, rb]) g.seg([x, D, 0], [x, D - SB, 0], 'lo', 'F');
  // gate on the parcel boundary: two posts on the road edges and a top rail
  const GH = 6; for (const x of [ra, rb]) g.box(x - PIL / 2, D - PB - PIL / 2, 0, x + PIL / 2, D - PB + PIL / 2, GH, 'mid', 'D');
  g.seg([ra + PIL / 2, D - PB, GH], [rb - PIL / 2, D - PB, GH], 'mid', 'D');
  // corner markers (survey monuments) on the parcel corners
  const MH = 3; for (const [x, y] of [[PB, PB], [W - PB, PB], [W - PB, D - PB], [PB, D - PB]]) g.box(x - PIL / 2, y - PIL / 2, 0, x + PIL / 2, y + PIL / 2, MH, 'mid', 'D');
}
if (typeof module !== 'undefined') module.exports = { buildScene };
