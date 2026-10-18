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
              <a href="${siteConfig.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-hero">
                <span>View on GitHub</span>
                <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}
