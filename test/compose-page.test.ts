import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { adapter } from '../src/design/adapter.js';
import { checkDesign, create, errorsOf, validateOutline, type DesignDoc, type Outline } from '../src/design/index.js';

const a = adapter();
const root = join(import.meta.dirname, '..');

describe('compose recipes', () => {
	// Conformance recreates every template at its first size; these are the sizes a recipe changes shape at.
	for (const size of ['og', 'square', 'story', 'x-banner', 'linkedin-banner']) {
		it(`recreates every image template at ${size}, whole and clean`, async () => {
			const problems: string[] = [];
			for (const t of a.templates().filter((x) => x.kind === 'image')) {
				const r0 = a.compose!.recipe!(t.id, size, a.sample!(t.id));
				if (!r0) {
					problems.push(`${t.id}: no recipe`);
					continue;
				}
				const doc = { ...create(a, 'compose', size, []).doc, ...r0 } as DesignDoc;
				try {
					const r = await a.render(doc, root, { formats: ['png'], scale: 1 });
					problems.push(...errorsOf(checkDesign({ doc, info: t, layers: r.layers, adapter: a })).map((f) => `${t.id}: ${f.rule}: ${f.message}`));
				} catch (e) {
					problems.push(`${t.id}: ${(e as Error).message}`);
				}
			}
			expect(problems.join('\n')).toBe('');
		}, 120_000);
	}
});

describe('page compose', () => {
	const outline = validateOutline(a, JSON.parse(readFileSync(join(root, 'brand', 'assets', 'pages', 'sample-outline.json'), 'utf8'))) as Outline;
	// Every section once, with only the words it needs and a few it may take.
	const every: Outline = {
		title: 'Every section',
		sections: a.page!.sections().map((s) => ({
			type: s.type,
			copy: Object.fromEntries(s.copy.filter((c) => c.required || c.id === 'title').map((c) => [c.id, `${s.type} ${c.id} words`])),
			...(s.items ? { items: Array.from({ length: Math.max(s.items.count[0], 2) }, (_, n) => Object.fromEntries(s.items!.copy.filter((c) => c.required).map((c) => [c.id, c.id === 'price' ? String(10 * (n + 1)) : `${s.type} ${c.id} ${n + 1}`]))) } : {}),
		})),
	};

	it('writes plain HTML with every word of the outline and nothing else to install', async () => {
		for (const o of [outline, validateOutline(a, every)]) {
			const files = await a.page!.write(o, 'html');
			const html = files['index.html']!;
			expect(html).toContain('<!doctype html>');
			for (const s of o.sections) for (const v of [...Object.values(s.copy ?? {}), ...(s.items ?? []).flatMap((i) => Object.values(i))]) if (!/^\/|^#/.test(v)) expect(html, `${s.type}: ${v}`).toContain(v.replace(/&/g, '&amp;'));
			expect(html).not.toMatch(/<script|<link /);
		}
	});

	it('writes a React page that type-checks against the library blocks', async () => {
		// Its own folder and config, built on the library's, so nothing is added to registry/.
		const dir = mkdtempSync(join(tmpdir(), 'ds-page-'));
		try {
			writeFileSync(join(dir, 'page.tsx'), (await a.page!.write(validateOutline(a, every), 'react'))['page.tsx']!);
			writeFileSync(join(dir, 'tsconfig.json'), JSON.stringify({ extends: join(root, 'tsconfig.registry.json'), compilerOptions: { typeRoots: [join(root, 'node_modules', '@types')] }, include: ['page.tsx'] }));
			execFileSync(join(root, 'node_modules', '.bin', 'tsc'), ['-p', join(dir, 'tsconfig.json')], { cwd: root, stdio: 'pipe' });
		} catch (e) {
			throw new Error(String((e as { stdout?: Buffer }).stdout ?? e));
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	}, 120_000);

	it('passes every text prop a block would fill with its own sample words', async () => {
		const tsx = (await a.page!.write(validateOutline(a, every), 'react'))['page.tsx']!;
		expect(tsx).toMatch(/<HeroSection notice=\{null\}.*meta=\{null\}/);
		expect(tsx).toMatch(/<SiteFooter name=.* tagline=\{null\} legal=\{null\} meta=\{null\}/);
		expect(tsx).toMatch(/<TestimonialSection label=\{null\}.*figures=\{\[/);
	});
});
