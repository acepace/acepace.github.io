import type { CollectionEntry } from 'astro:content';

export const POSTS_PER_PAGE = 5;
export const SITE_TITLE = 'Musing on random technical subjects';
export const SITE_DESCRIPTION = 'Random writing of a geek, sometimes security and OS, sometimes just junk.';
export const SITE_URL = 'https://www.acepace.net';
export const TIMEZONE = 'Asia/Jerusalem';

const postFilenamePattern = /^(\d{4})-(\d{2})-(\d{2})-(.+)$/;

export function getFilenameSlug(entry: Pick<CollectionEntry<'blog'>, 'id'>): string {
  const match = entry.id.match(postFilenamePattern);
  return match ? match[4] : entry.id;
}

export function getPostPermalink(entry: CollectionEntry<'blog'>): string {
  const slug = getFilenameSlug(entry);
  const date = entry.data.date;
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `/${yyyy}-${mm}-${dd}-${slug}/`;
}

export function comparePosts(a: CollectionEntry<'blog'>, b: CollectionEntry<'blog'>): number {
  return b.data.date.getTime() - a.data.date.getTime();
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

export function getAllTags(posts: CollectionEntry<'blog'>[]): string[] {
  const tags = new Set<string>();
  for (const post of posts) {
    for (const tag of post.data.tags ?? []) {
      tags.add(tag);
    }
  }
  return [...tags].sort((a, b) => a.localeCompare(b));
}
