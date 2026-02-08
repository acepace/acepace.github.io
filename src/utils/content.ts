import { getCollection, type CollectionEntry } from 'astro:content';
import { comparePosts, POSTS_PER_PAGE } from './blog';

export async function getPublishedPosts(): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.sort(comparePosts);
}

export function paginatePosts(posts: CollectionEntry<'blog'>[]) {
  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
  return Array.from({ length: totalPages }, (_, index) => {
    const page = index + 1;
    const start = index * POSTS_PER_PAGE;
    return {
      page,
      totalPages,
      posts: posts.slice(start, start + POSTS_PER_PAGE)
    };
  });
}
