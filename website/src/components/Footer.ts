import { siteConfig } from '../site.config.js';

export function renderFooter(): string {
  return `
    <footer class="footer" role="contentinfo">
      <div class="container footer-inner">
        <div class="footer-brand">
          <div class="brand" style="margin-bottom: var(--space-2);">
            <img src="/assets/logo.svg" alt="" width="24" height="24" class="brand-logo" />
            <span class="brand-name">${siteConfig.brandName}</span>
          </div>
          <p style="font-size: 0.9rem; max-width: 380px;">${siteConfig.subheading}</p>
          <div style="margin-top: var(--space-4); display: flex; align-items: center; flex-wrap: wrap; gap: var(--space-2);">
            <span class="badge badge-green" style="font-size: 0.65rem;">License: ${siteConfig.license}</span>
            <span class="badge" style="font-size: 0.65rem;">v${siteConfig.version}</span>
            <a href="${siteConfig.githubUrl}" target="_blank" rel="noopener noreferrer" class="badge badge-dark" aria-label="View Visual Engineering Suite on GitHub (opens in a new tab)" style="display: inline-flex; align-items: center; gap: 4px; text-decoration: none; font-size: 0.65rem;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              <span>GitHub</span>
            </a>
          </div>
        </div>

        <div class="footer-links-grid">
          <div class="footer-col">
            <span class="footer-col-title">Product</span>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#workflow">7-Stage Protocol</a></li>
              <li><a href="#skills">Skills Directory</a></li>
              <li><a href="#install">Installation Center</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <span class="footer-col-title">Verification</span>
            <ul>
              <li><a href="#benchmarks">Benchmark Results</a></li>
              <li><a href="#compatibility">Compatibility Matrix</a></li>
              <li><a href="#docs">Health Check (Doctor)</a></li>
              <li><a href="#docs">Antigravity Plugin Pack</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <span class="footer-col-title">Open Source</span>
            <ul>
              <li>
                <a href="${siteConfig.githubUrl}" target="_blank" rel="noopener noreferrer" aria-label="View Visual Engineering Suite repository on GitHub (opens in a new tab)" style="display: inline-flex; align-items: center; gap: 6px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                  </svg>
                  <span>GitHub Repository</span>
                </a>
              </li>
              <li><a href="${siteConfig.githubUrl}/blob/master/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer">Contributing Guide</a></li>
              <li><a href="${siteConfig.githubUrl}/blob/master/CHANGELOG.md" target="_blank" rel="noopener noreferrer">Changelog</a></li>
              <li><a href="${siteConfig.githubUrl}/blob/master/LICENSE" target="_blank" rel="noopener noreferrer">MIT License</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div class="container footer-bottom">
        <p>&copy; ${new Date().getFullYear()} ${siteConfig.author}. Licensed under the ${siteConfig.license} License.</p>
        <p style="font-size: 0.8rem; color: var(--text-muted);">Built for Google Antigravity, Claude Code, Cursor, and the Open Agent Skills Ecosystem.</p>
      </div>
    </footer>
  `;
}
