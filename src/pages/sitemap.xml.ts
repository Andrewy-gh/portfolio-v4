import type { APIRoute } from 'astro';
import { site } from '../data/site';

// Generated at build time so lastmod cannot go stale the way a hand-edited
// public/sitemap.xml did. Only the canonical page is listed: /index.md and
// /llms.txt are alternate representations of it, not separate documents, and
// listing them would invite duplicate-content indexing.
export const GET: APIRoute = () => {
  const lastmod = new Date().toISOString().slice(0, 10);

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${site.url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;

  return new Response(body);
};
