import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import fs from 'node:fs';
import { execSync } from 'node:child_process';
import {
  initRefinementRun,
  recordIteration,
  generateSummaryMarkdown,
  DEFAULT_MAX_ITERATIONS
} from '../src/refinement.js';

const FIXTURES_DIR = path.resolve('tests/fixtures');
const TEST_RUNS_DIR = path.resolve('tests/output/refinement-runs');

function runCli(command) {
  try {
    const stdout = execSync(`node ${command}`, {
      stdio: ['pipe', 'pipe', 'pipe'],
      encoding: 'utf8'
    });
    return { code: 0, stdout, stderr: '' };
  } catch (err) {
    return {
      code: err.status,
      stdout: err.stdout ? err.stdout.toString() : '',
      stderr: err.stderr ? err.stderr.toString() : ''
    };
  }
}

describe('Visual Refinement Engine (src/refinement.js)', () => {
  const basePath = path.join(FIXTURES_DIR, 'base-800x600.png');
  const identicalPath = path.join(FIXTURES_DIR, 'identical-800x600.png');
  const colorShiftPath = path.join(FIXTURES_DIR, 'color-shift-800x600.png');
  const layoutShiftPath = path.join(FIXTURES_DIR, 'layout-shift-800x600.png');

  test('initRefinementRun initializes run directory, copies reference, and creates run.json', async () => {
    const runId = `test-init-${Date.now()}`;
    const context = await initRefinementRun({
      referencePath: basePath,
      runId,
      runsBaseDir: TEST_RUNS_DIR,
      maxIterations: 3,
      acceptanceCriteria: { maxDiffPercentage: 0.5 }
    });

    assert.strictEqual(context.runId, runId);
    assert.strictEqual(context.runData.status, 'INITIALIZED');
    assert.strictEqual(context.runData.maxIterations, 3);
    assert.strictEqual(context.runData.acceptanceCriteria.maxDiffPercentage, 0.5);

    // Verify files created on disk
    assert.ok(fs.existsSync(path.join(context.runDir, 'run.json')));
    assert.ok(fs.existsSync(context.runData.reference.savedPath));
  });

  test('initRefinementRun rejects with REFERENCE_NOT_FOUND if file is missing', async () => {
    await assert.rejects(
      async () => initRefinementRun({
        referencePath: 'tests/fixtures/does-not-exist.png',
        runsBaseDir: TEST_RUNS_DIR
      }),
      (err) => {
        assert.strictEqual(err.code, 'REFERENCE_NOT_FOUND');
        return true;
      }
    );
  });

  test('early termination when acceptance criteria are met on iteration 1', async () => {
    const runId = `test-early-term-${Date.now()}`;
    const context = await initRefinementRun({
      referencePath: basePath,
      runId,
      runsBaseDir: TEST_RUNS_DIR,
      maxIterations: 3,
      acceptanceCriteria: { maxDiffPercentage: 0.0 }
    });

    const stepRes = await recordIteration(context, {
      candidatePath: identicalPath,
      threshold: 0.1
    });

    assert.strictEqual(stepRes.iteration, 1);
    assert.strictEqual(stepRes.status, 'PASSED');
    assert.strictEqual(stepRes.shouldTerminate, true);
    assert.strictEqual(stepRes.terminationReason, 'ACCEPTANCE_CRITERIA_SATISFIED');
    assert.strictEqual(context.runData.status, 'COMPLETED_SUCCESS');

    // Verify summary.md generated
    const summaryFile = path.join(context.runDir, 'summary.md');
    assert.ok(fs.existsSync(summaryFile));
    const summaryText = await fs.promises.readFile(summaryFile, 'utf8');
    assert.ok(summaryText.includes('COMPLETED_SUCCESS'));
  });

  test('iteration-limit enforcement stops when max iterations reached', async () => {
    const runId = `test-iter-limit-${Date.now()}`;
    const context = await initRefinementRun({
      referencePath: basePath,
      runId,
      runsBaseDir: TEST_RUNS_DIR,
      maxIterations: 2, // strictly cap at 2 iterations
      acceptanceCriteria: { maxDiffPercentage: 0.0 }
    });

    // Iteration 1: discrepancy remains, should continue
    const step1 = await recordIteration(context, {
      candidatePath: colorShiftPath,
      threshold: 0.1
    });
    assert.strictEqual(step1.iteration, 1);
    assert.strictEqual(step1.shouldTerminate, false);
    assert.strictEqual(step1.status, 'IN_PROGRESS');

    // Iteration 2: limit reached, must terminate
    const step2 = await recordIteration(context, {
      candidatePath: colorShiftPath,
      threshold: 0.1
    });
    assert.strictEqual(step2.iteration, 2);
    assert.strictEqual(step2.shouldTerminate, true);
    assert.strictEqual(step2.terminationReason, 'ITERATION_LIMIT_REACHED');
    assert.strictEqual(context.runData.status, 'COMPLETED_LIMIT_REACHED');
  });

  test('halts immediately on critical test failure after proposed modification', async () => {
    const runId = `test-fail-halt-${Date.now()}`;
    const context = await initRefinementRun({
      referencePath: basePath,
      runId,
      runsBaseDir: TEST_RUNS_DIR,
      maxIterations: 3
    });

    const step = await recordIteration(context, {
      candidatePath: colorShiftPath,
      testResults: {
        passed: false,
        message: 'Unit test suite failed with 2 assertions broken'
      }
    });

    assert.strictEqual(step.shouldTerminate, true);
    assert.strictEqual(step.status, 'TEST_FAILED');
    assert.strictEqual(step.terminationReason, 'CRITICAL_TEST_FAILURE');
    assert.strictEqual(context.runData.status, 'HALTED_TEST_FAILURE');
  });

  test('stagnation detection halts when consecutive iterations fail to produce improvement', async () => {
    const runId = `test-stagnate-${Date.now()}`;
    const context = await initRefinementRun({
      referencePath: basePath,
      runId,
      runsBaseDir: TEST_RUNS_DIR,
      maxIterations: 5,
      acceptanceCriteria: { maxDiffPercentage: 0.0 }
    });

    // Step 1: initial discrepancy
    await recordIteration(context, { candidatePath: colorShiftPath });
    // Step 2: same discrepancy (delta = 0%)
    await recordIteration(context, { candidatePath: colorShiftPath });
    // Step 3: third iteration with no progress -> stagnation detected
    const step3 = await recordIteration(context, { candidatePath: colorShiftPath });

    assert.strictEqual(step3.shouldTerminate, true);
    assert.strictEqual(step3.status, 'STAGNATED');
    assert.strictEqual(step3.terminationReason, 'STAGNATION_DETECTED');
    assert.strictEqual(context.runData.status, 'HALTED_STAGNATION');
  });

  test('detects visual regression when discrepancy increases', async () => {
    const runId = `test-regress-${Date.now()}`;
    const context = await initRefinementRun({
      referencePath: basePath,
      runId,
      runsBaseDir: TEST_RUNS_DIR,
      maxIterations: 2
    });

    // Step 1: minor shift
    await recordIteration(context, { candidatePath: colorShiftPath });

    // Step 2: worse shift (layout shift has higher diff percentage)
    const step2 = await recordIteration(context, { candidatePath: layoutShiftPath });
    assert.strictEqual(step2.status, 'REGRESSED');
    assert.ok(step2.deltaFromPrev > 0, 'Delta should reflect visual regression');
    assert.ok(step2.issues.some(i => i.title.includes('Visual regression detected')));
  });

  test('generateSummaryMarkdown formats comprehensive report', () => {
    const mockData = {
      runId: 'mock-run',
      createdAt: '2026-10-18T10:00:00.000Z',
      status: 'COMPLETED_SUCCESS',
      maxIterations: 3,
      reference: {
        dimensions: { width: 800, height: 600, format: 'png' }
      },
      acceptanceCriteria: { maxDiffPercentage: 0.0, maxDiffPixels: 0 },
      iterations: [
        {
          iteration: 1,
          status: 'PASSED',
          diff: { diffPixels: 0, diffPercentage: 0 },
          deltaFromPrev: null,
          testResults: { passed: true },
          issues: []
        }
      ],
      finalOutcome: {
        message: 'Acceptance criteria satisfied at iteration #1',
        recommendation: 'Ready for review'
      }
    };

    const md = generateSummaryMarkdown(mockData);
    assert.ok(md.includes('# Visual Refinement Run Report — mock-run'));
    assert.ok(md.includes('800x600px'));
    assert.ok(md.includes('COMPLETED_SUCCESS'));
    assert.ok(md.includes('Iteration History'));
  });
});

