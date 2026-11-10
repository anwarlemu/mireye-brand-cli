import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { brand, tokens } from '../lib/brand.js';
import { suggest } from '../lib/names.js';
import { pkgPath } from '../lib/paths.js';
import { themes } from '../image/catalog.js';
import { principlesDocument } from './principles.js';

export const TOKEN_GROUPS = ['color', 'type', 'spacing', 'radii', 'motion', 'other'] as const;
export type TokenGroup = (typeof TOKEN_GROUPS)[number];

const GROUP_TEST: Record<Exclude<TokenGroup, 'other'>, (name: string) => boolean> = {
	color: (name) => name.startsWith('--ds-color-'),
	type: (name) => /^--ds-(font|text|leading|tracking|line)-/.test(name),
	spacing: (name) => /^--ds-(space|section|component|layout|frame)-/.test(name),
	radii: (name) => name.startsWith('--ds-radius-') || /^--ds-cut(?:-|$)/.test(name),
	motion: (name) => name.startsWith('--ds-duration-') || name.startsWith('--ds-easing-'),
};

const GROUP_DESCRIPTION: Record<TokenGroup, string> = {
	color: 'Color roles and the named palette.',
	type: 'Font families, weights, sizes, line height and tracking.',
	spacing: 'Space steps, section padding and layout measures.',
	radii: 'Corner radii and cut-corner sizes.',
	motion: 'Durations and easing curves.',
	other: 'Tokens that are not color, type, spacing, radii or motion.',
};

function cssBlocks(css: string) {
	return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
		selector: match[1].replace(/\/\*[\s\S]*?\*\//g, '').trim(),
		body: match[2],
	}));
}

function varsIn(body: string): Record<string, string> {
	return Object.fromEntries([...body.matchAll(/(--ds-[\w-]+)\s*:\s*([^;]+);/g)].map((match) => [match[1], match[2].trim()]));
}

function groupOf(name: string): TokenGroup {
	for (const group of TOKEN_GROUPS) {
		if (group === 'other') continue;
		if (GROUP_TEST[group](name)) return group;
	}
	return 'other';
}

function groupedTokens() {
	const table = tokens().site;
	const grouped = Object.fromEntries(TOKEN_GROUPS.map((id) => [id, {} as Record<string, string>])) as Record<TokenGroup, Record<string, string>>;
	for (const [token, value] of Object.entries(table)) grouped[groupOf(token)][token] = value;
	return { table, grouped };
}

export function tokenByName(name: string) {
	const { table } = groupedTokens();
	const token = name.startsWith('--') ? name : `--ds-${name}`;
	const resolved = table[token] !== undefined ? token : table[name] !== undefined ? name : undefined;
	if (!resolved) {
		const close = suggest(name.replace(/^--ds-/, ''), Object.keys(table).map((item) => item.replace(/^--ds-/, '')));
		throw new Error(`Unknown token "${name}".${close.length ? ` Did you mean ${close.map((item) => `--ds-${item}`).join(', ')}?` : ''} Run brand tokens for the full list.`);
	}
	return { schemaVersion: 1 as const, token: resolved, value: table[resolved], group: groupOf(resolved) };
}

export function tokenCatalog(group?: string) {
	if (group && !TOKEN_GROUPS.includes(group as TokenGroup)) {
		throw new Error(`Unknown token group "${group}". Groups: ${TOKEN_GROUPS.join(', ')}.`);
	}
	const { grouped } = groupedTokens();
	const css = readFileSync(pkgPath('brand', 'tokens.css'), 'utf8');
	const overlays = themes()
		.filter((theme) => theme.attribute)
		.map((theme) => {
			const block = cssBlocks(css).find((item) => item.selector.includes(theme.attribute ?? ''));
			return { id: theme.id, label: theme.label, attribute: theme.attribute, tokens: block ? varsIn(block.body) : {} };
		});
	const radiusValues = Object.entries(grouped.radii).filter(([token]) => token.startsWith('--ds-radius-'));
	const selected: Record<string, Record<string, string>> = group ? { [group]: grouped[group as TokenGroup] } : grouped;
	return {
		schemaVersion: 1 as const,
		source: 'brand/tokens.css',
		groups: TOKEN_GROUPS.map((id) => ({ id, description: GROUP_DESCRIPTION[id], count: Object.keys(grouped[id]).length })),
		tokens: selected,
		radiiNote: !group || group === 'radii' ? (radiusValues.length && radiusValues.every(([, value]) => value.trim() === '0') ? 'Every --ds-radius-* token in the default theme is 0. Cut sizes are the --ds-cut tokens in the radii group.' : undefined) : undefined,
		themes: overlays,
	};
}

