import { readFileSync } from 'node:fs';
import { dirname, isAbsolute, resolve } from 'node:path';
import { FORMATS, GROUNDS, POSTERS, catalog, cleanContent, defaultTheme, isPoster, requireContent, resolveFormat, templateIds, themes, type ContentKey, type ImageContent } from '../image/catalog.js';
import { renderImage, type ExportKind } from '../image/render.js';
import { cli } from '../lib/brand.js';
import { helpRow } from '../lib/help-row.js';
import { pickName, unknownName } from '../lib/names.js';
import { emit } from '../lib/output.js';
import { findProjectRoot } from '../lib/paths.js';

type Options = Partial<Record<ContentKey, string>> & {
	list?: boolean;
	format?: string;
	size?: string;
	template?: string;
	theme?: string;
	ground?: string;
	sample?: boolean;
	content?: string;
	out?: string;
	name?: string;
	export?: string;
	json?: boolean;
};

const FIELDS: ContentKey[] = ['title', 'subtitle', 'kicker', 'quote', 'attribution', 'image', 'footer', 'callout', 'chart', 'partner', 'scene'];
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

export function safeName(name: string): string {
	const clean = name.trim().toLowerCase().replace(/[^a-z0-9-_]+/g, '-').replace(/^-+|-+$/g, '');
	if (!clean) throw new Error('--name needs letters or numbers.');
	return clean;
}

function flagContent(opts: Options): ImageContent {
	const picked: ImageContent = {};
	for (const key of FIELDS) if (opts[key]) picked[key] = opts[key];
	return cleanContent(picked);
}

export function listText() {
	const data = catalog();
	const formats = data.formats.map((f) => helpRow(f.id, `${String(f.width).padStart(4)} x ${String(f.height).padEnd(4)}  ${f.use}${f.aliases.length ? ` (also ${f.aliases.join(', ')})` : ''}`, 18));
	const templates = data.templates.map((t) => helpRow(t.id, `${t.family === 'poster' ? 'poster' : 'sheet '}  ${t.description} Requires: ${t.required.join(', ') || 'none'}.`, 16));
	const grounds = data.grounds.map((g) => helpRow(g.id, g.label, 12));
	const themeLines = data.themes.map((theme) => helpRow(theme.id, `${theme.label}${theme.default ? ' (default)' : ''}`, 14));
	return [
		'Sizes',
		...formats,
		'',
		'Templates (sheet: the cut-frame sheet, bone only, sizes at least 600px tall; poster: the brand layouts, every size and ground)',
		...templates,
		'',
		'Grounds (posters)',
		...grounds,
		'',
		'Themes',
		...themeLines,
		'',
		`Export: ${data.exports.join(', ')}. Default output: ${data.defaults.out}. ${data.content.sample}`,
		`Run \`${cli()} image --format og --template window --title "..." --json\`.`,
	].join('\n');
}

export async function imageCommand(opts: Options) {
	if (opts.list) {
		emit(opts, catalog(), listText);
		return;
	}
	const sizeName = opts.size ?? opts.format;
	if (!sizeName) throw new Error(`--size is required: ${Object.keys(FORMATS).join(', ')}.`);
	const format = resolveFormat(sizeName);
	if (!format) throw unknownName('size', sizeName, Object.keys(FORMATS));
	if (!opts.template) throw new Error(`--template is required: ${templateIds().join(', ')}.`);
	const template = pickName('template', opts.template, templateIds());
	const theme = opts.theme ?? defaultTheme();
	if (!themes().some((item) => item.id === theme)) throw unknownName('theme', theme, themes().map((item) => item.id));
	const ground = opts.ground ? pickName('ground', opts.ground, Object.keys(GROUNDS())) : undefined;
	const sample = opts.sample ? (isPoster(template) ? cleanContent(POSTERS()[template].sample) : {}) : {};
	if (opts.sample && !isPoster(template)) throw new Error('--sample fills poster templates only.');
	const content = { ...sample, ...((opts.content ? fileContent(opts.content) : {}) as ImageContent), ...flagContent(opts) };
	requireContent(template, content);
	const result = await renderImage({
		format,
		template,
		theme,
		ground,
		content,
		exports: exportsOf(opts.export),
		outDir: opts.out ? resolve(opts.out) : resolve(findProjectRoot(), '.ds', 'images'),
		name: safeName(opts.name ?? `${format}-${template}`),
	});
	emit(opts, result, () => result.files.map((file) => `${file.format.padEnd(4)} ${file.width}x${file.height}  ${file.path}`).join('\n'));
}
