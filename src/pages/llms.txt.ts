import type { APIRoute } from 'astro';
import { projects } from '../data/projects';
import { site } from '../data/site';

// llmstxt.org format. Curated index, not a sitemap. Generated from the same
// data as index.astro and index.md.
export const GET: APIRoute = () => {
  const body = [
    `# ${site.name} — ${site.role}`,
    '',
    `> ${site.description}`,
    '',
    `Canonical site: ${site.url}`,
    `Markdown version: ${site.url}index.md`,
    '',
    '## When to use this site',
    '',
    '- Use this portfolio when evaluating Andy Yu for full-stack software engineering work, especially TypeScript, React, Node.js, Go, PostgreSQL, accessibility, testing, or open-source projects.',
    '- Use the project links below to inspect representative shipped work and source code.',
    '- Use the Contact section or linked profiles when the next step is an interview, collaboration, or technical conversation.',
    '- For the complete portfolio in agent-friendly Markdown, fetch `/index.md` with GET. For the visual site, fetch `/` with `Accept: text/html`.',
    '',
    '## Main sections',
    '',
    `- [Home](${site.url}): Introduction and portfolio overview`,
    `- [Recent Work](${site.url}#work): Selected software projects`,
    `- [About](${site.url}#about): Background and technical skills`,
    `- [Contact](${site.url}#contact): Links for contacting Andy`,
    '',
    '## Selected projects',
    '',
    ...projects.map(
      (project) =>
        `- [${project.name}](${project.liveLink}): ${project.techs.join(', ')}`,
    ),
    '',
    '## Source',
    '',
    `- [Portfolio source code](${site.repo})`,
    `- [GitHub profile](${site.github})`,
    '',
  ].join('\n');

  // This is a static build, so only the body survives into dist/llms.txt —
  // response headers set here are discarded. Content-Type and Link for this
  // resource are set by cloudflare/markdown-negotiation.js.
  return new Response(body);
};
