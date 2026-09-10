import { chromium } from '@playwright/test';
import fs from 'node:fs';
const browser = await chromium.launch({channel:'msedge',headless:true});
try {
  const page = await browser.newPage({viewport:{width:1200,height:630},deviceScaleFactor:1});
  const art=fs.readFileSync('public/assets/art.svg','utf8');
  await page.setContent(`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;background:#faf9f6;color:#302f37;font-family:'Segoe UI','Microsoft YaHei',sans-serif}.frame{padding:60px 70px;height:630px;position:relative;border:20px solid #eee8f5}.brand{font-size:23px;font-weight:600;color:#8061b5}.copy{position:relative;z-index:2;margin-top:65px}h1{font-size:82px;letter-spacing:-3px;margin:0 0 20px}h1 span{color:#8061b5}p{font-size:27px;margin:0 0 32px}.small{font-family:monospace;color:#736d7b;font-size:16px}.art{position:absolute;right:0;top:125px;width:480px;opacity:.9}.url{position:absolute;bottom:48px;font-size:15px;letter-spacing:2px;color:#736d7b}</style><div class="frame"><div class="brand">R1ck5.</div><div class="copy"><h1>Hi, I’m <span>R1ck5.</span></h1><p>花开堪折直须折，<br>莫待无花空折枝</p><div class="small">RESEARCH / BLOG / NOTES / FRIENDS</div></div><div class="art">${art}</div><div class="url">chongfe.github.io</div></div></html>`);
  await page.screenshot({path:'public/assets/social.png'});
  console.log('Created public/assets/social.png (1200 × 630).');
}finally{await browser.close();}
