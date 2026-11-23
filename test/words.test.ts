import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { cleanSlide, slideDraw } from '../src/deck/slides.js';
import { checkDesign, errorsOf, type DesignDoc, type DrawnLayer, type TemplateInfo } from '../src/design/index.js';
import { adapter, wordColors } from '../src/design/adapter.js';
import { cleanContent, FLAG, FORMATS, sizeOf, sizesFor, templateFields, templateIds, type ContentKey, type ImageContent } from '../src/image/catalog.js';
import { frameOf, meets, within } from '../src/image/layers.js';
import { posterFloors } from '../src/image/poster.js';
import { drawImage } from '../src/image/render.js';
import { merchItems, merchSvg, PX_PER_IN } from '../src/merch/merch.js';
import { videoFrame } from '../src/video/compose.js';

const ROOT = join(import.meta.dirname, '..');
const BIN = join(ROOT, 'bin.js');
const run = (args: string[], cwd = ROOT) => {
	const r = spawnSync(process.execPath, [BIN, ...args], { cwd, encoding: 'utf8' });
	return { status: r.status ?? 1, out: r.stdout, err: r.stderr, data: () => JSON.parse(r.stdout) };
};
const temp = () => mkdtempSync(join(tmpdir(), 'ds words '));
const REFUSED = /shorten|does not fit|no room|fewer|too many/i;

const dir = temp();
const picture = join(dir, 'my aerial.png');
const { Resvg } = await import('@resvg/resvg-js');
const png = (svg: string) => new Resvg(svg).render().asPng();
writeFileSync(picture, png('<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420"><rect width="640" height="420" fill="#8a8f6a"/><rect x="80" y="60" width="240" height="180" fill="#ffffff"/></svg>'));

type Copy = Partial<Record<ContentKey, string>>;
const COPIES: Record<string, Copy> = {
	short: { title: 'One call, every parcel', subtitle: 'Ownership, flood and terrain.', kicker: 'New', quote: 'It read every parcel.', attribution: 'Head of data, Acme', callout: '38.6 ac\n37.54, -77.43', chart: 'Sites | 138\nParcels | 64\nGrid | 42', partner: 'Acme', labels: 'A | B | C' },
	long: { title: 'Everything your agents need to search, buy and reply in one place', subtitle: 'One API to connect your agents to physical world data, enrichment, tools and signals, with every field cited.', kicker: 'Announcement for teams', quote: 'We sent hundreds of locations in one call, and one bad address did not fail the rest of them.', attribution: 'Head of data and infrastructure, Acme', callout: 'Central Iowa field station\n41.9000, -93.5000', chart: 'data_center_siting | 138\nsite_selection | 64\nutilities | 42\ngrid_interconnect | 38', partner: 'Acme Holdings' },
	word: { title: 'Grundstücksverkehrsgenehmigungszuständigkeitsübertragungsverordnung', quote: 'Grundstücksverkehrsgenehmigungszuständigkeitsübertragungsverordnung', chart: 'A | 1', partner: 'Acme' },
	odd: { title: '"Quotes" & <tags> don’t break: 50% of “it”', subtitle: 'Ça va; Ж & Ω, 5 × 3 − 2', quote: 'R&D said "no"', chart: 'R&D <x> | 1,200\nOps | 0', partner: 'A&B' },
	most: { title: 'A headline that keeps going on and on until it reaches the limit of the field, which is one hundred and sixty characters, and here it is at last, the end of it', subtitle: 'A long supporting line, as when someone pastes a whole paragraph in the box for a single line, which people do all of the time, no matter how often they are told that it is meant to be one short line.', quote: 'A long quote. '.repeat(20).trim(), chart: 'One | 1\nTwo | 2\nThree | 3\nFour | 4\nFive | 5\nSix | 6\nSeven | 7\nEight | 8', partner: 'Acme International Land Holdings' },
};

const docFor = (template: string, size: { id: string; width: number; height: number }, content: ImageContent): DesignDoc =>
	({ version: 1, brand: '', kind: 'image', template, size, copy: Object.fromEntries(Object.entries(content).filter(([k]) => !['image', 'scene', 'page'].includes(k)).map(([k, v]) => [FLAG[k as ContentKey], v!])), images: {}, options: {}, layers: {}, history: [], future: [] }) as DesignDoc;
const errors = (doc: DesignDoc, layers: DrawnLayer[]) => errorsOf(checkDesign({ doc, info: {} as TemplateInfo, layers, adapter: { colors: wordColors } })).map((e) => `${e.rule}: ${e.message}`);

