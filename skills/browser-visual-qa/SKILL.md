---
name: browser-visual-qa
description: >-
  Detect browser automation capabilities, capture screenshots at defined viewport sizes (mobile, tablet, desktop), inspect console errors and network failures, and validate real rendered frontend interfaces.
---

# Browser Visual QA Skill

Use this skill to render the implemented interface in a real browser, capture standardized screenshots, monitor console logs, and verify runtime visual integrity.

## Core Responsibilities

1. **Automation Detection**: Detect available browser automation tools (native agent tools vs. Playwright CLI).
2. **Standardized Viewports**: Capture screenshots conforming to [Viewport Standards](./references/viewport-standards.md) (mobile: 390x844, tablet: 768x1024, desktop: 1280x800).
3. **Runtime Health**: Check for JavaScript console errors and failed network assets (missing images, 404 fonts).
4. **Empirical Truth**: Never report that a page rendered properly without observing actual screenshots or console outputs.

---

## Step-by-Step Procedure

### 1. Check Available Browser Automation
Inspect available capabilities:
- **Native Agent Browser Tools**: If your agent platform provides built-in browser tools (e.g., Antigravity browser tools), invoke them directly to navigate and capture screenshots.
- **Playwright Workflow**: If Playwright is installed, use the included capture runner [capture.js](./scripts/capture.js):
  ```bash
  node skills/browser-visual-qa/scripts/capture.js http://localhost:3000 ./output/rendered-desktop.png --preset desktop
  node skills/browser-visual-qa/scripts/capture.js http://localhost:3000 ./output/rendered-mobile.png --preset mobile
  ```
- **Fallback**: If neither tool is installed, request developer capture or provide installation instructions:
  ```bash
  npm install --save-dev playwright && npx playwright install chromium
  ```

### 2. Verify Viewport Dimensions
Confirm that rendered screenshots match the intended dimensions using `ves-dimension`:
```bash
node bin/ves-dimension.js ./output/rendered-desktop.png
```

### 3. Review Console and Network Health
- Ensure zero uncaught runtime errors (`TypeError`, `ReferenceError`).
- Ensure no hydration mismatch warnings in React/Next.js (`Warning: Text content did not match`).
- Ensure zero 404 or blocked network requests for fonts, icons, or images.

### 4. Hand Off to Regression Triage
Pass the rendered screenshot and reference mockup to `visual-regression-triage` for automated pixel comparison.
