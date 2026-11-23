import { readFileSync } from 'node:fs';
import { brand, tokens } from '../lib/brand.js';
import { PLATFORMS, type Zone } from '../design/platforms.js';
import { unknownName } from '../lib/names.js';
import { pkgPath } from '../lib/paths.js';

export type SizeInfo = { width: number; height: number; use: string; aliases: string[]; shown: number; avoid: Zone[]; safe?: Zone };
type SizesDoc = { extra: Record<string, { width: number; height: number; use: string; aliases: string[]; shown: number }>; aliases: Record<string, string>; custom: { min: number; max: number } };
const sizesDoc = (): SizesDoc => (JSON.parse(readFileSync(pkgPath('brand', 'assets', 'image.json'), 'utf8')) as { sizes: SizesDoc }).sizes;

/** Pixel sizes agents ask for by name: the shared platform sizes and this brand's extras. The numbers are the export size, one pixel per unit. */
export const FORMATS: Record<string, SizeInfo> = (() => {
	const doc = sizesDoc();
	const own = (id: string) => Object.entries(doc.aliases).filter(([, to]) => to === id).map(([from]) => from);
	const out: Record<string, SizeInfo> = {};
	for (const p of PLATFORMS) {
		const taken = p.aliases.filter((a) => !(a in doc.aliases));
		out[p.id] = { width: p.width, height: p.height, use: p.label, aliases: [...taken, ...own(p.id)], shown: p.shown, avoid: p.avoid, safe: p.safe };
	}
	for (const [id, e] of Object.entries(doc.extra)) out[id] = { ...e, avoid: [] };
	return out;
})();

export type FormatId = string;

/** One size to draw at: a named one, or any pixel size as `custom`. */
export type Size = { id: string; width: number; height: number };

export const isBanner = (s: { width: number; height: number }) => s.width / s.height >= 2.4;

export function sizeOf(id: string, width?: number, height?: number): Size {
	if (id === 'custom') {
		const { min, max } = sizesDoc().custom;
		if (!width || !height) throw new Error('custom needs --width and --height in pixels.');
		for (const [flag, v] of [['--width', width], ['--height', height]] as const) if (!Number.isInteger(v) || v < min || v > max) throw new Error(`${flag} is a whole number of pixels from ${min} to ${max}.`);
		if (width / height > 8 || height / width > 3) throw new Error('custom is at most 8 times as wide as tall, or 3 times as tall as wide.');
		return { id, width, height };
	}
	const f = FORMATS[id];
	if (!f) throw unknownName('size', id, [...Object.keys(FORMATS), 'custom']);
	if (width !== undefined || height !== undefined) throw new Error(`${id} is ${f.width}x${f.height}. --width and --height go with --size custom.`);
	return { id, width: f.width, height: f.height };
}

/** What is known about a size: its zones and the width it is shown at. Custom sizes have no zones. */
export function sizeInfo(size: Size): SizeInfo {
	return FORMATS[size.id] ?? { width: size.width, height: size.height, use: size.id, aliases: [], shown: Math.max(540, size.width / 2), avoid: [] };
}

/** The size id a name means: an id or one of its aliases (case and spaces ignored). */
export function resolveFormat(name: string): string | undefined {
	const n = name.trim().toLowerCase().replace(/[\s_]+/g, '-');
	if (n === 'custom') return 'custom';
	return Object.keys(FORMATS).find((id) => id === n) ?? Object.keys(FORMATS).find((id) => FORMATS[id].aliases.includes(n));
}

export const TEMPLATES = {
	headline: {
		description: 'A headline on the sheet.',
		required: ['title'],
		optional: ['footer'],
	},
	subtext: {
		description: 'A headline and one supporting line.',
		required: ['title', 'subtitle'],
		optional: ['footer'],
	},
	frame: {
		description: 'A headline and your picture (--image) in a cut frame; without one, a wireframe drawing (--scene).',
		required: [],
		optional: ['title', 'subtitle', 'image', 'scene', 'footer'],
	},
	quote: {
		description: 'A quotation and an optional attribution.',
		required: ['quote'],
		optional: ['attribution', 'footer'],
	},
	announcement: {
		description: 'A short label, a headline and an optional supporting line.',
		required: ['title'],
		optional: ['kicker', 'subtitle', 'footer'],
	},
} as const;

