import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pkgPath } from '../lib/paths.js';
import { isoBounds, isoPreset, isoSvg, ISO_PRESETS, type IsoPreset } from '../illustrate/iso.js';
import { wireDrawing, wireScenes } from '../illustrate/wire.js';
import { defaultTheme, tokenHex } from './catalog.js';
import { lockupSvg, lockupWidth, markSvg, markWidth } from './logo.js';
import { glyphPaths, lineMetrics, loadFaces, measure, num, wrap, type Faces, type Font } from './type.js';

// Poster layouts: the brand's own share-image compositions (brand/assets/image.json lists them and their source),
// redrawn as SVG. Every position is a share of the frame and every size a unit that grows with its area (one unit is
// a pixel of the 1200 by 630 link preview), so one layout redraws at any size. The words are laid out first: windows
// grow round them, the grid frames them and the drawings keep their places. Colors come from the ground's tokens.

type Rect = { x: number; y: number; w: number; h: number };
type Align = 'left' | 'center' | 'right';

export type PosterContent = { title?: string; subtitle?: string; image?: string; callout?: string; chart?: string; partner?: string; scene?: string };

type Sticker =
	| { kind: 'art'; x: number; y: number; size: number; scene: string }
	| { kind: 'iso'; x: number; y: number; size: number; scene: IsoPreset; k: number; stroke: number }
	| { kind: 'parcel'; x: number; y: number; size: number; ratio: number; label: string; filled: boolean; fontSize: number; hatchGap: number; behind: boolean }
	| { kind: 'callout'; x: number; y: number; size: number; text: string; fontSize: number; pad: number; onPhoto: boolean };

type Design = {
	W: number;
	H: number;
	u: number;
	align: Align;
	textX: number;
	textY: number;
	textSize: number;
	textWidth: number;
	tracking: number;
	leading: number;
	textFit: number;
	textMiddle: boolean;
	bodyScale: number;
	bodyAt: 'under' | 'foot';
	bodyWidth: number;
	bodyGap: number;
	bodyLeading: number;
	footInset: number;
	minText: number;
	badge: 'none' | 'lockup';
	badgeScale: number;
	badgeGap: number;
	textBox: boolean;
	textBoxStyle: 'clear' | 'tag';
	textPad: number;
	winBoxW: number;
	winBoxH: number;
	contours: 'none' | 'dense' | 'sparse';
	contourAlpha: number;
	grid: boolean;
	gridMode: 'parts' | 'box' | 'cross';
	gridFlip: boolean;
	gridAlpha: number;
	gridX: number;
	gridY: number;
	logo: boolean;
	logoWord: boolean;
	logoSize: number;
	logoX: number;
	logoY: number;
	logoAnchor: Align;
	logoBox: boolean;
	logoPad: number;
	frame: 'none' | 'panel';
	frameWidth: number;
	window: 'none' | 'app' | 'picture';
	winX: number;
	winY: number;
	winW: number;
	winRatio: number;
	winFollow: boolean;
	winGap: number;
	winBorder: number;
	chart: string;
	chartTop: number;
	chartSize: number;
	hideWords: boolean;
	stickers: Sticker[];
};

export type GroundColors = { id: string; bg: string; ink: string; muted: string; window: string; windowInk: string; windowMuted: string; grid: string; gridAlpha: number; dark: boolean };

