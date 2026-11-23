import { mkdirSync, writeFileSync } from 'node:fs';
import { isAbsolute, join, relative } from 'node:path';
import { platformOf } from '../design/platforms.js';
import { brand } from '../lib/brand.js';
import { GROUNDS, POSTERS, defaultFooter, defaultTheme, isPoster, sizeOf, type ExportKind, type FormatId, type ImageContent, type Size, type TemplateId } from './catalog.js';
import { encode } from './encode.js';
import type { DrawnLayer, Edits } from './layers.js';
import { posterDraw, type Crop } from './poster.js';
import { sheetDraw } from './sheet.js';

export { rasterize } from './encode.js';
export type { ExportKind } from './catalog.js';

export type DrawRequest = { template: string; size: Size; theme?: string; ground?: string; content: ImageContent; seed?: number; edits?: Edits; sample?: boolean; crop?: Crop };

export type Drawn = { svg: string; layers: DrawnLayer[]; width: number; height: number; ground: string; theme: string };

function escapeXml(value: string): string {
	return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export const groundOf = (template: string): string => (isPoster(template) ? POSTERS()[template].ground : 'bone');

/** One image as a whole SVG document, and the layers it drew. Every image, design and preview goes through here. */
export function drawImage(req: DrawRequest): Drawn {
	const theme = req.theme ?? defaultTheme();
	const ground = req.ground ?? groundOf(req.template);
	if (!(ground in GROUNDS())) throw new Error(`Unknown ground "${ground}". Grounds: ${Object.keys(GROUNDS()).join(', ')}.`);
	const { width, height } = req.size;
	const poster = isPoster(req.template);
	const drawn = poster
		? posterDraw({ template: req.template, size: req.size, ground, theme, content: req.content, seed: req.seed, edits: req.edits, sample: req.sample, crop: req.crop })
		: sheetDraw({ template: req.template as TemplateId, size: req.size, ground, theme, content: req.content, edits: req.edits, sample: req.sample, crop: req.crop });
	const c = req.content;
	const title = [c.kicker, c.title, c.subtitle, c.quote, c.attribution, c.partner, c.callout?.replace(/\n/g, ', '), poster ? undefined : c.footer || defaultFooter()].filter(Boolean).join('. ') || brand().name;
	const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img">
<title>${escapeXml(title)}</title>
<desc>${escapeXml(`${req.template} on ${ground}.`)}</desc>
${drawn.svg}
</svg>
`;
	return { svg, layers: drawn.layers, width, height, ground, theme };
}

export type RenderRequest = Omit<DrawRequest, 'size'> & {
	format: FormatId | Size;
	exports: ExportKind[];
	scale?: number;
	outDir: string;
	name: string;
};

export type WrittenFile = { path: string; format: ExportKind; width: number; height: number; bytes: number };

export type RenderResult = {
	schemaVersion: 1;
	ok: true;
	format: FormatId;
	template: string;
	theme: string;
	ground: string;
	width: number;
	height: number;
	files: WrittenFile[];
	layers: DrawnLayer[];
	warnings: string[];
};

export function displayPath(file: string): string {
	const rel = relative(process.cwd(), file);
	if (!rel || rel.startsWith('..') || isAbsolute(rel)) return file;
	return rel.split('\\').join('/');
}

const mb = (n: number) => `${(n / 1024 / 1024).toFixed(1)}MB`;

/** A note when a file is over the size its platform takes. */
export function overLimit(size: Size, kind: string, bytes: number): string | undefined {
	const p = platformOf(size.id, size.width, size.height);
	if (kind === 'svg' || kind === 'pdf' || !p.limit || bytes <= p.limit.bytes) return undefined;
	return `The ${kind} is ${mb(bytes)}; ${p.label} takes ${mb(p.limit.bytes)}${p.limit.official ? '' : ' (approximately)'}. Use --format jpg or webp.`;
}

/** Render one image. Paths in the result are relative to the working directory when they can be. */
export async function renderImage(request: RenderRequest): Promise<RenderResult> {
	const size = typeof request.format === 'string' ? sizeOf(request.format) : request.format;
	const drawn = drawImage({ ...request, size });
	mkdirSync(request.outDir, { recursive: true });
	const scale = request.scale ?? 1;
	const made = await encode(drawn.svg, size.width, request.exports, scale);
	const files: WrittenFile[] = [];
	const warnings: string[] = [];
	for (const kind of request.exports) {
		const file = join(request.outDir, `${request.name}.${kind}`);
		const bytes = made[kind]!;
		writeFileSync(file, bytes);
		const k = kind === 'svg' || kind === 'pdf' ? 1 : scale;
		files.push({ path: displayPath(file), format: kind, width: Math.round(size.width * k), height: Math.round(size.height * k), bytes: bytes.length });
		const note = overLimit(size, kind, bytes.length);
		if (note) warnings.push(note);
	}
	return { schemaVersion: 1, ok: true, format: size.id, template: request.template, theme: drawn.theme, ground: drawn.ground, width: size.width, height: size.height, files, layers: drawn.layers, warnings };
}

/** A poster as a whole SVG document at a named size. */
export function posterDocument(format: FormatId, template: string, theme: string, ground: string, content: ImageContent): string {
	return drawImage({ template, size: sizeOf(format), theme, ground, content }).svg;
}

export function svgDocument(format: FormatId, template: TemplateId, theme: string, content: ImageContent): string {
	return drawImage({ template, size: sizeOf(format), theme, content }).svg;
}
