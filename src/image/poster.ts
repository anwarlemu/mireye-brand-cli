import { readFileSync } from 'node:fs';
import { pkgPath } from '../lib/paths.js';
import { isoBounds, isoPreset, isoSvg, ISO_PRESETS, type IsoPreset } from '../illustrate/iso.js';
import { wireDrawing, wireScenes } from '../illustrate/wire.js';
import { defaultTheme, tokenHex, type Size } from './catalog.js';
import { anchored, bottom, checkEdits, editOf, frameOf, inflate, largest, LayoutError, meets, over, place, right, settle, shift, within, type DrawnLayer, type Edits, type Frame, type Rect } from './layers.js';
import { lockupSvg, lockupWidth, markSvg, markWidth } from './logo.js';
import { coverSvg, loadPicture } from './picture.js';
import { CopyError, fitOrFail, fitWords, glyphPaths, lineMetrics, loadFaces, measure, num, placeWords, requireGlyphs, setAt, unionOf, wrap, type Faces, type Fitted, type Font } from './type.js';

// Poster layouts: the brand's own share-image compositions (brand/assets/image.json lists them and their source),
// redrawn as SVG. Every position is a share of the picture's free area and every size grows with it, so one layout
// redraws at any size. The words are set first, whole, at the largest size that fits; the logo keeps its clear space;
// the drawing takes the room that is left; windows grow round their words and the grid and contours part for them.
// What was drawn is reported as layers, and a person's edits to those layers are applied here, before anything is set.

type Align = 'left' | 'center' | 'right';

export type PosterContent = { title?: string; subtitle?: string; image?: string; callout?: string; chart?: string; partner?: string; scene?: string; labels?: string; question?: string; suggestions?: string; place?: string; page?: string };

export type GroundColors = { id: string; bg: string; ink: string; muted: string; window: string; windowInk: string; windowMuted: string; grid: string; gridAlpha: number; dark: boolean };

type ImageDoc = {
	floors: { small: number; headline: number };
	logoRules: { clear: number; min: number };
	grounds: Record<string, { label: string; ground: string; ink: string; muted: string; window: string; windowInk: string; windowMuted: string; grid: { token: string; alpha: number }; dark: boolean; note?: string }>;
	art: { post: string; panel: string };
	photo: { shade: { token: string; alpha: number } };
	app: { bg: string; ink: string; muted: string; line: string; accent: string; accentInk: string };
	posters: Record<string, { label: string; description: string; required: string[]; optional: string[]; ground: string; sample: Record<string, string> }>;
	appPanel: { title: string; placeholder: string; button: string };
};

let imageDoc: ImageDoc | undefined;
export function imageDocument(): ImageDoc {
	imageDoc ??= JSON.parse(readFileSync(pkgPath('brand', 'assets', 'image.json'), 'utf8')) as ImageDoc;
	return imageDoc;
}

let contourDoc: { width: number; height: number; dense: string[]; sparse: string[] } | undefined;
function contours() {
	contourDoc ??= JSON.parse(readFileSync(pkgPath('brand', 'assets', 'contours.json'), 'utf8'));
	return contourDoc!;
}

export const posterIds = () => Object.keys(imageDocument().posters);
export const groundIds = () => Object.keys(imageDocument().grounds);

export function groundColors(groundId: string, themeId = defaultTheme()): GroundColors {
	const g = imageDocument().grounds[groundId];
	if (!g) throw new Error(`Unknown ground "${groundId}". Grounds: ${groundIds().join(', ')}.`);
	const hex = (token: string) => tokenHex(token, themeId);
	return { id: groundId, bg: hex(g.ground), ink: hex(g.ink), muted: hex(g.muted), window: hex(g.window), windowInk: hex(g.windowInk), windowMuted: hex(g.windowMuted), grid: hex(g.grid.token), gridAlpha: g.grid.alpha, dark: g.dark };
}

export const posterFloors = () => ({ ...imageDocument().floors, mark: imageDocument().logoRules.min });

/* ------------------------------------------------------------ drawing */

const LOCK_H = 108;
const MARK_H = 81.78;

export function baselineIn(font: Font, top: number, size: number, lh: number): number {
	const m = lineMetrics(font, size, 1);
	return top + (size * lh - m.em) / 2 + m.ascent;
}

const sop = (alpha: number) => (alpha >= 1 ? '' : ` stroke-opacity="${num(alpha, 3)}"`);
const op = (alpha: number) => (alpha >= 1 ? '' : ` fill-opacity="${num(alpha, 3)}"`);

export function diamond(x: number, y: number, r: number, color: string): string {
	return `<path d="M${num(x)} ${num(y - r)}L${num(x + r)} ${num(y)}L${num(x)} ${num(y + r)}L${num(x - r)} ${num(y)}Z" fill="${color}"/>`;
}

function target(x: number, y: number, r: number, color: string, bg: string): string {
	return `<path d="M${num(x)} ${num(y - r)}L${num(x + r)} ${num(y)}L${num(x)} ${num(y + r)}L${num(x - r)} ${num(y)}Z" fill="${bg}" stroke="${color}" stroke-width="${num(Math.max(0.8, r * 0.16), 3)}"/>${diamond(x, y, r * 0.38, color)}`;
}

export function chamfer(x: number, y: number, w: number, h: number, c: number): string {
	return `M${num(x + c)} ${num(y)}L${num(x + w)} ${num(y)}L${num(x + w)} ${num(y + h)}L${num(x)} ${num(y + h)}L${num(x)} ${num(y + c)}Z`;
}

const rectPath = (r: Rect) => `<rect x="${num(r.x)}" y="${num(r.y)}" width="${num(r.w)}" height="${num(r.h)}"/>`;

/** Where the contour map sits in a box: covering it, or (with a seed) another part of the map, mirrored or not. */
function contourFit(W: number, H: number, seed: number | undefined) {
	const data = contours();
	const base = Math.max(W / data.width, H / data.height);
	if (!seed) return { k: base, tx: (W - data.width * base) / 2, ty: (H - data.height * base) / 2, sx: 1 };
	const part = (n: number) => ((seed * n) % 101) / 100;
	const k = base * (1.15 + part(37) * 0.5);
	const tx = (W - data.width * k) * part(61);
	const ty = (H - data.height * k) * part(83);
	return seed % 2 ? { k, tx: W - tx, ty, sx: -1 } : { k, tx, ty, sx: 1 };
}

function contourPaths(kind: 'dense' | 'sparse', box: Rect, u: number, alpha: number, color: string, id: string, clear: Rect[] = [], seed?: number, bg?: string): string {
	const data = contours();
	const fit = contourFit(box.w, box.h, seed);
	const paths = (kind === 'sparse' ? data.sparse : data.dense).map((p) => `<path d="${p}"/>`).join('');
	const feather = 14 * u;
	// The field fades out round the words and the logo: soft patches of the ground over it.
	const patch = clear.length && bg ? `<filter id="${id}f" x="-30%" y="-30%" width="160%" height="160%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="${num(feather * 0.45, 3)}"/></filter>${clear.map((r) => `<g fill="${bg}" filter="url(#${id}f)">${rectPath(inflate(r, feather))}</g>`).join('')}` : '';
	const field = `<g clip-path="url(#${id})"><g transform="translate(${num(box.x + fit.tx)} ${num(box.y + fit.ty)}) scale(${num(fit.k * fit.sx, 5)} ${num(fit.k, 5)})" fill="none" stroke="${color}"${sop(alpha)} stroke-width="${num(Math.max(0.6, 1.1 * u) / fit.k, 4)}">${paths}</g></g>`;
	return `<clipPath id="${id}">${rectPath(box)}</clipPath>${field}${patch}`;
}

/** A contour field covering a box (or the whole frame), clipped to it, in one color at an alpha. */
export function contourSvg(id: string, frameW: number, frameH: number, u: number, kind: 'dense' | 'sparse', alpha: number, color: string, box?: Rect, clear: Rect[] = [], bg?: string): string {
	return contourPaths(kind, box ?? { x: 0, y: 0, w: frameW, h: frameH }, u, alpha, color, id, clear, undefined, bg);
}

/** One straight line across the picture, parted wherever it would run through something in `clear`. */
function ruled(vertical: boolean, at: number, from: number, to: number, lw: number, clear: Rect[]): string {
	let spans: [number, number][] = [[from, to]];
	for (const r of clear) {
		const hit = vertical ? r.x < at + lw && right(r) > at - lw : r.y < at + lw && bottom(r) > at - lw;
		if (!hit) continue;
		const [a, b] = vertical ? [r.y, bottom(r)] : [r.x, right(r)];
		spans = spans.flatMap(([s, e]): [number, number][] => (b <= s || a >= e ? [[s, e]] : [[s, Math.min(e, a)], [Math.max(s, b), e]])).filter(([s, e]) => e - s > 0.5);
	}
	return spans.map(([s, e]) => (vertical ? `<rect x="${num(at - lw / 2)}" y="${num(s)}" width="${num(lw)}" height="${num(e - s)}"/>` : `<rect x="${num(s)}" y="${num(at - lw / 2)}" width="${num(e - s)}" height="${num(lw)}"/>`)).join('');
}

/** The rows of a chart: "label | number", one a line. Rows without a number are an error. */
export function chartRows(chart: string): { label: string; value: number; text: string }[] {
	const rows = chart
		.split('\n')
		.map((l) => l.trim())
		.filter(Boolean)
		.map((l) => {
			const [label, raw] = l.split('|').map((p) => p.trim());
			const value = Number((raw ?? '').replace(/,/g, ''));
			if (!label || !raw || !Number.isFinite(value) || value < 0) throw new Error(`Chart row "${l}" needs "label | number" (a number that is 0 or more).`);
			return { label, value, text: raw };
		});
	if (!rows.length) throw new Error('chart needs at least one row, "label | number".');
	if (rows.length > 8) throw new Error(`chart holds up to 8 rows, not ${rows.length}.`);
	return rows;
}

/* -------------------------------------------------------------- layers */

const ALL: NonNullable<DrawnLayer['can']['anchors']> = ['top-left', 'top', 'top-right', 'left', 'center', 'right', 'bottom-left', 'bottom', 'bottom-right'];
const CORNERS: NonNullable<DrawnLayer['can']['anchors']> = ['top-left', 'top', 'top-right', 'bottom-left', 'bottom', 'bottom-right'];

