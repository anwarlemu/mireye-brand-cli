import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { isAbsolute, join, relative, resolve } from 'node:path';
import { brand } from '../lib/brand.js';
import { pkgPath } from '../lib/paths.js';
import { FORMATS, type FormatId, type ImageContent, type Palette, type TemplateId, defaultFooter, leading, paletteFor } from './catalog.js';
import { drawText, lineMetrics, loadFaces, measure, num, type Drawn, type Font } from './type.js';

export type ExportKind = 'png' | 'svg';

export type RenderRequest = {
	format: FormatId;
	template: TemplateId;
	theme: string;
	content: ImageContent;
	exports: ExportKind[];
	outDir: string;
	name: string;
};

export type WrittenFile = { path: string; format: ExportKind; width: number; height: number; bytes: number };

export type RenderResult = {
	schemaVersion: 1;
	ok: true;
	format: FormatId;
	template: TemplateId;
	theme: string;
	width: number;
	height: number;
	files: WrittenFile[];
};

/**
 * Poster metrics. Type and the cut are larger than the product UI so the same signature still reads at social size.
 * The sheet stays the brand's: one ground, a hairline cut frame, the mark and a mono footer.
 */
const METRICS: Record<FormatId, { pad: number; cut: number; inner: number; mark: number; title: number; sub: number; kicker: number; quote: number; footer: number; attr: number }> = {
	og: { pad: 36, cut: 28, inner: 48, mark: 28, title: 64, sub: 24, kicker: 16, quote: 44, footer: 16, attr: 16 },
	square: { pad: 56, cut: 40, inner: 64, mark: 36, title: 76, sub: 28, kicker: 18, quote: 52, footer: 18, attr: 18 },
	portrait: { pad: 64, cut: 44, inner: 68, mark: 36, title: 80, sub: 30, kicker: 18, quote: 56, footer: 18, attr: 18 },
	landscape: { pad: 40, cut: 28, inner: 48, mark: 28, title: 60, sub: 24, kicker: 16, quote: 42, footer: 16, attr: 16 },
};

type Box = { x: number; y: number; w: number; h: number };
type Metrics = (typeof METRICS)[FormatId];

type Sheet = {
	format: FormatId;
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

function cutPoly(x: number, y: number, w: number, h: number, cut: number): string {
	const c = Math.max(0, Math.min(cut, w / 3, h / 3));
	return `M${num(x + c)} ${num(y)}H${num(x + w)}V${num(y + h)}H${num(x)}V${num(y + c)}Z`;
}

/** A hairline cut frame. The stroke is a filled band, so the diagonal matches the straight edges. Antialiased, so the 45° cut does not stair. */
function cutFrame(x: number, y: number, w: number, h: number, cut: number, color: string, stroke = 2): string {
	const innerCut = cut + stroke * (Math.SQRT2 - 1);
	const outer = cutPoly(x, y, w, h, cut);
	const inner = `M${num(x + innerCut)} ${num(y + stroke)}H${num(x + w - stroke)}V${num(y + h - stroke)}H${num(x + stroke)}V${num(y + innerCut)}Z`;
	return `<path d="${outer}${inner}" fill="${color}" fill-rule="evenodd"/>`;
}

function diamond(cx: number, cy: number, r: number, fill: string): string {
	return `<polygon points="${num(cx)},${num(cy - r)} ${num(cx + r)},${num(cy)} ${num(cx)},${num(cy + r)} ${num(cx - r)},${num(cy)}" fill="${fill}"/>`;
}

function sheetFor(format: FormatId, colors: Palette): Sheet {
	const size = FORMATS[format];
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
	return { format, width: size.width, height: size.height, cut: metrics.cut, metrics, colors, frame, header, body, footer, ruleY: footer.y + ruleGap };
}

function logo(): { d: string; w: number; h: number } {
	const svg = readFileSync(pkgPath('brand', 'logo', 'mark.svg'), 'utf8');
	const box = svg.match(/viewBox="([\d.\s-]+)"/)?.[1].trim().split(/\s+/).map(Number) ?? [0, 0, 27.1667, 20];
	const d = svg.match(/\sd="([^"]+)"/)?.[1];
	if (!d || !box[2] || !box[3]) throw new Error('The logo mark has no path.');
	return { d, w: box[2], h: box[3] };
}

