// Writes the icon set the brand's interface uses to brand/icons as plain SVGs (currentColor), with icons.json naming
// each icon's source and licence: the brand's own glyphs (registry/components/icons, from its Figma) and the
// Phosphor icons (MIT) its components import. Run after adding an icon to a component.
// usage: node scripts/build-icons.mjs
import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as P from '@phosphor-icons/react/ssr';

const root = new URL('..', import.meta.url).pathname;
const out = join(root, 'brand', 'icons');
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
const kebab = (s) => s.replace(/Icon$/, '').replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

// The brand's own glyphs, drawn as their components draw them (the paths are the Figma ones in each file).
const own = {
	parcel: { svg: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M0.5 0.5H15.5V15.5H0.5V0.5Z" stroke="currentColor"/><path d="M8 4L12 8L8 12L4 8Z" fill="currentColor"/></svg>', file: 'registry/components/icons/parcel-icon.tsx' },
	check: { svg: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="12" viewBox="0 0 16 12" fill="none"><path d="M1 6L6 11L15 1" stroke="currentColor" stroke-width="1.75"/></svg>', file: 'registry/components/icons/check.tsx' },
	plus: { svg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 1V10M10 10V19M10 10H1M10 10H19" stroke="currentColor" stroke-width="1.5"/></svg>', file: 'registry/components/icons/plus.tsx' },
	'arrow-right': { svg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M0 10H19M10.5 18.5L19 10L10.5 1.5" stroke="currentColor" stroke-width="1.5"/></svg>', file: 'registry/components/icons/arrow-right.tsx' },
	chevron: { svg: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5.75 18.5L14.25 10L5.75 1.5" stroke="currentColor" stroke-width="1.5"/></svg>', file: 'registry/components/icons/arrow-right.tsx (head)' },
};
const list = [];
for (const [name, icon] of Object.entries(own)) {
	writeFileSync(join(out, `${name}.svg`), `${icon.svg}\n`);
	list.push({ name, source: `the brand's own glyph (${icon.file})`, licence: 'the brand' });
}
// Phosphor icons the library's components and examples import.
const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : e.name.endsWith('.tsx') ? [join(dir, e.name)] : []));
const used = new Set();
for (const file of [...walk(join(root, 'registry', 'components')), ...walk(join(root, 'registry', 'examples'))]) {
	const text = readFileSync(file, 'utf8');
	for (const m of text.matchAll(/import\s*\{([^}]+)\}\s*from\s*["']@phosphor-icons\/react(?:\/ssr)?["']/g)) for (const n of m[1].split(',').map((x) => x.trim().split(/\s+as\s+/)[0])) if (n) used.add(n);
}
for (const n of [...used].sort()) {
	if (!P[n]) continue;
	const name = kebab(n);
	if (own[name]) continue;
	writeFileSync(join(out, `${name}.svg`), `${renderToStaticMarkup(React.createElement(P[n], { size: 24 }))}\n`);
	list.push({ name, source: `Phosphor Icons ${n} (regular), used by the library's components`, licence: 'MIT (https://github.com/phosphor-icons/core/blob/main/LICENSE)' });
}
writeFileSync(join(out, 'icons.json'), `${JSON.stringify({ $comment: 'Written by scripts/build-icons.mjs. Every icon the brand interface uses, as an SVG in currentColor.', icons: list }, null, '\t')}\n`);
console.log(`icons: ${list.length} in brand/icons`);
