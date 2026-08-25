import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const readDist = (path: string) => readFile(new URL(`./dist/${path}`, import.meta.url), 'utf8');

test('homepage exposes substantial, structured content without JavaScript', async () => {
  const html = await readDist('index.html');
  const withoutScripts = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  const text = withoutScripts.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  assert.ok(text.length >= 500, `expected at least 500 raw HTML characters, got ${text.length}`);
  assert.match(withoutScripts, /<h1\b[^>]*>[\s\S]*Andy Yu[\s\S]*<\/h1>/i);
  assert.match(withoutScripts, /<h2\b[^>]*>Recent Work<\/h2>/i);
  assert.doesNotMatch(withoutScripts, /<h4\b/i, 'heading levels must not skip from project h3s to h4');
});

test('homepage Person JSON-LD includes complete identity fields', async () => {
  const html = await readDist('index.html');
  const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(match, 'JSON-LD script must exist');
  const data = JSON.parse(match[1]);
  assert.equal(data['@type'], 'Person');
  for (const field of ['name', 'description', 'url', 'jobTitle']) assert.ok(data[field], `${field} is required`);
  assert.ok(data.sameAs.includes('https://www.linkedin.com/in/andrewydev/'));
});

test('llms.txt says specifically when and how agents should use the site', async () => {
  const body = await readDist('llms.txt');
  assert.match(body, /^## When to use this site$/m);
  assert.match(body, /evaluating Andy Yu for full-stack software engineering work/);
  assert.match(body, /fetch `\/index\.md` with GET/);
});

test('static 404 recovery page points agents to machine-readable indexes', async () => {
  const html = await readDist('404.html');
  assert.match(html, /404 — Page not found/);
  for (const path of ['/sitemap.xml', '/llms.txt', '/index.md']) assert.match(html, new RegExp(`href="${path.replace('.', '\\.')}`));
});
