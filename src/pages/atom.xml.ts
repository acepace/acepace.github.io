import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { getPostPermalink } from '../utils/blog';

function escapeXml(input: string): string {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export const GET: APIRoute = async ({ site }) => {
  const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime()
  );

  const base = site?.toString().replace(/\/$/, '') ?? 'https://www.acepace.net';
  const updated = posts[0]?.data.date.toISOString() ?? new Date().toISOString();

  const entries = posts
    .map((post) => {
      const link = `${base}${getPostPermalink(post)}`;
      const title = escapeXml(post.data.title);
      return `<entry><title>${title}</title><link href="${link}"/><id>${link}</id><updated>${post.data.date.toISOString()}</updated></entry>`;
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="utf-8"?><feed xmlns="http://www.w3.org/2005/Atom"><title>Musing on random technical subjects</title><link href="${base}/atom.xml" rel="self"/><link href="${base}/"/><updated>${updated}</updated><id>${base}/</id>${entries}</feed>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/atom+xml; charset=utf-8'
    }
  });
};
