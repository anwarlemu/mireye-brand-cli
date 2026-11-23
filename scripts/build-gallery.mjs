// Renders the docs site's asset gallery with the CLI itself: every example is a real command, so the Assets,
// Illustrations and Figma pages show exactly what an agent gets. Writes apps/www/public/gallery/*.png (and the
// clips) plus gallery.json with the command behind each file. Run after `npm run build`.
// usage: node scripts/build-gallery.mjs
import { execFileSync, spawnSync } from 'node:child_process';
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
	const args = ['image', t.id, '--size', 'og', '--sample', '--format', 'png', '--name', `poster-${t.id}`];
	if (t.id === 'photo') args.push('--image', join(root, 'apps', 'www', 'public', 'examples', 'farmland-aerial.jpg'));
	run('posters', t.label, args, [`poster-${t.id}.png`]);
}
for (const [size, template, ground] of [['story', 'parcels', 'green'], ['portrait', 'post', 'bone'], ['square', 'tag', 'brown'], ['x-banner', 'post', 'bone'], ['linkedin-banner', 'window', 'green'], ['youtube-thumbnail', 'chart', 'black'], ['avatar', 'identity', 'bone'], ['email', 'announcement', 'bone']]) {
	run('sizes', `${template}, ${size}, ${ground}`, ['image', template, '--size', size, '--theme', ground, '--sample', '--format', 'png', '--name', `size-${size}-${template}`], [`size-${size}-${template}.png`]);
}
for (const [template, extra] of [['headline', ['--title', 'Parcel survey']], ['subtext', ['--title', 'Site survey', '--subtitle', 'Boundaries, access and utilities for every parcel.']], ['announcement', ['--kicker', 'Field note', '--title', 'The sheet is ready.']], ['quote', ['--quote', 'Read the sheet first.', '--attribution', 'Field review']]]) {
	run('sheets', template, ['image', template, '--size', 'og', ...extra, '--format', 'png', '--name', `sheet-${template}`], [`sheet-${template}.png`]);
}

// The deck: the sample deck as PNGs and one PDF.
const deckDir = join(out, 'deck');
execFileSync(process.execPath, [bin, 'deck', '--sample', '--out', deckDir], { stdio: ['ignore', 'ignore', 'inherit'] });
for (const f of readdirSync(deckDir)) renameSync(join(deckDir, f), join(out, f === 'deck.pdf' ? 'deck.pdf' : `deck-${f}`));
rmSync(deckDir, { recursive: true });
entries.push({ group: 'deck', label: 'Sample deck', command: `${cli} deck --sample --out deck`, files: readdirSync(out).filter((f) => f.startsWith('deck-slide')).sort().concat('deck.pdf') });

// Video: a poster reveal as MP4 and its still.
run('video', 'Poster reveal', ['video', 'poster', '--size', 'square', '--poster', 'parcels', '--title', 'Find the parcels that fit.', '--callout', '38.6 ac\n37.5407, −77.4360', '--format', 'mp4,still', '--name', 'video-parcels'], ['video-parcels.mp4', 'video-parcels-still.png']);
run('video', 'Announcement clip', ['video', 'announcement', '--size', 'landscape', '--kicker', 'Field note', '--title', 'The sheet is ready.', '--format', 'mp4,still', '--name', 'video-announcement'], ['video-announcement.mp4', 'video-announcement-still.png']);

// Merch at 72 dpi for the page (print files are 300 dpi).
for (const [item, variant] of [['tee-front', 'on-light'], ['tee-back', 'on-dark'], ['hoodie-front', 'on-light'], ['tote', 'on-light'], ['cap-front', 'on-light'], ['mug-wrap', 'green'], ['sticker', 'green'], ['poster', 'bone'], ['socks', 'brown']]) {
	run('merch', `${item}, ${variant}`, ['merch', item, '--variant', variant, '--dpi', '72', '--format', 'png', '--sample'], [`${item}-${variant}.png`]);
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

// Designs: one session, as a person would run it, each step's picture kept.
const sessionDir = join(out, 'design-session');
mkdirSync(sessionDir, { recursive: true });
const steps = [
	['new', 'new post --size x-banner', ['new', 'post', '--size', 'x-banner', '--headline', 'Physical world context for AI agents', '--body', 'One API for parcels, flood, terrain and utilities.', '-o', 'banner.design.json']],
	['darker', 'revise "darker theme"', ['revise', 'banner.design.json', 'darker theme']],
	['bigger', 'revise "bigger headline"', ['revise', 'banner.design.json', 'bigger headline']],
	['logo', 'revise "logo top right"', ['revise', 'banner.design.json', 'logo top right']],
	['scene', 'edit --option scene=solar', ['edit', 'banner.design.json', '--option', 'scene=solar']],
	['left', 'edit --layer art.anchor=left', ['edit', 'banner.design.json', '--layer', 'art.anchor=left']],
];
for (const [name, label, args] of steps) {
	execFileSync(process.execPath, [bin, 'design', ...args], { cwd: sessionDir, stdio: ['ignore', 'ignore', 'inherit'] });
	renameSync(join(sessionDir, 'banner.png'), join(out, `design-${name}.png`));
	execFileSync(process.execPath, [bin, 'design', 'render', 'banner.design.json', '--format', 'png'], { cwd: sessionDir, stdio: 'ignore' });
	entries.push({ group: 'design', label, command: `${cli} design ${args.map((a) => (/[\s"|]/.test(a) ? JSON.stringify(a) : a)).join(' ')}`, files: [`design-${name}.png`] });
}
// A refusal exits 1 and prints why; the gallery keeps the reason.
const refused = spawnSync(process.execPath, [bin, 'design', 'revise', 'banner.design.json', 'make the headline neon pink', '--json'], { cwd: sessionDir, encoding: 'utf8' }).stdout;
entries.push({ group: 'design-refused', label: (JSON.parse(refused || '{}').error?.message ?? '').split('\n').slice(0, 2).join(' '), command: `${cli} design revise banner.design.json "make the headline neon pink"`, files: [] });
execFileSync(process.execPath, [bin, 'design', 'sizes', 'banner.design.json', '--to', 'og,square,story,linkedin-banner'], { cwd: sessionDir, stdio: 'ignore' });
const sheet = readdirSync(sessionDir).find((f) => /sizes.*\.png$/.test(f));
if (sheet) {
	renameSync(join(sessionDir, sheet), join(out, 'design-sizes.png'));
	entries.push({ group: 'design-sizes', label: 'sizes --to og,square,story,linkedin-banner', command: `${cli} design sizes banner.design.json --to og,square,story,linkedin-banner`, files: ['design-sizes.png'] });
}
rmSync(sessionDir, { recursive: true, force: true });

// Commands keep machine paths out of the published gallery.
for (const e of entries) e.command = e.command.replaceAll(root, '').replace(/apps\/www\/public\/examples\//g, './');
writeFileSync(join(out, 'gallery.json'), `${JSON.stringify({ generated: 'scripts/build-gallery.mjs', entries }, null, 2)}\n`);
console.log(`gallery: ${entries.length} entries in ${out}`);
