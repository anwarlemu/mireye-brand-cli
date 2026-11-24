import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { isAbsolute, join, resolve } from 'node:path';
import { cleanSlide, deckDoc, slideCan, slideDocument, SLIDE_SIZE, slideTypes, type Slide } from '../deck/slides.js';
import { imagesToPdf } from '../deck/pdf.js';
import { buildIllustration, STYLES, subjectsFor, WIRE_GROUNDS, type Style } from '../illustrate/build.js';
import { ISO_PRESETS } from '../illustrate/iso.js';
import { wireScenes } from '../illustrate/wire.js';
import { cleanContent, defaultTheme, FLAG, NOT_COPY, GROUNDS, isPoster, paletteFor, POSTERS, requireContent, SHEET_SAMPLES, sizeOf, sizesFor, templateFields, templateIds, TEMPLATES, themes, tokenHex, type ContentKey, type ImageContent, type Size, type TemplateId } from '../image/catalog.js';
import { encode, rasterize, rasterRgb } from '../image/encode.js';
import { over, type DrawnLayer } from '../image/layers.js';
import { groundColors, groundIds, imageDocument, posterCan, type Crop } from '../image/poster.js';
import { drawImage } from '../image/render.js';
import { sheetCan } from '../image/sheet.js';
import { glyphPaths, loadFaces, num } from '../image/type.js';
import { brand } from '../lib/brand.js';
import { merchDoc, merchItems, merchSlots, merchSvg, PX_PER_IN } from '../merch/merch.js';
import { cleanVideoContent, VIDEO_FORMATS, VIDEO_TEMPLATES, videoTiming, type VideoFormatId, type VideoTemplateId } from '../video/catalog.js';
import { videoFrame } from '../video/compose.js';
import { renderVideo } from '../video/render.js';
import { composeBlocks, drawCompose, recipeFor } from '../image/compose.js';
import { FORMATS } from '../image/catalog.js';
import { PLATFORMS } from './platforms.js';
import { pageSections, writePage, PAGE_FLAVORS } from '../page/page.js';
import type { Adapter, DesignDoc, Format, OptionValue, SheetSpec, TemplateInfo } from './index.js';

// This brand's side of the design core: what can be made, and how a document becomes the engine's own request. The theme
// of a design is its ground; the brand's own themes (api, enterprise) are the `edition` option.

type Out = { files: Record<string, Uint8Array>; layers: DrawnLayer[] };
type Build = { info: TemplateInfo; defaults(size: string): Pick<DesignDoc, 'size' | 'theme' | 'seed' | 'options'>; render(doc: DesignDoc, dir: string, out: { formats: Format[]; scale: number }): Promise<Out>; sample?: Record<string, string> };