describe('CLI Quality Tool: ves-refine Integration', () => {
  const basePath = path.join(FIXTURES_DIR, 'base-800x600.png');
  const identicalPath = path.join(FIXTURES_DIR, 'identical-800x600.png');
  const colorShiftPath = path.join(FIXTURES_DIR, 'color-shift-800x600.png');

  test('ves-refine init creates new run and outputs JSON', () => {
    const runId = `cli-init-${Date.now()}`;
    const res = runCli(`bin/ves-refine.js init --reference "${basePath}" --run ${runId} --json`);
    assert.strictEqual(res.code, 0);
    const parsed = JSON.parse(res.stdout);
    assert.strictEqual(parsed.runId, runId);
    assert.strictEqual(parsed.status, 'INITIALIZED');
  });

  test('ves-refine step executes iteration and returns code 0 when matching', () => {
    const runId = `cli-step-${Date.now()}`;
    runCli(`bin/ves-refine.js init --reference "${basePath}" --run ${runId} --json`);
    const res = runCli(`bin/ves-refine.js step --run ${runId} --rendered "${identicalPath}" --json`);
    assert.strictEqual(res.code, 0);
    const parsed = JSON.parse(res.stdout);
    assert.strictEqual(parsed.status, 'PASSED');
    assert.strictEqual(parsed.shouldTerminate, true);
  });

  test('ves-refine step returns code 1 when visual differences remain at limit', () => {
    const runId = `cli-step-diff-${Date.now()}`;
    runCli(`bin/ves-refine.js init --reference "${basePath}" --run ${runId} --max-iterations 1 --json`);
    const res = runCli(`bin/ves-refine.js step --run ${runId} --rendered "${colorShiftPath}" --json`);
    assert.strictEqual(res.code, 1);
    const parsed = JSON.parse(res.stdout);
    assert.strictEqual(parsed.shouldTerminate, true);
    assert.strictEqual(parsed.terminationReason, 'ITERATION_LIMIT_REACHED');
  });

  test('ves-refine status prints run summary', () => {
    const runId = `cli-status-${Date.now()}`;
    runCli(`bin/ves-refine.js init --reference "${basePath}" --run ${runId} --json`);
    runCli(`bin/ves-refine.js step --run ${runId} --rendered "${identicalPath}" --json`);
    const res = runCli(`bin/ves-refine.js status --run ${runId}`);
    assert.strictEqual(res.code, 0);
    assert.ok(res.stdout.includes('Visual Refinement Run Report'));
  });

  test('ves-refine run on identical images completes with exit code 0', () => {
    const res = runCli(`bin/ves-refine.js run --reference "${basePath}" --rendered "${identicalPath}" --json`);
    assert.strictEqual(res.code, 0);
    const parsed = JSON.parse(res.stdout);
    assert.strictEqual(parsed.status, 'PASSED');
  });

  test('ves-refine exits with code 2 on missing reference file', () => {
    const res = runCli(`bin/ves-refine.js init --reference "missing.png" --json`);
    assert.strictEqual(res.code, 2);
    const parsed = JSON.parse(res.stdout);
    assert.strictEqual(parsed.code, 'REFERENCE_NOT_FOUND');
  });
});
