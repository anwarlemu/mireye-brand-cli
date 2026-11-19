import { readFileSync } from 'node:fs';
import { pkgPath } from '../lib/paths.js';
import { groundColors, groundIds } from '../image/poster.js';
import { num } from '../image/type.js';
import { isoBounds, isoPreset, isoSvg, ISO_PRESETS, type IsoPreset } from './iso.js';
import { traceContours } from './trace.js';
import { wireDoc, wireDrawing, wireScenes } from './wire.js';

// One illustration request in, one SVG out. Four styles, all the brand's own: the hidden-line wireframe scenes of its
// illustration skill, the quick isometric scenes of its share-image tool, the topographic contour fields from its
// website, and any picture traced as contours in that same line. brand/illustration.md holds the rules and sources.

export const STYLES = ['wire', 'iso', 'contours', 'trace'] as const;
export type Style = (typeof STYLES)[number];

/** The illustration skill's grounds: green (the default), brown and bone. Black has no tones in the skill. */
export const WIRE_GROUNDS = ['green', 'brown', 'bone'];

export type IllustrateRequest = {
	style: Style;
	subject?: string;
	ground: string;
	theme?: string;
	image?: string;
	spec?: string;
	cols?: number;
	rows?: number;
	count?: number;
	highlight?: boolean;
	frame?: { width: number; height: number; fill: number };
	background: boolean;
	levels?: number;
	detail?: number;
	smooth?: number;
	invert?: boolean;
	width?: number;
};

export type Illustration = { svg: string; width: number; height: number; style: Style; subject: string; ground: string; parts: Record<string, number | string> };

let contourDoc: { width: number; height: number; dense: string[]; sparse: string[] } | undefined;
const contours = () => (contourDoc ??= JSON.parse(readFileSync(pkgPath('brand', 'assets', 'contours.json'), 'utf8')));

export function subjectsFor(style: Style): string[] {
	if (style === 'wire') return wireScenes();
	if (style === 'iso') return [...ISO_PRESETS];
	if (style === 'contours') return ['dense', 'sparse'];
	return [];
}

export function defaultSubject(style: Style): string | undefined {
	return { wire: 'datacenter', iso: 'residential', contours: 'dense', trace: undefined }[style];
}

/** The style a bare subject names: a wireframe scene first, then an isometric preset, then a contour field. */
export function styleOf(subject: string): Style | undefined {
	return STYLES.find((style) => subjectsFor(style).includes(subject));
}

