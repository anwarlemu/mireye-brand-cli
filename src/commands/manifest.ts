import { readFileSync } from 'node:fs';
import { brand, cli } from '../lib/brand.js';
import { emit } from '../lib/output.js';
import { pkgPath } from '../lib/paths.js';
import { brandOverview } from '../brand/system.js';
import { principlesDocument } from '../brand/principles.js';
import { catalog } from '../image/catalog.js';
import { componentList } from '../library/emit.js';
import { videoCatalog } from '../video/catalog.js';
import { deckCatalog } from '../deck/slides.js';
import { merchCatalog } from '../merch/merch.js';
import { illustrateCatalog } from './illustrate.js';
import { FIGMA_ACTIONS, PUSH_KINDS } from './figma.js';
import { adapter } from '../design/adapter.js';
import { designManifest } from '../design/index.js';
import { imageDocument } from '../image/poster.js';
import { helpRow } from '../lib/help-row.js';

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
	{ name: 'image', read: false, summary: 'Share images and social posts (PNG and SVG): the brand poster layouts at every social size and ground, plus the cut-frame sheets; several sizes at once; JPG, WebP and PDF too. image --list is read-only.' },
	{ name: 'image carousel', read: false, summary: 'Several numbered pictures from one JSON file.' },
	{ name: 'design', read: false, summary: 'Make a design as a file and revise it: new, revise (plain words), edit (exact), undo, redo, history, variants, sizes, compare, render, check. Every write is checked and errors block it.' },
	{ name: 'deck', read: false, summary: 'Slides at 1920x1080 from a JSON file: a PNG per slide and one PDF. deck --list is read-only.' },
	{ name: 'video', read: false, summary: 'Short clips: APNG, MP4 or WebM, plus a still frame. video --list is read-only.' },
	{ name: 'merch', read: false, summary: 'Print files at real size with bleed, safe area and a die line. merch --list is read-only.' },
	{ name: 'illustrate', read: false, summary: 'Brand illustrations as SVG and PNG: wireframe scenes, isometric scenes, contours, or a picture as contours. illustrate --list is read-only.' },
	{ name: 'icons', read: false, summary: 'Favicon set (ico, png, maskable, svg, manifest), app icons, and the icon set the interface uses as SVGs.' },
	{ name: 'document', read: false, summary: 'One-pager, case study or report with a cover, as a PDF of A4 or US Letter pages.' },
	{ name: 'email', read: false, summary: 'Newsletter, announcement, receipt, password reset and signature as email-safe HTML.' },
	{ name: 'figma tokens', read: false, summary: 'The tokens as Figma variables: tokens.json and use_figma scripts, plus the MCP steps.' },
	{ name: 'figma push', read: false, summary: 'An illustration, image, slide, asset, component or page made ready for Figma, plus the MCP steps.' },
	{ name: 'figma pull', read: true, summary: 'The MCP steps to read a Figma node and where to save each result.' },
	{ name: 'figma check', read: true, summary: 'Off-brand values in saved Figma data, each with the nearest token. Exits 1 when any.' },
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

