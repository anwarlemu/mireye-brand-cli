import { readFileSync } from 'node:fs';
import { pkgPath } from '../lib/paths.js';

export const PRINCIPLE_SURFACES = ['product', 'website'] as const;
export type PrincipleSurface = (typeof PRINCIPLE_SURFACES)[number];

type Part = { text: string; bullets: string[] };
type Section = Part & { id: string; heading: string; parts: Record<string, Part> };

const FILE = 'brand/principles.md';

function bulletsOf(text: string): string[] {
	const bullets: string[] = [];
	let current = '';
	for (const line of text.split('\n')) {
		const trimmed = line.trim();
		if (trimmed.startsWith('- ')) {
			if (current) bullets.push(current);
			current = trimmed.slice(2).trim();
		} else if (current && trimmed && !trimmed.startsWith('#')) current = `${current} ${trimmed}`;
		else if (!trimmed && current) {
			bullets.push(current);
			current = '';
		}
	}
	if (current) bullets.push(current);
	return bullets;
}

function parse(markdown: string): { title: string; sections: Section[] } {
	const lines = markdown.replace(/\r\n/g, '\n').split('\n');
	const title = lines.find((line) => line.startsWith('# '))?.replace(/^# /, '').trim() ?? '';
	const chunks: { heading: string; body: string }[] = [];
	let current: { heading: string; body: string[] } | undefined;
	for (const line of lines) {
		if (line.startsWith('## ')) {
			if (current) chunks.push({ heading: current.heading, body: current.body.join('\n').trim() });
			current = { heading: line.slice(3).trim(), body: [] };
		} else if (current) current.body.push(line);
	}
	if (current) chunks.push({ heading: current.heading, body: current.body.join('\n').trim() });
	const sections = chunks.map((chunk) => {
		const pieces = chunk.body.split(/^### /m);
		const intro = pieces[0]?.trim() ?? '';
		const parts: Record<string, Part> = {};
		for (const piece of pieces.slice(1)) {
			const [heading, ...rest] = piece.split('\n');
			const text = rest.join('\n').trim();
			parts[heading.trim()] = { text, bullets: bulletsOf(text) };
		}
		return { id: chunk.heading, heading: chunk.heading, text: intro, bullets: bulletsOf(intro), parts };
	});
	return { title, sections };
}

function section(sections: Section[], heading: string): Section {
	const found = sections.find((item) => item.heading === heading || item.heading.startsWith(heading));
	if (!found) throw new Error(`${FILE} has no "${heading}" section.`);
	return found;
}

function voiceOf(sections: Section[]) {
	const voice = section(sections, 'Voice');
	const text = voice.text.trim();
	const banned = [...text.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
	return {
		source: `${FILE}#Voice`,
		text,
		sentences: text.split(/(?<=\.)\s+/).map((sentence) => sentence.trim()).filter(Boolean),
		banned,
	};
}

export function principlesDocument() {
	const markdown = readFileSync(pkgPath('brand', 'principles.md'), 'utf8');
	const { title, sections } = parse(markdown);
	const idea = section(sections, 'The idea');
	const product = section(sections, 'The product');
	const always = section(sections, 'Always');
	const refuse = section(sections, 'Refuse');
	const website = section(sections, 'The website');
	const shared = {
		source: FILE,
		idea: idea.text,
		do: always.bullets,
		dont: refuse.bullets,
	};
	return {
		schemaVersion: 1 as const,
		source: FILE,
		title,
		singleLook: true,
		note: 'Product and website share one look. The Enterprise theme swaps the lead ink. It is not a second system. Rules are copied from brand/principles.md.',
		surfaces: [...PRINCIPLE_SURFACES],
		aliases: { site: 'website' },
		shared,
		product: {
			source: `${FILE}#The product`,
			text: product.text,
			rules: product.bullets,
			do: shared.do,
			dont: shared.dont,
		},
		website: {
			source: `${FILE}#The website`,
			text: website.text,
			rules: website.bullets,
			do: website.parts.Do?.bullets ?? [],
			dont: website.parts["Don't"]?.bullets ?? [],
		},
		voice: voiceOf(sections),
	};
}

export function principlesFor(surface: string | undefined) {
	const doc = principlesDocument();
	if (!surface) return doc;
	const id = surface === 'site' ? 'website' : surface;
	if (id !== 'product' && id !== 'website') {
		throw new Error(`Unknown surface "${surface}". Surfaces: product, website. site is the website.`);
	}
	return {
		schemaVersion: 1 as const,
		source: doc.source,
		surface: id,
		singleLook: doc.singleLook,
		note: doc.note,
		shared: doc.shared,
		...(id === 'product' ? { product: doc.product } : { website: doc.website }),
		voice: doc.voice,
	};
}
