import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { renderImage } from '../src/image/render.js';
import { renderVideo } from '../src/video/render.js';

const ROOT = join(import.meta.dirname, '..');

function size(buf: Buffer) {
	expect(buf.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
	return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

describe('committed samples', () => {
	it('matches a fresh render of every image sample', async () => {
		const jobs = [
			['og-headline.png', 'og', 'headline', { title: 'Parcel survey' }],
			['square-subtext.png', 'square', 'subtext', { title: 'Site survey', subtitle: 'Boundaries and access.' }],
			['portrait-quote.png', 'portrait', 'quote', { quote: 'Read the sheet first.', attribution: 'Field review' }],
			['landscape-frame.png', 'landscape', 'frame', { title: 'Parcel 18' }],
			['og-announcement.png', 'og', 'announcement', { kicker: 'Field note', title: 'The sheet is ready.', subtitle: 'Same marks, new note.' }],
		] as const;
		const dir = mkdtempSync(join(tmpdir(), 'ds-sample-image-'));
		for (const [file, format, template, content] of jobs) {
			const committed = readFileSync(join(ROOT, 'samples/images', file));
			const rendered = await renderImage({ format, template, theme: 'api', content, exports: ['png'], outDir: dir, name: 'out' });
			expect(rendered.ok).toBe(true);
			expect(readFileSync(join(dir, 'out.png')).equals(committed)).toBe(true);
			expect(size(committed)).toEqual({ width: rendered.width, height: rendered.height });
		}
	});

	it('matches a fresh render of one video per template family', async () => {
		const jobs = [
			['square-social.apng', 'square', 'social', { title: 'Parcel survey', subtitle: 'Boundaries and access.' }, 1080, 1080],
			['vertical-announcement.apng', 'vertical', 'announcement', { kicker: 'Field note', title: 'The sheet is ready.', subtitle: 'Same marks, new note.' }, 1080, 1920],
			['landscape-product.apng', 'landscape', 'product', { title: 'Parcel 18', subtitle: 'Boundaries and access.' }, 1920, 1080],
		] as const;
		const dir = mkdtempSync(join(tmpdir(), 'ds-sample-video-'));
		for (const [file, format, template, content, width, height] of jobs) {
			const committed = readFileSync(join(ROOT, 'samples/video', file));
			expect(size(committed)).toEqual({ width, height });
			const actl = committed.indexOf('acTL');
			expect(committed.readUInt32BE(actl + 4)).toBe(24);
			expect(committed.readUInt32BE(actl + 8)).toBe(1);
			const rendered = await renderVideo({ format, template, theme: 'api', content, exports: ['apng'], outDir: dir, name: 'out' });
			expect(readFileSync(join(dir, 'out.apng')).equals(committed)).toBe(true);
			expect(rendered.frameCount).toBe(24);
		}
	}, 60000);
});
