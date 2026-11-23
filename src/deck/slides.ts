import { readFileSync } from 'node:fs';
import { pkgPath } from '../lib/paths.js';
import { brand } from '../lib/brand.js';
import { wireDrawing, wireScenes } from '../illustrate/wire.js';
import { cleanContent, defaultTheme, requireContent, type Size } from '../image/catalog.js';
import { checkEdits, editOf, frameOf, inflate, LayoutError, over, right, shift, bottom, type DrawnLayer, type Edits, type Rect } from '../image/layers.js';
import { lockupSvg, lockupWidth, markSvg, markWidth } from '../image/logo.js';
import { coverSvg, loadPicture } from '../image/picture.js';
import { chamfer, contourSvg, diamond, groundColors, imageDocument, posterCan, posterDraw, posterFloors, type Crop, type Drawing, type GroundColors } from '../image/poster.js';
import { CopyError, fitOrFail, loadFaces, num, placeWords, requireGlyphs, setAt, type Faces, type Fitted, type Font } from '../image/type.js';

// Deck slides at 1920 by 1080 (brand/assets/deck.json). Cover, section, bullets, stat, quote and image follow the
// illustration skill's slide rule (the lockup top left at 64, a 104 headline bottom left, a drawing that may bleed off
// the right and bottom) with the posts' logomark bottom right; statement, chart, poster and closing draw the
// share-image layouts at slide size. Copy is fitted by stepping the size down, never by cropping words: words that do
// not fit at the smallest readable size are an error. Every slide reports the layers it drew and takes layer edits.

type SlideDoc = { description: string; ground: string; required: string[]; optional: string[]; sample: Record<string, string> };
type DeckDoc = { width: number; height: number; pdfPageWidthPt: number; metrics: Record<string, number>; slides: Record<string, SlideDoc> };

let doc: DeckDoc | undefined;
export const deckDoc = (): DeckDoc => (doc ??= JSON.parse(readFileSync(pkgPath('brand', 'assets', 'deck.json'), 'utf8')) as DeckDoc);
export const slideTypes = () => Object.keys(deckDoc().slides);

export type Slide = { type: string; ground?: string; [slot: string]: string | undefined };

const SLOT_LIMITS: Record<string, number> = { title: 160, subtitle: 280, label: 24, items: 600, stat: 12, progress: 6, quote: 320, attribution: 80, url: 64, image: 4096, scene: 32, chart: 600, template: 32, callout: 80, partner: 40, labels: 60, question: 120, suggestions: 240, place: 40 };

export function slotNames(type: string): string[] {
	const s = deckDoc().slides[type];
	return [...s.required, ...s.optional];
}

const SLOT_ALIASES: Record<string, string> = { headline: 'title', body: 'subtitle', badge: 'label' };

/** Checks one slide's slots: known type, known slots, lengths, required slots present. */
export function cleanSlide(raw: Record<string, unknown>, index: number): Slide {
	const type = String(raw.type ?? '');
	const where = `Slide ${index + 1}`;
	if (!deckDoc().slides[type]) throw new Error(`${where}: unknown type "${type}". Types: ${slideTypes().join(', ')}.`);
	const allowed = new Set(['type', 'ground', ...slotNames(type)]);
	const out: Slide = { type };
	for (const [name, value] of Object.entries(raw)) {
		// The shared names for this brand's older slot names.
		const key = SLOT_ALIASES[name] && !allowed.has(name) ? SLOT_ALIASES[name] : name;
		if (!allowed.has(key)) throw new Error(`${where} (${type}): unknown slot "${name}". Slots: ${slotNames(type).join(', ')}, ground.`);
		if (value === undefined || value === null || value === '') continue;
		if (typeof value !== 'string') throw new Error(`${where}: ${key} must be a string.`);
		const text = value.trim();
		if (key !== 'type' && key !== 'ground' && [...text].length > (SLOT_LIMITS[key] ?? 200)) throw new Error(`${where}: ${key} is longer than ${SLOT_LIMITS[key]} characters.`);
		out[key] = text;
	}
	const missing = deckDoc().slides[type].required.filter((k) => !out[k]);
	if (missing.length) throw new Error(`${where} (${type}) needs ${missing.join(' and ')}.`);
	return out;
}