export type TemplateId = keyof typeof TEMPLATES;

export type ContentKey = 'title' | 'subtitle' | 'kicker' | 'quote' | 'attribution' | 'image' | 'footer' | 'callout' | 'chart' | 'partner' | 'scene' | 'labels' | 'question' | 'suggestions' | 'place' | 'page';

export type ImageContent = Partial<Record<ContentKey, string>>;

const LIMITS: Record<ContentKey, number> = {
	title: 160,
	subtitle: 280,
	kicker: 48,
	quote: 320,
	attribution: 80,
	image: 4096,
	footer: 64,
	callout: 80,
	chart: 600,
	partner: 40,
	scene: 32,
	labels: 60,
	question: 120,
	suggestions: 240,
	place: 40,
	page: 8,
};

/** The flag people pass for a field: the shared names first. */
export const FLAG: Record<ContentKey, string> = { title: 'headline', subtitle: 'body', kicker: 'badge', quote: 'quote', attribution: 'attribution', image: 'image', footer: 'footer', callout: 'callout', chart: 'chart', partner: 'partner', scene: 'scene', labels: 'labels', question: 'question', suggestions: 'suggestions', place: 'place', page: 'page' };

/** The shared names for this brand's older field names, in content files. */
const FIELD_ALIASES: Record<string, ContentKey> = { headline: 'title', body: 'subtitle', badge: 'kicker' };

export type Palette = {
	ground: string;
	ink: string;
	secondary: string;
	muted: string;
	line: string;
	lineSubtle: string;
	fog: string;
	onInk: string;
};

const ROLE: Record<keyof Palette, string> = {
	ground: '--ds-color-bg-default',
	ink: '--ds-color-text-default',
	secondary: '--ds-color-text-secondary',
	muted: '--ds-color-text-muted',
	line: '--ds-color-border-default',
	lineSubtle: '--ds-color-border-subtle',
	fog: '--ds-color-bg-subtle',
	onInk: '--ds-color-text-on-brand',
};

export type ThemeInfo = { id: string; label: string; default: boolean; attribute?: string };

export function themes(): ThemeInfo[] {
	const all = brand().themes ?? {};
	const ids = Object.keys(all);
	if (!ids.length) return [{ id: 'default', label: 'Default', default: true }];
	return ids.map((id) => ({ id, label: all[id].label ?? id, default: !!all[id].default, attribute: all[id].attribute }));
}

export function defaultTheme(): string {
	return themes().find((theme) => theme.default)?.id ?? themes()[0].id;
}

/** The host shown in the footer when the caller does not pass one. */
export function defaultFooter(): string {
	const site = brand().site;
	if (!site) return brand().name;
	try {
		return new URL(site).host.replace(/^www\./, '');
	} catch {
		return site.replace(/^https?:\/\//, '').replace(/\/$/, '');
	}
}

let cssBlocks: { selector: string; body: string }[] | undefined;
function blocks() {
	cssBlocks ??= [...readFileSync(pkgPath('brand', 'tokens.css'), 'utf8').matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
		selector: match[1].replace(/\/\*[\s\S]*?\*\//g, '').trim(),
		body: match[2],
	}));
	return cssBlocks;
}

function selectorVars(attribute: string): Record<string, string> {
	const block = blocks().find((item) => item.selector.includes(attribute));
	if (!block) return {};
	return Object.fromEntries([...block.body.matchAll(/(--ds-[\w-]+)\s*:\s*([^;]+);/g)].map((match) => [match[1], match[2].trim()]));
}

