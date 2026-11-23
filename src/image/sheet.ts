import { defaultFooter, leading, sizeInfo, type ImageContent, type Size, type TemplateId } from './catalog.js';
import { anchored, bottom, checkEdits, cross, editOf, frameOf, inflate, largest, LayoutError, meets, over, right, settle, shift, type DrawnLayer, type Edits, type Rect } from './layers.js';
import { lockupSvg, lockupWidth } from './logo.js';
import { coverSvg, loadPicture } from './picture.js';
import { diamond, groundColors, imageDocument, posterFloors, type Crop, type Drawing } from './poster.js';
import { fitOrFail, loadFaces, num, placeWords, requireGlyphs, setAt, type Fitted, type Font, type Placed } from './type.js';
import { wireDrawing, wireScenes } from '../illustrate/wire.js';

// The cut-frame sheets: one ground, a hairline frame with its corner cut, the lockup, the words, a mono address and a
// tick row. Tall pictures stack them (the words stand on the footer rule); banners set the words at the left and the
// lockup over the address at the right. Words are set whole: they step down and re-wrap, then the command says so.

export type SheetRequest = { template: TemplateId; size: Size; ground: string; theme: string; content: ImageContent; edits?: Edits; sample?: boolean; crop?: Crop };

export function cutPoly(x: number, y: number, w: number, h: number, cut: number): string {
	const c = Math.max(0, Math.min(cut, w / 3, h / 3));
	return `M${num(x + c)} ${num(y)}H${num(x + w)}V${num(y + h)}H${num(x)}V${num(y + c)}Z`;
}

/** A hairline cut frame. The stroke is a filled band, so the diagonal matches the straight edges. Antialiased, so the 45° cut does not stair. */
export function cutFrame(x: number, y: number, w: number, h: number, cut: number, color: string, stroke = 2): string {
	const innerCut = cut + stroke * (Math.SQRT2 - 1);
	const outer = cutPoly(x, y, w, h, cut);
	const inner = `M${num(x + innerCut)} ${num(y + stroke)}H${num(x + w - stroke)}V${num(y + h - stroke)}H${num(x + stroke)}V${num(y + innerCut)}Z`;
	return `<path d="${outer}${inner}" fill="${color}" fill-rule="evenodd"/>`;
}

export function ticks(x: number, y: number, count: number, pitch: number, height: number, on: number, ink: string, off: string): string {
	let body = '';
	for (let i = 0; i < count; i++) body += `<rect x="${num(x + i * pitch)}" y="${num(y)}" width="1" height="${num(height)}" fill="${i < on ? ink : off}" shape-rendering="crispEdges"/>`;
	return body;
}

const ANCHORS: NonNullable<DrawnLayer['can']['anchors']> = ['top-left', 'top', 'top-right', 'left', 'center', 'right', 'bottom-left', 'bottom', 'bottom-right'];
const words = (hide: boolean): DrawnLayer['can'] => ({ move: true, scale: [0.6, 1.6], align: true, hide, anchors: ANCHORS });

export function sheetCan(template: string): Record<string, DrawnLayer['can']> {
	const base: Record<string, DrawnLayer['can']> = { panel: {}, logo: { move: true, scale: [0.8, 2], hide: true, anchors: ['top-left', 'top-right'] }, footer: { move: true, scale: [1, 1.8], hide: true } };
	if (template === 'quote') return { ...base, quote: words(false), attribution: { scale: [0.8, 1.6], hide: true } };
	if (template === 'frame') return { ...base, headline: { scale: [0.6, 1.5], align: true, hide: true }, body: { scale: [0.8, 1.5], align: true, hide: true }, picture: {}, art: { scale: [0.4, 1] } };
	return { ...base, headline: words(false), ...(template === 'headline' ? {} : { body: { scale: [0.7, 1.6], align: true, hide: true } as DrawnLayer['can'] }), ...(template === 'announcement' ? { badge: { scale: [0.8, 1.8], hide: true } as DrawnLayer['can'] } : {}) };
}

