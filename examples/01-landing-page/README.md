# Example 01 — Landing Page Hero Refinement

This example demonstrates the complete autonomous visual refinement loop for a modern SaaS hero component. It illustrates how the Visual Engineering Suite detects design token deviations, localizes the discrepancy bounding box, applies a surgical CSS correction, and verifies 100% pixel-level convergence.

---

## Scenario Overview

| Property | Value |
| :--- | :--- |
| **Component** | SaaS Landing Page Hero (`Hero.html`) |
| **Viewport** | `800 × 500 px` |
| **Ground Truth** | `reference-hero.png` |
| **Initial Render** | `rendered-hero.png` |
| **Diff Heatmap** | `diff-hero.png` |
| **Discrepancy Bounding Box** | `[minX: 48, minY: 248, maxX: 207, maxY: 295]` (`160 × 48 px`) |
| **Initial Diff** | 1.92% (7,680 mismatched pixels out of 400,000) |
| **Refined Diff** | 0.00% (0 mismatched pixels) |
| **Triage Category** | `STYLE_DEVIATION` |
| **Target Exit Criteria** | Diff ≤ 0.10% (achieved: 0.00%) |

---

## Discrepancy Analysis

### 1. Root Cause
The initial candidate implementation applied an Indigo color palette (`--primary: #4F46E5` / Tailwind `indigo-600`) to the primary Call-to-Action button ("Get Started"), whereas the reference ground truth specified Royal Blue (`--primary: #2563EB` / Tailwind `blue-600`).

### 2. Discrepancy Heatmap
The pixel difference is isolated entirely to the button bounding box at coordinates `x: 48..207, y: 248..295`. Surrounding typography, layout spacing, dark canvas surfaces, and auxiliary badges have 0 px difference.

### 3. Surgical Remediation
Rather than regenerating or re-rendering unrelated layout structures, the refinement engine applies a targeted token correction:

```diff
--- a/examples/01-landing-page/Hero.html
+++ b/examples/01-landing-page/Hero.html
@@ -7,4 +7,4 @@
     :root {
-      --primary: #4F46E5;
-      --primary-hover: #4338CA;
+      --primary: #2563EB;
+      --primary-hover: #1D4ED8;
     }
```

---

## Reproduction Commands

### 1. Check Image Dimensions
Verify that candidate and reference dimensions match exactly:

```bash
node bin/ves-dimension.js examples/01-landing-page/reference-hero.png examples/01-landing-page/rendered-hero.png
```

### 2. Run Direct Pixel Diff
Calculate the exact difference and output the diff heatmap:

```bash
node bin/ves-diff.js examples/01-landing-page/reference-hero.png examples/01-landing-page/rendered-hero.png --diff examples/01-landing-page/diff-hero.png --threshold 0.1
```

### 3. Run Autonomous Refinement Loop
Execute the complete 2-iteration lifecycle runner:

```bash
node examples/01-landing-page/run-demo-refinement.js
```

### 4. Inspect Results
The run artifacts are recorded in `.visual-engineering/runs/demo-refinement-run/`:
- `manifest.json`: Full machine-readable execution record.
- `step-01-diff.png`: Initial diff heatmap (7,680 mismatched pixels).
- `step-02-diff.png`: Final verified diff (0 mismatched pixels, 0.00% drift).

---

## Related Files

- [`Hero.html`](./Hero.html): Candidate component markup and styles.
- [`tokens.json`](./tokens.json): Design token declarations (colors, typography, spacing).
- [`reconstruction-spec.json`](./reconstruction-spec.json): Formal component specification and convergence criteria.
- [`regression-report.md`](./regression-report.md): Formal triage report.
