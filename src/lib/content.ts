import { getCollection, type CollectionKey, type CollectionEntry } from 'astro:content';
export const formatDate = (date: Date) => date.toISOString().slice(0, 10).replaceAll('-', '.');
export const readingTime = (body = '') => Math.max(1, Math.ceil(body.length / 450));
export const entryUrl = (entry: CollectionEntry<CollectionKey>) => `/${entry.collection}/${entry.id}/`;
export async function entries<C extends CollectionKey>(collection: C) {
  const values = await getCollection(collection, ({ data }) => !data.draft);
  return values.sort((a, b) => collection === 'blog'
    ? b.data.date.getTime() - a.data.date.getTime() || a.id.localeCompare(b.id)
    : a.data.order - b.data.order || b.data.date.getTime() - a.data.date.getTime() || a.id.localeCompare(b.id));
}
