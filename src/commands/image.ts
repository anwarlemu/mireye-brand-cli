import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import type { Command } from 'commander';
import { EXPORTS, FLAG, NOT_COPY, FORMATS, GROUNDS, POSTERS, SHEET_SAMPLES, catalog, cleanContent, defaultTheme, isPoster, requireContent, resolveFormat, sizeOf, sizesFor, templateIds, themes, type ContentKey, type ExportKind, type ImageContent, type Size } from '../image/catalog.js';
import { outTarget, scaleOf, seedOf } from '../image/output.js';
import { drawImage, renderImage, type DrawRequest, type RenderResult } from '../image/render.js';
import { checkDesign, errorsOf, type DesignDoc, type TemplateInfo } from '../design/index.js';
import { cli } from '../lib/brand.js';
import { helpRow } from '../lib/help-row.js';
import { pickName, unknownName } from '../lib/names.js';
import { emit } from '../lib/output.js';
import { findProjectRoot } from '../lib/paths.js';

// `image`: one picture, one picture at several sizes, or a carousel from a JSON file. Only the words passed are drawn.

type Options = Partial<Record<ContentKey, string>> & {
	headline?: string;
	body?: string;
	badge?: string;
	list?: boolean;
	format?: string;
	size?: string;
	width?: string;
	height?: string;
	template?: string;
	theme?: string;
	ground?: string;
	seed?: string;
	scale?: string;
	sample?: boolean;
	content?: string;
	input?: string;
	out?: string;
	name?: string;
	export?: string;
	json?: boolean;
};

const FIELDS: ContentKey[] = ['title', 'subtitle', 'kicker', 'quote', 'attribution', 'image', 'footer', 'callout', 'chart', 'partner', 'scene', 'labels', 'question', 'suggestions', 'place', 'page', 'stat', 'date', 'speaker', 'price', 'items', 'steps', 'left', 'right', 'before', 'after'];
const SHARED: [keyof Options, ContentKey][] = [['headline', 'title'], ['body', 'subtitle'], ['badge', 'kicker']];

const isKinds = (value: string) => value.split(',').every((part) => (EXPORTS as readonly string[]).includes(part.trim().toLowerCase().replace('jpeg', 'jpg')));

function exportsOf(value: string | undefined, fallback: string): ExportKind[] {
	const parts = (value ?? fallback).split(',').map((part) => part.trim().toLowerCase().replace('jpeg', 'jpg')).filter(Boolean);
	if (!parts.length || parts.some((part) => !(EXPORTS as readonly string[]).includes(part))) throw new Error(`--export is ${EXPORTS.join(', ')} or a comma-separated list of those.`);
	return [...new Set(parts)] as ExportKind[];
}

function readJson(file: string, flag: string): unknown {
	let raw: string;
	try {
		raw = file === '-' ? readFileSync(0, 'utf8') : readFileSync(resolve(file), 'utf8');
	} catch {
		throw new Error(`No file at ${file} (${flag}).`);
	}
	try {
		return JSON.parse(raw);
	} catch {
		throw new Error(`${flag} must be a JSON object.`);
	}
}

/** A picture named in a file sits next to that file. Flag paths stay relative to the working directory. */
function beside(content: ImageContent, file: string): ImageContent {
	for (const key of ['image', 'before', 'after'] as const) if (file !== '-' && content[key] && !isAbsolute(content[key]!)) content[key] = resolve(dirname(resolve(file)), content[key]!);
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
	for (const [flag, key] of SHARED) {
		const value = opts[flag] as string | undefined;
		if (!value) continue;
		if (picked[key] && picked[key] !== value) throw new Error(`--${flag} and --${key} are the same words: pass one.`);
		picked[key] = value;
	}
	return cleanContent(picked);
}

/** --theme takes a ground (bone, green, ...) or a brand theme (api, enterprise); --ground takes a ground. */
export function groundAndTheme(opts: { theme?: string; ground?: string }): { ground?: string; theme: string } {
	const grounds = Object.keys(GROUNDS());
	const ids = themes().map((item) => item.id);
	let ground = opts.ground ? pickName('ground', opts.ground, grounds) : undefined;
	let theme = defaultTheme();
	if (opts.theme) {
		if (ids.includes(opts.theme)) theme = opts.theme;
		else if (grounds.includes(opts.theme)) {
			if (ground && ground !== opts.theme) throw new Error(`--theme ${opts.theme} and --ground ${ground} are two grounds: pass one.`);
			ground = opts.theme;
		} else throw unknownName('theme', opts.theme, [...ids, ...grounds]);
	}
	return { ground, theme };
}

