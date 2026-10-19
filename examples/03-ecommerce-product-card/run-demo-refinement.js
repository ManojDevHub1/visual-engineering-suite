import path from 'node:path';
import fs from 'node:fs';
import { initRefinementRun, recordIteration } from '../../src/refinement.js';

async function generateDemoRefinementRun() {
  const refPath = path.resolve('examples/03-ecommerce-product-card/reference-card.png');
  const initialRenderPath = path.resolve('examples/03-ecommerce-product-card/rendered-card.png');
  const correctedRenderPath = path.resolve('examples/03-ecommerce-product-card/reference-card.png');

  const runId = 'demo-ecommerce-refinement';
  const runsBaseDir = path.resolve('.visual-engineering/runs');

  const runDir = path.join(runsBaseDir, runId);
  if (fs.existsSync(runDir)) {
    await fs.promises.rm(runDir, { recursive: true, force: true });
  }

  // 1. Initialize run
  const context = await initRefinementRun({
    referencePath: refPath,
    runId,
    runsBaseDir,
    targetUrl: 'http://localhost:3000/product-card',
    maxIterations: 3,
    acceptanceCriteria: {
      maxDiffPercentage: 0.05,
      maxDiffPixels: 50
    }
  });

  console.log(`Initialized run: ${context.runId} in ${context.runDir}`);

  // 2. Iteration 1: Initial Render (discrepancy on active swatch selection ring)
  console.log('Recording Iteration 1 (initial candidate with missing active swatch ring)...');
  const step1 = await recordIteration(context, {
    candidatePath: initialRenderPath,
    threshold: 0.1,
    testResults: { passed: true }
  });

  console.log(`- Iteration 1 status: ${step1.status}, Diff: ${step1.diffResult.diffPercentage}% (${step1.diffResult.diffPixels} pixels)`);
  console.log(`- Discrepancy Bounding Box:`, step1.diffResult.boundingBox);
  console.log(`- Should terminate: ${step1.shouldTerminate}`);

  // 3. Iteration 2: Corrected Render (after adding active swatch ring and 44px touch targets)
  console.log('Recording Iteration 2 (corrected candidate with active swatch ring)...');
  const step2 = await recordIteration(context, {
    candidatePath: correctedRenderPath,
    threshold: 0.1,
    testResults: { passed: true }
  });

  console.log(`- Iteration 2 status: ${step2.status}, Diff: ${step2.diffResult.diffPercentage}% (${step2.diffResult.diffPixels} pixels)`);
  console.log(`- Delta vs prev: ${step2.deltaFromPrev}%`);
  console.log(`- Should terminate: ${step2.shouldTerminate} (${step2.terminationReason})`);
  console.log(`- Final outcome:`, step2.finalOutcome);

  console.log(`\nEcommerce demo refinement run complete. Inspect artifacts at: ${runDir}`);
}

generateDemoRefinementRun().catch(console.error);
