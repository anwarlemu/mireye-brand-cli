import { brand } from '../lib/brand.js';
import { wireDrawing, wireScenes } from '../illustrate/wire.js';
import { defaultFooter, defaultTheme, leading } from '../image/catalog.js';
import { lockupSvg, lockupWidth } from '../image/logo.js';
import { coverSvg, loadPicture } from '../image/picture.js';
import { chamfer, contourSvg, diamond, groundColors } from '../image/poster.js';
import { CopyError, loadFaces, num, placeWords, requireGlyphs, setAt, wrapWords, type Fitted, type Font } from '../image/type.js';

// Documents: a one-pager, a case study, a report with its cover, as pages of A4 or US Letter. Blocks flow down the page
// and onto the next; a paragraph breaks between lines, never inside a word, and nothing is ever cut off. Built from the
// brand's type, ink, rules, diamonds, contours and wireframe drawings: the brand has no document design of its own.

export const PAGE_SIZES = { a4: { width: 1240, height: 1754, label: 'A4, 210 by 297 mm', pt: [595.28, 841.89] }, letter: { width: 1275, height: 1650, label: 'US Letter, 8.5 by 11 in', pt: [612, 792] } } as const;
export type PageSize = keyof typeof PAGE_SIZES;

export type Block =
	| { heading: string }
	| { text: string }
	| { stats: string }
	| { quote: string; attribution?: string }
	| { list: string }
	| { image: string; caption?: string };

export type DocumentInput = { size?: PageSize; cover?: boolean; eyebrow?: string; title: string; subtitle?: string; date?: string; scene?: string; ground?: string; url?: string; blocks: Block[] };

export type Page = { svg: string; words: { asked: string; drawn: string }[] };

const KEYS = ['heading', 'text', 'stats', 'quote', 'list', 'image'];

export function checkInput(raw: unknown): DocumentInput {
	const d = raw as DocumentInput;
	if (!d || typeof d !== 'object') throw new Error('A document is a JSON object: { "title": "...", "blocks": [ { "heading": "..." }, { "text": "..." } ] }.');
	if (typeof d.title !== 'string' || !d.title.trim()) throw new Error('A document needs a "title".');
	if (!Array.isArray(d.blocks)) throw new Error('A document needs "blocks": a list of { "heading" }, { "text" }, { "stats": "138 fields | 1 call" }, { "quote", "attribution" }, { "list": "a | b" } or { "image", "caption" }.');
	if (d.size && !(d.size in PAGE_SIZES)) throw new Error(`size is ${Object.keys(PAGE_SIZES).join(' or ')}.`);
	d.blocks.forEach((b, i) => {
		const keys = Object.keys(b);
		const kind = keys.find((k) => KEYS.includes(k));
		if (!kind) throw new Error(`Block ${i + 1} is none of ${KEYS.join(', ')}.`);
		const extra = keys.filter((k) => k !== kind && !(kind === 'quote' && k === 'attribution') && !(kind === 'image' && k === 'caption'));
		if (extra.length) throw new Error(`Block ${i + 1} (${kind}) does not take ${extra.join(', ')}.`);
		for (const k of keys) if (typeof (b as Record<string, unknown>)[k] !== 'string' || !String((b as Record<string, unknown>)[k]).trim()) throw new Error(`Block ${i + 1}: ${k} must be words.`);
	});
	return d;
}

