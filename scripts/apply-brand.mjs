#!/usr/bin/env node
// Applies a local brand config to the working tree. Node only, no dependencies.
//
//   node scripts/apply-brand.mjs [config] [--assets <dir>] [--dry-run]
//
// The config defaults to _changes/brand.config.json; assets default to a brand-assets/ folder
// next to the config. The script:
//   1. replaces the [Firm Name], [Team Name] and [Function Name] placeholders in src/, README.md, CLAUDE.md and LICENSE
//      (possessives and a/an are handled; ambiguous cases are reported for review),
//   2. writes src/config/brand.ts,
//   3. rewrites the palette block and the font block in src/styles/global.css,
//   4. copies logo, favicon, social image and font files into public/.
// Re-running with the same config changes nothing. The applied state is for local review only: never commit it.
// See REBRAND.md for the config format.

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const flagValue = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? null : args[i + 1];
};
const assetsFlag = flagValue('--assets');
const positional = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--assets');
const configPath = path.resolve(ROOT, positional[0] ?? '_changes/brand.config.json');
const assetsDir = path.resolve(assetsFlag ?? path.join(path.dirname(configPath), 'brand-assets'));

const notes = []; // things the script could not fully decide, shown at the end
const note = (msg) => notes.push(msg);
const grouped = new Map(); // review notes that repeat across many lines: message -> locations
const noteAt = (msg, where) => grouped.set(msg, [...(grouped.get(msg) ?? []), where]);
const fail = (msg) => {
  console.error(`apply-brand: ${msg}`);
  process.exit(1);
};

if (!fs.existsSync(configPath)) fail(`config not found: ${path.relative(ROOT, configPath)}. See REBRAND.md.`);
let config;
try {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (e) {
  fail(`config is not valid JSON: ${e.message}`);
}

// ---------- Placeholders ----------

const PLACEHOLDERS = [
  { token: '[Firm Name]', key: 'firmName' },
  { token: '[Team Name]', key: 'teamName' },
  { token: '[Function Name]', key: 'functionName' },
  { token: '[Copyright Holder]', key: 'copyrightHolder' },
];
if (!config.copyrightHolder) {
  config.copyrightHolder = config.firmName;
  note('config.copyrightHolder is not set; [Copyright Holder] falls back to firmName. Confirm the legal wording with legal/compliance');
}
for (const p of PLACEHOLDERS) {
  const v = config[p.key];
  if (typeof v !== 'string' || !v.trim()) fail(`config.${p.key} is required and must be a non-empty string`);
  if (/[<>{}`]/.test(v)) fail(`config.${p.key} contains a character that would break MDX or TSX (< > { } or a backtick)`);
  if (/['"\\]/.test(v)) note(`config.${p.key} contains a quote or backslash: check string literals such as the claude-ui workspace default`);
}

const VOWEL_LETTER_NAMES = 'AEFHILMNORSX'; // letters whose spoken name starts with a vowel sound (an F, an H, a K)

// Returns { article, sure } for the value that follows an article.
function articleFor(value) {
  const first = value.trim().split(/\s+/)[0];
  const c = first[0];
  if (/\d/.test(c)) return { article: 'a', sure: false };
  if (first.length >= 2 && first === first.toUpperCase() && /^[A-Z]+$/.test(first)) {
    // Initialism (spoken as letters) or an all-caps word? Both are plausible, so ask for review.
    return { article: VOWEL_LETTER_NAMES.includes(c) ? 'an' : 'a', sure: false };
  }
  const lower = first.toLowerCase();
  if (/^(hour|honest|honor|heir)/.test(lower)) return { article: 'an', sure: true };
  if (/^(uni|use|usu|eu|one|once|ubiq)/.test(lower)) return { article: 'a', sure: true };
  if (/^[aeiou]/.test(lower)) return { article: 'an', sure: !/^[uo]/.test(lower) };
  if (/^h/.test(lower)) return { article: 'a', sure: false };
  return { article: 'a', sure: true };
}

function possessive(value) {
  return /s$/i.test(value) ? { text: `${value}'`, sure: false } : { text: `${value}'s`, sure: true };
}

const stats = Object.fromEntries(PLACEHOLDERS.map((p) => [p.token, { count: 0, files: new Set() }]));
const fileChanges = []; // { file, replacements }

function replacePlaceholders(file, text) {
  let replacements = 0;
  const lines = text.split('\n');
  let keeping = false;
  const out = lines.map((line, idx) => {
    // Text that documents the placeholders themselves is left alone: a line containing brand:keep,
    // or everything between brand:keep-start and brand:keep-end.
    if (line.includes('brand:keep-start')) keeping = true;
    const skip = keeping || line.includes('brand:keep');
    if (line.includes('brand:keep-end')) keeping = false;
    if (skip) return line;
    let l = line;
    const where = `${file}:${idx + 1}`;
    for (const { token, key } of PLACEHOLDERS) {
      if (!l.includes(token)) continue;
      const value = config[key];
      const esc = token.replace(/[[\]]/g, '\\$&');
      // a / an directly before the placeholder
      l = l.replace(new RegExp(`\\b([Aa])(n?)(\\s+)${esc}`, 'g'), (m, a, n, sp) => {
        const { article, sure } = articleFor(value);
        if (!sure) noteAt(`article before "${token}" set to "${article}" for "${value}" (a guess: confirm the pronunciation)`, where);
        const word = a === 'A' ? article[0].toUpperCase() + article.slice(1) : article;
        return `${word}${sp}${token}`;
      });
      // possessives: [Firm Name]'s or [Firm Name]’s
      l = l.replace(new RegExp(`${esc}(['\\u2019])s\\b`, 'g'), (m, q) => {
        const p = possessive(value);
        if (!p.sure) noteAt(`possessive of "${value}" written as "${p.text}" (confirm the style)`, where);
        stats[token].count++;
        stats[token].files.add(file);
        replacements++;
        return p.text.replace("'", q);
      });
      // plural or stray suffix we cannot decide: [Firm Name]s
      if (new RegExp(`${esc}s\\b`).test(l)) note(`${where}: "${token}s" looks like a plural; left as "${value}s", confirm`);
      // everything else
      const parts = l.split(token);
      const n = parts.length - 1;
      if (n > 0) {
        stats[token].count += n;
        stats[token].files.add(file);
        replacements += n;
        l = parts.join(value);
      }
    }
    return l;
  });
  return { text: out.join('\n'), replacements };
}