/** The sizes asked for: one, a list, or all a template draws at. */
export function sizesOf(value: string, template: string, width?: string, height?: string): Size[] {
	const dim = (v?: string) => (v === undefined ? undefined : Number(v));
	const pool = sizesFor(template);
	const names = value.trim().toLowerCase() === 'all' ? pool.filter((id) => id !== 'custom') : value.split(',').map((v) => v.trim()).filter(Boolean);
	if (!names.length) throw new Error('--size needs a size.');
	return [...new Set(names)].map((name) => {
		const id = resolveFormat(name);
		if (!id) throw unknownName('size', name, [...Object.keys(FORMATS), 'custom']);
		if (!pool.includes(id)) throw new Error(`${template} does not draw at ${id}. ${id === 'avatar' ? 'A profile picture holds the mark alone: use identity.' : `Sizes: ${pool.join(', ')}.`}`);
		return sizeOf(id, names.length === 1 || id === 'custom' ? dim(width) : undefined, names.length === 1 || id === 'custom' ? dim(height) : undefined);
	});
}

/** The same check a design gets: an image that breaks a rule is an error, and nothing is written. */
async function checked(req: DrawRequest) {
	const { wordColors } = await import('../design/adapter.js');
	const drawn = drawImage(req);
	const copy = Object.fromEntries(Object.entries(req.content).filter(([key]) => !NOT_COPY.has(key)).map(([key, value]) => [FLAG[key as ContentKey], value!]));
	const doc = { version: 1, brand: '', kind: 'image', template: req.template, size: req.size, copy, images: {}, options: {}, layers: {}, history: [], future: [] } as DesignDoc;
	const errors = errorsOf(checkDesign({ doc, info: {} as TemplateInfo, layers: drawn.layers, adapter: { colors: wordColors } }));
	if (errors.length) throw new Error(`${req.template} at ${req.size.id} breaks a rule, so nothing was written. ${errors.map((e) => e.message).join(' ')}`);
}

export function listText() {
	const data = catalog();
	const formats = data.formats.map((f) => helpRow(f.id, `${String(f.width).padStart(4)} x ${String(f.height).padEnd(4)}  ${f.use}${f.aliases.length ? ` (also ${f.aliases.slice(0, 4).join(', ')})` : ''}`, 20));
	const templates = data.templates.map((t) => helpRow(t.id, `${t.family === 'poster' ? 'poster' : 'sheet '}  ${t.description} Requires: ${t.required.map((r) => FLAG[r as ContentKey]).join(', ') || 'none'}.`, 16));
	const grounds = data.grounds.map((g) => helpRow(g.id, g.label, 12));
	const themeLines = data.themes.map((theme) => helpRow(theme.id, `${theme.label}${theme.default ? ' (default)' : ''}`, 14));
	return [
		'Sizes',
		...formats,
		helpRow('custom', '--width and --height in pixels', 20),
		'',
		'Templates (sheet: the cut-frame sheet; poster: the brand layouts; every size and ground)',
		...templates,
		helpRow('carousel', 'several numbered pictures from one JSON file (--input)', 16),
		'',
		'Grounds',
		...grounds,
		'',
		'Themes',
		...themeLines,
		'',
		`Formats: ${data.exports.join(', ')}. Default output: ${data.defaults.out}. ${data.content.words} ${data.content.sample}`,
		`Run \`${cli()} image window --size og --headline "..." --json\`. To revise a picture, start it with \`${cli()} design new\`.`,
	].join('\n');
}

const report = (results: RenderResult[]) => [...results.flatMap((r) => r.files.map((file) => `${file.format.padEnd(4)} ${file.width}x${file.height}  ${file.path}`)), ...results.flatMap((r) => r.warnings.map((w) => `warning: ${w}`))].join('\n');

