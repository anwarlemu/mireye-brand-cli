import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cleanContent, defaultTheme, themes, type ImageContent } from '../image/catalog.js';
import { cli } from '../lib/brand.js';
import { emit } from '../lib/output.js';
import { findProjectRoot } from '../lib/paths.js';
import { cleanVideoContent, isVideoFormat, isVideoTemplate, videoCatalog, videoFields, type VideoExport } from '../video/catalog.js';
import { renderVideo } from '../video/render.js';

type Options = {
	list?: boolean;
	format?: string;
	template?: string;
	theme?: string;
	title?: string;
	subtitle?: string;
	kicker?: string;
	footer?: string;
	content?: string;
	out?: string;
	name?: string;
	export?: string;
	json?: boolean;
};

const KINDS = new Set<VideoExport>(['apng', 'png', 'svg']);

function exportsOf(value: string | undefined): VideoExport[] {
	const parts = (value ?? 'apng').split(',').map((part) => part.trim()).filter(Boolean);
	if (!parts.length || parts.some((part) => !KINDS.has(part as VideoExport))) throw new Error('--export is apng, png, svg, or a comma-separated list of those.');
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
	if (!opts.format) throw new Error('--format is required: square, vertical, landscape.');
	if (!isVideoFormat(opts.format)) throw new Error(`Unknown format "${opts.format}". Formats: square, vertical, landscape.`);
	if (!opts.template) throw new Error('--template is required: social, announcement, product.');
	if (!isVideoTemplate(opts.template)) throw new Error(`Unknown template "${opts.template}". Templates: social, announcement, product.`);
	const theme = opts.theme ?? defaultTheme();
	if (!themes().some((item) => item.id === theme)) throw new Error(`Unknown theme "${theme}". Themes: ${themes().map((item) => item.id).join(', ')}.`);
	const fields = videoFields(opts.template);
	const picked: ImageContent = {};
	for (const key of ['title', 'subtitle', 'kicker', 'footer'] as const) if (opts[key]) picked[key] = opts[key];
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
	const content = cleanVideoContent(opts.template, { ...fileContent, ...cleanContent(picked, fields) });
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
