import type { APIRoute } from 'astro';
import { projects } from '../data/projects';
import { site, about } from '../data/site';

// Generated from the same data as index.astro so the Markdown surface can never
// drift from the rendered page.
export const GET: APIRoute = () => {
  const body = [
    `# ${site.name}`,
    '',
    site.summary,
    '',
    `Canonical portfolio: ${site.url}`,
    '',
    '## Recent work',
    '',
    ...projects.flatMap((project) => [
      `### ${project.name}`,
      '',
      project.desc,
      '',
      `- Live site: ${project.liveLink}`,
      ...(project.githubLink ? [`- Source: ${project.githubLink}`] : []),
      `- Tech: ${project.techs.join(', ')}`,
      '',
    ]),
    '## About',
    '',
    ...about.flatMap((paragraph) => [paragraph, '']),
    '## Contact and profiles',
    '',
    `- Portfolio: ${site.url}`,
    `- GitHub: ${site.github}`,
    '',
    `For a concise machine-readable site map, see ${site.url}llms.txt.`,
    '',
  ].join('\n');

  // This is a static build, so only the body survives into dist/index.md —
  // response headers set here are discarded. Content-Type and Link for this
  // resource are set by cloudflare/markdown-negotiation.js.
  return new Response(body);
};