type ImageDoc = {
	sizes: Record<string, { width: number; height: number; use: string; aliases: string[] }>;
	grounds: Record<string, { label: string; ground: string; ink: string; muted: string; window: string; windowInk: string; windowMuted: string; grid: { token: string; alpha: number }; dark: boolean; note?: string }>;
	art: { post: string; panel: string };
	photo: { shade: { token: string; alpha: number } };
	app: { bg: string; ink: string; muted: string; line: string; accent: string; accentInk: string };
	posters: Record<string, { label: string; description: string; required: string[]; optional: string[]; ground: string; sample: Record<string, string> }>;
	appPanel: { title: string; question: string; suggestions: string[]; placeholder: string; coords: string; button: string };
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

/* ------------------------------------------------------------- layout */

const BASE_W = 1200;
const BASE_H = 630;
export const unitOf = (W: number, H: number) => Math.sqrt((W * H) / (BASE_W * BASE_H));

/** The app panel's own layout box (app.ts): 560 by 760. */
const APP_W = 560;
const APP_H = 760;

function layoutFor(template: string, W: number, H: number, scene: string | undefined): Design {
	const u = unitOf(W, H);
	const wide = W / H >= 1.4;
	const banner = W / H >= 2.4;
	const tall = H / W > 1.15;
	const fx = (px: number) => px / W;
	const fy = (px: number) => px / H;
	const base0 = banner ? W * 0.58 : Math.min(W, H * 1.6);
	const m = base0 * 0.05;
	const head = Math.min(base0 * 0.107, H * (banner ? 0.2 : 0.165));
	const line = Math.max(15 * u, base0 * 0.0215);
	const k = base0 / 1080 / u;
	const px = (n: number) => n * k;
	const bodyScale = (line / (head * 0.34)) * 100;
	const markH = base0 * 0.034;
	const lockH = base0 * 0.05;
	const markBR = { logo: true, logoWord: false, logoSize: markH / u, logoX: fx(W - m), logoY: fy(H - m - markH * 0.86), logoAnchor: 'right' as Align };
	const lockTL = { logo: true, logoWord: true, logoSize: lockH / u, logoX: fx(m), logoY: fy(m), logoAnchor: 'left' as Align };
	const d: Design = {
		W, H, u,
		align: 'left', textX: 0.033, textY: 0.064, textSize: head / u, textWidth: 0.47, tracking: -14, leading: 1.04, textFit: 0, textMiddle: false,
		bodyScale, bodyAt: 'foot', bodyWidth: 0, bodyGap: 30, bodyLeading: 1.42, footInset: m / u, minText: 15,
		badge: 'none', badgeScale: 100, badgeGap: 21,
		textBox: false, textBoxStyle: 'clear', textPad: 44, winBoxW: 0, winBoxH: 0,
		contours: 'none', contourAlpha: 100,
		grid: false, gridMode: 'parts', gridFlip: true, gridAlpha: 100, gridX: 50, gridY: 50,
		logo: false, logoWord: true, logoSize: 24, logoX: 0.033, logoY: 0.863, logoAnchor: 'left', logoBox: false, logoPad: 60,
		frame: 'none', frameWidth: 24,
		window: 'none', winX: 0.5, winY: 0.42, winW: 0.86, winRatio: APP_H / APP_W, winFollow: false, winGap: 40, winBorder: 0,
		chart: '', chartTop: 0.3, chartSize: 60,
		hideWords: false,
		stickers: [],
	};
	const headU = head / u;
	const art = (name: string, x: number, y: number, size: number): Sticker => ({ kind: 'art', x, y, size, scene: name });
	const parcel = (x: number, y: number, size: number, ratio: number, label: string, filled: boolean, behind = true): Sticker => ({ kind: 'parcel', x, y, size, ratio, label, filled, fontSize: 22 * k, hatchGap: 9 * k, behind });
	const callout = (x: number, y: number, size: number, text: string, onPhoto = false): Sticker => ({ kind: 'callout', x, y, size, text, fontSize: 24 * k, pad: 18 * k, onPhoto });
	const iso = (preset: IsoPreset, x: number, y: number, size: number): Sticker => ({ kind: 'iso', x, y, size, scene: preset, k, stroke: 1.6 * Math.max(0.6, k) });
	const wireRatio = (name: string) => {
		const w = wireDrawing(name, 'light');
		return w.height / w.width;
	};
	switch (template) {
		case 'identity': {
			const lw = W * (banner ? 0.13 : 0.06) * (tall ? 1.5 : 1);
			return { ...d, hideWords: true, align: 'center', textX: 0.5, textY: 0.5, textSize: headU, contours: 'dense', grid: true, gridMode: 'box', logo: true, logoBox: true, logoPad: 40 * k, logoSize: lw / u, logoX: 0.5, logoY: 0.5 - fy(lw / 2), logoAnchor: 'center', winBoxW: banner ? 0.36 : tall ? 0.7 : 0.4, winBoxH: banner ? 0.5 : tall ? 0.3 : 0.4 };
		}
		case 'window':
			return { ...d, align: 'center', textX: 0.5, textY: 0.5, textMiddle: true, textSize: Math.min(base0 * 0.06, H * 0.12) / u, textWidth: banner ? 0.5 : tall ? 0.7 : 0.56, textFit: 0.44, bodyAt: 'under', bodyScale: 70, textBox: true, textPad: px(60), winBoxW: banner ? 0.57 : tall ? 0.88 : 0.62, winBoxH: banner ? 0.52 : tall ? 0.53 : 0.56, badge: 'lockup', badgeScale: 100, badgeGap: 60, contours: 'sparse', grid: true, gridMode: 'box' };
		case 'post': {
			const name = scene ?? imageDocument().art.post;
			const r = wireRatio(name);
			return { ...d, align: 'left', textX: fx(m), textY: fy(m * 0.9), textSize: headU, textWidth: wide ? 0.46 : 0.62, textFit: wide ? 0.6 : 0.34, bodyWidth: wide ? 0.4 : 0.42, ...markBR, stickers: [wide ? art(name, 0.72, 0.5, Math.min(0.5 * W, (0.78 * H) / r) / Math.min(W, H)) : art(name, 0.5, tall ? 0.56 : 0.58, tall ? 0.8 : 0.72)] };
		}
		case 'scene': {
			const preset = (scene ?? 'solar') as IsoPreset;
			return { ...d, align: 'left', textX: fx(m), textY: fy(m * 0.9), textSize: headU, textWidth: wide ? 0.4 : 0.7, textFit: wide ? 0.6 : 0.3, bodyWidth: wide ? 0.36 : 0.46, grid: true, gridMode: 'parts', gridFlip: false, gridAlpha: 50, ...markBR, stickers: [wide ? iso(preset, 0.71, 0.52, Math.min(0.54 * W, 0.86 * H * 1.55) / Math.min(W, H)) : iso(preset, 0.5, tall ? 0.58 : 0.6, tall ? 0.9 : 0.8)] };
		}
		case 'parcels': {
			const S = Math.min(W, H);
			const sz = (n: number) => (n * W) / S;
			return {
				...d, align: 'left', textX: fx(m), textY: fy(m * 0.9), textSize: headU, textWidth: wide ? 0.44 : 0.8, textFit: wide ? 0.6 : 0.24, bodyWidth: wide ? 0.4 : 0.46, contours: 'sparse', contourAlpha: 70, grid: true, gridMode: 'parts', gridFlip: false, gridAlpha: 60, ...markBR,
				stickers: wide
					? [parcel(0.62, 0.38, sz(0.16), 0.8, '01', true), parcel(0.86, 0.5, sz(0.1), 1.6, '02', false), parcel(0.62, 0.78, sz(0.19), 0.42, '03', false), callout(0.74, 0.14, sz(0.2), '')]
					: [parcel(0.49, 0.415, 0.32, 0.82, '01', true), parcel(0.84, 0.525, 0.2, 1.75, '02', false), parcel(0.295, 0.68, 0.37, 0.77, '03', false), callout(0.65, 0.26, 0.24, '')],
			};
		}
		case 'photo': {
			const S = Math.min(W, H);
			const sz = (n: number) => (n * W) / S;
			return {
				...d, align: 'left', textX: fx(m), textY: fy(m * 0.9), textSize: headU, textWidth: wide ? 0.5 : 0.84, textFit: wide ? 0.5 : 0.24, bodyWidth: wide ? 0.4 : 0.5, window: 'picture', winX: 0.5, winY: 0, winW: 1, winRatio: H / W, grid: true, gridMode: 'cross', gridX: wide ? 66 : 64, gridY: 52, gridAlpha: 70, ...markBR,
				stickers: [parcel(0.8, wide ? 0.6 : 0.58, sz(wide ? 0.2 : 0.3), wide ? 0.85 : 1.55, '', false, false), callout(wide ? 0.8 : 0.79, wide ? 0.56 : 0.45, sz(wide ? 0.2 : 0.24), '', true)],
			};
		}
		case 'tag': {
			const cx = wide ? 0.29 : 0.12;
			return { ...d, align: 'left', textX: cx + (wide ? 0.06 : 0.1), textY: 0.5, textMiddle: true, textSize: Math.min(base0 * 0.07, H * 0.13) / u, textWidth: wide ? 0.4 : 0.66, textFit: 0.4, bodyAt: 'under', bodyScale: 70, textBox: true, textBoxStyle: 'tag', textPad: px(46), contours: 'sparse', grid: true, gridMode: 'cross', gridX: cx * 100, gridY: 50, ...lockTL };
		}
		case 'panel': {
			const inset = base0 * 0.045;
			const name = scene ?? imageDocument().art.panel;
			const r = wireRatio(name);
			return { ...d, align: 'left', textX: fx(inset + m), textY: fy(inset + m * 0.8), textSize: headU, textWidth: wide ? 0.42 : 0.8, textFit: wide ? 0.6 : 0.3, bodyWidth: wide ? 0.36 : 0.6, footInset: (inset + m) / u, contours: 'sparse', frame: 'panel', frameWidth: inset / u, logo: true, logoWord: true, logoSize: lockH / u, logoX: fx(inset + m), logoY: fy(H - inset - m - lockH), logoAnchor: 'left', bodyAt: wide ? 'under' : 'foot', stickers: [wide ? art(name, 0.71, 0.5, Math.min(0.48 * W, (0.72 * H) / r) / Math.min(W, H)) : art(name, 0.5, 0.58, 0.78)] };
		}
		case 'chart':
			return { ...d, align: 'left', textX: fx(m), textY: fy(m * 0.9), textSize: headU, textWidth: wide ? 0.6 : 0.8, textFit: wide ? 0.4 : 0.22, bodyAt: 'under', chartTop: wide ? 0.34 : 0.26, chartSize: px(72), ...markBR, logoY: fy(m) };
		case 'app': {
			const sideW = Math.min(banner ? 0.3 : 0.38, ((H - 2 * m) * (APP_W / APP_H)) / W);
			const underW = Math.min(tall ? 0.78 : 0.6, (H * 0.62 * (APP_W / APP_H)) / W);
			return { ...d, align: 'left', textX: fx(m), textY: wide ? 0.5 : fy(m * 0.9), textMiddle: wide, textSize: headU * (wide ? 0.85 : 1), textWidth: wide ? 0.44 : 0.86, textFit: wide ? 0.7 : 0.2, bodyAt: 'under', bodyScale: bodyScale * (wide ? 1.15 : 1), contours: 'sparse', contourAlpha: 60, window: 'app', winFollow: !wide, winGap: px(50), winX: wide ? 1 - fx(m) - sideW / 2 : 0.5, winY: wide ? fy(H * 0.5 - (W * sideW * (APP_H / APP_W)) / 2) : 0.4, winW: wide ? sideW : underW, winRatio: APP_H / APP_W, winBorder: 1, ...markBR };
		}
		case 'partner':
			return { ...d, align: 'center', textX: 0.5, textY: banner ? 0.8 : tall ? 0.7 : 0.76, textMiddle: true, textSize: Math.min(base0 * 0.06, H * 0.11) / u, textWidth: 0.8, textFit: 0.3, bodyAt: 'under', bodyScale: 66, contours: 'dense', grid: true, gridMode: 'box', logo: true, logoBox: true, logoPad: 44 * k, logoSize: (lockH * 1.1) / u, logoX: 0.5, logoY: banner ? 0.3 : tall ? 0.36 : 0.32, logoAnchor: 'center', winBoxW: banner ? 0.4 : tall ? 0.7 : 0.46, winBoxH: banner ? 0.34 : tall ? 0.2 : 0.3 };
	}
	throw new Error(`Unknown poster template "${template}".`);
}

/* ------------------------------------------------------------ drawing */

const LOCK_H = 108;
const MARK_H = 81.78;
const MARK_Y = 13.11;

type Ctx = { d: Design; c: GroundColors; f: Faces; content: PosterContent; theme: string; ids: number };

export function baselineIn(font: Font, top: number, size: number, lh: number): number {
	const m = lineMetrics(font, size, 1);
	return top + (size * lh - m.em) / 2 + m.ascent;
}

const op = (alpha: number) => (alpha >= 1 ? '' : ` fill-opacity="${num(alpha, 3)}"`);
const sop = (alpha: number) => (alpha >= 1 ? '' : ` stroke-opacity="${num(alpha, 3)}"`);

export function diamond(x: number, y: number, r: number, color: string): string {
	return `<path d="M${num(x)} ${num(y - r)}L${num(x + r)} ${num(y)}L${num(x)} ${num(y + r)}L${num(x - r)} ${num(y)}Z" fill="${color}"/>`;
}

function target(x: number, y: number, r: number, color: string, bg: string): string {
	return `<path d="M${num(x)} ${num(y - r)}L${num(x + r)} ${num(y)}L${num(x)} ${num(y + r)}L${num(x - r)} ${num(y)}Z" fill="${bg}" stroke="${color}" stroke-width="${num(Math.max(0.8, r * 0.16), 3)}"/>${diamond(x, y, r * 0.38, color)}`;
}

export function chamfer(x: number, y: number, w: number, h: number, c: number): string {
	return `M${num(x + c)} ${num(y)}L${num(x + w)} ${num(y)}L${num(x + w)} ${num(y + h)}L${num(x)} ${num(y + h)}L${num(x)} ${num(y + c)}Z`;
}

type Laid = { rect: Rect; svg: string; size: number };

/** The badge (the lockup), the headline and the line under it, from the top. With `ink` unset nothing is drawn. */
function words(x: Ctx, size: number, ink: string | null, muted: string | null): Laid {
	const { d, f, content } = x;
	const maxW = d.textWidth * d.W;
	const ax = d.textX * d.W;
	let y = d.textY * d.H;
	const top = y;
	const xFor = (w: number) => (d.align === 'left' ? ax : d.align === 'center' ? ax - w / 2 : ax - w);
	const minT = d.minText * d.u;
	const parts: string[] = [];
	let widest = 0;
	if (d.badge === 'lockup') {
		const fs = Math.max(size * 0.3046 * (d.badgeScale / 100), minT * 0.8);
		const lh = fs * 2.2;
		const mh = (lh * MARK_H) / LOCK_H;
		const w = lockupWidth(f.sans, mh);
		widest = w;
		if (ink) parts.push(lockupSvg(f.sans, xFor(w), y + (lh * MARK_Y) / LOCK_H, mh, ink).svg);
		y += lh + size * (d.badgeGap / 100);
	}
	const tracking = d.tracking / 1000;
	const head = (content.title ?? '').split('\n').flatMap((l) => wrap(f.sans, l, size, maxW, tracking));
	if (content.title) {
		for (const line of head) {
			const w = measure(f.sans, line, size, tracking);
			widest = Math.max(widest, w);
			if (ink) parts.push(glyphPaths(f.sans, line, size, xFor(w), baselineIn(f.sans, y, size, d.leading), ink, tracking));
			y += size * d.leading;
		}
	}
	if (content.subtitle && d.bodyAt !== 'foot') {
		const bs = Math.max(size * 0.34 * (d.bodyScale / 100), minT);
		const bw = d.bodyWidth > 0 ? d.bodyWidth * d.W : maxW;
		y += size * (d.bodyGap / 100);
		for (const l of content.subtitle.split('\n').flatMap((p) => wrap(f.sans, p, bs, bw))) {
			const w = measure(f.sans, l, bs);
			widest = Math.max(widest, w);
			if (ink) parts.push(glyphPaths(f.sans, l, bs, xFor(w), baselineIn(f.sans, y, bs, d.bodyLeading), muted ?? ink));
			y += bs * d.bodyLeading;
		}
	}
	return { rect: { x: xFor(widest), y: top, w: widest, h: y - top }, svg: parts.join(''), size };
}

function fittedSize(x: Ctx): number {
	const { d } = x;
	let size = d.textSize * d.u;
	if (d.textFit <= 0) return size;
	const limit = d.textMiddle ? d.textFit * d.H : d.textFit * d.H - d.textY * d.H;
	if (limit <= 0) return size * 0.4;
	for (let i = 0; i < 6; i++) {
		const r = words(x, size, null, null).rect;
		if (r.h <= limit + 0.5) break;
		size = Math.max(d.textSize * d.u * 0.4, size * Math.max(0.6, Math.min(0.98, limit / r.h)));
	}
	return size;
}

/** A contour field covering a box (or the whole frame), clipped to it, in one color at an alpha. */
export function contourSvg(id: string, frameW: number, frameH: number, u: number, kind: 'dense' | 'sparse', alpha: number, color: string, box?: Rect): string {
	return contourLayer({ d: { W: frameW, H: frameH, u } as Design, ids: 0, idName: id } as unknown as Ctx, kind, alpha, color, box);
}

function contourLayer(x: Ctx, kind: 'dense' | 'sparse', alpha: number, color: string, box?: Rect): string {
	const { d } = x;
	const data = contours();
	const W = box?.w ?? d.W;
	const H = box?.h ?? d.H;
	const k = Math.max(W / data.width, H / data.height);
	const cw = data.width * k;
	const ch = data.height * k;
	const id = (x as Ctx & { idName?: string }).idName ?? `ct${x.ids++}`;
	const ox = (box?.x ?? 0) + (W - cw) / 2;
	const oy = (box?.y ?? 0) + (H - ch) / 2;
	const paths = (kind === 'sparse' ? data.sparse : data.dense).map((p) => `<path d="${p}"/>`).join('');
	return `<clipPath id="${id}"><rect x="${num(box?.x ?? 0)}" y="${num(box?.y ?? 0)}" width="${num(W)}" height="${num(H)}"/></clipPath><g clip-path="url(#${id})"><g transform="translate(${num(ox)} ${num(oy)}) scale(${num(k, 5)})" fill="none" stroke="${color}"${sop(alpha)} stroke-width="${num(Math.max(0.6, 1.1 * d.u) / k, 4)}">${paths}</g></g>`;
}

function gridLayer(x: Ctx, box: Rect | null): string {
	const { d, c } = x;
	const mode = box ? 'box' : d.gridMode;
	const lw = Math.max(0.5, d.u);
	let xs: number[];
	let ys: number[];
	if (box) {
		xs = [box.x, box.x + box.w];
		ys = [box.y, box.y + box.h];
	} else if (mode === 'cross') {
		xs = [(d.gridX / 100) * d.W];
		ys = [(d.gridY / 100) * d.H];
	} else {
		const n = 3;
		const dx = (d.gridX / 100 - 0.5) * d.W;
		xs = Array.from({ length: n - 1 }, (_, i) => (d.W * (i + 1)) / n + dx);
		ys = Array.from({ length: n - 1 }, (_, i) => (d.H * (i + 1)) / n);
	}
	const alpha = (d.gridAlpha / 100) * c.gridAlpha;
	let out = `<g fill="${c.grid}"${op(alpha)}>`;
	for (const gx of xs) out += `<rect x="${num(gx - lw / 2)}" y="0" width="${num(lw)}" height="${d.H}"/>`;
	for (const gy of ys) out += `<rect x="0" y="${num(gy - lw / 2)}" width="${d.W}" height="${num(lw)}"/>`;
	out += '</g>';
	if (!d.gridFlip) return out;
	if (mode === 'cross') return out + target(xs[0], ys[0], 11 * d.u, c.ink, c.bg);
	if (box) for (const gx of xs) for (const gy of ys) out += diamond(gx, gy, 5 * d.u, c.ink);
	return out;
}

function frameLayer(x: Ctx): string {
	const { d, c } = x;
	if (d.frame !== 'panel') return '';
	const fw = d.frameWidth * d.u;
	const lw = Math.max(0.6, d.u);
	const corners = [[fw, fw], [d.W - fw, fw], [fw, d.H - fw], [d.W - fw, d.H - fw]].map(([px, py]) => diamond(px, py, 4.5 * d.u, c.ink)).join('');
	return `<rect x="${num(fw)}" y="${num(fw)}" width="${num(d.W - fw * 2)}" height="${num(d.H - fw * 2)}" fill="${c.bg}"/><rect x="${num(fw)}" y="${num(fw)}" width="${num(d.W - fw * 2)}" height="${num(d.H - fw * 2)}" fill="none" stroke="${c.ink}" stroke-opacity="0.32" stroke-width="${num(lw, 3)}"/>${corners}`;
}

/** A picture as a data URL: PNG or JPEG, read from disk. */
export function pictureHref(file: string): { href: string; width: number; height: number } {
	const path = resolve(file);
	if (!existsSync(path)) throw new Error(`No image at ${file}.`);
	const buf = readFileSync(path);
	if (buf.length > 12 * 1024 * 1024) throw new Error('The image is larger than 12MB.');
	const png = buf.length >= 24 && buf.subarray(0, 8).toString('hex') === '89504e470d0a1a0a';
	const jpeg = buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
	if (!png && !jpeg) throw new Error('The image must be a PNG or JPEG.');
	let width = 0;
	let height = 0;
	if (png) {
		width = buf.readUInt32BE(16);
		height = buf.readUInt32BE(20);
	} else {
		for (let i = 2; i < buf.length - 9; ) {
			if (buf[i] !== 0xff) break;
			const marker = buf[i + 1];
			const len = buf.readUInt16BE(i + 2);
			if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
				height = buf.readUInt16BE(i + 5);
				width = buf.readUInt16BE(i + 7);
				break;
			}
			i += 2 + len;
		}
	}
	return { href: `data:image/${png ? 'png' : 'jpeg'};base64,${buf.toString('base64')}`, width: width || 1, height: height || 1 };
}

