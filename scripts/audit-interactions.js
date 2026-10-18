import { chromium } from 'playwright';

async function audit() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => pageErrors.push(err.message));

  console.log('--- 1. Page Load & Basic State ---');
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
  const title = await page.title();
  console.log('Title:', title);

  console.log('--- 2. Keyboard Navigation in Hero Tabs ---');
  const heroTabDiff = await page.$('#tab-diff');
  await heroTabDiff.focus();
  await page.keyboard.press('ArrowRight');
  const heroTabSliderSelected = await page.$eval('#tab-slider', el => el.getAttribute('aria-selected'));
  console.log('Hero tab ArrowRight selects slider:', heroTabSliderSelected === 'true');

  console.log('--- 3. Keyboard Navigation in Install Tabs ---');
  const installTab1 = await page.$('#tab-install-skills-cli');
  await installTab1.focus();
  await page.keyboard.press('ArrowRight');
  const installTab2Selected = await page.$eval('#tab-install-antigravity', el => el.getAttribute('aria-selected'));
  console.log('Install tab ArrowRight selects antigravity:', installTab2Selected === 'true');

  console.log('--- 4. Keyboard Navigation in Docs Tabs ---');
  const docTab1 = await page.$('#tab-doc-getting-started');
  await docTab1.focus();
  await page.keyboard.press('ArrowDown');
  const docTab2Selected = await page.$eval('#tab-doc-cli-tools', el => el.getAttribute('aria-selected'));
  console.log('Docs tab ArrowDown selects cli-tools:', docTab2Selected === 'true');

  console.log('--- 5. Modal Focus Trap & Restoration ---');
  const firstSkillBtn = await page.$('.skill-detail-btn');
  await firstSkillBtn.focus();
  await firstSkillBtn.click();
  
  const modalVisible = await page.$eval('#skill-modal', el => !el.hidden);
  console.log('Modal visible after click:', modalVisible);

  // Check if active element is inside modal
  const activeInsideModal = await page.evaluate(() => {
    const modal = document.getElementById('skill-modal');
    return modal ? modal.contains(document.activeElement) : false;
  });
  console.log('Active element inside modal upon open:', activeInsideModal);

  // Tab multiple times to check if focus escapes modal
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  const stillInsideModal = await page.evaluate(() => {
    const modal = document.getElementById('skill-modal');
    return modal ? modal.contains(document.activeElement) : false;
  });
  console.log('Focus stays trapped inside modal on Tab:', stillInsideModal);

  // Close with Escape
  await page.keyboard.press('Escape');
  const modalClosed = await page.$eval('#skill-modal', el => el.hidden);
  console.log('Modal closed after Escape:', modalClosed);

  const focusRestoredToBtn = await page.evaluate((btnClass) => {
    const btn = document.querySelector('.skill-detail-btn');
    return document.activeElement === btn;
  });
  console.log('Focus restored to originating button:', focusRestoredToBtn);

  console.log('--- 6. Split Slider aria-valuetext ---');
  const sliderValueText = await page.$eval('#split-slider-range', el => el.getAttribute('aria-valuetext'));
  console.log('Initial slider aria-valuetext:', sliderValueText);

  console.log('--- 7. Deep Linking / Hash Navigation ---');
  await page.goto('http://localhost:4173/#docs/troubleshooting');
  const troubleTabActive = await page.$eval('#tab-doc-troubleshooting', el => el.classList.contains('active')).catch(() => false);
  const troublePanelActive = await page.$eval('#panel-doc-troubleshooting', el => !el.hidden).catch(() => false);
  console.log('Deep link to #docs/troubleshooting activates tab:', troubleTabActive, 'and panel:', troublePanelActive);

  console.log('--- 7b. Search Empty State & Reset Button ---');
  await page.fill('#skill-search', 'xyznonexistentskillquery');
  const emptyStateVisible = await page.$eval('#skill-empty-state', el => !el.hidden);
  console.log('Empty state shown when 0 results:', emptyStateVisible);
  await page.click('#skill-reset-btn');
  const emptyStateHiddenAfterReset = await page.$eval('#skill-empty-state', el => el.hidden);
  const searchInputCleared = await page.$eval('#skill-search', el => el.value === '');
  console.log('Empty state hidden after reset:', emptyStateHiddenAfterReset, 'and input cleared:', searchInputCleared);

  console.log('--- 8. Console & Page Errors ---');
  console.log('Console Errors:', consoleErrors);
  console.log('Page Errors:', pageErrors);

  await browser.close();
}

audit().catch(err => {
  console.error('Audit script failed:', err);
  process.exit(1);
});
