import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';
import { pkgPath } from '../lib/paths.js';

// The brand's hidden-line isometric drawings. The toolkit (engine, fill renderer, spacing kit) and the scene files are
// the brand's own, vendored in brand/illustrate/wire from its illustration skill; this module only runs them. A scene
// is built in 3D, hidden lines are removed, and every visible piece becomes a filled band: real vector shapes, one
// path per tone, ordered faint to strong. The engine has no randomness, so a scene always writes the same bytes.

export type WireTones = { lit: string; hi: string; mid: string; lo: string; faint: string; hid: string };
export type WireStyle = { S: number; az: number; widths: { E: number; D: number; F: number }; hidW: number; pad: number; dark: WireTones; light: WireTones };
export type WireDrawing = { svg: string; inner: string; width: number; height: number; scene: string; S: number };

type Doc = { style: WireStyle; scenes: Record<string, { label: string; file: string; use: string }> };

let doc: Doc | undefined;
export function wireDoc(): Doc {
	if (doc) return doc;
	const file = pkgPath('brand', 'illustrate', 'wire.json');
	if (!existsSync(file)) throw new Error('This brand has no wireframe illustrations (brand/illustrate/wire.json).');
	doc = JSON.parse(readFileSync(file, 'utf8')) as Doc;
	return doc;
}

export const wireScenes = () => Object.keys(wireDoc().scenes);

const cache = new Map<string, WireDrawing>();

function run(code: string, ctx: object, name: string) {
	const mod = { exports: {} as Record<string, unknown> };
	(ctx as Record<string, unknown>).module = mod;
	runInContext(code, ctx as never, { filename: name });
	return mod.exports;
}

/** Draws one scene for a ground: `dark` uses the light-on-dark tones, otherwise the bone tones. */
export function wireDrawing(scene: string, tones: 'dark' | 'light'): WireDrawing {
	const key = `${scene}:${tones}`;
	const hit = cache.get(key);
	if (hit) return hit;
	const { style, scenes } = wireDoc();
	const entry = scenes[scene];
	if (!entry) throw new Error(`Unknown scene "${scene}". Scenes: ${Object.keys(scenes).join(', ')}.`);
	const dir = pkgPath('brand', 'illustrate', 'wire');
	const ctx = createContext({ Math, JSON, Number, Array, Object, Infinity, NaN, isFinite, parseFloat, parseInt, Set, Map });
	const { WireScene } = run(readFileSync(`${dir}/engine.js`, 'utf8'), ctx, 'engine.js') as { WireScene: (o: object) => Record<string, unknown> };
	const { toFills } = run(readFileSync(`${dir}/fill.js`, 'utf8'), ctx, 'fill.js') as { toFills: (r: unknown, o: object) => { svg: string; W: number; H: number } };
	const { makeKit } = run(readFileSync(`${dir}/kit.js`, 'utf8'), ctx, 'kit.js') as { makeKit: unknown };
	(ctx as Record<string, unknown>).makeKit = makeKit;
	const built = run(readFileSync(`${dir}/${entry.file}`, 'utf8'), ctx, entry.file) as { buildScene: (g: unknown) => void; S?: number };
	const S = built.S ?? style.S;
	const g = WireScene({ az: style.az, S }) as Record<string, unknown> & { render: (o: object) => unknown };
	g.LW = style.widths;
	built.buildScene(g);
	const rendered = g.render({ S });
	const out = toFills(rendered, { S, pad: style.pad, colors: tones === 'dark' ? style.dark : style.light, widths: style.widths, hidW: style.hidW });
	const inner = out.svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
	const drawing = { svg: out.svg, inner, width: out.W, height: out.H, scene, S };
	cache.set(key, drawing);
	return drawing;
}

/** The scene files on disk, for checks that every entry in wire.json points at a file. */
export function wireFiles(): string[] {
	return readdirSync(pkgPath('brand', 'illustrate', 'wire', 'scenes')).filter((f) => f.endsWith('.js')).map((f) => `scenes/${f}`);
}

export function wireHash(svg: string): string {
	return createHash('sha256').update(svg).digest('hex').slice(0, 16);
}
