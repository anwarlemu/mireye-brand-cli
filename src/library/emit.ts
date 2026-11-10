import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cli } from '../lib/brand.js';
import { matchName, suggest } from '../lib/names.js';
import { pkgPath } from '../lib/paths.js';

type Docs = {
	name: string;
	title: string;
	type: string;
	surface: string;
	description: string;
	useFor: string;
	never: string[];
	source?: string;
	kinds: string[];
	files: string[];
	body: string;
};

const DIR: Record<string, string> = {
	ui: 'components/ui',
	site: 'components/site',
	product: 'components/product',
	visual: 'components/visuals',
	block: 'components/blocks',
	hook: 'hooks',
	lib: 'lib',
};

function unquote(value: string, quote: string): { text: string; consumed: number } {
	let out = '';
	let i = 0;
	for (; i < value.length; i++) {
		if (value[i] === '\\' && value[i + 1]) {
			out += value[i + 1];
			i += 1;
			continue;
		}
		if (value[i] === quote) return { text: out, consumed: i };
		out += value[i];
	}
	return { text: out, consumed: i };
}

function parseArray(value: string): string[] {
	const wrapped = value.trim();
	if (!wrapped.startsWith('[') || !wrapped.endsWith(']')) throw new Error(`Expected a list, got ${wrapped}.`);
	const body = wrapped.slice(1, -1);
	const items: string[] = [];
	let i = 0;
	while (i < body.length) {
		while (i < body.length && (body[i] === ' ' || body[i] === ',')) i += 1;
		if (i >= body.length) break;
		if (body[i] === '"' || body[i] === "'") {
			const quote = body[i];
			const got = unquote(body.slice(i + 1), quote);
			items.push(got.text);
			i += got.consumed + 2;
		} else {
			let j = i;
			while (j < body.length && body[j] !== ',') j += 1;
			items.push(body.slice(i, j).trim());
			i = j;
		}
	}
	return items;
}

function parseValue(raw: string): unknown {
	const value = raw.trim();
	if (value.startsWith('|') || value.startsWith('>')) throw new Error('Unsupported folded frontmatter.');
	if (value.startsWith('"')) return unquote(value.slice(1), '"').text;
	if (value.startsWith("'")) return unquote(value.slice(1), "'").text;
	if (value.startsWith('[')) return parseArray(value);
	return value;
}

function parseFrontmatter(file: string, text: string): Docs {
	const match = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
	if (!match) throw new Error(`${file} has no frontmatter.`);
	const raw: Record<string, unknown> = {};
	for (const line of match[1].split('\n')) {
		if (!line.trim()) continue;
		const split = line.indexOf(':');
		if (split < 1) throw new Error(`${file} has an unreadable frontmatter line.`);
		const key = line.slice(0, split).trim();
		raw[key] = parseValue(line.slice(split + 1));
	}
	for (const key of ['name', 'title', 'type', 'surface', 'description', 'use_for']) {
		if (typeof raw[key] !== 'string' || !raw[key]) throw new Error(`${file} is missing ${key}.`);
	}
	const type = String(raw.type);
	if (!DIR[type]) throw new Error(`${file} has unknown type "${type}".`);
	const ext = type === 'hook' || type === 'lib' ? 'ts' : 'tsx';
	const fallback = [`${DIR[type]}/${String(raw.name)}.${ext}`];
	const files = Array.isArray(raw.files) ? raw.files.map(String) : fallback;
	const never = raw.never === undefined ? [] : raw.never;
	if (!Array.isArray(never) || never.some((item) => typeof item !== 'string')) throw new Error(`${file} never must be a list of strings.`);
	return {
		name: String(raw.name),
		title: String(raw.title),
		type,
		surface: String(raw.surface),
		description: String(raw.description),
		useFor: String(raw.use_for),
		never,
		source: typeof raw.source === 'string' ? raw.source : undefined,
		kinds: Array.isArray(raw.kinds) ? raw.kinds.map(String) : [],
		files,
		body: match[2].trim(),
	};
}

let cache: Docs[] | undefined;

export function componentDocs(): Docs[] {
	if (cache) return cache;
	const dir = pkgPath('registry', 'docs');
	cache = readdirSync(dir)
		.filter((file) => file.endsWith('.md'))
		.sort()
		.map((file) => parseFrontmatter(file, readFileSync(join(dir, file), 'utf8')));
	return cache;
}

