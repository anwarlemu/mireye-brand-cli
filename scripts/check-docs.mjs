// Run against a production docs server: DOCS_URL=http://localhost:3000 npm run test:docs
// Requires the optional playwright-core dependency and its Chromium browser.
import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';
import { checkOverlays } from './check-overlays.mjs';
import { checkInteractions } from './check-interactions.mjs';

const base = process.env.DOCS_URL ?? 'http://localhost:4645';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
page.on('response', response => { if (response.status() >= 400) console.log(`HTTP ${response.status()}: ${response.url()}`); });
const nav = page.getByRole('navigation', { name: 'Library', exact: true });
// The rail and the page head must not move between routes: the rail is shared and keeps its scroll and filter.
const measure = () => page.evaluate(() => {
  const nav = document.querySelector('nav[aria-label="Library"]');
  const list = nav.lastElementChild;
  const main = document.querySelector('main');
  const head = main.querySelector('header');
  return { pageScroll: scrollY, railScroll: list.scrollTop, railX: nav.getBoundingClientRect().x, railWidth: nav.getBoundingClientRect().width, mainX: main.getBoundingClientRect().x, headY: head.getBoundingClientRect().y };
});

// Scroll edges fade, never cut off: the fade follows the scroll (none at an edge with nothing past it, 24px where more is).
const fadeOf = locator => locator.evaluate(el => { const s = getComputedStyle(el); return { mask: s.maskImage || s.webkitMaskImage || 'none', start: s.getPropertyValue('--fade-start').trim(), end: s.getPropertyValue('--fade-end').trim(), max: el.scrollHeight - el.clientHeight }; });
const scrollTo = (locator, top) => locator.evaluate((el, y) => new Promise(resolve => { el.scrollTop = y === 'end' ? el.scrollHeight : y; requestAnimationFrame(() => requestAnimationFrame(resolve)); }), top);
async function checkFade(locator, label, step = 200) {
  await scrollTo(locator, 0);
  const rest = await fadeOf(locator);
  assert.ok(rest.max > step, `${label}: scrolls (${rest.max}px)`);
  assert.notEqual(rest.mask, 'none', `${label}: has the edge fade`);
  assert.deepEqual([rest.start, rest.end], ['0px', '24px'], `${label}: at rest the first row is whole and the bottom edge fades`);
  await scrollTo(locator, step);
  const mid = await fadeOf(locator);
  assert.deepEqual([mid.start, mid.end], ['24px', '24px'], `${label}: both edges fade mid-scroll`);
  await scrollTo(locator, 'end');
  const end = await fadeOf(locator);
  assert.deepEqual([end.start, end.end], ['24px', '0px'], `${label}: no fade at the end`);
  await scrollTo(locator, 0);
}
const railList = () => page.locator('nav[aria-label="Library"] > div').last();

