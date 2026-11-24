import { readFileSync } from 'node:fs';
import type { Outline, SectionInfo } from '../design/index.js';
import { brand } from '../lib/brand.js';
import { pkgPath } from '../lib/paths.js';

// Pages from the library's site blocks, for `design page compose`: an outline (checked by the core) becomes a React page
// that imports the installed blocks (`add` them first) and a plain HTML page that needs nothing but the brand stylesheet.
// Only the outline's words go on the page: every prop a block would fill with its own sample copy is passed, empty when
// the outline has nothing for it. Links default to "#". The blocks' own controls keep their interface words (the
// pricing switch, the newsletter's sending states).

export const PAGE_FLAVORS = ['react', 'html'];

const link = { count: [0, 8] as [number, number], copy: [{ id: 'label', required: true }, { id: 'href' }] };

export function pageSections(): SectionInfo[] {
	return [
		{ type: 'header', description: 'The site header: the lockup, links, a sign-in link and an outlined key.', copy: [{ id: 'sign-in', required: true }, { id: 'sign-in-href' }, { id: 'action', required: true }, { id: 'action-href' }], items: link },
		{ type: 'hero', description: 'The first section: a notice, the title, one line, the Forest key and an outlined key, a mono line, and the survey plate.', copy: [{ id: 'title', required: true }, { id: 'description' }, { id: 'notice' }, { id: 'notice-href' }, { id: 'primary' }, { id: 'primary-href' }, { id: 'secondary' }, { id: 'secondary-href' }, { id: 'meta' }, { id: 'layout' }] },
		{ type: 'text', description: 'A section with a mono label, a heading, an intro and a paragraph.', copy: [{ id: 'title', required: true }, { id: 'label' }, { id: 'intro' }, { id: 'body' }] },
		{ type: 'features', description: 'Features in a grid of two or three: a title, a line and an optional figure.', copy: [{ id: 'title' }, { id: 'label' }, { id: 'intro' }], items: { count: [2, 9], copy: [{ id: 'title', required: true }, { id: 'description', required: true }, { id: 'value' }] } },
		{ type: 'stats', description: 'Figures in DM Mono with a unit and a line each.', copy: [{ id: 'title' }, { id: 'label' }, { id: 'intro' }], items: { count: [1, 4], copy: [{ id: 'value', required: true }, { id: 'unit' }, { id: 'description' }] } },
		{ type: 'steps', description: 'Numbered steps with a title and a line each.', copy: [{ id: 'title' }, { id: 'label' }, { id: 'intro' }], items: { count: [2, 6], copy: [{ id: 'title', required: true }, { id: 'description' }] } },
		{ type: 'testimonial', description: 'One customer\'s words: the quote, the person (a role at Acme, never a real person) and figures beside it.', copy: [{ id: 'quote', required: true }, { id: 'name', required: true }, { id: 'role', required: true }, { id: 'company' }, { id: 'label' }], items: { count: [0, 3], copy: [{ id: 'value', required: true }, { id: 'label', required: true }] } },
		{ type: 'faq', description: 'Questions and answers, in one group or several.', copy: [{ id: 'title' }, { id: 'label' }, { id: 'intro' }], items: { count: [1, 24], copy: [{ id: 'question', required: true }, { id: 'answer', required: true }, { id: 'group' }] } },
		{ type: 'pricing', description: 'Plans on cards: a price (a number, or a word like Custom), what it includes, a key.', copy: [{ id: 'title' }, { id: 'label' }, { id: 'intro' }, { id: 'note' }], items: { count: [1, 4], copy: [{ id: 'name', required: true }, { id: 'description', required: true }, { id: 'price', required: true }, { id: 'yearly' }, { id: 'usage', required: true }, { id: 'features', required: true }, { id: 'action', required: true }, { id: 'action-href' }, { id: 'featured' }] } },
		{ type: 'logos', description: 'Customer names in a strip (Acme and the like; only names you may show).', copy: [{ id: 'label' }], items: { count: [2, 8], copy: [{ id: 'name', required: true }] } },
		{ type: 'newsletter', description: 'An email field and a key.', copy: [{ id: 'title', required: true }, { id: 'placeholder', required: true }, { id: 'action', required: true }, { id: 'label' }, { id: 'intro' }, { id: 'note' }] },
		{ type: 'cta', description: 'The closing call to action on the dark band.', copy: [{ id: 'title', required: true }, { id: 'description' }, { id: 'label' }, { id: 'primary' }, { id: 'primary-href' }, { id: 'secondary' }, { id: 'secondary-href' }, { id: 'tone' }] },
		{ type: 'footer', description: 'The site footer: the lockup, a line, link columns and the legal line.', copy: [{ id: 'tagline' }, { id: 'legal' }, { id: 'meta' }], items: { count: [0, 24], copy: [{ id: 'column', required: true }, { id: 'label', required: true }, { id: 'href' }] } },
	];
}

