import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { Command } from 'commander';
import { merchCatalog, merchItems, merchSvg, PX_PER_IN } from '../merch/merch.js';
import { defaultTheme, themes } from '../image/catalog.js';
import { exportsOf, writeFile, type OutFile } from '../image/output.js';
import { rasterize } from '../image/render.js';
import { cli } from '../lib/brand.js';
import { helpRow } from '../lib/help-row.js';
import { pickName, unknownName } from '../lib/names.js';
import { emit } from '../lib/output.js';
import { findProjectRoot } from '../lib/paths.js';

type Opts = { list?: boolean; variant?: string; headline?: string; url?: string; theme?: string; dpi?: string; format?: string; guides?: boolean; all?: boolean; out?: string; json?: boolean };

export async function merchRun(itemArg: string | undefined, o: Opts) {
	if (o.list) {
		const cat = merchCatalog();
		emit(o, cat, () => [...cat.items.map((i) => helpRow(i.id, `${i.name}, ${i.trim.width} x ${i.trim.height} in, bleed ${i.bleed} in, safe ${i.safe} in, ${i.method}${i.dieCut ? ', die cut' : ''}. Variants: ${i.variants.join(', ')}.`, 14)), '', ...cat.variants.map((v) => helpRow(v.id, v.note, 14)), '', cat.note].join('\n'));
		return;
	}
	const ids = merchItems().map((i) => i.id);
	const items = o.all ? merchItems() : itemArg ? [merchItems().find((i) => i.id === pickName('item', itemArg, ids))!] : [];
	if (!items.length) throw new Error(`Name an item (${ids.join(', ')}) or pass --all.`);
	const theme = o.theme ?? defaultTheme();
	if (!themes().some((t) => t.id === theme)) throw unknownName('theme', theme, themes().map((t) => t.id));
	const dpi = o.dpi === undefined ? PX_PER_IN : Number(o.dpi);
	if (!Number.isFinite(dpi) || dpi < 72 || dpi > 300) throw new Error('--dpi is 72 to 300.');
	const kinds = exportsOf(o.format, ['svg', 'png'], 'svg,png');
	const outDir = o.out ? resolve(o.out) : resolve(findProjectRoot(), '.ds', 'merch');
	mkdirSync(outDir, { recursive: true });
	const files: OutFile[] = [];
	const made: { item: string; variant: string; trim: string; bleed: number; safe: number }[] = [];
	for (const item of items) {
		const variants = o.variant ? [pickName('variant', o.variant, item.variants)] : o.all ? item.variants : [item.variants[0]];
		for (const variant of variants) {
			const slots: Record<string, string> = {};
			if (o.headline) slots.headline = o.headline;
			if (o.url) slots.url = o.url;
			const doc = merchSvg({ item, variant, slots, theme, guides: o.guides });
			const name = `${item.id}-${variant}`;
			if (kinds.includes('svg')) files.push(writeFile(join(outDir, `${name}.svg`), doc.svg, 'svg', doc.widthPx, doc.heightPx));
			if (kinds.includes('png')) {
				const w = Math.round((doc.widthPx * dpi) / PX_PER_IN);
				files.push(writeFile(join(outDir, `${name}.png`), await rasterize(doc.printSvg, w), 'png', w, Math.round((doc.heightPx * dpi) / PX_PER_IN)));
			}
			made.push({ item: item.id, variant, trim: `${item.size[0]} x ${item.size[1]} in`, bleed: item.bleed, safe: item.safe });
		}
	}
	const result = { schemaVersion: 1 as const, ok: true as const, dpi, made, note: merchCatalog().note, files };
	emit(o, result, () => [...files.map((f) => `${f.format.padEnd(4)} ${f.width}x${f.height}  ${f.path}`), '', result.note].join('\n'));
}

export function registerMerch(program: Command) {
	program
		.command('merch [item]')
		.description('Print files for merch (tee, hoodie, cap, tote, mug wrap, sticker with cut line, poster, socks) at real size with bleed and safe area')
		.option('--list', 'items, sizes and variants')
		.option('--variant <id>', 'on-light, on-dark, bone, green, brown or black (each item lists its own)')
		.option('--all', 'every item (or, with an item, every variant)')
		.option('--headline <text>', 'the words on items that carry them')
		.option('--url <text>', 'the address on items that carry it')
		.option('--theme <id>', 'a brand theme (see --list)')
		.option('--dpi <n>', 'PNG resolution, 72 to 300 (default 300)')
		.option('--guides', 'draw the trim and safe area (for proofing; leave off for print)')
		.option('--format <kinds>', 'svg, png, or svg,png', 'svg,png')
		.option('--out <dir>', 'output directory (default: .ds/merch in the project)')
		.option('--json', 'JSON output listing the files written')
		.addHelpText('after', () => `\nExamples:\n  ${cli()} merch --list --json\n  ${cli()} merch tee-front --variant on-dark\n  ${cli()} merch sticker --variant green --json\n  ${cli()} merch --all --dpi 150 --out merch\n\nSizes are common vendor conventions: confirm against the vendor template before ordering.\n`)
		.action((item: string | undefined, _o, command: Command) => merchRun(item, command.optsWithGlobals() as Opts));
}