function listFiles(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) listFiles(full, acc);
    else if (/\.(astro|mdx?|ts|tsx|css|json|txt)$/.test(e.name)) acc.push(full);
  }
  return acc;
}

const GENERATED = new Set([path.join('src', 'config', 'brand.ts')]);
const targets = [...listFiles(path.join(ROOT, 'src')), path.join(ROOT, 'README.md'), path.join(ROOT, 'CLAUDE.md'), path.join(ROOT, 'LICENSE')].filter(fs.existsSync);

const pending = []; // [absolute path, new content]
for (const abs of targets) {
  const rel = path.relative(ROOT, abs);
  if (GENERATED.has(rel)) continue;
  const raw = fs.readFileSync(abs, 'utf8');
  const crlf = raw.includes('\r\n');
  const { text, replacements } = replacePlaceholders(rel.split(path.sep).join('/'), raw.split('\r\n').join('\n'));
  if (replacements > 0) {
    pending.push([abs, crlf ? text.split('\n').join('\r\n') : text]);
    fileChanges.push({ file: rel, replacements });
  }
}

// ---------- Assets ----------

const copies = []; // { from, to (relative to public/) }
const publicPaths = {}; // config path -> path relative to the site root
function registerAsset(configRel, kind) {
  if (!configRel) return '';
  const from = path.join(assetsDir, configRel);
  const to = kind === 'font' ? `fonts/${path.basename(configRel)}` : `brand/${path.basename(configRel)}`;
  if (!fs.existsSync(from)) {
    note(`asset missing, skipped: ${path.relative(ROOT, from)}`);
    return '';
  }
  const clash = copies.find((c) => c.to === to && c.from !== from);
  if (clash) fail(`two assets would both be copied to public/${to}; rename one of them`);
  if (!copies.some((c) => c.to === to)) copies.push({ from, to });
  publicPaths[configRel] = to;
  return to;
}

const logoCfg = config.logo ?? {};
const logo = {
  light: registerAsset(logoCfg.light, 'logo'),
  dark: registerAsset(logoCfg.dark, 'logo'),
  alt: logoCfg.alt ?? config.firmName,
  width: Number(logoCfg.width ?? 70),
  height: Number(logoCfg.height ?? 28),
};
const favicons = (config.favicons ?? [])
  .map((f) => ({ rel: f.rel, sizes: f.sizes, href: registerAsset(f.file, 'favicon') }))
  .filter((f) => f.href);
const socialImage = registerAsset(config.socialImage, 'social');

// ---------- src/config/brand.ts ----------

