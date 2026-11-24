import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import type { Command } from 'commander';
import { imagesToPdf } from '../deck/pdf.js';
import { checkInput, documentSample, drawDocument, PAGE_SIZES, type PageSize } from '../document/document.js';
import { defaultTheme } from '../image/catalog.js';
import { rasterRgb } from '../image/encode.js';
import { exportsOf, outTarget, writeFile, type OutFile } from '../image/output.js';
import { cli } from '../lib/brand.js';
import { emit } from '../lib/output.js';
import { findProjectRoot } from '../lib/paths.js';
import { safeName } from './image.js';

// `document`: a one-pager, a case study or a report (with a cover) as a PDF of A4 or US Letter pages, and a PNG of each.

type Opts = { input?: string; sample?: boolean; size?: string; format?: string; out?: string; name?: string; theme?: string; list?: boolean; json?: boolean };

export async function documentRun(o: Opts) {
	if (o.list) {
		const data = { schemaVersion: 1, sizes: PAGE_SIZES, blocks: ['heading', 'text', 'stats ("138 fields | 1 call")', 'quote (+ attribution)', 'list ("a | b")', 'image (+ caption)'], input: '{ "size": "a4", "cover": true, "eyebrow"?, "title", "subtitle"?, "date"?, "scene"?, "url"?, "blocks": [ ... ] }', sample: documentSample() };
		emit(o, data, () => [`Sizes: ${Object.entries(PAGE_SIZES).map(([id, s]) => `${id} (${s.label})`).join(', ')}`, `Blocks: ${data.blocks.join(', ')}`, `Input: ${data.input}`, `Run \`${cli()} document --sample --out docs\`.`].join('\n'));
		return;
	}
	if (!o.input && !o.sample) throw new Error(`Pass --input document.json or --sample. ${cli()} document --list shows the format.`);
	let raw: unknown = documentSample();
	let base = process.cwd();
	if (o.input) {
		try {
			raw = JSON.parse(readFileSync(resolve(o.input), 'utf8'));
		} catch (error) {
			throw new Error(`Could not read ${o.input} as JSON (${(error as Error).message}).`);
		}
		base = dirname(resolve(o.input));
	}
	const input = checkInput(raw);
	if (o.size) {
		if (!(o.size in PAGE_SIZES)) throw new Error(`--size is ${Object.keys(PAGE_SIZES).join(' or ')}.`);
		input.size = o.size as PageSize;
	}
	for (const b of input.blocks) if ('image' in b && !isAbsolute(b.image)) b.image = resolve(base, b.image);
	const pages = drawDocument(input, o.theme ?? defaultTheme());
	const to = outTarget(o.out, resolve(findProjectRoot(), '.ds', 'documents'), ['pdf', 'png', 'svg']);
	const kinds = exportsOf(o.format, ['pdf', 'png', 'svg'], to.kind ?? 'pdf,png');
	mkdirSync(to.dir, { recursive: true });
	const size = PAGE_SIZES[input.size ?? 'a4'];
	const name = to.name ?? safeName(o.name ?? 'document');
	const files: OutFile[] = [];
	const rgb: { rgb: Buffer; width: number; height: number }[] = [];
	for (const [i, p] of pages.entries()) {
		const page = `${name}-${String(i + 1).padStart(2, '0')}`;
		if (kinds.includes('svg')) files.push(writeFile(join(to.dir, `${page}.svg`), p.svg, 'svg', size.width, size.height));
		if (kinds.includes('png') || kinds.includes('pdf')) {
			const r = await rasterRgb(p.svg, size.width);
			if (kinds.includes('png')) files.push(writeFile(join(to.dir, `${page}.png`), r.png, 'png', r.width, r.height));
			rgb.push(r);
		}
	}
	if (kinds.includes('pdf')) files.push(writeFile(join(to.dir, `${name}.pdf`), imagesToPdf(rgb, size.pt[0]), 'pdf', size.width, size.height));
	const words = pages.flatMap((p) => p.words);
	const lost = words.filter((w) => w.asked.replace(/\s+/g, ' ').trim() !== w.drawn.replace(/\s+/g, ' ').trim());
	if (lost.length) throw new Error(`Words were lost: ${lost.map((w) => w.asked.slice(0, 30)).join('; ')}.`);
	const result = { schemaVersion: 1 as const, ok: true as const, pages: pages.length, size: input.size ?? 'a4', files };
	emit(o, result, () => files.map((f) => `${f.format.padEnd(4)} ${f.width}x${f.height}  ${f.path}`).join('\n'));
}

export function registerDocument(program: Command) {
	program
		.command('document')
		.description('A one-pager, case study or report (with a cover) as a PDF of A4 or US Letter pages; blocks flow from page to page and no word is cut')
		.option('--list', 'sizes, blocks and the input format')
		.option('--input <file>', 'document.json')
		.option('--sample', 'a sample case study (replace every word)')
		.option('--size <id>', 'a4 or letter')
		.option('--theme <id>', 'a brand theme')
		.option('--format <kinds>', 'pdf, png, svg or a list (default pdf,png)')
		.option('--out <path>', 'output directory (default: .ds/documents in the project), or a .pdf file')
		.option('--name <base>', 'file name without an extension')
		.option('--json', 'JSON output listing the files written')
		.action((_o, command: Command) => documentRun(command.optsWithGlobals() as Opts));
}
