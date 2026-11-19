import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { isAbsolute, join, relative } from 'node:path';
import { rasterize } from '../image/render.js';
import type { ImageContent } from '../image/catalog.js';
import { encodeApng } from './apng.js';
import { VIDEO_FORMATS, type VideoExport, type VideoFormatId, type VideoTemplateId, videoTiming } from './catalog.js';
import { frameSvg } from './compose.js';

export type VideoRequest = {
	format: VideoFormatId;
	template: VideoTemplateId;
	theme: string;
	content: ImageContent;
	exports: VideoExport[];
	outDir: string;
	name: string;
	/** Test-only shorter clock. The CLI does not accept this. */
	frameCount?: number;
};

export type VideoFile = { path: string; format: VideoExport | 'png' | 'svg'; width: number; height: number; bytes: number; sha256: string; frame?: number };

function displayPath(file: string): string {
	const rel = relative(process.cwd(), file);
	if (!rel || rel.startsWith('..') || isAbsolute(rel)) return file;
	return rel.split('\\').join('/');
}

function write(file: string, data: Buffer | string, format: VideoFile['format'], width: number, height: number, frame?: number): VideoFile {
	writeFileSync(file, data);
	const bytes = readFileSync(file);
	return { path: displayPath(file), format, width, height, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), frame };
}

/** Encodes the frames with ffmpeg: single-threaded and bit-exact, so the same frames give the same file. */
function encodeVideo(pngs: Buffer[], fps: number, kind: 'mp4' | 'webm', file: string) {
	const dir = mkdtempSync(join(tmpdir(), 'ds-video-'));
	try {
		pngs.forEach((png, index) => writeFileSync(join(dir, `f${String(index).padStart(4, '0')}.png`), png));
		const codec = kind === 'mp4' ? ['-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart'] : ['-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '30', '-pix_fmt', 'yuv420p', '-row-mt', '0'];
		execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', join(dir, 'f%04d.png'), ...codec, '-threads', '1', '-fflags', '+bitexact', '-flags:v', '+bitexact', '-map_metadata', '-1', file], { stdio: ['ignore', 'ignore', 'pipe'] });
	} catch (error) {
		const err = error as { code?: string; stderr?: Buffer };
		if (err.code === 'ENOENT') throw new Error(`${kind} export needs ffmpeg on the PATH. Install it, or pass --export apng.`);
		throw new Error(`ffmpeg could not write ${kind}: ${String(err.stderr ?? error).trim()}`);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
}

export async function renderVideo(request: VideoRequest) {
	const timing = videoTiming();
	const frameCount = request.frameCount ?? timing.frameCount;
	if (!Number.isInteger(frameCount) || frameCount < 1) throw new Error('frameCount must be a positive integer.');
	const { width, height } = VIDEO_FORMATS[request.format];
	const frames = Array.from({ length: frameCount }, (_, index) => frameSvg(request.format, request.template, request.theme, request.content, index, frameCount));
	mkdirSync(request.outDir, { recursive: true });
	const files: VideoFile[] = [];
	if (request.exports.includes('svg')) {
		frames.forEach((svg, index) => {
			files.push(write(join(request.outDir, `${request.name}-f${String(index).padStart(2, '0')}.svg`), svg, 'svg', width, height, index));
		});
	}
	const pngs: Buffer[] = [];
	if (request.exports.some((kind) => kind !== 'svg')) {
		for (let index = 0; index < frames.length; index++) pngs.push(await rasterize(frames[index], width));
	}
	if (request.exports.includes('png')) {
		pngs.forEach((png, index) => {
			files.push(write(join(request.outDir, `${request.name}-f${String(index).padStart(2, '0')}.png`), png, 'png', width, height, index));
		});
	}
	if (request.exports.includes('apng')) {
		const apng = encodeApng(pngs, timing.fps);
		files.push(write(join(request.outDir, `${request.name}.apng`), apng, 'apng', width, height));
	}
	if (request.exports.includes('still')) {
		const last = frames.length - 1;
		files.push(write(join(request.outDir, `${request.name}-still.svg`), frames[last], 'svg', width, height, last));
		files.push(write(join(request.outDir, `${request.name}-still.png`), pngs[last] ?? (await rasterize(frames[last], width)), 'png', width, height, last));
	}
	for (const kind of ['mp4', 'webm'] as const) {
		if (!request.exports.includes(kind)) continue;
		const file = join(request.outDir, `${request.name}.${kind}`);
		encodeVideo(pngs, timing.fps, kind, file);
		files.push(write(file, readFileSync(file), kind, width, height));
	}
	return {
		schemaVersion: 1 as const,
		ok: true as const,
		renderer: 'svg-resvg-apng',
		format: request.format,
		template: request.template,
		theme: request.theme,
		width,
		height,
		fps: timing.fps,
		frameCount,
		durationMs: Math.round((frameCount / timing.fps) * 1000),
		plays: timing.plays,
		files,
	};
}
