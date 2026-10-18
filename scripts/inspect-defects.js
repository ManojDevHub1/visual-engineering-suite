import { chromium } from 'playwright';

async function inspectDefects() {
  const browser = await chromium.launch();

  // Test 1: Check 1024x768 layout for callout card overlap
  const p1024 = await browser.newPage({ viewport: { width: 1024, height: 768 } });
  await p1024.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
  const card1024 = await p1024.evaluate(() => {
    const card = document.querySelector('.discrepancy-callout-card');
    const img = document.querySelector('.canvas-image-container img');
    const cardRect = card.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();
    return {
      cardTop: cardRect.top,
      cardLeft: cardRect.left,
      imgTop: imgRect.top,
      imgLeft: imgRect.left,
      imgRight: imgRect.right,
      imgBottom: imgRect.bottom,
      overlapX: cardRect.left > imgRect.left && cardRect.right < imgRect.right,
      overlapY: cardRect.top > imgRect.top && cardRect.bottom < imgRect.bottom
    };
  });
  console.log('1024x768 Card Position vs Image:', card1024);

  // Test 2: Check 375x812 hero headline wrapping & padding
  const p375 = await browser.newPage({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  await p375.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
  const hero375 = await p375.evaluate(() => {
    const h1 = document.querySelector('.hero-headline');
    const strip = document.querySelector('.hero-install-strip');
    const copyBtn = document.querySelector('.hero-copy-btn');
    const canvasTabs = document.querySelector('.canvas-tabs');
    const stepper = document.querySelector('.workflow-stepper');
    const tables = Array.from(document.querySelectorAll('table')).map(t => ({
      table: t.className,
      width: t.getBoundingClientRect().width,
      parentWidth: t.parentElement.getBoundingClientRect().width,
      hasOverflow: t.getBoundingClientRect().width > t.parentElement.getBoundingClientRect().width
    }));
    return {
      h1FontSize: window.getComputedStyle(h1).fontSize,
      h1Lines: h1.clientHeight / parseFloat(window.getComputedStyle(h1).lineHeight),
      stripWidth: strip.getBoundingClientRect().width,
      copyBtnWidth: copyBtn.getBoundingClientRect().width,
      copyBtnHeight: copyBtn.getBoundingClientRect().height,
      canvasTabsScrollable: canvasTabs.scrollWidth > canvasTabs.clientWidth,
      stepperScrollable: stepper.scrollWidth > stepper.clientWidth,
      tables
    };
  });
  console.log('375x812 Hero & Components:', hero375);

  // Test 3: Check interactive tab switching in Hero
  const tabRef = await p1024.$('#tab-ref');
  await tabRef.click();
  const refViewVisible = await p1024.$eval('#view-reference', el => !el.hidden && el.classList.contains('active'));
  console.log('Tab click activates Reference View:', refViewVisible);

  await browser.close();
}

inspectDefects().catch(console.error);
