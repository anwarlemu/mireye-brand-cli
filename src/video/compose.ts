import { readFileSync } from 'node:fs';
import { brand } from '../lib/brand.js';
import { pkgPath } from '../lib/paths.js';
import { defaultFooter, leading, paletteFor, type ImageContent, type Palette } from '../image/catalog.js';
import { drawText, lineMetrics, loadFaces, measure, num, type Font } from '../image/type.js';
import { VIDEO_FORMATS, type VideoFormatId, type VideoTemplateId, videoTiming } from './catalog.js';

const METRICS: Record<VideoFormatId, { pad: number; cut: number; inner: number; mark: number; title: number; sub: number; kicker: number; footer: number }> = {
	square: { pad: 56, cut: 40, inner: 64, mark: 36, title: 72, sub: 28, kicker: 18, footer: 18 },
	vertical: { pad: 64, cut: 48, inner: 72, mark: 40, title: 80, sub: 32, kicker: 20, footer: 18 },
	landscape: { pad: 64, cut: 44, inner: 72, mark: 36, title: 76, sub: 28, kicker: 18, footer: 18 },
};

type Box = { x: number; y: number; w: number; h: number };
type Metrics = (typeof METRICS)[VideoFormatId];
type Sheet = {
	width: number;
	height: number;
	cut: number;
	metrics: Metrics;
	colors: Palette;
	frame: Box;
	header: Box;
	body: Box;
	footer: Box;
	ruleY: number;
};

function bezier(x1: number, y1: number, x2: number, y2: number, t: number): number {
	const cx = 3 * x1;
	const bx = 3 * (x2 - x1) - cx;
	const ax = 1 - cx - bx;
	const cy = 3 * y1;
	const by = 3 * (y2 - y1) - cy;
	const ay = 1 - cy - by;
	const sampleX = (u: number) => ((ax * u + bx) * u + cx) * u;
	const sampleDX = (u: number) => (3 * ax * u + 2 * bx) * u + cx;
	const sampleY = (u: number) => ((ay * u + by) * u + cy) * u;
	let u = t;
	for (let i = 0; i < 8; i++) {
		const slope = sampleDX(u);
		if (Math.abs(slope) < 1e-6) break;
		u -= (sampleX(u) - t) / slope;
	}
	if (u < 0) u = 0;
	if (u > 1) u = 1;
	return sampleY(u);
}

/** Progress of one frame, eased with the brand curve. Frame 0 is the start and the last frame is the settled sheet. */
export function frameProgress(index: number, frameCount: number): number {
	const timing = videoTiming();
	const t = frameCount <= 1 ? 1 : index / (frameCount - 1);
	return bezier(timing.easing[0], timing.easing[1], timing.easing[2], timing.easing[3], t);
}

function span(progress: number, start: number, end: number): number {
	if (progress <= start) return 0;
	if (progress >= end) return 1;
	return (progress - start) / (end - start);
}

function cutPoly(x: number, y: number, w: number, h: number, cut: number): string {
	const c = Math.max(0, Math.min(cut, w / 3, h / 3));
	return `M${num(x + c)} ${num(y)}H${num(x + w)}V${num(y + h)}H${num(x)}V${num(y + c)}Z`;
}

function cutFrame(x: number, y: number, w: number, h: number, cut: number, color: string, stroke = 2): string {
	const innerCut = cut + stroke * (Math.SQRT2 - 1);
	const outer = cutPoly(x, y, w, h, cut);
	const inner = `M${num(x + innerCut)} ${num(y + stroke)}H${num(x + w - stroke)}V${num(y + h - stroke)}H${num(x + stroke)}V${num(y + innerCut)}Z`;
	return `<path d="${outer}${inner}" fill="${color}" fill-rule="evenodd"/>`;
}

function diamond(cx: number, cy: number, r: number, fill: string): string {
	return `<polygon points="${num(cx)},${num(cy - r)} ${num(cx + r)},${num(cy)} ${num(cx)},${num(cy + r)} ${num(cx - r)},${num(cy)}" fill="${fill}"/>`;
}

