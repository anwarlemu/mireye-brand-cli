import { num } from '../image/type.js';

// Quick isometric line drawings: thin strokes in one ink, faces in the ground's color so nearer things hide what is
// behind them, and one hatched parcel picked out in the accent. A scene is a short text, one thing a line, in cells:
//
//   plate W D          the ground: a layered slab W by D
//   box x y w d h      any block
//   house x y [k]      a house with a recessed roof, a door and an annex
//   solar x y length   a tilted row of panels on legs
//   rack x y length    a row of server racks
//   pole x y           a utility pole; wire x1 y1 x2 y2 strings a line
//   parcel x y w d     a parcel on the plate; add "fill" to pick it out
//   cube x y           a small block (a tool, a unit)
//   pipe x1 y1 x2 y2   a pipe on the ground between two points
//   lot x y w d        a lot outline on the plate
//
// Presets write such a scene, so any preset can be printed as text, edited and drawn again (--spec).

export const ISO_PRESETS = ['residential', 'solar', 'datacenter', 'warehouse', 'hub', 'parcels'] as const;
export type IsoPreset = (typeof ISO_PRESETS)[number];
export type IsoOptions = { scene: IsoPreset; cols: number; rows: number; count: number; highlight: boolean };

const r1 = (n: number) => Math.round(n * 10) / 10;

/** A preset written out as a scene. */
export function isoPreset(o: IsoOptions): string {
	const W = Math.max(4, Math.round(o.cols));
	const D = Math.max(3, Math.round(o.rows));
	const n = Math.max(1, Math.round(o.count));
	const out: string[] = [`plate ${W} ${D}`];
	switch (o.scene) {
		case 'residential': {
			const lots = Math.max(2, n + 1);
			const lw = W / lots;
			const gap = Math.floor(lots / 2);
			for (let i = 0; i < lots; i++) {
				const x = r1(i * lw);
				out.push(`lot ${x} ${r1(D * 0.38)} ${r1(lw)} ${r1(D * 0.62)}`);
				if (i === gap) {
					if (o.highlight) out.push(`parcel ${r1(x + 0.3)} ${r1(D * 0.42)} ${r1(lw - 0.6)} ${r1(D * 0.5)} fill`);
					continue;
				}
				const k = Math.min(1.2, (lw * 0.8) / 2.3);
				out.push(`house ${r1(x + lw * 0.1)} ${r1(D * 0.38 + (D * 0.62 - 1.6 * k) / 2)} ${r1(k)}`);
			}
			const poles = Math.max(2, Math.round(W / 4));
			for (let i = 0; i <= poles; i++) out.push(`pole ${r1((W * i) / poles)} 0.4`);
			for (let i = 0; i < poles; i++) out.push(`wire ${r1((W * i) / poles)} 0.4 ${r1((W * (i + 1)) / poles)} 0.4`);
			break;
		}
		case 'solar': {
			const rows = Math.max(1, n);
			const len = r1(W * 0.42);
			for (let i = 0; i < rows; i++) {
				const y = r1(0.6 + (i * (D - 1.4)) / Math.max(1, rows - 1));
				out.push(`solar 0.6 ${y} ${len}`);
				out.push(`solar ${r1(W - len - 0.6)} ${y} ${len}`);
			}
			out.push(`box ${r1(W / 2 - 0.4)} ${r1(D / 2 - 0.4)} 0.8 0.8 0.8`);
			if (o.highlight) out.push(`parcel ${r1(W * 0.52)} ${r1(D * 0.08)} ${r1(W * 0.4)} ${r1(D * 0.84)} fill`);
			break;
		}
		case 'datacenter': {
			const racks = Math.max(1, n);
			out.push(`lot 0.5 0.5 ${r1(W * 0.66)} ${r1(D - 1)}`);
			for (let i = 0; i < racks; i++) out.push(`rack 1 ${r1(1 + (i * (D - 2.4)) / Math.max(1, racks - 1))} ${r1(W * 0.56)}`);
			for (let i = 0; i < 3; i++) out.push(`cube ${r1(W * 0.76)} ${r1(1 + i * ((D - 2) / 2))}`);
			if (o.highlight) out.push(`parcel ${r1(W * 0.72)} 0.4 ${r1(W * 0.24)} ${r1(D - 0.8)} fill`);
			break;
		}
		case 'warehouse': {
			const sheds = Math.max(1, Math.min(4, n));
			for (let i = 0; i < sheds; i++) {
				const y = r1(0.6 + (i * (D - 1)) / sheds);
				out.push(`box 0.6 ${y} ${r1(W * 0.6)} ${r1((D - 1) / sheds - 0.6)} 1.1`);
				for (let t = 0; t < 3; t++) out.push(`box ${r1(W * 0.68)} ${r1(y + t * 0.5)} 1.2 0.35 0.4`);
			}
			if (o.highlight) out.push(`parcel ${r1(W * 0.66)} 0.4 ${r1(W * 0.3)} ${r1(D - 0.8)} fill`);
			break;
		}
		case 'hub': {
			const c = { x: W / 2, y: D / 2 };
			out.push(`box ${r1(c.x - 1.5)} ${r1(c.y - 1.5)} 3 3 1.6`);
			const k = Math.max(2, n);
			for (let i = 0; i < k; i++) {
				const a = (i / k) * Math.PI * 2 + Math.PI / k;
				const tx = c.x + Math.cos(a) * (W / 2 - 1.2);
				const ty = c.y + Math.sin(a) * (D / 2 - 1.2);
				out.push(`pipe ${r1(c.x)} ${r1(c.y)} ${r1(tx)} ${r1(ty)}`);
				out.push(`cube ${r1(tx - 0.5)} ${r1(ty - 0.5)}`);
			}
			break;
		}
		case 'parcels': {
			const cols = Math.max(2, Math.ceil(Math.sqrt(n * 1.6)));
			const rowsN = Math.max(1, Math.ceil(n / cols));
			const lw = (W - 1) / cols;
			const ld = (D - 1) / rowsN;
			let k = 0;
			for (let r = 0; r < rowsN; r++)
				for (let c = 0; c < cols && k < n; c++, k++)
					out.push(`parcel ${r1(0.5 + c * lw + 0.15)} ${r1(0.5 + r * ld + 0.15)} ${r1(lw - 0.3)} ${r1(ld - 0.3)}${o.highlight && k === Math.floor(n / 2) ? ' fill' : ''}`);
			break;
		}
	}
	return out.join('\n');
}

