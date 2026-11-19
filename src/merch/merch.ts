import { readFileSync } from 'node:fs';
import { pkgPath } from '../lib/paths.js';
import { wireDrawing, wireScenes } from '../illustrate/wire.js';
import { defaultTheme, tokenHex } from '../image/catalog.js';
import { lockupWidth, lockupSvg, markSvg, markWidth } from '../image/logo.js';
import { chamfer, contourSvg, groundColors, posterBody } from '../image/poster.js';
import { glyphPaths, lineMetrics, loadFaces, measure, num, wrap } from '../image/type.js';

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
	| { type: 'text'; slot: string; box: Box; size: number; align?: 'left' | 'center'; face?: 'sans' | 'mono' }
	| { type: 'poster'; template: string };

export type MerchItem = { id: string; name: string; size: [number, number]; bleed: number; safe: number; method: string; source: string; cut?: { corner: number }; variants: string[]; layers: Layer[] };
type Variant = { ground: string | null; tones?: 'light' | 'dark'; ink?: string; note: string };
type MerchDoc = { dpi: number; slots: Record<string, string>; variants: Record<string, Variant>; items: MerchItem[] };

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
			slots: [...new Set(i.layers.flatMap((l) => (l.type === 'text' ? [l.slot] : l.type === 'poster' ? ['headline'] : [])))],
			source: i.source,
		})),
		variants: Object.entries(merchDoc().variants).map(([id, v]) => ({ id, ground: v.ground, note: v.note })),
		slots: merchDoc().slots,
		note: 'Sizes, bleeds and safe areas are common vendor conventions. Confirm against the print vendor template for the exact blank before ordering.',
	};
}

export type MerchRequest = { item: MerchItem; variant: string; slots: Record<string, string>; theme?: string; guides?: boolean };

/** One print file: the SVG (with the die line when the item has one) and the SVG to rasterize (without it). */
export function merchSvg(req: MerchRequest): { svg: string; printSvg: string; widthPx: number; heightPx: number; widthIn: number; heightIn: number } {
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
	const parts: string[] = [];
	if (g) parts.push(`<rect width="${W}" height="${H}" fill="${g.bg}"/>`);
	let ids = 0;
	for (const layer of item.layers) {
		if (layer.type === 'poster') {
			if (!g) throw new Error(`${item.id} needs a ground variant.`);
			parts.push(posterBody({ template: layer.template, width: W, height: H, ground: g.id, theme, content: { title: req.slots.headline ?? merchDoc().slots.headline } }));
			continue;
		}
		const r = box(layer.box);
		if (layer.type === 'logo') {
			const mh = Math.min(r.h, layer.part === 'mark' ? r.w / (markWidth(1)) : r.w / (lockupWidth(f.sans, 1)));
			const w = layer.part === 'mark' ? markWidth(mh) : lockupWidth(f.sans, mh);
			const x = layer.align === 'left' ? r.x : r.x + (r.w - w) / 2;
			const y = r.y + (r.h - mh) / 2;
			parts.push(layer.part === 'mark' ? markSvg(x, y, mh, ink) : lockupSvg(f.sans, x, y, mh, ink).svg);
		} else if (layer.type === 'wire') {
			if (!wireScenes().includes(layer.scene)) throw new Error(`Unknown scene "${layer.scene}".`);
			const art = wireDrawing(layer.scene, tones);
			const k = Math.min(r.w / art.width, r.h / art.height);
			parts.push(`<g transform="translate(${num(r.x + (r.w - art.width * k) / 2)} ${num(r.y + (r.h - art.height * k) / 2)}) scale(${num(k, 5)})">${art.inner}</g>`);
		} else if (layer.type === 'contours') {
			// Contours at print scale: the line weight is the unit of a 1200 by 630 frame grown with the area.
			const u = Math.sqrt((r.w * r.h) / (1200 * 630));
			parts.push(contourSvg(`m${ids++}`, W, H, u, layer.kind, gridAlpha, ink, r));
		} else if (layer.type === 'text') {
			const text = req.slots[layer.slot] ?? merchDoc().slots[layer.slot] ?? '';
			if (!text) continue;
			const font = layer.face === 'mono' ? f.mono : f.sans;
			let size = layer.size * PX_PER_IN;
			let lines = wrap(font, text, size, r.w);
			while (lines.length * size * 1.2 > r.h && size > 12) {
				size -= 2;
				lines = wrap(font, text, size, r.w);
			}
			const m = lineMetrics(font, size, 1.2);
			lines.forEach((l, i) => {
				const lw = measure(font, l, size);
				const x = layer.align === 'center' ? r.x + (r.w - lw) / 2 : r.x;
				parts.push(glyphPaths(font, l, size, x, r.y + i * m.lineHeight + (m.lineHeight - m.em) / 2 + m.ascent, ink));
			});
		}
	}
	if (req.guides) {
		const s = bleed + item.safe * PX_PER_IN;
		parts.push(`<g id="Guides" fill="none" stroke="${ink}" stroke-opacity="0.5" stroke-width="2"><rect x="${num(bleed)}" y="${num(bleed)}" width="${num(item.size[0] * PX_PER_IN)}" height="${num(item.size[1] * PX_PER_IN)}"/><rect x="${num(s)}" y="${num(s)}" width="${num(W - 2 * s)}" height="${num(H - 2 * s)}" stroke-dasharray="12 12"/></g>`);
	}
	const body = parts.join('');
	// The die line follows the brand's cut corner (a 45 degree chamfer at the top left), on the trim.
	const cut = item.cut ? `<g id="CutContour"><path d="${chamfer(bleed, bleed, item.size[0] * PX_PER_IN, item.size[1] * PX_PER_IN, item.cut.corner * PX_PER_IN)}" fill="none" stroke="#FF00FF" stroke-width="3"/></g>` : '';
	const wrapDoc = (inner: string) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${num(widthIn, 3)}in" height="${num(heightIn, 3)}in" viewBox="0 0 ${W} ${H}">
<title>${item.name}, ${req.variant}</title>
${inner}
</svg>
`;
	return { svg: wrapDoc(body + cut), printSvg: wrapDoc(body), widthPx: W, heightPx: H, widthIn, heightIn };
}