function stickerLayer(x: Ctx, s: Sticker, winTop: number | null): string {
	const { d, c, f } = x;
	const S = Math.min(d.W, d.H);
	const w = s.size * S;
	const cx = s.x * d.W;
	const cy = s.y * d.H;
	void winTop;
	if (s.kind === 'art') {
		const art = wireDrawing(s.scene, c.dark ? 'dark' : 'light');
		const h = (w * art.height) / art.width;
		const k = w / art.width;
		return `<g transform="translate(${num(cx - w / 2)} ${num(cy - h / 2)}) scale(${num(k, 5)})">${art.inner}</g>`;
	}
	if (s.kind === 'iso') {
		const spec = isoPreset({ scene: s.scene, cols: 12, rows: 8, count: 4, highlight: true });
		const b = isoBounds(spec);
		const h = (w * b.h) / b.w;
		const pad = Math.max(1, d.u);
		return `<g transform="translate(${num(cx - w / 2 + pad)} ${num(cy - h / 2 + pad)})">${isoSvg(spec, w - pad * 2, h - pad * 2, { ink: c.ink, bg: c.bg, accent: c.window, lineWidth: Math.max(0.6, s.stroke * d.u) }, `iso${x.ids++}`)}</g>`;
	}
	if (s.kind === 'parcel') {
		const h = w * s.ratio;
		const x0 = cx - w / 2;
		const y0 = cy - h / 2;
		const lw = Math.max(0.6, d.u);
		const gap = s.hatchGap * d.u;
		let out = '';
		if (s.filled) out += `<rect x="${num(x0)}" y="${num(y0)}" width="${num(w)}" height="${num(h)}" fill="${c.window}"/>`;
		if (gap > 0) {
			let lines = '';
			for (let gx = gap; gx < w - 1; gx += gap) lines += `M${num(x0 + gx)} ${num(y0)}V${num(y0 + h)}`;
			out += `<path d="${lines}" fill="none" stroke="${c.ink}"${sop(s.filled ? 0.38 : 0.6)} stroke-width="${num(lw * 0.7, 3)}"/>`;
		}
		out += `<rect x="${num(x0 + lw / 2)}" y="${num(y0 + lw / 2)}" width="${num(w - lw)}" height="${num(h - lw)}" fill="none" stroke="${c.ink}" stroke-width="${num(lw, 3)}"/>`;
		// The corner diamonds are clipped to the parcel, as the tool draws each parcel on its own sheet: a quarter shows.
		const clip = `pc${x.ids++}`;
		out += `<clipPath id="${clip}"><rect x="${num(x0)}" y="${num(y0)}" width="${num(w)}" height="${num(h)}"/></clipPath><g clip-path="url(#${clip})">${[[0, 0], [w, 0], [0, h], [w, h]].map(([px, py]) => diamond(x0 + px, y0 + py, 4.5 * d.u, c.ink)).join('')}</g>`;
		if (s.label) {
			const fsz = s.fontSize * d.u;
			const tw = measure(f.sans, s.label, fsz) + fsz * 1.1;
			const th = fsz * 1.9;
			const tx = cx - tw / 2;
			const ty = cy - th / 2;
			const tagFill = s.filled ? c.windowInk : c.window;
			const tagInk = s.filled ? c.window : c.windowInk;
			out += `<path d="${chamfer(tx, ty, tw, th, th * 0.22)}" fill="${tagFill}"/>`;
			const lm = lineMetrics(f.sans, fsz, 1);
			out += glyphPaths(f.sans, s.label, fsz, cx - measure(f.sans, s.label, fsz) / 2, cy + fsz * 0.04 + (lm.ascent - lm.descent) / 2, tagInk);
		}
		return out;
	}
	// A callout tag: a cut-corner block, two lines (what, then where).
	const text = x.content.callout ?? '';
	if (!text) return '';
	const fsz = s.fontSize * d.u;
	const pad = s.pad * d.u;
	const lh = 1.35;
	const lines = text.split('\n').flatMap((l) => wrap(f.sans, l, fsz, Math.max(10, w - pad * 2)));
	const h = lines.length * fsz * lh + pad * 2;
	const x0 = cx - w / 2;
	const y0 = cy - h / 2;
	const fill = s.onPhoto ? tokenHex('--ds-color-forest', x.theme) : c.window;
	const first = s.onPhoto ? tokenHex('--ds-color-bone', x.theme) : c.windowInk;
	const rest = s.onPhoto ? tokenHex('--ds-color-text-inverse-muted', x.theme) : c.windowMuted;
	let out = `<path d="${chamfer(x0, y0, w, h, Math.min(w, h) * 0.16)}" fill="${fill}"/>`;
	lines.forEach((l, i) => {
		out += glyphPaths(f.sans, l, fsz, x0 + pad, baselineIn(f.sans, y0 + pad + i * fsz * lh, fsz, lh), i === 0 ? first : rest);
	});
	return out;
}

