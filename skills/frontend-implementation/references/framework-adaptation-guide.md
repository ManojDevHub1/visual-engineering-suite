# Framework Adaptation Guide

Before writing or editing components, identify the target project's framework and styling system.

## 1. Framework Identification

- **React / Next.js**: Look for `package.json` dependencies (`react`, `next`), `app/` or `pages/` directory, JSX/TSX files.
- **Vue / Nuxt**: Look for `vue`, `nuxt`, `.vue` single file components.
- **Svelte / SvelteKit**: Look for `svelte`, `@sveltejs/kit`, `.svelte` files.
- **Astro**: Look for `astro`, `.astro` files.
- **Static HTML/CSS/JS**: Look for `index.html` without frontend bundlers.

## 2. Component Implementation Principles

1. **Local Architecture Respect**:
   - Follow file naming conventions (e.g. `ComponentName.tsx` vs `component-name.vue` vs `ComponentName.jsx`).
   - Match existing component prop conventions (e.g. TypeScript interfaces, PropTypes, or JSDoc).
   - Place components in the designated project folder (e.g. `src/components/`, `components/ui/`).

2. **Styling Consistency**:
   - If project uses Tailwind: use utility classes and `cn()` / `clsx` / `twMerge` helper.
   - If project uses CSS Modules: use `styles.module.css`.
   - If project uses styled-components / emotion: match existing theme provider patterns.

3. **Responsive Design Execution**:
   - Implement mobile-first media queries (`sm:`, `md:`, `lg:` in Tailwind, or `@media (min-width: 768px)` in CSS).
   - Ensure layouts do not create horizontal scrollbars on 375px viewports (`overflow-x: hidden` or properly constrained flex/grid items).
   - Prevent text truncation or button clipping on smaller viewports.

4. **Preservation of Existing Code**:
   - Never replace entire files when modifying existing components. Make targeted, surgical changes.
   - Preserve comments, existing props, and established routing patterns.