function wrapSvg(width: number, height: number, body: string, bg: string | null, title: string): string {
	return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img">
<title>${title.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</title>
${bg ? `<rect width="${width}" height="${height}" fill="${bg}"/>` : ''}${body}
</svg>
`;
}

/** Fit a w by h drawing into the frame at `fill` of its width and height, centered. */
function placed(frame: { width: number; height: number; fill: number }, w: number, h: number, inner: string) {
	const k = Math.min((frame.width * frame.fill) / w, (frame.height * frame.fill) / h);
	const x = (frame.width - w * k) / 2;
	const y = (frame.height - h * k) / 2;
	return `<g transform="translate(${num(x)} ${num(y)}) scale(${num(k, 5)})">${inner}</g>`;
}

export async function buildIllustration(req: IllustrateRequest): Promise<Illustration> {
	if (!groundIds().includes(req.ground)) throw new Error(`Unknown ground "${req.ground}". Grounds: ${groundIds().join(', ')}.`);
	const c = groundColors(req.ground, req.theme);
	const bg = req.background ? c.bg : null;
	if (req.style === 'wire') {
		if (!WIRE_GROUNDS.includes(req.ground)) throw new Error(`Wireframe scenes have tones for ${WIRE_GROUNDS.join(', ')} only (the illustration skill's grounds).`);
		const subject = req.subject ?? 'datacenter';
		const art = wireDrawing(subject, c.dark ? 'dark' : 'light');
		const label = wireDoc().scenes[subject].label;
		if (req.frame) return { svg: wrapSvg(req.frame.width, req.frame.height, placed(req.frame, art.width, art.height, art.inner), bg, label), width: req.frame.width, height: req.frame.height, style: 'wire', subject, ground: req.ground, parts: { S: art.S, native: `${art.width}x${art.height}` } };
		return { svg: wrapSvg(art.width, art.height, art.inner, bg, label), width: art.width, height: art.height, style: 'wire', subject, ground: req.ground, parts: { S: art.S, length: art.svg.length } };
	}
	if (req.style === 'iso') {
		const subject = req.subject ?? 'residential';
		const spec = req.spec ?? isoPreset({ scene: subject as IsoPreset, cols: req.cols ?? 12, rows: req.rows ?? 8, count: req.count ?? 4, highlight: req.highlight ?? true });
		const b = isoBounds(spec);
		const width = req.frame?.width ?? req.width ?? 1200;
		const height = req.frame?.height ?? Math.round((width * b.h) / b.w) + 16;
		const fill = req.frame?.fill ?? 1;
		const bw = width * fill - 16;
		const bh = height * fill - 16;
		const k = Math.min(bw / b.w, bh / b.h);
		const dw = b.w * k;
		const dh = b.h * k;
		const body = `<g transform="translate(${num((width - dw) / 2)} ${num((height - dh) / 2)})">${isoSvg(spec, dw, dh, { ink: c.ink, bg: c.bg, accent: c.window, lineWidth: 1.6 }, 'iso')}</g>`;
		return { svg: wrapSvg(width, height, body, bg, req.spec ? 'Isometric scene' : `Isometric ${subject}`), width, height, style: 'iso', subject: req.spec ? 'custom' : subject, ground: req.ground, parts: { lines: spec.split('\n').length, spec } };
	}
	if (req.style === 'contours') {
		const subject = req.subject ?? 'dense';
		const data = contours();
		const width = req.frame?.width ?? req.width ?? data.width;
		const height = req.frame?.height ?? Math.round((width * data.height) / data.width);
		const k = Math.max(width / data.width, height / data.height);
		const paths = (subject === 'sparse' ? data.sparse : data.dense).map((p: string) => `<path d="${p}"/>`).join('');
		const body = `<clipPath id="field"><rect width="${width}" height="${height}"/></clipPath><g clip-path="url(#field)"><g transform="translate(${num((width - data.width * k) / 2)} ${num((height - data.height * k) / 2)}) scale(${num(k, 5)})" fill="none" stroke="${c.grid}" stroke-opacity="${c.gridAlpha}" stroke-width="${num(1.1 / k, 4)}">${paths}</g></g>`;
		return { svg: wrapSvg(width, height, body, bg, `Contours, ${subject}`), width, height, style: 'contours', subject, ground: req.ground, parts: {} };
	}
	if (!req.image) throw new Error('trace draws a picture as contours: pass --image <png or jpeg>.');
	const width = req.frame?.width ?? req.width ?? 1200;
	const traced = await traceContours(req.image, req.frame ? width * req.frame.fill : width, { levels: req.levels ?? 12, detail: req.detail ?? 220, smooth: req.smooth ?? 4, invert: req.invert ?? false });
	const height = req.frame?.height ?? traced.height;
	const ox = (width - traced.width) / 2;
	const oy = (height - traced.height) / 2;
	const strokes = traced.paths.map((d) => `<path d="${d}"/>`).join('');
	const body = `<g transform="translate(${num(ox)} ${num(oy)})" fill="none" stroke="${c.ink}" stroke-width="1.1" stroke-linejoin="round" stroke-linecap="round">${strokes}</g>`;
	return { svg: wrapSvg(width, height, body, bg, 'Picture traced as contours'), width, height, style: 'trace', subject: 'image', ground: req.ground, parts: { lines: traced.lines, levels: traced.paths.length } };
}
