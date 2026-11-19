import { readFileSync } from 'node:fs';
import { brand } from '../lib/brand.js';
import { pkgPath } from '../lib/paths.js';
import { glyphPaths, measure, num, type Font } from './type.js';

// The approved logo pieces for every asset: the logomark from brand/logo/mark.svg and the lockup, the mark with the
// name set in the brand sans beside it. Proportions are the docs lockup's (apps/www/components/logo.tsx): the name at
// 0.875 of the mark's height, 0.5 of its height after it, centered on the mark.

export const LOCKUP_NAME = 0.875;
export const LOCKUP_GAP = 0.5;

let cached: { d: string; w: number; h: number } | undefined;
export function markShape(): { d: string; w: number; h: number } {
	if (cached) return cached;
	const svg = readFileSync(pkgPath('brand', 'logo', 'mark.svg'), 'utf8');
	const box = svg.match(/viewBox="([\d.\s-]+)"/)?.[1].trim().split(/\s+/).map(Number) ?? [0, 0, 27.1667, 20];
	const d = svg.match(/\sd="([^"]+)"/)?.[1];
	if (!d || !box[2] || !box[3]) throw new Error('The logo mark has no path.');
	cached = { d, w: box[2], h: box[3] };
	return cached;
}

/** The mark, its top-left at x, y and `h` tall. */
export function markSvg(x: number, y: number, h: number, fill: string): string {
	const m = markShape();
	const s = h / m.h;
	return `<g transform="translate(${num(x)} ${num(y)}) scale(${num(s, 5)})"><path d="${m.d}" fill="${fill}" fill-rule="evenodd"/></g>`;
}

export const markWidth = (h: number) => (markShape().w / markShape().h) * h;

export function lockupWidth(sans: Font, markH: number): number {
	return markWidth(markH) + markH * LOCKUP_GAP + measure(sans, brand().name, markH * LOCKUP_NAME);
}

/** The lockup with the mark's top-left at x, y. The name sits on the mark's middle. */
export function lockupSvg(sans: Font, x: number, y: number, markH: number, fill: string): { svg: string; w: number; h: number } {
	const size = markH * LOCKUP_NAME;
	const mw = markWidth(markH);
	// The name's cap height centered on the mark: cap height is read from the face so the name sits optically level.
	const capUnits = (sans as unknown as { capHeight?: number }).capHeight || sans.ascent * 0.7;
	const baseline = y + markH / 2 + (capUnits * (size / sans.unitsPerEm)) / 2;
	const name = glyphPaths(sans, brand().name, size, x + mw + markH * LOCKUP_GAP, baseline, fill);
	return { svg: `${markSvg(x, y, markH, fill)}${name}`, w: lockupWidth(sans, markH), h: markH };
}
