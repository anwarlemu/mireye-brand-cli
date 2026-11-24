import { mkdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { Command } from 'commander';
import { defaultTheme, tokenHex } from '../image/catalog.js';
import { rasterize } from '../image/encode.js';
import { markShape } from '../image/logo.js';
import { writeFile, type OutFile } from '../image/output.js';
import { groundColors, groundIds } from '../image/poster.js';
import { num } from '../image/type.js';
import { brand, cli } from '../lib/brand.js';
import { pickName } from '../lib/names.js';
import { emit } from '../lib/output.js';
import { findProjectRoot, pkgPath } from '../lib/paths.js';

// `icons`: the favicon set and app icons (the mark on a brand ground, kept inside the area every platform shows), and
// the icon set the brand's interface uses, as SVGs in currentColor or in one brand ink.

type Opts = { list?: boolean; theme?: string; ground?: string; color?: string; out?: string; json?: boolean };

const iconsDoc = () => JSON.parse(readFileSync(pkgPath('brand', 'icons', 'icons.json'), 'utf8')) as { icons: { name: string; source: string; licence: string }[] };

/** The mark centred on a square ground, `fill` of the side wide. */
function tile(size: number, ground: string, ink: string, fill: number, round = false): string {
	const m = markShape();
	const w = size * fill;
	const k = w / m.w;
	const h = m.h * k;
	const bg = round ? `<circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="${ground}"/>` : `<rect width="${size}" height="${size}" fill="${ground}"/>`;
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${bg}<g transform="translate(${num((size - w) / 2)} ${num((size - h) / 2)}) scale(${num(k, 5)})"><path d="${m.d}" fill="${ink}" fill-rule="evenodd"/></g></svg>`;
}

/** An ICO file holding PNGs (every browser and Windows since Vista reads them). */
function ico(pngs: { size: number; png: Buffer }[]): Buffer {
	const head = Buffer.alloc(6 + pngs.length * 16);
	head.writeUInt16LE(0, 0);
	head.writeUInt16LE(1, 2);
	head.writeUInt16LE(pngs.length, 4);
	let offset = head.length;
	pngs.forEach(({ size, png }, i) => {
		const at = 6 + i * 16;
		head.writeUInt8(size >= 256 ? 0 : size, at);
		head.writeUInt8(size >= 256 ? 0 : size, at + 1);
		head.writeUInt16LE(1, at + 4);
		head.writeUInt16LE(32, at + 6);
		head.writeUInt32LE(png.length, at + 8);
		head.writeUInt32LE(offset, at + 12);
		offset += png.length;
	});
	return Buffer.concat([head, ...pngs.map((p) => p.png)]);
}

export async function iconsRun(what: string | undefined, o: Opts) {
	if (o.list || !what) {
		const data = { schemaVersion: 1, kinds: ['favicon', 'app', 'set'], favicon: ['favicon.ico (16, 32)', 'icon.svg', 'favicon-16.png', 'favicon-32.png', 'apple-touch-icon.png (180)', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'site.webmanifest'], app: ['app-icon-1024.png', 'app-icon-512.png'], set: iconsDoc().icons };
		emit(o, data, () => [`favicon  ${data.favicon.join(', ')}`, `app      ${data.app.join(', ')}`, `set      ${data.set.length} icons the interface uses (brand/icons, sources in icons.json)`, '', `Run \`${cli()} icons favicon --theme green --out public\`.`].join('\n'));
		return;
	}
	const kind = pickName('icons kind', what, ['favicon', 'app', 'set']);
	const ground = pickName('ground', o.ground ?? (o.theme && groundIds().includes(o.theme) ? o.theme : 'green'), groundIds());
	const theme = o.theme && !groundIds().includes(o.theme) ? o.theme : defaultTheme();
	const c = groundColors(ground, theme);
	const dir = resolve(o.out ?? join(findProjectRoot(), '.ds', 'icons'));
	mkdirSync(dir, { recursive: true });
	const files: OutFile[] = [];
	const png = async (name: string, svg: string, size: number) => {
		const data = await rasterize(svg, size);
		files.push(writeFile(join(dir, name), data, 'png', size, size));
		return data;
	};
	if (kind === 'favicon') {
		// Small sizes fill more of the square; the maskable icon keeps the mark inside the circle Android crops to.
		const s16 = await png('favicon-16.png', tile(16, c.bg, c.ink, 0.86), 16);
		const s32 = await png('favicon-32.png', tile(32, c.bg, c.ink, 0.8), 32);
		files.push(writeFile(join(dir, 'favicon.ico'), ico([{ size: 16, png: s16 }, { size: 32, png: s32 }]), 'ico', 32, 32));
		await png('apple-touch-icon.png', tile(180, c.bg, c.ink, 0.62), 180);
		await png('icon-192.png', tile(192, c.bg, c.ink, 0.62), 192);
		await png('icon-512.png', tile(512, c.bg, c.ink, 0.62), 512);
		await png('icon-maskable-512.png', tile(512, c.bg, c.ink, 0.46), 512);
		files.push(writeFile(join(dir, 'icon.svg'), tile(64, c.bg, c.ink, 0.72), 'svg', 64, 64));
		const manifest = { name: brand().name, short_name: brand().name, icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }, { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }], theme_color: c.bg, background_color: c.bg, display: 'standalone' };
		files.push(writeFile(join(dir, 'site.webmanifest'), `${JSON.stringify(manifest, null, 2)}\n`, 'json', 0, 0));
	} else if (kind === 'app') {
		await png('app-icon-1024.png', tile(1024, c.bg, c.ink, 0.58), 1024);
		await png('app-icon-512.png', tile(512, c.bg, c.ink, 0.58), 512);
	} else {
		const color = o.color ? tokenHex(o.color.startsWith('--') ? o.color : `--ds-color-${o.color}`, theme) : undefined;
		for (const icon of iconsDoc().icons) {
			let svg = readFileSync(pkgPath('brand', 'icons', `${icon.name}.svg`), 'utf8');
			if (color) svg = svg.replaceAll('currentColor', color);
			files.push(writeFile(join(dir, `${icon.name}.svg`), svg, 'svg', 0, 0));
		}
		files.push(writeFile(join(dir, 'icons.json'), readFileSync(pkgPath('brand', 'icons', 'icons.json')), 'json', 0, 0));
	}
	const result = { schemaVersion: 1 as const, ok: true as const, kind, ground, files };
	emit(o, result, () => files.map((f) => `${f.format.padEnd(4)} ${f.width ? `${f.width}x${f.height}` : ''}  ${f.path}`).join('\n'));
}

export function registerIcons(program: Command) {
	program
		.command('icons [kind]')
		.description('Favicon set (ico, png, maskable, svg, manifest), app icons, and the icon set the interface uses as SVGs')
		.option('--list', 'what each kind writes, and every icon with its source and licence')
		.option('--theme <id>', 'a ground (green, bone, brown, black) or a brand theme')
		.option('--ground <id>', 'the ground behind the mark (default green)')
		.option('--color <token>', 'set: one brand color for every icon (a token name, like text-default); default currentColor')
		.option('--out <dir>', 'output directory (default: .ds/icons in the project)')
		.option('--json', 'JSON output listing the files written')
		.addHelpText('after', () => `\nExamples:\n  ${cli()} icons --list\n  ${cli()} icons favicon --theme green --out public\n  ${cli()} icons app --ground bone\n  ${cli()} icons set --out icons\n`)
		.action((kind: string | undefined, _o, command: Command) => iconsRun(kind, command.optsWithGlobals() as Opts));
}
