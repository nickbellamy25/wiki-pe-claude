// Single source of truth for navigation order.
//
// The wiki ships two self-contained tracks: claude.ai and Claude Code.
// Each track owns its own sidebar, prev/next, and
// numbering; a reader in one track never sees the other track's sections.
//
// The claude.ai track is ordered advanced-first: readers arrive already familiar with
// AI assistants, so prompting opens the sequence rather than orientation material.
//
// Pages that do not yet have a content file are rendered as muted "coming soon"
// labels (resolved at build time against the docs collection) so the build never
// links to a non-existent slug.

export interface NavItem {
  title: string;
  /** Slug WITHOUT leading slash, matching the content collection id. */
  slug: string;
}

export interface NavSection {
  label: string;
  /** Renders muted and set apart: a detour for newcomers, not a prerequisite. */
  optional?: boolean;
  /** Renders as a disclosure the reader can fold away. Keeps long lists from
   *  swamping the spine without hiding them from anyone who wants them. */
  collapsible?: boolean;
  /** Only meaningful with `collapsible`. Starts folded, unless the page being
   *  read lives inside the section, in which case it always opens. */
  startClosed?: boolean;
  items: NavItem[];
  /** Sub-sections nested inside this one. They render inside the parent's
   *  disclosure, so opening the parent is what reveals them. */
  children?: NavSection[];
}

/** Depth-first walk, a parent before its children, so ordering matches reading
 *  order in the sidebar. Every consumer of the tree goes through this, which is
 *  what keeps numbering, prev/next and the rendered nav in step. */
export function* walkSections(sections: NavSection[]): Generator<NavSection> {
  for (const section of sections) {
    yield section;
    if (section.children) yield* walkSections(section.children);
  }
}