export const SLIDE_SIZE = (): Size => ({ id: 'slide', width: deckDoc().width, height: deckDoc().height });

const TEXT = (hide = false): DrawnLayer['can'] => ({ move: true, scale: [0.6, 1.5], align: true, hide });
const ART: DrawnLayer['can'] = { move: true, scale: [0.5, 1.4], hide: true };

/** The poster a slide type is drawn with, if it is one. */
const posterOf = (type: string, template?: string) => ({ statement: 'window', chart: 'chart', closing: 'identity', poster: template ?? 'parcels' })[type];

export function slideCan(type: string, template?: string): Record<string, DrawnLayer['can']> {
	const poster = posterOf(type, template);
	if (poster) return { ...posterCan(poster), ...(type === 'closing' ? { url: { hide: true, move: true } } : {}) };
	const base: Record<string, DrawnLayer['can']> = { logo: {}, mark: { hide: true } };
	switch (type) {
		case 'cover':
			return { logo: {}, headline: TEXT(), body: TEXT(true), art: ART };
		case 'section':
			return { ...base, pattern: { hide: true }, headline: TEXT(), badge: { hide: true } };
		case 'bullets':
			return { ...base, headline: TEXT(), items: { scale: [0.7, 1.3] } };
		case 'stat':
			return { ...base, pattern: { hide: true }, stat: { move: true, scale: [0.4, 1.3] }, headline: TEXT(), body: TEXT(true), ticks: { hide: true } };
		case 'quote':
			return { ...base, quote: TEXT(), attribution: { hide: true, scale: [0.8, 1.6] } };
		default:
			return { ...base, headline: TEXT(), body: TEXT(true), picture: {}, art: ART };
	}
}

