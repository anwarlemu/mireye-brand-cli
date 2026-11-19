import { num } from '../image/type.js';
import { pictureHref } from '../image/poster.js';

// A picture as topographic contours: its brightness read as height, smoothed, and cut into isolines with marching
// squares, so any photo or drawing comes out in the brand's contour line. Pixels are decoded by resvg (the same
// renderer that writes the PNGs), the field is blurred with a fixed box filter and the lines are joined in a fixed
// order, so the same picture and settings always give the same paths.

export type TraceOptions = { levels: number; detail: number; smooth: number; invert: boolean };

type Field = { w: number; h: number; v: Float32Array };

async function decode(file: string, detail: number): Promise<Field> {
	const pic = pictureHref(file);
	const w = Math.max(16, Math.min(600, Math.round(detail)));
	const h = Math.max(16, Math.round((w * pic.height) / pic.width));
	const { Resvg } = await import('@resvg/resvg-js');
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="#ffffff"/><image href="${pic.href}" width="${w}" height="${h}" preserveAspectRatio="none"/></svg>`;
	const img = new Resvg(svg, { fitTo: { mode: 'width', value: w }, font: { loadSystemFonts: false }, logLevel: 'off' }).render();
	const px = img.pixels;
	const v = new Float32Array(w * h);
	for (let i = 0; i < w * h; i++) v[i] = (0.2126 * px[i * 4] + 0.7152 * px[i * 4 + 1] + 0.0722 * px[i * 4 + 2]) / 255;
	return { w, h, v };
}

function blur(f: Field, r: number): Field {
	if (r < 1) return f;
	const { w, h } = f;
	let a = f.v;
	for (let pass = 0; pass < 3; pass++) {
		const b = new Float32Array(w * h);
		for (let y = 0; y < h; y++) {
			let sum = 0;
			for (let x = -r; x <= r; x++) sum += a[y * w + Math.min(w - 1, Math.max(0, x))];
			for (let x = 0; x < w; x++) {
				b[y * w + x] = sum / (2 * r + 1);
				sum += a[y * w + Math.min(w - 1, x + r + 1)] - a[y * w + Math.max(0, x - r)];
			}
		}
		const c = new Float32Array(w * h);
		for (let x = 0; x < w; x++) {
			let sum = 0;
			for (let y = -r; y <= r; y++) sum += b[Math.min(h - 1, Math.max(0, y)) * w + x];
			for (let y = 0; y < h; y++) {
				c[y * w + x] = sum / (2 * r + 1);
				sum += b[Math.min(h - 1, y + r + 1) * w + x] - b[Math.max(0, y - r) * w + x];
			}
		}
		a = c;
	}
	return { w, h, v: a };
}

type Pt = [number, number];

/** Isolines of one level as joined polylines, in field cells. */
function isolines(f: Field, level: number): Pt[][] {
	const { w, h, v } = f;
	const segs: [Pt, Pt][] = [];
	const at = (x: number, y: number) => v[y * w + x];
	const lerp = (a: number, b: number) => (level - a) / (b - a || 1e-9);
	for (let y = 0; y < h - 1; y++) {
		for (let x = 0; x < w - 1; x++) {
			const a = at(x, y);
			const b = at(x + 1, y);
			const c = at(x + 1, y + 1);
			const d = at(x, y + 1);
			const idx = (a > level ? 8 : 0) | (b > level ? 4 : 0) | (c > level ? 2 : 0) | (d > level ? 1 : 0);
			if (idx === 0 || idx === 15) continue;
			const top: Pt = [x + lerp(a, b), y];
			const right: Pt = [x + 1, y + lerp(b, c)];
			const bottom: Pt = [x + lerp(d, c), y + 1];
			const left: Pt = [x, y + lerp(a, d)];
			const centre = (a + b + c + d) / 4 > level;
			switch (idx) {
				case 1: case 14: segs.push([left, bottom]); break;
				case 2: case 13: segs.push([bottom, right]); break;
				case 3: case 12: segs.push([left, right]); break;
				case 4: case 11: segs.push([top, right]); break;
				case 6: case 9: segs.push([top, bottom]); break;
				case 7: case 8: segs.push([left, top]); break;
				case 5: if (centre) { segs.push([left, top], [bottom, right]); } else { segs.push([left, bottom], [top, right]); } break;
				case 10: if (centre) { segs.push([top, right], [left, bottom]); } else { segs.push([left, top], [bottom, right]); } break;
			}
		}
	}
	const key = (p: Pt) => `${Math.round(p[0] * 1000)},${Math.round(p[1] * 1000)}`;
	const ends = new Map<string, number[]>();
	segs.forEach(([p, q], i) => {
		for (const k of [key(p), key(q)]) ends.set(k, [...(ends.get(k) ?? []), i]);
	});
	const used = new Uint8Array(segs.length);
	const lines: Pt[][] = [];
	for (let i = 0; i < segs.length; i++) {
		if (used[i]) continue;
		used[i] = 1;
		const line: Pt[] = [segs[i][0], segs[i][1]];
		for (const forward of [true, false]) {
			for (;;) {
				const tip = forward ? line[line.length - 1] : line[0];
				const next = (ends.get(key(tip)) ?? []).find((j) => !used[j]);
				if (next === undefined) break;
				used[next] = 1;
				const [p, q] = segs[next];
				const far = key(p) === key(tip) ? q : p;
				if (forward) line.push(far);
				else line.unshift(far);
			}
		}
		lines.push(line);
	}
	return lines;
}

/** Chaikin smoothing, then every other point dropped where the line is nearly straight. */
function smoothLine(line: Pt[], passes: number): Pt[] {
	let pts = line;
	const closed = pts.length > 3 && Math.hypot(pts[0][0] - pts[pts.length - 1][0], pts[0][1] - pts[pts.length - 1][1]) < 1e-6;
	for (let p = 0; p < passes; p++) {
		const out: Pt[] = closed ? [] : [pts[0]];
		for (let i = 0; i < pts.length - 1; i++) {
			const [a, b] = [pts[i], pts[i + 1]];
			out.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25], [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]);
		}
		if (closed) out.push(out[0]);
		else out.push(pts[pts.length - 1]);
		pts = out;
	}
	return pts;
}

export type Traced = { paths: string[]; width: number; height: number; lines: number };

/** Contour paths for a picture, scaled to `width` by the picture's height. Short scraps are dropped. */
export async function traceContours(file: string, width: number, opts: TraceOptions): Promise<Traced> {
	const raw = await decode(file, opts.detail);
	const field = blur(raw, Math.max(0, Math.round(opts.smooth)));
	if (opts.invert) for (let i = 0; i < field.v.length; i++) field.v[i] = 1 - field.v[i];
	let lo = 1;
	let hi = 0;
	for (const x of field.v) {
		lo = Math.min(lo, x);
		hi = Math.max(hi, x);
	}
	const k = width / (field.w - 1);
	const height = Math.round((field.h - 1) * k);
	const paths: string[] = [];
	let count = 0;
	const n = Math.max(2, Math.min(40, Math.round(opts.levels)));
	for (let i = 1; i <= n; i++) {
		const level = lo + ((hi - lo) * i) / (n + 1);
		const parts: string[] = [];
		for (const line of isolines(field, level)) {
			if (line.length < 12) continue;
			const pts = smoothLine(line, 2);
			parts.push(`M${pts.map(([x, y]) => `${num(x * k)} ${num(y * k)}`).join('L')}`);
			count++;
		}
		if (parts.length) paths.push(parts.join(''));
	}
	if (!count) throw new Error(`${file} has too little contrast to trace: no contour lines came out. Use a picture with light and dark areas, or raise --levels or lower --smooth.`);
	return { paths, width: Math.round(width), height, lines: count };
}