const EDITION = () => ({ id: 'edition', values: themes().map((t) => t.id), description: 'the brand theme' });
const PICTURE = [
	{ id: 'zoom', range: [1, 3] as [number, number], description: 'closer in on the picture' },
	{ id: 'pan-x', range: [-1, 1] as [number, number], description: 'which part of the picture shows, left to right' },
	{ id: 'pan-y', range: [-1, 1] as [number, number], description: 'which part of the picture shows, top to bottom' },
];
const hexes = (ids: string[]) => Object.fromEntries(ids.map((id) => [id, groundColors(id).bg]));
const layersOf = (can: Record<string, DrawnLayer['can']>) => Object.entries(can).map(([id, c]) => ({ id, can: c }));
const at = (dir: string, file?: string) => (file === undefined ? undefined : isAbsolute(file) ? file : resolve(dir, file));
const text = (v: OptionValue | undefined) => (v === undefined ? undefined : String(v));
const cropOf = (o: DesignDoc['options']): Crop | undefined => (o.zoom === undefined && o['pan-x'] === undefined && o['pan-y'] === undefined ? undefined : { zoom: Number(o.zoom ?? 1), x: Number(o['pan-x'] ?? 0), y: Number(o['pan-y'] ?? 0) });
const SLOT: Record<string, string> = Object.fromEntries(Object.entries(FLAG).map(([key, flag]) => [flag, key]));
/** The copy slots of a template, by the names people pass. */
const words = (required: string[], optional: string[]) => {
	const not = NOT_COPY;
	return [...required.filter((k) => !not.has(k)).map((k) => ({ id: FLAG[k as ContentKey] ?? k, required: true })), ...optional.filter((k) => !not.has(k)).map((k) => ({ id: FLAG[k as ContentKey] ?? k }))];
};
const contentOf = (doc: DesignDoc, dir: string): ImageContent => {
	const c: Record<string, string> = {};
	for (const [slot, value] of Object.entries(doc.copy)) c[SLOT[slot] ?? slot] = value;
	if (doc.images.picture) c.image = at(dir, doc.images.picture)!;
	for (const slot of ['before', 'after']) if (doc.images[slot]) c[slot] = at(dir, doc.images[slot])!;
	if (doc.options.scene !== undefined) c.scene = String(doc.options.scene);
	return c as ImageContent;
};
const sampleOf = (copy: Record<string, string>) => Object.fromEntries(Object.entries(copy).filter(([k]) => !['scene', 'image', 'type', 'template'].includes(k)).map(([k, v]) => [FLAG[k as ContentKey] ?? k, v]));
const seedOf = (doc: DesignDoc) => doc.seed || undefined;
const SEEDED = new Set(['backdrop', 'identity', 'window', 'post', 'parcels', 'scene', 'tag', 'panel', 'app', 'partner']);
const IMAGE_FORMATS: Format[] = ['png', 'svg', 'jpg', 'webp', 'pdf'];

async function files(svg: string, width: number, out: { formats: Format[]; scale: number }): Promise<Record<string, Uint8Array>> {
	const kinds = out.formats.filter((f): f is 'png' | 'svg' | 'jpg' | 'webp' | 'pdf' => IMAGE_FORMATS.includes(f));
	return (await encode(svg, width, kinds, out.scale)) as Record<string, Uint8Array>;
}

/** Layout engines re-flow: when one layer changes, the words and drawings around it give way (art for a bigger
 * headline, the words for a moved logo). The logo, patterns and panels never move for others. */
function reflowsOf(layers: { id: string }[], boxed = false): Record<string, string[]> {
	// In a window or a tag the lockup and the panel are part of the words' block, so they give way with them.
	const fixed = new Set(['pattern', 'picture', 'page', ...(boxed ? [] : ['logo', 'panel'])]);
	const moving = layers.map((l) => l.id).filter((id) => !fixed.has(id));
	return Object.fromEntries(layers.map((l) => [l.id, moving.filter((id) => id !== l.id)]));
}

/* ------------------------------------------------------------- images */

function image(id: string): Build {
	const poster = isPoster(id);
	const fields = templateFields(id);
	const doc = poster ? POSTERS()[id] : TEMPLATES[id as TemplateId];
	const all = [...fields.required, ...fields.optional];
	const ground = poster ? POSTERS()[id].ground : 'bone';
	const scenes = id === 'scene' ? [...ISO_PRESETS] : wireScenes();
	return {
		info: {
			id,
			kind: 'image',
			description: doc.description,
			sizes: sizesFor(id),
			themes: groundIds(),
			copy: words(fields.required, fields.optional),
			images: [...(all.includes('image') ? [{ id: 'picture', required: fields.required.includes('image') }] : []), ...(['before', 'after'] as const).filter((k) => all.includes(k)).map((id) => ({ id, required: true }))],
			options: [EDITION(), ...(all.includes('scene') ? [{ id: 'scene', values: scenes, description: 'which drawing' }] : []), ...(all.includes('image') ? PICTURE : [])],
			layers: layersOf(poster ? posterCan(id) : sheetCan(id)),
			grounds: hexes(groundIds()),
			formats: IMAGE_FORMATS,
			reflows: reflowsOf(layersOf(poster ? posterCan(id) : sheetCan(id)), ['window', 'tag', 'partner'].includes(id)),
		},
		defaults: (size) => {
			const s = size === 'custom' ? { id: 'custom', width: 1200, height: 800 } : sizeOf(size);
			return { size: { id: s.id, width: s.width, height: s.height }, theme: ground, seed: SEEDED.has(id) && size !== 'avatar' ? 0 : undefined, options: {} };
		},
		async render(d, dir, out) {
			const content = cleanContent(contentOf(d, dir));
			requireContent(id, content, d.size.id);
			const drawn = drawImage({ template: id, size: d.size as Size, ground: d.theme, theme: text(d.options.edition), content, seed: seedOf(d), edits: d.layers, crop: cropOf(d.options) });
			return { files: await files(drawn.svg, d.size.width, out), layers: drawn.layers };
		},
		sample: sampleOf(poster ? POSTERS()[id].sample : (SHEET_SAMPLES()[id] ?? {})),
	};
}

