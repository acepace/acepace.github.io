import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { getPostPermalink, SITE_DESCRIPTION, SITE_TITLE } from '../utils/blog';

export async function GET(context) {
  const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime()
  );

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site ?? 'https://www.acepace.net',
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description ?? post.data.title,
      pubDate: post.data.date,
      link: getPostPermalink(post)
    }))
  });
}
