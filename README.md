# My portfolio

Code for my portfolio site.

**Link to project:** https://andrewy.me

![alt tag](https://github.com/Andrewyithub/portfolio-v4/assets/17731837/20ad395f-82e6-462b-ab8d-7830748d99e0)

## How It's Made:

**Frontend:** TypeScript, Astro

Statically rendered with no framework runtime — the only JavaScript shipped is
a small script for the theme toggle, the menu, and the typewriter. Icons are
inlined at build time by [astro-icon](https://github.com/natemoo-re/astro-icon).

## How to Run:

1. Clone the repository

2. In the project root directory, install dependencies and start the dev server:

   ```
   npm install
   npm run dev
   ```

3. Navigate to your browser and go to url: `http://localhost:4321`

## Scripts

| Command           | Does                                                 |
| ----------------- | ---------------------------------------------------- |
| `npm run dev`     | Dev server on port 4321                              |
| `npm run build`   | Type-check with `astro check`, then build to `dist/` |
| `npm run preview` | Serve the built site locally                         |
| `npm test`        | Run the Cloudflare Worker negotiation tests          |

## Content and AI visibility

`/index.md`, `/llms.txt` and `/sitemap.xml` are generated at build time from
`src/data/` by page endpoints, so they cannot drift from what the page renders.
Editing a project in `src/data/projects.ts` updates every surface at once.

`cloudflare/markdown-negotiation.js` is a Cloudflare Worker that serves Markdown
to clients sending `Accept: text/markdown` and HTML to everyone else, and
advertises each representation from the others via `Link` headers. It deploys
separately from the site:

```
npx wrangler deploy
npm test              # 34 negotiation cases, no network required
```
