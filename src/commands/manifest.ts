import { readFileSync } from 'node:fs';
import { brand, cli } from '../lib/brand.js';
import { emit } from '../lib/output.js';
import { pkgPath } from '../lib/paths.js';
import { brandOverview } from '../brand/system.js';
import { principlesDocument } from '../brand/principles.js';
import { catalog } from '../image/catalog.js';
import { componentList } from '../library/emit.js';
import { videoCatalog } from '../video/catalog.js';

const COMMANDS = [
	{ name: 'manifest', read: true, summary: 'Every capability, template, size, component and rule.' },
	{ name: 'describe', read: true, summary: 'Alias of manifest.' },
	{ name: 'brand', read: true, summary: 'Tokens, fonts, logos and voice.' },
	{ name: 'brand tokens', read: true, summary: 'Token groups: color, type, spacing, radii, motion, other.' },
	{ name: 'brand fonts', read: true, summary: 'Font files, weights and licenses.' },
	{ name: 'brand logos', read: true, summary: 'Logo files and usage rules found in the repo.' },
	{ name: 'brand voice', read: true, summary: 'Voice rules and banned words.' },
	{ name: 'principles', read: true, summary: 'Product and website rules, including do and don\'t.' },
	{ name: 'component list', read: true, summary: 'Every library component.' },
	{ name: 'component inspect', read: true, summary: 'Props, states, usage and source for one component.' },
	{ name: 'component emit', read: true, summary: 'Example markup for one component state.' },
	{ name: 'image', read: false, summary: 'Open Graph and social images. image --list is read-only.' },
	{ name: 'video', read: false, summary: 'Short videos. video --list is read-only.' },
	{ name: 'list', read: true, summary: 'Search the registry index.' },
	{ name: 'show', read: true, summary: 'Registry item source. Aliases: view, inspect.' },
	{ name: 'tokens', read: true, summary: 'Search tokens by name or value.' },
	{ name: 'look', read: true, summary: 'Element styling for a file or a kind.' },
	{ name: 'guide', read: true, summary: 'The portable agent guide.' },
	{ name: 'info', read: true, summary: 'The current project configuration.' },
	{ name: 'check', read: true, summary: 'Token and interaction check. check --fix writes.' },
	{ name: 'add', read: false, summary: 'Copy components into an app.' },
	{ name: 'init', read: false, summary: 'Install tokens, fonts and agent instructions.' },
	{ name: 'apply', read: false, summary: 'Restyle an existing app.' },
] as const;

export function manifestData() {
	const version = JSON.parse(readFileSync(pkgPath('package.json'), 'utf8')).version as string;
	const brandInfo = brandOverview();
	const principles = principlesDocument();
	const images = catalog();
	const videos = videoCatalog();
	const components = componentList();
	return {
		schemaVersion: 1 as const,
		name: brand().name,
		bin: brand().bin,
		version,
		entry: 'manifest',
		alias: 'describe',
		validation: 'Unknown templates, sizes, components, token groups, states and fields exit 1 with an error. Nothing is substituted for an unknown name.',
		json: 'Pass --json. JSON goes to stdout. Errors with --json are {"ok":false,"error":"..."} and a nonzero exit.',
		commands: COMMANDS.map((command) => ({ ...command, run: `${cli()} ${command.name}${command.name === 'manifest' || command.name.endsWith(' list') || command.name === 'describe' || command.name.startsWith('brand') || command.name === 'principles' || command.name === 'guide' ? ' --json' : ''}` })),
		brand: brandInfo,
		principles: {
			source: principles.source,
			surfaces: principles.surfaces,
			aliases: principles.aliases,
			singleLook: principles.singleLook,
			note: principles.note,
			productRules: principles.product.rules.length,
			websiteRules: principles.website.rules.length,
			voiceBanned: principles.voice.banned,
		},
		images: { formats: images.formats, templates: images.templates, themes: images.themes, exports: images.exports, content: images.content },
		videos: { renderer: videos.renderer, rendererNote: videos.rendererNote, formats: videos.formats, templates: videos.templates, themes: videos.themes, exports: videos.exports, timing: videos.timing },
		registry: {
			theme: 'theme',
			note: 'theme is generated from the brand tokens and installed with add theme. It is not a component and has no example to emit. component list reads registry/docs. list reads the built registry, which also includes theme.',
		},
		components: components.items.map((item) => ({ name: item.name, title: item.title, type: item.type, surface: item.surface, example: item.example, states: item.states })),
	};
}

export function manifestCommand(opts: { json?: boolean }) {
	const data = manifestData();
	emit(opts, data, () => [`${data.name} ${data.version}`, data.validation, '', ...data.commands.map((command) => `  ${command.name.padEnd(22)} ${command.summary}`), '', `${data.components.length} components, ${data.images.templates.length} image templates, ${data.videos.templates.length} video templates.`, `Run \`${cli()} manifest --json\`.`].join('\n'));
}