describe('words are never lost', () => {
	for (const template of templateIds())
		it(`${template}: every size and copy is drawn whole, clear and readable, or refused`, () => {
			const problems: string[] = [];
			let drawn = 0;
			for (const id of sizesFor(template))
				for (const [name, copy] of Object.entries(COPIES)) {
					const size = id === 'custom' ? sizeOf('custom', 900, 1400) : sizeOf(id);
					const f = templateFields(template);
					const content: ImageContent = {};
					for (const key of [...f.required, ...f.optional]) if (key === 'image') content.image = picture;
						else if (copy[key]) content[key] = copy[key];
					try {
						const d = drawImage({ template, size, content });
						problems.push(...errors(docFor(template, size, content), d.layers).map((e) => `${template} ${id} ${name} ${e}`));
						// The engine's own free area: nothing that matters is under what a platform lays over the picture.
						const F = frameOf(size, posterFloors());
						for (const l of d.layers) if (l.kind === 'text' || l.kind === 'logo' || (l.kind === 'art' && !l.bleeds)) for (const r of l.ink ?? [l.box]) for (const a of F.avoid) if (meets(r, a, 0.5)) problems.push(`${template} ${id} ${name} ${l.id} is under ${a.name}`);
						drawn++;
					} catch (error) {
						expect((error as Error).message, `${template} ${id} ${name}`).toMatch(REFUSED);
						expect(name, `${template} refuses ${name} copy at ${id}: ${(error as Error).message}`).not.toBe(template === 'app' || template === 'parcels' || template === 'frame' ? '' : 'short');
					}
				}
			expect(problems.join('\n')).toBe('');
			expect(drawn).toBeGreaterThan(20);
		}, 120000);

	it('keeps every word of the headline the audit lost', () => {
		const title = 'Everything your agents need to search, buy and reply in one place';
		for (const template of ['headline', 'announcement', 'subtext'])
			for (const size of Object.keys(FORMATS).filter((id) => id !== 'avatar')) {
				const l = drawImage({ template, size: sizeOf(size), content: { title, ...(template === 'subtext' ? { subtitle: 'x' } : {}) } }).layers.find((x) => x.id === 'headline')!;
				expect(l.text!.drawn, `${template} ${size}`).toBe(title);
			}
	});

	it('says which words are too long, and about how many fit', () => {
		expect(() => drawImage({ template: 'headline', size: sizeOf('linkedin-page'), content: { title: 'word '.repeat(400) } })).toThrow(/headline does not fit headline at linkedin-page.*Shorten it to about \d+ characters/);
		expect(() => drawImage({ template: 'post', size: sizeOf('youtube-thumbnail'), content: { title: 'Land', subtitle: 'A long supporting line, as when someone pastes a whole paragraph in the box for a single line, which people do all of the time, no matter how often they are told that it is meant to be one short line. '.repeat(2).slice(0, 280) } })).toThrow(/line under the headline \(--body\)/);
	});

	it('refuses letters the typeface has no shapes for, instead of drawing boxes', () => {
		for (const title of ['物理世界', 'Land 😀', 'مرحبا']) expect(() => drawImage({ template: 'window', size: sizeOf('og'), content: { title } })).toThrow(/no letters for/);
		expect(() => merchSvg({ item: merchItems().find((i) => i.id === 'tee-front')!, variant: 'on-light', slots: { headline: '物理' } })).toThrow(/no letters for/);
		expect(() => videoFrame('square', 'social', 'api', { title: '物理' }, 0, 24)).toThrow(/no letters for/);
		expect(() => slideDraw(cleanSlide({ type: 'bullets', title: 'x', items: 'a | 物' }, 0))).toThrow(/no letters for/);
	});

	it('slides and clips fit their words or say they do not', () => {
		expect(() => slideDraw(cleanSlide({ type: 'bullets', title: 'x', items: Array.from({ length: 6 }, () => 'a long point that goes on and on and on until it is far too long for one row of a slide').join(' | ') }, 0))).not.toThrow();
		const cover = slideDraw(cleanSlide({ type: 'cover', title: COPIES.most.title!, subtitle: COPIES.long.subtitle! }, 0));
		expect(cover.layers.find((l) => l.id === 'headline')!.text!.drawn).toBe(COPIES.most.title);
		expect(errors({ ...docFor('slide-cover', { id: 'slide', width: 1920, height: 1080 }, {}), kind: 'slide', copy: { headline: COPIES.most.title!, body: COPIES.long.subtitle! } }, cover.layers)).toEqual([]);
		const clip = videoFrame('vertical', 'announcement', 'api', { kicker: 'New', title: COPIES.most.title, subtitle: COPIES.most.subtitle }, 23, 24);
		expect(clip.layers.find((l) => l.id === 'headline')!.text!.drawn).toBe(COPIES.most.title);
	});
});

