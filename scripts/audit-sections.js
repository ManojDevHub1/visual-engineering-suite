import { chromium } from 'playwright';

async function auditSections() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });

  const sectionDetails = await page.evaluate(() => {
    const sections = Array.from(document.querySelectorAll('section, footer'));
    return sections.map(sec => {
      const rect = sec.getBoundingClientRect();
      const h2 = sec.querySelector('h2');
      const h1 = sec.querySelector('h1');
      return {
        id: sec.id || sec.className.split(' ')[0],
        title: (h1 || h2)?.textContent?.trim() || 'No Heading',
        rect: { y: Math.round(rect.top + window.scrollY), height: Math.round(rect.height) }
      };
    });
  });

  console.log('Sections on page:');
  console.table(sectionDetails);

  await browser.close();
}

auditSections().catch(console.error);