type Item = { id: string; asked: string; set: Fitted; color: string; gap: number; align: 'left' | 'center' | 'right' };

export function sheetDraw(req: SheetRequest): Drawing {
	const { template, content, size } = req;
	const c = groundColors(req.ground, req.theme);
	const f = loadFaces();
	const edits = req.edits ?? {};
	const can = sheetCan(template);
	const F = frameOf(size, posterFloors());
	const { W, H } = F;
	const where = `${template} at ${size.id === 'custom' ? `${W}x${H}` : size.id}`;
	if (size.id === 'avatar') throw new LayoutError(`avatar holds the mark alone: use identity. ${template} has words, which no profile picture shows at a readable size.`);
	const info = sizeInfo(size);
	const bleedSafe = Boolean(info.safe);
	const V = F.stage;
	const banner = V.w / V.h >= 2.4;
	const scaleOf = (id: string) => editOf(edits, id).scale ?? 1;
	const hidden = (id: string) => Boolean(edits[id]?.hidden);
	const moved = (id: string, r: Rect) => shift(r, (editOf(edits, id).dx ?? 0) * W, (editOf(edits, id).dy ?? 0) * H);
	const layers: DrawnLayer[] = [];
	const parts: string[] = [];
	const report = (l: Omit<DrawnLayer, 'can'>) => layers.push({ ...l, can: can[l.id] ?? {} });
	const line = over(c.grid, c.dark ? 0.34 : 0.3, c.bg);
	const muted = c.muted;
	let ids = 0;

	/* the frame */
	const short = Math.min(V.w, V.h * 1.6);
	const k = short / 1008;
	const pad = banner ? Math.max(8, V.h * 0.045) : (short * 36) / 1008;
	const cut = banner ? V.h * 0.09 : 28 * k;
	const inner = banner ? V.h * 0.09 : 46 * k;
	const outer: Rect = bleedSafe ? cross(inflate(F.live, 0), V) : { x: pad, y: pad, w: W - pad * 2, h: H - pad * 2 };
	const room = cross(inflate(outer, -inner), F.live);
	parts.push(cutFrame(outer.x, outer.y, outer.w, outer.h, cut, line, Math.max(1, 2 * Math.min(1.4, k))));
	report({ id: 'panel', kind: 'panel', box: outer });

	/* the lockup */
	const clearK = imageDocument().logoRules.clear;
	const mh = Math.max(F.mark, banner ? Math.min(V.h * 0.13, 44) : 28 * k) * scaleOf('logo');
	const lw = lockupWidth(f.sans, mh);
	const logoAnchor = editOf(edits, 'logo').anchor ?? 'top-right';
	const logo = hidden('logo') ? undefined : moved('logo', anchored(room, lw, mh, logoAnchor));
	const clear = mh * clearK;
	if (logo) {
		parts.push(lockupSvg(f.sans, logo.x, logo.y, mh, c.ink).svg);
		report({ id: 'logo', kind: 'logo', box: logo, over: ['panel'], logo: { clear, min: F.mark } });
	}

	/* the address */
	const footText = hidden('footer') ? '' : content.footer || defaultFooter();
	const footSize = Math.max(F.small, (banner ? 0 : 16 * k) * 1) * scaleOf('footer');
	let footTop = bottom(room);
	let bodyArea: Rect;
	const avoid = F.avoid.map((a) => inflate(a, 8 * k));
	if (banner) {
		// The right column holds the lockup over the address; the words take the rest.
		const foot = footText ? fitOrFail(f.mono, footText, { size: footSize, min: F.small, maxWidth: room.w * 0.34, maxHeight: room.h - (logo ? mh + clear * 2 : 0), leading: leading('body') }, 'footer', where) : undefined;
		const colW = Math.max(logo ? lw : 0, foot?.width ?? 0);
		if (foot) {
			const at = moved('footer', settle({ x: right(room) - foot.width, y: bottom(room) - foot.height, w: foot.width, h: foot.height }, avoid, room, ['up', 'left']) ?? { x: right(room) - foot.width, y: bottom(room) - foot.height, w: foot.width, h: foot.height });
			drawFoot(foot, at);
		}
		const page = pageSet();
		if (page) drawPage(page, { x: right(room) - page.width, y: (logo && logoAnchor === 'top-right' ? bottom(logo) + clear : room.y), w: page.width, h: page.height });
		const gap = Math.max(clear, inner);
		const logoLeft = logoAnchor === 'top-left';
		bodyArea = { x: room.x, y: room.y, w: room.w - colW - gap, h: room.h };
		if (logo && logoLeft) bodyArea = { ...bodyArea, w: room.w - (foot ? foot.width + gap : 0), y: room.y + mh + clear, h: room.h - mh - clear };
	} else {
		const foot = footText ? fitOrFail(f.mono, footText, { size: footSize, min: F.small, maxWidth: room.w, maxLines: 2, leading: leading('body') }, 'footer', where) : undefined;
		const below = Math.max(14, 17 * k);
		if (foot) {
			const at = { x: room.x, y: bottom(room) - foot.height, w: foot.width, h: foot.height };
			const ruleY = at.y - below;
			parts.push(`<path d="M${num(room.x)} ${num(ruleY)}H${num(right(room))}" stroke="${line}" stroke-width="${num(Math.max(1, k), 2)}" shape-rendering="crispEdges"/>`);
			const count = 18;
			const pitch = 6 * Math.max(1, k);
			const w = (count - 1) * pitch + 1;
			const page = pageSet();
			if (page) drawPage(page, { x: right(room) - page.width, y: bottom(room) - page.height, w: page.width, h: page.height });
			else if (foot.width + 32 * k + w <= room.w) parts.push(ticks(right(room) - w, at.y + foot.height / 2 - footSize * 0.45, count, pitch, Math.round(footSize * 0.9), 7, c.ink, line));
			drawFoot(foot, moved('footer', at));
			footTop = ruleY - Math.max(16, 20 * k);
		}
		const top = logo ? bottom(logo) + Math.max(clear, 24 * k) : room.y;
		bodyArea = { x: room.x, y: Math.max(room.y, top), w: room.w, h: footTop - Math.max(room.y, top) };
	}
	// Words keep out of a corner the platform covers: the largest clear part of the body.
	if (avoid.some((a) => meets(a, bodyArea))) bodyArea = largest(bodyArea, avoid);

	if (template === 'frame') return frameSheet();

	/* the words */
	const tight = leading('tight');
	const main = template === 'quote' ? 'quote' : 'headline';
	const text = template === 'quote' ? content.quote! : content.title!;
	requireGlyphs(f.sans, text, main === 'quote' ? 'quote' : 'headline');
	const base = Math.max(F.large, banner ? V.h * 0.2 : (template === 'quote' ? 44 : 64) * k * (V.h > V.w * 1.15 ? 1.4 : V.h > V.w * 0.87 ? 1.2 : 1));
	const subText = template !== 'quote' && template !== 'headline' && !hidden('body') ? content.subtitle : undefined;
	const badgeText = template === 'announcement' && !hidden('badge') ? content.kicker : undefined;
	const byText = template === 'quote' && !hidden('attribution') ? content.attribution : undefined;
	for (const [label, t, font] of [['line under the headline (--body)', subText, f.sans], ['badge', badgeText, f.mono], ['attribution', byText, f.mono]] as [string, string | undefined, Font][]) if (t) requireGlyphs(font, t, label);
	const align = editOf(edits, main).align ?? 'left';
	const stack = (big: number, breaks: boolean): Item[] | undefined => {
		const r = Math.max(5, big * 0.16);
		const inset = template === 'quote' ? r * 2 + big * 0.42 : 0;
		const ratio = big / base;
		const items: Item[] = [];
		let left = bodyArea.h;
		const push = (id: string, asked: string, font: Font, sz: number, lead: number, color: string, gap: number, o: { tracking?: number; breaks?: boolean } = {}) => {
			const set = setAt(font, asked, sz, { size: sz, min: sz, maxWidth: bodyArea.w - inset, maxHeight: 1e9, leading: lead, tracking: o.tracking }, o.breaks ?? true);
			if (!set) return false;
			left -= set.height + (items.length ? gap : 0);
			items.push({ id, asked, set, color, gap: items.length ? gap : 0, align: editOf(edits, id).align ?? align });
			return left >= -0.5;
		};
		const small = Math.max(F.small, (banner ? V.h * 0.07 : 16 * k) * Math.min(1, ratio)) * scaleOf('badge');
		if (badgeText && !push('badge', badgeText, f.mono, small, leading('body'), muted, 0)) return undefined;
		if (badgeText && !banner) left -= small * 1.4;
		if (!push(main, text, f.sans, big, template === 'quote' ? leading('display') : tight, c.ink, badgeText ? big * (banner ? 0.16 : 0.42) : 0, { tracking: -0.01, breaks })) return undefined;
		if (subText && !push('body', subText, f.sans, Math.max(F.small, (banner ? V.h * 0.085 : 24 * k) * Math.min(1, ratio)) * scaleOf('body'), leading('body'), muted, Math.max(F.small * 0.6, 18 * k * Math.min(1, ratio)))) return undefined;
		if (byText && !push('attribution', byText, f.mono, Math.max(F.small, (banner ? V.h * 0.065 : 16 * k) * Math.min(1, ratio)) * scaleOf('attribution'), leading('body'), muted, Math.max(F.small * 0.7, 16 * k))) return undefined;
		return items;
	};
	const findAt = (): { items: Item[]; big: number } => {
		for (const breaks of [false, true])
			for (let big = breaks ? F.large : base; ; big = Math.max(F.large, big * 0.96)) {
				const items = stack(big, breaks);
				if (items) return { items, big };
				if (big <= F.large + 0.01) break;
			}
		// Name the words that are too many.
		for (const [label, t, font, share] of [['line under the headline (--body)', subText, f.sans, 0.45], ['attribution', byText, f.mono, 0.3], ['badge', badgeText, f.mono, 0.3]] as [string, string | undefined, Font, number][]) if (t) fitOrFail(font, t, { size: F.small, min: F.small, maxWidth: bodyArea.w, maxHeight: bodyArea.h * share, leading: leading('body') }, label, where);
		const others = [subText, byText, badgeText].filter(Boolean).length;
		fitOrFail(f.sans, text, { size: F.large, min: F.large, maxWidth: bodyArea.w, maxHeight: bodyArea.h * (others ? 0.5 : 0.98), leading: tight, tracking: -0.01 }, main, where);
		throw new LayoutError(`The words do not fit ${where}. Shorten them, or use a larger size or another layout.`);
	};
	let { items, big } = findAt();
	const want = scaleOf(main);
	if (want !== 1) {
		const next = stack(Math.max(F.large, big * want), false);
		if (!next) {
			let best = want;
			while (best > 0.5 && !stack(big * best, false)) best -= 0.05;
			throw new LayoutError(`${main} at ${want} does not fit ${where}. The largest that fits is about ${Math.floor(best * 20) / 20}.`);
		}
		items = next;
		big = Math.max(F.large, big * want);
	}
	const tickH = badgeText && !banner ? items[0].set.size * 1.4 : 0;
	const total = items.reduce((sum, it) => sum + it.set.height + it.gap, 0) + tickH;
	const widest = Math.max(...items.map((it) => it.set.width));
	const e = editOf(edits, main);
	const r = Math.max(5, big * 0.16);
	const inset = template === 'quote' ? r * 2 + big * 0.42 : 0;
	const blockAt = e.anchor ? anchored(bodyArea, widest + inset, total, e.anchor) : { x: bodyArea.x, y: banner ? bodyArea.y + (bodyArea.h - total) / 2 : bottom(bodyArea) - total, w: e.align ? bodyArea.w : widest + inset, h: total };
	const block = moved(main, blockAt);
	let y = block.y;
	for (const it of items) {
		y += it.gap;
		const p: Placed = placeWords(it.set, block.x + inset, y, it.color, it.align, Math.max(block.w - inset, it.set.width));
		parts.push(p.svg);
		if (it.id === 'quote') parts.push(diamond(block.x + r, p.ink[0].y + p.ink[0].h * 0.5, r, c.ink));
		report({ id: it.id, kind: 'text', box: p.box, ink: p.ink, over: ['panel'], text: { asked: it.asked, drawn: it.set.drawn, size: it.set.size, color: it.color, ground: [c.bg], sample: req.sample } });
		y += it.set.height;
		if (it.id === 'badge' && tickH) {
			parts.push(ticks(block.x, y + it.set.size * 0.4, 12, 6 * Math.max(1, k), Math.round(it.set.size * 0.7), 5, c.ink, line));
			y += tickH;
		}
	}
	return finish();

	function pageSet(): Fitted | undefined {
		return content.page ? setAt(f.mono, content.page.replace(/\s+/g, ''), footSize, { size: footSize, min: footSize, maxWidth: room.w, leading: leading('body') }, true) : undefined;
	}

	function drawPage(set: Fitted, at: Rect) {
		const p = placeWords(set, at.x, at.y, muted);
		parts.push(p.svg);
		report({ id: 'page', kind: 'text', box: p.box, ink: p.ink, over: ['panel'], text: { asked: content.page!.replace(/\s+/g, ''), drawn: set.drawn, size: set.size, color: muted, ground: [c.bg], own: true } });
	}

	function drawFoot(set: Fitted, at: Rect) {
		const p = placeWords(set, at.x, at.y, muted);
		parts.push(p.svg);
		report({ id: 'footer', kind: 'text', box: p.box, ink: p.ink, over: ['panel'], text: { asked: footText, drawn: set.drawn, size: set.size, color: muted, ground: [c.bg], own: !content.footer, sample: req.sample } });
	}

	function finish(): Drawing {
		checkEdits(edits, layers, where);
		return { svg: `<rect width="${W}" height="${H}" fill="${c.bg}"/>${parts.join('')}`, layers };
	}

	/** A headline and a picture (or a wireframe drawing) in a cut frame: under the words, or beside them on a banner. */
	function frameSheet(): Drawing {
		const t = hidden('headline') ? undefined : content.title;
		const s = hidden('body') ? undefined : content.subtitle;
		const beside = banner || (bodyArea.w / bodyArea.h > 1.9 && Boolean(t));
		const gap = Math.max(12, 20 * k);
		const headMax = Math.max(F.large, banner ? V.h * 0.16 : 46 * k);
		// The words take the share they need, up to a little over half; the picture has the rest.
		const areaAt = (share: number): Rect => (beside ? { ...bodyArea, w: t || s ? bodyArea.w * share : 0 } : { ...bodyArea, h: t || s ? bodyArea.h * share : 0 });
		const fitsAt = (a: Rect) => {
			const b = s ? setAt(f.sans, s, F.small * scaleOf('body'), { size: F.small, min: F.small, maxWidth: a.w, maxHeight: a.h, leading: leading('body') }, true) : undefined;
			if (s && !b) return false;
			return !t || Boolean(setAt(f.sans, t, F.large, { size: F.large, min: F.large, maxWidth: a.w, maxHeight: a.h - (b ? b.height + gap * 0.6 : 0), leading: leading('tight'), tracking: -0.01 }, true));
		};
		const textArea = areaAt([0.42, 0.5, 0.58, 0.64].find((n) => fitsAt(areaAt(n))) ?? 0.64);
		// At an asked scale the words are exactly that much larger or smaller than the layout sets them, or it says they do not fit.
		const at = (id: string, font: Font, asked: string, label: string, o: { size: number; min: number; maxHeight: number; leading: number; tracking?: number }): Fitted => {
			const base = fitOrFail(font, asked, { ...o, maxWidth: textArea.w }, label, where);
			const by = scaleOf(id);
			if (by === 1) return base;
			const big = setAt(font, asked, base.size * by, { ...o, size: base.size * by, min: base.size * by, maxWidth: textArea.w }, false);
			if (!big) throw new LayoutError(`${id} at ${by} does not fit ${where}. Make it smaller or shorten it.`);
			return big;
		};
		const sub = s ? at('body', f.sans, s, 'line under the headline (--body)', { size: Math.max(F.small, banner ? V.h * 0.075 : 20 * k), min: F.small, maxHeight: t ? Math.max(textArea.h * 0.45, textArea.h - F.large * leading('tight') * Math.ceil(t.length / 12) - gap) : textArea.h, leading: leading('body') }) : undefined;
		const head = t ? at('headline', f.sans, t, 'headline', { size: headMax, min: F.large, maxHeight: textArea.h - (sub ? sub.height + gap * 0.6 : 0), leading: leading('tight'), tracking: -0.01 }) : undefined;
		const textH = (head?.height ?? 0) + (head && sub ? gap * 0.6 : 0) + (sub?.height ?? 0);
		let ty = beside ? textArea.y + (textArea.h - textH) / 2 : textArea.y;
		for (const [id, set, color, asked] of [['headline', head, c.ink, t], ['body', sub, muted, s]] as [string, Fitted | undefined, string, string | undefined][]) {
			if (!set) continue;
			if (id === 'body' && head) ty += gap * 0.6;
			const p = placeWords(set, textArea.x, ty, color, editOf(edits, id).align ?? editOf(edits, 'headline').align ?? 'left', textArea.w);
			parts.push(p.svg);
			report({ id, kind: 'text', box: p.box, ink: p.ink, over: ['panel'], text: { asked: asked!, drawn: set.drawn, size: set.size, color, ground: [c.bg], sample: req.sample } });
			ty += set.height;
		}
		const plate: Rect = beside ? { x: textArea.x + textArea.w + (textArea.w ? gap : 0), y: bodyArea.y, w: bodyArea.w - textArea.w - (textArea.w ? gap : 0), h: bodyArea.h } : { x: bodyArea.x, y: textH ? ty + gap : bodyArea.y, w: bodyArea.w, h: bottom(bodyArea) - (textH ? ty + gap : bodyArea.y) };
		const pc = Math.max(10, Math.min(cut * 0.75, plate.h * 0.12));
		if (content.image) {
			const pic = loadPicture(content.image);
			parts.push(coverSvg(pic, plate, `plate${ids++}`, `<path d="${cutPoly(plate.x, plate.y, plate.w, plate.h, pc)}"/>`, req.crop));
			report({ id: 'picture', kind: 'picture', box: plate, over: ['panel'] });
		} else {
			const scene = content.scene ?? imageDocument().art.post;
			if (!wireScenes().includes(scene)) throw new LayoutError(`Unknown scene "${scene}" for frame. Scenes: ${wireScenes().join(', ')}.`);
			const art = wireDrawing(scene, c.dark ? 'dark' : 'light');
			const box = inflate(plate, -Math.min(plate.w, plate.h) * 0.07);
			const s2 = Math.min(box.w / art.width, box.h / art.height) * scaleOf('art');
			const at = anchored(box, art.width * s2, art.height * s2, 'center');
			parts.push(`<g transform="translate(${num(at.x)} ${num(at.y)}) scale(${num(s2, 5)})">${art.inner}</g>`);
			report({ id: 'art', kind: 'art', box: at, over: ['panel'] });
		}
		parts.push(cutFrame(plate.x, plate.y, plate.w, plate.h, pc, line, Math.max(1, 2 * Math.min(1.4, k))));
		return finish();
	}
}
