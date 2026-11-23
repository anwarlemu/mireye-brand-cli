import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, isAbsolute, join, relative, resolve } from 'node:path';
import { rasterize } from './encode.js';

// Writing asset files: the SVG as drawn and a PNG rasterized by resvg at a whole-number scale. Every file is reported
// with its size and a sha256, so an agent (and the tests) can see that the same inputs wrote the same bytes.

export type OutFile = { path: string; format: string; width: number; height: number; bytes: number; sha256: string };

export function displayPath(file: string): string {
	const rel = relative(process.cwd(), file);
	if (!rel || rel.startsWith('..') || isAbsolute(rel)) return file;
	return rel.split('\\').join('/');
}

export function writeFile(file: string, data: Buffer | string, format: string, width: number, height: number): OutFile {
	writeFileSync(file, data);
	const bytes = readFileSync(file);
	return { path: displayPath(file), format, width, height, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') };
}

export function exportsOf(value: string | undefined, allowed: string[], fallback: string): string[] {
	const parts = (value ?? fallback).split(',').map((part) => part.trim()).filter(Boolean);
	parts.forEach((part, i) => (parts[i] = part.toLowerCase() === 'jpeg' ? 'jpg' : part.toLowerCase()));
	if (!parts.length || parts.some((part) => !allowed.includes(part))) throw new Error(`--format is ${allowed.join(', ')} or a comma-separated list of those.`);
	return [...new Set(parts)];
}

/** Writes `<name>.svg` and/or `<name>.png` (the PNG at `scale` times the SVG's size). */
export async function writeSvgPng(outDir: string, name: string, svg: string, width: number, height: number, kinds: string[], scale = 1): Promise<OutFile[]> {
	mkdirSync(outDir, { recursive: true });
	const files: OutFile[] = [];
	if (kinds.includes('svg')) files.push(writeFile(join(outDir, `${name}.svg`), svg, 'svg', width, height));
	if (kinds.includes('png')) {
		const w = Math.round(width * scale);
		files.push(writeFile(join(outDir, `${name}.png`), await rasterize(svg, w), 'png', w, Math.round(height * scale)));
	}
	return files;
}

export function parseSize(value: string, flag = '--size'): { width: number; height: number } {
	const m = value.trim().match(/^(\d{2,5})\s*[x×]\s*(\d{2,5})$/i);
	if (!m) throw new Error(`${flag} is WIDTHxHEIGHT in pixels, like 1536x1024.`);
	const width = Number(m[1]);
	const height = Number(m[2]);
	if (width > 8000 || height > 8000) throw new Error(`${flag} is at most 8000 pixels a side.`);
	return { width, height };
}

/** --out as a folder, or as a file: `banner.jpg` sets the folder, the name and (when none is asked for) the format. */
export function outTarget(out: string | undefined, fallback: string, kinds: readonly string[]): { dir: string; name?: string; kind?: string } {
	if (!out) return { dir: fallback };
	const path = isAbsolute(out) ? out : resolve(out);
	const ext = extname(path).slice(1).toLowerCase().replace('jpeg', 'jpg');
	if (!ext) return { dir: path };
	if (!kinds.includes(ext)) {
		if (existsSync(path) && statSync(path).isDirectory()) return { dir: path };
		throw new Error(`--out ${out}: .${ext} is not a format this writes (${kinds.join(', ')}). Name a folder, or a file ending in one of those.`);
	}
	return { dir: dirname(path), name: basename(path, extname(path)), kind: ext };
}

export function scaleOf(value: string | undefined): number {
	if (value === undefined) return 1;
	const n = Number(value);
	if (!Number.isFinite(n) || n < 0.25 || n > 4) throw new Error('--scale is a number from 0.25 to 4.');
	return n;
}

export function seedOf(value: string | number | undefined): number | undefined {
	if (value === undefined) return undefined;
	const n = Number(value);
	if (!Number.isInteger(n) || n < 0 || n > 9999) throw new Error('--seed is a whole number from 0 to 9999.');
	return n || undefined;
}
