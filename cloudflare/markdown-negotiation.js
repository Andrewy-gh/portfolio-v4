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

// Parameters carried by every representation this worker serves. A media range
// that names parameters only matches a representation that actually has them
// (RFC 9110 12.5.1), so `text/markdown;variant=GFM` matches nothing here while
// `text/html;charset=utf-8` still matches the HTML page.
const REPRESENTATION_PARAMS = { charset: 'utf-8' };

// Specificity tiers, most specific first. Used to pick which media range in the
// header governs a given media type; a more specific range always wins, even
// when a broader one carries a higher q-value.
const TIER_NONE = 0;
const TIER_ANY = 1; // matched the bare wildcard
const TIER_TYPE = 2; // matched `type/` plus a wildcard subtype
const TIER_EXACT = 3; // named the exact type
const TIER_EXACT_PARAMS = 4; // named the exact type with matching parameters

/**
 * Parse an Accept header into media ranges with their q-values and any
 * media-range parameters. Returns null when the header is absent or
 * unparseable, which RFC 9110 treats as "anything is acceptable".
 *
 * Parameters before `q` belong to the media range; anything after `q` is
 * accept-ext and is ignored.
 */
function parseAccept(header) {
  if (!header) {
    return null;
  }

  const entries = header
    .split(',')
    .map((part) => {
      const segments = part.split(';');
      const type = segments.shift().trim().toLowerCase();

      if (!type) {
        return null;
      }

      let q = 1;
      let seenQ = false;
      const params = [];

      for (const segment of segments) {
        const separator = segment.indexOf('=');

        if (separator === -1) {
          continue;
        }

        const key = segment.slice(0, separator).trim().toLowerCase();
        const value = segment
          .slice(separator + 1)
          .trim()
          .replace(/^"(.*)"$/, '$1');

        if (!seenQ && key === 'q') {
          seenQ = true;
          const parsed = Number.parseFloat(value);

          if (!Number.isNaN(parsed)) {
            q = Math.min(Math.max(parsed, 0), 1);
          }
        } else if (!seenQ) {
          params.push([key, value.toLowerCase()]);
        }
      }

      return { type, q, params };
    })
    .filter(Boolean);

  return entries.length > 0 ? entries : null;
}

/** How specifically one media range refers to `mediaType`. */
function specificity(entry, mediaType) {
  for (const [key, value] of entry.params) {
    if (REPRESENTATION_PARAMS[key] !== value) {
      return TIER_NONE;
    }
  }

  if (entry.type === mediaType) {
    return entry.params.length > 0 ? TIER_EXACT_PARAMS : TIER_EXACT;
  }

  if (entry.type === `${mediaType.split('/')[0]}/*`) {
    return TIER_TYPE;
  }

  return entry.type === '*/*' ? TIER_ANY : TIER_NONE;
}

/**
 * Effective quality the client assigned to a media type.
 *
 * RFC 9110 12.5.1: the most specific reference has precedence. Only ranges at
 * the winning tier contribute, so a broad range can neither raise nor lower a
 * value set by a narrower one — that is what makes `text/html;q=0` stick, and
 * what makes a narrow `text/*;q=0` outrank a following bare wildcard.
 *
 * `explicit` reports whether the client named the type itself rather than
 * reaching it through a wildcard. Returns -1 when nothing in the header matches.
 */