/** The product's Ask panel, laid out on its own 560 by 760 grid (question mode), scaled into the window. */
function appPanel(x: Ctx, rect: Rect): string {
	const { f, theme } = x;
	const doc = imageDocument();
	const a = doc.appPanel;
	const col = doc.app;
	const hex = (t: string) => tokenHex(t, theme);
	const bg = hex(col.bg);
	const ink = hex(col.ink);
	const muted = hex(col.muted);
	const line = hex(col.line);
	const accent = hex(col.accent);
	const accentInk = hex(col.accentInk);
	const W = APP_W;
	const H = APP_H;
	const pad = 26;
	const inner = W - pad * 2;
	const text = (s: string, size: number, tx: number, mid: number, fill: string, font: Font = f.sans) => {
		const m = lineMetrics(font, size, 1);
		return glyphPaths(font, s, size, tx, mid + (m.ascent - m.descent) / 2, fill);
	};
	const fit = (s: string, size: number, max: number, font: Font = f.sans) => {
		if (measure(font, s, size) <= max) return s;
		let t = s;
		while (t.length > 1 && measure(font, `${t}…`, size) > max) t = t.slice(0, -1);
		return `${t.trimEnd()}…`;
	};
	const dia = (cx: number, cy: number, r: number, fill: boolean, color: string) =>
		`<path d="M${num(cx)} ${num(cy - r)}L${num(cx + r)} ${num(cy)}L${num(cx)} ${num(cy + r)}L${num(cx - r)} ${num(cy)}Z" ${fill ? `fill="${color}"` : `fill="none" stroke="${color}" stroke-width="1.2"`}/>`;
	const s = rect.w / W;
	const id = `app${x.ids++}`;
	let o = `<rect width="${W}" height="${H}" fill="${bg}"/>`;
	const hb = 54;
	o += markSvg(pad, hb / 2 - 7, 19 * (81.78 / 111.618), ink);
	o += text(fit(a.title, 16, inner - 80, f.medium), 16, pad + 28, hb / 2 + 1, ink, f.medium);
	const cx = W - pad - 6;
	o += `<path d="M${cx - 6} ${hb / 2 - 6}L${cx + 6} ${hb / 2 + 6}M${cx + 6} ${hb / 2 - 6}L${cx - 6} ${hb / 2 + 6}" stroke="${ink}" stroke-width="1.6" stroke-linecap="round"/>`;
	o += `<rect y="${hb}" width="${W}" height="1.2" fill="${line}"/>`;
	const mt = hb;
	const mh = 192;
	const data = contours();
	const k2 = Math.max(W / data.width, mh / data.height) * 1.6;
	o += `<clipPath id="${id}m"><rect y="${mt}" width="${W}" height="${mh}"/></clipPath><g clip-path="url(#${id}m)"><g transform="translate(${num(-W * 0.3)} ${num(mt - mh * 0.4)}) scale(${num(k2, 5)})" fill="none" stroke="${muted}" stroke-opacity="0.45" stroke-width="${num(0.9 / k2, 4)}">${data.dense.map((p) => `<path d="${p}"/>`).join('')}</g></g>`;
	const gx1 = W * 0.63;
	const gx2 = W * 0.74;
	const gy1 = mt + mh * 0.34;
	const gy2 = mt + mh * 0.66;
	o += `<g fill="${ink}" fill-opacity="0.55">${[gx1, gx2].map((gx) => `<rect x="${num(gx - 0.5)}" y="${mt}" width="1" height="${mh}"/>`).join('')}${[gy1, gy2].map((gy) => `<rect y="${num(gy - 0.5)}" width="${W}" height="1"/>`).join('')}</g>`;
	o += `<rect x="${num(gx1)}" y="${num(gy1)}" width="${num(gx2 - gx1)}" height="${num(gy2 - gy1)}" fill="${accent}"/>`;
	for (const gx of [gx1, gx2]) for (const gy of [gy1, gy2]) o += dia(gx, gy, 5, true, ink);
	o += `<rect y="${mt + mh}" width="${W}" height="1.2" fill="${line}"/>`;
	const inputH = 120;
	const inputTop = H - inputH - 24;
	const ql = wrap(f.sans, a.question, 30, inner * 0.78);
	const block = ql.length * 38 + 26 + a.suggestions.length * 32;
	let qy = inputTop - 44 - block;
	for (const l of ql) {
		o += text(l, 30, pad, qy + 18, ink);
		qy += 38;
	}
	qy += 26;
	for (const st of a.suggestions) {
		o += dia(pad + 5, qy + 12, 4.5, false, ink);
		o += text(fit(st, 17, inner - 30), 17, pad + 26, qy + 13, ink);
		qy += 32;
	}
	const top = inputTop;
	o += `<path d="${chamfer(pad, top, inner, inputH, 12)}" fill="none" stroke="${line}" stroke-width="1.2"/>`;
	o += text(fit(a.placeholder, 16, inner - 32), 16, pad + 16, top + 30, muted);
	const cw = measure(f.mono, a.coords, 15) + 50;
	const cy = top + inputH - 38;
	o += `<rect x="${pad + 16}" y="${cy - 16}" width="${num(cw)}" height="32" fill="${ink}" fill-opacity="0.08" stroke="${line}" stroke-width="1.2"/>`;
	o += `<rect x="${pad + 26}" y="${cy - 6}" width="12" height="12" fill="none" stroke="${ink}" stroke-width="1.3"/>${dia(pad + 32, cy, 3, true, ink)}`;
	o += text(a.coords, 15, pad + 48, cy + 1, ink, f.mono);
	const bw = measure(f.medium, a.button, 16) + 52;
	const bx = W - pad - 16 - bw;
	o += `<path d="${chamfer(bx, cy - 20, bw, 40, 8)}" fill="${accent}"/>`;
	o += text(a.button, 16, bx + 16, cy + 1, accentInk, f.medium);
	const ax = bx + bw - 20;
	o += `<path d="M${num(ax - 8)} ${cy}L${num(ax + 6)} ${cy}M${num(ax + 1)} ${cy - 5}L${num(ax + 6)} ${cy}L${num(ax + 1)} ${cy + 5}" fill="none" stroke="${accentInk}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`;
	return `<clipPath id="${id}"><rect x="${num(rect.x)}" y="${num(rect.y)}" width="${num(rect.w)}" height="${num(rect.h)}"/></clipPath><g clip-path="url(#${id})"><g transform="translate(${num(rect.x)} ${num(rect.y)}) scale(${num(s, 5)})">${o}</g></g>`;
}

