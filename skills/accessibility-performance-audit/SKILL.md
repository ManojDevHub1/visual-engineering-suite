---
name: accessibility-performance-audit
description: >-
  Inspect semantic markup, keyboard accessibility, visible focus states, accessible names, color contrast, and responsive reflow, and audit frontend implementations for WCAG 2.1 AA compliance and visual performance.
---

# Accessibility & Performance Audit Skill

Use this skill to audit frontend implementations for WCAG 2.1 AA accessibility compliance, keyboard navigability, responsive reflow integrity, and visual performance.

## Core Responsibilities

1. **Markup Inspection**: Run [audit-markup.js](./scripts/audit-markup.js) to catch missing `alt` attributes, unlabelled buttons, and removed focus outlines.
2. **WCAG 2.1 AA Verification**: Check contrast ratios (≥4.5:1 for normal text, ≥3:1 for graphical objects) using the [WCAG Checklist](./references/wcag-checklist.md).
3. **Reflow & Overflow Checks**: Identify responsive failure modes down to 320px viewports using the [Responsive Reflow Guide](./references/responsive-reflow-guide.md).
4. **Actionable Remediation**: Provide prioritized, line-level code fixes.

---

## Step-by-Step Procedure

### 1. Run Automated Markup Accessibility Audit
Scan component files for syntax-level accessibility violations:
```bash
node skills/accessibility-performance-audit/scripts/audit-markup.js <path-to-component-or-directory>
```
Review flagged items:
- Missing image `alt` attributes.
- Icon buttons missing `aria-label`.
- `outline: none` without accessible focus ring.
- Fixed pixel widths causing mobile overflow.

### 2. Verify Color Contrast Ratios
- Verify normal body copy achieves at least 4.5:1 against surface background.
- Verify large headers (≥24px) achieve at least 3:1.
- Verify borders of input controls and active button outlines meet 3:1 contrast against adjacent background.

### 3. Verify Keyboard Navigability & Focus Indicators
- Ensure all interactive links and buttons can be focused via `Tab` key.
- Verify focus indicators are distinct and clearly visible (`focus-visible:ring-2 focus-visible:ring-offset-2`).
- Verify dropdowns or modals trap and release focus properly.

### 4. Verify Responsive Reflow (320px–1440px)
- Render or inspect page at 320px and 390px widths.
- Ensure no horizontal scrolling or clipped button text.
- Verify touch targets are at least 44x44px.

### 5. Final Report Synthesis
Combine findings into an engineering report with exact remediation code blocks.
