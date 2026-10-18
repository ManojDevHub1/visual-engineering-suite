#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getImageDimensions } from '../../../src/dimensions.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function run() {
  const targetImage = process.argv[2];
  if (!targetImage) {
    console.error('Usage: node check-dimensions.js <imagePath>');
    process.exit(1);
  }

  try {
    const dim = await getImageDimensions(path.resolve(targetImage));
    console.log(JSON.stringify(dim, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(`Error inspecting image: ${err.message}`);
    process.exit(2);
  }
}

run();