function windowLayer(x: Ctx, top: number): string {
	const { d, c } = x;
	if (d.window === 'none') return '';
	const ww = d.winW * d.W;
	const wh = ww * d.winRatio;
	const wx = d.winX * d.W - ww / 2;
	const rect = { x: wx, y: top, w: ww, h: wh };
	let out = '';
	if (d.window === 'app') out += appPanel(x, rect);
	else if (x.content.image) {
		const pic = pictureHref(x.content.image);
		const id = `win${x.ids++}`;
		const shade = imageDocument().photo.shade;
		out += `<clipPath id="${id}"><rect x="${num(wx)}" y="${num(top)}" width="${num(ww)}" height="${num(wh)}"/></clipPath><image href="${pic.href}" x="${num(wx)}" y="${num(top)}" width="${num(ww)}" height="${num(wh)}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id})"/>`;
		out += `<rect x="${num(wx)}" y="${num(top)}" width="${num(ww)}" height="${num(wh)}" fill="${tokenHex(shade.token, x.theme)}" fill-opacity="${shade.alpha}"/>`;
	} else out += contourLayer(x, 'dense', c.gridAlpha, c.grid, rect);
	if (d.winBorder > 0) {
		const lw = Math.max(0.5, d.winBorder * d.u);
		out += `<rect x="${num(wx + lw / 2)}" y="${num(top + lw / 2)}" width="${num(ww - lw)}" height="${num(wh - lw)}" fill="none" stroke="${c.grid}"${sop(c.gridAlpha)} stroke-width="${num(lw, 3)}"/>`;
	}
	return out;
}

