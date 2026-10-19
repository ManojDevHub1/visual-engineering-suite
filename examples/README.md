# Visual Engineering Suite — Canonical Examples Catalog

This directory contains three end-to-end canonical reference examples demonstrating the Visual Engineering Suite (VES) autonomous visual refinement loop, multi-agent skill orchestration, accessibility auditing, and deterministic pixel verification.

---

## Catalog Summary

| Example | Scenario & Viewport | Initial Discrepancy | Triage Category | Iterations | Final Drift | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| [**01 — Landing Page Hero**](./01-landing-page/README.md) | Hero Section<br>`800×500 px` | CTA button palette mismatch (`#4F46E5` vs `#2563EB`) | `STYLE_DEVIATION` | 2 steps | 0 px (0.00%) | **PASS** |
| [**02 — Analytics Dashboard**](./02-analytics-dashboard/README.md) | Dense Metrics Grid<br>`1280×800 px` | KPI Card 2 displacement & layout shift | `LAYOUT_DISPLACEMENT` | 2 steps | 0 px (0.00%) | **PASS** |
| [**03 — E-Commerce Product Card**](./03-ecommerce-product-card/README.md) | Mobile Interaction<br>`390×680 px` | Missing active swatch ring & touch target | `MISSING_ELEMENT` | 2 steps | 0 px (0.00%) | **PASS** |

---

## Directory Architecture

Each example follows a standardized, reproducible structure:

```
examples/
├── README.md                                  # This directory overview
├── 01-landing-page/
│   ├── README.md                              # Reproduction guide & triage details
│   ├── Hero.html                              # Candidate semantic HTML + CSS
│   ├── tokens.json                            # Extracted design tokens
│   ├── reconstruction-spec.json               # Viewport, tolerance & component spec
│   ├── regression-report.md                   # Human-readable triage report
│   ├── reference-hero.png                     # Visual ground-truth reference
│   ├── rendered-hero.png                      # Initial candidate render (1.92% diff)
│   ├── diff-hero.png                          # Diff heatmap highlighting discrepancy
│   ├── generate-example-images.js             # Pure-JS deterministic image generator
│   └── run-demo-refinement.js                 # Complete refinement lifecycle runner
├── 02-analytics-dashboard/
│   ├── README.md                              # Reproduction guide & triage details
│   ├── Dashboard.html                         # Multi-column semantic dashboard
│   ├── tokens.json                            # Token definitions
│   ├── reconstruction-spec.json               # Viewport & layout spec
│   ├── audit-report.md                        # WCAG AA accessibility audit
│   ├── reference-dashboard.png                # Reference ground truth
│   ├── rendered-dashboard.png                 # Initial candidate render (2.30% diff)
│   ├── diff-dashboard.png                     # Diff heatmap of displaced KPI card
│   ├── generate-example-images.js             # Pure-JS image generator
│   └── run-demo-refinement.js                 # Complete refinement lifecycle runner
└── 03-ecommerce-product-card/
    ├── README.md                              # Reproduction guide & triage details
    ├── ProductCard.html                       # Mobile-first interactive product card
    ├── tokens.json                            # Token definitions
    ├── reconstruction-spec.json               # Mobile viewport & interaction spec
    ├── regression-triage.md                   # State matrix & accessibility triage
    ├── reference-card.png                     # Reference ground truth
    ├── rendered-card.png                      # Initial candidate render (0.45% diff)
    ├── diff-card.png                          # Diff heatmap of missing active ring
    ├── generate-example-images.js             # Pure-JS image generator
    └── run-demo-refinement.js                 # Complete refinement lifecycle runner
```

---

## How to Execute the Refinement Workflows

### 1. Run All Three Examples Sequentially

```bash
# Example 01: Landing Page Hero
node examples/01-landing-page/run-demo-refinement.js

# Example 02: Analytics Dashboard
node examples/02-analytics-dashboard/run-demo-refinement.js

# Example 03: E-Commerce Product Card
node examples/03-ecommerce-product-card/run-demo-refinement.js
```

### 2. Inspect Refinement Artifacts

Every refinement run automatically creates an isolated directory inside `.visual-engineering/runs/<run-id>/` containing:
- `manifest.json`: Complete execution record, initial diff, refined diff, iterations, and convergence timestamp.
- `step-01-diff.png`: Visual heatmap of initial candidate discrepancies.
- `step-02-diff.png`: Visual verification proving 0 mismatched pixels.

### 3. Regenerate Example Assets

All sample reference and candidate PNG images are created with pure-JS PNG encoding (zero external binaries or browser dependencies required):

```bash
node examples/01-landing-page/generate-example-images.js
node examples/02-analytics-dashboard/generate-example-images.js
node examples/03-ecommerce-product-card/generate-example-images.js
```

---

## Refinement Lifecycle Protocol

All examples validate against the 7-stage VES protocol:

```
[1] Reference Capture
    ↓
[2] Visual Analysis & Token Extraction (tokens.json)
    ↓
[3] Semantic Frontend Implementation (*.html)
    ↓
[4] Headless Browser Rendering (Playwright / ves-screenshot)
    ↓
[5] Pixel-Level Regression Triage (ves-diff → bounding box coordinates)
    ↓
[6] Autonomous Surgical Refinement (targeted token/CSS patch)
    ↓
[7] Deterministic Verification (0 px drift, 100% match)
```