const ts = (v, indent = 0) => {
  const pad = '  '.repeat(indent + 1);
  if (v === null) return 'null';
  if (typeof v === 'string') return `'${v.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
  if (typeof v !== 'object') return String(v);
  if (Array.isArray(v)) {
    if (!v.length) return '[]';
    return `[\n${v.map((x) => pad + ts(x, indent + 1)).join(',\n')},\n${'  '.repeat(indent)}]`;
  }
  return `{ ${Object.entries(v).map(([k, x]) => `${k}: ${ts(x, indent + 1)}`).join(', ')} }`;
};

const palette = config.palette ?? {};
const hex = (v) => (typeof v === 'string' && /^#[0-9a-f]{3,8}$/i.test(v.trim()) ? v.trim() : null);
const themeColor = config.themeColor ?? hex(palette.light?.['--chrome-bg']) ?? '#1f2933';

const brandTs = `// Brand values read by Header, Footer, BaseLayout and llms.txt.ts.
// Tracked files hold placeholders only. scripts/apply-brand.mjs overwrites this file
// from a local config (see REBRAND.md); never commit the result.

export interface BrandConfig {
  firmName: string;
  teamName: string;
  functionName: string;
  /** Logo paths relative to the site root (files live in public/). An empty path renders "[Logo]". */
  logo: { light: string; dark: string; alt: string; width: number; height: number };
  /** Favicon links; hrefs are relative to the site root. Empty by default. */
  favicons: { rel: string; sizes: string; href: string }[];
  /** Social share image path relative to the site root; empty means no og:image tag. */
  socialImage: string;
  /** Browser UI color. A meta tag cannot read a CSS variable, so keep it in step with --chrome-bg. */
  themeColor: string;
  copyrightNotice: string;
  copyrightLink: { text: string; href: string } | null;
}

export const brand: BrandConfig = {
  firmName: ${ts(config.firmName)},
  teamName: ${ts(config.teamName)},
  functionName: ${ts(config.functionName)},
  logo: ${ts(logo)},
  favicons: ${ts(favicons, 1)},
  socialImage: ${ts(socialImage)},
  themeColor: ${ts(themeColor)},
  copyrightNotice: ${ts(config.copyrightNotice ?? `${config.firmName}. All rights reserved.`)},
  copyrightLink: ${config.governanceLink ? ts({ text: config.governanceLink.text, href: config.governanceLink.href }) : 'null'},
};
`;

// ---------- global.css: palette and font blocks ----------

const cssPath = path.join(ROOT, 'src', 'styles', 'global.css');
const cssRaw = fs.readFileSync(cssPath, 'utf8');
const cssCrlf = cssRaw.includes('\r\n');
let css = cssRaw.split('\r\n').join('\n');

function blockRange(name) {
  const startRe = new RegExp(`/\\* ${name} START[^\\n]*\\*/\\n`);
  const endMarker = `/* ${name} END */`;
  const m = startRe.exec(css);
  const end = css.indexOf(endMarker);
  if (!m || end === -1) fail(`src/styles/global.css is missing the ${name} START/END markers`);
  return { start: m.index, startText: m[0], bodyStart: m.index + m[0].length, end, endText: endMarker };
}

const SELECTORS = { light: ':root', footerOverrides: '.site-footer', headerOverrides: '.site-header' };

function parseBlock(body) {
  const out = {};
  for (const m of body.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^}]*)\}/g)) {
    const sel = m[1].trim();
    out[sel] = Object.fromEntries([...m[2].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((d) => [d[1], d[2].trim()]));
  }
  return out;
}

function paletteBlock() {
  const r = blockRange('BRAND PALETTE');
  const existing = parseBlock(css.slice(r.bodyStart, r.end));
  for (const [section, sel] of Object.entries(SELECTORS)) {
    const vals = palette[section] ?? {};
    for (const [k, v] of Object.entries(vals)) {
      if (!/^--[\w-]+$/.test(k)) fail(`palette.${section}: "${k}" is not a CSS variable name`);
      if (/[;{}]/.test(String(v))) fail(`palette.${section}.${k}: value contains ; { or }`);
    }
    // carry over variables the config does not mention, so nothing is left undefined
    for (const [k, v] of Object.entries(existing[sel] ?? {})) {
      if (!(k in vals)) {
        note(`palette.${section} has no ${k}; kept the current value`);
        vals[k] = v;
      }
    }
    palette[section] = vals;
  }
  if (palette.dark && Object.keys(palette.dark).length) note('palette.dark is ignored: the site has no dark theme (dark surfaces use the --chrome-* tokens in palette.light)');
  const decl = (obj) => Object.entries(obj).map(([k, v]) => `  ${k}: ${v};`).join('\n');
  const body = `/* Palette from the local brand config. Applied by scripts/apply-brand.mjs; never commit. */
:root {
${decl(palette.light)}
}

/* On dark chrome the accent fill can fail the 3:1 UI contrast rule, so
   borders, focus rings and fills inside the footer use the light accent. */
.site-footer {
${decl(palette.footerOverrides)}
}

/* The header is light: dark-chrome tokens are remapped to dark-on-light inside it. */
.site-header {
${decl(palette.headerOverrides)}
}
`;
  return { r, text: `${r.startText}${body}${r.endText}` };
}

const FORMATS = { '.woff2': 'woff2', '.woff': 'woff', '.ttf': 'truetype', '.otf': 'opentype' };

function fontsBlock() {
  const r = blockRange('BRAND FONTS');
  const f = config.fonts ?? {};
  const q = (n) => `'${n}'`;
  const sans = f.sans ?? null;
  const stack = f.fallbackStack ?? 'system-ui, -apple-system, \'Segoe UI\', Arial, sans-serif';
  const monoStack = f.monoFallbackStack ?? "ui-monospace, 'SF Mono', Menlo, Consolas, monospace";
  const vars = {
    '--font-sans': f.vars?.['--font-sans'] ?? (sans ? `${q(sans)}, ${stack}` : stack),
    '--font-display': f.vars?.['--font-display'] ?? (f.display ? `${q(f.display)}, ${sans ? q(sans) + ', ' : ''}${stack}` : sans ? `${q(sans)}, ${stack}` : stack),
    '--font-mono': f.vars?.['--font-mono'] ?? (f.mono ? `${q(f.mono)}, ${monoStack}` : monoStack),
  };
  const faces = (f.faces ?? [])
    .map((face) => {
      const to = registerAsset(face.file, 'font');
      if (!to) return '';
      const fmt = FORMATS[path.extname(to).toLowerCase()];
      if (!fmt) note(`font ${face.file}: unknown extension, no format() hint written`);
      return `@font-face {
  font-family: '${face.family}';
  font-style: ${face.style ?? 'normal'};
  font-weight: ${face.weight ?? 400};
  font-display: swap;
  src: url('/${to}')${fmt ? ` format('${fmt}')` : ''};
}
`;
    })
    .filter(Boolean)
    .join('\n');
  const body = `/* Fonts from the local brand config. Applied by scripts/apply-brand.mjs; never commit. */
${faces}${faces ? '\n' : ''}:root {
  --font-sans: ${vars['--font-sans']};
  --font-display: ${vars['--font-display']}; /* H1 and H2 only */
  --font-mono: ${vars['--font-mono']};
}
`;
  return { r, text: `${r.startText}${body}${r.endText}` };
}

// Replace the later block first so earlier offsets stay valid.
const blocks = [paletteBlock(), fontsBlock()].sort((a, b) => b.r.start - a.r.start);
for (const b of blocks) css = css.slice(0, b.r.start) + b.text + css.slice(b.r.end + b.r.endText.length);

// ---------- Contrast check (WCAG AA) ----------

function lum(h) {
  let s = h.replace('#', '');
  if (s.length === 3) s = [...s].map((c) => c + c).join('');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
const L = palette.light ?? {};
const H = palette.headerOverrides ?? {};
const resolve = (v, scope) => {
  const m = /^var\((--[\w-]+)\)$/.exec(String(v ?? ''));
  return hex(m ? (scope[m[1]] ?? L[m[1]]) : v);
};
const CONTRAST = [
  ['--ink on --bg', L['--ink'], L['--bg'], 4.5],
  ['--ink-muted on --bg', L['--ink-muted'], L['--bg'], 4.5],
  ['--ink-subtle on --bg', L['--ink-subtle'], L['--bg'], 4.5],
  ['--brand-ink on --bg', L['--brand-ink'], L['--bg'], 4.5],
  ['--brand-ink-strong on --bg', L['--brand-ink-strong'], L['--bg'], 4.5],
  ['--brand-cyan-ink on --bg', L['--brand-cyan-ink'], L['--bg'], 4.5],
  ['--bg on --brand-ink (filled controls)', L['--bg'], L['--brand-ink'], 4.5],
  ['--ink on --bg-soft', L['--ink'], L['--bg-soft'], 4.5],
  ['--on-dark on --chrome-bg (footer)', L['--on-dark'], L['--chrome-bg'], 4.5],
  ['--brand-on-dark on --chrome-bg', L['--brand-on-dark'], L['--chrome-bg'], 4.5],
  ['--brand-cyan on --chrome-bg (UI, 3:1)', L['--brand-cyan'], L['--chrome-bg'], 3],
  ['header --on-dark on header --chrome-bg', H['--on-dark'], H['--chrome-bg'], 4.5],
  ['header --on-dark-muted on header --chrome-bg', H['--on-dark-muted'], H['--chrome-bg'], 4.5],
  ['--tip on --tip-bg', resolve(L['--tip'], L), L['--tip-bg'], 4.5],
  ['--note on --note-bg', resolve(L['--note'], L), L['--note-bg'], 4.5],
  ['--warning on --warning-bg', L['--warning'], L['--warning-bg'], 4.5],
  ['--confidential on --confidential-bg', L['--confidential'], L['--confidential-bg'], 4.5],
];
const contrast = [];
for (const [label, fg, bg, min] of CONTRAST) {
  const a = resolve(fg, L);
  const b = resolve(bg, L);
  if (!a || !b) continue; // rgba or other non-hex values are not checked
  const r = ratio(a, b);
  contrast.push({ label, r, min, ok: r >= min });
}

// ---------- Write or report ----------

const write = (abs, content) => {
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content);
};
const brandTsPath = path.join(ROOT, 'src', 'config', 'brand.ts');
const finalCss = cssCrlf ? css.split('\n').join('\r\n') : css;
const sameFile = (abs, content) => fs.existsSync(abs) && fs.readFileSync(abs, 'utf8').split('\r\n').join('\n') === content.split('\r\n').join('\n');

const changed = { brand: !sameFile(brandTsPath, brandTs), css: !sameFile(cssPath, finalCss) };
const assetChanges = copies.filter((c) => {
  const dest = path.join(ROOT, 'public', c.to);
  return !fs.existsSync(dest) || !fs.readFileSync(dest).equals(fs.readFileSync(c.from));
});

if (!dryRun) {
  for (const [abs, content] of pending) write(abs, content);
  if (changed.brand) write(brandTsPath, brandTs);
  if (changed.css) write(cssPath, finalCss);
  for (const c of assetChanges) {
    const dest = path.join(ROOT, 'public', c.to);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(c.from, dest);
  }
}

const verb = dryRun ? 'would change' : 'changed';
console.log(`apply-brand${dryRun ? ' (dry run, nothing written)' : ''}`);
console.log(`  config: ${path.relative(ROOT, configPath)}`);
console.log(`  assets: ${path.relative(ROOT, assetsDir)}\n`);
console.log('Placeholders');
for (const { token } of PLACEHOLDERS) {
  const s = stats[token];
  console.log(`  ${token.padEnd(18)} ${s.count} replacement(s) in ${s.files.size} file(s)${s.count === 0 ? '   UNMATCHED (none found; already applied, or not used)' : ''}`);
}
if (fileChanges.length) {
  console.log(`\nFiles ${verb}`);
  for (const f of fileChanges) console.log(`  ${f.file} (${f.replacements})`);
}
console.log(`\nGenerated`);
console.log(`  src/config/brand.ts            ${changed.brand ? verb : 'unchanged'}`);
console.log(`  src/styles/global.css blocks   ${changed.css ? verb : 'unchanged'} (palette: ${Object.keys(palette.light ?? {}).length} variables, fonts: ${(config.fonts?.faces ?? []).length} faces)`);
console.log(`  public/ assets                 ${assetChanges.length} to copy, ${copies.length - assetChanges.length} already current`);
for (const c of assetChanges) console.log(`    ${path.relative(ROOT, c.from)} -> public/${c.to}`);
if (contrast.length) {
  console.log('\nContrast (WCAG AA)');
  for (const c of contrast) console.log(`  ${c.ok ? 'ok  ' : 'FAIL'} ${c.r.toFixed(2)}:1 (min ${c.min}) ${c.label}`);
}
for (const [msg, where] of grouped) notes.push(`${msg}: ${where.length} place(s), e.g. ${where.slice(0, 3).join(', ')}`);
if (notes.length) {
  console.log('\nNeeds review');
  for (const n of [...new Set(notes)]) console.log(`  - ${n}`);
}
const unmatched = PLACEHOLDERS.filter((p) => stats[p.token].count === 0).length;
console.log(`\nSummary: ${pending.length} text file(s), ${Number(changed.brand) + Number(changed.css)} generated file(s), ${assetChanges.length} asset(s) ${verb.replace('would change', 'to change')}; ${unmatched} unmatched placeholder(s); ${notes.length} review note(s); ${contrast.filter((c) => !c.ok).length} contrast failure(s).`);
