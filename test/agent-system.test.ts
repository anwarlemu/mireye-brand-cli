import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { principlesDocument, principlesFor } from '../src/brand/principles.js';
import { fontCatalog, logoCatalog, tokenByName, tokenCatalog, voiceCatalog } from '../src/brand/system.js';
import { manifestData } from '../src/commands/manifest.js';
import { componentEmit, componentInspect, componentList } from '../src/library/emit.js';
import { VIDEO_FORMATS, VIDEO_TEMPLATES, videoCatalog, videoTiming, type VideoFormatId, type VideoTemplateId } from '../src/video/catalog.js';
import { frameSvg } from '../src/video/compose.js';
import { renderVideo } from '../src/video/render.js';
import { encodeApng } from '../src/video/apng.js';

const ROOT = join(import.meta.dirname, '..');
const BIN = join(ROOT, 'bin.js');

function run(args: string[]) {
	try {
		return { status: 0, stdout: execFileSync(process.execPath, [BIN, ...args], { encoding: 'utf8' }), stderr: '' };
	} catch (error) {
		const failed = error as { status: number; stdout?: string; stderr?: string };
		return { status: failed.status, stdout: failed.stdout ?? '', stderr: failed.stderr ?? '' };
	}
}

describe('manifest', () => {
	it('lists every capability an agent needs', () => {
		const data = manifestData();
		expect(data.entry).toBe('manifest');
		expect(data.registry.theme).toBe('theme');
		expect(data.commands.map((command) => command.name)).toEqual(expect.arrayContaining(['manifest', 'describe', 'brand', 'principles', 'component emit', 'image', 'video']));
		expect(data.images.formats.map((format) => format.id).slice(0, 7)).toEqual(['og', 'square', 'portrait', 'landscape', 'story', 'x-banner', 'linkedin-banner']);
		expect(data.images.templates.map((template) => template.id)).toEqual(['headline', 'subtext', 'frame', 'quote', 'announcement', 'identity', 'window', 'post', 'parcels', 'scene', 'photo', 'tag', 'panel', 'chart', 'app', 'partner']);
		expect(data.videos.formats.map((format) => format.id)).toEqual(['square', 'vertical', 'landscape']);
		expect(data.videos.templates.map((template) => template.id)).toEqual(['social', 'announcement', 'product', 'poster']);
		expect(data.videos.formats.find((format) => format.id === 'vertical')).toMatchObject({ width: 1080, height: 1920, ratio: '9:16' });
		expect(data.videos.formats.find((format) => format.id === 'landscape')).toMatchObject({ width: 1920, height: 1080, ratio: '16:9' });
		expect(data.brand.tokenGroups.map((group) => group.id)).toEqual(['color', 'type', 'spacing', 'radii', 'motion', 'other']);
		expect(data.components.find((item) => item.name === 'button')?.states).toContain('Preview');
		expect(data.principles.surfaces).toEqual(['product', 'website']);
		expect(data.principles.voiceBanned.length).toBeGreaterThan(3);
	});
});

describe('brand system', () => {
	it('groups tokens and rejects unknown groups and names', () => {
		const color = tokenCatalog('color');
		expect(color.tokens.color['--ds-color-bone']).toBe('#F4F1EA');
		expect(color.tokens.color['--ds-color-forest']).toBe('#1E231C');
		const radii = tokenCatalog('radii');
		const radiusTokens = Object.entries(radii.tokens.radii).filter(([name]) => name.startsWith('--ds-radius-'));
		expect(radiusTokens.length).toBeGreaterThan(0);
		expect(radiusTokens.every(([, value]) => value === '0')).toBe(true);
		expect(radii.tokens.radii['--ds-cut']).toBe('8px');
		expect(tokenCatalog('motion').tokens.motion['--ds-duration-base']).toBe('200ms');
		expect(tokenCatalog('type').tokens.type['--ds-font-weight-bold']).toBe('500');
		expect(tokenByName('--ds-color-bone')).toMatchObject({ token: '--ds-color-bone', value: '#F4F1EA', group: 'color' });
		expect(() => tokenCatalog('colour')).toThrow(/Unknown token group/);
		expect(() => tokenByName('--ds-color-nope')).toThrow(/Unknown token/);
	});

	it('reports the font files that exist and does not invent a wordmark', () => {
		const fonts = fontCatalog();
		expect(fonts.sans.family).toBe('Gilroy');
		expect(fonts.sans.files.map((file) => file.file)).toEqual(['Gilroy-Regular.woff2', 'Gilroy-Medium.woff2']);
		expect(fonts.sans.files.every((file) => file.present)).toBe(true);
		expect(fonts.mono.family).toBe('DM Mono');
		expect(fonts.mono.files.every((file) => file.present)).toBe(true);
		expect(fonts.sans.license).toMatch(/license/i);
		const logos = logoCatalog();
		expect(logos.files.map((file) => file.file)).toEqual(['mark.svg']);
		expect(logos.wordmark).toBeNull();
		expect(logos.notInRepo.join(' ')).toMatch(/wordmark/);
		expect(logos.notInRepo.join(' ')).toMatch(/clear-space/);
		expect(logos.usage.some((rule) => /logomark/i.test(rule.text))).toBe(true);
	});

	it('reads voice from the principles file', () => {
		const voice = voiceCatalog();
		expect(voice.banned).toEqual(expect.arrayContaining(['seamless', 'revolutionary', 'leverage', 'elevate']));
		expect(voice.text).toMatch(/Sentence case/);
		expect(voice.text).toMatch(/American spelling/);
	});
});