function asHex(token: string, table: Record<string, string>): string {
	let value = table[token];
	if (!value) throw new Error(`Missing color token ${token}.`);
	for (let i = 0; i < 4; i++) {
		const ref = value.match(/^var\(\s*(--ds-[\w-]+)\s*\)$/);
		if (!ref) break;
		value = table[ref[1]] ?? value;
	}
	if (value.startsWith('#')) return value.toUpperCase();
	const rgb = value.match(/rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/i);
	if (!rgb) throw new Error(`Cannot use ${token} (${value}) in an image. It needs a hex or rgb color.`);
	return `#${[rgb[1], rgb[2], rgb[3]].map((part) => Number(part).toString(16).padStart(2, '0')).join('')}`.toUpperCase();
}

export function themeTable(themeId: string): Record<string, string> {
	const known = themes();
	const theme = known.find((item) => item.id === themeId);
	if (!theme) throw new Error(`Unknown theme "${themeId}". Themes: ${known.map((item) => item.id).join(', ')}.`);
	return { ...tokens().site, ...(theme.attribute ? selectorVars(theme.attribute) : {}) };
}

/** One color token as hex, resolved in a theme (the theme's attribute block over the site tokens). */
export function tokenHex(token: string, themeId = defaultTheme()): string {
	return asHex(token, themeTable(themeId));
}

/** Colors for one theme: the site tokens, with that theme's attribute block laid over them. */
export function paletteFor(themeId: string): Palette {
	const table = themeTable(themeId);
	return Object.fromEntries((Object.entries(ROLE) as [keyof Palette, string][]).map(([key, token]) => [key, asHex(token, table)])) as Palette;
}

export function leading(name: 'tight' | 'display' | 'body'): number {
	const value = Number.parseFloat(tokens().site[`--ds-leading-${name}`] ?? '');
	if (!Number.isFinite(value) || value <= 0) throw new Error(`Missing type token --ds-leading-${name}.`);
	return value;
}

/** Trim text fields and reject anything past the limit. Unknown keys are an error. `allowed` narrows the fields a caller accepts. */
export function cleanContent(input: unknown, allowed?: readonly ContentKey[]): ImageContent {
	if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Image content must be an object of strings.');
	const allow = allowed ?? (Object.keys(LIMITS) as ContentKey[]);
	const allowSet = new Set<string>(allow);
	const out: ImageContent = {};
	for (const [name, value] of Object.entries(input)) {
		const key = FIELD_ALIASES[name] ?? name;
		if (!allowSet.has(key)) throw new Error(`Unknown field "${name}". Fields: ${allow.map((k) => FLAG[k] ?? k).join(', ')}.`);
		if (value === undefined || value === null || value === '') continue;
		if (typeof value !== 'string') throw new Error(`${FLAG[key as ContentKey] ?? key} must be a string.`);
		const text = key === 'image' || key === 'scene' ? value.trim() : value.replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').trim();
		if (!text) continue;
		if ([...text].length > LIMITS[key as ContentKey]) throw new Error(`${FLAG[key as ContentKey]} is longer than ${LIMITS[key as ContentKey]} characters.`);
		if (key === 'page' && !/^\d{1,2}\s*\/\s*\d{1,2}$/.test(text)) throw new Error('page is this picture and how many there are, like 2/5.');
		out[key as ContentKey] = text;
	}
	return out;
}

type PosterDoc = Record<string, { label: string; description: string; required: string[]; optional: string[]; ground: string; sample: Record<string, string> }>;
type GroundDoc = Record<string, { label: string; dark: boolean; note?: string }>;
let docCache: { posters: PosterDoc; grounds: GroundDoc } | undefined;
const imageDoc = () => (docCache ??= JSON.parse(readFileSync(pkgPath('brand', 'assets', 'image.json'), 'utf8')) as { posters: PosterDoc; grounds: GroundDoc });

/** The brand's poster layouts (brand/assets/image.json), drawn by src/image/poster.ts. */
export const POSTERS = (): PosterDoc => imageDoc().posters;
export const GROUNDS = (): GroundDoc => imageDoc().grounds;

/** Every template id: the sheet templates, then the brand's posters. */
export const templateIds = (): string[] => [...Object.keys(TEMPLATES), ...Object.keys(POSTERS())];
export const isPoster = (value: string): boolean => value in POSTERS();