export function drawDocument(input: DocumentInput, theme = defaultTheme()): Page[] {
	const page = PAGE_SIZES[input.size ?? 'a4'];
	const { width: W, height: H } = page;
	const c = groundColors('bone', theme);
	const f = loadFaces();
	const m = Math.round(W * 0.075);
	const k = W / 1240;
	const body = 22 * k;
	const small = 16 * k;
	const headTop = m + 36 * k + 48 * k;
	const footH = 60 * k;
	const pages: { parts: string[]; words: { asked: string; drawn: string }[] }[] = [];
	let y = 0;
	const url = input.url ?? defaultFooter();
	const newPage = () => {
		pages.push({ parts: [], words: [] });
		y = headTop;
	};
	const room = () => H - m - footH - y;
	const check = (font: Font, t: string, label: string) => requireGlyphs(font, t, label);
	const say = (asked: string, set: Fitted) => pages[pages.length - 1].words.push({ asked, drawn: set.drawn });
	const put = (svg: string) => pages[pages.length - 1].parts.push(svg);
	const colW = W - m * 2;

	/* the cover */
	if (input.cover) {
		pages.push({ parts: [], words: [] });
		const g = groundColors(input.ground ?? 'green', theme);
		put(`<rect width="${W}" height="${H}" fill="${g.bg}"/>`);
		put(contourSvg('dc', W, H, k, 'sparse', g.gridAlpha, g.grid));
		put(lockupSvg(f.sans, m, m, 36 * k, g.ink).svg);
		const scene = input.scene ?? 'datacenter';
		if (!wireScenes().includes(scene)) throw new Error(`Unknown scene "${scene}". Scenes: ${wireScenes().join(', ')}.`);
		const art = wireDrawing(scene, g.dark ? 'dark' : 'light');
		const aw = W * 0.9;
		put(`<g transform="translate(${num(W * 0.18)} ${num(H * 0.2)}) scale(${num(aw / art.width, 5)})">${art.inner}</g>`);
		let cy = H - m;
		const blocks: [string, Font, number, string][] = [];
		if (input.date) blocks.push([input.date, f.mono, small * 1.2, g.muted]);
		if (input.subtitle) blocks.push([input.subtitle, f.sans, body * 1.3, g.muted]);
		blocks.push([input.title, f.sans, 96 * k, g.ink]);
		if (input.eyebrow) blocks.push([input.eyebrow, f.mono, small * 1.2, g.ink]);
		for (const [t, font, size, color] of blocks) {
			check(font, t, 'cover');
			const set = setAt(font, t, size, { size, min: size, maxWidth: colW * 0.8, maxHeight: H * 0.3, leading: font === f.mono ? 1.3 : 1.05 }, false);
			if (!set) throw new CopyError(`"${t.slice(0, 40)}" does not fit the cover. Shorten it.`);
			cy -= set.height;
			put(`<rect x="${m - 20 * k}" y="${num(cy - 16 * k)}" width="${num(set.width + 40 * k)}" height="${num(set.height + 32 * k)}" fill="${g.bg}"/>`);
			put(placeWords(set, m, cy, color).svg);
			say(t, set);
			cy -= size * 0.8;
		}
	}

	newPage();
	/* the title of the first text page */
	if (!input.cover) {
		for (const [t, font, size, color] of [[input.eyebrow, f.mono, small * 1.2, c.muted], [input.title, f.sans, 64 * k, c.ink], [input.subtitle, f.sans, body * 1.25, c.muted]] as [string | undefined, Font, number, string][]) {
			if (!t) continue;
			check(font, t, 'title');
			const set = setAt(font, t, size, { size, min: size, maxWidth: colW, maxHeight: H * 0.3, leading: font === f.mono ? 1.3 : 1.08 }, false);
			if (!set) throw new CopyError(`"${t.slice(0, 40)}" does not fit the page. Shorten it.`);
			put(placeWords(set, m, y, color).svg);
			say(t, set);
			y += set.height + size * 0.5;
		}
		y += 24 * k;
	}

	const lines = (font: Font, text: string, size: number, lead: number, maxW: number) => {
		check(font, text, 'text');
		const w = wrapWords(font, text, size, maxW);
		if (w.broke) throw new CopyError(`A word in "${text.slice(0, 40)}" is wider than the page. Break it up.`);
		return w.lines;
	};
	/** A paragraph that may break between lines onto the next page. */
	const flow = (text: string, font: Font, size: number, color: string, lead: number, indent = 0) => {
		const all = lines(font, text, size, lead, colW - indent);
		const lh = size * lead;
		let i = 0;
		const drawnParts: string[] = [];
		while (i < all.length) {
			let fit = Math.floor(room() / lh);
			if (fit < 1 || (fit < 2 && all.length - i > 1)) {
				newPage();
				fit = Math.floor(room() / lh);
			}
			const take = all.slice(i, i + fit);
			const set = setAt(font, take.join(' '), size, { size, min: size, maxWidth: colW - indent, leading: lead }, false)!;
			put(placeWords(set, m + indent, y, color).svg);
			drawnParts.push(set.drawn);
			y += set.height;
			i += take.length;
		}
		pages[pages.length - 1].words.push({ asked: text, drawn: drawnParts.join(' ') });
	};
	const keep = (h: number) => {
		if (room() < h) newPage();
	};
	for (const b of input.blocks) {
		if ('heading' in b) {
			const set = setAt(f.sans, b.heading, 34 * k, { size: 34 * k, min: 34 * k, maxWidth: colW, leading: 1.15 }, false);
			check(f.sans, b.heading, 'heading');
			if (!set) throw new CopyError(`The heading "${b.heading.slice(0, 40)}" is too long. Shorten it.`);
			keep(set.height + body * 4);
			y += 18 * k;
			put(placeWords(set, m, y, c.ink).svg);
			say(b.heading, set);
			y += set.height + 14 * k;
		} else if ('text' in b) {
			flow(b.text, f.sans, body, c.ink, leading('body') * 1.05);
			y += body * 0.9;
		} else if ('list' in b) {
			for (const item of b.list.split('|').map((x) => x.trim()).filter(Boolean)) {
				keep(body * 1.6);
				put(diamond(m + 7 * k, y + body * 0.8, 5 * k, c.ink));
				flow(item, f.sans, body, c.ink, 1.45, 28 * k);
				y += body * 0.35;
			}
			y += body * 0.6;
		} else if ('stats' in b) {
			const items = b.stats.split('|').map((x) => x.trim()).filter(Boolean);
			if (items.length > 4) throw new CopyError('stats takes up to four, split by |.');
			const cw = (colW - 24 * k * (items.length - 1)) / items.length;
			const sets = items.map((it) => {
				const [n, ...rest] = it.split(' ');
				check(f.sans, it, 'stats');
				const big = setAt(f.sans, n, 56 * k, { size: 56 * k, min: 28 * k, maxWidth: cw, leading: 1 }, false);
				const label = rest.length ? setAt(f.sans, rest.join(' '), small, { size: small, min: small, maxWidth: cw, leading: 1.3 }, false) : undefined;
				if (!big || (rest.length && !label)) throw new CopyError(`The stat "${it}" does not fit its column. Shorten it.`);
				return { it, big, label };
			});
			const h = Math.max(...sets.map((s) => s.big.height + (s.label?.height ?? 0) + 12 * k)) + 30 * k;
			keep(h);
			put(`<rect x="${m}" y="${num(y)}" width="${colW}" height="${num(k)}" fill="${c.ink}" fill-opacity="0.32"/>`);
			sets.forEach((s, i) => {
				const x = m + i * (cw + 24 * k);
				put(placeWords(s.big, x, y + 18 * k, c.ink).svg);
				if (s.label) put(placeWords(s.label, x, y + 18 * k + s.big.height + 8 * k, c.muted).svg);
				pages[pages.length - 1].words.push({ asked: s.it, drawn: [s.big.drawn, s.label?.drawn].filter(Boolean).join(' ') });
			});
			y += h + 12 * k;
		} else if ('quote' in b) {
			const size = 30 * k;
			const all = lines(f.sans, b.quote, size, 1.3, colW - 48 * k);
			keep(Math.min(all.length, 3) * size * 1.3 + 40 * k);
			put(diamond(m + 10 * k, y + size * 0.65, 9 * k, c.ink));
			flow(b.quote, f.sans, size, c.ink, 1.3, 48 * k);
			if (b.attribution) {
				const set = setAt(f.mono, b.attribution, small, { size: small, min: small, maxWidth: colW - 48 * k, leading: 1.3 }, false);
				check(f.mono, b.attribution, 'attribution');
				if (!set) throw new CopyError('The attribution is too long. Shorten it.');
				keep(set.height + 10 * k);
				y += 10 * k;
				put(placeWords(set, m + 48 * k, y, c.muted).svg);
				say(b.attribution, set);
				y += set.height;
			}
			y += body * 1.2;
		} else {
			const pic = loadPicture(b.image);
			const iw = colW;
			const ih = Math.min((iw * pic.height) / pic.width, (H - headTop - m - footH) * 0.6);
			const cap = b.caption ? setAt(f.mono, b.caption, small, { size: small, min: small, maxWidth: colW, leading: 1.3 }, false) : undefined;
			if (b.caption && !cap) throw new CopyError('The caption is too long. Shorten it.');
			keep(ih + (cap ? cap.height + 12 * k : 0));
			const box = { x: m, y, w: iw, h: ih };
			put(`${coverSvg(pic, box, `im${pages.length}${Math.round(y)}`, `<path d="${chamfer(box.x, box.y, box.w, box.h, 14 * k)}"/>`)}<path d="${chamfer(box.x, box.y, box.w, box.h, 14 * k)}" fill="none" stroke="${c.ink}" stroke-opacity="0.32" stroke-width="${num(1.5 * k)}"/>`);
			y += ih + 10 * k;
			if (cap) {
				put(placeWords(cap, m, y, c.muted).svg);
				say(b.caption!, cap);
				y += cap.height;
			}
			y += body;
		}
	}
	const total = pages.length;
	return pages.map((p, i) => {
		const cover = input.cover && i === 0;
		const chrome = cover
			? ''
			: `${lockupSvg(f.sans, m, m, 28 * k, c.ink).svg}<rect x="${m}" y="${num(H - m - footH + 20 * k)}" width="${colW}" height="${num(k)}" fill="${c.ink}" fill-opacity="0.32"/>${placeWords(setAt(f.mono, url, small, { size: small, min: small, maxWidth: colW / 2, leading: 1.2 }, true)!, m, H - m - footH + 34 * k, c.muted).svg}${(() => {
					const n = setAt(f.mono, `${i + 1} / ${total}`, small, { size: small, min: small, maxWidth: colW / 2, leading: 1.2 }, true)!;
					return placeWords(n, W - m - n.width, H - m - footH + 34 * k, c.muted).svg;
				})()}`;
		return {
			svg: `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img">
<title>${input.title.replace(/&/g, '&amp;').replace(/</g, '&lt;')}, page ${i + 1}</title>
${cover ? '' : `<rect width="${W}" height="${H}" fill="${c.bg}"/>`}${p.parts.join('')}${chrome}
</svg>
`,
			words: p.words,
		};
	});
}

export const documentSample = (): DocumentInput => ({
	size: 'a4',
	eyebrow: 'Case study',
	title: 'How Acme sites data centers with cited parcel data',
	subtitle: 'One API call per site instead of ten lookups.',
	blocks: [
		{ stats: '138 fields per site | 1 call per batch | 0 uncited values' },
		{ heading: 'The problem' },
		{ text: 'Acme’s siting team checked ownership, flood risk, terrain and grid access for every candidate site by hand, across ten sources. A shortlist took days, and no answer said where it came from.' },
		{ heading: 'What changed' },
		{ list: 'Every candidate site goes through one batch call | Each field comes back with its source | A bad address does not fail the rest' },
		{ quote: 'We sent hundreds of locations in one call, and one bad address did not fail the rest.', attribution: 'Head of data, Acme' },
	],
});

