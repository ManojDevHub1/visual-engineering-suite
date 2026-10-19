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

/**
 * Reusable accessible tablist manager conforming to WAI-ARIA authoring practices.
 * Handles arrow key navigation, Home/End keys, tabindex management, and panel visibility.
 */
function setupAccessibleTablist(
  tabs: NodeListOf<Element>,
  panels: NodeListOf<Element>,
  getPanelId: (tab: Element) => string,
  options?: {
    orientation?: 'horizontal' | 'vertical';
    onSelect?: (tab: HTMLElement, index: number) => void;
  }
) {
  const tabArray = Array.from(tabs) as HTMLElement[];
  const orientation = options?.orientation || 'horizontal';

  function activateTab(index: number, shouldFocus = false) {
    if (index < 0 || index >= tabArray.length) return;

    tabArray.forEach((t, i) => {
      const isTarget = i === index;
      t.classList.toggle('active', isTarget);
      t.setAttribute('aria-selected', String(isTarget));
      t.setAttribute('tabindex', isTarget ? '0' : '-1');

      const panelId = getPanelId(t);
      const panel = document.getElementById(panelId);
      if (panel) {
        (panel as HTMLElement).hidden = !isTarget;
        panel.classList.toggle('active', isTarget);
      }
    });

    if (shouldFocus) {
      tabArray[index].focus();
    }
    if (options?.onSelect) {
      options.onSelect(tabArray[index], index);
    }
  }

  tabArray.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      activateTab(index, false);
    });

    tab.addEventListener('keydown', (e: KeyboardEvent) => {
      let nextIndex = -1;
      const prevKey = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft';
      const nextKey = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight';

      if (e.key === nextKey) {
        nextIndex = (index + 1) % tabArray.length;
      } else if (e.key === prevKey) {
        nextIndex = (index - 1 + tabArray.length) % tabArray.length;
      } else if (e.key === 'Home') {
        nextIndex = 0;
      } else if (e.key === 'End') {
        nextIndex = tabArray.length - 1;
      }

      if (nextIndex !== -1) {
        e.preventDefault();
        activateTab(nextIndex, true);
      }
    });
  });

  return { activateTab, tabArray };
}