function lockupRow(x: Ctx, ink: string | null): { svg: string; rect: Rect } | null {
	const { d, f } = x;
	if (!d.logo) return null;
	const k = (d.logoSize * d.u) / LOCK_H;
	const lh = LOCK_H * k;
	const mh = MARK_H * k;
	const partner = x.content.partner?.trim();
	const lw = d.logoWord ? lockupWidth(f.sans, mh) : markWidth(mh);
	const gap = 26 * k;
	const times = 16 * k;
	const pSize = lh * 0.72;
	const pw = partner ? measure(f.medium, partner, pSize) : 0;
	const total = partner ? lw + gap * 2 + times + pw : lw;
	const x0 = d.logoAnchor === 'left' ? d.logoX * d.W : d.logoAnchor === 'center' ? d.logoX * d.W - total / 2 : d.logoX * d.W - total;
	const y = d.logoY * d.H;
	const my = y + lh / 2 - mh / 2;
	let svg = '';
	if (ink) {
		svg += d.logoWord ? lockupSvg(f.sans, x0, my, mh, ink).svg : markSvg(x0, my, mh, ink);
		if (partner) {
			const cy = y + lh / 2;
			const tx = x0 + lw + gap + times / 2;
			svg += `<path d="M${num(tx - times / 2)} ${num(cy - times / 2)}L${num(tx + times / 2)} ${num(cy + times / 2)}M${num(tx + times / 2)} ${num(cy - times / 2)}L${num(tx - times / 2)} ${num(cy + times / 2)}" stroke="${ink}" stroke-opacity="0.55" stroke-width="${num(2.2 * k, 3)}" stroke-linecap="round"/>`;
			const m = lineMetrics(f.medium, pSize, 1);
			svg += glyphPaths(f.medium, partner, pSize, tx + times / 2 + gap, cy + lh * 0.03 + (m.ascent - m.descent) / 2, ink);
		}
	}
	return { svg, rect: { x: x0, y: Math.min(y, my), w: total, h: Math.max(y + lh, my + mh) - Math.min(y, my) } };
}

