import { chromium } from 'playwright';

const VIEWPORTS = [
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '390x844', width: 390, height: 844 },
  { name: '375x812', width: 375, height: 812 }
];

async function check() {
  const browser = await chromium.launch();
  for (const vp of VIEWPORTS) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });

    const audit = await page.evaluate(() => {
      const results = {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        elementsOverflowing: [],
        touchTargetViolations: [],
        headings: [],
        discrepancyBoxPos: null,
        discrepancyCardPos: null
      };

      // Check all elements for horizontal overflow
      const elements = document.querySelectorAll('*');
      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        if (rect.right > document.documentElement.clientWidth + 1) {
          results.elementsOverflowing.push({
            tag: el.tagName,
            class: el.className,
            id: el.id,
            right: rect.right,
            clientWidth: document.documentElement.clientWidth
          });
        }
      }

      // Check touch targets on interactive elements
      const interactives = document.querySelectorAll('button, a, input, select');
      for (const el of interactives) {
        const rect = el.getBoundingClientRect();
        // check only visible ones
        if (rect.width > 0 && rect.height > 0 && rect.top < 1000) {
          if (rect.width < 32 || rect.height < 32) {
            results.touchTargetViolations.push({
              tag: el.tagName,
              text: el.textContent?.trim().slice(0, 30),
              width: rect.width,
              height: rect.height,
              class: el.className
            });
          }
        }
      }

      // Check discrepancy callout & box
      const bbox = document.querySelector('.discrepancy-bounding-box');
      const card = document.querySelector('.discrepancy-callout-card');
      if (bbox) {
        const r = bbox.getBoundingClientRect();
        results.discrepancyBoxPos = { x: r.x, y: r.y, w: r.width, h: r.height };
      }
      if (card) {
        const r = card.getBoundingClientRect();
        results.discrepancyCardPos = { x: r.x, y: r.y, w: r.width, h: r.height };
      }

      return results;
    });

    console.log(`\n=== Viewport ${vp.name} ===`);
    console.log(`ScrollWidth: ${audit.scrollWidth}, ClientWidth: ${audit.clientWidth}, Overflow: ${audit.hasHorizontalOverflow}`);
    if (audit.elementsOverflowing.length > 0) {
      console.log(`Overflowing elements (${audit.elementsOverflowing.length}):`, audit.elementsOverflowing.slice(0, 5));
    }
    if (audit.touchTargetViolations.length > 0) {
      console.log(`Touch target violations in first 1000px (${audit.touchTargetViolations.length}):`, audit.touchTargetViolations.slice(0, 5));
    }
    console.log(`Discrepancy Box:`, audit.discrepancyBoxPos);
    console.log(`Discrepancy Card:`, audit.discrepancyCardPos);

    await page.close();
  }
  await browser.close();
}

check().catch(console.error);
