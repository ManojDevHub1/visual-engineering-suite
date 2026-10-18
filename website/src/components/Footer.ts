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
          <div style="margin-top: var(--space-4);">
            <span class="badge badge-green" style="font-size: 0.65rem;">License: ${siteConfig.license}</span>
            <span class="badge" style="font-size: 0.65rem; margin-left: var(--space-2);">v${siteConfig.version}</span>
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
              <li><a href="${siteConfig.githubUrl}" target="_blank" rel="noopener noreferrer">GitHub Repository</a></li>
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
