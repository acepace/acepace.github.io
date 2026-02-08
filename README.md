# acepace.github.io (Astro)

This repository is a static Astro site deployed to GitHub Pages.

## Prerequisites
- Node.js: `20.x` (recommended: latest Node 20 LTS)
- Package manager: `npm`
- Required global tools: none
- Optional editor extensions: Astro, ESLint, Prettier, Markdown linting

## Local Development
1. Install dependencies:
```bash
npm install
```
2. Start dev server:
```bash
npm run dev
```
3. Build static output:
```bash
npm run build
```
4. Preview production build:
```bash
npm run preview
```

## Content Workflows
### Add a new blog post
1. Create a markdown file in `src/content/blog/`.
2. Use filename format: `YYYY-MM-DD-slug.md`.
3. Use frontmatter:
```md
---
title: "Post title"
date: 2026-02-08 12:00:00 +0200
tags: [tag1, tag2]
categories: [category1]
description: Optional short summary
---
```
4. Permalink is generated as `/YYYY-MM-DD-slug/`.
- Date in URL uses frontmatter `date`.
- Slug in URL uses the filename slug segment.
5. Add images/assets in `public/images/` (or another `public/` subfolder) and reference as `/images/example.png`.

### Add or edit static pages
- Create/edit Astro pages in `src/pages/`.
- Examples: `src/pages/about.astro`, `src/pages/tags/index.astro`.

### Assets placement and references
- Put static files under `public/`.
- Reference by root-relative path, for example:
- `/images/deadlockEmpire/Barrier.jpg`
- `/files/lawatch/index.html`

## Routing Rules
- Post permalink rule: `/YYYY-MM-DD-slug/`
- Implemented in:
- `src/pages/[year]-[month]-[day]-[slug].astro`
- `src/utils/blog.ts` (`getFilenameSlug`, `getPostPermalink`)
- Pagination size is `5` and implemented in:
- `src/utils/blog.ts` (`POSTS_PER_PAGE`)
- `src/utils/content.ts` (`paginatePosts`)
- Index and pagination routes:
- `/` (`src/pages/index.astro`)
- `/page2/`, `/page3/` via `src/pages/page[page].astro` (Jekyll-style compatibility)
- `/page/2/`, `/page/3/` via `src/pages/page/[page].astro`

## Deployment
- GitHub Actions workflow: `.github/workflows/deploy.yml`
- Trigger: push to `master` (and manual dispatch)
- Build output: `dist/`
- GitHub Pages publish job uploads `dist/` artifact and deploys it
- Custom domain is preserved by `public/CNAME` (`www.acepace.net`)
- PR testing/preview and merge operator checklist: `docs/PR_PREVIEW_AND_DEPLOY_RUNBOOK.md`

## Troubleshooting
- `npm install` fails:
- Confirm Node version is 20.x: `node -v`
- Remove stale lock/state and reinstall if needed

- Build fails due to frontmatter validation:
- Check required fields in blog post frontmatter (`title`, `date`)
- Ensure `tags`/`categories` are arrays or simple space/comma-separated strings

- Broken links or images:
- Verify files exist under `public/`
- Use root-relative links (`/images/...`), not local filesystem paths

- Deployment workflow failed:
- Open Actions logs for `.github/workflows/deploy.yml`
- Confirm Pages is enabled in repository settings
- Confirm branch is `master` and the workflow has `pages: write` permissions