function logo(): { d: string; w: number; h: number } {
	const svg = readFileSync(pkgPath('brand', 'logo', 'mark.svg'), 'utf8');
	const box = svg.match(/viewBox="([\d.\s-]+)"/)?.[1].trim().split(/\s+/).map(Number) ?? [];
	const d = svg.match(/\sd="([^"]+)"/)?.[1];
	if (!d || !box[2] || !box[3]) throw new Error('The logo mark has no path.');
	return { d, w: box[2], h: box[3] };
}

function sheetFor(format: VideoFormatId, colors: Palette): Sheet {
	const size = VIDEO_FORMATS[format];
	const metrics = METRICS[format];
	const frame = { x: metrics.pad, y: metrics.pad, w: size.width - metrics.pad * 2, h: size.height - metrics.pad * 2 };
	const content = { x: frame.x + metrics.inner, y: frame.y + metrics.inner, w: frame.w - metrics.inner * 2, h: frame.h - metrics.inner * 2 };
	const footerText = Math.round(metrics.footer * leading('body'));
	const ruleGap = Math.max(18, Math.round(metrics.inner * 0.42));
	const belowRule = Math.max(16, Math.round(metrics.inner * 0.36));
	const footerH = ruleGap + belowRule + footerText;
	const headerGap = Math.max(28, Math.round(metrics.inner * 0.7));
	const header = { x: content.x, y: content.y, w: content.w, h: metrics.mark };
	const footer = { x: content.x, y: content.y + content.h - footerH, w: content.w, h: footerH };
	const body = { x: content.x, y: header.y + header.h + headerGap, w: content.w, h: Math.max(40, content.h - header.h - headerGap - footerH) };
	return { width: size.width, height: size.height, cut: metrics.cut, metrics, colors, frame, header, body, footer, ruleY: footer.y + ruleGap };
}

function lockup(sheet: Sheet, sans: Font, opacity: number): string {
	const glyph = logo();
	const height = sheet.header.h;
	const scale = height / glyph.h;
	const nameSize = Math.round(height * 0.72);
	const gap = Math.round(height * 0.46);
	const name = brand().name;
	const nameWidth = measure(sans, name, nameSize);
	const x = sheet.header.x + sheet.header.w - (glyph.w * scale + gap + nameWidth);
	const em = lineMetrics(sans, nameSize, 1).em;
	const drawn = drawText(sans, name, nameSize, x + glyph.w * scale + gap, sheet.header.y + (height - em) / 2, sheet.colors.ink, {
		leading: 1,
		maxWidth: Math.max(nameWidth + 4, 40),
		maxLines: 1,
	});
	return `<g opacity="${num(opacity, 4)}"><g transform="translate(${num(x)} ${num(sheet.header.y)}) scale(${num(scale, 5)})"><path d="${glyph.d}" fill="${sheet.colors.ink}" fill-rule="evenodd"/></g>${drawn.svg}</g>`;
}

function ticks(x: number, y: number, count: number, pitch: number, height: number, on: number, ink: string, off: string): string {
	let body = '';
	for (let i = 0; i < count; i++) body += `<rect x="${num(x + i * pitch)}" y="${num(y)}" width="1" height="${num(height)}" fill="${i < on ? ink : off}" shape-rendering="crispEdges"/>`;
	return body;
}

function footer(sheet: Sheet, mono: Font, text: string, progress: number): string {
	const size = sheet.metrics.footer;
	const metrics = lineMetrics(mono, size, leading('body'));
	const textTop = sheet.footer.y + sheet.footer.h - metrics.lineHeight;
	const drawn = drawText(mono, text, size, sheet.footer.x, textTop, sheet.colors.secondary, {
		leading: leading('body'),
		maxWidth: sheet.footer.w * 0.62,
		maxLines: 1,
		minSize: Math.max(12, size - 4),
	});
	const pitch = 6;
	const count = 18;
	const height = Math.round(size * 0.9);
	const width = (count - 1) * pitch + 1;
	const rule = `<path d="M${num(sheet.footer.x)} ${num(sheet.ruleY)}H${num(sheet.footer.x + sheet.footer.w)}" stroke="${sheet.colors.line}" stroke-width="1" shape-rendering="crispEdges"/>`;
	const showTicks = drawn.width + 32 + width <= sheet.footer.w;
	const tickY = textTop + Math.max(0, (drawn.height - height) / 2);
	const marks = showTicks ? ticks(sheet.footer.x + sheet.footer.w - width, tickY, count, pitch, height, Math.round(progress * count), sheet.colors.ink, sheet.colors.line) : '';
	return `${rule}${drawn.svg}${marks}`;
}

