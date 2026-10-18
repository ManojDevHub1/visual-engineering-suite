# WCAG 2.1 AA Accessibility Checklist for Visual Engineering

A rigorous checklist for evaluating accessibility during frontend visual engineering.

## 1. Perceivable

- [ ] **1.1.1 Non-text Content**:
  - All `<img>` tags have descriptive `alt` text.
  - Decorative icons or SVGs have `aria-hidden="true"`.
  - Icon-only buttons have an `aria-label` or hidden screen-reader text (`<span class="sr-only">`).
- [ ] **1.4.3 Contrast (Minimum)**:
  - Normal text (< 18pt / 24px) has a contrast ratio of at least **4.5:1** against its background.
  - Large text (≥ 18pt / 24px or bold ≥ 14pt / 18.66px) has a contrast ratio of at least **3:1**.
  - UI components and graphical objects (borders of inputs, icons) have at least **3:1** contrast.
- [ ] **1.4.10 Reflow (Responsive)**:
  - Content reflows without loss of information or functionality down to 320px width without requiring 2-dimensional scrolling (no horizontal scrollbars).

---

## 2. Operable

- [ ] **2.1.1 Keyboard Navigation**:
  - All interactive elements (`<a>`, `<button>`, `<input>`, `<select>`, `<textarea>`) can be reached and activated using only the keyboard (`Tab`, `Shift+Tab`, `Enter`, `Space`).
  - No keyboard traps.
- [ ] **2.4.7 Focus Visible**:
  - Focus indicators must be clearly visible when navigating with the keyboard.
  - Never remove outlines (`outline: none` or `outline: 0`) without providing an explicit replacement like `focus-visible:ring-2`.
- [ ] **2.5.5 / 2.5.8 Target Size**:
  - Pointer/touch targets must be at least **44x44 CSS pixels** on mobile touch devices, or have sufficient spacing (≥ 24px).

---

## 3. Understandable

- [ ] **3.3.2 Labels or Instructions**:
  - Form inputs have associated `<label htmlFor="...">` elements.
  - Placeholders are not used as the sole label for inputs.
  - Error messages clearly explain the required correction.

---

## 4. Robust

- [ ] **4.1.2 Name, Role, Value**:
  - Custom widgets have appropriate ARIA roles (`role="dialog"`, `role="tablist"`).
  - State changes are communicated via `aria-expanded`, `aria-selected`, or `aria-checked`.
