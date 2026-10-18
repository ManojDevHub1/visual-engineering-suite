import { siteConfig } from '../site.config.js';

export function renderNavbar(): string {
  return `
    <header class="navbar" role="banner">
      <div class="container navbar-inner">
        <a href="#" class="brand" aria-label="${siteConfig.brandName} Home">
          <img src="/assets/logo.svg" alt="" width="26" height="26" class="brand-logo" />
          <span class="brand-name">${siteConfig.brandName}</span>
          <span class="badge badge-dark brand-badge">v${siteConfig.version}</span>
        </a>

        <nav class="nav-links" aria-label="Main Navigation">
          ${siteConfig.navLinks.map(link => `
            <a href="${link.href}" class="nav-link">${link.label}</a>
          `).join('')}
        </nav>

        <div class="nav-actions">
          <a href="${siteConfig.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm nav-gh-btn" aria-label="View source code on GitHub">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
            <span>GitHub</span>
          </a>
          <a href="#install" class="btn btn-primary btn-sm">Get Started</a>
          <button type="button" class="mobile-toggle" aria-expanded="false" aria-controls="mobile-nav" aria-label="Toggle navigation menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Navigation Drawer -->
      <div id="mobile-nav" class="mobile-nav" hidden>
        <div class="mobile-nav-inner">
          <div class="mobile-nav-header">
            <span class="brand-name">${siteConfig.brandName}</span>
            <button type="button" class="mobile-close" aria-label="Close navigation menu">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <nav class="mobile-links">
            ${siteConfig.navLinks.map(link => `
              <a href="${link.href}" class="mobile-link">${link.label}</a>
            `).join('')}
            <a href="${siteConfig.githubUrl}" target="_blank" rel="noopener noreferrer" class="mobile-link">GitHub Repository</a>
          </nav>
          <div style="margin-top: var(--space-6);">
            <a href="#install" class="btn btn-primary" style="width: 100%;">Get Started</a>
          </div>
        </div>
      </div>
    </header>
  `;
}
