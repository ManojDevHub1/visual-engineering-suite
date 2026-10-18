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

const OUTPUT_DIR = path.resolve('tests/output/audit-phase1');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function run() {
  const browser = await chromium.launch();
  
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.isMobile,
      hasTouch: vp.isMobile,
      deviceScaleFactor: 2
    });
    const page = await context.newPage();
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
    
    // Viewport above-the-fold screenshot
    const foldPath = path.join(OUTPUT_DIR, `audit-${vp.name}-fold.png`);
    await page.screenshot({ path: foldPath, fullPage: false });
    
    // Full page screenshot
    const fullPath = path.join(OUTPUT_DIR, `audit-${vp.name}-full.png`);
    await page.screenshot({ path: fullPath, fullPage: true });

    console.log(`Captured ${vp.name}: fold -> ${foldPath}, full -> ${fullPath}`);
    await context.close();
  }
  
  await browser.close();
  console.log('Done capturing Phase 1 audit screenshots.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