function textBlock(font: Font, text: string | undefined, size: number, x: number, y: number, fill: string, width: number, maxLines: number, lead: number, opacity: number): { svg: string; height: number } {
	if (!text) return { svg: '', height: 0 };
	const drawn = drawText(font, text, size, x, y, fill, { leading: lead, maxWidth: width, maxLines, minSize: Math.max(13, Math.round(size * 0.62)) });
	if (!drawn.svg) return { svg: '', height: 0 };
	return { svg: `<g opacity="${num(opacity, 4)}">${drawn.svg}</g>`, height: drawn.height };
}

function social(sheet: Sheet, sans: Font, content: ImageContent, progress: number): string {
	const titleIn = span(progress, 0.12, 0.62);
	const subIn = span(progress, 0.4, 0.9);
	const title = textBlock(sans, content.title, sheet.metrics.title, sheet.body.x, sheet.body.y, sheet.colors.ink, sheet.body.w, 4, leading('tight'), titleIn);
	const sub = textBlock(sans, content.subtitle, sheet.metrics.sub, sheet.body.x, sheet.body.y + title.height + Math.round(sheet.metrics.sub * 0.7), sheet.colors.secondary, sheet.body.w, 3, leading('body'), subIn);
	return `${title.svg}${sub.svg}`;
}

function announcement(sheet: Sheet, sans: Font, mono: Font, content: ImageContent, progress: number): string {
	const kickerIn = span(progress, 0.05, 0.35);
	const titleIn = span(progress, 0.28, 0.7);
	const subIn = span(progress, 0.55, 0.95);
	const kicker = textBlock(mono, content.kicker, sheet.metrics.kicker, sheet.body.x, sheet.body.y, sheet.colors.secondary, sheet.body.w, 1, leading('body'), kickerIn);
	const tickH = Math.round(sheet.metrics.kicker * 0.7);
	const tickY = sheet.body.y + kicker.height + (content.kicker ? 8 : 0);
	const tickMarks = content.kicker && kickerIn > 0 ? `<g opacity="${num(kickerIn, 4)}">${ticks(sheet.body.x, tickY, 12, 6, tickH, Math.round(kickerIn * 12), sheet.colors.ink, sheet.colors.line)}</g>` : '';
	const titleY = content.kicker ? tickY + tickH + Math.round(sheet.metrics.title * 0.35) : sheet.body.y;
	const inset = Math.round(sheet.metrics.kicker * 1.8);
	const r = Math.max(5, Math.round(sheet.metrics.kicker * 0.42)) * titleIn;
	const node = r > 0.5 ? diamond(sheet.body.x + inset * 0.32, titleY + sheet.metrics.title * 0.42, r, sheet.colors.ink) : '';
	const title = textBlock(sans, content.title, sheet.metrics.title, sheet.body.x + inset, titleY, sheet.colors.ink, sheet.body.w - inset, 4, leading('tight'), titleIn);
	const sub = textBlock(sans, content.subtitle, sheet.metrics.sub, sheet.body.x, titleY + title.height + Math.round(sheet.metrics.sub * 0.7), sheet.colors.secondary, sheet.body.w, 3, leading('body'), subIn);
	return `${kicker.svg}${tickMarks}${node}${title.svg}${sub.svg}`;
}