/** "I need X": the command that makes it. */
export const NEEDS: { need: string; run: string }[] = [
	{ need: 'Link preview or social post (X, LinkedIn, Instagram, Threads, Facebook, Pinterest)', run: 'image <template> --size og|landscape|square|portrait|threads|facebook-post|pinterest --headline "..."' },
	{ need: 'Story, reel or TikTok cover', run: 'image <template> --size story|tiktok-cover --headline "..."' },
	{ need: 'Profile banner (X, LinkedIn, Facebook, YouTube) and profile picture', run: 'image <template> --size x-banner|linkedin-banner|linkedin-page|facebook-cover|youtube; image identity --size avatar' },
	{ need: 'YouTube thumbnail', run: 'image <template> --size youtube-thumbnail' },
	{ need: 'Display ads (IAB) and Meta or LinkedIn ads', run: 'image <template> --size ad-300x250,ad-336x280,ad-728x90,ad-300x600,ad-320x50,ad-160x600,ad-970x250,meta-story,linkedin-ad' },
	{ need: 'Carousel', run: 'image carousel --input carousel.json --size portrait' },
	{ need: 'Quote, stat, event, pricing, comparison, flow, before and after, chart (bar, line, donut) card', run: 'image quote|stat|event|pricing|compare|flow|split|chart|line|donut --size ...' },
	{ need: 'Launch, changelog, hiring or customer story card', run: 'image announcement --badge "..." / image quote --attribution "..., Acme"' },
	{ need: 'Framed screenshot', run: 'image frame --image shot.png; image photo --image aerial.jpg' },
	{ need: 'A picture you can keep revising', run: 'design new <template> -o x.design.json; design revise x.design.json "..."' },
	{ need: 'A graphic no template covers, at any size (your own layout from the brand\'s blocks)', run: 'design new compose --size <id> -o x.design.json; design compose add x.design.json headline "..." --place top-left' },
	{ need: 'A whole page from sections (React and plain HTML)', run: 'design page compose outline.json [--flavor react|html] -o page' },
	{ need: 'Slides (cover, agenda, team, timeline, stat, chart, comparison, quote, image grid, questions)', run: 'deck --input deck.json' },
	{ need: 'One-pager, case study, report with a cover (PDF)', run: 'document --input document.json --size a4|letter' },
	{ need: 'Emails (newsletter, announcement, receipt, password reset) and email signature', run: 'email <kind> --input email.json' },
	{ need: 'Short clip, logo reveal, lower third, product walkthrough, GIF', run: 'video <template> --size square|story|landscape --format mp4,webm,gif' },
	{ need: 'Favicon set and app icons', run: 'icons favicon; icons app' },
	{ need: 'The interface icon set as SVG', run: 'icons set' },
	{ need: 'Video-call background, desktop and phone wallpaper', run: 'image backdrop --size meeting|desktop|phone-wallpaper' },
	{ need: 'Illustration or pattern at any size', run: 'illustrate <scene> --size WxH; illustrate --style contours' },
	{ need: 'Print: business card, letterhead, certificate, badge, name tag, poster, stickers, notebook, lanyard, tee, mug, cap, socks', run: 'merch <item> --variant ...' },
	{ need: 'Components, sections and pages for a site or app', run: 'component list; add <name>' },
	{ need: 'Figma variables or a push to Figma', run: 'figma tokens; figma push ...' },
];

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
		images: { formats: images.formats, templates: images.templates, grounds: images.grounds, themes: images.themes, exports: images.exports, content: images.content, layouts: 'brand/assets/image.json' },
		needs: NEEDS.map((n) => ({ ...n, run: `${cli()} ${n.run}` })),
		designs: designManifest(adapter(), cli()),
		decks: deckCatalog(),
		videos: { renderer: videos.renderer, rendererNote: videos.rendererNote, formats: videos.formats, templates: videos.templates, themes: videos.themes, exports: videos.exports, encoders: videos.encoders, motion: videos.motion, timing: videos.timing },
		merch: merchCatalog(),
		illustrations: illustrateCatalog(),
		figma: { actions: FIGMA_ACTIONS, pushKinds: PUSH_KINDS, note: 'The CLI never calls Figma: every action writes files and prints the Figma MCP calls to make, in order.', workflow: 'brand/agent-guide.md#work-in-figma' },
		logo: { files: ['brand/logo/mark.svg'], lockups: ['mark', 'lockup (the mark with the name in the brand sans, at 0.875 of the mark height, 0.5 of it apart)'], clearSpace: `none defined by the brand; pictures keep ${imageDocument().logoRules.clear} times the mark's height all round`, minimumSize: `none defined by the brand; pictures keep the mark at ${imageDocument().logoRules.min} CSS pixels or more where they are shown` },
		rules: { illustration: 'brand/illustration.md', principles: 'brand/principles.md', contract: 'brand/contract.md', agentGuide: 'brand/agent-guide.md' },
		registry: {
			theme: 'theme',
			note: 'theme is generated from the brand tokens and installed with add theme. It is not a component and has no example to emit. component list reads registry/docs. list reads the built registry, which also includes theme.',
		},
		components: components.items.map((item) => ({ name: item.name, title: item.title, type: item.type, surface: item.surface, example: item.example, states: item.states })),
	};
}

export function manifestCommand(opts: { json?: boolean }) {
	const data = manifestData();
	emit(opts, data, () => [`${data.name} ${data.version}`, data.validation, '', ...data.commands.map((command) => helpRow(command.name, command.summary, 20)), '', `${data.components.length} components, ${data.designs.templates.length} design templates, ${data.images.templates.length} image templates at ${data.images.formats.length} sizes, ${data.decks.slides.length} slide types, ${data.videos.templates.length} video templates, ${data.merch.items.length} merch items, ${data.illustrations.styles.length} illustration styles.`, `Run \`${cli()} manifest --json\`.`].join('\n'));
}
