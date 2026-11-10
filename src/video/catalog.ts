import { cleanContent, defaultFooter, defaultTheme, themes, type ContentKey, type ImageContent } from '../image/catalog.js';
import { tokens } from '../lib/brand.js';

/** Fixed clock. Length is ten times the brand base duration, sampled at 12 frames a second. Both numbers are renderer constants, not brand tokens. */
export const VIDEO_CLOCK = { holds: 10, fps: 12 } as const;

export const VIDEO_FORMATS = {
	square: { width: 1080, height: 1080, ratio: '1:1', use: 'Square social clips' },
	vertical: { width: 1080, height: 1920, ratio: '9:16', use: 'Vertical social clips' },
	landscape: { width: 1920, height: 1080, ratio: '16:9', use: 'Landscape product and announcement clips' },
} as const;

export type VideoFormatId = keyof typeof VIDEO_FORMATS;

export const VIDEO_TEMPLATES = {
	social: {
		description: 'Animated social clip. The mark and the headline settle on the sheet while the footer ticks fill.',
		required: ['title'],
		optional: ['subtitle', 'footer'],
	},
	announcement: {
		description: 'Announcement clip. A label, a headline and a supporting line arrive in that order.',
		required: ['title'],
		optional: ['kicker', 'subtitle', 'footer'],
	},
	product: {
		description: 'Product clip. A survey plate draws in under the headline and a node travels the rule.',
		required: ['title'],
		optional: ['subtitle', 'footer'],
	},
} as const;

export type VideoTemplateId = keyof typeof VIDEO_TEMPLATES;

export type VideoExport = 'apng' | 'png' | 'svg';

const BEZIER = /^cubic-bezier\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)\s*\)$/;

export function videoTiming() {
	const raw = tokens().site['--ds-duration-base'];
	const ms = Number.parseFloat(raw ?? '');
	if (!raw?.endsWith('ms') || !Number.isFinite(ms) || ms <= 0) throw new Error('Video timing needs --ds-duration-base in milliseconds.');
	const easingRaw = tokens().site['--ds-easing-out'];
	const match = easingRaw?.match(BEZIER);
	if (!match) throw new Error('Video motion needs --ds-easing-out as cubic-bezier(n, n, n, n).');
	const durationMs = ms * VIDEO_CLOCK.holds;
	const frameCount = Math.round((durationMs / 1000) * VIDEO_CLOCK.fps);
	if (frameCount < 2) throw new Error('Video timing resolved to fewer than 2 frames.');
	return {
		fps: VIDEO_CLOCK.fps,
		holds: VIDEO_CLOCK.holds,
		durationMs,
		frameCount,
		durationToken: '--ds-duration-base',
		easingToken: '--ds-easing-out',
		easing: [Number(match[1]), Number(match[2]), Number(match[3]), Number(match[4])] as [number, number, number, number],
		plays: 1,
	};
}

export function isVideoFormat(value: string): value is VideoFormatId {
	return value in VIDEO_FORMATS;
}

export function isVideoTemplate(value: string): value is VideoTemplateId {
	return value in VIDEO_TEMPLATES;
}

export function videoFields(template: VideoTemplateId): ContentKey[] {
	return [...VIDEO_TEMPLATES[template].required, ...VIDEO_TEMPLATES[template].optional] as ContentKey[];
}

export function cleanVideoContent(template: VideoTemplateId, input: unknown): ImageContent {
	const content = cleanContent(input, videoFields(template));
	const missing = VIDEO_TEMPLATES[template].required.filter((key) => !content[key as ContentKey]);
	if (missing.length) throw new Error(`${template} needs ${missing.map((key) => `--${key}`).join(' and ')}.`);
	return content;
}

export function videoCatalog() {
	const timing = videoTiming();
	return {
		schemaVersion: 1 as const,
		renderer: 'svg-resvg-apng',
		rendererNote: 'Each frame is an SVG drawn from the brand tokens, font files and logo, rasterized with resvg, then muxed into an APNG. No browser and no random values. The same inputs write the same bytes.',
		formats: (Object.entries(VIDEO_FORMATS) as [VideoFormatId, (typeof VIDEO_FORMATS)[VideoFormatId]][]).map(([id, format]) => ({ id, width: format.width, height: format.height, ratio: format.ratio, use: format.use })),
		templates: (Object.entries(VIDEO_TEMPLATES) as [VideoTemplateId, (typeof VIDEO_TEMPLATES)[VideoTemplateId]][]).map(([id, template]) => ({ id, description: template.description, required: template.required, optional: template.optional })),
		themes: themes().map(({ id, label, default: isDefault }) => ({ id, label, default: isDefault })),
		exports: ['apng', 'png', 'svg'],
		timing: { fps: timing.fps, frameCount: timing.frameCount, durationMs: timing.durationMs, plays: timing.plays, durationToken: timing.durationToken, easingToken: timing.easingToken },
		defaults: { theme: defaultTheme(), out: '.ds/videos', export: ['apng'], footer: defaultFooter() },
	};
}
