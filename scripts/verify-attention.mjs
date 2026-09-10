import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const base = process.argv[2] || 'http://127.0.0.1:4173';
const article = '/blog/attention-sum-to-one-part-1/';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const errors = [];
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, colorScheme: 'light' });
  const page = await context.newPage();
  page.on('pageerror', e => errors.push(e.message));
  assert.equal((await page.goto(base + article)).status(), 200);
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.locator('h1').count(), 1);
  assert((await page.locator('article').innerText()).includes('总和为 1 既是约束，也是有用的工具。'));
  assert.equal(await page.locator('.katex-error').count(), 0);
  assert.equal(await page.locator('.katex-display .tag').count(), 46);
  const equationCount = await page.locator('.katex').count();
  assert(equationCount > 100);
  assert(await page.locator('article img').evaluateAll(images => images.every(i => i.complete && i.naturalWidth > 0)));
  for (const href of await page.locator('.toc a').evaluateAll(links => links.map(a => a.getAttribute('href')))) {
    assert(await page.evaluate(id => !!document.getElementById(decodeURIComponent(id.slice(1))), href), `Missing section: ${href}`);
  }
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  fs.mkdirSync('test-results', { recursive: true });
  fs.writeFileSync('test-results/attention-accessibility.json', JSON.stringify(axe.violations, null, 2));
  await page.screenshot({ path: 'test-results/attention-desktop.png' });
  const tocMetrics = await page.locator('.toc').evaluate(el => ({ height: el.getBoundingClientRect().height, maxHeight: getComputedStyle(el).maxHeight, overflow: getComputedStyle(el).overflowY }));
  assert(tocMetrics.height <= 950 && tocMetrics.overflow === 'auto', 'Long TOC must scroll within the viewport');
  await page.locator('.katex-display').first().scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'test-results/attention-equations.png' });
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Page overflow at ${width}`);
    await page.locator('h2').filter({ hasText: '九、小结' }).scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/attention-summary-${width}.png` });
  }
  for (const url of ['/', '/blog/', '/feed.xml', '/sitemap-0.xml']) {
    const response = await context.request.get(base + url);
    assert.equal(response.status(), 200);
    assert((await response.text()).includes('attention-sum-to-one-part-1'), `Article missing from ${url}`);
  }
  await page.goto(base + '/blog/');
  await page.locator('#post-search').fill('Sparsemax');
  assert.equal(await page.locator('.post-card:visible').count(), 1);
  assert((await page.locator('.post-card:visible h3').innerText()).includes('Attention'));
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ base, numberedEquations: 46, equations: equationCount, tocMetrics, pageErrors: errors, accessibilityViolations: axe.violations.length, checks: ['single title', 'final summary', 'math', 'image', 'TOC anchors', '375/768/1440 width', 'homepage', 'blog', 'RSS', 'sitemap', 'search'] }, null, 2));
  assert.equal(axe.violations.length, 0, 'See test-results/attention-accessibility.json');
} finally { await browser.close(); }
