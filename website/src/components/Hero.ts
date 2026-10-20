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
              Your AI builds the UI.<br class="hero-br" />
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
              <a href="${siteConfig.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-hero" aria-label="View Visual Engineering Suite on GitHub (opens in a new tab)">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
                <span>${siteConfig.secondaryCtaText}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="margin-left: 2px; opacity: 0.85;">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </a>
              <a href="#workflow" class="btn btn-ghost" aria-label="Explore sequential verification protocol">
                <span>Explore Protocol</span>
                <span aria-hidden="true">&rarr;</span>
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
      </div>
    </section>
  `;
}