/** What can be done to each layer a layout draws. The ranges are what its drawing code can do, and what edits are held to. */
export function posterCan(template: string): Record<string, DrawnLayer['can']> {
	const pattern = { hide: true };
	const boxed = { headline: { scale: [0.6, 1.5] as [number, number], align: true }, body: { scale: [0.8, 1.5] as [number, number], hide: true } };
	const free = { headline: { move: true, scale: [0.5, 1.8] as [number, number], align: true, anchors: ALL }, body: { move: true, scale: [0.7, 1.6] as [number, number], align: true, hide: true, anchors: ALL } };
	const logo = { move: true, scale: [0.7, 2.5] as [number, number], hide: true, anchors: CORNERS };
	const art = { move: true, scale: [0.4, 1.8] as [number, number], hide: true, anchors: ['right', 'left'] as NonNullable<DrawnLayer['can']['anchors']> };
	switch (template) {
		case 'identity':
			return { pattern, panel: { hide: true }, logo: { move: true, scale: [0.5, 2] } };
		case 'window':
			return { pattern, panel: { move: true, anchors: ALL }, logo: { scale: [0.7, 2], hide: true }, ...boxed };
		case 'tag':
			return { pattern, panel: { move: true, anchors: ALL }, logo, ...boxed };
		case 'partner':
			return { pattern, panel: {}, logo: { scale: [0.6, 1.6] }, partner: {}, ...boxed };
		case 'photo':
			return { picture: {}, pattern, art, callout: { move: true, hide: true }, logo, ...free };
		case 'parcels':
			return { pattern, art, labels: { hide: true }, callout: { hide: true }, logo, ...free };
		case 'chart':
			return { art: {}, chart: {}, logo, headline: free.headline };
		case 'app':
			return { pattern, art, question: {}, suggestions: {}, place: {}, logo, ...free };
		case 'panel':
			return { pattern, panel: {}, art, logo, ...free };
		default:
			return { ...(template === 'scene' ? { pattern } : {}), art, logo, ...free };
	}
}

export type PosterRequest = { template: string; size: Size; ground: string; theme?: string; content: PosterContent; seed?: number; edits?: Edits; sample?: boolean; crop?: Crop };
/** How a person's picture sits in its frame: closer in (1 to 3), and which part shows (-1 to 1 each way). */
export type Crop = { zoom?: number; x?: number; y?: number };
export type Drawing = { svg: string; layers: DrawnLayer[] };

type Set = { head?: Fitted; body?: Fitted; bodyGap: number; w: number; h: number };

const TRACK = -0.014;
const LEAD = 1.04;
const BODY_LEAD = 1.42;

