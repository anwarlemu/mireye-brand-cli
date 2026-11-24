import { cleanContent, defaultFooter, leading, paletteFor, requireContent, type ImageContent, type Palette, type Size } from '../image/catalog.js';
import { CopyError, fitOrFail, loadFaces, num, placeWords, requireGlyphs, setAt, type Faces, type Fitted, type Font } from '../image/type.js';
import { bottom, cross, frameOf, type DrawnLayer } from '../image/layers.js';
import { coverSvg, loadPicture } from '../image/picture.js';
import { lockupSvg, lockupWidth } from '../image/logo.js';
import { groundColors, imageDocument, posterDraw, posterFloors } from '../image/poster.js';
import { cutFrame, cutPoly, ticks } from '../image/sheet.js';
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
	small: number;
	large: number;
	mark: number;
	layers: DrawnLayer[];
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

/** The brand curve on a share from 0 to 1. */
function ease(t: number): number {
	const timing = videoTiming();
	return bezier(timing.easing[0], timing.easing[1], timing.easing[2], timing.easing[3], t);
}

function span(progress: number, start: number, end: number): number {
	if (progress <= start) return 0;
	if (progress >= end) return 1;
	return (progress - start) / (end - start);
}

function diamond(cx: number, cy: number, r: number, fill: string): string {
	return `<polygon points="${num(cx)},${num(cy - r)} ${num(cx + r)},${num(cy)} ${num(cx)},${num(cy + r)} ${num(cx - r)},${num(cy)}" fill="${fill}"/>`;
}

/** The picture a clip's frames are drawn as: a vertical clip keeps clear of the bars a story lays over it. */
export function videoSize(format: VideoFormatId): Size {
	const { width, height } = VIDEO_FORMATS[format];
	return { id: format === 'vertical' ? 'story' : format === 'square' ? 'square' : 'video', width, height };
}

function sheetFor(format: VideoFormatId, colors: Palette): Sheet {
	const size = VIDEO_FORMATS[format];
	const metrics = METRICS[format];
	const frame = { x: metrics.pad, y: metrics.pad, w: size.width - metrics.pad * 2, h: size.height - metrics.pad * 2 };
	const F = frameOf(videoSize(format), posterFloors());
	const content = cross({ x: frame.x + metrics.inner, y: frame.y + metrics.inner, w: frame.w - metrics.inner * 2, h: frame.h - metrics.inner * 2 }, F.live);
	const footSize = Math.max(metrics.footer, F.small);
	const footerText = Math.round(footSize * leading('body'));
	const ruleGap = Math.max(18, Math.round(metrics.inner * 0.42));
	const belowRule = Math.max(16, Math.round(metrics.inner * 0.36));
	const footerH = ruleGap + belowRule + footerText;
	const headerGap = Math.max(28, Math.round(metrics.inner * 0.7));
	const header = { x: content.x, y: content.y, w: content.w, h: metrics.mark };
	const footer = { x: content.x, y: content.y + content.h - footerH, w: content.w, h: footerH };
	const body = { x: content.x, y: header.y + header.h + headerGap, w: content.w, h: Math.max(40, content.h - header.h - headerGap - footerH) };
	return { width: size.width, height: size.height, cut: metrics.cut, metrics: { ...metrics, footer: footSize, kicker: Math.max(metrics.kicker, F.small), sub: Math.max(metrics.sub, F.small) }, colors, frame, header, body, footer, ruleY: footer.y + ruleGap, small: F.small, large: F.large, mark: F.mark, layers: [] };
}

function lockup(sheet: Sheet, sans: Font, opacity: number): string {
	const mh = Math.max(sheet.mark, sheet.header.h);
	const w = lockupWidth(sans, mh);
	const x = sheet.header.x + sheet.header.w - w;
	sheet.layers.push({ id: 'logo', kind: 'logo', box: { x, y: sheet.header.y, w, h: mh }, over: ['panel'], logo: { clear: mh * imageDocument().logoRules.clear, min: sheet.mark }, can: {} });
	return `<g opacity="${num(opacity, 4)}">${lockupSvg(sans, x, sheet.header.y, mh, sheet.colors.ink).svg}</g>`;
}

function say(sheet: Sheet, id: string, asked: string, set: Fitted, x: number, y: number, fill: string, own = false): string {
	const p = placeWords(set, x, y, fill);
	sheet.layers.push({ id, kind: 'text', box: p.box, ink: p.ink, over: ['panel'], text: { asked, drawn: set.drawn, size: set.size, color: fill, ground: [sheet.colors.ground], own: own || undefined }, can: {} });
	return p.svg;
}

