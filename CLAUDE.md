# wiki_claude_PE

> This file is the project-level authority for `wiki_claude_PE`. It covers only what is true of this project; where it conflicts with any other guidance, this file wins.

A static teaching wiki: **Claude for Private Equity**, written for [Team Name]. It teaches two tracks, the Claude.ai web app
(primary) and Claude Code (secondary). The API is out of scope.

**The audience is [Team Name] within [Function Name] at [Firm Name].** They may have varying levels of AI experience. The wiki was originally written for generic private equity professionals; it has been retargeted to this audience.

## Stack

| | |
|---|---|
| Framework | Astro 6 static output, MDX content collections |
| Search | Pagefind via `astro-pagefind` |
| Motion | GSAP |
| Images | `astro:assets` — diagrams are imported, never referenced by URL |
| Fonts | System font stack by default; brand fonts are applied locally by `npm run brand:apply` (see `REBRAND.md`) |
| Build | `npm run build` · `npm run dev` · `npm run preview` |
| Node | **>= 22.12**. Astro 6 refuses to build on Node 20. `.node-version` pins 22 for Cloudflare; the GitHub workflow pins `node-version: 22`. |

Dependencies are pinned on purpose: `astro-pagefind@2` supports Astro **≤ 6**. Do not upgrade to Astro 7 or
`@astrojs/mdx@7` — npm install fails on a peer-dep conflict.

## Hosting — the rule that breaks the most builds

The site will live at a host controlled by [Firm Name] (URL TBD), built and deployed by Cloudflare Pages (user, 2026-10-05) with
`SITE_BASE=/` set in the Cloudflare project. The GitHub workflow can still deploy a copy to the GitHub Pages project
subpath `/wiki_claude_PE/`, the default when `SITE_BASE` is unset (`astro.config.mjs`). Both must keep working, so the
base stays env-driven.

**Every internal link and asset must go through `src/utils/withBase.ts` or `import.meta.env.BASE_URL`.** A
root-absolute `href="/foo"`, `/favicon.svg`, or `/pagefind/...` 404s in production while working perfectly in
`dev`, and on the root-served Cloudflare domain, but 404s on the GitHub subpath copy. That asymmetry is why
this keeps recurring.

Prose links inside markdown are rewritten at build time by the rehype plugin in `src/plugins/`, so authors
write plain `[text](/foo)`. **JSX inside MDX is deliberately not rewritten** — those must call `withBase()`
themselves.

The site is **internal use only** (user, 2026-11-02, replacing the earlier "meant to be found" rule): every page is
`noindex, nofollow`, `robots.txt` disallows all crawlers, and there is no sitemap and no `llms.txt`. Do not add any
of them, or canonical or structured-data tags, without asking.

## Authoring content

- Content lives in `src/content/docs/`. A page that uses components **must** be `.mdx`, not `.md`.
- **Import depth is two different numbers.** `src/content/docs/<section>/*.mdx` reaches components with
  `../../../components/`; the one root-level doc (`welcome.mdx`) uses `../../components/`. Copying an import
  line between those two levels silently breaks the build.
- A `description:` in frontmatter containing a colon **must** be double-quoted, or Astro fails with "bad
  indentation of a mapping entry".
- Adding a page means adding it to `src/config/nav.ts`. The nav registry is the single source of truth for
  track names, section labels, and order — see `tasks/standards.md`.

### Locked content
`welcome.mdx` was rewritten on 2026-10-12 as part of the retarget. `first-15-minutes.mdx` was deleted
on 2026-10-12; do not restore it.

`Header.astro` — the site header — is locked. Note that on the homepage
"the header" almost always means the **hero H1 in `index.astro`**, not the nav. Disambiguate before editing.

### Canonical figures
The illustrative deal example is called **Project Titan**: US field-service software for HVAC/plumbing
contractors, revenue about **$60m**, growth mid-20s percent, gross margin **high 70s** percent, per-seat
subscriptions, NRR above 110 percent. All content aligns to these figures. The earlier placeholder name was
replaced on 2026-10-12; do not reintroduce it.

## House style — non-negotiable

- **Never use em dashes or en dashes.** Anywhere: content, UI text, code comments. Use commas, colons,
  parentheses, or two sentences.
- **US English and US dollars.** Never reintroduce £, UK geography, or British spellings (organise, summarise,
  behaviour, judgement, rigour, analyse, adviser, sceptical).
- **Never call the audience "deal teams" in generic guidance.** In audience-specific context, "deal team" or
  "[Team Name]" are correct. Write "[Team Name] professional" for individuals and "your team" in generic sections.
<!-- brand:keep-start -->
- **No real firm or client names anywhere** (content, mockups, templates, examples, code, comments, commits). Use
  [Firm Name] for the firm. The audience is "[Team Name] within [Function Name] at [Firm Name]". Placeholders stay
  literal in tracked files; real values are applied locally by `npm run brand:apply` (see `REBRAND.md`) and never
  committed. Fictional examples such as Project Titan are fine.
<!-- brand:keep-end -->
- **Education first, never salesy.** This is a guide, not an ad. No "fastest analyst on your deal team".
- **VS Code is required** (user, 2026-09-24): Before you Start lists it simply as "Required". Never imply a
  reader can use a different setup.
- **A page must teach the concept in its own title.** A page called "Thinking & Effort" that never explains
  what thinking is has failed, regardless of how good the prose is.

## Two palettes, and never mixing them

The wiki palette lives in one block in `src/styles/global.css`, between the `BRAND PALETTE START` and
`BRAND PALETTE END` markers. It is a PLACEHOLDER PALETTE (neutral greys plus one blue accent); the real palette is applied
locally by `npm run brand:apply`. Chrome tokens (`--chrome-*`) are for the header and footer only; accent tokens
(`--brand-*`, legacy names kept) are for links, borders, focus rings and fills. Headlines are in **sentence case**
(Title Case and ALL CAPS headlines are prohibited). Only linear gradients are approved and none are used; no radial
gradients, no glow, no floating pill nav. Never host proprietary font files in tracked files. The footer must keep the
INTERNAL USE ONLY notice and the copyright text from `src/config/brand.ts`. **Claude.ai mockups must look like the real
product** — warm cream (`#FAF9F5` / `#F0EEE6`), clay accent (`#BE5D3A`), neutral message bubbles.

**Never use a brand token (`--brand-*`, `--chrome-*`, `--font-display`) inside a Claude UI mockup.** The
audience reads an unfamiliar color as "I am on the wrong page" or "I did something wrong". The rule is stated
in `src/styles/global.css` above the mockup palette.

The light accent `--brand-cyan` is for dark surfaces only: never text, a border or an outline on a light background.
Text uses `--brand-ink` or `--ink`. Inside `.site-header` and `.site-footer` the accent is remapped for contrast.
Brand values, logo and fonts come from `src/config/brand.ts` and the palette block. Never redraw a logo, and get any
required brand review before publishing.

## Working agreement

- **I push, the user deploys.** Push code only. Never run `gh workflow run`, never touch `gh api ... /pages`,
  never change Pages settings. Reading run status for diagnosis (`gh run list/view/watch`) is fine.
- **"Add X to the handover" means edit the document, not do the work.** Confirm before dispatching roles,
  builds, or passes.

## Project files

`tasks/standards.md` is the enforceable checklist and the map of where each Seam lives. `tasks/context.md` is
dated incident history. `tasks/handover.md` is state between sessions. `tasks/plan.md` is the work queue.
**Those four are the whole set** — `tasks/agents.md` and `tasks/skills.md` were abolished on 2026-08-11 and
must not be created.
