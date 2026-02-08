import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.acepace.net',
  output: 'static',
  integrations: [sitemap()],
  markdown: {
    syntaxHighlight: {
      type: 'shiki'
    }
  }
});