function footer(sheet: Sheet, mono: Font, text: string, progress: number, own: boolean): string {
	const size = sheet.metrics.footer;
	const set = fitOrFail(mono, text, { size, min: sheet.small, maxWidth: sheet.footer.w, maxLines: 1, leading: leading('body') }, 'footer', 'the clip');
	const textTop = sheet.footer.y + sheet.footer.h - set.height;
	const pitch = 6;
	const count = 18;
	const height = Math.round(size * 0.9);
	const width = (count - 1) * pitch + 1;
	const rule = `<path d="M${num(sheet.footer.x)} ${num(sheet.ruleY)}H${num(sheet.footer.x + sheet.footer.w)}" stroke="${sheet.colors.line}" stroke-width="1" shape-rendering="crispEdges"/>`;
	const showTicks = set.width + 32 + width <= sheet.footer.w;
	const tickY = textTop + Math.max(0, (set.height - height) / 2);
	const marks = showTicks ? ticks(sheet.footer.x + sheet.footer.w - width, tickY, count, pitch, height, Math.round(progress * count), sheet.colors.ink, sheet.colors.line) : '';
	return `${rule}${say(sheet, 'footer', text, set, sheet.footer.x, textTop, sheet.colors.secondary, own)}${marks}`;
}

type Row = { id: string; text: string; font: Font; size: number; min: number; lead: number; fill: string; width: number };

/** Sizes every block of a clip so they all stand in `room`, whole: each steps down to its floor, then the words are too long. */
function fitRows(rows: Row[], room: number, gaps: number): Fitted[] {
	for (const r of rows) requireGlyphs(r.font, r.text, r.id);
	for (let k = 1; k > 0.3; k -= 0.03) {
		const sets = rows.map((r) => {
			const size = Math.max(r.min, r.size * k);
			return setAt(r.font, r.text, size, { size, min: size, maxWidth: r.width, leading: r.lead }, size <= r.min + 0.01);
		});
		if (sets.every(Boolean) && sets.reduce((sum, s) => sum + s!.height, 0) + gaps * k <= room) return sets as Fitted[];
	}
	throw new CopyError(`The words do not fit the clip at a readable size. Shorten ${rows.map((r) => `--${r.id}`).join(' or ')}.`);
}

function social(sheet: Sheet, f: Faces, content: ImageContent, progress: number): string {
	const rows: Row[] = [{ id: 'headline', text: content.title!, font: f.sans, size: sheet.metrics.title, min: sheet.large, lead: leading('tight'), fill: sheet.colors.ink, width: sheet.body.w }];
	if (content.subtitle) rows.push({ id: 'body', text: content.subtitle, font: f.sans, size: sheet.metrics.sub, min: sheet.small, lead: leading('body'), fill: sheet.colors.secondary, width: sheet.body.w });
	const gap = Math.round(sheet.metrics.sub * 0.7);
	const sets = fitRows(rows, sheet.body.h, gap);
	const at = [span(progress, 0.12, 0.62), span(progress, 0.4, 0.9)];
	let y = sheet.body.y;
	return sets
		.map((set, i) => {
			const svg = `<g opacity="${num(at[i], 4)}">${say(sheet, rows[i].id, rows[i].text, set, sheet.body.x, y, rows[i].fill)}</g>`;
			y += set.height + gap;
			return svg;
		})
		.join('');
}

