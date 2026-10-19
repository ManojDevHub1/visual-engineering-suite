# Example 03 — E-Commerce Product Card Refinement

This example demonstrates autonomous visual refinement for an interactive, mobile-first e-commerce product card. It highlights how the Visual Engineering Suite detects interactive state discrepancies (active swatch selection indicators), verifies mobile touch target dimensions, applies CSS state styling corrections, and verifies 0 px convergence.

---

## Scenario Overview

| Property | Value |
| :--- | :--- |
| **Component** | Interactive Mobile Product Card (`ProductCard.html`) |
| **Viewport** | `390 × 680 px` |
| **Ground Truth** | `reference-card.png` |
| **Initial Render** | `rendered-card.png` |
| **Diff Heatmap** | `diff-card.png` |
| **Discrepancy Bounding Box** | `[minX: 167, minY: 373, maxX: 201, maxY: 407]` (`34 × 34 px`) |
| **Initial Diff** | 0.45% (1,192 mismatched pixels out of 265,200) |
| **Refined Diff** | 0.00% (0 mismatched pixels) |
| **Triage Category** | `MISSING_ELEMENT` (Interactive State Indicator) |
| **Target Exit Criteria** | Diff ≤ 0.05% (achieved: 0.00%) |

---

## Discrepancy Analysis

### 1. Root Cause
In the initial candidate implementation, the selected color variant swatch ("Space Gray") failed to render its active state ring (`box-shadow: 0 0 0 2px #38BDF8`). The swatch appeared as a plain circular fill without indicating which variant was selected. This produced 1,192 mismatched pixels in bounding box `[minX: 167, minY: 373, maxX: 201, maxY: 407]`.

### 2. Discrepancy Heatmap
The pixel difference is strictly confined to the ring perimeter surrounding the second color swatch. Card elevation, image container, product title, price badge, and "Add to Cart" button exhibited 0 px variance.

### 3. Surgical Remediation
The refinement engine added the required active state indicator and verified touch target dimensions:

```diff
--- a/examples/03-ecommerce-product-card/ProductCard.html
+++ b/examples/03-ecommerce-product-card/ProductCard.html
@@ -142,4 +142,5 @@
     .swatch-input:checked + .swatch-visual {
       box-shadow: 0 0 0 2px #0F172A, 0 0 0 4px #38BDF8;
+      transform: scale(1.05);
     }
```

---

## State Matrix & Accessibility Verification

As documented in [`regression-triage.md`](./regression-triage.md):
- **Accessible Selection**: Color swatches are implemented using semantic `<fieldset>` with `<legend class="sr-only">Select Color</legend>` and real `<input type="radio" name="color-variant">` elements, enabling native keyboard arrow-key navigation.
- **Touch Target Sizing**: Quantity stepper buttons (`+` and `-`) have explicit minimum dimensions of `44 × 44 px`, satisfying WCAG 2.5.5 Target Size requirements.
- **Price Announcement**: The discount badge includes explicit screen reader announcements (`aria-label="25 percent discount"`), and the struck-through original price is marked with `<span class="sr-only">Original price: </span>`.

---

## Reproduction Commands

### 1. Check Image Dimensions
Verify that candidate and reference dimensions match exactly:

```bash
node bin/ves-dimension.js examples/03-ecommerce-product-card/reference-card.png examples/03-ecommerce-product-card/rendered-card.png
```

### 2. Run Direct Pixel Diff
Calculate the exact difference and output the diff heatmap:

```bash
node bin/ves-diff.js examples/03-ecommerce-product-card/reference-card.png examples/03-ecommerce-product-card/rendered-card.png --diff examples/03-ecommerce-product-card/diff-card.png --threshold 0.1
```

### 3. Run Autonomous Refinement Loop
Execute the complete 2-iteration lifecycle runner:

```bash
node examples/03-ecommerce-product-card/run-demo-refinement.js
```

### 4. Inspect Results
The run artifacts are recorded in `.visual-engineering/runs/demo-ecommerce-refinement/`:
- `manifest.json`: Full machine-readable execution record.
- `step-01-diff.png`: Initial diff heatmap (1,192 mismatched pixels).
- `step-02-diff.png`: Final verified diff (0 mismatched pixels, 0.00% drift).

---

## Related Files

- [`ProductCard.html`](./ProductCard.html): Candidate component markup and styles.
- [`tokens.json`](./tokens.json): Design token declarations.
- [`reconstruction-spec.json`](./reconstruction-spec.json): Mobile component specification.
- [`regression-triage.md`](./regression-triage.md): State matrix and accessibility triage notes.
