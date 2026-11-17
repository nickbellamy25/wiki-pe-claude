# Handover — Claude for Private Equity ([Firm Name] [Function Name])   ·   2026-10-12

## Where to take over from
Next:        Pick one of the open items below. Likely next: verify header at 390px width in DevTools
             (plan.md #10, never checked), or confirm [Firm Name] host URL (plan.md #13).
In progress: Nothing in flight. De-branding (steps 1-7) complete and committed; build verified clean.
State:       `npm run build` passes clean on branch `wiki-updates` (38 pages, Pagefind indexed all 38).
             Working tree clean at commit `5d8c037`. Only warning is the known pre-existing
             `markdown.remarkPlugins` deprecation (plan.md #3), not a regression from de-branding.
             GitHub Pages deploy is manual (workflow_dispatch only).
Waiting on:  [Firm Name] host URL; [Firm Name]-approved favicon/icons and logo to replace public/ and Header.astro
             placeholders.

## Remaining open items (see tasks/plan.md for full list)
1. Confirm the real [Firm Name] host URL and set `site` in `astro.config.mjs` (unset now; the site is internal only, noindex).
2. Replace the favicons in `public/` (currently the [Firm Name] logo scaled onto white) with [Firm Name]-approved icons.
3. Replace the logo file (JPG) with the official SVG from the brand team.
4. Verify header at 390px phone width (DevTools device emulation) — never checked.
5. Decide whether to transfer the GitHub repo to a [Firm Name]-controlled org.

## What to avoid
- No firm or client name except [Firm Name]. Rules in `CLAUDE.md` and `tasks/standards.md`.
- Tab icons in `public/` are placeholder assets; replace with [Firm Name]-approved icons before launch.
- The hero stays white; only header and footer are navy.
- Prompt cards open at 10 lines by user decision; no per-card opt-in.
- `Header.astro` is locked; changes only on user request.
- Deploy is manual (workflow_dispatch); never push to trigger a deploy.

## What we did (original build, 2026-10-05)
Built as a general private equity wiki: Claude UI mockups, Pagefind search, Cloudflare Pages hosting.

## What we changed ([Firm Name] retarget, 2026-10-12)
Retargeted to [Team Name]: audience language, role labels, example
renamed Project Titan, nav restructured, earlier branding removed throughout, deploy gated to
manual trigger. [Firm Name] logo slot and host URL are TODO placeholders pending [Firm Name] IT confirmation.
