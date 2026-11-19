import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import type { Command } from 'commander';
import { imagesToPdf } from '../deck/pdf.js';
import { cleanSlide, deckCatalog, deckDoc, sampleDeck, slideSvg, slideTypes, slotNames, type Slide } from '../deck/slides.js';
import { defaultTheme, themes } from '../image/catalog.js';
import { exportsOf, writeFile, type OutFile } from '../image/output.js';
import { groundIds } from '../image/poster.js';
import { cli } from '../lib/brand.js';
import { helpRow } from '../lib/help-row.js';
import { pickName, unknownName } from '../lib/names.js';
import { emit } from '../lib/output.js';
import { findProjectRoot } from '../lib/paths.js';

// `deck`: slides at 1920 by 1080 from a JSON file, one slide from flags, or the sample deck. A PNG per slide (and SVG
// on request) and one PDF of them all. Same input, same bytes.

type Opts = Record<string, string | boolean | undefined> & { json?: boolean };

const SLOT_FLAGS = ['title', 'subtitle', 'label', 'items', 'stat', 'progress', 'quote', 'attribution', 'url', 'image', 'scene', 'chart', 'template', 'callout', 'partner'];

async function rgbOf(svg: string, width: number): Promise<{ png: Buffer; rgb: Buffer; width: number; height: number }> {
	const { Resvg } = await import('@resvg/resvg-js');
	const img = new Resvg(svg, { fitTo: { mode: 'width', value: width }, font: { loadSystemFonts: false }, shapeRendering: 2, textRendering: 2, imageRendering: 0, logLevel: 'off' }).render();
	const px = img.pixels;
	const rgb = Buffer.alloc(img.width * img.height * 3);
	for (let i = 0, j = 0; i < px.length; i += 4, j += 3) {
		rgb[j] = px[i];
		rgb[j + 1] = px[i + 1];
		rgb[j + 2] = px[i + 2];
	}
	return { png: img.asPng(), rgb, width: img.width, height: img.height };
}

export async function deckRun(positional: string | undefined, o: Opts) {
	if (o.list) {
		const cat = deckCatalog();
		emit(o, cat, () => [...cat.slides.map((s) => helpRow(s.id, `${s.description} Slots: ${[...s.required.map((r) => `${r}*`), ...s.optional].join(', ')}. Ground: ${s.ground}.`, 12)), '', `* required. Input: ${cat.input}`, `Run \`${cli()} deck --sample --json\`.`].join('\n'));
		return;
	}
	const theme = typeof o.theme === 'string' ? o.theme : defaultTheme();
	if (!themes().some((t) => t.id === theme)) throw unknownName('theme', theme, themes().map((t) => t.id));
	const kinds = exportsOf(typeof o.format === 'string' ? o.format : undefined, ['png', 'pdf', 'svg'], 'png,pdf');
	let slides: Slide[];
	let base = process.cwd();
	let deckGround: string | undefined = typeof o.ground === 'string' ? pickName('ground', o.ground, groundIds()) : undefined;
	const type = positional ?? (typeof o.slide === 'string' ? o.slide : undefined);
	if ([o.input, type, o.sample].filter(Boolean).length > 1) throw new Error('Pass one of --input, a slide type or --sample.');
	if (typeof o.input === 'string') {
		const path = isAbsolute(o.input) ? o.input : resolve(o.input);
		let parsed: { slides?: unknown; ground?: unknown; theme?: unknown };
		try {
			parsed = JSON.parse(readFileSync(path, 'utf8'));
		} catch (err) {
			throw new Error(`Could not read ${o.input} as JSON (${(err as Error).message}).`);
		}
		if (!Array.isArray(parsed.slides) || !parsed.slides.length) throw new Error(`${o.input} needs a "slides" list.`);
		if (parsed.slides.length > 60) throw new Error('A deck is at most 60 slides.');
		if (typeof parsed.ground === 'string') deckGround ??= pickName('ground', parsed.ground, groundIds());
		slides = parsed.slides.map((s, i) => cleanSlide(s as Record<string, unknown>, i));
		base = dirname(path);
	} else if (type) {
		const t = pickName('slide type', type, slideTypes());
		const raw: Record<string, unknown> = { type: t };
		for (const k of SLOT_FLAGS) if (typeof o[k] === 'string') raw[k] = o[k];
		for (const k of Object.keys(raw)) if (k !== 'type' && !slotNames(t).includes(k)) throw new Error(`${t} has no --${k}. Slots: ${slotNames(t).join(', ')}.`);
		slides = [cleanSlide(raw, 0)];
	} else if (o.sample) slides = sampleDeck();
	else throw new Error(`Pass --input deck.json, a slide type (${slideTypes().join(', ')}) or --sample.`);
	for (const s of slides) {
		if (s.ground) s.ground = pickName('ground', s.ground, groundIds());
		else if (deckGround) s.ground = deckGround;
		if (s.image && !isAbsolute(s.image)) s.image = resolve(base, s.image);
	}
	const outDir = typeof o.out === 'string' ? resolve(o.out) : resolve(findProjectRoot(), '.ds', 'deck');
	mkdirSync(outDir, { recursive: true });
	const d = deckDoc();
	const files: OutFile[] = [];
	const pages: { rgb: Buffer; width: number; height: number }[] = [];
	for (let i = 0; i < slides.length; i++) {
		const svg = slideSvg(slides[i], theme);
		const name = `slide-${String(i + 1).padStart(2, '0')}-${slides[i].type}`;
		if (kinds.includes('svg')) files.push(writeFile(join(outDir, `${name}.svg`), svg, 'svg', d.width, d.height));
		if (kinds.includes('png') || kinds.includes('pdf')) {
			const r = await rgbOf(svg, d.width);
			if (kinds.includes('png')) files.push(writeFile(join(outDir, `${name}.png`), r.png, 'png', r.width, r.height));
			if (kinds.includes('pdf')) pages.push(r);
		}
	}
	if (kinds.includes('pdf')) files.push(writeFile(join(outDir, typeof o.name === 'string' ? `${o.name}.pdf` : 'deck.pdf'), imagesToPdf(pages, d.pdfPageWidthPt), 'pdf', d.width, d.height));
	const result = { schemaVersion: 1 as const, ok: true as const, slides: slides.map((s) => s.type), width: d.width, height: d.height, files };
	emit(o, result, () => files.map((f) => `${f.format.padEnd(4)} ${f.width}x${f.height}  ${f.sha256.slice(0, 12)}  ${f.path}`).join('\n'));
}