/** The poster's SVG body (no root element) and the layers it drew, for the image, deck and video renderers. */
export function posterDraw(req: PosterRequest): Drawing {
	const theme = req.theme ?? defaultTheme();
	const { template, content } = req;
	const doc = imageDocument();
	if (!doc.posters[template]) throw new Error(`Unknown poster template "${template}". Posters: ${posterIds().join(', ')}.`);
	if (content.scene) {
		const pool: string[] = template === 'scene' ? [...ISO_PRESETS] : wireScenes();
		if (!pool.includes(content.scene)) throw new Error(`Unknown scene "${content.scene}" for ${template}. Scenes: ${pool.join(', ')}.`);
	}
	const c = groundColors(req.ground, theme);
	const f = loadFaces();
	const edits = req.edits ?? {};
	const can = posterCan(template);
	const F = frameOf(req.size, posterFloors());
	const { W, H, m } = F;
	const V = F.stage;
	const u = Math.sqrt((V.w * V.h) / (1200 * 630));
	const ratio = V.w / V.h;
	const wide = ratio >= 1.4;
	const banner = ratio >= 2.4;
	const tall = ratio < 1 / 1.15;
	const base0 = banner ? Math.min(V.w * 0.58, V.h * 2.4) : Math.min(V.w, V.h * 1.6);
	const k = base0 / 1080;
	const head0 = Math.max(F.large, Math.min(base0 * 0.107, V.h * (banner ? 0.2 : 0.165)));
	const line0 = Math.max(F.small, base0 * 0.0215);
	const lockH = base0 * 0.05;
	const where = `${template} at ${req.size.id === 'custom' ? `${W}x${H}` : req.size.id}`;
	const seed = req.seed;
	let ids = 0;
	const nextId = (p: string) => `${p}${ids++}`;
	const layers: DrawnLayer[] = [];
	const report = (l: Omit<DrawnLayer, 'can'>) => layers.push({ ...l, can: can[l.id] ?? {} });
	const hidden = (id: string) => Boolean(edits[id]?.hidden);
	const moved = (id: string, r: Rect): Rect => shift(r, (editOf(edits, id).dx ?? 0) * W, (editOf(edits, id).dy ?? 0) * H);
	const scaleOf = (id: string) => editOf(edits, id).scale ?? 1;
	for (const [label, text] of Object.entries({ headline: content.title, 'line under it': content.subtitle })) if (text) requireGlyphs(f.sans, text, label);

	const avatar = req.size.id === 'avatar';
	if (avatar && template !== 'identity') throw new LayoutError(`avatar holds the mark alone: use identity. ${template} has words, which no profile picture shows at a readable size.`);

	/* Layers, back to front. */
	const back: string[] = [`<rect width="${W}" height="${H}" fill="${c.bg}"/>`];
	const middle: string[] = [];
	const front: string[] = [];
	const clear: Rect[] = [];
	const canvas: Rect = { x: 0, y: 0, w: W, h: H };
	let live = F.live;

	/* ---- a carousel's page number, top right */
	const pageRect = (() => {
		if (!content.page) return undefined;
		const size = Math.max(F.small, line0 * 0.9);
		const set = setAt(f.mono, content.page.replace(/\s+/g, ''), size, { size, min: size, maxWidth: live.w, leading: 1.2 }, true)!;
		return { set, at: anchored(live, set.width, set.height, 'top-right') };
	})();
	const pageZone = pageRect ? [inflate(pageRect.at, 12 * u, 8 * u)] : [];
	const drawPage = (ink: string, ground: string[], sits: string[]) => {
		if (!pageRect) return;
		const p = placeWords(pageRect.set, pageRect.at.x, pageRect.at.y, ink);
		front.push(p.svg);
		clear.push(p.box);
		report({ id: 'page', kind: 'text', box: p.box, ink: p.ink, over: sits, text: { asked: content.page!.replace(/\s+/g, ''), drawn: pageRect.set.drawn, size: pageRect.set.size, color: ink, ground, own: true } });
	};

	/* ---- the logo */
	type Logo = { rect: Rect; word: boolean; mh: number; partner?: { size: number; gap: number; times: number } };
	const clearOf = (mh: number) => mh * doc.logoRules.clear;
	const logoAt = (wordmark: boolean, mh0: number): { mh: number; w: number } => {
		const mh = Math.max(F.mark, mh0) * scaleOf('logo');
		return { mh, w: wordmark ? lockupWidth(f.sans, mh) : markWidth(mh) };
	};
	const cornerLogo = (wordmark: boolean, mh0: number, corner: 'top-left' | 'top-right' | 'bottom-right' | 'bottom-left', area: Rect): Logo | undefined => {
		if (hidden('logo')) return undefined;
		const s = logoAt(wordmark, mh0);
		const e = editOf(edits, 'logo');
		// Words asked to the logo's own corner send it to the other end of that side.
		const asked = editOf(edits, 'headline').anchor;
		if (!e.anchor && asked && asked === corner) corner = (/bottom/.test(corner) ? corner.replace('bottom', 'top') : corner.replace('top', 'bottom')) as typeof corner;
		let rect = anchored(area, s.w, s.mh, e.anchor ?? corner);
		// A corner the platform covers: the logo takes the other side.
		if (!e.anchor && F.avoid.some((a) => meets(inflate(rect, clearOf(s.mh)), a))) rect = anchored(area, s.w, s.mh, /left/.test(corner) ? (corner.replace('left', 'right') as typeof corner) : corner);
		rect = settle(rect, [...F.avoid.map((a) => inflate(a, clearOf(s.mh))), ...pageZone.map((z) => inflate(z, clearOf(s.mh)))], area, ['up', 'right', 'left', 'down']) ?? rect;
		return { rect: moved('logo', rect), word: wordmark, mh: s.mh };
	};
	const drawLogo = (l: Logo, ink: string, sits: string[]) => {
		front.push(l.word ? lockupSvg(f.sans, l.rect.x, l.rect.y, l.mh, ink).svg : markSvg(l.rect.x, l.rect.y, l.mh, ink));
		clear.push(inflate(l.rect, clearOf(l.mh)));
		report({ id: 'logo', kind: 'logo', box: l.rect, over: sits, logo: { clear: clearOf(l.mh), min: F.mark } });
	};

	/* ---- words */
	const headScale = scaleOf('headline');
	const bodyScale = scaleOf('body');
	const bodyText = hidden('body') ? undefined : content.subtitle;
	/** Headline with the line under it, as large as the box allows (or at the asked scale exactly). */
	const column = (o: { head: number; min: number; maxW: number; maxH: number; under: boolean; bodyW?: number; line: number; gap: number; strict?: boolean; breaks?: boolean }): Set | undefined => {
		const bodyMax = o.bodyW ?? o.maxW;
		for (let size = o.head; ; size = Math.max(o.min, size * 0.97)) {
			const bs = Math.max(F.small, o.line * (size / o.head)) * bodyScale;
			const body = o.under && bodyText ? (setAt(f.sans, bodyText, bs, { size: bs, min: bs, maxWidth: bodyMax, leading: BODY_LEAD }, false) ?? (size <= o.min + 0.01 || o.strict ? setAt(f.sans, bodyText, bs, { size: bs, min: bs, maxWidth: bodyMax, leading: BODY_LEAD }, true) : undefined)) : undefined;
			const gap = body ? Math.max(bs * 0.6, size * o.gap) : 0;
			const room = o.maxH - (body ? body.height + gap : 0);
			const opts = { size, min: size, maxWidth: o.maxW, maxHeight: room, leading: LEAD, tracking: TRACK };
			const last = size <= o.min + 0.01 || o.strict;
			const head = content.title ? (setAt(f.sans, content.title, size, opts, false) ?? (last && o.breaks !== false ? setAt(f.sans, content.title, size, opts, true) : undefined)) : undefined;
			if ((!content.title || head) && (!o.under || !bodyText || body) && (head || room >= -0.5)) return { head, body, bodyGap: gap, w: Math.max(head?.width ?? 0, body?.width ?? 0), h: (head?.height ?? 0) + (body ? gap + body.height : 0) };
			if (last) return undefined;
		}
	};
	const tooLong = (o: { maxW: number; maxH: number; under: boolean; line: number; gap: number; bodyW?: number }): never => {
		// Say which words are too many: the line under the headline when it alone fills the box, else the headline.
		const bs = F.small * bodyScale;
		if (o.under && bodyText) {
			fitOrFail(f.sans, bodyText, { size: bs, min: bs, maxWidth: o.bodyW ?? o.maxW, maxHeight: Math.max(bs * 2, o.maxH - F.large * LEAD - bs), leading: BODY_LEAD }, 'line under the headline (--body)', where);
		}
		const bodyH = o.under && bodyText ? (fitWords(f.sans, bodyText, { size: bs, min: bs, maxWidth: o.bodyW ?? o.maxW, leading: BODY_LEAD })?.height ?? 0) + F.large * o.gap : 0;
		fitOrFail(f.sans, content.title ?? '', { size: F.large, min: F.large, maxWidth: o.maxW, maxHeight: Math.max(F.large, o.maxH - bodyH), leading: LEAD, tracking: TRACK }, 'headline', where);
		throw new CopyError(`The words do not fit ${where}. Shorten them, or use a larger size or another layout.`);
	};
	const drawSet = (s: Set, rect: Rect, align: Align, ink: string, muted: string, ground: string[], sits: string[]) => {
		const bodyAlign = editOf(edits, 'body').align ?? align;
		if (s.head) {
			const p = placeWords(s.head, rect.x, rect.y, ink, align, rect.w);
			front.push(p.svg);
			clear.push(p.box);
			report({ id: 'headline', kind: 'text', box: p.box, ink: p.ink, over: sits, text: { asked: content.title!, drawn: s.head.drawn, size: s.head.size, color: ink, ground, sample: req.sample } });
		}
		if (s.body) {
			const at = moved('body', { x: rect.x, y: rect.y + (s.head ? s.head.height + s.bodyGap : 0), w: rect.w, h: s.body.height });
			drawBody(s.body, at, bodyAlign, muted, ground, sits);
		}
	};
	const drawBody = (set: Fitted, at: Rect, align: Align, ink: string, ground: string[], sits: string[]) => {
		const p = placeWords(set, at.x, at.y, ink, align, at.w);
		front.push(p.svg);
		clear.push(p.box);
		report({ id: 'body', kind: 'text', box: p.box, ink: p.ink, over: sits, text: { asked: content.subtitle!, drawn: set.drawn, size: set.size, color: ink, ground, sample: req.sample } });
	};
	/** A headline at an asked scale: exactly that much larger or smaller than the layout sets it, or an error naming the range. */
	const scaled = (base: Set, fit: (size: number) => Set | undefined): Set => {
		if (headScale === 1 || !base.head) return base;
		const want = Math.max(F.large, base.head.size * headScale);
		const hit = fit(want);
		if (hit) return hit;
		let best = 1;
		for (let s = headScale > 1 ? headScale : 1; s >= 0.5; s -= 0.05) {
			if (fit(base.head.size * s)) {
				best = s;
				break;
			}
		}
		throw new LayoutError(`headline at ${headScale} does not fit ${where}. The largest that fits is about ${Math.floor(best * 20) / 20}.`);
	};

	/* ---- pattern */
	const pattern = (kind: 'none' | 'dense' | 'sparse', alphaShare: number, lines?: { xs: number[]; ys: number[]; alpha: number; nodes?: boolean; box?: Rect }) => {
		if (hidden('pattern')) return '';
		let out = kind === 'none' ? '' : contourPaths(kind, canvas, u, alphaShare * c.gridAlpha, c.grid, nextId('ct'), clear, seed, c.bg);
		if (lines) {
			const lw = Math.max(0.5, u);
			const gap = clear.map((r) => inflate(r, 6 * u));
			out += `<g fill="${c.grid}"${op(lines.alpha * c.gridAlpha)}>${lines.xs.map((x) => ruled(true, x, 0, H, lw, gap)).join('')}${lines.ys.map((y) => ruled(false, y, 0, W, lw, gap)).join('')}</g>`;
		}
		return out;
	};
	const reportPattern = () => {
		if (!hidden('pattern')) layers.unshift({ id: 'pattern', kind: 'art', box: canvas, bleeds: true, can: can.pattern ?? {} });
	};
	const thirds = (alpha: number) => ({ xs: [1, 2].map((i) => V.x + (V.w * i) / 3), ys: [1, 2].map((i) => V.y + (V.h * i) / 3), alpha });

	/* ---- a drawing in the room that is left */
	type Art = { w: number; h: number; draw: (r: Rect) => void };
	const artRect = (want: Rect, area: Rect, obstacles: Rect[], least: number): Rect | undefined => {
		const e = editOf(edits, 'art');
		// Mirrored, the drawing wants the same place seen from the other side.
		const target = e.anchor === 'left' ? { ...want, x: area.x + (right(area) - right(want)) } : e.anchor === 'right' ? { ...want, x: right(area) - want.w } : want;
		const got = place(target, area, obstacles, least, e.anchor ? 0.6 : 0.08);
		if (!got) return undefined;
		const s = e.scale ?? 1;
		if (s === 1) return moved('art', got);
		const big = { x: got.x + (got.w * (1 - s)) / 2, y: got.y + (got.h * (1 - s)) / 2, w: got.w * s, h: got.h * s };
		if (s < 1) return moved('art', big);
		const room = e.dx || e.dy ? big : place(big, area, obstacles, 0.999);
		if (!room) {
			const most = place({ ...big, w: big.w * 4, h: big.h * 4 }, area, obstacles, 0);
			throw new LayoutError(`art at ${s} does not fit ${where} beside the words. The largest that fits is about ${Math.max(1, Math.floor(((most?.w ?? got.w) / got.w) * 20) / 20)}.`);
		}
		return moved('art', room);
	};

	const asArt = (scene: string): Art & { ratio: number } => {
		const art = wireDrawing(scene, c.dark ? 'dark' : 'light');
		return { w: art.width, h: art.height, ratio: art.height / art.width, draw: (r) => middle.push(`<g transform="translate(${num(r.x)} ${num(r.y)}) scale(${num(r.w / art.width, 5)})">${art.inner}</g>`) };
	};
	const wireFor = (fallback: string) => {
		if (content.scene) return content.scene;
		if (!seed) return fallback;
		const pool = wireScenes();
		return pool[(pool.indexOf(fallback) + seed) % pool.length];
	};

	/* ---------------------------------------------------------- layouts */

	if (template === 'identity') {
		if (avatar) {
			const mw0 = live.w * 0.66;
			const mh = (mw0 / markWidth(1)) * scaleOf('logo');
			const rect = moved('logo', anchored(live, markWidth(mh), mh, 'center'));
			if (!within(rect, live, 2)) throw new LayoutError(`logo at ${scaleOf('logo')} leaves the circle a profile picture is cropped to.`);
			drawLogo({ rect, word: false, mh }, c.ink, []);
			return finish(back.join('') + front.join(''));
		}
		const lh = (banner ? Math.min(V.w * 0.13, V.h * 0.3) : V.w * 0.06 * (tall ? 1.5 : 1)) * (MARK_H / LOCK_H);
		const s = logoAt(true, lh);
		const fitW = Math.min(1, (live.w * 0.8) / s.w);
		const mh = s.mh * fitW;
		const rect = moved('logo', anchored(V, s.w * fitW, mh, 'center'));
		const pad = Math.max(clearOf(mh), 40 * k);
		const win = grow(inflate(rect, pad, pad * 0.72), banner ? 0.36 : tall ? 0.7 : 0.4, banner ? 0.5 : tall ? 0.3 : 0.4, V);
		const panel = !hidden('panel');
		clear.push(inflate(rect, clearOf(mh)));
		drawPage(c.ink, [c.bg], ['pattern']);
		const field = pattern('dense', 1, panel ? { xs: [win.x, right(win)], ys: [win.y, bottom(win)], alpha: 1 } : undefined);
		const nodes = panel && !hidden('pattern') ? corners(win, 5 * u, c.ink) : '';
		drawLogo({ rect, word: true, mh }, c.ink, ['panel', 'pattern']);
		if (panel) report({ id: 'panel', kind: 'panel', box: win });
		reportPattern();
		// The window is laid over the contours; the lines run along its edges.
		return finish(back.join('') + splitWindow(field, panel ? win : undefined) + nodes + front.join(''));
	}

	if (template === 'window' || template === 'tag') {
		const tag = template === 'tag';
		const cx = wide ? 0.29 : 0.12;
		const e = editOf(edits, 'panel');
		const logoTop = tag ? cornerLogo(true, lockH * (MARK_H / LOCK_H), 'top-left', live) : undefined;
		const ink = tag ? c.windowInk : c.ink;
		const groundOf = [tag ? c.window : c.bg];
		const pad = (tag ? 46 : 60) * k;
		const head = Math.max(F.large, tag ? Math.min(base0 * 0.07, V.h * 0.13) : Math.min(base0 * 0.06, V.h * 0.12));
		const gap = 0.3;
		const line = Math.max(F.small, head * 0.29);
		const badge = !tag && !hidden('logo') ? logoAt(true, Math.max(head * 0.3046 * 2.2 * (MARK_H / LOCK_H), F.mark)) : undefined;
		const badgeGap = badge ? Math.max(clearOf(badge.mh), head * 0.55) : 0;
		const badgeH = badge ? badge.mh + badgeGap : 0;
		const left = tag ? (e.anchor ? live.x + 50 * u : V.x + cx * V.w + V.w * (wide ? 0.06 : 0.1) - pad) : live.x;
		const area: Rect = { x: Math.max(live.x, left), y: live.y, w: 0, h: live.h };
		area.w = right(live) - area.x;
		if (logoTop && area.x < right(logoTop.rect) + clearOf(logoTop.mh)) {
			const from = bottom(logoTop.rect) + clearOf(logoTop.mh) + 8 * u;
			Object.assign(area, { y: from, h: bottom(live) - from });
		}
		if (pageRect) {
			const from = bottom(pageRect.at) + 12 * u;
			if (area.y < from) Object.assign(area, { y: from, h: bottom(live) - from });
			drawPage(c.ink, [c.bg], ['pattern']);
		}
		const fallback = F.avoid.length ? { ...area, x: Math.max(area.x, ...F.avoid.filter((a) => a.x + a.w / 2 < W / 2).map((a) => right(a) + 8 * u)) } : undefined;
		if (fallback) fallback.w = Math.min(right(area), ...F.avoid.filter((a) => a.x + a.w / 2 >= W / 2).map((a) => a.x - 8 * u)) - fallback.x;
		const fit = (at: Rect, say: boolean) => {
			const inW = at.w - pad * 2;
			const inH = at.h - pad * 2 - badgeH;
			const tries = [
				{ maxW: Math.min(inW, V.w * (tag ? (wide ? 0.4 : 0.66) : banner ? 0.5 : tall ? 0.7 : 0.56)), maxH: Math.min(inH, V.h * (tag ? 0.4 : 0.44) - (tag ? 0 : badgeH * 0.5)), min: head * 0.75 },
				{ maxW: Math.min(inW, V.w * 0.74), maxH: Math.min(inH, V.h * 0.7), min: Math.max(F.large, head * 0.6) },
				{ maxW: inW, maxH: inH, min: F.large },
			];
			let set: Set | undefined;
			for (const t of tries) {
				set = column({ head: Math.max(t.min, head), ...t, under: true, line, gap, breaks: t === tries[2] });
				if (set) break;
			}
			if (!set) return say ? tooLong({ maxW: inW, maxH: inH, under: true, line, gap }) : undefined;
			const base = set;
			set = scaled(base, (size) => column({ head: size, min: size, maxW: Math.min(inW, Math.max(base.w, V.w * 0.5)), maxH: inH, under: true, line, gap, strict: true, breaks: false }) ?? column({ head: size, min: size, maxW: inW, maxH: inH, under: true, line, gap, strict: true, breaks: false }));
			const blockW = Math.max(set.w, badge?.w ?? 0);
			const blockH = set.h + badgeH;
			let box = { w: blockW + pad * 2, h: blockH + pad * 2 };
			if (!tag) box = { w: Math.min(at.w, Math.max(box.w, V.w * (banner ? 0.57 : tall ? 0.88 : 0.62))), h: Math.min(at.h, Math.max(box.h, V.h * (banner ? 0.52 : tall ? 0.53 : 0.56))) };
			let win = tag ? { x: at.x, y: Math.max(at.y, Math.min(bottom(at) - box.h, V.y + V.h / 2 - box.h / 2)), ...box } : anchored(at, box.w, box.h, 'center');
			if (e.anchor) win = anchored(at, box.w, box.h, e.anchor);
			win = settle(win, F.avoid.filter((a) => meets(inflate(win, -pad * 0.8), a)), at) ?? win;
			const clash = F.avoid.some((a) => meets({ x: win.x + (win.w - blockW) / 2, y: win.y + (win.h - blockH) / 2, w: blockW, h: blockH }, a));
			return clash && !say ? undefined : { set, win, blockW, blockH };
		};
		const fitted = fit(area, !fallback) ?? fit(fallback!, true);
		const { set, blockW, blockH } = fitted!;
		const win = moved('panel', fitted!.win);
		const align: Align = editOf(edits, 'headline').align ?? (tag ? 'left' : 'center');
		const inner: Rect = { x: tag ? win.x + pad : win.x + (win.w - blockW) / 2, y: win.y + (win.h - blockH) / 2, w: blockW, h: blockH };
		if (badge) {
			const bx = align === 'left' ? inner.x : align === 'center' ? inner.x + (inner.w - badge.w) / 2 : right(inner) - badge.w;
			drawLogo({ rect: { x: bx, y: inner.y, w: badge.w, h: badge.mh }, word: true, mh: badge.mh }, c.ink, ['panel', 'pattern']);
		}
		drawSet(set, { ...inner, y: inner.y + badgeH, h: set.h }, align, ink, ink, groundOf, ['panel', 'pattern']);
		if (logoTop) drawLogo(logoTop, c.ink, ['pattern']);
		report({ id: 'panel', kind: 'panel', box: win, over: ['pattern'] });
		reportPattern();
		if (tag) {
			const at = { x: e.anchor ? Math.max(12 * u, win.x - 34 * u) : Math.min(V.x + cx * V.w, win.x - 20 * u), y: win.y + win.h / 2 };
			clear.push(win);
			const field = pattern('sparse', 1, { xs: [at.x], ys: [at.y], alpha: 1 });
			const dot = hidden('pattern') ? '' : target(at.x, at.y, 11 * u, c.ink, c.bg);
			return finish(`${back.join('')}${field}<path d="${chamfer(win.x, win.y, win.w, win.h, Math.min(win.w, win.h) * 0.12)}" fill="${c.window}"/>${dot}${front.join('')}`);
		}
		const field = pattern('sparse', 1, { xs: [win.x, right(win)], ys: [win.y, bottom(win)], alpha: 1 });
		return finish(back.join('') + splitWindow(field, win) + (hidden('pattern') ? '' : corners(win, 5 * u, c.ink)) + front.join(''));
	}

	if (template === 'partner') {
		const partner = content.partner!.trim();
		requireGlyphs(f.medium, partner, 'partner name (--partner)');
		const head = Math.max(F.large, Math.min(base0 * 0.06, V.h * 0.11));
		const line = Math.max(F.small, head * 0.34 * 0.66);
		const pad = 44 * k;
		if (pageRect) {
			live = { ...live, y: bottom(pageRect.at) + 12 * u, h: bottom(live) - bottom(pageRect.at) - 12 * u };
			drawPage(c.ink, [c.bg], ['pattern']);
		}
		let mh = Math.max(F.mark, lockH * 1.1 * (MARK_H / LOCK_H)) * scaleOf('logo');
		const row = (h: number) => {
			const kk = h / MARK_H;
			const size = LOCK_H * kk * 0.72;
			const lw = lockupWidth(f.sans, h);
			const gap = 26 * kk;
			const times = 16 * kk;
			return { lw, gap, times, size, pw: measure(f.medium, partner, size), total: lw + gap * 2 + times + measure(f.medium, partner, size) };
		};
		while (row(mh).total > live.w - pad && mh > F.mark) mh = Math.max(F.mark, mh * 0.95);
		const r = row(mh);
		if (r.total > live.w) throw new CopyError(`The partner name does not fit ${where}. Shorten it, or use a wider size.`);
		const winH = Math.max(mh + Math.max(clearOf(mh), pad * 0.72) * 2, V.h * (banner ? 0.34 : tall ? 0.2 : 0.3));
		const winW = Math.min(live.w, Math.max(r.total + pad * 2, V.w * (banner ? 0.4 : tall ? 0.7 : 0.46)));
		const gap = Math.max(16 * u, V.h * 0.05);
		const cxm = V.x + V.w / 2;
		// Words are centered: they keep the width that clears any covered corner on both sides.
		const roomW = Math.min(live.w, V.w * 0.8, ...F.avoid.map((a) => (a.x + a.w / 2 < cxm ? 2 * (cxm - right(a)) : 2 * (a.x - cxm)) - 16 * u));
		const maxH = live.h - winH - gap;
		const under = { under: true, line, gap: 0.3 };
		let set = column({ head, min: Math.max(F.large, head * 0.7), maxW: roomW, maxH: Math.min(maxH, V.h * 0.34), ...under }) ?? column({ head, min: F.large, maxW: roomW, maxH, ...under });
		if (!set) return tooLong({ maxW: roomW, maxH, ...under });
		const base = set;
		set = scaled(base, (size) => column({ head: size, min: size, maxW: roomW, maxH, ...under, strict: true }));
		// The window and the words as one stack, the window where the tool has it when there is room.
		const total = winH + gap + set.h;
		const winTop = Math.max(live.y, Math.min(V.y + V.h * (banner ? 0.3 : tall ? 0.36 : 0.32) - winH / 2, bottom(live) - total));
		const win: Rect = { x: cxm - winW / 2, y: winTop, w: winW, h: winH };
		const textTop = Math.max(bottom(win) + gap, Math.min(bottom(live) - set.h, V.y + V.h * (banner ? 0.8 : tall ? 0.7 : 0.76) - set.h / 2));
		const x0 = cxm - r.total / 2;
		const y0 = win.y + (win.h - mh) / 2;
		const kk = mh / MARK_H;
		clear.push(inflate({ x: x0, y: y0, w: r.total, h: mh }, clearOf(mh)));
		front.push(lockupSvg(f.sans, x0, y0, mh, c.ink).svg);
		const tx = x0 + r.lw + r.gap + r.times / 2;
		const ty = y0 + mh / 2;
		front.push(`<path d="M${num(tx - r.times / 2)} ${num(ty - r.times / 2)}L${num(tx + r.times / 2)} ${num(ty + r.times / 2)}M${num(tx + r.times / 2)} ${num(ty - r.times / 2)}L${num(tx - r.times / 2)} ${num(ty + r.times / 2)}" stroke="${c.ink}" stroke-opacity="0.55" stroke-width="${num(2.2 * kk, 3)}" stroke-linecap="round"/>`);
		const pm = lineMetrics(f.medium, r.size, 1);
		const px = tx + r.times / 2 + r.gap;
		const base1 = ty + LOCK_H * kk * 0.03 + (pm.ascent - pm.descent) / 2;
		front.push(glyphPaths(f.medium, partner, r.size, px, base1, c.ink));
		const pb = f.medium.layout(partner).bbox;
		const ps = r.size / f.medium.unitsPerEm;
		// The lockup by lockup gap is the brand's own (image.json lockup): the name sits outside the logo's clear space.
		report({ id: 'logo', kind: 'logo', box: { x: x0, y: y0, w: r.lw, h: mh }, over: ['panel', 'pattern'], logo: { clear: Math.min(clearOf(mh), r.gap), min: F.mark } });
		report({ id: 'partner', kind: 'text', box: { x: px, y: base1 - pb.maxY * ps, w: r.pw, h: (pb.maxY - pb.minY) * ps }, over: ['panel', 'pattern'], text: { asked: content.partner!, drawn: partner, size: r.size, color: c.ink, ground: [c.bg], sample: req.sample } });
		const align: Align = editOf(edits, 'headline').align ?? 'center';
		drawSet(set, { x: cxm - (align === 'center' ? set.w : roomW) / 2, y: textTop, w: align === 'center' ? set.w : roomW, h: set.h }, align, c.ink, c.ink, [c.bg], ['pattern']);
		report({ id: 'panel', kind: 'panel', box: win, over: ['pattern'] });
		reportPattern();
		const field = pattern('dense', 1, { xs: [win.x, right(win)], ys: [win.y, bottom(win)], alpha: 1 });
		return finish(back.join('') + splitWindow(field, win) + (hidden('pattern') ? '' : corners(win, 5 * u, c.ink)) + front.join(''));
	}

	/* ---- layouts with free words: a column at the top left, the drawing beside or under it, a line at the foot, the mark */

	const inset = template === 'panel' ? Math.min(base0 * 0.045, m) : 0;
	if (template === 'panel') live = { x: Math.max(live.x, inset + m), y: Math.max(live.y, inset + m * 0.9), w: 0, h: 0 };
	if (template === 'panel') {
		live.w = Math.min(right(F.live), W - inset - m) - live.x;
		live.h = Math.min(bottom(F.live), H - inset - m * 0.9) - live.y;
	}
	const photo = template === 'photo';
	const sits = ['pattern', ...(template === 'panel' ? ['panel'] : []), ...(photo ? ['picture'] : [])];
	const shade = doc.photo.shade;
	const shadeHex = tokenHex(shade.token, theme);
	// Words on a picture are judged against the darkest and the lightest it can be under the shade.
	const ground = photo ? (content.image ? [over(shadeHex, shade.alpha, '#FFFFFF'), shadeHex] : [c.bg]) : [c.bg];
	const ink = photo && content.image ? tokenHex('--ds-color-bone', theme) : c.ink;

	const wordLogo = template === 'panel';
	const chartish = template === 'chart';
	// The drawing on the left: the layout is mirrored, the words, the line and the mark on the other side.
	const mirrored = editOf(edits, 'art').anchor === 'left' && !hidden('art');
	const logo = cornerLogo(wordLogo, (wordLogo ? lockH : base0 * 0.034) * (MARK_H / LOCK_H), wordLogo || (template === 'app' && wide) ? (mirrored ? 'bottom-right' : 'bottom-left') : chartish ? 'top-right' : mirrored ? 'bottom-left' : 'bottom-right', live);
	const logoZone = logo ? [inflate(logo.rect, clearOf(logo.mh))] : [];
	const avoidZone = [...F.avoid.map((a) => inflate(a, 8 * u)), ...pageZone];

	const spec: Record<string, { col: number; fit: number; bodyW: number; foot: boolean; middle?: boolean; size?: number; most: number }> = {
		post: { col: wide ? 0.46 : 0.62, fit: wide ? 0.6 : 0.34, bodyW: wide ? 0.4 : 0.42, foot: !banner, most: wide ? 0.56 : 1 },
		scene: { col: wide ? 0.4 : 0.7, fit: wide ? 0.6 : 0.3, bodyW: wide ? 0.36 : 0.46, foot: !banner, most: wide ? 0.54 : 1 },
		parcels: { col: wide ? 0.44 : 0.8, fit: wide ? 0.6 : 0.24, bodyW: wide ? 0.4 : 0.46, foot: !banner, most: wide ? 0.56 : 1 },
		photo: { col: wide ? 0.5 : 0.84, fit: wide ? 0.5 : 0.24, bodyW: wide ? 0.4 : 0.5, foot: !banner, most: wide ? 0.62 : 1 },
		panel: { col: wide ? 0.42 : 0.8, fit: wide ? 0.6 : 0.3, bodyW: wide ? 0.36 : 0.6, foot: !wide, most: wide ? 0.54 : 1 },
		chart: { col: banner ? 0.42 : wide ? 0.6 : 0.8, fit: wide ? 0.4 : 0.22, bodyW: 0.4, foot: false, most: banner ? 0.46 : 0.82 },
		app: { col: wide ? 0.44 : 0.86, fit: wide ? 0.7 : 0.24, bodyW: wide ? 0.44 : 0.86, foot: false, middle: wide, size: wide ? 0.85 : 1, most: wide ? 0.54 : 1 },
	};
	const L = spec[template];
	const head = Math.max(F.large, head0 * (L.size ?? 1));
	const line = template === 'app' && wide ? Math.max(F.small, line0 * 1.15) : line0;
	const gap = 0.3;
	const artHidden = hidden('art');
	const eh = editOf(edits, 'headline');
	const eb = editOf(edits, 'body');
	const bodyFree = Boolean(eb.anchor || eb.dx || eb.dy);

	/* the line at the foot */
	let footSet: Fitted | undefined;
	let footRect: Rect | undefined;
	// On a banner with a covered lower corner the line goes to the foot beside that corner, so the headline keeps the
	// room above it and the drawing keeps the right.
	const cornered = banner && F.avoid.some((a) => a.x < live.x + live.w / 3 && bottom(a) > bottom(live) - 1) && ['post', 'scene', 'parcels', 'photo', 'panel'].includes(template);
	const footed = Boolean(bodyText) && (L.foot || bodyFree || cornered);
	if (footed && bodyText) {
		// A banner is shown small: its line is set larger than the floor, and never smaller.
		const size = (cornered ? Math.max(line, F.small * 1.15) : line) * bodyScale;
		const past = cornered ? Math.max(...F.avoid.map((a) => right(a))) + 16 * u - live.x : 0;
		for (const share of [...(cornered ? [Math.max(0.2, L.col - past / V.w), Math.max(0.24, 0.53 - past / V.w), L.col] : []), L.bodyW, L.bodyW + 0.12, 0.62, 0.8, 1]) {
			const maxW = Math.min(live.w - (logo && !eb.anchor && /bottom/.test(editOf(edits, 'logo').anchor ?? 'bottom-right') ? logo.rect.w + clearOf(logo.mh) : 0), share * V.w);
			footSet = setAt(f.sans, bodyText, size, { size, min: size, maxWidth: maxW, maxHeight: cornered ? size * BODY_LEAD * 3.05 : live.h * (tall ? 0.22 : 0.28), leading: BODY_LEAD }, share === 1);
			if (footSet) break;
		}
		if (!footSet) return tooLongBody(bodyText, size);
		const at0 = anchored(live, footSet.width, footSet.height, eb.anchor ?? (mirrored ? 'bottom-right' : 'bottom-left'));
		const at = cornered && !eb.anchor && !mirrored ? { ...at0, x: live.x + past } : at0;
		footRect = settle(at, [...logoZone, ...avoidZone], live, cornered ? ['right', 'up', 'left'] : ['up', 'right', 'left', 'down']) ?? at;
	}

	/* the headline column */
	const underBody = Boolean(bodyText) && !footed;
	// Words keep more than the logo's clear space round it: a headline set right by a small mark reads as touching it.
	const wordsLogo = logoZone.map((z) => inflate(z, head0 * 0.4));
	const zones = [...wordsLogo, ...avoidZone, ...(footRect ? [inflate(footRect, 18 * u, 14 * u)] : [])];
	const anchorOf = eh.anchor;
	const spot = (set: Set, sideways: boolean): Rect | undefined => {
		const at = anchorOf ? anchored(live, set.w, set.h, anchorOf) : { x: mirrored ? right(live) - set.w : live.x, y: L.middle ? live.y + Math.max(0, (live.h - set.h) / 2) : live.y, w: set.w, h: set.h };
		return settle(at, zones, live, sideways ? ['down', 'up', 'right', 'left'] : ['down', 'up']);
	};
	const drawing = artFor();
	type Found = { set: Set; rect: Rect; art?: Rect };
	const lay = (set: Set | undefined, least: number, sideways = F.avoid.length > 0): Found | undefined => {
		if (!set) return undefined;
		const rect = spot(set, sideways);
		if (!rect) return undefined;
		const at = moved('headline', rect);
		if (!drawing || artHidden) return { set, rect: at };
		const art = chartish ? drawing.want(at) : artRect(drawing.want(at), live, [...zones, inflate(at, (wide ? 28 : 16) * u, 22 * u)], least);
		return art && (drawing.holds?.(art) ?? true) ? { set, rect: at, art } : undefined;
	};
	const most = banner && F.avoid.length ? Math.max(L.most, 0.64) : L.most;
	const cols = [...new Set([L.col, Math.min(most, L.col + 0.08), most])].map((s) => Math.min(live.w, (artHidden ? Math.max(s, 0.8) : s) * V.w));
	const under = { under: underBody, line, gap };
	const tries: [number, number, number, number][] = [];
	for (const [floor, h, least] of [[0.72, Math.max(head, L.fit * V.h - (L.middle ? 0 : V.y === 0 ? m * 0.9 : 0)), 0.6], [0.55, live.h * (wide ? 0.86 : 0.42), 0.45], [0, live.h * (wide ? 1 : 0.6), 0.3]] as const) for (const w of cols) tries.push([w, h, Math.max(F.large, head * floor), least]);
	let found: Found | undefined;
	// First a headline without a last line of one short word, then any, then one set beside what is in its way, then one
	// with a word split: the largest that holds its place and leaves the drawing its room.
	const passes = [
		{ list: tries.slice(0, cols.length), floor: 0.84, breaks: false, tidy: true, sideways: false },
		{ list: tries, floor: 0.6, breaks: false, tidy: false, sideways: false },
		// Moved past a covered corner at a good size before set small beside it: fill before shrinking.
		{ list: tries, floor: 0.72, breaks: false, tidy: false, sideways: true },
		{ list: tries, floor: 0, breaks: false, tidy: false, sideways: false },
		{ list: tries, floor: 0, breaks: false, tidy: false, sideways: true },
		{ list: tries, floor: 0, breaks: true, tidy: false, sideways: true },
	];
	search: for (const pass of passes)
		for (const [w, h, min0, least] of pass.list) {
			const min = Math.max(min0, head * pass.floor);
			for (let size = pass.breaks ? min : head; ; size = Math.max(min, size * 0.94)) {
				const set = column({ head: size, min: size, maxW: w, maxH: h, ...under, strict: true, breaks: pass.breaks, line: line * (size / head) });
				found = pass.tidy && set?.head && stub(set.head) ? undefined : lay(set, least, pass.sideways);
				if (found) break search;
				if (size <= min + 0.01) break;
			}
		}
	if (!found) {
		return tooLong({ maxW: cols[cols.length - 1], maxH: live.h * (wide ? 1 : 0.6) - (footSet ? footSet.height + 20 * u : 0), ...under });
	}
	if (headScale !== 1 && found.set.head) {
		const base = found;
		// Bigger means larger type in the same column, re-wrapped; the column widens only when the type cannot fit it.
		const same = Math.min(live.w, Math.max(base.set.w, L.col * V.w));
		const widths = [same, Math.min(live.w, (artHidden ? live.w : L.most * 1.15 * V.w)), live.w];
		let hit: Found | undefined;
		scaled(base.set, (size) => {
			let got: Found | undefined;
			for (const w of widths) if ((got = lay(column({ head: size, min: size, maxW: w, maxH: live.h, ...under, strict: true, breaks: false }), 0.22))) break;
			// A larger headline that has to move past the covered corner takes the line under it along, to the other side.
			if (!got && cornered && footRect && !eb.anchor) {
				const was = footRect;
				const other = settle({ ...was, x: right(live) - was.w }, logoZone, live, ['left', 'up']);
				if (other) {
					zones[zones.length - 1] = inflate(other, 18 * u, 14 * u);
					footRect = other;
					for (const w of widths) if ((got = lay(column({ head: size, min: size, maxW: w, maxH: live.h, ...under, strict: true, breaks: false }), 0.22))) break;
					if (!got) {
						footRect = was;
						zones[zones.length - 1] = inflate(was, 18 * u, 14 * u);
					}
				}
			}
			if (got) hit = got;
			return got?.set;
		});
		// The last call that fit is the asked scale (an error left before this line otherwise).
		found = hit ?? base;
	}
	const { set, rect } = found;
	const align: Align = eh.align ?? (anchorOf === 'top' || anchorOf === 'center' || anchorOf === 'bottom' ? 'center' : 'left');
	let textRect = rect;
	if (eh.align && !anchorOf) {
		const colW = Math.min(right(live) - rect.x, Math.max(set.w, (wide ? L.col : 1) * V.w, 0));
		const blocked = found.art && meets({ ...rect, w: colW }, inflate(found.art, 8 * u));
		textRect = blocked ? rect : { ...rect, w: colW };
	}

	/* draw: the picture or panel behind, the drawing, the words, the logo */
	if (template === 'panel') {
		const fw = inset;
		const lw = Math.max(0.6, u);
		const box = { x: fw, y: fw, w: W - fw * 2, h: H - fw * 2 };
		middle.push(`<rect x="${num(fw)}" y="${num(fw)}" width="${num(box.w)}" height="${num(box.h)}" fill="${c.bg}"/><rect x="${num(fw)}" y="${num(fw)}" width="${num(box.w)}" height="${num(box.h)}" fill="none" stroke="${c.ink}" stroke-opacity="0.32" stroke-width="${num(lw, 3)}"/>${corners(box, 4.5 * u, c.ink)}`);
		report({ id: 'panel', kind: 'panel', box, over: ['pattern'] });
	}
	if (photo) {
		if (content.image) {
			const pic = loadPicture(content.image);
			back.push(coverSvg(pic, canvas, nextId('pic'), rectPath(canvas), req.crop));
			back.push(`<rect width="${W}" height="${H}" fill="${shadeHex}" fill-opacity="${shade.alpha}"/>`);
			report({ id: 'picture', kind: 'picture', box: canvas, bleeds: true });
		} else back.push(contourPaths('dense', canvas, u, c.gridAlpha, c.grid, nextId('ct')));
	}
	if (found.art && drawing) drawing.draw(found.art);
	drawSet(set, textRect, align, ink, ink, ground, sits);
	if (footSet && footRect) drawBody(footSet, moved('body', footRect), eb.align ?? (eb.anchor && /right/.test(eb.anchor) ? 'right' : eb.anchor === 'top' || eb.anchor === 'bottom' || eb.anchor === 'center' ? 'center' : 'left'), ink, ground, sits);
	if (logo) drawLogo(logo, ink, sits);
	drawPage(ink, ground, sits);

	const field =
		template === 'scene' ? pattern('none', 0, thirds(0.5))
		: template === 'parcels' ? pattern('sparse', 0.7, thirds(0.6))
		: template === 'panel' ? panelField()
		: template === 'app' ? pattern('sparse', 0.6)
		: photo && found.art && !artHidden ? pattern('none', 0, { xs: [crossAt(found.art).x], ys: [crossAt(found.art).y], alpha: 0.7 })
		: '';
	if (['scene', 'parcels', 'panel', 'app'].includes(template) || (photo && !artHidden)) reportPattern();
	return finish(back.join('') + field + middle.join('') + front.join(''));

	/* ---------------------------------------------------------- pieces */

	function finish(svg: string): Drawing {
		checkEdits(edits, layers, where);
		return { svg, layers: order(layers) };
	}

	/** A last line of one short word under longer ones. */
	function stub(set: Fitted): boolean {
		if (set.lines.length < 2) return false;
		const ws = set.lines.map((l) => measure(set.font, l, set.size, set.tracking));
		return ws[ws.length - 1] < Math.max(...ws) * 0.34;
	}

	function tooLongBody(text: string, size: number): never {
		fitOrFail(f.sans, text, { size, min: size, maxWidth: live.w - (logo ? logo.rect.w + clearOf(logo.mh) : 0), maxHeight: live.h * (tall ? 0.22 : 0.28), leading: BODY_LEAD }, 'line under the headline (--body)', where);
		throw new CopyError(`The line under the headline (--body) does not fit ${where}. Shorten it.`);
	}

	function panelField(): string {
		if (hidden('pattern')) return '';
		// The contours show only in the margin round the panel, and the panel covers the rest.
		return contourPaths('sparse', canvas, u, c.gridAlpha, c.grid, nextId('ct'), [], seed);
	}

	function crossAt(r: Rect) {
		return { x: r.x + 11 * u, y: r.y + r.h * 0.16 };
	}

	function artFor(): { want: (text: Rect) => Rect; draw: (r: Rect) => void; holds?: (r: Rect) => boolean } | undefined {
		const at = (cx: number, cy: number, w: number, h: number): Rect => ({ x: V.x + cx * V.w - w / 2, y: V.y + cy * V.h - h / 2, w, h });
		const S = Math.min(V.w, V.h);
		if (template === 'post' || template === 'panel') {
			const art = asArt(wireFor(template === 'post' ? doc.art.post : doc.art.panel));
			const w = template === 'post' ? (wide ? Math.min(0.5 * V.w, (0.78 * V.h) / art.ratio) : S * (tall ? 0.86 : 0.74)) : wide ? Math.min(0.48 * V.w, (0.72 * V.h) / art.ratio) : S * 0.78;
			return { want: () => (wide ? at(0.72, 0.5, w, w * art.ratio) : at(0.5, tall ? 0.56 : 0.58, w, w * art.ratio)), draw: (r) => {
				art.draw(r);
				report({ id: 'art', kind: 'art', box: r, over: sits });
			} };
		}
		if (template === 'scene') {
			const preset = (content.scene ?? 'solar') as IsoPreset;
			const text = isoPreset({ scene: preset, cols: 12, rows: 8, count: seed ? 2 + ((4 + seed * 3) % 7) : 4, highlight: true });
			const b = isoBounds(text);
			const r0 = b.h / b.w;
			const w = wide ? Math.min(0.54 * V.w, (0.86 * V.h) / r0) : S * (tall ? 0.94 : 0.8);
			return { want: () => (wide ? at(0.71, 0.52, w, w * r0) : at(0.5, tall ? 0.56 : 0.6, w, w * r0)), draw: (r) => {
				const pad = Math.max(1, u);
				middle.push(`<g transform="translate(${num(r.x + pad)} ${num(r.y + pad)})">${isoSvg(text, r.w - pad * 2, r.h - pad * 2, { ink: c.ink, bg: c.bg, accent: c.window, lineWidth: Math.max(0.6, 1.6 * Math.max(0.6, base0 / 1080)) }, nextId('iso'))}</g>`);
				report({ id: 'art', kind: 'art', box: r, over: sits });
			} };
		}
		if (template === 'parcels') return parcelsArt(at);
		if (photo) return photoArt(at);
		if (chartish) return chartArt();
		if (template === 'app') return appArt(at);
		return undefined;
	}

	function calloutSet(maxW: number): { lines: Fitted[]; w: number; h: number; pad: number } | undefined {
		const text = hidden('callout') ? undefined : content.callout;
		if (!text) return undefined;
		const size = Math.max(F.small, 24 * k);
		const pad = 18 * k;
		const set = fitOrFail(f.sans, text, { size, min: F.small, maxWidth: Math.max(size * 4, maxW - pad * 2), maxHeight: V.h * 0.3, leading: 1.35 }, 'callout', where);
		return { lines: [set], w: set.width + pad * 2, h: set.height + pad * 2, pad };
	}

	function drawCallout(s: NonNullable<ReturnType<typeof calloutSet>>, r: Rect, onPhoto: boolean, sitsOn: string[]) {
		const fill = onPhoto ? tokenHex('--ds-color-forest', theme) : c.window;
		const first = onPhoto ? tokenHex('--ds-color-bone', theme) : c.windowInk;
		const rest = onPhoto ? tokenHex('--ds-color-text-inverse-muted', theme) : c.windowMuted;
		const at = moved('callout', r);
		const set = s.lines[0];
		front.push(`<path d="${chamfer(at.x, at.y, at.w, at.h, Math.min(at.w, at.h) * 0.16)}" fill="${fill}"/>`);
		const ink: Rect[] = [];
		set.lines.forEach((l, i) => {
			const p = placeWords({ ...set, lines: [l] }, at.x + s.pad, at.y + s.pad + i * set.line, i === 0 ? first : rest);
			front.push(p.svg);
			ink.push(...p.ink);
		});
		report({ id: 'callout', kind: 'text', box: at, ink, over: sitsOn, text: { asked: content.callout!, drawn: set.drawn, size: set.size, color: set.lines.length > 1 ? rest : first, ground: [fill], sample: req.sample } });
	}

	function parcelSvg(x0: number, y0: number, w: number, h: number, filled: boolean, hatch: number): string {
		const lw = Math.max(0.6, u);
		let out = filled ? `<rect x="${num(x0)}" y="${num(y0)}" width="${num(w)}" height="${num(h)}" fill="${c.window}"/>` : '';
		let lines = '';
		for (let gx = hatch; gx < w - 1; gx += hatch) lines += `M${num(x0 + gx)} ${num(y0)}V${num(y0 + h)}`;
		out += `<path d="${lines}" fill="none" stroke="${ink}"${sop(filled ? 0.38 : 0.6)} stroke-width="${num(lw * 0.7, 3)}"/>`;
		out += `<rect x="${num(x0 + lw / 2)}" y="${num(y0 + lw / 2)}" width="${num(w - lw)}" height="${num(h - lw)}" fill="none" stroke="${ink}" stroke-width="${num(lw, 3)}"/>`;
		const clip = nextId('pc');
		return `${out}<clipPath id="${clip}">${rectPath({ x: x0, y: y0, w, h })}</clipPath><g clip-path="url(#${clip})">${[[0, 0], [w, 0], [0, h], [w, h]].map(([px, py]) => diamond(x0 + px, y0 + py, 4.5 * u, ink)).join('')}</g>`;
	}

	function parcelsArt(at: (cx: number, cy: number, w: number, h: number) => Rect) {
		// The three parcels as the tool sets them, in shares of their own box; a seed mirrors them and moves the fill.
		const shape: [number, number, number, number][] = wide
			? [[0.039, 0, 0.416, 0.344], [0.74, 0.15, 0.26, 0.51], [0, 0.746, 0.494, 0.254]]
			: [[0.265, 0, 0.386, 0.488], [0.759, 0.186, 0.241, 0.65], [0, 0.47, 0.446, 0.53]];
		const flip = seed ? seed % 2 === 1 : false;
		const filled = seed ? seed % 3 : 0;
		const rects = shape.map(([x, y, w, h]) => [flip ? 1 - x - w : x, y, w, h] as const);
		const labels = hidden('labels') ? [] : (content.labels ?? '').split('|').map((l) => l.trim()).filter(Boolean);
		if (labels.length > 3) throw new Error(`parcels has three parcels: --labels takes up to 3, not ${labels.length}.`);
		const w0 = wide ? Math.min(0.385 * V.w, (0.72 * V.h) / 0.82) : V.w * (tall ? 0.86 : 0.8);
		const r0 = wide ? 0.815 : 0.65;
		const call = calloutSet(Math.min(live.w, w0 * 0.6));
		const callGap = 18 * u;
		const top = call ? call.h + callGap : 0;
		return {
			want: () => at(wide ? 0.72 : 0.5, wide ? 0.52 : tall ? 0.56 : 0.58, w0, w0 * r0 + top),
			draw: (r: Rect) => {
				const g: Rect = { x: r.x, y: r.y + top, w: r.w, h: r.h - top };
				let inks: Rect[] = [];
				rects.forEach(([x, y, w, h], i) => {
					const box = { x: g.x + x * g.w, y: g.y + y * g.h, w: w * g.w, h: h * g.h };
					middle.push(parcelSvg(box.x, box.y, box.w, box.h, i === filled, 9 * k));
					inks.push(box);
				});
				report({ id: 'art', kind: 'art', box: unionOf(inks), ink: inks, over: sits });
				const size = Math.max(F.small, 22 * k);
				const marks: Rect[] = [];
				labels.forEach((label, i) => {
					requireGlyphs(f.sans, label, `label "${label}"`);
					const box = inks[i];
					const tw = measure(f.sans, label, size) + size * 1.1;
					const th = size * 1.9;
					if (tw > box.w * 0.94 || th > box.h * 0.94) throw new CopyError(`The label "${label}" does not fit its parcel in ${where}. Shorten it, leave the labels out, or use a larger size.`);
					const bx = box.x + (box.w - tw) / 2;
					const by = box.y + (box.h - th) / 2;
					const onFill = i === filled;
					front.push(`<path d="${chamfer(bx, by, tw, th, th * 0.22)}" fill="${onFill ? c.windowInk : c.window}"/>`);
					const lm = lineMetrics(f.sans, size, 1);
					front.push(glyphPaths(f.sans, label, size, bx + size * 0.55, by + th / 2 + size * 0.04 + (lm.ascent - lm.descent) / 2, onFill ? c.window : c.windowInk));
					marks.push({ x: bx, y: by, w: tw, h: th });
				});
				if (marks.length) report({ id: 'labels', kind: 'text', box: unionOf(marks), ink: marks, over: ['art', ...sits], text: { asked: labels.join(' '), drawn: labels.join(' '), size, color: c.windowInk, ground: [c.window], sample: req.sample } });
				inks = [];
				if (call) drawCallout(call, { x: flip ? g.x : right(g) - call.w, y: r.y, w: call.w, h: call.h }, false, sits);
			},
		};
	}

	function photoArt(at: (cx: number, cy: number, w: number, h: number) => Rect) {
		const pw = wide ? Math.min(0.2 * V.w, 0.5 * V.h) : 0.3 * Math.min(V.w, V.h);
		const ph = pw * (wide ? 0.85 : 1.3);
		const call = calloutSet(Math.max(pw * 1.1, 0.24 * V.w));
		const lead = pw * 0.22;
		const inner = Math.max(pw, (call?.w ?? 0) + 16 * u);
		return {
			want: () => at(wide ? 0.77 : 0.72, wide ? 0.55 : 0.56, inner + lead + 11 * u, ph),
			draw: (r: Rect) => {
				const box = { x: r.x + 11 * u + (r.w - 11 * u) * (lead / (inner + lead)), y: r.y, w: 0, h: r.h };
				box.w = right(r) - box.x;
				middle.push(parcelSvg(box.x, box.y, box.w, box.h, false, 9 * k));
				const cr = crossAt(r);
				if (!hidden('pattern')) middle.push(target(cr.x, cr.y, 11 * u, ink, content.image ? shadeHex : c.bg));
				const inks = hidden('pattern') ? [box] : [box, { x: cr.x - 11 * u, y: cr.y - 11 * u, w: 22 * u, h: 22 * u }];
				report({ id: 'art', kind: 'art', box: unionOf(inks), ink: inks, over: sits });
				if (call) drawCallout(call, { x: box.x + (box.w - call.w) / 2, y: box.y + (box.h - call.h) / 2, w: call.w, h: call.h }, true, ['art', ...sits]);
			},
		};
	}

	function chartArt() {
		const rows = chartRows(content.chart!);
		for (const r of rows) requireGlyphs(f.sans, `${r.label} ${r.text}`, 'chart');
		const gapX = banner ? 18 * u : V.w * 0.022;
		const measureChart = (r0: Rect, say: boolean) => {
			let r = r0;
			// Beside the words the columns stop under the mark when it stands over them.
			for (const z of [...logoZone, ...pageZone]) if (meets(r, z) && z.y < r.y + r.h / 2) r = { ...r, y: bottom(z), h: bottom(r) - bottom(z) };
			const no = (e: Error) => {
				if (say) throw e;
				return undefined;
			};
			const cw = (r.w - gapX * (rows.length - 1)) / rows.length;
			if (cw < F.small) return no(new CopyError(`${rows.length} columns do not fit ${where}. Use fewer rows or a wider size.`));
			const set = (size: number, breaks: boolean) => rows.map((row) => setAt(f.sans, row.label, size, { size, min: size, maxWidth: cw, maxLines: 3, leading: 1.2 }, breaks));
			let size = Math.max(F.small, 24 * u);
			let labels = set(size, false);
			while (labels.some((l) => !l) && size > F.small) labels = set((size = Math.max(F.small, size * 0.95)), false);
			if (labels.some((l) => !l)) labels = set(size, true);
			const bad = rows.find((_, i) => !labels[i]);
			if (bad) return no(new CopyError(`The chart label "${bad.label}" does not fit its column in ${where}. Shorten it, or use fewer rows or a wider size.`));
			const labelH = Math.max(...labels.map((l) => l!.height));
			let numS = Math.max(F.small * 1.2, Math.min(72 * k, r.h * 0.2));
			while (rows.some((row) => measure(f.sans, row.text, numS, -0.02) > cw) && numS > F.small) numS = Math.max(F.small, numS * 0.95);
			const wideNum = rows.find((row) => measure(f.sans, row.text, numS, -0.02) > cw);
			if (wideNum) return no(new CopyError(`The chart number "${wideNum.text}" does not fit its column in ${where}. Use fewer rows or a wider size.`));
			const base = bottom(r) - labelH - size * 0.6;
			const top = r.y + numS * 1.15;
			if (base - top < Math.max(12 * u, V.h * 0.12)) return no(new LayoutError(`The columns have no room in ${where}. Shorten the headline or the labels, or use a taller size.`));
			return { r, cw, labels, size, numS, base, top };
		};
		return {
			want: (text: Rect): Rect => {
				if (banner) {
					const x = right(text) + 40 * u;
					return largest({ x, y: live.y, w: Math.max(10, right(live) - x), h: live.h }, [...avoidZone, ...logoZone]);
				}
				const top = bottom(text) + head * 0.5;
				return largest({ x: live.x, y: top, w: live.w, h: Math.max(10, bottom(live) - top) }, [...avoidZone, ...logoZone]);
			},
			holds: (r: Rect) => measureChart(r, false) !== undefined,
			draw: (r0: Rect) => {
				const fit = measureChart(r0, true)!;
				const { r, cw, labels, size, numS, base, top } = fit;
				const max = Math.max(...rows.map((row) => row.value), 1e-9);
				const lw = Math.max(0.6, u * 0.9);
				const bars: Rect[] = [];
				const inks: Rect[] = [];
				let out = '';
				rows.forEach((row, i) => {
					const x = r.x + i * (cw + gapX);
					const h = Math.max(4 * u, ((base - top) * row.value) / max);
					const y = base - h;
					out += `<rect x="${num(x)}" y="${num(y)}" width="${num(cw)}" height="${num(h)}" fill="none" stroke="${c.ink}" stroke-opacity="0.85" stroke-width="${num(lw, 3)}"/>`;
					let hatch = '';
					for (let yy = y + 8 * u; yy < base; yy += 8 * u) hatch += `M${num(x)} ${num(yy)}H${num(x + cw)}`;
					if (hatch) out += `<path d="${hatch}" fill="none" stroke="${c.ink}" stroke-opacity="0.6" stroke-width="${num(lw, 3)}"/>`;
					bars.push({ x, y, w: cw, h });
					out += glyphPaths(f.sans, row.text, numS, x, y - numS * 0.22, c.ink, -0.02);
					const nb = f.sans.layout(row.text).bbox;
					const ns = numS / f.sans.unitsPerEm;
					inks.push({ x, y: y - numS * 0.22 - nb.maxY * ns, w: measure(f.sans, row.text, numS, -0.02), h: (nb.maxY - nb.minY) * ns });
					const p = placeWords(labels[i]!, x, base + size * 0.5, c.ink);
					out += p.svg;
					inks.push(...p.ink);
				});
				out += `<rect x="${num(banner ? r.x : 0)}" y="${num(base)}" width="${num(banner ? r.w : W)}" height="${num(Math.max(0.6, u))}" fill="${c.ink}" fill-opacity="0.4"/>`;
				front.push(out);
				report({ id: 'art', kind: 'art', box: unionOf(bars), ink: bars });
				const words = rows.map((row) => `${row.label} ${row.text}`).join(' ');
				report({ id: 'chart', kind: 'text', box: unionOf(inks), ink: inks, over: ['art'], text: { asked: words, drawn: rows.map((row, i) => `${labels[i]!.drawn} ${row.text}`).join(' '), size, color: c.ink, ground: [c.bg], sample: req.sample } });
			},
		};
	}

	function appArt(at: (cx: number, cy: number, w: number, h: number) => Rect) {
		const PW = 560;
		const side = Math.min(banner ? 0.3 : 0.38, 1);
		const w0 = wide ? V.w * side : V.w * (tall ? 0.8 : 0.66);
		// The panel's own height follows its words; larger words when the panel is drawn small.
		const build = (w: number) => {
			try {
				return askPanel(w / PW);
			} catch (error) {
				if (F.small / (w / PW) < 20) throw error;
				throw new LayoutError(`The Ask panel is drawn small in ${where}, so the words in it (${(['question', 'suggestions', 'place'] as const).filter((key) => content[key]).map((key) => `--${key}`).join(', ')}) cannot be read. Shorten them or leave some out, or use a larger size.`);
			}
		};
		let w = w0;
		for (let i = 0; i < 8; i++) {
			const h = (build(w).h * w) / PW;
			const most = wide ? live.h : live.h * 0.62;
			if (h <= most) break;
			w *= Math.max(0.8, most / h);
		}
		const panel = build(w);
		const h = (panel.h * w) / PW;
		return {
			want: (text: Rect) => (wide ? { x: right(live) - w, y: V.y + (V.h - h) / 2, w, h } : at(0.5, 0.5, w, h).y < bottom(text) ? { x: V.x + (V.w - w) / 2, y: bottom(text) + 30 * u, w, h } : at(0.5, 0.58, w, h)),
			draw: (r: Rect) => {
				let pw = r.w;
				while ((askPanel(pw / PW).h * pw) / PW > r.h + 0.5 && pw > r.w * 0.4) pw *= 0.96;
				const s = pw / PW;
				const p = askPanel(s);
				const hh = p.h * s;
				const box = { x: r.x + (r.w - pw) / 2, y: r.y + (r.h - hh) / 2, w: pw, h: hh };
				const id = nextId('app');
				const lw = Math.max(0.5, u);
				middle.push(`<clipPath id="${id}">${rectPath(box)}</clipPath><g clip-path="url(#${id})"><g transform="translate(${num(box.x)} ${num(box.y)}) scale(${num(s, 5)})">${p.svg.replaceAll('$ID', id)}</g></g><rect x="${num(box.x + lw / 2)}" y="${num(box.y + lw / 2)}" width="${num(box.w - lw)}" height="${num(box.h - lw)}" fill="none" stroke="${c.grid}"${sop(c.gridAlpha)} stroke-width="${num(lw, 3)}"/>`);
				clear.push(box);
				report({ id: 'art', kind: 'art', box, over: sits });
				for (const t of p.words) {
					const ink = t.ink.map((b) => ({ x: box.x + b.x * s, y: box.y + b.y * s, w: b.w * s, h: b.h * s }));
					report({ id: t.id, kind: 'text', box: unionOf(ink), ink, over: ['art', ...sits], text: { asked: t.asked, drawn: t.drawn, size: t.size * s, color: t.color, ground: [t.ground], sample: req.sample } });
				}
			},
		};
	}

	/** The product's Ask panel on its own 560 wide grid: its map strip, the question and suggestions asked for, the ask box. */
	function askPanel(s: number): { svg: string; h: number; words: { id: string; asked: string; drawn: string; size: number; color: string; ground: string; ink: Rect[] }[] } {
		const a = doc.appPanel;
		const hex = (t: string) => tokenHex(t, theme);
		const bg = hex(doc.app.bg);
		const inkP = hex(doc.app.ink);
		const muted = hex(doc.app.muted);
		const lineP = hex(doc.app.line);
		const accent = hex(doc.app.accent);
		const accentInk = hex(doc.app.accentInk);
		const PW = 560;
		const pad = 26;
		const inner = PW - pad * 2;
		const floor = F.small / s;
		const words: { id: string; asked: string; drawn: string; size: number; color: string; ground: string; ink: Rect[] }[] = [];
		const text = (t: string, size: number, tx: number, mid: number, fill: string, font: Font = f.sans) => {
			const lm = lineMetrics(font, size, 1);
			return glyphPaths(font, t, size, tx, mid + (lm.ascent - lm.descent) / 2, fill);
		};
		const dia = (dx: number, dy: number, r: number, fill: boolean, color: string) => `<path d="M${num(dx)} ${num(dy - r)}L${num(dx + r)} ${num(dy)}L${num(dx)} ${num(dy + r)}L${num(dx - r)} ${num(dy)}Z" ${fill ? `fill="${color}"` : `fill="none" stroke="${color}" stroke-width="1.2"`}/>`;
		let o = '';
		const hb = 54;
		o += markSvg(pad, hb / 2 - 7, 19 * (81.78 / 111.618), inkP) + text(a.title, 16, pad + 28, hb / 2 + 1, inkP, f.medium);
		const xx = PW - pad - 6;
		o += `<path d="M${xx - 6} ${hb / 2 - 6}L${xx + 6} ${hb / 2 + 6}M${xx + 6} ${hb / 2 - 6}L${xx - 6} ${hb / 2 + 6}" stroke="${inkP}" stroke-width="1.6" stroke-linecap="round"/><rect y="${hb}" width="${PW}" height="1.2" fill="${lineP}"/>`;
		const mt = hb;
		const mh = 192;
		const data = contours();
		const k2 = Math.max(PW / data.width, mh / data.height) * 1.6;
		o += `<clipPath id="$IDm"><rect y="${mt}" width="${PW}" height="${mh}"/></clipPath><g clip-path="url(#$IDm)"><g transform="translate(${num(-PW * 0.3)} ${num(mt - mh * 0.4)}) scale(${num(k2, 5)})" fill="none" stroke="${muted}" stroke-opacity="0.45" stroke-width="${num(0.9 / k2, 4)}">${data.dense.map((p) => `<path d="${p}"/>`).join('')}</g></g>`;
		const gx = [PW * 0.63, PW * 0.74];
		const gy = [mt + mh * 0.34, mt + mh * 0.66];
		o += `<g fill="${inkP}" fill-opacity="0.55">${gx.map((x) => `<rect x="${num(x - 0.5)}" y="${mt}" width="1" height="${mh}"/>`).join('')}${gy.map((y) => `<rect y="${num(y - 0.5)}" width="${PW}" height="1"/>`).join('')}</g><rect x="${num(gx[0])}" y="${num(gy[0])}" width="${num(gx[1] - gx[0])}" height="${num(gy[1] - gy[0])}" fill="${accent}"/>`;
		for (const x of gx) for (const y of gy) o += dia(x, y, 5, true, inkP);
		o += `<rect y="${mt + mh}" width="${PW}" height="1.2" fill="${lineP}"/>`;
		let y = mt + mh + 30;
		const addWords = (id: string, asked: string, set: Fitted, x: number, top: number) => {
			const p = placeWords(set, x, top, inkP);
			o += p.svg;
			words.push({ id, asked, drawn: set.drawn, size: set.size, color: inkP, ground: bg, ink: p.ink });
		};
		if (content.question) {
			const size = Math.max(30, floor);
			const q = fitOrFail(f.sans, content.question, { size, min: Math.min(size, Math.max(24, floor)), maxWidth: inner * 0.86, maxHeight: 220, leading: 1.26 }, 'question', where);
			addWords('question', content.question, q, pad, y);
			y += q.height + 22;
		}
		const list = (content.suggestions ?? '').split('|').map((v) => v.trim()).filter(Boolean);
		if (list.length > 4) throw new Error(`app shows up to 4 suggestions, not ${list.length}.`);
		const sugs = list.map((v) => ({ v, set: fitOrFail(f.sans, v, { size: Math.max(17, floor), min: Math.max(17, floor), maxWidth: inner - 30, maxHeight: 90, leading: 1.4 }, 'suggestion', where) }));
		if (sugs.length) {
			const inks: Rect[] = [];
			for (const g of sugs) {
				o += dia(pad + 5, y + g.set.line / 2, 4.5, false, inkP);
				const p = placeWords(g.set, pad + 26, y, inkP);
				o += p.svg;
				inks.push(...p.ink);
				y += g.set.height + 8;
			}
			words.push({ id: 'suggestions', asked: list.join(' '), drawn: sugs.map((g) => g.set.drawn).join(' '), size: sugs[0].set.size, color: inkP, ground: bg, ink: inks });
			y += 14;
		}
		const top = y;
		const chipSize = Math.max(15, floor);
		const chipW = content.place ? measure(f.mono, content.place, chipSize) + 50 : 0;
		const bw = measure(f.medium, a.button, 16) + 52;
		const bx = PW - pad - 16 - bw;
		// A place too long to sit beside the button takes a row of its own.
		const ownRow = chipW > 0 && pad + 16 + chipW > bx - 8;
		const chipH = Math.max(34, chipSize * 1.9);
		const inputH = 120 + (ownRow ? chipH + 10 : 0);
		o += `<path d="${chamfer(pad, top, inner, inputH, 12)}" fill="none" stroke="${lineP}" stroke-width="1.2"/>` + text(a.placeholder, 16, pad + 16, top + 30, muted);
		const by = top + inputH - 38;
		if (content.place) {
			requireGlyphs(f.mono, content.place, 'place');
			if (chipW > inner - 32) throw new CopyError(`The place does not fit the ask box in ${where}. Shorten it, or use a larger size.`);
			const py = ownRow ? by - 20 - chipH / 2 - 8 : by;
			o += `<rect x="${pad + 16}" y="${num(py - chipH / 2)}" width="${num(chipW)}" height="${num(chipH)}" fill="${inkP}" fill-opacity="0.08" stroke="${lineP}" stroke-width="1.2"/><rect x="${pad + 26}" y="${num(py - 6)}" width="12" height="12" fill="none" stroke="${inkP}" stroke-width="1.3"/>${dia(pad + 32, py, 3, true, inkP)}${text(content.place, chipSize, pad + 48, py + 1, inkP, f.mono)}`;
			words.push({ id: 'place', asked: content.place, drawn: content.place, size: chipSize, color: inkP, ground: over(inkP, 0.08, bg), ink: [{ x: pad + 48, y: py - chipSize * 0.4, w: chipW - 50, h: chipSize * 0.8 }] });
		}
		o += `<path d="${chamfer(bx, by - 20, bw, 40, 8)}" fill="${accent}"/>${text(a.button, 16, bx + 16, by + 1, accentInk, f.medium)}`;
		const ax = bx + bw - 20;
		o += `<path d="M${num(ax - 8)} ${by}L${num(ax + 6)} ${by}M${num(ax + 1)} ${by - 5}L${num(ax + 6)} ${by}L${num(ax + 1)} ${by + 5}" fill="none" stroke="${accentInk}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`;
		const h = top + inputH + 24;
		return { svg: `<rect width="${PW}" height="${h}" fill="${bg}"/>${o}`, h, words };
	}

	function splitWindow(field: string, win: Rect | undefined): string {
		if (!win) return field;
		// Contours under the window, the window, then the grid lines along its edges.
		const cut = field.indexOf(`<g fill="${c.grid}"`);
		const lines = cut >= 0 ? field.slice(cut) : '';
		const under = cut >= 0 ? field.slice(0, cut) : field;
		return `${under}<rect x="${num(win.x)}" y="${num(win.y)}" width="${num(win.w)}" height="${num(win.h)}" fill="${c.bg}"/>${lines}`;
	}
}

