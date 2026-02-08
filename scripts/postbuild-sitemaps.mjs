import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const distDir = 'dist';
const sitemapIndex = join(distDir, 'sitemap-index.xml');
const sitemapShard = join(distDir, 'sitemap-0.xml');
const sitemapXml = join(distDir, 'sitemap.xml');
const wellKnownDir = join(distDir, '.well-known');

if (!existsSync(sitemapIndex)) {
  throw new Error(`Expected ${sitemapIndex} to exist after build.`);
}

mkdirSync(wellKnownDir, { recursive: true });

// Compatibility aliases for consumers expecting /sitemap.xml.
cpSync(sitemapIndex, sitemapXml);

// Well-known copies for stricter crawlers/integrations.
cpSync(sitemapIndex, join(wellKnownDir, 'sitemap.xml'));
cpSync(sitemapIndex, join(wellKnownDir, 'sitemap-index.xml'));

if (existsSync(sitemapShard)) {
  cpSync(sitemapShard, join(wellKnownDir, 'sitemap-0.xml'));
}
