import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const VIEWPORTS = [
  { name: '1440x900', width: 1440, height: 900, isMobile: false },
  { name: '1024x768', width: 1024, height: 768, isMobile: false },
  { name: '768x1024', width: 768, height: 1024, isMobile: false },
  { name: '390x844', width: 390, height: 844, isMobile: true },
  { name: '375x812', width: 375, height: 812, isMobile: true }
];

const OUTPUT_DIR = path.resolve('tests/output/verified-viewports');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function verify() {
  const browser = await chromium.launch();
  const results = {
    screenshots: [],
    interactions: {},
    contrastCheck: {},
    layoutAudit: {}
  };

  // 1. Capture Viewport Screenshots & Check Layout
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.isMobile,
      hasTouch: vp.isMobile,
      deviceScaleFactor: 2
    });
    const page = await context.newPage();
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });

    const foldPath = path.join(OUTPUT_DIR, `verified-${vp.name}-fold.png`);
    await page.screenshot({ path: foldPath, fullPage: false });

    const fullPath = path.join(OUTPUT_DIR, `verified-${vp.name}-full.png`);
    await page.screenshot({ path: fullPath, fullPage: true });

    results.screenshots.push({ viewport: vp.name, fold: foldPath, full: fullPath });

    // Inspect layout metrics at this viewport
    const metrics = await page.evaluate(() => {
      const copyBtn = document.querySelector('.hero-copy-btn');
      const brand = document.querySelector('.brand');
      const navLink = document.querySelector('.nav-link');
      const tab = document.querySelector('.visual-tab');
      const card = document.querySelector('.discrepancy-callout-card');
      const img = document.querySelector('.canvas-image-container img');

      let cardOverlapsImg = false;
      if (card && img) {
        const cr = card.getBoundingClientRect();
        const ir = img.getBoundingClientRect();
        cardOverlapsImg = (cr.left < ir.right && cr.right > ir.left && cr.top < ir.bottom && cr.bottom > ir.top);
      }

      return {
        copyBtnHeight: copyBtn?.getBoundingClientRect().height || 0,
        brandHeight: brand?.getBoundingClientRect().height || 0,
        navLinkHeight: navLink?.getBoundingClientRect().height || 0,
        tabHeight: tab?.getBoundingClientRect().height || 0,
        cardPosition: window.getComputedStyle(card).position,
        cardOverlapsImg,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth
      };
    });

    results.layoutAudit[vp.name] = metrics;
    await context.close();
  }

  // 2. Interactive Verification
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });

  // A. Hero Interactive Split Slider
  const sliderTab = await page.$('#tab-slider');
  await sliderTab.click();
  const sliderViewActive = await page.$eval('#view-slider', el => !el.hidden && el.classList.contains('active'));
  
  const sliderRange = await page.$('#split-slider-range');
  await page.fill('#split-slider-range', '25');
  await page.dispatchEvent('#split-slider-range', 'input');
  const overlayWidth25 = await page.$eval('#slider-overlay', el => el.style.width);

  await page.fill('#split-slider-range', '75');
  await page.dispatchEvent('#split-slider-range', 'input');
  const overlayWidth75 = await page.$eval('#slider-overlay', el => el.style.width);

  const sliderScreenshotPath = path.join(OUTPUT_DIR, 'verified-slider-interaction.png');
  await page.screenshot({ path: sliderScreenshotPath, clip: { x: 300, y: 700, width: 840, height: 550 } });

  results.interactions.splitSlider = {
    tabActivated: sliderViewActive,
    scrub25: overlayWidth25 === '25%',
    scrub75: overlayWidth75 === '75%',
    screenshot: sliderScreenshotPath
  };

  // B. Skills Directory Search & Modal
  await page.fill('#skill-search', 'refine');
  const countText = await page.$eval('#skill-count', el => el.textContent);
  
  const detailBtn = await page.$('.skill-detail-btn[data-skill-target="visual-refinement-loop"]');
  await detailBtn.click();
  const modalVisible = await page.$eval('#skill-modal', el => !el.hidden);
  const modalTitle = await page.$eval('#modal-skill-title', el => el.textContent);

  await page.keyboard.press('Escape');
  const modalClosed = await page.$eval('#skill-modal', el => el.hidden);

  results.interactions.skillsSearchAndModal = {
    searchFilterCount: countText,
    modalOpened: modalVisible,
    modalSkillTitle: modalTitle,
    escapeClosesModal: modalClosed
  };

  // C. Installation Tabs
  const claudeTab = await page.$('#tab-install-claude-code');
  await claudeTab.click();
  const claudePanelActive = await page.$eval('#panel-install-claude-code', el => !el.hidden && el.classList.contains('active'));

  results.interactions.installTabs = {
    claudePanelSwitched: claudePanelActive
  };

  // D. Workflow Stepper Tabs & Keyboard Navigation
  const stepRefine = await page.$('#step-tab-refine');
  await stepRefine.click();
  const refinePanelActive = await page.$eval('#step-panel-refine', el => !el.hidden && el.classList.contains('active'));

  // Press ArrowRight to navigate to verify
  await stepRefine.focus();
  await page.keyboard.press('ArrowRight');
  const verifyPanelActive = await page.$eval('#step-panel-verify', el => !el.hidden && el.classList.contains('active'));

  results.interactions.workflowStepper = {
    refineClicked: refinePanelActive,
    arrowRightNavigatesToVerify: verifyPanelActive
  };

  // E. Contrast Verification
  const contrastData = await page.evaluate(() => {
    function getRgb(colorStr) {
      const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      return match ? [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])] : [0,0,0];
    }
    function luminance(r, g, b) {
      const a = [r, g, b].map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    }
    function contrastRatio(rgb1, rgb2) {
      const l1 = luminance(...rgb1) + 0.05;
      const l2 = luminance(...rgb2) + 0.05;
      return l1 > l2 ? l1 / l2 : l2 / l1;
    }

    const desc = document.querySelector('.meta-stat-desc');
    const descStyle = window.getComputedStyle(desc);
    const descRatio = contrastRatio(getRgb(descStyle.color), [255, 255, 255]);

    const valFail = document.querySelector('.val-fail');
    const valFailStyle = window.getComputedStyle(valFail);
    const valFailRatio = contrastRatio(getRgb(valFailStyle.color), [29, 32, 27]);

    return {
      inkMutedColor: descStyle.color,
      inkMutedContrastOnWhite: descRatio.toFixed(2) + ':1',
      diffMagentaColor: valFailStyle.color,
      diffMagentaContrastOnDark: valFailRatio.toFixed(2) + ':1'
    };
  });

  results.contrastCheck = contrastData;

  await browser.close();

  console.log('\n=== Verification Summary ===');
  console.log(JSON.stringify(results, null, 2));

  // Save report JSON
  fs.writeFileSync(path.join(OUTPUT_DIR, 'verification-results.json'), JSON.stringify(results, null, 2));
}

verify().catch(console.error);
