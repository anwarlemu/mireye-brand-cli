import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import type { Command } from 'commander';
import { imagesToPdf } from '../deck/pdf.js';
import { cleanSlide, deckCatalog, deckDoc, sampleDeck, slideDocument, slideTypes, slotNames, type Slide } from '../deck/slides.js';
import { encode, rasterRgb } from '../image/encode.js';
import { groundAndTheme, safeName } from './image.js';
import type { ExportKind } from '../image/catalog.js';
import { exportsOf, outTarget, seedOf, writeFile, type OutFile } from '../image/output.js';
import { groundIds } from '../image/poster.js';
import { cli } from '../lib/brand.js';
import { helpRow } from '../lib/help-row.js';
import { pickName } from '../lib/names.js';
import { emit } from '../lib/output.js';
import { findProjectRoot } from '../lib/paths.js';

// `deck`: slides at 1920 by 1080 from a JSON file, one slide from flags, or the sample deck. A PNG per slide (and SVG
// on request) and one PDF of them all. Same input, same bytes.

type Opts = Record<string, string | boolean | undefined> & { json?: boolean };

const SLOT_FLAGS = ['title', 'subtitle', 'label', 'items', 'stat', 'progress', 'quote', 'attribution', 'url', 'image', 'scene', 'chart', 'template', 'callout', 'partner', 'labels', 'question', 'suggestions', 'place', 'images', 'date', 'speaker', 'price', 'steps', 'left', 'right', 'before', 'after'];
const SHARED: Record<string, string> = { headline: 'title', body: 'subtitle', badge: 'label' };

