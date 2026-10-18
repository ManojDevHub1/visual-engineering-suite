---
name: design-system-extraction
description: >-
  Identify design tokens and recurring visual patterns from mockups or screenshots, extract candidate colors, typography, spacing, radii, and shadows, and map them to the host project's existing design system.
---

# Design System Extraction Skill

Use this skill to extract reusable design tokens and recurring UI patterns from visual references, and harmonize them with the target codebase's existing styling system.

## Core Responsibilities

1. **Token Discovery**: Extract candidate colors, spacing, typography scales, radii, and shadows.
2. **System Harmonization**: Inspect the host repository using [inspect-tokens.js](./scripts/inspect-tokens.js) to reuse existing Tailwind configurations or CSS custom properties.
3. **Sprawl Prevention**: Avoid generating one-off arbitrary values or duplicate variables.
4. **Structured Token Spec**: Output tokens adhering to [token-schema.json](./references/token-schema.json).

---

## Step-by-Step Procedure

### 1. Scan Host Codebase for Existing Tokens
Run the token discovery script to locate Tailwind configs and CSS variables:
```bash
node skills/design-system-extraction/scripts/inspect-tokens.js [path-to-workspace]
```

### 2. Extract Candidate Tokens
Follow the [Token Mapping Guide](./references/token-mapping-guide.md):
- **Colors**: Isolate primary brand, secondary, neutral surfaces, text contrasts, borders, and status cues.
- **Spacing**: Align observed paddings and margins to a 4px or 8px grid (`4, 8, 12, 16, 24, 32, 48px`).
- **Typography**: Record font families, size ladder, line heights, and weights.
- **Radii & Shadows**: Record surface corner roundings and elevation depths.

### 3. Reconcile with Host Design System
- If Tailwind CSS is present: Map colors to Tailwind classes (e.g. `bg-slate-900`, `text-blue-600`) or extend `tailwind.config.js` theme tokens cleanly.
- If CSS Variables are present: Map properties to `var(--primary)`, `var(--background)`, `var(--radius)`.
- If no system exists: Define a consolidated set of CSS variables in the project's root stylesheet.

### 4. Output Design Token Specification
Format the extracted tokens into a clear specification matching [token-schema.json](./references/token-schema.json) for consumption by `frontend-implementation`.