/** One slide drawn: its SVG body and layers. */
export function slideDraw(slide: Slide, theme = defaultTheme(), edits: Edits = {}, sample = false, seed?: number, crop?: Crop): Drawing {
	const d = deckDoc();
	const W = d.width;
	const H = d.height;
	const m = d.metrics;
	const c: GroundColors = groundColors(slide.ground ?? d.slides[slide.type].ground, theme);
	const f: Faces = loadFaces();
	const F = frameOf(SLIDE_SIZE(), posterFloors());
	const where = `the ${slide.type} slide`;
	const can = slideCan(slide.type, slide.template);
	const layers: DrawnLayer[] = [];
	const parts: string[] = [`<rect width="${W}" height="${H}" fill="${c.bg}"/>`];
	const report = (l: Omit<DrawnLayer, 'can'>) => layers.push({ ...l, can: can[l.id] ?? {} });
	const hidden = (id: string) => Boolean(edits[id]?.hidden);
	const scaleOf = (id: string) => editOf(edits, id).scale ?? 1;
	const moved = (id: string, r: Rect) => shift(r, (editOf(edits, id).dx ?? 0) * W, (editOf(edits, id).dy ?? 0) * H);
	const clearK = imageDocument().logoRules.clear;
	const poster = posterOf(slide.type, slide.template);
	if (poster) {
		if (!imageDocument().posters[poster]) throw new Error(`Unknown poster "${poster}". Posters: ${Object.keys(imageDocument().posters).join(', ')}.`);
		const { type: _t, ground: _g, template: _p, url, ...rest } = slide;
		const content = cleanContent(rest);
		requireContent(poster, content, undefined, sample);
		const drawn = posterDraw({ template: poster, size: SLIDE_SIZE(), ground: c.id, theme, content, edits, sample, seed, crop });
		if (slide.type !== 'closing' || hidden('url')) return drawn;
		const address = url ?? new URL(brand().site ?? 'https://example.com').host;
		const set = fitOrFail(f.mono, address, { size: m.label, min: F.small, maxWidth: W - m.margin * 2, maxLines: 1, leading: 1.2 }, 'address (--url)', where);
		const at = moved('url', { x: (W - set.width) / 2, y: H - m.margin - set.height, w: set.width, h: set.height });
		const p = placeWords(set, at.x, at.y, c.ink);
		const back = inflate(p.box, 14, 10);
		return { svg: `${drawn.svg}<rect x="${num(back.x)}" y="${num(back.y)}" width="${num(back.w)}" height="${num(back.h)}" fill="${c.bg}"/>${p.svg}`, layers: [...drawn.layers, { id: 'url', kind: 'text', box: p.box, ink: p.ink, over: ['pattern'], text: { asked: address, drawn: set.drawn, size: set.size, color: c.ink, ground: [c.bg], own: !url, sample }, can: can.url ?? {} }] };
	}

	const logo = (id: 'logo' | 'mark', box: Rect, svg: string, mh: number) => {
		parts.push(svg);
		report({ id, kind: 'logo', box, over: ['pattern'], logo: { clear: mh * clearK, min: F.mark } });
	};
	const chrome = (mark = true) => {
		logo('logo', { x: m.margin, y: m.margin, w: lockupWidth(f.sans, m.lockup), h: m.lockup }, lockupSvg(f.sans, m.margin, m.margin, m.lockup, c.ink).svg, m.lockup);
		const mh = m.mark * 0.75;
		if (mark && !hidden('mark')) logo('mark', { x: W - m.margin - markWidth(mh), y: H - m.margin - mh, w: markWidth(mh), h: mh }, markSvg(W - m.margin - markWidth(mh), H - m.margin - mh, mh, c.ink), mh);
	};
	type Opt = { maxW: number; maxH?: number; maxLines?: number; lh: number; tracking?: number; min?: number };
	/** Words set at their size times the asked scale, or the nearest that fits. */
	const set = (id: string, font: Font, text: string, size: number, label: string, o: Opt): Fitted => {
		const min = Math.max(F.small, o.min ?? F.small);
		const base = fitOrFail(font, text, { size, min, maxWidth: o.maxW, maxHeight: o.maxH, maxLines: o.maxLines, leading: o.lh, tracking: o.tracking }, label, where);
		const s = scaleOf(id);
		if (s === 1) return base;
		const want = Math.max(min, base.size * s);
		const big = setAt(font, text, want, { size: want, min: want, maxWidth: o.maxW, maxHeight: o.maxH, maxLines: s > 1 ? undefined : o.maxLines, leading: o.lh, tracking: o.tracking }, false);
		if (!big) throw new LayoutError(`${id} at ${s} does not fit ${where}. Make it smaller or shorten it.`);
		return big;
	};
	const put = (id: string, fit: Fitted, asked: string, x: number, y: number, color: string, w = fit.width): Rect => {
		const at = moved(id, { x, y, w, h: fit.height });
		const p = placeWords(fit, at.x, at.y, color, editOf(edits, id).align ?? 'left', editOf(edits, id).align ? Math.max(w, fit.width) : fit.width);
		parts.push(p.svg);
		report({ id, kind: 'text', box: p.box, ink: p.ink, over: ['pattern'], text: { asked, drawn: fit.drawn, size: fit.size, color, ground: [c.bg], sample } });
		return p.box;
	};
	let fieldId: string | undefined;
	let fieldAt = 0;
	const field = (id: string) => {
		if (hidden('pattern')) return;
		fieldId = id;
		fieldAt = parts.length;
		parts.push('');
		report({ id: 'pattern', kind: 'art', box: { x: 0, y: 0, w: W, h: H }, bleeds: true });
	};
	const scene = (name: string) => {
		if (!wireScenes().includes(name)) throw new Error(`Unknown scene "${name}". Scenes: ${wireScenes().join(', ')}.`);
		return wireDrawing(name, c.dark ? 'dark' : 'light');
	};
	const top = m.margin * 3;
	const foot = H - m.margin;

	if (slide.type === 'cover') {
		const subW = W * 0.4;
		const sub = slide.subtitle && !hidden('body') ? set('body', f.sans, slide.subtitle, m.body, 'line under the headline (--body)', { maxW: subW, maxLines: 4, lh: 1.4 }) : undefined;
		const headBottom = foot - (sub ? sub.height + m.body : 0);
		const head = set('headline', f.sans, slide.title!, m.headline, 'headline', { maxW: W * 0.48, maxH: headBottom - top, lh: 1.04, tracking: -0.014, min: 48 });
		chrome(false);
		const hb = put('headline', head, slide.title!, m.margin, headBottom - head.height, c.ink, W * 0.48);
		if (sub) put('body', sub, slide.subtitle!, m.margin, foot - sub.height, c.muted, subW);
		if (!hidden('art')) {
			// The skill's slide: the drawing bleeds off the right and bottom, clear of the words.
			const art = scene(slide.scene ?? 'datacenter');
			const left = Math.max(W * 0.44, right(hb) + 48, sub ? m.margin + sub.width + 48 : 0);
			const w = W * 0.78 * scaleOf('art');
			const at = moved('art', { x: left, y: H * 0.54 - (w * art.height) / art.width / 2, w, h: (w * art.height) / art.width });
			parts.splice(1, 0, `<g transform="translate(${num(at.x)} ${num(at.y)}) scale(${num(w / art.width, 5)})">${art.inner}</g>`);
			report({ id: 'art', kind: 'art', box: at, bleeds: right(at) > W || bottom(at) > H || at.y < 0 });
		}
	} else if (slide.type === 'section') {
		field('sec');
		chrome();
		const head = set('headline', f.sans, slide.title!, m.headline, 'headline', { maxW: W * 0.74, maxH: foot - top - m.label * 3, lh: 1.04, tracking: -0.014, min: 48 });
		const y = foot - head.height;
		if (slide.label && !hidden('badge')) {
			const lab = set('badge', f.mono, slide.label, m.label, 'label (--badge)', { maxW: W * 0.5, maxLines: 1, lh: 1.2 });
			const lb = put('badge', lab, slide.label, m.margin, y - lab.height - m.label * 0.8, c.ink);
			const th = Math.round(m.label * 0.7);
			parts.push(tickRow(Math.round(right(lb) + m.label), lb.y + lb.h / 2 - th / 2, 18, 7, th, c.ink, over(c.ink, 0.35, c.bg)));
		}
		put('headline', head, slide.title!, m.margin, y, c.ink, W * 0.74);
	} else if (slide.type === 'bullets') {
		const items = (slide.items ?? '').split('|').map((i) => i.trim()).filter(Boolean);
		if (!items.length) throw new Error('bullets needs items, split by |.');
		if (items.length > 6) throw new Error(`bullets takes up to six items, not ${items.length}.`);
		chrome();
		const head = set('headline', f.sans, slide.title!, m.title, 'headline', { maxW: W * 0.76, maxH: H * 0.3, lh: 1.1, tracking: -0.014, min: 36 });
		const hb = put('headline', head, slide.title!, m.margin, top, c.ink, W * 0.76);
		const start = Math.max(top + head.height, bottom(hb)) + m.margin * 0.75;
		const rowW = W - m.margin * 2;
		const limit = H - m.margin - m.mark - 12;
		for (const it of items) requireGlyphs(f.sans, it, `item "${it}"`);
		const s = scaleOf('items');
		let rows: Fitted[] | undefined;
		let gap = 48;
		for (let size = m.item * s; size >= F.small; size -= 1) {
			gap = Math.max(20, size * 1.2);
			const got = items.map((it) => setAt(f.sans, it, size, { size, min: size, maxWidth: rowW - 40, maxLines: 3, leading: 1.3 }, size - 1 < F.small));
			if (got.every(Boolean) && got.reduce((sum, r) => sum + r!.height + gap, 0) <= limit - start) {
				rows = got as Fitted[];
				break;
			}
		}
		if (!rows) throw new CopyError(`The items do not fit ${where}. Shorten them, or split them over two slides.`);
		let y = start;
		const inks: Rect[] = [];
		for (const row of rows) {
			parts.push(`<rect x="${m.margin}" y="${Math.round(y)}" width="${num(rowW)}" height="1" fill="${c.ink}" fill-opacity="0.32"/>`);
			const p = placeWords(row, m.margin + 40, y + gap / 2, c.ink);
			parts.push(diamond(m.margin + 10, y + gap / 2 + row.line / 2, 7, c.ink) + p.svg);
			inks.push(...p.ink);
			y += row.height + gap;
		}
		const x0 = Math.min(...inks.map((r) => r.x));
		const y0 = Math.min(...inks.map((r) => r.y));
		report({ id: 'items', kind: 'text', box: { x: x0, y: y0, w: Math.max(...inks.map(right)) - x0, h: Math.max(...inks.map(bottom)) - y0 }, ink: inks, text: { asked: items.join(' '), drawn: rows.map((r) => r.drawn).join(' '), size: rows[0].size, color: c.ink, ground: [c.bg], sample } });
	} else if (slide.type === 'stat') {
		const p = slide.progress === undefined ? undefined : Number(slide.progress);
		if (p !== undefined && (!Number.isFinite(p) || p < 0 || p > 1)) throw new Error('stat progress is a share from 0 to 1, like 0.7.');
		field('stat');
		chrome();
		const sub = slide.subtitle && !hidden('body') ? set('body', f.sans, slide.subtitle, m.body, 'line under the headline (--body)', { maxW: W * 0.56, maxLines: 3, lh: 1.4 }) : undefined;
		const head = set('headline', f.sans, slide.title!, m.title, 'headline', { maxW: W * 0.66, maxH: H * 0.26, lh: 1.1, tracking: -0.014, min: 36 });
		const statMax = H - top - m.margin - head.height - (sub ? sub.height + m.body * 0.6 : 0) - m.body - m.label * 2.6;
		const stat = set('stat', f.sans, slide.stat!, m.stat, 'number (--stat)', { maxW: W - m.margin * 2, maxH: statMax, maxLines: 1, lh: 1, tracking: -0.02, min: 80 });
		let y = foot;
		if (sub) {
			put('body', sub, slide.subtitle!, m.margin, y - sub.height, c.muted, W * 0.56);
			y -= sub.height + m.body * 0.6;
		}
		put('headline', head, slide.title!, m.margin, y - head.height, c.ink, W * 0.66);
		y -= head.height + m.body;
		put('stat', stat, slide.stat!, m.margin, y - stat.height, c.ink);
		if (p !== undefined && !hidden('ticks')) {
			const th = Math.round(m.label * 0.9);
			const at = { x: m.margin, y: y - stat.height - m.label * 1.6, w: 47 * 6 + 1, h: th };
			parts.push(tickRow(at.x, at.y, 48, 6, th, c.ink, over(c.ink, 0.35, c.bg), Math.round(p * 48)));
			report({ id: 'ticks', kind: 'art', box: at, over: ['pattern'] });
		}
	} else if (slide.type === 'quote') {
		chrome();
		const inset = 48;
		const by = slide.attribution && !hidden('attribution') ? set('attribution', f.mono, slide.attribution, m.label, 'attribution', { maxW: W * 0.7, maxLines: 2, lh: 1.4 }) : undefined;
		const q = set('quote', f.sans, slide.quote!, m.quote, 'quote', { maxW: W * 0.74, maxH: H * 0.62 - (by ? by.height : 0), lh: 1.25, tracking: -0.01, min: 32 });
		const total = q.height + (by ? by.height + m.label * 1.5 : 0);
		const y = Math.max(top, Math.min(H * 0.3, (H - total) / 2 + 20));
		const qb = put('quote', q, slide.quote!, m.margin + inset, y, c.ink, W * 0.74);
		parts.push(diamond(qb.x - inset + 12, qb.y + q.size * 0.36, 12, c.ink));
		if (by) put('attribution', by, slide.attribution!, qb.x, qb.y + q.height + m.label * 1.2, c.muted);
	} else {
		chrome();
		const colW = W * 0.34;
		const sub = slide.subtitle && !hidden('body') ? set('body', f.sans, slide.subtitle, m.body, 'line under the headline (--body)', { maxW: colW, maxH: H * 0.36, lh: 1.4 }) : undefined;
		const head = set('headline', f.sans, slide.title!, m.title, 'headline', { maxW: colW, maxH: foot - top - (sub ? sub.height + m.body : 0), lh: 1.1, tracking: -0.014, min: 36 });
		const hb = put('headline', head, slide.title!, m.margin, top, c.ink, colW);
		if (sub) put('body', sub, slide.subtitle!, m.margin, Math.max(top + head.height, bottom(hb)) + m.body * 0.6, c.muted, colW);
		const box: Rect = { x: m.margin * 2 + colW, y: m.margin * 2, w: 0, h: H - m.margin * 4 };
		box.w = W - box.x - m.margin;
		const cut = 20;
		if (slide.image) {
			const pic = loadPicture(slide.image);
			const shape = `<path d="${chamfer(box.x, box.y, box.w, box.h, cut)}"/>`;
			parts.push(`${coverSvg(pic, box, 'plate', shape, crop)}<path d="${chamfer(box.x, box.y, box.w, box.h, cut)}" fill="none" stroke="${c.ink}" stroke-opacity="0.32" stroke-width="2"/>`);
			report({ id: 'picture', kind: 'picture', box });
		} else if (!hidden('art')) {
			const art = scene(slide.scene ?? 'residential');
			const k = Math.min(box.w / art.width, box.h / art.height) * scaleOf('art');
			const at = moved('art', { x: box.x + (box.w - art.width * k) / 2, y: box.y + (box.h - art.height * k) / 2, w: art.width * k, h: art.height * k });
			parts.push(`<g transform="translate(${num(at.x)} ${num(at.y)}) scale(${num(k, 5)})">${art.inner}</g>`);
			report({ id: 'art', kind: 'art', box: at });
		}
	}
	// The contours fade out round everything drawn on them.
	if (fieldId) parts[fieldAt] = contourSvg(fieldId, W, H, 1, 'sparse', c.gridAlpha, c.grid, undefined, layers.filter((l) => l.id !== 'pattern').flatMap((l) => (l.kind === 'logo' ? [inflate(l.box, l.logo!.clear)] : [l.box])), c.bg);
	checkEdits(edits, layers, where);
	return { svg: parts.join(''), layers };
}

