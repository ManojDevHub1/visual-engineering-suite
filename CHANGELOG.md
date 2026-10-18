# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-10-18

### Added
- **7 Canonical Specialist Skills** adhering to the Open Agent Skills specification:
  - `visual-reconstruction`: Visual hierarchy decomposition, typography ladders, and fact/hypothesis separation.
  - `design-system-extraction`: Design token mining, CSS variables/Tailwind discovery, and token schema mapping.
  - `frontend-implementation`: Framework-adaptive component construction handling full state matrices (loading, error, empty, active).
  - `browser-visual-qa`: Automated multi-viewport rendering (`mobile`, `tablet`, `desktop`, `wide`) and runtime error logging.
  - `visual-regression-triage`: Pure-JavaScript pixel-diffing engine (`pixelmatch` + `pngjs`), discrepancy bounding boxes, and severity classification.
  - `accessibility-performance-audit`: WCAG 2.1 AA compliance validation, contrast analysis, touch-target checks, and reflow verification.
  - `visual-refinement-loop`: Autonomous closed-loop coordinator enforcing configurable iteration caps, stagnation detection, and regression aborts.
- **Visual Refinement Engine (`src/refinement.js` & `bin/ves-refine.js`)**:
  - Structured local run tracking under `.visual-engineering/runs/<run-id>/`.
  - Machine-readable `run.json` and human-readable `summary.md` reporting.
  - Stagnation detection halting refinement if consecutive iterations fail to improve pixel discrepancy.
  - Safety circuit breaker aborting immediately on critical automated test failure.
- **Cross-Agent Distribution & Health Tooling**:
  - `ves-doctor` (`src/doctor.js`, `bin/ves-doctor.js`): Comprehensive health check auditing Node runtime, dependencies, canonical skill integrity, agent discovery directories, and checksum drift detection.
  - `ves-pack` (`src/pack.js`, `bin/ves-pack.js`): Antigravity plugin builder packaging clean release bundles with SHA-256 file manifests (`ves-bundle.json`).
  - Native Antigravity Plugin packaging with root `plugin.json`, `rules/AGENTS.md`, and `assets/logo.svg`.
  - Compatibility with Claude Code (`.claude/skills`), Cursor (`.agents/skills`), and Vercel Skills CLI (`npx skills add .`).
- **Standardized CLI Quality Tools**:
  - `bin/ves-env.js`: Environment runtime and dependency auditor.
  - `bin/ves-validate.js`: Frontmatter, kebab-case naming, and internal link validator.
  - `bin/ves-dimension.js`: Fast image dimension inspector and dimension match validator.
  - `bin/ves-diff.js`: Pixel-level visual regression comparator producing magenta diff maps.
  - `bin/ves-screenshot.js`: Viewport screenshot runner using headless Playwright.
- **Realistic Reference Examples**:
  - `01-landing-page`: Marketing hero with before/after PNGs, visual diff, and complete refinement run artifacts.
  - `02-analytics-dashboard`: Executive KPI cards, data table, and WCAG 2.1 AA audit report.
  - `03-ecommerce-product-card`: Mobile product card with radio-group swatches and 44x44px touch targets.
- **Repository Infrastructure**:
  - Comprehensive unit and integration test suite using Node.js native test runner (`node:test`, 44 tests).
  - GitHub Actions CI workflow testing across Node 18, 20, 22, 24 on Linux, macOS, and Windows.
  - Issue templates for bug reports and feature requests, and Pull Request template.
