import { readFileSync } from 'node:fs';
import { pkgPath } from '../lib/paths.js';
import { wireDrawing, wireScenes } from '../illustrate/wire.js';
import { defaultTheme, tokenHex } from '../image/catalog.js';
import { lockupWidth, lockupSvg, markSvg, markWidth } from '../image/logo.js';
import { cross, type DrawnLayer, type Rect } from '../image/layers.js';
import { chamfer, contourSvg, diamond, groundColors, imageDocument, posterDraw } from '../image/poster.js';
import { CopyError, fitOrFail, loadFaces, num, placeWords } from '../image/type.js';

// Merch print files (brand/assets/merch.json): each item's trim, bleed and safe area in inches and a layout of
// logo, contours, wireframe scene and words in inches from the trim. A file is the item with its bleed: SVG at
// physical size (inches on the root, 300 units an inch) and PNG at the asked dpi. Colors come only from the variant:
// a brand ground to the bleed, or the art alone in Forest or Bone on a transparent ground. No mockups.

export const PX_PER_IN = 300;

type Box = [number, number, number, number];
type Layer =
	| { type: 'logo'; part: 'lockup' | 'mark'; box: Box; align?: 'left' | 'center' }
	| { type: 'wire'; scene: string; box: Box }
	| { type: 'contours'; kind: 'dense' | 'sparse'; box: Box }
	| { type: 'text'; slot: string; box: Box; size: number; align?: 'left' | 'center'; face?: 'sans' | 'mono'; required?: boolean }
	| { type: 'poster'; template: string }
	/** The mark again and again along a strip (a lanyard), the same gap each time. */
	| { type: 'repeat'; part: 'lockup' | 'mark'; box: Box; gap: number }
	/** A sheet of stickers on a grid: the lockup and the mark in turn, each with its own cut line on the brand's cut corner. */
	| { type: 'stickers'; box: Box; cols: number; rows: number; corner: number }
	/** A hairline with the brand's diamonds at its ends. */
	| { type: 'rule'; box: Box };

export type MerchItem = { id: string; name: string; size: [number, number]; bleed: number; safe: number; method: string; source: string; cut?: { corner: number }; variants: string[]; layers: Layer[] };
type Variant = { ground: string | null; tones?: 'light' | 'dark'; ink?: string; note: string };
type MerchDoc = { dpi: number; slots: Record<string, { text: string; own?: boolean; note: string }>; variants: Record<string, Variant>; items: MerchItem[] };

let doc: MerchDoc | undefined;
export const merchDoc = (): MerchDoc => (doc ??= JSON.parse(readFileSync(pkgPath('brand', 'assets', 'merch.json'), 'utf8')) as MerchDoc);
export const merchItems = () => merchDoc().items;

export function merchCatalog() {
	return {
		schemaVersion: 1 as const,
		items: merchItems().map((i) => ({
			id: i.id,
			name: i.name,
			trim: { width: i.size[0], height: i.size[1], unit: 'in' },
			bleed: i.bleed,
			safe: i.safe,
			method: i.method,
			variants: i.variants,
			pixels: { width: Math.round((i.size[0] + 2 * i.bleed) * PX_PER_IN), height: Math.round((i.size[1] + 2 * i.bleed) * PX_PER_IN), dpi: PX_PER_IN },
			dieCut: Boolean(i.cut),
			slots: merchSlots(i).map((x) => x.id),
			required: merchSlots(i).filter((x) => x.required).map((x) => x.id),
			source: i.source,
		})),
		variants: Object.entries(merchDoc().variants).map(([id, v]) => ({ id, ground: v.ground, note: v.note })),
		slots: merchDoc().slots,
		note: 'Sizes, bleeds and safe areas are common vendor conventions. Confirm against the print vendor template for the exact blank before ordering.',
	};
}

/** The word slots an item carries, and whether it must have them. */
export function merchSlots(item: MerchItem): { id: string; required: boolean }[] {
	const ids = [...new Set(item.layers.flatMap((l) => (l.type === 'text' ? [l.slot] : l.type === 'poster' ? ['headline'] : [])))];
	return ids.map((id) => ({ id, required: (item.layers.some((l) => l.type === 'poster') && id === 'headline') || item.layers.some((l) => l.type === 'text' && l.slot === id && l.required) }));
}

