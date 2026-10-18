# Viewport Standards & Browser QA Specifications

Standardized viewport dimensions ensure consistent visual testing and prevent resolution mismatches during visual regression diffing.

## 1. Standard Viewport Matrix

| Preset Name | Width | Height | Device Target | Testing Focus |
| :--- | :--- | :--- | :--- | :--- |
| **`mobile`** | 390px | 844px | Modern smartphone (iPhone 14/15, Pixel 7/8) | Hamburger menus, 1-col cards, touch targets (≥44px), horizontal overflow prevention |
| **`tablet`** | 768px | 1024px | iPad / Tablet portrait | 2-col grids, responsive nav transitions, tablet spacing |
| **`desktop`** | 1280px | 800px | Standard laptop / desktop monitor | Multi-column layouts, sticky navbars, modal dialogues, full desktop hover states |
| **`wide`** | 1440px | 900px | Wide screen display | Max-width container centering, content stretching, high-density elements |

---

## 2. Browser Environment Detection & Fallbacks

Visual QA can operate across multiple agent runtime environments:

1. **Native Agent Browser Tools (Preferred in Antigravity / Claude)**:
   - When the agent environment provides built-in browser tools (e.g. `take_screenshot`, `browser_action`, etc.), use those directly.
2. **Headless Playwright CLI Workflow (`ves-screenshot`)**:
   - When running in an environment with Node.js and Playwright installed (`npm i -D playwright`), execute:
     ```bash
     node bin/ves-screenshot.js <url> <outputPath> --preset desktop
     ```
3. **Manual Developer Capture**:
   - If no automated browser tool or Playwright is available, instruct the developer to capture a screenshot at the specified viewport using browser DevTools Device Mode (e.g., 1280x800px) and save to a designated path.

---

## 3. Grounded Verification Rules
- **Console Log Inspection**: Check for runtime errors, uncaught exceptions, and hydration warnings.
- **Network Request Failures**: Check for 404 images, failed API endpoints, or blocked fonts.
- **Empirical Proof**: Never claim a visual test passed without inspecting the generated screenshot or automated diff output.
