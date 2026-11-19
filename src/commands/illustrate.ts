import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Command } from 'commander';
import { STYLES, WIRE_GROUNDS, buildIllustration, defaultSubject, styleOf, subjectsFor, type Style } from '../illustrate/build.js';
import { ISO_PRESETS } from '../illustrate/iso.js';
import { wireDoc } from '../illustrate/wire.js';
import { defaultTheme, themes } from '../image/catalog.js';
import { exportsOf, parseSize, writeSvgPng } from '../image/output.js';
import { groundIds } from '../image/poster.js';
import { cli } from '../lib/brand.js';
import { helpRow } from '../lib/help-row.js';
import { pickName, unknownName } from '../lib/names.js';
import { emit } from '../lib/output.js';
import { findProjectRoot } from '../lib/paths.js';
import { safeName } from './image.js';

type Options = {
	style?: string;
	ground?: string;
	theme?: string;
	image?: string;
	spec?: string;
	cols?: string;
	rows?: string;
	count?: string;
	highlight?: boolean;
	size?: string;
	tile?: boolean;
	fill?: string;
	transparent?: boolean;
	levels?: string;
	detail?: string;
	smooth?: string;
	invert?: boolean;
	width?: string;
	format?: string;
	scale?: string;
	out?: string;
	name?: string;
	list?: boolean;
	json?: boolean;
};

/** The skill's tile: 1536 by 1024 with the drawing at 72 percent (section 6, Placing illustrations). */
const TILE = { width: 1536, height: 1024, fill: 0.72 };

export function illustrateCatalog() {
	const wire = wireDoc();
	return {
		schemaVersion: 1 as const,
		styles: [
			{ id: 'wire', description: 'Hidden-line isometric wireframes from the brand illustration skill: filled line bands, x-ray lines, one spacing scale. SVG paths only, one per tone.', subjects: Object.entries(wire.scenes).map(([id, s]) => ({ id, label: s.label, use: s.use })), grounds: WIRE_GROUNDS, default: { subject: 'datacenter', ground: 'green' } },
			{ id: 'iso', description: 'Quick isometric line drawings from the share-image tool: faces in the ground, one parcel picked out in the window color. Presets write a scene text you can edit and pass back with --spec.', subjects: ISO_PRESETS.map((id) => ({ id })), grounds: groundIds(), default: { subject: 'residential', ground: 'bone' } },
			{ id: 'contours', description: 'The website topographic contour fields (dense and sparse), as strokes in the ground grid color.', subjects: [{ id: 'dense' }, { id: 'sparse' }], grounds: groundIds(), default: { subject: 'dense', ground: 'bone' } },
			{ id: 'trace', description: 'Any picture (--image) traced as contours: brightness read as height, smoothed and cut into isolines in the ground ink.', subjects: [], grounds: groundIds(), default: { ground: 'bone' }, input: 'image' },
		],
		themes: themes().map(({ id, label, default: isDefault }) => ({ id, label, default: isDefault })),
		formats: ['svg', 'png'],
		tile: TILE,
		rules: 'brand/illustration.md',
		defaults: { out: '.ds/illustrations', format: ['svg', 'png'], scale: 1 },
	};
}

const int = (v: string | undefined, flag: string, min: number, max: number) => {
	if (v === undefined) return undefined;
	const n = Number(v);
	if (!Number.isFinite(n) || n < min || n > max) throw new Error(`${flag} is a number from ${min} to ${max}.`);
	return n;
};