/* ------------------------------------------------------------- slides */

/** Every slide type; the poster type once for each share-image layout, with that layout's own words and layers. */
function slide(type: string, poster?: string): Build {
	const s = deckDoc().slides[type];
	const size = SLIDE_SIZE();
	const fixed = poster ?? { statement: 'window', chart: 'chart', closing: 'identity' }[type];
	const p = poster ? POSTERS()[poster] : undefined;
	const required = p ? p.required : s.required;
	const optional = p ? p.optional : s.optional;
	const all = [...required, ...optional];
	const name = (k: string) => (k === 'label' ? 'badge' : k === 'progress' || k === 'images' || k === 'before' || k === 'after' || k === 'image' || k === 'scene' ? undefined : k);
	const slots = (keys: string[]) => keys.map(name).filter((k): k is string => Boolean(k));
	const scenes = poster === 'scene' ? [...ISO_PRESETS] : wireScenes();
	const sample = p ? p.sample : s.sample;
	return {
		info: {
			id: poster ? `slide-${poster}` : `slide-${type}`,
			kind: 'slide',
			description: `Slide: ${p ? p.description : s.description}`,
			sizes: ['slide'],
			themes: groundIds(),
			copy: words(slots(required), slots(optional)),
			images: [...(all.includes('image') ? [{ id: 'picture', required: required.includes('image') }] : []), ...(['before', 'after'] as const).filter((k) => all.includes(k)).map((id) => ({ id, required: true })), ...(all.includes('images') ? [1, 2, 3, 4].map((n) => ({ id: `picture-${n}`, required: n <= 2 })) : [])],
			options: [EDITION(), ...(all.includes('scene') ? [{ id: 'scene', values: scenes, description: 'which drawing' }] : []), ...(type === 'stat' ? [{ id: 'progress', range: [0, 1] as [number, number], description: 'the share of the tick row that is filled' }] : []), ...(all.includes('image') ? PICTURE : [])],
			layers: layersOf(slideCan(type, poster)),
			grounds: hexes(groundIds()),
			formats: IMAGE_FORMATS,
			reflows: reflowsOf(layersOf(slideCan(type, poster)), ['window', 'tag', 'partner'].includes(fixed ?? '')),
		},
		defaults: () => ({ size: { id: 'slide', width: size.width, height: size.height }, theme: p ? p.ground : s.ground, seed: fixed && SEEDED.has(fixed) ? 0 : undefined, options: {} }),
		async render(d, dir, out) {
			const raw: Record<string, unknown> = { type, ground: d.theme, ...(poster ? { template: poster } : {}) };
			for (const [slot, value] of Object.entries(d.copy)) raw[slot === 'badge' ? 'label' : (SLOT[slot] ?? slot)] = value;
			if (d.images.picture) raw.image = at(dir, d.images.picture);
			for (const k of ['before', 'after']) if (d.images[k]) raw[k] = at(dir, d.images[k]);
			const pics = [1, 2, 3, 4].map((n) => d.images[`picture-${n}`]).filter(Boolean).map((x) => at(dir, x));
			if (pics.length) raw.images = pics.join(' | ');
			if (d.options.scene !== undefined) raw.scene = String(d.options.scene);
			if (d.options.progress !== undefined) raw.progress = String(d.options.progress);
			const clean: Slide = cleanSlide(raw, 0);
			const drawn = slideDocument(clean, text(d.options.edition) ?? defaultTheme(), d.layers, false, seedOf(d), cropOf(d.options));
			return { files: await files(drawn.svg, size.width, out), layers: drawn.layers };
		},
		sample: Object.fromEntries(Object.entries(sampleOf(sample)).filter(([k]) => k !== 'progress').map(([k, v]) => [k === 'label' ? 'badge' : k, v])),
	};
}

