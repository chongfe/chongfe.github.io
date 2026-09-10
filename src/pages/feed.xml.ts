import rss from '@astrojs/rss';
import { site } from '../config/site';
import { entries, entryUrl } from '../lib/content';
export async function GET() {
  const posts = await entries('blog');
  return rss({ title: 'R1ck5 的博客', description: site.description, site: site.url,
    items: posts.map(p => ({ title:p.data.title, description:p.data.description, pubDate:p.data.date, link:entryUrl(p), categories:[p.data.category, ...p.data.tags] })),
    customData: '<language>zh-CN</language>',
  });
}