/** The fields a template draws. Every one takes a page number (a carousel's). */
export function templateFields(template: string): { required: ContentKey[]; optional: ContentKey[] } {
	const t = isPoster(template) ? POSTERS()[template] : TEMPLATES[template as TemplateId];
	return { required: [...t.required] as ContentKey[], optional: [...t.optional, 'page'] as ContentKey[] };
}

/** Every required field is there and every field given is one the template draws: nothing is ignored. */
export function requireContent(template: string, content: ImageContent, size?: string, sample = false) {
	const { required, optional } = templateFields(template);
	const extra = (Object.keys(content) as ContentKey[]).filter((key) => !required.includes(key) && !optional.includes(key));
	if (extra.length) {
		const holds = templateIds().filter((id) => extra.every((key) => [...templateFields(id).required, ...templateFields(id).optional].includes(key)));
		throw new Error(`${template} draws no ${extra.map((key) => FLAG[key]).join(' or ')}.${holds.length ? ` These do: ${holds.join(', ')}.` : ''}`);
	}
	const missing = required.filter((key) => !content[key] && !(sample && key === 'image'));
	if (missing.length) throw new Error(`${template} needs ${missing.map((key) => `--${FLAG[key]}`).join(' and ')}.`);
	if (size === 'avatar' && content.page) throw new Error('avatar holds the mark alone.');
}

export function isFormat(value: string): value is FormatId {
	return value in FORMATS || value === 'custom';
}

export function isTemplate(value: string): value is TemplateId {
	return value in TEMPLATES;
}

/** Sample copy for the sheets, drawn only with --sample. */
export const SHEET_SAMPLES = (): Record<string, Record<string, string>> => (JSON.parse(readFileSync(pkgPath('brand', 'assets', 'image.json'), 'utf8')) as { sheets: Record<string, Record<string, string>> }).sheets;

/** The sizes a template draws at. A profile picture holds the mark alone. */
export const sizesFor = (template: string): string[] => [...Object.keys(FORMATS).filter((id) => id !== 'avatar' || template === 'identity'), 'custom'];

export const EXPORTS = ['png', 'svg', 'jpg', 'webp', 'pdf'] as const;
export type ExportKind = (typeof EXPORTS)[number];

export function catalog() {
	return {
		schemaVersion: 1,
		formats: Object.entries(FORMATS).map(([id, format]) => ({ id, width: format.width, height: format.height, use: format.use, aliases: format.aliases, shown: format.shown, keepOut: format.avoid.map((z) => ({ what: z.name, official: z.official, share: z.rect })), ...(format.safe ? { safe: { what: format.safe.name, official: format.safe.official, share: format.safe.rect } } : {}) })),
		templates: [
			...(Object.entries(TEMPLATES) as [TemplateId, (typeof TEMPLATES)[TemplateId]][]).map(([id, template]) => ({ id, family: 'sheet', description: template.description, required: template.required, optional: template.optional, formats: sizesFor(id), grounds: Object.keys(GROUNDS()), ground: 'bone' })),
			...Object.entries(POSTERS()).map(([id, poster]) => ({ id, family: 'poster', label: poster.label, description: poster.description, required: poster.required, optional: poster.optional, formats: sizesFor(id), grounds: Object.keys(GROUNDS()), ground: poster.ground, sample: poster.sample })),
		],
		grounds: Object.entries(GROUNDS()).map(([id, ground]) => ({ id, label: ground.label, dark: ground.dark })),
		themes: themes().map(({ id, label, default: isDefault }) => ({ id, label, default: isDefault })),
		exports: [...EXPORTS],
		content: {
			fields: (Object.keys(LIMITS) as ContentKey[]).map((id) => ({ id, flag: FLAG[id], type: 'string', maxLength: LIMITS[id] })),
			unknownFields: 'error',
			words: 'Only the words you pass are drawn, whole. A field a template does not draw is an error, and so is copy that does not fit at the smallest readable size.',
			sample: 'Pass --sample to fill a template with its sample copy (brand/assets/image.json). Replace every word before publishing.',
		},
		defaults: { theme: defaultTheme(), ground: 'bone', out: '.ds/images', export: ['png', 'svg'], footer: defaultFooter() },
	};
}