/* -------------------------------------------------------------- merch */

/** Merch is laid out at 100 pixels an inch; --scale 3 writes the 300 dpi PNG. The SVG and PDF are the real size. */
const PER_IN = 100;

function merch(item: ReturnType<typeof merchItems>[number]): Build {
	const k = PER_IN / PX_PER_IN;
	const W = Math.round((item.size[0] + item.bleed * 2) * PER_IN);
	const H = Math.round((item.size[1] + item.bleed * 2) * PER_IN);
	const art = item.layers.some((l) => l.type === 'wire' || l.type === 'poster');
	const variants = merchDoc().variants;
	const printed = item.variants.every((v) => variants[v].ground);
	const s = (r: { x: number; y: number; w: number; h: number }) => ({ x: r.x * k, y: r.y * k, w: r.w * k, h: r.h * k });
	return {
		info: {
			id: `merch-${item.id}`,
			kind: 'merch',
			description: `${item.name}, ${item.size[0]} x ${item.size[1]} in with ${item.bleed} in bleed. PNG at 100 dpi (--scale 3 for 300); SVG${printed ? ' and PDF' : ''} at real size.`,
			sizes: ['print'],
			themes: item.variants,
			copy: merchSlots(item).map((x) => ({ id: x.id, required: x.required || undefined })),
			images: [],
			options: [EDITION(), ...(art ? [{ id: 'scene', values: wireScenes(), description: 'which drawing' }] : [])],
			layers: [],
			grounds: Object.fromEntries(item.variants.filter((v) => variants[v].ground).map((v) => [v, groundColors(variants[v].ground!).bg])),
			formats: printed ? ['png', 'svg', 'pdf'] : ['png', 'svg'],
			layouts: [item.id],
		},
		defaults: () => ({ size: { id: 'print', width: W, height: H }, theme: item.variants[0], seed: art ? 0 : undefined, options: {} }),
		async render(d, _dir, out) {
			const drawn = merchSvg({ item, variant: d.theme!, slots: d.copy, theme: text(d.options.edition), scene: text(d.options.scene), seed: seedOf(d) });
			const made: Record<string, Uint8Array> = {};
			for (const f of out.formats) {
				if (f === 'svg') made.svg = Buffer.from(drawn.svg);
				else if (f === 'png') made.png = await rasterize(drawn.printSvg, Math.round(W * out.scale));
				else if (f === 'pdf') made.pdf = imagesToPdf([{ ...(await rasterRgb(drawn.printSvg, drawn.widthPx)), trim: item.bleed * 72 }], drawn.widthIn * 72);
			}
			const layers = drawn.layers.map((l): DrawnLayer => ({ ...l, box: s(l.box), ink: l.ink?.map(s), text: l.text && { ...l.text, size: l.text.size * k }, logo: l.logo && { clear: l.logo.clear * k, min: l.logo.min * k }, can: {} }));
			return { files: made, layers };
		},
		sample: Object.fromEntries(merchSlots(item).filter((x) => !merchDoc().slots[x.id]?.own).map((x) => [x.id, merchDoc().slots[x.id].text])),
	};
}

/* ------------------------------------------------------ illustrations */

const TILE = { width: 1536, height: 1024 };

