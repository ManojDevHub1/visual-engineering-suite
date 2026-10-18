import { renderNavbar } from './components/Navbar.js';
import { renderHero } from './components/Hero.js';
import { renderWorkflow } from './components/Workflow.js';
import { renderFeatures } from './components/Features.js';
import { renderSkillsDirectory } from './components/SkillsDirectory.js';
import { renderInstallationCenter } from './components/InstallationCenter.js';
import { renderCompatibilityMatrix } from './components/CompatibilityMatrix.js';
import { renderBenchmarks } from './components/Benchmarks.js';
import { renderDocsCenter } from './components/DocsCenter.js';
import { renderCommunity } from './components/Community.js';
import { renderFooter } from './components/Footer.js';
import { CANONICAL_SKILLS } from './data/skills-data.js';

// Assemble complete DOM structure
export function initApp() {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    ${renderNavbar()}
    <main id="main-content">
      ${renderHero()}
      ${renderWorkflow()}
      ${renderFeatures()}
      ${renderSkillsDirectory()}
      ${renderInstallationCenter()}
      ${renderCompatibilityMatrix()}
      ${renderBenchmarks()}
      ${renderDocsCenter()}
      ${renderCommunity()}
    </main>
    ${renderFooter()}

    <!-- Screen Reader Live Region for Announcements -->
    <div id="sr-announcements" class="sr-only" aria-live="polite" aria-atomic="true"></div>
  `;

  attachEventHandlers();
}

function announceToScreenReader(message: string) {
  const srEl = document.getElementById('sr-announcements');
  if (srEl) {
    srEl.textContent = '';
    setTimeout(() => { srEl.textContent = message; }, 50);
  }
}

function attachEventHandlers() {
  // 1. Mobile Navigation Toggle
  const mobileToggle = document.querySelector('.mobile-toggle') as HTMLButtonElement | null;
  const mobileNav = document.getElementById('mobile-nav');
  const mobileClose = document.querySelector('.mobile-close') as HTMLButtonElement | null;

  function toggleMobile(open: boolean) {
    if (!mobileNav || !mobileToggle) return;
    mobileNav.hidden = !open;
    mobileToggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      const firstLink = mobileNav.querySelector('a') as HTMLElement | null;
      firstLink?.focus();
    } else {
      mobileToggle.focus();
    }
  }

  mobileToggle?.addEventListener('click', () => toggleMobile(mobileNav?.hidden ?? true));
  mobileClose?.addEventListener('click', () => toggleMobile(false));

  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => toggleMobile(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav && !mobileNav.hidden) {
      toggleMobile(false);
    }
  });

  // 2. Hero Visual Tab Switcher
  const visualTabs = document.querySelectorAll('.visual-tab');
  const visualViews = document.querySelectorAll('.visual-view');

  visualTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-target');
      visualTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      visualViews.forEach(view => {
        const isTarget = view.id === `view-${target}`;
        (view as HTMLElement).hidden = !isTarget;
        view.classList.toggle('active', isTarget);
      });
    });
  });

  // 2b. Interactive Split Comparison Slider
  const sliderInput = document.getElementById('split-slider-range') as HTMLInputElement | null;
  const sliderOverlay = document.getElementById('slider-overlay');
  const sliderHandle = document.getElementById('slider-handle');

  if (sliderInput && sliderOverlay && sliderHandle) {
    sliderInput.addEventListener('input', () => {
      const val = sliderInput.value;
      sliderOverlay.style.width = `${val}%`;
      sliderHandle.style.left = `${val}%`;
    });
  }

  // 3. Workflow Stepper Navigation
  const stepNodes = document.querySelectorAll('.step-node');
  const stagePanels = document.querySelectorAll('.stage-panel');

  stepNodes.forEach((node, index) => {
    node.addEventListener('click', () => {
      const stepId = node.getAttribute('data-step');
      stepNodes.forEach(n => {
        n.classList.remove('active');
        n.setAttribute('aria-selected', 'false');
      });
      node.classList.add('active');
      node.setAttribute('aria-selected', 'true');

      stagePanels.forEach(p => {
        const isTarget = p.id === `step-panel-${stepId}`;
        (p as HTMLElement).hidden = !isTarget;
        p.classList.toggle('active', isTarget);
      });
    });

    // Keyboard navigation (Left / Right Arrow)
    node.addEventListener('keydown', (e: any) => {
      let targetIndex = -1;
      if (e.key === 'ArrowRight') targetIndex = (index + 1) % stepNodes.length;
      if (e.key === 'ArrowLeft') targetIndex = (index - 1 + stepNodes.length) % stepNodes.length;

      if (targetIndex !== -1) {
        e.preventDefault();
        const targetNode = stepNodes[targetIndex] as HTMLButtonElement;
        targetNode.focus();
        targetNode.click();
      }
    });
  });

  // 4. Skills Directory Search & Modal
  const skillSearch = document.getElementById('skill-search') as HTMLInputElement | null;
  const skillCards = document.querySelectorAll('.skill-card');
  const skillCountBadge = document.getElementById('skill-count');

  skillSearch?.addEventListener('input', () => {
    const q = skillSearch.value.trim().toLowerCase();
    let visibleCount = 0;

    skillCards.forEach(card => {
      const name = card.getAttribute('data-skill-name') || '';
      const desc = card.getAttribute('data-skill-desc') || '';
      const matches = name.includes(q) || desc.includes(q);
      (card as HTMLElement).style.display = matches ? '' : 'none';
      if (matches) visibleCount++;
    });

    if (skillCountBadge) {
      skillCountBadge.textContent = `${visibleCount} of ${CANONICAL_SKILLS.length} skills`;
    }
  });

  // Skill Detail Modal
  const modal = document.getElementById('skill-modal');
  const modalTitle = document.getElementById('modal-skill-title');
  const modalBody = document.getElementById('modal-skill-body');
  const modalClose = document.querySelector('.modal-close');

  function openSkillModal(skillName: string) {
    const skill = CANONICAL_SKILLS.find(s => s.name === skillName);
    if (!skill || !modal || !modalTitle || !modalBody) return;

    modalTitle.textContent = skill.name;
    modalBody.innerHTML = `
      <p style="margin-bottom: var(--space-4); font-size: 1.05rem;">${skill.description}</p>
      <div class="code-box" style="margin-bottom: var(--space-4);">
        <pre><code>Canonical Path: ${skill.path}</code></pre>
      </div>

      <h4>Helper Scripts (${skill.scripts.length})</h4>
      <div class="chip-group" style="margin-bottom: var(--space-4);">
        ${skill.scripts.length > 0 ? skill.scripts.map(s => `<span class="chip"><code>${s}</code></span>`).join('') : '<span class="text-muted">None</span>'}
      </div>

      <h4>Reference Schemas & Guides (${skill.references.length})</h4>
      <div class="chip-group">
        ${skill.references.map(r => `<span class="chip chip-accent">${r}</span>`).join('')}
      </div>
    `;

    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    (modalClose as HTMLElement)?.focus();
  }

  function closeSkillModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.skill-detail-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-skill-target');
      if (target) openSkillModal(target);
    });
  });

  modalClose?.addEventListener('click', closeSkillModal);
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeSkillModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.hidden) {
      closeSkillModal();
    }
  });

  // 5. Installation Platform Tabs
  const installTabs = document.querySelectorAll('.install-tab');
  const installPanels = document.querySelectorAll('.install-panel');

  installTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const installId = tab.getAttribute('data-install-id');
      installTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      installPanels.forEach(p => {
        const isTarget = p.id === `panel-install-${installId}`;
        (p as HTMLElement).hidden = !isTarget;
        p.classList.toggle('active', isTarget);
      });
    });
  });

  // 6. Documentation Tabs
  const docsTabs = document.querySelectorAll('.docs-nav-item');
  const docsPanels = document.querySelectorAll('.docs-panel');

  docsTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const docId = tab.getAttribute('data-doc-id');
      docsTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      docsPanels.forEach(p => {
        const isTarget = p.id === `panel-doc-${docId}`;
        (p as HTMLElement).hidden = !isTarget;
        p.classList.toggle('active', isTarget);
      });
    });
  });

  // 7. Clipboard Copy Buttons
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const textToCopy = btn.getAttribute('data-copy') || '';
      if (!textToCopy) return;

      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(textToCopy);
        } else {
          // Fallback textarea
          const ta = document.createElement('textarea');
          ta.value = textToCopy;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
        }

        const originalHtml = btn.innerHTML;
        btn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <span style="color: #10B981;">Copied!</span>
        `;
        announceToScreenReader('Command copied to clipboard');

        setTimeout(() => {
          btn.innerHTML = originalHtml;
        }, 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    });
  });
}

// Auto-run if running in browser
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initApp);
}
