# Claude for Private Equity

INTERNAL USE ONLY. Built by Nick Bellamy for [Team Name].

## Overview

A self-paced teaching wiki for [Team Name] professionals. It has two tracks:

- **claude.ai** (primary): the Claude.ai web app on Enterprise and Team accounts. Context, prompting, Projects, power features and best practices.
- **Claude Code** (secondary): Claude working in your own files, from first session to going live.

It assumes no prior AI experience. The API is out of scope. The site is static, searchable and for internal use only: pages are `noindex` and `robots.txt` disallows all crawlers.

## Technology

| Layer | Choice |
|-------|--------|
| Framework | Astro 6, static output |
| Content | Markdown and MDX via the Astro content layer |
| Search | Pagefind (`astro-pagefind`), indexed at build time |
| Motion | GSAP 3 |
| Typography | System font stack; brand fonts are applied locally (see Branding) |
| Hosting | Cloudflare Pages (host TBD); optional GitHub Pages copy |

Astro 6 and `@astrojs/mdx` 6 are pinned deliberately. `astro-pagefind` 2 supports Astro 6 or lower. Node 22.12 or newer is required.

## Getting started

```bash
npm install
npm run dev      # http://localhost:4321/wiki_claude_PE/
```

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server with hot reload (search is unavailable in dev) |
| `npm run build` | Build to `dist/` and generate the search index |
| `npm run preview` | Serve the built site locally, the way to test search |

## Project structure

```
src/
  assets/            Diagram images
  components/        UI components (Header, Footer, Sidebar, Callout, PromptCard, ...)
  config/nav.ts      Single source of truth for navigation and page order
  content/docs/      MDX content pages (the wiki itself)
  layouts/           BaseLayout, DocLayout, DeliverableLayout
  pages/             index, doc router, 404, robots.txt
  styles/global.css  Design tokens and global styles
public/              Static files (brand assets are applied locally)
tasks/               Project notes (standards, plan, handover, context)
```

## Authoring content

1. Register the page in `src/config/nav.ts`; the `slug` matches the file path under `src/content/docs/`.
2. Create the `.mdx` file. Frontmatter: `title`, `description`, `section`, `order`, optional `draft`.

Use `.mdx` for any page that uses components. Import depth differs: `../../../components/` from `src/content/docs/<section>/`, `../../components/` from the root-level `welcome.mdx`. Every internal link in JSX must go through `withBase()`.

## Branding

Tracked files hold placeholders only: [Firm Name], [Team Name], [Function Name], a placeholder palette and system fonts. Real values stay in a local, git-ignored config. Run `npm run brand:apply -- --dry-run` to preview and `npm run brand:apply` to apply. See `REBRAND.md`. Never commit the branded state. <!-- brand:keep -->

## Standards

See `CLAUDE.md` and `tasks/standards.md`. In short:

- No em dashes or en dashes anywhere. US English and US dollars.
- Headlines in sentence case. The palette in `global.css` is a placeholder until real brand values are applied. Claude.ai mockups keep the real product's palette.
- The footer carries the INTERNAL USE ONLY notice and the copyright text from `src/config/brand.ts`.
- The logo comes only from official files. Never redraw it.

## Deployment

The base path is env-driven. It defaults to `/wiki_claude_PE/` (GitHub Pages project subpath); set `SITE_BASE=/` for a root-served host:

```bash
SITE_BASE=/ npm run build
```

The GitHub Actions workflow in `.github/workflows/deploy.yml` runs only when triggered manually (`workflow_dispatch`). Nothing deploys on push.

## License

Copyright [Firm Name] LLP. All rights reserved. Internal use only. See `LICENSE`.
