import { readdirSync, readFileSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';
import { blockRects } from '../design/compose.js';
import { platformOf } from '../design/platforms.js';
import type { BlockInfo, ComposeBlock, DesignDoc, DrawnLayer, Rect } from '../design/types.js';
import { isoPreset, isoSvg, ISO_PRESETS } from '../illustrate/iso.js';
import { wireDrawing, wireScenes } from '../illustrate/wire.js';
import { pkgPath } from '../lib/paths.js';
import { defaultTheme, FORMATS } from './catalog.js';
import { frameOf, inflate, LayoutError, meets, right, bottom, within } from './layers.js';
import { lockupSvg, lockupWidth, markSvg, markWidth } from './logo.js';
import { coverSvg, loadPicture } from './picture.js';
import { chamfer, chartRows, contourSvg, diamond, groundColors, imageDocument, posterFloors, type GroundColors } from './poster.js';
import { CopyError, fitWords, loadFaces, measure, num, placeWords, requireGlyphs, setAt, unionOf, type Fitted, type Font } from './type.js';

// Compose designs: the poster layouts' own parts (the headline and the line under it, the mono label, the lockup and
// the mark, the contour field, the window, the wire drawings and the isometric scenes, a person's picture with the cut
// corner, the stat with its tick row, the hatched columns, the chamfered key) drawn into any cells of the grid. The
// table, code, search field, divider and icon blocks are not in the share-image tool; they are built only from the same
// parts and the tokens (brand/assets/compose.md notes each). Words fit their cells whole or the block says what to shorten.

type Align = 'left' | 'center' | 'right';
type Layer = Omit<DrawnLayer, 'can'> & { can?: DrawnLayer['can'] };

const TEXT: DrawnLayer['can'] = { scale: [0.5, 1.6], hide: true, align: true };
const PART: DrawnLayer['can'] = { scale: [0.5, 1.6], hide: true };
const LEAD = 1.04;
const TRACK = -0.014;
const BODY_LEAD = 1.42;

/** The brand's icons (brand/icons): the names an icon block takes. */
export function iconNames(): string[] {
	return readdirSync(pkgPath('brand', 'icons')).filter((f) => f.endsWith('.svg')).map((f) => f.slice(0, -4)).sort();
}

export function composeBlocks(): BlockInfo[] {
	return [
		{ type: 'headline', names: ['title', 'heading'], kind: 'text', description: 'The headline in the brand sans, tight, as the posters set it.', copy: [{ id: 'text', required: true }], span: { cols: 8, rows: 4 }, place: 'top-left' },
		{ type: 'body', names: ['subtitle', 'text', 'paragraph', 'line'], kind: 'text', description: 'A line or a paragraph in the muted ink.', copy: [{ id: 'text', required: true }], span: { cols: 8, rows: 2 }, place: 'left' },
		{ type: 'badge', names: ['eyebrow', 'kicker', 'label', 'tag'], kind: 'text', description: 'A short label in the mono face after a diamond, as the field notes are marked.', copy: [{ id: 'text', required: true }], span: { cols: 4, rows: 1 }, place: 'top-left' },
		{ type: 'logo', names: ['wordmark', 'lockup'], kind: 'logo', description: 'The lockup, the mark and the name, with its clear space inside its cells.', copy: [], span: { cols: 4, rows: 2 }, place: 'bottom-left' },
		{ type: 'mark', names: ['logomark', 'symbol'], kind: 'logo', description: 'The mark alone.', copy: [], span: { cols: 4, rows: 4 }, place: 'center' },
		{ type: 'picture', names: ['image', 'photo'], kind: 'picture', description: 'A picture covering its cells with the cut corner; with no file it is the brand\'s wire drawing.', copy: [], image: { values: ['none'] }, options: [{ id: 'scene', values: wireScenes() }], span: { cols: 6, rows: 8 }, place: 'right' },
		{ type: 'art', names: ['drawing', 'illustration', 'wire'], kind: 'art', description: 'A wire drawing from the illustration skill, whole in its cells.', copy: [], options: [{ id: 'scene', values: wireScenes() }], span: { cols: 6, rows: 8 }, place: 'right' },
		{ type: 'scene', names: ['iso', 'isometric'], kind: 'art', description: 'An isometric scene (houses, solar, a data center, a warehouse, a hub, parcels).', copy: [], options: [{ id: 'scene', values: [...ISO_PRESETS] }], span: { cols: 6, rows: 8 }, place: 'right' },
		{ type: 'pattern', names: ['contours', 'field', 'grid', 'map'], kind: 'art', description: 'The contour field; it fades round the words and the logo.', copy: [], options: [{ id: 'density', values: ['dense', 'sparse'] }], span: { cols: 12, rows: 12 }, place: 'center', under: true },
		{ type: 'panel', names: ['window', 'frame'], kind: 'panel', description: 'The window: the ground with a hairline and a diamond at each corner, or filled in the window color (words on it turn to its ink).', copy: [], options: [{ id: 'style', values: ['outline', 'filled'] }], span: { cols: 8, rows: 6 }, place: 'center', under: true },
		{ type: 'card', names: ['feature', 'tile'], kind: 'panel', description: 'A filled window with the cut corner, a heading and a line.', copy: [{ id: 'heading', required: true }, { id: 'text' }], sample: { heading: 'Parcel data', text: 'Owner, zoning and flood zone.' }, span: { cols: 6, rows: 4 } },
		{ type: 'stat', names: ['number', 'metric', 'figure', 'price'], kind: 'text', description: 'A big number with the tick row under it and a line.', copy: [{ id: 'value', required: true }, { id: 'label' }], sample: { value: '42%', label: 'less time on site visits' }, span: { cols: 6, rows: 5 } },
		{ type: 'quote', names: ['testimonial'], kind: 'text', description: 'A quote, then who said it in the mono face (a role, never a real person).', copy: [{ id: 'text', required: true }, { id: 'attribution' }], sample: { text: 'It just works.', attribution: 'Head of land, Acme' }, span: { cols: 10, rows: 5 } },
		{ type: 'list', names: ['bullets', 'points', 'steps', 'items'], kind: 'text', description: 'Points split by |, each after a diamond, or numbered.', copy: [{ id: 'items', required: true }], sample: { items: 'Find the parcel | Check the zoning | Cite the source' }, options: [{ id: 'style', values: ['diamonds', 'numbered'] }], span: { cols: 6, rows: 5 } },
		{ type: 'button', names: ['cta', 'key'], kind: 'text', description: 'The chamfered key in the window color.', copy: [{ id: 'text', required: true }], span: { cols: 3, rows: 1 }, place: 'bottom-left' },
		{ type: 'search', names: ['search-bar', 'input', 'question', 'field'], kind: 'text', description: 'The Ask field: the words in an outlined field with the cut corner.', copy: [{ id: 'text', required: true }], span: { cols: 8, rows: 1 }, place: 'center' },
		{ type: 'chart', names: ['graph', 'bars', 'donut'], kind: 'text', description: 'Hatched bars, a line or a donut from "label | number" rows, one a line.', copy: [{ id: 'data', required: true }, { id: 'title' }], sample: { data: 'Sites | 138\nParcels | 64\nGrid | 42' }, options: [{ id: 'kind', values: ['bar', 'line', 'donut'] }], span: { cols: 6, rows: 6 } },
		{ type: 'table', names: ['grid-table', 'rows'], kind: 'text', description: 'Rows a line each, cells split by |; the first row is the head, in the mono face.', copy: [{ id: 'rows', required: true }], sample: { rows: 'Field | Source\nZoning | County\nFlood zone | FEMA' }, span: { cols: 8, rows: 4 } },
		{ type: 'code', names: ['snippet'], kind: 'text', description: 'Lines of code in the mono face, in an outlined block.', copy: [{ id: 'text', required: true }], sample: { text: 'parcels --near "39.7, -104.9"' }, span: { cols: 8, rows: 2 } },
		{ type: 'divider', names: ['rule', 'hairline'], kind: 'art', description: 'A hairline with a diamond at each end.', copy: [], span: { cols: 12, rows: 1 }, place: 'center' },
		{ type: 'icon', names: ['glyph', 'symbol-icon'], kind: 'key', description: 'One of the brand\'s icons (brand/icons) in the ink.', copy: [], options: [{ id: 'name', values: iconNames() }], span: { cols: 1, rows: 1 } },
	];
}

const infoOf = (type: string) => composeBlocks().find((b) => b.type === type)!;

/** A compose design as an SVG body and the layers it drew, one per block (and `<id>-<part>` for a block's parts). */
export function drawCompose(doc: DesignDoc, dir: string, theme = defaultTheme()): { svg: string; layers: DrawnLayer[] } {
	const W = doc.size.width;
	const H = doc.size.height;
	const g0 = groundColors(doc.theme ?? 'bone', theme);
	const f = loadFaces();
	const F = frameOf({ id: doc.size.id, width: W, height: H }, posterFloors());
	const shown = Math.min(platformOf(doc.size.id, W, H).shown, FORMATS[doc.size.id]?.shown ?? 1e9);
	const small = Math.max(F.small, (9 * W) / shown);
	const large = Math.max(F.large, small * 1.15);
	const markMin = Math.max(F.mark, (8 * W) / shown);
	const u = Math.sqrt((W * H) / (1200 * 630));
	const lw = Math.max(0.6, u);
	const clearOf = (mh: number) => mh * imageDocument().logoRules.clear;
	const layers: DrawnLayer[] = [];
	const out: string[] = [`<rect width="${W}" height="${H}" fill="${g0.bg}"/>`];
	const placed = blockRects(doc).filter((b) => !doc.layers[b.block.id]?.hidden);
	const words = (id: string, slot: string) => doc.copy[`${id}.${slot}`]?.trim() ?? '';
	const opt = (id: string, o: string) => (doc.options?.[`${id}.${o}`] === undefined ? undefined : String(doc.options[`${id}.${o}`]));
	const edit = (id: string) => doc.layers[id] ?? {};
	const tooLong = (id: string, what = id) => new CopyError(`The ${what} is too long for its cells. Shorten it, or give it more cells (make it wider or taller).`);
	let ids = 0;
	const nextId = (p: string) => `cm${p}${ids++}`;
	// What is drawn on top of a pattern or a panel says so; the pattern fades round every solid block.
	const later: (() => void)[] = [];
	const underBefore = (i: number, r: Rect) => placed.slice(0, i).filter((b) => infoOf(b.block.type).under && meets(b.rect, r));
	const report = (l: Layer) => layers.push({ ...l, can: l.can ?? {} } as DrawnLayer);

	placed.forEach(({ block, rect: r }, i) => {
		const id = block.id;
		const under = underBefore(i, r);
		const over = under.map((b) => b.block.id);
		// Words wholly on a filled window take its ink.
		const onWindow = under.some((b) => b.block.type === 'panel' && opt(b.block.id, 'style') === 'filled' && within(r, b.rect, 1));
		const c: GroundColors = onWindow ? { ...g0, bg: g0.window, ink: g0.windowInk, muted: g0.windowMuted, window: g0.ink, windowInk: g0.bg, windowMuted: g0.muted } : g0;
		const k = edit(id).scale ?? 1;
		const align = (fallback: Align = 'left'): Align => edit(id).align ?? fallback;
		/** Words fitted to a rect: as large as they fit from `from` down to `least`; a scale edit is held exactly. */
		const fit = (what: string, text: string, font: Font, from: number, box: Rect, lead: number, least = small, tracking = 0, scaled = true): Fitted => {
			requireGlyphs(font, text, what);
			// A hair inside the cells: glyphs overshoot their advance a little.
			const set = fitWords(font, text, { size: Math.max(from, least), min: least, maxWidth: box.w - 2, maxHeight: box.h, leading: lead, tracking });
			if (!set || set.broke) throw tooLong(what);
			if (!scaled || k === 1) return set;
			const want = set.size * k;
			const at = want >= least - 0.01 ? setAt(font, text, want, { size: want, min: want, maxWidth: box.w - 2, maxHeight: box.h, leading: lead, tracking }, false) : undefined;
			if (!at) throw tooLong(what, `${what} at that size`);
			return at;
		};
		const text = (lid: string, asked: string, set: Fitted, x: number, y: number, color: string, al: Align, column: number, extra: Partial<Layer> = {}) => {
			const p = placeWords(set, x, y, color, al, column);
			out.push(p.svg);
			report({ id: lid, kind: 'text', box: p.box, ink: p.ink, over, text: { asked, drawn: set.drawn, size: set.size, color, ground: [c.bg] }, can: lid === id ? TEXT : {}, ...extra });
			return p;
		};
		const base = Math.min(W, H * 1.6);
		switch (block.type) {
			case 'headline': {
				const t = words(id, 'text');
				const set = fit(id, t, f.sans, Math.min(r.h, base * 0.107), r, LEAD, large, TRACK);
				text(id, t, set, r.x, r.y, c.ink, align(), r.w);
				break;
			}
			case 'body': {
				const t = words(id, 'text');
				const set = fit(id, t, f.sans, Math.min(r.h, base * 0.03), r, BODY_LEAD);
				text(id, t, set, r.x, r.y, c.muted, align(), r.w);
				break;
			}
			case 'badge': {
				const t = words(id, 'text');
				const d = Math.max(small * 0.32, 4 * u);
				const set = fit(id, t, f.mono, Math.min(r.h * 0.7, base * 0.018), { ...r, w: r.w - d * 4 }, 1.25);
				const y = r.y + (r.h - set.height) / 2;
				out.push(diamond(r.x + d, y + set.height / 2, d, c.ink));
				const p = text(id, t, set, r.x + d * 4, y, c.ink, 'left', set.width);
				layers[layers.length - 1]!.box = unionOf([p.box, { x: r.x, y: y + set.height / 2 - d, w: d * 2, h: d * 2 }]);
				layers[layers.length - 1]!.can = PART;
				break;
			}
			case 'logo': {
				const ratio = lockupWidth(f.sans, 1);
				const mh = Math.max(markMin, Math.min(r.h / (1 + 2 * imageDocument().logoRules.clear), r.w / ratio, base * 0.05)) * k;
				if (mh < markMin - 0.01) throw new LayoutError(`The logo at ${k} is under its least height here (${Math.ceil(markMin)} px).`);
				const w = ratio * mh;
				if (w > r.w + 1) throw new CopyError(`The logo needs more cells: at least ${Math.ceil(w)} px wide here (too long for its cells as it is). Make it wider.`);
				const box = { x: r.x, y: r.y + (r.h - mh) / 2, w, h: mh };
				out.push(lockupSvg(f.sans, box.x, box.y, mh, c.ink).svg);
				report({ id, kind: 'logo', box, over, logo: { clear: clearOf(mh), min: markMin }, can: PART });
				break;
			}
			case 'mark': {
				const ratio = markWidth(1);
				// The clear space all round fits in its own cells.
				const mh = Math.max(markMin, (Math.min(r.h, r.w / ratio) / (1 + 2 * imageDocument().logoRules.clear)) * k);
				const box = { x: r.x + (r.w - mh * ratio) / 2, y: r.y + (r.h - mh) / 2, w: mh * ratio, h: mh };
				out.push(markSvg(box.x, box.y, mh, c.ink));
				report({ id, kind: 'logo', box, over, logo: { clear: clearOf(mh), min: markMin }, can: PART });
				break;
			}
			case 'picture': {
				const v = doc.images[id];
				if (v && v !== 'none') {
					const pic = loadPicture(isAbsolute(v) ? v : resolve(dir, v));
					const box = scaled(r, k);
					const cut = Math.min(box.w, box.h) * 0.08;
					out.push(coverSvg(pic, box, nextId('pic'), `<path d="${chamfer(box.x, box.y, box.w, box.h, cut)}"/>`));
					report({ id, kind: 'picture', box, over, can: PART });
				} else wire(id, r, opt(id, 'scene'), c, over);
				break;
			}
			case 'art':
				wire(id, r, opt(id, 'scene'), c, over);
				break;
			case 'scene': {
				const preset = opt(id, 'scene') ?? ISO_PRESETS[(doc.seed ?? 0) % ISO_PRESETS.length]!;
				if (!(ISO_PRESETS as readonly string[]).includes(preset)) throw new Error(`Unknown scene "${preset}". Scenes: ${ISO_PRESETS.join(', ')}.`);
				const box = scaled(r, k);
				const spec = isoPreset({ scene: preset as (typeof ISO_PRESETS)[number], cols: 12, rows: 8, count: 4, highlight: true });
				out.push(`<g transform="translate(${num(box.x)} ${num(box.y)})">${isoSvg(spec, box.w, box.h, { ink: c.ink, bg: c.bg, accent: c.window, lineWidth: Math.max(0.6, 1.4 * u) }, nextId('iso'))}</g>`);
				report({ id, kind: 'art', box, over, can: PART });
				break;
			}
			case 'pattern': {
				const kind = opt(id, 'density') === 'sparse' ? 'sparse' : 'dense';
				// Drawn once everything is placed, so it fades round what was really drawn on it.
				const at = out.length;
				out.push('');
				later.push(() => {
					const on = layers.filter((l) => l.over?.includes(id) || (l.kind !== 'art' && l.kind !== 'panel'));
					out[at] = contourSvg(nextId('ct'), W, H, u, kind, g0.gridAlpha, g0.grid, r, on.flatMap((l) => l.ink ?? [l.box]).map((x) => inflate(x, 6 * u)), g0.bg);
				});
				report({ id, kind: 'art', box: r, can: { hide: true } });
				break;
			}
			case 'panel': {
				if (opt(id, 'style') === 'filled') out.push(`<path d="${chamfer(r.x, r.y, r.w, r.h, Math.min(r.w, r.h) * 0.08)}" fill="${g0.window}"/>`);
				else {
					const d = Math.max(3, 5 * u);
					out.push(`<rect x="${num(r.x)}" y="${num(r.y)}" width="${num(r.w)}" height="${num(r.h)}" fill="${g0.bg}" stroke="${g0.ink}" stroke-opacity="0.45" stroke-width="${num(lw, 3)}"/>`);
					out.push([[r.x, r.y], [right(r), r.y], [r.x, bottom(r)], [right(r), bottom(r)]].map(([x, y]) => diamond(x!, y!, d, g0.ink)).join(''));
				}
				report({ id, kind: 'panel', box: r, over, can: { hide: true } });
				break;
			}
			case 'card': {
				const cut = Math.min(r.w, r.h) * 0.08;
				out.push(`<path d="${chamfer(r.x, r.y, r.w, r.h, cut)}" fill="${c.window}"/>`);
				report({ id, kind: 'panel', box: r, over, can: PART });
				const pad = Math.max(cut, Math.min(r.w, r.h) * 0.1);
				const inner = inflate(r, -pad);
				const heading = words(id, 'heading');
				const body = words(id, 'text');
				const hs = fit(`${id}-heading`, heading, f.medium, Math.min(base * 0.04, inner.h * 0.5), { ...inner, h: body ? inner.h * 0.55 : inner.h }, 1.15, small, 0, false);
				const hp = placeWords(hs, inner.x, inner.y, c.windowInk);
				out.push(hp.svg);
				report({ id: `${id}-heading`, kind: 'text', box: hp.box, ink: hp.ink, over: [id], text: { asked: heading, drawn: hs.drawn, size: hs.size, color: c.windowInk, ground: [c.window] } });
				if (body) {
					const top = inner.y + hs.height + pad * 0.4;
					const bs = fit(`${id}-text`, body, f.sans, Math.max(small, hs.size * 0.62), { ...inner, y: top, h: bottom(inner) - top }, 1.35, small, 0, false);
					const bp = placeWords(bs, inner.x, top, c.windowMuted);
					out.push(bp.svg);
					report({ id: `${id}-text`, kind: 'text', box: bp.box, ink: bp.ink, over: [id], text: { asked: body, drawn: bs.drawn, size: bs.size, color: c.windowMuted, ground: [c.window] } });
				}
				break;
			}
			case 'stat': {
				const value = words(id, 'value');
				const label = words(id, 'label');
				requireGlyphs(f.sans, value, id);
				const room = (label ? r.h * 0.62 : r.h) / 1.34;
				let size = Math.min(room, base * 0.3) * k;
				const wide = (sz: number) => measure(f.sans, value, sz, -0.02) + 0.03 * sz;
				while (wide(size) > r.w && size > large) size *= 0.96;
				if (wide(size) > r.w || size < large - 0.01) throw tooLong(id);
				const set = setAt(f.sans, value, size, { size, min: size, maxWidth: r.w, leading: 1.12, tracking: -0.02 }, false)!;
				const tickH = Math.max(6 * u, size * 0.1);
				if (set.height + tickH * 2 > r.h + 0.5) throw tooLong(id);
				const p = text(id, value, set, r.x, r.y, c.ink, 'left', r.w, { can: PART });
				const count = Math.max(12, Math.floor(set.width / (8 * u)));
				let ticks = '';
				for (let t = 0; t < count; t++) ticks += `<rect x="${num(r.x + (t * set.width) / count)}" y="${num(bottom(p.box) + tickH * 0.8)}" width="${num(lw)}" height="${num(tickH)}" fill="${c.ink}"/>`;
				out.push(ticks);
				report({ id: `${id}-ticks`, kind: 'art', box: { x: r.x, y: bottom(p.box) + tickH * 0.8, w: set.width, h: tickH }, over: [id, ...over] });
				if (label) {
					const top = bottom(p.box) + tickH * 2.4;
					if (top >= bottom(r) - small) throw tooLong(`${id} label`);
					const ls = fit(`${id}-label`, label, f.sans, Math.max(small, size * 0.2), { ...r, y: top, h: bottom(r) - top }, BODY_LEAD, small, 0, false);
					text(`${id}-label`, label, ls, r.x, top, c.muted, 'left', r.w);
				}
				break;
			}
			case 'quote': {
				const t = words(id, 'text');
				const who = words(id, 'attribution');
				const ws = who ? fit(`${id}-attribution`, who, f.mono, Math.max(small, base * 0.018), { ...r, h: r.h * 0.3 }, 1.3, small, 0, false) : undefined;
				const room = { ...r, h: r.h - (ws ? ws.height + small * 1.6 : 0) };
				const set = fit(id, t, f.sans, Math.min(room.h, base * 0.06), room, 1.18, small, -0.01);
				const p = text(id, t, set, r.x, r.y, c.ink, align(), r.w);
				if (ws) text(`${id}-attribution`, who, ws, r.x, bottom(p.box) + small * 1.2, c.muted, align(), r.w);
				break;
			}
			case 'list': {
				const items = words(id, 'items').split(/\s*\|\s*|\n/).map((x) => x.trim()).filter(Boolean);
				if (!items.length) throw new CopyError(`The ${id} needs points, split by |.`);
				if (items.length > 10) throw new CopyError(`The ${id} holds up to 10 points, not ${items.length}: use fewer.`);
				for (const it of items) requireGlyphs(f.sans, it, id);
				const numbered = opt(id, 'style') === 'numbered';
				let size = Math.max(small, Math.min(base * 0.032, r.h / (items.length * 1.6))) * k;
				let sets: (Fitted | undefined)[] = [];
				const lead = 1.3;
				for (; size >= small - 0.01; size *= 0.96) {
					const indent = numbered ? measure(f.mono, '00', size * 0.8) + size * 0.7 : size * 1.2;
					sets = items.map((it) => setAt(f.sans, it, size, { size, min: size, maxWidth: r.w - indent, leading: lead }, false));
					const h = sets.reduce((n, s) => n + (s?.height ?? 1e9), 0) + size * 0.45 * (items.length - 1);
					if (sets.every(Boolean) && h <= r.h + 0.5) break;
					if (k !== 1) throw tooLong(id, `${id} at that size`);
				}
				if (size < small - 0.01) throw tooLong(id);
				const indent = numbered ? measure(f.mono, '00', size * 0.8) + size * 0.7 : size * 1.2;
				let y = r.y;
				const ink: Rect[] = [];
				const marks: Rect[] = [];
				const drawnNums: string[] = [];
				sets.forEach((s, n) => {
					const set = s!;
					if (numbered) {
						const label = String(n + 1).padStart(2, '0');
						const ns = setAt(f.mono, label, size * 0.8, { size: size * 0.8, min: size * 0.8, maxWidth: indent, leading: lead / 0.8 }, true)!;
						const np = placeWords(ns, r.x, y + (set.line - ns.line) / 2, c.muted);
						out.push(np.svg);
						marks.push(...np.ink);
						drawnNums.push(label);
					} else {
						const d = size * 0.22;
						out.push(diamond(r.x + d, y + set.line / 2, d, c.ink));
					}
					const p = placeWords(set, r.x + indent, y, c.ink);
					out.push(p.svg);
					ink.push(...p.ink);
					y += set.height + size * 0.45;
				});
				report({ id, kind: 'text', box: unionOf(ink), ink, over, text: { asked: items.join(' '), drawn: sets.map((s) => s!.drawn).join(' '), size, color: c.ink, ground: [c.bg] }, can: PART });
				if (marks.length) report({ id: `${id}-numbers`, kind: 'text', box: unionOf(marks), ink: marks, over, text: { asked: drawnNums.join(' '), drawn: drawnNums.join(' '), size: size * 0.8, color: c.muted, ground: [c.bg], own: true } });
				break;
			}
			case 'button': {
				const t = words(id, 'text');
				requireGlyphs(f.medium, t, id);
				let fs = Math.max(small, Math.min(r.h / 2.4, base * 0.02)) * k;
				while (measure(f.medium, t, fs) + fs * 2 > r.w && fs > small) fs = Math.max(small, fs * 0.95);
				if (measure(f.medium, t, fs) + fs * 2 > r.w + 0.5 || fs < small - 0.01) throw tooLong(id);
				const set = setAt(f.medium, t, fs, { size: fs, min: fs, maxWidth: r.w, leading: 1.2 }, false)!;
				const bw = set.width + fs * 2;
				const bh = Math.min(fs * 2.4, Math.max(r.h, fs * 1.7));
				const bx = align() === 'center' ? r.x + (r.w - bw) / 2 : align() === 'right' ? right(r) - bw : r.x;
				const by = r.y + (r.h - bh) / 2;
				out.push(`<path d="${chamfer(bx, by, bw, bh, bh * 0.2)}" fill="${c.window}"/>`);
				const p = placeWords(set, bx + fs, by + (bh - set.height) / 2, c.windowInk);
				out.push(p.svg);
				report({ id, kind: 'text', box: { x: bx, y: by, w: bw, h: bh }, ink: [{ x: bx, y: Math.max(by, r.y), w: bw, h: Math.min(bh, r.h) }], over, text: { asked: t, drawn: set.drawn, size: fs, color: c.windowInk, ground: [c.window] }, can: TEXT });
				break;
			}
			case 'search': {
				const t = words(id, 'text');
				const fs0 = Math.max(small, Math.min(r.h / 2.6, base * 0.022));
				const set = fit(id, t, f.sans, fs0, { ...r, w: r.w - fs0 * 3, h: Math.max(r.h - fs0 * 1.2, fs0 * 1.3) }, 1.3);
				const bh = Math.min(r.h, Math.max(set.height + set.size * 1.2, set.size * 2.4));
				const box = { x: r.x, y: r.y + (r.h - bh) / 2, w: r.w, h: bh };
				out.push(`<path d="${chamfer(box.x + lw / 2, box.y + lw / 2, box.w - lw, box.h - lw, bh * 0.2)}" fill="${c.bg}" stroke="${c.ink}" stroke-opacity="0.45" stroke-width="${num(lw, 3)}"/>`);
				const d = set.size * 0.3;
				out.push(`<path d="M${num(box.x + set.size)} ${num(box.y + bh / 2 - d)}L${num(box.x + set.size + d)} ${num(box.y + bh / 2)}L${num(box.x + set.size)} ${num(box.y + bh / 2 + d)}L${num(box.x + set.size - d)} ${num(box.y + bh / 2)}Z" fill="none" stroke="${c.ink}" stroke-width="${num(lw, 3)}"/>`);
				const p = placeWords(set, box.x + set.size * 2, box.y + (bh - set.height) / 2, c.muted);
				out.push(p.svg);
				report({ id, kind: 'text', box, ink: p.ink, over, text: { asked: t, drawn: set.drawn, size: set.size, color: c.muted, ground: [c.bg] }, can: PART });
				break;
			}
			case 'chart':
				chart(id, r, c, over);
				break;
			case 'table': {
				const rows = words(id, 'rows').split('\n').map((l) => l.split('|').map((x) => x.trim()));
				if (rows.length < 2) throw new CopyError(`The ${id} needs a head row and at least one row, a line each.`);
				const cols = Math.max(...rows.map((x) => x.length));
				if (rows.some((x) => x.length !== cols)) throw new CopyError(`Every row of the ${id} needs ${cols} cells, split by |.`);
				for (const row of rows) for (const cell of row) requireGlyphs(f.sans, cell, id);
				const gap = Math.max(8 * u, r.w * 0.03);
				const cw = (r.w - gap * (cols - 1)) / cols;
				let size = Math.max(small, Math.min(base * 0.024, r.h / (rows.length * 2))) * k;
				let sets: (Fitted | undefined)[][] = [];
				let heights: number[] = [];
				for (; size >= small - 0.01; size *= 0.96) {
					sets = rows.map((row, n) => row.map((cell) => (cell ? setAt(n ? f.sans : f.mono, cell, size, { size, min: size, maxWidth: cw, maxLines: 3, leading: 1.25 }, false) : undefined)));
					heights = sets.map((row) => Math.max(size * 1.25, ...row.map((s) => s?.height ?? 0)));
					const ok = sets.every((row, n) => row.every((s, j) => s || !rows[n]![j]));
					if (ok && heights.reduce((a, b) => a + b + size * 0.9, 0) <= r.h + 0.5) break;
					if (k !== 1) throw tooLong(id, `${id} at that size`);
				}
				if (size < small - 0.01) throw tooLong(id);
				let y = r.y;
				const ink: Rect[] = [];
				let rules = '';
				sets.forEach((row, n) => {
					row.forEach((s, j) => {
						if (!s) return;
						const p = placeWords(s, r.x + j * (cw + gap), y, n ? c.ink : c.muted);
						out.push(p.svg);
						ink.push(...p.ink);
					});
					y += heights[n]! + size * 0.45;
					if (n < rows.length - 1) rules += `<rect x="${num(r.x)}" y="${num(y - lw / 2)}" width="${num(r.w)}" height="${num(lw)}"/>`;
					y += size * 0.45;
				});
				out.push(`<g fill="${c.ink}" fill-opacity="0.35">${rules}</g>`);
				const asked = rows.flat().filter(Boolean).join(' ');
				report({ id, kind: 'text', box: unionOf(ink), ink, over, text: { asked, drawn: sets.flat().filter(Boolean).map((s) => s!.drawn).join(' '), size, color: c.ink, ground: [c.bg] }, can: PART });
				break;
			}
			case 'code': {
				const t = doc.copy[`${id}.text`] ?? '';
				const pad = Math.max(10 * u, Math.min(r.h, r.w) * 0.12);
				const inner = inflate(r, -pad);
				if (inner.h <= 0 || inner.w <= 0) throw tooLong(id);
				const set = fit(id, t.trim(), f.mono, Math.min(base * 0.02, inner.h), inner, 1.5);
				const box = { x: r.x, y: r.y, w: r.w, h: Math.min(r.h, set.height + pad * 2) };
				out.push(`<path d="${chamfer(box.x + lw / 2, box.y + lw / 2, box.w - lw, box.h - lw, Math.min(pad, box.h * 0.2))}" fill="${c.bg}" stroke="${c.ink}" stroke-opacity="0.45" stroke-width="${num(lw, 3)}"/>`);
				const p = placeWords(set, inner.x, box.y + pad, c.ink);
				out.push(p.svg);
				report({ id, kind: 'text', box: p.box, ink: p.ink, over, text: { asked: t.trim(), drawn: set.drawn, size: set.size, color: c.ink, ground: [c.bg] }, can: PART });
				break;
			}
			case 'divider': {
				const d = Math.max(3, 4 * u);
				const y = r.y + r.h / 2;
				out.push(`<rect x="${num(r.x + d)}" y="${num(y - lw / 2)}" width="${num(r.w - d * 2)}" height="${num(lw)}" fill="${c.ink}" fill-opacity="0.45"/>${diamond(r.x + d, y, d, c.ink)}${diamond(right(r) - d, y, d, c.ink)}`);
				report({ id, kind: 'art', box: { x: r.x, y: y - d, w: r.w, h: d * 2 }, over, can: { hide: true } });
				break;
			}
			case 'icon': {
				const name = opt(id, 'name') ?? 'parcel';
				if (!iconNames().includes(name)) throw new Error(`Unknown icon "${name}". Icons: ${iconNames().join(', ')}.`);
				const svg = readFileSync(pkgPath('brand', 'icons', `${name}.svg`), 'utf8');
				const vb = svg.match(/viewBox="([\d.\s-]+)"/)?.[1]!.trim().split(/\s+/).map(Number) ?? [0, 0, 24, 24];
				const inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace(/currentColor/g, c.ink);
				const sz = Math.min(r.w, r.h) * k;
				const s = sz / Math.max(vb[2]!, vb[3]!);
				const box = { x: r.x + (r.w - vb[2]! * s) / 2, y: r.y + (r.h - vb[3]! * s) / 2, w: vb[2]! * s, h: vb[3]! * s };
				// Hairline icons keep a line a little over a pixel at any size.
				out.push(`<g transform="translate(${num(box.x - vb[0]! * s)} ${num(box.y - vb[1]! * s)}) scale(${num(s, 5)})" stroke-width="${num(Math.max(1, 1.5 * u) / s, 4)}">${inner}</g>`);
				report({ id, kind: 'key', box, over, can: PART });
				break;
			}
			default:
				throw new Error(`Unknown block type "${block.type}".`);
		}
	});
	for (const run of later) run();
	return { svg: out.join(''), layers };

	function scaled(r: Rect, k: number): Rect {
		if (k === 1) return r;
		const w = r.w * k;
		const h = r.h * k;
		return { x: r.x + (r.w - w) / 2, y: r.y + (r.h - h) / 2, w, h };
	}

	function wire(id: string, r: Rect, asked: string | undefined, c: GroundColors, over: string[]) {
		const pool = wireScenes();
		const scene = asked ?? pool[(pool.indexOf(imageDocument().art.post) + (doc.seed ?? 0)) % pool.length]!;
		if (!pool.includes(scene)) throw new Error(`Unknown scene "${scene}". Scenes: ${pool.join(', ')}.`);
		const art = wireDrawing(scene, c.dark || g0.dark ? 'dark' : 'light');
		const k = Math.min(r.w / art.width, r.h / art.height) * (edit(id).scale ?? 1);
		const box = { x: r.x + (r.w - art.width * k) / 2, y: r.y + (r.h - art.height * k) / 2, w: art.width * k, h: art.height * k };
		out.push(`<g transform="translate(${num(box.x)} ${num(box.y)}) scale(${num(k, 5)})">${art.inner}</g>`);
		report({ id, kind: 'art', box, over, can: PART });
	}

	function chart(id: string, r: Rect, c: GroundColors, over: string[]) {
		const rows = chartRows(doc.copy[`${id}.data`] ?? '');
		const title = words(id, 'title');
		const kind = opt(id, 'kind') ?? 'bar';
		for (const row of rows) requireGlyphs(f.sans, `${row.label} ${row.text}`, id);
		const k = edit(id).scale ?? 1;
		let area = r;
		if (title) {
			const ts = fitWords(f.medium, title, { size: Math.max(small, Math.min(r.h * 0.12, Math.min(W, H * 1.6) * 0.03)), min: small, maxWidth: r.w, maxHeight: r.h * 0.25, leading: 1.2 });
			if (!ts || ts.broke) throw tooLong(`${id} title`);
			const p = placeWords(ts, r.x, r.y, c.ink);
			out.push(p.svg);
			report({ id: `${id}-title`, kind: 'text', box: p.box, ink: p.ink, over, text: { asked: title, drawn: ts.drawn, size: ts.size, color: c.ink, ground: [c.bg] } });
			area = { ...r, y: r.y + ts.height + small, h: r.h - ts.height - small };
		}
		const max = Math.max(...rows.map((x) => x.value), 1e-9);
		const ink: Rect[] = [];
		const drawn: string[] = [];
		const label = (t: string, x: number, y: number, size: number, maxW: number, color = c.ink, al: Align = 'left') => {
			const s = setAt(f.sans, t, size, { size, min: size, maxWidth: maxW, maxLines: 1, leading: 1.2 }, false);
			if (!s) return undefined;
			const p = placeWords(s, al === 'right' ? x - s.width : al === 'center' ? x - s.width / 2 : x, y, color);
			out.push(p.svg);
			ink.push(...p.ink);
			drawn.push(s.drawn);
			return s;
		};
		const art: Rect[] = [];
		let size = Math.max(small, Math.min(Math.min(W, H * 1.6) * 0.022, area.h / (rows.length * 2.2))) * k;
		if (kind === 'bar') {
			for (; size >= small - 0.01; size *= 0.96) {
				const lw0 = Math.max(...rows.map((x) => measure(f.sans, x.label, size)));
				const vw = Math.max(...rows.map((x) => measure(f.sans, x.text, size)));
				if (lw0 <= area.w * 0.42 && rows.length * size * 2 <= area.h + 0.5 && area.w - lw0 - vw - size * 2 > size * 2) break;
				if (k !== 1) throw tooLong(id, `${id} at that size`);
			}
			if (size < small - 0.01) throw tooLong(id);
			const lw0 = Math.max(...rows.map((x) => measure(f.sans, x.label, size)));
			const vw = Math.max(...rows.map((x) => measure(f.sans, x.text, size)));
			const row = area.h / rows.length;
			const bh = Math.min(row * 0.62, size * 1.5);
			const full = area.w - lw0 - vw - size * 2;
			let svg = '';
			rows.forEach((x, n) => {
				const cy = area.y + n * row + row / 2;
				label(x.label, area.x, cy - size * 0.6, size, lw0 + 1);
				const bx = area.x + lw0 + size;
				const w = Math.max(bh * 0.5, (full * x.value) / max);
				svg += `<rect x="${num(bx)}" y="${num(cy - bh / 2)}" width="${num(w)}" height="${num(bh)}" fill="none" stroke="${c.ink}" stroke-opacity="0.85" stroke-width="${num(lw, 3)}"/>`;
				let hatch = '';
				for (let xx = bx + 6 * u; xx < bx + w; xx += 6 * u) hatch += `M${num(xx)} ${num(cy - bh / 2)}V${num(cy + bh / 2)}`;
				if (hatch) svg += `<path d="${hatch}" fill="none" stroke="${c.ink}" stroke-opacity="0.55" stroke-width="${num(lw, 3)}"/>`;
				art.push({ x: bx, y: cy - bh / 2, w, h: bh });
				label(x.text, bx + w + size * 0.5, cy - size * 0.6, size, vw + 2);
			});
			out.push(svg);
		} else if (kind === 'line') {
			if (rows.length < 2) throw new CopyError(`A line chart needs at least two rows.`);
			for (; size >= small - 0.01; size *= 0.96) {
				const slot = area.w / rows.length;
				if (rows.every((x) => measure(f.sans, `${x.label} ${x.text}`, size) <= slot * 0.96) && area.h > size * 6) break;
				if (k !== 1) throw tooLong(id, `${id} at that size`);
			}
			if (size < small - 0.01) throw tooLong(id);
			const slot = area.w / rows.length;
			const plot = { x: area.x + slot / 2, y: area.y + size, w: area.w - slot, h: area.h - size * 3.4 };
			const pts = rows.map((x, n) => [plot.x + (plot.w * n) / (rows.length - 1), plot.y + plot.h - (plot.h * x.value) / max] as [number, number]);
			const line = pts.map(([x, y], n) => `${n ? 'L' : 'M'}${num(x)} ${num(y)}`).join('');
			out.push(`<path d="${line}" fill="none" stroke="${c.ink}" stroke-width="${num(Math.max(1, 1.6 * u), 3)}" stroke-linejoin="round"/>${pts.map(([x, y]) => diamond(x, y, 5 * u, c.ink)).join('')}`);
			art.push(...pts.map(([x, y]) => ({ x: x - 5 * u, y: y - 5 * u, w: 10 * u, h: 10 * u })));
			rows.forEach((x, n) => label(`${x.label} ${x.text}`, pts[n]![0], bottom(area) - size * 1.2, size, slot * 0.96, c.ink, 'center'));
		} else {
			const total = rows.reduce((n, x) => n + x.value, 0) || 1;
			const R = Math.min(area.h / 2, area.w * 0.26);
			const cx = area.x + R;
			const cy = area.y + area.h / 2;
			const shades = [0.95, 0.65, 0.4, 0.22, 0.12];
			let a = -Math.PI / 2;
			let svg = '';
			rows.forEach((x, n) => {
				const b = a + (Math.PI * 2 * x.value) / total;
				const r1 = R * 0.83;
				const large2 = b - a > Math.PI ? 1 : 0;
				svg += `<path d="M${num(cx + r1 * Math.cos(a))} ${num(cy + r1 * Math.sin(a))}A${num(r1)} ${num(r1)} 0 ${large2} 1 ${num(cx + r1 * Math.cos(b - 0.0001))} ${num(cy + r1 * Math.sin(b - 0.0001))}" fill="none" stroke="${c.ink}" stroke-opacity="${shades[n % shades.length]}" stroke-width="${num(R * 0.3)}"/>`;
				a = b;
			});
			out.push(svg);
			art.push({ x: cx - R, y: cy - R, w: R * 2, h: R * 2 });
			const lx = cx + R + R * 0.3;
			const room = right(area) - lx - size;
			for (; size >= small - 0.01; size *= 0.96) {
				if (rows.every((x) => measure(f.sans, `${x.label} ${x.text}`, size) <= room - size * 1.4) && rows.length * size * 1.7 <= area.h) break;
				if (k !== 1) throw tooLong(id, `${id} at that size`);
			}
			if (size < small - 0.01) throw tooLong(id);
			rows.forEach((x, n) => {
				const y = cy - (rows.length * size * 1.7) / 2 + n * size * 1.7;
				out.push(`<path d="M${num(lx + size * 0.4)} ${num(y + size * 0.2)}L${num(lx + size * 0.8)} ${num(y + size * 0.6)}L${num(lx + size * 0.4)} ${num(y + size)}L${num(lx)} ${num(y + size * 0.6)}Z" fill="${c.ink}" fill-opacity="${shades[n % shades.length]}"/>`);
				label(`${x.label} ${x.text}`, lx + size * 1.4, y, size, room);
			});
		}
		if (drawn.length !== rows.length * (kind === 'bar' ? 2 : 1)) throw tooLong(id);
		report({ id, kind: 'text', box: unionOf(ink), ink, over: [`${id}-art`, ...over], text: { asked: rows.map((x) => `${x.label} ${x.text}`).join(' '), drawn: kind === 'bar' ? rows.map((_, n) => `${drawn[n * 2]} ${drawn[n * 2 + 1]}`).join(' ') : drawn.join(' '), size, color: c.ink, ground: [c.bg] }, can: PART });
		report({ id: `${id}-art`, kind: 'art', box: unionOf(art), ink: art, over: [id, ...over] });
	}
}

/* ------------------------------------------------------------ recipes */

type Recipe = { blocks: ComposeBlock[]; copy: Record<string, string>; theme?: string; options?: Record<string, string> };
const at = (col: number, row: number, cols: number, rows: number) => ({ col, row, cols, rows });

/** Each image template as blocks: the same words on the grid, the same parts, so any of them can start a compose design. */
export function recipeFor(template: string, size: string, copy: Record<string, string>): Recipe | undefined {
	const f = FORMATS[size];
	if (f && f.width / f.height > 2.2) return stripRecipe(template, copy);
	const tall = f ? f.height / f.width > 0.9 : false;
	const has = (k: string) => Boolean(copy[k]?.trim());
	const blocks: ComposeBlock[] = [];
	const out: Record<string, string> = {};
	const add = (id: string, type: string, where: ComposeBlock['at'], words: Record<string, string | undefined> = {}) => {
		blocks.push({ id, type, at: where });
		for (const [slot, v] of Object.entries(words)) if (v?.trim()) out[`${id}.${slot}`] = v;
	};
	// The column of words: top left on wide sizes, across the top on tall ones; the visual beside or under it.
	const col = tall ? { x: 0, w: 12 } : { x: 0, w: 6 };
	const vis = tall ? at(0, 6, 12, 4) : at(7, 0, 5, 12);
	const logoAt = tall ? at(0, 10, 4, 2) : at(0, 10, 3, 2);
	// On tall sizes the words take the top half: the headline, the line under it, then one row for a label.
	const head = (row: number, rows: number) => add('headline', 'headline', tall ? at(0, 0, 12, 3) : at(col.x, row, col.w, rows), { text: copy.headline });
	const body = (row: number, rows = 2, id = 'body', slot = 'body') => has(slot) && add(id, 'body', tall ? at(0, 3, 12, 2) : at(col.x, row, col.w, rows), { text: copy[slot] });
	const extra = (row: number, n: 0 | 1) => (tall ? at(n * 6, 5, 6, 1) : at(col.x, row, col.w, 1));
	const logo = () => add('logo', 'logo', logoAt);
	switch (template) {
		case 'headline':
		case 'subtext':
		case 'announcement':
			if (has('badge')) add('badge', 'badge', at(0, 0, 6, 1), { text: copy.badge });
			add('headline', 'headline', at(0, 1, tall ? 12 : 9, 5), { text: copy.headline });
			if (has('body')) add('body', 'body', at(0, 6, tall ? 12 : 8, 2), { text: copy.body });
			if (has('footer')) add('footer', 'body', at(tall ? 6 : 7, 10, tall ? 6 : 5, 2), { text: copy.footer });
			logo();
			break;
		case 'quote':
			add('quote', 'quote', at(0, 0, tall ? 12 : 10, 8), { text: copy.quote, attribution: copy.attribution });
			if (has('footer')) add('footer', 'body', at(tall ? 6 : 7, 10, tall ? 6 : 5, 2), { text: copy.footer });
			logo();
			break;
		case 'frame':
		case 'photo':
			head(0, 5);
			body(5);
			if (has('callout')) add('callout', 'badge', extra(8, 0), { text: copy.callout?.replace(/\n/g, ' ') });
			if (has('footer')) add('footer', 'body', extra(9, 1), { text: copy.footer });
			add('picture', 'picture', vis);
			logo();
			break;
		case 'backdrop':
			add('pattern', 'pattern', at(0, 0, 12, 12));
			add('art', 'art', at(2, 1, 8, 8));
			add('mark', 'mark', at(9, 9, 3, 3));
			break;
		case 'identity':
			add('pattern', 'pattern', at(0, 0, 12, 12));
			add('panel', 'panel', at(1, 2, 10, 8));
			add('logo', 'logo', at(2, 4, 8, 4));
			break;
		case 'window':
		case 'tag':
			add('pattern', 'pattern', at(0, 0, 12, 12));
			add('panel', 'panel', at(1, 1, 10, 8));
			add('headline', 'headline', at(2, 2, 8, 4), { text: copy.headline });
			if (has('body')) add('body', 'body', at(2, 6, 8, 2), { text: copy.body });
			add('logo', 'logo', at(0, 10, 3, 2));
			return template === 'tag' ? { blocks, copy: out, options: { 'panel.style': 'filled' } } : { blocks, copy: out };
		case 'panel':
			// The window round everything, the words a cell in from its edges.
			add('frame', 'panel', at(0, 0, 12, 12));
			add('headline', 'headline', tall ? at(1, 1, 10, 4) : at(1, 1, 5, 4), { text: copy.headline });
			if (has('body')) add('body', 'body', tall ? at(1, 5, 10, 1) : at(1, 5, 5, 2), { text: copy.body });
			add('art', 'art', tall ? at(1, 6, 10, 3) : at(7, 1, 4, 10));
			add('logo', 'logo', tall ? at(1, 9, 4, 2) : at(1, 9, 3, 2));
			break;
		case 'post':
			head(0, 5);
			body(5);
			add('art', 'art', vis);
			logo();
			break;
		case 'parcels':
		case 'scene':
			add('pattern', 'pattern', at(0, 0, 12, 12));
			head(0, 5);
			body(5);
			if (has('callout')) add('callout', 'badge', extra(8, 0), { text: copy.callout?.replace(/\n/g, ' ') });
			if (has('labels')) add('labels', 'body', extra(9, 1), { text: copy.labels?.replace(/\s*\|\s*/g, ' ') });
			add(template === 'scene' ? 'scene' : 'art', template === 'scene' ? 'scene' : 'art', vis);
			logo();
			break;
		case 'chart':
		case 'line':
		case 'donut':
			head(0, 4);
			body(4);
			add('chart', 'chart', tall ? at(0, 6, 12, 4) : at(7, 1, 5, 10), { data: copy.chart });
			logo();
			return { blocks, copy: out, options: { 'chart.kind': template === 'chart' ? 'bar' : template } };
		case 'app':
			head(0, 4);
			body(4);
			if (has('question')) add('question', 'search', tall ? at(0, 6, 12, 1) : at(7, 1, 5, 2), { text: copy.question });
			if (has('suggestions')) add('suggestions', 'list', tall ? at(0, 7, 12, 2) : at(7, 4, 5, 4), { items: copy.suggestions });
			if (has('place')) add('place', 'badge', tall ? at(0, 9, 12, 1) : at(7, 9, 5, 1), { text: copy.place });
			logo();
			break;
		case 'partner':
			add('pattern', 'pattern', at(0, 0, 12, 12));
			add('panel', 'panel', at(1, 0, 10, 5));
			add('logo', 'logo', at(2, 1, 4, 3));
			add('partner', 'headline', at(7, 1, 3, 3), { text: copy.partner });
			add('headline', 'headline', at(0, 6, 12, 3), { text: copy.headline });
			if (has('body')) add('body', 'body', at(0, 9, 12, 2), { text: copy.body });
			break;
		case 'stat':
			head(0, 4);
			body(4);
			add('stat', 'stat', tall ? at(0, 6, 12, 4) : at(7, 2, 5, 6), { value: copy.stat });
			logo();
			break;
		case 'event':
			head(0, 5);
			body(5);
			add('event', 'card', tall ? at(0, 6, 12, 4) : at(7, 1, 5, 7), { heading: copy.date, text: copy.speaker });
			logo();
			break;
		case 'pricing':
			head(0, 4);
			body(4);
			add('price', 'headline', tall ? at(0, 6, 6, 4) : at(7, 0, 5, 4), { text: copy.price });
			if (has('items')) add('items', 'list', tall ? at(6, 6, 6, 4) : at(7, 5, 5, 5), { items: copy.items });
			logo();
			break;
		case 'compare':
			head(0, 4);
			body(4);
			add('left', 'list', tall ? at(0, 6, 6, 4) : at(7, 0, 5, 5), { items: copy.left });
			add('right', 'list', tall ? at(6, 6, 6, 4) : at(7, 6, 5, 5), { items: copy.right });
			logo();
			break;
		case 'flow':
			head(0, 4);
			body(4);
			add('steps', 'list', tall ? at(0, 6, 12, 4) : at(7, 1, 5, 9), { items: copy.steps });
			logo();
			return { blocks, copy: out, options: { 'steps.style': 'numbered' } };
		case 'split':
			head(0, 4);
			body(4);
			add('before', 'picture', tall ? at(0, 6, 6, 3) : at(7, 0, 5, 5));
			add('after', 'picture', tall ? at(6, 6, 6, 3) : at(7, 6, 5, 5));
			if (has('labels')) add('labels', 'badge', tall ? at(0, 5, 12, 1) : at(0, 7, 6, 1), { text: copy.labels?.replace(/\s*\|\s*/g, ' ') });
			logo();
			break;
		default:
			return undefined;
	}
	return { blocks, copy: out };
}

/** Headers and covers: a grid of 12 by 6; the headline top left above the profile picture's corner, the rest a third of
 * the way in, the visual at the right and the logo under it. */
function stripRecipe(template: string, copy: Record<string, string>): Recipe | undefined {
	const grid = { cols: 12, rows: 6 };
	const has = (k: string) => Boolean(copy[k]?.trim());
	const blocks: ComposeBlock[] = [];
	const out: Record<string, string> = {};
	const add = (id: string, type: string, where: ComposeBlock['at'], words: Record<string, string | undefined> = {}) => {
		blocks.push({ id, type, at: where });
		for (const [slot, v] of Object.entries(words)) if (v?.trim()) out[`${id}.${slot}`] = v;
	};
	const done = (options?: Record<string, string>) => ({ grid, blocks, copy: out, ...(options ? { options } : {}) }) as Recipe & { grid: typeof grid };
	const slots = [at(4, 4, 4, 1), at(4, 5, 4, 1)];
	let next = 0;
	const extra = (id: string, type: string, words: Record<string, string | undefined>) => {
		const where = slots[next++];
		if (!where) throw new CopyError(`A header holds two short lines beside the headline: leave out the ${id}.`);
		add(id, type, where, words);
	};
	const words = () => {
		add('headline', 'headline', at(0, 0, 7, 2), { text: copy.headline });
		if (has('body')) add('body', 'body', at(4, 2, 4, 2), { text: copy.body });
	};
	const logo = () => add('logo', 'logo', at(9, 4, 3, 2));
	switch (template) {
		case 'backdrop':
			add('pattern', 'pattern', at(0, 0, 12, 6));
			add('art', 'art', at(4, 0, 4, 6));
			add('mark', 'mark', at(10, 4, 2, 2));
			return done();
		case 'identity':
			add('pattern', 'pattern', at(0, 0, 12, 6));
			add('panel', 'panel', at(4, 1, 6, 4));
			add('logo', 'logo', at(5, 2, 4, 2));
			return done();
		case 'window':
		case 'tag':
			add('pattern', 'pattern', at(0, 0, 12, 6));
			add('panel', 'panel', at(4, 0, 8, 6));
			add('headline', 'headline', at(5, 1, 6, 2), { text: copy.headline });
			if (has('body')) add('body', 'body', at(5, 3, 6, 2), { text: copy.body });
			add('logo', 'logo', at(0, 0, 3, 2));
			return done(template === 'tag' ? { 'panel.style': 'filled' } : undefined);
		case 'partner':
			add('logo', 'logo', at(0, 0, 3, 2));
			add('partner', 'headline', at(4, 0, 3, 2), { text: copy.partner });
			add('headline', 'headline', at(4, 2, 8, 2), { text: copy.headline });
			if (has('body')) add('body', 'body', at(4, 4, 8, 1), { text: copy.body });
			return done();
		case 'quote':
			add('quote', 'quote', at(0, 0, 8, 4), { text: copy.quote, attribution: copy.attribution });
			if (has('footer')) add('footer', 'body', at(4, 5, 4, 1), { text: copy.footer });
			logo();
			return done();
	}
	words();
	if (has('badge')) extra('badge', 'badge', { text: copy.badge });
	if (has('callout')) extra('callout', 'badge', { text: copy.callout?.replace(/\n/g, ' ') });
	if (has('labels')) extra('labels', 'badge', { text: copy.labels?.replace(/\s*\|\s*/g, ' ') });
	if (has('place') && template !== 'app') extra('place', 'badge', { text: copy.place });
	if (has('footer')) extra('footer', 'body', { text: copy.footer });
	const vis = at(8, 0, 4, 4);
	const half = [at(8, 0, 2, 4), at(10, 0, 2, 4)];
	switch (template) {
		case 'headline':
		case 'subtext':
		case 'announcement':
			break;
		case 'frame':
		case 'photo':
			add('picture', 'picture', vis);
			break;
		case 'post':
		case 'panel':
		case 'parcels':
			add('art', 'art', vis);
			break;
		case 'scene':
			add('scene', 'scene', vis);
			break;
		case 'chart':
		case 'line':
		case 'donut':
			add('chart', 'chart', vis, { data: copy.chart });
			logo();
			return done({ 'chart.kind': template === 'chart' ? 'bar' : template });
		case 'app':
			if (has('question')) add('question', 'search', at(8, 0, 4, 2), { text: copy.question });
			if (has('suggestions')) add('suggestions', 'list', at(8, 2, 4, 3), { items: copy.suggestions });
			if (has('place')) add('place', 'badge', at(8, 5, 4, 1), { text: copy.place });
			add('logo', 'logo', at(4, 4, 3, 2));
			return done();
		case 'stat':
			add('stat', 'stat', vis, { value: copy.stat });
			break;
		case 'event':
			add('event', 'card', vis, { heading: copy.date, text: copy.speaker });
			break;
		case 'pricing':
			add('price', 'headline', half[0]!, { text: copy.price });
			if (has('items')) add('items', 'list', half[1]!, { items: copy.items });
			break;
		case 'compare':
			add('left', 'list', half[0]!, { items: copy.left });
			add('right', 'list', half[1]!, { items: copy.right });
			break;
		case 'flow':
			add('steps', 'list', vis, { items: copy.steps });
			logo();
			return done({ 'steps.style': 'numbered' });
		case 'split':
			add('before', 'picture', half[0]!);
			add('after', 'picture', half[1]!);
			break;
		default:
			return undefined;
	}
	logo();
	return done();
}
