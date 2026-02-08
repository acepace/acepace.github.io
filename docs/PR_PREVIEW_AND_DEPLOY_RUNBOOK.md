# PR Testing, Preview, and Merge Runbook

This runbook explains:
1. How to test pull requests and provide previews.
2. What a committer should do before and after merge to update the live website.

## 1) Testing PRs and Providing Previews

### Local test flow (required)
Run these from repo root:

```bash
npm install
npm run build
npm run preview
```

Then verify in browser:
- Home page: `http://localhost:4321/`
- About: `http://localhost:4321/about/`
- Tags index: `http://localhost:4321/tags/`
- RSS: `http://localhost:4321/feed.xml`
- Atom: `http://localhost:4321/atom.xml`
- A few posts under `/YYYY-MM-DD-slug/`
- Pagination routes: `/page2/` and `/page/2/`

### PR checklist for reviewer/author
- Site builds with no errors.
- New/edited posts are in `src/content/blog/`.
- New post filename is `YYYY-MM-DD-slug.md`.
- Frontmatter has valid `title` and `date`.
- Images/assets are in `public/` and links are root-relative (`/images/...`).
- No broken internal links.
- No accidental URL changes for existing pages/posts.

### How to provide a preview in the PR
Use at least one of these:
- Add screenshots/GIFs for changed pages.
- Add tested local URLs and what was validated in the PR description.
- If needed, attach the built `dist/` output as a PR artifact via your preferred CI job.

Note: this repository currently deploys production only from `master` via `.github/workflows/deploy.yml`.

## 2) Committer Responsibilities Pre/Post Merge

## Pre-merge (committer)
1. Confirm PR scope and URL impact.
2. Run local verification:
```bash
npm install
npm run build
npm run preview
```
3. Validate core pages and feeds:
- `/`
- `/about/`
- `/tags/`
- `/feed.xml`
- `/atom.xml`
4. For content PRs, open at least one new/edited post URL and confirm permalink format `/YYYY-MM-DD-slug/`.
5. Ensure `public/CNAME` still contains:
```txt
www.acepace.net
```
6. Merge into `master`.

## Post-merge (committer)
1. Open GitHub Actions and watch `Deploy Astro site to Pages`.
2. Confirm both jobs succeed:
- `build`
- `deploy`
3. Confirm site update on production:
- `https://www.acepace.net/`
- check one changed URL from the merged PR.
4. If deployment fails:
- inspect workflow logs in `.github/workflows/deploy.yml`
- fix in a follow-up PR and merge to `master`
- re-run workflow after fix.

## Operational Notes
- Production deploy is automatic on push to `master`.
- There is no separate preview environment configured by default.
- Any merge to `master` is potentially user-visible after the deploy job completes.
