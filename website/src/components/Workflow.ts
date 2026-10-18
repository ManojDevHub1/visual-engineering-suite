export const WORKFLOW_STAGES = [
  {
    step: 1,
    id: "reference",
    title: "Reference Capture",
    shortTitle: "1. Reference",
    purpose: "Ingest visual design mockups, Figma screenshots, or ground-truth image assets.",
    inputs: ["Mockup image (PNG / JPEG)", "Target viewport dimensions", "Design intentions"],
    outputs: ["Immutable ground truth reference asset (.visual-engineering/runs/<id>/reference.png)"],
    skill: "visual-reconstruction",
    tools: ["ves-dimension", "ves-refine init"],
    limitations: "Text rendered inside raster images is untrusted; security rules prevent code execution from image prompts."
  },
  {
    step: 2,
    id: "analyze",
    title: "Visual Analysis & Token Mining",
    shortTitle: "2. Analyze",
    purpose: "Decompose spatial layout hierarchy, extract typography ladders, and map colors to the host codebase's existing design tokens.",
    inputs: ["Reference image", "Host project Tailwind configs or CSS custom properties"],
    outputs: ["reconstruction-spec.json", "tokens.json mapping hex codes to project conventions"],
    skill: "design-system-extraction",
    tools: ["inspect-tokens.js", "reconstruction-schema.json"],
    limitations: "Heuristic token extraction must be validated against existing project styleguides to avoid token sprawl."
  },
  {
    step: 3,
    id: "implement",
    title: "Semantic Frontend Implementation",
    shortTitle: "3. Implement",
    purpose: "Construct framework-adaptive UI components (HTML, React, Vue, Svelte) handling full state matrices (loading, empty, error, active).",
    inputs: ["reconstruction-spec.json", "tokens.json", "Host component conventions"],
    outputs: ["Accessible component source code", "Unit / component tests"],
    skill: "frontend-implementation",
    tools: ["inspect-codebase.js", "state-matrix-template.md"],
    limitations: "Does not rewrite unrelated codebase architecture; preserves existing patterns and state management."
  },
  {
    step: 4,
    id: "capture",
    title: "Headless Browser Rendering",
    shortTitle: "4. Capture",
    purpose: "Render the implemented interface in standard viewports (mobile: 375px, tablet: 768px, desktop: 1280px) and capture high-resolution screenshots.",
    inputs: ["Local development server URL or static HTML path", "Target viewport presets"],
    outputs: ["Rendered screenshot PNG", "Console error logs", "Network request telemetry"],
    skill: "browser-visual-qa",
    tools: ["ves-screenshot (Playwright)"],
    limitations: "Requires local dev server or static file; dynamic data like timestamps should be frozen before capture."
  },
  {
    step: 5,
    id: "compare",
    title: "Pixel-Level Regression Triage",
    shortTitle: "5. Compare",
    purpose: "Execute quantitative visual diffing using pixelmatch, compute exact mismatch percentages, and isolate discrepancy coordinate bounding boxes.",
    inputs: ["reference.png", "rendered.png", "Diff threshold (default: 0.1)"],
    outputs: ["diff.png (magenta diff map)", "Bounding box [minX..maxX, minY..maxY]", "Defect classification"],
    skill: "visual-regression-triage",
    tools: ["ves-diff", "pixelmatch", "pngjs"],
    limitations: "OS subpixel font antialiasing (macOS CoreText vs Windows DirectWrite) requires threshold >= 0.1."
  },
  {
    step: 6,
    id: "refine",
    title: "Autonomous Surgical Refinement",
    shortTitle: "6. Refine",
    purpose: "Coordinate closed-loop correction cycles: apply targeted token and layout fixes, enforce strict iteration caps, and halt on test regressions.",
    inputs: ["Discrepancy bounding box", "Diff map", "Configured max iterations (default: 3)"],
    outputs: ["Updated code patch", "Refined rendered screenshot", "Iteration delta telemetry"],
    skill: "visual-refinement-loop",
    tools: ["ves-refine step", "refinement.js"],
    limitations: "Halts immediately if automated tests fail or if consecutive iterations fail to improve pixel discrepancy."
  },
  {
    step: 7,
    id: "verify",
    title: "Accessibility & Delivery Report",
    shortTitle: "7. Verify",
    purpose: "Verify WCAG 2.1 AA color contrast, touch target minimums (>=44x44px), semantic landmarks, and produce an evidence-backed summary report.",
    inputs: ["Final rendered component", "Refinement run history"],
    outputs: ["summary.md", "run.json", "Accessibility compliance audit"],
    skill: "accessibility-performance-audit",
    tools: ["audit-markup.js", "wcag-checklist.md"],
    limitations: "Automated checks cover structural criteria; complex interactive screen-reader UX requires human evaluation."
  }
];

