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
  const articleText = await page.locator('article').innerText();
  for (const paragraph of [
    '这篇文章从一个简单的问题出发：Softmax Attention 的权重为什么一定要加起来等于 1？ 归一化让注意力变成候选之间的相对分配，因此无法在保持相对比例不变的同时，把所有内容权重一起缩小。Attention Sink 提供了一种可能的间接实现：如果某个位置吸收了大量权重，却几乎不向残差流提供有效内容，那么它就相当于替其余内容加上了一个标量门控。',
    '沿着这个思路，概率单纯形与次概率单纯形给出了更直接的解释：标准 Attention 解决的是“读哪里”，而允许总质量小于 1，或者显式加入门控，则进一步解决“这次读多少、写多少”。Sparsemax 虽然可以让部分位置精确为零，但总权重仍然是 1，因此“稀疏选择”和“整体缩小”是两个不同的问题。',
    '目前在我们的推导下，能得到的结论不是Softmax 的归一化不好，也不是 Sink 一定意味着设计缺陷。更准确地说，总和为 1 既是约束，也是有用的工具，它带来了竞争、归一化和输出尺度控制。Softmax未必是最优的设计方式，总和也未必要等于1，或许仍有一些的迭代空间。',
  ]) assert(articleText.includes(paragraph), 'Author-approved paragraph missing or changed');
  assert(!articleText.includes('我更关心的尝试是：'), 'Old ending is still present');
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
