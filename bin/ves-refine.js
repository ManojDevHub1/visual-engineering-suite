#!/usr/bin/env node
import path from 'node:path';
import fs from 'node:fs';
import { initRefinementRun, recordIteration, generateSummaryMarkdown } from '../src/refinement.js';

function parseArgValue(args, flag) {
  const idx = args.indexOf(flag);
  if (idx !== -1 && idx + 1 < args.length) {
    return args[idx + 1];
  }
  return null;
}

async function main() {
  const args = process.argv.slice(2);
  const isJson = args.includes('--json');
  const showHelp = args.includes('--help') || args.includes('-h');

  if (showHelp || args.length === 0) {
    console.log(`
Usage: ves-refine <command> [options]

Commands:
  run     Executes a refinement evaluation against acceptance criteria
  init    Initializes a new refinement run in .visual-engineering/runs/<runId>/
  step    Records an iteration step within an existing run
  status  Displays current status and history of a run

Options:
  --reference, -r <path>      Path to reference mockup image
  --rendered, -c <path>       Path to candidate/rendered screenshot
  --run, --run-id <id>        Existing run ID (for 'step' and 'status')
  --max-iterations <N>        Maximum refinement iterations (default: 3)
  --max-diff <percent>        Maximum allowed discrepancy percentage (default: 0.0)
  --threshold, -t <0..1>      Diff threshold (default: 0.1)
  --test-passed <true|false>  Status of unit/integration test suite
  --json                      Output results in machine-readable JSON format
  --help, -h                  Show this help message

Exit codes:
  0   Acceptance criteria satisfied (Success)
  1   Visual discrepancies remain or iteration limit reached
  2   Execution error (missing reference, stagnation, or critical test failure)
`);
    process.exit(0);
  }

  const command = args[0].startsWith('-') ? 'run' : args[0];

  const refPath = parseArgValue(args, '--reference') || parseArgValue(args, '-r');
  const candidatePath = parseArgValue(args, '--rendered') || parseArgValue(args, '-c');
  const runIdArg = parseArgValue(args, '--run') || parseArgValue(args, '--run-id');
  const maxIterVal = parseArgValue(args, '--max-iterations');
  const maxDiffVal = parseArgValue(args, '--max-diff');
  const thresholdVal = parseArgValue(args, '--threshold') || parseArgValue(args, '-t');
  const testPassedVal = parseArgValue(args, '--test-passed');

  const maxIterations = maxIterVal ? parseInt(maxIterVal, 10) : 3;
  const maxDiffPercentage = maxDiffVal ? parseFloat(maxDiffVal) : 0.0;
  const threshold = thresholdVal ? parseFloat(thresholdVal) : 0.1;

  try {
    if (command === 'init') {
      if (!refPath) {
        throw new Error('--reference <path> is required to initialize a refinement run.');
      }
      const context = await initRefinementRun({
        referencePath: refPath,
        runId: runIdArg || undefined,
        maxIterations,
        acceptanceCriteria: { maxDiffPercentage }
      });

      if (isJson) {
        console.log(JSON.stringify(context.runData, null, 2));
      } else {
        console.log(`\n=== Visual Refinement Run Initialized ===\n`);
        console.log(`Run ID:         ${context.runId}`);
        console.log(`Run Directory:  ${context.runDir}`);
        console.log(`Reference:      ${context.runData.reference.originalPath} (${context.runData.reference.dimensions.width}x${context.runData.reference.dimensions.height}px)`);
        console.log(`Max Iterations: ${context.runData.maxIterations}`);
        console.log(`Criteria:       Max Diff: ${context.runData.acceptanceCriteria.maxDiffPercentage}%\n`);
      }
      process.exit(0);
    }

    if (command === 'step') {
      if (!runIdArg) {
        throw new Error('--run <id> is required for "step" command.');
      }
      if (!candidatePath) {
        throw new Error('--rendered <path> is required for "step" command.');
      }

      const runsBaseDir = path.resolve('.visual-engineering/runs');
      const runDir = path.join(runsBaseDir, runIdArg);
      const runJsonPath = path.join(runDir, 'run.json');

      if (!fs.existsSync(runJsonPath)) {
        throw new Error(`Run not found: ${runJsonPath}`);
      }

      const runData = JSON.parse(await fs.promises.readFile(runJsonPath, 'utf8'));
      const runContext = { runId: runIdArg, runDir, runData };

      const testResults = testPassedVal !== null
        ? { passed: testPassedVal === 'true' || testPassedVal === '1' }
        : null;

      const stepResult = await recordIteration(runContext, {
        candidatePath,
        threshold,
        testResults
      });

      if (isJson) {
        console.log(JSON.stringify(stepResult, null, 2));
      } else {
        console.log(`\n=== Iteration #${stepResult.iteration} Recorded ===\n`);
        console.log(`Status:         ${stepResult.status}`);
        console.log(`Diff Pixels:    ${stepResult.diffResult.diffPixels.toLocaleString()} (${stepResult.diffResult.diffPercentage}%)`);
        if (stepResult.deltaFromPrev !== null) {
          console.log(`Delta:          ${stepResult.deltaFromPrev <= 0 ? stepResult.deltaFromPrev + '% (Improved)' : '+' + stepResult.deltaFromPrev + '% (Regressed)'}`);
        }
        console.log(`Terminated:     ${stepResult.shouldTerminate ? 'YES (' + stepResult.terminationReason + ')' : 'NO (Continue loop)'}`);
        if (stepResult.finalOutcome) {
          console.log(`Outcome:        ${stepResult.finalOutcome.message}`);
        }
        console.log('');
      }

      if (stepResult.status === 'PASSED') process.exit(0);
      if (['CRITICAL_TEST_FAILURE', 'STAGNATION_DETECTED'].includes(stepResult.terminationReason)) process.exit(2);
      process.exit(stepResult.shouldTerminate ? 1 : 0);
    }

    if (command === 'status') {
      if (!runIdArg) {
        throw new Error('--run <id> is required for "status" command.');
      }
      const runsBaseDir = path.resolve('.visual-engineering/runs');
      const runDir = path.join(runsBaseDir, runIdArg);
      const runJsonPath = path.join(runDir, 'run.json');

      if (!fs.existsSync(runJsonPath)) {
        throw new Error(`Run not found: ${runJsonPath}`);
      }

      const runData = JSON.parse(await fs.promises.readFile(runJsonPath, 'utf8'));
      if (isJson) {
        console.log(JSON.stringify(runData, null, 2));
      } else {
        console.log(generateSummaryMarkdown(runData));
      }
      process.exit(0);
    }

    // Default: 'run' (combined init + single evaluation step)
    if (!refPath || !candidatePath) {
      throw new Error('Both --reference <path> and --rendered <path> are required for "run" command.');
    }

    const context = await initRefinementRun({
      referencePath: refPath,
      runId: runIdArg || undefined,
      maxIterations,
      acceptanceCriteria: { maxDiffPercentage }
    });

    const testResults = testPassedVal !== null
      ? { passed: testPassedVal === 'true' || testPassedVal === '1' }
      : null;

    const stepResult = await recordIteration(context, {
      candidatePath,
      threshold,
      testResults
    });

    if (isJson) {
      console.log(JSON.stringify({ runId: context.runId, ...stepResult }, null, 2));
    } else {
      console.log(`\n=== Visual Refinement Evaluation ===\n`);
      console.log(`Run ID:         ${context.runId}`);
      console.log(`Reference:      ${context.runData.reference.originalPath}`);
      console.log(`Candidate:      ${candidatePath}`);
      console.log(`Iteration:      #${stepResult.iteration} of ${maxIterations}`);
      console.log(`Diff Pixels:    ${stepResult.diffResult.diffPixels.toLocaleString()} (${stepResult.diffResult.diffPercentage}%)`);
      console.log(`Status:         ${stepResult.status}`);
      if (stepResult.finalOutcome) {
        console.log(`Outcome:        ${stepResult.finalOutcome.message}`);
      }
      console.log(`Summary Report: ${path.join(context.runDir, 'summary.md')}\n`);
    }

    if (stepResult.status === 'PASSED') process.exit(0);
    process.exit(1);
  } catch (err) {
    if (isJson) {
      console.log(JSON.stringify({ error: err.message, code: err.code || 'REFINEMENT_ERROR' }, null, 2));
    } else {
      console.error(`\nError: ${err.message}\n`);
    }
    process.exit(2);
  }
}

main();
