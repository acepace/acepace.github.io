# Migration Notes: Jekyll -> Astro

## What Changed
- Replaced Jekyll/Beautiful Jekyll site with Astro static site at repository root.
- Added Astro project config and content collections.
- Migrated blog posts from `_posts/` to `src/content/blog/`.
- Added Astro routes for post permalinks, pagination, tags, and static pages.
- Migrated static assets into `public/` to keep legacy paths working.
- Added GitHub Actions workflow for GitHub Pages deployment.
- Preserved custom domain with `public/CNAME` (`www.acepace.net`).

## Jekyll Concept to Astro Mapping
- `_posts/*.md` -> `src/content/blog/*.md` (Astro content collection)
- `permalink: /:year-:month-:day-:title/` -> `src/pages/[year]-[month]-[day]-[slug].astro`
- `paginate: 5` -> `POSTS_PER_PAGE = 5` in `src/utils/blog.ts`
- `jekyll-paginate` -> `src/pages/index.astro`, `src/pages/page[page].astro`, `src/pages/page/[page].astro`
- `jekyll-feed` -> `src/pages/feed.xml.ts` (`@astrojs/rss`)
- `jekyll-sitemap` -> `@astrojs/sitemap` integration in `astro.config.mjs`
- `jekyll-seo-tag` -> SEO metadata in `src/layouts/BaseLayout.astro`
- `tags.html` Liquid page -> `src/pages/tags/index.astro` + `src/pages/tags/[tag].astro`

## Manual Fixes Applied
- Converted Liquid URL interpolation:
- `{{ site.url }}/images/...` -> `/images/...`
- Converted Jekyll highlight blocks:
- `{% highlight lang %}` / `{% endhighlight %}` -> fenced markdown code blocks
- Removed obsolete frontmatter `layout` in migrated posts.
- Reimplemented `atom.xml` and `feed.xml` as Astro endpoints.
- Added compatibility routes:
- `tags.html`
- `page2` / `page3` style pagination URLs
