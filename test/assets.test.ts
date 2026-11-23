import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { FORMATS, POSTERS, sizesFor, tokenHex } from '../src/image/catalog.js';
import { posterDocument } from '../src/image/render.js';
import { groundIds, imageDocument } from '../src/image/poster.js';
import { buildIllustration } from '../src/illustrate/build.js';
import { wireDoc, wireDrawing } from '../src/illustrate/wire.js';
import { sampleDeck, slideSvg } from '../src/deck/slides.js';
import { merchItems, merchSvg } from '../src/merch/merch.js';
import { figmaTokens, figmaTokenScripts } from '../src/figma/tokens.js';
import { checkFigmaValues } from '../src/figma/check.js';
import { tokens } from '../src/lib/brand.js';

const ROOT = join(import.meta.dirname, '..');
const BIN = join(ROOT, 'bin.js');
const sha = (b: Buffer | string) => createHash('sha256').update(b).digest('hex');

function run(args: string[], cwd = ROOT) {
	const r = spawnSync(process.execPath, [BIN, ...args], { cwd, encoding: 'utf8' });
	return { status: r.status ?? 1, stdout: r.stdout, stderr: r.stderr };
}

/** Every hex color the brand allows in a drawn asset: the token values, and the illustration skill's wireframe tones. */
function allowedColors(): Set<string> {
	const out = new Set<string>();
	for (const v of Object.values(tokens().site)) for (const m of v.matchAll(/#[0-9a-f]{6}\b/gi)) out.add(m[0].toUpperCase());
	for (const tones of [wireDoc().style.dark, wireDoc().style.light]) for (const v of Object.values(tones)) out.add(v.toUpperCase());
	for (const g of groundIds()) out.add(tokenHex(imageDocument().grounds[g].ground));
	return out;
}
const colorsIn = (svg: string) => new Set([...svg.matchAll(/(?:fill|stroke)="(#[0-9a-fA-F]{6})"/g)].map((m) => m[1].toUpperCase()));

describe('image posters', () => {
	it('draws every poster at every size and ground in brand colors only, the same bytes every time', () => {
		const allowed = allowedColors();
		for (const template of Object.keys(POSTERS())) {
			const sample = { ...POSTERS()[template].sample };
			if (template === 'parcels') delete sample.labels;
			for (const format of sizesFor(template).filter((id) => id !== 'custom' && !(template === 'app' && FORMATS[id].width / FORMATS[id].height > 1.5))) {
				const svg = posterDocument(format, template, 'api', POSTERS()[template].ground, sample);
				expect(svg).toContain(`width="${FORMATS[format].width}" height="${FORMATS[format].height}"`);
				for (const c of colorsIn(svg)) expect(allowed, `${template} ${format} uses ${c}`).toContain(c);
			}
			for (const ground of groundIds()) {
				const a = posterDocument('og', template, 'api', ground, sample);
				expect(a).toBe(posterDocument('og', template, 'api', ground, sample));
				expect(a).toContain(`fill="${tokenHex(imageDocument().grounds[ground].ground)}"`);
			}
		}
	}, 120000);

	it('lists the social set and refuses unknown names with the nearest ones', () => {
		for (const id of ['og', 'square', 'portrait', 'story', 'landscape', 'x-banner', 'linkedin-banner']) expect(FORMATS[id]).toBeTruthy();
		expect([FORMATS['x-banner'].width, FORMATS['x-banner'].height, FORMATS['linkedin-banner'].width, FORMATS['linkedin-banner'].height]).toEqual([1500, 500, 1584, 396]);
		const size = run(['image', '--size', 'storry', '--template', 'window', '--title', 'x', '--json']);
		expect(size.status).toBe(1);
		expect(JSON.parse(size.stdout).error).toMatch(/Did you mean story/);
		const ground = run(['image', '--size', 'og', '--template', 'window', '--title', 'x', '--ground', 'greem', '--json']);
		expect(ground.status).toBe(1);
		expect(ground.stdout).toMatch(/Did you mean green/);
		const command = run(['imag']);
		expect(command.status).toBe(1);
		expect(command.stderr).toMatch(/Did you mean image/);
	});

	it('writes PNG and SVG for a poster with the user picture embedded', () => {
		const dir = mkdtempSync(join(tmpdir(), 'ds-assets-'));
		const tiny = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
		writeFileSync(join(dir, 'aerial.png'), tiny);
		const r = run(['image', '--size', 'landscape', '--template', 'photo', '--title', 'Central Iowa', '--image', join(dir, 'aerial.png'), '--out', dir, '--json']);
		expect(r.status).toBe(0);
		expect(readFileSync(join(dir, 'landscape-photo.svg'), 'utf8')).toContain('data:image/png;base64,');
		expect(readFileSync(join(dir, 'landscape-photo.png')).readUInt32BE(16)).toBe(1200);
	});
});

describe('illustrate', () => {
	it('runs the skill toolkit unchanged: the same SVG the skill exports', () => {
		// mksvg.js apicore --ground bone writes 23341 characters; the CLI wraps the very same paths.
		const art = wireDrawing('apicore', 'light');
		expect(art.svg.length).toBe(23341);
		expect([art.width, art.height]).toEqual([928, 546]);
		for (const scene of Object.keys(wireDoc().scenes)) expect(existsSync(join(ROOT, 'brand', 'illustrate', 'wire', wireDoc().scenes[scene].file))).toBe(true);
	});

	it('draws every style deterministically, as vectors', async () => {
		const a = await buildIllustration({ style: 'iso', subject: 'hub', ground: 'green', background: true });
		const b = await buildIllustration({ style: 'iso', subject: 'hub', ground: 'green', background: true });
		expect(a.svg).toBe(b.svg);
		expect(a.svg).not.toContain('<image');
		const tile = await buildIllustration({ style: 'wire', subject: 'solar', ground: 'brown', background: true, frame: { width: 1536, height: 1024, fill: 0.72 } });
		expect([tile.width, tile.height]).toEqual([1536, 1024]);
		const field = await buildIllustration({ style: 'contours', subject: 'sparse', ground: 'bone', background: false });
		expect(field.svg).not.toMatch(/<rect width="\d+" height="\d+" fill=/);
		await expect(buildIllustration({ style: 'wire', subject: 'solar', ground: 'black', background: true })).rejects.toThrow(/green, brown, bone/);
	});

	it('traces a picture as contour paths, the same paths every time', async () => {
		const dir = mkdtempSync(join(tmpdir(), 'ds-trace-'));
		// A soft radial blob, written as an SVG and rasterized to PNG, so the field has real slopes.
		const { Resvg } = await import('@resvg/resvg-js');
		const png = new Resvg('<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120"><defs><radialGradient id="g"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient></defs><rect width="160" height="120" fill="url(#g)"/></svg>').render().asPng();
		writeFileSync(join(dir, 'blob.png'), png);
		const a = await buildIllustration({ style: 'trace', ground: 'bone', image: join(dir, 'blob.png'), background: true });
		const b = await buildIllustration({ style: 'trace', ground: 'bone', image: join(dir, 'blob.png'), background: true });
		expect(a.svg).toBe(b.svg);
		expect(Number(a.parts.lines)).toBeGreaterThan(3);
	});

	it('refuses a picture too flat to trace instead of writing an empty drawing', async () => {
		const dir = mkdtempSync(join(tmpdir(), 'ds-trace-'));
		const { Resvg } = await import('@resvg/resvg-js');
		writeFileSync(join(dir, 'flat.png'), new Resvg('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="#808080"/></svg>').render().asPng());
		await expect(buildIllustration({ style: 'trace', ground: 'bone', image: join(dir, 'flat.png'), background: true })).rejects.toThrow(/too little contrast/);
	});

	it('answers unknown subjects with the nearest names', () => {
		const r = run(['illustrate', 'solr', '--json']);
		expect(r.status).toBe(1);
		expect(JSON.parse(r.stdout).error).toMatch(/Did you mean solar/);
	});
});

describe('deck', () => {
	it('draws one slide of every type and writes a PNG per slide and one PDF, the same bytes twice', () => {
		const slides = sampleDeck();
		expect(slides.map((s) => s.type)).toEqual(['cover', 'section', 'statement', 'bullets', 'stat', 'quote', 'image', 'chart', 'poster', 'closing']);
		for (const s of slides) expect(slideSvg(s)).toContain('width="1920" height="1080"');
		const a = mkdtempSync(join(tmpdir(), 'ds-deck-'));
		const b = mkdtempSync(join(tmpdir(), 'ds-deck-'));
		expect(run(['deck', '--sample', '--out', a]).status).toBe(0);
		expect(run(['deck', '--sample', '--out', b]).status).toBe(0);
		const pdf = readFileSync(join(a, 'deck.pdf'));
		expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
		expect((pdf.toString('latin1').match(/\/Type \/Page\b/g) ?? []).length).toBe(10);
		expect(sha(pdf)).toBe(sha(readFileSync(join(b, 'deck.pdf'))));
		expect(readdirSync(a).filter((f) => f.endsWith('.png'))).toHaveLength(10);
		const bad = run(['deck', 'covr', '--title', 'x', '--json']);
		expect(bad.status).toBe(1);
		expect(bad.stdout).toMatch(/Did you mean cover/);
	}, 60000);
});

describe('merch', () => {
	it('sizes every item to its trim and bleed, cuts the sticker on the cut corner and never prints the die line', () => {
		for (const item of merchItems()) {
			for (const variant of item.variants) {
				const doc = merchSvg({ item, variant, slots: {}, sample: true });
				expect(doc.widthPx).toBe(Math.round((item.size[0] + 2 * item.bleed) * 300));
				expect(doc.svg).toContain(`width="${+(item.size[0] + 2 * item.bleed).toFixed(3)}in"`);
				expect(doc.printSvg).not.toContain('CutContour');
			}
		}
		const sticker = merchSvg({ item: merchItems().find((i) => i.id === 'sticker')!, variant: 'green', slots: {} });
		expect(sticker.svg).toMatch(/<g id="CutContour"><path d="M127.5 37.5L/);
		const r = run(['merch', 'tshirt', '--json']);
		expect(r.status).toBe(1);
	});
});

describe('video', () => {
	it.runIf(spawnSync('ffmpeg', ['-version']).status === 0)('encodes MP4 and WebM byte for byte the same, and a still frame', () => {
		const a = mkdtempSync(join(tmpdir(), 'ds-mp4-'));
		const args = ['video', '--format', 'square', '--template', 'poster', '--poster', 'identity', '--export', 'mp4,webm,still', '--json'];
		const one = JSON.parse(run([...args, '--out', a, '--name', 'one']).stdout);
		const two = JSON.parse(run([...args, '--out', a, '--name', 'two']).stdout);
		const by = (doc: { files: { format: string; sha256: string; path: string }[] }, f: string) => doc.files.filter((x) => x.format === f).map((x) => x.sha256);
		expect(by(one, 'mp4')).toEqual(by(two, 'mp4'));
		expect(by(one, 'webm')).toEqual(by(two, 'webm'));
		expect(one.files.some((f: { path: string }) => f.path.endsWith('one-still.png'))).toBe(true);
	}, 60000);
});

describe('figma', () => {
	it('turns every theme into a mode and keeps each script under the tool limit', () => {
		const doc = figmaTokens();
		expect(doc.modes).toEqual(['API · Field', 'Enterprise · Earth']);
		const ink = doc.variables.find((v) => v.css === '--ds-color-text-default')!;
		expect(ink.values.length).toBe(2);
		for (const s of figmaTokenScripts(doc)) expect(s.length).toBeLessThan(45000);
	});

	it('flags off-brand values with the nearest token and passes brand ones', () => {
		const found = checkFigmaValues('<div className="bg-[#F4F1EA] text-[#ff0000] rounded-[12px] font-[Inter]"/>');
		expect(found.find((f) => f.value === '#F4F1EA')?.ok).toBe(true);
		expect(found.find((f) => f.value === '#ff0000')?.ok).toBe(false);
		expect(found.find((f) => f.kind === 'radius')?.message).toMatch(/nothing in the brand is rounded/);
		expect(found.find((f) => f.kind === 'font')?.ok).toBe(false);
	});

	it('writes push files and prints the MCP steps without calling Figma', () => {
		const dir = mkdtempSync(join(tmpdir(), 'ds-figma-'));
		const r = run(['figma', 'push', 'illustration', 'apicore', '--ground', 'bone', '--out', dir, '--json']);
		expect(r.status).toBe(0);
		const doc = JSON.parse(r.stdout);
		expect(doc.steps.map((s: { tool: string }) => s.tool)).toEqual(expect.arrayContaining(['create_session', 'use_figma', 'upload_assets', 'get_screenshot']));
		expect(readFileSync(join(dir, 'push-illustration-wire-apicore-bone.js'), 'utf8')).toContain('createNodeFromSvg');
		expect(run(['figma', 'pushh']).status).toBe(1);
	});
});

describe('manifest and help', () => {
	it('lists every asset command and keeps help rows apart', () => {
		const data = JSON.parse(execFileSync(process.execPath, [BIN, 'manifest', '--json'], { encoding: 'utf8' }));
		expect(data.commands.map((c: { name: string }) => c.name)).toEqual(expect.arrayContaining(['image', 'deck', 'video', 'merch', 'illustrate', 'figma tokens', 'figma push', 'figma pull', 'figma check']));
		expect(data.illustrations.styles.map((s: { id: string }) => s.id)).toEqual(['wire', 'iso', 'contours', 'trace']);
		expect(data.merch.items.map((i: { id: string }) => i.id)).toEqual(expect.arrayContaining(['tee-front', 'tee-back', 'hoodie-front', 'cap-front', 'tote', 'mug-wrap', 'sticker', 'poster']));
		const text = execFileSync(process.execPath, [BIN, 'manifest'], { encoding: 'utf8' });
		for (const line of text.split('\n').filter((l) => /^ {2}\S/.test(l))) expect(line).toMatch(/^ {2}\S.*? {2,}\S|^ {2}\S+$/);
		for (const cmd of ['image', 'deck', 'merch', 'illustrate']) {
			const list = execFileSync(process.execPath, [BIN, cmd, '--list'], { encoding: 'utf8' });
			for (const line of list.split('\n').filter((l) => /^ {2}[\w-]+/.test(l))) expect(line).toMatch(/^ {2}[\w-]+( {2,}\S|$)/);
		}
	});
});