describe('nothing is invented, nothing is ignored', () => {
	it('draws only the words passed, the address and the product panel names', () => {
		for (const template of templateIds()) {
			const f = templateFields(template);
			const content: ImageContent = {};
			for (const key of f.required) content[key] = key === 'image' ? picture : COPIES.short[key];
			const d = drawImage({ template, size: sizeOf('og'), content });
			for (const l of d.layers) if (l.text && !l.text.own) expect(Object.values(content).join(' '), `${template} ${l.id}`).toContain(l.text.asked.split(/[|\n]/)[0]!.split(' ')[0]!);
			expect(errors(docFor(template, sizeOf('og'), content), d.layers)).toEqual([]);
		}
		const tee = merchSvg({ item: merchItems().find((i) => i.id === 'tee-front')!, variant: 'on-light', slots: {} });
		expect(tee.layers.some((l) => l.text)).toBe(false);
		expect(() => merchSvg({ item: merchItems().find((i) => i.id === 'poster')!, variant: 'bone', slots: {} })).toThrow(/needs --headline/);
	});

	it('refuses copy a layout does not draw, and a picture it needs', () => {
		const t = run(['image', 'identity', '--size', 'og', '--title', 'Hello', '--out', dir, '--json']);
		expect(t.status).toBe(1);
		expect(t.data().error).toMatch(/identity draws no headline\. These do: .*window/);
		expect(run(['image', 'photo', '--size', 'og', '--headline', 'x', '--json']).data().error).toMatch(/needs --image/);
		expect(run(['image', 'window', '--size', 'og', '--headline', 'x', '--badge', 'New', '--json']).data().error).toMatch(/no badge/);
		expect(run(['merch', 'cap-front', '--headline', 'x', '--json']).data().error).toMatch(/carries no headline/);
		expect(run(['video', 'social', '--size', 'square', '--headline', 'x', '--quote', 'y', '--json']).status).toBe(1);
		expect(() => cleanContent({ page: 'two/five' })).toThrow(/2\/5/);
	});
});

describe('pictures', () => {
	const frame = (image: string) => () => drawImage({ template: 'frame', size: sizeOf('og'), content: { image } });
	it('names what is wrong with a picture', () => {
		const bytes = readFileSync(picture);
		const cut = join(dir, 'cut.png');
		writeFileSync(cut, bytes.subarray(0, bytes.length - 60));
		expect(frame(cut)).toThrow(/damaged PNG/);
		const jpg = join(dir, 'cut.jpg');
		const whole = readFileSync(join(ROOT, 'brand/reference/site-buttons-desktop.jpg'));
		writeFileSync(jpg, whole.subarray(0, Math.round(whole.length / 2)));
		expect(frame(jpg)).toThrow(/damaged JPEG/);
		expect(frame(join(dir, 'none.png'))).toThrow(/No image/);
		expect(frame(dir)).toThrow(/folder/);
		const big = join(dir, 'big.png');
		writeFileSync(big, Buffer.alloc(13 * 1024 * 1024));
		expect(frame(big)).toThrow(/larger than 12MB/);
	});

	it('reads a path with spaces, a transparent picture and a portrait one', () => {
		const clear = join(dir, 'clear.png');
		writeFileSync(clear, png('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="600"><circle cx="100" cy="300" r="80" fill="#335533"/></svg>'));
		for (const image of [picture, clear]) expect(frame(image)().svg).toContain('data:image/png;base64,');
	});

	it('keeps bone words readable over a white picture', () => {
		const white = join(dir, 'white.png');
		writeFileSync(white, png('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="40"><rect width="64" height="40" fill="#ffffff"/></svg>'));
		const content = { title: 'Central Iowa', subtitle: 'Every field cited.', image: white };
		expect(errors(docFor('photo', sizeOf('og'), content), drawImage({ template: 'photo', size: sizeOf('og'), content }).layers)).toEqual([]);
	});
});

