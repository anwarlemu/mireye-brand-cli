import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { isAbsolute, join, relative } from 'node:path';
import { rasterize } from './render.js';

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
