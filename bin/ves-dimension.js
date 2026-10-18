#!/usr/bin/env node
import { getImageDimensions, compareDimensions } from '../src/dimensions.js';

async function main() {
  const args = process.argv.slice(2);
  const isJson = args.includes('--json');
  const showHelp = args.includes('--help') || args.includes('-h');
  const positional = args.filter(a => !a.startsWith('-'));

  if (showHelp || positional.length === 0) {
    console.log(`
Usage: ves-dimension <imagePath> [candidateImagePath] [options]

Inspects image dimensions or compares dimensions between reference and candidate images.

Arguments:
  <imagePath>             Path to reference image
  [candidateImagePath]    Optional path to candidate image to compare dimensions against

Options:
  --json                  Output results in JSON format
  --help, -h              Show this help message

Exit codes:
  0   Dimensions match or single image dimensions retrieved
  1   Dimension mismatch between reference and candidate image
  2   File not found, unreadable, or invalid format
`);
    process.exit(0);
  }

  const [refPath, candidatePath] = positional;

  try {
    if (!candidatePath) {
      // Single image inspection
      const dim = await getImageDimensions(refPath);
      if (isJson) {
        console.log(JSON.stringify({ path: refPath, ...dim }, null, 2));
      } else {
        console.log(`Image: ${refPath}`);
        console.log(`Dimensions: ${dim.width}x${dim.height}px (${dim.format.toUpperCase()}, ${dim.sizeBytes} bytes)`);
      }
      process.exit(0);
    } else {
      // Two images dimension comparison
      const result = await compareDimensions(refPath, candidatePath);
      if (isJson) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(`Reference: ${refPath} (${result.ref.width}x${result.ref.height}px)`);
        console.log(`Candidate: ${candidatePath} (${result.test.width}x${result.test.height}px)`);
        if (result.match) {
          console.log('✓ Dimensions match perfectly.');
        } else {
          console.error(`✗ ${result.difference}`);
        }
      }
      process.exit(result.match ? 0 : 1);
    }
  } catch (err) {
    if (isJson) {
      console.log(JSON.stringify({ error: err.message, code: err.code || 'ERROR' }, null, 2));
    } else {
      console.error(`Error: ${err.message}`);
    }
    process.exit(2);
  }
}

main();
