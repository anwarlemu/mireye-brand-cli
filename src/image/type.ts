import { existsSync, readFileSync } from 'node:fs';
import { create, type Font } from 'fontkit';
import { brand } from '../lib/brand.js';
import { pkgPath } from '../lib/paths.js';

export type { Font };

export type Faces = { sans: Font; mono: Font; medium: Font };

let faces: Faces | undefined;

function load(file: string): Font {
	const path = pkgPath('brand', 'fonts', file);
	if (!existsSync(path)) throw new Error(`Missing font file brand/fonts/${file}.`);
	return create(readFileSync(path));
}

/** Gilroy and DM Mono, read from the brand font files. Cached for the process. */
export function loadFaces(): Faces {
	if (faces) return faces;
	const local = brand().fonts.local?.files['400'];
	const medium = brand().fonts.local?.files['500'];
	const mono = brand().fonts.mono?.files['400'];
	if (!local || !mono) throw new Error('Imagery needs the brand sans and mono regular font files.');
	const sans = load(local);
	faces = { sans, mono: load(mono), medium: medium ? load(medium) : sans };
	return faces;
}

export function num(value: number, digits = 2): string {
	return value.toFixed(digits).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
}

/** Advance width of a line. `tracking` is letter spacing in em, added after every glyph as canvas does. */
export function measure(font: Font, text: string, size: number, tracking = 0): number {
	if (!text) return 0;
	const scale = size / font.unitsPerEm;
	let width = 0;
	const positions = font.layout(text).positions;
	for (const pos of positions) width += pos.xAdvance * scale + tracking * size;
	return width;
}

export type LineMetrics = { ascent: number; descent: number; lineHeight: number; em: number };

export function lineMetrics(font: Font, size: number, leading: number): LineMetrics {
	const scale = size / font.unitsPerEm;
	const ascent = font.ascent * scale;
	const descent = Math.abs(font.descent) * scale;
	const lineHeight = Math.round(size * leading);
	return { ascent, descent, lineHeight, em: ascent + descent };
}

/** Copy a layout cannot hold. The message says which words, what the limit is and what to do. */
export class CopyError extends Error {}

/** Characters the brand faces draw nothing for: control marks that only steer layout. */
const INVISIBLE = /[\u200b-\u200f\u2028-\u202e\u2060-\u2064\ufe00-\ufe0f\ufeff]/gu;

/** Throws when a face has no glyph for a character: it would be drawn as an empty box, which loses the word. */
export function requireGlyphs(font: Font, text: string, label: string) {
	const missing = [...new Set([...text.replace(INVISIBLE, '')].filter((ch) => !/\s/u.test(ch) && !font.hasGlyphForCodePoint(ch.codePointAt(0)!)))];
	if (missing.length) throw new CopyError(`The ${label} uses ${missing.slice(0, 8).map((ch) => `"${ch}"`).join(', ')}${missing.length > 8 ? ' and more' : ''}, which the brand typeface has no letters for. Rewrite it without ${missing.length === 1 ? 'that character' : 'those characters'}.`);
}

const cleanLine = (text: string) => text.replace(INVISIBLE, '').normalize('NFC');

export type Wrapped = { lines: string[]; broke: boolean; drawn: string };

/** Greedy wrap on spaces, keeping every word. A word wider than the column breaks on characters (`broke`). */
export function wrapWords(font: Font, text: string, size: number, maxWidth: number, tracking = 0): Wrapped {
	const lines: string[] = [];
	const glue: string[] = [];
	let broke = false;
	const push = (line: string, after: string) => {
		lines.push(line);
		glue.push(after);
	};
	for (const paragraph of cleanLine(text).split('\n')) {
		if (!paragraph.trim()) {
			push('', ' ');
			continue;
		}
		let current = '';
		for (const word of paragraph.split(/\s+/).filter(Boolean)) {
			const next = current ? `${current} ${word}` : word;
			if (measure(font, next, size, tracking) <= maxWidth) {
				current = next;
				continue;
			}
			if (current) push(current, ' ');
			if (measure(font, word, size, tracking) <= maxWidth) {
				current = word;
				continue;
			}
			// A joined name breaks after its own joints (data_center, a-b, a/b) before any letter.
			const bits = word.match(/[^_\-/]+[_\-/]*|[_\-/]+/g) ?? [word];
			if (bits.length > 1 && bits.every((bit) => measure(font, bit, size, tracking) <= maxWidth)) {
				let part = '';
				for (const bit of bits) {
					if (measure(font, part + bit, size, tracking) <= maxWidth) part += bit;
					else {
						push(part, '');
						part = bit;
					}
				}
				current = part;
				continue;
			}
			broke = true;
			let chunk = '';
			for (const char of [...word]) {
				const trial = chunk + char;
				if (!chunk || measure(font, trial, size, tracking) <= maxWidth) chunk = trial;
				else {
					push(chunk, '');
					chunk = char;
				}
			}
			current = chunk;
		}
		if (current) push(current, ' ');
	}
	return { lines: lines.length ? lines : [''], broke, drawn: lines.map((line, i) => line + (glue[i] ?? '')).join('').replace(/\s+/g, ' ').trim() };
}

export function wrap(font: Font, text: string, size: number, maxWidth: number, tracking = 0): string[] {
	return wrapWords(font, text, size, maxWidth, tracking).lines;
}

export type FitOptions = { size: number; min: number; maxWidth: number; maxHeight?: number; maxLines?: number; leading: number; tracking?: number };
export type Fitted = { font: Font; text: string; drawn: string; lines: string[]; size: number; line: number; leading: number; tracking: number; width: number; height: number; broke: boolean };