type Section = Outline['sections'][number];
const js = (s: string) => JSON.stringify(s);
/** A text prop: the words, or null so the block shows nothing of its own. */
const txt = (v?: string) => (v?.trim() ? `{${js(v)}}` : '{null}');
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const href = (v?: string) => v?.trim() || '#';
const linkOf = (label?: string, to?: string) => (label?.trim() ? `{${JSON.stringify({ label, href: href(to) })}}` : '{null}');
const parts = (v?: string) => (v ? v.split('|').map((x) => x.trim()).filter(Boolean) : []);
const head = (c: Record<string, string>) => `label=${txt(c.label)} title=${txt(c.title)} intro=${txt(c.intro)}`;
const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join('');
const groups = <T extends Record<string, string>>(items: T[], key: string) => {
	const out = new Map<string, T[]>();
	for (const it of items) out.set(it[key] ?? '', [...(out.get(it[key] ?? '') ?? []), it]);
	return [...out];
};
const price = (v?: string) => (v && /^\d+(\.\d+)?$/.test(v.replace(/[$,]/g, '')) ? Number(v.replace(/[$,]/g, '')) : null);

/** The page as React: one file that imports the library's installed blocks. */
function react(o: Outline): Record<string, string> {
	const imports = new Map<string, Set<string>>();
	const use = (file: string, ...names: string[]) => imports.set(file, new Set([...(imports.get(file) ?? []), ...names]));
	const out: string[] = [];
	for (const s of o.sections as Section[]) {
		const c = s.copy ?? {};
		const items = s.items ?? [];
		switch (s.type) {
			case 'header':
				use('@/components/blocks/site-header', 'SiteHeader');
				out.push(`<SiteHeader name=${txt(brand().name)} links={${JSON.stringify(items.map((i) => ({ label: i.label, href: href(i.href) })))}} signIn={${JSON.stringify({ label: c['sign-in'], href: href(c['sign-in-href']) })}} cta={${JSON.stringify({ label: c.action, href: href(c['action-href']) })}} />`);
				break;
			case 'hero':
				use('@/components/blocks/hero-section', 'HeroSection');
				out.push(`<HeroSection notice=${linkOf(c.notice, c['notice-href'])} title=${txt(c.title)} description=${txt(c.description)} primary=${linkOf(c.primary, c['primary-href'])} secondary=${linkOf(c.secondary, c['secondary-href'])} meta=${txt(c.meta)} layout=${js(c.layout === 'center' ? 'center' : 'split')} />`);
				break;
			case 'text':
				use('@/components/blocks/page-section', 'PageSection');
				out.push(`<PageSection ${head(c)}>${c.body ? `<p className="max-w-(--ds-layout-text) text-body leading-body text-fg-secondary">{${js(c.body)}}</p>` : '{null}'}</PageSection>`);
				break;
			case 'features':
				use('@/components/blocks/feature-grid', 'FeatureGrid');
				out.push(`<FeatureGrid ${head(c)} columns={${items.length % 3 === 0 ? 3 : 2}} features={${JSON.stringify(items.map((i) => ({ title: i.title, description: i.description, ...(i.value ? { value: i.value } : {}) })))}} />`);
				break;
			case 'stats':
				use('@/components/blocks/stats-section', 'StatsSection');
				out.push(`<StatsSection ${head(c)} stats={${JSON.stringify(items.map((i) => ({ value: i.value, ...(i.unit ? { unit: i.unit } : {}), ...(i.description ? { description: i.description } : {}) })))}} />`);
				break;
			case 'steps':
				use('@/components/blocks/steps-section', 'StepsSection');
				out.push(`<StepsSection ${head(c)} steps={${JSON.stringify(items.map((i) => ({ title: i.title, ...(i.description ? { description: i.description } : {}) })))}} />`);
				break;
			case 'testimonial':
				use('@/components/blocks/testimonial-section', 'TestimonialSection');
				out.push(`<TestimonialSection label=${txt(c.label)} quote=${txt(c.quote)} name=${txt(c.name)} role=${txt(c.role)} company=${c.company ? `{${js(c.company)}}` : '""'} initials={${js(initials(c.name!))}} figures={${JSON.stringify(items.map((i) => ({ value: i.value, label: i.label })))}} />`);
				break;
			case 'faq':
				use('@/components/blocks/faq-section', 'FaqSection');
				out.push(`<FaqSection ${head(c)} groups={${JSON.stringify(groups(items, 'group').map(([group, list]) => ({ group, entries: list.map((i) => ({ question: i.question, answer: i.answer })) })))}} />`);
				break;
			case 'pricing':
				use('@/components/blocks/pricing-table', 'PricingTable');
				out.push(`<PricingTable ${head(c)} note=${txt(c.note)} defaultYearly={false} plans={${JSON.stringify(items.map((i) => ({ name: i.name, description: i.description, monthly: price(i.price), ...(i.yearly ? { yearly: price(i.yearly) } : {}), ...(price(i.price) === null ? { quote: i.price } : {}), usage: i.usage, features: parts(i.features), cta: { label: i.action, href: href(i['action-href']) }, ...(/^(yes|true)$/i.test(i.featured ?? '') ? { featured: true } : {}) })))}} />`);
				break;
			case 'logos':
				use('@/components/blocks/logo-strip', 'LogoStrip');
				out.push(`<LogoStrip label=${txt(c.label)} names={${JSON.stringify(items.map((i) => i.name))}} />`);
				break;
			case 'newsletter':
				use('@/components/blocks/newsletter-section', 'NewsletterSection');
				out.push(`<NewsletterSection ${head(c)} placeholder={${js(c.placeholder!)}} action={${js(c.action!)}} note=${txt(c.note)} />`);
				break;
			case 'cta':
				use('@/components/blocks/cta-section', 'CtaSection');
				out.push(`<CtaSection label=${txt(c.label)} title=${txt(c.title)} description=${txt(c.description)} primary=${linkOf(c.primary, c['primary-href'])} secondary=${linkOf(c.secondary, c['secondary-href'])} tone=${js(c.tone === 'light' ? 'light' : 'dark')} />`);
				break;
			case 'footer':
				use('@/components/blocks/site-footer', 'SiteFooter');
				out.push(`<SiteFooter name=${txt(brand().name)} tagline=${txt(c.tagline)} legal=${txt(c.legal)} meta=${txt(c.meta)} columns={${JSON.stringify(groups(items, 'column').map(([title, list]) => ({ title, links: list.map((i) => ({ label: i.label, href: href(i.href) })) })))}} />`);
				break;
		}
	}
	const lines = [...imports].sort(([a], [b]) => (a < b ? -1 : 1)).map(([file, names]) => `import { ${[...names].sort().join(', ')} } from "${file}";`);
	const about = o.title ? ` for "${o.title.replace(/"/g, "'")}"` : '';
	return { 'page.tsx': `${lines.join('\n')}\n\n// Written by \`design page compose\`${about}. Install what it imports with \`add\` first.\nexport default function Page() {\n  return (\n    <>\n${out.map((p) => `      ${p}`).join('\n')}\n    </>\n  );\n}\n` };
}

