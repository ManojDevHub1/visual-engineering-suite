# Visual Regression Triage Report — Landing Page Hero

## 1. Executive Summary

| Parameter | Value |
| :--- | :--- |
| **Reference Image** | `examples/01-landing-page/reference-hero.png` (800x500px) |
| **Candidate Render** | `examples/01-landing-page/rendered-hero.png` (800x500px) |
| **Diff Map** | `examples/01-landing-page/diff-hero.png` |
| **Total Pixels** | 400,000 |
| **Diff Pixels** | 7,680 (1.92%) |
| **Status** | **FAILED** (Allowed: 0.00%) |
| **Discrepancy Region** | Bounding Box `x: 48..207, y: 248..295` (Size: 160x48px) |

---

## 2. Root Cause Analysis

- **Location**: Primary CTA Button ("Get Started") at `x=48px, y=248px`.
- **Observed Behavior**: The candidate render applied an Indigo color palette (`#4F46E5` / Tailwind `indigo-600`) instead of the reference royal blue (`#2563EB` / Tailwind `blue-600`).
- **Severity**: **Major (Visual Inconsistency)** — Does not break navigation, but deviates from brand design token specification.

---

## 3. Remediation Patch

```diff
--- a/examples/01-landing-page/Hero.html
+++ b/examples/01-landing-page/Hero.html
@@ -7,3 +7,3 @@
     :root {
-      --primary: #4F46E5;
+      --primary: #2563EB;
-      --primary-hover: #4338CA;
+      --primary-hover: #1D4ED8;
```

After applying this single token correction, `ves-diff` confirms 0 mismatched pixels and test status: **PASSED**.
