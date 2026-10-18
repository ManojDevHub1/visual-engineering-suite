import { siteConfig } from '../site.config.js';

export const INSTALL_METHODS = [
  {
    id: "skills-cli",
    name: "Skills CLI (Multi-Agent)",
    badge: "Recommended",
    badgeType: "badge-lime",
    description: "Install all 7 specialist skills simultaneously across Claude Code, Cursor, and Google Antigravity using the open Vercel Skills CLI.",
    command: `npx skills add visual-engineering-suite --all -y`,
    manualInstructions: `
# Install specifically to targeted agents:
npx skills add visual-engineering-suite -a claude-code -a cursor -a antigravity -y

# Verify installation health immediately:
npm run check-health
    `
  },
  {
    id: "antigravity",
    name: "Google Antigravity",
    badge: "Native Plugin",
    badgeType: "badge-lime",
    description: "Packaged as an official Antigravity plugin with root plugin.json, rules/AGENTS.md, and bundled SVG assets.",
    command: `node bin/ves-pack.js --dest .agents/plugins/visual-engineering-suite`,
    manualInstructions: `
# 1. Package into workspace plugins directory:
node bin/ves-pack.js --dest .agents/plugins/visual-engineering-suite

# 2. Or install loose skills into workspace:
mkdir -p .agents/skills && cp -r skills/* .agents/skills/

# 3. Global configuration directory:
# Windows: %USERPROFILE%\\.gemini\\config\\plugins\\visual-engineering-suite\\
# macOS/Linux: ~/.gemini/config/plugins/visual-engineering-suite/
    `
  },
  {
    id: "claude-code",
    name: "Claude Code",
    badge: "Agent Skills",
    badgeType: "badge-dark",
    description: "Claude Code discovers skills compliant with the Open Agent Skills format in your local project workspace.",
    command: `npx skills add visual-engineering-suite -a claude-code -y`,
    manualInstructions: `
# Workspace Installation:
mkdir -p .claude/skills && cp -r /path/to/visual-engineering-suite/skills/* .claude/skills/

# Personal / User-Wide Installation:
mkdir -p ~/.claude/skills && cp -r /path/to/visual-engineering-suite/skills/* ~/.claude/skills/
    `
  },
  {
    id: "cursor",
    name: "Cursor",
    badge: ".agents Standard",
    badgeType: "badge-dark",
    description: "Cursor indexes skills conforming to the .agents standard inside project repositories.",
    command: `npx skills add visual-engineering-suite -a cursor -y`,
    manualInstructions: `
# Workspace Installation:
mkdir -p .agents/skills && cp -r /path/to/visual-engineering-suite/skills/* .agents/skills/

# User Global Installation:
mkdir -p ~/.cursor/skills && cp -r /path/to/visual-engineering-suite/skills/* ~/.cursor/skills/
    `
  },
  {
    id: "manual",
    name: "Manual Git Clone",
    badge: "Standalone",
    badgeType: "badge-dark",
    description: "Clone directly into your project as a submodule or local dev dependency.",
    command: `git clone ${siteConfig.githubUrl}.git && cd visual-engineering-suite && npm install`,
    manualInstructions: `
# Clone repository
git clone ${siteConfig.githubUrl}.git
cd visual-engineering-suite

# Install core runtime dependencies (pure JS: pngjs + pixelmatch, zero C++ build tools)
npm install

# Run doctor check to verify environment
node bin/ves-doctor.js
    `
  }
];

export function renderInstallationCenter(): string {
  return `
    <section id="install" class="section" aria-labelledby="install-title">
      <div class="container">
        <!-- Section Header -->
        <div class="section-header">
          <div class="eyebrow">Zero-Privilege Distribution</div>
          <h2 id="install-title">Install to Your AI Coding Agent</h2>
          <p>
            Choose your target coding assistant. Skills are self-contained markdown directories with zero mandatory global administrative privileges.
          </p>
        </div>

        <!-- High-Contrast Dark Installation Station -->
        <div class="terminal-installation-frame">
          <!-- Terminal Titlebar & Tabs -->
          <div class="terminal-header">
            <div class="terminal-tab-group" role="tablist" aria-label="Installation Platforms">
              ${INSTALL_METHODS.map((m, idx) => `
                <button type="button" 
                        class="install-tab ${idx === 0 ? 'active' : ''}" 
                        role="tab" 
                        id="tab-install-${m.id}" 
                        aria-selected="${idx === 0 ? 'true' : 'false'}" 
                        aria-controls="panel-install-${m.id}" 
                        data-install-id="${m.id}">
                  <span class="tab-dot"></span>
                  <span class="tab-label">${m.name}</span>
                  ${m.badge ? `<span class="badge ${m.badgeType || 'badge-dark'}">${m.badge}</span>` : ''}
                </button>
              `).join('')}
            </div>
            <div class="terminal-meta-tag">OFFICIAL DISTRIBUTION</div>
          </div>

          <!-- Installation Panels -->
          <div class="terminal-body">
            ${INSTALL_METHODS.map((m, idx) => `
              <div class="install-panel ${idx === 0 ? 'active' : ''}" 
                   id="panel-install-${m.id}" 
                   role="tabpanel" 
                   aria-labelledby="tab-install-${m.id}" 
                   ${idx !== 0 ? 'hidden' : ''}>
                <div class="install-panel-inner">
                  <p class="install-platform-desc">${m.description}</p>

                  <div class="code-box primary-install-box">
                    <span class="code-box-prompt">$</span>
                    <pre><code>${m.command}</code></pre>
                    <button type="button" class="copy-btn" data-copy="${m.command.replace(/"/g, '&quot;')}" aria-label="Copy installation command">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                      <span>Copy</span>
                    </button>
                  </div>

                  <div class="manual-guide-section">
                    <div class="manual-guide-header">
                      <span class="manual-guide-label">MANUAL FILE COPY &amp; TARGET PATHS:</span>
                    </div>
                    <div class="code-box manual-install-box">
                      <pre><code>${m.manualInstructions.trim()}</code></pre>
                    </div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Built-in Doctor Verification Card -->
        <div class="doctor-verification-card" style="margin-top: var(--space-8);">
          <div class="doctor-card-content">
            <div class="doctor-text-group">
              <span class="badge badge-lime">Runtime Verification</span>
              <h3 class="doctor-title">Audit Your System Health with ves-doctor</h3>
              <p class="doctor-desc">
                Detects Node runtime compatibility, audits PNG image processing libraries, verifies agent discovery paths, and alerts on outdated or drifted skill files using SHA-256 checksums.
              </p>
            </div>
            <div class="doctor-command-pill">
              <span class="doctor-prompt-sign">&gt;</span>
              <code>npm run check-health</code>
              <button type="button" class="doctor-copy-btn" data-copy="npm run check-health" aria-label="Copy check-health command">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}