type P3 = [number, number, number];
const COS30 = Math.cos(Math.PI / 6);
const proj = ([x, y, z]: P3): [number, number] => [(x - y) * COS30, (x + y) * 0.5 - z];

type Op =
	| { kind: 'poly'; pts: P3[]; fill: 'bg' | 'accent' | 'none'; hatch?: boolean; depth: number; nodes?: boolean }
	| { kind: 'line'; pts: P3[]; depth: number; curve?: boolean; width?: number }
	| { kind: 'ring'; at: P3; r: number; depth: number };

function box(ops: Op[], x: number, y: number, z: number, w: number, d: number, h: number, depth = x + y + w + d) {
	const t = z + h;
	ops.push({ kind: 'poly', pts: [[x + w, y, z], [x + w, y + d, z], [x + w, y + d, t], [x + w, y, t]], fill: 'bg', depth });
	ops.push({ kind: 'poly', pts: [[x, y + d, z], [x + w, y + d, z], [x + w, y + d, t], [x, y + d, t]], fill: 'bg', depth });
	ops.push({ kind: 'poly', pts: [[x, y, t], [x + w, y, t], [x + w, y + d, t], [x, y + d, t]], fill: 'bg', depth: depth + 0.001 });
}

const PLATE = 0.28;
const KNOWN = new Set(['plate', 'lot', 'parcel', 'box', 'house', 'solar', 'rack', 'cube', 'pole', 'wire', 'pipe']);

