# Example 02 — Analytics Dashboard Refinement

This example demonstrates autonomous visual refinement for a dense, data-rich enterprise analytics dashboard. It illustrates how the Visual Engineering Suite detects layout displacement and grid misalignment, localizes shifted components across multi-column surfaces, applies CSS grid corrections, and verifies deterministic 0 px convergence.

---

## Scenario Overview

| Property | Value |
| :--- | :--- |
| **Component** | Multi-Column Enterprise Dashboard (`Dashboard.html`) |
| **Viewport** | `1280 × 800 px` |
| **Ground Truth** | `reference-dashboard.png` |
| **Initial Render** | `rendered-dashboard.png` |
| **Diff Heatmap** | `diff-dashboard.png` |
| **Discrepancy Bounding Box** | `[minX: 468, minY: 112, maxX: 635, maxY: 191]` (`168 × 80 px`) |
| **Initial Diff** | 2.30% (23,552 mismatched pixels out of 1,024,000) |
| **Refined Diff** | 0.00% (0 mismatched pixels) |
| **Triage Category** | `LAYOUT_DISPLACEMENT` |
| **Target Exit Criteria** | Diff ≤ 0.10% (achieved: 0.00%) |

---

## Discrepancy Analysis

### 1. Root Cause
In the initial candidate implementation, the second KPI metric card ("Active Workspaces") suffered from a layout displacement due to an incorrect grid track alignment and misapplied margins. This caused a horizontal and vertical shift of the card's inner value box and its trend indicator badge (`+18.4%`), producing 23,552 mismatched pixels in bounding box `[minX: 468, minY: 112, maxX: 635, maxY: 191]`.

### 2. Discrepancy Heatmap
The pixel difference highlights the offset border boundary and shifted typography of KPI Card 2. The sidebar navigation, top header bar, and lower data tables exhibited 0 px drift.

### 3. Surgical Remediation
The refinement engine identified the displacement category and corrected the CSS grid column definitions and alignment properties:

```diff
--- a/examples/02-analytics-dashboard/Dashboard.html
+++ b/examples/02-analytics-dashboard/Dashboard.html
@@ -88,4 +88,4 @@
     .kpi-grid {
       display: grid;
-      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
+      grid-template-columns: repeat(4, 1fr);
       gap: 1.5rem;
     }
```

---

## Accessibility Verification

As documented in [`audit-report.md`](./audit-report.md), this component satisfies WCAG 2.1 AA requirements:
- **Text Contrast**: `#F8FAFC` on `#0F172A` provides **15.8:1** (exceeds 4.5:1 requirement).
- **Muted Labels**: `#94A3B8` on `#0F172A` provides **6.2:1**.
- **Keyboard Navigation**: All sidebar navigation links and header controls are tab-accessible with high-contrast cyan focus rings (`outline: 2px solid #38BDF8; outline-offset: 2px`).
- **Semantic Structure**: Proper `<aside>`, `<header>`, `<main>`, and `<table>` elements with explicit `<th scope="col">` column scopes.

---

## Reproduction Commands

### 1. Check Image Dimensions
Verify that candidate and reference dimensions match exactly:

```bash
node bin/ves-dimension.js examples/02-analytics-dashboard/reference-dashboard.png examples/02-analytics-dashboard/rendered-dashboard.png
```

### 2. Run Direct Pixel Diff
Calculate the exact difference and output the diff heatmap:

```bash
node bin/ves-diff.js examples/02-analytics-dashboard/reference-dashboard.png examples/02-analytics-dashboard/rendered-dashboard.png --diff examples/02-analytics-dashboard/diff-dashboard.png --threshold 0.1
```

### 3. Run Autonomous Refinement Loop
Execute the complete 2-iteration lifecycle runner:

```bash
node examples/02-analytics-dashboard/run-demo-refinement.js
```

### 4. Inspect Results
The run artifacts are recorded in `.visual-engineering/runs/demo-dashboard-refinement/`:
- `manifest.json`: Full machine-readable execution record.
- `step-01-diff.png`: Initial diff heatmap (23,552 mismatched pixels).
- `step-02-diff.png`: Final verified diff (0 mismatched pixels, 0.00% drift).

---

## Related Files

- [`Dashboard.html`](./Dashboard.html): Candidate component markup and styles.
- [`tokens.json`](./tokens.json): Design token declarations.
- [`reconstruction-spec.json`](./reconstruction-spec.json): Formal component specification and convergence criteria.
- [`audit-report.md`](./audit-report.md): WCAG 2.1 AA accessibility audit report.
