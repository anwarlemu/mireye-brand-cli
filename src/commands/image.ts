import { readFileSync } from 'node:fs';
import { dirname, isAbsolute, resolve } from 'node:path';
import { catalog, cleanContent, defaultTheme, isFormat, isTemplate, requireContent, themes, type ImageContent } from '../image/catalog.js';
import { renderImage, type ExportKind } from '../image/render.js';
import { cli } from '../lib/brand.js';
import { emit } from '../lib/output.js';
import { findProjectRoot } from '../lib/paths.js';

type Options = {
	list?: boolean;
	format?: string;
	template?: string;
	theme?: string;
	title?: string;
	subtitle?: string;
	kicker?: string;
	quote?: string;
	attribution?: string;
	image?: string;
	footer?: string;
	content?: string;
	out?: string;
	name?: string;
	export?: string;
	json?: boolean;
};

const KINDS = new Set<ExportKind>(['png', 'svg']);

function exportsOf(value: string | undefined): ExportKind[] {
	const parts = (value ?? 'png,svg').split(',').map((part) => part.trim()).filter(Boolean);
	if (!parts.length || parts.some((part) => !KINDS.has(part as ExportKind))) throw new Error('--export is png, svg, or png,svg.');
	return [...new Set(parts)] as ExportKind[];
}

function fileContent(file: string): ImageContent {
	const raw = file === '-' ? readFileSync(0, 'utf8') : readFileSync(resolve(file), 'utf8');
	let parsed: unknown;
	try {
		parsed = JSON.parse(raw);
	} catch {
		throw new Error('--content must be a JSON object.');
	}
	const content = cleanContent(parsed);
	// A picture named in the file sits next to that file. Flag paths stay relative to the working directory.
	if (file !== '-' && content.image && !isAbsolute(content.image)) content.image = resolve(dirname(resolve(file)), content.image);
	return content;
}

function safeName(name: string): string {
	const clean = name.trim().toLowerCase().replace(/[^a-z0-9-_]+/g, '-').replace(/^-+|-+$/g, '');
	if (!clean) throw new Error('--name needs letters or numbers.');
	return clean;
}

function flagContent(opts: Options): ImageContent {
	const picked: ImageContent = {};
	for (const key of ['title', 'subtitle', 'kicker', 'quote', 'attribution', 'image', 'footer'] as const) {
		if (opts[key]) picked[key] = opts[key];
	}
	return cleanContent(picked);
}

export async function imageCommand(opts: Options) {
	if (opts.list) {
		const data = catalog();
		emit(opts, data, () => {
			const formats = data.formats.map((format) => `  ${format.id.padEnd(12)} ${String(format.width).padStart(4)} x ${String(format.height).padEnd(4)}  ${format.use}`);
			const templates = data.templates.map((template) => `  ${template.id.padEnd(12)} ${template.description} Requires: ${template.required.join(', ') || 'none'}.`);
			const themeLines = data.themes.map((theme) => `  ${theme.id.padEnd(12)} ${theme.label}${theme.default ? ' (default)' : ''}`);
			return [`Formats`, ...formats, '', `Templates`, ...templates, '', `Themes`, ...themeLines, '', `Export: ${data.exports.join(', ')}. Default output: ${data.defaults.out}.`, `Run \`${cli()} image --format og --template headline --title "..." --json\`.`].join('\n');
		});
		return;
	}
	if (!opts.format) throw new Error('--format is required: og, square, portrait, landscape.');
	if (!isFormat(opts.format)) throw new Error(`Unknown format "${opts.format}". Formats: og, square, portrait, landscape.`);
	if (!opts.template) throw new Error('--template is required: headline, subtext, frame, quote or announcement.');
	if (!isTemplate(opts.template)) throw new Error(`Unknown template "${opts.template}". Templates: headline, subtext, frame, quote, announcement.`);
	const theme = opts.theme ?? defaultTheme();
	if (!themes().some((item) => item.id === theme)) throw new Error(`Unknown theme "${theme}". Themes: ${themes().map((item) => item.id).join(', ')}.`);
	const content = { ...((opts.content ? fileContent(opts.content) : {}) as ImageContent), ...flagContent(opts) };
	requireContent(opts.template, content);
	const format = opts.format;
	const template = opts.template;
	const result = await renderImage({
		format,
		template,
		theme,
		content,
		exports: exportsOf(opts.export),
		outDir: opts.out ? resolve(opts.out) : resolve(findProjectRoot(), '.ds', 'images'),
		name: safeName(opts.name ?? `${format}-${template}`),
	});
	emit(opts, result, () => result.files.map((file) => `${file.format.padEnd(4)} ${file.width}x${file.height}  ${file.path}`).join('\n'));
}
