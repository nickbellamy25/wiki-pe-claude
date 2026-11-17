# Rebranding

Tracked files hold placeholders only. Real brand values live in a local, git-ignored config and are applied to the working tree by `npm run brand:apply`. The applied state is for local review and builds. **Never commit it.**

## Placeholders

| Placeholder | Meaning | Example of how it reads |
|---|---|---|
| `[Firm Name]` | The firm's short name. | "sign in with your [Firm Name] account" |
| `[Team Name]` | The audience as a whole, including the function and firm, written so it works before "professional" or on its own. | "You are assisting a [Team Name] professional." |
| `[Function Name]` | The business function the team sits in. | "[Team Name] within [Function Name] at [Firm Name]" |
| `[Copyright Holder]` | The legal entity named in the copyright line and ownership sentence of `LICENSE`. It can differ from `[Firm Name]` (for example a full legal name with a company suffix). **The wording needs a decision from legal/compliance when re-branding.** Do not guess it, and do not edit `LICENSE` without sign-off. | "Copyright (c) 2026 [Copyright Holder]. All rights reserved." |
| `[Logo]` | Plain text in the header when no logo file is configured. Not replaced in text; `src/config/brand.ts` decides. | |

Also placeholders, set by the config rather than by text replacement: the palette block and the font block in `src/styles/global.css`, the logo, favicons and social image, and the footer copyright text.

## Where each placeholder appears

Raw counts per file, generated from the tree when this file was written. Lines carrying `brand:keep`, or sitting between `brand:keep-start` and `brand:keep-end` (HTML comments), document the placeholders themselves and are skipped by the script.

| File | [Firm Name] | [Team Name] | [Function Name] | [Copyright Holder] |
|---|---:|---:|---:|---:|
| `CLAUDE.md` | 4 | 5 | 2 |  |
| `LICENSE` | 2 |  |  | 2 |
| `README.md` | 2 | 3 | 1 |  |
| `src/components/claude-ui/ClaudeSidebar.astro` | 2 |  |  |  |
| `src/content/docs/best-practices/cheat-sheet.mdx` |  | 1 |  |  |
| `src/content/docs/claude-code/cheat-sheet.mdx` |  | 1 |  |  |
| `src/content/docs/claude-code/claude-md.mdx` | 1 |  |  |  |
| `src/content/docs/claude-code/deploy.mdx` | 2 |  |  |  |
| `src/content/docs/claude-code/git-basics.mdx` | 1 |  |  |  |
| `src/content/docs/claude-code/glossary.mdx` | 1 | 1 |  |  |
| `src/content/docs/claude-code/install-vs-code.mdx` | 5 |  |  |  |
| `src/content/docs/claude-code/requirements-brief.mdx` | 2 |  |  |  |
| `src/content/docs/claude-code/skills.mdx` | 3 |  |  |  |
| `src/content/docs/claude-code/welcome.mdx` |  | 1 |  |  |
| `src/content/docs/context/instructions-for-claude.mdx` | 3 | 1 |  |  |
| `src/content/docs/context/why-context.mdx` | 1 | 2 |  |  |
| `src/content/docs/foundations/anatomy-of-a-prompt.mdx` |  | 1 |  |  |
| `src/content/docs/power-features/analysis-tool.mdx` |  | 1 |  |  |
| `src/content/docs/power-features/artifacts.mdx` | 1 | 1 |  |  |
| `src/content/docs/power-features/connectors.mdx` | 2 |  |  |  |
| `src/content/docs/power-features/web-search.mdx` |  | 1 |  |  |
| `src/content/docs/projects/deal-setup.mdx` | 3 | 2 |  |  |
| `src/content/docs/projects/reusable-setup.mdx` | 3 |  |  |  |
| `src/content/docs/projects/templates.mdx` |  | 4 |  |  |
| `src/content/docs/projects/what-projects-are.mdx` |  | 1 |  |  |
| `src/content/docs/resources/from-prompt-to-template.mdx` | 11 |  | 6 |  |
| `src/content/docs/welcome.mdx` |  | 1 |  |  |
| **Total** | **49** | **27** | **9** | **2** |

Generated, not text-replaced: `src/config/brand.ts` (read by Header, Footer, BaseLayout and `src/pages/llms.txt.ts`), the `BRAND PALETTE` and `BRAND FONTS` blocks in `src/styles/global.css`, and `public/brand/` and `public/fonts/`.

## Config format

Default location: `_changes/brand.config.json` (git-ignored). Assets are read from a `brand-assets/` folder next to the config, or from `--assets <dir>`. `brand.config.example.json` is a complete example with placeholder values. `brand.config.json` and `brand-assets/` are git-ignored anywhere in the repo.