function lockup(sheet: Sheet, sans: Font): string {
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
	return `<g transform="translate(${num(x)} ${num(sheet.header.y)}) scale(${num(scale, 5)})"><path d="${glyph.d}" fill="${sheet.colors.ink}" fill-rule="evenodd"/></g>${drawn.svg}`;
}

function ticks(x: number, y: number, count: number, pitch: number, height: number, on: number, ink: string, off: string): string {
	let body = '';
	for (let i = 0; i < count; i++) body += `<rect x="${num(x + i * pitch)}" y="${num(y)}" width="1" height="${num(height)}" fill="${i < on ? ink : off}" shape-rendering="crispEdges"/>`;
	return body;
}

function footer(sheet: Sheet, mono: Font, text: string): string {
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
	const marks = showTicks ? ticks(sheet.footer.x + sheet.footer.w - width, tickY, count, pitch, height, 7, sheet.colors.ink, sheet.colors.line) : '';
	return `${rule}${drawn.svg}${marks}`;
}

type Piece = { drawn: Drawn; gapBefore: number };

function columnHeight(items: Piece[]): number {
	const visible = items.filter((item) => item.drawn.height > 0 && item.drawn.svg);
	return visible.reduce((sum, item, index) => sum + item.drawn.height + (index > 0 ? item.gapBefore : 0), 0);
}

/** Move a column of blocks onto the footer rule. Each block was drawn at the top of the body. */
function stack(sheet: Sheet, items: Piece[]): string {
	const visible = items.filter((item) => item.drawn.height > 0 && item.drawn.svg);
	const height = columnHeight(visible);
	let y = sheet.body.y + Math.max(0, sheet.body.h - height);
	return visible
		.map((item, index) => {
			if (index > 0) y += item.gapBefore;
			const shift = y - sheet.body.y;
			const svg = shift ? `<g transform="translate(0 ${num(shift)})">${item.drawn.svg}</g>` : item.drawn.svg;
			y += item.drawn.height;
			return svg;
		})
		.join('');
}

/** Shrink the column until it sits in the body. A block taller than the body would paint through the footer rule. */
function fitColumn(sheet: Sheet, make: (scale: number) => Piece[]): string {
	let scale = 1;
	let pieces = make(scale);
	while (columnHeight(pieces) > sheet.body.h && scale > 0.5) {
		scale = Math.round((scale - 0.05) * 100) / 100;
		pieces = make(scale);
	}
	return stack(sheet, pieces);
}

function atBody(font: Font, text: string | undefined, size: number, sheet: Sheet, fill: string, opts: { leading: number; maxLines: number; minSize: number; maxHeight?: number; x?: number; width?: number }): Drawn {
	if (!text) return { svg: '', width: 0, height: 0, size, lines: [] };
	return drawText(font, text, size, opts.x ?? sheet.body.x, sheet.body.y, fill, {
		leading: opts.leading,
		maxWidth: opts.width ?? sheet.body.w,
		maxLines: opts.maxLines,
		minSize: opts.minSize,
		maxHeight: opts.maxHeight,
	});
}

function headline(sheet: Sheet, sans: Font, content: ImageContent): string {
	const lines = sheet.height < 800 ? 3 : 4;
	return fitColumn(sheet, (scale) => {
		const title = atBody(sans, content.title, Math.round(sheet.metrics.title * scale), sheet, sheet.colors.ink, {
			leading: leading('tight'),
			maxLines: lines,
			minSize: Math.round(sheet.metrics.title * scale),
		});
		return [{ drawn: title, gapBefore: 0 }];
	});
}

