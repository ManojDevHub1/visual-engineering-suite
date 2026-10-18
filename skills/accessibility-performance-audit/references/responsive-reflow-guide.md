# Responsive Reflow & Performance Audit Guide

Techniques for identifying responsive layout failures and performance regressions during visual engineering.

## 1. Responsive Reflow Failure Modes

1. **Unintended Horizontal Scrolling**:
   - Fixed-width elements (e.g., `width: 600px` or `min-width: 400px` on a 375px mobile screen).
   - Unconstrained images or preformatted code blocks (`<pre>`).
   - Fix: Use `max-w-full`, `overflow-x-auto`, or fluid percentages.

2. **Text Truncation & Overlap**:
   - Long headings breaking out of card containers or overlapping adjacent badges.
   - Text clipped by rigid parent `overflow: hidden` without text ellipsis.
   - Fix: Apply `break-words`, `line-clamp`, or flexible min-heights.

3. **Touch Target Collisions**:
   - Small icons or buttons packed too tightly (< 8px apart), causing mis-taps on mobile.
   - Fix: Ensure `min-h-[44px] min-w-[44px]` with adequate touch margin.

---

## 2. Visual Performance Inspection

1. **Cumulative Layout Shift (CLS)**:
   - Images without explicit `width` and `height` or `aspect-ratio` causing layout jump during render.
   - Web fonts loading with FOIT (Flash of Invisible Text) or large FOUT shifts.
   - Fix: Set explicit aspect-ratio and size attributes on images.

2. **Asset Optimization**:
   - SVG icons should be compressed and inlined or referenced via sprites.
   - Large hero images should use modern formats (`webp`, `avif`) with responsive `srcset`.