function attachEventHandlers() {
  // 1. Mobile Navigation Drawer & Focus Management
  const mobileToggle = document.querySelector('.mobile-toggle') as HTMLButtonElement | null;
  const mobileNav = document.getElementById('mobile-nav');
  const mobileClose = document.querySelector('.mobile-close') as HTMLButtonElement | null;

  function toggleMobile(open: boolean) {
    if (!mobileNav || !mobileToggle) return;
    mobileNav.hidden = !open;
    mobileToggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      const firstLink = mobileNav.querySelector('a, button') as HTMLElement | null;
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

  // Mobile nav focus trap
  mobileNav?.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      const focusables = mobileNav.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // 2. Workflow Stepper Navigation (Accessible Horizontal Tablist)
  const stepNodes = document.querySelectorAll('.step-node');
  const stagePanels = document.querySelectorAll('.stage-panel');
  setupAccessibleTablist(stepNodes, stagePanels, (node) => `step-panel-${node.getAttribute('data-step')}`, {
    orientation: 'horizontal'
  });

  // 4. Skills Directory Search, Empty State & Modal
  const skillSearch = document.getElementById('skill-search') as HTMLInputElement | null;
  const skillCards = document.querySelectorAll('.skill-card');
  const skillCountBadge = document.getElementById('skill-count');
  const skillEmptyState = document.getElementById('skill-empty-state');
  const skillResetBtn = document.getElementById('skill-reset-btn');

  function filterSkills(queryText: string) {
    const q = queryText.trim().toLowerCase();
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

    if (skillEmptyState) {
      skillEmptyState.hidden = visibleCount > 0;
    }
  }

  skillSearch?.addEventListener('input', () => {
    filterSkills(skillSearch.value);
  });

  skillResetBtn?.addEventListener('click', () => {
    if (skillSearch) {
      skillSearch.value = '';
      filterSkills('');
      skillSearch.focus();
    }
  });

  // Skill Detail Modal with Accessible Focus Trap & Restoration
  const modal = document.getElementById('skill-modal');
  const modalTitle = document.getElementById('modal-skill-title');
  const modalBody = document.getElementById('modal-skill-body');
  const modalClose = document.querySelector('.modal-close') as HTMLElement | null;
  const mainContent = document.getElementById('main-content');
  let lastFocusedElement: HTMLElement | null = null;

  function openSkillModal(skillName: string) {
    const skill = CANONICAL_SKILLS.find(s => s.name === skillName);
    if (!skill || !modal || !modalTitle || !modalBody) return;

    lastFocusedElement = document.activeElement as HTMLElement;

    modalTitle.textContent = skill.name;
    modalBody.innerHTML = `
      <div style="display: flex; gap: var(--space-2); margin-bottom: var(--space-3); flex-wrap: wrap;">
        <span class="badge badge-lime">${skill.implementationStatus.toUpperCase()}</span>
        <span class="badge badge-dark">CATEGORY: ${skill.category.toUpperCase()}</span>
      </div>
      <p style="margin-bottom: var(--space-4); font-size: 1.05rem; color: var(--text-dark-primary);">${skill.description}</p>
      
      <div class="code-box" style="margin-bottom: var(--space-4);">
        <pre><code>Canonical Path: ${skill.path}</code></pre>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-4); margin-bottom: var(--space-4);">
        <div>
          <h4 style="font-size: 0.85rem; color: var(--electric-lime); margin-bottom: var(--space-2);">REQUIRED INPUTS</h4>
          <ul style="font-size: 0.82rem; padding-left: var(--space-4); margin: 0; color: var(--text-dark-secondary);">
            ${skill.requiredInputs?.map((inp: string) => `<li>${inp}</li>`).join('') || '<li>Standard visual context</li>'}
          </ul>
        </div>
        <div>
          <h4 style="font-size: 0.85rem; color: var(--electric-lime); margin-bottom: var(--space-2);">EXPECTED OUTPUTS</h4>
          <ul style="font-size: 0.82rem; padding-left: var(--space-4); margin: 0; color: var(--text-dark-secondary);">
            ${skill.expectedOutputs?.map((out: string) => `<li>${out}</li>`).join('') || '<li>Verified artifact</li>'}
          </ul>
        </div>
      </div>

      <h4>Helper Scripts (${skill.scripts.length})</h4>
      <div class="chip-group" style="margin-bottom: var(--space-4);">
        ${skill.scripts.length > 0 ? skill.scripts.map((s: string) => `<span class="chip"><code>${s}</code></span>`).join('') : '<span class="text-muted">None</span>'}
      </div>

      <h4>Reference Schemas & Guides (${skill.references.length})</h4>
      <div class="chip-group">
        ${skill.references.map((r: string) => `<span class="chip chip-accent">${r}</span>`).join('')}
      </div>
    `;

    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    if (mainContent) mainContent.setAttribute('aria-hidden', 'true');
    modalClose?.focus();
    announceToScreenReader(`Viewing specification modal for skill ${skill.name}`);
  }

  function closeSkillModal() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.style.overflow = '';
    if (mainContent) mainContent.removeAttribute('aria-hidden');
    lastFocusedElement?.focus();
    lastFocusedElement = null;
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

  // Modal focus trap for keyboard users
  modal?.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      const focusables = modal.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // 5. Installation Platform Tabs (Accessible Horizontal Tablist)
  const installTabs = document.querySelectorAll('.install-tab');
  const installPanels = document.querySelectorAll('.install-panel');
  setupAccessibleTablist(installTabs, installPanels, (tab) => `panel-install-${tab.getAttribute('data-install-id')}`, {
    orientation: 'horizontal'
  });

  // 6. Documentation Tabs (Accessible Vertical Tablist)
  const docsTabs = document.querySelectorAll('.docs-nav-item');
  const docsPanels = document.querySelectorAll('.docs-panel');
  setupAccessibleTablist(docsTabs, docsPanels, (tab) => `panel-doc-${tab.getAttribute('data-doc-id')}`, {
    orientation: 'vertical'
  });

  // 7. Clipboard Copy Buttons with Audio / Visual Feedback
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

  // 8. Deep Linking & Hash Routing Support
  function handleHashRoute() {
    const hash = window.location.hash.slice(1);
    if (!hash) return;

    if (hash.startsWith('docs/')) {
      const docId = hash.replace('docs/', '');
      const tab = document.querySelector(`.docs-nav-item[data-doc-id="${docId}"]`) as HTMLElement | null;
      if (tab) {
        tab.click();
        document.getElementById('docs')?.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (hash.startsWith('install/')) {
      const installId = hash.replace('install/', '');
      const tab = document.querySelector(`.install-tab[data-install-id="${installId}"]`) as HTMLElement | null;
      if (tab) {
        tab.click();
        document.getElementById('install')?.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (hash.startsWith('workflow/')) {
      const stepId = hash.replace('workflow/', '');
      const node = document.querySelector(`.step-node[data-step="${stepId}"]`) as HTMLElement | null;
      if (node) {
        node.click();
        document.getElementById('workflow')?.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (hash.startsWith('skills/')) {
      const skillName = hash.replace('skills/', '');
      openSkillModal(skillName);
    }
  }

  window.addEventListener('hashchange', handleHashRoute);
  // Execute after initial layout rendering
  setTimeout(handleHashRoute, 80);
}

// Auto-run if running in browser
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
}