/** The words at one size, wrapped; undefined when they do not fit the box. A last line of one short word is balanced. */
export function setAt(font: Font, text: string, size: number, o: FitOptions, breakWords: boolean): Fitted | undefined {
	const tracking = o.tracking ?? 0;
	let w = wrapWords(font, text, size, o.maxWidth, tracking);
	if (w.broke && !breakWords) return undefined;
	const line = size * o.leading;
	const height = w.lines.length * line;
	if (w.lines.length > (o.maxLines ?? 99) || height > (o.maxHeight ?? 1e9) + 0.5) return undefined;
	// A line's width without the spacing measure adds after its last letter, so it is the width of its ink.
	const widths = () => w.lines.map((l) => measure(font, l, size, tracking) - (l ? tracking * size : 0));
	let ws = widths();
	if (!w.broke && w.lines.length > 1 && ws[ws.length - 1] < Math.max(...ws) * 0.34) {
		// Pull the column in, a step at a time, while the words still take the same number of lines.
		for (let width = o.maxWidth * 0.97; width > o.maxWidth * 0.6; width -= o.maxWidth * 0.03) {
			const tighter = wrapWords(font, text, size, width, tracking);
			if (tighter.broke || tighter.lines.length !== w.lines.length) break;
			w = tighter;
			ws = widths();
			if (ws[ws.length - 1] >= Math.max(...ws) * 0.5) break;
		}
	}
	return { font, text, drawn: w.drawn, lines: w.lines, size, line, leading: o.leading, tracking, width: Math.max(0, ...ws), height, broke: w.broke };
}

/** The largest size, from `size` down to `min`, at which every word fits; words break on characters only at the floor. */
export function fitWords(font: Font, text: string, o: FitOptions): Fitted | undefined {
	const min = Math.min(o.size, o.min);
	const step = Math.max(0.5, o.size * 0.02);
	for (let size = o.size; size > min; size -= step) {
		const set = setAt(font, text, size, o, false);
		if (set) return set;
	}
	return setAt(font, text, min, o, false) ?? setAt(font, text, min, o, true);
}

/** fitWords, or an error that says about how many characters fit. */
export function fitOrFail(font: Font, text: string, o: FitOptions, label: string, where: string): Fitted {
	requireGlyphs(font, text, label);
	const set = fitWords(font, text, o);
	if (set) return set;
	const words = text.split(/\s+/).filter(Boolean);
	let lo = 0;
	let hi = words.length;
	while (lo < hi) {
		const mid = Math.ceil((lo + hi) / 2);
		if (fitWords(font, words.slice(0, mid).join(' '), o)) lo = mid;
		else hi = mid - 1;
	}
	const room = words.slice(0, lo).join(' ').length;
	throw new CopyError(`The ${label} does not fit ${where} at its smallest readable size (${Math.round(Math.min(o.size, o.min))}px). Shorten it to about ${Math.max(4, room)} characters${room ? '' : ' or fewer'}, or use a larger size or another layout.`);
}

export type Placed = { svg: string; box: { x: number; y: number; w: number; h: number }; ink: { x: number; y: number; w: number; h: number }[] };

/** Draws fitted words from the top: every line as filled paths, with the real ink bounds of each line. */
export function placeWords(f: Fitted, x: number, y: number, fill: string, align: 'left' | 'center' | 'right' = 'left', column = f.width): Placed {
	const m = lineMetrics(f.font, f.size, 1);
	const scale = f.size / f.font.unitsPerEm;
	const parts: string[] = [];
	const ink: Placed['ink'] = [];
	f.lines.forEach((line, i) => {
		if (!line) return;
		const w = measure(f.font, line, f.size, f.tracking) - f.tracking * f.size;
		const lx = align === 'left' ? x : align === 'center' ? x + (column - w) / 2 : x + column - w;
		const baseline = y + i * f.line + (f.line - m.em) / 2 + m.ascent;
		parts.push(glyphPaths(f.font, line, f.size, lx, baseline, fill, f.tracking));
		const b = f.font.layout(line).bbox;
		const left = lx + Math.max(0, b.minX) * scale;
		ink.push({ x: left, y: baseline - b.maxY * scale, w: Math.max(1, w - Math.max(0, b.minX) * scale), h: Math.max(1, (b.maxY - b.minY) * scale) });
	});
	const box = ink.length ? unionOf(ink) : { x, y, w: 0, h: 0 };
	return { svg: parts.join(''), box, ink };
}

export function unionOf(rects: { x: number; y: number; w: number; h: number }[]) {
	const x = Math.min(...rects.map((r) => r.x));
	const y = Math.min(...rects.map((r) => r.y));
	return { x, y, w: Math.max(...rects.map((r) => r.x + r.w)) - x, h: Math.max(...rects.map((r) => r.y + r.h)) - y };
}

/** One line of type as filled glyph paths, its baseline at `baseline`. */
export function glyphPaths(font: Font, line: string, size: number, x: number, baseline: number, fill: string, tracking = 0): string {
	if (!line) return '';
	const scale = size / font.unitsPerEm;
	const run = font.layout(line);
	let pen = x;
	const parts: string[] = [];
	for (let i = 0; i < run.glyphs.length; i++) {
		const pos = run.positions[i];
		const data = run.glyphs[i].path.toSVG();
		if (data) {
			const tx = pen + pos.xOffset * scale;
			const ty = baseline - pos.yOffset * scale;
			// Font paths are y-up. Scale first (SVG applies transforms right to left), then move the origin to the baseline.
			parts.push(`<path d="${data}" fill="${fill}" transform="translate(${num(tx)} ${num(ty)}) scale(${num(scale, 5)} ${num(-scale, 5)})"/>`);
		}
		pen += pos.xAdvance * scale + tracking * size;
	}
	return parts.join('');
}
