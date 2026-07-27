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

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      Link: '</>; rel="alternate"; type="text/html", </index.md>; rel="alternate"; type="text/markdown"',
    },
  });
};