/** Parses a scene. Unknown commands and short lines are an error, so a typo never draws a different picture. */
export function isoOps(spec: string): { ops: Op[]; top: number } {
	const ops: Op[] = [];
	let top = 0;
	spec.split('\n').forEach((raw, index) => {
		const line = raw.trim();
		if (!line || line.startsWith('#')) return;
		const p = line.split(/\s+/);
		const cmd = (p[0] ?? '').toLowerCase();
		if (!KNOWN.has(cmd)) throw new Error(`Scene line ${index + 1}: unknown command "${p[0]}". Commands: ${[...KNOWN].join(', ')}.`);
		const v = p.slice(1).filter((x) => x !== 'fill').map(Number);
		const need = { plate: 2, lot: 4, parcel: 4, box: 5, house: 2, solar: 3, rack: 3, cube: 2, pole: 2, wire: 4, pipe: 4 }[cmd]!;
		if (v.length < need || v.slice(0, need).some((n) => !Number.isFinite(n))) throw new Error(`Scene line ${index + 1}: ${cmd} needs ${need} numbers.`);
		if (cmd === 'plate') {
			const [W, D] = v;
			box(ops, -1, -1, 0, W + 2, D + 2, PLATE, -1e6);
			box(ops, -0.4, -0.4, PLATE, W + 0.8, D + 0.8, PLATE * 0.8, -1e6 + 1);
			top = PLATE * 1.8;
			for (let i = 0; i <= W; i += 1) ops.push({ kind: 'line', pts: [[i - 0.4, D + 0.4, PLATE], [i - 0.4, D + 0.4, top]], depth: -1e6 + 2, width: 0.5 });
			for (let i = 0; i <= D; i += 1) ops.push({ kind: 'line', pts: [[W + 0.4, i - 0.4, PLATE], [W + 0.4, i - 0.4, top]], depth: -1e6 + 2, width: 0.5 });
		} else if (cmd === 'lot') {
			const [x, y, w, d] = v;
			ops.push({ kind: 'poly', pts: [[x, y, top], [x + w, y, top], [x + w, y + d, top], [x, y + d, top]], fill: 'none', depth: -1e5, nodes: false });
		} else if (cmd === 'parcel') {
			const [x, y, w, d] = v;
			ops.push({ kind: 'poly', pts: [[x, y, top], [x + w, y, top], [x + w, y + d, top], [x, y + d, top]], fill: p.includes('fill') ? 'accent' : 'none', hatch: true, nodes: true, depth: -1e5 + 1 });
		} else if (cmd === 'box') {
			const [x, y, w, d, h] = v;
			box(ops, x, y, top, w, d, h);
		} else if (cmd === 'house') {
			const [x, y] = v;
			const k = Number.isFinite(v[2]) && v[2] > 0 ? v[2] : 1;
			box(ops, x + 1.5 * k, y + 0.3 * k, top, 0.8 * k, 1.1 * k, 0.55 * k);
			box(ops, x, y, top, 1.6 * k, 1.6 * k, 1.15 * k);
			const t = top + 1.15 * k;
			const i = 0.18 * k;
			const e = 1.6 * k - i;
			const dep = x + y + 3.2 * k + 0.002;
			ops.push({ kind: 'poly', pts: [[x + i, y + i, t], [x + e, y + i, t], [x + e, y + e, t], [x + i, y + e, t]], fill: 'none', depth: dep });
			const f = y + 1.6 * k;
			ops.push({ kind: 'poly', pts: [[x + 0.3 * k, f, top], [x + 0.65 * k, f, top], [x + 0.65 * k, f, top + 0.6 * k], [x + 0.3 * k, f, top + 0.6 * k]], fill: 'none', depth: dep });
			ops.push({ kind: 'poly', pts: [[x + 0.9 * k, f, top + 0.35 * k], [x + 1.3 * k, f, top + 0.35 * k], [x + 1.3 * k, f, top + 0.7 * k], [x + 0.9 * k, f, top + 0.7 * k]], fill: 'none', depth: dep });
		} else if (cmd === 'solar') {
			const [x, y, len] = v;
			const d = 0.8;
			const z1 = top + 0.55;
			const z2 = top + 0.2;
			const depth = x + y + len + d;
			for (let i = 0; i <= len; i += 1.5) {
				ops.push({ kind: 'line', pts: [[x + i, y + 0.2, top], [x + i, y + 0.2, z1 - 0.1]], depth: depth - 0.5 });
				ops.push({ kind: 'line', pts: [[x + i, y + d - 0.2, top], [x + i, y + d - 0.2, z2 + 0.08]], depth: depth - 0.5 });
			}
			ops.push({ kind: 'poly', pts: [[x, y, z1], [x + len, y, z1], [x + len, y + d, z2], [x, y + d, z2]], fill: 'bg', depth });
			for (let i = 0.5; i < len; i += 0.5) ops.push({ kind: 'line', pts: [[x + i, y, z1], [x + i, y + d, z2]], depth: depth + 0.01, width: 0.6 });
			ops.push({ kind: 'line', pts: [[x, y + d / 2, (z1 + z2) / 2], [x + len, y + d / 2, (z1 + z2) / 2]], depth: depth + 0.01, width: 0.6 });
		} else if (cmd === 'rack') {
			const [x, y, len] = v;
			box(ops, x, y, top, len, 0.8, 1.3);
			for (let i = 0.6; i < len; i += 0.6) ops.push({ kind: 'line', pts: [[x + i, y + 0.8, top + 0.1], [x + i, y + 0.8, top + 1.2]], depth: x + y + len + 0.81, width: 0.6 });
		} else if (cmd === 'cube') {
			const [x, y] = v;
			box(ops, x, y, top, 1, 1, 1);
		} else if (cmd === 'pole') {
			const [x, y] = v;
			ops.push({ kind: 'line', pts: [[x, y, top], [x, y, top + 2.2]], depth: x + y });
			ops.push({ kind: 'ring', at: [x, y, top + 2.2], r: 0.09, depth: x + y + 0.01 });
		} else if (cmd === 'wire') {
			const [x1, y1, x2, y2] = v;
			ops.push({ kind: 'line', pts: [[x1, y1, top + 2.1], [(x1 + x2) / 2, (y1 + y2) / 2, top + 1.7], [x2, y2, top + 2.1]], curve: true, depth: (x1 + y1 + x2 + y2) / 2 + 0.02, width: 0.6 });
		} else if (cmd === 'pipe') {
			const [x1, y1, x2, y2] = v;
			ops.push({ kind: 'line', pts: [[x1, y1, top + 0.35], [x2, y2, top + 0.35]], depth: Math.min(x1 + y1, x2 + y2) - 0.5 });
			ops.push({ kind: 'line', pts: [[x1 + 0.1, y1 + 0.1, top + 0.2], [x2 + 0.1, y2 + 0.1, top + 0.2]], depth: Math.min(x1 + y1, x2 + y2) - 0.5 });
			ops.push({ kind: 'ring', at: [x2 - (x2 - x1) * 0.12, y2 - (y2 - y1) * 0.12, top + 0.3], r: 0.14, depth: x2 + y2 - 0.4 });
		}
	});
	// A stable sort keeps lines with equal depth in the order they were written.
	ops.sort((a, b) => a.depth - b.depth);
	return { ops, top };
}