function tickRow(x0: number, y: number, count: number, pitch: number, height: number, ink: string, off: string, on = count): string {
	let out = '';
	for (let i = 0; i < count; i++) out += `<rect x="${num(x0 + i * pitch)}" y="${num(y)}" width="1" height="${num(height)}" fill="${i < on ? ink : off}"/>`;
	return out;
}

/** One slide as a full SVG document. */
export function slideDocument(slide: Slide, theme = defaultTheme(), edits: Edits = {}, sample = false, seed?: number, crop?: Crop): { svg: string; layers: DrawnLayer[] } {
	const d = deckDoc();
	const drawn = slideDraw(slide, theme, edits, sample, seed, crop);
	const title = [slide.title, slide.stat, slide.quote].filter(Boolean).join('. ') || slide.type;
	return {
		svg: `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${d.width}" height="${d.height}" viewBox="0 0 ${d.width} ${d.height}" role="img">
<title>${title.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</title>
${drawn.svg}
</svg>
`,
		layers: drawn.layers,
	};
}

export const slideSvg = (slide: Slide, theme = defaultTheme()): string => slideDocument(slide, theme).svg;

export function sampleDeck(): Slide[] {
	return Object.entries(deckDoc().slides).map(([type, s]) => ({ type, ...s.sample }));
}

export function deckCatalog() {
	const d = deckDoc();
	return {
		schemaVersion: 1 as const,
		width: d.width,
		height: d.height,
		slides: Object.entries(d.slides).map(([id, s]) => ({ id, description: s.description, ground: s.ground, required: s.required, optional: s.optional, sample: s.sample })),
		grounds: Object.keys(imageDocument().grounds),
		formats: ['png', 'pdf', 'svg', 'jpg', 'webp'],
		input: '{ "ground"?: "bone", "theme"?: "api", "slides": [ { "type": "cover", "title": "..." }, ... ] }. A slide may set its own "ground"; "image" paths are relative to the file.',
		defaults: { out: '.ds/deck', format: ['png', 'pdf'] },
	};
}
