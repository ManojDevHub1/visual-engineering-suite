---
name: visual-regression-triage
description: >-
  Compare reference mockups against rendered screenshots at matching viewport dimensions, calculate quantitative pixel difference metrics, isolate bounding boxes, filter rendering noise, and triage discrepancies by severity.
---

# Visual Regression Triage Skill

Use this skill to perform automated visual comparison between a reference image and a rendered implementation, isolate the discrepancy regions, filter out rendering noise, and produce prioritized remediation guidance.

## Core Responsibilities

1. **Dimension Verification**: Assert identical viewport dimensions using `bin/ves-dimension.js` before diffing.
2. **Quantitative Metrics**: Run [diff.js](./scripts/diff.js) to compute mismatched pixel count, diff percentage, and coordinate bounding boxes.
3. **Noise Filtering**: Distinguish subpixel antialiasing and font smoothing noise from layout, color, and structural defects using [Triage Taxonomy](./references/triage-taxonomy.md).
4. **Severity Prioritization**: Rank findings (Critical, Major, Minor) and recommend specific code corrections.

---

## Step-by-Step Procedure

### 1. Verify Image Dimensions
Ensure both images share identical dimensions:
```bash
node bin/ves-dimension.js <reference-png> <rendered-png>
```
If dimensions differ, do not proceed with pixel diffing. Resize the browser viewport or crop the candidate image to match the reference.

### 2. Execute Visual Diff
Run the regression comparison with visual diff output:
```bash
node skills/visual-regression-triage/scripts/diff.js <reference-png> <rendered-png> --diff ./output/diff.png --json
```

### 3. Analyze Findings & Discrepancy Bounding Boxes
Inspect the resulting bounding box and metrics:
- **`boundingBox`**: Coordinate region `[minX..maxX, minY..maxY]` identifying exactly where the mismatch occurred.
- **`diffPercentage`**: Quantitative mismatch ratio.
- Cross-reference with the [Triage Taxonomy](./references/triage-taxonomy.md) to classify:
  - Is it a layout shift? (e.g. element moved 20px down)
  - Is it a color mismatch? (e.g. wrong hex code on CTA)
  - Is it missing elements or truncated text?
  - Is it harmless antialiasing noise?

### 4. Produce Structured Triage Report
Format the report with concrete code fixes:

```markdown
### Visual Regression Triage Report

- **Reference Image**: `fixtures/landing-hero-ref.png` (1280x800px)
- **Rendered Image**: `output/rendered-desktop.png` (1280x800px)
- **Status**: FAILED (Diff: 1,420 pixels, 0.138%)
- **Discrepancy Region**: Bounding Box `x: 96..280, y: 340..396` (Primary CTA Button)

#### Triaged Issues:
1. **[Major] CTA Button Background Color Mismatch**:
   - *Observation*: Button rendered in `#2563EB` (Tailwind blue-600) instead of reference `#1D4ED8` (blue-700).
   - *Remediation*: Update `className="bg-blue-600"` to `className="bg-blue-700"` in `src/components/Hero.tsx`.
2. **[Minor] Heading Margin-Bottom**:
   - *Observation*: Spacing between headline and subtitle is 16px instead of 24px.
   - *Remediation*: Update `mb-4` to `mb-6`.
```

### 5. Loop Back to Frontend Implementation
Apply the corrections, re-render, and repeat diffing until the visual test passes cleanly.
