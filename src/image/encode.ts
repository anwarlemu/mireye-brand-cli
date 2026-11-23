import { imagesToPdf } from '../deck/pdf.js';
import type { ExportKind } from './catalog.js';

// From the drawn SVG to files: PNG by resvg, JPG and WebP encoded from those same pixels, a one-page PDF. The canvas
// package only encodes pixels resvg drew; it never draws, so every format shows the same picture.

async function resvg(svg: string, width: number) {
	let Resvg: typeof import('@resvg/resvg-js').Resvg;
	try {
		({ Resvg } = await import('@resvg/resvg-js'));
	} catch {
		throw new Error('PNG export needs the optional @resvg/resvg-js package. Install it, or pass --format svg.');
	}
	return new Resvg(svg, { fitTo: { mode: 'width', value: width }, font: { loadSystemFonts: false }, shapeRendering: 2, textRendering: 2, imageRendering: 0, logLevel: 'off' }).render();
}

export async function rasterize(svg: string, width: number): Promise<Buffer> {
	return (await resvg(svg, width)).asPng();
}

/** PNG plus opaque RGB pixels, for a PDF page. */
export async function rasterRgb(svg: string, width: number): Promise<{ png: Buffer; rgb: Buffer; width: number; height: number }> {
	const img = await resvg(svg, width);
	const px = img.pixels;
	const rgb = Buffer.alloc(img.width * img.height * 3);
	for (let i = 0, j = 0; i < px.length; i += 4, j += 3) {
		rgb[j] = px[i];
		rgb[j + 1] = px[i + 1];
		rgb[j + 2] = px[i + 2];
	}
	return { png: img.asPng(), rgb, width: img.width, height: img.height };
}

async function encodePixels(svg: string, width: number, kind: 'jpg' | 'webp'): Promise<Buffer> {
	const img = await resvg(svg, width);
	let canvasLib: typeof import('@napi-rs/canvas');
	try {
		canvasLib = await import('@napi-rs/canvas');
	} catch {
		throw new Error(`${kind} export needs the optional @napi-rs/canvas package. Install it, or pass --format png.`);
	}
	const canvas = canvasLib.createCanvas(img.width, img.height);
	const ctx = canvas.getContext('2d');
	ctx.putImageData(new canvasLib.ImageData(new Uint8ClampedArray(img.pixels), img.width, img.height), 0, 0);
	return kind === 'jpg' ? canvas.encode('jpeg', 92) : canvas.encode('webp', 92);
}

/** One drawing in each asked format, `scale` pixels to a unit. A PDF page is the drawing's width in points at 2 pixels a point. */
export async function encode(svg: string, width: number, kinds: readonly ExportKind[], scale = 1): Promise<Partial<Record<ExportKind, Buffer>>> {
	const out: Partial<Record<ExportKind, Buffer>> = {};
	const w = Math.round(width * scale);
	for (const kind of kinds) {
		if (kind === 'svg') out.svg = Buffer.from(svg);
		else if (kind === 'png') out.png = await rasterize(svg, w);
		else if (kind === 'pdf') out.pdf = imagesToPdf([await rasterRgb(svg, w)], width / 2);
		else out[kind] = await encodePixels(svg, w, kind);
	}
	return out;
}