export function renderWorkflow(): string {
  return `
    <section id="workflow" class="section" aria-labelledby="workflow-title">
      <div class="container">
        <div class="section-header">
          <div class="badge badge-purple" style="margin-bottom: var(--space-3);">Engineering Protocol</div>
          <h2 id="workflow-title">Closed-Loop Visual Refinement</h2>
          <p>
            Replace blind one-shot generation with a disciplined, 7-stage visual feedback loop that halts on stagnation and verifies every change on disk.
          </p>
        </div>

        <!-- Workflow Stepper Navigation -->
        <div class="workflow-stepper" role="tablist" aria-label="Workflow Stages">
          ${WORKFLOW_STAGES.map((s, idx) => `
            <button type="button" 
                    class="step-node ${idx === 0 ? 'active' : ''}" 
                    role="tab" 
                    id="step-tab-${s.id}" 
                    aria-selected="${idx === 0 ? 'true' : 'false'}" 
                    aria-controls="step-panel-${s.id}" 
                    data-step="${s.id}">
              <span class="step-num">${s.step}</span>
              <span class="step-name">${s.shortTitle.split('. ')[1]}</span>
            </button>
          `).join('')}
        </div>

        <!-- Workflow Stage Detail Panels -->
        <div class="workflow-content">
          ${WORKFLOW_STAGES.map((s, idx) => `
            <div class="stage-panel ${idx === 0 ? 'active' : ''}" 
                 id="step-panel-${s.id}" 
                 role="tabpanel" 
                 aria-labelledby="step-tab-${s.id}" 
                 ${idx !== 0 ? 'hidden' : ''}>
              <div class="card stage-card">
                <div class="stage-header">
                  <div>
                    <span class="badge badge-green">Stage ${s.step} of 7</span>
                    <h3 style="margin-top: var(--space-2);">${s.title}</h3>
                  </div>
                  <div class="stage-skill-pill">
                    <span style="font-size: 0.8rem; color: var(--text-muted);">Specialist Skill:</span>
                    <code>${s.skill}</code>
                  </div>
                </div>

                <p class="stage-purpose">${s.purpose}</p>

                <div class="grid-2 stage-grid">
                  <div class="stage-subbox">
                    <span class="stage-subbox-title">Required Inputs</span>
                    <ul class="stage-list">
                      ${s.inputs.map(i => `<li>${i}</li>`).join('')}
                    </ul>
                  </div>

                  <div class="stage-subbox">
                    <span class="stage-subbox-title">Verified Outputs</span>
                    <ul class="stage-list">
                      ${s.outputs.map(o => `<li>${o}</li>`).join('')}
                    </ul>
                  </div>
                </div>

                <div class="stage-meta-row">
                  <div class="stage-meta-item">
                    <span class="meta-label">CLI Tooling:</span>
                    <span class="meta-val"><code>${s.tools.join('</code>, <code>')}</code></span>
                  </div>
                  <div class="stage-meta-item">
                    <span class="meta-label">Known Limitation:</span>
                    <span class="meta-val text-muted">${s.limitations}</span>
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}
