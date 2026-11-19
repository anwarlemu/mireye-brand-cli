import { readFileSync } from 'node:fs';
import { brand, tokens } from '../lib/brand.js';
import { pkgPath } from '../lib/paths.js';

type SizeDoc = Record<string, { width: number; height: number; use: string; aliases: string[] }>;
const sizeDoc = (): SizeDoc => (JSON.parse(readFileSync(pkgPath('brand', 'assets', 'image.json'), 'utf8')) as { sizes: SizeDoc }).sizes;

/** Pixel sizes agents ask for by name (brand/assets/image.json). The numbers are the export size, one pixel per unit. */
export const FORMATS: Record<string, { width: number; height: number; use: string; aliases: string[] }> = sizeDoc();

export type FormatId = string;

/** Sizes the cut-frame sheet templates fit: a header, a body and a footer need at least 500px of height. */
export const SHEET_FORMATS = Object.keys(FORMATS).filter((id) => FORMATS[id].height >= 600);

/** The size id a name means: an id or one of its aliases (case and spaces ignored). */
export function resolveFormat(name: string): string | undefined {
	const n = name.trim().toLowerCase().replace(/[\s_]+/g, '-');
	return Object.keys(FORMATS).find((id) => id === n || FORMATS[id].aliases.includes(n));
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
		description: 'A headline and a product screenshot in a cut frame. Without an image, a survey plate is drawn.',
		required: [],
		optional: ['title', 'subtitle', 'image', 'footer'],
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

export type ContentKey = 'title' | 'subtitle' | 'kicker' | 'quote' | 'attribution' | 'image' | 'footer' | 'callout' | 'chart' | 'partner' | 'scene';

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
};

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
	for (const [key, value] of Object.entries(input)) {
		if (!allowSet.has(key)) throw new Error(`Unknown field "${key}". Fields: ${allow.join(', ')}.`);
		if (value === undefined || value === null || value === '') continue;
		if (typeof value !== 'string') throw new Error(`${key} must be a string.`);
		const text = key === 'image' || key === 'scene' ? value.trim() : value.replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').trim();
		if (!text) continue;
		if ([...text].length > LIMITS[key as ContentKey]) throw new Error(`${key} is longer than ${LIMITS[key as ContentKey]} characters.`);
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

export function requireContent(template: string, content: ImageContent) {
	const required = isPoster(template) ? POSTERS()[template].required : TEMPLATES[template as TemplateId].required;
	const missing = required.filter((key) => !content[key as ContentKey]);
	if (missing.length) throw new Error(`${template} needs ${missing.map((key) => `--${key}`).join(' and ')}.`);
}

export function isFormat(value: string): value is FormatId {
	return value in FORMATS;
}

export function isTemplate(value: string): value is TemplateId {
	return value in TEMPLATES;
}

export function catalog() {
	return {
		schemaVersion: 1,
		formats: Object.entries(FORMATS).map(([id, format]) => ({ id, width: format.width, height: format.height, use: format.use, aliases: format.aliases })),
		templates: [
			...(Object.entries(TEMPLATES) as [TemplateId, (typeof TEMPLATES)[TemplateId]][]).map(([id, template]) => ({ id, family: 'sheet', description: template.description, required: template.required, optional: template.optional, formats: SHEET_FORMATS, grounds: ['bone'] })),
			...Object.entries(POSTERS()).map(([id, poster]) => ({ id, family: 'poster', label: poster.label, description: poster.description, required: poster.required, optional: poster.optional, formats: Object.keys(FORMATS), grounds: Object.keys(GROUNDS()), ground: poster.ground, sample: poster.sample })),
		],
		grounds: Object.entries(GROUNDS()).map(([id, ground]) => ({ id, label: ground.label, dark: ground.dark })),
		themes: themes().map(({ id, label, default: isDefault }) => ({ id, label, default: isDefault })),
		exports: ['png', 'svg'],
		content: {
			fields: (Object.keys(LIMITS) as ContentKey[]).map((id) => ({ id, type: 'string', maxLength: LIMITS[id] })),
			unknownFields: 'error',
			sample: 'Pass --sample to fill a poster with its sample copy (brand/assets/image.json). Replace every word before publishing.',
		},
		defaults: { theme: defaultTheme(), ground: 'bone', out: '.ds/images', export: ['png', 'svg'], footer: defaultFooter() },
	};
}
