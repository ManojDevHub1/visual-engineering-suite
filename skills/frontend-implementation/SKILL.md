---
name: frontend-implementation
description: >-
  Inspect existing codebase conventions, framework, routing, and styling, and implement accessible, reusable UI components handling loading, empty, error, and success states without architectural rewrites.
---

# Frontend Implementation Skill

Use this skill when implementing UI components from visual reconstruction specs and design token maps, ensuring alignment with the host codebase architecture.

## Core Responsibilities

1. **Codebase Discovery**: Inspect target frameworks and styling setup using [inspect-codebase.js](./scripts/inspect-codebase.js).
2. **Semantic & Accessible Markup**: Implement semantic HTML with proper ARIA attributes, keyboard focus states, and color contrast.
3. **State Completeness**: Follow the [Component State Matrix](./references/state-matrix-template.md) to implement default, loading, empty, error, and hover/focus states.
4. **Architectural Respect**: Adhere to the [Framework Adaptation Guide](./references/framework-adaptation-guide.md) to preserve existing project patterns.

---

## Step-by-Step Procedure

### 1. Audit Existing Codebase Conventions
Run the inspection script to identify active frameworks, TypeScript usage, and component paths:
```bash
node skills/frontend-implementation/scripts/inspect-codebase.js [path-to-workspace]
```

### 2. Implement Component Structure
- Use semantic HTML tags (`<nav>`, `<header>`, `<main>`, `<article>`, `<button>`).
- Apply design tokens or Tailwind utility classes extracted in `design-system-extraction`.
- Support responsive viewport constraints (mobile-first layout).

### 3. Handle Lifecycle States
Implement each state defined in [state-matrix-template.md](./references/state-matrix-template.md):
- **Loading State**: Provide skeleton placeholders or spinner indicators.
- **Empty State**: Show friendly fallback text and clear call-to-action when data arrays are empty.
- **Error State**: Render accessible error alert messages with retry actions.
- **Focus Rings**: Ensure interactive elements have visible high-contrast focus rings (`focus-visible:ring-2`).

### 4. Verify Local Implementation
- Run existing linter or build commands (`npm run lint`, `npm run build`, `npm test`).
- Ensure no console syntax errors or hydration mismatches are introduced.
- Hand off to `browser-visual-qa` for rendering verification.
