import fs from 'node:fs';
import path from 'node:path';
import { compareImages } from './diff.js';
import { getImageDimensions, compareDimensions } from './dimensions.js';

export const DEFAULT_MAX_ITERATIONS = 3;
export const DEFAULT_STAGNATION_THRESHOLD = 0.05; // 0.05% minimum improvement required

/**
 * Initializes a visual refinement run in .visual-engineering/runs/<runId>/
 * 
 * @param {object} options
 * @param {string} options.referencePath - Path to reference image
 * @param {string} [options.runId] - Optional custom run ID
 * @param {string} [options.runsBaseDir] - Base directory for runs (default: .visual-engineering/runs)
 * @param {string} [options.targetUrl] - Target application URL or component path
 * @param {number} [options.maxIterations=3] - Maximum refinement iterations
 * @param {object} [options.acceptanceCriteria] - Criteria for declaring success
 * @param {number} [options.acceptanceCriteria.maxDiffPercentage=0.0]
 * @param {number} [options.acceptanceCriteria.maxDiffPixels=0]
 * @param {boolean} [options.acceptanceCriteria.allowTestFailures=false]
 * @param {boolean} [options.acceptanceCriteria.allowConsoleErrors=false]
 * @param {string[]} [options.acceptanceCriteria.requiredElements]
 * @returns {Promise<object>} Run context object
 */
export async function initRefinementRun(options) {
  const {
    referencePath,
    runId = `run-${Date.now()}`,
    runsBaseDir = path.resolve('.visual-engineering/runs'),
    targetUrl = 'http://localhost:3000',
    maxIterations = DEFAULT_MAX_ITERATIONS,
    acceptanceCriteria = {}
  } = options;

  if (!referencePath) {
    const err = new Error('referencePath is required to initialize a visual refinement run.');
    err.code = 'MISSING_REFERENCE';
    throw err;
  }

  const resolvedRefPath = path.resolve(referencePath);
  if (!fs.existsSync(resolvedRefPath)) {
    const err = new Error(`Reference image not found on disk: ${resolvedRefPath}`);
    err.code = 'REFERENCE_NOT_FOUND';
    throw err;
  }

  // Validate reference dimensions
  const refDim = await getImageDimensions(resolvedRefPath);

  const runDir = path.join(runsBaseDir, runId);
  await fs.promises.mkdir(runDir, { recursive: true });

  // Copy reference image to run directory for permanent record
  const savedRefPath = path.join(runDir, `reference${path.extname(resolvedRefPath)}`);
  await fs.promises.copyFile(resolvedRefPath, savedRefPath);

  const criteria = {
    maxDiffPercentage: acceptanceCriteria.maxDiffPercentage ?? 0.0,
    maxDiffPixels: acceptanceCriteria.maxDiffPixels ?? 0,
    allowTestFailures: acceptanceCriteria.allowTestFailures ?? false,
    allowConsoleErrors: acceptanceCriteria.allowConsoleErrors ?? false,
    requiredElements: acceptanceCriteria.requiredElements ?? []
  };

  const runData = {
    runId,
    createdAt: new Date().toISOString(),
    status: 'INITIALIZED',
    targetUrl,
    maxIterations,
    reference: {
      originalPath: resolvedRefPath,
      savedPath: savedRefPath,
      dimensions: { width: refDim.width, height: refDim.height, format: refDim.format }
    },
    acceptanceCriteria: criteria,
    iterations: [],
    finalOutcome: null
  };

  await fs.promises.writeFile(
    path.join(runDir, 'run.json'),
    JSON.stringify(runData, null, 2)
  );

  return {
    runId,
    runDir,
    runData
  };
}

/**
 * Prioritizes issues based on visual diff results and previous iterations.
 */