/** At least a share of the frame, around the same middle, inside it. */
function grow(r: Rect, shareW: number, shareH: number, V: Rect): Rect {
	const w = Math.min(V.w, Math.max(r.w, shareW * V.w));
	const h = Math.min(V.h, Math.max(r.h, shareH * V.h));
	return { x: r.x + r.w / 2 - w / 2, y: r.y + r.h / 2 - h / 2, w, h };
}

function corners(r: Rect, size: number, color: string): string {
	return [[r.x, r.y], [right(r), r.y], [r.x, bottom(r)], [right(r), bottom(r)]].map(([x, y]) => diamond(x, y, size, color)).join('');
}

const RANK: Record<DrawnLayer['kind'], number> = { picture: 0, panel: 2, art: 1, key: 3, text: 4, logo: 5 };
function order(layers: DrawnLayer[]): DrawnLayer[] {
	return layers.map((l, i) => ({ l, i })).sort((a, b) => (a.l.id === 'pattern' ? -1 : b.l.id === 'pattern' ? 1 : RANK[a.l.kind] - RANK[b.l.kind] || a.i - b.i)).map((x) => x.l);
}

export const posterBody = (req: PosterRequest): string => posterDraw(req).svg;

export function posterInfo() {
	const doc = imageDocument();
	return Object.entries(doc.posters).map(([id, p]) => ({ id, family: 'poster' as const, label: p.label, description: p.description, required: p.required, optional: p.optional, ground: p.ground, sample: p.sample }));
}