function footBody(x: Ctx, size: number): string {
	const { d, f, c, content } = x;
	if (!content.subtitle || d.bodyAt !== 'foot' || d.hideWords) return '';
	const bs = Math.max(size * 0.34 * (d.bodyScale / 100), d.minText * d.u);
	const bw = (d.bodyWidth > 0 ? d.bodyWidth : d.textWidth) * d.W;
	const lines = content.subtitle.split('\n').flatMap((p) => wrap(f.sans, p, bs, bw));
	const lh = bs * d.bodyLeading;
	const bottom = d.H - d.footInset * d.u;
	const ax = d.textX * d.W;
	return lines
		.map((l, i) => {
			const w = measure(f.sans, l, bs);
			const lx = d.align === 'left' ? ax : d.align === 'center' ? ax - w / 2 : ax - w;
			return glyphPaths(f.sans, l, bs, lx, bottom - (lines.length - 1 - i) * lh, c.ink);
		})
		.join('');
}

/** The rows of a chart: "label | number", one a line. Rows without a number are an error. */
export function chartRows(chart: string): { label: string; value: number; text: string }[] {
	return chart
		.split('\n')
		.map((l) => l.trim())
		.filter(Boolean)
		.map((l) => {
			const [label, raw] = l.split('|').map((p) => p.trim());
			const value = Number((raw ?? '').replace(/,/g, ''));
			if (!label || !Number.isFinite(value)) throw new Error(`Chart row "${l}" needs "label | number".`);
			return { label, value, text: raw };
		});
}

