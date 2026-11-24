import type { Anchor, DrawnLayer, LayerEdit, Rect } from '../design/types.js';
import { platformOf, zonePx } from '../design/platforms.js';
import { sizeInfo, type Size } from './catalog.js';

// Where things go on a picture: the part of the canvas a platform leaves free, rectangles that must not meet, the
// largest empty place for a drawing, and what a person's layer edits (move, scale, anchor, align, hide) do to them.

export type { Anchor, DrawnLayer, LayerEdit, Rect };
export type Edits = Record<string, LayerEdit>;

export class LayoutError extends Error {}

export const inflate = (r: Rect, x: number, y = x): Rect => ({ x: r.x - x, y: r.y - y, w: r.w + x * 2, h: r.h + y * 2 });
export const right = (r: Rect) => r.x + r.w;
export const bottom = (r: Rect) => r.y + r.h;
export const meets = (a: Rect, b: Rect, slack = 0.01) => a.x < right(b) - slack && right(a) > b.x + slack && a.y < bottom(b) - slack && bottom(a) > b.y + slack;
export const within = (a: Rect, b: Rect, slack = 0.5) => a.x >= b.x - slack && a.y >= b.y - slack && right(a) <= right(b) + slack && bottom(a) <= bottom(b) + slack;
export const cross = (a: Rect, b: Rect): Rect => {
	const x = Math.max(a.x, b.x);
	const y = Math.max(a.y, b.y);
	return { x, y, w: Math.max(0, Math.min(right(a), right(b)) - x), h: Math.max(0, Math.min(bottom(a), bottom(b)) - y) };
};

export type Frame = {
	W: number;
	H: number;
	/** The margin. */
	m: number;
	/** Where words, the logo and the main drawing go: the canvas less its margin and the platform's covered edges. */
	live: Rect;
	/** The live area with its margin: what a layout treats as its canvas. */
	stage: Rect;
	/** Covered corners inside the live area. */
	avoid: (Rect & { name: string })[];
	/** The smallest small type and headline, in canvas pixels. */
	small: number;
	large: number;
	/** The shortest mark, in canvas pixels. */
	mark: number;
};

/** The free part of a size. `marginShare` is the margin as a share of the layout's base length. */
export function frameOf(size: Size, floors: { small: number; headline: number; mark: number }, marginShare = 0.05): Frame {
	const { width: W, height: H } = size;
	const info = sizeInfo(size);
	let free: Rect = info.safe ? zonePx(info.safe, W, H) : { x: 0, y: 0, w: W, h: H };
	const corners: (Rect & { name: string })[] = [];
	for (const zone of info.avoid) {
		const z = zonePx(zone, W, H);
		const across = z.w >= W * 0.95;
		const down = z.h >= H * 0.95;
		if (across && z.y <= 1) free = cross(free, { x: 0, y: bottom(z), w: W, h: H });
		else if (across && bottom(z) >= H - 1) free = cross(free, { x: 0, y: 0, w: W, h: z.y });
		else if (down && z.x <= 1) free = cross(free, { x: right(z), y: 0, w: W, h: H });
		else if (down && right(z) >= W - 1) free = cross(free, { x: 0, y: 0, w: z.x, h: H });
		else corners.push({ ...z, name: zone.name });
	}
	const banner = free.w / free.h >= 2.4;
	const base = banner ? Math.min(free.w * 0.58, free.h * 2.4) : Math.min(free.w, free.h * 1.6);
	const m = base * marginShare;
	const live = cross(free, { x: m, y: m, w: W - m * 2, h: H - m * 2 });
	// The stricter of this size's own shown width and the one the shared check assumes for it.
	const k = W / Math.min(info.shown, platformOf(size.id, W, H).shown);
	return { W, H, m, live, stage: inflate(live, m), avoid: corners.map((c) => ({ ...cross(c, { x: 0, y: 0, w: W, h: H }), name: c.name })).filter((c) => meets(c, live)), small: floors.small * k, large: floors.headline * k, mark: floors.mark * k };
}

/** The place a box takes in an area for an anchor. */
export function anchored(area: Rect, w: number, h: number, anchor: Anchor): Rect {
	const x = /left/.test(anchor) ? area.x : /right/.test(anchor) ? right(area) - w : area.x + (area.w - w) / 2;
	const y = /top/.test(anchor) ? area.y : /bottom/.test(anchor) ? bottom(area) - h : area.y + (area.h - h) / 2;
	return { x, y, w, h };
}

export const shift = (r: Rect, dx: number, dy: number): Rect => ({ ...r, x: r.x + dx, y: r.y + dy });

/** The nearest free spot for a box among obstacles: where it is, else slid up, down, left or right, inside `area`. */
export function settle(box: Rect, obstacles: Rect[], area: Rect, prefer: ('up' | 'down' | 'left' | 'right')[] = ['up', 'down', 'left', 'right']): Rect | undefined {
	const free = (r: Rect) => within(r, area) && obstacles.every((o) => !meets(r, o));
	if (free(box)) return box;
	const spots: { r: Rect; cost: number }[] = [];
	const ys = new Set([box.y, area.y, bottom(area) - box.h]);
	const xs = new Set([box.x, area.x, right(area) - box.w]);
	for (const o of obstacles) {
		ys.add(o.y - box.h);
		ys.add(bottom(o));
		xs.add(o.x - box.w);
		xs.add(right(o));
	}
	for (const y of ys)
		for (const x of xs) {
			const r = { ...box, x, y };
			if (!free(r)) continue;
			// Only the ways asked for, alone or together.
			const ways = [...(Math.abs(y - box.y) < 0.01 ? [] : [y < box.y ? 'up' : 'down']), ...(Math.abs(x - box.x) < 0.01 ? [] : [x < box.x ? 'left' : 'right'])] as ('up' | 'down' | 'left' | 'right')[];
			if (ways.some((w) => !prefer.includes(w))) continue;
			const rank = ways.length === 1 ? prefer.indexOf(ways[0]) : prefer.length;
			spots.push({ r, cost: Math.abs(x - box.x) + Math.abs(y - box.y) + rank * 0.001 });
		}
	spots.sort((a, b) => a.cost - b.cost);
	return spots[0]?.r;
}