function prioritizeIssues(diffResult, iterationNumber, prevIteration = null) {
  const issues = [];

  if (diffResult.diffPixels > 0 && diffResult.boundingBox) {
    const bb = diffResult.boundingBox;
    const diffPct = diffResult.diffPercentage;

    let severity = 'Minor';
    let impact = 'Cosmetic inconsistency';

    if (diffPct > 5.0) {
      severity = 'Critical';
      impact = 'Major layout shift or missing large component';
    } else if (diffPct > 1.0) {
      severity = 'Major';
      impact = 'Noticeable element displacement or incorrect primary styling';
    }

    issues.push({
      id: `issue-${iterationNumber}-1`,
      title: `Visual discrepancy in region [x: ${bb.minX}..${bb.maxX}, y: ${bb.minY}..${bb.maxY}]`,
      severity,
      userImpact: impact,
      confidence: 'High (Measured via pixel-level comparison)',
      diffPixels: diffResult.diffPixels,
      diffPercentage: diffResult.diffPercentage,
      boundingBox: bb,
      likelyCause: diffPct > 5.0
        ? 'Missing component or large container alignment failure'
        : 'Incorrect padding, color token, or font weight',
      recommendedAction: `Inspect element styles corresponding to coordinates [${bb.minX}, ${bb.minY}] to [${bb.maxX}, ${bb.maxY}] and apply targeted CSS adjustment.`
    });
  }

  // Check if regression occurred compared to previous iteration
  if (prevIteration && prevIteration.diff) {
    const delta = diffResult.diffPercentage - prevIteration.diff.diffPercentage;
    if (delta > 0.05) {
      issues.unshift({
        id: `issue-${iterationNumber}-regression`,
        title: `Visual regression detected (+${delta.toFixed(3)}% discrepancy increase)`,
        severity: 'Critical',
        userImpact: 'Recent modification worsened visual fidelity',
        confidence: 'High',
        likelyCause: 'Last applied code patch introduced unintended styling shifts',
        recommendedAction: 'Revert last change or inspect sibling component styles affected by the modification.'
      });
    }
  }

  return issues;
}

/**
 * Generates markdown summary report for a refinement run.
 */
export function generateSummaryMarkdown(runData) {
  const { runId, createdAt, status, maxIterations, reference, iterations, finalOutcome, acceptanceCriteria } = runData;

  let md = `# Visual Refinement Run Report — ${runId}\n\n`;
  md += `- **Date**: ${createdAt}\n`;
  md += `- **Final Status**: **${status}**\n`;
  md += `- **Max Iterations Configured**: ${maxIterations}\n`;
  md += `- **Iterations Executed**: ${iterations.length}\n`;
  md += `- **Reference Dimensions**: ${reference.dimensions.width}x${reference.dimensions.height}px (${reference.dimensions.format})\n`;
  md += `- **Acceptance Criteria**: Max Diff %: ${acceptanceCriteria.maxDiffPercentage}%, Max Diff Pixels: ${acceptanceCriteria.maxDiffPixels}\n\n`;

  md += `## Iteration History\n\n`;
  md += `| Iteration | Status | Diff Pixels | Diff % | Delta vs Prev | Test Pass | Issues Identified |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;

  for (const iter of iterations) {
    const diff = iter.diff;
    const deltaStr = iter.deltaFromPrev !== null
      ? (iter.deltaFromPrev <= 0 ? `${iter.deltaFromPrev.toFixed(3)}% (Improved)` : `+${iter.deltaFromPrev.toFixed(3)}% (Regressed)`)
      : 'Baseline';
    const testStr = iter.testResults?.passed ? 'PASS ✓' : (iter.testResults ? 'FAIL ✗' : 'N/A');

    md += `| #${iter.iteration} | ${iter.status} | ${diff.diffPixels.toLocaleString()} | ${diff.diffPercentage}% | ${deltaStr} | ${testStr} | ${iter.issues.length} |\n`;
  }

  md += `\n## Final Outcome\n\n`;
  if (finalOutcome) {
    md += `**Conclusion**: ${finalOutcome.message}\n\n`;
    if (finalOutcome.recommendation) {
      md += `**Next Action**: ${finalOutcome.recommendation}\n\n`;
    }
  }

  if (iterations.length > 0) {
    const lastIter = iterations[iterations.length - 1];
    if (lastIter.issues.length > 0) {
      md += `### Remaining Active Issues\n\n`;
      for (const issue of lastIter.issues) {
        md += `- **[${issue.severity}]** ${issue.title}\n`;
        md += `  - *Impact*: ${issue.userImpact}\n`;
        md += `  - *Likely Cause*: ${issue.likelyCause}\n`;
        md += `  - *Recommendation*: ${issue.recommendedAction}\n`;
      }
      md += `\n`;
    }
  }

  return md;
}

