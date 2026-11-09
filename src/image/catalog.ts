import { readFileSync } from 'node:fs';
import { brand, tokens } from '../lib/brand.js';
import { pkgPath } from '../lib/paths.js';

/** Pixel sizes agents ask for by name. The numbers are the export size, one pixel per unit. */
export const FORMATS = {
	og: { width: 1200, height: 630, use: 'Open Graph and link previews, including Facebook and LinkedIn' },
	square: { width: 1080, height: 1080, use: 'Instagram and LinkedIn square posts' },
	portrait: { width: 1080, height: 1350, use: 'Instagram portrait posts' },
	landscape: { width: 1200, height: 675, use: 'X and LinkedIn landscape posts' },
} as const;

export type FormatId = keyof typeof FORMATS;

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

export type ContentKey = 'title' | 'subtitle' | 'kicker' | 'quote' | 'attribution' | 'image' | 'footer';

export type ImageContent = Partial<Record<ContentKey, string>>;

const LIMITS: Record<ContentKey, number> = {
	title: 160,
	subtitle: 280,
	kicker: 48,
	quote: 320,
	attribution: 80,
	image: 4096,
	footer: 64,
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

/** Colors for one theme: the site tokens, with that theme's attribute block laid over them. */
export function paletteFor(themeId: string): Palette {
	const known = themes();
	const theme = known.find((item) => item.id === themeId);
	if (!theme) throw new Error(`Unknown theme "${themeId}". Themes: ${known.map((item) => item.id).join(', ')}.`);
	const table = { ...tokens().site, ...(theme.attribute ? selectorVars(theme.attribute) : {}) };
	return Object.fromEntries((Object.entries(ROLE) as [keyof Palette, string][]).map(([key, token]) => [key, asHex(token, table)])) as Palette;
}

export function leading(name: 'tight' | 'display' | 'body'): number {
	const value = Number.parseFloat(tokens().site[`--ds-leading-${name}`] ?? '');
	if (!Number.isFinite(value) || value <= 0) throw new Error(`Missing type token --ds-leading-${name}.`);
	return value;
}

const FIELD = /^(title|subtitle|kicker|quote|attribution|image|footer)$/;

/** Trim text fields and reject anything past the limit. Unknown keys are ignored. */
export function cleanContent(input: unknown): ImageContent {
	if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Image content must be an object of strings.');
	const out: ImageContent = {};
	for (const [key, value] of Object.entries(input)) {
		if (!FIELD.test(key) || value === undefined || value === null || value === '') continue;
		if (typeof value !== 'string') throw new Error(`${key} must be a string.`);
		const text = key === 'image' ? value.trim() : value.replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').trim();
		if (!text) continue;
		if ([...text].length > LIMITS[key as ContentKey]) throw new Error(`${key} is longer than ${LIMITS[key as ContentKey]} characters.`);
		out[key as ContentKey] = text;
	}
	return out;
}

export function requireContent(template: TemplateId, content: ImageContent) {
	const missing = TEMPLATES[template].required.filter((key) => !content[key as ContentKey]);
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
		formats: (Object.entries(FORMATS) as [FormatId, (typeof FORMATS)[FormatId]][]).map(([id, format]) => ({ id, width: format.width, height: format.height, use: format.use })),
		templates: (Object.entries(TEMPLATES) as [TemplateId, (typeof TEMPLATES)[TemplateId]][]).map(([id, template]) => ({ id, description: template.description, required: template.required, optional: template.optional })),
		themes: themes().map(({ id, label, default: isDefault }) => ({ id, label, default: isDefault })),
		exports: ['png', 'svg'],
		defaults: { theme: defaultTheme(), out: '.ds/images', export: ['png', 'svg'], footer: defaultFooter() },
	};
}
