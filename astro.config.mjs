// @ts-check
import { defineConfig } from 'astro/config';
import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
  site: 'https://andrewy.me',
  integrations: [icon()],
  build: {
    // Emit /index.md and /llms.txt at their exact paths rather than as
    // directories with an index file.
    format: 'file',
  },
});
