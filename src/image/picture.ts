import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { inflateSync } from 'node:zlib';
import { num } from './type.js';
import type { Rect } from '../design/types.js';

// A picture the person passes: read from disk, proved to be a whole PNG or JPEG, turned upright, and drawn to cover a
// box. A file that cannot be drawn is an error here, so an image never goes out with a silent blank where it should be.

export type Picture = { href: string; mime: string; width: number; height: number; turn: 0 | 90 | 180 | 270 };

const MAX = 12 * 1024 * 1024;

function readPng(buf: Buffer, file: string): { width: number; height: number } {
	const width = buf.readUInt32BE(16);
	const height = buf.readUInt32BE(20);
	const parts: Buffer[] = [];
	let ended = false;
	for (let at = 8; at + 12 <= buf.length; ) {
		const len = buf.readUInt32BE(at);
		const type = buf.toString('latin1', at + 4, at + 8);
		if (at + 12 + len > buf.length) break;
		if (type === 'IDAT') parts.push(buf.subarray(at + 8, at + 8 + len));
		if (type === 'IEND') {
			ended = true;
			break;
		}
		at += 12 + len;
	}
	try {
		if (!ended || !parts.length || !width || !height) throw new Error('cut short');
		inflateSync(Buffer.concat(parts));
	} catch {
		throw new Error(`${file} is a damaged PNG: it cannot be drawn. Save it again.`);
	}
	return { width, height };
}

/** Size, the turn its EXIF asks for, and the file without its EXIF block (so nothing turns it twice). */
function readJpeg(buf: Buffer, file: string): { width: number; height: number; turn: Picture['turn']; bytes: Buffer } {
	let width = 0;
	let height = 0;
	let turn: Picture['turn'] = 0;
	const keep: Buffer[] = [buf.subarray(0, 2)];
	for (let i = 2; i + 4 <= buf.length; ) {
		if (buf[i] !== 0xff) break;
		const marker = buf[i + 1];
		if (marker === 0xda) {
			keep.push(buf.subarray(i));
			break;
		}
		const len = buf.readUInt16BE(i + 2);
		const seg = buf.subarray(i, i + 2 + len);
		if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
			height = buf.readUInt16BE(i + 5);
			width = buf.readUInt16BE(i + 7);
		}
		if (marker === 0xe1 && seg.toString('latin1', 4, 8) === 'Exif') {
			const tiff = seg.subarray(10);
			const le = tiff.toString('latin1', 0, 2) === 'II';
			const u16 = (o: number) => (le ? tiff.readUInt16LE(o) : tiff.readUInt16BE(o));
			const u32 = (o: number) => (le ? tiff.readUInt32LE(o) : tiff.readUInt32BE(o));
			try {
				const ifd = u32(4);
				for (let n = 0; n < u16(ifd); n++) {
					const at = ifd + 2 + n * 12;
					if (u16(at) === 0x0112) turn = ({ 3: 180, 6: 90, 8: 270 } as Record<number, Picture['turn']>)[u16(at + 8)] ?? 0;
				}
			} catch {
				turn = 0;
			}
		} else keep.push(seg);
		i += 2 + len;
	}
	if (!width || !height || buf.lastIndexOf(Buffer.from([0xff, 0xd9])) < buf.length - 4096) throw new Error(`${file} is a damaged JPEG: it cannot be drawn. Save it again.`);
	return { width, height, turn, bytes: Buffer.concat(keep) };
}

const cache = new Map<string, Picture>();

export function loadPicture(file: string): Picture {
	const path = resolve(file);
	if (!existsSync(path)) throw new Error(`No image at ${file}.`);
	const info = statSync(path);
	if (info.isDirectory()) throw new Error(`${file} is a folder, not an image.`);
	const key = `${path}:${info.size}:${info.mtimeMs}`;
	const hit = cache.get(key);
	if (hit) return hit;
	if (info.size > MAX) throw new Error(`${file} is larger than 12MB (${(info.size / 1024 / 1024).toFixed(1)}MB). Save it smaller: no size here needs more than 4000 pixels across.`);
	const buf = readFileSync(path);
	const png = buf.length >= 45 && buf.subarray(0, 8).toString('hex') === '89504e470d0a1a0a';
	const jpeg = buf.length >= 20 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
	if (!png && !jpeg) throw new Error(`${file} is not an image this can draw: it must be a PNG or JPEG.`);
	let out: Picture;
	if (png) {
		const s = readPng(buf, file);
		out = { href: `data:image/png;base64,${buf.toString('base64')}`, mime: 'image/png', ...s, turn: 0 };
	} else {
		const s = readJpeg(buf, file);
		const flip = s.turn === 90 || s.turn === 270;
		out = { href: `data:image/jpeg;base64,${s.bytes.toString('base64')}`, mime: 'image/jpeg', width: flip ? s.height : s.width, height: flip ? s.width : s.height, turn: s.turn };
	}
	cache.set(key, out);
	return out;
}

/** The picture covering a box: closer in, and which part shows, always covering. `clip` is the clip path's inner markup. */
export function coverSvg(p: Picture, box: Rect, id: string, clip: string, crop: { zoom?: number; x?: number; y?: number } = {}): string {
	const k = Math.max(box.w / p.width, box.h / p.height) * Math.max(1, crop.zoom ?? 1);
	const w = p.width * k;
	const h = p.height * k;
	const x = box.x - (w - box.w) * (0.5 + (crop.x ?? 0) / 2);
	const y = box.y - (h - box.h) * (0.5 + (crop.y ?? 0) / 2);
	const side = p.turn === 90 || p.turn === 270;
	const iw = side ? h : w;
	const ih = side ? w : h;
	const turned = p.turn ? ` transform="rotate(${p.turn} ${num(x + w / 2)} ${num(y + h / 2)})"` : '';
	return `<clipPath id="${id}">${clip}</clipPath><g clip-path="url(#${id})"><image href="${p.href}" x="${num(x + (w - iw) / 2)}" y="${num(y + (h - ih) / 2)}" width="${num(iw)}" height="${num(ih)}" preserveAspectRatio="none"${turned}/></g>`;
}
