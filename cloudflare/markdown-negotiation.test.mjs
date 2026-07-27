// Run with: npm test
//
// Exercises the worker's Accept negotiation against a stubbed origin. No
// dependencies: Node 18+ provides Request/Response/Headers globally.
//
// The q=0 cases at the bottom are regressions. An earlier version took a plain
// max across exact and wildcard matches, so a wildcard could raise a media
// type's q-value back up after the client had excluded it with q=0.

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import worker from './markdown-negotiation.js';

const ORIGIN = {
  '/': ['<!doctype html><html></html>', 'text/html; charset=utf-8'],
  '/index.html': ['<!doctype html><html></html>', 'text/html; charset=utf-8'],
  '/index.md': ['# Andy Yu\n', 'text/markdown; charset=utf-8'],
  '/llms.txt': ['# Andy Yu\n', 'text/plain; charset=utf-8'],
};

const realFetch = globalThis.fetch;

before(() => {
  globalThis.fetch = async (input) => {
    const href = input instanceof URL ? input.href : typeof input === 'string' ? input : input.url;
    const hit = ORIGIN[new URL(href).pathname];
    if (!hit) return new Response('not found', { status: 404 });
    return new Response(hit[0], {
      status: 200,
      headers: { 'Content-Type': hit[1], Vary: 'accept-encoding' },
    });
  };
});

after(() => {
  globalThis.fetch = realFetch;
});

/** @param {string} path @param {string|null} accept */
async function get(path, accept) {
  return worker.fetch(
    new Request(`https://andrewy.me${path}`, {
      headers: accept ? { Accept: accept } : {},
    }),
  );
}

/** [label, path, Accept, expected status, expected Content-Type substring] */
const cases = [
  ['no Accept header', '/', null, 200, 'text/html'],
  ['*/* from curl', '/', '*/*', 200, 'text/html'],
  ['browser default', '/', 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8', 200, 'text/html'],
  ['html q=1 beats md q=0.5', '/', 'text/html, text/markdown;q=0.5', 200, 'text/html'],
  ['md q=0.1 loses to html q=1', '/', 'text/markdown;q=0.1, text/html;q=1.0', 200, 'text/html'],
  ['text/* wildcard is not explicit', '/', 'text/*', 200, 'text/html'],
  ['agent tie resolves to md', '/', 'text/markdown, text/html', 200, 'text/markdown'],
  ['md only', '/', 'text/markdown', 200, 'text/markdown'],
  ['md q=0.9 beats html q=0.8', '/', 'text/markdown;q=0.9, text/html;q=0.8', 200, 'text/markdown'],
  ['media type params ignored', '/', 'text/markdown;variant=GFM, text/html;q=0.5', 200, 'text/markdown'],
  ['json falls back to md', '/', 'application/json, text/markdown;q=0.5', 200, 'text/markdown'],
  ['json alone is 406', '/', 'application/json', 406, 'text/plain'],
  ['image alone is 406', '/', 'image/png', 406, 'text/plain'],
  ['/index.html serves html', '/index.html', 'text/html', 200, 'text/html'],
  ['/index.html negotiates md', '/index.html', 'text/markdown', 200, 'text/markdown'],
  ['explicit .md URL wins', '/index.md', 'text/html', 200, 'text/markdown'],
  ['explicit .md URL never 406s', '/index.md', 'application/json', 200, 'text/markdown'],
  ['/llms.txt is text/plain', '/llms.txt', '*/*', 200, 'text/plain'],

  // Regressions: an exact match must win over a wildcard, including at q=0.
  ['q=0 html + wildcard -> md', '/', 'text/html;q=0, */*', 200, 'text/markdown'],
  ['q=0 md + html -> html', '/', 'text/markdown;q=0, text/html', 200, 'text/html'],
  ['q=0 md + text/* -> html', '/', 'text/markdown;q=0, text/*', 200, 'text/html'],
  ['q=0 html + md -> md', '/', 'text/html;q=0, text/markdown', 200, 'text/markdown'],
  ['q=0 on both -> 406', '/', 'text/markdown;q=0, text/html;q=0, */*;q=0.5', 406, 'text/plain'],
];

for (const [label, path, accept, status, contentType] of cases) {
  test(label, async () => {
    const res = await get(path, accept);
    assert.equal(res.status, status, `status for Accept: ${accept}`);
    assert.match(res.headers.get('Content-Type') ?? '', new RegExp(contentType));
    assert.match(res.headers.get('Vary') ?? '', /accept/i, 'Vary must include Accept');
    assert.match(res.headers.get('Link') ?? '', /rel="alternate"/, 'Link must advertise the alternate');
  });
}

test('non-negotiated paths pass through untouched', async () => {
  const res = await worker.fetch(new Request('https://andrewy.me/_astro/app.js'));
  assert.equal(res.headers.get('Link'), null);
});

test('non-GET/HEAD requests are not negotiated', async () => {
  const res = await worker.fetch(
    new Request('https://andrewy.me/', { method: 'POST', headers: { Accept: 'text/markdown' } }),
  );
  assert.match(res.headers.get('Content-Type') ?? '', /text\/html/);
});

test('a failed markdown subrequest is not relabelled as markdown', async () => {
  const saved = globalThis.fetch;
  globalThis.fetch = async () => new Response('<h1>Not Found</h1>', {
    status: 404,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
  try {
    const res = await get('/', 'text/markdown');
    assert.equal(res.status, 404);
    assert.doesNotMatch(res.headers.get('Content-Type') ?? '', /markdown/);
  } finally {
    globalThis.fetch = saved;
  }
});