describe('principles', () => {
	it('returns product and website rules from the principles file', () => {
		const doc = principlesDocument();
		expect(doc.product.rules.join(' ')).toMatch(/cut corner/);
		expect(doc.product.dont.join(' ')).toMatch(/Rounded corners/);
		expect(doc.website.rules.join(' ')).toMatch(/--ds-color-bg-page/);
		expect(doc.website.do.length).toBeGreaterThan(0);
		expect(doc.website.dont.join(' ')).toMatch(/nonzero corner radius/);
		expect(doc.website.rules.join(' ')).toMatch(/does not choose between the 20px line and the 24px line/);
		expect(doc.singleLook).toBe(true);
		const site = principlesFor('site');
		expect(site).toHaveProperty('website');
		expect(site).not.toHaveProperty('product');
		expect(() => principlesFor('marketing')).toThrow(/Unknown surface/);
	});
});

describe('components', () => {
	it('lists, inspects and emits real example markup', () => {
		const list = componentList();
		expect(list.items.length).toBeGreaterThan(50);
		expect(list.items.find((item) => item.name === 'button')?.example).toBe(true);
		expect(list.items.find((item) => item.name === 'utils')?.example).toBe(false);
		const button = componentInspect('Button');
		expect(button.name).toBe('button');
		expect(button.props.variants.variant).toEqual(expect.arrayContaining(['default', 'outline', 'ghost', 'destructive']));
		expect(button.props.defaults).toMatchObject({ variant: 'default', size: 'default' });
		expect(button.props.fields.map((field) => field.name)).toEqual(expect.arrayContaining(['loading', 'arrow']));
		expect(button.states).toEqual(expect.arrayContaining(['Preview', 'Variants', 'Loading', 'States']));
		expect(button.source[0].content).toContain('function Button');
		const emitted = componentEmit('button', 'Preview');
		expect(emitted.code).toContain('export function Preview');
		expect(emitted.code).toContain('Find sites');
		expect(emitted.code).toContain('from "@/components/ui/button"');
		expect(emitted.state).toBe('Preview');
		expect(componentEmit('button', 'preview').state).toBe('Preview');
		expect(() => componentEmit('button', 'HoverGlow')).toThrow(/Unknown state/);
		expect(() => componentInspect('not-a-component')).toThrow(/Unknown component/);
		expect(() => componentEmit('utils')).toThrow(/No example/);
	});
});

