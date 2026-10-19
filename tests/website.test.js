import { test, describe } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import fs from 'node:fs';
import { execSync } from 'node:child_process';
import { buildSiteData } from '../scripts/build-site-data.js';
import { CANONICAL_SKILL_NAMES } from '../src/doctor.js';

describe('Website & Documentation Hub', () => {
  const rootDir = process.cwd();
  const websiteDir = path.resolve(rootDir, 'website');
  const distDir = path.resolve(websiteDir, 'dist');

  test('buildSiteData generates typed skills-data.ts matching canonical skills', async () => {
    await buildSiteData();

    const skillsDataPath = path.resolve(websiteDir, 'src/data/skills-data.ts');
    assert.ok(fs.existsSync(skillsDataPath), 'skills-data.ts must exist');

    const content = await fs.promises.readFile(skillsDataPath, 'utf8');
    assert.ok(content.includes('export const CANONICAL_SKILLS: SkillItem[]'));

    for (const skillName of CANONICAL_SKILL_NAMES) {
      assert.ok(
        content.includes(`"name": "${skillName}"`),
        `skills-data.ts must contain canonical skill: ${skillName}`
      );
    }
  });

  test('buildSiteData generates typed benchmark-data.ts with measured metrics', async () => {
    await buildSiteData();

    const benchDataPath = path.resolve(websiteDir, 'src/data/benchmark-data.ts');
    assert.ok(fs.existsSync(benchDataPath), 'benchmark-data.ts must exist');

    const content = await fs.promises.readFile(benchDataPath, 'utf8');
    assert.ok(content.includes('CASE-LANDING-01'));
    assert.ok(content.includes('CASE-DASHBOARD-01'));
    assert.ok(content.includes('CASE-ECOMMERCE-01'));
    assert.ok(content.includes('0.00% (0 px)'));
    assert.ok(content.includes('LAYOUT_DISPLACEMENT'));
    assert.ok(content.includes('PASS'));
  });

  test('npm run build:site compiles Vite production bundle cleanly', () => {
    const buildOutput = execSync('npm run build:site', {
      cwd: rootDir,
      encoding: 'utf8',
      stdio: 'pipe'
    });

    assert.ok(
      buildOutput.includes('built in') || buildOutput.includes('building client environment'),
      'Vite build output should confirm successful build'
    );
    assert.ok(fs.existsSync(path.join(distDir, 'index.html')), 'dist/index.html must exist');
    assert.ok(fs.existsSync(path.join(distDir, 'assets')), 'dist/assets directory must exist');
  });

  test('production index.html contains complete SEO, OpenGraph, and JSON-LD schema', async () => {
    const htmlPath = path.join(distDir, 'index.html');
    const html = await fs.promises.readFile(htmlPath, 'utf8');

    // DOCTYPE and viewport
    assert.ok(html.includes('<!DOCTYPE html>') || html.includes('<!doctype html>'));
    assert.ok(html.includes('<html lang="en">'));
    assert.ok(html.includes('name="viewport"'));
    assert.ok(html.includes('content="width=device-width, initial-scale=1.0"'));

    // Primary Meta & Title
    assert.ok(html.includes('<title>Visual Engineering Suite — Pixel-Accurate AI Frontend Engineering</title>'));
    assert.ok(html.includes('name="description"'));
    assert.ok(html.includes('name="theme-color" content="#06080F"'));

    // OpenGraph & Twitter
    assert.ok(html.includes('property="og:type" content="website"'));
    assert.ok(html.includes('property="og:title"'));
    assert.ok(html.includes('property="og:image"'));
    assert.ok(html.includes('name="twitter:card" content="summary_large_image"'));

    // Structured Data JSON-LD
    assert.ok(html.includes('application/ld+json'));
    const ldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    assert.ok(ldMatch, 'Structured data JSON-LD must be present');
    const structuredData = JSON.parse(ldMatch[1]);
    assert.strictEqual(structuredData['@type'], 'SoftwareApplication');
    assert.strictEqual(structuredData.name, 'Visual Engineering Suite');
    assert.strictEqual(structuredData.license, 'https://opensource.org/licenses/MIT');
    assert.ok(Array.isArray(structuredData.featureList));

    // Accessibility Skip Link & Container
    assert.ok(html.includes('<a href="#main-content" class="skip-link">Skip to main content</a>'));
    assert.ok(html.includes('<div id="app"></div>'));

    // Injected Assets
    assert.ok(html.includes('<script type="module"'));
    assert.ok(html.includes('<link rel="stylesheet"'));
  });

  test('production bundle contains static assets and hero images', () => {
    assert.ok(fs.existsSync(path.join(distDir, 'favicon.svg')), 'dist/favicon.svg must exist');
    assert.ok(fs.existsSync(path.join(distDir, 'assets/logo.svg')), 'dist/assets/logo.svg must exist');
    assert.ok(fs.existsSync(path.join(distDir, 'images/diff-hero.png')), 'dist/images/diff-hero.png must exist');
    assert.ok(fs.existsSync(path.join(distDir, 'images/reference-hero.png')), 'dist/images/reference-hero.png must exist');
    assert.ok(fs.existsSync(path.join(distDir, 'images/rendered-hero.png')), 'dist/images/rendered-hero.png must exist');
  });

  test('bundled CSS includes design tokens, dark surfaces, and accessibility classes', async () => {
    const assetsDir = path.join(distDir, 'assets');
    const assetFiles = await fs.promises.readdir(assetsDir);
    const cssFile = assetFiles.find(f => f.endsWith('.css'));
    assert.ok(cssFile, 'Built CSS file must exist in assets');

    const cssContent = await fs.promises.readFile(path.join(assetsDir, cssFile), 'utf8');

    // Surfaces & Accents
    assert.ok(cssContent.toLowerCase().includes('#06080f'), 'CSS must contain background canvas #06080f');
    assert.ok(cssContent.toLowerCase().includes('#38bdf8'), 'CSS must contain accent cyan #38bdf8');

    // Accessibility classes
    assert.ok(cssContent.includes('.sr-only'), 'CSS must contain .sr-only');
    assert.ok(cssContent.includes('.skip-link'), 'CSS must contain .skip-link');
  });

  test('bundled JS includes all canonical skills, agent targets, and benchmark cases', async () => {
    const assetsDir = path.join(distDir, 'assets');
    const assetFiles = await fs.promises.readdir(assetsDir);
    const jsFile = assetFiles.find(f => f.endsWith('.js'));
    assert.ok(jsFile, 'Built JS file must exist in assets');

    const jsContent = await fs.promises.readFile(path.join(assetsDir, jsFile), 'utf8');

    // All 7 skills
    for (const skillName of CANONICAL_SKILL_NAMES) {
      assert.ok(jsContent.includes(skillName), `Bundled JS must reference skill ${skillName}`);
    }

    // Supported agents
    assert.ok(jsContent.includes('Google Antigravity'), 'Bundled JS must mention Antigravity');
    assert.ok(jsContent.includes('Claude Code'), 'Bundled JS must mention Claude Code');
    assert.ok(jsContent.includes('Cursor'), 'Bundled JS must mention Cursor');

    // Benchmark cases
    assert.ok(jsContent.includes('CASE-LANDING-01'), 'Bundled JS must mention CASE-LANDING-01');
    assert.ok(jsContent.includes('CASE-DASHBOARD-01'), 'Bundled JS must mention CASE-DASHBOARD-01');
    assert.ok(jsContent.includes('CASE-ECOMMERCE-01'), 'Bundled JS must mention CASE-ECOMMERCE-01');

    // Refinement Protocol Stages
    assert.ok(jsContent.includes('Reference Capture'), 'Bundled JS must mention Reference Capture');
    assert.ok(jsContent.includes('Visual Analysis'), 'Bundled JS must mention Visual Analysis');
    assert.ok(jsContent.includes('Semantic Frontend Implementation'), 'Bundled JS must mention Frontend Implementation');
    assert.ok(jsContent.includes('Headless Browser Rendering'), 'Bundled JS must mention Headless Browser Rendering');
    assert.ok(jsContent.includes('Pixel-Level Regression Triage'), 'Bundled JS must mention Pixel-Level Regression Triage');
    assert.ok(jsContent.includes('Autonomous Surgical Refinement'), 'Bundled JS must mention Autonomous Surgical Refinement');
    assert.ok(jsContent.includes('Accessibility & Delivery Report'), 'Bundled JS must mention Accessibility & Delivery Report');

    // Diagnostic & CLI commands
    assert.ok(jsContent.includes('ves-doctor'), 'Bundled JS must mention ves-doctor');
  });

  test('all component source files implement required semantics and ARIA attributes', async () => {
    const compDir = path.resolve(websiteDir, 'src/components');

    // Navbar
    const navCode = await fs.promises.readFile(path.join(compDir, 'Navbar.ts'), 'utf8');
    assert.ok(navCode.includes('<header'));
    assert.ok(navCode.includes('<nav'));
    assert.ok(navCode.includes('aria-expanded'));
    assert.ok(navCode.includes('aria-controls="mobile-nav"'));

    // Hero
    const heroCode = await fs.promises.readFile(path.join(compDir, 'Hero.ts'), 'utf8');
    assert.ok(heroCode.includes('hero-headline'));
    assert.ok(heroCode.includes('hero-install-strip'));
    assert.ok(heroCode.includes('hero-editorial-grid'));
    assert.ok(heroCode.includes('btn-hero'));

    // Workflow
    const workflowCode = await fs.promises.readFile(path.join(compDir, 'Workflow.ts'), 'utf8');
    assert.ok(workflowCode.includes('data-step'));
    assert.ok(workflowCode.includes('Known Limitation'));

    // Features
    const featCode = await fs.promises.readFile(path.join(compDir, 'Features.ts'), 'utf8');
    assert.ok(featCode.includes('Engineered for Technical Credibility'));
    assert.ok(featCode.includes('Autonomous Refinement Engine'));

    // SkillsDirectory
    const skillsCode = await fs.promises.readFile(path.join(compDir, 'SkillsDirectory.ts'), 'utf8');
    assert.ok(skillsCode.includes('skill-search'));
    assert.ok(skillsCode.includes('skill-modal'));
    assert.ok(skillsCode.includes('role="dialog"'));
    assert.ok(skillsCode.includes('aria-modal="true"'));

    // InstallationCenter
    const installCode = await fs.promises.readFile(path.join(compDir, 'InstallationCenter.ts'), 'utf8');
    assert.ok(installCode.includes('install-tab'));
    assert.ok(installCode.includes('ves-doctor'));
    assert.ok(installCode.includes('npm run check-health'));

    // CompatibilityMatrix
    const compatCode = await fs.promises.readFile(path.join(compDir, 'CompatibilityMatrix.ts'), 'utf8');
    assert.ok(compatCode.includes('<table'));
    assert.ok(compatCode.includes('<th scope="col"'));

    // Benchmarks
    const benchCode = await fs.promises.readFile(path.join(compDir, 'Benchmarks.ts'), 'utf8');
    assert.ok(benchCode.includes('Deterministic (0 px variance)'));
    assert.ok(benchCode.includes('npm run benchmark'));

    // DocsCenter
    const docsCode = await fs.promises.readFile(path.join(compDir, 'DocsCenter.ts'), 'utf8');
    assert.ok(docsCode.includes('docs-panel'));
    assert.ok(docsCode.includes('getting-started'));

    // Community
    const commCode = await fs.promises.readFile(path.join(compDir, 'Community.ts'), 'utf8');
    assert.ok(commCode.includes('CONTRIBUTING.md'));
    assert.ok(commCode.includes('SECURITY.md'));

    // Footer
    const footerCode = await fs.promises.readFile(path.join(compDir, 'Footer.ts'), 'utf8');
    assert.ok(footerCode.includes('<footer'));
    assert.ok(footerCode.includes('role="contentinfo"'));
    assert.ok(footerCode.includes('siteConfig.version'));
  });
});
