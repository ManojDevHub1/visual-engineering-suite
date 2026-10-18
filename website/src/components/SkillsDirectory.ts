import { CANONICAL_SKILLS } from '../data/skills-data.js';

export function renderSkillsDirectory(): string {
  return `
    <section id="skills" class="section" aria-labelledby="skills-title">
      <div class="container">
        <!-- Section Header -->
        <div class="section-header">
          <div class="eyebrow">Canonical Engineering Toolkit</div>
          <h2 id="skills-title">7 Modular Specialist Skills</h2>
          <p>
            Compliant with the Open Agent Skills specification. Installable across Google Antigravity, Claude Code, Cursor, and Agent Skills CLI.
          </p>

          <!-- Search & Filter Controls -->
          <div class="skills-filter-strip">
            <div class="skills-search-bar">
              <span class="search-prompt">&gt;</span>
              <input type="text" id="skill-search" placeholder="Filter skills (e.g. diff, tokens, wcag, playwright, refinement)..." aria-label="Filter skills" />
            </div>
            <span id="skill-count" class="badge badge-dark">${CANONICAL_SKILLS.length} of ${CANONICAL_SKILLS.length} skills</span>
          </div>
        </div>

        <!-- Asymmetric Toolkit Grid -->
        <div class="skills-editorial-grid" id="skills-grid">
          ${CANONICAL_SKILLS.map((skill, index) => {
            const isFeatured = index === 0 || index === 4 || index === 6;
            return `
              <div class="skill-editorial-card skill-card ${isFeatured ? 'skill-card-featured' : ''}" 
                   data-skill-name="${skill.name.toLowerCase()}" 
                   data-skill-desc="${skill.description.toLowerCase()}">
                <div class="skill-card-top">
                  <span class="skill-index-tag">${String(index + 1).padStart(2, '0')}</span>
                  <span class="badge badge-lime">Canonical</span>
                </div>

                <div class="skill-title-block">
                  <h3 class="skill-name"><code>${skill.name}</code></h3>
                  <p class="skill-description">${skill.description}</p>
                </div>

                <div class="skill-specs-box">
                  <div class="spec-row">
                    <span class="spec-label">SCRIPTS:</span>
                    <div class="spec-chips">
                      ${skill.scripts.length > 0 ? skill.scripts.map(s => `<span class="chip-code"><code>${s}</code></span>`).join('') : '<span class="text-faint">None</span>'}
                    </div>
                  </div>
                  <div class="spec-row">
                    <span class="spec-label">REFERENCES:</span>
                    <div class="spec-chips">
                      ${skill.references.map(r => `<span class="chip-ref">${r}</span>`).join('')}
                    </div>
                  </div>
                </div>

                <div class="skill-card-footer">
                  <span class="skill-source-path">skills/${skill.name}</span>
                  <button type="button" class="btn btn-secondary btn-sm skill-detail-btn" data-skill-target="${skill.name}">
                    <span>Inspect Spec</span>
                    <span aria-hidden="true">&rarr;</span>
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Detail Modal Container (Controlled via JS) -->
        <div id="skill-modal" class="modal-overlay" hidden role="dialog" aria-modal="true" aria-labelledby="modal-skill-title">
          <div class="modal-card card card-dark">
            <div class="modal-header">
              <div class="modal-title-wrap">
                <span class="badge badge-lime" id="modal-skill-badge">Canonical Skill Spec</span>
                <h3 id="modal-skill-title" class="modal-skill-heading"></h3>
              </div>
              <button type="button" class="modal-close" aria-label="Close skill modal">&times;</button>
            </div>
            <div class="modal-body" id="modal-skill-body"></div>
          </div>
        </div>
      </div>
    </section>
  `;
}