function chartLayer(x: Ctx, wordsEnd: number): string {
	const { d, f, c } = x;
	if (!x.content.chart) return '';
	const rows = chartRows(x.content.chart);
	if (!rows.length) return '';
	const m = d.footInset * d.u;
	const labelS = Math.max(d.minText * d.u, 26 * d.u);
	const numS = d.chartSize * d.u;
	const base = d.H - m - labelS * 2.2;
	const top = Math.max(d.chartTop * d.H, wordsEnd + numS * 0.5) + numS * 1.1;
	const gap = d.W * 0.022;
	const cw = (d.W - m * 2 - gap * (rows.length - 1)) / rows.length;
	const max = Math.max(...rows.map((r) => r.value), 1);
	let labelSize = labelS * 0.92;
	for (const r of rows) {
		const lw = measure(f.sans, r.label, labelSize);
		if (lw > cw * 0.96) labelSize = Math.min(labelSize, (labelSize * cw * 0.96) / lw);
	}
	const lw = Math.max(0.6, d.u * 0.9);
	let out = '';
	rows.forEach((r, i) => {
		const cx = m + i * (cw + gap);
		const h = Math.max(4 * d.u, ((base - top) * r.value) / max);
		const y = base - h;
		out += `<rect x="${num(cx)}" y="${num(y)}" width="${num(cw)}" height="${num(h)}" fill="none" stroke="${c.ink}" stroke-opacity="0.85" stroke-width="${num(lw, 3)}"/>`;
		let hatch = '';
		for (let yy = y + 8 * d.u; yy < base; yy += 8 * d.u) hatch += `M${num(cx)} ${num(yy)}H${num(cx + cw)}`;
		if (hatch) out += `<path d="${hatch}" fill="none" stroke="${c.ink}" stroke-opacity="0.6" stroke-width="${num(lw, 3)}"/>`;
		out += glyphPaths(f.sans, r.text, numS, cx, y - numS * 0.22, c.ink, -0.02);
		out += glyphPaths(f.sans, r.label, labelSize, cx, base + labelS * 1.5, c.ink);
	});
	out += `<rect x="0" y="${num(base)}" width="${d.W}" height="${num(Math.max(0.6, d.u))}" fill="${c.ink}" fill-opacity="0.4"/>`;
	return out;
}

const luminance = (hex: string) => {
	const n = Number.parseInt(hex.slice(1), 16);
	return (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
};

export type PosterRequest = { template: string; width: number; height: number; ground: string; theme?: string; content: PosterContent };

/** The poster's SVG body (no root element), for the image, deck and video renderers. */
export function posterBody(req: PosterRequest): string {
	const theme = req.theme ?? defaultTheme();
	if (req.content.scene) {
		const isIso = req.template === 'scene';
		const pool: string[] = isIso ? [...ISO_PRESETS] : wireScenes();
		if (!pool.includes(req.content.scene)) throw new Error(`Unknown scene "${req.content.scene}" for ${req.template}. Scenes: ${pool.join(', ')}.`);
	}
	const d = layoutFor(req.template, req.width, req.height, req.content.scene);
	const c = groundColors(req.ground, theme);
	const x: Ctx = { d, c, f: loadFaces(), content: req.content, theme, ids: 0 };
	const parts: string[] = [`<rect width="${d.W}" height="${d.H}" fill="${c.bg}"/>`];
	const size = fittedSize(x);
	let laid = words(x, size, null, null);
	if (d.textMiddle) {
		d.textY -= laid.rect.h / 2 / d.H;
		laid = words(x, size, null, null);
	}
	if (d.hideWords) laid = { rect: { x: 0, y: 0, w: 0, h: 0 }, svg: '', size };
	if (d.contours !== 'none') parts.push(contourLayer(x, d.contours, (d.contourAlpha / 100) * c.gridAlpha, c.grid));
	const overPhoto = d.window === 'picture' && d.winW >= 0.99;
	if (d.grid && !overPhoto && d.gridMode !== 'box') parts.push(gridLayer(x, null));
	parts.push(frameLayer(x));
	const winTop = d.window === 'none' ? null : d.winFollow ? laid.rect.y + laid.rect.h + d.winGap * d.u : d.winY * d.H;
	for (const s of d.stickers) if (s.kind !== 'callout' && !(s.kind === 'parcel' && !s.behind)) parts.push(stickerLayer(x, s, winTop));
	if (winTop !== null) parts.push(windowLayer(x, winTop));
	if (d.grid && overPhoto) parts.push(gridLayer(x, null));
	const grow = (r: Rect, padX: number, padY: number): Rect => {
		let { x: rx, y: ry, w, h } = { x: r.x - padX, y: r.y - padY, w: r.w + padX * 2, h: r.h + padY * 2 };
		if (d.winBoxW > 0 && d.winBoxW * d.W > w) {
			rx -= (d.winBoxW * d.W - w) / 2;
			w = d.winBoxW * d.W;
		}
		if (d.winBoxH > 0 && d.winBoxH * d.H > h) {
			ry -= (d.winBoxH * d.H - h) / 2;
			h = d.winBoxH * d.H;
		}
		return { x: rx, y: ry, w, h };
	};
	const lock = lockupRow(x, null);
	const lpad = d.logoPad * d.u;
	const logoWin = d.logoBox && lock ? grow(lock.rect, lpad, lpad * 0.72) : null;
	const tpad = d.textPad * d.u;
	const textWin = d.textBox && laid.rect.w ? grow(laid.rect, tpad, tpad) : null;
	const tag = d.textBoxStyle === 'tag';
	if (logoWin) parts.push(`<rect x="${num(logoWin.x)}" y="${num(logoWin.y)}" width="${num(logoWin.w)}" height="${num(logoWin.h)}" fill="${c.bg}"/>`);
	if (textWin) parts.push(tag ? `<path d="${chamfer(textWin.x, textWin.y, textWin.w, textWin.h, Math.min(textWin.w, textWin.h) * 0.12)}" fill="${c.window}"/>` : `<rect x="${num(textWin.x)}" y="${num(textWin.y)}" width="${num(textWin.w)}" height="${num(textWin.h)}" fill="${c.bg}"/>`);
	if (d.grid && d.gridMode === 'box') parts.push(gridLayer(x, logoWin ?? textWin ?? { x: d.W / 3, y: d.H / 3, w: d.W / 3, h: d.H / 3 }));
	const onTag = !!(textWin && tag);
	const textInk = onTag ? (luminance(c.window) < 0.35 ? c.windowInk : c.windowInk) : c.ink;
	const drawn = d.hideWords ? null : words(x, size, textInk, onTag ? c.windowInk : c.ink);
	if (drawn) parts.push(drawn.svg);
	parts.push(footBody(x, size));
	if (drawn) parts.push(chartLayer(x, drawn.rect.y + drawn.rect.h));
	const logo = lockupRow(x, c.ink);
	if (logo) parts.push(logo.svg);
	for (const s of d.stickers) if (s.kind === 'callout' || (s.kind === 'parcel' && !s.behind)) parts.push(stickerLayer(x, s, winTop));
	return parts.filter(Boolean).join('');
}

export function posterInfo() {
	const doc = imageDocument();
	return Object.entries(doc.posters).map(([id, p]) => ({ id, family: 'poster' as const, label: p.label, description: p.description, required: p.required, optional: p.optional, ground: p.ground, sample: p.sample }));
}
