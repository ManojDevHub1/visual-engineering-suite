export const COMPATIBILITY_DATA = [
  {
    agent: "Google Antigravity",
    scope: "Workspace & Global",
    mechanism: "Native Plugin (`plugin.json`) / Skills CLI",
    execution: "Native terminal (`run_command`)",
    level: "Level 6: Benchmark Completed",
    badgeType: "badge-green",
    statusText: "Directly Verified",
    testedVersion: "v2.0.0",
    testDate: "2026-10-18",
    notes: "Directly executed and verified in Antigravity session: full refinement loop, diff maps, tests, and run persistence verified on disk."
  },
  {
    agent: "Claude Code",
    scope: "Workspace (`.claude/skills/`)",
    mechanism: "Skills CLI / Manual copy",
    execution: "Bash tool execution",
    level: "Level 3: Installation Verified",
    badgeType: "badge-purple",
    statusText: "Installation Verified",
    testedVersion: "Latest",
    testDate: "2026-10-18",
    notes: "Validated against Anthropic Agent Skills spec. Disk placement tested via `npx skills add . -a claude-code`. Live autonomous invocation documented."
  },
  {
    agent: "Cursor",
    scope: "Workspace (`.agents/skills/`)",
    mechanism: "Skills CLI / Manual copy",
    execution: "Terminal tool execution",
    level: "Level 3: Installation Verified",
    badgeType: "badge-purple",
    statusText: "Installation Verified",
    testedVersion: "Latest",
    testDate: "2026-10-18",
    notes: "Validated against open `.agents` standard. Disk placement tested via `npx skills add . -a cursor`. Live autonomous invocation documented."
  },
  {
    agent: "Vercel Skills CLI",
    scope: "Dynamic Multi-Agent",
    mechanism: "CLI (`npx skills add <source>`)",
    execution: "Node.js installer",
    level: "Level 3: Installation Verified",
    badgeType: "badge-green",
    statusText: "Directly Verified",
    testedVersion: "v1.0+",
    testDate: "2026-10-18",
    notes: "Directly verified executing `npx skills add .` to distribute skills to `.agents/skills` and `.claude/skills`."
  }
];

export function renderCompatibilityMatrix(): string {
  return `
    <section id="compatibility" class="section" aria-labelledby="compat-title">
      <div class="container">
        <div class="section-header">
          <div class="badge badge-purple" style="margin-bottom: var(--space-3);">Verification Standards</div>
          <h2 id="compat-title">Multi-Agent Compatibility Matrix</h2>
          <p>
            We strictly differentiate empirical in-environment verification from documented platform specifications. No artificial "works everywhere" claims.
          </p>
        </div>

        <div class="matrix-table-wrapper card">
          <table class="compat-table">
            <thead>
              <tr>
                <th scope="col">Agent Platform</th>
                <th scope="col">Installation Path</th>
                <th scope="col">Execution Method</th>
                <th scope="col">Verification Tier</th>
                <th scope="col">Tested Version</th>
                <th scope="col">Verification Notes</th>
              </tr>
            </thead>
            <tbody>
              ${COMPATIBILITY_DATA.map(row => `
                <tr>
                  <td>
                    <strong>${row.agent}</strong>
                  </td>
                  <td><code>${row.scope}</code></td>
                  <td>${row.execution}</td>
                  <td>
                    <span class="badge ${row.badgeType}" style="font-size: 0.7rem;">${row.level}</span>
                  </td>
                  <td>${row.testedVersion} (${row.testDate})</td>
                  <td class="text-muted" style="font-size: 0.85rem;">${row.notes}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- 6 Levels Guide -->
        <div class="card verification-tiers-guide" style="margin-top: var(--space-8);">
          <h3>The 6 Verification Levels Explained</h3>
          <div class="grid-3" style="margin-top: var(--space-4);">
            <div class="tier-card">
              <span class="tier-badge">Level 1</span>
              <h4>Format Validated</h4>
              <p>Frontmatter, schema, and directory layout pass automated validators against target platform specs.</p>
            </div>
            <div class="tier-card">
              <span class="tier-badge">Level 2</span>
              <h4>Discovery Verified</h4>
              <p>Platform discovery scanner (Connect RPC, skill catalog) is observed indexing the skills by name.</p>
            </div>
            <div class="tier-card">
              <span class="tier-badge">Level 3</span>
              <h4>Installation Verified</h4>
              <p>CLI or plugin installers have been executed and successfully placed files in target paths.</p>
            </div>
            <div class="tier-card">
              <span class="tier-badge">Level 4</span>
              <h4>Invocation Verified</h4>
              <p>Agent is directly observed parsing and activating the skill during an interactive session.</p>
            </div>
            <div class="tier-card">
              <span class="tier-badge">Level 5</span>
              <h4>Task Execution</h4>
              <p>Agent completes an individual visual engineering task (e.g. diffing, token mapping) using the skill.</p>
            </div>
            <div class="tier-card">
              <span class="tier-badge">Level 6</span>
              <h4>Benchmark Completed</h4>
              <p>Autonomous closed-loop refinement loop runs to completion with verified artifacts on disk.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}
