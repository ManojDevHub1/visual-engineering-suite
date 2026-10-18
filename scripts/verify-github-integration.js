import { chromium } from 'playwright';

async function verifyGithubIntegration() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const TARGET_REPO_URL = 'https://github.com/ManojDevHub1/visual-engineering-suite';
  const TARGET_CLONE_URL = 'https://github.com/ManojDevHub1/visual-engineering-suite.git';

  console.log('Navigating to http://localhost:4173/ ...');
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });

  const results = {
    navbar: {},
    hero: {},
    installation: {},
    docs: {},
    community: {},
    footer: {},
    mobileNav: {}
  };

  // 1. Navbar GitHub link
  const navGhLink = await page.$('.nav-gh-btn');
  const navHref = await navGhLink?.getAttribute('href');
  const navTarget = await navGhLink?.getAttribute('target');
  const navRel = await navGhLink?.getAttribute('rel');
  results.navbar = {
    found: Boolean(navGhLink),
    href: navHref,
    matchesTarget: navHref === TARGET_REPO_URL,
    target: navTarget,
    rel: navRel
  };

  // 2. Hero CTAs
  const heroPrimary = await page.$('.hero-actions-row a.btn-primary');
  const heroPrimaryHref = await heroPrimary?.getAttribute('href');
  const heroGhLink = await page.$('.hero-actions-row a.btn-secondary');
  const heroGhHref = await heroGhLink?.getAttribute('href');
  const heroGhTarget = await heroGhLink?.getAttribute('target');
  const heroGhRel = await heroGhLink?.getAttribute('rel');
  results.hero = {
    primaryGetStartedHref: heroPrimaryHref,
    primaryMatchesInstall: heroPrimaryHref === '#install',
    secondaryGhHref: heroGhHref,
    secondaryMatchesTarget: heroGhHref === TARGET_REPO_URL,
    target: heroGhTarget,
    rel: heroGhRel
  };

  // 3. Installation Center (Manual tab)
  const manualTab = await page.$('#tab-install-manual');
  await manualTab?.click();
  const manualBoxCode = await page.$eval('#panel-install-manual code', el => el.textContent);
  results.installation = {
    manualCloneSnippet: manualBoxCode,
    containsCloneUrl: manualBoxCode?.includes(TARGET_CLONE_URL)
  };

  // 4. Docs Center
  const docsCloneSnippet = await page.$eval('#panel-doc-getting-started .code-box code', el => el.textContent);
  results.docs = {
    docsCloneSnippet,
    containsCloneUrl: docsCloneSnippet?.includes(TARGET_CLONE_URL)
  };

  // 5. Community Links
  const contribLink = await page.$eval('a[href*="CONTRIBUTING.md"]', el => el.getAttribute('href'));
  const issuesLink = await page.$eval('a[href*="/issues"]', el => el.getAttribute('href'));
  const securityLink = await page.$eval('a[href*="SECURITY.md"]', el => el.getAttribute('href'));
  results.community = {
    contributing: contribLink,
    matchesContributing: contribLink === `${TARGET_REPO_URL}/blob/master/CONTRIBUTING.md`,
    issues: issuesLink,
    matchesIssues: issuesLink === `${TARGET_REPO_URL}/issues`,
    security: securityLink,
    matchesSecurity: securityLink === `${TARGET_REPO_URL}/blob/master/SECURITY.md`
  };

  // 6. Footer Links
  const footerLinks = await page.$$eval('.footer-col:last-child a', links => links.map(a => ({
    text: a.textContent?.trim(),
    href: a.getAttribute('href'),
    target: a.getAttribute('target')
  })));
  results.footer = {
    links: footerLinks,
    allMatchTarget: footerLinks.every(l => l.href?.startsWith(TARGET_REPO_URL))
  };

  // 7. Mobile Navigation Drawer Check
  await page.setViewportSize({ width: 375, height: 812 });
  const mobileToggle = await page.$('.mobile-toggle');
  await mobileToggle?.click();
  const mobileNavVisible = await page.$eval('#mobile-nav', el => !el.hidden);
  const mobileGhLink = await page.$('.mobile-links a[href*="github.com"]');
  const mobileGhHref = await mobileGhLink?.getAttribute('href');
  results.mobileNav = {
    drawerOpened: mobileNavVisible,
    mobileGhHref,
    matchesTarget: mobileGhHref === TARGET_REPO_URL
  };

  console.log('=== Integration Results ===');
  console.log(JSON.stringify(results, null, 2));

  await browser.close();

  // Validate all assertions
  const allPassed =
    results.navbar.matchesTarget &&
    results.hero.primaryMatchesInstall &&
    results.hero.secondaryMatchesTarget &&
    results.installation.containsCloneUrl &&
    results.docs.containsCloneUrl &&
    results.community.matchesContributing &&
    results.community.matchesIssues &&
    results.community.matchesSecurity &&
    results.footer.allMatchTarget &&
    results.mobileNav.matchesTarget;

  if (!allPassed) {
    console.error('One or more GitHub integration checks failed!');
    process.exit(1);
  }

  console.log('All GitHub repository integration checks PASSED successfully!');
}

verifyGithubIntegration().catch(err => {
  console.error('Failure:', err);
  process.exit(1);
});
