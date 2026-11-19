import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cleanContent, defaultTheme, themes, type ImageContent } from '../image/catalog.js';
import { cli } from '../lib/brand.js';
import { emit } from '../lib/output.js';
import { findProjectRoot } from '../lib/paths.js';
import { cleanVideoContent, isVideoFormat, isVideoTemplate, videoCatalog, videoFields, type VideoExport } from '../video/catalog.js';
import { renderVideo } from '../video/render.js';
import { VIDEO_FORMATS, VIDEO_TEMPLATES } from '../video/catalog.js';
import { pickName, unknownName } from '../lib/names.js';
import { groundIds, posterIds } from '../image/poster.js';

type Options = {
	list?: boolean;
	format?: string;
	template?: string;
	theme?: string;
	title?: string;
	subtitle?: string;
	kicker?: string;
	footer?: string;
	poster?: string;
	ground?: string;
	callout?: string;
	chart?: string;
	partner?: string;
	scene?: string;
	image?: string;
	content?: string;
	out?: string;
	name?: string;
	export?: string;
	json?: boolean;
};

const KINDS = new Set<VideoExport>(['apng', 'mp4', 'webm', 'png', 'svg', 'still']);

function exportsOf(value: string | undefined): VideoExport[] {
	const parts = (value ?? 'apng').split(',').map((part) => part.trim()).filter(Boolean);
	if (!parts.length || parts.some((part) => !KINDS.has(part as VideoExport))) throw new Error('--export is apng, mp4, webm, png, svg, still, or a comma-separated list of those.');
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
	if (!opts.format) throw new Error(`--format is required: ${formats.join(', ')}.`);
	if (!isVideoFormat(opts.format)) throw unknownName('format', opts.format, formats);
	if (!opts.template) throw new Error(`--template is required: ${templates.join(', ')}.`);
	if (!isVideoTemplate(opts.template)) throw unknownName('template', opts.template, templates);
	const theme = opts.theme ?? defaultTheme();
	if (!themes().some((item) => item.id === theme)) throw new Error(`Unknown theme "${theme}". Themes: ${themes().map((item) => item.id).join(', ')}.`);
	const fields = videoFields(opts.template);
	const picked: ImageContent = {};
	for (const key of ['title', 'subtitle', 'kicker', 'footer', 'callout', 'chart', 'partner', 'scene', 'image'] as const) if (opts[key] && (fields as string[]).includes(key)) picked[key] = key === 'image' ? resolve(opts[key]!) : opts[key];
	if (opts.template === 'poster' && opts.poster) (picked as Record<string, string>).poster = pickName('poster', opts.poster, posterIds());
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
	if (opts.ground) {
		if (opts.template !== 'poster') throw new Error('--ground is for the poster template; the sheet clips draw on bone.');
		content.ground = pickName('ground', opts.ground, groundIds());
	}
	const format = opts.format;
	const template = opts.template;
	const result = await renderVideo({
		format,
		template,
		theme,
		content,
		exports: exportsOf(opts.export),
		outDir: opts.out ? resolve(opts.out) : resolve(findProjectRoot(), '.ds', 'videos'),
		name: safeName(opts.name ?? `${format}-${template}`),
	});
	emit(opts, result, () => result.files.map((file) => `${file.format.padEnd(5)} ${file.width}x${file.height}  ${file.sha256.slice(0, 12)}  ${file.path}`).join('\n'));
}