export type MerchRequest = { item: MerchItem; variant: string; slots: Record<string, string>; theme?: string; guides?: boolean; sample?: boolean; scene?: string; seed?: number };

/** The smallest printed type: about 8 points. */
const PRINT_MIN = (8 / 72) * PX_PER_IN;

/** One print file: the SVG (with the die line when the item has one) and the SVG to rasterize (without it). */
export function merchSvg(req: MerchRequest): { svg: string; printSvg: string; widthPx: number; heightPx: number; widthIn: number; heightIn: number; layers: DrawnLayer[] } {
	const { item } = req;
	const theme = req.theme ?? defaultTheme();
	const v = merchDoc().variants[req.variant];
	const f = loadFaces();
	const bleed = item.bleed * PX_PER_IN;
	const widthIn = item.size[0] + item.bleed * 2;
	const heightIn = item.size[1] + item.bleed * 2;
	const W = Math.round(widthIn * PX_PER_IN);
	const H = Math.round(heightIn * PX_PER_IN);
	const g = v.ground ? groundColors(v.ground, theme) : null;
	const ink = g ? g.ink : tokenHex(v.ink!, theme);
	const tones = g ? (g.dark ? 'dark' : 'light') : v.tones!;
	const gridAlpha = g ? g.gridAlpha : groundColors(tones === 'dark' ? 'green' : 'bone', theme).gridAlpha;
	const box = (b: Box) => ({ x: bleed + b[0] * PX_PER_IN, y: bleed + b[1] * PX_PER_IN, w: b[2] * PX_PER_IN, h: b[3] * PX_PER_IN });
	const layers: DrawnLayer[] = [];
	const logoRules = imageDocument().logoRules;
	const slots = merchSlots(item);
	for (const key of Object.keys(req.slots)) if (req.slots[key] && !slots.some((s) => s.id === key)) throw new Error(`${item.id} carries no ${key}.${slots.length ? ` Its words: ${slots.map((s) => s.id).join(', ')}.` : ' It has no words.'}`);
	/** Only the words asked for, the brand's own address, or (with --sample) the sample copy. */
	const words = (slot: string): { text: string; own: boolean; sample: boolean } | undefined => {
		const asked = req.slots[slot];
		if (asked) return { text: asked, own: false, sample: false };
		const fallback = merchDoc().slots[slot];
		if (fallback && (fallback.own || req.sample)) return { text: fallback.text, own: Boolean(fallback.own), sample: !fallback.own };
		return undefined;
	};
	const ground = g ? g.bg : tones === 'dark' ? '#000000' : '#FFFFFF';
	const parts: string[] = [];
	if (g) parts.push(`<rect width="${W}" height="${H}" fill="${g.bg}"/>`);
	let ids = 0;
	const dies: string[] = [];
	for (const layer of item.layers) {
		if (layer.type === 'poster') {
			if (!g) throw new Error(`${item.id} needs a ground variant.`);
			const head = words('headline');
			if (!head) throw new CopyError(`${item.id} needs --headline (or --sample for a first look).`);
			const drawn = posterDraw({ template: layer.template, size: { id: 'merch', width: W, height: H }, ground: g.id, theme, content: { title: head.text, scene: req.scene }, sample: head.sample, seed: req.seed });
			parts.push(drawn.svg);
			layers.push(...drawn.layers.map((l) => ({ ...l, can: {} })));
			continue;
		}
		const r = box(layer.box);
		if (layer.type === 'logo') {
			const mh = Math.min(r.h, layer.part === 'mark' ? r.w / (markWidth(1)) : r.w / (lockupWidth(f.sans, 1)));
			const w = layer.part === 'mark' ? markWidth(mh) : lockupWidth(f.sans, mh);
			const x = layer.align === 'left' ? r.x : r.x + (r.w - w) / 2;
			const y = r.y + (r.h - mh) / 2;
			parts.push(layer.part === 'mark' ? markSvg(x, y, mh, ink) : lockupSvg(f.sans, x, y, mh, ink).svg);
			layers.push({ id: 'logo', kind: 'logo', box: { x, y, w, h: mh }, over: ['pattern'], logo: { clear: mh * logoRules.clear, min: PRINT_MIN }, can: {} });
		} else if (layer.type === 'wire') {
			const scene = req.scene ?? (req.seed ? wireScenes()[(wireScenes().indexOf(layer.scene) + req.seed) % wireScenes().length] : layer.scene);
			if (!wireScenes().includes(scene)) throw new Error(`Unknown scene "${scene}". Scenes: ${wireScenes().join(', ')}.`);
			const art = wireDrawing(scene, tones);
			const k = Math.min(r.w / art.width, r.h / art.height);
			parts.push(`<g transform="translate(${num(r.x + (r.w - art.width * k) / 2)} ${num(r.y + (r.h - art.height * k) / 2)}) scale(${num(k, 5)})">${art.inner}</g>`);
			layers.push({ id: 'art', kind: 'art', box: { x: r.x + (r.w - art.width * k) / 2, y: r.y + (r.h - art.height * k) / 2, w: art.width * k, h: art.height * k }, can: {} });
		} else if (layer.type === 'contours') {
			// Contours at print scale: the line weight is the unit of a 1200 by 630 frame grown with the area.
			const u = Math.sqrt((r.w * r.h) / (1200 * 630));
			parts.push(contourSvg(`m${ids++}`, W, H, u, layer.kind, gridAlpha, ink, r));
			const full = r.x <= 0.5 && r.y <= 0.5 && r.x + r.w >= W - 0.5 && r.y + r.h >= H - 0.5;
			if (!full) {
				// A field that stops on the item ends at a frame with the brand's corner diamonds, not at a bare cut.
				const lw = Math.max(2, 1.4 * u);
				parts.push(`<rect x="${num(r.x)}" y="${num(r.y)}" width="${num(r.w)}" height="${num(r.h)}" fill="none" stroke="${ink}" stroke-width="${num(lw)}"/>${[[r.x, r.y], [r.x + r.w, r.y], [r.x, r.y + r.h], [r.x + r.w, r.y + r.h]].map(([px, py]) => diamond(px, py, 5 * u, ink)).join('')}`);
			}
			layers.push({ id: 'pattern', kind: 'art', box: cross(r, { x: 0, y: 0, w: W, h: H }) as Rect, bleeds: full, can: {} });
		} else if (layer.type === 'repeat') {
			const mh = r.h;
			const w = layer.part === 'mark' ? markWidth(mh) : lockupWidth(f.sans, mh);
			const step = w + layer.gap * PX_PER_IN;
			const count = Math.max(1, Math.floor((r.w + layer.gap * PX_PER_IN) / step));
			const x0 = r.x + (r.w - (count * step - layer.gap * PX_PER_IN)) / 2;
			for (let i = 0; i < count; i++) {
				const x = x0 + i * step;
				parts.push(layer.part === 'mark' ? markSvg(x, r.y, mh, ink) : lockupSvg(f.sans, x, r.y, mh, ink).svg);
				layers.push({ id: 'logo', kind: 'logo', box: { x, y: r.y, w, h: mh }, logo: { clear: Math.min(layer.gap * PX_PER_IN / 2, mh * logoRules.clear), min: PRINT_MIN }, can: {} });
			}
		} else if (layer.type === 'stickers') {
			const gap = 0.25 * PX_PER_IN;
			const cw = (r.w - gap * (layer.cols - 1)) / layer.cols;
			const ch = (r.h - gap * (layer.rows - 1)) / layer.rows;
			for (let row = 0; row < layer.rows; row++)
				for (let col = 0; col < layer.cols; col++) {
					const x = r.x + col * (cw + gap);
					const y = r.y + row * (ch + gap);
					const sq = (row + col) % 2 === 1;
					const lg = groundColors(['green', 'brown', 'black'][(row * layer.cols + col) % 3], theme);
					parts.push(`<path d="${chamfer(x, y, cw, ch, layer.corner * PX_PER_IN)}" fill="${lg.bg}"/>`);
					const pad = Math.min(cw, ch) * 0.2;
					const mh = sq ? Math.min(ch - pad * 2, (cw - pad * 2) / markWidth(1)) : Math.min((ch - pad * 2) * 0.5, (cw - pad * 2) / lockupWidth(f.sans, 1));
					const w = sq ? markWidth(mh) : lockupWidth(f.sans, mh);
					const lx = x + (cw - w) / 2;
					const ly = y + (ch - mh) / 2;
					parts.push(sq ? markSvg(lx, ly, mh, lg.ink) : lockupSvg(f.sans, lx, ly, mh, lg.ink).svg);
					layers.push({ id: 'logo', kind: 'logo', box: { x: lx, y: ly, w, h: mh }, logo: { clear: Math.min(pad, mh * logoRules.clear), min: PRINT_MIN }, can: {} });
					dies.push(`<path d="${chamfer(x, y, cw, ch, layer.corner * PX_PER_IN)}" fill="none" stroke="#FF00FF" stroke-width="3"/>`);
				}
		} else if (layer.type === 'rule') {
			const lw = Math.max(2, r.h);
			parts.push(`<rect x="${num(r.x)}" y="${num(r.y)}" width="${num(r.w)}" height="${num(lw)}" fill="${ink}" fill-opacity="0.5"/>${diamond(r.x, r.y + lw / 2, lw * 3, ink)}${diamond(r.x + r.w, r.y + lw / 2, lw * 3, ink)}`);
			layers.push({ id: 'rule', kind: 'art', box: { x: r.x - lw * 3, y: r.y - lw * 3, w: r.w + lw * 6, h: lw * 7 }, can: {} });
		} else if (layer.type === 'text') {
			const said = words(layer.slot);
			if (!said && layer.required) throw new CopyError(`${item.id} needs --${layer.slot}.`);
			if (!said) continue;
			const font = layer.face === 'mono' ? f.mono : f.sans;
			const size = layer.size * PX_PER_IN;
			const set = fitOrFail(font, said.text, { size, min: Math.min(size, PRINT_MIN), maxWidth: r.w, maxHeight: r.h, leading: 1.2 }, layer.slot, item.id);
			const p = placeWords(set, r.x, r.y, ink, layer.align === 'center' ? 'center' : 'left', r.w);
			parts.push(p.svg);
			layers.push({ id: layer.slot, kind: 'text', box: p.box, ink: p.ink, over: ['pattern'], text: { asked: said.text, drawn: set.drawn, size: set.size, color: ink, ground: [ground], own: said.own || undefined, sample: said.sample || undefined }, can: {} });
		}
	}
	if (req.guides) {
		const s = bleed + item.safe * PX_PER_IN;
		parts.push(`<g id="Guides" fill="none" stroke="${ink}" stroke-opacity="0.5" stroke-width="2"><rect x="${num(bleed)}" y="${num(bleed)}" width="${num(item.size[0] * PX_PER_IN)}" height="${num(item.size[1] * PX_PER_IN)}"/><rect x="${num(s)}" y="${num(s)}" width="${num(W - 2 * s)}" height="${num(H - 2 * s)}" stroke-dasharray="12 12"/></g>`);
	}
	const body = parts.join('');
	// The die line follows the brand's cut corner (a 45 degree chamfer at the top left), on the trim.
	const cut = dies.length ? `<g id="CutContour">${dies.join('')}</g>` : item.cut ? `<g id="CutContour"><path d="${chamfer(bleed, bleed, item.size[0] * PX_PER_IN, item.size[1] * PX_PER_IN, item.cut.corner * PX_PER_IN)}" fill="none" stroke="#FF00FF" stroke-width="3"/></g>` : '';
	const wrapDoc = (inner: string) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${num(widthIn, 3)}in" height="${num(heightIn, 3)}in" viewBox="0 0 ${W} ${H}">
<title>${item.name}, ${req.variant}</title>
${inner}
</svg>
`;
	return { svg: wrapDoc(body + cut), printSvg: wrapDoc(body), widthPx: W, heightPx: H, widthIn, heightIn, layers };
}
