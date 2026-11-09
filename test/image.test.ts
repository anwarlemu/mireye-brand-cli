import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { imageCommand } from '../src/commands/image.js';
import { FORMATS, TEMPLATES, type FormatId, type ImageContent, type TemplateId, catalog, cleanContent, paletteFor } from '../src/image/catalog.js';
import { renderImage, svgDocument } from '../src/image/render.js';

const ROOT = join(import.meta.dirname, '..');
const BIN = join(ROOT, 'bin.js');
const FORMATS_IDS = Object.keys(FORMATS) as FormatId[];
const TEMPLATE_IDS = Object.keys(TEMPLATES) as TemplateId[];

function pngSize(buf: Buffer) {
	expect(buf.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
	expect(buf.subarray(12, 16).toString('ascii')).toBe('IHDR');
	return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function contentFor(template: TemplateId): ImageContent {
	if (template === 'headline') return { title: 'Parcel survey' };
	if (template === 'subtext') return { title: 'Site survey', subtitle: 'Boundaries and access.' };
	if (template === 'quote') return { quote: 'Read the sheet first.', attribution: 'Field review' };
	if (template === 'announcement') return { kicker: 'Field note', title: 'The sheet is ready.', subtitle: 'Same marks, new note.' };
	return { title: 'Parcel 18' };
}

describe('image catalog', () => {
	it('lists the social sizes and the templates an agent can ask for', () => {
		const data = catalog();
		expect(data.formats.map((format) => [format.id, format.width, format.height])).toEqual([
			['og', 1200, 630],
			['square', 1080, 1080],
			['portrait', 1080, 1350],
			['landscape', 1200, 675],
		]);
		expect(data.templates.map((template) => template.id)).toEqual(['headline', 'subtext', 'frame', 'quote', 'announcement']);
		expect(data.exports).toEqual(['png', 'svg']);
		expect(data.themes.some((theme) => theme.default)).toBe(true);
	});

	it('rejects copy past the field limit and unknown themes', () => {
		expect(() => cleanContent({ title: 'a'.repeat(161) })).toThrow(/title is longer/);
		expect(cleanContent({ title: '  Parcel survey  ', extra: 'ignored' })).toEqual({ title: 'Parcel survey' });
		expect(() => paletteFor('nope')).toThrow(/Unknown theme/);
		expect(paletteFor('enterprise').ink).toBe('#1F1813');
		expect(paletteFor('api').ink).toBe('#1E231C');
	});
});

describe('image render', () => {
	it('renders every template at every size with the right pixel dimensions', async () => {
		const dir = mkdtempSync(join(tmpdir(), 'ds-image-'));
		const tiny = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
		const shot = join(dir, 'shot.png');
		writeFileSync(shot, tiny);
		for (const format of FORMATS_IDS) {
			for (const template of TEMPLATE_IDS) {
				const content = template === 'frame' ? { ...contentFor(template), image: shot } : contentFor(template);
				const result = await renderImage({ format, template, theme: 'api', content, exports: ['png', 'svg'], outDir: dir, name: `${format}-${template}` });
				expect(result.ok).toBe(true);
				expect(result.width).toBe(FORMATS[format].width);
				expect(result.height).toBe(FORMATS[format].height);
				for (const file of result.files) {
					const buf = readFileSync(join(dir, `${format}-${template}.${file.format}`));
					expect(buf.length).toBeGreaterThan(500);
					if (file.format === 'png') expect(pngSize(buf)).toEqual({ width: FORMATS[format].width, height: FORMATS[format].height });
					else {
						const svg = buf.toString('utf8');
						expect(svg).toContain(`width="${FORMATS[format].width}"`);
						expect(svg).toContain(`height="${FORMATS[format].height}"`);
						expect(svg).toContain('M8.84329');
						expect(svg).toContain('#1E231C');
						expect(svg).not.toContain('#1F1813');
						if (template === 'frame') expect(svg).toContain('data:image/png;base64,');
					}
				}
			}
		}
		const plate = svgDocument('landscape', 'frame', 'api', { title: 'Parcel 18' });
		expect(plate).toContain('Survey plate.');
		expect(plate).not.toContain('data:image/');
		const earth = svgDocument('og', 'announcement', 'enterprise', contentFor('announcement'));
		expect(earth).toContain('#1F1813');
		expect(earth).not.toContain('#1E231C');
		const again = svgDocument('og', 'headline', 'api', { title: 'Parcel survey' });
		expect(again).toBe(svgDocument('og', 'headline', 'api', { title: 'Parcel survey' }));
		const pngA = await renderImage({ format: 'og', template: 'headline', theme: 'api', content: { title: 'Parcel survey' }, exports: ['png'], outDir: dir, name: 'det-a' });
		const pngB = await renderImage({ format: 'og', template: 'headline', theme: 'api', content: { title: 'Parcel survey' }, exports: ['png'], outDir: dir, name: 'det-b' });
		expect(readFileSync(join(dir, 'det-a.png'))).toEqual(readFileSync(join(dir, 'det-b.png')));
		expect(pngA.files[0].bytes).toBe(pngB.files[0].bytes);
	}, 60000);

	it('refuses a frame image that is not a PNG or JPEG', async () => {
		const dir = mkdtempSync(join(tmpdir(), 'ds-image-'));
		const file = join(dir, 'notes.txt');
		writeFileSync(file, 'not an image');
		await expect(renderImage({ format: 'og', template: 'frame', theme: 'api', content: { image: file }, exports: ['svg'], outDir: dir, name: 'bad' })).rejects.toThrow(/PNG or JPEG/);
	});
});

describe('image command', () => {
	it('answers --list --json and --help, and reports a missing title as JSON', () => {
		const listed = JSON.parse(execFileSync(process.execPath, [BIN, 'image', '--list', '--json'], { encoding: 'utf8' }));
		expect(listed.formats).toHaveLength(4);
		expect(listed.templates).toHaveLength(5);
		expect(execFileSync(process.execPath, [BIN, 'image', '--help'], { encoding: 'utf8' })).toMatch(/--format/);
		let failed = '';
		try {
			execFileSync(process.execPath, [BIN, 'image', '--format', 'og', '--template', 'headline', '--json'], { encoding: 'utf8' });
		} catch (error) {
			failed = String((error as { stdout?: string }).stdout);
		}
		expect(JSON.parse(failed)).toMatchObject({ ok: false });
		expect(failed).toMatch(/title/);
	});

	it('writes from a content file and lets flags override it', async () => {
		const dir = mkdtempSync(join(tmpdir(), 'ds-image-'));
		const content = join(dir, 'card.json');
		writeFileSync(content, JSON.stringify({ title: 'From the file', subtitle: 'File line' }));
		const logs: string[] = [];
		const write = process.stdout.write.bind(process.stdout);
		process.stdout.write = ((chunk: string) => {
			logs.push(String(chunk));
			return true;
		}) as typeof process.stdout.write;
		try {
			await imageCommand({ content, format: 'og', template: 'subtext', title: 'From the flag', out: dir, name: 'merged', export: 'svg', json: true });
		} finally {
			process.stdout.write = write;
		}
		const result = JSON.parse(logs.join(''));
		expect(result.files[0].path).toMatch(/merged\.svg$/);
		expect(readFileSync(join(dir, 'merged.svg'), 'utf8')).toContain('From the flag');
		expect(readFileSync(join(dir, 'merged.svg'), 'utf8')).toContain('File line');
	});
});
