# Component State Matrix & Checklist

Every frontend component must account for its lifecycle states to be resilient in production.

## 1. Core State Matrix

| State | Visual Indicator | Trigger / Condition | Accessibility Requirement |
| :--- | :--- | :--- | :--- |
| **Default / Idle** | Base styles conforming to design tokens | Ready state with valid data | Contrast ratio ≥ 4.5:1 |
| **Loading** | Skeleton shimmer or spinner indicator | Async fetch in progress | `aria-busy="true"`, `aria-live="polite"` |
| **Empty** | Helpful illustration, title, call-to-action | Query returns 0 items | Focusable CTA, descriptive text |
| **Error** | Red/amber banner or alert text + retry button | Network error or 4xx/5xx response | `role="alert"`, descriptive error message |
| **Hover** | Subtle brightness change or background tint | Mouse cursor over interactive target | Avoid relying solely on hover for essential info |
| **Focus-Visible** | 2px solid ring with high contrast offset | Keyboard Tab navigation | `outline: 2px solid var(--ring)` (never remove `outline: none` without replacement) |
| **Active / Pressed** | Slight scale (0.98) or darker background | Mouse click down or space/enter key | Immediate feedback |
| **Disabled** | 50% opacity, `cursor: not-allowed` | Incomplete form or missing permission | `aria-disabled="true"` or `disabled` attribute |

---

## 2. Accessibility & Semantic Standards
1. Use semantic HTML elements (`<header>`, `<main>`, `<nav>`, `<section>`, `<article>`, `<button>`, `<a>`, `<input>`).
2. Buttons must have accessible text or `aria-label` when using icons only.
3. Form fields must have associated `<label htmlFor="...">`.
4. Images must have meaningful `alt` text or `alt=""` for decorative assets.
5. All interactive targets must be at least 44x44px or have sufficient padding for touch devices.
