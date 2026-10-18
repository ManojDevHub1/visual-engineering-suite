import { siteConfig } from '../site.config.js';

export function renderHero(): string {
  return `
    <section class="hero-section" aria-labelledby="hero-title">
      <div class="container">
        <!-- Editorial Two-Part Header & Copy Block -->
        <div class="hero-editorial-grid">
          <div class="hero-text-block">
            <div class="eyebrow" aria-label="System status">
              <span>VES v${siteConfig.version}</span>
              <span class="eyebrow-sep">/</span>
              <span>Open Agent Skills Standard</span>
              <span class="eyebrow-sep">/</span>
              <span class="text-lime-contrast">Verified Execution</span>
            </div>

            <h1 id="hero-title" class="hero-headline">
              Your AI builds the UI.<br />
              <span class="editorial-italic">We make it prove itself.</span>
            </h1>

            <p class="hero-supporting-copy">
              Reconstruct interfaces, inspect real browser output, and refine visual differences through evidence-driven AI workflows.
            </p>

            <div class="hero-actions-row">
              <a href="#install" class="btn btn-primary btn-hero">
                <span>${siteConfig.primaryCtaText}</span>
                <span class="btn-accent-tag">v${siteConfig.version}</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </a>
              <a href="#workflow" class="btn btn-secondary btn-hero">
                <span>${siteConfig.secondaryCtaText}</span>
              </a>
            </div>

            <!-- Monospace Install Command Bar -->
            <div class="hero-install-strip" role="region" aria-label="Quick installation snippet">
              <span class="install-prompt-symbol">$</span>
              <code class="hero-install-command">npx skills add visual-engineering-suite --all -y</code>
              <button type="button" class="hero-copy-btn" data-copy="npx skills add visual-engineering-suite --all -y" aria-label="Copy install command to clipboard">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <span class="copy-btn-text">Copy</span>
              </button>
            </div>
          </div>

          <!-- Editorial Meta Details Column -->
          <div class="hero-meta-block">
            <div class="meta-stat-card">
              <span class="meta-stat-num">100%</span>
              <span class="meta-stat-label">Deterministic Verification</span>
              <p class="meta-stat-desc">Pure JavaScript pixelmatch comparison engine. Zero LLM hallucinations in diff calculations.</p>
            </div>
            <div class="meta-stat-card">
              <span class="meta-stat-num">0 px</span>
              <span class="meta-stat-label">Measurement Drift</span>
              <p class="meta-stat-desc">Verified mathematical repeatability across consecutive evaluation runs.</p>
            </div>
            <div class="meta-stat-card">
              <span class="meta-stat-num">7 Skills</span>
              <span class="meta-stat-label">Canonical Agent Toolkit</span>
              <p class="meta-stat-desc">Hierarchy reconstruction, design tokens mining, headless QA, and closed-loop refinement.</p>
            </div>
          </div>
        </div>

        <!-- Custom Product Preview Canvas (Contrasting Dark Instrumentation Panel) -->
        <div class="hero-canvas-frame" role="region" aria-label="Authentic product inspection demonstration illustrating visual verification states">
          <!-- Canvas Top Instrumentation Header -->
          <div class="canvas-header">
            <div class="canvas-title-group">
              <span class="canvas-run-badge">RUN #01-LANDING-PAGE</span>
              <span class="canvas-viewport-tag">800 &times; 500 px</span>
            </div>

            <!-- Verification States & Interactive Slider Tablist -->
            <div class="visual-tabs canvas-tabs" role="tablist" aria-label="Visual comparison stages">
              <button type="button" class="visual-tab active" role="tab" aria-selected="true" data-target="diff" id="tab-diff">
                <span class="tab-indicator tab-indicator-diff"></span>
                <span>3. Visual Differences</span>
              </button>
              <button type="button" class="visual-tab" role="tab" aria-selected="false" data-target="slider" id="tab-slider">
                <span class="tab-indicator tab-indicator-slider"></span>
                <span>Interactive Split Slider</span>
              </button>
              <button type="button" class="visual-tab" role="tab" aria-selected="false" data-target="reference" id="tab-ref">
                <span class="tab-indicator"></span>
                <span>1. Reference Ground Truth</span>
              </button>
              <button type="button" class="visual-tab" role="tab" aria-selected="false" data-target="initial" id="tab-init">
                <span class="tab-indicator tab-indicator-warn"></span>
                <span>2. Rendered UI (Initial)</span>
              </button>
              <button type="button" class="visual-tab" role="tab" aria-selected="false" data-target="refined" id="tab-refn">
                <span class="tab-indicator tab-indicator-pass"></span>
                <span>Refined Match (100%)</span>
              </button>
            </div>

            <div class="canvas-metric-pill">
              <span class="metric-pill-dot"></span>
              <span>Delta: -1.92% (Fixed)</span>
            </div>
          </div>

          <!-- Canvas Viewport Stage -->
          <div class="canvas-stage">
            <!-- 3. Visual Differences View (Default) -->
            <div class="visual-view active" id="view-diff" role="tabpanel" aria-labelledby="tab-diff">
              <div class="canvas-image-container">
                <img src="/images/diff-hero.png" alt="Color-coded magenta pixel visual discrepancy map identifying layout and color deltas" width="800" height="500" loading="eager" />
                
                <!-- Discrepancy Bounding Box Overlay with Coordinate Callout -->
                <div class="discrepancy-bounding-box" style="top: 49%; left: 6%; width: 22%; height: 11%;" aria-hidden="true">
                  <span class="bbox-corner tl"></span>
                  <span class="bbox-corner tr"></span>
                  <span class="bbox-corner bl"></span>
                  <span class="bbox-corner br"></span>
                  <div class="bbox-tag">DEFECT LOCALIZED</div>
                </div>

                <div class="discrepancy-callout-card">
                  <div class="callout-header">
                    <span class="callout-chip chip-magenta">BOUNDING BOX</span>
                    <span class="callout-coords">x: 48..207, y: 248..295</span>
                  </div>
                  <div class="callout-title">CTA Button Token Drift</div>
                  <div class="callout-body">
                    <span class="drift-from">Observed: #4F46E5 (Indigo-600)</span>
                    <span class="drift-arrow">&rarr;</span>
                    <span class="drift-to">Reference: #2563EB (Blue-600)</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Interactive Split Comparison Slider View -->
            <div class="visual-view" id="view-slider" role="tabpanel" aria-labelledby="tab-slider" hidden>
              <div class="canvas-image-container comparison-slider-container">
                <img src="/images/rendered-hero.png" alt="Candidate initial browser render before refinement" width="800" height="500" class="slider-image-base" />
                <div class="slider-image-overlay" id="slider-overlay" style="width: 50%;">
                  <img src="/images/reference-hero.png" alt="Reference design mockup of landing page hero" width="800" height="500" class="slider-image-top" />
                  <div class="canvas-stage-badge badge-pass" style="top: 12px; left: 12px;">Reference (Target)</div>
                </div>
                <div class="canvas-stage-badge badge-warn" style="top: 12px; right: 12px;">Rendered (Before Refinement)</div>
                <div class="slider-handle" id="slider-handle" style="left: 50%;" aria-hidden="true">
                  <div class="slider-handle-line"></div>
                  <div class="slider-handle-thumb">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </div>
                </div>
                <input type="range" id="split-slider-range" min="0" max="100" value="50" class="slider-input" aria-label="Slide to compare reference ground truth against rendered implementation" />
              </div>
            </div>

            <!-- 1. Reference View -->
            <div class="visual-view" id="view-reference" role="tabpanel" aria-labelledby="tab-ref" hidden>
              <div class="canvas-image-container">
                <img src="/images/reference-hero.png" alt="Reference design mockup of landing page hero" width="800" height="500" loading="lazy" />
                <div class="canvas-stage-badge badge-dark">Target Ground Truth Mockup</div>
              </div>
            </div>

            <!-- 2. Rendered UI View -->
            <div class="visual-view" id="view-initial" role="tabpanel" aria-labelledby="tab-init" hidden>
              <div class="canvas-image-container">
                <img src="/images/rendered-hero.png" alt="Candidate initial browser render before refinement" width="800" height="500" loading="lazy" />
                <div class="canvas-stage-badge badge-warn">Unrefined: 7,680 px Discrepancy (1.92%)</div>
              </div>
            </div>

            <!-- Refined Match View -->
            <div class="visual-view" id="view-refined" role="tabpanel" aria-labelledby="tab-refn" hidden>
              <div class="canvas-image-container">
                <img src="/images/reference-hero.png" alt="Verified refined frontend implementation matching reference exactly" width="800" height="500" loading="lazy" />
                <div class="canvas-stage-badge badge-pass">Verified: 0 px Discrepancy (100% Match)</div>
              </div>
            </div>
          </div>

          <!-- Canvas Telemetry Strip -->
          <div class="canvas-telemetry-bar">
            <div class="telemetry-cell">
              <span class="telemetry-micro">Baseline Diff</span>
              <span class="telemetry-value val-fail">7,680 px (1.92%)</span>
            </div>
            <div class="telemetry-cell">
              <span class="telemetry-micro">Refined Diff</span>
              <span class="telemetry-value val-pass">0 px (0.00%)</span>
            </div>
            <div class="telemetry-cell">
              <span class="telemetry-micro">Triage Category</span>
              <span class="telemetry-value">COLOR_DISCREPANCY</span>
            </div>
            <div class="telemetry-cell">
              <span class="telemetry-micro">Refinement Loop</span>
              <span class="telemetry-value val-lime">2 of 3 (Halted Early)</span>
            </div>
            <div class="telemetry-cell">
              <span class="telemetry-micro">Deterministic Exit</span>
              <span class="telemetry-value val-pass">Exit Code 0</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}