function subtext(sheet: Sheet, sans: Font, content: ImageContent): string {
	const lines = sheet.height < 800 ? 2 : 3;
	return fitColumn(sheet, (scale) => {
		const title = atBody(sans, content.title, Math.round(sheet.metrics.title * scale), sheet, sheet.colors.ink, {
			leading: leading('tight'),
			maxLines: lines,
			minSize: Math.round(sheet.metrics.title * scale),
			maxHeight: sheet.body.h * 0.62,
		});
		const sub = atBody(sans, content.subtitle, Math.max(16, Math.round(sheet.metrics.sub * scale)), sheet, sheet.colors.secondary, {
			leading: leading('body'),
			maxLines: 3,
			minSize: Math.max(16, Math.round(sheet.metrics.sub * scale)),
			maxHeight: sheet.body.h * 0.32,
		});
		return [
			{ drawn: title, gapBefore: 0 },
			{ drawn: sub, gapBefore: Math.round(sheet.metrics.sub * 0.75) },
		];
	});
}

function announcement(sheet: Sheet, sans: Font, mono: Font, content: ImageContent): string {
	const lines = sheet.height < 800 ? 3 : 4;
	return fitColumn(sheet, (scale) => {
		const kicker = atBody(mono, content.kicker, sheet.metrics.kicker, sheet, sheet.colors.secondary, { leading: leading('body'), maxLines: 1, minSize: 13 });
		const tickH = content.kicker ? Math.round(sheet.metrics.kicker * 0.7) : 0;
		const tick: Drawn = {
			svg: content.kicker ? ticks(sheet.body.x, sheet.body.y, 12, 6, tickH, 5, sheet.colors.ink, sheet.colors.line) : '',
			width: 67,
			height: tickH,
			size: sheet.metrics.kicker,
			lines: [],
		};
		const title = atBody(sans, content.title, Math.round(sheet.metrics.title * scale), sheet, sheet.colors.ink, {
			leading: leading('tight'),
			maxLines: lines,
			minSize: Math.round(sheet.metrics.title * scale),
		});
		const sub = atBody(sans, content.subtitle, Math.max(16, Math.round(sheet.metrics.sub * scale)), sheet, sheet.colors.secondary, {
			leading: leading('body'),
			maxLines: 2,
			minSize: Math.max(16, Math.round(sheet.metrics.sub * scale)),
		});
		return [
			{ drawn: kicker, gapBefore: 0 },
			{ drawn: tick, gapBefore: content.kicker ? Math.round(sheet.metrics.kicker * 0.7) : 0 },
			{ drawn: title, gapBefore: content.kicker ? Math.round(sheet.metrics.title * 0.42) : 0 },
			{ drawn: sub, gapBefore: sub.height ? Math.round(sheet.metrics.sub * 0.7) : 0 },
		];
	});
}

function quote(sheet: Sheet, sans: Font, mono: Font, content: ImageContent): string {
	const lines = sheet.height < 800 ? 4 : 6;
	return fitColumn(sheet, (scale) => {
		const size = Math.round(sheet.metrics.quote * scale);
		const r = Math.max(5, Math.round(size * 0.16));
		const inset = r * 2 + Math.round(size * 0.42);
		const text = atBody(sans, content.quote, size, sheet, sheet.colors.ink, {
			leading: leading('display'),
			maxLines: lines,
			minSize: size,
			x: sheet.body.x + inset,
			width: sheet.body.w - inset,
		});
		const metrics = lineMetrics(sans, text.size, leading('display'));
		const baseline = sheet.body.y + (metrics.lineHeight - metrics.em) / 2 + metrics.ascent;
		const node = diamond(sheet.body.x + r, baseline - metrics.ascent * 0.38, r, sheet.colors.ink);
		const by = atBody(mono, content.attribution, sheet.metrics.attr, sheet, sheet.colors.secondary, {
			leading: leading('body'),
			maxLines: 1,
			minSize: 13,
			x: sheet.body.x + inset,
			width: sheet.body.w - inset,
		});
		return [
			{ drawn: { ...text, svg: `${node}${text.svg}` }, gapBefore: 0 },
			{ drawn: by, gapBefore: by.height ? Math.round(sheet.metrics.attr) : 0 },
		];
	});
}

function imageMime(buf: Buffer): string | undefined {
	if (buf.length >= 8 && buf.subarray(0, 8).toString('hex') === '89504e470d0a1a0a') return 'image/png';
	if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
	return undefined;
}

