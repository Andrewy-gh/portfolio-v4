const MARKDOWN_TYPE = 'text/markdown; charset=utf-8';
const DISCOVERY_LINKS = [
  '</index.md>; rel="alternate"; type="text/markdown"',
  '</llms.txt>; rel="describedby"; type="text/plain"',
].join(', ');

function appendVary(headers, value) {
  const current = headers.get('Vary');
  const values = new Set(
    (current ? current.split(',') : [])
      .map((item) => item.trim())
      .filter(Boolean),
  );
  values.add(value);
  headers.set('Vary', [...values].join(', '));
}

function withHeaders(response, updateHeaders) {
  const headers = new Headers(response.headers);
  updateHeaders(headers);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const acceptsMarkdown = request.headers
      .get('Accept')
      ?.toLowerCase()
      .includes('text/markdown');

    if (
      url.pathname === '/' &&
      acceptsMarkdown &&
      (request.method === 'GET' || request.method === 'HEAD')
    ) {
      const markdownUrl = new URL('/index.md', url);
      const markdownResponse = await fetch(markdownUrl, {
        method: request.method,
        headers: request.headers,
        redirect: 'follow',
      });

      return withHeaders(markdownResponse, (headers) => {
        headers.set('Content-Type', MARKDOWN_TYPE);
        headers.set('Content-Location', '/index.md');
        headers.set('Link', DISCOVERY_LINKS);
        appendVary(headers, 'Accept');
      });
    }

    const response = await fetch(request);

    if (url.pathname !== '/') {
      return response;
    }

    return withHeaders(response, (headers) => {
      headers.set('Link', DISCOVERY_LINKS);
      appendVary(headers, 'Accept');
    });
  },
};