function sliceBrace(source: string, open: number): string {
	let depth = 0;
	let quote = '';
	for (let i = open; i < source.length; i++) {
		const char = source[i];
		if (quote) {
			if (char === '\\') {
				i += 1;
				continue;
			}
			if (char === quote) quote = '';
			continue;
		}
		if (char === '"' || char === "'" || char === '`') {
			quote = char;
			continue;
		}
		if (char === '{') depth += 1;
		else if (char === '}') {
			depth -= 1;
			if (depth === 0) return source.slice(open, i + 1);
		}
	}
	return source.slice(open);
}

function variantsIn(source: string): { variants: Record<string, string[]>; defaults: Record<string, string>; parsed: boolean } {
	const at = source.search(/\bvariants\s*:\s*\{/);
	if (at < 0) return { variants: {}, defaults: {}, parsed: false };
	const body = sliceBrace(source, source.indexOf('{', at)).slice(1, -1);
	const variants: Record<string, string[]> = {};
	let depth = 0;
	let token = '';
	let group = '';
	for (let i = 0; i < body.length; i++) {
		const char = body[i];
		if (char === '"' || char === "'" || char === '`') {
			const value = unquote(body.slice(i + 1), char);
			if (depth === 0 || depth === 1) token = value.text;
			i += value.consumed + 1;
			continue;
		}
		if (char === '{') {
			if (depth === 0 && group) variants[group] ??= [];
			depth += 1;
			token = '';
			continue;
		}
		if (char === '}') {
			depth -= 1;
			token = '';
			if (depth <= 0) group = '';
			continue;
		}
		if (char === ':') {
			const name = token.trim();
			if (depth === 0 && name) group = name;
			else if (depth === 1 && group && name && name !== 'className') {
				variants[group] ??= [];
				variants[group].push(name);
			}
			token = '';
			continue;
		}
		if (/[A-Za-z0-9_-]/.test(char)) token += char;
		else if (char !== ' ' && char !== '\t' && char !== '\n' && char !== '\r') token = '';
	}
	const defaults: Record<string, string> = {};
	const defaultsAt = source.search(/\bdefaultVariants\s*:\s*\{/);
	if (defaultsAt >= 0) {
		const block = sliceBrace(source, source.indexOf('{', defaultsAt)).slice(1, -1);
		for (const match of block.matchAll(/([A-Za-z0-9_-]+)\s*:\s*["']([^"']+)["']/g)) defaults[match[1]] = match[2];
	}
	return { variants, defaults, parsed: true };
}

function fieldsIn(source: string): { name: string; doc: string }[] {
	const alias = source.match(/type\s+\w*Props\s*=\s*[^;{]*\{/);
	if (!alias) return [];
	const open = source.indexOf('{', alias.index ?? 0);
	const body = sliceBrace(source, open).slice(1, -1);
	const fields: { name: string; doc: string }[] = [];
	for (const match of body.matchAll(/(?:\/\*\*([\s\S]*?)\*\/\s*)?([A-Za-z_][A-Za-z0-9_]*)\??\s*:/g)) {
		const name = match[2];
		if (['type', 'interface'].includes(name)) continue;
		fields.push({ name, doc: (match[1] ?? '').replace(/\s*\*\s*/g, ' ').replace(/\s+/g, ' ').trim() });
	}
	return fields;
}

function examplePath(name: string): string | undefined {
	const path = pkgPath('registry', 'examples', `${name}.tsx`);
	return existsSync(path) ? path : undefined;
}

function stateNames(source: string): string[] {
	return [...source.matchAll(/export function ([A-Za-z_][A-Za-z0-9_]*)\s*\(/g)].map((match) => match[1]);
}

function resolveName(name: string): Docs {
	const docs = componentDocs();
	const names = docs.map((item) => item.name);
	const matched = matchName(name, names);
	if (!matched) {
		const close = suggest(name, names);
		throw new Error(`Unknown component "${name}".${close.length ? ` Did you mean ${close.join(', ')}?` : ''} Run component list --json.`);
	}
	return docs.find((item) => item.name === matched)!;
}

function readSources(item: Docs) {
	return item.files.map((file) => {
		const path = pkgPath('registry', file);
		return { path: `registry/${file}`, present: existsSync(path), content: existsSync(path) ? readFileSync(path, 'utf8') : '' };
	});
}

export function componentList() {
	return {
		schemaVersion: 1 as const,
		items: componentDocs().map((item) => {
			const example = examplePath(item.name);
			return {
				name: item.name,
				title: item.title,
				type: item.type,
				surface: item.surface,
				description: item.description,
				example: Boolean(example),
				states: example ? stateNames(readFileSync(example, 'utf8')) : [],
			};
		}),
	};
}

export function componentInspect(name: string) {
	const item = resolveName(name);
	const sources = readSources(item);
	const present = sources.filter((file) => file.present);
	const variantSets = present.map((file) => variantsIn(file.content));
	const variants: Record<string, string[]> = {};
	const defaults: Record<string, string> = {};
	for (const set of variantSets) {
		Object.assign(defaults, set.defaults);
		for (const [key, values] of Object.entries(set.variants)) variants[key] = [...new Set([...(variants[key] ?? []), ...values])];
	}
	const example = examplePath(item.name);
	const exampleSource = example ? readFileSync(example, 'utf8') : '';
	return {
		schemaVersion: 1 as const,
		name: item.name,
		title: item.title,
		type: item.type,
		surface: item.surface,
		description: item.description,
		useFor: item.useFor,
		never: item.never,
		attribution: item.source ?? null,
		kinds: item.kinds,
		notes: item.body,
		props: {
			variants,
			defaults,
			fields: present.flatMap((file) => fieldsIn(file.content)),
			variantsParsed: variantSets.some((set) => set.parsed),
		},
		states: example ? stateNames(exampleSource) : [],
		example: example ? `registry/examples/${item.name}.tsx` : null,
		files: sources.map(({ path, present }) => ({ path, present })),
		source: present.map(({ path, content }) => ({ path, content })),
		install: `${cli()} add ${item.name}`,
		emit: example ? `${cli()} component emit ${item.name} --json` : null,
	};
}

function headerOf(source: string, at: number): string {
	const head = source.slice(0, at);
	const chunks: string[] = [];
	const directive = head.match(/^\s*["']use client["'];?/m);
	if (directive) chunks.push(directive[0]);
	for (const match of head.matchAll(/import\s+[\s\S]*?\sfrom\s+["'][^"']+["'];?/g)) chunks.push(match[0].trim());
	for (const match of head.matchAll(/import\s+["'][^"']+["'];?/g)) if (!chunks.includes(match[0])) chunks.push(match[0]);
	return chunks.join('\n');
}

export function componentEmit(name: string, state?: string) {
	const item = resolveName(name);
	const inspected = componentInspect(item.name);
	const example = examplePath(item.name);
	if (!example) {
		throw new Error(`No example for "${item.name}". This item has source and no example file, so there is no markup to emit. Read component inspect ${item.name} --json. Do not invent markup.`);
	}
	const source = readFileSync(example, 'utf8');
	const states = stateNames(source);
	if (!states.length) throw new Error(`registry/examples/${item.name}.tsx has no exported functions to emit.`);
	const requested = state ?? (states.includes('Preview') ? 'Preview' : states[0]);
	const exact = states.find((item) => item === requested);
	const folded = states.filter((item) => item.toLowerCase() === requested.toLowerCase());
	if (!exact && folded.length > 1) throw new Error(`State "${requested}" matches ${folded.join(', ')} for ${item.name}. Pass the exact name.`);
	const found = exact ?? (folded.length === 1 ? folded[0] : undefined);
	if (!found) throw new Error(`Unknown state "${requested}" for ${item.name}. States: ${states.join(', ')}.`);
	const at = source.search(new RegExp(`export function ${found}\\s*\\(`));
	const open = source.indexOf('{', at);
	const fn = source.slice(at, open + sliceBrace(source, open).length);
	const code = `${headerOf(source, at)}\n\n${fn}\n`;
	return {
		schemaVersion: 1 as const,
		name: item.name,
		state: found,
		states,
		props: inspected.props,
		never: item.never,
		install: inspected.install,
		example: `registry/examples/${item.name}.tsx`,
		code,
		note: 'This is the example from the registry. Use only the props and states listed here.',
	};
}