function plate(x: number, y: number, w: number, h: number, colors: Palette, progress: number): string {
	const pad = Math.round(Math.min(w, h) * 0.08);
	const left = x + pad;
	const right = x + w - pad;
	const top = y + pad;
	const bottom = y + h - pad;
	const innerW = Math.max(1, right - left);
	const innerH = Math.max(1, bottom - top);
	const rows = [0.28, 0.5, 0.7].map((t) => top + innerH * t);
	const grow = left + innerW * progress;
	const vx = left + innerW * 0.22;
	const lines = [
		`<line x1="${num(vx)}" y1="${num(top)}" x2="${num(vx)}" y2="${num(top + (rows[2] - top) * progress)}" stroke="${colors.lineSubtle}" stroke-width="1" shape-rendering="crispEdges"/>`,
		...rows.map((row, index) => `<line x1="${num(left)}" y1="${num(row)}" x2="${num(grow)}" y2="${num(row)}" stroke="${index === 1 ? colors.line : colors.lineSubtle}" stroke-width="1" shape-rendering="crispEdges"/>`),
	];
	const nodeX = left + innerW * (0.18 + 0.46 * progress);
	const node = progress > 0.04 ? diamond(nodeX, rows[1], 6, colors.ink) : '';
	const openX = left + innerW * 0.82;
	const open = progress > 0.72 ? `<polygon points="${num(openX)},${num(rows[1] - 6)} ${num(openX + 6)},${num(rows[1])} ${num(openX)},${num(rows[1] + 6)} ${num(openX - 6)},${num(rows[1])}" fill="${colors.fog}" stroke="${colors.ink}" stroke-width="1.25"/>` : '';
	return `<rect x="${num(x)}" y="${num(y)}" width="${num(w)}" height="${num(h)}" fill="${colors.fog}"/>${lines.join('')}${node}${open}`;
}

function product(sheet: Sheet, sans: Font, content: ImageContent, progress: number): string {
	const titleIn = span(progress, 0, 0.4);
	const titleSize = Math.round(sheet.metrics.title * 0.72);
	const title = textBlock(sans, content.title, titleSize, sheet.body.x, sheet.body.y, sheet.colors.ink, sheet.body.w, 2, leading('tight'), titleIn);
	let cursor = sheet.body.y + title.height + Math.round(sheet.metrics.kicker * 0.55);
	const subIn = span(progress, 0.2, 0.55);
	const sub = textBlock(sans, content.subtitle, sheet.metrics.kicker, sheet.body.x, cursor, sheet.colors.secondary, sheet.body.w, 2, leading('body'), subIn);
	if (content.subtitle) cursor += sub.height + Math.round(sheet.metrics.kicker * 0.8);
	const plateH = Math.max(1, sheet.body.y + sheet.body.h - cursor);
	const cut = Math.max(16, Math.round(sheet.cut * 0.75));
	return `${title.svg}${sub.svg}<clipPath id="plate"><path d="${cutPoly(sheet.body.x, cursor, sheet.body.w, plateH, cut)}"/></clipPath><g clip-path="url(#plate)">${plate(sheet.body.x, cursor, sheet.body.w, plateH, sheet.colors, progress)}</g>${cutFrame(sheet.body.x, cursor, sheet.body.w, plateH, cut, sheet.colors.line)}`;
}

function escapeXml(value: string): string {
	return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** One frame of a template. `index` is the only thing that changes between frames. */
export function frameSvg(format: VideoFormatId, template: VideoTemplateId, theme: string, content: ImageContent, index: number, frameCount: number): string {
	const colors = paletteFor(theme);
	const faces = loadFaces();
	const sheet = sheetFor(format, colors);
	const progress = frameProgress(index, frameCount);
	const footerText = content.footer || defaultFooter();
	const body =
		template === 'social' ? social(sheet, faces.sans, content, progress)
		: template === 'announcement' ? announcement(sheet, faces.sans, faces.mono, content, progress)
		: product(sheet, faces.sans, content, progress);
	const title = [content.kicker, content.title, content.subtitle, footerText].filter(Boolean).join('. ');
	const clipped = `<clipPath id="sheet-body"><rect x="${num(sheet.body.x)}" y="${num(sheet.body.y)}" width="${num(sheet.body.w)}" height="${num(sheet.body.h)}"/></clipPath><g clip-path="url(#sheet-body)">${body}</g>`;
	return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${sheet.width}" height="${sheet.height}" viewBox="0 0 ${sheet.width} ${sheet.height}" role="img">
<title>${escapeXml(title)}</title>
<rect width="${sheet.width}" height="${sheet.height}" fill="${colors.ground}"/>
${cutFrame(sheet.frame.x, sheet.frame.y, sheet.frame.w, sheet.frame.h, sheet.cut, colors.line)}
${lockup(sheet, faces.sans, span(progress, 0, 0.45))}
${clipped}
${footer(sheet, faces.mono, footerText, progress)}
</svg>
`;
}