try {
  await page.goto(`${base}/components/button`);
  await page.getByRole('heading', { name: 'Button', exact: true, level: 1 }).waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  const rail = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ds-layout-rail')) * parseFloat(getComputedStyle(document.documentElement).fontSize));
  assert.equal(await nav.evaluate(n => n.getBoundingClientRect().width), rail, `the rail is the brand's ${rail}px`);
  const items = await nav.locator('a[data-item]').evaluateAll(links => links.map(link => ({ name: link.dataset.item, title: link.textContent.trim() })));
  assert.ok(items.length >= 68, `every component is listed (${items.length})`);
  const timings = [];
  for (const item of items) {
    const link = nav.locator(`a[data-item="${item.name}"]`);
    await link.scrollIntoViewIfNeeded();
    const before = await measure();
    const started = performance.now();
    await link.click();
    await page.waitForURL(`**/components/${item.name}`);
    await page.getByRole('heading', { name: item.title, exact: true, level: 1 }).waitFor();
    timings.push(performance.now() - started);
    await page.waitForTimeout(150);
    const after = await measure();
    for (const key of ['railScroll', 'railX', 'railWidth', 'mainX', 'headY']) assert.ok(Math.abs(before[key] - after[key]) < 1, `${item.name}: ${key} moved from ${before[key]} to ${after[key]}`);
    assert.equal(await nav.locator(`a[data-item="${item.name}"]`).getAttribute('aria-current'), 'page', `${item.name} is marked current`);
    if (timings.length % 17 === 0) console.log(`Checked ${timings.length}/${items.length} routes.`);
  }
  console.log(`PASS: stable rail and page head across ${items.length} component routes.`);
  timings.sort((a, b) => a - b);
  console.log(`Local production navigation: median ${Math.round(timings[Math.floor(timings.length / 2)])}ms, p95 ${Math.round(timings[Math.floor(timings.length * 0.95)])}ms (includes automation overhead).`);

  await page.goto(`${base}/components/button`);
  await nav.getByRole('textbox', { name: 'Filter components' }).fill('card');
  await nav.locator('a[data-item="card"]').click();
  await page.waitForURL('**/components/card');
  assert.equal(await nav.getByRole('textbox', { name: 'Filter components' }).inputValue(), 'card');
  await nav.getByRole('textbox', { name: 'Filter components' }).fill('zzz');
  await nav.getByText('Nothing matches.').waitFor();
  console.log('PASS: rail filter narrows the list and is kept after navigation.');

  await nav.getByRole('textbox', { name: 'Filter components' }).fill('');
  await checkFade(railList(), 'desktop rail');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await checkFade(railList(), 'desktop rail, reduced motion');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const [path, slot, step] of [['/preview/scroll-area/Preview', 'scroll-area-viewport', 50], ['/preview/command/Preview', 'command-list', 50]]) {
    await page.goto(`${base}${path}`);
    const box = page.locator(`[data-slot="${slot}"]`).first();
    await box.waitFor();
    await checkFade(box, slot, step);
  }
  await page.goto(`${base}/components/sidebar`);
  const code = page.locator('[data-slot="code-block-content"]').nth(await page.evaluate(() => [...document.querySelectorAll('[data-slot="code-block-content"]')].findIndex(el => el.scrollHeight - el.clientHeight > 200 && el.scrollWidth - el.clientWidth > 100)));
  const both = (top, left) => code.evaluate((el, [y, x]) => new Promise(resolve => { el.scrollTop = y; el.scrollLeft = x; requestAnimationFrame(() => requestAnimationFrame(() => { const s = getComputedStyle(el); resolve(['--fade-start', '--fade-end', '--fade-x-start', '--fade-x-end'].map(n => s.getPropertyValue(n).trim())); })); }), [top, left]);
  assert.deepEqual(await both(0, 0), ['0px', '24px', '0px', '24px'], 'code block at rest: top and left whole, bottom and right fade');
  assert.deepEqual(await both(100, 100), ['24px', '24px', '24px', '24px'], 'code block mid-scroll: all four edges fade');
  console.log('PASS: the rail and scrolling library items fade at their edges with the scroll, never a hard cut.');

  await page.goto(`${base}/components/dialog`);
  const iframe = page.locator('iframe').first();
  assert.equal(await iframe.getAttribute('sandbox'), 'allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox');
  await page.waitForFunction(() => { const frame = document.querySelector('iframe'); return frame && Number.parseFloat(frame.style.height) !== 320; });
  await page.getByRole('tab', { name: 'Phone', exact: true }).first().click();
  await page.waitForFunction(() => document.querySelector('iframe')?.style.width === '390px');
  const frame = await iframe.contentFrame();
  await frame.locator('[data-preview-ready]').waitFor();
  await frame.getByRole('button').first().click();
  await frame.getByRole('dialog').waitFor();
  assert.equal(await frame.locator('html').evaluate(async () => { await document.fonts.ready; return [...document.fonts].every(font => font.status === 'loaded' || font.status === 'unloaded'); }), true);
  console.log('PASS: isolated previews render, open their overlay and resize at desktop and phone widths.');

  await page.goto(`${base}/components/button`);
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async text => { window.__copied = text; } } }));
  await page.locator('#example').getByRole('button', { name: 'Copy code', exact: true }).click();
  await page.locator('#example').getByRole('button', { name: 'Copied', exact: true }).waitFor();
  assert.ok((await page.evaluate(() => window.__copied)).includes('Button'));
  await page.getByRole('button', { name: 'Copy command', exact: true }).click();
  assert.match(await page.evaluate(() => window.__copied), /add button$/);
  await page.evaluate(() => { navigator.clipboard.writeText = async () => { throw new Error('Clipboard permission denied'); }; });
  await page.locator('#source').getByRole('button', { name: 'Copy code', exact: true }).first().click();
  await page.locator('#source').getByText('Copy failed. Select the code and copy it.').waitFor({ state: 'attached' });
  console.log('PASS: code and command copy handle success and denied clipboard access.');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${base}/components/button`);
  const toggle = page.getByRole('button', { name: 'Open the library' });
  await toggle.click();
  await nav.getByRole('textbox', { name: 'Filter components' }).fill('checkbox');
  await nav.locator('a[data-item="checkbox"]').click();
  await page.waitForURL('**/components/checkbox');
  assert.equal(await page.getByRole('button', { name: 'Open the library' }).getAttribute('aria-expanded'), 'false');
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  console.log('PASS: the mobile rail closes after choosing an item, without horizontal overflow.');
  await page.getByRole('button', { name: 'Open the library' }).click();
  await nav.getByRole('textbox', { name: 'Filter components' }).fill('');
  await checkFade(railList(), 'mobile rail');
  await page.getByRole('button', { name: 'Close the library' }).click();
  // compare-matrix: only the end edge fades, and cells fade under the pinned column once scrolled (snap off to hold mid-scroll).
  await page.goto(`${base}/preview/compare-matrix/Preview`);
  const region = page.locator('.group\\/region').first();
  await region.waitFor();
  const matrix = left => region.evaluate((el, x) => new Promise(resolve => { el.style.scrollSnapType = 'none'; el.scrollLeft = x; requestAnimationFrame(() => requestAnimationFrame(() => resolve([getComputedStyle(el).getPropertyValue('--fade-x-end').trim(), getComputedStyle(el.querySelector('[data-col="label"]'), '::after').opacity]))); }), left);
  assert.deepEqual(await matrix(0), ['24px', '0'], 'compare-matrix at rest: end edge fades, no shade under the pinned column');
  assert.deepEqual(await matrix(30), ['24px', '1'], 'compare-matrix scrolled: end edge fades and cells fade under the pinned column');
  assert.deepEqual(await matrix(1e6), ['0px', '1'], 'compare-matrix at the end: no end fade');
  console.log('PASS: compare-matrix fades at its end edge and under its pinned column, never a hard cut.');
  await checkOverlays(page, base);
  await checkInteractions(page, base);
  assert.deepEqual(errors, [], 'Browser errors');
  console.log('PASS: no browser runtime or resource errors.');
} finally {
  await browser.close();
}