describe('video', () => {
	it('derives timing from the duration token', () => {
		expect(videoTiming()).toMatchObject({ fps: 12, durationMs: 2000, frameCount: 24, plays: 1 });
		expect(videoCatalog().renderer).toBe('svg-resvg-apng');
	});

	it('rejects unknown formats, templates and fields', () => {
		const listed = run(['video', '--list', '--json']);
		expect(listed.status).toBe(0);
		expect(JSON.parse(listed.stdout).templates).toHaveLength(4);
		const unknown = run(['video', '--format', 'poster', '--template', 'social', '--title', 'Parcel survey', '--json']);
		expect(unknown.status).not.toBe(0);
		expect(JSON.parse(unknown.stdout)).toMatchObject({ ok: false });
		expect(unknown.stdout).toMatch(/Unknown format/);
		const field = run(['video', '--format', 'square', '--template', 'social', '--title', 'Parcel survey', '--content', join(ROOT, 'package.json'), '--json']);
		expect(field.status).not.toBe(0);
		expect(field.stdout).toMatch(/Unknown field|must be a JSON object|needs --title/);
	});

	it('renders every template as deterministic frames and one byte-identical APNG', async () => {
		const dir = mkdtempSync(join(tmpdir(), 'ds-video-'));
		const formats = Object.keys(VIDEO_FORMATS) as VideoFormatId[];
		const templates = Object.keys(VIDEO_TEMPLATES) as VideoTemplateId[];
		for (const format of formats) {
			for (const template of templates) {
				const content = template === 'announcement' ? { kicker: 'Field note', title: 'The sheet is ready.', subtitle: 'Same marks, new note.' } : template === 'poster' ? { poster: 'identity' } as never : { title: 'Parcel survey', subtitle: 'Boundaries and access.' };
				const first = frameSvg(format, template, 'api', content, 0, 4);
				const last = frameSvg(format, template, 'api', content, 3, 4);
				expect(first).toBe(frameSvg(format, template, 'api', content, 0, 4));
				expect(first).toContain(`width="${VIDEO_FORMATS[format].width}"`);
				expect(first).toContain('M8.84329');
				expect(last).not.toBe(first);
				expect(last).toContain('#1E231C');
			}
		}
		const earth = frameSvg('square', 'social', 'enterprise', { title: 'Parcel survey' }, 3, 4);
		expect(earth).toContain('#1F1813');
		expect(earth).not.toContain('#1E231C');
		const once = await renderVideo({ format: 'square', template: 'social', theme: 'api', content: { title: 'Parcel survey' }, exports: ['apng'], outDir: dir, name: 'a', frameCount: 2 });
		const twice = await renderVideo({ format: 'square', template: 'social', theme: 'api', content: { title: 'Parcel survey' }, exports: ['apng'], outDir: dir, name: 'b', frameCount: 2 });
		const a = readFileSync(join(dir, 'a.apng'));
		const b = readFileSync(join(dir, 'b.apng'));
		expect(a.equals(b)).toBe(true);
		expect(once.files[0].sha256).toBe(twice.files[0].sha256);
		expect(a.readUInt32BE(16)).toBe(1080);
		expect(a.readUInt32BE(20)).toBe(1080);
		const actl = a.indexOf('acTL');
		expect(a.readUInt32BE(actl + 4)).toBe(2);
		expect(once.fps).toBe(12);
	}, 60000);

	it('muxes a two-frame APNG with one play', () => {
		const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
		const apng = encodeApng([png, png], 12);
		expect(apng.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
		expect(apng.includes(Buffer.from('acTL'))).toBe(true);
		expect(apng.includes(Buffer.from('fdAT'))).toBe(true);
		const actl = apng.indexOf('acTL');
		expect(apng.readUInt32BE(actl + 4)).toBe(2);
		expect(apng.readUInt32BE(actl + 8)).toBe(1);
	});
});

describe('agent cli', () => {
	it('answers manifest, describe, brand, principles and component as JSON and rejects unknown options', () => {
		const manifest = JSON.parse(run(['manifest', '--json']).stdout);
		expect(manifest.components.length).toBeGreaterThan(50);
		expect(JSON.parse(run(['describe', '--json']).stdout).entry).toBe('manifest');
		expect(JSON.parse(run(['brand', 'tokens', '--group', 'spacing', '--json']).stdout).tokens.spacing['--ds-space-4']).toBe('1rem');
		expect(JSON.parse(run(['principles', 'website', '--json']).stdout).website.dont.length).toBeGreaterThan(0);
		const emitted = JSON.parse(run(['component', 'emit', 'button', '--state', 'Preview', '--json']).stdout);
		expect(emitted.code).toContain('Find sites');
		const bad = run(['brand', 'tokens', '--group', 'nope', '--json']);
		expect(bad.status).not.toBe(0);
		expect(JSON.parse(bad.stdout).error).toMatch(/Unknown token group/);
		const option = run(['video', '--format', 'square', '--template', 'social', '--title', 'Parcel survey', '--fps', '60', '--json']);
		expect(option.status).not.toBe(0);
		expect(option.stdout).toMatch(/unknown option/i);
		const image = run(['image', '--format', 'poster', '--template', 'headline', '--title', 'Parcel survey', '--json']);
		expect(image.status).not.toBe(0);
		expect(image.stdout).toMatch(/Unknown size/);
	});
});
