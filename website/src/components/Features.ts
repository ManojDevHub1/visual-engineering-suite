export const ARCHITECTURAL_PILLARS = [
  {
    num: "01",
    id: "reconstruction",
    title: "Visual Reconstruction",
    tagline: "Empirical facts separated from unverified guesses",
    description: "Extracts container bounds, typography scales, spacing systems, and component hierarchy before code generation starts. Outputs structured reconstruction-spec.json rather than guessing arbitrary inline styles.",
    skill: "visual-reconstruction",
    tag: "Analysis"
  },
  {
    num: "02",
    id: "tokens",
    title: "Design System Mining",
    tagline: "Harmonize with existing codebase tokens",
    description: "Scans your host repository for Tailwind configs, CSS custom properties, and theme definitions. Maps candidate colors, spacing units, and border radii to existing design tokens, preventing rogue hex codes.",
    skill: "design-system-extraction",
    tag: "Design Tokens"
  },
  {
    num: "03",
    id: "implementation",
    title: "Adaptive Frontend Engineering",
    tagline: "Full UI state matrix without architecture rewrites",
    description: "Builds accessible, reusable components matching your host framework (React, Next.js, Vue, Svelte, or semantic HTML). Enforces loading, empty, error, active, and focus-visible state handling out of the box.",
    skill: "frontend-implementation",
    tag: "Implementation"
  },
  {
    num: "04",
    id: "browser-qa",
    title: "Headless Browser Visual QA",
    tagline: "Standard viewports & runtime error telemetry",
    description: "Detects native browser automation or runs headless Playwright captures across standardized viewports (mobile: 375px, tablet: 768px, desktop: 1280px). Traps console errors and network request failures.",
    skill: "browser-visual-qa",
    tag: "Browser QA"
  },
  {
    num: "05",
    id: "regression-triage",
    title: "Pixel-Level Regression Engine",
    tagline: "Pure JavaScript diffing with bounding box localization",
    description: "Executes pure-JS pixel comparison (pixelmatch + pngjs) with zero C++ compilation dependencies. Outputs high-contrast magenta diff maps and identifies the exact discrepancy bounding box [minX..maxX, minY..maxY].",
    skill: "visual-regression-triage",
    tag: "Diff Engine"
  },
  {
    num: "06",
    id: "refinement-loop",
    title: "Autonomous Refinement Engine",
    tagline: "Closed-loop iteration limits & stagnation guards",
    description: "Drives multi-step refinement with strict iteration limits (default: 3). Halts on criteria satisfaction, stops if consecutive runs stagnate, and aborts immediately if modifications cause automated test regressions.",
    skill: "visual-refinement-loop",
    tag: "Coordinator"
  }
];

export function renderFeatures(): string {
  return `
    <section id="features" class="section" aria-labelledby="features-title">
      <div class="container">
        <!-- Section Header -->
        <div class="section-header">
          <div class="eyebrow">Product Proof &amp; Architecture</div>
          <h2 id="features-title">Engineered for Technical Credibility</h2>
          <p>
            When coding assistants generate frontend components from screenshots, they generate code that <em>looks</em> plausible to an LLM, but fails the browser. We replace guesswork with deterministic verification.
          </p>
        </div>

        <!-- The Plausibility Trap: Editorial Comparison Breakdown -->
        <div class="plausibility-trap-panel">
          <div class="trap-header">
            <span class="trap-kicker">THE CENTRAL PROBLEM</span>
            <h3>The Plausibility Trap: Why AI Frontend Code Breaks in Production</h3>
          </div>
          
          <div class="trap-columns">
            <div class="trap-col trap-col-problem">
              <div class="trap-badge badge-warn">Generic LLM Prompting</div>
              <h4>Superficial Syntactic Success</h4>
              <ul class="trap-list">
                <li>
                  <strong>Token Hallucination:</strong> Arbitrary inline hex codes (e.g. <code>#4F46E5</code>) instead of project Tailwind tokens.
                </li>
                <li>
                  <strong>Silent Displacement:</strong> 4px to 16px spatial padding drift that ruins responsive grid layouts.
                </li>
                <li>
                  <strong>Unverified Victory Claims:</strong> Declares "Done!" because the file saved, without a single headless browser check.
                </li>
                <li>
                  <strong>Accessibility Blindness:</strong> Contrast below WCAG 2.1 AA (4.5:1), absent focus rings, and rigid pixel bounds breaking mobile viewports.
                </li>
              </ul>
            </div>

            <div class="trap-col trap-col-solution">
              <div class="trap-badge badge-lime">Visual Engineering Suite</div>
              <h4>Empirical Closed-Loop Verification</h4>
              <ul class="trap-list">
                <li>
                  <strong>Token Discovery:</strong> Mines host repository for CSS custom properties, variables, and themes before generating code.
                </li>
                <li>
                  <strong>Pixel-Accurate Coordinate Bounds:</strong> Precise bounding box <code>[minX..maxX, minY..maxY]</code> locating exact discrepancies.
                </li>
                <li>
                  <strong>Real Headless Capture:</strong> Captures rendered DOM across 4 viewports with console and network error traps.
                </li>
                <li>
                  <strong>Surgical Refinement &amp; Circuit Breaker:</strong> Halts immediately if tests regress or changes stagnate.
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Architectural Capabilities Grid -->
        <div class="pillars-editorial-grid" style="margin-top: var(--space-16);">
          ${ARCHITECTURAL_PILLARS.map(p => `
            <div class="pillar-card">
              <div class="pillar-top-row">
                <span class="pillar-num">${p.num}</span>
                <span class="badge badge-dark">${p.tag}</span>
              </div>
              <h3 class="pillar-title">${p.title}</h3>
              <p class="pillar-tagline">${p.tagline}</p>
              <p class="pillar-desc">${p.description}</p>
              <div class="pillar-footer">
                <span class="pillar-skill-label">Canonical Skill:</span>
                <code class="pillar-skill-name">${p.skill}</code>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}
