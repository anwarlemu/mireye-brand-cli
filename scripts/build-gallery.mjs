// Renders the docs site's asset gallery with the CLI itself: every example is a real command, so the Assets,
// Illustrations and Figma pages show exactly what an agent gets. Writes apps/www/public/gallery/*.png (and the
// clips) plus gallery.json with the command behind each file. Run after `npm run build`.
// usage: node scripts/build-gallery.mjs
import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const out = join(root, 'apps', 'www', 'public', 'gallery');
const bin = join(root, 'bin.js');
const brand = JSON.parse(execFileSync(process.execPath, [bin, 'manifest', '--json'], { encoding: 'utf8' }));
const cli = `npx ${brand.bin}`;
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const entries = [];
const run = (group, label, args, files) => {
	execFileSync(process.execPath, [bin, ...args, '--out', out], { stdio: ['ignore', 'ignore', 'inherit'] });
	entries.push({ group, label, command: `${cli} ${args.map((a) => (/[\s"|]/.test(a) ? JSON.stringify(a) : a)).join(' ')}`, files });
};

const posters = brand.images.templates.filter((t) => t.family === 'poster');
for (const t of posters) {
	const args = ['image', '--size', 'og', '--template', t.id, '--sample', '--export', 'png', '--name', `poster-${t.id}`];
	if (t.id === 'photo') args.push('--image', join(root, 'apps', 'www', 'public', 'examples', 'farmland-aerial.jpg'));
	run('posters', t.label, args, [`poster-${t.id}.png`]);
}
for (const [size, template, ground] of [['story', 'parcels', 'green'], ['portrait', 'post', 'bone'], ['square', 'tag', 'brown'], ['x-banner', 'identity', 'bone'], ['linkedin-banner', 'window', 'green'], ['landscape', 'chart', 'black']]) {
	run('sizes', `${template}, ${size}, ${ground}`, ['image', '--size', size, '--template', template, '--ground', ground, '--sample', '--export', 'png', '--name', `size-${size}-${template}`], [`size-${size}-${template}.png`]);
}
for (const [template, extra] of [['headline', ['--title', 'Parcel survey']], ['subtext', ['--title', 'Site survey', '--subtitle', 'Boundaries, access and utilities for every parcel.']], ['announcement', ['--kicker', 'Field note', '--title', 'The sheet is ready.']], ['quote', ['--quote', 'Read the sheet first.', '--attribution', 'Field review']]]) {
	run('sheets', template, ['image', '--size', 'og', '--template', template, ...extra, '--export', 'png', '--name', `sheet-${template}`], [`sheet-${template}.png`]);
}

// The deck: the sample deck as PNGs and one PDF.
const deckDir = join(out, 'deck');
execFileSync(process.execPath, [bin, 'deck', '--sample', '--out', deckDir], { stdio: ['ignore', 'ignore', 'inherit'] });
for (const f of readdirSync(deckDir)) renameSync(join(deckDir, f), join(out, f === 'deck.pdf' ? 'deck.pdf' : `deck-${f}`));
rmSync(deckDir, { recursive: true });
entries.push({ group: 'deck', label: 'Sample deck', command: `${cli} deck --sample --out deck`, files: readdirSync(out).filter((f) => f.startsWith('deck-slide')).sort().concat('deck.pdf') });

// Video: a poster reveal as MP4 and its still.
run('video', 'Poster reveal', ['video', '--format', 'square', '--template', 'poster', '--poster', 'parcels', '--title', 'Find the parcels that fit.', '--callout', '38.6 ac\n37.5407, −77.4360', '--export', 'mp4,still', '--name', 'video-parcels'], ['video-parcels.mp4', 'video-parcels-still.png']);
run('video', 'Announcement clip', ['video', '--format', 'landscape', '--template', 'announcement', '--kicker', 'Field note', '--title', 'The sheet is ready.', '--export', 'mp4,still', '--name', 'video-announcement'], ['video-announcement.mp4', 'video-announcement-still.png']);

// Merch at 72 dpi for the page (print files are 300 dpi).
for (const [item, variant] of [['tee-front', 'on-light'], ['tee-back', 'on-dark'], ['hoodie-front', 'on-light'], ['tote', 'on-light'], ['cap-front', 'on-light'], ['mug-wrap', 'green'], ['sticker', 'green'], ['poster', 'bone'], ['socks', 'brown']]) {
	run('merch', `${item}, ${variant}`, ['merch', item, '--variant', variant, '--dpi', '72', '--format', 'png'], [`${item}-${variant}.png`]);
}

// Illustrations: every wireframe scene, the isometric presets, the contours and a traced picture.
for (const s of brand.illustrations.styles.find((x) => x.id === 'wire').subjects) {
	run('wire', s.label, ['illustrate', s.id, '--ground', s.id === 'apicore' ? 'bone' : s.id === 'warehouse' ? 'brown' : 'green', '--format', 'png', '--name', `wire-${s.id}`], [`wire-${s.id}.png`]);
}
for (const s of brand.illustrations.styles.find((x) => x.id === 'iso').subjects) {
	run('iso', s.id, ['illustrate', '--style', 'iso', s.id, '--ground', 'bone', '--format', 'png', '--name', `iso-${s.id}`], [`iso-${s.id}.png`]);
}
run('contours', 'dense', ['illustrate', '--style', 'contours', 'dense', '--ground', 'green', '--width', '1200', '--format', 'png', '--name', 'contours-dense'], ['contours-dense.png']);
run('contours', 'sparse', ['illustrate', '--style', 'contours', 'sparse', '--ground', 'bone', '--width', '1200', '--format', 'png', '--name', 'contours-sparse'], ['contours-sparse.png']);
run('trace', 'Farmland aerial as contours', ['illustrate', '--image', join(root, 'apps', 'www', 'public', 'examples', 'farmland-aerial.jpg'), '--ground', 'green', '--format', 'png', '--name', 'trace-farmland'], ['trace-farmland.png']);

// Commands keep machine paths out of the published gallery.
for (const e of entries) e.command = e.command.replaceAll(root, '').replace(/apps\/www\/public\/examples\//g, './');
writeFileSync(join(out, 'gallery.json'), `${JSON.stringify({ generated: 'scripts/build-gallery.mjs', entries }, null, 2)}\n`);
console.log(`gallery: ${entries.length} entries in ${out}`);
