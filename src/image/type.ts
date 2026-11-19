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

/** Greedy wrap on spaces. A word wider than the column breaks on characters. Blank lines are kept. */
export function wrap(font: Font, text: string, size: number, maxWidth: number, tracking = 0): string[] {
	const lines: string[] = [];
	for (const paragraph of text.split('\n')) {
		if (!paragraph.trim()) {
			lines.push('');
			continue;
		}
		let current = '';
		for (const word of paragraph.split(' ').filter(Boolean)) {
			const next = current ? `${current} ${word}` : word;
			if (measure(font, next, size, tracking) <= maxWidth) {
				current = next;
				continue;
			}
			if (current) lines.push(current);
			if (measure(font, word, size, tracking) <= maxWidth) {
				current = word;
				continue;
			}
			let chunk = '';
			for (const char of [...word]) {
				const trial = chunk + char;
				if (measure(font, trial, size, tracking) <= maxWidth) chunk = trial;
				else {
					if (chunk) lines.push(chunk);
					chunk = char;
				}
			}
			current = chunk;
		}
		if (current) lines.push(current);
	}
	return lines.length ? lines : [''];
}

function ellipsize(font: Font, line: string, size: number, maxWidth: number): string {
	if (measure(font, line, size) <= maxWidth) return line;
	const dots = '…';
	let cut = line;
	while (cut.length > 1 && measure(font, `${cut}${dots}`, size) > maxWidth) cut = [...cut].slice(0, -1).join('');
	return `${cut.trimEnd()}${dots}`;
}

export type DrawOptions = { leading: number; maxWidth: number; maxLines: number; minSize?: number; maxHeight?: number };

export type Drawn = { svg: string; width: number; height: number; size: number; lines: string[] };

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

/**
 * Draw a block of type as filled paths, so the SVG matches the brand face without the viewer installing it.
 * The size steps down until the copy fits the box. Past the minimum, the last visible line is ellipsized.
 */
export function drawText(font: Font, text: string, size: number, x: number, y: number, fill: string, opts: DrawOptions): Drawn {
	const clean = text.trim();
	if (!clean) return { svg: '', width: 0, height: 0, size, lines: [] };
	const min = Math.min(size, opts.minSize ?? size);
	let chosen = size;
	let lines = wrap(font, clean, chosen, opts.maxWidth);
	const fits = (fontSize: number, rows: string[]) => {
		const height = rows.length * lineMetrics(font, fontSize, opts.leading).lineHeight;
		return rows.length <= opts.maxLines && (opts.maxHeight === undefined || height <= opts.maxHeight) && rows.every((row) => measure(font, row, fontSize) <= opts.maxWidth + 0.5);
	};
	while (!fits(chosen, lines) && chosen - 2 >= min) {
		chosen -= 2;
		lines = wrap(font, clean, chosen, opts.maxWidth);
	}
	if (!fits(chosen, lines)) {
		const metrics = lineMetrics(font, chosen, opts.leading);
		const cap = opts.maxHeight === undefined ? opts.maxLines : Math.max(1, Math.min(opts.maxLines, Math.floor(opts.maxHeight / metrics.lineHeight)));
		lines = lines.slice(0, cap);
		lines[lines.length - 1] = ellipsize(font, lines[lines.length - 1] ?? '', chosen, opts.maxWidth);
	}
	const metrics = lineMetrics(font, chosen, opts.leading);
	const paths: string[] = [];
	lines.forEach((line, index) => {
		const top = y + index * metrics.lineHeight;
		const baseline = top + (metrics.lineHeight - metrics.em) / 2 + metrics.ascent;
		paths.push(glyphPaths(font, line, chosen, x, baseline, fill));
	});
	const width = Math.max(0, ...lines.map((line) => measure(font, line, chosen)));
	return { svg: paths.join(''), width, height: lines.length * metrics.lineHeight, size: chosen, lines };
}
