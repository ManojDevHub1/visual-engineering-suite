---
name: visual-reconstruction
description: >-
  Inspect supplied screenshots, mockups, or web pages, extract visual hierarchy, layout structure, typography, and visible components, and produce a structured UI specification separating facts from assumptions.
---

# Visual Reconstruction Skill

Use this skill when presented with a screenshot, UI reference image, mockup, or web page that needs to be reconstructed into frontend code.

## Core Responsibilities

1. **Empirical Grounding**: Distinguish verified visual facts from assumptions.
2. **Dimension Awareness**: Inspect reference image dimensions using [check-dimensions.js](./scripts/check-dimensions.js).
3. **Structured Specification**: Produce an implementation-ready UI specification matching [reconstruction-schema.json](./references/reconstruction-schema.json) before generating code.
4. **Uncertainty Logging**: Explicitly log any unverified typography, spacing, or responsive behaviors.

---

## Step-by-Step Procedure

### 1. Inspect Reference Image Dimensions
Always determine image width and height to establish the target device context:
```bash
node skills/visual-reconstruction/scripts/check-dimensions.js <path-to-reference-image>
```
- `< 500px`: Mobile viewport context.
- `500px - 1024px`: Tablet viewport context.
- `> 1024px`: Desktop viewport context.

### 2. Perform Visual Deconstruction
Follow the comprehensive [Visual Analysis Guide](./references/visual-analysis-guide.md):
- **Layout & Structure**: Identify root containers, flex rows/columns, CSS grid layouts, and padding gutters.
- **Hierarchy & Typography**: Identify display headings, section titles, body paragraphs, and microcopy.
- **Component Atoms**: Identify buttons, inputs, pills, avatar circles, cards, and dividers.
- **Color Zones**: Note surface colors, text contrast, borders, and accent highlights.

### 3. Log Observed Facts vs. Uncertainties
Format your analysis with strict separation:

```markdown
### Observed Facts (Empirical)
- The header contains a logo on the left and 4 navigation items on the right.
- The hero section contains an H1 headline, a short subtitle, and a primary action button.
- The background color of the hero is dark slate (#0F172A).

### Uncertainties & Hypotheses
- Font Family: Hypothesized as Inter or system sans-serif. Requires project font check.
- Button Hover State: Not visible in static image. Will implement subtle brightness reduction.
- Mobile Layout: Reference is desktop only. Will adapt 3-column grid to 1-column stack below 768px.
```

### 4. Output the Reconstruction Specification
Synthesize the analysis into a structured specification or JSON conforming to [reconstruction-schema.json](./references/reconstruction-schema.json). Proceed to `design-system-extraction` or `frontend-implementation`.
