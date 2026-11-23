import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { adapter, paint } from '../../src/design/adapter.js';
import { designConformance } from './conformance.js';
import { imageCommand } from '../../src/commands/image.js';
import { FLAG, type ContentKey } from '../../src/image/catalog.js';
import type { DesignDoc, TemplateInfo } from '../../src/design/index.js';

const dir = mkdtempSync(join(tmpdir(), 'ds-design-'));
const picture = join(dir, 'aerial.png');
const { Resvg } = await import('@resvg/resvg-js');
writeFileSync(picture, new Resvg('<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420"><rect width="640" height="420" fill="#8a8f6a"/><rect x="80" y="60" width="240" height="180" fill="#f4f4f4"/><rect x="340" y="180" width="200" height="160" fill="#30402c"/></svg>').render().asPng());

const ROWS = 'Sites | 138\nParcels | 64\nGrid | 42';
const copyFor = (long: boolean) => (t: TemplateInfo): Record<string, string> =>
	Object.fromEntries(
		t.copy.map(({ id }) => {
			if (id === 'chart') return [id, long ? 'data_center_siting | 138\nsite_selection | 64\nutilities | 42' : ROWS];
			if (id === 'stat') return [id, long ? '1,000,000+' : '42%'];
			if (id === 'partner') return [id, 'Acme'];
			if (id === 'labels') return [id, 'A | B | C'];
			if (id === 'items') return [id, long ? 'Everything your agents need to search and reply | One bad address does not fail the rest | Every field cited' : 'Own it | Cite it'];
			if (id === 'suggestions') return [id, 'Is it in a flood zone? | How steep is it?'];
			if (id === 'place') return [id, '39.7, -104.9'];
			if (id === 'url' || id === 'footer') return [id, 'example.com'];
			if (id === 'badge') return [id, 'Field note'];
			if (id === 'callout') return [id, '38.6 ac\nNear the road'];
			if (id === 'headline' || id === 'quote') return [id, long ? 'Everything your agents need to search, buy and reply in one place' : 'Ship your next idea today'];
			return [id, long ? 'A second line that says a little more about it, and then some more' : 'One line about it'];
		}),
	);

/** The plain image command's bytes for a document with no edits. */
async function plain(doc: DesignDoc): Promise<Uint8Array | undefined> {
	if (doc.kind !== 'image') return undefined;
	const out = mkdtempSync(join(tmpdir(), 'ds-plain-'));
	const flags: Record<string, string> = {};
	for (const [slot, value] of Object.entries(doc.copy)) flags[(Object.keys(FLAG) as ContentKey[]).find((k) => FLAG[k] === slot) ?? slot] = value;
	const write = process.stdout.write.bind(process.stdout);
	process.stdout.write = (() => true) as typeof process.stdout.write;
	try {
		await imageCommand(doc.template, { ...flags, size: doc.size.id, theme: doc.theme, ...(doc.images.picture ? { image: doc.images.picture } : {}), ...(doc.seed ? { seed: String(doc.seed) } : {}), format: 'png', out, name: 'plain', json: true });
	} finally {
		process.stdout.write = write;
	}
	return readFileSync(join(out, 'plain.png'));
}

// Every size is drawn and checked in test/words.test.ts; here the ones whose zones and shapes differ most.
const SIZES = ['og', 'portrait', 'story', 'x-banner', 'linkedin-page', 'avatar', 'slide'];
designConformance(adapter(), { paint, picture, short: copyFor(false), long: copyFor(true), plain, sizes: (t) => t.sizes.filter((s) => SIZES.includes(s)), timeout: 240_000 });
