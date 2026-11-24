import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cleanContent, type ContentKey, type ImageContent } from '../image/catalog.js';
import { outTarget, seedOf } from '../image/output.js';
import { groundAndTheme } from './image.js';
import { cli } from '../lib/brand.js';
import { emit } from '../lib/output.js';
import { findProjectRoot } from '../lib/paths.js';
import { cleanVideoContent, isVideoFormat, isVideoTemplate, videoCatalog, videoFields, type VideoExport } from '../video/catalog.js';
import { renderVideo } from '../video/render.js';
import { VIDEO_FORMATS, VIDEO_TEMPLATES } from '../video/catalog.js';
import { pickName, unknownName } from '../lib/names.js';
import { posterIds } from '../image/poster.js';
import { FLAG } from '../image/catalog.js';

type Options = Partial<Record<ContentKey, string>> & {
	headline?: string;
	body?: string;
	badge?: string;
	size?: string;
	seed?: string;
	list?: boolean;
	format?: string;
	template?: string;
	theme?: string;
	poster?: string;
	ground?: string;
	content?: string;
	out?: string;
	name?: string;
	export?: string;
	json?: boolean;
};

const KINDS = new Set<VideoExport>(['apng', 'mp4', 'webm', 'gif', 'png', 'svg', 'still']);

/** The shared size names a clip answers to. */
const SIZES: Record<string, string> = { story: 'vertical', reel: 'vertical', portrait: 'vertical', youtube: 'landscape', 'x': 'landscape', '1:1': 'square', '9:16': 'vertical', '16:9': 'landscape' };

function exportsOf(value: string | undefined, fallback = 'apng'): VideoExport[] {
	const parts = (value ?? fallback).split(',').map((part) => part.trim()).filter(Boolean);
	if (!parts.length || parts.some((part) => !KINDS.has(part as VideoExport))) throw new Error('--export is apng, mp4, webm, gif, png, svg, still, or a comma-separated list of those.');
	return [...new Set(parts)] as VideoExport[];
}

function safeName(name: string): string {
	const clean = name.trim().toLowerCase().replace(/[^a-z0-9-_]+/g, '-').replace(/^-+|-+$/g, '');
	if (!clean) throw new Error('--name needs letters or numbers.');
	return clean;
}

export async function videoCommand(opts: Options) {
	if (opts.list) {
		const data = videoCatalog();
		emit(opts, data, () => {
			const formats = data.formats.map((format) => `  ${format.id.padEnd(12)} ${String(format.width).padStart(4)} x ${String(format.height).padEnd(4)}  ${format.ratio}  ${format.use}`);
			const templates = data.templates.map((template) => `  ${template.id.padEnd(14)} ${template.description}`);
			return [`Renderer: ${data.renderer}`, `${data.timing.frameCount} frames, ${data.timing.fps} fps, ${data.timing.durationMs}ms, plays ${data.timing.plays}.`, '', 'Formats', ...formats, '', 'Templates', ...templates, '', `Themes: ${data.themes.map((theme) => theme.id).join(', ')}`, `Run \`${cli()} video --format square --template social --title "..." --json\`.`].join('\n');
		});
		return;
	}
	const formats = Object.keys(VIDEO_FORMATS);
	const templates = Object.keys(VIDEO_TEMPLATES);
	// --format names files (apng, mp4, webm, ...); it also still names a size, as it did first.
	const isKinds = opts.format !== undefined && opts.format.split(',').every((part) => KINDS.has(part.trim() as VideoExport));
	const asked = (opts.size ?? (isKinds ? undefined : opts.format))?.trim().toLowerCase();
	const sizeName = asked ? (SIZES[asked] ?? asked) : undefined;
	if (!sizeName) throw new Error(`--size is required: ${formats.join(', ')}.`);
	if (!isVideoFormat(sizeName)) throw unknownName('size', sizeName, formats);
	if (!opts.template) throw new Error(`--template is required: ${templates.join(', ')}.`);
	if (!isVideoTemplate(opts.template)) throw unknownName('template', opts.template, templates);
	const isPoster = opts.template === 'poster';
	const look = groundAndTheme({ theme: opts.theme, ground: opts.ground });
	if (look.ground && !isPoster) throw new Error('A ground is for the poster template; the sheet clips draw on bone.');
	const fields = videoFields(opts.template);
	const given: Partial<Record<ContentKey, string>> = {};
	for (const key of ['title', 'subtitle', 'kicker', 'quote', 'attribution', 'footer', 'callout', 'chart', 'partner', 'scene', 'image', 'labels', 'question', 'suggestions', 'place', 'stat', 'date', 'speaker', 'price', 'items', 'steps', 'left', 'right', 'before', 'after', 'images'] as ContentKey[]) if (opts[key]) given[key] = opts[key];
	if (opts.headline) given.title = opts.headline;
	if (opts.body) given.subtitle = opts.body;
	if (opts.badge) given.kicker = opts.badge;
	const extra = (Object.keys(given) as ContentKey[]).filter((key) => !(fields as string[]).includes(key));
	if (extra.length) throw new Error(`${opts.template} draws no ${extra.map((key) => FLAG[key]).join(' or ')}. It draws ${fields.map((key) => FLAG[key] ?? key).join(', ')}.`);
	if (opts.poster && !isPoster) throw new Error('--poster goes with the poster template.');
	const picked: ImageContent = { ...given, ...(given.image ? { image: resolve(given.image) } : {}), ...(given.before ? { before: resolve(given.before) } : {}), ...(given.after ? { after: resolve(given.after) } : {}), ...(given.images ? { images: given.images.split('|').map((x) => resolve(x.trim())).join(' | ') } : {}) };
	if (isPoster && opts.poster) (picked as Record<string, string>).poster = pickName('poster', opts.poster, posterIds());
	let fileContent: ImageContent = {};
	if (opts.content) {
		const raw = opts.content === '-' ? readFileSync(0, 'utf8') : readFileSync(resolve(opts.content), 'utf8');
		let parsed: unknown;
		try {
			parsed = JSON.parse(raw);
		} catch {
			throw new Error('--content must be a JSON object.');
		}
		fileContent = cleanContent(parsed, fields);
	}
	const { poster: chosen, ...rest } = picked as Record<string, string>;
	const content = cleanVideoContent(opts.template, { ...fileContent, ...cleanContent(rest, fields.filter((key) => (key as string) !== 'poster')), ...(chosen ? { poster: chosen } : {}) }) as ImageContent & { poster?: string; ground?: string };
	if (look.ground) content.ground = look.ground;
	const format = sizeName;
	const template = opts.template;
	const theme = look.theme;
	const to = outTarget(opts.out, resolve(findProjectRoot(), '.ds', 'videos'), ['apng', 'mp4', 'webm', 'png', 'svg']);
	const exports = exportsOf(opts.export ?? (isKinds ? opts.format : undefined), to.kind === 'png' || to.kind === 'svg' ? 'still' : to.kind);
	const result = await renderVideo({
		format,
		template,
		theme,
		content,
		exports,
		seed: seedOf(opts.seed),
		outDir: to.dir,
		name: safeName(to.name ?? opts.name ?? `${format}-${template}`),
	});
	emit(opts, result, () => result.files.map((file) => `${file.format.padEnd(5)} ${file.width}x${file.height}  ${file.sha256.slice(0, 12)}  ${file.path}`).join('\n'));
}