export async function deckRun(positional: string | undefined, o: Opts) {
	if (o.list) {
		const cat = deckCatalog();
		emit(o, cat, () => [...cat.slides.map((s) => helpRow(s.id, `${s.description} Slots: ${[...s.required.map((r) => `${r}*`), ...s.optional].join(', ')}. Ground: ${s.ground}.`, 12)), '', `* required. Input: ${cat.input}`, `Run \`${cli()} deck --sample --json\`.`].join('\n'));
		return;
	}
	const look = groundAndTheme({ theme: typeof o.theme === 'string' ? o.theme : undefined, ground: typeof o.ground === 'string' ? o.ground : undefined });
	let theme = look.theme;
	const to = outTarget(typeof o.out === 'string' ? o.out : undefined, resolve(findProjectRoot(), '.ds', 'deck'), ['png', 'pdf', 'svg', 'jpg', 'webp']);
	const kinds = exportsOf(typeof o.format === 'string' ? o.format : undefined, ['png', 'pdf', 'svg', 'jpg', 'webp'], to.kind ?? 'png,pdf') as ExportKind[];
	const seed = seedOf(o.seed as string | undefined);
	let slides: Slide[];
	let base = process.cwd();
	let deckGround = look.ground;
	const type = positional ?? (typeof o.slide === 'string' ? o.slide : undefined);
	if (o.input && (type || o.sample)) throw new Error('Pass one of --input, a slide type or --sample.');
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
		if (typeof parsed.theme === 'string' && typeof o.theme !== 'string') {
			const own = groundAndTheme({ theme: parsed.theme });
			theme = own.theme;
			deckGround ??= own.ground;
		}
		if (typeof parsed.ground === 'string') deckGround ??= pickName('ground', parsed.ground, groundIds());
		slides = parsed.slides.map((s, i) => cleanSlide(s as Record<string, unknown>, i));
		base = dirname(path);
	} else if (type) {
		const t = pickName('slide type', type, slideTypes());
		const raw: Record<string, unknown> = { type: t, ...(o.sample ? deckDoc().slides[t].sample : {}) };
		for (const [flag, slot] of Object.entries(SHARED)) if (typeof o[flag] === 'string') raw[slot] = o[flag];
		for (const k of SLOT_FLAGS) if (typeof o[k] === 'string') raw[k] = o[k];
		for (const k of Object.keys(raw)) if (k !== 'type' && !slotNames(t).includes(k)) throw new Error(`${t} has no --${Object.keys(SHARED).find((f) => SHARED[f] === k && o[f]) ?? k}. Slots: ${slotNames(t).join(', ')}.`);
		slides = [cleanSlide(raw, 0)];
	} else if (o.sample) slides = sampleDeck();
	else throw new Error(`Pass --input deck.json, a slide type (${slideTypes().join(', ')}) or --sample.`);
	for (const s of slides) {
		if (s.ground) s.ground = pickName('ground', s.ground, groundIds());
		else if (deckGround) s.ground = deckGround;
		if (s.image && !isAbsolute(s.image)) s.image = resolve(base, s.image);
		for (const key of ['before', 'after'] as const) if (s[key] && !isAbsolute(s[key]!)) s[key] = resolve(base, s[key]!);
		if (s.images) s.images = s.images.split('|').map((x) => x.trim()).filter(Boolean).map((x) => (isAbsolute(x) ? x : resolve(base, x))).join(' | ');
	}
	const d = deckDoc();
	// Every slide is drawn before the first file is written, so one that does not fit never leaves half a deck.
	const drawn = slides.map((slide, i) => {
		try {
			return slideDocument(slide, theme, {}, Boolean(o.sample), seed).svg;
		} catch (error) {
			throw new Error(`Slide ${i + 1}: ${(error as Error).message}`);
		}
	});
	if (to.name && slides.length > 1 && kinds.some((kind) => kind !== 'pdf')) throw new Error('--out names one file, and the deck has several slides. Name a folder, or a .pdf file.');
	mkdirSync(to.dir, { recursive: true });
	const files: OutFile[] = [];
	const pages: { rgb: Buffer; width: number; height: number }[] = [];
	const base2 = typeof o.name === 'string' ? safeName(o.name) : undefined;
	for (let i = 0; i < slides.length; i++) {
		const name = to.name ?? (base2 && slides.length === 1 ? base2 : `slide-${String(i + 1).padStart(2, '0')}-${slides[i].type}`);
		const each = kinds.filter((kind) => kind !== 'pdf');
		const made = await encode(drawn[i], d.width, each);
		for (const kind of each) files.push(writeFile(join(to.dir, `${name}.${kind}`), made[kind]!, kind, d.width, d.height));
		if (kinds.includes('pdf')) pages.push(await rasterRgb(drawn[i], d.width));
	}
	if (kinds.includes('pdf')) files.push(writeFile(join(to.dir, `${to.name ?? base2 ?? 'deck'}.pdf`), imagesToPdf(pages, d.pdfPageWidthPt), 'pdf', d.width, d.height));
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
		.option('--theme <id>', 'a brand theme (api, enterprise) or a ground')
		.option('--headline <text>', 'the headline')
		.option('--title <text>', 'same as --headline')
		.option('--body <text>', 'the line under it')
		.option('--subtitle <text>', 'same as --body')
		.option('--badge <text>', 'section: the label by the tick row')
		.option('--label <text>', 'same as --badge')
		.option('--seed <n>', 'another arrangement on slides with contours or parcels')
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
		.option('--labels <text>', 'poster: tags on the parcels, split by |')
		.option('--question <text>', 'poster: the ask panel question')
		.option('--suggestions <text>', 'poster: the ask panel suggestions, split by |')
		.option('--place <text>', 'poster: the ask panel place')
		.option('--format <kinds>', 'png, pdf, svg, jpg, webp, or a list (default png,pdf)')
		.option('--out <path>', 'output directory (default: .ds/deck in the project), or a .pdf file')
		.option('--name <base>', 'file name without an extension (default deck)')
		.option('--list', 'slide types with their slots')
		.option('--json', 'JSON output listing the files written')
		.addHelpText('after', () => `\nExamples:\n  ${cli()} deck --list --json\n  ${cli()} deck --sample --out deck\n  ${cli()} deck --input deck.json --out deck --json\n  ${cli()} deck cover --title "Physical world context for AI agents" --scene datacenter\n  ${cli()} deck bullets --title "What your agent can ask" --items "Who owns it? | Is it in a flood zone?"\n`)
		.action((slide: string | undefined, _o, command: Command) => deckRun(slide, command.optsWithGlobals() as Opts));
}
