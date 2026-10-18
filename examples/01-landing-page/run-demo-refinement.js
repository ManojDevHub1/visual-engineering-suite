import path from 'node:path';
import fs from 'node:fs';
import { initRefinementRun, recordIteration } from '../../src/refinement.js';

async function generateDemoRefinementRun() {
  const refPath = path.resolve('examples/01-landing-page/reference-hero.png');
  const initialRenderPath = path.resolve('examples/01-landing-page/rendered-hero.png');
  const correctedRenderPath = path.resolve('examples/01-landing-page/reference-hero.png');

  const runId = 'demo-refinement-run';
  const runsBaseDir = path.resolve('.visual-engineering/runs');

  // Clean existing demo run if present
  const runDir = path.join(runsBaseDir, runId);
  if (fs.existsSync(runDir)) {
    await fs.promises.rm(runDir, { recursive: true, force: true });
  }

  // 1. Initialize run
  const context = await initRefinementRun({
    referencePath: refPath,
    runId,
    runsBaseDir,
    targetUrl: 'http://localhost:3000/landing-hero',
    maxIterations: 3,
    acceptanceCriteria: {
      maxDiffPercentage: 0.1,
      maxDiffPixels: 100
    }
  });

  console.log(`Initialized run: ${context.runId} in ${context.runDir}`);

  // 2. Iteration 1: Initial Render (discrepancy detected on CTA button)
  console.log('Recording Iteration 1 (initial candidate with CTA color discrepancy)...');
  const step1 = await recordIteration(context, {
    candidatePath: initialRenderPath,
    threshold: 0.1,
    testResults: { passed: true }
  });

  console.log(`- Iteration 1 status: ${step1.status}, Diff: ${step1.diffResult.diffPercentage}% (${step1.diffResult.diffPixels} pixels)`);
  console.log(`- Should terminate: ${step1.shouldTerminate}`);

  // 3. Iteration 2: Corrected Render (after applying targeted CSS token fix)
  console.log('Recording Iteration 2 (corrected candidate after targeted fix)...');
  const step2 = await recordIteration(context, {
    candidatePath: correctedRenderPath,
    threshold: 0.1,
    testResults: { passed: true }
  });

  console.log(`- Iteration 2 status: ${step2.status}, Diff: ${step2.diffResult.diffPercentage}% (${step2.diffResult.diffPixels} pixels)`);
  console.log(`- Delta vs prev: ${step2.deltaFromPrev}%`);
  console.log(`- Should terminate: ${step2.shouldTerminate} (${step2.terminationReason})`);
  console.log(`- Final outcome:`, step2.finalOutcome);

  console.log(`\nDemo refinement run complete. Inspect artifacts at: ${runDir}`);
}

generateDemoRefinementRun().catch(console.error);
