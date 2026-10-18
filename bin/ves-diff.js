#!/usr/bin/env node
import { compareImages } from '../src/diff.js';

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
  const includeAA = args.includes('--include-aa');

  const diffPath = parseArgValue(args, '--diff') || parseArgValue(args, '-d');
  const thresholdVal = parseArgValue(args, '--threshold') || parseArgValue(args, '-t');
  const maxDiffVal = parseArgValue(args, '--max-diff');
  const maxPixelsVal = parseArgValue(args, '--max-pixels');

  // Filter out flags and their trailing value
  const positional = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('-')) {
      if (['--diff', '-d', '--threshold', '-t', '--max-diff', '--max-pixels'].includes(args[i])) {
        i++; // skip next arg
      }
      continue;
    }
    positional.push(args[i]);
  }

  if (showHelp || positional.length < 2) {
    console.log(`
Usage: ves-diff <referenceImage> <candidateImage> [options]

Compares reference and candidate screenshots using pixel-level visual regression analysis.

Arguments:
  <referenceImage>        Path to reference PNG image
  <candidateImage>        Path to candidate/rendered PNG image

Options:
  --diff, -d <path>       Output path to save the visual difference PNG
  --threshold, -t <0..1>  Color difference threshold (0.0 exact to 1.0 loose, default: 0.1)
  --max-diff <percent>    Maximum allowed discrepancy percentage to pass (default: 0.0)
  --max-pixels <count>    Maximum allowed mismatched pixels to pass (default: 0)
  --include-aa            Include antialiasing differences (default: false, ignores font smoothing noise)
  --json                  Output results in machine-readable JSON
  --help, -h              Show this help message

Exit codes:
  0   Images visually match within allowed threshold
  1   Visual regression detected (exceeds threshold)
  2   Execution error (missing files, dimension mismatch, or decode failure)
`);
    process.exit(0);
  }

  const [refPath, candidatePath] = positional;

  let threshold = 0.1;
  if (thresholdVal !== null) {
    threshold = parseFloat(thresholdVal);
    if (isNaN(threshold) || threshold < 0 || threshold > 1) {
      const msg = `Invalid --threshold value "${thresholdVal}". Must be a number between 0.0 and 1.0 (e.g. 0.1).`;
      if (isJson) {
        console.log(JSON.stringify({ error: msg, code: 'INVALID_ARGUMENT' }, null, 2));
      } else {
        console.error(`\nError: ${msg}\n`);
      }
      process.exit(2);
    }
  }

  let maxDiffPercentage = 0.0;
  if (maxDiffVal !== null) {
    maxDiffPercentage = parseFloat(maxDiffVal);
    if (isNaN(maxDiffPercentage) || maxDiffPercentage < 0 || maxDiffPercentage > 100) {
      const msg = `Invalid --max-diff value "${maxDiffVal}". Must be a number between 0.0 and 100.0 (e.g. 1.5).`;
      if (isJson) {
        console.log(JSON.stringify({ error: msg, code: 'INVALID_ARGUMENT' }, null, 2));
      } else {
        console.error(`\nError: ${msg}\n`);
      }
      process.exit(2);
    }
  }

  let maxDiffPixels = 0;
  if (maxPixelsVal !== null) {
    maxDiffPixels = parseInt(maxPixelsVal, 10);
    if (isNaN(maxDiffPixels) || maxDiffPixels < 0) {
      const msg = `Invalid --max-pixels value "${maxPixelsVal}". Must be an integer >= 0.`;
      if (isJson) {
        console.log(JSON.stringify({ error: msg, code: 'INVALID_ARGUMENT' }, null, 2));
      } else {
        console.error(`\nError: ${msg}\n`);
      }
      process.exit(2);
    }
  }

  try {
    const result = await compareImages(refPath, candidatePath, {
      threshold,
      diffPath,
      includeAA,
      maxDiffPercentage,
      maxDiffPixels
    });

    if (isJson) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log('\n=== Visual Regression Analysis ===\n');
      console.log(`Reference:       ${refPath}`);
      console.log(`Candidate:       ${candidatePath}`);
      console.log(`Dimensions:      ${result.dimensions.width}x${result.dimensions.height}px (${result.totalPixels.toLocaleString()} total pixels)`);
      console.log(`Diff Pixels:     ${result.diffPixels.toLocaleString()} (${result.diffPercentage}% mismatched)`);
      console.log(`Threshold:       ${result.threshold}`);
      console.log(`Status:          ${result.passed ? 'PASSED ✓' : 'FAILED ✗'}`);

      if (result.boundingBox) {
        const bb = result.boundingBox;
        console.log(`Discrepancy Box: [x: ${bb.minX}..${bb.maxX}, y: ${bb.minY}..${bb.maxY}] (size: ${bb.width}x${bb.height}px)`);
      }

      if (result.diffImagePath) {
        console.log(`Difference Map:  ${result.diffImagePath}`);
      }
      console.log('');
    }

    process.exit(result.passed ? 0 : 1);
  } catch (err) {
    if (isJson) {
      console.log(JSON.stringify({
        error: err.message,
        code: err.code || 'DIFF_ERROR',
        refDimensions: err.refDimensions,
        candidateDimensions: err.candidateDimensions
      }, null, 2));
    } else {
      console.error(`\nError: ${err.message}`);
      if (err.code === 'DIMENSION_MISMATCH') {
        console.error('Tip: Visual diffing requires matching viewport dimensions. Resize viewport or crop before diffing.');
      }
    }
    process.exit(2);
  }
}

main();
