export const FEATURES = [
  {
    id: "reconstruction",
    title: "Visual Reconstruction",
    tagline: "Empirical facts separated from hypotheses",
    description: "Extracts container bounds, typography scales, spacing systems, and component hierarchy before coding begins. Generates structured reconstruction-spec.json specifications rather than guessing arbitrary styles.",
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>`,
    badge: "Specialist Skill",
    skill: "visual-reconstruction"
  },
  {
    id: "tokens",
    title: "Design System Mining",
    tagline: "Harmonize with existing codebase tokens",
    description: "Scans your host repository for Tailwind configs, CSS custom properties, and theme definitions. Maps candidate colors, spacing units, and border radii to existing design tokens, preventing rogue hex codes.",
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/></svg>`,
    badge: "Specialist Skill",
    skill: "design-system-extraction"
  },
  {
    id: "implementation",
    title: "Adaptive Frontend Engineering",
    tagline: "Full UI state matrix without architecture rewrites",
    description: "Builds accessible, reusable components matching your host framework (React, Next.js, Vue, Svelte, or semantic HTML). Enforces loading, empty, error, active, and focus-visible state handling out of the box.",
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
    badge: "Specialist Skill",
    skill: "frontend-implementation"
  },
  {
    id: "browser-qa",
    title: "Headless Browser Visual QA",
    tagline: "Standard viewports & runtime error telemetry",
    description: "Detects native browser automation or runs headless Playwright captures across standardized viewports (mobile: 375px, tablet: 768px, desktop: 1280px). Traps console errors and network request failures.",
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
    badge: "Specialist Skill",
    skill: "browser-visual-qa"
  },
  {
    id: "regression-triage",
    title: "Pixel-Level Regression Engine",
    tagline: "Pure JavaScript diffing with bounding box localization",
    description: "Executes pure-JS pixel comparison (pixelmatch + pngjs) with zero C++ compilation dependencies. Outputs high-contrast magenta diff maps and identifies the exact discrepancy bounding box [minX..maxX, minY..maxY].",
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>`,
    badge: "Specialist Skill",
    skill: "visual-regression-triage"
  },
  {
    id: "refinement-loop",
    title: "Autonomous Refinement Engine",
    tagline: "Closed-loop iteration limits & stagnation guards",
    description: "Drives multi-step refinement with strict iteration limits (default: 3). Halts on criteria satisfaction, stops if consecutive runs stagnate, and aborts immediately if modifications cause automated test regressions.",
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>`,
    badge: "Specialist Skill",
    skill: "visual-refinement-loop"
  }
];

export function renderFeatures(): string {
  return `
    <section id="features" class="section" aria-labelledby="features-title">
      <div class="container">
        <div class="section-header">
          <div class="badge badge-purple" style="margin-bottom: var(--space-3);">Core Capabilities</div>
          <h2 id="features-title">Engineered for Technical Credibility</h2>
          <p>
            Every feature is backed by standalone Node.js executables, verifiable schemas, and pure JavaScript libraries that run portably in any development environment.
          </p>
        </div>

        <div class="grid-3 features-grid">
          ${FEATURES.map(f => `
            <div class="card feature-card">
              <div class="feature-icon-wrapper">
                <div class="feature-icon">${f.icon}</div>
                <span class="badge badge-purple" style="font-size: 0.65rem;">${f.badge}</span>
              </div>
              <h3 class="feature-title">${f.title}</h3>
              <p class="feature-tagline">${f.tagline}</p>
              <p class="feature-desc">${f.description}</p>
              <div class="feature-footer">
                <span style="font-size: 0.8rem; color: var(--text-muted);">Skill:</span>
                <code>${f.skill}</code>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}