/** The page as plain HTML: semantic markup the brand stylesheet and a few token-only rules style. */
function html(o: Outline): Record<string, string> {
	const css = readFileSync(pkgPath('build', 'site.css'), 'utf8');
	const out: string[] = [];
	const a = (label?: string, to?: string, cls = 'ds-key') => (label?.trim() ? `<a class="${cls}" href="${esc(href(to))}">${esc(label)}</a>` : '');
	const top = (c: Record<string, string>, h = 'h2') => `${c.label ? `<p class="ds-label">${esc(c.label)}</p>` : ''}${c.title ? `<${h}>${esc(c.title)}</${h}>` : ''}${c.intro ? `<p class="ds-intro">${esc(c.intro)}</p>` : ''}`;
	for (const s of o.sections as Section[]) {
		const c = s.copy ?? {};
		const items = s.items ?? [];
		switch (s.type) {
			case 'header':
				out.push(`<header class="ds-bar"><a class="ds-lockup" href="/">${esc(brand().name)}</a><nav>${items.map((i) => a(i.label, i.href, 'ds-link')).join('')}</nav><div class="ds-actions">${a(c['sign-in'], c['sign-in-href'], 'ds-link')}${a(c.action, c['action-href'], 'ds-key ds-key-outline')}</div></header>`);
				break;
			case 'hero':
				out.push(`<section class="ds-hero">${c.notice ? a(c.notice, c['notice-href'], 'ds-notice') : ''}<h1>${esc(c.title!)}</h1>${c.description ? `<p class="ds-intro">${esc(c.description)}</p>` : ''}<div class="ds-actions">${a(c.primary, c['primary-href'])}${a(c.secondary, c['secondary-href'], 'ds-key ds-key-outline')}</div>${c.meta ? `<p class="ds-label">${esc(c.meta)}</p>` : ''}</section>`);
				break;
			case 'text':
				out.push(`<section>${top(c)}${c.body ? `<p>${esc(c.body)}</p>` : ''}</section>`);
				break;
			case 'features':
				out.push(`<section>${top(c)}<div class="ds-grid">${items.map((i) => `<article class="ds-cell">${i.value ? `<p class="ds-figure">${esc(i.value)}</p>` : ''}<h3>${esc(i.title!)}</h3><p>${esc(i.description!)}</p></article>`).join('')}</div></section>`);
				break;
			case 'stats':
				out.push(`<section>${top(c)}<dl class="ds-grid">${items.map((i) => `<div class="ds-cell"><dd class="ds-figure">${esc(i.value!)}${i.unit ? ` <span>${esc(i.unit)}</span>` : ''}</dd>${i.description ? `<dt>${esc(i.description)}</dt>` : ''}</div>`).join('')}</dl></section>`);
				break;
			case 'steps':
				out.push(`<section>${top(c)}<ol class="ds-grid ds-steps">${items.map((i) => `<li class="ds-cell"><h3>${esc(i.title!)}</h3>${i.description ? `<p>${esc(i.description)}</p>` : ''}</li>`).join('')}</ol></section>`);
				break;
			case 'testimonial':
				out.push(`<section>${c.label ? `<p class="ds-label">${esc(c.label)}</p>` : ''}<figure><blockquote>${esc(c.quote!)}</blockquote><figcaption>${esc(c.name!)}, ${esc(c.role!)}${c.company ? `, ${esc(c.company)}` : ''}</figcaption></figure>${items.length ? `<dl class="ds-grid">${items.map((i) => `<div class="ds-cell"><dd class="ds-figure">${esc(i.value!)}</dd><dt>${esc(i.label!)}</dt></div>`).join('')}</dl>` : ''}</section>`);
				break;
			case 'faq':
				out.push(`<section>${top(c)}${groups(items, 'group').map(([g, list]) => `${g ? `<h3>${esc(g)}</h3>` : ''}${list.map((i) => `<details class="ds-cell"><summary>${esc(i.question!)}</summary><p>${esc(i.answer!)}</p></details>`).join('')}`).join('')}</section>`);
				break;
			case 'pricing':
				out.push(`<section>${top(c)}<div class="ds-grid">${items.map((i) => `<article class="ds-cell${/^(yes|true)$/i.test(i.featured ?? '') ? ' ds-featured' : ''}"><h3>${esc(i.name!)}</h3><p>${esc(i.description!)}</p><p class="ds-figure">${esc(i.price!)}</p><p class="ds-label">${esc(i.usage!)}</p><ul>${parts(i.features).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>${a(i.action, i['action-href'], /^(yes|true)$/i.test(i.featured ?? '') ? 'ds-key' : 'ds-key ds-key-outline')}</article>`).join('')}</div>${c.note ? `<p class="ds-label">${esc(c.note)}</p>` : ''}</section>`);
				break;
			case 'logos':
				out.push(`<section class="ds-compact">${c.label ? `<p class="ds-label">${esc(c.label)}</p>` : ''}<ul class="ds-names">${items.map((i) => `<li>${esc(i.name!)}</li>`).join('')}</ul></section>`);
				break;
			case 'newsletter':
				out.push(`<section>${top(c)}<form class="ds-actions" onsubmit="return false"><input type="email" aria-label="${esc(c.placeholder!)}" placeholder="${esc(c.placeholder!)}"><button class="ds-key" type="submit">${esc(c.action!)}</button></form>${c.note ? `<p class="ds-label">${esc(c.note)}</p>` : ''}</section>`);
				break;
			case 'cta':
				out.push(`<section class="ds-cta${c.tone === 'light' ? '' : ' ds-dark'}">${c.label ? `<p class="ds-label">${esc(c.label)}</p>` : ''}<h2>${esc(c.title!)}</h2>${c.description ? `<p class="ds-intro">${esc(c.description)}</p>` : ''}<div class="ds-actions">${a(c.primary, c['primary-href'])}${a(c.secondary, c['secondary-href'], 'ds-key ds-key-outline')}</div></section>`);
				break;
			case 'footer':
				out.push(`<footer class="ds-foot"><div><p class="ds-lockup">${esc(brand().name)}</p>${c.tagline ? `<p>${esc(c.tagline)}</p>` : ''}</div>${groups(items, 'column').map(([title, list]) => `<nav><p class="ds-label">${esc(title)}</p>${list.map((i) => a(i.label, i.href, 'ds-link')).join('')}</nav>`).join('')}${c.legal || c.meta ? `<p class="ds-label ds-legal">${esc(c.legal ?? '')}${c.meta ? ` <span>${esc(c.meta)}</span>` : ''}</p>` : ''}</footer>`);
				break;
		}
	}
	const title = esc(o.title ?? brand().name);
	return { 'index.html': `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>${title}</title>\n<style>\n${css}\n${PAGE_CSS}</style>\n</head>\n<body>\n<main>\n${out.join('\n')}\n</main>\n</body>\n</html>\n` };
}

/** The layout a plain page needs beyond the brand stylesheet: the column, the hairline sections, a grid, the keys. Tokens
 * only; the one motion is the keys' color change (150ms, ease-out, color only). */
const PAGE_CSS = `body{margin:0;background:var(--ds-color-bg-page);color:var(--ds-color-text-default);font-family:var(--ds-font-sans);font-size:var(--ds-text-body);line-height:var(--ds-leading-body)}
main{max-width:var(--ds-layout-column);margin:0 auto;border-inline:var(--ds-border-width) solid var(--ds-color-border-default)}
section,header,footer{padding:var(--ds-space-16) var(--ds-space-10);border-bottom:var(--ds-border-width) solid var(--ds-color-border-default)}
.ds-compact{padding-block:var(--ds-space-8)}
h1{font-size:var(--ds-text-display);line-height:var(--ds-leading-display);font-weight:var(--ds-font-weight-regular);letter-spacing:var(--ds-tracking-tight);margin:0 0 var(--ds-space-5)}
h2{font-size:var(--ds-text-h1);line-height:var(--ds-leading-heading);font-weight:var(--ds-font-weight-regular);margin:0 0 var(--ds-space-4);max-width:var(--ds-layout-heading)}
h3{font-size:var(--ds-text-h4);font-weight:var(--ds-font-weight-medium);margin:0 0 var(--ds-space-2)}
p{margin:0 0 var(--ds-space-3);color:var(--ds-color-text-secondary)}
.ds-intro{font-size:var(--ds-text-body-lg);max-width:var(--ds-layout-text)}
.ds-label{font-family:var(--ds-font-mono);font-size:var(--ds-text-caption);color:var(--ds-color-text-muted)}
.ds-bar,.ds-foot{display:flex;flex-wrap:wrap;gap:var(--ds-space-8);align-items:center;padding-block:var(--ds-space-4)}
.ds-foot{align-items:flex-start;padding-block:var(--ds-space-12)}.ds-legal{flex-basis:100%}
.ds-lockup{font-weight:var(--ds-font-weight-medium);color:var(--ds-color-text-default);text-decoration:none;margin:0}
nav{display:flex;flex-wrap:wrap;gap:var(--ds-space-6)}.ds-foot nav{flex-direction:column;gap:var(--ds-space-2)}
.ds-actions{display:flex;flex-wrap:wrap;gap:var(--ds-space-3);align-items:center;margin:var(--ds-space-6) 0 var(--ds-space-4)}.ds-bar .ds-actions{margin:0 0 0 auto}
.ds-key{display:inline-flex;align-items:center;min-height:2.5rem;padding:0 var(--ds-space-4);border:0;border-radius:var(--ds-radius-control);clip-path:polygon(var(--ds-cut-sm) 0,100% 0,100% 100%,0 100%,0 var(--ds-cut-sm));background:var(--ds-color-action-primary);color:var(--ds-color-action-primary-fg);font:inherit;text-decoration:none;cursor:pointer;transition:background-color 150ms var(--ds-easing-out)}
.ds-key:hover{background:var(--ds-color-action-primary-hover)}
.ds-key-outline{background:transparent;color:var(--ds-color-text-default);box-shadow:inset 0 0 0 var(--ds-border-width) var(--ds-color-border-strong)}.ds-key-outline:hover{background:var(--ds-color-wash-hover)}
.ds-link{color:var(--ds-color-text-secondary);text-decoration:none;transition:color 150ms var(--ds-easing-out)}.ds-link:hover{color:var(--ds-color-text-default)}
.ds-notice{display:inline-flex;font-family:var(--ds-font-mono);font-size:var(--ds-text-caption);color:var(--ds-color-text-default);border:var(--ds-border-width) solid var(--ds-color-border-default);padding:var(--ds-space-1) var(--ds-space-3);margin-bottom:var(--ds-space-6);text-decoration:none}
.ds-grid{display:grid;gap:0;grid-template-columns:repeat(auto-fit,minmax(15rem,1fr));margin:var(--ds-space-10) 0 0;padding:0;list-style:none;border-top:var(--ds-border-width) solid var(--ds-color-border-default);border-left:var(--ds-border-width) solid var(--ds-color-border-default)}
.ds-cell{padding:var(--ds-space-6);border-right:var(--ds-border-width) solid var(--ds-color-border-default);border-bottom:var(--ds-border-width) solid var(--ds-color-border-default);margin:0}
.ds-featured{background:var(--ds-color-bg-subtle)}
.ds-figure{font-family:var(--ds-font-mono);font-size:var(--ds-text-h2);color:var(--ds-color-text-default);margin:0 0 var(--ds-space-2)}
.ds-steps{counter-reset:step}.ds-steps li::before{counter-increment:step;content:counter(step,decimal-leading-zero);font-family:var(--ds-font-mono);font-size:var(--ds-text-caption);color:var(--ds-color-text-muted)}
blockquote{font-size:var(--ds-text-h3);line-height:var(--ds-leading-snug);margin:0 0 var(--ds-space-4)}figcaption{color:var(--ds-color-text-muted)}figure{margin:0}
details summary{cursor:pointer;font-weight:var(--ds-font-weight-medium)}details{border-left:0;border-right:0}
.ds-names{display:flex;flex-wrap:wrap;gap:var(--ds-space-10);padding:0;margin:var(--ds-space-4) 0 0;list-style:none;font-size:var(--ds-text-h4);color:var(--ds-color-text-secondary)}
input{min-height:2.5rem;min-width:16rem;padding:0 var(--ds-space-3);font:inherit;border:var(--ds-border-width) solid var(--ds-color-border-field);border-radius:var(--ds-radius-control);background:var(--ds-color-bg-default)}
.ds-dark{background:var(--ds-color-bg-inverse)}.ds-dark h2{color:var(--ds-color-text-inverse)}.ds-dark p{color:var(--ds-color-text-inverse-muted)}.ds-dark .ds-key{background:var(--ds-color-bone);color:var(--ds-color-forest)}.ds-dark .ds-key-outline{background:transparent;color:var(--ds-color-text-inverse);box-shadow:inset 0 0 0 var(--ds-border-width) var(--ds-color-text-inverse-muted)}
`;

export async function writePage(o: Outline, flavor: string): Promise<Record<string, string>> {
	return flavor === 'react' ? react(o) : html(o);
}
