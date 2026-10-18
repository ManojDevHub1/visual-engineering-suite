import { test, describe } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import {
  discoverBenchmarkCases,
  validateCaseDefinition,
  evaluateVisualFidelity,
  evaluateFunctionalCorrectness,
  evaluateRefinementEffectiveness,
  evaluateRepeatability,
  runBenchmarkSuite,
  formatBenchmarkReport
} from '../src/benchmark.js';

describe('Benchmark Discovery & Validation Engine', () => {
  test('discoverBenchmarkCases discovers all benchmark cases with required files', async () => {
    const cases = await discoverBenchmarkCases(path.resolve('benchmarks/cases'));
    assert.strictEqual(cases.length, 3);

    const ids = cases.map(c => c.id);
    assert.ok(ids.includes('CASE-LANDING-01'));
    assert.ok(ids.includes('CASE-DASHBOARD-01'));
    assert.ok(ids.includes('CASE-ECOMMERCE-01'));

    for (const c of cases) {
      assert.strictEqual(c.hasRequiredFiles, true);
      assert.strictEqual(c.missingFiles.length, 0);
      assert.strictEqual(c.parseError, null);
    }
  });

  test('validateCaseDefinition passes for valid benchmark cases', async () => {
    const cases = await discoverBenchmarkCases(path.resolve('benchmarks/cases'));
    for (const c of cases) {
      const val = await validateCaseDefinition(c);
      assert.strictEqual(val.valid, true, `Case ${c.id} should be valid`);
      assert.strictEqual(val.errors.length, 0);
    }
  });

  test('validateCaseDefinition flags missing required files and invalid schema', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ves-bench-invalid-'));
    try {
      const caseJson = {
        id: 'CASE-TEST-01',
        name: 'Invalid Test Case'
        // Missing category, viewports, acceptanceCriteria
      };
      fs.writeFileSync(path.join(tempDir, 'case.json'), JSON.stringify(caseJson));

      const mockCase = {
        id: caseJson.id,
        name: caseJson.name,
        dirName: 'test',
        caseDir: tempDir,
        metadata: caseJson,
        parseError: null,
        hasRequiredFiles: false,
        missingFiles: ['reference.png', 'initial-render.png']
      };

      const val = await validateCaseDefinition(mockCase);
      assert.strictEqual(val.valid, false);
      assert.ok(val.errors.some(e => e.includes('Missing required case files')));
      assert.ok(val.errors.some(e => e.includes('category')));
      assert.ok(val.errors.some(e => e.includes('viewports')));
      assert.ok(val.errors.some(e => e.includes('acceptanceCriteria')));
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});

describe('Benchmark Visual Fidelity Evaluation', () => {
  const landingDir = path.resolve('benchmarks/cases/case-landing-page');
  const refPath = path.join(landingDir, 'reference.png');
  const initPath = path.join(landingDir, 'initial-render.png');
  const refnPath = path.join(landingDir, 'refined-render.png');

  test('detects intentional CTA discrepancy on initial render', async () => {
    const result = await evaluateVisualFidelity(refPath, initPath, {
      threshold: 0.1,
      maxDiffPercentage: 0.1,
      maxDiffPixels: 100
    });

    assert.strictEqual(result.passed, false);
    assert.strictEqual(result.diffPixels, 7680);
    assert.strictEqual(result.diffPercentage, 1.92);
    assert.strictEqual(result.defectCategory, 'COLOR_DISCREPANCY');
    assert.ok(result.boundingBox);
    assert.strictEqual(result.boundingBox.minX, 48);
  });

  test('passes on refined render matching reference exactly', async () => {
    const result = await evaluateVisualFidelity(refPath, refnPath, {
      threshold: 0.1,
      maxDiffPercentage: 0.1,
      maxDiffPixels: 100
    });

    assert.strictEqual(result.passed, true);
    assert.strictEqual(result.diffPixels, 0);
    assert.strictEqual(result.diffPercentage, 0);
    assert.strictEqual(result.defectCategory, 'NO_DEFECT');
  });

  test('handles dimension mismatch gracefully without throwing uncaught errors', async () => {
    const dashRef = path.resolve('benchmarks/cases/case-dashboard/reference.png'); // 900x600
    const landRef = path.resolve('benchmarks/cases/case-landing-page/reference.png'); // 800x500

    const result = await evaluateVisualFidelity(dashRef, landRef);
    assert.strictEqual(result.passed, false);
    assert.strictEqual(result.defectCategory, 'DIMENSION_MISMATCH');
    assert.ok(result.error.includes('Dimension mismatch'));
  });
});

describe('Benchmark Functional Correctness Engine', () => {
  test('evaluates semantic HTML, landmarks, and buttons on landing page', async () => {
    const htmlPath = path.resolve('benchmarks/cases/case-landing-page/component.html');
    const caseMeta = {
      category: 'landing-page',
      acceptanceCriteria: {
        requiredSemanticTags: ['header', 'nav', 'main', 'button']
      }
    };

    const result = await evaluateFunctionalCorrectness(htmlPath, caseMeta);
    assert.strictEqual(result.passed, true);
    assert.strictEqual(result.failedTests, 0);
    assert.ok(result.passedTests >= 5);
  });

  test('evaluates table semantics and scope attributes on dashboard', async () => {
    const htmlPath = path.resolve('benchmarks/cases/case-dashboard/component.html');
    const caseMeta = {
      category: 'dashboard',
      acceptanceCriteria: {
        requiredSemanticTags: ['aside', 'main', 'header', 'table', 'th', 'td']
      }
    };

    const result = await evaluateFunctionalCorrectness(htmlPath, caseMeta);
    assert.strictEqual(result.passed, true);
    assert.ok(result.tests.some(t => t.name === 'Table Header Column Scopes' && t.passed));
  });

  test('evaluates radio swatch group and accessible touch targets on ecommerce card', async () => {
    const htmlPath = path.resolve('benchmarks/cases/case-ecommerce/component.html');
    const caseMeta = {
      category: 'ecommerce',
      acceptanceCriteria: {
        requiredSemanticTags: ['article', 'figure', 'button']
      }
    };

    const result = await evaluateFunctionalCorrectness(htmlPath, caseMeta);
    assert.strictEqual(result.passed, true);
    assert.ok(result.tests.some(t => t.name === 'Radio Swatch Group Semantics' && t.passed));
  });
});

describe('Benchmark Refinement Effectiveness & Repeatability', () => {
  test('evaluateRefinementEffectiveness measures improvement delta and criteria', () => {
    const initialVisual = { diffPixels: 7680, diffPercentage: 1.92, passed: false, defectCategory: 'COLOR_DISCREPANCY' };
    const refinedVisual = { diffPixels: 0, diffPercentage: 0.0, passed: true, defectCategory: 'NO_DEFECT' };
    const funcResult = { passed: true, totalTests: 5, passedTests: 5, failedTests: 0 };

    const refResult = evaluateRefinementEffectiveness(initialVisual, refinedVisual, funcResult, funcResult, {
      maxDiffPercentage: 0.1,
      maxDiffPixels: 100
    });

    assert.strictEqual(refResult.isImproved, true);
    assert.strictEqual(refResult.isRefinementEffective, true);
    assert.strictEqual(refResult.status, 'PASSED_REFINED');
    assert.strictEqual(refResult.metrics.diffPixelsReduction, 7680);
    assert.strictEqual(refResult.metrics.relativeImprovementPercent, 100);
  });

  test('evaluateRepeatability demonstrates 100% determinism on identical image comparisons', async () => {
    const landingDir = path.resolve('benchmarks/cases/case-landing-page');
    const refPath = path.join(landingDir, 'reference.png');
    const initPath = path.join(landingDir, 'initial-render.png');

    const rep = await evaluateRepeatability(refPath, initPath, 3);
    assert.strictEqual(rep.runs, 3);
    assert.strictEqual(rep.isDeterministic, true);
    assert.strictEqual(rep.pixelVariance, 0);
    assert.strictEqual(rep.stabilityIndex, 100);
  });
});

describe('Full Benchmark Runner & Report Generation', () => {
  test('runBenchmarkSuite executes all cases, creates artifacts and report', async () => {
    const tempOut = fs.mkdtempSync(path.join(os.tmpdir(), 'ves-bench-run-'));
    try {
      const suite = await runBenchmarkSuite({
        casesDir: path.resolve('benchmarks/cases'),
        outputDir: tempOut,
        mode: 'all',
        repeatabilityRuns: 2
      });

      assert.strictEqual(suite.summary.totalCases, 3);
      assert.strictEqual(suite.summary.passedCases, 3);
      assert.strictEqual(suite.summary.failedCases, 0);
      assert.strictEqual(suite.summary.passRate, 100);
      assert.strictEqual(suite.summary.exitCode, 0);

      // Verify files generated on disk
      assert.ok(fs.existsSync(suite.artifacts.jsonReportPath));
      assert.ok(fs.existsSync(suite.artifacts.mdReportPath));
      assert.ok(fs.existsSync(suite.artifacts.diffsDir));

      // Validate report markdown content
      const mdContent = fs.readFileSync(suite.artifacts.mdReportPath, 'utf8');
      assert.ok(mdContent.includes('Case-by-Case Benchmark Summary'));
      assert.ok(mdContent.includes('Refinement Loop Effectiveness'));
      assert.ok(mdContent.includes('Repeatability & Determinism'));
      assert.ok(mdContent.includes('Cross-Agent Empirical Testing Status'));
    } finally {
      fs.rmSync(tempOut, { recursive: true, force: true });
    }
  });

  test('runBenchmarkSuite filters by case ID', async () => {
    const tempOut = fs.mkdtempSync(path.join(os.tmpdir(), 'ves-bench-filter-'));
    try {
      const suite = await runBenchmarkSuite({
        casesDir: path.resolve('benchmarks/cases'),
        outputDir: tempOut,
        caseFilter: 'CASE-ECOMMERCE-01'
      });

      assert.strictEqual(suite.summary.totalCases, 1);
      assert.strictEqual(suite.cases[0].id, 'CASE-ECOMMERCE-01');
      assert.strictEqual(suite.cases[0].passed, true);
    } finally {
      fs.rmSync(tempOut, { recursive: true, force: true });
    }
  });

  test('runBenchmarkSuite runs in validate mode', async () => {
    const tempOut = fs.mkdtempSync(path.join(os.tmpdir(), 'ves-bench-val-'));
    try {
      const suite = await runBenchmarkSuite({
        casesDir: path.resolve('benchmarks/cases'),
        outputDir: tempOut,
        mode: 'validate'
      });

      assert.strictEqual(suite.summary.totalCases, 3);
      assert.strictEqual(suite.summary.passedCases, 3);
      assert.strictEqual(suite.summary.exitCode, 0);
      for (const c of suite.cases) {
        assert.strictEqual(c.validation.valid, true);
      }
    } finally {
      fs.rmSync(tempOut, { recursive: true, force: true });
    }
  });
});