describe('image command', () => {
	it('writes several sizes, every format, and names them by --out', () => {
		const out = temp();
		const r = run(['image', 'window', '--size', 'og,square,x', '--headline', 'One call', '--theme', 'green', '--format', 'png,svg,jpg,webp,pdf', '--out', out, '--json']);
		expect(r.status).toBe(0);
		expect(r.data().images.map((i: { format: string }) => i.format)).toEqual(['og', 'square', 'landscape']);
		expect(readFileSync(join(out, 'og-window.jpg')).subarray(0, 3).toString('hex')).toBe('ffd8ff');
		expect(readFileSync(join(out, 'og-window.webp')).subarray(8, 12).toString()).toBe('WEBP');
		expect(readFileSync(join(out, 'og-window.pdf')).subarray(0, 5).toString()).toBe('%PDF-');
		const one = run(['image', 'identity', '--size', 'custom', '--width', '900', '--height', '300', '--out', join(out, 'mine.jpg'), '--json']);
		expect(one.data().files.map((f: { format: string; width: number }) => [f.format, f.width])).toEqual([['jpg', 900]]);
		expect(existsSync(join(out, 'mine.jpg'))).toBe(true);
		expect(run(['image', 'identity', '--size', 'custom', '--json']).data().error).toMatch(/--width and --height/);
		expect(run(['image', 'window', '--size', 'avatar', '--headline', 'x', '--json']).data().error).toMatch(/mark alone/);
	}, 60000);

	it('draws a numbered carousel, all of it or none of it', () => {
		const out = temp();
		const file = join(out, 'set.json');
		writeFileSync(file, JSON.stringify({ size: 'portrait', theme: 'green', slides: [{ template: 'window', headline: 'One' }, { template: 'post', headline: 'Two', body: 'A line.' }, { template: 'headline', headline: 'Three' }] }));
		const r = run(['image', 'carousel', '--input', file, '--out', join(out, 'a'), '--format', 'png', '--json']);
		expect(r.status).toBe(0);
		expect(readdirSync(join(out, 'a'))).toEqual(['carousel-01.png', 'carousel-02.png', 'carousel-03.png']);
		expect(r.data().slides.map((s: { layers: DrawnLayer[] }) => s.layers.find((l) => l.id === 'page')!.text!.drawn)).toEqual(['1/3', '2/3', '3/3']);
		expect(new Set(r.data().slides.map((s: { ground: string }) => s.ground))).toEqual(new Set(['green']));
		writeFileSync(file, JSON.stringify({ slides: [{ template: 'window', headline: 'One' }, { template: 'window', headline: 'word '.repeat(31) , body: 'line '.repeat(55) }] }));
		const bad = run(['image', 'carousel', '--input', file, '--size', 'linkedin-page', '--out', join(out, 'b'), '--json']);
		expect(bad.status).toBe(1);
		expect(bad.data().error).toMatch(/^Slide 2:/);
		expect(existsSync(join(out, 'b'))).toBe(false);
	}, 60000);
});

describe('merch print files', () => {
	it('keeps words, logos and drawings inside the safe area, and bleeds only what fills the item', () => {
		for (const item of merchItems())
			for (const variant of item.variants) {
				const doc = merchSvg({ item, variant, slots: {}, sample: true });
				const s = (item.bleed + item.safe) * PX_PER_IN;
				const safe = { x: s, y: s, w: doc.widthPx - s * 2, h: doc.heightPx - s * 2 };
				for (const l of doc.layers) {
					if (l.bleeds) expect(within({ x: 0, y: 0, w: doc.widthPx, h: doc.heightPx }, l.box, 1), `${item.id} ${l.id} stops short of the bleed`).toBe(true);
					else if (l.kind === 'text' || l.kind === 'logo' || l.kind === 'art') expect(within(l.box, safe, 2), `${item.id} ${variant} ${l.id} leaves the safe area`).toBe(true);
				}
			}
	});

	it('writes a PDF with trim and bleed boxes, and refuses one for art on no ground', () => {
		const out = temp();
		expect(run(['merch', 'sticker', '--format', 'pdf', '--dpi', '72', '--out', out, '--json']).status).toBe(0);
		expect(readFileSync(join(out, 'sticker-bone.pdf')).toString('latin1')).toMatch(/\/TrimBox \[9 9 225 135\]/);
		expect(run(['merch', 'tote', '--format', 'pdf', '--out', out, '--json']).data().error).toMatch(/transparent ground/);
	}, 30000);
});