export function registerDeck(program: Command) {
	program
		.command('deck [slide]')
		.description('Slides at 1920x1080 (cover, section, statement, bullets, stat, quote, image, chart, poster, closing): a PNG per slide and one PDF')
		.option('--input <file>', 'deck.json: { "slides": [ { "type": "cover", "title": "..." }, ... ] }')
		.option('--sample', 'the sample deck: one slide of every type with its sample copy')
		.option('--slide <type>', 'one slide of this type, from flags')
		.option('--ground <id>', 'bone, green, brown or black for every slide (default: each type\'s)')
		.option('--theme <id>', 'a brand theme (see --list)')
		.option('--title <text>', 'the title')
		.option('--subtitle <text>', 'the line under it')
		.option('--label <text>', 'section: the label over the tick row')
		.option('--items <text>', 'bullets: points separated by |')
		.option('--stat <text>', 'stat: the big number')
		.option('--progress <share>', 'stat: fill the tick row to this share (0 to 1)')
		.option('--quote <text>', 'quote: the quote')
		.option('--attribution <text>', 'quote: who said it')
		.option('--url <text>', 'closing: the address')
		.option('--image <file>', 'image and poster: your PNG or JPEG')
		.option('--scene <id>', 'cover and image: a wireframe scene')
		.option('--chart <rows>', 'chart: "label | number" rows')
		.option('--template <id>', 'poster: which share-image layout')
		.option('--callout <text>', 'poster: the callout tag')
		.option('--partner <name>', 'poster: the partner name')
		.option('--format <kinds>', 'png, pdf, svg, or a comma-separated list', 'png,pdf')
		.option('--out <dir>', 'output directory (default: .ds/deck in the project)')
		.option('--name <base>', 'PDF file name without an extension (default deck)')
		.option('--list', 'slide types with their slots')
		.option('--json', 'JSON output listing the files written')
		.addHelpText('after', () => `\nExamples:\n  ${cli()} deck --list --json\n  ${cli()} deck --sample --out deck\n  ${cli()} deck --input deck.json --out deck --json\n  ${cli()} deck cover --title "Physical world context for AI agents" --scene datacenter\n  ${cli()} deck bullets --title "What your agent can ask" --items "Who owns it? | Is it in a flood zone?"\n`)
		.action((slide: string | undefined, _o, command: Command) => deckRun(slide, command.optsWithGlobals() as Opts));
}