/** True when the slug sits in this section or any section nested under it. */
export function sectionHoldsSlug(section: NavSection, slug: string): boolean {
  for (const s of walkSections([section])) {
    if (s.items.some((i) => i.slug === slug)) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// claude.ai track (the web app most people use every day).
// ---------------------------------------------------------------------------
export const navCore: NavSection[] = [
  {
    label: 'Foundations',
    items: [
      { title: 'Welcome', slug: 'welcome' },
      { title: 'Context is everything', slug: 'context/why-context' },
      { title: 'Anatomy of a good prompt', slug: 'foundations/anatomy-of-a-prompt' },
      { title: 'From prompt to template', slug: 'resources/from-prompt-to-template' },
      { title: 'Instructions for Claude', slug: 'context/instructions-for-claude' },
    ],
  },
  {
    label: 'Projects',
    items: [
      { title: 'What projects are', slug: 'projects/what-projects-are' },
      { title: 'Reusable vs deal projects', slug: 'projects/two-layer-system' },
      { title: 'Setting up a reusable project', slug: 'projects/reusable-setup' },
      { title: 'Setting up a deal project', slug: 'projects/deal-setup' },
      { title: 'Instruction templates', slug: 'projects/templates' },
    ],
  },
  {
    label: 'Power features',
    items: [
      { title: 'Thinking & effort', slug: 'power-features/thinking-effort' },
      { title: 'Connectors', slug: 'power-features/connectors' },
      { title: 'Analysis tool', slug: 'power-features/analysis-tool' },
      { title: 'Artifacts', slug: 'power-features/artifacts' },
      { title: 'Web search', slug: 'power-features/web-search' },
    ],
  },
  {
    label: 'Best practices',
    items: [
      { title: 'Verify everything', slug: 'best-practices/verify-everything' },
      { title: 'What not to do', slug: 'best-practices/what-not-to-do' },
      { title: 'Cheat sheet', slug: 'best-practices/cheat-sheet' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Claude Code track (Claude in your own files, for hands-on work).
// ---------------------------------------------------------------------------
export const navAdvanced: NavSection[] = [
  {
    label: 'Claude Code welcome',
    items: [
      { title: 'Welcome to Claude Code', slug: 'claude-code/welcome' },
    ],
  },
  {
    label: 'Getting started',
    items: [
      { title: 'Claude Code vs claude.ai', slug: 'claude-code/vs-claude-ai' },
      { title: 'Before you start', slug: 'claude-code/install-vs-code' },
      { title: 'Your first session', slug: 'claude-code/first-session' },
      { title: 'Approving changes', slug: 'claude-code/approving-changes' },
    ],
  },
  {
    label: 'Executing at scale',
    items: [
      { title: 'CLAUDE.md rulebook', slug: 'claude-code/claude-md' },
      { title: 'Leveraging skills', slug: 'claude-code/skills' },
      { title: 'Organizing many deals', slug: 'claude-code/organizing-deals' },
      { title: 'Starting something bigger', slug: 'claude-code/requirements-brief' },
      { title: 'Habits that keep you safe', slug: 'claude-code/good-habits' },
      { title: 'Saving work with Git', slug: 'claude-code/git-basics' },
      { title: 'Going live', slug: 'claude-code/deploy' },
      { title: 'Cheat sheet', slug: 'claude-code/cheat-sheet' },
    ],
  },
  {
    label: 'PE use cases',
    items: [
      { title: 'PE use cases', slug: 'claude-code/example-value-creation' },
    ],
  },
  {
    label: 'Worked example',
    items: [
      { title: 'PortCo Pulse dashboard', slug: 'claude-code/example-portco-pulse' },
    ],
  },
  {
    label: 'Resources',
    items: [
      { title: 'Glossary', slug: 'claude-code/glossary' },
    ],
  },
];

/** Flattened, ordered list per track, used for numbering and prev/next. */
export const flatNavCore: NavItem[] = [...walkSections(navCore)].flatMap((s) => s.items);
export const flatNavAdvanced: NavItem[] = [...walkSections(navAdvanced)].flatMap((s) => s.items);

// ---------------------------------------------------------------------------
// Track model + helpers. Each doc page resolves to exactly one track, and all
// track-scoped chrome (sidebar, prev/next, numbering) reads from these.
// ---------------------------------------------------------------------------
export type Track = 'core' | 'advanced';

export const TRACKS = {
  core: { id: 'core', name: 'claude.ai', homeSlug: 'welcome' },
  advanced: { id: 'advanced', name: 'Claude Code', homeSlug: 'claude-code/welcome' },
} as const;

const advancedSlugs = new Set(flatNavAdvanced.map((i) => i.slug));

export function trackForSlug(slug: string): Track {
  return advancedSlugs.has(slug) ? 'advanced' : 'core';
}

export function navForTrack(t: Track): NavSection[] {
  return t === 'advanced' ? navAdvanced : navCore;
}

export function flatNavForTrack(t: Track): NavItem[] {
  return t === 'advanced' ? flatNavAdvanced : flatNavCore;
}

// ---------------------------------------------------------------------------
// Track position labels. Numbered sections form one continuous spine
// (01, 02, ...). Items inside an `optional: true` section sit outside that
// count and are lettered (A, B, C) so an optional detour never reads as
// step 33 of a 35-step course.
// ---------------------------------------------------------------------------

export interface TrackPosition {
  /** What to render: '07' or 'B'. */
  label: string;
  /** True when the item lives in an optional section. */
  optional: boolean;
  /** 1-based place in the numbered spine, or null for optional items. */
  step: number | null;
}

export function trackPositions(t: Track): Map<string, TrackPosition> {
  const result = new Map<string, TrackPosition>();
  let step = 0;
  let letter = 0; // 0 = 'A', 1 = 'B', etc.

  for (const section of walkSections(navForTrack(t))) {
    for (const item of section.items) {
      if (section.optional) {
        result.set(item.slug, {
          label: String.fromCharCode(65 + letter),
          optional: true,
          step: null,
        });
        letter++;
      } else {
        step++;
        result.set(item.slug, {
          label: String(step).padStart(2, '0'),
          optional: false,
          step,
        });
      }
    }
  }

  return result;
}

/** The N in "7 of N". Counts the numbered spine only. */
export function trackStepCount(t: Track): number {
  let count = 0;
  for (const section of walkSections(navForTrack(t))) {
    if (!section.optional) {
      count += section.items.length;
    }
  }
  return count;
}

/**
 * Find the section label from nav.ts for a given slug. Returns the section
 * label string if the slug is found, or null if not present in the nav.
 */
export function sectionLabelForSlug(t: Track, slug: string): string | null {
  for (const section of walkSections(navForTrack(t))) {
    for (const item of section.items) {
      if (item.slug === slug) {
        return section.label;
      }
    }
  }
  return null;
}

