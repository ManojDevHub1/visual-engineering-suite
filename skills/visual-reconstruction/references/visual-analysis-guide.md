# Visual Analysis & Deconstruction Guide

This guide provides a rigorous protocol for inspecting UI screenshots, mockups, or live web pages before writing any frontend code.

## 1. Visual Grounding Protocol: Facts vs. Assumptions

When analyzing any UI reference:

### Category A: Empirical Observations (Observed Facts)
These are visible realities that any reviewer can directly verify:
- Component count (e.g., "The card grid has 3 columns in the desktop viewport").
- Relative visual weight (e.g., "The headline is significantly larger and bolder than the body copy").
- Element arrangement (e.g., "The search bar is aligned to the right of the brand logo").
- Distinct color zones (e.g., "The hero section has a dark slate background, while the card surface is off-white").

### Category B: Hypotheses & Uncertainties
These are visual aspects that cannot be definitively measured without inspecting live code or source Figma files:
- Exact font family (e.g., "Inter vs. Roboto vs. system-ui").
- Exact line-height and letter-spacing (kerning).
- Responsive breakpoint behavior (how a desktop 4-column layout wraps on mobile).
- Interactive states (hover, focus-visible, active, disabled).
- Content overflow behavior (text truncation vs. line wrap).

**Rule**: Always document Category B explicitly under an `Uncertainties` section in your specification. Never present a guess as a verified fact.

---

## 2. Deconstruction Steps

1. **Canvas & Viewport Assessment**:
   - Determine image pixel dimensions using `scripts/check-dimensions.js`.
   - Identify whether the reference is mobile (375–430px wide), tablet (768–1024px), or desktop (1200px+).

2. **Spatial Layout & Flow**:
   - Identify main regions: Header/Navbar, Hero, Main Content, Sidebar, Footer.
   - Determine layout primitives: CSS Flexbox (1D alignment) or CSS Grid (2D matrix).
   - Estimate major gutters and container max-widths.

3. **Typography Ladder Extraction**:
   - Classify textual hierarchy:
     - Display / Title (`h1`)
     - Section Heading (`h2`)
     - Subtitle / Card Heading (`h3`)
     - Body Text (`p`)
     - Caption / Meta / Badge (`span`, `small`)

4. **Component Graphing**:
   - Break layout into atomic elements:
     - Buttons (Primary, Secondary, Ghost, Icon-only)
     - Form inputs, search fields, dropdowns
     - Badges, status pills
     - Media containers (aspect ratios, avatar circles, thumbnail rectangles)

5. **Specification Synthesis**:
   - Output the structured specification conforming to [reconstruction-schema.json](./reconstruction-schema.json).
