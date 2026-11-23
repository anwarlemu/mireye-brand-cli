import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { Command } from 'commander';
import { merchCatalog, merchDoc, merchItems, merchSlots, merchSvg, PX_PER_IN } from '../merch/merch.js';
import { defaultTheme, themes } from '../image/catalog.js';
import { exportsOf, outTarget, seedOf, writeFile, type OutFile } from '../image/output.js';
import { safeName } from './image.js';
import { wireScenes } from '../illustrate/wire.js';
import { imagesToPdf } from '../deck/pdf.js';
import { rasterize, rasterRgb } from '../image/encode.js';
import { cli } from '../lib/brand.js';
import { helpRow } from '../lib/help-row.js';
import { pickName, unknownName } from '../lib/names.js';
import { emit } from '../lib/output.js';
import { findProjectRoot } from '../lib/paths.js';

type Opts = { list?: boolean; variant?: string; ground?: string; sample?: boolean; scene?: string; seed?: string; headline?: string; url?: string; theme?: string; dpi?: string; format?: string; guides?: boolean; all?: boolean; out?: string; name?: string; json?: boolean };

export async function merchRun(itemArg: string | undefined, o: Opts) {
	if (o.list) {
		const cat = merchCatalog();
		emit(o, cat, () => [...cat.items.map((i) => helpRow(i.id, `${i.name}, ${i.trim.width} x ${i.trim.height} in, bleed ${i.bleed} in, safe ${i.safe} in, ${i.method}${i.dieCut ? ', die cut' : ''}. Variants: ${i.variants.join(', ')}.`, 14)), '', ...cat.variants.map((v) => helpRow(v.id, v.note, 14)), '', cat.note].join('\n'));
		return;
	}
	const ids = merchItems().map((i) => i.id);
	const items = itemArg ? [merchItems().find((i) => i.id === pickName('item', itemArg, ids))!] : o.all ? merchItems() : [];
	if (!items.length) throw new Error(`Name an item (${ids.join(', ')}) or pass --all.`);
	const variantIds = Object.keys(merchDoc().variants);
	const themeIds = themes().map((t) => t.id);
	// --theme is a brand theme; a variant or ground id works there too, as on image.
	const asVariant = o.variant ?? o.ground ?? (o.theme && !themeIds.includes(o.theme) && variantIds.includes(o.theme) ? o.theme : undefined);
	const theme = o.theme && o.theme !== asVariant ? o.theme : defaultTheme();
	if (!themeIds.includes(theme)) throw unknownName('theme', theme, [...themeIds, ...variantIds]);
	const dpi = o.dpi === undefined ? PX_PER_IN : Number(o.dpi);
	if (!Number.isFinite(dpi) || dpi < 72 || dpi > 300) throw new Error('--dpi is 72 to 300.');
	const to = outTarget(o.out, resolve(findProjectRoot(), '.ds', 'merch'), ['svg', 'png', 'pdf']);
	const kinds = exportsOf(o.format, ['svg', 'png', 'pdf'], to.kind ?? 'svg,png');
	const seed = seedOf(o.seed);
	if (o.scene) pickName('scene', o.scene, wireScenes());
	const jobs = items.flatMap((item) => (asVariant && !o.all ? [pickName(`${item.id} variant`, asVariant, item.variants)] : asVariant ? item.variants.filter((v) => v === asVariant) : o.all ? item.variants : [item.variants[0]]).map((variant) => ({ item, variant })));
	if (!jobs.length) throw unknownName('variant', asVariant ?? '', variantIds);
	if (to.name && jobs.length > 1) throw new Error('--out names one file, and several were asked for. Name a folder.');
	const copy: Record<string, string> = {};
	if (o.headline) copy.headline = o.headline;
	if (o.url) copy.url = o.url;
	// Everything is drawn before the first file is written. With --all, an item takes the words it carries and no others.
	const drawn = jobs.flatMap(({ item, variant }) => {
		const carries = merchSlots(item).map((x) => x.id);
		const slots = o.all && items.length > 1 ? Object.fromEntries(Object.entries(copy).filter(([key]) => carries.includes(key))) : copy;
		if (o.all && items.length > 1 && !o.sample && merchSlots(item).some((x) => x.required && !slots[x.id])) return [];
		return [{ item, variant, doc: merchSvg({ item, variant, slots, theme, guides: o.guides, sample: o.sample, scene: o.scene, seed }) }];
	});
	const left = [...new Set(jobs.map((j) => j.item.id))].filter((id) => !drawn.some((d) => d.item.id === id));
	mkdirSync(to.dir, { recursive: true });
	const files: OutFile[] = [];
	const made: { item: string; variant: string; trim: string; bleed: number; safe: number }[] = [];
	for (const { item, variant, doc } of drawn) {
		const name = to.name ?? (o.name ? (drawn.length > 1 ? `${safeName(o.name)}-${item.id}-${variant}` : safeName(o.name)) : `${item.id}-${variant}`);
		if (kinds.includes('svg')) files.push(writeFile(join(to.dir, `${name}.svg`), doc.svg, 'svg', doc.widthPx, doc.heightPx));
		const w = Math.round((doc.widthPx * dpi) / PX_PER_IN);
		const h = Math.round((doc.heightPx * dpi) / PX_PER_IN);
		if (kinds.includes('png')) files.push(writeFile(join(to.dir, `${name}.png`), await rasterize(doc.printSvg, w), 'png', w, h));
		if (kinds.includes('pdf')) {
			if (!merchDoc().variants[variant].ground) throw new Error(`pdf is for items printed on a ground; ${item.id} ${variant} is art on a transparent ground. Use svg or png.`);
			files.push(writeFile(join(to.dir, `${name}.pdf`), imagesToPdf([{ ...(await rasterRgb(doc.printSvg, w)), trim: item.bleed * 72 }], doc.widthIn * 72), 'pdf', w, h));
		}
		made.push({ item: item.id, variant, trim: `${item.size[0]} x ${item.size[1]} in`, bleed: item.bleed, safe: item.safe });
	}
	const skipped = left.map((id) => `${id} needs --headline (or --sample), so it was left out.`);
	const result = { schemaVersion: 1 as const, ok: true as const, dpi, made, skipped, note: merchCatalog().note, files };
	emit(o, result, () => [...files.map((f) => `${f.format.padEnd(4)} ${f.width}x${f.height}  ${f.path}`), ...skipped, '', result.note].join('\n'));
}

