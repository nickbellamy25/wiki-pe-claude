# Diagram prompts

Image-generation prompts (for Gemini, ChatGPT, or nano-banana) for the structural diagram that is still an image in the [Firm Name] x Claude for Private Equity wiki. One file per diagram, each self-contained so it can be pasted straight into a generator and the outputs compared side by side.

- `01-core-loop.md` : the four-move working loop (context, ask, refine, verify)

The two-layer system and the homepage two-paths diagrams are now Astro components (`src/components/diagrams/`), not images.

## Shared brand and style DNA (applies to every diagram)

These are prompts for an image model to produce genuine, richly designed diagrams, not bare wireframes. Every diagram must feel like it belongs to the same light, institutional, senior wiki. Carry this exact color and typography system into every prompt, then let the model bring real diagramming craft to composition, spacing, depth, and visual metaphor.

**Palette (light world, never dark):**
- Deep blue, primary: `[PRIMARY HEX]`
- Cobalt, accent and flow lines: `[ACCENT HEX]`
- Sky, soft highlight: `[HIGHLIGHT HEX]`
- Teal, positive or "go": `[POSITIVE HEX]`
- Confidential red, stop or caution: `[CAUTION HEX]`
- Ink, primary text: `[INK HEX]`
- Muted ink, secondary text: `[MUTED INK HEX]`
- Hairline and borders: `[HAIRLINE HEX]`
- Background: white `#FFFFFF`; soft panel tint: `[SOFT TINT HEX]`

Stay inside this palette. It is blue led. Never a dark or navy field, never purple or violet, never neon. Depth and richness happen on a light canvas.

**Typography:** Inter, or a near identical clean grotesque. A confident, clearly heavier weight for titles and eyebrows, a comfortable readable weight for body and labels, with eyebrows set in uppercase with generous letter spacing. Real, legible, correctly spelled US English only. Keep labels short.

**Craft and hierarchy:** think in relative proportion, not fixed measurements. Establish a clear visual hierarchy: primary titles read first, then labels, then supporting notes. Use generous, calm negative space and a disciplined sense of alignment and rhythm. Flow lines are clean and confident with crisp, small arrowheads that sit precisely where they meet. Corners are gently rounded with restraint.

**Depth is welcome, used with taste:** soft, low shadows to lift a key element off the page; subtle layering so the eye understands what sits in front; gentle tonal gradients strictly within the brand palette (for example a whisper of sky or the softest blue tint) to add dimension; and well made containers or panels where they genuinely aid clarity. The goal is dimensional and designed, not flat, and never heavy or noisy.

## The art direction philosophy (this is what makes it genuinely designed, not AI slop)

Reference points, aimed high: world class information design and editorial infographics. Think a beautifully crafted diagram in a premium annual report, a Bloomberg or Financial Times graphics desk exhibit, or Pentagram and Stripe Press grade information design. The bar is intentional, senior, and genuinely designed. Every element earns its place and the whole thing looks like a person of real taste made it on purpose.

- Lead with one primary accent, the deep blue, with cobalt carrying motion and flow. Reserve teal and red for final outcomes. Never rainbow.
- Give the model creative latitude over composition, spacing, and visual metaphor, as long as the meaning stays exact and the palette stays on brand.
- Let structure come from strong typographic hierarchy, considered whitespace, and confident flow, enriched where helpful by tasteful depth, layering, and well designed panels.
- Restraint and intention over decoration. Premium, calm, and precise, not busy or ornamental.

**Negative direction (avoid):** dark or navy backgrounds, neon, purple or violet, sci-fi or circuit-board motifs, hexagon tech patterns, emoji or clip-art stock-icon clutter, childish or generic "AI infographic" looks, busy or noisy backgrounds, watermarks, and any misspelled or lorem text.
