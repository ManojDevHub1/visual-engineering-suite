import { siteConfig } from '../site.config.js';

export const INSTALL_METHODS = [
  {
    id: "skills-cli",
    name: "Skills CLI (Multi-Agent)",
    badge: "Recommended",
    badgeType: "badge-green",
    description: "Install all skills simultaneously across Claude Code, Cursor, and Google Antigravity using the open Vercel Skills CLI.",
    command: `npx skills add visual-engineering-suite --all -y`,
    manualInstructions: `
# Install specifically to target agents:
npx skills add visual-engineering-suite -a claude-code -a cursor -a antigravity -y

# Verify installation health immediately:
npm run check-health
    `
  },
  {
    id: "antigravity",
    name: "Google Antigravity",
    badge: "Native Plugin",
    badgeType: "badge-purple",
    description: "Packaged as a native Antigravity plugin with root plugin.json, rules/AGENTS.md, and bundled SVG assets.",
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
    badgeType: "",
    description: "Claude Code automatically discovers skills compliant with the Open Agent Skills format in your workspace.",
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
    badgeType: "",
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
    badge: "Zero Package Manager",
    badgeType: "",
    description: "Clone directly into your project as a submodule or local dev dependency.",
    command: `git clone ${siteConfig.githubUrl}.git && cd visual-engineering-suite && npm install`,
    manualInstructions: `
# Clone repository
git clone ${siteConfig.githubUrl}.git
cd visual-engineering-suite

# Install dependencies (pure JS: pngjs + pixelmatch, zero C++ build tools)
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
        <div class="section-header">
          <div class="badge badge-purple" style="margin-bottom: var(--space-3);">Installation Center</div>
          <h2 id="install-title">Install to Your AI Coding Agent</h2>
          <p>
            Choose your preferred platform or package manager. Skills are self-contained, portable, and require zero global administrative privileges.
          </p>
        </div>

        <!-- Installation Agent Tabs -->
        <div class="install-tabs" role="tablist" aria-label="Installation Platforms">
          ${INSTALL_METHODS.map((m, idx) => `
            <button type="button" 
                    class="install-tab ${idx === 0 ? 'active' : ''}" 
                    role="tab" 
                    id="tab-install-${m.id}" 
                    aria-selected="${idx === 0 ? 'true' : 'false'}" 
                    aria-controls="panel-install-${m.id}" 
                    data-install-id="${m.id}">
              <span>${m.name}</span>
              ${m.badge ? `<span class="badge ${m.badgeType || ''}" style="font-size: 0.6rem; padding: 1px 6px;">${m.badge}</span>` : ''}
            </button>
          `).join('')}
        </div>

        <!-- Installation Panels -->
        <div class="install-content">
          ${INSTALL_METHODS.map((m, idx) => `
            <div class="install-panel ${idx === 0 ? 'active' : ''}" 
                 id="panel-install-${m.id}" 
                 role="tabpanel" 
                 aria-labelledby="tab-install-${m.id}" 
                 ${idx !== 0 ? 'hidden' : ''}>
              <div class="card install-card">
                <p class="install-desc">${m.description}</p>

                <div class="code-box install-code-box">
                  <pre><code>${m.command}</code></pre>
                  <button type="button" class="copy-btn" data-copy="${m.command.replace(/"/g, '&quot;')}" aria-label="Copy installation command">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    <span>Copy</span>
                  </button>
                </div>

                <div class="manual-guide-wrapper">
                  <span class="manual-guide-title">Manual Installation & Alternatives:</span>
                  <div class="code-box manual-code-box">
                    <pre><code>${m.manualInstructions.trim()}</code></pre>
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Post-Install Health Check Banner -->
        <div class="card doctor-banner" style="margin-top: var(--space-8);">
          <div class="doctor-banner-content">
            <div>
              <div class="badge badge-green" style="margin-bottom: var(--space-2);">Built-in Verification</div>
              <h3>Verify Your Installation with ves-doctor</h3>
              <p>Run our diagnostic tool to verify Node runtime compatibility, check core dependencies, inspect agent discovery folders, and catch drifted or outdated skill copies.</p>
            </div>
            <div class="doctor-code">
              <code>npm run check-health</code>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}