export async function illustrateCommand(subjectArg: string | undefined, opts: Options) {
	if (opts.list) {
		const data = illustrateCatalog();
		emit(opts, data, () =>
			[
				...data.styles.flatMap((s) => [helpRow(s.id, s.description, 12), ...s.subjects.map((sub) => helpRow(sub.id, 'label' in sub ? `${sub.label}. ${sub.use}` : '', 18, '      ')), `      grounds: ${s.grounds.join(', ')}`, '']),
				`Tile: ${TILE.width}x${TILE.height} at ${TILE.fill * 100}% (--tile). Rules: ${data.rules}.`,
				`Run \`${cli()} illustrate datacenter --ground green --json\`.`,
			].join('\n'),
		);
		return;
	}
	let style: Style | undefined = opts.style ? (pickName('style', opts.style, [...STYLES]) as Style) : undefined;
	let subject = subjectArg;
	if (!style && subject) {
		style = styleOf(subject);
		if (!style) throw unknownName('subject', subject, [...new Set(STYLES.flatMap((s) => subjectsFor(s)))]);
	}
	if (!style) style = opts.image ? 'trace' : 'wire';
	if (style === 'trace' && subject) throw new Error('trace takes a picture, not a subject: pass --image.');
	if (subject && style !== 'trace') subject = pickName(`${style} subject`, subject, subjectsFor(style));
	if (opts.spec && style !== 'iso') throw new Error('--spec is an isometric scene text: use it with --style iso.');
	subject ??= defaultSubject(style);
	const groundDefault = style === 'wire' ? 'green' : 'bone';
	const ground = pickName('ground', opts.ground ?? groundDefault, style === 'wire' ? WIRE_GROUNDS : groundIds());
	const theme = opts.theme ?? defaultTheme();
	if (!themes().some((t) => t.id === theme)) throw unknownName('theme', theme, themes().map((t) => t.id));
	const fill = int(opts.fill, '--fill', 10, 100);
	const frame = opts.tile ? TILE : opts.size ? { ...parseSize(opts.size), fill: (fill ?? 78) / 100 } : undefined;
	const result = await buildIllustration({
		style,
		subject,
		ground,
		theme,
		image: opts.image ? resolve(opts.image) : undefined,
		spec: opts.spec ? (opts.spec === '-' ? readFileSync(0, 'utf8') : readFileSync(resolve(opts.spec), 'utf8')) : undefined,
		cols: int(opts.cols, '--cols', 4, 40),
		rows: int(opts.rows, '--rows', 3, 40),
		count: int(opts.count, '--count', 1, 24),
		highlight: opts.highlight,
		frame,
		background: !opts.transparent,
		levels: int(opts.levels, '--levels', 2, 40),
		detail: int(opts.detail, '--detail', 16, 600),
		smooth: int(opts.smooth, '--smooth', 0, 12),
		invert: opts.invert,
		width: int(opts.width, '--width', 160, 8000),
	});
	const kinds = exportsOf(opts.format, ['svg', 'png'], 'svg,png');
	const scale = int(opts.scale, '--scale', 1, 4) ?? 1;
	const name = safeName(opts.name ?? `${result.style}-${result.subject}-${result.ground}`);
	const files = await writeSvgPng(opts.out ? resolve(opts.out) : resolve(findProjectRoot(), '.ds', 'illustrations'), name, result.svg, result.width, result.height, kinds, scale);
	const out = { schemaVersion: 1 as const, ok: true as const, style: result.style, subject: result.subject, ground: result.ground, width: result.width, height: result.height, parts: result.parts, files };
	emit(opts, out, () => files.map((f) => `${f.format.padEnd(4)} ${f.width}x${f.height}  ${f.sha256.slice(0, 12)}  ${f.path}`).join('\n'));
}

export function registerIllustrate(program: Command) {
	program
		.command('illustrate [subject]')
		.description('Draw a brand illustration (SVG of real vector shapes, and PNG): wireframe scenes, isometric scenes, contour fields, or your picture as contours')
		.option('--list', 'list styles, subjects and grounds')
		.option('--style <id>', 'wire (default), iso, contours or trace')
		.option('--ground <id>', 'wire: green (default), brown or bone; others: bone (default), green, brown or black')
		.option('--theme <id>', 'a brand theme (see --list)')
		.option('--image <path>', 'trace: your PNG or JPEG')
		.option('--spec <file>', 'iso: a scene text file (or - for stdin) instead of a preset')
		.option('--cols <n>', 'iso: plate width in cells (default 12)')
		.option('--rows <n>', 'iso: plate depth in cells (default 8)')
		.option('--count <n>', 'iso: how many houses, rows, racks or tools (default 4)')
		.option('--no-highlight', 'iso: no parcel picked out')
		.option('--size <WxH>', 'place the drawing in a frame of this size (at --fill percent, default 78)')
		.option('--fill <percent>', 'how much of the frame the drawing fills')
		.option('--tile', 'the skill tile: 1536x1024 with the drawing at 72%')
		.option('--width <px>', 'iso, contours and trace: drawing width (default 1200, contours 1920)')
		.option('--levels <n>', 'trace: contour levels (default 12)')
		.option('--detail <px>', 'trace: sampling width of the picture (default 220)')
		.option('--smooth <n>', 'trace: blur radius before tracing (default 4)')
		.option('--invert', 'trace: dark areas are high ground')
		.option('--transparent', 'no ground rectangle (to place the drawing on an existing ground)')
		.option('--format <kinds>', 'svg, png, or svg,png', 'svg,png')
		.option('--scale <n>', 'PNG pixel density, 1 to 4 (default 1)')
		.option('--out <dir>', 'output directory (default: .ds/illustrations in the project)')
		.option('--name <base>', 'file name without an extension')
		.option('--json', 'JSON output listing the files written')
		.addHelpText('after', () => `\nExamples:\n  ${cli()} illustrate --list --json\n  ${cli()} illustrate datacenter --ground green --json\n  ${cli()} illustrate apicore --ground bone --tile\n  ${cli()} illustrate --style iso residential --count 5 --ground bone\n  ${cli()} illustrate --style contours sparse --size 1920x1080 --ground green\n  ${cli()} illustrate --image ./site.jpg --levels 16 --ground bone\n`)
		.action((subject: string | undefined, _opts, command) => illustrateCommand(subject, command.optsWithGlobals()));
}
