import { readFileSync } from 'node:fs';
import { pkgPath } from '../lib/paths.js';
import { brand } from '../lib/brand.js';
import { wireDrawing, wireScenes } from '../illustrate/wire.js';
import { defaultTheme } from '../image/catalog.js';
import { lockupSvg, markSvg, markWidth } from '../image/logo.js';
import { baselineIn, chamfer, contourSvg, diamond, groundColors, imageDocument, pictureHref, posterBody, type GroundColors } from '../image/poster.js';
import { glyphPaths, lineMetrics, loadFaces, measure, num, wrap, type Faces, type Font } from '../image/type.js';

// Deck slides at 1920 by 1080 (brand/assets/deck.json). Cover, section, bullets, stat, quote and image follow the
// illustration skill's slide rule (the lockup top left at 64, a 104 headline bottom left, a drawing that may bleed off
// the right and bottom) with the posts' logomark bottom right; statement, chart, poster and closing draw the
// share-image layouts at slide size. Copy is fitted by stepping the size down, never by cropping words.

type SlideDoc = { description: string; ground: string; required: string[]; optional: string[]; sample: Record<string, string> };
type DeckDoc = { width: number; height: number; pdfPageWidthPt: number; metrics: Record<string, number>; slides: Record<string, SlideDoc> };

let doc: DeckDoc | undefined;
export const deckDoc = (): DeckDoc => (doc ??= JSON.parse(readFileSync(pkgPath('brand', 'assets', 'deck.json'), 'utf8')) as DeckDoc);
export const slideTypes = () => Object.keys(deckDoc().slides);

export type Slide = { type: string; ground?: string; [slot: string]: string | undefined };

const SLOT_LIMITS: Record<string, number> = { title: 160, subtitle: 280, label: 24, items: 600, stat: 12, progress: 6, quote: 320, attribution: 80, url: 64, image: 4096, scene: 32, chart: 600, template: 32, callout: 80, partner: 40 };

export function slotNames(type: string): string[] {
	const s = deckDoc().slides[type];
	return [...s.required, ...s.optional];
}