describe('design command', () => {
	it('mounts in the CLI: new, revise, undo, refusal, with exit codes', () => {
		const cwd = temp();
		const made = run(['design', 'new', 'post', '--size', 'x-banner', '--headline', 'One call, every parcel', '-o', 'b.design.json', '--json'], cwd);
		expect(made.status, made.out).toBe(0);
		expect(readdirSync(cwd).sort()).toEqual(['b.design.json', 'b.png']);
		const before = readFileSync(join(cwd, 'b.design.json'), 'utf8');
		expect(run(['design', 'revise', 'b.design.json', 'darker theme, logo top right, bigger headline', '--json'], cwd).status).toBe(0);
		expect(run(['design', 'undo', 'b.design.json', '--json'], cwd).status).toBe(0);
		expect(JSON.parse(readFileSync(join(cwd, 'b.design.json'), 'utf8')).layers).toEqual(JSON.parse(before).layers);
		const held = readFileSync(join(cwd, 'b.design.json'), 'utf8');
		const no = run(['design', 'revise', 'b.design.json', 'make it neon pink', '--json'], cwd);
		expect(no.status).toBe(1);
		expect(readFileSync(join(cwd, 'b.design.json'), 'utf8')).toBe(held);
		expect(run(['design', 'help'], cwd).out).toMatch(/revise/);
	}, 60000);

	it('draws merch, illustrations and clips from a document too', async () => {
		const a = adapter();
		for (const [id, copy] of [['merch-sticker', {}], ['merch-poster', { headline: 'One call' }], ['illustration-wire', {}], ['video-social', { headline: 'One call' }], ['video-parcels', { headline: 'One call' }]] as [string, Record<string, string>][]) {
			const t = a.templates().find((x) => x.id === id)!;
			const doc: DesignDoc = { version: 1, brand: a.brand, kind: t.kind, template: id, ...a.defaults(id, t.sizes[0]!), copy, images: {}, layers: {}, history: [], future: [] };
			const r = await a.render(doc, dir, { formats: ['png'], scale: 1 });
			expect(r.files.png!.length).toBeGreaterThan(1000);
			expect(errorsOf(checkDesign({ doc, info: t, layers: r.layers, adapter: a })), id).toEqual([]);
		}
	}, 60000);
});


describe('the logo keeps its clear space', () => {
	it('from every word, whatever the logo and headline are anchored to, in every template', () => {
		const problems: string[] = [];
		for (const template of templateIds()) {
			const can = adapter().templates().find((t) => t.id === template)!.layers;
			const anchorsOf = (id: string) => can.find((l) => l.id === id)?.can.anchors ?? [];
			const f = templateFields(template);
			const content: ImageContent = {};
			for (const key of [...f.required, ...f.optional]) if (key === 'image') content.image = picture;
				else if (COPIES.short[key]) content[key] = COPIES.short[key];
			const edits: Record<string, object>[] = [{}, ...anchorsOf('logo').map((anchor) => ({ logo: { anchor } })), ...anchorsOf('headline').map((anchor) => ({ headline: { anchor } })), ...anchorsOf('logo').map((anchor) => ({ logo: { anchor }, headline: { scale: 1.2 } }))];
			for (const id of ['og', 'x-banner', 'story'])
				for (const e of edits) {
					try {
						const d = drawImage({ template, size: sizeOf(id), content, edits: e });
						const logo = d.layers.filter((l) => l.kind === 'logo');
						for (const l of logo) {
							const zone = { x: l.box.x - l.logo!.clear, y: l.box.y - l.logo!.clear, w: l.box.w + l.logo!.clear * 2, h: l.box.h + l.logo!.clear * 2 };
							for (const t of d.layers.filter((x) => x.text && !x.over?.includes(l.id) && !l.over?.includes(x.id)))
								for (const r of t.ink ?? [t.box]) if (meets(r, zone, 0.5)) problems.push(`${template} ${id} ${JSON.stringify(e)}: ${t.id} in the logo's clear space`);
						}
						problems.push(...errors(docFor(template, sizeOf(id), content), d.layers).filter((x) => x.startsWith('logo')).map((x) => `${template} ${id} ${JSON.stringify(e)}: ${x}`));
					} catch (error) {
						expect((error as Error).message, `${template} ${id} ${JSON.stringify(e)}`).toMatch(/does not fit|no room|shorten/i);
					}
				}
		}
		expect(problems.join('\n')).toBe('');
	}, 300000);
});