function illustration(style: Style): Build {
	const grounds = style === 'wire' ? [...WIRE_GROUNDS] : groundIds();
	const subjects = subjectsFor(style);
	const about: Record<Style, string> = {
		wire: 'A wireframe scene from the brand illustration skill.',
		iso: 'A quick isometric line drawing.',
		contours: 'The topographic contour field.',
		trace: 'Your picture traced as contours.',
	};
	const frames: Record<string, { width: number; height: number }> = { tile: TILE };
	for (const id of ['og', 'square', 'portrait', 'story', 'landscape', 'x-banner']) frames[id] = sizeOf(id);
	const range = (id: string, lo: number, hi: number, description: string) => ({ id, range: [lo, hi] as [number, number], description });
	return {
		info: {
			id: `illustration-${style}`,
			kind: 'illustration',
			description: about[style],
			sizes: [...Object.keys(frames), 'custom'],
			themes: grounds,
			copy: [],
			images: style === 'trace' ? [{ id: 'picture', required: true }] : [],
			options: [
				EDITION(),
				...(subjects.length ? [{ id: 'scene', values: subjects, description: 'which drawing' }] : []),
				...(style === 'contours' ? [] : [range('fill', 20, 95, 'how much of the frame the drawing fills, in percent')]),
				...(style === 'iso' ? [range('count', 1, 24, 'how many houses, rows, racks or tools')] : []),
				...(style === 'trace' ? [range('levels', 2, 40, 'contour levels'), range('detail', 16, 600, 'sampling width'), range('smooth', 0, 12, 'blur before tracing'), { id: 'invert', values: ['true', 'false'], description: 'dark areas are high ground' }] : []),
			],
			layers: [],
			grounds: hexes(grounds),
			layouts: [style],
			formats: IMAGE_FORMATS,
		},
		defaults: (size) => {
			const f = frames[size] ?? { width: 1200, height: 800 };
			return { size: { id: size, width: f.width, height: f.height }, theme: style === 'wire' ? 'green' : 'bone', seed: undefined, options: style === 'contours' ? {} : { fill: style === 'trace' ? 92 : 72, ...(style === 'iso' ? { count: 4 } : {}), ...(style === 'trace' ? { levels: 12, smooth: 4 } : {}) } };
		},
		async render(d, dir, out) {
			const o = d.options;
			const n = (v: OptionValue | undefined) => (v === undefined ? undefined : Number(v));
			const drawn = await buildIllustration({ style, subject: text(o.scene) ?? subjects[0] ?? undefined, ground: d.theme!, theme: text(o.edition), image: at(dir, d.images.picture), count: n(o.count), levels: n(o.levels), detail: n(o.detail), smooth: n(o.smooth), invert: o.invert === true || o.invert === 'true', frame: { width: d.size.width, height: d.size.height, fill: (n(o.fill) ?? 72) / 100 }, background: true });
			return { files: await files(drawn.svg, d.size.width, out), layers: [] };
		},
	};
}

/* -------------------------------------------------------------- video */

const CLIP: Record<string, VideoFormatId> = { square: 'square', story: 'vertical', landscape: 'landscape' };