export function registerMerch(program: Command) {
	program
		.command('merch [item]')
		.description('Print files for merch (tee, hoodie, cap, tote, mug wrap, sticker with cut line, poster, socks) at real size with bleed and safe area')
		.option('--list', 'items, sizes and variants')
		.option('--variant <id>', 'on-light, on-dark, bone, green, brown or black (each item lists its own)')
		.option('--all', 'every item (or, with an item, every variant)')
		.option('--ground <id>', 'same as --variant')
		.option('--headline <text>', 'the words on items that carry them')
		.option('--sample', 'fill unset words with the sample copy, for a first look (replace it)')
		.option('--scene <id>', 'items with a drawing: which wireframe scene')
		.option('--seed <n>', 'items with a drawing: another one')
		.option('--url <text>', 'the address on items that carry it')
		.option('--theme <id>', 'a brand theme, or a variant')
		.option('--dpi <n>', 'PNG resolution, 72 to 300 (default 300)')
		.option('--guides', 'draw the trim and safe area (for proofing; leave off for print)')
		.option('--format <kinds>', 'svg, png, pdf (with trim and bleed boxes) or a list (default svg,png)')
		.option('--out <path>', 'output directory (default: .ds/merch in the project), or a file name that also sets the format')
		.option('--name <base>', 'file name without an extension')
		.option('--json', 'JSON output listing the files written')
		.addHelpText('after', () => `\nExamples:\n  ${cli()} merch --list --json\n  ${cli()} merch tee-front --variant on-dark\n  ${cli()} merch sticker --variant green --json\n  ${cli()} merch --all --dpi 150 --out merch\n\nSizes are common vendor conventions: confirm against the vendor template before ordering.\n`)
		.action((item: string | undefined, _o, command: Command) => merchRun(item, command.optsWithGlobals() as Opts));
}