function readImage(file: string): { href: string; mime: string } {
	const path = resolve(file);
	if (!existsSync(path)) throw new Error(`No image at ${file}.`);
	const buf = readFileSync(path);
	if (buf.length > 12 * 1024 * 1024) throw new Error('The frame image is larger than 12MB.');
	const mime = imageMime(buf);
	if (!mime) throw new Error('The frame image must be a PNG or JPEG.');
	return { href: buf.toString('base64'), mime };
}

function surveyPlate(x: number, y: number, w: number, h: number, colors: Palette, mono: Font): string {
	const pad = Math.round(Math.min(w, h) * 0.08);
	const left = x + pad;
	const right = x + w - pad;
	const top = y + pad;
	const bottom = y + h - pad;
	const innerW = Math.max(1, right - left);
	const innerH = Math.max(1, bottom - top);
	const rows = [0.28, 0.5, 0.7].map((t) => top + innerH * t);
	const vx = left + innerW * 0.24;
	const lines = [
		`<line x1="${num(vx)}" y1="${num(top)}" x2="${num(vx)}" y2="${num(rows[2])}" stroke="${colors.lineSubtle}" stroke-width="1" shape-rendering="crispEdges"/>`,
		...rows.map((row, index) => `<line x1="${num(left)}" y1="${num(row)}" x2="${num(right)}" y2="${num(row)}" stroke="${index === 1 ? colors.line : colors.lineSubtle}" stroke-width="1" shape-rendering="crispEdges"/>`),
	];
	const node = diamond(vx, rows[1], 6, colors.ink);
	const openX = left + innerW * 0.7;
	const open = `<polygon points="${num(openX)},${num(rows[1] - 6)} ${num(openX + 6)},${num(rows[1])} ${num(openX)},${num(rows[1] + 6)} ${num(openX - 6)},${num(rows[1])}" fill="${colors.fog}" stroke="${colors.ink}" stroke-width="1.25"/>`;
	const labelSize = Math.max(14, Math.round(Math.min(w, h) * 0.034));
	const label = drawText(mono, 'Survey plate', labelSize, left, bottom - lineMetrics(mono, labelSize, leading('body')).lineHeight, colors.secondary, {
		leading: leading('body'),
		maxWidth: innerW * 0.7,
		maxLines: 1,
	});
	return `<rect x="${num(x)}" y="${num(y)}" width="${num(w)}" height="${num(h)}" fill="${colors.fog}"/>${lines.join('')}${node}${open}${label.svg}`;
}

function frame(sheet: Sheet, sans: Font, mono: Font, content: ImageContent): string {
	let cursor = sheet.body.y;
	const parts: string[] = [];
	const gap = Math.round(sheet.metrics.kicker * 0.7);
	if (content.title) {
		const title = drawText(sans, content.title, Math.round(sheet.metrics.title * 0.72), sheet.body.x, cursor, sheet.colors.ink, {
			leading: leading('tight'),
			maxWidth: sheet.body.w,
			maxLines: 2,
			minSize: Math.round(sheet.metrics.title * 0.46),
			maxHeight: sheet.body.h * 0.26,
		});
		parts.push(title.svg);
		cursor += title.height + gap;
	}
	if (content.subtitle) {
		const sub = drawText(sans, content.subtitle, sheet.metrics.kicker, sheet.body.x, cursor, sheet.colors.secondary, {
			leading: leading('body'),
			maxWidth: sheet.body.w,
			maxLines: 2,
			minSize: 14,
			maxHeight: sheet.body.h * 0.16,
		});
		parts.push(sub.svg);
		cursor += sub.height + gap;
	}
	const plateH = Math.max(1, sheet.body.y + sheet.body.h - cursor);
	const cut = Math.max(16, Math.round(sheet.cut * 0.75));
	const clip = `<clipPath id="plate"><path d="${cutPoly(sheet.body.x, cursor, sheet.body.w, plateH, cut)}"/></clipPath>`;
	let picture: string;
	if (content.image) {
		const image = readImage(content.image);
		picture = `<image href="data:${image.mime};base64,${image.href}" x="${num(sheet.body.x)}" y="${num(cursor)}" width="${num(sheet.body.w)}" height="${num(plateH)}" preserveAspectRatio="xMidYMid slice"/>`;
	} else picture = surveyPlate(sheet.body.x, cursor, sheet.body.w, plateH, sheet.colors, mono);
	return `${parts.join('')}${clip}<g clip-path="url(#plate)">${picture}</g>${cutFrame(sheet.body.x, cursor, sheet.body.w, plateH, cut, sheet.colors.line)}`;
}

