import { siteConfig } from '../site.config.js';

export function renderCommunity(): string {
  return `
    <section class="section" aria-labelledby="community-title">
      <div class="container">
        <!-- Section Header -->
        <div class="section-header">
          <div class="eyebrow">Governance &amp; Open Source</div>
          <h2 id="community-title">Inspect, Contribute &amp; Extend</h2>
          <p>
            The Visual Engineering Suite is free, open-source software licensed under MIT. We welcome contributions from frontend architects, AI agent engineers, and visual QA researchers.
          </p>
        </div>

        <div class="grid-3">
          <div class="card community-editorial-card">
            <span class="card-eyebrow">DEVELOPER WORKFLOW</span>
            <h3>Contributing Code</h3>
            <p style="margin-top: var(--space-2); margin-bottom: var(--space-4);">
              Submit bug fixes, new specialist skills, or benchmark cases. All changes must pass canonical manifest validation and test suites.
            </p>
            <a href="${siteConfig.githubUrl}/blob/master/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
              <span>Read CONTRIBUTING.md</span>
              <span aria-hidden="true">&rarr;</span>
            </a>
          </div>

          <div class="card community-editorial-card">
            <span class="card-eyebrow">DEFECT TRIAGE</span>
            <h3>Issue Tracking &amp; Bugs</h3>
            <p style="margin-top: var(--space-2); margin-bottom: var(--space-4);">
              Found a visual diff false-positive, a missing schema definition, or an agent discovery quirk? Open an issue on GitHub.
            </p>
            <a href="${siteConfig.githubUrl}/issues" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
              <span>Open an Issue</span>
              <span aria-hidden="true">&rarr;</span>
            </a>
          </div>

          <div class="card community-editorial-card">
            <span class="card-eyebrow">SAFEGUARD PROTOCOL</span>
            <h3>Security &amp; Disclosure</h3>
            <p style="margin-top: var(--space-2); margin-bottom: var(--space-4);">
              Prompt injection defenses and untrusted visual data handling are central to our design. Report vulnerabilities responsibly.
            </p>
            <a href="${siteConfig.githubUrl}/blob/master/SECURITY.md" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
              <span>Security Policy (SECURITY.md)</span>
              <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </div>

        <!-- Strong Final Call to Action Block -->
        <div class="final-cta-frame" style="margin-top: var(--space-16);">
          <div class="final-cta-content">
            <div class="final-cta-eyebrow">PRODUCE EVIDENCE, NOT ASSUMPTIONS</div>
            <h2 class="final-cta-heading">Ready to Make Your Coding Agent Prove Its UI?</h2>
            <p class="final-cta-lead">
              Install the Visual Engineering Suite in less than 60 seconds and experience closed-loop, deterministic visual refinement in your next frontend task.
            </p>
            <div class="final-cta-actions">
              <a href="#install" class="btn btn-primary btn-hero">
                <span>Get Started Now</span>
                <span class="btn-accent-tag">v${siteConfig.version}</span>
              </a>
              <a href="${siteConfig.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-hero" aria-label="View Visual Engineering Suite on GitHub (opens in a new tab)">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
                <span>View on GitHub</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="margin-left: 2px; opacity: 0.85;">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}
