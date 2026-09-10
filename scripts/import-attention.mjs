import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const source = process.argv[2];
if (!source) throw new Error('Usage: node scripts/import-attention.mjs <source.md>');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const raw = fs.readFileSync(source, 'utf8').replace(/^\uFEFF/, '').replaceAll('\r\n', '\n');
const title = '# Attention 为什么一定要加起来等于 1？（上）';
assert(raw.startsWith(title + '\n'), 'Unexpected article title');
assert(raw.includes('## 九、小结'), 'Missing final summary');
assert(raw.includes('总和为 1 既是约束，也是有用的工具。'), 'Missing final revision');
let body = raw.slice(title.length).trimStart();
body = body.replaceAll('(assets/streamingllm_schemes.png)', '(/images/blog/attention-sum-to-one-part-1/streamingllm_schemes.png)');
body = body.replace('`assets/streamingllm_LICENSE.txt`', '[MIT 许可文本](/images/blog/attention-sum-to-one-part-1/streamingllm_LICENSE.txt)');
body = body.replace('图片使用相对路径引用，移动文章时请同时保留 `assets` 文件夹。', '配图与许可文本随本文一同提供。');
assert.deepEqual(body.match(/\$\$[\s\S]*?\$\$/g), raw.match(/\$\$[\s\S]*?\$\$/g), 'Equation content changed');
assert.equal((body.match(/\\tag\{\d+\}/g) || []).length, 46);
const dest = path.join(root, 'src/content/blog/attention-sum-to-one-part-1.md');
const old = fs.existsSync(dest) ? fs.readFileSync(dest, 'utf8') : '';
const published = old.match(/^date: (.+)$/m)?.[1] || '2026-09-10';
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const header = `---\ntitle: Attention 为什么一定要加起来等于 1？（上）\ndescription: 从 Attention Sink 出发，理解归一化、Sparsemax 与门控：选哪些内容，以及这次写入多少。\ndate: ${published}\n${today !== published ? `updated: ${today}\n` : ''}category: 科研\ntags: [Attention, Softmax, Attention Sink, Sparsemax, 门控]\ndraft: false\n---\n\n`;
const assetDir = path.join(root, 'public/images/blog/attention-sum-to-one-part-1');
for (const name of ['streamingllm_schemes.png', 'streamingllm_LICENSE.txt']) {
  const asset = path.join(path.dirname(source), 'assets', name);
  assert(fs.existsSync(asset), `Missing source asset: ${asset}`);
}
fs.mkdirSync(assetDir, { recursive: true });
for (const name of ['streamingllm_schemes.png', 'streamingllm_LICENSE.txt']) {
  fs.copyFileSync(path.join(path.dirname(source), 'assets', name), path.join(assetDir, name));
}
fs.writeFileSync(dest, header + body);
console.log(JSON.stringify({ source, destination: dest, numberedEquations: 46, assetsCopied: 2, url: 'https://chongfe.github.io/blog/attention-sum-to-one-part-1/' }, null, 2));