/** Every clip; the poster reveal once for each share-image layout. */
function video(template: VideoTemplateId, poster?: string): Build {
	const t = VIDEO_TEMPLATES[template];
	const p = poster ? POSTERS()[poster] : undefined;
	const required = p ? p.required : (t.required as readonly string[]);
	const optional = p ? p.optional : (t.optional as readonly string[]);
	const all = [...required, ...optional];
	const scenes = poster === 'scene' ? [...ISO_PRESETS] : wireScenes();
	return {
		info: {
			id: `video-${poster ?? template}`,
			kind: 'video',
			description: `Clip: ${p ? `${p.description} Revealed left to right.` : t.description} The PNG is the settled last frame; --format mp4 writes the clip.`,
			sizes: Object.keys(CLIP),
			themes: p ? groundIds() : ['bone'],
			copy: words([...required], [...optional]),
			images: [...(all.includes('image') ? [{ id: 'picture', required: required.includes('image') }] : []), ...(['before', 'after'] as const).filter((k) => all.includes(k)).map((id) => ({ id, required: true })), ...(all.includes('images') ? [1, 2, 3, 4].map((n) => ({ id: `picture-${n}`, required: n === 1 })) : [])],
			options: [EDITION(), ...(all.includes('scene') ? [{ id: 'scene', values: scenes, description: 'which drawing' }] : [])],
			layers: [],
			grounds: hexes(p ? groundIds() : ['bone']),
			formats: ['png', 'svg', 'mp4'],
		},
		defaults: (size) => {
			const f = VIDEO_FORMATS[CLIP[size] ?? 'square'];
			return { size: { id: size, width: f.width, height: f.height }, theme: p ? p.ground : 'bone', seed: poster && SEEDED.has(poster) ? 0 : undefined, options: {} };
		},
		async render(d, dir, out) {
			const raw: Record<string, string> = { ...(contentOf(d, dir) as Record<string, string>) };
			const pics = [1, 2, 3, 4].map((n) => d.images[`picture-${n}`]).filter(Boolean).map((x) => at(dir, x)!);
			if (pics.length) raw.images = pics.join(' | ');
			if (poster) raw.poster = poster;
			const content = cleanVideoContent(template, raw) as ImageContent & { poster?: string; ground?: string };
			if (poster) content.ground = d.theme;
			const format = CLIP[d.size.id] ?? 'square';
			const theme = text(d.options.edition) ?? defaultTheme();
			const count = videoTiming().frameCount;
			const last = videoFrame(format, template, theme, content, count - 1, count, seedOf(d));
			const made: Record<string, Uint8Array> = {};
			if (out.formats.includes('svg')) made.svg = Buffer.from(last.svg);
			if (out.formats.includes('png')) made.png = await rasterize(last.svg, Math.round(d.size.width * out.scale));
			if (out.formats.includes('mp4')) {
				const tmp = mkdtempSync(join(tmpdir(), 'ds-clip-'));
				try {
					await renderVideo({ format, template, theme, content, exports: ['mp4'], outDir: tmp, name: 'clip', seed: seedOf(d) });
					made.mp4 = readFileSync(join(tmp, 'clip.mp4'));
				} finally {
					rmSync(tmp, { recursive: true, force: true });
				}
			}
			return { files: made, layers: last.layers.map((l) => ({ ...l, can: {} })) };
		},
		sample: p ? sampleOf(p.sample) : undefined,
	};
}

/* ------------------------------------------------------------ compose */

/** Every size a compose design can take: the image sizes first, then the shared platforms this CLI has no layout for. */
function composeSizes(): string[] {
	const first = ['og', 'square', 'portrait', 'story'];
	return [...new Set([...first, ...Object.keys(FORMATS), ...PLATFORMS.map((p) => p.id)]), 'custom'];
}

function composeDefaults(size: string): Pick<DesignDoc, 'size' | 'theme' | 'seed' | 'options'> {
	const f = FORMATS[size] ?? PLATFORMS.find((p) => p.id === size);
	const s = f ? { width: f.width, height: f.height } : { width: 1200, height: 800 };
	return { size: { id: size, ...s }, theme: 'bone', seed: 0, options: {} };
}

async function renderCompose(doc: DesignDoc, dir: string, out: { formats: Format[]; scale: number }): Promise<Out> {
	const drawn = drawCompose(doc, dir);
	const { width, height } = doc.size;
	const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img">\n<title>${brand().name}</title>\n${drawn.svg}\n</svg>\n`;
	return { files: await files(svg, width, out), layers: drawn.layers };
}

/* ------------------------------------------------------------ adapter */

let builds: Map<string, Build> | undefined;
function all(): Map<string, Build> {
	if (builds) return builds;
	const posters = Object.keys(POSTERS());
	// Slides that already are a poster layout (statement, chart, closing) keep their own names.
	const own = new Set(['window', 'chart', 'identity']);
	const list = [
		...templateIds().map(image),
		...slideTypes().flatMap((type) => (type === 'poster' ? posters.filter((p) => !own.has(p)).map((p) => slide('poster', p)) : [slide(type)])),
		...merchItems().map(merch),
		...STYLES.map(illustration),
		...(Object.keys(VIDEO_TEMPLATES) as VideoTemplateId[]).flatMap((t) => (t === 'poster' ? posters.map((p) => video('poster', p)) : [video(t)])),
	];
	builds = new Map(list.map((b) => [b.info.id, b]));
	return builds;
}
const build = (id: string): Build => {
	const b = all().get(id);
	if (!b) throw new Error(`Unknown template ${id}.`);
	return b;
};

