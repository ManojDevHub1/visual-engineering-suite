import { siteConfig } from '../site.config.js';

export function renderHero(): string {
  return `
    <section class="hero-section" aria-labelledby="hero-title">
      <div class="container hero-container">
        <div class="hero-content">
          <div class="badge badge-purple" style="margin-bottom: var(--space-4);">
            <span class="pulse-dot"></span>
            Open Agent Skills Standard
          </div>

          <h1 id="hero-title" class="hero-title">
            From Screenshot to <span class="gradient-text">Verified UI</span>.
          </h1>

          <p class="hero-subtitle">
            ${siteConfig.subheading}
          </p>

          <div class="hero-actions">
            <a href="#install" class="btn btn-primary">
              ${siteConfig.primaryCtaText}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </a>
            <a href="#workflow" class="btn btn-secondary">${siteConfig.secondaryCtaText}</a>
          </div>

          <!-- Quick command pill -->
          <div class="quick-install">
            <span class="quick-install-label">Quick Install:</span>
            <code class="quick-install-code">npx skills add visual-engineering-suite --all -y</code>
            <button type="button" class="quick-copy-btn" data-copy="npx skills add visual-engineering-suite --all -y" aria-label="Copy install command">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Interactive Product Visual (Real Artifacts) -->
        <div class="hero-visual" role="region" aria-label="Interactive visual comparison demo">
          <div class="visual-window">
            <div class="visual-window-header">
              <div class="window-dots">
                <span class="dot dot-red"></span>
                <span class="dot dot-yellow"></span>
                <span class="dot dot-green"></span>
              </div>
              <div class="visual-tabs" role="tablist" aria-label="Visual comparison stages">
                <button type="button" class="visual-tab active" role="tab" aria-selected="true" data-target="diff" id="tab-diff">Diff Map</button>
                <button type="button" class="visual-tab" role="tab" aria-selected="false" data-target="reference" id="tab-ref">Reference Mockup</button>
                <button type="button" class="visual-tab" role="tab" aria-selected="false" data-target="initial" id="tab-init">Initial AI Render</button>
                <button type="button" class="visual-tab" role="tab" aria-selected="false" data-target="refined" id="tab-refn">Refined UI</button>
              </div>
              <div class="window-badge badge badge-green" style="font-size: 0.65rem;">
                Delta: -1.92%
              </div>
            </div>

            <div class="visual-display">
              <!-- Diff View (Default) -->
              <div class="visual-view active" id="view-diff" role="tabpanel" aria-labelledby="tab-diff">
                <div class="image-wrapper">
                  <img src="/images/diff-hero.png" alt="Color-coded magenta pixel visual discrepancy map" width="800" height="500" loading="eager" />
                  <div class="discrepancy-callout" style="top: 50%; left: 16%;">
                    <div class="callout-pill">CTA Button: [x: 48..207, y: 248..295]</div>
                    <div class="callout-detail">Indigo-600 #4F46E5 vs Reference Blue-600 #2563EB</div>
                  </div>
                </div>
              </div>

              <!-- Reference View -->
              <div class="visual-view" id="view-reference" role="tabpanel" aria-labelledby="tab-ref" hidden>
                <div class="image-wrapper">
                  <img src="/images/reference-hero.png" alt="Reference design mockup of landing page hero" width="800" height="500" loading="lazy" />
                  <div class="view-tag">Target Ground Truth</div>
                </div>
              </div>

              <!-- Initial Render View -->
              <div class="visual-view" id="view-initial" role="tabpanel" aria-labelledby="tab-init" hidden>
                <div class="image-wrapper">
                  <img src="/images/rendered-hero.png" alt="Candidate initial browser render" width="800" height="500" loading="lazy" />
                  <div class="view-tag view-tag-warn">Unrefined: 1.92% Discrepancy</div>
                </div>
              </div>

              <!-- Refined View -->
              <div class="visual-view" id="view-refined" role="tabpanel" aria-labelledby="tab-refn" hidden>
                <div class="image-wrapper">
                  <img src="/images/reference-hero.png" alt="Verified refined frontend implementation" width="800" height="500" loading="lazy" />
                  <div class="view-tag view-tag-pass">Verified: 0% Discrepancy (100% Match)</div>
                </div>
              </div>
            </div>

            <!-- Telemetry Footer Bar -->
            <div class="visual-telemetry">
              <div class="telemetry-item">
                <span class="telemetry-label">Baseline Diff:</span>
                <span class="telemetry-val text-fail">7,680 px (1.92%)</span>
              </div>
              <div class="telemetry-item">
                <span class="telemetry-label">Refined Diff:</span>
                <span class="telemetry-val text-pass">0 px (0.00%)</span>
              </div>
              <div class="telemetry-item">
                <span class="telemetry-label">Defect Triage:</span>
                <span class="telemetry-val">COLOR_DISCREPANCY</span>
              </div>
              <div class="telemetry-item">
                <span class="telemetry-label">Iterations:</span>
                <span class="telemetry-val">2 of 3 (Halted Early)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}