export async function imageCommand(positional: string | Options | undefined, maybe?: Options) {
	const opts = (typeof positional === 'object' && positional ? positional : maybe) ?? {};
	const named = typeof positional === 'string' ? positional : undefined;
	if (opts.list) {
		emit(opts, catalog(), listText);
		return;
	}
	if (named && opts.template && named !== opts.template) throw new Error(`Name one template: ${named} or ${opts.template}.`);
	const wanted = named ?? opts.template;
	// --format names files (png, svg, jpg, webp, pdf); it also still names a size, as it did first.
	const formatIsKinds = opts.format !== undefined && isKinds(opts.format);
	const sizeName = opts.size ?? (formatIsKinds ? undefined : opts.format);
	const to = outTarget(opts.out, resolve(findProjectRoot(), '.ds', 'images'), EXPORTS);
	const kinds = exportsOf(opts.export ?? (formatIsKinds ? opts.format : undefined), to.kind ?? 'png,svg');
	const { ground, theme } = groundAndTheme(opts);
	const seed = seedOf(opts.seed);
	const scale = scaleOf(opts.scale);

	if (wanted === 'carousel' || (!wanted && opts.input)) {
		await carousel(opts, { sizeName, dir: to.dir, kinds, ground, theme, seed, scale });
		return;
	}
	if (!sizeName) throw new Error(`--size is required: ${[...Object.keys(FORMATS), 'custom'].join(', ')}, a comma-separated list, or all.`);
	if (!wanted) throw new Error(`--template is required: ${templateIds().join(', ')}.`);
	const template = pickName('template', wanted, templateIds());
	const sizes = sizesOf(sizeName, template, opts.width, opts.height);
	const sampleCopy = opts.sample ? cleanContent(isPoster(template) ? POSTERS()[template].sample : (SHEET_SAMPLES()[template] ?? {})) : {};
	const given = { ...((opts.content ? beside(cleanContent(readJson(opts.content, '--content')), opts.content) : {}) as ImageContent), ...flagContent(opts) };
	const content = { ...sampleCopy, ...given };
	if (opts.sample && template === 'frame' && (content.image || given.scene)) delete content[content.image ? 'scene' : 'image'];
	requireContent(template, content, undefined, opts.sample);
	if (sizes.length > 1 && to.name) throw new Error('--out names one file, and several sizes were asked for. Name a folder.');
	// Every size is drawn and checked before the first file is written.
	for (const size of sizes) await checked({ template, size, theme, ground, content, seed, sample: opts.sample });
	const results: RenderResult[] = [];
	for (const size of sizes) {
		const base = opts.name ? safeName(opts.name) : undefined;
		results.push(
			await renderImage({
				format: size,
				template,
				theme,
				ground,
				content,
				seed,
				sample: opts.sample,
				exports: kinds,
				scale,
				outDir: to.dir,
				name: to.name ?? (base ? (sizes.length > 1 ? `${base}-${size.id}` : base) : `${size.id === 'custom' ? `${size.width}x${size.height}` : size.id}-${template}`),
			}),
		);
	}
	emit(opts, results.length === 1 ? results[0] : { schemaVersion: 1, ok: true, template, images: results, warnings: results.flatMap((r) => r.warnings) }, () => report(results));
}

type CarouselOptions = { sizeName?: string; dir: string; kinds: ExportKind[]; ground?: string; theme: string; seed?: number; scale: number };

/** Several pictures from one file: one size, one ground, numbered 1/n on each. */
async function carousel(opts: Options, o: CarouselOptions) {
	if (!opts.input) throw new Error(`carousel needs --input carousel.json: { "size": "portrait", "ground": "bone", "slides": [ { "template": "window", "headline": "..." }, ... ] }.`);
	const doc = readJson(opts.input, '--input') as { size?: string; ground?: string; theme?: string; template?: string; numbers?: boolean; slides?: Record<string, unknown>[] };
	if (!Array.isArray(doc.slides) || !doc.slides.length) throw new Error(`${opts.input} needs a "slides" list.`);
	if (doc.slides.length > 20) throw new Error(`A carousel is at most 20 pictures, not ${doc.slides.length}.`);
	const sizeName = o.sizeName ?? doc.size ?? 'portrait';
	const style = groundAndTheme({ ground: o.ground ?? doc.ground, theme: o.theme === defaultTheme() ? doc.theme : o.theme });
	const total = doc.slides.length;
	const numbered = doc.numbers !== false && total > 1;
	const name = safeName(opts.name ?? 'carousel');
	// Everything is checked and drawn before the first file is written, so a bad slide never leaves half a set.
	const plan = doc.slides.map((raw, i) => {
		const { template: t, ground, theme, ...words } = raw as Record<string, unknown> & { template?: string; ground?: string; theme?: string };
		const at = `Slide ${i + 1}`;
		try {
			const template = pickName('template', String(t ?? doc.template ?? opts.template ?? ''), templateIds());
			const size = sizesOf(sizeName, template, opts.width, opts.height);
			if (size.length > 1) throw new Error('a carousel is one size.');
			const content = beside(cleanContent(words), opts.input!);
			if (numbered) content.page = `${i + 1}/${total}`;
			requireContent(template, content);
			const look = groundAndTheme({ ground: ground ?? style.ground, theme: theme ?? style.theme });
			return { template, size: size[0], content, ...look };
		} catch (error) {
			throw new Error(`${at}: ${(error as Error).message}`);
		}
	});
	for (const [i, p] of plan.entries()) {
		try {
			await checked({ ...p, seed: o.seed });
		} catch (error) {
			throw new Error(`Slide ${i + 1}: ${(error as Error).message}`);
		}
	}
	mkdirSync(o.dir, { recursive: true });
	const results: RenderResult[] = [];
	for (const [i, p] of plan.entries()) results.push(await renderImage({ ...p, format: p.size, seed: o.seed, exports: o.kinds, scale: o.scale, outDir: o.dir, name: `${name}-${String(i + 1).padStart(2, '0')}` }));
	emit(opts, { schemaVersion: 1, ok: true, carousel: true, size: plan[0].size.id, slides: results, warnings: results.flatMap((r) => r.warnings) }, () => report(results));
}