/** Every color words may be drawn in or on: the grounds, inks and tags of every ground and brand theme. */
export function wordColors(): string[] {
	const out = new Set<string>();
	for (const { id: theme } of themes()) {
		for (const g of Object.keys(GROUNDS())) {
			const c = groundColors(g, theme);
			for (const hex of [c.bg, c.ink, c.muted, c.window, c.windowInk, c.windowMuted]) out.add(hex);
		}
		const p = paletteFor(theme);
		for (const hex of [p.ground, p.ink, p.secondary]) out.add(hex);
		const doc = imageDocument();
		const bg = tokenHex(doc.app.bg, theme);
		const ink = tokenHex(doc.app.ink, theme);
		out.add(bg).add(ink).add(over(ink, 0.08, bg));
		// Words on a picture: its shade over the darkest and the lightest a picture can be.
		const shade = tokenHex(doc.photo.shade.token, theme);
		out.add(shade).add(over(shade, doc.photo.shade.alpha, '#FFFFFF'));
		for (const t of ['--ds-color-forest', '--ds-color-bone', '--ds-color-text-inverse-muted', '--ds-color-white', '--ds-color-black']) out.add(tokenHex(t, theme));
	}
	return [...out];
}

export function adapter(): Adapter {
	return {
		brand: brand().bin,
		templates: () => [...all().values()].map((b) => b.info),
		defaults: (template, size) => (template === 'compose' ? composeDefaults(size) : build(template).defaults(size)),
		render: (doc, dir, out) => (doc.template === 'compose' ? renderCompose(doc, dir, out) : build(doc.template).render(doc, dir, out)),
		compose: {
			blocks: composeBlocks,
			themes: groundIds(),
			grounds: hexes(groundIds()),
			sizes: composeSizes(),
			formats: IMAGE_FORMATS,
			recipe: (template, size, copy) => recipeFor(template, size, copy),
		},
		page: { sections: pageSections, flavors: PAGE_FLAVORS, write: writePage },
		sample: (template) => build(template).sample ?? {},
		colors: wordColors,
		aliases: {
			sizes: { ...(imageDocument() as unknown as { sizes: { aliases: Record<string, string> } }).sizes.aliases, vertical: 'story' },
			themes: { light: 'bone', dark: 'green', forest: 'green', earth: 'brown' },
			templates: { logo: 'identity', iso: 'scene', isometric: 'scene', aerial: 'photo', ask: 'app', lockup: 'partner' },
			copy: { title: 'headline', subtitle: 'body', kicker: 'badge', label: 'badge' },
			layers: { callout: 'callout', contours: 'pattern', grid: 'pattern', drawing: 'art', parcels: 'art', window: 'panel', frame: 'panel' },
		},
	};
}

/** Contact sheets, with their labels set in the brand's own face. */
export async function paint(spec: SheetSpec): Promise<Uint8Array> {
	const f = loadFaces();
	const pics = spec.pictures.map((p) => `<image x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" preserveAspectRatio="none" href="data:image/png;base64,${Buffer.from(p.png).toString('base64')}"/><rect x="${p.x - 0.5}" y="${p.y - 0.5}" width="${p.w + 1}" height="${p.h + 1}" fill="none" stroke="${p.frame}"/>`);
	const labels = spec.labels.map((l) => glyphPaths(f.sans, l.text, l.size, l.x, l.y, l.color));
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${spec.width}" height="${spec.height}" viewBox="0 0 ${spec.width} ${spec.height}"><rect width="${num(spec.width)}" height="${num(spec.height)}" fill="${spec.background}"/>${pics.join('')}${labels.join('')}</svg>`;
	return rasterize(svg, spec.width);
}
