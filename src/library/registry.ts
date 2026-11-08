import { existsSync, readFileSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { brand } from '../lib/brand.js';
import { pkgPath } from '../lib/paths.js';

// The component library's items: from a folder (the copy bundled with the CLI, the docs build in this repo, or
// DS_REGISTRY) or fetched from the hosted library. Each item is one JSON file: its files with their content, the
// items it requires and the npm packages it imports.

export type ItemType = 'ui' | 'product' | 'site' | 'visual' | 'block' | 'hook' | 'lib' | 'theme';
export type RegistryFile = { path: string; content: string };
export type RegistryItem = {
	schemaVersion?: number;
	name: string;
	type: ItemType;
	useFor?: string;
	constraints?: string[];
	documentation?: string;
	exports?: string[];
	client?: boolean;
	docsUrl?: string;
	markdownUrl?: string;
	source?: string;
	examples?: (RegistryFile & { exports: string[]; requires: string[]; packages: string[]; previews: { name: string; url: string }[] })[];
	title?: string;
	description?: string;
	surface?: string;
	kinds?: string[];
	requires?: string[];
	packages?: string[];
	files?: RegistryFile[];
};
export type IndexEntry = Omit<RegistryItem, 'files' | 'examples' | 'documentation'>;

function sources() {
	const env = process.env.DS_REGISTRY;
	const dirs = [env && !/^https?:/.test(env) ? (isAbsolute(env) ? env : join(process.cwd(), env)) : undefined, pkgPath('r'), pkgPath('apps', 'www', 'public', 'r')].filter((d): d is string => !!d && existsSync(d));
	const url = env && /^https?:/.test(env) ? env.replace(/\/$/, '') : `${(brand() as { registryUrl?: string }).registryUrl ?? ''}/r`;
	return { dirs, url };
}

/** The name an item is known by, from a bare name or its URL (https://…/r/button.json). */
export const itemName = (ref: string) => ref.replace(/^.*\//, '').replace(/\.json$/, '');

/** The registry spelling of a name typed as a component would be: AlertDialog, alert_dialog and Alert Dialog are alert-dialog. */
export const canonicalName = (name: string) => name.trim().replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/[\s_]+/g, '-').toLowerCase();

function distance(a: string, b: string) {
	const row = Array.from({ length: b.length + 1 }, (_, i) => i);
	for (let i = 1; i <= a.length; i++) {
		let prev = row[0];
		row[0] = i;
		for (let j = 1; j <= b.length; j++) {
			const next = row[j];
			row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
			prev = next;
		}
	}
	return row[b.length];
}

/** The closest item names to one that does not exist, best first. */
export function suggestNames(name: string, names: string[], limit = 3) {
	const key = canonicalName(name);
	return names
		.map(candidate => ({ candidate, score: candidate.includes(key) || key.includes(candidate) ? Math.abs(candidate.length - key.length) * 0.1 : distance(key, candidate) }))
		.filter(({ candidate, score }) => score <= Math.max(2, Math.floor(candidate.length / 3)))
		.sort((a, b) => a.score - b.score || a.candidate.localeCompare(b.candidate))
		.slice(0, limit)
		.map(({ candidate }) => candidate);
}

const missing = (name: string, names: string[], status = '') => {
	const near = suggestNames(name, names);
	return new Error(`No library item "${name}"${status}. ${near.length ? `Did you mean ${near.join(', ')}? ` : ''}Use search to find an item.`);
};

function validateItem(value: any, source: string): RegistryItem {
	if (!value || typeof value.name !== 'string' || !/^[a-z][a-z0-9-]*$/.test(value.name) || !Array.isArray(value.files)) throw new Error(`Invalid registry item: ${source}`);
	for (const file of value.files) if (typeof file.path !== 'string' || typeof file.content !== 'string') throw new Error(`Invalid registry file in ${source}`);
	if (String(value.type).startsWith('registry:')) throw new Error('This is a shadcn registry item. Use the shadcn add command through this CLI to install it.');
	return value;
}

export async function loadItem(ref: string): Promise<RegistryItem> {
	if (ref.startsWith(`@${brand().bin}/`)) ref = ref.slice(brand().bin.length + 2);
	const remote = /^https?:\/\//.test(ref);
	const local = !remote && /\.json$/.test(ref) && existsSync(ref);
	if (remote || local) {
		const value = local ? JSON.parse(readFileSync(ref, 'utf8')) : await fetch(ref, { signal: AbortSignal.timeout(15000) }).then(response => { if (!response.ok) throw new Error(`Registry returned ${response.status}: ${ref}`); return response.json(); });
		const item = validateItem(value, ref);
		item.requires = (item.requires ?? []).map(dep => /^https?:/.test(dep) ? dep : remote ? new URL(`${itemName(dep)}.json`, ref).href : resolve(dirname(ref), `${itemName(dep)}.json`));
		return item;
	}
	if (itemName(ref) !== ref) throw new Error(`Unsupported item address: ${ref}. Use a name, a JSON file, or an HTTP(S) URL.`);
	const { dirs, url } = sources();
	// Match the exact file name, so a case-insensitive disk cannot hand back an item under another spelling.
	const names = loadIndexSync().map(entry => entry.name);
	// datepicker and Datepicker are date-picker: the one item whose name is the same without dashes.
	const typed = canonicalName(ref), joined = names.filter(n => n.replaceAll('-', '') === typed.replaceAll('-', ''));
	const name = names.includes(typed) || joined.length !== 1 ? typed : joined[0];
	for (const dir of dirs) {
		const file = join(dir, `${name}.json`);
		if ((!names.length || names.includes(name)) && existsSync(file)) return validateItem(JSON.parse(readFileSync(file, 'utf8')), file);
	}
	if (dirs.length) throw missing(ref, names);
	const response = await fetch(`${url}/${name}.json`, { signal: AbortSignal.timeout(15000) });
	if (!response.ok) throw missing(ref, await loadIndex().then(items => items.map(item => item.name)).catch(() => []), ` (${response.status})`);
	return validateItem(await response.json(), name);
}

export async function loadIndex(): Promise<IndexEntry[]> {
	const { dirs, url } = sources();
	for (const dir of dirs) {
		const file = join(dir, 'index.json');
		if (existsSync(file)) return JSON.parse(readFileSync(file, 'utf8')).items;
	}
	const res = await fetch(`${url}/index.json`).catch(() => undefined);
	if (!res?.ok) throw new Error('The component library could not be reached.');
	return ((await res.json()) as { items: IndexEntry[] }).items;
}

/** Every item the given ones need, dependencies first. */
export async function closure(names: string[]): Promise<RegistryItem[]> {
	const done = new Set<string>(), active = new Set<string>();
	const order: RegistryItem[] = [];
	const visit = async (ref: string) => {
		if (active.has(ref)) throw new Error(`Circular registry dependency: ${[...active, ref].join(' -> ')}`);
		if (done.has(ref)) return;
		active.add(ref);
		const item = await loadItem(ref);
		for (const dependency of item.requires ?? []) await visit(dependency);
		active.delete(ref); done.add(ref); order.push(item);
	};
	for (const name of names) await visit(name);
	return order;
}

/** The same, synchronously, from a local copy only (the one bundled with the CLI or this repo's docs build). */
export function loadItemSync(name: string): RegistryItem | undefined {
	for (const dir of sources().dirs) {
		const file = join(dir, `${name}.json`);
		if (existsSync(file)) return JSON.parse(readFileSync(file, 'utf8'));
	}
	return undefined;
}

export function loadIndexSync(): IndexEntry[] {
	for (const dir of sources().dirs) {
		const file = join(dir, 'index.json');
		if (existsSync(file)) return JSON.parse(readFileSync(file, 'utf8')).items;
	}
	return [];
}
