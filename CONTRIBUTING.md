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
│   └── ves-screenshot.js    # Browser screenshot runner
├── src/                     # Core tested JavaScript modules
├── skills/                  # The 6 Canonical Specialist Skills
│   └── <skill-name>/
│       ├── SKILL.md         # Open Agent Skills manifest with YAML frontmatter
│       ├── references/      # Schemas, guides, and checklists
│       └── scripts/         # Executable helper runners
├── rules/
│   └── AGENTS.md            # Default rules for active agent workspaces
├── examples/                # Real-world examples (Landing Page, Dashboard, Ecommerce)
├── tests/                   # Automated node:test suites and fixtures
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
- Run tests:
  ```bash
  npm test
  ```
- All pull requests must pass 100% of tests. Do not commit failing tests or fabricate test outputs.
