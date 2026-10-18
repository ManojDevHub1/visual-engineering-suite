import { COMPATIBILITY_DATA as RAW_COMPATIBILITY_DATA } from '../data/compatibility-data.js';

export const COMPATIBILITY_DATA = RAW_COMPATIBILITY_DATA.map(item => ({
  ...item,
  agent: item.agentName,
  level: item.highestTier,
  execution: item.executionMethod,
  testDate: item.testedAt,
  notes: item.evidence
}));

export function renderCompatibilityMatrix(): string {
  return `
    <section id="compatibility" class="section" aria-labelledby="compat-title">
      <div class="container">
        <!-- Section Header -->
        <div class="section-header">
          <div class="eyebrow">Integrity &amp; Compatibility</div>
          <h2 id="compat-title">Multi-Agent Verification Standards</h2>
          <p>
            We strictly differentiate empirical in-environment verification from documented platform specifications. No artificial "works everywhere" claims.
          </p>
        </div>

        <div class="matrix-table-wrapper table-responsive card">
          <div class="table-scroll-hint" aria-hidden="true">&larr; Swipe horizontally to inspect all columns &rarr;</div>
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
                    <strong>${row.agentName}</strong>
                    <div style="font-size: 0.75rem; color: var(--ink-muted); margin-top: 2px;">
                      Status: <span class="badge ${row.badgeType}" style="font-size: 0.65rem; padding: 1px 5px;">${row.overallStatus}</span>
                    </div>
                  </td>
                  <td><code>${row.scope}</code></td>
                  <td>${row.executionMethod}</td>
                  <td>
                    <span class="badge ${row.badgeType}">${row.highestTier}</span>
                  </td>
                  <td>${row.testedVersion} (${row.testedAt})</td>
                  <td class="text-secondary" style="font-size: 0.88rem;">${row.evidence}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- 6 Levels Guide -->
        <div class="card verification-tiers-guide" style="margin-top: var(--space-8);">
          <div class="card-eyebrow">VERIFICATION FRAMEWORK</div>
          <h3>The 6 Empirical Verification Levels</h3>
          <div class="grid-3" style="margin-top: var(--space-6);">
            <div class="tier-card">
              <span class="tier-badge">Tier 1</span>
              <h4>Format Validated</h4>
              <p>Frontmatter, schema, and directory layout pass automated validators against target platform specs.</p>
            </div>
            <div class="tier-card">
              <span class="tier-badge">Tier 2</span>
              <h4>Discovery Verified</h4>
              <p>Platform discovery scanner (Connect RPC, skill catalog) is observed indexing the skills by name.</p>
            </div>
            <div class="tier-card">
              <span class="tier-badge">Tier 3</span>
              <h4>Installation Verified</h4>
              <p>CLI or plugin installers have been executed and successfully placed files in target paths.</p>
            </div>
            <div class="tier-card">
              <span class="tier-badge">Tier 4</span>
              <h4>Invocation Verified</h4>
              <p>Agent is directly observed parsing and activating the skill during an interactive session.</p>
            </div>
            <div class="tier-card">
              <span class="tier-badge">Tier 5</span>
              <h4>Task Execution</h4>
              <p>Agent completes an individual visual engineering task (e.g. diffing, token mapping) using the skill.</p>
            </div>
            <div class="tier-card">
              <span class="tier-badge">Tier 6</span>
              <h4>Benchmark Completed</h4>
              <p>Autonomous closed-loop refinement loop runs to completion with verified artifacts on disk.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}
