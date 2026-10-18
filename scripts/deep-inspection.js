import { chromium } from 'playwright';

async function deepInspection() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });

  const data = await page.evaluate(() => {
    // Check contrast of key elements
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

    const checks = [];
    const elementsToTest = [
      { sel: '.hero-headline', name: 'Hero Headline' },
      { sel: '.hero-supporting-copy', name: 'Hero Supporting Copy' },
      { sel: '.text-lime-contrast', name: 'Eyebrow Lime Text' },
      { sel: '.hero-install-command', name: 'Hero Install Command' },
      { sel: '.telemetry-value', name: 'Telemetry Value' },
      { sel: '.callout-coords', name: 'Callout Coords' },
      { sel: '.meta-stat-desc', name: 'Meta Stat Description' },
      { sel: '.nav-link', name: 'Nav Link' }
    ];

    for (const item of elementsToTest) {
      const el = document.querySelector(item.sel);
      if (el) {
        const style = window.getComputedStyle(el);
        const color = style.color;
        let parent = el.parentElement;
        let bgColor = window.getComputedStyle(parent).backgroundColor;
        while (parent && (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent')) {
          parent = parent.parentElement;
          if (parent) bgColor = window.getComputedStyle(parent).backgroundColor;
        }
        const ratio = contrastRatio(getRgb(color), getRgb(bgColor || 'rgb(245, 244, 238)'));
        checks.push({
          name: item.name,
          color,
          bgColor,
          contrast: ratio.toFixed(2) + ':1',
          fontSize: style.fontSize,
          lineHeight: style.lineHeight
        });
      }
    }

    return checks;
  });

  console.log('Contrast & Typography details:');
  console.table(data);

  await browser.close();
}

deepInspection().catch(console.error);
