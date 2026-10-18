import { CANONICAL_SKILLS } from '../data/skills-data.js';

export function renderSkillsDirectory(): string {
  return `
    <section id="skills" class="section" aria-labelledby="skills-title">
      <div class="container">
        <div class="section-header">
          <div class="badge badge-purple" style="margin-bottom: var(--space-3);">Canonical Skills Directory</div>
          <h2 id="skills-title">7 Specialist Visual Engineering Skills</h2>
          <p>
            Compliant with the Open Agent Skills specification. Installable as standalone skills, via the Vercel Skills CLI, or bundled as a native Google Antigravity plugin.
          </p>

          <!-- Search / Filter input -->
          <div class="skills-search-wrapper" style="margin-top: var(--space-6);">
            <div class="search-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input type="text" id="skill-search" placeholder="Filter skills by keyword (e.g. diff, tokens, wcag, playwright)..." aria-label="Filter skills" />
            </div>
            <span id="skill-count" class="badge" style="align-self: center;">${CANONICAL_SKILLS.length} of ${CANONICAL_SKILLS.length} skills</span>
          </div>
        </div>

        <div class="skills-grid" id="skills-grid">
          ${CANONICAL_SKILLS.map((skill) => `
            <div class="card skill-card" data-skill-name="${skill.name.toLowerCase()}" data-skill-desc="${skill.description.toLowerCase()}">
              <div class="skill-header">
                <div>
                  <h3 class="skill-name"><code>${skill.name}</code></h3>
                  <span class="badge badge-green" style="font-size: 0.65rem; margin-top: 4px;">Canonical Spec</span>
                </div>
              </div>

              <p class="skill-description">${skill.description}</p>

              <div class="skill-meta-group">
                <div class="skill-meta-block">
                  <span class="meta-label">Helper Scripts (${skill.scripts.length}):</span>
                  <div class="chip-group">
                    ${skill.scripts.length > 0 ? skill.scripts.map(s => `<span class="chip"><code>${s}</code></span>`).join('') : '<span class="text-muted" style="font-size: 0.8rem;">None</span>'}
                  </div>
                </div>

                <div class="skill-meta-block">
                  <span class="meta-label">Reference Schemas (${skill.references.length}):</span>
                  <div class="chip-group">
                    ${skill.references.map(r => `<span class="chip chip-accent">${r}</span>`).join('')}
                  </div>
                </div>
              </div>

              <div class="skill-footer">
                <span class="skill-source-path">${skill.path}</span>
                <button type="button" class="btn btn-secondary btn-sm skill-detail-btn" data-skill-target="${skill.name}">View Details</button>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Detail Modal Container (Controlled via JS) -->
        <div id="skill-modal" class="modal-overlay" hidden role="dialog" aria-modal="true" aria-labelledby="modal-skill-title">
          <div class="modal-card card">
            <div class="modal-header">
              <div>
                <span class="badge badge-purple" id="modal-skill-badge">Specialist Skill</span>
                <h3 id="modal-skill-title" style="margin-top: 8px;"></h3>
              </div>
              <button type="button" class="modal-close" aria-label="Close modal">&times;</button>
            </div>
            <div class="modal-body" id="modal-skill-body"></div>
          </div>
        </div>
      </div>
    </section>
  `;
}