/** Checks one slide's slots: known type, known slots, lengths, required slots present. */
export function cleanSlide(raw: Record<string, unknown>, index: number): Slide {
	const type = String(raw.type ?? '');
	const where = `Slide ${index + 1}`;
	if (!deckDoc().slides[type]) throw new Error(`${where}: unknown type "${type}". Types: ${slideTypes().join(', ')}.`);
	const allowed = new Set(['type', 'ground', ...slotNames(type)]);
	const out: Slide = { type };
	for (const [key, value] of Object.entries(raw)) {
		if (!allowed.has(key)) throw new Error(`${where} (${type}): unknown slot "${key}". Slots: ${slotNames(type).join(', ')}, ground.`);
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

type Ctx = { c: GroundColors; f: Faces; m: Record<string, number>; W: number; H: number; theme: string };

/** A block of type from the top, fitted by stepping the size down to `min` until it fits `maxLines` and `maxH`. */
function block(font: Font, text: string, size: number, min: number, x: number, y: number, maxW: number, lh: number, fill: string, opts: { maxLines?: number; maxH?: number; tracking?: number; fromBottom?: boolean } = {}) {
	let s = size;
	let lines = text.split('\n').flatMap((l) => wrap(font, l, s, maxW, opts.tracking ?? 0));
	const fits = () => lines.length <= (opts.maxLines ?? 99) && lines.length * s * lh <= (opts.maxH ?? 1e9);
	while (!fits() && s - 2 >= min) {
		s -= 2;
		lines = text.split('\n').flatMap((l) => wrap(font, l, s, maxW, opts.tracking ?? 0));
	}
	const h = lines.length * s * lh;
	const top = opts.fromBottom ? y - h : y;
	const svg = lines.map((l, i) => glyphPaths(font, l, s, x, baselineIn(font, top + i * s * lh, s, lh), fill, opts.tracking ?? 0)).join('');
	return { svg, h, size: s, top };
}

function chrome(x: Ctx, opts: { mark?: boolean; lockup?: boolean } = {}): string {
	const { m, c, f, W, H } = x;
	let out = '';
	if (opts.lockup !== false) out += lockupSvg(f.sans, m.margin, m.margin, m.lockup, c.ink).svg;
	if (opts.mark !== false) out += markSvg(W - m.margin - markWidth(m.mark * 0.75), H - m.margin - m.mark * 0.75, m.mark * 0.75, c.ink);
	return out;
}

function ticks(x0: number, y: number, count: number, on: number, height: number, ink: string, off: string): string {
	let out = '';
	for (let i = 0; i < count; i++) out += `<rect x="${num(x0 + i * 6)}" y="${num(y)}" width="1" height="${num(height)}" fill="${i < on ? ink : off}"/>`;
	return out;
}

function wireArt(x: Ctx, scene: string, left: number, top: number, width: number): string {
	if (!wireScenes().includes(scene)) throw new Error(`Unknown scene "${scene}". Scenes: ${wireScenes().join(', ')}.`);
	const art = wireDrawing(scene, x.c.dark ? 'dark' : 'light');
	const k = width / art.width;
	return `<g transform="translate(${num(left)} ${num(top)}) scale(${num(k, 5)})">${art.inner}</g>`;
}

const SLIDES: Record<string, (x: Ctx, s: Slide) => string> = {
	cover(x, s) {
		const { m, c, f, W, H } = x;
		// The skill's slide: the drawing bleeds off the right and bottom, the headline sits bottom left.
		const art = wireArt(x, s.scene ?? 'datacenter', W * 0.38, H * 0.2, W * 0.78);
		const sub = s.subtitle ? block(f.sans, s.subtitle, m.body, 24, m.margin, H - m.margin, W * 0.4, 1.4, c.muted, { maxLines: 3, fromBottom: true }) : null;
		const headBottom = H - m.margin - (sub ? sub.h + m.body : 0);
		const head = block(f.sans, s.title ?? '', m.headline, 56, m.margin, headBottom, W * 0.5, 1.04, c.ink, { maxLines: 3, tracking: -0.014, fromBottom: true });
		return `${art}${chrome(x, { mark: false })}${head.svg}${sub?.svg ?? ''}`;
	},
	section(x, s) {
		const { m, c, f, W, H } = x;
		const field = contourSvg('sec', W, H, 1, 'sparse', c.gridAlpha, c.grid);
		const head = block(f.sans, s.title ?? '', m.headline, 56, m.margin, H - m.margin, W * 0.7, 1.04, c.ink, { maxLines: 2, tracking: -0.014, fromBottom: true });
		let label = '';
		if (s.label) {
			// The label in DM Mono with a tick row after it, as the sheets' footer sets a line and its ticks.
			const lm = lineMetrics(f.mono, m.label, 1);
			const baseline = Math.round(head.top - m.label * 1.5);
			const lw = measure(f.mono, s.label, m.label);
			const th = Math.round(m.label * 0.7);
			label = glyphPaths(f.mono, s.label, m.label, m.margin, baseline, c.ink) + ticks(Math.round(m.margin + lw + m.label), baseline - th - Math.round((lm.ascent - th) / 4), 18, 7, th, c.ink, c.muted);
		}
		return `${field}${chrome(x)}${label}${head.svg}`;
	},
	bullets(x, s) {
		const { m, c, f, W } = x;
		const items = (s.items ?? '').split('|').map((i) => i.trim()).filter(Boolean);
		if (items.length > 6) throw new Error('bullets takes up to six items.');
		const title = block(f.sans, s.title ?? '', m.title, 44, m.margin, m.margin * 3, W * 0.7, 1.1, c.ink, { maxLines: 2, tracking: -0.014 });
		let y = m.margin * 3 + title.h + m.margin;
		let out = '';
		const rowW = W - m.margin * 2;
		for (const item of items) {
			out += `<rect x="${m.margin}" y="${Math.round(y)}" width="${num(rowW)}" height="1" fill="${c.ink}" fill-opacity="0.32"/>`;
			const text = block(f.sans, item, m.item, 28, m.margin + 40, y + 24, rowW - 40, 1.3, c.ink, { maxLines: 2 });
			out += diamond(m.margin + 10, y + 24 + (m.item * 1.3) / 2, 7, c.ink) + text.svg;
			y += text.h + 48;
		}
		return `${chrome(x)}${title.svg}${out}`;
	},
	stat(x, s) {
		const { m, c, f, H, W } = x;
		const field = contourSvg('stat', W, H, 1, 'sparse', c.gridAlpha, c.grid);
		const p = s.progress === undefined ? undefined : Number(s.progress);
		if (p !== undefined && (!Number.isFinite(p) || p < 0 || p > 1)) throw new Error('stat progress is a share from 0 to 1, like 0.7.');
		const sub = s.subtitle ? block(f.sans, s.subtitle, m.body, 24, m.margin, H - m.margin, W * 0.5, 1.4, c.muted, { maxLines: 2, fromBottom: true }) : null;
		const titleBottom = H - m.margin - (sub ? sub.h + m.body * 0.6 : 0);
		const title = block(f.sans, s.title ?? '', m.title, 40, m.margin, titleBottom, W * 0.6, 1.1, c.ink, { maxLines: 2, tracking: -0.014, fromBottom: true });
		const statBottom = title.top - m.body;
		const stat = block(f.sans, s.stat ?? '', m.stat, 120, m.margin, statBottom, W - m.margin * 2, 1, c.ink, { maxLines: 1, tracking: -0.02, fromBottom: true });
		const tickRow = p === undefined ? '' : ticks(m.margin, stat.top - m.label * 2, 48, Math.round(p * 48), Math.round(m.label * 0.9), c.ink, c.muted);
		return `${field}${chrome(x)}${tickRow}${stat.svg}${title.svg}${sub?.svg ?? ''}`;
	},
	quote(x, s) {
		const { m, c, f, W, H } = x;
		const inset = 48;
		const q = block(f.sans, s.quote ?? '', m.quote, 40, m.margin + inset, H * 0.3, W * 0.72, 1.25, c.ink, { maxLines: 6, maxH: H * 0.5, tracking: -0.01 });
		const lm = lineMetrics(f.sans, q.size, 1.25);
		const node = diamond(m.margin + 12, H * 0.3 + (q.size * 1.25 - lm.em) / 2 + lm.ascent * 0.62, 12, c.ink);
		const by = s.attribution ? block(f.mono, s.attribution, m.label, 18, m.margin + inset, H * 0.3 + q.h + m.label * 1.5, W * 0.6, 1.4, c.muted, { maxLines: 1 }) : null;
		return `${chrome(x)}${node}${q.svg}${by?.svg ?? ''}`;
	},
	image(x, s) {
		const { m, c, f, W, H } = x;
		const colW = W * 0.34;
		const head = block(f.sans, s.title ?? '', m.title, 44, m.margin, m.margin * 3, colW, 1.1, c.ink, { maxLines: 4, tracking: -0.014 });
		const sub = s.subtitle ? block(f.sans, s.subtitle, m.body, 24, m.margin, m.margin * 3 + head.h + m.body, colW, 1.4, c.muted, { maxLines: 5 }) : null;
		const fx = m.margin * 2 + colW;
		const fy = m.margin * 2;
		const fw = W - fx - m.margin;
		const fh = H - fy - m.margin * 2;
		const cut = 20;
		let picture: string;
		if (s.image) {
			const pic = pictureHref(s.image);
			picture = `<clipPath id="plate"><path d="${chamfer(fx, fy, fw, fh, cut)}"/></clipPath><image href="${pic.href}" x="${num(fx)}" y="${num(fy)}" width="${num(fw)}" height="${num(fh)}" preserveAspectRatio="xMidYMid slice" clip-path="url(#plate)"/><path d="${chamfer(fx, fy, fw, fh, cut)}" fill="none" stroke="${c.ink}" stroke-opacity="0.32" stroke-width="2"/>`;
		} else {
			const art = wireDrawing(s.scene ?? 'residential', c.dark ? 'dark' : 'light');
			const k = Math.min(fw / art.width, fh / art.height);
			picture = `<g transform="translate(${num(fx + (fw - art.width * k) / 2)} ${num(fy + (fh - art.height * k) / 2)}) scale(${num(k, 5)})">${art.inner}</g>`;
		}
		return `${chrome(x)}${head.svg}${sub?.svg ?? ''}${picture}`;
	},
	statement(x, s) {
		return posterBody({ template: 'window', width: x.W, height: x.H, ground: x.c.id, theme: x.theme, content: { title: s.title, subtitle: s.subtitle } });
	},
	chart(x, s) {
		return posterBody({ template: 'chart', width: x.W, height: x.H, ground: x.c.id, theme: x.theme, content: { title: s.title, chart: s.chart } });
	},
	poster(x, s) {
		const template = s.template ?? '';
		if (!imageDocument().posters[template]) throw new Error(`Unknown poster "${template}". Posters: ${Object.keys(imageDocument().posters).join(', ')}.`);
		const { type: _t, ground: _g, template: _p, ...content } = s;
		return posterBody({ template, width: x.W, height: x.H, ground: x.c.id, theme: x.theme, content });
	},
	closing(x, s) {
		const { m, c, f, W, H } = x;
		const body = posterBody({ template: 'identity', width: W, height: H, ground: c.id, theme: x.theme, content: {} });
		const url = s.url ?? new URL(brand().site ?? 'https://example.com').host;
		const w = measure(f.mono, url, m.label);
		const lm = lineMetrics(f.mono, m.label, 1);
		return `${body}${glyphPaths(f.mono, url, m.label, (W - w) / 2, H - m.margin - lm.descent, c.ink)}`;
	},
};

/** One slide as a full SVG document. */
export function slideSvg(slide: Slide, theme = defaultTheme()): string {
	const d = deckDoc();
	const ground = slide.ground ?? d.slides[slide.type].ground;
	const c = groundColors(ground, theme);
	const x: Ctx = { c, f: loadFaces(), m: d.metrics, W: d.width, H: d.height, theme };
	const body = SLIDES[slide.type](x, slide);
	const title = [slide.title, slide.stat, slide.quote].filter(Boolean).join('. ') || slide.type;
	return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${d.width}" height="${d.height}" viewBox="0 0 ${d.width} ${d.height}" role="img">
<title>${title.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</title>
<rect width="${d.width}" height="${d.height}" fill="${c.bg}"/>${body}
</svg>
`;
}

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
		formats: ['png', 'pdf', 'svg'],
		input: '{ "ground"?: "bone", "theme"?: "api", "slides": [ { "type": "cover", "title": "..." }, ... ] }. A slide may set its own "ground"; "image" paths are relative to the file.',
		defaults: { out: '.ds/deck', format: ['png', 'pdf'] },
	};
}