function announcement(sheet: Sheet, f: Faces, content: ImageContent, progress: number): string {
	const kickerIn = span(progress, 0.05, 0.35);
	const titleIn = span(progress, 0.28, 0.7);
	const subIn = span(progress, 0.55, 0.95);
	const inset = Math.round(sheet.metrics.kicker * 1.8);
	const tickH = content.kicker ? Math.round(sheet.metrics.kicker * 0.7) : 0;
	const afterKicker = content.kicker ? 8 + tickH + Math.round(sheet.metrics.title * 0.35) : 0;
	const gap = Math.round(sheet.metrics.sub * 0.7);
	const rows: Row[] = [];
	if (content.kicker) rows.push({ id: 'badge', text: content.kicker, font: f.mono, size: sheet.metrics.kicker, min: sheet.small, lead: leading('body'), fill: sheet.colors.secondary, width: sheet.body.w });
	rows.push({ id: 'headline', text: content.title!, font: f.sans, size: sheet.metrics.title, min: sheet.large, lead: leading('tight'), fill: sheet.colors.ink, width: sheet.body.w - inset });
	if (content.subtitle) rows.push({ id: 'body', text: content.subtitle, font: f.sans, size: sheet.metrics.sub, min: sheet.small, lead: leading('body'), fill: sheet.colors.secondary, width: sheet.body.w });
	const sets = fitRows(rows, sheet.body.h, afterKicker + (content.subtitle ? gap : 0));
	let y = sheet.body.y;
	let out = '';
	sets.forEach((set, i) => {
		const r = rows[i];
		if (r.id === 'badge') {
			out += `<g opacity="${num(kickerIn, 4)}">${say(sheet, r.id, r.text, set, sheet.body.x, y, r.fill)}</g>`;
			if (kickerIn > 0) out += `<g opacity="${num(kickerIn, 4)}">${ticks(sheet.body.x, y + set.height + 8, 12, 6, tickH, Math.round(kickerIn * 12), sheet.colors.ink, sheet.colors.line)}</g>`;
			y += set.height + afterKicker;
		} else if (r.id === 'headline') {
			const rr = Math.max(5, Math.round(sheet.metrics.kicker * 0.42)) * titleIn;
			if (rr > 0.5) out += diamond(sheet.body.x + inset * 0.32, y + set.line * 0.5, rr, sheet.colors.ink);
			out += `<g opacity="${num(titleIn, 4)}">${say(sheet, r.id, r.text, set, sheet.body.x + inset, y, r.fill)}</g>`;
			y += set.height + gap;
		} else out += `<g opacity="${num(subIn, 4)}">${say(sheet, r.id, r.text, set, sheet.body.x, y, r.fill)}</g>`;
	});
	return out;
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

function product(sheet: Sheet, f: Faces, content: ImageContent, progress: number): string {
	const rows: Row[] = [{ id: 'headline', text: content.title!, font: f.sans, size: Math.round(sheet.metrics.title * 0.72), min: sheet.large, lead: leading('tight'), fill: sheet.colors.ink, width: sheet.body.w }];
	if (content.subtitle) rows.push({ id: 'body', text: content.subtitle, font: f.sans, size: sheet.metrics.kicker * 1.15, min: sheet.small, lead: leading('body'), fill: sheet.colors.secondary, width: sheet.body.w });
	const gap = Math.round(sheet.metrics.kicker * 0.6);
	const sets = fitRows(rows, sheet.body.h * 0.5, gap);
	const at = [span(progress, 0, 0.4), span(progress, 0.2, 0.55)];
	let cursor = sheet.body.y;
	let out = '';
	sets.forEach((set, i) => {
		out += `<g opacity="${num(at[i], 4)}">${say(sheet, rows[i].id, rows[i].text, set, sheet.body.x, cursor, rows[i].fill)}</g>`;
		cursor += set.height + gap;
	});
	cursor += gap;
	const plateH = Math.max(1, sheet.body.y + sheet.body.h - cursor);
	const cut = Math.max(16, Math.round(sheet.cut * 0.75));
	sheet.layers.push({ id: 'art', kind: 'art', box: { x: sheet.body.x, y: cursor, w: sheet.body.w, h: plateH }, over: ['panel'], can: {} });
	return `${out}<clipPath id="plate"><path d="${cutPoly(sheet.body.x, cursor, sheet.body.w, plateH, cut)}"/></clipPath><g clip-path="url(#plate)">${plate(sheet.body.x, cursor, sheet.body.w, plateH, sheet.colors, progress)}</g>${cutFrame(sheet.body.x, cursor, sheet.body.w, plateH, cut, sheet.colors.line)}`;
}

function escapeXml(value: string): string {
	return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

type VideoContent = ImageContent & { poster?: string; ground?: string };
export type VideoFrame = { svg: string; layers: DrawnLayer[] };

/** A poster revealed left to right over its ground: the clip widens with the eased progress. */
function posterFrame(format: VideoFormatId, theme: string, content: VideoContent, progress: number, seed?: number): VideoFrame {
	const size = videoSize(format);
	const { width, height } = size;
	const template = content.poster ?? '';
	const doc = imageDocument();
	if (!doc.posters[template]) throw new Error(`Unknown poster "${template}". Posters: ${Object.keys(doc.posters).join(', ')}.`);
	const ground = content.ground ?? doc.posters[template].ground;
	const { poster: _p, ground: _g, ...words } = content;
	const clean = cleanContent(words);
	requireContent(template, clean);
	const drawn = posterDraw({ template, size, ground, theme, content: clean, seed });
	const bg = groundColors(ground, theme).bg;
	return {
		svg: `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img">
<title>${escapeXml(content.title ?? template)}</title>
<rect width="${width}" height="${height}" fill="${bg}"/>
<clipPath id="reveal"><rect width="${num(width * progress)}" height="${height}"/></clipPath><g clip-path="url(#reveal)">${drawn.svg}</g>
</svg>
`,
		layers: drawn.layers,
	};
}

/** One frame of a template and what it drew. `index` is the only thing that changes between frames. */
/** Frames a clip needs: the brand clock, once per screenshot for a walkthrough. */
export function framesFor(template: VideoTemplateId, content: ImageContent, clock: number): number {
	if (template !== 'walkthrough') return clock;
	return clock * Math.max(1, (content.images ?? '').split('|').filter((x) => x.trim()).length);
}

function lowerThird(format: VideoFormatId, theme: string, content: ImageContent, progress: number): VideoFrame {
	const size = videoSize(format);
	const { width: W, height: H } = size;
	const F = frameOf({ id: 'video', width: W, height: H }, posterFloors());
	const f = loadFaces();
	const c = groundColors('bone', theme);
	const name = content.title!;
	const role = content.subtitle;
	const nameSize = Math.max(F.large, H * 0.045);
	const roleSize = Math.max(F.small * 1.2, H * 0.026);
	const pad = nameSize * 0.6;
	const maxW = W * 0.62;
	requireGlyphs(f.sans, name, 'headline');
	if (role) requireGlyphs(f.sans, role, 'body');
	const a = setAt(f.sans, name, nameSize, { size: nameSize, min: nameSize, maxWidth: maxW, maxLines: 2, leading: 1.15 }, false);
	const b = role ? setAt(f.sans, role, roleSize, { size: roleSize, min: roleSize, maxWidth: maxW, maxLines: 2, leading: 1.3 }, false) : undefined;
	if (!a || (role && !b)) throw new CopyError('A lower third holds two lines of name and two of role: the words are too long. Shorten them.');
	const w = Math.max(a.width, b?.width ?? 0) + pad * 2;
	const h = a.height + (b ? b.height + pad * 0.3 : 0) + pad * 1.6;
	const x = F.live.x;
	const y = H * 0.82 - h;
	const reveal = span(progress, 0, 0.55);
	const words = span(progress, 0.3, 0.9);
	const layers: DrawnLayer[] = [];
	const pa = placeWords(a, x + pad, y + pad * 0.8, c.windowInk);
	layers.push({ id: 'headline', kind: 'text', box: pa.box, ink: pa.ink, over: ['panel'], text: { asked: name, drawn: a.drawn, size: a.size, color: c.windowInk, ground: [c.window] }, can: {} });
	let roleSvg = '';
	if (b) {
		const pb = placeWords(b, x + pad, y + pad * 0.8 + a.height + pad * 0.3, c.windowMuted);
		roleSvg = pb.svg;
		layers.push({ id: 'body', kind: 'text', box: pb.box, ink: pb.ink, over: ['panel'], text: { asked: role!, drawn: b.drawn, size: b.size, color: c.windowMuted, ground: [c.window] }, can: {} });
	}
	layers.unshift({ id: 'panel', kind: 'panel', box: { x, y, w, h }, can: {} });
	const cut = h * 0.18;
	return {
		svg: `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img">
<title>${escapeXml([name, role].filter(Boolean).join('. '))}</title>
<!--ground--><clipPath id="lt"><rect x="${num(x)}" y="${num(y)}" width="${num(w * reveal)}" height="${num(h)}"/></clipPath><g clip-path="url(#lt)"><path d="M${num(x + cut)} ${num(y)}H${num(x + w)}V${num(y + h)}H${num(x)}V${num(y + cut)}Z" fill="${c.window}"/><g opacity="${num(words, 4)}">${pa.svg}${roleSvg}</g></g>
</svg>
`,
		layers,
	};
}

function walkthrough(format: VideoFormatId, theme: string, content: ImageContent, index: number, frameCount: number): VideoFrame {
	const size = videoSize(format);
	const { width: W, height: H } = size;
	const files = (content.images ?? '').split('|').map((x) => x.trim()).filter(Boolean);
	if (files.length < 1 || files.length > 8) throw new CopyError(`A walkthrough takes one to eight screenshots (--images, split by |), not ${files.length}.`);
	const F = frameOf({ id: size.id, width: W, height: H }, posterFloors());
	const f = loadFaces();
	const c = groundColors('bone', theme);
	const per = frameCount / files.length;
	const at = Math.min(files.length - 1, Math.floor(index / per));
	const local = (index - at * per) / per;
	// The last part of each hold fades into the next screenshot: the brand's base duration, eased.
	const fade = at < files.length - 1 ? ease(span(local, 0.88, 1)) : 0;
	const layers: DrawnLayer[] = [];
	let top = F.live.y;
	let head = '';
	if (content.title) {
		requireGlyphs(f.sans, content.title, 'headline');
		const set = fitOrFail(f.sans, content.title, { size: Math.max(F.large, H * 0.06), min: F.large, maxWidth: F.live.w, maxHeight: F.live.h * 0.2, leading: 1.1 }, 'headline', 'the walkthrough');
		const p = placeWords(set, F.live.x, top, c.ink);
		head = p.svg;
		layers.push({ id: 'headline', kind: 'text', box: p.box, ink: p.ink, text: { asked: content.title, drawn: set.drawn, size: set.size, color: c.ink, ground: [c.bg] }, can: {} });
		top = bottom(p.box) + F.m * 0.6;
	}
	const box = { x: F.live.x, y: top, w: F.live.w, h: bottom(F.live) - top };
	const cut = Math.min(box.w, box.h) * 0.04;
	const shape = `<path d="M${num(box.x + cut)} ${num(box.y)}H${num(box.x + box.w)}V${num(box.y + box.h)}H${num(box.x)}V${num(box.y + cut)}Z"/>`;
	const shot = (i: number, opacity: number) => `<g opacity="${num(opacity, 4)}">${coverSvg(loadPicture(files[i]), box, `wk${i}`, shape)}</g>`;
	layers.push({ id: 'picture', kind: 'key', box, can: {} });
	return {
		svg: `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img">
<title>${escapeXml(content.title ?? 'Walkthrough')}</title>
<rect width="${W}" height="${H}" fill="${c.bg}"/>${head}${shot(at, 1)}${fade > 0 ? shot(at + 1, fade) : ''}<path d="M${num(box.x + cut)} ${num(box.y)}H${num(box.x + box.w)}V${num(box.y + box.h)}H${num(box.x)}V${num(box.y + cut)}Z" fill="none" stroke="${c.ink}" stroke-opacity="0.32" stroke-width="2"/>
</svg>
`,
		layers,
	};
}

export function videoFrame(format: VideoFormatId, template: VideoTemplateId, theme: string, content: VideoContent, index: number, frameCount: number, seed?: number): VideoFrame {
	if (template === 'lower-third') return lowerThird(format, theme, content, frameProgress(index, frameCount));
	if (template === 'walkthrough') return walkthrough(format, theme, content, index, frameCount);
	if (template === 'poster') return posterFrame(format, theme, content, frameProgress(index, frameCount), seed);
	const colors = paletteFor(theme);
	const faces = loadFaces();
	const sheet = sheetFor(format, colors);
	const progress = frameProgress(index, frameCount);
	const footerText = content.footer || defaultFooter();
	sheet.layers.push({ id: 'panel', kind: 'panel', box: sheet.frame, can: {} });
	const mark = lockup(sheet, faces.sans, span(progress, 0, 0.45));
	const body = template === 'social' ? social(sheet, faces, content, progress) : template === 'announcement' ? announcement(sheet, faces, content, progress) : product(sheet, faces, content, progress);
	const title = [content.kicker, content.title, content.subtitle, footerText].filter(Boolean).join('. ');
	const foot = footer(sheet, faces.mono, footerText, progress, !content.footer);
	return {
		svg: `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${sheet.width}" height="${sheet.height}" viewBox="0 0 ${sheet.width} ${sheet.height}" role="img">
<title>${escapeXml(title)}</title>
<rect width="${sheet.width}" height="${sheet.height}" fill="${colors.ground}"/>
${cutFrame(sheet.frame.x, sheet.frame.y, sheet.frame.w, sheet.frame.h, sheet.cut, colors.line)}
${mark}
${body}
${foot}
</svg>
`,
		layers: sheet.layers,
	};
}

export const frameSvg = (format: VideoFormatId, template: VideoTemplateId, theme: string, content: VideoContent, index: number, frameCount: number, seed?: number): string => videoFrame(format, template, theme, content, index, frameCount, seed).svg;