/**
 * Records an iteration step in a refinement run, performs visual comparison,
 * triages issues, evaluates acceptance criteria, and checks termination rules.
 * 
 * @param {object} runContext - Object returned by initRefinementRun
 * @param {object} stepOptions
 * @param {string} stepOptions.candidatePath - Path to candidate screenshot
 * @param {number} [stepOptions.threshold=0.1] - Diff threshold (0.0 exact to 1.0 loose)
 * @param {object} [stepOptions.testResults] - Optional test results { passed: boolean, message?: string }
 * @param {Array} [stepOptions.consoleLogs] - Optional browser console logs
 * @returns {Promise<object>} Iteration evaluation result
 */
export async function recordIteration(runContext, stepOptions) {
  const { runDir, runData } = runContext;
  const {
    candidatePath,
    threshold = 0.1,
    testResults = null,
    consoleLogs = []
  } = stepOptions;

  const currentIterNum = runData.iterations.length + 1;

  if (!candidatePath) {
    const err = new Error('candidatePath is required for refinement iteration comparison.');
    err.code = 'MISSING_CANDIDATE';
    throw err;
  }

  const resolvedCandidatePath = path.resolve(candidatePath);
  if (!fs.existsSync(resolvedCandidatePath)) {
    const err = new Error(`Rendered candidate image not found: ${resolvedCandidatePath}`);
    err.code = 'CANDIDATE_NOT_FOUND';
    throw err;
  }

  // 1. Save candidate screenshot copy into run directory
  const savedCandidatePath = path.join(runDir, `render-iter-${currentIterNum}.png`);
  await fs.promises.copyFile(resolvedCandidatePath, savedCandidatePath);

  // 2. Perform Visual Diff
  const diffOutputPath = path.join(runDir, `diff-iter-${currentIterNum}.png`);
  const diffResult = await compareImages(
    runData.reference.savedPath,
    savedCandidatePath,
    {
      threshold,
      diffPath: diffOutputPath,
      maxDiffPercentage: runData.acceptanceCriteria.maxDiffPercentage,
      maxDiffPixels: runData.acceptanceCriteria.maxDiffPixels
    }
  );

  // 3. Compute Delta from previous iteration
  const prevIter = runData.iterations.length > 0 ? runData.iterations[runData.iterations.length - 1] : null;
  let deltaFromPrev = null;
  if (prevIter && prevIter.diff) {
    deltaFromPrev = Number((diffResult.diffPercentage - prevIter.diff.diffPercentage).toFixed(4));
  }

  // 4. Prioritize Issues
  const issues = prioritizeIssues(diffResult, currentIterNum, prevIter);

  // 5. Evaluate Acceptance Criteria
  const criteria = runData.acceptanceCriteria;
  const diffCriteriaMet = diffResult.diffPercentage <= criteria.maxDiffPercentage &&
                          diffResult.diffPixels <= criteria.maxDiffPixels;

  const testCriteriaMet = !testResults || criteria.allowTestFailures || testResults.passed;
  const hasConsoleErrors = consoleLogs.some(log => log.type === 'error');
  const consoleCriteriaMet = criteria.allowConsoleErrors || !hasConsoleErrors;

  const allCriteriaSatisfied = diffCriteriaMet && testCriteriaMet && consoleCriteriaMet;

  // 6. Check Termination Conditions
  let iterationStatus = 'IN_PROGRESS';
  let shouldTerminate = false;
  let terminationReason = null;

  if (allCriteriaSatisfied) {
    iterationStatus = 'PASSED';
    shouldTerminate = true;
    terminationReason = 'ACCEPTANCE_CRITERIA_SATISFIED';
    runData.status = 'COMPLETED_SUCCESS';
    runData.finalOutcome = {
      code: 'ACCEPTANCE_CRITERIA_SATISFIED',
      message: `Acceptance criteria satisfied at iteration #${currentIterNum} (Diff: ${diffResult.diffPercentage}% <= ${criteria.maxDiffPercentage}%).`,
      recommendation: 'Implementation verified. Ready for review or deployment.'
    };
  } else if (testResults && !testResults.passed && !criteria.allowTestFailures) {
    iterationStatus = 'TEST_FAILED';
    shouldTerminate = true;
    terminationReason = 'CRITICAL_TEST_FAILURE';
    runData.status = 'HALTED_TEST_FAILURE';
    runData.finalOutcome = {
      code: 'CRITICAL_TEST_FAILURE',
      message: `Test failure detected after iteration #${currentIterNum}: ${testResults.message || 'Automated test suite failed'}.`,
      recommendation: 'Revert recent code changes causing test regression and resolve unit tests before continuing visual refinement.'
    };
  } else if (deltaFromPrev !== null && deltaFromPrev > 0.1) {
    // Severe visual regression
    iterationStatus = 'REGRESSED';
    // If we have remaining iterations, we can continue to allow rollback, otherwise halt
    if (currentIterNum >= runData.maxIterations) {
      shouldTerminate = true;
      terminationReason = 'MAX_ITERATIONS_WITH_REGRESSION';
      runData.status = 'HALTED_REGRESSION';
      runData.finalOutcome = {
        code: 'REGRESSION_AND_LIMIT_REACHED',
        message: `Visual regression detected (+${deltaFromPrev}% discrepancy) and iteration limit reached.`,
        recommendation: 'Revert last modification to restore previous best state.'
      };
    }
  } else if (deltaFromPrev !== null && Math.abs(deltaFromPrev) < DEFAULT_STAGNATION_THRESHOLD && diffResult.diffPixels > 0) {
    // Stagnation: change made no measurable difference
    if (currentIterNum >= 2 && prevIter && prevIter.deltaFromPrev !== null && Math.abs(prevIter.deltaFromPrev) < DEFAULT_STAGNATION_THRESHOLD) {
      iterationStatus = 'STAGNATED';
      shouldTerminate = true;
      terminationReason = 'STAGNATION_DETECTED';
      runData.status = 'HALTED_STAGNATION';
      runData.finalOutcome = {
        code: 'STAGNATION_DETECTED',
        message: `Refinement stagnated: consecutive iterations produced less than ${DEFAULT_STAGNATION_THRESHOLD}% measurable visual improvement.`,
        recommendation: 'Examine whether remaining discrepancies stem from dynamic rendering, font antialiasing, or require manual architectural revision.'
      };
    }
  }

  // Check iteration limit
  if (!shouldTerminate && currentIterNum >= runData.maxIterations) {
    shouldTerminate = true;
    iterationStatus = 'LIMIT_REACHED';
    terminationReason = 'ITERATION_LIMIT_REACHED';
    runData.status = 'COMPLETED_LIMIT_REACHED';
    runData.finalOutcome = {
      code: 'ITERATION_LIMIT_REACHED',
      message: `Reached configured iteration limit (${runData.maxIterations}). Visual discrepancy stands at ${diffResult.diffPercentage}%.`,
      recommendation: 'Review remaining prioritized issues manually or grant additional iterations.'
    };
  }

  const iterationRecord = {
    iteration: currentIterNum,
    timestamp: new Date().toISOString(),
    status: iterationStatus,
    candidateScreenshot: savedCandidatePath,
    diffImage: diffOutputPath,
    diff: {
      passed: diffCriteriaMet,
      diffPixels: diffResult.diffPixels,
      diffPercentage: diffResult.diffPercentage,
      totalPixels: diffResult.totalPixels,
      boundingBox: diffResult.boundingBox
    },
    deltaFromPrev,
    testResults,
    issues,
    terminationReason: shouldTerminate ? terminationReason : null
  };

  runData.iterations.push(iterationRecord);

  // Write updated run.json and summary.md
  await fs.promises.writeFile(
    path.join(runDir, 'run.json'),
    JSON.stringify(runData, null, 2)
  );

  const summaryMd = generateSummaryMarkdown(runData);
  await fs.promises.writeFile(
    path.join(runDir, 'summary.md'),
    summaryMd
  );

  return {
    iteration: currentIterNum,
    status: iterationStatus,
    shouldTerminate,
    terminationReason,
    diffResult,
    deltaFromPrev,
    issues,
    finalOutcome: runData.finalOutcome,
    summaryMarkdown: summaryMd
  };
}
