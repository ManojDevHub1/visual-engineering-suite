# Contributing to Visual Engineering Suite

Thank you for your interest in contributing to the **Visual Engineering Suite**! We welcome improvements to specialist skills, CLI quality tools, test fixtures, and agent integrations.

---

## 1. Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/OWNER/visual-engineering-suite.git
   cd visual-engineering-suite
   ```

2. **Install core dependencies**:
   ```bash
   npm install --no-optional
   ```

3. **Verify the environment**:
   ```bash
   node bin/ves-env.js
   ```

4. **Run the test suite**:
   ```bash
   npm test
   ```

5. **Validate all skill manifests**:
   ```bash
   npm run validate
   ```

---

## 2. Directory Structure Conventions

```text
visual-engineering-suite/
├── assets/                  # Logo and branding assets
├── bin/                     # Portable Node.js CLI executables
│   ├── ves-env.js           # Environment capability auditor
│   ├── ves-validate.js      # Skill & plugin manifest validator
│   ├── ves-dimension.js     # Image dimension comparator
│   ├── ves-diff.js          # Pixel-level visual regression engine
│   ├── ves-screenshot.js    # Headless browser screenshot runner
│   ├── ves-refine.js        # Autonomous closed-loop refinement runner
│   ├── ves-doctor.js        # Health, dependency, and SHA-256 drift auditor
│   ├── ves-pack.js          # Native Antigravity plugin packager
│   └── ves-benchmark.js     # Empirical benchmark and quality evaluation runner
├── src/                     # Core tested JavaScript modules
├── skills/                  # The 7 Canonical Specialist Skills
│   └── <skill-name>/
│       ├── SKILL.md         # Open Agent Skills manifest with YAML frontmatter
│       ├── references/      # Schemas, guides, and checklists
│       └── scripts/         # Executable helper runners
├── benchmarks/              # Benchmark cases and empirical evaluation dataset
├── rules/
│   └── AGENTS.md            # Default rules and security guardrails for active workspaces
├── examples/                # Real-world examples (Landing Page, Dashboard, Ecommerce)
├── tests/                   # Automated node:test suites and fixtures
├── website/                 # Official product website & documentation hub
├── plugin.json              # Antigravity root plugin manifest
└── package.json             # NPM package manifest
```

---

## 3. Adding or Updating Skills

Every skill must conform to the following standards:
1. **Directory**: Must be placed under `skills/<skill-name>/`.
2. **`SKILL.md` Frontmatter**:
   - `name`: Must be lowercase kebab-case matching the directory name.
   - `description`: Must clearly state both what the skill does and when the agent should activate it.
3. **No Broken Links**: All markdown links to scripts or references must resolve to real files on disk.
4. **Validation**: Run `npm run validate` before submitting a pull request.

---

## 4. Running Tests & Code Quality

- All tests use Node.js's native test runner (`node:test` and `node:assert`).
- **Run the full test suite**:
  ```bash
  npm test
  ```
- **Validate skill & plugin manifests**:
  ```bash
  npm run validate
  ```
- **Run the installation and system doctor**:
  ```bash
  npm run doctor
  ```
- **Validate benchmark cases**:
  ```bash
  npm run benchmark:validate
  ```
- **Build and test the website**:
  ```bash
  npm run build:site
  ```
- All pull requests must pass 100% of tests (79 tests across 15 suites). Do not commit failing tests, bypass validation checks, or fabricate test outputs.