/** Every largest empty rectangle of an area. */
function empties(area: Rect, obstacles: Rect[]): Rect[] {
	const hit = obstacles.filter((o) => meets(o, area));
	const xs = [...new Set([area.x, right(area), ...hit.flatMap((o) => [Math.max(area.x, o.x), Math.min(right(area), right(o))])])].sort((a, b) => a - b);
	const ys = [...new Set([area.y, bottom(area), ...hit.flatMap((o) => [Math.max(area.y, o.y), Math.min(bottom(area), bottom(o))])])].sort((a, b) => a - b);
	const out: Rect[] = [];
	for (let a = 0; a < xs.length; a++)
		for (let b = a + 1; b < xs.length; b++)
			for (let c = 0; c < ys.length; c++)
				for (let e = c + 1; e < ys.length; e++) {
					const r = { x: xs[a], y: ys[c], w: xs[b] - xs[a], h: ys[e] - ys[c] };
					if (hit.every((o) => !meets(o, r))) out.push(r);
				}
	return out;
}

/** The largest empty rectangle of an area. */
export function largest(area: Rect, obstacles: Rect[]): Rect {
	return empties(area, obstacles).sort((a, b) => b.w * b.h - a.w * a.h)[0] ?? area;
}

/**
 * The place for a drawing: as large as it is asked to be, or as large as the biggest empty place allows, and as near to
 * where the layout wants it as that place allows. Undefined when it would be under `least` of its size.
 */
export function place(want: Rect, area: Rect, obstacles: Rect[], least = 0.4, weight = 0.08): Rect | undefined {
	let best: { r: Rect; score: number } | undefined;
	for (const e of empties(area, obstacles)) {
		const k = Math.min(1, e.w / want.w, e.h / want.h);
		if (k < least) continue;
		const w = want.w * k;
		const h = want.h * k;
		const cx = Math.max(e.x + w / 2, Math.min(right(e) - w / 2, want.x + want.w / 2));
		const cy = Math.max(e.y + h / 2, Math.min(bottom(e) - h / 2, want.y + want.h / 2));
		const off = Math.hypot(cx - (want.x + want.w / 2), cy - (want.y + want.h / 2)) / Math.max(want.w, want.h);
		// When the place is tight in one direction, sit in the middle of it there.
		const r = { x: k < 1 && e.w <= e.h * (want.w / want.h) ? e.x + (e.w - w) / 2 : cx - w / 2, y: k < 1 && e.h <= e.w * (want.h / want.w) ? e.y + (e.h - h) / 2 : cy - h / 2, w, h };
		const score = k - off * weight;
		if (!best || score > best.score + 1e-9) best = { r, score };
	}
	return best?.r;
}

export function editOf(edits: Edits, id: string): LayerEdit {
	return edits[id] ?? {};
}

/** Throws for an edit past what a drawn layer can do. */
export function checkEdits(edits: Edits, layers: DrawnLayer[], where: string) {
	for (const [id, e] of Object.entries(edits)) {
		const l = layers.find((x) => x.id === id);
		// Hidden, or not drawn because its words were not passed: the design core says so when a person asks for it.
		if (!l) continue;
		const can = l.can;
		if ((e.dx || e.dy) && !can.move) throw new LayoutError(`${id} cannot be moved in ${where}.`);
		if (e.scale !== undefined && e.scale !== 1) {
			if (!can.scale) throw new LayoutError(`${id} cannot be scaled in ${where}.`);
			if (e.scale < can.scale[0] || e.scale > can.scale[1]) throw new LayoutError(`${id} scale is ${can.scale[0]} to ${can.scale[1]} in ${where}, not ${e.scale}.`);
		}
		if (e.anchor && !can.anchors?.includes(e.anchor)) throw new LayoutError(can.anchors?.length ? `${id} anchors in ${where}: ${can.anchors.join(', ')}.` : `${id} cannot be anchored in ${where}.`);
		if (e.align && !can.align) throw new LayoutError(`${id} cannot be aligned in ${where}.`);
		if (e.hidden && !can.hide) throw new LayoutError(`${id} cannot be hidden in ${where}.`);
	}
}

const channel = (n: number) => (n <= 0.03928 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4);
export function luminance(hex: string): number {
	const n = Number.parseInt(hex.slice(1), 16);
	return 0.2126 * channel(((n >> 16) & 255) / 255) + 0.7152 * channel(((n >> 8) & 255) / 255) + 0.0722 * channel((n & 255) / 255);
}
export function contrast(a: string, b: string): number {
	const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (hi + 0.05) / (lo + 0.05);
}

/** A color over another at an alpha, as hex. */
export function over(top: string, alpha: number, under: string): string {
	const t = Number.parseInt(top.slice(1), 16);
	const u = Number.parseInt(under.slice(1), 16);
	const mix = (s: number) => Math.round(((t >> s) & 255) * alpha + ((u >> s) & 255) * (1 - alpha));
	return `#${[16, 8, 0].map((s) => mix(s).toString(16).padStart(2, '0')).join('')}`.toUpperCase();
}
