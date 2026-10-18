# Visual Regression Triage Taxonomy & Noise Filtering

Visual difference metrics must be translated into actionable engineering priorities. A raw pixel percentage alone does not determine severity.

## 1. Discrepancy Severity Taxonomy

### Severity 1: Critical (Blocker)
- **Characteristics**: Missing essential content, completely broken layouts, missing call-to-action buttons, severe horizontal overflow, unreadable overlapping text.
- **User Impact**: User cannot complete primary task or view vital data.
- **Action**: Immediate code fix before any deployment or review.

### Severity 2: Major (High Impact)
- **Characteristics**: Layout shifts > 16px, incorrect color on primary brand elements, wrong button variants, wrong grid column counts, missing icons, truncated text.
- **User Impact**: Visual degradation that impairs brand trust and visual hierarchy.
- **Action**: Correct styling, spacing, or markup alignment.

### Severity 3: Minor (Polishing)
- **Characteristics**: Padding/margin discrepancy of 2–8px, subtle border radius differences (e.g. 6px vs 8px), shadow depth variance, subtle font-weight mismatch (medium vs regular).
- **User Impact**: Slight cosmetic inconsistency.
- **Action**: Tune CSS tokens or classes.

### Severity 4: Rendering Noise (Acceptable / Ignorable)
- **Characteristics**:
  - Subpixel antialiasing differences across operating systems (macOS CoreText vs Windows DirectWrite / ClearType vs Linux FreeType).
  - Minor JPEG compression artifacts.
  - 1px rounding discrepancies due to CSS device pixel ratio scaling (`window.devicePixelRatio`).
- **Action**: Do not attempt fragile pixel-by-pixel CSS hacks to eliminate subpixel antialiasing noise. Use `includeAA: false` or threshold `0.1` to filter.

---

## 2. Quantitative Metric Interpretation

When reporting visual diff results:
- **Total Pixels**: Canvas area (`width * height`).
- **Diff Pixels**: Number of pixels where Delta-E color distance exceeds the threshold.
- **Diff Percentage**: `(Diff Pixels / Total Pixels) * 100`.
- **Bounding Box**: `[minX..maxX, minY..maxY]`. Pinpoints the coordinate region where discrepancy occurred, allowing rapid localization in code (e.g., "Discrepancy isolated to header y: 0..60px").