function fontFace(face: { family: string; files: Record<string, string>; license?: string } | undefined, role: string) {
	if (!face) return { role, family: null, files: [], missing: true, note: `brand.json has no ${role} face.` };
	const files = Object.entries(face.files).map(([weight, file]) => {
		const path = `brand/fonts/${file}`;
		return { weight, file, path, present: existsSync(pkgPath('brand', 'fonts', file)) };
	});
	return { role, family: face.family, license: face.license ?? null, files, missing: files.some((file) => !file.present) };
}

export function fontCatalog() {
	const fonts = brand().fonts;
	return {
		schemaVersion: 1 as const,
		source: 'brand/brand.json',
		sans: fontFace(fonts.local, 'sans'),
		mono: fontFace(fonts.mono, 'mono'),
		stylesheet: fonts.css,
		next: fonts.next,
		native: fonts.native,
	};
}

function sentences(text: string, pattern: RegExp): string[] {
	return text
		.split(/(?<=\.)\s+/)
		.map((sentence) => sentence.replace(/\s+/g, ' ').trim())
		.filter((sentence) => pattern.test(sentence));
}

export function logoCatalog() {
	const dir = pkgPath('brand', 'logo');
	const files = readdirSync(dir).filter((file) => !file.startsWith('.')).sort();
	const items = files.map((file) => {
		const path = `brand/logo/${file}`;
		const svg = file.endsWith('.svg') ? readFileSync(pkgPath('brand', 'logo', file), 'utf8') : '';
		const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1] ?? null;
		return { file, path, format: file.split('.').pop() ?? '', viewBox };
	});
	const corpus = [
		['brand/principles.md', readFileSync(pkgPath('brand', 'principles.md'), 'utf8')],
		['brand/tokens.css', readFileSync(pkgPath('brand', 'tokens.css'), 'utf8')],
	] as const;
	const usage = corpus.flatMap(([file, text]) => sentences(text.replace(/\/\*|\*\//g, ' '), /logomark|logo/i).map((text) => ({ source: file, text })));
	const hasWordmark = files.some((file) => /wordmark|logotype/i.test(file));
	const mentionsClearSpace = corpus.some(([, text]) => /clear[\s-]?space|minimum size/i.test(text));
	return {
		schemaVersion: 1 as const,
		files: items,
		wordmark: hasWordmark ? items.filter((item) => /wordmark|logotype/i.test(item.file)) : null,
		usage,
		notInRepo: [
			...(hasWordmark ? [] : ['No wordmark file is in brand/logo. Imagery sets the brand name in the sans face beside the mark.']),
			...(mentionsClearSpace ? [] : ['No clear-space or minimum-size rule is in this repo. Do not invent one.']),
		],
	};
}

export function voiceCatalog() {
	return { schemaVersion: 1 as const, ...principlesDocument().voice };
}

export function brandOverview() {
	const tokens = tokenCatalog();
	const fonts = fontCatalog();
	const logos = logoCatalog();
	const voice = voiceCatalog();
	return {
		schemaVersion: 1 as const,
		name: brand().name,
		themes: themes().map(({ id, label, default: isDefault }) => ({ id, label, default: isDefault })),
		tokenGroups: tokens.groups,
		fonts: {
			sans: fonts.sans.family,
			mono: fonts.mono.family,
			sansFilesPresent: fonts.sans.files.every((file) => file.present),
			monoFilesPresent: fonts.mono.files.every((file) => file.present),
		},
		logos: logos.files.map((file) => file.path),
		logoGaps: logos.notInRepo,
		voice: { source: voice.source, banned: voice.banned },
		read: ['brand tokens --json', 'brand fonts --json', 'brand logos --json', 'brand voice --json', 'principles --json'],
	};
}
