import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=process.cwd(), out=path.join(root,'test-results');
fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1100},colorScheme:'light',permissions:['clipboard-read','clipboard-write']});
const page=await context.newPage();
const errors=[]; page.on('pageerror',e=>errors.push(e.message));
const paths=['/','/research/','/blog/','/docs/','/friends/','/blog/hello-world/','/docs/writing-notes/','/research/attention/'];
const violations=[];
try {
  for(const url of paths){
    const response=await page.goto(`http://127.0.0.1:4173${url}`);assert.equal(response.status(),200,url);
    await page.evaluate(()=>document.fonts.ready);
    assert.equal(await page.locator('h1').count(),1,url);
    assert(!await page.locator('body').innerText().then(t=>/Yifei|个人介绍|硕士在读|202521210324/.test(t)),'No biography');
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`desktop overflow ${url}`);
    const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    violations.push(...axe.violations.map(v=>({page:url,id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})));
    for(const href of await page.locator('a[href^="/"]').evaluateAll(els=>[...new Set(els.map(e=>e.getAttribute('href').split('#')[0].split('?')[0]))])) {
      const check=await context.request.get(`http://127.0.0.1:4173${href}`);assert.equal(check.status(),200,`broken ${href}`);
    }
    await page.screenshot({path:path.join(out,(url==='/'?'home':url.split('/').filter(Boolean).join('-'))+'-desktop.png'),fullPage:true});
  }
  await page.goto('http://127.0.0.1:4173/blog/');
  await page.locator('#post-search').fill('不存在的关键词');assert(await page.locator('#no-results').isVisible());
  await page.locator('#reset-search').click();assert.equal(await page.locator('.post-card:visible').count(),1);
  await page.locator('#post-search').fill('hello');assert.equal(await page.locator('.post-card:visible').count(),1);
  await page.reload();assert.equal(await page.locator('#post-search').inputValue(),'hello');
  await page.goto('http://127.0.0.1:4173/docs/writing-notes/');assert(await page.locator('.katex').count()>0);assert.equal(await page.locator('pre.astro-code').count(),1);
  const toc=page.locator('.toc a').first();await toc.click();assert(new URL(page.url()).hash.length>0);
  await page.goto('http://127.0.0.1:4173/friends/');await page.locator('.copy-button').click();assert.equal(await page.locator('.copy-status').innerText(),'已复制！');
  await page.locator('#theme-toggle').click();assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');await page.reload();assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
  const darkAxe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();violations.push(...darkAxe.violations.map(v=>({page:'/friends/ dark',id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})));
  await page.goto('http://127.0.0.1:4173/');await page.screenshot({path:path.join(out,'home-dark.png'),fullPage:true});
  await page.locator('#theme-toggle').click();
  for(const width of [375,768]){await page.setViewportSize({width,height:900});for(const url of paths){await page.goto(`http://127.0.0.1:4173${url}`);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow ${width} ${url}`);if(width===375) await page.screenshot({path:path.join(out,(url==='/'?'home':url.split('/').filter(Boolean).join('-'))+'-mobile.png'),fullPage:true});}}
  const feed=await context.request.get('http://127.0.0.1:4173/feed.xml');assert((await feed.text()).includes('<rss'));
  const sitemap=await context.request.get('http://127.0.0.1:4173/sitemap-0.xml');assert((await sitemap.text()).includes('/research/attention/'));
  assert.equal((await page.goto('http://127.0.0.1:4173/missing-page/')).status(),404);assert((await page.locator('h1').innerText()).includes('岔路'));
  const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:375,height:900}});const plain=await nojs.newPage();await plain.goto('http://127.0.0.1:4173/blog/hello-world/');assert((await plain.locator('article').innerText()).includes('给想法一个落脚'));assert(await plain.locator('nav[aria-label="主导航"] a[href="/research/"]').isVisible());await nojs.close();
  assert.deepEqual(errors,[],'browser errors');
  fs.writeFileSync(path.join(out,'audit.json'),JSON.stringify({errors,violations},null,2));
  console.log(JSON.stringify({testedPages:paths.length,viewports:[1440,768,375],errors,accessibilityViolations:violations.length,checks:['internal links','search and reset','persisted query','theme persistence','clipboard','math and code','TOC','RSS','sitemap','404','no JavaScript']},null,2));
  assert.equal(violations.length,0,'Accessibility violations: see test-results/audit.json');
}finally{await browser.close();}
