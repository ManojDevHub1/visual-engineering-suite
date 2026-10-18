import { siteConfig } from '../site.config.js';

export function renderCommunity(): string {
  return `
    <section class="section" aria-labelledby="community-title">
      <div class="container">
        <div class="section-header">
          <div class="badge badge-purple" style="margin-bottom: var(--space-3);">Open Source & Community</div>
          <h2 id="community-title">Inspect, Contribute & Extend</h2>
          <p>
            The Visual Engineering Suite is free, open-source software licensed under MIT. We welcome contributions from frontend architects, AI agent engineers, and visual QA researchers.
          </p>
        </div>

        <div class="grid-3">
          <div class="card community-card">
            <h3>Contributing Code</h3>
            <p style="margin-top: var(--space-2); margin-bottom: var(--space-4);">
              Submit bug fixes, new specialist skills, or benchmark cases. All changes must pass canonical manifest validation and test suites.
            </p>
            <a href="${siteConfig.githubUrl}/blob/master/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
              Read CONTRIBUTING.md →
            </a>
          </div>

          <div class="card community-card">
            <h3>Issue Tracking & Bugs</h3>
            <p style="margin-top: var(--space-2); margin-bottom: var(--space-4);">
              Found a visual diff false-positive, a missing schema definition, or an agent discovery quirk? Open an issue on GitHub.
            </p>
            <a href="${siteConfig.githubUrl}/issues" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
              Open an Issue →
            </a>
          </div>

          <div class="card community-card">
            <h3>Security & Disclosure</h3>
            <p style="margin-top: var(--space-2); margin-bottom: var(--space-4);">
              Prompt injection defenses and untrusted visual data handling are central to our design. Report vulnerabilities responsibly.
            </p>
            <a href="${siteConfig.githubUrl}/blob/master/SECURITY.md" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
              Security Policy →
            </a>
          </div>
        </div>
      </div>
    </section>
  `;
}
