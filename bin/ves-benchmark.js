#!/usr/bin/env node

/**
 * ves-benchmark: Universal Visual Engineering Benchmark & Quality Evaluation Runner.
 * 
 * Usage:
 *   node bin/ves-benchmark.js [--case <caseId>] [--mode <all|visual|functional|validate>] [--json]
 * 
 * Exit codes:
 *   0: All benchmark cases satisfied acceptance criteria
 *   1: One or more benchmark cases failed acceptance criteria
 *   2: Critical error, corrupt benchmark case, or invalid arguments
 */

import path from 'node:path';
import { runBenchmarkSuite } from '../src/benchmark.js';

const args = process.argv.slice(2);
const isJson = args.includes('--json');

function getArg(flag) {
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
}

const mode = getArg('--mode') || 'all';
const caseFilter = getArg('--case');
const casesDir = getArg('--cases-dir') || path.resolve('benchmarks/cases');
const outputDir = getArg('--output') || path.resolve('.visual-engineering/benchmarks');

const VALID_MODES = ['all', 'visual', 'functional', 'validate'];
if (!VALID_MODES.includes(mode)) {
  if (isJson) {
    console.error(JSON.stringify({ error: `Invalid mode "${mode}". Allowed modes: ${VALID_MODES.join(', ')}`, exitCode: 2 }));
  } else {
    console.error(`[ERROR] Invalid --mode "${mode}". Allowed modes: ${VALID_MODES.join(', ')}`);
  }
  process.exit(2);
}

async function main() {
  try {
    const result = await runBenchmarkSuite({
      casesDir,
      outputDir,
      mode,
      caseFilter
    });

    if (isJson) {
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.summary.exitCode);
    }

    console.log('=== Visual Engineering Suite — Benchmark & Quality Evaluation ===\n');
    console.log(`Run ID:        ${result.runId}`);
    console.log(`Mode:          ${result.mode}`);
    console.log(`Cases Tested:  ${result.summary.totalCases}`);
    console.log(`Passed:        ${result.summary.passedCases}`);
    console.log(`Failed:        ${result.summary.failedCases}`);
    console.log(`Pass Rate:     ${result.summary.passRate}%\n`);

    console.log('--- Benchmark Cases Breakdown ---');
    for (const c of result.cases) {
      const mark = c.passed ? '✓' : '✗';
      console.log(`\n[${mark}] ${c.id}: ${c.name} (${c.category})`);

      if (c.visual?.initial && c.visual?.refined) {
        console.log(`    Visual Initial:  ${c.visual.initial.diffPercentage}% (${c.visual.initial.diffPixels} px) [${c.visual.initial.defectCategory}]`);
        console.log(`    Visual Refined:  ${c.visual.refined.diffPercentage}% (${c.visual.refined.diffPixels} px) [${c.visual.refined.passed ? 'PASS ✓' : 'FAIL ✗'}]`);
        if (c.refinement) {
          console.log(`    Net Reduction:   -${c.refinement.metrics.diffReductionPercentage.toFixed(2)}% (${c.refinement.metrics.relativeImprovementPercent}% relative improvement)`);
        }
      }

      if (c.functional) {
        console.log(`    Functional:      ${c.functional.passedTests}/${c.functional.totalTests} tests passed [${c.functional.passed ? 'PASS ✓' : 'FAIL ✗'}]`);
      }

      if (c.repeatability) {
        console.log(`    Repeatability:   ${c.repeatability.stabilityIndex}% stability (variance: ${c.repeatability.pixelVariance} px across ${c.repeatability.runs} runs)`);
      }

      if (c.error) {
        console.log(`    Error:           ${c.error}`);
      }
    }

    console.log(`\nReports and Artifacts Generated:`);
    console.log(`  Markdown Report: ${result.artifacts.mdReportPath}`);
    console.log(`  JSON Results:    ${result.artifacts.jsonReportPath}`);
    console.log(`  Diff Maps Dir:   ${result.artifacts.diffsDir}`);

    process.exit(result.summary.exitCode);
  } catch (err) {
    if (isJson) {
      console.error(JSON.stringify({ error: err.message, stack: err.stack, exitCode: 2 }));
    } else {
      console.error(`[CRITICAL] Benchmark suite failed with an uncaught error: ${err.message}`);
    }
    process.exit(2);
  }
}

main();