export function registerImage(program: Command) {
	program
		.command('image [template]')
		.description('Render a share image, banner or social post (PNG, SVG, JPG, WebP, PDF) from the brand layouts, tokens, type and logo; several sizes at once; carousels')
		.option('--list', 'list sizes, templates, grounds and themes')
		.option('--size <ids>', 'og, square, portrait, story, landscape, x-banner, linkedin, linkedin-banner, youtube, avatar, custom, ...; a comma-separated list; or all')
		.option('--width <px>', 'with --size custom')
		.option('--height <px>', 'with --size custom')
		.option('--template <id>', 'a poster (window, post, parcels, ...) or a sheet (headline, quote, ...); same as naming it first')
		.option('--theme <id>', 'a ground (bone, green, brown, black) or a brand theme (see --list)')
		.option('--ground <id>', 'bone (default), green, brown or black')
		.option('--headline <text>', 'the headline')
		.option('--title <text>', 'same as --headline')
		.option('--body <text>', 'the line under it')
		.option('--subtitle <text>', 'same as --body')
		.option('--badge <text>', 'announcement: the short label above the headline')
		.option('--kicker <text>', 'same as --badge')
		.option('--quote <text>', 'quotation')
		.option('--attribution <text>', 'who said the quotation')
		.option('--image <path>', 'your PNG or JPEG (frame and photo)')
		.option('--callout <text>', 'parcels and photo: the tag, two lines (what, then where)')
		.option('--labels <text>', 'parcels: a tag on each parcel, up to three, split by |')
		.option('--chart <rows>', 'chart: one row a line, "label | number"')
		.option('--partner <name>', "partner: the partner's name")
		.option('--question <text>', 'app: the question in the ask panel')
		.option('--suggestions <text>', 'app: up to four, split by |')
		.option('--place <text>', 'app: the place in the ask box')
		.option('--scene <id>', 'post, panel and frame: a wireframe scene; scene: an isometric preset')
		.option('--footer <text>', 'sheet footer line (defaults to the brand site)')
		.option('--stat <text>', 'stat: the number')
		.option('--date <text>', 'event: the date')
		.option('--speaker <text>', 'event: the speaker line (a role, not a real name)')
		.option('--price <text>', 'pricing: the price')
		.option('--items <text>', 'pricing: what it includes, split by |')
		.option('--steps <text>', 'flow: the steps, split by |')
		.option('--left <text>', 'compare: the first column, its title first, split by |')
		.option('--right <text>', 'compare: the second column, split by |')
		.option('--before <path>', 'split: the first picture')
		.option('--after <path>', 'split: the second picture')
		.option('--page <n/total>', 'a number for a set, like 2/5 (carousel writes it)')
		.option('--seed <n>', 'another arrangement: which part of the contour map, which parcels, which drawing')
		.option('--sample', 'fill unset words with the sample copy, for a first look (replace it)')
		.option('--content <file>', 'JSON file of the same fields, or - for stdin; flags override it')
		.option('--input <file>', 'carousel: { "size", "ground", "slides": [ { "template", "headline", ... } ] }')
		.option('--out <path>', 'output directory (default: .ds/images in the project), or a file name that also sets the format')
		.option('--name <base>', 'file name without an extension')
		.option('--format <kinds>', 'png, svg, jpg, webp, pdf or a list (default png,svg); a size id also works here')
		.option('--export <kinds>', 'same as --format png,svg,...')
		.option('--scale <n>', 'pixel density, 0.25 to 4 (default 1)')
		.option('--json', 'JSON output listing the files written and the layers drawn')
		.addHelpText('after', () => `\nExamples:\n  ${cli()} image --list --json\n  ${cli()} image window --size og --headline "Physical world context for AI agents." --json\n  ${cli()} image post --size portrait --headline "Residential land" --body "Every field cited." --scene residential\n  ${cli()} image parcels --size story,square,x-banner --theme green --headline "Find the parcels that fit."\n  ${cli()} image identity --size avatar\n  ${cli()} image photo --size landscape --headline "Central Iowa" --image ./aerial.jpg --format jpg\n  ${cli()} image carousel --input carousel.json --size portrait\n`)
		.action((template: string | undefined, _opts, command: Command) => imageCommand(template, command.optsWithGlobals() as Options));
}