export function isoBounds(spec: string) {
	const { ops } = isoOps(spec);
	let x0 = Infinity;
	let y0 = Infinity;
	let x1 = -Infinity;
	let y1 = -Infinity;
	for (const op of ops) {
		for (const q of op.kind === 'ring' ? [op.at] : op.pts) {
			const [px, py] = proj(q);
			x0 = Math.min(x0, px);
			y0 = Math.min(y0, py);
			x1 = Math.max(x1, px);
			y1 = Math.max(y1, py);
		}
	}
	if (!Number.isFinite(x0)) return { x: 0, y: 0, w: 1, h: 1 };
	return { x: x0, y: y0, w: Math.max(0.01, x1 - x0), h: Math.max(0.01, y1 - y0) };
}

export type IsoColors = { ink: string; bg: string; accent: string; lineWidth: number };

/** The scene drawn to fit a w by h box at the origin, as SVG elements. Hatching sits in a clip path per parcel. */
export function isoSvg(spec: string, w: number, h: number, colors: IsoColors, idPrefix = 'iso'): string {
	const b = isoBounds(spec);
	const k = Math.min(w / b.w, h / b.h);
	const ox = (w - b.w * k) / 2 - b.x * k;
	const oy = (h - b.h * k) / 2 - b.y * k;
	const at = (q: P3): [number, number] => {
		const [px, py] = proj(q);
		return [ox + px * k, oy + py * k];
	};
	const { ops } = isoOps(spec);
	const lw = colors.lineWidth;
	const stroke = (width: number) => `stroke="${colors.ink}" stroke-width="${num(width, 3)}" stroke-linejoin="round" stroke-linecap="round"`;
	const parts: string[] = [];
	let clips = 0;
	for (const op of ops) {
		if (op.kind === 'poly') {
			const pts = op.pts.map(at);
			const d = `M${pts.map(([x, y]) => `${num(x)} ${num(y)}`).join('L')}Z`;
			const fill = op.fill === 'none' ? 'none' : op.fill === 'accent' ? colors.accent : colors.bg;
			parts.push(`<path d="${d}" fill="${fill}"/>`);
			if (op.hatch) {
				const id = `${idPrefix}-p${clips++}`;
				const [a, bq, , dq] = op.pts;
				const len = Math.hypot(bq[0] - a[0], bq[1] - a[1]);
				const steps = Math.max(4, Math.round(len / 0.18));
				let lines = '';
				for (let i = 0; i <= steps; i++) {
					const t = i / steps;
					const s0 = at([a[0] + (bq[0] - a[0]) * t, a[1] + (bq[1] - a[1]) * t, a[2]]);
					const s1 = at([dq[0] + (bq[0] - a[0]) * t, dq[1] + (bq[1] - a[1]) * t, dq[2]]);
					lines += `M${num(s0[0])} ${num(s0[1])}L${num(s1[0])} ${num(s1[1])}`;
				}
				const color = op.fill === 'accent' ? colors.bg : colors.ink;
				parts.push(`<clipPath id="${id}"><path d="${d}"/></clipPath><path d="${lines}" clip-path="url(#${id})" fill="none" stroke="${color}" stroke-opacity="${op.fill === 'accent' ? 0.38 : 0.45}" stroke-width="${num(lw * 0.6, 3)}"/>`);
			}
			parts.push(`<path d="${d}" fill="none" ${stroke(lw)}/>`);
			if (op.nodes) for (const [px, py] of pts) parts.push(`<circle cx="${num(px)}" cy="${num(py)}" r="${num(lw * 2.2, 3)}" fill="${colors.bg}" ${stroke(lw)}/>`);
		} else if (op.kind === 'line') {
			const pts = op.pts.map(at);
			const d = op.curve && pts.length === 3 ? `M${num(pts[0][0])} ${num(pts[0][1])}Q${num(pts[1][0])} ${num(pts[1][1])} ${num(pts[2][0])} ${num(pts[2][1])}` : `M${pts.map(([x, y]) => `${num(x)} ${num(y)}`).join('L')}`;
			parts.push(`<path d="${d}" fill="none" ${stroke(lw * (op.width ?? 1))}/>`);
		} else {
			const [px, py] = at(op.at);
			parts.push(`<circle cx="${num(px)}" cy="${num(py)}" r="${num(op.r * k, 3)}" fill="${colors.bg}" ${stroke(lw)}/>`);
		}
	}
	return parts.join('');
}
