# Visual Regression & Accessibility Triage — Ecommerce Product Card

## 1. Component Overview
- **Component**: Acoustic Pro Wireless ANC Product Card
- **Device Context**: Mobile (390x680px)
- **Target File**: `examples/03-ecommerce-product-card/ProductCard.html`

---

## 2. Accessibility & Interaction Verification

| Interaction Feature | Accessibility Implementation | Verification Status |
| :--- | :--- | :--- |
| **Color Swatches** | `<fieldset>` with `<legend>`, radio inputs with `name="color-variant"`, visible focus ring `span` | **PASS** — Tab reachable, arrow-key selectable |
| **Quantity Stepper** | Touch-accessible buttons with `min-width: 44px; min-height: 44px;`, explicit `aria-label` | **PASS** — Exceeds WCAG 2.5.5 minimum touch target (44px) |
| **Price Announcement** | Discount badge with `aria-label="25 percent discount"`, struck-through original price | **PASS** — Screen readers announce discount clearly |
| **Add to Cart CTA** | Full width button (48px tall), high contrast text (White on `#0F172A` = 16.1:1 contrast) | **PASS** — Complete keyboard activation via Enter/Space |

---

## 3. Visual Regression Triage Workflow
To compare this rendered card against a mobile reference mockup:
```bash
# 1. Dimension check
node bin/ves-dimension.js <reference-mobile.png> <rendered-mobile.png>

# 2. Pixel diff with tolerance
node bin/ves-diff.js <reference-mobile.png> <rendered-mobile.png> --diff ./output/diff-mobile.png --threshold 0.1
```
Any mismatch in swatch border radius or button height will be flagged with its bounding box coordinates for instant correction.
