const HTML_TYPE = 'text/html; charset=utf-8';
const MARKDOWN_TYPE = 'text/markdown; charset=utf-8';
const TEXT_TYPE = 'text/plain; charset=utf-8';

const HTML_PATHS = new Set(['/', '/index.html']);
const MARKDOWN_PATH = '/index.md';
const LLMS_PATH = '/llms.txt';

// Every representation advertises the others, so a client that lands on any one
// of them can find the rest (RFC 8288).
const LINKS_FROM_HTML = [
  `<${MARKDOWN_PATH}>; rel="alternate"; type="text/markdown"`,
  `<${LLMS_PATH}>; rel="describedby"; type="text/plain"`,
].join(', ');

const LINKS_FROM_MARKDOWN = [
  '</>; rel="alternate"; type="text/html"',
  `<${LLMS_PATH}>; rel="describedby"; type="text/plain"`,
].join(', ');

const LINKS_FROM_LLMS = [
  '</>; rel="alternate"; type="text/html"',
  `<${MARKDOWN_PATH}>; rel="alternate"; type="text/markdown"`,
].join(', ');

/**
 * Parse an Accept header into media ranges with their q-values.
 * Returns null when the header is absent or unparseable, which RFC 9110 treats
 * as "anything is acceptable".
 */
function parseAccept(header) {
  if (!header) {
    return null;
  }

  const entries = header
    .split(',')
    .map((part) => {
      const [rawType, ...params] = part.split(';');
      const type = rawType.trim().toLowerCase();

      if (!type) {
        return null;
      }

      let q = 1;

      for (const param of params) {
        const separator = param.indexOf('=');

        if (separator === -1) {
          continue;
        }

        const key = param.slice(0, separator).trim().toLowerCase();

        if (key !== 'q') {
          continue;
        }

        const parsed = Number.parseFloat(param.slice(separator + 1).trim());

        if (!Number.isNaN(parsed)) {
          q = Math.min(Math.max(parsed, 0), 1);
        }
      }

      return { type, q };
    })
    .filter(Boolean);

  return entries.length > 0 ? entries : null;
}

/**
 * Best q-value the client offered for a media type, considering `type/*` and
 * `*​/*` wildcards. Returns -1 when nothing in the header matches at all.
 * `explicit` distinguishes a wildcard match from the client naming the type.
 *
 * RFC 9110 §12.5.1: the most specific reference has precedence. An entry naming
 * the exact type therefore decides on its own — including an explicit `q=0`,
 * which a wildcard must not be able to raise back up. Taking a plain max across
 * both kinds of match would let a header that excludes HTML with `q=0` and then
 * accepts a bare wildcard still be served HTML.
 */
function negotiate(entries, mediaType) {
  const wildcard = `${mediaType.split('/')[0]}/*`;
  let exact = -1;
  let wild = -1;

  for (const entry of entries) {
    if (entry.type === mediaType) {
      exact = Math.max(exact, entry.q);
    } else if (entry.type === wildcard || entry.type === '*/*') {
      wild = Math.max(wild, entry.q);
    }
  }

  return exact >= 0 ? { q: exact, explicit: true } : { q: wild, explicit: false };
}

/**
 * Decide which representation of the landing page to serve.
 * Returns 'html', 'markdown', or 'none' (-> 406).
 */
function selectRepresentation(acceptHeader) {
  const entries = parseAccept(acceptHeader);

  if (!entries) {
    return 'html';
  }

  const markdown = negotiate(entries, 'text/markdown');
  const html = negotiate(entries, 'text/html');

  if (markdown.q <= 0 && html.q <= 0) {
    return 'none';
  }

  // Ties resolve to Markdown, but only when the client actually asked for it by
  // name. Coding agents commonly send `text/markdown, text/html` with both at
  // q=1; a browser's `*/*` also ties and must not flip to Markdown.
  if (markdown.explicit && markdown.q > 0 && markdown.q >= html.q) {
    return 'markdown';
  }

  return html.q > 0 ? 'html' : 'markdown';
}

function appendVary(headers, value) {
  const values = new Set(
    (headers.get('Vary') ?? '')
      .split(',')
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

function notAcceptable() {
  return new Response(
    'Not Acceptable. This resource is available as text/html and text/markdown.\n',
    {
      status: 406,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        Link: LINKS_FROM_HTML,
        Vary: 'Accept',
      },
    },
  );
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const { pathname } = url;
    const isReadRequest =
      request.method === 'GET' || request.method === 'HEAD';

    // An explicit .md or .txt URL overrides negotiation entirely; only attach
    // the discovery headers so clients can navigate back to the HTML.
    if (pathname === MARKDOWN_PATH || pathname === LLMS_PATH) {
      const response = await fetch(request);
      const isMarkdown = pathname === MARKDOWN_PATH;

      return withHeaders(response, (headers) => {
        // Astro emits these as plain static files, so their Content-Type would
        // otherwise depend on the origin's MIME guess for .md / .txt. Pin it so
        // a direct hit matches what negotiation on / returns.
        if (response.ok) {
          headers.set('Content-Type', isMarkdown ? MARKDOWN_TYPE : TEXT_TYPE);
        }
        headers.set('Link', isMarkdown ? LINKS_FROM_MARKDOWN : LINKS_FROM_LLMS);
        appendVary(headers, 'Accept');
      });
    }

    if (!HTML_PATHS.has(pathname) || !isReadRequest) {
      return fetch(request);
    }

    const representation = selectRepresentation(request.headers.get('Accept'));

    if (representation === 'none') {
      return notAcceptable();
    }

    if (representation === 'markdown') {
      const markdownResponse = await fetch(new URL(MARKDOWN_PATH, url).href, {
        method: request.method,
        headers: request.headers,
        redirect: 'follow',
      });

      return withHeaders(markdownResponse, (headers) => {
        // Only relabel a body that really is the Markdown document. If the
        // origin 404s or 5xxes, forcing text/markdown onto an HTML error page
        // hides the failure behind a mislabelled response.
        if (markdownResponse.ok) {
          headers.set('Content-Type', MARKDOWN_TYPE);
          headers.set('Content-Location', MARKDOWN_PATH);
        }
        headers.set('Link', LINKS_FROM_MARKDOWN);
        appendVary(headers, 'Accept');
      });
    }

    const response = await fetch(request);

    return withHeaders(response, (headers) => {
      headers.set('Content-Type', HTML_TYPE);
      headers.set('Link', LINKS_FROM_HTML);
      appendVary(headers, 'Accept');
    });
  },
};
