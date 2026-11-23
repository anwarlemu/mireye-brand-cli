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
	poster: {
		description: 'Poster reveal. Any share-image layout (--poster window, parcels, scene, ...) uncovered left to right over its ground, as the website reveals its survey fills.',
		required: ['poster'],
		optional: ["title", "subtitle", "callout", "chart", "partner", "scene", "image", "labels", "question", "suggestions", "place"],
	},
} as const;

export type VideoTemplateId = keyof typeof VIDEO_TEMPLATES;

export type VideoExport = 'apng' | 'mp4' | 'webm' | 'png' | 'svg' | 'still';

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
	const raw = { ...(input as Record<string, unknown>) };
	const poster = typeof raw.poster === 'string' ? raw.poster : undefined;
	delete raw.poster;
	const content = cleanContent(raw, videoFields(template).filter((key) => (key as string) !== 'poster')) as ImageContent & { poster?: string };
	if (poster) content.poster = poster;
	const missing = VIDEO_TEMPLATES[template].required.filter((key) => !content[key as ContentKey]);
	if (missing.length) throw new Error(`${template} needs ${missing.map((key) => `--${key}`).join(' and ')}.`);
	return content;
}

export function videoCatalog() {
	const timing = videoTiming();
	return {
		schemaVersion: 1 as const,
		renderer: 'svg-resvg-apng',
		rendererNote: 'Each frame is an SVG drawn from the brand tokens, font files and logo, rasterized with resvg, then muxed into an APNG, or encoded to MP4 (H.264) or WebM (VP9) by ffmpeg with bit-exact flags. No browser and no random values. The same inputs write the same bytes. --export still writes the settled last frame as PNG and SVG.',
		formats: (Object.entries(VIDEO_FORMATS) as [VideoFormatId, (typeof VIDEO_FORMATS)[VideoFormatId]][]).map(([id, format]) => ({ id, width: format.width, height: format.height, ratio: format.ratio, use: format.use })),
		templates: (Object.entries(VIDEO_TEMPLATES) as [VideoTemplateId, (typeof VIDEO_TEMPLATES)[VideoTemplateId]][]).map(([id, template]) => ({ id, description: template.description, required: template.required, optional: template.optional })),
		themes: themes().map(({ id, label, default: isDefault }) => ({ id, label, default: isDefault })),
		exports: ['apng', 'mp4', 'webm', 'png', 'svg', 'still'],
		encoders: { mp4: 'ffmpeg libx264, yuv420p, faststart', webm: 'ffmpeg libvpx-vp9', note: 'mp4 and webm need ffmpeg on the PATH.' },
		motion: 'One eased progress per frame from --ds-easing-out (a strong ease-out), never ease-in: pieces arrive in order and settle on the last frame, then hold. Icons and the mark never move.',
		timing: { fps: timing.fps, frameCount: timing.frameCount, durationMs: timing.durationMs, plays: timing.plays, durationToken: timing.durationToken, easingToken: timing.easingToken },
		defaults: { theme: defaultTheme(), out: '.ds/videos', export: ['apng'], footer: defaultFooter() },
	};
}