function escapeXml(value: string): string {
	return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function compose(format: FormatId, template: TemplateId, theme: string, content: ImageContent): string {
	const colors = paletteFor(theme);
	const faces = loadFaces();
	const sheet = sheetFor(format, colors);
	const footerText = content.footer || defaultFooter();
	const body =
		template === 'headline' ? headline(sheet, faces.sans, content)
		: template === 'subtext' ? subtext(sheet, faces.sans, content)
		: template === 'announcement' ? announcement(sheet, faces.sans, faces.mono, content)
		: template === 'quote' ? quote(sheet, faces.sans, faces.mono, content)
		: frame(sheet, faces.sans, faces.mono, content);
	const title = [content.kicker, content.title, content.subtitle, content.quote, content.attribution, footerText].filter(Boolean).join('. ');
	const desc = content.image ? 'Screenshot in a cut frame.' : template === 'frame' ? 'Survey plate.' : 'Brand sheet.';
	const clipped = `<clipPath id="sheet-body"><rect x="${num(sheet.body.x)}" y="${num(sheet.body.y)}" width="${num(sheet.body.w)}" height="${num(sheet.body.h)}"/></clipPath><g clip-path="url(#sheet-body)">${body}</g>`;
	return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${sheet.width}" height="${sheet.height}" viewBox="0 0 ${sheet.width} ${sheet.height}" role="img">
<title>${escapeXml(title)}</title>
<desc>${escapeXml(desc)}</desc>
<rect width="${sheet.width}" height="${sheet.height}" fill="${colors.ground}"/>
${cutFrame(sheet.frame.x, sheet.frame.y, sheet.frame.w, sheet.frame.h, sheet.cut, colors.line)}
${lockup(sheet, faces.sans)}
${clipped}
${footer(sheet, faces.mono, footerText)}
</svg>
`;
}

function displayPath(file: string): string {
	const rel = relative(process.cwd(), file);
	if (!rel || rel.startsWith('..') || isAbsolute(rel)) return file;
	return rel.split('\\').join('/');
}

async function rasterize(svg: string, width: number): Promise<Buffer> {
	let Resvg: typeof import('@resvg/resvg-js').Resvg;
	try {
		({ Resvg } = await import('@resvg/resvg-js'));
	} catch {
		throw new Error('PNG export needs the optional @resvg/resvg-js package. Install it, or pass --export svg.');
	}
	return new Resvg(svg, {
		fitTo: { mode: 'width', value: width },
		font: { loadSystemFonts: false },
		shapeRendering: 2,
		textRendering: 2,
		imageRendering: 0,
		logLevel: 'off',
	}).render().asPng();
}

/** Render one image to SVG, PNG, or both. Paths in the result are relative to the working directory when they can be. */
export async function renderImage(request: RenderRequest): Promise<RenderResult> {
	const { width, height } = FORMATS[request.format];
	const svg = compose(request.format, request.template, request.theme, request.content);
	mkdirSync(request.outDir, { recursive: true });
	const files: WrittenFile[] = [];
	for (const kind of request.exports) {
		const file = join(request.outDir, `${request.name}.${kind}`);
		if (kind === 'svg') writeFileSync(file, svg);
		else writeFileSync(file, await rasterize(svg, width));
		files.push({ path: displayPath(file), format: kind, width, height, bytes: readFileSync(file).length });
	}
	return { schemaVersion: 1, ok: true, format: request.format, template: request.template, theme: request.theme, width, height, files };
}

export function svgDocument(format: FormatId, template: TemplateId, theme: string, content: ImageContent): string {
	return compose(format, template, theme, content);
}