function negotiate(entries, mediaType) {
  let tier = TIER_NONE;
  let q = -1;

  for (const entry of entries) {
    const entryTier = specificity(entry, mediaType);

    if (entryTier === TIER_NONE) {
      continue;
    }

    if (entryTier > tier) {
      tier = entryTier;
      q = entry.q;
    } else if (entryTier === tier) {
      q = Math.max(q, entry.q);
    }
  }

  return { q, explicit: tier >= TIER_EXACT };
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

  // A strictly higher quality wins outright. `explicit` only breaks an exact
  // tie: coding agents send `text/markdown, text/html` with both at q=1 and
  // want Markdown, while a browser's bare wildcard ties the same way and must
  // stay on HTML.
  if (markdown.q > 0 && markdown.q > html.q) {
    return 'markdown';
  }

  if (markdown.q > 0 && markdown.q === html.q && markdown.explicit) {
    return 'markdown';
  }

  if (html.q > 0) {
    return 'html';
  }

  return markdown.q > 0 ? 'markdown' : 'none';
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

// Named agents are matched before the browser heuristic, because nearly all of
// them prefix their User-Agent with "Mozilla/5.0". Deliberately not an
// allowlist: anything unrecognised is bucketed as `other` or `library` but its
// raw User-Agent is still recorded, so a new agent stays discoverable.
const AGENT_PATTERNS = [
  ['chatgpt-user', /chatgpt-user/i],
  ['oai-searchbot', /oai-searchbot/i],
  ['gptbot', /gptbot/i],
  ['claude-code', /claude-code/i],
  ['claude-user', /claude-user/i],
  ['claude-searchbot', /claude-searchbot/i],
  ['claudebot', /claudebot/i],
  ['perplexity', /perplexity/i],
  ['google-extended', /google-extended/i],
  ['googlebot', /googlebot/i],
  ['bingbot', /bingbot/i],
  ['applebot', /applebot/i],
  ['bytespider', /bytespider/i],
  ['ccbot', /ccbot/i],
  ['meta', /meta-externalagent|facebookbot/i],
  ['amazonbot', /amazonbot/i],
  ['cohere', /cohere-ai/i],
  ['duckduckbot', /duckduckbot/i],
];

const LIBRARY = /curl|wget|python|node-fetch|go-http|okhttp|java|ruby|axios|got\//i;
const NOT_A_BROWSER = /bot|crawler|spider|scraper|http|python|curl|wget|node/i;
const BROWSER = /mozilla\/5\.0.*(chrome|safari|firefox|edg|opr)/i;

/** Bucket a User-Agent. The result is the single Analytics Engine index. */
function classifyAgent(userAgent) {
  if (!userAgent) {
    return 'none';
  }

  for (const [name, pattern] of AGENT_PATTERNS) {
    if (pattern.test(userAgent)) {
      return name;
    }
  }

  if (BROWSER.test(userAgent) && !NOT_A_BROWSER.test(userAgent)) {
    return 'browser';
  }

  return LIBRARY.test(userAgent) ? 'library' : 'other';
}

function truncate(value, max) {
  return (value ?? '').slice(0, max);
}

function referrerHost(request) {
  const referrer = request.headers.get('Referer');

  if (!referrer) {
    return '';
  }

  try {
    return new URL(referrer).hostname;
  } catch {
    return '';
  }
}

/**
 * Record which representation was served. Nothing else in the stack can see
 * this: HTML and Markdown share the URL `/` and the choice is made here from
 * the Accept header.
 *
 * writeDataPoint is synchronous and queues the write in the background, so it
 * does not need ctx.waitUntil. Deliberately no IP address, no query string and
 * only the referrer hostname — this is a traffic census, not a visitor log.
 * `env` is absent under test, where this must no-op.
 */
function record(env, request, pathname, representation, status) {
  const dataset = env?.AI_TRAFFIC;

  if (!dataset || typeof dataset.writeDataPoint !== 'function') {
    return;
  }

  const userAgent = request.headers.get('User-Agent') ?? '';

  try {
    dataset.writeDataPoint({
      indexes: [classifyAgent(userAgent)],
      blobs: [
        representation,
        pathname,
        truncate(userAgent, 256),
        truncate(request.headers.get('Accept'), 256),
        referrerHost(request),
      ],
      doubles: [status],
    });
  } catch {
    // Telemetry must never be able to affect a response.
  }
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
  // `env` carries the AI_TRAFFIC Analytics Engine binding. Both it and `ctx`
  // are optional so the worker stays callable as fetch(request) under test.
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;
    const isReadRequest =
      request.method === 'GET' || request.method === 'HEAD';

    // An explicit .md or .txt URL overrides negotiation entirely; only attach
    // the discovery headers so clients can navigate back to the HTML.
    if (pathname === MARKDOWN_PATH || pathname === LLMS_PATH) {
      const response = await fetch(request);
      const isMarkdown = pathname === MARKDOWN_PATH;

      record(
        env,
        request,
        pathname,
        isMarkdown ? 'markdown' : 'llms',
        response.status,
      );

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
      record(env, request, pathname, '406', 406);
      return notAcceptable();
    }

    if (representation === 'markdown') {
      const markdownResponse = await fetch(new URL(MARKDOWN_PATH, url).href, {
        method: request.method,
        headers: request.headers,
        redirect: 'follow',
      });

      record(
        env,
        request,
        pathname,
        'markdown',
        markdownResponse.status,
      );

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

    record(env, request, pathname, 'html', response.status);

    return withHeaders(response, (headers) => {
      // Same guard as the Markdown paths: an origin 4xx/5xx body is not the
      // HTML page, so labelling it text/html would hide the failure.
      if (response.ok) {
        headers.set('Content-Type', HTML_TYPE);
      }
      headers.set('Link', LINKS_FROM_HTML);
      appendVary(headers, 'Accept');
    });
  },
};