```jsonc
{
  "firmName": "…",              // required
  "teamName": "…",              // required
  "functionName": "…",          // required
  "copyrightHolder": "…",       // legal entity for LICENSE; falls back to firmName with a warning. Confirm with legal/compliance
  "copyrightNotice": "…",       // text after the © and year in the footer
  "governanceLink": { "text": "…", "href": "https://…" },   // optional link after the notice, or null
  "logo": {
    "light": "logo/logo-light.svg",   // path inside brand-assets/; empty renders "[Logo]"
    "dark": "logo/logo-dark.svg",     // reserved for dark surfaces; the header is light today
    "alt": "…", "width": 70, "height": 28
  },
  "favicons": [{ "rel": "icon", "sizes": "32x32", "file": "favicons/favicon-32x32.png" }],
  "socialImage": "social/share.png",  // optional; adds og:image
  "themeColor": "#rrggbb",            // optional; defaults to palette.light["--chrome-bg"]
  "fonts": {
    "sans": "…", "display": "…", "mono": "…",
    "fallbackStack": "system-ui, …", "monoFallbackStack": "ui-monospace, …",
    "vars": { "--font-sans": "…" },   // optional: overrides the stacks the script would build
    "faces": [{ "family": "…", "file": "fonts/….woff2", "weight": 400, "style": "normal" }]
  },
  "palette": {
    "light": { "--brand-ink": "#rrggbb", "--chrome-bg": "#rrggbb" },   // every colour token under :root
    "headerOverrides": { "--chrome-bg": "#ffffff" },                  // .site-header
    "footerOverrides": { "--brand-purple": "var(--brand-cyan)" }       // .site-footer
  }
}
```

Notes:

- The site has no dark theme. "Dark" surfaces (footer, code blocks) use the `--chrome-*` tokens inside `palette.light`; the header remaps them through `headerOverrides`. `palette.dark` is ignored with a warning.
- Palette values may be hex, rgba() or `var(--other)`. Variables missing from the config keep their current value and are reported.
- Font and image files are copied to `public/fonts/` and `public/brand/` by file name. Two files with the same name clash and stop the run.
- Values may not contain `<`, `>`, `{`, `}` or a backtick (they would break MDX).

## Steps

1. Add the config and assets: `_changes/brand.config.json` and `_changes/brand-assets/{logo,favicons,social,fonts}/`. Start from `brand.config.example.json`.
2. Preview: `npm run brand:apply -- --dry-run`. Nothing is written. Read the placeholder counts, the contrast table and the "Needs review" list.
3. Apply: `npm run brand:apply`. Running it again changes nothing.
4. Build: `npm run build` (and `npm run dev` to look at it).
5. Review: the header logo, footer text, headings, links, callouts, code blocks and the pages listed above. Open each page type at desktop and phone width. Check the "Needs review" items, especially "a" and "an" before a placeholder and possessives.
6. Contrast check: the script prints WCAG ratios for the main pairs (hex values only). Confirm body text, links and filled controls reach 4.5:1 and UI borders and focus rings 3:1, and check any rgba() values by hand.
7. Return to placeholders before committing: `git checkout .` and `git clean -fd` (not `-x`, so ignored files stay). Confirm `git status` is clean.

Applying to `LICENSE` is local only, like every other file. Never commit a branded `LICENSE`.

Limitations: diagram images in `src/assets/diagrams/` are raster files and are not recolored by the script. Text in `tasks/` and `diagrams_*/` is not scanned. Lines marked `brand:keep` keep their placeholders.

## Checklist to confirm with the brand team

- [ ] Logo: approved file formats, light and dark versions, minimum size, clear space, permitted backgrounds, and whether a recolored or reversed version is allowed.
- [ ] Favicons and social image: approved files, or permission to use a simplified mark.
- [ ] Fonts: is the typeface licensed for web embedding and self-hosting? Which weights? Is a web font file available, or must the system fallback be used?
- [ ] Palette: approved primary, accent and neutral colors; approved text and background pairs; accessible alternatives where a brand color fails AA.
- [ ] Naming: the approved short firm name, team name and function name, and how each is written in possessives and after "a" or "an".
- [ ] Copyright holder: the exact legal entity and wording for `LICENSE` (legal/compliance decision), and whether the footer notice and a governance link are required.
- [ ] Headline style, gradient and effects rules.
- [ ] Approvals: any brand or web review before publishing, who signs off, and the host the site will live on.
